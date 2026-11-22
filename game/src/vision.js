// vision.js — what a guard can see: the amber cone, the line of sight past
// the stalls, and the detection meter that climbs while you are seen and
// falls while you are not. Being in shadow slows the climb threefold, so
// light itself is the danger.
import {
  CONE_RANGE, CONE_HALF_ANGLE, SUSPICIOUS_AT, NEAR_MISS_AT, CHASE_AT,
  DETECT_LIT_PER_SEC, DETECT_SHADOW_PER_SEC, DETECT_DECAY_PER_SEC,
} from './config.js';
import { segmentBlocked, tileLitAt } from './world.js';
import { nearestWaypointIndex } from './patrol.js';

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function insideCone(guard, px, py) {
  const dx = px - guard.x;
  const dy = py - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CONE_RANGE) return false;
  if (dist < 4) return true;
  return Math.abs(angleDiff(angleTo(guard.x, guard.y, px, py), guard.angle)) <= CONE_HALF_ANGLE;
}

export function guardSeesPlayer(guard, player, world) {
  if (!insideCone(guard, player.x, player.y)) return false;
  return !segmentBlocked(world, guard.x, guard.y, player.x, player.y);
}

// One guard's meter, one frame. Returns 'nearMiss' the first time the alarm
// crosses the near-miss line while the player is still hidden behind cover.
export function updateDetection(guard, player, world, dt, state) {
  const seen = guardSeesPlayer(guard, player, world);
  const before = guard.detection;
  if (seen) {
    const lit = tileLitAt(world, player.x, player.y);
    guard.detection += (lit ? DETECT_LIT_PER_SEC : DETECT_SHADOW_PER_SEC) * dt;
  } else {
    guard.detection -= DETECT_DECAY_PER_SEC * dt;
  }
  guard.detection = Math.max(0, Math.min(CHASE_AT, guard.detection));

  if (guard.detection >= CHASE_AT && guard.mode !== 'chase') {
    guard.mode = 'chase';
    guard.investigateTarget = null;
  } else if (guard.mode === 'chase' && guard.detection < 55) {
    // Lost the thief: give up the chase and rejoin the route at the
    // nearest waypoint instead of teleporting back to the start.
    guard.mode = 'patrol';
    guard.wpIndex = nearestWaypointIndex(guard);
  }

  if (before < NEAR_MISS_AT && guard.detection >= NEAR_MISS_AT && !state.nearMissShown) {
    state.nearMissShown = true;
    return 'nearMiss';
  }
  return null;
}

export function drawCone(ctx, guard) {
  ctx.save();
  ctx.translate(guard.x, guard.y);
  ctx.rotate(guard.angle);
  const chasing = guard.mode === 'chase';
  const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, CONE_RANGE);
  grad.addColorStop(0, chasing ? 'rgba(255,80,60,0.50)' : 'rgba(255,190,80,0.42)');
  grad.addColorStop(1, chasing ? 'rgba(255,80,60,0.05)' : 'rgba(255,190,80,0.06)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, CONE_RANGE, -CONE_HALF_ANGLE, CONE_HALF_ANGLE);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = chasing ? 'rgba(255,90,70,0.7)' : 'rgba(255,214,120,0.65)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(-CONE_HALF_ANGLE) * CONE_RANGE, Math.sin(-CONE_HALF_ANGLE) * CONE_RANGE);
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(CONE_HALF_ANGLE) * CONE_RANGE, Math.sin(CONE_HALF_ANGLE) * CONE_RANGE);
  ctx.stroke();
  ctx.restore();
}

// Thin meter arc under a guard that is getting suspicious.
export function drawDetectionArc(ctx, guard) {
  if (guard.detection < SUSPICIOUS_AT) return;
  const frac = guard.detection / CHASE_AT;
  ctx.save();
  ctx.translate(guard.x, guard.y);
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = frac > 0.6 ? '#ff5a4d' : '#ffd34d';
  ctx.beginPath();
  ctx.arc(0, 0, 20, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
