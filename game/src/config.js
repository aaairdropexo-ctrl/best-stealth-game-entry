// config.js — every tunable number for Pasar Malam lives here, so a balance
// change is one edit in one place. No other file hard-codes a game number.
export const CANVAS_W = 1280;
export const CANVAS_H = 800;
export const PLAY_W = 960;
export const PLAY_H = 800;
export const HUD_X = 960;
export const TILE = 40;

export const PLAYER_R = 11;
export const GUARD_R = 13;
export const CONE_RANGE = 175;
export const CONE_HALF_ANGLE = 0.66;

export const PLAYER_SNEAK_SPEED = 135;
export const PLAYER_SPRINT_SPEED = 215;
export const GUARD_PATROL_SPEED = 58;
export const GUARD_INVESTIGATE_SPEED = 88;
export const GUARD_CHASE_SPEED = 118;

export const DETECT_LIT_PER_SEC = 50;
export const DETECT_SHADOW_PER_SEC = 16;
export const DETECT_DECAY_PER_SEC = 30;
export const SUSPICIOUS_AT = 30;
export const NEAR_MISS_AT = 60;
export const CHASE_AT = 100;
export const CATCH_DIST = 26;

export const COIN_COUNT = 5;
export const COIN_THROW_RANGE = 280;
export const COIN_NOISE_RADIUS = 130;
export const DOUSE_COUNT = 2;
export const DOUSE_RANGE = 78;
export const LAMP_LIGHT_RADIUS = 120;
export const RELIC_PICKUP_DIST = 28;
export const GUARD_STEP_INTERVAL = 0.5;
export const PLAYER_STEP_SNEAK = 0.55;
export const PLAYER_STEP_SPRINT = 0.32;

// The night's score: a lantern is worth 100, a near miss 25, a clean
// (ghost) heist 150, and every second under the time cap is worth 1.
// A strike — a guard entering chase — costs 50. Strikes only move the
// score, never the guards, so they deepen the night without making it
// harder to win.
export const RELIC_POINTS = 100;
export const NEAR_MISS_POINTS = 25;
export const GHOST_BONUS = 150;
export const TIME_BONUS_CAP = 120;
export const STRIKE_PENALTY = 50;
export const MAX_STRIKES = 3;

export const COLORS = {
  night: '#12172a',
  tileShadowA: '#1a2242',
  tileShadowB: '#161d38',
  tileLit: 'rgba(255,176,66,0.20)',
  tileLitEdge: 'rgba(255,190,90,0.10)',
  cone: 'rgba(255,190,80,0.30)',
  coneEdge: 'rgba(255,214,120,0.65)',
  coneChase: 'rgba(255,80,60,0.38)',
  patrolPath: 'rgba(235,240,255,0.55)',
  ghost: 'rgba(255,255,255,0.85)',
  player: '#2ec4b6',
  playerRing: '#ffffff',
  guardBody: '#b03a2e',
  guardCap: '#f6e7c8',
  stallWood: '#7a4a2b',
  stallAwningA: '#d94f3d',
  stallAwningB: '#f6e7c8',
  crate: '#8a6a3b',
  cart: '#5d6d7e',
  lampGlow: 'rgba(255,196,90,0.85)',
  lampPole: '#3d3d5c',
  relic: '#ffd34d',
  exitGlow: 'rgba(46,204,113,0.9)',
  hudPanel: '#10142a',
  hudLine: '#2a3358',
  hudText: '#e8ecff',
  hudDim: '#9aa5c9',
  amber: '#ffb84d',
  danger: '#ff5a4d',
  safe: '#2ec4b6',
};

// Market stalls, crates and the cart. Every rect blocks movement and sight.
export const STALLS = [
  { x: 90, y: 90, w: 150, h: 70, label: 'SATE', awning: true },
  { x: 330, y: 70, w: 150, h: 70, label: 'MAINAN', awning: true },
  { x: 590, y: 90, w: 150, h: 70, label: 'KAIN', awning: true },
  { x: 90, y: 330, w: 170, h: 70, label: 'BUAH', awning: true },
  { x: 560, y: 330, w: 170, h: 70, label: 'LAMPION', awning: true },
  { x: 330, y: 560, w: 150, h: 70, label: 'ES TEH', awning: true },
  { x: 640, y: 590, w: 150, h: 70, label: 'GORENGAN', awning: true },
];
export const CRATES = [
  { x: 90, y: 620, w: 60, h: 60 },
  { x: 770, y: 430, w: 60, h: 60 },
  { x: 250, y: 440, w: 60, h: 60 },
];
export const CART = { x: 420, y: 330, w: 90, h: 50 };

