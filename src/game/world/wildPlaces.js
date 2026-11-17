import { OBELISKS } from '../data/dungeons';
import { STRUCTURES_50 } from '../data/structures50';
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

// ---------- Isekai wilderness structures (all 50 blueprints + scenic decorations) ----------

const structRandom = randomOf('isekai50');
const CAMP_SPECIES = {
  meadow: ['slime', 'goblin', 'wolf'],
  forest: ['wolf', 'goblin', 'spider', 'orc'],
  mountain: ['orc', 'wolf', 'harpy', 'stoneGolem'],
  desert: ['lizardman', 'goblin', 'orc', 'drake'],
  coast: ['goblin', 'drowner', 'harpy', 'lizardman'],
  demon: ['cultist', 'darkKnight', 'shadowMage'],
};
const MONSTER_CAMP_NAMES = ['Goblin Warpost', 'Wolf Den', 'Feral Stockade', 'Raider Outpost', 'Bone Clearing', 'Demon Vanguard'];

function isShoreCell(cx, cy) {
  return (
    paintedGround(cx - 1, cy) === 'water' ||
    paintedGround(cx + 1, cy) === 'water' ||
    paintedGround(cx, cy - 1) === 'water' ||
    paintedGround(cx, cy + 1) === 'water'
  );
}

// Pre-buckets walkable candidate cells per biome + shoreline so every one of the 50 structures spawns reliably & fast.
function collectBiomeBuckets() {
  const buckets = { meadow: [], forest: [], mountain: [], desert: [], coast: [], demon: [], shore: [] };
  for (let cy = 7; cy < CELLS - 8; cy += 2) {
    for (let cx = 7; cx < CELLS - 8; cx += 2) {
      if (!isWalkableCell(cx, cy) || !isWalkableCell(cx + 1, cy) || !isWalkableCell(cx, cy + 1)) continue;
      const biome = paintedBiome(cx, cy);
      if (buckets[biome]) buckets[biome].push({ cx, cy, biome });
      if (biome !== 'demon' && (biome === 'coast' || isShoreCell(cx, cy))) buckets.shore.push({ cx, cy, biome });
    }
  }
  return buckets;
}

