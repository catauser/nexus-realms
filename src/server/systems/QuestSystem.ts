// ============================================================
// Nexus Realms — Quest System
// Track quest objectives (kill, collect, interact), check
// completion conditions, distribute rewards, daily/weekly reset.
// ============================================================

import { World, System } from '../ecs/World';
import { Logger } from '../utils/Logger';
import type { QuestStatus } from '../../shared/types';

const logger = new Logger({ context: 'QuestSystem' });

/** Quest objective definition */
interface QuestObjective {
  type: 'kill' | 'collect' | 'interact' | 'reach' | 'escort' | 'gather';
  target: string;
  count: number;
  zone?: string;
}

/** Quest definition (loaded from database) */
interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: string;
  level_req: number;
  zone_id: string | null;
  prerequisites: string[];
  objectives: QuestObjective[];
  rewards: QuestRewards;
  is_repeatable: boolean;
  repeat_cooldown_ms: number | null;
  time_limit_ms: number | null;
}

/** Quest rewards */
interface QuestRewards {
  experience: number;
  gold: number;
  items: { item_id: string; quantity: number }[];
  reputation: { faction_id: string; value: number }[];
  choice_items: { item_id: string; quantity: number }[];
}

/** Quest state component on entities */
interface QuestStateComponent {
  active_quests: Map<string, QuestProgress>;
  completed_quests: Set<string>;
  daily_reset_time: number;
  last_daily_reset: number;
}

/** Quest progress tracking */
interface QuestProgress {
  quest_id: string;
  status: QuestStatus;
  objectives: { current: number; required: number }[];
  started_at: number;
  completed_at: number | null;
}

/** Inventory component for reward distribution */
interface InventoryComponent {
  slots: unknown[];
  gold: number;
}

/** Health component for XP */
interface Health {
  hp: number;
  max_hp: number;
  is_alive: boolean;
}

/**
 * Quest System — tracks quest objectives and completion.
 *
 * Priority: 80 (runs after Combat and Buffs)
 *
 * Responsibilities:
 * - Track quest objectives (kill, collect, interact)
 * - Check completion conditions
 * - Distribute rewards on completion
 * - Handle daily/weekly resets
 * - Prerequisite validation
 */
export class QuestSystem implements System {
  public readonly name = 'QuestSystem';
  public readonly priority = 80;

  /** Quest definitions loaded from database */
  private questDefinitions: Map<string, QuestDefinition> = new Map();

  /** Pending objective updates to process */
  private pendingUpdates: Array<{
    entityId: string;
    type: string;
    target: string;
    amount: number;
  }> = [];

  /**
   * Register a quest definition.
   */
  public registerQuest(quest: QuestDefinition): void {
    this.questDefinitions.set(quest.id, quest);
  }

  /**
   * Register multiple quest definitions.
   */
  public registerQuests(quests: QuestDefinition[]): void {
    for (const q of quests) {
      this.registerQuest(q);
    }
    logger.info(`Registered ${quests.length} quest definitions`);
  }

  /**
   * Report a quest objective event (called by other systems).
   */
  public reportObjective(entityId: string, type: string, target: string, amount: number = 1): void {
    this.pendingUpdates.push({ entityId, type, target, amount });
  }

  public update(world: World, dt: number): void {
    const now = Date.now();

    // Process pending objective updates
    const updates = this.pendingUpdates.splice(0);
    for (const update of updates) {
      this.processObjectiveUpdate(world, update.entityId, update.type, update.target, update.amount);
    }

    // Check daily/weekly resets
    const questEntities = world.query(['QuestState']);
    for (const entityId of questEntities) {
      this.checkDailyReset(world, entityId, now);
    }
  }

  // ─── Quest Accept ─────────────────────────────────────────

