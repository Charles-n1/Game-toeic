import { VILLAGES, villageOf, zoneAt } from '../../data/zones';
import { isSolid, tileAt, biomeAt } from '../../world/map';
import { TILE } from '../../world/tileKinds';
import { stepSmart, bestGateOf } from '../../world/paths';
import { distance } from '../../world/geometry';
import { isNight } from '../clock';
import { addItem, countItem, removeItem, earnLexis, gainXp, heal, restoreMana } from '../player';
import { addHappiness, addFriendship } from '../village';
import { say, notify } from '../messages';
import { cue } from '../cues';
import { makeDuel } from '../duels';
import { startFight } from '../fight';
import { makeMonster } from '../monsters';
import { addParticle } from '../particles';
import { monsterCategory } from '../learning';
import { demonLandSize } from '../war/demonLand';
import { ensureLife, ensureRunLife, recordGossip, recordAbsenceNote } from './state';
import { isOpenLand, spotOutOfSight, isInSight, mayGoAway } from './spots';

// The life of nature and of the roads (see life.txt): the rain and what it leaves, the animals of the wild,
// the finds of the forest, the travelers of the war, and the encounters on the roads.
// Everything appears out of sight of the hero and walks in (see life/spots.js).

const LOOKS = {
  refugee: { skin: '#d8a47f', hair: '#5a3a22', style: 'long', eyes: '#3a2416', outfit: '#6e6052', trim: '#c9b393' },
  messenger: { skin: '#fde0c8', hair: '#2a1d17', style: 'short', eyes: '#3a6fd8', outfit: '#2f50a0', trim: '#ffd23f', scarf: '#e8423f' },
  soldier: { skin: '#e8c49a', hair: '#3a3442', style: 'short', eyes: '#3a6fd8', outfit: '#5a667d', trim: '#d8e0ef' },
  wounded: { skin: '#f1c9a5', hair: '#4a3222', style: 'short', eyes: '#3a2416', outfit: '#7a7e8a', trim: '#ffffff' },
  orphan: { skin: '#fde0c8', hair: '#8a5a30', style: 'short', eyes: '#3a2416', outfit: '#6a5a4e', trim: '#a89a8e' },
  deserter: { skin: '#c99a72', hair: '#24202c', style: 'short', eyes: '#5a2222', outfit: '#44523a', trim: '#8a7a42' },
  pilgrim: { skin: '#f1c9a5', hair: '#d8dce6', style: 'long', eyes: '#3a6fd8', outfit: '#f4f6fc', trim: '#ffd23f' },
  circus: { skin: '#fde0c8', hair: '#c83e6e', style: 'long', eyes: '#3a6fd8', outfit: '#8a2be2', trim: '#ffd23f' },
  royalGuard: { skin: '#f1c9a5', hair: '#3a3442', style: 'short', eyes: '#3a6fd8', outfit: '#b8253f', trim: '#ffd23f' },
  drover: { skin: '#d8a47f', hair: '#6a4626', style: 'short', eyes: '#3a2416', outfit: '#7a5a32', trim: '#d9cbb0' },
  child: { skin: '#fde0c8', hair: '#b8763e', style: 'short', eyes: '#3a6fd8', outfit: '#5a9fd6', trim: '#fff3b0' },
  scout: { skin: '#d8a47f', hair: '#2d3b2d', style: 'short', eyes: '#3a6fd8', outfit: '#3b623c', trim: '#b8d88a' },
  traveler: { skin: '#fde0c8', hair: '#6a4228', style: 'long', eyes: '#3a2416', outfit: '#586c82', trim: '#ffd086' },
  warden: { skin: '#f1c9a5', hair: '#4a3222', style: 'short', eyes: '#3a6fd8', outfit: '#304468', trim: '#ffd23f' },
};

// The encounters of the roads: { name, look, moves (it walks along the road), night (only at night) }.
const ROAD_EVENTS = {
  cart: { name: 'Overturned Merchant Cart', look: LOOKS.drover },
  pilgrim: { name: 'White-Robed Pilgrim', look: LOOKS.pilgrim, moves: 1.15, night: true },
  duel: { name: 'Two Dueling Adventurers', look: LOOKS.soldier },
  circus: { name: 'Traveling Circus Troupe', look: LOOKS.circus, moves: 1.15 },
  lostChild: { name: 'Lost Village Child', look: LOOKS.child },
  royalCarriage: { name: 'Royal Capital Carriage', look: LOOKS.royalGuard, moves: 2.2 },
  drover: { name: 'Livestock Drover & Flock', look: LOOKS.drover, moves: 1.15 },
  roadBandit: { name: 'Highway Roadblock', look: LOOKS.deserter, night: true },
  rivalAdv: { name: 'Rival Adventurer', look: LOOKS.messenger },
  bridgeFix: { name: 'Road Bridge Crew', look: LOOKS.soldier },
  campfire: { name: 'Night Road Campfire', look: LOOKS.traveler, night: true, onlyNight: true },
  tollGate: { name: 'Kingdom Border Toll Gate', look: LOOKS.warden },
};

