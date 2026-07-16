// ============================================================
// Nexus Realms — Sprite Generator
// Procedurally generates all game sprites using Canvas 2D API
// ============================================================

import { ClassType, Direction } from '../../shared/types';
import {
  CLASS_COLORS, MONSTER_COLORS, NPC_COLORS, SKIN_TONES,
  hexToRgb, OBJECT_COLORS,
} from './ColorPalette';

// ─── Types ───────────────────────────────────────────────────
export interface SpriteSheet {
  canvas: HTMLCanvasElement;
  frameWidth: number;
  frameHeight: number;
  framesPerRow: number;
  totalFrames: number;
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
  // Alpha blend if existing pixel has alpha
  if (a < 255 && pc.data[i + 3] > 0) {
    const srcA = a / 255;
    const dstA = pc.data[i + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    pc.data[i]     = (r * srcA + pc.data[i]     * dstA * (1 - srcA)) / outA;
    pc.data[i + 1] = (g * srcA + pc.data[i + 1] * dstA * (1 - srcA)) / outA;
    pc.data[i + 2] = (b * srcA + pc.data[i + 2] * dstA * (1 - srcA)) / outA;
    pc.data[i + 3] = outA * 255;
  } else {
    pc.data[i] = r;
    pc.data[i + 1] = g;
    pc.data[i + 2] = b;
    pc.data[i + 3] = a;
  }
}

function hexPixel(pc: PixelCtx, x: number, y: number, hex: string, a = 255): void {
  const c = hexToRgb(hex);
  setPixel(pc, x, y, c.r, c.g, c.b, a);
}

function fillRect(pc: PixelCtx, x: number, y: number, w: number, h: number, r: number, g: number, b: number, a = 255): void {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(pc, x + dx, y + dy, r, g, b, a);
    }
  }
}

function hexFillRect(pc: PixelCtx, x: number, y: number, w: number, h: number, hex: string, a = 255): void {
  const c = hexToRgb(hex);
  fillRect(pc, x, y, w, h, c.r, c.g, c.b, a);
}

function drawLine(pc: PixelCtx, x0: number, y0: number, x1: number, y1: number, hex: string, a = 255): void {
  const c = hexToRgb(hex);
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0, y = y0;
  while (true) {
    setPixel(pc, x, y, c.r, c.g, c.b, a);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx)  { err += dx; y += sy; }
  }
}

// ─── Sprite Generator Class ──────────────────────────────────
export class SpriteGenerator {
  private cache: Map<string, SpriteSheet> = new Map();

  /**
   * Generate all sprites. Returns a map of key → SpriteSheet.
   * Call once at boot, cache results.
   */
  generateAll(): Map<string, SpriteSheet> {
    if (this.cache.size > 0) return this.cache;

    this.generatePlayerSprites();
    this.generateNPCSprites();
    this.generateMonsterSprites();

    return this.cache;
  }

  getSheet(key: string): SpriteSheet | undefined {
    return this.cache.get(key);
  }

  // ─── Player Sprites ────────────────────────────────────────

  private generatePlayerSprites(): void {
    const classes = Object.values(ClassType);
    const directions = [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP];
    const framesPerDir = 4; // 1 idle + 3 walk
    const fw = 32, fh = 32;
    const totalFrames = directions.length * framesPerDir;

    for (const cls of classes) {
      const canvas = createCanvas(fw * totalFrames, fh);
      const pc = getPixelCtx(canvas);

      for (let d = 0; d < directions.length; d++) {
        for (let f = 0; f < framesPerDir; f++) {
          const ox = (d * framesPerDir + f) * fw;
          this.drawPlayerFrame(pc, ox, 0, cls, directions[d], f);
        }
      }

      commitPixels(pc, canvas);
      this.cache.set(`player_${cls}`, {
        canvas, frameWidth: fw, frameHeight: fh,
        framesPerRow: totalFrames, totalFrames,
      });
    }
  }

