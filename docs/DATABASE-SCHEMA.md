# NEXUS REALMS — Database Schema

> Version: 1.0.0 | Last Updated: 2026-07-16
> Database: PostgreSQL 16

---

## Table of Contents

1. [Overview](#1-overview)
2. [Extensions & Types](#2-extensions--types)
3. [Core Tables](#3-core-tables)
4. [Character & Progression](#4-character--progression)
5. [Guild System](#5-guild-system)
6. [Items & Economy](#6-items--economy)
7. [Quest System](#7-quest-system)
8. [World & Zones](#8-world--zones)
9. [Social System](#9-social-system)
10. [PvP System](#10-pvp-system)
11. [Housing System](#11-housing-system)
12. [Crafting & Professions](#12-crafting--professions)
13. [Battle Pass & Daily Reset](#13-battle-pass--daily-reset)
14. [Economy & Logging](#14-economy--logging)
15. [Indexes](#15-indexes)
16. [Seed Data](#16-seed-data)

---

## 1. Overview

### Design Principles

- **JSON for flexible data**: Stats, equipment, skills, and other complex nested data use `JSONB` columns for flexibility without schema changes.
- **Referential integrity**: All relationships enforced via foreign keys with appropriate `ON DELETE` actions.
- **Timestamps**: All tables use `TIMESTAMPTZ` (timezone-aware UTC).
- **Soft deletes**: Critical tables (accounts, characters) use status fields rather than hard deletes.
- **Audit trail**: Economy and chat logs are append-only for moderation and fraud detection.

### Schema Diagram (Simplified)

```
┌──────────┐     ┌────────────┐     ┌──────────┐
│ accounts │────▶│ characters │────▶│ guild_   │
│          │     │            │     │ members  │
└──────────┘     └─────┬──────┘     └──────────┘
                       │                    │
        ┌──────────────┼──────────┐   ┌────▼─────┐
        │              │          │   │  guilds  │
   ┌────▼────┐   ┌─────▼───┐  ┌──▼───┴──┐      │
   │inventory│   │equipment│  │quest_   │       │
   │         │   │         │  │progress │       │
   └────┬────┘   └────┬────┘  └─────────┘       │
        │              │                          │
   ┌────▼────┐   ┌────▼────┐              ┌──────▼──────┐
   │  items  │   │  items  │              │   quests    │
   └─────────┘   └─────────┘              └─────────────┘
```

---

## 2. Extensions & Types

```sql
-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Fuzzy text search (names, items)
CREATE EXTENSION IF NOT EXISTS "btree_gist";      -- GiST index support for range queries

-- ============================================================
-- Custom ENUM types
-- ============================================================

CREATE TYPE account_status AS ENUM (
    'active',
    'suspended',
    'banned',
    'deleted'
);

CREATE TYPE character_class AS ENUM (
    'warrior',
    'mage',
    'ranger',
    'rogue',
    'cleric',
    'paladin',
    'necromancer',
    'druid'
);

CREATE TYPE item_type AS ENUM (
    'weapon',
    'armor',
    'accessory',
    'consumable',
    'material',
    'quest_item',
    'currency',
    'recipe',
    'mount',
    'pet',
    'housing'
);

CREATE TYPE item_rarity AS ENUM (
    'common',
    'uncommon',
    'rare',
    'epic',
    'legendary',
    'mythic'
);

CREATE TYPE bind_type AS ENUM (
    'none',
    'pickup',       -- Binds on pickup
    'equip'         -- Binds on equip
);

CREATE TYPE quest_type AS ENUM (
    'main_story',
    'side',
    'daily',
    'weekly',
    'dungeon',
    'raid',
    'pvp',
    'profession',
    'event'
);

CREATE TYPE quest_status AS ENUM (
    'available',
    'active',
    'completed',
    'failed',
    'abandoned'
);

CREATE TYPE npc_type AS ENUM (
    'vendor',
    'quest_giver',
    'trainer',
    'enemy',
    'neutral',
    'guard',
    'innkeeper',
    'banker',
    'auctioneer'
);

CREATE TYPE guild_rank AS ENUM (
    'leader',
    'officer',
    'veteran',
    'member',
    'initiate'
);

CREATE TYPE friend_status AS ENUM (
    'pending',
    'accepted',
    'blocked'
);

CREATE TYPE pvp_mode AS ENUM (
    'arena_2v2',
    'arena_3v3',
    'battleground',
    'world_pvp'
);

CREATE TYPE event_state AS ENUM (
    'scheduled',
    'active',
    'completed',
    'failed',
    'cancelled'
);

CREATE TYPE mail_status AS ENUM (
    'unread',
    'read',
    'deleted'
);

CREATE TYPE chat_channel AS ENUM (
    'global',
    'zone',
    'party',
    'guild',
    'whisper',
    'trade',
    'system',
    'lfg'
);

CREATE TYPE reputation_tier AS ENUM (
    'hated',
    'hostile',
    'unfriendly',
    'neutral',
    'friendly',
    'honored',
    'revered',
    'exalted'
);

CREATE TYPE equipment_slot AS ENUM (
    'head',
    'chest',
    'legs',
    'feet',
    'hands',
    'shoulders',
    'waist',
    'back',
    'main_hand',
    'off_hand',
    'two_hand',
    'ranged',
    'neck',
    'ring_1',
    'ring_2',
    'trinket_1',
    'trinket_2'
);

CREATE TYPE economy_log_type AS ENUM (
    'auction_buy',
    'auction_sell',
    'trade',
    'vendor_buy',
    'vendor_sell',
    'loot_drop',
    'quest_reward',
    'crafting_cost',
    'mail_send',
    'mail_cod',
    'guild_bank_deposit',
    'guild_bank_withdraw'
);

CREATE TYPE reset_type AS ENUM (
    'daily_quests',
    'daily_dungeons',
    'daily_profession',
    'weekly_quests',
    'weekly_raid',
    'weekly_reset'
);

CREATE TYPE weather_type AS ENUM (
    'clear',
    'cloudy',
    'rain',
    'storm',
    'snow',
    'fog',
    'sandstorm',
    'ashfall'
);
```

---

## 3. Core Tables

### 3.1 accounts

Stores user account information. One account can have multiple characters.

```sql
CREATE TABLE accounts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(32) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,          -- bcrypt hash (60 chars) or argon2
    status          account_status NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login      TIMESTAMPTZ,
    last_ip         INET,
    login_count     INTEGER NOT NULL DEFAULT 0,
    is_admin        BOOLEAN NOT NULL DEFAULT FALSE,
    is_moderator    BOOLEAN NOT NULL DEFAULT FALSE,
    mute_until      TIMESTAMPTZ,                    -- Temporary chat mute
    ban_reason      TEXT,
    ban_expires_at  TIMESTAMPTZ,
    metadata_json   JSONB NOT NULL DEFAULT '{}',    -- Misc settings, preferences

    CONSTRAINT uq_accounts_username UNIQUE (username),
    CONSTRAINT uq_accounts_email UNIQUE (email),
    CONSTRAINT chk_accounts_username CHECK (username ~ '^[a-zA-Z0-9_]{3,32}$'),
    CONSTRAINT chk_accounts_email CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

COMMENT ON TABLE accounts IS 'User accounts — one per real-world person';
COMMENT ON COLUMN accounts.password_hash IS 'Argon2id hash of user password';
COMMENT ON COLUMN accounts.metadata_json IS '{"email_verified": true, "two_factor": false, "locale": "en", "theme": "dark"}';
```

### 3.2 characters

Player characters — the central entity linking to nearly every other table.

```sql
CREATE TABLE characters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name            VARCHAR(24) NOT NULL,
    class_id        character_class NOT NULL,
    level           SMALLINT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
    experience      BIGINT NOT NULL DEFAULT 0 CHECK (experience >= 0),
    x               REAL NOT NULL DEFAULT 0,
    y               REAL NOT NULL DEFAULT 0,
    direction       SMALLINT NOT NULL DEFAULT 0 CHECK (direction BETWEEN 0 AND 7),
    zone_id         INTEGER NOT NULL REFERENCES zones(id) DEFAULT 1,
    hp              INTEGER NOT NULL DEFAULT 100 CHECK (hp >= 0),
    max_hp          INTEGER NOT NULL DEFAULT 100 CHECK (max_hp > 0),
    mana            INTEGER NOT NULL DEFAULT 50 CHECK (mana >= 0),
    max_mana        INTEGER NOT NULL DEFAULT 50 CHECK (max_mana > 0),
    stats_json      JSONB NOT NULL DEFAULT '{}',
    equipment_json  JSONB NOT NULL DEFAULT '{}',
    inventory_json  JSONB NOT NULL DEFAULT '{}',
    skills_json     JSONB NOT NULL DEFAULT '{}',
    profession_json JSONB NOT NULL DEFAULT '{}',
    guild_id        UUID REFERENCES guilds(id) ON DELETE SET NULL,
    pvp_flags       JSONB NOT NULL DEFAULT '{}',
    is_online       BOOLEAN NOT NULL DEFAULT FALSE,
    last_online     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    play_time       INTEGER NOT NULL DEFAULT 0,     -- Total seconds played
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_characters_name UNIQUE (name),
    CONSTRAINT uq_characters_account_name UNIQUE (account_id, name),
    CONSTRAINT chk_characters_name CHECK (name ~ '^[a-zA-Z]{2,24}$'),
    CONSTRAINT chk_characters_experience CHECK (experience >= 0)
);

COMMENT ON TABLE characters IS 'Player characters — the primary game entity';
COMMENT ON COLUMN characters.stats_json IS '{"strength": 10, "agility": 8, "intelligence": 12, "spirit": 6, "stamina": 10, "crit_chance": 0.05, "crit_damage": 1.5, "armor": 50, "magic_resist": 30, "attack_power": 45, "spell_power": 60, "movement_speed": 5.0}';
COMMENT ON COLUMN characters.equipment_json IS '{"head": "item_uuid", "chest": "item_uuid", "main_hand": "item_uuid", ...} — References item UUIDs in inventory table';
COMMENT ON COLUMN characters.inventory_json IS 'Inventory bag layout: {"slots": 40, "bags": [{"id": "bag_uuid", "slots": 16, "type": "normal"}]}';
COMMENT ON COLUMN characters.skills_json IS '{"warrior_slash": {"level": 3, "hotbar_slot": 1}, "warrior_charge": {"level": 2, "hotbar_slot": 2}}';
COMMENT ON COLUMN characters.profession_json IS '{"alchemy": {"level": 15, "recipes": ["r1", "r2"], "specialization": "potions"}, "mining": {"level": 20}}';
COMMENT ON COLUMN characters.pvp_flags IS '{"pvp_enabled": false, "flagged_until": null, "criminal_timer": 0}';
```

### 3.3 guilds

Player-created organizations.

```sql
CREATE TABLE guilds (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(32) NOT NULL,
    leader_id       UUID NOT NULL REFERENCES characters(id) ON DELETE RESTRICT,
    level           SMALLINT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 50),
    experience      BIGINT NOT NULL DEFAULT 0 CHECK (experience >= 0),
    bank_gold       BIGINT NOT NULL DEFAULT 0 CHECK (bank_gold >= 0),
    perks_json      JSONB NOT NULL DEFAULT '{}',
    motd            TEXT NOT NULL DEFAULT '',        -- Message of the day
    description     TEXT NOT NULL DEFAULT '',
    icon_id         VARCHAR(64),
    banner_color    VARCHAR(7) DEFAULT '#FFFFFF',
    max_members     INTEGER NOT NULL DEFAULT 50 CHECK (max_members BETWEEN 10 AND 500),
    tax_rate        REAL NOT NULL DEFAULT 0.05 CHECK (tax_rate BETWEEN 0 AND 0.25),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_guilds_name UNIQUE (name),
    CONSTRAINT chk_guilds_name CHECK (name ~ '^[a-zA-Z0-9 ]{2,32}$')
);

COMMENT ON TABLE guilds IS 'Player guilds — organizations with shared bank and perks';
COMMENT ON COLUMN guilds.perks_json IS '{"xp_bonus": 0.1, "gold_bonus": 0.05, "bank_slots": 100, "raid_slots": 40}';
```

### 3.4 guild_members

Junction table for guild membership with rank and contribution tracking.

```sql
CREATE TABLE guild_members (
    guild_id        UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    character_id    UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    rank            guild_rank NOT NULL DEFAULT 'initiate',
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    contribution    BIGINT NOT NULL DEFAULT 0 CHECK (contribution >= 0),
    note            VARCHAR(128) DEFAULT '',

    PRIMARY KEY (guild_id, character_id)
);

COMMENT ON TABLE guild_members IS 'Guild membership with rank and contribution tracking';
COMMENT ON COLUMN guild_members.contribution IS 'Lifetime gold/contribution points earned for the guild';
```

---

## 4. Character & Progression

### 4.1 Experience Thresholds (Reference)

```sql
-- Level 1-100 experience table (used by game logic, stored here for reference)
-- Formula: xp_required(level) = floor(100 * level^1.8)
-- Level 1: 100 XP, Level 10: 6,310 XP, Level 50: 158,489 XP, Level 100: 630,957 XP
```

---

## 5. Guild System

### 5.1 Guild Bank Transactions (Audit)

```sql
CREATE TABLE guild_bank_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id        UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    character_id    UUID NOT NULL REFERENCES characters(id) ON DELETE SET NULL,
    action          VARCHAR(20) NOT NULL,           -- 'deposit_gold', 'withdraw_gold', 'deposit_item', 'withdraw_item'
    item_id         UUID REFERENCES items(id),
    quantity        INTEGER,
    gold_amount     BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_gbl_action CHECK (action IN ('deposit_gold', 'withdraw_gold', 'deposit_item', 'withdraw_item'))
);

COMMENT ON TABLE guild_bank_log IS 'Audit log for all guild bank transactions';
```

---

## 6. Items & Economy

### 6.1 items

Item templates — the definition of every item in the game.

```sql
CREATE TABLE items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(64) NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    type            item_type NOT NULL,
    rarity          item_rarity NOT NULL DEFAULT 'common',
    level_req       SMALLINT NOT NULL DEFAULT 1 CHECK (level_req BETWEEN 1 AND 100),
    class_req       character_class,                -- NULL = any class
    stats_json      JSONB NOT NULL DEFAULT '{}',
    effects_json    JSONB NOT NULL DEFAULT '[]',
    icon_id         VARCHAR(64) NOT NULL,
    stack_max       INTEGER NOT NULL DEFAULT 1 CHECK (stack_max >= 1),
    bind_type       bind_type NOT NULL DEFAULT 'none',
    sell_price      INTEGER NOT NULL DEFAULT 0 CHECK (sell_price >= 0),
    buy_price       INTEGER NOT NULL DEFAULT 0 CHECK (buy_price >= 0),
    durability_max  INTEGER,                        -- NULL = no durability
    is_unique       BOOLEAN NOT NULL DEFAULT FALSE,
    is_quest_item   BOOLEAN NOT NULL DEFAULT FALSE,
    set_id          VARCHAR(64),                    -- Item set identifier
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_items_name UNIQUE (name)
);

COMMENT ON TABLE items IS 'Item templates — defines every item type in the game';
COMMENT ON COLUMN items.stats_json IS '{"attack": 45, "crit_chance": 0.08, "stamina": 12} — Stat bonuses when equipped';
COMMENT ON COLUMN items.effects_json IS '[{"type": "on_use", "effect": "heal", "value": 500, "cooldown": 60}, {"type": "on_hit", "effect": "bleed", "chance": 0.15, "damage": 20, "duration": 8}]';
COMMENT ON COLUMN items.set_id IS 'Items with same set_id grant set bonuses when multiple pieces are equipped';
```

### 6.2 inventory

Per-character inventory slots — tracks what items each character carries.

```sql
CREATE TABLE inventory (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id    UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    item_id         UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    slot            SMALLINT NOT NULL CHECK (slot BETWEEN 0 AND 199),
    quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    enchantments_json JSONB NOT NULL DEFAULT '[]',
    durability      INTEGER,                        -- NULL = no durability system
    bag_id          SMALLINT NOT NULL DEFAULT 0,     -- Which bag (0 = main backpack)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_inventory_slot UNIQUE (character_id, bag_id, slot)
);

COMMENT ON TABLE inventory IS 'Per-character inventory — item instances in bag slots';
COMMENT ON COLUMN inventory.enchantments_json IS '[{"id": "ench_fire_dmg", "stat": "fire_damage", "value": 15, "tier": 2}]';
COMMENT ON COLUMN inventory.durability IS 'Current durability; NULL if item has no durability system';
```

### 6.3 equipment

Currently equipped items per character — separate from inventory for fast lookups.

```sql
CREATE TABLE equipment (
    character_id    UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    slot            equipment_slot NOT NULL,
    item_id         UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    enchantments_json JSONB NOT NULL DEFAULT '[]',
    durability      INTEGER,
    equipped_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (character_id, slot)
);

COMMENT ON TABLE equipment IS 'Currently equipped items — one item per slot per character';
```

### 6.4 auction_listings

Player-to-player marketplace.

```sql
CREATE TABLE auction_listings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id       UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    item_id         UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price           BIGINT NOT NULL CHECK (price > 0),       -- Price per unit
    buyout_price    BIGINT CHECK (buyout_price >= price),     -- Instant buy price
    listed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    sold            BOOLEAN NOT NULL DEFAULT FALSE,
    buyer_id        UUID REFERENCES characters(id) ON DELETE SET NULL,
    sold_at         TIMESTAMPTZ,
    sold_price      BIGINT,                             -- Actual sale price (may differ from listed)

    CONSTRAINT chk_auction_expiry CHECK (expires_at > listed_at)
);

COMMENT ON TABLE auction_listings IS 'Player auction house — items listed for sale';
COMMENT ON COLUMN auction_listings.price IS 'Starting/bid price per unit in copper';
COMMENT ON COLUMN auction_listings.buyout_price IS 'Instant buy price; NULL = auction only (no buyout)';
```

### 6.5 mail

In-game mail system with item attachments.

```sql
CREATE TABLE mail (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id       UUID REFERENCES characters(id) ON DELETE SET NULL,  -- NULL = system mail
    recipient_id    UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    subject         VARCHAR(128) NOT NULL,
    body            TEXT NOT NULL DEFAULT '',
    attachments_json JSONB NOT NULL DEFAULT '[]',
    cod_amount      BIGINT NOT NULL DEFAULT 0,       -- Cash on delivery amount
    status          mail_status NOT NULL DEFAULT 'unread',
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at         TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),

    CONSTRAINT chk_mail_cod CHECK (cod_amount >= 0)
);

COMMENT ON TABLE mail IS 'In-game mail with optional item attachments and COD';
COMMENT ON COLUMN mail.attachments_json IS '[{"item_id": "uuid", "quantity": 1, "slot": 0}] — Max 5 attachments';
```

### 6.6 chat_logs

Append-only chat log for moderation and abuse reporting.

```sql
CREATE TABLE chat_logs (
    id              BIGSERIAL PRIMARY KEY,
    channel         chat_channel NOT NULL,
    sender_id       UUID REFERENCES characters(id) ON DELETE SET NULL,
    sender_name     VARCHAR(24) NOT NULL,
    recipient_id    UUID,                           -- For whispers
    message         TEXT NOT NULL,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE chat_logs IS 'Append-only chat log for moderation — auto-partitioned by time';
```

### 6.7 economy_log

Append-only log of all gold and item transactions for economy monitoring.

```sql
CREATE TABLE economy_log (
    id              BIGSERIAL PRIMARY KEY,
    type            economy_log_type NOT NULL,
    buyer_id        UUID REFERENCES characters(id) ON DELETE SET NULL,
    seller_id       UUID REFERENCES characters(id) ON DELETE SET NULL,
    item_id         UUID REFERENCES items(id) ON DELETE SET NULL,
    quantity        INTEGER,
    gold_amount     BIGINT NOT NULL,
    zone_id         INTEGER REFERENCES zones(id),
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE economy_log IS 'Append-only economic transaction log — used for fraud detection and economy balancing';
```

---

## 7. Quest System

### 7.1 quests

Quest templates — the definition of every quest.

```sql
CREATE TABLE quests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(128) NOT NULL,
    description     TEXT NOT NULL,
    type            quest_type NOT NULL,
    level_req       SMALLINT NOT NULL DEFAULT 1 CHECK (level_req BETWEEN 1 AND 100),
    zone_id         INTEGER REFERENCES zones(id),
    prerequisites_json JSONB NOT NULL DEFAULT '[]',
    objectives_json JSONB NOT NULL,
    rewards_json    JSONB NOT NULL,
    dialogue_json   JSONB NOT NULL DEFAULT '{}',
    is_repeatable   BOOLEAN NOT NULL DEFAULT FALSE,
    repeat_cooldown INTERVAL,                       -- e.g. '24 hours' for daily
    time_limit      INTERVAL,                       -- e.g. '30 minutes' for timed quests
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quests IS 'Quest templates — defines all quests in the game';
COMMENT ON COLUMN quests.prerequisites_json IS '["quest_id_1", "quest_id_2"] — Quests that must be completed first';
COMMENT ON COLUMN quests.objectives_json IS '[{"type": "kill", "target": "wolf", "count": 10, "zone": "forest"}, {"type": "collect", "item": "herb", "count": 5}, {"type": "interact", "npc": "npc_id"}, {"type": "reach", "x": 100, "y": 200}]';
COMMENT ON COLUMN quests.rewards_json IS '{"experience": 500, "gold": 100, "items": [{"item_id": "uuid", "quantity": 1}], "reputation": {"faction_id": "faction_1", "value": 250}, "choices": [{"item_id": "uuid", "quantity": 1}]}';
COMMENT ON COLUMN quests.dialogue_json IS '{"accept": "Please help us!", "progress": "How goes the hunt?", "complete": "Well done, hero!", "fail": "Too slow..."}';
```

### 7.2 quest_progress

Tracks each character's progress on quests.

```sql
CREATE TABLE quest_progress (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id    UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    quest_id        UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    status          quest_status NOT NULL DEFAULT 'active',
    objectives_progress_json JSONB NOT NULL DEFAULT '[]',
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    failed_at       TIMESTAMPTZ,

    CONSTRAINT uq_quest_progress UNIQUE (character_id, quest_id),
    CONSTRAINT chk_qp_dates CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR
        (status = 'failed' AND failed_at IS NOT NULL) OR
        (status IN ('active', 'available', 'abandoned'))
    )
);

COMMENT ON TABLE quest_progress IS 'Per-character quest state and objective tracking';
COMMENT ON COLUMN quest_progress.objectives_progress_json IS '[{"type": "kill", "target": "wolf", "current": 7, "required": 10}, {"type": "collect", "item": "herb", "current": 3, "required": 5}]';
```

---

## 8. World & Zones

### 8.1 zones

World zones — each zone is a distinct area with its own map, level range, and properties.

```sql
CREATE TABLE zones (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    level_range     INT4RANGE NOT NULL,             -- e.g. [1,10] for levels 1-10
    biome           VARCHAR(32) NOT NULL DEFAULT 'plains',
    pvp_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
    is_instanced    BOOLEAN NOT NULL DEFAULT FALSE,  -- Dungeon instances
    max_players     INTEGER,                         -- NULL = unlimited
    parent_region_id INTEGER REFERENCES zones(id),   -- Parent region for sub-zones
    map_data_json   JSONB NOT NULL DEFAULT '{}',
    weather_default weather_type NOT NULL DEFAULT 'clear',
    ambient_sound   VARCHAR(64),
    music_track     VARCHAR(64),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_zones_name UNIQUE (name)
);

COMMENT ON TABLE zones IS 'Game world zones — each is a distinct explorable area';
COMMENT ON COLUMN zones.level_range IS 'Recommended level range for the zone [min, max]';
COMMENT ON COLUMN zones.map_data_json IS '{"width": 64, "height": 64, "chunk_count": 16, "tileset": "forest", "collision_map": "compressed_base64", "spawn_points": [{"x": 32, "y": 32, "type": "default"}]}';
```

### 8.2 npcs

Non-player characters — vendors, quest givers, enemies, etc.

```sql
CREATE TABLE npcs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(64) NOT NULL,
    zone_id         INTEGER NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    x               REAL NOT NULL,
    y               REAL NOT NULL,
    direction       SMALLINT NOT NULL DEFAULT 0,
    type            npc_type NOT NULL DEFAULT 'neutral',
    level           SMALLINT NOT NULL DEFAULT 1,
    hp              INTEGER NOT NULL DEFAULT 100,
    max_hp          INTEGER NOT NULL DEFAULT 100,
    stats_json      JSONB NOT NULL DEFAULT '{}',
    dialogue_json   JSONB NOT NULL DEFAULT '{}',
    shop_json       JSONB NOT NULL DEFAULT '{}',
    loot_table_json JSONB NOT NULL DEFAULT '[]',
    faction_id      VARCHAR(64),
    schedule_json   JSONB NOT NULL DEFAULT '{}',     -- Day/night schedule
    patrol_path_json JSONB NOT NULL DEFAULT '[]',    -- Waypoints for patrol AI
    respawn_time    INTEGER NOT NULL DEFAULT 300,     -- Seconds to respawn after death
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE npcs IS 'Non-player characters — vendors, quest givers, enemies, etc.';
COMMENT ON COLUMN npcs.dialogue_json IS '{"greeting": "Welcome, traveler!", "farewell": "Safe travels!", "quest_available": "I have a task for you...", "quest_complete": "Well done!"}';
COMMENT ON COLUMN npcs.shop_json IS '{"items": [{"item_id": "uuid", "price": 100, "stock": -1}], "buyback_rate": 0.25}'; -- stock=-1 means unlimited
COMMENT ON COLUMN npcs.loot_table_json IS '[{"item_id": "uuid", "chance": 0.15, "min_qty": 1, "max_qty": 3}, {"item_id": "uuid2", "chance": 0.01}]';
COMMENT ON COLUMN npcs.schedule_json IS '{"active_hours": [6, 22], "special_events": [{"condition": "full_moon", "behavior": "werewolf_transform"}]}';
COMMENT ON COLUMN npcs.patrol_path_json IS '[{"x": 100, "y": 200, "wait": 5}, {"x": 120, "y": 210, "wait": 3}]';
```

### 8.3 dynamic_events

World events that occur dynamically — world bosses, invasions, etc.

```sql
CREATE TABLE dynamic_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id         INTEGER NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    type            VARCHAR(64) NOT NULL,           -- 'world_boss', 'invasion', 'treasure_hunt', etc.
    name            VARCHAR(128) NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    state           event_state NOT NULL DEFAULT 'scheduled',
    participants_json JSONB NOT NULL DEFAULT '[]',
    start_time      TIMESTAMPTZ,
    end_time        TIMESTAMPTZ,
    config_json     JSONB NOT NULL DEFAULT '{}',
    results_json    JSONB NOT NULL DEFAULT '{}',
    min_players     INTEGER NOT NULL DEFAULT 1,
    max_players     INTEGER,                        -- NULL = unlimited
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_de_times CHECK (end_time IS NULL OR end_time > start_time)
);

COMMENT ON TABLE dynamic_events IS 'Dynamic world events — bosses, invasions, treasure hunts';
COMMENT ON COLUMN dynamic_events.participants_json IS '["char_id_1", "char_id_2"] — Character IDs currently participating';
COMMENT ON COLUMN dynamic_events.config_json IS '{"boss_id": "npc_uuid", "phases": [...], "spawn_conditions": {...}, "rewards_tiers": {...}}';
```

---

## 9. Social System

### 9.1 friends

Friend list and block list.

```sql
CREATE TABLE friends (
    character_id    UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    friend_id       UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    status          friend_status NOT NULL DEFAULT 'pending',
    added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (character_id, friend_id),
    CONSTRAINT chk_friends_self CHECK (character_id != friend_id)
);

COMMENT ON TABLE friends IS 'Friend/block relationships between characters';
```

---

## 10. PvP System

### 10.1 pvp_stats

Per-character PvP statistics and ratings.

```sql
CREATE TABLE pvp_stats (
    character_id        UUID PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
    kills               INTEGER NOT NULL DEFAULT 0 CHECK (kills >= 0),
    deaths              INTEGER NOT NULL DEFAULT 0 CHECK (deaths >= 0),
    assists             INTEGER NOT NULL DEFAULT 0 CHECK (assists >= 0),
    rating_2v2          INTEGER NOT NULL DEFAULT 1000 CHECK (rating_2v2 BETWEEN 0 AND 5000),
    rating_3v3          INTEGER NOT NULL DEFAULT 1000 CHECK (rating_3v3 BETWEEN 0 AND 5000),
    highest_rating_2v2  INTEGER NOT NULL DEFAULT 1000,
    highest_rating_3v3  INTEGER NOT NULL DEFAULT 1000,
    battleground_wins   INTEGER NOT NULL DEFAULT 0,
    battleground_losses INTEGER NOT NULL DEFAULT 0,
    season_points       INTEGER NOT NULL DEFAULT 0,
    current_streak      INTEGER NOT NULL DEFAULT 0,
    best_streak         INTEGER NOT NULL DEFAULT 0,
    honor_points        BIGINT NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE pvp_stats IS 'Per-character PvP statistics and competitive ratings';
COMMENT ON COLUMN pvp_stats.rating_2v2 IS 'Elo-style rating for 2v2 arena (starts at 1000)';
```

---

## 11. Housing System

### 11.1 housing_plots

Player-owned housing plots.

```sql
CREATE TABLE housing_plots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    zone_id         INTEGER NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    plot_index      INTEGER NOT NULL,               -- Plot number within the zone
    furniture_json  JSONB NOT NULL DEFAULT '[]',
    prestige        INTEGER NOT NULL DEFAULT 0 CHECK (prestige >= 0),
    name            VARCHAR(64) DEFAULT 'My House',
    is_public       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_housing_plot UNIQUE (zone_id, plot_index),
    CONSTRAINT uq_housing_owner UNIQUE (owner_id)   -- One plot per character
);

COMMENT ON TABLE housing_plots IS 'Player housing — one plot per character, decorated with furniture';
COMMENT ON COLUMN housing_plots.furniture_json IS '[{"item_id": "uuid", "x": 5, "y": 3, "rotation": 90, "state": "on"}]';
```

---

## 12. Crafting & Professions

### 12.1 crafting_cooldowns

Tracks crafting cooldowns per character per recipe.

```sql
CREATE TABLE crafting_cooldowns (
    character_id    UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    recipe_id       VARCHAR(64) NOT NULL,           -- Recipe identifier (not FK for flexibility)
    last_crafted_at TIMESTAMPTZ NOT NULL,
    craft_count     INTEGER NOT NULL DEFAULT 1,     -- How many times crafted this cooldown period

    PRIMARY KEY (character_id, recipe_id)
);

COMMENT ON TABLE crafting_cooldowns IS 'Per-character crafting cooldown tracking';
```

---

## 13. Battle Pass & Daily Reset

### 13.1 battle_pass

Battle pass progression per character per season.

```sql
CREATE TABLE battle_pass (
    character_id        UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    season              SMALLINT NOT NULL,
    tier                SMALLINT NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 100),
    xp                  INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
    claimed_rewards_json JSONB NOT NULL DEFAULT '[]',
    is_premium          BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (character_id, season)
);

COMMENT ON TABLE battle_pass IS 'Battle pass progression per character per season';
COMMENT ON COLUMN battle_pass.claimed_rewards_json IS '[1, 2, 3, 5, 8] — Tier numbers whose rewards have been claimed';
```

### 13.2 daily_reset

Tracks when daily/weekly resets occurred per character.

```sql
CREATE TABLE daily_reset (
    character_id    UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    reset_type      reset_type NOT NULL,
    last_reset_at   TIMESTAMPTZ NOT NULL,
    count           INTEGER NOT NULL DEFAULT 0,     -- How many times completed this period

    PRIMARY KEY (character_id, reset_type)
);

COMMENT ON TABLE daily_reset IS 'Tracks daily/weekly reset timers per character';
```

---

## 14. Economy & Logging

### 14.1 Reputation

Character reputation with various factions.

```sql
CREATE TABLE reputation (
    character_id    UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    faction_id      VARCHAR(64) NOT NULL,
    value           INTEGER NOT NULL DEFAULT 0,
    tier            reputation_tier NOT NULL DEFAULT 'neutral',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (character_id, faction_id)
);

COMMENT ON TABLE reputation IS 'Per-character faction reputation values and tiers';
COMMENT ON COLUMN reputation.value IS 'Raw reputation value; tier is derived from value thresholds';
```

---

## 15. Indexes

### 15.1 Primary Performance Indexes

```sql
-- ============================================================
-- ACCOUNTS
-- ============================================================
CREATE INDEX idx_accounts_email ON accounts (email);
CREATE INDEX idx_accounts_status ON accounts (status) WHERE status != 'active';
CREATE INDEX idx_accounts_last_login ON accounts (last_login DESC);

-- ============================================================
-- CHARACTERS
-- ============================================================
CREATE INDEX idx_characters_account_id ON characters (account_id);
CREATE INDEX idx_characters_zone_id ON characters (zone_id);
CREATE INDEX idx_characters_guild_id ON characters (guild_id) WHERE guild_id IS NOT NULL;
CREATE INDEX idx_characters_level ON characters (level DESC);
CREATE INDEX idx_characters_name_trgm ON characters USING gin (name gin_trgm_ops);  -- Fuzzy name search
CREATE INDEX idx_characters_is_online ON characters (is_online) WHERE is_online = TRUE;
CREATE INDEX idx_characters_position ON characters (zone_id, x, y);

-- ============================================================
-- GUILDS
-- ============================================================
CREATE INDEX idx_guilds_leader_id ON guilds (leader_id);
CREATE INDEX idx_guilds_name_trgm ON guilds USING gin (name gin_trgm_ops);

-- ============================================================
-- GUILD MEMBERS
-- ============================================================
CREATE INDEX idx_guild_members_character ON guild_members (character_id);

-- ============================================================
-- ITEMS
-- ============================================================
CREATE INDEX idx_items_type ON items (type);
CREATE INDEX idx_items_rarity ON items (rarity);
CREATE INDEX idx_items_name_trgm ON items USING gin (name gin_trgm_ops);
CREATE INDEX idx_items_level_req ON items (level_req);
CREATE INDEX idx_items_type_rarity ON items (type, rarity);

-- ============================================================
-- INVENTORY
-- ============================================================
CREATE INDEX idx_inventory_character ON inventory (character_id);
CREATE INDEX idx_inventory_item ON inventory (item_id);

-- ============================================================
-- EQUIPMENT
-- ============================================================
CREATE INDEX idx_equipment_item ON equipment (item_id);

-- ============================================================
-- QUESTS
-- ============================================================
CREATE INDEX idx_quests_type ON quests (type);
CREATE INDEX idx_quests_zone ON quests (zone_id);
CREATE INDEX idx_quests_level ON quests (level_req);

-- ============================================================
-- QUEST PROGRESS
-- ============================================================
CREATE INDEX idx_quest_progress_character ON quest_progress (character_id);
CREATE INDEX idx_quest_progress_quest ON quest_progress (quest_id);
CREATE INDEX idx_quest_progress_status ON quest_progress (character_id, status);

-- ============================================================
-- ZONES
-- ============================================================
CREATE INDEX idx_zones_parent ON zones (parent_region_id) WHERE parent_region_id IS NOT NULL;
CREATE INDEX idx_zones_level ON zones USING gist (level_range);

-- ============================================================
-- NPCS
-- ============================================================
CREATE INDEX idx_npcs_zone ON npcs (zone_id);
CREATE INDEX idx_npcs_type ON npcs (type);
CREATE INDEX idx_npcs_position ON npcs (zone_id, x, y);
CREATE INDEX idx_npcs_faction ON npcs (faction_id) WHERE faction_id IS NOT NULL;

-- ============================================================
-- DYNAMIC EVENTS
-- ============================================================
CREATE INDEX idx_dynamic_events_zone ON dynamic_events (zone_id);
CREATE INDEX idx_dynamic_events_state ON dynamic_events (state) WHERE state IN ('scheduled', 'active');
CREATE INDEX idx_dynamic_events_type ON dynamic_events (type);

-- ============================================================
-- AUCTION LISTINGS
-- ============================================================
CREATE INDEX idx_auction_seller ON auction_listings (seller_id);
CREATE INDEX idx_auction_item ON auction_listings (item_id);
CREATE INDEX idx_auction_active ON auction_listings (item_id, price) WHERE sold = FALSE AND expires_at > NOW();
CREATE INDEX idx_auction_expires ON auction_listings (expires_at) WHERE sold = FALSE;

-- ============================================================
-- MAIL
-- ============================================================
CREATE INDEX idx_mail_recipient ON mail (recipient_id, status);
CREATE INDEX idx_mail_sender ON mail (sender_id);
CREATE INDEX idx_mail_expires ON mail (expires_at) WHERE status = 'deleted';

-- ============================================================
-- CHAT LOGS (partitioned by time)
-- ============================================================
CREATE INDEX idx_chat_logs_channel ON chat_logs (channel, sent_at DESC);
CREATE INDEX idx_chat_logs_sender ON chat_logs (sender_id, sent_at DESC);
CREATE INDEX idx_chat_logs_time ON chat_logs (sent_at DESC);

-- ============================================================
-- ECONOMY LOG
-- ============================================================
CREATE INDEX idx_economy_log_type ON economy_log (type, timestamp DESC);
CREATE INDEX idx_economy_log_buyer ON economy_log (buyer_id, timestamp DESC);
CREATE INDEX idx_economy_log_seller ON economy_log (seller_id, timestamp DESC);
CREATE INDEX idx_economy_log_item ON economy_log (item_id, timestamp DESC);
CREATE INDEX idx_economy_log_time ON economy_log (timestamp DESC);

-- ============================================================
-- FRIENDS
-- ============================================================
CREATE INDEX idx_friends_friend ON friends (friend_id);

-- ============================================================
-- PVP STATS
-- ============================================================
CREATE INDEX idx_pvp_rating_2v2 ON pvp_stats (rating_2v2 DESC);
CREATE INDEX idx_pvp_rating_3v3 ON pvp_stats (rating_3v3 DESC);
CREATE INDEX idx_pvp_kills ON pvp_stats (kills DESC);
CREATE INDEX idx_pvp_season_points ON pvp_stats (season_points DESC);

-- ============================================================
-- HOUSING
-- ============================================================
CREATE INDEX idx_housing_owner ON housing_plots (owner_id);
CREATE INDEX idx_housing_zone ON housing_plots (zone_id);

-- ============================================================
-- BATTLE PASS
-- ============================================================
CREATE INDEX idx_battle_pass_season ON battle_pass (season, tier DESC);

-- ============================================================
-- REPUTATION
-- ============================================================
CREATE INDEX idx_reputation_faction ON reputation (faction_id, value DESC);
```

### 15.2 Partial Indexes for Hot Queries

```sql
-- Only index online characters (small subset)
CREATE INDEX idx_characters_online_position
    ON characters (zone_id, x, y)
    WHERE is_online = TRUE;

-- Only active auctions
CREATE INDEX idx_auction_buyable
    ON auction_listings (item_id, price ASC)
    WHERE sold = FALSE AND expires_at > NOW();

-- Unread mail only
CREATE INDEX idx_mail_unread
    ON mail (recipient_id, sent_at DESC)
    WHERE status = 'unread';

-- Active quests only
CREATE INDEX idx_quest_active
    ON quest_progress (character_id)
    WHERE status = 'active';
```

---

## 16. Seed Data

### 16.1 Starter Zones

```sql
INSERT INTO zones (name, description, level_range, biome, pvp_enabled, map_data_json) VALUES
    ('Haven', 'The starting area for new adventurers. A peaceful meadow surrounded by ancient forests.', '[1,5]', 'meadow', FALSE, '{"width": 64, "height": 64, "tileset": "starter_meadow"}'),
    ('Verdant Forest', 'A dense forest teeming with wildlife and hidden dangers.', '[5,15]', 'forest', FALSE, '{"width": 128, "height": 128, "tileset": "forest"}'),
    ('Windswept Plains', 'Vast open grasslands where nomadic tribes roam.', '[10,25]', 'plains', TRUE, '{"width": 128, "height": 128, "tileset": "plains"}'),
    ('Crimson Canyon', 'A deep canyon carved by ancient rivers, home to fierce creatures.', '[15,30]', 'canyon', TRUE, '{"width": 96, "height": 96, "tileset": "canyon"}'),
    ('Frostpeak Tundra', 'Frozen wastelands where only the strongest survive.', '[25,40]', 'tundra', TRUE, '{"width": 128, "height": 128, "tileset": "tundra"}'),
    ('Obsidian Depths', 'Underground caverns filled with rare minerals and ancient evils.', '[35,50]', 'cave', FALSE, '{"width": 96, "height": 96, "tileset": "cave"}'),
    ('Stormhold Citadel', 'A massive fortress city — the hub of trade and politics.', '[1,100]', 'urban', FALSE, '{"width": 64, "height": 64, "tileset": "city"}'),
    ('The Scorched Wastes', 'A volcanic region where the ground itself burns.', '[45,60]', 'volcanic', TRUE, '{"width": 128, "height": 128, "tileset": "volcanic"}'),
    ('Ethereal Sanctum', 'A mystical floating island accessible only to the worthy.', '[60,80]', 'ethereal', FALSE, '{"width": 64, "height": 64, "tileset": "ethereal"}'),
    ('The Void Nexus', 'Endgame zone — a rift between worlds.', '[80,100]', 'void', TRUE, '{"width": 128, "height": 128, "tileset": "void"}');
```

### 16.2 Starter Items

```sql
INSERT INTO items (name, description, type, rarity, level_req, stats_json, icon_id, stack_max, sell_price) VALUES
    ('Rusty Sword', 'A worn sword, barely holding together.', 'weapon', 'common', 1, '{"attack": 5}', 'sword_rusty', 1, 5),
    ('Cloth Tunic', 'Simple cloth protection.', 'armor', 'common', 1, '{"armor": 3, "stamina": 1}', 'armor_cloth', 1, 3),
    ('Wooden Staff', 'A basic staff for apprentice mages.', 'weapon', 'common', 1, '{"spell_power": 5}', 'staff_wood', 1, 5),
    ('Short Bow', 'A small bow for hunting.', 'weapon', 'common', 1, '{"attack": 4, "agility": 1}', 'bow_short', 1, 5),
    ('Minor Health Potion', 'Restores 50 HP.', 'consumable', 'common', 1, '{"heal": 50}', 'potion_hp_minor', 20, 2),
    ('Minor Mana Potion', 'Restores 30 Mana.', 'consumable', 'common', 1, '{"mana_restore": 30}', 'potion_mana_minor', 20, 2),
    ('Bread', 'Simple food that restores a small amount of HP over time.', 'consumable', 'common', 1, '{"heal_over_time": 20, "duration": 10}', 'food_bread', 50, 1),
    ('Copper Ore', 'A chunk of raw copper ore.', 'material', 'common', 1, '{}', 'ore_copper', 100, 3),
    ('Iron Ore', 'A chunk of raw iron ore.', 'material', 'uncommon', 10, '{}', 'ore_iron', 100, 8),
    ('Herb Bundle', 'A collection of common herbs.', 'material', 'common', 1, '{}', 'herb_common', 100, 2);
```

---

## Appendix: Table Size Estimates

| Table | Rows (Year 1) | Avg Row Size | Estimated Size |
|-------|---------------|--------------|----------------|
| accounts | 100,000 | 500 B | 50 MB |
| characters | 250,000 | 4 KB | 1 GB |
| inventory | 5,000,000 | 300 B | 1.5 GB |
| equipment | 2,500,000 | 200 B | 500 MB |
| items | 5,000 | 1 KB | 5 MB |
| quests | 2,000 | 2 KB | 4 MB |
| quest_progress | 5,000,000 | 400 B | 2 GB |
| chat_logs | 100,000,000 | 200 B | 20 GB |
| economy_log | 10,000,000 | 200 B | 2 GB |
| auction_listings | 500,000 | 300 B | 150 MB |

---

## Appendix: Partitioning Strategy

For high-volume tables, implement time-based partitioning:

```sql
-- Chat logs: partition by month
CREATE TABLE chat_logs (
    id              BIGSERIAL,
    channel         chat_channel NOT NULL,
    sender_id       UUID,
    sender_name     VARCHAR(24) NOT NULL,
    recipient_id    UUID,
    message         TEXT NOT NULL,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (sent_at);

-- Create partitions
CREATE TABLE chat_logs_2026_01 PARTITION OF chat_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE chat_logs_2026_02 PARTITION OF chat_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... auto-generate future partitions via cron job

-- Economy log: same pattern
CREATE TABLE economy_log (
    id              BIGSERIAL,
    type            economy_log_type NOT NULL,
    buyer_id        UUID,
    seller_id       UUID,
    item_id         UUID,
    quantity        INTEGER,
    gold_amount     BIGINT NOT NULL,
    zone_id         INTEGER,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (timestamp);
```

---

*End of Database Schema*
