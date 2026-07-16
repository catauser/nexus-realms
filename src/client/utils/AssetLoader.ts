// ============================================================
// Nexus Realms — Asset Loader
// Progressive asset loading by zone with progress tracking
// ============================================================

import Phaser from 'phaser';

// ─── Asset Manifest Types ────────────────────────────────────
export interface AssetEntry {
  key: string;
  type: 'image' | 'spritesheet' | 'atlas' | 'audio' | 'tilemapTiledJSON' | 'json' | 'bitmapFont';
  url: string;
  frameConfig?: any;
  atlasConfig?: any;
}

export interface ZoneManifest {
  zoneId: string;
  assets: AssetEntry[];
}

// ─── Core / Shared Assets (always loaded) ────────────────────
const CORE_ASSETS: AssetEntry[] = [
  // UI elements
  { key: 'ui_frame', type: 'image', url: 'assets/ui/frame.png' },
  { key: 'ui_button', type: 'image', url: 'assets/ui/button.png' },
  { key: 'ui_health_bar_bg', type: 'image', url: 'assets/ui/health_bar_bg.png' },
  { key: 'ui_health_bar_fill', type: 'image', url: 'assets/ui/health_bar_fill.png' },
  { key: 'ui_mana_bar_fill', type: 'image', url: 'assets/ui/mana_bar_fill.png' },
  { key: 'ui_xp_bar_fill', type: 'image', url: 'assets/ui/xp_bar_fill.png' },
  { key: 'ui_inventory_slot', type: 'image', url: 'assets/ui/inventory_slot.png' },
  { key: 'ui_ability_slot', type: 'image', url: 'assets/ui/ability_slot.png' },
  { key: 'ui_cooldown_overlay', type: 'image', url: 'assets/ui/cooldown_overlay.png' },
  { key: 'ui_minimap_frame', type: 'image', url: 'assets/ui/minimap_frame.png' },

  // Common sprites
  { key: 'player_default', type: 'spritesheet', url: 'assets/sprites/player_default.png',
    frameConfig: { frameWidth: 32, frameHeight: 48 } },
  { key: 'target_indicator', type: 'image', url: 'assets/sprites/target_indicator.png' },
  { key: 'selection_ring', type: 'image', url: 'assets/sprites/selection_ring.png' },
  { key: 'quest_icon', type: 'image', url: 'assets/sprites/quest_icon.png' },
  { key: 'quest_complete_icon', type: 'image', url: 'assets/sprites/quest_complete_icon.png' },

  // Combat VFX placeholders
  { key: 'vfx_slash', type: 'spritesheet', url: 'assets/vfx/slash.png',
    frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: 'vfx_fireball', type: 'spritesheet', url: 'assets/vfx/fireball.png',
    frameConfig: { frameWidth: 32, frameHeight: 32 } },
  { key: 'vfx_heal', type: 'spritesheet', url: 'assets/vfx/heal.png',
    frameConfig: { frameWidth: 64, frameHeight: 64 } },

  // Fonts
  { key: 'font_main', type: 'bitmapFont', url: 'assets/fonts/font_main.png',
    frameConfig: { frameWidth: 16, frameHeight: 16 } },
];

// ─── Zone Asset Manifests ────────────────────────────────────
const ZONE_MANIFESTS: Record<string, ZoneManifest> = {
  'starter_village': {
    zoneId: 'starter_village',
    assets: [
      { key: 'tilemap_starter', type: 'tilemapTiledJSON', url: 'assets/tilemaps/starter_village.json' },
      { key: 'tileset_grass', type: 'image', url: 'assets/tilesets/grass.png' },
      { key: 'tileset_buildings', type: 'image', url: 'assets/tilesets/buildings.png' },
      { key: 'tileset_trees', type: 'image', url: 'assets/tilesets/trees.png' },
      { key: 'npc_elder', type: 'spritesheet', url: 'assets/sprites/npc_elder.png',
        frameConfig: { frameWidth: 32, frameHeight: 48 } },
      { key: 'npc_merchant', type: 'spritesheet', url: 'assets/sprites/npc_merchant.png',
        frameConfig: { frameWidth: 32, frameHeight: 48 } },
      { key: 'monster_slime', type: 'spritesheet', url: 'assets/sprites/monster_slime.png',
        frameConfig: { frameWidth: 32, frameHeight: 32 } },
      { key: 'monster_wolf', type: 'spritesheet', url: 'assets/sprites/monster_wolf.png',
        frameConfig: { frameWidth: 48, frameHeight: 32 } },
    ],
  },
  'dark_forest': {
    zoneId: 'dark_forest',
    assets: [
      { key: 'tilemap_forest', type: 'tilemapTiledJSON', url: 'assets/tilemaps/dark_forest.json' },
      { key: 'tileset_forest', type: 'image', url: 'assets/tilesets/forest.png' },
      { key: 'monster_spider', type: 'spritesheet', url: 'assets/sprites/monster_spider.png',
        frameConfig: { frameWidth: 48, frameHeight: 48 } },
      { key: 'monster_bear', type: 'spritesheet', url: 'assets/sprites/monster_bear.png',
        frameConfig: { frameWidth: 64, frameHeight: 64 } },
    ],
  },
  'crimson_canyon': {
    zoneId: 'crimson_canyon',
    assets: [
      { key: 'tilemap_canyon', type: 'tilemapTiledJSON', url: 'assets/tilemaps/crimson_canyon.json' },
      { key: 'tileset_canyon', type: 'image', url: 'assets/tilesets/canyon.png' },
      { key: 'monster_dragon', type: 'spritesheet', url: 'assets/sprites/monster_dragon.png',
        frameConfig: { frameWidth: 96, frameHeight: 96 } },
    ],
  },
};

