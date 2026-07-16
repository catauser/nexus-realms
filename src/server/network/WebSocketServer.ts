// ============================================================
// Nexus Realms — WebSocket Server
// Handles all WebSocket connections, message routing, broadcasting
// ============================================================
import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { validateMessage, createMessage } from '@shared/protocol';
import { MessageRouter } from './MessageRouter';
import { Logger } from '../utils/Logger';
import { Config } from '../utils/Config';

export interface ConnectedClient {
  id: string;
  ws: WebSocket;
  playerId: string | null;
  authenticated: boolean;
  lastPing: number;
  ip: string;
  messageCount: number;
  messageResetTime: number;
}

export class WebSocketServer {
  private wss: WSServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private messageRouter: MessageRouter;
  private pingInterval: NodeJS.Timeout | null = null;
  private logger: Logger;

  constructor(messageRouter: MessageRouter) {
    this.messageRouter = messageRouter;
    this.logger = new Logger('WebSocketServer');
  }

  /**
   * Start the WebSocket server
   */
  start(port: number): void {
    this.wss = new WSServer({
      port,
      maxPayload: 64 * 1024, // 64KB max message size
      perMessageDeflate: false,
    });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error: Error) => {
      this.logger.error('WebSocket server error', { error: error.message });
    });

    // Ping all clients every 30 seconds
    this.pingInterval = setInterval(() => {
      this.pingAllClients();
    }, 30000);

    this.logger.info(`WebSocket server started on port ${port}`);
  }

  /**
   * Stop the WebSocket server
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }

      // Close all client connections
      for (const client of this.clients.values()) {
        client.ws.close(1001, 'Server shutting down');
      }
      this.clients.clear();

      if (this.wss) {
        this.wss.close(() => {
          this.logger.info('WebSocket server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const clientId = uuidv4();
    const ip = req.socket.remoteAddress || 'unknown';

    const client: ConnectedClient = {
      id: clientId,
      ws,
      playerId: null,
      authenticated: false,
      lastPing: Date.now(),
      ip,
      messageCount: 0,
      messageResetTime: Date.now() + 60000,
    };

    this.clients.set(clientId, client);
    this.logger.info(`Client connected: ${clientId} from ${ip}`);

    // Set up event handlers
    ws.on('message', (data: Buffer) => {
      this.handleMessage(client, data);
    });

    ws.on('close', (code: number, reason: Buffer) => {
      this.handleDisconnect(client, code, reason.toString());
    });

    ws.on('error', (error: Error) => {
      this.logger.error(`Client ${clientId} error`, { error: error.message });
    });

    ws.on('pong', () => {
      client.lastPing = Date.now();
    });

    // Send welcome message
    this.sendToClient(client, 'server.welcome', {
      clientId,
      serverTime: Date.now(),
      version: '0.1.0',
    });
  }

  /**
   * Handle incoming message from a client
   */
  private handleMessage(client: ConnectedClient, data: Buffer): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      this.sendToClient(client, 'error', { code: 'INVALID_JSON', message: 'Invalid JSON' });
      return;
    }

    const msg = parsed as { type?: string; data?: unknown };
    if (!msg.type || typeof msg.type !== 'string') {
      this.sendToClient(client, 'error', { code: 'MISSING_TYPE', message: 'Missing message type' });
      return;
    }

    // Rate limiting
    const now = Date.now();
    if (now > client.messageResetTime) {
      client.messageCount = 0;
      client.messageResetTime = now + 60000;
    }
    client.messageCount++;

    if (client.messageCount > Config.RATE_LIMIT_MESSAGES_PER_MINUTE) {
      this.sendToClient(client, 'error', { code: 'RATE_LIMITED', message: 'Too many messages' });
      return;
    }

    // Validate message schema
    const validation = validateMessage(msg.type, msg.data || {});
    if (!validation.success) {
      this.sendToClient(client, 'error', {
        code: 'VALIDATION_ERROR',
        message: (validation as { success: false; error: string }).error,
      });
      return;
    }

    // Route to handler
    this.messageRouter.route(client, msg.type, validation.data as Record<string, unknown>);
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(client: ConnectedClient, code: number, reason: string): void {
    this.logger.info(`Client disconnected: ${client.id} (${code}: ${reason})`);
    this.clients.delete(client.id);

    // Notify game systems
    if (client.playerId) {
      this.messageRouter.handleDisconnect(client);
    }
  }

  /**
   * Ping all clients to detect dead connections
   */
  private pingAllClients(): void {
    const now = Date.now();
    const timeout = Config.WEBSOCKET_TIMEOUT_MS;

    for (const [id, client] of this.clients.entries()) {
      if (now - client.lastPing > timeout) {
        this.logger.warn(`Client ${id} timed out`);
        client.ws.terminate();
        this.clients.delete(id);
        continue;
      }

      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.ping();
      }
    }
  }

  /**
   * Send a message to a specific client
   */
  sendToClient(client: ConnectedClient, type: string, data: Record<string, unknown>): void {
    if (client.ws.readyState !== WebSocket.OPEN) return;
    try {
      client.ws.send(createMessage(type, data));
    } catch (error) {
      this.logger.error(`Failed to send to ${client.id}`, { error: String(error) });
    }
  }

  /**
   * Send a message to a player by player ID
   */
  sendToPlayer(playerId: string, type: string, data: Record<string, unknown>): void {
    for (const client of this.clients.values()) {
      if (client.playerId === playerId) {
        this.sendToClient(client, type, data);
        return;
      }
    }
  }

  /**
   * Broadcast a message to all connected clients
   */
  broadcast(type: string, data: Record<string, unknown>): void {
    for (const client of this.clients.values()) {
      this.sendToClient(client, type, data);
    }
  }

  /**
   * Broadcast to all authenticated clients in a specific zone
   */
  broadcastToZone(zoneId: string, type: string, data: Record<string, unknown>, excludePlayerId?: string): void {
    for (const client of this.clients.values()) {
      if (!client.authenticated || !client.playerId) continue;
      if (client.playerId === excludePlayerId) continue;
      // Zone check would be done through the game world
      this.sendToClient(client, type, data);
    }
  }

  /**
   * Broadcast to nearby players (within a certain distance)
   */
  broadcastToNearby(
    zoneId: string,
    x: number,
    y: number,
    range: number,
    type: string,
    data: Record<string, unknown>,
    excludePlayerId?: string,
  ): void {
    // This would integrate with the zone manager to find nearby players
    // For now, broadcast to all in zone
    this.broadcastToZone(zoneId, type, data, excludePlayerId);
  }

  /**
   * Get all clients in a specific zone
   */
  getClientsInZone(zoneId: string): ConnectedClient[] {
    // Would need integration with player data to check zone
    return Array.from(this.clients.values()).filter((c) => c.authenticated);
  }

  /**
   * Get connected client count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get authenticated player count
   */
  getAuthenticatedCount(): number {
    let count = 0;
    for (const client of this.clients.values()) {
      if (client.authenticated) count++;
    }
    return count;
  }

  /**
   * Get a client by ID
   */
  getClient(clientId: string): ConnectedClient | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Get a client by player ID
   */
  getClientByPlayerId(playerId: string): ConnectedClient | undefined {
    for (const client of this.clients.values()) {
      if (client.playerId === playerId) return client;
    }
    return undefined;
  }
}
