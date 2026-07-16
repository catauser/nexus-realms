// ============================================================
// Nexus Realms — Spawn System
// Manage spawn points, respawn entities after death,
// randomize spawn positions, track spawn counts.
// ============================================================

import { World, System } from '../ecs/World';
import { Logger } from '../utils/Logger';

const logger = new Logger({ context: 'SpawnSystem' });

/** SpawnPoint component shape */
interface SpawnPoint {
  spawn_type: 'monster' | 'npc' | 'resource' | 'player';
  template_id: string;
  respawn_time: number;
  last_spawn_time: number;
  max_count: number;
  current_count: number;
  spawn_radius: number;
}

/** Position component */
interface Position {
  x: number;
  y: number;
  zone_id: string;
  direction: string;
}

/** Health component */
interface Health {
  hp: number;
  max_hp: number;
  is_alive: boolean;
  death_time: number;
}

/** Factory function for creating entities */
export type EntityFactory = (
  world: World,
  templateId: string,
  spawnX: number,
  spawnY: number,
  zoneId: string
) => string | null;

/**
 * Spawn System — manages spawn points and entity respawning.
 *
 * Priority: 30 (runs before AI and Movement)
 *
 * Responsibilities:
 * - Spawn initial entities at spawn points
 * - Respawn dead entities after their respawn timer
 * - Randomize spawn positions within spawn radius
 * - Track spawn counts per spawn point
 */
export class SpawnSystem implements System {
  public readonly name = 'SpawnSystem';
  public readonly priority = 30;

  /** Entity factory for creating new entities from templates */
  private entityFactory: EntityFactory | null = null;

  /** Map of spawned entity ID → spawn point entity ID */
  private entitySpawnPoints: Map<string, string> = new Map();

  /** Whether initial spawn has been done */
  private initialSpawnDone: boolean = false;

  /**
   * Set the entity factory function.
   * This is called when a spawn point needs to create a new entity.
   */
  public setEntityFactory(factory: EntityFactory): void {
    this.entityFactory = factory;
  }

  public update(world: World, dt: number): void {
    const now = Date.now();
    const spawnPoints = world.query(['SpawnPoint']);

    for (const spawnEntityId of spawnPoints) {
      const spawn = world.getComponent<SpawnPoint>(spawnEntityId, 'SpawnPoint')!;
      const pos = world.getComponent<Position>(spawnEntityId, 'Position');
      if (!pos) continue;

      // Initial spawn
      if (!this.initialSpawnDone) {
        this.spawnInitial(world, spawnEntityId, spawn, pos);
        continue;
      }

      // Check for respawns
      if (spawn.current_count < spawn.max_count) {
        const timeSinceLastSpawn = now - spawn.last_spawn_time;
        if (timeSinceLastSpawn >= spawn.respawn_time) {
          this.spawnEntity(world, spawnEntityId, spawn, pos);
        }
      }

      // Clean up dead entity references
      this.cleanupDeadEntities(world, spawnEntityId, spawn);
    }

    if (!this.initialSpawnDone) {
      this.initialSpawnDone = true;
      logger.info('Initial spawn complete');
    }
  }

  /**
   * Spawn initial entities at a spawn point.
   */
  private spawnInitial(
    world: World,
    spawnEntityId: string,
    spawn: SpawnPoint,
    pos: Position
  ): void {
    const toSpawn = spawn.max_count - spawn.current_count;
    for (let i = 0; i < toSpawn; i++) {
      this.spawnEntity(world, spawnEntityId, spawn, pos);
    }
  }

