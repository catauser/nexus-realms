# ⚔️ Nexus Realms

A web-based MMORPG built with **Phaser 3** + **Node.js** + **TypeScript**.

## 🎮 Features

- **8 Classes**: Warrior, Paladin, Ranger, Rogue, Mage, Necromancer, Cleric, Druid
- **20+ Abilities per Class** with skill trees and specializations
- **6 Regions** with unique biomes, cities, dungeons
- **PvE**: Quests, dungeons, raids, world bosses, dynamic events
- **PvP**: Battlegrounds, arenas (2v2, 3v3), open world
- **Economy**: Auction house, player trading, crafting, housing
- **Guild System**: Creation, ranks, bank, perks, GvG warfare
- **Modern UI**: Glassmorphism design, responsive, accessible

## 🏗️ Architecture

```
Client (Phaser 3)  ←→  WebSocket  ←→  Server (Node.js ECS)
                                            ↓
                                    PostgreSQL + Redis
```

- **Client**: TypeScript + Phaser 3 + Vite
- **Server**: Node.js + TypeScript + Entity Component System
- **Database**: PostgreSQL (persistent) + Redis (cache/sessions)
- **Networking**: WebSocket with Zod validation
- **UI**: HTML/CSS overlay with glassmorphism design

## 📊 Project Stats

| Metric | Value |
|---|---|
| TypeScript Files | 69 |
| Lines of Code | 27,769 |
| CSS Lines | 2,072 |
| Documentation | 10,247 lines |
| Test Suites | 5 |
| Tests | 118 (all passing) |
| Build Size | 1.65MB (gzipped: 385KB) |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server (client)
npm run dev:client

# Run game server
npm run dev:server

# Run tests
npm test

# Build for production
npm run build:client
```

## 📁 Project Structure

```
nexus-realms/
├── src/
│   ├── client/          # Phaser 3 game client (31 files)
│   │   ├── scenes/      # Boot, Login, Game scenes
│   │   ├── systems/     # Input, Camera, Entity, Combat, Particles
│   │   ├── ui/          # HUD, Inventory, Chat, Map, Settings
│   │   ├── assets/      # Procedural sprite/tileset generation
│   │   └── network/     # WebSocket client
│   ├── server/          # Node.js game server (27 files)
│   │   ├── ecs/         # Entity Component System
│   │   ├── systems/     # Movement, Combat, AI, Buff, Spawn, Quest, Event
│   │   ├── handlers/    # Player, Chat, Inventory, Quest, Trade
│   │   ├── world/       # Zone manager, Combat calculator
│   │   ├── db/          # PostgreSQL + Redis + Repositories
│   │   └── auth/        # JWT authentication
│   └── shared/          # Types, protocol, game data (10 files)
│       └── data/        # Zones, monsters, items, abilities, quests, NPCs, recipes
├── tests/               # Unit + integration tests
├── docs/                # GDD, architecture, DB schema, protocol
├── assets/ui/           # CSS design system
└── preview.html         # Visual UI preview
```

## 🎯 Game Design

See `docs/GDD.md` for the complete Game Design Document covering:

- World lore and 6 regions
- 8 classes with 20+ abilities each
- Skill trees and specializations
- 8 professions (gathering + crafting)
- Economy with auction house
- PvE (quests, dungeons, raids)
- PvP (battlegrounds, arenas)
- Guild system with perks
- Housing and mounts
- Dynamic events
- Accessibility features
- Ethical monetization (cosmetic-only)

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:e2e      # End-to-end tests
npm run lint          # ESLint
npm run typecheck     # TypeScript check
```

## 📄 License

MIT

## 🤖 Built with AI

This project was designed and coded by an AI game studio with 5 specialized agents:
- **Agent 1**: Game Design & Lore
- **Agent 2**: Technical Architecture
- **Agent 3**: Client Development
- **Agent 4**: Server Development
- **Agent 5**: UI, Assets, Data & Integration
