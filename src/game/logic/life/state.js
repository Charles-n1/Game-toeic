import { VILLAGES } from '../../data/zones';

// The state of the life of the world (see life.txt): what is saved (game.life: gossip, graves, statues, planted
// trees...) and what only lives on screen (game.run.life: cats, dogs, performers, travelers, birds...).

export function firstLife() {
  const aging = {};
  VILLAGES.slice(0, 6).forEach((v, idx) => {
    aging[v.id + '-eld-' + idx] = { villageId: v.id, name: 'Elder ' + ['Bram', 'Marta', 'Cedric', 'Opal', 'Alden', 'Vera'][idx], ageDays: 42 + idx * 4, gray: true, alive: true };
  });
  return {
    gossip: [], // [{ id, text, originId, day }]
    constructions: [], // [{ id, villageId, x, y, stage, maxStage, kind, repaired: false }]
    graves: [], // [{ id, villageId, name, x, y, day, mourningUntil }]
    plantedTrees: [], // [{ id, kind, x, y, plantedDay, stage }]
    statues: [], // [{ id, villageId, x, y, title, day }]
    fallenBranches: [], // [{ id, x, y, road: true }]
    brokenBridges: [], // [{ id, villageId, x, y, doneDay }]
    puddlesUntil: 0, // game day+hour float or timestamp
    rainbowUntil: 0,
    abandonedHouses: [], // [{ villageId, x, y }]
    rainMushrooms: [], // [{ id, x, y, untilDay, kind }]
    brokenFences: [], // [{ id, villageId, x, y, repaired }]
    borderTowers: [], // [{ id, villageId, x, y, builtDay }]
    wornTiles: [], // [{ x, y, count }]
    rivalryPairs: {}, // { villagerId: { rivalId, untilDay } }
    sickVillagers: {}, // { villagerId: { untilDay, villageId } }
    whiteStag: { rumoredDay: 0, lastBlessedDay: 0, x: null, y: null },
    absentSinceDay: 1,
    lastHomeDay: 1,
    absenceLog: [], // [{ day, text }]
    heroSongs: [], // [{ title, line, day }]
    stats: {
      thievesCaught: 0,
      beggarsHelped: 0,
      lostKidsRescued: 0,
      firesDoused: 0,
      bridgesHelped: 0,
      treesPlanted: 0,
    },
    elderLedger: aging,
  };
}

// The life states already completed (a new game, or an older save): the missing parts are added ONCE, not at
// every call (it was called many times a frame, and built a whole new state each time).
const COMPLETED = new WeakSet();
const LISTS = ['gossip', 'constructions', 'graves', 'plantedTrees', 'statues', 'fallenBranches', 'brokenBridges', 'abandonedHouses', 'rainMushrooms', 'brokenFences', 'borderTowers', 'wornTiles', 'absenceLog', 'heroSongs'];

export function ensureLife(game) {
  if (!game) return firstLife();
  if (!game.life || typeof game.life !== 'object') game.life = firstLife();
  if (!COMPLETED.has(game.life)) {
    completeLife(game.life);
    COMPLETED.add(game.life);
  }
  return game.life;
}

// Adds what an older save does not have yet.
function completeLife(life) {
  const base = firstLife();
  for (const [key, value] of Object.entries(base)) if (life[key] === undefined) life[key] = value;
  for (const key of LISTS) if (!Array.isArray(life[key])) life[key] = [];
  if (!life.stats) life.stats = { ...base.stats };
  if (!life.whiteStag) life.whiteStag = { ...base.whiteStag };
}

export function firstRunLife() {
  return {
    roofCats: [], // [{ id, villageId, x, y, phase, color }]
    townDogs: [], // [{ id, villageId, ownerId, x, y, dir, barkUntil }]
    lamplighter: null, // { villageId, x, y, dir, step, walking, lampIdx, doneDay }
    performers: [], // [{ id, villageId, kind: 'juggler'|'musician'|'beggar'|'crier'|'council'|'washer', name, x, y, dir, shout, look }]
    pickpockets: [], // [{ id, villageId, x, y, tx, ty, dir, step, fleeing, stolenLexis, victimName, victimX, victimY, expiresAt }]
    houseFires: [], // [{ id, villageId, x, y, intensity, expiresAt }]
    roadEvents: [], // [{ id, kind, title, x, y, dir, look, solved, expiresAt, tx, ty }]
    warEntities: [], // [{ id, kind: 'refugee'|'messenger'|'marcher'|'wounded'|'orphan'|'deserter'|'scout', name, x, y, tx, ty, dir, step, look, villageId, text }]
    jumpingFish: [], // [{ x, y, age, life }]
    pondFrogs: [], // [{ x, y, croakUntil, phase }]
    forestTraps: [], // [{ id, x, y, sprung, checkedAt }]
    groundBirds: [], // [{ id, x, y, tx, ty, flying, age, color, dir }]
    birdNests: [], // [{ id, x, y, eggs }]
    nightFoxes: [], // [{ id, villageId, x, y, tx, ty, dir, fleeing }]
    fieldRabbits: [], // [{ id, villageId, x, y, tx, ty, dir, nibbleAt }]
    hunterCarcasses: [], // [{ id, x, y, expiresAt, kind }]
    porchBenches: [], // [{ id, villageId, x, y, elderName }]
    milestones: [], // cached near-road milestones [{ x, y, label }]
    lastAmbientSoundAt: 0,
    lastMarketShoutAt: 0,
    lastSongHour: -1,
    wasRaining: false,
    shiftCheckHour: -1,
  };
}

export function ensureRunLife(game) {
  if (!game || !game.run) return firstRunLife();
  if (!game.run.life || typeof game.run.life !== 'object') game.run.life = firstRunLife();
  if (!COMPLETED.has(game.run.life)) {
    const base = firstRunLife();
    for (const [key, value] of Object.entries(base)) if (game.run.life[key] === undefined) game.run.life[key] = value;
    COMPLETED.add(game.run.life);
  }
  return game.run.life;
}

export function recordGossip(game, text, originId = 'lexia') {
  const life = ensureLife(game);
  if (life.gossip.some((g) => g.text === text)) return;
  life.gossip.push({ id: 'gos-' + Date.now() + '-' + life.gossip.length, text, originId, day: game.day || 1 });
  if (life.gossip.length > 24) life.gossip.shift();
}

export function recordAbsenceNote(game, text) {
  const life = ensureLife(game);
  if (life.absenceLog.some((e) => e.text === text && e.day === (game.day || 1))) return;
  life.absenceLog.push({ day: game.day || 1, text });
  if (life.absenceLog.length > 10) life.absenceLog.shift();
}

export function isShopOpenNow(game) {
  const h = game?.hour ?? 12;
  return h >= 7 && h < 20;
}
