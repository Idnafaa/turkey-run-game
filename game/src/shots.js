// shots.js — deterministic screenshot scenes. Opening the game with
// ?shot=<name>&seed=<n> freezes a composed moment of the real game so the
// entry screenshots are stable: title, play, chase and end.

export const SHOT_SCENES = {
  title: { phase: 'title', mode: 'medium' },
  play: {
    phase: 'run', dist: 386, score: 461, corn: 3, lives: 3, farmerGap: 38,
    items: [
      { kind: 'oven', x: 34, taken: false },
      { kind: 'corn', x: 16, arc: 0, taken: false },
      { kind: 'corn', x: 18.6, arc: 1, taken: false },
      { kind: 'corn', x: 21.2, arc: 2, taken: false },
      { kind: 'corn', x: -8, arc: 1, taken: false },
    ],
  },
  chase: {
    phase: 'run', dist: 742, score: 867, corn: 5, lives: 2, farmerGap: 9,
    flash: 'A carving knife grazed you!', flashT: 1.4,
    items: [
      { kind: 'knife', x: 22, low: false, spin: 2.2, taken: false },
      { kind: 'knife', x: 44, low: true, spin: 0.6, taken: false },
      { kind: 'oven', x: 58, taken: false },
    ],
  },
  end: {
    phase: 'escaped', dist: 1200, score: 1725, corn: 9, lives: 2, farmerGap: 30,
    items: [],
  },
};

export function readShotRequest() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('shot');
  if (!name || !SHOT_SCENES[name]) return null;
  const seed = Number(params.get('seed') ?? 1) || 1;
  return { name, seed, scene: SHOT_SCENES[name] };
}

export function applyShotScene(w, scene) {
  w.phase = scene.phase;
  if (scene.mode) w.mode = scene.mode;
  if (scene.dist !== undefined) w.dist = scene.dist;
  if (scene.score !== undefined) w.score = scene.score;
  if (scene.corn !== undefined) w.corn = scene.corn;
  if (scene.lives !== undefined) w.lives = scene.lives;
  if (scene.farmerGap !== undefined) w.farmerGap = scene.farmerGap;
  if (scene.flash) { w.flash = scene.flash; w.flashT = scene.flashT ?? 1.4; }
  if (scene.items) w.items = scene.items.map((it) => ({ ...it }));
  w.turkey.runPhase = 2.4;
  w.farmerBob = 1.8;
  w.time = 2.5;
}
