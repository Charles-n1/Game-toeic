import { TILE } from './tileKinds';
import { CELLS, SCALE } from './size';
import { getTile, setTile } from './grid';
import { isPaintedRoad, paintedGround, paintedForest } from './painting';
import { noise } from './noise';

// The roads of the world: the roads of the painting, and the new roads that join each village (and each dungeon)
// to them. A road is a line of tiles 2 or 3 wide; it crosses the rivers on bridges, and nothing grows on it.
// The roads are found on the cells of the painting, then drawn on the tiles.

const PAINTED_WIDTH = 3;
const NEW_WIDTH = 2;
const SEARCH = 70; // cells: how far a new road may look for a road to join
const SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

// The point of a road on a cell: its middle, moved a little (the roads are not perfectly straight).
function roadPoint(cx, cy) {
  return { x: cx * SCALE + 5 + Math.round((noise(cx, cy, 71) - 0.5) * 4), y: cy * SCALE + 5 + Math.round((noise(cx, cy, 72) - 0.5) * 4) };
}

// ---------- Drawing a road on the tiles ----------

// isKept(x, y): true for the tiles a road must not touch (the inside of the villages).
function paveTile(x, y, isKept) {
  if (isKept(x, y)) return;
  const tile = getTile(x, y);
  if (tile === TILE.WATER) setTile(x, y, TILE.BRIDGE);
  else if (tile !== TILE.BRIDGE && tile !== TILE.STAIRS) setTile(x, y, TILE.PATH);
}

// A straight piece of road from a point to another, `width` tiles wide.
export function paveLine(from, to, width, isKept) {
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y), 1);
  const half = Math.floor(width / 2);
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(from.x + ((to.x - from.x) * i) / steps);
    const y = Math.round(from.y + ((to.y - from.y) * i) / steps);
    for (let dy = -half; dy < width - half; dy++) {
      for (let dx = -half; dx < width - half; dx++) paveTile(x + dx, y + dy, isKept);
    }
  }
}

// ---------- The roads of the painting ----------

export function pavePaintedRoads(isKept) {
  for (let cy = 0; cy < CELLS; cy++) {
    for (let cx = 0; cx < CELLS; cx++) {
      if (!isPaintedRoad(cx, cy)) continue;
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
        if (isPaintedRoad(cx + dx, cy + dy)) paveLine(roadPoint(cx, cy), roadPoint(cx + dx, cy + dy), PAINTED_WIDTH, isKept);
      }
    }
  }
}

// ---------- New roads: the cheapest way on the cells, to the closest road ----------

// The cost of walking on a cell: roads are cheap, forests and rivers cost more, cliffs and lava are impossible.
function costOf(cx, cy, roads) {
  const ground = paintedGround(cx, cy);
  if (ground === 'cliff' || ground === 'lava') return Infinity;
  if (roads.has(cy * CELLS + cx)) return 0.3;
  if (ground === 'water') return 9;
  return 1 + paintedForest(cx, cy) * 1.5;
}

// A small "priority queue": always gives back the cheapest item first.
function makeQueue() {
  const items = [];
  return {
    push(item) {
      items.push(item);
      let i = items.length - 1;
      while (i > 0 && items[(i - 1) >> 1].cost > items[i].cost) {
        [items[i], items[(i - 1) >> 1]] = [items[(i - 1) >> 1], items[i]];
        i = (i - 1) >> 1;
      }
    },
    pop() {
      const top = items[0];
      const last = items.pop();
      if (items.length > 0) {
        items[0] = last;
        let i = 0;
        for (;;) {
          const left = i * 2 + 1;
          const right = left + 1;
          let smallest = i;
          if (left < items.length && items[left].cost < items[smallest].cost) smallest = left;
          if (right < items.length && items[right].cost < items[smallest].cost) smallest = right;
          if (smallest === i) break;
          [items[i], items[smallest]] = [items[smallest], items[i]];
          i = smallest;
        }
      }
      return top;
    },
    get size() {
      return items.length;
    },
  };
}

// The cells from (cx, cy) to the closest cell of `roads` (a Set of cell numbers), or null if none is close.
function wayToRoads(cx, cy, roads) {
  const start = cy * CELLS + cx;
  const best = new Map([[start, 0]]);
  const cameFrom = new Map();
  const queue = makeQueue();
  queue.push({ cell: start, cost: 0 });
  while (queue.size > 0) {
    const { cell, cost } = queue.pop();
    if (cost > best.get(cell)) continue;
    if (roads.has(cell) && cell !== start) {
      const way = [];
      for (let at = cell; at !== undefined; at = cameFrom.get(at)) way.push({ cx: at % CELLS, cy: Math.floor(at / CELLS) });
      return way.reverse();
    }
    const x = cell % CELLS;
    const y = Math.floor(cell / CELLS);
    for (const [dx, dy] of SIDES) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= CELLS || ny >= CELLS || Math.abs(nx - cx) > SEARCH || Math.abs(ny - cy) > SEARCH) continue;
      const step = costOf(nx, ny, roads) * (dx !== 0 && dy !== 0 ? 1.41 : 1);
      const next = ny * CELLS + nx;
      if (step === Infinity || cost + step >= (best.get(next) ?? Infinity)) continue;
      best.set(next, cost + step);
      cameFrom.set(next, cell);
      queue.push({ cell: next, cost: cost + step });
    }
  }
  return null;
}

// All the cells with a road of the painting.
export function paintedRoadCells() {
  const cells = new Set();
  for (let cy = 0; cy < CELLS; cy++) {
    for (let cx = 0; cx < CELLS; cx++) if (isPaintedRoad(cx, cy)) cells.add(cy * CELLS + cx);
  }
  return cells;
}

// A new road from a door (a tile, the way out { dx, dy }) to the closest road. The cells it crosses become roads too
// (the next new road may join it). Returns the cells of the road (for the map of the roads), or [].
export function paveNewRoad(door, roads, isKept) {
  const out = { x: door.x + door.dx * 3, y: door.y + door.dy * 3 };
  const way = wayToRoads(Math.floor(out.x / SCALE), Math.floor(out.y / SCALE), roads);
  if (!way) return [];
  paveLine(door, out, NEW_WIDTH, isKept);
  let from = out;
  for (const cell of way.slice(1)) {
    const to = roadPoint(cell.cx, cell.cy);
    paveLine(from, to, NEW_WIDTH, isKept);
    from = to;
  }
  way.forEach((cell) => roads.add(cell.cy * CELLS + cell.cx));
  return way;
}
