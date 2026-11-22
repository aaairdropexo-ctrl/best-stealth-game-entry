// input.js — keyboard and mouse, kept apart from the game rules so the
// controls can change without touching the stealth systems.
export function createInput(canvas, onCoinThrow, onDouse, onStart, onRestart) {
  const input = {
    keys: new Set(),
    mouse: { x: 0, y: 0 },
    sprint: false,
  };

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    const key = e.key.toLowerCase();
    input.keys.add(key);
    if (key === 'shift') input.sprint = true;
    if (key === 'enter') onStart();
    if (key === 'r') onRestart();
    if (key === 'q') onCoinThrow(input.mouse.x, input.mouse.y);
    if (key === 'e') onDouse();
  });
  window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    input.keys.delete(key);
    if (key === 'shift') input.sprint = false;
  });
  // Losing the window must never leave a movement key stuck down.
  window.addEventListener('blur', () => {
    input.keys.clear();
    input.sprint = false;
  });
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    input.mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    input.mouse.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  });
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    onCoinThrow(x, y);
  });
  return input;
}

export function moveVector(input) {
  let x = 0;
  let y = 0;
  const k = input.keys;
  if (k.has('a') || k.has('arrowleft')) x -= 1;
  if (k.has('d') || k.has('arrowright')) x += 1;
  if (k.has('w') || k.has('arrowup')) y -= 1;
  if (k.has('s') || k.has('arrowdown')) y += 1;
  if (x !== 0 && y !== 0) {
    const inv = 1 / Math.hypot(x, y);
    x *= inv;
    y *= inv;
  }
  return { x, y };
}
