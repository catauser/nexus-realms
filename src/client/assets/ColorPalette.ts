// ============================================================
// Nexus Realms — Color Palette
// Consistent color definitions for all procedurally generated art
// ============================================================

import { ClassType, ItemRarity } from '../../shared/types';

// ─── Color Helper ────────────────────────────────────────────
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
}

export function lerpColor(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(
    ca.r + (cb.r - ca.r) * t,
    ca.g + (cb.g - ca.g) * t,
    ca.b + (cb.b - ca.b) * t,
  );
}

// ─── Skin Tones ──────────────────────────────────────────────
export const SKIN_TONES = {
  lightest: '#fde7c8',
  light:    '#f5ce9f',
  medium:   '#d4a574',
  tan:      '#b8834a',
  brown:    '#8b5e3c',
  dark:     '#5c3a21',
} as const;

// ─── Class Armor Colors ──────────────────────────────────────
export const CLASS_COLORS: Record<ClassType, {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}> = {
  [ClassType.WARRIOR]: {
    primary:   '#7a7a7a',  // steel gray
    secondary: '#555555',
    accent:    '#c0c0c0',
    glow:      '#ffffff',
  },
  [ClassType.PALADIN]: {
    primary:   '#ffd700',  // gold
    secondary: '#b8860b',
    accent:    '#fffacd',
    glow:      '#ffec8b',
  },
  [ClassType.RANGER]: {
    primary:   '#2e7d32',  // forest green
    secondary: '#4a3728',
    accent:    '#66bb6a',
    glow:      '#a5d6a7',
  },
  [ClassType.ROGUE]: {
    primary:   '#2c2c2c',  // dark leather
    secondary: '#1a1a1a',
    accent:    '#8b0000',
    glow:      '#ff4444',
  },
  [ClassType.MAGE]: {
    primary:   '#1565c0',  // arcane blue
    secondary: '#0d47a1',
    accent:    '#64b5f6',
    glow:      '#90caf9',
  },
  [ClassType.NECROMANCER]: {
    primary:   '#311b5e',  // dark purple
    secondary: '#1a0a3e',
    accent:    '#7c4dff',
    glow:      '#b388ff',
  },
  [ClassType.CLERIC]: {
    primary:   '#f5f5f5',  // holy white
    secondary: '#e0e0e0',
    accent:    '#ffd700',
    glow:      '#fff9c4',
  },
  [ClassType.DRUID]: {
    primary:   '#5d4037',  // earth brown
    secondary: '#33691e',
    accent:    '#8bc34a',
    glow:      '#c5e1a5',
  },
};

// ─── Monster Colors ──────────────────────────────────────────
export const MONSTER_COLORS = {
  wolf:       { primary: '#6b6b6b', secondary: '#4a4a4a', accent: '#ff6600', eye: '#ffcc00' },
  goblin:     { primary: '#4caf50', secondary: '#2e7d32', accent: '#ff9800', eye: '#ff0000' },
  skeleton:   { primary: '#e0d8c8', secondary: '#b8b0a0', accent: '#8b8378', eye: '#333333' },
  dragon:     { primary: '#8b0000', secondary: '#b22222', accent: '#ff4500', eye: '#ffd700' },
  spider:     { primary: '#2c2c2c', secondary: '#1a1a1a', accent: '#00ff00', eye: '#ff0000' },
  bandit:     { primary: '#4a3728', secondary: '#2c1e11', accent: '#c0c0c0', eye: '#ffffff' },
  elemental:  { primary: '#00bcd4', secondary: '#0097a7', accent: '#b2ff59', eye: '#ffffff' },
  slime:      { primary: '#7b1fa2', secondary: '#4a148c', accent: '#ce93d8', eye: '#ffffff' },
  bear:       { primary: '#5d4037', secondary: '#3e2723', accent: '#d7ccc8', eye: '#333333' },
  boss_generic: { primary: '#b71c1c', secondary: '#7f0000', accent: '#ff5252', eye: '#ffd700' },
} as const;

// ─── NPC Colors ──────────────────────────────────────────────
export const NPC_COLORS = {
  merchant:   { primary: '#8d6e63', secondary: '#5d4037', accent: '#ffcc02', skin: SKIN_TONES.medium },
  questGiver: { primary: '#3f51b5', secondary: '#283593', accent: '#ffeb3b', skin: SKIN_TONES.light },
  guard:      { primary: '#607d8b', secondary: '#455a64', accent: '#cfd8dc', skin: SKIN_TONES.tan },
  blacksmith: { primary: '#455a64', secondary: '#263238', accent: '#ff6e40', skin: SKIN_TONES.brown },
} as const;

// ─── Terrain Colors ──────────────────────────────────────────
export const TERRAIN_COLORS = {
  grass:       ['#4caf50', '#43a047', '#388e3c'],
  dirt:        ['#8d6e63', '#795548', '#6d4c41'],
  stoneFloor:  ['#78909c', '#607d8b', '#546e7a'],
  sand:        ['#ffe0b2', '#ffcc80'],
  snow:        ['#eceff1', '#e0e0e0'],
  water:       ['#1e88e5', '#1976d2', '#1565c0', '#0d47a1'],
  lava:        ['#ff5722', '#ff6f00', '#ff9800', '#ffc107'],
  swamp:       ['#33691e', '#2e4a1e'],
  wall_stone:  ['#616161', '#424242'],
  wall_wood:   ['#795548', '#5d4037'],
} as const;

