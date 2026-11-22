// noiseRings.js — sound made visible. Every footstep ripples out as an
// expanding ring, so the player can hear with their eyes: a guard's steps
// tell where the guard is, a sprint tells everyone where you are, and a
// thrown coin rings exactly where the guards should look instead of at you.
import { COIN_THROW_RANGE, COIN_NOISE_RADIUS } from './config.js';

export function createRings() {
  return [];
}

export function spawnRing(rings, x, y, kind, maxR, life) {
  rings.push({ x, y, kind, r: 6, maxR, life, age: 0 });
  // Cap the list so a long night cannot grow it without bound.
  if (rings.length > 40) rings.splice(0, rings.length - 40);
}

export function updateRings(rings, dt) {
  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i];
    ring.age += dt;
    const frac = ring.age / ring.life;
    ring.r = 6 + (ring.maxR - 6) * frac;
    if (frac >= 1) rings.splice(i, 1);
  }
}

export function drawRings(ctx, rings) {
  ctx.save();
  for (const ring of rings) {
    const frac = ring.age / ring.life;
    const alpha = (1 - frac) * 0.8;
    if (ring.kind === 'guardStep') {
      ctx.strokeStyle = `rgba(235,240,255,${alpha})`;
      ctx.lineWidth = 2;
    } else if (ring.kind === 'coin') {
      ctx.strokeStyle = `rgba(255,211,77,${alpha})`;
      ctx.lineWidth = 3;
    } else if (ring.kind === 'sprint') {
      ctx.strokeStyle = `rgba(255,120,90,${alpha})`;
      ctx.lineWidth = 2.5;
    } else {
      ctx.strokeStyle = `rgba(46,196,182,${alpha})`;
      ctx.lineWidth = 2;
    }
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// Throw a coin toward (tx, ty). It lands within range and rings loudly;
// the nearest guard walks over to investigate the sound.
export function throwCoin(state, tx, ty) {
  if (state.coins <= 0 || state.mode !== 'playing') return false;
  const dx = tx - state.player.x;
  const dy = ty - state.player.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 20) return false;
  const reach = Math.min(dist, COIN_THROW_RANGE);
  const lx = state.player.x + (dx / dist) * reach;
  const ly = state.player.y + (dy / dist) * reach;
  state.coins--;
  spawnRing(state.rings, lx, ly, 'coin', COIN_NOISE_RADIUS, 1.4);
  let best = null;
  let bestD = Infinity;
  for (const g of state.guards) {
    const d = Math.hypot(g.x - lx, g.y - ly);
    if (d < bestD) { bestD = d; best = g; }
  }
  if (best && best.mode !== 'chase') {
    best.mode = 'investigate';
    best.investigateTarget = { x: lx, y: ly };
    best.investigateWait = 2.5;
    best.detection = Math.max(best.detection, 35);
  }
  return true;
}
