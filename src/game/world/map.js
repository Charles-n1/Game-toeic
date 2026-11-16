import { GROUND_TEXT, BIOME_TEXT, TERRAIN_SIZE } from './terrain';
import { WORLD_SIZE, MAP_HEIGHT, VILLAGES, HOUSES, FIELDS, PLAZAS, VILLAGE_ROADS, PROPS, zoneAt, houseSize, doorOf } from '../data/zones';
import { noise, smoothNoise } from './noise';
import { buildStructures, STRUCTURE_PROPS } from './structures';
import { buildInsides, INSIDE_PROPS, LINKS, PUZZLES, INSIDE_CHESTS, INSIDE_MONSTERS } from './insides';

export { noise, LINKS, PUZZLES };

// The map is a grid of tiles: the island (256 x 256, from art/MAP.png), and under it the insides (dungeons...).
// It is always built the same way, so it is never saved. What changes during a game (a bridge built by a village,
// a gate opened by a puzzle, a boulder pushed) is an "override" or a "blocker", set by the rules of the game.
export const MAP_WIDTH = WORLD_SIZE;
export const MAP_SIZE = WORLD_SIZE; // the island (the world map shows only this square)

export const TILE = {
  GRASS: 0,
  FLOWER: 1,
  PATH: 2,
  SAND: 3,
  WATER: 4,
  TREE: 5,
  ROCK: 6,
  STONE: 7, // the snow
  ASH: 8, // the ground of the demon island
  LAVA: 9,
  DEAD_TREE: 10,
  WALL: 11, // the walls of the buildings and of the dungeons
  FLOOR: 12, // the ground inside
  ROOF: 13,
  HOUSE: 14, // the front wall of a house
  DOOR: 15,
  SOIL: 16, // where food grows
  BRIDGE: 17,
  CLIFF: 18, // a mountain, a mesa: rock nobody climbs
  VOID: 19, // nothing (between the insides)
  STAIRS: 20, // stairs, a cave mouth, a door to the inside: walking on it takes you somewhere else
  ORE: 21, // a rock with metal or crystal in it (a mine): the hero can break it
  WOOD_FLOOR: 22, // the floor of a home
  RUG: 23, // a carpet on the floor of a home
};

// The tiles nobody can walk on.
const SOLID = [TILE.WATER, TILE.TREE, TILE.ROCK, TILE.LAVA, TILE.DEAD_TREE, TILE.WALL, TILE.ROOF, TILE.HOUSE, TILE.DOOR, TILE.CLIFF, TILE.VOID, TILE.ORE];

// ---------- Reading the painted terrain ----------

const GROUND_LETTERS = { w: TILE.WATER, g: TILE.GRASS, F: TILE.FLOWER, p: TILE.PATH, b: TILE.BRIDGE, s: TILE.SAND, t: TILE.TREE, r: TILE.ROCK, n: TILE.STONE, a: TILE.ASH, l: TILE.LAVA, d: TILE.DEAD_TREE, c: TILE.CLIFF };
const BIOME_LETTERS = { m: 'meadow', f: 'forest', n: 'mountain', v: 'demon', d: 'desert', c: 'coast' };

// 'g3w2|...' -> the letters, row after row.
function unpack(text) {
  const letters = [];
  for (const row of text.split('|')) {
    for (const [, letter, count] of row.matchAll(/([A-Za-z])(\d+)/g)) {
      for (let i = 0; i < Number(count); i++) letters.push(letter);
    }
  }
  return letters;
}

const BIOMES = unpack(BIOME_TEXT).map((letter) => BIOME_LETTERS[letter]);

// The land of a tile: 'village', 'dungeon' (the insides and the dungeons), or the land of the painting.
export function biomeAt(x, y) {
  const zone = zoneAt(x, y);
  if (zone.kind === 'village') return 'village';
  if (zone.kind === 'inside') return 'dungeon';
  if (x < 0 || y < 0 || x >= TERRAIN_SIZE || y >= TERRAIN_SIZE) return 'coast';
  return BIOMES[Math.floor(y) * TERRAIN_SIZE + Math.floor(x)];
}

