// ============================================================
// Nexus Realms — Game Scene
// Main gameplay scene: tilemap, entities, input, camera,
// HUD, combat, particles, sound, and network integration
// ============================================================

import Phaser from 'phaser';
import { WebSocketClient } from '../network/WebSocketClient';
import { NetworkHandler } from '../network/NetworkHandler';
import { InputManager, InputAction } from '../systems/InputManager';
import { CameraManager } from '../systems/CameraManager';
import { EntityManager } from '../systems/EntityManager';
import { CombatRenderer } from '../systems/CombatRenderer';
import { TilemapRenderer } from '../systems/TilemapRenderer';
import { ParticleSystem } from '../systems/ParticleSystem';
import { SoundManager } from '../systems/SoundManager';
import { HUD } from '../ui/HUD';
import { InventoryUI } from '../ui/InventoryUI';
import { ChatUI } from '../ui/ChatUI';
import { QuestTracker } from '../ui/QuestTracker';
import { MapUI } from '../ui/MapUI';
import {
  PlayerData, GAME_CONFIG, Direction, ChatChannel, MonsterData, NPCData, WeatherType,
} from '../../shared/types';

export class GameScene extends Phaser.Scene {
  // Core systems
  private ws!: WebSocketClient;
  private network!: NetworkHandler;
  private inputManager!: InputManager;
  private cameraManager!: CameraManager;
  private entityManager!: EntityManager;
  private combatRenderer!: CombatRenderer;
  private tilemapRenderer!: TilemapRenderer;
  private particles!: ParticleSystem;
  private soundManager!: SoundManager;

  // UI
  private hud!: HUD;
  private inventoryUI!: InventoryUI;
  private chatUI!: ChatUI;
  private questTracker!: QuestTracker;
  private mapUI!: MapUI;

  // Player state
  private localPlayer: PlayerData | null = null;
  private playerSpeed: number = 160;
  private worldReady: boolean = false;

  // Movement
  private moveSequence: number = 0;
  private lastMoveSendTime: number = 0;
  private moveSendInterval: number = 50; // 20Hz

  // Ability cooldowns (slot → endsAt)
  private abilityCooldowns: Map<number, number> = new Map();

  // Chat message tracking
  private lastChatCount: number = 0;

