import { makeGrid, dot, fillRect, fillEllipse, fillBall, toneOf, drawLine, drawPicture, sprinkle, randomOf, addOutline, addRimShade, toCanvas, once, spriteOf, colorAt, fillTriangle } from './pixels';
import { OUTLINE, WOOD, darker, lighter, LEAF_RAMP, LIGHT_LEAF_RAMP, PINE_RAMP, WOOD_RAMP, STONE_RAMP, SNOW_RAMP, ROOF_RAMPS } from './palette';

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

// A round trunk (lit on the left) with roots, and a few lines of bark.
function paintTrunk(grid, cx, top, bottom, width) {
  for (let y = top; y <= bottom; y++) {
    const spread = y > bottom - 2 ? 2 : 0; // the roots
    for (let x = Math.floor(cx - width / 2 - spread); x < cx + width / 2 + spread; x++) {
      const nx = (x + 0.5 - cx) / (width / 2 + spread);
      dot(grid, x, y, toneOf(WOOD_RAMP, 0.62 - nx * 0.4, x, y));
    }
  }
  for (let i = 0; i < 3; i++) {
    const x = Math.floor(cx - width / 4 + i * 2);
    drawLine(grid, x, top + 2 + i * 3, x, top + 5 + i * 3, WOOD_RAMP[1]);
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
  addShadow(outlined, look.crown.cx, bottom, look.crown.rx * 0.75, 3);
  return sprite(toCanvas(outlined), Math.round(look.crown.cx), bottom);
}

const OAK = { size: [54, 62], crown: { cx: 27, cy: 24, rx: 23, ry: 20 }, clumps: 24, clumpSize: [5.5, 9], trunk: [36, 58, 9], ramp: LEAF_RAMP };
const ROUND = { size: [40, 48], crown: { cx: 20, cy: 18, rx: 16, ry: 14 }, clumps: 15, clumpSize: [4.5, 7], trunk: [27, 45, 7], ramp: LIGHT_LEAF_RAMP };

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
  for (let y = top; y <= bottom; y++) {
    const width = Math.round(((y - top + 1) / (bottom - top + 1)) * half);
    for (let x = cx - width; x <= cx + width; x++) {
      if (y === bottom && (x + y) % 3 === 0) continue; // the tips of the branches
      const nx = (x - cx) / (width + 0.5);
      const isSnow = y - top < 2 || (y - top < 3 && nx < -0.2);
      const light = 0.7 - nx * 0.35 - ((y - top) / (bottom - top)) * 0.3;
      dot(grid, x, y, isSnow ? toneOf(SNOW_RAMP, light + 0.2, x, y) : toneOf(PINE_RAMP, light, x, y));
    }
  }
}

