// ============================================================
// Nexus Realms — Shared Types & Constants
// Used by both client and server
// ============================================================

// ─── Core Constants ──────────────────────────────────────────
export const GAME_CONFIG = {
  TILE_SIZE: 32,
  SERVER_TICK_RATE: 20,        // ticks per second
  CLIENT_FPS: 60,
  MAX_PLAYERS_PER_ZONE: 100,
  VIEWPORT_WIDTH: 1280,
  VIEWPORT_HEIGHT: 720,
  CHUNK_SIZE: 16,              // 16x16 tiles per chunk
  MAX_LEVEL: 50,
  INVENTORY_SLOTS: 36,
  EQUIPMENT_SLOTS: 12,
  ABILITY_BAR_SLOTS: 10,
  MAX_PARTY_SIZE: 5,
  MAX_RAID_SIZE: 20,
  GUILD_MAX_MEMBERS: 150,
  TRADE_MAX_ITEMS: 10,
  MAIL_MAX_ATTACHMENTS: 5,
  AUCTION_DURATION_HOURS: [12, 24, 48],
  RESPAWN_TIME_MS: 5000,
  BUFF_TICK_INTERVAL_MS: 1000,
  DYNAMIC_EVENT_COOLDOWN_MS: 3600000,
} as const;

// ─── Enums ───────────────────────────────────────────────────
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  UP_LEFT = 'up_left',
  UP_RIGHT = 'up_right',
  DOWN_LEFT = 'down_left',
  DOWN_RIGHT = 'down_right',
}

export enum ClassType {
  WARRIOR = 'warrior',
  PALADIN = 'paladin',
  RANGER = 'ranger',
  ROGUE = 'rogue',
  MAGE = 'mage',
  NECROMANCER = 'necromancer',
  CLERIC = 'cleric',
  DRUID = 'druid',
}

export enum Specialization {
  // Warrior
  GLADIATOR = 'gladiator',
  GUARDIAN = 'guardian',
  BERSERKER = 'berserker',
  // Paladin
  CRUSADER = 'crusader',
  AVENGER = 'avenger',
  PROTECTOR = 'protector',
  // Ranger
  MARKSMAN = 'marksman',
  BEASTMASTER = 'beastmaster',
  TRAPPER = 'trapper',
  // Rogue
  ASSASSIN = 'assassin',
  BLADE_DANCER = 'blade_dancer',
  SHADOW = 'shadow',
  // Mage
  ELEMENTAL = 'elemental',
  ARCANE = 'arcane',
  FROST = 'frost',
  // Necromancer
  SUMMONER = 'summoner',
  AFFLICTION = 'affliction',
  BONE = 'bone',
  // Cleric
  HOLY = 'holy',
  DISCIPLINE = 'discipline',
  JUDGEMENT = 'judgement',
  // Druid
  RESTORATION = 'restoration',
  FERAL = 'feral',
  BALANCE = 'balance',
}

export enum ItemType {
  WEAPON_SWORD = 'weapon_sword',
  WEAPON_AXE = 'weapon_axe',
  WEAPON_MACE = 'weapon_mace',
  WEAPON_DAGGER = 'weapon_dagger',
  WEAPON_STAFF = 'weapon_staff',
  WEAPON_BOW = 'weapon_bow',
  WEAPON_WAND = 'weapon_wand',
  WEAPON_SHIELD = 'weapon_shield',
  ARMOR_CLOTH = 'armor_cloth',
  ARMOR_LEATHER = 'armor_leather',
  ARMOR_MAIL = 'armor_mail',
  ARMOR_PLATE = 'armor_plate',
  ACCESSORY_RING = 'accessory_ring',
  ACCESSORY_NECKLACE = 'accessory_necklace',
  ACCESSORY_TRINKET = 'accessory_trinket',
  CONSUMABLE_POTION = 'consumable_potion',
  CONSUMABLE_FOOD = 'consumable_food',
  CONSUMABLE_SCROLL = 'consumable_scroll',
  MATERIAL_HERB = 'material_herb',
  MATERIAL_ORE = 'material_ore',
  MATERIAL_CLOTH = 'material_cloth',
  MATERIAL_LEATHER = 'material_leather',
  MATERIAL_ESSENCE = 'material_essence',
  QUEST_ITEM = 'quest_item',
  CURRENCY = 'currency',
  FURNITURE = 'furniture',
  MOUNT_ITEM = 'mount_item',
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
}

