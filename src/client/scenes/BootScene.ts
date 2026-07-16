// ============================================================
// Nexus Realms — Boot Scene
// Generate all sprite assets, create textures, show loading bar
// ============================================================

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private dots: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    this.cameras.main.setBackgroundColor('#0a0a1a');

    // ── Title with glow ─────────────────────────────────────
    this.titleText = this.add.text(cx, cy - 140, 'NEXUS REALMS', {
      fontFamily: 'Georgia, serif',
      fontSize: '52px',
      color: '#c0a040',
      fontStyle: 'bold',
      stroke: '#4a3a10',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 85, 'A world of adventure awaits', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#5555aa',
    }).setOrigin(0.5);

    // ── Progress bar ────────────────────────────────────────
    const barW = 320;
    const barH = 24;
    const barX = cx - barW / 2;
    const barY = cy - 12;

    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x111122, 0.9);
    this.progressBox.fillRoundedRect(barX, barY, barW, barH, 6);
    this.progressBox.lineStyle(1, 0x333355);
    this.progressBox.strokeRoundedRect(barX, barY, barW, barH, 6);

    this.progressBar = this.add.graphics();

    this.loadingText = this.add.text(cx, cy + 30, 'Preparing the realm...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#6666aa',
    }).setOrigin(0.5);

    // ── Decorative dots ─────────────────────────────────────
    for (let i = 0; i < 5; i++) {
      const dot = this.add.graphics();
      dot.fillStyle(0xc0a040, 0.3 + i * 0.1);
      dot.fillCircle(cx - 40 + i * 20, cy + 55, 3);
      this.dots.push(dot);
    }

    // ── Progress callback ───────────────────────────────────
    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      const fillW = (barW - 6) * value;
      // Gradient fill
      const r = Math.floor(0xc0 * value + 0x30 * (1 - value));
      const g = Math.floor(0xa0 * value + 0x50 * (1 - value));
      const b = Math.floor(0x40 * value + 0x80 * (1 - value));
      const color = (r << 16) | (g << 8) | b;
      this.progressBar.fillStyle(color, 1);
      this.progressBar.fillRoundedRect(barX + 3, barY + 3, fillW, barH - 6, 4);
      this.loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      this.loadingText.setText('Ready!');
    });

    // ── Generate all textures ───────────────────────────────
    this.generateAllTextures();
  }

  create(): void {
    // Animate title
    this.tweens.add({
      targets: this.titleText,
      y: this.titleText.y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Transition to login
    this.time.delayedCall(800, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('LoginScene');
      });
    });
  }

  // ─── Texture Generation ───────────────────────────────────

  private generateAllTextures(): void {
    const g = this.add.graphics();

    this.generatePixelTexture(g);
    this.generatePlayerTextures(g);
    this.generateNPCTextures(g);
    this.generateMonsterTextures(g);
    this.generateUITextures(g);
    this.generateTileTextures(g);
    this.generateObjectTextures(g);
    this.generateVFXTextures(g);

    g.destroy();
  }

  private generatePixelTexture(g: Phaser.GameObjects.Graphics): void {
    g.clear();
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 1, 1);
    g.generateTexture('pixel', 1, 1);
  }

  private generatePlayerTextures(g: Phaser.GameObjects.Graphics): void {
    // ── Player (32x48) — humanoid silhouette ────────────────
    const classes = [
      { key: 'player_warrior', body: 0x7a7a7a, accent: 0xc0c0c0 },
      { key: 'player_paladin', body: 0xffd700, accent: 0xfffacd },
      { key: 'player_ranger', body: 0x2e7d32, accent: 0x66bb6a },
      { key: 'player_rogue', body: 0x2c2c2c, accent: 0x8b0000 },
      { key: 'player_mage', body: 0x1565c0, accent: 0x64b5f6 },
      { key: 'player_necromancer', body: 0x311b5e, accent: 0x7c4dff },
      { key: 'player_cleric', body: 0xf5f5f5, accent: 0xffd700 },
      { key: 'player_druid', body: 0x5d4037, accent: 0x8bc34a },
    ];

    for (const cls of classes) {
      g.clear();
      // Body
      g.fillStyle(cls.body);
      g.fillRect(8, 16, 16, 24);
      // Head
      g.fillStyle(0xf5ce9f);
      g.fillCircle(16, 10, 7);
      // Arms
      g.fillStyle(cls.body);
      g.fillRect(4, 18, 5, 16);
      g.fillRect(23, 18, 5, 16);
      // Legs
      g.fillRect(10, 38, 5, 10);
      g.fillRect(17, 38, 5, 10);
      // Accent (belt/trim)
      g.fillStyle(cls.accent);
      g.fillRect(8, 28, 16, 3);
      // Eyes
      g.fillStyle(0x222222);
      g.fillRect(13, 9, 2, 2);
      g.fillRect(17, 9, 2, 2);
      g.generateTexture(cls.key, 32, 48);
    }

    // Default player (fallback)
    g.clear();
    g.fillStyle(0x3366cc);
    g.fillRect(8, 16, 16, 24);
    g.fillStyle(0xf5ce9f);
    g.fillCircle(16, 10, 7);
    g.fillStyle(0x3366cc);
    g.fillRect(4, 18, 5, 16);
    g.fillRect(23, 18, 5, 16);
    g.fillRect(10, 38, 5, 10);
    g.fillRect(17, 38, 5, 10);
    g.fillStyle(0xffcc88);
    g.fillRect(8, 28, 16, 3);
    g.fillStyle(0x222222);
    g.fillRect(13, 9, 2, 2);
    g.fillRect(17, 9, 2, 2);
    g.generateTexture('player_default', 32, 48);
  }

  private generateNPCTextures(g: Phaser.GameObjects.Graphics): void {
    const npcs = [
      { key: 'npc_merchant', robe: 0x8d6e63, accent: 0xffcc02 },
      { key: 'npc_quest_giver', robe: 0x3f51b5, accent: 0xffeb3b },
      { key: 'npc_guard', robe: 0x607d8b, accent: 0xcfd8dc },
      { key: 'npc_trainer', robe: 0x455a64, accent: 0xff6e40 },
      { key: 'npc_default', robe: 0x33aa55, accent: 0x88ff88 },
    ];

    for (const npc of npcs) {
      g.clear();
      // Robe/body
      g.fillStyle(npc.robe);
      g.fillRect(8, 14, 16, 28);
      // Head
      g.fillStyle(0xd4a574);
      g.fillCircle(16, 9, 7);
      // Hood/hat
      g.fillStyle(npc.accent);
      g.fillRect(8, 2, 16, 6);
      // Arms
      g.fillStyle(npc.robe);
      g.fillRect(4, 16, 5, 14);
      g.fillRect(23, 16, 5, 14);
      // Legs hidden by robe
      g.fillRect(10, 40, 12, 8);
      // Accent trim
      g.fillStyle(npc.accent);
      g.fillRect(8, 14, 16, 2);
      // Eyes
      g.fillStyle(0x222222);
      g.fillRect(13, 8, 2, 2);
      g.fillRect(17, 8, 2, 2);
      g.generateTexture(npc.key, 32, 48);
    }
  }

  private generateMonsterTextures(g: Phaser.GameObjects.Graphics): void {
    const monsters = [
      { key: 'monster_slime', body: 0x7b1fa2, size: 28, shape: 'circle' as const },
      { key: 'monster_wolf', body: 0x6b6b6b, size: 32, shape: 'diamond' as const },
      { key: 'monster_skeleton', body: 0xe0d8c8, size: 32, shape: 'rect' as const },
      { key: 'monster_spider', body: 0x2c2c2c, size: 30, shape: 'star' as const },
      { key: 'monster_bear', body: 0x5d4037, size: 40, shape: 'rect' as const },
      { key: 'monster_dragon', body: 0x8b0000, size: 48, shape: 'diamond' as const },
      { key: 'monster_goblin', body: 0x4caf50, size: 28, shape: 'rect' as const },
      { key: 'monster_elemental', body: 0x00bcd4, size: 36, shape: 'circle' as const },
      { key: 'monster_default', body: 0xcc3333, size: 32, shape: 'rect' as const },
    ];

    for (const m of monsters) {
      g.clear();
      const s = m.size;
      const cx = s / 2;
      const cy = s / 2;

      // Body
      g.fillStyle(m.body);
      switch (m.shape) {
        case 'circle':
          g.fillCircle(cx, cy, s / 2 - 2);
          break;
        case 'diamond':
          g.fillTriangle(cx, 2, s - 2, cy, cx, s - 2);
          g.fillTriangle(cx, 2, 2, cy, cx, s - 2);
          break;
        case 'star':
          g.fillCircle(cx, cy, s / 2 - 2);
          g.fillStyle(m.body);
          for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            g.fillRect(
              cx + Math.cos(angle) * (s / 3) - 2,
              cy + Math.sin(angle) * (s / 3) - 2,
              4, 4,
            );
          }
          break;
        default:
          g.fillRect(2, 2, s - 4, s - 4);
          break;
      }

      // Eyes
      const eyeColor = m.key.includes('dragon') ? 0xffd700 :
        m.key.includes('elemental') ? 0xffffff : 0xff0000;
      g.fillStyle(eyeColor);
      g.fillRect(cx - 5, cy - 4, 3, 3);
      g.fillRect(cx + 2, cy - 4, 3, 3);

      // Boss indicator (larger monsters get a crown)
      if (m.size >= 40) {
        g.fillStyle(0xffd700);
        g.fillTriangle(cx - 6, 4, cx, -2, cx + 6, 4);
      }

      g.generateTexture(m.key, s, s);
    }
  }

  private generateUITextures(g: Phaser.GameObjects.Graphics): void {
    // Selection ring
    g.clear();
    g.lineStyle(2, 0x00ff00, 0.8);
    g.strokeCircle(16, 16, 14);
    g.generateTexture('selection_ring', 32, 32);

    // Target indicator
    g.clear();
    g.lineStyle(2, 0xff4444, 0.9);
    g.strokeCircle(20, 20, 18);
    g.lineStyle(1, 0xff4444, 0.5);
    g.strokeCircle(20, 20, 14);
    g.generateTexture('target_indicator', 40, 40);

    // Health bar bg
    g.clear();
    g.fillStyle(0x222222, 0.8);
    g.fillRect(0, 0, 40, 5);
    g.lineStyle(1, 0x444444, 0.6);
    g.strokeRect(0, 0, 40, 5);
    g.generateTexture('health_bar_bg', 40, 5);

    // Health bar fill (red)
    g.clear();
    g.fillStyle(0xcc3333);
    g.fillRect(0, 0, 40, 5);
    g.generateTexture('health_bar_fill', 40, 5);

    // UI ability slot
    g.clear();
    g.fillStyle(0x1a1a2e, 0.95);
    g.fillRoundedRect(0, 0, 44, 44, 5);
    g.lineStyle(1, 0x444466);
    g.strokeRoundedRect(0, 0, 44, 44, 5);
    g.generateTexture('ui_ability_slot', 44, 44);

    // Cooldown overlay
    g.clear();
    g.fillStyle(0x000000, 0.65);
    g.fillRect(0, 0, 44, 44);
    g.generateTexture('ui_cooldown_overlay', 44, 44);

    // Inventory slot
    g.clear();
    g.fillStyle(0x1a1a2e, 0.9);
    g.fillRoundedRect(0, 0, 40, 40, 4);
    g.lineStyle(1, 0x444466);
    g.strokeRoundedRect(0, 0, 40, 40, 4);
    g.generateTexture('ui_inventory_slot', 40, 40);

    // Minimap frame
    g.clear();
    g.fillStyle(0x111122, 0.85);
    g.fillRoundedRect(0, 0, 180, 180, 6);
    g.lineStyle(2, 0x444466);
    g.strokeRoundedRect(0, 0, 180, 180, 6);
    g.generateTexture('ui_minimap_frame', 180, 180);

    // Quest icon (!)
    g.clear();
    g.fillStyle(0xffcc00);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0x000000);
    g.fillRect(7, 3, 2, 5);
    g.fillRect(7, 10, 2, 2);
    g.generateTexture('quest_icon', 16, 16);

    // Quest complete icon (?)
    g.clear();
    g.fillStyle(0x44cc44);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0x000000);
    g.fillRect(5, 3, 6, 2);
    g.fillRect(9, 5, 2, 3);
    g.fillRect(7, 9, 2, 2);
    g.fillRect(7, 12, 2, 2);
    g.generateTexture('quest_complete_icon', 16, 16);
  }

  private generateTileTextures(g: Phaser.GameObjects.Graphics): void {
    const ts = 32; // tile size

    // Grass tiles (3 variants)
    const grassColors = [0x4caf50, 0x43a047, 0x388e3c];
    for (let i = 0; i < 3; i++) {
      g.clear();
      g.fillStyle(grassColors[i]);
      g.fillRect(0, 0, ts, ts);
      // Detail dots
      g.fillStyle(0x66bb6a, 0.3);
      for (let d = 0; d < 5; d++) {
        g.fillRect(
          (i * 7 + d * 13) % ts,
          (i * 11 + d * 7) % ts,
          2, 2,
        );
      }
      g.generateTexture(`tile_grass_${i}`, ts, ts);
    }

    // Dirt
    g.clear();
    g.fillStyle(0x795548);
    g.fillRect(0, 0, ts, ts);
    g.fillStyle(0x6d4c41, 0.5);
    g.fillRect(4, 4, 8, 4);
    g.fillRect(20, 16, 6, 6);
    g.generateTexture('tile_dirt', ts, ts);

    // Stone floor
    g.clear();
    g.fillStyle(0x607d8b);
    g.fillRect(0, 0, ts, ts);
    g.lineStyle(1, 0x546e7a, 0.5);
    g.strokeRect(0, 0, ts / 2, ts / 2);
    g.strokeRect(ts / 2, ts / 2, ts / 2, ts / 2);
    g.generateTexture('tile_stone', ts, ts);

    // Sand
    g.clear();
    g.fillStyle(0xffcc80);
    g.fillRect(0, 0, ts, ts);
    g.fillStyle(0xffe0b2, 0.4);
    g.fillRect(8, 8, 4, 4);
    g.fillRect(20, 4, 3, 3);
    g.generateTexture('tile_sand', ts, ts);

    // Water (4 frames for animation)
    const waterColors = [0x1e88e5, 0x1976d2, 0x1565c0, 0x0d47a1];
    for (let i = 0; i < 4; i++) {
      g.clear();
      g.fillStyle(waterColors[i]);
      g.fillRect(0, 0, ts, ts);
      // Wave lines
      g.lineStyle(1, 0x64b5f6, 0.4);
      const offset = i * 4;
      for (let wy = 4; wy < ts; wy += 8) {
        g.lineBetween(0, wy + offset, ts, wy + offset + 2);
      }
      g.generateTexture(`tile_water_${i}`, ts, ts);
    }

    // Snow
    g.clear();
    g.fillStyle(0xeceff1);
    g.fillRect(0, 0, ts, ts);
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(4, 4, 3, 3);
    g.fillRect(20, 12, 4, 4);
    g.fillRect(10, 24, 3, 3);
    g.generateTexture('tile_snow', ts, ts);

    // Swamp
    g.clear();
    g.fillStyle(0x33691e);
    g.fillRect(0, 0, ts, ts);
    g.fillStyle(0x2e4a1e, 0.6);
    g.fillRect(0, 0, ts, ts / 2);
    g.fillStyle(0x1b5e20, 0.3);
    g.fillCircle(16, 16, 6);
    g.generateTexture('tile_swamp', ts, ts);

    // Wall
    g.clear();
    g.fillStyle(0x424242);
    g.fillRect(0, 0, ts, ts);
    g.lineStyle(1, 0x616161, 0.5);
    g.strokeRect(1, 1, ts - 2, ts - 2);
    g.fillStyle(0x303030, 0.4);
    g.fillRect(4, 4, ts - 8, ts - 8);
    g.generateTexture('tile_wall', ts, ts);
  }

  private generateObjectTextures(g: Phaser.GameObjects.Graphics): void {
    // Tree (oak)
    g.clear();
    g.fillStyle(0x5d4037);
    g.fillRect(12, 20, 8, 16); // trunk
    g.fillStyle(0x2e7d32);
    g.fillCircle(16, 14, 12); // canopy
    g.fillStyle(0x66bb6a, 0.4);
    g.fillCircle(12, 10, 5); // highlight
    g.generateTexture('obj_tree_oak', 32, 36);

    // Tree (pine)
    g.clear();
    g.fillStyle(0x4e342e);
    g.fillRect(14, 22, 4, 14);
    g.fillStyle(0x1b5e20);
    g.fillTriangle(16, 2, 4, 24, 28, 24);
    g.fillStyle(0x43a047, 0.4);
    g.fillTriangle(16, 6, 8, 20, 24, 20);
    g.generateTexture('obj_tree_pine', 32, 36);

    // Rock
    g.clear();
    g.fillStyle(0x78909c);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0x90a4ae, 0.5);
    g.fillCircle(10, 10, 4);
    g.generateTexture('obj_rock', 24, 24);

    // Bush
    g.clear();
    g.fillStyle(0x388e3c);
    g.fillCircle(10, 10, 8);
    g.fillCircle(18, 8, 6);
    g.fillStyle(0x66bb6a, 0.3);
    g.fillCircle(8, 7, 3);
    g.generateTexture('obj_bush', 24, 20);

    // Chest
    g.clear();
    g.fillStyle(0x8d6e63);
    g.fillRect(2, 6, 28, 18);
    g.fillStyle(0x6d4c41);
    g.fillRect(2, 6, 28, 4); // lid
    g.fillStyle(0xffd700);
    g.fillRect(13, 10, 6, 6); // lock
    g.lineStyle(1, 0x5d4037);
    g.strokeRect(2, 6, 28, 18);
    g.generateTexture('obj_chest', 32, 24);

    // Barrel
    g.clear();
    g.fillStyle(0x6d4c41);
    g.fillCircle(12, 12, 10);
    g.fillStyle(0x795548, 0.4);
    g.fillRect(4, 4, 16, 2);
    g.fillRect(4, 18, 16, 2);
    g.generateTexture('obj_barrel', 24, 24);

    // Torch
    g.clear();
    g.fillStyle(0x5d4037);
    g.fillRect(6, 10, 4, 18);
    g.fillStyle(0xff9800);
    g.fillCircle(8, 8, 5);
    g.fillStyle(0xffeb3b, 0.7);
    g.fillCircle(8, 6, 3);
    g.generateTexture('obj_torch', 16, 28);
  }

  private generateVFXTextures(g: Phaser.GameObjects.Graphics): void {
    // Slash effect
    g.clear();
    g.lineStyle(3, 0xffffff, 0.8);
    g.lineBetween(4, 28, 28, 4);
    g.lineStyle(2, 0xffff88, 0.6);
    g.lineBetween(8, 24, 24, 8);
    g.generateTexture('vfx_slash', 32, 32);

    // Fireball
    g.clear();
    g.fillStyle(0xff4500, 0.8);
    g.fillCircle(12, 12, 10);
    g.fillStyle(0xff9900, 0.6);
    g.fillCircle(12, 12, 6);
    g.fillStyle(0xffcc00, 0.9);
    g.fillCircle(12, 12, 3);
    g.generateTexture('vfx_fireball', 24, 24);

    // Heal circle
    g.clear();
    g.fillStyle(0x00e676, 0.3);
    g.fillCircle(16, 16, 14);
    g.lineStyle(2, 0x69f0ae, 0.7);
    g.strokeCircle(16, 16, 14);
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(14, 8, 4, 16); // cross
    g.fillRect(8, 14, 16, 4);
    g.generateTexture('vfx_heal', 32, 32);

    // Shadow bolt
    g.clear();
    g.fillStyle(0x7b1fa2, 0.7);
    g.fillCircle(10, 10, 8);
    g.fillStyle(0xce93d8, 0.5);
    g.fillCircle(10, 10, 4);
    g.generateTexture('vfx_shadow', 20, 20);

    // Ice shard
    g.clear();
    g.fillStyle(0x80deea, 0.8);
    g.fillTriangle(8, 0, 0, 16, 16, 16);
    g.fillStyle(0xe0f7fa, 0.5);
    g.fillTriangle(8, 3, 4, 12, 12, 12);
    g.generateTexture('vfx_ice', 16, 16);

    // Lightning bolt
    g.clear();
    g.lineStyle(2, 0xffff44, 0.9);
    g.lineBetween(8, 0, 4, 8);
    g.lineBetween(4, 8, 10, 12);
    g.lineBetween(10, 12, 6, 20);
    g.lineStyle(1, 0xffffff, 0.7);
    g.lineBetween(8, 0, 4, 8);
    g.generateTexture('vfx_lightning', 16, 20);

    // Particle dot
    g.clear();
    g.fillStyle(0xffffff);
    g.fillCircle(2, 2, 2);
    g.generateTexture('particle_dot', 4, 4);
  }
}