// Attaches tailored decorative accents around each of the 50 structure archetypes.
function addStructureProps(def, id, sx, sy, props, variant) {
  const kind = def.id;
  if (kind === 'monsterCamp') {
    props.push({ kind: 'tent', look: 'monster', x: sx - 4, y: sy - 3, w: 6, h: 4, structId: id });
    props.push({ kind: 'campfire', x: sx + 2, y: sy, w: 1, h: 1, structId: id });
    props.push({ kind: 'monsterBanner', x: sx + 3, y: sy - 2, w: 1, h: 1, structId: id });
    props.push({ kind: 'bones', x: sx + 1, y: sy + 2, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'spikes', x: sx - 4, y: sy + 3, w: 1, h: 1, side: 'row', structId: id });
    return;
  }
  if (kind === 'banditTrap') {
    props.push({ kind: 'crates', x: sx, y: sy - 1, w: 1, h: 1, structId: id });
    props.push({ kind: 'spikeTrap', x: sx - 1, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'spikeTrap', x: sx + 1, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'tripwire', x: sx, y: sy + 2, w: 1, h: 1, walkable: true, structId: id });
    return;
  }
  if (kind === 'wayCamp') {
    props.push({ kind: 'tent', look: 'bandit', x: sx - 4, y: sy - 3, w: 6, h: 4, structId: id });
    props.push({ kind: 'cauldron', x: sx + 2, y: sy, w: 1, h: 1, structId: id });
    props.push({ kind: 'bedroll', x: sx + 4, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'weaponRack', x: sx - 3, y: sy + 2, w: 1, h: 1, structId: id });
    return;
  }
  if (kind === 'hotSpring') {
    props.push({ kind: 'hotSpring', x: sx - 2, y: sy - 1, w: 4, h: 3, structId: id });
    props.push({ kind: 'bench', x: sx + 3, y: sy + 2, w: 1, h: 1, structId: id });
    props.push({ kind: 'stoneLantern', x: sx - 3, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    return;
  }
  if (kind === 'heroGrave') {
    props.push({ kind: 'heroGrave', x: sx, y: sy, w: 1, h: 1, structId: id });
    props.push({ kind: 'grave', x: sx - 2, y: sy + 1, w: 1, h: 1, structId: id });
    props.push({ kind: 'grave', x: sx + 2, y: sy + 1, w: 1, h: 1, structId: id });
    props.push({ kind: 'flowerPot', variant: 1, x: sx, y: sy + 2, w: 1, h: 1, walkable: true, structId: id });
    return;
  }

  // Primary centerpiece prop of the structure
  props.push({ kind: def.propKind, x: sx, y: sy, w: 1, h: 1, structId: id });

  // Bespoke atmospheric ornaments around every structure family
  if (def.family === 'sacred') {
    props.push({ kind: 'stoneLantern', x: sx - 2, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'stoneLantern', x: sx + 2, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    if (kind === 'summonGate' || kind === 'isekaiShrine') {
      props.push({ kind: 'ruinPillar', x: sx - 2, y: sy - 1, w: 1, h: 1, structId: id });
      props.push({ kind: 'ruinPillar', x: sx + 2, y: sy - 1, w: 1, h: 1, structId: id });
    } else {
      props.push({ kind: 'flowerPot', variant: variant % 3, x: sx - 1, y: sy + 2, w: 1, h: 1, walkable: true, structId: id });
      props.push({ kind: 'flowerPot', variant: (variant + 1) % 3, x: sx + 1, y: sy + 2, w: 1, h: 1, walkable: true, structId: id });
    }
  } else if (def.family === 'travel') {
    props.push({ kind: 'bench', x: sx - 2, y: sy + 2, w: 2, h: 1, walkable: true, structId: id });
    props.push({ kind: 'stoneLantern', x: sx + 3, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    if (kind === 'lumberCamp' || kind === 'merchantOutpost') {
      props.push({ kind: 'barrels', x: sx - 3, y: sy, w: 1, h: 1, structId: id });
      props.push({ kind: 'crates', x: sx + 2, y: sy + 2, w: 1, h: 1, structId: id });
    } else {
      props.push({ kind: 'flowerBed', variant: variant % 3, x: sx + 1, y: sy + 2, w: 2, h: 1, walkable: true, structId: id });
    }
  } else if (def.family === 'monument') {
    props.push({ kind: 'topiary', x: sx - 3, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'topiary', x: sx + 3, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'flowerBed', variant: variant % 3, x: sx - 1, y: sy + 2, w: 2, h: 1, walkable: true, structId: id });
  } else if (def.family === 'danger') {
    props.push({ kind: 'bones', x: sx - 2, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'spikes', x: sx + 2, y: sy + 1, w: 1, h: 1, side: 'row', structId: id });
    if (kind === 'monsterBanner' || kind === 'goblinTotem' || kind === 'boneCairn') {
      props.push({ kind: 'campfire', x: sx + 2, y: sy - 1, w: 1, h: 1, structId: id });
    }
  } else {
    // Biome wonders
    props.push({ kind: 'stoneLantern', x: sx - 3, y: sy + 1, w: 1, h: 1, walkable: true, structId: id });
    props.push({ kind: 'flowerBed', variant: variant % 3, x: sx + 1, y: sy + 2, w: 2, h: 1, walkable: true, structId: id });
  }
}

function findIsekaiStructures() {
  const structures = [];
  const props = [];
  const occupied = [...CAVES, ...TOTEMS, ...WILD_CAMPFIRES];
  const buckets = collectBiomeBuckets();
  const basePlaces = [...ALL_PLACES, ...occupied].map((place) => ({ ...cellOf(place), pad: Math.max(place.w || 4, place.h || 4) / (2 * SCALE) }));

  const isSpotFree = (cx, cy, gapVillage, gapStruct) => {
    for (const p of basePlaces) {
      if (Math.hypot(p.cx - cx, p.cy - cy) - p.pad < gapVillage) return false;
    }
    for (const s of structures) {
      if (Math.hypot((s.x - 5) / SCALE - cx, (s.y - 5) / SCALE - cy) < gapStruct) return false;
    }
    return true;
  };

  const pickSpot = (biomes, gapVillage, gapStruct) => {
    const pool = [];
    for (const b of biomes) {
      if (buckets[b]) pool.push(...buckets[b]);
    }
    if (pool.length === 0) return null;
    for (let tries = 0; tries < 200; tries++) {
      const cand = pool[Math.floor(structRandom() * pool.length)];
      if (isSpotFree(cand.cx, cand.cy, gapVillage, gapStruct)) {
        return { cx: cand.cx, cy: cand.cy, biome: cand.biome, land: landOfCell(cand.cx, cand.cy) };
      }
    }
    for (const cand of pool) {
      if (isSpotFree(cand.cx, cand.cy, gapVillage - 1, Math.max(3, gapStruct - 2))) {
        return { cx: cand.cx, cy: cand.cy, biome: cand.biome, land: landOfCell(cand.cx, cand.cy) };
      }
    }
    return null;
  };

  let graveIdx = 0;
  for (const def of STRUCTURES_50) {
    for (let i = 0; i < def.count; i++) {
      const spot = pickSpot(def.biomes, 7, def.gapStruct || 6);
      if (!spot) continue;
      const sx = spot.cx * SCALE + 5;
      const sy = spot.cy * SCALE + 5;
      const id = def.id + '-' + i;
      const speciesList = spot.land.species && spot.land.species.length > 0 ? spot.land.species : CAMP_SPECIES[spot.biome] || CAMP_SPECIES.meadow;
      const entry = {
        id: id,
        kind: def.id,
        structNum: def.num,
        family: def.family,
        name: def.id === 'monsterCamp' ? pickWith(structRandom, MONSTER_CAMP_NAMES) + ' #' + (i + 1) : def.name,
        x: sx,
        y: sy,
        w: def.w,
        h: def.h,
        biome: spot.biome,
        action: def.action,
        rewardItem: def.rewardItem || null,
        isPortal: Boolean(def.isPortal),
        species: speciesList,
        danger: Math.max(1, spot.land.danger),
        grave: def.id === 'heroGrave' ? graveIdx++ : undefined,
        text: def.text,
      };
      structures.push(entry);
      addStructureProps(def, id, sx, sy, props, i + def.num);
    }
  }

  // Rich scatter of bush shapes, weapon monuments, flowers, greenery and burrows/holes across all biomes!
  const SCATTER = [
    // Shaped bushes & thickets (meadow, forest)
    { biomes: ['meadow', 'forest'], kinds: ['bushHeart', 'bushSpiral', 'bushSword', 'bushCrown', 'bushDragon', 'bushRose', 'bushHydrangea', 'bushBerry', 'bushBerryBlue', 'bushBamboo'], count: 90, walkable: true },
    // Martial monuments & old battle relics
    { biomes: ['meadow', 'forest', 'mountain', 'desert'], kinds: ['greatswordStone', 'crossedHalberds', 'knightArmorStand', 'archeryTarget', 'shieldPedestal', 'warDrums', 'anvilHammer', 'cannonDisplay'], count: 48, walkable: true },
    // Botanical flower patches
    { biomes: ['meadow', 'forest'], kinds: ['roseBush', 'lavenderRow', 'sunflowerPatch', 'tulipBed', 'bluebells', 'poppies', 'moonflower', 'flowerArch', 'flowerBed'], count: 140, walkable: true },
    // Desert, coast & waterside flora
    { biomes: ['desert'], kinds: ['cactusFlower', 'craterPit'], count: 40, walkable: true },
    { biomes: ['shore', 'coast'], kinds: ['hibiscusBush', 'waterReed', 'groundPuddle', 'cloverPatch'], count: 44, walkable: true },
    // Woodland greenery
    { biomes: ['meadow', 'forest'], kinds: ['fernCluster', 'mossyLog', 'reedTuft', 'cloverPatch', 'bambooShoot', 'hedgeRow', 'stoneLantern'], count: 120, walkable: true },
    // Animal burrows & natural holes (rabbits hop right around rabbitBurrow!)
    { biomes: ['meadow', 'forest'], kinds: ['rabbitBurrow', 'rabbitBurrow', 'foxDen', 'badgerHole', 'hollowStump', 'groundPuddle', 'craterPit'], count: 76, walkable: true },
    // Everyday countryside & real-life nature elements across farms, woods, shores, and highland paths
    { biomes: ['meadow'], kinds: ['hayBale', 'beehive', 'picnicBlanket', 'stoneBench', 'waterPump', 'birdhouse', 'milkChurns', 'scarecrow', 'wheelbarrow', 'doghouse', 'mailbox', 'laundryLine'], count: 96, walkable: true },
    { biomes: ['forest'], kinds: ['mushroomRing', 'fallenLeafPile', 'anthill', 'woodPile', 'picnicBlanket'], count: 80, walkable: true },
    { biomes: ['shore', 'coast'], kinds: ['fishingGear', 'reedNest', 'picnicBlanket', 'waterPump', 'coconutPalm'], count: 64, walkable: true },
    { biomes: ['mountain'], kinds: ['woodPile', 'stoneBench', 'fallenLeafPile'], count: 30, walkable: true },
    // Wild orchards, Mediterranean groves, vineyards & edible berry/melon/pumpkin beds
    { biomes: ['meadow', 'forest'], kinds: ['appleTree', 'pearTree', 'cherryTree', 'peachTree', 'plumTree', 'grapeVine', 'pumpkinPatch', 'melonPatch', 'strawberryPatch'], count: 144, walkable: true },
    { biomes: ['meadow', 'desert'], kinds: ['orangeTree', 'lemonTree', 'figTree', 'oliveTree'], count: 56, walkable: true },
    { biomes: ['desert'], kinds: ['coconutPalm', 'oliveTree', 'figTree'], count: 24, walkable: true },
  ];

  for (const batch of SCATTER) {
    const pool = [];
    for (const b of batch.biomes) if (buckets[b]) pool.push(...buckets[b]);
    if (pool.length === 0) continue;
    for (let i = 0; i < batch.count; i++) {
      const cand = pool[Math.floor(structRandom() * pool.length)];
      const kind = batch.kinds[i % batch.kinds.length];
      const ox = (structRandom() - 0.5) * 6;
      const oy = (structRandom() - 0.5) * 6;
      const px = Math.round(cand.cx * SCALE + 5 + ox);
      const py = Math.round(cand.cy * SCALE + 5 + oy);
      if (isSpotFree(cand.cx, cand.cy, 3, 1.5)) {
        props.push({ kind: kind, x: px, y: py, w: 1, h: 1, walkable: batch.walkable });
      }
    }
  }

  return { structures, props };
}

const ISEKAI_BUILT = findIsekaiStructures();
export const WILD_STRUCTURES = ISEKAI_BUILT.structures;
export const WILD_STRUCTURE_PROPS = ISEKAI_BUILT.props;
