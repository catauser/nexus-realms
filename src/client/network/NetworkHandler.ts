// ============================================================
// Nexus Realms — Network Handler
// Maps WebSocket messages to game state updates
// Manages entity interpolation buffer
// ============================================================

import { WebSocketClient } from './WebSocketClient';
import {
  PlayerData, MonsterData, NPCData, ItemInstance,
  ActiveBuff, EquipmentSlot, ChatChannel, QuestProgress,
  WeatherType, Direction,
} from '../../shared/types';

// ─── Interpolation Snapshot ──────────────────────────────────
export interface PositionSnapshot {
  x: number;
  y: number;
  direction: Direction;
  speed: number;
  timestamp: number;
}

export interface InterpolationBuffer {
  snapshots: PositionSnapshot[];
  maxSnapshots: number;
}

// ─── Game State Store ────────────────────────────────────────
export interface GameStateStore {
  localPlayer: PlayerData | null;
  players: Map<string, PlayerData>;
  entities: Map<string, MonsterData | NPCData>;
  chatMessages: ChatMessage[];
  questLog: Map<string, QuestProgress>;
  weather: { zone_id: string; weather: WeatherType; intensity: number } | null;
  gameTime: { game_time: number; day_night: 'day' | 'night' } | null;
  notifications: NotificationEntry[];
  interpolationBuffers: Map<string, InterpolationBuffer>;
  pendingDamage: DamageEvent[];
  pendingHeals: HealEvent[];
  pendingAbilityEffects: AbilityEffectEvent[];
  pendingBuffs: BuffEvent[];
  pendingLootDrops: LootDropEvent[];
  pendingLevelUps: LevelUpEvent[];
  pendingDeaths: DeathEvent[];
  pendingRespawns: RespawnEvent[];
  zoneId: string;
  connected: boolean;
}

export interface ChatMessage {
  channel: ChatChannel;
  sender_name: string;
  message: string;
  timestamp: number;
}

export interface NotificationEntry {
  type: string;
  message: string;
  timestamp: number;
  duration?: number;
}

export interface DamageEvent {
  source_id: string;
  target_id: string;
  amount: number;
  damage_type: string;
  critical: boolean;
  blocked: number;
  timestamp: number;
}

export interface HealEvent {
  source_id: string;
  target_id: string;
  amount: number;
  timestamp: number;
}

export interface AbilityEffectEvent {
  caster_id: string;
  ability_id: string;
  target_id?: string;
  x?: number;
  y?: number;
  effects: string[];
  timestamp: number;
}

export interface BuffEvent {
  target_id: string;
  buff?: ActiveBuff;
  buff_id?: string;
  action: 'apply' | 'remove';
  timestamp: number;
}

export interface LootDropEvent {
  corpse_id: string;
  items: ItemInstance[];
  timestamp: number;
}

export interface LevelUpEvent {
  player_id: string;
  level: number;
  new_stats: Record<string, number>;
  timestamp: number;
}

export interface DeathEvent {
  entity_id: string;
  killer_id: string;
  respawn_at: number;
  timestamp: number;
}

export interface RespawnEvent {
  entity_id: string;
  x: number;
  y: number;
  hp: number;
  mana: number;
  timestamp: number;
}

// ─── Constants ───────────────────────────────────────────────
const INTERP_BUFFER_SIZE = 10;
const INTERP_DELAY_MS = 100;

// ─── Network Handler ─────────────────────────────────────────
export class NetworkHandler {
  private ws: WebSocketClient;
  private store: GameStateStore;
  private messageQueue: { type: string; data: Record<string, unknown> }[] = [];
  private loading: boolean = true;

  constructor(ws: WebSocketClient) {
    this.ws = ws;
    this.store = this.createStore();
    this.registerHandlers();
  }

  getStore(): GameStateStore {
    return this.store;
  }

  /** Mark loading complete and flush queued messages */
  setLoading(loading: boolean): void {
    this.loading = loading;
    if (!loading) {
      this.flushMessageQueue();
    }
  }

  isLoading(): boolean {
    return this.loading;
  }

