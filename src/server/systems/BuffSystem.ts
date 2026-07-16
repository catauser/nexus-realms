// ============================================================
// Nexus Realms — Buff System
// Tick buff durations, apply DoT/HoT effects, remove expired
// buffs, manage buff stacks.
// ============================================================

import { World, System } from '../ecs/World';
import { Logger } from '../utils/Logger';
import type { EntityStats } from '../../shared/types';

const logger = new Logger({ context: 'BuffSystem' });

/** Buff effect definition */
interface BuffEffect {
  stat: string;
  value: number;
  is_percentage: boolean;
}

/** Active buff on an entity */
interface ActiveBuff {
  buff_id: string;
  source_id: string;
  duration_remaining: number;
  max_duration: number;
  stacks: number;
  max_stacks: number;
  effects: BuffEffect[];
}

/** Buff component shape */
interface BuffComponent {
  active_buffs: ActiveBuff[];
  buff_tick_timer: number;
}

/** Health component for DoT/HoT */
interface Health {
  hp: number;
  max_hp: number;
  is_alive: boolean;
  last_damage_time: number;
}

/** Mana component */
interface Mana {
  mana: number;
  max_mana: number;
}

/**
 * Buff System — ticks all active buffs/debuffs each second.
 *
 * Priority: 70 (runs after Combat)
 *
 * Responsibilities:
 * - Tick buff durations (once per second)
 * - Apply DoT (damage over time) effects
 * - Apply HoT (heal over time) effects
 * - Remove expired buffs
 * - Manage buff stacks
 * - Mark stats dirty when buffs change
 */
export class BuffSystem implements System {
  public readonly name = 'BuffSystem';
  public readonly priority = 70;

  /** Tick interval in milliseconds (1 second) */
  private static readonly TICK_INTERVAL_MS = 1000;

  /** Registered buff definitions (buff_id → definition) */
  private buffDefinitions: Map<string, BuffDefinition> = new Map();

  /**
   * Register a buff definition.
   */
  public registerBuff(definition: BuffDefinition): void {
    this.buffDefinitions.set(definition.id, definition);
  }

  /**
   * Register multiple buff definitions.
   */
  public registerBuffs(definitions: BuffDefinition[]): void {
    for (const def of definitions) {
      this.registerBuff(def);
    }
    logger.info(`Registered ${definitions.length} buff definitions`);
  }

  public update(world: World, dt: number): void {
    const dtMs = dt * 1000;
    const entities = world.query(['Buff']);

    for (const entityId of entities) {
      const buffComp = world.getComponent<BuffComponent>(entityId, 'Buff');
      if (!buffComp || buffComp.active_buffs.length === 0) continue;

      // Accumulate tick timer
      buffComp.buff_tick_timer += dtMs;

      // Process ticks (may tick multiple times if lagging behind)
      while (buffComp.buff_tick_timer >= BuffSystem.TICK_INTERVAL_MS) {
        buffComp.buff_tick_timer -= BuffSystem.TICK_INTERVAL_MS;
        this.processTick(world, entityId, buffComp);
      }
    }
  }

  /**
   * Process one second of buff ticks for an entity.
   */
  private processTick(world: World, entityId: string, buffComp: BuffComponent): void {
    const expiredBuffs: string[] = [];
    const health = world.getComponent<Health>(entityId, 'Health');
    const mana = world.getComponent<Mana>(entityId, 'Mana');

    for (const buff of buffComp.active_buffs) {
      // Decrease duration
      buff.duration_remaining -= BuffSystem.TICK_INTERVAL_MS;

      // Check for expiration
      if (buff.duration_remaining <= 0) {
        expiredBuffs.push(buff.buff_id);
        continue;
      }

      // Look up buff definition for DoT/HoT effects
      const def = this.buffDefinitions.get(buff.buff_id);
      if (!def) continue;

      // Apply DoT (damage over time)
      if (def.dot && health && health.is_alive) {
        const dotDamage = def.dot.damage_per_second * buff.stacks;
        health.hp = Math.max(0, health.hp - dotDamage);
        health.last_damage_time = Date.now();
        world.markDirty(entityId, 'Health');

        // Check death from DoT
        if (health.hp <= 0) {
          health.hp = 0;
          health.is_alive = false;
          health.death_time = Date.now();
        }
      }

      // Apply HoT (heal over time)
      if (def.hot && health && health.is_alive) {
        const hotAmount = def.hot.heal_per_second * buff.stacks;
        health.hp = Math.min(health.max_hp, health.hp + hotAmount);
        world.markDirty(entityId, 'Health');
      }

      // Apply mana regeneration over time
      if (def.mana_regen && mana) {
        const regenAmount = def.mana_regen * buff.stacks;
        mana.mana = Math.min(mana.max_mana, mana.mana + regenAmount);
        world.markDirty(entityId, 'Mana');
      }
    }

    // Remove expired buffs
    for (const buffId of expiredBuffs) {
      this.removeBuff(world, entityId, buffComp, buffId);
    }
  }

