import { MAP, MAP_SIZE, TILE } from '../world/map';
import { zoneAt } from '../data/zones';

// What the player knows of the world. The world is cut in blocks of 8 x 8 tiles: a block becomes "explored" when
// the player comes near it. The world map shows the known blocks, the rest is hidden in the fog.
// A bought map shows more: the Village Map the villages and the roads, the Region Map everything.
// game.explored: one letter per block, '1' = explored, '0' = not yet.

export const BLOCK = 8;
export const BLOCKS = MAP_SIZE / BLOCK; // 15 blocks in each direction
const SIGHT = 1; // how many blocks around the player's block become explored

export function emptyExplored() {
  return '0'.repeat(BLOCKS * BLOCKS);
}

// The blocks that have a road, a bridge or a village in them (what the Village Map shows).
function findRoadBlocks() {
  const blocks = new Set();
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      const tile = MAP[y * MAP_SIZE + x];
      if (tile === TILE.PATH || tile === TILE.BRIDGE || zoneAt(x, y).kind === 'village') {
        blocks.add(Math.floor(y / BLOCK) * BLOCKS + Math.floor(x / BLOCK));
      }
    }
  }
  return blocks;
}

const ROAD_BLOCKS = findRoadBlocks();

// Called about once per second: the blocks around the player become explored.
export function exploreAround(game) {
  const cells = [...game.explored];
  const bx = Math.floor(game.player.x / BLOCK);
  const by = Math.floor(game.player.y / BLOCK);
  for (let y = by - SIGHT; y <= by + SIGHT; y++) {
    for (let x = bx - SIGHT; x <= bx + SIGHT; x++) {
      if (x >= 0 && y >= 0 && x < BLOCKS && y < BLOCKS) cells[y * BLOCKS + x] = '1';
    }
  }
  game.explored = cells.join('');
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
