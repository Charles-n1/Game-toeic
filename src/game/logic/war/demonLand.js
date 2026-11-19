import { CELLS, SCALE, WORLD_SIZE } from '../../world/size';
import { paintedBiome, paintedGround, isWalkableCell } from '../../world/painting';
import { VILLAGES, DUNGEONS } from '../../data/zones';
import { isDemonSpecies } from '../../data/monsters';
import { ensureWar } from './state';
import { lightForestFire } from './forestFire';
import { notify } from '../messages';

// The demon land. The demons were born on the Silent Isle, and they come out of it little by little:
// every day they take a few cells of land next to their own (a cell = 10 x 10 tiles, see world/size.js).
// A demon only appears on demon land (see withDemonRule): never out of thin air in the middle of the world.
// When they take a cell, they often burn its forest (see war/forestFire.js).
// The hero takes a cell back by beating a demon on it. The bosses push the land back, and once the Demon King
// is dead, the land is given back day after day.
// game.war.demonLand: { cells: { cellIndex: day it was taken } } (the Silent Isle itself is not in it: always theirs)

// The demons who come out of the isle (their generals stay home: see isekaiTodo/monstersPlus.js).
export const FRONT_SPECIES = ['demonSoldier', 'demonArcher', 'abyssHound', 'demonPriest', 'darkKnight'];

const REACH = 2; // cells: how far from their land the demons walk to take a cell (they cross a river)
const SEA_REACH = 10; // cells: how far from the isle they land when they cross the sea (on their black boats)
const SEA_CHANCE = 0.15; // the chance that a new cell is a landing on the coast, not a step on land
const FIRE_CHANCE = 0.4; // a new cell of demon land: the chance that its forest is set on fire
const BOSS_PUSH = { lich: 6, warden: 8, general: 12 }; // cells given back when a boss falls
const KING_GIVES_BACK = 8; // cells given back each day once the Demon King is dead

// ---------- The cells ----------

function cellIndex(cx, cy) {
  return cy * CELLS + cx;
}

function cellOfIndex(index) {
  return { cx: index % CELLS, cy: Math.floor(index / CELLS) };
}

// The middle of a cell, in tiles.
function middleOf(index) {
  const { cx, cy } = cellOfIndex(index);
  return { x: cx * SCALE + SCALE / 2, y: cy * SCALE + SCALE / 2 };
}

function isOnPainting(cx, cy) {
  return cx >= 0 && cy >= 0 && cx < CELLS && cy < CELLS;
}

// A cell of the Silent Isle (the red land of the painting).
function isIsleCell(cx, cy) {
  return isOnPainting(cx, cy) && paintedBiome(cx, cy) === 'demon';
}

// Is the tile (x, y) on the Silent Isle itself?
export function isOnSilentIsle(x, y) {
  return y < WORLD_SIZE && isIsleCell(Math.floor(x / SCALE), Math.floor(y / SCALE));
}

// The cells of the villages and of the dungeons (and one cell around): the demons never take them by walking in.
// (A village falls to a warband: see war/conquest.js.)
let settledCells = null;
function isSettledCell(index) {
  if (!settledCells) {
    settledCells = new Set();
    for (const place of [...VILLAGES, ...DUNGEONS]) {
      for (let cy = Math.floor(place.y / SCALE) - 1; cy <= Math.floor((place.y + place.h) / SCALE) + 1; cy++) {
        for (let cx = Math.floor(place.x / SCALE) - 1; cx <= Math.floor((place.x + place.w) / SCALE) + 1; cx++) settledCells.add(cellIndex(cx, cy));
      }
    }
  }
  return settledCells.has(index);
}

// The cells of the isle with land of the world at most `reach` cells away: where the demons step out from.
const isleEdges = {};
function isleEdgeCells(reach) {
  if (isleEdges[reach]) return isleEdges[reach];
  const edge = [];
  for (let cy = 0; cy < CELLS; cy++) {
    for (let cx = 0; cx < CELLS; cx++) {
      if (isIsleCell(cx, cy) && isWalkableCell(cx, cy) && hasWorldLandAround(cx, cy, reach)) edge.push(cellIndex(cx, cy));
    }
  }
  isleEdges[reach] = edge;
  return edge;
}

