import { TILE, tileAt, biomeAt } from '../world/map';
import { periodicNoise } from '../world/noise';
import { zoneAt } from '../data/zones';
import { makeGrid, dot, fillRect, fillBall, toneOf, randomOf, toCanvas, once } from './pixels';
import { GRASS_RAMP, DIRT_RAMP, STONE_RAMP, WATER_RAMP, SNOW_RAMP, SAND_RAMP, ASH_RAMP, WOOD_RAMP, LAVA, mix } from './palette';

// The ground: one 16 x 16 picture per tile, made once and reused.
// The textures (grass, dirt, sand...) continue from a tile to the next: they repeat only every 8 tiles (BLOCK).
// A tile also looks at its 4 neighbors: the grass grows over the edge of a path, the water foams on the shore...

export const TILE_PX = 16;
const S = TILE_PX;
const BLOCK = 8; // the textures repeat every 8 tiles
const PERIOD = BLOCK * S; // = 128 pixels
const SIDES = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]; // up, right, down, left

// ---------- Which ground is where ----------

const GROUND_OF_BIOME = { mountain: 'snow', demon: 'ash', coast: 'sand', desert: 'sand', dungeon: 'floor' };
const SIMPLE_GROUND = {
  [TILE.CLIFF]: 'cliff',
  [TILE.VOID]: 'void',
  [TILE.STAIRS]: 'stairs',
  [TILE.ORE]: 'ore',
  [TILE.WOOD_FLOOR]: 'wood',
  [TILE.RUG]: 'wood',
  [TILE.GRASS]: 'grass',
  [TILE.FLOWER]: 'grass',
  [TILE.SAND]: 'sand',
  [TILE.WATER]: 'water',
  [TILE.STONE]: 'snow',
  [TILE.ASH]: 'ash',
  [TILE.LAVA]: 'lava',
  [TILE.FLOOR]: 'floor',
  [TILE.WALL]: 'wall',
  [TILE.SOIL]: 'soil',
  [TILE.BRIDGE]: 'bridge',
};

// The ground of a tile, as a word: 'grass' | 'path' | 'cobble' | 'sand' | 'water' | 'snow' | 'ash' | 'lava' |
// 'floor' | 'wall' | 'soil' | 'bridge' | 'cliff' | 'void' | 'stairs' | 'ore' | 'wood'.
// Under a tree, a rock or a house: the ground of the land around.
export function groundKind(x, y) {
  const tile = tileAt(x, y);
  if (tile === TILE.PATH) return zoneAt(x, y).kind === 'village' ? 'cobble' : 'path';
  return SIMPLE_GROUND[tile] || GROUND_OF_BIOME[biomeAt(x, y)] || 'grass';
}

// The look of the walls, the floors, the cliffs and the stairs of a place: its theme.
// 'stone' (houses, ruins...), 'ice', 'demon', 'crystal', 'bandit', 'ruins', 'tower', 'mine', 'home';
// for the cliffs of the island: the land ('mountain', 'demon', 'desert', or 'rock').
export function themeOf(x, y) {
  const zone = zoneAt(x, y);
  if (zone.theme) return zone.theme;
  const biome = biomeAt(x, y);
  return ['mountain', 'demon', 'desert'].includes(biome) ? biome : 'stone';
}

// ---------- The edges ----------

const SOFT_GROUNDS = ['path', 'cobble', 'sand', 'soil', 'lava']; // the grass, the snow and the ash grow over them
const OVERHANG = { grass: 'g', snow: 's', ash: 'a' };

// What happens on one side of the tile: a letter. '.' = nothing.
function edgeOf(kind, neighbor) {
  if (SOFT_GROUNDS.includes(kind) && OVERHANG[neighbor]) return OVERHANG[neighbor];
  if (kind === 'water' && neighbor !== 'water') return 'f'; // the shore
  if ((kind === 'floor' || kind === 'wood') && (neighbor === 'wall' || neighbor === 'void')) return 'w'; // the shadow of the wall
  if (kind === 'wall' && neighbor !== 'wall' && neighbor !== 'void') return 'r'; // the rim of the wall
  if (kind === 'cliff' && (neighbor === 'cliff' || neighbor === 'ore')) return 'c'; // the cliff goes on
  if (kind === 'bridge' && neighbor === 'water') return 'b'; // the rail of the bridge
  return '.';
}