const FORGET_RANGE = 55; // tiles: the travelers and the encounters farther than this are forgotten

// ---------- The trees the hero plants, the milestones of the roads ----------

export function plantTreeSapling(game, kind = 'oak') {
  const life = ensureLife(game);
  const px = Math.floor(game.player.x) + 0.5;
  const py = Math.floor(game.player.y) + 0.5;
  if (!isOpenLand(px, py)) {
    notify(game, '🌱 Plant tree saplings on open grass or woods.', '#ffd086');
    return false;
  }
  life.plantedTrees.push({ id: 'tree-' + Date.now(), kind, x: px, y: py, plantedDay: game.day || 1, stage: 0 });
  life.stats.treesPlanted = (life.stats.treesPlanted || 0) + 1;
  cue(game, 'coin');
  notify(game, '🌱 Planted a young ' + kind + ' sapling! It will grow over the coming days.', '#7cfc9a');
  return true;
}

// The milestones near the hero: the closest villages, at the gate, with the distance to them.
export function computeNearbyMilestones(game) {
  const px = game.player.x;
  const py = game.player.y;
  return VILLAGES.slice(0, 12)
    .map((v) => {
      const gate = bestGateOf(v, game.player)?.outside || { x: v.x + v.w / 2, y: v.y + v.h + 2 };
      return { x: gate.x, y: gate.y, name: v.name, paces: Math.round(Math.hypot(gate.x - px, gate.y - py)) };
    })
    .filter((m) => m.paces < 36)
    .slice(0, 4);
}

// ---------- Each morning ----------

export function newDayNatureAndRoads(game) {
  const life = ensureLife(game);
  const day = game.day || 1;
  growPlantedTrees(game, life, day);
  finishBridgeRepairs(game, life, day);
  life.rainMushrooms = life.rainMushrooms.filter((m) => day <= (m.untilDay || day));
  life.brokenFences = life.brokenFences.filter((f) => !f.repaired);
  if (!life.whiteStag.rumoredDay && day >= 2) {
    life.whiteStag.rumoredDay = day;
    recordGossip(game, 'Hunters whisper of a gleaming White Stag seen in deep mist north of Eldermoor!', 'lexia');
  }
}

function growPlantedTrees(game, life, day) {
  for (const tree of life.plantedTrees) {
    const age = day - (tree.plantedDay || day);
    const stage = age >= 6 ? 3 : age >= 3 ? 2 : age >= 1 ? 1 : 0;
    if (stage <= (tree.stage || 0)) continue;
    tree.stage = stage;
    if (stage === 3) recordAbsenceNote(game, 'Your planted ' + tree.kind + ' sapling grew into a tall shaded tree.');
  }
}

function finishBridgeRepairs(game, life, day) {
  for (const bridge of life.brokenBridges) {
    if (day < bridge.doneDay) continue;
    bridge.repaired = true;
    recordAbsenceNote(game, 'Workers completed repairs on the timber road bridge near ' + (villageOf(bridge.villageId)?.name || 'the river') + '.');
  }
  life.brokenBridges = life.brokenBridges.filter((b) => !b.repaired);
}

// ---------- About once per second ----------

// Where the hero is and what the world is like there, for all the rules below.
function heroSurroundings(game) {
  const weather = game.weather?.kind || 'clear';
  return {
    now: Date.now(),
    day: game.day || 1,
    zone: zoneAt(game.player.x, game.player.y),
    biome: biomeAt(game.player.x, game.player.y),
    night: isNight(game),
    rain: weather === 'rain' || weather === 'storm',
    storm: weather === 'storm',
  };
}

export function slowNatureAndRoads(game) {
  const here = heroSurroundings(game);
  updateRainMarks(game, here);
  chasePrey(game);
  updateNightFoxes(game, here);
  updateFieldRabbits(game, here);
  updateGroundBirds(game, here);
  updateForestFinds(game, here);
  updateWaterLife(game, here);
  updateWhiteStag(game, here);
  updateForestTraps(game, here);
  updateWarTravelers(game, here);
  updateRoadEvents(game, here);
  finishHighwayFight(game);
  ensureRunLife(game).milestones = computeNearbyMilestones(game);
}

