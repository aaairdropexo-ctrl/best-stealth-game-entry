// patrol.js — the guards' patrol routes: waypoint walking, investigating a
// noise, chasing a spotted thief, and the ghost marker that shows where a
// guard will be three seconds from now. The patrol path is drawn on the
// floor so the player can learn it and plan around it.
import {
  GUARD_PATROL_SPEED, GUARD_INVESTIGATE_SPEED, GUARD_CHASE_SPEED,
  GUARD_R, CONE_RANGE, CATCH_DIST, GUARD_STEP_INTERVAL,
} from './config.js';
import { resolveCircleRects } from './world.js';
import { spawnRing } from './noiseRings.js';

export function createGuards(defs) {
  return defs.map((d) => {
    const [sx, sy] = d.waypoints[0];
    return {
      name: d.name,
      color: d.color,
      x: sx,
      y: sy,
      angle: 0,
      waypoints: d.waypoints,
      wpIndex: 1,
      mode: 'patrol', // patrol | investigate | chase
      detection: 0,
      investigateTarget: null,
      investigateWait: 0,
      stepTimer: 0,
      pauseTimer: 0,
    };
  });
}

function moveToward(g, tx, ty, speed, dt, world) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const step = Math.min(dist, speed * dt);
  g.x += (dx / dist) * step;
  g.y += (dy / dist) * step;
  const targetAngle = Math.atan2(dy, dx);
  let diff = targetAngle - g.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  g.angle += diff * Math.min(1, dt * 8);
  resolveCircleRects(world, g, GUARD_R);
  return dist - step < 2;
}

export function updateGuard(g, dt, world, player, rings, state) {
  // Footstep rings: every step the guard takes ripples out on the floor.
  g.stepTimer -= dt;
  if (g.stepTimer <= 0 && g.mode !== 'idle') {
    g.stepTimer = GUARD_STEP_INTERVAL;
    spawnRing(rings, g.x, g.y, 'guardStep', 46, 0.9);
  }

  if (g.mode === 'chase') {
    const caught = moveToward(g, player.x, player.y, GUARD_CHASE_SPEED, dt, world);
    if (Math.hypot(player.x - g.x, player.y - g.y) < CATCH_DIST) state.caught = true;
    return caught;
  }

  if (g.mode === 'investigate' && g.investigateTarget) {
    const arrived = moveToward(
      g, g.investigateTarget.x, g.investigateTarget.y,
      GUARD_INVESTIGATE_SPEED, dt, world,
    );
    if (arrived) {
      g.investigateWait -= dt;
      if (g.investigateWait <= 0) {
        g.mode = 'patrol';
        g.investigateTarget = null;
        g.wpIndex = nearestWaypointIndex(g);
      }
    }
    return false;
  }

  // Patrol: walk the loop, pausing briefly at each corner.
  if (g.pauseTimer > 0) {
    g.pauseTimer -= dt;
    return false;
  }
  const wp = g.waypoints[g.wpIndex];
  const arrived = moveToward(g, wp[0], wp[1], GUARD_PATROL_SPEED, dt, world);
  if (arrived) {
    g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
    g.pauseTimer = 0.6;
  }
  return false;
}

export function nearestWaypointIndex(g) {
  let best = 0;
  let bestD = Infinity;
  g.waypoints.forEach((wp, i) => {
    const d = Math.hypot(wp[0] - g.x, wp[1] - g.y);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}

// Where will this guard be in `seconds` if it keeps patrolling? Walk the
// waypoint loop forward without moving the real guard.
export function predictGhost(g, seconds) {
  let x = g.x;
  let y = g.y;
  let idx = g.wpIndex;
  let remaining = seconds * GUARD_PATROL_SPEED;
  let guard = 0;
  while (remaining > 0 && guard < 12) {
    guard++;
    const wp = g.waypoints[idx];
    const dx = wp[0] - x;
    const dy = wp[1] - y;
    const dist = Math.hypot(dx, dy);
    if (dist <= remaining) {
      x = wp[0];
      y = wp[1];
      remaining -= dist;
      idx = (idx + 1) % g.waypoints.length;
    } else {
      x += (dx / dist) * remaining;
      y += (dy / dist) * remaining;
      remaining = 0;
    }
  }
  return { x, y };
}

export function drawPatrolPath(ctx, guard) {
  ctx.save();
  ctx.strokeStyle = 'rgba(235,240,255,0.55)';
  ctx.lineWidth = 2;
  ctx.setLineDash([2, 9]);
  ctx.lineCap = 'round';
  ctx.beginPath();
  const pts = guard.waypoints;
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  // Arrowheads show the direction of travel along the loop.
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.fillStyle = 'rgba(235,240,255,0.75)';
    ctx.beginPath();
    ctx.moveTo(mx + Math.cos(a) * 8, my + Math.sin(a) * 8);
    ctx.lineTo(mx + Math.cos(a + 2.5) * 7, my + Math.sin(a + 2.5) * 7);
    ctx.lineTo(mx + Math.cos(a - 2.5) * 7, my + Math.sin(a - 2.5) * 7);
    ctx.closePath();
    ctx.fill();
  }
  // Ghost: where the guard will be in 3 seconds.
  const ghost = predictGhost(guard, 3);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(ghost.x, ghost.y, GUARD_R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('3s', ghost.x, ghost.y - GUARD_R - 4);
  ctx.restore();
}

export function drawGuard(ctx, guard) {
  ctx.save();
  ctx.translate(guard.x, guard.y);
  // Body: a market vendor with a cap, facing the patrol direction.
  ctx.fillStyle = guard.color;
  ctx.beginPath();
  ctx.arc(0, 0, GUARD_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f6e7c8';
  ctx.beginPath();
  ctx.arc(Math.cos(guard.angle) * 4, Math.sin(guard.angle) * 4, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(Math.cos(guard.angle) * 7, Math.sin(guard.angle) * 7, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Name tag under the guard, so each guard reads as a person, not a dot.
  ctx.fillStyle = 'rgba(232,236,255,0.9)';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(guard.name.toUpperCase(), guard.x, guard.y + GUARD_R + 12);

  // Status word above the guard's head.
  let word = null;
  let color = '#ffffff';
  if (guard.mode === 'chase') { word = 'SPOTTED !'; color = '#ff5a4d'; }
  else if (guard.mode === 'investigate') { word = 'WHAT WAS THAT?'; color = '#ffd34d'; }
  else if (guard.detection >= 30) { word = 'SUSPICIOUS ?'; color = '#ffd34d'; }
  if (word) {
    ctx.save();
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.fillText(word, guard.x, guard.y - GUARD_R - 10);
    ctx.restore();
  }
}
