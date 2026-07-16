// ============================================================
// Nexus Realms — Trade Handler
// Handles player-to-player trading
// ============================================================
import { ConnectedClient } from '../network/WebSocketServer';
import { WebSocketServer } from '../network/WebSocketServer';
import { World } from '../ecs/World';
import { Logger } from '../utils/Logger';
import { GAME_CONFIG } from '@shared/types';

interface TradeSession {
  player1: string;
  player2: string;
  player1Items: { slot: number; quantity: number }[];
  player2Items: { slot: number; quantity: number }[];
  player1Gold: number;
  player2Gold: number;
  player1Confirmed: boolean;
  player2Confirmed: boolean;
  createdAt: number;
}

export class TradeHandler {
  private world: World;
  private wsServer: WebSocketServer;
  private logger: Logger;
  private activeTrades: Map<string, TradeSession> = new Map(); // sessionId → session
  private playerTrades: Map<string, string> = new Map(); // playerId → sessionId

  constructor(world: World, wsServer: WebSocketServer) {
    this.world = world;
    this.wsServer = wsServer;
    this.logger = new Logger('TradeHandler');
  }

  /**
   * Handle trade request
   */
  handleRequest(client: ConnectedClient, data: { target_id: string }): void {
    if (!client.playerId) return;

    // Check if already trading
    if (this.playerTrades.has(client.playerId)) {
      this.wsServer.sendToClient(client, 'error', { code: 'ALREADY_TRADING', message: 'Already in a trade' });
      return;
    }

    // Check if target is already trading
    if (this.playerTrades.has(data.target_id)) {
      this.wsServer.sendToClient(client, 'error', { code: 'TARGET_TRADING', message: 'Target is already trading' });
      return;
    }

    // Check proximity
    const pos1 = this.world.getComponent<{ x: number; y: number; zone_id: string }>(client.playerId, 'position');
    const pos2 = this.world.getComponent<{ x: number; y: number }>(data.target_id, 'position');
    if (!pos1 || !pos2) return;

    const dist = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    if (dist > 200) {
      this.wsServer.sendToClient(client, 'error', { code: 'TOO_FAR', message: 'Too far to trade' });
      return;
    }

    // Create trade session
    const sessionId = `trade_${Date.now()}_${client.playerId.substring(0, 8)}`;
    const session: TradeSession = {
      player1: client.playerId,
      player2: data.target_id,
      player1Items: [],
      player2Items: [],
      player1Gold: 0,
      player2Gold: 0,
      player1Confirmed: false,
      player2Confirmed: false,
      createdAt: Date.now(),
    };

    this.activeTrades.set(sessionId, session);
    this.playerTrades.set(client.playerId, sessionId);
    this.playerTrades.set(data.target_id, sessionId);

    // Notify target
    const targetClient = this.wsServer.getClientByPlayerId(data.target_id);
    if (targetClient) {
      this.wsServer.sendToClient(targetClient, 'trade.request', {
        from_id: client.playerId,
        from_name: `Player_${client.playerId.substring(0, 6)}`,
      });
    }

    this.logger.info(`Trade initiated: ${client.playerId} → ${data.target_id}`);
  }

  /**
   * Handle trade offer (items and gold)
   */
  handleOffer(client: ConnectedClient, data: { items: { slot: number; quantity: number }[]; gold: number }): void {
    if (!client.playerId) return;

    const sessionId = this.playerTrades.get(client.playerId);
    if (!sessionId) return;

    const session = this.activeTrades.get(sessionId);
    if (!session) return;

    // Reset confirmations when offer changes
    session.player1Confirmed = false;
    session.player2Confirmed = false;

    // Validate items
    if (data.items.length > GAME_CONFIG.TRADE_MAX_ITEMS) {
      this.wsServer.sendToClient(client, 'error', { code: 'TOO_MANY_ITEMS', message: 'Too many items' });
      return;
    }

    // Update session
    if (client.playerId === session.player1) {
      session.player1Items = data.items;
      session.player1Gold = data.gold;
    } else {
      session.player2Items = data.items;
      session.player2Gold = data.gold;
    }

    // Notify both players
    this.notifyTradeUpdate(sessionId);
  }

