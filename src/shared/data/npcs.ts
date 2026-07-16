// ============================================================
// Nexus Realms — NPC Definitions
// ============================================================
import { FactionId, ProfessionType } from '../types';

export interface NPCShopItem {
  item_id: string;
  price: number;
  stock: number;
  required_reputation?: number;
  required_faction?: FactionId;
}

export interface NPCScheduleEntry {
  hour: number;
  x: number;
  y: number;
  action: string;
}

export interface NPCDefinition {
  id: string;
  name: string;
  title: string;
  type: 'quest_giver' | 'vendor' | 'trainer' | 'faction' | 'friendly';
  zone_id: string;
  x: number;
  y: number;
  level: number;
  dialogue_greeting: string;
  dialogue_options: string[];
  shop_items: NPCShopItem[] | null;
  profession: ProfessionType | null;
  faction_id: FactionId | null;
  schedule: NPCScheduleEntry[];
  hostile: boolean;
}

export const NPCs: Record<string, NPCDefinition> = {
  // ─── Quest Givers ──────────────────────────────────────────
  npc_elder_theron: {
    id: 'npc_elder_theron',
    name: 'Elder Theron',
    title: 'Village Elder',
    type: 'quest_giver',
    zone_id: 'verdant_plains_01',
    x: 500, y: 400,
    level: 30,
    dialogue_greeting: 'Welcome, traveler. How may I help you?',
    dialogue_options: ['I seek guidance.', 'What news of the village?', 'Farewell.'],
    shop_items: null,
    profession: null,
    faction_id: FactionId.IRONHOLD_COVENANT,
    schedule: [
      { hour: 6, x: 500, y: 400, action: 'stand' },
      { hour: 12, x: 520, y: 410, action: 'walk' },
      { hour: 18, x: 500, y: 400, action: 'stand' },
      { hour: 22, x: 490, y: 395, action: 'sit' },
    ],
    hostile: false,
  },
  npc_guard_captain: {
    id: 'npc_guard_captain',
    name: 'Captain Aldric',
    title: 'Guard Captain',
    type: 'quest_giver',
    zone_id: 'verdant_plains_01',
    x: 520, y: 350,
    level: 25,
    dialogue_greeting: 'Halt! State your business.',
    dialogue_options: ['I seek work.', 'What threats face the village?', 'Carry on.'],
    shop_items: null,
    profession: null,
    faction_id: FactionId.IRONHOLD_COVENANT,
    schedule: [
      { hour: 6, x: 520, y: 350, action: 'patrol' },
      { hour: 18, x: 510, y: 360, action: 'stand' },
      { hour: 22, x: 505, y: 355, action: 'sit' },
    ],
    hostile: false,
  },
  npc_herbalist_mira: {
    id: 'npc_herbalist_mira',
    name: 'Mira',
    title: 'Village Herbalist',
    type: 'quest_giver',
    zone_id: 'verdant_plains_01',
    x: 480, y: 420,
    level: 15,
    dialogue_greeting: 'Ah, a visitor! My herbs are the finest in the land.',
    dialogue_options: ['I need supplies.', 'Tell me about herbs.', 'Goodbye.'],
    shop_items: [
      { item_id: 'consumable_health_potion_minor', price: 10, stock: 50 },
      { item_id: 'consumable_mana_potion_minor', price: 12, stock: 50 },
    ],
    profession: null,
    faction_id: null,
    schedule: [
      { hour: 6, x: 480, y: 420, action: 'stand' },
      { hour: 10, x: 460, y: 430, action: 'gather' },
      { hour: 16, x: 480, y: 420, action: 'stand' },
      { hour: 22, x: 475, y: 415, action: 'sit' },
    ],
    hostile: false,
  },
  npc_farmer_giles: {
    id: 'npc_farmer_giles',
    name: 'Farmer Giles',
    title: 'Farmer',
    type: 'quest_giver',
    zone_id: 'verdant_plains_01',
    x: 600, y: 500,
    level: 5,
    dialogue_greeting: 'Howdy! Fine day for farming, eh?',
    dialogue_options: ['Need any help?', 'How\'s the harvest?', 'See you.'],
    shop_items: null,
    profession: null,
    faction_id: null,
    schedule: [
      { hour: 5, x: 600, y: 500, action: 'work' },
      { hour: 12, x: 610, y: 510, action: 'eat' },
      { hour: 13, x: 600, y: 500, action: 'work' },
      { hour: 20, x: 595, y: 495, action: 'sit' },
    ],
    hostile: false,
  },
  npc_scout_leader: {
    id: 'npc_scout_leader',
    name: 'Ranger Sylas',
    title: 'Scout Leader',
    type: 'quest_giver',
    zone_id: 'thornwood_forest_01',
    x: 300, y: 200,
    level: 20,
    dialogue_greeting: 'Stay alert in these woods. Danger lurks behind every tree.',
    dialogue_options: ['What\'s the situation?', 'I need intel.', 'Watch your back.'],
    shop_items: null,
    profession: null,
    faction_id: FactionId.SYLVARI_ORDER,
    schedule: [
      { hour: 6, x: 300, y: 200, action: 'patrol' },
      { hour: 18, x: 290, y: 210, action: 'camp' },
    ],
    hostile: false,
  },
  npc_archaeologist: {
    id: 'npc_archaeologist',
    name: 'Professor Vex',
    title: 'Archaeologist',
    type: 'quest_giver',
    zone_id: 'verdant_plains_01',
    x: 550, y: 380,
    level: 10,
    dialogue_greeting: 'Fascinating! These ruins hold secrets beyond imagination!',
    dialogue_options: ['What have you found?', 'Need help collecting artifacts?', 'Interesting.'],
    shop_items: null,
    profession: null,
    faction_id: null,
    schedule: [
      { hour: 8, x: 550, y: 380, action: 'dig' },
      { hour: 17, x: 545, y: 375, action: 'study' },
    ],
    hostile: false,
  },
  npc_hunter: {
    id: 'npc_hunter',
    name: 'Gareth',
    title: 'Hunter',
    type: 'quest_giver',
    zone_id: 'verdant_plains_01',
    x: 450, y: 350,
    level: 15,
    dialogue_greeting: 'The hunt is on. What brings you to the wilds?',
    dialogue_options: ['Teach me to hunt.', 'What game is nearby?', 'Good hunting.'],
    shop_items: null,
    profession: null,
    faction_id: null,
    schedule: [
      { hour: 5, x: 450, y: 350, action: 'hunt' },
      { hour: 12, x: 460, y: 360, action: 'cook' },
      { hour: 18, x: 445, y: 345, action: 'camp' },
    ],
    hostile: false,
  },
  npc_weaver: {
    id: 'npc_weaver',
    name: 'Elara',
    title: 'Weaver',
    type: 'quest_giver',
    zone_id: 'thornwood_forest_01',
    x: 280, y: 220,
    level: 12,
    dialogue_greeting: 'The finest threads make the finest garments.',
    dialogue_options: ['I need new clothes.', 'What materials do you need?', 'Farewell.'],
    shop_items: null,
    profession: ProfessionType.TAILORING,
    faction_id: null,
    schedule: [
      { hour: 7, x: 280, y: 220, action: 'weave' },
      { hour: 20, x: 275, y: 215, action: 'rest' },
    ],
    hostile: false,
  },
  npc_commander_voss: {
    id: 'npc_commander_voss',
    name: 'Commander Voss',
    title: 'Iron Covenant Commander',
    type: 'faction',
    zone_id: 'ironhold_pass_01',
    x: 400, y: 300,
    level: 40,
    dialogue_greeting: 'The Iron Covenant stands vigilant. How can we assist?',
    dialogue_options: ['I wish to join.', 'What missions are available?', 'For the Covenant!'],
    shop_items: null,
    profession: null,
    faction_id: FactionId.IRONHOLD_COVENANT,
    schedule: [
      { hour: 6, x: 400, y: 300, action: 'command' },
      { hour: 22, x: 395, y: 295, action: 'rest' },
    ],
    hostile: false,
  },

  // ─── Vendors ───────────────────────────────────────────────
  npc_general_vendor: {
    id: 'npc_general_vendor',
    name: 'Thomas',
    title: 'General Goods',
    type: 'vendor',
    zone_id: 'verdant_plains_01',
    x: 510, y: 410,
    level: 10,
    dialogue_greeting: 'Welcome to my shop! I have everything you need.',
    dialogue_options: ['Show me your wares.', 'I\'d like to sell.', 'Goodbye.'],
    shop_items: [
      { item_id: 'consumable_health_potion_minor', price: 10, stock: 100 },
      { item_id: 'consumable_mana_potion_minor', price: 12, stock: 100 },
      { item_id: 'consumable_food_bread', price: 5, stock: 100 },
      { item_id: 'consumable_food_cheese', price: 8, stock: 50 },
      { item_id: 'material_basic_arrow', price: 1, stock: 200 },
    ],
    profession: null,
    faction_id: null,
    schedule: [
      { hour: 7, x: 510, y: 410, action: 'sell' },
      { hour: 20, x: 505, y: 405, action: 'close' },
    ],
    hostile: false,
  },
  npc_weapon_vendor: {
    id: 'npc_weapon_vendor',
    name: 'Bjorn',
    title: 'Weaponsmith',
    type: 'vendor',
    zone_id: 'verdant_plains_01',
    x: 530, y: 390,
    level: 20,
    dialogue_greeting: 'A warrior is only as good as their blade.',
    dialogue_options: ['Show me weapons.', 'Can you repair my gear?', 'Thanks.'],
    shop_items: [
      { item_id: 'weapon_iron_sword', price: 50, stock: 10 },
      { item_id: 'weapon_iron_axe', price: 55, stock: 10 },
      { item_id: 'weapon_iron_mace', price: 52, stock: 10 },
      { item_id: 'weapon_hunting_bow', price: 45, stock: 10 },
      { item_id: 'weapon_apprentice_staff', price: 40, stock: 10 },
      { item_id: 'weapon_iron_dagger', price: 35, stock: 10 },
    ],
    profession: null,
    faction_id: null,
    schedule: [
      { hour: 6, x: 530, y: 390, action: 'forge' },
      { hour: 20, x: 525, y: 385, action: 'close' },
    ],
    hostile: false,
  },
  npc_armor_vendor: {
    id: 'npc_armor_vendor',
    name: 'Helga',
    title: 'Armorsmith',
    type: 'vendor',
    zone_id: 'verdant_plains_01',
    x: 535, y: 395,
    level: 20,
    dialogue_greeting: 'Good armor saves lives. What can I get you?',
    dialogue_options: ['Show me armor.', 'I need repairs.', 'Farewell.'],
    shop_items: [
      { item_id: 'armor_plate_chest_01', price: 80, stock: 5 },
      { item_id: 'armor_plate_legs_01', price: 60, stock: 5 },
      { item_id: 'armor_leather_chest_01', price: 50, stock: 5 },
      { item_id: 'armor_cloth_robe_01', price: 40, stock: 5 },
      { item_id: 'armor_iron_shield', price: 45, stock: 5 },
    ],
    profession: null,
    faction_id: null,
    schedule: [
      { hour: 6, x: 535, y: 395, action: 'forge' },
      { hour: 20, x: 530, y: 390, action: 'close' },
    ],
    hostile: false,
  },

  // ─── Profession Trainers ───────────────────────────────────
  npc_alchemy_trainer: {
    id: 'npc_alchemy_trainer',
    name: 'Alchemist Zara',
    title: 'Alchemy Trainer',
    type: 'trainer',
    zone_id: 'verdant_plains_01',
    x: 475, y: 425,
    level: 35,
    dialogue_greeting: 'The secrets of alchemy await those with patience and skill.',
    dialogue_options: ['Teach me alchemy.', 'What can I craft?', 'Goodbye.'],
    shop_items: [
      { item_id: 'recipe_minor_health_potion', price: 5, stock: 1 },
      { item_id: 'recipe_health_potion', price: 20, stock: 1 },
    ],
    profession: ProfessionType.ALCHEMY,
    faction_id: null,
    schedule: [
      { hour: 8, x: 475, y: 425, action: 'brew' },
      { hour: 20, x: 470, y: 420, action: 'rest' },
    ],
    hostile: false,
  },
  npc_blacksmith: {
    id: 'npc_blacksmith',
    name: 'Smith Dorin',
    title: 'Blacksmith Trainer',
    type: 'trainer',
    zone_id: 'verdant_plains_01',
    x: 540, y: 385,
    level: 30,
    dialogue_greeting: 'The forge is hot and the anvil rings. What do you need?',
    dialogue_options: ['Teach me blacksmithing.', 'I need repairs.', 'Thanks.'],
    shop_items: [
      { item_id: 'recipe_copper_sword', price: 5, stock: 1 },
      { item_id: 'recipe_iron_sword', price: 20, stock: 1 },
    ],
    profession: ProfessionType.BLACKSMITHING,
    faction_id: null,
    schedule: [
      { hour: 5, x: 540, y: 385, action: 'forge' },
      { hour: 21, x: 535, y: 380, action: 'rest' },
    ],
    hostile: false,
  },
  npc_cook: {
    id: 'npc_cook',
    name: 'Chef Rowan',
    title: 'Cooking Trainer',
    type: 'trainer',
    zone_id: 'verdant_plains_01',
    x: 505, y: 415,
    level: 15,
    dialogue_greeting: 'A hearty meal makes a hearty adventurer!',
    dialogue_options: ['Teach me cooking.', 'What recipes do you have?', 'Smells great!'],
    shop_items: [
      { item_id: 'recipe_herb_roasted_chicken', price: 5, stock: 1 },
      { item_id: 'recipe_spiced_wolf_steak', price: 10, stock: 1 },
    ],
    profession: ProfessionType.COOKING,
    faction_id: null,
    schedule: [
      { hour: 5, x: 505, y: 415, action: 'cook' },
      { hour: 21, x: 500, y: 410, action: 'rest' },
    ],
    hostile: false,
  },
  npc_tailor: {
    id: 'npc_tailor',
    name: 'Seamstress Lyra',
    title: 'Tailoring Trainer',
    type: 'trainer',
    zone_id: 'verdant_plains_01',
    x: 485, y: 430,
    level: 20,
    dialogue_greeting: 'Thread and needle, cloth and care — that is the tailor\'s art.',
    dialogue_options: ['Teach me tailoring.', 'Show me patterns.', 'Goodbye.'],
    shop_items: [
      { item_id: 'recipe_linen_robe', price: 5, stock: 1 },
    ],
    profession: ProfessionType.TAILORING,
    faction_id: null,
    schedule: [
      { hour: 7, x: 485, y: 430, action: 'sew' },
      { hour: 20, x: 480, y: 425, action: 'rest' },
    ],
    hostile: false,
  },
  npc_fisherman: {
    id: 'npc_fisherman',
    name: 'Old Finn',
    title: 'Fisherman',
    type: 'trainer',
    zone_id: 'verdant_plains_01',
    x: 620, y: 450,
    level: 10,
    dialogue_greeting: 'The fish are biting today! Care to join me?',
    dialogue_options: ['Teach me fishing.', 'What\'s biting?', 'Tight lines!'],
    shop_items: [
      { item_id: 'recipe_grilled_fish', price: 3, stock: 1 },
    ],
    profession: ProfessionType.FISHING,
    faction_id: null,
    schedule: [
      { hour: 4, x: 620, y: 450, action: 'fish' },
      { hour: 19, x: 615, y: 445, action: 'rest' },
    ],
    hostile: false,
  },

  // ─── Faction Representatives ───────────────────────────────
  npc_sylvari_rep: {
    id: 'npc_sylvari_rep',
    name: 'Druid Aelindra',
    title: 'Sylvari Order Representative',
    type: 'faction',
    zone_id: 'thornwood_forest_01',
    x: 310, y: 190,
    level: 35,
    dialogue_greeting: 'Nature speaks to those who listen. The Sylvari Order welcomes you.',
    dialogue_options: ['Tell me about the Sylvari.', 'How can I help?', 'Nature guides us.'],
    shop_items: null,
    profession: null,
    faction_id: FactionId.SYLVARI_ORDER,
    schedule: [
      { hour: 6, x: 310, y: 190, action: 'meditate' },
      { hour: 18, x: 305, y: 185, action: 'commune' },
    ],
    hostile: false,
  },
  npc_voidwalker_rep: {
    id: 'npc_voidwalker_rep',
    name: 'Shadow Kael',
    title: 'Voidwalker Conclave Representative',
    type: 'faction',
    zone_id: 'ironhold_pass_01',
    x: 410, y: 310,
    level: 35,
    dialogue_greeting: 'The Void whispers secrets to those bold enough to listen.',
    dialogue_options: ['What is the Voidwalker Conclave?', 'What do you offer?', 'The Void awaits.'],
    shop_items: null,
    profession: null,
    faction_id: FactionId.VOIDWALKER_CONCLAVE,
    schedule: [
      { hour: 20, x: 410, y: 310, action: 'study' },
      { hour: 6, x: 405, y: 305, action: 'meditate' },
    ],
    hostile: false,
  },
  npc_arena_master: {
    id: 'npc_arena_master',
    name: 'Arena Master Krag',
    title: 'Arena Master',
    type: 'quest_giver',
    zone_id: 'ironhold_pass_01',
    x: 420, y: 280,
    level: 30,
    dialogue_greeting: 'Step into the arena if you dare! Glory awaits the brave!',
    dialogue_options: ['I want to fight.', 'What are the rules?', 'Not today.'],
    shop_items: null,
    profession: null,
    faction_id: FactionId.IRONHOLD_COVENANT,
    schedule: [
      { hour: 8, x: 420, y: 280, action: 'announce' },
      { hour: 22, x: 415, y: 275, action: 'close' },
    ],
    hostile: false,
  },
};
