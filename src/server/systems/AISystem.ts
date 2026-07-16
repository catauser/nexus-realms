// ============================================================
// Nexus Realms — AI System
// Monster AI state machine: idle, patrol, chase, attack, retreat.
// Aggro detection, target selection, leash mechanics, boss phases.
// ============================================================

import { World, System } from '../ecs/World';
import { Logger } from '../utils/Logger';
import * as CombatCalc from '../world/CombatCalculator';

const logger = new Logger({ context: 'AISystem' });

/** AI component shape */
interface AI {
  behavior: 'passive' | 'aggressive' | 'defensive' | 'boss' | 'patrol' | 'guard';
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'retreat' | 'dead';
  aggro_range: number;
  leash_range: number;
  spawn_x: number;
  spawn_y: number;
  patrol_points: { x: number; y: number }[];
  current_patrol_index: number;
  patrol_wait_time: number;
  patrol_wait_remaining: number;
  target_id: string | null;
  ability_cooldowns: Map<string, number>;
  boss_phase: number;
  call_for_help_range: number;
  threat_table: Map<string, number>;
  last_state_change: number;
}

/** Position component */
interface Position {
  x: number;
  y: number;
  zone_id: string;
  direction: string;
}

/** Health component */
interface Health {
  hp: number;
  max_hp: number;
  is_alive: boolean;
}

/** Movement component */
interface Movement {
  move_command: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  current_path_index: number;
  is_pathfinding: boolean;
  input_seq: number;
}

/** Combat component */
interface Combat {
  target_id: string | null;
  in_combat: boolean;
  combat_end_time: number;
  threat_table: Map<string, number>;
  auto_attack_timer: number;
  auto_attack_speed: number;
}

/** Velocity component */
interface Velocity {
  vx: number;
  vy: number;
  speed: number;
  speed_multiplier: number;
  is_moving: boolean;
}

/**
 * AI System — runs monster and NPC AI state machines.
 *
 * Priority: 40 (runs before Movement and Combat)
 *
 * State machine:
 * - idle → patrol (timer) / chase (aggro detected)
 * - patrol → idle (end of patrol) / chase (aggro)
 * - chase → attack (in range) / idle (leash)
 * - attack → chase (out of range) / retreat (low HP) / idle (target dead)
 * - retreat → idle (returned to spawn, HP > 50%)
 * - any → dead (HP <= 0)
 */
export class AISystem implements System {
  public readonly name = 'AISystem';
  public readonly priority = 40;

  /** Minimum time between state changes (ms) to prevent thrashing */
  private static readonly STATE_CHANGE_COOLDOWN = 500;

  /** Time to wait at each patrol point (ms) */
  private static readonly PATROL_WAIT_TIME = 3000;

  /** HP percentage threshold to trigger retreat */
  private static readonly RETREAT_HP_PERCENT = 0.2;

  /** HP percentage to stop retreating and re-engage */
  private static readonly REENGAGE_HP_PERCENT = 0.5;

  public update(world: World, dt: number): void {
    const now = Date.now();
    const aiEntities = world.query(['AI', 'Position', 'Health']);

    for (const entityId of aiEntities) {
      const ai = world.getComponent<AI>(entityId, 'AI')!;
      const pos = world.getComponent<Position>(entityId, 'Position')!;
      const health = world.getComponent<Health>(entityId, 'Health')!;

      // Skip dead entities
      if (!health.is_alive) {
        if (ai.state !== 'dead') {
          this.changeState(ai, 'dead', now);
        }
        continue;
      }

      // Respawn state → back to idle
      if (ai.state === 'dead') {
        this.changeState(ai, 'idle', now);
      }

      // State change cooldown
      if (now - ai.last_state_change < AISystem.STATE_CHANGE_COOLDOWN) continue;

      // Run state machine
      switch (ai.state) {
        case 'idle':
          this.processIdle(world, entityId, ai, pos, health, now);
          break;
        case 'patrol':
          this.processPatrol(world, entityId, ai, pos, health, now);
          break;
        case 'chase':
          this.processChase(world, entityId, ai, pos, health, now);
          break;
        case 'attack':
          this.processAttack(world, entityId, ai, pos, health, now);
          break;
        case 'retreat':
          this.processRetreat(world, entityId, ai, pos, health, now);
          break;
      }

      // Boss phase check
      if (ai.behavior === 'boss') {
        this.checkBossPhase(world, entityId, ai, health);
      }
    }
  }

  // ─── State Processors ─────────────────────────────────────

