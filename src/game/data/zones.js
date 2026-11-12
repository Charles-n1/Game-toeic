// The world is one big island of 120 x 120 tiles. A zone = a rectangle of it.
// The FIRST zone that contains a tile wins: the villages and dungeons are listed before the lands.
// danger: 0 = safe ... 4 = the demon land. species: the monsters that appear there.
export const ZONES = [
  // ---------- Villages (no monster comes in, except during a raid) ----------
  { id: 'lexia', name: 'Lexia Village', kind: 'village', biome: 'village', x: 52, y: 58, w: 24, h: 24, danger: 0, species: [] },
  { id: 'port', name: 'Port Syntax', kind: 'village', biome: 'village', x: 92, y: 84, w: 21, h: 15, danger: 0, species: [] },

  // ---------- Dungeons: a snake of rooms, guards, a boss and a chest at the end ----------
  { id: 'crypt', name: 'Crypt of Gerunds', kind: 'dungeon', biome: 'dungeon', x: 6, y: 50, w: 17, h: 11, danger: 2, species: [], guard: 'wolf', boss: 'lich' },
  { id: 'tower', name: 'Tower of Tenses', kind: 'dungeon', biome: 'dungeon', x: 16, y: 26, w: 17, h: 11, danger: 3, species: [], guard: 'golem', boss: 'warden' },
  { id: 'fort', name: 'Fort Mutter', kind: 'dungeon', biome: 'dungeon', x: 82, y: 26, w: 17, h: 11, danger: 3, species: [], guard: 'imp', boss: 'general' },
  { id: 'castle', name: 'Castle of Silence', kind: 'castle', biome: 'dungeon', x: 54, y: 3, w: 21, h: 13, danger: 4, species: [], guard: 'demonKnight', boss: 'king' },

  // ---------- The lands ----------
  { id: 'demon', name: 'The Silent Lands', kind: 'land', biome: 'demon', x: 0, y: 0, w: 120, h: 22, danger: 4, species: ['imp', 'demonKnight'] },
  { id: 'mountain', name: 'Ember Peaks', kind: 'land', biome: 'mountain', x: 0, y: 22, w: 120, h: 22, danger: 3, species: ['wisp', 'golem', 'wolf'] },
  { id: 'forest', name: 'Verbwood', kind: 'land', biome: 'forest', x: 0, y: 44, w: 42, h: 56, danger: 2, species: ['slime', 'wolf', 'treant'] },
  { id: 'meadow', name: 'Whisper Meadow', kind: 'land', biome: 'meadow', x: 42, y: 44, w: 40, h: 56, danger: 1, species: ['slime'] },
  { id: 'lake', name: 'Lake Clause', kind: 'land', biome: 'lake', x: 82, y: 44, w: 38, h: 36, danger: 1, species: ['slime', 'bat'] },
  { id: 'coast', name: 'Comma Coast', kind: 'land', biome: 'coast', x: 82, y: 80, w: 38, h: 20, danger: 1, species: ['slime'] },
  { id: 'plains', name: 'Carrot Plains', kind: 'land', biome: 'plains', x: 0, y: 100, w: 120, h: 20, danger: 1, species: ['slime', 'bat'] },
];

// Where the player wakes up: in front of the door of their home.
export const SPAWN = { x: 60.5, y: 68.5 };
export const HOME_DOOR = { x: 60, y: 67 };

// The houses: x, y = top-left tile. Every house is 4 tiles wide and 3 tiles high, the door is at (x + 1, y + 2).
export const HOUSES = [
  { x: 59, y: 65 }, // the home of the player
  { x: 54, y: 62 }, // Aria's clinic
  { x: 59, y: 60 }, // the library
  { x: 66, y: 62 }, // the forge
  { x: 71, y: 64 }, // Finn and Lila
  { x: 54, y: 72 }, // the bakery
  { x: 67, y: 72 }, // the elder
  { x: 55, y: 77 }, // Hana's farm
  { x: 96, y: 86 }, // Luna's market (Port Syntax)
  { x: 102, y: 86 }, // the inn
  { x: 108, y: 86 }, // the barracks
  { x: 98, y: 92 }, // the fisherman
];

// The field where carrots grow (Lexia).
export const FIELD = { x: 60, y: 78, w: 8, h: 3 };

// The roads. Each one is a straight line, 2 tiles wide.
export const ROADS = [
  { x1: 8, y1: 69, x2: 86, y2: 69 }, // west forest <-> Lexia <-> east
  { x1: 64, y1: 16, x2: 64, y2: 80 }, // castle <-> Lexia (north-south)
  { x1: 8, y1: 61, x2: 8, y2: 69 }, // to the crypt
  { x1: 18, y1: 40, x2: 84, y2: 40 }, // the mountain road
  { x1: 18, y1: 37, x2: 18, y2: 40 }, // to the tower
  { x1: 84, y1: 37, x2: 84, y2: 40 }, // to the fort
  { x1: 86, y1: 69, x2: 86, y2: 90 }, // down to the coast
  { x1: 86, y1: 90, x2: 112, y2: 90 }, // the main street of Port Syntax
];

// The zone of a tile.
export function zoneAt(x, y) {
  for (const zone of ZONES) {
    if (x >= zone.x && x < zone.x + zone.w && y >= zone.y && y < zone.y + zone.h) return zone;
  }
  return ZONES[ZONES.length - 1];
}

export function zoneOf(id) {
  return ZONES.find((zone) => zone.id === id);
}

// The middle of a zone, in tiles.
export function centerOf(zone) {
  return { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2 };
}
