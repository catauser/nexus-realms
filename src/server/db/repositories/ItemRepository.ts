// ============================================================
// Nexus Realms — Item Repository
// Item definitions CRUD, inventory operations, equipment ops.
// ============================================================

import { getDatabase } from '../Database';
import { Logger } from '../../utils/Logger';
import type { ItemInstance, EquipmentSlot } from '../../../shared/types';

const logger = new Logger({ context: 'ItemRepo' });

/** Database row for item definitions */
interface ItemRow {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  level_req: number;
  class_req: string | null;
  stats_json: Record<string, unknown>;
  effects_json: unknown[];
  icon_id: string;
  stack_max: number;
  bind_type: string;
  sell_price: number;
  buy_price: number;
  durability_max: number | null;
  is_unique: boolean;
  is_quest_item: boolean;
  set_id: string | null;
}

/** Database row for inventory entries */
interface InventoryRow {
  id: string;
  character_id: string;
  item_id: string;
  slot: number;
  quantity: number;
  enchantments_json: unknown[];
  durability: number | null;
  bag_id: number;
}

/** Database row for equipment entries */
interface EquipmentRow {
  character_id: string;
  slot: string;
  item_id: string;
  enchantments_json: unknown[];
  durability: number | null;
}

/** Full item definition with stats */
export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  levelReq: number;
  classReq: string | null;
  stats: Record<string, number>;
  effects: unknown[];
  iconId: string;
  stackMax: number;
  bindType: string;
  sellPrice: number;
  buyPrice: number;
  durabilityMax: number | null;
  isUnique: boolean;
  isQuestItem: boolean;
  setId: string | null;
}

/**
 * Repository for item-related database operations.
 * Handles item definitions, inventory, and equipment.
 */
export class ItemRepository {
  private db = getDatabase();

  /** In-memory cache of item definitions (loaded on startup) */
  private itemCache: Map<string, ItemDefinition> = new Map();

  // ─── Item Definitions ─────────────────────────────────────

  /**
   * Load all item definitions into memory cache.
   * Call this at server startup.
   */
  public async loadAllDefinitions(): Promise<void> {
    const rows = await this.db.queryAll<ItemRow>('SELECT * FROM items');
    for (const row of rows) {
      this.itemCache.set(row.id, this.rowToDefinition(row));
    }
    logger.info(`Loaded ${rows.length} item definitions`);
  }

  /**
   * Get an item definition by ID (from cache).
   */
  public getDefinition(itemId: string): ItemDefinition | undefined {
    return this.itemCache.get(itemId);
  }

  /**
   * Get all item definitions (from cache).
   */
  public getAllDefinitions(): ItemDefinition[] {
    return Array.from(this.itemCache.values());
  }

  /**
   * Search item definitions by name (fuzzy).
   */
  public searchByName(query: string, limit: number = 20): ItemDefinition[] {
    const lower = query.toLowerCase();
    const results: ItemDefinition[] = [];
    for (const def of this.itemCache.values()) {
      if (def.name.toLowerCase().includes(lower)) {
        results.push(def);
        if (results.length >= limit) break;
      }
    }
    return results;
  }

  /**
   * Create a new item definition in the database.
   */
  public async createDefinition(data: {
    name: string;
    description: string;
    type: string;
    rarity: string;
    levelReq: number;
    classReq?: string;
    stats: Record<string, number>;
    effects: unknown[];
    iconId: string;
    stackMax: number;
    bindType: string;
    sellPrice: number;
    buyPrice: number;
    durabilityMax?: number;
    isUnique: boolean;
    isQuestItem: boolean;
    setId?: string;
  }): Promise<ItemDefinition> {
    const row = await this.db.queryOne<ItemRow>(
      `INSERT INTO items (
        name, description, type, rarity, level_req, class_req,
        stats_json, effects_json, icon_id, stack_max, bind_type,
        sell_price, buy_price, durability_max, is_unique, is_quest_item, set_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *`,
      [
        data.name, data.description, data.type, data.rarity,
        data.levelReq, data.classReq ?? null,
        JSON.stringify(data.stats), JSON.stringify(data.effects),
        data.iconId, data.stackMax, data.bindType,
        data.sellPrice, data.buyPrice, data.durabilityMax ?? null,
        data.isUnique, data.isQuestItem, data.setId ?? null,
      ]
    );

    if (!row) throw new Error('Failed to create item definition');
    const def = this.rowToDefinition(row);
    this.itemCache.set(def.id, def);
    return def;
  }

  // ─── Inventory Operations ─────────────────────────────────

  /**
   * Load a character's inventory from the database.
   */
  public async loadInventory(characterId: string): Promise<InventoryRow[]> {
    return this.db.queryAll<InventoryRow>(
      'SELECT * FROM inventory WHERE character_id = $1 ORDER BY slot',
      [characterId]
    );
  }

