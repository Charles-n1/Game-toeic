import { TILE, SOLID_TILES } from './tileKinds';
import { MAP_WIDTH, getTile, setTile, fillRect, natureBiome } from './grid';
import { WORLD_SIZE, MAP_HEIGHT, SCALE, CELLS } from './size';
import { SETTLED, VILLAGES, DUNGEONS, WILD_HOMES, WILD_PROPS, WILD_STRUCTURES, PROPS, zoneAt, doorOf, hasDoubleDoor } from '../data/zones';
import { paintedGround } from './painting';
import { noise, smoothNoise } from './noise';
import { buildStructures, STRUCTURE_PROPS } from './structures';
import { buildInsides, INSIDE_PROPS, LINKS, PUZZLES, INSIDE_CHESTS, INSIDE_MONSTERS } from './insides';
import { pavePaintedRoads, paintedRoadCells, paveNewRoad, paveLine } from './roads';

export { TILE, MAP_WIDTH, noise, smoothNoise, LINKS, PUZZLES, getTile };

// The map: a grid of tiles (see world/grid.js): the island (2560 x 2560 tiles, from art/MAP.png), and under it
// the insides (dungeons, caves, the home). Nature is made from the painting (world/ground.js); here the people
// build on it: the villages, the roads, the ports, the dungeons. It is always built the same way, so it is never
// saved. What changes during a game (a bridge built by a village, a wall broken, a gate opened by a puzzle)
// is an "override" or a "blocker", set by the rules of the game.

export const MAP_SIZE = WORLD_SIZE; // the island (the world map shows only this square)

// The land of a tile: 'village', 'dungeon' (the insides), or the land of nature.
export function biomeAt(x, y) {
  const zone = zoneAt(x, y);
  if (zone.kind === 'village') return 'village';
  if (zone.kind === 'inside') return 'dungeon';
  return natureBiome(Math.floor(x), Math.floor(y));
}

// ---------- Building the villages ----------

const BARE_GROUND = { mountain: TILE.STONE, desert: TILE.SAND, coast: TILE.SAND, demon: TILE.ASH };

function bareGround(biome) {
  return BARE_GROUND[biome] ?? TILE.GRASS;
}

// A house: the roof, then its front wall (the last row) with the door (two for the big halls).
function buildHouse(house) {
  fillRect(house.x, house.y, house.w, house.h - 1, TILE.ROOF);
  fillRect(house.x, house.y + house.h - 1, house.w, 1, TILE.HOUSE);
  const door = doorOf(house);
  setTile(door.x, door.y, TILE.DOOR);
  if (hasDoubleDoor(house)) setTile(door.x + 1, door.y, TILE.DOOR);
}

// A village (or a camp): the ground is cleared (no tree inside), then its streets, its square, fields, houses.
function buildSettlement(place) {
  const ground = bareGround(place.biome);
  for (let y = place.y; y < place.y + place.h; y++) {
    for (let x = place.x; x < place.x + place.w; x++) setTile(x, y, ground === TILE.GRASS && noise(x, y, 8) < 0.04 ? TILE.FLOWER : ground);
  }
  const plan = place.plan;
  plan.roads.forEach((road) => fillRect(road.x, road.y, road.w, road.h, TILE.PATH));
  if (plan.square) fillRect(plan.square.x, plan.square.y, plan.square.w, plan.square.h, TILE.PATH);
  plan.fields.forEach((field) => fillRect(field.x, field.y, field.w, field.h, TILE.SOIL));
  if (ground === TILE.GRASS) plan.flowers.forEach((patch) => fillRect(patch.x, patch.y, patch.w, patch.h, TILE.FLOWER));
  plan.trees.forEach((tree) => setTile(tree.x, tree.y, TILE.TREE));
  plan.houses.forEach(buildHouse);
}

// ---------- The roads ----------

// The roads never cross a village or a dungeon (they stop at their gates).
function isBuiltPlace(x, y) {
  const kind = zoneAt(x, y).kind;
  return kind === 'village' || kind === 'monsterTown' || kind === 'camp' || kind === 'dungeon' || kind === 'castle';
}

// The doors of the places that a new road joins to the others: [{ x, y, dx, dy }] (the tile just outside).
function doorsToJoin() {
  const doors = [];
  for (const place of SETTLED) {
    const gates = place.kind === 'monster' ? place.plan.gates.slice(0, 2) : place.plan.gates;
    gates.forEach((gate) => doors.push({ x: gate.x + gate.dx + (gate.dx === 0 ? 1 : 0), y: gate.y + gate.dy + (gate.dy === 0 ? 1 : 0), dx: gate.dx, dy: gate.dy }));
  }
  for (const dungeon of DUNGEONS) {
    if (dungeon.id !== 'castle') doors.push({ x: dungeon.door[0], y: dungeon.y + dungeon.h, dx: 0, dy: 1 });
  }
  return doors;
}

