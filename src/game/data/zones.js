// The world: an island of 256 x 256 tiles, painted in art/MAP.png (see tools/build_world.py and world/map.js).
// Under it, out of sight, the INSIDES: the floors of the dungeons, the mines and the home of the player.
//
// A zone = a named place. The villages, the dungeons and the insides are rectangles (x, y = top-left tile).
// The lands have no border: a tile belongs to the land whose middle (x, y) is the closest (see zoneAt).
// danger: 0 = safe ... 4 = the demon island. species: the monsters that appear there.
// text: what the world map says about it.

export const WORLD_SIZE = 256; // the island
export const INSIDE_TOP = 260; // the first row of the insides
export const MAP_HEIGHT = 460; // the island + the insides

// ---------- The lands ----------

export const LANDS = [
  { id: 'demon', name: 'The Silent Isle', biome: 'demon', x: 40, y: 32, danger: 4, species: ['darkKnight', 'shadowMage', 'drake', 'cultist'], text: 'An island of ash and lava. Only one bridge reaches it, sealed by red runes.' },
  { id: 'mountain', name: 'Frostpeak Pass', biome: 'mountain', x: 172, y: 26, danger: 3, species: ['iceGolem', 'wolf', 'harpy'], text: 'Snow, pines and a frozen castle where time goes wrong.' },
  { id: 'crystal', name: 'Crystal Coast', biome: 'forest', x: 222, y: 96, danger: 2, species: ['spider', 'harpy', 'lizardman'], text: 'Cliffs and blue crystals. A cave sings under them.' },
  { id: 'forest', name: 'Verbwood', biome: 'forest', x: 34, y: 86, danger: 2, species: ['wolf', 'goblin', 'orc', 'mushroom'], text: 'Old trees around Greendale. Goblins hunt here.' },
  { id: 'heartwood', name: 'Heartwood', biome: 'forest', x: 118, y: 76, danger: 2, species: ['wolf', 'goblin', 'spider', 'mushroom'], text: 'The deep forest north of Eldermoor.' },
  { id: 'meadow', name: 'Whisper Meadow', biome: 'meadow', x: 100, y: 104, danger: 1, species: ['slime', 'rat', 'mushroom'], text: 'Soft hills around Eldermoor. The first monsters: slimes and rats.' },
  { id: 'lake', name: 'Riverlands', biome: 'meadow', x: 134, y: 112, danger: 2, species: ['lizardman', 'slime', 'drowner'], text: 'Rivers everywhere. The lizardmen fish here, the drowners wait.' },
  { id: 'oldwood', name: 'The Old Stones', biome: 'forest', x: 168, y: 110, danger: 3, species: ['skeleton', 'wraith', 'banshee', 'mimic'], text: 'Broken towers in the forest, around the Ancient Ruins.' },
  { id: 'coast', name: 'Comma Coast', biome: 'coast', x: 224, y: 152, danger: 1, species: ['slime', 'drowner', 'harpy'], text: 'Sand, wind and the sea, around Seabridge.' },
  { id: 'desert', name: 'Sunscorch Desert', biome: 'desert', x: 48, y: 176, danger: 2, species: ['rat', 'lizardman', 'goblin', 'orc'], text: 'Sand and mesas. The bandits of the General hide here.' },
  { id: 'teeth', name: 'The Ashen Teeth', biome: 'desert', x: 30, y: 240, danger: 3, species: ['orc', 'drake', 'stoneGolem'], text: 'Sharp mountains at the south of the desert.' },
  { id: 'woods', name: 'Whispering Woods', biome: 'forest', x: 124, y: 186, danger: 1, species: ['mushroom', 'spider', 'slime', 'wolf'], text: 'A quiet forest. The trees whisper old words.' },
  { id: 'watch', name: 'Watchtower Cape', biome: 'meadow', x: 150, y: 214, danger: 2, species: ['skeleton', 'banshee', 'goblin'], text: 'The cape of the Old Watchtower.' },
  { id: 'skyreach', name: 'Skyreach Island', biome: 'meadow', x: 220, y: 192, danger: 3, species: ['harpy', 'drake', 'wraith'], text: 'An island far in the sea. Only a boat goes there.' },
];

