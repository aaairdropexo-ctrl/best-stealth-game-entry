// safetyLight.js — lighting is the safety map. Floor under a burning lamp
// is exposed amber; floor in shadow is deep indigo and safe. Standing in
// shadow while no cone touches you earns the HIDDEN tag, and dousing a lamp
// with the E key turns its pool of light into shadow you can use.
import { DOUSE_RANGE } from './config.js';
import { tileLitAt } from './world.js';

export function playerInShadow(world, player) {
  return !tileLitAt(world, player.x, player.y);
}

export function playerHidden(state) {
  if (!playerInShadow(state.world, state.player)) return false;
  for (const g of state.guards) {
    if (g.mode === 'chase') return false;
  }
  return true;
}

// The nearest burning lamp within dousing reach, or null.
export function nearestLampInRange(state) {
  let best = null;
  let bestD = Infinity;
  for (const lamp of state.world.lamps) {
    if (!lamp.lit) continue;
    const d = Math.hypot(lamp.x - state.player.x, lamp.y - state.player.y);
    if (d < bestD) { bestD = d; best = lamp; }
  }
  return best && bestD <= DOUSE_RANGE ? best : null;
}

// Douse the nearest burning lamp within reach. Its light pool becomes
// shadow immediately, opening a new safe route through the market.
export function douseNearestLamp(state) {
  if (state.douses <= 0 || state.mode !== 'playing') return false;
  const best = nearestLampInRange(state);
  if (!best) return false;
  best.lit = false;
  state.douses--;
  state.banner = { text: 'LAMP DOUSED — shadow made', sub: 'this pool is safe now', t: 2.0 };
  return true;
}
