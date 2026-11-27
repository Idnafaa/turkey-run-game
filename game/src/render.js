// render.js — all canvas drawing: dusk sky, parallax farm, the animated
// turkey, the farmer, ovens, knives, corn and the Pardon Gate. Vector art
// only, drawn fresh each frame from world state.

import { GOAL_M, GROUND_Y } from './world.js';

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const TURKEY_X = 360;
const PX_PER_M = 11;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function drawScene(ctx, w) {
  const scroll = w.dist * PX_PER_M;
  drawSky(ctx, scroll);
  drawGround(ctx, scroll);
  // Pardon Gate appears as the finish nears.
  // Once escaped, the turkey has crossed the gate; keep the gate in frame
  // beside the end card instead of exactly under the turkey.
  const gateX = w.phase === 'escaped' ? 1005 : TURKEY_X + (GOAL_M - w.dist) * PX_PER_M;
  if (gateX < VIEW_W + 120 && w.phase !== 'title') drawGate(ctx, gateX);
  const sorted = [...w.items].sort((a, b) => a.x - b.x);
  for (const it of sorted) drawItem(ctx, w, it);
  drawFarmer(ctx, w);
  drawTurkey(ctx, w);
}

function drawSky(ctx, scroll) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#3a2350');
  sky.addColorStop(0.55, '#b5506a');
  sky.addColorStop(1, '#f2a65a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, GROUND_Y + 4);
  // Setting sun.
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath(); ctx.arc(1010, 392, 74, 0, 6.29); ctx.fill();
  ctx.fillStyle = 'rgba(255,190,110,0.35)';
  ctx.beginPath(); ctx.arc(1010, 392, 108, 0, 6.29); ctx.fill();
  // Far hills and a red barn, slow parallax.
  ctx.fillStyle = '#6d3555';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW_W; x += 80) {
    const off = (x + scroll * 0.12) % 640;
    ctx.lineTo(x, GROUND_Y - 120 - Math.sin(off * 0.02) * 34);
  }
  ctx.lineTo(VIEW_W, GROUND_Y); ctx.closePath(); ctx.fill();
  drawBarn(ctx, 180 - (scroll * 0.22 % 1500) + 1500 * 0, scroll);
  // Tree line, mid parallax.
  ctx.fillStyle = '#4a2545';
  for (let i = 0; i < 9; i++) {
    const tx = ((i * 190 - scroll * 0.35) % 1620 + 1620) % 1620 - 160;
    ctx.beginPath(); ctx.arc(tx, GROUND_Y - 118, 52, 0, 6.29); ctx.fill();
    ctx.fillRect(tx - 7, GROUND_Y - 120, 14, 120);
  }
}

function drawBarn(ctx, _x, scroll) {
  const bx = 880 - (scroll * 0.22 % 1700);
  const x = bx < -260 ? bx + 1700 : bx;
  const y = GROUND_Y - 190;
  ctx.fillStyle = '#8e2f35';
  ctx.fillRect(x, y + 60, 190, 130);
  ctx.fillStyle = '#6e2129';
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 62); ctx.lineTo(x + 95, y); ctx.lineTo(x + 204, y + 62); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f3e3c2';
  ctx.fillRect(x + 72, y + 104, 46, 86);
  ctx.strokeStyle = '#f3e3c2'; ctx.lineWidth = 5;
  ctx.strokeRect(x + 24, y + 78, 34, 34);
}

function drawGround(ctx, scroll) {
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = '#96603a';
  ctx.fillRect(0, GROUND_Y, VIEW_W, 16);
  ctx.fillStyle = '#5d3a22';
  for (let i = 0; i < 26; i++) {
    const gx = ((i * 97 - scroll) % 1300 + 1300) % 1300;
    ctx.fillRect(gx, GROUND_Y + 34 + (i % 4) * 32, 34, 6);
  }
  // Fence posts rushing past.
  ctx.fillStyle = '#c9a06a';
  for (let i = 0; i < 12; i++) {
    const fx = ((i * 128 - scroll * 1) % 1420 + 1420) % 1420 - 60;
    ctx.fillRect(fx, GROUND_Y - 64, 10, 64);
  }
  ctx.fillRect(0, GROUND_Y - 52, VIEW_W, 7);
  ctx.fillRect(0, GROUND_Y - 26, VIEW_W, 7);
}

