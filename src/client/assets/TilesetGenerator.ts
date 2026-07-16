// ============================================================
// Nexus Realms — Tileset Generator
// Procedurally generates all tilesets using Canvas 2D API
// ============================================================

import {
  TERRAIN_COLORS, OBJECT_COLORS, DUNGEON_COLORS,
  hexToRgb, lerpColor,
} from './ColorPalette';

// ─── Types ───────────────────────────────────────────────────
export interface TileSheet {
  canvas: HTMLCanvasElement;
  tileWidth: number;
  tileHeight: number;
  columns: number;
  totalTiles: number;
  animated?: boolean;
  frameCount?: number;
}

interface PixelCtx {
  imageData: ImageData;
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

// ─── Helpers ─────────────────────────────────────────────────
function createCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function getPixelCtx(canvas: HTMLCanvasElement): PixelCtx {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { imageData, data: imageData.data, width: canvas.width, height: canvas.height };
}

function commitPixels(pc: PixelCtx, canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(pc.imageData, 0, 0);
}

function setPixel(pc: PixelCtx, x: number, y: number, r: number, g: number, b: number, a = 255): void {
  if (x < 0 || y < 0 || x >= pc.width || y >= pc.height) return;
  const i = (y * pc.width + x) * 4;
  if (a < 255 && pc.data[i + 3] > 0) {
    const sa = a / 255;
    const da = pc.data[i + 3] / 255;
    const oa = sa + da * (1 - sa);
    pc.data[i]     = (r * sa + pc.data[i]     * da * (1 - sa)) / oa;
    pc.data[i + 1] = (g * sa + pc.data[i + 1] * da * (1 - sa)) / oa;
    pc.data[i + 2] = (b * sa + pc.data[i + 2] * da * (1 - sa)) / oa;
    pc.data[i + 3] = oa * 255;
  } else {
    pc.data[i] = r; pc.data[i + 1] = g; pc.data[i + 2] = b; pc.data[i + 3] = a;
  }
}

function hexPixel(pc: PixelCtx, x: number, y: number, hex: string, a = 255): void {
  const c = hexToRgb(hex);
  setPixel(pc, x, y, c.r, c.g, c.b, a);
}

function fillRect(pc: PixelCtx, x: number, y: number, w: number, h: number, r: number, g: number, b: number, a = 255): void {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      setPixel(pc, x + dx, y + dy, r, g, b, a);
}

function hexFillRect(pc: PixelCtx, x: number, y: number, w: number, h: number, hex: string, a = 255): void {
  const c = hexToRgb(hex);
  fillRect(pc, x, y, w, h, c.r, c.g, c.b, a);
}

// Seeded noise for consistent tile variants
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function addNoise(pc: PixelCtx, ox: number, oy: number, tw: number, th: number, amount: number, seed: number): void {
  const rng = seededRandom(seed);
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const px = ox + x, py = oy + y;
      if (px >= pc.width || py >= pc.height) continue;
      const i = (py * pc.width + px) * 4;
      if (pc.data[i + 3] === 0) continue;
      const n = (rng() - 0.5) * amount;
      pc.data[i]     = Math.max(0, Math.min(255, pc.data[i]     + n));
      pc.data[i + 1] = Math.max(0, Math.min(255, pc.data[i + 1] + n));
      pc.data[i + 2] = Math.max(0, Math.min(255, pc.data[i + 2] + n));
    }
  }
}

// ─── Tileset Generator Class ─────────────────────────────────
export class TilesetGenerator {
  private cache: Map<string, TileSheet> = new Map();

  generateAll(): Map<string, TileSheet> {
    if (this.cache.size > 0) return this.cache;

    this.generateTerrain();
    this.generateObjects();
    this.generateDungeon();
    this.generateUI();

    return this.cache;
  }

  getSheet(key: string): TileSheet | undefined {
    return this.cache.get(key);
  }

  // ─── Terrain Tiles ─────────────────────────────────────────