// ─── Object Colors ───────────────────────────────────────────
export const OBJECT_COLORS = {
  tree_oak:    { trunk: '#5d4037', leaves: '#2e7d32', highlight: '#66bb6a' },
  tree_pine:   { trunk: '#4e342e', leaves: '#1b5e20', highlight: '#43a047' },
  tree_dead:   { trunk: '#6d4c41', leaves: '#9e9e9e', highlight: '#bdbdbd' },
  rock:        '#78909c',
  bush:        '#388e3c',
  flower_red:  '#f44336',
  flower_blue: '#42a5f5',
  flower_yellow: '#ffee58',
  chest_wood:  '#8d6e63',
  chest_gold:  '#ffd700',
  torch:       { base: '#5d4037', flame: '#ff9800', glow: '#ffeb3b' },
  sign:        '#a1887f',
  barrel:      '#6d4c41',
  crate:       '#8d6e63',
  fence_wood:  '#795548',
  fence_iron:  '#9e9e9e',
  bridge:      '#5d4037',
  door_closed: '#6d4c41',
  door_open:   '#3e2723',
} as const;

// ─── UI Colors ───────────────────────────────────────────────
export const UI_COLORS = {
  health:      '#f44336',
  health_low:  '#b71c1c',
  mana:        '#2196f3',
  mana_low:    '#0d47a1',
  xp:          '#4caf50',
  stamina_bar: '#ff9800',
  background:  '#1a1a2e',
  panel:       '#16213e',
  panel_light: '#1a2744',
  border:      '#0f3460',
  border_gold: '#e94560',
  text:        '#e0e0e0',
  text_dim:    '#9e9e9e',
  text_bright: '#ffffff',
  text_gold:   '#ffd700',
  text_red:    '#ff5252',
  text_green:  '#69f0ae',
  button:      '#0f3460',
  button_hover:'#1a4a8a',
  shadow:      'rgba(0,0,0,0.5)',
} as const;

// ─── Rarity Colors (mapped from shared/types) ────────────────
export const RARITY_GLOW: Record<ItemRarity, string> = {
  [ItemRarity.COMMON]:    '#666666',
  [ItemRarity.UNCOMMON]:  '#1eff00',
  [ItemRarity.RARE]:      '#0070dd',
  [ItemRarity.EPIC]:      '#a335ee',
  [ItemRarity.LEGENDARY]: '#ff8000',
  [ItemRarity.MYTHIC]:    '#e6cc80',
};

// ─── Effect Colors ───────────────────────────────────────────
export const EFFECT_COLORS = {
  hit_spark:     ['#ffffff', '#ffff00', '#ff8800'],
  fire:          ['#ff4500', '#ff6600', '#ff9900', '#ffcc00'],
  ice:           ['#00bcd4', '#80deea', '#e0f7fa', '#ffffff'],
  shadow:        ['#4a148c', '#7b1fa2', '#9c27b0', '#ce93d8'],
  heal:          ['#00e676', '#69f0ae', '#b9f6ca', '#ffffff'],
  level_up:      ['#ffd700', '#ffec8b', '#ffffff'],
  buff_apply:    ['#42a5f5', '#90caf9', '#ffffff'],
  death:         ['#616161', '#9e9e9e', '#bdbdbd', '#e0e0e0'],
  loot_sparkle:  ['#ffd700', '#ffec8b', '#ffffff'],
  portal:        ['#7c4dff', '#b388ff', '#e040fb', '#ea80fc'],
  damage_number: '#ff5252',
  heal_number:   '#69f0ae',
  crit_number:   '#ffd700',
} as const;

// ─── Weather Tint Colors ─────────────────────────────────────
export const WEATHER_TINTS = {
  clear:     { tint: 0xffffff, alpha: 0 },
  rain:      { tint: 0x6688aa, alpha: 0.15 },
  storm:     { tint: 0x334455, alpha: 0.3 },
  snow:      { tint: 0xddeeff, alpha: 0.1 },
  fog:       { tint: 0xaaaaaa, alpha: 0.35 },
  sandstorm: { tint: 0xccaa66, alpha: 0.25 },
} as const;

// ─── Day/Night Cycle Colors ──────────────────────────────────
export const DAY_NIGHT = {
  dawn:      { tint: 0xffcc88, ambient: 0.7 },
  day:       { tint: 0xffffff, ambient: 1.0 },
  dusk:      { tint: 0xff8844, ambient: 0.6 },
  night:     { tint: 0x223366, ambient: 0.35 },
  midnight:  { tint: 0x112244, ambient: 0.2 },
} as const;

// ─── Dungeon Colors ──────────────────────────────────────────
export const DUNGEON_COLORS = {
  stone_wall:  ['#424242', '#303030', '#212121'],
  pillar:      '#616161',
  altar:       '#455a64',
  trap:        '#ff5722',
  portal_glow: '#7c4dff',
  moss:        '#2e7d32',
  cobweb:      '#e0e0e0',
  blood:       '#b71c1c',
} as const;
