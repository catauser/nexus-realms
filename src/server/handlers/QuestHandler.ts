// ============================================================
// Nexus Realms — Quest Handler
// Handles quest accept, complete, abandon, and tracking
// ============================================================
import { ConnectedClient } from '../network/WebSocketServer';
import { WebSocketServer } from '../network/WebSocketServer';
import { World } from '../ecs/World';
import { Logger } from '../utils/Logger';
import { QuestStatus } from '@shared/types';

interface QuestDefinition {
  id: string;
  name: string;
  level_req: number;
  prerequisites: string[];
  objectives: { type: string; target: string; required: number }[];
  rewards: { experience: number; gold: number; items: string[] };
}

export class QuestHandler {
  private world: World;
  private wsServer: WebSocketServer;
  private logger: Logger;
  private questData: Map<string, QuestDefinition> = new Map();

  constructor(world: World, wsServer: WebSocketServer) {
    this.world = world;
    this.wsServer = wsServer;
    this.logger = new Logger('QuestHandler');

    // Initialize with some sample quests
    this.initQuestData();
  }

  /**
   * Initialize quest definitions
   */
  private initQuestData(): void {
    const quests: QuestDefinition[] = [
      {
        id: 'quest_001',
        name: 'A New Beginning',
        level_req: 1,
        prerequisites: [],
        objectives: [
          { type: 'talk', target: 'npc_mentor', required: 1 },
        ],
        rewards: { experience: 100, gold: 10, items: [] },
      },
      {
        id: 'quest_002',
        name: 'The Village in Peril',
        level_req: 2,
        prerequisites: ['quest_001'],
        objectives: [
          { type: 'kill', target: 'wolf', required: 5 },
        ],
        rewards: { experience: 200, gold: 25, items: ['weapon_rusty_sword'] },
      },
      {
        id: 'quest_003',
        name: 'Gathering Supplies',
        level_req: 3,
        prerequisites: ['quest_001'],
        objectives: [
          { type: 'collect', target: 'herb_peacebloom', required: 3 },
          { type: 'collect', target: 'ore_copper', required: 2 },
        ],
        rewards: { experience: 150, gold: 15, items: [] },
      },
    ];

    for (const quest of quests) {
      this.questData.set(quest.id, quest);
    }
  }

  /**
   * Handle quest accept
   */
  handleAccept(client: ConnectedClient, data: { quest_id: string }): void {
    if (!client.playerId) return;

    const questDef = this.questData.get(data.quest_id);
    if (!questDef) {
      this.wsServer.sendToClient(client, 'error', { code: 'QUEST_NOT_FOUND', message: 'Quest not found' });
      return;
    }

    const questState = this.world.getComponent(client.playerId, 'questState') as {
      active_quests: Map<string, unknown>;
      completed_quests: Set<string>;
    } | null;
    if (!questState) return;

    // Check if already active or completed
    if (questState.active_quests.has(data.quest_id)) {
      this.wsServer.sendToClient(client, 'error', { code: 'QUEST_ACTIVE', message: 'Quest already active' });
      return;
    }
    if (questState.completed_quests.has(data.quest_id)) {
      this.wsServer.sendToClient(client, 'error', { code: 'QUEST_COMPLETED', message: 'Quest already completed' });
      return;
    }

    // Check prerequisites
    for (const prereq of questDef.prerequisites) {
      if (!questState.completed_quests.has(prereq)) {
        this.wsServer.sendToClient(client, 'error', { code: 'PREREQ_NOT_MET', message: 'Prerequisites not met' });
        return;
      }
    }

    // Check level
    const pos = this.world.getComponent<{ level?: number }>(client.playerId, 'position');
    // Would check player level against questDef.level_req

    // Add quest to active quests
    const progress = {
      quest_id: data.quest_id,
      status: QuestStatus.ACTIVE,
      objectives: questDef.objectives.map(() => ({ current: 0, required: 0 })),
      started_at: Date.now(),
    };

    questState.active_quests.set(data.quest_id, progress);
    this.world.updateComponent(client.playerId, 'questState', {
      active_quests: questState.active_quests,
    });

    // Notify client
    this.wsServer.sendToClient(client, 'quest.update', {
      quest_id: data.quest_id,
      progress,
    });

    this.logger.info(`Player ${client.playerId} accepted quest ${data.quest_id}`);
  }

