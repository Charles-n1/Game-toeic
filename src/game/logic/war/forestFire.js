import { TILE, tileAt } from '../../world/map';
import { isRaining } from '../weather';

// Forest fires. When the demons take a piece of land, they often set its forest on fire (see war/demonLand.js).
// A burning tree lights the trees next to it, then burns down: it stays a black trunk until it grows back.
// Each fire has some fuel: it eats that many trees at most, then dies out (it never burns the whole island).
// The rain puts every fire out.
// game.fires: { burning: { 'x,y': { hours, fire } }, burnt: { 'x,y': day it burnt }, fuel: { fire: trees left }, nextFire, clock }

const BURN_HOURS = 5; // how long a tree burns before it falls black
const SPREAD_CHANCE = 0.1; // each hour, the chance that a burning tree lights each tree near it
const SPREAD_RANGE = 5; // tiles: the trees this close can catch the fire (the trees are about 4 tiles apart)
const FUEL = [12, 30]; // a fire eats between 12 and 30 trees
const MAX_BURNING = 90; // never more trees burning at once, in the whole world
const REGROW_DAYS = 20; // a burnt tree grows back after this many days

export function ensureFires(game) {
  if (!game.fires || typeof game.fires !== 'object') game.fires = {};
  const fires = game.fires;
  if (!fires.burning) fires.burning = {};
  if (!fires.burnt) fires.burnt = {};
  if (!fires.fuel) fires.fuel = {};
  if (!fires.nextFire) fires.nextFire = 1;
  if (!fires.clock) fires.clock = 0;
  return fires;
}

function keyOf(x, y) {
  return x + ',' + y;
}

function isTree(x, y) {
  return tileAt(x, y) === TILE.TREE;
}

function hasAny(list) {
  for (const key in list) return true;
  return false;
}

// Is there a fire, or a burnt tree, anywhere? (the drawing does not look for them when there is none)
export function hasFires(game) {
  return Boolean(game.fires) && (hasAny(game.fires.burning) || hasAny(game.fires.burnt));
}

// 'burning', 'burnt' or null: the state of the tree at (x, y) (whole tiles).
export function treeFireAt(game, x, y) {
  const fires = game.fires;
  if (!fires) return null;
  const key = keyOf(x, y);
  if (fires.burning[key]) return 'burning';
  if (fires.burnt[key] !== undefined) return 'burnt';
  return null;
}

// The trees burning now, as { x, y } (for the lights of the night).
export function burningTrees(game) {
  if (!game.fires) return [];
  return Object.keys(game.fires.burning).map((key) => {
    const [x, y] = key.split(',').map(Number);
    return { x: x, y: y };
  });
}

// Sets the tree at (x, y) on fire, as part of the fire `fire`. false: no tree there, or it already burns / burnt.
function lightTree(game, x, y, fire) {
  const fires = ensureFires(game);
  const key = keyOf(x, y);
  if (!isTree(x, y) || fires.burning[key] || fires.burnt[key] !== undefined) return false;
  if (Object.keys(fires.burning).length >= MAX_BURNING) return false;
  fires.burning[key] = { hours: BURN_HOURS, fire: fire };
  return true;
}

// A new fire starts in the first tree found around (x, y), at most `radius` tiles away. true = a tree caught.
export function lightForestFire(game, x, y, radius = 6) {
  const fires = ensureFires(game);
  const fire = fires.nextFire;
  const cx = Math.floor(x);
  const cy = Math.floor(y);
  for (let r = 0; r <= radius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; // only the ring at distance r
        if (lightTree(game, cx + dx, cy + dy, fire)) {
          fires.fuel[fire] = FUEL[0] + Math.floor(Math.random() * (FUEL[1] - FUEL[0] + 1));
          fires.nextFire += 1;
          return true;
        }
      }
    }
  }
  return false;
}

// A burning tree may light the trees near it (while its fire still has fuel).
function spreadFrom(game, x, y, fire) {
  const fires = game.fires;
  for (let dy = -SPREAD_RANGE; dy <= SPREAD_RANGE; dy++) {
    for (let dx = -SPREAD_RANGE; dx <= SPREAD_RANGE; dx++) {
      if (!(fires.fuel[fire] > 0)) return;
      if ((dx !== 0 || dy !== 0) && Math.random() < SPREAD_CHANCE && lightTree(game, x + dx, y + dy, fire)) fires.fuel[fire] -= 1;
    }
  }
}

// One hour of fire: each burning tree may light its neighbours, and burns a bit more (black when it is done).
function burnOneHour(game) {
  const fires = game.fires;
  for (const [key, tree] of Object.entries(fires.burning)) {
    const [x, y] = key.split(',').map(Number);
    spreadFrom(game, x, y, tree.fire);
    tree.hours -= 1;
    if (tree.hours <= 0) {
      delete fires.burning[key];
      fires.burnt[key] = game.day;
    }
  }
}

// The rain: every burning tree goes out (black, but the fire stops there).
function putOutFires(game) {
  const fires = game.fires;
  for (const key of Object.keys(fires.burning)) fires.burnt[key] = game.day;
  fires.burning = {};
  fires.fuel = {};
}

// Called as the time passes (hours: a part of an hour, or more). The fires live hour after hour.
export function burnForests(game, hours) {
  if (!game.fires || !hasAny(game.fires.burning)) return;
  const fires = game.fires;
  fires.clock += hours;
  let steps = 0;
  while (fires.clock >= 1 && steps < 24) {
    fires.clock -= 1;
    steps += 1;
    if (isRaining(game)) putOutFires(game);
    else burnOneHour(game);
  }
}

// Every morning: the trees burnt long ago have grown back.
export function regrowBurntTrees(game) {
  if (!game.fires) return;
  const fires = game.fires;
  for (const [key, day] of Object.entries(fires.burnt)) {
    if (game.day - day >= REGROW_DAYS) delete fires.burnt[key];
  }
  for (const fire of Object.keys(fires.fuel)) {
    if (!Object.values(fires.burning).some((tree) => String(tree.fire) === fire)) delete fires.fuel[fire]; // a fire with no tree left is over
  }
}
