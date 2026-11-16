import { LANDS } from '../data/lands';
import { CELLS, SCALE } from './size';

// The land of each cell of the painting: the land whose middle is the closest (the lands have no border line).
// Found once for the 256 x 256 cells, then read very often.

function closestLand(cx, cy) {
  let best = 0;
  let bestFar = Infinity;
  LANDS.forEach((land, i) => {
    const far = (land.x - cx) * (land.x - cx) + (land.y - cy) * (land.y - cy);
    if (far < bestFar) {
      best = i;
      bestFar = far;
    }
  });
  return best;
}

const LAND_OF_CELL = new Uint8Array(CELLS * CELLS);
for (let cy = 0; cy < CELLS; cy++) {
  for (let cx = 0; cx < CELLS; cx++) LAND_OF_CELL[cy * CELLS + cx] = closestLand(cx, cy);
}

function clampCell(value) {
  return Math.min(CELLS - 1, Math.max(0, Math.floor(value)));
}

// The land of a cell of the painting.
export function landOfCell(cx, cy) {
  return LANDS[LAND_OF_CELL[clampCell(cy) * CELLS + clampCell(cx)]];
}

// The land of a tile of the island.
export function landOfTile(x, y) {
  return landOfCell(x / SCALE, y / SCALE);
}