  /**
   * Add an item to a character's inventory.
   */
  public async addToInventory(
    characterId: string,
    itemId: string,
    slot: number,
    quantity: number = 1,
    bagId: number = 0
  ): Promise<InventoryRow> {
    const row = await this.db.queryOne<InventoryRow>(
      `INSERT INTO inventory (character_id, item_id, slot, quantity, bag_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [characterId, itemId, slot, quantity, bagId]
    );
    if (!row) throw new Error('Failed to add item to inventory');
    return row;
  }

  /**
   * Update item quantity in a specific inventory slot.
   */
  public async updateInventoryQuantity(
    characterId: string,
    slot: number,
    quantity: number,
    bagId: number = 0
  ): Promise<void> {
    if (quantity <= 0) {
      await this.removeFromInventory(characterId, slot, bagId);
      return;
    }
    await this.db.query(
      'UPDATE inventory SET quantity = $1 WHERE character_id = $2 AND slot = $3 AND bag_id = $4',
      [quantity, characterId, slot, bagId]
    );
  }

  /**
   * Remove an item from a specific inventory slot.
   */
  public async removeFromInventory(
    characterId: string,
    slot: number,
    bagId: number = 0
  ): Promise<boolean> {
    const count = await this.db.delete(
      'inventory',
      'character_id = $1 AND slot = $2 AND bag_id = $3',
      [characterId, slot, bagId]
    );
    return count > 0;
  }

  /**
   * Move an item between inventory slots.
   */
  public async moveInventoryItem(
    characterId: string,
    fromSlot: number,
    toSlot: number,
    bagId: number = 0
  ): Promise<void> {
    // Use a transaction to swap or move items
    await this.db.transaction(async (client) => {
      // Check if destination slot has an item
      const destItem = await client.query(
        'SELECT id FROM inventory WHERE character_id = $1 AND slot = $2 AND bag_id = $3',
        [characterId, toSlot, bagId]
      );

      if (destItem.rows.length > 0) {
        // Swap: temporarily move destination to a sentinel slot
        await client.query(
          'UPDATE inventory SET slot = -1 WHERE character_id = $1 AND slot = $2 AND bag_id = $3',
          [characterId, toSlot, bagId]
        );
        await client.query(
          'UPDATE inventory SET slot = $1 WHERE character_id = $2 AND slot = $3 AND bag_id = $4',
          [toSlot, characterId, fromSlot, bagId]
        );
        await client.query(
          'UPDATE inventory SET slot = $1 WHERE character_id = $2 AND slot = -1 AND bag_id = $3',
          [fromSlot, characterId, bagId]
        );
      } else {
        // Simple move
        await client.query(
          'UPDATE inventory SET slot = $1 WHERE character_id = $2 AND slot = $3 AND bag_id = $4',
          [toSlot, characterId, fromSlot, bagId]
        );
      }
    });
  }

  // ─── Equipment Operations ─────────────────────────────────

  /**
   * Load a character's equipment.
   */
  public async loadEquipment(characterId: string): Promise<EquipmentRow[]> {
    return this.db.queryAll<EquipmentRow>(
      'SELECT * FROM equipment WHERE character_id = $1',
      [characterId]
    );
  }

  /**
   * Equip an item (move from inventory to equipment slot).
   * Returns the previously equipped item (if any) to the inventory.
   */
  public async equipItem(
    characterId: string,
    itemId: string,
    equipSlot: EquipmentSlot,
    fromSlot: number
  ): Promise<{ unequippedItemId: string | null }> {
    return this.db.transaction(async (client) => {
      // Check for currently equipped item
      const current = await client.query(
        'SELECT item_id FROM equipment WHERE character_id = $1 AND slot = $2',
        [characterId, equipSlot]
      );

      let unequippedItemId: string | null = null;

      if (current.rows.length > 0) {
        // Move currently equipped item to inventory
        unequippedItemId = current.rows[0].item_id;
        await client.query(
          'UPDATE inventory SET item_id = $1 WHERE character_id = $2 AND slot = $3',
          [unequippedItemId, characterId, fromSlot]
        );
        await client.query(
          'DELETE FROM equipment WHERE character_id = $1 AND slot = $2',
          [characterId, equipSlot]
        );
      } else {
        // Remove item from inventory
        await client.query(
          'DELETE FROM inventory WHERE character_id = $1 AND slot = $2',
          [characterId, fromSlot]
        );
      }

      // Equip new item
      await client.query(
        `INSERT INTO equipment (character_id, slot, item_id)
         VALUES ($1, $2, $3)`,
        [characterId, equipSlot, itemId]
      );

      return { unequippedItemId };
    });
  }

  /**
   * Unequip an item (move from equipment to inventory).
   */
  public async unequipItem(
    characterId: string,
    equipSlot: EquipmentSlot,
    toSlot: number
  ): Promise<boolean> {
    return this.db.transaction(async (client) => {
      const current = await client.query(
        'SELECT item_id FROM equipment WHERE character_id = $1 AND slot = $2',
        [characterId, equipSlot]
      );

      if (current.rows.length === 0) return false;

      const itemId = current.rows[0].item_id;

      // Add to inventory
      await client.query(
        `INSERT INTO inventory (character_id, item_id, slot, quantity)
         VALUES ($1, $2, $3, 1)
         ON CONFLICT (character_id, bag_id, slot) DO NOTHING`,
        [characterId, itemId, toSlot]
      );

      // Remove from equipment
      await client.query(
        'DELETE FROM equipment WHERE character_id = $1 AND slot = $2',
        [characterId, equipSlot]
      );

      return true;
    });
  }

  // ─── Mapping ──────────────────────────────────────────────

  private rowToDefinition(row: ItemRow): ItemDefinition {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      rarity: row.rarity,
      levelReq: row.level_req,
      classReq: row.class_req,
      stats: (row.stats_json ?? {}) as Record<string, number>,
      effects: row.effects_json ?? [],
      iconId: row.icon_id,
      stackMax: row.stack_max,
      bindType: row.bind_type,
      sellPrice: row.sell_price,
      buyPrice: row.buy_price,
      durabilityMax: row.durability_max,
      isUnique: row.is_unique,
      isQuestItem: row.is_quest_item,
      setId: row.set_id,
    };
  }
}
