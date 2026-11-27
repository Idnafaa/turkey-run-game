// random.js — small seeded generator so runs and screenshot scenes are
// reproducible: the same seed always lays out the same farmyard.

export function makeRng(seed) {
  let state = (seed * 2654435761) >>> 0 || 123456789;
  return function next() {
    state ^= state << 13; state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5; state >>>= 0;
    return state / 4294967296;
  };
}

export function pick(rng, lo, hi) {
  return lo + rng() * (hi - lo);
}
