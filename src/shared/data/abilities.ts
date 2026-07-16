// ============================================================
// Nexus Realms — Ability Definitions (80+ abilities, 10 per class)
// ============================================================

import {
  AbilityType,
  DamageType,
  TargetType,
  ClassType,
  Specialization,
} from '../types';

// ─── Ability Interface ───────────────────────────────────────
export interface AbilityDefinition {
  id: string;
  name: string;
  description: string;
  class_type: ClassType;
  specialization: Specialization | null;
  type: AbilityType;
  damage_type: DamageType;
  target_type: TargetType;
  damage_formula: string;
  heal_formula: string | null;
  cooldown: number;
  resource_cost: { type: string; amount: number };
  range: number;
  cast_time: number;
  level_requirement: number;
  icon_id: string;
  effects: string[];
  is_passive: boolean;
  rank: number;
}

// ─── Helper ──────────────────────────────────────────────────
function ability(
  id: string, name: string, desc: string,
  cls: ClassType, spec: Specialization | null,
  type: AbilityType, dmgType: DamageType, tgtType: TargetType,
  dmgFormula: string, healFormula: string | null,
  cd: number, costType: string, costAmt: number,
  range: number, castTime: number, lvl: number,
  icon: string, effects: string[] = [], passive = false, rank = 1,
): AbilityDefinition {
  return {
    id, name, description: desc, class_type: cls, specialization: spec,
    type, damage_type: dmgType, target_type: tgtType,
    damage_formula: dmgFormula, heal_formula: healFormula,
    cooldown: cd, resource_cost: { type: costType, amount: costAmt },
    range, cast_time: castTime, level_requirement: lvl,
    icon_id: icon, effects, is_passive: passive, rank,
  };
}