  private generateTerrain(): void {
    const tw = 32, th = 32;

    // Grass (3 variants) — 3 tiles in a row
    this.generateTerrainSheet('terrain_grass', tw, th, TERRAIN_COLORS.grass, (pc, ox, oy, variant) => {
      const base = hexToRgb(TERRAIN_COLORS.grass[variant]);
      fillRect(pc, ox, oy, tw, th, base.r, base.g, base.b);
      // Grass blade details
      const rng = seededRandom(variant * 1000 + 42);
      for (let i = 0; i < 15; i++) {
        const gx = Math.floor(rng() * tw);
        const gy = Math.floor(rng() * th);
        const light = lerpColor(TERRAIN_COLORS.grass[variant], '#81c784', rng() * 0.5);
        hexPixel(pc, ox + gx, oy + gy, light);
        if (gy > 0) hexPixel(pc, ox + gx, oy + gy - 1, light, 150);
      }
      addNoise(pc, ox, oy, tw, th, 12, variant * 777);
    }, 3);

    // Dirt (3 variants)
    this.generateTerrainSheet('terrain_dirt', tw, th, TERRAIN_COLORS.dirt, (pc, ox, oy, variant) => {
      const base = hexToRgb(TERRAIN_COLORS.dirt[variant]);
      fillRect(pc, ox, oy, tw, th, base.r, base.g, base.b);
      const rng = seededRandom(variant * 2000 + 99);
      for (let i = 0; i < 10; i++) {
        const dx = Math.floor(rng() * tw);
        const dy = Math.floor(rng() * th);
        const shade = rng() > 0.5 ? '#6d4c41' : '#a1887f';
        hexPixel(pc, ox + dx, oy + dy, shade);
      }
      // Small pebbles
      if (variant === 1) {
        hexFillRect(pc, ox + 8, oy + 12, 2, 2, '#9e9e9e');
        hexFillRect(pc, ox + 22, oy + 20, 2, 1, '#8d8d8d');
      }
      addNoise(pc, ox, oy, tw, th, 10, variant * 555);
    }, 3);

    // Stone floor (3 variants)
    this.generateTerrainSheet('terrain_stone', tw, th, TERRAIN_COLORS.stoneFloor, (pc, ox, oy, variant) => {
      const base = hexToRgb(TERRAIN_COLORS.stoneFloor[variant]);
      fillRect(pc, ox, oy, tw, th, base.r, base.g, base.b);
      // Tile grid lines
      hexFillRect(pc, ox, oy, tw, 1, '#546e7a', 80);
      hexFillRect(pc, ox, oy, 1, th, '#546e7a', 80);
      // Cracks
      if (variant === 2) {
        hexPixel(pc, ox + 10, oy + 8, '#455a64');
        hexPixel(pc, ox + 11, oy + 9, '#455a64');
        hexPixel(pc, ox + 12, oy + 10, '#455a64');
        hexPixel(pc, ox + 11, oy + 11, '#455a64');
      }
      addNoise(pc, ox, oy, tw, th, 8, variant * 333);
    }, 3);

    // Sand (2 variants)
    this.generateTerrainSheet('terrain_sand', tw, th, TERRAIN_COLORS.sand, (pc, ox, oy, variant) => {
      const base = hexToRgb(TERRAIN_COLORS.sand[variant]);
      fillRect(pc, ox, oy, tw, th, base.r, base.g, base.b);
      const rng = seededRandom(variant * 3000 + 11);
      for (let i = 0; i < 8; i++) {
        hexPixel(pc, ox + Math.floor(rng() * tw), oy + Math.floor(rng() * th),
          rng() > 0.5 ? '#ffe0b2' : '#d7ccc8');
      }
      addNoise(pc, ox, oy, tw, th, 15, variant * 444);
    }, 2);

    // Snow (2 variants)
    this.generateTerrainSheet('terrain_snow', tw, th, TERRAIN_COLORS.snow, (pc, ox, oy, variant) => {
      const base = hexToRgb(TERRAIN_COLORS.snow[variant]);
      fillRect(pc, ox, oy, tw, th, base.r, base.g, base.b);
      // Sparkle
      const rng = seededRandom(variant * 4000 + 77);
      for (let i = 0; i < 5; i++) {
        hexPixel(pc, ox + Math.floor(rng() * tw), oy + Math.floor(rng() * th), '#ffffff');
      }
      addNoise(pc, ox, oy, tw, th, 6, variant * 888);
    }, 2);

    // Water (4 animation frames)
    this.generateAnimatedTerrain('terrain_water', tw, th, TERRAIN_COLORS.water, 4, (pc, ox, oy, variant, frame) => {
      const base = hexToRgb(TERRAIN_COLORS.water[frame]);
      fillRect(pc, ox, oy, tw, th, base.r, base.g, base.b, 200);
      // Wave lines
      for (let x = 0; x < tw; x++) {
        const wave = Math.sin((x + frame * 8) * 0.3) * 2;
        const wy = Math.floor(10 + wave);
        hexPixel(pc, ox + x, oy + wy, '#80deea', 120);
        hexPixel(pc, ox + x, oy + wy + 8, '#4dd0e1', 100);
      }
      // Sparkle
      if (frame === 0) hexPixel(pc, ox + 8, oy + 6, '#ffffff', 180);
      if (frame === 2) hexPixel(pc, ox + 20, oy + 14, '#ffffff', 180);
    }, 4);

    // Lava (4 animation frames)
    this.generateAnimatedTerrain('terrain_lava', tw, th, TERRAIN_COLORS.lava, 4, (pc, ox, oy, _variant, frame) => {
      const base = hexToRgb(TERRAIN_COLORS.lava[frame]);
      fillRect(pc, ox, oy, tw, th, base.r, base.g, base.b);
      // Darker cracks
      const dark = lerpColor(TERRAIN_COLORS.lava[frame], '#7f0000', 0.4);
      for (let x = 0; x < tw; x += 4) {
        const crack = Math.sin((x + frame * 6) * 0.5) * 3;
        hexFillRect(pc, ox + x, oy + 14 + Math.floor(crack), 2, 2, dark);
      }
      // Bright spots
      hexFillRect(pc, ox + 10 + frame * 2, oy + 8, 3, 3, '#ffeb3b', 180);
      hexFillRect(pc, ox + 22 - frame, oy + 20, 2, 2, '#fff176', 150);
    }, 4);

    // Swamp (2 variants)
    this.generateTerrainSheet('terrain_swamp', tw, th, TERRAIN_COLORS.swamp, (pc, ox, oy, variant) => {
      const base = hexToRgb(TERRAIN_COLORS.swamp[variant]);
      fillRect(pc, ox, oy, tw, th, base.r, base.g, base.b);
      // Murky water patches
      hexFillRect(pc, ox + 4, oy + 8, 8, 6, '#1b5e20', 180);
      hexFillRect(pc, ox + 18, oy + 16, 10, 8, '#1b5e20', 160);
      // Lily pads
      hexFillRect(pc, ox + 6, oy + 10, 3, 2, '#388e3c');
      // Bubbles
      hexPixel(pc, ox + 20, oy + 18, '#4caf50', 150);
      addNoise(pc, ox, oy, tw, th, 15, variant * 666);
    }, 2);
  }

