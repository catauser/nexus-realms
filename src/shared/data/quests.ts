// ============================================================
// Nexus Realms — Quest Definitions
// ============================================================
import { QuestType, FactionId } from '../types';

export interface QuestObjective {
  type: 'kill' | 'collect' | 'interact' | 'explore' | 'escort' | 'survive';
  target: string;
  target_name: string;
  required: number; // default 1 for interact/explore
  zone_id?: string;
}

export interface QuestReward {
  experience: number;
  gold: number;
  items: string[];
  reputation: Record<string, number>;
  title?: string;
}

export interface QuestDialogue {
  accept: string;
  progress: string;
  complete: string;
  npc_greeting: string;
}

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  level: number;
  zone_id: string;
  npc_id: string;
  prerequisites: string[];
  objectives: QuestObjective[];
  rewards: QuestReward;
  dialogue: QuestDialogue;
  repeatable: boolean;
  auto_complete: boolean;
}

export const QUESTS: Record<string, QuestDefinition> = {
  // ─── Main Story (Act I: Awakening) ─────────────────────────
  quest_001: {
    id: 'quest_001',
    name: 'A New Beginning',
    description: 'Speak with Elder Theron in the village square to begin your journey.',
    type: QuestType.MAIN_STORY,
    level: 1,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_elder_theron',
    prerequisites: [],
    objectives: [
      { type: 'interact', target: 'npc_elder_theron', target_name: 'Elder Theron', required: 1 },
    ],
    rewards: { experience: 100, gold: 10, items: [], reputation: {} },
    dialogue: {
      accept: 'Welcome, young one. The world beyond our village holds great danger — and great purpose. Are you ready?',
      progress: 'Speak with Elder Theron in the village square.',
      complete: 'You have taken your first step. May the light guide your path.',
      npc_greeting: 'Ah, a new face. The world has need of brave souls.',
    },
    repeatable: false,
    auto_complete: false,
  },
  quest_002: {
    id: 'quest_002',
    name: 'The Village in Peril',
    description: 'Wolves have been attacking livestock near the village. Eliminate the threat.',
    type: QuestType.MAIN_STORY,
    level: 2,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_guard_captain',
    prerequisites: ['quest_001'],
    objectives: [
      { type: 'kill', target: 'wolf', target_name: 'Forest Wolf', required: 5 },
    ],
    rewards: { experience: 200, gold: 25, items: ['weapon_rusty_sword'], reputation: { [FactionId.IRONHOLD_COVENANT]: 250 } },
    dialogue: {
      accept: 'These wolves grow bolder each day. Thin their numbers and the village will be safer for it.',
      progress: 'The wolves still prowl. Keep fighting.',
      complete: 'Well done! The farmers can rest easier tonight.',
      npc_greeting: 'The wolves are getting worse. Can you help?',
    },
    repeatable: false,
    auto_complete: false,
  },
  quest_003: {
    id: 'quest_003',
    name: 'Gathering Supplies',
    description: 'The village herbalist needs herbs and ore for medicine and tools.',
    type: QuestType.MAIN_STORY,
    level: 3,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_herbalist_mira',
    prerequisites: ['quest_001'],
    objectives: [
      { type: 'collect', target: 'herb_peacebloom', target_name: 'Peacebloom', required: 3 },
      { type: 'collect', target: 'ore_copper', target_name: 'Copper Ore', required: 2 },
    ],
    rewards: { experience: 150, gold: 15, items: ['consumable_health_potion_minor'], reputation: {} },
    dialogue: {
      accept: 'I need Peacebloom for healing salves and Copper for tools. Can you gather some?',
      progress: 'Still need more materials. Check the hills and caves nearby.',
      complete: 'Perfect! These will keep the village supplied for weeks.',
      npc_greeting: 'My supplies are running low. Could you help?',
    },
    repeatable: false,
    auto_complete: false,
  },
  quest_004: {
    id: 'quest_004',
    name: 'The Corruption Spreads',
    description: 'Strange dark energy has been spotted in the eastern fields. Investigate the source.',
    type: QuestType.MAIN_STORY,
    level: 5,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_elder_theron',
    prerequisites: ['quest_002'],
    objectives: [
      { type: 'explore', target: 'corruption_source', target_name: 'Corruption Source', required: 1 },
      { type: 'kill', target: 'corrupted_wolf', target_name: 'Corrupted Wolf', required: 3 },
    ],
    rewards: { experience: 400, gold: 50, items: ['armor_leather_chest_01'], reputation: { [FactionId.SYLVARI_ORDER]: 250 } },
    dialogue: {
      accept: 'Dark energy taints the land to the east. This corruption must be investigated before it spreads further.',
      progress: 'Have you found the source of the corruption?',
      complete: 'This is worse than I feared. The Void\'s influence grows.',
      npc_greeting: 'The darkness spreads. We must act quickly.',
    },
    repeatable: false,
    auto_complete: false,
  },
  quest_005: {
    id: 'quest_005',
    name: 'Into the Depths',
    description: 'Enter the Sunken Citadel and discover what lies within.',
    type: QuestType.MAIN_STORY,
    level: 8,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_elder_theron',
    prerequisites: ['quest_004'],
    objectives: [
      { type: 'interact', target: 'dungeon_entrance_citadel', target_name: 'Sunken Citadel Entrance', required: 1 },
      { type: 'kill', target: 'skeleton_guard', target_name: 'Skeleton Guard', required: 10 },
    ],
    rewards: { experience: 800, gold: 100, items: ['weapon_iron_sword'], reputation: { [FactionId.IRONHOLD_COVENANT]: 500 } },
    dialogue: {
      accept: 'The Sunken Citadel has awakened. Ancient guardians stir within. Enter and discover the truth.',
      progress: 'The Citadel holds many secrets. Press deeper.',
      complete: 'You\'ve proven your strength. Greater challenges await.',
      npc_greeting: 'The Citadel calls to the brave.',
    },
    repeatable: false,
    auto_complete: false,
  },
  quest_006: {
    id: 'quest_006',
    name: 'The Iron Covenant',
    description: 'Travel to Ironhold and speak with Commander Voss to join the Iron Covenant.',
    type: QuestType.MAIN_STORY,
    level: 10,
    zone_id: 'ironhold_pass_01',
    npc_id: 'npc_commander_voss',
    prerequisites: ['quest_005'],
    objectives: [
      { type: 'interact', target: 'npc_commander_voss', target_name: 'Commander Voss', required: 1 },
    ],
    rewards: { experience: 500, gold: 50, items: [], reputation: { [FactionId.IRONHOLD_COVENANT]: 1000 } },
    dialogue: {
      accept: 'The Iron Covenant protects the realm. Speak with Commander Voss in Ironhold. She will test your worth.',
      progress: 'Seek Commander Voss in Ironhold.',
      complete: 'Welcome to the Iron Covenant. Your service begins now.',
      npc_greeting: 'So, you seek to join our ranks?',
    },
    repeatable: false,
    auto_complete: false,
  },
  quest_007: {
    id: 'quest_007',
    name: 'Proving Grounds',
    description: 'Complete the Iron Covenant trial by defeating the arena champion.',
    type: QuestType.MAIN_STORY,
    level: 12,
    zone_id: 'ironhold_pass_01',
    npc_id: 'npc_commander_voss',
    prerequisites: ['quest_006'],
    objectives: [
      { type: 'kill', target: 'arena_champion', target_name: 'Arena Champion', required: 1 },
    ],
    rewards: { experience: 1000, gold: 150, items: ['armor_plate_chest_01'], reputation: { [FactionId.IRONHOLD_COVENANT]: 1500 } },
    dialogue: {
      accept: 'Prove yourself in the arena. Defeat the champion and earn your place among us.',
      progress: 'The champion awaits in the arena.',
      complete: 'Impressive! You fight with the heart of a true warrior.',
      npc_greeting: 'The arena is the true test of a warrior.',
    },
    repeatable: false,
    auto_complete: false,
  },
  quest_008: {
    id: 'quest_008',
    name: 'Thornwood Expedition',
    description: 'Venture into Thornwood Forest and establish a forward camp.',
    type: QuestType.MAIN_STORY,
    level: 15,
    zone_id: 'thornwood_forest_01',
    npc_id: 'npc_scout_leader',
    prerequisites: ['quest_007'],
    objectives: [
      { type: 'explore', target: 'forward_camp_site', target_name: 'Camp Site', required: 1 },
      { type: 'kill', target: 'goblin_warrior', target_name: 'Goblin Warrior', required: 8 },
    ],
    rewards: { experience: 1500, gold: 200, items: ['consumable_health_potion_greater'], reputation: { [FactionId.SYLVARI_ORDER]: 500 } },
    dialogue: {
      accept: 'Thornwood is infested with goblins. Clear a path and establish our forward camp.',
      progress: 'The goblins resist. Push forward.',
      complete: 'The camp is established. We can begin our operations in Thornwood.',
      npc_greeting: 'Thornwood is dangerous. Stay sharp.',
    },
    repeatable: false,
    auto_complete: false,
  },
  quest_009: {
    id: 'quest_009',
    name: 'The Goblin Threat',
    description: 'The goblin chief threatens the entire region. End his reign.',
    type: QuestType.MAIN_STORY,
    level: 18,
    zone_id: 'thornwood_forest_01',
    npc_id: 'npc_scout_leader',
    prerequisites: ['quest_008'],
    objectives: [
      { type: 'kill', target: 'goblin_chief', target_name: 'Goblin Chief', required: 1 },
    ],
    rewards: { experience: 2500, gold: 300, items: ['weapon_steel_sword'], reputation: { [FactionId.IRONHOLD_COVENANT]: 1000 } },
    dialogue: {
      accept: 'The goblin chief commands from the old ruins. Slay him and the goblin army will scatter.',
      progress: 'The chief still lives. Find him in the ruins.',
      complete: 'The goblin threat is ended. The region owes you a great debt.',
      npc_greeting: 'The chief must be stopped.',
    },
    repeatable: false,
    auto_complete: false,
  },
  quest_010: {
    id: 'quest_010',
    name: 'A Hero\'s Welcome',
    description: 'Return to the village as a proven hero. The Elder has one final task.',
    type: QuestType.MAIN_STORY,
    level: 20,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_elder_theron',
    prerequisites: ['quest_009'],
    objectives: [
      { type: 'interact', target: 'npc_elder_theron', target_name: 'Elder Theron', required: 1 },
    ],
    rewards: { experience: 3000, gold: 500, items: ['accessory_hero_medallion'], reputation: { [FactionId.IRONHOLD_COVENANT]: 2000, [FactionId.SYLVARI_ORDER]: 2000 }, title: 'Hero of the Plains' },
    dialogue: {
      accept: 'Return home, hero. The Elder awaits with news of a greater destiny.',
      progress: 'The Elder is waiting for you.',
      complete: 'You have surpassed all expectations. A great darkness stirs — and you are our champion.',
      npc_greeting: 'Our hero returns!',
    },
    repeatable: false,
    auto_complete: false,
  },

  // ─── Side Quests ───────────────────────────────────────────
  side_001: {
    id: 'side_001',
    name: 'Lost Sheep',
    description: 'Farmer Giles has lost his sheep in the fields. Help round them up.',
    type: QuestType.SIDE,
    level: 2,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_farmer_giles',
    prerequisites: [],
    objectives: [
      { type: 'interact', target: 'lost_sheep', target_name: 'Lost Sheep', required: 3 },
    ],
    rewards: { experience: 80, gold: 15, items: ['consumable_food_bread'], reputation: {} },
    dialogue: {
      accept: 'My sheep wandered off again! Can you bring them back?',
      progress: 'Still missing some sheep. Check the eastern fields.',
      complete: 'Thank you kindly! Here, take this for your trouble.',
      npc_greeting: 'Oh dear, my sheep!',
    },
    repeatable: false,
    auto_complete: false,
  },
  side_002: {
    id: 'side_002',
    name: 'Bear Problem',
    description: 'Bears are raiding the berry patches. Thin their numbers.',
    type: QuestType.SIDE,
    level: 4,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_herbalist_mira',
    prerequisites: [],
    objectives: [
      { type: 'kill', target: 'bear', target_name: 'Black Bear', required: 4 },
    ],
    rewards: { experience: 200, gold: 30, items: ['material_leather_thick'], reputation: {} },
    dialogue: {
      accept: 'The bears keep destroying my berry patches! Can you deal with them?',
      progress: 'More bears lurking about. Be careful.',
      complete: 'That should keep them away for a while. Thank you!',
      npc_greeting: 'Those bears are at it again!',
    },
    repeatable: false,
    auto_complete: false,
  },
  side_003: {
    id: 'side_003',
    name: 'Bandit Bounty',
    description: 'Bandits have been terrorizing travelers on the road. Eliminate them.',
    type: QuestType.SIDE,
    level: 6,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_guard_captain',
    prerequisites: [],
    objectives: [
      { type: 'kill', target: 'bandit', target_name: 'Bandit', required: 6 },
    ],
    rewards: { experience: 350, gold: 60, items: ['consumable_health_potion_minor'], reputation: { [FactionId.IRONHOLD_COVENANT]: 200 } },
    dialogue: {
      accept: 'There\'s a bounty on bandits. Clear the roads and you\'ll be rewarded.',
      progress: 'More bandits on the roads. Keep at it.',
      complete: 'The roads are safer thanks to you. Here\'s your bounty.',
      npc_greeting: 'Bandits plague our roads.',
    },
    repeatable: false,
    auto_complete: false,
  },
  side_004: {
    id: 'side_004',
    name: 'Ancient Relics',
    description: 'Collect ancient relics scattered across the plains.',
    type: QuestType.SIDE,
    level: 7,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_archaeologist',
    prerequisites: [],
    objectives: [
      { type: 'collect', target: 'ancient_relic', target_name: 'Ancient Relic', required: 5 },
    ],
    rewards: { experience: 400, gold: 75, items: ['accessory_antique_ring'], reputation: {} },
    dialogue: {
      accept: 'Ancient relics lie scattered across these plains. Help me recover them for study.',
      progress: 'Still need more relics. Check near old ruins.',
      complete: 'Fascinating! These relics predate the Covenant by centuries.',
      npc_greeting: 'History surrounds us, buried in the earth.',
    },
    repeatable: false,
    auto_complete: false,
  },
  side_005: {
    id: 'side_005',
    name: 'Spider Silk',
    description: 'The weaver needs spider silk from the forest spiders.',
    type: QuestType.SIDE,
    level: 12,
    zone_id: 'thornwood_forest_01',
    npc_id: 'npc_weaver',
    prerequisites: [],
    objectives: [
      { type: 'collect', target: 'spider_silk', target_name: 'Spider Silk', required: 8 },
    ],
    rewards: { experience: 600, gold: 100, items: ['armor_cloth_legs_02'], reputation: {} },
    dialogue: {
      accept: 'I need spider silk for fine garments. The forest spiders carry it in abundance.',
      progress: 'More silk needed. The spiders lurk in the deeper forest.',
      complete: 'Beautiful quality! This will make a fine garment.',
      npc_greeting: 'The finest silk comes from the forest spiders.',
    },
    repeatable: false,
    auto_complete: false,
  },
  side_006: {
    id: 'side_006',
    name: 'Wolf Pack Alpha',
    description: 'The alpha wolf has been spotted near the forest edge. Defeat it.',
    type: QuestType.SIDE,
    level: 10,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_hunter',
    prerequisites: [],
    objectives: [
      { type: 'kill', target: 'wolf_alpha', target_name: 'Alpha Wolf', required: 1 },
    ],
    rewards: { experience: 500, gold: 80, items: ['accessory_wolf_fang_necklace'], reputation: {} },
    dialogue: {
      accept: 'The alpha wolf leads the pack. Bring it down and the pack will disperse.',
      progress: 'The alpha is cunning. Track it to the forest edge.',
      complete: 'A magnificent beast. Its pelt will make a fine trophy.',
      npc_greeting: 'The alpha wolf is a worthy challenge.',
    },
    repeatable: false,
    auto_complete: false,
  },

  // ─── Daily Quests ──────────────────────────────────────────
  daily_001: {
    id: 'daily_001',
    name: 'Daily Patrol',
    description: 'Patrol the village perimeter and report any threats.',
    type: QuestType.DAILY,
    level: 5,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_guard_captain',
    prerequisites: [],
    objectives: [
      { type: 'explore', target: 'patrol_point_1', target_name: 'North Gate', required: 1 },
      { type: 'explore', target: 'patrol_point_2', target_name: 'East Bridge', required: 1 },
      { type: 'explore', target: 'patrol_point_3', target_name: 'South Farm', required: 1 },
    ],
    rewards: { experience: 150, gold: 25, items: [], reputation: { [FactionId.IRONHOLD_COVENANT]: 50 } },
    dialogue: {
      accept: 'Make your rounds and report anything suspicious.',
      progress: 'Continue the patrol. Check all waypoints.',
      complete: 'All clear? Good. The village thanks you.',
      npc_greeting: 'Time for the daily patrol.',
    },
    repeatable: true,
    auto_complete: false,
  },
  daily_002: {
    id: 'daily_002',
    name: 'Herb Gathering',
    description: 'Collect herbs for the herbalist\'s daily supply.',
    type: QuestType.DAILY,
    level: 3,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_herbalist_mira',
    prerequisites: [],
    objectives: [
      { type: 'collect', target: 'herb_peacebloom', target_name: 'Peacebloom', required: 5 },
    ],
    rewards: { experience: 100, gold: 15, items: ['consumable_health_potion_minor'], reputation: {} },
    dialogue: {
      accept: 'I need fresh herbs every day. Can you gather some?',
      progress: 'Still need more herbs.',
      complete: 'Fresh as can be! Here, take a potion for your efforts.',
      npc_greeting: 'My herb supply is low again.',
    },
    repeatable: true,
    auto_complete: false,
  },
  daily_003: {
    id: 'daily_003',
    name: 'Hunting Practice',
    description: 'Hunt wild animals to sharpen your combat skills.',
    type: QuestType.DAILY,
    level: 5,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_hunter',
    prerequisites: [],
    objectives: [
      { type: 'kill', target: 'wolf', target_name: 'Wolf', required: 3 },
      { type: 'kill', target: 'bear', target_name: 'Bear', required: 2 },
    ],
    rewards: { experience: 200, gold: 30, items: [], reputation: {} },
    dialogue: {
      accept: 'Keep your skills sharp. Hunt some wolves and bears.',
      progress: 'More hunting to do.',
      complete: 'Good hunt! Your skills improve each day.',
      npc_greeting: 'Ready for today\'s hunt?',
    },
    repeatable: true,
    auto_complete: false,
  },
  daily_004: {
    id: 'daily_004',
    name: 'Mining Duty',
    description: 'Mine ore for the blacksmith\'s daily needs.',
    type: QuestType.DAILY,
    level: 5,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_blacksmith',
    prerequisites: [],
    objectives: [
      { type: 'collect', target: 'ore_copper', target_name: 'Copper Ore', required: 5 },
    ],
    rewards: { experience: 100, gold: 20, items: [], reputation: { [FactionId.IRONHOLD_COVENANT]: 50 } },
    dialogue: {
      accept: 'I need ore to keep the forge burning. Bring me copper.',
      progress: 'More ore needed. Check the mines.',
      complete: 'Good quality ore. The forge thanks you.',
      npc_greeting: 'The forge needs feeding.',
    },
    repeatable: true,
    auto_complete: false,
  },
  daily_005: {
    id: 'daily_005',
    name: 'Arena Challenge',
    description: 'Fight in the arena for glory and rewards.',
    type: QuestType.DAILY,
    level: 10,
    zone_id: 'ironhold_pass_01',
    npc_id: 'npc_arena_master',
    prerequisites: [],
    objectives: [
      { type: 'kill', target: 'arena_combatant', target_name: 'Arena Combatant', required: 3 },
    ],
    rewards: { experience: 300, gold: 50, items: [], reputation: { [FactionId.IRONHOLD_COVENANT]: 100 } },
    dialogue: {
      accept: 'Step into the arena and prove your worth!',
      progress: 'More challengers await. Keep fighting!',
      complete: 'A glorious victory! The crowd cheers for you.',
      npc_greeting: 'The arena calls for blood!',
    },
    repeatable: true,
    auto_complete: false,
  },

  // ─── Profession Quests ─────────────────────────────────────
  prof_001: {
    id: 'prof_001',
    name: 'Alchemy Basics',
    description: 'Learn the fundamentals of alchemy by crafting a simple potion.',
    type: QuestType.PROFESSION,
    level: 5,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_alchemy_trainer',
    prerequisites: [],
    objectives: [
      { type: 'collect', target: 'herb_peacebloom', target_name: 'Peacebloom', required: 3 },
      { type: 'collect', target: 'herb_silverleaf', target_name: 'Silverleaf', required: 2 },
    ],
    rewards: { experience: 200, gold: 20, items: ['recipe_minor_health_potion'], reputation: {} },
    dialogue: {
      accept: 'Alchemy begins with simple ingredients. Gather Peacebloom and Silverleaf, and I shall teach you.',
      progress: 'Still need herbs for the lesson.',
      complete: 'Excellent! Here is your first recipe. Use it well.',
      npc_greeting: 'The art of alchemy awaits.',
    },
    repeatable: false,
    auto_complete: false,
  },
  prof_002: {
    id: 'prof_002',
    name: 'Blacksmithing Fundamentals',
    description: 'Forge your first weapon at the anvil.',
    type: QuestType.PROFESSION,
    level: 5,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_blacksmith',
    prerequisites: [],
    objectives: [
      { type: 'collect', target: 'ore_copper', target_name: 'Copper Ore', required: 5 },
    ],
    rewards: { experience: 200, gold: 20, items: ['recipe_copper_sword'], reputation: {} },
    dialogue: {
      accept: 'Every smith starts with copper. Bring me ore and I\'ll show you the basics.',
      progress: 'Need more ore for the lesson.',
      complete: 'A fine first blade! You have the makings of a smith.',
      npc_greeting: 'The forge awaits, apprentice.',
    },
    repeatable: false,
    auto_complete: false,
  },
  prof_003: {
    id: 'prof_003',
    name: 'Cooking Class',
    description: 'Learn to cook a simple meal.',
    type: QuestType.PROFESSION,
    level: 3,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_cook',
    prerequisites: [],
    objectives: [
      { type: 'collect', target: 'raw_chicken', target_name: 'Raw Chicken', required: 3 },
    ],
    rewards: { experience: 100, gold: 10, items: ['recipe_herb_roasted_chicken'], reputation: {} },
    dialogue: {
      accept: 'Cooking is an essential skill. Bring me some raw chicken to start.',
      progress: 'Need more chicken for the lesson.',
      complete: 'Delicious! You\'re a natural in the kitchen.',
      npc_greeting: 'Hungry? Let me teach you to cook.',
    },
    repeatable: false,
    auto_complete: false,
  },
  prof_004: {
    id: 'prof_004',
    name: 'Tailoring Introduction',
    description: 'Craft your first piece of cloth armor.',
    type: QuestType.PROFESSION,
    level: 5,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_tailor',
    prerequisites: [],
    objectives: [
      { type: 'collect', target: 'material_cloth_linen', target_name: 'Linen Cloth', required: 5 },
    ],
    rewards: { experience: 200, gold: 20, items: ['recipe_linen_robe'], reputation: {} },
    dialogue: {
      accept: 'Tailoring begins with cloth. Gather linen and I shall teach you to sew.',
      progress: 'More linen needed for the lesson.',
      complete: 'A fine robe! Your tailoring journey has begun.',
      npc_greeting: 'The needle and thread await.',
    },
    repeatable: false,
    auto_complete: false,
  },
  prof_005: {
    id: 'prof_005',
    name: 'Fishing Expedition',
    description: 'Learn to fish at the village pond.',
    type: QuestType.PROFESSION,
    level: 2,
    zone_id: 'verdant_plains_01',
    npc_id: 'npc_fisherman',
    prerequisites: [],
    objectives: [
      { type: 'collect', target: 'fish_trout', target_name: 'Trout', required: 3 },
    ],
    rewards: { experience: 80, gold: 10, items: ['recipe_grilled_fish'], reputation: {} },
    dialogue: {
      accept: 'Fishing is a peaceful art. Cast your line at the pond and bring me some trout.',
      progress: 'Keep fishing. The trout are biting.',
      complete: 'A fine catch! You have the patience of a true angler.',
      npc_greeting: 'Care for a fishing lesson?',
    },
    repeatable: false,
    auto_complete: false,
  },
};
