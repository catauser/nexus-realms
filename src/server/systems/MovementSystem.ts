// ============================================================
// Nexus Realms — Movement System
// Process player movement commands, validate movement, update
// positions, and broadcast changes to nearby players.
// ============================================================

import { World, System } from '../ecs/World';
import { ZoneManager } from '../world/ZoneManager';
import { Logger } from '../utils/Logger';
import type { Direction } from '../../shared/types';

const logger = new Logger({ context: 'MovementSystem' });

/** Position component shape */
interface Position {
  x: number;
  y: number;
  zone_id: string;
  direction: Direction;
}

/** Velocity component shape */
interface Velocity {
  vx: number;
  vy: number;
  speed: number;
  speed_multiplier: number;
  is_moving: boolean;
}

/** Movement component shape */
interface Movement {
  move_command: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  current_path_index: number;
  is_pathfinding: boolean;
  input_seq: number;
}

/** Collision component shape */
interface Collision {
  width: number;
  height: number;
  is_static: boolean;
  collision_layer: number;
  collision_mask: number;
}

/**
 * Movement System — processes all entity movement each tick.
 *
 * Priority: 50 (runs after AI, before Combat)
 *
 * Responsibilities:
 * - Process player move commands
 * - Apply pathfinding for AI entities
 * - Update position based on velocity
 * - Handle zone transitions
 * - Broadcast position updates to nearby players
 */
export class MovementSystem implements System {
  public readonly name = 'MovementSystem';
  public readonly priority = 50;

  private zoneManager: ZoneManager;

  /** Accumulated position changes this tick for batched broadcast */
  private positionUpdates: Map<string, { entityId: string; x: number; y: number; direction: Direction; speed: number }> = new Map();

  constructor(zoneManager: ZoneManager) {
    this.zoneManager = zoneManager;
  }

  public update(world: World, dt: number): void {
    this.positionUpdates.clear();

    const entities = world.query(['Position', 'Velocity', 'Movement']);

    for (const entityId of entities) {
      const pos = world.getComponent<Position>(entityId, 'Position')!;
      const vel = world.getComponent<Velocity>(entityId, 'Velocity')!;
      const mov = world.getComponent<Movement>(entityId, 'Movement')!;

      // Skip dead entities
      const health = world.getComponent<{ is_alive: boolean }>(entityId, 'Health');
      if (health && !health.is_alive) continue;

      // Process move command (from player input or AI)
      if (mov.move_command) {
        this.processMoveCommand(pos, vel, mov, entityId, world);
      } else if (mov.is_pathfinding && mov.path.length > 0) {
        this.processPathFollowing(pos, vel, mov, dt);
      } else {
        // No movement — decelerate
        vel.vx = 0;
        vel.vy = 0;
        vel.is_moving = false;
      }

      // Apply velocity
      if (vel.is_moving) {
        const newX = pos.x + vel.vx * dt * 20; // 20 ticks/sec
        const newY = pos.y + vel.vy * dt * 20;

        // Validate bounds
        const clamped = this.clampToBounds(pos.zone_id, newX, newY);

        // Check collision
        const collision = world.getComponent<Collision>(entityId, 'Collision');
        if (collision && !collision.is_static) {
          const resolved = this.resolveCollision(world, entityId, pos, clamped.x, clamped.y, collision);
          pos.x = resolved.x;
          pos.y = resolved.y;
        } else {
          pos.x = clamped.x;
          pos.y = clamped.y;
        }

        // Update direction from velocity
        pos.direction = this.velocityToDirection(vel.vx, vel.vy);

        // Mark position as dirty for network sync
        world.markDirty(entityId, 'Position');

        // Queue for broadcast
        this.positionUpdates.set(entityId, {
          entityId,
          x: pos.x,
          y: pos.y,
          direction: pos.direction,
          speed: vel.speed * vel.speed_multiplier,
        });
      }

      // Clear move command
      mov.move_command = null;
    }

    // Broadcast position updates to nearby players
    this.broadcastUpdates(world);
  }

  // ─── Move Command Processing ──────────────────────────────

  /**
   * Process a direct move command (from player input).
   */
  private processMoveCommand(
    pos: Position,
    vel: Velocity,
    mov: Movement,
    entityId: string,
    world: World
  ): void {
    const target = mov.move_command!;
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.5) {
      // Close enough — stop
      vel.vx = 0;
      vel.vy = 0;
      vel.is_moving = false;
      return;
    }

    // Normalize direction and apply speed
    const effectiveSpeed = vel.speed * vel.speed_multiplier;
    const nx = dx / dist;
    const ny = dy / dist;

    // Cap movement to effective speed per tick
    const moveDistance = Math.min(dist, effectiveSpeed);
    vel.vx = nx * moveDistance;
    vel.vy = ny * moveDistance;
    vel.is_moving = true;