export const ABILITIES: Record<string, AbilityDefinition> = {

  // ════════════════════════════════════════════════════════════
  // WARRIOR (Gladiator spec)
  // ════════════════════════════════════════════════════════════

  ability_warrior_slash: ability(
    'ability_warrior_slash', 'Slash', 'A swift sword strike.',
    ClassType.WARRIOR, Specialization.GLADIATOR,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 1.2 + 15', null, 0, 'rage', 0, 2, 0, 1,
    'icon_warrior_slash', [], false, 1,
  ),
  ability_warrior_rend: ability(
    'ability_warrior_rend', 'Rend', 'Wound the target, causing bleeding over 8 seconds.',
    ClassType.WARRIOR, Specialization.GLADIATOR,
    AbilityType.DOT, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 0.3 per tick (4 ticks)', null, 6, 'rage', 10, 2, 0, 3,
    'icon_warrior_rend', ['Bleed: physical damage over 8s'], false, 1,
  ),
  ability_warrior_whirlwind: ability(
    'ability_warrior_whirlwind', 'Whirlwind', 'Strike all enemies within range.',
    ClassType.WARRIOR, Specialization.GLADIATOR,
    AbilityType.AOE, DamageType.PHYSICAL, TargetType.AOE_SELF,
    'attack_power * 0.9', null, 8, 'rage', 25, 5, 0, 5,
    'icon_warrior_whirlwind', [], false, 1,
  ),
  ability_warrior_execute: ability(
    'ability_warrior_execute', 'Execute', 'Devastating blow on targets below 20% HP.',
    ClassType.WARRIOR, Specialization.GLADIATOR,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 3.5', null, 6, 'rage', 30, 2, 0, 8,
    'icon_warrior_execute', ['Only usable below 20% target HP'], false, 1,
  ),
  ability_warrior_overpower: ability(
    'ability_warrior_overpower', 'Overpower', 'A quick counter-attack after dodging.',
    ClassType.WARRIOR, Specialization.GLADIATOR,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 2.0', null, 5, 'rage', 5, 2, 0, 6,
    'icon_warrior_overpower', ['Usable after dodge'], false, 1,
  ),
  ability_warrior_mortal_strike: ability(
    'ability_warrior_mortal_strike', 'Mortal Strike', 'A deep wound that reduces healing received.',
    ClassType.WARRIOR, Specialization.GLADIATOR,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 2.5', null, 8, 'rage', 30, 2, 0, 10,
    'icon_warrior_mortal_strike', ['-50% healing received for 10s'], false, 1,
  ),
  ability_warrior_charge: ability(
    'ability_warrior_charge', 'Charge', 'Rush to a target, stunning them briefly.',
    ClassType.WARRIOR, null,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 0.5', null, 15, 'rage', 0, 25, 0, 3,
    'icon_warrior_charge', ['Stun for 1.5s', 'Generates 15 Rage'], false, 1,
  ),
  ability_warrior_shattering_throw: ability(
    'ability_warrior_shattering_throw', 'Shattering Throw', 'Remove shield effects and deal damage at range.',
    ClassType.WARRIOR, Specialization.GLADIATOR,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 1.8', null, 30, 'rage', 25, 15, 0.5, 12,
    'icon_warrior_shatter', ['Removes shield effects'], false, 1,
  ),
  ability_warrior_bladestorm: ability(
    'ability_warrior_bladestorm', 'Bladestorm', 'Spin for 6 seconds, hitting all nearby enemies every second.',
    ClassType.WARRIOR, Specialization.GLADIATOR,
    AbilityType.CHANNEL, DamageType.PHYSICAL, TargetType.AOE_SELF,
    'attack_power * 1.0 per hit', null, 60, 'rage', 50, 5, 0, 15,
    'icon_warrior_bladestorm', ['Immune to CC while spinning', '6 hits over 6s'], false, 1,
  ),
  ability_warrior_recklessness: ability(
    'ability_warrior_recklessness', 'Recklessness', '+30% critical strike chance, +20% damage taken for 12 seconds.',
    ClassType.WARRIOR, Specialization.GLADIATOR,
    AbilityType.BUFF, DamageType.PHYSICAL, TargetType.SELF,
    '0', null, 90, 'rage', 0, 0, 0, 14,
    'icon_warrior_reckless', ['+30% crit, +20% damage taken for 12s'], false, 1,
  ),
  ability_warrior_avatar: ability(
    'ability_warrior_avatar', 'Avatar', 'Transform into a mighty avatar, increasing damage and breaking roots.',
    ClassType.WARRIOR, null,
    AbilityType.BUFF, DamageType.PHYSICAL, TargetType.SELF,
    '0', null, 180, 'rage', 0, 0, 0, 20,
    'icon_warrior_avatar', ['+20% damage for 20s', 'Immune to roots'], false, 1,
  ),

  // ════════════════════════════════════════════════════════════
  // PALADIN (Crusader spec)
  // ════════════════════════════════════════════════════════════

  ability_paladin_crusader_strike: ability(
    'ability_paladin_crusader_strike', 'Crusader Strike', 'A holy-infused melee strike that generates Holy Power.',
    ClassType.PALADIN, Specialization.CRUSADER,
    AbilityType.DAMAGE, DamageType.HOLY, TargetType.SINGLE_ENEMY,
    'spell_power * 1.0 + attack_power * 0.8', null, 4.5, 'mana', 0, 2, 0, 1,
    'icon_paladin_crusader_strike', ['Generates 1 Holy Power'], false, 1,
  ),
  ability_paladin_judgment: ability(
    'ability_paladin_judgment', 'Judgment', 'Hurl a bolt of holy energy at the target.',
    ClassType.PALADIN, Specialization.CRUSADER,
    AbilityType.DAMAGE, DamageType.HOLY, TargetType.SINGLE_ENEMY,
    'spell_power * 1.5', null, 8, 'mana', 0, 20, 0, 3,
    'icon_paladin_judgment', ['Generates 1 Holy Power'], false, 1,
  ),
  ability_paladin_templars_verdict: ability(
    'ability_paladin_templars_verdict', 'Templar\'s Verdict', 'A massive holy strike empowered by Holy Power.',
    ClassType.PALADIN, Specialization.CRUSADER,
    AbilityType.DAMAGE, DamageType.HOLY, TargetType.SINGLE_ENEMY,
    'attack_power * 3.0 + spell_power * 1.0', null, 0, 'holy_power', 3, 2, 0, 5,
    'icon_paladin_templars_verdict', ['Costs 3 Holy Power'], false, 1,
  ),
  ability_paladin_divine_storm: ability(
    'ability_paladin_divine_storm', 'Divine Storm', 'Unleash holy energy hitting all nearby enemies.',
    ClassType.PALADIN, Specialization.CRUSADER,
    AbilityType.AOE, DamageType.HOLY, TargetType.AOE_SELF,
    '(attack_power + spell_power) * 1.5', null, 0, 'holy_power', 2, 8, 0, 7,
    'icon_paladin_divine_storm', ['Costs 2 Holy Power'], false, 1,
  ),
  ability_paladin_consecration: ability(
    'ability_paladin_consecration', 'Consecration', 'Consecrate the ground, dealing holy damage over 12 seconds.',
    ClassType.PALADIN, Specialization.CRUSADER,
    AbilityType.DOT, DamageType.HOLY, TargetType.GROUND,
    'spell_power * 0.4 per tick', null, 12, 'mana_percent', 15, 8, 0, 8,
    'icon_paladin_consecration', ['Holy ground: damages enemies for 12s'], false, 1,
  ),
  ability_paladin_hammer_of_wrath: ability(
    'ability_paladin_hammer_of_wrath', 'Hammer of Wrath', 'Hurl a hammer of light at a weakened target.',
    ClassType.PALADIN, Specialization.CRUSADER,
    AbilityType.DAMAGE, DamageType.HOLY, TargetType.SINGLE_ENEMY,
    'attack_power * 2.5', null, 6, 'mana', 0, 20, 0, 10,
    'icon_paladin_hammer_wrath', ['Only usable below 20% target HP'], false, 1,
  ),
  ability_paladin_holy_shock: ability(
    'ability_paladin_holy_shock', 'Holy Shock', 'Instantly blast an enemy with holy energy or heal an ally.',
    ClassType.PALADIN, Specialization.AVENGER,
    AbilityType.DAMAGE, DamageType.HOLY, TargetType.SINGLE_ENEMY,
    'spell_power * 2.0', 'spell_power * 2.0', 6, 'mana_percent', 12, 30, 0, 1,
    'icon_paladin_holy_shock', ['Instant cast', 'Damage or Heal'], false, 1,
  ),
  ability_paladin_divine_shield: ability(
    'ability_paladin_divine_shield', 'Divine Shield', 'Become immune to all damage for 8 seconds.',
    ClassType.PALADIN, null,
    AbilityType.SHIELD, DamageType.HOLY, TargetType.SELF,
    '0', null, 300, 'mana', 0, 0, 0, 15,
    'icon_paladin_divine_shield', ['Immune to all damage for 8s', 'Cannot attack for 3s'], false, 1,
  ),
  ability_paladin_lay_on_hands: ability(
    'ability_paladin_lay_on_hands', 'Lay on Hands', 'Heal a friendly target for your maximum health.',
    ClassType.PALADIN, null,
    AbilityType.HEAL, DamageType.HOLY, TargetType.SINGLE_ALLY,
    '0', 'caster_max_hp', 600, 'mana_percent', 100, 40, 0.5, 18,
    'icon_paladin_lay_on_hands', ['Heals target for caster\'s max HP'], false, 1,
  ),
  ability_paladin_aura_mastery: ability(
    'ability_paladin_aura_mastery', 'Aura Mastery', 'Extends your devotion aura to affect the entire raid for 8 seconds.',
    ClassType.PALADIN, null,
    AbilityType.BUFF, DamageType.HOLY, TargetType.AOE_ALLY,
    '0', null, 180, 'mana', 0, 40, 0, 20,
    'icon_paladin_aura_mastery', ['Raid-wide aura effect for 8s'], false, 1,
  ),

  // ════════════════════════════════════════════════════════════
  // RANGER (Marksman spec)
  // ════════════════════════════════════════════════════════════

  ability_ranger_aimed_shot: ability(
    'ability_ranger_aimed_shot', 'Aimed Shot', 'A carefully aimed ranged attack.',
    ClassType.RANGER, Specialization.MARKSMAN,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 2.5', null, 6, 'focus', 20, 30, 1.5, 1,
    'icon_ranger_aimed_shot', [], false, 1,
  ),
  ability_ranger_arcane_shot: ability(
    'ability_ranger_arcane_shot', 'Arcane Shot', 'An instant shot infused with arcane energy.',
    ClassType.RANGER, Specialization.MARKSMAN,
    AbilityType.DAMAGE, DamageType.ARCANE, TargetType.SINGLE_ENEMY,
    'attack_power * 1.5', null, 0, 'focus', 15, 30, 0, 3,
    'icon_ranger_arcane_shot', ['Instant cast'], false, 1,
  ),
  ability_ranger_multishot: ability(
    'ability_ranger_multishot', 'Multi-Shot', 'Fire arrows at up to 3 enemies.',
    ClassType.RANGER, Specialization.MARKSMAN,
    AbilityType.AOE, DamageType.PHYSICAL, TargetType.CONE,
    'attack_power * 1.0 per target', null, 8, 'focus', 25, 30, 0, 5,
    'icon_ranger_multishot', ['Hits up to 3 targets'], false, 1,
  ),
  ability_ranger_kill_shot: ability(
    'ability_ranger_kill_shot', 'Kill Shot', 'A lethal shot against weakened targets.',
    ClassType.RANGER, Specialization.MARKSMAN,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 4.0', null, 10, 'focus', 10, 30, 0, 10,
    'icon_ranger_kill_shot', ['Only usable below 20% target HP'], false, 1,
  ),
  ability_ranger_rapid_fire: ability(
    'ability_ranger_rapid_fire', 'Rapid Fire', 'Increases ranged attack speed by 40% for 15 seconds.',
    ClassType.RANGER, null,
    AbilityType.BUFF, DamageType.PHYSICAL, TargetType.SELF,
    '0', null, 120, 'focus', 0, 0, 0, 12,
    'icon_ranger_rapid_fire', ['+40% ranged attack speed for 15s'], false, 1,
  ),
  ability_ranger_concussive_shot: ability(
    'ability_ranger_concussive_shot', 'Concussive Shot', 'A shot that slows the target.',
    ClassType.RANGER, null,
    AbilityType.DEBUFF, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 0.3', null, 5, 'focus', 5, 30, 0, 2,
    'icon_ranger_concussive', ['50% slow for 6s'], false, 1,
  ),
  ability_ranger_trap: ability(
    'ability_ranger_trap', 'Freezing Trap', 'Place a trap that freezes the first enemy to step on it.',
    ClassType.RANGER, Specialization.TRAPPER,
    AbilityType.DEBUFF, DamageType.ICE, TargetType.GROUND,
    '0', null, 30, 'focus', 10, 40, 0.5, 8,
    'icon_ranger_trap', ['Freeze for 8s', 'Breaks on damage'], false, 1,
  ),
  ability_ranger_call_pet: ability(
    'ability_ranger_call_pet', 'Call Pet', 'Summon your loyal beast companion.',
    ClassType.RANGER, Specialization.BEASTMASTER,
    AbilityType.SUMMON, DamageType.PHYSICAL, TargetType.SELF,
    '0', null, 10, 'focus', 0, 0, 2, 1,
    'icon_ranger_call_pet', ['Summons a permanent pet companion'], false, 1,
  ),
  ability_ranger_bestial_wrath: ability(
    'ability_ranger_bestial_wrath', 'Bestial Wrath', 'Your pet goes into a frenzy, dealing 50% more damage.',
    ClassType.RANGER, Specialization.BEASTMASTER,
    AbilityType.BUFF, DamageType.PHYSICAL, TargetType.SELF,
    '0', null, 90, 'focus', 0, 0, 0, 15,
    'icon_ranger_bestial_wrath', ['Pet +50% damage for 15s'], false, 1,
  ),
  ability_ranger_volley: ability(
    'ability_ranger_volley', 'Volley', 'Rain arrows on a target area for 6 seconds.',
    ClassType.RANGER, Specialization.MARKSMAN,
    AbilityType.CHANNEL, DamageType.PHYSICAL, TargetType.GROUND,
    'attack_power * 0.6 per tick', null, 60, 'focus', 40, 40, 0, 18,
    'icon_ranger_volley', ['Channeled AoE for 6s'], false, 1,
  ),

  // ════════════════════════════════════════════════════════════
  // ROGUE (Assassin spec)
  // ════════════════════════════════════════════════════════════

  ability_rogue_sinister_strike: ability(
    'ability_rogue_sinister_strike', 'Sinister Strike', 'A quick strike with your weapon.',
    ClassType.ROGUE, Specialization.ASSASSIN,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 1.5', null, 0, 'energy', 40, 2, 0, 1,
    'icon_rogue_sinister', ['Generates 1 Combo Point'], false, 1,
  ),
  ability_rogue_backstab: ability(
    'ability_rogue_backstab', 'Backstab', 'Stab the target from behind for increased damage.',
    ClassType.ROGUE, Specialization.ASSASSIN,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 2.5', null, 0, 'energy', 60, 2, 0, 4,
    'icon_rogue_backstab', ['Must be behind target', 'Generates 2 Combo Points'], false, 1,
  ),
  ability_rogue_eviscerate: ability(
    'ability_rogue_eviscerate', 'Eviscerate', 'Finishing move that deals damage per combo point.',
    ClassType.ROGUE, Specialization.ASSASSIN,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * (0.8 * combo_points)', null, 0, 'energy', 35, 2, 0, 3,
    'icon_rogue_eviscerate', ['Damage scales with combo points'], false, 1,
  ),
  ability_rogue_kidney_shot: ability(
    'ability_rogue_kidney_shot', 'Kidney Shot', 'Stun the target, consuming combo points.',
    ClassType.ROGUE, Specialization.ASSASSIN,
    AbilityType.DEBUFF, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    '0', null, 20, 'energy', 25, 2, 0, 6,
    'icon_rogue_kidney', ['Stun for 1s per combo point (max 6s)'], false, 1,
  ),
  ability_rogue_stealth: ability(
    'ability_rogue_stealth', 'Stealth', 'Enter stealth mode, becoming invisible to enemies.',
    ClassType.ROGUE, null,
    AbilityType.BUFF, DamageType.PHYSICAL, TargetType.SELF,
    '0', null, 10, 'energy', 0, 0, 0, 1,
    'icon_rogue_stealth', ['Invisible until detected or attacking', '+20% movement speed'], false, 1,
  ),
  ability_rogue_ambush: ability(
    'ability_rogue_ambush', 'Ambush', 'A devastating opener from stealth.',
    ClassType.ROGUE, Specialization.ASSASSIN,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 3.0', null, 0, 'energy', 60, 2, 0, 5,
    'icon_rogue_ambush', ['Requires Stealth', 'Generates 2 Combo Points'], false, 1,
  ),
  ability_rogue_fan_of_knives: ability(
    'ability_rogue_fan_of_knives', 'Fan of Knives', 'Throw knives at all nearby enemies.',
    ClassType.ROGUE, Specialization.BLADE_DANCER,
    AbilityType.AOE, DamageType.PHYSICAL, TargetType.AOE_SELF,
    'attack_power * 0.8', null, 0, 'energy', 50, 8, 0, 10,
    'icon_rogue_fan', [], false, 1,
  ),
  ability_rogue_shadowstep: ability(
    'ability_rogue_shadowstep', 'Shadowstep', 'Teleport behind the target.',
    ClassType.ROGUE, Specialization.SHADOW,
    AbilityType.TELEPORT, DamageType.SHADOW, TargetType.SINGLE_ENEMY,
    '0', null, 20, 'energy', 0, 25, 0, 8,
    'icon_rogue_shadowstep', ['Teleport behind target', '+20% damage for 3s'], false, 1,
  ),
  ability_rogue_vanish: ability(
    'ability_rogue_vanish', 'Vanish', 'Instantly enter stealth, removing all snares.',
    ClassType.ROGUE, null,
    AbilityType.BUFF, DamageType.PHYSICAL, TargetType.SELF,
    '0', null, 120, 'energy', 0, 0, 0, 12,
    'icon_rogue_vanish', ['Enter stealth', 'Breaks all snares and roots'], false, 1,
  ),
  ability_rogue_shadow_blades: ability(
    'ability_rogue_shadow_blades', 'Shadow Blades', 'Your attacks deal shadow damage and generate extra combo points for 15 seconds.',
    ClassType.ROGUE, Specialization.SHADOW,
    AbilityType.BUFF, DamageType.SHADOW, TargetType.SELF,
    '0', null, 180, 'energy', 0, 0, 0, 20,
    'icon_rogue_shadow_blades', ['Attacks deal shadow damage', '+1 combo point per hit for 15s'], false, 1,
  ),

  // ════════════════════════════════════════════════════════════
  // MAGE (Elemental spec)
  // ════════════════════════════════════════════════════════════

  ability_mage_fireball: ability(
    'ability_mage_fireball', 'Fireball', 'Hurl a ball of fire at the target.',
    ClassType.MAGE, Specialization.ELEMENTAL,
    AbilityType.DAMAGE, DamageType.FIRE, TargetType.SINGLE_ENEMY,
    'spell_power * 2.0 + 20', null, 0, 'mana_percent', 5, 30, 2, 1,
    'icon_mage_fireball', ['Burn: 5 fire damage every 2s for 6s'], false, 1,
  ),
  ability_mage_frostbolt: ability(
    'ability_mage_frostbolt', 'Frostbolt', 'Launch a bolt of frost at the target.',
    ClassType.MAGE, Specialization.FROST,
    AbilityType.DAMAGE, DamageType.ICE, TargetType.SINGLE_ENEMY,
    'spell_power * 1.8 + 15', null, 0, 'mana_percent', 4, 30, 2, 1,
    'icon_mage_frostbolt', ['40% slow for 8s'], false, 1,
  ),
  ability_mage_arcane_blast: ability(
    'ability_mage_arcane_blast', 'Arcane Blast', 'A burst of arcane energy.',
    ClassType.MAGE, Specialization.ARCANE,
    AbilityType.DAMAGE, DamageType.ARCANE, TargetType.SINGLE_ENEMY,
    'spell_power * 2.2', null, 0, 'mana_percent', 6, 30, 1.5, 3,
    'icon_mage_arcane_blast', ['Each cast increases mana cost by 50% (stacks 4x, fades after 6s)'], false, 1,
  ),
  ability_mage_pyroblast: ability(
    'ability_mage_pyroblast', 'Pyroblast', 'Hurl an enormous ball of fire. Devastating but slow.',
    ClassType.MAGE, Specialization.ELEMENTAL,
    AbilityType.DAMAGE, DamageType.FIRE, TargetType.SINGLE_ENEMY,
    'spell_power * 4.0 + 40', null, 12, 'mana_percent', 12, 30, 3.5, 10,
    'icon_mage_pyroblast', ['Burn: 10 fire damage every 2s for 10s'], false, 1,
  ),
  ability_mage_blizzard: ability(
    'ability_mage_blizzard', 'Blizzard', 'Call down a blizzard on a target area.',
    ClassType.MAGE, Specialization.FROST,
    AbilityType.CHANNEL, DamageType.ICE, TargetType.GROUND,
    'spell_power * 0.5 per tick', null, 8, 'mana_percent', 15, 40, 0, 12,
    'icon_mage_blizzard', ['Channeled AoE for 6s', '30% slow'], false, 1,
  ),
  ability_mage_cone_of_cold: ability(
    'ability_mage_cone_of_cold', 'Cone of Cold', 'Blast enemies in a cone with freezing air.',
    ClassType.MAGE, Specialization.FROST,
    AbilityType.AOE, DamageType.ICE, TargetType.CONE,
    'spell_power * 1.5', null, 10, 'mana_percent', 8, 10, 0, 8,
    'icon_mage_cone_cold', ['50% slow for 6s'], false, 1,
  ),
  ability_mage_counterspell: ability(
    'ability_mage_counterspell', 'Counterspell', 'Interrupt the target\'s spellcasting.',
    ClassType.MAGE, null,
    AbilityType.DEBUFF, DamageType.ARCANE, TargetType.SINGLE_ENEMY,
    '0', null, 24, 'mana_percent', 6, 30, 0, 6,
    'icon_mage_counterspell', ['Interrupt', 'Silence for 6s'], false, 1,
  ),
  ability_mage_ice_block: ability(
    'ability_mage_ice_block', 'Ice Block', 'Encase yourself in a block of ice, becoming immune.',
    ClassType.MAGE, null,
    AbilityType.SHIELD, DamageType.ICE, TargetType.SELF,
    '0', null, 240, 'mana_percent', 15, 0, 0, 14,
    'icon_mage_ice_block', ['Immune to all damage for 10s', 'Cannot act'], false, 1,
  ),
  ability_mage_meteor: ability(
    'ability_mage_meteor', 'Meteor', 'Call down a meteor on the target area after 3 seconds.',
    ClassType.MAGE, Specialization.ELEMENTAL,
    AbilityType.DAMAGE, DamageType.FIRE, TargetType.GROUND,
    'spell_power * 5.0', null, 45, 'mana_percent', 20, 40, 3, 20,
    'icon_mage_meteor', ['3s delay', 'Burn: 15 fire damage every 2s for 8s'], false, 1,
  ),
  ability_mage_evocation: ability(
    'ability_mage_evocation', 'Evocation', 'Channel arcane energy to restore 60% of your mana over 6 seconds.',
    ClassType.MAGE, null,
    AbilityType.BUFF, DamageType.ARCANE, TargetType.SELF,
    '0', null, 120, 'mana', 0, 0, 6, 10,
    'icon_mage_evocation', ['Restores 60% mana over 6s', 'Channeled'], false, 1,
  ),

  // ════════════════════════════════════════════════════════════
  // NECROMANCER (Summoner spec)
  // ════════════════════════════════════════════════════════════

  ability_necro_shadow_bolt: ability(
    'ability_necro_shadow_bolt', 'Shadow Bolt', 'Hurl a bolt of shadow energy.',
    ClassType.NECROMANCER, Specialization.SUMMONER,
    AbilityType.DAMAGE, DamageType.SHADOW, TargetType.SINGLE_ENEMY,
    'spell_power * 2.0', null, 0, 'mana_percent', 5, 30, 2, 1,
    'icon_necro_shadow_bolt', [], false, 1,
  ),
  ability_necro_summon_skeleton: ability(
    'ability_necro_summon_skeleton', 'Summon Skeleton', 'Raise a skeletal warrior to fight for you.',
    ClassType.NECROMANCER, Specialization.SUMMONER,
    AbilityType.SUMMON, DamageType.SHADOW, TargetType.SELF,
    '0', null, 30, 'mana_percent', 15, 0, 2, 3,
    'icon_necro_summon_skeleton', ['Summons a permanent skeleton minion'], false, 1,
  ),
  ability_necro_drain_life: ability(
    'ability_necro_drain_life', 'Drain Life', 'Siphon life from the target, healing yourself.',
    ClassType.NECROMANCER, Specialization.AFFLICTION,
    AbilityType.CHANNEL, DamageType.SHADOW, TargetType.SINGLE_ENEMY,
    'spell_power * 0.5 per tick', 'spell_power * 0.3 per tick', 0, 'mana_percent', 4, 30, 0, 5,
    'icon_necro_drain_life', ['Channeled for 5s', 'Heals caster for 60% of damage dealt'], false, 1,
  ),
  ability_necro_curse_of_agony: ability(
    'ability_necro_curse_of_agony', 'Curse of Agony', 'Curse the target with increasing shadow damage over time.',
    ClassType.NECROMANCER, Specialization.AFFLICTION,
    AbilityType.DOT, DamageType.SHADOW, TargetType.SINGLE_ENEMY,
    'spell_power * 0.2 per tick (12 ticks, increasing)', null, 0, 'mana_percent', 3, 30, 0, 4,
    'icon_necro_curse_agony', ['Shadow DoT that ramps up over 24s'], false, 1,
  ),
  ability_necro_death_coil: ability(
    'ability_necro_death_coil', 'Death Coil', 'Hurl a coil of death energy. Damages enemies or heals undead allies.',
    ClassType.NECROMANCER, Specialization.BONE,
    AbilityType.DAMAGE, DamageType.SHADOW, TargetType.SINGLE_ENEMY,
    'spell_power * 2.5', null, 20, 'mana_percent', 10, 30, 0, 8,
    'icon_necro_death_coil', ['Fear for 3s on enemy targets'], false, 1,
  ),
  ability_necro_bone_armor: ability(
    'ability_necro_bone_armor', 'Bone Armor', 'Surround yourself with floating bones that absorb damage.',
    ClassType.NECROMANCER, Specialization.BONE,
    AbilityType.SHIELD, DamageType.SHADOW, TargetType.SELF,
    '0', null, 30, 'mana_percent', 10, 0, 0, 6,
    'icon_necro_bone_armor', ['Absorbs spell_power * 3 damage', 'Lasts 60s or until consumed'], false, 1,
  ),
  ability_necro_corpse_explosion: ability(
    'ability_necro_corpse_explosion', 'Corpse Explosion', 'Cause a corpse to explode, damaging all nearby enemies.',
    ClassType.NECROMANCER, Specialization.BONE,
    AbilityType.AOE, DamageType.SHADOW, TargetType.GROUND,
    'spell_power * 2.0', null, 10, 'mana_percent', 8, 30, 0, 10,
    'icon_necro_corpse_explode', ['Requires nearby corpse', 'AoE shadow damage'], false, 1,
  ),
  ability_necro_unholy_frenzy: ability(
    'ability_necro_unholy_frenzy', 'Unholy Frenzy', 'Drive your minions into a frenzy.',
    ClassType.NECROMANCER, Specialization.SUMMONER,
    AbilityType.BUFF, DamageType.SHADOW, TargetType.SELF,
    '0', null, 60, 'mana_percent', 10, 0, 0, 12,
    'icon_necro_frenzy', ['Minions +50% attack speed and +25% damage for 15s'], false, 1,
  ),
  ability_necro_raise_dead: ability(
    'ability_necro_raise_dead', 'Raise Dead', 'Raise a powerful undead champion from a corpse.',
    ClassType.NECROMANCER, Specialization.SUMMONER,
    AbilityType.SUMMON, DamageType.SHADOW, TargetType.SELF,
    '0', null, 120, 'mana_percent', 25, 0, 3, 15,
    'icon_necro_raise_dead', ['Summons a powerful undead champion for 60s', 'Requires corpse'], false, 1,
  ),
  ability_necro_army_of_dead: ability(
    'ability_necro_army_of_dead', 'Army of the Dead', 'Raise a horde of undead warriors.',
    ClassType.NECROMANCER, Specialization.SUMMONER,
    AbilityType.SUMMON, DamageType.SHADOW, TargetType.SELF,
    '0', null, 300, 'mana_percent', 40, 0, 4, 25,
    'icon_necro_army', ['Summons 6 skeleton warriors for 30s', 'Channeled summon'], false, 1,
  ),

  // ════════════════════════════════════════════════════════════
  // CLERIC (Holy spec)
  // ════════════════════════════════════════════════════════════

  ability_cleric_smite: ability(
    'ability_cleric_smite', 'Smite', 'Smite the target with holy energy.',
    ClassType.CLERIC, Specialization.HOLY,
    AbilityType.DAMAGE, DamageType.HOLY, TargetType.SINGLE_ENEMY,
    'spell_power * 1.8', null, 0, 'mana_percent', 4, 30, 1.5, 1,
    'icon_cleric_smite', [], false, 1,
  ),
  ability_cleric_heal: ability(
    'ability_cleric_heal', 'Heal', 'Heal a friendly target.',
    ClassType.CLERIC, Specialization.HOLY,
    AbilityType.HEAL, DamageType.HOLY, TargetType.SINGLE_ALLY,
    '0', 'spell_power * 2.5 + 30', 0, 'mana_percent', 8, 40, 2.5, 1,
    'icon_cleric_heal', [], false, 1,
  ),
  ability_cleric_flash_heal: ability(
    'ability_cleric_flash_heal', 'Flash Heal', 'A fast, expensive heal.',
    ClassType.CLERIC, Specialization.HOLY,
    AbilityType.HEAL, DamageType.HOLY, TargetType.SINGLE_ALLY,
    '0', 'spell_power * 1.5 + 20', 0, 'mana_percent', 12, 40, 1, 4,
    'icon_cleric_flash_heal', ['Fast but costly'], false, 1,
  ),
  ability_cleric_renew: ability(
    'ability_cleric_renew', 'Renew', 'Place a heal over time on the target.',
    ClassType.CLERIC, Specialization.HOLY,
    AbilityType.HOT, DamageType.HOLY, TargetType.SINGLE_ALLY,
    '0', 'spell_power * 0.4 per tick (5 ticks)', 0, 'mana_percent', 5, 40, 0, 3,
    'icon_cleric_renew', ['Heals over 10s'], false, 1,
  ),
  ability_cleric_prayer_of_healing: ability(
    'ability_cleric_prayer_of_healing', 'Prayer of Healing', 'Heal up to 5 nearby allies.',
    ClassType.CLERIC, Specialization.HOLY,
    AbilityType.HEAL, DamageType.HOLY, TargetType.AOE_ALLY,
    '0', 'spell_power * 1.2 + 15', 8, 'mana_percent', 18, 15, 3, 10,
    'icon_cleric_prayer', ['Heals up to 5 allies in range'], false, 1,
  ),
  ability_cleric_holy_fire: ability(
    'ability_cleric_holy_fire', 'Holy Fire', 'Burn the target with divine fire.',
    ClassType.CLERIC, Specialization.JUDGEMENT,
    AbilityType.DAMAGE, DamageType.HOLY, TargetType.SINGLE_ENEMY,
    'spell_power * 2.5', null, 10, 'mana_percent', 8, 30, 2, 8,
    'icon_cleric_holy_fire', ['Holy Fire DoT: 5 damage every 2s for 8s'], false, 1,
  ),
  ability_cleric_dispel: ability(
    'ability_cleric_dispel', 'Purify', 'Remove 1 poison, 1 disease, and 1 magic debuff from the target.',
    ClassType.CLERIC, null,
    AbilityType.HEAL, DamageType.HOLY, TargetType.SINGLE_ALLY,
    '0', null, 8, 'mana_percent', 10, 40, 0, 5,
    'icon_cleric_dispel', ['Removes debuffs'], false, 1,
  ),
  ability_cleric_resurrection: ability(
    'ability_cleric_resurrection', 'Resurrection', 'Bring a dead player back to life.',
    ClassType.CLERIC, null,
    AbilityType.HEAL, DamageType.HOLY, TargetType.SINGLE_ALLY,
    '0', 'target_max_hp * 0.35', 0, 'mana_percent', 30, 40, 10, 12,
    'icon_cleric_resurrect', ['Resurrects with 35% HP', 'Cannot be used in combat'], false, 1,
  ),
  ability_cleric_divine_hymn: ability(
    'ability_cleric_divine_hymn', 'Divine Hymn', 'Channel a hymn that heals all allies over 8 seconds.',
    ClassType.CLERIC, Specialization.HOLY,
    AbilityType.CHANNEL, DamageType.HOLY, TargetType.AOE_ALLY,
    '0', 'spell_power * 1.0 per tick (4 ticks)', 180, 'mana_percent', 30, 40, 0, 20,
    'icon_cleric_divine_hymn', ['Channeled AoE heal for 8s', 'Heals 4 times'], false, 1,
  ),
  ability_cleric_guardian_spirit: ability(
    'ability_cleric_guardian_spirit', 'Guardian Spirit', 'Place a spirit on the target that prevents one death.',
    ClassType.CLERIC, Specialization.HOLY,
    AbilityType.BUFF, DamageType.HOLY, TargetType.SINGLE_ALLY,
    '0', null, 180, 'mana_percent', 15, 40, 0, 25,
    'icon_cleric_guardian_spirit', ['If target would die, instead heal to 50% HP', 'Lasts 10s'], false, 1,
  ),

  // ════════════════════════════════════════════════════════════
  // DRUID (Restoration spec — healer + Balance + Feral)
  // ════════════════════════════════════════════════════════════

  ability_druid_wrath: ability(
    'ability_druid_wrath', 'Wrath', 'Hurl a bolt of nature energy at the target.',
    ClassType.DRUID, Specialization.BALANCE,
    AbilityType.DAMAGE, DamageType.NATURE, TargetType.SINGLE_ENEMY,
    'spell_power * 1.8', null, 0, 'mana_percent', 4, 30, 1.5, 1,
    'icon_druid_wrath', [], false, 1,
  ),
  ability_druid_moonfire: ability(
    'ability_druid_moonfire', 'Moonfire', 'Burn the target with lunar energy.',
    ClassType.DRUID, Specialization.BALANCE,
    AbilityType.DOT, DamageType.ARCANE, TargetType.SINGLE_ENEMY,
    'spell_power * 0.5 + spell_power * 0.3 per tick', null, 0, 'mana_percent', 5, 30, 0, 2,
    'icon_druid_moonfire', ['Instant + Arcane DoT for 12s'], false, 1,
  ),
  ability_druid_rejuvenation: ability(
    'ability_druid_rejuvenation', 'Rejuvenation', 'Heal the target over 12 seconds.',
    ClassType.DRUID, Specialization.RESTORATION,
    AbilityType.HOT, DamageType.NATURE, TargetType.SINGLE_ALLY,
    '0', 'spell_power * 0.35 per tick (6 ticks)', 0, 'mana_percent', 6, 40, 0, 1,
    'icon_druid_rejuvenation', ['Heal over 12s'], false, 1,
  ),
  ability_druid_regrowth: ability(
    'ability_druid_regrowth', 'Regrowth', 'A quick heal with an additional heal over time.',
    ClassType.DRUID, Specialization.RESTORATION,
    AbilityType.HEAL, DamageType.NATURE, TargetType.SINGLE_ALLY,
    '0', 'spell_power * 2.0 + 25', 0, 'mana_percent', 10, 40, 1.5, 5,
    'icon_druid_regrowth', ['Direct heal + HoT for 10s'], false, 1,
  ),
  ability_druid_swipe: ability(
    'ability_druid_swipe', 'Swipe', 'Swipe at all nearby enemies in cat or bear form.',
    ClassType.DRUID, Specialization.FERAL,
    AbilityType.AOE, DamageType.PHYSICAL, TargetType.AOE_SELF,
    'attack_power * 1.2', null, 0, 'energy', 40, 5, 0, 4,
    'icon_druid_swipe', [], false, 1,
  ),
  ability_druid_shred: ability(
    'ability_druid_shred', 'Shred', 'Shred the target from behind for massive damage (cat form).',
    ClassType.DRUID, Specialization.FERAL,
    AbilityType.DAMAGE, DamageType.PHYSICAL, TargetType.SINGLE_ENEMY,
    'attack_power * 2.5', null, 0, 'energy', 55, 2, 0, 6,
    'icon_druid_shred', ['Must be behind target', 'Generates 1 Combo Point'], false, 1,
  ),
  ability_druid_bear_form: ability(
    'ability_druid_bear_form', 'Bear Form', 'Transform into a bear, gaining armor and stamina.',
    ClassType.DRUID, Specialization.FERAL,
    AbilityType.BUFF, DamageType.PHYSICAL, TargetType.SELF,
    '0', null, 0, 'mana_percent', 8, 0, 0, 8,
    'icon_druid_bear_form', ['+30% armor', '+20% stamina', 'Changes ability bar'], false, 1,
  ),
  ability_druid_cat_form: ability(
    'ability_druid_cat_form', 'Cat Form', 'Transform into a cat, gaining agility and energy regeneration.',
    ClassType.DRUID, Specialization.FERAL,
    AbilityType.BUFF, DamageType.PHYSICAL, TargetType.SELF,
    '0', null, 0, 'mana_percent', 8, 0, 0, 6,
    'icon_druid_cat_form', ['+15% agility', 'Uses Energy instead of Mana', 'Changes ability bar'], false, 1,
  ),
  ability_druid_wild_growth: ability(
    'ability_druid_wild_growth', 'Wild Growth', 'Heal up to 5 nearby allies over 7 seconds.',
    ClassType.DRUID, Specialization.RESTORATION,
    AbilityType.HOT, DamageType.NATURE, TargetType.AOE_ALLY,
    '0', 'spell_power * 0.3 per tick (3 ticks) per target', 8, 'mana_percent', 14, 15, 0, 12,
    'icon_druid_wild_growth', ['HoT on up to 5 allies', 'Heals decrease over duration'], false, 1,
  ),
  ability_druid_tranquility: ability(
    'ability_druid_tranquility', 'Tranquility', 'Channel nature\'s power to heal all allies over 8 seconds.',
    ClassType.DRUID, Specialization.RESTORATION,
    AbilityType.CHANNEL, DamageType.NATURE, TargetType.AOE_ALLY,
    '0', 'spell_power * 1.5 per tick (4 ticks)', 180, 'mana_percent', 32, 40, 0, 20,
    'icon_druid_tranquility', ['Channeled raid heal for 8s', 'Heals 4 times'], false, 1,
  ),
};
