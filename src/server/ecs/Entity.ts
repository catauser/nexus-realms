// ============================================================
// Nexus Realms — ECS Entity
// Entities are unique IDs that own collections of components.
// ============================================================

import { v4 as uuidv4 } from 'uuid';

/** Component type identifier string */
export type ComponentType = string;

/**
 * Represents a game entity in the ECS architecture.
 * An entity is simply a unique identifier with a set of components.
 * Entities are created via World.createEntity() and should not be
 * constructed directly.
 */
export class Entity {
  /** Unique entity identifier (UUID) */
  public readonly id: string;

  /** Whether this entity is alive (not destroyed) */
  public alive: boolean = true;

  /** Optional human-readable tag for debugging */
  public tag: string = '';

  /** Component data stored by component type name */
  private components: Map<ComponentType, unknown> = new Map();

  /** Set of component type names for fast signature queries */
  private componentTypes: Set<ComponentType> = new Set();

  constructor(id?: string) {
    this.id = id ?? uuidv4();
  }

  // ─── Component Management ──────────────────────────────────

  /**
   * Add a component to this entity.
   * @param type - Component type name (e.g. 'Position', 'Health')
   * @param data - Component data object
   * @returns this entity for chaining
   */
  public addComponent<T>(type: ComponentType, data: T): this {
    this.components.set(type, data);
    this.componentTypes.add(type);
    return this;
  }

  /**
   * Get a component by type. Returns undefined if not present.
   * @param type - Component type name
   */
  public getComponent<T>(type: ComponentType): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  /**
   * Check if entity has a specific component.
   * @param type - Component type name
   */
  public hasComponent(type: ComponentType): boolean {
    return this.componentTypes.has(type);
  }

  /**
   * Check if entity has ALL of the specified components.
   * @param types - Array of component type names
   */
  public hasAllComponents(types: ComponentType[]): boolean {
    for (const type of types) {
      if (!this.componentTypes.has(type)) return false;
    }
    return true;
  }

  /**
   * Remove a component from this entity.
   * @param type - Component type name
   * @returns true if the component was present and removed
   */
  public removeComponent(type: ComponentType): boolean {
    const had = this.componentTypes.delete(type);
    this.components.delete(type);
    return had;
  }

  /**
   * Get all component type names on this entity.
   */
  public getComponentTypes(): ComponentType[] {
    return Array.from(this.componentTypes);
  }

  /**
   * Get the component signature as a sorted array of type names.
   * Useful for caching query results.
   */
  public getSignature(): string {
    return Array.from(this.componentTypes).sort().join(',');
  }

  // ─── Serialization ────────────────────────────────────────

  /**
   * Serialize entity to a plain object for network transmission or persistence.
   * @param componentFilter - Optional list of component types to include. If omitted, all are included.
   */
  public serialize(componentFilter?: ComponentType[]): Record<string, unknown> {
    const result: Record<string, unknown> = { id: this.id, tag: this.tag };
    const types = componentFilter ?? Array.from(this.componentTypes);

    for (const type of types) {
      const data = this.components.get(type);
      if (data !== undefined) {
        result[type] = data;
      }
    }

    return result;
  }

  /**
   * Deserialize component data from a plain object.
   * Does NOT create the entity — use World.createEntity() for that.
   * @param data - Serialized entity data
   */
  public deserialize(data: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || key === 'tag') continue;
      if (value !== null && value !== undefined) {
        this.addComponent(key, value);
      }
    }
  }

  /**
   * Mark this entity as destroyed. Actual cleanup is handled by the World.
   */
  public destroy(): void {
    this.alive = false;
  }

  public toString(): string {
    return `Entity(${this.id.substring(0, 8)}... [${Array.from(this.componentTypes).join(', ')}])`;
  }
}
