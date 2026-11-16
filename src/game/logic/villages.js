import { VILLAGES, VILLAGE_LEVELS, BRIDGE_NEEDS, PENS, FIELDS, PLAZAS, zoneAt } from '../data/zones';
import { TILE, tileAt, isSolid, gatesOf } from '../world/map';
import { findPath, followPath } from '../world/paths';
import { pickRandom } from '../../logic/random';
import { isNight } from './clock';
import { notify } from './messages';

// The villages live: their people cut wood, break stones, grow food, breed and hunt animals, and build.
// game.villages: { lexia: { wood, stone, food, level, bridge, animals: { pig, cow, chicken, horse } } }
// The level of a village (see VILLAGE_LEVELS): 0 = no wall, 1 = a palisade of wood, 2 = a wall of stone.
// An old village (founded long ago) starts evolved; a young one starts with nothing and builds over the days.
// What a village can gather depends on what grows around it: a village in a forest gets wood fast.

const JOBS = ['farmer', 'woodcutter', 'herder', 'builder', 'miner'];
const JOB_NAMES = { farmer: 'Farmer', woodcutter: 'Woodcutter', herder: 'Herder', builder: 'Builder', miner: 'Stonecutter' };
const WORK_START = 7;
const WORK_END = 18;
const AROUND = 22; // tiles: how far the people go to find trees and rocks
const MAX_ANIMALS = 6; // per kind and per pen

// ---------- What is around a village ----------

function centerOf(village) {
  return { x: village.x + village.w / 2, y: village.y + village.h / 2 };
}

// The trees (or the rocks) around a village, the closest first: [{ x, y }].
function resourcesAround(village, tiles) {
  const center = centerOf(village);
  const found = [];
  for (let y = village.y - AROUND; y < village.y + village.h + AROUND; y++) {
    for (let x = village.x - AROUND; x < village.x + village.w + AROUND; x++) {
      if (tiles.includes(tileAt(x, y)) && zoneAt(x, y).kind === 'land') found.push({ x: x, y: y, far: Math.hypot(x - center.x, y - center.y) });
    }
  }
  return found.sort((a, b) => a.far - b.far);
}

const AROUND_CACHE = {};

function treesOf(village) {
  AROUND_CACHE[village.id + 'trees'] = AROUND_CACHE[village.id + 'trees'] || resourcesAround(village, [TILE.TREE, TILE.DEAD_TREE]);
  return AROUND_CACHE[village.id + 'trees'];
}

function rocksOf(village) {
  AROUND_CACHE[village.id + 'rocks'] = AROUND_CACHE[village.id + 'rocks'] || resourcesAround(village, [TILE.ROCK, TILE.CLIFF]);
  return AROUND_CACHE[village.id + 'rocks'];
}

// From 0 (nothing around) to 1 (plenty): how fast wood and stone are gathered.
function richness(village) {
  return { wood: Math.min(1, treesOf(village).length / 250), stone: Math.min(1, 0.15 + rocksOf(village).length / 120) };
}

// ---------- The start ----------

function levelForAge(days) {
  if (days >= 200) return 2;
  if (days >= 40) return 1;
  return 0;
}

export function firstVillages() {
  const villages = {};
  for (const village of VILLAGES) {
    const pen = PENS.find((item) => item.village === village.id);
    villages[village.id] = {
      wood: Math.min(30, Math.round(village.founded / 2)),
      stone: Math.min(30, Math.round(village.founded / 4)),
      food: 30,
      level: levelForAge(village.founded),
      bridge: village.founded >= 60,
      animals: { ...(pen ? pen.animals : {}) },
    };
  }
  return villages;
}

// ---------- The walls and the bridges (the world changes with the villages) ----------

function isGate(village, x, y) {
  return gatesOf(village).some((gate) => {
    const tiles = gate.dx === 0 ? [[gate.x, gate.y], [gate.x + 1, gate.y]] : [[gate.x, gate.y], [gate.x, gate.y + 1]];
    return tiles.some(([gx, gy]) => gx === x && gy === y);
  });
}

