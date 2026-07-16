// ============================================================
// Nexus Realms — Combat System
// Process ability usage, damage pipeline, threat generation,
// cooldown management, buff/debuff application, death handling.
// ============================================================

import { World, System } from '../ecs/World';
import { Logger } from '../utils/Logger';
import * as CombatCalc from '../world/CombatCalculator';
import type { DamageType, EntityStats } from '../../shared/types';

const logger = new Logger({ context: 'CombatSystem' });

/** Health component */
interface Health {
  hp: number;
  max_hp: number;
  regen_rate: number;
  last_damage_time: number;
  is_alive: boolean;
  death_time: number;
}

/** Mana component */
interface Mana {
  mana: number;
  max_mana: number;
  regen_rate: number;
  resource_type: 'mana' | 'energy' | 'rage' | 'focus';
}

/** Combat component */
interface Combat {
  target_id: string | null;
  current_ability: string | null;
  ability_start_time: number;
  ability_channel_end: number;
  auto_attack_timer: number;
  auto_attack_speed: number;
  weapon_damage_min: number;
  weapon_damage_max: number;
  in_combat: boolean;
  combat_end_time: number;
  threat_table: Map<string, number>;
}

/** Buff component */
interface BuffComponent {
  active_buffs: Array<{
    buff_id: string;
    source_id: string;
    duration_remaining: number;
    max_duration: number;
    stacks: number;
    max_stacks: number;
    effects: Array<{ stat: string; value: number; is_percentage: boolean }>;
  }>;
  buff_tick_timer: number;
}

/** Ability definition (loaded from data) */
interface AbilityDefinition {
  id: string;
  name: string;
  type: string;
  damage_type: DamageType;
  base_damage: number;
  scaling_factor: number;
  mana_cost: number;
  cooldown_ms: number;
  range: number;
  cast_time_ms: number;
  target_type: string;
  threat_multiplier: number;
  buff_id?: string;
  heal_base?: number;
  heal_scaling?: number;
}

/**
 * Combat System — processes all combat actions each tick.
 *
 * Priority: 60 (runs after Movement)
 *
 * Responsibilities:
 * - Process auto-attacks
 * - Execute abilities (damage, heal, buff)
 * - Apply damage calculations (hit, dodge, parry, block, crit, resist)
 * - Manage cooldowns
 * - Handle threat generation
 * - Process death and trigger respawn
 */
export class CombatSystem implements System {
  public readonly name = 'CombatSystem';
  public readonly priority = 60;

  /** Ability definitions (loaded at startup) */
  private abilities: Map<string, AbilityDefinition> = new Map();

  /** Combat end timeout (5 seconds after last action) */
  private static readonly COMBAT_END_TIMEOUT = 5000;

  /** Death respawn delay */
  private static readonly RESPAWN_DELAY = 5000;

  /**
   * Register an ability definition.
   */
  public registerAbility(ability: AbilityDefinition): void {
    this.abilities.set(ability.id, ability);
  }

  /**
   * Register multiple ability definitions.
   */
  public registerAbilities(abilities: AbilityDefinition[]): void {
    for (const a of abilities) {
      this.registerAbility(a);
    }
    logger.info(`Registered ${abilities.length} abilities`);
  }

  public update(world: World, dt: number): void {
    const now = Date.now();
    const dtMs = dt * 1000;

    // Process all entities with combat components
    const combatEntities = world.query(['Combat', 'Health', 'Stats']);

    for (const entityId of combatEntities) {
      const combat = world.getComponent<Combat>(entityId, 'Combat')!;
      const health = world.getComponent<Health>(entityId, 'Health')!;

      // Skip dead entities
      if (!health.is_alive) {
        // Check for respawn
        if (health.death_time > 0 && now - health.death_time >= CombatSystem.RESPAWN_DELAY) {
          this.handleRespawn(world, entityId, health);
        }
        continue;
      }

      // Update combat timeout
      if (combat.in_combat && now > combat.combat_end_time) {
        combat.in_combat = false;
        combat.threat_table.clear();
        combat.target_id = null;
      }

      // Process auto-attack
      if (combat.target_id && combat.auto_attack_timer <= 0) {
        this.processAutoAttack(world, entityId, combat, health, now);
        combat.auto_attack_timer = combat.auto_attack_speed;
      } else {
        combat.auto_attack_timer -= dtMs;
      }

      // Process ability cast
      if (combat.current_ability && combat.ability_channel_end > 0 && now >= combat.ability_channel_end) {
        this.processAbilityCast(world, entityId, combat, health, now);
      }
    }

    // Health regeneration
    this.processRegen(world, dt);
  }

