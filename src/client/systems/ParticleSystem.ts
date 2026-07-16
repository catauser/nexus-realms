// ============================================================
// Nexus Realms — Particle System
// Procedural particle effects for combat, magic, environment
// ============================================================

import Phaser from 'phaser';

// ─── Particle Config ─────────────────────────────────────────
export interface ParticleConfig {
  x: number;
  y: number;
  color: number | number[];
  count: number;
  speed: number;
  speedVariance: number;
  lifetime: number;
  lifetimeVariance: number;
  size: number;
  sizeVariance: number;
  gravityY?: number;
  fadeOut?: boolean;
  fadeIn?: boolean;
  rotate?: boolean;
  alpha?: number;
  blendMode?: Phaser.BlendModes;
  angle?: number;
  angleSpread?: number;
}

// ─── Particle Instance ───────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  gravityY: number;
  fadeOut: boolean;
  fadeIn: boolean;
}

// ─── Active Effect ───────────────────────────────────────────
interface ActiveEffect {
  particles: Particle[];
  graphics: Phaser.GameObjects.Graphics;
  elapsed: number;
  duration: number;
}

// ─── Particle System ─────────────────────────────────────────
export class ParticleSystem {
  private scene: Phaser.Scene;
  private effects: ActiveEffect[] = [];
  private container: Phaser.GameObjects.Container;
  private pool: Particle[] = [];
  private maxPoolSize: number = 2000;