// The rain: puddles, flooded banks, then a rainbow, fallen branches and mushrooms; a storm breaks fences.
function updateRainMarks(game, here) {
  const life = ensureLife(game);
  const rl = ensureRunLife(game);
  rl.riverFlooded = here.storm || here.now < (life.puddlesUntil || 0);
  if (here.storm && here.zone.kind === 'village' && life.brokenFences.length < 3 && Math.random() < 0.08) {
    const spot = spotOutOfSight(game, 22, (x, y) => !isSolid(x, y) && zoneAt(x, y).id === here.zone.id);
    if (spot) life.brokenFences.push({ id: 'fnc-' + here.now, villageId: here.zone.id, x: spot.x, y: spot.y, repaired: false });
  }
  if (here.rain) {
    rl.wasRaining = true;
    life.puddlesUntil = Math.max(life.puddlesUntil || 0, here.now + 90000);
    return;
  }
  if (!rl.wasRaining) return;
  rl.wasRaining = false;
  life.rainbowUntil = here.now + 75000;
  life.puddlesUntil = here.now + 120000;
  notify(game, '🌈 Sunlight breaks through the clouds — a rainbow shimmers over the wet fields!', '#ffd86b');
  if (here.zone.kind === 'land' && life.fallenBranches.length < 4 && Math.random() < 0.65) {
    const spot = spotOutOfSight(game, 22);
    if (spot) life.fallenBranches.push({ id: 'br-' + here.now, x: spot.x, y: spot.y });
  }
  for (let m = 0; m < 2 && here.zone.kind !== 'inside' && life.rainMushrooms.length < 6; m++) {
    const spot = spotOutOfSight(game, 20);
    if (spot) life.rainMushrooms.push({ id: 'msh-' + here.now + '-' + m, x: spot.x, y: spot.y, untilDay: here.day + 2, kind: 'mushroom' });
  }
}

// The wolves chase the deer (a step each second, never through a wall or the water); the deer run.
function chasePrey(game) {
  const wilds = game.run.wildAnimals || [];
  const deer = wilds.filter((animal) => animal.kind === 'deer' || animal.kind === 'doe');
  for (const wolf of wilds.filter((animal) => animal.kind === 'wolf')) {
    const prey = deer.find((d) => distance(wolf, d) < 12);
    if (!prey) continue;
    const far = Math.max(0.1, distance(wolf, prey));
    const dx = (prey.x - wolf.x) / far;
    const dy = (prey.y - wolf.y) / far;
    wolf.fleeUntil = 0;
    if (!isSolid(wolf.x + dx * 0.4, wolf.y + dy * 0.4)) {
      wolf.x += dx * 0.4;
      wolf.y += dy * 0.4;
    }
    prey.fleeX = dx;
    prey.fleeY = dy;
    prey.fleeUntil = Math.max(prey.fleeUntil || 0, 2.5);
  }
}

// At night, a fox sneaks from the edge of the village toward the pens (the dogs chase it: life/peopleLife.js).
function updateNightFoxes(game, here) {
  const rl = ensureRunLife(game);
  rl.nightFoxes = rl.nightFoxes.filter((fox) => here.night && distance(fox, game.player) < 35);
  if (!here.night || here.zone.kind !== 'village' || rl.nightFoxes.length > 0 || Math.random() >= 0.08) return;
  const pen = here.zone.plan?.pens?.[0] || here.zone.plan?.center;
  const start = { x: here.zone.x + 2, y: here.zone.y + 3 };
  if (!pen || isInSight(game, start)) return;
  rl.nightFoxes.push({ id: 'fox-' + here.now, villageId: here.zone.id, x: start.x, y: start.y, tx: pen.x, ty: pen.y, dir: 'right', step: 0, fleeing: false });
}

// By day, rabbits come to nibble the fields of the village (they come from the edge, out of sight).
function updateFieldRabbits(game, here) {
  const rl = ensureRunLife(game);
  rl.fieldRabbits = rl.fieldRabbits.filter((rabbit) => distance(rabbit, game.player) < 35);
  const field = here.zone.plan?.fields?.[0];
  if (here.night || here.zone.kind !== 'village' || !field || rl.fieldRabbits.length >= 2 || Math.random() >= 0.14) return;
  const start = { x: field.x + Math.random() * 3, y: field.y + Math.random() * 3 };
  if (isInSight(game, start)) return;
  rl.fieldRabbits.push({ id: 'rab-' + here.now + '-' + rl.fieldRabbits.length, villageId: here.zone.id, x: start.x, y: start.y, tx: field.x + 1, ty: field.y + 1, dir: 'right', step: 0 });
}

// Birds pecking the grass, out of sight; they fly away when the hero comes (see updateNatureAndRoads).
function updateGroundBirds(game, here) {
  const rl = ensureRunLife(game);
  rl.groundBirds = rl.groundBirds.filter((bird) => distance(bird, game.player) < 30 && bird.age < 2.2);
  if (here.night || here.zone.kind === 'inside' || here.biome === 'desert' || rl.groundBirds.length >= 4 || Math.random() >= 0.28) return;
  const spot = spotOutOfSight(game, 22);
  if (!spot) return;
  const colors = ['#8c7a6b', '#d9a441', '#6b8cae'];
  rl.groundBirds.push({ id: 'bird-' + here.now + '-' + rl.groundBirds.length, x: spot.x, y: spot.y, flying: false, age: 0, vx: Math.random() < 0.5 ? 2.4 : -2.4, vy: -1.9, color: colors[Math.floor(Math.random() * 3)] });
}

