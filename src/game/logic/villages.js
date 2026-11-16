import { VILLAGES, BRIDGE_NEEDS, villageOf, zoneAt } from '../data/zones';
import { VILLAGE_KINDS } from '../data/placeNames';
import { KINGDOMS } from '../data/kingdoms';
import { TILE, tileAt, isSolid } from '../world/map';
import { randomOf } from '../world/seeded';
import { firstWalls, fullHp, buildOneSection, describeWalls } from './walls';
import { notify } from './messages';

// The villages live, even far from the hero: every day their people farm, cut wood, break stones,
// breed animals, have children, and build (their walls, section by section, then a bridge).
// What they gather depends on what grows around them: a village in a forest gets wood fast.
// game.villages[id]: {
//   wood, stone, food, wheat           what they have
//   adults, kids, knights              how many people live there (the ones on screen: logic/villagers.js)
//   walls, wallHp, turrets             their walls (see logic/walls.js)
//   bridge                             the bridge over the river near them
//   animals: { pig, cow, chicken, horse }
//   owner: 'people' | 'monsters'       a village taken by the monsters (see logic/war.js)
//   mood                               what they think of the hero, from 0 (hate) to 100 (love)
//   feast                              the day of their next feast (see logic/feasts.js)
//   decor                              the decorations the hero paid for }

const POPULATION = {
  capital: { adults: 60, kids: 24, knights: 10 },
  town: { adults: 30, kids: 12, knights: 4 },
  village: { adults: 16, kids: 7, knights: 1 },
  hamlet: { adults: 7, kids: 3, knights: 0 },
  farm: { adults: 14, kids: 6, knights: 0 },
};
// The part of the adults doing each job (the others: builders, merchants...). A farming village farms.
const JOBS = {
  farm: { farmer: 0.6, woodcutter: 0.1, stonecutter: 0.05, herder: 0.15 },
  other: { farmer: 0.3, woodcutter: 0.2, stonecutter: 0.12, herder: 0.1 },
};
const AROUND = 24; // tiles: how far the people go to find trees and rocks
const MAX_ANIMALS = 8; // per kind
const MAX_ADULTS = { capital: 90, town: 45, village: 26, hamlet: 12, farm: 22 };

// ---------- The start ----------

function animalsOf(village) {
  const animals = { pig: 0, cow: 0, chicken: 0, horse: 0 };
  for (const pen of village.plan.pens) for (const kind of Object.keys(animals)) animals[kind] += pen.animals[kind] || 0;
  if (village.plan.houses.some((house) => house.role === 'stable')) animals.horse += 2;
  return animals;
}

export function firstVillageState(village) {
  const random = randomOf(village.id + ':state');
  const people = POPULATION[village.kind];
  const walls = firstWalls(village, random);
  return {
    wood: Math.min(40, Math.round(village.founded / 4)),
    stone: Math.min(40, Math.round(village.founded / 8)),
    food: 40,
    wheat: 0,
    adults: people.adults,
    kids: people.kids,
    knights: people.knights,
    walls: walls,
    wallHp: fullHp(walls),
    turrets: [],
    bridge: village.founded >= 60,
    animals: animalsOf(village),
    owner: 'people',
    mood: 50,
    feast: 3 + Math.floor(random() * 12),
    decor: 0,
  };
}

export function firstVillages() {
  const villages = {};
  for (const village of VILLAGES) villages[village.id] = firstVillageState(village);
  return villages;
}

// Backfills new villages and newly added state fields when loading older saves.
export function ensureVillages(game) {
  if (!game.villages || typeof game.villages !== 'object') game.villages = {};
  for (const village of VILLAGES) {
    const base = firstVillageState(village);
    const state = game.villages[village.id];
    if (!state || typeof state !== 'object') {
      game.villages[village.id] = base;
      continue;
    }
    for (const key of Object.keys(base)) {
      if (state[key] === undefined) state[key] = base[key];
    }
    if (typeof state.walls !== 'string' || state.walls.length !== base.walls.length || !Array.isArray(state.wallHp) || state.wallHp.length !== base.wallHp.length) {
      state.walls = base.walls;
      state.wallHp = [...base.wallHp];
    }
    if (!Array.isArray(state.turrets)) state.turrets = [];
    if (!state.animals || typeof state.animals !== 'object') state.animals = base.animals;
  }
}

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

export function treesOf(village) {
  AROUND_CACHE[village.id + 'trees'] = AROUND_CACHE[village.id + 'trees'] || resourcesAround(village, [TILE.TREE, TILE.DEAD_TREE]);
  return AROUND_CACHE[village.id + 'trees'];
}

export function rocksOf(village) {
  AROUND_CACHE[village.id + 'rocks'] = AROUND_CACHE[village.id + 'rocks'] || resourcesAround(village, [TILE.ROCK, TILE.CLIFF]);
  return AROUND_CACHE[village.id + 'rocks'];
}

// From 0 (nothing around) to 1 (plenty): how fast wood and stone are gathered.
function richness(village) {
  return { wood: Math.min(1, 0.1 + treesOf(village).length / 120), stone: Math.min(1, 0.15 + rocksOf(village).length / 60) };
}

// ---------- The bridge near a village ----------

// The best place for a bridge near a village: the shortest crossing of a river (3 to 30 tiles), close to it.
const BRIDGE_SITES = {};

function crossingFrom(x, y, dx, dy) {
  let length = 1;
  while (length < 32 && tileAt(x + dx * length, y + dy * length) === TILE.WATER) length++;
  const isCrossing = length >= 4 && length <= 31 && !isSolid(x + dx * length + 0.5, y + dy * length + 0.5);
  return isCrossing ? length : null;
}