function hasWorldLandAround(cx, cy, reach) {
  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) {
      if (isOnPainting(cx + dx, cy + dy) && !isIsleCell(cx + dx, cy + dy) && isWalkableCell(cx + dx, cy + dy)) return true;
    }
  }
  return false;
}

// ---------- The state ----------

export function ensureDemonLand(game) {
  const war = ensureWar(game);
  if (!war.demonLand || typeof war.demonLand !== 'object') war.demonLand = { cells: {} };
  if (!war.demonLand.cells) war.demonLand.cells = {};
  return war.demonLand;
}

function isTakenCell(game, cx, cy) {
  const cells = game.war?.demonLand?.cells;
  return Boolean(cells) && cells[cellIndex(cx, cy)] !== undefined;
}

function isDemonCell(game, cx, cy) {
  return isIsleCell(cx, cy) || isTakenCell(game, cx, cy);
}

// Is the tile (x, y) demon land: the Silent Isle, or a cell the demons took? (Never under the island: the insides.)
export function isDemonGround(game, x, y) {
  if (y < 0 || y >= WORLD_SIZE) return false;
  return isDemonCell(game, Math.floor(x / SCALE), Math.floor(y / SCALE));
}

// How many cells the demons hold out of the isle.
export function demonLandSize(game) {
  return Object.keys(ensureDemonLand(game).cells).length;
}

// Is there demon land at most `range` tiles from (x, y)?
export function isDemonGroundNear(game, x, y, range) {
  const r = Math.ceil(range / SCALE);
  const cx = Math.floor(x / SCALE);
  const cy = Math.floor(y / SCALE);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (isDemonCell(game, cx + dx, cy + dy)) return true;
    }
  }
  return false;
}

// The middles of the walkable cells of demon land around (x, y), at most `range` tiles away:
// the places the demons come out of (see logic/monsters.js).
export function demonGroundAround(game, x, y, range) {
  const r = Math.ceil(range / SCALE);
  const cx = Math.floor(x / SCALE);
  const cy = Math.floor(y / SCALE);
  const spots = [];
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (isOnPainting(nx, ny) && isDemonCell(game, nx, ny) && isWalkableCell(nx, ny)) spots.push(middleOf(cellIndex(nx, ny)));
    }
  }
  return spots;
}

// The monsters that may appear at (x, y), from a list: on demon land, the demons who come out of the isle;
// anywhere else, everybody but the demons.
export function withDemonRule(game, species, x, y) {
  if (isDemonGround(game, x, y)) return FRONT_SPECIES;
  return species.filter((id) => !isDemonSpecies(id));
}

// ---------- The demons take land ----------

// The free cells at most `reach` cells from the `starts` cells: walkable, not a village or a dungeon.
function freeCellsAround(game, starts, reach) {
  const found = new Set();
  for (const start of starts) {
    const { cx, cy } = cellOfIndex(start);
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (!isOnPainting(nx, ny) || isDemonCell(game, nx, ny) || !isWalkableCell(nx, ny)) continue;
        if (!isSettledCell(cellIndex(nx, ny))) found.add(cellIndex(nx, ny));
      }
    }
  }
  return [...found];
}

// The cells the demons can walk to: next to the isle, or next to the land they already took.
function landFront(game) {
  const taken = Object.keys(ensureDemonLand(game).cells).map(Number);
  return freeCellsAround(game, [...isleEdgeCells(REACH), ...taken], REACH);
}

// The coasts the demons can land on, across the sea around the isle.
function seaFront(game) {
  return freeCellsAround(game, isleEdgeCells(SEA_REACH), SEA_REACH);
}

// The next cell the demons take: most often a step on land; sometimes (or when they are stuck) a landing.
function nextCell(game) {
  const onLand = landFront(game);
  if (onLand.length > 0 && Math.random() >= SEA_CHANCE) return mostSurrounded(game, onLand);
  const bySea = seaFront(game);
  if (bySea.length > 0) return pickOne(bySea);
  return onLand.length > 0 ? mostSurrounded(game, onLand) : null;
}

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Of a few cells picked at random, the one with the most demon land around it: the demons fill the holes
// of their land before they go further (their land is one block that moves forward, not scattered dots).
function mostSurrounded(game, list) {
  let best = pickOne(list);
  for (let tries = 0; tries < 3; tries++) {
    const other = pickOne(list);
    if (demonNeighbours(game, other) > demonNeighbours(game, best)) best = other;
  }
  return best;
}

