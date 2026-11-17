import { WORLD_SIZE, INSIDE_TOP, MAP_HEIGHT, SCALE, CELLS, SLOT_W, SLOT_H, SLOTS_PER_ROW } from '../world/size';
import { natureAt } from '../world/ground';
import { SETTLEMENTS, kingdomOfCell } from '../world/places';
import { planTown } from '../world/townPlan';
import { planMonsterTown, planCamp } from '../world/wildPlans';
import { CAVES, TOTEMS, WILD_OBELISKS, WILD_HOMES, WILD_CAMPFIRES, WILD_STRUCTURES, WILD_STRUCTURE_PROPS } from '../world/wildPlaces';
import { landOfTile } from '../world/regions';
import { LANDS } from './lands';
import { STORY_DUNGEONS, DOOR_FROM_BOTTOM } from './dungeons';
import { KINGDOMS } from './kingdoms';
import { STRUCTURES_50, STRUCTURE_BY_ID } from './structures50';

// The world: an island of 2560 x 2560 tiles, from the painting art/MAP2.png (see world/size.js, world/ground.js).
// Under it, out of sight, the INSIDES: the floors of the dungeons and of the caves, the home of the player.
//
// A zone = a named place. The villages, the dungeons and the insides are rectangles (x, y = the top-left tile).
// The lands have no border: a tile belongs to the land whose middle is the closest (see world/regions.js).
// The kingdoms: the land around each capital (see world/places.js).
// danger: 0 = safe ... 4 = the demon island. species: the monsters that appear there. text: for the world map.

export { WORLD_SIZE, INSIDE_TOP, MAP_HEIGHT, LANDS };

// ---------- The villages, the villages of monsters, the camps of bandits ----------
// Each one: { id, name, kind, kingdom, x, y, w, h, founded, roof, rivals, plan } (see world/places.js and
// world/townPlan.js for the plan: streets, square, houses, fields, pens, props, gates).

export const VILLAGES = SETTLEMENTS.people.map((place) => ({ ...place, plan: planTown(place) }));
export const MONSTER_TOWNS = SETTLEMENTS.monsters.map((place) => ({ ...place, plan: planMonsterTown(place) }));
export const CAMPS = SETTLEMENTS.camps.map((place) => ({ ...place, plan: planCamp(place) }));
export const SETTLED = [...VILLAGES, ...MONSTER_TOWNS, ...CAMPS];

// The levels of a village: what its walls are made of. A village goes up a level when it has the resources.
export const VILLAGE_LEVELS = [
  { name: 'a camp', wall: null, needs: null },
  { name: 'a village', wall: 'palisade', needs: { wood: 40 } },
  { name: 'a fortified village', wall: 'wall', needs: { stone: 60, wood: 20 } },
];
export const BRIDGE_NEEDS = { wood: 30 }; // a village also builds a bridge over the river near it

// ---------- The dungeons: a building outside, floors inside ----------
// The dungeons of the story (data/dungeons.js) and the caves of the wild (world/wildPlaces.js).
// door: [x, y] the tile of its door (stairs).

function positioned(dungeon) {
  const x = Math.round(dungeon.x * SCALE - dungeon.w / 2);
  const y = Math.round(dungeon.y * SCALE - dungeon.h / 2);
  return { ...dungeon, x: x, y: y };
}

function withDoor(dungeon) {
  return { ...dungeon, door: [dungeon.x + Math.floor(dungeon.w / 2) - 1, dungeon.y + dungeon.h - DOOR_FROM_BOTTOM[dungeon.look]] };
}

export const DUNGEONS = [...STORY_DUNGEONS.map(positioned), ...CAVES].map(withDoor);

// ---------- The bridge to the demon island, sealed until the General falls ----------