  private generateTerrainSheet(
    key: string, tw: number, th: number, _colors: readonly string[],
    draw: (pc: PixelCtx, ox: number, oy: number, variant: number) => void,
    variants: number,
  ): void {
    const canvas = createCanvas(tw * variants, th);
    const pc = getPixelCtx(canvas);
    for (let v = 0; v < variants; v++) {
      draw(pc, v * tw, 0, v);
    }
    commitPixels(pc, canvas);
    this.cache.set(key, {
      canvas, tileWidth: tw, tileHeight: th,
      columns: variants, totalTiles: variants,
    });
  }

  private generateAnimatedTerrain(
    key: string, tw: number, th: number, _colors: readonly string[],
    frames: number,
    draw: (pc: PixelCtx, ox: number, oy: number, variant: number, frame: number) => void,
    frameCount: number,
  ): void {
    const canvas = createCanvas(tw * frames, th);
    const pc = getPixelCtx(canvas);
    for (let f = 0; f < frames; f++) {
      draw(pc, f * tw, 0, 0, f);
    }
    commitPixels(pc, canvas);
    this.cache.set(key, {
      canvas, tileWidth: tw, tileHeight: th,
      columns: frames, totalTiles: frames,
      animated: true, frameCount,
    });
  }

  // ─── Object Tiles ──────────────────────────────────────────

  private generateObjects(): void {
    const tw = 32, th = 32;

    // Trees
    this.generateTree('tree_oak', OBJECT_COLORS.tree_oak, 'oak');
    this.generateTree('tree_pine', OBJECT_COLORS.tree_pine, 'pine');
    this.generateTree('tree_dead', OBJECT_COLORS.tree_dead, 'dead');

    // Rocks (3 sizes)
    this.generateRocks();

    // Bushes and flowers
    this.generateBushesFlowers();

    // Buildings
    this.generateBuildings();

    // Chests (open, closed)
    this.generateChests();

    // Torches (4-frame animated)
    this.generateTorch();

    // Furniture/misc
    this.generateMisc();

    // Fences
    this.generateFences();

    // Bridges
    this.generateBridge();

    // Doors
    this.generateDoors();
  }

  private generateTree(key: string, colors: { trunk: string; leaves: string; highlight: string }, type: string): void {
    const tw = 32, th = 64; // trees are 1x2 tiles
    const canvas = createCanvas(tw, th);
    const pc = getPixelCtx(canvas);
    const trunk = hexToRgb(colors.trunk);
    const leaves = hexToRgb(colors.leaves);
    const high = hexToRgb(colors.highlight);

    // Trunk
    fillRect(pc, 14, 32, 4, 32, trunk.r, trunk.g, trunk.b);
    fillRect(pc, 13, 36, 1, 20, trunk.r - 20, trunk.g - 20, trunk.b - 20);

    if (type === 'oak') {
      // Round canopy
      for (let y = 4; y < 34; y++) {
        for (let x = 4; x < 28; x++) {
          const dx = x - 16, dy = y - 18;
          const dist = Math.sqrt(dx * dx + dy * dy * 1.3);
          if (dist < 14) {
            const shade = dist < 8 ? high : leaves;
            const alpha = dist > 12 ? 200 : 255;
            setPixel(pc, x, y, shade.r, shade.g, shade.b, alpha);
          }
        }
      }
    } else if (type === 'pine') {
      // Triangular layers
      for (let layer = 0; layer < 4; layer++) {
        const layerY = 6 + layer * 7;
        const layerW = 10 - layer * 1;
        for (let y = layerY; y < layerY + 10; y++) {
          const rowW = Math.floor(layerW * (1 - (y - layerY) / 10));
          const lx = 16 - rowW;
          const shade = y % 3 === 0 ? high : leaves;
          fillRect(pc, lx, y, rowW * 2, 1, shade.r, shade.g, shade.b);
        }
      }
    } else {
      // Dead tree — bare branches
      drawPixelLine(pc, 16, 30, 8, 10, trunk);
      drawPixelLine(pc, 16, 30, 24, 12, trunk);
      drawPixelLine(pc, 10, 14, 6, 4, trunk);
      drawPixelLine(pc, 22, 16, 28, 6, trunk);
      // A few dead leaves
      hexPixel(pc, 7, 8, '#9e9e9e');
      hexPixel(pc, 25, 10, '#bdbdbd');
    }

    // Roots
    hexFillRect(pc, 12, 60, 3, 4, colors.trunk);
    hexFillRect(pc, 18, 62, 3, 2, colors.trunk);

    commitPixels(pc, canvas);
    this.cache.set(key, {
      canvas, tileWidth: tw, tileHeight: th,
      columns: 1, totalTiles: 1,
    });
  }

