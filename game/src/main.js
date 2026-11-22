// main.js — the game loop and the night itself: state, movement, pickups,
// the exit, the win and the loss, and the ?shot= staging that poses the
// four screenshots. Every other file owns one system; this file wires them.
import {
  CANVAS_W, CANVAS_H, PLAY_W, PLAY_H,
  PLAYER_R, PLAYER_SNEAK_SPEED, PLAYER_SPRINT_SPEED,
  COIN_COUNT, DOUSE_COUNT, GUARD_DEFS, PLAYER_START,
  CHASE_AT, NEAR_MISS_AT, RELIC_PICKUP_DIST,
  PLAYER_STEP_SNEAK, PLAYER_STEP_SPRINT,
} from './config.js';
import { buildWorld, drawFloor, drawMarket, drawLampsAndRelics, resolveCircleRects, pointInRect } from './world.js';
import { createGuards, updateGuard, drawPatrolPath, drawGuard } from './patrol.js';
import { updateDetection, drawCone, drawDetectionArc } from './vision.js';
import { createRings, spawnRing, updateRings, drawRings, throwCoin } from './noiseRings.js';
import { playerHidden, douseNearestLamp } from './safetyLight.js';
import { drawHUD, drawBanner, drawTitleScreen, drawEndScreen } from './hud.js';
import { createInput, moveVector } from './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function freshState() {
  return {
    mode: 'title', // title | playing | win | lose
    world: buildWorld(),
    guards: createGuards(GUARD_DEFS),
    player: { x: PLAYER_START.x, y: PLAYER_START.y },
    rings: createRings(),
    coins: COIN_COUNT,
    douses: DOUSE_COUNT,
    alarm: 0,
    time: 0,
    banner: null,
    nearMissShown: false,
    caught: false,
    staged: false,
    shotKind: null,
    stepTimer: 0,
    statusText: '',
  };
}

let state = freshState();

// ?shot=cover|patrol|alarm|win poses a frozen moment for the screenshots:
// the guards hold still, the alarm holds its value, and the rings keep
// rippling so the scene stays alive while the picture is taken.
function applyShot(shot) {
  state.mode = 'playing';
  state.staged = true;
  state.shotKind = shot;
  for (const g of state.guards) g.stepTimer = 0.05;
  if (shot === 'cover') {
    state.player = { x: 250, y: 420 };
    // Rani already doused the lamp by the fruit stall, so her hiding
    // spot is true shadow: the HIDDEN tag shows while the cone sweeps past.
    state.world.lamps[3].lit = false;
    state.douses = 1;
    const g = state.guards[0];
    g.x = 250; g.y = 250; g.angle = Math.PI / 2;
    g.detection = 55;
    state.alarm = 55;
    state.banner = { text: 'CLOSE ONE!', sub: 'the cone swept past your stall — hold still', t: 99 };
    spawnRing(state.rings, 250, 250, 'guardStep', 46, 1.2);
    spawnRing(state.rings, 480, 215, 'guardStep', 46, 1.2);
  } else if (shot === 'alarm') {
    state.player = { x: 640, y: 500 };
    const g = state.guards[1];
    g.x = 700; g.y = 470; g.angle = Math.PI * 0.75;
    g.mode = 'chase';
    g.detection = 92;
    state.alarm = 92;
    state.banner = { text: 'SPOTTED !', sub: 'Bu Sari is coming — break line of sight', t: 99 };
    spawnRing(state.rings, 700, 470, 'guardStep', 46, 1.2);
  } else if (shot === 'win') {
    for (const r of state.world.relics) r.taken = true;
    state.player = { x: 904, y: 49 };
    state.mode = 'win';
    state.time = 87.4;
    state.alarm = 0;
  } else {
    // patrol: a plain working moment, rings already rippling. Rani waits
    // in the shadow by Mbak Rini's route, where the camera can see her.
    state.player = { x: 860, y: 640 };
    spawnRing(state.rings, 250, 250, 'guardStep', 46, 1.2);
    spawnRing(state.rings, 700, 250, 'guardStep', 46, 1.2);
    spawnRing(state.rings, 180, 565, 'guardStep', 46, 1.2);
    // A thrown coin still ringing in the middle of the market.
    spawnRing(state.rings, 480, 300, 'coin', 130, 1.6);
    spawnRing(state.rings, 860, 640, 'sneak', 26, 1.0);
    state.banner = { text: 'LEARN THE PATROLS', sub: 'dotted routes · dashed ghost is 3 seconds ahead', t: 99 };
  }
}

function resetNight() {
  const shot = new URLSearchParams(window.location.search).get('shot');
  state = freshState();
  if (shot) applyShot(shot);
}

function startNight() {
  if (state.mode === 'title') state.mode = 'playing';
}

