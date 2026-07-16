// ============================================================
// Nexus Realms — Zone Definitions
// ============================================================

import {
  ZoneDefinition,
  WeatherType,
  ProfessionType,
} from '../types';

export const ZONES: Record<string, ZoneDefinition> = {
  // ─── Zone 1: Verdant Plains (Level 1-10, Starter) ─────────
  zone_verdant_plains: {
    id: 'zone_verdant_plains',
    name: 'Verdant Plains',
    description:
      'Rolling green hills stretch as far as the eye can see. Wildflowers dot the meadows and a gentle breeze carries the scent of fresh grass. This is the heartland of the Evergrove — peaceful, fertile, and welcoming to new adventurers.',
    level_range: [1, 10],
    biome: 'temperate_grassland',
    pvp_enabled: false,
    parent_region_id: 'evergrove',
    width: 128,
    height: 128,
    spawn_points: [
      { x: 64, y: 64 },   // Central village spawn
      { x: 32, y: 32 },   // North-west meadow
      { x: 96, y: 32 },   // North-east hilltop
      { x: 32, y: 96 },   // South-west farmstead
      { x: 96, y: 96 },   // South-east crossroads
    ],
    npc_spawns: [
      { npc_id: 'npc_captain_aldric', x: 64, y: 60 },
      { npc_id: 'npc_herbalist_lyra', x: 66, y: 62 },
      { npc_id: 'npc_smith_gareth', x: 62, y: 66 },
      { npc_id: 'npc_innkeeper_mira', x: 60, y: 64 },
      { npc_id: 'npc_vendor_finn', x: 68, y: 64 },
      { npc_id: 'npc_trainer_warrior_bran', x: 58, y: 60 },
      { npc_id: 'npc_trainer_mage_sylara', x: 70, y: 60 },
      { npc_id: 'npc_guard_tomas', x: 64, y: 56 },
      { npc_id: 'npc_farmer_edwin', x: 40, y: 80 },
      { npc_id: 'npc_old_merchant_hal', x: 96, y: 96 },
    ],
    monster_spawns: [
      // Level 1-3 — immediate surroundings
      { monster_id: 'monster_forest_wolf', x: 80, y: 50, respawn_time: 30 },
      { monster_id: 'monster_forest_wolf', x: 84, y: 48, respawn_time: 30 },
      { monster_id: 'monster_forest_wolf', x: 82, y: 54, respawn_time: 30 },
      { monster_id: 'monster_wild_boar', x: 48, y: 72, respawn_time: 35 },
      { monster_id: 'monster_wild_boar', x: 44, y: 76, respawn_time: 35 },
      { monster_id: 'monster_wild_boar', x: 50, y: 70, respawn_time: 35 },
      { monster_id: 'monster_giant_rat', x: 56, y: 48, respawn_time: 20 },
      { monster_id: 'monster_giant_rat', x: 54, y: 50, respawn_time: 20 },
      { monster_id: 'monster_giant_rat', x: 72, y: 78, respawn_time: 20 },
      { monster_id: 'monster_giant_rat', x: 74, y: 76, respawn_time: 20 },
      { monster_id: 'monster_snake', x: 36, y: 56, respawn_time: 25 },
      { monster_id: 'monster_snake', x: 38, y: 54, respawn_time: 25 },
      // Level 5-8 — outer areas
      { monster_id: 'monster_goblin_scout', x: 100, y: 40, respawn_time: 45 },
      { monster_id: 'monster_goblin_scout', x: 104, y: 44, respawn_time: 45 },
      { monster_id: 'monster_goblin_scout', x: 102, y: 38, respawn_time: 45 },
      { monster_id: 'monster_goblin_warrior', x: 108, y: 42, respawn_time: 60 },
      { monster_id: 'monster_goblin_warrior', x: 106, y: 36, respawn_time: 60 },
      { monster_id: 'monster_bandit', x: 24, y: 100, respawn_time: 50 },
      { monster_id: 'monster_bandit', x: 28, y: 104, respawn_time: 50 },
      { monster_id: 'monster_bandit', x: 20, y: 98, respawn_time: 50 },
    ],
    resource_nodes: [
      // Herbs
      { type: ProfessionType.HERBALISM, x: 50, y: 50, respawn_time: 120 },
      { type: ProfessionType.HERBALISM, x: 72, y: 42, respawn_time: 120 },
      { type: ProfessionType.HERBALISM, x: 38, y: 68, respawn_time: 120 },
      { type: ProfessionType.HERBALISM, x: 86, y: 74, respawn_time: 120 },
      { type: ProfessionType.HERBALISM, x: 60, y: 88, respawn_time: 120 },
      // Ore
      { type: ProfessionType.MINING, x: 110, y: 60, respawn_time: 180 },
      { type: ProfessionType.MINING, x: 20, y: 40, respawn_time: 180 },
      { type: ProfessionType.MINING, x: 90, y: 24, respawn_time: 180 },
      // Skinning (animal spawns double as skinning sources)
      { type: ProfessionType.SKINNING, x: 80, y: 52, respawn_time: 60 },
      { type: ProfessionType.SKINNING, x: 46, y: 74, respawn_time: 60 },
    ],
    teleport_points: [
      { x: 64, y: 64 },   // Verdant Plains Village
      { x: 96, y: 96 },   // Crossroads
    ],
    weather_weights: {
      [WeatherType.CLEAR]: 50,
      [WeatherType.RAIN]: 25,
      [WeatherType.FOG]: 15,
      [WeatherType.STORM]: 5,
      [WeatherType.SNOW]: 0,
      [WeatherType.SANDSTORM]: 0,
    },
  },

  // ─── Zone 2: Thornwood Forest (Level 10-20) ───────────────
  zone_thornwood_forest: {
    id: 'zone_thornwood_forest',
    name: 'Thornwood Forest',
    description:
      'A dense, ancient woodland where the canopy blocks most sunlight. Twisted oaks and thorned brambles create a labyrinth of narrow paths. Wolves prowl in packs and goblin tribes have established crude camps among the roots. The air is thick with the scent of damp earth and decay.',
    level_range: [10, 20],
    biome: 'dense_forest',
    pvp_enabled: false,
    parent_region_id: 'evergrove',
    width: 160,
    height: 160,
    spawn_points: [
      { x: 80, y: 140 },  // Southern entrance from Verdant Plains
      { x: 80, y: 20 },   // Northern exit toward Ironhold Pass
      { x: 40, y: 80 },   // Western hunter camp
      { x: 120, y: 80 },  // Eastern logging camp
    ],
    npc_spawns: [
      { npc_id: 'npc_ranger_captain_faelyn', x: 80, y: 136 },
      { npc_id: 'npc_hunter_korrin', x: 40, y: 78 },
      { npc_id: 'npc_apothecary_nyx', x: 120, y: 78 },
      { npc_id: 'npc_armor_vendor_elara', x: 82, y: 138 },
      { npc_id: 'npc_trainer_ranger_faelyn', x: 38, y: 82 },
      { npc_id: 'npc_trainer_rogue_shadow', x: 122, y: 82 },
      { npc_id: 'npc_quest_lumberjack_rodric', x: 100, y: 100 },
      { npc_id: 'npc_quest_scout_maya', x: 60, y: 60 },
      { npc_id: 'npc_faction_sylvari_envoy', x: 80, y: 80 },
      { npc_id: 'npc_ironhold_representative', x: 78, y: 80 },
    ],
    monster_spawns: [
      // Level 10-12 — forest edges
      { monster_id: 'monster_goblin_shaman', x: 50, y: 110, respawn_time: 60 },
      { monster_id: 'monster_goblin_shaman', x: 110, y: 110, respawn_time: 60 },
      { monster_id: 'monster_forest_spider', x: 90, y: 100, respawn_time: 45 },
      { monster_id: 'monster_forest_spider', x: 70, y: 100, respawn_time: 45 },
      { monster_id: 'monster_forest_spider', x: 80, y: 90, respawn_time: 45 },
      { monster_id: 'monster_forest_spider', x: 60, y: 90, respawn_time: 45 },
      { monster_id: 'monster_dark_wolf', x: 44, y: 70, respawn_time: 50 },
      { monster_id: 'monster_dark_wolf', x: 48, y: 66, respawn_time: 50 },
      { monster_id: 'monster_dark_wolf', x: 42, y: 64, respawn_time: 50 },
      { monster_id: 'monster_zombie', x: 100, y: 70, respawn_time: 55 },
      { monster_id: 'monster_zombie', x: 104, y: 68, respawn_time: 55 },
      { monster_id: 'monster_zombie', x: 108, y: 72, respawn_time: 55 },
      // Level 13-16 — deep forest
      { monster_id: 'monster_goblin_shaman', x: 60, y: 50, respawn_time: 60 },
      { monster_id: 'monster_goblin_shaman', x: 100, y: 50, respawn_time: 60 },
      { monster_id: 'monster_dark_wolf', x: 70, y: 40, respawn_time: 50 },
      { monster_id: 'monster_dark_wolf', x: 90, y: 40, respawn_time: 50 },
      { monster_id: 'monster_bandit_captain', x: 50, y: 40, respawn_time: 120 },
      { monster_id: 'monster_bandit_captain', x: 110, y: 40, respawn_time: 120 },
      // Level 17-20 — northern deep woods
      { monster_id: 'monster_goblin_chief', x: 80, y: 30, respawn_time: 180 },
      { monster_id: 'monster_stone_elemental', x: 70, y: 20, respawn_time: 150 },
      { monster_id: 'monster_stone_elemental', x: 90, y: 20, respawn_time: 150 },
      { monster_id: 'monster_forest_guardian', x: 80, y: 15, respawn_time: 600 },
    ],
    resource_nodes: [
      // Herbs (higher-tier)
      { type: ProfessionType.HERBALISM, x: 55, y: 95, respawn_time: 150 },
      { type: ProfessionType.HERBALISM, x: 105, y: 85, respawn_time: 150 },
      { type: ProfessionType.HERBALISM, x: 75, y: 55, respawn_time: 150 },
      { type: ProfessionType.HERBALISM, x: 45, y: 45, respawn_time: 150 },
      { type: ProfessionType.HERBALISM, x: 115, y: 55, respawn_time: 150 },
      { type: ProfessionType.HERBALISM, x: 85, y: 25, respawn_time: 150 },
      // Ore
      { type: ProfessionType.MINING, x: 30, y: 60, respawn_time: 200 },
      { type: ProfessionType.MINING, x: 130, y: 60, respawn_time: 200 },
      { type: ProfessionType.MINING, x: 80, y: 10, respawn_time: 200 },
      // Skinning
      { type: ProfessionType.SKINNING, x: 46, y: 68, respawn_time: 80 },
      { type: ProfessionType.SKINNING, x: 90, y: 42, respawn_time: 80 },
    ],
    teleport_points: [
      { x: 80, y: 140 },  // Southern entrance
      { x: 80, y: 80 },   // Ranger outpost
      { x: 80, y: 20 },   // Northern exit
    ],
    weather_weights: {
      [WeatherType.CLEAR]: 20,
      [WeatherType.RAIN]: 30,
      [WeatherType.FOG]: 30,
      [WeatherType.STORM]: 10,
      [WeatherType.SNOW]: 5,
      [WeatherType.SANDSTORM]: 0,
    },
  },

  // ─── Zone 3: Ironhold Pass (Level 20-30) ──────────────────
  zone_ironhold_pass: {
    id: 'zone_ironhold_pass',
    name: 'Ironhold Pass',
    description:
      'A treacherous mountain pass cutting through the Ironspine foothills. Bandits control many of the narrow ravines and stone elementals roam the rocky peaks. Ancient dwarven watchtowers dot the ridgeline, some still maintained by Ironhold Covenant patrols. The air grows thin and cold at higher elevations.',
    level_range: [20, 30],
    biome: 'mountain_pass',
    pvp_enabled: true,
    parent_region_id: 'ironspine_peaks',
    width: 192,
    height: 192,
    spawn_points: [
      { x: 96, y: 180 },  // Southern entrance from Thornwood
      { x: 96, y: 12 },   // Northern exit to Ironhold proper
      { x: 48, y: 96 },   // Western watchtower
      { x: 144, y: 96 },  // Eastern mining camp
    ],
    npc_spawns: [
      { npc_id: 'npc_commander_durak', x: 96, y: 176 },
      { npc_id: 'npc_quartermaster_sven', x: 98, y: 178 },
      { npc_id: 'npc_engineer_tock', x: 144, y: 94 },
      { npc_id: 'npc_faction_ironhold_envoy', x: 94, y: 174 },
      { npc_id: 'npc_faction_voidwalker_spy', x: 50, y: 100 },
      { npc_id: 'npc_trainer_cleric_sister_lirael', x: 92, y: 172 },
      { npc_id: 'npc_trainer_druid_thorn', x: 46, y: 94 },
      { npc_id: 'npc_weapon_vendor_bjorn', x: 100, y: 176 },
      { npc_id: 'npc_quest_geologist_pebble', x: 140, y: 90 },
      { npc_id: 'npc_quest_refugee_leader', x: 96, y: 120 },
    ],
    monster_spawns: [
      // Level 20-22 — lower pass
      { monster_id: 'monster_bandit_captain', x: 80, y: 160, respawn_time: 90 },
      { monster_id: 'monster_bandit_captain', x: 112, y: 160, respawn_time: 90 },
      { monster_id: 'monster_bandit_captain', x: 80, y: 140, respawn_time: 90 },
      { monster_id: 'monster_bandit_captain', x: 112, y: 140, respawn_time: 90 },
      { monster_id: 'monster_stone_elemental', x: 96, y: 150, respawn_time: 120 },
      { monster_id: 'monster_stone_elemental', x: 64, y: 130, respawn_time: 120 },
      { monster_id: 'monster_stone_elemental', x: 128, y: 130, respawn_time: 120 },
      // Level 23-26 — mid pass
      { monster_id: 'monster_stone_elemental', x: 80, y: 100, respawn_time: 120 },
      { monster_id: 'monster_stone_elemental', x: 112, y: 100, respawn_time: 120 },
      { monster_id: 'monster_stone_elemental', x: 96, y: 80, respawn_time: 120 },
      { monster_id: 'monster_bandit_captain', x: 64, y: 80, respawn_time: 90 },
      { monster_id: 'monster_bandit_captain', x: 128, y: 80, respawn_time: 90 },
      { monster_id: 'monster_ironhold_bandit', x: 48, y: 110, respawn_time: 75 },
      { monster_id: 'monster_ironhold_bandit', x: 144, y: 110, respawn_time: 75 },
      // Level 27-30 — upper pass / peaks
      { monster_id: 'monster_stone_giant', x: 96, y: 50, respawn_time: 180 },
      { monster_id: 'monster_stone_giant', x: 80, y: 40, respawn_time: 180 },
      { monster_id: 'monster_stone_giant', x: 112, y: 40, respawn_time: 180 },
      { monster_id: 'monster_ironhold_bandit', x: 64, y: 50, respawn_time: 75 },
      { monster_id: 'monster_ironhold_bandit', x: 128, y: 50, respawn_time: 75 },
      { monster_id: 'monster_bandit_overlord', x: 96, y: 30, respawn_time: 300 },
      { monster_id: 'monster_stone_elemental_elder', x: 80, y: 20, respawn_time: 300 },
      { monster_id: 'monster_stone_elemental_elder', x: 112, y: 20, respawn_time: 300 },
      { monster_id: 'monster_ancient_dragon', x: 96, y: 10, respawn_time: 3600 },
    ],
    resource_nodes: [
      // High-tier herbs
      { type: ProfessionType.HERBALISM, x: 70, y: 120, respawn_time: 180 },
      { type: ProfessionType.HERBALISM, x: 122, y: 100, respawn_time: 180 },
      { type: ProfessionType.HERBALISM, x: 96, y: 60, respawn_time: 180 },
      { type: ProfessionType.HERBALISM, x: 50, y: 70, respawn_time: 180 },
      // Ore (rich veins)
      { type: ProfessionType.MINING, x: 40, y: 100, respawn_time: 240 },
      { type: ProfessionType.MINING, x: 152, y: 100, respawn_time: 240 },
      { type: ProfessionType.MINING, x: 60, y: 50, respawn_time: 240 },
      { type: ProfessionType.MINING, x: 132, y: 50, respawn_time: 240 },
      { type: ProfessionType.MINING, x: 96, y: 25, respawn_time: 240 },
      // Skinning
      { type: ProfessionType.SKINNING, x: 80, y: 160, respawn_time: 100 },
      { type: ProfessionType.SKINNING, x: 112, y: 140, respawn_time: 100 },
    ],
    teleport_points: [
      { x: 96, y: 180 },  // Southern entrance
      { x: 48, y: 96 },   // Western watchtower
      { x: 144, y: 96 },  // Eastern mining camp
      { x: 96, y: 12 },   // Northern exit
    ],
    weather_weights: {
      [WeatherType.CLEAR]: 25,
      [WeatherType.RAIN]: 15,
      [WeatherType.FOG]: 20,
      [WeatherType.STORM]: 15,
      [WeatherType.SNOW]: 20,
      [WeatherType.SANDSTORM]: 5,
    },
  },
};
