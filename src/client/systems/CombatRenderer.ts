// ============================================================
// Nexus Realms — Combat Renderer
// Floating damage numbers, ability VFX, cast bars,
// cooldown display, hit flash, death & loot effects
// ============================================================

import Phaser from 'phaser';
import { DamageEvent, HealEvent, AbilityEffectEvent } from '../network/NetworkHandler';
import { EntityManager, EntitySprite } from './EntityManager';
import { ParticleSystem } from './ParticleSystem';
import { SoundManager } from './SoundManager';
import { GAME_CONFIG, MonsterData } from '../../shared/types';

// ─── Damage Type Colors ──────────────────────────────────────
const DAMAGE_COLORS: Record<string, string> = {
  physical: '#ffffff',
  fire: '#ff6633',
  ice: '#66ccff',
  lightning: '#ffff33',
  holy: '#ffee88',
  shadow: '#cc66ff',
  nature: '#33cc66',
  arcane: '#ff66ff',
};

const HEAL_COLOR = '#33ff66';
const CRIT_COLOR = '#ffcc00';

// ─── Floating Text ───────────────────────────────────────────
interface FloatingText {
  text: Phaser.GameObjects.Text;
  lifetime: number;
  elapsed: number;
  velocityY: number;
  velocityX: number;
}

// ─── Ability VFX ─────────────────────────────────────────────
interface AbilityVFX {
  graphics: Phaser.GameObjects.Graphics;
  lifetime: number;
  elapsed: number;
  type: 'circle' | 'line' | 'cone';
}

// ─── Cooldown Info ───────────────────────────────────────────
export interface CooldownInfo {
  abilityId: string;
  slot: number;
  totalDuration: number;
  remaining: number;
}

// ─── Combat Renderer ─────────────────────────────────────────
export class CombatRenderer {
  private scene: Phaser.Scene;
  private entityManager: EntityManager;
  private particles: ParticleSystem;
  private sound: SoundManager;
  private floatingTexts: FloatingText[] = [];
  private abilityVFX: AbilityVFX[] = [];
  private vfxContainer: Phaser.GameObjects.Container;
  private textContainer: Phaser.GameObjects.Container;

  // Cooldowns
  private cooldowns: Map<string, CooldownInfo> = new Map();

  // Cast bar
  private castBarBg: Phaser.GameObjects.Graphics | null = null;
  private castBarFill: Phaser.GameObjects.Graphics | null = null;
  private castBarText: Phaser.GameObjects.Text | null = null;
  private castProgress: number = 0;
  private castDuration: number = 0;
  private castActive: boolean = false;

  // Loot sparkle tracking
  private lootSparkles: Map<string, number> = new Map();

  constructor(
    scene: Phaser.Scene,
    entityManager: EntityManager,
    particles: ParticleSystem,
    sound: SoundManager,
  ) {
    this.scene = scene;
    this.entityManager = entityManager;
    this.particles = particles;
    this.sound = sound;

    this.vfxContainer = scene.add.container(0, 0);
    this.vfxContainer.setDepth(20);

    this.textContainer = scene.add.container(0, 0);
    this.textContainer.setDepth(25);
  }

  // ─── Event Handlers ───────────────────────────────────────

  handleDamage(events: DamageEvent[]): void {
    for (const evt of events) {
      const target = this.entityManager.getEntity(evt.target_id);
      if (!target) continue;

      const color = evt.critical ? CRIT_COLOR : (DAMAGE_COLORS[evt.damage_type] ?? '#ffffff');
      const prefix = evt.critical ? '💥 ' : '';
      const suffix = evt.blocked > 0 ? ` (${evt.blocked})` : '';
      const fontSize = evt.critical ? 22 : 16;

      this.spawnFloatingText(
        target.sprite.x + (Math.random() - 0.5) * 20,
        target.sprite.y - target.sprite.displayHeight / 2,
        `${prefix}${evt.amount}${suffix}`,
        color,
        fontSize,
        evt.critical,
      );

      // Hit flash
      this.hitFlash(target);

      // Particles
      const particleColor = this.getDamageParticleColor(evt.damage_type);
      this.particles.spawnHitEffect(target.sprite.x, target.sprite.y, particleColor);

      // Sound
      const source = this.entityManager.getEntity(evt.source_id);
      const isLocalSource = source?.isLocalPlayer ?? false;
      if (isLocalSource) {
        if (evt.critical) {
          this.sound.playCritical();
        } else {
          this.sound.playSwordHit();
        }
      }

      // Camera shake on crit
      if (evt.critical && (target.isLocalPlayer || isLocalSource)) {
        const cam = this.scene.cameras.main;
        cam.shake(100, 0.005);
      }
    }
  }