function drawGate(ctx, x) {
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(x, GROUND_Y - 250, 16, 250);
  ctx.fillRect(x + 150, GROUND_Y - 250, 16, 250);
  ctx.fillStyle = '#2e7d4f';
  rr(ctx, x - 26, GROUND_Y - 292, 218, 52, 10); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 25px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PARDON GATE', x + 83, GROUND_Y - 257);
  ctx.fillStyle = '#ffd94d';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.arc(x + 8 + i * 40, GROUND_Y - 226, 5, 0, 6.29); ctx.fill();
  }
}

function drawItem(ctx, w, it) {
  const x = TURKEY_X + it.x * PX_PER_M;
  if (x < -80 || x > VIEW_W + 80) return;
  if (it.kind === 'oven') drawOven(ctx, x, w.time);
  else if (it.kind === 'knife') drawKnife(ctx, x, it);
  else drawCorn(ctx, x, it);
}

function drawOven(ctx, x, time) {
  const y = GROUND_Y;
  ctx.fillStyle = '#3c3f45';
  rr(ctx, x - 40, y - 84, 80, 84, 8); ctx.fill();
  ctx.fillStyle = '#22242a';
  rr(ctx, x - 30, y - 72, 60, 46, 6); ctx.fill();
  // Fire glow inside, flickering with time.
  const fl = 0.75 + Math.sin(time * 11 + x) * 0.25;
  ctx.fillStyle = '#ff7b2f';
  ctx.beginPath();
  ctx.moveTo(x - 20, y - 28);
  ctx.quadraticCurveTo(x - 8, y - 28 - 26 * fl, x, y - 52 * fl);
  ctx.quadraticCurveTo(x + 10, y - 28 - 20 * fl, x + 20, y - 28);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffc63f';
  ctx.beginPath(); ctx.arc(x, y - 34, 8 * fl + 3, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#565b63';
  ctx.fillRect(x - 40, y - 96, 80, 12);
  ctx.fillStyle = '#e8e8e8';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x - 22 + i * 22, y - 90, 4, 0, 6.29); ctx.fill(); }
  ctx.fillStyle = '#ffb03a';
  ctx.font = 'bold 13px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('HOT!', x, y - 104);
}

function drawKnife(ctx, x, it) {
  const lift = it.low ? 44 : 96 + Math.sin(it.spin * 0.6) * 10;
  const y = GROUND_Y - lift;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(it.low ? -0.12 : Math.sin(it.spin) * 0.5);
  // Blade.
  ctx.fillStyle = '#dfe6ee';
  ctx.beginPath();
  ctx.moveTo(-46, 0); ctx.lineTo(18, -9); ctx.lineTo(30, 0); ctx.lineTo(18, 7); ctx.lineTo(-46, 5);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-40, -2, 52, 3);
  // Handle.
  ctx.fillStyle = '#7a4a21';
  rr(ctx, 28, -6, 26, 12, 5); ctx.fill();
  ctx.restore();
  // Sparkle.
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  const sx = x - 30, sy = y - 14;
  ctx.fillRect(sx - 1, sy - 7, 2, 14); ctx.fillRect(sx - 7, sy - 1, 14, 2);
}

function drawCorn(ctx, x, it) {
  const lift = 26 + Math.sin(it.arc * 0.9) * 22;
  const y = GROUND_Y - lift - 30;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#3f9e4d';
  ctx.beginPath(); ctx.ellipse(-8, 10, 6, 14, -0.5, 0, 6.29); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8, 10, 6, 14, 0.5, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#ffd83d';
  rr(ctx, -9, -18, 18, 34, 8); ctx.fill();
  ctx.strokeStyle = '#e0a92e'; ctx.lineWidth = 1.6;
  for (let r = -12; r <= 12; r += 8) { ctx.beginPath(); ctx.moveTo(-9, r); ctx.lineTo(9, r); ctx.stroke(); }
  ctx.restore();
}