  /**
   * Apply a buff to an entity.
   * @returns true if the buff was applied or refreshed
   */
  public applyBuff(
    world: World,
    entityId: string,
    buffId: string,
    sourceId: string,
    durationOverride?: number
  ): boolean {
    const buffComp = world.getComponent<BuffComponent>(entityId, 'Buff');
    if (!buffComp) return false;

    const def = this.buffDefinitions.get(buffId);
    const duration = durationOverride ?? def?.duration_ms ?? 10000;
    const maxStacks = def?.max_stacks ?? 1;

    // Check if buff already exists
    const existing = buffComp.active_buffs.find(b => b.buff_id === buffId);
    if (existing) {
      // Refresh duration
      existing.duration_remaining = duration;
      // Stack if allowed
      if (existing.stacks < maxStacks) {
        existing.stacks++;
      }
    } else {
      // Apply new buff
      const newBuff: ActiveBuff = {
        buff_id: buffId,
        source_id: sourceId,
        duration_remaining: duration,
        max_duration: duration,
        stacks: 1,
        max_stacks: maxStacks,
        effects: def?.stat_effects ?? [],
      };
      buffComp.active_buffs.push(newBuff);
    }

    world.markDirty(entityId, 'Buff');
    return true;
  }

  /**
   * Remove a specific buff from an entity.
   */
  public removeBuff(world: World, entityId: string, buffComp: BuffComponent, buffId: string): boolean {
    const idx = buffComp.active_buffs.findIndex(b => b.buff_id === buffId);
    if (idx < 0) return false;

    buffComp.active_buffs.splice(idx, 1);
    world.markDirty(entityId, 'Buff');

    // Mark stats dirty (buff stat effects removed)
    if (world.hasComponent(entityId, 'Stats')) {
      world.markDirty(entityId, 'Stats');
    }

    return true;
  }

  /**
   * Remove all buffs from an entity (e.g., on death).
   */
  public removeAllBuffs(world: World, entityId: string): void {
    const buffComp = world.getComponent<BuffComponent>(entityId, 'Buff');
    if (!buffComp) return;

    buffComp.active_buffs = [];
    buffComp.buff_tick_timer = 0;
    world.markDirty(entityId, 'Buff');

    if (world.hasComponent(entityId, 'Stats')) {
      world.markDirty(entityId, 'Stats');
    }
  }

  /**
   * Remove all debuffs (buffs with negative effects) from an entity.
   */
  public removeDebuffs(world: World, entityId: string): void {
    const buffComp = world.getComponent<BuffComponent>(entityId, 'Buff');
    if (!buffComp) return;

    const debuffIds: string[] = [];
    for (const buff of buffComp.active_buffs) {
      const def = this.buffDefinitions.get(buff.buff_id);
      if (def?.is_debuff) {
        debuffIds.push(buff.buff_id);
      }
    }

    for (const id of debuffIds) {
      this.removeBuff(world, entityId, buffComp, id);
    }
  }

  /**
   * Check if an entity has a specific buff.
   */
  public hasBuff(world: World, entityId: string, buffId: string): boolean {
    const buffComp = world.getComponent<BuffComponent>(entityId, 'Buff');
    if (!buffComp) return false;
    return buffComp.active_buffs.some(b => b.buff_id === buffId);
  }

  /**
   * Get the number of stacks of a specific buff.
   */
  public getBuffStacks(world: World, entityId: string, buffId: string): number {
    const buffComp = world.getComponent<BuffComponent>(entityId, 'Buff');
    if (!buffComp) return 0;
    const buff = buffComp.active_buffs.find(b => b.buff_id === buffId);
    return buff?.stacks ?? 0;
  }

  /**
   * Calculate total stat bonuses from all active buffs.
   * Returns flat bonuses and percentage multipliers.
   */
  public calculateBuffStats(world: World, entityId: string): {
    flatBonuses: Partial<EntityStats>;
    percentageMultipliers: Partial<Record<keyof EntityStats, number>>;
  } {
    const flatBonuses: Partial<EntityStats> = {};
    const percentageMultipliers: Partial<Record<keyof EntityStats, number>> = {};

    const buffComp = world.getComponent<BuffComponent>(entityId, 'Buff');
    if (!buffComp) return { flatBonuses, percentageMultipliers };

    for (const buff of buffComp.active_buffs) {
      for (const effect of buff.effects) {
        const stat = effect.stat as keyof EntityStats;
        const value = effect.value * buff.stacks;

        if (effect.is_percentage) {
          percentageMultipliers[stat] = (percentageMultipliers[stat] ?? 0) + value;
        } else {
          flatBonuses[stat] = (flatBonuses[stat] ?? 0) + value;
        }
      }
    }

    return { flatBonuses, percentageMultipliers };
  }
}

/** Buff definition loaded from game data */
export interface BuffDefinition {
  id: string;
  name: string;
  description: string;
  duration_ms: number;
  max_stacks: number;
  is_debuff: boolean;
  icon: string;
  stat_effects: BuffEffect[];
  dot?: {
    damage_per_second: number;
    damage_type: string;
  };
  hot?: {
    heal_per_second: number;
  };
  mana_regen?: number;
}