  handleHeals(events: HealEvent[]): void {
    for (const evt of events) {
      const target = this.entityManager.getEntity(evt.target_id);
      if (!target) continue;

      this.spawnFloatingText(
        target.sprite.x + (Math.random() - 0.5) * 10,
        target.sprite.y - target.sprite.displayHeight / 2,
        `+${evt.amount}`,
        HEAL_COLOR,
        16,
        false,
      );

      this.particles.spawnHealEffect(target.sprite.x, target.sprite.y);

      if (this.entityManager.getEntity(evt.source_id)?.isLocalPlayer) {
        this.sound.playHeal();
      }
    }
  }

  handleAbilityEffects(events: AbilityEffectEvent[]): void {
    for (const evt of events) {
      let x: number;
      let y: number;

      if (evt.target_id) {
        const target = this.entityManager.getEntity(evt.target_id);
        if (target) {
          x = target.sprite.x;
          y = target.sprite.y;
        } else if (evt.x !== undefined && evt.y !== undefined) {
          x = evt.x;
          y = evt.y;
        } else {
          continue;
        }
      } else if (evt.x !== undefined && evt.y !== undefined) {
        x = evt.x;
        y = evt.y;
      } else {
        continue;
      }

      // Determine VFX type from ability ID
      const abilityLower = evt.ability_id.toLowerCase();
      if (abilityLower.includes('fire')) {
        this.particles.spawnFireEffect(x, y);
      } else if (abilityLower.includes('frost') || abilityLower.includes('ice')) {
        this.particles.spawnIceEffect(x, y);
      } else if (abilityLower.includes('shadow')) {
        this.particles.spawnShadowEffect(x, y);
      } else if (abilityLower.includes('heal') || abilityLower.includes('holy')) {
        this.particles.spawnHealEffect(x, y);
      } else if (abilityLower.includes('lightning')) {
        const caster = this.entityManager.getEntity(evt.caster_id);
        if (caster) {
          this.particles.spawnLightningEffect(caster.sprite.x, caster.sprite.y, x, y);
        }
      }

      // Generic ability circle
      this.spawnAbilityCircle(x, y, this.getAbilityColor(evt.ability_id));

      // Sound
      const caster = this.entityManager.getEntity(evt.caster_id);
      if (caster?.isLocalPlayer) {
        this.sound.playSpellCast();
      }
    }
  }

  handleBuffEvents(events: import('../network/NetworkHandler').BuffEvent[]): void {
    for (const evt of events) {
      const target = this.entityManager.getEntity(evt.target_id);
      if (!target) continue;

      if (evt.action === 'apply' && evt.buff) {
        const isDebuff = evt.buff.effects.some(e => e.value < 0);
        const color = isDebuff ? 0x8844cc : 0x44cc44;
        this.particles.spawnBuffEffect(target.sprite.x, target.sprite.y, color);
      }
    }
  }

  handleLootDrops(events: import('../network/NetworkHandler').LootDropEvent[]): void {
    for (const evt of events) {
      this.lootSparkles.set(evt.corpse_id, 5.0); // sparkle for 5 seconds
      this.sound.playLoot();
    }
  }

  handleLevelUps(events: import('../network/NetworkHandler').LevelUpEvent[]): void {
    for (const evt of events) {
      const entity = this.entityManager.getEntity(evt.player_id);
      if (!entity) continue;

      this.particles.spawnLevelUpEffect(entity.sprite.x, entity.sprite.y);

      this.spawnFloatingText(
        entity.sprite.x,
        entity.sprite.y - entity.sprite.displayHeight / 2 - 20,
        `LEVEL UP! ${evt.level}`,
        CRIT_COLOR,
        24,
        true,
      );

      if (entity.isLocalPlayer) {
        this.sound.playLevelUp();
        this.scene.cameras.main.flash(500, 255, 215, 0, false);
      }
    }
  }

