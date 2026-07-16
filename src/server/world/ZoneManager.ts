// ============================================================
// Nexus Realms — Zone Manager
// Load zone definitions, manage entities per zone,
// zone-wide broadcasts, and player zone transitions.
// ============================================================

import { Logger } from '../utils/Logger';
import { getConfig } from '../utils/Config';
import type { ZoneDefinition, Vec2, WeatherType } from '../../shared/types';

const logger = new Logger({ context: 'ZoneManager' });

/** Zone state tracking */
interface ZoneState {
  definition: ZoneDefinition;
  /** Set of entity IDs currently in this zone */
  entities: Set<string>;
  /** Set of player entity IDs in this zone */
  players: Set<string>;
  /** Current weather */
  weather: WeatherType;
  /** Weather intensity (0-1) */
  weatherIntensity: number;
  /** Game time of day (0-24) */
  gameTime: number;
  /** Whether the zone is currently active (has players) */
  active: boolean;
}

/**
 * Manages world zones: loading definitions, tracking entity presence,
 * broadcasting to zone players, and handling zone transitions.
 */
export class ZoneManager {
  /** Zone states indexed by zone ID */
  private zones: Map<string, ZoneState> = new Map();

  /** Player's current zone (playerEntityId → zoneId) */
  private playerZones: Map<string, string> = new Map();

  /** Callback for sending messages to specific players */
  private sendToPlayer: ((playerId: string, type: string, data: Record<string, unknown>) => void) | null = null;

  /**
   * Initialize with a callback for sending messages to players.
   */
  public setSendCallback(callback: (playerId: string, type: string, data: Record<string, unknown>) => void): void {
    this.sendToPlayer = callback;
  }

  // ─── Zone Loading ─────────────────────────────────────────

  /**
   * Load a zone definition.
   */
  public loadZone(definition: ZoneDefinition): void {
    const state: ZoneState = {
      definition,
      entities: new Set(),
      players: new Set(),
      weather: 'clear' as WeatherType,
      weatherIntensity: 0,
      gameTime: 12, // Noon
      active: false,
    };

    this.zones.set(definition.id, state);
    logger.info(`Zone loaded: ${definition.name} (${definition.id})`, {
      width: definition.width,
      height: definition.height,
      spawns: definition.monster_spawns.length,
    });
  }

  /**
   * Load multiple zone definitions.
   */
  public loadZones(definitions: ZoneDefinition[]): void {
    for (const def of definitions) {
      this.loadZone(def);
    }
    logger.info(`Loaded ${definitions.length} zones`);
  }

  /**
   * Get a zone's definition.
   */
  public getZone(zoneId: string): ZoneDefinition | undefined {
    return this.zones.get(zoneId)?.definition;
  }

  /**
   * Get all zone IDs.
   */
  public getZoneIds(): string[] {
    return Array.from(this.zones.keys());
  }

  /**
   * Get zone state.
   */
  public getZoneState(zoneId: string): ZoneState | undefined {
    return this.zones.get(zoneId);
  }

  // ─── Entity Management ────────────────────────────────────

  /**
   * Add an entity to a zone.
   */
  public addEntityToZone(entityId: string, zoneId: string, isPlayer: boolean = false): void {
    const zone = this.zones.get(zoneId);
    if (!zone) {
      logger.warn(`addEntityToZone: Zone ${zoneId} not found`);
      return;
    }

    zone.entities.add(entityId);
    if (isPlayer) {
      zone.players.add(entityId);
      this.playerZones.set(entityId, zoneId);
      zone.active = true;
    }
  }

  /**
   * Remove an entity from its current zone.
   */
  public removeEntityFromZone(entityId: string): void {
    const zoneId = this.playerZones.get(entityId);
    if (zoneId) {
      const zone = this.zones.get(zoneId);
      if (zone) {
        zone.entities.delete(entityId);
        zone.players.delete(entityId);
        if (zone.players.size === 0) {
          zone.active = false;
        }
      }
      this.playerZones.delete(entityId);
    } else {
      // Search all zones for non-player entities
      for (const zone of this.zones.values()) {
        if (zone.entities.has(entityId)) {
          zone.entities.delete(entityId);
          break;
        }
      }
    }
  }

  /**
   * Get the zone a player is currently in.
   */
  public getPlayerZone(playerId: string): string | undefined {
    return this.playerZones.get(playerId);
  }

  /**
   * Get all player IDs in a specific zone.
   */
  public getPlayersInZone(zoneId: string): string[] {
    const zone = this.zones.get(zoneId);
    return zone ? Array.from(zone.players) : [];
  }

  /**
   * Get all entity IDs in a specific zone.
   */
  public getEntitiesInZone(zoneId: string): string[] {
    const zone = this.zones.get(zoneId);
    return zone ? Array.from(zone.entities) : [];
  }

  /**
   * Get the number of players in a zone.
   */
  public getPlayerCount(zoneId: string): number {
    return this.zones.get(zoneId)?.players.size ?? 0;
  }

  /**
   * Get total online player count across all zones.
   */
  public getTotalPlayerCount(): number {
    return this.playerZones.size;
  }

  // ─── Zone Transitions ─────────────────────────────────────