// The 4 edges of a tile, as 4 letters (up, right, down, left): 'g..s'
export function edgesOf(x, y) {
  const kind = groundKind(x, y);
  return SIDES.map(([dx, dy]) => edgeOf(kind, groundKind(x + dx, y + dy))).join('');
}

// The cells of one side, from the border to the inside: (i, depth) -> [x, y]. side: 0 up, 1 right, 2 down, 3 left.
function sideCell(side, i, depth) {
  if (side === 0) return [i, depth];
  if (side === 1) return [S - 1 - depth, i];
  if (side === 2) return [i, S - 1 - depth];
  return [depth, i];
}

// The grass (or snow, or ash) of the neighbor grows over this tile in pointed blades,
// with a thin shadow on the ground just under them.
function paintOverhang(grid, side, ramp, salt) {
  for (let i = 0; i < S; i++) {
    const depth = 1 + Math.floor(randomOf(i, side, salt) * 2) + (i % 3 === 1 ? 1 : 0); // a pointed blade every 3 pixels
    for (let d = 0; d < depth; d++) dot(grid, ...sideCell(side, i, d), d === depth - 1 ? ramp[2] : ramp[3]);
    const [x, y] = sideCell(side, i, depth);
    dot(grid, x, y, mix(grid.cells[y * S + x] || ramp[0], '#14101e', 0.3)); // the shadow of the blades
  }
}

function paintShore(grid, side, frame) {
  for (let i = 0; i < S; i++) {
    const wave = Math.sin((i + frame * 2.5) * 0.6) > -0.15;
    dot(grid, ...sideCell(side, i, 0), wave ? '#e6f8ff' : WATER_RAMP[5]);
    dot(grid, ...sideCell(side, i, 1), WATER_RAMP[5]);
    dot(grid, ...sideCell(side, i, 2), WATER_RAMP[4]);
    if (randomOf(i, side, 6) < 0.55) dot(grid, ...sideCell(side, i, 3), WATER_RAMP[3]);
  }
}

function paintWallShadow(grid, side) {
  if (side !== 0) return; // only the wall above casts a shadow
  for (let i = 0; i < S; i++) {
    dot(grid, i, 0, '#211c30');
    dot(grid, i, 1, '#3a3450');
    if (i % 2) dot(grid, i, 2, '#3a3450');
  }
}

function paintWallRim(grid, side) {
  if (side === 2) return; // the bottom is the face of the wall (see paintWall)
  for (let i = 0; i < S; i++) dot(grid, ...sideCell(side, i, 0), '#8c86ad');
}

function paintRail(grid, side) {
  for (let i = 0; i < S; i++) {
    dot(grid, ...sideCell(side, i, 0), WOOD_RAMP[0]);
    dot(grid, ...sideCell(side, i, 1), WOOD_RAMP[4]);
    dot(grid, ...sideCell(side, i, 2), WOOD_RAMP[1]);
  }
}

const OVERHANG_RAMPS = { g: GRASS_RAMP, s: SNOW_RAMP, a: ASH_RAMP };

function paintEdges(grid, edges, frame) {
  [...edges].forEach((letter, side) => {
    if (OVERHANG_RAMPS[letter]) paintOverhang(grid, side, OVERHANG_RAMPS[letter], side + 11);
    if (letter === 'f') paintShore(grid, side, frame);
    if (letter === 'w') paintWallShadow(grid, side);
    if (letter === 'r') paintWallRim(grid, side);
    if (letter === 'b') paintRail(grid, side);
  });
}