// In the forest: bird nests, and what a pack of wolves left (a carcass to take the hide of).
function updateForestFinds(game, here) {
  const rl = ensureRunLife(game);
  rl.birdNests = rl.birdNests.filter((nest) => distance(nest, game.player) < 35);
  rl.hunterCarcasses = rl.hunterCarcasses.filter((carcass) => !mayGoAway(game, carcass, here.now >= carcass.expiresAt) && distance(carcass, game.player) < 40);
  if (here.zone.kind !== 'land' || here.biome !== 'forest') return;
  if (rl.birdNests.length < 2 && Math.random() < 0.16) {
    const spot = spotOutOfSight(game, 22);
    if (spot) rl.birdNests.push({ id: 'nst-' + here.now, x: spot.x, y: spot.y, eggs: 2 });
  }
  if (rl.hunterCarcasses.length === 0 && Math.random() < 0.08) {
    const spot = spotOutOfSight(game, 22);
    if (spot) rl.hunterCarcasses.push({ id: 'crc-' + here.now, x: spot.x, y: spot.y, gathered: false, expiresAt: here.now + 90000 });
  }
}

// Fish jumping in the water near the hero (a splash, gone at once), and frogs by the ponds after the rain.
function updateWaterLife(game, here) {
  const life = ensureLife(game);
  const rl = ensureRunLife(game);
  rl.jumpingFish = rl.jumpingFish.filter((fish) => fish.age < fish.life);
  if (rl.jumpingFish.length < 2 && here.zone.kind !== 'inside' && Math.random() < 0.45) {
    for (let tries = 0; tries < 8; tries++) {
      const x = game.player.x + (Math.random() - 0.5) * 18;
      const y = game.player.y + (Math.random() - 0.5) * 14;
      if (tileAt(x, y) !== TILE.WATER) continue;
      rl.jumpingFish.push({ x, y, age: 0, life: 1.1 });
      break;
    }
  }
  rl.pondFrogs = rl.pondFrogs.filter((frog) => distance(frog, game.player) < 30);
  const wet = here.rain || here.now < (life.puddlesUntil || 0);
  if (!wet || rl.pondFrogs.length >= 3 || here.zone.kind === 'inside') return;
  const spot = spotOutOfSight(game, 22, (x, y) => !isSolid(x, y) && isByWater(x, y));
  if (spot) rl.pondFrogs.push({ x: spot.x, y: spot.y, croakUntil: here.now + 2200, phase: Math.random() * 6 });
}

function isByWater(x, y) {
  return tileAt(x + 1, y) === TILE.WATER || tileAt(x - 1, y) === TILE.WATER || tileAt(x, y + 1) === TILE.WATER;
}

// The rare White Stag of the forests: once a day at most, it steps out (out of sight), and runs from a running hero.
function updateWhiteStag(game, here) {
  const life = ensureLife(game);
  const rl = ensureRunLife(game);
  const stag = rl.whiteStagEntity;
  if (stag && (mayGoAway(game, stag, here.now > stag.expiresAt) || distance(stag, game.player) > 36)) rl.whiteStagEntity = null;
  if (rl.whiteStagEntity || here.zone.kind !== 'land' || here.biome !== 'forest') return;
  if ((life.whiteStag.lastBlessedDay || 0) >= here.day || Math.random() >= 0.08) return;
  const spot = spotOutOfSight(game, 24);
  if (!spot) return;
  rl.whiteStagEntity = { x: spot.x, y: spot.y, dir: 'right', step: 0, blessed: false, expiresAt: here.now + 90000 };
  notify(game, '🦌 A shimmering White Stag steps out between the ancient oaks...', '#e8f6ff');
}

// A hunter's trap in the forest, set or sprung.
function updateForestTraps(game, here) {
  const rl = ensureRunLife(game);
  rl.forestTraps = rl.forestTraps.filter((trap) => distance(trap, game.player) < 40);
  if (here.zone.kind !== 'land' || here.biome !== 'forest' || rl.forestTraps.length > 0 || Math.random() >= 0.12) return;
  const spot = spotOutOfSight(game, 22);
  if (spot) rl.forestTraps.push({ id: 'trp-' + here.now, x: spot.x, y: spot.y, sprung: Math.random() < 0.5 });
}

// ---------- The travelers of the war ----------

// Has the war taken land yet? (a village fallen to the monsters, or land taken by the demons)
function isLandLost(game) {
  return VILLAGES.some((v) => game.villages?.[v.id]?.owner === 'monsters') || demonLandSize(game) > 0;
}

// The closest village of people to a place (where refugees and messengers go).
function closestTown(game, place) {
  let best = null;
  for (const v of VILLAGES) {
    if (game.villages?.[v.id]?.owner === 'monsters') continue;
    const center = v.plan?.center || { x: v.x + v.w / 2, y: v.y + v.h / 2 };
    if (!best || distance(center, place) < distance(best, place)) best = center;
  }
  return best;
}

