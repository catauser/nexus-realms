// ============================================================
// Nexus Realms — Server Entry Point
// Initializes all systems and starts the game server
// ============================================================
import { Config } from './utils/Config';
import { Logger } from './utils/Logger';
import { Database } from './db/Database';
import { RedisClient } from './db/RedisClient';
import { World } from './ecs/World';
import { WebSocketServer } from './network/WebSocketServer';
import { MessageRouter } from './network/MessageRouter';
import { AuthService } from './auth/AuthService';
import { PlayerRepository } from './db/repositories/PlayerRepository';
import { ItemRepository } from './db/repositories/ItemRepository';
import { ZoneManager } from './world/ZoneManager';
import { MovementSystem } from './systems/MovementSystem';
import { CombatSystem } from './systems/CombatSystem';
import { AISystem } from './systems/AISystem';
import { BuffSystem } from './systems/BuffSystem';
import { SpawnSystem } from './systems/SpawnSystem';
import { QuestSystem } from './systems/QuestSystem';
import { EventSystem } from './systems/EventSystem';
import { PlayerHandler } from './handlers/PlayerHandler';
import { ChatHandler } from './handlers/ChatHandler';
import { InventoryHandler } from './handlers/InventoryHandler';
import { QuestHandler } from './handlers/QuestHandler';
import { TradeHandler } from './handlers/TradeHandler';

const logger = new Logger('Main');

/**
 * Main server initialization
 */
async function main(): Promise<void> {
  logger.info('=== NEXUS REALMS SERVER ===');
  logger.info(`Version: 0.1.0`);
  logger.info(`Environment: ${Config.NODE_ENV}`);

  // ─── 1. Database ───────────────────────────────────────────
  logger.info('Initializing database...');
  const db = new Database();
  try {
    await db.connect();
    logger.info('PostgreSQL connected');
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL', { error: String(error) });
    process.exit(1);
  }

  // ─── 2. Redis ──────────────────────────────────────────────
  logger.info('Initializing Redis...');
  const redis = new RedisClient();
  try {
    await redis.connect();
    logger.info('Redis connected');
  } catch (error) {
    logger.error('Failed to connect to Redis', { error: String(error) });
    process.exit(1);
  }

  // ─── 3. Repositories ───────────────────────────────────────
  logger.info('Initializing repositories...');
  const playerRepo = new PlayerRepository(db);
  const itemRepo = new ItemRepository(db);

  // ─── 4. ECS World ──────────────────────────────────────────
  logger.info('Initializing ECS World...');
  const world = new World();

  // ─── 5. Zone Manager ───────────────────────────────────────
  logger.info('Loading zones...');
  const zoneManager = new ZoneManager(world);
  await zoneManager.loadZones();
  logger.info(`Loaded ${zoneManager.getZoneCount()} zones`);

  // ─── 6. Auth Service ───────────────────────────────────────
  logger.info('Initializing auth service...');
  const authService = new AuthService(db, redis);

  // ─── 7. WebSocket Server ───────────────────────────────────
  logger.info('Starting WebSocket server...');
  const messageRouter = new MessageRouter(world, authService, playerRepo, itemRepo);
  const wsServer = new WebSocketServer(messageRouter);

  // ─── 8. Game Systems ───────────────────────────────────────
  logger.info('Registering ECS systems...');
  world.registerSystem(new SpawnSystem(world, zoneManager));
  world.registerSystem(new AISystem(world));
  world.registerSystem(new MovementSystem(world, wsServer));
  world.registerSystem(new CombatSystem(world, wsServer));
  world.registerSystem(new BuffSystem(world));
  world.registerSystem(new QuestSystem(world));
  world.registerSystem(new EventSystem(world, zoneManager));

  // ─── 9. Message Handlers ───────────────────────────────────
  logger.info('Registering message handlers...');
  const playerHandler = new PlayerHandler(world, wsServer);
  const chatHandler = new ChatHandler(world, wsServer);
  const inventoryHandler = new InventoryHandler(world, wsServer);
  const questHandler = new QuestHandler(world, wsServer);
  const tradeHandler = new TradeHandler(world, wsServer);

  messageRouter.registerHandlers(
    playerHandler,
    chatHandler,
    inventoryHandler,
    questHandler,
    tradeHandler,
  );

  // ─── 10. Start Servers ─────────────────────────────────────
  wsServer.start(Config.WS_PORT);
  logger.info(`WebSocket server listening on port ${Config.WS_PORT}`);

  // HTTP health check endpoint
  const http = await import('http');
  const healthServer = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        uptime: process.uptime(),
        players: wsServer.getAuthenticatedCount(),
        entities: world.getEntityCount(),
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  healthServer.listen(Config.HTTP_PORT, () => {
    logger.info(`Health check server on port ${Config.HTTP_PORT}`);
  });

  // ─── 11. Game Loop ─────────────────────────────────────────
  logger.info('Starting game loop...');
  const TICK_RATE = 1000 / Config.SERVER_TICK_RATE; // 50ms per tick
  let lastTick = Date.now();
  let tickCount = 0;

  const gameLoop = setInterval(() => {
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;

    try {
      world.update(delta);
      tickCount++;

      // Log stats every 1000 ticks (~50 seconds)
      if (tickCount % 1000 === 0) {
        logger.info(`Tick ${tickCount} | Entities: ${world.getEntityCount()} | Players: ${wsServer.getAuthenticatedCount()}`);
      }
    } catch (error) {
      logger.error('Game loop error', { error: String(error) });
    }
  }, TICK_RATE);

  // ─── 12. Graceful Shutdown ─────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down...`);

    // Stop game loop
    clearInterval(gameLoop);

    // Save all players
    logger.info('Saving all players...');
    // Would iterate all player entities and save

    // Stop WebSocket server
    await wsServer.stop();

    // Close database connections
    await db.disconnect();
    await redis.disconnect();

    logger.info('Server shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason: String(reason) });
  });

  logger.info('=== SERVER READY ===');
}

// Start the server
main().catch((error) => {
  logger.error('Fatal error during startup', { error: String(error) });
  process.exit(1);
});
