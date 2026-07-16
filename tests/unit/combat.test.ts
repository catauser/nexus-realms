// ============================================================
// Nexus Realms — Combat Calculator Tests
// ============================================================
import { describe, it, expect } from 'vitest';
import {
  calculateDamage,
  calculateHeal,
  calculateThreat,
  calculateArmorReduction,
  calculateResistanceReduction,
  rollHit,
  rollDodge,
  rollParry,
  rollBlock,
  rollCritical,
  rollWeaponDamage,
  calculateDPS,
} from '../../src/server/world/CombatCalculator';
import { DamageType, type EntityStats } from '../../src/shared/types';

/** Create a test stat block */
function makeStats(overrides: Partial<EntityStats> = {}): EntityStats {
  return {
    strength: 50,
    agility: 50,
    intellect: 50,
    spirit: 50,
    stamina: 50,
    armor: 0,
    fire_resist: 0,
    ice_resist: 0,
    lightning_resist: 0,
    holy_resist: 0,
    shadow_resist: 0,
    nature_resist: 0,
    critical_chance: 0,
    critical_damage: 1.5,
    haste: 0,
    dodge: 0,
    block: 0,
    parry: 0,
    hit_chance: 95,
    spell_power: 50,
    attack_power: 50,
    ...overrides,
  };
}