// ---------- The villages ----------
// founded: how many days before the hero came. An old village is evolved (walls of stone, a bridge),
// a young one has nothing yet: its people build it (see logic/villages.js).
// Everything inside is placed from the top-left of the village (dx, dy). The border is kept for the walls.
//   roads: straight roads, 2 tiles wide, from a border to the other (the gates are where they meet the walls).
//   houses: { dx, dy, roof, sign, w?, h?, kind? } (4 x 3 by default, the door at dx + 1 on the last row).
//   fields: soil where food grows. pens: where the animals live. props: lamps, fountains...

export const VILLAGES = [
  {
    id: 'lexia', name: 'Eldermoor', x: 92, y: 109, w: 30, h: 26, founded: 420, roof: 'red',
    text: 'An old village of farmers, smiths and mages, behind its stone walls. Your new home.',
    roads: [{ dx: 1, dy: 12, w: 28, h: 2 }, { dx: 14, dy: 1, w: 2, h: 24 }],
    plazas: [{ dx: 11, dy: 10, w: 8, h: 5 }, { dx: 17, dy: 19, w: 6, h: 1 }],
    houses: [
      { dx: 2, dy: 2, roof: 'red', sign: 'book', role: 'library' },
      { dx: 8, dy: 2, roof: 'red', sign: 'healthPotion', role: 'clinic' },
      { dx: 2, dy: 7, roof: 'red', sign: null, role: 'home' },
      { dx: 8, dy: 7, roof: 'purple', sign: 'potion', role: 'potions' },
      { dx: 17, dy: 1, w: 6, h: 4, kind: 'guild', roof: 'blue', sign: 'guild', role: 'guild' },
      { dx: 24, dy: 2, roof: 'red', sign: 'ironSword', role: 'forge' },
      { dx: 17, dy: 7, roof: 'purple', sign: 'star', role: 'arcane' },
      { dx: 23, dy: 7, roof: 'red', sign: 'cloth', role: 'weaver' },
      { dx: 2, dy: 15, roof: 'red', sign: 'bread', role: 'bakery' },
      { dx: 8, dy: 15, roof: 'red', sign: null, role: 'elder' },
      { dx: 2, dy: 20, roof: 'red', sign: 'carrot', role: 'farm' },
      { dx: 17, dy: 15, w: 6, h: 4, kind: 'school', roof: 'purple', sign: null, role: 'school' },
    ],
    fields: [{ dx: 7, dy: 20, w: 6, h: 3 }, { dx: 6, dy: 7, w: 2, h: 3, garden: true }], // the second one: the garden of the hero
    pens: [{ dx: 17, dy: 21, w: 11, h: 3, animals: { pig: 3, chicken: 4, cow: 2, horse: 1 } }],
    props: [
      { kind: 'fountain', dx: 11, dy: 10, w: 2, h: 2 },
      { kind: 'campfire', dx: 12, dy: 14, w: 1, h: 1 },
      { kind: 'lamp', dx: 13, dy: 11, w: 1, h: 1 },
      { kind: 'lamp', dx: 16, dy: 11, w: 1, h: 1 },
      { kind: 'lamp', dx: 13, dy: 15, w: 1, h: 1 },
      { kind: 'lamp', dx: 16, dy: 15, w: 1, h: 1 },
      { kind: 'well', dx: 6, dy: 11, w: 1, h: 1 },
      { kind: 'dummy', dx: 25, dy: 15, w: 1, h: 1 },
      { kind: 'dummy', dx: 27, dy: 15, w: 1, h: 1 },
      { kind: 'dummy', dx: 25, dy: 17, w: 1, h: 1 },
      { kind: 'crystal', dx: 16, dy: 18, w: 1, h: 1 },
      { kind: 'crystal', dx: 23, dy: 18, w: 1, h: 1 },
      { kind: 'signpost', dx: 12, dy: 23, w: 1, h: 1 },
    ],
  },
  {
    id: 'greendale', name: 'Greendale', x: 33, y: 108, w: 28, h: 20, founded: 6, roof: 'red',
    text: 'A young village of woodcutters, in the middle of Verbwood. It is still growing.',
    roads: [{ dx: 1, dy: 9, w: 26, h: 2 }, { dx: 13, dy: 1, w: 2, h: 18 }],
    plazas: [{ dx: 10, dy: 7, w: 8, h: 5 }],
    houses: [
      { dx: 2, dy: 2, roof: 'red', sign: 'ironSword', role: 'smithy' },
      { dx: 7, dy: 2, roof: 'red', sign: null, role: 'house' },
      { dx: 17, dy: 2, roof: 'red', sign: 'meat', role: 'lodge' },
      { dx: 22, dy: 2, roof: 'red', sign: null, role: 'house' },
      { dx: 2, dy: 13, roof: 'red', sign: null, role: 'house' },
    ],
    fields: [{ dx: 7, dy: 13, w: 5, h: 3 }],
    pens: [{ dx: 17, dy: 13, w: 9, h: 4, animals: { pig: 2, chicken: 3, cow: 0, horse: 0 } }],
    props: [
      { kind: 'campfire', dx: 11, dy: 8, w: 1, h: 1 },
      { kind: 'well', dx: 16, dy: 8, w: 1, h: 1 },
      { kind: 'logs', dx: 22, dy: 7, w: 2, h: 1 },
    ],
  },
  {
    id: 'port', name: 'Seabridge', x: 200, y: 124, w: 36, h: 26, founded: 90, roof: 'blue',
    text: 'A busy harbor: maps, rings, sailors. A boat goes to Skyreach Island.',
    roads: [{ dx: 1, dy: 12, w: 34, h: 2 }, { dx: 16, dy: 1, w: 2, h: 24 }],
    plazas: [{ dx: 13, dy: 10, w: 8, h: 6 }],
    houses: [
      { dx: 3, dy: 3, roof: 'blue', sign: 'map1', role: 'market' },
      { dx: 9, dy: 3, roof: 'blue', sign: 'mug', role: 'inn' },
      { dx: 20, dy: 3, roof: 'blue', sign: 'shield', role: 'barracks' },
      { dx: 26, dy: 3, roof: 'blue', sign: 'fish', role: 'harbor' },
      { dx: 3, dy: 17, roof: 'blue', sign: null, role: 'house' },
      { dx: 9, dy: 17, roof: 'blue', sign: 'healthPotion', role: 'clinic' },
      { dx: 26, dy: 17, roof: 'blue', sign: null, role: 'house' },
    ],
    fields: [{ dx: 20, dy: 17, w: 5, h: 3 }],
    pens: [{ dx: 20, dy: 21, w: 8, h: 3, animals: { pig: 1, chicken: 5, cow: 1, horse: 1 } }],
    props: [
      { kind: 'campfire', dx: 14, dy: 15, w: 1, h: 1 },
      { kind: 'stall', dx: 4, dy: 8, w: 2, h: 2 },
      { kind: 'lamp', dx: 12, dy: 11, w: 1, h: 1 },
      { kind: 'lamp', dx: 21, dy: 11, w: 1, h: 1 },
      { kind: 'barrels', dx: 30, dy: 9, w: 1, h: 1 },
      { kind: 'crates', dx: 31, dy: 9, w: 1, h: 1 },
      { kind: 'well', dx: 7, dy: 9, w: 1, h: 1 },
    ],
  },
];