  private drawPlayerFrame(pc: PixelCtx, ox: number, oy: number, cls: ClassType, dir: Direction, frame: number): void {
    const colors = CLASS_COLORS[cls];
    const skin = hexToRgb(SKIN_TONES.light);
    const walkOffset = frame === 0 ? 0 : (frame % 2 === 1 ? -1 : 1);
    const isWalk = frame > 0;

    // Shadow
    hexFillRect(pc, ox + 10, oy + 29, 12, 2, '#000000', 80);

    // Determine facing offsets for details
    const facingLeft = dir === Direction.LEFT;
    const facingRight = dir === Direction.RIGHT;
    const facingUp = dir === Direction.UP;
    const facingDown = dir === Direction.DOWN;

    // --- BODY (armor/robes) ---
    const bodyTop = 12;
    const bodyH = 10;
    const bodyL = 11;
    const bodyW = 10;

    // Main body
    const prim = hexToRgb(colors.primary);
    fillRect(pc, ox + bodyL, oy + bodyTop, bodyW, bodyH, prim.r, prim.g, prim.b);

    // Body shading (secondary on one side)
    const sec = hexToRgb(colors.secondary);
    if (!facingUp) {
      fillRect(pc, ox + bodyL, oy + bodyTop, 2, bodyH, sec.r, sec.g, sec.b);
    }

    // Class-specific details
    this.drawClassDetails(pc, ox, oy, cls, dir, frame);

    // --- HEAD ---
    const headX = facingLeft ? 12 : facingRight ? 13 : 13;
    const headY = 5;
    // Head base
    fillRect(pc, ox + headX, oy + headY, 7, 7, skin.r, skin.g, skin.b);

    // Hair/helmet (top 2-3 pixels)
    const accent = hexToRgb(colors.accent);
    if (cls === ClassType.WARRIOR || cls === ClassType.PALADIN) {
      // Helmet
      fillRect(pc, ox + headX - 1, oy + headY - 1, 9, 4, prim.r, prim.g, prim.b);
      fillRect(pc, ox + headX + 1, oy + headY + 3, 5, 1, sec.r, sec.g, sec.b); // visor
    } else {
      // Hair
      fillRect(pc, ox + headX, oy + headY, 7, 3, sec.r, sec.g, sec.b);
    }

    // Eyes (2 pixels)
    if (!facingUp) {
      const eyeColor = facingLeft ? '#222222' : facingRight ? '#222222' : '#222222';
      const ex1 = facingLeft ? headX + 1 : facingRight ? headX + 4 : headX + 2;
      const ex2 = facingLeft ? headX + 1 : facingRight ? headX + 4 : headX + 5;
      hexPixel(pc, ox + ex1, oy + headY + 4, eyeColor);
      if (!facingLeft && !facingRight) {
        hexPixel(pc, ox + ex2, oy + headY + 4, eyeColor);
      } else {
        hexPixel(pc, ox + ex1, oy + headY + 4, '#ffffff');
      }
    }

    // Mouth
    if (facingDown) {
      hexPixel(pc, ox + headX + 3, oy + headY + 6, '#b8834a');
    }

    // --- LEGS ---
    const legY = bodyTop + bodyH;
    const legColor = hexToRgb(cls === ClassType.MAGE || cls === ClassType.NECROMANCER || cls === ClassType.CLERIC
      ? colors.primary : '#4a3728');
    // Left leg
    fillRect(pc, ox + 12, oy + legY + walkOffset, 3, 6, legColor.r, legColor.g, legColor.b);
    // Right leg
    fillRect(pc, ox + 17, oy + legY - walkOffset, 3, 6, legColor.r, legColor.g, legColor.b);

    // Boots
    const bootColor = hexToRgb('#3e2723');
    fillRect(pc, ox + 11, oy + legY + 5 + walkOffset, 4, 2, bootColor.r, bootColor.g, bootColor.b);
    fillRect(pc, ox + 17, oy + legY + 5 - walkOffset, 4, 2, bootColor.r, bootColor.g, bootColor.b);

    // --- ARMS ---
    const armColor = hexToRgb(colors.primary);
    if (facingDown || facingUp) {
      // Left arm
      fillRect(pc, ox + 9, oy + bodyTop + 1, 2, 7, armColor.r, armColor.g, armColor.b);
      fillRect(pc, ox + 9, oy + bodyTop + 7, 2, 2, skin.r, skin.g, skin.b); // hands
      // Right arm
      fillRect(pc, ox + 21, oy + bodyTop + 1, 2, 7, armColor.r, armColor.g, armColor.b);
      fillRect(pc, ox + 21, oy + bodyTop + 7, 2, 2, skin.r, skin.g, skin.b);
    } else if (facingLeft) {
      fillRect(pc, ox + 9, oy + bodyTop + 1, 2, 7, armColor.r, armColor.g, armColor.b);
      fillRect(pc, ox + 9, oy + bodyTop + 7, 2, 2, skin.r, skin.g, skin.b);
    } else {
      fillRect(pc, ox + 21, oy + bodyTop + 1, 2, 7, armColor.r, armColor.g, armColor.b);
      fillRect(pc, ox + 21, oy + bodyTop + 7, 2, 2, skin.r, skin.g, skin.b);
    }
  }

