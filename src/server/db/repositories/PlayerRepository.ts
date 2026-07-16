// ============================================================
// Nexus Realms — Player Repository
// CRUD operations for player data with batch save support.
// ============================================================

import { getDatabase } from '../Database';
import { Logger } from '../../utils/Logger';
import type { PlayerData, EntityStats, EquipmentSlot, ItemInstance } from '../../../shared/types';

const logger = new Logger({ context: 'PlayerRepo' });

/** Database row shape for characters table */
interface CharacterRow {
  id: string;
  account_id: string;
  name: string;
  class_id: string;
  level: number;
  experience: number;
  x: number;
  y: number;
  direction: number;
  zone_id: number;
  hp: number;
  max_hp: number;
  mana: number;
  max_mana: number;
  stats_json: Record<string, unknown>;
  equipment_json: Record<string, unknown>;
  inventory_json: Record<string, unknown>;
  skills_json: Record<string, unknown>;
  guild_id: string | null;
  pvp_flags: Record<string, unknown>;
  is_online: boolean;
  last_online: string;
  play_time: number;
  created_at: string;
}

/**
 * Repository for player (character) data persistence.
 * Handles loading, saving, and batch operations.
 */
export class PlayerRepository {
  private db = getDatabase();

  // ─── Read Operations ──────────────────────────────────────

  /**
   * Find a character by ID.
   */
  public async findById(characterId: string): Promise<PlayerData | null> {
    const row = await this.db.queryOne<CharacterRow>(
      'SELECT * FROM characters WHERE id = $1',
      [characterId]
    );
    if (!row) return null;
    return this.rowToPlayerData(row);
  }

  /**
   * Find all characters for an account.
   */
  public async findByAccountId(accountId: string): Promise<PlayerData[]> {
    const rows = await this.db.queryAll<CharacterRow>(
      'SELECT * FROM characters WHERE account_id = $1 ORDER BY last_online DESC',
      [accountId]
    );
    return rows.map(r => this.rowToPlayerData(r));
  }

