// ============================================================
// Nexus Realms — WebSocket Protocol Definitions
// Message validation schemas using Zod
// ============================================================
import { z } from 'zod';
import {
  Direction, ClassType, EquipmentSlot, ChatChannel,
  QuestStatus, ItemType, ItemRarity, PvPMode, DamageType,
} from './types';

// ─── Zod Enums ───────────────────────────────────────────────
const DirectionEnum = z.nativeEnum(Direction);
const ClassTypeEnum = z.nativeEnum(ClassType);
const EquipmentSlotEnum = z.nativeEnum(EquipmentSlot);
const ChatChannelEnum = z.nativeEnum(ChatChannel);
const PvPModeEnum = z.nativeEnum(PvPMode);

// ─── Message Envelope ────────────────────────────────────────
export const WSMessageSchema = z.object({
  type: z.string(),
  data: z.record(z.unknown()),
  timestamp: z.number(),
  sequence: z.number().optional(),
});
export type WSMessageValidated = z.infer<typeof WSMessageSchema>;

// ─── Client → Server Messages ────────────────────────────────
export const CS_AUTH_LOGIN = z.object({
  username: z.string().min(3).max(32),
  password_hash: z.string(),
});

export const CS_AUTH_TOKEN = z.object({
  token: z.string(),
});

export const CS_PLAYER_MOVE = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  direction: DirectionEnum,
});

export const CS_PLAYER_ATTACK = z.object({
  target_id: z.string().uuid(),
  ability_id: z.string(),
});

export const CS_PLAYER_USE_ABILITY = z.object({
  ability_id: z.string(),
  target_id: z.string().uuid().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});

export const CS_PLAYER_INTERACT = z.object({
  target_id: z.string(),
});

export const CS_PLAYER_LOOT = z.object({
  corpse_id: z.string().uuid(),
  item_ids: z.array(z.string().uuid()),
});

export const CS_INVENTORY_MOVE = z.object({
  from_slot: z.number().int().min(0).max(35),
  to_slot: z.number().int().min(0).max(35),
});

export const CS_INVENTORY_USE_ITEM = z.object({
  slot: z.number().int().min(0).max(35),
});

export const CS_EQUIPMENT_EQUIP = z.object({
  item_slot: z.number().int().min(0).max(35),
  equip_slot: EquipmentSlotEnum,
});

export const CS_EQUIPMENT_UNEQUIP = z.object({
  equip_slot: EquipmentSlotEnum,
});

export const CS_CHAT_SEND = z.object({
  channel: ChatChannelEnum,
  message: z.string().min(1).max(500),
  target: z.string().optional(),
});

export const CS_QUEST_ACCEPT = z.object({ quest_id: z.string() });
export const CS_QUEST_COMPLETE = z.object({ quest_id: z.string() });
export const CS_QUEST_ABANDON = z.object({ quest_id: z.string() });

export const CS_TRADE_REQUEST = z.object({ target_id: z.string().uuid() });
export const CS_TRADE_OFFER = z.object({
  items: z.array(z.object({ slot: z.number().int(), quantity: z.number().int().positive() })).max(10),
  gold: z.number().int().min(0),
});
export const CS_TRADE_CONFIRM = z.object({});
export const CS_TRADE_CANCEL = z.object({});

export const CS_GUILD_CREATE = z.object({ name: z.string().min(3).max(32) });
export const CS_GUILD_INVITE = z.object({ character_id: z.string().uuid() });
export const CS_GUILD_ACCEPT_INVITE = z.object({ guild_id: z.string().uuid() });
export const CS_GUILD_LEAVE = z.object({});

export const CS_AUCTION_LIST = z.object({
  item_slot: z.number().int().min(0).max(35),
  price: z.number().int().positive(),
  duration_hours: z.union([z.literal(12), z.literal(24), z.literal(48)]),
});
export const CS_AUCTION_BUY = z.object({ listing_id: z.string().uuid() });
export const CS_AUCTION_SEARCH = z.object({
  filters: z.object({
    type: z.nativeEnum(ItemType).optional(),
    rarity: z.nativeEnum(ItemRarity).optional(),
    level_min: z.number().int().min(1).optional(),
    level_max: z.number().int().max(50).optional(),
    name: z.string().optional(),
  }),
});

export const CS_CRAFTING_CRAFT = z.object({ recipe_id: z.string() });
export const CS_GATHERING_GATHER = z.object({ node_id: z.string() });
export const CS_PVP_QUEUE = z.object({ mode: PvPModeEnum });

// ─── Schema Map ──────────────────────────────────────────────
export const CLIENT_MESSAGE_SCHEMAS: Record<string, z.ZodSchema> = {
  'auth.login': CS_AUTH_LOGIN,
  'auth.token': CS_AUTH_TOKEN,
  'player.move': CS_PLAYER_MOVE,
  'player.attack': CS_PLAYER_ATTACK,
  'player.use_ability': CS_PLAYER_USE_ABILITY,
  'player.interact': CS_PLAYER_INTERACT,
  'player.loot': CS_PLAYER_LOOT,
  'inventory.move': CS_INVENTORY_MOVE,
  'inventory.use_item': CS_INVENTORY_USE_ITEM,
  'equipment.equip': CS_EQUIPMENT_EQUIP,
  'equipment.unequip': CS_EQUIPMENT_UNEQUIP,
  'chat.send': CS_CHAT_SEND,
  'quest.accept': CS_QUEST_ACCEPT,
  'quest.complete': CS_QUEST_COMPLETE,
  'quest.abandon': CS_QUEST_ABANDON,
  'trade.request': CS_TRADE_REQUEST,
  'trade.offer': CS_TRADE_OFFER,
  'trade.confirm': CS_TRADE_CONFIRM,
  'trade.cancel': CS_TRADE_CANCEL,
  'guild.create': CS_GUILD_CREATE,
  'guild.invite': CS_GUILD_INVITE,
  'guild.accept_invite': CS_GUILD_ACCEPT_INVITE,
  'guild.leave': CS_GUILD_LEAVE,
  'auction.list': CS_AUCTION_LIST,
  'auction.buy': CS_AUCTION_BUY,
  'auction.search': CS_AUCTION_SEARCH,
  'crafting.craft': CS_CRAFTING_CRAFT,
  'gathering.gather': CS_GATHERING_GATHER,
  'pvp.queue': CS_PVP_QUEUE,
};

// ─── Validation Helper ───────────────────────────────────────
export function validateMessage(type: string, data: unknown): { success: true; data: unknown } | { success: false; error: string } {
  const schema = CLIENT_MESSAGE_SCHEMAS[type];
  if (!schema) {
    return { success: false, error: `Unknown message type: ${type}` };
  }
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') };
}

// ─── Message Builder Helper ──────────────────────────────────
export function createMessage(type: string, data: Record<string, unknown>): string {
  return JSON.stringify({
    type,
    data,
    timestamp: Date.now(),
  });
}
