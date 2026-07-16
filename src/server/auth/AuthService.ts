// ============================================================
// Nexus Realms — Authentication Service
// Login/register with bcrypt, JWT tokens, session management,
// and rate limiting.
// ============================================================

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/Database';
import { getRedis } from '../db/RedisClient';
import { getConfig } from '../utils/Config';
import { Logger } from '../utils/Logger';

const logger = new Logger({ context: 'Auth' });

/** Account data from the database */
interface AccountRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  status: string;
  is_admin: boolean;
  is_moderator: boolean;
  ban_reason: string | null;
  ban_expires_at: string | null;
}

/** JWT payload structure */
export interface JWTPayload {
  accountId: string;
  username: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

/** Session data stored in Redis */
export interface SessionData {
  accountId: string;
  characterId: string | null;
  regionId: string;
  createdAt: number;
  expiresAt: number;
}

/** Authentication result */
export type AuthResult =
  | { success: true; token: string; accountId: string; username: string; isAdmin: boolean }
  | { success: false; code: number; message: string; retryAfter?: number };

/**
 * Authentication service handling login, registration,
 * JWT tokens, session management, and rate limiting.
 */
export class AuthService {
  private db = getDatabase();
  private redis = getRedis();

  // ─── Registration ─────────────────────────────────────────

  /**
   * Register a new account.
   * @returns Auth result with token on success
   */
  public async register(username: string, email: string, password: string): Promise<AuthResult> {
    const config = getConfig();

    // Validate inputs
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      return { success: false, code: 9004, message: 'Invalid username (3-32 alphanumeric characters)' };
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      return { success: false, code: 9004, message: 'Invalid email format' };
    }
    if (password.length < 8) {
      return { success: false, code: 9004, message: 'Password must be at least 8 characters' };
    }

    // Check if username or email is taken
    const existing = await this.db.queryOne<{ id: string }>(
      'SELECT id FROM accounts WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existing) {
      return { success: false, code: 9004, message: 'Username or email already taken' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    // Create account
    const account = await this.db.queryOne<AccountRow>(
      `INSERT INTO accounts (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [username, email, passwordHash]
    );

    if (!account) {
      return { success: false, code: 9001, message: 'Failed to create account' };
    }

    logger.info('Account registered', { accountId: account.id, username });

    // Generate token and session
    const token = this.generateToken(account);
    await this.createSession(token, account.id);

    return {
      success: true,
      token,
      accountId: account.id,
      username: account.username,
      isAdmin: account.is_admin,
    };
  }

  // ─── Login ────────────────────────────────────────────────

  /**
   * Authenticate with username and password.
   */
  public async login(username: string, password: string, clientIp?: string): Promise<AuthResult> {
    const config = getConfig();

    // Rate limiting
    if (clientIp) {
      const rateLimitKey = `login:${clientIp}`;
      const { allowed, remaining } = await this.redis.checkRateLimit(
        rateLimitKey,
        config.rateLimitMaxAttempts,
        config.rateLimitWindowSeconds
      );

      if (!allowed) {
        logger.warn('Login rate limited', { ip: clientIp });
        return {
          success: false,
          code: 1008,
          message: 'Too many login attempts. Please try again later.',
          retryAfter: config.rateLimitWindowSeconds,
        };
      }
    }

    // Find account
    const account = await this.db.queryOne<AccountRow>(
      'SELECT * FROM accounts WHERE username = $1',
      [username]
    );

    if (!account) {
      return { success: false, code: 1001, message: 'Invalid username or password' };
    }

    // Check account status
    if (account.status === 'banned') {
      return {
        success: false,
        code: 1002,
        message: account.ban_reason || 'Account is banned',
      };
    }
    if (account.status === 'suspended') {
      return {
        success: false,
        code: 1003,
        message: 'Account is temporarily suspended',
      };
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, account.password_hash);
    if (!passwordValid) {
      return { success: false, code: 1001, message: 'Invalid username or password' };
    }

    // Update login stats
    await this.db.query(
      'UPDATE accounts SET last_login = NOW(), login_count = login_count + 1 WHERE id = $1',
      [account.id]
    );

    // Generate token and session
    const token = this.generateToken(account);
    await this.createSession(token, account.id);

    logger.info('Account logged in', { accountId: account.id, username });

    return {
      success: true,
      token,
      accountId: account.id,
      username: account.username,
      isAdmin: account.is_admin,
    };
  }

  // ─── Token Management ─────────────────────────────────────

  /**
   * Validate a JWT token.
   * @returns The decoded payload, or null if invalid/expired
   */
  public validateToken(token: string): JWTPayload | null {
    const config = getConfig();
    try {
      return jwt.verify(token, config.jwtSecret) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Validate a session token (check Redis).
   */
  public async validateSession(token: string): Promise<SessionData | null> {
    const session = await this.redis.getSession(token);
    if (!session) return null;

    const data = session as unknown as SessionData;
    if (data.expiresAt < Date.now()) {
      await this.redis.deleteSession(token);
      return null;
    }

    return data;
  }

  /**
   * Refresh a session (extend TTL).
   */
  public async refreshSession(token: string): Promise<boolean> {
    const config = getConfig();
    const session = await this.validateSession(token);
    if (!session) return false;

    session.expiresAt = Date.now() + config.sessionTtlSeconds * 1000;
    await this.redis.setSession(token, session as unknown as Record<string, unknown>, config.sessionTtlSeconds);
    return true;
  }

  /**
   * Destroy a session (logout).
   */
  public async logout(token: string): Promise<void> {
    await this.redis.deleteSession(token);
    logger.info('Session destroyed');
  }

  // ─── Internal ─────────────────────────────────────────────

  /**
   * Generate a JWT token for an account.
   */
  private generateToken(account: AccountRow): string {
    const config = getConfig();
    const payload: JWTPayload = {
      accountId: account.id,
      username: account.username,
      isAdmin: account.is_admin,
    };
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  }

  /**
   * Create a session in Redis.
   */
  private async createSession(token: string, accountId: string): Promise<void> {
    const config = getConfig();
    const sessionData: SessionData = {
      accountId,
      characterId: null,
      regionId: config.regionId,
      createdAt: Date.now(),
      expiresAt: Date.now() + config.sessionTtlSeconds * 1000,
    };
    await this.redis.setSession(token, sessionData as unknown as Record<string, unknown>, config.sessionTtlSeconds);
  }

  /**
   * Update session with character selection.
   */
  public async selectCharacter(token: string, characterId: string): Promise<boolean> {
    const config = getConfig();
    const session = await this.validateSession(token);
    if (!session) return false;

    session.characterId = characterId;
    await this.redis.setSession(token, session as unknown as Record<string, unknown>, config.sessionTtlSeconds);
    return true;
  }
}
