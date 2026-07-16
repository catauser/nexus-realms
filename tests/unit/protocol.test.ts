// ============================================================
// Nexus Realms — Protocol Validation Tests
// ============================================================
import { describe, it, expect } from 'vitest';
import { validateMessage, createMessage, CLIENT_MESSAGE_SCHEMAS } from '../../src/shared/protocol';
import { Direction, ChatChannel, EquipmentSlot } from '../../src/shared/types';

describe('CLIENT_MESSAGE_SCHEMAS', () => {
  it('should have schemas for all client message types', () => {
    const expectedTypes = [
      'auth.login', 'auth.token',
      'player.move', 'player.attack', 'player.use_ability',
      'player.interact', 'player.loot',
      'inventory.move', 'inventory.use_item',
      'equipment.equip', 'equipment.unequip',
      'chat.send',
      'quest.accept', 'quest.complete', 'quest.abandon',
      'trade.request', 'trade.offer', 'trade.confirm', 'trade.cancel',
      'guild.create', 'guild.invite', 'guild.accept_invite', 'guild.leave',
      'auction.list', 'auction.buy', 'auction.search',
      'crafting.craft', 'gathering.gather', 'pvp.queue',
    ];

    for (const type of expectedTypes) {
      expect(CLIENT_MESSAGE_SCHEMAS[type]).toBeDefined();
    }
  });
});

describe('validateMessage', () => {
  it('should reject unknown message types', () => {
    const result = validateMessage('unknown.type', {});
    expect(result.success).toBe(false);
  });

  it('should validate auth.login', () => {
    const result = validateMessage('auth.login', {
      username: 'testuser',
      password_hash: 'abc123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject auth.login with short username', () => {
    const result = validateMessage('auth.login', {
      username: 'ab',
      password_hash: 'abc123',
    });
    expect(result.success).toBe(false);
  });

  it('should validate player.move', () => {
    const result = validateMessage('player.move', {
      x: 100,
      y: 200,
      direction: Direction.DOWN,
    });
    expect(result.success).toBe(true);
  });

  it('should reject player.move with negative coords', () => {
    const result = validateMessage('player.move', {
      x: -1,
      y: 200,
      direction: Direction.DOWN,
    });
    expect(result.success).toBe(false);
  });

  it('should validate chat.send', () => {
    const result = validateMessage('chat.send', {
      channel: ChatChannel.SAY,
      message: 'Hello world!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject chat.send with empty message', () => {
    const result = validateMessage('chat.send', {
      channel: ChatChannel.SAY,
      message: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject chat.send with message too long', () => {
    const result = validateMessage('chat.send', {
      channel: ChatChannel.SAY,
      message: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('should validate inventory.move', () => {
    const result = validateMessage('inventory.move', {
      from_slot: 0,
      to_slot: 5,
    });
    expect(result.success).toBe(true);
  });

  it('should reject inventory.move with out-of-range slot', () => {
    const result = validateMessage('inventory.move', {
      from_slot: -1,
      to_slot: 5,
    });
    expect(result.success).toBe(false);
  });

  it('should validate equipment.equip', () => {
    const result = validateMessage('equipment.equip', {
      item_slot: 0,
      equip_slot: EquipmentSlot.MAIN_HAND,
    });
    expect(result.success).toBe(true);
  });

  it('should validate quest.accept', () => {
    const result = validateMessage('quest.accept', {
      quest_id: 'quest_001',
    });
    expect(result.success).toBe(true);
  });

  it('should validate guild.create', () => {
    const result = validateMessage('guild.create', {
      name: 'Test Guild',
    });
    expect(result.success).toBe(true);
  });

  it('should reject guild.create with too short name', () => {
    const result = validateMessage('guild.create', {
      name: 'AB',
    });
    expect(result.success).toBe(false);
  });

  it('should validate auction.list', () => {
    const result = validateMessage('auction.list', {
      item_slot: 0,
      price: 100,
      duration_hours: 24,
    });
    expect(result.success).toBe(true);
  });

  it('should reject auction.list with invalid duration', () => {
    const result = validateMessage('auction.list', {
      item_slot: 0,
      price: 100,
      duration_hours: 13,
    });
    expect(result.success).toBe(false);
  });
});

describe('createMessage', () => {
  it('should create valid JSON', () => {
    const msg = createMessage('test.type', { foo: 'bar' });
    const parsed = JSON.parse(msg);
    expect(parsed.type).toBe('test.type');
    expect(parsed.data.foo).toBe('bar');
    expect(parsed.timestamp).toBeGreaterThan(0);
  });

  it('should include timestamp', () => {
    const before = Date.now();
    const msg = createMessage('test', {});
    const parsed = JSON.parse(msg);
    expect(parsed.timestamp).toBeGreaterThanOrEqual(before);
  });
});
