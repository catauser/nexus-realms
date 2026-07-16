// ============================================================
// Nexus Realms — Chat UI
// Chat input, tab system, scrollable history,
// channel selector, emote support
// ============================================================

import Phaser from 'phaser';
import { ChatChannel, GAME_CONFIG } from '../../shared/types';
import { ChatMessage } from '../network/NetworkHandler';

// ─── Constants ───────────────────────────────────────────────
const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 220;
const INPUT_HEIGHT = 26;
const TAB_HEIGHT = 22;
const LINE_HEIGHT = 16;
const MAX_VISIBLE_LINES = 10;

// ─── Channel Colors ──────────────────────────────────────────
const CHANNEL_COLORS: Record<string, string> = {
  [ChatChannel.SAY]: '#ffffff',
  [ChatChannel.YELL]: '#ff8844',
  [ChatChannel.WHISPER]: '#cc66ff',
  [ChatChannel.PARTY]: '#66ccff',
  [ChatChannel.GUILD]: '#44ff44',
  [ChatChannel.TRADE]: '#ccaa33',
  [ChatChannel.GENERAL]: '#aaaaaa',
  [ChatChannel.SYSTEM]: '#ffcc00',
};

const CHANNEL_TABS = [
  { channel: 'all', label: 'All' },
  { channel: ChatChannel.GENERAL, label: 'General' },
  { channel: ChatChannel.WHISPER, label: 'Whisper' },
  { channel: ChatChannel.PARTY, label: 'Party' },
  { channel: ChatChannel.GUILD, label: 'Guild' },
  { channel: ChatChannel.TRADE, label: 'Trade' },
];

