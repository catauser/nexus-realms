// ============================================================
// Nexus Realms — Character Sheet UI
// Paper doll equipment, stats panel, character info,
// gear comparison tooltips, achievement summary
// ============================================================

import { PlayerData, EquipmentSlot, ClassType, EntityStats, RARITY_COLORS } from '../../shared/types';

// ─── Class Icon Map ──────────────────────────────────────────
const CLASS_ICONS: Record<string, string> = {
  warrior: '⚔️',
  paladin: '🛡️',
  ranger: '🏹',
  rogue: '🗡️',
  mage: '🔮',
  necromancer: '💀',
  cleric: '✝️',
  druid: '🌿',
};

// ─── Stat Icons ──────────────────────────────────────────────
const STAT_ICONS: Record<string, string> = {
  strength: '💪',
  agility: '🏃',
  intellect: '📘',
  spirit: '✨',
  stamina: '❤️',
  armor: '🛡️',
  critical_chance: '💥',
  critical_damage: '⚡',
  haste: '💨',
  dodge: '🌀',
  block: '🔰',
  parry: '🤚',
  hit_chance: '🎯',
  spell_power: '✴️',
  attack_power: '⚔️',
  fire_resist: '🔥',
  ice_resist: '❄️',
  lightning_resist: '⚡',
  holy_resist: '☀️',
  shadow_resist: '🌑',
  nature_resist: '🍃',
};

// ─── Stat Labels ─────────────────────────────────────────────
const STAT_LABELS: Record<string, string> = {
  strength: 'Strength',
  agility: 'Agility',
  intellect: 'Intellect',
  spirit: 'Spirit',
  stamina: 'Stamina',
  armor: 'Armor',
  critical_chance: 'Crit Chance',
  critical_damage: 'Crit Damage',
  haste: 'Haste',
  dodge: 'Dodge',
  block: 'Block',
  parry: 'Parry',
  hit_chance: 'Hit Chance',
  spell_power: 'Spell Power',
  attack_power: 'Attack Power',
  fire_resist: 'Fire Resist',
  ice_resist: 'Ice Resist',
  lightning_resist: 'Lightning Resist',
  holy_resist: 'Holy Resist',
  shadow_resist: 'Shadow Resist',
  nature_resist: 'Nature Resist',
};

// ─── Character Sheet UI ─────────────────────────────────────
export class CharacterSheetUI {
  private panelRoot: HTMLElement;
  private overlayRoot: HTMLElement;
  private el!: HTMLElement;
  private visible: boolean = false;

  // Sub-elements
  private portrait!: HTMLElement;
  private nameEl!: HTMLElement;
  private classEl!: HTMLElement;
  private levelEl!: HTMLElement;
  private statsGrid!: HTMLElement;
  private equipSlots: Map<EquipmentSlot, HTMLElement> = new Map();
  private activeTab: string = 'stats';

  constructor(panelRoot: HTMLElement, overlayRoot: HTMLElement) {
    this.panelRoot = panelRoot;
    this.overlayRoot = overlayRoot;
    this.create();
  }

  show(): void {
    this.visible = true;
    this.el.classList.add('active');
    this.overlayRoot.classList.add('active');
  }

  hide(): void {
    this.visible = false;
    this.el.classList.remove('active');
    this.overlayRoot.classList.remove('active');
  }

  isVisible(): boolean {
    return this.visible;
  }

  /** Update from player data */
  updateFromPlayer(player: PlayerData): void {
    // Character info
    this.portrait.textContent = CLASS_ICONS[player.class_type] || '?';
    this.nameEl.textContent = player.name;
    this.classEl.textContent = player.class_type.replace(/_/g, ' ');
    this.levelEl.textContent = `Level ${player.level}`;

    // Equipment
    for (const [slot, el] of this.equipSlots) {
      const item = player.equipment[slot];
      if (item) {
        const rarity = item.rarity || 'common';
        const color = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#9d9d9d';
        const shortName = (item.item_id || '').slice(0, 3).toUpperCase();
        el.innerHTML = `<span style="font-size:14px;font-weight:700;color:${color};">${shortName}</span>`;
        el.style.borderColor = color;
        el.style.borderStyle = 'solid';
      } else {
        el.innerHTML = `<span class="nr-equip-slot__label" style="position:static;transform:none;font-size:9px;color:var(--nr-text-muted);">${slot.replace(/_/g, ' ')}</span>`;
        el.style.borderColor = '';
        el.style.borderStyle = 'dashed';
      }
    }

    // Stats
    this.renderStats(player.stats, player.class_type);
  }

  // ─── Private ──────────────────────────────────────────────