  private generateRocks(): void {
    const sizes = [
      { key: 'rock_small', w: 16, h: 12 },
      { key: 'rock_medium', w: 24, h: 18 },
      { key: 'rock_large', w: 32, h: 24 },
    ];
    const rockColor = hexToRgb(OBJECT_COLORS.rock);

    for (const size of sizes) {
      const canvas = createCanvas(size.w, size.h);
      const pc = getPixelCtx(canvas);

      // Rounded rock shape
      for (let y = 0; y < size.h; y++) {
        for (let x = 0; x < size.w; x++) {
          const dx = (x - size.w / 2) / (size.w / 2);
          const dy = (y - size.h / 2) / (size.h / 2);
          if (dx * dx + dy * dy < 1) {
            const shade = 1 - dy * 0.3 - dx * 0.1;
            const r = Math.floor(rockColor.r * shade);
            const g = Math.floor(rockColor.g * shade);
            const b = Math.floor(rockColor.b * shade);
            setPixel(pc, x, y, r, g, b);
          }
        }
      }

      // Highlight
      hexPixel(pc, Math.floor(size.w * 0.35), Math.floor(size.h * 0.3), '#b0bec5');

      commitPixels(pc, canvas);
      this.cache.set(size.key, {
        canvas, tileWidth: size.w, tileHeight: size.h,
        columns: 1, totalTiles: 1,
      });
    }
  }

  private generateBushesFlowers(): void {
    // Bush
    const bush = createCanvas(24, 18);
    const bpc = getPixelCtx(bush);
    const bushC = hexToRgb(OBJECT_COLORS.bush);
    for (let y = 4; y < 18; y++) {
      for (let x = 2; x < 22; x++) {
        const dx = x - 12, dy = y - 11;
        if (dx * dx + dy * dy * 1.5 < 80) {
          const shade = dy < 0 ? 1.1 : 0.9;
          setPixel(bpc, x, y,
            Math.min(255, Math.floor(bushC.r * shade)),
            Math.min(255, Math.floor(bushC.g * shade)),
            Math.min(255, Math.floor(bushC.b * shade)));
        }
      }
    }
    // Berries
    hexPixel(bpc, 8, 8, '#f44336');
    hexPixel(bpc, 14, 10, '#f44336');
    hexPixel(bpc, 11, 6, '#f44336');
    commitPixels(bpc, bush);
    this.cache.set('bush', {
      canvas: bush, tileWidth: 24, tileHeight: 18,
      columns: 1, totalTiles: 1,
    });

    // Flowers (3 types in one sheet)
    const flowers = createCanvas(32, 16);
    const fpc = getPixelCtx(flowers);
    const flowerColors = [OBJECT_COLORS.flower_red, OBJECT_COLORS.flower_blue, OBJECT_COLORS.flower_yellow];
    for (let f = 0; f < 3; f++) {
      const fx = 4 + f * 10;
      // Stem
      hexFillRect(fpc, fx + 2, 8, 1, 8, '#388e3c');
      // Petals
      const fc = hexToRgb(flowerColors[f]);
      setPixel(fpc, fx + 1, 6, fc.r, fc.g, fc.b);
      setPixel(fpc, fx + 3, 6, fc.r, fc.g, fc.b);
      setPixel(fpc, fx + 2, 5, fc.r, fc.g, fc.b);
      setPixel(fpc, fx + 2, 7, fc.r, fc.g, fc.b);
      hexPixel(fpc, fx + 2, 6, '#ffeb3b'); // center
    }
    commitPixels(fpc, flowers);
    this.cache.set('flowers', {
      canvas: flowers, tileWidth: 32, tileHeight: 16,
      columns: 1, totalTiles: 1,
    });
  }

  private generateBuildings(): void {
    // Stone wall tile
    const wallStone = createCanvas(32, 32);
    const wspc = getPixelCtx(wallStone);
    const stoneC = hexToRgb('#616161');
    fillRect(wspc, 0, 0, 32, 32, stoneC.r, stoneC.g, stoneC.b);
    // Brick pattern
    for (let row = 0; row < 4; row++) {
      const y = row * 8;
      hexFillRect(wspc, 0, y, 32, 1, '#424242');
      const offset = row % 2 === 0 ? 0 : 16;
      hexFillRect(wspc, offset, y, 1, 8, '#424242');
      hexFillRect(wspc, offset + 16, y, 1, 8, '#424242');
    }
    addNoise(wspc, 0, 0, 32, 32, 10, 1234);
    commitPixels(wspc, wallStone);
    this.cache.set('wall_stone', {
      canvas: wallStone, tileWidth: 32, tileHeight: 32,
      columns: 1, totalTiles: 1,
    });

    // Wood wall tile
    const wallWood = createCanvas(32, 32);
    const wwpc = getPixelCtx(wallWood);
    const woodC = hexToRgb('#795548');
    fillRect(wwpc, 0, 0, 32, 32, woodC.r, woodC.g, woodC.b);
    // Planks
    for (let p = 0; p < 4; p++) {
      hexFillRect(wwpc, p * 8, 0, 1, 32, '#5d4037');
      // Grain
      for (let y = 0; y < 32; y += 4) {
        hexPixel(wwpc, p * 8 + 3 + (y % 7), y, '#6d4c41');
      }
    }
    addNoise(wwpc, 0, 0, 32, 32, 8, 5678);
    commitPixels(wwpc, wallWood);
    this.cache.set('wall_wood', {
      canvas: wallWood, tileWidth: 32, tileHeight: 32,
      columns: 1, totalTiles: 1,
    });
  }