// A pine of Frostpeak Pass: 3 floors of branches with snow.
export function pineTree() {
  return once('pine', () => {
    const grid = makeGrid(30, 46);
    paintTrunk(grid, 15, 34, 43, 5);
    [
      [2, 13, 6],
      [10, 24, 10],
      [20, 36, 14],
    ].forEach(([top, bottom, half]) => paintPineFloor(grid, 15, top, bottom, half));
    const outlined = addOutline(grid, OUTLINE);
    addShadow(outlined, 15, 43, 10, 2.5);
    return sprite(toCanvas(outlined), 15, 43);
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
    const outlined = addOutline(addRimShade(grid), OUTLINE);
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
    const canvas = spriteOf(CACTUS_ROWS, { G: '#3f9a4a', L: '#7cc45a' }, '#163a1e', true);
    return sprite(canvas, 5, 12);
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

// A beam of wood, lit on its top-left.
function paintBeam(grid, x, y, w, h) {
  for (let row = y; row < y + h; row++) {
    for (let column = x; column < x + w; column++) {
      const edge = (column === x ? 0.2 : 0) + (row === y ? 0.15 : 0) - (column === x + w - 1 ? 0.2 : 0);
      dot(grid, column, row, toneOf(WOOD_RAMP, 0.38 + edge, column, row));
    }
  }
}

function paintWindow(grid, x, y) {
  paintBeam(grid, x, y, 10, 10);
  for (let row = 1; row < 9; row++) {
    for (let column = 1; column < 9; column++) dot(grid, x + column, y + row, toneOf(GLASS_RAMP, 0.85 - (row + column) * 0.04, x + column, y + row));
  }
  dot(grid, x + 2, y + 2, '#ffffff');
  dot(grid, x + 3, y + 2, '#ffffff');
  dot(grid, x + 2, y + 3, '#ffffff');
  paintBeam(grid, x + 4, y + 1, 2, 8);
  paintBeam(grid, x + 1, y + 4, 8, 2);
  paintBeam(grid, x - 1, y + 10, 12, 2); // the flower box
  for (let i = 0; i < 6; i++) fillBall(grid, x + 1 + i * 1.8, y + 9.5, 1.3, 1.1, i % 2 ? ['#a8182f', '#e8423f', '#ff8a8a'] : ['#b88a12', '#ffd23f', '#fff2a8']);
}

function paintDoor(grid) {
  paintBeam(grid, 16, 38, 16, 22);
  for (let y = 40; y < 60; y++) {
    for (let x = 18; x < 30; x++) {
      const plank = (x - 18) % 4;
      dot(grid, x, y, plank === 3 ? WOOD_RAMP[1] : toneOf(WOOD_RAMP, 0.62 - plank * 0.1 - (y - 40) * 0.008, x, y));
    }
  }
  fillBall(grid, 26.5, 51.5, 1.4, 1.4, ['#8a6a12', '#e8b83a', '#fff2a8']);
}

// The front of the house: plaster, timber beams, a stone foundation.
function paintWalls(grid) {
  for (let y = 30; y < 56; y++) {
    for (let x = 3; x < 61; x++) dot(grid, x, y, toneOf(PLASTER_RAMP, 0.72 - (y < 34 ? (34 - y) * 0.12 : 0) + randomOf(x, y, 60) * 0.08, x, y));
  }
  [3, 32, 59].forEach((x) => paintBeam(grid, x, 30, 3, 26));
  paintBeam(grid, 3, 45, 58, 2);
  for (let i = 0; i < 10; i++) {
    const left = 3 + i * 6 - (i % 2) * 3;
    for (let y = 56; y < 60; y++) {
      for (let x = Math.max(3, left); x < Math.min(61, left + 5); x++) dot(grid, x, y, toneOf(STONE_RAMP, 0.7 - (y - 56) * 0.12 - (x - left) * 0.04, x, y));
    }
  }
}

// A front roof with rows of tiles (each row lit on its top), and a stone chimney behind it.
function paintRoof(grid, ramp) {
  for (let y = 0; y < 12; y++) for (let x = 45; x < 51; x++) dot(grid, x, y, toneOf(STONE_RAMP, 0.7 - (x - 45) * 0.08, x, y));
  for (let y = 6; y <= 31; y++) {
    const inset = Math.round((31 - y) * 0.3);
    const inRow = (y - 6) % 4; // 0 = the top of a row of tiles
    const offset = Math.floor((y - 6) / 4) % 2 === 0 ? 0 : 3;
    for (let x = inset; x < 64 - inset; x++) {
      const isSeam = (x - inset + offset) % 6 === 0;
      const light = 0.78 - inRow * 0.14 - (x / 64) * 0.15 - (isSeam ? 0.25 : 0);
      dot(grid, x, y, toneOf(ramp, light, x, y));
    }
  }
  fillRect(grid, 9, 6, 46, 1, ramp[5]); // the ridge
  fillRect(grid, 0, 31, 64, 1, ramp[0]); // the eave
}

// The board hanging next to the door, with the picture of the shop (see SIGNS).
function paintSign(grid, sign) {
  paintBeam(grid, 34, 33, 11, 11);
  fillRect(grid, 35, 34, 9, 9, WOOD_RAMP[5]);
  drawPicture(grid, SIGNS[sign], SIGN_COLORS, 35, 34);
}

// house: { roof: 'red' | 'blue', sign }
export function houseSprite(house) {
  return once('house' + house.roof + house.sign, () => {
    const grid = makeGrid(64, 60);
    paintRoof(grid, ROOF_RAMPS[house.roof]);
    paintWalls(grid);
    paintDoor(grid);
    paintWindow(grid, 6, 34);
    paintWindow(grid, 48, 34);
    if (house.sign) paintSign(grid, house.sign);
    else paintWindow(grid, 36, 34);
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 0, 60);
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
  star: ['....Y....', '....Y....', '...YWY...', 'YYYWWWYYY', '.YYWWWYY.', '..YYWYY..', '..YY.YY..', '.YY...YY.', '.........'],
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

// ---------- The Arcane School: 6 tiles wide, 4 high, a tower with a star ----------

function paintSchoolWalls(grid) {
  for (let y = 46; y < 82; y++) {
    for (let x = 2; x < 94; x++) {
      const offset = Math.floor(y / 6) % 2 ? 5 : 0;
      const isMortar = y % 6 === 0 || (x + offset) % 10 === 9;
      dot(grid, x, y, isMortar ? STONE_RAMP[1] : toneOf(STONE_RAMP, 0.7 - (y - 46) * 0.006 + randomOf(x, y, 71) * 0.08, x, y));
    }
  }
}

// A roof of purple tiles, wider at the bottom.
function paintSchoolRoof(grid, ramp) {
  for (let y = 26; y <= 46; y++) {
    const inset = Math.round((46 - y) * 0.45);
    for (let x = inset; x < 96 - inset; x++) {
      const isSeam = (x + (Math.floor((y - 26) / 4) % 2) * 3) % 6 === 0;
      dot(grid, x, y, toneOf(ramp, 0.78 - ((y - 26) % 4) * 0.14 - (isSeam ? 0.25 : 0) - (x / 96) * 0.12, x, y));
    }
  }
  fillRect(grid, 0, 46, 96, 1, ramp[0]);
}

// The tower in the middle, its pointed roof and the gold star of the Astral Circle.
function paintTower(grid, ramp) {
  for (let y = 14; y < 46; y++) {
    for (let x = 38; x < 58; x++) dot(grid, x, y, toneOf(STONE_RAMP, 0.82 - (x - 38) * 0.02, x, y));
  }
  fillTriangle(grid, [35, 16], [48, -1], [61, 16], (x, y) => toneOf(ramp, 0.85 - (x - 35) * 0.025, x, y));
  fillRect(grid, 44, 22, 8, 11, '#2a1a4e'); // the round window of the tower, glowing
  fillRect(grid, 45, 23, 6, 9, '#9c80dc');
  fillRect(grid, 46, 24, 2, 3, '#ffffff');
  drawPicture(grid, SIGNS.star, SIGN_COLORS, 44, 1);
}

function paintArchWindow(grid, x, y) {
  fillRect(grid, x, y + 3, 12, 13, STONE_RAMP[0]);
  fillEllipse(grid, x + 6, y + 3, 6, 3, STONE_RAMP[0]);
  fillRect(grid, x + 1, y + 3, 10, 12, '#6442a8');
  fillEllipse(grid, x + 6, y + 3, 5, 2.5, '#6442a8');
  fillRect(grid, x + 2, y + 2, 3, 4, '#d8c8ff');
  fillRect(grid, x + 5, y + 1, 1, 14, STONE_RAMP[1]);
}

function paintDoubleDoor(grid) {
  fillRect(grid, 34, 56, 28, 26, STONE_RAMP[0]);
  fillEllipse(grid, 48, 57, 14, 6, STONE_RAMP[0]);
  for (let y = 54; y < 82; y++) {
    for (let x = 36; x < 60; x++) {
      const inside = y >= 58 || (x - 48) * (x - 48) / 144 + (y - 58) * (y - 58) / 16 <= 1;
      if (inside) dot(grid, x, y, x === 47 || x === 48 ? WOOD_RAMP[0] : toneOf(WOOD_RAMP, 0.6 - ((x - 36) % 4) * 0.08, x, y));
    }
  }
  fillBall(grid, 44.5, 70.5, 1.3, 1.3, ['#8a6a12', '#e8b83a', '#fff2a8']);
  fillBall(grid, 51.5, 70.5, 1.3, 1.3, ['#8a6a12', '#e8b83a', '#fff2a8']);
}

export function schoolSprite() {
  return once('school', () => {
    const grid = makeGrid(96, 84);
    const ramp = ROOF_RAMPS.purple;
    paintSchoolRoof(grid, ramp);
    paintTower(grid, ramp);
    paintSchoolWalls(grid);
    paintArchWindow(grid, 8, 56);
    paintArchWindow(grid, 76, 56);
    paintArchWindow(grid, 20, 56);
    paintArchWindow(grid, 64, 56);
    paintDoubleDoor(grid);
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 0, 84);
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