  /**
   * Move a player from one zone to another.
   * Returns entities to despawn (old zone) and spawn (new zone).
   */
  public transitionPlayer(
    playerId: string,
    fromZoneId: string,
    toZoneId: string
  ): { success: boolean; despawnEntities: string[]; spawnEntities: string[] } {
    const fromZone = this.zones.get(fromZoneId);
    const toZone = this.zones.get(toZoneId);

    if (!fromZone || !toZone) {
      return { success: false, despawnEntities: [], spawnEntities: [] };
    }

    // Remove from old zone
    fromZone.entities.delete(playerId);
    fromZone.players.delete(playerId);

    // Add to new zone
    toZone.entities.add(playerId);
    toZone.players.add(playerId);
    toZone.active = true;
    this.playerZones.set(playerId, toZoneId);

    // Collect entities to despawn (old zone non-player entities)
    const despawnEntities = Array.from(fromZone.entities).filter(id => !fromZone.players.has(id));

    // Collect entities to spawn (new zone non-player entities)
    const spawnEntities = Array.from(toZone.entities).filter(id => !toZone.players.has(id));

    logger.debug(`Player ${playerId} transitioned: ${fromZoneId} → ${toZoneId}`);
    return { success: true, despawnEntities, spawnEntities };
  }

  // ─── Broadcasting ─────────────────────────────────────────

  /**
   * Broadcast a message to all players in a zone.
   */
  public broadcastToZone(zoneId: string, type: string, data: Record<string, unknown>): void {
    if (!this.sendToPlayer) return;

    const zone = this.zones.get(zoneId);
    if (!zone) return;

    for (const playerId of zone.players) {
      this.sendToPlayer(playerId, type, data);
    }
  }

  /**
   * Broadcast a message to all players in a zone except one.
   */
  public broadcastToZoneExcept(
    zoneId: string,
    excludePlayerId: string,
    type: string,
    data: Record<string, unknown>
  ): void {
    if (!this.sendToPlayer) return;

    const zone = this.zones.get(zoneId);
    if (!zone) return;

    for (const playerId of zone.players) {
      if (playerId !== excludePlayerId) {
        this.sendToPlayer(playerId, type, data);
      }
    }
  }

  /**
   * Broadcast to players within a radius of a point in a zone.
   * Uses simple distance check (no spatial hashing for now).
   */
  public broadcastToNearby(
    zoneId: string,
    centerX: number,
    centerY: number,
    radius: number,
    type: string,
    data: Record<string, unknown>,
    playerPositions: Map<string, { x: number; y: number }>
  ): void {
    if (!this.sendToPlayer) return;

    const zone = this.zones.get(zoneId);
    if (!zone) return;

    const radiusSq = radius * radius;

    for (const playerId of zone.players) {
      const pos = playerPositions.get(playerId);
      if (!pos) continue;

      const dx = pos.x - centerX;
      const dy = pos.y - centerY;
      if (dx * dx + dy * dy <= radiusSq) {
        this.sendToPlayer(playerId, type, data);
      }
    }
  }

  /**
   * Send a message to all players across all zones.
   */
  public broadcastGlobal(type: string, data: Record<string, unknown>): void {
    if (!this.sendToPlayer) return;

    for (const playerId of this.playerZones.keys()) {
      this.sendToPlayer(playerId, type, data);
    }
  }

  // ─── Weather & Time ───────────────────────────────────────

  /**
   * Update weather for a zone.
   */
  public setWeather(zoneId: string, weather: WeatherType, intensity: number): void {
    const zone = this.zones.get(zoneId);
    if (!zone) return;

    zone.weather = weather;
    zone.weatherIntensity = Math.min(1, Math.max(0, intensity));

    this.broadcastToZone(zoneId, 'weather.update', {
      zone_id: zoneId,
      weather,
      intensity: zone.weatherIntensity,
    });
  }

  /**
   * Update game time for a zone.
   */
  public setGameTime(zoneId: string, time: number): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.gameTime = time % 24;
    }
  }

  /**
   * Get the day/night state based on game time.
   */
  public getDayNight(gameTime: number): 'dawn' | 'day' | 'dusk' | 'night' {
    if (gameTime >= 5 && gameTime < 7) return 'dawn';
    if (gameTime >= 7 && gameTime < 17) return 'day';
    if (gameTime >= 17 && gameTime < 19) return 'dusk';
    return 'night';
  }

  // ─── Utility ──────────────────────────────────────────────

  /**
   * Check if a position is within zone bounds.
   */
  public isInBounds(zoneId: string, x: number, y: number): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;
    return x >= 0 && x < zone.definition.width && y >= 0 && y < zone.definition.height;
  }

  /**
   * Get the nearest spawn point for a zone.
   */
  public getNearestSpawnPoint(zoneId: string, x: number, y: number): Vec2 | null {
    const zone = this.zones.get(zoneId);
    if (!zone || zone.definition.spawn_points.length === 0) return null;

    let nearest = zone.definition.spawn_points[0];
    let minDist = Infinity;

    for (const sp of zone.definition.spawn_points) {
      const dx = sp.x - x;
      const dy = sp.y - y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        nearest = sp;
      }
    }

    return nearest;
  }

  /**
   * Get the default spawn point for a zone (first spawn point).
   */
  public getDefaultSpawnPoint(zoneId: string): Vec2 | null {
    const zone = this.zones.get(zoneId);
    if (!zone || zone.definition.spawn_points.length === 0) return null;
    return zone.definition.spawn_points[0];
  }
}
