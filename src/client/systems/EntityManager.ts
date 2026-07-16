// ============================================================
// Nexus Realms — Entity Manager
// Manages all game entities: sprites, interpolation,
// health bars, name plates, selection highlights
// ============================================================

import Phaser from 'phaser';
import { PlayerData, MonsterData, NPCData, Direction, ClassType, GAME_CONFIG } from '../../shared/types';
import { NetworkHandler, PositionSnapshot } from '../network/NetworkHandler';
import { lerp } from '../utils/MathUtils';

// ─── Entity Sprite Wrapper ───────────────────────────────────
export interface EntitySprite {
  id: string;
  type: 'player' | 'monster' | 'npc';
  sprite: Phaser.GameObjects.Sprite;
  healthBar: EntityHealthBar;
  namePlate: Phaser.GameObjects.Text;
  selectionRing: Phaser.GameObjects.Graphics | null;
  data: PlayerData | MonsterData | NPCData;
  targetX: number;
  targetY: number;
  isLocalPlayer: boolean;
  classType?: string;
  animState: 'idle' | 'walk' | 'attack' | 'cast' | 'death';
  facingLeft: boolean;
  deathPlayed: boolean;
}

export interface EntityHealthBar {
  bg: Phaser.GameObjects.Graphics;
  fill: Phaser.GameObjects.Graphics;
  width: number;
  height: number;
}

// ─── Entity Manager ──────────────────────────────────────────
export class EntityManager {
  private scene: Phaser.Scene;
  private network: NetworkHandler;
  private entities: Map<string, EntitySprite> = new Map();
  private localPlayerId: string | null = null;
  private selectedEntityId: string | null = null;
  private entityContainer: Phaser.GameObjects.Container;

  // Entity pool for performance
  private spritePool: Phaser.GameObjects.Sprite[] = [];
  private graphicsPool: Phaser.GameObjects.Graphics[] = [];
  private maxPoolSize: number = 50;

  constructor(scene: Phaser.Scene, network: NetworkHandler) {
    this.scene = scene;
    this.network = network;
    this.entityContainer = scene.add.container(0, 0);
    this.entityContainer.setDepth(10);
  }

  // ─── Public API ───────────────────────────────────────────

  setLocalPlayerId(id: string): void {
    this.localPlayerId = id;
  }

  getLocalPlayer(): EntitySprite | null {
    if (!this.localPlayerId) return null;
    return this.entities.get(this.localPlayerId) ?? null;
  }

  getEntity(id: string): EntitySprite | null {
    return this.entities.get(id) ?? null;
  }

  getAllEntities(): Map<string, EntitySprite> {
    return this.entities;
  }

  getSelectedEntity(): EntitySprite | null {
    if (!this.selectedEntityId) return null;
    return this.entities.get(this.selectedEntityId) ?? null;
  }

