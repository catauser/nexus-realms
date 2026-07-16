// ============================================================
// Nexus Realms — ECS Component Store
// Typed component storage with dirty flagging for network sync.
// ============================================================

import type { Entity, ComponentType } from './Entity';

/** Metadata tracked per component instance */
interface ComponentMeta {
  /** Whether this component has changed since last sync */
  dirty: boolean;
  /** Tick when last marked dirty */
  dirtyTick: number;
}

/**
 * Efficient typed storage for a single component type.
 * Supports dirty flagging for incremental network synchronization.
 *
 * Components are stored in a Map keyed by entity ID for O(1) access.
 * Dirty tracking allows the network system to only send changed data.
 */
export class ComponentStore<T = unknown> {
  /** Component type name */
  public readonly type: ComponentType;

  /** Component data indexed by entity ID */
  private data: Map<string, T> = new Map();

  /** Per-component metadata (dirty flags, etc.) */
  private meta: Map<string, ComponentMeta> = new Map();

  /** Current server tick for dirty tracking */
  private currentTick: number = 0;

  constructor(type: ComponentType) {
    this.type = type;
  }

  // ─── Data Access ──────────────────────────────────────────

  /**
   * Set (or overwrite) a component for an entity.
   * Automatically marks as dirty.
   */
  public set(entityId: string, component: T): void {
    this.data.set(entityId, component);
    this.meta.set(entityId, { dirty: true, dirtyTick: this.currentTick });
  }

  /**
   * Get component data for an entity. Returns undefined if not present.
   */
  public get(entityId: string): T | undefined {
    return this.data.get(entityId);
  }

  /**
   * Check if an entity has this component.
   */
  public has(entityId: string): boolean {
    return this.data.has(entityId);
  }

  /**
   * Remove a component for an entity.
   * @returns true if the component existed and was removed
   */
  public remove(entityId: string): boolean {
    this.meta.delete(entityId);
    return this.data.delete(entityId);
  }

  /**
   * Get the number of entities with this component.
   */
  public size(): number {
    return this.data.size;
  }

  // ─── Iteration ────────────────────────────────────────────

  /**
   * Iterate over all [entityId, component] pairs.
   */
  public entries(): IterableIterator<[string, T]> {
    return this.data.entries();
  }

  /**
   * Iterate over all entity IDs that have this component.
   */
  public entityIds(): IterableIterator<string> {
    return this.data.keys();
  }

  /**
   * Iterate over all component values.
   */
  public values(): IterableIterator<T> {
    return this.data.values();
  }

  /**
   * Collect all entity IDs into an array.
   */
  public getAllEntityIds(): string[] {
    return Array.from(this.data.keys());
  }

  /**
   * Iterate and call a callback for each entry.
   */
  public forEach(callback: (component: T, entityId: string) => void): void {
    this.data.forEach((comp, id) => callback(comp, id));
  }

  // ─── Dirty Flagging ───────────────────────────────────────

  /**
   * Mark a specific entity's component as dirty (changed).
   */
  public markDirty(entityId: string): void {
    const m = this.meta.get(entityId);
    if (m) {
      m.dirty = true;
      m.dirtyTick = this.currentTick;
    } else {
      this.meta.set(entityId, { dirty: true, dirtyTick: this.currentTick });
    }
  }

  /**
   * Check if an entity's component is dirty.
   */
  public isDirty(entityId: string): boolean {
    return this.meta.get(entityId)?.dirty ?? false;
  }

  /**
   * Get all entity IDs with dirty components.
   * Useful for the network system to know what to sync.
   */
  public getDirtyEntityIds(): string[] {
    const dirty: string[] = [];
    for (const [entityId, meta] of this.meta) {
      if (meta.dirty) dirty.push(entityId);
    }
    return dirty;
  }

  /**
   * Clear all dirty flags. Called after network sync.
   */
  public clearDirty(): void {
    for (const meta of this.meta.values()) {
      meta.dirty = false;
    }
  }

  /**
   * Clear dirty flag for a specific entity.
   */
  public clearDirtyFor(entityId: string): void {
    const m = this.meta.get(entityId);
    if (m) m.dirty = false;
  }

  /**
   * Update the current tick counter. Used for dirty tracking timestamps.
   */
  public setTick(tick: number): void {
    this.currentTick = tick;
  }

  // ─── Query Helpers ────────────────────────────────────────

  /**
   * Get all entity IDs that have this component AND match a predicate.
   */
  public query(predicate: (component: T) => boolean): string[] {
    const results: string[] = [];
    for (const [entityId, component] of this.data) {
      if (predicate(component)) {
        results.push(entityId);
      }
    }
    return results;
  }

  /**
   * Bulk set components from a Map. Marks all as dirty.
   */
  public bulkSet(entries: Map<string, T>): void {
    for (const [entityId, component] of entries) {
      this.set(entityId, component);
    }
  }

  /**
   * Clear all data and metadata.
   */
  public clear(): void {
    this.data.clear();
    this.meta.clear();
  }
}