function updateWarTravelers(game, here) {
  const rl = ensureRunLife(game);
  rl.warEntities = rl.warEntities.filter((w) => !mayGoAway(game, w, here.now >= w.expiresAt) && distance(w, game.player) < FORGET_RANGE);
  for (const id of game.run.awake || []) {
    const town = villageOf(id);
    if (town && distance({ x: town.x + town.w / 2, y: town.y + town.h / 2 }, game.player) < FORGET_RANGE) placeTownWarPeople(game, town, here.now);
  }
  if (here.zone.kind === 'land' && rl.warEntities.filter((w) => !w.villageId).length < 2) sendWarTraveler(game, here);
}

// In the towns (as soon as the town is near): a wounded soldier at the clinic, and an orphan in the capitals.
function placeTownWarPeople(game, town, now) {
  if (!town) return;
  const rl = ensureRunLife(game);
  const clinic = (town.plan?.houses || []).find((h) => h.role === 'clinic');
  if (clinic && !rl.warEntities.some((w) => w.id === 'wnd-' + town.id)) {
    rl.warEntities.push({ id: 'wnd-' + town.id, kind: 'wounded', name: 'Bandaged Soldier', look: LOOKS.wounded, villageId: town.id, x: clinic.x + clinic.w + 0.8, y: clinic.y + clinic.h, dir: 'left', shout: 'Took a demon pike near the frontier... clinic herbs saved me.', expiresAt: now + 90000 });
  }
  if (town.kind === 'capital' && !rl.warEntities.some((w) => w.id === 'orp-' + town.id)) {
    const center = town.plan?.center || { x: town.x + 12, y: town.y + 12 };
    rl.warEntities.push({ id: 'orp-' + town.id, villageId: town.id, kind: 'orphan', name: 'War Orphan', look: LOOKS.orphan, x: center.x - 3, y: center.y + 2, dir: 'right', shout: 'Our village burned last autumn... we fled to the capital.', expiresAt: now + 90000 });
  }
}

// On the roads: a scout near the north, refugees (only once land was lost), a messenger, soldiers marching,
// a deserter in the forest. They appear out of sight, and walk to the closest town.
function sendWarTraveler(game, here) {
  const spot = spotOutOfSight(game, 26);
  if (!spot) return;
  const kind = pickWarTraveler(game, spot);
  if (!kind) return;
  const town = closestTown(game, spot) || spot;
  const SPECS = {
    scout: { name: 'Frontier Border Scout', look: LOOKS.scout, stays: true, shout: 'Peering north through brass glass—demon banners on the ridge!', life: 80000 },
    refugee: { name: 'Refugee Family Cart', look: LOOKS.refugee, shout: 'We left our homes ahead of the demon warbands!', life: 75000 },
    messenger: { name: 'Royal Rider Messenger', look: LOOKS.messenger, shout: 'URGENT DISPATCH! Warbands sighted on the northern roads!', life: 60000 },
    marcher: { name: 'Marching Capital Column', look: LOOKS.soldier, shout: '🎵 March with steel and steady hearts to the border! 🎵', life: 65000 },
    deserter: { name: 'Nervous Deserter', look: LOOKS.deserter, stays: true, shout: 'Keep back! I’m not dying in the ash fields!', life: 70000 },
  };
  const spec = SPECS[kind];
  const goal = spec.stays ? spot : town;
  ensureRunLife(game).warEntities.push({ id: kind + '-' + here.now, kind, name: spec.name, look: spec.look, x: spot.x, y: spot.y, tx: goal.x, ty: goal.y, dir: 'down', step: 0, shout: spec.shout, expiresAt: here.now + spec.life });
}

function pickWarTraveler(game, spot) {
  const roll = Math.random();
  if (roll < 0.22 && spot.y < 680) return 'scout';
  if (roll < 0.4 && isLandLost(game)) return 'refugee';
  if (roll < 0.6) return 'messenger';
  if (roll < 0.82) return 'marcher';
  return biomeAt(spot.x, spot.y) === 'forest' ? 'deserter' : null;
}

// ---------- The encounters of the roads ----------

function updateRoadEvents(game, here) {
  const rl = ensureRunLife(game);
  rl.roadEvents = rl.roadEvents.filter((e) => !mayGoAway(game, e, e.solved || here.now >= e.expiresAt) && distance(e, game.player) < FORGET_RANGE);
  if (here.zone.kind !== 'land' || rl.roadEvents.some((e) => !e.solved) || Math.random() >= 0.35) return;
  const spot = spotOutOfSight(game, 24);
  if (!spot) return;
  const kinds = Object.keys(ROAD_EVENTS).filter((kind) => (here.night ? ROAD_EVENTS[kind].night : !ROAD_EVENTS[kind].onlyNight));
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  const spec = ROAD_EVENTS[kind];
  rl.roadEvents.push({ id: 'rd-' + kind + '-' + here.now, kind, name: spec.name, look: spec.look, x: spot.x, y: spot.y, tx: spot.x + 25, ty: spot.y + 4, dir: 'down', step: 0, solved: false, expiresAt: here.now + 90000 });
}

