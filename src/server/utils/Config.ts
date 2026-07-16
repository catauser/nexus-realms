// ============================================================
// Nexus Realms — Server Configuration
// Type-safe configuration from environment variables with defaults
// ============================================================

import { logger } from './Logger';

/**
 * Server configuration interface.
 * All values are loaded from environment variables with sensible defaults.
 */
export interface ServerConfig {
  // ─── Server ─────────────────────────────────────────────────
  /** Node environment */
  nodeEnv: 'development' | 'production' | 'test';
  /** Region identifier for this server instance */
  regionId: string;
  /** WebSocket server port */
  wsPort: number;
  /** HTTP health check port */
  httpPort: number;
  /** Server tick rate (ticks per second) */
  tickRate: number;
  /** Maximum catchup ticks per frame to prevent spiral of death */
  maxCatchupTicks: number;

  // ─── Database (PostgreSQL) ──────────────────────────────────
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbPoolMax: number;
  dbPoolMin: number;
  dbIdleTimeoutMs: number;
  dbConnectionTimeoutMs: number;
  dbStatementTimeoutMs: number;

  // ─── Redis ──────────────────────────────────────────────────
  redisHost: string;
  redisPort: number;
  redisPassword: string;
  redisDb: number;

  // ─── Authentication ────────────────────────────────────────
  jwtSecret: string;
  jwtExpiresIn: string;
  sessionTtlSeconds: number;
  bcryptRounds: number;
  rateLimitWindowSeconds: number;
  rateLimitMaxAttempts: number;

  // ─── Game ──────────────────────────────────────────────────
  chunkSize: number;
  viewRadius: number;
  activeRadius: number;
  maxPlayersPerRegion: number;
  saveIntervalSeconds: number;
  broadcastRadius: number;

  // ─── Logging ───────────────────────────────────────────────
  logLevel: string;
  logDir: string;
}

/**
 * Read a string from environment with a default.
 */
function env(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

/**
 * Read a number from environment with a default.
 */
function envInt(key: string, defaultValue: number): number {
  const raw = process.env[key];
  if (raw === undefined) return defaultValue;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    logger.warn(`Invalid numeric env var ${key}="${raw}", using default ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

/**
 * Read a boolean from environment with a default.
 */
function envBool(key: string, defaultValue: boolean): boolean {
  const raw = process.env[key];
  if (raw === undefined) return defaultValue;
  return raw === 'true' || raw === '1';
}

/**
 * Build the full server configuration from environment variables.
 */
export function loadConfig(): ServerConfig {
  const config: ServerConfig = {
    // Server
    nodeEnv: (env('NODE_ENV', 'development') as ServerConfig['nodeEnv']),
    regionId: env('REGION_ID', 'region-local'),
    wsPort: envInt('WS_PORT', 8080),
    httpPort: envInt('HTTP_PORT', 8081),
    tickRate: envInt('TICK_RATE', 20),
    maxCatchupTicks: envInt('MAX_CATCHUP_TICKS', 5),

    // Database
    dbHost: env('DB_HOST', 'localhost'),
    dbPort: envInt('DB_PORT', 5432),
    dbName: env('DB_NAME', 'nexus_realms'),
    dbUser: env('DB_USER', 'nexus_server'),
    dbPassword: env('DB_PASSWORD', ''),
    dbPoolMax: envInt('DB_POOL_MAX', 20),
    dbPoolMin: envInt('DB_POOL_MIN', 5),
    dbIdleTimeoutMs: envInt('DB_IDLE_TIMEOUT_MS', 30000),
    dbConnectionTimeoutMs: envInt('DB_CONNECTION_TIMEOUT_MS', 5000),
    dbStatementTimeoutMs: envInt('DB_STATEMENT_TIMEOUT_MS', 10000),

    // Redis
    redisHost: env('REDIS_HOST', 'localhost'),
    redisPort: envInt('REDIS_PORT', 6379),
    redisPassword: env('REDIS_PASSWORD', ''),
    redisDb: envInt('REDIS_DB', 0),

    // Auth
    jwtSecret: env('JWT_SECRET', 'dev-secret-change-in-production'),
    jwtExpiresIn: env('JWT_EXPIRES_IN', '24h'),
    sessionTtlSeconds: envInt('SESSION_TTL', 300),
    bcryptRounds: envInt('BCRYPT_ROUNDS', 12),
    rateLimitWindowSeconds: envInt('RATE_LIMIT_WINDOW', 900),
    rateLimitMaxAttempts: envInt('RATE_LIMIT_MAX', 5),

    // Game
    chunkSize: envInt('CHUNK_SIZE', 64),
    viewRadius: envInt('VIEW_RADIUS', 2),
    activeRadius: envInt('ACTIVE_RADIUS', 1),
    maxPlayersPerRegion: envInt('MAX_PLAYERS_PER_REGION', 200),
    saveIntervalSeconds: envInt('SAVE_INTERVAL', 10),
    broadcastRadius: envInt('BROADCAST_RADIUS', 500),

    // Logging
    logLevel: env('LOG_LEVEL', 'info'),
    logDir: env('LOG_DIR', 'logs'),
  };

  // Validate critical config
  if (config.nodeEnv === 'production') {
    if (config.jwtSecret === 'dev-secret-change-in-production') {
      logger.fatal('JWT_SECRET must be set in production!');
      process.exit(1);
    }
    if (!config.dbPassword) {
      logger.fatal('DB_PASSWORD must be set in production!');
      process.exit(1);
    }
  }

  return config;
}

/** Singleton config instance */
let _config: ServerConfig | null = null;

/**
 * Get the server configuration singleton.
 * Loads from environment on first call.
 */
export function getConfig(): ServerConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}
