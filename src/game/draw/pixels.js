import { mix } from './palette';

// Pixel art made simple.
// A "grid" is a small picture: each cell is a color ('#rrggbb', or '#rrggbbaa' for see-through), or null = empty.
// We paint a grid with rectangles, ellipses and "text pictures", add a dark outline, then turn it into a canvas.
// The canvas is drawn bigger later, without smoothing: each cell becomes a crisp square pixel.

export function makeGrid(width, height) {
  return { width: width, height: height, cells: new Array(width * height).fill(null) };
}

export function colorAt(grid, x, y) {
  if (x < 0 || y < 0 || x >= grid.width || y >= grid.height) return null;
  return grid.cells[y * grid.width + x];
}

export function dot(grid, x, y, color) {
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0 || y < 0 || x >= grid.width || y >= grid.height) return;
  grid.cells[y * grid.width + x] = color;
}

export function fillRect(grid, x, y, width, height, color) {
  for (let row = y; row < y + height; row++) {
    for (let column = x; column < x + width; column++) dot(grid, column, row, color);
  }
}

// An ellipse centered on (cx, cy), with the radiuses rx and ry, in pixels.
export function fillEllipse(grid, cx, cy, rx, ry, color) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) dot(grid, x, y, color);
    }
  }
}

// A straight line of pixels from (x0, y0) to (x1, y1).
export function drawLine(grid, x0, y0, x1, y1, color) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    dot(grid, Math.round(x0 + ((x1 - x0) * i) / steps), Math.round(y0 + ((y1 - y0) * i) / steps), color);
  }
}

// A "text picture": rows of letters, one letter = one pixel. colors: { H: '#ff0000', ... }. '.' = nothing.
// A letter that is not in `colors` is skipped too.
export function drawPicture(grid, rows, colors, x = 0, y = 0) {
  rows.forEach((row, rowIndex) => {
    if (row.length !== rows[0].length) console.warn('pixel picture: row ' + rowIndex + ' has a different length', rows);
    for (let column = 0; column < row.length; column++) {
      const color = colors[row[column]];
      if (color) dot(grid, x + column, y + rowIndex, color);
    }
  });
}

// The size of a text picture: { width, height }.
export function pictureSize(rows) {
  return { width: rows[0].length, height: rows.length };
}

// A copy of the grid with an empty border of `margin` cells all around (room for the outline).
export function padded(grid, margin = 1) {
  const result = makeGrid(grid.width + margin * 2, grid.height + margin * 2);
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) dot(result, x + margin, y + margin, colorAt(grid, x, y));
  }
  return result;
}

function isFilled(grid, x, y) {
  const color = colorAt(grid, x, y);
  return color !== null && color.length === 7; // a see-through color (a shadow) does not get an outline
}

// The first filled neighbor of an empty cell (up, down, left or right), or null.
function filledNeighbor(grid, x, y) {
  for (const [dx, dy] of [
    [0, -1],
    [-1, 0],
    [1, 0],
    [0, 1],
  ]) {
    if (isFilled(grid, x + dx, y + dy)) return colorAt(grid, x + dx, y + dy);
  }
  return null;
}

// Every empty cell that touches a filled cell becomes a dark edge. The edge takes a bit of the color it
// surrounds (a dark green around the leaves, a dark brown around the wood): softer than pure black.
export function addOutline(grid, color) {
  const result = { ...grid, cells: [...grid.cells] };
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const neighbor = isFilled(grid, x, y) ? null : filledNeighbor(grid, x, y);
      if (neighbor) result.cells[y * grid.width + x] = mix(neighbor, color, 0.78);
    }
  }
  return result;
}

// ---------- Light and shade (the light comes from the top-left) ----------

// A 4 x 4 grid of thresholds: neighbor pixels take turns between two tones (dithering): a soft blend.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((value) => (value + 0.5) / 16);

// light: from 0 (dark) to 1 (lit) -> one of the `tones` (the darkest first), dithered between two tones.
export function toneOf(tones, light, x, y) {
  const t = Math.min(0.999, Math.max(0, light)) * (tones.length - 1);
  const base = Math.floor(t);
  const next = t - base > BAYER[(y & 3) * 4 + (x & 3)] ? 1 : 0;
  return tones[Math.min(tones.length - 1, base + next)];
}

// A shaded ball, seen from above: lit on the top-left, dark on the bottom-right (leaves, rocks, slimes, bushes).
// tones: from the darkest to the lightest. ambient: how lit the dark side is. brightness: a factor (1 = normal).
export function fillBall(grid, cx, cy, rx, ry, tones, { ambient = 0.12, brightness = 1 } = {}) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / ry;
      const flat = nx * nx + ny * ny;
      if (flat > 1) continue;
      const nz = Math.sqrt(1 - flat);
      const facing = Math.max(0, -0.5 * nx - 0.65 * ny + 0.58 * nz); // how much it faces the light
      dot(grid, x, y, toneOf(tones, (ambient + (1 - ambient) * facing) * brightness, x, y));
    }
  }
}

