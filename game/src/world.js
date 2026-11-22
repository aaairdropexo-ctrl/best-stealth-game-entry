// world.js — the night market itself: floor tiles, stalls, crates, lamps,
// relic lanterns and the exit gate, plus the geometry every other system
// asks about (is this point blocked? can this guard see that point?).
import {
  PLAY_W, PLAY_H, TILE, LAMP_LIGHT_RADIUS,
  STALLS, CRATES, CART, LAMPS, HEISTS, EXIT_RECT,
} from './config.js';

export function buildWorld(heistIndex = 0) {
  const obstacles = [];
  for (const s of STALLS) obstacles.push({ ...s, kind: 'stall' });
  for (const c of CRATES) obstacles.push({ ...c, kind: 'crate' });
  obstacles.push({ ...CART, kind: 'cart' });
  return {
    obstacles,
    lamps: LAMPS.map((l) => ({ ...l })),
    relics: HEISTS[heistIndex].relics.map((r) => ({ ...r })),
    exit: { ...EXIT_RECT },
  };
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function pointBlocked(world, px, py) {
  if (px < 0 || py < 0 || px > PLAY_W || py > PLAY_H) return true;
  for (const o of world.obstacles) if (pointInRect(px, py, o)) return true;
  return false;
}

// Push a circle out of every rectangle it overlaps. Returns true if pushed.
export function resolveCircleRects(world, body, r) {
  let pushed = false;
  for (const o of world.obstacles) {
    const cx = Math.max(o.x, Math.min(body.x, o.x + o.w));
    const cy = Math.max(o.y, Math.min(body.y, o.y + o.h));
    const dx = body.x - cx;
    const dy = body.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < r * r && d2 > 0.0001) {
      const d = Math.sqrt(d2);
      body.x = cx + (dx / d) * r;
      body.y = cy + (dy / d) * r;
      pushed = true;
    } else if (d2 <= 0.0001) {
      body.y = o.y - r;
      pushed = true;
    }
  }
  body.x = Math.max(r, Math.min(PLAY_W - r, body.x));
  body.y = Math.max(r, Math.min(PLAY_H - r, body.y));
  return pushed;
}

// Sampled line of sight: true when no obstacle stands between the two points.
export function segmentBlocked(world, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(4, Math.ceil(dist / 14));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const px = ax + dx * t;
    const py = ay + dy * t;
    for (const o of world.obstacles) {
      if (pointInRect(px, py, o)) return true;
    }
  }
  return false;
}

// A floor tile is lit when a burning lamp reaches it.
export function tileLitAt(world, px, py) {
  for (const lamp of world.lamps) {
    if (!lamp.lit) continue;
    if (Math.hypot(px - lamp.x, py - lamp.y) <= LAMP_LIGHT_RADIUS) return true;
  }
  return false;
}

export function drawFloor(ctx, world) {
  const cols = Math.ceil(PLAY_W / TILE);
  const rows = Math.ceil(PLAY_H / TILE);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * TILE;
      const y = row * TILE;
      const cx = x + TILE / 2;
      const cy = y + TILE / 2;
      const lit = tileLitAt(world, cx, cy);
      ctx.fillStyle = (row + col) % 2 === 0 ? '#1a2242' : '#161d38';
      ctx.fillRect(x, y, TILE, TILE);
      if (lit) {
        ctx.fillStyle = 'rgba(255,176,66,0.20)';
        ctx.fillRect(x, y, TILE, TILE);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.strokeRect(x + 0.5, y + 0.5, TILE, TILE);
    }
  }
}

export function drawMarket(ctx, world) {
  // Exit gate: a green glowing arch at the top-right corner.
  const e = world.exit;
  ctx.save();
  ctx.fillStyle = 'rgba(46,204,113,0.25)';
  ctx.fillRect(e.x - 6, e.y - 6, e.w + 12, e.h + 12);
  ctx.fillStyle = '#1e7a46';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = '#2ecc71';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2);
  ctx.restore();

  for (const o of world.obstacles) {
    if (o.kind === 'stall') {
      ctx.fillStyle = '#7a4a2b';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#5d371f';
      ctx.fillRect(o.x, o.y + o.h - 10, o.w, 10);
      // Striped awning along the front edge.
      const stripes = Math.floor(o.w / 24);
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#d94f3d' : '#f6e7c8';
        ctx.fillRect(o.x + i * 24, o.y - 4, 24, 14);
      }
      ctx.fillStyle = '#f6e7c8';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(o.label, o.x + o.w / 2, o.y + o.h / 2 + 4);
      // Little goods on the counter so each stall reads as a shop.
      const goods = ['#ffd34d', '#2ecc71', '#ff5a4d'];
      for (let gi = 0; gi < 3; gi++) {
        ctx.fillStyle = goods[(gi + o.x) % 3];
        ctx.beginPath();
        ctx.arc(o.x + 22 + gi * 26, o.y + o.h - 20, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (o.kind === 'crate') {
      ctx.fillStyle = '#8a6a3b';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = '#5d4623';
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
      ctx.beginPath();
      ctx.moveTo(o.x + 4, o.y + 4);
      ctx.lineTo(o.x + o.w - 4, o.y + o.h - 4);
      ctx.moveTo(o.x + o.w - 4, o.y + 4);
      ctx.lineTo(o.x + 4, o.y + o.h - 4);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#5d6d7e';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#8595a6';
      ctx.beginPath();
      ctx.arc(o.x + 14, o.y + o.h - 6, 7, 0, Math.PI * 2);
      ctx.arc(o.x + o.w - 14, o.y + o.h - 6, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawLampsAndRelics(ctx, world) {
  for (const lamp of world.lamps) {
    if (lamp.lit) {
      const g = ctx.createRadialGradient(lamp.x, lamp.y, 4, lamp.x, lamp.y, 46);
      g.addColorStop(0, 'rgba(255,210,110,0.85)');
      g.addColorStop(1, 'rgba(255,180,70,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, 46, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#3d3d5c';
    ctx.fillRect(lamp.x - 2, lamp.y - 4, 4, 10);
    ctx.fillStyle = lamp.lit ? '#ffd34d' : '#4a4a68';
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y - 8, 7, 0, Math.PI * 2);
    ctx.fill();
    if (!lamp.lit) {
      ctx.strokeStyle = 'rgba(180,190,220,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lamp.x - 9, lamp.y - 17);
      ctx.lineTo(lamp.x + 9, lamp.y + 1);
      ctx.stroke();
    }
  }
  for (const relic of world.relics) {
    if (relic.taken) continue;
    ctx.save();
    ctx.translate(relic.x, relic.y);
    ctx.fillStyle = 'rgba(255,211,77,0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd34d';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b03a2e';
    ctx.fillRect(-3, -18, 6, 5);
    ctx.fillRect(-3, 12, 6, 5);
    ctx.restore();
  }
}
