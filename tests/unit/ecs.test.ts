// ============================================================
// Nexus Realms — ECS World Tests
// ============================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { World } from '../../src/server/ecs/World';
import { Entity } from '../../src/server/ecs/Entity';

describe('World', () => {
  let world: World;

  beforeEach(() => {
    world = new World();
  });

  describe('Entity Management', () => {
    it('should create an entity', () => {
      const entity = world.createEntity();
      expect(entity).toBeDefined();
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe('string');
    });

    it('should get an entity by ID', () => {
      const entity = world.createEntity();
      const found = world.getEntity(entity.id);
      expect(found).toBe(entity);
    });

    it('should return undefined for non-existent entity', () => {
      const found = world.getEntity('nonexistent');
      expect(found).toBeUndefined();
    });

    it('should destroy an entity', () => {
      const entity = world.createEntity();
      world.destroyEntity(entity.id);
      expect(world.getEntity(entity.id)).toBeUndefined();
    });

    it('should track entity count', () => {
      expect(world.entityCount()).toBe(0);
      world.createEntity();
      expect(world.entityCount()).toBe(1);
      world.createEntity();
      expect(world.entityCount()).toBe(2);
    });

    it('should check if entity exists', () => {
      const entity = world.createEntity();
      expect(world.entityExists(entity.id)).toBe(true);
      world.destroyEntity(entity.id);
      expect(world.entityExists(entity.id)).toBe(false);
    });

    it('should create entity with tag', () => {
      const entity = world.createEntity('npc_merchant');
      expect(entity.tag).toBe('npc_merchant');
      expect(world.getEntityByTag('npc_merchant')).toBe(entity);
    });
  });

  describe('Component Management', () => {
    it('should add a component', () => {
      const entity = world.createEntity();
      world.addComponent(entity.id, 'position', { x: 100, y: 200, zone_id: 'zone_01', direction: 'down' });

      const pos = world.getComponent(entity.id, 'position');
      expect(pos).toEqual({ x: 100, y: 200, zone_id: 'zone_01', direction: 'down' });
    });

    it('should get a component', () => {
      const entity = world.createEntity();
      world.addComponent(entity.id, 'health', { hp: 100, max_hp: 100 });

      const health = world.getComponent<{ hp: number; max_hp: number }>(entity.id, 'health');
      expect(health).toBeDefined();
      expect(health!.hp).toBe(100);
      expect(health!.max_hp).toBe(100);
    });

    it('should overwrite a component (update)', () => {
      const entity = world.createEntity();
      world.addComponent(entity.id, 'health', { hp: 100, max_hp: 100 });
      world.addComponent(entity.id, 'health', { hp: 75, max_hp: 100 });

      const health = world.getComponent<{ hp: number }>(entity.id, 'health');
      expect(health!.hp).toBe(75);
    });

    it('should check if entity has component', () => {
      const entity = world.createEntity();
      expect(world.hasComponent(entity.id, 'position')).toBe(false);
      world.addComponent(entity.id, 'position', { x: 0, y: 0 });
      expect(world.hasComponent(entity.id, 'position')).toBe(true);
    });

    it('should remove a component', () => {
      const entity = world.createEntity();
      world.addComponent(entity.id, 'health', { hp: 100 });
      world.removeComponent(entity.id, 'health');
      expect(world.hasComponent(entity.id, 'health')).toBe(false);
    });

    it('should return undefined for missing component', () => {
      const entity = world.createEntity();
      const health = world.getComponent(entity.id, 'health');
      expect(health).toBeUndefined();
    });
  });

  describe('Entity Queries', () => {
    it('should query entities by component', () => {
      const e1 = world.createEntity();
      const e2 = world.createEntity();
      const e3 = world.createEntity();

      world.addComponent(e1.id, 'position', { x: 0, y: 0 });
      world.addComponent(e2.id, 'position', { x: 10, y: 10 });
      world.addComponent(e3.id, 'health', { hp: 100 });

      const withPosition = world.query(['position']);
      expect(withPosition.length).toBe(2);
      expect(withPosition).toContain(e1.id);
      expect(withPosition).toContain(e2.id);
    });

    it('should query entities by multiple components', () => {
      const e1 = world.createEntity();
      const e2 = world.createEntity();

      world.addComponent(e1.id, 'position', { x: 0, y: 0 });
      world.addComponent(e1.id, 'health', { hp: 100 });

      world.addComponent(e2.id, 'position', { x: 10, y: 10 });

      const withBoth = world.query(['position', 'health']);
      expect(withBoth.length).toBe(1);
      expect(withBoth[0]).toBe(e1.id);
    });

    it('should return empty array when no matches', () => {
      world.createEntity();
      const result = world.query(['nonexistent_component']);
      expect(result).toEqual([]);
    });
  });

  describe('System Management', () => {
    it('should register and run a system', () => {
      let updateCalled = false;
      world.addSystem({
        name: 'TestSystem',
        priority: 1,
        update: () => { updateCalled = true; },
      });

      world.update(0.05);
      expect(updateCalled).toBe(true);
    });

    it('should update systems in priority order', () => {
      const order: string[] = [];
      world.addSystem({
        name: 'Second',
        priority: 2,
        update: () => { order.push('second'); },
      });
      world.addSystem({
        name: 'First',
        priority: 1,
        update: () => { order.push('first'); },
      });

      world.update(0.05);
      expect(order).toEqual(['first', 'second']);
    });

    it('should remove a system', () => {
      let count = 0;
      world.addSystem({
        name: 'Test',
        priority: 1,
        update: () => { count++; },
      });

      world.update(0.05);
      expect(count).toBe(1);

      world.removeSystem('Test');
      world.update(0.05);
      expect(count).toBe(1); // Not called again
    });
  });
});