// ---------- Building ----------

export function setTile(tiles, x, y, tile) {
  if (x >= 0 && y >= 0 && x < MAP_WIDTH && y < MAP_HEIGHT) tiles[y * MAP_WIDTH + x] = tile;
}

export function getTile(tiles, x, y) {
  if (x < 0 || y < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT) return TILE.VOID;
  return tiles[y * MAP_WIDTH + x];
}

export function fillRect(tiles, x, y, w, h, tile) {
  for (let row = y; row < y + h; row++) {
    for (let column = x; column < x + w; column++) setTile(tiles, column, row, tile);
  }
}

// A house: the roof, then its front wall (the last row) with the door. The school and the guild have 2 doors.
function buildHouse(tiles, house) {
  const { w, h } = houseSize(house);
  fillRect(tiles, house.x, house.y, w, h - 1, TILE.ROOF);
  fillRect(tiles, house.x, house.y + h - 1, w, 1, TILE.HOUSE);
  const door = doorOf(house);
  setTile(tiles, door.x, door.y, TILE.DOOR);
  if (house.kind === 'school' || house.kind === 'guild') setTile(tiles, door.x + 1, door.y, TILE.DOOR);
}

// A village: its ground is cleared (no tree inside), then the roads, the squares, the fields and the houses.
function buildVillage(tiles, village) {
  for (let y = village.y; y < village.y + village.h; y++) {
    for (let x = village.x; x < village.x + village.w; x++) setTile(tiles, x, y, noise(x, y, 8) < 0.06 ? TILE.FLOWER : TILE.GRASS);
  }
  VILLAGE_ROADS.filter((road) => road.village === village.id).forEach((road) => fillRect(tiles, road.x, road.y, road.w, road.h, TILE.PATH));
}

// The gates of a village: where its roads meet its border. [{ x, y, dx, dy }] (dx, dy: the way out).
export function gatesOf(village) {
  const gates = [];
  for (const road of VILLAGE_ROADS.filter((item) => item.village === village.id)) {
    if (road.h === 2) {
      gates.push({ x: village.x, y: road.y, dx: -1, dy: 0 }, { x: village.x + village.w - 1, y: road.y, dx: 1, dy: 0 });
    } else {
      gates.push({ x: road.x, y: village.y, dx: 0, dy: -1 }, { x: road.x, y: village.y + village.h - 1, dx: 0, dy: 1 });
    }
  }
  return gates;
}

// From a gate, a road (2 tiles wide) goes straight out until it meets a road of the painting (or 24 tiles).
// It crosses the water on a bridge, and the trees and rocks on its way are cut.
function roadOutOf(tiles, gate) {
  const side = gate.dx === 0 ? [1, 0] : [0, 1];
  for (let step = 1; step <= 24; step++) {
    const x = gate.x + gate.dx * step;
    const y = gate.y + gate.dy * step;
    const cells = [[x, y], [x + side[0], y + side[1]]];
    const arrived = step > 2 && cells.some(([cx, cy]) => getTile(tiles, cx, cy) === TILE.PATH);
    for (const [cx, cy] of cells) {
      const tile = getTile(tiles, cx, cy);
      if (tile === TILE.WATER) setTile(tiles, cx, cy, TILE.BRIDGE);
      else if (tile !== TILE.BRIDGE) setTile(tiles, cx, cy, TILE.PATH);
    }
    if (arrived) return;
  }
}

function buildMap() {
  const tiles = new Uint8Array(MAP_WIDTH * MAP_HEIGHT).fill(TILE.VOID);
  unpack(GROUND_TEXT).forEach((letter, i) => (tiles[i] = GROUND_LETTERS[letter]));
  for (const village of VILLAGES) {
    buildVillage(tiles, village);
    gatesOf(village).forEach((gate) => roadOutOf(tiles, gate));
  }
  PLAZAS.forEach((plaza) => fillRect(tiles, plaza.x, plaza.y, plaza.w, plaza.h, TILE.PATH));
  FIELDS.forEach((field) => fillRect(tiles, field.x, field.y, field.w, field.h, TILE.SOIL));
  HOUSES.forEach((house) => buildHouse(tiles, house));
  buildStructures(tiles);
  buildInsides(tiles);
  return tiles;
}

