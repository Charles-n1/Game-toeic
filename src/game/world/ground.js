import { TILE } from './tileKinds';
import { SCALE, CELLS, WORLD_SIZE } from './size';
import { paintedGround, paintedBiome, paintedForest } from './painting';
import { noise, smoothNoise } from './noise';
import { SETTLEMENTS, DUNGEON_RECTS } from './places';

// The nature of the world, tile by tile, made from the abstract painting (see world/painting.js).
// Each tile looks at the cell of the painting under it (a little moved by a smooth noise, so that the borders
// of the lands are wavy, not square), then adds the details: the trees (big ones, a few tiles apart),
// the rocks, the flowers, the ponds. The villages, the roads and the dungeons are added later (world/map.js).

const TREE_STEP = 4; // one tree at most in each square of 4 x 4 tiles (the trees are big)
const ROCK_STEP = 6;
const ROCKS = { mountain: 0.22, desert: 0.1, demon: 0.12, meadow: 0.025, forest: 0.035, coast: 0.04 };
const PONDS = ['meadow', 'forest'];
const FLOOR_OF = { grass: TILE.GRASS, sand: TILE.SAND, snow: TILE.STONE, ash: TILE.ASH };

// The cell of the painting under a tile, moved by a smooth noise (two sizes of waves): { cx, cy }.
function paintedCellAt(x, y) {
  const wx = x + (smoothNoise(x, y, 26, 11) - 0.5) * 18 + (smoothNoise(x, y, 7, 13) - 0.5) * 5;
  const wy = y + (smoothNoise(x, y, 26, 12) - 0.5) * 18 + (smoothNoise(x, y, 7, 14) - 0.5) * 5;
  return { cx: Math.min(CELLS - 1, Math.max(0, Math.floor(wx / SCALE))), cy: Math.min(CELLS - 1, Math.max(0, Math.floor(wy / SCALE))) };
}

// How many trees grow here, from 0 to 1: the forest of the painting, smoothed between the cells,
// with clearings (a smooth noise takes some trees away).
function forestAt(x, y) {
  const gx = x / SCALE - 0.5;
  const gy = y / SCALE - 0.5;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const sx = gx - x0;
  const sy = gy - y0;
  const top = paintedForest(x0, y0) * (1 - sx) + paintedForest(x0 + 1, y0) * sx;
  const bottom = paintedForest(x0, y0 + 1) * (1 - sx) + paintedForest(x0 + 1, y0 + 1) * sx;
  const clearing = smoothNoise(x, y, 18, 15) < 0.28 ? 0.35 : 1;
  return (top * (1 - sy) + bottom * sy) * clearing;
}

// Is (x, y) the chosen spot of its square of `step` x `step` tiles? (one spot per square, here or there)
function isSpotOfSquare(x, y, step, salt) {
  const sx = Math.floor(x / step);
  const sy = Math.floor(y / step);
  const spotX = sx * step + Math.floor(noise(sx, sy, salt) * step);
  const spotY = sy * step + Math.floor(noise(sx, sy, salt + 1) * step);
  return x === spotX && y === spotY;
}

function hasTree(x, y, biome) {
  if (!isSpotOfSquare(x, y, TREE_STEP, 21)) return false;
  const square = noise(Math.floor(x / TREE_STEP), Math.floor(y / TREE_STEP), 23);
  const lonelyTree = biome === 'meadow' || biome === 'coast' ? 0.05 : 0.02; // a few trees even in the meadows
  return square < Math.max(forestAt(x, y) * 0.95, lonelyTree);
}

function hasRock(x, y, biome) {
  return isSpotOfSquare(x, y, ROCK_STEP, 31) && noise(Math.floor(x / ROCK_STEP), Math.floor(y / ROCK_STEP), 33) < (ROCKS[biome] || 0);
}

// The cells of the painting where people built (a village, a dungeon) and around them: no pond there.
function builtCells() {
  const cells = new Set();
  for (const place of [...SETTLEMENTS.people, ...SETTLEMENTS.monsters, ...SETTLEMENTS.camps, ...DUNGEON_RECTS]) {
    for (let cy = Math.floor(place.y / SCALE) - 2; cy <= Math.floor((place.y + place.h) / SCALE) + 2; cy++) {
      for (let cx = Math.floor(place.x / SCALE) - 2; cx <= Math.floor((place.x + place.w) / SCALE) + 2; cx++) cells.add(cy * CELLS + cx);
    }
  }
  return cells;
}

const BUILT_CELLS = builtCells();

// The small lakes of the meadows and the forests (with a ring of sand). None near the villages.
function pondAt(x, y, biome) {
  if (!PONDS.includes(biome) || BUILT_CELLS.has(Math.floor(y / SCALE) * CELLS + Math.floor(x / SCALE))) return null;
  const depth = smoothNoise(x, y, 44, 41);
  if (depth > 0.885) return TILE.WATER;
  if (depth > 0.865) return TILE.SAND;
  return null;
}

function hasFlowers(x, y, biome) {
  return (biome === 'meadow' || biome === 'forest') && smoothNoise(x, y, 12, 51) > 0.76 && noise(x, y, 52) < 0.3;
}

// The thin cracks of lava on the ash of the demon island.
function isLavaCrack(x, y) {
  return Math.abs(smoothNoise(x, y, 30, 61) - 0.5) < 0.012;
}

// The land of a tile: 'meadow' | 'forest' | 'mountain' | 'demon' | 'desert' | 'coast'.
export function natureBiomeAt(x, y) {
  if (x < 0 || y < 0 || x >= WORLD_SIZE || y >= WORLD_SIZE) return 'coast';
  const { cx, cy } = paintedCellAt(x, y);
  return paintedBiome(cx, cy);
}

// The tile of nature at (x, y): what is there before the people build anything.
export function natureAt(x, y) {
  if (x < 0 || y < 0 || x >= WORLD_SIZE || y >= WORLD_SIZE) return TILE.WATER;
  const { cx, cy } = paintedCellAt(x, y);
  const ground = paintedGround(cx, cy);
  const biome = paintedBiome(cx, cy);
  if (ground === 'water') return TILE.WATER;
  if (ground === 'lava') return TILE.LAVA;
  if (ground === 'cliff') return TILE.CLIFF;
  const pond = pondAt(x, y, biome);
  if (pond !== null) return pond;
  if (ground === 'ash' && isLavaCrack(x, y)) return TILE.LAVA;
  if (hasTree(x, y, biome)) return ground === 'ash' ? TILE.DEAD_TREE : TILE.TREE;
  if (hasRock(x, y, biome)) return TILE.ROCK;
  if (ground === 'grass' && hasFlowers(x, y, biome)) return TILE.FLOWER;
  return FLOOR_OF[ground];
}
