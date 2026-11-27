// world.js — the run itself: physics, spawning, collisions, the farmer.
// Distances are in metres; the Pardon Gate stands at GOAL_M. The turkey
// auto-runs to the right, the player only jumps and ducks.

import { makeRng, pick } from './random.js';

export const GOAL_M = 1200;
export const GROUND_Y = 620;

// Difficulty modes. Running speed is identical in every mode (the exact
// v1 formula in stepWorld); modes differ only in lives, farmer behaviour
// and obstacle density. MEDIUM reproduces the original v1 tuning exactly.
export const MODES = {
  easy: { lives: 5, startGap: 56, hitGap: 10, gapRegen: 1.6, spawnMin: 36, spawnMax: 52 },
  medium: { lives: 3, startGap: 46, hitGap: 17, gapRegen: 1.15, spawnMin: 30, spawnMax: 46 },
  hard: { lives: 2, startGap: 36, hitGap: 24, gapRegen: 0.8, spawnMin: 24, spawnMax: 38 },
};
export const MODE_ORDER = ['easy', 'medium', 'hard'];

export function modeParams(mode) {
  return MODES[mode] || MODES.medium;
}

export function createWorld(seed, mode = 'medium') {
  const chosen = MODES[mode] ? mode : 'medium';
  const p = MODES[chosen];
  return {
    phase: 'title', // title | run | escaped | caught
    seed,
    mode: chosen,
    rng: makeRng(seed),
    time: 0,
    dist: 0,
    score: 0,
    corn: 0,
    lives: p.lives,
    maxLives: p.lives,
    speed: 7.2, // metres per second, grows as the run goes on (same in all modes)
    turkey: { y: 0, vy: 0, ducking: false, runPhase: 0, hurt: 0 },
    farmerGap: p.startGap, // metres behind the turkey; 0 means caught
    farmerBob: 0,
    items: [], // {kind: oven|knife|corn, x (screen offset m), y, spin, taken}
    nextSpawn: 26,
    flash: '',
    flashT: 0,
    shake: 0,
  };
}

export function startRun(w) {
  const fresh = createWorld(w.seed, w.mode);
  Object.assign(w, fresh);
  w.phase = 'run';
}

function spawnAhead(w) {
  const rng = w.rng;
  const roll = rng();
  const ahead = 62 + pick(rng, 0, 14);
  if (roll < 0.34) {
    w.items.push({ kind: 'oven', x: ahead, taken: false });
  } else if (roll < 0.62) {
    // A carving knife: either skimming low (duck it) or tossed in an arc.
    const low = rng() < 0.55;
    w.items.push({ kind: 'knife', x: ahead, low, spin: pick(rng, 0, 6.28), taken: false });
  } else {
    const n = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i++) w.items.push({ kind: 'corn', x: ahead + i * 2.6, arc: i, taken: false });
  }
  const tight = Math.min(9, w.dist / 160);
  const mp = modeParams(w.mode);
  w.nextSpawn = w.dist + pick(rng, mp.spawnMin - tight, mp.spawnMax - tight);
}

export function turkeyBox(w) {
  const duck = w.turkey.ducking && w.turkey.y === 0;
  return { h: duck ? 34 : 58, wdt: 64, lift: w.turkey.y };
}

// Returns event strings so main.js can play sounds: 'hit' | 'corn' | 'end'.
export function stepWorld(w, dt, input) {
  const events = [];
  if (w.phase !== 'run') return events;
  w.time += dt;
  const mp = modeParams(w.mode);
  // Speed is deliberately identical in every mode: the exact v1 formula.
  w.speed = 7.2 + Math.min(5.2, w.dist / 210);
  w.dist += w.speed * dt;
  w.score = Math.floor(w.dist) + w.corn * 25;
  w.turkey.runPhase += dt * (6 + w.speed);
  w.farmerBob += dt * 9;
  if (w.flashT > 0) w.flashT -= dt;
  if (w.shake > 0) w.shake = Math.max(0, w.shake - dt * 2.4);
  if (w.turkey.hurt > 0) w.turkey.hurt -= dt;

  // Jump and duck.
  const t = w.turkey;
  t.ducking = !!input.duck;
  if (input.jumpQueued && t.y === 0) {
    t.vy = 13.4; t.y = 0.01; events.push('jump');
  }
  input.jumpQueued = false;
  if (t.y > 0 || t.vy !== 0) {
    t.vy -= 34 * dt;
    t.y += t.vy * dt * 9.2;
    if (t.y <= 0) { t.y = 0; t.vy = 0; }
  }

  // The farmer slowly loses ground while the turkey runs clean, and gains
  // it back over time so a lazy run still ends in a chase.
  w.farmerGap = Math.min(60, w.farmerGap + dt * mp.gapRegen);

  if (w.dist >= w.nextSpawn) spawnAhead(w);

  const box = turkeyBox(w);
  for (const it of w.items) {
    it.x -= w.speed * dt;
    if (it.kind === 'knife') it.spin += dt * 7;
    if (it.taken || it.x < -6 || it.x > 7) continue;
    // Turkey sits at screen x offset 0; items cross it around x = 0.
    if (Math.abs(it.x) > 2.4) continue;
    if (it.kind === 'corn') {
      const cornLift = 26 + Math.sin(it.arc * 0.9) * 22;
      if (Math.abs((t.y + 30) - cornLift) < 52) {
        it.taken = true; w.corn += 1; w.score += 25; events.push('corn');
      }
    } else if (it.kind === 'oven') {
      if (t.y < 30) hit(w, events, 'You clipped a hot oven!');
    } else if (it.kind === 'knife') {
      const knifeLift = it.low ? 44 : 96 + Math.sin(it.spin * 0.6) * 10;
      const ducking = t.ducking && t.y === 0;
      if (it.low) {
        if (!ducking && t.y < 52) hit(w, events, 'A carving knife grazed you!');
      } else if (t.y + box.h > knifeLift - 16 && t.y < knifeLift + 30) {
        hit(w, events, 'A tossed knife nicked you!');
      }
    }
  }
  w.items = w.items.filter((it) => !it.taken && it.x > -14);

  if (w.dist >= GOAL_M) {
    w.phase = 'escaped';
    w.score += w.lives * 100;
    events.push('escaped');
  } else if (w.farmerGap <= 0.5 || w.lives <= 0) {
    w.phase = 'caught';
    events.push('caught');
  }
  return events;
}

function hit(w, events, message) {
  if (w.turkey.hurt > 0) return;
  w.lives -= 1;
  w.turkey.hurt = 1.1;
  w.farmerGap = Math.max(0, w.farmerGap - modeParams(w.mode).hitGap);
  w.flash = message;
  w.flashT = 1.6;
  w.shake = 1;
  events.push('hit');
}
