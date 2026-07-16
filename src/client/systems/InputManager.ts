// ============================================================
// Nexus Realms — Input Manager
// Handles keyboard + mouse input, dispatches actions
// ============================================================

import Phaser from 'phaser';
import { Direction } from '../../shared/types';
import { angleToDirection } from '../utils/MathUtils';

// ─── Action Types ────────────────────────────────────────────
export interface MoveAction {
  type: 'move';
  dx: number;
  dy: number;
}

export interface MoveToPointAction {
  type: 'move_to_point';
  worldX: number;
  worldY: number;
}

export interface AbilityAction {
  type: 'ability';
  slot: number; // 0-9
}

export interface TargetAction {
  type: 'target';
  entityId: string | null;
}

export interface InteractAction {
  type: 'interact';
  targetId: string;
}

export interface UIAction {
  type: 'ui_toggle';
  panel: 'inventory' | 'character' | 'map' | 'skills' | 'menu';
}

export type InputAction =
  | MoveAction
  | MoveToPointAction
  | AbilityAction
  | TargetAction
  | InteractAction
  | UIAction;

export type InputCallback = (action: InputAction) => void;

// ─── Input Manager ───────────────────────────────────────────
export class InputManager {
  private scene: Phaser.Scene;
  private callback: InputCallback | null = null;

  // Key references
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  // Mouse state
  private moveTarget: { worldX: number; worldY: number } | null = null;
  private isMovingToTarget: boolean = false;

  // Movement state
  private moveDirection: { dx: number; dy: number } = { dx: 0, dy: 0 };

  // UI open state (suppress game input when UI is open)
  private uiOpen: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeys();
    this.setupMouse();
  }

  /** Register a callback for input actions */
  setInputCallback(cb: InputCallback): void {
    this.callback = cb;
  }

  /** Set whether a UI panel is open (suppresses game input) */
  setUIOpen(open: boolean): void {
    this.uiOpen = open;
  }

  /** Call every frame from the game scene */
  update(): void {
    if (this.uiOpen) return;

    this.processMovementKeys();
  }

  /** Get the current movement direction vector (normalized) */
  getMovementVector(): { dx: number; dy: number } {
    return { ...this.moveDirection };
  }

  /** Is the player currently moving to a click point? */
  isClickMoving(): boolean {
    return this.isMovingToTarget;
  }

  /** Get the current click-to-move target */
  getMoveTarget(): { worldX: number; worldY: number } | null {
    return this.moveTarget;
  }

  /** Clear click-to-move state (called when player reaches target or starts keyboard move) */
  clearClickMove(): void {
    this.isMovingToTarget = false;
    this.moveTarget = null;
  }

  // ─── Setup ────────────────────────────────────────────────

  private setupKeys(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    this.keys = {};

    // Movement
    this.keys.W = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keys.A = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keys.S = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keys.D = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keys.UP = kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keys.DOWN = kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keys.LEFT = kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keys.RIGHT = kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    // Ability hotkeys (1-0)
    for (let i = 0; i < 10; i++) {
      const keyCode = i === 0
        ? Phaser.Input.Keyboard.KeyCodes.ZERO
        : Phaser.Input.Keyboard.KeyCodes.ONE + i;
      this.keys[`NUM_${i}`] = kb.addKey(keyCode);
    }

    // UI toggles
    this.keys.I = kb.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keys.C = kb.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.keys.M = kb.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.keys.K = kb.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.keys.ESC = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keys.TAB = kb.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);

    // Ability keys (press handlers)
    for (let i = 0; i < 10; i++) {
      const key = this.keys[`NUM_${i}`];
      if (key) {
        key.on('down', () => {
          if (!this.uiOpen) {
            this.emit({ type: 'ability', slot: i });
          }
        });
      }
    }

    // UI toggle keys (press handlers)
    this.keys.I.on('down', () => this.emit({ type: 'ui_toggle', panel: 'inventory' }));
    this.keys.C.on('down', () => this.emit({ type: 'ui_toggle', panel: 'character' }));
    this.keys.M.on('down', () => this.emit({ type: 'ui_toggle', panel: 'map' }));
    this.keys.K.on('down', () => this.emit({ type: 'ui_toggle', panel: 'skills' }));
    this.keys.ESC.on('down', () => this.emit({ type: 'ui_toggle', panel: 'menu' }));

    // Tab = cycle targets
    this.keys.TAB.on('down', () => {
      if (!this.uiOpen) {
        this.emit({ type: 'target', entityId: null }); // null = cycle
      }
    });
  }

  private setupMouse(): void {
    // Left click = move to point or interact
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.uiOpen) return;
      if (pointer.rightButtonDown()) {
        // Right-click: context menu (future)
        return;
      }

      const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

      // If clicking on an entity, interact. Otherwise move to point.
      // The scene will handle entity hit-testing
      this.moveTarget = { worldX: worldPoint.x, worldY: worldPoint.y };
      this.isMovingToTarget = true;

      this.emit({
        type: 'move_to_point',
        worldX: worldPoint.x,
        worldY: worldPoint.y,
      });
    });
  }

  // ─── Movement Processing ──────────────────────────────────

  private processMovementKeys(): void {
    let dx = 0;
    let dy = 0;

    if (this.keys.W?.isDown || this.keys.UP?.isDown) dy = -1;
    if (this.keys.S?.isDown || this.keys.DOWN?.isDown) dy = 1;
    if (this.keys.A?.isDown || this.keys.LEFT?.isDown) dx = -1;
    if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) dx = 1;

    // If any movement key is pressed, cancel click-to-move
    if (dx !== 0 || dy !== 0) {
      this.clearClickMove();

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const invSqrt2 = 1 / Math.SQRT2;
        dx *= invSqrt2;
        dy *= invSqrt2;
      }

      this.moveDirection = { dx, dy };
      this.emit({ type: 'move', dx, dy });
    } else {
      this.moveDirection = { dx: 0, dy: 0 };
    }
  }

  // ─── Helpers ──────────────────────────────────────────────

  /** Convert a dx/dy movement vector to a Direction enum value */
  static vectorToDirection(dx: number, dy: number): Direction {
    if (dx === 0 && dy === 0) return Direction.DOWN;

    const angle = Math.atan2(dy, dx);
    const dirIndex = angleToDirection(angle);

    const dirMap: Direction[] = [
      Direction.RIGHT,
      Direction.DOWN_RIGHT,
      Direction.DOWN,
      Direction.DOWN_LEFT,
      Direction.LEFT,
      Direction.UP_LEFT,
      Direction.UP,
      Direction.UP_RIGHT,
    ];

    return dirMap[dirIndex] ?? Direction.DOWN;
  }

  private emit(action: InputAction): void {
    this.callback?.(action);
  }

  destroy(): void {
    // Keys are auto-cleaned by Phaser scene shutdown
    this.callback = null;
  }
}
