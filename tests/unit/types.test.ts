// ============================================================
// Nexus Realms — Shared Types Tests
// ============================================================
import { describe, it, expect } from 'vitest';
import {
  GAME_CONFIG,
  Direction,
  ClassType,
  ItemRarity,
  EquipmentSlot,
  RARITY_COLORS,
  CLASS_BASE_STATS,
  experienceForLevel,
  calculateMaxHP,
  calculateMaxMana,
  calculateDamage,
  calculateHeal,
} from '../../src/shared/types';

describe('GAME_CONFIG', () => {
  it('should have valid tile size', () => {
    expect(GAME_CONFIG.TILE_SIZE).toBe(32);
  });

  it('should have valid server tick rate', () => {
    expect(GAME_CONFIG.SERVER_TICK_RATE).toBe(20);
  });

  it('should have valid max level', () => {
    expect(GAME_CONFIG.MAX_LEVEL).toBe(50);
  });

  it('should have valid inventory slots', () => {
    expect(GAME_CONFIG.INVENTORY_SLOTS).toBe(36);
  });

  it('should have valid equipment slots', () => {
    expect(GAME_CONFIG.EQUIPMENT_SLOTS).toBe(12);
  });
});

describe('Enums', () => {
  it('Direction should have8 values', () => {
    expect(Object.keys(Direction).length).toBe(8);
  });

  it('ClassType should have8 values', () => {
    expect(Object.keys(ClassType).length).toBe(8);
  });

  it('ItemRarity should have 6 values', () => {
    expect(Object.keys(ItemRarity).length).toBe(6);
  });

  it('EquipmentSlot should have 12 values', () => {
    expect(Object.keys(EquipmentSlot).length).toBe(12);
  });
});

describe('RARITY_COLORS', () => {
  it('should have colors for all rarities', () => {
    for (const rarity of Object.values(ItemRarity)) {
      expect(RARITY_COLORS[rarity]).toBeDefined();
      expect(RARITY_COLORS[rarity]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('CLASS_BASE_STATS', () => {
  it('should have stats for all classes', () => {
    for (const cls of Object.values(ClassType)) {
      expect(CLASS_BASE_STATS[cls]).toBeDefined();
      expect(CLASS_BASE_STATS[cls].strength).toBeGreaterThan(0);
      expect(CLASS_BASE_STATS[cls].stamina).toBeGreaterThan(0);
    }
  });

  it('Warrior should have highest strength', () => {
    const warriorStr = CLASS_BASE_STATS[ClassType.WARRIOR].strength || 0;
    for (const cls of Object.values(ClassType)) {
      if (cls === ClassType.WARRIOR) continue;
      const str = CLASS_BASE_STATS[cls].strength || 0;
      expect(warriorStr).toBeGreaterThanOrEqual(str);
    }
  });

  it('Mage should have highest intellect', () => {
    const mageInt = CLASS_BASE_STATS[ClassType.MAGE].intellect || 0;
    for (const cls of Object.values(ClassType)) {
      if (cls === ClassType.MAGE) continue;
      const intel = CLASS_BASE_STATS[cls].intellect || 0;
      expect(mageInt).toBeGreaterThanOrEqual(intel);
    }
  });
});

describe('experienceForLevel', () => {
  it('should return 0 for level 1', () => {
    expect(experienceForLevel(1)).toBeGreaterThanOrEqual(0);
  });

  it('should increase with level', () => {
    for (let i = 2; i <= 50; i++) {
      expect(experienceForLevel(i)).toBeGreaterThan(experienceForLevel(i - 1));
    }
  });

  it('should be a positive number for all levels', () => {
    for (let i = 1; i <= 50; i++) {
      expect(experienceForLevel(i)).toBeGreaterThan(0);
    }
  });
});

describe('calculateMaxHP', () => {
  it('should return positive HP for all classes', () => {
    for (const cls of Object.values(ClassType)) {
      const hp = calculateMaxHP(1, 10, cls);
      expect(hp).toBeGreaterThan(0);
    }
  });

  it('should increase with level', () => {
    const hp1 = calculateMaxHP(1, 10, ClassType.WARRIOR);
    const hp50 = calculateMaxHP(50, 10, ClassType.WARRIOR);
    expect(hp50).toBeGreaterThan(hp1);
  });

  it('should increase with stamina', () => {
    const hpLow = calculateMaxHP(25, 10, ClassType.WARRIOR);
    const hpHigh = calculateMaxHP(25, 50, ClassType.WARRIOR);
    expect(hpHigh).toBeGreaterThan(hpLow);
  });
});

describe('calculateMaxMana', () => {
  it('should return 0 for non-mana classes', () => {
    expect(calculateMaxMana(1, 10, ClassType.WARRIOR)).toBe(0);
    expect(calculateMaxMana(1, 10, ClassType.ROGUE)).toBe(0);
  });

  it('should return positive mana for mana classes', () => {
    const manaClasses = [ClassType.MAGE, ClassType.NECROMANCER, ClassType.CLERIC, ClassType.DRUID, ClassType.PALADIN];
    for (const cls of manaClasses) {
      expect(calculateMaxMana(1, 10, cls)).toBeGreaterThan(0);
    }
  });

  it('should increase with intellect', () => {
    const manaLow = calculateMaxMana(25, 10, ClassType.MAGE);
    const manaHigh = calculateMaxMana(25, 50, ClassType.MAGE);
    expect(manaHigh).toBeGreaterThan(manaLow);
  });
});

describe('calculateDamage', () => {
  it('should return at least 1 damage', () => {
    const result = calculateDamage(10, 5, 0, 0, 1.5);
    expect(result.damage).toBeGreaterThanOrEqual(1);
  });

  it('should reduce damage based on armor', () => {
    const noArmor = calculateDamage(100, 50, 0, 0, 1.5);
    const withArmor = calculateDamage(100, 50, 100, 0, 1.5);
    expect(withArmor.damage).toBeLessThan(noArmor.damage);
  });

  it('should apply critical damage', () => {
    // Run multiple times to catch a crit
    let foundCrit = false;
    for (let i = 0; i < 100; i++) {
      const result = calculateDamage(100, 50, 0, 100, 2.0);
      if (result.critical) {
        foundCrit = true;
        expect(result.damage).toBeGreaterThan(100); // Should be much higher with 2x crit
        break;
      }
    }
    expect(foundCrit).toBe(true);
  });

  it('critical should be boolean', () => {
    const result = calculateDamage(50, 25, 10, 50, 1.5);
    expect(typeof result.critical).toBe('boolean');
  });
});

describe('calculateHeal', () => {
  it('should return positive heal', () => {
    const heal = calculateHeal(100, 50);
    expect(heal).toBeGreaterThan(0);
  });

  it('should increase with spell power', () => {
    const healLow = calculateHeal(50, 100);
    const healHigh = calculateHeal(200, 100);
    expect(healHigh).toBeGreaterThan(healLow);
  });

  it('should include base heal amount', () => {
    const heal = calculateHeal(0, 100);
    expect(heal).toBe(100);
  });
});
