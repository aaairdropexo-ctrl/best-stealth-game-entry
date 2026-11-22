// score.js — the night's score: lantern points, near-miss bonuses, strikes
// that cost points, and the heist bonuses that close a night. The score is
// the only thing a strike can take: it never changes a guard's speed or
// the win condition, so chasing a big score is a risk the player chooses.
import {
  RELIC_POINTS, NEAR_MISS_POINTS, GHOST_BONUS,
  TIME_BONUS_CAP, STRIKE_PENALTY,
} from './config.js';

export function createScore() {
  return { total: 0, relics: 0, nearMiss: 0, strikes: 0, ghost: 0, time: 0 };
}

// One stolen lantern: +100.
export function scoreRelic(score) {
  score.total += RELIC_POINTS;
  score.relics += RELIC_POINTS;
  return RELIC_POINTS;
}

// A cone that sweeps past at 60% alarm without spotting you: +25.
export function scoreNearMiss(score) {
  score.total += NEAR_MISS_POINTS;
  score.nearMiss += NEAR_MISS_POINTS;
  return NEAR_MISS_POINTS;
}

// A guard entering chase is one strike: −50, never below zero.
export function scoreStrike(score) {
  score.strikes += 1;
  score.total = Math.max(0, score.total - STRIKE_PENALTY);
  return STRIKE_PENALTY;
}

// Closing a heist: up to +120 for speed (one point per second under the
// cap) and +150 when no guard ever chased you in that heist.
export function scoreHeistBonus(score, heistSeconds, spotted) {
  const timeBonus = Math.max(0, TIME_BONUS_CAP - Math.floor(heistSeconds));
  const ghostBonus = spotted ? 0 : GHOST_BONUS;
  score.total += timeBonus + ghostBonus;
  score.time += timeBonus;
  score.ghost += ghostBonus;
  return { timeBonus, ghostBonus };
}
