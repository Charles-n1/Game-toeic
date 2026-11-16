import { GROUND_TEXT, BIOME_TEXT, FOREST_TEXT, ROAD_TEXT } from './terrain';
import { CELLS } from './size';

// What the painting (art/MAP2.png) says about each of its cells, read from world/terrain.js
// (made by tools/build_world.py). A cell = 10 x 10 tiles of the game.
//   ground: 'water' | 'grass' | 'sand' | 'snow' | 'ash' | 'lava' | 'cliff'   (the big shapes)
//   biome: 'meadow' | 'forest' | 'mountain' | 'demon' | 'desert' | 'coast'    (the land)
//   forest: from 0 (no tree) to 1 (a deep forest)
//   road: true on the middle line of a painted road

const GROUND_LETTERS = { w: 'water', g: 'grass', s: 'sand', n: 'snow', a: 'ash', l: 'lava', c: 'cliff' };
const BIOME_LETTERS = { m: 'meadow', f: 'forest', n: 'mountain', v: 'demon', d: 'desert', c: 'coast' };
const FOREST_LETTERS = 'abcdefghij'; // a = 0 ... j = 9

// 'g3w2|...' -> the letters, row after row.
function unpack(text) {
  const letters = [];
  for (const row of text.split('|')) {
    for (const [, letter, count] of row.matchAll(/([A-Za-z])(\d+)/g)) {
      for (let i = 0; i < Number(count); i++) letters.push(letter);
    }
  }
  return letters;
}

const GROUNDS = unpack(GROUND_TEXT).map((letter) => GROUND_LETTERS[letter]);
const BIOMES = unpack(BIOME_TEXT).map((letter) => BIOME_LETTERS[letter]);
const FORESTS = unpack(FOREST_TEXT).map((letter) => FOREST_LETTERS.indexOf(letter) / 9);
const ROADS = unpack(ROAD_TEXT).map((letter) => letter === 'r');

function isOut(cx, cy) {
  return cx < 0 || cy < 0 || cx >= CELLS || cy >= CELLS;
}

export function paintedGround(cx, cy) {
  return isOut(cx, cy) ? 'water' : GROUNDS[cy * CELLS + cx];
}

export function paintedBiome(cx, cy) {
  return isOut(cx, cy) ? 'coast' : BIOMES[cy * CELLS + cx];
}

export function paintedForest(cx, cy) {
  return isOut(cx, cy) ? 0 : FORESTS[cy * CELLS + cx];
}

export function isPaintedRoad(cx, cy) {
  return !isOut(cx, cy) && ROADS[cy * CELLS + cx];
}

// Can people live on this cell? (land, not a cliff, not lava, not the demon island)
export function isLivable(cx, cy) {
  return ['grass', 'sand', 'snow'].includes(paintedGround(cx, cy)) && paintedBiome(cx, cy) !== 'demon';
}

// Can people walk on this cell? (anything but water, cliffs and lava)
export function isWalkableCell(cx, cy) {
  return ['grass', 'sand', 'snow', 'ash'].includes(paintedGround(cx, cy));
}
