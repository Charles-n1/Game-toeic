import { VILLAGES, villageOf } from '../data/zones';
import { isSolid } from '../world/map';

// The walls around the villages. A wall is made of SECTIONS (8 tiles each, all around the village), and each
// section is built on its own: nothing, a palisade of wood, or a wall of stone. So a wall can be half stone,
// half wood, with holes. Each section has a life: the monsters break it, the people repair it.
// game.villages[id].walls: one letter per section ('-' nothing, 'w' wood, 's' stone),
// game.villages[id].wallHp: the life of each section (0 = broken: only rubble, anyone walks through).
// The small turrets (bought by the hero) stand at the corners of the walls: game.villages[id].turrets.

export const SECTION = 8; // tiles per section
export const WALL_HP = { w: 60, s: 180, '-': 0 };
const KIND_OF = { w: 'palisade', s: 'wall' };

// ---------- Where the walls are ----------

function isGateTile(village, x, y) {
  return village.plan.gates.some((gate) => {
    if (gate.dx === 0) return y === gate.y && x >= gate.x && x < gate.x + gate.w;
    return x === gate.x && y >= gate.y && y < gate.y + gate.w;
  });
}

// The tiles of the wall line, all around the village, in order: [{ x, y, side }].
function wallLine(village) {
  const tiles = [];
  const right = village.x + village.w - 1;
  const bottom = village.y + village.h - 1;
  for (let x = village.x; x <= right; x++) tiles.push({ x: x, y: village.y, side: 'row' });
  for (let y = village.y + 1; y < bottom; y++) tiles.push({ x: right, y: y, side: 'column' });
  for (let x = right; x >= village.x; x--) tiles.push({ x: x, y: bottom, side: 'row' });
  for (let y = bottom - 1; y > village.y; y--) tiles.push({ x: village.x, y: y, side: 'column' });
  return tiles.filter((tile) => !isGateTile(village, tile.x, tile.y));
}

const LINES = {};

// The tiles of the wall of a village, each with its section: [{ x, y, side, section }].
export function wallTilesOf(village) {
  if (!LINES[village.id]) LINES[village.id] = wallLine(village).map((tile, i) => ({ ...tile, section: Math.floor(i / SECTION) }));
  return LINES[village.id];
}

export function sectionCount(village) {
  return Math.ceil(wallLine(village).length / SECTION);
}

// The places of the turrets: the 4 corners of the walls (inside), and beside each gate.
export function turretSpots(village) {
  const spots = [
    { x: village.x + 1, y: village.y + 1 },
    { x: village.x + village.w - 3, y: village.y + 1 },
    { x: village.x + 1, y: village.y + village.h - 3 },
    { x: village.x + village.w - 3, y: village.y + village.h - 3 },
  ];
  for (const gate of village.plan.gates) {
    if (gate.dx === 0) spots.push({ x: gate.x - 3, y: gate.y + (gate.dy < 0 ? 1 : -2) });
    else spots.push({ x: gate.x + (gate.dx < 0 ? 1 : -2), y: gate.y - 3 });
  }
  return spots;
}

// ---------- The walls at the start ----------

// An old village has walls of stone, a younger one of wood, a young one only some pieces (or nothing).
export function firstWalls(village, random) {
  const count = sectionCount(village);
  let letters = '';
  for (let i = 0; i < count; i++) {
    const roll = random();
    if (village.founded >= 250) letters += 's';
    else if (village.founded >= 120) letters += roll < 0.6 ? 's' : 'w';
    else if (village.founded >= 40) letters += roll < 0.15 ? 's' : 'w';
    else if (village.founded >= 15) letters += roll < 0.5 ? 'w' : '-';
    else letters += '-';
  }
  return letters;
}

export function fullHp(letters) {
  return [...letters].map((letter) => WALL_HP[letter]);
}

// ---------- Building, repairing, breaking ----------

// What a village does today with its wood and stone: repair a broken section, close a hole, then turn wood
// into stone. Returns a word for the news (or null).
export function buildOneSection(state) {
  const letters = [...state.walls];
  const damaged = letters.findIndex((letter, i) => letter !== '-' && state.wallHp[i] < WALL_HP[letter]);
  if (damaged >= 0 && state.wood >= 3) {
    state.wood -= 3;
    state.wallHp[damaged] = Math.min(WALL_HP[letters[damaged]], state.wallHp[damaged] + 40);
    return 'repaired';
  }
  const hole = letters.indexOf('-');
  if (hole >= 0 && state.wood >= 6) {
    state.wood -= 6;
    letters[hole] = 'w';
    state.wallHp[hole] = WALL_HP.w;
    state.walls = letters.join('');
    return 'wood';
  }
  const wooden = letters.indexOf('w');
  if (wooden >= 0 && state.stone >= 10) {
    state.stone -= 10;
    letters[wooden] = 's';
    state.wallHp[wooden] = WALL_HP.s;
    state.walls = letters.join('');
    return 'stone';
  }
  return null;
}

// A blow on a section: its life goes down. Returns true if it just broke.
export function hitSection(state, section, damage) {
  if (state.wallHp[section] <= 0) return false;
  state.wallHp[section] = Math.max(0, state.wallHp[section] - damage);
  return state.wallHp[section] === 0;
}

