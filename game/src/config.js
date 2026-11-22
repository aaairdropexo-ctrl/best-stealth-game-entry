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

// The three heirloom lanterns Rani must steal. Each rests just in front of
// a stall so the grab itself is the risky moment.
export const RELICS = [
  { x: 165, y: 185, name: 'Lampion Naga', taken: false },
  { x: 645, y: 420, name: 'Lampion Teratai', taken: false },
  { x: 405, y: 650, name: 'Lampion Bulan', taken: false },
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