  /**
   * IDLE state: Look for aggro targets or start patrol.
   */
  private processIdle(
    world: World,
    entityId: string,
    ai: AI,
    pos: Position,
    health: Health,
    now: number
  ): void {
    // Check for aggro targets
    if (ai.behavior === 'aggressive' || ai.behavior === 'boss') {
      const target = this.findAggroTarget(world, entityId, pos, ai.aggro_range);
      if (target) {
        ai.target_id = target;
        this.changeState(ai, 'chase', now);
        return;
      }
    }

    // Start patrol if patrol points exist
    if (ai.patrol_points.length > 0 && ai.behavior !== 'guard') {
      ai.patrol_wait_remaining -= 50; // Approximate tick delta
      if (ai.patrol_wait_remaining <= 0) {
        this.changeState(ai, 'patrol', now);
      }
    }
  }

  /**
   * PATROL state: Move along patrol points.
   */
  private processPatrol(
    world: World,
    entityId: string,
    ai: AI,
    pos: Position,
    health: Health,
    now: number
  ): void {
    // Check for aggro
    if (ai.behavior === 'aggressive' || ai.behavior === 'boss') {
      const target = this.findAggroTarget(world, entityId, pos, ai.aggro_range);
      if (target) {
        ai.target_id = target;
        this.changeState(ai, 'chase', now);
        return;
      }
    }

    // Move to current patrol point
    const patrolPoint = ai.patrol_points[ai.current_patrol_index];
    if (!patrolPoint) {
      this.changeState(ai, 'idle', now);
      return;
    }

    const dx = patrolPoint.x - pos.x;
    const dy = patrolPoint.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      // Reached patrol point
      ai.current_patrol_index = (ai.current_patrol_index + 1) % ai.patrol_points.length;
      ai.patrol_wait_remaining = AISystem.PATROL_WAIT_TIME;
      this.changeState(ai, 'idle', now);
      return;
    }

