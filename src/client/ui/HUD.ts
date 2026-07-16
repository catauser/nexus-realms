// ============================================================
// Nexus Realms — HUD
// Health/Mana/XP bars, level display, ability bar,
// target frame, buff/debuff icons, minimap
// ============================================================

import Phaser from 'phaser';
import { PlayerData, ActiveBuff, GAME_CONFIG } from '../../shared/types';
import { CooldownInfo } from '../systems/CombatRenderer';

// ─── Constants ───────────────────────────────────────────────
const BAR_WIDTH = 200;
const BAR_HEIGHT = 18;
const ABILITY_SLOT_SIZE = 44;
const ABILITY_SLOT_GAP = 4;
const MINIMAP_SIZE = 160;

// ─── HUD ─────────────────────────────────────────────────────
export class HUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  // Health bar
  private hpBarBg!: Phaser.GameObjects.Graphics;
  private hpBarFill!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;

  // Mana bar
  private mpBarBg!: Phaser.GameObjects.Graphics;
  private mpBarFill!: Phaser.GameObjects.Graphics;
  private mpText!: Phaser.GameObjects.Text;

  // XP bar
  private xpBarBg!: Phaser.GameObjects.Graphics;
  private xpBarFill!: Phaser.GameObjects.Graphics;
  private xpText!: Phaser.GameObjects.Text;

  // Level display
  private levelText!: Phaser.GameObjects.Text;

  // Ability bar
  private abilitySlots: AbilitySlotUI[] = [];

  // Target frame
  private targetFrameContainer!: Phaser.GameObjects.Container;
  private targetNameText!: Phaser.GameObjects.Text;
  private targetHpBarBg!: Phaser.GameObjects.Graphics;
  private targetHpBarFill!: Phaser.GameObjects.Graphics;
  private targetHpText!: Phaser.GameObjects.Text;
  private targetLevelText!: Phaser.GameObjects.Text;
  private targetVisible: boolean = false;

  // Buff/debuff icons
  private buffContainer!: Phaser.GameObjects.Container;
  private buffIcons: Map<string, Phaser.GameObjects.Graphics> = new Map();

  // Minimap
  private minimapContainer!: Phaser.GameObjects.Container;
  private minimapBg!: Phaser.GameObjects.Graphics;
  private minimapDots!: Phaser.GameObjects.Graphics;
  private minimapPlayerDot!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);

    this.createHealthBar();
    this.createManaBar();
    this.createXPBar();
    this.createLevelDisplay();
    this.createAbilityBar();
    this.createTargetFrame();
    this.createBuffContainer();
    this.createMinimap();
  }

  /** Update HUD with current player state */
  updatePlayer(player: PlayerData): void {
    this.updateBar(this.hpBarFill, player.hp, player.max_hp, BAR_WIDTH, 0xcc3333);
    this.hpText.setText(`${player.hp} / ${player.max_hp}`);

    this.updateBar(this.mpBarFill, player.mana, player.max_mana, BAR_WIDTH, 0x3366cc);
    this.mpText.setText(`${player.mana} / ${player.max_mana}`);

    // XP: use experience field and level for XP calculation
    const xpForCurrent = this.xpForLevel(player.level);
    const xpForNext = this.xpForLevel(player.level + 1);
    const xpProgress = player.experience - xpForCurrent;
    const xpNeeded = xpForNext - xpForCurrent;
    this.updateBar(this.xpBarFill, Math.max(0, xpProgress), xpNeeded, BAR_WIDTH, 0xccaa33);
    this.xpText.setText(`${player.experience} / ${xpForNext} XP`);

    this.levelText.setText(`Lv.${player.level}`);
  }

  /** Update target frame with selected entity data */
  updateTarget(
    name: string,
    level: number,
    hp: number,
    maxHp: number,
    hostile: boolean
  ): void {
    this.targetFrameContainer.setVisible(true);
    this.targetVisible = true;

    this.targetNameText.setText(name);
    this.targetNameText.setColor(hostile ? '#ff4444' : '#44cc44');
    this.targetLevelText.setText(`Lv.${level}`);

    this.updateBar(this.targetHpBarFill, hp, maxHp, 160, hostile ? 0xcc3333 : 0x33cc33);
    this.targetHpText.setText(`${hp} / ${maxHp}`);
  }

  /** Hide the target frame */
  hideTarget(): void {
    this.targetFrameContainer.setVisible(false);
    this.targetVisible = false;
  }

  /** Update ability bar cooldowns */
  updateCooldowns(cooldowns: Map<string, CooldownInfo>): void {
    for (const slot of this.abilitySlots) {
      const cd = cooldowns.get(slot.abilityId);
      if (cd && cd.remaining > 0) {
        slot.cooldownOverlay.setVisible(true);
        slot.cooldownOverlay.setAlpha(0.6);
        const pct = cd.remaining / cd.totalDuration;
        slot.cooldownOverlay.setScale(1, pct);
        slot.cooldownText.setText(Math.ceil(cd.remaining).toString());
        slot.cooldownText.setVisible(true);
      } else {
        slot.cooldownOverlay.setVisible(false);
        slot.cooldownText.setVisible(false);
      }
    }
  }

  /** Update buff/debuff icons */
  updateBuffs(buffs: ActiveBuff[]): void {
    // Clear old icons
    for (const [, icon] of this.buffIcons) {
      icon.destroy();
    }
    this.buffIcons.clear();

    const maxDisplay = 10;
    const iconSize = 24;
    const gap = 2;

    for (let i = 0; i < Math.min(buffs.length, maxDisplay); i++) {
      const buff = buffs[i];
      const x = i * (iconSize + gap);
      const isDebuff = buff.effects.some(e => e.value < 0);
      const color = isDebuff ? 0x8844cc : 0x44cc44;

      const icon = this.scene.add.graphics();
      icon.fillStyle(color, 0.9);
      icon.fillRoundedRect(0, 0, iconSize, iconSize, 3);
      icon.lineStyle(1, 0xffffff, 0.5);
      icon.strokeRoundedRect(0, 0, iconSize, iconSize, 3);

      // Stack count
      if (buff.stacks > 1) {
        // We can't draw text in graphics, so we skip stacks here
        // A production version would use a text object
      }

      this.buffContainer.add(icon);
      this.buffIcons.set(buff.buff_id, icon);
    }
  }

  /** Update minimap with entity positions */
  updateMinimap(
    playerX: number,
    playerY: number,
    worldWidth: number,
    worldHeight: number,
    entities: { x: number; y: number; hostile: boolean }[],
    cameraX: number,
    cameraY: number,
    cameraWidth: number,
    cameraHeight: number
  ): void {
    this.minimapDots.clear();
    this.minimapPlayerDot.clear();

    const scale = MINIMAP_SIZE / Math.max(worldWidth, worldHeight);

    // Draw entity dots
    for (const entity of entities) {
      const mx = entity.x * scale;
      const my = entity.y * scale;
      const color = entity.hostile ? 0xff4444 : 0x44cc44;
      this.minimapDots.fillStyle(color, 0.8);
      this.minimapDots.fillRect(mx - 1, my - 1, 3, 3);
    }

    // Draw player dot (white, larger)
    const px = playerX * scale;
    const py = playerY * scale;
    this.minimapPlayerDot.fillStyle(0xffffff, 1);
    this.minimapPlayerDot.fillRect(px - 2, py - 2, 5, 5);

    // Draw camera viewport rectangle
    const cx = cameraX * scale;
    const cy = cameraY * scale;
    const cw = cameraWidth * scale;
    const ch = cameraHeight * scale;
    this.minimapPlayerDot.lineStyle(1, 0xffff00, 0.5);
    this.minimapPlayerDot.strokeRect(cx, cy, cw, ch);
  }

  /** Call every frame */
  update(_dt: number): void {
    // Animations, tooltips, etc. can go here
  }

  // ─── Private Creation ─────────────────────────────────────

  private createHealthBar(): void {
    const x = 20;
    const y = GAME_CONFIG.VIEWPORT_HEIGHT - BAR_HEIGHT - 80;

    this.hpBarBg = this.scene.add.graphics();
    this.hpBarBg.fillStyle(0x222233, 0.9);
    this.hpBarBg.fillRoundedRect(x, y, BAR_WIDTH, BAR_HEIGHT, 4);
    this.hpBarBg.setScrollFactor(0).setDepth(100);
    this.container.add(this.hpBarBg);

    this.hpBarFill = this.scene.add.graphics();
    this.hpBarFill.setScrollFactor(0).setDepth(101);
    this.container.add(this.hpBarFill);

    this.hpText = this.scene.add.text(x + BAR_WIDTH / 2, y + BAR_HEIGHT / 2, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    this.container.add(this.hpText);

    // Label
    const label = this.scene.add.text(x - 2, y - 14, 'HP', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#cc6666',
    }).setScrollFactor(0).setDepth(100);
    this.container.add(label);
  }

  private createManaBar(): void {
    const x = 20;
    const y = GAME_CONFIG.VIEWPORT_HEIGHT - BAR_HEIGHT - 56;

    this.mpBarBg = this.scene.add.graphics();
    this.mpBarBg.fillStyle(0x222233, 0.9);
    this.mpBarBg.fillRoundedRect(x, y, BAR_WIDTH, BAR_HEIGHT, 4);
    this.mpBarBg.setScrollFactor(0).setDepth(100);
    this.container.add(this.mpBarBg);

    this.mpBarFill = this.scene.add.graphics();
    this.mpBarFill.setScrollFactor(0).setDepth(101);
    this.container.add(this.mpBarFill);

    this.mpText = this.scene.add.text(x + BAR_WIDTH / 2, y + BAR_HEIGHT / 2, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    this.container.add(this.mpText);

    const label = this.scene.add.text(x - 2, y - 14, 'MP', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#6688cc',
    }).setScrollFactor(0).setDepth(100);
    this.container.add(label);
  }

  private createXPBar(): void {
    const x = 20;
    const y = GAME_CONFIG.VIEWPORT_HEIGHT - 14;

    this.xpBarBg = this.scene.add.graphics();
    this.xpBarBg.fillStyle(0x222233, 0.7);
    this.xpBarBg.fillRoundedRect(x, y, BAR_WIDTH, 10, 3);
    this.xpBarBg.setScrollFactor(0).setDepth(100);
    this.container.add(this.xpBarBg);

    this.xpBarFill = this.scene.add.graphics();
    this.xpBarFill.setScrollFactor(0).setDepth(101);
    this.container.add(this.xpBarFill);

    this.xpText = this.scene.add.text(x + BAR_WIDTH / 2, y + 5, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      color: '#ccccaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    this.container.add(this.xpText);
  }

  private createLevelDisplay(): void {
    this.levelText = this.scene.add.text(225, GAME_CONFIG.VIEWPORT_HEIGHT - 95, 'Lv.1', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c0a040',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setScrollFactor(0).setDepth(103);
    this.container.add(this.levelText);
  }

  private createAbilityBar(): void {
    const totalSlots = GAME_CONFIG.ABILITY_BAR_SLOTS;
    const totalWidth = totalSlots * (ABILITY_SLOT_SIZE + ABILITY_SLOT_GAP) - ABILITY_SLOT_GAP;
    const startX = (GAME_CONFIG.VIEWPORT_WIDTH - totalWidth) / 2;
    const startY = GAME_CONFIG.VIEWPORT_HEIGHT - ABILITY_SLOT_SIZE - 18;

    for (let i = 0; i < totalSlots; i++) {
      const x = startX + i * (ABILITY_SLOT_SIZE + ABILITY_SLOT_GAP);

      // Slot background
      const bg = this.scene.add.graphics();
      bg.fillStyle(0x1a1a2e, 0.9);
      bg.fillRoundedRect(x, startY, ABILITY_SLOT_SIZE, ABILITY_SLOT_SIZE, 4);
      bg.lineStyle(1, 0x444466);
      bg.strokeRoundedRect(x, startY, ABILITY_SLOT_SIZE, ABILITY_SLOT_SIZE, 4);
      bg.setScrollFactor(0).setDepth(100);
      this.container.add(bg);

      // Cooldown overlay
      const cooldownOverlay = this.scene.add.graphics();
      cooldownOverlay.fillStyle(0x000000, 0.6);
      cooldownOverlay.fillRect(x, startY, ABILITY_SLOT_SIZE, ABILITY_SLOT_SIZE);
      cooldownOverlay.setScrollFactor(0).setDepth(101);
      cooldownOverlay.setVisible(false);
      this.container.add(cooldownOverlay);

      // Cooldown text
      const cooldownText = this.scene.add.text(
        x + ABILITY_SLOT_SIZE / 2,
        startY + ABILITY_SLOT_SIZE / 2,
        '',
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(102).setVisible(false);
      this.container.add(cooldownText);

      // Keybind label
      const keyLabel = i === 9 ? '0' : String(i + 1);
      const keyText = this.scene.add.text(
        x + ABILITY_SLOT_SIZE - 3,
        startY + ABILITY_SLOT_SIZE - 3,
        keyLabel,
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '9px',
          color: '#888888',
        }
      ).setOrigin(1, 1).setScrollFactor(0).setDepth(102);
      this.container.add(keyText);

      this.abilitySlots.push({
        slotIndex: i,
        abilityId: `ability_${i}`, // placeholder; real impl maps from player data
        bg,
        cooldownOverlay,
        cooldownText,
      });
    }
  }

  private createTargetFrame(): void {
    this.targetFrameContainer = this.scene.add.container(0, 0);
    this.targetFrameContainer.setScrollFactor(0).setDepth(100);
    this.targetFrameContainer.setVisible(false);
    this.container.add(this.targetFrameContainer);

    const x = GAME_CONFIG.VIEWPORT_WIDTH / 2 - 85;
    const y = 20;

    // Frame background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.9);
    bg.fillRoundedRect(x, y, 170, 60, 6);
    bg.lineStyle(1, 0x555577);
    bg.strokeRoundedRect(x, y, 170, 60, 6);
    this.targetFrameContainer.add(bg);

    this.targetNameText = this.scene.add.text(x + 8, y + 6, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.targetFrameContainer.add(this.targetNameText);

    this.targetLevelText = this.scene.add.text(x + 160, y + 6, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#aaaaaa',
    }).setOrigin(1, 0);
    this.targetFrameContainer.add(this.targetLevelText);

    // HP bar
    this.targetHpBarBg = this.scene.add.graphics();
    this.targetHpBarBg.fillStyle(0x333333, 1);
    this.targetHpBarBg.fillRoundedRect(x + 5, y + 28, 160, 12, 3);
    this.targetFrameContainer.add(this.targetHpBarBg);

    this.targetHpBarFill = this.scene.add.graphics();
    this.targetFrameContainer.add(this.targetHpBarFill);

    this.targetHpText = this.scene.add.text(x + 85, y + 34, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);
    this.targetFrameContainer.add(this.targetHpText);
  }

  private createBuffContainer(): void {
    this.buffContainer = this.scene.add.container(20, 60);
    this.buffContainer.setScrollFactor(0).setDepth(100);
    this.container.add(this.buffContainer);
  }

  private createMinimap(): void {
    const x = GAME_CONFIG.VIEWPORT_WIDTH - MINIMAP_SIZE - 12;
    const y = 12;

    this.minimapContainer = this.scene.add.container(x, y);
    this.minimapContainer.setScrollFactor(0).setDepth(95);
    this.container.add(this.minimapContainer);

    // Background
    this.minimapBg = this.scene.add.graphics();
    this.minimapBg.fillStyle(0x111122, 0.85);
    this.minimapBg.fillRoundedRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE, 6);
    this.minimapBg.lineStyle(2, 0x444466);
    this.minimapBg.strokeRoundedRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE, 6);
    this.minimapContainer.add(this.minimapBg);

    // Entity dots layer
    this.minimapDots = this.scene.add.graphics();
    this.minimapContainer.add(this.minimapDots);

    // Player dot layer
    this.minimapPlayerDot = this.scene.add.graphics();
    this.minimapContainer.add(this.minimapPlayerDot);

    // Label
    const label = this.scene.add.text(MINIMAP_SIZE / 2, -2, 'MAP', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      color: '#6666aa',
    }).setOrigin(0.5, 1);
    this.minimapContainer.add(label);
  }

  // ─── Helpers ──────────────────────────────────────────────

  private updateBar(
    fillGraphics: Phaser.GameObjects.Graphics,
    current: number,
    max: number,
    width: number,
    color: number
  ): void {
    fillGraphics.clear();
    const pct = Math.max(0, Math.min(1, max > 0 ? current / max : 0));
    const fillWidth = (width - 4) * pct;
    fillGraphics.fillStyle(color, 1);
    // Match the bg rounded rect position (same x/y as the parent)
    fillGraphics.fillRoundedRect(2, 2, fillWidth, BAR_HEIGHT - 4, 3);
  }

  private xpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.8) + 50 * level);
  }

  destroy(): void {
    this.container.destroy();
    for (const [, icon] of this.buffIcons) icon.destroy();
  }
}

// ─── Ability Slot UI ─────────────────────────────────────────
interface AbilitySlotUI {
  slotIndex: number;
  abilityId: string;
  bg: Phaser.GameObjects.Graphics;
  cooldownOverlay: Phaser.GameObjects.Graphics;
  cooldownText: Phaser.GameObjects.Text;
}