// ---------- The grounds ----------
// bx, by: the place of the tile in its block of 8 x 8 tiles (the textures continue from tile to tile).

// Paints every pixel with a tone of the ramp, following two layers of soft noise (big patches + small ones).
// light: (big, small) -> from 0 to 1.
function paintTexture(grid, bx, by, ramp, salt, light) {
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const px = bx * S + x;
      const py = by * S + y;
      const big = periodicNoise(px, py, 32, PERIOD, salt);
      const small = periodicNoise(px, py, 8, PERIOD, salt + 1);
      dot(grid, x, y, toneOf(ramp, light(big, small), px, py));
    }
  }
}

// A blade of grass: two dark pixels and a light tip.
function paintBlade(grid, x, y) {
  dot(grid, x, y, GRASS_RAMP[1]);
  dot(grid, x, y - 1, GRASS_RAMP[1]);
  dot(grid, x, y - 2, GRASS_RAMP[5]);
}

function paintGrass(grid, bx, by) {
  paintTexture(grid, bx, by, GRASS_RAMP, 1, (big, small) => 0.18 + big * 0.44 + small * 0.22);
  const salt = by * BLOCK + bx;
  const blades = 2 + Math.floor(randomOf(salt, 1, 30) * 4);
  for (let i = 0; i < blades; i++) {
    const x = 1 + Math.floor(randomOf(i, salt, 31) * 14);
    const y = 3 + Math.floor(randomOf(salt, i, 32) * 12);
    paintBlade(grid, x, y);
    if (randomOf(i, salt, 33) < 0.55) paintBlade(grid, x + 1, y + 1);
  }
  // Occasional delicate clover & wildflower buds in lush meadow grass
  if (randomOf(salt, 4, 34) < 0.35) {
    const fx = 3 + Math.floor(randomOf(salt, 6, 35) * 10);
    const fy = 3 + Math.floor(randomOf(salt, 7, 36) * 10);
    dot(grid, fx, fy + 1, GRASS_RAMP[0]);
    dot(grid, fx, fy, randomOf(salt, 8, 37) < 0.5 ? '#ffe680' : '#f7f9ff');
  }
}

function paintPath(grid, bx, by) {
  paintTexture(grid, bx, by, DIRT_RAMP, 3, (big, small) => 0.26 + big * 0.38 + small * 0.24);
  const salt = by * BLOCK + bx + 70;
  for (let i = 0; i < 3; i++) {
    const x = 2 + Math.floor(randomOf(i, salt, 8) * 12);
    const y = 2 + Math.floor(randomOf(salt, i, 9) * 12);
    fillBall(grid, x, y, 1.5, 1.2, STONE_RAMP, { ambient: 0.25 });
  }
}

// The stones of a cobblestone tile: [x, y, width, height]. The rows are offset, like a real pavement.
const COBBLES = [
  [0, 0, 6, 4],
  [7, 0, 5, 4],
  [13, 0, 3, 4],
  [0, 5, 3, 5],
  [4, 5, 6, 5],
  [11, 5, 5, 5],
  [0, 11, 5, 5],
  [6, 11, 5, 5],
  [12, 11, 4, 5],
];

// One stone, rounded at its corners, lit on its top-left. tint: from -1 (darker) to 1 (lighter).
function paintCobble(grid, [left, top, w, h], tint) {
  for (let y = top; y < top + h; y++) {
    for (let x = left; x < left + w; x++) {
      const isCorner = (x === left || x === left + w - 1) && (y === top || y === top + h - 1);
      if (isCorner) continue;
      const nx = ((x - left + 0.5) / w) * 2 - 1;
      const ny = ((y - top + 0.5) / h) * 2 - 1;
      const rimGlow = y === top && x < left + w - 1 ? 0.14 : 0;
      dot(grid, x, y, toneOf(STONE_RAMP, 0.54 - nx * 0.18 - ny * 0.26 + tint * 0.12 + rimGlow, x, y));
    }
  }
}

