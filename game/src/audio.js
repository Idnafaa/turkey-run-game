// audio.js — tiny WebAudio chirps drawn from oscillators only. The context
// is created lazily and every call is guarded, so the game stays silent and
// safe when the browser has not granted audio yet.

let ctx = null;

function ensureCtx() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  } catch { return null; }
}

function tone(freqA, freqB, dur, type, vol, when = 0) {
  const ac = ensureCtx();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqA, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqB), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  } catch { /* audio is decoration only */ }
}

export const sfx = {
  unlock() { ensureCtx(); },
  gobble() { tone(520, 240, 0.16, 'square', 0.06); tone(700, 300, 0.12, 'square', 0.05, 0.09); },
  squawk() { tone(900, 180, 0.28, 'sawtooth', 0.09); },
  corn() { tone(880, 1320, 0.09, 'sine', 0.07); },
  thud() { tone(140, 60, 0.18, 'triangle', 0.1); },
  jingle(win) {
    const notes = win ? [523, 659, 784, 1046] : [392, 330, 262, 196];
    notes.forEach((f, i) => tone(f, f, 0.22, 'triangle', 0.08, i * 0.13));
  },
};
