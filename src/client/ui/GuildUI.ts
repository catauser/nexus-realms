// ============================================================
// Nexus Realms — Guild UI
// Member list, guild info, guild bank, perks, MOTD editor
// ============================================================

export interface GuildMember {
  name: string;
  level: number;
  rank: string;
  online: boolean;
}

export class GuildUI {
  private panelRoot: HTMLElement;
  private overlayRoot: HTMLElement;
  private el!: HTMLElement;
  private visible: boolean = false;

  // Sub-elements
  private guildName!: HTMLElement;
  private guildMotd!: HTMLElement;
  private memberCount!: HTMLElement;
  private guildLevel!: HTMLElement;
  private memberList!: HTMLElement;
  private motdEditor!: HTMLTextAreaElement;
  private motdDisplay!: HTMLElement;
  private activeTab: string = 'roster';

  // Data
  private members: GuildMember[] = [];

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

  setGuildInfo(name: string, motd: string, level: number, memberCount: number): void {
    this.guildName.textContent = name;
    this.guildMotd.textContent = motd;
    this.motdDisplay.textContent = motd;
    this.motdEditor.value = motd;
    this.memberCount.textContent = `${memberCount} Members`;
    this.guildLevel.textContent = `Level ${level}`;
  }

  setMembers(members: GuildMember[]): void {
    this.members = members;
    this.renderMembers();
  }

  // ─── Private ──────────────────────────────────────────────

  private create(): void {
    this.el = document.createElement('div');
    this.el.className = 'nr-guild-panel nr-panel';
    this.el.innerHTML = `
      <div class="nr-panel-header">
        <span class="nr-panel-title">Guild</span>
        <button class="nr-panel-close" aria-label="Close guild panel">✕</button>
      </div>
      <div class="nr-guild-info">
        <div class="nr-guild-info__name">No Guild</div>
        <div class="nr-guild-info__motd">Join a guild to begin your journey together.</div>
        <div class="nr-guild-info__stats">
          <div class="nr-guild-stat">Members: <span>0</span></div>
          <div class="nr-guild-stat">Level: <span>1</span></div>
        </div>
      </div>
      <div class="nr-tabs">
        <div class="nr-tab active" data-tab="roster">Roster</div>
        <div class="nr-tab" data-tab="info">Info</div>
        <div class="nr-tab" data-tab="bank">Bank</div>
        <div class="nr-tab" data-tab="perks">Perks</div>
      </div>
      <div class="nr-tab-content active" data-content="roster">
        <div class="nr-member-list"></div>
      </div>
      <div class="nr-tab-content" data-content="info">
        <div style="padding:16px;">
          <div style="font-size:12px;color:var(--nr-text-secondary);margin-bottom:8px;">Message of the Day</div>
          <div class="nr-guild-info__motd" style="font-style:italic;color:var(--nr-text-muted);margin-bottom:12px;"></div>
          <div style="display:none;" class="nr-motd-editor-wrap">
            <textarea class="nr-chat__input" style="width:100%;height:60px;resize:vertical;font-family:var(--nr-font-ui);" placeholder="Set MOTD..." aria-label="Guild MOTD"></textarea>
            <button class="nr-btn nr-btn--secondary" style="margin-top:8px;height:30px;font-size:12px;">Save MOTD</button>
          </div>
        </div>
      </div>
      <div class="nr-tab-content" data-content="bank">
        <div style="padding:16px;text-align:center;color:var(--nr-text-muted);font-size:13px;">
          <div style="font-size:32px;margin-bottom:8px;">🏦</div>
          <div>Guild Bank — Coming Soon</div>
        </div>
      </div>
      <div class="nr-tab-content" data-content="perks">
        <div style="padding:16px;">
          <div style="font-size:12px;font-weight:600;color:var(--nr-purple-light);margin-bottom:8px;">Active Perks</div>
          <div class="nr-guild-perks" style="display:flex;flex-direction:column;gap:6px;">
            <div class="nr-stat-row">
              <span class="nr-stat-row__label"><span class="nr-stat-row__icon">📈</span> XP Boost</span>
              <span class="nr-stat-row__value" style="color:var(--nr-green);">+10%</span>
            </div>
            <div class="nr-stat-row">
              <span class="nr-stat-row__label"><span class="nr-stat-row__icon">💰</span> Gold Find</span>
              <span class="nr-stat-row__value" style="color:var(--nr-green);">+5%</span>
            </div>
            <div class="nr-stat-row">
              <span class="nr-stat-row__label"><span class="nr-stat-row__icon">🎒</span> Bank Slots</span>
              <span class="nr-stat-row__value">20</span>
            </div>
          </div>
        </div>
      </div>
    `;
    this.panelRoot.appendChild(this.el);

    // Refs
    this.guildName = this.el.querySelector('.nr-guild-info__name') as HTMLElement;
    this.guildMotd = this.el.querySelector('.nr-guild-info__motd') as HTMLElement;
    this.memberCount = this.el.querySelector('.nr-guild-stat span') as HTMLElement;
    this.guildLevel = this.el.querySelectorAll('.nr-guild-stat span')[1] as HTMLElement;
    this.memberList = this.el.querySelector('.nr-member-list') as HTMLElement;
    this.motdDisplay = this.el.querySelector('[data-content="info"] .nr-guild-info__motd') as HTMLElement;
    this.motdEditor = this.el.querySelector('[data-content="info"] textarea') as HTMLTextAreaElement;

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

    // MOTD save button
    this.el.querySelector('[data-content="info"] .nr-btn')?.addEventListener('click', () => {
      this.motdDisplay.textContent = this.motdEditor.value;
      this.guildMotd.textContent = this.motdEditor.value;
    });
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

  private renderMembers(): void {
    // Sort: online first, then by rank priority, then by level
    const rankPriority: Record<string, number> = {
      leader: 0, officer: 1, veteran: 2, member: 3, initiate: 4,
    };
    const sorted = [...this.members].sort((a, b) => {
      if (a.online !== b.online) return a.online ? -1 : 1;
      const rp = (rankPriority[a.rank] ?? 5) - (rankPriority[b.rank] ?? 5);
      if (rp !== 0) return rp;
      return b.level - a.level;
    });

    this.memberList.innerHTML = '';
    for (const member of sorted) {
      const row = document.createElement('div');
      row.className = 'nr-member-row';
      row.innerHTML = `
        <span class="nr-member-row__status ${member.online ? 'online' : 'offline'}"></span>
        <span class="nr-member-row__name">${this.escapeHtml(member.name)}</span>
        <span class="nr-member-row__level">Lv.${member.level}</span>
        <span class="nr-member-row__rank ${member.rank === 'leader' ? 'leader' : ''}">${member.rank}</span>
      `;
      this.memberList.appendChild(row);
    }
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
