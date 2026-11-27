// hud.js — heads-up display and the title / end cards. The HUD always
// shows score, distance, lives and the FARMER meter while running.

import { GOAL_M, MODES, MODE_ORDER } from './world.js';

// Mode buttons on the title card, in stage coordinates (1280x800).
// Exported so main.js hit-tests clicks against exactly these rects.
export const MODE_BUTTONS = MODE_ORDER.map((mode, i) => ({
  mode,
  x: 370 + i * 190,
  y: 460,
  w: 170,
  h: 52,
}));

export const MODE_DESCRIPTIONS = {
  easy: 'EASY: 5 lives, a kinder farmer, and obstacles spaced far apart.',
  medium: 'MEDIUM: 3 lives — the classic chase, just as v1 intended.',
  hard: 'HARD: only 2 lives, an aggressive farmer, obstacles packed tight.',
};

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(24,14,28,0.72)';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(255,217,141,0.55)'; ctx.lineWidth = 2; ctx.stroke();
}

function hearts(ctx, lives, maxLives = 3) {
  const total = Math.max(1, maxLives);
  for (let i = 0; i < total; i++) {
    const x = 36 + i * 34, y = 104;
    ctx.fillStyle = i < lives ? '#ff4d5e' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(x, y + 12);
    ctx.bezierCurveTo(x - 16, y - 4, x - 6, y - 16, x, y - 6);
    ctx.bezierCurveTo(x + 6, y - 16, x + 16, y - 4, x, y + 12);
    ctx.fill();
  }
}

export function drawHud(ctx, w) {
  if (w.phase === 'title') return;
  panel(ctx, 18, 16, 300, 108);
  ctx.fillStyle = '#ffd98a';
  ctx.font = 'bold 26px system-ui, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('SCORE ' + w.score, 36, 54);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 21px system-ui, sans-serif';
  ctx.fillText('DIST  ' + Math.min(GOAL_M, Math.floor(w.dist)) + ' m / ' + GOAL_M + ' m', 36, 82);
  hearts(ctx, Math.max(0, w.lives), w.maxLives || 3);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 16px system-ui, sans-serif';
  // Corn counter sits just right of however many hearts this mode has.
  ctx.fillText('CORN x' + w.corn, 44 + (w.maxLives || 3) * 34, 110);

  // Farmer meter: fills red as he closes in.
  panel(ctx, 880, 16, 382, 74);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.fillText('FARMER', 900, 46);
  const frac = Math.max(0, Math.min(1, 1 - w.farmerGap / 60));
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath(); ctx.roundRect(1010, 30, 232, 20, 9); ctx.fill();
  ctx.fillStyle = frac > 0.72 ? '#ff3b30' : frac > 0.45 ? '#ff9429' : '#57c84d';
  if (frac > 0.02) { ctx.beginPath(); ctx.roundRect(1010, 30, 232 * frac, 20, 9); ctx.fill(); }
  ctx.fillStyle = '#ffd98a';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText(frac > 0.72 ? 'HE IS RIGHT BEHIND YOU!' : 'gap ' + Math.max(0, Math.round(w.farmerGap)) + ' m', 1010, 76);

  // Progress bar to the gate.
  ctx.fillStyle = 'rgba(24,14,28,0.6)';
  ctx.beginPath(); ctx.roundRect(340, 24, 500, 14, 7); ctx.fill();
  ctx.fillStyle = '#57c84d';
  const p = Math.min(1, w.dist / GOAL_M);
  if (p > 0.01) { ctx.beginPath(); ctx.roundRect(340, 24, 500 * p, 14, 7); ctx.fill(); }
  ctx.fillStyle = '#ffffff';
  ctx.font = '13px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PARDON GATE ' + Math.round(p * 100) + '%', 590, 58);
  ctx.textAlign = 'left';

  // Current difficulty, tucked under the left panel so it never overlaps
  // the score panel above it or the flash message in the centre.
  ctx.fillStyle = 'rgba(24,14,28,0.72)';
  ctx.beginPath(); ctx.roundRect(18, 132, 180, 34, 9); ctx.fill();
  ctx.strokeStyle = 'rgba(255,217,141,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#ffd98a';
  ctx.font = 'bold 16px system-ui, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('MODE ' + String(w.mode || 'medium').toUpperCase(), 32, 155);

  if (w.flashT > 0 && w.phase === 'run') {
    ctx.fillStyle = 'rgba(214,60,50,0.92)';
    ctx.font = 'bold 30px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(w.flash, 640, 150);
    ctx.textAlign = 'left';
  }
}