    // Validate speed (anti-cheat)
    if (dist > effectiveSpeed * 3) {
      logger.warn('Suspicious movement detected', {
        entityId,
        dist: Math.round(dist),
        maxSpeed: effectiveSpeed,
      });
      // Teleport hack detected — snap back
      vel.vx = 0;
      vel.vy = 0;
      vel.is_moving = false;
    }
  }

  /**
   * Process AI path following.
   */
  private processPathFollowing(
    pos: Position,
    vel: Velocity,
    mov: Movement,
    dt: number
  ): void {
    if (mov.current_path_index >= mov.path.length) {
      mov.is_pathfinding = false;
      vel.vx = 0;
      vel.vy = 0;
      vel.is_moving = false;
      return;
    }

    const target = mov.path[mov.current_path_index];
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) {
      // Reached waypoint — advance
      mov.current_path_index++;
      if (mov.current_path_index >= mov.path.length) {
        mov.is_pathfinding = false;
        vel.vx = 0;
        vel.vy = 0;
        vel.is_moving = false;
        return;
      }
    }

    const effectiveSpeed = vel.speed * vel.speed_multiplier;
    const nx = dx / dist;
    const ny = dy / dist;
    vel.vx = nx * effectiveSpeed;
    vel.vy = ny * effectiveSpeed;
    vel.is_moving = true;
  }

  // ─── Bounds & Collision ───────────────────────────────────

  /**
   * Clamp position to zone bounds.
   */
  private clampToBounds(zoneId: string, x: number, y: number): { x: number; y: number } {
    const zone = this.zoneManager.getZone(zoneId);
    if (!zone) return { x, y };
    return {
      x: Math.max(0, Math.min(zone.width - 1, x)),
      y: Math.max(0, Math.min(zone.height - 1, y)),
    };
  }

  /**
   * Simple collision resolution (slide along walls).
   */
  private resolveCollision(
    world: World,
    entityId: string,
    currentPos: Position,
    newX: number,
    newY: number,
    selfCollision: Collision
  ): { x: number; y: number } {
    // Check against all static collision entities in the zone
    const staticEntities = world.query(['Position', 'Collision']);

    for (const otherId of staticEntities) {
      if (otherId === entityId) continue;

      const otherPos = world.getComponent<Position>(otherId, 'Position')!;
      const otherCol = world.getComponent<Collision>(otherId, 'Collision')!;

      if (!otherCol.is_static) continue;
      if (otherPos.zone_id !== currentPos.zone_id) continue;

      // AABB collision check
      const halfW1 = selfCollision.width / 2;
      const halfH1 = selfCollision.height / 2;
      const halfW2 = otherCol.width / 2;
      const halfH2 = otherCol.height / 2;

      if (
        Math.abs(newX - otherPos.x) < halfW1 + halfW2 &&
        Math.abs(newY - otherPos.y) < halfH1 + halfH2
      ) {
        // Collision detected — slide along the axis with less overlap
        const overlapX = (halfW1 + halfW2) - Math.abs(newX - otherPos.x);
        const overlapY = (halfH1 + halfH2) - Math.abs(newY - otherPos.y);

        if (overlapX < overlapY) {
          // Slide on X
          newX = currentPos.x;
        } else {
          // Slide on Y
          newY = currentPos.y;
        }
      }
    }

    return { x: newX, y: newY };
  }

  // ─── Direction Helpers ─────────────────────────────────────

  /**
   * Convert velocity vector to a Direction enum value.
   */
  private velocityToDirection(vx: number, vy: number): Direction {
    const angle = Math.atan2(vy, vx) * (180 / Math.PI);

    if (angle >= -22.5 && angle < 22.5) return 'right' as Direction;
    if (angle >= 22.5 && angle < 67.5) return 'down_right' as Direction;
    if (angle >= 67.5 && angle < 112.5) return 'down' as Direction;
    if (angle >= 112.5 && angle < 157.5) return 'down_left' as Direction;
    if (angle >= 157.5 || angle < -157.5) return 'left' as Direction;
    if (angle >= -157.5 && angle < -112.5) return 'up_left' as Direction;
    if (angle >= -112.5 && angle < -67.5) return 'up' as Direction;
    return 'up_right' as Direction;
  }

  // ─── Broadcasting ─────────────────────────────────────────

  /**
   * Broadcast position updates to nearby players.
   * Only sends updates for entities that actually moved.
   */
  private broadcastUpdates(world: World): void {
    if (this.positionUpdates.size === 0) return;

    // Group updates by zone for efficient broadcasting
    const updatesByZone = new Map<string, typeof this.positionUpdates>();

    for (const [entityId, update] of this.positionUpdates) {
      const pos = world.getComponent<Position>(entityId, 'Position');
      if (!pos) continue;

      let zoneUpdates = updatesByZone.get(pos.zone_id);
      if (!zoneUpdates) {
        zoneUpdates = new Map();
        updatesByZone.set(pos.zone_id, zoneUpdates);
      }
      zoneUpdates.set(entityId, update);
    }

    // Broadcast each zone's updates to its players
    for (const [zoneId, updates] of updatesByZone) {
      // Collect player positions for spatial filtering
      const playerPositions = new Map<string, { x: number; y: number }>();
      const playersInZone = this.zoneManager.getPlayersInZone(zoneId);

      for (const pid of playersInZone) {
        const ppos = world.getComponent<Position>(pid, 'Position');
        if (ppos) playerPositions.set(pid, { x: ppos.x, y: ppos.y });
      }

      for (const [entityId, update] of updates) {
        const isPlayer = playersInZone.includes(entityId);
        const msgType = isPlayer ? 'player.move' : 'entity.move';

        this.zoneManager.broadcastToNearby(
          zoneId,
          update.x,
          update.y,
          500, // broadcast radius
          msgType,
          {
            player_id: entityId,
            entity_id: entityId,
            x: update.x,
            y: update.y,
            direction: update.direction,
            speed: update.speed,
          },
          playerPositions
        );
      }
    }
  }

  /**
   * Force-set an entity's position (for teleport, spawn, etc.)
   */
  public teleportEntity(world: World, entityId: string, x: number, y: number, zoneId?: string): void {
    const pos = world.getComponent<Position>(entityId, 'Position');
    if (!pos) return;

    pos.x = x;
    pos.y = y;
    if (zoneId) pos.zone_id = zoneId;

    // Stop movement
    const vel = world.getComponent<Velocity>(entityId, 'Velocity');
    if (vel) {
      vel.vx = 0;
      vel.vy = 0;
      vel.is_moving = false;
    }

    world.markDirty(entityId, 'Position');
  }
}
