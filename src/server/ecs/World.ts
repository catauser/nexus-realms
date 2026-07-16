// ============================================================
// Nexus Realms — ECS World
// Central hub for entity management, component storage, and systems.
// ============================================================

import { Entity, ComponentType } from './Entity';
import { ComponentStore } from './ComponentStore';
import { Logger } from '../utils/Logger';

const logger = new Logger({ context: 'ECS-World' });

/** A system that processes entities each tick */
export interface System {
  /** System name for logging */
  readonly name: string;
  /** Execution priority (lower = earlier). Determines order. */
  readonly priority: number;
  /** Update method called every tick */
  update(world: World, dt: number): void;
}

/**
 * ECS World — the central container for all entities, components, and systems.
 *
 * Entities are created via `world.createEntity()` and destroyed via
 * `world.destroyEntity()`. Components are stored in typed stores and
 * can be queried by component signature.
 *
 * Systems are registered and executed in priority order each tick.
 */
export class World {
  /** All living entities by ID */
  private entities: Map<string, Entity> = new Map();

  /** Component stores indexed by component type name */
  private stores: Map<ComponentType, ComponentStore> = new Map();

  /** Registered systems sorted by priority */
  private systems: System[] = [];

  /** Current tick number */
  private tick: number = 0;

  /** Whether systems need resorting after dynamic registration */
  private systemsDirty: boolean = false;

  /** Entity ID lookup by tag (for named entities like NPCs) */
  private taggedEntities: Map<string, string> = new Map();

  // ─── Entity Management ────────────────────────────────────

  /**
   * Create a new entity.
   * @param tag - Optional debug tag
   * @param id - Optional specific ID (otherwise auto-generated UUID)
   * @returns The new entity
   */
  public createEntity(tag?: string, id?: string): Entity {
    const entity = new Entity(id);
    if (tag) {
      entity.tag = tag;
      this.taggedEntities.set(tag, entity.id);
    }
    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Get an entity by ID.
   */
  public getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }

  /**
   * Get an entity by tag.
   */
  public getEntityByTag(tag: string): Entity | undefined {
    const id = this.taggedEntities.get(tag);
    return id ? this.entities.get(id) : undefined;
  }

  /**
   * Check if an entity exists and is alive.
   */
  public entityExists(entityId: string): boolean {
    const e = this.entities.get(entityId);
    return e !== undefined && e.alive;
  }

  /**
   * Destroy an entity. Marks it as dead; actual removal happens in cleanup.
   */
  public destroyEntity(entityId: string): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;

    entity.alive = false;
    if (entity.tag) {
      this.taggedEntities.delete(entity.tag);
    }

    // Remove all components
    for (const type of entity.getComponentTypes()) {
      const store = this.stores.get(type);
      if (store) store.remove(entityId);
    }

