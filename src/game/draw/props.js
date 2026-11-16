import { makeGrid, dot, fillRect, fillEllipse, fillBall, toneOf, drawLine, drawPicture, sprinkle, randomOf, addOutline, addRimShade, toCanvas, once, spriteOf, colorAt, fillTriangle } from './pixels';
import { OUTLINE, WOOD, darker, lighter, LEAF_RAMP, LIGHT_LEAF_RAMP, PINE_RAMP, WOOD_RAMP, STONE_RAMP, SNOW_RAMP, THATCH_RAMP, ROOF_RAMPS } from './palette';

// Everything that stands on the ground: trees, rocks, houses, lamps... Each one is a "sprite":
// { canvas, ax, ay } where (ax, ay) is the point of the picture that touches the ground (its feet).

function sprite(canvas, ax, ay) {
  return { canvas: canvas, ax: ax, ay: ay };
}

// A soft shadow on the ground, painted only where the picture is empty (after the outline).
function addShadow(grid, cx, cy, rx, ry) {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1 && colorAt(grid, x, y) === null) dot(grid, x, y, '#14101e40');
    }
  }
}

// ---------- Trees ----------

// A crown of leaves made of many round clumps, each one shaded (lit on its top-left). The clumps are painted from
// the top (behind) to the bottom (in front), and the lower ones are darker: they are in the shade of the others.
// crown: the ellipse of the crown { cx, cy, rx, ry }. size: [smallest, biggest] radius of a clump.
export function paintCrown(grid, crown, clumps, size, ramp, salt) {
  fillBall(grid, crown.cx, crown.cy, crown.rx * 0.88, crown.ry * 0.88, ramp, { ambient: 0.05, brightness: 0.5 }); // no hole inside
  const list = [];
  for (let i = 0; i < clumps; i++) {
    const angle = randomOf(i, salt, 40) * Math.PI * 2;
    const distance = Math.sqrt(randomOf(salt, i, 41)) * 0.78;
    const radius = size[0] + randomOf(i, salt, 42) * (size[1] - size[0]);
    list.push({ x: crown.cx + Math.cos(angle) * crown.rx * distance, y: crown.cy + Math.sin(angle) * crown.ry * distance, r: radius });
  }
  list.sort((a, b) => a.y - b.y);
  for (const clump of list) {
    const depth = (clump.y - (crown.cy - crown.ry)) / (crown.ry * 2); // 0 at the top, 1 at the bottom
    fillBall(grid, clump.x, clump.y, clump.r, clump.r * 0.85, ramp, { ambient: 0.12, brightness: 1.2 - depth * 0.5 });
  }
}

// A round trunk (lit on the left) with roots, and lines of bark.
function paintTrunk(grid, cx, top, bottom, width) {
  const rootSpread = Math.max(2, Math.round(width / 3));
  const rootHeight = Math.max(2, Math.round(width / 4));
  for (let y = top; y <= bottom; y++) {
    const spread = y > bottom - rootHeight ? Math.round(((y - (bottom - rootHeight)) / rootHeight) * rootSpread) : 0;
    for (let x = Math.floor(cx - width / 2 - spread); x < cx + width / 2 + spread; x++) {
      const nx = (x + 0.5 - cx) / (width / 2 + spread);
      dot(grid, x, y, toneOf(WOOD_RAMP, 0.62 - nx * 0.4, x, y));
    }
  }
  const barkLines = Math.max(3, Math.round(width / 3));
  const height = Math.max(4, bottom - top);
  for (let i = 0; i < barkLines; i++) {
    const x = Math.floor(cx - width * 0.3 + (i * width * 0.6) / Math.max(1, barkLines - 1));
    const y0 = top + 3 + ((i * 5) % Math.max(4, Math.floor(height * 0.55)));
    drawLine(grid, x, y0, x, Math.min(bottom - 2, y0 + Math.max(4, Math.floor(height * 0.25))), WOOD_RAMP[1]);
  }
}

// A leafy tree. look: { size: [w, h], crown, clumps, clumpSize, trunk: [top, bottom, width], ramp }
function leafyTree(look, salt) {
  const [width, height] = look.size;
  const grid = makeGrid(width, height);
  const [top, bottom, trunkWidth] = look.trunk;
  paintTrunk(grid, look.crown.cx, top, bottom, trunkWidth);
  paintCrown(grid, look.crown, look.clumps, look.clumpSize, look.ramp, salt);
  const outlined = addOutline(grid, OUTLINE);
  addShadow(outlined, look.crown.cx, bottom, look.crown.rx * 0.72, Math.max(3, Math.round(look.crown.rx * 0.12)));
  return sprite(toCanvas(outlined), Math.round(look.crown.cx), bottom);
}

const OAK = { size: [104, 118], crown: { cx: 52, cy: 46, rx: 45, ry: 39 }, clumps: 36, clumpSize: [9, 15], trunk: [70, 112, 16], ramp: LEAF_RAMP };
const ROUND = { size: [76, 90], crown: { cx: 38, cy: 34, rx: 31, ry: 27 }, clumps: 24, clumpSize: [7.5, 12], trunk: [52, 85, 12], ramp: LIGHT_LEAF_RAMP };

// The big trees of Verbwood. variant: 0, 1 or 2.
export function oakTree(variant) {
  return once('oak' + variant, () => leafyTree(OAK, 20 + variant * 7));
}

// The smaller round trees of the meadows and the villages. variant: 0, 1 or 2.
export function roundTree(variant = 0) {
  return once('round' + variant, () => leafyTree(ROUND, 50 + variant * 7));
}

// A bush: a few clumps, sometimes with berries or flowers. Nobody is stopped by it. variant: 0 to 3.
export function bush(variant) {
  return once('bush' + variant, () => {
    const grid = makeGrid(26, 20);
    paintCrown(grid, { cx: 13, cy: 11, rx: 10, ry: 6.5 }, 6, [3.5, 5.5], LIGHT_LEAF_RAMP, 80 + variant);
    const fruit = ['#e8423f', '#ffffff', '#ff6fa8', null][variant];
    for (let i = 0; fruit && i < 4; i++) dot(grid, 6 + Math.floor(randomOf(i, variant, 81) * 14), 7 + Math.floor(randomOf(variant, i, 82) * 7), fruit);
    const outlined = addOutline(grid, OUTLINE);
    addShadow(outlined, 13, 17, 10, 2);
    return sprite(toCanvas(outlined), 13, 17);
  });
}

// One floor of branches of a pine: lit on the left, with snow on its top and pointed tips at the bottom.
function paintPineFloor(grid, cx, top, bottom, half) {
  const snowDepth = Math.max(2, Math.round((bottom - top) * 0.22));
  for (let y = top; y <= bottom; y++) {
    const width = Math.round(((y - top + 1) / (bottom - top + 1)) * half);
    for (let x = cx - width; x <= cx + width; x++) {
      if (y >= bottom - 1 && (x + y * 2) % 4 === 0) continue; // the tips of the branches
      const nx = (x - cx) / (width + 0.5);
      const isSnow = y - top < snowDepth || (y - top < snowDepth + 2 && nx < -0.15);
      const light = 0.72 - nx * 0.35 - ((y - top) / (bottom - top)) * 0.32;
      dot(grid, x, y, isSnow ? toneOf(SNOW_RAMP, light + 0.2, x, y) : toneOf(PINE_RAMP, light, x, y));
    }
  }
}

// A pine of Frostpeak Pass: 4 floors of branches with snow.
export function pineTree() {
  return once('pine', () => {
    const grid = makeGrid(60, 88);
    paintTrunk(grid, 30, 64, 83, 10);
    [
      [3, 24, 11],
      [17, 41, 17],
      [33, 57, 23],
      [47, 71, 27],
    ].forEach(([top, bottom, half]) => paintPineFloor(grid, 30, top, bottom, half));
    const outlined = addOutline(grid, OUTLINE);
    addShadow(outlined, 30, 83, 20, 4);
    return sprite(toCanvas(outlined), 30, 83);
  });
}