// The pieces of wall of a village (none at level 0): [{ kind: 'palisade' | 'wall', x, y, w, h, side }].
function wallOf(village, level) {
  const kind = VILLAGE_LEVELS[level].wall;
  if (!kind) return [];
  const pieces = [];
  const right = village.x + village.w - 1;
  const bottom = village.y + village.h - 1;
  for (let x = village.x; x <= right; x++) {
    for (const y of [village.y, bottom]) if (!isGate(village, x, y)) pieces.push({ kind: kind, x: x, y: y, w: 1, h: 1, side: 'row' });
  }
  for (let y = village.y + 1; y < bottom; y++) {
    for (const x of [village.x, right]) if (!isGate(village, x, y)) pieces.push({ kind: kind, x: x, y: y, w: 1, h: 1, side: 'column' });
  }
  // the torches of the gates
  for (const gate of gatesOf(village)) {
    const inX = gate.x - gate.dx;
    const inY = gate.y - gate.dy;
    const torches = gate.dx === 0 ? [[inX - 1, inY], [inX + 2, inY]] : [[inX, inY - 1], [inX, inY + 2]];
    torches.forEach(([tx, ty]) => {
      if (!isSolid(tx + 0.5, ty + 0.5)) pieces.push({ kind: 'torch', x: tx, y: ty, w: 1, h: 1 });
    });
  }
  return pieces;
}

export function villageWalls(game) {
  return VILLAGES.flatMap((village) => wallOf(village, game.villages[village.id].level));
}

// The best place for a bridge near a village: the shortest crossing of a river (2 to 7 tiles), close to it.
const BRIDGE_SITES = {};

function bridgeSiteOf(village) {
  if (BRIDGE_SITES[village.id] !== undefined) return BRIDGE_SITES[village.id];
  const center = centerOf(village);
  let best = null;
  for (let y = village.y - AROUND; y < village.y + village.h + AROUND; y++) {
    for (let x = village.x - AROUND; x < village.x + village.w + AROUND; x++) {
      if (tileAt(x, y) === TILE.WATER || isSolid(x + 0.5, y + 0.5)) continue;
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        let length = 1;
        while (length < 8 && tileAt(x + dx * length, y + dy * length) === TILE.WATER) length++;
        const endX = x + dx * length;
        const endY = y + dy * length;
        const isCrossing = length >= 3 && length <= 8 && !isSolid(endX + 0.5, endY + 0.5);
        const far = Math.hypot(x - center.x, y - center.y);
        if (isCrossing && (!best || far < best.far)) best = { far: far, tiles: Array.from({ length: length - 1 }, (_, i) => ({ x: x + dx * (i + 1), y: y + dy * (i + 1), tile: TILE.BRIDGE })) };
      }
    }
  }
  BRIDGE_SITES[village.id] = best ? best.tiles : null;
  return BRIDGE_SITES[village.id];
}

export function villageBridges(game) {
  return VILLAGES.filter((village) => game.villages[village.id].bridge && bridgeSiteOf(village)).flatMap((village) => bridgeSiteOf(village));
}

// ---------- Every day ----------

function workersOf(game, villageId, job) {
  return game.run.villagers.filter((villager) => villager.village === villageId && villager.job === job).length;
}

function hasEnough(state, needs) {
  return Object.entries(needs).every(([resource, amount]) => state[resource] >= amount);
}

function pay(state, needs) {
  Object.entries(needs).forEach(([resource, amount]) => (state[resource] -= amount));
}

// The animals of a pen have babies when there is food, and the people eat some of them when food is short.
function breedAndHunt(state) {
  const animals = state.animals;
  for (const kind of ['pig', 'cow', 'chicken']) {
    if (animals[kind] >= 2 && state.food > 15 && animals[kind] < MAX_ANIMALS && Math.random() < 0.5) {
      animals[kind] += 1;
      state.food -= 3;
    }
  }
  if (state.food < 10) {
    const kind = ['pig', 'chicken', 'cow'].find((item) => animals[item] > 1);
    if (kind) {
      animals[kind] -= 1;
      state.food += kind === 'cow' ? 25 : kind === 'pig' ? 15 : 6;
    }
  }
  if (state.level >= 1 && (animals.horse || 0) < 2 && Math.random() < 0.2) animals.horse = (animals.horse || 0) + 1;
}

