// ============================================================
// Nexus Realms — Effect Generator
// Procedurally generates all VFX using Canvas 2D API
// ============================================================

import { EFFECT_COLORS, hexToRgb } from './ColorPalette';

// ─── Types ───────────────────────────────────────────────────
export interface EffectSheet {
  canvas: HTMLCanvasElement;
  frameWidth: number;
  frameHeight: number;
  framesPerRow: number;
  totalFrames: number;
  animated: boolean;
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

function fillCircle(pc: PixelCtx, cx: number, cy: number, radius: number, r: number, g: number, b: number, a = 255): void {
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x * x + y * y <= radius * radius) {
        const dist = Math.sqrt(x * x + y * y) / radius;
        const fadeA = Math.floor(a * (1 - dist * 0.5));
        setPixel(pc, cx + x, cy + y, r, g, b, Math.max(20, fadeA));
      }
    }
  }
}

function hexFillCircle(pc: PixelCtx, cx: number, cy: number, radius: number, hex: string, a = 255): void {
  const c = hexToRgb(hex);
  fillCircle(pc, cx, cy, radius, c.r, c.g, c.b, a);
}

function hexFillRect(pc: PixelCtx, x: number, y: number, w: number, h: number, hex: string, a = 255): void {
  const c = hexToRgb(hex);
  fillRect(pc, x, y, w, h, c.r, c.g, c.b, a);
}

function fillRect(pc: PixelCtx, x: number, y: number, w: number, h: number, r: number, g: number, b: number, a = 255): void {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      setPixel(pc, x + dx, y + dy, r, g, b, a);
}

// ─── Effect Generator Class ──────────────────────────────────
export class EffectGenerator {
  private cache: Map<string, EffectSheet> = new Map();

  generateAll(): Map<string, EffectSheet> {
    if (this.cache.size > 0) return this.cache;

    this.generateHitSpark();
    this.generateFireEffect();
    this.generateIceEffect();
    this.generateShadowEffect();
    this.generateHealEffect();
    this.generateLevelUpEffect();
    this.generateBuffApply();
    this.generateDeathEffect();
    this.generateLootSparkle();
    this.generatePortalSwirl();
    this.generateSlash();
    this.generateFireball();
    this.generateDamageNumbers();
    this.generateHealNumbers();
    this.generateCritNumbers();
    this.generateComboCounter();

    return this.cache;
  }

  getSheet(key: string): EffectSheet | undefined {
    return this.cache.get(key);
  }

  // ─── Particle Effects ──────────────────────────────────────