function paintCobbles(grid, bx, by) {
  fillRect(grid, 0, 0, S, S, '#2b2532');
  COBBLES.forEach((stone, i) => paintCobble(grid, stone, randomOf(i, by * BLOCK + bx, 9) * 2 - 1));
  if (randomOf(bx, by, 77) < 0.28) {
    dot(grid, 6, 4, GRASS_RAMP[2]);
    dot(grid, 7, 10, GRASS_RAMP[3]);
  }
}

function paintSand(grid, bx, by) {
  paintTexture(grid, bx, by, SAND_RAMP, 5, (big, small) => {
    const dune = Math.sin((bx * 16 + by * 8 + big * 6) * 0.25) * 0.12;
    return 0.3 + big * 0.38 + small * 0.2 + dune;
  });
}

// frame: 0 to 3, the light on the water moves.
function paintWater(grid, bx, by, frame) {
  paintTexture(grid, bx, by, WATER_RAMP, 7, (big, small) => 0.16 + big * 0.36 + small * 0.15);
  for (let y = 1; y < S; y += 4) {
    const start = Math.floor(randomOf(y, by * BLOCK + bx, 12) * 12 + frame * 2) % 13;
    fillRect(grid, start, y, 4, 1, WATER_RAMP[4]);
    dot(grid, start + 1, y - 1, WATER_RAMP[5]);
    if (randomOf(y + frame, bx, 15) < 0.25) dot(grid, start + 2, y - 1, '#eef9ff');
  }
}

function paintSnow(grid, bx, by) {
  paintTexture(grid, bx, by, SNOW_RAMP, 13, (big, small) => 0.36 + big * 0.42 + small * 0.18);
  const salt = by * BLOCK + bx;
  if (randomOf(salt, 3, 14) < 0.35) {
    dot(grid, 2 + Math.floor(randomOf(salt, 4, 14) * 12), 2 + Math.floor(randomOf(salt, 5, 14) * 12), '#ffffff');
  }
}

function paintAsh(grid, bx, by) {
  paintTexture(grid, bx, by, ASH_RAMP, 17, (big, small) => 0.16 + big * 0.46 + small * 0.22);
  const salt = by * BLOCK + bx;
  const x = 2 + Math.floor(randomOf(salt, 4, 3) * 9);
  [
    [0, 0],
    [1, 1],
    [2, 1],
    [3, 2],
  ].forEach(([dx, dy]) => dot(grid, x + dx, 6 + dy, '#110b12'));
  if (randomOf(salt, 5, 3) < 0.36) {
    dot(grid, x + 2, 7, '#ff6824');
    dot(grid, x + 1, 7, '#ffe066');
  }
}

function paintLava(grid, bx, by, frame) {
  const lavaRamp = [LAVA.crust, '#ad2e12', LAVA.base, '#ff7b22', LAVA.light, LAVA.bright];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const px = bx * S + x;
      const py = by * S + y;
      const flow = periodicNoise(px + frame * 2, py, 16, PERIOD, 19);
      dot(grid, x, y, toneOf(lavaRamp, 0.25 + flow * 0.72, px, py));
    }
  }
}