// The dead trees of the Silent Lands.
export function deadTree() {
  return once('dead', () => {
    const grid = makeGrid(38, 54);
    const bark = '#3a2c38';
    const shade = '#271d26';
    fillRect(grid, 16, 18, 6, 33, bark);
    fillRect(grid, 20, 18, 2, 33, shade);
    fillRect(grid, 12, 48, 14, 3, bark);
    const branches = [
      [17, 26, 6, 12],
      [6, 12, 3, 5],
      [10, 17, 4, 15],
      [21, 23, 30, 9],
      [30, 9, 34, 3],
      [26, 14, 32, 12],
      [20, 34, 31, 25],
      [16, 36, 7, 29],
      [18, 19, 18, 5],
      [18, 10, 14, 4],
    ];
    branches.forEach(([x0, y0, x1, y1]) => {
      drawLine(grid, x0, y0, x1, y1, bark);
      drawLine(grid, x0, y0 + 1, x1, y1 + 1, bark);
    });
    sprinkle(grid, '#5a4655', 0.16, 50, bark);
    const outlined = addOutline(addRimShade(grid), OUTLINE);
    addShadow(outlined, 19, 50, 11, 2.5);
    return sprite(toCanvas(outlined), 19, 50);
  });
}

const CACTUS_ROWS = [
  '........GGGG........',
  '.......GLLHGG.......',
  '.......GLLHGG.......',
  '..GG...GLLHGD.......',
  '.GLLG..GLLHGD...GG..',
  '.GLLG..GLLHGD..GLLG.',
  '.GLLG..GLLHGD..GLLG.',
  '.GLLGGGGLLHGD..GLLG.',
  '.GLLLLGGLLHGD..GLLG.',
  '..GGLLGGLLHGDGGGLLG.',
  '....GGGGLLHGGLLLLG..',
  '.......GLLHGGGGGG...',
  '.......GLLHGD.......',
  '.......GLLHGD.......',
  '.......GLLHGD.......',
  '.......GLLHGD.......',
  '.......GLLHGD.......',
  '.......GLLHGD.......',
  '.......GLLHGD.......',
  '.......GLLGGD.......',
  '.......GGGGGD.......',
  '.......DDDDDD.......',
];

// The cacti of Sunscorch Desert.
export function cactus() {
  return once('cactus', () => {
    const canvas = spriteOf(CACTUS_ROWS, { D: '#256b31', G: '#3f9a4a', L: '#7cc45a', H: '#a8e276' }, '#163a1e', true);
    return sprite(canvas, 11, 22);
  });
}

// ---------- Rocks ----------

// cover: what is on the rock: 'moss', 'snow' or null.
export function rock(cover) {
  return once('rock' + cover, () => {
    const grid = makeGrid(24, 19);
    fillBall(grid, 7, 12, 5.5, 4.5, STONE_RAMP);
    fillBall(grid, 17, 12, 6, 4.5, STONE_RAMP);
    fillBall(grid, 12, 9, 9, 7, STONE_RAMP, { ambient: 0.2 });
    if (cover === 'moss') fillBall(grid, 10, 4.5, 5.5, 2.5, LIGHT_LEAF_RAMP, { ambient: 0.3 });
    if (cover === 'snow') fillBall(grid, 12, 4.5, 8, 3, SNOW_RAMP, { ambient: 0.4 });
    const outlined = addOutline(grid, OUTLINE);
    addShadow(outlined, 12, 17, 10, 2);
    return sprite(toCanvas(outlined), 12, 17);
  });
}

const CRYSTAL_ROWS = [
  '.....L........',
  '....LCD.......',
  '....LCD.......',
  '...LCCDD......',
  '...LCCDD...L..',
  '...LCCDD..LCD.',
  '..LCCCDDD.LCD.',
  '..LCCCDDD.LCD.',
  'L.LCCCDDDLCCDD',
  'LDLCCCCDDLCCDD',
  'LDLCCCCDDLCCDD',
  'LDLCCCCDDLCCDD',
  'DDDDDDDDDDDDDD',
];

// The ice crystals of Frostpeak Pass.
export function iceCrystal() {
  return once('crystal', () => {
    const canvas = spriteOf(CRYSTAL_ROWS, { L: '#e2f8ff', C: '#7fd6ff', D: '#3aa0e8' }, '#1d4f7a');
    return sprite(canvas, 8, 14);
  });
}

// ---------- Houses ----------

const PLASTER_RAMP = ['#bfa57a', '#d4bd93', '#e6d3ad', '#f2e4c6', '#faf0dc'];
const GLASS_RAMP = ['#2f5f8f', '#3f7fb5', '#5a9fd6', '#8cc5ee', '#d6f1ff'];
const IRON = { base: '#3a3442', light: '#5a5266' };

// A beam of wood, lit on its top-left.
export function paintBeam(grid, x, y, w, h) {
  for (let row = y; row < y + h; row++) {
    for (let column = x; column < x + w; column++) {
      const edge = (column === x ? 0.2 : 0) + (row === y ? 0.15 : 0) - (column === x + w - 1 ? 0.2 : 0);
      dot(grid, column, row, toneOf(WOOD_RAMP, 0.38 + edge, column, row));
    }
  }
}

// Rows of roof tiles, lit on the top-left, with staggered seams and a bright ridge.
export function paintTiledRoof(grid, x, y, w, h, ramp, slant = 0.36) {
  const safeRamp = ramp || ROOF_RAMPS.red;
  const bottom = y + h - 1;
  for (let row = y; row <= bottom; row++) {
    const inset = Math.min(Math.floor(w / 2) - 4, Math.round((bottom - row) * slant));
    const inRow = (row - y) % 4;
    const offset = Math.floor((row - y) / 4) % 2 === 0 ? 0 : 3;
    for (let col = x + inset; col < x + w - inset; col++) {
      const isSeam = (col - x - inset + offset) % 6 === 0;
      const light = 0.8 - inRow * 0.14 - ((col - x) / w) * 0.14 - (isSeam ? 0.24 : 0);
      dot(grid, col, row, toneOf(safeRamp, light, col, row));
    }
  }
  const ridgeInset = Math.min(Math.floor(w / 2) - 4, Math.round((h - 1) * slant));
  fillRect(grid, x + ridgeInset, y, w - ridgeInset * 2, 2, safeRamp[5]);
  fillRect(grid, x, bottom, w, 2, safeRamp[0]);
}

// Stone masonry blocks with mortar lines and subtle variation.
export function paintStoneMasonry(grid, x, y, w, h, ramp = STONE_RAMP, salt = 60) {
  for (let row = y; row < y + h; row++) {
    const band = Math.floor((row - y) / 5);
    const offset = band % 2 ? 5 : 0;
    for (let col = x; col < x + w; col++) {
      const isMortar = (row - y) % 5 === 4 || (col - x + offset) % 10 === 9;
      const shade = 0.68 - (row - y) * 0.002 - ((row - y) % 5) * 0.03 + randomOf(col, row, salt) * 0.1;
      dot(grid, col, row, isMortar ? ramp[1] : toneOf(ramp, shade, col, row));
    }
  }
}

export function paintChimney(grid, x, y, w = 8, h = 18) {
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      const isMortar = row % 4 === 3;
      dot(grid, col, row, isMortar ? STONE_RAMP[1] : toneOf(STONE_RAMP, 0.72 - (col - x) * 0.06, col, row));
    }
  }
  fillRect(grid, x - 1, y, w + 2, 2, STONE_RAMP[4]);
  fillRect(grid, x + 1, y, w - 2, 1, STONE_RAMP[0]);
}

function paintThatchRoof(grid, x, y, w, h) {
  const bottom = y + h - 1;
  for (let row = y; row <= bottom; row++) {
    const t = (row - y) / Math.max(1, h - 1);
    const inset = Math.min(Math.floor(w / 2) - 6, Math.round((1 - Math.sqrt(t)) * w * 0.24));
    for (let col = x + inset; col < x + w - inset; col++) {
      const strand = randomOf(col, Math.floor(row / 3), 19);
      const ridge = (row - y) < 3 ? 0.2 : 0;
      const light = 0.76 - t * 0.26 - ((col - x) / w) * 0.14 + (strand - 0.5) * 0.24 + ridge;
      dot(grid, col, row, toneOf(THATCH_RAMP, light, col, row));
    }
  }
  for (let col = x; col < x + w; col++) {
    const fringe = 1 + Math.floor(randomOf(col, 7, 21) * 3);
    for (let dy = 0; dy < fringe; dy++) dot(grid, col, bottom + dy, dy === fringe - 1 ? THATCH_RAMP[0] : THATCH_RAMP[2]);
  }
}

