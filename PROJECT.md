# NEXUS REALMS — Projeto MMORPG Web

## Visão Geral
MMORPG de alta qualidade para navegador web. Mundo aberto com exploração, progressão, combate PvE/PvP, economia jogador-driven, e sistema de eventos dinâmicos.

## Stack Técnica
- **Cliente:** TypeScript + Phaser 3 (2D top-down) + HTML/CSS UI
- **Servidor:** Node.js + TypeScript
- **Banco de Dados:** PostgreSQL + Redis (cache/sessões)
- **Networking:** WebSocket nativo (ws)
- **Build:** Vite (cliente) + ts-node (servidor)
- **Testes:** Vitest (unit) + Playwright (E2E)

## Arquitetura: 5 Agentes

### Agente 1 — Game Design & Lore
- Game Design Document completo
- Lore do mundo, facções, narrativa
- Classes, skill trees, profissões
- Design de quests e eventos dinâmicos
- Economia e sistemas de guilda

### Agente 2 — Technical Architecture
- Arquitetura cliente-servidor
- Schema do banco de dados
- Protocolo de rede (WebSocket messages)
- Infraestrutura de servidores
- Pipeline de assets

### Agente 3 — Core Gameplay (Cliente)
- Engine de movimento e colisão
- Sistema de combate (client-side)
- Renderização de mapa (tilemap)
- UI principal (HUD, inventário, skills)
- Input handling e câmera

### Agente 4 — Server & Multiplayer
- Game server com ECS
- Gerenciamento de mundo/instâncias
- Sistema de autenticação
- Chat e comunicação
- Persistência (save/load)
- Eventos dinâmicos do servidor

### Agente 5 — QA, Integration & Polish
- Testes unitários por módulo
- Testes de integração
- Testes de performance
- Balanceamento
- Documentação final

## Fases de Entrega

### Fase 1: Foundation (Agentes 1+2)
→ GDD + Arquitetura + DB Schema + Protocolo
→ TESTAR antes de avançar

### Fase 2: Core Systems (Agentes 3+4)
→ Movimento + Combate + Mapa + Servidor básico
→ TESTAR cada sistema isoladamente

### Fase 3: Integration (Todos)
→ Conectar cliente ↔ servidor
→ Multiplayer funcional
→ TESTAR fluxo completo

### Fase 4: Content & Polish (Agentes 1+3+5)
→ Mundo, quests, NPCs, economia
→ TESTAR balanceamento e UX

### Fase 5: Production Ready (Agente 5)
→ Performance, stress test, documentação
→ Deploy-ready

## Decisões de Design
- **Perspectiva:** Top-down 2D (viável para web, performático)
- **Grid:** 32x32 pixels por tile
- **Tick Rate:** 20 ticks/s servidor, 60fps cliente (interpolação)
- **Mapa:** Tilemap em chunks carregados dinamicamente
- **Máximo por região:** ~100 jogadores (sharding acima disso)