function card(ctx, w, h) {
  ctx.fillStyle = 'rgba(20,10,24,0.66)';
  ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = '#fdf3d8';
  ctx.beginPath(); ctx.roundRect((1280 - w) / 2, 170, w, h, 22); ctx.fill();
  ctx.strokeStyle = '#b5506a'; ctx.lineWidth = 5; ctx.stroke();
}

export function drawTitle(ctx, w) {
  card(ctx, 760, 500);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8e2f35';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('PARDON RUN', 640, 248);
  ctx.fillStyle = '#5d3a22';
  ctx.font = 'italic 25px Georgia, serif';
  ctx.fillText('The Great Turkey Escape', 640, 288);
  ctx.fillStyle = '#333';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('Dinner is at seven. You are the dinner.', 640, 334);
  ctx.fillText('Outrun the farmer, dodge hot ovens and carving knives,', 640, 364);
  ctx.fillText('snatch corn, and reach the Pardon Gate at 1,200 m.', 640, 392);
  ctx.fillStyle = '#2e7d4f';
  ctx.font = 'bold 21px system-ui, sans-serif';
  ctx.fillText('SPACE / W / CLICK — jump      S / DOWN — duck', 640, 430);
  // Difficulty picker: three buttons, the chosen one clearly highlighted.
  const selected = MODES[w.mode] ? w.mode : 'medium';
  for (const btn of MODE_BUTTONS) {
    const active = btn.mode === selected;
    ctx.fillStyle = active ? '#b5506a' : '#efe3c2';
    ctx.beginPath(); ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 12); ctx.fill();
    ctx.strokeStyle = active ? '#5d1020' : '#8a6d3b'; ctx.lineWidth = active ? 4 : 2; ctx.stroke();
    ctx.fillStyle = active ? '#ffffff' : '#5d3a22';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(btn.mode.toUpperCase(), btn.x + btn.w / 2, btn.y + 34);
  }
  ctx.fillStyle = '#5d3a22';
  ctx.font = 'italic 17px system-ui, sans-serif';
  ctx.fillText(MODE_DESCRIPTIONS[selected], 640, 532);
  ctx.fillStyle = '#8a6d3b';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('Keys 1 / 2 / 3 or ← / → choose difficulty', 640, 556);
  ctx.fillStyle = '#b5506a';
  ctx.font = 'bold 27px system-ui, sans-serif';
  const pulse = 0.75 + Math.sin(w.time * 4) * 0.25;
  ctx.globalAlpha = pulse;
  ctx.fillText('Press SPACE or click to run!', 640, 606);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

export function drawEnd(ctx, w) {
  card(ctx, 640, 420);
  ctx.textAlign = 'center';
  const won = w.phase === 'escaped';
  ctx.fillStyle = won ? '#2e7d4f' : '#8e2f35';
  ctx.font = 'bold 58px Georgia, serif';
  ctx.fillText(won ? 'ESCAPED!' : 'CAUGHT!', 640, 262);
  ctx.fillStyle = '#5d3a22';
  ctx.font = 'italic 23px Georgia, serif';
  ctx.fillText(won
    ? 'Through the Pardon Gate — officially pardoned!'
    : 'Served on a platter... with lovely garnish.', 640, 306);
  ctx.fillStyle = '#333';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('Final score: ' + w.score, 640, 366);
  ctx.fillText('Distance: ' + Math.min(GOAL_M, Math.floor(w.dist)) + ' m of ' + GOAL_M + ' m', 640, 402);
  ctx.fillText('Corn collected: ' + w.corn + '   Lives left: ' + Math.max(0, w.lives), 640, 438);
  if (!won) {
    // A platter joke under the card text.
    ctx.fillStyle = '#cfd6de';
    ctx.beginPath(); ctx.ellipse(640, 500, 92, 18, 0, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#57c84d';
    ctx.beginPath(); ctx.arc(578, 492, 9, 0, 6.29); ctx.arc(702, 492, 9, 0, 6.29); ctx.fill();
  }
  ctx.fillStyle = '#b5506a';
  ctx.font = 'bold 26px system-ui, sans-serif';
  const pulse = 0.75 + Math.sin(w.time * 4) * 0.25;
  ctx.globalAlpha = pulse;
  ctx.fillText('Press R, SPACE or click to run again', 640, 556);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}