// ─── Chat UI ─────────────────────────────────────────────────
export class ChatUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible: boolean = true;

  // Tabs
  private activeTab: string = 'all';
  private tabButtons: { bg: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text; channel: string }[] = [];

  // Message display
  private messageContainer!: Phaser.GameObjects.Container;
  private messageTexts: Phaser.GameObjects.Text[] = [];
  private allMessages: ChatMessage[] = [];
  private scrollOffset: number = 0;

  // Input
  private inputElement!: HTMLInputElement;
  private inputVisible: boolean = false;

  // Channel selector prefix
  private currentChannel: ChatChannel = ChatChannel.SAY;

  // Callbacks
  private onSendMessage?: (channel: ChatChannel, message: string, target?: string) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(90);

    this.createPanel();
    this.setupInput();
  }

  toggle(): void {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);
    if (!this.visible) this.hideInput();
  }

  show(): void {
    this.visible = true;
    this.container.setVisible(true);
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
    this.hideInput();
  }

  isVisible(): boolean {
    return this.visible;
  }

  /** Add a message to the chat */
  addMessage(msg: ChatMessage): void {
    this.allMessages.push(msg);
    if (this.allMessages.length > 500) {
      this.allMessages.splice(0, this.allMessages.length - 500);
    }
    this.scrollToBottom();
    this.renderMessages();
  }

  /** Add a system message */
  addSystemMessage(text: string): void {
    this.addMessage({
      channel: ChatChannel.SYSTEM,
      sender_name: 'System',
      message: text,
      timestamp: Date.now(),
    });
  }

  setOnSendMessage(cb: (channel: ChatChannel, message: string, target?: string) => void): void {
    this.onSendMessage = cb;
  }

  /** Scroll chat up */
  scrollUp(): void {
    this.scrollOffset = Math.max(0, this.scrollOffset - 1);
    this.renderMessages();
  }

  /** Scroll chat down */
  scrollDown(): void {
    const maxScroll = Math.max(0, this.getFilteredMessages().length - MAX_VISIBLE_LINES);
    this.scrollOffset = Math.min(maxScroll, this.scrollOffset + 1);
    this.renderMessages();
  }

  /** Call every frame */
  update(_dt: number): void {
    // Could animate new-message highlights, etc.
  }

  // ─── Panel Creation ───────────────────────────────────────

  private createPanel(): void {
    const px = 10;
    const py = GAME_CONFIG.VIEWPORT_HEIGHT - PANEL_HEIGHT - 10;

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x111122, 0.75);
    bg.fillRoundedRect(px, py, PANEL_WIDTH, PANEL_HEIGHT, 6);
    bg.lineStyle(1, 0x333355);
    bg.strokeRoundedRect(px, py, PANEL_WIDTH, PANEL_HEIGHT, 6);
    bg.setScrollFactor(0);
    this.container.add(bg);

    // Tabs
    this.createTabs(px + 4, py + 4);

    // Message area
    this.messageContainer = this.scene.add.container(px + 6, py + TAB_HEIGHT + 6);
    this.messageContainer.setScrollFactor(0);
    this.container.add(this.messageContainer);

    // Create text lines
    for (let i = 0; i < MAX_VISIBLE_LINES; i++) {
      const text = this.scene.add.text(0, i * LINE_HEIGHT, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#ffffff',
        wordWrap: { width: PANEL_WIDTH - 16 },
      }).setScrollFactor(0);
      this.messageContainer.add(text);
      this.messageTexts.push(text);
    }

    // Scroll wheel on chat area
    const hitArea = this.scene.add.rectangle(
      px + PANEL_WIDTH / 2, py + PANEL_HEIGHT / 2,
      PANEL_WIDTH, PANEL_HEIGHT
    ).setScrollFactor(0).setInteractive().setAlpha(0.001);
    this.container.add(hitArea);

    hitArea.on('wheel', (_pointer: Phaser.Input.Pointer, _dx: number, dy: number) => {
      if (dy > 0) this.scrollDown();
      else this.scrollUp();
    });
  }

  private createTabs(x: number, y: number): void {
    let tx = x;
    for (const tab of CHANNEL_TABS) {
      const isActive = tab.channel === this.activeTab;

      const bg = this.scene.add.graphics();
      bg.fillStyle(isActive ? 0x3a3a5e : 0x222233, 0.9);
      bg.fillRoundedRect(tx, y, 52, TAB_HEIGHT - 2, 3);
      bg.setScrollFactor(0);
      this.container.add(bg);

      const text = this.scene.add.text(tx + 26, y + TAB_HEIGHT / 2 - 1, tab.label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: isActive ? '#ffffff' : '#888888',
      }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });
      this.container.add(text);

      text.on('pointerdown', () => {
        this.activeTab = tab.channel;
        this.scrollOffset = 0;
        this.refreshTabs();
        this.renderMessages();
      });

      this.tabButtons.push({ bg, text, channel: tab.channel });
      tx += 56;
    }
  }

  private refreshTabs(): void {
    for (const tab of this.tabButtons) {
      const isActive = tab.channel === this.activeTab;
      tab.bg.clear();
      tab.bg.fillStyle(isActive ? 0x3a3a5e : 0x222233, 0.9);
      tab.bg.fillRoundedRect(tab.text.x - 26, tab.text.y - TAB_HEIGHT / 2 + 1, 52, TAB_HEIGHT - 2, 3);
      tab.text.setColor(isActive ? '#ffffff' : '#888888');
    }
  }

  // ─── Input ────────────────────────────────────────────────

  private setupInput(): void {
    // Press Enter to open chat input
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    kb.on('keydown-ENTER', () => {
      if (this.inputVisible) {
        this.submitInput();
      } else if (this.visible) {
        this.showInput();
      }
    });

    kb.on('keydown-ESC', () => {
      if (this.inputVisible) {
        this.hideInput();
      }
    });

    // Slash commands to change channel
    kb.on('keydown-TAB', () => {
      if (this.inputVisible) {
        this.cycleChannel();
      }
    });
  }

  private showInput(): void {
    if (this.inputElement) {
      this.inputElement.remove();
    }

    const x = 10;
    const y = GAME_CONFIG.VIEWPORT_HEIGHT - INPUT_HEIGHT - 8;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `[/say] Type a message...`;
    input.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${PANEL_WIDTH}px;
      height: ${INPUT_HEIGHT}px;
      padding: 4px 8px;
      font-size: 13px;
      background: rgba(17, 17, 34, 0.9);
      border: 1px solid #444466;
      border-radius: 4px;
      color: #ffffff;
      outline: none;
      z-index: 150;
    `;

    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        this.submitInput();
      } else if (e.key === 'Escape') {
        this.hideInput();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.cycleChannel();
      }
      e.stopPropagation();
    };

    document.body.appendChild(input);
    this.inputElement = input;
    this.inputVisible = true;
    input.focus();
  }

  private hideInput(): void {
    if (this.inputElement) {
      this.inputElement.remove();
      this.inputElement = undefined as unknown as HTMLInputElement;
    }
    this.inputVisible = false;
  }

  private submitInput(): void {
    if (!this.inputElement) return;

    const text = this.inputElement.value.trim();
    this.hideInput();

    if (!text) return;

    // Parse slash commands
    let channel = this.currentChannel;
    let message = text;
    let target: string | undefined;

    if (text.startsWith('/say ')) {
      channel = ChatChannel.SAY;
      message = text.slice(5);
    } else if (text.startsWith('/yell ')) {
      channel = ChatChannel.YELL;
      message = text.slice(6);
    } else if (text.startsWith('/whisper ') || text.startsWith('/w ')) {
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
    } else if (text.startsWith('/trade ')) {
      channel = ChatChannel.TRADE;
      message = text.slice(7);
    }

    this.onSendMessage?.(channel, message, target);
  }

  private cycleChannel(): void {
    const channels = [ChatChannel.SAY, ChatChannel.YELL, ChatChannel.WHISPER, ChatChannel.PARTY, ChatChannel.GUILD, ChatChannel.TRADE];
    const idx = channels.indexOf(this.currentChannel);
    this.currentChannel = channels[(idx + 1) % channels.length];

    if (this.inputElement) {
      this.inputElement.placeholder = `[/ ${this.currentChannel}] Type a message...`;
    }
  }

  // ─── Message Rendering ────────────────────────────────────

  private getFilteredMessages(): ChatMessage[] {
    if (this.activeTab === 'all') return this.allMessages;
    return this.allMessages.filter(m => m.channel === this.activeTab);
  }

  private renderMessages(): void {
    const filtered = this.getFilteredMessages();
    const startIdx = Math.max(0, filtered.length - MAX_VISIBLE_LINES - this.scrollOffset);

    for (let i = 0; i < MAX_VISIBLE_LINES; i++) {
      const msgIdx = startIdx + i;
      const textObj = this.messageTexts[i];

      if (msgIdx < filtered.length) {
        const msg = filtered[msgIdx];
        const color = CHANNEL_COLORS[msg.channel] ?? '#ffffff';
        const prefix = msg.sender_name ? `[${msg.sender_name}]` : '';
        textObj.setText(`${prefix} ${msg.message}`);
        textObj.setColor(color);
        textObj.setVisible(true);
      } else {
        textObj.setVisible(false);
      }
    }
  }

  private scrollToBottom(): void {
    const filtered = this.getFilteredMessages();
    const maxScroll = Math.max(0, filtered.length - MAX_VISIBLE_LINES);
    this.scrollOffset = maxScroll;
  }

  destroy(): void {
    this.hideInput();
    this.container.destroy();
  }
}