describe('CombatCalculator', () => {
  describe('calculateDamage', () => {
    it('should return a DamageResult', () => {
      const attacker = makeStats({ hit_chance: 100 });
      const target = makeStats();
      const result = calculateDamage(attacker, target, 50, 1.0, DamageType.PHYSICAL);
      expect(result).toBeDefined();
      expect(typeof result.damage).toBe('number');
      expect(typeof result.critical).toBe('boolean');
      expect(result.damageType).toBe(DamageType.PHYSICAL);
    });

    it('should deal at least 1 damage on hit', () => {
      const attacker = makeStats({ hit_chance: 100, critical_chance: 0 });
      const target = makeStats();
      // Run multiple times to catch non-dodge/parry hits
      let gotDamage = false;
      for (let i = 0; i < 50; i++) {
        const result = calculateDamage(attacker, target, 50, 1.0, DamageType.PHYSICAL);
        if (!result.missed && !result.dodged && !result.parried) {
          expect(result.damage).toBeGreaterThanOrEqual(1);
          gotDamage = true;
          break;
        }
      }
      expect(gotDamage).toBe(true);
    });

    it('should reduce damage with armor', () => {
      const attacker = makeStats({ hit_chance: 100, critical_chance: 0 });
      const noArmor = makeStats({ armor: 0, dodge: 0, parry: 0, block: 0 });
      const withArmor = makeStats({ armor: 200, dodge: 0, parry: 0, block: 0 });

      const resultsNoArmor = Array.from({ length: 50 }, () =>
        calculateDamage(attacker, noArmor, 50, 1.0, DamageType.PHYSICAL),
      );
      const resultsWithArmor = Array.from({ length: 50 }, () =>
        calculateDamage(attacker, withArmor, 50, 1.0, DamageType.PHYSICAL),
      );

      const avgNoArmor = resultsNoArmor.filter(r => !r.missed).reduce((s, r) => s + r.damage, 0) / resultsNoArmor.filter(r => !r.missed).length;
      const avgWithArmor = resultsWithArmor.filter(r => !r.missed).reduce((s, r) => s + r.damage, 0) / resultsWithArmor.filter(r => !r.missed).length;

      expect(avgWithArmor).toBeLessThan(avgNoArmor);
    });

    it('should reduce magic damage with resistance', () => {
      const attacker = makeStats({ hit_chance: 100, spell_power: 100, critical_chance: 0 });
      const noResist = makeStats({ fire_resist: 0, dodge: 0, parry: 0 });
      const withResist = makeStats({ fire_resist: 100, dodge: 0, parry: 0 });

      const resultsNoResist = Array.from({ length: 50 }, () =>
        calculateDamage(attacker, noResist, 50, 1.0, DamageType.FIRE),
      );
      const resultsWithResist = Array.from({ length: 50 }, () =>
        calculateDamage(attacker, withResist, 50, 1.0, DamageType.FIRE),
      );

      const avgNoResist = resultsNoResist.filter(r => !r.missed).reduce((s, r) => s + r.damage, 0) / resultsNoResist.filter(r => !r.missed).length;
      const avgWithResist = resultsWithResist.filter(r => !r.missed).reduce((s, r) => s + r.damage, 0) / resultsWithResist.filter(r => !r.missed).length;

      expect(avgWithResist).toBeLessThan(avgNoResist);
    });

    it('should apply critical damage multiplier', () => {
      const attacker = makeStats({ hit_chance: 100, critical_chance: 0 });
      const target = makeStats({ dodge: 0, parry: 0, block: 0 });

      // Get baseline non-crit damage
      const normalResults = Array.from({ length: 50 }, () =>
        calculateDamage(attacker, target, 100, 1.0, DamageType.PHYSICAL),
      );
      const avgNormal = normalResults.reduce((s, r) => s + r.damage, 0) / normalResults.length;

      // Force crits
      const critAttacker = makeStats({ hit_chance: 100, critical_chance: 100, critical_damage: 2.0 });
      const critResults = Array.from({ length: 50 }, () =>
        calculateDamage(critAttacker, target, 100, 1.0, DamageType.PHYSICAL),
      );
      const avgCrit = critResults.reduce((s, r) => s + r.damage, 0) / critResults.length;

      expect(avgCrit).toBeGreaterThan(avgNormal);
    });
  });

  describe('calculateHeal', () => {
    it('should return a HealResult with positive healing', () => {
      const caster = makeStats({ spell_power: 100 });
      const result = calculateHeal(caster, 50, 1.0);
      expect(result.amount).toBeGreaterThan(0);
      expect(typeof result.critical).toBe('boolean');
    });

    it('should increase with spell power', () => {
      const low = makeStats({ spell_power: 50, critical_chance: 0 });
      const high = makeStats({ spell_power: 200, critical_chance: 0 });

      // Pass targetMaxHp > heal amount so effectiveHeal is not clamped
      const resultsLow = Array.from({ length: 30 }, () => calculateHeal(low, 100, 1.0, 1.0, 0, 10000));
      const resultsHigh = Array.from({ length: 30 }, () => calculateHeal(high, 100, 1.0, 1.0, 0, 10000));

      const avgLow = resultsLow.reduce((s, r) => s + r.amount, 0) / resultsLow.length;
      const avgHigh = resultsHigh.reduce((s, r) => s + r.amount, 0) / resultsHigh.length;

      expect(avgHigh).toBeGreaterThan(avgLow);
    });
  });

  describe('calculateArmorReduction', () => {
    it('should return between 0 and 0.75', () => {
      const reduction = calculateArmorReduction(100);
      expect(reduction).toBeGreaterThanOrEqual(0);
      expect(reduction).toBeLessThanOrEqual(0.75);
    });

    it('should increase with armor', () => {
      const low = calculateArmorReduction(50);
      const high = calculateArmorReduction(200);
      expect(high).toBeGreaterThan(low);
    });

    it('should return 0 for 0 armor', () => {
      expect(calculateArmorReduction(0)).toBe(0);
    });

    it('should cap at 0.75 (75%)', () => {
      const reduction = calculateArmorReduction(100000);
      expect(reduction).toBeLessThanOrEqual(0.75);
    });
  });

  describe('calculateResistanceReduction', () => {
    it('should return between 0 and 0.75', () => {
      const reduction = calculateResistanceReduction(100);
      expect(reduction).toBeGreaterThanOrEqual(0);
      expect(reduction).toBeLessThanOrEqual(0.75);
    });

    it('should increase with resistance', () => {
      const low = calculateResistanceReduction(50);
      const high = calculateResistanceReduction(200);
      expect(high).toBeGreaterThan(low);
    });
  });

  describe('calculateThreat', () => {
    it('should return a ThreatResult', () => {
      const result = calculateThreat(100, 0, 1.0, false);
      expect(typeof result.threat).toBe('number');
      expect(typeof result.isTaunt).toBe('boolean');
      expect(result.threat).toBeGreaterThan(0);
    });

    it('should apply threat multiplier', () => {
      const low = calculateThreat(100, 0, 1.0, false);
      const high = calculateThreat(100, 0, 3.0, false);
      expect(high.threat).toBeGreaterThan(low.threat);
    });

    it('should handle taunt', () => {
      const result = calculateThreat(100, 0, 1.0, true);
      expect(result.isTaunt).toBe(true);
    });

    it('should generate threat from healing', () => {
      const dmgOnly = calculateThreat(100, 0, 1.0, false);
      const withHeal = calculateThreat(100, 50, 1.0, false);
      expect(withHeal.threat).toBeGreaterThan(dmgOnly.threat);
    });
  });

  describe('Roll functions', () => {
    it('rollHit should return boolean', () => {
      expect(typeof rollHit(95)).toBe('boolean');
    });

    it('rollHit with high hit chance should usually hit', () => {
      let hits = 0;
      for (let i = 0; i < 1000; i++) {
        if (rollHit(100)) hits++;
      }
      expect(hits).toBeGreaterThan(900); // Should be ~95% (base miss 5%)
    });

    it('rollDodge should return boolean', () => {
      expect(typeof rollDodge(10)).toBe('boolean');
    });

    it('rollParry should return boolean', () => {
      expect(typeof rollParry(10)).toBe('boolean');
    });

    it('rollBlock should return object', () => {
      const result = rollBlock(20);
      expect(typeof result.blocked).toBe('boolean');
      expect(typeof result.blockPercent).toBe('number');
    });

    it('rollCritical should return boolean', () => {
      expect(typeof rollCritical(15)).toBe('boolean');
    });

    it('rollCritical with 100% should always crit', () => {
      for (let i = 0; i < 100; i++) {
        expect(rollCritical(100)).toBe(true);
      }
    });

    it('rollCritical with 0% should never crit', () => {
      for (let i = 0; i < 100; i++) {
        expect(rollCritical(0)).toBe(false);
      }
    });
  });

  describe('rollWeaponDamage', () => {
    it('should return damage within weapon range', () => {
      for (let i = 0; i < 100; i++) {
        const damage = rollWeaponDamage(10, 50);
        expect(damage).toBeGreaterThanOrEqual(10);
        expect(damage).toBeLessThanOrEqual(50);
      }
    });

    it('should return min when min equals max', () => {
      expect(rollWeaponDamage(5, 5)).toBe(5);
    });
  });

  describe('calculateDPS', () => {
    it('should calculate DPS correctly', () => {
      // (10 + 50) / 2 / (2000 / 1000) = 30 / 2 = 15
      const dps = calculateDPS(10, 50, 2000);
      expect(dps).toBe(15);
    });

    it('should increase with higher damage', () => {
      const low = calculateDPS(10, 20, 2000);
      const high = calculateDPS(50, 100, 2000);
      expect(high).toBeGreaterThan(low);
    });

    it('should increase with faster attack speed', () => {
      const slow = calculateDPS(10, 50, 3000);
      const fast = calculateDPS(10, 50, 1000);
      expect(fast).toBeGreaterThan(slow);
    });
  });
});