export enum EquipmentSlot {
  HEAD = 'head',
  SHOULDERS = 'shoulders',
  CHEST = 'chest',
  HANDS = 'hands',
  LEGS = 'legs',
  FEET = 'feet',
  MAIN_HAND = 'main_hand',
  OFF_HAND = 'off_hand',
  RING_1 = 'ring_1',
  RING_2 = 'ring_2',
  NECKLACE = 'necklace',
  TRINKET = 'trinket',
}

export enum AbilityType {
  DAMAGE = 'damage',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  SUMMON = 'summon',
  TELEPORT = 'teleport',
  SHIELD = 'shield',
  DOT = 'dot',
  HOT = 'hot',
  AOE = 'aoe',
  CHANNEL = 'channel',
  PASSIVE = 'passive',
}

export enum DamageType {
  PHYSICAL = 'physical',
  FIRE = 'fire',
  ICE = 'ice',
  LIGHTNING = 'lightning',
  HOLY = 'holy',
  SHADOW = 'shadow',
  NATURE = 'nature',
  ARCANE = 'arcane',
}

export enum TargetType {
  SELF = 'self',
  SINGLE_ENEMY = 'single_enemy',
  SINGLE_ALLY = 'single_ally',
  AOE_ENEMY = 'aoe_enemy',
  AOE_ALLY = 'aoe_ally',
  AOE_SELF = 'aoe_self',
  CONE = 'cone',
  LINE = 'line',
  GROUND = 'ground',
}

export enum ChatChannel {
  SAY = 'say',
  YELL = 'yell',
  WHISPER = 'whisper',
  PARTY = 'party',
  GUILD = 'guild',
  TRADE = 'trade',
  GENERAL = 'general',
  SYSTEM = 'system',
}

export enum QuestType {
  MAIN_STORY = 'main_story',
  SIDE = 'side',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  DUNGEON = 'dungeon',
  RAID = 'raid',
  PROFESSION = 'profession',
  PVP = 'pvp',
}

export enum QuestStatus {
  AVAILABLE = 'available',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  TURNED_IN = 'turned_in',
}

export enum DynamicEventType {
  MONSTER_INVASION = 'monster_invasion',
  ESCORT = 'escort',
  DEFENSE = 'defense',
  BOSS_SPAWN = 'boss_spawn',
  RESOURCE_SURGE = 'resource_surge',
  PVP_ZONE = 'pvp_zone',
  TREASURE_HUNT = 'treasure_hunt',
}

export enum FactionId {
  IRONHOLD_COVENANT = 'ironhold_covenant',
  SYLVARI_ORDER = 'sylvari_order',
  VOIDWALKER_CONCLAVE = 'voidwalker_conclave',
}

export enum ProfessionType {
  HERBALISM = 'herbalism',
  MINING = 'mining',
  SKINNING = 'skinning',
  ALCHEMY = 'alchemy',
  BLACKSMITHING = 'blacksmithing',
  TAILORING = 'tailoring',
  ENGINEERING = 'engineering',
  COOKING = 'cooking',
  FISHING = 'fishing',
}

export enum PvPMode {
  FLAGGED = 'flagged',
  BATTLEGROUND = 'battleground',
  ARENA_2V2 = 'arena_2v2',
  ARENA_3V3 = 'arena_3v3',
}

export enum WeatherType {
  CLEAR = 'clear',
  RAIN = 'rain',
  STORM = 'storm',
  SNOW = 'snow',
  FOG = 'fog',
  SANDSTORM = 'sandstorm',
}

export enum GuildRank {
  LEADER = 'leader',
  OFFICER = 'officer',
  VETERAN = 'veteran',
  MEMBER = 'member',
  INITIATE = 'initiate',
}

export enum BindType {
  NONE = 'none',
  PICKUP = 'pickup',
  EQUIP = 'equip',
  QUEST = 'quest',
}

// ─── Interfaces ──────────────────────────────────────────────
export interface Vec2 {
  x: number;
  y: number;
}

