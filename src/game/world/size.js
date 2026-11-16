// The size of the world.
// The painting (art/MAP.png) is the abstract version of the world: 256 x 256 cells. In the game, each cell is
// SCALE x SCALE tiles, so the island is 2560 x 2560 tiles. Under it, out of sight, the INSIDES: the floors of
// the dungeons and the caves, the home of the hero. Each inside has its own room (a "slot") in that band.

export const CELLS = 256; // the cells of the painting, in each direction
export const SCALE = 10; // the tiles of one cell, in each direction
export const WORLD_SIZE = CELLS * SCALE; // the island, in tiles

export const INSIDE_TOP = WORLD_SIZE + 8; // the first row of the insides
export const SLOT_W = 52; // the room of one inside, in tiles
export const SLOT_H = 40;
export const SLOTS_PER_ROW = Math.floor(WORLD_SIZE / SLOT_W);
export const SLOT_ROWS = 6;
export const MAP_HEIGHT = INSIDE_TOP + SLOT_ROWS * SLOT_H + 4; // the island + the insides