function paintLogWalls(grid, x, y, w, h) {
  for (let row = y; row < y + h; row++) {
    const inLog = (row - y) % 6;
    for (let col = x; col < x + w; col++) {
      if (inLog === 5) dot(grid, col, row, '#473422'); // mud chinking
      else {
        const shade = 0.72 - inLog * 0.11 + randomOf(col >> 2, Math.floor((row - y) / 6), 31) * 0.08;
        dot(grid, col, row, toneOf(WOOD_RAMP, shade, col, row));
      }
    }
  }
  paintBeam(grid, x, y, 4, h);
  paintBeam(grid, x + w - 4, y, 4, h);
  fillRect(grid, x, y + h - 3, w, 3, WOOD_RAMP[0]);
}

function paintTimberWalls(grid, x, y, w, h, twoStory) {
  for (let row = y; row < y + h - 7; row++) {
    for (let col = x; col < x + w; col++) {
      const topShade = row < y + 4 ? (y + 4 - row) * 0.1 : 0;
      dot(grid, col, row, toneOf(PLASTER_RAMP, 0.76 - topShade + randomOf(col, row, 60) * 0.08, col, row));
    }
  }
  paintBeam(grid, x, y, 4, h - 6);
  paintBeam(grid, x + w - 4, y, 4, h - 6);
  paintBeam(grid, x, y, w, 3);
  if (twoStory) {
    const midY = y + Math.floor((h - 7) * 0.48);
    paintBeam(grid, x, midY, w, 3);
    for (let i = 1; i < Math.round(w / 44); i++) {
      const bx = x + Math.round((w * i) / Math.round(w / 44));
      paintBeam(grid, bx - 1, y, 3, midY - y);
    }
  }
  for (let col = x; col < x + w; col += 8) {
    const blockW = Math.min(7, x + w - col);
    for (let row = y + h - 7; row < y + h; row++) {
      for (let c = col; c < col + blockW; c++) dot(grid, c, row, toneOf(STONE_RAMP, 0.7 - (row - (y + h - 7)) * 0.08, c, row));
    }
  }
}

function paintStoneFacade(grid, x, y, w, h, twoStory) {
  paintStoneMasonry(grid, x, y, w, h - 7, STONE_RAMP, 60);
  for (let row = y; row < y + h - 7; row += 10) {
    fillRect(grid, x, row, 5, 5, STONE_RAMP[4]);
    fillRect(grid, x + w - 5, row, 5, 5, STONE_RAMP[3]);
  }
  if (twoStory) {
    const midY = y + Math.floor((h - 7) * 0.48);
    fillRect(grid, x - 1, midY, w + 2, 2, STONE_RAMP[4]);
    fillRect(grid, x - 1, midY + 2, w + 2, 1, STONE_RAMP[1]);
  }
  fillRect(grid, x - 1, y + h - 7, w + 2, 7, STONE_RAMP[2]);
  fillRect(grid, x - 1, y + h - 7, w + 2, 2, STONE_RAMP[4]);
}

function paintHutWindow(grid, x, y) {
  paintBeam(grid, x, y, 9, 9);
  fillRect(grid, x + 2, y + 2, 5, 5, '#1d1412');
  paintBeam(grid, x + 4, y + 2, 1, 5);
  paintBeam(grid, x + 2, y + 4, 5, 1);
}

function paintFlowerWindow(grid, x, y) {
  paintBeam(grid, x, y, 12, 12);
  for (let row = 1; row < 11; row++) {
    for (let col = 1; col < 11; col++) dot(grid, x + col, y + row, toneOf(GLASS_RAMP, 0.85 - (row + col) * 0.035, x + col, y + row));
  }
  fillRect(grid, x + 2, y + 2, 2, 2, '#ffffff');
  paintBeam(grid, x + 5, y + 1, 2, 10);
  paintBeam(grid, x + 1, y + 5, 10, 2);
  paintBeam(grid, x - 1, y + 12, 14, 2);
  for (let i = 0; i < 6; i++) fillBall(grid, x + 1 + i * 2, y + 11.5, 1.4, 1.1, i % 2 ? ['#a8182f', '#e8423f', '#ff8a8a'] : ['#b88a12', '#ffd23f', '#fff2a8']);
}

export function paintArchedWindow(grid, x, y, w = 12, h = 15, glass = ['#2a1a4e', '#6442a8', '#d8c8ff']) {
  const rx = Math.floor(w / 2);
  fillRect(grid, x, y + 3, w, h - 3, STONE_RAMP[0]);
  fillEllipse(grid, x + rx, y + 3, rx, 3, STONE_RAMP[0]);
  fillRect(grid, x + 1, y + 3, w - 2, h - 4, glass[1]);
  fillEllipse(grid, x + rx, y + 3, rx - 1, 2.5, glass[1]);
  fillRect(grid, x + 2, y + 3, Math.max(2, Math.floor(w / 4)), 4, glass[2]);
  fillRect(grid, x + rx, y + 1, 1, h - 2, STONE_RAMP[1]);
  fillRect(grid, x - 1, y + h - 1, w + 2, 2, STONE_RAMP[4]);
}

function paintStoneWindow(grid, x, y) {
  paintArchedWindow(grid, x, y, 12, 14, ['#2f5f8f', '#5a9fd6', '#e6f6ff']);
}

// Single or double door centered on `cx` at floor `bottom`.
export function paintDoorway(grid, cx, bottom, { doubleDoor = false, style = 'timber' } = {}) {
  const openW = doubleDoor ? 30 : 16;
  const openH = doubleDoor ? (style === 'stone' ? 28 : 26) : (style === 'hut' ? 20 : style === 'stone' ? 24 : 22);
  const frameW = openW + 4;
  const left = cx - Math.floor(openW / 2);
  const top = bottom - openH;

  if (style === 'stone') {
    fillRect(grid, left - 3, top, frameW + 2, openH, STONE_RAMP[1]);
    fillEllipse(grid, cx, top + 1, Math.floor(frameW / 2) + 1, 6, STONE_RAMP[3]);
    fillRect(grid, cx - 2, top - 6, 4, 5, STONE_RAMP[5]); // keystone
  } else {
    paintBeam(grid, left - 2, top - 2, frameW, openH + 2);
  }

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < left + openW; x++) {
      if (style === 'stone' && y < top + 4 && ((x - cx) * (x - cx)) / ((openW * openW) / 4) + ((y - top - 4) * (y - top - 4)) / 16 > 1) continue;
      const seam = doubleDoor && (x === cx - 1 || x === cx);
      const plank = (x - left) % 4;
      const shade = 0.62 - plank * 0.08 - (y - top) * 0.008;
      dot(grid, x, y, seam ? WOOD_RAMP[0] : plank === 3 ? WOOD_RAMP[1] : toneOf(WOOD_RAMP, shade, x, y));
    }
  }
  if (doubleDoor) {
    fillBall(grid, cx - 3.5, bottom - Math.round(openH * 0.45), 1.4, 1.4, ['#8a6a12', '#e8b83a', '#fff2a8']);
    fillBall(grid, cx + 3.5, bottom - Math.round(openH * 0.45), 1.4, 1.4, ['#8a6a12', '#e8b83a', '#fff2a8']);
  } else {
    fillBall(grid, left + openW - 4, bottom - Math.round(openH * 0.45), 1.4, 1.4, ['#8a6a12', '#e8b83a', '#fff2a8']);
  }
  if (style !== 'hut') fillRect(grid, left - 3, bottom - 2, frameW + 2, 2, STONE_RAMP[4]);
}

// Hanging signboard centered on `cx`, top at `y`.
export function paintSignBoard(grid, cx, y, sign) {
  if (!sign || !SIGNS[sign]) return;
  fillRect(grid, cx - 7, y, 14, 1, IRON.base);
  fillRect(grid, cx - 5, y + 1, 1, 2, IRON.light);
  fillRect(grid, cx + 4, y + 1, 1, 2, IRON.light);
  paintBeam(grid, cx - 6, y + 2, 13, 13);
  fillRect(grid, cx - 5, y + 3, 11, 11, WOOD_RAMP[5]);
  drawPicture(grid, SIGNS[sign], SIGN_COLORS, cx - 4, y + 4);
}

function paintWindowRow(grid, leftBound, rightBound, y, style, winW) {
  const span = rightBound - leftBound;
  if (span < winW + 2) return;
  const paintOne = style === 'hut' ? paintHutWindow : style === 'stone' ? paintStoneWindow : paintFlowerWindow;
  if (span >= winW * 2 + 16) {
    const gap = Math.floor((span - winW * 2) / 3);
    paintOne(grid, leftBound + gap, y);
    paintOne(grid, leftBound + gap * 2 + winW, y);
  } else {
    paintOne(grid, leftBound + Math.floor((span - winW) / 2), y);
  }
}

