// ============================================================
// Nexus Realms — Tilemap Renderer
// Renders tilemap using colored rectangles, camera culling,
// animated tiles, objects, and minimap
// ============================================================

import Phaser from 'phaser';
import { GAME_CONFIG } from '../../shared/types';


// ─── Terrain Types ───────────────────────────────────────────
enum TerrainType {
  GRASS = 0,
  DIRT = 1,
  STONE = 2,
  SAND = 3,
  WATER = 4,
  SNOW = 5,
  SWAMP = 6,
  WALL = 7,
  LAVA = 8,
}

// ─── Chunk Data ──────────────────────────────────────────────
interface ChunkData {
  x: number;
  y: number;
  terrain: TerrainType[][];
  objects: { type: string; x: number; y: number }[];
}

// ─── Tilemap Renderer ────────────────────────────────────────
export class TilemapRenderer {
  private scene: Phaser.Scene;
  private tileSize: number;
  private chunkSize: number;

  // Chunk storage
  private loadedChunks: Map<string, ChunkGraphics> = new Map();

  // Layer containers
  private groundLayer: Phaser.GameObjects.Container;
  private objectLayer: Phaser.GameObjects.Container;
  private waterLayer: Phaser.GameObjects.Container;

  // Water animation
  private waterGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private waterAnimTime: number = 0;

  // World dimensions (tiles)
  private worldWidth: number = 256;
  private worldHeight: number = 256;

  // Minimap
  private minimapGraphics: Phaser.GameObjects.Graphics;
  private minimapDirty: boolean = true;
  private minimapData: Map<string, TerrainType[][]> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.tileSize = GAME_CONFIG.TILE_SIZE;
    this.chunkSize = GAME_CONFIG.CHUNK_SIZE;

    this.groundLayer = scene.add.container(0, 0).setDepth(0);
    this.waterLayer = scene.add.container(0, 0).setDepth(1);
    this.objectLayer = scene.add.container(0, 0).setDepth(5);

