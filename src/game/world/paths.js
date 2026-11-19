import { zoneAt } from '../data/zones';
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

// ---------- Gate-Aware & Obstacle-Avoiding Smart Navigation ----------

// Returns { inside, outside, gate } for the open gate of `village` closest to `target`.
export function bestGateOf(village, target) {
  const gates = village?.plan?.gates;
  if (!gates || gates.length === 0) return null;
  let best = null;
  let bestFar = Infinity;
  for (const g of gates) {
    const halfW = Math.floor((g.w || 3) / 2);
    const cx = g.dx === 0 ? g.x + halfW + 0.5 : g.x + 0.5;
    const cy = g.dy === 0 ? g.y + halfW + 0.5 : g.y + 0.5;
    const outside = { x: cx + g.dx * 3.5, y: cy + g.dy * 3.5 };
    const inside = { x: cx - g.dx * 3.5, y: cy - g.dy * 3.5 };
    const far = Math.hypot(outside.x - target.x, outside.y - target.y);
    if (!isSolid(outside.x, outside.y) && far < bestFar) {
      best = { gate: g, inside, outside };
      bestFar = far;
    }
  }
  return best;
}

function advanceAlongPoints(walker, points, move, canWalk) {
  while (points.length > 0) {
    const pt = points[0];
    const far = Math.hypot(pt.x - walker.x, pt.y - walker.y);
    if (far <= move) {
      if (!canWalk(pt.x, pt.y)) {
        points.length = 0;
        return null;
      }
      const dx = pt.x - walker.x;
      const dy = pt.y - walker.y;
      walker.x = pt.x;
      walker.y = pt.y;
      points.shift();
      return { dx, dy, moved: true };
    }
    const dx = ((pt.x - walker.x) / far) * move;
    const dy = ((pt.y - walker.y) / far) * move;
    if (!canWalk(walker.x + dx, walker.y + dy)) {
      points.length = 0;
      return null;
    }
    walker.x += dx;
    walker.y += dy;
    return { dx, dy, moved: true };
  }
  return null;
}