// Straight south of the gate of the castle: the first water is the moat. The bridge crosses it.
function findIsleBridge() {
  const castle = DUNGEONS.find((dungeon) => dungeon.id === 'castle');
  const x = castle.door[0] - 1;
  let y = castle.y + castle.h;
  while (y < WORLD_SIZE && natureAt(x, y) !== 4) y++; // 4 = water
  const top = y;
  while (y < WORLD_SIZE && [natureAt(x, y), natureAt(x + 3, y)].includes(4)) y++;
  return { x: x, y: top, w: 4, h: y - top, road: { x: x + 1, from: castle.door[1] + 1, to: top } };
}

export const ISLE_BRIDGE = findIsleBridge();
export const SEALS = [{ x: ISLE_BRIDGE.x, y: ISLE_BRIDGE.y + ISLE_BRIDGE.h - 1, w: 4, h: 1, until: 'general', text: 'Red runes seal the bridge of the Silent Isle. Only the fall of General Barbarism can break them.' }];

// ---------- The insides ----------
// Each one is a room of the INSIDE band, out of the island: { id, name, x, y, w, h, theme, kind }.
// They are made by world/insides.js.

function slot(index) {
  return { x: 3 + (index % SLOTS_PER_ROW) * SLOT_W, y: INSIDE_TOP + 2 + Math.floor(index / SLOTS_PER_ROW) * SLOT_H };
}

function floorSize(dungeon) {
  if (dungeon.look === 'tower') return { w: 15, h: 15 };
  if (dungeon.id === 'castle') return { w: 46, h: 34 };
  if (dungeon.wild) return { w: 34, h: 26 };
  return { w: 40, h: 30 };
}

function insidesOf() {
  const list = [
    { id: 'home', name: 'Your home', kind: 'home', theme: 'home', ...slot(0), w: 14, h: 10, safe: true },
    { id: 'visitHouse', name: 'Village House', kind: 'houseVisit', theme: 'home', ...slot(1), w: 22, h: 16, safe: true },
  ];
  for (const dungeon of DUNGEONS) {
    for (let floor = 1; floor <= dungeon.floors; floor++) {
      list.push({ id: dungeon.id + '-' + floor, name: dungeon.name + (dungeon.floors > 1 ? ' · floor ' + floor : ''), kind: 'floor', dungeon: dungeon.id, floor: floor, theme: dungeon.theme, ...slot(list.length), ...floorSize(dungeon) });
    }
  }
  return list;
}

export const INSIDES = insidesOf();

// ---------- Finding the zone of a tile ----------

