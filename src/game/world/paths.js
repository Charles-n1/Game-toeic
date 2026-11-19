import { zoneAt } from '../data/zones';
import { isSolid } from './map';

// Finding a way from a tile to another, around the walls, the houses and the water, for everyone who walks:
// the people of the villages, the travelers, the caravans, the patrols, the friends of the hero.
// A walker plans its way ONCE (a search of the tiles, the most promising first: "A*"), then follows it.
// It never walks "by feel" into a wall, and never turns back and forth in front of an obstacle: when there is no
// way, it stops and says so (stepSmart returns false), and whoever moves it chooses another place to go.

const SIDES = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const KEY_WIDTH = 4096; // to make one number of (x, y): y * KEY_WIDTH + x (the map is less than 4096 wide)
const GREED = 1.3; // > 1: the search goes straight to the goal first (much faster, the way is nearly the shortest)

function isWalkable(x, y) {
  return !isSolid(x, y);
}

// ---------- A small heap: the cheapest tile first ----------
// Each item: [cost, x, y]. push and pop keep the cheapest item at heap[0].

function heapPush(heap, item) {
  heap.push(item);
  let i = heap.length - 1;
  while (i > 0) {
    const parent = (i - 1) >> 1;
    if (heap[parent][0] <= heap[i][0]) break;
    [heap[parent], heap[i]] = [heap[i], heap[parent]];
    i = parent;
  }
}

function heapPop(heap) {
  const top = heap[0];
  const last = heap.pop();
  if (heap.length > 0) {
    heap[0] = last;
    let i = 0;
    for (;;) {
      const left = i * 2 + 1;
      const right = left + 1;
      let smallest = i;
      if (left < heap.length && heap[left][0] < heap[smallest][0]) smallest = left;
      if (right < heap.length && heap[right][0] < heap[smallest][0]) smallest = right;
      if (smallest === i) break;
      [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
      i = smallest;
    }
  }
  return top;
}

// ---------- The search ----------

// The tiles to walk on, from (x, y) to (goalX, goalY): [{ x, y }] (the middles of the tiles), or null.
// The goal itself may be solid (a tree to cut, a door): the way stops next to it.
// maxSteps: how many tiles are looked at, at most (a goal too far or closed off gives up: null).
export function findPath(x, y, goalX, goalY, maxSteps = 9000, canWalk = isWalkable) {
  const startX = Math.floor(x);
  const startY = Math.floor(y);
  const goal = [Math.floor(goalX), Math.floor(goalY)];
  const guess = (cx, cy) => (Math.abs(cx - goal[0]) + Math.abs(cy - goal[1])) * GREED;
  const startKey = startY * KEY_WIDTH + startX;
  const cameFrom = new Map([[startKey, -1]]);
  const walked = new Map([[startKey, 0]]);
  const heap = [[guess(startX, startY), startX, startY]];
  for (let steps = 0; heap.length > 0 && steps < maxSteps; steps++) {
    const [, cx, cy] = heapPop(heap);
    if (Math.abs(cx - goal[0]) + Math.abs(cy - goal[1]) <= 1) return wayBack(cameFrom, cy * KEY_WIDTH + cx);
    const here = walked.get(cy * KEY_WIDTH + cx);
    for (const [dx, dy] of SIDES) {
      const nx = cx + dx;
      const ny = cy + dy;
      const key = ny * KEY_WIDTH + nx;
      if (walked.has(key) && walked.get(key) <= here + 1) continue;
      if (!canWalk(nx + 0.5, ny + 0.5)) continue;
      walked.set(key, here + 1);
      cameFrom.set(key, cy * KEY_WIDTH + cx);
      heapPush(heap, [here + 1 + guess(nx, ny), nx, ny]);
    }
  }
  return null;
}

// From the last tile back to the first one: the way, in the right order.
function wayBack(cameFrom, lastKey) {
  const path = [];
  for (let key = lastKey; key !== -1; key = cameFrom.get(key)) path.push({ x: (key % KEY_WIDTH) + 0.5, y: Math.floor(key / KEY_WIDTH) + 0.5 });
  return path.reverse();
}

// Moves a walker along its path: { x, y, path, dir, step, walking }. speed: tiles per second.
// Returns true when the end of the path is reached.
export function followPath(walker, speed, dt) {
  if (!walker.path || walker.path.length === 0) {
    walker.walking = false;
    return true;
  }
  walkAlong(walker, walker.path, speed * dt);
  walker.walking = true;
  walker.step = (walker.step || 0) + dt * 6;
  return walker.path.length === 0;
}

// Walks `move` tiles along the points (the points reached are taken off the list). Turns the walker.
function walkAlong(walker, points, move) {
  let left = move;
  while (points.length > 0 && left > 0) {
    const target = points[0];
    const far = Math.hypot(target.x - walker.x, target.y - walker.y);
    if (far > 0.0001) faceTo(walker, target.x - walker.x, target.y - walker.y);
    if (far <= left) {
      walker.x = target.x;
      walker.y = target.y;
      points.shift();
      left -= far;
    } else {
      walker.x += ((target.x - walker.x) / far) * left;
      walker.y += ((target.y - walker.y) / far) * left;
      left = 0;
    }
  }
}

function faceTo(walker, dx, dy) {
  walker.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
}

// ---------- The gates of the villages ----------

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

// Where to walk first: out by a gate when leaving a village, or to the gate of the village to reach.
function nextStop(walker, goalX, goalY, options) {
  const startZone = zoneAt(walker.x, walker.y);
  const goalZone = zoneAt(goalX, goalY);
  if (startZone.kind === 'village' && !options.stayInside && goalZone.id !== startZone.id) {
    const exit = bestGateOf(startZone, { x: goalX, y: goalY });
    if (exit) return exit.outside;
  } else if (goalZone.kind === 'village' && startZone.id !== goalZone.id) {
    const entry = bestGateOf(goalZone, walker);
    if (entry) {
      const isAtGate = Math.hypot(entry.outside.x - walker.x, entry.outside.y - walker.y) <= 3.2;
      return options.stopAtGate || !isAtGate ? entry.outside : entry.inside;
    }
  }
  return { x: goalX, y: goalY };
}

// ---------- Walking somewhere, the smart way ----------

const LEG = 70; // tiles: a long trip is planned in legs of this length (one after the other)
const PLAN_STEPS = 9000; // tiles looked at, at most, to plan one leg
const RETRY_AFTER = 2000; // ms: after a failed plan, the walker waits this long before trying again
const MOVED_GOAL = 1.5; // tiles: the goal moved this much (someone followed): the way is planned again

// The place to plan for: the stop itself, or (farther than `length`) a walkable place `length` tiles toward it.
function legTarget(walker, stop, length, canWalk) {
  const far = Math.hypot(stop.x - walker.x, stop.y - walker.y);
  if (far <= length) return stop;
  const ux = (stop.x - walker.x) / far;
  const uy = (stop.y - walker.y) / far;
  return walkableNear(walker.x + ux * length, walker.y + uy * length, 8, canWalk);
}

// The closest walkable tile around (x, y), at most `radius` tiles away (or null).
function walkableNear(x, y, radius, canWalk) {
  for (let r = 0; r <= radius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; // only the ring at distance r
        const tx = Math.floor(x) + dx + 0.5;
        const ty = Math.floor(y) + dy + 0.5;
        if (canWalk(tx, ty)) return { x: tx, y: ty };
      }
    }
  }
  return null;
}