// house: { w, h, size, style: 'hut' | 'timber' | 'stone', roof, sign }
export function houseSprite(house) {
  const style = house.style || 'timber';
  const roof = house.roof || 'red';
  const doubleDoor = ['hall', 'church', 'palace'].includes(house.size);
  const key = ['house', house.w, house.h, style, roof, house.sign || '', doubleDoor ? 2 : 1].join('|');
  return once(key, () => {
    const W = house.w * 16;
    const H = house.h * 16 + 16;
    const grid = makeGrid(W, H);
    const wallTop = Math.round(H * 0.44);
    const twoStory = house.h >= 7 && style !== 'hut';

    if (style === 'hut') {
      paintThatchRoof(grid, 0, 6, W, wallTop - 2);
      paintLogWalls(grid, 4, wallTop, W - 8, H - wallTop);
    } else {
      paintChimney(grid, Math.round(W * 0.75), 0, 9, 18);
      paintTiledRoof(grid, 0, 6, W, wallTop - 4, ROOF_RAMPS[roof] || ROOF_RAMPS.red, 0.36);
      if (style === 'stone') paintStoneFacade(grid, 4, wallTop, W - 8, H - wallTop, twoStory);
      else paintTimberWalls(grid, 4, wallTop, W - 8, H - wallTop, twoStory);
    }

    const doorTileX = Math.floor(house.w / 2) - (doubleDoor ? 1 : 0);
    const doorCx = Math.round((doorTileX + (doubleDoor ? 1 : 0.5)) * 16);
    const doorHalf = doubleDoor ? 19 : 11;
    const winW = style === 'hut' ? 9 : 12;
    const groundWinY = H - 24;
    paintWindowRow(grid, 8, doorCx - doorHalf - 2, groundWinY, style, winW);
    paintWindowRow(grid, doorCx + doorHalf + 2, W - 8, groundWinY, style, winW);

    if (twoStory) {
      const upperWinY = wallTop + 6;
      paintWindowRow(grid, 8, doorCx - doorHalf - 2, upperWinY, style, winW);
      paintWindowRow(grid, doorCx + doorHalf + 2, W - 8, upperWinY, style, winW);
    }

    paintDoorway(grid, doorCx, H, { doubleDoor: doubleDoor, style: style });
    const doorH = doubleDoor ? (style === 'stone' ? 28 : 26) : (style === 'hut' ? 20 : style === 'stone' ? 24 : 22);
    if (house.sign) paintSignBoard(grid, doorCx, Math.max(wallTop + 2, H - doorH - 18), house.sign);

    return sprite(toCanvas(addOutline(grid, OUTLINE)), 0, H);
  });
}

// ---------- The signs of the shops (9 x 9) ----------

export const SIGN_COLORS = { R: '#e8423f', W: '#ffffff', B: '#6e4425', G: '#9aa6b8', Y: '#e8b83a', O: '#ff8c2b', N: '#3f9a3c', U: '#3a7bff', C: '#c48c52', K: '#2a1c16' };

export const SIGNS = {
  healthPotion: ['...BB....', '...WW....', '..RRRR...', '.RRWRRR..', '.RRRRRR..', '.RRRRRR..', '..RRRR...', '.........', '.........'],
  book: ['.........', '.........', 'UWWWUWWWU', 'UWKKUKKWU', 'UWWWUWWWU', 'UWKKUKKWU', 'UWWWUWWWU', '.UUUUUUU.', '.........'],
  ironSword: ['......W..', '.....WG..', '....WG...', '.Y.WG....', '..YG.....', '..BY.....', '.B..Y....', '.........', '.........'],
  bread: ['.........', '.........', '..CCCCC..', '.CYCYCYC.', 'CCCCCCCCC', 'CCCCCCCCC', '.BBBBBBB.', '.........', '.........'],
  carrot: ['...N.N...', '....N....', '...OOO...', '...OOO...', '...OO....', '....O....', '....O....', '.........', '.........'],
  map1: ['.........', '.CCCCCCC.', '.CWWWWWC.', '.CWRWWWC.', '.CWWKWWC.', '.CWWWWRC.', '.CCCCCCC.', '.........', '.........'],
  mug: ['.........', '..WWWW...', '.YYYYYY..', '.YYYYYYY.', '.YYYYY.Y.', '.YYYYYYY.', '.YYYYYY..', '.........', '.........'],
  shield: ['.GGGGGG..', '.GUUUUG..', '.GUYYUG..', '.GUYYUG..', '..GUUG...', '...GG....', '.........', '.........', '.........'],
  fish: ['.........', '.........', '.U..UUU..', '.UUUUWUU.', '.UUUUUUU.', '.U..UUU..', '.........', '.........', '.........'],
  star: ['....Y....', '....Y....', '...YWY...', 'YYYWWWYYY', '.YYWWWYY.', '..YYWYY..', '..YY.YY..', '.YY...YY.', '.........'],
  potion: ['...BB....', '...WW....', '..UUUU...', '.UUWUUU..', '.UUUUUU..', '.UUUUUU..', '..UUUU...', '.........', '.........'],
  guild: ['.GGGGGG..', '.GRRRRG..', '.GRYYRG..', '.GRYYRG..', '..GRRG...', '...GG....', '.........', '.........', '.........'],
  meat: ['......W..', '.....WW..', '..CCCW...', '.CCRCC...', 'CCCCCC...', '.CCCC....', '..CC.....', '.........', '.........'],
  cloth: ['.........', 'UUUUUUUU.', 'UWUWUWUU.', 'UUUUUUUU.', 'UWUWUWUU.', 'UUUUUUUU.', '.........', '.........', '.........'],
  logs: ['.........', '...CCC...', '..CBBBY..', '.CCCCCC..', '.CBBBBBY.', 'CCCCCCCY.', 'BBBBBBBY.', '.........', '.........'],
  horseshoe: ['.........', '..GGGGG..', '.GG...GG.', '.GG...GG.', '.GG...GG.', '.GG...GG.', '..G...G..', '.KY...YK.', '.........'],
};

// ---------- Village things ----------

export function lampPost() {
  return once('lamp', () => {
    const rows = [
      '..KKKKK..',
      '.KYYYYYK.',
      '.KYWWYYK.',
      '.KYYYYYK.',
      '..KKKKK..',
      '....I....',
      '....I....',
      '....I....',
      '....I....',
      '....I....',
      '....I....',
      '....I....',
      '....I....',
      '....I....',
      '....I....',
      '....I....',
      '...III...',
      '..IIIII..',
    ];
    const colors = { K: IRON.base, Y: '#ffd36b', W: '#fff6d0', I: IRON.light };
    return sprite(spriteOf(rows, colors, OUTLINE, true), 5, 19);
  });
}

const FIRE_FRAMES = [
  ['...R....', '..ROR...', '..ROOR..', '.ROYOR..', '.ROYYOR.', '.ROYYOR.', '..RYYR..', '...RR...'],
  ['....R...', '...ROR..', '..ROR...', '..ROYOR.', '.ROYYOR.', '.ROYYOR.', '..ROYR..', '...RR...'],
  ['..R.....', '..ROR.R.', '.ROOR...', '.ROYOR..', '.ROYYOR.', 'ROYYYOR.', '.RYYYR..', '..RRR...'],
];
const FIRE_COLORS = { R: '#e8421c', O: '#ff9a2b', Y: '#ffe066' };

const BIG_FIRE_FRAMES = [
  ['....R.......', '....RR......', '...ROR...R..', '...ROR..RR..', '..ROOR..ROR.', '..ROYOR.ROR.', '.ROYYORROR..', '.ROYYYOOYOR.', 'ROYYWYYYYOR.', 'ROYYWWYYYOR.', 'ROYYWWYYYOR.', '.ROYYYYYYR..', '..RRRRRRR...'],
  ['.......R....', '......RR....', '..R..ROR....', '..RR.ROR....', '.ROR.ROOR...', '.ROR.ROYOR..', '..ROROYYOR..', '.ROYOOYYYOR.', 'ROYYYYWYYOR.', 'ROYYYWWYYOR.', 'ROYYYWWYYOR.', '.RYYYYYYOR..', '..RRRRRRR...'],
  ['.....R......', '....ROR.....', '....ROR.R...', '...ROOR.RR..', '..ROYOR.ROR.', '..ROYOROOR..', '.ROYYOROYOR.', '.ROYYYOYYOR.', 'ROYYWYYYYOR.', 'ROYWWWYYYOR.', 'ROYYWWYYYOR.', '.ROYYYYYYR..', '..RRRRRRR...'],
];
const BIG_FIRE_COLORS = { ...FIRE_COLORS, W: '#fff6c8' };

