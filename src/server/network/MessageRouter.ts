// ============================================================
// Nexus Realms — Message Router
// Register message handlers for each client message type,
// middleware pattern (auth, rate limiting, validation),
// error handling per message.
// ============================================================

import { validateMessage } from '../../shared/protocol';
import { Logger } from '../utils/Logger';
import type { PlayerSession } from './WebSocketServer';

const logger = new Logger({ context: 'MsgRouter' });

/** Message context passed to handlers */
export interface MessageContext {
  /** The player session that sent the message */
  session: PlayerSession;
  /** Validated message data */
  data: Record<string, unknown>;
  /** Original message type */
  type: string;
  /** Client sequence number */
  sequence?: number;
  /** Message timestamp */
  timestamp: number;
}

/** Message handler function */
export type MessageHandler = (ctx: MessageContext) => Promise<void> | void;

/** Middleware function */
export type MessageMiddleware = (
  ctx: MessageContext,
  next: () => Promise<void>
) => Promise<void>;

/** Registered handler with metadata */
interface HandlerEntry {
  handler: MessageHandler;
  requiresAuth: boolean;
  rateLimit?: { max: number; windowMs: number };
}

/**
 * Message Router — routes incoming client messages to handlers
 * with middleware support for auth, validation, and rate limiting.
 */
export class MessageRouter {
  /** Registered message handlers */
  private handlers: Map<string, HandlerEntry> = new Map();

  /** Global middleware applied to all messages */
  private globalMiddleware: MessageMiddleware[] = [];

  /** Per-message middleware */
  private messageMiddleware: Map<string, MessageMiddleware[]> = new Map();

  /** Rate limit state (session_id:type → { count, resetTime }) */
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  // ─── Handler Registration ─────────────────────────────────

  /**
   * Register a handler for a client message type.
   *
   * @param messageType - Message type (e.g. 'player.move')
   * @param handler - Handler function
   * @param options - Options like auth requirement and rate limiting
   */
  public register(
    messageType: string,
    handler: MessageHandler,
    options: { requiresAuth?: boolean; rateLimit?: { max: number; windowMs: number } } = {}
  ): void {
    this.handlers.set(messageType, {
      handler,
      requiresAuth: options.requiresAuth ?? true,
      rateLimit: options.rateLimit,
    });
    logger.debug(`Registered handler for: ${messageType}`);
  }

  /**
   * Register multiple handlers at once.
   */
  public registerAll(handlers: Record<string, { handler: MessageHandler; options?: { requiresAuth?: boolean; rateLimit?: { max: number; windowMs: number } } }>): void {
    for (const [type, { handler, options }] of Object.entries(handlers)) {
      this.register(type, handler, options);
    }
  }

  /**
   * Add a global middleware (applied to all messages).
   */
  public use(middleware: MessageMiddleware): void {
    this.globalMiddleware.push(middleware);
  }

  /**
   * Add middleware for a specific message type.
   */
  public useFor(messageType: string, middleware: MessageMiddleware): void {
    const existing = this.messageMiddleware.get(messageType) ?? [];
    existing.push(middleware);
    this.messageMiddleware.set(messageType, existing);
  }

  // ─── Message Routing ──────────────────────────────────────

  /**
   * Route an incoming message to its handler.
   * Validates the message, runs middleware, and invokes the handler.
   *
   * @param session - The player session
   * @param type - Message type string
   * @param data - Raw message data
   * @param sequence - Client sequence number
   * @param timestamp - Message timestamp
   */
  public async route(
    session: PlayerSession,
    type: string,
    data: unknown,
    sequence?: number,
    timestamp?: number
  ): Promise<void> {
    // Find handler
    const entry = this.handlers.get(type);
    if (!entry) {
      logger.warn(`No handler for message type: ${type}`, { sessionId: session.id });
      return;
    }

    // Validate message data with Zod schema
    const validation = validateMessage(type, data);
    if (!validation.success) {
      this.sendError(session, 9004, `Invalid message data: ${validation.error}`, sequence);
      return;
    }

    // Build context
    const ctx: MessageContext = {
      session,
      data: validation.data as Record<string, unknown>,
      type,
      sequence,
      timestamp: timestamp ?? Date.now(),
    };

    // Check auth requirement
    if (entry.requiresAuth && !session.authenticated) {
      this.sendError(session, 1004, 'Authentication required', sequence);
      return;
    }

    // Check rate limit
    if (entry.rateLimit) {
      const rateLimitKey = `${session.id}:${type}`;
      if (!this.checkRateLimit(rateLimitKey, entry.rateLimit.max, entry.rateLimit.windowMs)) {
        this.sendError(session, 9002, 'Rate limited', sequence);
        return;
      }
    }

    // Build middleware chain
    const middlewares = [
      ...this.globalMiddleware,
      ...(this.messageMiddleware.get(type) ?? []),
    ];

    // Execute middleware chain + handler
    try {
      let idx = 0;
      const next = async (): Promise<void> => {
        if (idx < middlewares.length) {
          const mw = middlewares[idx++];
          await mw(ctx, next);
        } else {
          await entry.handler(ctx);
        }
      };
      await next();
    } catch (err) {
      logger.error(`Handler error for ${type}`, err, { sessionId: session.id });
      this.sendError(session, 9001, 'Internal server error', sequence);
    }
  }

  // ─── Rate Limiting ────────────────────────────────────────

  /**
   * Check and update rate limit for a key.
   * @returns true if the request is allowed
   */
  private checkRateLimit(key: string, max: number, windowMs: number): boolean {
    const now = Date.now();
    const state = this.rateLimits.get(key);

    if (!state || now > state.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (state.count >= max) {
      return false;
    }

    state.count++;
    return true;
  }

  /**
   * Clean up expired rate limit entries.
   */
  public cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, state] of this.rateLimits) {
      if (now > state.resetTime) {
        this.rateLimits.delete(key);
      }
    }
  }

  // ─── Error Sending ────────────────────────────────────────

  /**
   * Send an error message to a session.
   */
  private sendError(session: PlayerSession, code: number, message: string, refSequence?: number): void {
    session.send('error', {
      code,
      message,
      ref_s: refSequence,
    });
  }

  // ─── Info ─────────────────────────────────────────────────

  /**
   * Get all registered message types.
   */
  public getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Check if a handler is registered for a message type.
   */
  public hasHandler(type: string): boolean {
    return this.handlers.has(type);
  }
}
