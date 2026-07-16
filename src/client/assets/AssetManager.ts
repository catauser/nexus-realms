// ============================================================
// Nexus Realms — Asset Manager
// Orchestrates procedural generation and registers with Phaser
// ============================================================

import Phaser from 'phaser';
import { SpriteGenerator, SpriteSheet } from './SpriteGenerator';
import { TilesetGenerator, TileSheet } from './TilesetGenerator';
import { EffectGenerator, EffectSheet } from './EffectGenerator';

// ─── Asset Manager ───────────────────────────────────────────
export class AssetManager {
  private scene: Phaser.Scene;
  private spriteGen: SpriteGenerator;
  private tilesetGen: TilesetGenerator;
  private effectGen: EffectGenerator;
  private initialized = false;
  private textureKeys: Set<string> = new Set();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.spriteGen = new SpriteGenerator();
    this.tilesetGen = new TilesetGenerator();
    this.effectGen = new EffectGenerator();
  }

  /**
   * Generate ALL assets and register with Phaser.
   * Call once during boot (e.g., in preload or create of a loading scene).
   * Returns a promise that resolves when all generation is complete.
   */
  async initialize(onProgress?: (progress: number, phase: string) => void): Promise<void> {
    if (this.initialized) return;

    const t0 = performance.now();

    // Phase 1: Generate sprites (40%)
    onProgress?.(0, 'Generating sprites...');
    const sprites = this.spriteGen.generateAll();
    this.registerSheets(sprites, 'sprite');
    onProgress?.(0.4, 'Sprites complete');

    // Phase 2: Generate tilesets (40%)
    onProgress?.(0.4, 'Generating tilesets...');
    const tilesets = this.tilesetGen.generateAll();
    this.registerTileSheets(tilesets);
    onProgress?.(0.8, 'Tilesets complete');

    // Phase 3: Generate effects (20%)
    onProgress?.(0.8, 'Generating effects...');
    const effects = this.effectGen.generateAll();
    this.registerEffectSheets(effects);
    onProgress?.(1.0, 'Effects complete');

    const elapsed = performance.now() - t0;
    console.log(`[AssetManager] Generated ${this.textureKeys.size} assets in ${elapsed.toFixed(0)}ms`);

    if (elapsed > 3000) {
      console.warn(`[AssetManager] Asset generation exceeded 3s target (${elapsed.toFixed(0)}ms)`);
    }

    this.initialized = true;
  }

  /**
   * Check if assets are ready.
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Get a texture by key. Returns null if not found.
   */
  getTexture(key: string): Phaser.Textures.Texture | null {
    if (!this.scene.textures.exists(key)) return null;
    return this.scene.textures.get(key);
  }

  /**
   * Check if a texture key exists.
   */
  hasTexture(key: string): boolean {
    return this.textureKeys.has(key);
  }

  /**
   * Get all registered texture keys.
   */
  getRegisteredKeys(): string[] {
    return Array.from(this.textureKeys);
  }

  /**
   * Remove a texture from the cache.
   */
  removeTexture(key: string): void {
    if (this.scene.textures.exists(key)) {
      this.scene.textures.remove(key);
    }
    this.textureKeys.delete(key);
  }

  /**
   * Clean up all generated textures.
   */
  destroy(): void {
    for (const key of this.textureKeys) {
      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
      }
    }
    this.textureKeys.clear();
    this.initialized = false;
  }

  // ─── Registration Methods ──────────────────────────────────

  private registerSheets(sheets: Map<string, SpriteSheet>, _prefix: string): void {
    for (const [key, sheet] of sheets) {
      this.registerSpriteSheet(key, sheet);
    }
  }

  private registerTileSheets(sheets: Map<string, TileSheet>): void {
    for (const [key, sheet] of sheets) {
      this.registerTileSheet(key, sheet);
    }
  }

  private registerEffectSheets(sheets: Map<string, EffectSheet>): void {
    for (const [key, sheet] of sheets) {
      this.registerEffectSheet(key, sheet);
    }
  }

  /**
   * Register a sprite sheet with Phaser's texture manager.
   * Splits the canvas into individual frames.
   */
  private registerSpriteSheet(key: string, sheet: SpriteSheet): void {
    try {
      const { canvas, frameWidth, frameHeight, framesPerRow, totalFrames } = sheet;

      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
      }

      const texture = this.scene.textures.createCanvas(key, canvas.width, canvas.height);
      if (!texture) return;

      const ctx = texture.getContext();
      ctx.drawImage(canvas, 0, 0);

      // Add frames
      const rows = Math.ceil(totalFrames / framesPerRow);
      let frameIndex = 0;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < framesPerRow; col++) {
          if (frameIndex >= totalFrames) break;
          texture.add(
            frameIndex, 0,
            col * frameWidth, row * frameHeight,
            frameWidth, frameHeight,
          );
          frameIndex++;
        }
      }

      texture.refresh();
      this.textureKeys.add(key);
    } catch (e) {
      console.warn(`[AssetManager] Failed to register sprite sheet "${key}":`, e);
    }
  }

  /**
   * Register a tile sheet with Phaser's texture manager.
   */
  private registerTileSheet(key: string, sheet: TileSheet): void {
    try {
      const { canvas, tileWidth, tileHeight, columns, totalTiles, animated, frameCount } = sheet;

      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
      }

      const texture = this.scene.textures.createCanvas(key, canvas.width, canvas.height);
      if (!texture) return;

      const ctx = texture.getContext();
      ctx.drawImage(canvas, 0, 0);

      // Add tile frames
      const rows = Math.ceil(totalTiles / columns);
      let tileIndex = 0;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          if (tileIndex >= totalTiles) break;
          texture.add(
            tileIndex, 0,
            col * tileWidth, row * tileHeight,
            tileWidth, tileHeight,
          );
          tileIndex++;
        }
      }

      texture.refresh();
      this.textureKeys.add(key);

      // Create animation if animated
      if (animated && frameCount && frameCount > 1) {
        this.createAnimation(key, key, frameCount);
      }
    } catch (e) {
      console.warn(`[AssetManager] Failed to register tile sheet "${key}":`, e);
    }
  }

  /**
   * Register an effect sheet with Phaser's texture manager.
   */
  private registerEffectSheet(key: string, sheet: EffectSheet): void {
    try {
      const { canvas, frameWidth, frameHeight, framesPerRow, totalFrames, animated } = sheet;

      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
      }

      const texture = this.scene.textures.createCanvas(key, canvas.width, canvas.height);
      if (!texture) return;

      const ctx = texture.getContext();
      ctx.drawImage(canvas, 0, 0);

      // Add frames
      const rows = Math.ceil(totalFrames / framesPerRow);
      let frameIndex = 0;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < framesPerRow; col++) {
          if (frameIndex >= totalFrames) break;
          texture.add(
            frameIndex, 0,
            col * frameWidth, row * frameHeight,
            frameWidth, frameHeight,
          );
          frameIndex++;
        }
      }

      texture.refresh();
      this.textureKeys.add(key);

      // Create animation if animated
      if (animated && totalFrames > 1) {
        this.createAnimation(key, key, totalFrames);
      }
    } catch (e) {
      console.warn(`[AssetManager] Failed to register effect sheet "${key}":`, e);
    }
  }

  /**
   * Create a Phaser animation from a texture key.
   */
  private createAnimation(animKey: string, textureKey: string, frameCount: number): void {
    if (this.scene.anims.exists(animKey)) return;

    const frames = [];
    for (let i = 0; i < frameCount; i++) {
      frames.push({ key: textureKey, frame: i });
    }

    this.scene.anims.create({
      key: animKey,
      frames: this.scene.anims.generateFrameNumbers(textureKey, { start: 0, end: frameCount - 1 }),
      frameRate: 8,
      repeat: -1,
    });
  }

  // ─── Convenience Methods ───────────────────────────────────

  /**
   * Create a sprite from a generated texture.
   */
  createSprite(key: string, x: number, y: number): Phaser.GameObjects.Sprite | null {
    if (!this.hasTexture(key)) {
      console.warn(`[AssetManager] Texture "${key}" not found`);
      return null;
    }
    return this.scene.add.sprite(x, y, key, 0);
  }

  /**
   * Create an animated sprite.
   */
  createAnimatedSprite(key: string, x: number, y: number): Phaser.GameObjects.Sprite | null {
    if (!this.hasTexture(key)) {
      console.warn(`[AssetManager] Texture "${key}" not found`);
      return null;
    }
    const sprite = this.scene.add.sprite(x, y, key, 0);
    if (this.scene.anims.exists(key)) {
      sprite.play(key);
    }
    return sprite;
  }

  /**
   * Create a tile sprite (for repeating terrain).
   */
  createTileSprite(key: string, x: number, y: number, width: number, height: number): Phaser.GameObjects.TileSprite | null {
    if (!this.hasTexture(key)) {
      console.warn(`[AssetManager] Texture "${key}" not found`);
      return null;
    }
    return this.scene.add.tileSprite(x, y, width, height, key, 0);
  }

  /**
   * Get all texture keys matching a prefix.
   */
  getKeysByPrefix(prefix: string): string[] {
    return Array.from(this.textureKeys).filter(k => k.startsWith(prefix));
  }

  /**
   * Get generation stats.
   */
  getStats(): { total: number; sprites: number; tiles: number; effects: number } {
    const keys = Array.from(this.textureKeys);
    return {
      total: keys.length,
      sprites: keys.filter(k => k.startsWith('player_') || k.startsWith('npc_') || k.startsWith('monster_')).length,
      tiles: keys.filter(k => k.startsWith('terrain_') || k.startsWith('dungeon_') || k.startsWith('wall_') || k.startsWith('tree_') || k.startsWith('rock_') || k.startsWith('fence_') || k.startsWith('bridge') || k.startsWith('door') || k.startsWith('chest') || k.startsWith('torch') || k.startsWith('sign') || k.startsWith('barrel') || k.startsWith('crate') || k.startsWith('bush') || k.startsWith('flowers')).length,
      effects: keys.filter(k => k.startsWith('vfx_') || k.startsWith('ui_')).length,
    };
  }
}
