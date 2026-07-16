// ============================================================
// Nexus Realms — Chat Handler
// Handles all chat channels, profanity filter, rate limiting
// ============================================================
import { ConnectedClient } from '../network/WebSocketServer';
import { WebSocketServer } from '../network/WebSocketServer';
import { World } from '../ecs/World';
import { Logger } from '../utils/Logger';
import { ChatChannel } from '@shared/types';

interface ChatRateLimit {
  count: number;
  resetTime: number;
}

export class ChatHandler {
  private world: World;
  private wsServer: WebSocketServer;
  private logger: Logger;
  private rateLimits: Map<string, ChatRateLimit> = new Map();
  private profanityList: Set<string> = new Set([
    // Basic profanity filter - would be loaded from file
    'damn', 'hell',
  ]);

  constructor(world: World, wsServer: WebSocketServer) {
    this.world = world;
    this.wsServer = wsServer;
    this.logger = new Logger('ChatHandler');
  }

  /**
   * Handle chat message
   */
  handle(client: ConnectedClient, data: { channel: ChatChannel; message: string; target?: string }): void {
    if (!client.playerId || !client.authenticated) return;

    // Rate limiting: 5 messages per 5 seconds
    const now = Date.now();
    let limit = this.rateLimits.get(client.playerId);
    if (!limit || now > limit.resetTime) {
      limit = { count: 0, resetTime: now + 5000 };
      this.rateLimits.set(client.playerId, limit);
    }
    limit.count++;

    if (limit.count > 5) {
      this.wsServer.sendToClient(client, 'error', { code: 'CHAT_RATE_LIMIT', message: 'Too many messages. Slow down.' });
      return;
    }

    // Sanitize message
    let message = data.message.trim();
    if (message.length === 0 || message.length > 500) return;

    // Profanity filter (optional, per-player setting)
    message = this.filterProfanity(message);

    // Get player name
    const playerData = this.world.getComponent(client.playerId, 'position');
    const playerName = this.getPlayerName(client.playerId);

    // Route by channel
    switch (data.channel) {
      case ChatChannel.SAY:
        this.handleSay(client, playerName, message);
        break;
      case ChatChannel.YELL:
        this.handleYell(client, playerName, message);
        break;
      case ChatChannel.WHISPER:
        this.handleWhisper(client, playerName, message, data.target);
        break;
      case ChatChannel.PARTY:
        this.handleParty(client, playerName, message);
        break;
      case ChatChannel.GUILD:
        this.handleGuild(client, playerName, message);
        break;
      case ChatChannel.TRADE:
        this.handleTrade(client, playerName, message);
        break;
      case ChatChannel.GENERAL:
        this.handleGeneral(client, playerName, message);
        break;
      default:
        this.wsServer.sendToClient(client, 'error', { code: 'INVALID_CHANNEL', message: 'Unknown chat channel' });
    }
  }

  /**
   * Say: broadcast to nearby players (same zone, 30yd range)
   */
  private handleSay(client: ConnectedClient, playerName: string, message: string): void {
    const pos = this.world.getComponent<{ zone_id: string }>(client.playerId!, 'position');
    if (!pos) return;

    this.wsServer.broadcastToZone(pos.zone_id, 'chat.message', {
      channel: ChatChannel.SAY,
      sender_name: playerName,
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Yell: broadcast to zone (300yd range, effectively whole zone)
   */
  private handleYell(client: ConnectedClient, playerName: string, message: string): void {
    const pos = this.world.getComponent<{ zone_id: string }>(client.playerId!, 'position');
    if (!pos) return;

    this.wsServer.broadcastToZone(pos.zone_id, 'chat.message', {
      channel: ChatChannel.YELL,
      sender_name: playerName,
      message: message.toUpperCase(),
      timestamp: Date.now(),
    });
  }

  /**
   * Whisper: send to specific player
   */
  private handleWhisper(client: ConnectedClient, playerName: string, message: string, targetName?: string): void {
    if (!targetName) {
      this.wsServer.sendToClient(client, 'error', { code: 'NO_TARGET', message: 'Specify a player to whisper' });
      return;
    }

    // Find target player by name
    const targetClientId = this.findClientByPlayerName(targetName);
    if (!targetClientId) {
      this.wsServer.sendToClient(client, 'error', { code: 'PLAYER_NOT_FOUND', message: `${targetName} is not online` });
      return;
    }

    // Send to target
    this.wsServer.sendToClient(targetClientId, 'chat.message', {
      channel: ChatChannel.WHISPER,
      sender_name: playerName,
      message,
      timestamp: Date.now(),
    });

    // Send confirmation to sender
    this.wsServer.sendToClient(client, 'chat.message', {
      channel: ChatChannel.WHISPER,
      sender_name: `To ${targetName}`,
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Party: broadcast to party members
   */
  private handleParty(client: ConnectedClient, playerName: string, message: string): void {
    // Would integrate with party system
    this.wsServer.sendToClient(client, 'chat.message', {
      channel: ChatChannel.PARTY,
      sender_name: playerName,
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Guild: broadcast to guild members
   */
  private handleGuild(client: ConnectedClient, playerName: string, message: string): void {
    // Would integrate with guild system
    this.wsServer.sendToClient(client, 'chat.message', {
      channel: ChatChannel.GUILD,
      sender_name: playerName,
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Trade: broadcast to zone
   */
  private handleTrade(client: ConnectedClient, playerName: string, message: string): void {
    const pos = this.world.getComponent<{ zone_id: string }>(client.playerId!, 'position');
    if (!pos) return;

    this.wsServer.broadcastToZone(pos.zone_id, 'chat.message', {
      channel: ChatChannel.TRADE,
      sender_name: playerName,
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * General: broadcast to everyone
   */
  private handleGeneral(client: ConnectedClient, playerName: string, message: string): void {
    this.wsServer.broadcast('chat.message', {
      channel: ChatChannel.GENERAL,
      sender_name: playerName,
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Filter profanity
   */
  private filterProfanity(message: string): string {
    let filtered = message;
    for (const word of this.profanityList) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    }
    return filtered;
  }

  /**
   * Get player name from entity
   */
  private getPlayerName(playerId: string): string {
    // Would load from character data
    return `Player_${playerId.substring(0, 6)}`;
  }

  /**
   * Find a connected client by player name
   */
  private findClientByPlayerName(name: string): ConnectedClient | null {
    // Would need a name→playerId index
    return null;
  }
}
