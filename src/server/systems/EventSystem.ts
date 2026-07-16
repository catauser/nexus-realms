// ============================================================
// Nexus Realms — Dynamic Event System
// World events with phases, timers, participation tracking,
// and reward distribution.
// ============================================================

import { World, System } from '../ecs/World';
import { Logger } from '../utils/Logger';
import type { DynamicEventType } from '../../shared/types';

const logger = new Logger({ context: 'EventSystem' });

/** Event phase definition */
interface EventPhase {
  name: string;
  duration_ms: number;
  objectives: EventObjective[];
  on_start?: string; // Script/function name to execute
  on_end?: string;
}

/** Event objective */
interface EventObjective {
  description: string;
  type: 'kill' | 'collect' | 'defend' | 'escort' | 'survive';
  target: string;
  required: number;
  current: number;
}

/** Dynamic event definition */
interface DynamicEventDefinition {
  id: string;
  type: DynamicEventType;
  name: string;
  description: string;
  zone_id: string;
  min_players: number;
  max_players: number | null;
  cooldown_ms: number;
  phases: EventPhase[];
  rewards: EventRewards;
  trigger_conditions: {
    type: 'timer' | 'player_count' | 'boss_death' | 'manual';
    value?: number;
    interval_ms?: number;
  };
}

/** Event rewards */
interface EventRewards {
  participation: {
    experience: number;
    gold: number;
    items: { item_id: string; quantity: number; chance: number }[];
  };
  top_contributors: {
    experience: number;
    gold: number;
    items: { item_id: string; quantity: number }[];
  };
  tiers: Array<{
    min_contribution: number;
    rewards: {
      experience: number;
      gold: number;
      items: { item_id: string; quantity: number }[];
    };
  }>;
}

/** Active event instance */
interface ActiveEvent {
  definition_id: string;
  event_instance_id: string;
  state: 'active' | 'completed' | 'failed';
  zone_id: string;
  current_phase_index: number;
  phase_timer: number;
  participants: Map<string, ParticipantData>;
  start_time: number;
  end_time: number | null;
  objectives: EventObjective[];
}

/** Per-participant data */
interface ParticipantData {
  player_id: string;
  contribution: number;
  join_time: number;
  damage_dealt: number;
  healing_done: number;
  kills: number;
  deaths: number;
}

/**
 * Dynamic Event System — manages world events with phases,
 * timers, participation tracking, and reward distribution.
 *
 * Priority: 85 (runs after Quests)
 *
 * Responsibilities:
 * - Manage dynamic world events (boss spawns, invasions, etc.)
 * - Track event phases and timers
 * - Track player participation and contribution
 * - Distribute event rewards
 * - Auto-trigger events based on conditions
 */
export class EventSystem implements System {
  public readonly name = 'EventSystem';
  public readonly priority = 85;

  /** Event definitions */
  private definitions: Map<string, DynamicEventDefinition> = new Map();

  /** Currently active event instances */
  private activeEvents: Map<string, ActiveEvent> = new Map();

  /** Event cooldowns (definition_id → last_end_time) */
  private cooldowns: Map<string, number> = new Map();

  /** Next instance ID counter */
  private nextInstanceId: number = 1;

  /** Auto-trigger check interval */
  private triggerCheckTimer: number = 0;
  private static readonly TRIGGER_CHECK_INTERVAL = 30000; // 30 seconds

  /**
   * Register an event definition.
   */
  public registerEvent(definition: DynamicEventDefinition): void {
    this.definitions.set(definition.id, definition);
  }

  /**
   * Register multiple event definitions.
   */
  public registerEvents(definitions: DynamicEventDefinition[]): void {
    for (const def of definitions) {
      this.registerEvent(def);
    }
    logger.info(`Registered ${definitions.length} dynamic event definitions`);
  }

  public update(world: World, dt: number): void {
    const dtMs = dt * 1000;
    const now = Date.now();

    // Update active events
    const toRemove: string[] = [];
    for (const [instanceId, event] of this.activeEvents) {
      this.updateEvent(world, event, dtMs, now);
      if (event.state === 'completed' || event.state === 'failed') {
        toRemove.push(instanceId);
      }
    }

    // Clean up finished events
    for (const id of toRemove) {
      const event = this.activeEvents.get(id);
      if (event) {
        this.cooldowns.set(event.definition_id, now);
        this.activeEvents.delete(id);
      }
    }

    // Auto-trigger check
    this.triggerCheckTimer += dtMs;
    if (this.triggerCheckTimer >= EventSystem.TRIGGER_CHECK_INTERVAL) {
      this.triggerCheckTimer = 0;
      this.checkAutoTriggers(world, now);
    }
  }

  // ─── Event Management ─────────────────────────────────────

