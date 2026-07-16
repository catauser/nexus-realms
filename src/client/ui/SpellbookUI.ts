// ============================================================
// Nexus Realms — Spellbook UI
// All abilities organized by specialization,
// drag to ability bar, ability details, cooldowns, unlock reqs
// ============================================================

export interface SpellData {
  id: string;
  name: string;
  icon: string;
  cooldown: number;
  locked: boolean;
  description: string;
  damageFormula?: string;
  unlockLevel?: number;
  specialization?: string;
}

export class SpellbookUI {
  private panelRoot: HTMLElement;
  private overlayRoot: HTMLElement;
  private el!: HTMLElement;
  private visible: boolean = false;

  // Elements
  private spellGrid!: HTMLElement;
  private detailPanel!: HTMLElement;
  private activeTab: string = 'all';

  // Data
  private spells: SpellData[] = [];
  private selectedSpell: SpellData | null = null;

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

  setSpells(spells: SpellData[]): void {
    this.spells = spells;
    this.renderSpells();
  }

  // ─── Private ──────────────────────────────────────────────

  private create(): void {
    this.el = document.createElement('div');
    this.el.className = 'nr-spellbook nr-panel';
    this.el.innerHTML = `
      <div class="nr-panel-header">
        <span class="nr-panel-title">Spellbook</span>
        <button class="nr-panel-close" aria-label="Close spellbook">✕</button>
      </div>
      <div class="nr-tabs">
        <div class="nr-tab active" data-tab="all">All</div>
        <div class="nr-tab" data-tab="damage">Damage</div>
        <div class="nr-tab" data-tab="heal">Healing</div>
        <div class="nr-tab" data-tab="buff">Buffs</div>
        <div class="nr-tab" data-tab="passive">Passive</div>
      </div>
      <div style="display:flex;">
        <div class="nr-spell-grid" style="flex:1;max-height:340px;overflow-y:auto;"></div>
        <div class="nr-spell-detail" style="width:200px;padding:12px;border-left:1px solid rgba(123,104,238,0.1);display:flex;flex-direction:column;align-items:center;gap:8px;">
          <div class="nr-spell-detail__icon" style="width:56px;height:56px;border-radius:8px;background:linear-gradient(135deg,rgba(123,104,238,0.2),rgba(255,215,0,0.08));display:flex;align-items:center;justify-content:center;font-size:28px;border:1px solid rgba(123,104,238,0.2);">?</div>
          <div class="nr-spell-detail__name" style="font-size:14px;font-weight:600;color:var(--nr-text-primary);text-align:center;">Select a Spell</div>
          <div class="nr-spell-detail__desc" style="font-size:11px;color:var(--nr-text-secondary);text-align:center;line-height:1.4;">Click on a spell to see details.</div>
          <div class="nr-spell-detail__cd" style="font-size:11px;color:var(--nr-text-muted);"></div>
          <div class="nr-spell-detail__formula" style="font-size:11px;color:var(--nr-green);font-family:var(--nr-font-mono);text-align:center;"></div>
          <div class="nr-spell-detail__unlock" style="font-size:11px;color:var(--nr-red);text-align:center;"></div>
          <div class="nr-spell-detail__drag-hint" style="font-size:10px;color:var(--nr-text-muted);margin-top:auto;font-style:italic;">Drag to action bar</div>
        </div>
      </div>
    `;
    this.panelRoot.appendChild(this.el);

    // Refs
    this.spellGrid = this.el.querySelector('.nr-spell-grid') as HTMLElement;
    this.detailPanel = this.el.querySelector('.nr-spell-detail') as HTMLElement;

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
  }

  private switchTab(tabName: string): void {
    this.activeTab = tabName;
    this.el.querySelectorAll('.nr-tab').forEach(t => {
      t.classList.toggle('active', (t as HTMLElement).dataset.tab === tabName);
    });
    this.renderSpells();
  }

  private renderSpells(): void {
    const filtered = this.activeTab === 'all'
      ? this.spells
      : this.spells.filter(s => s.specialization === this.activeTab || s.id.includes(this.activeTab));

    this.spellGrid.innerHTML = '';
    for (const spell of filtered) {
      const card = document.createElement('div');
      card.className = `nr-spell-card${spell.locked ? ' locked' : ''}`;
      card.draggable = !spell.locked;
      card.dataset.spellId = spell.id;
      card.innerHTML = `
        <div class="nr-spell-card__icon">${spell.icon || '✦'}</div>
        <div class="nr-spell-card__name">${spell.name}</div>
        <div class="nr-spell-card__cd">${spell.cooldown > 0 ? `${spell.cooldown}s` : 'Passive'}</div>
      `;

      card.addEventListener('click', () => this.selectSpell(spell));

      // Drag start
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer?.setData('text/plain', spell.id);
      });

      this.spellGrid.appendChild(card);
    }
  }

  private selectSpell(spell: SpellData): void {
    this.selectedSpell = spell;

    const iconEl = this.detailPanel.querySelector('.nr-spell-detail__icon') as HTMLElement;
    const nameEl = this.detailPanel.querySelector('.nr-spell-detail__name') as HTMLElement;
    const descEl = this.detailPanel.querySelector('.nr-spell-detail__desc') as HTMLElement;
    const cdEl = this.detailPanel.querySelector('.nr-spell-detail__cd') as HTMLElement;
    const formulaEl = this.detailPanel.querySelector('.nr-spell-detail__formula') as HTMLElement;
    const unlockEl = this.detailPanel.querySelector('.nr-spell-detail__unlock') as HTMLElement;

    iconEl.textContent = spell.icon || '✦';
    nameEl.textContent = spell.name;
    descEl.textContent = spell.description;
    cdEl.textContent = spell.cooldown > 0 ? `Cooldown: ${spell.cooldown}s` : 'No cooldown';
    formulaEl.textContent = spell.damageFormula || '';
    unlockEl.textContent = spell.locked ? `Unlocks at Level ${spell.unlockLevel || '?'}` : '';

    // Highlight selected
    this.spellGrid.querySelectorAll('.nr-spell-card').forEach(c => {
      (c as HTMLElement).style.borderColor = (c as HTMLElement).dataset.spellId === spell.id
        ? 'var(--nr-gold)'
        : '';
    });
  }
}