// Gives volume to a flat picture: the bottom and right edges of a shape get darker, the top and left edges
// lighter, and a pixel just under another color gets its shadow (the hair on the face, the belt on the tunic).
// skip: colors left as they are (eyes, white...).
export function addRimShade(grid, skip = []) {
  const result = { ...grid, cells: [...grid.cells] };
  const isEmpty = (x, y) => !isFilled(grid, x, y);
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const color = colorAt(grid, x, y);
      if (!isFilled(grid, x, y) || skip.includes(color)) continue;
      const above = colorAt(grid, x, y - 1);
      let shaded = color;
      if (isEmpty(x, y + 1) || isEmpty(x + 1, y)) shaded = mix(color, '#14101e', 0.22);
      else if (above && above !== color && isFilled(grid, x, y - 1) && !skip.includes(above)) shaded = mix(color, '#14101e', 0.16);
      else if (isEmpty(x, y - 1) || isEmpty(x - 1, y)) shaded = mix(color, '#ffffff', 0.18);
      result.cells[y * grid.width + x] = shaded;
    }
  }
  return result;
}

// Fills a rectangle of cloth, lit on its left and darker at its bottom.
export function paintCloth(grid, left, top, right, bottom, ramp) {
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      const nx = (x - left) / Math.max(1, right - left);
      const ny = (y - top) / Math.max(1, bottom - top);
      dot(grid, x, y, toneOf(ramp, 0.75 - nx * 0.4 - ny * 0.15, x, y));
    }
  }
}

// A filled triangle. colorAt(x, y): the color of each pixel (a shade, a texture...).
export function fillTriangle(grid, [ax, ay], [bx, by], [cx, cy], colorAt) {
  const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
  for (let y = Math.floor(Math.min(ay, by, cy)); y <= Math.max(ay, by, cy); y++) {
    for (let x = Math.floor(Math.min(ax, bx, cx)); x <= Math.max(ax, bx, cx); x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const w1 = ((bx - px) * (cy - py) - (cx - px) * (by - py)) / area;
      const w2 = ((cx - px) * (ay - py) - (ax - px) * (cy - py)) / area;
      if (w1 >= 0 && w2 >= 0 && w1 + w2 <= 1) dot(grid, x, y, colorAt(x, y));
    }
  }
}

// The same grid, seen in a mirror (left <-> right).
export function mirrored(grid) {
  const result = makeGrid(grid.width, grid.height);
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) dot(result, grid.width - 1 - x, y, colorAt(grid, x, y));
  }
  return result;
}

// Some cells of the shape get another color, always the same ones (a texture: leaves, snow, stones...).
// chance: from 0 to 1. salt: another number = other cells. onlyOn: only the cells of this color (null = any).
export function sprinkle(grid, color, chance, salt, onlyOn = null) {
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const current = colorAt(grid, x, y);
      const isTarget = onlyOn === null ? current !== null : current === onlyOn;
      if (isTarget && randomOf(x, y, salt) < chance) dot(grid, x, y, color);
    }
  }
}

// A number between 0 and 1 that is always the same for the same (x, y, salt).
export function randomOf(x, y, salt = 0) {
  let n = Math.imul(x + 31 * salt, 374761393) + Math.imul(y + 17 * salt, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

// '#ff8800' -> [255, 136, 0, 255]. '#ff880080' -> [255, 136, 0, 128].
function rgbaOf(color) {
  const value = color.slice(1);
  const alpha = value.length === 8 ? parseInt(value.slice(6, 8), 16) : 255;
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16), alpha];
}

export function toCanvas(grid) {
  const canvas = document.createElement('canvas');
  canvas.width = grid.width;
  canvas.height = grid.height;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(grid.width, grid.height);
  grid.cells.forEach((color, index) => {
    if (color === null) return;
    image.data.set(rgbaOf(color), index * 4);
  });
  ctx.putImageData(image, 0, 0);
  return canvas;
}

// The same canvas, every pixel painted in one color (a monster that blinks white when it is hit).
export function silhouette(canvas, color) {
  const copy = document.createElement('canvas');
  copy.width = canvas.width;
  copy.height = canvas.height;
  const ctx = copy.getContext('2d');
  ctx.drawImage(canvas, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, copy.width, copy.height);
  return copy;
}

// ---------- Making each picture only once ----------

const made = new Map();

// make() runs the first time only. The next times, the same result is given back at once.
export function once(key, make) {
  if (!made.has(key)) made.set(key, make());
  return made.get(key);
}

// A text picture -> a canvas with an outline. colors: the letters. outline: the color of the edge (null = none).
// shaded: true = the rim light and shadow are added (see addRimShade).
export function spriteOf(rows, colors, outline, shaded = false) {
  const size = pictureSize(rows);
  let grid = makeGrid(size.width + 2, size.height + 2);
  drawPicture(grid, rows, colors, 1, 1);
  if (shaded) grid = addRimShade(grid);
  return toCanvas(outline ? addOutline(grid, outline) : grid);
}
