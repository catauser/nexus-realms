// ============================================================
// Nexus Realms — Database Connection (PostgreSQL)
// Connection pool, query helpers, transactions, migrations.
// ============================================================

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { getConfig } from '../utils/Config';
import { Logger } from '../utils/Logger';

const logger = new Logger({ context: 'Database' });

/**
 * PostgreSQL database wrapper with connection pooling,
 * transaction support, and basic migration runner.
 */
export class Database {
  private pool: Pool;
  private connected: boolean = false;

  constructor() {
    const config = getConfig();
    this.pool = new Pool({
      host: config.dbHost,
      port: config.dbPort,
      database: config.dbName,
      user: config.dbUser,
      password: config.dbPassword,
      max: config.dbPoolMax,
      min: config.dbPoolMin,
      idleTimeoutMillis: config.dbIdleTimeoutMs,
      connectionTimeoutMillis: config.dbConnectionTimeoutMs,
      statement_timeout: config.dbStatementTimeoutMs,
      application_name: `nexus-region-${config.regionId}`,
    });

    this.pool.on('connect', () => {
      logger.debug('New database connection established');
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected database error on idle client', err);
    });
  }

  // ─── Connection Lifecycle ─────────────────────────────────

  /**
   * Test the database connection.
   * @returns true if connection is healthy
   */
  public async connect(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT NOW() AS time, current_database() AS db');
      this.connected = true;
      logger.info('Database connected', {
        db: result.rows[0].db,
        time: result.rows[0].time,
      });
      return true;
    } catch (err) {
      logger.error('Database connection failed', err);
      this.connected = false;
      return false;
    }
  }

  /**
   * Close all connections in the pool.
   */
  public async close(): Promise<void> {
    await this.pool.end();
    this.connected = false;
    logger.info('Database pool closed');
  }

  /**
   * Check if the database is connected and healthy.
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Run a health check query.
   */
  public async healthCheck(): Promise<{ status: string; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.pool.query('SELECT 1');
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      return { status: 'error', latencyMs: Date.now() - start };
    }
  }

  // ─── Query Helpers ────────────────────────────────────────

  /**
   * Execute a parameterized query.
   * @param text - SQL query text with $1, $2, etc. placeholders
   * @param params - Query parameters
   * @returns Query result
   */
  public async query<T extends QueryResultRow = any>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
        logger.warn('Slow query detected', { duration, text: text.substring(0, 200) });
      }
      return result;
    } catch (err) {
      logger.error('Query failed', err, { text: text.substring(0, 200), params });
      throw err;
    }
  }

  /**
   * Execute a query and return the first row, or null if no rows.
   */
  public async queryOne<T extends QueryResultRow = any>(
    text: string,
    params?: unknown[]
  ): Promise<T | null> {
    const result = await this.query<T>(text, params);
    return result.rows[0] ?? null;
  }

  /**
   * Execute a query and return all rows.
   */
  public async queryAll<T extends QueryResultRow = any>(
    text: string,
    params?: unknown[]
  ): Promise<T[]> {
    const result = await this.query<T>(text, params);
    return result.rows;
  }

  /**
   * Execute an INSERT query and return the inserted row.
   */
  public async insert<T extends QueryResultRow = any>(
    table: string,
    data: Record<string, unknown>
  ): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`);

    const text = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    const result = await this.query<T>(text, values);
    return result.rows[0];
  }

  /**
   * Execute an UPDATE query and return the updated row.
   */
  public async update<T extends QueryResultRow = any>(
    table: string,
    data: Record<string, unknown>,
    where: string,
    whereParams: unknown[]
  ): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const paramOffset = keys.length;
    const whereClause = where.replace(/\$(\d+)/g, (_, num) => `$${parseInt(num) + paramOffset}`);

    const text = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
    const result = await this.query<T>(text, [...values, ...whereParams]);
    return result.rows[0] ?? null;
  }

  /**
   * Execute a DELETE query and return the count of deleted rows.
   */
  public async delete(
    table: string,
    where: string,
    params: unknown[]
  ): Promise<number> {
    const text = `DELETE FROM ${table} WHERE ${where}`;
    const result = await this.query(text, params);
    return result.rowCount ?? 0;
  }

  // ─── Transactions ─────────────────────────────────────────

  /**
   * Execute a function within a database transaction.
   * Automatically commits on success, rolls back on error.
   *
   * @param fn - Function receiving a PoolClient for the transaction
   * @returns The return value of fn
   */
  public async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back', err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Execute multiple queries in a single transaction using batch mode.
   * Useful for bulk inserts/updates.
   */
  public async batch(
    queries: { text: string; params?: unknown[] }[]
  ): Promise<QueryResult[]> {
    return this.transaction(async (client) => {
      const results: QueryResult[] = [];
      for (const q of queries) {
        results.push(await client.query(q.text, q.params));
      }
      return results;
    });
  }

  // ─── Migrations ───────────────────────────────────────────

  /**
   * Run database migrations from a migrations directory.
   * Tracks applied migrations in a `_migrations` table.
   *
   * @param migrations - Array of { name, sql } migration objects
   */
  public async runMigrations(
    migrations: { name: string; sql: string }[]
  ): Promise<number> {
    // Ensure migrations table exists
    await this.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Get already applied migrations
    const applied = await this.queryAll<{ name: string }>(
      'SELECT name FROM _migrations ORDER BY name'
    );
    const appliedSet = new Set(applied.map(r => r.name));

    let count = 0;
    for (const migration of migrations) {
      if (appliedSet.has(migration.name)) continue;

      logger.info(`Applying migration: ${migration.name}`);
      await this.transaction(async (client) => {
        await client.query(migration.sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [migration.name]);
      });
      count++;
    }

    if (count > 0) {
      logger.info(`Applied ${count} migration(s)`);
    }
    return count;
  }

  // ─── Stats ────────────────────────────────────────────────

  /**
   * Get pool statistics.
   */
  public getPoolStats(): {
    total: number;
    idle: number;
    waiting: number;
  } {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
    };
  }
}

/** Singleton database instance */
let _db: Database | null = null;

/**
 * Get or create the database singleton.
 */
export function getDatabase(): Database {
  if (!_db) {
    _db = new Database();
  }
  return _db;
}