export interface EntityStats {
  strength: number;
  agility: number;
  intellect: number;
  spirit: number;
  stamina: number;
  armor: number;
  fire_resist: number;
  ice_resist: number;
  lightning_resist: number;
  holy_resist: number;
  shadow_resist: number;
  nature_resist: number;
  critical_chance: number;   // 0-100
  critical_damage: number;   // multiplier (1.5 = 150%)
  haste: number;             // 0-100
  dodge: number;             // 0-100
  block: number;             // 0-100
  parry: number;             // 0-100
  hit_chance: number;        // 0-100
  spell_power: number;
  attack_power: number;
}

export interface EntityBase {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  zone_id: string;
}

export interface PlayerData extends EntityBase {
  account_id: string;
  name: string;
  class_type: ClassType;
  specialization: Specialization | null;
  level: number;
  experience: number;
  hp: number;
  max_hp: number;
  mana: number;
  max_mana: number;
  stats: EntityStats;
  equipment: Record<EquipmentSlot, ItemInstance | null>;
  inventory: (ItemInstance | null)[];
  abilities: AbilityInstance[];
  active_buffs: ActiveBuff[];
  quest_log: QuestProgress[];
  profession_data: Record<ProfessionType, ProfessionProgress>;
  guild_id: string | null;
  gold: number;
  pvp_flags: PvPFlags;
  reputation: Record<FactionId, number>;
  position_saved_at: number;
}

export interface ItemInstance {
  item_id: string;
  quantity: number;
  durability: number;
  max_durability: number;
  enchantments: Enchantment[];
  slot_index: number;
  rarity?: ItemRarity;
}

export interface Enchantment {
  type: string;
  value: number;
  stat: keyof EntityStats;
}

export interface AbilityInstance {
  ability_id: string;
  level: number;
  cooldown_ends_at: number;
  is_on_cooldown: boolean;
}

export interface ActiveBuff {
  buff_id: string;
  source_id: string;
  duration_remaining: number;
  max_duration: number;
  stacks: number;
  max_stacks: number;
  effects: BuffEffect[];
}

export interface BuffEffect {
  stat: keyof EntityStats;
  value: number;
  is_percentage: boolean;
}

export interface QuestProgress {
  quest_id: string;
  status: QuestStatus;
  objectives: { current: number; required: number }[];
  started_at: number;
}

export interface ProfessionProgress {
  level: number;
  experience: number;
  recipes: string[];
  current_craft: string | null;
}

export interface PvPFlags {
  flagged: boolean;
  flag_expires_at: number;
  kills: number;
  deaths: number;
  rating_2v2: number;
  rating_3v3: number;
  battleground_wins: number;
  honor_points: number;
}

export interface NPCData extends EntityBase {
  name: string;
  type: 'vendor' | 'quest_giver' | 'trainer' | 'faction' | 'enemy' | 'friendly';
  level: number;
  hp: number;
  max_hp: number;
  faction_id: FactionId | null;
  dialogue_id: string | null;
  shop_items: string[] | null;
  hostile: boolean;
}

export interface MonsterData extends EntityBase {
  monster_id: string;
  name: string;
  level: number;
  hp: number;
  max_hp: number;
  stats: EntityStats;
  hostile: boolean;
  aggro_range: number;
  leash_range: number;
  respawn_time: number;
  loot_table: LootEntry[];
  abilities: string[];
  is_boss: boolean;
}

export interface LootEntry {
  item_id: string;
  drop_chance: number;  // 0-1
  min_quantity: number;
  max_quantity: number;
}

export interface ZoneDefinition {
  id: string;
  name: string;
  description: string;
  level_range: [number, number];
  biome: string;
  pvp_enabled: boolean;
  parent_region_id: string;
  width: number;
  height: number;
  spawn_points: Vec2[];
  npc_spawns: { npc_id: string; x: number; y: number }[];
  monster_spawns: { monster_id: string; x: number; y: number; respawn_time: number }[];
  resource_nodes: { type: ProfessionType; x: number; y: number; respawn_time: number }[];
  teleport_points: Vec2[];
  weather_weights: Record<WeatherType, number>;
}

