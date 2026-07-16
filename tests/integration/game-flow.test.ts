// ============================================================
// Nexus Realms — Integration Tests
// Tests for client-server communication and game flow
// ============================================================
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { World } from '../../src/server/ecs/World';
import { validateMessage, createMessage } from '../../src/shared/protocol';
import {
  Direction,
  ClassType,
  ChatChannel,
  EquipmentSlot,
  GAME_CONFIG,
  calculateHeal,
  calculateMaxHP,
  calculateMaxMana,
  CLASS_BASE_STATS,
} from '../../src/shared/types';

/**
 * Integration Test: Full Game Flow Simulation
 *
 * Simulates the lifecycle of a player from creation through
 * gameplay actions without actual WebSocket connections.
 */
describe('Integration: Player Lifecycle', () => {
  let world: World;

  beforeEach(() => {
    world = new World();
  });

  it('should create a player entity with all required components', () => {
    const player = world.createEntity('player', 'player-001');

    // Add all player components
    world.addComponent(player.id, 'position', {
      x: 1000, y: 1500, zone_id: 'verdant_plains_01', direction: Direction.DOWN,
    });
    world.addComponent(player.id, 'health', { hp: 200, max_hp: 200, regen_rate: 2 });
    world.addComponent(player.id, 'mana', { mana: 180, max_mana: 180, regen_rate: 5, resource_type: 'mana' });
    world.addComponent(player.id, 'stats', {
      ...CLASS_BASE_STATS[ClassType.WARRIOR],
      critical_chance: 10, critical_damage: 1.5, haste: 5,
      dodge: 3, block: 0, parry: 2, hit_chance: 95,
      spell_power: 0, attack_power: 22,
    });
    world.addComponent(player.id, 'equipment', { slots: {} });
    world.addComponent(player.id, 'inventory', { slots: new Array(GAME_CONFIG.INVENTORY_SLOTS).fill(null), gold: 100 });
    world.addComponent(player.id, 'combat', { target_id: null, in_combat: false });
    world.addComponent(player.id, 'buff', { active_buffs: [] });

    // Verify all components exist
    expect(world.getComponent(player.id, 'position')).toBeDefined();
    expect(world.getComponent(player.id, 'health')).toBeDefined();
    expect(world.getComponent(player.id, 'mana')).toBeDefined();
    expect(world.getComponent(player.id, 'stats')).toBeDefined();
    expect(world.getComponent(player.id, 'equipment')).toBeDefined();
    expect(world.getComponent(player.id, 'inventory')).toBeDefined();
    expect(world.getComponent(player.id, 'combat')).toBeDefined();
    expect(world.getComponent(player.id, 'buff')).toBeDefined();

    // Verify entity query
    const players = world.query(['position', 'health', 'stats']);
    expect(players).toContain(player.id);
  });

  it('should have valid stats for player and monster', () => {
    // Create player
    const player = world.createEntity('player', 'player-001');
    const playerStats = {
      ...CLASS_BASE_STATS[ClassType.WARRIOR],
      critical_chance: 15, critical_damage: 1.5, haste: 5,
      dodge: 5, block: 0, parry: 3, hit_chance: 95,
      spell_power: 0, attack_power: 80,
    } as any;
    world.addComponent(player.id, 'stats', playerStats);

    // Create monster
    const monster = world.createEntity('monster', 'monster-001');
    const monsterStats = {
      strength: 30, agility: 20, intellect: 5, spirit: 5, stamina: 30,
      armor: 20, fire_resist: 0, ice_resist: 0, lightning_resist: 0,
      holy_resist: 0, shadow_resist: 0, nature_resist: 0,
      critical_chance: 5, critical_damage: 1.5, haste: 0,
      dodge: 3, block: 0, parry: 0, hit_chance: 90,
      spell_power: 0, attack_power: 40,
    } as any;
    world.addComponent(monster.id, 'stats', monsterStats);

    // Verify stats are stored
    const storedPlayerStats = world.getComponent(player.id, 'stats');
    const storedMonsterStats = world.getComponent(monster.id, 'stats');
    expect(storedPlayerStats).toBeDefined();
    expect(storedMonsterStats).toBeDefined();
    expect((storedPlayerStats as any).attack_power).toBe(80);
    expect((storedMonsterStats as any).armor).toBe(20);

    // Verify entities are queryable
    const combatants = world.query(['stats']);
    expect(combatants.length).toBe(2);
  });

  it('should simulate inventory management', () => {
    const player = world.createEntity('player', 'player-001');
    const inventory = new Array(GAME_CONFIG.INVENTORY_SLOTS).fill(null);
    inventory[0] = { item_id: 'sword_iron_01', quantity: 1, durability: 100, max_durability: 100 };
    inventory[1] = { item_id: 'potion_health_01', quantity: 5, durability: 100, max_durability: 100 };

    world.addComponent(player.id, 'inventory', { slots: inventory, gold: 500 });

    const inv = world.getComponent<{ slots: any[]; gold: number }>(player.id, 'inventory');
    expect(inv).toBeDefined();
    expect(inv!.slots[0]!.item_id).toBe('sword_iron_01');
    expect(inv!.slots[1]!.quantity).toBe(5);
    expect(inv!.gold).toBe(500);

    // Simulate swapping items
    const temp = inv!.slots[0];
    inv!.slots[0] = inv!.slots[1];
    inv!.slots[1] = temp;

    expect(inv!.slots[0]!.item_id).toBe('potion_health_01');
    expect(inv!.slots[1]!.item_id).toBe('sword_iron_01');
  });
});