  /** Call each frame to update interpolation and clean state */
  update(_dt: number): void {
    const now = Date.now();
    // Clean old notifications
    this.store.notifications = this.store.notifications.filter(
      n => now - n.timestamp < (n.duration ?? 10000),
    );
  }

  /** Get interpolated position for an entity */
  getInterpolatedPosition(entityId: string, renderTimestamp: number): PositionSnapshot | null {
    const buffer = this.store.interpolationBuffers.get(entityId);
    if (!buffer || buffer.snapshots.length < 2) {
      if (buffer && buffer.snapshots.length === 1) {
        return buffer.snapshots[0];
      }
      return null;
    }

    const targetTime = renderTimestamp - INTERP_DELAY_MS;
    const snaps = buffer.snapshots;

    for (let i = 0; i < snaps.length - 1; i++) {
      const s0 = snaps[i];
      const s1 = snaps[i + 1];
      if (s0.timestamp <= targetTime && s1.timestamp >= targetTime) {
        const duration = s1.timestamp - s0.timestamp;
        if (duration === 0) return s0;
        const t = (targetTime - s0.timestamp) / duration;
        return {
          x: s0.x + (s1.x - s0.x) * t,
          y: s0.y + (s1.y - s0.y) * t,
          direction: s1.direction,
          speed: s0.speed + (s1.speed - s0.speed) * t,
          timestamp: renderTimestamp,
        };
      }
    }

    return snaps[snaps.length - 1];
  }

  /** Get the latest snapshot for an entity (no interpolation) */
  getLatestPosition(entityId: string): PositionSnapshot | null {
    const buffer = this.store.interpolationBuffers.get(entityId);
    if (!buffer || buffer.snapshots.length === 0) return null;
    return buffer.snapshots[buffer.snapshots.length - 1];
  }

  /** Consume all pending one-shot events */
  consumePendingEvents(): {
    damage: DamageEvent[];
    heals: HealEvent[];
    abilities: AbilityEffectEvent[];
    buffs: BuffEvent[];
    lootDrops: LootDropEvent[];
    levelUps: LevelUpEvent[];
    deaths: DeathEvent[];
    respawns: RespawnEvent[];
  } {
    const events = {
      damage: [...this.store.pendingDamage],
      heals: [...this.store.pendingHeals],
      abilities: [...this.store.pendingAbilityEffects],
      buffs: [...this.store.pendingBuffs],
      lootDrops: [...this.store.pendingLootDrops],
      levelUps: [...this.store.pendingLevelUps],
      deaths: [...this.store.pendingDeaths],
      respawns: [...this.store.pendingRespawns],
    };

    this.store.pendingDamage.length = 0;
    this.store.pendingHeals.length = 0;
    this.store.pendingAbilityEffects.length = 0;
    this.store.pendingBuffs.length = 0;
    this.store.pendingLootDrops.length = 0;
    this.store.pendingLevelUps.length = 0;
    this.store.pendingDeaths.length = 0;
    this.store.pendingRespawns.length = 0;

    return events;
  }

  // ─── Private ──────────────────────────────────────────────

  private createStore(): GameStateStore {
    return {
      localPlayer: null,
      players: new Map(),
      entities: new Map(),
      chatMessages: [],
      questLog: new Map(),
      weather: null,
      gameTime: null,
      notifications: [],
      interpolationBuffers: new Map(),
      pendingDamage: [],
      pendingHeals: [],
      pendingAbilityEffects: [],
      pendingBuffs: [],
      pendingLootDrops: [],
      pendingLevelUps: [],
      pendingDeaths: [],
      pendingRespawns: [],
      zoneId: '',
      connected: false,
    };
  }

  private pushSnapshot(entityId: string, snap: PositionSnapshot): void {
    let buffer = this.store.interpolationBuffers.get(entityId);
    if (!buffer) {
      buffer = { snapshots: [], maxSnapshots: INTERP_BUFFER_SIZE };
      this.store.interpolationBuffers.set(entityId, buffer);
    }
    buffer.snapshots.push(snap);
    if (buffer.snapshots.length > buffer.maxSnapshots) {
      buffer.snapshots.shift();
    }
  }