// Rich HD-2D dungeon & interior theme ramps: [floor ramp, wall top ramp, wall face ramp, mortar, rim].
const THEMES = {
  stone: [['#2c283e', '#39344e', '#47415f', '#575072', '#6a6386'], ['#282338', '#332e48', '#413b5a'], ['#2e2842', '#3c3554', '#4a4266'], '#171324', '#7e789e'],
  ruins: [['#2d382e', '#3b483a', '#4a5846', '#5b6a54', '#6d7c64'], ['#343e32', '#424d3e', '#505c4a'], ['#3c463a', '#4b5646', '#5c6854'], '#1b211a', '#8aa07a'],
  ice: [['#58749c', '#6e8bb5', '#84a2cc', '#9bb9de', '#b8d3f0'], ['#42608e', '#5272a2', '#6687b6'], ['#5476a4', '#6c8ebb', '#84a6cf'], '#2a4268', '#d8edff'],
  demon: [['#22121a', '#2e1822', '#3c202c', '#4b2936', '#5c3442'], ['#1f0e14', '#2d141c', '#3c1b24'], ['#2e131b', '#411b24', '#56232e'], '#10060a', '#b63434'],
  crystal: [['#1c2640', '#253252', '#303f64', '#3c4e76', '#4a5e8a'], ['#1e2745', '#283458', '#34426c'], ['#242f4f', '#303e64', '#3f507a'], '#11162a', '#8fd6ff'],
  bandit: [['#5e442c', '#6e5034', '#7e5c3e', '#8e6a48', '#a07954'], ['#442c1a', '#533620', '#644226'], ['#533620', '#664328', '#795130'], '#28180d', '#b8824c'],
  tower: [['#383542', '#464252', '#545062', '#645f72', '#757084'], ['#322f3c', '#403c4c', '#4e495c'], ['#3b3847', '#4a4658', '#59556a'], '#1c1a24', '#9a96aa'],
  mine: [['#3a2d22', '#47382a', '#554332', '#644f3b', '#735c46'], ['#2b211a', '#362a20', '#423326'], ['#34281f', '#423328', '#513f31'], '#19130d', '#7c624b'],
  home: [['#583a22', '#68462a', '#785232', '#895e3b', '#9a6b44'], ['#463529', '#554233', '#66503f'], ['#d6c096', '#e6d3ad', '#f4e6c8'], '#6e523a', '#bfa57a'],
};
THEMES.mountain = THEMES.stone;

let homeWallColor = '#d6c096';

export function setHomeWallColor(color) {
  homeWallColor = color;
}
THEMES.desert = THEMES.bandit;

function paintFloor(grid, bx, by, theme) {
  paintTexture(grid, bx, by, (THEMES[theme] || THEMES.stone)[0], 21, (big, small) => 0.34 + big * 0.32 + small * 0.22);
  fillRect(grid, 0, 0, S, 1, '#1e192d');
  fillRect(grid, 0, 8, S, 1, '#1e192d');
  fillRect(grid, (bx % 2) * 8, 0, 1, 8, '#1e192d');
  fillRect(grid, ((bx + 1) % 2) * 8, 8, 1, 8, '#1e192d');
}

// A wall seen from above: the top. When the floor is below it, its face of bricks shows.
function paintWall(grid, edges, theme, bx, by) {
  const [, top, themeFace, mortar, rim] = THEMES[theme] || THEMES.stone;
  const face = theme === 'home' ? [mix(homeWallColor, '#14101e', 0.25), homeWallColor, mix(homeWallColor, '#ffffff', 0.25)] : themeFace;
  // the top: big flat stones, offset row after row (it continues from a tile to the next)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const px = bx * S + x;
      const py = by * S + y;
      const row = Math.floor(py / 8);
      const isSeam = py % 8 === 0 || (px + (row % 2) * 6) % 12 === 0;
      const stone = randomOf(Math.floor((px + (row % 2) * 6) / 12), row, 23);
      dot(grid, x, y, isSeam ? mortar : toneOf(top, 0.35 + stone * 0.4 + randomOf(x, y, 22) * 0.1, px, py));
    }
  }
  if (edges[2] !== 'r') return;
  for (let y = 6; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const row = Math.floor((y - 6) / 4);
      const brickX = (x + (row % 2) * 4) % 8;
      const isMortar = (y - 6) % 4 === 3 || brickX === 7;
      dot(grid, x, y, isMortar ? mortar : toneOf(face, 0.7 - ((y - 6) % 4) * 0.2, x, y));
    }
  }
  fillRect(grid, 0, 5, S, 1, rim);
}

