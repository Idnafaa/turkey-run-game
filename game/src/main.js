// main.js — PARDON RUN entry point: owns the canvas, the frame loop and
// the phase changes (title -> run -> escaped/caught -> restart).

import { createWorld, startRun, stepWorld } from './world.js';
import { drawScene, VIEW_W, VIEW_H } from './render.js';
import { drawHud, drawTitle, drawEnd } from './hud.js';
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

const held = createInput((action) => {
  if (shot) return;
  if (action === 'jump' || action === 'confirm') beginOrJump();
  if (action === 'restart' && world.phase !== 'run') startRun(world);
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