// The big flames of the burning houses, during a raid. frame: 0, 1 or 2.
export function bigFlame(frame) {
  return once('bigFlame' + frame, () => sprite(spriteOf(BIG_FIRE_FRAMES[frame], BIG_FIRE_COLORS, '#5a1408'), 6, 14));
}

export function torch(frame) {
  return once('torch' + frame, () => {
    const grid = makeGrid(10, 24);
    drawPicture(grid, FIRE_FRAMES[frame], FIRE_COLORS, 1, 0);
    fillRect(grid, 3, 8, 4, 2, IRON.base);
    fillRect(grid, 4, 10, 2, 13, WOOD.dark);
    fillRect(grid, 4, 10, 1, 13, WOOD.base);
    return sprite(toCanvas(addOutline(addRimShade(grid), OUTLINE)), 5, 23);
  });
}

// One piece of fence (16 pixels wide).
export function fence() {
  return once('fence', () => {
    const grid = makeGrid(16, 14);
    [1, 13].forEach((x) => {
      fillRect(grid, x, 1, 2, 12, WOOD.base);
      fillRect(grid, x + 1, 1, 1, 12, WOOD.dark);
    });
    fillRect(grid, 0, 4, 16, 2, WOOD.light);
    fillRect(grid, 0, 9, 16, 2, WOOD.base);
    fillRect(grid, 0, 5, 16, 1, WOOD.base);
    return sprite(toCanvas(addOutline(addRimShade(grid), '#3a2414')), 8, 13);
  });
}

export function fountain(frame) {
  return once('fountain' + frame, () => {
    const grid = makeGrid(32, 30);
    fillEllipse(grid, 16, 21, 15, 7.5, '#8f8880');
    fillEllipse(grid, 16, 20, 14, 6.5, '#c9c2b8');
    fillEllipse(grid, 16, 20.5, 11.5, 4.5, '#3b8fe0');
    fillEllipse(grid, 15, 19.5, 8, 2.5, '#5aa8ee');
    fillRect(grid, 14, 8, 4, 12, '#b0a99f');
    fillRect(grid, 14, 8, 1, 12, '#d6d0c6');
    fillEllipse(grid, 16, 8, 4, 2, '#c9c2b8');
    const spray = frame ? [10, 22] : [11, 21];
    spray.forEach((x) => drawLine(grid, 16, 4, x, 16, '#a9dbff'));
    fillRect(grid, 15, 2, 2, 3, '#e2f4ff');
    [8, 20, 24].forEach((x, i) => dot(grid, x + frame, 20 + (i % 2), '#e2f4ff'));
    const outlined = addOutline(addRimShade(grid), '#3a3440');
    return sprite(toCanvas(outlined), 16, 29);
  });
}

export function marketStall() {
  return once('stall', () => {
    const grid = makeGrid(32, 30);
    for (let x = 0; x < 32; x += 4) fillRect(grid, x, 2, 4, 7, (x / 4) % 2 === 0 ? '#e8423f' : '#f6efe0'); // the stripes
    for (let x = 0; x < 32; x += 4) fillEllipse(grid, x + 2, 9, 2, 1.5, '#e8423f');
    fillRect(grid, 2, 9, 2, 19, WOOD.dark);
    fillRect(grid, 28, 9, 2, 19, WOOD.dark);
    fillRect(grid, 1, 18, 30, 10, WOOD.base);
    fillRect(grid, 1, 18, 30, 2, WOOD.light);
    const goods = ['#ff8c2b', '#e8423f', '#ffd84a', '#7cc45a', '#ff8c2b', '#b48cff'];
    goods.forEach((color, i) => fillEllipse(grid, 6 + i * 4, 16, 2, 2, color));
    return sprite(toCanvas(addOutline(addRimShade(grid), '#3a2414')), 16, 28);
  });
}

export function barrels() {
  return once('barrels', () => {
    const grid = makeGrid(16, 16);
    fillEllipse(grid, 8, 9, 6.5, 7, WOOD.base);
    fillRect(grid, 2, 5, 13, 1, IRON.base);
    fillRect(grid, 2, 12, 13, 1, IRON.base);
    fillRect(grid, 5, 2, 1, 14, WOOD.dark);
    fillRect(grid, 10, 2, 1, 14, WOOD.dark);
    fillEllipse(grid, 8, 3, 5, 1.5, WOOD.light);
    return sprite(toCanvas(addOutline(addRimShade(grid), '#3a2414')), 8, 15);
  });
}

export function crates() {
  return once('crates', () => {
    const grid = makeGrid(16, 15);
    fillRect(grid, 1, 2, 14, 13, WOOD.base);
    fillRect(grid, 1, 2, 14, 2, WOOD.light);
    drawLine(grid, 2, 4, 13, 13, WOOD.dark);
    drawLine(grid, 13, 4, 2, 13, WOOD.dark);
    fillRect(grid, 1, 8, 14, 1, WOOD.dark);
    return sprite(toCanvas(addOutline(addRimShade(grid), '#3a2414')), 8, 14);
  });
}

export function signpost() {
  return once('signpost', () => {
    const grid = makeGrid(16, 20);
    fillRect(grid, 7, 6, 2, 14, WOOD.dark);
    fillRect(grid, 1, 2, 12, 5, WOOD.base);
    fillRect(grid, 1, 2, 12, 1, WOOD.light);
    dot(grid, 13, 4, WOOD.base); // the arrow tip
    dot(grid, 14, 4, WOOD.base);
    fillRect(grid, 3, 4, 7, 1, WOOD.deep);
    return sprite(toCanvas(addOutline(addRimShade(grid), '#3a2414')), 8, 19);
  });
}

// ---------- Things on the map ----------

const CHEST = { D: '#6b3e1f', W: '#a0683a', L: '#c48c52', Y: '#e8b83a', K: '#2a1c16' };

export function chest(isOpen) {
  return once('chest' + isOpen, () => {
    const closed = [
      '.DDDDDDDDDDDDDD.',
      'DLLLLLLLLLLLLLLD',
      'DWWWWWWWWWWWWWWD',
      'YYYYYYYYYYYYYYYY',
      'DWWWWWWYYWWWWWWD',
      'DDDDDDYKKYDDDDDD',
      'DWWWWWYYYYWWWWWD',
      'DWWWWWWWWWWWWWWD',
      'YYYYYYYYYYYYYYYY',
      'DWWWWWWWWWWWWWWD',
      'DDDDDDDDDDDDDDDD',
    ];
    const open = [
      '.DDDDDDDDDDDDDD.',
      'DLLLLLLLLLLLLLLD',
      'YYYYYYYYYYYYYYYY',
      'DKKKKKKKKKKKKKKD',
      'DKYYKKYKKYYKKYKD',
      'YYYYYYYYYYYYYYYY',
      'DWWWWWWWWWWWWWWD',
      'DWWWWWWWWWWWWWWD',
      'YYYYYYYYYYYYYYYY',
      'DWWWWWWWWWWWWWWD',
      'DDDDDDDDDDDDDDDD',
    ];
    return sprite(spriteOf(isOpen ? open : closed, CHEST, '#2a1c16', true), 9, 12);
  });
}

// A piece of the obsidian barrier: black glass with violet light.
export function obsidianShard() {
  return once('shard', () => {
    const rows = ['...L....', '..LDD...', '..LDD.L.', '.LDDDLDD', '.LDDDLDD', 'LDDDDLDD', 'LDDDDDDD', 'DDDDDDDD'];
    return sprite(spriteOf(rows, { L: '#b48cff', D: '#2c2342' }, '#0d0a14'), 5, 9);
  });
}

// A carrot of the field. ready: true = it can be harvested.
export function crop(ready) {
  return once('crop' + ready, () => {
    const young = ['..........', '..........', '..........', '...N..N...', '....NN....', '....NN....'];
    const grown = ['..N...N...', '..NN.NN...', '...NNN....', '....N.....', '...OOO....', '...OOO....'];
    return sprite(spriteOf(ready ? grown : young, { N: '#4caf50', O: '#ff8c2b' }, '#1f3a1a'), 6, 7);
  });
}

// ---------- Small signs above the heads ----------