  // ─── Auto Attack ──────────────────────────────────────────

  /**
   * Process a basic auto-attack.
   */
  private processAutoAttack(
    world: World,
    attackerId: string,
    combat: Combat,
    attackerHealth: Health,
    now: number
  ): void {
    const targetId = combat.target_id;
    if (!targetId) return;

    const targetHealth = world.getComponent<Health>(targetId, 'Health');
    const targetStats = world.getComponent<EntityStats>(targetId, 'Stats');
    const attackerStats = world.getComponent<EntityStats>(attackerId, 'Stats');

    if (!targetHealth || !targetStats || !attackerStats) return;
    if (!targetHealth.is_alive) {
      combat.target_id = null;
      return;
    }

    // Check range (simplified — uses distance)
    const attackerPos = world.getComponent<{ x: number; y: number }>(attackerId, 'Position');
    const targetPos = world.getComponent<{ x: number; y: number }>(targetId, 'Position');
    if (!attackerPos || !targetPos) return;

    const dx = attackerPos.x - targetPos.x;
    const dy = attackerPos.y - targetPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 64) {
      // Out of melee range
      return;
    }

    // Roll weapon damage
    const weaponDmg = CombatCalc.rollWeaponDamage(combat.weapon_damage_min, combat.weapon_damage_max);

    // Calculate damage through pipeline
    const result = CombatCalc.calculateDamage(
      attackerStats,
      targetStats,
      weaponDmg,
      0.5, // auto-attack scaling
      'physical' as DamageType
    );

    // Apply damage
    if (!result.missed && !result.dodged && !result.parried) {
      this.applyDamage(world, attackerId, targetId, result, 'melee', now);
    }

    // Generate threat
    if (!result.missed && !result.dodged) {
      const threat = CombatCalc.calculateThreat(result.damage, 0, 1.0);
      CombatCalc.updateThreatTable(combat.threat_table, targetId, threat.threat);
    }