// The colors of the cliffs of each land: [dark, mid, light, top].
const CLIFFS = {
  mountain: ['#31384f', '#4e5773', '#74809e', '#dde8f5'],
  demon: ['#140d14', '#221821', '#32242c', '#453643'],
  desert: ['#633a20', '#84502c', '#a8693c', '#cc9b5a'],
  stone: ['#32303c', '#4b4956', '#666474', '#397938'],
};
CLIFFS.crystal = CLIFFS.stone;
CLIFFS.mine = CLIFFS.desert;

// A cliff: a top (snow, grass, ash...) and a face of rock in layers, lit on the left.
function paintCliff(grid, edges, theme, bx, by) {
  const [dark, mid, light, top] = CLIFFS[theme] || CLIFFS.stone;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const crack = randomOf(bx * S + x, by * S + y, 40) < 0.08;
      const layer = Math.floor((y + (bx * 3) % 5) / 5) % 2;
      dot(grid, x, y, crack ? dark : toneOf([dark, mid, light], 0.55 - x * 0.012 + layer * 0.15 + randomOf(x, y, 41) * 0.1, bx * S + x, by * S + y));
    }
  }
  if (edges[0] !== 'c') fillRect(grid, 0, 0, S, 3, top); // the top of the cliff (nothing above)
  if (edges[2] !== 'c') fillRect(grid, 0, S - 2, S, 2, dark); // its foot, in shadow
}

// Stairs going down (a dark hole with steps), or a cave mouth in a cliff.
function paintStairs(grid, theme) {
  const [floor, , , mortar, rim] = THEMES[theme] || THEMES.stone;
  fillRect(grid, 0, 0, S, S, '#0d0b14');
  for (let step = 0; step < 4; step++) {
    fillRect(grid, 2 + step, 2 + step * 3, S - 4 - step * 2, 2, floor[3 - step]);
    fillRect(grid, 2 + step, 4 + step * 3, S - 4 - step * 2, 1, mortar);
  }
  fillRect(grid, 0, 0, 2, S, rim);
  fillRect(grid, S - 2, 0, 2, S, rim);
}

// A rock with ore in it: shining spots (iron or blue crystal).
function paintOre(grid, bx, by) {
  paintCliff(grid, 'cccc', 'mine', bx, by);
  const salt = by * BLOCK + bx;
  const color = randomOf(salt, 2, 50) < 0.5 ? ['#9aa6b8', '#e8eef7'] : ['#3a7bff', '#bfe6ff'];
  for (let i = 0; i < 4; i++) {
    const x = 2 + Math.floor(randomOf(i, salt, 51) * 11);
    const y = 3 + Math.floor(randomOf(salt, i, 52) * 10);
    fillRect(grid, x, y, 2, 2, color[0]);
    dot(grid, x, y, color[1]);
  }
}

// The planks of a wooden floor (the home).
function paintWood(grid, bx, by) {
  for (let y = 0; y < S; y++) {
    const plank = Math.floor((y + by * S) / 4);
    for (let x = 0; x < S; x++) {
      const joint = (x + bx * S + plank * 7) % 24 === 0;
      const seam = (y % 4 === 3) || joint;
      const color = seam ? '#341f14' : toneOf(THEMES.home[0], 0.44 + randomOf(plank, (x + bx * S) >> 3, 53) * 0.32, x, y);
      dot(grid, x, y, color);
      if (y % 4 === 1 && joint) dot(grid, x + 1, y, '#6b5c4e'); // subtle iron floor nail
    }
  }
}

function paintSoil(grid) {
  for (let y = 0; y < S; y++) {
    const ridge = y % 4; // the furrows: light on the top of the ridge, dark in the hollow
    const color = ['#9a6a3e', '#7f5530', '#673f22', '#4f2f19'][ridge];
    fillRect(grid, 0, y, S, 1, color);
  }
}

// Wooden planks across the water. The rails are on the sides that touch the water.
function paintBridge(grid, edges) {
  const isAcross = edges[0] === 'b' || edges[2] === 'b'; // water above and below: the bridge goes left-right
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const along = isAcross ? x : y;
      const plank = along % 4;
      dot(grid, x, y, plank === 3 ? WOOD_RAMP[0] : toneOf(WOOD_RAMP, 0.75 - plank * 0.15, x, y));
    }
  }
}