// The fight against the highwaymen is over: won, the road is open again.
function finishHighwayFight(game) {
  const rl = ensureRunLife(game);
  const pending = rl.highwayFight;
  if (!pending || game.run.fight) return;
  rl.highwayFight = null;
  if (pending.fight.phase !== 'won') return;
  const event = rl.roadEvents.find((e) => e.id === pending.eventId);
  if (event) event.solved = true;
  rl.roadEvents = rl.roadEvents.filter((e) => e.id !== pending.eventId); // the beaten highwaymen are gone
  addHappiness(game, 3);
  recordGossip(game, (game.player?.name || 'The hero') + ' reopened a blocked trade highway!', 'lexia');
  notify(game, '🛣️ Road reopened! +3 Happiness!', '#7cfc9a');
}

// ---------- Every frame ----------

export function updateNatureAndRoads(game, dt) {
  const rl = ensureRunLife(game);
  for (const fish of rl.jumpingFish) fish.age += dt;
  flushBirds(game, rl, dt);
  for (const fox of rl.nightFoxes) {
    if (fox.fleeing) stepSmart(fox, fox.x - 10, fox.y - 6, 3.0, dt, { stopAtGate: false });
    else if (Math.hypot(fox.tx - fox.x, fox.ty - fox.y) > 1.2) stepSmart(fox, fox.tx, fox.ty, 1.35, dt, { stopAtGate: false });
  }
  for (const rabbit of rl.fieldRabbits) {
    if (distance(rabbit, game.player) < 3.5) stepSmart(rabbit, rabbit.x + (rabbit.x - game.player.x) * 2, rabbit.y + (rabbit.y - game.player.y) * 2, 2.4, dt, { stopAtGate: false });
  }
  for (const traveler of rl.warEntities) {
    const speed = traveler.kind === 'messenger' ? 3.1 : 1.35;
    if (traveler.tx !== undefined && Math.hypot(traveler.tx - traveler.x, traveler.ty - traveler.y) > 2) stepSmart(traveler, traveler.tx, traveler.ty, speed, dt);
  }
  for (const event of rl.roadEvents) moveRoadEvent(game, event, dt);
  runFromTheHero(game, rl.whiteStagEntity, dt);
}

// The birds pecking the grass fly away when the hero comes close.
function flushBirds(game, rl, dt) {
  for (const bird of rl.groundBirds) {
    if (!bird.flying && distance(bird, game.player) < 4.5) bird.flying = true;
    if (!bird.flying) continue;
    bird.age += dt;
    bird.x += bird.vx * dt;
    bird.y += bird.vy * dt;
  }
}

function moveRoadEvent(game, event, dt) {
  const speed = ROAD_EVENTS[event.kind]?.moves;
  if (speed && Math.hypot(event.tx - event.x, event.ty - event.y) > 2) stepSmart(event, event.tx, event.ty, speed, dt);
  if (event.kind === 'campfire' && Math.random() < dt * 4) {
    addParticle(game, { x: event.x + 0.8, y: event.y, vx: (Math.random() - 0.5) * 0.4, vy: -1.1, life: 0.65, color: Math.random() < 0.5 ? '#ff7043' : '#ffd23f', size: 2 });
  }
}

// The White Stag runs from a running hero.
function runFromTheHero(game, stag, dt) {
  if (!stag || stag.blessed || !game.run.running || distance(stag, game.player) >= 6) return;
  const far = Math.max(0.1, distance(stag, game.player));
  stepSmart(stag, stag.x + ((stag.x - game.player.x) / far) * 6, stag.y + ((stag.y - game.player.y) / far) * 6, 3.2, dt);
}

// ---------- What the action button does here ----------

export function actionsOfNatureAndRoads(game) {
  const makers = [mushroomAction, fenceAction, carcassAction, branchAction, stagAction, roadEventAction, warTravelerAction];
  return makers.map((make) => make(game)).filter(Boolean);
}

// One action: { when, icon, run }.
function action(icon, run) {
  return { when: () => true, icon, run };
}

function mushroomAction(game) {
  const life = ensureLife(game);
  const mushroom = life.rainMushrooms.find((m) => distance(m, game.player) < 1.8);
  if (!mushroom) return null;
  return action('mushroom', () => {
    life.rainMushrooms = life.rainMushrooms.filter((m) => m.id !== mushroom.id);
    addItem(game.player, 'mushroom', 1);
    gainXp(game, 8);
    cue(game, 'coin');
    notify(game, '🍄 Gathered a fresh post-rain Forest Mushroom (+1 Mushroom, +8 XP)!', '#7cfc9a');
  });
}

function fenceAction(game) {
  const fence = ensureLife(game).brokenFences.find((f) => !f.repaired && distance(f, game.player) < 2.0);
  if (!fence) return null;
  return action('logs', () => {
    if (countItem(game.player, 'branch') > 0) removeItem(game.player, 'branch', 1);
    fence.repaired = true;
    earnLexis(game, 15);
    gainXp(game, 12);
    addHappiness(game, 2);
    cue(game, 'trade');
    notify(game, '🔨 Mended storm-broken village fence (+15 Lexis, +2 Happiness)!', '#7cfc9a');
  });
}