  // Weather
  private currentWeather: WeatherType = WeatherType.CLEAR;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { ws: WebSocketClient; authData: Record<string, unknown> }): void {
    this.ws = data.ws;
    this.worldReady = false;
    this.lastChatCount = 0;
    this.localPlayer = null;
    this.abilityCooldowns.clear();
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a0a1a');
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // ── Sound Manager ───────────────────────────────────────
    this.soundManager = new SoundManager();
    // Store reference on game for LoginScene to init on user interaction
    (this.game as Phaser.Game & { __soundManager?: SoundManager }).__soundManager = this.soundManager;
    this.soundManager.init();
    this.soundManager.startMusic();

    // ── Network Handler ─────────────────────────────────────
    this.network = new NetworkHandler(this.ws);

    // ── Particle System ─────────────────────────────────────
    this.particles = new ParticleSystem(this);

    // ── Tilemap Renderer ────────────────────────────────────
    this.tilemapRenderer = new TilemapRenderer(this);
    this.tilemapRenderer.setWorldSize(256, 256);

    // ── Entity Manager ──────────────────────────────────────
    this.entityManager = new EntityManager(this, this.network);

    // ── Combat Renderer ─────────────────────────────────────
    this.combatRenderer = new CombatRenderer(this, this.entityManager, this.particles, this.soundManager);

    // ── Input Manager ───────────────────────────────────────
    this.inputManager = new InputManager(this);
    this.inputManager.setInputCallback(this.handleInput.bind(this));

    // ── Camera Manager ──────────────────────────────────────
    this.cameraManager = new CameraManager(this.cameras.main, {
      followSmoothTime: 0.12,
      minZoom: 0.5,
      maxZoom: 2.0,
      zoomStep: 0.1,
    });

    // ── HUD ─────────────────────────────────────────────────
    this.hud = new HUD(this);

    // ── Inventory ───────────────────────────────────────────
    this.inventoryUI = new InventoryUI(this);
    this.inventoryUI.setCallbacks({
      onMoveItem: (from, to) => this.ws.send('inventory.move', { from_slot: from, to_slot: to }),
      onUseItem: (slot) => this.ws.send('inventory.use_item', { slot }),
      onEquipItem: (itemSlot, equipSlot) => this.ws.send('equipment.equip', { item_slot: itemSlot, equip_slot: equipSlot }),
      onUnequipItem: (equipSlot) => this.ws.send('equipment.unequip', { equip_slot: equipSlot }),
    });

    // ── Chat ────────────────────────────────────────────────
    this.chatUI = new ChatUI(this);
    this.chatUI.setOnSendMessage((channel, message, target) => {
      this.ws.send('chat.send', { channel, message, target: target ?? '' });
    });

    // ── Quest Tracker ───────────────────────────────────────
    this.questTracker = new QuestTracker(this);

    // ── Map UI ──────────────────────────────────────────────
    this.mapUI = new MapUI(this);
    this.mapUI.setWorldSize(256, 256);

    // ── Check for auth data (arrives via ws.on) ─────────────
    const store = this.network.getStore();

    // Auth success handler
    this.ws.on('auth.success', () => {
      this.localPlayer = store.localPlayer;
      if (this.localPlayer && !this.worldReady) {
        this.setupWorld();
      }
    });

    // Zone transition handler
    this.ws.on('zone.transition', () => {
      this.worldReady = false;
      this.time.delayedCall(200, () => {
        this.localPlayer = store.localPlayer;
        if (this.localPlayer) {
          this.setupWorld();
        }
      });
    });

    // Also check immediately (auth may have already arrived)
    this.time.delayedCall(100, () => {
      this.localPlayer = store.localPlayer;
      if (this.localPlayer && !this.worldReady) {
        this.setupWorld();
      }
    });
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000;
    const now = time;

    // ── Network state sync ──────────────────────────────────
    this.network.update(dt);

    // ── Check for late auth ─────────────────────────────────
    const store = this.network.getStore();
    if (!this.localPlayer && store.localPlayer) {
      this.localPlayer = store.localPlayer;
      if (!this.worldReady) this.setupWorld();
    }

    // ── Input ───────────────────────────────────────────────
    this.inputManager.update();

    // ── Entity sync & interpolation ─────────────────────────
    this.entityManager.syncEntities();
    this.entityManager.update(now);

    // ── Movement prediction & sending ───────────────────────
    if (this.localPlayer && now - this.lastMoveSendTime >= this.moveSendInterval) {
      this.sendMovement();
      this.lastMoveSendTime = now;
    }

    // ── Camera ──────────────────────────────────────────────
    const localSprite = this.entityManager.getLocalPlayer();
    if (localSprite) {
      this.cameraManager.setFollowTarget(localSprite.sprite);
    }
    this.cameraManager.update(dt);

    // ── Tilemap ─────────────────────────────────────────────
    if (this.localPlayer) {
      this.tilemapRenderer.loadChunksAround(this.localPlayer.x, this.localPlayer.y, 2);
      this.tilemapRenderer.update(dt, this.localPlayer.x, this.localPlayer.y);
    }

    // ── Combat events ───────────────────────────────────────
    const events = this.network.consumePendingEvents();
    this.combatRenderer.handleDamage(events.damage);
    this.combatRenderer.handleHeals(events.heals);
    this.combatRenderer.handleAbilityEffects(events.abilities);
    this.combatRenderer.handleBuffEvents(events.buffs);
    this.combatRenderer.handleLootDrops(events.lootDrops);
    this.combatRenderer.handleLevelUps(events.levelUps);
    this.combatRenderer.handleDeaths(events.deaths);
    this.combatRenderer.update(dt);

    // ── Particles ───────────────────────────────────────────
    this.particles.update(dt);

    // Environmental particles
    if (this.localPlayer) {
      const cam = this.cameras.main;
      this.particles.updateEnvironment(
        dt,
        cam.scrollX, cam.scrollY,
        cam.width / cam.zoom, cam.height / cam.zoom,
      );
    }

    // ── Chat messages ───────────────────────────────────────
    while (this.lastChatCount < store.chatMessages.length) {
      this.chatUI.addMessage(store.chatMessages[this.lastChatCount]);
      this.lastChatCount++;
    }

    // ── Notifications ───────────────────────────────────────
    for (const notif of store.notifications) {
      if (notif.type === 'error') {
        this.chatUI.addSystemMessage(`⚠ ${notif.message}`);
      } else if (notif.type === 'quest_complete') {
        this.chatUI.addSystemMessage(`✨ ${notif.message}`);
      }
    }
    store.notifications.length = 0;

    // ── HUD updates ─────────────────────────────────────────
    if (this.localPlayer) {
      this.hud.updatePlayer(this.localPlayer);

      // Minimap
      const entities: { x: number; y: number; hostile: boolean }[] = [];
      for (const [, entity] of this.entityManager.getAllEntities()) {
        const data = entity.data;
        const hostile = 'hostile' in data ? !!(data as MonsterData | NPCData).hostile : false;
        entities.push({ x: entity.sprite.x, y: entity.sprite.y, hostile });
      }

      this.hud.updateMinimap(
        this.localPlayer.x, this.localPlayer.y,
        256 * GAME_CONFIG.TILE_SIZE, 256 * GAME_CONFIG.TILE_SIZE,
        entities,
        this.cameras.main.scrollX, this.cameras.main.scrollY,
        this.cameras.main.width / this.cameras.main.zoom,
        this.cameras.main.height / this.cameras.main.zoom,
      );

      // Quest tracker
      this.questTracker.updateQuests(store.questLog);

      // Map UI
      this.mapUI.setPlayerPosition(this.localPlayer.x, this.localPlayer.y);
    }

    // Target frame
    const selected = this.entityManager.getSelectedEntity();
    if (selected) {
      const data = selected.data;
      const hp = 'hp' in data ? (data as { hp: number }).hp : 0;
      const maxHp = 'max_hp' in data ? (data as { max_hp: number }).max_hp : 0;
      const level = 'level' in data ? (data as { level: number }).level : 1;
      const hostile = 'hostile' in data ? !!(data as MonsterData | NPCData).hostile : false;
      this.hud.updateTarget(data.name, level, hp, maxHp, hostile);
    } else {
      this.hud.hideTarget();
    }

    // Cooldowns
    this.hud.updateCooldowns(this.combatRenderer.getCooldowns());

    // Weather
    if (store.weather && store.weather.weather !== this.currentWeather) {
      this.currentWeather = store.weather.weather;
      this.applyWeather(this.currentWeather);
    }
  }

  // ─── World Setup ──────────────────────────────────────────

  private setupWorld(): void {
    if (!this.localPlayer || this.worldReady) return;
    this.worldReady = true;

    this.entityManager.createLocalPlayer(this.localPlayer);

    const localSprite = this.entityManager.getLocalPlayer();
    if (localSprite) {
      this.cameraManager.setFollowTarget(localSprite.sprite);
    }

    this.tilemapRenderer.loadChunksAround(this.localPlayer.x, this.localPlayer.y, 2);
    this.mapUI.setWorldSize(256, 256);

    // Mark network loading complete
    this.network.setLoading(false);
  }

  // ─── Input Handling ───────────────────────────────────────

  private handleInput(action: InputAction): void {
    switch (action.type) {
      case 'move':
        break; // Movement handled in update via inputManager.getMovementVector()

      case 'move_to_point':
        this.handleClickMove(action.worldX, action.worldY);
        break;

      case 'ability':
        this.useAbility(action.slot);
        break;

      case 'target':
        if (action.entityId === null) {
          const nextId = this.entityManager.cycleTarget();
          this.entityManager.selectEntity(nextId);
        } else {
          this.entityManager.selectEntity(action.entityId);
        }
        break;

      case 'interact':
        this.ws.send('player.interact', { target_id: action.targetId });
        break;

      case 'ui_toggle':
        this.handleUIToggle(action.panel);
        break;
    }
  }

  private handleClickMove(worldX: number, worldY: number): void {
    const entityId = this.entityManager.getEntityAtWorldPoint(worldX, worldY, 24);
    if (entityId) {
      this.entityManager.selectEntity(entityId);
      const entity = this.entityManager.getEntity(entityId);
      if (entity?.type === 'monster') {
        this.ws.send('player.attack', { target_id: entityId, ability_id: 'melee' });
      } else if (entity?.type === 'npc') {
        this.ws.send('player.interact', { target_id: entityId });
      }
      return;
    }

    if (this.localPlayer) {
      this.localPlayer.x = worldX;
      this.localPlayer.y = worldY;
      this.inputManager.clearClickMove();
    }
  }

  private useAbility(slot: number): void {
    if (!this.localPlayer) return;

    const cdEnds = this.abilityCooldowns.get(slot);
    if (cdEnds && Date.now() < cdEnds) {
      this.soundManager.playError();
      return;
    }

    const abilityId = `ability_${slot}`;
    const selected = this.entityManager.getSelectedEntity();

    if (selected) {
      this.ws.send('player.use_ability', { ability_id: abilityId, target_id: selected.id });
    } else {
      this.ws.send('player.use_ability', {
        ability_id: abilityId,
        x: this.localPlayer.x,
        y: this.localPlayer.y,
      });
    }

    const cooldownDuration = 1500;
    this.abilityCooldowns.set(slot, Date.now() + cooldownDuration);
    this.combatRenderer.setCooldown(abilityId, slot, cooldownDuration / 1000);
    this.soundManager.playUIClick();
  }

  private handleUIToggle(panel: string): void {
    switch (panel) {
      case 'inventory':
        this.inventoryUI.toggle();
        this.inputManager.setUIOpen(this.inventoryUI.isVisible());
        this.soundManager.playUIClick();
        break;
      case 'character':
        break;
      case 'map':
        this.mapUI.toggle();
        this.inputManager.setUIOpen(this.mapUI.isVisible());
        this.soundManager.playUIClick();
        break;
      case 'skills':
        break;
      case 'menu':
        break;
    }
  }

  // ─── Movement ─────────────────────────────────────────────

  private sendMovement(): void {
    if (!this.localPlayer) return;

    const moveVec = this.inputManager.getMovementVector();
    if (moveVec.dx === 0 && moveVec.dy === 0 && !this.inputManager.isClickMoving()) {
      return;
    }

    let targetX = this.localPlayer.x;
    let targetY = this.localPlayer.y;
    let speed = 0;

    if (moveVec.dx !== 0 || moveVec.dy !== 0) {
      targetX += moveVec.dx * this.playerSpeed * 0.05;
      targetY += moveVec.dy * this.playerSpeed * 0.05;
      speed = this.playerSpeed;
    } else if (this.inputManager.isClickMoving()) {
      const target = this.inputManager.getMoveTarget();
      if (target) {
        targetX = target.worldX;
        targetY = target.worldY;
        speed = this.playerSpeed;
      }
    }

    this.localPlayer.x = targetX;
    this.localPlayer.y = targetY;

    const direction = InputManager.vectorToDirection(
      targetX - this.localPlayer.x,
      targetY - this.localPlayer.y,
    );

    this.ws.send('player.move', {
      x: targetX,
      y: targetY,
      direction,
      speed,
      input_seq: ++this.moveSequence,
    });
  }

  // ─── Weather ──────────────────────────────────────────────

  private applyWeather(weather: WeatherType): void {
    switch (weather) {
      case WeatherType.RAIN:
        this.particles.setEnvironment('rain');
        break;
      case WeatherType.STORM:
        this.particles.setEnvironment('rain');
        break;
      case WeatherType.SNOW:
        this.particles.setEnvironment('snow');
        break;
      case WeatherType.FOG:
        this.particles.setEnvironment('dust');
        break;
      default:
        this.particles.setEnvironment('none');
        break;
    }
  }

  // ─── Cleanup ──────────────────────────────────────────────

  shutdown(): void {
    this.soundManager?.stopMusic();
    this.inputManager?.destroy();
    this.cameraManager?.destroy();
    this.entityManager?.destroy();
    this.combatRenderer?.destroy();
    this.tilemapRenderer?.destroy();
    this.particles?.destroy();
    this.hud?.destroy();
    this.inventoryUI?.destroy();
    this.chatUI?.destroy();
    this.questTracker?.destroy();
    this.mapUI?.destroy();
  }
}