  /**
   * Accept a quest for a player.
   * @returns success/error result
   */
  public acceptQuest(
    world: World,
    entityId: string,
    questId: string
  ): { success: boolean; error?: string } {
    const questDef = this.questDefinitions.get(questId);
    if (!questDef) {
      return { success: false, error: 'Quest not found' };
    }

    const questState = world.getComponent<QuestStateComponent>(entityId, 'QuestState');
    if (!questState) {
      return { success: false, error: 'Entity has no quest state' };
    }

    // Check if already active
    if (questState.active_quests.has(questId)) {
      return { success: false, error: 'Quest already active' };
    }

    // Check if already completed (non-repeatable)
    if (questState.completed_quests.has(questId) && !questDef.is_repeatable) {
      return { success: false, error: 'Quest already completed' };
    }

    // Check prerequisites
    for (const prereq of questDef.prerequisites) {
      if (!questState.completed_quests.has(prereq)) {
        return { success: false, error: 'Prerequisites not met' };
      }
    }

    // Check level requirement
    const level = world.getComponent<{ level: number }>(entityId, 'Level');
    if (level && level.level < questDef.level_req) {
      return { success: false, error: 'Level too low' };
    }

    // Check active quest limit
    if (questState.active_quests.size >= 25) {
      return { success: false, error: 'Quest log full' };
    }

    // Initialize quest progress
    const progress: QuestProgress = {
      quest_id: questId,
      status: 'active' as QuestStatus,
      objectives: questDef.objectives.map(obj => ({
        current: 0,
        required: obj.count,
      })),
      started_at: Date.now(),
      completed_at: null,
    };

    questState.active_quests.set(questId, progress);
    world.markDirty(entityId, 'QuestState');

    logger.info('Quest accepted', { entityId, questId, questName: questDef.name });
    return { success: true };
  }

  // ─── Quest Completion ─────────────────────────────────────

  /**
   * Attempt to complete (turn in) a quest.
   * @returns success/error result with rewards
   */
  public completeQuest(
    world: World,
    entityId: string,
    questId: string,
    choiceIndex?: number
  ): { success: boolean; error?: string; rewards?: QuestRewards } {
    const questDef = this.questDefinitions.get(questId);
    if (!questDef) {
      return { success: false, error: 'Quest not found' };
    }

    const questState = world.getComponent<QuestStateComponent>(entityId, 'QuestState');
    if (!questState) {
      return { success: false, error: 'Entity has no quest state' };
    }

    const progress = questState.active_quests.get(questId);
    if (!progress) {
      return { success: false, error: 'Quest not active' };
    }

    // Check if all objectives are complete
    if (!this.areObjectivesComplete(progress)) {
      return { success: false, error: 'Objectives not yet met' };
    }

    // Mark as completed
    progress.status = 'completed' as QuestStatus;
    progress.completed_at = Date.now();
    questState.active_quests.delete(questId);
    questState.completed_quests.add(questId);
    world.markDirty(entityId, 'QuestState');

    // Distribute rewards
    const rewards = this.distributeRewards(world, entityId, questDef, choiceIndex);

    logger.info('Quest completed', { entityId, questId, questName: questDef.name });
    return { success: true, rewards };
  }

  // ─── Quest Abandon ────────────────────────────────────────

  /**
   * Abandon an active quest.
   */
  public abandonQuest(world: World, entityId: string, questId: string): boolean {
    const questState = world.getComponent<QuestStateComponent>(entityId, 'QuestState');
    if (!questState) return false;

    const deleted = questState.active_quests.delete(questId);
    if (deleted) {
      world.markDirty(entityId, 'QuestState');
      logger.info('Quest abandoned', { entityId, questId });
    }
    return deleted;
  }

  // ─── Objective Tracking ───────────────────────────────────

  /**
   * Process an objective update for a player's active quests.
   */
  private processObjectiveUpdate(
    world: World,
    entityId: string,
    type: string,
    target: string,
    amount: number
  ): void {
    const questState = world.getComponent<QuestStateComponent>(entityId, 'QuestState');
    if (!questState || questState.active_quests.size === 0) return;

    let updated = false;

    for (const [questId, progress] of questState.active_quests) {
      if (progress.status !== 'active') continue;

      const questDef = this.questDefinitions.get(questId);
      if (!questDef) continue;

      for (let i = 0; i < questDef.objectives.length; i++) {
        const obj = questDef.objectives[i];
        const prog = progress.objectives[i];
        if (!prog || prog.current >= prog.required) continue;

        // Match objective type and target
        if (obj.type === type && obj.target === target) {
          // Check zone restriction
          if (obj.zone) {
            const pos = world.getComponent<{ zone_id: string }>(entityId, 'Position');
            if (pos && pos.zone_id !== obj.zone) continue;
          }

          prog.current = Math.min(prog.required, prog.current + amount);
          updated = true;

          logger.debug('Quest objective updated', {
            entityId,
            questId,
            objective: type,
            target,
            current: prog.current,
            required: prog.required,
          });
        }
      }
    }

    if (updated) {
      world.markDirty(entityId, 'QuestState');
    }
  }