    this.entities.delete(entityId);
    return true;
  }

  /**
   * Get all living entity IDs.
   */
  public getAllEntityIds(): string[] {
    return Array.from(this.entities.keys());
  }

  /**
   * Get all living entities.
   */
  public getAllEntities(): Entity[] {
    return Array.from(this.entities.values()).filter(e => e.alive);
  }

  /**
   * Get count of living entities.
   */
  public entityCount(): number {
    return this.entities.size;
  }

  // ─── Component Management ─────────────────────────────────

  /**
   * Get or create a component store for a given type.
   */
  public getStore<T>(type: ComponentType): ComponentStore<T> {
    let store = this.stores.get(type) as ComponentStore<T> | undefined;
    if (!store) {
      store = new ComponentStore<T>(type);
      this.stores.set(type, store);
    }
    return store;
  }

  /**
   * Add a component to an entity. Creates the store if needed.
   */
  public addComponent<T>(entityId: string, type: ComponentType, data: T): void {
    const entity = this.entities.get(entityId);
    if (!entity) {
      logger.warn(`addComponent: Entity ${entityId} not found`);
      return;
    }
    entity.addComponent(type, data);
    this.getStore<T>(type).set(entityId, data);
  }

  /**
   * Get a component from an entity.
   */
  public getComponent<T>(entityId: string, type: ComponentType): T | undefined {
    return this.getStore<T>(type).get(entityId);
  }

  /**
   * Check if an entity has a component.
   */
  public hasComponent(entityId: string, type: ComponentType): boolean {
    return this.getStore(type).has(entityId);
  }

  /**
   * Remove a component from an entity.
   */
  public removeComponent(entityId: string, type: ComponentType): boolean {
    const entity = this.entities.get(entityId);
    if (entity) entity.removeComponent(type);
    return this.getStore(type).remove(entityId);
  }

  /**
   * Mark a component as dirty (changed) for network sync.
   */
  public markDirty(entityId: string, type: ComponentType): void {
    this.getStore(type).markDirty(entityId);
  }

  // ─── Queries ──────────────────────────────────────────────

  /**
   * Query entities that have ALL of the specified component types.
   * Returns entity IDs.
   */
  public query(componentTypes: ComponentType[]): string[] {
    if (componentTypes.length === 0) return [];

    // Start with the smallest store for efficiency
    let smallest = componentTypes[0];
    let smallestSize = Infinity;
    for (const type of componentTypes) {
      const store = this.stores.get(type);
      const size = store?.size() ?? 0;
      if (size < smallestSize) {
        smallestSize = size;
        smallest = type;
      }
    }

    const candidateIds = this.stores.get(smallest)?.getAllEntityIds() ?? [];
    const result: string[] = [];

    for (const id of candidateIds) {
      const entity = this.entities.get(id);
      if (entity && entity.alive && entity.hasAllComponents(componentTypes)) {
        result.push(id);
      }
    }

    return result;
  }

  /**
   * Query entities and return the Entity objects.
   */
  public queryEntities(componentTypes: ComponentType[]): Entity[] {
    return this.query(componentTypes)
      .map(id => this.entities.get(id))
      .filter((e): e is Entity => e !== undefined && e.alive);
  }

  /**
   * Query entities within a radius of a point.
   * Requires entities to have a Position component with { x, y }.
   */
  public queryInRange(
    centerX: number,
    centerY: number,
    radius: number,
    componentTypes: ComponentType[] = ['Position']
  ): string[] {
    const radiusSq = radius * radius;
    const ids = this.query(componentTypes);
    const result: string[] = [];

    for (const id of ids) {
      const pos = this.getComponent<{ x: number; y: number }>(id, 'Position');
      if (!pos) continue;
      const dx = pos.x - centerX;
      const dy = pos.y - centerY;
      if (dx * dx + dy * dy <= radiusSq) {
        result.push(id);
      }
    }

    return result;
  }

  // ─── System Management ────────────────────────────────────

  /**
   * Register a system. Systems are sorted by priority.
   */
  public addSystem(system: System): void {
    this.systems.push(system);
    this.systemsDirty = true;
    logger.info(`Registered system: ${system.name} (priority: ${system.priority})`);
  }

  /**
   * Remove a system by name.
   */
  public removeSystem(name: string): boolean {
    const idx = this.systems.findIndex(s => s.name === name);
    if (idx >= 0) {
      this.systems.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Get a system by name.
   */
  public getSystem<T extends System>(name: string): T | undefined {
    return this.systems.find(s => s.name === name) as T | undefined;
  }

  // ─── Tick Loop ────────────────────────────────────────────

  /**
   * Execute one tick of the simulation.
   * Runs all registered systems in priority order.
   * @param dt - Delta time in seconds (typically 1/tickRate = 0.05)
   */
  public update(dt: number): void {
    this.tick++;

    // Update tick counters on all stores
    for (const store of this.stores.values()) {
      store.setTick(this.tick);
    }

    // Sort systems if needed
    if (this.systemsDirty) {
      this.systems.sort((a, b) => a.priority - b.priority);
      this.systemsDirty = false;
    }

    // Run each system
    for (const system of this.systems) {
      try {
        system.update(this, dt);
      } catch (err) {
        logger.error(`System ${system.name} threw an error`, err);
      }
    }
  }

  /**
   * Get the current tick number.
   */
  public getTick(): number {
    return this.tick;
  }

  // ─── Utility ──────────────────────────────────────────────

  /**
   * Get all dirty entities across all component stores.
   * Returns a map of entityId → Set of dirty component types.
   */
  public getDirtyEntities(): Map<string, Set<ComponentType>> {
    const result = new Map<string, Set<ComponentType>>();

    for (const [type, store] of this.stores) {
      for (const entityId of store.getDirtyEntityIds()) {
        let set = result.get(entityId);
        if (!set) {
          set = new Set();
          result.set(entityId, set);
        }
        set.add(type);
      }
    }

    return result;
  }

  /**
   * Clear all dirty flags across all stores.
   */
  public clearAllDirty(): void {
    for (const store of this.stores.values()) {
      store.clearDirty();
    }
  }

  /**
   * Destroy all entities and clear all stores.
   */
  public clear(): void {
    this.entities.clear();
    this.taggedEntities.clear();
    for (const store of this.stores.values()) {
      store.clear();
    }
    this.tick = 0;
    logger.info('World cleared');
  }
}
