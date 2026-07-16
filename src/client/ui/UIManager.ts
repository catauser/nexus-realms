// ============================================================
// Nexus Realms — UI Manager
// Master controller for all HTML/CSS overlay UI panels
// Handles state, animations, z-index layering, and the design system
// ============================================================

import Phaser from 'phaser';
import { PlayerData, ActiveBuff, EquipmentSlot, ItemInstance, ChatChannel, GAME_CONFIG } from '../../shared/types';
import { CooldownInfo } from '../systems/CombatRenderer';
import { ChatMessage } from '../network/NetworkHandler';
import { LoginUI } from './LoginUI';
import { CharacterSheetUI } from './CharacterSheetUI';
import { GuildUI } from './GuildUI';
import { SpellbookUI } from './SpellbookUI';
import { SettingsUI } from './SettingsUI';
import { MapMarker } from './MapUI';
import { QuestDisplayData } from './QuestTracker';

// ─── Types ───────────────────────────────────────────────────
export interface UIManagerCallbacks {
  onLogin?: (username: string, password: string, remember: boolean) => void;
  onRegister?: (username: string, password: string) => void;
  onSendMessage?: (channel: ChatChannel, message: string, target?: string) => void;
  onMoveItem?: (fromSlot: number, toSlot: number) => void;
  onEquipItem?: (itemSlot: number, equipSlot: EquipmentSlot) => void;
  onUnequipItem?: (equipSlot: EquipmentSlot) => void;
  onUseItem?: (slot: number) => void;
  onQuestClick?: (questId: string) => void;
  onAbilityUse?: (abilityId: string) => void;
  onSettingsChange?: (key: string, value: unknown) => void;
}

type PanelName = 'inventory' | 'map' | 'character' | 'guild' | 'spellbook' | 'settings';

// ─── UI Manager ──────────────────────────────────────────────
export class UIManager {
  private scene: Phaser.Scene;
  private callbacks: UIManagerCallbacks = {};

  // Root containers
  private uiRoot!: HTMLElement;
  private hudRoot!: HTMLElement;
  private panelRoot!: HTMLElement;
  private overlayRoot!: HTMLElement;
  private tooltipEl!: HTMLElement;
  private notificationContainer!: HTMLElement;

  // Sub-panels (HTML-based)
  private loginUI!: LoginUI;
  private characterSheetUI!: CharacterSheetUI;
  private guildUI!: GuildUI;
  private spellbookUI!: SpellbookUI;
  private settingsUI!: SettingsUI;

  // Panel state
  private panelState: Map<PanelName, boolean> = new Map();
  private activePanels: Set<PanelName> = new Set();
  private zCounter: number = 110;

  // HUD elements
  private hpFill!: HTMLElement;
  private hpText!: HTMLElement;
  private mpFill!: HTMLElement;
  private mpText!: HTMLElement;
  private xpFill!: HTMLElement;
  private xpText!: HTMLElement;
  private levelText!: HTMLElement;
  private targetFrame!: HTMLElement;
  private targetName!: HTMLElement;
  private targetLevel!: HTMLElement;
  private targetHpFill!: HTMLElement;
  private targetHpText!: HTMLElement;
  private abilitySlots: HTMLElement[] = [];
  private buffBar!: HTMLElement;
  private chatMessages!: HTMLElement;
  private chatInputWrap!: HTMLElement;
  private chatInput!: HTMLInputElement;
  private questList!: HTMLElement;
  private inventoryGrid!: HTMLElement;
  private inventoryPanel!: HTMLElement;
  private mapPanel!: HTMLElement;
  private minimapEl!: HTMLElement;

  // Chat state
  private chatVisible: boolean = true;
  private chatInputActive: boolean = false;
  private currentChatChannel: ChatChannel = ChatChannel.SAY;
  private chatTabActive: string = 'all';
  private allChatMessages: ChatMessage[] = [];

  // Notification queue
  private notificationTimer: number = 0;

  // Loading
  private loadingScreen!: HTMLElement;
  private loadingBar!: HTMLElement;
  private loadingText!: HTMLElement;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createDOMStructure();
    this.createHUD();
    this.createChat();
    this.createInventory();
    this.createMap();
    this.createQuestTracker();
    this.createMinimap();
    this.createTooltip();
    this.createNotifications();

    // Initialize sub-panels
    this.loginUI = new LoginUI(this.uiRoot, {
      onLogin: (u, p, r) => this.callbacks.onLogin?.(u, p, r),
      onRegister: (u, p) => this.callbacks.onRegister?.(u, p),
    });
    this.characterSheetUI = new CharacterSheetUI(this.panelRoot, this.overlayRoot);
    this.guildUI = new GuildUI(this.panelRoot, this.overlayRoot);
    this.spellbookUI = new SpellbookUI(this.panelRoot, this.overlayRoot);
    this.settingsUI = new SettingsUI(this.panelRoot, this.overlayRoot, {
      onChange: (k, v) => this.callbacks.onSettingsChange?.(k, v),
    });

