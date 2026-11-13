import { TILE, tileAt, noise } from '../world/map';
import { zoneAt } from '../data/zones';
import { makeGrid, dot, fillRect, sprinkle, randomOf, toCanvas, once } from './pixels';
import { GRASS, DIRT, COBBLE, SAND, WATER, SNOW, ASH, LAVA, FLOOR, WALL, SOIL } from './palette';

// The ground: one 16 x 16 picture per tile. Each picture is made once, then reused.
// A tile also looks at its 4 neighbors: the grass grows over the edge of a path, the water foams on the shore...

export const TILE_PX = 16;
const S = TILE_PX;
const SIDES = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]; // up, right, down, left

// ---------- Which ground is where ----------

const GROUND_OF_BIOME = { mountain: 'snow', demon: 'ash', coast: 'sand', dungeon: 'floor' };
const SIMPLE_GROUND = {
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
};

// The ground of a tile, as a word: 'grass' | 'path' | 'cobble' | 'sand' | 'water' | 'snow' | 'ash' | 'lava' |
// 'floor' | 'wall' | 'soil'. Under a tree, a rock or a house: the ground of the land around.
export function groundKind(x, y) {
  const tile = tileAt(x, y);
  const zone = zoneAt(x, y);
  if (tile === TILE.PATH) return zone.kind === 'village' ? 'cobble' : 'path';
  return SIMPLE_GROUND[tile] || GROUND_OF_BIOME[zone.biome] || 'grass';
}

// ---------- The edges ----------

const SOFT_GROUNDS = ['path', 'cobble', 'sand', 'soil', 'lava']; // the grass, the snow and the ash grow over them
const OVERHANG = { grass: 'g', snow: 's', ash: 'a' };

// What happens on one side of the tile: a letter. '.' = nothing.
function edgeOf(kind, neighbor) {
  if (SOFT_GROUNDS.includes(kind) && OVERHANG[neighbor]) return OVERHANG[neighbor];
  if (kind === 'water' && neighbor !== 'water') return 'f'; // foam
  if (kind === 'floor' && neighbor === 'wall') return 'w'; // the shadow of the wall
  if (kind === 'wall' && neighbor !== 'wall') return 'r'; // the rim of the wall
  return '.';
}

// The 4 edges of a tile, as 4 letters (up, right, down, left): 'g..s'
export function edgesOf(x, y) {
  const kind = groundKind(x, y);
  return SIDES.map(([dx, dy]) => edgeOf(kind, groundKind(x + dx, y + dy))).join('');
}

// The cells of one side, from the border to the inside: (i, depth) -> x, y. side: 0 up, 1 right, 2 down, 3 left.
function sideCell(side, i, depth) {
  if (side === 0) return [i, depth];
  if (side === 1) return [S - 1 - depth, i];
  if (side === 2) return [i, S - 1 - depth];
  return [depth, i];
}

// The grass (or snow, or ash) of the neighbor grows 1 to 3 pixels over this tile, with a darker line inside.
function paintOverhang(grid, side, colors, salt) {
  for (let i = 0; i < S; i++) {
    const depth = 1 + Math.floor(randomOf(i, side, salt) * 3);
    for (let d = 0; d < depth; d++) dot(grid, ...sideCell(side, i, d), colors.base);
    dot(grid, ...sideCell(side, i, depth), colors.edge);
  }
}

function paintFoam(grid, side, frame) {
  for (let i = 0; i < S; i++) {
    const wave = randomOf(i + frame * 3, side, 5) < 0.75;
    dot(grid, ...sideCell(side, i, 0), wave ? WATER.foam : WATER.light);
    if (randomOf(i, side + frame, 6) < 0.4) dot(grid, ...sideCell(side, i, 1), WATER.light);
  }
}

function paintWallShadow(grid, side) {
  if (side !== 0) return; // only the wall above casts a shadow
  for (let i = 0; i < S; i++) {
    dot(grid, i, 0, WALL.mortar);
    dot(grid, i, 1, FLOOR.dark);
  }
}

function paintWallRim(grid, side) {
  if (side === 2) return; // the bottom is the face of the wall (see paintWall)
  for (let i = 0; i < S; i++) dot(grid, ...sideCell(side, i, 0), WALL.rim);
}

const EDGE_COLORS = {
  g: { base: GRASS.base, edge: GRASS.edge },
  s: { base: SNOW.base, edge: SNOW.dark },
  a: { base: ASH.base, edge: LAVA.crust },
};