  /**
   * Spawn a single entity at a spawn point.
   */
  private spawnEntity(
    world: World,
    spawnEntityId: string,
    spawn: SpawnPoint,
    pos: Position
  ): void {
    if (!this.entityFactory) {
      logger.warn('No entity factory set — cannot spawn entities');
      return;
    }

    // Randomize position within spawn radius
    const spawnPos = this.randomizePosition(pos.x, pos.y, spawn.spawn_radius);

    // Create entity via factory
    const entityId = this.entityFactory(
      world,
      spawn.template_id,
      spawnPos.x,
      spawnPos.y,
      pos.zone_id
    );

    if (!entityId) {
      logger.warn(`Failed to spawn entity from template: ${spawn.template_id}`);
      return;
    }

    // Track the spawn
    this.entitySpawnPoints.set(entityId, spawnEntityId);
    spawn.current_count++;
    spawn.last_spawn_time = Date.now();

    logger.debug(`Spawned ${spawn.template_id} at (${spawnPos.x.toFixed(0)}, ${spawnPos.y.toFixed(0)}) in zone ${pos.zone_id}`);
  }

  /**
   * Clean up references to dead entities and prepare for respawn.
   */
  private cleanupDeadEntities(
    world: World,
    spawnEntityId: string,
    spawn: SpawnPoint
  ): void {
    const deadEntities: string[] = [];

    for (const [entityId, pointId] of this.entitySpawnPoints) {
      if (pointId !== spawnEntityId) continue;

      const health = world.getComponent<Health>(entityId, 'Health');
      if (!health || !health.is_alive) {
        // Entity is dead or missing
        if (!world.entityExists(entityId)) {
          deadEntities.push(entityId);
        }
      }
    }

    for (const entityId of deadEntities) {
      this.entitySpawnPoints.delete(entityId);
      spawn.current_count = Math.max(0, spawn.current_count - 1);
    }
  }

  /**
   * Randomize a position within a spawn radius.
   */
  private randomizePosition(
    centerX: number,
    centerY: number,
    radius: number
  ): { x: number; y: number } {
    if (radius <= 0) return { x: centerX, y: centerY };

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;

    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    };
  }

  /**
   * Get the spawn point entity ID for a spawned entity.
   */
  public getSpawnPoint(entityId: string): string | undefined {
    return this.entitySpawnPoints.get(entityId);
  }

  /**
   * Register a manually created entity with a spawn point.
   */
  public registerSpawnedEntity(entityId: string, spawnPointId: string): void {
    this.entitySpawnPoints.set(entityId, spawnPointId);

    const spawn = this.entitySpawnPoints.get(entityId);
    if (spawn) {
      // Increment count on the spawn point
    }
  }

  /**
   * Force-respawn all entities at a spawn point.
   */
  public forceRespawn(world: World, spawnEntityId: string): void {
    const spawn = world.getComponent<SpawnPoint>(spawnEntityId, 'SpawnPoint');
    const pos = world.getComponent<Position>(spawnEntityId, 'Position');
    if (!spawn || !pos) return;

    // Kill existing spawned entities
    for (const [entityId, pointId] of this.entitySpawnPoints) {
      if (pointId === spawnEntityId) {
        world.destroyEntity(entityId);
        this.entitySpawnPoints.delete(entityId);
      }
    }

    spawn.current_count = 0;
    spawn.last_spawn_time = 0;

    // Respawn
    this.spawnInitial(world, spawnEntityId, spawn, pos);
  }

  /**
   * Get spawn statistics.
   */
  public getStats(world: World): {
    totalSpawnPoints: number;
    totalSpawnedEntities: number;
    byType: Record<string, number>;
  } {
    const spawnPoints = world.query(['SpawnPoint']);
    const byType: Record<string, number> = {};

    let totalSpawned = 0;
    for (const spId of spawnPoints) {
      const sp = world.getComponent<SpawnPoint>(spId, 'SpawnPoint');
      if (!sp) continue;
      byType[sp.spawn_type] = (byType[sp.spawn_type] ?? 0) + sp.current_count;
      totalSpawned += sp.current_count;
    }

    return {
      totalSpawnPoints: spawnPoints.length,
      totalSpawnedEntities: totalSpawned,
      byType,
    };
  }
}
