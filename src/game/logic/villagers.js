import { VILLAGES, villageOf } from '../data/zones';
import { MEN_NAMES, WOMEN_NAMES, KID_NAMES, SKINS, HAIRS, CLOTHES, JOB_ORDER, JOB_NAMES } from '../data/villagers';
import { KINGDOMS } from '../data/kingdoms';
import { raceMixForVillage, applyRaceToLook } from '../data/races';
import { zoneAt } from '../data/zones';

import { bestGateOf, findPath, followPath } from '../world/paths';
import { isSolid, tileAt } from '../world/map';
import { TILE } from '../world/tileKinds';
import { randomOf, pickWith } from '../world/seeded';
import { pickRandom } from '../../logic/random';
import { isNight } from './clock';
import { ensureUrgentQuests } from './quests';
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
const EVENING_END = 21; // after work, many stay on the square until then: they talk, the kids play
const EVENING_CHANCE = 0.6;
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
  const biome = zoneAt(village.x + village.w / 2, village.y + village.h / 2)?.biome;
  const mix = raceMixForVillage(village, biome);
  const race = pickWith(random, mix);
  const look = applyRaceToLook({ ...lookOf(random, sex, role.kid), sex }, race);
  if (role.job === 'knight') Object.assign(look, KNIGHT_LOOK, { trim: kingdomColor(village), scarf: true });
  if (role.job === 'foreman') Object.assign(look, { burly: true, beard: true, outfit: '#6b4a2a' });
  const names = role.kid ? KID_NAMES : sex === 'man' ? MEN_NAMES : WOMEN_NAMES;
  const maxHp = role.job === 'knight' ? 60 : role.kid ? 10 : role.job === 'foreman' ? 40 : 25;
  return {
    id: village.id + '-' + index,
    village: village.id,
    race: race,
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
  const smithHouse = (plan.houses || []).find((h) => h.role === 'forge' || h.role === 'smithy' || h.role === 'armory');
  const bakerHouse = (plan.houses || []).find((h) => h.role === 'bakery');
  const shoreSpot = () => {
    for (let r = 4; r <= 34; r += 4) {
      for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r]]) {
        const sx = plan.center.x + dx;
        const sy = plan.center.y + dy;
        if (tileAt(sx, sy) === TILE.WATER && !isSolid(sx - Math.sign(dx), sy - Math.sign(dy))) {
          return { x: sx - Math.sign(dx), y: sy - Math.sign(dy) };
        }
      }
    }
    return randomTileIn(plan.square || village);
  };
  const spots = {
    farmer: () => (field ? { x: field.x + Math.floor(Math.random() * field.w), y: field.y + field.h } : plan.center),
    woodcutter: () => pickRandom(treesOf(village).slice(0, 16)) || plan.center,
    stonecutter: () => pickRandom(rocksOf(village).slice(0, 16)) || plan.center,
    herder: () => (pen ? { x: pen.x + pen.w + 1, y: pen.y + 1 } : plan.center),
    builder: () => pickRandom(wallTilesOf(village).filter((_, i) => i % 7 === 0)) || plan.center,
    merchant: () => randomTileIn(plan.square || village),
    smith: () => (smithHouse ? { x: smithHouse.x + Math.floor(smithHouse.w / 2), y: smithHouse.y + smithHouse.h + 1 } : randomTileIn(plan.square || village)),
    baker: () => (bakerHouse ? { x: bakerHouse.x + Math.floor(bakerHouse.w / 2), y: bakerHouse.y + bakerHouse.h + 1 } : randomTileIn(plan.square || village)),
    fisher: shoreSpot,
    knight: () => {
      const gate = pickRandom(plan.gates);
      return {
        x: gate.dx === 0 ? gate.x + 1.5 : gate.x - gate.dx * 2.5,
        y: gate.dy === 0 ? gate.y + 1.5 : gate.y - gate.dy * 2.5,
      };
    },
    foreman: () => (field && Math.random() < 0.5 ? { x: field.x - 1, y: field.y + 1 } : randomTileIn(plan.square || village)),
    kid: () => randomTileIn(plan.square || village),
  };
  return (spots[villager.job] || spots.merchant)();
}

