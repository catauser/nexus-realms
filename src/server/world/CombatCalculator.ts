// ============================================================
// Nexus Realms — Combat Calculator
// Pure functions for all combat math: damage, healing, hit/dodge
// parry/block/crit, resistances, and threat calculations.
// ============================================================

import { DamageType, type EntityStats } from '../../shared/types';

// ─── Constants ───────────────────────────────────────────────

/** Armor reduction formula denominator constant */
const ARMOR_CONSTANT = 100;

/** Resistance reduction formula denominator constant */
const RESIST_CONSTANT = 100;

/** Base global damage modifier */
const GLOBAL_DAMAGE_MODIFIER = 1.0;

/** Minimum damage is always at least 1 */
const MIN_DAMAGE = 1;

/** Maximum hit chance (can't exceed 100%) */
const MAX_HIT_CHANCE = 100;

/** Base miss chance before hit rating */
const BASE_MISS_CHANCE = 5;

/** Dodge/parry/block diminishing returns constant */
const DR_CONSTANT = 0.01;

// ─── Roll Results ────────────────────────────────────────────

export interface DamageResult {
  /** Final damage amount */
  damage: number;
  /** Whether the hit was a critical strike */
  critical: boolean;
  /** Amount of damage blocked by shield/block */
  blocked: number;
  /** Whether the attack was dodged */
  dodged: boolean;
  /** Whether the attack was parried */
  parried: boolean;
  /** Whether the attack missed entirely */
  missed: boolean;
  /** The type of damage dealt */
  damageType: DamageType;
  /** Overkill damage (excess beyond 0 HP) */
  overkill: number;
}

export interface HealResult {
  /** Final heal amount */
  amount: number;
  /** Whether the heal was a critical */
  critical: boolean;
  /** Overheal amount (excess beyond max HP) */
  overheal: number;
}

export interface ThreatResult {
  /** Final threat value */
  threat: number;
  /** Whether this is a taunt (forced aggro) */
  isTaunt: boolean;
}

// ─── Hit/Dodge/Parry/Block Rolls ────────────────────────────

/**
 * Roll for hit chance. Returns true if the attack hits.
 * @param attackerHitChance - Attacker's hit_chance stat (0-100)
 * @param targetDodge - Target's dodge stat (0-100)
 * @param targetParry - Target's parry stat (0-100)
 */
export function rollHit(attackerHitChance: number): boolean {
  const missChance = Math.max(0, BASE_MISS_CHANCE - (attackerHitChance * 0.1));
  return Math.random() * 100 >= missChance;
}

/**
 * Roll for dodge. Returns true if the attack is dodged.
 * Uses diminishing returns formula.
 */
export function rollDodge(targetDodge: number): boolean {
  const effectiveDodge = applyDiminishingReturns(targetDodge);
  return Math.random() * 100 < effectiveDodge;
}

/**
 * Roll for parry. Returns true if the attack is parried.
 * Uses diminishing returns formula.
 */
export function rollParry(targetParry: number): boolean {
  const effectiveParry = applyDiminishingReturns(targetParry);
  return Math.random() * 100 < effectiveParry;
}

/**
 * Roll for block. Returns true if the attack is blocked.
 * Returns the block percentage (0-1) for damage reduction.
 */
export function rollBlock(targetBlock: number): { blocked: boolean; blockPercent: number } {
  const effectiveBlock = applyDiminishingReturns(targetBlock);
  const blocked = Math.random() * 100 < effectiveBlock;
  // Block absorbs 30-50% of damage
  const blockPercent = blocked ? 0.3 + Math.random() * 0.2 : 0;
  return { blocked, blockPercent };
}

/**
 * Roll for critical strike.
 * @returns true if the attack critically strikes
 */
export function rollCritical(critChance: number): boolean {
  return Math.random() * 100 < critChance;
}

/**
 * Apply diminishing returns to a stat (dodge, parry, block).
 * Prevents these stats from ever reaching 100%.
 */
function applyDiminishingReturns(stat: number): number {
  return (stat / (stat + (1 / DR_CONSTANT))) * 100;
}

// ─── Armor & Resistance ─────────────────────────────────────

/**
 * Calculate armor damage reduction percentage.
 * Formula: armor / (armor + ARMOR_CONSTANT)
 * Caps at 75% reduction.
 */
export function calculateArmorReduction(armor: number): number {
  if (armor <= 0) return 0;
  return Math.min(0.75, armor / (armor + ARMOR_CONSTANT));
}

/**
 * Calculate magic resistance reduction percentage.
 * Formula: resist / (resist + RESIST_CONSTANT)
 * Caps at 75% reduction.
 */
