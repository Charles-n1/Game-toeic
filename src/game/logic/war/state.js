import { VILLAGES, MONSTER_TOWNS, CAMPS, zoneAt } from '../../data/zones';
import { isSolid } from '../../world/map';
import { isBarrier } from '../powers';

// Shared state initialization, persistence guards, geometry helpers, and public query helpers for war.

const MAX_CORPSES = 24;
const MAX_GRAVES = 50;

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function centerOfPlace(place) {
  return { x: place.x + place.w / 2, y: place.y + place.h / 2 };
}

export function townOf(townId) {
  return MONSTER_TOWNS.find((town) => town.id === townId) || null;
}

export function campOf(campId) {
  return CAMPS.find((camp) => camp.id === campId) || null;
}

export function villageById(villageId) {
  return VILLAGES.find((village) => village.id === villageId) || null;
}

function defaultTownState(town, index) {
  const danger = zoneAt(town.x, town.y).danger || 2;
  const inDemon = zoneAt(town.x, town.y).id === 'demon';
  return {
    strength: Math.round(24 + (town.founded || 60) * 0.08 + danger * 7),
    growthRate: 3 + danger * 1.5 + (inDemon ? 3 : 0),
    conquered: 0,
    nextRaidDay: 2 + (index % 4),
  };
}

export function firstWar() {
  const towns = {};
  MONSTER_TOWNS.forEach((town, index) => {
    towns[town.id] = defaultTownState(town, index);
  });
  return {
    towns: towns,
    warbands: [],
    corpses: [],
    graves: [],
    camps: {},
    kidnapped: {},
    conqueredBy: {},
    nextId: 1,
  };
}

export function ensureWar(game) {
  if (!game.war || typeof game.war !== 'object') game.war = firstWar();
  const war = game.war;
  if (!war.towns) war.towns = {};
  MONSTER_TOWNS.forEach((town, index) => {
    if (!war.towns[town.id]) war.towns[town.id] = defaultTownState(town, index);
  });
  if (!Array.isArray(war.warbands)) war.warbands = [];
  if (!Array.isArray(war.corpses)) war.corpses = [];
  if (!Array.isArray(war.graves)) war.graves = [];
  if (!war.camps) war.camps = {};
  if (!war.kidnapped) war.kidnapped = {};
  if (!war.conqueredBy) war.conqueredBy = {};
  if (!war.nextId) war.nextId = 1;
  return war;
}

export function ensureRunWar(game) {
  ensureWar(game);
  if (!Array.isArray(game.run.caravans)) game.run.caravans = [];
  if (!Array.isArray(game.run.skirmishes)) game.run.skirmishes = [];
  if (!game.run.war || typeof game.run.war !== 'object') {
    game.run.war = {
      projectiles: [],
      campUnits: [],
      ambushFoes: [],
      effects: [],
      turretCooldowns: {},
      spawnedBands: {},
      clearedCaptors: {},
      caravanTimer: 16,
      ambushTimer: 36,
      skirmishTimer: 30,
      trackedFight: null,
      lastLightningCd: 0,
      alertUntil: 0,
    };
  }
  const runWar = game.run.war;
  if (!Array.isArray(runWar.projectiles)) runWar.projectiles = [];
  if (!Array.isArray(runWar.campUnits)) runWar.campUnits = [];
  if (!Array.isArray(runWar.ambushFoes)) runWar.ambushFoes = [];
  if (!Array.isArray(runWar.effects)) runWar.effects = [];
  if (!runWar.turretCooldowns) runWar.turretCooldowns = {};
  if (!runWar.spawnedBands) runWar.spawnedBands = {};
  if (!runWar.clearedCaptors) runWar.clearedCaptors = {};
  return runWar;
}

export function nextWarId(game, prefix) {
  const war = ensureWar(game);
  const id = prefix + '-' + war.nextId;
  war.nextId += 1;
  return id;
}

export function canStep(game, x, y) {
  return !isSolid(x, y) && !isBarrier(game, x, y);
}

// Slides an entity by (dx, dy) around solid obstacles.
export function moveSlide(game, entity, dx, dy) {
  if (canStep(game, entity.x + dx, entity.y)) entity.x += dx;
  if (canStep(game, entity.x, entity.y + dy)) entity.y += dy;
}

// Finds a free walkable tile near (x, y), preferring outdoor land/paths.
export function placeNearSpot(game, x, y, minR = 1, maxR = 6) {
  for (let r = minR; r <= maxR; r++) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const cx = Math.floor(x + Math.cos(angle) * r) + 0.5;
      const cy = Math.floor(y + Math.sin(angle) * r) + 0.5;
      if (canStep(game, cx, cy)) return { x: cx, y: cy };
    }
  }
  return { x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5 };
}

export function spawnWarEffect(game, kind, x, y, color = '#ffd23f', extra = {}) {
  const runWar = ensureRunWar(game);
  if (runWar.effects.length > 80) runWar.effects.shift();
  runWar.effects.push({ kind: kind, x: x, y: y, color: color, age: 0, life: extra.life || 0.35, ...extra });
}

export function addCorpse(game, kind, name, x, y, look) {
  const war = ensureWar(game);
  war.corpses.push({
    id: nextWarId(game, 'corpse'),
    kind: kind,
    name: name,
    x: x,
    y: y,
    day: game.day,
    look: look || { skin: '#e9b98f', hair: '#5a3a1e', style: 'short', eyes: '#3b3b3b', outfit: '#7a5634', trim: '#e9d8a6' },
  });
  if (war.corpses.length > MAX_CORPSES) war.corpses.shift();
}

export function addGrave(game, name, x, y) {
  const war = ensureWar(game);
  war.graves.push({ id: nextWarId(game, 'grave'), name: name, x: x, y: y, day: game.day });
  if (war.graves.length > MAX_GRAVES) war.graves.shift();
}

// ---------- Public query helpers ----------

export function isNpcKidnapped(game, npcId) {
  return Boolean(game && game.war && game.war.kidnapped && game.war.kidnapped[npcId]);
}

export function isVillageUnderAttack(game, villageId) {
  if (!game) return false;
  if (game.raid && game.raid.active && villageId === 'lexia') return true;
  return Boolean(game.war && Array.isArray(game.war.warbands) && game.war.warbands.some((band) => band.targetId === villageId && band.state === 'sieging'));
}

export function activeWarbandsSummary(game) {
  const war = ensureWar(game);
  return war.warbands.map((band) => {
    const town = townOf(band.townId);
    const target = villageById(band.targetId);
    return {
      id: band.id,
      townId: band.townId,
      townName: town ? town.name : band.townId,
      targetId: band.targetId,
      targetName: target ? target.name : band.targetId,
      species: band.species,
      strength: band.strength,
      count: band.count,
      state: band.state,
      x: Math.round(band.x),
      y: Math.round(band.y),
    };
  });
}