// Lamp posts: each lit lamp paints a warm pool on the floor. Douse one and
// its pool turns back into safe shadow.
export const LAMPS = [
  { x: 180, y: 215, lit: true },
  { x: 480, y: 215, lit: true },
  { x: 790, y: 215, lit: true },
  { x: 180, y: 505, lit: true },
  { x: 480, y: 455, lit: true },
  { x: 790, y: 505, lit: true },
];

// The four heirloom lanterns Rani must steal. Each rests just in front of
// a stall so the grab itself is the risky moment. The fourth is a bonus
// hide — the gate opens after three, but a perfect night takes all four.
export const RELICS = [
  { x: 165, y: 185, name: 'Lampion Naga', taken: false },
  { x: 645, y: 420, name: 'Lampion Teratai', taken: false },
  { x: 405, y: 650, name: 'Lampion Bulan', taken: false },
  { x: 250, y: 650, name: 'Lampion Kupu', taken: false },
];

export const EXIT_RECT = { x: 868, y: 26, w: 72, h: 46 };
export const PLAYER_START = { x: 60, y: 740 };

export const GUARD_DEFS = [
  {
    name: 'Pak Darno', color: '#b03a2e',
    waypoints: [[250, 250], [500, 250], [500, 445], [250, 445]],
  },
  {
    name: 'Bu Sari', color: '#8e44ad',
    waypoints: [[700, 250], [880, 250], [880, 470], [700, 470]],
  },
  {
    name: 'Mas Joko', color: '#2e86c1',
    waypoints: [[180, 565], [430, 565], [430, 720], [180, 720]],
  },
  {
    name: 'Mbak Rini', color: '#c27a1e',
    waypoints: [[560, 520], [880, 520], [880, 700], [560, 700]],
  },
];

// Two extra guards who only work the second heist, when the market is
// already on edge after the first theft.
export const GUARD_DEFS_HEIST2 = [
  ...GUARD_DEFS,
  {
    name: 'Pak Tono', color: '#1e8449',
    waypoints: [[120, 300], [320, 300], [320, 480], [120, 480]],
  },
  {
    name: 'Bu Ratna', color: '#7d3c98',
    waypoints: [[560, 180], [880, 180], [880, 300], [560, 300]],
  },
];

// Two more guards who only work the third heist, when the whole market
// is watching after two thefts in one night — plus two more for v4, so
// the last heist has eleven guards and the frame stays crowded.
export const GUARD_DEFS_HEIST3 = [
  ...GUARD_DEFS_HEIST2,
  {
    name: 'Pak Budi', color: '#16a085',
    waypoints: [[180, 640], [380, 640], [380, 760], [180, 760]],
  },
  {
    name: 'Mbak Sinta', color: '#d35400',
    waypoints: [[620, 60], [880, 60], [880, 170], [620, 170]],
  },
  {
    name: 'Kang Dedi', color: '#5b2c6f',
    waypoints: [[60, 60], [60, 250], [280, 250], [280, 60]],
  },
  {
    name: 'Pak Agus', color: '#1f618d',
    waypoints: [[440, 470], [560, 470], [560, 545], [440, 545]],
  },
  {
    name: 'Mbak Dewi', color: '#6c3483',
    waypoints: [[300, 180], [520, 180], [520, 235], [300, 235]],
  },
];

// Three heists in one night at the same market. Heist 1 is the night as it
// was: 4 lanterns, 4 guards. Heist 2 re-hides the loot in new spots and
// adds two guards, so the second half of the night is a fresh puzzle on
// a map the player already knows. Heist 3 hides it again and adds five
// more guards — by the last heist the whole market is watching. The score
// carries across all three.
export const HEISTS = [
  {
    name: 'Lampion Pusaka',
    relics: RELICS,
    guards: GUARD_DEFS,
  },
  {
    name: 'Lampion Emas',
    relics: [
      { x: 845, y: 130, name: 'Lampion Emas', taken: false },
      { x: 90, y: 250, name: 'Lampion Perak', taken: false },
      { x: 500, y: 700, name: 'Lampion Giok', taken: false },
      { x: 300, y: 130, name: 'Lampion Delima', taken: false },
    ],
    guards: GUARD_DEFS_HEIST2,
  },
  {
    name: 'Lampion Zamrud',
    relics: [
      { x: 500, y: 130, name: 'Lampion Zamrud', taken: false },
      { x: 150, y: 700, name: 'Lampion Mutiara', taken: false },
      { x: 860, y: 740, name: 'Lampion Topaz', taken: false },
      { x: 700, y: 690, name: 'Lampion Intan', taken: false },
    ],
    guards: GUARD_DEFS_HEIST3,
  },
];