// A village builds what it can afford: the next level of walls, then a bridge.
function build(game, village, state) {
  const next = VILLAGE_LEVELS[state.level + 1];
  if (next && hasEnough(state, next.needs)) {
    pay(state, next.needs);
    state.level += 1;
    notify(game, '🏗️ ' + village.name + ' built ' + (next.wall === 'wall' ? 'a wall of stone' : 'a palisade of wood') + '!', '#ffd86b');
    return true;
  }
  if (!state.bridge && bridgeSiteOf(village) && hasEnough(state, BRIDGE_NEEDS)) {
    pay(state, BRIDGE_NEEDS);
    state.bridge = true;
    notify(game, '🌉 ' + village.name + ' built a bridge over the river!', '#ffd86b');
    return true;
  }
  return false;
}

// Called every new day. Returns true if something was built (the map must be refreshed).
export function growVillages(game) {
  let hasBuilt = false;
  for (const village of VILLAGES) {
    const state = game.villages[village.id];
    const rich = richness(village);
    state.wood += Math.round((1 + workersOf(game, village.id, 'woodcutter')) * rich.wood * 10);
    state.stone += Math.round((workersOf(game, village.id, 'miner') + 0.5) * rich.stone * 8);
    state.food += 4 + workersOf(game, village.id, 'farmer') * 6 + workersOf(game, village.id, 'herder') * 3 - 5;
    breedAndHunt(state);
    if (build(game, village, state)) hasBuilt = true;
  }
  return hasBuilt;
}

// What a villager says about their village: its resources and what it builds next.
export function villageNews(game, villageId) {
  const village = VILLAGES.find((item) => item.id === villageId);
  const state = game.villages[villageId];
  const next = VILLAGE_LEVELS[state.level + 1];
  const plan = next ? 'Next, ' + (next.wall === 'wall' ? 'a wall of stone' : 'a palisade') + ': we need ' + Object.entries(next.needs).map(([resource, amount]) => amount + ' ' + resource).join(' and ') + '.' : state.bridge ? 'We have everything a village needs.' : 'Next, a bridge.';
  return village.name + ' is ' + VILLAGE_LEVELS[state.level].name + '. Wood ' + state.wood + ', stone ' + state.stone + ', food ' + state.food + '. ' + plan;
}

// ---------- The villagers: they walk to their work and come back ----------

const SKINS = ['#f3d2b3', '#e9b98f', '#c99872', '#fde0c8', '#b9825a'];
const HAIRS = ['#5a3a1e', '#2b2b3a', '#c98a3b', '#7a2f2f', '#d9d9d9'];
const CLOTHES = ['#6b8a3a', '#8a5a3a', '#5a6b8a', '#8a3a5a', '#7a7a5a'];

function lookOf(index) {
  return { skin: SKINS[index % 5], hair: HAIRS[(index * 3) % 5], style: ['short', 'bun', 'pony', 'short', 'long'][index % 5], eyes: '#3b3b3b', outfit: CLOTHES[(index * 2) % 5], trim: '#e9d8a6' };
}

// How many people work in a village: few (2 + its level).
function villagerCount(state) {
  return 2 + state.level;
}

function homeOf(village) {
  const plaza = PLAZAS.find((item) => zoneAt(item.x, item.y).id === village.id);
  return plaza ? { x: plaza.x + plaza.w / 2, y: plaza.y + plaza.h / 2 } : centerOf(village);
}

export function placeVillagers(game) {
  game.run.villagers = [];
  VILLAGES.forEach((village, v) => {
    const home = homeOf(village);
    const count = villagerCount(game.villages[village.id]);
    for (let i = 0; i < count; i++) {
      const job = JOBS[i % JOBS.length];
      const angle = (i / count) * Math.PI * 2; // around the square, not on top of each other
      const spot = { x: home.x + Math.cos(angle) * 2.2, y: home.y + Math.sin(angle) * 1.6 };
      const free = isSolid(spot.x, spot.y) ? home : spot;
      game.run.villagers.push({ id: village.id + '-' + i, village: village.id, job: job, name: JOB_NAMES[job], look: lookOf(v * 7 + i), x: free.x, y: free.y, home: free, dir: 'down', step: 0, walking: false, path: null, task: 'home', wait: Math.random() * 20 });
    }
  });
}