// How many of the 8 cells around this one are demon land.
function demonNeighbours(game, index) {
  const { cx, cy } = cellOfIndex(index);
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if ((dx !== 0 || dy !== 0) && isDemonCell(game, cx + dx, cy + dy)) count += 1;
    }
  }
  return count;
}

// How many cells the demons take today: more when the Silence Threat is high, half once their general is dead.
function cellsPerDay(game) {
  const doom = ensureWar(game).silenceDoom || 0;
  const count = 2 + Math.floor(doom / 25);
  return game.bosses?.general ? Math.ceil(count / 2) : count;
}

// Every morning: the demons take a few cells next to their land, and burn some forests on the way.
export function spreadDemonLand(game) {
  if (game.bosses?.king) {
    giveBackDemonLand(game, KING_GIVES_BACK);
    return;
  }
  const land = ensureDemonLand(game);
  const taken = [];
  for (let i = 0; i < cellsPerDay(game); i++) {
    const index = nextCell(game);
    if (index === null) break;
    land.cells[index] = game.day;
    taken.push(index);
  }
  const fires = taken.filter((index) => Math.random() < FIRE_CHANCE && paintedGround(cellOfIndex(index).cx, cellOfIndex(index).cy) === 'grass' && lightForestFire(game, middleOf(index).x, middleOf(index).y)).length;
  tellSpread(game, taken.length, fires);
}

function tellSpread(game, cells, fires) {
  if (cells === 0) return;
  const burnt = fires > 0 ? ' They set ' + (fires === 1 ? 'a forest' : fires + ' forests') + ' on fire.' : '';
  notify(game, '🌑 The demons came out of the Silent Isle and took ' + cells + ' more piece' + (cells > 1 ? 's' : '') + ' of land.' + burnt, '#ff8a6a');
}

// ---------- The land is taken back ----------

// The hero beat a demon at (x, y): if it is demon land out of the isle, it is free again.
export function freeDemonGround(game, x, y) {
  const land = ensureDemonLand(game);
  const index = cellIndex(Math.floor(x / SCALE), Math.floor(y / SCALE));
  if (land.cells[index] === undefined) return false;
  delete land.cells[index];
  notify(game, '✨ You took this land back from the demons!', '#7cfc9a');
  return true;
}

// The demons give back `count` cells, the newest first (the front goes back toward the isle).
export function giveBackDemonLand(game, count) {
  const land = ensureDemonLand(game);
  const newestFirst = Object.entries(land.cells).sort((a, b) => b[1] - a[1]);
  newestFirst.slice(0, count).forEach(([index]) => delete land.cells[index]);
}

// A boss fell: the demon land goes back a bit.
export function pushBackDemonLand(game, bossKey) {
  if (BOSS_PUSH[bossKey]) giveBackDemonLand(game, BOSS_PUSH[bossKey]);
}

// The cells held by the demons out of the isle, as their middles (for the world map).
export function takenCells(game) {
  return Object.keys(ensureDemonLand(game).cells).map((index) => middleOf(Number(index)));
}

// ---------- The isle ----------

// Places deep inside the Silent Isle (in tiles), spread over it: the camps of the generals.
// Always the same ones (the painting does not change).
export function deepIslePlaces(count) {
  const deep = [];
  for (let cy = 1; cy < CELLS - 1; cy++) {
    for (let cx = 1; cx < CELLS - 1; cx++) {
      if (isDeepIsleCell(cx, cy)) deep.push(cellIndex(cx, cy));
    }
  }
  const places = [];
  for (let i = 0; i < count && deep.length > 0; i++) places.push(middleOf(deep[Math.floor(((i + 0.5) * deep.length) / count)]));
  return places;
}

// A cell of the isle with walkable isle land all around it (far from the sea and the lava).
function isDeepIsleCell(cx, cy) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!isIsleCell(cx + dx, cy + dy) || paintedGround(cx + dx, cy + dy) !== 'ash') return false;
    }
  }
  return true;
}