  private drawClassDetails(pc: PixelCtx, ox: number, oy: number, cls: ClassType, dir: Direction, frame: number): void {
    const colors = CLASS_COLORS[cls];
    const accent = hexToRgb(colors.accent);

    switch (cls) {
      case ClassType.WARRIOR: {
        // Sword on right side
        const sx = dir === Direction.LEFT ? ox + 7 : ox + 23;
        const swing = frame === 2 ? -1 : frame === 3 ? 1 : 0;
        fillRect(pc, sx + swing, oy + 8, 1, 10, accent.r, accent.g, accent.b); // blade
        fillRect(pc, sx - 1 + swing, oy + 14, 3, 1, 139, 90, 43); // crossguard
        fillRect(pc, sx + swing, oy + 15, 1, 3, 100, 60, 30); // handle
        break;
      }
      case ClassType.PALADIN: {
        // Shield on off-hand
        const shx = dir === Direction.LEFT ? ox + 22 : ox + 8;
        hexFillRect(pc, shx, oy + 12, 4, 5, colors.accent);
        hexPixel(pc, shx + 1, oy + 13, colors.glow);
        hexPixel(pc, shx + 2, oy + 14, colors.glow);
        hexPixel(pc, shx + 1, oy + 15, colors.glow);
        break;
      }
      case ClassType.RANGER: {
        // Bow on back
        if (dir !== Direction.DOWN) {
          const bx = ox + 15;
          hexPixel(pc, bx, oy + 8, '#8B4513');
          hexPixel(pc, bx, oy + 9, '#8B4513');
          hexPixel(pc, bx - 1, oy + 10, '#8B4513');
          hexPixel(pc, bx, oy + 11, '#8B4513');
          hexPixel(pc, bx, oy + 12, '#8B4513');
          // String
          hexPixel(pc, bx - 1, oy + 8, '#cccccc');
          hexPixel(pc, bx - 1, oy + 12, '#cccccc');
        }
        // Green hood
        hexFillRect(pc, ox + 12, oy + 4, 9, 2, colors.primary);
        break;
      }
      case ClassType.ROGUE: {
        // Daggers
        const dx = dir === Direction.LEFT ? ox + 8 : ox + 23;
        const dSway = frame % 2 === 0 ? 0 : 1;
        hexFillRect(pc, dx, oy + 10 + dSway, 1, 5, '#c0c0c0');
        hexFillRect(pc, dx + 3, oy + 10 - dSway, 1, 5, '#c0c0c0');
        // Hood
        hexFillRect(pc, ox + 12, oy + 4, 9, 2, '#1a1a1a');
        break;
      }
      case ClassType.MAGE: {
        // Staff
        const stx = dir === Direction.LEFT ? ox + 7 : ox + 24;
        hexFillRect(pc, stx, oy + 6, 1, 16, '#8B4513');
        // Orb on top
        hexPixel(pc, stx, oy + 5, colors.accent);
        hexPixel(pc, stx, oy + 4, colors.glow);
        // Robe extends
        hexFillRect(pc, ox + 11, oy + 20, 10, 4, colors.primary, 200);
        break;
      }
      case ClassType.NECROMANCER: {
        // Skull staff
        const stx = dir === Direction.LEFT ? ox + 7 : ox + 24;
        hexFillRect(pc, stx, oy + 6, 1, 16, '#3e2723');
        // Skull
        hexFillRect(pc, stx - 1, oy + 3, 3, 3, '#e0d8c8');
        hexPixel(pc, stx - 1, oy + 4, '#333333');
        hexPixel(pc, stx + 1, oy + 4, '#333333');
        // Dark aura
        hexFillRect(pc, ox + 10, oy + 11, 12, 12, '#311b5e', 100);
        break;
      }
      case ClassType.CLERIC: {
        // Holy symbol on chest
        hexPixel(pc, ox + 15, oy + 13, colors.accent);
        hexPixel(pc, ox + 16, oy + 13, colors.accent);
        hexPixel(pc, ox + 15, oy + 14, colors.accent);
        hexPixel(pc, ox + 16, oy + 14, colors.accent);
        hexPixel(pc, ox + 15, oy + 12, colors.accent);
        hexPixel(pc, ox + 15, oy + 15, colors.accent);
        // Glow halo
        hexFillRect(pc, ox + 13, oy + 3, 7, 1, '#ffd700', 120);
        break;
      }
      case ClassType.DRUID: {
        // Antlers
        hexPixel(pc, ox + 13, oy + 3, '#8B4513');
        hexPixel(pc, ox + 12, oy + 2, '#8B4513');
        hexPixel(pc, ox + 11, oy + 1, '#8B4513');
        hexPixel(pc, ox + 19, oy + 3, '#8B4513');
        hexPixel(pc, ox + 20, oy + 2, '#8B4513');
        hexPixel(pc, ox + 21, oy + 1, '#8B4513');
        // Vine accents on armor
        hexFillRect(pc, ox + 11, oy + 16, 1, 4, '#66bb6a');
        hexFillRect(pc, ox + 20, oy + 16, 1, 4, '#66bb6a');
        break;
      }
    }
  }

  // ─── NPC Sprites ───────────────────────────────────────────

  private generateNPCSprites(): void {
    this.generateNPCSheet('merchant', NPC_COLORS.merchant, (pc, ox, oy, frame) => {
      // Apron
      hexFillRect(pc, ox + 11, oy + 14, 10, 8, '#f5f5f5');
      hexFillRect(pc, ox + 14, oy + 16, 4, 1, '#e0e0e0'); // pocket
      // Friendly smile
      if (oy + 9 < pc.height) {
        hexPixel(pc, ox + 15, oy + 9, '#d4a574');
        hexPixel(pc, ox + 16, oy + 9, '#d4a574');
      }
    });

    this.generateNPCSheet('quest_giver', NPC_COLORS.questGiver, (pc, ox, oy, frame) => {
      // Exclamation mark above head (animated bob)
      const bob = frame % 2 === 0 ? 0 : -1;
      hexFillRect(pc, ox + 15, oy + 0 + bob, 2, 4, '#ffeb3b');
      hexFillRect(pc, ox + 15, oy + 5 + bob, 2, 2, '#ffeb3b');
      // Book in hand
      hexFillRect(pc, ox + 22, oy + 14, 3, 4, '#8d6e63');
      hexFillRect(pc, ox + 22, oy + 14, 3, 1, '#f5f5f5');
    });

    this.generateNPCSheet('guard', NPC_COLORS.guard, (pc, ox, oy, frame) => {
      // Helmet with plume
      hexFillRect(pc, ox + 12, oy + 3, 9, 4, '#607d8b');
      hexFillRect(pc, ox + 15, oy + 1, 3, 3, '#f44336'); // plume
      // Spear
      const sx = ox + 24;
      hexFillRect(pc, sx, oy + 2, 1, 22, '#8B4513');
      hexPixel(pc, sx, oy + 1, '#c0c0c0');
      hexPixel(pc, sx - 1, oy + 1, '#c0c0c0');
    });

    this.generateNPCSheet('blacksmith', NPC_COLORS.blacksmith, (pc, ox, oy, frame) => {
      // Hammer
      const swing = frame === 2 ? -2 : 0;
      hexFillRect(pc, ox + 23 + swing, oy + 8, 1, 8, '#8B4513');
      hexFillRect(pc, ox + 22 + swing, oy + 6, 3, 3, '#9e9e9e');
      // Apron (leather)
      hexFillRect(pc, ox + 11, oy + 14, 10, 7, '#5d4037');
      // Sweat drop (animated)
      if (frame === 3) {
        hexPixel(pc, ox + 18, oy + 6, '#42a5f5');
      }
    });
  }

