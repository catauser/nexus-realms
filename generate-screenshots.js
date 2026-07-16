// ============================================================
// Nexus Realms — Screenshot Generator
// Renders game UI screens as PNG images using node-canvas
// ============================================================
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1280;
const H = 720;
const outputDir = path.join(__dirname, 'screenshots');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function saveCanvas(canvas, name) {
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, name), buffer);
  console.log(`  ✅ ${name} (${(buffer.length / 1024).toFixed(1)}KB)`);
}

// ─── Color Palette ───────────────────────────────────────────
const COLORS = {
  bg: '#0a0a1a',
  bgLight: '#1a1a2e',
  purple: '#7b68ee',
  purpleLight: '#9d8eff',
  purpleDark: '#5a4cd4',
  gold: '#ffd700',
  red: '#ff4444',
  redDark: '#8b0000',
  green: '#00ff00',
  greenDark: '#008800',
  blue: '#4488ff',
  blueDark: '#00008b',
  white: '#e0e0e0',
  gray: '#888888',
  grayDark: '#444466',
  grayDarker: '#2a2a3e',
  // Rarity
  common: '#9d9d9d',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000',
  mythic: '#e6cc80',
};

// ─── Helper Functions ────────────────────────────────────────
function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBar(ctx, x, y, w, h, pct, color1, color2, borderColor) {
  // Background
  drawRoundedRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = 'rgba(26,26,46,0.9)';
  ctx.fill();
  ctx.strokeStyle = borderColor || 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Fill
  if (pct > 0) {
    drawRoundedRect(ctx, x + 1, y + 1, (w - 2) * pct, h - 2, (h - 2) / 2);
    const grad = ctx.createLinearGradient(x, y, x + w * pct, y);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

function drawPanel(ctx, x, y, w, h, options = {}) {
  const { alpha = 0.85, border = true, borderColor = COLORS.purple } = options;
  drawRoundedRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = `rgba(10,10,26,${alpha})`;
  ctx.fill();
  if (border) {
    ctx.strokeStyle = borderColor + '44';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawText(ctx, text, x, y, options = {}) {
  const { size = 14, color = COLORS.white, align = 'left', font = 'Segoe UI, sans-serif', bold = false } = options;
  ctx.font = `${bold ? 'bold ' : ''}${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function drawSlot(ctx, x, y, size, borderColor, icon, qty) {
  drawRoundedRect(ctx, x, y, size, size, 4);
  ctx.fillStyle = COLORS.bgLight;
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (icon) {
    ctx.font = `${size * 0.5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, x + size / 2, y + size / 2);
  }
  if (qty && qty > 1) {
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(String(qty), x + size - 4, y + size - 3);
  }
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 1: LOGIN
// ═══════════════════════════════════════════════════════════════
function renderLogin() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0a0a1a');
  grad.addColorStop(0.5, '#1a1a2e');
  grad.addColorStop(1, '#0a0a1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative particles
  for (let i = 0; i < 50; i++) {
    const px = Math.random() * W;
    const py = Math.random() * H;
    const r = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(123,104,238,${Math.random() * 0.3 + 0.1})`;
    ctx.fill();
  }

  // Glowing lines
  ctx.strokeStyle = 'rgba(123,104,238,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * W, 0);
    ctx.lineTo(Math.random() * W, H);
    ctx.stroke();
  }

  // Center panel
  const pw = 400, ph = 420;
  const px = (W - pw) / 2, py = (H - ph) / 2 - 20;
  drawPanel(ctx, px, py, pw, ph, { alpha: 0.92 });

  // Glow effect around panel
  ctx.shadowColor = COLORS.purple;
  ctx.shadowBlur = 30;
  drawRoundedRect(ctx, px, py, pw, ph, 8);
  ctx.strokeStyle = COLORS.purple + '33';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Title
  ctx.font = 'bold 42px serif';
  ctx.fillStyle = COLORS.purple;
  ctx.textAlign = 'center';
  ctx.shadowColor = COLORS.purple;
  ctx.shadowBlur = 20;
  ctx.fillText('⚔️ NEXUS REALMS', W / 2, py + 60);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.font = '14px sans-serif';
  ctx.fillStyle = COLORS.gray;
  ctx.textAlign = 'center';
  ctx.fillText('Enter the realm of legends', W / 2, py + 90);

  // Username input
  const ix = px + 40, iy = py + 130, iw = pw - 80, ih = 44;
  drawRoundedRect(ctx, ix, iy, iw, ih, 8);
  ctx.fillStyle = COLORS.bgLight;
  ctx.fill();
  ctx.strokeStyle = COLORS.purple + '44';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = '14px sans-serif';
  ctx.fillStyle = COLORS.gray;
  ctx.textAlign = 'left';
  ctx.fillText('Username', ix + 16, iy + 22);

  // Password input
  const iy2 = iy + 60;
  drawRoundedRect(ctx, ix, iy2, iw, ih, 8);
  ctx.fillStyle = COLORS.bgLight;
  ctx.fill();
  ctx.strokeStyle = COLORS.purple + '44';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = COLORS.gray;
  ctx.fillText('Password', ix + 16, iy2 + 22);

  // Login button
  const btnY = iy2 + 80;
  drawRoundedRect(ctx, ix, btnY, iw, ih + 6, 8);
  const btnGrad = ctx.createLinearGradient(ix, btnY, ix + iw, btnY);
  btnGrad.addColorStop(0, COLORS.purple);
  btnGrad.addColorStop(1, COLORS.purpleDark);
  ctx.fillStyle = btnGrad;
  ctx.fill();
  ctx.shadowColor = COLORS.purple;
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('ENTER REALM', W / 2, btnY + 26);

  // Register link
  ctx.font = '12px sans-serif';
  ctx.fillStyle = COLORS.purple;
  ctx.textAlign = 'center';
  ctx.fillText("Don't have an account? Register", W / 2, btnY + 60);

  // Version
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#444';
  ctx.textAlign = 'center';
  ctx.fillText('v0.1.0 • Nexus Realms Server', W / 2, py + ph - 15);

  // Server status
  ctx.beginPath();
  ctx.arc(px + pw - 60, py + ph - 15, 4, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.green;
  ctx.fill();
  ctx.font = '10px sans-serif';
  ctx.fillStyle = COLORS.green;
  ctx.textAlign = 'left';
  ctx.fillText('Online', px + pw - 52, py + ph - 14);

  saveCanvas(canvas, '01-login.png');
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 2: GAME HUD
// ═══════════════════════════════════════════════════════════════
function renderHUD() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Game world background (grass)
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#2d5a1e');
  grad.addColorStop(0.6, '#3a6b2a');
  grad.addColorStop(1, '#2a4f1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Grid lines (tilemap)
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Trees
  const treePositions = [[100, 200], [250, 150], [800, 100], [1050, 250], [600, 500], [150, 450]];
  for (const [tx, ty] of treePositions) {
    // Trunk
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(tx - 4, ty, 8, 20);
    // Leaves
    ctx.beginPath();
    ctx.arc(tx, ty - 8, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#2a7a1a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tx - 8, ty - 2, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#3a8a2a';
    ctx.fill();
  }

  // Player character (center)
  const cx = W / 2, cy = H / 2;
  // Shadow
  ctx.beginPath();
  ctx.ellipse(cx, cy + 20, 14, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();
  // Body
  ctx.fillStyle = '#4a6a8a';
  drawRoundedRect(ctx, cx - 10, cy - 14, 20, 28, 4);
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - 20, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#d4a574';
  ctx.fill();
  // Helmet
  ctx.beginPath();
  ctx.arc(cx, cy - 22, 11, Math.PI, 0);
  ctx.fillStyle = '#6a6a8a';
  ctx.fill();
  // Sword
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(cx + 12, cy - 20, 3, 30);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(cx + 10, cy - 2, 7, 4);

  // Monster (goblin)
  const gx = cx + 120, gy = cy - 30;
  ctx.beginPath();
  ctx.ellipse(gx, gy + 18, 12, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();
  ctx.fillStyle = '#4a8a3a';
  drawRoundedRect(ctx, gx - 8, gy - 10, 16, 22, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(gx, gy - 16, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#5aaa4a';
  ctx.fill();
  // Goblin eyes
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(gx - 4, gy - 18, 3, 3);
  ctx.fillRect(gx + 1, gy - 18, 3, 3);
  // Health bar above goblin
  drawBar(ctx, gx - 20, gy - 30, 40, 6, 0.45, COLORS.redDark, COLORS.red, 'rgba(255,0,0,0.3)');

  // ─── HUD OVERLAY ─────────────────────────────────────────

  // Player Frame (top-left)
  drawPanel(ctx, 12, 12, 240, 70);
  // Portrait
  drawRoundedRect(ctx, 20, 20, 44, 44, 22);
  ctx.fillStyle = '#4a6a8a';
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚔️', 42, 44);
  // Name & Level
  drawText(ctx, 'HeroName', 74, 30, { size: 14, color: COLORS.gold, bold: true });
  drawText(ctx, 'Level 25 Warrior', 74, 48, { size: 11, color: COLORS.gray });
  // HP Bar
  drawBar(ctx, 74, 58, 170, 14, 0.75, COLORS.redDark, COLORS.red, 'rgba(255,0,0,0.3)');
  drawText(ctx, '3,750 / 5,000', 159, 65, { size: 9, color: '#fff', align: 'center' });
  // Mana Bar
  drawBar(ctx, 74, 74, 170, 10, 0.60, COLORS.blueDark, COLORS.blue, 'rgba(0,100,255,0.3)');

  // Target Frame (top-center)
  const tfx = (W - 280) / 2;
  drawPanel(ctx, tfx, 12, 280, 56);
  drawText(ctx, '🔥 Goblin Warrior', tfx + 140, 28, { size: 14, color: COLORS.red, align: 'center', bold: true });
  drawText(ctx, 'Level 12', tfx + 140, 44, { size: 11, color: COLORS.gray, align: 'center' });
  drawBar(ctx, tfx + 15, 52, 250, 10, 0.45, COLORS.redDark, COLORS.red, 'rgba(255,0,0,0.3)');

  // Minimap (top-right)
  drawPanel(ctx, W - 172, 12, 160, 160);
  drawText(ctx, 'MINIMAP', W - 92, 26, { size: 10, color: COLORS.purple, align: 'center', bold: true });
  // Minimap terrain
  drawRoundedRect(ctx, W - 162, 32, 140, 120, 4);
  ctx.fillStyle = 'rgba(34,80,34,0.4)';
  ctx.fill();
  // Player dot
  ctx.beginPath();
  ctx.arc(W - 92, 92, 4, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.gold;
  ctx.fill();
  ctx.shadowColor = COLORS.gold;
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;
  // Enemy dots
  ctx.beginPath();
  ctx.arc(W - 72, 72, 3, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.red;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W - 112, 102, 3, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.red;
  ctx.fill();

  // Buffs (below player frame)
  const buffs = [
    { icon: '🍖', name: 'Well Fed', color: COLORS.green },
    { icon: '✨', name: 'Arcane Intellect', color: COLORS.blue },
    { icon: '🛡️', name: 'Shield Wall', color: COLORS.gold },
  ];
  buffs.forEach((b, i) => {
    const bx = 12 + i * 34;
    drawRoundedRect(ctx, bx, 90, 30, 30, 4);
    ctx.fillStyle = b.color + '22';
    ctx.fill();
    ctx.strokeStyle = b.color + '66';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.icon, bx + 15, 106);
  });

  // Quest Tracker (right side)
  drawPanel(ctx, W - 222, 185, 210, 160);
  drawText(ctx, '📋 QUEST TRACKER', W - 117, 200, { size: 11, color: COLORS.gold, align: 'center', bold: true });
  drawText(ctx, 'The Village in Peril', W - 210, 222, { size: 11, color: COLORS.purple, bold: true });
  drawText(ctx, 'Kill Wolves: 3/5', W - 200, 238, { size: 10, color: COLORS.green });
  drawText(ctx, 'Gathering Supplies', W - 210, 262, { size: 11, color: COLORS.purple, bold: true });
  drawText(ctx, 'Peacebloom: 2/3', W - 200, 278, { size: 10, color: COLORS.green });
  drawText(ctx, 'Copper Ore: 0/2', W - 200, 294, { size: 10, color: COLORS.red });
  drawText(ctx, 'The Corruption Spreads', W - 210, 318, { size: 11, color: COLORS.purple, bold: true });
  drawText(ctx, 'Explore: ???', W - 200, 334, { size: 10, color: COLORS.gray });

  // Ability Bar (bottom-center)
  const abW = 520, abH = 60;
  const abX = (W - abW) / 2, abY = H - abH - 12;
  drawPanel(ctx, abX, abY, abW, abH, { alpha: 0.92 });

  const abilities = [
    { key: '1', icon: '⚔️', name: 'Slash', cd: 0 },
    { key: '2', icon: '🛡️', name: 'Shield Block', cd: 0 },
    { key: '3', icon: '🔥', name: 'Rend', cd: 2.5 },
    { key: '4', icon: '❄️', name: 'Whirlwind', cd: 0 },
    { key: '5', icon: '💚', name: 'Heal', cd: 0 },
    { key: '6', icon: '⚡', name: 'Execute', cd: 8 },
    { key: '7', icon: '🌙', name: 'Charge', cd: 12 },
    { key: '8', icon: '💀', name: 'Ultimate', cd: 45 },
  ];

  abilities.forEach((a, i) => {
    const sx = abX + 12 + i * 62;
    const sy = abY + 8;
    const ss = 44;

    drawRoundedRect(ctx, sx, sy, ss, ss, 6);
    const slotGrad = ctx.createLinearGradient(sx, sy, sx, sy + ss);
    slotGrad.addColorStop(0, '#2d1b69');
    slotGrad.addColorStop(1, '#1a1040');
    ctx.fillStyle = slotGrad;
    ctx.fill();
    ctx.strokeStyle = a.cd > 0 ? COLORS.purple + '44' : COLORS.purple;
    ctx.lineWidth = a.cd > 0 ? 1 : 2;
    ctx.stroke();

    // Icon
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.globalAlpha = a.cd > 0 ? 0.4 : 1;
    ctx.fillText(a.icon, sx + ss / 2, sy + ss / 2);
    ctx.globalAlpha = 1;

    // Cooldown overlay
    if (a.cd > 0) {
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = COLORS.white;
      ctx.fillText(`${a.cd}s`, sx + ss / 2, sy + ss / 2);
    }

    // Key binding
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = 'right';
    ctx.fillText(a.key, sx + ss - 4, sy + ss - 4);
  });

  // Chat (bottom-left)
  drawPanel(ctx, 12, H - 160, 320, 148, { alpha: 0.85 });
  const chatLines = [
    { ch: 'General', color: '#aaa', name: 'Player1', msg: 'Anyone want to group?' },
    { ch: 'Guild', color: COLORS.green, name: 'GuildMaster', msg: 'Raid tonight at 8pm!' },
    { ch: 'Combat', color: COLORS.red, msg: 'You hit Goblin for 245 damage!' },
    { ch: 'Combat', color: COLORS.gold, msg: 'CRITICAL! You hit Goblin for 512!' },
    { ch: 'Say', color: '#ccc', name: 'Merchant', msg: 'Welcome to my shop!' },
  ];
  chatLines.forEach((l, i) => {
    const ly = H - 148 + i * 24;
    drawText(ctx, `[${l.ch}]`, 24, ly, { size: 11, color: l.color });
    if (l.name) drawText(ctx, `${l.name}:`, 80, ly, { size: 11, color: COLORS.purple });
    drawText(ctx, l.msg, l.name ? 140 : 80, ly, { size: 11, color: '#ccc' });
  });

  // XP Bar (very bottom)
  drawBar(ctx, 0, H - 6, W, 6, 0.35, COLORS.gold, '#ffaa00', 'transparent');

  // Damage numbers floating
  ctx.font = 'bold 36px serif';
  ctx.fillStyle = COLORS.red;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(255,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.fillText('-245', cx + 120, cy - 80);
  ctx.shadowBlur = 0;

  ctx.font = 'bold 48px serif';
  ctx.fillStyle = COLORS.gold;
  ctx.shadowColor = 'rgba(255,215,0,0.5)';
  ctx.shadowBlur = 15;
  ctx.fillText('-512!', cx + 80, cy - 120);
  ctx.shadowBlur = 0;

  // Heal number
  ctx.font = 'bold 28px serif';
  ctx.fillStyle = COLORS.green;
  ctx.shadowColor = 'rgba(0,255,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.fillText('+180', cx - 40, cy - 60);
  ctx.shadowBlur = 0;

  saveCanvas(canvas, '02-game-hud.png');
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 3: INVENTORY
// ═══════════════════════════════════════════════════════════════
function renderInventory() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // Grid pattern
  ctx.strokeStyle = 'rgba(123,104,238,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Main inventory panel
  const pw = 700, ph = 500;
  const px = (W - pw) / 2, py = (H - ph) / 2;
  drawPanel(ctx, px, py, pw, ph, { alpha: 0.95 });

  // Title
  drawText(ctx, '⚔️ CHARACTER & INVENTORY', W / 2, py + 24, { size: 18, color: COLORS.gold, align: 'center', bold: true });

  // ─── Equipment Section (left) ─────────────────────────────
  const eqX = px + 30, eqY = py + 60;
  drawText(ctx, 'EQUIPMENT', eqX + 75, eqY, { size: 11, color: COLORS.purple, align: 'center', bold: true });

  const equipSlots = [
    { x: 1, y: 0, icon: '👑', border: COLORS.legendary, name: 'Crown of Ages' },
    { x: 0, y: 1, icon: '📿', border: COLORS.epic, name: 'Amulet of Power' },
    { x: 2, y: 1, icon: '🛡️', border: COLORS.rare, name: 'Iron Shield' },
    { x: 1, y: 1, icon: '⚔️', border: COLORS.legendary, name: 'Flamestrike Sword' },
    { x: 0, y: 2, icon: '👕', border: COLORS.epic, name: 'Dragon Scale Mail' },
    { x: 2, y: 2, icon: '👖', border: COLORS.rare, name: 'Mithril Leggings' },
    { x: 0, y: 3, icon: '👢', border: COLORS.rare, name: 'Boots of Speed' },
    { x: 2, y: 3, icon: '💍', border: COLORS.uncommon, name: 'Ring of Strength' },
    { x: 1, y: 3, icon: '🧤', border: COLORS.epic, name: 'Gauntlets of Fury' },
  ];

  equipSlots.forEach(s => {
    drawSlot(ctx, eqX + s.x * 58, eqY + 20 + s.y * 58, 50, s.border, s.icon);
  });

  // Character preview (center of equip area)
  const charX = eqX + 58, charY = eqY + 120;
  ctx.font = '80px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚔️', charX + 25, charY + 50);

  // ─── Stats Section ────────────────────────────────────────
  const statsX = eqX + 200, statsY = py + 60;
  drawText(ctx, 'STATS', statsX, statsY, { size: 11, color: COLORS.purple, bold: true });

  const stats = [
    { name: 'Strength', value: '145', color: COLORS.red },
    { name: 'Agility', value: '98', color: COLORS.green },
    { name: 'Intellect', value: '42', color: COLORS.blue },
    { name: 'Stamina', value: '120', color: COLORS.gold },
    { name: 'Armor', value: '280', color: COLORS.gray },
    { name: 'Crit Chance', value: '18.5%', color: COLORS.gold },
    { name: 'Haste', value: '12%', color: COLORS.orange || '#ff8000' },
    { name: 'Dodge', value: '5.2%', color: COLORS.green },
  ];

  stats.forEach((s, i) => {
    const sy = statsY + 20 + i * 22;
    drawText(ctx, s.name, statsX, sy, { size: 11, color: COLORS.gray });
    drawText(ctx, s.value, statsX + 120, sy, { size: 11, color: s.color, bold: true });
  });

  // ─── Inventory Grid (right) ───────────────────────────────
  const invX = px + 300, invY = py + 60;
  drawText(ctx, 'BACKPACK', invX + 160, invY, { size: 11, color: COLORS.gold, align: 'center', bold: true });
  drawText(ctx, '💰 1,250g', invX + 290, invY, { size: 11, color: COLORS.gold, align: 'right' });

  const invItems = [
    { icon: '🗡️', border: COLORS.legendary, qty: 1 },
    { icon: '🧪', border: COLORS.uncommon, qty: 5 },
    { icon: '🌿', border: COLORS.common, qty: 12 },
    { icon: '⛏️', border: COLORS.common, qty: 3 },
    { icon: '🍖', border: COLORS.epic, qty: 1 },
    { icon: '📜', border: COLORS.rare, qty: 1 },
    { icon: '💎', border: COLORS.mythic, qty: 1 },
    { icon: '🧪', border: COLORS.uncommon, qty: 3 },
    { icon: '🪨', border: COLORS.common, qty: 8 },
    { icon: '🧵', border: COLORS.common, qty: 4 },
    { icon: '🏹', border: COLORS.rare, qty: 1 },
    { icon: '📖', border: COLORS.uncommon, qty: 1 },
    null, null, null,
    null, null, null,
    null, null, null,
    null, null, null,
  ];

  const cols = 6, slotSize = 50, gap = 6;
  invItems.forEach((item, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const sx = invX + col * (slotSize + gap);
    const sy = invY + 20 + row * (slotSize + gap);
    drawSlot(ctx, sx, sy, slotSize, item ? item.border : COLORS.grayDark, item?.icon, item?.qty);
  });

  // ─── Tooltip (floating) ───────────────────────────────────
  const ttX = invX + 320, ttY = invY + 80;
  const ttW = 240, ttH = 220;
  drawPanel(ctx, ttX, ttY, ttW, ttH, { alpha: 0.97, borderColor: COLORS.legendary });

  drawText(ctx, 'Flamestrike Sword', ttX + 12, ttY + 20, { size: 14, color: COLORS.legendary, bold: true });
  drawText(ctx, 'Legendary', ttX + 12, ttY + 38, { size: 11, color: COLORS.legendary });
  drawText(ctx, 'One-Handed Sword', ttX + 12, ttY + 56, { size: 11, color: COLORS.gray });
  drawText(ctx, 'Item Level 45', ttX + 12, ttY + 72, { size: 11, color: COLORS.gray });

  // Separator
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.moveTo(ttX + 12, ttY + 84);
  ctx.lineTo(ttX + ttW - 12, ttY + 84);
  ctx.stroke();

  drawText(ctx, '+25 Strength', ttX + 12, ttY + 100, { size: 12, color: COLORS.white });
  drawText(ctx, '+15 Agility', ttX + 12, ttY + 118, { size: 12, color: COLORS.white });
  drawText(ctx, '+10 Critical Strike', ttX + 12, ttY + 136, { size: 12, color: COLORS.white });

  // Separator
  ctx.beginPath();
  ctx.moveTo(ttX + 12, ttY + 150);
  ctx.lineTo(ttX + ttW - 12, ttY + 150);
  ctx.stroke();

  drawText(ctx, 'Equip: Attacks may unleash', ttX + 12, ttY + 166, { size: 11, color: COLORS.gold });
  drawText(ctx, '火焰风暴', ttX + 12, ttY + 182, { size: 11, color: COLORS.gold });

  drawText(ctx, 'Sell: 15g 50s', ttX + 12, ttY + 200, { size: 10, color: COLORS.gray });
  drawText(ctx, 'Binds when equipped', ttX + 12, ttY + 214, { size: 10, color: COLORS.red });

  saveCanvas(canvas, '03-inventory.png');
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 4: COMBAT
// ═══════════════════════════════════════════════════════════════
function renderCombat() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Dark dungeon background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#1a1a1a');
  grad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Stone floor pattern
  ctx.strokeStyle = 'rgba(80,80,80,0.2)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 64) {
    for (let y = 0; y < H; y += 64) {
      drawRoundedRect(ctx, x + 2, y + 2, 60, 60, 2);
      ctx.stroke();
    }
  }

  // Torches
  const torches = [[100, 150], [W - 100, 150], [100, 450], [W - 100, 450]];
  for (const [tx, ty] of torches) {
    // Torch body
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(tx - 3, ty, 6, 20);
    // Flame
    ctx.beginPath();
    ctx.arc(tx, ty - 6, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff8800';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tx, ty - 10, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
    // Glow
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(tx, ty - 6, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Boss monster (large dragon)
  const bx = W / 2, by = H / 2 - 40;
  // Shadow
  ctx.beginPath();
  ctx.ellipse(bx, by + 60, 50, 15, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();
  // Body
  ctx.fillStyle = '#8b0000';
  drawRoundedRect(ctx, bx - 40, by - 30, 80, 70, 10);
  ctx.fill();
  // Head
  ctx.fillStyle = '#aa2222';
  drawRoundedRect(ctx, bx - 25, by - 55, 50, 35, 8);
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#ff0000';
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 10;
  ctx.fillRect(bx - 15, by - 45, 8, 6);
  ctx.fillRect(bx + 7, by - 45, 8, 6);
  ctx.shadowBlur = 0;
  // Wings
  ctx.fillStyle = '#6b0000';
  ctx.beginPath();
  ctx.moveTo(bx - 40, by - 20);
  ctx.lineTo(bx - 80, by - 60);
  ctx.lineTo(bx - 60, by - 10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx + 40, by - 20);
  ctx.lineTo(bx + 80, by - 60);
  ctx.lineTo(bx + 60, by - 10);
  ctx.fill();
  // Boss name
  drawText(ctx, '🔥 ANCIENT DRAGON', bx, by - 80, { size: 20, color: COLORS.red, align: 'center', bold: true });
  drawText(ctx, 'Level 50 World Boss', bx, by - 62, { size: 12, color: COLORS.gray, align: 'center' });

  // Boss health bar
  drawBar(ctx, bx - 200, by + 50, 400, 20, 0.35, '#4a0000', COLORS.red, COLORS.red + '66');
  drawText(ctx, '175,000 / 500,000', bx, by + 60, { size: 12, color: '#fff', align: 'center', bold: true });

  // Phase indicator
  drawPanel(ctx, bx - 60, by + 78, 120, 24, { alpha: 0.8, borderColor: COLORS.red });
  drawText(ctx, 'PHASE 2', bx, by + 90, { size: 11, color: COLORS.red, align: 'center', bold: true });

  // Players around the boss
  const players = [
    { x: bx - 150, y: by + 80, name: 'Tank', role: '🛡️', hp: 0.6 },
    { x: bx - 100, y: by + 120, name: 'Healer', role: '💚', hp: 0.9 },
    { x: bx + 100, y: by + 80, name: 'DPS', role: '⚔️', hp: 0.45 },
    { x: bx + 150, y: by + 120, name: 'DPS', role: '🔥', hp: 0.8 },
    { x: bx, y: by + 140, name: 'Support', role: '✨', hp: 0.95 },
  ];

  players.forEach(p => {
    // Mini character
    ctx.fillStyle = '#4a6a8a';
    drawRoundedRect(ctx, p.x - 8, p.y - 10, 16, 20, 3);
    ctx.fill();
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.role, p.x, p.y - 16);
    // HP bar
    drawBar(ctx, p.x - 15, p.y + 14, 30, 4, p.hp, COLORS.redDark, COLORS.red, 'transparent');
  });

  // Floating combat numbers
  const numbers = [
    { text: '-1,245', x: bx - 60, y: by - 100, color: COLORS.red, size: 32 },
    { text: '-2,512!', x: bx + 40, y: by - 130, color: COLORS.gold, size: 42 },
    { text: '+850', x: bx - 120, y: by + 40, color: COLORS.green, size: 28 },
    { text: 'MISS', x: bx + 120, y: by + 20, color: COLORS.gray, size: 20 },
    { text: 'DODGE', x: bx + 80, y: by + 60, color: COLORS.white, size: 18 },
  ];

  numbers.forEach(n => {
    ctx.font = `bold ${n.size}px serif`;
    ctx.fillStyle = n.color;
    ctx.textAlign = 'center';
    ctx.shadowColor = n.color + '88';
    ctx.shadowBlur = 10;
    ctx.fillText(n.text, n.x, n.y);
    ctx.shadowBlur = 0;
  });

  // Cast bar
  drawPanel(ctx, bx - 120, by + 160, 240, 24, { alpha: 0.9, borderColor: COLORS.blue });
  drawText(ctx, 'Casting: Fireball...', bx, by + 172, { size: 11, color: COLORS.white, align: 'center' });
  drawBar(ctx, bx - 118, by + 162, 236, 20, 0.65, COLORS.blueDark, COLORS.blue, 'transparent');

  // Ability bar
  const abW = 400, abH = 50;
  const abX = (W - abW) / 2, abY = H - abH - 12;
  drawPanel(ctx, abX, abY, abW, abH, { alpha: 0.92 });

  const raidAbilities = [
    { icon: '⚔️', cd: 0 }, { icon: '🛡️', cd: 0 }, { icon: '🔥', cd: 1.5 },
    { icon: '❄️', cd: 0 }, { icon: '💚', cd: 0 }, { icon: '⚡', cd: 5 },
  ];

  raidAbilities.forEach((a, i) => {
    const sx = abX + 10 + i * 64;
    const sy = abY + 6;
    drawRoundedRect(ctx, sx, sy, 40, 40, 6);
    ctx.fillStyle = a.cd > 0 ? '#1a1040' : '#2d1b69';
    ctx.fill();
    ctx.strokeStyle = a.cd > 0 ? COLORS.purple + '33' : COLORS.purple;
    ctx.lineWidth = a.cd > 0 ? 1 : 2;
    ctx.stroke();
    ctx.globalAlpha = a.cd > 0 ? 0.4 : 1;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(a.icon, sx + 20, sy + 22);
    ctx.globalAlpha = 1;
    if (a.cd > 0) {
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = COLORS.white;
      ctx.fillText(`${a.cd}s`, sx + 20, sy + 22);
    }
  });

  // Raid frames (right side)
  drawPanel(ctx, W - 180, 200, 168, 200, { alpha: 0.85 });
  drawText(ctx, 'RAID (10-man)', W - 96, 214, { size: 10, color: COLORS.gold, align: 'center', bold: true });

  const raidMembers = [
    { name: 'Tankius', hp: 0.6, role: '🛡️' },
    { name: 'Healoria', hp: 0.9, role: '💚' },
    { name: 'Strikethor', hp: 0.45, role: '⚔️' },
    { name: 'Pyromaniac', hp: 0.8, role: '🔥' },
    { name: 'Frostbyte', hp: 0.7, role: '❄️' },
    { name: 'Shadowmend', hp: 0.95, role: '🌙' },
    { name: 'Naturecall', hp: 0.85, role: '🌿' },
    { name: 'Holyshield', hp: 0.75, role: '✨' },
  ];

  raidMembers.forEach((m, i) => {
    const my = 228 + i * 20;
    drawText(ctx, `${m.role} ${m.name}`, W - 170, my, { size: 9, color: m.hp < 0.3 ? COLORS.red : COLORS.white });
    drawBar(ctx, W - 60, my - 5, 48, 8, m.hp, m.hp < 0.3 ? '#8b0000' : COLORS.greenDark, m.hp < 0.3 ? COLORS.red : COLORS.green, 'transparent');
  });

  saveCanvas(canvas, '04-combat-raid.png');
}

// ═══════════════════════════════════════════════════════════════
// RENDER ALL
// ═══════════════════════════════════════════════════════════════
console.log('🎮 Nexus Realms — Generating screenshots...\n');

console.log('1/4 Login Screen:');
renderLogin();

console.log('2/4 Game HUD:');
renderHUD();

console.log('3/4 Inventory:');
renderInventory();

console.log('4/4 Combat Raid:');
renderCombat();

console.log('\n✅ All screenshots generated in screenshots/');