// The bubble above someone who needs help (!) or who waits for the player to come back (?).
export function bubble(mark) {
  return once('bubble' + mark, () => {
    const exclamation = ['.WWWWW.', 'WWWKWWW', 'WWWKWWW', 'WWWKWWW', 'WWWWWWW', 'WWWKWWW', '.WWWWW.', '...W...'];
    const question = ['.WWWWW.', 'WWKKKWW', 'WWWWKWW', 'WWWKKWW', 'WWWWWWW', 'WWWKWWW', '.WWWWW.', '...W...'];
    const colors = { W: '#ffffff', K: mark === '?' ? '#2f9e44' : '#d6302f' };
    return sprite(spriteOf(mark === '?' ? question : exclamation, colors, OUTLINE), 4, 10);
  });
}

// ---------- Emotes: a feeling in a white bubble over a head ----------

const EMOTE_BUBBLE = ['.WWWWWWW.', 'WWWWWWWWW', 'WWWWWWWWW', 'WWWWWWWWW', 'WWWWWWWWW', 'WWWWWWWWW', '.WWWWWWW.', '..WW.....', '..W......'];

// The picture inside the bubble (7 x 5). R red, B blue, Y gold, K dark.
const EMOTE_ICONS = {
  '!': ['...R...', '...R...', '...R...', '.......', '...R...'],
  '?': ['..BBB..', '.....B.', '...BB..', '.......', '...B...'],
  heart: ['.RR.RR.', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'],
  note: ['...KKK.', '...K..K', '...K...', '.KKK...', '.KKK...'],
  sparkle: ['...Y...', '..YYY..', 'YYYYYYY', '..YYY..', '...Y...'],
  sweat: ['...B...', '..BBB..', '.BBBBB.', '.BBBBB.', '..BBB..'],
  dots: ['.......', '.......', '.K.K.K.', '.......', '.......'],
};

export function emoteBubble(icon) {
  return once('emote' + icon, () => {
    const grid = makeGrid(11, 11);
    drawPicture(grid, EMOTE_BUBBLE, { W: '#ffffff' }, 1, 1);
    drawPicture(grid, EMOTE_ICONS[icon], { R: '#e8323f', B: '#3a7bff', Y: '#f5b81c', K: '#1c1726' }, 2, 2);
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 4, 10);
  });
}

// The small diamond above a monster: the color of its type.
export function typeDiamond(color) {
  return once('diamond' + color, () => {
    const rows = ['..L..', '.LMM.', 'LMMMD', '.MDD.', '..D..'];
    return sprite(spriteOf(rows, { L: lighter(color), M: color, D: darker(color) }, OUTLINE), 3, 7);
  });
}

// ---------- The walls of the villages ----------

// One piece (16 pixels wide) of the stone wall of Lexia: blocks of stone, a lighter top.
// side: 'row' (a wall going left-right: the pieces touch, no edge on their sides) or 'column' (up-down).
export function stoneWall(side) {
  return once('stoneWall' + side, () => {
    const grid = makeGrid(16, 22);
    for (let y = 1; y < 21; y++) {
      for (let x = 0; x < 16; x++) {
        const offset = Math.floor(y / 5) % 2 ? 4 : 0;
        const isMortar = y % 5 === 0 || (x + offset) % 8 === 7;
        const light = y < 5 ? 0.88 : 0.62 - y * 0.012 + randomOf(x, y, 70) * 0.1;
        dot(grid, x, y, isMortar ? STONE_RAMP[1] : toneOf(STONE_RAMP, light, x, y));
      }
    }
    fillRect(grid, 0, 0, 16, 1, OUTLINE);
    fillRect(grid, 0, 21, 16, 1, OUTLINE);
    if (side === 'column') {
      fillRect(grid, 0, 0, 1, 22, OUTLINE);
      fillRect(grid, 15, 0, 1, 22, OUTLINE);
    }
    return sprite(toCanvas(grid), 8, 21);
  });
}

// One piece (16 pixels wide) of the wooden palisade of Port Syntax: 3 pointed stakes, a rope band.
export function palisade(side) {
  return once('palisade' + side, () => {
    const grid = makeGrid(16, 24);
    for (const left of [0, 5, 10]) {
      const width = left === 10 ? 6 : 5;
      fillTriangle(grid, [left, 4], [left + width / 2, 0], [left + width, 4], (x, y) => toneOf(WOOD_RAMP, 0.7, x, y));
      for (let y = 4; y < 23; y++) {
        for (let x = left; x < left + width; x++) dot(grid, x, y, toneOf(WOOD_RAMP, 0.72 - (x - left) * 0.1, x, y));
      }
      fillRect(grid, left + width - 1, 3, 1, 20, WOOD_RAMP[1]); // the shade between two stakes
    }
    fillRect(grid, 0, 9, 16, 2, '#c9a86a'); // the rope
    fillRect(grid, 0, 17, 16, 1, WOOD_RAMP[1]);
    fillRect(grid, 0, 23, 16, 1, OUTLINE);
    if (side === 'column') {
      fillRect(grid, 0, 2, 1, 22, OUTLINE);
      fillRect(grid, 15, 2, 1, 22, OUTLINE);
    }
    return sprite(toCanvas(grid), 8, 23);
  });
}

// ---------- Fires and magic ----------

// A campfire: logs in a ring of stones, and the flame. frame: 0, 1 or 2. Its flame can light a torch.
export function campfire(frame) {
  return once('campfire' + frame, () => {
    const grid = makeGrid(16, 18);
    drawPicture(grid, FIRE_FRAMES[frame], FIRE_COLORS, 4, 3);
    drawLine(grid, 2, 15, 13, 12, WOOD.dark); // the logs
    drawLine(grid, 2, 12, 13, 15, WOOD.base);
    drawLine(grid, 3, 12, 13, 14, WOOD.light);
    [[1.5, 15], [4.5, 16.5], [8, 17], [11.5, 16.5], [14.5, 15]].forEach(([x, y]) => fillBall(grid, x, y, 1.6, 1.1, STONE_RAMP));
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 8, 17);
  });
}

// A glowing crystal of the Arcane School, on a stone base. frame: it shines a bit brighter or softer.
export function arcaneCrystal(frame) {
  return once('crystal' + frame, () => {
    const grid = makeGrid(12, 22);
    const glow = frame ? ['#3a2468', '#6442a8', '#9c80dc', '#d8c8ff', '#ffffff'] : ['#2a1a4e', '#4e3288', '#7d5cc4', '#b8a0f0', '#e8e0ff'];
    fillTriangle(grid, [2, 8], [6, 0], [10, 8], (x, y) => toneOf(glow, 0.9 - x * 0.06, x, y));
    fillTriangle(grid, [2, 8], [6, 16], [10, 8], (x, y) => toneOf(glow, 0.6 - x * 0.05, x, y));
    fillRect(grid, 1, 16, 10, 5, STONE_RAMP[2]);
    fillRect(grid, 1, 16, 10, 1, STONE_RAMP[4]);
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 6, 21);
  });
}

// ---------- The Arcane School: 13 tiles wide, 9 high (208 x 144 + tower) ----------

export function schoolSprite() {
  return once('school', () => {
    const W = 208;
    const H = 180;
    const grid = makeGrid(W, H);
    const ramp = ROOF_RAMPS.purple;

    paintTiledRoof(grid, 0, 48, W, 50, ramp, 0.42);
    // Central observatory tower
    for (let y = 32; y < 96; y++) {
      for (let x = 78; x < 114; x++) dot(grid, x, y, toneOf(STONE_RAMP, 0.82 - (x - 78) * 0.014, x, y));
    }
    fillTriangle(grid, [73, 34], [96, 8], [119, 34], (x, y) => toneOf(ramp, 0.86 - (x - 73) * 0.015, x, y));
    fillEllipse(grid, 96, 52, 7, 7, '#2a1a4e');
    fillEllipse(grid, 96, 52, 5.5, 5.5, '#9c80dc');
    fillRect(grid, 93, 49, 3, 3, '#ffffff');
    drawPicture(grid, SIGNS.star, SIGN_COLORS, 92, 1);

    // Stone masonry body (y = 96..180)
    paintStoneMasonry(grid, 4, 96, W - 8, H - 96, STONE_RAMP, 71);
    for (const bx of [4, 58, 132, 198]) fillRect(grid, bx, 96, 6, H - 96, STONE_RAMP[2]);
    fillRect(grid, 3, H - 8, W - 6, 8, STONE_RAMP[2]);
    fillRect(grid, 3, H - 8, W - 6, 2, STONE_RAMP[4]);
    fillRect(grid, 3, 134, W - 6, 2, STONE_RAMP[4]);

    // Upper and lower arched purple stained-glass windows
    for (const wx of [18, 40, 146, 174]) {
      paintArchedWindow(grid, wx, 108, 14, 18);
      paintArchedWindow(grid, wx, 144, 14, 18);
    }

    // Grand entrance (centered on doorOf tiles 5 & 6 -> cx = 96)
    paintDoorway(grid, 96, H, { doubleDoor: true, style: 'stone' });
    paintSignBoard(grid, 96, 114, 'star');
    for (const sx of [70, 121]) {
      fillRect(grid, sx, 152, 3, 7, '#d8c8ff');
      fillRect(grid, sx + 1, 154, 1, 3, '#ffffff');
    }

    return sprite(toCanvas(addOutline(grid, OUTLINE)), 0, H);
  });
}

