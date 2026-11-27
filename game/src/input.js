// input.js — keyboard and mouse control. Jump: Space / W / ArrowUp / click.
// Duck: S / ArrowDown (held). Start and restart: Enter, Space or click.
// The handler only records intent; the world decides what it means.

export function createInput(onPress) {
  const held = { duck: false };
  const press = (action) => { if (onPress) onPress(action); };

  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) return;
    const k = ev.code;
    if (k === 'Space' || k === 'KeyW' || k === 'ArrowUp') { ev.preventDefault(); press('jump'); }
    else if (k === 'KeyS' || k === 'ArrowDown') { held.duck = true; }
    else if (k === 'Enter') press('confirm');
    else if (k === 'KeyR') press('restart');
  });
  window.addEventListener('keyup', (ev) => {
    if (ev.code === 'KeyS' || ev.code === 'ArrowDown') held.duck = false;
  });
  window.addEventListener('pointerdown', () => press('jump'));
  return held;
}
