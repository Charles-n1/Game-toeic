import { ZONES, HOUSES, FIELD, ROADS, PLAZAS, PROPS, RIVERS, WORLD_SIZE, zoneAt } from '../data/zones';
import { noise, smoothNoise } from './noise';

export { noise };

// The map is a grid of tiles. It is always built the same way (no real random), so it is never saved.
export const MAP_SIZE = WORLD_SIZE;

export const TILE = {
  GRASS: 0,
  FLOWER: 1,
  PATH: 2,
  SAND: 3,
  WATER: 4,
  TREE: 5,
  ROCK: 6,
  STONE: 7, // the ground of the mountains (snow)
  ASH: 8, // the ground of the demon land
  LAVA: 9,
  DEAD_TREE: 10,
  WALL: 11,
  FLOOR: 12, // the ground of the dungeons
  ROOF: 13,
  HOUSE: 14, // the front wall of a house
  DOOR: 15,
  SOIL: 16, // the field: carrots grow here
  BRIDGE: 17, // where a road crosses the water
};

// The tiles nobody can walk on.
const SOLID = [TILE.WATER, TILE.TREE, TILE.ROCK, TILE.LAVA, TILE.DEAD_TREE, TILE.WALL, TILE.ROOF, TILE.HOUSE, TILE.DOOR];

// The sea: 2 to 11 tiles from the edge of the world, never the same distance (a wavy coast with bays).
// It never comes into a village or a dungeon.
function isSea(x, y) {
  const fromEdge = Math.min(x, y, MAP_SIZE - 1 - x, MAP_SIZE - 1 - y);
  const depth = 2 + smoothNoise(x, y, 12, 3) * 7 + smoothNoise(x, y, 5, 4) * 2;
  return zoneAt(x, y).kind === 'land' && fromEdge < depth;
}

function isInLake(x, y) {
  const dx = (x - 101) / 12;
  const dy = (y - 60) / 9;
  return dx * dx + dy * dy < 1;
}

// The tile of the wild land at (x, y), before the villages, dungeons and roads are added.
function landTile(x, y) {
  if (isSea(x, y) || isInLake(x, y)) return TILE.WATER;
  const biome = zoneAt(x, y).biome;
  const r = noise(x, y);

  if (biome === 'village') return r < 0.08 ? TILE.FLOWER : TILE.GRASS;
  if (biome === 'dungeon') return TILE.FLOOR;
  if (biome === 'forest') return r < 0.26 ? TILE.TREE : r < 0.32 ? TILE.FLOWER : TILE.GRASS;
  if (biome === 'mountain') return r < 0.07 ? TILE.TREE : r < 0.16 ? TILE.ROCK : TILE.STONE; // pines, rocks, snow
  if (biome === 'demon') return r < 0.05 ? TILE.LAVA : r < 0.14 ? TILE.DEAD_TREE : TILE.ASH;
  if (biome === 'coast') return r < 0.04 ? TILE.ROCK : TILE.SAND;
  if (biome === 'desert') return r < 0.04 ? TILE.TREE : r < 0.08 ? TILE.ROCK : TILE.SAND; // cacti, rocks, sand
  if (biome === 'plains') return r < 0.03 ? TILE.TREE : r < 0.2 ? TILE.FLOWER : TILE.GRASS;
  return r < 0.05 ? TILE.TREE : r < 0.12 ? TILE.FLOWER : TILE.GRASS; // meadow, and the shore of the lake
}

function setTile(tiles, x, y, tile) {
  tiles[y * MAP_SIZE + x] = tile;
}

function fillRect(tiles, x, y, w, h, tile) {
  for (let row = y; row < y + h; row++) {
    for (let column = x; column < x + w; column++) setTile(tiles, column, row, tile);
  }
}

// A snake dungeon: walls around, and inner walls with a hole at the top, then at the bottom, then at the top...
// The door is at the bottom-left, the boss is in the last room on the right.
function buildDungeon(tiles, zone) {
  fillRect(tiles, zone.x, zone.y, zone.w, zone.h, TILE.WALL);
  fillRect(tiles, zone.x + 1, zone.y + 1, zone.w - 2, zone.h - 2, TILE.FLOOR);
  let holeAtTop = true;
  for (let x = zone.x + 4; x < zone.x + zone.w - 1; x += 4) {
    const wallY = holeAtTop ? zone.y + 3 : zone.y + 1;
    fillRect(tiles, x, wallY, 1, zone.h - 4, TILE.WALL);
    holeAtTop = !holeAtTop;
  }
  fillRect(tiles, zone.x + 2, zone.y + zone.h - 1, 2, 1, TILE.FLOOR); // the door
}

// The castle of the Demon King: one big hall with pillars. The door is in the middle of the bottom wall.
function buildCastle(tiles, zone) {
  fillRect(tiles, zone.x, zone.y, zone.w, zone.h, TILE.WALL);
  fillRect(tiles, zone.x + 1, zone.y + 1, zone.w - 2, zone.h - 2, TILE.FLOOR);
  for (let y = zone.y + 4; y < zone.y + zone.h - 2; y += 3) {
    setTile(tiles, zone.x + 6, y, TILE.WALL);
    setTile(tiles, zone.x + zone.w - 7, y, TILE.WALL);
  }
  fillRect(tiles, zone.x + 10, zone.y + zone.h - 1, 2, 1, TILE.FLOOR); // the door
}

function buildHouse(tiles, house) {
  fillRect(tiles, house.x, house.y, 4, 2, TILE.ROOF);
  fillRect(tiles, house.x, house.y + 2, 4, 1, TILE.HOUSE);
  setTile(tiles, house.x + 1, house.y + 2, TILE.DOOR);
}