export function calculateResistanceReduction(resistValue: number): number {
  if (resistValue <= 0) return 0;
  return Math.min(0.75, resistValue / (resistValue + RESIST_CONSTANT));
}

/**
 * Get the resistance value for a specific damage type from stats.
 */
export function getResistanceForDamageType(stats: EntityStats, damageType: DamageType): number {
  switch (damageType) {
    case DamageType.FIRE: return stats.fire_resist;
    case DamageType.ICE: return stats.ice_resist;
    case DamageType.LIGHTNING: return stats.lightning_resist;
    case DamageType.HOLY: return stats.holy_resist;
    case DamageType.SHADOW: return stats.shadow_resist;
    case DamageType.NATURE: return stats.nature_resist;
    case DamageType.ARCANE: return 0; // No arcane resist stat
    case DamageType.PHYSICAL: return 0; // Uses armor instead
    default: return 0;
  }
}

// ─── Damage Pipeline ────────────────────────────────────────

/**
 * Full damage calculation pipeline.
 *
 * Steps:
 * 1. Roll hit → miss?
 * 2. Roll dodge → dodged?
 * 3. Roll parry → parried?
 * 4. Roll block → reduced damage?
 * 5. Calculate base damage
 * 6. Apply armor (physical) or resistance (magic) reduction
 * 7. Roll critical → multiply by crit_damage
 * 8. Apply buff/debuff modifiers
 * 9. Floor and clamp to minimum 1
 *
 * @param attackerStats - Attacker's full stats
 * @param targetStats - Target's full stats
 * @param baseDamage - Base ability damage (before scaling)
 * @param scalingFactor - Ability scaling factor (e.g. 1.0 = 100% of attack/spell power)
 * @param damageType - Physical or magical damage type
 * @param attackPowerBonus - Additional attack/spell power to add
 * @param damageMultiplier - External damage multiplier (from buffs, etc.)
 */
export function calculateDamage(
  attackerStats: EntityStats,
  targetStats: EntityStats,
  baseDamage: number,
  scalingFactor: number,
  damageType: DamageType,
  attackPowerBonus: number = 0,
  damageMultiplier: number = 1.0
): DamageResult {
  const result: DamageResult = {
    damage: 0,
    critical: false,
    blocked: 0,
    dodged: false,
    parried: false,
    missed: false,
    damageType,
    overkill: 0,
  };

  // Step 1: Hit roll
  if (!rollHit(attackerStats.hit_chance)) {
    result.missed = true;
    return result;
  }

  // Step 2: Dodge roll
  if (rollDodge(targetStats.dodge)) {
    result.dodged = true;
    return result;
  }

  // Step 3: Parry roll
  if (rollParry(targetStats.parry)) {
    result.parried = true;
    return result;
  }

  // Step 4: Block roll
  const blockResult = rollBlock(targetStats.block);

  // Step 5: Calculate base damage
  const powerStat = damageType === DamageType.PHYSICAL
    ? attackerStats.attack_power
    : attackerStats.spell_power;
  let damage = (baseDamage + (powerStat + attackPowerBonus) * scalingFactor) * GLOBAL_DAMAGE_MODIFIER;

  // Step 6: Apply armor/resistance reduction
  if (damageType === DamageType.PHYSICAL) {
    const armorReduction = calculateArmorReduction(targetStats.armor);
    damage *= (1 - armorReduction);
  } else {
    const resistValue = getResistanceForDamageType(targetStats, damageType);
    const resistReduction = calculateResistanceReduction(resistValue);
    damage *= (1 - resistReduction);
  }

  // Step 7: Apply block reduction
  if (blockResult.blocked) {
    const blockedAmount = Math.floor(damage * blockResult.blockPercent);
    result.blocked = blockedAmount;
    damage -= blockedAmount;
  }

  // Step 8: Critical strike
  if (rollCritical(attackerStats.critical_chance)) {
    result.critical = true;
    damage *= attackerStats.critical_damage;
  }

  // Step 9: Apply external multiplier (buffs, debuffs)
  damage *= damageMultiplier;

  // Floor and clamp
  result.damage = Math.max(MIN_DAMAGE, Math.floor(damage));

  return result;
}

// ─── Healing ─────────────────────────────────────────────────

/**
 * Full healing calculation.
 *
 * @param casterStats - Caster's stats
 * @param baseHeal - Base heal amount from the ability
 * @param scalingFactor - Spell power scaling factor
 * @param healMultiplier - External heal multiplier (buffs, etc.)
 * @param targetCurrentHp - Target's current HP (for overheal calc)
 * @param targetMaxHp - Target's max HP (for overheal calc)
 */