function paintGround(grid, kind, bx, by, frame, edges, theme) {
  if (kind === 'void') fillRect(grid, 0, 0, S, S, '#07060c');
  else if (kind === 'cliff') paintCliff(grid, edges, theme, bx, by);
  else if (kind === 'stairs') paintStairs(grid, theme);
  else if (kind === 'ore') paintOre(grid, bx, by);
  else if (kind === 'wood') paintWood(grid, bx, by);
  else if (kind === 'path') paintPath(grid, bx, by);
  else if (kind === 'cobble') paintCobbles(grid, bx, by);
  else if (kind === 'sand') paintSand(grid, bx, by);
  else if (kind === 'water') paintWater(grid, bx, by, frame);
  else if (kind === 'snow') paintSnow(grid, bx, by);
  else if (kind === 'ash') paintAsh(grid, bx, by);
  else if (kind === 'lava') paintLava(grid, bx, by, frame);
  else if (kind === 'floor') paintFloor(grid, bx, by, theme);
  else if (kind === 'wall') paintWall(grid, edges, theme, bx, by);
  else if (kind === 'soil') paintSoil(grid);
  else if (kind === 'bridge') paintBridge(grid, edges);
  else paintGrass(grid, bx, by);
}

const ANIMATED = ['water', 'lava'];

// The picture of the ground of the tile (x, y). time: seconds (the water and the lava move).
const THEMED = ['floor', 'wall', 'cliff', 'stairs'];

export function groundTile(x, y, time) {
  const kind = groundKind(x, y);
  const bx = ((x % BLOCK) + BLOCK) % BLOCK;
  const by = ((y % BLOCK) + BLOCK) % BLOCK;
  const frame = ANIMATED.includes(kind) ? Math.floor(time * 2) % 4 : 0;
  const edges = edgesOf(x, y);
  const theme = THEMED.includes(kind) ? themeOf(x, y) : '';
  const homeColor = theme === 'home' ? homeWallColor : '';
  return once('ground|' + kind + theme + homeColor + bx + ',' + by + '|' + frame + edges, () => {
    const grid = makeGrid(S, S);
    paintGround(grid, kind, bx, by, frame, edges, theme);
    paintEdges(grid, edges, frame);
    return toCanvas(grid);
  });
}

// ---------- Small things painted on the ground ----------

const FLOWER_COLORS = [
  ['#ff6fa8', '#ffb3d1'],
  ['#ffd84a', '#fff2a8'],
  ['#ffffff', '#ffffff'],
  ['#b48cff', '#dcc8ff'],
  ['#ff8c5a', '#ffc4a3'],
];

// A patch of lush shaded blossoms (the FLOWER tiles).
export function flowersDecal(x, y) {
  const variant = Math.floor(randomOf(x, y, 6) * 8);
  return once('flowers|' + variant, () => {
    const grid = makeGrid(S, S);
    const [petal, light] = FLOWER_COLORS[variant % FLOWER_COLORS.length];
    const count = 3 + (variant % 3);
    for (let i = 0; i < count; i++) {
      const fx = 2 + Math.floor(randomOf(i, variant, 1) * 12);
      const fy = 3 + Math.floor(randomOf(variant, i, 2) * 10);
      dot(grid, fx - 1, fy + 2, GRASS_RAMP[0]);
      dot(grid, fx, fy + 2, GRASS_RAMP[1]);
      dot(grid, fx + 1, fy + 2, GRASS_RAMP[0]);
      dot(grid, fx - 1, fy, petal);
      dot(grid, fx + 1, fy, petal);
      dot(grid, fx, fy + 1, petal);
      dot(grid, fx, fy - 1, light);
      dot(grid, fx, fy, '#ffe478');
    }
    return toCanvas(grid);
  });
}