// A river: a line 2 tiles wide that follows its points, with small bends. It never goes through a village.
function buildRiver(tiles, points) {
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 4);
    for (let step = 0; step <= steps; step++) {
      const y = y0 + ((y1 - y0) * step) / steps;
      const x = x0 + ((x1 - x0) * step) / steps + (smoothNoise(x0, y, 5, 7) - 0.5) * 3;
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const tx = Math.floor(x) + dx;
        const ty = Math.floor(y) + dy;
        if (tx >= 0 && ty >= 0 && tx < MAP_SIZE && ty < MAP_SIZE && zoneAt(tx, ty).kind === 'land') setTile(tiles, tx, ty, TILE.WATER);
      }
    }
  }
}

// A road never destroys a building or a dungeon wall: it only replaces the nature. Over water: a bridge.
function canBeRoad(tile) {
  return ![TILE.WALL, TILE.FLOOR, TILE.ROOF, TILE.HOUSE, TILE.DOOR, TILE.SOIL].includes(tile);
}

function buildRoad(tiles, road) {
  const isVertical = road.x1 === road.x2;
  const w = isVertical ? 2 : road.x2 - road.x1 + 2;
  const h = isVertical ? road.y2 - road.y1 + 2 : 2;
  for (let y = road.y1; y < road.y1 + h; y++) {
    for (let x = road.x1; x < road.x1 + w; x++) {
      const tile = tiles[y * MAP_SIZE + x];
      if (canBeRoad(tile)) setTile(tiles, x, y, tile === TILE.WATER ? TILE.BRIDGE : TILE.PATH);
    }
  }
}

function buildMap() {
  const tiles = new Uint8Array(MAP_SIZE * MAP_SIZE);
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) setTile(tiles, x, y, landTile(x, y));
  }
  RIVERS.forEach((river) => buildRiver(tiles, river));
  for (const zone of ZONES) {
    if (zone.kind === 'dungeon') buildDungeon(tiles, zone);
    if (zone.kind === 'castle') buildCastle(tiles, zone);
  }
  HOUSES.forEach((house) => buildHouse(tiles, house));
  fillRect(tiles, FIELD.x, FIELD.y, FIELD.w, FIELD.h, TILE.SOIL);
  PLAZAS.forEach((plaza) => fillRect(tiles, plaza.x, plaza.y, plaza.w, plaza.h, TILE.PATH));
  ROADS.forEach((road) => buildRoad(tiles, road));
  return tiles;
}

export const MAP = buildMap();

// The tiles covered by a prop (a fountain, a lamp...). The ground under them does not change: a lamp on a
// cobblestone square still stands on cobblestones. 1 = blocked.
function buildBlocked() {
  const blocked = new Uint8Array(MAP_SIZE * MAP_SIZE);
  for (const prop of PROPS) {
    for (let y = prop.y; y < prop.y + prop.h; y++) {
      for (let x = prop.x; x < prop.x + prop.w; x++) blocked[y * MAP_SIZE + x] = 1;
    }
  }
  return blocked;
}

const BLOCKED = buildBlocked();

// The tile at (x, y). Outside the map: water.
export function tileAt(x, y) {
  if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) return TILE.WATER;
  return MAP[Math.floor(y) * MAP_SIZE + Math.floor(x)];
}

export function isSolid(x, y) {
  if (SOLID.includes(tileAt(x, y))) return true;
  return BLOCKED[Math.floor(y) * MAP_SIZE + Math.floor(x)] === 1;
}

// ---------- Fixed things placed on the map ----------

// The guards and the boss of a dungeon: [{ species, x, y, key }]. key: a name to remember who is dead.
export function dungeonMonsters(zone) {
  if (zone.kind === 'castle') {
    const middle = zone.x + zone.w / 2;
    return [
      { species: zone.guard, x: zone.x + 3.5, y: zone.y + 9.5, key: zone.id + ':1' },
      { species: zone.guard, x: zone.x + zone.w - 3.5, y: zone.y + 9.5, key: zone.id + ':2' },
      { species: zone.guard, x: middle - 3, y: zone.y + 6.5, key: zone.id + ':3' },
      { species: zone.guard, x: middle + 3, y: zone.y + 6.5, key: zone.id + ':4' },
      { species: zone.boss, x: middle, y: zone.y + 3, key: zone.id + ':boss' },
    ];
  }
  return [
    { species: zone.guard, x: zone.x + 6.5, y: zone.y + 5.5, key: zone.id + ':1' },
    { species: zone.guard, x: zone.x + 10.5, y: zone.y + 5.5, key: zone.id + ':2' },
    { species: zone.boss, x: zone.x + zone.w - 2.5, y: zone.y + zone.h - 3.5, key: zone.id + ':boss' },
  ];
}

// The chest at the end of each dungeon: [{ x, y, key, zone }]
export const CHESTS = ZONES.filter((zone) => zone.kind === 'dungeon').map((zone) => ({
  x: zone.x + zone.w - 2,
  y: zone.y + zone.h - 2,
  key: zone.id,
  zone: zone,
}));

// The treasures buried in the wild: the player must dig to find them. [{ x, y, key, danger }]
function findTreasures() {
  const treasures = [];
  for (let y = 4; y < MAP_SIZE - 4; y++) {
    for (let x = 4; x < MAP_SIZE - 4; x++) {
      const zone = zoneAt(x, y);
      if (zone.kind === 'land' && !isSolid(x, y) && noise(x, y, 1) < 0.004) {
        treasures.push({ x: x, y: y, key: x + ',' + y, danger: zone.danger });
      }
    }
  }
  return treasures;
}

export const TREASURES = findTreasures();
