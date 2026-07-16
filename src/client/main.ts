// ============================================================
// Nexus Realms — Client Entry Point
// Phaser 3 Game Configuration & Bootstrap
// ============================================================
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { LoginScene } from './scenes/LoginScene';
import { GameScene } from './scenes/GameScene';
import { GAME_CONFIG } from '@shared/types';
import { SoundManager } from './systems/SoundManager';

/**
 * Update the HTML loading screen progress bar
 */
function updateLoadingScreen(progress: number, text: string): void {
  // Use the NexusLoading API exposed in index.html
  const nexus = (window as unknown as { NexusLoading?: { setProgress(pct: number, text: string): void; hide(): void } }).NexusLoading;
  if (nexus) {
    nexus.setProgress(progress, text);
  } else {
    const bar = document.getElementById('nr-loading-bar');
    const label = document.getElementById('nr-loading-text');
    if (bar) bar.style.width = `${progress}%`;
    if (label) label.textContent = text;
  }
}

/**
 * Phaser game configuration
 */
const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.VIEWPORT_WIDTH,
  height: GAME_CONFIG.VIEWPORT_HEIGHT,
  backgroundColor: '#0a0a1a',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
      fixedStep: true,
      fps: GAME_CONFIG.CLIENT_FPS,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 800,
      height: 600,
    },
    max: {
      width: 2560,
      height: 1440,
    },
  },
  scene: [BootScene, LoginScene, GameScene],
  input: {
    keyboard: true,
    mouse: true,
    touch: false,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
};

/**
 * Bootstrap the game
 */
function init(): void {
  updateLoadingScreen(10, 'Initializing engine...');

  // Create the Phaser game instance
  const game = new Phaser.Game(gameConfig);

  // Initialize sound manager
  const soundManager = new SoundManager();
  (game as Phaser.Game & { __soundManager?: SoundManager }).__soundManager = soundManager;

  // Init sound on first user interaction
  const initSound = () => {
    soundManager.init();
    soundManager.resume();
    document.removeEventListener('click', initSound);
    document.removeEventListener('keydown', initSound);
  };
  document.addEventListener('click', initSound);
  document.addEventListener('keydown', initSound);

  // Game is ready
  game.events.once('ready', () => {
    updateLoadingScreen(100, 'Ready!');
    setTimeout(() => {
      const nexus = (window as unknown as { NexusLoading?: { hide(): void } }).NexusLoading;
      if (nexus) {
        nexus.hide();
      } else {
        const loadingScreen = document.getElementById('nr-loading-screen');
        if (loadingScreen) {
          loadingScreen.classList.add('fade-out');
          setTimeout(() => { loadingScreen.style.display = 'none'; }, 600);
        }
      }
    }, 300);
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('[NexusRealms] Unhandled error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[NexusRealms] Unhandled promise rejection:', event.reason);
  });

  // Expose game for debugging (dev only)
  if (import.meta.env?.DEV) {
    (window as unknown as Record<string, unknown>).__GAME__ = game;
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
