import { TILE } from './tileKinds';
import { WORLD_SIZE, MAP_HEIGHT } from './size';
import { natureAt, natureBiomeAt } from './ground';

// The tiles of the whole map, in one big array of numbers (a tile = one number of TILE).
// The world is huge (2560 x 2560 tiles): the nature of a tile is only made the first time someone looks at it
// (UNKNOWN until then). What the people built (villages, roads, dungeons) is written on it at the start.

export const MAP_WIDTH = WORLD_SIZE;
const UNKNOWN = 255;
const BIOME_NAMES = ['meadow', 'forest', 'mountain', 'demon', 'desert', 'coast'];

const tiles = new Uint8Array(MAP_WIDTH * MAP_HEIGHT).fill(UNKNOWN);
const biomes = new Uint8Array(MAP_WIDTH * MAP_HEIGHT).fill(UNKNOWN);

function isOnMap(x, y) {
  return x >= 0 && y >= 0 && x < MAP_WIDTH && y < MAP_HEIGHT;
}

// The tile at (x, y) (whole numbers). Under the island (the insides), an unknown tile is nothing (VOID).
export function getTile(x, y) {
  if (!isOnMap(x, y)) return y < WORLD_SIZE ? TILE.WATER : TILE.VOID;
  const index = y * MAP_WIDTH + x;
  if (tiles[index] === UNKNOWN) tiles[index] = y < WORLD_SIZE ? natureAt(x, y) : TILE.VOID;
  return tiles[index];
}

export function setTile(x, y, tile) {
  if (isOnMap(x, y)) tiles[y * MAP_WIDTH + x] = tile;
}

export function fillRect(x, y, w, h, tile) {
  for (let row = y; row < y + h; row++) {
    for (let column = x; column < x + w; column++) setTile(column, row, tile);
  }
}

// The land of nature at (x, y) (the villages and the insides are told by data/zones.js).
export function natureBiome(x, y) {
  if (!isOnMap(x, y) || y >= WORLD_SIZE) return 'coast';
  const index = y * MAP_WIDTH + x;
  if (biomes[index] === UNKNOWN) biomes[index] = BIOME_NAMES.indexOf(natureBiomeAt(x, y));
  return BIOME_NAMES[biomes[index]];
}
