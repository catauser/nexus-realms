# NEXUS REALMS — System Architecture Document

> Version: 1.0.0 | Last Updated: 2026-07-16

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Client-Server Communication Model](#3-client-server-communication-model)
4. [WebSocket Message Protocol](#4-websocket-message-protocol)
5. [Entity Component System (ECS) Design](#5-entity-component-system-ecs-design)
6. [Game Loop Architecture](#6-game-loop-architecture)
7. [Chunk-Based World Loading Strategy](#7-chunk-based-world-loading-strategy)
8. [Player Session Lifecycle](#8-player-session-lifecycle)
9. [Authentication Flow](#9-authentication-flow)
10. [Database Connection Pooling](#10-database-connection-pooling)
11. [Redis Usage Patterns](#11-redis-usage-patterns)
12. [Horizontal Scaling Strategy](#12-horizontal-scaling-strategy)
13. [Disaster Recovery Approach](#13-disaster-recovery-approach)

---

## 1. System Overview

NEXUS REALMS is a web-based MMORPG built on a three-tier architecture:

| Layer | Technology | Role |
|-------|-----------|------|
| **Client** | Phaser 3 (WebGL/Canvas) | Rendering, input, prediction, interpolation |
| **Server** | Node.js (cluster + worker threads) | Game logic, physics, persistence, authority |
| **Data** | PostgreSQL + Redis | Persistent state, caching, sessions, pub/sub |

### Design Principles

- **Server Authority**: The server is the single source of truth for all game state. Clients predict locally but reconcile with server corrections.
- **Tick-Based Simulation**: Server runs at 20 ticks/second (50ms per tick). Client renders at 60fps and interpolates between server states.
- **Spatial Partitioning**: The world is divided into chunks for efficient entity queries, interest management, and network optimization.
- **Stateless Gateways**: Connection gateways are stateless and can be scaled horizontally. Game state lives on region servers.
- **Event-Driven Architecture**: Systems communicate through an internal event bus, decoupling producers from consumers.

---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Phaser 3 │  │ Network  │  │ Input     │  │Prediction │  │  UI/HUD   │  │
│  │ Renderer │  │ Manager  │  │ Handler   │  │ Engine    │  │  Layer    │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └─────┬─────┘  └───────────┘  │
│       │              │              │              │                         │
│       └──────────────┴──────────────┴──────────────┘                        │
│                              │ WebSocket                                    │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Load Balancer     │
                    │   (nginx/HAProxy)   │
                    │   L4 TCP + WS       │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼───────┐ ┌─────▼────────┐ ┌─────▼────────┐
     │  Gateway Node  │ │ Gateway Node │ │ Gateway Node │
     │   (WS + Auth)  │ │  (WS + Auth) │ │  (WS + Auth) │
     └────────┬───────┘ └──────┬───────┘ └──────┬───────┘
              │                │                │
              └────────────────┼────────────────┘
                               │  Redis Pub/Sub
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼───────┐ ┌─────▼────────┐ ┌─────▼────────┐
     │  Region Server │ │Region Server │ │Region Server │
     │  Zone A-D      │ │ Zone E-H     │ │ Zone I-L     │
     │  (Game Logic)  │ │ (Game Logic) │ │ (Game Logic) │
     └───┬────┬───────┘ └──┬─────┬────┘ └──┬─────┬────┘
         │    │             │     │          │     │
         │    └─────────────┼─────┼──────────┘     │
         │                  │     │                │
    ┌────▼──────────────────▼─────▼────────────────▼────┐
    │                    Redis Cluster                    │
    │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
    │  │ Sessions │  │  Cache   │  │ Pub/Sub Channels │ │
    │  └──────────┘  └──────────┘  └──────────────────┘ │
    └──────────────────────┬────────────────────────────┘
                           │
    ┌──────────────────────▼────────────────────────────┐
    │              PostgreSQL (Primary + Replica)         │
    │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
    │  │ Accounts │  │  World   │  │  Economy / Logs  │ │
    │  │  Auth    │  │  State   │  │                  │ │
    │  └──────────┘  └──────────┘  └──────────────────┘ │
    └────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Instances | Responsibility |
|-----------|-----------|----------------|
| **Load Balancer** | 1–2 (active/passive) | L4 TCP routing, SSL termination, sticky sessions via connection ID |
| **Gateway Node** | 3–N (auto-scale) | WebSocket management, authentication, message routing, rate limiting |
| **Region Server** | 1 per zone group | Game simulation, ECS tick loop, physics, AI, combat resolution |
| **Redis Cluster** | 3+ nodes | Sessions, hot cache, pub/sub inter-region messaging, distributed locks |
| **PostgreSQL** | Primary + 1-2 Read Replicas | Persistent data, audit logs, economy tracking |

---

## 3. Client-Server Communication Model

### 3.1 Transport Layer

All client-server communication uses **WebSocket** over TLS (`wss://`). A single persistent connection carries all message types (gameplay, chat, UI).

```
Client                          Server
  │                               │
  │──── wss://connect ───────────▶│  HTTP Upgrade
  │◀─── WebSocket Open ──────────│
  │                               │
  │──── auth.login ──────────────▶│  Authentication
  │◀─── auth.success ────────────│  Character data + world state
  │                               │
  │──── player.move ─────────────▶│  Continuous gameplay
  │◀─── entity.spawn ────────────│
  │──── player.attack ───────────▶│
  │◀─── combat.damage ───────────│
  │                               │
  │──── ping ────────────────────▶│  Heartbeat (every 30s)
  │◀─── pong ────────────────────│
```

### 3.2 Message Format

Every message is a JSON object with a standard envelope:

```json
{
  "t": "message.type",    // Message type (dot-separated namespace)
  "d": { ... },           // Payload data (type-specific)
  "s": 12345,             // Sequence number (client: incremental, server: per-tick)
  "ts": 1689478200000     // Timestamp (Unix ms)
}
```

### 3.3 Reliability Model

| Category | Delivery | Notes |
|----------|----------|-------|
| **Critical** (auth, trade, inventory) | Acknowledged + retry | Server sends `ack` or error; client retries on timeout |
| **State Sync** (position, health) | Latest-only | Overwritten each tick; old values discarded |
| **Events** (combat, loot) | At-least-once | Sequence numbers detect duplicates |
| **Chat** | At-least-once | Stored server-side; replay on reconnect |

### 3.4 Bandwidth Optimization

- **Delta Compression**: State updates only include changed fields
- **Message Batching**: Server batches all updates per tick into a single WebSocket frame
- **Spatial Culling**: Players only receive updates for entities within their view radius (chunk + neighbors)
- **Binary Encoding** (future): MessagePack or Protobuf for high-frequency messages (position, health)

### 3.5 Client-Side Prediction

```
Frame N:   Client sends player.move { x: 100, y: 200 }
           Client immediately applies move locally (prediction)

Frame N+1: Client sends player.move { x: 101, y: 200 }
           Client continues predicted movement

Tick T:    Server processes move, validates, broadcasts authoritative state
           Server sends player.move { player_id, x: 100.5, y: 200, speed: 5 }

Frame N+k: Client receives server state
           If delta > threshold → snap to server position
           If delta <= threshold → smoothly interpolate
```

**Reconciliation**: Client maintains a buffer of last 60 input states. On server correction, it replays unacknowledged inputs from the corrected position.

---

## 4. WebSocket Message Protocol

> Full message definitions: See [WEBSOCKET-PROTOCOL.md](./WEBSOCKET-PROTOCOL.md)

### 4.1 Protocol Summary

| Direction | Count | Categories |
|-----------|-------|------------|
| Client → Server | 36 messages | auth, player, inventory, equipment, chat, quest, trade, guild, auction, crafting, gathering, housing, pvp, social, mail, system |
| Server → Client | 52 messages | auth, player, entity, combat, loot, inventory, equipment, chat, quest, npc, trade, guild, auction, crafting, gathering, housing, pvp, dynamic_event, weather, time, mail, social, notification, system |

### 4.2 Error Handling

All errors follow a standard format:

```json
{
  "t": "error",
  "d": {
    "code": 4001,
    "message": "Insufficient gold",
    "context": { "required": 1000, "available": 500 }
  },
  "s": 0,
  "ts": 1689478200000
}
```

Error code ranges:

| Range | Category |
|-------|----------|
| 1000–1999 | Authentication & Connection |
| 2000–2999 | Player & Movement |
| 3000–3999 | Inventory & Equipment |
| 4000–4999 | Economy (Trade, Auction, Crafting) |
| 5000–5999 | Social (Guild, Friends, Mail) |
| 6000–6999 | Combat & Abilities |
| 7000–7999 | Quest & Events |
| 8000–8999 | Housing & Gathering |
| 9000–9999 | System & Internal |

---

## 5. Entity Component System (ECS) Design

> Full ECS specification: See [ECS-DESIGN.md](./ECS-DESIGN.md)

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   ECS World                      │
│                                                  │
│  ┌─────────────┐   ┌─────────────────────────┐  │
│  │  Entity      │   │  Component Storage      │  │
│  │  Manager     │   │  (Typed Arrays / Maps)  │  │
│  │              │   │                         │  │
│  │  Entity 0 ──┼──▶│  Position[0] = {x,y,z} │  │
│  │  Entity 1 ──┼──▶│  Health[0] = {hp,max}  │  │
│  │  Entity 2 ──┼──▶│  AI[1] = {state,tree}  │  │
│  └─────────────┘   └─────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │           Systems (in order)              │    │
│  │                                           │    │
│  │  1. InputSystem      (process inputs)     │    │
│  │  2. AISystem          (tick AI trees)     │    │
│  │  3. MovementSystem    (apply velocity)    │    │
│  │  4. CollisionSystem   (resolve overlaps)  │    │
│  │  5. CombatSystem      (damage/heal)       │    │
│  │  6. BuffSystem        (tick buffs)        │    │
│  │  7. LootSystem        (drop/gather)       │    │
│  │  8. SpawnSystem       (respawn entities)  │    │
│  │  9. QuestSystem       (check objectives)  │    │
│  │ 10. EventSystem       (dynamic events)    │    │
│  │ 11. WeatherSystem     (weather changes)   │    │
│  │ 12. TimeSystem        (day/night cycle)   │    │
│  │ 13. EconomySystem     (market dynamics)   │    │
│  │ 14. PersistenceSystem (save to DB)        │    │
│  │ 15. NetworkSystem     (send updates)      │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 5.2 Entity Types

| Entity Type | Components | Notes |
|-------------|-----------|-------|
| **Player** | Position, Velocity, Health, Mana, Stats, Equipment, Inventory, Combat, Buff, QuestState, Faction, Guild, Movement, Collision, Renderable, Interactable | Full component set; networked |
| **NPC** | Position, Health, Stats, AI, Faction, Interactable, Renderable | Static or patrol-based AI |
| **Monster** | Position, Velocity, Health, Stats, AI, Combat, Lootable, Collision, SpawnPoint, Renderable | Aggressive/passive AI; drops loot |
| **Item** (dropped) | Position, Lootable, Renderable | Temporary; despawns after 5 min |
| **Projectile** | Position, Velocity, Combat, Collision, Renderable | Short-lived; triggers combat on hit |
| **AreaEffect** | Position, Combat, Collision, Renderable | AoE damage/heal zones |
| **GatheringNode** | Position, Gatherable, Interactable, Renderable | Resource nodes; respawn timer |
| **HousingObject** | Position, Interactable, Renderable | Player-placed furniture |

---

## 6. Game Loop Architecture

### 6.1 Server Game Loop (20 ticks/second)

```
┌──────────────────────────────────────────────────┐
│              Server Tick (50ms budget)            │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │ Phase 1: INPUT (0-5ms)                      │  │
│  │  • Process all queued WebSocket messages     │  │
│  │  • Validate and apply player inputs          │  │
│  │  • Convert network messages to ECS commands  │  │
│  └─────────────────────────────────────────────┘  │
│                       │                           │
│  ┌────────────────────▼───────────────────────┐  │
│  │ Phase 2: SIMULATION (20-35ms)               │  │
│  │  • Run all Systems in defined order          │  │
│  │  • MovementSystem: apply velocities          │  │
│  │  • CollisionSystem: resolve overlaps         │  │
│  │  • CombatSystem: process attacks/abilities   │  │
│  │  • AISystem: tick monster/NPC behavior       │  │
│  │  • BuffSystem: tick durations, apply effects │  │
│  │  • QuestSystem: check objective completion   │  │
│  │  • SpawnSystem: respawn dead entities        │  │
│  └─────────────────────────────────────────────┘  │
│                       │                           │
│  ┌────────────────────▼───────────────────────┐  │
│  │ Phase 3: OUTPUT (5-10ms)                    │  │
│  │  • Collect dirty state from all systems      │  │
│  │  • Apply spatial culling per player          │  │
│  │  • Batch and serialize messages              │  │
│  │  • Send WebSocket frames                     │  │
│  └─────────────────────────────────────────────┘  │
│                       │                           │
│  ┌────────────────────▼───────────────────────┐  │
│  │ Phase 4: PERSISTENCE (async, non-blocking)  │  │
│  │  • Queue dirty entities for DB write         │  │
│  │  • Flush Redis cache updates                 │  │
│  │  • Write audit logs (economy, chat)          │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 6.2 Tick Timing

```javascript
const TICK_RATE = 20;           // ticks per second
const TICK_INTERVAL = 1000 / TICK_RATE;  // 50ms
const MAX_CATCHUP_TICKS = 5;    // max ticks to catch up if behind

let lastTick = Date.now();
let accumulator = 0;

function gameLoop() {
    const now = Date.now();
    accumulator += now - lastTick;
    lastTick = now;

    let ticksProcessed = 0;
    while (accumulator >= TICK_INTERVAL && ticksProcessed < MAX_CATCHUP_TICKS) {
        processTick();
        accumulator -= TICK_INTERVAL;
        ticksProcessed++;
    }

    if (ticksProcessed >= MAX_CATCHUP_TICKS) {
        accumulator = 0; // Reset to prevent spiral of death
        logger.warn('Tick budget exceeded, dropping remaining ticks');
    }

    setImmediate(gameLoop); // Yield to event loop for I/O
}
```

### 6.3 Client Game Loop (60fps)

```javascript
// Client runs at monitor refresh rate (typically 60fps)
// Receives server state at 20Hz, interpolates at 60Hz

const RENDER_RATE = 60;
const SERVER_RATE = 20;
const INTERPOLATION_DELAY = 100 / SERVER_RATE; // 50ms (1 server tick behind)

function clientRender(timestamp) {
    // 1. Process input
    handleInput();

    // 2. Predict local player movement
    predictLocalPlayer();

    // 3. Interpolate remote entities
    interpolateRemoteEntities(timestamp);

    // 4. Render frame
    renderer.render(scene, camera);

    requestAnimationFrame(clientRender);
}
```

### 6.4 Interpolation Strategy

```
Server sends:  Tick 1 (t=0ms)    Tick 2 (t=50ms)    Tick 3 (t=100ms)
Position:      x=100             x=105               x=110

Client renders at 60fps (16.67ms intervals):
  Frame at t=50ms:  interpolate(Tick1, Tick2, 0.0) → x=100
  Frame at t=67ms:  interpolate(Tick1, Tick2, 0.34) → x=101.7
  Frame at t=83ms:  interpolate(Tick1, Tick2, 0.66) → x=103.3
  Frame at t=100ms: interpolate(Tick2, Tick3, 0.0) → x=105
  ...
```

---

## 7. Chunk-Based World Loading Strategy

### 7.1 Chunk Grid

The world is divided into a grid of **chunks**, each 64×64 tiles (each tile = 32 pixels = 1 game unit).

```
┌──────┬──────┬──────┬──────┬──────┐
│ 0,0  │ 1,0  │ 2,0  │ 3,0  │ 4,0  │
│      │      │      │      │      │
├──────┼──────┼──────┼──────┼──────┤
│ 0,1  │ 1,1  │ 2,1  │ 3,1  │ 4,1  │
│      │██████│██████│██████│      │
├──────┼──────┼──────┼──────┼──────┤
│ 0,2  │ 1,2  │ 2,2  │ 3,2  │ 4,2  │
│      │██████│░░░░░░│██████│      │
├──────┼──────┼──────┼──────┼──────┤
│ 0,3  │ 1,3  │ 2,3  │ 3,3  │ 4,3  │
│      │██████│██████│██████│      │
├──────┼──────┼──────┼──────┼──────┤
│ 0,4  │ 1,4  │ 2,4  │ 3,4  │ 4,4  │
│      │      │      │      │      │
└──────┴──────┴──────┴──────┴──────┘

██████ = Loaded & active chunks (player at 2,2)
░░░░░░ = Player's current chunk
```

### 7.2 Loading Radius

```
View Radius: 2 chunks in each direction (5×5 grid = 25 chunks max)
Active Radius: 1 chunk (3×3 = 9 chunks with full simulation)
Buffer Zone: 1 chunk pre-loaded for seamless transitions

Chunk States:
  UNLOADED → LOADING → ACTIVE → BUFFER → UNLOADING → UNLOADED
```

### 7.3 Chunk Lifecycle

```javascript
class ChunkManager {
    constructor() {
        this.chunks = new Map();           // key: "x,y" → ChunkState
        this.activeRadius = 1;             // Full simulation
        this.viewRadius = 2;               // Client visibility
        this.bufferRadius = 3;             // Pre-load buffer
    }

    onPlayerMove(player, newChunkX, newChunkY) {
        const toLoad = [];
        const toUnload = [];

        // Determine which chunks should be loaded/unloaded
        for (let dx = -this.bufferRadius; dx <= this.bufferRadius; dx++) {
            for (let dy = -this.bufferRadius; dy <= this.bufferRadius; dy++) {
                const cx = newChunkX + dx;
                const cy = newChunkY + dy;
                const key = `${cx},${cy}`;
                const distance = Math.max(Math.abs(dx), Math.abs(dy));

                if (!this.chunks.has(key)) {
                    toLoad.push({ cx, cy, priority: distance });
                }
            }
        }

        // Unload chunks beyond buffer radius
        for (const [key, chunk] of this.chunks) {
            const [cx, cy] = key.split(',').map(Number);
            const distance = Math.max(
                Math.abs(cx - newChunkX),
                Math.abs(cy - newChunkY)
            );
            if (distance > this.bufferRadius) {
                toUnload.push(key);
            }
        }

        // Sort by distance (load nearest first)
        toLoad.sort((a, b) => a.priority - b.priority);

        return { toLoad, toUnload };
    }
}
```

### 7.4 Interest Management

Each player only receives updates for entities within their **view radius**:

```javascript
function getRelevantEntities(player, world) {
    const chunkX = Math.floor(player.x / CHUNK_SIZE);
    const chunkY = Math.floor(player.y / CHUNK_SIZE);
    const entities = [];

    for (let dx = -VIEW_RADIUS; dx <= VIEW_RADIUS; dx++) {
        for (let dy = -VIEW_RADIUS; dy <= VIEW_RADIUS; dy++) {
            const chunk = world.getChunk(chunkX + dx, chunkY + dy);
            if (chunk) {
                entities.push(...chunk.entities);
            }
        }
    }

    return entities;
}
```

### 7.5 Chunk Data Transfer

When a player enters a new chunk:

1. **Server** sends `world.chunk_load` with tile data, static objects, and entity spawns
2. **Client** loads tilemap, creates sprite batches, spawns entity representations
3. **Server** sends `entity.spawn` for all dynamic entities in the chunk
4. When leaving, server sends `world.chunk_unload` and `entity.despawn` for out-of-range entities

**Chunk payload size** (estimated):

| Data | Size |
|------|------|
| Tile layer (64×64, 4 layers) | ~4 KB (compressed) |
| Collision layer | ~1 KB |
| Static objects (NPCs, nodes) | ~2 KB |
| **Total per chunk** | ~7–10 KB |

---

## 8. Player Session Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│CONNECTING│───▶│AUTH_     │───▶│CHAR_     │───▶│IN_GAME   │
│          │    │PENDING   │    │SELECT    │    │          │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                     │
                           ┌─────────────────────────┤
                           │                         │
                    ┌──────▼─────┐           ┌───────▼──────┐
                    │DISCONNECTED│           │AFK_TIMEOUT   │
                    │(graceful)  │           │(30 min idle) │
                    └────────────┘           └──────────────┘
```

### 8.1 State Descriptions

| State | Duration | Description |
|-------|----------|-------------|
| **CONNECTING** | < 5s | WebSocket handshake in progress |
| **AUTH_PENDING** | < 10s | Waiting for `auth.login` or `auth.token` |
| **CHAR_SELECT** | < 5 min | Player choosing/creating character |
| **IN_GAME** | Active | Full gameplay; heartbeat every 30s |
| **AFK_TIMEOUT** | 30 min | Auto-flagged AFK; moved to safe zone after 60 min |
| **DISCONNECTED** | — | Graceful close or timeout; session preserved for 5 min |

### 8.2 Session Object

```javascript
class PlayerSession {
    constructor(connectionId) {
        this.connectionId = connectionId;
        this.state = 'CONNECTING';
        this.accountId = null;
        this.characterId = null;
        this.gatewayNodeId = null;
        this.regionServerId = null;
        this.lastHeartbeat = Date.now();
        this.lastActivity = Date.now();
        this.sequenceNumber = 0;
        this.pendingAcks = new Map();  // seq → { message, timestamp, retries }
        this.inputBuffer = [];          // Queued inputs for current tick
        this.viewRadius = 2;            // chunks
        this.loadedChunks = new Set();  // "x,y" keys
    }

    isConnected() {
        return this.state !== 'DISCONNECTED';
    }

    isPlaying() {
        return this.state === 'IN_GAME';
    }

    heartbeat() {
        this.lastHeartbeat = Date.now();
    }

    isTimedOut() {
        return Date.now() - this.lastHeartbeat > 60000; // 60s timeout
    }
}
```

### 8.3 Reconnection Flow

```
1. Client detects disconnect
2. Client attempts reconnect within 5 minutes
3. Server checks Redis for existing session (by connection token)
4. If session found:
   a. Resume session with same character
   b. Resend last 3 seconds of world state (replay buffer)
   c. Restore chunk subscriptions
5. If session expired:
   a. Character auto-saved at last known position
   b. Full auth flow required
```

---

## 9. Authentication Flow

### 9.1 Login Sequence

```
Client                    Gateway              Redis         PostgreSQL
  │                         │                    │              │
  │── auth.login ──────────▶│                    │              │
  │   {username, pw_hash}   │                    │              │
  │                         │── validate ────────┼──────────────▶│
  │                         │                    │   SELECT *   │
  │                         │◀── account_data ───┼──────────────│
  │                         │                    │              │
  │                         │── generate token   │              │
  │                         │── store session ──▶│              │
  │                         │   {token→account}  │              │
  │                         │                    │              │
  │◀── auth.success ────────│                    │              │
  │   {token, char_list}    │                    │              │
  │                         │                    │              │
  │── auth.select_char ────▶│                    │              │
  │   {character_id}        │                    │              │
  │                         │── load character ──┼──────────────▶│
  │                         │◀── char_data ──────┼──────────────│
  │                         │                    │              │
  │                         │── find region ────▶│              │
  │                         │◀── region_id ──────│              │
  │                         │                    │              │
  │                         │── route to region  │              │
  │                         │   (Redis pub/sub)  │              │
  │                         │                    │              │
  │◀── auth.world_ready ────│                    │              │
  │   {zone_data, entities} │                    │              │
```

### 9.2 Token-Based Reconnection

```javascript
// On initial login, server generates a session token
const sessionToken = crypto.randomBytes(32).toString('hex');
const sessionData = {
    accountId: account.id,
    characterId: selectedCharacter.id,
    regionServerId: region.id,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000  // 5 min expiry
};

// Store in Redis
await redis.set(
    `session:${sessionToken}`,
    JSON.stringify(sessionData),
    'EX',
    300  // 5 min TTL
);

// Client stores token in sessionStorage (not localStorage for security)
// On reconnect, client sends auth.token { token } instead of full login
```

### 9.3 Rate Limiting

| Action | Limit | Window | Penalty |
|--------|-------|--------|---------|
| Login attempts | 5 | 15 min | 15 min IP block |
| Character creation | 3 | 24 hours | — |
| Password reset | 3 | 1 hour | 1 hour block |
| Reconnection | 10 | 5 min | 5 min cooldown |

---

## 10. Database Connection Pooling

### 10.1 Pool Configuration

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nexus_realms',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    // Pool settings
    max: 20,                    // Maximum connections per region server
    min: 5,                     // Minimum idle connections
    idleTimeoutMillis: 30000,   // Close idle connections after 30s
    connectionTimeoutMillis: 5000,  // Fail if can't connect in 5s

    // Statement timeout (prevent runaway queries)
    statement_timeout: 10000,   // 10s max per query

    // Application name for monitoring
    application_name: `nexus-region-${process.env.REGION_ID}`,
});
```

### 10.2 Connection Strategy

| Operation | Pool | Notes |
|-----------|------|-------|
| **Game state reads** | Primary | Must read latest data |
| **Game state writes** | Primary | All writes go to primary |
| **Leaderboards / reports** | Replica | Eventually consistent OK |
| **Audit logs** | Async queue | Batched inserts every 10s |
| **Economy logs** | Async queue | Immediate for fraud detection |

### 10.3 Query Patterns

```javascript
// Use parameterized queries exclusively
async function getCharacter(characterId) {
    const result = await pool.query(
        'SELECT * FROM characters WHERE id = $1',
        [characterId]
    );
    return result.rows[0];
}

// Batch operations for bulk saves
async function saveChunkEntities(entities) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const entity of entities) {
            await client.query(
                `UPDATE entities SET state_json = $1, updated_at = NOW()
                 WHERE id = $2`,
                [JSON.stringify(entity.state), entity.id]
            );
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
```

### 10.4 Connection Monitoring

```javascript
pool.on('connect', (client) => {
    metrics.connections.active.inc();
    logger.debug('New DB connection established');
});

pool.on('error', (err, client) => {
    metrics.connections.errors.inc();
    logger.error('Unexpected DB error on idle client', err);
});

pool.on('remove', () => {
    metrics.connections.active.dec();
});

// Periodic health check
setInterval(async () => {
    const result = await pool.query('SELECT 1');
    metrics.db.latency.observe(result.duration);
}, 10000);
```

---

## 11. Redis Usage Patterns

### 11.1 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Redis Cluster                         │
│                                                          │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │  Session Store   │  │  Game State Cache            │  │
│  │                  │  │                              │  │
│  │  session:{token} │  │  character:{id} → state      │  │
│  │  → account_id    │  │  zone:{id}:entities → set    │  │
│  │  → char_id       │  │  chunk:{x,y} → entities     │  │
│  │  → region_id     │  │  npc:{id} → state           │  │
│  │  TTL: 5min       │  │  TTL: 60s (refreshed)       │  │
│  └─────────────────┘  └──────────────────────────────┘  │
│                                                          │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │  Pub/Sub         │  │  Distributed Locks           │  │
│  │                  │  │                              │  │
│  │  channel:        │  │  lock:trade:{id}             │  │
│  │    region.{id}   │  │  lock:auction:{id}           │  │
│  │    guild.{id}    │  │  lock:character:{id}         │  │
│  │    chat.{channel}│  │  TTL: 10s (auto-release)    │  │
│  │    system        │  │                              │  │
│  └─────────────────┘  └──────────────────────────────┘  │
│                                                          │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │  Rate Limiting   │  │  Leaderboards / Counters     │  │
│  │                  │  │                              │  │
│  │  ratelimit:      │  │  leaderboard:level → ZSET   │  │
│  │    {ip}:{action} │  │  leaderboard:pvp → ZSET     │  │
│  │  TTL: window     │  │  counter:online → INT       │  │
│  └─────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 11.2 Key Patterns

| Pattern | Key Format | Type | TTL | Purpose |
|---------|-----------|------|-----|---------|
| Session | `session:{token}` | Hash | 5 min | Auth session data |
| Character cache | `char:{id}` | Hash | 60 s | Hot character data |
| Online set | `online:characters` | Set | — | All online character IDs |
| Zone entities | `zone:{id}:entities` | Set | 30 s | Entity IDs in zone |
| Chunk data | `chunk:{zone}:{x}:{y}` | String | 120 s | Compressed chunk data |
| NPC state | `npc:{id}` | Hash | 30 s | NPC position/state |
| Chat channel | `chat:{channel}:recent` | List | 1 hour | Last 100 messages |
| Trade lock | `lock:trade:{id}` | String | 10 s | Mutex for trade |
| Character lock | `lock:char:{id}` | String | 5 s | Prevent concurrent saves |
| Rate limit | `rl:{ip}:{action}` | String | Window | Sliding window counter |
| Leaderboard | `lb:{type}` | Sorted Set | — | Score rankings |
| Online count | `stats:online` | Integer | — | Current player count |
| Server health | `health:{server_id}` | Hash | 30 s | CPU, memory, players |

### 11.3 Pub/Sub Channels

| Channel | Publisher | Subscribers | Payload |
|---------|-----------|-------------|---------|
| `region:{id}` | Gateway | Region servers | Player join/leave, chat relay |
| `guild:{id}` | Region servers | All servers with guild members | Guild chat, member updates |
| `chat:{channel}` | Region servers | All servers | Chat messages |
| `system` | Any | All | Server announcements, maintenance |
| `pvp:queue` | Region servers | PvP coordinator | Queue updates, match results |

### 11.4 Caching Strategy

```
Cache-Aside (Lazy Loading):
  1. Check Redis cache
  2. If miss → read from PostgreSQL
  3. Store in Redis with TTL
  4. Return data

Write-Through:
  1. Write to PostgreSQL
  2. Update Redis cache
  3. Publish change event

Write-Back (for high-frequency data):
  1. Write to Redis only
  2. Flush to PostgreSQL every 10s (batch)
  3. On shutdown → force flush all dirty data
```

---

## 12. Horizontal Scaling Strategy

### 12.1 Region Sharding

The world is divided into **regions**, each managed by an independent **Region Server**:

```
┌─────────────────────────────────────────────────────┐
│                    World Map                         │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Region A    │  │  Region B    │  │  Region C  │ │
│  │  Server 1    │  │  Server 2    │  │  Server 3  │ │
│  │              │  │              │  │            │ │
│  │ Zones:       │  │ Zones:       │  │ Zones:     │ │
│  │  - Starter   │  │  - Desert    │  │  - Tundra  │ │
│  │  - Forest    │  │  - Canyon    │  │  - Glacier │ │
│  │  - Plains    │  │  - Oasis     │  │  - Storm   │ │
│  │  - Mountain  │  │  - Volcano   │  │  - Arctic  │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                │        │
│         └─────────────────┼────────────────┘        │
│                           │                          │
│                    Redis Pub/Sub                      │
└──────────────────────────────────────────────────────┘
```

### 12.2 Scaling Rules

| Component | Scale Trigger | Scale Action |
|-----------|--------------|--------------|
| **Gateway** | > 80% CPU or > 1000 connections/node | Add gateway node |
| **Region Server** | > 70% tick budget or > 200 players/region | Split region or add instance |
| **Redis** | > 80% memory or > 50k ops/s | Add shard to cluster |
| **PostgreSQL** | > 80% CPU or > 5k qps | Add read replica |

### 12.3 Cross-Region Communication

When a player crosses region boundaries:

```
1. Player approaches region border (within 2 chunks)
2. Source region server notifies destination via Redis pub/sub
3. Destination pre-loads player data and surrounding chunks
4. Player crosses boundary:
   a. Source removes player from its ECS world
   b. Destination adds player to its ECS world
   c. Gateway re-routes WebSocket messages to new region
5. Seamless transition (player sees no loading screen)
```

### 12.4 Player Migration Protocol

```javascript
// Source region
async function migratePlayer(player, destinationRegionId) {
    // 1. Lock player
    await redis.set(`lock:char:${player.id}`, 'migrating', 'EX', 30);

    // 2. Serialize full player state
    const playerState = serializePlayerState(player);

    // 3. Publish migration event
    await redis.publish(`region:${destinationRegionId}`, JSON.stringify({
        type: 'player.migrate',
        data: playerState
    }));

    // 4. Remove from source ECS
    this.world.removeEntity(player.entityId);

    // 5. Update routing
    await redis.hset(`char:${player.id}`, 'regionId', destinationRegionId);
}

// Destination region
async function handleMigration(playerState) {
    // 1. Create entity in ECS
    const entity = this.world.createEntity('Player', playerState);

    // 2. Load relevant chunks
    await this.chunkManager.loadForPlayer(entity);

    // 3. Notify client
    this.sendToPlayer(entity.id, 'player.region_changed', {
        zone: playerState.zoneId,
        x: playerState.x,
        y: playerState.y
    });

    // 4. Release lock
    await redis.del(`lock:char:${playerState.id}`);
}
```

### 12.5 Capacity Planning

| Resource | Per Server | Notes |
|----------|-----------|-------|
| Players per Gateway | 1,000 | WebSocket connections |
| Players per Region | 200 | Active simulation |
| Zones per Region | 4–8 | Depends on zone complexity |
| Memory per Region | 2–4 GB | ECS + chunk cache |
| CPU per Region | 2–4 cores | Node.js single-thread + workers |
| Network per Region | 10–50 Mbps | Depends on player density |

---

## 13. Disaster Recovery Approach

### 13.1 Failure Scenarios

| Scenario | RTO | RPO | Recovery Method |
|----------|-----|-----|-----------------|
| **Region server crash** | < 30s | 0 (state in Redis) | Auto-restart; players reconnect |
| **Gateway crash** | < 10s | 0 | Load balancer routes to healthy nodes |
| **Redis node failure** | < 5s | 0 | Cluster failover (replica promoted) |
| **PostgreSQL primary failure** | < 60s | < 5s | Replica promoted; WAL replay |
| **Full datacenter loss** | < 30 min | < 5 min | Cross-DC replica; backup restore |
| **Corrupt game state** | < 15 min | Varies | Point-in-time recovery from WAL |

### 13.2 Backup Strategy

```
┌─────────────────────────────────────────────────────┐
│                 Backup Schedule                       │
│                                                      │
│  PostgreSQL:                                         │
│    • Continuous WAL archiving → S3                   │
│    • Full backup: daily at 04:00 UTC                 │
│    • Incremental: every 6 hours                      │
│    • Retention: 30 days (daily), 90 days (weekly)    │
│                                                      │
│  Redis:                                              │
│    • RDB snapshots: every 15 minutes                 │
│    • AOF: every second (fsync)                       │
│    • Retention: 7 days of RDB snapshots              │
│                                                      │
│  Game Assets:                                        │
│    • Version-controlled (Git LFS)                    │
│    • CDN distribution                                │
│                                                      │
│  Configuration:                                      │
│    • All in version control                          │
│    • Secrets in vault (HashiCorp Vault / AWS SM)     │
└─────────────────────────────────────────────────────┘
```

### 13.3 Region Server Recovery

```javascript
// On region server startup
async function recoverRegion(regionId) {
    // 1. Check for in-progress player migrations
    const migratingPlayers = await redis.keys('lock:char:*');
    for (const key of migratingPlayers) {
        const lockData = await redis.get(key);
        if (lockData === 'migrating') {
            // Migration was interrupted — load character from DB
            const charId = key.split(':')[2];
            await loadAndSpawnCharacter(charId);
            await redis.del(key);
        }
    }

    // 2. Load zone data from database
    const zones = await db.query(
        'SELECT * FROM zones WHERE region_id = $1',
        [regionId]
    );

    // 3. Rebuild ECS world
    for (const zone of zones) {
        await loadZoneEntities(zone.id);
    }

    // 4. Restore NPC states
    await restoreNPCStates(regionId);

    // 5. Resume dynamic events
    await resumeActiveEvents(regionId);

    // 6. Notify gateways that region is ready
    await redis.publish('system', JSON.stringify({
        type: 'region.ready',
        regionId
    }));
}
```

### 13.4 Data Consistency Guarantees

| Data Type | Consistency | Mechanism |
|-----------|------------|-----------|
| Player position | Eventual | Redis cache; DB flush every 10s |
| Inventory | Strong | Write-through to DB + Redis |
| Gold/economy | Strong | DB transactions; Redis distributed locks |
| Chat | Eventual | Redis pub/sub; DB archive every 10s |
| Leaderboards | Eventual | Redis sorted sets; DB reconciliation hourly |
| Quest progress | Strong | Write-through on state change |
| Guild data | Strong | Write-through; distributed lock on changes |

### 13.5 Graceful Shutdown

```javascript
async function gracefulShutdown(signal) {
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    // 1. Stop accepting new connections
    gatewayServer.close();

    // 2. Notify players (60s warning)
    broadcastToAll('notification', {
        type: 'maintenance',
        message: 'Server maintenance in 60 seconds. Please find a safe location.'
    });

    // 3. Wait for players to reach safe zones (max 60s)
    await waitForPlayerSafety(60000);

    // 4. Save all game state
    await saveAllPlayerStates();
    await flushAllDirtyChunks();
    await flushAuditLogs();

    // 5. Close connections
    await redis.quit();
    await pgPool.end();

    logger.info('Graceful shutdown complete');
    process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### 13.6 Health Monitoring

```javascript
// Health check endpoint for load balancer
app.get('/health', async (req, res) => {
    const checks = {
        db: await checkDatabase(),
        redis: await checkRedis(),
        tickLoop: checkTickHealth(),
        memory: checkMemoryUsage(),
        connections: getConnectionCount()
    };

    const healthy = Object.values(checks).every(c => c.status === 'ok');

    res.status(healthy ? 200 : 503).json({
        status: healthy ? 'healthy' : 'degraded',
        checks,
        uptime: process.uptime(),
        region: process.env.REGION_ID
    });
});
```

---

## Appendix A: Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Client Engine | Phaser 3 | 3.80+ | 2D game rendering, scenes, sprites |
| Client Framework | TypeScript | 5.x | Type-safe client code |
| Bundler | Vite | 5.x | Fast HMR, production builds |
| Server Runtime | Node.js | 22 LTS | Game server runtime |
| Server Framework | ws | 8.x | WebSocket server |
| Database | PostgreSQL | 16 | Persistent storage |
| Cache/Pub-Sub | Redis | 7.x | Sessions, cache, messaging |
| ORM | Drizzle ORM | 0.30+ | Type-safe DB queries |
| Logging | Pino | 9.x | Structured JSON logging |
| Metrics | Prometheus | — | Server metrics export |
| Container | Docker | 24+ | Containerization |
| Orchestration | Kubernetes | 1.29+ | Container orchestration |

---

## Appendix B: Environment Variables

```bash
# Server
NODE_ENV=production
REGION_ID=region-a
PORT=8080
TICK_RATE=20

# Database
DB_HOST=pg-primary.nexus.internal
DB_PORT=5432
DB_NAME=nexus_realms
DB_USER=nexus_server
DB_PASSWORD=<vault>
DB_POOL_MAX=20
DB_REPLICA_HOST=pg-replica.nexus.internal

# Redis
REDIS_HOST=redis.nexus.internal
REDIS_PORT=6379
REDIS_PASSWORD=<vault>
REDIS_CLUSTER_MODE=true

# Auth
JWT_SECRET=<vault>
SESSION_TTL=300
RATE_LIMIT_WINDOW=900
RATE_LIMIT_MAX=5

# Game
CHUNK_SIZE=64
VIEW_RADIUS=2
ACTIVE_RADIUS=1
MAX_PLAYERS_PER_REGION=200
SAVE_INTERVAL=10
```

---

*End of Architecture Document*
