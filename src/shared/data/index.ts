// ============================================================
// Nexus Realms — Data Index
// Re-export all game data modules
// ============================================================

export { ZONES } from './zones';
export type { ZoneDefinition } from '../types';

export { MONSTERS } from './monsters';
export type { MonsterTemplate } from './monsters';

export { ITEMS } from './items';
export type { ItemDefinition } from './items';

export { ABILITIES } from './abilities';
export type { AbilityDefinition } from './abilities';

export { QUESTS } from './quests';
export type { QuestDefinition, QuestObjective, QuestReward, QuestDialogue } from './quests';

export { NPCs } from './npcs';
export type { NPCDefinition, NPCShopItem, NPCScheduleEntry } from './npcs';

export { RECIPES } from './recipes';
export type { RecipeDefinition, RecipeMaterial } from './recipes';
