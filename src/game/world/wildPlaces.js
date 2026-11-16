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
const GUARDIANS = { 0: 'orc', 1: 'orc', 2: 'stoneGolem', 3: 'boneGolem', 4: 'hellknight' };

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
  { id: 'sylvia', x: 24, y: 93, prop: 'hut', text: 'The hut of the druid' },
  { id: 'nyx', x: 72, y: 70, prop: 'campfire', text: 'A lonely campfire' },
  { id: 'corvin', x: 170, y: 112, prop: 'tent', text: 'A black tent' },
  { id: 'hermit1', x: 118, y: 58, prop: 'hut', text: 'The hut of a hermit' },
  { id: 'hermit2', x: 196, y: 92, prop: 'hut', text: 'The hut of a hermit' },
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

// ---------- Isekai wilderness structures ----------
// Monster camps, bandit traps, wayfarer camps, goddess shrines, hot springs and the graves of the Lost Hero.

const structRandom = randomOf('isekai');
const CAMP_SPECIES = {
  meadow: ['slime', 'goblin', 'wolf'],
  forest: ['wolf', 'goblin', 'spider', 'orc'],
  mountain: ['orc', 'wolf', 'harpy', 'stoneGolem'],
  desert: ['lizardman', 'goblin', 'orc', 'drake'],
  coast: ['goblin', 'drowner', 'harpy', 'lizardman'],
  demon: ['cultist', 'darkKnight', 'shadowMage'],
};
const MONSTER_CAMP_NAMES = ['Goblin Warpost', 'Wolf Den', 'Feral Stockade', 'Raider Outpost', 'Bone Clearing', 'Demon Vanguard'];

