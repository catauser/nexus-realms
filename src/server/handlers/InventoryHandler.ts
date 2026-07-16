// ============================================================
// Nexus Realms — Inventory Handler
// Handles inventory management, equipment, item usage
// ============================================================
import { ConnectedClient } from '../network/WebSocketServer';
import { WebSocketServer } from '../network/WebSocketServer';
import { World } from '../ecs/World';
import { Logger } from '../utils/Logger';
import { EquipmentSlot, GAME_CONFIG } from '@shared/types';

export class InventoryHandler {
  private world: World;
  private wsServer: WebSocketServer;
  private logger: Logger;

  constructor(world: World, wsServer: WebSocketServer) {
    this.world = world;
    this.wsServer = wsServer;
    this.logger = new Logger('InventoryHandler');
  }

  /**
   * Handle inventory slot swap
   */
  handleMove(client: ConnectedClient, data: { from_slot: number; to_slot: number }): void {
    if (!client.playerId) return;

    const inventory = this.world.getComponent(client.playerId, 'inventory') as {
      slots: (unknown | null)[];
    } | null;
    if (!inventory) return;

    // Validate slots
    if (data.from_slot < 0 || data.from_slot >= GAME_CONFIG.INVENTORY_SLOTS) return;
    if (data.to_slot < 0 || data.to_slot >= GAME_CONFIG.INVENTORY_SLOTS) return;

    // Swap items
    const temp = inventory.slots[data.from_slot];
    inventory.slots[data.from_slot] = inventory.slots[data.to_slot];
    inventory.slots[data.to_slot] = temp;

    // Update component
    this.world.updateComponent(client.playerId, 'inventory', { slots: inventory.slots });

    // Notify client
    this.wsServer.sendToClient(client, 'inventory.update', {
      slots: [
        { index: data.from_slot, item: inventory.slots[data.from_slot] },
        { index: data.to_slot, item: inventory.slots[data.to_slot] },
      ],
    });
  }

  /**
   * Handle item use (potion, food, etc.)
   */
  handleUseItem(client: ConnectedClient, data: { slot: number }): void {
    if (!client.playerId) return;

    if (data.slot < 0 || data.slot >= GAME_CONFIG.INVENTORY_SLOTS) return;

    const inventory = this.world.getComponent(client.playerId, 'inventory') as {
      slots: { item_id: string; quantity: number }[];
    } | null;
    if (!inventory) return;

    const item = inventory.slots[data.slot];
    if (!item) {
      this.wsServer.sendToClient(client, 'error', { code: 'EMPTY_SLOT', message: 'No item in that slot' });
      return;
    }

    // Check item type and apply effect
    // This would integrate with item definitions from the database
    this.logger.info(`Player ${client.playerId} used item ${item.item_id} from slot ${data.slot}`);

    // Consume item (for consumables)
    item.quantity--;
    if (item.quantity <= 0) {
      inventory.slots[data.slot] = null;
    }

    // Update client
    this.world.updateComponent(client.playerId, 'inventory', { slots: inventory.slots });
    this.wsServer.sendToClient(client, 'inventory.update', {
      slots: [{ index: data.slot, item: inventory.slots[data.slot] }],
    });
  }

  /**
   * Handle equip item
   */
  handleEquip(client: ConnectedClient, data: { item_slot: number; equip_slot: EquipmentSlot }): void {
    if (!client.playerId) return;

    if (data.item_slot < 0 || data.item_slot >= GAME_CONFIG.INVENTORY_SLOTS) return;

    const inventory = this.world.getComponent(client.playerId, 'inventory') as {
      slots: (unknown | null)[];
    } | null;
    const equipment = this.world.getComponent(client.playerId, 'equipment') as {
      slots: Record<string, unknown | null>;
    } | null;
    if (!inventory || !equipment) return;

    const item = inventory.slots[data.item_slot];
    if (!item) {
      this.wsServer.sendToClient(client, 'error', { code: 'EMPTY_SLOT', message: 'No item in that slot' });
      return;
    }

    // Validate item can go in that slot (would check item type vs slot)
    // For now, allow any item in any slot

    // Swap with currently equipped item
    const currentItem = equipment.slots[data.equip_slot];

    // Put current equipment in inventory slot
    inventory.slots[data.item_slot] = currentItem;

    // Equip new item
    equipment.slots[data.equip_slot] = item;

    // Update components
    this.world.updateComponent(client.playerId, 'inventory', { slots: inventory.slots });
    this.world.updateComponent(client.playerId, 'equipment', { slots: equipment.slots });

    // Recalculate stats (mark as dirty)
    this.world.updateComponent(client.playerId, 'stats', { _dirty: true });

    // Notify client
    this.wsServer.sendToClient(client, 'inventory.update', {
      slots: [{ index: data.item_slot, item: inventory.slots[data.item_slot] }],
    });
    this.wsServer.sendToClient(client, 'equipment.update', {
      slot: data.equip_slot,
      item: equipment.slots[data.equip_slot],
    });
  }

  /**
   * Handle unequip item
   */
  handleUnequip(client: ConnectedClient, data: { equip_slot: EquipmentSlot }): void {
    if (!client.playerId) return;

    const inventory = this.world.getComponent(client.playerId, 'inventory') as {
      slots: (unknown | null)[];
    } | null;
    const equipment = this.world.getComponent(client.playerId, 'equipment') as {
      slots: Record<string, unknown | null>;
    } | null;
    if (!inventory || !equipment) return;

    const item = equipment.slots[data.equip_slot];
    if (!item) {
      this.wsServer.sendToClient(client, 'error', { code: 'EMPTY_SLOT', message: 'Nothing equipped in that slot' });
      return;
    }

    // Find empty inventory slot
    const emptySlot = inventory.slots.findIndex((s) => s === null);
    if (emptySlot === -1) {
      this.wsServer.sendToClient(client, 'error', { code: 'INVENTORY_FULL', message: 'Inventory is full' });
      return;
    }

    // Move to inventory
    inventory.slots[emptySlot] = item;
    equipment.slots[data.equip_slot] = null;

    // Update components
    this.world.updateComponent(client.playerId, 'inventory', { slots: inventory.slots });
    this.world.updateComponent(client.playerId, 'equipment', { slots: equipment.slots });
    this.world.updateComponent(client.playerId, 'stats', { _dirty: true });

    // Notify client
    this.wsServer.sendToClient(client, 'inventory.update', {
      slots: [{ index: emptySlot, item: inventory.slots[emptySlot] }],
    });
    this.wsServer.sendToClient(client, 'equipment.update', {
      slot: data.equip_slot,
      item: null,
    });
  }
}
