// BootScene — Generate all game assets procedurally
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.generateTiles();
    this.generatePlayer();
    this.generateMonsters();
    this.generateNPCs();
    this.generateEffects();
    this.generateUI();

    // Go to game
    this.scene.start('GameScene');
  }

  private generateTiles(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const S = 32; // tile size

    // Grass tile
    g.fillStyle(0x3a6b2a);
    g.fillRect(0, 0, S, S);
    g.fillStyle(0x4a7b3a);
    g.fillRect(4, 4, 2, 2);
    g.fillRect(20, 12, 2, 2);
    g.fillRect(10, 24, 2, 2);
    g.generateTexture('tile_grass', S, S);
    g.clear();

    // Dirt path
    g.fillStyle(0x8b7355);
    g.fillRect(0, 0, S, S);
    g.fillStyle(0x7a6244);
    g.fillRect(8, 8, 4, 4);
    g.fillRect(22, 18, 3, 3);
    g.generateTexture('tile_dirt', S, S);
    g.clear();

    // Stone floor
    g.fillStyle(0x6a6a7a);
    g.fillRect(0, 0, S, S);
    g.fillStyle(0x5a5a6a);
    g.fillRect(0, 0, S, 1);
    g.fillRect(0, 0, 1, S);
    g.generateTexture('tile_stone', S, S);
    g.clear();

    // Water
    g.fillStyle(0x2244aa);
    g.fillRect(0, 0, S, S);
    g.fillStyle(0x3355bb);
    g.fillRect(4, 8, 12, 2);
    g.fillRect(18, 20, 10, 2);
    g.generateTexture('tile_water', S, S);
    g.clear();

    // Wall
    g.fillStyle(0x5a4a3a);
    g.fillRect(0, 0, S, S);
    g.fillStyle(0x4a3a2a);
    g.fillRect(0, 0, S, 2);
    g.fillRect(0, 14, S, 4);
    g.fillStyle(0x6a5a4a);
    g.fillRect(2, 4, 12, 10);
    g.fillRect(18, 4, 12, 10);
    g.generateTexture('tile_wall', S, S);
    g.clear();

    // Tree trunk
    g.fillStyle(0x5a3a1a);
    g.fillRect(12, 8, 8, 24);
    g.generateTexture('tile_tree_trunk', S, S);
    g.clear();

    // Tree top
    g.fillStyle(0x2a6a1a);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x3a7a2a);
    g.fillCircle(12, 12, 8);
    g.fillStyle(0x1a5a0a);
    g.fillCircle(22, 20, 6);
    g.generateTexture('tile_tree_top', S, S);
    g.clear();

    // Flower
    g.fillStyle(0x3a6b2a);
    g.fillRect(0, 0, S, S);
    g.fillStyle(0xff6688);
    g.fillCircle(16, 12, 4);
    g.fillStyle(0xffaa44);
    g.fillCircle(16, 12, 2);
    g.fillStyle(0x2288aa);
    g.fillCircle(24, 22, 3);
    g.generateTexture('tile_flowers', S, S);
    g.clear();

    // Bush
    g.fillStyle(0x3a6b2a);
    g.fillRect(0, 0, S, S);
    g.fillStyle(0x2a5a1a);
    g.fillCircle(16, 20, 12);
    g.fillStyle(0x3a7a2a);
    g.fillCircle(10, 16, 8);
    g.generateTexture('tile_bush', S, S);
    g.clear();

    // Rock
    g.fillStyle(0x3a6b2a);
    g.fillRect(0, 0, S, S);
    g.fillStyle(0x7a7a8a);
    g.fillRect(6, 12, 20, 16);
    g.fillStyle(0x8a8a9a);
    g.fillRect(8, 14, 16, 12);
    g.generateTexture('tile_rock', S, S);
    g.clear();

    g.destroy();
  }

  private generatePlayer(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const S = 32;

    // 4 directions: down, left, right, up
    // 2 frames each: idle, walk

    // Down - frame 0 (idle)
    // Body
    g.fillStyle(0x4466aa);
    g.fillRect(10, 10, 12, 14); // torso
    // Head
    g.fillStyle(0xddaa77);
    g.fillCircle(16, 7, 6); // head
    // Hair
    g.fillStyle(0x553322);
    g.fillRect(10, 1, 12, 4);
    // Eyes
    g.fillStyle(0x222222);
    g.fillRect(13, 6, 2, 2);
    g.fillRect(17, 6, 2, 2);
    // Legs
    g.fillStyle(0x334488);
    g.fillRect(11, 24, 4, 6);
    g.fillRect(17, 24, 4, 6);
    // Boots
    g.fillStyle(0x553322);
    g.fillRect(11, 28, 4, 4);
    g.fillRect(17, 28, 4, 4);
    // Sword on back
    g.fillStyle(0xcccccc);
    g.fillRect(22, 8, 2, 16);
    g.fillStyle(0xffcc00);
    g.fillRect(20, 12, 6, 2);

    // Frame 0 = down idle
    g.generateTexture('player_down_0', S, S);
    g.clear();

    // Down - frame 1 (walk)
    g.fillStyle(0x4466aa);
    g.fillRect(10, 10, 12, 14);
    g.fillStyle(0xddaa77);
    g.fillCircle(16, 7, 6);
    g.fillStyle(0x553322);
    g.fillRect(10, 1, 12, 4);
    g.fillStyle(0x222222);
    g.fillRect(13, 6, 2, 2);
    g.fillRect(17, 6, 2, 2);
    // Legs spread
    g.fillStyle(0x334488);
    g.fillRect(9, 24, 4, 6);
    g.fillRect(19, 24, 4, 6);
    g.fillStyle(0x553322);
    g.fillRect(9, 28, 4, 4);
    g.fillRect(19, 28, 4, 4);
    g.fillStyle(0xcccccc);
    g.fillRect(22, 8, 2, 16);
    g.fillStyle(0xffcc00);
    g.fillRect(20, 12, 6, 2);
    g.generateTexture('player_down_1', S, S);
    g.clear();

    // Left frames
    g.fillStyle(0x4466aa);
    g.fillRect(10, 10, 12, 14);
    g.fillStyle(0xddaa77);
    g.fillCircle(14, 7, 6);
    g.fillStyle(0x553322);
    g.fillRect(8, 1, 12, 4);
    g.fillStyle(0x222222);
    g.fillRect(10, 6, 2, 2);
    g.fillStyle(0x334488);
    g.fillRect(11, 24, 4, 6);
    g.fillRect(17, 24, 4, 6);
    g.fillStyle(0x553322);
    g.fillRect(11, 28, 4, 4);
    g.fillRect(17, 28, 4, 4);
    // Sword in hand
    g.fillStyle(0xcccccc);
    g.fillRect(4, 12, 2, 14);
    g.generateTexture('player_left_0', S, S);
    g.clear();

    g.fillStyle(0x4466aa);
    g.fillRect(10, 10, 12, 14);
    g.fillStyle(0xddaa77);
    g.fillCircle(14, 7, 6);
    g.fillStyle(0x553322);
    g.fillRect(8, 1, 12, 4);
    g.fillStyle(0x222222);
    g.fillRect(10, 6, 2, 2);
    g.fillStyle(0x334488);
    g.fillRect(9, 24, 4, 6);
    g.fillRect(19, 24, 4, 6);
    g.fillStyle(0x553322);
    g.fillRect(9, 28, 4, 4);
    g.fillRect(19, 28, 4, 4);
    g.fillStyle(0xcccccc);
    g.fillRect(4, 12, 2, 14);
    g.generateTexture('player_left_1', S, S);
    g.clear();

    // Right frames (mirror of left)
    g.fillStyle(0x4466aa);
    g.fillRect(10, 10, 12, 14);
    g.fillStyle(0xddaa77);
    g.fillCircle(18, 7, 6);
    g.fillStyle(0x553322);
    g.fillRect(12, 1, 12, 4);
    g.fillStyle(0x222222);
    g.fillRect(20, 6, 2, 2);
    g.fillStyle(0x334488);
    g.fillRect(11, 24, 4, 6);
    g.fillRect(17, 24, 4, 6);
    g.fillStyle(0x553322);
    g.fillRect(11, 28, 4, 4);
    g.fillRect(17, 28, 4, 4);
    g.fillStyle(0xcccccc);
    g.fillRect(26, 12, 2, 14);
    g.generateTexture('player_right_0', S, S);
    g.clear();

    g.fillStyle(0x4466aa);
    g.fillRect(10, 10, 12, 14);
    g.fillStyle(0xddaa77);
    g.fillCircle(18, 7, 6);
    g.fillStyle(0x553322);
    g.fillRect(12, 1, 12, 4);
    g.fillStyle(0x222222);
    g.fillRect(20, 6, 2, 2);
    g.fillStyle(0x334488);
    g.fillRect(9, 24, 4, 6);
    g.fillRect(19, 24, 4, 6);
    g.fillStyle(0x553322);
    g.fillRect(9, 28, 4, 4);
    g.fillRect(19, 28, 4, 4);
    g.fillStyle(0xcccccc);
    g.fillRect(26, 12, 2, 14);
    g.generateTexture('player_right_1', S, S);
    g.clear();

    // Up frames
    g.fillStyle(0x4466aa);
    g.fillRect(10, 10, 12, 14);
    g.fillStyle(0xddaa77);
    g.fillCircle(16, 7, 6);
    g.fillStyle(0x553322);
    g.fillRect(10, 1, 12, 6); // back of head
    g.fillStyle(0x334488);
    g.fillRect(11, 24, 4, 6);
    g.fillRect(17, 24, 4, 6);
    g.fillStyle(0x553322);
    g.fillRect(11, 28, 4, 4);
    g.fillRect(17, 28, 4, 4);
    g.fillStyle(0xcccccc);
    g.fillRect(22, 8, 2, 16);
    g.generateTexture('player_up_0', S, S);
    g.clear();

    g.fillStyle(0x4466aa);
    g.fillRect(10, 10, 12, 14);
    g.fillStyle(0xddaa77);
    g.fillCircle(16, 7, 6);
    g.fillStyle(0x553322);
    g.fillRect(10, 1, 12, 6);
    g.fillStyle(0x334488);
    g.fillRect(9, 24, 4, 6);
    g.fillRect(19, 24, 4, 6);
    g.fillStyle(0x553322);
    g.fillRect(9, 28, 4, 4);
    g.fillRect(19, 28, 4, 4);
    g.fillStyle(0xcccccc);
    g.fillRect(22, 8, 2, 16);
    g.generateTexture('player_up_1', S, S);
    g.clear();

    g.destroy();
  }

  private generateMonsters(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const S = 32;

    // Wolf
    g.fillStyle(0x888888);
    g.fillRect(6, 12, 20, 12); // body
    g.fillStyle(0x999999);
    g.fillCircle(22, 10, 6); // head
    g.fillStyle(0x222222);
    g.fillRect(24, 8, 2, 2); // eye
    g.fillStyle(0x666666);
    g.fillRect(8, 24, 3, 6); // legs
    g.fillRect(14, 24, 3, 6);
    g.fillRect(19, 24, 3, 6);
    g.fillStyle(0xaaaaaa);
    g.fillRect(4, 10, 4, 4); // tail
    g.generateTexture('wolf', S, S);
    g.clear();

    // Goblin
    g.fillStyle(0x44aa44);
    g.fillRect(10, 10, 12, 12); // body
    g.fillStyle(0x55bb55);
    g.fillCircle(16, 7, 6); // head
    g.fillStyle(0xff0000);
    g.fillRect(13, 5, 2, 2); // eyes
    g.fillRect(17, 5, 2, 2);
    g.fillStyle(0x338833);
    g.fillRect(11, 22, 4, 6); // legs
    g.fillRect(17, 22, 4, 6);
    // Club
    g.fillStyle(0x8b6914);
    g.fillRect(24, 8, 3, 14);
    g.fillStyle(0x6b4914);
    g.fillRect(22, 4, 7, 6);
    g.generateTexture('goblin', S, S);
    g.clear();

    // Skeleton
    g.fillStyle(0xddddcc);
    g.fillRect(12, 10, 8, 12); // body (ribcage)
    g.fillStyle(0xeeeedd);
    g.fillCircle(16, 7, 6); // skull
    g.fillStyle(0x111111);
    g.fillRect(13, 5, 3, 3); // eye sockets
    g.fillRect(17, 5, 3, 3);
    g.fillRect(15, 8, 2, 2); // nose
    g.fillStyle(0xccccbb);
    g.fillRect(12, 22, 3, 8); // legs
    g.fillRect(17, 22, 3, 8);
    // Sword
    g.fillStyle(0xcccccc);
    g.fillRect(24, 6, 2, 18);
    g.generateTexture('skeleton', S, S);
    g.clear();

    // Spider
    g.fillStyle(0x333333);
    g.fillCircle(16, 16, 8); // body
    g.fillStyle(0x444444);
    g.fillCircle(16, 10, 5); // head
    g.fillStyle(0xff0000);
    g.fillRect(14, 8, 2, 2); // eyes
    g.fillRect(18, 8, 2, 2);
    // Legs
    g.lineStyle(2, 0x222222);
    for (let i = 0; i < 4; i++) {
      const angle = (i * 0.4) - 0.6;
      g.beginPath();
      g.moveTo(12, 14 + i * 3);
      g.lineTo(2, 10 + i * 5);
      g.strokePath();
      g.beginPath();
      g.moveTo(20, 14 + i * 3);
      g.lineTo(30, 10 + i * 5);
      g.strokePath();
    }
    g.generateTexture('spider', S, S);
    g.clear();

    // Slime
    g.fillStyle(0x44cc44);
    g.fillCircle(16, 20, 10);
    g.fillStyle(0x55dd55);
    g.fillCircle(16, 16, 8);
    g.fillStyle(0x222222);
    g.fillRect(12, 14, 3, 3); // eyes
    g.fillRect(18, 14, 3, 3);
    g.fillStyle(0x33bb33);
    g.fillCircle(16, 22, 6);
    g.generateTexture('slime', S, S);
    g.clear();

    // Boss Dragon (64x64)
    g.fillStyle(0x880000);
    g.fillRect(12, 20, 40, 30); // body
    g.fillStyle(0xaa2222);
    g.fillCircle(32, 14, 14); // head
    g.fillStyle(0xff0000);
    g.fillRect(26, 10, 4, 4); // eyes
    g.fillRect(34, 10, 4, 4);
    // Wings
    g.fillStyle(0x660000);
    g.beginPath();
    g.moveTo(12, 24);
    g.lineTo(0, 8);
    g.lineTo(8, 30);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(52, 24);
    g.lineTo(64, 8);
    g.lineTo(56, 30);
    g.closePath();
    g.fillPath();
    // Tail
    g.fillStyle(0x770000);
    g.fillRect(48, 36, 14, 4);
    g.fillRect(58, 34, 4, 4);
    g.generateTexture('dragon', 64, 64);
    g.clear();

    g.destroy();
  }

  private generateNPCs(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const S = 32;

    // Merchant NPC
    g.fillStyle(0xcc8844);
    g.fillRect(10, 10, 12, 14);
    g.fillStyle(0xddaa77);
    g.fillCircle(16, 7, 6);
    g.fillStyle(0x886633);
    g.fillRect(10, 1, 12, 4);
    g.fillStyle(0x222222);
    g.fillRect(13, 6, 2, 2);
    g.fillRect(17, 6, 2, 2);
    // Smile
    g.lineStyle(1, 0x222222);
    g.beginPath();
    g.arc(16, 8, 3, 0, Math.PI);
    g.strokePath();
    g.fillStyle(0xaa7733);
    g.fillRect(11, 24, 4, 6);
    g.fillRect(17, 24, 4, 6);
    g.generateTexture('npc_merchant', S, S);
    g.clear();

    // Quest giver NPC (with exclamation mark)
    g.fillStyle(0x4488cc);
    g.fillRect(10, 10, 12, 14);
    g.fillStyle(0xddaa77);
    g.fillCircle(16, 7, 6);
    g.fillStyle(0x446688);
    g.fillRect(10, 1, 12, 4);
    g.fillStyle(0x222222);
    g.fillRect(13, 6, 2, 2);
    g.fillRect(17, 6, 2, 2);
    g.fillStyle(0x336699);
    g.fillRect(11, 24, 4, 6);
    g.fillRect(17, 24, 4, 6);
    // Exclamation mark above head
    g.fillStyle(0xffdd00);
    g.fillRect(14, -4, 4, 8);
    g.fillRect(14, 6, 4, 2);
    g.generateTexture('npc_quest', S, S);
    g.clear();

    // Guard NPC
    g.fillStyle(0x888899);
    g.fillRect(10, 10, 12, 14);
    g.fillStyle(0xddaa77);
    g.fillCircle(16, 7, 6);
    // Helmet
    g.fillStyle(0x777788);
    g.fillRect(9, 0, 14, 6);
    g.fillRect(10, 0, 12, 8);
    g.fillStyle(0x222222);
    g.fillRect(13, 6, 2, 2);
    g.fillRect(17, 6, 2, 2);
    g.fillStyle(0x666677);
    g.fillRect(11, 24, 4, 6);
    g.fillRect(17, 24, 4, 6);
    // Spear
    g.fillStyle(0x8b6914);
    g.fillRect(24, 2, 2, 28);
    g.fillStyle(0xcccccc);
    g.fillRect(23, 0, 4, 4);
    g.generateTexture('npc_guard', S, S);
    g.clear();

    g.destroy();
  }

  private generateEffects(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Slash effect
    g.lineStyle(3, 0xffffff);
    g.beginPath();
    g.arc(16, 16, 12, -0.5, 1.5);
    g.strokePath();
    g.generateTexture('fx_slash', 32, 32);
    g.clear();

    // Hit spark
    g.fillStyle(0xffff00);
    g.fillCircle(8, 8, 4);
    g.fillStyle(0xffffff);
    g.fillCircle(8, 8, 2);
    g.generateTexture('fx_hit', 16, 16);
    g.clear();

    // Heal effect
    g.fillStyle(0x00ff00);
    g.fillCircle(8, 8, 6);
    g.fillStyle(0x88ff88);
    g.fillCircle(8, 8, 3);
    g.generateTexture('fx_heal', 16, 16);
    g.clear();

    // Fireball
    g.fillStyle(0xff4400);
    g.fillCircle(8, 8, 6);
    g.fillStyle(0xffaa00);
    g.fillCircle(8, 8, 4);
    g.fillStyle(0xffff00);
    g.fillCircle(8, 8, 2);
    g.generateTexture('fx_fireball', 16, 16);
    g.clear();

    // Loot sparkle
    g.fillStyle(0xffd700);
    g.fillCircle(8, 8, 5);
    g.generateTexture('fx_loot', 16, 16);
    g.clear();

    g.destroy();
  }

  private generateUI(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Health potion icon
    g.fillStyle(0xff4444);
    g.fillRoundedRect(2, 2, 12, 12, 2);
    g.fillStyle(0xffffff);
    g.fillRect(6, 4, 4, 8);
    g.fillRect(4, 6, 8, 4);
    g.generateTexture('icon_potion_hp', 16, 16);
    g.clear();

    // Mana potion icon
    g.fillStyle(0x4444ff);
    g.fillRoundedRect(2, 2, 12, 12, 2);
    g.fillStyle(0xffffff);
    g.fillRect(6, 4, 4, 8);
    g.fillRect(4, 6, 8, 4);
    g.generateTexture('icon_potion_mp', 16, 16);
    g.clear();

    // Sword icon
    g.fillStyle(0xcccccc);
    g.fillRect(7, 1, 2, 10);
    g.fillStyle(0x8b6914);
    g.fillRect(5, 9, 6, 2);
    g.fillStyle(0xffcc00);
    g.fillRect(4, 11, 8, 2);
    g.generateTexture('icon_sword', 16, 16);
    g.clear();

    // Shield icon
    g.fillStyle(0x8888cc);
    g.fillRect(3, 2, 10, 12);
    g.fillStyle(0x6666aa);
    g.fillRect(5, 4, 6, 8);
    g.fillStyle(0xffcc00);
    g.fillRect(7, 6, 2, 4);
    g.generateTexture('icon_shield', 16, 16);
    g.clear();

    g.destroy();
  }
}
