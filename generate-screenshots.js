// Screenshot generator — renders actual game frames using node-canvas
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1280, H = 720;
const out = path.join(__dirname, 'screenshots');
if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });

function save(c, name) {
  fs.writeFileSync(path.join(out, name), c.toBuffer('image/png'));
  console.log(`✅ ${name}`);
}

// ─── Colors ──────────────────────────────────────────────────
const C = {
  grass1: '#3a6b2a', grass2: '#4a7b3a', dirt: '#8b7355', stone: '#6a6a7a',
  water: '#2244aa', wall: '#5a4a3a', tree1: '#2a6a1a', tree2: '#3a7a2a',
  trunk: '#5a3a1a', flower1: '#ff6688', flower2: '#ffaa44', bush: '#2a5a1a',
  rock: '#7a7a8a', bg: '#0a0a1a', bgLight: '#1a1a2e', purple: '#7b68ee',
  gold: '#ffd700', red: '#ff4444', redDark: '#8b0000', green: '#00ff00',
  greenDark: '#008800', blue: '#4488ff', blueDark: '#00008b', white: '#e0e0e0',
  gray: '#888888', grayDark: '#444466', skin: '#ddaa77', armor: '#4466aa',
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

function bar(ctx, x, y, w, h, pct, c1, c2) {
  roundRect(ctx,x,y,w,h,h/2); ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fill();
  if(pct>0){roundRect(ctx,x+1,y+1,(w-2)*pct,h-2,(h-2)/2);const g=ctx.createLinearGradient(x,y,x+w,y);g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.fill();}
}

function drawTile(ctx, tx, ty, type) {
  const x=tx*32, y=ty*32;
  ctx.fillStyle = [C.grass1,C.dirt,C.stone,C.water,C.wall,C.grass1,C.grass1,C.grass1,C.grass1][type]||C.grass1;
  ctx.fillRect(x,y,32,32);

  if(type===0){ // grass details
    ctx.fillStyle=C.grass2; ctx.fillRect(x+4,y+4,2,2); ctx.fillRect(x+20,y+12,2,2);
  } else if(type===1){ // dirt
    ctx.fillStyle='#7a6244'; ctx.fillRect(x+8,y+8,4,4); ctx.fillRect(x+22,y+18,3,3);
  } else if(type===2){ // stone
    ctx.fillStyle='#5a5a6a'; ctx.fillRect(x,y,32,1); ctx.fillRect(x,y,1,32);
    ctx.fillStyle='#7a7a8a'; ctx.fillRect(x+2,y+2,14,14); ctx.fillRect(x+18,y+2,12,14);
  } else if(type===3){ // water
    ctx.fillStyle='#3355bb'; ctx.fillRect(x+4,y+8,12,2); ctx.fillRect(x+18,y+20,10,2);
  } else if(type===4){ // wall
    ctx.fillStyle='#4a3a2a'; ctx.fillRect(x,y,32,2); ctx.fillRect(x,y+14,32,4);
    ctx.fillStyle='#6a5a4a'; ctx.fillRect(x+2,y+4,12,10); ctx.fillRect(x+18,y+4,12,10);
  } else if(type===5){ // tree
    ctx.fillStyle=C.trunk; ctx.fillRect(x+12,y+8,8,24);
    ctx.fillStyle=C.tree1; ctx.beginPath(); ctx.arc(x+16,y+10,12,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=C.tree2; ctx.beginPath(); ctx.arc(x+12,y+8,7,0,Math.PI*2); ctx.fill();
  } else if(type===6){ // flowers
    ctx.fillStyle=C.flower1; ctx.beginPath(); ctx.arc(x+12,y+12,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=C.flower2; ctx.beginPath(); ctx.arc(x+24,y+20,3,0,Math.PI*2); ctx.fill();
  } else if(type===7){ // bush
    ctx.fillStyle=C.bush; ctx.beginPath(); ctx.arc(x+16,y+20,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#3a7a2a'; ctx.beginPath(); ctx.arc(x+10,y+16,6,0,Math.PI*2); ctx.fill();
  } else if(type===8){ // rock
    ctx.fillStyle=C.rock; ctx.fillRect(x+6,y+12,20,16);
    ctx.fillStyle='#8a8a9a'; ctx.fillRect(x+8,y+14,16,12);
  }
}

function drawPlayer(ctx, x, y, dir) {
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x,y+14,10,4,0,0,Math.PI*2); ctx.fill();
  // Body
  ctx.fillStyle=C.armor; ctx.fillRect(x-6,y-6,12,14);
  // Head
  ctx.fillStyle=C.skin; ctx.beginPath(); ctx.arc(x,y-10,6,0,Math.PI*2); ctx.fill();
  // Hair
  ctx.fillStyle='#553322'; ctx.fillRect(x-6,y-16,12,4);
  // Eyes
  if(dir==='down'){ctx.fillStyle='#222';ctx.fillRect(x-3,y-12,2,2);ctx.fillRect(x+1,y-12,2,2);}
  // Legs
  ctx.fillStyle='#334488'; ctx.fillRect(x-5,y+8,4,6); ctx.fillRect(x+1,y+8,4,6);
  // Boots
  ctx.fillStyle='#553322'; ctx.fillRect(x-5,y+12,4,4); ctx.fillRect(x+1,y+12,4,4);
  // Sword
  ctx.fillStyle='#ccc'; ctx.fillRect(x+8,y-10,2,16);
  ctx.fillStyle='#ffcc00'; ctx.fillRect(x+6,y,6,2);
}

function drawMonster(ctx, x, y, type) {
  ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x,y+12,8,3,0,0,Math.PI*2); ctx.fill();
  if(type==='wolf'){
    ctx.fillStyle='#888'; ctx.fillRect(x-10,y-2,20,12);
    ctx.fillStyle='#999'; ctx.beginPath(); ctx.arc(x+10,y-4,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.fillRect(x+12,y-6,2,2);
    ctx.fillStyle='#666'; ctx.fillRect(x-8,y+10,3,6); ctx.fillRect(x-2,y+10,3,6); ctx.fillRect(x+4,y+10,3,6);
  } else if(type==='goblin'){
    ctx.fillStyle='#44aa44'; ctx.fillRect(x-6,y-4,12,12);
    ctx.fillStyle='#55bb55'; ctx.beginPath(); ctx.arc(x,y-8,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f00'; ctx.fillRect(x-3,y-10,2,2); ctx.fillRect(x+1,y-10,2,2);
    ctx.fillStyle='#338833'; ctx.fillRect(x-5,y+8,4,6); ctx.fillRect(x+1,y+8,4,6);
    ctx.fillStyle='#8b6914'; ctx.fillRect(x+8,y-6,3,14);
  } else if(type==='skeleton'){
    ctx.fillStyle='#ddd'; ctx.fillRect(x-4,y-4,8,12);
    ctx.fillStyle='#eee'; ctx.beginPath(); ctx.arc(x,y-8,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#111'; ctx.fillRect(x-3,y-10,3,3); ctx.fillRect(x+1,y-10,3,3);
    ctx.fillStyle='#ccc'; ctx.fillRect(x-4,y+8,3,8); ctx.fillRect(x+1,y+8,3,8);
    ctx.fillStyle='#ccc'; ctx.fillRect(x+8,y-8,2,18);
  } else if(type==='spider'){
    ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(x,y,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#444'; ctx.beginPath(); ctx.arc(x,y-6,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f00'; ctx.fillRect(x-2,y-8,2,2); ctx.fillRect(x+1,y-8,2,2);
    ctx.strokeStyle='#222'; ctx.lineWidth=2;
    for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x-8,y-2+i*3);ctx.lineTo(x-16,y-6+i*5);ctx.stroke();ctx.beginPath();ctx.moveTo(x+8,y-2+i*3);ctx.lineTo(x+16,y-6+i*5);ctx.stroke();}
  } else if(type==='dragon'){
    ctx.fillStyle='#880000'; ctx.fillRect(x-20,y-10,40,30);
    ctx.fillStyle='#aa2222'; ctx.beginPath(); ctx.arc(x,y-18,12,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f00'; ctx.fillRect(x-6,y-22,4,4); ctx.fillRect(x+2,y-22,4,4);
    ctx.fillStyle='#660000';
    ctx.beginPath(); ctx.moveTo(x-20,y-6); ctx.lineTo(x-36,y-24); ctx.lineTo(x-28,y); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+20,y-6); ctx.lineTo(x+36,y-24); ctx.lineTo(x+28,y); ctx.closePath(); ctx.fill();
  }
}

function drawNPC(ctx, x, y, type) {
  ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x,y+14,8,3,0,0,Math.PI*2); ctx.fill();
  if(type==='quest'){
    ctx.fillStyle='#4488cc'; ctx.fillRect(x-6,y-6,12,14);
    ctx.fillStyle=C.skin; ctx.beginPath(); ctx.arc(x,y-10,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#446688'; ctx.fillRect(x-6,y-16,12,4);
    ctx.fillStyle=C.gold; ctx.fillRect(x-2,y-26,4,8); ctx.fillRect(x-2,y-16,4,2);
  } else if(type==='merchant'){
    ctx.fillStyle='#cc8844'; ctx.fillRect(x-6,y-6,12,14);
    ctx.fillStyle=C.skin; ctx.beginPath(); ctx.arc(x,y-10,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#886633'; ctx.fillRect(x-6,y-16,12,4);
  } else {
    ctx.fillStyle='#888899'; ctx.fillRect(x-6,y-6,12,14);
    ctx.fillStyle=C.skin; ctx.beginPath(); ctx.arc(x,y-10,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#777788'; ctx.fillRect(x-7,y-18,14,8);
    ctx.fillStyle='#8b6914'; ctx.fillRect(x+10,y-14,2,28);
    ctx.fillStyle='#ccc'; ctx.fillRect(x+9,y-16,4,4);
  }
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 1: GAME WORLD
// ═══════════════════════════════════════════════════════════════
function renderGameWorld() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Generate mini map (80x60 tiles → show 40x22 viewport)
  const mapData = [];
  for(let y=0;y<60;y++){mapData[y]=[];for(let x=0;x<80;x++){
    if(x===0||y===0||x===79||y===59) mapData[y][x]=4;
    else if(x>=60&&x<=68&&y>=20&&y<=26) mapData[y][x]=3;
    else if(x>=30&&x<=50&&y>=25&&y<=40) mapData[y][x]=2;
    else if((y===32&&x>=10&&x<=50)||(x===40&&y>=10&&y<=50)) mapData[y][x]=1;
    else if(Math.random()<0.08) mapData[y][x]=5;
    else if(Math.random()<0.03) mapData[y][x]=8;
    else if(Math.random()<0.05) mapData[y][x]=6;
    else if(Math.random()<0.04) mapData[y][x]=7;
    else mapData[y][x]=0;
  }}

  // Camera centered on player at tile (40,32)
  const camX = 40*32 - W/2/1.5, camY = 32*32 - H/2/1.5;
  const zoom = 1.5;

  ctx.save();
  ctx.scale(zoom, zoom);

  // Draw visible tiles
  const startTX = Math.max(0, Math.floor(camX/32));
  const startTY = Math.max(0, Math.floor(camY/32));
  const endTX = Math.min(80, Math.ceil((camX+W/zoom)/32)+1);
  const endTY = Math.min(60, Math.ceil((camY+H/zoom)/32)+1);

  for(let ty=startTY;ty<endTY;ty++){
    for(let tx=startTX;tx<endTX;tx++){
      drawTile(ctx, tx-Math.floor(camX/32), ty-Math.floor(camY/32), mapData[ty][tx]);
    }
  }

  // Draw monsters
  const monsters = [
    {x:20,y:20,type:'slime'},{x:22,y:25,type:'slime'},
    {x:15,y:30,type:'wolf'},{x:18,y:35,type:'wolf'},
    {x:55,y:15,type:'goblin'},{x:58,y:18,type:'goblin'},
    {x:70,y:40,type:'skeleton'},{x:68,y:50,type:'spider'},
    {x:75,y:55,type:'dragon'},
  ];
  for(const m of monsters){
    const sx=(m.x-Math.floor(camX/32))*32+16, sy=(m.y-Math.floor(camY/32))*32+16;
    if(sx>-40&&sx<W/zoom+40&&sy>-40&&sy<H/zoom+40) drawMonster(ctx,sx,sy,m.type);
  }

  // Draw NPCs
  const npcs = [
    {x:38,y:30,type:'quest'},{x:42,y:28,type:'merchant'},
    {x:35,y:35,type:'guard'},{x:45,y:32,type:'quest'},
  ];
  for(const n of npcs){
    const sx=(n.x-Math.floor(camX/32))*32+16, sy=(n.y-Math.floor(camY/32))*32+16;
    drawNPC(ctx,sx,sy,n.type);
  }

  // Draw player
  const px=(40-Math.floor(camX/32))*32+16, py=(32-Math.floor(camY/32))*32+16;
  drawPlayer(ctx, px, py, 'down');

  ctx.restore();

  // ─── HUD OVERLAY ─────────────────────────────────────────

  // Player frame (top-left)
  roundRect(ctx,8,8,240,80,8); ctx.fillStyle='rgba(10,10,26,0.85)'; ctx.fill();
  ctx.strokeStyle='rgba(123,104,238,0.3)'; ctx.lineWidth=1; ctx.stroke();

  // Portrait
  ctx.fillStyle=C.armor; roundRect(ctx,16,16,40,40,20); ctx.fill();
  ctx.strokeStyle=C.gold; ctx.lineWidth=2; ctx.stroke();
  ctx.font='18px sans-serif'; ctx.textAlign='center'; ctx.fillText('⚔️',36,40);

  ctx.font='bold 13px sans-serif'; ctx.fillStyle=C.gold; ctx.textAlign='left';
  ctx.fillText('HeroName',66,30);
  ctx.font='11px sans-serif'; ctx.fillStyle=C.gray; ctx.fillText('Level 1 Warrior',66,46);

  bar(ctx,66,54,170,14,0.75,C.redDark,C.red);
  ctx.font='9px sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText('75 / 100',151,63);
  bar(ctx,66,72,170,10,0.60,C.blueDark,C.blue);
  ctx.font='9px sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText('30 / 50',151,79);

  ctx.font='11px sans-serif'; ctx.fillStyle=C.gold; ctx.textAlign='left'; ctx.fillText('💰 0',16,92);

  // Target frame (top-center)
  roundRect(ctx,W/2-140,8,280,40,6); ctx.fillStyle='rgba(10,10,26,0.85)'; ctx.fill();
  ctx.strokeStyle='rgba(255,68,68,0.3)'; ctx.stroke();
  ctx.font='bold 12px sans-serif'; ctx.fillStyle=C.red; ctx.textAlign='center';
  ctx.fillText('🐺 Forest Wolf (Lv.2)',W/2,26);
  bar(ctx,W/2-120,34,240,10,0.6,C.redDark,C.red);
  ctx.font='9px sans-serif'; ctx.fillStyle='#fff'; ctx.fillText('30 / 50',W/2,41);

  // Ability bar (bottom-center)
  const abW=320, abH=48, abX=(W-abW)/2, abY=H-abH-8;
  roundRect(ctx,abX,abY,abW,abH,8); ctx.fillStyle='rgba(10,10,26,0.85)'; ctx.fill();
  ctx.strokeStyle='rgba(123,104,238,0.4)'; ctx.stroke();

  const abs=[{k:'1',i:'⚔️'},{k:'2',i:'💪'},{k:'3',i:'🌀'},{k:'4',i:'💚'},{k:'5',i:'🔥'}];
  abs.forEach((a,j)=>{
    const sx=abX+8+j*62, sy=abY+6, ss=36;
    roundRect(ctx,sx,sy,ss,ss,4); ctx.fillStyle='#1a1040'; ctx.fill();
    ctx.strokeStyle='rgba(123,104,238,0.6)'; ctx.stroke();
    ctx.font='16px sans-serif'; ctx.textAlign='center'; ctx.fillText(a.i,sx+ss/2,sy+ss/2);
    ctx.font='bold 9px sans-serif'; ctx.fillStyle=C.gold; ctx.textAlign='right'; ctx.fillText(a.k,sx+ss-3,sy+ss-3);
  });

  // Chat (bottom-left)
  roundRect(ctx,8,H-140,340,130,6); ctx.fillStyle='rgba(10,10,26,0.7)'; ctx.fill();
  ctx.strokeStyle='rgba(123,104,238,0.2)'; ctx.stroke();
  ctx.font='11px sans-serif'; ctx.textAlign='left';
  const msgs=[
    {c:'#ffaa00',t:'[system] Welcome to Nexus Realms!'},
    {c:'#ffaa00',t:'[system] WASD to move, Click to attack'},
    {c:'#00ff00',t:'[loot] Wolf dropped: Wolf Pelt'},
    {c:'#ffd700',t:'[xp] Gained 25 experience!'},
    {c:'#ff4444',t:'[combat] You hit Wolf for 15 damage!'},
  ];
  msgs.forEach((m,i)=>{ctx.fillStyle=m.c;ctx.fillText(m.t,14,H-128+i*22);});

  // Minimap (top-right)
  roundRect(ctx,W-132,8,120,100,6); ctx.fillStyle='rgba(10,10,26,0.8)'; ctx.fill();
  ctx.strokeStyle='rgba(123,104,238,0.3)'; ctx.stroke();
  // Map terrain
  for(let my=0;my<60;my+=3){for(let mx=0;mx<80;mx+=3){
    const t=mapData[my][mx];
    const mc=t===3?'#2244aa':t===4?'#5a4a3a':t===2?'#6a6a7a':t===5?'#2a6a1a':'#3a6b2a';
    ctx.fillStyle=mc;
    ctx.fillRect(W-130+mx*1.4,10+my*1.4,2,2);
  }}
  // Player dot
  ctx.fillStyle=C.gold; ctx.beginPath(); ctx.arc(W-130+40*1.4,10+32*1.4,3,0,Math.PI*2); ctx.fill();
  ctx.shadowColor=C.gold; ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0;
  // Enemy dots
  ctx.fillStyle=C.red;
  ctx.beginPath(); ctx.arc(W-130+20*1.4,10+20*1.4,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W-130+55*1.4,10+15*1.4,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W-130+70*1.4,10+40*1.4,2,0,Math.PI*2); ctx.fill();

  // XP bar (very bottom)
  bar(ctx,0,H-4,W,4,0.35,C.gold,'#ffaa00');

  // Damage numbers
  ctx.font='bold 28px serif'; ctx.fillStyle=C.red; ctx.textAlign='center';
  ctx.shadowColor='rgba(255,0,0,0.5)'; ctx.shadowBlur=8;
  ctx.fillText('-15',px+60,py-40); ctx.shadowBlur=0;

  // Controls hint
  ctx.font='10px sans-serif'; ctx.fillStyle='#555'; ctx.textAlign='center';
  ctx.fillText('WASD: Move | Click: Attack | E: Interact | 1-5: Abilities | I: Inventory',W/2,H-4);

  save(canvas,'01-game-world.png');
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 2: COMBAT
// ═══════════════════════════════════════════════════════════════
function renderCombat() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Dark forest background
  ctx.fillStyle='#1a2a1a'; ctx.fillRect(0,0,W,H);
  // Ground
  ctx.fillStyle='#2a3a1a'; ctx.fillRect(0,H*0.6,W,H*0.4);
  // Trees in background
  for(let i=0;i<15;i++){
    const tx=Math.random()*W, ty=H*0.3+Math.random()*H*0.3;
    ctx.fillStyle='#1a3a0a'; ctx.fillRect(tx-4,ty,8,40);
    ctx.fillStyle='#2a5a1a'; ctx.beginPath(); ctx.arc(tx,ty-10,18,0,Math.PI*2); ctx.fill();
  }

  // Player (left)
  drawPlayer(ctx,W*0.3,H*0.55,'right');

  // Wolf (right, wounded)
  drawMonster(ctx,W*0.6,H*0.55,'wolf');
  // Wolf HP bar
  bar(ctx,W*0.6-30,H*0.55-30,60,8,0.3,C.redDark,C.red);

  // Goblin (far right)
  drawMonster(ctx,W*0.75,H*0.5,'goblin');
  bar(ctx,W*0.75-25,H*0.5-30,50,8,0.8,C.redDark,C.red);

  // Floating damage numbers
  const nums = [
    {text:'-22',x:W*0.55,y:H*0.35,color:C.red,size:36},
    {text:'CRIT!',x:W*0.62,y:H*0.25,color:C.gold,size:42},
    {text:'+30',x:W*0.35,y:H*0.4,color:C.green,size:28},
    {text:'-8',x:W*0.7,y:H*0.38,color:C.red,size:24},
  ];
  nums.forEach(n=>{
    ctx.font=`bold ${n.size}px serif`; ctx.fillStyle=n.color; ctx.textAlign='center';
    ctx.shadowColor=n.color+'88'; ctx.shadowBlur=10; ctx.fillText(n.text,n.x,n.y); ctx.shadowBlur=0;
  });

  // Slash effect
  ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.arc(W*0.58,H*0.52,20,-0.5,1.5); ctx.stroke();

  // Cast bar
  roundRect(ctx,W/2-120,H*0.7,240,24,6); ctx.fillStyle='rgba(10,10,26,0.9)'; ctx.fill();
  ctx.strokeStyle='rgba(68,136,255,0.5)'; ctx.stroke();
  ctx.font='11px sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='center';
  ctx.fillText('Casting: Power Strike...',W/2,H*0.7+16);
  bar(ctx,W/2-118,H*0.7+2,236,20,0.65,C.blueDark,C.blue);

  // Target frame
  roundRect(ctx,W/2-140,8,280,40,6); ctx.fillStyle='rgba(10,10,26,0.85)'; ctx.fill();
  ctx.strokeStyle='rgba(255,68,68,0.3)'; ctx.stroke();
  ctx.font='bold 13px sans-serif'; ctx.fillStyle=C.red; ctx.textAlign='center';
  ctx.fillText('🐺 Forest Wolf (Lv.2)',W/2,26);
  bar(ctx,W/2-120,34,240,10,0.15,C.redDark,C.red);
  ctx.font='10px sans-serif'; ctx.fillStyle='#fff'; ctx.fillText('8 / 50',W/2,41);

  // Player frame
  roundRect(ctx,8,8,240,80,8); ctx.fillStyle='rgba(10,10,26,0.85)'; ctx.fill();
  ctx.strokeStyle='rgba(123,104,238,0.3)'; ctx.stroke();
  ctx.fillStyle=C.armor; roundRect(ctx,16,16,40,40,20); ctx.fill();
  ctx.strokeStyle=C.gold; ctx.lineWidth=2; ctx.stroke();
  ctx.font='18px sans-serif'; ctx.textAlign='center'; ctx.fillText('⚔️',36,40);
  ctx.font='bold 13px sans-serif'; ctx.fillStyle=C.gold; ctx.textAlign='left'; ctx.fillText('HeroName',66,30);
  ctx.font='11px sans-serif'; ctx.fillStyle=C.gray; ctx.fillText('Level 1 Warrior',66,46);
  bar(ctx,66,54,170,14,0.85,C.redDark,C.red);
  ctx.font='9px sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText('85 / 100',151,63);
  bar(ctx,66,72,170,10,0.4,C.blueDark,C.blue);
  ctx.font='9px sans-serif'; ctx.fillStyle='#fff'; ctx.fillText('20 / 50',151,79);

  // Ability bar
  const abW=320, abH=48, abX=(W-abW)/2, abY=H-abH-8;
  roundRect(ctx,abX,abY,abW,abH,8); ctx.fillStyle='rgba(10,10,26,0.85)'; ctx.fill();
  ctx.strokeStyle='rgba(123,104,238,0.4)'; ctx.stroke();
  abs=[{k:'1',i:'⚔️',cd:0},{k:'2',i:'💪',cd:0},{k:'3',i:'🌀',cd:2},{k:'4',i:'💚',cd:0},{k:'5',i:'🔥',cd:5}];
  abs.forEach((a,j)=>{
    const sx=abX+8+j*62, sy=abY+6, ss=36;
    roundRect(ctx,sx,sy,ss,ss,4); ctx.fillStyle=a.cd>0?'#0a0820':'#1a1040'; ctx.fill();
    ctx.strokeStyle=a.cd>0?'rgba(123,104,238,0.2)':'rgba(123,104,238,0.6)'; ctx.stroke();
    ctx.globalAlpha=a.cd>0?0.4:1;
    ctx.font='16px sans-serif'; ctx.textAlign='center'; ctx.fillText(a.i,sx+ss/2,sy+ss/2);
    ctx.globalAlpha=1;
    if(a.cd>0){ctx.font='bold 14px sans-serif';ctx.fillStyle='#fff';ctx.fillText(`${a.cd}s`,sx+ss/2,sy+ss/2);}
    ctx.font='bold 9px sans-serif'; ctx.fillStyle=C.gold; ctx.textAlign='right'; ctx.fillText(a.k,sx+ss-3,sy+ss-3);
  });

  // Combat log
  roundRect(ctx,8,H-140,340,130,6); ctx.fillStyle='rgba(10,10,26,0.7)'; ctx.fill();
  ctx.font='11px sans-serif'; ctx.textAlign='left';
  const cmsgs=[
    {c:'#ff4444',t:'You hit Wolf for 15 damage!'},
    {c:'#ffd700',t:'CRITICAL! You hit Wolf for 22!'},
    {c:'#ff4444',t:'Wolf hits you for 8 damage!'},
    {c:'#00ff00',t:'You used Heal for 30 HP!'},
    {c:'#ff4444',t:'You hit Wolf for 18 damage!'},
    {c:'#ffd700',t:'Wolf dropped: Wolf Pelt'},
  ];
  cmsgs.forEach((m,i)=>{ctx.fillStyle=m.c;ctx.fillText(m.t,14,H-128+i*18);});

  save(canvas,'02-combat.png');
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 3: INVENTORY
// ═══════════════════════════════════════════════════════════════
function renderInventory() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Blurred game background
  ctx.fillStyle='#1a2a1a'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#2a3a1a'; ctx.fillRect(0,H*0.6,W,H*0.4);

  // Inventory panel
  const pW=600, pH=450, pX=(W-pW)/2, pY=(H-pH)/2;
  roundRect(ctx,pX,pY,pW,pH,10); ctx.fillStyle='rgba(10,10,26,0.95)'; ctx.fill();
  ctx.strokeStyle='rgba(123,104,238,0.5)'; ctx.lineWidth=2; ctx.stroke();

  // Title bar
  roundRect(ctx,pX,pY,pW,35,{tl:10,tr:10,bl:0,br:0}); ctx.fillStyle='rgba(123,104,238,0.2)'; ctx.fill();
  ctx.font='bold 14px sans-serif'; ctx.fillStyle=C.gold; ctx.textAlign='center';
  ctx.fillText('🎒 INVENTORY',W/2,pY+22);

  // Equipment section (left)
  const eqX=pX+30, eqY=pY+50;
  ctx.font='bold 10px sans-serif'; ctx.fillStyle=C.purple; ctx.textAlign='center';
  ctx.fillText('EQUIPMENT',eqX+75,eqY);

  const equips=[
    {x:0,y:0,i:'👑',c:C.gold},{x:1,y:0,i:'',c:'#333'},{x:2,y:0,i:'📿',c:'#a335ee'},
    {x:0,y:1,i:'',c:'#333'},{x:1,y:1,i:'⚔️',c:C.gold},{x:2,y:1,i:'🛡️',c:'#0070dd'},
    {x:0,y:2,i:'👕',c:'#a335ee'},{x:1,y:2,i:'',c:'#333'},{x:2,y:2,i:'👖',c:'#0070dd'},
    {x:0,y:3,i:'👢',c:'#0070dd'},{x:1,y:3,i:'💍',c:'#1eff00'},{x:2,y:3,i:'🧤',c:'#a335ee'},
  ];
  equips.forEach(e=>{
    const sx=eqX+e.x*54, sy=eqY+16+e.y*54;
    roundRect(ctx,sx,sy,48,48,4); ctx.fillStyle='#1a1a2e'; ctx.fill();
    ctx.strokeStyle=e.c; ctx.lineWidth=1.5; ctx.stroke();
    if(e.i){ctx.font='22px sans-serif';ctx.textAlign='center';ctx.fillText(e.i,sx+24,sy+28);}
  });

  // Stats (middle)
  const stX=eqX+190, stY=eqY;
  ctx.font='bold 10px sans-serif'; ctx.fillStyle=C.purple; ctx.textAlign='left';
  ctx.fillText('STATS',stX,stY);

  const stats=[
    {n:'Strength',v:'18',c:C.red},{n:'Agility',v:'10',c:C.green},
    {n:'Intellect',v:'6',c:C.blue},{n:'Stamina',v:'14',c:C.gold},
    {n:'Armor',v:'15',c:C.gray},{n:'Crit Chance',v:'15%',c:C.gold},
    {n:'Damage',v:'15',c:C.red},{n:'Level',v:'1',c:C.gold},
  ];
  stats.forEach((s,i)=>{
    const sy=stY+18+i*20;
    ctx.font='11px sans-serif'; ctx.fillStyle=C.gray; ctx.textAlign='left';
    ctx.fillText(s.n,stX,sy);
    ctx.font='bold 11px sans-serif'; ctx.fillStyle=s.c; ctx.textAlign='right';
    ctx.fillText(s.v,stX+100,sy);
  });

  // Inventory grid (right)
  const igX=pX+310, igY=pY+50;
  ctx.font='bold 10px sans-serif'; ctx.fillStyle=C.gold; ctx.textAlign='left';
  ctx.fillText('BACKPACK',igX,igY);
  ctx.fillStyle=C.gold; ctx.textAlign='right'; ctx.fillText('💰 47g',igX+250,igY);

  const items=[
    {i:'🧪',c:'#1eff00',q:3},{i:'🐺',c:'#9d9d9d',q:2},{i:'🦴',c:'#9d9d9d',q:5},
    {i:'⚔️',c:'#0070dd',q:1},{i:'💍',c:'#a335ee',q:1},{i:'',c:'#333',q:0},
    {i:'',c:'#333',q:0},{i:'',c:'#333',q:0},{i:'',c:'#333',q:0},
    {i:'',c:'#333',q:0},{i:'',c:'#333',q:0},{i:'',c:'#333',q:0},
  ];
  items.forEach((it,j)=>{
    const row=Math.floor(j/6), col=j%6;
    const sx=igX+col*42, sy=igY+16+row*42;
    roundRect(ctx,sx,sy,38,38,4); ctx.fillStyle='#1a1a2e'; ctx.fill();
    ctx.strokeStyle=it.c; ctx.lineWidth=1; ctx.stroke();
    if(it.i){ctx.font='18px sans-serif';ctx.textAlign='center';ctx.fillText(it.i,sx+19,sy+22);}
    if(it.q>1){ctx.font='bold 9px sans-serif';ctx.fillStyle=C.gold;ctx.textAlign='right';ctx.fillText(String(it.q),sx+36,sy+36);}
  });

  // Item tooltip (floating)
  const ttX=igX+260, ttY=igY+60, ttW=220, ttH=180;
  roundRect(ctx,ttX,ttY,ttW,ttH,8); ctx.fillStyle='rgba(10,10,26,0.97)'; ctx.fill();
  ctx.strokeStyle=C.gold; ctx.lineWidth=1.5; ctx.stroke();

  ctx.font='bold 14px sans-serif'; ctx.fillStyle=C.gold; ctx.textAlign='left';
  ctx.fillText('Iron Sword',ttX+12,ttY+22);
  ctx.font='11px sans-serif'; ctx.fillStyle='#0070dd'; ctx.fillText('Rare',ttX+12,ttY+38);
  ctx.fillStyle=C.gray; ctx.fillText('One-Handed Sword',ttX+12,ttY+54);
  ctx.fillText('Item Level 12',ttX+12,ttY+70);

  ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.beginPath();
  ctx.moveTo(ttX+12,ttY+80); ctx.lineTo(ttX+ttW-12,ttY+80); ctx.stroke();

  ctx.fillStyle='#fff'; ctx.fillText('+8 Strength',ttX+12,ttY+96);
  ctx.fillText('+5 Agility',ttX+12,ttY+112);

  ctx.beginPath(); ctx.moveTo(ttX+12,ttY+122); ctx.lineTo(ttX+ttW-12,ttY+122); ctx.stroke();
  ctx.fillStyle=C.gray; ctx.font='10px sans-serif';
  ctx.fillText('Sell: 5g 20s',ttX+12,ttY+138);
  ctx.fillStyle=C.red; ctx.fillText('Binds when equipped',ttX+12,ttY+154);

  // Background UI (dimmed)
  ctx.globalAlpha=0.3;
  roundRect(ctx,8,8,240,80,8); ctx.fillStyle='rgba(10,10,26,0.85)'; ctx.fill();
  ctx.globalAlpha=1;

  save(canvas,'03-inventory.png');
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 4: NPC DIALOGUE
// ═══════════════════════════════════════════════════════════════
function renderDialogue() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Game world background
  ctx.fillStyle='#2a4a1a'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#3a5a2a'; ctx.fillRect(0,H*0.5,W,H*0.5);
  // Trees
  for(let i=0;i<10;i++){
    const tx=100+Math.random()*(W-200);
    ctx.fillStyle=C.trunk; ctx.fillRect(tx-3,H*0.3,6,30);
    ctx.fillStyle=C.tree1; ctx.beginPath(); ctx.arc(tx,H*0.3-8,14,0,Math.PI*2); ctx.fill();
  }

  // NPC
  drawNPC(ctx,W*0.4,H*0.5,'quest');
  // Player
  drawPlayer(ctx,W*0.55,H*0.52,'left');

  // Name plates
  ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
  ctx.fillStyle=C.gold; ctx.fillText('Elder Theron',W*0.4,H*0.5-30);
  ctx.fillStyle=C.white; ctx.fillText('HeroName',W*0.55,H*0.52-30);

  // Dialogue box
  const dW=500, dH=160, dX=(W-dW)/2, dY=H*0.55;
  roundRect(ctx,dX,dY,dW,dH,10); ctx.fillStyle='rgba(10,10,26,0.95)'; ctx.fill();
  ctx.strokeStyle='rgba(123,104,238,0.6)'; ctx.lineWidth=2; ctx.stroke();

  // NPC name
  ctx.font='bold 16px sans-serif'; ctx.fillStyle=C.gold; ctx.textAlign='center';
  ctx.fillText('Elder Theron',W/2,dY+28);

  // Dialogue text
  ctx.font='13px sans-serif'; ctx.fillStyle=C.white; ctx.textAlign='center';
  ctx.fillText('Welcome, adventurer! The village needs your help.',W/2,dY+56);
  ctx.fillText('Dark creatures have been spotted in the forest.',W/2,dY+76);
  ctx.fillText('Will you help us clear them out?',W/2,dY+96);

  // Quest accept button
  roundRect(ctx,W/2-100,dY+110,200,32,6);
  const btnGrad=ctx.createLinearGradient(W/2-100,dY+110,W/2+100,dY+110);
  btnGrad.addColorStop(0,C.purple); btnGrad.addColorStop(1,'#5a4cd4');
  ctx.fillStyle=btnGrad; ctx.fill();
  ctx.font='bold 12px sans-serif'; ctx.fillStyle='#fff';
  ctx.fillText('Accept Quest',W/2,dY+130);

  // Continue hint
  ctx.font='10px sans-serif'; ctx.fillStyle=C.gray;
  ctx.fillText('Press SPACE to continue',W/2,dY+dH-8);

  // HUD (dimmed)
  roundRect(ctx,8,8,240,80,8); ctx.fillStyle='rgba(10,10,26,0.7)'; ctx.fill();
  ctx.font='bold 13px sans-serif'; ctx.fillStyle=C.gold; ctx.textAlign='left'; ctx.fillText('HeroName',66,30);
  bar(ctx,66,54,170,14,1,C.redDark,C.red);
  bar(ctx,66,72,170,10,0.8,C.blueDark,C.blue);

  save(canvas,'04-dialogue.png');
}

// ═══════════════════════════════════════════════════════════════
console.log('🎮 Generating game screenshots...\n');
renderGameWorld();
renderCombat();
renderInventory();
renderDialogue();
console.log('\n✅ Done! 4 screenshots in screenshots/');