// ─── WebSocket Message Types ─────────────────────────────────
export interface WSMessage {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  sequence?: number;
}

// Client → Server
export interface CSAuthLogin { username: string; password_hash: string; }
export interface CSAuthToken { token: string; }
export interface CSPlayerMove { x: number; y: number; direction: Direction; }
export interface CSPlayerAttack { target_id: string; ability_id: string; }
export interface CSPlayerUseAbility { ability_id: string; target_id?: string; x?: number; y?: number; }
export interface CSPlayerInteract { target_id: string; }
export interface CSPlayerLoot { corpse_id: string; item_ids: string[]; }
export interface CSInventoryMove { from_slot: number; to_slot: number; }
export interface CSInventoryUseItem { slot: number; }
export interface CSEquipmentEquip { item_slot: number; equip_slot: EquipmentSlot; }
export interface CSEquipmentUnequip { equip_slot: EquipmentSlot; }
export interface CSChatSend { channel: ChatChannel; message: string; target?: string; }
export interface CSQuestAccept { quest_id: string; }
export interface CSQuestComplete { quest_id: string; }
export interface CSQuestAbandon { quest_id: string; }
export interface CSTradeRequest { target_id: string; }
export interface CSTradeOffer { items: { slot: number; quantity: number }[]; gold: number; }
export interface CSTradeConfirm {}
export interface CSTradeCancel {}
export interface CSGuildCreate { name: string; }
export interface CSGuildInvite { character_id: string; }
export interface CSGuildAcceptInvite { guild_id: string; }
export interface CSGuildLeave {}
export interface CSAuctionList { item_slot: number; price: number; duration_hours: number; }
export interface CSAuctionBuy { listing_id: string; }
export interface CSAuctionSearch { filters: { type?: ItemType; rarity?: ItemRarity; level_min?: number; level_max?: number; name?: string; }; }
export interface CSCraftingCraft { recipe_id: string; }
export interface CSGatheringGather { node_id: string; }
export interface CSPVPQueue { mode: PvPMode; }

// Server → Client
export interface SCAuthSuccess {
  player: PlayerData;
  world_state: { zone_id: string; time: number; weather: WeatherType };
}
export interface SCAuthFailure { reason: string; }
export interface SCPlayerSpawn { player: PlayerData; }
export interface SCPlayerDespawn { player_id: string; reason: 'logout' | 'zone_change' | 'death'; }
export interface SCPlayerMove { player_id: string; x: number; y: number; direction: Direction; speed: number; }
export interface SCHealthUpdate { entity_id: string; hp: number; max_hp: number; }
export interface SCManaUpdate { entity_id: string; mana: number; max_mana: number; }
export interface SCLevelUp { player_id: string; level: number; new_stats: EntityStats; }
export interface SCDied { entity_id: string; killer_id: string; respawn_at: number; }
export interface SCRespawn { entity_id: string; x: number; y: number; hp: number; mana: number; }
export interface SCEntitySpawn { entities: (MonsterData | NPCData)[]; }
export interface SCEntityDespawn { entity_ids: string[]; }
export interface SCEntityMove { entity_id: string; x: number; y: number; direction: Direction; }
export interface SCDamage { source_id: string; target_id: string; amount: number; damage_type: DamageType; critical: boolean; blocked: number; }
export interface SCHeal { source_id: string; target_id: string; amount: number; }
export interface SCAbilityUsed { caster_id: string; ability_id: string; target_id?: string; x?: number; y?: number; effects: string[]; }
export interface SCBuffApply { target_id: string; buff: ActiveBuff; }
export interface SCBuffRemove { target_id: string; buff_id: string; }
export interface SCLootDrop { corpse_id: string; items: ItemInstance[]; }
export interface SCInventoryUpdate { slots: { index: number; item: ItemInstance | null }[]; }
export interface SCEquipmentUpdate { slot: EquipmentSlot; item: ItemInstance | null; }
export interface SCChatMessage { channel: ChatChannel; sender_name: string; message: string; timestamp: number; }
export interface SCQuestUpdate { quest_id: string; progress: QuestProgress; }
export interface SCQuestCompleted { quest_id: string; rewards: { experience: number; gold: number; items: ItemInstance[] }; }
export interface SCNotification { type: 'info' | 'warning' | 'success' | 'error'; message: string; }
export interface SCDynamicEventStart { event_id: string; type: DynamicEventType; zone_id: string; description: string; duration: number; }
export interface SCDynamicEventUpdate { event_id: string; progress: number; phase: string; }
export interface SCDynamicEventEnd { event_id: string; results: { player_id: string; contribution: number; rewards: unknown }[]; }
export interface SCWeatherUpdate { zone_id: string; weather: WeatherType; intensity: number; }
export interface SCTimeUpdate { game_time: number; day_night: 'day' | 'night'; }
export interface SCPong {}
export interface SCError { code: string; message: string; }

