import { isSolid } from './map';

// Finding a way from a tile to another, around the walls, the houses and the water (for the people who walk
// to their work). A search in rings (the closest tiles first), limited: a far goal gives up (null).

const SIDES = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// The tiles to walk on, from (x, y) to (goalX, goalY): [{ x, y }] (the middles of the tiles), or null.
// The goal itself may be solid (a tree to cut, a rock to break): the way stops next to it.
export function findPath(x, y, goalX, goalY, maxSteps = 2500) {
  const start = [Math.floor(x), Math.floor(y)];
  const goal = [Math.floor(goalX), Math.floor(goalY)];
  const cameFrom = new Map([[start.join(','), null]]);
  const queue = [start];
  let found = null;
  for (let i = 0; i < queue.length && i < maxSteps; i++) {
    const [cx, cy] = queue[i];
    if (Math.abs(cx - goal[0]) + Math.abs(cy - goal[1]) <= 1) {
      found = [cx, cy];
      break;
    }
    for (const [dx, dy] of SIDES) {
      const next = [cx + dx, cy + dy];
      const key = next.join(',');
      if (cameFrom.has(key) || isSolid(next[0] + 0.5, next[1] + 0.5)) continue;
      cameFrom.set(key, [cx, cy]);
      queue.push(next);
    }
  }
  if (!found) return null;
  const path = [];
  for (let cell = found; cell; cell = cameFrom.get(cell.join(','))) path.push({ x: cell[0] + 0.5, y: cell[1] + 0.5 });
  return path.reverse();
}

// Moves a walker along its path: { x, y, path, dir, step, walking }. speed: tiles per second.
// Returns true when the end of the path is reached.
export function followPath(walker, speed, dt) {
  if (!walker.path || walker.path.length === 0) {
    walker.walking = false;
    return true;
  }
  const target = walker.path[0];
  const far = Math.hypot(target.x - walker.x, target.y - walker.y);
  const move = speed * dt;
  if (far <= move) {
    walker.x = target.x;
    walker.y = target.y;
    walker.path.shift();
  } else {
    const dx = (target.x - walker.x) / far;
    const dy = (target.y - walker.y) / far;
    walker.x += dx * move;
    walker.y += dy * move;
    walker.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
  }
  walker.walking = true;
  walker.step = (walker.step || 0) + dt * 6;
  return walker.path.length === 0;
}