function paintEdges(grid, edges, frame) {
  [...edges].forEach((letter, side) => {
    if (EDGE_COLORS[letter]) paintOverhang(grid, side, EDGE_COLORS[letter], side + 11);
    if (letter === 'f') paintFoam(grid, side, frame);
    if (letter === 'w') paintWallShadow(grid, side);
    if (letter === 'r') paintWallRim(grid, side);
  });
}

// ---------- The grounds ----------

// A tuft of grass: a small "v" of dark blades with light tips.
function paintTuft(grid, x, y) {
  dot(grid, x, y, GRASS.light);
  dot(grid, x + 2, y, GRASS.light);
  dot(grid, x, y + 1, GRASS.deep);
  dot(grid, x + 1, y + 1, GRASS.light);
  dot(grid, x + 2, y + 1, GRASS.deep);
  dot(grid, x + 1, y + 2, GRASS.deep);
}

function paintGrass(grid, variant) {
  fillRect(grid, 0, 0, S, S, GRASS.base);
  sprinkle(grid, GRASS.dark, 0.07, variant + 1);
  sprinkle(grid, GRASS.light, 0.025, variant + 2, GRASS.base);
  const tufts = 1 + (variant % 3);
  for (let i = 0; i < tufts; i++) {
    paintTuft(grid, 1 + Math.floor(randomOf(i, variant, 3) * 12), 1 + Math.floor(randomOf(variant, i, 4) * 12));
  }
}

function paintPath(grid, variant) {
  fillRect(grid, 0, 0, S, S, DIRT.base);
  sprinkle(grid, DIRT.dark, 0.1, variant + 1);
  sprinkle(grid, DIRT.light, 0.06, variant + 2, DIRT.base);
  const x = 3 + Math.floor(randomOf(variant, 1, 8) * 9);
  const y = 3 + Math.floor(randomOf(variant, 2, 8) * 9);
  fillRect(grid, x, y, 2, 2, DIRT.pebble); // a pebble
  dot(grid, x, y, DIRT.light);
}

// The stones of a cobblestone tile: [x, y, width, height]. Two rows are offset, like a real wall.
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

function paintCobble(grid, variant) {
  fillRect(grid, 0, 0, S, S, COBBLE.mortar);
  COBBLES.forEach(([x, y, w, h], i) => {
    const tint = randomOf(i, variant, 9) < 0.25 ? COBBLE.dark : COBBLE.stone;
    fillRect(grid, x, y, w, h, tint);
    fillRect(grid, x, y, w - 1, 1, COBBLE.light); // the light comes from the top-left
    fillRect(grid, x, y + h - 1, w, 1, COBBLE.dark);
  });
}

function paintSand(grid, variant) {
  fillRect(grid, 0, 0, S, S, SAND.base);
  sprinkle(grid, SAND.dark, 0.08, variant + 1);
  sprinkle(grid, SAND.light, 0.06, variant + 2, SAND.base);
}

// frame: 0 to 3, the waves move.
function paintWater(grid, variant, frame) {
  fillRect(grid, 0, 0, S, S, WATER.base);
  for (let y = 2; y < S; y += 5) {
    const start = (y * 3 + frame * 2 + variant * 5) % 12;
    fillRect(grid, start, y, 4, 1, WATER.light);
    fillRect(grid, (start + 8) % 14, y + 2, 3, 1, WATER.dark);
  }
}

function paintSnow(grid, variant) {
  fillRect(grid, 0, 0, S, S, SNOW.base);
  sprinkle(grid, SNOW.shade, 0.09, variant + 1);
  sprinkle(grid, SNOW.light, 0.05, variant + 2, SNOW.base);
  const x = 2 + Math.floor(randomOf(variant, 3, 2) * 10);
  fillRect(grid, x, 11, 4, 1, SNOW.dark); // a small bump of snow and its blue shadow
  fillRect(grid, x + 1, 10, 3, 1, SNOW.light);
}

function paintAsh(grid, variant) {
  fillRect(grid, 0, 0, S, S, ASH.base);
  sprinkle(grid, ASH.dark, 0.12, variant + 1);
  sprinkle(grid, ASH.light, 0.04, variant + 2, ASH.base);
  const x = 2 + Math.floor(randomOf(variant, 4, 3) * 9);
  dot(grid, x, 6, ASH.crack);
  dot(grid, x + 1, 7, ASH.crack);
  dot(grid, x + 2, 7, ASH.crack);
  dot(grid, x + 3, 8, ASH.crack);
}