// The levels of a village: what its walls are made of. A village goes up a level when it has the resources.
export const VILLAGE_LEVELS = [
  { name: 'a camp', wall: null, needs: null },
  { name: 'a village', wall: 'palisade', needs: { wood: 40 } },
  { name: 'a fortified village', wall: 'wall', needs: { stone: 60, wood: 20 } },
];
export const BRIDGE_NEEDS = { wood: 30 }; // a village also builds a bridge over the river near it

// ---------- The dungeons: a building outside, floors inside ----------
// look: how the outside is built (see world/structures.js). floors: how many floors inside. theme: their walls.
// guard: the monsters of each floor. boss: on the last floor (null = a guardian and a treasure instead).

export const DUNGEONS = [
  { id: 'crypt', name: 'Crystal Cave', look: 'cave', x: 194, y: 66, w: 14, h: 12, door: [200, 76], floors: 3, theme: 'crystal', guards: ['spider', 'iceGolem', 'skeleton'], boss: 'lich', danger: 2, text: 'A cave of singing crystals. The Gerund Lich sleeps at its bottom.' },
  { id: 'tower', name: 'Frostpeak Castle', look: 'castle', x: 134, y: 16, w: 32, h: 28, door: [149, 35], floors: 3, theme: 'ice', guards: ['iceGolem', 'harpy', 'wraith'], boss: 'warden', danger: 3, text: 'A frozen castle where time goes wrong. The Chrono Warden keeps it.' },
  { id: 'fort', name: 'Sandbandit Camp', look: 'camp', x: 44, y: 202, w: 24, h: 20, door: [55, 211], floors: 2, theme: 'bandit', guards: ['orc', 'goblin', 'cultist'], boss: 'general', danger: 3, text: 'The camp of General Barbarism, the enemy at the gate.' },
  { id: 'castle', name: 'Castle of Silence', look: 'demonCastle', x: 24, y: 6, w: 44, h: 36, door: [44, 38], floors: 4, theme: 'demon', guards: ['darkKnight', 'shadowMage', 'boneGolem', 'drake'], boss: 'king', danger: 4, text: 'A titanic castle on an island of lava. Solecis waits on his throne.' },
  { id: 'ruins', name: 'Ancient Ruins', look: 'ruins', x: 150, y: 124, w: 36, h: 26, door: [167, 136], floors: 2, theme: 'ruins', guards: ['skeleton', 'mimic', 'wraith'], boss: null, guardian: 'stoneGolem', danger: 3, text: 'A city older than words. Its doors only open to good sentences.' },
  { id: 'watchtower', name: 'Old Watchtower', look: 'tower', x: 146, y: 194, w: 11, h: 11, door: [151, 203], floors: 4, theme: 'tower', guards: ['skeleton', 'banshee'], boss: null, guardian: 'boneGolem', danger: 2, text: 'A tower that watched the sea. Each floor is a riddle.' },
  { id: 'mineWest', name: 'Greendale Mine', look: 'mine', x: 12, y: 112, w: 8, h: 7, door: [15, 116], floors: 2, theme: 'mine', guards: ['rat', 'spider', 'goblin'], boss: null, guardian: 'orc', danger: 2, text: 'An old iron mine. The rails go deep.' },
  { id: 'mineDesert', name: 'Sunscorch Mine', look: 'mine', x: 20, y: 158, w: 8, h: 7, door: [23, 162], floors: 2, theme: 'mine', guards: ['rat', 'lizardman', 'spider'], boss: null, guardian: 'stoneGolem', danger: 3, text: 'A mine of crystals in the mesas.' },
];

