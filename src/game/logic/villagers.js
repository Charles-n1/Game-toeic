import { VILLAGES, villageOf } from '../data/zones';
import { MEN_NAMES, WOMEN_NAMES, KID_NAMES, SKINS, HAIRS, CLOTHES, JOB_ORDER, JOB_NAMES } from '../data/villagers';
import { KINGDOMS } from '../data/kingdoms';

import { findPath, followPath } from '../world/paths';
import { randomOf, pickWith } from '../world/seeded';
import { pickRandom } from '../../logic/random';
import { isNight } from './clock';
import { treesOf, rocksOf } from './villages';
import { wallTilesOf } from './walls';

// The people of the villages, on screen. A village far from the hero lives only in numbers (logic/villages.js);
// when the hero comes close, its people appear: families (a man, a woman, their children) in their houses,
// at work in the day (fields, trees, rocks, pens, walls, the market), home at night. The knights guard the
// gates; a burly foreman watches the work. (Their fights: logic/defense.js. Their feasts: logic/feasts.js.)
// A villager: { id, village, name, sex, kid, job, look, x, y, home, dir, step, walking, path, task, wait,
//               hp, maxHp, knight, ko, dead, drunk, dancing, angry }

const AWAKE_RANGE = 220; // tiles: the villages this close to the hero are on screen
const ADULTS_SHOWN = { capital: 26, town: 16, village: 11, hamlet: 6, farm: 10 };
const KIDS_SHOWN = { capital: 6, town: 5, village: 4, hamlet: 2, farm: 3 };
const WORK_START = 7;
const WORK_END = 18;
const KNIGHT_LOOK = { outfit: '#9aa6b8', pants: '#5d6676', boots: '#3a3442', helmet: true, sword: true };

// ---------- Who lives there ----------

function lookOf(random, sex, isKid) {
  return {
    skin: pickWith(random, SKINS),
    hair: pickWith(random, HAIRS),
    style: sex === 'man' ? pickWith(random, ['short', 'short', 'spiky']) : pickWith(random, ['long', 'bun', 'pony', 'twin']),
    eyes: '#3b3b3b',
    outfit: pickWith(random, CLOTHES),
    trim: '#e9d8a6',
    skirt: sex === 'woman' && random() < 0.7,
    pants: sex === 'woman' ? '#e9d8a6' : '#4a3a2a',
    beard: sex === 'man' && !isKid && random() < 0.35,
    small: isKid,
  };
}

// The houses where the families of a village live (not the shops): their doors.
function homesOf(village) {
  const houses = village.plan.houses.filter((house) => ['house', 'farm', 'elder'].includes(house.role));
  return houses.map((house) => ({ x: house.x + Math.floor(house.w / 2) + 0.5, y: house.y + house.h + 0.5 }));
}

function kingdomColor(village) {
  const kingdom = KINGDOMS.find((item) => item.id === village.kingdom);
  return kingdom ? kingdom.color : '#d6302f';
}

function makeVillager(village, index, random, home, role) {
  const sex = role.sex;
  const look = lookOf(random, sex, role.kid);
  if (role.job === 'knight') Object.assign(look, KNIGHT_LOOK, { trim: kingdomColor(village), scarf: true });
  if (role.job === 'foreman') Object.assign(look, { burly: true, beard: true, outfit: '#6b4a2a' });
  const names = role.kid ? KID_NAMES : sex === 'man' ? MEN_NAMES : WOMEN_NAMES;
  const maxHp = role.job === 'knight' ? 60 : role.kid ? 10 : role.job === 'foreman' ? 40 : 25;
  return {
    id: village.id + '-' + index,
    village: village.id,
    name: pickWith(random, names),
    sex: sex,
    kid: Boolean(role.kid),
    job: role.job,
    jobName: JOB_NAMES[role.job],
    look: look,
    x: home.x,
    y: home.y,
    home: home,
    dir: 'down',
    step: 0,
    walking: false,
    path: null,
    task: 'home',
    wait: random() * 20,
    hp: maxHp,
    maxHp: maxHp,
    knight: role.job === 'knight',
    ko: false,
    dead: false,
    drunk: 0,
    dancing: false,
    angry: 0,
  };
}

// The roles of the people shown: the knights, a foreman, then men and women by turns, then the children.
function rolesOf(village, state) {
  const roles = [];
  const jobs = village.kind === 'farm' ? JOB_ORDER.farm : JOB_ORDER.other;
  const adults = Math.min(state.adults, ADULTS_SHOWN[village.kind]);
  for (let i = 0; i < Math.min(state.knights, 4); i++) roles.push({ sex: 'man', job: 'knight' });
  if (village.kind !== 'hamlet' && state.adults >= 6) roles.push({ sex: 'man', job: 'foreman' });
  for (let i = roles.length; i < adults; i++) roles.push({ sex: i % 2 === 0 ? 'man' : 'woman', job: jobs[i % jobs.length] });
  for (let i = 0; i < Math.min(state.kids, KIDS_SHOWN[village.kind]); i++) roles.push({ sex: i % 2 === 0 ? 'man' : 'woman', job: 'kid', kid: true });
  return roles;
}

function villagersOf(game, village) {
  const random = randomOf(village.id + ':people');
  const homes = homesOf(village);
  const square = village.plan.center;
  return rolesOf(village, game.villages[village.id]).map((role, i) => {
    const family = Math.floor(i / 2) % Math.max(1, homes.length);
    const home = homes.length > 0 ? homes[family] : { x: square.x + 0.5, y: square.y + 0.5 };
    return makeVillager(village, i, random, home, role);
  });
}

