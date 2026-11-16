import { KINGDOMS, BANDIT_CLANS } from '../data/kingdoms';
import { STORY_VILLAGES } from '../data/storyVillages';
import { STORY_DUNGEONS } from '../data/dungeons';
import { VILLAGE_SIZES, VILLAGE_NEEDS } from '../data/buildings';
import { NAME_PARTS, MONSTER_TOWNS } from '../data/placeNames';
import { CELLS, SCALE } from './size';
import { isLivable, paintedBiome, paintedGround } from './painting';
import { landOfCell } from './regions';
import { randomOf, pickWith, between, shuffledWith } from './seeded';

// Where the people live: the capitals of the kingdoms, the villages of the story, the other villages
// (a random number of them, everywhere there is room), the villages of the monsters and the camps of the bandits.
// Everything is placed on the painting (cells), then measured in tiles: { x, y, w, h } = the top-left tile and the size.
// Always the same world: the random numbers come from the name "world".
//
// A settlement: { id, name, kind, kingdom, x, y, w, h, founded, roof, roles, rivals, port, species, clan, text }
//   kind: 'capital' | 'town' | 'village' | 'hamlet' | 'farm' (people), 'monster' (monsters), 'camp' (bandits)
//   founded: its age in days (an old village is more evolved). rivals: the villages it is at war with.

const random = randomOf('world');
const GAP = 14; // cells between two villages of people (140 tiles)
const MONSTER_GAP = 9; // cells between a village of monsters and a village of people
const MAX_VILLAGES = between(random, 34, 46); // the villages of people besides the capitals and the story
const SEARCH = 24; // cells: how far a place may move from where it should stand

// ---------- Room ----------

function cellRect(place) {
  return { left: Math.floor(place.x / SCALE) - 1, top: Math.floor(place.y / SCALE) - 1, right: Math.floor((place.x + place.w) / SCALE) + 1, bottom: Math.floor((place.y + place.h) / SCALE) + 1 };
}

// Can a place of this size stand here? The cells under it (and around) must be good land. A few rocks of the
// painting (cliff cells) are allowed: the builders clear them. Never water, never lava.
function fitsAt(place, isGood) {
  const cells = cellRect(place);
  if (cells.left < 1 || cells.top < 1 || cells.right >= CELLS - 1 || cells.bottom >= CELLS - 1) return false;
  let rocks = 0;
  let total = 0;
  for (let cy = cells.top; cy <= cells.bottom; cy++) {
    for (let cx = cells.left; cx <= cells.right; cx++) {
      total += 1;
      if (isGood(cx, cy)) continue;
      if (paintedGround(cx, cy) !== 'cliff') return false;
      rocks += 1;
    }
  }
  return rocks <= total * 0.15;
}

function middleCell(place) {
  return { cx: (place.x + place.w / 2) / SCALE, cy: (place.y + place.h / 2) / SCALE };
}

function cellDistance(a, b) {
  const first = middleCell(a);
  const second = middleCell(b);
  return Math.hypot(first.cx - second.cx, first.cy - second.cy) - (Math.max(a.w, a.h) + Math.max(b.w, b.h)) / (2 * SCALE);
}

function isFarFrom(place, others, gap) {
  return others.every((other) => cellDistance(place, other) >= gap);
}

// The place, standing with its middle on the cell (cx, cy).
function placedAt(place, cx, cy) {
  return { ...place, x: Math.round(cx * SCALE - place.w / 2), y: Math.round(cy * SCALE - place.h / 2) };
}

// The closest spot to (cx, cy) where the place fits, in rings around it (null = none).
function findSpot(place, cx, cy, others, gap, isGood = isLivable) {
  for (let ring = 0; ring <= SEARCH; ring++) {
    for (let dy = -ring; dy <= ring; dy++) {
      for (let dx = -ring; dx <= ring; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
        const candidate = placedAt(place, cx + dx, cy + dy);
        if (fitsAt(candidate, isGood) && isFarFrom(candidate, others, gap)) return candidate;
      }
    }
  }
  return null;
}

// ---------- Names ----------

const usedNames = new Set();