function isInside(rect, x, y) {
  return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

const VILLAGE_ZONES = VILLAGES.map((village) => ({ ...village, kind: 'village', biome: 'village', danger: 0, species: [], label: [village.x + village.w / 2, village.y - 4] }));
const MONSTER_ZONES = MONSTER_TOWNS.map((town) => ({ ...town, kind: 'monsterTown', biome: 'village', danger: Math.max(2, landOfTile(town.x, town.y).danger), species: [town.species], label: [town.x + town.w / 2, town.y - 3] }));
const CAMP_ZONES = CAMPS.map((camp) => ({ ...camp, kind: 'camp', biome: 'village', danger: 2, species: [], label: [camp.x + camp.w / 2, camp.y - 3] }));
const DUNGEON_ZONES = DUNGEONS.map((dungeon) => ({ ...dungeon, kind: dungeon.id === 'castle' ? 'castle' : 'dungeon', biome: 'dungeon', species: [] }));
const INSIDE_ZONES = INSIDES.map((inside) => ({ ...inside, kind: 'inside', biome: 'dungeon', danger: inside.safe ? 0 : 3, species: [] }));
const LAND_ZONES = LANDS.map((land) => ({ ...land, kind: 'land', label: [land.x * SCALE, land.y * SCALE] }));
const VOID_ZONE = { id: 'void', name: '', kind: 'inside', biome: 'dungeon', danger: 0, species: [], x: 0, y: INSIDE_TOP, w: WORLD_SIZE, h: MAP_HEIGHT - INSIDE_TOP };

// Every zone, the places first (the world map writes their names).
export const ZONES = [...VILLAGE_ZONES, ...MONSTER_ZONES, ...CAMP_ZONES, ...DUNGEON_ZONES, ...LAND_ZONES, ...INSIDE_ZONES];

// The places of the island, sorted by the cells of the painting they cover (to find them fast).
const PLACES_OF_CELL = new Map();
for (const zone of [...VILLAGE_ZONES, ...MONSTER_ZONES, ...CAMP_ZONES, ...DUNGEON_ZONES]) {
  for (let cy = Math.floor(zone.y / SCALE); cy <= Math.floor((zone.y + zone.h) / SCALE); cy++) {
    for (let cx = Math.floor(zone.x / SCALE); cx <= Math.floor((zone.x + zone.w) / SCALE); cx++) {
      const key = cy * CELLS + cx;
      if (!PLACES_OF_CELL.has(key)) PLACES_OF_CELL.set(key, []);
      PLACES_OF_CELL.get(key).push(zone);
    }
  }
}

const LAND_ZONE_OF = Object.fromEntries(LAND_ZONES.map((zone) => [zone.id, zone]));
const INSIDE_OF_SLOT = new Map(INSIDE_ZONES.map((zone) => [Math.floor((zone.y - INSIDE_TOP - 2) / SLOT_H) * SLOTS_PER_ROW + Math.floor((zone.x - 3) / SLOT_W), zone]));

function insideZoneAt(x, y) {
  const zone = INSIDE_OF_SLOT.get(Math.floor((y - INSIDE_TOP - 2) / SLOT_H) * SLOTS_PER_ROW + Math.floor((x - 3) / SLOT_W));
  return zone && isInside(zone, x, y) ? zone : VOID_ZONE;
}

export function zoneAt(x, y) {
  x = Math.floor(x);
  y = Math.floor(y);
  if (y >= INSIDE_TOP) return insideZoneAt(x, y);
  const places = PLACES_OF_CELL.get(Math.floor(y / SCALE) * CELLS + Math.floor(x / SCALE));
  const place = places && places.find((zone) => isInside(zone, x, y));
  return place || LAND_ZONE_OF[landOfTile(x, y).id];
}

export function zoneOf(id) {
  return ZONES.find((zone) => zone.id === id);
}

export function villageOf(id) {
  return VILLAGES.find((village) => village.id === id) || null;
}

export function dungeonOf(id) {
  return DUNGEONS.find((dungeon) => dungeon.id === id);
}

export function insideOf(id) {
  return INSIDES.find((inside) => inside.id === id);
}

// The kingdom a tile belongs to (null: the demon island, the sea).
export function kingdomAt(x, y) {
  const id = kingdomOfCell(x / SCALE, y / SCALE);
  return KINGDOMS.find((kingdom) => kingdom.id === id) || null;
}

// Is this tile in the insides (a floor of a dungeon, a cave, the home)?
export function isInsideWorld(y) {
  return y >= INSIDE_TOP;
}

export function centerOf(zone) {
  return { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2 };
}

// Where the name of a zone is written on the world map.
export function labelOf(zone) {
  return zone.label ? { x: zone.label[0], y: zone.label[1] } : centerOf(zone);
}

// ---------- The houses and the things of the villages, on the map ----------

// The size of a house, in tiles: { w, h }.
export function houseSize(house) {
  return { w: house.w, h: house.h };
}

// Every house of the world (and the tents of the monsters and of the bandits):
// { x, y, w, h, role, size, style, roof, sign, village }.
export const HOUSES = SETTLED.flatMap((place) => place.plan.houses);

// The halls, the churches and the palaces have a double door.
export function hasDoubleDoor(house) {
  return ['hall', 'church', 'palace'].includes(house.size);
}

// The house of a role in a village (null = none).
export function houseOf(villageId, role) {
  return HOUSES.find((house) => house.village === villageId && house.role === role) || null;
}

// The door of a house: the tile in the middle of its front wall (the left one of a double door).
export function doorOf(house) {
  return { x: house.x + Math.floor(house.w / 2) - (hasDoubleDoor(house) ? 1 : 0), y: house.y + house.h - 1 };
}

const HOUSES_BY_DOOR = new Map();
for (const house of HOUSES) {
  if (house.style === 'tent' || (house.village === 'lexia' && house.role === 'home')) continue;
  const door = doorOf(house);
  HOUSES_BY_DOOR.set(door.x + ',' + door.y, house);
  if (hasDoubleDoor(house)) HOUSES_BY_DOOR.set(door.x + 1 + ',' + door.y, house);
}

export function houseAtDoor(x, y) {
  return HOUSES_BY_DOOR.get(Math.floor(x) + ',' + Math.floor(y)) || null;
}

// The home of the player and where they wake up: in front of its door.
const HOME = houseOf('lexia', 'home');
export const HOME_DOOR = doorOf(HOME);
export const SPAWN = { x: HOME_DOOR.x + 0.5, y: HOME_DOOR.y + 1.5 };

// Where someone of the story lives (see `at` in data/npcs.js): the tile in front of their door: { x, y }.
// at: [village, building, a step to the right] | [village, 'gate'] | ['wild', home] | null (a wanderer).
export function spotOf(at) {
  if (!at) return { x: 0, y: 0 };
  const [villageId, place, step = 0] = at;
  if (villageId === 'wild') {
    const home = WILD_HOMES.find((item) => item.id === place);
    return { x: home.x + 0.5, y: home.y + 1.5 };
  }
  if (place === 'gate') {
    const gate = villageOf(villageId).plan.gates.find((item) => item.dy === -1);
    return { x: gate.x + 1.5 + step, y: gate.y + 3.5 };
  }
  const door = doorOf(houseOf(villageId, place));
  return { x: door.x + 0.5 + step, y: door.y + 1.5 };
}

// The fields (soil), the pens, the squares and the streets of the villages, on the map.
export const FIELDS = VILLAGES.flatMap((village) => village.plan.fields);
export const PENS = VILLAGES.flatMap((village) => village.plan.pens);
export const PLAZAS = SETTLED.filter((place) => place.plan.square).map((place) => ({ ...place.plan.square, village: place.id }));
export const VILLAGE_ROADS = VILLAGES.flatMap((village) => village.plan.roads.map((road) => ({ ...road, village: village.id })));

// The fences around the pens: one piece per tile of their border (the animals stay inside).
function fencesOf(pen) {
  const fences = [];
  for (let x = pen.x - 1; x <= pen.x + pen.w; x++) {
    fences.push({ kind: 'fence', x: x, y: pen.y - 1, w: 1, h: 1 });
    fences.push({ kind: 'fence', x: x, y: pen.y + pen.h, w: 1, h: 1 });
  }
  for (let y = pen.y; y < pen.y + pen.h; y++) {
    fences.push({ kind: 'fence', x: pen.x - 1, y: y, w: 1, h: 1, side: 'column' });
    if (y !== pen.y + 1) fences.push({ kind: 'fence', x: pen.x + pen.w, y: y, w: 1, h: 1, side: 'column' }); // a gate on the right
  }
  return fences;
}

// The things of the wild: obelisks, grey totems, campfires, Isekai structures, the lonely homes.
export const WILD_PROPS = [...WILD_OBELISKS, ...TOTEMS, ...WILD_CAMPFIRES, ...WILD_STRUCTURE_PROPS, ...WILD_HOMES.map((home) => ({ kind: home.prop, x: home.x + 2, y: home.y - 1, w: home.prop === 'hut' ? 2 : 1, h: 1, home: home.id }))];
export { WILD_HOMES, WILD_STRUCTURES, STRUCTURES_50, STRUCTURE_BY_ID };

// The things standing on the ground that never change: nobody walks through them.
// (The walls of the villages change with their level: see logic/villages.js.)
export const PROPS = [...SETTLED.flatMap((place) => place.plan.props), ...PENS.flatMap(fencesOf), ...WILD_PROPS];