export function drawFarmer(ctx, w) {
  if (w.phase === 'title') return;
  // Farmer x follows his gap behind the turkey.
  const fx = TURKEY_X - 60 - w.farmerGap * 6.4;
  if (fx < -110) return;
  const bob = Math.sin(w.farmerBob) * 5;
  const y = GROUND_Y + bob * 0.3;
  ctx.save();
  ctx.translate(fx, y);
  // Legs running.
  ctx.strokeStyle = '#3a4a7a'; ctx.lineWidth = 11; ctx.lineCap = 'round';
  const lp = Math.sin(w.farmerBob) * 20;
  ctx.beginPath(); ctx.moveTo(0, -62); ctx.lineTo(-lp, -6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -62); ctx.lineTo(lp, -6); ctx.stroke();
  // Body: plaid shirt.
  ctx.fillStyle = '#c23b2e';
  rr(ctx, -24, -128, 50, 70, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-24, -104); ctx.lineTo(26, -104); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -128); ctx.lineTo(0, -58); ctx.stroke();
  // Arm holding a fork toward the turkey.
  ctx.strokeStyle = '#e8b08a'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(20, -112); ctx.lineTo(58, -92 + bob * 0.4); ctx.stroke();
  ctx.strokeStyle = '#cfd6de'; ctx.lineWidth = 4;
  const hx = 58, hy = -92 + bob * 0.4;
  ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 26, hy - 4); ctx.stroke();
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(hx + 26, hy - 4); ctx.lineTo(hx + 36, hy - 4 + i * 7); ctx.stroke();
  }
  // Head and straw hat.
  ctx.fillStyle = '#e8b08a';
  ctx.beginPath(); ctx.arc(0, -146, 19, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#e8c85a';
  ctx.fillRect(-30, -160, 60, 8);
  rr(ctx, -16, -176, 32, 16, 5); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(8, -148, 2.6, 0, 6.29); ctx.fill();
  ctx.restore();
}

export function drawTurkey(ctx, w) {
  const t = w.turkey;
  const ducking = t.ducking && t.y === 0 && w.phase === 'run';
  const x = TURKEY_X;
  const y = GROUND_Y - t.y;
  ctx.save();
  ctx.translate(x, y);
  if (w.shake > 0) ctx.translate((Math.random() - 0.5) * 8 * w.shake, 0);
  const blink = t.hurt > 0 && Math.floor(w.time * 14) % 2 === 0;
  ctx.globalAlpha = blink ? 0.35 : 1;
  const run = w.phase === 'run' && t.y === 0;
  const legSwing = run ? Math.sin(t.runPhase) * 17 : 4;
  // Legs.
  ctx.strokeStyle = '#e8912d'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  if (!ducking) {
    ctx.beginPath(); ctx.moveTo(-6, -26); ctx.lineTo(-6 + legSwing, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -26); ctx.lineTo(10 - legSwing, 0); ctx.stroke();
  }
  const bodyY = ducking ? -34 : -52;
  // Tail feathers.
  const fan = ['#8a5a2b', '#a96f35', '#c98a3f', '#a96f35', '#8a5a2b'];
  fan.forEach((c, i) => {
    ctx.save();
    ctx.translate(-30, bodyY + 4);
    ctx.rotate(-0.9 + i * 0.32 + Math.sin(t.runPhase * 0.7 + i) * 0.05);
    ctx.fillStyle = c;
    rr(ctx, -7, -44, 14, 46, 7); ctx.fill();
    ctx.restore();
  });
  // Body.
  ctx.fillStyle = '#9c6a33';
  ctx.beginPath(); ctx.ellipse(0, bodyY, 36, ducking ? 20 : 26, 0, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#b57f42';
  ctx.beginPath(); ctx.ellipse(6, bodyY - 4, 26, 18, 0, 0, 6.29); ctx.fill();
  // Wing, flapping while airborne.
  const flap = t.y > 0 ? Math.sin(w.time * 22) * 0.7 : Math.sin(t.runPhase) * 0.18;
  ctx.save();
  ctx.translate(-2, bodyY);
  ctx.rotate(0.35 + flap);
  ctx.fillStyle = '#7d5226';
  ctx.beginPath(); ctx.ellipse(10, 6, 20, 10, 0.4, 0, 6.29); ctx.fill();
  ctx.restore();
  // Neck and head.
  const headX = ducking ? 38 : 30;
  const headY = ducking ? bodyY - 6 : bodyY - 30;
  ctx.strokeStyle = '#5b83b4'; ctx.lineWidth = 11;
  ctx.beginPath(); ctx.moveTo(22, bodyY - 8); ctx.quadraticCurveTo(32, bodyY - 20, headX, headY + 6); ctx.stroke();
  ctx.fillStyle = '#6d97c4';
  ctx.beginPath(); ctx.arc(headX, headY, 13, 0, 6.29); ctx.fill();
  // Wattle and beak.
  ctx.fillStyle = '#d63c32';
  ctx.beginPath(); ctx.ellipse(headX + 6, headY + 9, 5, 9, 0.3, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#f2a62b';
  ctx.beginPath();
  ctx.moveTo(headX + 11, headY - 2); ctx.lineTo(headX + 26, headY + 2); ctx.lineTo(headX + 11, headY + 6);
  ctx.closePath(); ctx.fill();
  // Eye: wide with alarm.
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(headX + 4, headY - 3, 5.4, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.arc(headX + 6, headY - 3, 2.7, 0, 6.29); ctx.fill();
  ctx.restore();
}
