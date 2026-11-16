import { MAP_SIZE, ROAD_CELLS } from '../world/map';
import { CELLS, SCALE } from '../world/size';
import { VILLAGES } from '../data/zones';

// What the player knows of the world. The world is cut in blocks of 16 x 16 tiles: a block becomes "explored"
// when the player comes near it. The world map shows the known blocks, the rest is hidden in the fog.
// A bought map shows more: the Village Map the villages and the roads, the Region Map everything.
// game.explored: one letter per block, '1' = explored, '0' = not yet.

export const BLOCK = 16;
export const BLOCKS = MAP_SIZE / BLOCK; // 160 blocks in each direction
const SIGHT = 2; // how many blocks around the player's block become explored

export function emptyExplored() {
  return '0'.repeat(BLOCKS * BLOCKS);
}

function markRect(blocks, x, y, w, h) {
  for (let by = Math.floor(y / BLOCK); by <= Math.floor((y + h - 1) / BLOCK); by++) {
    for (let bx = Math.floor(x / BLOCK); bx <= Math.floor((x + w - 1) / BLOCK); bx++) blocks.add(by * BLOCKS + bx);
  }
}

// The blocks that have a road or a village in them (what the Village Map shows).
function findRoadBlocks() {
  const blocks = new Set();
  for (const cell of ROAD_CELLS) markRect(blocks, (cell % CELLS) * SCALE, Math.floor(cell / CELLS) * SCALE, SCALE, SCALE);
  for (const village of VILLAGES) markRect(blocks, village.x, village.y, village.w, village.h);
  return blocks;
}

const ROAD_BLOCKS = findRoadBlocks();

// Called about once per second: the blocks around the player become explored.
export function exploreAround(game) {
  if (game.player.y >= MAP_SIZE) return; // in the insides
  const bx = Math.floor(game.player.x / BLOCK);
  const by = Math.floor(game.player.y / BLOCK);
  let cells = null;
  for (let y = by - SIGHT; y <= by + SIGHT; y++) {
    for (let x = bx - SIGHT; x <= bx + SIGHT; x++) {
      const index = y * BLOCKS + x;
      if (x < 0 || y < 0 || x >= BLOCKS || y >= BLOCKS || game.explored[index] === '1') continue;
      cells = cells || [...game.explored];
      cells[index] = '1';
    }
  }
  if (cells) game.explored = cells.join('');
}

// Is this block shown on the world map? (bx, by: the block, not the tile)
export function isBlockKnown(game, bx, by) {
  const index = by * BLOCKS + bx;
  if (game.player.mapLevel >= 2) return true;
  if (game.player.mapLevel >= 1 && ROAD_BLOCKS.has(index)) return true;
  return game.explored[index] === '1';
}

// Is this tile shown on the world map?
export function isKnown(game, x, y) {
  return isBlockKnown(game, Math.floor(x / BLOCK), Math.floor(y / BLOCK));
}