  /**
   * Manually start an event.
   */
  public startEvent(
    world: World,
    definitionId: string,
    zoneId: string
  ): { success: boolean; instanceId?: string; error?: string } {
    const def = this.definitions.get(definitionId);
    if (!def) {
      return { success: false, error: 'Event definition not found' };
    }

    // Check cooldown
    const lastEnd = this.cooldowns.get(definitionId) ?? 0;
    if (Date.now() - lastEnd < def.cooldown_ms) {
      return { success: false, error: 'Event is on cooldown' };
    }

    // Check if event is already active
    for (const event of this.activeEvents.values()) {
      if (event.definition_id === definitionId && event.state === 'active') {
        return { success: false, error: 'Event already active' };
      }
    }

    // Create event instance
    const instanceId = `event_${this.nextInstanceId++}`;
    const phases = def.phases;

    const objectives: EventObjective[] = [];
    if (phases.length > 0) {
      for (const obj of phases[0].objectives) {
        objectives.push({ ...obj, current: 0 });
      }
    }

    const activeEvent: ActiveEvent = {
      definition_id: definitionId,
      event_instance_id: instanceId,
      state: 'active',
      zone_id: zoneId,
      current_phase_index: 0,
      phase_timer: phases.length > 0 ? phases[0].duration_ms : 0,
      participants: new Map(),
      start_time: Date.now(),
      end_time: null,
      objectives,
    };

    this.activeEvents.set(instanceId, activeEvent);

    // Broadcast event start
    this.broadcastEventStart(world, def, activeEvent);

    logger.info('Dynamic event started', {
      instanceId,
      name: def.name,
      type: def.type,
      zone: zoneId,
    });

    return { success: true, instanceId };
  }

  /**
   * Add a player as a participant in an active event.
   */
  public joinEvent(world: World, instanceId: string, playerId: string): boolean {
    const event = this.activeEvents.get(instanceId);
    if (!event || event.state !== 'active') return false;

    const def = this.definitions.get(event.definition_id);
    if (def?.max_players && event.participants.size >= def.max_players) return false;

    if (event.participants.has(playerId)) return false;

    event.participants.set(playerId, {
      player_id: playerId,
      contribution: 0,
      join_time: Date.now(),
      damage_dealt: 0,
      healing_done: 0,
      kills: 0,
      deaths: 0,
    });

    return true;
  }

  /**
   * Record contribution from a player in an event.
   */
  public recordContribution(
    instanceId: string,
    playerId: string,
    type: 'damage' | 'heal' | 'kill' | 'objective',
    amount: number
  ): void {
    const event = this.activeEvents.get(instanceId);
    if (!event || event.state !== 'active') return;

    const participant = event.participants.get(playerId);
    if (!participant) return;

    switch (type) {
      case 'damage':
        participant.damage_dealt += amount;
        participant.contribution += amount;
        break;
      case 'heal':
        participant.healing_done += amount;
        participant.contribution += Math.floor(amount * 0.5);
        break;
      case 'kill':
        participant.kills++;
        participant.contribution += 100;
        break;
      case 'objective':
        participant.contribution += amount;
        break;
    }
  }

  /**
   * Update an event objective.
   */
  public updateObjective(
    instanceId: string,
    objectiveType: string,
    target: string,
    amount: number = 1
  ): void {
    const event = this.activeEvents.get(instanceId);
    if (!event || event.state !== 'active') return;

    for (const obj of event.objectives) {
      if (obj.type === objectiveType && obj.target === target) {
        obj.current = Math.min(obj.required, obj.current + amount);
      }
    }
  }

  // ─── Event Update ─────────────────────────────────────────

  /**
   * Update a single active event.
   */
  private updateEvent(world: World, event: ActiveEvent, dtMs: number, now: number): void {
    // Check minimum player count
    const def = this.definitions.get(event.definition_id);
    if (!def) return;

    if (event.participants.size < def.min_players) {
      // Not enough players — pause phase timer
      return;
    }

    // Tick phase timer
    event.phase_timer -= dtMs;

    // Check phase completion
    if (event.phase_timer <= 0) {
      this.advancePhase(world, event, def);
      return;
    }

    // Check if all objectives are complete (advance early)
    const allComplete = event.objectives.every(obj => obj.current >= obj.required);
    if (allComplete) {
      this.advancePhase(world, event, def);
    }

    // Broadcast periodic update
    this.broadcastEventUpdate(world, event, def);
  }