// ─── Rarity Color Map ────────────────────────────────────────
export const RARITY_COLORS: Record<ItemRarity, string> = {
  [ItemRarity.COMMON]: '#9d9d9d',
  [ItemRarity.UNCOMMON]: '#1eff00',
  [ItemRarity.RARE]: '#0070dd',
  [ItemRarity.EPIC]: '#a335ee',
  [ItemRarity.LEGENDARY]: '#ff8000',
  [ItemRarity.MYTHIC]: '#e6cc80',
};

// ─── Class Base Stats ────────────────────────────────────────
export const CLASS_BASE_STATS: Record<ClassType, Partial<EntityStats>> = {
  [ClassType.WARRIOR]: { strength: 18, agility: 10, intellect: 6, spirit: 8, stamina: 16, armor: 15 },
  [ClassType.PALADIN]: { strength: 15, agility: 8, intellect: 10, spirit: 12, stamina: 14, armor: 14 },
  [ClassType.RANGER]: { strength: 10, agility: 18, intellect: 8, spirit: 10, stamina: 12, armor: 8 },
  [ClassType.ROGUE]: { strength: 12, agility: 18, intellect: 6, spirit: 8, stamina: 10, armor: 6 },
  [ClassType.MAGE]: { strength: 6, agility: 8, intellect: 18, spirit: 14, stamina: 8, armor: 4 },
  [ClassType.NECROMANCER]: { strength: 6, agility: 8, intellect: 16, spirit: 16, stamina: 8, armor: 4 },
  [ClassType.CLERIC]: { strength: 8, agility: 6, intellect: 14, spirit: 18, stamina: 12, armor: 10 },
  [ClassType.DRUID]: { strength: 10, agility: 10, intellect: 14, spirit: 16, stamina: 12, armor: 8 },
};

// ─── Level Experience Table ──────────────────────────────────
export function experienceForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.8) + 50 * level);
}

// ─── Stat Calculation Helpers ────────────────────────────────
export function calculateMaxHP(level: number, stamina: number, classType: ClassType): number {
  const baseHP = CLASS_BASE_STATS[classType]?.stamina ?? 10;
  return Math.floor((baseHP * 10 + stamina * 5) * (1 + (level - 1) * 0.05));
}

export function calculateMaxMana(level: number, intellect: number, classType: ClassType): number {
  const manaClasses = [ClassType.MAGE, ClassType.NECROMANCER, ClassType.CLERIC, ClassType.DRUID, ClassType.PALADIN];
  if (!manaClasses.includes(classType)) return 0;
  const baseMana = CLASS_BASE_STATS[classType]?.intellect ?? 10;
  return Math.floor((baseMana * 8 + intellect * 6) * (1 + (level - 1) * 0.04));
}

export function calculateDamage(
  attackPower: number,
  weaponDamage: number,
  targetArmor: number,
  criticalChance: number,
  criticalDamage: number,
): { damage: number; critical: boolean } {
  const baseDamage = attackPower * 0.5 + weaponDamage;
  const armorReduction = targetArmor / (targetArmor + 100);
  const afterArmor = baseDamage * (1 - armorReduction);
  const isCrit = Math.random() * 100 < criticalChance;
  const finalDamage = Math.floor(afterArmor * (isCrit ? criticalDamage : 1));
  return { damage: Math.max(1, finalDamage), critical: isCrit };
}

export function calculateHeal(spellPower: number, baseHeal: number): number {
  return Math.floor(baseHeal + spellPower * 0.6);
}