  selectEntity(id: string | null): void {
    // Remove previous selection
    if (this.selectedEntityId) {
      const prev = this.entities.get(this.selectedEntityId);
      if (prev?.selectionRing) {
        prev.selectionRing.setVisible(false);
      }
    }

    this.selectedEntityId = id;

    if (id) {
      const entity = this.entities.get(id);
      if (entity) {
        if (!entity.selectionRing) {
          entity.selectionRing = this.createSelectionRing();
          this.entityContainer.add(entity.selectionRing);
        }
        entity.selectionRing.setVisible(true);
        // Pulse animation
        this.scene.tweens.add({
          targets: entity.selectionRing,
          scaleX: { from: 1.0, to: 1.3 },
          scaleY: { from: 1.0, to: 1.3 },
          alpha: { from: 0.8, to: 0.4 },
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }

  getEntityAtWorldPoint(worldX: number, worldY: number, radius: number = 24): string | null {
    let closestId: string | null = null;
    let closestDist = radius * radius;

    for (const [id, entity] of this.entities) {
      const dx = entity.sprite.x - worldX;
      const dy = entity.sprite.y - worldY;
      const dist = dx * dx + dy * dy;
      if (dist < closestDist) {
        closestDist = dist;
        closestId = id;
      }
    }
    return closestId;
  }

  cycleTarget(): string | null {
    const targetable: string[] = [];
    for (const [id, entity] of this.entities) {
      if (id === this.localPlayerId) continue;
      if (entity.type === 'monster' || entity.type === 'player') {
        targetable.push(id);
      }
    }
    if (targetable.length === 0) return null;

    const currentIndex = this.selectedEntityId
      ? targetable.indexOf(this.selectedEntityId)
      : -1;
    return targetable[(currentIndex + 1) % targetable.length];
  }

  /** Create the local player entity */
  createLocalPlayer(playerData: PlayerData): void {
    this.localPlayerId = playerData.id;
    this.createPlayerEntity(playerData, true);
  }

  /** Sync entities from the network store */
  syncEntities(): void {
    const store = this.network.getStore();

    // Spawn/update other players
    for (const [id, playerData] of store.players) {
      if (id === this.localPlayerId) continue;
      const existing = this.entities.get(id);
      if (existing) {
        existing.data = playerData;
      } else {
        this.createPlayerEntity(playerData, false);
      }
    }

    // Spawn/update monsters & NPCs
    for (const [id, entityData] of store.entities) {
      const existing = this.entities.get(id);
      if (existing) {
        existing.data = entityData;
      } else {
        this.createEntitySprite(entityData);
      }
    }

    // Remove despawned entities
    const allKnown = new Set<string>();
    if (this.localPlayerId) allKnown.add(this.localPlayerId);
    for (const id of store.players.keys()) allKnown.add(id);
    for (const id of store.entities.keys()) allKnown.add(id);

    for (const [id] of this.entities) {
      if (!allKnown.has(id)) {
        this.removeEntity(id);
      }
    }
  }

  /** Call every frame for interpolation and visual updates */
  update(renderTimestamp: number): void {
    for (const [id, entity] of this.entities) {
      // Position interpolation
      if (entity.isLocalPlayer) {
        // Local player uses predicted position
        entity.sprite.x = entity.data.x;
        entity.sprite.y = entity.data.y;
      } else {
        const snapshot = this.network.getInterpolatedPosition(id, renderTimestamp);
        if (snapshot) {
          entity.sprite.x = lerp(entity.sprite.x, snapshot.x, 0.2);
          entity.sprite.y = lerp(entity.sprite.y, snapshot.y, 0.2);
        } else {
          entity.sprite.x = entity.data.x;
          entity.sprite.y = entity.data.y;
        }
      }

      // Facing direction
      const dir = entity.data.direction;
      if (dir === Direction.LEFT || dir === Direction.UP_LEFT || dir === Direction.DOWN_LEFT) {
        entity.sprite.setFlipX(true);
        entity.facingLeft = true;
      } else if (dir === Direction.RIGHT || dir === Direction.UP_RIGHT || dir === Direction.DOWN_RIGHT) {
        entity.sprite.setFlipX(false);
        entity.facingLeft = false;
      }

      // Update health bar
      this.updateHealthBar(entity);

      // Update name plate position
      entity.namePlate.setPosition(
        entity.sprite.x,
        entity.sprite.y - entity.sprite.displayHeight / 2 - 18,
      );

      // Update selection ring
      if (entity.selectionRing && entity.selectionRing.visible) {
        entity.selectionRing.setPosition(entity.sprite.x, entity.sprite.y);
      }

      // Death animation
      const hp = 'hp' in entity.data ? entity.data.hp : 1;
      if (hp <= 0 && !entity.deathPlayed) {
        this.playDeathAnimation(entity);
      }
    }
  }

  // ─── Private Creation ─────────────────────────────────────

  private createPlayerEntity(data: PlayerData, isLocal: boolean): void {
    const textureKey = this.getTextureForClass(data.class_type);
    const sprite = this.getOrCreateSprite(data.x, data.y, textureKey);
    sprite.setOrigin(0.5, 1);
    sprite.setDepth(isLocal ? 15 : 12);
    sprite.setAlpha(1);
    sprite.setScale(1);
    sprite.setFlipX(false);
    sprite.setVisible(true);

    if (isLocal) {
      sprite.setTint(0xffffff);
    } else {
      sprite.setTint(0xaabbff);
    }

    this.entityContainer.add(sprite);

    const healthBar = this.createHealthBar();
    const nameColor = isLocal ? 0x44ff44 : 0x88aaff;
    const namePlate = this.createNamePlate(data.name, nameColor);

    const entity: EntitySprite = {
      id: data.id,
      type: 'player',
      sprite,
      healthBar,
      namePlate,
      selectionRing: null,
      data,
      targetX: data.x,
      targetY: data.y,
      isLocalPlayer: isLocal,
      classType: data.class_type,
      animState: 'idle',
      facingLeft: false,
      deathPlayed: false,
    };

    this.entities.set(data.id, entity);
  }

  private createEntitySprite(data: MonsterData | NPCData): void {
    const isMonster = 'monster_id' in data;
    const textureKey = isMonster ? this.getMonsterTexture(data as MonsterData) : 'npc_default';
    const sprite = this.getOrCreateSprite(data.x, data.y, textureKey);
    sprite.setOrigin(0.5, 1);
    sprite.setDepth(11);
    sprite.setAlpha(1);
    sprite.setScale(1);
    sprite.setFlipX(false);
    sprite.setVisible(true);

    if (isMonster) {
      const monsterData = data as MonsterData;
      sprite.setTint(monsterData.hostile ? 0xff6666 : 0x88ff88);
    } else {
      sprite.setTint(0x66cc66);
    }

    this.entityContainer.add(sprite);

    const healthBar = this.createHealthBar();
    const nameColor = isMonster ? 0xff4444 : 0x44cc44;
    const namePlate = this.createNamePlate(data.name, nameColor);

    const entity: EntitySprite = {
      id: data.id,
      type: isMonster ? 'monster' : 'npc',
      sprite,
      healthBar,
      namePlate,
      selectionRing: null,
      data,
      targetX: data.x,
      targetY: data.y,
      isLocalPlayer: false,
      animState: 'idle',
      facingLeft: false,
      deathPlayed: false,
    };

    this.entities.set(data.id, entity);
  }

  private removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (!entity) return;

    // Return sprite to pool
    entity.sprite.setVisible(false);
    if (this.spritePool.length < this.maxPoolSize) {
      this.spritePool.push(entity.sprite);
    } else {
      entity.sprite.destroy();
    }

    // Return graphics to pool
    this.returnHealthBar(entity.healthBar);

    entity.namePlate.destroy();
    if (entity.selectionRing) {
      entity.selectionRing.destroy();
    }

    this.entities.delete(id);

    if (this.selectedEntityId === id) {
      this.selectedEntityId = null;
    }
  }

  // ─── Health Bars ──────────────────────────────────────────

  private createHealthBar(): EntityHealthBar {
    const barWidth = 40;
    const barHeight = 4;

    const bg = this.getOrCreateGraphics();
    bg.clear();
    bg.fillStyle(0x222222, 0.8);
    bg.fillRect(-barWidth / 2, 0, barWidth, barHeight);
    bg.lineStyle(1, 0x444444, 0.4);
    bg.strokeRect(-barWidth / 2, 0, barWidth, barHeight);
    bg.setDepth(16);
    bg.setVisible(true);
    this.entityContainer.add(bg);

    const fill = this.getOrCreateGraphics();
    fill.clear();
    fill.setDepth(17);
    fill.setVisible(true);
    this.entityContainer.add(fill);

    return { bg, fill, width: barWidth, height: barHeight };
  }

  private updateHealthBar(entity: EntitySprite): void {
    const data = entity.data;
    const hp = 'hp' in data ? (data as { hp: number }).hp : 0;
    const maxHp = 'max_hp' in data ? (data as { max_hp: number }).max_hp : 0;

    if (hp <= 0 || maxHp <= 0 || hp >= maxHp) {
      entity.healthBar.bg.setVisible(false);
      entity.healthBar.fill.setVisible(false);
      return;
    }

    entity.healthBar.bg.setVisible(true);
    entity.healthBar.fill.setVisible(true);

    const yOffset = entity.sprite.displayHeight + 8;
    const barX = entity.sprite.x;
    const barY = entity.sprite.y - yOffset;

    entity.healthBar.bg.setPosition(barX, barY);
    entity.healthBar.fill.setPosition(barX, barY);

    // Draw fill
    const bar = entity.healthBar;
    bar.fill.clear();
    const pct = Math.max(0, Math.min(1, hp / maxHp));
    const fillWidth = bar.width * pct;

    let color = 0x33cc33;
    if (pct < 0.3) color = 0xcc3333;
    else if (pct < 0.6) color = 0xccaa33;

    bar.fill.fillStyle(color, 1);
    bar.fill.fillRect(-bar.width / 2, 0, fillWidth, bar.height);

    // Highlight on top
    bar.fill.fillStyle(0xffffff, 0.2);
    bar.fill.fillRect(-bar.width / 2, 0, fillWidth, 1);
  }

  private returnHealthBar(bar: EntityHealthBar): void {
    bar.bg.setVisible(false);
    bar.fill.setVisible(false);
    if (this.graphicsPool.length < this.maxPoolSize * 2) {
      this.graphicsPool.push(bar.bg, bar.fill);
    } else {
      bar.bg.destroy();
      bar.fill.destroy();
    }
  }

  // ─── Name Plates ──────────────────────────────────────────

  private createNamePlate(name: string, color: number): Phaser.GameObjects.Text {
    const colorStr = '#' + color.toString(16).padStart(6, '0');
    const text = this.scene.add.text(0, 0, name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: colorStr,
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 1);
    text.setDepth(18);
    this.entityContainer.add(text);
    return text;
  }

  // ─── Selection Ring ───────────────────────────────────────

  private createSelectionRing(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    g.lineStyle(2, 0x00ff00, 0.8);
    g.strokeCircle(0, 0, 18);
    g.lineStyle(1, 0x00ff00, 0.4);
    g.strokeCircle(0, 0, 22);
    g.setDepth(5);
    g.setVisible(false);
    return g;
  }

  // ─── Death Animation ─────────────────────────────────────

  private playDeathAnimation(entity: EntitySprite): void {
    entity.deathPlayed = true;
    entity.animState = 'death';

    // Fade out + fall
    this.scene.tweens.add({
      targets: entity.sprite,
      alpha: 0,
      scaleY: 0.3,
      y: entity.sprite.y + 10,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        entity.sprite.setVisible(false);
      },
    });

    // Fade name plate
    this.scene.tweens.add({
      targets: entity.namePlate,
      alpha: 0,
      duration: 800,
    });

    // Hide health bar
    entity.healthBar.bg.setVisible(false);
    entity.healthBar.fill.setVisible(false);
  }

  // ─── Texture Helpers ──────────────────────────────────────

  private getTextureForClass(classType: ClassType): string {
    const map: Record<string, string> = {
      warrior: 'player_warrior',
      paladin: 'player_paladin',
      ranger: 'player_ranger',
      rogue: 'player_rogue',
      mage: 'player_mage',
      necromancer: 'player_necromancer',
      cleric: 'player_cleric',
      druid: 'player_druid',
    };
    return map[classType] ?? 'player_default';
  }

  private getMonsterTexture(data: MonsterData): string {
    const name = data.name.toLowerCase();
    if (name.includes('slime')) return 'monster_slime';
    if (name.includes('wolf')) return 'monster_wolf';
    if (name.includes('skeleton')) return 'monster_skeleton';
    if (name.includes('spider')) return 'monster_spider';
    if (name.includes('bear')) return 'monster_bear';
    if (name.includes('dragon')) return 'monster_dragon';
    if (name.includes('goblin')) return 'monster_goblin';
    if (name.includes('elemental')) return 'monster_elemental';
    return 'monster_default';
  }

  // ─── Object Pooling ──────────────────────────────────────

  private getOrCreateSprite(x: number, y: number, texture: string): Phaser.GameObjects.Sprite {
    if (this.spritePool.length > 0) {
      const sprite = this.spritePool.pop()!;
      sprite.setPosition(x, y);
      sprite.setTexture(texture);
      return sprite;
    }
    return this.scene.add.sprite(x, y, texture);
  }

  private getOrCreateGraphics(): Phaser.GameObjects.Graphics {
    if (this.graphicsPool.length > 0) {
      return this.graphicsPool.pop()!;
    }
    return this.scene.add.graphics();
  }

  destroy(): void {
    for (const [id] of this.entities) {
      this.removeEntity(id);
    }
    for (const s of this.spritePool) s.destroy();
    for (const g of this.graphicsPool) g.destroy();
    this.spritePool = [];
    this.graphicsPool = [];
    this.entityContainer.destroy();
  }
}
