import { makeGrid, dot, fillRect, fillEllipse, drawLine, drawPicture, sprinkle, addOutline, toCanvas, once, spriteOf, colorAt } from './pixels';
import { OUTLINE, WOOD, SNOW, darker, lighter } from './palette';

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

const LEAVES = { deep: '#256b34', mid: '#3b9440', light: '#62b84a', bright: '#8fd35c', outline: '#14301c' };

// A leafy tree: a trunk, then the leaves in 3 layers (dark, middle, light), then little leaf pixels.
// blobs: the round parts of the leaves [cx, cy, rx, ry]. size: [width, height] of the picture.
function leafyTree(size, trunk, blobs, salt) {
  const [width, height] = size;
  const grid = makeGrid(width, height);
  const [tx, ty, tw, th] = trunk;
  fillRect(grid, tx, ty, tw, th, WOOD.base);
  fillRect(grid, tx + tw - 2, ty, 2, th, WOOD.dark);
  fillRect(grid, tx, ty, 1, th, WOOD.light);
  fillRect(grid, tx - 2, ty + th - 2, 2, 2, WOOD.dark); // the roots
  fillRect(grid, tx + tw, ty + th - 2, 2, 2, WOOD.dark);
  blobs.forEach(([cx, cy, rx, ry]) => fillEllipse(grid, cx, cy, rx, ry, LEAVES.deep));
  blobs.forEach(([cx, cy, rx, ry]) => fillEllipse(grid, cx - 1, cy - 1.5, rx - 1.5, ry - 1.5, LEAVES.mid));
  blobs.forEach(([cx, cy, rx, ry]) => fillEllipse(grid, cx - rx * 0.35, cy - ry * 0.45, rx * 0.45, ry * 0.35, LEAVES.light));
  sprinkle(grid, LEAVES.deep, 0.1, salt, LEAVES.mid);
  sprinkle(grid, LEAVES.bright, 0.12, salt + 1, LEAVES.light);
  sprinkle(grid, LEAVES.light, 0.05, salt + 2, LEAVES.mid);
  const outlined = addOutline(grid, LEAVES.outline);
  addShadow(outlined, tx + tw / 2, ty + th - 1, tw + 4, 2.5);
  return outlined;
}

// The big trees of Verbwood. variant: 0 or 1.
export function oakTree(variant) {
  return once('oak' + variant, () => {
    const blobs = [
      [16, 14, 13, 10],
      [7, 17, 6, 6],
      [25, 17, 6, 6],
      [10, 8, 7, 6],
      [22, 8, 7, 6],
      [16, 5, 7, 5],
      [10, 22, 6, 4],
      [22, 22, 6, 4],
    ];
    const shifted = variant ? blobs.map(([x, y, rx, ry]) => [x + (x > 16 ? 1 : -1), y, rx, ry + 0.5]) : blobs;
    return sprite(toCanvas(leafyTree([33, 38], [13, 24, 6, 12], shifted, 20 + variant)), 16, 35);
  });
}

// The smaller round trees of the meadows and the villages.
export function roundTree() {
  return once('round', () => {
    const blobs = [
      [12, 11, 10, 8],
      [6, 14, 5, 5],
      [18, 14, 5, 5],
      [12, 5, 6, 4],
    ];
    return sprite(toCanvas(leafyTree([25, 30], [10, 18, 5, 10], blobs, 30)), 12, 27);
  });
}

const PINE = { dark: '#1d5c46', mid: '#2b7a57', light: '#3f9a66', outline: '#0f2a24' };

// A pine of Frostpeak Pass: 3 floors of branches, with snow on each one.
export function pineTree() {
  return once('pine', () => {
    const grid = makeGrid(21, 34);
    fillRect(grid, 8, 26, 4, 6, WOOD.dark);
    fillRect(grid, 8, 26, 1, 6, WOOD.base);
    const floors = [
      [2, 9, 4],
      [9, 17, 7],
      [16, 27, 10],
    ]; // [top row, bottom row, half width at the bottom]
    floors.forEach(([top, bottom, half]) => {
      for (let y = top; y <= bottom; y++) {
        const width = Math.round(((y - top + 1) / (bottom - top + 1)) * half);
        fillRect(grid, 10 - width, y, width * 2 + 1, 1, PINE.mid);
        fillRect(grid, 10 + 1, y, width, 1, PINE.dark); // the shadow side
        if (y - top < 2) fillRect(grid, 10 - width, y, width * 2 + 1, 1, SNOW.base); // the snow on the top
      }
      fillRect(grid, 10 - half, bottom, half, 1, SNOW.shade); // snow on the tips
    });
    sprinkle(grid, PINE.light, 0.08, 40, PINE.mid);
    const outlined = addOutline(grid, PINE.outline);
    addShadow(outlined, 10, 32, 7, 2);
    return sprite(toCanvas(outlined), 10, 32);
  });
}