  private removeEntityBuffers(entityId: string): void {
    this.store.interpolationBuffers.delete(entityId);
  }

  private queueMessage(type: string, data: Record<string, unknown>): void {
    if (this.messageQueue.length < 500) {
      this.messageQueue.push({ type, data });
    }
  }

  private flushMessageQueue(): void {
    const queue = [...this.messageQueue];
    this.messageQueue.length = 0;
    // Re-process queued messages through handlers
    for (const msg of queue) {
      const handlers = this.ws as unknown as { handlers: Map<string, Set<(d: Record<string, unknown>) => void>> };
      const typeHandlers = handlers.handlers?.get(msg.type);
      if (typeHandlers) {
        for (const handler of typeHandlers) {
          try { handler(msg.data); } catch (e) { console.error(`[NH] Queue flush error:`, e); }
        }
      }
    }
  }

  private registerHandlers(): void {
    const ws = this.ws;

    // ─── Auth ───────────────────────────────────────────────
    ws.on('auth.success', (data) => {
      const d = data as unknown as {
        player: PlayerData;
        world_state: { zone_id: string; time: number; weather: WeatherType };
      };
      this.store.localPlayer = d.player;
      this.store.zoneId = d.world_state.zone_id;
      this.store.gameTime = { game_time: d.world_state.time, day_night: 'day' };
      this.store.weather = {
        zone_id: d.world_state.zone_id,
        weather: d.world_state.weather,
        intensity: 1,
      };
      this.store.connected = true;

      // Push initial snapshot for local player
      this.pushSnapshot(d.player.id, {
        x: d.player.x,
        y: d.player.y,
        direction: d.player.direction,
        speed: 0,
        timestamp: Date.now(),
      });

      if (d.player.quest_log) {
        for (const q of d.player.quest_log) {
          this.store.questLog.set(q.quest_id, q);
        }
      }
    });

    ws.on('auth.failure', (data) => {
      const d = data as { reason: string };
      this.store.notifications.push({
        type: 'error',
        message: `Login failed: ${d.reason}`,
        timestamp: Date.now(),
        duration: 5000,
      });
    });

    // ─── Player Spawns ──────────────────────────────────────
    ws.on('player.spawn', (data) => {
      const d = data as { player: PlayerData };
      this.store.players.set(d.player.id, d.player);
      this.pushSnapshot(d.player.id, {
        x: d.player.x,
        y: d.player.y,
        direction: d.player.direction,
        speed: 0,
        timestamp: Date.now(),
      });
    });

    ws.on('player.despawn', (data) => {
      const d = data as { player_id: string; reason: string };
      this.store.players.delete(d.player_id);
      this.removeEntityBuffers(d.player_id);
    });

    // ─── Player Movement ────────────────────────────────────
    ws.on('player.move', (data) => {
      const d = data as {
        player_id: string; x: number; y: number;
        direction: Direction; speed: number;
      };
      const now = Date.now();

      if (this.store.localPlayer && d.player_id === this.store.localPlayer.id) {
        this.store.localPlayer.x = d.x;
        this.store.localPlayer.y = d.y;
        this.store.localPlayer.direction = d.direction;
      }

      const player = this.store.players.get(d.player_id);
      if (player) {
        player.x = d.x;
        player.y = d.y;
        player.direction = d.direction;
      }

      this.pushSnapshot(d.player_id, {
        x: d.x, y: d.y,
        direction: d.direction,
        speed: d.speed,
        timestamp: now,
      });
    });

    // ─── Health / Mana ──────────────────────────────────────
    ws.on('player.health_update', (data) => {
      const d = data as { player_id: string; hp: number; max_hp: number };
      if (this.store.localPlayer && d.player_id === this.store.localPlayer.id) {
        this.store.localPlayer.hp = d.hp;
        this.store.localPlayer.max_hp = d.max_hp;
      }
      const player = this.store.players.get(d.player_id);
      if (player) { player.hp = d.hp; player.max_hp = d.max_hp; }
    });

    ws.on('player.mana_update', (data) => {
      const d = data as { player_id: string; mana: number; max_mana: number };
      if (this.store.localPlayer && d.player_id === this.store.localPlayer.id) {
        this.store.localPlayer.mana = d.mana;
        this.store.localPlayer.max_mana = d.max_mana;
      }
      const player = this.store.players.get(d.player_id);
      if (player) { player.mana = d.mana; player.max_mana = d.max_mana; }
    });

    // ─── Level / Death / Respawn ────────────────────────────
    ws.on('player.level_up', (data) => {
      const d = data as { player_id: string; level: number; new_stats: Record<string, number> };
      this.store.pendingLevelUps.push({
        player_id: d.player_id, level: d.level,
        new_stats: d.new_stats, timestamp: Date.now(),
      });
      if (this.store.localPlayer && d.player_id === this.store.localPlayer.id) {
        this.store.localPlayer.level = d.level;
      }
      const player = this.store.players.get(d.player_id);
      if (player) { player.level = d.level; }
    });

    ws.on('player.died', (data) => {
      const d = data as { entity_id: string; killer_id: string; respawn_at: number };
      this.store.pendingDeaths.push({ ...d, timestamp: Date.now() });
    });

    ws.on('player.respawn', (data) => {
      const d = data as { entity_id: string; x: number; y: number; hp: number; mana: number };
      this.store.pendingRespawns.push({ ...d, timestamp: Date.now() });
      if (this.store.localPlayer && d.entity_id === this.store.localPlayer.id) {
        this.store.localPlayer.x = d.x;
        this.store.localPlayer.y = d.y;
        this.store.localPlayer.hp = d.hp;
        this.store.localPlayer.mana = d.mana;
      }
    });

    // ─── Entities ───────────────────────────────────────────
    ws.on('entity.spawn', (data) => {
      const d = data as { entities: (MonsterData | NPCData)[] };
      for (const entity of d.entities) {
        this.store.entities.set(entity.id, entity);
        this.pushSnapshot(entity.id, {
          x: entity.x, y: entity.y,
          direction: entity.direction,
          speed: 0, timestamp: Date.now(),
        });
      }
    });

    ws.on('entity.despawn', (data) => {
      const d = data as { entity_ids: string[] };
      for (const id of d.entity_ids) {
        this.store.entities.delete(id);
        this.removeEntityBuffers(id);
      }
    });

    ws.on('entity.move', (data) => {
      const d = data as {
        entity_id: string; x: number; y: number;
        direction: Direction; speed?: number;
      };
      const entity = this.store.entities.get(d.entity_id);
      if (entity) {
        entity.x = d.x; entity.y = d.y; entity.direction = d.direction;
      }
      this.pushSnapshot(d.entity_id, {
        x: d.x, y: d.y,
        direction: d.direction,
        speed: d.speed ?? 0,
        timestamp: Date.now(),
      });
    });

    ws.on('entity.health_update', (data) => {
      const d = data as { entity_id: string; hp: number; max_hp: number };
      const entity = this.store.entities.get(d.entity_id);
      if (entity) { entity.hp = d.hp; entity.max_hp = d.max_hp; }
    });

    // ─── Combat ─────────────────────────────────────────────
    ws.on('combat.damage', (data) => {
      const d = data as {
        source_id: string; target_id: string; amount: number;
        damage_type: string; critical: boolean; blocked: number;
      };
      this.store.pendingDamage.push({ ...d, timestamp: Date.now() });
    });

    ws.on('combat.heal', (data) => {
      const d = data as { source_id: string; target_id: string; amount: number };
      this.store.pendingHeals.push({ ...d, timestamp: Date.now() });
    });

    ws.on('combat.ability_used', (data) => {
      const d = data as {
        caster_id: string; ability_id: string;
        target_id?: string; x?: number; y?: number; effects: string[];
      };
      this.store.pendingAbilityEffects.push({ ...d, timestamp: Date.now() });
    });

    ws.on('combat.buff_apply', (data) => {
      const d = data as { target_id: string; buff: ActiveBuff };
      this.store.pendingBuffs.push({
        target_id: d.target_id, buff: d.buff,
        action: 'apply', timestamp: Date.now(),
      });
    });

    ws.on('combat.buff_remove', (data) => {
      const d = data as { target_id: string; buff_id: string };
      this.store.pendingBuffs.push({
        target_id: d.target_id, buff_id: d.buff_id,
        action: 'remove', timestamp: Date.now(),
      });
    });

    // ─── Loot ───────────────────────────────────────────────
    ws.on('loot.drop', (data) => {
      const d = data as { corpse_id: string; items: ItemInstance[] };
      this.store.pendingLootDrops.push({
        corpse_id: d.corpse_id, items: d.items, timestamp: Date.now(),
      });
    });

    ws.on('loot.looted', () => { /* inventory update comes separately */ });

    // ─── Inventory / Equipment ──────────────────────────────
    ws.on('inventory.update', (data) => {
      const d = data as { slots: { index: number; item: ItemInstance | null }[] };
      if (!this.store.localPlayer) return;
      for (const slot of d.slots) {
        this.store.localPlayer.inventory[slot.index] = slot.item;
      }
    });

    ws.on('equipment.update', (data) => {
      const d = data as { slot: EquipmentSlot; item: ItemInstance | null };
      if (!this.store.localPlayer) return;
      this.store.localPlayer.equipment[d.slot] = d.item;
    });

    // ─── Chat ───────────────────────────────────────────────
    ws.on('chat.message', (data) => {
      const d = data as {
        channel: ChatChannel; sender_name: string;
        message: string; timestamp: number;
      };
      this.store.chatMessages.push({
        channel: d.channel, sender_name: d.sender_name,
        message: d.message, timestamp: d.timestamp,
      });
      if (this.store.chatMessages.length > 500) {
        this.store.chatMessages.splice(0, this.store.chatMessages.length - 500);
      }
    });

    ws.on('chat.system', (data) => {
      const d = data as { message: string; type: string; channel: string };
      this.store.chatMessages.push({
        channel: ChatChannel.SYSTEM, sender_name: 'System',
        message: d.message, timestamp: Date.now(),
      });
    });

    // ─── Quests ─────────────────────────────────────────────
    ws.on('quest.update', (data) => {
      const d = data as { quest_id: string; progress: QuestProgress };
      this.store.questLog.set(d.quest_id, d.progress);
    });

    ws.on('quest.completed', (data) => {
      const d = data as {
        quest_id: string; rewards: {
          experience: number; gold: number; items: ItemInstance[];
        };
      };
      this.store.notifications.push({
        type: 'quest_complete',
        message: `Quest completed! +${d.rewards.experience} XP, +${d.rewards.gold} gold`,
        timestamp: Date.now(),
        duration: 6000,
      });
    });

    // ─── World ──────────────────────────────────────────────
    ws.on('weather.update', (data) => {
      const d = data as { zone_id: string; weather: WeatherType; intensity: number };
      this.store.weather = d;
    });

    ws.on('time.update', (data) => {
      const d = data as { game_time: number; day_night: 'day' | 'night' };
      this.store.gameTime = d;
    });

    ws.on('zone.transition', (data) => {
      const d = data as { zone_id: string; spawn_x: number; spawn_y: number };
      this.store.zoneId = d.zone_id;
      if (this.store.localPlayer) {
        this.store.localPlayer.x = d.spawn_x;
        this.store.localPlayer.y = d.spawn_y;
      }
      // Clear entities from old zone
      this.store.entities.clear();
      this.store.interpolationBuffers.clear();
    });

    // ─── Notifications ──────────────────────────────────────
    ws.on('notification', (data) => {
      const d = data as { type: string; message: string; duration?: number };
      this.store.notifications.push({
        type: d.type, message: d.message,
        timestamp: Date.now(), duration: d.duration,
      });
    });

    ws.on('error', (data) => {
      const d = data as { code: string; message: string };
      this.store.notifications.push({
        type: 'error', message: d.message,
        timestamp: Date.now(), duration: 5000,
      });
    });
  }
}