// Plans the way of a villager to a spot (a real way around the walls: see world/paths.js). Out of a walled
// village, it goes by the best open gate. false: no way there (the villager must choose another place).
function goTo(villager, spot) {
  villager.hidden = false; // (hidden at home during a siege: see war/conquest.js) out again
  villager.dest = { x: spot.x, y: spot.y }; // kept, to find the way again if someone moves the villager
  villager.path = findPath(villager.x, villager.y, spot.x, spot.y, 14000);
  if (villager.path) return true;
  const village = villageOf(villager.village);
  const gate = bestGateOf(village, spot);
  if (gate) {
    const toGate = findPath(villager.x, villager.y, gate.outside.x, gate.outside.y, 9000);
    const fromGate = toGate && findPath(gate.outside.x, gate.outside.y, spot.x, spot.y, 9000);
    if (toGate && fromGate) {
      villager.path = [...toGate, ...fromGate.slice(1)];
      return true;
    }
  }
  return false;
}

// Goes to work: a few spots are tried (a tree behind a river may have no way); none: back home.
function goToWork(villager) {
  for (let tries = 0; tries < 3; tries++) {
    if (goTo(villager, workSpotOf(villager))) {
      villager.task = 'toWork';
      return;
    }
  }
  goHome(villager);
}

// Goes home. No way home (rare): the villager is home at once (inside, not on the map).
function goHome(villager) {
  villager.task = 'toHome';
  if (goTo(villager, villager.home)) return;
  villager.x = villager.home.x;
  villager.y = villager.home.y;
  villager.path = null;
}

function isWorkTime(game) {
  return !isNight(game) && game.hour >= WORK_START && game.hour < WORK_END;
}

function isEvening(game) {
  return game.hour >= WORK_END && game.hour < EVENING_END;
}

// The work is over: home... or first the square, to see the others (the evening of the village).
function endOfWork(game, villager) {
  const village = villageOf(villager.village);
  const goesOut = isEvening(game) && village.plan.square && Math.random() < EVENING_CHANCE;
  if (goesOut && goTo(villager, randomTileIn(village.plan.square))) villager.task = 'toSquare';
  else goHome(villager);
}