function buildRoads() {
  pavePaintedRoads(isBuiltPlace);
  const roads = paintedRoadCells();
  for (const door of doorsToJoin()) paveNewRoad(door, roads, isBuiltPlace);
  return roads;
}

// ---------- The ports ----------
// A village close to the sea has a port: a pier goes into the sea, a boat waits at its end.
// PORTS: [{ village, name, x, y (the boat), landing: { x, y } (where the travelers arrive) }]

// The water of the sea: the water of the painting that touches the border of the world.
function findSea() {
  const sea = new Uint8Array(CELLS * CELLS);
  const queue = [];
  for (let i = 0; i < CELLS; i++) queue.push([i, 0], [i, CELLS - 1], [0, i], [CELLS - 1, i]);
  while (queue.length > 0) {
    const [cx, cy] = queue.pop();
    if (cx < 0 || cy < 0 || cx >= CELLS || cy >= CELLS || sea[cy * CELLS + cx] || paintedGround(cx, cy) !== 'water') continue;
    sea[cy * CELLS + cx] = 1;
    queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  return sea;
}

const SEA = findSea();

function isSea(x, y) {
  if (x < 0 || y < 0 || x >= WORLD_SIZE || y >= WORLD_SIZE) return false;
  return getTile(x, y) === TILE.WATER && SEA[Math.floor(y / SCALE) * CELLS + Math.floor(x / SCALE)] === 1;
}

// From a gate, straight out: how many tiles to the sea (null = too far).
function seaDistance(gate, far) {
  for (let step = 2; step <= far; step++) {
    if (isSea(gate.x + 1 + gate.dx * step, gate.y + 1 + gate.dy * step)) return step;
  }
  return null;
}

function buildPier(village, gate, distance) {
  const side = gate.dx === 0 ? { x: 1, y: 0 } : { x: 0, y: 1 };
  const start = { x: gate.x + gate.dx + side.x, y: gate.y + gate.dy + side.y };
  const shore = { x: gate.x + 1 + gate.dx * (distance - 1), y: gate.y + 1 + gate.dy * (distance - 1) };
  paveLine(start, shore, 2, isBuiltPlace);
  let end = shore;
  for (let step = 1; step <= 9; step++) {
    const x = shore.x + gate.dx * step;
    const y = shore.y + gate.dy * step;
    if (!isSea(x, y) && !isSea(x + side.x, y + side.y)) break;
    setTile(x, y, TILE.BRIDGE);
    setTile(x + side.x, y + side.y, TILE.BRIDGE);
    end = { x: x, y: y };
  }
  return { village: village.id, name: village.name, x: end.x + gate.dx * 2, y: end.y + gate.dy * 2, landing: { x: end.x, y: end.y } };
}

function buildPorts() {
  const ports = [];
  for (const village of VILLAGES) {
    const far = village.kingdom === 'isles' || village.id === 'port' || village.kind === 'capital' ? 200 : 70;
    const options = village.plan.gates.map((gate) => ({ gate: gate, distance: seaDistance(gate, far) })).filter((option) => option.distance !== null);
    if (options.length === 0) continue;
    const best = options.reduce((a, b) => (b.distance < a.distance ? b : a));
    ports.push(buildPier(village, best.gate, best.distance));
  }
  return ports;
}

// ---------- The things of the wild ----------

// The ground around a thing of the wild is cleared (no tree on an obelisk).
function clearAround(x, y, radius) {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const tile = getTile(x + dx, y + dy);
      if ([TILE.TREE, TILE.ROCK, TILE.DEAD_TREE, TILE.CLIFF].includes(tile) || (tile === TILE.WATER && dx * dx + dy * dy <= 2)) setTile(x + dx, y + dy, bareGround(natureBiome(x + dx, y + dy)));
    }
  }
}

function clearWildPlaces() {
  WILD_PROPS.forEach((prop) => clearAround(prop.x, prop.y, 2));
  WILD_HOMES.forEach((home) => clearAround(home.x, home.y, 4));
  WILD_STRUCTURES.forEach((s) => clearAround(s.x, s.y, 3));
}

// ---------- Everything ----------

function buildMap() {
  SETTLED.forEach(buildSettlement);
  clearWildPlaces();
  buildStructures();
  const roadCells = buildRoads();
  const ports = buildPorts();
  buildInsides();
  return { ports: ports, roadCells: roadCells };
}

const BUILT = buildMap();
export const PORTS = BUILT.ports;
export const ROAD_CELLS = BUILT.roadCells; // the cells of the painting with a road (a Set of cy * 256 + cx)

// ---------- The things standing on the map, sorted by blocks (to find the ones near a place, fast) ----------

const BLOCK = 32;

function blockKey(bx, by) {
  return by * 1000 + bx;
}

function sortInBlocks(props) {
  const blocks = new Map();
  for (const prop of props) {
    for (let by = Math.floor(prop.y / BLOCK); by <= Math.floor((prop.y + prop.h - 1) / BLOCK); by++) {
      for (let bx = Math.floor(prop.x / BLOCK); bx <= Math.floor((prop.x + prop.w - 1) / BLOCK); bx++) {
        const key = blockKey(bx, by);
        if (!blocks.has(key)) blocks.set(key, []);
        blocks.get(key).push(prop);
      }
    }
  }
  return blocks;
}