  /**
   * Handle trade confirm
   */
  handleConfirm(client: ConnectedClient): void {
    if (!client.playerId) return;

    const sessionId = this.playerTrades.get(client.playerId);
    if (!sessionId) return;

    const session = this.activeTrades.get(sessionId);
    if (!session) return;

    if (client.playerId === session.player1) {
      session.player1Confirmed = true;
    } else {
      session.player2Confirmed = true;
    }

    // Check if both confirmed
    if (session.player1Confirmed && session.player2Confirmed) {
      this.executeTrade(sessionId);
    } else {
      // Notify other player that this one confirmed
      const otherClient = client.playerId === session.player1
        ? this.wsServer.getClientByPlayerId(session.player2)
        : this.wsServer.getClientByPlayerId(session.player1);

      if (otherClient) {
        this.wsServer.sendToClient(otherClient, 'trade.confirmed', { partner_confirmed: true });
      }
    }
  }

  /**
   * Handle trade cancel
   */
  handleCancel(client: ConnectedClient): void {
    if (!client.playerId) return;

    const sessionId = this.playerTrades.get(client.playerId);
    if (!sessionId) return;

    this.cancelTrade(sessionId, 'Trade cancelled');
  }

  /**
   * Execute the trade (both players confirmed)
   */
  private executeTrade(sessionId: string): void {
    const session = this.activeTrades.get(sessionId);
    if (!session) return;

    // Validate both players still have the items and gold
    // (items could have been traded/dropped since offer)
    // This is a simplified version - full implementation would verify each item

    // Transfer items (simplified)
    // Would integrate with inventory system to actually move items

    // Notify both players
    const client1 = this.wsServer.getClientByPlayerId(session.player1);
    const client2 = this.wsServer.getClientByPlayerId(session.player2);

    if (client1) {
      this.wsServer.sendToClient(client1, 'trade.completed', {
        received_items: session.player2Items,
        received_gold: session.player2Gold,
      });
    }
    if (client2) {
      this.wsServer.sendToClient(client2, 'trade.completed', {
        received_items: session.player1Items,
        received_gold: session.player1Gold,
      });
    }

    // Clean up
    this.cleanupTrade(sessionId);
    this.logger.info(`Trade completed: ${sessionId}`);
  }

  /**
   * Cancel a trade
   */
  private cancelTrade(sessionId: string, reason: string): void {
    const session = this.activeTrades.get(sessionId);
    if (!session) return;

    const client1 = this.wsServer.getClientByPlayerId(session.player1);
    const client2 = this.wsServer.getClientByPlayerId(session.player2);

    if (client1) this.wsServer.sendToClient(client1, 'trade.cancelled', { reason });
    if (client2) this.wsServer.sendToClient(client2, 'trade.cancelled', { reason });

    this.cleanupTrade(sessionId);
  }

  /**
   * Notify both players of trade update
   */
  private notifyTradeUpdate(sessionId: string): void {
    const session = this.activeTrades.get(sessionId);
    if (!session) return;

    const client1 = this.wsServer.getClientByPlayerId(session.player1);
    const client2 = this.wsServer.getClientByPlayerId(session.player2);

    if (client1) {
      this.wsServer.sendToClient(client1, 'trade.item_added', {
        partner_items: session.player2Items,
        partner_gold: session.player2Gold,
      });
    }
    if (client2) {
      this.wsServer.sendToClient(client2, 'trade.item_added', {
        partner_items: session.player1Items,
        partner_gold: session.player1Gold,
      });
    }
  }

  /**
   * Clean up a trade session
   */
  private cleanupTrade(sessionId: string): void {
    const session = this.activeTrades.get(sessionId);
    if (session) {
      this.playerTrades.delete(session.player1);
      this.playerTrades.delete(session.player2);
      this.activeTrades.delete(sessionId);
    }
  }

  /**
   * Clean up expired trades
   */
  cleanupExpiredTrades(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.activeTrades.entries()) {
      if (now - session.createdAt > 120000) { // 2 minute timeout
        this.cancelTrade(sessionId, 'Trade timed out');
      }
    }
  }
}