function update(dt) {
  if (state.mode !== 'playing') return;
  state.time += dt;
  if (state.banner && state.banner.t < 90) state.banner.t -= dt;

  if (state.staged) {
    // Frozen pose, living rings: keep a footstep ripple at each guard.
    state.stepTimer -= dt;
    if (state.stepTimer <= 0) {
      state.stepTimer = 0.9;
      for (const g of state.guards) spawnRing(state.rings, g.x, g.y, 'guardStep', 46, 1.0);
      if (state.shotKind === 'patrol') {
        // Keep the thrown coin ringing in the middle of the market.
        spawnRing(state.rings, 480, 300, 'coin', 130, 1.1);
        spawnRing(state.rings, state.player.x, state.player.y, 'sneak', 26, 1.0);
      }
    }
    updateRings(state.rings, dt);
    return;
  }

  // --- player movement ---
  const mv = moveVector(input);
  const sprinting = input.sprint && (mv.x !== 0 || mv.y !== 0);
  const speed = sprinting ? PLAYER_SPRINT_SPEED : PLAYER_SNEAK_SPEED;
  state.player.x += mv.x * speed * dt;
  state.player.y += mv.y * speed * dt;
  resolveCircleRects(state.world, state.player, PLAYER_R);

  // Footsteps: a quiet ripple while sneaking, a loud one while sprinting.
  if (mv.x !== 0 || mv.y !== 0) {
    state.stepTimer -= dt;
    if (state.stepTimer <= 0) {
      state.stepTimer = sprinting ? PLAYER_STEP_SPRINT : PLAYER_STEP_SNEAK;
      spawnRing(state.rings, state.player.x, state.player.y,
        sprinting ? 'sprint' : 'sneak', sprinting ? 64 : 26, sprinting ? 0.8 : 0.6);
    }
  }

  // --- relic pickups ---
  for (const relic of state.world.relics) {
    if (!relic.taken && Math.hypot(relic.x - state.player.x, relic.y - state.player.y) < RELIC_PICKUP_DIST) {
      relic.taken = true;
      const n = state.world.relics.filter((r) => r.taken).length;
      state.banner = n >= 3
        ? { text: 'ALL 3 LANTERNS — GO!', sub: 'reach the green EXIT gate', t: 2.5 }
        : { text: `${relic.name.toUpperCase()} STOLEN`, sub: `${n} of 3 lanterns`, t: 2.0 };
    }
  }

  // --- exit ---
  if (pointInRect(state.player.x, state.player.y, state.world.exit)) {
    const n = state.world.relics.filter((r) => r.taken).length;
    if (n >= 3) {
      state.mode = 'win';
      announce('You slipped out unseen with all three lanterns.');
      return;
    }
    if (!state.banner || state.banner.t <= 0) {
      state.banner = { text: 'THE GATE IS LOCKED', sub: `steal ${3 - n} more lantern${3 - n > 1 ? 's' : ''} first`, t: 1.6 };
    }
  }

  // Announce the alarm state to the screen-reader status line.
  const alarmWord = state.alarm > 60 ? 'Alarm high. A guard is chasing you.'
    : state.alarm > 30 ? 'A guard is suspicious.'
    : 'Unseen.';
  announce(alarmWord);

  // --- guards and detection ---
  let maxAlarm = 0;
  for (const g of state.guards) {
    updateGuard(g, dt, state.world, state.player, state.rings, state);
    const event = updateDetection(g, state.player, state.world, dt, state);
    if (event === 'nearMiss') {
      state.banner = { text: 'CLOSE ONE!', sub: 'the cone swept past you — hold still', t: 2.2 };
    }
    if (g.detection > maxAlarm) maxAlarm = g.detection;
  }
  state.alarm = maxAlarm;
  if (state.caught) {
    state.mode = 'lose';
    announce('Caught by a guard.');
    return;
  }
  updateRings(state.rings, dt);
}

function drawPlayer() {
  const p = state.player;
  ctx.save();
  ctx.fillStyle = '#2ec4b6';
  ctx.beginPath();
  ctx.arc(p.x, p.y, PLAYER_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#0b3b36';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
  ctx.fill();
  if (playerHidden(state)) {
    ctx.fillStyle = '#2ec4b6';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDDEN', p.x, p.y - PLAYER_R - 8);
  } else {
    ctx.fillStyle = '#ffb84d';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RANI', p.x, p.y - PLAYER_R - 8);
  }
  ctx.restore();
}

function render() {
  ctx.fillStyle = '#12172a';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawFloor(ctx, state.world);
  // Cones first, under the stalls: a solid stall cuts the light, so the
  // cone reads as blocked by cover instead of shining through it.
  for (const g of state.guards) drawCone(ctx, g);
  for (const g of state.guards) drawPatrolPath(ctx, g);
  drawMarket(ctx, state.world);
  drawLampsAndRelics(ctx, state.world);
  drawRings(ctx, state.rings);
  for (const g of state.guards) drawGuard(ctx, g);
  for (const g of state.guards) drawDetectionArc(ctx, g);
  drawPlayer();
  drawBanner(ctx, state);
  drawHUD(ctx, state);
  if (state.mode === 'title') drawTitleScreen(ctx);
  if (state.mode === 'win' || state.mode === 'lose') drawEndScreen(ctx, state);
}

function announce(text) {
  if (text !== state.statusText) {
    state.statusText = text;
    statusEl.textContent = text;
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

const input = createInput(
  canvas,
  (x, y) => { if (state.mode === 'playing') throwCoin(state, x, y); },
  () => { if (state.mode === 'playing') douseNearestLamp(state); },
  () => startNight(),
  () => resetNight(),
);

resetNight();
requestAnimationFrame(frame);

// Debug handle for automated play-tests: read the live state, never used
// by the game itself.
window.__pasarMalam = {
  getState: () => state,
  reset: resetNight,
};
