// input.js — keyboard and mouse control. Jump: Space / W / ArrowUp / click.
// Duck: S / ArrowDown (held). Start and restart: Enter, Space or click.
// Mode select on the title: Digit1/2/3 pick directly, ArrowLeft/Right move.
// Pointer taps carry their client coordinates as a 'tap' action so main.js
// can tell a mode-button click from a click to start / jump.
// The handler only records intent; the world decides what it means.

export function createInput(onPress) {
  const held = { duck: false };
  const press = (action, data) => { if (onPress) onPress(action, data); };

  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) return;
    const k = ev.code;
    if (k === 'Space' || k === 'KeyW' || k === 'ArrowUp') { ev.preventDefault(); press('jump'); }
    else if (k === 'KeyS' || k === 'ArrowDown') { held.duck = true; }
    else if (k === 'Enter') press('confirm');
    else if (k === 'KeyR') press('restart');
    else if (k === 'Digit1') press('mode', { mode: 'easy' });
    else if (k === 'Digit2') press('mode', { mode: 'medium' });
    else if (k === 'Digit3') press('mode', { mode: 'hard' });
    else if (k === 'ArrowLeft') { ev.preventDefault(); press('modePrev'); }
    else if (k === 'ArrowRight') { ev.preventDefault(); press('modeNext'); }
  });
  window.addEventListener('keyup', (ev) => {
    if (ev.code === 'KeyS' || ev.code === 'ArrowDown') held.duck = false;
  });
  window.addEventListener('pointerdown', (ev) => press('tap', { clientX: ev.clientX, clientY: ev.clientY }));
  return held;
}