function carcassAction(game) {
  const carcass = ensureRunLife(game).hunterCarcasses.find((c) => !c.gathered && distance(c, game.player) < 1.9);
  if (!carcass) return null;
  return action('meat', () => {
    carcass.gathered = true;
    addItem(game.player, 'pelt', 1);
    gainXp(game, 10);
    cue(game, 'coin');
    notify(game, '🐺 A pack left fresh hides near the hunter trail (+1 Soft Pelt)!', '#ffd86b');
  });
}

function branchAction(game) {
  const life = ensureLife(game);
  const branch = life.fallenBranches.find((b) => distance(b, game.player) < 1.8);
  if (!branch) return null;
  return action('logs', () => {
    life.fallenBranches = life.fallenBranches.filter((b) => b.id !== branch.id);
    addItem(game.player, 'branch', 2);
    gainXp(game, 10);
    cue(game, 'hit');
    notify(game, '🪵 Cleared storm-fallen timber from the road (+2 Branches, +10 XP)!', '#7cfc9a');
  });
}

function stagAction(game) {
  const stag = ensureRunLife(game).whiteStagEntity;
  if (!stag || stag.blessed || distance(stag, game.player) >= 2.3) return null;
  return action('star', () => {
    stag.blessed = true;
    ensureLife(game).whiteStag.lastBlessedDay = game.day || 1;
    restoreMana(game.player, 3, game);
    addItem(game.player, 'herb', 2);
    gainXp(game, 40);
    cue(game, 'levelUp');
    addParticle(game, { x: stag.x, y: stag.y - 0.6, vx: 0, vy: -1, life: 1.2, color: '#e8f6ff', size: 4 });
    recordGossip(game, (game.player?.name || 'The hero') + ' encountered the sacred White Stag and received its blessing!', 'lexia');
    say(game, null, ['🦌 The White Stag bows its luminous antlers silently, filling the air with starlight.\n✨ (+3 Mana, +2 Herbs, +40 XP)']);
  });
}

function roadEventAction(game) {
  const event = ensureRunLife(game).roadEvents.find((e) => !e.solved && distance(e, game.player) < 2.2);
  if (!event) return null;
  return action('talk', () => (ROAD_TALKS[event.kind] || meetRival)(game, event));
}

function warTravelerAction(game) {
  const traveler = ensureRunLife(game).warEntities.find((w) => distance(w, game.player) < 2.2);
  if (!traveler) return null;
  return action('talk', () => (WAR_TALKS[traveler.kind] || hearTraveler)(game, traveler));
}

// ---------- Talking with the people of the roads ----------

const ROAD_TALKS = {
  campfire: restAtCampfire,
  tollGate: (game) => say(game, null, ['🛂 Border Gate Warden inspects your guild seal: "Kingdom travel papers verified! Safe travels beyond the ridge, Adventurer."']),
  cart: helpTheCarter,
  pilgrim: guideThePilgrim,
  lostChild: bringTheChildBack,
  roadBandit: faceTheHighwaymen,
  bridgeFix: helpTheBridgeCrew,
  circus: meetTheCircus,
  royalCarriage: (game) => say(game, null, ['👑 Royal Escort Captain: "Clear the king’s road—envoys bearing treasury dispatches between capitals!"']),
  drover: (game) => say(game, null, ['🐄 Livestock Drover whistles to the herd: "Driving cattle and wool sheep down to market!"']),
};

function meetRival(game, event) {
  say(game, null, [event.name + ': "Rival hunters keep clearing the easiest caves—stay sharp out there!"']);
}

function restAtCampfire(game, event) {
  event.solved = true;
  heal(game.player, 15, game);
  cue(game, 'heal');
  say(game, null, ['🔥 Warm travelers make space by the embers and hand you a mug of hot broth.\n(+15 HP Restored)']);
}

function helpTheCarter(game, event) {
  say(game, null, ['An overturned supply cart lies tilted in the ruts! Help heave it upright?'], [
    {
      label: 'Heave cart upright (+25 Lexis, +Apple)',
      icon: 'lexis',
      run: () => {
        event.solved = true;
        earnLexis(game, 25);
        addItem(game.player, 'apple', 2);
        gainXp(game, 20);
        cue(game, 'coin');
        notify(game, '🛒 Helped the carter right the wagon (+25 Lexis, +2 Apples)!', '#7cfc9a');
      },
    },
    { label: 'Leave', run: () => {} },
  ]);
}