function findIsekaiStructures() {
  const structures = [];
  const props = [];
  const occupied = [...CAVES, ...TOTEMS, ...WILD_CAMPFIRES];

  // wanted: the lands where it may stand (null = any land but the demon one, unless allowDemon).
  const pickSpot = (gapVillage, gapStruct, allowDemon = false, wanted = null) => {
    for (let tries = 0; tries < 160; tries++) {
      const cx = between(structRandom, 7, CELLS - 8);
      const cy = between(structRandom, 7, CELLS - 8);
      const biome = paintedBiome(cx, cy);
      if (!allowDemon && biome === 'demon') continue;
      if (wanted && !wanted.includes(biome)) continue;
      if (!isWalkableCell(cx, cy) || !isWalkableCell(cx + 1, cy) || !isWalkableCell(cx, cy + 1)) continue;
      const freeAll = [...ALL_PLACES, ...occupied, ...structures.map((s) => ({ x: s.x - 4, y: s.y - 4, w: 8, h: 8 }))].every((place) => {
        const mid = cellOf(place);
        const minGap = place.plan ? gapVillage : gapStruct;
        return Math.hypot(mid.cx - cx, mid.cy - cy) - Math.max(place.w || 4, place.h || 4) / (2 * SCALE) >= minGap;
      });
      if (freeAll) return { cx, cy, biome, land: landOfCell(cx, cy) };
    }
    return null;
  };

  // 1. 26 Monster Camps / Lairs (spawn origins for wild monsters!)
  for (let i = 0; i < 26; i++) {
    const spot = pickSpot(8, 7, true);
    if (!spot) break;
    const sx = spot.cx * SCALE + 5;
    const sy = spot.cy * SCALE + 5;
    const id = 'mcamp-' + i;
    const speciesList = spot.land.species && spot.land.species.length > 0 ? spot.land.species : CAMP_SPECIES[spot.biome] || CAMP_SPECIES.meadow;
    const camp = {
      id: id,
      kind: 'monsterCamp',
      name: pickWith(structRandom, MONSTER_CAMP_NAMES) + ' #' + (i + 1),
      x: sx,
      y: sy,
      w: 8,
      h: 7,
      biome: spot.biome,
      species: speciesList,
    };
    structures.push(camp);
    props.push({ kind: 'tent', look: 'monster', x: sx - 4, y: sy - 3, w: 6, h: 4, structId: id });
    props.push({ kind: 'campfire', x: sx + 2, y: sy, w: 1, h: 1, structId: id });
    props.push({ kind: 'monsterBanner', x: sx + 3, y: sy - 2, w: 1, h: 1, structId: id });
    props.push({ kind: 'bones', x: sx + 1, y: sy + 2, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'spikes', x: sx - 4, y: sy + 3, w: 1, h: 1, side: 'row', structId: id });
  }

  // 2. 20 Bandit Trap Ambushes along wilderness trails (lure crate + spike traps + tripwire)
  for (let i = 0; i < 20; i++) {
    const spot = pickSpot(8, 6, false);
    if (!spot) break;
    const sx = spot.cx * SCALE + 5;
    const sy = spot.cy * SCALE + 5;
    const id = 'btrap-' + i;
    const trap = { id: id, kind: 'banditTrap', name: 'Bandit Ambush Trap', x: sx, y: sy, w: 5, h: 5, danger: Math.max(1, spot.land.danger) };
    structures.push(trap);
    props.push({ kind: 'crates', x: sx, y: sy - 1, w: 1, h: 1, structId: id });
    props.push({ kind: 'spikeTrap', x: sx - 1, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'spikeTrap', x: sx + 1, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'tripwire', x: sx, y: sy + 2, w: 1, h: 1, walkable: true, structId: id });
  }

  // 3. 16 Wayfarer Roadside Camps (tent, simmering cauldron, bedroll, weapon rack)
  for (let i = 0; i < 16; i++) {
    const spot = pickSpot(7, 6, false);
    if (!spot) break;
    const sx = spot.cx * SCALE + 5;
    const sy = spot.cy * SCALE + 5;
    const id = 'wcamp-' + i;
    structures.push({ id: id, kind: 'wayCamp', name: 'Traveler Waycamp', x: sx, y: sy, w: 7, h: 6 });
    props.push({ kind: 'tent', look: 'bandit', x: sx - 4, y: sy - 3, w: 6, h: 4, structId: id });
    props.push({ kind: 'cauldron', x: sx + 2, y: sy, w: 1, h: 1, structId: id });
    props.push({ kind: 'bedroll', x: sx + 4, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'weaponRack', x: sx - 3, y: sy + 2, w: 1, h: 1, structId: id });
  }

  // 4. 12 Ancient Isekai Shrines & Ruined Summoning Portals
  for (let i = 0; i < 12; i++) {
    const spot = pickSpot(8, 8, false);
    if (!spot) break;
    const sx = spot.cx * SCALE + 5;
    const sy = spot.cy * SCALE + 5;
    const id = 'shrine-' + i;
    const isPortal = i % 3 === 0;
    structures.push({ id: id, kind: 'isekaiShrine', isPortal: isPortal, name: isPortal ? 'Ruined Summon Gate' : 'Ancient Goddess Shrine', x: sx, y: sy, w: 6, h: 5 });
    props.push({ kind: isPortal ? 'portalRuins' : 'shrine', x: sx, y: sy - 1, w: 1, h: 1, structId: id });
    props.push({ kind: 'ruinPillar', x: sx - 2, y: sy + 1, w: 1, h: 1, structId: id });
    props.push({ kind: 'ruinPillar', x: sx + 2, y: sy + 1, w: 1, h: 1, structId: id });
  }

  // 5. 5 Hot Springs in the mountains and the forests (a bath: rest, friends, see logic/isekai/springs.js)
  for (let i = 0; i < 5; i++) {
    const spot = pickSpot(7, 8, false, ['mountain', 'forest']);
    if (!spot) break;
    const sx = spot.cx * SCALE + 5;
    const sy = spot.cy * SCALE + 5;
    const id = 'spring-' + i;
    structures.push({ id: id, kind: 'hotSpring', name: 'Hot Spring', x: sx, y: sy, w: 8, h: 6 });
    props.push({ kind: 'hotSpring', x: sx - 2, y: sy - 1, w: 4, h: 3, structId: id });
    props.push({ kind: 'bench', x: sx + 3, y: sy + 2, w: 1, h: 1, structId: id });
    props.push({ kind: 'signpost', x: sx - 3, y: sy + 2, w: 1, h: 1, structId: id });
  }

  // 6. 6 Graves of the friends of the Lost Hero, the first summoned one (a page of his diary at each, see logic/isekai/lostHero.js)
  for (let i = 0; i < 6; i++) {
    const spot = pickSpot(6, 10, false);
    if (!spot) break;
    const sx = spot.cx * SCALE + 5;
    const sy = spot.cy * SCALE + 5;
    const id = 'grave-' + i;
    structures.push({ id: id, kind: 'heroGrave', name: 'Forgotten Grave', grave: i, x: sx, y: sy, w: 5, h: 4 });
    props.push({ kind: 'heroGrave', x: sx, y: sy, w: 1, h: 1, structId: id });
    props.push({ kind: 'grave', x: sx - 2, y: sy + 1, w: 1, h: 1, structId: id });
    props.push({ kind: 'grave', x: sx + 2, y: sy + 1, w: 1, h: 1, structId: id });
  }

  return { structures, props };
}

const ISEKAI_BUILT = findIsekaiStructures();
export const WILD_STRUCTURES = ISEKAI_BUILT.structures;
export const WILD_STRUCTURE_PROPS = ISEKAI_BUILT.props;
