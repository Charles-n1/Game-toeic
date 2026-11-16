import { OBELISKS } from '../data/dungeons';
import { CELLS, SCALE } from './size';
import { paintedGround, paintedBiome, isWalkableCell } from './painting';
import { landOfCell } from './regions';
import { SETTLEMENTS, DUNGEON_RECTS } from './places';
import { randomOf, pickWith, between } from './seeded';

// The places of the wild: the caves (in the cliffs: some hide magic crystals, nobody knows which ones),
// the grey totems (old statues that make the hero stronger), the obelisks (riddles), the homes of the people
// who live alone in the wild, and a few campfires along the way.

const random = randomOf('wild');
const MAX_CAVES = 30;
const MAX_TOTEMS = 10;
const CAVE_NAMES = {
  meadow: ['Mossy', 'Echoing', 'Hollow', 'Dripping', 'Badger'],
  forest: ['Root', 'Mossy', 'Bat', 'Owl', 'Fern'],
  mountain: ['Frozen', 'Icicle', 'Howling', 'Glacier'],
  desert: ['Sand', 'Scorpion', 'Sunken', 'Dune'],
  coast: ['Sea', 'Salt', 'Tide', 'Smuggler'],
  demon: ['Ember', 'Ash', 'Burning'],
};
const GUARDIANS = { 0: 'orc', 1: 'orc', 2: 'stoneGolem', 3: 'boneGolem', 4: 'drake' };

const ALL_PLACES = [...SETTLEMENTS.people, ...SETTLEMENTS.monsters, ...SETTLEMENTS.camps, ...DUNGEON_RECTS];

function cellOf(place) {
  return { cx: (place.x + place.w / 2) / SCALE, cy: (place.y + place.h / 2) / SCALE };
}

// Far enough (in cells) from every village and every place already chosen?
function isFree(cx, cy, others, gap) {
  return [...ALL_PLACES, ...others].every((place) => {
    const middle = cellOf(place);
    return Math.hypot(middle.cx - cx, middle.cy - cy) - Math.max(place.w, place.h) / (2 * SCALE) >= gap;
  });
}

// ---------- The caves ----------

// A cell of cliff with walkable land below it: the mouth of a cave can open there.
function isCliffFoot(cx, cy) {
  return paintedGround(cx, cy) === 'cliff' && isWalkableCell(cx, cy + 1) && isWalkableCell(cx - 1, cy + 1) && isWalkableCell(cx + 1, cy + 1);
}

function makeCave(cx, cy, index) {
  const land = landOfCell(cx, cy);
  const biome = paintedBiome(cx, cy + 1);
  const crystals = random() < 0.3; // a secret: only some smiths know it
  const theme = crystals ? 'crystal' : biome === 'mountain' ? 'ice' : biome === 'demon' ? 'demon' : 'mine';
  const guards = land.species.length > 0 ? land.species : ['rat', 'spider'];
  return {
    id: 'cave-' + index,
    name: pickWith(random, CAVE_NAMES[biome] || CAVE_NAMES.meadow) + ' Cave',
    look: 'cave',
    x: cx * SCALE - 8,
    y: cy * SCALE - 6,
    w: 18,
    h: 16,
    floors: random() < 0.4 ? 2 : 1,
    theme: theme,
    crystals: crystals,
    guards: guards,
    boss: null,
    guardian: GUARDIANS[land.danger],
    danger: Math.max(1, land.danger),
    wild: true,
    text: 'A cave in the rocks of ' + land.name + '.',
  };
}

function findCaves() {
  const caves = [];
  for (let tries = 0; tries < 6000 && caves.length < MAX_CAVES; tries++) {
    const cx = between(random, 4, CELLS - 5);
    const cy = between(random, 4, CELLS - 5);
    if (isCliffFoot(cx, cy) && isFree(cx, cy, caves, 9)) caves.push(makeCave(cx, cy, caves.length));
  }
  return caves;
}

export const CAVES = findCaves();

// ---------- The totems, the obelisks, the lonely homes ----------

function findTotems() {
  const totems = [];
  for (let tries = 0; tries < 3000 && totems.length < MAX_TOTEMS; tries++) {
    const cx = between(random, 6, CELLS - 7);
    const cy = between(random, 6, CELLS - 7);
    if (isWalkableCell(cx, cy) && paintedBiome(cx, cy) !== 'demon' && isFree(cx, cy, [...CAVES, ...totems], 20)) {
      totems.push({ kind: 'totem', x: cx * SCALE + 5, y: cy * SCALE + 5, w: 1, h: 1, totem: 'totem-' + totems.length });
    }
  }
  return totems;
}

export const TOTEMS = findTotems();

export const WILD_OBELISKS = OBELISKS.map((obelisk) => ({ kind: 'obelisk', x: obelisk.x * SCALE + 5, y: obelisk.y * SCALE + 5, w: 1, h: 1, riddle: obelisk.riddle }));

// The people who live alone in the wild (see data/npcs.js: home: { wild: id }): x, y in cells of the painting.
export const WILD_HOMES = [
  { id: 'sylvia', x: 23.5, y: 89.5, prop: 'hut', text: 'The hut of the druid' },
  { id: 'nyx', x: 46.5, y: 73.5, prop: 'campfire', text: 'A lonely campfire' },
  { id: 'corvin', x: 163.5, y: 116.5, prop: 'tent', text: 'A black tent' },
  { id: 'hermit1', x: 124, y: 64, prop: 'hut', text: 'The hut of a hermit' },
  { id: 'hermit2', x: 186, y: 98, prop: 'hut', text: 'The hut of a hermit' },
].map((home) => ({ ...home, x: Math.round(home.x * SCALE), y: Math.round(home.y * SCALE) }));

// A few campfires in the wild, where travelers stop (to cook, to light a torch).
function findCampfires() {
  const fires = [];
  for (let tries = 0; tries < 2000 && fires.length < 24; tries++) {
    const cx = between(random, 6, CELLS - 7);
    const cy = between(random, 6, CELLS - 7);
    if (isWalkableCell(cx, cy) && paintedBiome(cx, cy) !== 'demon' && isFree(cx, cy, fires, 14)) fires.push({ kind: 'campfire', x: cx * SCALE + 4, y: cy * SCALE + 4, w: 1, h: 1 });
  }
  return fires;
}

export const WILD_CAMPFIRES = findCampfires();