  private generateNPCSheet(
    name: string,
    colors: { primary: string; secondary: string; accent: string; skin: string },
    drawDetails: (pc: PixelCtx, ox: number, oy: number, frame: number) => void,
  ): void {
    const fw = 32, fh = 32;
    const frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);
    const skinRgb = hexToRgb(colors.skin);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const walkOffset = f === 0 ? 0 : (f % 2 === 1 ? -1 : 1);

      // Shadow
      hexFillRect(pc, ox + 10, 29, 12, 2, '#000000', 80);

      // Head
      fillRect(pc, ox + 13, 5, 7, 7, skinRgb.r, skinRgb.g, skinRgb.b);
      // Hair
      const primRgb = hexToRgb(colors.primary);
      fillRect(pc, ox + 13, 5, 7, 3, primRgb.r, primRgb.g, primRgb.b);
      // Eyes
      hexPixel(pc, ox + 15, 9, '#222222');
      hexPixel(pc, ox + 17, 9, '#222222');

      // Body
      fillRect(pc, ox + 11, 12, 10, 10, primRgb.r, primRgb.g, primRgb.b);
      const secRgb = hexToRgb(colors.secondary);
      fillRect(pc, ox + 11, 12, 2, 10, secRgb.r, secRgb.g, secRgb.b);

      // Arms
      fillRect(pc, ox + 9, 13, 2, 7, primRgb.r, primRgb.g, primRgb.b);
      fillRect(pc, ox + 9, 19, 2, 2, skinRgb.r, skinRgb.g, skinRgb.b);
      fillRect(pc, ox + 21, 13, 2, 7, primRgb.r, primRgb.g, primRgb.b);
      fillRect(pc, ox + 21, 19, 2, 2, skinRgb.r, skinRgb.g, skinRgb.b);

      // Legs
      hexFillRect(pc, ox + 12, 22 + walkOffset, 3, 6, '#4a3728');
      hexFillRect(pc, ox + 17, 22 - walkOffset, 3, 6, '#4a3728');
      // Boots
      hexFillRect(pc, ox + 11, 27 + walkOffset, 4, 2, '#3e2723');
      hexFillRect(pc, ox + 17, 27 - walkOffset, 4, 2, '#3e2723');