    // Move toward patrol point
    const movement = world.getComponent<Movement>(entityId, 'Movement');
    if (movement) {
      movement.move_command = { x: patrolPoint.x, y: patrolPoint.y };
    }
  }

  /**
   * CHASE state: Move toward target.
   */
  private processChase(
    world: World,
    entityId: string,
    ai: AI,
    pos: Position,
    health: Health,
    now: number
  ): void {
    // Validate target
    if (!ai.target_id || !this.isValidTarget(world, ai.target_id)) {
      ai.target_id = null;
      this.changeState(ai, 'idle', now);
      return;
    }

    const targetPos = world.getComponent<Position>(ai.target_id, 'Position');
    if (!targetPos || targetPos.zone_id !== pos.zone_id) {
      ai.target_id = null;
      this.changeState(ai, 'idle', now);
      return;
    }

    // Check leash range
    const distFromSpawn = this.distance(pos.x, pos.y, ai.spawn_x, ai.spawn_y);
    if (distFromSpawn > ai.leash_range) {
      // Leash — return to spawn
      ai.target_id = null;
      this.leashToSpawn(world, entityId, ai, pos);
      return;
    }

    // Check distance to target
    const distToTarget = this.distance(pos.x, pos.y, targetPos.x, targetPos.y);

    if (distToTarget <= 48) {
      // In attack range
      this.changeState(ai, 'attack', now);
      return;
    }

    // Move toward target
    const movement = world.getComponent<Movement>(entityId, 'Movement');
    if (movement) {
      movement.move_command = { x: targetPos.x, y: targetPos.y };
    }
  }

  /**
   * ATTACK state: Auto-attack the target.
   */
  private processAttack(
    world: World,
    entityId: string,
    ai: AI,
    pos: Position,
    health: Health,
    now: number
  ): void {
    // Validate target
    if (!ai.target_id || !this.isValidTarget(world, ai.target_id)) {
      ai.target_id = null;
      this.changeState(ai, 'idle', now);
      return;
    }

    const targetPos = world.getComponent<Position>(ai.target_id, 'Position');
    const targetHealth = world.getComponent<Health>(ai.target_id, 'Health');

    if (!targetPos || !targetHealth || !targetHealth.is_alive) {
      ai.target_id = null;
      this.changeState(ai, 'idle', now);
      return;
    }

    // Check if target moved out of range
    const dist = this.distance(pos.x, pos.y, targetPos.x, targetPos.y);
    if (dist > 64) {
      this.changeState(ai, 'chase', now);
      return;
    }

    // Check for retreat (low HP)
    const hpPercent = health.hp / health.max_hp;
    if (hpPercent < AISystem.RETREAT_HP_PERCENT && ai.behavior !== 'boss') {
      this.changeState(ai, 'retreat', now);
      return;
    }

    // Use highest threat target
    const highestThreat = CombatCalc.getHighestThreat(ai.threat_table);
    if (highestThreat && highestThreat !== ai.target_id) {
      ai.target_id = highestThreat;
    }

    // Set combat target
    const combat = world.getComponent<Combat>(entityId, 'Combat');
    if (combat) {
      combat.target_id = ai.target_id;
      combat.in_combat = true;
      combat.combat_end_time = now + 5000;
    }
  }

  /**
   * RETREAT state: Move back to spawn point.
   */
  private processRetreat(
    world: World,
    entityId: string,
    ai: AI,
    pos: Position,
    health: Health,
    now: number
  ): void {
    const distToSpawn = this.distance(pos.x, pos.y, ai.spawn_x, ai.spawn_y);

    if (distToSpawn < 10) {
      // Reached spawn
      const hpPercent = health.hp / health.max_hp;
      if (hpPercent > AISystem.REENGAGE_HP_PERCENT) {
        this.changeState(ai, 'idle', now);
      }
      // Stay at spawn and regen
      return;
    }

    // Move toward spawn
    const movement = world.getComponent<Movement>(entityId, 'Movement');
    if (movement) {
      movement.move_command = { x: ai.spawn_x, y: ai.spawn_y };
    }

    // Clear combat
    const combat = world.getComponent<Combat>(entityId, 'Combat');
    if (combat) {
      combat.target_id = null;
      combat.in_combat = false;
    }
  }

  // ─── Boss Mechanics ───────────────────────────────────────

  /**
   * Check and handle boss phase transitions.
   */
  private checkBossPhase(world: World, entityId: string, ai: AI, health: Health): void {
    const hpPercent = health.hp / health.max_hp;

    // Phase transitions at 75%, 50%, 25% HP
    const phaseThresholds = [0.75, 0.50, 0.25];
    let newPhase = 0;

    for (let i = 0; i < phaseThresholds.length; i++) {
      if (hpPercent <= phaseThresholds[i]) {
        newPhase = i + 1;
      }
    }

    if (newPhase > ai.boss_phase) {
      ai.boss_phase = newPhase;
      logger.info('Boss phase transition', { entityId, phase: newPhase });

      // Phase-specific behavior would be defined per boss
      // For now, just log the transition
      // Bosses could gain new abilities, enrage, summon adds, etc.
    }
  }

  // ─── Helpers ──────────────────────────────────────────────

  /**
   * Find the nearest hostile player within aggro range.
   */
  private findAggroTarget(
    world: World,
    entityId: string,
    pos: Position,
    aggroRange: number
  ): string | null {
    const nearby = world.queryInRange(pos.x, pos.y, aggroRange, ['Position', 'Health']);

    let nearest: string | null = null;
    let nearestDist = Infinity;

    for (const targetId of nearby) {
      if (targetId === entityId) continue;

      const targetHealth = world.getComponent<Health>(targetId, 'Health');
      if (!targetHealth || !targetHealth.is_alive) continue;

      // Check if target is a player (has 'Player' tag or specific component)
      const entity = world.getEntity(targetId);
      if (!entity || entity.tag !== 'Player') continue;

      const targetPos = world.getComponent<Position>(targetId, 'Position')!;
      const dist = this.distance(pos.x, pos.y, targetPos.x, targetPos.y);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = targetId;
      }
    }

    return nearest;
  }

  /**
   * Check if a target is valid (exists and alive).
   */
  private isValidTarget(world: World, targetId: string): boolean {
    if (!world.entityExists(targetId)) return false;
    const health = world.getComponent<Health>(targetId, 'Health');
    return health?.is_alive ?? false;
  }

  /**
   * Calculate distance between two points.
   */
  private distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Change AI state.
   */
  private changeState(ai: AI, newState: AI['state'], now: number): void {
    ai.state = newState;
    ai.last_state_change = now;
  }

  /**
   * Leash an entity back to its spawn point (teleport).
   */
  private leashToSpawn(world: World, entityId: string, ai: AI, pos: Position): void {
    pos.x = ai.spawn_x;
    pos.y = ai.spawn_y;
    world.markDirty(entityId, 'Position');
    this.changeState(ai, 'idle', Date.now());

    // Clear all threat
    ai.threat_table.clear();
    const combat = world.getComponent<Combat>(entityId, 'Combat');
    if (combat) {
      combat.threat_table.clear();
      combat.target_id = null;
      combat.in_combat = false;
    }

    // Heal to full on leash
    const health = world.getComponent<Health>(entityId, 'Health');
    if (health) {
      health.hp = health.max_hp;
      world.markDirty(entityId, 'Health');
    }
  }

  /**
   * Add threat to an entity's AI threat table.
   * Called externally by CombatSystem.
   */
  public addThreat(world: World, entityId: string, sourceId: string, threat: number): void {
    const ai = world.getComponent<AI>(entityId, 'AI');
    if (!ai) return;

    const current = ai.threat_table.get(sourceId) ?? 0;
    ai.threat_table.set(sourceId, current + threat);

    // If idle/patrol and threat exceeds 0, enter chase
    if ((ai.state === 'idle' || ai.state === 'patrol') && ai.target_id === null) {
      ai.target_id = sourceId;
      this.changeState(ai, 'chase', Date.now());
    }
  }
}