function guideThePilgrim(game, event) {
  const win = () => {
    event.solved = true;
    earnLexis(game, 35);
    gainXp(game, 30);
    addHappiness(game, 2);
    notify(game, '🕊️ Pilgrim safely guided! (+35 Lexis, +30 XP, +2 Happiness)', '#7cfc9a');
  };
  const lose = () => say(game, null, ['Pilgrim: "Hmm, let us check the milestone sign down the road!"']);
  const duel = makeDuel({ id: null, name: 'White Pilgrim', look: event.look, shape: 'mage' }, { title: 'Guiding a Lost Pilgrim', category: monsterCategory(game), tag: 'normal', health: 2, speed: 14, onWin: win, onLose: lose });
  say(game, null, ['White-Robed Pilgrim: "Traveler! Can you guide me in clear English toward the nearest sanctuary?"'], [
    { label: 'Answer Pilgrim’s English Direction Question (TOEIC)', icon: 'book', run: () => startFight(game, duel) },
    { label: 'Pass', run: () => {} },
  ]);
}

function bringTheChildBack(game, event) {
  const life = ensureLife(game);
  event.solved = true;
  life.stats.lostKidsRescued = (life.stats.lostKidsRescued || 0) + 1;
  earnLexis(game, 30);
  addItem(game.player, 'honey', 1);
  addHappiness(game, 4);
  addFriendship(game, 'hana', 5);
  cue(game, 'levelUp');
  say(game, null, ['👧 "Thank you for walking me back toward the road lanterns!"\nThe family presses Golden Honey and 30 Lexis into your hand.']);
}

// The highwaymen: a real fight (their captain and the rewards of a monster). Won: the road is open again.
function faceTheHighwaymen(game, event) {
  say(game, null, ['Bandit Tollman blocks the road: "15 Lexis to pass, or draw your blade!"'], [
    { label: '⚔️ Clear the Highwaymen! (+Bounty Reward)', icon: 'sword', run: () => fightTheHighwaymen(game, event) },
    { label: 'Step back', run: () => {} },
  ]);
}

function fightTheHighwaymen(game, event) {
  const captain = makeMonster(game, 'cultist', event.x, event.y, { key: 'road:' + event.id, zoneId: '__road__', name: 'Highwayman Captain', art: 'darkKnight', xp: 45, lexis: 45 });
  startFight(game, captain);
  ensureRunLife(game).highwayFight = { eventId: event.id, fight: game.run.fight };
}

function helpTheBridgeCrew(game, event) {
  say(game, null, ['Bridge Carpenter: "A flood loosened two span beams. Help haul timber to finish today?"'], [
    {
      label: 'Help Repair Bridge (+35 Lexis, +3 Happiness)',
      icon: 'logs',
      run: () => {
        const life = ensureLife(game);
        event.solved = true;
        life.stats.bridgesHelped = (life.stats.bridgesHelped || 0) + 1;
        earnLexis(game, 35);
        addHappiness(game, 3);
        cue(game, 'trade');
        notify(game, '🌉 Road bridge reinforced ahead of schedule!', '#7cfc9a');
      },
    },
    { label: 'Leave them working', run: () => {} },
  ]);
}

function meetTheCircus(game) {
  addHappiness(game, 1);
  cue(game, 'coin');
  say(game, null, ['🎪 Circus Master tips a feathered hat: "Step right up! Tomorrow night we perform on the square!" (+1 Happiness)']);
}

// ---------- Talking with the travelers of the war ----------

const WAR_TALKS = { orphan: comfortTheOrphan, deserter: rallyTheDeserter };

function hearTraveler(game, traveler) {
  say(game, null, [traveler.name + ': "' + traveler.shout + '"']);
}

function comfortTheOrphan(game, orphan) {
  say(game, null, ['War Orphan: "' + orphan.shout + '"'], [
    {
      label: 'Give 10 Lexis & Comfort (+3 Happiness)',
      icon: 'heart',
      run: () => {
        if ((game.player.lexis || 0) < 10) return say(game, null, ['Need 10 Lexis.']);
        game.player.lexis -= 10;
        addHappiness(game, 3);
        cue(game, 'coin');
        notify(game, '💛 The orphan smiles warmly. (+3 Happiness)', '#ffd23f');
        return null;
      },
    },
    { label: 'Pass', run: () => {} },
  ]);
}

function rallyTheDeserter(game, deserter) {
  const win = () => {
    deserter.expiresAt = 0; // back to the garrison (it leaves once out of sight)
    deserter.tx = closestTown(game, deserter)?.x;
    deserter.ty = closestTown(game, deserter)?.y;
    earnLexis(game, 30);
    addHappiness(game, 2);
    notify(game, '🛡️ Convinced the soldier to return to garrison (+30 Lexis, +2 Happiness)!', '#7cfc9a');
  };
  const duel = makeDuel({ id: null, name: 'Forest Deserter', look: deserter.look, shape: 'knight' }, { title: 'Rallying a Deserter', category: monsterCategory(game), tag: 'normal', health: 2, speed: 13, onWin: win, onLose: () => {} });
  say(game, null, ['Forest Deserter grips a rusty spear: "Why go back?! You try rallying troops with English orders!"'], [
    { label: 'Rally Deserter Back to Duty (TOEIC Test)', icon: 'book', run: () => startFight(game, duel) },
    { label: 'Leave them in peace', run: () => {} },
  ]);
}