    this.minimapGraphics = scene.add.graphics().setDepth(96);
  }

  setWorldSize(widthTiles: number, heightTiles: number): void {
    this.worldWidth = widthTiles;
    this.worldHeight = heightTiles;
  }

  /** Load chunks around a world position */
  loadChunksAround(worldX: number, worldY: number, viewRadius: number): void {
    const chunkX = Math.floor(worldX / (this.chunkSize * this.tileSize));
    const chunkY = Math.floor(worldY / (this.chunkSize * this.tileSize));

    for (let dy = -viewRadius; dy <= viewRadius; dy++) {
      for (let dx = -viewRadius; dx <= viewRadius; dx++) {
        const cx = chunkX + dx;
        const cy = chunkY + dy;
        if (cx < 0 || cy < 0 || cx >= Math.ceil(this.worldWidth / this.chunkSize) ||
            cy >= Math.ceil(this.worldHeight / this.chunkSize)) continue;

        const key = `${cx},${cy}`;
        if (!this.loadedChunks.has(key)) {
          const data = this.generateChunk(cx, cy);
          this.renderChunk(data);
          this.minimapData.set(key, data.terrain);
          this.minimapDirty = true;
        }
      }
    }

    // Unload distant chunks
    for (const [key, chunk] of this.loadedChunks) {
      const [cx, cy] = key.split(',').map(Number);
      const dist = Math.max(Math.abs(cx - chunkX), Math.abs(cy - chunkY));
      if (dist > viewRadius + 1) {
        chunk.ground.destroy();
        chunk.water.destroy();
        chunk.objects.destroy();
        this.loadedChunks.delete(key);
        this.waterGraphics.delete(key);
        this.minimapData.delete(key);
        this.minimapDirty = true;
      }
    }
  }

  /** Call every frame */
  update(dt: number, playerWorldX?: number, playerWorldY?: number): void {
    // Water animation
    this.waterAnimTime += dt;
    if (this.waterAnimTime > 0.1) {
      this.waterAnimTime = 0;
      this.animateWater();
    }

    // Update minimap
    if (this.minimapDirty && playerWorldX !== undefined && playerWorldY !== undefined) {
      this.renderMinimap(playerWorldX, playerWorldY);
      this.minimapDirty = false;
    }
  }

  // ─── Chunk Generation ─────────────────────────────────────

  private generateChunk(chunkX: number, chunkY: number): ChunkData {
    const terrain: TerrainType[][] = [];
    const objects: { type: string; x: number; y: number }[] = [];

    for (let ty = 0; ty < this.chunkSize; ty++) {
      const row: TerrainType[] = [];
      for (let tx = 0; tx < this.chunkSize; tx++) {
        const worldTX = chunkX * this.chunkSize + tx;
        const worldTY = chunkY * this.chunkSize + ty;

        // Procedural terrain using noise-like function
        const n1 = Math.sin(worldTX * 0.1) * Math.cos(worldTY * 0.1);
        const n2 = Math.sin(worldTX * 0.05 + 1.5) * Math.cos(worldTY * 0.05 + 2.3);
        const n3 = Math.sin(worldTX * 0.02 + 0.7) * Math.cos(worldTY * 0.02 + 1.1);

        let terrainType: TerrainType;
        if (n3 > 0.6) {
          terrainType = TerrainType.WATER;
        } else if (n3 < -0.6) {
          terrainType = TerrainType.STONE;
        } else if (n2 > 0.4) {
          terrainType = TerrainType.DIRT;
        } else if (n1 > 0.5) {
          terrainType = TerrainType.SAND;
        } else if (n1 < -0.5) {
          terrainType = TerrainType.SWAMP;
        } else {
          terrainType = TerrainType.GRASS;
        }

        row.push(terrainType);

        // Objects
        const objNoise = Math.sin(worldTX * 0.3 + 0.5) * Math.cos(worldTY * 0.3 + 0.8);
        if (terrainType === TerrainType.GRASS && objNoise > 0.7) {
          objects.push({ type: 'tree', x: worldTX, y: worldTY });
        } else if (terrainType === TerrainType.DIRT && objNoise > 0.75) {
          objects.push({ type: 'rock', x: worldTX, y: worldTY });
        } else if (terrainType === TerrainType.GRASS && objNoise > 0.65 && objNoise <= 0.7) {
          objects.push({ type: 'bush', x: worldTX, y: worldTY });
        }
      }
      terrain.push(row);
    }

    return { x: chunkX, y: chunkY, terrain, objects };
  }

  // ─── Chunk Rendering ──────────────────────────────────────

  private renderChunk(data: ChunkData): void {
    const groundGfx = this.scene.add.graphics();
    const waterGfx = this.scene.add.graphics();
    const objGfx = this.scene.add.graphics();

    const baseX = data.x * this.chunkSize * this.tileSize;
    const baseY = data.y * this.chunkSize * this.tileSize;

    for (let ty = 0; ty < data.terrain.length; ty++) {
      for (let tx = 0; tx < (data.terrain[ty]?.length ?? 0); tx++) {
        const terrain = data.terrain[ty][tx];
        const screenX = baseX + tx * this.tileSize;
        const screenY = baseY + ty * this.tileSize;

        if (terrain === TerrainType.WATER) {
          // Water tiles rendered separately for animation
          waterGfx.fillStyle(this.getWaterColor(tx, ty), 0.9);
          waterGfx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
          // Wave highlight
          waterGfx.lineStyle(1, 0x64b5f6, 0.3);
          waterGfx.lineBetween(
            screenX, screenY + (tx % 3) * 8 + 4,
            screenX + this.tileSize, screenY + (tx % 3) * 8 + 6,
          );
        } else {
          // Ground tile
          const color = this.getTerrainColor(terrain, tx, ty);
          groundGfx.fillStyle(color, 1);
          groundGfx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

          // Detail
          this.addTerrainDetail(groundGfx, terrain, screenX, screenY, tx, ty);
        }
      }
    }

    // Objects
    for (const obj of data.objects) {
      const screenX = obj.x * this.tileSize;
      const screenY = obj.y * this.tileSize;
      this.renderObject(objGfx, obj.type, screenX, screenY);
    }

    this.groundLayer.add(groundGfx);
    this.waterLayer.add(waterGfx);
    this.objectLayer.add(objGfx);

    const key = `${data.x},${data.y}`;
    this.loadedChunks.set(key, {
      ground: groundGfx,
      water: waterGfx,
      objects: objGfx,
    });
    this.waterGraphics.set(key, waterGfx);
  }

  private getTerrainColor(terrain: TerrainType, tx: number, ty: number): number {
    const variation = ((tx * 7 + ty * 13) % 3);
    switch (terrain) {
      case TerrainType.GRASS: {
        const colors = [0x4caf50, 0x43a047, 0x388e3c];
        return colors[variation];
      }
      case TerrainType.DIRT: {
        const colors = [0x8d6e63, 0x795548, 0x6d4c41];
        return colors[variation];
      }
      case TerrainType.STONE: {
        const colors = [0x78909c, 0x607d8b, 0x546e7a];
        return colors[variation];
      }
      case TerrainType.SAND: {
        const colors = [0xffe0b2, 0xffcc80, 0xffb74d];
        return colors[variation];
      }
      case TerrainType.SNOW: {
        const colors = [0xeceff1, 0xe0e0e0, 0xf5f5f5];
        return colors[variation];
      }
      case TerrainType.SWAMP: {
        const colors = [0x33691e, 0x2e4a1e, 0x1b5e20];
        return colors[variation];
      }
      case TerrainType.WALL: {
        const colors = [0x424242, 0x303030, 0x212121];
        return colors[variation];
      }
      case TerrainType.LAVA: {
        const colors = [0xff5722, 0xff6f00, 0xff9800];
        return colors[variation];
      }
      default:
        return 0x4caf50;
    }
  }

  private getWaterColor(tx: number, ty: number): number {
    const colors = [0x1e88e5, 0x1976d2, 0x1565c0, 0x0d47a1];
    return colors[(tx + ty) % colors.length];
  }

  private addTerrainDetail(
    gfx: Phaser.GameObjects.Graphics,
    terrain: TerrainType,
    sx: number, sy: number,
    tx: number, ty: number,
  ): void {
    const ts = this.tileSize;
    const hash = (tx * 31 + ty * 17) % 100;

    switch (terrain) {
      case TerrainType.GRASS:
        if (hash < 20) {
          // Grass tufts
          gfx.fillStyle(0x66bb6a, 0.4);
          gfx.fillRect(sx + (hash % 20) + 4, sy + (hash % 15) + 4, 2, 4);
        }
        break;
      case TerrainType.DIRT:
        if (hash < 15) {
          gfx.fillStyle(0x6d4c41, 0.3);
          gfx.fillRect(sx + (hash % 20) + 2, sy + (hash % 18) + 2, 4, 3);
        }
        break;
      case TerrainType.SAND:
        if (hash < 10) {
          gfx.fillStyle(0xffb74d, 0.3);
          gfx.fillCircle(sx + (hash % 20) + 6, sy + (hash % 18) + 6, 2);
        }
        break;
      case TerrainType.SNOW:
        if (hash < 25) {
          gfx.fillStyle(0xffffff, 0.5);
          gfx.fillRect(sx + (hash % 24) + 2, sy + (hash % 20) + 2, 3, 3);
        }
        break;
      case TerrainType.SWAMP:
        if (hash < 20) {
          gfx.fillStyle(0x1b5e20, 0.4);
          gfx.fillCircle(sx + ts / 2, sy + ts / 2, 5);
        }
        break;
    }
  }

  private renderObject(gfx: Phaser.GameObjects.Graphics, type: string, sx: number, sy: number): void {
    const ts = this.tileSize;

    switch (type) {
      case 'tree': {
        // Trunk
        gfx.fillStyle(0x5d4037);
        gfx.fillRect(sx + 12, sy + 18, 8, 14);
        // Canopy
        gfx.fillStyle(0x2e7d32);
        gfx.fillCircle(sx + 16, sy + 12, 11);
        // Highlight
        gfx.fillStyle(0x66bb6a, 0.3);
        gfx.fillCircle(sx + 13, sy + 9, 4);
        break;
      }
      case 'pine': {
        gfx.fillStyle(0x4e342e);
        gfx.fillRect(sx + 14, sy + 20, 4, 12);
        gfx.fillStyle(0x1b5e20);
        gfx.fillTriangle(sx + 16, sy + 2, sx + 4, sy + 22, sx + 28, sy + 22);
        break;
      }
      case 'rock': {
        gfx.fillStyle(0x78909c);
        gfx.fillCircle(sx + 14, sy + 16, 8);
        gfx.fillStyle(0x90a4ae, 0.4);
        gfx.fillCircle(sx + 12, sy + 13, 3);
        break;
      }
      case 'bush': {
        gfx.fillStyle(0x388e3c);
        gfx.fillCircle(sx + 12, sy + 16, 7);
        gfx.fillCircle(sx + 20, sy + 14, 5);
        break;
      }
      case 'chest': {
        gfx.fillStyle(0x8d6e63);
        gfx.fillRect(sx + 4, sy + 10, 24, 16);
        gfx.fillStyle(0x6d4c41);
        gfx.fillRect(sx + 4, sy + 10, 24, 5);
        gfx.fillStyle(0xffd700);
        gfx.fillRect(sx + 13, sy + 14, 6, 5);
        break;
      }
    }
  }

  // ─── Water Animation ──────────────────────────────────────

  private animateWater(): void {
    for (const [, gfx] of this.waterGraphics) {
      // Slight alpha oscillation for shimmer
      gfx.setAlpha(0.85 + Math.sin(Date.now() * 0.003) * 0.1);
    }
  }

  // ─── Minimap ──────────────────────────────────────────────

  private renderMinimap(playerX: number, playerY: number): void {
    this.minimapGraphics.clear();

    const mmSize = 160;
    const mmX = GAME_CONFIG.VIEWPORT_WIDTH - mmSize - 12;
    const mmY = 12;
    const worldPixelW = this.worldWidth * this.tileSize;
    const worldPixelH = this.worldHeight * this.tileSize;
    const scale = mmSize / Math.max(worldPixelW, worldPixelH);

    // Draw terrain overview (sample every N tiles)
    const step = Math.max(1, Math.floor(8 / scale));
    for (const [, terrain] of this.minimapData) {
      for (let ty = 0; ty < terrain.length; ty++) {
        for (let tx = 0; tx < (terrain[ty]?.length ?? 0); tx += step) {
          const t = terrain[ty][tx];
          const color = this.getMinimapTerrainColor(t);
          const mx = mmX + (tx * this.tileSize) * scale;
          const my = mmY + (ty * this.tileSize) * scale;
          const ms = this.tileSize * scale * step;
          this.minimapGraphics.fillStyle(color, 0.7);
          this.minimapGraphics.fillRect(mx, my, Math.max(1, ms), Math.max(1, ms));
        }
      }
    }

    // Player dot
    const px = mmX + playerX * scale;
    const py = mmY + playerY * scale;
    this.minimapGraphics.fillStyle(0xffffff, 1);
    this.minimapGraphics.fillCircle(px, py, 3);

    // Camera viewport
    const cam = this.scene.cameras.main;
    const camLeft = cam.scrollX * scale + mmX;
    const camTop = cam.scrollY * scale + mmY;
    const camW = (cam.width / cam.zoom) * scale;
    const camH = (cam.height / cam.zoom) * scale;
    this.minimapGraphics.lineStyle(1, 0xffff00, 0.5);
    this.minimapGraphics.strokeRect(camLeft, camTop, camW, camH);
  }

  private getMinimapTerrainColor(terrain: TerrainType): number {
    switch (terrain) {
      case TerrainType.GRASS: return 0x4caf50;
      case TerrainType.DIRT: return 0x795548;
      case TerrainType.STONE: return 0x607d8b;
      case TerrainType.SAND: return 0xffcc80;
      case TerrainType.WATER: return 0x1976d2;
      case TerrainType.SNOW: return 0xe0e0e0;
      case TerrainType.SWAMP: return 0x33691e;
      case TerrainType.WALL: return 0x424242;
      case TerrainType.LAVA: return 0xff5722;
      default: return 0x4caf50;
    }
  }

  destroy(): void {
    for (const [, chunk] of this.loadedChunks) {
      chunk.ground.destroy();
      chunk.water.destroy();
      chunk.objects.destroy();
    }
    this.loadedChunks.clear();
    this.waterGraphics.clear();
    this.minimapData.clear();
    this.groundLayer.destroy();
    this.waterLayer.destroy();
    this.objectLayer.destroy();
    this.minimapGraphics.destroy();
  }
}

// ─── Internal Types ──────────────────────────────────────────
interface ChunkGraphics {
  ground: Phaser.GameObjects.Graphics;
  water: Phaser.GameObjects.Graphics;
  objects: Phaser.GameObjects.Graphics;
}