  /**
   * Advance to the next phase of an event.
   */
  private advancePhase(
    world: World,
    event: ActiveEvent,
    def: DynamicEventDefinition
  ): void {
    const nextPhaseIndex = event.current_phase_index + 1;

    if (nextPhaseIndex >= def.phases.length) {
      // Event complete
      event.state = 'completed';
      event.end_time = Date.now();
      this.distributeRewards(world, event, def);
      this.broadcastEventEnd(world, event, def, 'success');
      return;
    }

    // Move to next phase
    event.current_phase_index = nextPhaseIndex;
    const nextPhase = def.phases[nextPhaseIndex];
    event.phase_timer = nextPhase.duration_ms;

    // Reset objectives for new phase
    event.objectives = nextPhase.objectives.map(obj => ({
      ...obj,
      current: 0,
    }));

    logger.info('Event phase advanced', {
      instanceId: event.event_instance_id,
      phase: nextPhase.name,
      phaseIndex: nextPhaseIndex,
    });
  }

  // ─── Auto-Triggers ────────────────────────────────────────

  /**
   * Check if any events should auto-trigger.
   */
  private checkAutoTriggers(world: World, now: number): void {
    for (const [defId, def] of this.definitions) {
      if (def.trigger_conditions.type !== 'timer') continue;

      // Check cooldown
      const lastEnd = this.cooldowns.get(defId) ?? 0;
      if (now - lastEnd < def.cooldown_ms) continue;

      // Check if already active
      let alreadyActive = false;
      for (const event of this.activeEvents.values()) {
        if (event.definition_id === defId && event.state === 'active') {
          alreadyActive = true;
          break;
        }
      }
      if (alreadyActive) continue;

      // Trigger
      this.startEvent(world, defId, def.zone_id);
    }
  }

  // ─── Rewards ──────────────────────────────────────────────

  /**
   * Distribute event rewards to participants.
   */
  private distributeRewards(
    world: World,
    event: ActiveEvent,
    def: DynamicEventDefinition
  ): void {
    // Sort participants by contribution
    const sorted = Array.from(event.participants.values())
      .sort((a, b) => b.contribution - a.contribution);

    for (let i = 0; i < sorted.length; i++) {
      const participant = sorted[i];
      const isTop = i < 3; // Top 3 contributors get bonus

      const rewards = isTop ? def.rewards.top_contributors : def.rewards.participation;

      // Grant XP
      const level = world.getComponent<{ level: number; experience: number }>(participant.player_id, 'Level');
      if (level && rewards.experience > 0) {
        level.experience += rewards.experience;
        world.markDirty(participant.player_id, 'Level');
      }

      // Grant gold
      const inventory = world.getComponent<{ gold: number }>(participant.player_id, 'Inventory');
      if (inventory && rewards.gold > 0) {
        inventory.gold += rewards.gold;
        world.markDirty(participant.player_id, 'Inventory');
      }
    }

    logger.info('Event rewards distributed', {
      instanceId: event.event_instance_id,
      participants: sorted.length,
    });
  }

  // ─── Broadcasting ─────────────────────────────────────────

  /**
   * Broadcast event start to the zone.
   */
  private broadcastEventStart(
    world: World,
    def: DynamicEventDefinition,
    event: ActiveEvent
  ): void {
    // Would use ZoneManager to broadcast
    logger.info(`Event started: ${def.name} in zone ${event.zone_id}`);
  }

  /**
   * Broadcast event progress update.
   */
  private broadcastEventUpdate(
    world: World,
    event: ActiveEvent,
    def: DynamicEventDefinition
  ): void {
    // Periodic updates — throttle to every 5 seconds
    const now = Date.now();
    if ((event as any)._lastBroadcast && now - (event as any)._lastBroadcast < 5000) return;
    (event as any)._lastBroadcast = now;
  }

  /**
   * Broadcast event end with results.
   */
  private broadcastEventEnd(
    world: World,
    event: ActiveEvent,
    def: DynamicEventDefinition,
    result: 'success' | 'failed'
  ): void {
    const participants = Array.from(event.participants.values())
      .map(p => ({
        player_id: p.player_id,
        contribution: p.contribution,
      }));

    logger.info(`Event ended: ${def.name} — ${result} — ${participants.length} participants`);
  }

  // ─── Queries ──────────────────────────────────────────────

  /**
   * Get all active events.
   */
  public getActiveEvents(): ActiveEvent[] {
    return Array.from(this.activeEvents.values()).filter(e => e.state === 'active');
  }

  /**
   * Get active events in a specific zone.
   */
  public getActiveEventsInZone(zoneId: string): ActiveEvent[] {
    return Array.from(this.activeEvents.values())
      .filter(e => e.state === 'active' && e.zone_id === zoneId);
  }

  /**
   * Check if a player is participating in any active event.
   */
  public isPlayerInEvent(playerId: string): boolean {
    for (const event of this.activeEvents.values()) {
      if (event.state === 'active' && event.participants.has(playerId)) return true;
    }
    return false;
  }

  /**
   * Get the event instance a player is in.
   */
  public getPlayerEvent(playerId: string): ActiveEvent | null {
    for (const event of this.activeEvents.values()) {
      if (event.state === 'active' && event.participants.has(playerId)) return event;
    }
    return null;
  }
}