  /**
   * Handle quest complete (turn in)
   */
  handleComplete(client: ConnectedClient, data: { quest_id: string }): void {
    if (!client.playerId) return;

    const questDef = this.questData.get(data.quest_id);
    if (!questDef) return;

    const questState = this.world.getComponent(client.playerId, 'questState') as {
      active_quests: Map<string, { objectives: { current: number; required: number }[] }>;
      completed_quests: Set<string>;
    } | null;
    if (!questState) return;

    const quest = questState.active_quests.get(data.quest_id);
    if (!quest) {
      this.wsServer.sendToClient(client, 'error', { code: 'QUEST_NOT_ACTIVE', message: 'Quest not active' });
      return;
    }

    // Check all objectives are complete
    for (let i = 0; i < quest.objectives.length; i++) {
      if (quest.objectives[i].current < quest.objectives[i].required) {
        this.wsServer.sendToClient(client, 'error', { code: 'QUEST_INCOMPLETE', message: 'Objectives not complete' });
        return;
      }
    }

    // Remove from active, add to completed
    questState.active_quests.delete(data.quest_id);
    questState.completed_quests.add(data.quest_id);

    this.world.updateComponent(client.playerId, 'questState', {
      active_quests: questState.active_quests,
      completed_quests: questState.completed_quests,
    });

    // Grant rewards
    // Would integrate with inventory and XP systems
    this.wsServer.sendToClient(client, 'quest.completed', {
      quest_id: data.quest_id,
      rewards: questDef.rewards,
    });

    this.logger.info(`Player ${client.playerId} completed quest ${data.quest_id}`);
  }

  /**
   * Handle quest abandon
   */
  handleAbandon(client: ConnectedClient, data: { quest_id: string }): void {
    if (!client.playerId) return;

    const questState = this.world.getComponent(client.playerId, 'questState') as {
      active_quests: Map<string, unknown>;
    } | null;
    if (!questState) return;

    if (!questState.active_quests.has(data.quest_id)) {
      this.wsServer.sendToClient(client, 'error', { code: 'QUEST_NOT_ACTIVE', message: 'Quest not active' });
      return;
    }

    questState.active_quests.delete(data.quest_id);
    this.world.updateComponent(client.playerId, 'questState', {
      active_quests: questState.active_quests,
    });

    this.wsServer.sendToClient(client, 'notification', {
      type: 'info',
      message: `Quest abandoned`,
    });
  }

  /**
   * Check and update quest objectives (called by other systems)
   */
  updateObjective(playerId: string, type: string, target: string, amount: number = 1): void {
    const questState = this.world.getComponent(playerId, 'questState') as {
      active_quests: Map<string, { objectives: { current: number; required: number }[] }>;
    } | null;
    if (!questState) return;

    for (const [questId, quest] of questState.active_quests.entries()) {
      const questDef = this.questData.get(questId);
      if (!questDef) continue;

      for (let i = 0; i < questDef.objectives.length; i++) {
        const obj = questDef.objectives[i];
        if (obj.type === type && obj.target === target) {
          quest.objectives[i].current = Math.min(
            quest.objectives[i].current + amount,
            quest.objectives[i].required,
          );

          // Notify player
          const client = this.wsServer.getClientByPlayerId(playerId);
          if (client) {
            this.wsServer.sendToClient(client, 'quest.update', {
              quest_id: questId,
              progress: quest,
            });
          }
        }
      }
    }
  }
}