function bridgeSiteOf(village) {
  if (BRIDGE_SITES[village.id] !== undefined) return BRIDGE_SITES[village.id];
  const center = centerOf(village);
  let best = null;
  for (let y = village.y - AROUND; y < village.y + village.h + AROUND; y += 2) {
    for (let x = village.x - AROUND; x < village.x + village.w + AROUND; x += 2) {
      if (tileAt(x, y) === TILE.WATER || isSolid(x + 0.5, y + 0.5) || tileAt(x + 1, y) !== TILE.WATER && tileAt(x, y + 1) !== TILE.WATER) continue;
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        const length = crossingFrom(x, y, dx, dy);
        const far = Math.hypot(x - center.x, y - center.y) + (length || 0) * 2;
        if (length && (!best || far < best.far)) best = { far: far, x: x, y: y, dx: dx, dy: dy, length: length };
      }
    }
  }
  BRIDGE_SITES[village.id] = best ? Array.from({ length: (best.length - 1) * 2 }, (_, i) => ({ x: best.x + best.dx * (Math.floor(i / 2) + 1) + (i % 2) * best.dy, y: best.y + best.dy * (Math.floor(i / 2) + 1) + (i % 2) * best.dx, tile: TILE.BRIDGE })) : null;
  return BRIDGE_SITES[village.id];
}

export function villageBridges(game) {
  return VILLAGES.filter((village) => game.villages[village.id].bridge && bridgeSiteOf(village)).flatMap((village) => bridgeSiteOf(village));
}

// ---------- Every day ----------

function hasEnough(state, needs) {
  return Object.entries(needs).every(([resource, amount]) => state[resource] >= amount);
}

function pay(state, needs) {
  Object.entries(needs).forEach(([resource, amount]) => (state[resource] -= amount));
}

// The animals of the pens have babies when there is food, and the people eat some of them when food is short.
function breedAndHunt(state) {
  const animals = state.animals;
  for (const kind of ['pig', 'cow', 'chicken']) {
    if (animals[kind] >= 2 && state.food > 20 && animals[kind] < MAX_ANIMALS && Math.random() < 0.4) {
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
}

// Babies are born when the village eats well; the children grow up; hunger makes people leave.
function growPeople(village, state) {
  const fed = state.food > state.adults + state.kids;
  if (fed && Math.random() < 0.3 && state.adults < MAX_ADULTS[village.kind]) state.kids += 1;
  for (let i = 0; i < state.kids; i++) {
    if (Math.random() < 0.03) {
      state.kids -= 1;
      state.adults += 1;
    }
  }
  if (state.food <= 0 && state.adults > 2 && Math.random() < 0.3) state.adults -= 1;
}

// One day of work: food, wood and stone, following the jobs and what grows around.
function gather(village, state) {
  const jobs = village.kind === 'farm' ? JOBS.farm : JOBS.other;
  const rich = richness(village);
  const workers = (job) => Math.round(state.adults * jobs[job]);
  const fields = village.plan.fields.length;
  state.food += Math.round(workers('farmer') * 2 + fields * 1.5 + workers('herder') - (state.adults + state.kids) * 0.6);
  state.food = Math.max(0, state.food);
  state.wood += Math.round(workers('woodcutter') * 3 * rich.wood);
  state.stone += Math.round(workers('stonecutter') * 3 * rich.stone);
  if (village.kind === 'farm') state.wheat += fields * 2;
}

// The builders of a village work on its walls (one section a day, more in a big village), then on a bridge.
function build(game, village, state) {
  let hasBuilt = false;
  const builders = 1 + Math.floor(state.adults / 12);
  for (let i = 0; i < builders; i++) {
    const done = buildOneSection(state);
    if (!done) break;
    hasBuilt = true;
    if (done === 'stone' && Math.random() < 0.3) notify(game, '🏗️ ' + village.name + ' raises a new part of its wall in stone.', '#ffd86b');
  }
  if (!state.bridge && state.walls.indexOf('-') < 0 && bridgeSiteOf(village) && hasEnough(state, BRIDGE_NEEDS)) {
    pay(state, BRIDGE_NEEDS);
    state.bridge = true;
    notify(game, '🌉 ' + village.name + ' built a bridge over the river!', '#ffd86b');
    hasBuilt = true;
  }
  return hasBuilt;
}

// Called every new day. Returns true if something was built (the map must be refreshed).
export function growVillages(game) {
  let hasBuilt = false;
  for (const village of VILLAGES) {
    const state = game.villages[village.id];
    if (state.owner !== 'people') continue;
    gather(village, state);
    breedAndHunt(state);
    growPeople(village, state);
    if (build(game, village, state)) hasBuilt = true;
  }
  return hasBuilt;
}

// ---------- What the people say about their village ----------

export function kindName(village) {
  return VILLAGE_KINDS[village.kind] || 'Village';
}

export function kingdomName(village) {
  const kingdom = KINGDOMS.find((item) => item.id === village.kingdom);
  return kingdom ? kingdom.name : 'no kingdom';
}

export function villageNews(game, villageId) {
  const village = villageOf(villageId);
  const state = game.villages[villageId];
  const people = state.adults + state.kids;
  const war = village.rivals && village.rivals.length > 0 ? ' And we do not trust ' + village.rivals.map((id) => villageOf(id).name).join(' or ') + '.' : '';
  return village.name + ' (' + kindName(village).toLowerCase() + ' of the ' + kingdomName(village) + ') has ' + people + ' people and ' + describeWalls(state) + '. Wood ' + state.wood + ', stone ' + state.stone + ', food ' + state.food + '.' + war;
}