  handleDeaths(events: import('../network/NetworkHandler').DeathEvent[]): void {
    for (const evt of events) {
      const entity = this.entityManager.getEntity(evt.entity_id);
      if (!entity) continue;

      this.particles.spawnDeathEffect(entity.sprite.x, entity.sprite.y);
      this.sound.playDeath();
    }
  }

  // ─── Cast Bar ─────────────────────────────────────────────

  startCast(abilityName: string, duration: number): void {
    this.castDuration = duration;
    this.castProgress = 0;
    this.castActive = true;

    if (!this.castBarBg) {
      const cx = GAME_CONFIG.VIEWPORT_WIDTH / 2;
      const by = GAME_CONFIG.VIEWPORT_HEIGHT - 110;
      const w = 220;
      const h = 20;

      this.castBarBg = this.scene.add.graphics();
      this.castBarBg.setScrollFactor(0).setDepth(100);
      this.castBarBg.fillStyle(0x111122, 0.9);
      this.castBarBg.fillRoundedRect(cx - w / 2, by, w, h, 5);
      this.castBarBg.lineStyle(1, 0x444466);
      this.castBarBg.strokeRoundedRect(cx - w / 2, by, w, h, 5);

      this.castBarFill = this.scene.add.graphics();
      this.castBarFill.setScrollFactor(0).setDepth(101);

      this.castBarText = this.scene.add.text(cx, by + h / 2, abilityName, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    }

    this.castBarBg?.setVisible(true);
    this.castBarFill?.setVisible(true);
    this.castBarText?.setVisible(true);
    this.castBarText?.setText(abilityName);
  }

  cancelCast(): void {
    this.castActive = false;
    this.hideCastBar();
  }

  // ─── Cooldowns ────────────────────────────────────────────

  getCooldowns(): Map<string, CooldownInfo> {
    return this.cooldowns;
  }

  getCooldown(slot: number): CooldownInfo | null {
    for (const cd of this.cooldowns.values()) {
      if (cd.slot === slot) return cd;
    }
    return null;
  }

  setCooldown(abilityId: string, slot: number, duration: number): void {
    this.cooldowns.set(abilityId, {
      abilityId, slot,
      totalDuration: duration,
      remaining: duration,
    });
  }

  // ─── Update ───────────────────────────────────────────────

  update(dt: number): void {
    // Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.elapsed += dt;
      const progress = ft.elapsed / ft.lifetime;

      ft.text.x += ft.velocityX * dt;
      ft.text.y += ft.velocityY * dt;

      // Fade out in last 40%
      if (progress > 0.6) {
        ft.text.setAlpha(1 - (progress - 0.6) / 0.4);
      }

      // Scale up slightly for crits
      if (ft.velocityX !== 0) {
        ft.text.setScale(1 + progress * 0.1);
      }

      if (ft.elapsed >= ft.lifetime) {
        ft.text.destroy();
        this.floatingTexts.splice(i, 1);
      }
    }

    // Ability VFX
    for (let i = this.abilityVFX.length - 1; i >= 0; i--) {
      const vfx = this.abilityVFX[i];
      vfx.elapsed += dt;
      const progress = vfx.elapsed / vfx.lifetime;

      vfx.graphics.setAlpha(1 - progress);
      vfx.graphics.setScale(1 + progress * 0.8);

      if (vfx.elapsed >= vfx.lifetime) {
        vfx.graphics.destroy();
        this.abilityVFX.splice(i, 1);
      }
    }

    // Cast bar
    if (this.castActive) {
      this.castProgress += dt;
      if (this.castProgress >= this.castDuration) {
        this.castActive = false;
        this.hideCastBar();
      } else {
        this.drawCastBar();
      }
    }

    // Cooldowns
    for (const [id, cd] of this.cooldowns) {
      cd.remaining -= dt;
      if (cd.remaining <= 0) {
        this.cooldowns.delete(id);
      }
    }

    // Loot sparkles
    for (const [id, time] of this.lootSparkles) {
      const newTime = time - dt;
      if (newTime <= 0) {
        this.lootSparkles.delete(id);
      } else {
        this.lootSparkles.set(id, newTime);
      }
    }
  }

  // ─── Private ──────────────────────────────────────────────