describe('Integration: Protocol Validation Flow', () => {
  it('should validate a complete login flow', () => {
    // Step 1: Client sends login
    const loginMsg = validateMessage('auth.login', {
      username: 'testplayer',
      password_hash: 'hashed_password_123',
    });
    expect(loginMsg.success).toBe(true);

    // Step 2: Server responds with success (no validation needed for server messages)
    const response = createMessage('auth.success', {
      player: { id: 'player-001', name: 'TestPlayer', level: 1 },
      world_state: { zone_id: 'verdant_plains_01', time: 1000, weather: 'clear' },
    });
    expect(JSON.parse(response).type).toBe('auth.success');
  });

  it('should validate a complete movement flow', () => {
    // Client sends move
    const moveMsg = validateMessage('player.move', {
      x: 1500, y: 2000, direction: Direction.DOWN,
    });
    expect(moveMsg.success).toBe(true);

    // Server broadcasts position update
    const broadcast = createMessage('player.move', {
      player_id: 'player-001', x: 1500, y: 2000,
      direction: Direction.DOWN, speed: 3,
    });
    const parsed = JSON.parse(broadcast);
    expect(parsed.data.x).toBe(1500);
  });

  it('should validate a complete chat flow', () => {
    // Client sends chat
    const chatMsg = validateMessage('chat.send', {
      channel: ChatChannel.SAY,
      message: 'Hello, world!',
    });
    expect(chatMsg.success).toBe(true);

    // Server broadcasts message
    const broadcast = createMessage('chat.message', {
      channel: ChatChannel.SAY,
      sender_name: 'TestPlayer',
      message: 'Hello, world!',
      timestamp: Date.now(),
    });
    expect(JSON.parse(broadcast).type).toBe('chat.message');
  });

  it('should validate a complete quest flow', () => {
    // Accept quest
    const accept = validateMessage('quest.accept', { quest_id: 'quest_001' });
    expect(accept.success).toBe(true);

    // Complete quest
    const complete = validateMessage('quest.complete', { quest_id: 'quest_001' });
    expect(complete.success).toBe(true);

    // Abandon quest
    const abandon = validateMessage('quest.abandon', { quest_id: 'quest_001' });
    expect(abandon.success).toBe(true);
  });

  it('should validate a complete trade flow', () => {
    // Request trade
    const request = validateMessage('trade.request', { target_id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(request.success).toBe(true);

    // Offer items
    const offer = validateMessage('trade.offer', {
      items: [{ slot: 0, quantity: 1 }],
      gold: 100,
    });
    expect(offer.success).toBe(true);

    // Confirm trade
    const confirm = validateMessage('trade.confirm', {});
    expect(confirm.success).toBe(true);
  });

  it('should validate equipment flow', () => {
    // Equip item
    const equip = validateMessage('equipment.equip', {
      item_slot: 0,
      equip_slot: EquipmentSlot.MAIN_HAND,
    });
    expect(equip.success).toBe(true);

    // Unequip item
    const unequip = validateMessage('equipment.unequip', {
      equip_slot: EquipmentSlot.MAIN_HAND,
    });
    expect(unequip.success).toBe(true);
  });
});

describe('Integration: Game Systems', () => {
  it('should calculate HP correctly for all classes', () => {
    for (const cls of Object.values(ClassType)) {
      const hp = calculateMaxHP(50, 100, cls);
      expect(hp).toBeGreaterThan(0);
      expect(hp).toBeLessThan(100000); // Sanity check
    }
  });

  it('should calculate mana correctly for mana classes', () => {
    const manaClasses = [ClassType.MAGE, ClassType.NECROMANCER, ClassType.CLERIC, ClassType.DRUID, ClassType.PALADIN];
    for (const cls of manaClasses) {
      const mana = calculateMaxMana(50, 100, cls);
      expect(mana).toBeGreaterThan(0);
    }

    // Non-mana classes should return 0
    expect(calculateMaxMana(50, 100, ClassType.WARRIOR)).toBe(0);
    expect(calculateMaxMana(50, 100, ClassType.ROGUE)).toBe(0);
  });

  it('should have consistent stat budgets across classes', () => {
    for (const cls of Object.values(ClassType)) {
      const stats = CLASS_BASE_STATS[cls];
      const total = (stats.strength || 0) + (stats.agility || 0) +
                    (stats.intellect || 0) + (stats.spirit || 0) + (stats.stamina || 0);
      // All classes should have roughly similar total stat points (60-80 at level 1)
      expect(total).toBeGreaterThanOrEqual(50);
      expect(total).toBeLessThanOrEqual(100);
    }
  });
});
