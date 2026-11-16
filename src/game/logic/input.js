// What the player is pressing. The keyboard and the touch pad both write here, the game reads it every frame.
// input: { keys: { ArrowUp: true, ... }, padX, padY }  (pad = the touch stick, each from -1 to 1)

const KEYS_LEFT = ['ArrowLeft', 'a', 'q'];
const KEYS_RIGHT = ['ArrowRight', 'd'];
const KEYS_UP = ['ArrowUp', 'w', 'z'];
const KEYS_DOWN = ['ArrowDown', 's'];
export const ACTION_KEYS = [' ', 'e', 'Enter'];

export function normalizeKey(key) {
  return key.length === 1 ? key.toLowerCase() : key;
}

export function makeInput() {
  return { keys: {}, padX: 0, padY: 0 };
}

function isDown(input, names) {
  return names.some((name) => input.keys[name] || (name.length === 1 && input.keys[name.toUpperCase()]));
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

// Running: the Shift key held, or the touch stick pushed to its edge (a small push walks).
export function isRunning(input) {
  return Boolean(input.keys.Shift || input.keys.ShiftLeft || input.keys.ShiftRight) || Math.hypot(input.padX, input.padY) > 0.92;
}

const FRONT = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// The tile just in front of someone (the hero): where the action button acts.
export function frontTile(player) {
  const [dx, dy] = FRONT[player.dir] || FRONT.down;
  return { x: Math.floor(player.x + dx), y: Math.floor(player.y + dy) };
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