// ─── Asset Loader Class ──────────────────────────────────────
export class AssetLoader {
  private scene: Phaser.Scene;
  private loadedZones: Set<string> = new Set();
  private coreLoaded = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Load core assets required for the game to function */
  loadCore(onProgress?: (progress: number) => void): void {
    if (this.coreLoaded) {
      onProgress?.(1);
      return;
    }

    const total = CORE_ASSETS.length;
    let loaded = 0;

    this.scene.load.on('filecomplete', () => {
      loaded++;
      onProgress?.(loaded / total);
    });

    this.scene.load.on('complete', () => {
      this.coreLoaded = true;
      onProgress?.(1);
    });

    for (const asset of CORE_ASSETS) {
      this.loadAsset(asset);
    }
  }

  /** Load assets for a specific zone */
  loadZone(zoneId: string, onProgress?: (progress: number) => void): void {
    if (this.loadedZones.has(zoneId)) {
      onProgress?.(1);
      return;
    }

    const manifest = ZONE_MANIFESTS[zoneId];
    if (!manifest) {
      console.warn(`No manifest for zone: ${zoneId}`);
      onProgress?.(1);
      return;
    }

    const total = manifest.assets.length;
    if (total === 0) {
      this.loadedZones.add(zoneId);
      onProgress?.(1);
      return;
    }

    let loaded = 0;

    const onComplete = () => {
      this.scene.load.off('filecomplete', onFileComplete);
      this.scene.load.off('complete', onComplete);
      this.loadedZones.add(zoneId);
      onProgress?.(1);
    };

    const onFileComplete = () => {
      loaded++;
      onProgress?.(loaded / total);
    };

    this.scene.load.on('filecomplete', onFileComplete);
    this.scene.load.on('complete', onComplete);

    for (const asset of manifest.assets) {
      this.loadAsset(asset);
    }

    this.scene.load.start();
  }

  /** Unload zone assets to free memory */
  unloadZone(zoneId: string): void {
    const manifest = ZONE_MANIFESTS[zoneId];
    if (!manifest) return;

    for (const asset of manifest.assets) {
      this.unloadAssetByKey(asset.key, asset.type);
    }

    this.loadedZones.delete(zoneId);
  }

  /** Check if a zone's assets are loaded */
  isZoneLoaded(zoneId: string): boolean {
    return this.loadedZones.has(zoneId);
  }

  /** Get the list of known zone IDs */
  getKnownZoneIds(): string[] {
    return Object.keys(ZONE_MANIFESTS);
  }

  // ─── Internal ──────────────────────────────────────────────

  private loadAsset(entry: AssetEntry): void {
    const loader = this.scene.load;

    switch (entry.type) {
      case 'image':
        loader.image(entry.key, entry.url);
        break;
      case 'spritesheet':
        if (entry.frameConfig) {
          loader.spritesheet(entry.key, entry.url, entry.frameConfig);
        }
        break;
      case 'atlas':
        if (entry.atlasConfig) {
          loader.atlas(entry.key, entry.atlasConfig.textureURL, entry.atlasConfig.atlasURL);
        }
        break;
      case 'audio':
        loader.audio(entry.key, entry.url);
        break;
      case 'tilemapTiledJSON':
        loader.tilemapTiledJSON(entry.key, entry.url);
        break;
      case 'json':
        loader.json(entry.key, entry.url);
        break;
      case 'bitmapFont':
        if (entry.frameConfig) {
          loader.bitmapFont(entry.key, entry.url, entry.url.replace('.png', '.xml'));
        }
        break;
    }
  }

  private unloadAssetByKey(key: string, type: string): void {
    const cache = this.scene.cache;
    const textures = this.scene.textures;

    switch (type) {
      case 'image':
      case 'spritesheet':
      case 'atlas':
        textures.remove(key);
        break;
      case 'audio':
        cache.audio.remove(key);
        break;
      case 'tilemapTiledJSON':
        cache.tilemap.remove(key);
        break;
      case 'json':
        cache.json.remove(key);
        break;
      case 'bitmapFont':
        cache.bitmapFont.remove(key);
        break;
    }
  }
}