  // Environmental particles
  private envParticles: Particle[] = [];
  private envGraphics: Phaser.GameObjects.Graphics;
  private envType: 'none' | 'rain' | 'snow' | 'leaves' | 'dust' = 'none';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(22);
    this.envGraphics = scene.add.graphics();
    this.envGraphics.setDepth(3);
  }

  // ─── Preset Effects ───────────────────────────────────────

  /** Burst of particles on hit */
  spawnHitEffect(x: number, y: number, color: number = 0xffffff): void {
    this.spawn({
      x, y,
      color: [color, 0xffffff, 0xffff88],
      count: 12,
      speed: 120,
      speedVariance: 60,
      lifetime: 0.4,
      lifetimeVariance: 0.15,
      size: 3,
      sizeVariance: 1.5,
      fadeOut: true,
      angle: 0,
      angleSpread: 360,
    });
  }

  /** Fire magic effect */
  spawnFireEffect(x: number, y: number): void {
    this.spawn({
      x, y,
      color: [0xff4500, 0xff6600, 0xff9900, 0xffcc00],
      count: 20,
      speed: 80,
      speedVariance: 40,
      lifetime: 0.8,
      lifetimeVariance: 0.3,
      size: 5,
      sizeVariance: 2,
      gravityY: -60,
      fadeOut: true,
      fadeIn: true,
    });
  }

  /** Ice magic effect */
  spawnIceEffect(x: number, y: number): void {
    this.spawn({
      x, y,
      color: [0x00bcd4, 0x80deea, 0xe0f7fa, 0xffffff],
      count: 18,
      speed: 60,
      speedVariance: 30,
      lifetime: 1.0,
      lifetimeVariance: 0.3,
      size: 4,
      sizeVariance: 2,
      gravityY: 20,
      fadeOut: true,
      rotate: true,
    });
  }

  /** Shadow magic effect */
  spawnShadowEffect(x: number, y: number): void {
    this.spawn({
      x, y,
      color: [0x4a148c, 0x7b1fa2, 0x9c27b0, 0xce93d8],
      count: 16,
      speed: 50,
      speedVariance: 25,
      lifetime: 1.2,
      lifetimeVariance: 0.4,
      size: 6,
      sizeVariance: 3,
      fadeOut: true,
      fadeIn: true,
      rotate: true,
    });
  }

  /** Lightning effect (line of sparks) */
  spawnLightningEffect(x1: number, y1: number, x2: number, y2: number): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(3, Math.floor(dist / 20));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + dx * t + (Math.random() - 0.5) * 15;
      const py = y1 + dy * t + (Math.random() - 0.5) * 15;
      this.spawn({
        x: px, y: py,
        color: [0xffff44, 0xffffaa, 0xffffff],
        count: 3,
        speed: 40,
        speedVariance: 20,
        lifetime: 0.3,
        lifetimeVariance: 0.1,
        size: 2,
        sizeVariance: 1,
        fadeOut: true,
        angle: 0,
        angleSpread: 360,
      });
    }
  }

  /** Heal effect (green particles rising) */
  spawnHealEffect(x: number, y: number): void {
    this.spawn({
      x, y,
      color: [0x00e676, 0x69f0ae, 0xb9f6ca, 0xffffff],
      count: 15,
      speed: 40,
      speedVariance: 20,
      lifetime: 1.2,
      lifetimeVariance: 0.3,
      size: 4,
      sizeVariance: 2,
      gravityY: -50,
      fadeOut: true,
      fadeIn: true,
    });
  }

  /** Level up effect (golden ring expanding) */
  spawnLevelUpEffect(x: number, y: number): void {
    // Ring of golden particles
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const speed = 100;
      this.spawn({
        x, y,
        color: [0xffd700, 0xffec8b, 0xffffff],
        count: 1,
        speed: speed,
        speedVariance: 10,
        lifetime: 1.0,
        lifetimeVariance: 0.2,
        size: 5,
        sizeVariance: 2,
        fadeOut: true,
        fadeIn: true,
        angle: (angle * 180) / Math.PI,
        angleSpread: 5,
      });
    }
    // Central burst
    this.spawn({
      x, y,
      color: [0xffd700, 0xffffff],
      count: 20,
      speed: 30,
      speedVariance: 15,
      lifetime: 1.5,
      lifetimeVariance: 0.3,
      size: 3,
      sizeVariance: 1.5,
      gravityY: -30,
      fadeOut: true,
    });
  }

  /** Buff visual indicator (colored ring around entity) */
  spawnBuffEffect(x: number, y: number, color: number, duration: number = 1.0): void {
    this.spawn({
      x, y,
      color: [color, 0xffffff],
      count: 8,
      speed: 20,
      speedVariance: 10,
      lifetime: duration,
      lifetimeVariance: 0.2,
      size: 3,
      sizeVariance: 1,
      gravityY: -20,
      fadeOut: true,
      fadeIn: true,
    });
  }

  /** Debuff visual indicator (dark particles) */
  spawnDebuffEffect(x: number, y: number, color: number = 0x8844cc): void {
    this.spawn({
      x, y,
      color: [color, 0x444444],
      count: 6,
      speed: 15,
      speedVariance: 8,
      lifetime: 0.8,
      lifetimeVariance: 0.2,
      size: 4,
      sizeVariance: 2,
      gravityY: 10,
      fadeOut: true,
    });
  }

  /** Death particles (entity fading) */
  spawnDeathEffect(x: number, y: number): void {
    this.spawn({
      x, y,
      color: [0x616161, 0x9e9e9e, 0xbdbdbd, 0xe0e0e0],
      count: 25,
      speed: 60,
      speedVariance: 30,
      lifetime: 1.5,
      lifetimeVariance: 0.5,
      size: 4,
      sizeVariance: 2,
      gravityY: 30,
      fadeOut: true,
      fadeIn: true,
    });
  }

  /** Loot sparkle effect */
  spawnLootSparkle(x: number, y: number): void {
    this.spawn({
      x, y,
      color: [0xffd700, 0xffec8b, 0xffffff],
      count: 8,
      speed: 30,
      speedVariance: 15,
      lifetime: 1.0,
      lifetimeVariance: 0.3,
      size: 3,
      sizeVariance: 1.5,
      gravityY: -20,
      fadeOut: true,
      fadeIn: true,
      rotate: true,
    });
  }

  /** Portal effect */
  spawnPortalEffect(x: number, y: number): void {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      this.spawn({
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20,
        color: [0x7c4dff, 0xb388ff, 0xe040fb],
        count: 1,
        speed: 10,
        speedVariance: 5,
        lifetime: 0.8,
        lifetimeVariance: 0.2,
        size: 4,
        sizeVariance: 2,
        fadeOut: true,
        fadeIn: true,
        angle: (angle * 180) / Math.PI + 90,
        angleSpread: 10,
      });
    }
  }

  // ─── Environmental Particles ──────────────────────────────

  /** Set environmental particle type */
  setEnvironment(type: 'none' | 'rain' | 'snow' | 'leaves' | 'dust'): void {
    this.envType = type;
    this.envParticles.length = 0;
  }

  /** Update environmental particles each frame */
  updateEnvironment(
    dt: number,
    camX: number,
    camY: number,
    viewW: number,
    viewH: number,
  ): void {
    if (this.envType === 'none') {
      this.envGraphics.setVisible(false);
      return;
    }
    this.envGraphics.setVisible(true);

    // Spawn new particles
    const spawnRate = this.getEnvSpawnRate();
    const spawnCount = Math.floor(spawnRate * dt);
    for (let i = 0; i < spawnCount; i++) {
      this.envParticles.push(this.createEnvParticle(camX, camY, viewW, viewH));
    }

    // Cap particle count
    const maxEnv = 300;
    if (this.envParticles.length > maxEnv) {
      this.envParticles.splice(0, this.envParticles.length - maxEnv);
    }

    // Update existing
    for (let i = this.envParticles.length - 1; i >= 0; i--) {
      const p = this.envParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0 || p.y > camY + viewH + 20 || p.x < camX - 20 || p.x > camX + viewW + 20) {
        this.envParticles.splice(i, 1);
      }
    }

    // Render
    this.envGraphics.clear();
    for (const p of this.envParticles) {
      const alpha = Math.min(1, p.life / 0.5) * p.alpha;
      this.envGraphics.fillStyle(p.color, alpha);
      this.envGraphics.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }

  // ─── Core Spawn ───────────────────────────────────────────

  spawn(config: ParticleConfig): void {
    const particles: Particle[] = [];
    const count = config.count;

    for (let i = 0; i < count; i++) {
      const p = this.pool.length > 0 ? this.pool.pop()! : this.createParticle();

      const angle = config.angle !== undefined
        ? ((config.angle + (Math.random() - 0.5) * (config.angleSpread ?? 360)) * Math.PI) / 180
        : Math.random() * Math.PI * 2;
      const speed = config.speed + (Math.random() - 0.5) * config.speedVariance * 2;

      p.x = config.x + (Math.random() - 0.5) * 4;
      p.y = config.y + (Math.random() - 0.5) * 4;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = config.lifetime + (Math.random() - 0.5) * config.lifetimeVariance * 2;
      p.maxLife = p.life;
      p.size = Math.max(1, config.size + (Math.random() - 0.5) * config.sizeVariance * 2);
      p.gravityY = config.gravityY ?? 0;
      p.fadeOut = config.fadeOut ?? true;
      p.fadeIn = config.fadeIn ?? false;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = config.rotate ? (Math.random() - 0.5) * 5 : 0;
      p.alpha = config.alpha ?? 1;

      // Pick color
      const colors = Array.isArray(config.color) ? config.color : [config.color];
      p.color = colors[Math.floor(Math.random() * colors.length)];

      particles.push(p);
    }

    const graphics = this.scene.add.graphics();
    this.container.add(graphics);

    this.effects.push({
      particles,
      graphics,
      elapsed: 0,
      duration: config.lifetime + config.lifetimeVariance + 0.5,
    });
  }

  // ─── Update ───────────────────────────────────────────────

  update(dt: number): void {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      effect.elapsed += dt;

      // Update particles
      for (let j = effect.particles.length - 1; j >= 0; j--) {
        const p = effect.particles[j];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += p.gravityY * dt;
        p.life -= dt;
        p.rotation += p.rotationSpeed * dt;

        // Friction
        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.life <= 0) {
          // Return to pool
          if (this.pool.length < this.maxPoolSize) {
            this.pool.push(p);
          }
          effect.particles.splice(j, 1);
        }
      }

      // Render
      effect.graphics.clear();
      for (const p of effect.particles) {
        const lifePct = 1 - p.life / p.maxLife;
        let alpha = p.alpha;
        if (p.fadeIn && lifePct < 0.1) {
          alpha *= lifePct / 0.1;
        }
        if (p.fadeOut && lifePct > 0.7) {
          alpha *= (1 - lifePct) / 0.3;
        }
        alpha = Math.max(0, Math.min(1, alpha));

        effect.graphics.fillStyle(p.color, alpha);
        effect.graphics.fillRect(
          p.x - p.size / 2,
          p.y - p.size / 2,
          p.size,
          p.size,
        );
      }

      // Remove completed effects
      if (effect.particles.length === 0 && effect.elapsed > effect.duration) {
        effect.graphics.destroy();
        this.effects.splice(i, 1);
      }
    }
  }

  // ─── Private Helpers ──────────────────────────────────────

  private createParticle(): Particle {
    return {
      x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 0, size: 2,
      color: 0xffffff, alpha: 1,
      rotation: 0, rotationSpeed: 0,
      gravityY: 0, fadeOut: true, fadeIn: false,
    };
  }

  private getEnvSpawnRate(): number {
    switch (this.envType) {
      case 'rain': return 200;
      case 'snow': return 80;
      case 'leaves': return 15;
      case 'dust': return 30;
      default: return 0;
    }
  }

  private createEnvParticle(
    camX: number,
    camY: number,
    viewW: number,
    viewH: number,
  ): Particle {
    const p = this.createParticle();
    switch (this.envType) {
      case 'rain':
        p.x = camX + Math.random() * viewW;
        p.y = camY - 10;
        p.vx = -20 + Math.random() * 10;
        p.vy = 300 + Math.random() * 100;
        p.size = 1;
        p.color = 0x6688aa;
        p.alpha = 0.4;
        p.life = 2;
        p.maxLife = 2;
        break;
      case 'snow':
        p.x = camX + Math.random() * viewW;
        p.y = camY - 10;
        p.vx = (Math.random() - 0.5) * 30;
        p.vy = 40 + Math.random() * 30;
        p.size = 2 + Math.random() * 2;
        p.color = 0xeef4ff;
        p.alpha = 0.6;
        p.life = 4;
        p.maxLife = 4;
        break;
      case 'leaves':
        p.x = camX + Math.random() * viewW;
        p.y = camY - 10;
        p.vx = 20 + Math.random() * 40;
        p.vy = 30 + Math.random() * 20;
        p.size = 3;
        p.color = Math.random() > 0.5 ? 0x4caf50 : 0xff9800;
        p.alpha = 0.7;
        p.life = 5;
        p.maxLife = 5;
        p.rotationSpeed = (Math.random() - 0.5) * 3;
        break;
      case 'dust':
        p.x = camX + Math.random() * viewW;
        p.y = camY + viewH * 0.6 + Math.random() * viewH * 0.4;
        p.vx = (Math.random() - 0.5) * 20;
        p.vy = -10 + Math.random() * 5;
        p.size = 2;
        p.color = 0xccaa88;
        p.alpha = 0.3;
        p.life = 3;
        p.maxLife = 3;
        break;
    }
    return p;
  }

  destroy(): void {
    for (const effect of this.effects) {
      effect.graphics.destroy();
    }
    this.effects = [];
    this.pool = [];
    this.envParticles = [];
    this.envGraphics.destroy();
    this.container.destroy();
  }
}