// ---------- The magic doors: closed until a boss is defeated ----------
export const SEALS = [{ x: 44, y: 66, w: 2, h: 1, until: 'general', text: 'Red runes seal the bridge of the Silent Isle. Only the fall of General Barbarism can break them.' }];

// The bridge to the demon island (over its moat of water).
export const ISLE_BRIDGE = { x: 44, y: 66, w: 2, h: 5 };

// ---------- The boat between Seabridge and Skyreach Island ----------
// x, y: the boat (on the water). landing: where the hero stands when they arrive.
export const BOATS = [
  { id: 'seabridge', name: 'Seabridge', x: 242, y: 134, landing: { x: 240, y: 137 }, to: 'skyreach' },
  { id: 'skyreach', name: 'Skyreach Island', x: 193, y: 190, landing: { x: 196, y: 190 }, to: 'seabridge' },
];

// ---------- Things placed in the wild ----------
// kind: 'obelisk' (a riddle: a hard sentence to complete, a reward), 'campfire', 'signpost', 'well', 'ruinPillar',
// 'hut' (a hermit), 'chest' (a treasure in plain sight).
export const WILD_PROPS = [
  { kind: 'obelisk', x: 122, y: 95, w: 1, h: 1, riddle: 'heartwood' },
  { kind: 'obelisk', x: 71, y: 151, w: 1, h: 1, riddle: 'riverbend' },
  { kind: 'obelisk', x: 214, y: 179, w: 1, h: 1, riddle: 'skyreach' },
  { kind: 'obelisk', x: 158, y: 58, w: 1, h: 1, riddle: 'frost' },
  { kind: 'obelisk', x: 28, y: 195, w: 1, h: 1, riddle: 'dunes' },
  { kind: 'obelisk', x: 127, y: 224, w: 1, h: 1, riddle: 'cape' },
  { kind: 'campfire', x: 26, y: 74, w: 1, h: 1 },
  { kind: 'campfire', x: 137, y: 165, w: 1, h: 1 },
  { kind: 'campfire', x: 72, y: 174, w: 1, h: 1 },
  { kind: 'campfire', x: 185, y: 57, w: 1, h: 1 },
  { kind: 'well', x: 79, y: 185, w: 1, h: 1 },
  { kind: 'signpost', x: 86, y: 116, w: 1, h: 1 },
  { kind: 'signpost', x: 127, y: 121, w: 1, h: 1 },
  { kind: 'hut', x: 124, y: 64, w: 2, h: 1 },
  { kind: 'hut', x: 186, y: 98, w: 2, h: 1 },
];

