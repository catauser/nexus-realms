// ============================================================
// Nexus Realms — Quest Tracker
// Active quests panel with objectives, progress,
// click-to-open details, quest giver indicators
// ============================================================

import Phaser from 'phaser';
import { QuestProgress, QuestStatus, GAME_CONFIG } from '../../shared/types';

// ─── Types ───────────────────────────────────────────────────
export interface QuestDisplayData {
  questId: string;
  name: string;
  type: string;
  objectives: {
    description: string;
    current: number;
    required: number;
  }[];
  status: QuestStatus;
  npcName?: string;
}

// ─── Constants ───────────────────────────────────────────────
const PANEL_WIDTH = 240;
const QUEST_ENTRY_HEIGHT = 60;
const MAX_VISIBLE_QUESTS = 6;

// ─── Quest Tracker ───────────────────────────────────────────
export class QuestTracker {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible: boolean = true;

  // Quest data
  private quests: Map<string, QuestDisplayData> = new Map();
  private questOrder: string[] = [];

  // UI elements
  private entryContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private panelBg!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;

  // Quest giver indicators (world-space)
  private questGiverIcons: Map<string, Phaser.GameObjects.Text> = new Map();

  // Callbacks
  private onQuestClick?: (questId: string) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(95);

    this.createPanel();
  }

  toggle(): void {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);
  }

  show(): void { this.visible = true; this.container.setVisible(true); }
  hide(): void { this.visible = false; this.container.setVisible(false); }
  isVisible(): boolean { return this.visible; }

  setOnQuestClick(cb: (questId: string) => void): void {
    this.onQuestClick = cb;
  }

  /** Update quest data from the network store */
  updateQuests(questLog: Map<string, QuestProgress>, questNames?: Map<string, string>): void {
    this.quests.clear();
    this.questOrder = [];

    for (const [id, progress] of questLog) {
      if (progress.status !== QuestStatus.ACTIVE) continue;

      const name = questNames?.get(id) ?? `Quest ${id.slice(0, 8)}`;
      this.quests.set(id, {
        questId: id,
        name,
        type: 'quest',
        objectives: progress.objectives.map((obj, i) => ({
          description: `Objective ${i + 1}`,
          current: obj.current,
          required: obj.required,
        })),
        status: progress.status,
      });
      this.questOrder.push(id);
    }

    this.renderQuests();
  }

  /** Add a quest with full display data */
  addQuest(quest: QuestDisplayData): void {
    this.quests.set(quest.questId, quest);
    if (!this.questOrder.includes(quest.questId)) {
      this.questOrder.push(quest.questId);
    }
    this.renderQuests();
  }

  /** Remove a quest */
  removeQuest(questId: string): void {
    this.quests.delete(questId);
    this.questOrder = this.questOrder.filter(id => id !== questId);
    const entry = this.entryContainers.get(questId);
    if (entry) {
      entry.destroy();
      this.entryContainers.delete(questId);
    }
    this.renderQuests();
  }

  /** Show quest giver icon (!) above an NPC in world space */
  showQuestGiverIcon(npcId: string, worldX: number, worldY: number, hasQuest: boolean): void {
    let icon = this.questGiverIcons.get(npcId);
    if (!icon) {
      icon = this.scene.add.text(worldX, worldY - 40, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(40);
      this.questGiverIcons.set(npcId, icon);
    }

    icon.setPosition(worldX, worldY - 40);
    icon.setText(hasQuest ? '!' : '?');
    icon.setColor(hasQuest ? '#ffcc00' : '#44cc44');
    icon.setVisible(true);
  }

  /** Hide a quest giver icon */
  hideQuestGiverIcon(npcId: string): void {
    const icon = this.questGiverIcons.get(npcId);
    if (icon) {
      icon.setVisible(false);
    }
  }

  /** Update quest giver icon positions (call each frame) */
  updateQuestGiverPositions(positions: Map<string, { x: number; y: number }>): void {
    for (const [npcId, icon] of this.questGiverIcons) {
      const pos = positions.get(npcId);
      if (pos) {
        icon.setPosition(pos.x, pos.y - 40);
      }
    }
  }

  update(_dt: number): void {
    // Animations, pulsing quest icons, etc.
  }

  // ─── Panel Creation ───────────────────────────────────────

  private createPanel(): void {
    const px = GAME_CONFIG.VIEWPORT_WIDTH - PANEL_WIDTH - 12;
    const py = GAME_CONFIG.VIEWPORT_HEIGHT / 2 - 60;

    // Background
    this.panelBg = this.scene.add.graphics();
    this.panelBg.fillStyle(0x111122, 0.7);
    this.panelBg.fillRoundedRect(px, py, PANEL_WIDTH, 300, 6);
    this.panelBg.lineStyle(1, 0x333355);
    this.panelBg.strokeRoundedRect(px, py, PANEL_WIDTH, 300, 6);
    this.panelBg.setScrollFactor(0);
    this.container.add(this.panelBg);

    // Title
    this.titleText = this.scene.add.text(px + PANEL_WIDTH / 2, py + 6, 'Quests', {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#c0a040',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0).setScrollFactor(0);
    this.container.add(this.titleText);

    // Toggle button
    const toggleBtn = this.scene.add.text(px + PANEL_WIDTH - 12, py + 4, '−', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(1, 0).setScrollFactor(0).setInteractive({ useHandCursor: true });
    toggleBtn.on('pointerdown', () => this.toggle());
    this.container.add(toggleBtn);
  }

  private renderQuests(): void {
    // Clean up old entries
    for (const [, entry] of this.entryContainers) {
      entry.destroy();
    }
    this.entryContainers.clear();

    const px = GAME_CONFIG.VIEWPORT_WIDTH - PANEL_WIDTH - 12;
    const py = GAME_CONFIG.VIEWPORT_HEIGHT / 2 - 60 + 24;

    let yOffset = 0;
    const displayQuests = this.questOrder.slice(0, MAX_VISIBLE_QUESTS);

    for (const questId of displayQuests) {
      const quest = this.quests.get(questId);
      if (!quest) continue;

      const entry = this.scene.add.container(px + 8, py + yOffset);
      entry.setScrollFactor(0);

      // Quest name
      const nameText = this.scene.add.text(0, 0, quest.name, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#ccaa33',
        fontStyle: 'bold',
      }).setInteractive({ useHandCursor: true });
      nameText.on('pointerdown', () => {
        this.onQuestClick?.(questId);
      });
      entry.add(nameText);

      // Objectives
      let objY = 16;
      for (const obj of quest.objectives) {
        const isComplete = obj.current >= obj.required;
        const color = isComplete ? '#44cc44' : '#aaaaaa';
        const checkmark = isComplete ? '✓ ' : '  ';
        const objText = this.scene.add.text(8, objY, `${checkmark}${obj.description}: ${obj.current}/${obj.required}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '10px',
          color,
        });
        entry.add(objText);
        objY += 14;
      }

      this.container.add(entry);
      this.entryContainers.set(questId, entry);

      yOffset += Math.max(QUEST_ENTRY_HEIGHT, objY + 8);
    }

    // Resize background
    const totalHeight = Math.max(80, yOffset + 32);
    this.panelBg.clear();
    this.panelBg.fillStyle(0x111122, 0.7);
    this.panelBg.fillRoundedRect(px, py - 24, PANEL_WIDTH, totalHeight, 6);
    this.panelBg.lineStyle(1, 0x333355);
    this.panelBg.strokeRoundedRect(px, py - 24, PANEL_WIDTH, totalHeight, 6);
  }

  destroy(): void {
    for (const [, entry] of this.entryContainers) entry.destroy();
    for (const [, icon] of this.questGiverIcons) icon.destroy();
    this.container.destroy();
  }
}