export const MAP = buildMap();

// ---------- What changes during a game ----------

// Tiles that a game changed (a bridge built by a village): index -> tile. Set by the rules (logic/villages.js).
const overrides = new Map();
// Tiles blocked by things that move or change (a boulder, a closed gate, the walls of a village): index -> true.
let dynamicBlocked = new Set();
// The props that change with the game (the walls of the villages, the gates of the puzzles...).
let dynamicProps = [];

export function setOverrides(list) {
  overrides.clear();
  for (const item of list) overrides.set(item.y * MAP_WIDTH + item.x, item.tile);
}

// props: [{ kind, x, y, w, h }] that block, blockers: [{ x, y }] more tiles that block (boulders, gates).
export function setDynamic(props, blockers) {
  dynamicProps = props;
  dynamicBlocked = new Set();
  for (const prop of props.filter((item) => !item.walkable)) {
    for (let y = prop.y; y < prop.y + prop.h; y++) for (let x = prop.x; x < prop.x + prop.w; x++) dynamicBlocked.add(y * MAP_WIDTH + x);
  }
  for (const item of blockers) dynamicBlocked.add(item.y * MAP_WIDTH + item.x);
}

// Every prop of the world right now: the fixed ones and the ones of the game.
const FIXED_PROPS = [...PROPS, ...STRUCTURE_PROPS, ...INSIDE_PROPS];

export function allProps() {
  return dynamicProps.length > 0 ? [...FIXED_PROPS, ...dynamicProps] : FIXED_PROPS;
}

// The tiles covered by a fixed prop: 1 = blocked.
function buildBlocked() {
  const blocked = new Uint8Array(MAP_WIDTH * MAP_HEIGHT);
  for (const prop of FIXED_PROPS) {
    if (prop.walkable) continue;
    for (let y = prop.y; y < prop.y + prop.h; y++) {
      for (let x = prop.x; x < prop.x + prop.w; x++) blocked[y * MAP_WIDTH + x] = 1;
    }
  }
  return blocked;
}

const BLOCKED = buildBlocked();

// ---------- Reading the map ----------

// The tile at (x, y). Outside the island: water. Outside the insides: nothing.
export function tileAt(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) return ty < WORLD_SIZE ? TILE.WATER : TILE.VOID;
  const index = ty * MAP_WIDTH + tx;
  return overrides.has(index) ? overrides.get(index) : MAP[index];
}

export function isSolid(x, y) {
  if (SOLID.includes(tileAt(x, y))) return true;
  const index = Math.floor(y) * MAP_WIDTH + Math.floor(x);
  return BLOCKED[index] === 1 || dynamicBlocked.has(index);
}

export function isWater(x, y) {
  return tileAt(x, y) === TILE.WATER;
}

// The other side of a stairs tile: where the walker arrives ({ x, y }), or null.
export function linkAt(x, y) {
  return LINKS.get(Math.floor(x) + ',' + Math.floor(y)) || null;
}

// ---------- Fixed things placed on the map ----------

// The guards and the bosses of the dungeons: [{ species, x, y, key, zoneId }]. key: to remember who is dead.
export function dungeonMonsters() {
  return INSIDE_MONSTERS;
}

// The chests: in the dungeons and the mines. [{ x, y, key, zone }]
export const CHESTS = INSIDE_CHESTS;

// The treasures buried in the wild: the player must dig to find them. [{ x, y, key, danger }]
function findTreasures() {
  const treasures = [];
  for (let y = 4; y < WORLD_SIZE - 4; y++) {
    for (let x = 4; x < WORLD_SIZE - 4; x++) {
      const zone = zoneAt(x, y);
      if (zone.kind === 'land' && !isSolid(x, y) && noise(x, y, 1) < 0.0025) treasures.push({ x: x, y: y, key: x + ',' + y, danger: zone.danger });
    }
  }
  return treasures;
}

export const TREASURES = findTreasures();

export { smoothNoise };