  /**
   * Check if all objectives for a quest are complete.
   */
  private areObjectivesComplete(progress: QuestProgress): boolean {
    return progress.objectives.every(obj => obj.current >= obj.required);
  }

  // ─── Rewards ──────────────────────────────────────────────

  /**
   * Distribute quest rewards to a player.
   */
  private distributeRewards(
    world: World,
    entityId: string,
    questDef: QuestDefinition,
    choiceIndex?: number
  ): QuestRewards {
    const rewards = questDef.rewards;

    // Grant experience
    if (rewards.experience > 0) {
      const levelComp = world.getComponent<{ level: number; experience: number }>(entityId, 'Level');
      if (levelComp) {
        levelComp.experience += rewards.experience;
        world.markDirty(entityId, 'Level');
      }
    }

    // Grant gold
    if (rewards.gold > 0) {
      const inventory = world.getComponent<InventoryComponent>(entityId, 'Inventory');
      if (inventory) {
        inventory.gold += rewards.gold;
        world.markDirty(entityId, 'Inventory');
      }
    }

    // Grant items (would need item system integration)
    // For now, just log
    if (rewards.items.length > 0) {
      logger.debug('Quest items granted', { entityId, items: rewards.items });
    }

    // Grant reputation
    if (rewards.reputation.length > 0) {
      const faction = world.getComponent<Record<string, number>>(entityId, 'Faction');
      if (faction) {
        for (const rep of rewards.reputation) {
          faction[rep.faction_id] = (faction[rep.faction_id] ?? 0) + rep.value;
        }
        world.markDirty(entityId, 'Faction');
      }
    }

    return rewards;
  }

  // ─── Daily/Weekly Reset ───────────────────────────────────

  /**
   * Check if daily/weekly resets are needed.
   */
  private checkDailyReset(world: World, entityId: string, now: number): void {
    const questState = world.getComponent<QuestStateComponent>(entityId, 'QuestState');
    if (!questState) return;

    // Daily reset at midnight UTC
    const nowDate = new Date();
    const lastReset = new Date(questState.last_daily_reset);

    if (
      nowDate.getUTCDate() !== lastReset.getUTCDate() ||
      nowDate.getUTCMonth() !== lastReset.getUTCMonth()
    ) {
      // Perform daily reset
      questState.last_daily_reset = now;

      // Remove completed daily quests from completed_quests (so they can be repeated)
      for (const questId of questState.completed_quests) {
        const questDef = this.questDefinitions.get(questId);
        if (questDef?.type === 'daily' || questDef?.type === 'weekly') {
          questState.completed_quests.delete(questId);
        }
      }

      world.markDirty(entityId, 'QuestState');
      logger.debug('Daily reset performed', { entityId });
    }
  }

  // ─── Queries ──────────────────────────────────────────────

  /**
   * Get all active quests for an entity.
   */
  public getActiveQuests(world: World, entityId: string): QuestProgress[] {
    const questState = world.getComponent<QuestStateComponent>(entityId, 'QuestState');
    if (!questState) return [];
    return Array.from(questState.active_quests.values());
  }

  /**
   * Get quest progress for a specific quest.
   */
  public getQuestProgress(world: World, entityId: string, questId: string): QuestProgress | undefined {
    const questState = world.getComponent<QuestStateComponent>(entityId, 'QuestState');
    return questState?.active_quests.get(questId);
  }

  /**
   * Check if a quest is available (not active, not completed, prerequisites met).
   */
  public isQuestAvailable(world: World, entityId: string, questId: string): boolean {
    const questDef = this.questDefinitions.get(questId);
    if (!questDef) return false;

    const questState = world.getComponent<QuestStateComponent>(entityId, 'QuestState');
    if (!questState) return false;

    if (questState.active_quests.has(questId)) return false;
    if (questState.completed_quests.has(questId) && !questDef.is_repeatable) return false;

    for (const prereq of questDef.prerequisites) {
      if (!questState.completed_quests.has(prereq)) return false;
    }

    return true;
  }
}