// ---------- The insides ----------
// Each one is a room of the INSIDE band, out of the island: { id, name, x, y, w, h, theme, kind }.
// They are made by world/insides.js. The stairs between them and the doors outside: see world/insides.js.
const SLOT_W = 50;
const SLOT_H = 38;

function slot(index) {
  return { x: 3 + (index % 5) * SLOT_W, y: INSIDE_TOP + 2 + Math.floor(index / 5) * SLOT_H };
}

function insidesOf() {
  const list = [{ id: 'home', name: 'Your home', kind: 'home', theme: 'home', ...slot(0), w: 14, h: 10, safe: true }];
  for (const dungeon of DUNGEONS) {
    for (let floor = 1; floor <= dungeon.floors; floor++) {
      const size = dungeon.look === 'tower' ? { w: 15, h: 15 } : dungeon.id === 'castle' ? { w: 46, h: 34 } : { w: 40, h: 30 };
      list.push({ id: dungeon.id + '-' + floor, name: dungeon.name + (dungeon.floors > 1 ? ' · floor ' + floor : ''), kind: 'floor', dungeon: dungeon.id, floor: floor, theme: dungeon.theme, ...slot(list.length), ...size });
    }
  }
  return list;
}

export const INSIDES = insidesOf();

// ---------- Finding the zone of a tile ----------

