// ============================================================
// Nexus Realms — Player Handler
// Handles player movement, combat, interaction, loot
// ============================================================
import { ConnectedClient } from '../network/WebSocketServer';
import { WebSocketServer } from '../network/WebSocketServer';
import { World } from '../ecs/World';
import { Logger } from '../utils/Logger';
import { Direction, GAME_CONFIG } from '@shared/types';

export class PlayerHandler {
  private world: World;
  private wsServer: WebSocketServer;
  private logger: Logger;

  constructor(world: World, wsServer: WebSocketServer) {
    this.world = world;
    this.wsServer = wsServer;
    this.logger = new Logger('PlayerHandler');
  }

  /**
   * Handle player movement
   */
  handleMove(client: ConnectedClient, data: { x: number; y: number; direction: Direction }): void {
    if (!client.playerId) return;

    const entity = this.world.getEntity(client.playerId);
    if (!entity) return;

    const pos = this.world.getComponent<{ x: number; y: number; zone_id: string }>(client.playerId, 'position');
    if (!pos) return;

    // Validate movement distance (anti-cheat)
    const dx = data.x - pos.x;
    const dy = data.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 100; // Max pixels per move command

    if (dist > maxDist) {
      this.logger.warn(`Player ${client.playerId} moved too far: ${dist}`);
      return;
    }

    // Validate bounds
    if (data.x < 0 || data.y < 0) return;

    // Update position
    this.world.updateComponent(client.playerId, 'position', {
      x: data.x,
      y: data.y,
      direction: data.direction,
    });

    // Broadcast to nearby players
    this.wsServer.broadcastToZone(pos.zone_id, 'player.move', {
      player_id: client.playerId,
      x: data.x,
      y: data.y,
      direction: data.direction,
      speed: 3,
    }, client.playerId);
  }

  /**
   * Handle player attack (ability usage)
   */
  handleAttack(client: ConnectedClient, data: { target_id: string; ability_id: string }): void {
    if (!client.playerId) return;

    // Validate target exists
    const target = this.world.getEntity(data.target_id);
    if (!target) {
      this.wsServer.sendToClient(client, 'error', { code: 'INVALID_TARGET', message: 'Target not found' });
      return;
    }

    // Validate ability ownership
    const combat = this.world.getComponent(client.playerId, 'combat');
    if (!combat) return;

    // Queue ability for combat system to process
    this.world.updateComponent(client.playerId, 'combat', {
      target_id: data.target_id,
      current_ability: data.ability_id,
      ability_start_time: Date.now(),
    });
  }

  /**
   * Handle player use ability (with position target)
   */
  handleUseAbility(client: ConnectedClient, data: { ability_id: string; target_id?: string; x?: number; y?: number }): void {
    if (!client.playerId) return;

    this.world.updateComponent(client.playerId, 'combat', {
      current_ability: data.ability_id,
      target_id: data.target_id || null,
      ability_start_time: Date.now(),
    });
  }

  /**
   * Handle player interact (NPC, object)
   */
  handleInteract(client: ConnectedClient, data: { target_id: string }): void {
    if (!client.playerId) return;

    const target = this.world.getEntity(data.target_id);
    if (!target) return;

    const interactable = this.world.getComponent(data.target_id, 'interactable');
    if (!interactable) return;

    const pos = this.world.getComponent<{ x: number; y: number }>(client.playerId, 'position');
    const targetPos = this.world.getComponent<{ x: number; y: number }>(data.target_id, 'position');
    if (!pos || !targetPos) return;

    // Check interaction range
    const dist = Math.sqrt(
      Math.pow(pos.x - targetPos.x, 2) + Math.pow(pos.y - targetPos.y, 2),
    );

    if (dist > (interactable as { interaction_range: number }).interaction_range) {
      this.wsServer.sendToClient(client, 'error', { code: 'TOO_FAR', message: 'Too far away' });
      return;
    }

    // Handle based on interaction type
    const interType = (interactable as { interaction_type: string }).interaction_type;
    switch (interType) {
      case 'talk':
        this.handleNpcTalk(client, data.target_id);
        break;
      case 'shop':
        this.handleNpcShop(client, data.target_id);
        break;
      case 'quest':
        // Handled by quest handler
        break;
      case 'gather':
        // Handled by gathering system
        break;
      case 'loot':
        // Handled by loot system
        break;
      default:
        break;
    }
  }

  /**
   * Handle NPC dialogue
   */
  private handleNpcTalk(client: ConnectedClient, npcId: string): void {
    const dialogue = this.world.getComponent(npcId, 'dialogue');
    if (!dialogue) return;

    const dialogueData = dialogue as { dialogue_tree_id: string; current_node: string };

    this.wsServer.sendToClient(client, 'npc.dialogue', {
      npc_id: npcId,
      dialogue_id: dialogueData.dialogue_tree_id,
      text: 'Welcome, traveler.', // Would load from dialogue data
      options: [
        { id: 'quest', text: 'I have a quest for you.' },
        { id: 'shop', text: 'Let me see your wares.' },
        { id: 'goodbye', text: 'Farewell.' },
      ],
    });
  }

  /**
   * Handle NPC shop
   */
  private handleNpcShop(client: ConnectedClient, npcId: string): void {
    const shop = this.world.getComponent(npcId, 'shop');
    if (!shop) return;

    this.wsServer.sendToClient(client, 'npc.shop', {
      npc_id: npcId,
      items: (shop as { items: unknown[] }).items,
    });
  }

  /**
   * Handle loot request
   */
  handleLoot(client: ConnectedClient, data: { corpse_id: string; item_ids: string[] }): void {
    if (!client.playerId) return;

    const lootable = this.world.getComponent(data.corpse_id, 'lootable');
    if (!lootable) return;

    const lootData = lootable as { items: { item_id: string }[]; gold: number };

    // Validate items exist in loot
    for (const itemId of data.item_ids) {
      const exists = lootData.items.some((i) => i.item_id === itemId);
      if (!exists) {
        this.wsServer.sendToClient(client, 'error', { code: 'INVALID_LOOT', message: 'Item not in loot' });
        return;
      }
    }

    // Transfer items to player inventory
    // (simplified - would integrate with inventory system)
    this.wsServer.sendToClient(client, 'loot.looted', {
      corpse_id: data.corpse_id,
      items: data.item_ids,
    });

    // Remove looted items from corpse
    this.world.updateComponent(data.corpse_id, 'lootable', {
      items: lootData.items.filter((i) => !data.item_ids.includes(i.item_id)),
    });
  }
}