  private create(): void {
    this.el = document.createElement('div');
    this.el.className = 'nr-character-sheet nr-panel';
    this.el.innerHTML = `
      <div class="nr-panel-header">
        <span class="nr-panel-title">Character</span>
        <button class="nr-panel-close" aria-label="Close character sheet">✕</button>
      </div>
      <div class="nr-char-info">
        <div class="nr-char-info__portrait">⚔️</div>
        <div class="nr-char-info__details">
          <div class="nr-char-info__name">Unknown Hero</div>
          <div class="nr-char-info__class">warrior</div>
          <div class="nr-char-info__level">Level 1</div>
        </div>
      </div>
      <div class="nr-tabs">
        <div class="nr-tab active" data-tab="stats">Stats</div>
        <div class="nr-tab" data-tab="equipment">Equipment</div>
        <div class="nr-tab" data-tab="achievements">Achievements</div>
      </div>
      <div class="nr-tab-content active" data-content="stats">
        <div class="nr-stats-grid"></div>
      </div>
      <div class="nr-tab-content" data-content="equipment">
        <div class="nr-equipment-grid" style="padding:16px;"></div>
      </div>
      <div class="nr-tab-content" data-content="achievements">
        <div style="padding:16px;color:var(--nr-text-muted);font-size:13px;text-align:center;">
          <div style="font-size:32px;margin-bottom:8px;">🏆</div>
          <div>Achievements coming soon!</div>
        </div>
      </div>
    `;
    this.panelRoot.appendChild(this.el);

    // Refs
    this.portrait = this.el.querySelector('.nr-char-info__portrait') as HTMLElement;
    this.nameEl = this.el.querySelector('.nr-char-info__name') as HTMLElement;
    this.classEl = this.el.querySelector('.nr-char-info__class') as HTMLElement;
    this.levelEl = this.el.querySelector('.nr-char-info__level') as HTMLElement;
    this.statsGrid = this.el.querySelector('.nr-stats-grid') as HTMLElement;

    // Close
    this.el.querySelector('.nr-panel-close')?.addEventListener('click', () => this.hide());

    // Tabs
    this.el.querySelectorAll('.nr-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = (tab as HTMLElement).dataset.tab;
        if (!tabName) return;
        this.switchTab(tabName);
      });
    });

    // Equipment slots in the equipment tab
    const equipGrid = this.el.querySelector('[data-content="equipment"] .nr-equipment-grid') as HTMLElement;
    const slots = [
      EquipmentSlot.HEAD, EquipmentSlot.NECKLACE, EquipmentSlot.SHOULDERS, EquipmentSlot.TRINKET,
      EquipmentSlot.CHEST, EquipmentSlot.HANDS, EquipmentSlot.MAIN_HAND, EquipmentSlot.OFF_HAND,
      EquipmentSlot.LEGS, EquipmentSlot.RING_1, EquipmentSlot.FEET, EquipmentSlot.RING_2,
    ];
    for (const slot of slots) {
      const el = document.createElement('div');
      el.className = 'nr-equip-slot';
      el.dataset.slot = slot;
      el.innerHTML = `<span class="nr-equip-slot__label">${slot.replace(/_/g, ' ')}</span>`;
      equipGrid.appendChild(el);
      this.equipSlots.set(slot, el);
    }
  }

  private switchTab(tabName: string): void {
    this.activeTab = tabName;
    this.el.querySelectorAll('.nr-tab').forEach(t => {
      t.classList.toggle('active', (t as HTMLElement).dataset.tab === tabName);
    });
    this.el.querySelectorAll('.nr-tab-content').forEach(c => {
      c.classList.toggle('active', (c as HTMLElement).dataset.content === tabName);
    });
  }

  private renderStats(stats: EntityStats, _classType: ClassType): void {
    const primaryStats = ['strength', 'agility', 'intellect', 'spirit', 'stamina', 'armor'];
    const combatStats = ['critical_chance', 'critical_damage', 'haste', 'dodge', 'block', 'parry', 'hit_chance', 'spell_power', 'attack_power'];
    const resistStats = ['fire_resist', 'ice_resist', 'lightning_resist', 'holy_resist', 'shadow_resist', 'nature_resist'];

    let html = '';

    const renderSection = (title: string, keys: string[]) => {
      html += `<div style="grid-column:1/-1;font-size:11px;font-weight:600;color:var(--nr-purple-light);text-transform:uppercase;letter-spacing:0.5px;padding:8px 4px 4px;border-bottom:1px solid rgba(123,104,238,0.1);margin-bottom:4px;">${title}</div>`;
      for (const key of keys) {
        const value = (stats as unknown as Record<string, number>)[key] ?? 0;
        const icon = STAT_ICONS[key] || '•';
        const label = STAT_LABELS[key] || key;
        const suffix = key.includes('chance') || key.includes('damage') ? (key.includes('damage') ? `×${value}` : `${value}%`) : String(value);
        html += `
          <div class="nr-stat-row">
            <span class="nr-stat-row__label">
              <span class="nr-stat-row__icon">${icon}</span>
              ${label}
            </span>
            <span class="nr-stat-row__value">${suffix}</span>
          </div>
        `;
      }
    };

    renderSection('Primary Stats', primaryStats);
    renderSection('Combat Stats', combatStats);
    renderSection('Resistances', resistStats);

    this.statsGrid.innerHTML = html;
  }
}