// Moves an entity toward (goalX, goalY) cleanly:
// - Routes out the nearest open town gate when inside a village aiming outside (no wall-banging at the south gate!)
// - Routes to the destination village's outside gate when `options.stopAtGate` is true
// - Uses local multi-angle steering + short BFS findPath detours around walls/water/buildings (never flies over solids)
export function stepSmart(walker, goalX, goalY, speed, dt, options = {}) {
  const canWalk = options.canWalk || ((x, y) => !isSolid(x, y));
  const now = options.now || Date.now();
  const move = speed * dt;
  const distToGoal = Math.hypot(goalX - walker.x, goalY - walker.y);
  if (distToGoal < 0.15) {
    walker.walking = false;
    return false;
  }

  let tx = goalX;
  let ty = goalY;
  const startZone = zoneAt(walker.x, walker.y);
  const goalZone = zoneAt(goalX, goalY);
  if (startZone.kind === 'village' && !options.stayInside && goalZone.id !== startZone.id) {
    const exit = bestGateOf(startZone, { x: goalX, y: goalY });
    if (exit) {
      tx = exit.outside.x;
      ty = exit.outside.y;
    }
  } else if (goalZone.kind === 'village' && startZone.id !== goalZone.id) {
    const entry = bestGateOf(goalZone, walker);
    if (entry) {
      if (options.stopAtGate || Math.hypot(entry.outside.x - walker.x, entry.outside.y - walker.y) > 3.2) {
        tx = entry.outside.x;
        ty = entry.outside.y;
      } else {
        tx = entry.inside.x;
        ty = entry.inside.y;
      }
    }
  }

  // Anti-stuck detector: if an entity barely moved over 420ms, clear stale paths and sidestep obstacles
  if (now - (walker._stAt || 0) > 420) {
    const movedSince = Math.hypot(walker.x - (walker._stX ?? walker.x), walker.y - (walker._stY ?? walker.y));
    if (walker._stAt && movedSince < 0.05) {
      walker._stuckCount = (walker._stuckCount || 0) + 1;
      walker._navPath = null;
      walker._navRetryAt = 0;
      walker._steerSign = -1 * (walker._steerSign || 1);
      const escapeAngle = Math.atan2(ty - walker.y, tx - walker.x) + (walker._stuckCount % 2 === 0 ? 1.57 : -1.57);
      const ex = walker.x + Math.cos(escapeAngle) * 2.2;
      const ey = walker.y + Math.sin(escapeAngle) * 2.2;
      if (canWalk(ex, ey)) walker._navPath = [{ x: ex, y: ey }];
    } else {
      walker._stuckCount = 0;
    }
    walker._stX = walker.x;
    walker._stY = walker.y;
    walker._stAt = now;
  }

  // Follow cached short detour path if still valid toward current waypoint
  if (walker._navPath && walker._navPath.length > 0 && now < (walker._navUntil || 0)) {
    const res = advanceAlongPoints(walker, walker._navPath, move, canWalk);
    if (res && res.moved) {
      walker.walking = true;
      walker.step = (walker.step || 0) + dt * 6;
      if (Math.abs(res.dx) > 0.001 || Math.abs(res.dy) > 0.001) {
        walker.dir = Math.abs(res.dx) > Math.abs(res.dy) ? (res.dx < 0 ? 'left' : 'right') : res.dy < 0 ? 'up' : 'down';
      }
      return true;
    }
  }

  const far = Math.hypot(tx - walker.x, ty - walker.y);
  if (far < 0.12) return false;
  const baseAngle = Math.atan2(ty - walker.y, tx - walker.x);
  const directLookX = walker.x + Math.cos(baseAngle) * Math.min(1.6, far);
  const directLookY = walker.y + Math.sin(baseAngle) * Math.min(1.6, far);

  // If direct line ahead is blocked & cooldown elapsed, run a fast local BFS around walls/buildings/gates
  if (!canWalk(directLookX, directLookY) && now >= (walker._navRetryAt || 0)) {
    walker._navRetryAt = now + 900;
    const bfsLimit = startZone.kind === 'village' || goalZone.kind === 'village' ? 1800 : 750;
    const detour = findPath(walker.x, walker.y, tx, ty, bfsLimit);
    if (detour && detour.length > 1) {
      walker._navPath = detour.slice(1);
      walker._navUntil = now + 2200;
      const res = advanceAlongPoints(walker, walker._navPath, move, canWalk);
      if (res && res.moved) {
        walker.walking = true;
        walker.step = (walker.step || 0) + dt * 6;
        walker.dir = Math.abs(res.dx) > Math.abs(res.dy) ? (res.dx < 0 ? 'left' : 'right') : res.dy < 0 ? 'up' : 'down';
        return true;
      }
    }
  }

  // Smooth multi-angle steering with turn-direction memory to skirt lakes/cliffs without oscillation
  const pref = walker._steerSign || 1;
  const angles = [0, 0.35 * pref, -0.35 * pref, 0.72 * pref, -0.72 * pref, 1.1 * pref, -1.1 * pref, 1.5 * pref, -1.5 * pref, 1.95 * pref, -1.95 * pref, 2.4 * pref, -2.4 * pref];
  for (const offset of angles) {
    const ang = baseAngle + offset;
    const dx = Math.cos(ang) * move;
    const dy = Math.sin(ang) * move;
    const probeX = walker.x + Math.cos(ang) * Math.min(0.85, far);
    const probeY = walker.y + Math.sin(ang) * Math.min(0.85, far);
    if (canWalk(walker.x + dx, walker.y + dy) && (offset === 0 || canWalk(probeX, probeY))) {
      walker.x += dx;
      walker.y += dy;
      walker._steerSign = offset === 0 ? pref : offset > 0 ? 1 : -1;
      walker.walking = true;
      walker.step = (walker.step || 0) + dt * 6;
      walker.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
      return true;
    }
  }

  // Last-resort X/Y axis slide (never passes through solid walls or water)
  const ux = Math.cos(baseAngle) * move;
  const uy = Math.sin(baseAngle) * move;
  const beforeX = walker.x;
  const beforeY = walker.y;
  let moved = false;
  if (canWalk(walker.x + ux, walker.y)) {
    walker.x += ux;
    moved = true;
  }
  if (canWalk(walker.x, walker.y + uy)) {
    walker.y += uy;
    moved = true;
  }
  const actualDelta = Math.hypot(walker.x - beforeX, walker.y - beforeY);
  walker.walking = moved && actualDelta > 0.002;
  if (walker.walking) {
    walker.step = (walker.step || 0) + dt * 6;
    walker.dir = Math.abs(ux) > Math.abs(uy) ? (ux < 0 ? 'left' : 'right') : uy < 0 ? 'up' : 'down';
  }
  return walker.walking;
}