function paintLava(grid, variant, frame) {
  fillRect(grid, 0, 0, S, S, LAVA.base);
  sprinkle(grid, LAVA.light, 0.18, variant + frame * 7);
  const x = 3 + ((variant * 5 + frame * 3) % 9);
  fillRect(grid, x, 5, 3, 2, LAVA.bright); // a bubble
  fillRect(grid, (x + 6) % 12, 10, 2, 2, LAVA.bright);
}

function paintFloor(grid, variant) {
  fillRect(grid, 0, 0, S, S, FLOOR.base);
  fillRect(grid, 0, 0, S, 1, FLOOR.dark);
  fillRect(grid, 0, 8, S, 1, FLOOR.dark);
  fillRect(grid, 0, 0, 1, 8, FLOOR.dark);
  fillRect(grid, 8, 8, 1, 8, FLOOR.dark);
  fillRect(grid, 1, 1, 7, 1, FLOOR.light);
  fillRect(grid, 9, 9, 7, 1, FLOOR.light);
  sprinkle(grid, FLOOR.dark, 0.04, variant + 1, FLOOR.base);
}

// A wall seen from above: the top. When the floor is below it, its face of bricks shows.
function paintWall(grid, edges) {
  fillRect(grid, 0, 0, S, S, WALL.top);
  if (edges[2] !== 'r') return;
  fillRect(grid, 0, 6, S, 10, WALL.face);
  for (let y = 6; y < S; y += 4) {
    fillRect(grid, 0, y, S, 1, WALL.mortar);
    const offset = y % 8 === 6 ? 0 : 4;
    for (let x = offset; x < S; x += 8) fillRect(grid, x, y, 1, 4, WALL.mortar);
  }
  fillRect(grid, 0, 5, S, 1, WALL.rim);
}

function paintSoil(grid) {
  fillRect(grid, 0, 0, S, S, SOIL.base);
  for (let y = 3; y < S; y += 4) {
    fillRect(grid, 0, y, S, 1, SOIL.furrow);
    fillRect(grid, 0, y - 3, S, 1, SOIL.light);
  }
}

function paintGround(grid, kind, variant, frame, edges) {
  if (kind === 'path') paintPath(grid, variant);
  else if (kind === 'cobble') paintCobble(grid, variant);
  else if (kind === 'sand') paintSand(grid, variant);
  else if (kind === 'water') paintWater(grid, variant, frame);
  else if (kind === 'snow') paintSnow(grid, variant);
  else if (kind === 'ash') paintAsh(grid, variant);
  else if (kind === 'lava') paintLava(grid, variant, frame);
  else if (kind === 'floor') paintFloor(grid, variant);
  else if (kind === 'wall') paintWall(grid, edges);
  else if (kind === 'soil') paintSoil(grid);
  else paintGrass(grid, variant);
}

const ANIMATED = ['water', 'lava'];
const VARIANTS = 4; // how many different pictures for the same ground (so it does not look like a grid)

// The picture of the ground of the tile (x, y). time: seconds (the water and the lava move).
export function groundTile(x, y, time) {
  const kind = groundKind(x, y);
  const variant = Math.floor(noise(x, y, 9) * VARIANTS);
  const frame = ANIMATED.includes(kind) ? Math.floor(time * 2 + noise(x, y, 4) * 4) % 4 : 0;
  const edges = edgesOf(x, y);
  return once('ground|' + kind + variant + frame + edges, () => {
    const grid = makeGrid(S, S);
    paintGround(grid, kind, variant, frame, edges);
    paintEdges(grid, edges, frame);
    return toCanvas(grid);
  });
}

// ---------- Small things painted on the ground ----------

const FLOWER_COLORS = ['#ff6fa8', '#ffd84a', '#ffffff', '#b48cff', '#ff8c5a'];

// 2 or 3 small flowers (the FLOWER tiles).
export function flowersDecal(x, y) {
  const variant = Math.floor(noise(x, y, 6) * 6);
  return once('flowers|' + variant, () => {
    const grid = makeGrid(S, S);
    const count = 2 + (variant % 2);
    for (let i = 0; i < count; i++) {
      const fx = 2 + Math.floor(randomOf(i, variant, 1) * 11);
      const fy = 2 + Math.floor(randomOf(variant, i, 2) * 10);
      const color = FLOWER_COLORS[Math.floor(randomOf(i, variant, 3) * FLOWER_COLORS.length)];
      dot(grid, fx, fy + 2, GRASS.deep); // the stem
      dot(grid, fx - 1, fy, color);
      dot(grid, fx + 1, fy, color);
      dot(grid, fx, fy - 1, color);
      dot(grid, fx, fy + 1, color);
      dot(grid, fx, fy, '#ffcf3a');
    }
    return toCanvas(grid);
  });
}