  private generateHitSpark(): void {
    const fw = 32, fh = 32, frames = 6;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const cx = 16, cy = 16;
      const progress = f / (frames - 1);
      const radius = Math.floor(4 + progress * 12);
      const alpha = Math.floor(255 * (1 - progress));

      // Central burst
      const colors = EFFECT_COLORS.hit_spark;
      const colorIdx = Math.min(f, colors.length - 1);
      hexFillCircle(pc, ox + cx, cy, Math.max(1, radius - f), colors[colorIdx], alpha);

      // Sparks radiating outward
      const numSparks = 6 + f * 2;
      for (let s = 0; s < numSparks; s++) {
        const angle = (s / numSparks) * Math.PI * 2 + f * 0.3;
        const dist = Math.floor(3 + progress * 14);
        const sx = Math.floor(cx + Math.cos(angle) * dist);
        const sy = Math.floor(cy + Math.sin(angle) * dist);
        const sparkAlpha = Math.floor(200 * (1 - progress));
        hexPixel(pc, ox + sx, sy, colors[s % colors.length], sparkAlpha);
      }
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_hit_spark', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  private generateFireEffect(): void {
    const fw = 32, fh = 48, frames = 8;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const colors = EFFECT_COLORS.fire;

      // Multiple rising particles
      for (let p = 0; p < 8; p++) {
        const seed = p * 137 + f * 31;
        const px = 8 + ((seed * 7) % 16);
        const baseY = 40 - (f * 4 + p * 3) % 40;
        const size = Math.max(1, 3 - Math.floor(p / 3));

        for (let dy = 0; dy < size; dy++) {
          const y = baseY + dy;
          if (y < 0 || y >= fh) continue;
          const colorT = Math.floor((f + p) / (frames + 8) * colors.length);
          const color = colors[Math.min(colorT, colors.length - 1)];
          const alpha = Math.floor(220 * (1 - (fh - y) / fh));
          hexPixel(pc, ox + px, y, color, Math.max(30, alpha));
          if (size > 1) hexPixel(pc, ox + px + 1, y, color, Math.max(20, alpha - 40));
        }
      }

      // Core glow at base
      hexFillCircle(pc, ox + 16, 42, 4, colors[0], 180);
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_fire', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  private generateIceEffect(): void {
    const fw = 32, fh = 32, frames = 6;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const progress = f / (frames - 1);
      const colors = EFFECT_COLORS.ice;

      // Ice shards forming
      const numShards = 3 + f * 2;
      for (let s = 0; s < numShards; s++) {
        const angle = (s / numShards) * Math.PI * 2;
        const dist = Math.floor(4 + progress * 10);
        const sx = Math.floor(16 + Math.cos(angle) * dist);
        const sy = Math.floor(16 + Math.sin(angle) * dist);
        const color = colors[s % colors.length];
        hexPixel(pc, ox + sx, sy, color, 200);
        hexPixel(pc, ox + sx + 1, sy, color, 150);
        hexPixel(pc, ox + sx, sy + 1, color, 120);
      }

      // Central crystal
      const coreSize = Math.max(1, 4 - Math.floor(f / 2));
      hexFillCircle(pc, ox + 16, 16, coreSize, colors[3], 220);

      // Frost particles
      if (f > 2) {
        for (let p = 0; p < f; p++) {
          const fx = 4 + ((p * 73 + f * 17) % 24);
          const fy = 4 + ((p * 41 + f * 23) % 24);
          hexPixel(pc, ox + fx, fy, colors[2], 100 + p * 20);
        }
      }
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_ice', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  private generateShadowEffect(): void {
    const fw = 32, fh = 32, frames = 6;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const progress = f / (frames - 1);
      const colors = EFFECT_COLORS.shadow;

      // Expanding dark ring
      const radius = Math.floor(3 + progress * 12);
      for (let angle = 0; angle < 360; angle += 15) {
        const rad = angle * Math.PI / 180;
        const px = Math.floor(16 + Math.cos(rad) * radius);
        const py = Math.floor(16 + Math.sin(rad) * radius);
        const color = colors[Math.floor(angle / 90) % colors.length];
        hexPixel(pc, ox + px, py, color, 180 - Math.floor(progress * 100));
      }

      // Central void
      hexFillCircle(pc, ox + 16, 16, Math.max(1, 3 - Math.floor(f / 2)),
        '#1a0a3e', 200);

      // Wisps
      for (let w = 0; w < f + 1; w++) {
        const wx = 16 + Math.floor(Math.sin(w * 2.1 + f) * (6 + f * 2));
        const wy = 16 + Math.floor(Math.cos(w * 1.7 + f) * (6 + f * 2));
        hexPixel(pc, ox + wx, wy, colors[2], 120);
      }
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_shadow', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  private generateHealEffect(): void {
    const fw = 32, fh = 48, frames = 8;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const colors = EFFECT_COLORS.heal;

      // Rising green particles
      for (let p = 0; p < 6; p++) {
        const px = 8 + ((p * 47 + f * 13) % 16);
        const baseY = 44 - (f * 5 + p * 6) % 44;
        const color = colors[p % colors.length];
        const alpha = Math.floor(200 * (1 - baseY / 48));
        hexPixel(pc, ox + px, baseY, color, Math.max(40, alpha));
        hexPixel(pc, ox + px, baseY + 1, color, Math.max(20, alpha - 60));
      }

      // Cross/plus symbol rising
      const crossY = 36 - f * 3;
      if (crossY > 4 && crossY < 40) {
        hexFillRect(pc, ox + 14, crossY, 4, 1, '#69f0ae', 200);
        hexFillRect(pc, ox + 15, crossY - 1, 2, 3, '#69f0ae', 200);
      }

      // Base glow
      hexFillCircle(pc, ox + 16, 44, 3, colors[0], 120 - f * 12);
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_heal', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  private generateLevelUpEffect(): void {
    const fw = 64, fh = 64, frames = 8;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const progress = f / (frames - 1);
      const colors = EFFECT_COLORS.level_up;

      // Expanding golden ring
      const radius = Math.floor(4 + progress * 26);
      const ringAlpha = Math.floor(255 * (1 - progress * 0.7));

      for (let angle = 0; angle < 360; angle += 3) {
        const rad = angle * Math.PI / 180;
        const px = Math.floor(32 + Math.cos(rad) * radius);
        const py = Math.floor(32 + Math.sin(rad) * radius);
        const color = colors[angle % colors.length];
        hexPixel(pc, ox + px, py, color, ringAlpha);
        // Inner ring
        if (radius > 6) {
          const innerR = radius - 3;
          const ipx = Math.floor(32 + Math.cos(rad) * innerR);
          const ipy = Math.floor(32 + Math.sin(rad) * innerR);
          hexPixel(pc, ox + ipx, ipy, colors[0], Math.floor(ringAlpha * 0.5));
        }
      }

      // Sparkles
      for (let s = 0; s < 4 + f; s++) {
        const sa = (s * 2.4 + f * 0.8) % (Math.PI * 2);
        const sd = 5 + (s * 3 + f * 4) % 25;
        const sx = Math.floor(32 + Math.cos(sa) * sd);
        const sy = Math.floor(32 + Math.sin(sa) * sd);
        hexPixel(pc, ox + sx, sy, '#ffffff', 200 - Math.floor(progress * 120));
      }

      // Central flash
      if (f < 3) {
        hexFillCircle(pc, ox + 32, 32, 6 - f * 2, '#ffffff', 200 - f * 60);
      }
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_level_up', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  private generateBuffApply(): void {
    const fw = 32, fh = 32, frames = 6;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const progress = f / (frames - 1);
      const colors = EFFECT_COLORS.buff_apply;

      // Glowing outline expanding
      const radius = Math.floor(8 + progress * 8);
      const alpha = Math.floor(200 * (1 - progress * 0.5));

      for (let angle = 0; angle < 360; angle += 8) {
        const rad = angle * Math.PI / 180;
        const px = Math.floor(16 + Math.cos(rad) * radius);
        const py = Math.floor(16 + Math.sin(rad) * radius);
        hexPixel(pc, ox + px, py, colors[f % colors.length], alpha);
      }

      // Inner glow
      hexFillCircle(pc, ox + 16, 16, Math.floor(6 - progress * 4), colors[2], 100);

      // Upward sparkles
      for (let s = 0; s < f + 1; s++) {
        const sx = 10 + (s * 7) % 12;
        const sy = 16 - s * 2 - f;
        if (sy > 0) hexPixel(pc, ox + sx, sy, '#ffffff', 150);
      }
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_buff', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  private generateDeathEffect(): void {
    const fw = 32, fh = 32, frames = 8;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const progress = f / (frames - 1);
      const colors = EFFECT_COLORS.death;

      // Gray particles falling
      for (let p = 0; p < 6; p++) {
        const px = 8 + ((p * 43 + f * 11) % 16);
        const py = Math.floor(8 + f * 3 + p * 2);
        if (py < 32) {
          const color = colors[p % colors.length];
          const alpha = Math.floor(200 * (1 - progress));
          hexPixel(pc, ox + px, py, color, Math.max(30, alpha));
        }
      }

      // Dissolving body outline (ghost)
      if (f < 4) {
        const ghostAlpha = Math.floor(150 * (1 - f / 4));
        // Simple ghost shape rising
        const gy = 20 - f * 3;
        hexFillRect(pc, ox + 12, gy, 8, 10, '#9e9e9e', ghostAlpha);
        hexFillRect(pc, ox + 14, gy - 3, 4, 4, '#9e9e9e', ghostAlpha);
        // Eyes
        hexPixel(pc, ox + 14, gy - 1, '#333333', ghostAlpha);
        hexPixel(pc, ox + 17, gy - 1, '#333333', ghostAlpha);
      }
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_death', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  private generateLootSparkle(): void {
    const fw = 16, fh = 16, frames = 6;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const progress = f / (frames - 1);
      const colors = EFFECT_COLORS.loot_sparkle;

      // Twinkle star pattern
      const size = Math.floor(2 + Math.sin(progress * Math.PI) * 3);
      const alpha = Math.floor(255 * Math.sin(progress * Math.PI));

      // Horizontal
      for (let i = -size; i <= size; i++) {
        hexPixel(pc, ox + 8 + i, 8, colors[0], Math.max(40, alpha - Math.abs(i) * 30));
      }
      // Vertical
      for (let i = -size; i <= size; i++) {
        hexPixel(pc, ox + 8, 8 + i, colors[0], Math.max(40, alpha - Math.abs(i) * 30));
      }
      // Diagonals
      for (let i = -Math.floor(size * 0.7); i <= Math.floor(size * 0.7); i++) {
        hexPixel(pc, ox + 8 + i, 8 + i, colors[1], Math.max(30, alpha - Math.abs(i) * 40));
        hexPixel(pc, ox + 8 + i, 8 - i, colors[1], Math.max(30, alpha - Math.abs(i) * 40));
      }
      // Center
      hexPixel(pc, ox + 8, 8, colors[2], alpha);
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_loot_sparkle', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  private generatePortalSwirl(): void {
    const fw = 48, fh = 48, frames = 8;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const cx = 24, cy = 24;
      const colors = EFFECT_COLORS.portal;

      // Swirling particles
      for (let p = 0; p < 16; p++) {
        const baseAngle = (p / 16) * Math.PI * 2;
        const spiralOffset = f * 0.4;
        const angle = baseAngle + spiralOffset;
        const radius = 6 + (p % 4) * 3 + Math.sin(f * 0.5 + p) * 2;
        const px = Math.floor(cx + Math.cos(angle) * radius);
        const py = Math.floor(cy + Math.sin(angle) * radius);
        const color = colors[p % colors.length];
        hexPixel(pc, ox + px, py, color, 200);
        hexPixel(pc, ox + px + 1, py, color, 140);
        hexPixel(pc, ox + px, py + 1, color, 140);
      }

      // Center vortex
      const coreSize = 3 + Math.floor(Math.sin(f * 0.8) * 2);
      hexFillCircle(pc, ox + cx, cy, coreSize, colors[0], 200);
      hexFillCircle(pc, ox + cx, cy, Math.max(1, coreSize - 2), '#ffffff', 180);

      // Outer ring
      for (let a = 0; a < 360; a += 12) {
        const rad = a * Math.PI / 180;
        const r = 18 + Math.sin(a * 0.1 + f * 0.5) * 3;
        const sx = Math.floor(cx + Math.cos(rad) * r);
        const sy = Math.floor(cy + Math.sin(rad) * r);
        hexPixel(pc, ox + sx, sy, colors[3], 120);
      }
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_portal', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  // ─── Ability Effects ───────────────────────────────────────

  private generateSlash(): void {
    const fw = 64, fh = 64, frames = 6;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const progress = f / (frames - 1);
      const alpha = Math.floor(255 * (1 - progress * 0.8));

      // Arc slash
      const startAngle = -Math.PI / 3;
      const endAngle = Math.PI / 3;
      const currentEnd = startAngle + (endAngle - startAngle) * Math.min(1, progress * 2);
      const radius = 20;

      for (let a = startAngle; a < currentEnd; a += 0.1) {
        const px = Math.floor(32 + Math.cos(a) * radius);
        const py = Math.floor(40 + Math.sin(a) * radius);
        // Thick slash line
        hexPixel(pc, ox + px, py, '#ffffff', alpha);
        hexPixel(pc, ox + px + 1, py, '#c0c0c0', Math.floor(alpha * 0.7));
        hexPixel(pc, ox + px - 1, py, '#c0c0c0', Math.floor(alpha * 0.7));
        hexPixel(pc, ox + px, py + 1, '#c0c0c0', Math.floor(alpha * 0.5));
      }

      // Spark at tip
      if (f < 4) {
        const tipAngle = currentEnd;
        const tx = Math.floor(32 + Math.cos(tipAngle) * radius);
        const ty = Math.floor(40 + Math.sin(tipAngle) * radius);
        hexFillCircle(pc, ox + tx, ty, 2, '#ffff00', alpha);
      }
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_slash', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  private generateFireball(): void {
    const fw = 32, fh = 32, frames = 6;
    const canvas = createCanvas(fw * frames, fh);
    const pc = getPixelCtx(canvas);

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const colors = EFFECT_COLORS.fire;

      // Ball of fire
      hexFillCircle(pc, ox + 16, 16, 6 - f, colors[0], 220);
      hexFillCircle(pc, ox + 16, 16, 4 - Math.floor(f / 2), colors[3], 200);

      // Trailing particles
      for (let p = 0; p < 3 + f; p++) {
        const tx = 16 - 4 - p * 2;
        const ty = 16 + ((p * 7 + f * 3) % 5) - 2;
        if (tx > 0 && tx < 32) {
          const color = colors[p % colors.length];
          hexPixel(pc, ox + tx, ty, color, 180 - p * 30);
        }
      }

      // Glow
      hexFillCircle(pc, ox + 16, 16, 10, colors[1], 40 + f * 5);
    }

    commitPixels(pc, canvas);
    this.cache.set('vfx_fireball', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }

  // ─── UI Effects ────────────────────────────────────────────

  private generateDamageNumbers(): void {
    // Pre-rendered damage digits 0-9 + crit variant
    const digitW = 10, digitH = 14;
    const numDigits = 11; // 0-9 + crit marker
    const canvas = createCanvas(digitW * numDigits, digitH);
    const ctx = canvas.getContext('2d')!;

    // Draw pixel-art digits using fillRect
    ctx.imageSmoothingEnabled = false;

    const drawDigit = (index: number, x: number, y: number, color: string) => {
      const patterns: number[][][] = [
        // 0
        [[0,0,1,1,1,0],[0,1,0,0,0,1],[0,1,0,0,0,1],[0,1,0,0,0,1],[0,1,0,0,0,1],[0,0,1,1,1,0]],
        // 1
        [[0,0,0,1,0,0],[0,0,1,1,0,0],[0,0,0,1,0,0],[0,0,0,1,0,0],[0,0,0,1,0,0],[0,0,1,1,1,0]],
        // 2
        [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,0,0,1,0,0],[0,0,1,0,0,0],[0,1,0,0,0,0],[1,1,1,1,1,0]],
        // 3
        [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,0,1,1,0,0],[0,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
        // 4
        [[0,0,0,1,0,0],[0,0,1,1,0,0],[0,1,0,1,0,0],[1,1,1,1,1,0],[0,0,0,1,0,0],[0,0,0,1,0,0]],
        // 5
        [[1,1,1,1,1,0],[1,0,0,0,0,0],[1,1,1,1,0,0],[0,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
        // 6
        [[0,1,1,1,0,0],[1,0,0,0,0,0],[1,1,1,1,0,0],[1,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
        // 7
        [[1,1,1,1,1,0],[0,0,0,0,1,0],[0,0,0,1,0,0],[0,0,1,0,0,0],[0,0,1,0,0,0],[0,0,1,0,0,0]],
        // 8
        [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,1,1,1,0,0],[1,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
        // 9
        [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,1,1,1,1,0],[0,0,0,0,1,0],[0,0,0,0,1,0],[0,1,1,1,0,0]],
      ];

      if (index < 10) {
        const pattern = patterns[index];
        const rgb = hexToRgb(color);
        for (let row = 0; row < pattern.length; row++) {
          for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col]) {
              ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
              ctx.fillRect(x + col * 2, y + row * 2, 2, 2);
            }
          }
        }
      } else {
        // Crit marker: "!" in gold
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 4, y, 2, 8);
        ctx.fillRect(x + 4, y + 10, 2, 2);
      }
    };

    // Normal damage (red)
    for (let d = 0; d < 10; d++) {
      drawDigit(d, d * digitW, 0, '#ff5252');
    }
    // Crit marker
    drawDigit(10, 10 * digitW, 0, '#ffd700');

    this.cache.set('ui_damage_numbers', {
      canvas, frameWidth: digitW, frameHeight: digitH,
      framesPerRow: numDigits, totalFrames: numDigits, animated: false,
    });
  }

  private generateHealNumbers(): void {
    const digitW = 10, digitH = 14;
    const canvas = createCanvas(digitW * 10, digitH);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const patterns: number[][][] = [
      [[0,0,1,1,1,0],[0,1,0,0,0,1],[0,1,0,0,0,1],[0,1,0,0,0,1],[0,1,0,0,0,1],[0,0,1,1,1,0]],
      [[0,0,0,1,0,0],[0,0,1,1,0,0],[0,0,0,1,0,0],[0,0,0,1,0,0],[0,0,0,1,0,0],[0,0,1,1,1,0]],
      [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,0,0,1,0,0],[0,0,1,0,0,0],[0,1,0,0,0,0],[1,1,1,1,1,0]],
      [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,0,1,1,0,0],[0,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
      [[0,0,0,1,0,0],[0,0,1,1,0,0],[0,1,0,1,0,0],[1,1,1,1,1,0],[0,0,0,1,0,0],[0,0,0,1,0,0]],
      [[1,1,1,1,1,0],[1,0,0,0,0,0],[1,1,1,1,0,0],[0,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
      [[0,1,1,1,0,0],[1,0,0,0,0,0],[1,1,1,1,0,0],[1,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
      [[1,1,1,1,1,0],[0,0,0,0,1,0],[0,0,0,1,0,0],[0,0,1,0,0,0],[0,0,1,0,0,0],[0,0,1,0,0,0]],
      [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,1,1,1,0,0],[1,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
      [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,1,1,1,1,0],[0,0,0,0,1,0],[0,0,0,0,1,0],[0,1,1,1,0,0]],
    ];

    const rgb = hexToRgb('#69f0ae');
    for (let d = 0; d < 10; d++) {
      const pattern = patterns[d];
      for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
          if (pattern[row][col]) {
            ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
            ctx.fillRect(d * digitW + col * 2, row * 2, 2, 2);
          }
        }
      }
    }

    this.cache.set('ui_heal_numbers', {
      canvas, frameWidth: digitW, frameHeight: digitH,
      framesPerRow: 10, totalFrames: 10, animated: false,
    });
  }

  private generateCritNumbers(): void {
    const digitW = 14, digitH = 18;
    const canvas = createCanvas(digitW * 10, digitH);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const patterns: number[][][] = [
      [[0,0,1,1,1,0],[0,1,0,0,0,1],[0,1,0,0,0,1],[0,1,0,0,0,1],[0,1,0,0,0,1],[0,0,1,1,1,0]],
      [[0,0,0,1,0,0],[0,0,1,1,0,0],[0,0,0,1,0,0],[0,0,0,1,0,0],[0,0,0,1,0,0],[0,0,1,1,1,0]],
      [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,0,0,1,0,0],[0,0,1,0,0,0],[0,1,0,0,0,0],[1,1,1,1,1,0]],
      [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,0,1,1,0,0],[0,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
      [[0,0,0,1,0,0],[0,0,1,1,0,0],[0,1,0,1,0,0],[1,1,1,1,1,0],[0,0,0,1,0,0],[0,0,0,1,0,0]],
      [[1,1,1,1,1,0],[1,0,0,0,0,0],[1,1,1,1,0,0],[0,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
      [[0,1,1,1,0,0],[1,0,0,0,0,0],[1,1,1,1,0,0],[1,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
      [[1,1,1,1,1,0],[0,0,0,0,1,0],[0,0,0,1,0,0],[0,0,1,0,0,0],[0,0,1,0,0,0],[0,0,1,0,0,0]],
      [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,1,1,1,0,0],[1,0,0,0,1,0],[1,0,0,0,1,0],[0,1,1,1,0,0]],
      [[0,1,1,1,0,0],[1,0,0,0,1,0],[0,1,1,1,1,0],[0,0,0,0,1,0],[0,0,0,0,1,0],[0,1,1,1,0,0]],
    ];

    const rgb = hexToRgb('#ffd700');
    for (let d = 0; d < 10; d++) {
      const pattern = patterns[d];
      for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
          if (pattern[row][col]) {
            // Larger: 3x scale
            ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
            ctx.fillRect(d * digitW + 1 + col * 2, row * 2, 2, 2);
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(d * digitW + 2 + col * 2, 1 + row * 2, 2, 2);
          }
        }
      }
    }

    this.cache.set('ui_crit_numbers', {
      canvas, frameWidth: digitW, frameHeight: digitH,
      framesPerRow: 10, totalFrames: 10, animated: false,
    });
  }

  private generateComboCounter(): void {
    const fw = 48, fh = 20, frames = 5;
    const canvas = createCanvas(fw * frames, fh);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const scale = 1 + f * 0.1;

      // Background glow
      ctx.fillStyle = `rgba(255,165,0,${0.3 - f * 0.05})`;
      ctx.fillRect(ox, 0, fw, fh);

      // Border
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(ox, 0, fw, 2);
      ctx.fillRect(ox, fh - 2, fw, 2);
      ctx.fillRect(ox, 0, 2, fh);
      ctx.fillRect(ox + fw - 2, 0, 2, fh);

      // "COMBO" text approximation (pixel art)
      const textY = 6;
      ctx.fillStyle = '#ffd700';
      // C
      ctx.fillRect(ox + 4, textY, 2, 8); ctx.fillRect(ox + 6, textY, 4, 2);
      ctx.fillRect(ox + 6, textY + 6, 4, 2);
      // O
      ctx.fillRect(ox + 12, textY, 2, 8); ctx.fillRect(ox + 16, textY, 2, 8);
      ctx.fillRect(ox + 14, textY, 2, 2); ctx.fillRect(ox + 14, textY + 6, 2, 2);
      // M
      ctx.fillRect(ox + 20, textY, 2, 8); ctx.fillRect(ox + 26, textY, 2, 8);
      ctx.fillRect(ox + 22, textY + 2, 2, 2); ctx.fillRect(ox + 24, textY + 2, 2, 2);
      // B
      ctx.fillRect(ox + 30, textY, 2, 8); ctx.fillRect(ox + 32, textY, 4, 2);
      ctx.fillRect(ox + 32, textY + 3, 4, 2); ctx.fillRect(ox + 32, textY + 6, 4, 2);
      // O
      ctx.fillRect(ox + 38, textY, 2, 8); ctx.fillRect(ox + 42, textY, 2, 8);
      ctx.fillRect(ox + 40, textY, 2, 2); ctx.fillRect(ox + 40, textY + 6, 2, 2);
    }

    this.cache.set('ui_combo', {
      canvas, frameWidth: fw, frameHeight: fh,
      framesPerRow: frames, totalFrames: frames, animated: true,
    });
  }
}