// The dead trees of the Silent Lands.
export function deadTree() {
  return once('dead', () => {
    const grid = makeGrid(19, 28);
    const bark = '#3a2c38';
    fillRect(grid, 8, 10, 3, 16, bark);
    fillRect(grid, 10, 10, 1, 16, '#271d26');
    const branches = [
      [9, 14, 3, 6],
      [3, 6, 1, 3],
      [10, 12, 14, 4],
      [14, 4, 16, 1],
      [10, 18, 15, 13],
      [8, 19, 4, 15],
      [9, 10, 9, 3],
    ];
    branches.forEach(([x0, y0, x1, y1]) => drawLine(grid, x0, y0, x1, y1, bark));
    fillRect(grid, 6, 24, 7, 2, bark);
    sprinkle(grid, '#5a4655', 0.15, 50, bark);
    const outlined = addOutline(grid, OUTLINE);
    addShadow(outlined, 9.5, 26, 6, 1.5);
    return sprite(toCanvas(outlined), 9, 26);
  });
}

const CACTUS_ROWS = [
  '....GG......',
  '...GLG......',
  '...GLG..G...',
  '.G.GLG..GG..',
  '.GLGLG..LG..',
  '.GLGLGGGLG..',
  '..GGLGGGG...',
  '...GLG......',
  '...GLG......',
  '...GLG......',
  '...GGG......',
];

// The cacti of Sunscorch Desert.
export function cactus() {
  return once('cactus', () => {
    const canvas = spriteOf(CACTUS_ROWS, { G: '#3f9a4a', L: '#7cc45a' }, '#163a1e');
    return sprite(canvas, 5, 12);
  });
}

// ---------- Rocks ----------

const STONE = { dark: '#6d6a72', mid: '#8e8a93', light: '#b7b3bb', outline: '#2a2730' };

function boulderGrid() {
  const grid = makeGrid(18, 15);
  fillEllipse(grid, 9, 9, 8, 5.5, STONE.dark);
  fillEllipse(grid, 8, 8, 6.5, 4.5, STONE.mid);
  fillEllipse(grid, 6, 6.5, 3, 2, STONE.light);
  dot(grid, 12, 9, STONE.dark);
  dot(grid, 13, 10, STONE.dark);
  return grid;
}

