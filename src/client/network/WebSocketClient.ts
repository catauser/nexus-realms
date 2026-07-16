// ============================================================
// Nexus Realms — WebSocket Client
// Connection manager with auto-reconnect, message queue,
// event emitter pattern, and ping/pong keepalive
// ============================================================

import { createMessage } from '../../shared/protocol';

// ─── Types ───────────────────────────────────────────────────
export type MessageHandler = (data: Record<string, unknown>) => void;

export interface WSConfig {
  url: string;
  reconnectBaseDelay?: number;   // ms, default 1000
  reconnectMaxDelay?: number;    // ms, default 30000
  reconnectMaxRetries?: number;  // default 10
  pingInterval?: number;         // ms, default 30000
  pingTimeout?: number;          // ms, default 10000
}

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
}

// ─── WebSocket Client ────────────────────────────────────────
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: Required<WSConfig>;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private sequence: number = 0;

  // Event handlers
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private globalHandlers: Set<(type: string, data: Record<string, unknown>) => void> = new Set();

  // Reconnect
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  // Ping/pong
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private pongTimeout: ReturnType<typeof setTimeout> | null = null;
  private latency: number = 0;
  private lastPingTime: number = 0;

  // Offline message queue
  private messageQueue: { type: string; data: Record<string, unknown> }[] = [];
  private maxQueueSize: number = 200;

  // Connection callbacks
  private onStateChange?: (state: ConnectionState) => void;

  constructor(config: WSConfig) {
    this.config = {
      url: config.url,
      reconnectBaseDelay: config.reconnectBaseDelay ?? 1000,
      reconnectMaxDelay: config.reconnectMaxDelay ?? 30000,
      reconnectMaxRetries: config.reconnectMaxRetries ?? 10,
      pingInterval: config.pingInterval ?? 30000,
      pingTimeout: config.pingTimeout ?? 10000,
    };
  }

  // ─── Public API ──────────────────────────────────────────────

  /** Connect to the WebSocket server */
  connect(): void {
    if (this.state === ConnectionState.CONNECTED || this.state === ConnectionState.CONNECTING) {
      return;
    }

    this.setState(ConnectionState.CONNECTING);

    try {
      this.ws = new WebSocket(this.config.url);
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (err) {
      console.error('[WS] Connection error:', err);
      this.scheduleReconnect();
    }
  }

  /** Gracefully disconnect */
  disconnect(): void {
    this.clearTimers();
    this.reconnectAttempts = this.config.reconnectMaxRetries; // prevent reconnect
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.setState(ConnectionState.DISCONNECTED);
  }

  /** Send a typed message. Queues if not connected. */
  send(type: string, data: Record<string, unknown> = {}): void {
    if (this.state !== ConnectionState.CONNECTED || !this.ws) {
      if (this.messageQueue.length < this.maxQueueSize) {
        this.messageQueue.push({ type, data });
      }
      return;
    }

    const msg = createMessage(type, { ...data, _seq: ++this.sequence });
    this.ws.send(msg);
  }

  /** Register a handler for a specific message type */
  on(type: string, callback: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(callback);
  }

  /** Remove a handler */
  off(type: string, callback: MessageHandler): void {
    this.handlers.get(type)?.delete(callback);
  }

  /** Register a global handler that receives ALL messages */
  onAny(callback: (type: string, data: Record<string, unknown>) => void): void {
    this.globalHandlers.add(callback);
  }

  /** Remove a global handler */
  offAny(callback: (type: string, data: Record<string, unknown>) => void): void {
    this.globalHandlers.delete(callback);
  }

  /** Set a callback for connection state changes */
  setOnStateChange(cb: (state: ConnectionState) => void): void {
    this.onStateChange = cb;
  }

  /** Get current connection state */
  getState(): ConnectionState {
    return this.state;
  }

  /** Get current latency in ms */
  getLatency(): number {
    return this.latency;
  }

  /** Check if connected */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  // ─── Internal ──────────────────────────────────────────────

  private setState(newState: ConnectionState): void {
    if (this.state === newState) return;
    this.state = newState;
    this.onStateChange?.(newState);
  }

  private handleOpen(): void {
    console.log('[WS] Connected');
    this.setState(ConnectionState.CONNECTED);
    this.reconnectAttempts = 0;
    this.startPing();
    this.flushQueue();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const envelope = JSON.parse(event.data as string) as {
        type: string;
        data: Record<string, unknown>;
        timestamp: number;
        sequence?: number;
      };

      // Handle pong specially
      if (envelope.type === 'pong') {
        this.handlePong();
        return;
      }

      // Dispatch to type-specific handlers
      const typeHandlers = this.handlers.get(envelope.type);
      if (typeHandlers) {
        for (const handler of typeHandlers) {
          try {
            handler(envelope.data);
          } catch (err) {
            console.error(`[WS] Handler error for ${envelope.type}:`, err);
          }
        }
      }

      // Dispatch to global handlers
      for (const handler of this.globalHandlers) {
        try {
          handler(envelope.type, envelope.data);
        } catch (err) {
          console.error('[WS] Global handler error:', err);
        }
      }
    } catch (err) {
      console.error('[WS] Failed to parse message:', err);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log(`[WS] Disconnected: code=${event.code} reason=${event.reason}`);
    this.ws = null;
    this.stopPing();

    if (this.state === ConnectionState.CONNECTED) {
      this.scheduleReconnect();
    } else {
      this.setState(ConnectionState.DISCONNECTED);
    }
  }

  private handleError(event: Event): void {
    console.error('[WS] Error:', event);
  }

  // ─── Reconnect ────────────────────────────────────────────

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectMaxRetries) {
      console.log('[WS] Max reconnect attempts reached');
      this.setState(ConnectionState.DISCONNECTED);
      return;
    }

    this.setState(ConnectionState.RECONNECTING);

    // Exponential backoff with jitter
    const base = this.config.reconnectBaseDelay * Math.pow(2, this.reconnectAttempts);
    const delay = Math.min(base, this.config.reconnectMaxDelay);
    const jitter = delay * 0.3 * Math.random();
    const finalDelay = delay + jitter;

    this.reconnectAttempts++;

    console.log(`[WS] Reconnecting in ${Math.round(finalDelay)}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, finalDelay);
  }

  // ─── Ping/Pong ────────────────────────────────────────────

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      this.sendPing();
    }, this.config.pingInterval);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private sendPing(): void {
    this.lastPingTime = Date.now();
    this.send('ping', {});

    // If no pong received within timeout, force reconnect
    this.pongTimeout = setTimeout(() => {
      console.warn('[WS] Ping timeout — forcing reconnect');
      this.ws?.close(4000, 'Ping timeout');
    }, this.config.pingTimeout);
  }

  private handlePong(): void {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
    this.latency = Date.now() - this.lastPingTime;
  }

  // ─── Message Queue ────────────────────────────────────────

  private flushQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      this.send(msg.type, msg.data);
    }
  }

  // ─── Cleanup ──────────────────────────────────────────────

  private clearTimers(): void {
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