// The section of a village whose tiles are the closest to (x, y) and still standing: { section, x, y } or null.
export function closestStandingSection(game, village, x, y) {
  const state = game.villages[village.id];
  let best = null;
  for (const tile of wallTilesOf(village)) {
    if (state.wallHp[tile.section] <= 0) continue;
    const far = Math.hypot(tile.x + 0.5 - x, tile.y + 0.5 - y);
    if (!best || far < best.far) best = { section: tile.section, x: tile.x + 0.5, y: tile.y + 0.5, far: far };
  }
  return best;
}

// How strong the walls of a village are: their total life (for the battles far from the hero).
export function wallStrength(state) {
  return state.wallHp.reduce((total, hp) => total + hp, 0);
}

// ---------- The props of the walls (drawn, and blocking the way) ----------

function wallProps(village, state) {
  const pieces = [];
  for (const tile of wallTilesOf(village)) {
    const letter = state.walls[tile.section];
    if (letter === '-') continue;
    if (state.wallHp[tile.section] <= 0) pieces.push({ kind: 'rubble', x: tile.x, y: tile.y, w: 1, h: 1, walkable: true, look: letter });
    else pieces.push({ kind: KIND_OF[letter], x: tile.x, y: tile.y, w: 1, h: 1, side: tile.side, cracked: state.wallHp[tile.section] < WALL_HP[letter] / 2 });
  }
  return pieces;
}

// The torches beside the gates of a village that has walls.
function gateTorches(village) {
  const torches = [];
  for (const gate of village.plan.gates) {
    const inX = gate.x - gate.dx;
    const inY = gate.y - gate.dy;
    const spots = gate.dx === 0 ? [[inX - 1, inY], [inX + gate.w, inY]] : [[inX, inY - 1], [inX, inY + gate.w]];
    spots.forEach(([x, y]) => {
      if (!isSolid(x + 0.5, y + 0.5)) torches.push({ kind: 'torch', x: x, y: y, w: 1, h: 1 });
    });
  }
  return torches;
}

function turretProps(village, state) {
  const spots = turretSpots(village);
  return (state.turrets || []).map((index) => ({ kind: 'turret', x: spots[index].x, y: spots[index].y, w: 2, h: 2, village: village.id, look: 'wood' }));
}

// Every piece of wall, rubble, torch and turret of the world.
export function villageWalls(game) {
  return VILLAGES.flatMap((village) => {
    const state = game.villages[village.id];
    const pieces = wallProps(village, state);
    return pieces.length > 0 ? [...pieces, ...gateTorches(village), ...turretProps(village, state)] : turretProps(village, state);
  });
}

// How a villager talks about the walls: "half stone, half wood", "no wall at all"...
export function describeWalls(state) {
  const letters = [...state.walls];
  const stone = letters.filter((letter) => letter === 's').length;
  const wood = letters.filter((letter) => letter === 'w').length;
  const broken = letters.filter((letter, i) => letter !== '-' && state.wallHp[i] <= 0).length;
  const parts = [];
  if (stone === letters.length) parts.push('walls of stone all around');
  else if (wood === letters.length) parts.push('a palisade of wood all around');
  else if (stone + wood === 0) parts.push('no wall at all');
  else parts.push('a wall made of ' + stone + ' parts of stone, ' + wood + ' of wood, and ' + (letters.length - stone - wood) + ' holes');
  if (broken > 0) parts.push(broken + ' broken parts to repair');
  return parts.join(', ');
}

/** Finds a nearby damaged, missing, or unfortified wooden village wall section within range of player. */
export function wallRepairSpotNear(game) {
  const { x, y } = game.player;
  for (const village of VILLAGES) {
    if (x < village.x - 3 || x > village.x + village.w + 3 || y < village.y - 3 || y > village.y + village.h + 3) continue;
    const state = game.villages?.[village.id];
    if (!state || typeof state.walls !== 'string') continue;
    for (const tile of wallTilesOf(village)) {
      if (Math.hypot(tile.x + 0.5 - x, tile.y + 0.5 - y) > 1.7) continue;
      const letter = state.walls[tile.section];
      const hp = state.wallHp[tile.section] || 0;
      const max = WALL_HP[letter] || 0;
      if (letter === '-' || hp < max || letter === 'w') {
        return { village, state, section: tile.section, letter, hp, max };
      }
    }
  }
  return null;
}

/** Repairs or upgrades a village wall section to palisade ('w') or stone ('s'). Returns 'repaired'|'built'|'upgraded'|'reinforced'. */
export function applyWallRenovation(game, spot) {
  const { state, section } = spot;
  const letters = [...state.walls];
  const letter = letters[section];
  if (!game.counts) game.counts = {};
  game.counts.wallsRepaired = (game.counts.wallsRepaired || 0) + 1;

  if (letter === '-') {
    letters[section] = 'w';
    state.walls = letters.join('');
    state.wallHp[section] = WALL_HP.w;
    return 'built';
  }
  if ((state.wallHp[section] || 0) < WALL_HP[letter]) {
    state.wallHp[section] = WALL_HP[letter];
    return 'repaired';
  }
  if (letter === 'w') {
    letters[section] = 's';
    state.walls = letters.join('');
    state.wallHp[section] = WALL_HP.s;
    return 'upgraded';
  }
  state.wallHp[section] = WALL_HP[letter];
  return 'reinforced';
}

export { villageOf };