// cover: what grows on the rock ('moss', 'snow' or null).
export function rock(cover) {
  return once('rock' + cover, () => {
    const grid = boulderGrid();
    if (cover === 'moss') {
      fillEllipse(grid, 7, 4.5, 4, 1.5, '#4f9a3c');
      sprinkle(grid, '#76c04e', 0.3, 60, '#4f9a3c');
    }
    if (cover === 'snow') {
      fillEllipse(grid, 8, 4.5, 6, 2, SNOW.base);
      fillRect(grid, 4, 5, 9, 1, SNOW.shade);
    }
    const outlined = addOutline(grid, STONE.outline);
    addShadow(outlined, 9, 14, 8, 1.5);
    return sprite(toCanvas(outlined), 9, 14);
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

const ROOFS = {
  red: { base: '#c8452f', dark: '#932f20', light: '#e2694d' },
  blue: { base: '#3f6fc6', dark: '#2b4f96', light: '#6d97e0' },
};
const PLASTER = { base: '#f0e2c2', shade: '#d5c29c' };
const TIMBER = '#6e4425';
const FOUNDATION = { base: '#9c9388', dark: '#7a7166' };

function paintWindow(grid, x, y) {
  fillRect(grid, x, y, 9, 9, TIMBER);
  fillRect(grid, x + 1, y + 1, 7, 7, '#6fb6e6');
  dot(grid, x + 2, y + 2, '#d6f1ff');
  dot(grid, x + 3, y + 2, '#d6f1ff');
  dot(grid, x + 2, y + 3, '#d6f1ff');
  fillRect(grid, x + 4, y + 1, 1, 7, TIMBER);
  fillRect(grid, x + 1, y + 4, 7, 1, TIMBER);
  fillRect(grid, x - 1, y + 9, 11, 2, WOOD.dark); // the flower box
  [0, 2, 4, 6, 8].forEach((i) => dot(grid, x + i, y + 8, i % 4 === 0 ? '#ff5a7a' : '#ffd84a'));
}

function paintDoor(grid) {
  fillRect(grid, 17, 39, 14, 21, TIMBER);
  fillRect(grid, 19, 41, 10, 19, WOOD.base);
  [21, 24, 27].forEach((x) => fillRect(grid, x, 41, 1, 19, WOOD.dark));
  fillRect(grid, 19, 41, 10, 1, WOOD.light);
  dot(grid, 26, 51, '#ffd23f');
}

// The front of the house: plaster, timber beams, a stone foundation.
function paintWalls(grid) {
  fillRect(grid, 3, 30, 58, 30, PLASTER.base);
  fillRect(grid, 3, 30, 58, 3, PLASTER.shade); // the shadow of the roof
  [3, 33, 59].forEach((x) => fillRect(grid, x, 30, 2, 30, TIMBER));
  fillRect(grid, 3, 46, 58, 2, TIMBER);
  fillRect(grid, 3, 56, 58, 4, FOUNDATION.base);
  for (let x = 5; x < 60; x += 6) fillRect(grid, x, 56, 1, 4, FOUNDATION.dark);
  fillRect(grid, 3, 59, 58, 1, FOUNDATION.dark);
}

// A front roof with rows of tiles, and a chimney behind it.
function paintRoof(grid, colors) {
  fillRect(grid, 45, 0, 6, 12, FOUNDATION.base);
  fillRect(grid, 45, 0, 6, 2, FOUNDATION.dark);
  for (let y = 6; y <= 31; y++) {
    const inset = Math.round((31 - y) * 0.3);
    fillRect(grid, inset, y, 64 - inset * 2, 1, colors.base);
    if (y % 4 === 1) fillRect(grid, inset, y, 64 - inset * 2, 1, colors.dark);
    const offset = Math.floor(y / 4) % 2 === 0 ? 0 : 3;
    for (let x = inset + offset; x < 64 - inset; x += 6) dot(grid, x, y, colors.dark);
  }
  fillRect(grid, 8, 6, 48, 1, colors.light);
  fillRect(grid, 0, 31, 64, 1, colors.dark);
}

// The board hanging next to the door, with the picture of the shop (see SIGNS).
function paintSign(grid, sign) {
  fillRect(grid, 34, 33, 11, 11, WOOD.dark);
  fillRect(grid, 35, 34, 9, 9, WOOD.light);
  drawPicture(grid, SIGNS[sign], SIGN_COLORS, 35, 34);
}

// house: { roof: 'red' | 'blue', sign }
export function houseSprite(house) {
  return once('house' + house.roof + house.sign, () => {
    const grid = makeGrid(64, 60);
    paintRoof(grid, ROOFS[house.roof]);
    paintWalls(grid);
    paintDoor(grid);
    paintWindow(grid, 6, 34);
    paintWindow(grid, 48, 34);
    if (house.sign) paintSign(grid, house.sign);
    else paintWindow(grid, 36, 34);
    return sprite(toCanvas(addOutline(grid, '#2a1c16')), 0, 60);
  });
}

// ---------- The signs of the shops (9 x 9) ----------

const SIGN_COLORS = { R: '#e8423f', W: '#ffffff', B: '#6e4425', G: '#9aa6b8', Y: '#e8b83a', O: '#ff8c2b', N: '#3f9a3c', U: '#3a7bff', C: '#c48c52', K: '#2a1c16' };

const SIGNS = {
  healthPotion: ['...BB....', '...WW....', '..RRRR...', '.RRWRRR..', '.RRRRRR..', '.RRRRRR..', '..RRRR...', '.........', '.........'],
  book: ['.........', '.........', 'UWWWUWWWU', 'UWKKUKKWU', 'UWWWUWWWU', 'UWKKUKKWU', 'UWWWUWWWU', '.UUUUUUU.', '.........'],
  ironSword: ['......W..', '.....WG..', '....WG...', '.Y.WG....', '..YG.....', '..BY.....', '.B..Y....', '.........', '.........'],
  bread: ['.........', '.........', '..CCCCC..', '.CYCYCYC.', 'CCCCCCCCC', 'CCCCCCCCC', '.BBBBBBB.', '.........', '.........'],
  carrot: ['...N.N...', '....N....', '...OOO...', '...OOO...', '...OO....', '....O....', '....O....', '.........', '.........'],
  map1: ['.........', '.CCCCCCC.', '.CWWWWWC.', '.CWRWWWC.', '.CWWKWWC.', '.CWWWWRC.', '.CCCCCCC.', '.........', '.........'],
  mug: ['.........', '..WWWW...', '.YYYYYY..', '.YYYYYYY.', '.YYYYY.Y.', '.YYYYYYY.', '.YYYYYY..', '.........', '.........'],
  shield: ['.GGGGGG..', '.GUUUUG..', '.GUYYUG..', '.GUYYUG..', '..GUUG...', '...GG....', '.........', '.........', '.........'],
  fish: ['.........', '.........', '.U..UUU..', '.UUUUWUU.', '.UUUUUUU.', '.U..UUU..', '.........', '.........', '.........'],
};

// ---------- Village things ----------

const IRON = { base: '#3a3442', light: '#5a5266' };

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
    return sprite(spriteOf(rows, colors, OUTLINE), 5, 19);
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
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 5, 23);
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
    return sprite(toCanvas(addOutline(grid, '#3a2414')), 8, 13);
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
    const outlined = addOutline(grid, '#3a3440');
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
    return sprite(toCanvas(addOutline(grid, '#3a2414')), 16, 28);
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
    return sprite(toCanvas(addOutline(grid, '#3a2414')), 8, 15);
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
    return sprite(toCanvas(addOutline(grid, '#3a2414')), 8, 14);
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
    return sprite(toCanvas(addOutline(grid, '#3a2414')), 8, 19);
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
    return sprite(spriteOf(isOpen ? open : closed, CHEST, '#2a1c16'), 9, 12);
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

// The small diamond above a monster: the color of its type.
export function typeDiamond(color) {
  return once('diamond' + color, () => {
    const rows = ['..L..', '.LMM.', 'LMMMD', '.MDD.', '..D..'];
    return sprite(spriteOf(rows, { L: lighter(color), M: color, D: darker(color) }, OUTLINE), 3, 7);
  });
}