      // Class-specific details
      drawDetails(pc, ox, 0, f);
    }

    commitPixels(pc, canvas);
    this.cache.set(`npc_${name}`, {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames,
    });
  }

  // ─── Monster Sprites ───────────────────────────────────────

  private generateMonsterSprites(): void {
    this.generateWolf();
    this.generateGoblin();
    this.generateSkeleton();
    this.generateDragon();
    this.generateSpider();
    this.generateBandit();
    this.generateElemental();
    this.generateSlime();
    this.generateBear();
    this.generateBoss();
  }

  private generateWolf(): void {
    const fw = 32, fh = 32, frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);
    const mc = MONSTER_COLORS.wolf;
    const body = hexToRgb(mc.primary);
    const dark = hexToRgb(mc.secondary);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const walk = f === 0 ? 0 : (f % 2 === 1 ? -1 : 1);

      // Body
      fillRect(pc, ox + 6, 14, 18, 8, body.r, body.g, body.b);
      // Head
      fillRect(pc, ox + 20, 10, 8, 8, body.r, body.g, body.b);
      // Snout
      fillRect(pc, ox + 26, 13, 4, 3, dark.r, dark.g, dark.b);
      // Eye
      hexPixel(pc, ox + 24, 12, mc.eye);
      // Ears
      fillRect(pc, ox + 21, 8, 2, 3, body.r, body.g, body.b);
      fillRect(pc, ox + 25, 8, 2, 3, body.r, body.g, body.b);
      // Legs (4)
      fillRect(pc, ox + 8, 22 + walk, 2, 6, dark.r, dark.g, dark.b);
      fillRect(pc, ox + 12, 22 - walk, 2, 6, dark.r, dark.g, dark.b);
      fillRect(pc, ox + 18, 22 + walk, 2, 6, dark.r, dark.g, dark.b);
      fillRect(pc, ox + 22, 22 - walk, 2, 6, dark.r, dark.g, dark.b);
      // Tail
      fillRect(pc, ox + 3, 13, 4, 2, body.r, body.g, body.b);
      fillRect(pc, ox + 2, 12, 2, 2, body.r, body.g, body.b);
      // Paws
      hexFillRect(pc, ox + 7, 27 + walk, 3, 2, '#3e2723');
      hexFillRect(pc, ox + 11, 27 - walk, 3, 2, '#3e2723');
      hexFillRect(pc, ox + 17, 27 + walk, 3, 2, '#3e2723');
      hexFillRect(pc, ox + 21, 27 - walk, 3, 2, '#3e2723');
    }

    commitPixels(pc, canvas);
    this.cache.set('monster_wolf', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames,
    });
  }

  private generateGoblin(): void {
    const fw = 32, fh = 32, frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);
    const mc = MONSTER_COLORS.goblin;
    const skin = hexToRgb(mc.primary);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const walk = f === 0 ? 0 : (f % 2 === 1 ? -1 : 1);

      // Shadow
      hexFillRect(pc, ox + 10, 29, 12, 2, '#000000', 60);
      // Body (small)
      hexFillRect(pc, ox + 12, 16, 8, 7, mc.primary);
      // Head (big relative to body)
      fillRect(pc, ox + 12, 9, 9, 8, skin.r, skin.g, skin.b);
      // Big ears
      hexFillRect(pc, ox + 9, 11, 3, 4, mc.primary);
      hexFillRect(pc, ox + 21, 11, 3, 4, mc.primary);
      // Eyes
      hexPixel(pc, ox + 14, 13, mc.eye);
      hexPixel(pc, ox + 18, 13, mc.eye);
      // Mouth (fangs)
      hexPixel(pc, ox + 15, 16, '#ffffff');
      hexPixel(pc, ox + 17, 16, '#ffffff');
      // Weapon (small club)
      hexFillRect(pc, ox + 22, 12, 2, 8, '#8B4513');
      hexFillRect(pc, ox + 21, 10, 4, 3, '#6d4c41');
      // Legs
      hexFillRect(pc, ox + 13, 23 + walk, 2, 5, '#2e7d32');
      hexFillRect(pc, ox + 17, 23 - walk, 2, 5, '#2e7d32');
      // Feet
      hexFillRect(pc, ox + 12, 27 + walk, 3, 2, '#3e2723');
      hexFillRect(pc, ox + 17, 27 - walk, 3, 2, '#3e2723');
    }

    commitPixels(pc, canvas);
    this.cache.set('monster_goblin', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames,
    });
  }

  private generateSkeleton(): void {
    const fw = 32, fh = 32, frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);
    const mc = MONSTER_COLORS.skeleton;
    const bone = hexToRgb(mc.primary);
    const dark = hexToRgb(mc.secondary);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const walk = f === 0 ? 0 : (f % 2 === 1 ? -1 : 1);

      // Shadow
      hexFillRect(pc, ox + 10, 29, 12, 2, '#000000', 60);
      // Ribcage
      for (let r = 0; r < 4; r++) {
        hexFillRect(pc, ox + 13, 14 + r * 2, 1, 1, mc.primary);
        hexFillRect(pc, ox + 15, 14 + r * 2, 2, 1, mc.primary);
        hexFillRect(pc, ox + 18, 14 + r * 2, 1, 1, mc.primary);
      }
      // Spine
      fillRect(pc, ox + 16, 12, 1, 10, bone.r, bone.g, bone.b);
      // Skull
      fillRect(pc, ox + 13, 6, 7, 6, bone.r, bone.g, bone.b);
      // Eye sockets
      hexFillRect(pc, ox + 14, 8, 2, 2, '#111111');
      hexFillRect(pc, ox + 17, 8, 2, 2, '#111111');
      // Jaw
      hexFillRect(pc, ox + 14, 11, 5, 1, mc.secondary);
      // Teeth
      hexPixel(pc, ox + 14, 11, '#ffffff');
      hexPixel(pc, ox + 16, 11, '#ffffff');
      hexPixel(pc, ox + 18, 11, '#ffffff');
      // Arms (bones)
      fillRect(pc, ox + 11, 14, 1, 8, bone.r, bone.g, bone.b);
      fillRect(pc, ox + 20, 14, 1, 8, bone.r, bone.g, bone.b);
      // Sword
      hexFillRect(pc, ox + 22, 8, 1, 12, '#c0c0c0');
      hexFillRect(pc, ox + 21, 14, 3, 1, '#8B4513');
      // Legs (bones)
      fillRect(pc, ox + 14, 22 + walk, 1, 6, bone.r, bone.g, bone.b);
      fillRect(pc, ox + 17, 22 - walk, 1, 6, bone.r, bone.g, bone.b);
      // Feet
      hexFillRect(pc, ox + 13, 27 + walk, 2, 2, mc.secondary);
      hexFillRect(pc, ox + 17, 27 - walk, 2, 2, mc.secondary);
    }

    commitPixels(pc, canvas);
    this.cache.set('monster_skeleton', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames,
    });
  }

  private generateDragon(): void {
    const fw = 64, fh = 64, frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);
    const mc = MONSTER_COLORS.dragon;
    const body = hexToRgb(mc.primary);
    const light = hexToRgb(mc.secondary);
    const accent = hexToRgb(mc.accent);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const wingFlap = f % 2 === 0 ? 0 : -4;

      // Shadow
      hexFillRect(pc, ox + 15, 59, 34, 3, '#000000', 80);

      // Body
      fillRect(pc, ox + 18, 30, 26, 18, body.r, body.g, body.b);
      // Belly (lighter)
      fillRect(pc, ox + 22, 34, 18, 12, light.r, light.g, light.b);

      // Neck
      fillRect(pc, ox + 36, 20, 8, 14, body.r, body.g, body.b);

      // Head
      fillRect(pc, ox + 38, 12, 14, 10, body.r, body.g, body.b);
      // Snout
      fillRect(pc, ox + 48, 16, 6, 5, body.r, body.g, body.b);
      // Eye
      hexPixel(pc, ox + 42, 15, mc.eye);
      hexPixel(pc, ox + 43, 15, mc.eye);
      // Horns
      fillRect(pc, ox + 40, 8, 2, 5, accent.r, accent.g, accent.b);
      fillRect(pc, ox + 48, 8, 2, 5, accent.r, accent.g, accent.b);
      // Nostrils (smoke)
      hexPixel(pc, ox + 52, 17, '#ff4500');
      if (f === 3) {
        hexPixel(pc, ox + 54, 16, '#ff6600', 180);
        hexPixel(pc, ox + 55, 15, '#ff8800', 120);
      }

      // Wings
      const wy = 22 + wingFlap;
      // Left wing
      for (let i = 0; i < 12; i++) {
        hexFillRect(pc, ox + 4 + i, wy - i, 1, 6 + i, mc.primary, 200);
      }
      // Wing membrane
      hexFillRect(pc, ox + 6, wy + 2, 10, 4, mc.secondary, 150);

      // Right wing
      for (let i = 0; i < 12; i++) {
        hexFillRect(pc, ox + 52 - i, wy - i, 1, 6 + i, mc.primary, 200);
      }
      hexFillRect(pc, ox + 46, wy + 2, 10, 4, mc.secondary, 150);

      // Tail
      fillRect(pc, ox + 10, 40, 12, 3, body.r, body.g, body.b);
      fillRect(pc, ox + 5, 42, 8, 2, body.r, body.g, body.b);
      fillRect(pc, ox + 2, 43, 5, 2, accent.r, accent.g, accent.b); // tail spike

      // Legs
      fillRect(pc, ox + 22, 46, 4, 10, body.r, body.g, body.b);
      fillRect(pc, ox + 34, 46, 4, 10, body.r, body.g, body.b);
      // Claws
      fillRect(pc, ox + 20, 55, 3, 2, accent.r, accent.g, accent.b);
      fillRect(pc, ox + 25, 55, 3, 2, accent.r, accent.g, accent.b);
      fillRect(pc, ox + 32, 55, 3, 2, accent.r, accent.g, accent.b);
      fillRect(pc, ox + 37, 55, 3, 2, accent.r, accent.g, accent.b);

      // Dorsal spikes
      for (let s = 0; s < 5; s++) {
        fillRect(pc, ox + 20 + s * 5, 28 - s % 2, 2, 3, accent.r, accent.g, accent.b);
      }
    }

    commitPixels(pc, canvas);
    this.cache.set('monster_dragon', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames,
    });
  }

  private generateSpider(): void {
    const fw = 32, fh = 32, frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);
    const mc = MONSTER_COLORS.spider;

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const legAnim = f % 2 === 0 ? 0 : 1;

      // Body
      hexFillRect(pc, ox + 10, 14, 12, 8, mc.primary);
      // Abdomen
      hexFillRect(pc, ox + 8, 18, 8, 8, mc.secondary);
      // Head
      hexFillRect(pc, ox + 18, 12, 6, 6, mc.primary);
      // Eyes (multiple!)
      hexPixel(pc, ox + 19, 13, mc.eye);
      hexPixel(pc, ox + 21, 13, mc.eye);
      hexPixel(pc, ox + 22, 14, mc.eye);
      hexPixel(pc, ox + 20, 14, '#ff0000', 180);
      // Fangs
      hexPixel(pc, ox + 20, 17, '#ffffff');
      hexPixel(pc, ox + 22, 17, '#ffffff');

      // Legs (8 total, 4 per side)
      const legPositions = [
        { baseX: 10, baseY: 16 },
        { baseX: 12, baseY: 18 },
        { baseX: 14, baseY: 20 },
        { baseX: 16, baseY: 18 },
      ];
      for (let l = 0; l < 4; l++) {
        const lp = legPositions[l];
        const offset = (l + legAnim) % 2 === 0 ? -2 : 2;
        // Left legs
        drawLine(pc, ox + lp.baseX, lp.baseY, ox + lp.baseX - 4 + offset, lp.baseY + 4 + l, mc.primary);
        // Right legs
        drawLine(pc, ox + 22 - (lp.baseX - 10), lp.baseY, ox + 26 - (lp.baseX - 10) - offset, lp.baseY + 4 + l, mc.primary);
      }

      // Abdomen markings
      hexPixel(pc, ox + 11, 20, mc.accent);
      hexPixel(pc, ox + 13, 22, mc.accent);
      hexPixel(pc, ox + 11, 24, mc.accent);
    }

    commitPixels(pc, canvas);
    this.cache.set('monster_spider', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames,
    });
  }

  private generateBandit(): void {
    const fw = 32, fh = 32, frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);
    const mc = MONSTER_COLORS.bandit;

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const walk = f === 0 ? 0 : (f % 2 === 1 ? -1 : 1);

      // Shadow
      hexFillRect(pc, ox + 10, 29, 12, 2, '#000000', 70);
      // Body
      hexFillRect(pc, ox + 11, 12, 10, 10, mc.primary);
      // Hood
      hexFillRect(pc, ox + 12, 4, 9, 8, mc.secondary);
      hexFillRect(pc, ox + 13, 6, 7, 3, '#1a1a1a'); // face shadow
      // Eyes (glowing)
      hexPixel(pc, ox + 14, 8, mc.eye);
      hexPixel(pc, ox + 17, 8, mc.eye);
      // Belt
      hexFillRect(pc, ox + 11, 17, 10, 1, mc.accent);
      // Sword
      hexFillRect(pc, ox + 23, 8, 1, 14, '#c0c0c0');
      hexFillRect(pc, ox + 22, 16, 3, 1, '#5d4037');
      // Cloak
      hexFillRect(pc, ox + 9, 13, 2, 12, mc.secondary, 180);
      hexFillRect(pc, ox + 21, 13, 2, 12, mc.secondary, 180);
      // Legs
      hexFillRect(pc, ox + 12, 22 + walk, 3, 6, '#2c1e11');
      hexFillRect(pc, ox + 17, 22 - walk, 3, 6, '#2c1e11');
      // Boots
      hexFillRect(pc, ox + 11, 27 + walk, 4, 2, '#1a1a1a');
      hexFillRect(pc, ox + 17, 27 - walk, 4, 2, '#1a1a1a');
    }

    commitPixels(pc, canvas);
    this.cache.set('monster_bandit', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames,
    });
  }

  private generateElemental(): void {
    const fw = 32, fh = 32, frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);
    const mc = MONSTER_COLORS.elemental;

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const pulse = f % 2 === 0 ? 0 : 1;
      const c1 = hexToRgb(mc.primary);
      const c2 = hexToRgb(mc.secondary);

      // Core body (translucent, layered)
      for (let y = 8 - pulse; y < 24 + pulse; y++) {
        for (let x = 8 - pulse; x < 24 + pulse; x++) {
          const dx = x - 16, dy = y - 16;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 10 + pulse) {
            const alpha = Math.floor(200 - dist * 12);
            const t = dist / 12;
            const r = Math.floor(c1.r + (c2.r - c1.r) * t);
            const g = Math.floor(c1.g + (c2.g - c1.g) * t);
            const b = Math.floor(c1.b + (c2.b - c1.b) * t);
            setPixel(pc, ox + x, y, r, g, b, Math.max(40, alpha));
          }
        }
      }

      // Eyes
      hexPixel(pc, ox + 13, 14, mc.eye);
      hexPixel(pc, ox + 18, 14, mc.eye);

      // Floating particles
      const particleY = 6 + (f * 3) % 8;
      hexPixel(pc, ox + 10 + f, particleY, mc.accent, 180);
      hexPixel(pc, ox + 20 - f, particleY + 2, mc.accent, 150);
      hexPixel(pc, ox + 16, 4 + f, mc.accent, 120);

      // Inner glow
      hexFillRect(pc, ox + 14, 14, 4, 4, mc.accent, 100);
    }

    commitPixels(pc, canvas);
    this.cache.set('monster_elemental', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames,
    });
  }

  private generateSlime(): void {
    const fw = 32, fh = 32, frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);
    const mc = MONSTER_COLORS.slime;

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const squish = f % 2 === 0 ? 0 : 1;

      // Body (blob shape)
      const baseY = 14 + squish;
      const bodyH = 14 - squish;
      const bodyW = 16 + squish * 2;
      const bodyX = ox + 8 - squish;

      for (let y = baseY; y < baseY + bodyH; y++) {
        const rowT = (y - baseY) / bodyH;
        const rowW = Math.floor(bodyW * (1 - Math.pow(rowT - 0.5, 2) * 1.5));
        const rowX = bodyX + Math.floor((bodyW - rowW) / 2);
        const c = hexToRgb(rowT < 0.5 ? mc.primary : mc.secondary);
        fillRect(pc, rowX, y, rowW, 1, c.r, c.g, c.b);
      }

      // Highlight
      hexFillRect(pc, ox + 12, baseY + 2, 3, 2, mc.accent, 180);

      // Eyes
      hexFillRect(pc, ox + 13, baseY + 4, 2, 3, '#ffffff');
      hexFillRect(pc, ox + 17, baseY + 4, 2, 3, '#ffffff');
      hexPixel(pc, ox + 14, baseY + 5, '#111111');
      hexPixel(pc, ox + 18, baseY + 5, '#111111');

      // Mouth
      hexPixel(pc, ox + 15, baseY + 8, '#4a148c');
      hexPixel(pc, ox + 16, baseY + 8, '#4a148c');
    }

    commitPixels(pc, canvas);
    this.cache.set('monster_slime', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames,
    });
  }

  private generateBear(): void {
    const fw = 64, fh = 64, frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);
    const mc = MONSTER_COLORS.bear;
    const body = hexToRgb(mc.primary);
    const dark = hexToRgb(mc.secondary);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const walk = f === 0 ? 0 : (f % 2 === 1 ? -2 : 2);

      // Shadow
      hexFillRect(pc, ox + 15, 58, 34, 3, '#000000', 80);

      // Body (large)
      fillRect(pc, ox + 14, 28, 36, 22, body.r, body.g, body.b);
      // Belly
      const accRgb = hexToRgb(mc.accent);
      fillRect(pc, ox + 20, 34, 24, 14, accRgb.r, accRgb.g, accRgb.b);

      // Head
      fillRect(pc, ox + 36, 16, 18, 14, body.r, body.g, body.b);
      // Ears
      fillRect(pc, ox + 38, 13, 4, 4, body.r, body.g, body.b);
      fillRect(pc, ox + 48, 13, 4, 4, body.r, body.g, body.b);
      fillRect(pc, ox + 39, 14, 2, 2, accRgb.r, accRgb.g, accRgb.b);
      fillRect(pc, ox + 49, 14, 2, 2, accRgb.r, accRgb.g, accRgb.b);
      // Snout
      fillRect(pc, ox + 46, 22, 8, 5, accRgb.r, accRgb.g, accRgb.b);
      hexPixel(pc, ox + 49, 23, '#111111'); // nose
      // Eyes
      hexPixel(pc, ox + 42, 20, mc.eye);
      hexPixel(pc, ox + 48, 20, mc.eye);
      // Mouth
      hexFillRect(pc, ox + 48, 25, 4, 1, '#5d4037');

      // Legs
      fillRect(pc, ox + 16, 48 + walk, 8, 10, body.r, body.g, body.b);
      fillRect(pc, ox + 28, 48 - walk, 8, 10, body.r, body.g, body.b);
      fillRect(pc, ox + 40, 48 + walk, 8, 10, body.r, body.g, body.b);
      // Claws
      hexFillRect(pc, ox + 15, 57 + walk, 3, 2, '#3e2723');
      hexFillRect(pc, ox + 21, 57 + walk, 3, 2, '#3e2723');
      hexFillRect(pc, ox + 27, 57 - walk, 3, 2, '#3e2723');
      hexFillRect(pc, ox + 33, 57 - walk, 3, 2, '#3e2723');

      // Tail
      fillRect(pc, ox + 12, 32, 4, 4, body.r, body.g, body.b);
    }

    commitPixels(pc, canvas);
    this.cache.set('monster_bear', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames,
    });
  }

  private generateBoss(): void {
    const fw = 96, fh = 96, frames = 4;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);
    const mc = MONSTER_COLORS.boss_generic;
    const body = hexToRgb(mc.primary);
    const light = hexToRgb(mc.secondary);
    const accent = hexToRgb(mc.accent);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const pulse = f % 2 === 0 ? 0 : 1;

      // Shadow
      hexFillRect(pc, ox + 25, 90, 46, 4, '#000000', 100);

      // Massive body
      fillRect(pc, ox + 28, 40, 40, 35, body.r, body.g, body.b);
      // Armor plates
      fillRect(pc, ox + 30, 42, 36, 6, light.r, light.g, light.b);
      fillRect(pc, ox + 32, 50, 32, 4, light.r, light.g, light.b);
      // Chest emblem
      hexFillRect(pc, ox + 42, 56, 12, 8, mc.accent);
      hexFillRect(pc, ox + 44, 58, 8, 4, '#000000', 150);

      // Head (large, menacing)
      fillRect(pc, ox + 36, 20, 24, 22, body.r, body.g, body.b);
      // Crown/horns
      fillRect(pc, ox + 36, 12, 4, 10, accent.r, accent.g, accent.b);
      fillRect(pc, ox + 48, 12, 4, 10, accent.r, accent.g, accent.b);
      fillRect(pc, ox + 56, 14, 3, 8, accent.r, accent.g, accent.b);
      // Glowing eyes
      hexFillRect(pc, ox + 40, 26, 4, 3, mc.eye);
      hexFillRect(pc, ox + 50, 26, 4, 3, mc.eye);
      hexFillRect(pc, ox + 41, 27, 2, 1, '#ffffff');
      hexFillRect(pc, ox + 51, 27, 2, 1, '#ffffff');
      // Jaw
      hexFillRect(pc, ox + 40, 34, 16, 4, '#4a0000');
      // Teeth
      for (let t = 0; t < 6; t++) {
        hexFillRect(pc, ox + 41 + t * 2, 34, 1, 2, '#ffffff');
      }

      // Arms (massive)
      fillRect(pc, ox + 18, 42, 12, 24, body.r, body.g, body.b);
      fillRect(pc, ox + 66, 42, 12, 24, body.r, body.g, body.b);
      // Fists
      fillRect(pc, ox + 16, 64, 14, 8, body.r, body.g, body.b);
      fillRect(pc, ox + 66, 64, 14, 8, body.r, body.g, body.b);
      // Weapon (massive axe)
      const swing = f === 2 ? -4 : f === 3 ? 4 : 0;
      hexFillRect(pc, ox + 14 + swing, 30, 2, 30, '#9e9e9e');
      hexFillRect(pc, ox + 10 + swing, 28, 10, 6, '#c0c0c0');
      hexFillRect(pc, ox + 8 + swing, 29, 3, 4, '#757575');

      // Legs
      fillRect(pc, ox + 34, 73, 10, 14, body.r, body.g, body.b);
      fillRect(pc, ox + 50, 73, 10, 14, body.r, body.g, body.b);
      // Boots
      hexFillRect(pc, ox + 32, 85, 12, 4, '#333333');
      hexFillRect(pc, ox + 50, 85, 12, 4, '#333333');

      // Aura effect
      if (pulse) {
        for (let a = 0; a < 360; a += 30) {
          const rad = a * Math.PI / 180;
          const ax = Math.floor(48 + Math.cos(rad) * 42);
          const ay = Math.floor(48 + Math.sin(rad) * 42);
          hexPixel(pc, ox + ax, ay, mc.accent, 80);
        }
      }
    }

    commitPixels(pc, canvas);
    this.cache.set('monster_boss', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames,
    });
  }
}
