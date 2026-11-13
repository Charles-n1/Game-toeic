// "Random" numbers that are always the same for the same place: the world is built the same way every time.

// A number between 0 and 1 for the tile (x, y). salt: another number = another series.
export function noise(x, y, salt = 0) {
  let n = Math.imul(x + salt * 7919, 374761393) + Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

// A SMOOTH number between 0 and 1: it changes slowly from tile to tile (hills, coasts, wavy borders).
// scale: about how many tiles between two "bumps".
export function smoothNoise(x, y, scale, salt = 0) {
  const gx = x / scale;
  const gy = y / scale;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const sx = (gx - x0) * (gx - x0) * (3 - 2 * (gx - x0)); // a soft curve between the two points
  const sy = (gy - y0) * (gy - y0) * (3 - 2 * (gy - y0));
  const a = noise(x0, y0, salt);
  const b = noise(x0 + 1, y0, salt);
  const c = noise(x0, y0 + 1, salt);
  const d = noise(x0 + 1, y0 + 1, salt);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