    // Enter combat for both entities
    this.enterCombat(world, attackerId, combat, now);
    const targetCombat = world.getComponent<Combat>(targetId, 'Combat');
    if (targetCombat) {
      this.enterCombat(world, targetId, targetCombat, now);
    }
  }

  // ─── Ability Processing ───────────────────────────────────

  /**
   * Initiate an ability cast.
   * @returns true if the ability was successfully started
   */
  public startAbility(
    world: World,
    casterId: string,
    abilityId: string,
    targetId?: string,
    targetX?: number,
    targetY?: number
  ): { success: boolean; error?: string } {
    const combat = world.getComponent<Combat>(casterId, 'Combat');
    const health = world.getComponent<Health>(casterId, 'Health');
    const stats = world.getComponent<EntityStats>(casterId, 'Stats');
    const mana = world.getComponent<Mana>(casterId, 'Mana');

    if (!combat || !health || !stats) {
      return { success: false, error: 'Entity missing required components' };
    }

    if (!health.is_alive) {
      return { success: false, error: 'Cannot cast while dead' };
    }

    // Look up ability
    const ability = this.abilities.get(abilityId);
    if (!ability) {
      return { success: false, error: `Unknown ability: ${abilityId}` };
    }

    // Check cooldown
    const cooldownKey = `cd_${abilityId}`;
    const cooldowns = world.getComponent<Map<string, number>>(casterId, 'Cooldowns');
    if (cooldowns) {
      const cdEnd = cooldowns.get(cooldownKey) ?? 0;
      if (Date.now() < cdEnd) {
        return { success: false, error: 'Ability is on cooldown' };
      }
    }

    // Check mana/resource
    if (mana && ability.mana_cost > 0) {
      if (mana.mana < ability.mana_cost) {
        return { success: false, error: 'Not enough mana' };
      }
      mana.mana -= ability.mana_cost;
      world.markDirty(casterId, 'Mana');
    }

    // Set up cast
    combat.current_ability = abilityId;
    combat.target_id = targetId ?? null;
    combat.ability_start_time = Date.now();
    combat.ability_channel_end = Date.now() + ability.cast_time_ms;

    // Instant cast
    if (ability.cast_time_ms <= 0) {
      this.processAbilityCast(world, casterId, combat, health, Date.now());
    }

    return { success: true };
  }

  /**
   * Process the completion of an ability cast.
   */
  private processAbilityCast(
    world: World,
    casterId: string,
    combat: Combat,
    casterHealth: Health,
    now: number
  ): void {
    const abilityId = combat.current_ability;
    if (!abilityId) return;

    const ability = this.abilities.get(abilityId);
    if (!ability) {
      combat.current_ability = null;
      return;
    }

    const casterStats = world.getComponent<EntityStats>(casterId, 'Stats');
    if (!casterStats) return;

    const casterPos = world.getComponent<{ x: number; y: number }>(casterId, 'Position');
    if (!casterPos) return;

    // Handle different ability types
    switch (ability.type) {
      case 'damage':
      case 'aoe':
        this.processDamageAbility(world, casterId, ability, casterStats, casterPos, combat, now);
        break;
      case 'heal':
        this.processHealAbility(world, casterId, ability, casterStats, combat, now);
        break;
      case 'buff':
      case 'debuff':
        this.processBuffAbility(world, casterId, ability, combat, now);
        break;
    }

    // Start cooldown
    const cooldowns = world.getComponent<Map<string, number>>(casterId, 'Cooldowns');
    if (cooldowns) {
      cooldowns.set(`cd_${abilityId}`, now + ability.cooldown_ms);
    }

    // Clear cast
    combat.current_ability = null;
    combat.ability_channel_end = 0;

    // Enter combat
    this.enterCombat(world, casterId, combat, now);
  }

  /**
   * Process a damage ability.
   */
  private processDamageAbility(
    world: World,
    casterId: string,
    ability: AbilityDefinition,
    casterStats: EntityStats,
    casterPos: { x: number; y: number },
    combat: Combat,
    now: number
  ): void {
    const targetId = combat.target_id;
    if (!targetId) return;

    const targetStats = world.getComponent<EntityStats>(targetId, 'Stats');
    const targetHealth = world.getComponent<Health>(targetId, 'Health');
    if (!targetStats || !targetHealth || !targetHealth.is_alive) return;

    // Calculate damage
    const result = CombatCalc.calculateDamage(
      casterStats,
      targetStats,
      ability.base_damage,
      ability.scaling_factor,
      ability.damage_type
    );

    // Apply damage
    if (!result.missed && !result.dodged && !result.parried) {
      this.applyDamage(world, casterId, targetId, result, ability.id, now);
    }

    // Generate threat
    const threatResult = CombatCalc.calculateThreat(
      result.damage,
      0,
      ability.threat_multiplier
    );
    CombatCalc.updateThreatTable(combat.threat_table, targetId, threatResult.threat);

    // Apply buff if defined
    if (ability.buff_id) {
      this.applyBuff(world, targetId, ability.buff_id, casterId);
    }

    // AoE — find additional targets
    if (ability.type === 'aoe') {
      const nearbyEntities = world.queryInRange(casterPos.x, casterPos.y, ability.range, ['Health', 'Stats']);
      for (const aoeTargetId of nearbyEntities) {
        if (aoeTargetId === targetId || aoeTargetId === casterId) continue;
        const aoeHealth = world.getComponent<Health>(aoeTargetId, 'Health');
        const aoeStats = world.getComponent<EntityStats>(aoeTargetId, 'Stats');
        if (!aoeHealth || !aoeHealth.is_alive || !aoeStats) continue;

        const aoeResult = CombatCalc.calculateDamage(
          casterStats,
          aoeStats,
          ability.base_damage * 0.7, // AoE does 70% damage to secondary targets
          ability.scaling_factor,
          ability.damage_type
        );

        if (!aoeResult.missed && !aoeResult.dodged && !aoeResult.parried) {
          this.applyDamage(world, casterId, aoeTargetId, aoeResult, ability.id, now);
        }
      }
    }
  }

  /**
   * Process a heal ability.
   */
  private processHealAbility(
    world: World,
    casterId: string,
    ability: AbilityDefinition,
    casterStats: EntityStats,
    combat: Combat,
    now: number
  ): void {
    const targetId = combat.target_id ?? casterId; // Self-heal if no target

    const targetHealth = world.getComponent<Health>(targetId, 'Health');
    if (!targetHealth || !targetHealth.is_alive) return;

    const healResult = CombatCalc.calculateHeal(
      casterStats,
      ability.heal_base ?? 0,
      ability.heal_scaling ?? 0.5,
      1.0,
      targetHealth.hp,
      targetHealth.max_hp
    );

    // Apply heal
    targetHealth.hp = Math.min(targetHealth.max_hp, targetHealth.hp + healResult.amount);
    world.markDirty(targetId, 'Health');

    // Broadcast heal event
    this.broadcastCombatEvent(world, casterId, 'combat.heal', {
      source_id: casterId,
      target_id: targetId,
      amount: healResult.amount,
      ability_id: ability.id,
      critical: healResult.critical,
      new_hp: targetHealth.hp,
      max_hp: targetHealth.max_hp,
    });
  }

  /**
   * Process a buff/debuff ability.
   */
  private processBuffAbility(
    world: World,
    casterId: string,
    ability: AbilityDefinition,
    combat: Combat,
    now: number
  ): void {
    const targetId = combat.target_id ?? casterId;
    if (ability.buff_id) {
      this.applyBuff(world, targetId, ability.buff_id, casterId);
    }
  }

  // ─── Damage Application ───────────────────────────────────

  /**
   * Apply damage result to a target. Handles death.
   */
  private applyDamage(
    world: World,
    sourceId: string,
    targetId: string,
    result: CombatCalc.DamageResult,
    abilityId: string,
    now: number
  ): void {
    const targetHealth = world.getComponent<Health>(targetId, 'Health');
    if (!targetHealth || !targetHealth.is_alive) return;

    // Apply damage
    targetHealth.hp -= result.damage;
    targetHealth.last_damage_time = now;

    // Broadcast damage event
    this.broadcastCombatEvent(world, targetId, 'combat.damage', {
      source_id: sourceId,
      target_id: targetId,
      amount: result.damage,
      damage_type: result.damageType,
      critical: result.critical,
      blocked: result.blocked,
      ability_id: abilityId,
      remaining_hp: Math.max(0, targetHealth.hp),
      max_hp: targetHealth.max_hp,
    });

    // Check for death
    if (targetHealth.hp <= 0) {
      targetHealth.hp = 0;
      targetHealth.is_alive = false;
      targetHealth.death_time = now;
      world.markDirty(targetId, 'Health');

      // Broadcast death
      this.broadcastCombatEvent(world, targetId, 'player.died', {
        entity_id: targetId,
        killer_id: sourceId,
        respawn_at: now + CombatSystem.RESPAWN_DELAY,
      });

      logger.info('Entity died', { targetId, killerId: sourceId, abilityId });
    } else {
      world.markDirty(targetId, 'Health');
    }
  }

  // ─── Buff Application ─────────────────────────────────────

  /**
   * Apply a buff to an entity.
   */
  private applyBuff(world: World, targetId: string, buffId: string, sourceId: string): void {
    const buffs = world.getComponent<BuffComponent>(targetId, 'Buff');
    if (!buffs) return;

    // Check if buff already exists (refresh or stack)
    const existing = buffs.active_buffs.find(b => b.buff_id === buffId);
    if (existing) {
      // Refresh duration
      existing.duration_remaining = existing.max_duration;
      // Stack if allowed
      if (existing.stacks < existing.max_stacks) {
        existing.stacks++;
      }
    } else {
      // Apply new buff
      buffs.active_buffs.push({
        buff_id: buffId,
        source_id: sourceId,
        duration_remaining: 10000, // Default 10s — should come from buff definition
        max_duration: 10000,
        stacks: 1,
        max_stacks: 3,
        effects: [], // Loaded from buff definition
      });
    }

    world.markDirty(targetId, 'Buff');

    // Broadcast buff apply
    this.broadcastCombatEvent(world, targetId, 'combat.buff_apply', {
      target_id: targetId,
      buff_id: buffId,
      source_id: sourceId,
    });
  }

  // ─── Combat State ─────────────────────────────────────────

  /**
   * Put an entity into combat state.
   */
  private enterCombat(world: World, entityId: string, combat: Combat, now: number): void {
    combat.in_combat = true;
    combat.combat_end_time = now + CombatSystem.COMBAT_END_TIMEOUT;
  }

  /**
   * Handle entity respawn.
   */
  private handleRespawn(world: World, entityId: string, health: Health): void {
    health.hp = health.max_hp;
    health.is_alive = true;
    health.death_time = 0;
    world.markDirty(entityId, 'Health');

    // Reset mana
    const mana = world.getComponent<Mana>(entityId, 'Mana');
    if (mana) {
      mana.mana = mana.max_mana;
      world.markDirty(entityId, 'Mana');
    }

    // Broadcast respawn
    const pos = world.getComponent<{ x: number; y: number }>(entityId, 'Position');
    this.broadcastCombatEvent(world, entityId, 'player.respawn', {
      entity_id: entityId,
      x: pos?.x ?? 0,
      y: pos?.y ?? 0,
      hp: health.hp,
      mana: mana?.mana ?? 0,
    });

    logger.info('Entity respawned', { entityId });
  }

  // ─── Regeneration ─────────────────────────────────────────

  /**
   * Process health and mana regeneration.
   */
  private processRegen(world: World, dt: number): void {
    const entities = world.query(['Health']);
    const now = Date.now();

    for (const entityId of entities) {
      const health = world.getComponent<Health>(entityId, 'Health')!;
      if (!health.is_alive) continue;

      // HP regen (paused for 5s after taking damage)
      if (health.regen_rate > 0 && now - health.last_damage_time > 5000) {
        const hpRegen = health.regen_rate * dt;
        if (health.hp < health.max_hp) {
          health.hp = Math.min(health.max_hp, health.hp + hpRegen);
          world.markDirty(entityId, 'Health');
        }
      }

      // Mana regen
      const mana = world.getComponent<Mana>(entityId, 'Mana');
      if (mana && mana.regen_rate > 0 && mana.mana < mana.max_mana) {
        const manaRegen = mana.regen_rate * dt;
        mana.mana = Math.min(mana.max_mana, mana.mana + manaRegen);
        world.markDirty(entityId, 'Mana');
      }
    }
  }

  // ─── Broadcasting ─────────────────────────────────────────

  /**
   * Broadcast a combat event to nearby players.
   */
  private broadcastCombatEvent(
    world: World,
    entityId: string,
    type: string,
    data: Record<string, unknown>
  ): void {
    // This would use the ZoneManager to broadcast to nearby players
    // For now, mark the event for the NetworkSystem to pick up
    logger.debug(`Combat event: ${type}`, { entityId });
  }

  // ─── Threat Management ────────────────────────────────────

  /**
   * Get the highest-threat target for an entity.
   */
  public getAggroTarget(world: World, entityId: string): string | null {
    const combat = world.getComponent<Combat>(entityId, 'Combat');
    if (!combat) return null;
    return CombatCalc.getHighestThreat(combat.threat_table);
  }

  /**
   * Clear combat state for an entity.
   */
  public clearCombat(world: World, entityId: string): void {
    const combat = world.getComponent<Combat>(entityId, 'Combat');
    if (!combat) return;
    combat.in_combat = false;
    combat.target_id = null;
    combat.threat_table.clear();
    combat.current_ability = null;
  }
}