  /**
   * Find a character by name.
   */
  public async findByName(name: string): Promise<PlayerData | null> {
    const row = await this.db.queryOne<CharacterRow>(
      'SELECT * FROM characters WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    if (!row) return null;
    return this.rowToPlayerData(row);
  }

  /**
   * Check if a character name is available.
   */
  public async isNameAvailable(name: string): Promise<boolean> {
    const row = await this.db.queryOne<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM characters WHERE LOWER(name) = LOWER($1)) AS exists',
      [name]
    );
    return !(row?.exists ?? true);
  }

  // ─── Write Operations ─────────────────────────────────────

  /**
   * Create a new character.
   */
  public async create(data: {
    accountId: string;
    name: string;
    classType: string;
    zoneId: number;
    spawnX: number;
    spawnY: number;
    maxHp: number;
    maxMana: number;
    stats: EntityStats;
  }): Promise<PlayerData> {
    const row = await this.db.queryOne<CharacterRow>(
      `INSERT INTO characters (
        account_id, name, class_id, zone_id, x, y,
        hp, max_hp, mana, max_mana, stats_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $8, $9)
      RETURNING *`,
      [
        data.accountId,
        data.name,
        data.classType,
        data.zoneId,
        data.spawnX,
        data.spawnY,
        data.maxHp,
        data.maxMana,
        JSON.stringify(data.stats),
      ]
    );

    if (!row) throw new Error('Failed to create character');
    logger.info('Character created', { id: row.id, name: data.name, class: data.classType });
    return this.rowToPlayerData(row);
  }

  /**
   * Save player data (full update).
   */
  public async save(player: PlayerData): Promise<void> {
    await this.db.query(
      `UPDATE characters SET
        x = $1, y = $2, direction = $3, zone_id = $4,
        level = $5, experience = $6,
        hp = $7, max_hp = $8, mana = $9, max_mana = $10,
        stats_json = $11, equipment_json = $12, inventory_json = $13,
        skills_json = $14, guild_id = $15, pvp_flags = $16,
        is_online = $17, last_online = NOW(), play_time = $18
      WHERE id = $19`,
      [
        player.x,
        player.y,
        player.direction,
        player.zone_id,
        player.level,
        player.experience,
        player.hp,
        player.max_hp,
        player.mana,
        player.max_mana,
        JSON.stringify(player.stats),
        JSON.stringify(player.equipment),
        JSON.stringify(player.inventory),
        JSON.stringify(player.abilities),
        player.guild_id,
        JSON.stringify(player.pvp_flags),
        true,
        0, // play_time delta handled separately
        player.id,
      ]
    );
  }

  /**
   * Save a player's position only (high frequency).
   */
  public async savePosition(playerId: string, x: number, y: number, zoneId: string): Promise<void> {
    await this.db.query(
      'UPDATE characters SET x = $1, y = $2, zone_id = $3 WHERE id = $4',
      [x, y, zoneId, playerId]
    );
  }

  /**
   * Set online status.
   */
  public async setOnline(characterId: string, online: boolean): Promise<void> {
    await this.db.query(
      'UPDATE characters SET is_online = $1, last_online = NOW() WHERE id = $2',
      [online, characterId]
    );
  }

  /**
   * Batch save multiple players (for auto-save cycles).
   * Uses a single transaction for efficiency.
   */
  public async batchSave(players: PlayerData[]): Promise<void> {
    if (players.length === 0) return;

    const queries = players.map(p => ({
      text: `UPDATE characters SET
        x = $1, y = $2, zone_id = $3, level = $4, experience = $5,
        hp = $6, max_hp = $7, mana = $8, max_mana = $9,
        stats_json = $10, equipment_json = $11, inventory_json = $12,
        skills_json = $13, last_online = NOW()
      WHERE id = $14`,
      params: [
        p.x, p.y, p.zone_id, p.level, p.experience,
        p.hp, p.max_hp, p.mana, p.max_mana,
        JSON.stringify(p.stats), JSON.stringify(p.equipment),
        JSON.stringify(p.inventory), JSON.stringify(p.abilities),
        p.id,
      ],
    }));

    await this.db.batch(queries);
    logger.debug(`Batch saved ${players.length} players`);
  }

  /**
   * Delete a character (soft delete via status if desired, or hard delete).
   */
  public async delete(characterId: string): Promise<boolean> {
    const count = await this.db.delete('characters', 'id = $1', [characterId]);
    return count > 0;
  }

  // ─── Mapping ──────────────────────────────────────────────

  /**
   * Convert a database row to a PlayerData object.
   */
  private rowToPlayerData(row: CharacterRow): PlayerData {
    const stats = (row.stats_json ?? {}) as unknown as EntityStats;
    const equipment = (row.equipment_json ?? {}) as Record<EquipmentSlot, ItemInstance | null>;
    const inventory = (row.inventory_json ?? {}) as Record<string, unknown>;
    const pvpFlags = (row.pvp_flags ?? {}) as Record<string, unknown>;

    return {
      id: row.id,
      account_id: row.account_id,
      name: row.name,
      class_type: row.class_id as any,
      specialization: null,
      x: row.x,
      y: row.y,
      direction: row.direction as any,
      zone_id: String(row.zone_id),
      level: row.level,
      experience: row.experience,
      hp: row.hp,
      max_hp: row.max_hp,
      mana: row.mana,
      max_mana: row.max_mana,
      stats: {
        strength: 0, agility: 0, intellect: 0, spirit: 0, stamina: 0,
        armor: 0, fire_resist: 0, ice_resist: 0, lightning_resist: 0,
        holy_resist: 0, shadow_resist: 0, nature_resist: 0,
        critical_chance: 5, critical_damage: 1.5, haste: 0,
        dodge: 0, block: 0, parry: 0, hit_chance: 95,
        spell_power: 0, attack_power: 0,
        ...stats,
      },
      equipment: equipment as any,
      inventory: (inventory as any)?.slots ?? [],
      abilities: [],
      active_buffs: [],
      quest_log: [],
      profession_data: {} as any,
      guild_id: row.guild_id,
      gold: (inventory as any)?.gold ?? 0,
      pvp_flags: {
        flagged: false, flag_expires_at: 0, kills: 0, deaths: 0,
        rating_2v2: 1000, rating_3v3: 1000, battleground_wins: 0, honor_points: 0,
        ...pvpFlags,
      } as any,
      reputation: {} as any,
      position_saved_at: Date.now(),
    };
  }
}
