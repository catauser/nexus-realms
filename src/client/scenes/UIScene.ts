// UIScene — HUD overlay (runs on top of GameScene)
import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  // HP/MP bars
  private hpBar!: Phaser.GameObjects.Graphics;
  private mpBar!: Phaser.GameObjects.Graphics;
  private xpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private mpText!: Phaser.GameObjects.Text;
  private xpText!: Phaser.GameObjects.Text;

  // Player info
  private nameText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private coordText!: Phaser.GameObjects.Text;

  // Target frame
  private targetFrame!: Phaser.GameObjects.Graphics;
  private targetNameText!: Phaser.GameObjects.Text;
  private targetHpBar!: Phaser.GameObjects.Graphics;
  private targetHpText!: Phaser.GameObjects.Text;
  private targetVisible = false;

  // Ability bar
  private abilityBar!: Phaser.GameObjects.Graphics;
  private abilityTexts: Phaser.GameObjects.Text[] = [];

  // Chat
  private chatBg!: Phaser.GameObjects.Graphics;
  private chatText!: Phaser.GameObjects.Text;
  private chatMessages: string[] = [];
  private chatInput!: HTMLInputElement;
  private chatOpen = false;

  // Dialogue
  private dialogueBg!: Phaser.GameObjects.Graphics;
  private dialogueText!: Phaser.GameObjects.Text;
  private dialogueNameText!: Phaser.GameObjects.Text;
  private dialogueVisible = false;
  private dialogueLines: string[] = [];
  private dialogueIndex = 0;

  // Minimap
  private minimap!: Phaser.GameObjects.Graphics;

  // FPS
  private fpsText!: Phaser.GameObjects.Text;

  // Inventory overlay
  private inventoryVisible = false;
  private inventoryBg!: Phaser.GameObjects.Graphics;
  private inventoryText!: Phaser.GameObjects.Text;

  // Data from GameScene
  private playerData: any = {};
  private targetData: any = null;
  private inventoryData: any[] = [];

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    const W = 1280;
    const H = 720;

    // ─── HP/MP/XP Bars (top-left) ───────────────────────────
    this.hpBar = this.add.graphics();
    this.mpBar = this.add.graphics();
    this.xpBar = this.add.graphics();

    this.nameText = this.add.text(16, 8, 'Hero', {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffd700', fontStyle: 'bold',
    });
    this.levelText = this.add.text(16, 24, 'Level 1', {
      fontFamily: 'Arial', fontSize: '11px', color: '#aaaaaa',
    });
    this.goldText = this.add.text(16, 56, '💰 0', {
      fontFamily: 'Arial', fontSize: '12px', color: '#ffd700',
    });
    this.coordText = this.add.text(16, 72, '', {
      fontFamily: 'Arial', fontSize: '10px', color: '#666666',
    });

    this.hpText = this.add.text(120, 14, '', {
      fontFamily: 'Arial', fontSize: '10px', color: '#ffffff',
    });
    this.mpText = this.add.text(120, 30, '', {
      fontFamily: 'Arial', fontSize: '10px', color: '#ffffff',
    });
    this.xpText = this.add.text(120, 44, '', {
      fontFamily: 'Arial', fontSize: '9px', color: '#ffffff',
    });

    // ─── Target Frame (top-center) ──────────────────────────
    this.targetFrame = this.add.graphics();
    this.targetNameText = this.add.text(W / 2, 10, '', {
      fontFamily: 'Arial', fontSize: '13px', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.targetHpBar = this.add.graphics();
    this.targetHpText = this.add.text(W / 2, 30, '', {
      fontFamily: 'Arial', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5, 0);

    // ─── Ability Bar (bottom-center) ────────────────────────
    this.abilityBar = this.add.graphics();
    const abilities = [
      { key: '1', name: 'Slash', icon: '⚔️' },
      { key: '2', name: 'Power Strike', icon: '💪' },
      { key: '3', name: 'Whirlwind', icon: '🌀' },
      { key: '4', name: 'Heal', icon: '💚' },
      { key: '5', name: 'Fireball', icon: '🔥' },
    ];

    const abW = 320, abH = 48;
    const abX = (W - abW) / 2, abY = H - abH - 8;

    this.abilityBar.fillStyle(0x0a0a1a, 0.85);
    this.abilityBar.fillRoundedRect(abX, abY, abW, abH, 8);
    this.abilityBar.lineStyle(1, 0x7b68ee, 0.4);
    this.abilityBar.strokeRoundedRect(abX, abY, abW, abH, 8);

    abilities.forEach((a, i) => {
      const sx = abX + 8 + i * 62;
      const sy = abY + 6;
      const ss = 36;

      this.abilityBar.fillStyle(0x1a1040, 0.9);
      this.abilityBar.fillRoundedRect(sx, sy, ss, ss, 4);
      this.abilityBar.lineStyle(1, 0x7b68ee, 0.6);
      this.abilityBar.strokeRoundedRect(sx, sy, ss, ss, 4);

      const iconText = this.add.text(sx + ss / 2, sy + ss / 2 - 2, a.icon, {
        fontFamily: 'Arial', fontSize: '16px',
      }).setOrigin(0.5);

      const keyText = this.add.text(sx + ss - 3, sy + ss - 3, a.key, {
        fontFamily: 'Arial', fontSize: '9px', color: '#ffd700', fontStyle: 'bold',
      }).setOrigin(1, 1);

      this.abilityTexts.push(iconText, keyText);
    });

    // ─── Chat (bottom-left) ─────────────────────────────────
    this.chatBg = this.add.graphics();
    this.chatBg.fillStyle(0x0a0a1a, 0.7);
    this.chatBg.fillRoundedRect(8, H - 140, 340, 130, 6);
    this.chatBg.lineStyle(1, 0x7b68ee, 0.2);
    this.chatBg.strokeRoundedRect(8, H - 140, 340, 130, 6);

    this.chatText = this.add.text(14, H - 134, '', {
      fontFamily: 'Arial', fontSize: '11px', color: '#cccccc',
      wordWrap: { width: 320 },
      lineSpacing: 2,
    });

    // ─── Dialogue Box (center) ──────────────────────────────
    this.dialogueBg = this.add.graphics();
    this.dialogueBg.setAlpha(0);

    this.dialogueNameText = this.add.text(W / 2, H / 2 - 80, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    this.dialogueText = this.add.text(W / 2, H / 2 - 40, '', {
      fontFamily: 'Arial', fontSize: '13px', color: '#ffffff',
      wordWrap: { width: 400 },
      align: 'center',
    }).setOrigin(0.5, 0).setAlpha(0);

    // ─── Minimap (top-right) ────────────────────────────────
    this.minimap = this.add.graphics();

    // ─── FPS Counter ────────────────────────────────────────
    this.fpsText = this.add.text(W - 60, H - 20, '', {
      fontFamily: 'Arial', fontSize: '10px', color: '#666666',
    });

    // ─── Inventory (toggle with I) ──────────────────────────
    this.inventoryBg = this.add.graphics();
    this.inventoryText = this.add.text(W / 2, H / 2, '', {
      fontFamily: 'Arial', fontSize: '13px', color: '#ffffff',
      wordWrap: { width: 300 },
    }).setOrigin(0.5).setAlpha(0);

    // ─── Input ──────────────────────────────────────────────
    this.input.keyboard!.on('keydown-I', () => this.toggleInventory());
    this.input.keyboard!.on('keydown-ENTER', () => this.toggleChat());
    this.input.keyboard!.on('keydown-ESC', () => this.closeAll());
    this.input.keyboard!.on('keydown-SPACE', () => this.advanceDialogue());

    // ─── Listen for GameScene events ────────────────────────
    const gameScene = this.scene.get('GameScene');

    gameScene.events.on('playerUpdate', (data: any) => {
      this.playerData = data;
    });

    gameScene.events.on('targetUpdate', (data: any) => {
      this.targetData = data;
      this.targetVisible = true;
    });

    gameScene.events.on('targetClear', () => {
      this.targetVisible = false;
      this.targetData = null;
    });

    gameScene.events.on('chatMessage', (data: { channel: string; message: string }) => {
      this.addChatMessage(data.channel, data.message);
    });

    gameScene.events.on('npcDialogue', (data: { name: string; dialogue: string[]; type: string }) => {
      this.showDialogue(data.name, data.dialogue);
    });

    gameScene.events.on('inventoryUpdate', (data: any[]) => {
      this.inventoryData = data;
    });

    // Welcome message
    this.addChatMessage('system', 'Welcome to Nexus Realms!');
    this.addChatMessage('system', 'WASD to move, Click to attack, E to interact');
    this.addChatMessage('system', '1-5 for abilities, I for inventory, Enter for chat');
  }

  update(): void {
    this.drawBars();
    this.drawTarget();
    this.drawMinimap();
    this.drawInventory();

    // FPS
    this.fpsText.setText(`${Math.round(this.game.loop.actualFps)} FPS`);
  }

  // ─── Draw HP/MP/XP Bars ────────────────────────────────────
  private drawBars(): void {
    const d = this.playerData;
    if (!d.hp) return;

    // HP Bar
    this.hpBar.clear();
    this.hpBar.fillStyle(0x000000, 0.6);
    this.hpBar.fillRoundedRect(64, 10, 160, 14, 7);
    const hpPct = d.hp / d.maxHp;
    const hpColor = hpPct > 0.5 ? 0x00aa00 : hpPct > 0.25 ? 0xffaa00 : 0xff0000;
    this.hpBar.fillStyle(hpColor);
    this.hpBar.fillRoundedRect(65, 11, 158 * hpPct, 12, 6);
    this.hpText.setText(`${d.hp} / ${d.maxHp}`);

    // MP Bar
    this.mpBar.clear();
    this.mpBar.fillStyle(0x000000, 0.6);
    this.mpBar.fillRoundedRect(64, 28, 160, 10, 5);
    const mpPct = d.mp / d.maxMp;
    this.mpBar.fillStyle(0x0044aa);
    this.mpBar.fillRoundedRect(65, 29, 158 * mpPct, 8, 4);
    this.mpText.setText(`${d.mp} / ${d.maxMp}`);

    // XP Bar
    this.xpBar.clear();
    this.xpBar.fillStyle(0x000000, 0.4);
    this.xpBar.fillRoundedRect(64, 42, 160, 8, 4);
    const xpPct = d.xp / d.xpToLevel;
    this.xpBar.fillStyle(0xffd700);
    this.xpBar.fillRoundedRect(65, 43, 158 * xpPct, 6, 3);
    this.xpText.setText(`XP: ${d.xp}/${d.xpToLevel}`);

    // Name & Level
    this.nameText.setText(d.name);
    this.levelText.setText(`Level ${d.level} Warrior`);
    this.goldText.setText(`💰 ${d.gold}`);
    this.coordText.setText(`📍 ${d.x}, ${d.y}`);
  }

  // ─── Draw Target Frame ─────────────────────────────────────
  private drawTarget(): void {
    this.targetFrame.clear();
    this.targetHpBar.clear();

    if (!this.targetVisible || !this.targetData) {
      this.targetNameText.setAlpha(0);
      this.targetHpText.setAlpha(0);
      return;
    }

    this.targetNameText.setAlpha(1);
    this.targetHpText.setAlpha(1);

    const t = this.targetData;
    const W = 1280;

    // Frame
    this.targetFrame.fillStyle(0x0a0a1a, 0.8);
    this.targetFrame.fillRoundedRect(W / 2 - 140, 4, 280, 40, 6);
    this.targetFrame.lineStyle(1, 0xff4444, 0.3);
    this.targetFrame.strokeRoundedRect(W / 2 - 140, 4, 280, 40, 6);

    this.targetNameText.setText(`${t.name} (Lv.${t.level})`);

    // HP Bar
    this.targetHpBar.fillStyle(0x000000, 0.6);
    this.targetHpBar.fillRoundedRect(W / 2 - 120, 28, 240, 10, 5);
    const pct = t.hp / t.maxHp;
    this.targetHpBar.fillStyle(0xaa0000);
    this.targetHpBar.fillRoundedRect(W / 2 - 119, 29, 238 * pct, 8, 4);
    this.targetHpText.setText(`${t.hp} / ${t.maxHp}`);
  }

  // ─── Draw Minimap ──────────────────────────────────────────
  private drawMinimap(): void {
    this.minimap.clear();

    const mmW = 120, mmH = 100;
    const mmX = 1280 - mmW - 12, mmY = 8;

    // Background
    this.minimap.fillStyle(0x0a0a1a, 0.8);
    this.minimap.fillRoundedRect(mmX, mmY, mmW, mmH, 6);
    this.minimap.lineStyle(1, 0x7b68ee, 0.3);
    this.minimap.strokeRoundedRect(mmX, mmY, mmW, mmH, 6);

    // Player dot
    const px = mmX + (this.playerData.x / 80) * mmW;
    const py = mmY + (this.playerData.y / 60) * mmH;
    this.minimap.fillStyle(0xffd700);
    this.minimap.fillCircle(px, py, 3);

    // Title
    this.minimap.fillStyle(0x7b68ee);
  }

  // ─── Chat ──────────────────────────────────────────────────
  private addChatMessage(channel: string, message: string): void {
    const colors: Record<string, string> = {
      system: '#ffaa00', loot: '#00ff00', xp: '#ffd700',
      combat: '#ff4444', say: '#cccccc', guild: '#7b68ee',
    };
    const color = colors[channel] || '#cccccc';
    this.chatMessages.push(`<color=${color}>[${channel}] ${message}</color>`);

    if (this.chatMessages.length > 50) {
      this.chatMessages.shift();
    }

    // Update chat text (show last 8 messages)
    const visible = this.chatMessages.slice(-8);
    this.chatText.setText(visible.join('\n'));
  }

  private toggleChat(): void {
    // Simple chat toggle - in real game this would open an input
    this.addChatMessage('say', 'Hello, world!');
  }

  // ─── Dialogue ──────────────────────────────────────────────
  private showDialogue(name: string, lines: string[]): void {
    this.dialogueVisible = true;
    this.dialogueLines = lines;
    this.dialogueIndex = 0;

    const W = 1280, H = 720;

    this.dialogueBg.clear();
    this.dialogueBg.fillStyle(0x0a0a1a, 0.92);
    this.dialogueBg.fillRoundedRect(W / 2 - 220, H / 2 - 100, 440, 140, 10);
    this.dialogueBg.lineStyle(2, 0x7b68ee, 0.5);
    this.dialogueBg.strokeRoundedRect(W / 2 - 220, H / 2 - 100, 440, 140, 10);

    this.dialogueBg.setAlpha(1);
    this.dialogueNameText.setAlpha(1);
    this.dialogueText.setAlpha(1);

    this.dialogueNameText.setText(name);
    this.dialogueText.setText(lines[0] || '');

    // Hint
    this.addChatMessage('system', 'Press SPACE to continue dialogue');
  }

  private advanceDialogue(): void {
    if (!this.dialogueVisible) return;

    this.dialogueIndex++;
    if (this.dialogueIndex >= this.dialogueLines.length) {
      this.closeDialogue();
      return;
    }

    this.dialogueText.setText(this.dialogueLines[this.dialogueIndex]);
  }

  private closeDialogue(): void {
    this.dialogueVisible = false;
    this.dialogueBg.setAlpha(0);
    this.dialogueNameText.setAlpha(0);
    this.dialogueText.setAlpha(0);
  }

  // ─── Inventory ─────────────────────────────────────────────
  private toggleInventory(): void {
    this.inventoryVisible = !this.inventoryVisible;
  }

  private drawInventory(): void {
    this.inventoryBg.clear();
    this.inventoryText.setAlpha(0);

    if (!this.inventoryVisible) return;

    const W = 1280, H = 720;
    const iW = 300, iH = 400;
    const iX = (W - iW) / 2, iY = (H - iH) / 2;

    this.inventoryBg.fillStyle(0x0a0a1a, 0.95);
    this.inventoryBg.fillRoundedRect(iX, iY, iW, iH, 10);
    this.inventoryBg.lineStyle(2, 0x7b68ee, 0.5);
    this.inventoryBg.strokeRoundedRect(iX, iY, iW, iH, 10);

    // Title
    this.inventoryBg.fillStyle(0x7b68ee, 0.3);
    this.inventoryBg.fillRoundedRect(iX, iY, iW, 30, { tl: 10, tr: 10, bl: 0, br: 0 });

    let content = '🎒 INVENTORY\n\n';
    if (this.inventoryData.length === 0) {
      content += 'No items yet.\nKill monsters to get loot!';
    } else {
      for (const item of this.inventoryData) {
        content += `${item.icon} ${item.name} x${item.qty}\n`;
      }
    }
    content += `\n\n💰 Gold: ${this.playerData.gold || 0}`;
    content += '\n\nPress I to close';

    this.inventoryText.setPosition(W / 2, iY + 20);
    this.inventoryText.setText(content);
    this.inventoryText.setAlpha(1);
  }

  // ─── Close All ─────────────────────────────────────────────
  private closeAll(): void {
    this.closeDialogue();
    this.inventoryVisible = false;
  }
}