// Must the walker plan its way (again)? No way yet, the goal moved, or the way got blocked.
function needsPlan(walker, stop, canWalk, now) {
  if (now < (walker._planAgainAt || 0)) return false;
  const route = walker._navPath;
  if (!route || route.length === 0) return true;
  if (!walker._navGoal || Math.hypot(walker._navGoal.x - stop.x, walker._navGoal.y - stop.y) > MOVED_GOAL) return true;
  return !canWalk(route[0].x, route[0].y);
}

// Plans the way to the stop (or to the next leg of a long trip: a long leg first, a shorter one if a lake or
// a cliff is in the way). No way at all: the walker waits a bit before retrying.
function plan(walker, stop, canWalk, now) {
  walker._navGoal = { x: stop.x, y: stop.y };
  for (const length of [LEG, LEG * 0.4, 12]) {
    const target = legTarget(walker, stop, length, canWalk);
    const path = target && findPath(walker.x, walker.y, target.x, target.y, PLAN_STEPS, canWalk);
    if (path) {
      walker._navPath = path.slice(1);
      if (target === stop && canWalk(stop.x, stop.y)) walker._navPath.push({ x: stop.x, y: stop.y }); // the exact spot
      return;
    }
    if (target === stop) break; // the stop itself is closer than a leg: no shorter leg to try
  }
  walker._navPath = null;
  walker._planAgainAt = now + RETRY_AFTER + Math.random() * 1000;
}

// Moves an entity toward (goalX, goalY) by a real way around the walls, the water and the buildings.
// Leaving a village, it goes out by a gate; going to a village, to its gate (stopAtGate: and stops there).
// options: { canWalk(x, y), stayInside, stopAtGate, now }.
// Returns true while it walks; false when it is there, or when there is no way (the caller picks another goal).
export function stepSmart(walker, goalX, goalY, speed, dt, options = {}) {
  const canWalk = options.canWalk || isWalkable;
  const now = options.now || Date.now();
  if (Math.hypot(goalX - walker.x, goalY - walker.y) < 0.15) return stopWalking(walker);
  const stop = nextStop(walker, goalX, goalY, options);
  if (needsPlan(walker, stop, canWalk, now)) plan(walker, stop, canWalk, now);
  const route = walker._navPath;
  if (!route || route.length === 0) return stopWalking(walker);
  walkAlong(walker, route, speed * dt);
  walker.walking = true;
  walker.step = (walker.step || 0) + dt * 6;
  return true;
}

function stopWalking(walker) {
  walker.walking = false;
  return false;
}