// The day of a villager: work from 7 to 18, the square in the evening, home at night.
// "home" = inside the house: the villager walks to the door, goes in (not drawn), and comes out later.
// Nobody stands planted in front of a door. A knight keeps guarding at night. Under attack: logic/defense.js.
function updateVillager(game, villager, dt) {
  if (villager.ko || villager.dead || villager.fighting) return;
  if (villager.talkUntil > Date.now()) {
    villager.walking = false; // a chat with a neighbour (see logic/villagerLife.js)
    return;
  }
  if (villager.lifeUntil > Date.now()) {
    if (villager.drunk > 0) villager.drunk = Math.max(0, villager.drunk - dt / 60);
    if (villager.angry > 0) villager.angry = Math.max(0, villager.angry - dt);
    return; // a moment of life (school, lunch, the well...: see life/peopleLife.js) moves the villager now
  }
  if (villager.lifeTarget) endLifeMoment(villager);
  const isOnDuty = villager.knight || isWorkTime(game);
  villager.wait -= dt;
  if (villager.task === 'home' && isOnDuty && villager.wait <= 0) {
    goToWork(villager);
  } else if (villager.task === 'work' && !isOnDuty) {
    endOfWork(game, villager);
  } else if (villager.task === 'evening' && (villager.wait <= 0 || !isEvening(game))) {
    goHome(villager);
  } else if (villager.task === 'work' && villager.wait <= 0) {
    goToWork(villager); // a new tree, a new rock, another gate...
  }
  if (['toWork', 'toSquare', 'toHome'].includes(villager.task)) {
    if (wasMovedAway(villager)) findTheWayAgain(villager);
    const baseSpeed = villager.kid ? 1.8 : villager.drunk > 0 ? 0.9 : villager.crier ? 2.15 : 1.4;
    if (followPath(villager, baseSpeed, dt)) arrive(villager);
  }
  // Town Criers proclaim urgent quests & dangers through streets and squares
  if (!villager.kid && (villager.id.endsWith('-1') || villager.id.endsWith('-3'))) {
    const raidSoon = !game.bosses?.king && game.raid && game.raid.nextDay <= game.day;
    const underSiege = Boolean(game.war?.warbands?.some((b) => b.targetId === villager.village && (b.state === 'sieging' || b.state === 'marching')));
    const uqList = ensureUrgentQuests(game);
    const uq = uqList.length > 0 ? uqList[villager.id.endsWith('-3') ? uqList.length - 1 : 0] : null;
    villager.crier = Boolean(raidSoon || underSiege || (!isNight(game) && uq));
    villager.urgentQuestId = uq ? uq.id : null;
    villager.urgentShout = underSiege
      ? 'URGENT! Attackers approaching the gates!'
      : raidSoon
        ? 'URGENT! Monster raid expected tonight—rally at the square!'
        : !isNight(game) && uq
          ? uq.shout
          : null;
  }
  if (villager.drunk > 0) villager.drunk = Math.max(0, villager.drunk - dt / 60);
  if (villager.angry > 0) villager.angry = Math.max(0, villager.angry - dt);
}

// A moment of life is over: out of the building, back to the day. The villager goes on with the day for a while
// before the next moment of life (else the two would pull the villager one way, then the other, forever).
function endLifeMoment(villager) {
  villager.lifeTarget = null;
  villager.inside = false;
  villager.lifeRestUntil = Date.now() + (20 + Math.random() * 25) * 1000;
  if (villager.task === 'home' || villager.task === 'work' || villager.task === 'evening') villager.wait = Math.min(villager.wait, 2);
}

// Someone else moved the villager (a moment of life, a guard, the hero pushing by): the way is far.
function wasMovedAway(villager) {
  return Boolean(villager.path && villager.path.length > 0 && Math.hypot(villager.path[0].x - villager.x, villager.path[0].y - villager.y) > 1.5);
}

// The way again, from here (never a straight line through the walls). No way: back home.
function findTheWayAgain(villager) {
  if (villager.dest && goTo(villager, villager.dest)) return;
  goHome(villager);
}

// The end of the way: at work, on the square, or home (inside).
function arrive(villager) {
  villager.task = { toWork: 'work', toSquare: 'evening', toHome: 'home' }[villager.task];
  villager.wait = villager.task === 'evening' ? 60 + Math.random() * 60 : villager.task === 'home' ? 20 + Math.random() * 40 : 12 + Math.random() * 25;
  villager.working = villager.task === 'work';
  villager.walking = false;
  villager.path = null;
}

export function updateVillagers(game, dt) {
  game.run.villagers.forEach((villager) => updateVillager(game, villager, dt));
}

// The villagers that can be seen: not the ones at home (they are inside their house, day or night), nor the ones
// inside a building for a moment of life (the school, the inn, the church: see life/peopleLife.js).
export function visibleVillagers(game) {
  return game.run.villagers.filter((villager) => !villager.dead && !villager.ko && !villager.inside && !(villager.task === 'home' && !villager.walking) && !(villager.hidden && !villager.walking));
}

// The villager close to the hero (to talk with), or null.
export function villagerNear(game, range = 1.4) {
  return visibleVillagers(game).find((villager) => Math.hypot(villager.x - game.player.x, villager.y - game.player.y) < range) || null;
}

