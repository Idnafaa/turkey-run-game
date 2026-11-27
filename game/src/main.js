// main.js — PARDON RUN entry point: owns the canvas, the frame loop and
// the phase changes (title -> run -> escaped/caught -> restart).

import { createWorld, startRun, stepWorld, MODES, MODE_ORDER } from './world.js';
import { drawScene, VIEW_W, VIEW_H } from './render.js';
import { drawHud, drawTitle, drawEnd, MODE_BUTTONS } from './hud.js';
import { createInput } from './input.js';
import { sfx } from './audio.js';
import { readShotRequest, applyShotScene } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const shot = readShotRequest();
const world = createWorld(shot ? shot.seed : 7);
const inputState = { duck: false, jumpQueued: false };

function beginOrJump() {
  sfx.unlock();
  if (world.phase === 'title') startRun(world);
  else if (world.phase === 'run') inputState.jumpQueued = true;
  else startRun(world);
}

// Last stage transform computed by frame(); used to map tap coordinates.
let stageScale = 1, stageOffX = 0, stageOffY = 0;

function setMode(mode) {
  if (!MODES[mode]) return;
  world.mode = mode;
  // Keep the title preview in sync: gap and lives for the chosen mode.
  // (Speed is the same v1 formula in every mode, so it is not touched.)
  const p = MODES[mode];
  if (world.phase === 'title') { world.farmerGap = p.startGap; world.lives = p.lives; world.maxLives = p.lives; }
  sfx.corn();
}

function cycleMode(dir) {
  const idx = MODE_ORDER.indexOf(world.mode);
  const next = MODE_ORDER[(idx + dir + MODE_ORDER.length) % MODE_ORDER.length];
  setMode(next);
}

function handleTap(data) {
  sfx.unlock();
  if (world.phase === 'title' && data && typeof data.clientX === 'number') {
    const sx = (data.clientX - stageOffX) / stageScale;
    const sy = (data.clientY - stageOffY) / stageScale;
    const btn = MODE_BUTTONS.find((b) => sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h);
    if (btn) { setMode(btn.mode); return; }
  }
  beginOrJump();
}

const held = createInput((action, data) => {
  if (shot) return;
  if (action === 'tap') handleTap(data);
  else if (action === 'jump' || action === 'confirm') beginOrJump();
  else if (action === 'restart' && world.phase !== 'run') startRun(world);
  else if (action === 'mode' && world.phase === 'title') setMode(data && data.mode);
  else if (action === 'modePrev' && world.phase === 'title') cycleMode(-1);
  else if (action === 'modeNext' && world.phase === 'title') cycleMode(1);
});

if (shot) applyShotScene(world, shot.scene);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
  last = now;
  if (!shot) {
    inputState.duck = held.duck;
    // stepWorld advances the clock during a run; the title and end cards
    // still need a ticking clock for their pulsing prompt, so add it here.
    if (world.phase !== 'run') world.time += dt;
    const events = stepWorld(world, dt, inputState);
    for (const ev of events) {
      if (ev === 'jump') sfx.gobble();
      else if (ev === 'hit') { sfx.squawk(); sfx.thud(); }
      else if (ev === 'corn') sfx.corn();
      else if (ev === 'escaped') sfx.jingle(true);
      else if (ev === 'caught') sfx.jingle(false);
    }
  }
  // Scale the fixed 1280x800 stage to fit the window, keeping its aspect.
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  const offX = (window.innerWidth - VIEW_W * scale) / 2;
  const offY = (window.innerHeight - VIEW_H * scale) / 2;
  stageScale = scale; stageOffX = offX; stageOffY = offY;
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawScene(ctx, world);
  drawHud(ctx, world);
  if (world.phase === 'title') drawTitle(ctx, world);
  if (world.phase === 'escaped' || world.phase === 'caught') drawEnd(ctx, world);
  if (status) status.textContent = 'PARDON RUN — ' + world.phase + ', score ' + world.score + ', distance ' + Math.floor(world.dist) + ' metres.';
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