    this.setupKeyboardHandlers();
    this.panelState.set('inventory', false);
    this.panelState.set('map', false);
    this.panelState.set('character', false);
    this.panelState.set('guild', false);
    this.panelState.set('spellbook', false);
    this.panelState.set('settings', false);
  }

  // ─── Public API ───────────────────────────────────────────

  setCallbacks(cb: UIManagerCallbacks): void {
    this.callbacks = cb;
  }

  /** Show the login screen */
  showLogin(): void {
    this.loginUI.show();
    this.hideHUD();
  }

  /** Hide login, show game HUD */
  hideLoginShowGame(): void {
    this.loginUI.hide();
    this.showHUD();
  }

  /** Show loading screen with progress */
  showLoading(text: string = 'Loading...'): void {
    if (this.loadingScreen) {
      this.loadingScreen.classList.remove('nr-hidden', 'fade-out');
      this.updateLoading(0, text);
    }
  }

  /** Update loading progress (0-100) */
  updateLoading(progress: number, text?: string): void {
    if (this.loadingBar) {
      this.loadingBar.style.width = `${Math.min(100, progress)}%`;
    }
    if (text && this.loadingText) {
      this.loadingText.textContent = text;
    }
  }

  /** Fade out and remove loading screen */
  hideLoading(): void {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('fade-out');
      setTimeout(() => this.loadingScreen.classList.add('nr-hidden'), 600);
    }
  }

  /** Show notification toast */
  notify(type: 'info' | 'success' | 'warning' | 'error', message: string, duration: number = 3500): void {
    const el = document.createElement('div');
    el.className = `nr-notification ${type}`;
    el.textContent = message;
    this.notificationContainer.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'nr-fade-out 200ms ease forwards';
      setTimeout(() => el.remove(), 200);
    }, duration);
  }

  // ─── HUD Updates ──────────────────────────────────────────

  updatePlayer(player: PlayerData): void {
    // HP
    const hpPct = player.max_hp > 0 ? (player.hp / player.max_hp) * 100 : 0;
    this.hpFill.style.width = `${hpPct}%`;
    this.hpText.textContent = `${player.hp} / ${player.max_hp}`;

    // MP
    const mpPct = player.max_mana > 0 ? (player.mana / player.max_mana) * 100 : 0;
    this.mpFill.style.width = `${mpPct}%`;
    this.mpText.textContent = `${player.mana} / ${player.max_mana}`;

    // XP
    const xpForCurrent = this.xpForLevel(player.level);
    const xpForNext = this.xpForLevel(player.level + 1);
    const xpProgress = player.experience - xpForCurrent;
    const xpNeeded = xpForNext - xpForCurrent;
    const xpPct = xpNeeded > 0 ? Math.max(0, (xpProgress / xpNeeded) * 100) : 0;
    this.xpFill.style.width = `${xpPct}%`;
    this.xpText.textContent = `${player.experience} / ${xpForNext} XP`;

    // Level
    this.levelText.textContent = `Lv.${player.level}`;
  }

  updateTarget(name: string, level: number, hp: number, maxHp: number, hostile: boolean): void {
    this.targetFrame.classList.add('active');
    this.targetName.textContent = name;
    this.targetName.className = `nr-target-frame__name ${hostile ? 'hostile' : 'friendly'}`;
    this.targetLevel.textContent = `Lv.${level}`;
    const pct = maxHp > 0 ? (hp / maxHp) * 100 : 0;
    this.targetHpFill.style.width = `${pct}%`;
    this.targetHpFill.className = `nr-target-frame__bar-fill ${hostile ? 'hostile' : 'friendly'}`;
    this.targetHpText.textContent = `${hp} / ${maxHp}`;
  }

  hideTarget(): void {
    this.targetFrame.classList.remove('active');
  }

  updateCooldowns(cooldowns: Map<string, CooldownInfo>): void {
    for (let i = 0; i < this.abilitySlots.length; i++) {
      const slot = this.abilitySlots[i];
      const cdOverlay = slot.querySelector('.nr-ability-slot__cooldown') as HTMLElement;
      const cdText = slot.querySelector('.nr-ability-slot__cooldown-text') as HTMLElement;
      const abilityId = slot.dataset.abilityId || `ability_${i}`;
      const cd = cooldowns.get(abilityId);

      if (cd && cd.remaining > 0) {
        const pct = (cd.remaining / cd.totalDuration) * 100;
        cdOverlay.style.setProperty('--cd-progress', `${pct}%`);
        cdOverlay.classList.add('active');
        cdText.textContent = Math.ceil(cd.remaining).toString();
        cdText.classList.add('active');
      } else {
        cdOverlay.classList.remove('active');
        cdText.classList.remove('active');
      }
    }
  }

  updateBuffs(buffs: ActiveBuff[]): void {
    this.buffBar.innerHTML = '';
    for (const buff of buffs.slice(0, 12)) {
      const isDebuff = buff.effects.some(e => e.value < 0);
      const el = document.createElement('div');
      el.className = `nr-buff-icon ${isDebuff ? 'debuff' : 'buff'}`;
      el.title = buff.buff_id;

      // Icon placeholder
      const icon = document.createElement('span');
      icon.textContent = isDebuff ? '☠' : '✦';
      el.appendChild(icon);

      // Duration bar
      const durationBar = document.createElement('div');
      durationBar.className = 'nr-buff-icon__duration';
      const durPct = buff.max_duration > 0 ? (buff.duration_remaining / buff.max_duration) * 100 : 100;
      durationBar.style.width = `${durPct}%`;
      el.appendChild(durationBar);

      // Stack count
      if (buff.stacks > 1) {
        const stacks = document.createElement('span');
        stacks.className = 'nr-buff-icon__stacks';
        stacks.textContent = String(buff.stacks);
        el.appendChild(stacks);
      }

      this.buffBar.appendChild(el);
    }
  }

  // ─── Inventory ────────────────────────────────────────────

  updateInventory(slots: { index: number; item: ItemInstance | null }[]): void {
    const gridSlots = this.inventoryGrid.querySelectorAll('.nr-item-slot');
    for (const slot of slots) {
      const el = gridSlots[slot.index] as HTMLElement;
      if (!el) continue;
      this.renderItemSlot(el, slot.item);
    }
  }

  updateGold(gold: number): void {
    const goldEl = this.inventoryPanel.querySelector('.nr-inventory__gold span') as HTMLElement;
    if (goldEl) goldEl.textContent = gold.toLocaleString();
  }

  // ─── Chat ─────────────────────────────────────────────────

  addChatMessage(msg: ChatMessage): void {
    this.allChatMessages.push(msg);
    if (this.allChatMessages.length > 500) this.allChatMessages.splice(0, this.allChatMessages.length - 500);
    this.renderChatMessages();
  }

  // ─── Quest Tracker ────────────────────────────────────────

  updateQuests(quests: QuestDisplayData[]): void {
    this.questList.innerHTML = '';
    for (const quest of quests.slice(0, 6)) {
      const entry = document.createElement('div');
      entry.className = 'nr-quest-entry';
      entry.innerHTML = `
        <div class="nr-quest-entry__name">${quest.name}</div>
        ${quest.objectives.map(obj => {
          const complete = obj.current >= obj.required;
          return `<div class="nr-quest-entry__objective ${complete ? 'complete' : ''}">${obj.description}: ${obj.current}/${obj.required}</div>`;
        }).join('')}
      `;
      entry.addEventListener('click', () => this.callbacks.onQuestClick?.(quest.questId));
      this.questList.appendChild(entry);
    }
  }

  // ─── Minimap ──────────────────────────────────────────────

  updateMinimap(
    playerX: number, playerY: number,
    worldWidth: number, worldHeight: number,
    entities: { x: number; y: number; hostile: boolean }[]
  ): void {
    const canvas = this.minimapEl.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const scale = Math.min(w / worldWidth, h / worldHeight);

    // Background
    ctx.fillStyle = 'rgba(10, 10, 26, 0.8)';
    ctx.fillRect(0, 0, w, h);

    // Entity dots
    for (const e of entities) {
      ctx.fillStyle = e.hostile ? '#ff4444' : '#44cc44';
      ctx.fillRect(e.x * scale - 1, e.y * scale - 1, 3, 3);
    }

    // Player dot
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playerX * scale - 2, playerY * scale - 2, 5, 5);
  }

  // ─── Panel Toggles ────────────────────────────────────────

  togglePanel(name: PanelName): void {
    if (this.panelState.get(name)) {
      this.closePanel(name);
    } else {
      this.openPanel(name);
    }
  }

  openPanel(name: PanelName): void {
    switch (name) {
      case 'inventory':
        this.inventoryPanel.classList.add('active');
        break;
      case 'map':
        this.mapPanel.classList.add('active');
        break;
      case 'character':
        this.characterSheetUI.show();
        break;
      case 'guild':
        this.guildUI.show();
        break;
      case 'spellbook':
        this.spellbookUI.show();
        break;
      case 'settings':
        this.settingsUI.show();
        break;
    }
    this.panelState.set(name, true);
    this.activePanels.add(name);
    this.bringToFront(name);
  }

  closePanel(name: PanelName): void {
    switch (name) {
      case 'inventory':
        this.inventoryPanel.classList.remove('active');
        break;
      case 'map':
        this.mapPanel.classList.remove('active');
        break;
      case 'character':
        this.characterSheetUI.hide();
        break;
      case 'guild':
        this.guildUI.hide();
        break;
      case 'spellbook':
        this.spellbookUI.hide();
        break;
      case 'settings':
        this.settingsUI.hide();
        break;
    }
    this.panelState.set(name, false);
    this.activePanels.delete(name);
  }

  closeAllPanels(): void {
    for (const name of this.activePanels) {
      this.closePanel(name);
    }
  }

  isPanelOpen(name: PanelName): boolean {
    return this.panelState.get(name) ?? false;
  }

  // ─── Character Sheet passthrough ──────────────────────────

  updateCharacterSheet(player: PlayerData): void {
    this.characterSheetUI.updateFromPlayer(player);
  }

  // ─── Guild passthrough ────────────────────────────────────

  setGuildInfo(name: string, motd: string, level: number, memberCount: number): void {
    this.guildUI.setGuildInfo(name, motd, level, memberCount);
  }

  setGuildMembers(members: { name: string; level: number; rank: string; online: boolean }[]): void {
    this.guildUI.setMembers(members);
  }

  // ─── Spellbook passthrough ────────────────────────────────

  setSpells(spells: { id: string; name: string; icon: string; cooldown: number; locked: boolean; description: string }[]): void {
    this.spellbookUI.setSpells(spells);
  }

  // ─── Loading screen tips ──────────────────────────────────

  private loadingTips: string[] = [
    'Use WASD or arrow keys to move your character.',
    'Press 1-0 to use abilities on your action bar.',
    'Right-click items in your inventory to equip or use them.',
    'Press M to open the world map.',
    'Press C to open your character sheet.',
    'Press G to open the guild panel.',
    'Press N to open the spellbook.',
    'Press Enter to open chat, then type your message.',
    'Press Tab while typing to cycle chat channels.',
    'Complete quests to earn experience and gold!',
  ];

  // ─── Private: DOM Structure ───────────────────────────────

  private createDOMStructure(): void {
    // UI root container
    this.uiRoot = document.createElement('div');
    this.uiRoot.id = 'nr-ui-root';
    this.uiRoot.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:100;font-family:var(--nr-font-ui);';
    document.body.appendChild(this.uiRoot);

    // HUD layer
    this.hudRoot = document.createElement('div');
    this.hudRoot.id = 'nr-hud';
    this.hudRoot.className = 'nr-hud';
    this.uiRoot.appendChild(this.hudRoot);

    // Panel layer
    this.panelRoot = document.createElement('div');
    this.panelRoot.id = 'nr-panels';
    this.panelRoot.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:110;';
    this.uiRoot.appendChild(this.panelRoot);

    // Overlay layer (backdrop for modals)
    this.overlayRoot = document.createElement('div');
    this.overlayRoot.id = 'nr-overlay';
    this.overlayRoot.className = 'nr-overlay-backdrop';
    this.uiRoot.appendChild(this.overlayRoot);

    // Notification container
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.className = 'nr-notifications';
    this.uiRoot.appendChild(this.notificationContainer);

    // Loading screen
    this.loadingScreen = document.getElementById('nr-loading-screen') as HTMLElement;
    if (!this.loadingScreen) {
      this.loadingScreen = document.createElement('div');
      this.loadingScreen.id = 'nr-loading-screen';
      this.loadingScreen.className = 'nr-loading';
      document.body.appendChild(this.loadingScreen);
    }
    this.loadingBar = this.loadingScreen.querySelector('.nr-loading__bar') as HTMLElement;
    this.loadingText = this.loadingScreen.querySelector('.nr-loading__text') as HTMLElement;
  }

  // ─── Private: HUD Creation ────────────────────────────────

  private createHUD(): void {
    // Player frame (HP, MP, XP bars)
    const playerFrame = document.createElement('div');
    playerFrame.className = 'nr-player-frame';
    playerFrame.innerHTML = `
      <div class="nr-bar-container">
        <div class="nr-bar-fill nr-bar-fill--hp" style="width:100%"></div>
        <div class="nr-bar-text" data-bar="hp">0 / 0</div>
        <span class="nr-bar-label nr-bar-label--hp">HP</span>
      </div>
      <div class="nr-bar-container">
        <div class="nr-bar-fill nr-bar-fill--mp" style="width:100%"></div>
        <div class="nr-bar-text" data-bar="mp">0 / 0</div>
        <span class="nr-bar-label nr-bar-label--mp">MP</span>
      </div>
      <div class="nr-bar-container" style="height:14px;">
        <div class="nr-bar-fill nr-bar-fill--xp" style="width:0%"></div>
        <div class="nr-bar-text" data-bar="xp" style="font-size:9px;">0 / 0 XP</div>
      </div>
    `;
    this.hudRoot.appendChild(playerFrame);

    this.hpFill = playerFrame.querySelector('.nr-bar-fill--hp') as HTMLElement;
    this.hpText = playerFrame.querySelector('[data-bar="hp"]') as HTMLElement;
    this.mpFill = playerFrame.querySelector('.nr-bar-fill--mp') as HTMLElement;
    this.mpText = playerFrame.querySelector('[data-bar="mp"]') as HTMLElement;
    this.xpFill = playerFrame.querySelector('.nr-bar-fill--xp') as HTMLElement;
    this.xpText = playerFrame.querySelector('[data-bar="xp"]') as HTMLElement;

    // Level badge
    const levelBadge = document.createElement('div');
    levelBadge.className = 'nr-level-badge';
    levelBadge.textContent = 'Lv.1';
    this.hudRoot.appendChild(levelBadge);
    this.levelText = levelBadge;

    // Ability bar
    const abilityBar = document.createElement('div');
    abilityBar.className = 'nr-ability-bar';
    for (let i = 0; i < GAME_CONFIG.ABILITY_BAR_SLOTS; i++) {
      const slot = document.createElement('div');
      slot.className = 'nr-ability-slot';
      slot.dataset.abilityId = `ability_${i}`;
      slot.innerHTML = `
        <div class="nr-ability-slot__icon"></div>
        <div class="nr-ability-slot__cooldown"></div>
        <div class="nr-ability-slot__cooldown-text"></div>
        <span class="nr-ability-slot__keybind">${i === 9 ? '0' : String(i + 1)}</span>
      `;
      slot.addEventListener('click', () => {
        const abilityId = slot.dataset.abilityId;
        if (abilityId) this.callbacks.onAbilityUse?.(abilityId);
      });
      abilityBar.appendChild(slot);
      this.abilitySlots.push(slot);
    }
    this.hudRoot.appendChild(abilityBar);

    // Target frame
    this.targetFrame = document.createElement('div');
    this.targetFrame.className = 'nr-target-frame';
    this.targetFrame.innerHTML = `
      <span class="nr-target-frame__name hostile"></span>
      <span class="nr-target-frame__level"></span>
      <div class="nr-target-frame__bar">
        <div class="nr-target-frame__bar-fill hostile" style="width:100%"></div>
        <div class="nr-target-frame__bar-text"></div>
      </div>
    `;
    this.hudRoot.appendChild(this.targetFrame);
    this.targetName = this.targetFrame.querySelector('.nr-target-frame__name') as HTMLElement;
    this.targetLevel = this.targetFrame.querySelector('.nr-target-frame__level') as HTMLElement;
    this.targetHpFill = this.targetFrame.querySelector('.nr-target-frame__bar-fill') as HTMLElement;
    this.targetHpText = this.targetFrame.querySelector('.nr-target-frame__bar-text') as HTMLElement;

    // Buff bar
    this.buffBar = document.createElement('div');
    this.buffBar.className = 'nr-buff-bar';
    this.hudRoot.appendChild(this.buffBar);
  }

  // ─── Private: Chat ────────────────────────────────────────

  private createChat(): void {
    const chat = document.createElement('div');
    chat.className = 'nr-chat';
    chat.innerHTML = `
      <div class="nr-chat__tabs">
        <div class="nr-chat__tab active" data-tab="all">All</div>
        <div class="nr-chat__tab" data-tab="general">General</div>
        <div class="nr-chat__tab" data-tab="whisper">Whisper</div>
        <div class="nr-chat__tab" data-tab="party">Party</div>
        <div class="nr-chat__tab" data-tab="guild">Guild</div>
        <div class="nr-chat__tab" data-tab="trade">Trade</div>
      </div>
      <div class="nr-chat__messages"></div>
      <div class="nr-chat__input-wrap">
        <input class="nr-chat__input" type="text" placeholder="[/say] Type a message..." autocomplete="off" />
      </div>
    `;
    this.hudRoot.appendChild(chat);

    this.chatMessages = chat.querySelector('.nr-chat__messages') as HTMLElement;
    this.chatInputWrap = chat.querySelector('.nr-chat__input-wrap') as HTMLElement;
    this.chatInput = chat.querySelector('.nr-chat__input') as HTMLInputElement;

    // Tab clicks
    chat.querySelectorAll('.nr-chat__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        chat.querySelectorAll('.nr-chat__tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.chatTabActive = (tab as HTMLElement).dataset.tab || 'all';
        this.renderChatMessages();
      });
    });

    // Input handling
    this.chatInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        this.submitChat();
      } else if (e.key === 'Escape') {
        this.hideChatInput();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.cycleChatChannel();
      }
    });
  }

  private showChatInput(): void {
    this.chatInputWrap.classList.add('active');
    this.chatInputActive = true;
    this.chatInput.focus();
  }

  private hideChatInput(): void {
    this.chatInputWrap.classList.remove('active');
    this.chatInputActive = false;
    this.chatInput.value = '';
  }

  private submitChat(): void {
    const text = this.chatInput.value.trim();
    this.hideChatInput();
    if (!text) return;

    let channel = this.currentChatChannel;
    let message = text;
    let target: string | undefined;

    if (text.startsWith('/say ')) { channel = ChatChannel.SAY; message = text.slice(5); }
    else if (text.startsWith('/yell ')) { channel = ChatChannel.YELL; message = text.slice(6); }
    else if (text.startsWith('/whisper ') || text.startsWith('/w ')) {
      channel = ChatChannel.WHISPER;
      const parts = text.split(' ');
      target = parts[1];
      message = parts.slice(2).join(' ');
    } else if (text.startsWith('/party ') || text.startsWith('/p ')) {
      channel = ChatChannel.PARTY;
      message = text.replace(/^\/(party|p) /, '');
    } else if (text.startsWith('/guild ') || text.startsWith('/g ')) {
      channel = ChatChannel.GUILD;
      message = text.replace(/^\/(guild|g) /, '');
    } else if (text.startsWith('/trade ')) { channel = ChatChannel.TRADE; message = text.slice(7); }

    this.callbacks.onSendMessage?.(channel, message, target);
  }

  private cycleChatChannel(): void {
    const channels = [ChatChannel.SAY, ChatChannel.YELL, ChatChannel.WHISPER, ChatChannel.PARTY, ChatChannel.GUILD, ChatChannel.TRADE];
    const idx = channels.indexOf(this.currentChatChannel);
    this.currentChatChannel = channels[(idx + 1) % channels.length];
    this.chatInput.placeholder = `[/ ${this.currentChatChannel}] Type a message...`;
  }

  private renderChatMessages(): void {
    const filtered = this.chatTabActive === 'all'
      ? this.allChatMessages
      : this.allChatMessages.filter(m => m.channel === this.chatTabActive);

    const visible = filtered.slice(-50);
    this.chatMessages.innerHTML = '';
    for (const msg of visible) {
      const el = document.createElement('div');
      el.className = `nr-chat__message channel-${msg.channel}`;
      const prefix = msg.sender_name ? `<span class="sender">[${msg.sender_name}]</span> ` : '';
      el.innerHTML = `${prefix}${this.escapeHtml(msg.message)}`;
      this.chatMessages.appendChild(el);
    }
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  // ─── Private: Inventory ───────────────────────────────────

  private createInventory(): void {
    this.inventoryPanel = document.createElement('div');
    this.inventoryPanel.className = 'nr-inventory nr-panel';
    this.inventoryPanel.innerHTML = `
      <div class="nr-panel-header">
        <span class="nr-panel-title">Inventory</span>
        <button class="nr-panel-close" data-close="inventory" aria-label="Close inventory">✕</button>
      </div>
      <div style="display:flex;">
        <div class="nr-inventory__grid"></div>
        <div style="flex:1;padding:12px;border-left:1px solid rgba(123,104,238,0.1);">
          <div class="nr-panel-title" style="font-size:12px;margin-bottom:8px;">Equipment</div>
          <div class="nr-equipment-grid"></div>
        </div>
      </div>
      <div class="nr-inventory__gold">
        💰 <span>0</span> Gold
      </div>
    `;
    this.panelRoot.appendChild(this.inventoryPanel);

    // Create inventory slots
    this.inventoryGrid = this.inventoryPanel.querySelector('.nr-inventory__grid') as HTMLElement;
    for (let i = 0; i < GAME_CONFIG.INVENTORY_SLOTS; i++) {
      const slot = document.createElement('div');
      slot.className = 'nr-item-slot';
      slot.dataset.slot = String(i);
      slot.innerHTML = '<span class="nr-item-slot__icon nr-item-slot__empty-icon">◇</span>';
      slot.addEventListener('click', () => this.handleInventoryClick(i));
      slot.addEventListener('contextmenu', (e) => { e.preventDefault(); this.handleInventoryRightClick(i); });
      this.inventoryGrid.appendChild(slot);
    }

    // Equipment slots
    const equipGrid = this.inventoryPanel.querySelector('.nr-equipment-grid') as HTMLElement;
    const equipSlots = [
      EquipmentSlot.HEAD, EquipmentSlot.SHOULDERS, EquipmentSlot.CHEST, EquipmentSlot.HANDS,
      EquipmentSlot.LEGS, EquipmentSlot.FEET, EquipmentSlot.MAIN_HAND, EquipmentSlot.OFF_HAND,
      EquipmentSlot.RING_1, EquipmentSlot.RING_2, EquipmentSlot.NECKLACE, EquipmentSlot.TRINKET,
    ];
    for (const eqSlot of equipSlots) {
      const el = document.createElement('div');
      el.className = 'nr-equip-slot';
      el.dataset.equipSlot = eqSlot;
      el.innerHTML = `<span class="nr-equip-slot__label">${eqSlot.replace(/_/g, ' ')}</span>`;
      el.addEventListener('click', () => this.callbacks.onUnequipItem?.(eqSlot));
      equipGrid.appendChild(el);
    }

    // Close button
    this.inventoryPanel.querySelector('[data-close="inventory"]')?.addEventListener('click', () => this.closePanel('inventory'));
  }

  private handleInventoryClick(slot: number): void {
    // Left click: start drag or move (simplified — just notify)
    this.callbacks.onMoveItem?.(slot, slot); // placeholder
  }

  private handleInventoryRightClick(slot: number): void {
    this.callbacks.onUseItem?.(slot);
  }

  private renderItemSlot(el: HTMLElement, item: ItemInstance | null): void {
    if (!item) {
      el.removeAttribute('data-rarity');
      el.innerHTML = '<span class="nr-item-slot__icon nr-item-slot__empty-icon">◇</span>';
      return;
    }
    el.setAttribute('data-rarity', item.rarity || 'common');
    const shortName = (item.item_id || '').slice(0, 3).toUpperCase();
    el.innerHTML = `<span class="nr-item-slot__icon">${shortName}</span>`;
    if (item.quantity > 1) {
      el.innerHTML += `<span class="nr-item-slot__quantity">${item.quantity}</span>`;
    }
  }

  // ─── Private: Map ─────────────────────────────────────────

  private createMap(): void {
    this.mapPanel = document.createElement('div');
    this.mapPanel.className = 'nr-map nr-panel';
    this.mapPanel.innerHTML = `
      <div class="nr-panel-header">
        <span class="nr-panel-title">World Map</span>
        <button class="nr-panel-close" data-close="map" aria-label="Close map">✕</button>
      </div>
      <div class="nr-map__canvas">
        <canvas width="540" height="440" style="width:100%;height:100%;"></canvas>
      </div>
      <div class="nr-map__legend">
        <div class="nr-map__legend-item"><span class="nr-map__legend-dot" style="background:#fff;"></span>You</div>
        <div class="nr-map__legend-item"><span class="nr-map__legend-dot" style="background:#ffcc00;"></span>Quest</div>
        <div class="nr-map__legend-item"><span class="nr-map__legend-dot" style="background:#44cc44;"></span>NPC</div>
        <div class="nr-map__legend-item"><span class="nr-map__legend-dot" style="background:#66ccff;"></span>Party</div>
        <div class="nr-map__legend-item"><span class="nr-map__legend-dot" style="background:#ff4444;"></span>Dungeon</div>
      </div>
    `;
    this.panelRoot.appendChild(this.mapPanel);
    this.mapPanel.querySelector('[data-close="map"]')?.addEventListener('click', () => this.closePanel('map'));
  }

  // ─── Private: Quest Tracker ───────────────────────────────

  private createQuestTracker(): void {
    const tracker = document.createElement('div');
    tracker.className = 'nr-quest-tracker';
    tracker.innerHTML = `
      <div class="nr-quest-tracker__title">
        <span>Quests</span>
        <button class="nr-btn--ghost" data-toggle="quests" style="padding:2px 6px;font-size:14px;color:#888;">−</button>
      </div>
      <div class="nr-quest-tracker__list"></div>
    `;
    this.hudRoot.appendChild(tracker);
    this.questList = tracker.querySelector('.nr-quest-tracker__list') as HTMLElement;

    tracker.querySelector('[data-toggle="quests"]')?.addEventListener('click', () => {
      this.questList.classList.toggle('nr-hidden');
    });
  }

  // ─── Private: Minimap ─────────────────────────────────────

  private createMinimap(): void {
    this.minimapEl = document.createElement('div');
    this.minimapEl.className = 'nr-minimap';
    this.minimapEl.innerHTML = `
      <div class="nr-minimap__frame"></div>
      <span class="nr-minimap__label">MAP</span>
      <canvas width="170" height="170"></canvas>
    `;
    this.hudRoot.appendChild(this.minimapEl);
  }

  // ─── Private: Tooltip ─────────────────────────────────────

  private createTooltip(): void {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'nr-tooltip';
    this.tooltipEl.innerHTML = `
      <div class="nr-tooltip__name"></div>
      <div class="nr-tooltip__rarity"></div>
      <div class="nr-tooltip__type"></div>
      <div class="nr-tooltip__divider"></div>
      <div class="nr-tooltip__stats"></div>
      <div class="nr-tooltip__description"></div>
      <div class="nr-tooltip__flavor"></div>
      <div class="nr-tooltip__level-req"></div>
    `;
    document.body.appendChild(this.tooltipEl);
  }

  /** Show tooltip near a position */
  showTooltip(x: number, y: number, data: {
    name: string; rarity?: string; type?: string;
    stats?: string; description?: string; flavor?: string;
    levelReq?: number;
  }): void {
    const nameEl = this.tooltipEl.querySelector('.nr-tooltip__name') as HTMLElement;
    const rarityEl = this.tooltipEl.querySelector('.nr-tooltip__rarity') as HTMLElement;
    const typeEl = this.tooltipEl.querySelector('.nr-tooltip__type') as HTMLElement;
    const statsEl = this.tooltipEl.querySelector('.nr-tooltip__stats') as HTMLElement;
    const descEl = this.tooltipEl.querySelector('.nr-tooltip__description') as HTMLElement;
    const flavorEl = this.tooltipEl.querySelector('.nr-tooltip__flavor') as HTMLElement;
    const levelReqEl = this.tooltipEl.querySelector('.nr-tooltip__level-req') as HTMLElement;

    nameEl.textContent = data.name;
    nameEl.style.color = this.getRarityColor(data.rarity || 'common');
    rarityEl.textContent = (data.rarity || 'common').toUpperCase();
    rarityEl.style.color = this.getRarityColor(data.rarity || 'common');
    typeEl.textContent = data.type || '';
    typeEl.style.display = data.type ? 'block' : 'none';
    statsEl.innerHTML = data.stats || '';
    descEl.textContent = data.description || '';
    descEl.style.display = data.description ? 'block' : 'none';
    flavorEl.textContent = data.flavor || '';
    flavorEl.style.display = data.flavor ? 'block' : 'none';
    levelReqEl.textContent = data.levelReq ? `Requires Level ${data.levelReq}` : '';
    levelReqEl.style.display = data.levelReq ? 'block' : 'none';

    // Position
    const pad = 12;
    let tx = x + pad;
    let ty = y + pad;
    this.tooltipEl.style.left = `${tx}px`;
    this.tooltipEl.style.top = `${ty}px`;
    this.tooltipEl.classList.add('active');

    // Clamp to viewport
    requestAnimationFrame(() => {
      const rect = this.tooltipEl.getBoundingClientRect();
      if (rect.right > window.innerWidth) tx = x - rect.width - pad;
      if (rect.bottom > window.innerHeight) ty = y - rect.height - pad;
      this.tooltipEl.style.left = `${tx}px`;
      this.tooltipEl.style.top = `${ty}px`;
    });
  }

  hideTooltip(): void {
    this.tooltipEl.classList.remove('active');
  }

  // ─── Private: Notifications ───────────────────────────────

  private createNotifications(): void {
    // Already created in createDOMStructure
  }

  // ─── Private: Keyboard Handlers ───────────────────────────

  private setupKeyboardHandlers(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    // Enter → chat
    kb.on('keydown-ENTER', () => {
      if (this.chatInputActive) {
        this.submitChat();
      } else if (this.chatVisible) {
        this.showChatInput();
      }
    });

    // Escape → close top panel or chat
    kb.on('keydown-ESC', () => {
      if (this.chatInputActive) {
        this.hideChatInput();
      } else if (this.activePanels.size > 0) {
        const panels = Array.from(this.activePanels);
        this.closePanel(panels[panels.length - 1]);
      }
    });

    // I → inventory
    kb.on('keydown-I', () => { if (!this.chatInputActive) this.togglePanel('inventory'); });

    // M → map
    kb.on('keydown-M', () => { if (!this.chatInputActive) this.togglePanel('map'); });

    // C → character sheet
    kb.on('keydown-C', () => { if (!this.chatInputActive) this.togglePanel('character'); });

    // G → guild (use U to avoid conflict with G key movement)
    kb.on('keydown-U', () => { if (!this.chatInputActive) this.togglePanel('guild'); });

    // N → spellbook
    kb.on('keydown-N', () => { if (!this.chatInputActive) this.togglePanel('spellbook'); });

    // Escape key to close panels — handled above

    // Ability bar keys 1-0
    const abilityKeys = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'ZERO'];
    for (let i = 0; i < abilityKeys.length; i++) {
      kb.on(`keydown-${abilityKeys[i]}`, () => {
        if (this.chatInputActive) return;
        const abilityId = this.abilitySlots[i]?.dataset.abilityId;
        if (abilityId) this.callbacks.onAbilityUse?.(abilityId);
      });
    }
  }

  // ─── Private: Utility ─────────────────────────────────────

  private showHUD(): void {
    this.hudRoot.style.display = '';
  }

  private hideHUD(): void {
    this.hudRoot.style.display = 'none';
  }

  private bringToFront(_name: PanelName): void {
    this.zCounter++;
    // Could set z-index on the specific panel element
  }

  private xpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.8) + 50 * level);
  }

  private getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      common: '#9d9d9d',
      uncommon: '#1eff00',
      rare: '#0070dd',
      epic: '#a335ee',
      legendary: '#ff8000',
      mythic: '#e6cc80',
    };
    return colors[rarity] || '#9d9d9d';
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /** Call every frame */
  update(_dt: number): void {
    // Could update animations, pulse effects, etc.
  }

  destroy(): void {
    this.uiRoot.remove();
    this.tooltipEl.remove();
  }
}