function nameFor(biome) {
  const parts = NAME_PARTS[biome] || NAME_PARTS.meadow;
  for (let tries = 0; tries < 40; tries++) {
    const name = pickWith(random, parts.start) + pickWith(random, parts.end);
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  return 'New ' + pickWith(random, parts.start) + 'ton';
}

function biomeOf(place) {
  const { cx, cy } = middleCell(place);
  return paintedBiome(Math.floor(cx), Math.floor(cy));
}

// ---------- The villages of people ----------

function sizedPlace(kind) {
  return { kind: kind, ...VILLAGE_SIZES[kind] };
}

// The kingdom of a cell: the one whose capital is the closest.
let capitals = [];

export function kingdomOfCell(cx, cy) {
  if (paintedBiome(Math.floor(cx), Math.floor(cy)) === 'demon') return null;
  let best = null;
  let bestFar = Infinity;
  for (const capital of capitals) {
    const middle = middleCell(capital);
    const far = Math.hypot(middle.cx - cx, middle.cy - cy);
    if (far < bestFar) {
      best = capital.kingdom;
      bestFar = far;
    }
  }
  return best;
}

function placeCapitals(placed) {
  for (const kingdom of KINGDOMS) {
    const spot = findSpot({ ...sizedPlace('capital'), ...VILLAGE_SIZES[kingdom.size || 'capital'] }, kingdom.x, kingdom.y, placed, GAP);
    if (!spot) continue;
    placed.push({ ...spot, id: 'capital-' + kingdom.id, name: kingdom.capital, kingdom: kingdom.id, founded: 900, roof: kingdom.roof, roles: ['palace', ...VILLAGE_NEEDS.capital], text: 'The capital of the ' + kingdom.name + '. ' + kingdom.text });
  }
  capitals = placed.filter((place) => place.kind === 'capital');
}

function placeStoryVillages(placed) {
  for (const village of STORY_VILLAGES) {
    const spot = findSpot(sizedPlace(village.kind), village.x, village.y, placed, 6) || placedAt(sizedPlace(village.kind), village.x, village.y);
    usedNames.add(village.name);
    placed.push({ ...spot, ...village, x: spot.x, y: spot.y, story: true });
  }
}

// A village of people somewhere: its kind follows the land (the meadows feed the farming villages).
function randomKind(biome) {
  const roll = random();
  if (biome === 'meadow' && roll < 0.4) return 'farm';
  if (roll < 0.3) return 'hamlet';
  if (roll < 0.86) return 'village';
  return 'town';
}

function randomVillage(cx, cy, count) {
  const biome = paintedBiome(cx, cy);
  const kind = randomKind(biome);
  const age = kind === 'hamlet' ? between(random, 3, 60) : between(random, 10, 500);
  const kingdom = KINGDOMS.find((item) => item.id === kingdomOfCell(cx, cy));
  return { ...sizedPlace(kind), id: 'village-' + count, kingdom: kingdom ? kingdom.id : null, founded: age, roof: kingdom ? kingdom.roof : 'red', roles: [...VILLAGE_NEEDS[kind]] };
}

function placeRandomVillages(placed) {
  let count = 0;
  for (let tries = 0; tries < 900 && count < MAX_VILLAGES; tries++) {
    const cx = between(random, 6, CELLS - 7);
    const cy = between(random, 6, CELLS - 7);
    if (!isLivable(cx, cy)) continue;
    const village = placedAt(randomVillage(cx, cy, count), cx, cy);
    if (fitsAt(village, isLivable) && isFarFrom(village, placed, GAP)) {
      village.kingdom = kingdomOfCell(cx, cy);
      village.name = nameFor(paintedBiome(cx, cy));
      placed.push(village);
      count += 1;
    }
  }
}

// ---------- Wars between villages ----------

// Some villages hate a neighbor: two close villages of kingdoms at war always do, others sometimes (an old feud).
function chooseRivals(villages, areEnemies) {
  for (const village of villages) village.rivals = [];
  for (const village of villages) {
    const close = villages.filter((other) => other !== village && cellDistance(village, other) < 40);
    for (const other of close) {
      const isWar = areEnemies(village.kingdom, other.kingdom);
      const isFeud = random() < 0.08;
      if ((isWar || isFeud) && !village.rivals.includes(other.id)) {
        village.rivals.push(other.id);
        other.rivals.push(village.id);
      }
    }
  }
}

// ---------- The villages of the monsters, the camps of the bandits ----------

function isWild(cx, cy) {
  return ['grass', 'sand', 'snow', 'ash'].includes(paintedGround(cx, cy));
}

function monsterSpecies(cx, cy) {
  const land = landOfCell(cx, cy);
  const known = land.species.filter((species) => MONSTER_TOWNS[species]);
  return known.length > 0 ? pickWith(random, known) : pickWith(random, ['goblin', 'orc', 'skeleton']);
}

// The name of a village of monsters: one of its people's names, never twice the same.
function monsterTownName(species, land) {
  const free = MONSTER_TOWNS[species].filter((name) => !usedNames.has(name));
  const name = free.length > 0 ? pickWith(random, free) : pickWith(random, MONSTER_TOWNS[species]) + ' of ' + land.name;
  usedNames.add(name);
  return name;
}

function placeMonsterVillages(placed, people) {
  const villages = [];
  for (let tries = 0; tries < 700 && villages.length < 13; tries++) {
    const cx = between(random, 6, CELLS - 7);
    const cy = between(random, 6, CELLS - 7);
    const land = landOfCell(cx, cy);
    if (land.danger < 2 || !isWild(cx, cy)) continue;
    const species = land.id === 'demon' ? pickWith(random, ['darkKnight', 'cultist']) : monsterSpecies(cx, cy);
    const town = placedAt({ ...sizedPlace('monster'), species: species }, cx, cy);
    const story = people.filter((village) => village.story);
    if (fitsAt(town, isWild) && isFarFrom(town, people, MONSTER_GAP) && isFarFrom(town, story, 25) && isFarFrom(town, placed, 8)) {
      town.id = 'monsters-' + villages.length;
      town.name = monsterTownName(species, land);
      town.kingdom = null;
      town.founded = between(random, 30, 300);
      town.roles = [];
      town.text = 'A village of monsters (' + species + 's). They want more land: their warbands attack the villages around.';
      villages.push(town);
      placed.push(town);
    }
  }
  return villages;
}

function placeBanditCamps(placed, people) {
  const camps = [];
  for (const clan of BANDIT_CLANS) {
    let count = 0;
    for (let tries = 0; tries < 400 && count < 2; tries++) {
      const cx = between(random, 6, CELLS - 7);
      const cy = between(random, 6, CELLS - 7);
      if (!clan.lands.includes(paintedBiome(cx, cy)) || !isLivable(cx, cy)) continue;
      const camp = placedAt(sizedPlace('camp'), cx, cy);
      if (fitsAt(camp, isLivable) && isFarFrom(camp, people, 10) && isFarFrom(camp, placed, 8)) {
        Object.assign(camp, { id: 'camp-' + clan.id + '-' + count, name: 'Camp of ' + clan.name, clan: clan.id, kingdom: null, founded: 60, roles: [], text: 'A camp of ' + clan.name + '. Bandits, stolen goods, and sometimes prisoners.' });
        camps.push(camp);
        placed.push(camp);
        count += 1;
      }
    }
  }
  return camps;
}

// ---------- Everything ----------

// The dungeons of the story, where they stand (in tiles): nothing is built on them.
export const DUNGEON_RECTS = STORY_DUNGEONS.map((dungeon) => ({ id: dungeon.id, kind: 'dungeon', x: Math.round(dungeon.x * SCALE - dungeon.w / 2), y: Math.round(dungeon.y * SCALE - dungeon.h / 2), w: dungeon.w, h: dungeon.h }));

function makeSettlements(areEnemies) {
  const placed = [...DUNGEON_RECTS];
  placeCapitals(placed);
  placeStoryVillages(placed);
  placeRandomVillages(placed);
  const people = placed.filter((place) => place.kind !== 'dungeon');
  for (const village of people) {
    village.biome = biomeOf(village);
    if (!village.kingdom) village.kingdom = kingdomOfCell(middleCell(village).cx, middleCell(village).cy);
  }
  chooseRivals(people.filter((village) => !village.story), areEnemies);
  people.filter((village) => village.story).forEach((village) => (village.rivals = []));
  const monsters = placeMonsterVillages(placed, people);
  const camps = placeBanditCamps(placed, people);
  [...monsters, ...camps].forEach((place) => (place.biome = biomeOf(place)));
  return { people: people, monsters: monsters, camps: camps };
}

const ENEMIES = (a, b) => {
  const first = KINGDOMS.find((kingdom) => kingdom.id === a);
  return Boolean(first && first.enemies.includes(b)) || Boolean(KINGDOMS.find((kingdom) => kingdom.id === b && kingdom.enemies.includes(a)));
};

export const SETTLEMENTS = makeSettlements(ENEMIES);
