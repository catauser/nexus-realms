// GameScene — The actual playable game
import Phaser from 'phaser';

// ─── Constants ───────────────────────────────────────────────
const TILE = 32;
const MAP_W = 80;  // tiles
const MAP_H = 60;  // tiles
const SPEED = 160;

// ─── Map Data (0=grass, 1=dirt, 2=stone, 3=water, 4=wall, 5=tree, 6=flowers, 7=bush, 8=rock)
const MAP: number[][] = [];
for (let y = 0; y < MAP_H; y++) {
  MAP[y] = [];
  for (let x = 0; x < MAP_W; x++) {
    // Border walls
    if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) {
      MAP[y][x] = 4;
    }
    // Water pond
    else if (x >= 60 && x <= 68 && y >= 20 && y <= 26) {
      MAP[y][x] = 3;
    }
    // Village area (stone floor)
    else if (x >= 30 && x <= 50 && y >= 25 && y <= 40) {
      MAP[y][x] = 2;
    }
    // Dirt paths
    else if ((y === 32 && x >= 10 && x <= 50) || (x === 40 && y >= 10 && y <= 50)) {
      MAP[y][x] = 1;
    }
    // Scattered trees
    else if (Math.random() < 0.08 && x > 5 && y > 5) {
      MAP[y][x] = 5;
    }
    // Scattered rocks
    else if (Math.random() < 0.03) {
      MAP[y][x] = 8;
    }
    // Flowers
    else if (Math.random() < 0.05) {
      MAP[y][x] = 6;
    }
    // Bushes
    else if (Math.random() < 0.04) {
      MAP[y][x] = 7;
    }
    // Default grass
    else {
      MAP[y][x] = 0;
    }
  }
}

// ─── Tile lookup
const TILE_KEYS = [
  'tile_grass', 'tile_dirt', 'tile_stone', 'tile_water',
  'tile_wall', 'tile_tree_trunk', 'tile_flowers', 'tile_bush', 'tile_rock',
];

// ─── Entity Types ────────────────────────────────────────────
interface MonsterData {
  sprite: Phaser.Physics.Arcade.Sprite;
  hp: number;
  maxHp: number;
  name: string;
  level: number;
  damage: number;
  xp: number;
  speed: number;
  direction: number;
  moveTimer: number;
  hpBar: Phaser.GameObjects.Graphics;
  dead: boolean;
  aggroRange: number;
  target: boolean;
}

interface NPCData {
  sprite: Phaser.Physics.Arcade.Sprite;
  name: string;
  dialogue: string[];
  type: 'merchant' | 'quest' | 'guard';
}

interface LootData {
  sprite: Phaser.Physics.Arcade.Sprite;
  itemId: string;
  name: string;
}

export class GameScene extends Phaser.Scene {
  // Player
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerHp = 100;
  private playerMaxHp = 100;
  private playerMp = 50;
  private playerMaxMp = 50;
  private playerLevel = 1;
  private playerXp = 0;
  private playerXpToLevel = 100;
  private playerDamage = 15;
  private playerDirection = 'down';
  private playerName = 'Hero';
  private isAttacking = false;
  private attackCooldown = 0;
  private isDead = false;
  private respawnTimer = 0;

  // Gold
  private gold = 0;

  // Inventory
  private inventory: { id: string; name: string; qty: number; icon: string }[] = [];

  // Combat
  private targetMonster: MonsterData | null = null;
  private lastDamageTime = 0;
  private combatRegenTimer = 0;

  // World
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private monsters: MonsterData[] = [];
  private npcs: NPCData[] = [];
  private loots: LootData[] = [];

  // Camera
  private worldBounds = { x: 0, y: 0, w: MAP_W * TILE, h: MAP_H * TILE };