// ---------- Which villages are on screen ----------

function distanceTo(village, x, y) {
  const dx = Math.max(village.x - x, 0, x - village.x - village.w);
  const dy = Math.max(village.y - y, 0, y - village.y - village.h);
  return Math.hypot(dx, dy);
}

// The villages close to the hero (and still lived in by people): their ids.
export function awakeVillageIds(game) {
  return VILLAGES.filter((village) => game.villages[village.id].owner === 'people' && distanceTo(village, game.player.x, game.player.y) < AWAKE_RANGE).map((village) => village.id);
}

// Called about once per second: the people of the villages that just came close appear, the others go.
export function wakeVillages(game) {
  const awake = awakeVillageIds(game);
  const before = game.run.awake || [];
  if (awake.join() === before.join() && game.run.villagers.length > 0) return;
  game.run.villagers = game.run.villagers.filter((villager) => awake.includes(villager.village));
  for (const id of awake.filter((item) => !before.includes(item) || !game.run.villagers.some((villager) => villager.village === item))) {
    game.run.villagers.push(...villagersOf(game, villageOf(id)));
  }
  game.run.awake = awake;
}

// Everybody goes home (a new day, a loaded game): the villagers are made again.
export function placeVillagers(game) {
  game.run.villagers = [];
  game.run.awake = [];
  wakeVillages(game);
}

// ---------- Their day ----------

function randomTileIn(rect, random = Math.random) {
  return { x: rect.x + Math.floor(random() * rect.w), y: rect.y + Math.floor(random() * rect.h) };
}

// Where a villager works: a tile (a field, a tree, a rock, a pen, a wall, the market).
function workSpotOf(villager) {
  const village = villageOf(villager.village);
  const plan = village.plan;
  const field = pickRandom(plan.fields.length > 0 ? plan.fields : [null]);
  const pen = pickRandom(plan.pens.length > 0 ? plan.pens : [null]);
  const spots = {
    farmer: () => (field ? { x: field.x + Math.floor(Math.random() * field.w), y: field.y + field.h } : plan.center),
    woodcutter: () => pickRandom(treesOf(village).slice(0, 16)) || plan.center,
    stonecutter: () => pickRandom(rocksOf(village).slice(0, 16)) || plan.center,
    herder: () => (pen ? { x: pen.x + pen.w + 1, y: pen.y + 1 } : plan.center),
    builder: () => pickRandom(wallTilesOf(village).filter((_, i) => i % 7 === 0)) || plan.center,
    merchant: () => randomTileIn(plan.square || village),
    knight: () => {
      const gate = pickRandom(plan.gates);
      return { x: gate.x - gate.dx * 2 + (gate.dx === 0 ? 1 : 0), y: gate.y - gate.dy * 2 + (gate.dy === 0 ? 1 : 0) };
    },
    foreman: () => (field && Math.random() < 0.5 ? { x: field.x - 1, y: field.y + 1 } : randomTileIn(plan.square || village)),
    kid: () => randomTileIn(plan.square || village),
  };
  return spots[villager.job]();
}

function goTo(villager, spot) {
  villager.path = findPath(villager.x, villager.y, spot.x, spot.y, 5000);
}

function isWorkTime(game) {
  return !isNight(game) && game.hour >= WORK_START && game.hour < WORK_END;
}

// The day of a villager: work from 7 to 18, home at night (they are inside then: not drawn).
// A knight keeps guarding at night. A village under attack: see logic/defense.js.
function updateVillager(game, villager, dt) {
  if (villager.ko || villager.dead || villager.fighting) return;
  const isOnDuty = villager.knight || isWorkTime(game);
  villager.wait -= dt;
  if (villager.task === 'home' && isOnDuty && villager.wait <= 0) {
    villager.task = 'toWork';
    goTo(villager, workSpotOf(villager));
  } else if (villager.task === 'work' && !isOnDuty) {
    villager.task = 'toHome';
    goTo(villager, villager.home);
  } else if (villager.task === 'work' && villager.wait <= 0) {
    villager.task = 'toWork'; // a new tree, a new rock, another gate...
    goTo(villager, workSpotOf(villager));
  }
  if (villager.task === 'toWork' || villager.task === 'toHome') {
    const speed = villager.kid ? 1.8 : villager.drunk > 0 ? 0.9 : 1.4;
    if (followPath(villager, speed, dt)) {
      villager.task = villager.task === 'toWork' ? 'work' : 'home';
      villager.wait = 12 + Math.random() * 25;
      villager.working = villager.task === 'work';
    }
  }
  if (villager.drunk > 0) villager.drunk = Math.max(0, villager.drunk - dt / 60);
  if (villager.angry > 0) villager.angry = Math.max(0, villager.angry - dt);
}

export function updateVillagers(game, dt) {
  game.run.villagers.forEach((villager) => updateVillager(game, villager, dt));
}

// The villagers that can be seen (not at home at night).
export function visibleVillagers(game) {
  return game.run.villagers.filter((villager) => !villager.dead && !villager.ko && !(villager.task === 'home' && !villager.walking && (isNight(game) || villager.hidden)));
}

// The villager close to the hero (to talk with), or null.
export function villagerNear(game, range = 1.4) {
  return visibleVillagers(game).find((villager) => Math.hypot(villager.x - game.player.x, villager.y - game.player.y) < range) || null;
}

export function villageOfVillager(villager) {
  return villageOf(villager.village);
}


