// ============================================================
// Nexus Realms — Settings UI
// Graphics, Audio, Keybinds, Accessibility, Social settings
// ============================================================

export interface SettingsUICallbacks {
  onChange?: (key: string, value: unknown) => void;
}

interface SettingDefinition {
  key: string;
  label: string;
  type: 'slider' | 'select' | 'toggle' | 'keybind';
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  default: unknown;
  section: string;
}

// ─── Settings Definitions ────────────────────────────────────
const SETTINGS: SettingDefinition[] = [
  // Graphics
  { key: 'gfx_quality', label: 'Graphics Quality', type: 'select', options: [
    { label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' }, { label: 'Ultra', value: 'ultra' },
  ], default: 'high', section: 'graphics' },
  { key: 'gfx_fps_limit', label: 'FPS Limit', type: 'select', options: [
    { label: '30', value: '30' }, { label: '60', value: '60' },
    { label: '120', value: '120' }, { label: 'Unlimited', value: '0' },
  ], default: '60', section: 'graphics' },
  { key: 'gfx_particles', label: 'Particles', type: 'toggle', default: true, section: 'graphics' },
  { key: 'gfx_shadows', label: 'Shadows', type: 'toggle', default: true, section: 'graphics' },
  { key: 'gfx_vsync', label: 'VSync', type: 'toggle', default: false, section: 'graphics' },

  // Audio
  { key: 'audio_master', label: 'Master Volume', type: 'slider', min: 0, max: 100, step: 5, default: 80, section: 'audio' },
  { key: 'audio_music', label: 'Music', type: 'slider', min: 0, max: 100, step: 5, default: 60, section: 'audio' },
  { key: 'audio_sfx', label: 'Sound Effects', type: 'slider', min: 0, max: 100, step: 5, default: 80, section: 'audio' },
  { key: 'audio_ambient', label: 'Ambient', type: 'slider', min: 0, max: 100, step: 5, default: 50, section: 'audio' },
  { key: 'audio_voice', label: 'Voice Chat', type: 'toggle', default: false, section: 'audio' },

  // Keybinds
  { key: 'bind_move_up', label: 'Move Up', type: 'keybind', default: 'W', section: 'keybinds' },
  { key: 'bind_move_down', label: 'Move Down', type: 'keybind', default: 'S', section: 'keybinds' },
  { key: 'bind_move_left', label: 'Move Left', type: 'keybind', default: 'A', section: 'keybinds' },
  { key: 'bind_move_right', label: 'Move Right', type: 'keybind', default: 'D', section: 'keybinds' },
  { key: 'bind_interact', label: 'Interact', type: 'keybind', default: 'F', section: 'keybinds' },
  { key: 'bind_inventory', label: 'Inventory', type: 'keybind', default: 'I', section: 'keybinds' },
  { key: 'bind_map', label: 'Map', type: 'keybind', default: 'M', section: 'keybinds' },
  { key: 'bind_character', label: 'Character', type: 'keybind', default: 'C', section: 'keybinds' },

  // Accessibility
  { key: 'acc_font_scale', label: 'UI Scale', type: 'slider', min: 80, max: 150, step: 10, default: 100, section: 'accessibility' },
  { key: 'acc_colorblind', label: 'Colorblind Mode', type: 'select', options: [
    { label: 'None', value: 'none' }, { label: 'Protanopia', value: 'protanopia' },
    { label: 'Deuteranopia', value: 'deuteranopia' }, { label: 'Tritanopia', value: 'tritanopia' },
  ], default: 'none', section: 'accessibility' },
  { key: 'acc_reduce_motion', label: 'Reduce Motion', type: 'toggle', default: false, section: 'accessibility' },
  { key: 'acc_screen_reader', label: 'Screen Reader Hints', type: 'toggle', default: false, section: 'accessibility' },

  // Social
  { key: 'social_whispers', label: 'Allow Whispers', type: 'toggle', default: true, section: 'social' },
  { key: 'social_guild_chat', label: 'Guild Chat', type: 'toggle', default: true, section: 'social' },
  { key: 'social_trade_chat', label: 'Trade Chat', type: 'toggle', default: true, section: 'social' },
  { key: 'social_show_names', label: 'Show Player Names', type: 'toggle', default: true, section: 'social' },
  { key: 'social_show_health', label: 'Show Health Bars', type: 'toggle', default: true, section: 'social' },
];

const SECTION_LABELS: Record<string, string> = {
  graphics: 'Graphics',
  audio: 'Audio',
  keybinds: 'Keybinds',
  accessibility: 'Accessibility',
  social: 'Social',
};

const SECTION_ICONS: Record<string, string> = {
  graphics: '🖥️',
  audio: '🔊',
  keybinds: '⌨️',
  accessibility: '♿',
  social: '👥',
};

// ─── Settings UI ─────────────────────────────────────────────
export class SettingsUI {
  private panelRoot: HTMLElement;
  private overlayRoot: HTMLElement;
  private callbacks: SettingsUICallbacks;
  private el!: HTMLElement;
  private visible: boolean = false;
  private activeTab: string = 'graphics';
  private values: Map<string, unknown> = new Map();
  private listeningKeybind: HTMLElement | null = null;

  constructor(panelRoot: HTMLElement, overlayRoot: HTMLElement, callbacks: SettingsUICallbacks) {
    this.panelRoot = panelRoot;
    this.overlayRoot = overlayRoot;
    this.callbacks = callbacks;
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
    this.cancelKeybindListen();
  }

  isVisible(): boolean {
    return this.visible;
  }

  /** Get a setting value */
  getValue(key: string): unknown {
    return this.values.get(key);
  }

  /** Set a setting value programmatically */
  setValue(key: string, value: unknown): void {
    this.values.set(key, value);
    this.syncControl(key, value);
    this.callbacks.onChange?.(key, value);
  }

  // ─── Private ──────────────────────────────────────────────

  private create(): void {
    // Initialize defaults
    for (const s of SETTINGS) {
      this.values.set(s.key, s.default);
    }

    this.el = document.createElement('div');
    this.el.className = 'nr-settings nr-panel';

    // Build tabs
    const sections = [...new Set(SETTINGS.map(s => s.section))];
    const tabsHtml = sections.map(s =>
      `<div class="nr-tab${s === this.activeTab ? ' active' : ''}" data-tab="${s}">${SECTION_ICONS[s] || ''} ${SECTION_LABELS[s] || s}</div>`
    ).join('');

    // Build content for each section
    const contentHtml = sections.map(section => {
      const items = SETTINGS.filter(s => s.section === section);
      const rowsHtml = items.map(s => this.createSettingRow(s)).join('');
      return `
        <div class="nr-tab-content${section === this.activeTab ? ' active' : ''}" data-content="${section}">
          <div class="nr-settings__section">
            <div class="nr-settings__section-title">${SECTION_ICONS[section] || ''} ${SECTION_LABELS[section] || section}</div>
            ${rowsHtml}
          </div>
        </div>
      `;
    }).join('');

    this.el.innerHTML = `
      <div class="nr-panel-header">
        <span class="nr-panel-title">Settings</span>
        <button class="nr-panel-close" aria-label="Close settings">✕</button>
      </div>
      <div class="nr-tabs">${tabsHtml}</div>
      ${contentHtml}
      <div style="padding:12px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid rgba(123,104,238,0.1);">
        <button class="nr-btn nr-btn--secondary" data-action="reset" style="height:32px;font-size:12px;">Reset Defaults</button>
        <button class="nr-btn nr-btn--primary" data-action="apply" style="height:32px;font-size:12px;">Apply</button>
      </div>
    `;
    this.panelRoot.appendChild(this.el);

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

    // Wire up controls
    this.wireControls();

    // Reset button
    this.el.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      for (const s of SETTINGS) {
        this.values.set(s.key, s.default);
        this.syncControl(s.key, s.default);
        this.callbacks.onChange?.(s.key, s.default);
      }
    });

    // Apply button
    this.el.querySelector('[data-action="apply"]')?.addEventListener('click', () => {
      for (const [key, value] of this.values) {
        this.callbacks.onChange?.(key, value);
      }
    });
  }

  private createSettingRow(s: SettingDefinition): string {
    switch (s.type) {
      case 'slider': {
        const val = this.values.get(s.key) ?? s.default;
        return `
          <div class="nr-setting-row" data-key="${s.key}">
            <span class="nr-setting-row__label">${s.label}</span>
            <div style="display:flex;align-items:center;gap:8px;">
              <input class="nr-slider" type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${val}" data-key="${s.key}" aria-label="${s.label}" />
              <span class="nr-slider-value" data-key="${s.key}" style="min-width:32px;text-align:right;font-size:12px;font-family:var(--nr-font-mono);color:var(--nr-text-secondary);">${val}</span>
            </div>
          </div>
        `;
      }
      case 'select': {
        const val = this.values.get(s.key) ?? s.default;
        const optsHtml = s.options?.map(o =>
          `<option value="${o.value}"${o.value === val ? ' selected' : ''}>${o.label}</option>`
        ).join('') || '';
        return `
          <div class="nr-setting-row" data-key="${s.key}">
            <span class="nr-setting-row__label">${s.label}</span>
            <select class="nr-select" data-key="${s.key}" aria-label="${s.label}">${optsHtml}</select>
          </div>
        `;
      }
      case 'toggle': {
        const val = this.values.get(s.key) ?? s.default;
        return `
          <div class="nr-setting-row" data-key="${s.key}">
            <span class="nr-setting-row__label">${s.label}</span>
            <label class="nr-checkbox" role="switch" tabindex="0" aria-label="${s.label}" data-key="${s.key}">
              <span class="nr-checkbox__box${val ? ' checked' : ''}">✓</span>
            </label>
          </div>
        `;
      }
      case 'keybind': {
        const val = this.values.get(s.key) ?? s.default;
        return `
          <div class="nr-setting-row" data-key="${s.key}">
            <span class="nr-keybind__action">${s.label}</span>
            <div class="nr-keybind">
              <span class="nr-keybind__key" data-key="${s.key}" tabindex="0" role="button" aria-label="Set keybind for ${s.label}">${val}</span>
            </div>
          </div>
        `;
      }
      default:
        return '';
    }
  }

  private wireControls(): void {
    // Sliders
    this.el.querySelectorAll('.nr-slider').forEach(slider => {
      const input = slider as HTMLInputElement;
      input.addEventListener('input', () => {
        const key = input.dataset.key!;
        const value = Number(input.value);
        this.values.set(key, value);
        const display = this.el.querySelector(`.nr-slider-value[data-key="${key}"]`) as HTMLElement;
        if (display) display.textContent = String(value);
        this.callbacks.onChange?.(key, value);
      });
    });

    // Selects
    this.el.querySelectorAll('.nr-select').forEach(select => {
      const sel = select as HTMLSelectElement;
      sel.addEventListener('change', () => {
        const key = sel.dataset.key!;
        this.values.set(key, sel.value);
        this.callbacks.onChange?.(key, sel.value);
      });
    });

    // Toggles
    this.el.querySelectorAll('.nr-checkbox[data-key]').forEach(cb => {
      cb.addEventListener('click', () => {
        const key = (cb as HTMLElement).dataset.key!;
        const current = this.values.get(key) as boolean;
        const newVal = !current;
        this.values.set(key, newVal);
        const box = cb.querySelector('.nr-checkbox__box') as HTMLElement;
        box.classList.toggle('checked', newVal);
        this.callbacks.onChange?.(key, newVal);
      });
      (cb as HTMLElement).addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (cb as HTMLElement).click();
        }
      });
    });

    // Keybinds
    this.el.querySelectorAll('.nr-keybind__key').forEach(keyEl => {
      keyEl.addEventListener('click', () => {
        this.startKeybindListen(keyEl as HTMLElement);
      });
      (keyEl as HTMLElement).addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.startKeybindListen(keyEl as HTMLElement);
        }
      });
    });
  }

  private startKeybindListen(el: HTMLElement): void {
    this.cancelKeybindListen();
    this.listeningKeybind = el;
    el.classList.add('listening');
    el.textContent = '...';

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      const settingKey = el.dataset.key!;
      this.values.set(settingKey, key);
      el.textContent = key;
      el.classList.remove('listening');
      this.listeningKeybind = null;
      this.callbacks.onChange?.(settingKey, key);
      document.removeEventListener('keydown', handler, true);
    };
    document.addEventListener('keydown', handler, true);
  }

  private cancelKeybindListen(): void {
    if (this.listeningKeybind) {
      const key = this.listeningKeybind.dataset.key!;
      this.listeningKeybind.classList.remove('listening');
      this.listeningKeybind.textContent = String(this.values.get(key) ?? '');
      this.listeningKeybind = null;
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

  private syncControl(key: string, value: unknown): void {
    const slider = this.el.querySelector(`.nr-slider[data-key="${key}"]`) as HTMLInputElement;
    if (slider) {
      slider.value = String(value);
      const display = this.el.querySelector(`.nr-slider-value[data-key="${key}"]`) as HTMLElement;
      if (display) display.textContent = String(value);
      return;
    }

    const select = this.el.querySelector(`.nr-select[data-key="${key}"]`) as HTMLSelectElement;
    if (select) {
      select.value = String(value);
      return;
    }

    const toggle = this.el.querySelector(`.nr-checkbox[data-key="${key}"] .nr-checkbox__box`) as HTMLElement;
    if (toggle) {
      toggle.classList.toggle('checked', !!value);
      return;
    }

    const keybind = this.el.querySelector(`.nr-keybind__key[data-key="${key}"]`) as HTMLElement;
    if (keybind) {
      keybind.textContent = String(value);
    }
  }
}