const FIXED_PROPS = [...PROPS, ...STRUCTURE_PROPS, ...INSIDE_PROPS];
const FIXED_BLOCKS = sortInBlocks(FIXED_PROPS);

// The tiles covered by a prop that is not walkable.
function blockedTiles(props) {
  const blocked = new Set();
  for (const prop of props) {
    if (prop.walkable) continue;
    for (let y = prop.y; y < prop.y + prop.h; y++) {
      for (let x = prop.x; x < prop.x + prop.w; x++) blocked.add(y * MAP_WIDTH + x);
    }
  }
  return blocked;
}

const BLOCKED = blockedTiles(FIXED_PROPS);

// ---------- What changes during a game ----------

// Tiles that a game changed (a bridge built by a village): index -> tile. Set by the rules (logic/villages.js).
const overrides = new Map();
// Tiles blocked by things that move or change (a boulder, a closed gate, the walls of a village): index -> true.
let dynamicBlocked = new Set();
// The props that change with the game (the walls of the villages, the gates of the puzzles...).
let dynamicProps = [];
let dynamicBlocks = new Map();
let mapRevision = 1;

export function bumpMapRevision() {
  mapRevision += 1;
}

export function getMapRevision() {
  return mapRevision;
}

export function setOverrides(list) {
  overrides.clear();
  for (const item of list) overrides.set(item.y * MAP_WIDTH + item.x, item.tile);
  mapRevision += 1;
}

// props: [{ kind, x, y, w, h }] that block (unless walkable), blockers: [{ x, y }] more tiles that block.
export function setDynamic(props, blockers) {
  dynamicProps = props;
  dynamicBlocks = sortInBlocks(props);
  dynamicBlocked = blockedTiles(props);
  for (const item of blockers) dynamicBlocked.add(item.y * MAP_WIDTH + item.x);
  mapRevision += 1;
}

// Every prop of the world right now (a long list: prefer propsInArea).
export function allProps() {
  return dynamicProps.length > 0 ? [...FIXED_PROPS, ...dynamicProps] : FIXED_PROPS;
}

// The props that touch an area of tiles (left, top included; right, bottom excluded).
export function propsInArea(left, top, right, bottom) {
  const found = new Set();
  for (let by = Math.floor(top / BLOCK); by <= Math.floor((bottom - 1) / BLOCK); by++) {
    for (let bx = Math.floor(left / BLOCK); bx <= Math.floor((right - 1) / BLOCK); bx++) {
      for (const blocks of [FIXED_BLOCKS, dynamicBlocks]) {
        for (const prop of blocks.get(blockKey(bx, by)) || []) {
          if (prop.x < right && prop.x + prop.w > left && prop.y < bottom && prop.y + prop.h > top) found.add(prop);
        }
      }
    }
  }
  return [...found];
}

// The props around a point (their middle closer than `range` tiles).
export function propsAround(x, y, range) {
  return propsInArea(Math.floor(x - range - 4), Math.floor(y - range - 4), Math.ceil(x + range + 4), Math.ceil(y + range + 4)).filter((prop) => Math.hypot(prop.x + prop.w / 2 - x, prop.y + prop.h / 2 - y) < range);
}

// ---------- Reading the map ----------

// The tile at (x, y). Outside the island: water. Outside the insides: nothing.
export function tileAt(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const index = ty * MAP_WIDTH + tx;
  if (overrides.size > 0 && overrides.has(index)) return overrides.get(index);
  return getTile(tx, ty);
}

export function isSolid(x, y) {
  if (SOLID_TILES.includes(tileAt(x, y))) return true;
  const index = Math.floor(y) * MAP_WIDTH + Math.floor(x);
  return BLOCKED.has(index) || dynamicBlocked.has(index);
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

// The chests: in the dungeons and the caves. [{ x, y, key, zone }]
export const CHESTS = INSIDE_CHESTS;

// The treasures buried in the wild: the player must dig to find them. [{ x, y, key, danger }]
// About one in 50 cells of the painting hides one (somewhere in its 10 x 10 tiles).
function findTreasures() {
  const treasures = [];
  for (let cy = 2; cy < CELLS - 2; cy++) {
    for (let cx = 2; cx < CELLS - 2; cx++) {
      if (noise(cx, cy, 1) >= 0.02) continue;
      const x = cx * SCALE + Math.floor(noise(cx, cy, 2) * SCALE);
      const y = cy * SCALE + Math.floor(noise(cx, cy, 3) * SCALE);
      const zone = zoneAt(x, y);
      if (zone.kind === 'land' && !isSolid(x, y)) treasures.push({ x: x, y: y, key: x + ',' + y, danger: zone.danger });
    }
  }
  return treasures;
}

export const TREASURES = findTreasures();
export { MAP_HEIGHT };
