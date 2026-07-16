// ============================================================
// Nexus Realms — Map UI
// Full-screen world map, zone map with markers,
// player position, quest objectives, fog of war
// ============================================================

import Phaser from 'phaser';
import { GAME_CONFIG } from '../../shared/types';

// ─── Map Marker ──────────────────────────────────────────────
export interface MapMarker {
  id: string;
  x: number;        // world coordinates
  y: number;
  label: string;
  color: number;
  type: 'quest' | 'npc' | 'poi' | 'player' | 'party' | 'dungeon';
}

// ─── Fog Tile ────────────────────────────────────────────────
interface FogCell {
  explored: boolean;
}

// ─── Map UI ──────────────────────────────────────────────────
export class MapUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible: boolean = false;

  // Map dimensions (world in tiles)
  private worldTileWidth: number = 0;
  private worldTileHeight: number = 0;
  private tileSize: number = GAME_CONFIG.TILE_SIZE;

  // Display
  private mapSize: number = 500; // pixel size of the map panel
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private markerGraphics!: Phaser.GameObjects.Graphics;
  private fogGraphics!: Phaser.GameObjects.Graphics;

  // Markers
  private markers: MapMarker[] = [];

  // Fog of war data
  private fogGrid: Map<string, FogCell> = new Map();

  // Player position (updated each frame)
  private playerX: number = 0;
  private playerY: number = 0;

  // Zoom level for the map
  private mapZoom: number = 1;
  private mapOffsetX: number = 0;
  private mapOffsetY: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(120);
    this.container.setVisible(false);

    this.createPanel();
  }

  toggle(): void {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);
    if (this.visible) this.render();
  }

  show(): void {
    this.visible = true;
    this.container.setVisible(true);
    this.render();
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
  }

  isVisible(): boolean {
    return this.visible;
  }

  /** Set world dimensions */
  setWorldSize(tileWidth: number, tileHeight: number): void {
    this.worldTileWidth = tileWidth;
    this.worldTileHeight = tileHeight;
  }

  /** Update player position (world coords in pixels) */
  setPlayerPosition(worldX: number, worldY: number): void {
    this.playerX = worldX;
    this.playerY = worldY;
  }

  /** Update explored fog cells */
  setExplored(tileX: number, tileY: number, explored: boolean): void {
    const key = `${tileX},${tileY}`;
    const cell = this.fogGrid.get(key);
    if (cell) {
      cell.explored = explored;
    } else {
      this.fogGrid.set(key, { explored });
    }
  }

  /** Mark a rectangular area as explored */
  exploreArea(tileX: number, tileY: number, radiusTiles: number): void {
    for (let dy = -radiusTiles; dy <= radiusTiles; dy++) {
      for (let dx = -radiusTiles; dx <= radiusTiles; dx++) {
        if (dx * dx + dy * dy > radiusTiles * radiusTiles) continue;
        this.setExplored(tileX + dx, tileY + dy, true);
      }
    }
  }

  /** Set markers on the map */
  setMarkers(markers: MapMarker[]): void {
    this.markers = markers;
  }

  /** Add a single marker */
  addMarker(marker: MapMarker): void {
    this.markers.push(marker);
  }

  /** Remove a marker by ID */
  removeMarker(id: string): void {
    this.markers = this.markers.filter(m => m.id !== id);
  }

  update(_dt: number): void {
    // Could animate markers, pulse player dot, etc.
  }

  // ─── Panel Creation ───────────────────────────────────────

  private createPanel(): void {
    const cx = GAME_CONFIG.VIEWPORT_WIDTH / 2;
    const cy = GAME_CONFIG.VIEWPORT_HEIGHT / 2;

    // Full-screen overlay background
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_CONFIG.VIEWPORT_WIDTH, GAME_CONFIG.VIEWPORT_HEIGHT);
    overlay.setScrollFactor(0);
    this.container.add(overlay);

    // Map panel background
    const panelX = cx - this.mapSize / 2;
    const panelY = cy - this.mapSize / 2 - 20;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x111122, 0.95);
    bg.fillRoundedRect(panelX - 10, panelY - 30, this.mapSize + 20, this.mapSize + 50, 8);
    bg.lineStyle(2, 0x444466);
    bg.strokeRoundedRect(panelX - 10, panelY - 30, this.mapSize + 20, this.mapSize + 50, 8);
    bg.setScrollFactor(0);
    this.container.add(bg);

    // Title
    const title = this.scene.add.text(cx, panelY - 18, 'World Map', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#c0a040',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0);
    this.container.add(title);

    // Close button
    const closeBtn = this.scene.add.text(cx + this.mapSize / 2 + 4, panelY - 28, '✕', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#cc4444',
    }).setOrigin(1, 0).setScrollFactor(0).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    this.container.add(closeBtn);

    // Map canvas
    this.mapGraphics = this.scene.add.graphics();
    this.mapGraphics.setScrollFactor(0);
    this.container.add(this.mapGraphics);

    // Fog layer
    this.fogGraphics = this.scene.add.graphics();
    this.fogGraphics.setScrollFactor(0);
    this.container.add(this.fogGraphics);

    // Marker layer
    this.markerGraphics = this.scene.add.graphics();
    this.markerGraphics.setScrollFactor(0);
    this.container.add(this.markerGraphics);

    // Legend
    const legendY = panelY + this.mapSize + 8;
    const legendItems = [
      { color: 0xffffff, label: 'You' },
      { color: 0xffcc00, label: 'Quest' },
      { color: 0x44cc44, label: 'NPC' },
      { color: 0x66ccff, label: 'Party' },
      { color: 0xff4444, label: 'Dungeon' },
    ];

    let lx = panelX;
    for (const item of legendItems) {
      const dot = this.scene.add.graphics();
      dot.fillStyle(item.color, 1);
      dot.fillCircle(lx + 5, legendY + 5, 4);
      dot.setScrollFactor(0);
      this.container.add(dot);

      const label = this.scene.add.text(lx + 14, legendY, item.label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: '#aaaaaa',
      }).setScrollFactor(0);
      this.container.add(label);

      lx += 70;
    }

    // Mouse drag for panning
    const hitArea = this.scene.add.rectangle(cx, cy, this.mapSize, this.mapSize)
      .setScrollFactor(0).setInteractive().setAlpha(0.001);
    this.container.add(hitArea);

    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true;
      lastPointerX = pointer.x;
      lastPointerY = pointer.y;
    });

    hitArea.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!isDragging) return;
      this.mapOffsetX += pointer.x - lastPointerX;
      this.mapOffsetY += pointer.y - lastPointerY;
      lastPointerX = pointer.x;
      lastPointerY = pointer.y;
      this.render();
    });

    hitArea.on('pointerup', () => { isDragging = false; });

    hitArea.on('wheel', (_p: Phaser.Input.Pointer, _dx: number, dy: number) => {
      this.mapZoom = Math.max(0.5, Math.min(3, this.mapZoom + (dy > 0 ? -0.2 : 0.2)));
      this.render();
    });
  }

  // ─── Rendering ────────────────────────────────────────────

  private render(): void {
    if (!this.visible) return;

    const cx = GAME_CONFIG.VIEWPORT_WIDTH / 2;
    const cy = GAME_CONFIG.VIEWPORT_HEIGHT / 2;
    const panelX = cx - this.mapSize / 2;
    const panelY = cy - this.mapSize / 2 - 20;

    // World pixel dimensions
    const worldPixelW = this.worldTileWidth * this.tileSize;
    const worldPixelH = this.worldTileHeight * this.tileSize;

    // Scale to fit map in the panel
    const baseScale = Math.min(this.mapSize / worldPixelW, this.mapSize / worldPixelH);
    const scale = baseScale * this.mapZoom;

    // Center + offset
    const originX = panelX + this.mapSize / 2 + this.mapOffsetX;
    const originY = panelY + this.mapSize / 2 + this.mapOffsetY;

    // ── Draw terrain ────────────────────────────────────────
    this.mapGraphics.clear();

    // Simple terrain representation (procedural)
    const step = Math.max(1, Math.floor(1 / scale)); // tile step for culling
    for (let ty = 0; ty < this.worldTileHeight; ty += step) {
      for (let tx = 0; tx < this.worldTileWidth; tx += step) {
        const sx = originX + (tx * this.tileSize - worldPixelW / 2) * scale;
        const sy = originY + (ty * this.tileSize - worldPixelH / 2) * scale;
        const sw = this.tileSize * scale * step;

        // Only draw if within panel bounds
        if (sx + sw < panelX || sx > panelX + this.mapSize) continue;
        if (sy + sw < panelY || sy > panelY + this.mapSize) continue;

        // Procedural terrain color
        const noise = Math.sin(tx * 0.3) * Math.cos(ty * 0.3);
        let color = 0x2a4a2a; // grass
        if (noise > 0.5) color = 0x1a3a5a; // water
        else if (noise > 0.3) color = 0x3a5a3a; // forest
        else if (noise < -0.5) color = 0x5a4a3a; // mountain

        this.mapGraphics.fillStyle(color, 0.8);
        this.mapGraphics.fillRect(sx, sy, Math.max(1, sw), Math.max(1, sw));
      }
    }

    // ── Draw fog of war ─────────────────────────────────────
    this.fogGraphics.clear();
    for (let ty = 0; ty < this.worldTileHeight; ty += step) {
      for (let tx = 0; tx < this.worldTileWidth; tx += step) {
        const key = `${tx},${ty}`;
        const cell = this.fogGrid.get(key);
        if (cell?.explored) continue;

        const sx = originX + (tx * this.tileSize - worldPixelW / 2) * scale;
        const sy = originY + (ty * this.tileSize - worldPixelH / 2) * scale;
        const sw = this.tileSize * scale * step;

        if (sx + sw < panelX || sx > panelX + this.mapSize) continue;
        if (sy + sw < panelY || sy > panelY + this.mapSize) continue;

        this.fogGraphics.fillStyle(0x000000, 0.85);
        this.fogGraphics.fillRect(sx, sy, Math.max(1, sw), Math.max(1, sw));
      }
    }

    // ── Draw markers ────────────────────────────────────────
    this.markerGraphics.clear();
    for (const marker of this.markers) {
      const mx = originX + (marker.x - worldPixelW / 2) * scale;
      const my = originY + (marker.y - worldPixelH / 2) * scale;

      // Only draw if within panel
      if (mx < panelX || mx > panelX + this.mapSize) continue;
      if (my < panelY || my > panelY + this.mapSize) continue;

      this.markerGraphics.fillStyle(marker.color, 1);
      this.markerGraphics.fillCircle(mx, my, marker.type === 'player' ? 5 : 3);
    }

    // ── Draw player position ────────────────────────────────
    const px = originX + (this.playerX - worldPixelW / 2) * scale;
    const py = originY + (this.playerY - worldPixelH / 2) * scale;
    this.markerGraphics.fillStyle(0xffffff, 1);
    this.markerGraphics.fillTriangle(px, py - 6, px - 4, py + 2, px + 4, py + 2);
  }

  destroy(): void {
    this.container.destroy();
  }
}
