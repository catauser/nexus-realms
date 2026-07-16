// ============================================================
// Nexus Realms — Redis Client
// Connection, session storage, caching, and pub/sub.
// ============================================================

import Redis from 'ioredis';
import { getConfig } from '../utils/Config';
import { Logger } from '../utils/Logger';

const logger = new Logger({ context: 'Redis' });

/**
 * Redis client wrapper providing session storage,
 * cache helpers, distributed locks, and pub/sub.
 */
export class RedisClient {
  private client: Redis;
  private subscriber: Redis;
  private connected: boolean = false;
  private pubsubHandlers: Map<string, (channel: string, message: string) => void> = new Map();

  constructor() {
    const config = getConfig();

    const opts: Redis.RedisOptions = {
      host: config.redisHost,
      port: config.redisPort,
      db: config.redisDb,
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 10) return null; // Stop retrying
        return Math.min(times * 200, 5000);
      },
      lazyConnect: true,
    };

    if (config.redisPassword) {
      opts.password = config.redisPassword;
    }

    this.client = new Redis(opts);
    this.subscriber = new Redis(opts);

    this.client.on('connect', () => {
      logger.info('Redis connected');
      this.connected = true;
    });

    this.client.on('error', (err) => {
      logger.error('Redis error', err);
    });

    this.subscriber.on('message', (channel, message) => {
      const handler = this.pubsubHandlers.get(channel);
      if (handler) {
        handler(channel, message);
      }
    });
  }

  // ─── Connection ───────────────────────────────────────────

  /**
   * Connect to Redis.
   */
  public async connect(): Promise<boolean> {
    try {
      await this.client.connect();
      await this.subscriber.connect();
      this.connected = true;
      logger.info('Redis connection established');
      return true;
    } catch (err) {
      logger.error('Redis connection failed', err);
      this.connected = false;
      return false;
    }
  }

  /**
   * Gracefully disconnect from Redis.
   */
  public async close(): Promise<void> {
    await this.subscriber.quit();
    await this.client.quit();
    this.connected = false;
    logger.info('Redis connections closed');
  }

  /**
   * Health check.
   */
  public async healthCheck(): Promise<{ status: string; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.client.ping();
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      return { status: 'error', latencyMs: Date.now() - start };
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  // ─── Basic Operations ─────────────────────────────────────

  /**
   * Set a key with optional TTL.
   */
  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Get a key's value.
   */
  public async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Delete one or more keys.
   */
  public async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  /**
   * Check if a key exists.
   */
  public async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  /**
   * Set a key's TTL in seconds.
   */
  public async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  /**
   * Get remaining TTL for a key.
   */
  public async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  // ─── Hash Operations ──────────────────────────────────────

  /**
   * Set a field in a hash.
   */
  public async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  /**
   * Get a field from a hash.
   */
  public async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  /**
   * Get all fields and values from a hash.
   */
  public async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  /**
   * Delete a field from a hash.
   */
  public async hdel(key: string, field: string): Promise<number> {
    return this.client.hdel(key, field);
  }

  /**
   * Set multiple fields in a hash.
   */
  public async hmset(key: string, data: Record<string, string>): Promise<void> {
    await this.client.hmset(key, data);
  }

  // ─── Set Operations ───────────────────────────────────────

  /**
   * Add a member to a set.
   */
  public async sadd(key: string, member: string): Promise<number> {
    return this.client.sadd(key, member);
  }

  /**
   * Remove a member from a set.
   */
  public async srem(key: string, member: string): Promise<number> {
    return this.client.srem(key, member);
  }

  /**
   * Check if a value is a member of a set.
   */
  public async sismember(key: string, member: string): Promise<boolean> {
    return (await this.client.sismember(key, member)) === 1;
  }

  /**
   * Get all members of a set.
   */
  public async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  /**
   * Get the number of members in a set.
   */
  public async scard(key: string): Promise<number> {
    return this.client.scard(key);
  }

  // ─── Sorted Set Operations ────────────────────────────────

  /**
   * Add a member with score to a sorted set.
   */
  public async zadd(key: string, score: number, member: string): Promise<number> {
    return this.client.zadd(key, score, member);
  }

  /**
   * Get members in a score range (high to low).
   */
  public async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrevrange(key, start, stop);
  }

  /**
   * Increment a member's score.
   */
  public async zincrby(key: string, increment: number, member: string): Promise<string> {
    return this.client.zincrby(key, increment, member);
  }

  // ─── Counter Operations ───────────────────────────────────

  /**
   * Increment a counter. Returns the new value.
   */
  public async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Decrement a counter. Returns the new value.
   */
  public async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  /**
   * Increment a counter by a specific amount.
   */
  public async incrby(key: string, amount: number): Promise<number> {
    return this.client.incrby(key, amount);
  }

  // ─── Session Storage ──────────────────────────────────────

  /**
   * Store a session with TTL.
   */
  public async setSession(token: string, data: Record<string, unknown>, ttlSeconds: number): Promise<void> {
    await this.set(`session:${token}`, JSON.stringify(data), ttlSeconds);
  }

  /**
   * Get session data.
   */
  public async getSession(token: string): Promise<Record<string, unknown> | null> {
    const raw = await this.get(`session:${token}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Delete a session.
   */
  public async deleteSession(token: string): Promise<void> {
    await this.del(`session:${token}`);
  }

  // ─── Cache Helpers ────────────────────────────────────────

  /**
   * Cache-aside pattern: get from cache, or compute and cache.
   */
  public async cacheGet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    const cached = await this.get(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        // Cache corrupted, re-fetch
      }
    }

    const value = await fetcher();
    await this.set(key, JSON.stringify(value), ttlSeconds);
    return value;
  }

  /**
   * Invalidate a cached key.
   */
  public async cacheInvalidate(key: string): Promise<void> {
    await this.del(key);
  }

  // ─── Distributed Locks ────────────────────────────────────

  /**
   * Acquire a distributed lock. Returns a release function or null if failed.
   * @param lockKey - Lock key
   * @param ttlSeconds - Lock auto-release TTL
   */
  public async acquireLock(
    lockKey: string,
    ttlSeconds: number = 10
  ): Promise<(() => Promise<void>) | null> {
    const lockValue = `${Date.now()}-${Math.random().toString(36).substr(2)}`;
    const acquired = await this.client.set(
      `lock:${lockKey}`,
      lockValue,
      'EX',
      ttlSeconds,
      'NX'
    );

    if (!acquired) return null;

    return async () => {
      // Only release if we still own the lock
      const current = await this.get(`lock:${lockKey}`);
      if (current === lockValue) {
        await this.del(`lock:${lockKey}`);
      }
    };
  }

  // ─── Pub/Sub ──────────────────────────────────────────────

  /**
   * Subscribe to a channel.
   */
  public async subscribe(
    channel: string,
    handler: (channel: string, message: string) => void
  ): Promise<void> {
    this.pubsubHandlers.set(channel, handler);
    await this.subscriber.subscribe(channel);
    logger.debug(`Subscribed to channel: ${channel}`);
  }

  /**
   * Unsubscribe from a channel.
   */
  public async unsubscribe(channel: string): Promise<void> {
    this.pubsubHandlers.delete(channel);
    await this.subscriber.unsubscribe(channel);
  }

  /**
   * Publish a message to a channel.
   */
  public async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  /**
   * Publish a JSON message to a channel.
   */
  public async publishJSON(channel: string, data: Record<string, unknown>): Promise<number> {
    return this.publish(channel, JSON.stringify(data));
  }

  // ─── Rate Limiting ────────────────────────────────────────

  /**
   * Check and increment a rate limit counter (sliding window).
   * @returns { allowed: boolean, remaining: number }
   */
  public async checkRateLimit(
    key: string,
    maxAttempts: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    const redisKey = `rl:${key}`;
    const current = await this.incr(redisKey);

    if (current === 1) {
      await this.expire(redisKey, windowSeconds);
    }

    return {
      allowed: current <= maxAttempts,
      remaining: Math.max(0, maxAttempts - current),
    };
  }
}

/** Singleton Redis instance */
let _redis: RedisClient | null = null;

/**
 * Get or create the Redis client singleton.
 */
export function getRedis(): RedisClient {
  if (!_redis) {
    _redis = new RedisClient();
  }
  return _redis;
}