// ---------- Additional World & Village Props ----------

// Monster perimeter sharpened wooden/bone spikes (16px wide).
export function spikes(side = 'row') {
  return once('spikes|' + side, () => {
    const grid = makeGrid(16, 22);
    const cols = side === 'column' ? [3, 9] : [1, 6, 11];
    for (const x of cols) {
      fillTriangle(grid, [x, 7], [x + 2, 0], [x + 4, 7], (px) => toneOf(['#d8d0c0', '#f5efe4'], 0.8 - (px - x) * 0.15, px, 0));
      fillRect(grid, x, 7, 4, 14, WOOD_RAMP[2]);
      fillRect(grid, x + 2, 7, 2, 14, WOOD_RAMP[0]);
    }
    fillRect(grid, 0, 13, 16, 2, '#6e4425');
    fillRect(grid, 0, 18, 16, 1, '#3a2414');
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 8, 21);
  });
}

// Monster war totem with horned skull & crimson markings.
export function warTotem() {
  return once('warTotem', () => {
    const grid = makeGrid(22, 38);
    paintTrunk(grid, 11, 10, 36, 7);
    fillRect(grid, 8, 17, 6, 2, '#d0202a');
    fillRect(grid, 8, 25, 6, 2, '#d0202a');
    fillRect(grid, 4, 14, 14, 2, WOOD_RAMP[1]); // crossbeam
    dot(grid, 4, 16, '#d8d0c0');
    dot(grid, 17, 16, '#d8d0c0');
    // Horned skull on top
    fillEllipse(grid, 11, 8, 5, 4.5, '#e8e0d0');
    fillRect(grid, 9, 11, 4, 3, '#d0c6b4');
    drawLine(grid, 6, 6, 2, 2, '#d8d0c0');
    drawLine(grid, 16, 6, 20, 2, '#d8d0c0');
    dot(grid, 9, 8, '#ff3b4f');
    dot(grid, 13, 8, '#ff3b4f');
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 11, 37);
  });
}

// Walkable ground bone pile.
export function bones() {
  return once('bones', () => {
    const grid = makeGrid(16, 14);
    drawLine(grid, 2, 10, 13, 5, '#d8d0c0');
    drawLine(grid, 3, 6, 13, 11, '#c4baa8');
    fillEllipse(grid, 6, 6, 3.5, 3, '#ece5d6');
    dot(grid, 5, 6, '#2a2028');
    dot(grid, 7, 6, '#2a2028');
    dot(grid, 12, 9, '#ece5d6');
    dot(grid, 3, 10, '#ece5d6');
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 8, 13);
  });
}

// Wooden & iron prisoner cage (3x2 tiles = 48x32 footprint).
export function cage() {
  return once('cage', () => {
    const grid = makeGrid(48, 36);
    fillRect(grid, 3, 5, 42, 27, '#16121c'); // dark interior
    fillRect(grid, 4, 26, 40, 5, '#b58d2e'); // straw inside
    fillRect(grid, 8, 27, 14, 2, '#d6b044');
    // Iron bars
    for (let x = 6; x < 44; x += 5) {
      fillRect(grid, x, 5, 2, 26, IRON.light);
      fillRect(grid, x + 1, 5, 1, 26, IRON.base);
    }
    fillRect(grid, 2, 14, 44, 2, IRON.base);
    // Heavy timber frame
    paintBeam(grid, 2, 2, 44, 4);
    paintBeam(grid, 2, 30, 44, 5);
    paintBeam(grid, 2, 4, 3, 28);
    paintBeam(grid, 43, 4, 3, 28);
    fillRect(grid, 23, 12, 3, 4, '#e8b83a'); // padlock
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 0, 36);
  });
}

// Colorful purple & gold striped downtown riddle/game booth.
export function gameStall() {
  return once('gameStall', () => {
    const grid = makeGrid(32, 32);
    for (let x = 0; x < 32; x += 4) fillRect(grid, x, 3, 4, 8, (x / 4) % 2 === 0 ? '#7d5cc4' : '#ffd23f');
    for (let x = 0; x < 32; x += 4) fillEllipse(grid, x + 2, 11, 2, 1.5, (x / 4) % 2 === 0 ? '#7d5cc4' : '#ffd23f');
    fillRect(grid, 14, 0, 4, 3, '#ffd23f'); // top pennant finial
    fillRect(grid, 2, 11, 2, 19, WOOD.dark);
    fillRect(grid, 28, 11, 2, 19, WOOD.dark);
    fillRect(grid, 1, 20, 30, 10, WOOD.base);
    fillRect(grid, 1, 20, 30, 2, WOOD.light);
    // Dice, cards & lantern on counter
    fillRect(grid, 6, 17, 3, 3, '#ffffff');
    dot(grid, 7, 18, '#1c1726');
    fillRect(grid, 12, 16, 4, 4, '#e8423f');
    fillRect(grid, 18, 17, 5, 3, '#f6efe0');
    fillRect(grid, 25, 13, 3, 4, '#ffe066');
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 16, 30);
  });
}

// Wooden notice / bounty board with pinned parchments.
export function board() {
  return once('board', () => {
    const grid = makeGrid(18, 26);
    fillRect(grid, 2, 8, 2, 17, WOOD.dark);
    fillRect(grid, 14, 8, 2, 17, WOOD.dark);
    fillRect(grid, 1, 3, 16, 14, WOOD_RAMP[2]);
    fillRect(grid, 0, 1, 18, 3, WOOD_RAMP[1]);
    fillRect(grid, 1, 1, 16, 1, WOOD_RAMP[4]);
    // Pinned parchment notices
    fillRect(grid, 3, 5, 5, 7, '#f6efe0');
    fillRect(grid, 10, 6, 5, 6, '#e6d3ad');
    dot(grid, 5, 5, '#e8423f');
    dot(grid, 12, 6, '#e8423f');
    fillRect(grid, 4, 7, 3, 1, '#5a442c');
    fillRect(grid, 4, 9, 3, 1, '#5a442c');
    fillRect(grid, 11, 8, 3, 1, '#5a442c');
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 9, 25);
  });
}

// Stone hero / angel statue for churches & capitals.
export function statue() {
  return once('statue', () => {
    const grid = makeGrid(32, 44);
    // Tiered stone pedestal
    fillRect(grid, 4, 34, 24, 9, STONE_RAMP[2]);
    fillRect(grid, 6, 30, 20, 5, STONE_RAMP[3]);
    fillRect(grid, 4, 34, 24, 2, STONE_RAMP[4]);
    fillRect(grid, 10, 36, 12, 4, STONE_RAMP[1]);
    // Wings behind figure
    fillTriangle(grid, [14, 15], [4, 7], [13, 23], () => STONE_RAMP[4]);
    fillTriangle(grid, [18, 15], [28, 7], [19, 23], () => STONE_RAMP[3]);
    // Robed hero figure & head
    fillTriangle(grid, [10, 30], [16, 11], [22, 30], (x, y) => toneOf(STONE_RAMP, 0.85 - (x - 10) * 0.03 - (y - 11) * 0.01, x, y));
    fillBall(grid, 16, 8, 3.5, 3.5, STONE_RAMP, { ambient: 0.3, brightness: 1.15 });
    // Raised sword/staff
    fillRect(grid, 21, 5, 2, 16, '#d4d0d8');
    fillRect(grid, 19, 14, 6, 2, STONE_RAMP[4]);
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 16, 42);
  });
}