// Where a villager works: [x, y] of a tile (a field, a tree, a rock, a pen, a wall).
function workSpotOf(villager) {
  const village = VILLAGES.find((item) => item.id === villager.village);
  if (villager.job === 'woodcutter') return pickRandom(treesOf(village).slice(0, 12)) || villager.home;
  if (villager.job === 'miner') return pickRandom(rocksOf(village).slice(0, 12)) || villager.home;
  if (villager.job === 'farmer') {
    const field = FIELDS.find((item) => item.village === village.id);
    return field ? { x: field.x + Math.floor(Math.random() * field.w), y: field.y + field.h } : villager.home;
  }
  if (villager.job === 'herder') {
    const pen = PENS.find((item) => item.village === village.id);
    return pen ? { x: pen.x + pen.w + 1, y: pen.y + 1 } : villager.home;
  }
  return { x: village.x + 2 + Math.floor(Math.random() * (village.w - 4)), y: Math.random() < 0.5 ? village.y + 1 : village.y + village.h - 2 };
}

function goTo(villager, spot) {
  villager.path = findPath(villager.x, villager.y, spot.x, spot.y, 4000);
}

// The day of a villager: work from 7 to 18, home at night (they are inside then: not drawn).
function updateVillager(game, villager, dt) {
  const isWorkTime = !isNight(game) && game.hour >= WORK_START && game.hour < WORK_END;
  villager.wait -= dt;
  if (villager.task === 'home' && isWorkTime && villager.wait <= 0) {
    villager.task = 'toWork';
    goTo(villager, workSpotOf(villager));
  } else if (villager.task === 'work' && !isWorkTime) {
    villager.task = 'toHome';
    goTo(villager, villager.home);
  } else if (villager.task === 'work' && villager.wait <= 0) {
    villager.task = 'toWork'; // a new tree, a new rock...
    goTo(villager, workSpotOf(villager));
  }
  if (villager.task === 'toWork' || villager.task === 'toHome') {
    const arrived = followPath(villager, 1.6, dt);
    if (arrived) {
      villager.task = villager.task === 'toWork' ? 'work' : 'home';
      villager.wait = 15 + Math.random() * 25;
      villager.working = villager.task === 'work';
    }
  }
}

export function updateVillagers(game, dt) {
  game.run.villagers.forEach((villager) => updateVillager(game, villager, dt));
}

// The villagers that can be seen (not at home at night).
export function visibleVillagers(game) {
  return game.run.villagers.filter((villager) => !(villager.task === 'home' && isNight(game)) && !villager.ko);
}

// ---------- The animals of the pens ----------

export function placeAnimals(game) {
  game.run.animals = [];
  for (const pen of PENS) {
    const animals = game.villages[pen.village].animals;
    for (const kind of ['cow', 'pig', 'horse', 'chicken']) {
      for (let i = 0; i < Math.min(animals[kind] || 0, MAX_ANIMALS); i++) {
        game.run.animals.push({ kind: kind, pen: pen, x: pen.x + 0.5 + Math.random() * (pen.w - 1), y: pen.y + 0.5 + Math.random() * (pen.h - 1), walkX: 0, walkY: 0, walkTime: 0, step: Math.random() * 4, dir: 'right' });
      }
    }
  }
}

const ANIMAL_SPEED = { pig: 0.6, cow: 0.4, chicken: 0.9, horse: 0.8 };

export function updateAnimals(game, dt) {
  for (const animal of game.run.animals) {
    animal.walkTime -= dt;
    if (animal.walkTime <= 0) {
      const angle = Math.random() * Math.PI * 2;
      const isResting = Math.random() < 0.5;
      animal.walkX = isResting ? 0 : Math.cos(angle);
      animal.walkY = isResting ? 0 : Math.sin(angle);
      animal.walkTime = 1 + Math.random() * 3;
    }
    const pen = animal.pen;
    const x = animal.x + animal.walkX * ANIMAL_SPEED[animal.kind] * dt;
    const y = animal.y + animal.walkY * ANIMAL_SPEED[animal.kind] * dt;
    if (x > pen.x + 0.3 && x < pen.x + pen.w - 0.3) animal.x = x;
    if (y > pen.y + 0.3 && y < pen.y + pen.h - 0.3) animal.y = y;
    if (animal.walkX !== 0) animal.dir = animal.walkX < 0 ? 'left' : 'right';
    if (animal.walkX !== 0 || animal.walkY !== 0) animal.step += dt * 5;
  }
}

// The villager close to the hero (to talk with), or null.
export function villagerNear(game) {
  return visibleVillagers(game).find((villager) => Math.hypot(villager.x - game.player.x, villager.y - game.player.y) < 1.4) || null;
}
