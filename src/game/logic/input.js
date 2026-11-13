// What the player is pressing. The keyboard and the touch pad both write here, the game reads it every frame.
// input: { keys: { ArrowUp: true, ... }, padX, padY }  (pad = the touch stick, each from -1 to 1)

const KEYS_LEFT = ['ArrowLeft', 'a', 'q'];
const KEYS_RIGHT = ['ArrowRight', 'd'];
const KEYS_UP = ['ArrowUp', 'w', 'z'];
const KEYS_DOWN = ['ArrowDown', 's'];
export const ACTION_KEYS = [' ', 'e', 'Enter'];

export function makeInput() {
  return { keys: {}, padX: 0, padY: 0 };
}

function isDown(input, names) {
  return names.some((name) => input.keys[name]);
}

// The direction wanted: { x, y }, never longer than 1 (so walking in diagonal is not faster).
export function directionOf(input) {
  let x = input.padX + (isDown(input, KEYS_RIGHT) ? 1 : 0) - (isDown(input, KEYS_LEFT) ? 1 : 0);
  let y = input.padY + (isDown(input, KEYS_DOWN) ? 1 : 0) - (isDown(input, KEYS_UP) ? 1 : 0);
  const length = Math.hypot(x, y);
  if (length > 1) {
    x /= length;
    y /= length;
  }
  return { x: x, y: y };
}

// The direction to look at, to go by (dx, dy): 'up' | 'down' | 'left' | 'right'.
export function facingOf(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

// Stops everything (when a menu opens: the hero must not keep walking).
export function releaseAll(input) {
  input.keys = {};
  input.padX = 0;
  input.padY = 0;
}