// Rare weathered grey stone totem in the wild.
export function totem() {
  return once('totem', () => {
    const grid = makeGrid(18, 38);
    for (let y = 4; y < 35; y++) {
      for (let x = 4; x < 14; x++) {
        const crack = randomOf(x, y, 91) < 0.08;
        dot(grid, x, y, crack ? STONE_RAMP[0] : toneOf(STONE_RAMP, 0.72 - (x - 4) * 0.04, x, y));
      }
    }
    fillRect(grid, 2, 32, 14, 5, STONE_RAMP[2]);
    fillRect(grid, 5, 2, 8, 3, STONE_RAMP[4]);
    // Carved solemn face & ancient etched runes
    fillRect(grid, 6, 9, 2, 2, STONE_RAMP[0]);
    fillRect(grid, 10, 9, 2, 2, STONE_RAMP[0]);
    fillRect(grid, 7, 13, 4, 2, STONE_RAMP[0]);
    fillRect(grid, 6, 19, 6, 1, STONE_RAMP[4]);
    fillRect(grid, 7, 23, 4, 2, '#7fd6ff');
    fillRect(grid, 6, 28, 6, 1, STONE_RAMP[4]);
    // Moss patches
    fillRect(grid, 4, 16, 3, 2, '#4f7a3e');
    fillRect(grid, 11, 25, 3, 3, '#4f7a3e');
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 9, 37);
  });
}

// Walkable broken wall rubble pile ('w' = splintered wood, 's' = stone blocks).
export function rubble(look = 's') {
  return once('rubble|' + look, () => {
    const grid = makeGrid(16, 14);
    if (look === 'w') {
      drawLine(grid, 2, 10, 12, 6, WOOD.dark);
      drawLine(grid, 3, 6, 13, 11, WOOD.base);
      fillRect(grid, 5, 8, 6, 3, WOOD.light);
      fillRect(grid, 1, 9, 3, 2, WOOD.dark);
    } else {
      fillBall(grid, 5, 9, 3.5, 2.5, STONE_RAMP);
      fillBall(grid, 11, 9, 3.5, 2.5, STONE_RAMP);
      fillBall(grid, 8, 6.5, 3, 2.5, STONE_RAMP);
      fillRect(grid, 2, 10, 3, 2, STONE_RAMP[1]);
      fillRect(grid, 12, 10, 2, 2, STONE_RAMP[2]);
    }
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 8, 13);
  });
}

// Archery target on a wooden tripod stand.
export function target() {
  return once('target', () => {
    const grid = makeGrid(18, 26);
    drawLine(grid, 9, 10, 4, 24, WOOD.dark);
    drawLine(grid, 9, 10, 14, 24, WOOD.dark);
    drawLine(grid, 9, 10, 9, 22, WOOD.dark);
    fillBall(grid, 9, 10, 6.5, 6.5, THATCH_RAMP);
    fillEllipse(grid, 9, 10, 4.5, 4.5, '#f6efe0');
    fillEllipse(grid, 9, 10, 3, 3, '#e8423f');
    fillEllipse(grid, 9, 10, 1.3, 1.3, '#ffffff');
    drawLine(grid, 9, 10, 14, 5, WOOD.light);
    dot(grid, 15, 4, '#e8423f');
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 9, 25);
  });
}

// Stone headstone + earthen grave mound.
export function grave() {
  return once('grave', () => {
    const grid = makeGrid(16, 22);
    fillEllipse(grid, 8, 17, 6.5, 3.5, '#5a4228'); // earthen mound
    fillEllipse(grid, 8, 16, 5, 2.5, '#3e6b34');
    fillRect(grid, 4, 5, 8, 10, STONE_RAMP[3]);
    fillEllipse(grid, 8, 5, 4, 3, STONE_RAMP[4]);
    fillRect(grid, 7, 5, 2, 6, STONE_RAMP[1]);
    fillRect(grid, 6, 7, 4, 1, STONE_RAMP[1]);
    dot(grid, 5, 16, '#ffd23f');
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 8, 21);
  });
}

// Golden haystack dome.
export function hay() {
  return once('hay', () => {
    const grid = makeGrid(20, 18);
    fillBall(grid, 10, 10, 8.5, 7, THATCH_RAMP, { ambient: 0.25, brightness: 1.05 });
    for (let i = 0; i < 6; i++) {
      const sx = 3 + i * 3;
      dot(grid, sx, 16, THATCH_RAMP[2]);
      dot(grid, sx + 1, 4 + (i % 2), THATCH_RAMP[5]);
    }
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 10, 17);
  });
}

// Decorative wooden / clay planter box with bright blooms. variant: 0, 1 or 2.
export function flowerPot(variant = 0) {
  return once('flowerPot|' + (variant % 3), () => {
    const palettes = [
      ['#e8423f', '#ffd23f', '#fff6c8'],
      ['#5a9fd6', '#b48cff', '#eef6ff'],
      ['#ff6fa8', '#ffd23f', '#ffffff'],
    ];
    const [c1, c2, hi] = palettes[variant % 3];
    const grid = makeGrid(14, 16);
    fillRect(grid, 2, 10, 10, 5, WOOD.base);
    fillRect(grid, 1, 9, 12, 2, WOOD.light);
    fillRect(grid, 2, 13, 10, 2, WOOD.dark);
    fillEllipse(grid, 7, 7, 5, 3, LEAF_RAMP[2]);
    fillEllipse(grid, 7, 6, 4, 2.5, LIGHT_LEAF_RAMP[3]);
    [[4, 5, c1], [7, 4, c2], [10, 6, c1], [6, 7, hi], [9, 5, c2]].forEach(([fx, fy, col]) => {
      fillRect(grid, fx, fy, 2, 2, col);
    });
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 7, 15);
  });
}

// Cozy park / square bench (2 tiles wide = 32px).
export function bench() {
  return once('bench', () => {
    const grid = makeGrid(32, 18);
    // Cast-iron legs
    fillRect(grid, 3, 11, 2, 6, IRON.base);
    fillRect(grid, 27, 11, 2, 6, IRON.base);
    fillRect(grid, 3, 3, 2, 8, IRON.base);
    fillRect(grid, 27, 3, 2, 8, IRON.base);
    // Backrest & seat wooden slats
    fillRect(grid, 2, 3, 28, 3, WOOD_RAMP[3]);
    fillRect(grid, 2, 7, 28, 2, WOOD_RAMP[2]);
    fillRect(grid, 1, 10, 30, 3, WOOD_RAMP[4]);
    fillRect(grid, 1, 12, 30, 1, WOOD_RAMP[1]);
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 16, 17);
  });
}

// Sculpted rounded topiary shrub in a stone planter.
export function topiary() {
  return once('topiary', () => {
    const grid = makeGrid(16, 26);
    fillRect(grid, 4, 19, 8, 6, STONE_RAMP[2]);
    fillRect(grid, 3, 18, 10, 2, STONE_RAMP[4]);
    fillRect(grid, 7, 14, 2, 5, WOOD.dark);
    fillBall(grid, 8, 9, 5.5, 5.5, LEAF_RAMP, { ambient: 0.2, brightness: 1.1 });
    dot(grid, 6, 7, '#ff8ca8');
    dot(grid, 10, 10, '#ffd23f');
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 8, 25);
  });
}

// Tall town pennant pole in kingdom colors.
export function bannerPole(color = '#d6302f') {
  return once('bannerPole|' + color, () => {
    const grid = makeGrid(14, 30);
    fillRect(grid, 6, 2, 2, 26, WOOD_RAMP[2]);
    fillRect(grid, 4, 26, 6, 3, STONE_RAMP[2]);
    fillRect(grid, 5, 1, 4, 2, '#ffd23f');
    fillRect(grid, 2, 4, 10, 13, color);
    fillTriangle(grid, [2, 17], [7, 21], [12, 17], () => color);
    fillRect(grid, 6, 7, 2, 7, '#ffd23f');
    fillRect(grid, 4, 9, 6, 2, '#ffd23f');
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 7, 29);
  });
}

// ---------- The tag of a monster ----------

// The small mark over a Hard (one !) or Extreme (two !!) monster.
export function tagMark(tag) {
  return once('tagMark' + tag, () => {
    const rows = tag === 'extreme' ? ['R.R', 'R.R', 'R.R', '...', 'R.R'] : ['R', 'R', 'R', '.', 'R'];
    const color = tag === 'extreme' ? '#ff3b4f' : '#ffa62b';
    return sprite(spriteOf(rows, { R: color }, OUTLINE), tag === 'extreme' ? 2 : 1, 7);
  });
}
