import { ZONES, HOUSES, FIELD, ROADS, zoneAt } from '../data/zones';

// The map is a grid of tiles. It is always built the same way (no real random), so it is never saved.
export const MAP_SIZE = 120;

export const TILE = {
  GRASS: 0,
  FLOWER: 1,
  PATH: 2,
  SAND: 3,
  WATER: 4,
  TREE: 5,
  ROCK: 6,
  STONE: 7, // the ground of the mountains
  ASH: 8, // the ground of the demon land
  LAVA: 9,
  DEAD_TREE: 10,
  WALL: 11,
  FLOOR: 12, // the ground of the dungeons
  ROOF: 13,
  HOUSE: 14, // the front wall of a house
  DOOR: 15,
  SOIL: 16, // the field: carrots grow here
};

// The tiles nobody can walk on.
const SOLID = [TILE.WATER, TILE.TREE, TILE.ROCK, TILE.LAVA, TILE.DEAD_TREE, TILE.WALL, TILE.ROOF, TILE.HOUSE, TILE.DOOR];

// The ground under a tree, a rock... (to draw it under them).
const GROUND_OF_BIOME = { demon: TILE.ASH, mountain: TILE.STONE, coast: TILE.SAND, dungeon: TILE.FLOOR };

// A "random" number between 0 and 1 that is always the same for the same tile.
export function noise(x, y, salt = 0) {
  let n = Math.imul(x + salt * 7919, 374761393) + Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function isInLake(x, y) {
  const dx = (x - 101) / 12;
  const dy = (y - 60) / 9;
  return dx * dx + dy * dy < 1;
}

// The tile of the wild land at (x, y), before the villages, dungeons and roads are added.
function landTile(x, y) {
  if (x < 2 || y < 2 || x > MAP_SIZE - 3 || y > MAP_SIZE - 3) return TILE.WATER; // the sea around the island
  const biome = zoneAt(x, y).biome;
  const r = noise(x, y);

  if (biome === 'village') return r < 0.08 ? TILE.FLOWER : TILE.GRASS;
  if (biome === 'dungeon') return TILE.FLOOR;
  if (biome === 'forest') return r < 0.26 ? TILE.TREE : r < 0.32 ? TILE.FLOWER : TILE.GRASS;
  if (biome === 'mountain') return r < 0.18 ? TILE.ROCK : TILE.STONE;
  if (biome === 'demon') return r < 0.05 ? TILE.LAVA : r < 0.14 ? TILE.DEAD_TREE : TILE.ASH;
  if (biome === 'coast') return r < 0.04 ? TILE.ROCK : TILE.SAND;
  if (biome === 'lake' && isInLake(x, y)) return TILE.WATER;
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

// A road never destroys a building or a dungeon wall: it only replaces the nature.
function canBeRoad(tile) {
  return ![TILE.WALL, TILE.FLOOR, TILE.ROOF, TILE.HOUSE, TILE.DOOR, TILE.SOIL].includes(tile);
}

function buildRoad(tiles, road) {
  const isVertical = road.x1 === road.x2;
  const w = isVertical ? 2 : road.x2 - road.x1 + 2;
  const h = isVertical ? road.y2 - road.y1 + 2 : 2;
  for (let y = road.y1; y < road.y1 + h; y++) {
    for (let x = road.x1; x < road.x1 + w; x++) {
      if (canBeRoad(tiles[y * MAP_SIZE + x])) setTile(tiles, x, y, TILE.PATH);
    }
  }
}

function buildMap() {
  const tiles = new Uint8Array(MAP_SIZE * MAP_SIZE);
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) setTile(tiles, x, y, landTile(x, y));
  }
  for (const zone of ZONES) {
    if (zone.kind === 'dungeon') buildDungeon(tiles, zone);
    if (zone.kind === 'castle') buildCastle(tiles, zone);
  }
  HOUSES.forEach((house) => buildHouse(tiles, house));
  fillRect(tiles, FIELD.x, FIELD.y, FIELD.w, FIELD.h, TILE.SOIL);
  ROADS.forEach((road) => buildRoad(tiles, road));
  return tiles;
}

export const MAP = buildMap();

// The tile at (x, y). Outside the map: water.
export function tileAt(x, y) {
  if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) return TILE.WATER;
  return MAP[Math.floor(y) * MAP_SIZE + Math.floor(x)];
}

export function isSolid(x, y) {
  return SOLID.includes(tileAt(x, y));
}

// The ground to draw under a tile (a tree stands on grass, a dead tree on ash...).
export function groundAt(x, y) {
  return GROUND_OF_BIOME[zoneAt(x, y).biome] || TILE.GRASS;
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