export function calculateHeal(
  casterStats: EntityStats,
  baseHeal: number,
  scalingFactor: number,
  healMultiplier: number = 1.0,
  targetCurrentHp: number = 0,
  targetMaxHp: number = 0
): HealResult {
  // Base heal + spell power scaling
  let healAmount = (baseHeal + casterStats.spell_power * scalingFactor) * healMultiplier;

  // Critical heal
  const critical = rollCritical(casterStats.critical_chance);
  if (critical) {
    healAmount *= casterStats.critical_damage;
  }

  healAmount = Math.floor(healAmount);

  // Overheal calculation
  const effectiveHeal = Math.min(healAmount, targetMaxHp - targetCurrentHp);
  const overheal = healAmount - effectiveHeal;

  return {
    amount: Math.max(1, effectiveHeal),
    critical,
    overheal,
  };
}

// ─── Threat ──────────────────────────────────────────────────

/**
 * Calculate threat generated by an action.
 *
 * @param damage - Damage dealt (0 if healing)
 * @param healing - Healing done (0 if damage)
 * @param threatMultiplier - Ability-specific threat multiplier
 * @param isTaunt - Whether this is a taunt effect
 */
export function calculateThreat(
  damage: number,
  healing: number,
  threatMultiplier: number = 1.0,
  isTaunt: boolean = false
): ThreatResult {
  // Healing generates 50% of the threat that equivalent damage would
  const rawThreat = damage + (healing * 0.5);
  const threat = Math.floor(rawThreat * threatMultiplier);

  return {
    threat: isTaunt ? Infinity : threat,
    isTaunt,
  };
}

/**
 * Update the threat table with new threat for an entity.
 * @param threatTable - Current threat table (entityId → threat)
 * @param entityId - Entity that generated threat
 * @param threat - Amount of threat to add
 * @returns Updated threat table
 */
export function updateThreatTable(
  threatTable: Map<string, number>,
  entityId: string,
  threat: number
): Map<string, number> {
  const current = threatTable.get(entityId) ?? 0;
  threatTable.set(entityId, current + threat);
  return threatTable;
}

/**
 * Get the entity with the highest threat from a threat table.
 * @returns The entity ID with the highest threat, or null if empty
 */
export function getHighestThreat(threatTable: Map<string, number>): string | null {
  let maxThreat = -1;
  let maxId: string | null = null;

  for (const [id, threat] of threatTable) {
    if (threat > maxThreat) {
      maxThreat = threat;
      maxId = id;
    }
  }

  return maxId;
}

// ─── Auto Attack ─────────────────────────────────────────────

/**
 * Calculate auto-attack damage range from weapon stats.
 * @param weaponMin - Minimum weapon damage
 * @param weaponMax - Maximum weapon damage
 * @param attackSpeed - Attack speed in milliseconds
 * @returns Random weapon damage within range
 */
export function rollWeaponDamage(weaponMin: number, weaponMax: number): number {
  return weaponMin + Math.floor(Math.random() * (weaponMax - weaponMin + 1));
}

/**
 * Calculate DPS from weapon stats.
 */
export function calculateDPS(weaponMin: number, weaponMax: number, attackSpeedMs: number): number {
  const avgDamage = (weaponMin + weaponMax) / 2;
  return (avgDamage / attackSpeedMs) * 1000;
}

// ─── Stat Calculations ──────────────────────────────────────

/**
 * Recalculate derived stats from base stats + equipment + buffs.
 * This is the canonical stat calculation used server-side.
 */
export function recalculateStats(
  baseStats: EntityStats,
  equipmentBonuses: Partial<EntityStats>,
  buffBonuses: Partial<EntityStats>,
  buffMultipliers: Partial<Record<keyof EntityStats, number>>
): EntityStats {
  const result: EntityStats = { ...baseStats };

  // Add equipment bonuses (flat)
  for (const [key, value] of Object.entries(equipmentBonuses)) {
    if (value && key in result) {
      (result as any)[key] += value;
    }
  }

  // Add buff bonuses (flat)
  for (const [key, value] of Object.entries(buffBonuses)) {
    if (value && key in result) {
      (result as any)[key] += value;
    }
  }

  // Apply buff multipliers (percentage)
  for (const [key, mult] of Object.entries(buffMultipliers)) {
    if (mult && key in result) {
      (result as any)[key] = Math.floor((result as any)[key] * (1 + mult));
    }
  }

  // Clamp percentage-based stats
  result.critical_chance = Math.min(100, Math.max(0, result.critical_chance));
  result.dodge = Math.min(75, Math.max(0, result.dodge));
  result.parry = Math.min(75, Math.max(0, result.parry));
  result.block = Math.min(75, Math.max(0, result.block));
  result.hit_chance = Math.min(MAX_HIT_CHANCE, Math.max(0, result.hit_chance));
  result.haste = Math.min(100, Math.max(0, result.haste));

  return result;
}
