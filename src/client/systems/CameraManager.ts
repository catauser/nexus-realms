// ============================================================
// Nexus Realms — Camera Manager
// Follow player with smooth lerp, zoom, shake, bounds
// ============================================================

import Phaser from 'phaser';
import { smoothDamp, clamp } from '../utils/MathUtils';

export interface CameraConfig {
  /** Smoothing time for follow (lower = snappier) */
  followSmoothTime?: number;
  /** Min zoom level */
  minZoom?: number;
  /** Max zoom level */
  maxZoom?: number;
  /** Zoom step per scroll */
  zoomStep?: number;
  /** World bounds (pixels) */
  worldBounds?: { x: number; y: number; width: number; height: number };
}

export class CameraManager {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private target: Phaser.GameObjects.Components.Transform | null = null;

  // Follow smoothing
  private smoothTime: number;
  private velX: { value: number } = { value: 0 };
  private velY: { value: number } = { value: 0 };

  // Zoom
  private minZoom: number;
  private maxZoom: number;
  private zoomStep: number;
  private targetZoom: number;

  // World bounds
  private worldBounds: { x: number; y: number; width: number; height: number } | null;

  // Shake
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeTimer: number = 0;
  private shakeOffsetX: number = 0;
  private shakeOffsetY: number = 0;

  constructor(camera: Phaser.Cameras.Scene2D.Camera, config: CameraConfig = {}) {
    this.camera = camera;
    this.smoothTime = config.followSmoothTime ?? 0.15;
    this.minZoom = config.minZoom ?? 0.5;
    this.maxZoom = config.maxZoom ?? 2.0;
    this.zoomStep = config.zoomStep ?? 0.1;
    this.targetZoom = camera.zoom;
    this.worldBounds = config.worldBounds ?? null;

    this.setupZoomInput();
  }

  /** Set the target to follow */
  setFollowTarget(target: Phaser.GameObjects.Components.Transform): void {
    this.target = target;
  }

  /** Set world bounds for camera clamping */
  setWorldBounds(x: number, y: number, width: number, height: number): void {
    this.worldBounds = { x, y, width, height };
    this.camera.setBounds(x, y, width, height);
  }

  /** Trigger screen shake */
  shake(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = 0;
  }

  /** Set zoom directly */
  setZoom(zoom: number): void {
    this.targetZoom = clamp(zoom, this.minZoom, this.maxZoom);
  }

  /** Get current target zoom */
  getTargetZoom(): number {
    return this.targetZoom;
  }

  /** Call every frame */
  update(dt: number): void {
    // Follow target with smooth damp
    if (this.target) {
      const camX = smoothDamp(
        this.camera.scrollX + this.camera.width / (2 * this.camera.zoom),
        this.target.x,
        this.velX,
        this.smoothTime,
        2000,
        dt
      );
      const camY = smoothDamp(
        this.camera.scrollY + this.camera.height / (2 * this.camera.zoom),
        this.target.y,
        this.velY,
        this.smoothTime,
        2000,
        dt
      );

      this.camera.centerOn(camX, camY);
    }

    // Smooth zoom
    const currentZoom = this.camera.zoom;
    if (Math.abs(currentZoom - this.targetZoom) > 0.001) {
      const newZoom = currentZoom + (this.targetZoom - currentZoom) * Math.min(1, dt * 8);
      this.camera.setZoom(newZoom);
    }

    // Screen shake
    if (this.shakeTimer < this.shakeDuration) {
      this.shakeTimer += dt;
      const progress = this.shakeTimer / this.shakeDuration;
      const decay = 1 - progress;
      const intensity = this.shakeIntensity * decay;

      this.shakeOffsetX = (Math.random() - 0.5) * 2 * intensity;
      this.shakeOffsetY = (Math.random() - 0.5) * 2 * intensity;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // Apply shake offset
    if (this.shakeOffsetX !== 0 || this.shakeOffsetY !== 0) {
      this.camera.setScroll(
        this.camera.scrollX + this.shakeOffsetX,
        this.camera.scrollY + this.shakeOffsetY
      );
    }
  }

  private setupZoomInput(): void {
    // Mouse wheel zoom
    this.camera.scene.input.on('wheel', (
      _pointer: Phaser.Input.Pointer,
      _gameObjects: Phaser.GameObjects.GameObject[],
      _dx: number,
      dy: number,
    ) => {
      if (dy > 0) {
        this.targetZoom = clamp(this.targetZoom - this.zoomStep, this.minZoom, this.maxZoom);
      } else if (dy < 0) {
        this.targetZoom = clamp(this.targetZoom + this.zoomStep, this.minZoom, this.maxZoom);
      }
    });
  }

  destroy(): void {
    this.target = null;
  }
}