describe('Entity', () => {
  it('should have a unique ID', () => {
    const e1 = new Entity();
    const e2 = new Entity();
    expect(e1.id).not.toBe(e2.id);
  });

  it('should accept a custom ID', () => {
    const entity = new Entity('custom-id');
    expect(entity.id).toBe('custom-id');
  });

  it('should manage components', () => {
    const entity = new Entity();
    entity.addComponent('test', { value: 42 });
    expect(entity.hasComponent('test')).toBe(true);
    expect(entity.getComponent('test')).toEqual({ value: 42 });
  });

  it('should remove components', () => {
    const entity = new Entity();
    entity.addComponent('test', { value: 42 });
    entity.removeComponent('test');
    expect(entity.hasComponent('test')).toBe(false);
  });

  it('should check hasAllComponents', () => {
    const entity = new Entity();
    entity.addComponent('position', { x: 0, y: 0 });
    entity.addComponent('health', { hp: 100 });

    expect(entity.hasAllComponents(['position', 'health'])).toBe(true);
    expect(entity.hasAllComponents(['position', 'health', 'mana'])).toBe(false);
  });

  it('should serialize to object', () => {
    const entity = new Entity('test-id');
    entity.addComponent('position', { x: 10, y: 20 });
    entity.addComponent('health', { hp: 100 });

    const json = entity.serialize();
    expect(json.id).toBe('test-id');
    expect(json.position).toEqual({ x: 10, y: 20 });
    expect(json.health).toEqual({ hp: 100 });
  });

  it('should serialize with component filter', () => {
    const entity = new Entity('test-id');
    entity.addComponent('position', { x: 10, y: 20 });
    entity.addComponent('health', { hp: 100 });

    const json = entity.serialize(['position']);
    expect(json.position).toEqual({ x: 10, y: 20 });
    expect(json.health).toBeUndefined();
  });

  it('should start alive', () => {
    const entity = new Entity();
    expect(entity.alive).toBe(true);
  });

  it('should be destroyable', () => {
    const entity = new Entity();
    entity.destroy();
    expect(entity.alive).toBe(false);
  });
});