  private spawnFloatingText(
    x: number, y: number, text: string, color: string,
    fontSize: number, isCrit: boolean,
  ): void {
    const textObj = this.scene.add.text(x, y, text, {
      fontFamily: 'Georgia, serif',
      fontSize: `${fontSize}px`,
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: isCrit ? 4 : 3,
    }).setOrigin(0.5);

    this.textContainer.add(textObj);

    this.floatingTexts.push({
      text: textObj,
      lifetime: isCrit ? 1.5 : 1.2,
      elapsed: 0,
      velocityY: -70 - (isCrit ? 20 : 0),
      velocityX: (Math.random() - 0.5) * 30,
    });
  }

  private spawnAbilityCircle(x: number, y: number, color: number): void {
    const g = this.scene.add.graphics();
    g.setDepth(19);

    g.lineStyle(3, color, 0.8);
    g.strokeCircle(x, y, 30);
    g.fillStyle(color, 0.2);
    g.fillCircle(x, y, 30);

    // Inner ring
    g.lineStyle(1, 0xffffff, 0.4);
    g.strokeCircle(x, y, 15);

    this.vfxContainer.add(g);

    this.abilityVFX.push({
      graphics: g,
      lifetime: 0.6,
      elapsed: 0,
      type: 'circle',
    });
  }

  private hitFlash(entity: EntitySprite): void {
    entity.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(80, () => {
      if (entity.sprite.active) {
        this.restoreTint(entity);
      }
    });
  }

  private restoreTint(entity: EntitySprite): void {
    if (entity.isLocalPlayer) {
      entity.sprite.setTint(0xffffff);
    } else if (entity.type === 'monster') {
      const d = entity.data as MonsterData;
      entity.sprite.setTint(d.hostile ? 0xff6666 : 0x88ff88);
    } else if (entity.type === 'player') {
      entity.sprite.setTint(0xaabbff);
    } else {
      entity.sprite.setTint(0x66cc66);
    }
  }

  private drawCastBar(): void {
    if (!this.castBarFill) return;

    const cx = GAME_CONFIG.VIEWPORT_WIDTH / 2;
    const by = GAME_CONFIG.VIEWPORT_HEIGHT - 110;
    const w = 220;
    const h = 20;
    const progress = Math.min(1, this.castProgress / this.castDuration);

    this.castBarFill.clear();
    // Gradient fill
    const r = Math.floor(0x44 * progress + 0x22 * (1 - progress));
    const g = Math.floor(0x88 * progress + 0x44 * (1 - progress));
    const b = Math.floor(0xcc * progress + 0x88 * (1 - progress));
    this.castBarFill.fillStyle((r << 16) | (g << 8) | b, 1);
    this.castBarFill.fillRoundedRect(cx - w / 2 + 2, by + 2, (w - 4) * progress, h - 4, 4);
  }

  private hideCastBar(): void {
    this.castBarBg?.setVisible(false);
    this.castBarFill?.setVisible(false);
    this.castBarText?.setVisible(false);
  }

  private getAbilityColor(abilityId: string): number {
    const lower = abilityId.toLowerCase();
    if (lower.includes('fire')) return 0xff4400;
    if (lower.includes('frost') || lower.includes('ice')) return 0x44aaff;
    if (lower.includes('heal') || lower.includes('holy')) return 0x44ff44;
    if (lower.includes('shadow')) return 0xaa44ff;
    if (lower.includes('lightning')) return 0xffff44;
    if (lower.includes('nature')) return 0x44cc44;
    return 0xffffff;
  }

  private getDamageParticleColor(damageType: string): number {
    const map: Record<string, number> = {
      physical: 0xffffff,
      fire: 0xff6633,
      ice: 0x66ccff,
      lightning: 0xffff33,
      holy: 0xffee88,
      shadow: 0xcc66ff,
      nature: 0x33cc66,
      arcane: 0xff66ff,
    };
    return map[damageType] ?? 0xffffff;
  }

  destroy(): void {
    for (const ft of this.floatingTexts) ft.text.destroy();
    for (const vfx of this.abilityVFX) vfx.graphics.destroy();
    this.floatingTexts = [];
    this.abilityVFX = [];
    this.vfxContainer.destroy();
    this.textContainer.destroy();
    this.castBarBg?.destroy();
    this.castBarFill?.destroy();
    this.castBarText?.destroy();
  }
}