  // UI scene reference
  private uiScene!: Phaser.Scene;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // ─── Create Tilemap ─────────────────────────────────────
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tileType = MAP[y][x];
        const key = TILE_KEYS[tileType] || 'tile_grass';
        const img = this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, key);
        img.setDepth(0);

        // Make trees/walls/rocks/water solid
        if (tileType === 4 || tileType === 5 || tileType === 8 || tileType === 3) {
          const body = this.physics.add.staticImage(x * TILE + TILE / 2, y * TILE + TILE / 2, key);
          body.setSize(TILE, TILE);
          body.setImmovable(true);
          body.setVisible(false);
          (body as any).tileType = tileType;
        }
      }
    }

    // ─── Create Player ──────────────────────────────────────
    this.player = this.physics.add.sprite(40 * TILE, 32 * TILE, 'player_down_0');
    this.player.setCollideWorldBounds(true);
    this.player.setSize(20, 24);
    this.player.setOffset(6, 6);
    this.player.setDepth(5);

    // ─── Camera ─────────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.worldBounds.w, this.worldBounds.h);
    this.cameras.main.setZoom(1.5);

    // ─── Input ──────────────────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey('W'),
      A: this.input.keyboard!.addKey('A'),
      S: this.input.keyboard!.addKey('S'),
      D: this.input.keyboard!.addKey('D'),
    };

    // Click to attack
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleClick(pointer);
    });

    // Number keys for abilities
    this.input.keyboard!.on('keydown-ONE', () => this.useAbility(0));
    this.input.keyboard!.on('keydown-TWO', () => this.useAbility(1));
    this.input.keyboard!.on('keydown-THREE', () => this.useAbility(2));
    this.input.keyboard!.on('keydown-FOUR', () => this.useAbility(3));
    this.input.keyboard!.on('keydown-FIVE', () => this.useAbility(4));

    // E key for interact
    this.input.keyboard!.on('keydown-E', () => this.interact());

    // ─── Spawn Monsters ─────────────────────────────────────
    this.spawnMonsters();

    // ─── Spawn NPCs ─────────────────────────────────────────
    this.spawnNPCs();

    // ─── Collisions ─────────────────────────────────────────
    // Player vs solid tiles
    const solidBodies = this.physics.add.staticGroup();
    this.children.each((child) => {
      if ((child as any).tileType !== undefined) {
        solidBodies.add(child as Phaser.Physics.Arcade.Sprite);
      }
      return true;
    });
    this.physics.add.collider(this.player, solidBodies);

    // ─── Start UI Scene ─────────────────────────────────────
    this.scene.launch('UIScene');
    this.uiScene = this.scene.get('UIScene');

    // ─── Notify UI of initial state ─────────────────────────
    this.time.delayedCall(100, () => {
      this.events.emit('playerUpdate', this.getPlayerState());
    });
  }

  update(_time: number, delta: number): void {
    if (this.isDead) {
      this.respawnTimer -= delta;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    this.handleMovement(delta);
    this.updateMonsters(delta);
    this.updateCombat(delta);
    this.updateLootPickup();
    this.updateUI();
  }

  // ─── Movement ──────────────────────────────────────────────
  private handleMovement(_delta: number): void {
    let vx = 0, vy = 0;
    let direction = this.playerDirection;

    if (this.wasd.A.isDown || this.cursors.left.isDown) {
      vx = -SPEED;
      direction = 'left';
    } else if (this.wasd.D.isDown || this.cursors.right.isDown) {
      vx = SPEED;
      direction = 'right';
    }

    if (this.wasd.W.isDown || this.cursors.up.isDown) {
      vy = -SPEED;
      direction = 'up';
    } else if (this.wasd.S.isDown || this.cursors.down.isDown) {
      vy = SPEED;
      direction = 'down';
    }

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.player.setVelocity(vx, vy);
    this.playerDirection = direction;

    // Update sprite based on direction and animation frame
    const moving = vx !== 0 || vy !== 0;
    const frame = moving ? Math.floor(Date.now() / 200) % 2 : 0;
    this.player.setTexture(`player_${direction}_${frame}`);
  }

  // ─── Monster Spawning ──────────────────────────────────────
  private spawnMonsters(): void {
    const spawns = [
      // Near village - easy
      { x: 20, y: 20, type: 'slime', name: 'Green Slime', hp: 30, dmg: 5, xp: 15, lvl: 1, speed: 40, aggro: 120 },
      { x: 22, y: 25, type: 'slime', name: 'Green Slime', hp: 30, dmg: 5, xp: 15, lvl: 1, speed: 40, aggro: 120 },
      { x: 15, y: 30, type: 'wolf', name: 'Forest Wolf', hp: 50, dmg: 8, xp: 25, lvl: 2, speed: 80, aggro: 150 },
      { x: 18, y: 35, type: 'wolf', name: 'Forest Wolf', hp: 50, dmg: 8, xp: 25, lvl: 2, speed: 80, aggro: 150 },
      // Medium area
      { x: 55, y: 15, type: 'goblin', name: 'Goblin Scout', hp: 80, dmg: 12, xp: 40, lvl: 3, speed: 60, aggro: 130 },
      { x: 58, y: 18, type: 'goblin', name: 'Goblin Warrior', hp: 120, dmg: 15, xp: 55, lvl: 4, speed: 50, aggro: 140 },
      { x: 62, y: 12, type: 'goblin', name: 'Goblin Shaman', hp: 70, dmg: 18, xp: 50, lvl: 4, speed: 45, aggro: 160 },
      // Hard area
      { x: 70, y: 40, type: 'skeleton', name: 'Skeletal Warrior', hp: 150, dmg: 20, xp: 75, lvl: 5, speed: 55, aggro: 140 },
      { x: 72, y: 45, type: 'skeleton', name: 'Skeletal Mage', hp: 100, dmg: 25, xp: 80, lvl: 6, speed: 40, aggro: 180 },
      { x: 68, y: 50, type: 'spider', name: 'Giant Spider', hp: 130, dmg: 18, xp: 65, lvl: 5, speed: 70, aggro: 130 },
      // Boss
      { x: 75, y: 55, type: 'dragon', name: 'Ancient Dragon', hp: 500, dmg: 40, xp: 300, lvl: 10, speed: 30, aggro: 250 },
    ];

    for (const s of spawns) {
      const sprite = this.physics.add.sprite(s.x * TILE, s.y * TILE, s.type);
      sprite.setSize(24, 24);
      sprite.setOffset(4, 6);
      sprite.setDepth(4);
      sprite.setCollideWorldBounds(true);

      const hpBar = this.add.graphics();
      hpBar.setDepth(10);

      const monster: MonsterData = {
        sprite,
        hp: s.hp,
        maxHp: s.hp,
        name: s.name,
        level: s.lvl,
        damage: s.dmg,
        xp: s.xp,
        speed: s.speed,
        direction: Math.random() * Math.PI * 2,
        moveTimer: 0,
        hpBar,
        dead: false,
        aggroRange: s.aggro,
        target: false,
      };

      this.monsters.push(monster);

      // Monster-player collision
      this.physics.add.collider(this.player, sprite, () => {
        // Push back
      });
    }
  }

  // ─── NPC Spawning ──────────────────────────────────────────
  private spawnNPCs(): void {
    const npcSpawns = [
      { x: 38, y: 30, type: 'quest' as const, name: 'Elder Theron', dialogue: [
        'Welcome, adventurer! The village needs your help.',
        'Dark creatures have been spotted in the forest.',
        'Will you help us clear them out?',
        'Accept Quest: Clear the Forest (Kill 5 Wolves)',
      ]},
      { x: 42, y: 28, type: 'merchant' as const, name: 'Merchant Boris', dialogue: [
        'Welcome to my shop!',
        'I have potions, weapons, and supplies.',
        'What would you like to buy?',
        '[Health Potion - 10g] [Mana Potion - 12g]',
      ]},
      { x: 35, y: 35, type: 'guard' as const, name: 'Captain Aldric', dialogue: [
        'Halt! State your business.',
        'The roads are dangerous. Be careful out there.',
        'If you encounter bandits, report back to me.',
      ]},
      { x: 45, y: 32, type: 'quest' as const, name: 'Herbalist Mira', dialogue: [
        'Oh, a traveler! I need herbs for my medicines.',
        'Could you gather some Peacebloom for me?',
        'You can find them in the meadows to the north.',
        'Accept Quest: Herb Gathering (Collect 3 Herbs)',
      ]},
    ];

    for (const n of npcSpawns) {
      const textureKey = n.type === 'quest' ? 'npc_quest' : n.type === 'merchant' ? 'npc_merchant' : 'npc_guard';
      const sprite = this.physics.add.sprite(n.x * TILE, n.y * TILE, textureKey);
      sprite.setSize(24, 24);
      sprite.setOffset(4, 6);
      sprite.setDepth(4);
      sprite.setImmovable(true);

      this.npcs.push({
        sprite,
        name: n.name,
        dialogue: n.dialogue,
        type: n.type,
      });

      this.physics.add.collider(this.player, sprite);
    }
  }

  // ─── Combat ────────────────────────────────────────────────
  private handleClick(pointer: Phaser.Input.Pointer): void {
    if (this.isDead || this.isAttacking) return;

    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

    // Check if clicking on a monster
    for (const monster of this.monsters) {
      if (monster.dead) continue;

      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        monster.sprite.x, monster.sprite.y,
      );

      if (dist < 60 && this.isPointerOnMonster(pointer, monster)) {
        this.targetMonster = monster;
        monster.target = true;
        this.performAttack(monster);
        return;
      }
    }
  }

  private isPointerOnMonster(pointer: Phaser.Input.Pointer, monster: MonsterData): boolean {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const bounds = monster.sprite.getBounds();
    return bounds.contains(worldPoint.x, worldPoint.y);
  }

  private performAttack(monster: MonsterData): void {
    if (this.attackCooldown > 0) return;

    this.isAttacking = true;
    this.attackCooldown = 500; // ms

    // Face the monster
    const dx = monster.sprite.x - this.player.x;
    const dy = monster.sprite.y - this.player.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      this.playerDirection = dx > 0 ? 'right' : 'left';
    } else {
      this.playerDirection = dy > 0 ? 'down' : 'up';
    }

    // Calculate damage
    const baseDmg = this.playerDamage;
    const variance = Math.floor(Math.random() * 6) - 3;
    const crit = Math.random() < 0.15;
    let damage = baseDmg + variance;
    if (crit) damage = Math.floor(damage * 1.8);

    // Apply damage
    monster.hp -= damage;
    this.lastDamageTime = Date.now();

    // Show damage number
    this.showDamageNumber(monster.sprite.x, monster.sprite.y - 20, damage, crit);

    // Slash effect
    this.showSlashEffect(monster.sprite.x, monster.sprite.y);

    // Hit sound placeholder
    this.cameras.main.shake(50, 0.002);

    // Check death
    if (monster.hp <= 0) {
      this.killMonster(monster);
    }

    // Reset attack state
    this.time.delayedCall(300, () => {
      this.isAttacking = false;
    });
  }

  private useAbility(index: number): void {
    if (this.isDead) return;

    const abilities = [
      { name: 'Slash', cost: 0, dmg: 20, mpCost: 0 },
      { name: 'Power Strike', cost: 0, dmg: 35, mpCost: 10 },
      { name: 'Whirlwind', cost: 0, dmg: 25, mpCost: 15 },
      { name: 'Heal', cost: 0, dmg: -30, mpCost: 20 },
      { name: 'Fireball', cost: 0, dmg: 50, mpCost: 25 },
    ];

    const ability = abilities[index];
    if (!ability) return;

    if (ability.mpCost > this.playerMp) return;

    this.playerMp -= ability.mpCost;

    if (ability.dmg < 0) {
      // Heal
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp - ability.dmg);
      this.showDamageNumber(this.player.x, this.player.y - 20, -ability.dmg, false, true);
      this.showHealEffect(this.player.x, this.player.y);
    } else if (this.targetMonster && !this.targetMonster.dead) {
      // Attack target
      const monster = this.targetMonster;
      monster.hp -= ability.dmg;
      this.showDamageNumber(monster.sprite.x, monster.sprite.y - 20, ability.dmg, false);
      this.showSlashEffect(monster.sprite.x, monster.sprite.y);

      if (monster.hp <= 0) {
        this.killMonster(monster);
      }
    }
  }

  private interact(): void {
    // Check for nearby NPCs
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.sprite.x, npc.sprite.y,
      );

      if (dist < 60) {
        // Send dialogue to UI
        this.events.emit('npcDialogue', {
          name: npc.name,
          dialogue: npc.dialogue,
          type: npc.type,
        });
        return;
      }
    }

    // Check for nearby loot
    for (let i = this.loots.length - 1; i >= 0; i--) {
      const loot = this.loots[i];
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        loot.sprite.x, loot.sprite.y,
      );

      if (dist < 50) {
        this.pickupLoot(loot, i);
        return;
      }
    }
  }

  private killMonster(monster: MonsterData): void {
    monster.dead = true;
    monster.hp = 0;
    monster.sprite.setVelocity(0, 0);
    monster.sprite.setAlpha(0.3);
    monster.hpBar.clear();

    // Drop loot
    this.dropLoot(monster);

    // Grant XP
    this.gainXP(monster.xp);

    // Drop gold
    const goldDrop = Math.floor(Math.random() * 10) + monster.level * 2;
    this.gold += goldDrop;
    this.events.emit('chatMessage', {
      channel: 'loot',
      message: `You looted ${goldDrop} gold from ${monster.name}`,
    });

    // Respawn after 30 seconds
    this.time.delayedCall(30000, () => {
      this.respawnMonster(monster);
    });
  }

  private respawnMonster(monster: MonsterData): void {
    monster.dead = false;
    monster.hp = monster.maxHp;
    monster.sprite.setAlpha(1);
    monster.sprite.setPosition(monster.sprite.x, monster.sprite.y);
  }

  private dropLoot(monster: MonsterData): void {
    const lootTable: { chance: number; id: string; name: string; icon: string }[] = [
      { chance: 0.5, id: 'potion_hp', name: 'Health Potion', icon: '🧪' },
      { chance: 0.2, id: 'wolf_pelt', name: 'Wolf Pelt', icon: '🐺' },
      { chance: 0.15, id: 'bone', name: 'Bone Fragment', icon: '🦴' },
      { chance: 0.08, id: 'sword_iron', name: 'Iron Sword', icon: '⚔️' },
      { chance: 0.05, id: 'ring_power', name: 'Ring of Power', icon: '💍' },
    ];

    for (const loot of lootTable) {
      if (Math.random() < loot.chance) {
        const sprite = this.physics.add.sprite(
          monster.sprite.x + Math.random() * 20 - 10,
          monster.sprite.y + Math.random() * 20 - 10,
          'fx_loot',
        );
        sprite.setDepth(3);
        sprite.setAlpha(0.8);

        // Float animation
        this.tweens.add({
          targets: sprite,
          y: sprite.y - 5,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        this.loots.push({
          sprite,
          itemId: loot.id,
          name: loot.name,
        });

        this.events.emit('chatMessage', {
          channel: 'loot',
          message: `${monster.name} dropped: ${loot.name}`,
        });
      }
    }
  }

  private pickupLoot(loot: LootData, index: number): void {
    // Add to inventory
    const existing = this.inventory.find(i => i.id === loot.itemId);
    if (existing) {
      existing.qty++;
    } else {
      const icons: Record<string, string> = {
        potion_hp: '🧪', wolf_pelt: '🐺', bone: '🦴',
        sword_iron: '⚔️', ring_power: '💍',
      };
      this.inventory.push({
        id: loot.itemId,
        name: loot.name,
        qty: 1,
        icon: icons[loot.itemId] || '📦',
      });
    }

    // Remove sprite
    loot.sprite.destroy();
    this.loots.splice(index, 1);

    this.events.emit('chatMessage', {
      channel: 'loot',
      message: `Picked up: ${loot.name}`,
    });

    this.events.emit('inventoryUpdate', this.inventory);
  }

  // ─── Monster AI ────────────────────────────────────────────
  private updateMonsters(delta: number): void {
    for (const monster of this.monsters) {
      if (monster.dead) continue;

      const distToPlayer = Phaser.Math.Distance.Between(
        monster.sprite.x, monster.sprite.y,
        this.player.x, this.player.y,
      );

      monster.moveTimer -= delta;

      // Aggro behavior
      if (distToPlayer < monster.aggroRange) {
        // Chase player
        const angle = Phaser.Math.Angle.Between(
          monster.sprite.x, monster.sprite.y,
          this.player.x, this.player.y,
        );
        monster.sprite.setVelocity(
          Math.cos(angle) * monster.speed,
          Math.sin(angle) * monster.speed,
        );

        // Attack if close enough
        if (distToPlayer < 36 && monster.moveTimer <= 0) {
          this.monsterAttackPlayer(monster);
          monster.moveTimer = 1500; // attack cooldown
        }
      } else {
        // Wander
        if (monster.moveTimer <= 0) {
          monster.direction = Math.random() * Math.PI * 2;
          monster.moveTimer = 2000 + Math.random() * 3000;
          const wanderSpeed = monster.speed * 0.3;
          monster.sprite.setVelocity(
            Math.cos(monster.direction) * wanderSpeed,
            Math.sin(monster.direction) * wanderSpeed,
          );
        }
      }

      // Update HP bar
      this.updateMonsterHpBar(monster);
    }
  }

  private monsterAttackPlayer(monster: MonsterData): void {
    if (this.isDead) return;

    const damage = monster.damage + Math.floor(Math.random() * 4) - 2;
    this.playerHp -= damage;
    this.lastDamageTime = Date.now();

    this.showDamageNumber(this.player.x, this.player.y - 20, damage, false);
    this.cameras.main.shake(80, 0.003);

    if (this.playerHp <= 0) {
      this.playerDeath();
    }
  }

  private updateMonsterHpBar(monster: MonsterData): void {
    monster.hpBar.clear();
    if (monster.hp >= monster.maxHp) return;

    const x = monster.sprite.x - 16;
    const y = monster.sprite.y - 24;
    const w = 32;
    const h = 4;

    // Background
    monster.hpBar.fillStyle(0x000000, 0.7);
    monster.hpBar.fillRect(x - 1, y - 1, w + 2, h + 2);

    // HP fill
    const pct = monster.hp / monster.maxHp;
    const color = pct > 0.5 ? 0x00ff00 : pct > 0.25 ? 0xffaa00 : 0xff0000;
    monster.hpBar.fillStyle(color);
    monster.hpBar.fillRect(x, y, w * pct, h);
  }

  // ─── Player State ──────────────────────────────────────────
  private playerDeath(): void {
    this.isDead = true;
    this.player.setVelocity(0, 0);
    this.player.setAlpha(0.3);
    this.respawnTimer = 5000;

    this.events.emit('chatMessage', {
      channel: 'system',
      message: 'You have died! Respawning in 5 seconds...',
    });
  }

  private respawn(): void {
    this.isDead = false;
    this.playerHp = this.playerMaxHp;
    this.playerMp = this.playerMaxMp;
    this.player.setAlpha(1);
    this.player.setPosition(40 * TILE, 32 * TILE);
    this.targetMonster = null;

    this.events.emit('chatMessage', {
      channel: 'system',
      message: 'You have respawned.',
    });
  }

  private gainXP(xp: number): void {
    this.playerXp += xp;

    this.events.emit('chatMessage', {
      channel: 'xp',
      message: `Gained ${xp} experience!`,
    });

    while (this.playerXp >= this.playerXpToLevel) {
      this.playerXp -= this.playerXpToLevel;
      this.playerLevel++;
      this.playerXpToLevel = Math.floor(this.playerXpToLevel * 1.5);
      this.playerMaxHp += 15;
      this.playerMaxMp += 8;
      this.playerDamage += 3;
      this.playerHp = this.playerMaxHp;
      this.playerMp = this.playerMaxMp;

      this.events.emit('chatMessage', {
        channel: 'system',
        message: `🎉 LEVEL UP! You are now level ${this.playerLevel}!`,
      });

      this.showLevelUpEffect();
    }
  }

  // ─── Effects ───────────────────────────────────────────────
  private showDamageNumber(x: number, y: number, damage: number, crit: boolean, heal: boolean = false): void {
    const color = heal ? '#00ff00' : crit ? '#ffd700' : '#ff4444';
    const size = crit ? '20px' : '16px';
    const text = heal ? `+${damage}` : crit ? `${damage}!` : `-${damage}`;

    const dmgText = this.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: size,
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    dmgText.setOrigin(0.5);
    dmgText.setDepth(20);

    this.tweens.add({
      targets: dmgText,
      y: y - 40,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => dmgText.destroy(),
    });
  }

  private showSlashEffect(x: number, y: number): void {
    const slash = this.add.image(x, y, 'fx_slash');
    slash.setDepth(15);
    slash.setAlpha(0.8);

    this.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      rotation: 1,
      duration: 300,
      onComplete: () => slash.destroy(),
    });
  }

  private showHealEffect(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const particle = this.add.image(
        x + Math.random() * 30 - 15,
        y + 20,
        'fx_heal',
      );
      particle.setDepth(15);
      particle.setAlpha(0.8);

      this.tweens.add({
        targets: particle,
        y: y - 30,
        alpha: 0,
        duration: 800,
        delay: i * 100,
        onComplete: () => particle.destroy(),
      });
    }
  }

  private showLevelUpEffect(): void {
    const text = this.add.text(this.player.x, this.player.y - 40, 'LEVEL UP!', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(25);

    this.tweens.add({
      targets: text,
      y: this.player.y - 100,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 2000,
      onComplete: () => text.destroy(),
    });

    this.cameras.main.flash(500, 255, 215, 0);
  }

  // ─── Combat Update ─────────────────────────────────────────
  private updateCombat(delta: number): void {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    // Combat regen (5 seconds after last damage)
    if (Date.now() - this.lastDamageTime > 5000) {
      this.combatRegenTimer += delta;
      if (this.combatRegenTimer >= 3000) {
        this.combatRegenTimer = 0;
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 2);
        this.playerMp = Math.min(this.playerMaxMp, this.playerMp + 1);
      }
    }

    // Deselect dead target
    if (this.targetMonster && this.targetMonster.dead) {
      this.targetMonster = null;
    }
  }

  // ─── Loot Pickup ───────────────────────────────────────────
  private updateLootPickup(): void {
    for (let i = this.loots.length - 1; i >= 0; i--) {
      const loot = this.loots[i];
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        loot.sprite.x, loot.sprite.y,
      );

      if (dist < 30) {
        this.pickupLoot(loot, i);
      }
    }
  }

  // ─── UI Update ─────────────────────────────────────────────
  private updateUI(): void {
    this.events.emit('playerUpdate', this.getPlayerState());

    if (this.targetMonster && !this.targetMonster.dead) {
      this.events.emit('targetUpdate', {
        name: this.targetMonster.name,
        level: this.targetMonster.level,
        hp: this.targetMonster.hp,
        maxHp: this.targetMonster.maxHp,
      });
    } else {
      this.events.emit('targetClear');
    }
  }

  private getPlayerState() {
    return {
      name: this.playerName,
      level: this.playerLevel,
      hp: this.playerHp,
      maxHp: this.playerMaxHp,
      mp: this.playerMp,
      maxMp: this.playerMaxMp,
      xp: this.playerXp,
      xpToLevel: this.playerXpToLevel,
      gold: this.gold,
      direction: this.playerDirection,
      x: Math.floor(this.player.x / TILE),
      y: Math.floor(this.player.y / TILE),
    };
  }
}