  private generateChests(): void {
    // 2 frames: closed, open
    const fw = 24, fh = 20;
    const canvas = createCanvas(fw * 2, fh);
    const pc = getPixelCtx(canvas);

    // Closed chest
    hexFillRect(pc, 2, 6, 20, 12, '#6d4c41');
    hexFillRect(pc, 2, 6, 20, 3, '#8d6e63'); // lid top
    hexFillRect(pc, 3, 10, 18, 1, '#5d4037'); // lid edge
    hexFillRect(pc, 10, 8, 4, 4, '#ffd700'); // lock
    hexPixel(pc, 11, 9, '#b8860b');
    // Metal bands
    hexFillRect(pc, 2, 14, 20, 1, '#9e9e9e');
    hexFillRect(pc, 2, 8, 20, 1, '#9e9e9e');

    // Open chest (offset by fw)
    const ox = fw;
    hexFillRect(pc, ox + 2, 10, 20, 8, '#6d4c41'); // body
    hexFillRect(pc, ox + 2, 4, 20, 8, '#8d6e63'); // lid (tilted back)
    hexFillRect(pc, ox + 2, 4, 20, 2, '#a1887f');
    // Interior glow
    hexFillRect(pc, ox + 4, 12, 16, 4, '#ffd700', 100);
    hexFillRect(pc, ox + 8, 11, 8, 5, '#ffec8b', 120);
    hexFillRect(pc, ox + 10, 8, 4, 4, '#ffd700'); // lock

    commitPixels(pc, canvas);
    this.cache.set('chest', {
      canvas, tileWidth: fw, tileHeight: fh,
      columns: 2, totalTiles: 2,
    });
  }

  private generateTorch(): void {
    const fw = 16, fh = 32, frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      // Bracket
      hexFillRect(pc, ox + 6, 16, 4, 12, '#5d4037');
      hexFillRect(pc, ox + 4, 16, 8, 2, '#6d4c41');
      // Flame (animated)
      const flameH = 10 + (f % 2) * 2;
      const flameX = ox + 5 + (f % 2);
      for (let y = 0; y < flameH; y++) {
        const rowW = Math.max(1, Math.floor(5 * (1 - y / flameH)));
        const rx = flameX + Math.floor((6 - rowW) / 2);
        const t = y / flameH;
        const color = t < 0.3 ? '#ff6600' : t < 0.6 ? '#ff9900' : '#ffcc00';
        hexFillRect(pc, rx, 14 - y, rowW, 1, color, 255 - Math.floor(t * 100));
      }
      // Core
      hexFillRect(pc, ox + 6, 12, 3, 3, '#ffff00');
      // Glow
      hexPixel(pc, ox + 4, 10, '#ff9900', 100);
      hexPixel(pc, ox + 11, 10, '#ff9900', 100);
    }

