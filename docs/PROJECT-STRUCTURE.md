# NEXUS REALMS — Project Structure

## Overview
- **48 TypeScript source files**
- **15,421 lines of code**
- **6 documentation files (402KB)**
- **4 test suites**

```
nexus-realms/
├── index.html                          # Game entry HTML with loading screen
├── package.json                        # Dependencies (Phaser 3, ws, pg, Redis, Zod)
├── tsconfig.json                       # Client TypeScript config
├── tsconfig.server.json                # Server TypeScript config
├── vite.config.ts                      # Vite build config
├── vitest.config.ts                    # Test config
├── PROJECT.md                          # Master project plan
│
├── docs/                               # Design & Architecture Documentation
│   ├── GDD.md                          # Game Design Document (2262 lines)
│   ├── GDD-CLASSES.md                  # Detailed class/ability data (88KB)
│   ├── ARCHITECTURE.md                 # System architecture (51KB)
│   ├── DATABASE-SCHEMA.md              # PostgreSQL schema (46KB)
│   ├── WEBSOCKET-PROTOCOL.md           # WS message protocol (60KB)
│   ├── ECS-DESIGN.md                   # Entity Component System (21KB)
│   └── PROJECT-STRUCTURE.md            # This file
│
├── src/
│   ├── shared/                         # Shared between client & server
│   │   ├── types.ts                    # Enums, interfaces, constants, helpers (580 lines)
│   │   └── protocol.ts                 # Zod validation schemas (178 lines)
│   │
│   ├── client/                         # Phaser 3 Game Client
│   │   ├── main.ts                     # Game bootstrap & config (93 lines)
│   │   │
│   │   ├── network/
│   │   │   ├── WebSocketClient.ts      # WS connection manager (311 lines)
│   │   │   └── NetworkHandler.ts       # Message → game action routing (643 lines)
│   │   │
│   │   ├── scenes/
│   │   │   ├── BootScene.ts            # Asset loading (165 lines)
│   │   │   ├── LoginScene.ts           # Auth screen (237 lines)
│   │   │   └── GameScene.ts            # Main game scene (487 lines)
│   │   │
│   │   ├── systems/
│   │   │   ├── InputManager.ts         # Keyboard/mouse input (260 lines)
│   │   │   ├── CameraManager.ts        # Camera follow & effects (160 lines)
│   │   │   ├── EntityManager.ts        # Entity sprite management (404 lines)
│   │   │   ├── CombatRenderer.ts       # Damage numbers, VFX (367 lines)
│   │   │   └── TilemapRenderer.ts      # Chunk-based map rendering (309 lines)
│   │   │
│   │   ├── ui/
│   │   │   ├── HUD.ts                  # Health/mana/ability bar (511 lines)
│   │   │   ├── InventoryUI.ts          # Inventory grid & tooltips (462 lines)
│   │   │   ├── ChatUI.ts               # Chat system UI (395 lines)
│   │   │   ├── MapUI.ts                # World/zone map (351 lines)
│   │   │   └── QuestTracker.ts         # Quest log & tracker (262 lines)
│   │   │
│   │   └── utils/
│   │       ├── MathUtils.ts            # Vec2, lerp, distance (130 lines)
│   │       └── AssetLoader.ts          # Asset manifest & loading (260 lines)
│   │
│   └── server/                         # Node.js Game Server
│       ├── main.ts                     # Server entry point & game loop (187 lines)
│       │
│       ├── ecs/
│       │   ├── Entity.ts               # Entity class with components (148 lines)
│       │   ├── World.ts                # ECS world manager (373 lines)
│       │   └── ComponentStore.ts       # Typed component storage (207 lines)
│       │
│       ├── network/
│       │   ├── WebSocketServer.ts      # WS server & broadcasting (280 lines)
│       │   └── MessageRouter.ts        # Message routing & middleware (252 lines)
│       │
│       ├── systems/
│       │   ├── MovementSystem.ts       # Movement validation & sync (397 lines)
│       │   ├── CombatSystem.ts         # Combat pipeline & abilities (688 lines)
│       │   ├── AISystem.ts             # Monster AI state machine (513 lines)
│       │   ├── BuffSystem.ts           # Buff/debuff ticking (335 lines)
│       │   ├── SpawnSystem.ts          # Entity spawning & respawn (281 lines)
│       │   ├── QuestSystem.ts          # Quest tracking (459 lines)
│       │   └── EventSystem.ts          # Dynamic world events (544 lines)
│       │
│       ├── handlers/
│       │   ├── PlayerHandler.ts        # Move, attack, interact, loot (230 lines)
│       │   ├── ChatHandler.ts          # Chat channels & moderation (230 lines)
│       │   ├── InventoryHandler.ts     # Inventory & equipment (210 lines)
│       │   ├── QuestHandler.ts         # Quest accept/complete/abandon (250 lines)
│       │   └── TradeHandler.ts         # Player-to-player trading (270 lines)
│       │
│       ├── world/
│       │   ├── ZoneManager.ts          # Zone loading & management (388 lines)
│       │   └── CombatCalculator.ts     # Pure combat math functions (438 lines)
│       │
│       ├── db/
│       │   ├── Database.ts             # PostgreSQL connection pool (306 lines)
│       │   ├── RedisClient.ts          # Redis cache & sessions (438 lines)
│       │   └── repositories/
│       │       ├── PlayerRepository.ts # Player CRUD operations (280 lines)
│       │       └── ItemRepository.ts   # Item definitions CRUD (404 lines)
│       │
│       ├── auth/
│       │   └── AuthService.ts          # Login, JWT, sessions (297 lines)
│       │
│       └── utils/
│           ├── Config.ts               # Environment config (175 lines)
│           └── Logger.ts               # Structured logging (238 lines)
│
├── tests/
│   ├── unit/
│   │   ├── types.test.ts               # Shared types & math tests
│   │   ├── protocol.test.ts            # WS protocol validation tests
│   │   ├── ecs.test.ts                 # ECS world & entity tests
│   │   └── combat.test.ts              # Combat calculator tests
│   └── integration/
│       └── (future: end-to-end tests)
│
├── assets/                             # Game assets (sprites, maps, audio)
│   └── (to be created by art pipeline)
│
└── tools/                              # Build & development tools
    └── (future: map editor, asset pipeline)
```

## Key Architecture Decisions

### Client-Server Model
- **Authoritative Server:** All game state lives on the server
- **Client Prediction:** Client predicts movement for responsiveness
- **Server Reconciliation:** Server corrections override client predictions
- **Entity Interpolation:** Smooth rendering between server updates

### ECS Architecture
- Entities are simple IDs owning component collections
- Systems iterate entities by component signature
- Systems execute in deterministic order every tick (50ms)
- Components stored in typed maps for flexibility

### Networking
- WebSocket for real-time game communication
- JSON message format with Zod validation
- Rate limiting per client (messages per minute)
- Spatial broadcasting (only send to nearby players)

### Database
- PostgreSQL for persistent data (characters, items, quests)
- Redis for sessions, cache, and pub/sub
- Connection pooling for both
- Auto-save every 60 seconds + on important events

### Security
- bcrypt password hashing
- JWT authentication with token refresh
- Server-side validation of all client inputs
- Anti-cheat: movement validation, damage validation
- Rate limiting on all endpoints
