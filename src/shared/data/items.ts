// ============================================================
// Nexus Realms — Item Definitions (80+ items)
// ============================================================

import {
  ItemType,
  ItemRarity,
  EquipmentSlot,
  BindType,
  EntityStats,
} from '../types';

// ─── Item Interfaces ─────────────────────────────────────────
export interface ItemStatBonus {
  stat: keyof EntityStats;
  value: number;
}

export interface ItemEffect {
  type: 'heal_hp' | 'heal_mana' | 'buff' | 'damage' | 'teleport' | 'quest_trigger';
  value: number;
  duration?: number;
  description: string;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  level_requirement: number;
  bind_type: BindType;
  sell_price: number;
  stackable: boolean;
  max_stack: number;
  icon_id: string;
  equipment_slot?: EquipmentSlot;
  stats?: ItemStatBonus[];
  effects?: ItemEffect[];
  class_restriction?: string[];
  durability?: number;
}

// ─── Helper ──────────────────────────────────────────────────
function gear(
  id: string,
  name: string,
  desc: string,
  type: ItemType,
  rarity: ItemRarity,
  level: number,
  slot: EquipmentSlot,
  stats: ItemStatBonus[],
  sell: number,
  icon: string,
  bind: BindType = BindType.EQUIP,
  classes?: string[],
): ItemDefinition {
  return {
    id, name, description: desc, type, rarity,
    level_requirement: level,
    bind_type: bind,
    sell_price: sell,
    stackable: false,
    max_stack: 1,
    icon_id: icon,
    equipment_slot: slot,
    stats,
    durability: 100,
    class_restriction: classes,
  };
}

function mat(
  id: string, name: string, desc: string, type: ItemType, rarity: ItemRarity,
  sell: number, icon: string, maxStack = 99,
): ItemDefinition {
  return {
    id, name, description: desc, type, rarity,
    level_requirement: 1,
    bind_type: BindType.NONE,
    sell_price: sell,
    stackable: true,
    max_stack: maxStack,
    icon_id: icon,
  };
}

function consumable(
  id: string, name: string, desc: string, rarity: ItemRarity,
  level: number, sell: number, icon: string, effects: ItemEffect[],
): ItemDefinition {
  return {
    id, name, description: desc, type: ItemType.CONSUMABLE_POTION, rarity,
    level_requirement: level,
    bind_type: BindType.NONE,
    sell_price: sell,
    stackable: true,
    max_stack: 20,
    icon_id: icon,
    effects,
  };
}

function food(
  id: string, name: string, desc: string, rarity: ItemRarity,
  level: number, sell: number, icon: string, effects: ItemEffect[],
): ItemDefinition {
  return {
    id, name, description: desc, type: ItemType.CONSUMABLE_FOOD, rarity,
    level_requirement: level,
    bind_type: BindType.NONE,
    sell_price: sell,
    stackable: true,
    max_stack: 20,
    icon_id: icon,
    effects,
  };
}

function quest(
  id: string, name: string, desc: string, icon: string,
): ItemDefinition {
  return {
    id, name, description: desc, type: ItemType.QUEST_ITEM, rarity: ItemRarity.COMMON,
    level_requirement: 1,
    bind_type: BindType.QUEST,
    sell_price: 0,
    stackable: true,
    max_stack: 1,
    icon_id: icon,
  };
}

// ══════════════════════════════════════════════════════════════
// ITEM DEFINITIONS
// ══════════════════════════════════════════════════════════════

