# NEXUS REALMS — Entity Component System (ECS) Design

## Table of Contents
1. [Overview](#1-overview)
2. [Entity Types](#2-entity-types)
3. [Components](#3-components)
4. [Systems](#4-systems)
5. [System Update Order](#5-system-update-order)
6. [Component Serialization](#6-component-serialization)
7. [Entity Templates](#7-entity-templates)

---

## 1. Overview

The ECS architecture separates data (components) from logic (systems). Entities are simply IDs that own collections of components. Systems iterate over entities matching specific component signatures.

### Design Principles
- **Composition over inheritance** — entities are defined by their components, not class hierarchies
- **Data-oriented** — components are stored in typed arrays for cache efficiency
- **System isolation** — systems only access components they declare
- **Deterministic ordering** — systems run in a fixed, documented order each tick

### Architecture
```
┌─────────────────────────────────────────────┐
│                  World                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Entity 1 │  │ Entity 2 │  │ Entity N │  │
│  │ [C,C,C]  │  │ [C,C]    │  │ [C,C,C,C]│  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │         Component Stores             │   │
│  │  Position[]  Health[]  AI[]  ...     │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │           Systems                    │   │
│  │  Movement → Combat → AI → ...        │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 2. Entity Types

| Entity Type | Description | Typical Components |
|---|---|---|
| `Player` | Player-controlled character | Position, Velocity, Health, Mana, Stats, Equipment, Inventory, Combat, Buff, QuestState, Faction, Guild, Movement, Collision, Renderable, Interactable |
| `NPC` | Non-player character (friendly) | Position, Health, Stats, AI, Interactable, Renderable, SpawnPoint, Dialogue, Shop |
| `Monster` | Hostile NPC | Position, Velocity, Health, Stats, AI, Combat, Lootable, Renderable, SpawnPoint, Movement, Collision |
| `ItemDrop` | Loot on the ground | Position, Lootable, Renderable, Collision |
| `Projectile` | Moving ability effect | Position, Velocity, Collision, Damage, Renderable |
| `AreaEffect` | Persistent AoE | Position, Collision, Damage, Renderable, Duration |
| `GatheringNode` | Resource node | Position, Gatherable, Renderable, SpawnPoint, Interactable |
| `HousingObject` | Placed furniture/decoration | Position, Renderable, Interactable |
| `Corpse` | Dead monster (lootable) | Position, Lootable, Renderable, Duration |
| `Trigger` | Zone transition, event trigger | Position, Collision, Interactable |

---

## 3. Components

### 3.1 Position Component
```typescript
interface PositionComponent {
  x: number;           // world X in pixels
  y: number;           // world Y in pixels
  zone_id: string;     // current zone
  direction: Direction; // facing direction
}
```
- Stored as `Float32Array` for performance
- Updated by MovementSystem
- Read by nearly all systems

### 3.2 Velocity Component
```typescript
interface VelocityComponent {
  vx: number;          // pixels per tick
  vy: number;          // pixels per tick
  speed: number;       // base movement speed (pixels/tick)
  speed_multiplier: number; // buff/debuff multiplier
  is_moving: boolean;
}
```
- Default speed: 3 pixels/tick (180 pixels/sec at 20 ticks/s)
- Mount adds speed_multiplier
- Snare reduces speed_multiplier

### 3.3 Health Component
```typescript
interface HealthComponent {
  hp: number;
  max_hp: number;
  regen_rate: number;         // HP per second
  last_damage_time: number;   // for combat regen delay
  is_alive: boolean;
  death_time: number;         // for respawn timer
}
```
- Regen pauses for 5 seconds after taking damage
- Death sets `is_alive = false`, triggers death event

### 3.4 Mana Component
```typescript
interface ManaComponent {
  mana: number;
  max_mana: number;
  regen_rate: number;         // mana per second
  resource_type: 'mana' | 'energy' | 'rage' | 'focus';
}
```
- Mana regens passively
- Energy regens fast (10/sec)
- Rage decays out of combat, generates on hit taken/given
- Focus regens passively + on abilities

### 3.5 Stats Component
```typescript
interface StatsComponent {
  // Base stats
  strength: number;
  agility: number;
  intellect: number;
  spirit: number;
  stamina: number;
  
  // Derived stats
  armor: number;
  attack_power: number;
  spell_power: number;
  critical_chance: number;
  critical_damage: number;
  haste: number;
  dodge: number;
  block: number;
  parry: number;
  hit_chance: number;
  
  // Resistances
  fire_resist: number;
  ice_resist: number;
  lightning_resist: number;
  holy_resist: number;
  shadow_resist: number;
  nature_resist: number;
  
  // Computed from base + equipment + buffs
  _dirty: boolean;  // flag to recalculate derived stats
}
```
- Base stats from class + level
- Equipment adds flat bonuses
- Buffs add flat or percentage bonuses
- Recalculation triggered when `_dirty` is true

### 3.6 Equipment Component
```typescript
interface EquipmentComponent {
  slots: Record<EquipmentSlot, ItemInstance | null>;
  set_bonuses: SetBonus[];
}
```

### 3.7 Inventory Component
```typescript
interface InventoryComponent {
  slots: (ItemInstance | null)[];  // 36 slots
  gold: number;
  max_slots: number;
}
```

### 3.8 Combat Component
```typescript
interface CombatComponent {
  target_id: string | null;
  current_ability: string | null;
  ability_start_time: number;
  ability_channel_end: number;
  auto_attack_timer: number;
  auto_attack_speed: number;    // milliseconds between auto-attacks
  weapon_damage_min: number;
  weapon_damage_max: number;
  in_combat: boolean;
  combat_end_time: number;      // 5 seconds after last action
  threat_table: Map<string, number>; // entity_id → threat
}
```

### 3.9 AI Component
```typescript
interface AIComponent {
  behavior: 'passive' | 'aggressive' | 'defensive' | 'boss' | 'patrol' | 'guard';
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'retreat' | 'dead';
  aggro_range: number;         // pixels
  leash_range: number;         // max distance from spawn
  spawn_x: number;
  spawn_y: number;
  patrol_points: Vec2[];
  current_patrol_index: number;
  patrol_wait_time: number;
  target_id: string | null;
  ability_cooldowns: Map<string, number>;
  boss_phase: number;
  call_for_help_range: number;
  threat_table: Map<string, number>;
}
```

### 3.10 Buff Component
```typescript
interface BuffComponent {
  active_buffs: ActiveBuff[];
  buff_tick_timer: number;     // ms since last tick
}
```

### 3.11 QuestState Component
```typescript
interface QuestStateComponent {
  active_quests: Map<string, QuestProgress>;
  completed_quests: Set<string>;
  daily_reset_time: number;
}
```

### 3.12 Faction Component
```typescript
interface FactionComponent {
  reputation: Record<FactionId, number>;
  pvp_flagged: boolean;
  pvp_flag_expires: number;
}
```

### 3.13 Guild Component
```typescript
interface GuildComponent {
  guild_id: string | null;
  rank: GuildRank;
  guild_xp_contributed: number;
}
```

### 3.14 Movement Component
```typescript
interface MovementComponent {
  path: Vec2[];               // waypoint path
  current_path_index: number;
  move_command: Vec2 | null;  // direct move target
  is_pathfinding: boolean;
}
```

### 3.15 Collision Component
```typescript
interface CollisionComponent {
  width: number;
  height: number;
  is_static: boolean;         // doesn't move (walls, buildings)
  collision_layer: number;    // bitmask: 1=player, 2=npc, 4=monster, 8=projectile, 16=object
  collision_mask: number;     // what layers this collides with
}
```

### 3.16 Renderable Component
```typescript
interface RenderableComponent {
  sprite_key: string;         // asset key
  animation_state: string;    // 'idle', 'walk', 'attack', 'cast', 'death'
  animation_frame: number;
  tint: number;               // color tint (0xFFFFFF = no tint)
  alpha: number;              // 0-1
  scale: number;
  layer: 'ground' | 'object' | 'entity' | 'effect' | 'ui';
  visible: boolean;
  flipped: boolean;           // horizontal flip
}
```

### 3.17 Interactable Component
```typescript
interface InteractableComponent {
  interaction_type: 'talk' | 'shop' | 'quest' | 'gather' | 'use' | 'enter' | 'loot';
  interaction_range: number;  // pixels
  interaction_time: number;   // ms to complete (0 = instant)
  requires_key: string | null;
  tooltip: string;
}
```

### 3.18 Lootable Component
```typescript
interface LootableComponent {
  items: ItemInstance[];
  gold: number;
  owner_id: string | null;    // first claim
  party_id: string | null;
  loot_mode: 'free_for_all' | 'round_robin' | 'master_loot';
  expires_at: number;
  loot_table: LootEntry[];    // for monsters: rolled on death
}
```

### 3.19 Gatherable Component
```typescript
interface GatherableComponent {
  resource_type: ProfessionType;
  required_level: number;
  yield_items: { item_id: string; min: number; max: number }[];
  is_depleted: boolean;
  respawn_time: number;
  depleted_at: number;
}
```

### 3.20 SpawnPoint Component
```typescript
interface SpawnPointComponent {
  spawn_type: 'monster' | 'npc' | 'resource' | 'player';
  template_id: string;         // monster_id, npc_id, etc.
  respawn_time: number;        // ms
  last_spawn_time: number;
  max_count: number;
  current_count: number;
  spawn_radius: number;        // random offset from spawn point
}
```

### 3.21 Duration Component
```typescript
interface DurationComponent {
  created_at: number;
  expires_at: number;
  auto_destroy: boolean;
}
```

### 3.22 Damage Component (for projectiles/AoE)
```typescript
interface DamageComponent {
  source_id: string;
  ability_id: string;
  damage_type: DamageType;
  base_damage: number;
  scaling_factor: number;
  stat: keyof EntityStats;
  hit_entities: Set<string>;  // prevent double-hit
  max_hits: number;           // 0 = unlimited
}
```

### 2.23 Dialogue Component
```typescript
interface DialogueComponent {
  dialogue_tree_id: string;
  current_node: string;
  conditions: DialogueCondition[];
}

interface DialogueCondition {
  type: 'level' | 'quest_complete' | 'reputation' | 'item';
  value: string | number;
}
```

### 2.24 Shop Component
```typescript
interface ShopComponent {
  items: ShopItem[];
  buyback_items: ShopItem[];
  restock_time: number;
  faction_requirement: FactionId | null;
  reputation_requirement: number;
}

interface ShopItem {
  item_id: string;
  price: number;
  stock: number;
  restock_quantity: number;
  required_reputation: number;
}
```

---

## 4. Systems

### 4.1 MovementSystem
**Components Required:** Position, Velocity, Movement
**Components Optional:** Collision

**Responsibilities:**
- Process move commands from player input
- Apply pathfinding for AI entities
- Update position based on velocity
- Handle zone transitions
- Broadcast position updates to nearby players

**Update Logic:**
```
for each entity with (Position, Velocity, Movement):
    if move_command:
        calculate direction vector
        velocity.vx = direction.x * speed * speed_multiplier
        velocity.vy = direction.y * speed * speed_multiplier
    
    new_x = position.x + velocity.vx
    new_y = position.y + velocity.vy
    
    if has Collision:
        check collision at (new_x, new_y)
        if collision: resolve (slide along wall)
    
    clamp to zone bounds
    update position.x, position.y
    
    if velocity.vx != 0 or velocity.vy != 0:
        velocity.is_moving = true
        update direction from velocity vector
    else:
        velocity.is_moving = false
```

### 4.2 CombatSystem
**Components Required:** Combat, Stats, Health
**Components Optional:** Mana, Buff

**Responsibilities:**
- Process auto-attacks
- Execute abilities (damage, heal, buff, debuff)
- Apply damage calculations (crit, block, resistances)
- Manage cooldowns
- Handle threat generation
- Process death and respawn

**Damage Pipeline:**
```
1. Check ability validity (cooldown, resource, range, target)
2. Consume resource (mana, energy, etc.)
3. Start cooldown
4. For each target:
   a. Roll hit chance → miss?
   b. Roll dodge → dodged?
   c. Roll parry → parried?
   d. Roll block → reduced damage?
   e. Calculate base damage = (attack_power * 0.5 + weapon_damage) * ability_scaling
   f. Apply armor reduction = base * (1 - armor/(armor+100))
   g. Apply resistance reduction (for magic damage)
   h. Roll critical → multiply by crit_damage
   i. Apply buff/debuff modifiers
   j. Final damage = max(1, floor(result))
   k. Apply damage to target Health
   l. Generate threat (damage * threat_multiplier)
   m. Broadcast damage event
```

### 4.3 AISystem
**Components Required:** AI, Position, Health, Combat
**Components Optional:** Movement, Lootable

**Responsibilities:**
- State machine: idle → patrol → chase → attack → retreat
- Aggro detection (range check + hostility)
- Target selection (highest threat)
- Ability usage decisions
- Leash mechanics (return to spawn if too far)
- Call for help (alert nearby monsters)
- Boss phase transitions

**State Transitions:**
```
idle → patrol: patrol timer expired
idle → chase: player in aggro_range and hostile
patrol → chase: player in aggro_range and hostile
chase → attack: target in attack range
chase → idle: target lost or leashed
attack → chase: target moved out of range
attack → retreat: HP < 20% (if behavior allows)
retreat → idle: returned to spawn, HP > 50%
any → dead: HP <= 0
```

### 4.4 BuffSystem
**Components Required:** Buff, Stats
**Components Optional:** Health, Mana

**Responsibilities:**
- Tick buff durations
- Apply buff effects (stat modifiers)
- Handle DoT/HoT effects
- Remove expired buffs
- Stack management

**Tick Logic:**
```
buff_tick_timer += delta_ms
if buff_tick_timer >= 1000:
    buff_tick_timer -= 1000
    for each active_buff:
        buff.duration_remaining -= 1000
        if buff has DoT effect:
            apply damage
        if buff has HoT effect:
            apply heal
        if buff.duration_remaining <= 0:
            remove buff, mark stats dirty
```

### 4.5 LootSystem
**Components Required:** Lootable, Position
**Components Optional:** Duration

**Responsibilities:**
- Roll loot table on monster death
- Create loot drops
- Handle loot distribution (party, raid)
- Manage loot timers and ownership
- Generate random items with stats

### 4.6 SpawnSystem
**Components Required:** SpawnPoint

**Responsibilities:**
- Spawn entities at spawn points
- Handle respawning after death
- Manage spawn counts
- Randomize spawn positions within radius

### 4.7 QuestSystem
**Components Required:** QuestState
**Components Optional:** Inventory, Faction

**Responsibilities:**
- Track quest objectives (kill, collect, interact, explore)
- Check completion conditions
- Distribute rewards
- Handle daily/weekly resets
- Unlock prerequisite quests

### 4.8 EventSystem
**Components Required:** Position

**Responsibilities:**
- Manage dynamic world events
- Track event phases and timers
- Handle player participation
- Distribute event rewards
- Trigger event chains

### 4.9 WeatherSystem
**No components required (operates on zones)**

**Responsibilities:**
- Cycle weather per zone
- Apply weather effects (movement speed, visibility)
- Trigger weather-based events
- Broadcast weather changes

### 4.10 TimeSystem
**No components required (global)**

**Responsibilities:**
- Advance game time (accelerated: 1 real hour = 4 game hours)
- Day/night cycle (6:00-18:00 day, 18:00-6:00 night)
- NPC schedule management
- Time-based event triggers

### 4.11 EconomySystem
**Components Required:** Inventory

**Responsibilities:**
- Process auction house listings/sales
- Monitor gold supply (inflation control)
- Handle vendor transactions
- Manage trade windows

### 4.12 PersistenceSystem
**Components Required:** All player components

**Responsibilities:**
- Auto-save players every 60 seconds
- Save on important events (level up, item acquire, quest complete)
- Load player data on login
- Batch database writes for efficiency

---

## 5. System Update Order

Systems execute in this exact order every server tick (50ms):

```
1.  TimeSystem           — advance game time
2.  WeatherSystem        — update weather
3.  SpawnSystem          — spawn/respawn entities
4.  AISystem             — AI decision making
5.  MovementSystem       — process movement
6.  CombatSystem         — process combat actions
7.  BuffSystem           — tick buffs/debuffs
8.  QuestSystem          — check quest progress
9.  EventSystem          — update dynamic events
10. LootSystem           — manage loot drops
11. EconomySystem        — process economy
12. PersistenceSystem    — auto-save (every 60s, not every tick)
```

**Rationale:**
- Time/Weather first: other systems depend on these
- Spawn before AI: new entities need AI initialization
- AI before Movement: AI generates movement commands
- Movement before Combat: positions must be current for range checks
- Combat before Buffs: damage/healing happens, then buffs tick
- Quests after Combat: kill objectives need combat results
- Events after Quests: events may depend on quest state
- Loot after Combat: death triggers loot generation
- Economy after Loot: loot affects economy
- Persistence last: save the final state

---

## 6. Component Serialization

Components are serialized to JSON for database storage and network transmission.

### Player Serialization
```json
{
  "position": { "x": 1500, "y": 2300, "zone_id": "verdant_plains_01", "direction": "down" },
  "health": { "hp": 450, "max_hp": 500 },
  "mana": { "mana": 320, "max_mana": 400 },
  "stats": { "strength": 45, "agility": 30, ... },
  "equipment": { "main_hand": { "item_id": "sword_iron_01", "quantity": 1, "durability": 80, "max_durability": 100, "enchantments": [] }, ... },
  "inventory": [ { "item_id": "potion_health_01", "quantity": 5, ... }, null, ... ],
  "buffs": [ { "buff_id": "well_fed", "duration_remaining": 1800000, "stacks": 1, ... } ],
  "quests": { "active": { "quest_001": { "objectives": [1, 0, 3] } }, "completed": ["quest_intro"] },
  "professions": { "mining": { "level": 15, "experience": 1200, "recipes": ["iron_ingot"] } },
  "reputation": { "ironhold_covenant": 3500, "sylvari_order": 1200, "voidwalker_conclave": -200 },
  "pvp": { "kills": 12, "deaths": 5, "rating_2v2": 1450, "rating_3v3": 1380 }
}
```

### Monster Spawn Serialization (for world data)
```json
{
  "id": "goblin_warrior_01",
  "x": 500,
  "y": 800,
  "monster_id": "goblin_warrior",
  "respawn_time": 120000,
  "patrol_path": [
    { "x": 500, "y": 800 },
    { "x": 600, "y": 850 },
    { "x": 550, "y": 900 }
  ]
}
```

---

## 7. Entity Templates

### Player Entity Template
```
Components: Position, Velocity, Health, Mana, Stats, Equipment, Inventory,
            Combat, Buff, QuestState, Faction, Guild, Movement, Collision,
            Renderable, Interactable
```

### Monster Entity Template
```
Components: Position, Velocity, Health, Stats, AI, Combat, Buff, Lootable,
            Renderable, Collision, SpawnPoint, Movement
```

### NPC Entity Template
```
Components: Position, Health, Stats, AI, Renderable, Collision, Interactable,
            SpawnPoint, Dialogue, Shop (optional)
```

### GatheringNode Entity Template
```
Components: Position, Renderable, Collision, Interactable, Gatherable, SpawnPoint
```

### Projectile Entity Template
```
Components: Position, Velocity, Collision, Damage, Renderable, Duration
```

### ItemDrop Entity Template
```
Components: Position, Renderable, Collision, Lootable, Duration
```