    commitPixels(pc, canvas);
    this.cache.set('torch', {
      canvas, tileWidth: fw, tileHeight: fh,
      columns: frames, totalTiles: frames,
      animated: true, frameCount: frames,
    });
  }

  private generateMisc(): void {
    // Sign
    const sign = createCanvas(20, 24);
    const spc = getPixelCtx(sign);
    hexFillRect(spc, 8, 12, 4, 12, '#5d4037'); // post
    hexFillRect(spc, 2, 4, 16, 10, '#a1887f'); // board
    hexFillRect(spc, 3, 5, 14, 8, '#8d6e63');
    // Text lines
    hexFillRect(spc, 5, 7, 10, 1, '#5d4037');
    hexFillRect(spc, 5, 9, 8, 1, '#5d4037');
    hexFillRect(spc, 5, 11, 6, 1, '#5d4037');
    commitPixels(spc, sign);
    this.cache.set('sign', {
      canvas: sign, tileWidth: 20, tileHeight: 24,
      columns: 1, totalTiles: 1,
    });

    // Barrel
    const barrel = createCanvas(24, 28);
    const brpc = getPixelCtx(barrel);
    const brC = hexToRgb(OBJECT_COLORS.barrel);
    // Body
    for (let y = 4; y < 24; y++) {
      const bulge = Math.sin((y - 4) / 20 * Math.PI) * 2;
      const w = Math.floor(16 + bulge);
      const x = Math.floor((24 - w) / 2);
      fillRect(brpc, x, y, w, 1, brC.r, brC.g, brC.b);
    }
    // Top
    hexFillRect(brpc, 6, 2, 12, 4, '#8d6e63');
    // Bands
    hexFillRect(brpc, 5, 8, 14, 1, '#9e9e9e');
    hexFillRect(brpc, 4, 16, 16, 1, '#9e9e9e');
    commitPixels(brpc, barrel);
    this.cache.set('barrel', {
      canvas: barrel, tileWidth: 24, tileHeight: 28,
      columns: 1, totalTiles: 1,
    });

    // Crate
    const crate = createCanvas(24, 24);
    const cpc = getPixelCtx(crate);
    const crC = hexToRgb(OBJECT_COLORS.crate);
    fillRect(cpc, 2, 2, 20, 20, crC.r, crC.g, crC.b);
    // Planks
    hexFillRect(cpc, 2, 8, 20, 1, '#6d4c41');
    hexFillRect(cpc, 2, 16, 20, 1, '#6d4c41');
    hexFillRect(cpc, 12, 2, 1, 20, '#6d4c41');
    // Nails
    hexPixel(cpc, 5, 5, '#9e9e9e');
    hexPixel(cpc, 18, 5, '#9e9e9e');
    hexPixel(cpc, 5, 18, '#9e9e9e');
    hexPixel(cpc, 18, 18, '#9e9e9e');
    commitPixels(cpc, crate);
    this.cache.set('crate', {
      canvas: crate, tileWidth: 24, tileHeight: 24,
      columns: 1, totalTiles: 1,
    });
  }

  private generateFences(): void {
    // Wood fence (horizontal segment)
    const fence = createCanvas(32, 16);
    const fpc = getPixelCtx(fence);
    // Posts
    hexFillRect(fpc, 0, 2, 3, 14, '#795548');
    hexFillRect(fpc, 14, 2, 3, 14, '#795548');
    hexFillRect(fpc, 29, 2, 3, 14, '#795548');
    // Rails
    hexFillRect(fpc, 0, 4, 32, 2, '#8d6e63');
    hexFillRect(fpc, 0, 10, 32, 2, '#8d6e63');
    // Post tops
    hexFillRect(fpc, 0, 0, 3, 3, '#6d4c41');
    hexFillRect(fpc, 14, 0, 3, 3, '#6d4c41');
    hexFillRect(fpc, 29, 0, 3, 3, '#6d4c41');
    commitPixels(fpc, fence);
    this.cache.set('fence_wood', {
      canvas: fence, tileWidth: 32, tileHeight: 16,
      columns: 1, totalTiles: 1,
    });

    // Iron fence
    const iron = createCanvas(32, 20);
    const ipc = getPixelCtx(iron);
    // Posts
    hexFillRect(ipc, 0, 0, 2, 20, '#757575');
    hexFillRect(ipc, 15, 0, 2, 20, '#757575');
    hexFillRect(ipc, 30, 0, 2, 20, '#757575');
    // Rails
    hexFillRect(ipc, 0, 4, 32, 1, '#9e9e9e');
    hexFillRect(ipc, 0, 14, 32, 1, '#9e9e9e');
    // Spikes
    for (let x = 3; x < 30; x += 4) {
      hexFillRect(ipc, x, 1, 1, 3, '#9e9e9e');
      hexPixel(ipc, x, 0, '#bdbdbd');
    }
    commitPixels(ipc, iron);
    this.cache.set('fence_iron', {
      canvas: iron, tileWidth: 32, tileHeight: 20,
      columns: 1, totalTiles: 1,
    });
  }

  private generateBridge(): void {
    const bridge = createCanvas(32, 32);
    const bpc = getPixelCtx(bridge);
    // Planks
    for (let y = 0; y < 32; y += 4) {
      hexFillRect(bpc, 0, y, 32, 3, '#8d6e63');
      hexFillRect(bpc, 0, y + 3, 32, 1, '#6d4c41');
    }
    // Side rails
    hexFillRect(bpc, 0, 0, 2, 32, '#5d4037');
    hexFillRect(bpc, 30, 0, 2, 32, '#5d4037');
    // Support beams
    hexFillRect(bpc, 15, 0, 2, 32, '#5d4037');
    commitPixels(bpc, bridge);
    this.cache.set('bridge', {
      canvas: bridge, tileWidth: 32, tileHeight: 32,
      columns: 1, totalTiles: 1,
    });
  }

  private generateDoors(): void {
    // Closed + Open in one sheet
    const fw = 32, fh = 32;
    const canvas = createCanvas(fw * 2, fh);
    const pc = getPixelCtx(canvas);

    // Closed door
    hexFillRect(pc, 6, 2, 20, 28, '#6d4c41');
    hexFillRect(pc, 8, 4, 16, 12, '#5d4037');
    hexFillRect(pc, 8, 18, 16, 10, '#5d4037');
    // Handle
    hexFillRect(pc, 20, 16, 2, 2, '#ffd700');
    // Frame
    hexFillRect(pc, 4, 0, 2, 32, '#4e342e');
    hexFillRect(pc, 26, 0, 2, 32, '#4e342e');
    hexFillRect(pc, 4, 0, 24, 2, '#4e342e');

    // Open door (offset)
    const ox = fw;
    hexFillRect(pc, ox + 4, 0, 2, 32, '#4e342e'); // frame left
    hexFillRect(pc, ox + 26, 0, 2, 32, '#4e342e'); // frame right
    hexFillRect(pc, ox + 4, 0, 24, 2, '#4e342e');
    // Dark interior
    hexFillRect(pc, ox + 6, 2, 20, 28, '#1a1a1a');
    // Door swung open (visible edge)
    hexFillRect(pc, ox + 24, 2, 3, 28, '#6d4c41');

    commitPixels(pc, canvas);
    this.cache.set('door', {
      canvas, tileWidth: fw, tileHeight: fh,
      columns: 2, totalTiles: 2,
    });
  }

  // ─── Dungeon Tiles ─────────────────────────────────────────

  private generateDungeon(): void {
    const tw = 32, th = 32;

    // Stone wall variants (2)
    this.generateTerrainSheet('dungeon_wall', tw, th, DUNGEON_COLORS.stone_wall, (pc, ox, oy, variant) => {
      const base = hexToRgb(DUNGEON_COLORS.stone_wall[variant]);
      fillRect(pc, ox, oy, tw, th, base.r, base.g, base.b);
      // Mortar lines
      for (let row = 0; row < 4; row++) {
        const y = row * 8;
        hexFillRect(pc, ox, oy + y, tw, 1, '#1a1a1a');
        const off = row % 2 === 0 ? 0 : 16;
        hexFillRect(pc, ox + off, oy + y, 1, 8, '#1a1a1a');
        hexFillRect(pc, ox + off + 16, oy + y, 1, 8, '#1a1a1a');
      }
      addNoise(pc, ox, oy, tw, th, 8, variant * 999);
    }, 2);

    // Pillar
    const pillar = createCanvas(20, 48);
    const ppc = getPixelCtx(pillar);
    const pillarC = hexToRgb(DUNGEON_COLORS.pillar);
    // Base
    fillRect(ppc, 2, 42, 16, 6, pillarC.r, pillarC.g, pillarC.b);
    // Shaft
    fillRect(ppc, 5, 6, 10, 36, pillarC.r, pillarC.g, pillarC.b);
    // Shading
    fillRect(ppc, 5, 6, 2, 36, pillarC.r - 20, pillarC.g - 20, pillarC.b - 20);
    fillRect(ppc, 13, 6, 2, 36, pillarC.r + 15, pillarC.g + 15, pillarC.b + 15);
    // Capital
    fillRect(ppc, 2, 2, 16, 6, pillarC.r + 10, pillarC.g + 10, pillarC.b + 10);
    // Moss
    hexFillRect(ppc, 6, 30, 3, 2, DUNGEON_COLORS.moss);
    hexFillRect(ppc, 12, 20, 2, 1, DUNGEON_COLORS.moss);
    commitPixels(ppc, pillar);
    this.cache.set('dungeon_pillar', {
      canvas: pillar, tileWidth: 20, tileHeight: 48,
      columns: 1, totalTiles: 1,
    });

    // Altar
    const altar = createCanvas(32, 28);
    const apc = getPixelCtx(altar);
    const altarC = hexToRgb(DUNGEON_COLORS.altar);
    // Base
    fillRect(apc, 4, 20, 24, 8, altarC.r, altarC.g, altarC.b);
    // Top surface
    fillRect(apc, 2, 16, 28, 6, altarC.r + 15, altarC.g + 15, altarC.b + 15);
    // Steps
    fillRect(apc, 6, 26, 20, 2, altarC.r - 10, altarC.g - 10, altarC.b - 10);
    // Mystical symbols
    hexFillRect(apc, 12, 4, 8, 8, '#4a148c', 120);
    hexFillRect(apc, 14, 6, 4, 4, '#7c4dff', 180);
    hexPixel(apc, 15, 7, '#b388ff');
    hexPixel(apc, 16, 8, '#b388ff');
    // Candles
    hexFillRect(apc, 7, 12, 2, 6, '#e0e0e0');
    hexFillRect(apc, 23, 12, 2, 6, '#e0e0e0');
    hexPixel(apc, 7, 11, '#ff9900');
    hexPixel(apc, 23, 11, '#ff9900');
    commitPixels(apc, altar);
    this.cache.set('dungeon_altar', {
      canvas: altar, tileWidth: 32, tileHeight: 28,
      columns: 1, totalTiles: 1,
    });

    // Trap indicator
    const trap = createCanvas(32, 32);
    const tpc = getPixelCtx(trap);
    // Pressure plate
    hexFillRect(tpc, 6, 10, 20, 12, '#616161');
    hexFillRect(tpc, 8, 12, 16, 8, '#757575');
    // Warning pattern
    for (let i = 0; i < 5; i++) {
      hexFillRect(tpc, 10 + i * 3, 14, 2, 4, DUNGEON_COLORS.trap, 200);
    }
    // Subtle glow
    hexFillRect(tpc, 12, 13, 8, 6, DUNGEON_COLORS.trap, 60);
    commitPixels(tpc, trap);
    this.cache.set('dungeon_trap', {
      canvas: trap, tileWidth: 32, tileHeight: 32,
      columns: 1, totalTiles: 1,
    });

    // Portal (4-frame animated)
    const portalFrames = 4;
    const portal = createCanvas(32 * portalFrames, 32);
    const pflpc = getPixelCtx(portal);
    for (let f = 0; f < portalFrames; f++) {
      const ox = f * 32;
      // Frame
      hexFillRect(pflpc, ox + 4, 2, 24, 28, '#311b5e');
      // Interior
      hexFillRect(pflpc, ox + 6, 4, 20, 24, '#1a0a3e');
      // Swirl effect
      const angle = f * Math.PI / 2;
      for (let a = 0; a < 8; a++) {
        const rad = angle + a * Math.PI / 4;
        const sx = Math.floor(16 + Math.cos(rad) * 8);
        const sy = Math.floor(16 + Math.sin(rad) * 8);
        const colors = ['#7c4dff', '#b388ff', '#e040fb', '#ea80fc'];
        hexPixel(pflpc, ox + sx, sy, colors[a % 4], 200);
      }
      // Center glow
      hexFillRect(pflpc, ox + 14, 14, 4, 4, '#e040fb', 180);
      hexFillRect(pflpc, ox + 15, 15, 2, 2, '#ffffff', 200);
      // Edge glow
      hexFillRect(pflpc, ox + 5, 3, 22, 1, '#7c4dff', 100 + f * 30);
      hexFillRect(pflpc, ox + 5, 27, 22, 1, '#7c4dff', 100 + f * 30);
    }
    commitPixels(pflpc, portal);
    this.cache.set('dungeon_portal', {
      canvas: portal, tileWidth: 32, tileHeight: 32,
      columns: portalFrames, totalTiles: portalFrames,
      animated: true, frameCount: portalFrames,
    });

    // Cobweb
    const cobweb = createCanvas(32, 32);
    const cwpc = getPixelCtx(cobweb);
    const cwColor = DUNGEON_COLORS.cobweb;
    // Radial threads
    for (let a = 0; a < 6; a++) {
      const angle = a * Math.PI / 3;
      for (let r = 2; r < 14; r++) {
        const x = Math.floor(2 + Math.cos(angle) * r);
        const y = Math.floor(2 + Math.sin(angle) * r);
        hexPixel(cwpc, x, y, cwColor, 120 + r * 5);
      }
    }
    // Spiral
    for (let a = 0; a < 20; a++) {
      const angle = a * 0.8;
      const r = 3 + a * 0.5;
      const x = Math.floor(2 + Math.cos(angle) * r);
      const y = Math.floor(2 + Math.sin(angle) * r);
      hexPixel(cwpc, x, y, cwColor, 80);
    }
    commitPixels(cwpc, cobweb);
    this.cache.set('dungeon_cobweb', {
      canvas: cobweb, tileWidth: 32, tileHeight: 32,
      columns: 1, totalTiles: 1,
    });
  }

  // ─── UI Tiles ──────────────────────────────────────────────

  private generateUI(): void {
    // Health bar background
    this.generateUITile('ui_health_bar_bg', 200, 16, (pc) => {
      hexFillRect(pc, 0, 0, 200, 16, '#1a1a1a');
      hexFillRect(pc, 1, 1, 198, 14, '#2c2c2c');
      hexFillRect(pc, 2, 2, 196, 12, '#1a1a1a');
    });

    // Health bar fill
    this.generateUITile('ui_health_bar_fill', 200, 16, (pc) => {
      hexFillRect(pc, 0, 0, 200, 16, '#f44336');
      hexFillRect(pc, 0, 0, 200, 6, '#ef5350');
      hexFillRect(pc, 0, 12, 200, 4, '#c62828');
    });

    // Mana bar fill
    this.generateUITile('ui_mana_bar_fill', 200, 16, (pc) => {
      hexFillRect(pc, 0, 0, 200, 16, '#2196f3');
      hexFillRect(pc, 0, 0, 200, 6, '#42a5f5');
      hexFillRect(pc, 0, 12, 200, 4, '#1565c0');
    });

    // XP bar fill
    this.generateUITile('ui_xp_bar_fill', 200, 16, (pc) => {
      hexFillRect(pc, 0, 0, 200, 16, '#4caf50');
      hexFillRect(pc, 0, 0, 200, 6, '#66bb6a');
      hexFillRect(pc, 0, 12, 200, 4, '#2e7d32');
    });

    // Inventory slot
    this.generateUITile('ui_inventory_slot', 36, 36, (pc) => {
      hexFillRect(pc, 0, 0, 36, 36, '#16213e');
      hexFillRect(pc, 1, 1, 34, 34, '#1a2744');
      hexFillRect(pc, 2, 2, 32, 32, '#0f1a30');
      // Corner accents
      hexFillRect(pc, 1, 1, 4, 1, '#0f3460');
      hexFillRect(pc, 1, 1, 1, 4, '#0f3460');
      hexFillRect(pc, 31, 1, 4, 1, '#0f3460');
      hexFillRect(pc, 34, 1, 1, 4, '#0f3460');
    });

    // Ability slot
    this.generateUITile('ui_ability_slot', 40, 40, (pc) => {
      hexFillRect(pc, 0, 0, 40, 40, '#0f3460');
      hexFillRect(pc, 1, 1, 38, 38, '#1a4a8a');
      hexFillRect(pc, 3, 3, 34, 34, '#0a1e3d');
      // Border highlight
      hexFillRect(pc, 1, 1, 38, 1, '#2979ff', 100);
      hexFillRect(pc, 1, 1, 1, 38, '#2979ff', 100);
    });

    // Cooldown overlay
    this.generateUITile('ui_cooldown_overlay', 40, 40, (pc) => {
      hexFillRect(pc, 0, 0, 40, 40, '#000000', 140);
      // Sweep effect (diagonal)
      for (let y = 0; y < 40; y++) {
        for (let x = 0; x < 40; x++) {
          if (x + y < 40) {
            setPixel(pc, x, y, 0, 0, 0, 180);
          }
        }
      }
    });
  }

  private generateUITile(key: string, w: number, h: number, draw: (pc: PixelCtx) => void): void {
    const canvas = createCanvas(w, h);
    const pc = getPixelCtx(canvas);
    draw(pc);
    commitPixels(pc, canvas);
    this.cache.set(key, {
      canvas, tileWidth: w, tileHeight: h,
      columns: 1, totalTiles: 1,
    });
  }
}

// ─── Utility: pixel line ─────────────────────────────────────
function drawPixelLine(pc: PixelCtx, x0: number, y0: number, x1: number, y1: number, color: { r: number; g: number; b: number }): void {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, x = x0, y = y0;
  while (true) {
    setPixel(pc, x, y, color.r, color.g, color.b);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx)  { err += dx; y += sy; }
  }
}