export const ITEMS: Record<string, ItemDefinition> = {

  // ──────────────────────────────────────────────────────────
  // WEAPONS — Tier 1 (Level 1-5)
  // ──────────────────────────────────────────────────────────

  item_rusty_sword: gear(
    'item_rusty_sword', 'Rusty Sword',
    'A battered sword found in a roadside ditch. Better than bare fists.',
    ItemType.WEAPON_SWORD, ItemRarity.COMMON, 1, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 3 }], 5, 'icon_sword_rusty',
  ),
  item_rusty_dagger: gear(
    'item_rusty_dagger', 'Rusty Dagger',
    'A small, corroded dagger. Still sharp enough to cut.',
    ItemType.WEAPON_DAGGER, ItemRarity.COMMON, 1, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 2 }, { stat: 'agility', value: 1 }], 4, 'icon_dagger_rusty',
  ),
  item_wooden_staff: gear(
    'item_wooden_staff', 'Wooden Staff',
    'A simple staff carved from oak. Faintly hums with latent energy.',
    ItemType.WEAPON_STAFF, ItemRarity.COMMON, 1, EquipmentSlot.MAIN_HAND,
    [{ stat: 'spell_power', value: 3 }, { stat: 'intellect', value: 1 }], 6, 'icon_staff_wooden',
  ),
  item_hunting_bow: gear(
    'item_hunting_bow', 'Hunting Bow',
    'A short bow used by Verdant Plains hunters.',
    ItemType.WEAPON_BOW, ItemRarity.COMMON, 1, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 3 }, { stat: 'agility', value: 1 }], 6, 'icon_bow_hunting',
  ),
  item_worn_mace: gear(
    'item_worn_mace', 'Worn Mace',
    'A heavy mace showing years of use. Reliable if unremarkable.',
    ItemType.WEAPON_MACE, ItemRarity.COMMON, 1, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 3 }, { stat: 'strength', value: 1 }], 5, 'icon_mace_worn',
  ),
  item_cracked_wand: gear(
    'item_cracked_wand', 'Cracked Wand',
    'A wand with a hairline fracture in its crystal tip. Still channels minor magic.',
    ItemType.WEAPON_WAND, ItemRarity.COMMON, 1, EquipmentSlot.MAIN_HAND,
    [{ stat: 'spell_power', value: 2 }, { stat: 'spirit', value: 1 }], 4, 'icon_wand_cracked',
  ),
  item_rusty_axe: gear(
    'item_rusty_axe', 'Rusty Axe',
    'A woodsman\'s axe left to rust. One good swing is all it needs.',
    ItemType.WEAPON_AXE, ItemRarity.COMMON, 1, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 3 }, { stat: 'strength', value: 1 }], 5, 'icon_axe_rusty',
  ),
  item_wooden_shield: gear(
    'item_wooden_shield', 'Wooden Buckler',
    'A small round shield made from planks. Blocks more than nothing.',
    ItemType.WEAPON_SHIELD, ItemRarity.COMMON, 1, EquipmentSlot.OFF_HAND,
    [{ stat: 'armor', value: 5 }, { stat: 'block', value: 3 }], 5, 'icon_shield_wooden',
  ),

  // ──────────────────────────────────────────────────────────
  // WEAPONS — Tier 2 (Level 10-15)
  // ──────────────────────────────────────────────────────────

  item_iron_sword: gear(
    'item_iron_sword', 'Iron Sword',
    'A well-forged iron sword. Standard issue for Ironhold patrols.',
    ItemType.WEAPON_SWORD, ItemRarity.UNCOMMON, 10, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 12 }, { stat: 'strength', value: 4 }], 35, 'icon_sword_iron',
  ),
  item_iron_dagger: gear(
    'item_iron_dagger', 'Iron Dagger',
    'A balanced dagger favoured by rogues and scouts.',
    ItemType.WEAPON_DAGGER, ItemRarity.UNCOMMON, 10, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 8 }, { stat: 'agility', value: 6 }, { stat: 'critical_chance', value: 2 }], 30, 'icon_dagger_iron',
  ),
  item_apprentice_staff: gear(
    'item_apprentice_staff', 'Apprentice\'s Staff',
    'A staff given to students of the Mosshollow alchemy school.',
    ItemType.WEAPON_STAFF, ItemRarity.UNCOMMON, 10, EquipmentSlot.MAIN_HAND,
    [{ stat: 'spell_power', value: 14 }, { stat: 'intellect', value: 5 }, { stat: 'spirit', value: 3 }], 40, 'icon_staff_apprentice',
  ),
  item_composite_bow: gear(
    'item_composite_bow', 'Composite Bow',
    'A laminated bow with excellent range and power.',
    ItemType.WEAPON_BOW, ItemRarity.UNCOMMON, 10, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 11 }, { stat: 'agility', value: 5 }, { stat: 'critical_chance', value: 1 }], 38, 'icon_bow_composite',
  ),
  item_iron_mace: gear(
    'item_iron_mace', 'Iron Mace',
    'A solid mace that delivers bone-crushing blows.',
    ItemType.WEAPON_MACE, ItemRarity.UNCOMMON, 10, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 12 }, { stat: 'strength', value: 4 }, { stat: 'stamina', value: 2 }], 36, 'icon_mace_iron',
  ),
  item_apprentice_wand: gear(
    'item_apprentice_wand', 'Apprentice\'s Wand',
    'A wand of polished wood with a clear quartz tip.',
    ItemType.WEAPON_WAND, ItemRarity.UNCOMMON, 10, EquipmentSlot.MAIN_HAND,
    [{ stat: 'spell_power', value: 10 }, { stat: 'spirit', value: 5 }, { stat: 'intellect', value: 3 }], 32, 'icon_wand_apprentice',
  ),
  item_iron_axe: gear(
    'item_iron_axe', 'Iron Axe',
    'A heavy axe forged in the Verdant Plains smithy.',
    ItemType.WEAPON_AXE, ItemRarity.UNCOMMON, 10, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 13 }, { stat: 'strength', value: 5 }], 37, 'icon_axe_iron',
  ),
  item_iron_shield: gear(
    'item_iron_shield', 'Iron Shield',
    'A sturdy iron shield emblazoned with the Verdant Plains crest.',
    ItemType.WEAPON_SHIELD, ItemRarity.UNCOMMON, 10, EquipmentSlot.OFF_HAND,
    [{ stat: 'armor', value: 18 }, { stat: 'block', value: 8 }, { stat: 'stamina', value: 3 }], 35, 'icon_shield_iron',
  ),

  // ──────────────────────────────────────────────────────────
  // WEAPONS — Tier 3 (Level 20-25)
  // ──────────────────────────────────────────────────────────

  item_steel_sword: gear(
    'item_steel_sword', 'Steel Longsword',
    'A finely crafted steel blade. The edge never dulls.',
    ItemType.WEAPON_SWORD, ItemRarity.RARE, 20, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 28 }, { stat: 'strength', value: 8 }, { stat: 'critical_chance', value: 3 }], 120, 'icon_sword_steel',
  ),
  item_steel_dagger: gear(
    'item_steel_dagger', 'Assassin\'s Stiletto',
    'A needle-thin blade designed for precision strikes.',
    ItemType.WEAPON_DAGGER, ItemRarity.RARE, 20, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 20 }, { stat: 'agility', value: 12 }, { stat: 'critical_chance', value: 5 }, { stat: 'haste', value: 3 }], 110, 'icon_dagger_steel',
  ),
  item_channelers_staff: gear(
    'item_channelers_staff', 'Channeler\'s Staff',
    'A staff of darkwood capped with a glowing crystal orb.',
    ItemType.WEAPON_STAFF, ItemRarity.RARE, 20, EquipmentSlot.MAIN_HAND,
    [{ stat: 'spell_power', value: 32 }, { stat: 'intellect', value: 10 }, { stat: 'spirit', value: 6 }, { stat: 'critical_chance', value: 2 }], 130, 'icon_staff_channeler',
  ),
  item_ymrian_bow: gear(
    'item_ymrian_bow', 'Ymrian Longbow',
    'A longbow crafted from ancient Thornwood heartwood.',
    ItemType.WEAPON_BOW, ItemRarity.RARE, 20, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 26 }, { stat: 'agility', value: 10 }, { stat: 'critical_chance', value: 4 }], 125, 'icon_bow_ymrian',
  ),
  item_battle_mace: gear(
    'item_battle_mace', 'Ironhold Battle Mace',
    'A heavy mace forged in the Ironhold Covenant\'s forges.',
    ItemType.WEAPON_MACE, ItemRarity.RARE, 20, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 28 }, { stat: 'strength', value: 8 }, { stat: 'stamina', value: 5 }], 120, 'icon_mace_battle',
  ),
  item_crystal_wand: gear(
    'item_crystal_wand', 'Crystal Wand',
    'A wand carved from a single piece of Evergrove crystal.',
    ItemType.WEAPON_WAND, ItemRarity.RARE, 20, EquipmentSlot.MAIN_HAND,
    [{ stat: 'spell_power', value: 24 }, { stat: 'spirit', value: 10 }, { stat: 'intellect', value: 6 }, { stat: 'haste', value: 3 }], 115, 'icon_wand_crystal',
  ),
  item_executioner_axe: gear(
    'item_executioner_axe', 'Executioner\'s Greataxe',
    'A fearsome two-handed axe. The blade is stained dark.',
    ItemType.WEAPON_AXE, ItemRarity.RARE, 20, EquipmentSlot.MAIN_HAND,
    [{ stat: 'attack_power', value: 32 }, { stat: 'strength', value: 10 }, { stat: 'critical_damage', value: 0.15 }], 135, 'icon_axe_executioner',
  ),
  item_ironhold_shield: gear(
    'item_ironhold_shield', 'Ironhold Tower Shield',
    'A massive shield bearing the Ironhold Covenant seal.',
    ItemType.WEAPON_SHIELD, ItemRarity.RARE, 20, EquipmentSlot.OFF_HAND,
    [{ stat: 'armor', value: 40 }, { stat: 'block', value: 15 }, { stat: 'stamina', value: 8 }], 120, 'icon_shield_ironhold',
  ),

  // ──────────────────────────────────────────────────────────
  // ARMOR — Cloth (Mage, Necromancer, Cleric)
  // ──────────────────────────────────────────────────────────

  // Tier 1 — Level 1-5
  item_cloth_hat: gear(
    'item_cloth_hat', 'Linen Cap',
    'A simple linen cap.',
    ItemType.ARMOR_CLOTH, ItemRarity.COMMON, 1, EquipmentSlot.HEAD,
    [{ stat: 'armor', value: 2 }, { stat: 'intellect', value: 1 }], 4, 'icon_cloth_hat',
  ),
  item_cloth_robe: gear(
    'item_cloth_robe', 'Linen Robe',
    'A plain linen robe. Light and comfortable.',
    ItemType.ARMOR_CLOTH, ItemRarity.COMMON, 1, EquipmentSlot.CHEST,
    [{ stat: 'armor', value: 3 }, { stat: 'intellect', value: 2 }, { stat: 'spirit', value: 1 }], 6, 'icon_cloth_robe',
  ),
  item_cloth_leggings: gear(
    'item_cloth_leggings', 'Linen Leggings',
    'Simple cloth leggings.',
    ItemType.ARMOR_CLOTH, ItemRarity.COMMON, 1, EquipmentSlot.LEGS,
    [{ stat: 'armor', value: 2 }, { stat: 'intellect', value: 1 }], 5, 'icon_cloth_leggings',
  ),
  item_cloth_boots: gear(
    'item_cloth_boots', 'Linen Sandals',
    'Soft sandals for quiet walking.',
    ItemType.ARMOR_CLOTH, ItemRarity.COMMON, 1, EquipmentSlot.FEET,
    [{ stat: 'armor', value: 2 }, { stat: 'spirit', value: 1 }], 4, 'icon_cloth_boots',
  ),

  // Tier 2 — Level 10-15
  item_enchanted_cloth_hat: gear(
    'item_enchanted_cloth_hat', 'Enchanted Hood',
    'A hood woven with minor enchantments.',
    ItemType.ARMOR_CLOTH, ItemRarity.UNCOMMON, 10, EquipmentSlot.HEAD,
    [{ stat: 'armor', value: 8 }, { stat: 'intellect', value: 5 }, { stat: 'spirit', value: 3 }], 25, 'icon_cloth_hat_enchanted',
  ),
  item_enchanted_cloth_robe: gear(
    'item_enchanted_cloth_robe', 'Enchanted Vestments',
    'Robes that shimmer with faint arcane energy.',
    ItemType.ARMOR_CLOTH, ItemRarity.UNCOMMON, 10, EquipmentSlot.CHEST,
    [{ stat: 'armor', value: 12 }, { stat: 'intellect', value: 7 }, { stat: 'spirit', value: 4 }, { stat: 'spell_power', value: 4 }], 40, 'icon_cloth_robe_enchanted',
  ),
  item_enchanted_cloth_leggings: gear(
    'item_enchanted_cloth_leggings', 'Enchanted Leggings',
    'Leggings imbued with protective enchantments.',
    ItemType.ARMOR_CLOTH, ItemRarity.UNCOMMON, 10, EquipmentSlot.LEGS,
    [{ stat: 'armor', value: 10 }, { stat: 'intellect', value: 5 }, { stat: 'spirit', value: 3 }], 32, 'icon_cloth_leggings_enchanted',
  ),
  item_enchanted_cloth_boots: gear(
    'item_enchanted_cloth_boots', 'Enchanted Boots',
    'Boots that muffle the wearer\'s footsteps.',
    ItemType.ARMOR_CLOTH, ItemRarity.UNCOMMON, 10, EquipmentSlot.FEET,
    [{ stat: 'armor', value: 7 }, { stat: 'intellect', value: 4 }, { stat: 'spirit', value: 2 }], 24, 'icon_cloth_boots_enchanted',
  ),

  // Tier 3 — Level 20-25
  item_arcane_cloth_hat: gear(
    'item_arcane_cloth_hat', 'Arcane Circlet',
    'A circlet humming with raw arcane power.',
    ItemType.ARMOR_CLOTH, ItemRarity.RARE, 20, EquipmentSlot.HEAD,
    [{ stat: 'armor', value: 18 }, { stat: 'intellect', value: 10 }, { stat: 'spirit', value: 6 }, { stat: 'spell_power', value: 6 }, { stat: 'critical_chance', value: 2 }], 90, 'icon_cloth_hat_arcane',
  ),
  item_arcane_cloth_robe: gear(
    'item_arcane_cloth_robe', 'Arcane Vestments',
    'Robes woven from threads of pure mana.',
    ItemType.ARMOR_CLOTH, ItemRarity.RARE, 20, EquipmentSlot.CHEST,
    [{ stat: 'armor', value: 25 }, { stat: 'intellect', value: 14 }, { stat: 'spirit', value: 8 }, { stat: 'spell_power', value: 10 }], 140, 'icon_cloth_robe_arcane',
  ),
  item_arcane_cloth_leggings: gear(
    'item_arcane_cloth_leggings', 'Arcane Leggings',
    'Leggings that phase slightly in and out of reality.',
    ItemType.ARMOR_CLOTH, ItemRarity.RARE, 20, EquipmentSlot.LEGS,
    [{ stat: 'armor', value: 20 }, { stat: 'intellect', value: 11 }, { stat: 'spirit', value: 6 }, { stat: 'spell_power', value: 7 }], 110, 'icon_cloth_leggings_arcane',
  ),
  item_arcane_cloth_boots: gear(
    'item_arcane_cloth_boots', 'Arcane Boots',
    'Boots that leave faint trails of light.',
    ItemType.ARMOR_CLOTH, ItemRarity.RARE, 20, EquipmentSlot.FEET,
    [{ stat: 'armor', value: 14 }, { stat: 'intellect', value: 8 }, { stat: 'spirit', value: 5 }, { stat: 'haste', value: 3 }], 85, 'icon_cloth_boots_arcane',
  ),

  // ──────────────────────────────────────────────────────────
  // ARMOR — Leather (Ranger, Rogue, Druid)
  // ──────────────────────────────────────────────────────────

  // Tier 1
  item_leather_cap: gear('item_leather_cap', 'Leather Cap', 'A simple leather cap.', ItemType.ARMOR_LEATHER, ItemRarity.COMMON, 1, EquipmentSlot.HEAD, [{ stat: 'armor', value: 4 }, { stat: 'agility', value: 1 }], 5, 'icon_leather_cap'),
  item_leather_vest: gear('item_leather_vest', 'Leather Vest', 'A light leather vest.', ItemType.ARMOR_LEATHER, ItemRarity.COMMON, 1, EquipmentSlot.CHEST, [{ stat: 'armor', value: 6 }, { stat: 'agility', value: 2 }], 7, 'icon_leather_vest'),
  item_leather_leggings: gear('item_leather_leggings', 'Leather Leggings', 'Simple leather leggings.', ItemType.ARMOR_LEATHER, ItemRarity.COMMON, 1, EquipmentSlot.LEGS, [{ stat: 'armor', value: 5 }, { stat: 'agility', value: 1 }], 6, 'icon_leather_leggings'),
  item_leather_boots: gear('item_leather_boots', 'Leather Boots', 'Soft leather boots for quiet movement.', ItemType.ARMOR_LEATHER, ItemRarity.COMMON, 1, EquipmentSlot.FEET, [{ stat: 'armor', value: 4 }, { stat: 'agility', value: 1 }], 5, 'icon_leather_boots'),

  // Tier 2
  item_hardened_cap: gear('item_hardened_cap', 'Hardened Leather Cap', 'Leather hardened with tree sap.', ItemType.ARMOR_LEATHER, ItemRarity.UNCOMMON, 10, EquipmentSlot.HEAD, [{ stat: 'armor', value: 12 }, { stat: 'agility', value: 5 }, { stat: 'critical_chance', value: 1 }], 28, 'icon_leather_cap_hardened'),
  item_hardened_vest: gear('item_hardened_vest', 'Hardened Leather Vest', 'A vest treated for extra protection.', ItemType.ARMOR_LEATHER, ItemRarity.UNCOMMON, 10, EquipmentSlot.CHEST, [{ stat: 'armor', value: 18 }, { stat: 'agility', value: 7 }, { stat: 'stamina', value: 3 }], 42, 'icon_leather_vest_hardened'),
  item_hardened_leggings: gear('item_hardened_leggings', 'Hardened Leather Leggings', 'Reinforced leggings.', ItemType.ARMOR_LEATHER, ItemRarity.UNCOMMON, 10, EquipmentSlot.LEGS, [{ stat: 'armor', value: 15 }, { stat: 'agility', value: 5 }, { stat: 'stamina', value: 2 }], 34, 'icon_leather_leggings_hardened'),
  item_hardened_boots: gear('item_hardened_boots', 'Hardened Leather Boots', 'Boots with reinforced soles.', ItemType.ARMOR_LEATHER, ItemRarity.UNCOMMON, 10, EquipmentSlot.FEET, [{ stat: 'armor', value: 10 }, { stat: 'agility', value: 4 }, { stat: 'dodge', value: 2 }], 26, 'icon_leather_boots_hardened'),

  // Tier 3
  item_shadow_cap: gear('item_shadow_cap', 'Shadow Hood', 'A hood woven with threads of shadow.', ItemType.ARMOR_LEATHER, ItemRarity.RARE, 20, EquipmentSlot.HEAD, [{ stat: 'armor', value: 24 }, { stat: 'agility', value: 10 }, { stat: 'critical_chance', value: 3 }, { stat: 'dodge', value: 2 }], 95, 'icon_leather_cap_shadow'),
  item_shadow_vest: gear('item_shadow_vest', 'Shadow Jerkin', 'Leather that seems to absorb light.', ItemType.ARMOR_LEATHER, ItemRarity.RARE, 20, EquipmentSlot.CHEST, [{ stat: 'armor', value: 32 }, { stat: 'agility', value: 14 }, { stat: 'stamina', value: 6 }, { stat: 'attack_power', value: 6 }], 145, 'icon_leather_vest_shadow'),
  item_shadow_leggings: gear('item_shadow_leggings', 'Shadow Leggings', 'Leggings as dark as midnight.', ItemType.ARMOR_LEATHER, ItemRarity.RARE, 20, EquipmentSlot.LEGS, [{ stat: 'armor', value: 28 }, { stat: 'agility', value: 11 }, { stat: 'critical_chance', value: 2 }, { stat: 'stamina', value: 4 }], 115, 'icon_leather_leggings_shadow'),
  item_shadow_boots: gear('item_shadow_boots', 'Shadow Boots', 'Boots that leave no footprints.', ItemType.ARMOR_LEATHER, ItemRarity.RARE, 20, EquipmentSlot.FEET, [{ stat: 'armor', value: 20 }, { stat: 'agility', value: 8 }, { stat: 'dodge', value: 4 }, { stat: 'haste', value: 3 }], 88, 'icon_leather_boots_shadow'),

  // ──────────────────────────────────────────────────────────
  // ARMOR — Mail (Paladin, Warrior light)
  // ──────────────────────────────────────────────────────────

  item_chain_coif: gear('item_chain_coif', 'Chain Coif', 'A simple chain mail hood.', ItemType.ARMOR_MAIL, ItemRarity.COMMON, 1, EquipmentSlot.HEAD, [{ stat: 'armor', value: 7 }, { stat: 'strength', value: 1 }], 6, 'icon_mail_coif'),
  item_chain_vest: gear('item_chain_vest', 'Chain Vest', 'A vest of interlocking metal rings.', ItemType.ARMOR_MAIL, ItemRarity.COMMON, 1, EquipmentSlot.CHEST, [{ stat: 'armor', value: 10 }, { stat: 'strength', value: 1 }, { stat: 'stamina', value: 1 }], 8, 'icon_mail_vest'),
  item_chain_leggings: gear('item_chain_leggings', 'Chain Leggings', 'Chain mail leggings.', ItemType.ARMOR_MAIL, ItemRarity.COMMON, 1, EquipmentSlot.LEGS, [{ stat: 'armor', value: 8 }, { stat: 'strength', value: 1 }], 7, 'icon_mail_leggings'),
  item_chain_boots: gear('item_chain_boots', 'Chain Boots', 'Boots reinforced with chain links.', ItemType.ARMOR_MAIL, ItemRarity.COMMON, 1, EquipmentSlot.FEET, [{ stat: 'armor', value: 6 }, { stat: 'strength', value: 1 }], 6, 'icon_mail_boots'),

  item_reinforced_coif: gear('item_reinforced_coif', 'Reinforced Coif', 'Chain mail with extra plates.', ItemType.ARMOR_MAIL, ItemRarity.UNCOMMON, 10, EquipmentSlot.HEAD, [{ stat: 'armor', value: 18 }, { stat: 'strength', value: 4 }, { stat: 'stamina', value: 3 }], 30, 'icon_mail_coif_reinforced'),
  item_reinforced_vest: gear('item_reinforced_vest', 'Reinforced Hauberk', 'A hauberk with riveted plates at vital areas.', ItemType.ARMOR_MAIL, ItemRarity.UNCOMMON, 10, EquipmentSlot.CHEST, [{ stat: 'armor', value: 25 }, { stat: 'strength', value: 5 }, { stat: 'stamina', value: 5 }], 45, 'icon_mail_vest_reinforced'),
  item_reinforced_leggings: gear('item_reinforced_leggings', 'Reinforced Leggings', 'Leggings with padded lining.', ItemType.ARMOR_MAIL, ItemRarity.UNCOMMON, 10, EquipmentSlot.LEGS, [{ stat: 'armor', value: 20 }, { stat: 'strength', value: 4 }, { stat: 'stamina', value: 3 }], 36, 'icon_mail_leggings_reinforced'),
  item_reinforced_boots: gear('item_reinforced_boots', 'Reinforced Boots', 'Heavy boots with steel toe caps.', ItemType.ARMOR_MAIL, ItemRarity.UNCOMMON, 10, EquipmentSlot.FEET, [{ stat: 'armor', value: 14 }, { stat: 'strength', value: 3 }, { stat: 'stamina', value: 2 }], 28, 'icon_mail_boots_reinforced'),

  item_ironhold_coif: gear('item_ironhold_coif', 'Ironhold Warhelm', 'A warhelm forged by Ironhold smiths.', ItemType.ARMOR_MAIL, ItemRarity.RARE, 20, EquipmentSlot.HEAD, [{ stat: 'armor', value: 35 }, { stat: 'strength', value: 8 }, { stat: 'stamina', value: 6 }, { stat: 'block', value: 3 }], 100, 'icon_mail_coif_ironhold'),
  item_ironhold_vest: gear('item_ironhold_vest', 'Ironhold Chainmail', 'Masterwork chainmail from the Covenant forges.', ItemType.ARMOR_MAIL, ItemRarity.RARE, 20, EquipmentSlot.CHEST, [{ stat: 'armor', value: 48 }, { stat: 'strength', value: 10 }, { stat: 'stamina', value: 10 }, { stat: 'attack_power', value: 5 }], 155, 'icon_mail_vest_ironhold'),
  item_ironhold_leggings: gear('item_ironhold_leggings', 'Ironhold Legguards', 'Heavy legguards with knee plates.', ItemType.ARMOR_MAIL, ItemRarity.RARE, 20, EquipmentSlot.LEGS, [{ stat: 'armor', value: 40 }, { stat: 'strength', value: 8 }, { stat: 'stamina', value: 7 }], 120, 'icon_mail_leggings_ironhold'),
  item_ironhold_boots: gear('item_ironhold_boots', 'Ironhold Warboots', 'Boots designed for long marches.', ItemType.ARMOR_MAIL, ItemRarity.RARE, 20, EquipmentSlot.FEET, [{ stat: 'armor', value: 28 }, { stat: 'strength', value: 6 }, { stat: 'stamina', value: 5 }], 90, 'icon_mail_boots_ironhold'),

  // ──────────────────────────────────────────────────────────
  // ARMOR — Plate (Warrior, Paladin)
  // ──────────────────────────────────────────────────────────

  item_rusted_plate_helm: gear('item_rusted_plate_helm', 'Rusted Plate Helm', 'A heavy helm covered in rust.', ItemType.ARMOR_PLATE, ItemRarity.COMMON, 1, EquipmentSlot.HEAD, [{ stat: 'armor', value: 10 }, { stat: 'strength', value: 1 }, { stat: 'stamina', value: 1 }], 7, 'icon_plate_helm_rusted'),
  item_rusted_plate_chest: gear('item_rusted_plate_chest', 'Rusted Breastplate', 'A dented breastplate. Heavy but protective.', ItemType.ARMOR_PLATE, ItemRarity.COMMON, 1, EquipmentSlot.CHEST, [{ stat: 'armor', value: 14 }, { stat: 'strength', value: 1 }, { stat: 'stamina', value: 1 }], 10, 'icon_plate_chest_rusted'),
  item_rusted_plate_legs: gear('item_rusted_plate_legs', 'Rusted Plate Leggings', 'Heavy plate leggings.', ItemType.ARMOR_PLATE, ItemRarity.COMMON, 1, EquipmentSlot.LEGS, [{ stat: 'armor', value: 12 }, { stat: 'strength', value: 1 }], 8, 'icon_plate_legs_rusted'),
  item_rusted_plate_boots: gear('item_rusted_plate_boots', 'Rusted Plate Boots', 'Heavy boots that clang with every step.', ItemType.ARMOR_PLATE, ItemRarity.COMMON, 1, EquipmentSlot.FEET, [{ stat: 'armor', value: 8 }, { stat: 'strength', value: 1 }], 7, 'icon_plate_boots_rusted'),

  item_iron_plate_helm: gear('item_iron_plate_helm', 'Iron Plate Helm', 'A solid iron helm.', ItemType.ARMOR_PLATE, ItemRarity.UNCOMMON, 10, EquipmentSlot.HEAD, [{ stat: 'armor', value: 22 }, { stat: 'strength', value: 4 }, { stat: 'stamina', value: 4 }], 32, 'icon_plate_helm_iron'),
  item_iron_plate_chest: gear('item_iron_plate_chest', 'Iron Breastplate', 'A well-forged iron breastplate.', ItemType.ARMOR_PLATE, ItemRarity.UNCOMMON, 10, EquipmentSlot.CHEST, [{ stat: 'armor', value: 30 }, { stat: 'strength', value: 5 }, { stat: 'stamina', value: 6 }], 48, 'icon_plate_chest_iron'),
  item_iron_plate_legs: gear('item_iron_plate_legs', 'Iron Plate Leggings', 'Iron plate leggings with joint articulation.', ItemType.ARMOR_PLATE, ItemRarity.UNCOMMON, 10, EquipmentSlot.LEGS, [{ stat: 'armor', value: 25 }, { stat: 'strength', value: 4 }, { stat: 'stamina', value: 4 }], 38, 'icon_plate_legs_iron'),
  item_iron_plate_boots: gear('item_iron_plate_boots', 'Iron Plate Boots', 'Heavy iron boots.', ItemType.ARMOR_PLATE, ItemRarity.UNCOMMON, 10, EquipmentSlot.FEET, [{ stat: 'armor', value: 16 }, { stat: 'strength', value: 3 }, { stat: 'stamina', value: 3 }], 30, 'icon_plate_boots_iron'),

  item_steel_plate_helm: gear('item_steel_plate_helm', 'Steel Greathelm', 'A gleaming steel greathelm.', ItemType.ARMOR_PLATE, ItemRarity.RARE, 20, EquipmentSlot.HEAD, [{ stat: 'armor', value: 42 }, { stat: 'strength', value: 8 }, { stat: 'stamina', value: 8 }, { stat: 'block', value: 4 }], 105, 'icon_plate_helm_steel'),
  item_steel_plate_chest: gear('item_steel_plate_chest', 'Steel Cuirass', 'A masterwork steel cuirass.', ItemType.ARMOR_PLATE, ItemRarity.RARE, 20, EquipmentSlot.CHEST, [{ stat: 'armor', value: 58 }, { stat: 'strength', value: 10 }, { stat: 'stamina', value: 12 }, { stat: 'block', value: 5 }], 160, 'icon_plate_chest_steel'),
  item_steel_plate_legs: gear('item_steel_plate_legs', 'Steel Plate Leggings', 'Articulated steel plate leggings.', ItemType.ARMOR_PLATE, ItemRarity.RARE, 20, EquipmentSlot.LEGS, [{ stat: 'armor', value: 48 }, { stat: 'strength', value: 8 }, { stat: 'stamina', value: 8 }, { stat: 'block', value: 3 }], 125, 'icon_plate_legs_steel'),
  item_steel_plate_boots: gear('item_steel_plate_boots', 'Steel Sabatons', 'Heavy steel sabatons.', ItemType.ARMOR_PLATE, ItemRarity.RARE, 20, EquipmentSlot.FEET, [{ stat: 'armor', value: 32 }, { stat: 'strength', value: 6 }, { stat: 'stamina', value: 6 }], 95, 'icon_plate_boots_steel'),

  // ──────────────────────────────────────────────────────────
  // ACCESSORIES
  // ──────────────────────────────────────────────────────────

  // Tier 1
  item_copper_ring: gear('item_copper_ring', 'Copper Ring', 'A simple copper band.', ItemType.ACCESSORY_RING, ItemRarity.COMMON, 1, EquipmentSlot.RING_1, [{ stat: 'stamina', value: 1 }], 3, 'icon_ring_copper'),
  item_copper_necklace: gear('item_copper_necklace', 'Copper Pendant', 'A pendant on a copper chain.', ItemType.ACCESSORY_NECKLACE, ItemRarity.COMMON, 1, EquipmentSlot.NECKLACE, [{ stat: 'spirit', value: 1 }], 3, 'icon_necklace_copper'),
  item_lucky_charm: gear('item_lucky_charm', 'Lucky Charm', 'A small carved wooden charm. Might bring luck.', ItemType.ACCESSORY_TRINKET, ItemRarity.COMMON, 1, EquipmentSlot.TRINKET, [{ stat: 'critical_chance', value: 1 }], 5, 'icon_trinket_charm'),

  // Tier 2
  item_silver_ring: gear('item_silver_ring', 'Silver Ring', 'A polished silver ring.', ItemType.ACCESSORY_RING, ItemRarity.UNCOMMON, 10, EquipmentSlot.RING_1, [{ stat: 'strength', value: 3 }, { stat: 'stamina', value: 2 }], 20, 'icon_ring_silver'),
  item_silver_necklace: gear('item_silver_necklace', 'Silver Amulet', 'An amulet set with a small sapphire.', ItemType.ACCESSORY_NECKLACE, ItemRarity.UNCOMMON, 10, EquipmentSlot.NECKLACE, [{ stat: 'intellect', value: 4 }, { stat: 'spirit', value: 3 }], 22, 'icon_necklace_silver'),
  item_rangers_trinket: gear('item_rangers_trinket', 'Ranger\'s Compass', 'A compass that always points toward danger.', ItemType.ACCESSORY_TRINKET, ItemRarity.UNCOMMON, 10, EquipmentSlot.TRINKET, [{ stat: 'agility', value: 4 }, { stat: 'dodge', value: 2 }], 25, 'icon_trinket_compass'),

  // Tier 3
  item_gold_ring: gear('item_gold_ring', 'Gold Signet Ring', 'A gold ring bearing an unknown crest.', ItemType.ACCESSORY_RING, ItemRarity.RARE, 20, EquipmentSlot.RING_1, [{ stat: 'strength', value: 6 }, { stat: 'stamina', value: 5 }, { stat: 'attack_power', value: 4 }], 75, 'icon_ring_gold'),
  item_gold_necklace: gear('item_gold_necklace', 'Gold Talisman', 'A talisman radiating faint warmth.', ItemType.ACCESSORY_NECKLACE, ItemRarity.RARE, 20, EquipmentSlot.NECKLACE, [{ stat: 'intellect', value: 8 }, { stat: 'spirit', value: 6 }, { stat: 'spell_power', value: 5 }], 80, 'icon_necklace_gold'),
  item_guardians_eye: gear('item_guardians_eye', 'Guardian\'s Eye', 'A petrified eye from a Forest Guardian. Pulses with nature energy.', ItemType.ACCESSORY_TRINKET, ItemRarity.RARE, 20, EquipmentSlot.TRINKET, [{ stat: 'nature_resist', value: 15 }, { stat: 'stamina', value: 8 }, { stat: 'spirit', value: 5 }], 90, 'icon_trinket_eye'),

  // ──────────────────────────────────────────────────────────
  // CONSUMABLES — Potions
  // ──────────────────────────────────────────────────────────

  item_minor_health_potion: consumable(
    'item_minor_health_potion', 'Minor Health Potion',
    'Restores a small amount of health.', ItemRarity.COMMON, 1, 8, 'icon_potion_hp_minor',
    [{ type: 'heal_hp', value: 50, description: 'Restores 50 HP' }],
  ),
  item_lesser_health_potion: consumable(
    'item_lesser_health_potion', 'Lesser Health Potion',
    'Restores a moderate amount of health.', ItemRarity.COMMON, 10, 20, 'icon_potion_hp_lesser',
    [{ type: 'heal_hp', value: 200, description: 'Restores 200 HP' }],
  ),
  item_health_potion: consumable(
    'item_health_potion', 'Health Potion',
    'Restores a significant amount of health.', ItemRarity.UNCOMMON, 20, 50, 'icon_potion_hp',
    [{ type: 'heal_hp', value: 500, description: 'Restores 500 HP' }],
  ),
  item_greater_health_potion: consumable(
    'item_greater_health_potion', 'Greater Health Potion',
    'Restores a large amount of health.', ItemRarity.RARE, 30, 120, 'icon_potion_hp_greater',
    [{ type: 'heal_hp', value: 1200, description: 'Restores 1200 HP' }],
  ),
  item_minor_mana_potion: consumable(
    'item_minor_mana_potion', 'Minor Mana Potion',
    'Restores a small amount of mana.', ItemRarity.COMMON, 1, 8, 'icon_potion_mp_minor',
    [{ type: 'heal_mana', value: 40, description: 'Restores 40 MP' }],
  ),
  item_mana_potion: consumable(
    'item_mana_potion', 'Mana Potion',
    'Restores a moderate amount of mana.', ItemRarity.COMMON, 10, 20, 'icon_potion_mp',
    [{ type: 'heal_mana', value: 150, description: 'Restores 150 MP' }],
  ),
  item_greater_mana_potion: consumable(
    'item_greater_mana_potion', 'Greater Mana Potion',
    'Restores a large amount of mana.', ItemRarity.UNCOMMON, 20, 50, 'icon_potion_mp_greater',
    [{ type: 'heal_mana', value: 400, description: 'Restores 400 MP' }],
  ),

  // ──────────────────────────────────────────────────────────
  // CONSUMABLES — Food
  // ──────────────────────────────────────────────────────────

  item_bread: food('item_bread', 'Fresh Bread', 'A warm loaf of bread. Filling and nutritious.', ItemRarity.COMMON, 1, 3, 'icon_food_bread', [{ type: 'heal_hp', value: 30, description: 'Restores 30 HP over 10s' }]),
  item_dried_meat: food('item_dried_meat', 'Dried Meat', 'Strips of salted, dried meat. Long-lasting rations.', ItemRarity.COMMON, 5, 6, 'icon_food_meat', [{ type: 'heal_hp', value: 80, description: 'Restores 80 HP over 10s' }]),
  item_vegetable_stew: food('item_vegetable_stew', 'Vegetable Stew', 'A hearty stew of root vegetables.', ItemRarity.COMMON, 10, 15, 'icon_food_stew', [{ type: 'heal_hp', value: 200, description: 'Restores 200 HP over 10s' }, { type: 'buff', value: 5, duration: 600, description: '+5 Stamina for 10 min' }]),
  item_grilled_fish: food('item_grilled_fish', 'Grilled Fish', 'Freshly grilled river fish.', ItemRarity.UNCOMMON, 15, 25, 'icon_food_fish', [{ type: 'heal_hp', value: 350, description: 'Restores 350 HP over 10s' }, { type: 'buff', value: 5, duration: 600, description: '+5 Agility for 10 min' }]),
  item_royal_feast: food('item_royal_feast', 'Royal Feast', 'A lavish spread fit for a king. Provides excellent nourishment.', ItemRarity.RARE, 25, 80, 'icon_food_feast', [{ type: 'heal_hp', value: 600, description: 'Restores 600 HP over 10s' }, { type: 'buff', value: 10, duration: 1200, description: '+10 all primary stats for 20 min' }]),

  // ──────────────────────────────────────────────────────────
  // MATERIALS — Herbs
  // ──────────────────────────────────────────────────────────

  item_silverleaf: mat('item_silverleaf', 'Silverleaf', 'A common herb with silvery leaves. Found in meadows.', ItemType.MATERIAL_HERB, ItemRarity.COMMON, 2, 'icon_herb_silverleaf'),
  item_peacebloom: mat('item_peacebloom', 'Peacebloom', 'A calming flower that blooms near settlements.', ItemType.MATERIAL_HERB, ItemRarity.COMMON, 3, 'icon_herb_peacebloom'),
  item_mageroyal: mat('item_mageroyal', 'Mageroyal', 'A flower that crackles faintly with arcane energy.', ItemType.MATERIAL_HERB, ItemRarity.UNCOMMON, 8, 'icon_herb_mageroyal'),
  item_briarthorn: mat('item_briarthorn', 'Briarthorn', 'A thorny vine with alchemical properties.', ItemType.MATERIAL_HERB, ItemRarity.UNCOMMON, 10, 'icon_herb_briarthorn'),
  item_swiftthistle: mat('item_swiftthistle', 'Swiftthistle', 'A rare herb that grants unnatural speed to potions.', ItemType.MATERIAL_HERB, ItemRarity.RARE, 25, 'icon_herb_swiftthistle'),

  // ──────────────────────────────────────────────────────────
  // MATERIALS — Ores
  // ──────────────────────────────────────────────────────────

  item_copper_ore: mat('item_copper_ore', 'Copper Ore', 'A chunk of raw copper ore.', ItemType.MATERIAL_ORE, ItemRarity.COMMON, 3, 'icon_ore_copper'),
  item_tin_ore: mat('item_tin_ore', 'Tin Ore', 'A chunk of raw tin ore.', ItemType.MATERIAL_ORE, ItemRarity.COMMON, 3, 'icon_ore_tin'),
  item_iron_ore: mat('item_iron_ore', 'Iron Ore', 'A chunk of raw iron ore. Strong and versatile.', ItemType.MATERIAL_ORE, ItemRarity.UNCOMMON, 10, 'icon_ore_iron'),
  item_steel_ingot: mat('item_steel_ingot', 'Steel Ingot', 'A bar of refined steel.', ItemType.MATERIAL_ORE, ItemRarity.UNCOMMON, 20, 'icon_ore_steel'),
  item_mithril_ore: mat('item_mithril_ore', 'Mithril Ore', 'An incredibly rare ore that glows faintly blue.', ItemType.MATERIAL_ORE, ItemRarity.RARE, 60, 'icon_ore_mithril'),

  // ──────────────────────────────────────────────────────────
  // MATERIALS — Leather
  // ──────────────────────────────────────────────────────────

  item_light_leather: mat('item_light_leather', 'Light Leather', 'A thin piece of tanned leather.', ItemType.MATERIAL_LEATHER, ItemRarity.COMMON, 4, 'icon_leather_light'),
  item_medium_leather: mat('item_medium_leather', 'Medium Leather', 'A sturdy piece of leather.', ItemType.MATERIAL_LEATHER, ItemRarity.UNCOMMON, 12, 'icon_leather_medium'),
  item_heavy_leather: mat('item_heavy_leather', 'Heavy Leather', 'A thick, tough piece of leather.', ItemType.MATERIAL_LEATHER, ItemRarity.RARE, 30, 'icon_leather_heavy'),

  // ──────────────────────────────────────────────────────────
  // MATERIALS — Cloth
  // ──────────────────────────────────────────────────────────

  item_linen_cloth: mat('item_linen_cloth', 'Linen Cloth', 'A bolt of rough linen fabric.', ItemType.MATERIAL_CLOTH, ItemRarity.COMMON, 3, 'icon_cloth_linen'),
  item_wool_cloth: mat('item_wool_cloth', 'Wool Cloth', 'A bolt of soft wool fabric.', ItemType.MATERIAL_CLOTH, ItemRarity.UNCOMMON, 10, 'icon_cloth_wool'),
  item_silk_cloth: mat('item_silk_cloth', 'Silk Cloth', 'A bolt of fine silk. Smooth to the touch.', ItemType.MATERIAL_CLOTH, ItemRarity.RARE, 28, 'icon_cloth_silk'),

  // ──────────────────────────────────────────────────────────
  // QUEST ITEMS
  // ──────────────────────────────────────────────────────────

  item_wolf_pelt: quest('item_wolf_pelt', 'Wolf Pelt', 'The pelt of a forest wolf. Proof of a hunt.', 'icon_quest_pelt'),
  item_goblin_totem: quest('item_goblin_totem', 'Goblin Totem', 'A crude wooden totem covered in goblin markings.', 'icon_quest_totem'),
  item_stolen_goods: quest('item_stolen_goods', 'Stolen Goods', 'Merchandise taken from honest traders. Should be returned.', 'icon_quest_goods'),
  item_stone_core: quest('item_stone_core', 'Stone Core', 'A crystallized core of elemental energy.', 'icon_quest_stone'),
  item_dragon_scale: quest('item_dragon_scale', 'Dragon Scale', 'A massive scale shed by an ancient dragon. Radiates heat.', 'icon_quest_scale'),

  // ──────────────────────────────────────────────────────────
  // DROP / LORE ITEMS (used in loot tables)
  // ──────────────────────────────────────────────────────────

  item_wolf_fang: mat('item_wolf_fang', 'Wolf Fang', 'A sharp canine tooth.', ItemType.MATERIAL_LEATHER, ItemRarity.COMMON, 2, 'icon_mat_fang'),
  item_raw_meat: mat('item_raw_meat', 'Raw Meat', 'Uncooked meat. Could be sold or cooked.', ItemType.MATERIAL_HERB, ItemRarity.COMMON, 2, 'icon_mat_meat'),
  item_copper_coin: mat('item_copper_coin', 'Copper Coins', 'A handful of copper coins.', ItemType.CURRENCY, ItemRarity.COMMON, 1, 'icon_currency_copper', 999),
  item_silver_coin: mat('item_silver_coin', 'Silver Coins', 'A handful of silver coins.', ItemType.CURRENCY, ItemRarity.COMMON, 1, 'icon_currency_silver', 999),
  item_gold_coin: mat('item_gold_coin', 'Gold Coins', 'A handful of gold coins.', ItemType.CURRENCY, ItemRarity.COMMON, 1, 'icon_currency_gold', 999),
  item_boar_hide: mat('item_boar_hide', 'Boar Hide', 'Thick hide from a wild boar.', ItemType.MATERIAL_LEATHER, ItemRarity.COMMON, 4, 'icon_mat_hide'),
  item_boar_tusk: mat('item_boar_tusk', 'Boar Tusk', 'A curved tusk. Can be carved or sold.', ItemType.MATERIAL_LEATHER, ItemRarity.COMMON, 5, 'icon_mat_tusk'),
  item_rat_tail: mat('item_rat_tail', 'Rat Tail', 'A slimy rat tail. Alchemists buy these.', ItemType.MATERIAL_HERB, ItemRarity.COMMON, 1, 'icon_mat_tail'),
  item_snake_venom_sac: mat('item_snake_venom_sac', 'Venom Sac', 'A sac of concentrated snake venom.', ItemType.MATERIAL_HERB, ItemRarity.COMMON, 6, 'icon_mat_venom'),
  item_snake_skin: mat('item_snake_skin', 'Snake Skin', 'A shed snakeskin. Useful in leatherworking.', ItemType.MATERIAL_LEATHER, ItemRarity.COMMON, 4, 'icon_mat_snakeskin'),
  item_goblin_ear: mat('item_goblin_ear', 'Goblin Ear', 'A severed goblin ear. Bounty proof.', ItemType.MATERIAL_HERB, ItemRarity.COMMON, 5, 'icon_mat_ear'),
  item_patchwork_armor_scrap: mat('item_patchwork_armor_scrap', 'Armor Scrap', 'A scrap of mismatched armor.', ItemType.MATERIAL_ORE, ItemRarity.COMMON, 6, 'icon_mat_scrap'),
  item_goblin_tooth_necklace: gear('item_goblin_tooth_necklace', 'Goblin Tooth Necklace', 'A crude necklace of strung teeth. Surprisingly sturdy.', ItemType.ACCESSORY_NECKLACE, ItemRarity.UNCOMMON, 6, EquipmentSlot.NECKLACE, [{ stat: 'strength', value: 2 }, { stat: 'stamina', value: 1 }], 15, 'icon_necklace_teeth'),
  item_bandit_mask: gear('item_bandit_mask', 'Bandit Mask', 'A dark cloth mask. Perfect for concealing identity.', ItemType.ARMOR_CLOTH, ItemRarity.UNCOMMON, 5, EquipmentSlot.HEAD, [{ stat: 'agility', value: 3 }, { stat: 'dodge', value: 1 }], 12, 'icon_mask_bandit'),
  item_bone_fragment: mat('item_bone_fragment', 'Bone Fragment', 'A piece of ancient bone.', ItemType.MATERIAL_HERB, ItemRarity.COMMON, 2, 'icon_mat_bone'),
  item_tattered_cloth: mat('item_tattered_cloth', 'Tattered Cloth', 'Ragged cloth from undead wrappings.', ItemType.MATERIAL_CLOTH, ItemRarity.COMMON, 2, 'icon_mat_tattered'),
  item_ancient_coin: mat('item_ancient_coin', 'Ancient Coin', 'A coin from before The Sundering.', ItemType.CURRENCY, ItemRarity.UNCOMMON, 50, 'icon_currency_ancient', 100),
  item_spider_silk: mat('item_spider_silk', 'Spider Silk', 'Strong, flexible silk from a forest spider.', ItemType.MATERIAL_CLOTH, ItemRarity.UNCOMMON, 10, 'icon_mat_silk'),
  item_spider_venom_sac: mat('item_spider_venom_sac', 'Spider Venom Sac', 'A potent venom sac.', ItemType.MATERIAL_HERB, ItemRarity.UNCOMMON, 12, 'icon_mat_spider_venom'),
  item_spider_eye: mat('item_spider_eye', 'Spider Eye', 'A multifaceted spider eye. Used in alchemy.', ItemType.MATERIAL_HERB, ItemRarity.COMMON, 6, 'icon_mat_eye'),
  item_dark_wolf_pelt: mat('item_dark_wolf_pelt', 'Dark Wolf Pelt', 'A pitch-black pelt that seems to absorb light.', ItemType.MATERIAL_LEATHER, ItemRarity.UNCOMMON, 15, 'icon_mat_pelt_dark'),
  item_shadow_essence: mat('item_shadow_essence', 'Shadow Essence', 'A swirling mote of shadow energy.', ItemType.MATERIAL_ESSENCE, ItemRarity.UNCOMMON, 20, 'icon_mat_shadow'),
  item_rotting_flesh: mat('item_rotting_flesh', 'Rotting Flesh', 'Putrid flesh from a zombie. Handle with care.', ItemType.MATERIAL_HERB, ItemRarity.COMMON, 2, 'icon_mat_flesh'),
  item_elemental_dust: mat('item_elemental_dust', 'Elemental Dust', 'Glowing dust from destroyed elementals.', ItemType.MATERIAL_ESSENCE, ItemRarity.UNCOMMON, 18, 'icon_mat_dust'),
  item_captains_signet: gear('item_captains_signet', 'Captain\'s Signet Ring', 'A signet ring taken from a bandit captain.', ItemType.ACCESSORY_RING, ItemRarity.UNCOMMON, 12, EquipmentSlot.RING_1, [{ stat: 'strength', value: 4 }, { stat: 'attack_power', value: 3 }], 30, 'icon_ring_signet'),
  item_shaman_staff: gear('item_shaman_staff', 'Shaman\'s Crooked Staff', 'A staff adorned with feathers and bones.', ItemType.WEAPON_STAFF, ItemRarity.UNCOMMON, 11, EquipmentSlot.MAIN_HAND, [{ stat: 'spell_power', value: 16 }, { stat: 'spirit', value: 6 }], 42, 'icon_staff_shaman'),
  item_chiefs_axe: gear('item_chiefs_axe', 'Chief\'s Cleaver', 'The goblin chief\'s signature weapon.', ItemType.WEAPON_AXE, ItemRarity.RARE, 18, EquipmentSlot.MAIN_HAND, [{ stat: 'attack_power', value: 24 }, { stat: 'strength', value: 8 }, { stat: 'critical_damage', value: 0.1 }], 90, 'icon_axe_chief'),
  item_chiefs_armor: gear('item_chiefs_armor', 'Chief\'s Patchwork Armor', 'Surprisingly effective armor cobbled from many sources.', ItemType.ARMOR_MAIL, ItemRarity.RARE, 18, EquipmentSlot.CHEST, [{ stat: 'armor', value: 36 }, { stat: 'strength', value: 7 }, { stat: 'stamina', value: 8 }], 100, 'icon_mail_chief'),
  item_ancient_wood: mat('item_ancient_wood', 'Ancient Heartwood', 'Wood from a tree that stood for millennia.', ItemType.MATERIAL_CLOTH, ItemRarity.UNCOMMON, 25, 'icon_mat_wood'),
  item_natures_essence: mat('item_natures_essence', 'Nature\'s Essence', 'Pure concentrated life energy.', ItemType.MATERIAL_ESSENCE, ItemRarity.RARE, 45, 'icon_mat_nature'),
  item_guardians_bark: mat('item_guardians_bark', 'Guardian\'s Bark', 'Bark from a Forest Guardian. Incredibly tough.', ItemType.MATERIAL_LEATHER, ItemRarity.RARE, 55, 'icon_mat_bark'),
  item_guardian_staff: gear('item_guardian_staff', 'Staff of the Forest Guardian', 'A staff carved from the heartwood of a living tree.', ItemType.WEAPON_STAFF, ItemRarity.EPIC, 20, EquipmentSlot.MAIN_HAND, [{ stat: 'spell_power', value: 38 }, { stat: 'intellect', value: 14 }, { stat: 'spirit', value: 10 }, { stat: 'nature_resist', value: 15 }], 250, 'icon_staff_guardian'),
  item_dragon_fang: mat('item_dragon_fang', 'Dragon Fang', 'A massive fang from an ancient dragon.', ItemType.MATERIAL_ESSENCE, ItemRarity.RARE, 100, 'icon_mat_dragon_fang'),
  item_dragon_heart: mat('item_dragon_heart', 'Dragon Heart', 'The still-beating heart of a dragon. Tremendous power.', ItemType.MATERIAL_ESSENCE, ItemRarity.EPIC, 300, 'icon_mat_dragon_heart'),
  item_ancient_dragon_blade: gear('item_ancient_dragon_blade', 'Draconic Claymore', 'A massive blade forged from dragon bone and scale.', ItemType.WEAPON_SWORD, ItemRarity.EPIC, 25, EquipmentSlot.MAIN_HAND, [{ stat: 'attack_power', value: 45 }, { stat: 'strength', value: 15 }, { stat: 'critical_chance', value: 5 }, { stat: 'fire_resist', value: 20 }], 500, 'icon_sword_dragon'),
  item_dragons_breath_staff: gear('item_dragons_breath_staff', 'Dragon\'s Breath Staff', 'A staff topped with a dragon\'s eye crystal.', ItemType.WEAPON_STAFF, ItemRarity.EPIC, 25, EquipmentSlot.MAIN_HAND, [{ stat: 'spell_power', value: 42 }, { stat: 'intellect', value: 16 }, { stat: 'spirit', value: 10 }, { stat: 'fire_resist', value: 20 }], 500, 'icon_staff_dragon'),
  item_dragon_scale_armor: gear('item_dragon_scale_armor', 'Dragon Scale Cuirass', 'Armor fashioned from ancient dragon scales.', ItemType.ARMOR_MAIL, ItemRarity.EPIC, 25, EquipmentSlot.CHEST, [{ stat: 'armor', value: 70 }, { stat: 'strength', value: 14 }, { stat: 'stamina', value: 15 }, { stat: 'fire_resist', value: 25 }], 500, 'icon_mail_dragon'),
  item_giants_ring: gear('item_giants_ring', 'Giant\'s Ring', 'A massive ring that somehow fits your finger.', ItemType.ACCESSORY_RING, ItemRarity.UNCOMMON, 25, EquipmentSlot.RING_1, [{ stat: 'strength', value: 8 }, { stat: 'stamina', value: 6 }], 65, 'icon_ring_giant'),
  item_earthen_amulet: gear('item_earthen_amulet', 'Earthen Amulet', 'An amulet of polished stone that hums with power.', ItemType.ACCESSORY_NECKLACE, ItemRarity.RARE, 27, EquipmentSlot.NECKLACE, [{ stat: 'stamina', value: 10 }, { stat: 'armor', value: 15 }, { stat: 'nature_resist', value: 10 }], 95, 'icon_necklace_earth'),
  item_overlords_blade: gear('item_overlords_blade', 'Overlord\'s Falchion', 'The bandit overlord\'s prized weapon.', ItemType.WEAPON_SWORD, ItemRarity.RARE, 28, EquipmentSlot.MAIN_HAND, [{ stat: 'attack_power', value: 35 }, { stat: 'strength', value: 10 }, { stat: 'critical_chance', value: 4 }, { stat: 'agility', value: 5 }], 200, 'icon_sword_overlord'),
  item_stolen_treasure_chest: mat('item_stolen_treasure_chest', 'Stolen Treasure Chest', 'A locked chest of stolen valuables. Can be opened.', ItemType.QUEST_ITEM, ItemRarity.UNCOMMON, 100, 'icon_quest_chest'),
};