function isInside(rect, x, y) {
  return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

const VILLAGE_ZONES = VILLAGES.map((village) => ({ ...village, kind: 'village', biome: 'village', danger: 0, species: [], label: [village.x + village.w / 2, village.y - 1] }));
const DUNGEON_ZONES = DUNGEONS.map((dungeon) => ({ ...dungeon, kind: dungeon.id === 'castle' ? 'castle' : 'dungeon', biome: 'dungeon', species: [] }));
const INSIDE_ZONES = INSIDES.map((inside) => ({ ...inside, kind: 'inside', biome: 'dungeon', danger: inside.safe ? 0 : 3, species: [] }));
const LAND_ZONES = LANDS.map((land) => ({ ...land, kind: 'land', label: [land.x, land.y] }));
const VOID_ZONE = { id: 'void', name: '', kind: 'inside', biome: 'dungeon', danger: 0, species: [], x: 0, y: INSIDE_TOP, w: WORLD_SIZE, h: MAP_HEIGHT - INSIDE_TOP };

// Every zone, the places first (the world map writes their names).
export const ZONES = [...VILLAGE_ZONES, ...DUNGEON_ZONES, ...LAND_ZONES, ...INSIDE_ZONES];

// The closest land (its middle) to a tile of the island.
function landAt(x, y) {
  let best = LAND_ZONES[0];
  let bestFar = Infinity;
  for (const land of LAND_ZONES) {
    const far = (land.x - x) * (land.x - x) + (land.y - y) * (land.y - y);
    if (far < bestFar) {
      best = land;
      bestFar = far;
    }
  }
  return best;
}

function computeZoneAt(x, y) {
  if (y >= INSIDE_TOP) return INSIDE_ZONES.find((zone) => isInside(zone, x, y)) || VOID_ZONE;
  return VILLAGE_ZONES.find((zone) => isInside(zone, x, y)) || DUNGEON_ZONES.find((zone) => isInside(zone, x, y)) || landAt(x, y);
}

// The zone of every tile, found once (the game asks very often).
const ZONE_GRID = [];
for (let y = 0; y < MAP_HEIGHT; y++) {
  for (let x = 0; x < WORLD_SIZE; x++) ZONE_GRID.push(computeZoneAt(x, y));
}

function clamp(value, max) {
  return Math.min(max - 1, Math.max(0, Math.floor(value)));
}

export function zoneAt(x, y) {
  return ZONE_GRID[clamp(y, MAP_HEIGHT) * WORLD_SIZE + clamp(x, WORLD_SIZE)];
}

export function zoneOf(id) {
  return ZONES.find((zone) => zone.id === id);
}

export function villageOf(id) {
  return VILLAGES.find((village) => village.id === id);
}

export function dungeonOf(id) {
  return DUNGEONS.find((dungeon) => dungeon.id === id);
}

export function insideOf(id) {
  return INSIDES.find((inside) => inside.id === id);
}

// Is this tile in the insides (a floor of a dungeon, a mine, the home)?
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
  return { w: house.w || 4, h: house.h || 3 };
}

// Every house of the world, at its place on the map: { x, y, w?, h?, roof, sign, kind, role, village }.
export const HOUSES = VILLAGES.flatMap((village) => village.houses.map((house) => ({ ...house, x: village.x + house.dx, y: village.y + house.dy, village: village.id })));

// The house of a role in a village (null = none). Its door: (x + 1, y + h - 1) (the school: x + 2).
export function houseOf(villageId, role) {
  return HOUSES.find((house) => house.village === villageId && house.role === role) || null;
}

export function doorOf(house) {
  return { x: house.x + (house.kind === 'school' || house.kind === 'guild' ? 2 : 1), y: house.y + houseSize(house).h - 1 };
}

// The home of the player and where they wake up: in front of its door.
const HOME = houseOf('lexia', 'home');
export const HOME_DOOR = doorOf(HOME);
export const SPAWN = { x: HOME_DOOR.x + 0.5, y: HOME_DOOR.y + 1.5 };

// The fields (soil) and the pens of the villages, on the map.
export const FIELDS = VILLAGES.flatMap((village) => village.fields.map((field) => ({ x: village.x + field.dx, y: village.y + field.dy, w: field.w, h: field.h, village: village.id })));
export const PENS = VILLAGES.flatMap((village) => village.pens.map((pen) => ({ x: village.x + pen.dx, y: village.y + pen.dy, w: pen.w, h: pen.h, animals: pen.animals, village: village.id })));
export const PLAZAS = VILLAGES.flatMap((village) => village.plazas.map((plaza) => ({ x: village.x + plaza.dx, y: village.y + plaza.dy, w: plaza.w, h: plaza.h })));
export const VILLAGE_ROADS = VILLAGES.flatMap((village) => village.roads.map((road) => ({ x: village.x + road.dx, y: village.y + road.dy, w: road.w, h: road.h, village: village.id })));

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

// The things standing on the ground that never change: nobody walks through them.
// (The walls of the villages change with their level: see logic/villages.js.)
export const PROPS = [
  ...VILLAGES.flatMap((village) => village.props.map((prop) => ({ ...prop, x: village.x + prop.dx, y: village.y + prop.dy }))),
  ...PENS.flatMap(fencesOf),
  ...WILD_PROPS,
];
