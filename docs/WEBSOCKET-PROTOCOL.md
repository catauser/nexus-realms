# NEXUS REALMS — WebSocket Protocol Reference

> Version: 1.0.0 | Last Updated: 2026-07-16

---

## Table of Contents

1. [Protocol Overview](#1-protocol-overview)
2. [Message Envelope](#2-message-envelope)
3. [Error Codes](#3-error-codes)
4. [Client → Server Messages](#4-client--server-messages)
   - 4.1 [Authentication](#41-authentication)
   - 4.2 [Player](#42-player)
   - 4.3 [Inventory & Equipment](#43-inventory--equipment)
   - 4.4 [Chat](#44-chat)
   - 4.5 [Quest](#45-quest)
   - 4.6 [Trade](#46-trade)
   - 4.7 [Guild](#47-guild)
   - 4.8 [Auction](#48-auction)
   - 4.9 [Crafting & Gathering](#49-crafting--gathering)
   - 4.10 [Housing](#410-housing)
   - 4.11 [PvP](#411-pvp)
   - 4.12 [Social](#412-social)
   - 4.13 [Mail](#413-mail)
   - 4.14 [System](#414-system)
5. [Server → Client Messages](#5-server--client-messages)
   - 5.1 [Authentication](#51-authentication)
   - 5.2 [Player](#52-player)
   - 5.3 [Entity](#53-entity)
   - 5.4 [Combat](#54-combat)
   - 5.5 [Loot](#55-loot)
   - 5.6 [Inventory & Equipment](#56-inventory--equipment)
   - 5.7 [Chat](#57-chat)
   - 5.8 [Quest](#58-quest)
   - 5.9 [NPC](#59-npc)
   - 5.10 [Trade](#510-trade)
   - 5.11 [Guild](#511-guild)
   - 5.12 [Auction](#512-auction)
   - 5.13 [Crafting & Gathering](#513-crafting--gathering)
   - 5.14 [Housing](#514-housing)
   - 5.15 [PvP](#515-pvp)
   - 5.16 [Dynamic Events](#516-dynamic-events)
   - 5.17 [World](#517-world)
   - 5.18 [Social](#518-social)
   - 5.19 [Notification & System](#519-notification--system)

---

## 1. Protocol Overview

- **Transport**: WebSocket over TLS (`wss://`)
- **Format**: JSON text frames
- **Heartbeat**: Client sends `ping` every 30 seconds; server responds with `pong`
- **Sequence Numbers**: Client messages use incrementing sequence numbers for acknowledgment; server messages use per-tick sequence numbers
- **Compression**: Server may use permessage-deflate extension (negotiated during handshake)

---

## 2. Message Envelope

Every message follows this structure:

```json
{
  "t": "category.action",
  "d": { ... },
  "s": 12345,
  "ts": 1689478200000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `t` | string | Message type identifier (dot-separated namespace) |
| `d` | object | Payload data (type-specific, may be empty `{}`) |
| `s` | number | Sequence number (monotonically increasing per sender) |
| `ts` | number | Unix timestamp in milliseconds |

### Acknowledgment

For critical messages, the server responds with:

```json
{
  "t": "ack",
  "d": { "ref_s": 12345, "status": "ok" },
  "s": 67890,
  "ts": 1689478200050
}
```

---

## 3. Error Codes

| Code | Name | Description |
|------|------|-------------|
| **1001** | `AUTH_INVALID_CREDENTIALS` | Username or password incorrect |
| **1002** | `AUTH_ACCOUNT_BANNED` | Account is banned |
| **1003** | `AUTH_ACCOUNT_SUSPENDED` | Account is temporarily suspended |
| **1004** | `AUTH_TOKEN_EXPIRED` | Session token has expired |
| **1005** | `AUTH_TOKEN_INVALID` | Session token is invalid |
| **1006** | `AUTH_ALREADY_LOGGED_IN` | Character already logged in elsewhere |
| **1007** | `AUTH_CHARACTER_NOT_FOUND` | Selected character does not exist |
| **1008** | `AUTH_RATE_LIMITED` | Too many login attempts |
| **2001** | `PLAYER_INVALID_MOVE` | Movement destination is invalid (out of bounds, collision) |
| **2002** | `PLAYER_NOT_IN_ZONE` | Player is not in the specified zone |
| **2003** | `PLAYER_DEAD` | Cannot perform action while dead |
| **2004** | `PLAYER_STUNNED` | Cannot perform action while stunned |
| **2005** | `PLAYER_TOO_FAR` | Target is out of range |
| **2006** | `PLAYER_ON_COOLDOWN` | Ability or action is on cooldown |
| **2007** | `PLAYER_NOT_ENOUGH_MANA` | Insufficient mana |
| **2008** | `PLAYER_NOT_ENOUGH_RESOURCE` | Insufficient resource (energy, rage, etc.) |
| **3001** | `INVENTORY_FULL` | No empty inventory slots |
| **3002** | `INVENTORY_INVALID_SLOT` | Slot index is out of range |
| **3003** | `INVENTORY_SLOT_EMPTY` | No item in specified slot |
| **3004** | `INVENTORY_ITEM_NOT_FOUND` | Item does not exist in inventory |
| **3005** | `INVENTORY_CANNOT_STACK` | Items cannot be stacked (different enchantments, etc.) |
| **3006** | `EQUIP_LEVEL_TOO_LOW` | Character level too low for item |
| **3007** | `EQUIP_WRONG_CLASS` | Item cannot be equipped by this class |
| **3008** | `EQUIP_SLOT_INVALID` | Item cannot go in that equipment slot |
| **3009** | `EQUIP_ALREADY_BOUND` | Item is bound to another character |
| **4001** | `TRADE_INSUFFICIENT_GOLD` | Not enough gold for transaction |
| **4002** | `TRADE_ITEM_NOT_TRADEABLE` | Item cannot be traded |
| **4003** | `TRADE_TARGET_NOT_FOUND` | Trade partner not found or offline |
| **4004** | `TRADE_ALREADY_IN_PROGRESS` | Player already in a trade |
| **4005** | `TRADE_DECLINED` | Trade partner declined the request |
| **4006** | `AUCTION_NOT_FOUND` | Auction listing does not exist |
| **4007** | `AUCTION_EXPIRED` | Auction listing has expired |
| **4008** | `AUCTION_OWN_LISTING` | Cannot buy your own listing |
| **4009** | `AUCTION_MAX_LISTINGS` | Maximum active listings reached |
| **4010** | `CRAFTING_MISSING_MATERIALS` | Insufficient materials for recipe |
| **4011** | `CRAFTING_ON_COOLDOWN` | Recipe is on cooldown |
| **4012** | `CRAFTING_RECIPE_UNKNOWN` | Recipe not learned |
| **5001** | `GUILD_ALREADY_IN_GUILD` | Player is already in a guild |
| **5002** | `GUILD_NAME_TAKEN` | Guild name is already taken |
| **5003** | `GUILD_NOT_IN_GUILD` | Player is not in a guild |
| **5004** | `GUILD_INSUFFICIENT_RANK` | Rank too low for this action |
| **5005** | `GUILD_IS_LEADER` | Cannot leave guild as leader (must transfer first) |
| **5006** | `GUILD_FULL` | Guild has reached max members |
| **5007** | `FRIEND_SELF` | Cannot add yourself as a friend |
| **5008** | `FRIEND_ALREADY_EXISTS` | Already on friend list |
| **5009** | `FRIEND_LIST_FULL` | Friend list is full |
| **5010** | `MAIL_RECIPIENT_NOT_FOUND` | Mail recipient not found |
| **5011** | `MAIL_FULL` | Recipient mailbox is full |
| **5012** | `MAIL_ATTACHMENT_INVALID` | Cannot attach that item |
| **6001** | `COMBAT_TARGET_INVALID` | Target does not exist or is immune |
| **6002** | `COMBAT_NOT_IN_COMBAT` | Not currently in combat |
| **6003** | `COMBAT_ABILITY_NOT_LEARNED` | Ability not in spellbook |
| **6004** | `COMBAT_TARGET_FRIENDLY` | Cannot attack friendly target |
| **6005** | `COMBAT_PVP_NOT_FLAGGED` | PvP flag required |
| **7001** | `QUEST_NOT_AVAILABLE` | Quest is not available |
| **7002** | `QUEST_ALREADY_ACTIVE` | Quest is already active |
| **7003** | `QUEST_PREREQUISITES_NOT_MET` | Required quests not completed |
| **7004** | `QUEST_LEVEL_TOO_LOW` | Character level too low |
| **7005** | `QUEST_NOT_COMPLETE` | Quest objectives not yet met |
| **7006** | `QUEST_LOG_FULL` | Maximum active quests reached |
| **8001** | `HOUSING_NOT_OWNER` | Not the owner of this plot |
| **8002** | `HOUSING_INVALID_PLACEMENT` | Cannot place item at that location |
| **8003** | `HOUSING_NO_PLOT` | Player does not own a housing plot |
| **9001** | `SYSTEM_INTERNAL_ERROR` | Server internal error |
| **9002** | `SYSTEM_RATE_LIMITED` | Too many requests |
| **9003** | `SYSTEM_MAINTENANCE` | Server is under maintenance |
| **9004** | `SYSTEM_INVALID_MESSAGE` | Malformed message |

---

## 4. Client → Server Messages

### 4.1 Authentication

---

#### `auth.login`

Authenticate with username and password hash.

**Payload:**
```json
{
  "t": "auth.login",
  "d": {
    "username": "player123",
    "password_hash": "$argon2id$v=19$m=65536,t=3,p=4$...$...",
    "client_version": "1.0.0"
  },
  "s": 1,
  "ts": 1689478200000
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ | Account username (3-32 alphanumeric) |
| `password_hash` | string | ✅ | Argon2id hash of the password (client-side pre-hash) |
| `client_version` | string | ✅ | Client build version for compatibility check |

**Expected Response:** `auth.success` or `auth.failure`

**Error Cases:**
- `1001` — Invalid credentials
- `1002` — Account banned
- `1003` — Account suspended
- `1008` — Rate limited

---

#### `auth.token`

Reconnect with a session token (for reconnection after disconnect).

**Payload:**
```json
{
  "t": "auth.token",
  "d": {
    "token": "a1b2c3d4e5f6...",
    "character_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "s": 1,
  "ts": 1689478200000
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | ✅ | Session token received from previous `auth.success` |
| `character_id` | string (UUID) | ✅ | The character to resume playing |

**Expected Response:** `auth.success` (with world state) or `auth.failure`

**Error Cases:**
- `1004` — Token expired
- `1005` — Token invalid
- `1007` — Character not found

---

### 4.2 Player

---

#### `player.move`

Update player movement (sent continuously while moving).

**Payload:**
```json
{
  "t": "player.move",
  "d": {
    "x": 150.5,
    "y": 200.3,
    "direction": 3,
    "speed": 5.0,
    "input_seq": 42
  },
  "s": 15,
  "ts": 1689478200150
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `x` | number (float) | ✅ | Target X position (game units) |
| `y` | number (float) | ✅ | Target Y position (game units) |
| `direction` | integer | ✅ | Facing direction (0-7, 0=North, clockwise) |
| `speed` | number (float) | ✅ | Current movement speed (game units/second) |
| `input_seq` | integer | ✅ | Client input sequence number for reconciliation |

**Expected Response:** Server broadcasts `player.move` to nearby players (including sender for reconciliation)

**Error Cases:**
- `2001` — Invalid move destination
- `2003` — Player is dead
- `2004` — Player is stunned

---

#### `player.attack`

Attack a target entity.

**Payload:**
```json
{
  "t": "player.attack",
  "d": {
    "target_id": "550e8400-e29b-41d4-a716-446655440001",
    "ability_id": "warrior_slash",
    "facing": 4
  },
  "s": 16,
  "ts": 1689478200200
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target_id` | string (UUID) | ✅ | Entity being attacked |
| `ability_id` | string | ✅ | Ability being used (basic attack = "melee") |
| `facing` | integer | ✅ | Direction player is facing during attack |

**Expected Response:** `combat.damage` broadcast, `combat.ability_used` broadcast

**Error Cases:**
- `6001` — Target invalid
- `6003` — Ability not learned
- `6004` — Target is friendly
- `2003` — Player is dead
- `2005` — Target too far
- `2006` — Ability on cooldown
- `2007` — Not enough mana

---

#### `player.use_ability`

Use a targeted or ground-targeted ability.

**Payload (target-based):**
```json
{
  "t": "player.use_ability",
  "d": {
    "ability_id": "mage_fireball",
    "target_id": "550e8400-e29b-41d4-a716-446655440001"
  },
  "s": 17,
  "ts": 1689478200250
}
```

**Payload (ground-targeted):**
```json
{
  "t": "player.use_ability",
  "d": {
    "ability_id": "mage_blizzard",
    "target_x": 155.0,
    "target_y": 210.0
  },
  "s": 17,
  "ts": 1689478200250
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ability_id` | string | ✅ | Ability identifier |
| `target_id` | string (UUID) | ❌ | Target entity (for targeted abilities) |
| `target_x` | number | ❌ | Ground target X (for ground-targeted abilities) |
| `target_y` | number | ❌ | Ground target Y (for ground-targeted abilities) |

**Expected Response:** `combat.ability_used` broadcast, `combat.damage` or `combat.heal`

**Error Cases:**
- `6001` — Target invalid
- `6003` — Ability not learned
- `2006` — On cooldown
- `2007` — Not enough mana
- `2008` — Not enough resource

---

#### `player.interact`

Interact with an NPC or world object.

**Payload:**
```json
{
  "t": "player.interact",
  "d": {
    "target_id": "550e8400-e29b-41d4-a716-446655440002"
  },
  "s": 18,
  "ts": 1689478200300
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target_id` | string (UUID) | ✅ | NPC or object to interact with |

**Expected Response:** `npc.dialogue`, `npc.shop`, or context-specific response

**Error Cases:**
- `2005` — Too far from target
- `2003` — Player is dead

---

#### `player.loot`

Loot items from a corpse or loot container.

**Payload:**
```json
{
  "t": "player.loot",
  "d": {
    "corpse_id": "550e8400-e29b-41d4-a716-446655440003",
    "item_ids": ["item-uuid-1", "item-uuid-2"]
  },
  "s": 19,
  "ts": 1689478200350
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `corpse_id` | string (UUID) | ✅ | The corpse/container entity ID |
| `item_ids` | string[] | ✅ | Specific item IDs to loot (empty = loot all) |

**Expected Response:** `loot.looted` for each item, `inventory.update`

**Error Cases:**
- `3001` — Inventory full
- `2005` — Too far from corpse

---

### 4.3 Inventory & Equipment

---

#### `inventory.move`

Move an item between inventory slots.

**Payload:**
```json
{
  "t": "inventory.move",
  "d": {
    "from_bag": 0,
    "from_slot": 5,
    "to_bag": 0,
    "to_slot": 12
  },
  "s": 20,
  "ts": 1689478200400
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `from_bag` | integer | ✅ | Source bag index (0 = main backpack) |
| `from_slot` | integer | ✅ | Source slot index |
| `to_bag` | integer | ✅ | Destination bag index |
| `to_slot` | integer | ✅ | Destination slot index |

**Expected Response:** `inventory.update` with affected slots

**Error Cases:**
- `3002` — Invalid slot
- `3003` — Source slot is empty

---

#### `inventory.use_item`

Use a consumable item from inventory.

**Payload:**
```json
{
  "t": "inventory.use_item",
  "d": {
    "slot": 5,
    "bag": 0,
    "target_id": null
  },
  "s": 21,
  "ts": 1689478200450
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slot` | integer | ✅ | Inventory slot of the item |
| `bag` | integer | ✅ | Bag index |
| `target_id` | string (UUID) | ❌ | Target for targeted consumables |

**Expected Response:** `inventory.update`, `player.health_update` or `player.mana_update` if applicable

**Error Cases:**
- `3003` — Slot is empty
- `3004` — Item is not a consumable
- `2006` — Item on cooldown

---

#### `equipment.equip`

Equip an item from inventory.

**Payload:**
```json
{
  "t": "equipment.equip",
  "d": {
    "item_bag": 0,
    "item_slot": 5,
    "equip_slot": "main_hand"
  },
  "s": 22,
  "ts": 1689478200500
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `item_bag` | integer | ✅ | Bag containing the item |
| `item_slot` | integer | ✅ | Slot containing the item |
| `equip_slot` | string | ✅ | Equipment slot to equip into |

**Expected Response:** `equipment.update`, `inventory.update`

**Error Cases:**
- `3003` — Slot is empty
- `3006` — Level too low
- `3007` — Wrong class
- `3008` — Invalid slot for item type

---

#### `equipment.unequip`

Unequip an item to inventory.

**Payload:**
```json
{
  "t": "equipment.unequip",
  "d": {
    "equip_slot": "main_hand",
    "to_bag": 0,
    "to_slot": 15
  },
  "s": 23,
  "ts": 1689478200550
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `equip_slot` | string | ✅ | Equipment slot to unequip |
| `to_bag` | integer | ✅ | Destination bag |
| `to_slot` | integer | ✅ | Destination slot |

**Expected Response:** `equipment.update`, `inventory.update`

**Error Cases:**
- `3002` — Invalid destination slot
- `3001` — Inventory full (no slot specified and no empty slots)

---

### 4.4 Chat

---

#### `chat.send`

Send a chat message.

**Payload:**
```json
{
  "t": "chat.send",
  "d": {
    "channel": "zone",
    "message": "Anyone want to group for the dungeon?",
    "target_name": null
  },
  "s": 24,
  "ts": 1689478200600
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `channel` | string | ✅ | Chat channel (`global`, `zone`, `party`, `guild`, `whisper`, `trade`, `lfg`) |
| `message` | string | ✅ | Message text (max 500 characters) |
| `target_name` | string | ❌ | Target player name (required for `whisper` channel) |

**Expected Response:** `chat.message` broadcast (or `chat.message` to target for whisper)

**Error Cases:**
- `9002` — Rate limited (too many messages)
- `5003` — Not in a guild (for guild channel)

---

#### `chat.join_channel`

Join a chat channel.

**Payload:**
```json
{
  "t": "chat.join_channel",
  "d": {
    "channel": "trade"
  },
  "s": 25,
  "ts": 1689478200650
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `channel` | string | ✅ | Channel to join |

**Expected Response:** `ack`

**Error Cases:**
- `9002` — Already in channel

---

### 4.5 Quest

---

#### `quest.accept`

Accept a quest from an NPC.

**Payload:**
```json
{
  "t": "quest.accept",
  "d": {
    "quest_id": "550e8400-e29b-41d4-a716-446655440010"
  },
  "s": 26,
  "ts": 1689478200700
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quest_id` | string (UUID) | ✅ | Quest to accept |

**Expected Response:** `quest.update` (with initial progress)

**Error Cases:**
- `7001` — Quest not available
- `7002` — Already active
- `7003` — Prerequisites not met
- `7004` — Level too low
- `7006` — Quest log full

---

#### `quest.complete`

Turn in a completed quest.

**Payload:**
```json
{
  "t": "quest.complete",
  "d": {
    "quest_id": "550e8400-e29b-41d4-a716-446655440010",
    "choice_index": null
  },
  "s": 27,
  "ts": 1689478200750
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quest_id` | string (UUID) | ✅ | Quest to complete |
| `choice_index` | integer | ❌ | Index of chosen reward (if quest has choices) |

**Expected Response:** `quest.completed` with rewards

**Error Cases:**
- `7005` — Objectives not met
- `3001` — Inventory full (can't receive item rewards)

---

#### `quest.abandon`

Abandon an active quest.

**Payload:**
```json
{
  "t": "quest.abandon",
  "d": {
    "quest_id": "550e8400-e29b-41d4-a716-446655440010"
  },
  "s": 28,
  "ts": 1689478200800
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quest_id` | string (UUID) | ✅ | Quest to abandon |

**Expected Response:** `ack`

**Error Cases:**
- None (abandoning is always allowed for active quests)

---

### 4.6 Trade

---

#### `trade.request`

Request a trade with another player.

**Payload:**
```json
{
  "t": "trade.request",
  "d": {
    "target_id": "550e8400-e29b-41d4-a716-446655440005"
  },
  "s": 29,
  "ts": 1689478200850
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target_id` | string (UUID) | ✅ | Player to trade with |

**Expected Response:** `trade.request` sent to target

**Error Cases:**
- `2005` — Target too far
- `4003` — Target not found/offline
- `4004` — Already in a trade

---

#### `trade.offer`

Add items or gold to the trade window.

**Payload:**
```json
{
  "t": "trade.offer",
  "d": {
    "items": [
      { "bag": 0, "slot": 5, "quantity": 1 },
      { "bag": 0, "slot": 8, "quantity": 3 }
    ],
    "gold": 500
  },
  "s": 30,
  "ts": 1689478200900
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | array | ✅ | Items to offer (can be empty) |
| `items[].bag` | integer | ✅ | Bag index |
| `items[].slot` | integer | ✅ | Slot index |
| `items[].quantity` | integer | ✅ | Quantity to offer |
| `gold` | integer | ✅ | Gold to offer (can be 0) |

**Expected Response:** `trade.item_added` sent to trade partner

**Error Cases:**
- `4001` — Insufficient gold
- `4002` — Item not tradeable
- `3003` — Slot is empty

---

#### `trade.confirm`

Confirm the trade (both players must confirm).

**Payload:**
```json
{
  "t": "trade.confirm",
  "d": {},
  "s": 31,
  "ts": 1689478200950
}
```

**Expected Response:** `trade.confirmed` (tells partner you confirmed); `trade.completed` when both confirm

**Error Cases:**
- `3001` — Inventory full (partner can't receive items)

---

#### `trade.cancel`

Cancel an active trade.

**Payload:**
```json
{
  "t": "trade.cancel",
  "d": {},
  "s": 32,
  "ts": 1689478201000
}
```

**Expected Response:** `trade.cancelled` sent to both players

---

### 4.7 Guild

---

#### `guild.create`

Create a new guild.

**Payload:**
```json
{
  "t": "guild.create",
  "d": {
    "name": "Knights of Dawn"
  },
  "s": 33,
  "ts": 1689478201050
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Guild name (2-32 alphanumeric/spaces) |

**Expected Response:** `guild.info` with new guild data

**Error Cases:**
- `5001` — Already in a guild
- `5002` — Name taken
- `4001` — Insufficient gold (guild creation costs gold)

---

#### `guild.invite`

Invite a player to the guild.

**Payload:**
```json
{
  "t": "guild.invite",
  "d": {
    "character_id": "550e8400-e29b-41d4-a716-446655440006"
  },
  "s": 34,
  "ts": 1689478201100
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `character_id` | string (UUID) | ✅ | Player to invite |

**Expected Response:** Invitation notification sent to target

**Error Cases:**
- `5003` — Not in a guild
- `5004` — Insufficient rank (need officer+)
- `5006` — Guild is full
- `5001` — Target already in a guild

---

#### `guild.accept_invite`

Accept a guild invitation.

**Payload:**
```json
{
  "t": "guild.accept_invite",
  "d": {
    "guild_id": "550e8400-e29b-41d4-a716-446655440007"
  },
  "s": 35,
  "ts": 1689478201150
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `guild_id` | string (UUID) | ✅ | Guild to join |

**Expected Response:** `guild.info` with guild data

**Error Cases:**
- `5001` — Already in a guild
- `5006` — Guild is full

---

#### `guild.leave`

Leave the current guild.

**Payload:**
```json
{
  "t": "guild.leave",
  "d": {},
  "s": 36,
  "ts": 1689478201200
}
```

**Expected Response:** `ack`

**Error Cases:**
- `5003` — Not in a guild
- `5005` — Is guild leader (must transfer leadership first)

---

#### `guild.promote`

Promote a guild member.

**Payload:**
```json
{
  "t": "guild.promote",
  "d": {
    "character_id": "550e8400-e29b-41d4-a716-446655440006"
  },
  "s": 37,
  "ts": 1689478201250
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `character_id` | string (UUID) | ✅ | Member to promote |

**Expected Response:** `guild.info` (updated member list)

**Error Cases:**
- `5004` — Insufficient rank (can only promote those below you)

---

#### `guild.demote`

Demote a guild member.

**Payload:**
```json
{
  "t": "guild.demote",
  "d": {
    "character_id": "550e8400-e29b-41d4-a716-446655440006"
  },
  "s": 38,
  "ts": 1689478201300
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `character_id` | string (UUID) | ✅ | Member to demote |

**Expected Response:** `guild.info` (updated member list)

**Error Cases:**
- `5004` — Insufficient rank

---

### 4.8 Auction

---

#### `auction.list`

List an item on the auction house.

**Payload:**
```json
{
  "t": "auction.list",
  "d": {
    "item_bag": 0,
    "item_slot": 5,
    "quantity": 1,
    "price": 500,
    "buyout_price": 1000,
    "duration": "24h"
  },
  "s": 39,
  "ts": 1689478201350
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `item_bag` | integer | ✅ | Bag containing the item |
| `item_slot` | integer | ✅ | Slot containing the item |
| `quantity` | integer | ✅ | Quantity to list |
| `price` | integer | ✅ | Starting/bid price (copper) |
| `buyout_price` | integer | ❌ | Instant buy price (null = no buyout) |
| `duration` | string | ✅ | Listing duration (`"2h"`, `"8h"`, `"24h"`, `"48h"`) |

**Expected Response:** `ack`

**Error Cases:**
- `3003` — Slot is empty
- `4002` — Item not tradeable
- `4009` — Max listings reached
- `4001` — Insufficient listing fee

---

#### `auction.buy`

Buy an auction listing (buyout).

**Payload:**
```json
{
  "t": "auction.buy",
  "d": {
    "listing_id": "550e8400-e29b-41d4-a716-446655440020"
  },
  "s": 40,
  "ts": 1689478201400
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `listing_id` | string (UUID) | ✅ | Auction listing to buy |

**Expected Response:** `auction.sold` (to seller), `inventory.update` (to buyer)

**Error Cases:**
- `4006` — Listing not found
- `4007` — Listing expired
- `4008` — Can't buy own listing
- `4001` — Insufficient gold
- `3001` — Inventory full

---

#### `auction.search`

Search the auction house.

**Payload:**
```json
{
  "t": "auction.search",
  "d": {
    "filters": {
      "name": "sword",
      "type": "weapon",
      "rarity": "rare",
      "level_min": 10,
      "level_max": 30,
      "class": "warrior",
      "sort": "price_asc",
      "page": 1
    }
  },
  "s": 41,
  "ts": 1689478201450
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filters.name` | string | ❌ | Name search (fuzzy) |
| `filters.type` | string | ❌ | Item type filter |
| `filters.rarity` | string | ❌ | Rarity filter |
| `filters.level_min` | integer | ❌ | Minimum level requirement |
| `filters.level_max` | integer | ❌ | Maximum level requirement |
| `filters.class` | string | ❌ | Class requirement filter |
| `filters.sort` | string | ❌ | Sort order (`price_asc`, `price_desc`, `level_asc`, `level_desc`, `recent`) |
| `filters.page` | integer | ❌ | Page number (default: 1, 50 results per page) |

**Expected Response:** `auction.results`

---

### 4.9 Crafting & Gathering

---

#### `crafting.craft`

Craft an item using a recipe.

**Payload:**
```json
{
  "t": "crafting.craft",
  "d": {
    "recipe_id": "recipe_iron_sword",
    "quantity": 1
  },
  "s": 42,
  "ts": 1689478201500
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recipe_id` | string | ✅ | Recipe to craft |
| `quantity` | integer | ✅ | Number to craft (default: 1) |

**Expected Response:** `crafting.result`

**Error Cases:**
- `4010` — Missing materials
- `4011` — Recipe on cooldown
- `4012` — Recipe not learned
- `3001` — Inventory full

---

#### `gathering.gather`

Gather from a resource node.

**Payload:**
```json
{
  "t": "gathering.gather",
  "d": {
    "node_id": "550e8400-e29b-41d4-a716-446655440030"
  },
  "s": 43,
  "ts": 1689478201550
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `node_id` | string (UUID) | ✅ | Gathering node entity ID |

**Expected Response:** `gathering.loot`

**Error Cases:**
- `2005` — Too far from node
- `2003` — Player is dead
- `3001` — Inventory full

---

### 4.10 Housing

---

#### `housing.place_item`

Place a furniture item in a housing plot.

**Payload:**
```json
{
  "t": "housing.place_item",
  "d": {
    "item_bag": 0,
    "item_slot": 10,
    "x": 5,
    "y": 3,
    "rotation": 90
  },
  "s": 44,
  "ts": 1689478201600
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `item_bag` | integer | ✅ | Bag containing the furniture item |
| `item_slot` | integer | ✅ | Slot containing the furniture item |
| `x` | integer | ✅ | X position in the plot grid |
| `y` | integer | ✅ | Y position in the plot grid |
| `rotation` | integer | ❌ | Rotation in degrees (0, 90, 180, 270; default: 0) |

**Expected Response:** `housing.placed`

**Error Cases:**
- `8001` — Not the plot owner
- `8002` — Invalid placement (collision, out of bounds)
- `3003` — Slot is empty

---

### 4.11 PvP

---

#### `pvp.queue`

Queue for a PvP match.

**Payload:**
```json
{
  "t": "pvp.queue",
  "d": {
    "mode": "arena_2v2",
    "team_members": ["550e8400-e29b-41d4-a716-446655440006"]
  },
  "s": 45,
  "ts": 1689478201650
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | string | ✅ | PvP mode (`arena_2v2`, `arena_3v3`, `battleground`) |
| `team_members` | string[] | ❌ | Pre-made team member IDs (arena only) |

**Expected Response:** `pvp.queue_update`

**Error Cases:**
- `2003` — Player is dead
- `4004` — Already in queue

---

#### `pvp.action`

Perform an action during a PvP match.

**Payload:**
```json
{
  "t": "pvp.action",
  "d": {
    "action_type": "use_ability",
    "data": {
      "ability_id": "warrior_charge",
      "target_id": "550e8400-e29b-41d4-a716-446655440008"
    }
  },
  "s": 46,
  "ts": 1689478201700
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action_type` | string | ✅ | Action type (`use_ability`, `move`, `use_item`, `surrender`) |
| `data` | object | ✅ | Action-specific data |

**Expected Response:** Appropriate combat/movement broadcasts within the match

---

### 4.12 Social

---

#### `social.friend_add`

Send a friend request.

**Payload:**
```json
{
  "t": "social.friend_add",
  "d": {
    "character_id": "550e8400-e29b-41d4-a716-446655440009"
  },
  "s": 47,
  "ts": 1689478201750
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `character_id` | string (UUID) | ✅ | Player to add as friend |

**Expected Response:** `social.friend_request` sent to target

**Error Cases:**
- `5007` — Can't add yourself
- `5008` — Already on list
- `5009` — Friend list full

---

#### `social.friend_remove`

Remove a friend or unblock.

**Payload:**
```json
{
  "t": "social.friend_remove",
  "d": {
    "character_id": "550e8400-e29b-41d4-a716-446655440009"
  },
  "s": 48,
  "ts": 1689478201800
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `character_id` | string (UUID) | ✅ | Friend to remove |

**Expected Response:** `ack`

---

### 4.13 Mail

---

#### `mail.send`

Send mail to another player.

**Payload:**
```json
{
  "t": "mail.send",
  "d": {
    "to_name": "OtherPlayer",
    "subject": "Trade items!",
    "body": "Here are the items we discussed.",
    "items": [
      { "bag": 0, "slot": 5, "quantity": 1 }
    ],
    "cod_amount": 0
  },
  "s": 49,
  "ts": 1689478201850
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `to_name` | string | ✅ | Recipient character name |
| `subject` | string | ✅ | Mail subject (max 128 chars) |
| `body` | string | ✅ | Mail body (max 2000 chars) |
| `items` | array | ❌ | Items to attach (max 5) |
| `items[].bag` | integer | ✅ | Bag index |
| `items[].slot` | integer | ✅ | Slot index |
| `items[].quantity` | integer | ✅ | Quantity to attach |
| `cod_amount` | integer | ❌ | Cash on delivery amount (0 = free) |

**Expected Response:** `ack`

**Error Cases:**
- `5010` — Recipient not found
- `5011` — Recipient mailbox full
- `5012` — Item not attachable
- `3003` — Slot is empty

---

#### `mail.read`

Read a mail message and collect attachments.

**Payload:**
```json
{
  "t": "mail.read",
  "d": {
    "mail_id": "550e8400-e29b-41d4-a716-446655440040",
    "collect_attachments": true
  },
  "s": 50,
  "ts": 1689478201900
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mail_id` | string (UUID) | ✅ | Mail to read |
| `collect_attachments` | boolean | ❌ | Whether to take attachments (default: false) |

**Expected Response:** `ack` with mail content; `inventory.update` if attachments collected

**Error Cases:**
- `3001` — Inventory full (if collecting attachments)
- `4001` — Insufficient gold (if COD)

---

### 4.14 System

---

#### `ping`

Heartbeat message to keep connection alive.

**Payload:**
```json
{
  "t": "ping",
  "d": {},
  "s": 51,
  "ts": 1689478201950
}
```

**Expected Response:** `pong`

---

## 5. Server → Client Messages

### 5.1 Authentication

---

#### `auth.success`

Successful authentication response.

**Payload:**
```json
{
  "t": "auth.success",
  "d": {
    "token": "a1b2c3d4e5f6...",
    "account": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "player123",
      "is_admin": false
    },
    "characters": [
      {
        "id": "char-uuid-1",
        "name": "Thorin",
        "class_id": "warrior",
        "level": 25,
        "zone_id": 3,
        "x": 100.5,
        "y": 200.3,
        "hp": 1500,
        "max_hp": 1800,
        "icon": "warrior_male_01"
      }
    ],
    "world_state": {
      "server_time": 1689478200000,
      "day_night_cycle": "day",
      "weather": "clear",
      "season": "summer"
    }
  },
  "s": 1,
  "ts": 1689478200000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | Session token for reconnection |
| `account.id` | string (UUID) | Account ID |
| `account.username` | string | Account username |
| `characters` | array | List of characters on this account |
| `world_state` | object | Current world state snapshot |

---

#### `auth.failure`

Authentication failure.

**Payload:**
```json
{
  "t": "auth.failure",
  "d": {
    "reason": "Invalid credentials",
    "code": 1001,
    "retry_after": null
  },
  "s": 1,
  "ts": 1689478200000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `reason` | string | Human-readable failure reason |
| `code` | number | Error code |
| `retry_after` | number (seconds) | Seconds until retry allowed (null = immediate) |

---

### 5.2 Player

---

#### `player.spawn`

A player has appeared in your view.

**Payload:**
```json
{
  "t": "player.spawn",
  "d": {
    "player_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Thorin",
    "class_id": "warrior",
    "level": 25,
    "x": 150.5,
    "y": 200.3,
    "direction": 0,
    "hp": 1500,
    "max_hp": 1800,
    "mana": 500,
    "max_mana": 600,
    "guild_name": "Knights of Dawn",
    "pvp_flagged": false,
    "buffs": [
      { "id": "food_buff", "duration": 120, "icon": "buff_food" }
    ],
    "equipment_visual": {
      "head": "helm_iron",
      "chest": "armor_plate",
      "main_hand": "sword_flame"
    }
  },
  "s": 100,
  "ts": 1689478200050
}
```

---

#### `player.despawn`

A player has left your view.

**Payload:**
```json
{
  "t": "player.despawn",
  "d": {
    "player_id": "550e8400-e29b-41d4-a716-446655440000",
    "reason": "out_of_range"
  },
  "s": 101,
  "ts": 1689478200100
}
```

| Field | Type | Description |
|-------|------|-------------|
| `player_id` | string (UUID) | Player who despawned |
| `reason` | string | `out_of_range`, `disconnected`, `teleported`, `died` |

---

#### `player.move`

Authoritative position update for a player.

**Payload:**
```json
{
  "t": "player.move",
  "d": {
    "player_id": "550e8400-e29b-41d4-a716-446655440000",
    "x": 151.0,
    "y": 200.5,
    "direction": 3,
    "speed": 5.0,
    "input_seq": 42
  },
  "s": 102,
  "ts": 1689478200150
}
```

| Field | Type | Description |
|-------|------|-------------|
| `player_id` | string (UUID) | Player who moved |
| `x`, `y` | number | Authoritative position |
| `direction` | integer | Facing direction (0-7) |
| `speed` | number | Current speed |
| `input_seq` | integer | Echoed client input sequence (for reconciliation) |

---

#### `player.health_update`

Health changed for a player.

**Payload:**
```json
{
  "t": "player.health_update",
  "d": {
    "player_id": "550e8400-e29b-41d4-a716-446655440000",
    "hp": 1200,
    "max_hp": 1800
  },
  "s": 103,
  "ts": 1689478200200
}
```

---

#### `player.mana_update`

Mana changed for a player.

**Payload:**
```json
{
  "t": "player.mana_update",
  "d": {
    "player_id": "550e8400-e29b-41d4-a716-446655440000",
    "mana": 350,
    "max_mana": 600
  },
  "s": 104,
  "ts": 1689478200250
}
```

---

#### `player.level_up`

A player has leveled up.

**Payload:**
```json
{
  "t": "player.level_up",
  "d": {
    "player_id": "550e8400-e29b-41d4-a716-446655440000",
    "level": 26,
    "new_stats": {
      "max_hp": 1900,
      "max_mana": 620,
      "strength": 45,
      "agility": 30
    }
  },
  "s": 105,
  "ts": 1689478200300
}
```

---

#### `player.died`

A player has died.

**Payload:**
```json
{
  "t": "player.died",
  "d": {
    "player_id": "550e8400-e29b-41d4-a716-446655440000",
    "killer_id": "npc-uuid-or-player-uuid",
    "killer_name": "Forest Wolf",
    "x": 150.0,
    "y": 200.0
  },
  "s": 106,
  "ts": 1689478200350
}
```

---

#### `player.respawn`

A player has respawned.

**Payload:**
```json
{
  "t": "player.respawn",
  "d": {
    "player_id": "550e8400-e29b-41d4-a716-446655440000",
    "x": 100.0,
    "y": 100.0,
    "hp": 900,
    "max_hp": 1800,
    "mana": 300,
    "max_mana": 600
  },
  "s": 107,
  "ts": 1689478200400
}
```

---

### 5.3 Entity

---

#### `entity.spawn`

Batch spawn entities in view.

**Payload:**
```json
{
  "t": "entity.spawn",
  "d": {
    "entities": [
      {
        "id": "npc-uuid-1",
        "type": "npc",
        "name": "Forest Wolf",
        "x": 160.0,
        "y": 210.0,
        "direction": 2,
        "hp": 500,
        "max_hp": 500,
        "level": 12,
        "hostile": true,
        "sprite": "wolf_brown",
        "buffs": []
      },
      {
        "id": "node-uuid-1",
        "type": "gathering_node",
        "name": "Iron Deposit",
        "x": 155.0,
        "y": 205.0,
        "node_type": "mining",
        "available": true,
        "sprite": "node_iron"
      }
    ]
  },
  "s": 110,
  "ts": 1689478200450
}
```

---

#### `entity.despawn`

Batch despawn entities.

**Payload:**
```json
{
  "t": "entity.despawn",
  "d": {
    "entity_ids": ["npc-uuid-1", "node-uuid-1"],
    "reason": "out_of_range"
  },
  "s": 111,
  "ts": 1689478200500
}
```

---

#### `entity.move`

Authoritative position update for an NPC/entity.

**Payload:**
```json
{
  "t": "entity.move",
  "d": {
    "entity_id": "npc-uuid-1",
    "x": 161.5,
    "y": 211.0,
    "direction": 4,
    "speed": 3.0,
    "state": "patrol"
  },
  "s": 112,
  "ts": 1689478200550
}
```

| Field | Type | Description |
|-------|------|-------------|
| `entity_id` | string (UUID) | Entity that moved |
| `x`, `y` | number | Position |
| `direction` | integer | Facing direction |
| `speed` | number | Movement speed |
| `state` | string | AI state (`idle`, `patrol`, `chase`, `attack`, `flee`) |

---

#### `entity.health_update`

Health changed for an NPC/entity.

**Payload:**
```json
{
  "t": "entity.health_update",
  "d": {
    "entity_id": "npc-uuid-1",
    "hp": 350,
    "max_hp": 500
  },
  "s": 113,
  "ts": 1689478200600
}
```

---

### 5.4 Combat

---

#### `combat.damage`

Damage dealt to a target.

**Payload:**
```json
{
  "t": "combat.damage",
  "d": {
    "source_id": "player-uuid",
    "target_id": "npc-uuid-1",
    "amount": 245,
    "type": "physical",
    "critical": true,
    "ability_id": "warrior_slash",
    "remaining_hp": 105,
    "max_hp": 500
  },
  "s": 120,
  "ts": 1689478200650
}
```

| Field | Type | Description |
|-------|------|-------------|
| `source_id` | string (UUID) | Who dealt the damage |
| `target_id` | string (UUID) | Who received the damage |
| `amount` | integer | Damage amount |
| `type` | string | Damage type (`physical`, `fire`, `frost`, `shadow`, `holy`, `nature`) |
| `critical` | boolean | Whether this was a critical hit |
| `ability_id` | string | Ability that caused the damage |
| `remaining_hp` | integer | Target HP after damage |
| `max_hp` | integer | Target max HP |

---

#### `combat.heal`

Healing applied to a target.

**Payload:**
```json
{
  "t": "combat.heal",
  "d": {
    "source_id": "player-uuid-healer",
    "target_id": "player-uuid",
    "amount": 350,
    "ability_id": "cleric_heal",
    "critical": false,
    "new_hp": 1550,
    "max_hp": 1800
  },
  "s": 121,
  "ts": 1689478200700
}
```

---

#### `combat.ability_used`

An ability was used (visual/sound trigger).

**Payload:**
```json
{
  "t": "combat.ability_used",
  "d": {
    "caster_id": "player-uuid",
    "ability_id": "mage_fireball",
    "target_id": "npc-uuid-1",
    "target_x": null,
    "target_y": null,
    "effects": [
      {
        "type": "damage",
        "amount": 320,
        "damage_type": "fire",
        "critical": false
      },
      {
        "type": "buff_apply",
        "buff_id": "burning",
        "duration": 8
      }
    ]
  },
  "s": 122,
  "ts": 1689478200750
}
```

---

#### `combat.buff_apply`

A buff/debuff was applied.

**Payload:**
```json
{
  "t": "combat.buff_apply",
  "d": {
    "target_id": "npc-uuid-1",
    "buff_id": "burning",
    "source_id": "player-uuid",
    "duration": 8,
    "stacks": 1,
    "max_stacks": 3,
    "effects": {
      "damage_per_second": 25,
      "movement_speed": -0.2
    },
    "icon": "debuff_fire"
  },
  "s": 123,
  "ts": 1689478200800
}
```

---

#### `combat.buff_remove`

A buff/debuff was removed.

**Payload:**
```json
{
  "t": "combat.buff_remove",
  "d": {
    "target_id": "npc-uuid-1",
    "buff_id": "burning",
    "reason": "expired"
  },
  "s": 124,
  "ts": 1689478200850
}
```

| Field | Type | Description |
|-------|------|-------------|
| `reason` | string | `expired`, `dispelled`, `replaced`, `death` |

---

### 5.5 Loot

---

#### `loot.drop`

Items dropped from a killed entity.

**Payload:**
```json
{
  "t": "loot.drop",
  "d": {
    "corpse_id": "corpse-uuid-1",
    "x": 160.0,
    "y": 210.0,
    "items": [
      {
        "loot_id": "loot-uuid-1",
        "item_id": "item-uuid-sword",
        "name": "Iron Sword",
        "rarity": "uncommon",
        "quantity": 1,
        "icon": "sword_iron"
      },
      {
        "loot_id": "loot-uuid-2",
        "item_id": "item-uuid-potion",
        "name": "Health Potion",
        "rarity": "common",
        "quantity": 3,
        "icon": "potion_hp"
      }
    ],
    "gold": 50,
    "owner_id": "player-uuid",
    "expires_at": 1689478500000
  },
  "s": 130,
  "ts": 1689478200900
}
```

---

#### `loot.looted`

An item was looted by a player.

**Payload:**
```json
{
  "t": "loot.looted",
  "d": {
    "character_id": "player-uuid",
    "loot_id": "loot-uuid-1",
    "item_id": "item-uuid-sword",
    "name": "Iron Sword",
    "quantity": 1,
    "slot": 15
  },
  "s": 131,
  "ts": 1689478200950
}
```

---

### 5.6 Inventory & Equipment

---

#### `inventory.update`

Inventory slots changed.

**Payload:**
```json
{
  "t": "inventory.update",
  "d": {
    "slots": [
      {
        "bag": 0,
        "slot": 5,
        "item_id": "item-uuid",
        "name": "Iron Sword",
        "quantity": 1,
        "rarity": "uncommon",
        "icon": "sword_iron",
        "type": "weapon",
        "stats": { "attack": 45 },
        "durability": 80,
        "max_durability": 100,
        "enchantments": []
      },
      {
        "bag": 0,
        "slot": 8,
        "item_id": null,
        "name": null,
        "quantity": 0
      }
    ]
  },
  "s": 140,
  "ts": 1689478201000
}
```

---

#### `equipment.update`

Equipment slot changed.

**Payload:**
```json
{
  "t": "equipment.update",
  "d": {
    "slot": "main_hand",
    "item_data": {
      "item_id": "item-uuid",
      "name": "Flame Sword",
      "rarity": "epic",
      "icon": "sword_flame",
      "type": "weapon",
      "stats": { "attack": 120, "fire_damage": 25, "crit_chance": 0.08 },
      "enchantments": [
        { "id": "ench_fire", "stat": "fire_damage", "value": 15 }
      ],
      "durability": 95,
      "max_durability": 100
    }
  },
  "s": 141,
  "ts": 1689478201050
}
```

---

### 5.7 Chat

---

#### `chat.message`

A chat message was sent.

**Payload:**
```json
{
  "t": "chat.message",
  "d": {
    "channel": "zone",
    "sender_id": "player-uuid",
    "sender_name": "Thorin",
    "message": "Anyone want to group for the dungeon?",
    "timestamp": 1689478201100,
    "sender_guild": "Knights of Dawn",
    "sender_level": 25
  },
  "s": 150,
  "ts": 1689478201100
}
```

---

#### `chat.system`

System message.

**Payload:**
```json
{
  "t": "chat.system",
  "d": {
    "message": "Server maintenance in 30 minutes.",
    "type": "warning",
    "channel": "system"
  },
  "s": 151,
  "ts": 1689478201150
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `info`, `warning`, `error`, `success`, `announcement` |

---

### 5.8 Quest

---

#### `quest.update`

Quest progress updated.

**Payload:**
```json
{
  "t": "quest.update",
  "d": {
    "quest_id": "quest-uuid",
    "quest_name": "Wolf Hunt",
    "objectives": [
      {
        "type": "kill",
        "target": "wolf",
        "description": "Kill Forest Wolves",
        "current": 7,
        "required": 10
      },
      {
        "type": "collect",
        "item": "wolf_pelt",
        "description": "Collect Wolf Pelts",
        "current": 3,
        "required": 5
      }
    ],
    "status": "active"
  },
  "s": 160,
  "ts": 1689478201200
}
```

---

#### `quest.available`

A new quest has become available.

**Payload:**
```json
{
  "t": "quest.available",
  "d": {
    "quest_id": "quest-uuid-new",
    "name": "The Dark Forest",
    "type": "main_story",
    "level_req": 15,
    "npc_id": "npc-uuid-quest-giver",
    "npc_name": "Elder Marcus",
    "zone": "Verdant Forest"
  },
  "s": 161,
  "ts": 1689478201250
}
```

---

#### `quest.completed`

A quest has been completed and rewards granted.

**Payload:**
```json
{
  "t": "quest.completed",
  "d": {
    "quest_id": "quest-uuid",
    "name": "Wolf Hunt",
    "rewards": {
      "experience": 500,
      "gold": 100,
      "items": [
        { "item_id": "item-uuid", "name": "Wolf Slayer Ring", "rarity": "rare" }
      ],
      "reputation": [
        { "faction": "forest_guard", "value": 250, "new_tier": "friendly" }
      ]
    }
  },
  "s": 162,
  "ts": 1689478201300
}
```

---

### 5.9 NPC

---

#### `npc.dialogue`

NPC dialogue opened.

**Payload:**
```json
{
  "t": "npc.dialogue",
  "d": {
    "npc_id": "npc-uuid",
    "npc_name": "Elder Marcus",
    "dialogue_id": "dialogue_forest_elder_01",
    "text": "Welcome, adventurer. The forest has grown dangerous lately. Will you help us?",
    "options": [
      {
        "id": "accept_quest",
        "text": "I'll help. What needs to be done?",
        "action": "quest_offer",
        "quest_id": "quest-uuid"
      },
      {
        "id": "open_shop",
        "text": "Show me your wares.",
        "action": "open_shop"
      },
      {
        "id": "goodbye",
        "text": "Farewell.",
        "action": "close"
      }
    ],
    "portrait": "npc_elder_marcus"
  },
  "s": 170,
  "ts": 1689478201350
}
```

---

#### `npc.shop`

NPC shop inventory.

**Payload:**
```json
{
  "t": "npc.shop",
  "d": {
    "npc_id": "npc-uuid",
    "npc_name": "Merchant Greta",
    "items": [
      {
        "item_id": "item-uuid-potion",
        "name": "Health Potion",
        "type": "consumable",
        "rarity": "common",
        "price": 50,
        "stock": -1,
        "level_req": 1,
        "icon": "potion_hp"
      },
      {
        "item_id": "item-uuid-sword",
        "name": "Iron Sword",
        "type": "weapon",
        "rarity": "common",
        "price": 200,
        "stock": 5,
        "level_req": 5,
        "icon": "sword_iron"
      }
    ],
    "buyback_rate": 0.25
  },
  "s": 171,
  "ts": 1689478201400
}
```

---

### 5.10 Trade

---

#### `trade.request`

Trade request from another player.

**Payload:**
```json
{
  "t": "trade.request",
  "d": {
    "from_id": "player-uuid-other",
    "from_name": "Elara",
    "from_level": 20
  },
  "s": 180,
  "ts": 1689478201450
}
```

---

#### `trade.item_added`

Partner added items to trade.

**Payload:**
```json
{
  "t": "trade.item_added",
  "d": {
    "items": [
      { "name": "Iron Sword", "rarity": "common", "quantity": 1, "icon": "sword_iron" }
    ],
    "gold": 500
  },
  "s": 181,
  "ts": 1689478201500
}
```

---

#### `trade.confirmed`

Partner confirmed the trade.

**Payload:**
```json
{
  "t": "trade.confirmed",
  "d": {
    "partner_confirmed": true
  },
  "s": 182,
  "ts": 1689478201550
}
```

---

#### `trade.completed`

Trade completed successfully.

**Payload:**
```json
{
  "t": "trade.completed",
  "d": {
    "items_received": [
      { "name": "Iron Sword", "quantity": 1 }
    ],
    "gold_received": 500
  },
  "s": 183,
  "ts": 1689478201600
}
```

---

#### `trade.cancelled`

Trade was cancelled.

**Payload:**
```json
{
  "t": "trade.cancelled",
  "d": {
    "reason": "partner_declined"
  },
  "s": 184,
  "ts": 1689478201650
}
```

| Field | Type | Description |
|-------|------|-------------|
| `reason` | string | `self_cancelled`, `partner_declined`, `partner_disconnected`, `too_far`, `timeout` |

---

### 5.11 Guild

---

#### `guild.info`

Full guild information.

**Payload:**
```json
{
  "t": "guild.info",
  "d": {
    "id": "guild-uuid",
    "name": "Knights of Dawn",
    "leader_name": "Thorin",
    "level": 12,
    "experience": 15000,
    "bank_gold": 50000,
    "motd": "Welcome! Check the Discord for raid schedules.",
    "member_count": 35,
    "max_members": 50,
    "members": [
      {
        "id": "player-uuid",
        "name": "Thorin",
        "class_id": "warrior",
        "level": 25,
        "rank": "leader",
        "contribution": 15000,
        "is_online": true
      }
    ],
    "perks": {
      "xp_bonus": 0.05,
      "gold_bonus": 0.02,
      "bank_slots": 80
    }
  },
  "s": 190,
  "ts": 1689478201700
}
```

---

#### `guild.member_online`

Guild member came online.

**Payload:**
```json
{
  "t": "guild.member_online",
  "d": {
    "character_id": "player-uuid",
    "name": "Elara",
    "is_online": true
  },
  "s": 191,
  "ts": 1689478201750
}
```

---

#### `guild.message`

Guild chat message.

**Payload:**
```json
{
  "t": "guild.message",
  "d": {
    "sender_name": "Thorin",
    "message": "Raid starting in 10 minutes!",
    "timestamp": 1689478201800
  },
  "s": 192,
  "ts": 1689478201800
}
```

---

### 5.12 Auction

---

#### `auction.results`

Auction search results.

**Payload:**
```json
{
  "t": "auction.results",
  "d": {
    "listings": [
      {
        "id": "listing-uuid",
        "seller_name": "Elara",
        "item_id": "item-uuid",
        "name": "Flame Sword",
        "type": "weapon",
        "rarity": "epic",
        "level_req": 20,
        "quantity": 1,
        "price": 5000,
        "buyout_price": 8000,
        "stats": { "attack": 120, "fire_damage": 25 },
        "icon": "sword_flame",
        "expires_at": 1689564600000
      }
    ],
    "total": 142,
    "page": 1,
    "pages": 3
  },
  "s": 200,
  "ts": 1689478201850
}
```

---

#### `auction.sold`

An auction listing was sold (sent to seller).

**Payload:**
```json
{
  "t": "auction.sold",
  "d": {
    "listing_id": "listing-uuid",
    "item_name": "Flame Sword",
    "buyer_name": "Thorin",
    "sale_price": 5000,
    "gold_received": 4750,
    "auction_house_cut": 250
  },
  "s": 201,
  "ts": 1689478201900
}
```

---

### 5.13 Crafting & Gathering

---

#### `crafting.result`

Crafting result.

**Payload:**
```json
{
  "t": "crafting.result",
  "d": {
    "success": true,
    "recipe_id": "recipe_iron_sword",
    "item": {
      "item_id": "item-uuid-new",
      "name": "Iron Sword",
      "rarity": "uncommon",
      "quality": 0.85,
      "stats": { "attack": 48 },
      "icon": "sword_iron"
    },
    "materials_consumed": [
      { "item_id": "item-uuid-ore", "name": "Iron Ore", "quantity": 5 },
      { "item_id": "item-uuid-wood", "name": "Oak Wood", "quantity": 2 }
    ],
    "skill_up": {
      "profession": "blacksmithing",
      "old_level": 15,
      "new_level": 16,
      "xp_gained": 50
    }
  },
  "s": 210,
  "ts": 1689478201950
}
```

| Field | Type | Description |
|-------|------|-------------|
| `quality` | number | 0.0–1.0 quality multiplier affecting stats |
| `skill_up` | object | Profession skill-up info (null if no skill gain) |

---

#### `gathering.loot`

Items received from gathering.

**Payload:**
```json
{
  "t": "gathering.loot",
  "d": {
    "node_id": "node-uuid",
    "node_type": "mining",
    "items": [
      { "item_id": "item-uuid-ore", "name": "Iron Ore", "quantity": 3, "rarity": "common" },
      { "item_id": "item-uuid-gem", "name": "Rough Ruby", "quantity": 1, "rarity": "uncommon" }
    ],
    "skill_up": {
      "profession": "mining",
      "old_level": 20,
      "new_level": 21,
      "xp_gained": 25
    }
  },
  "s": 211,
  "ts": 1689478202000
}
```

---

### 5.14 Housing

---

#### `housing.placed`

Furniture item placed in housing.

**Payload:**
```json
{
  "t": "housing.placed",
  "d": {
    "item_id": "item-uuid-furniture",
    "name": "Oak Table",
    "x": 5,
    "y": 3,
    "rotation": 90,
    "prestige_added": 10,
    "total_prestige": 150
  },
  "s": 220,
  "ts": 1689478202050
}
```

---

#### `housing.removed`

Furniture item removed from housing.

**Payload:**
```json
{
  "t": "housing.removed",
  "d": {
    "item_id": "item-uuid-furniture",
    "prestige_removed": 10,
    "total_prestige": 140
  },
  "s": 221,
  "ts": 1689478202100
}
```

---

### 5.15 PvP

---

#### `pvp.queue_update`

PvP queue position update.

**Payload:**
```json
{
  "t": "pvp.queue_update",
  "d": {
    "mode": "arena_2v2",
    "position": 3,
    "estimated_wait": 120,
    "queue_size": 15
  },
  "s": 230,
  "ts": 1689478202150
}
```

---

#### `pvp.match_start`

PvP match has started.

**Payload:**
```json
{
  "t": "pvp.match_start",
  "d": {
    "match_id": "match-uuid",
    "mode": "arena_2v2",
    "teams": [
      {
        "team_id": 1,
        "members": [
          { "id": "player-uuid-1", "name": "Thorin", "class_id": "warrior", "level": 25 },
          { "id": "player-uuid-2", "name": "Elara", "class_id": "mage", "level": 23 }
        ]
      },
      {
        "team_id": 2,
        "members": [
          { "id": "player-uuid-3", "name": "Shadow", "class_id": "rogue", "level": 24 },
          { "id": "player-uuid-4", "name": "Light", "class_id": "cleric", "level": 22 }
        ]
      }
    ],
    "map": "arena_fire_pit",
    "duration": 300
  },
  "s": 231,
  "ts": 1689478202200
}
```

---

#### `pvp.match_end`

PvP match has ended.

**Payload:**
```json
{
  "t": "pvp.match_end",
  "d": {
    "match_id": "match-uuid",
    "mode": "arena_2v2",
    "winner_team": 1,
    "results": [
      {
        "player_id": "player-uuid-1",
        "name": "Thorin",
        "damage_dealt": 5000,
        "healing_done": 0,
        "kills": 2,
        "deaths": 0,
        "rating_change": 25,
        "new_rating": 1525
      }
    ],
    "rewards": {
      "honor_points": 100,
      "conquest_points": 50,
      "items": []
    },
    "duration": 245
  },
  "s": 232,
  "ts": 1689478202250
}
```

---

#### `pvp.flag_update`

Player PvP flag status changed.

**Payload:**
```json
{
  "t": "pvp.flag_update",
  "d": {
    "player_id": "player-uuid",
    "flagged": true,
    "expires_at": 1689478500000
  },
  "s": 233,
  "ts": 1689478202300
}
```

---

### 5.16 Dynamic Events

---

#### `dynamic_event.start`

A dynamic world event has started.

**Payload:**
```json
{
  "t": "dynamic_event.start",
  "d": {
    "event_id": "event-uuid",
    "type": "world_boss",
    "name": "Invasion of the Shadow Dragon",
    "zone_id": 4,
    "zone_name": "Crimson Canyon",
    "description": "A massive shadow dragon has been spotted near Crimson Canyon! All heroes are needed!",
    "x": 50.0,
    "y": 75.0,
    "min_level": 30,
    "duration": 1800,
    "rewards_preview": {
      "experience": 5000,
      "gold": 1000,
      "items": ["legendary_dragon_sword"]
    }
  },
  "s": 240,
  "ts": 1689478202350
}
```

---

#### `dynamic_event.update`

Event progress update.

**Payload:**
```json
{
  "t": "dynamic_event.update",
  "d": {
    "event_id": "event-uuid",
    "phase": "combat",
    "progress": 0.45,
    "participants": 25,
    "boss_hp_percent": 45.2,
    "time_remaining": 1200,
    "objectives": [
      { "description": "Defeat the Shadow Dragon", "progress": 0.45, "required": 1.0 }
    ]
  },
  "s": 241,
  "ts": 1689478202400
}
```

---

#### `dynamic_event.end`

Event has ended.

**Payload:**
```json
{
  "t": "dynamic_event.end",
  "d": {
    "event_id": "event-uuid",
    "result": "success",
    "participants": 42,
    "duration": 1650,
    "rewards": {
      "top_contributors": [
        { "name": "Thorin", "damage": 50000, "bonus_xp": 2000 }
      ],
      "participation_rewards": {
        "experience": 5000,
        "gold": 1000,
        "items": [
          { "name": "Shadow Scale", "rarity": "rare", "quantity": 3 }
        ]
      }
    }
  },
  "s": 242,
  "ts": 1689478202450
}
```

---

### 5.17 World

---

#### `weather.update`

Weather changed in a zone.

**Payload:**
```json
{
  "t": "weather.update",
  "d": {
    "zone_id": 2,
    "weather_type": "rain",
    "intensity": 0.7,
    "duration": 1800,
    "effects": {
      "movement_speed": -0.1,
      "visibility": 0.8
    }
  },
  "s": 250,
  "ts": 1689478202500
}
```

---

#### `time.update`

Game time and day/night cycle update (sent every minute).

**Payload:**
```json
{
  "t": "time.update",
  "d": {
    "game_time": "14:30",
    "day_night": "day",
    "season": "summer",
    "day_length_minutes": 72,
    "moon_phase": "waxing_crescent"
  },
  "s": 251,
  "ts": 1689478202550
}
```

| Field | Type | Description |
|-------|------|-------------|
| `game_time` | string | Current in-game time (HH:MM, 24h format) |
| `day_night` | string | `dawn`, `day`, `dusk`, `night` |
| `season` | string | `spring`, `summer`, `autumn`, `winter` |
| `moon_phase` | string | `new`, `waxing_crescent`, `first_quarter`, `waxing_gibbous`, `full`, `waning_gibbous`, `last_quarter`, `waning_crescent` |

---

### 5.18 Social

---

#### `mail.notification`

New mail notification.

**Payload:**
```json
{
  "t": "mail.notification",
  "d": {
    "unread_count": 3,
    "latest_sender": "Elara",
    "latest_subject": "Trade items!"
  },
  "s": 260,
  "ts": 1689478202600
}
```

---

#### `social.friend_request`

Friend request received.

**Payload:**
```json
{
  "t": "social.friend_request",
  "d": {
    "from_id": "player-uuid",
    "from_name": "Elara",
    "from_level": 20,
    "from_class": "mage"
  },
  "s": 261,
  "ts": 1689478202650
}
```

---

#### `social.online_list`

List of online friends (sent on login and periodically updated).

**Payload:**
```json
{
  "t": "social.online_list",
  "d": {
    "friends": [
      {
        "id": "player-uuid",
        "name": "Elara",
        "level": 20,
        "class_id": "mage",
        "zone_name": "Verdant Forest",
        "is_online": true
      },
      {
        "id": "player-uuid-2",
        "name": "Shadow",
        "level": 24,
        "class_id": "rogue",
        "zone_name": "Unknown",
        "is_online": false,
        "last_online": 1689470000000
      }
    ]
  },
  "s": 262,
  "ts": 1689478202700
}
```

---

### 5.19 Notification & System

---

#### `notification`

General notification (toast/popup).

**Payload:**
```json
{
  "t": "notification",
  "d": {
    "type": "achievement",
    "title": "Achievement Unlocked!",
    "message": "First Kill — Defeat your first enemy.",
    "icon": "achievement_first_kill",
    "data": {
      "achievement_id": "first_kill",
      "rewards": { "experience": 50, "title": "Novice Adventurer" }
    },
    "duration": 5000
  },
  "s": 270,
  "ts": 1689478202750
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `achievement`, `level_up`, `item_acquired`, `quest_complete`, `error`, `warning`, `info`, `maintenance` |
| `duration` | number | Display duration in milliseconds (null = persistent) |

---

#### `error`

Error response for any message.

**Payload:**
```json
{
  "t": "error",
  "d": {
    "code": 4001,
    "message": "Insufficient gold",
    "context": {
      "required": 1000,
      "available": 500
    },
    "ref_s": 40
  },
  "s": 280,
  "ts": 1689478202800
}
```

| Field | Type | Description |
|-------|------|-------------|
| `code` | number | Error code (see Error Codes table) |
| `message` | string | Human-readable error message |
| `context` | object | Additional error context (varies by error type) |
| `ref_s` | number | Sequence number of the message that caused the error |

---

#### `pong`

Response to client `ping`.

**Payload:**
```json
{
  "t": "pong",
  "d": {
    "server_time": 1689478202850
  },
  "s": 290,
  "ts": 1689478202850
}
```

---

*End of WebSocket Protocol Reference*
