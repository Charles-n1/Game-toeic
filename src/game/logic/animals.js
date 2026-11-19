import { villageOf, zoneAt } from '../data/zones';
import { isSolid, TILE, tileAt, propsAround, biomeAt } from '../world/map';
import { WILD_ANIMALS_CATALOG } from '../data/decorations';
import { ITEMS } from '../data/items';
import { pickRandom } from '../../logic/random';
import { addItem, gainXp, strikePower } from './player';
import { wearGear } from './durability';
import { notify } from './messages';
import { addTrack, bloodHit, bloodSplatter, burst, dust, floatText } from './particles';
import { cue } from './cues';
import { startFight } from './fight';
import { ANIMAL_DROPS, FIGHT_ANIMALS, herdBackupsFor, isFighterAnimal, makeAnimalOpponent, shouldCounterFight } from './animalFight';
import { provokePartyOnStrike } from './worldParties';

// Farm animals & wild herds across the world, featuring species-authentic speeds,
// real-life behavioral AI patterns, anti-one-shot resilience, burrow escapes, and counter-attack fights.

const KINDS = ['cow', 'pig', 'horse', 'chicken'];
const MAX_SHOWN = 3; // per kind and per pen
const MAX_WILD_ANIMALS = 18;
const WILD_META = Object.fromEntries(WILD_ANIMALS_CATALOG.map((w) => [w.id, w]));
const FARM_META = {
  cow: { name: 'Village Cow', speed: 0.4, fleeSpeed: 3.0, pattern: 'heavyCharge', hp: 290 },
  pig: { name: 'Farm Pig', speed: 0.55, fleeSpeed: 3.4, pattern: 'heavyCharge', hp: 165 },
  chicken: { name: 'Farm Chicken', speed: 0.9, fleeSpeed: 4.2, pattern: 'dartPeck', hp: 80 },
  horse: { name: 'Pasture Horse', speed: 1.0, fleeSpeed: 6.5, pattern: 'gallopPlains', hp: 280 },
};

const HOOF_KINDS = new Set(['deer', 'doe', 'fawn', 'wildHorse', 'foal', 'boar', 'sheep', 'goat', 'moose', 'bison']);
const SHY_KINDS = new Set(['rabbit', 'rabbitBrown', 'deer', 'doe', 'fawn', 'fox', 'squirrel', 'wildHorse', 'foal', 'goat', 'sparrow', 'crow', 'duck', 'duckling', 'pheasant', 'goose', 'heron', 'swan', 'frog']);
export const HOSTILE_WILDLIFE = new Set(['wolf', 'bear', 'boar', 'bison']);

export const HERD_TEMPLATES = {
  deerHerd: { label: 'Deer Herd', members: ['deer', 'doe', 'doe', 'fawn', 'fawn'], shy: true, walkSpeed: 0.72, fleeSpeed: 6.5, grazeChance: 0.55 },
  boarHerd: { label: 'Boar Sounder', members: ['boar', 'piglet', 'piglet'], shy: true, walkSpeed: 0.68, fleeSpeed: 4.9, grazeChance: 0.5 },
  wildHorseHerd: { label: 'Wild Horse Herd', members: ['wildHorse', 'wildHorse', 'foal'], shy: true, walkSpeed: 0.95, fleeSpeed: 7.4, grazeChance: 0.45 },
  sheepFlock: { label: 'Sheep Flock', members: ['sheep', 'sheep', 'lamb', 'shepherdDog'], shy: false, walkSpeed: 0.48, fleeSpeed: 2.8, grazeChance: 0.65 },
  goatHerd: { label: 'Alpine Goat Herd', members: ['goat', 'goat', 'goat'], shy: true, walkSpeed: 0.58, fleeSpeed: 4.5, grazeChance: 0.55 },
  waterfowlFlock: { label: 'Waterfowl Flock', members: ['swan', 'duck', 'duckling', 'goose'], shy: true, walkSpeed: 0.45, fleeSpeed: 4.8, grazeChance: 0.55 },
  rabbitWarren: { label: 'Rabbit Family', members: ['rabbit', 'rabbitBrown', 'rabbit'], shy: true, walkSpeed: 0.78, fleeSpeed: 5.7, grazeChance: 0.6 },
  birdFlock: { label: 'Bird Flock', members: ['sparrow', 'pheasant', 'crow'], shy: true, walkSpeed: 0.85, fleeSpeed: 5.5, grazeChance: 0.5 },
  wolfPack: { label: 'Wolf Pack', members: ['wolf', 'wolf', 'wolf'], shy: false, walkSpeed: 1.15, fleeSpeed: 6.0, grazeChance: 0.3 },
  bisonHerd: { label: 'Bison Herd', members: ['bison', 'bison', 'bison'], shy: false, walkSpeed: 0.58, fleeSpeed: 5.2, grazeChance: 0.6 },
  gooseGaggle: { label: 'Goose Gaggle', members: ['goose', 'goose', 'duck'], shy: true, walkSpeed: 0.52, fleeSpeed: 5.0, grazeChance: 0.55 },
};

let nextHerdSeq = 1;

export function animalSpecOf(kind) {
  return WILD_META[kind] || FARM_META[kind] || { name: kind, speed: 0.9, fleeSpeed: 3.8, pattern: 'boundingHerd', hp: 35 };
}

function initStats(obj) {
  const spec = animalSpecOf(obj.kind);
  obj.hp = spec.hp;
  obj.maxHp = spec.hp;
  obj.hitAt = 0;
  obj.angryUntil = 0;
  obj.panicUntil = 0;
  obj.curledUntil = 0;
  obj.attackCd = 0;
  obj.zigTimer = 0;
  obj.zigSign = Math.random() < 0.5 ? 1 : -1;
  obj.flankSign = Math.random() < 0.5 ? 1 : -1;
  return obj;
}

function animalsOfVillage(game, village) {
  const vState = game.villages[village.id];
  const pens = village.plan.pens;
  if (!vState || pens.length === 0) return [];
  const counts = vState.animals || {};

  // Keep persisted farm pen animals across wake/sleep and new days rather than wiping them!
  if (Array.isArray(vState.penState) && vState.penState.length > 0) {
    return vState.penState.map((saved) => ({
      ...initStats({ kind: saved.kind, pen: saved.pen || pens[0], village: village.id, x: saved.x, y: saved.y, walkX: 0, walkY: 0, walkTime: Math.random() * 2, step: saved.step || Math.random() * 4, dir: saved.dir || 'right' }),
      hp: Math.min(saved.maxHp || 100, saved.hp ?? saved.maxHp ?? 100),
      maxHp: saved.maxHp || animalSpecOf(saved.kind).hp,
    }));
  }

  const animals = [];
  for (const kind of KINDS) {
    for (let i = 0; i < Math.min(counts[kind] || 0, MAX_SHOWN * pens.length); i++) {
      const pen = pens[i % pens.length];
      animals.push(initStats({
        kind: kind,
        pen: pen,
        village: village.id,
        x: pen.x + 0.5 + Math.random() * (pen.w - 1),
        y: pen.y + 0.5 + Math.random() * (pen.h - 1),
        walkX: 0,
        walkY: 0,
        walkTime: 0,
        step: Math.random() * 4,
        dir: 'right',
      }));
    }
  }
  vState.penState = animals.map((a) => ({ kind: a.kind, pen: a.pen, x: a.x, y: a.y, hp: a.hp, maxHp: a.maxHp, dir: a.dir, step: a.step }));
  return animals;
}

export function syncPenAnimals(game) {
  if (!game?.run?.animals || !game?.villages) return;
  const byVillage = {};
  for (const animal of game.run.animals) {
    if (!animal.village) continue;
    if (!byVillage[animal.village]) byVillage[animal.village] = [];
    byVillage[animal.village].push({
      kind: animal.kind,
      pen: animal.pen,
      x: animal.x,
      y: animal.y,
      hp: animal.hp,
      maxHp: animal.maxHp,
      dir: animal.dir,
      step: animal.step,
    });
  }
  for (const [vid, list] of Object.entries(byVillage)) {
    if (game.villages[vid]) game.villages[vid].penState = list;
  }
}

export function placeAnimals(game) {
  syncPenAnimals(game);
  game.run.animals = (game.run.awake || []).flatMap((id) => animalsOfVillage(game, villageOf(id)));
}

function isNearWater(x, y) {
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]]) {
    if (tileAt(x + dx, y + dy) === TILE.WATER) return true;
  }
  return false;
}

function wildlifeChoicesAt(x, y) {
  const zone = zoneAt(x, y);
  if (zone.kind === 'village') return ['rabbit', 'rabbitBrown', 'squirrel', 'sparrow', 'hedgehog'];
  const biome = biomeAt(x, y);
  if (isNearWater(x, y)) return ['duck', 'goose', 'swan', 'frog', 'turtle', 'heron', 'moose'];
  if (biome === 'forest') return ['rabbitBrown', 'fox', 'deer', 'doe', 'squirrel', 'hedgehog', 'owl', 'boar', 'bear', 'moose', 'wolf', 'pheasant'];
  if (biome === 'mountain') return ['goat', 'sheep', 'fox', 'owl', 'wolf', 'bear'];
  if (biome === 'desert') return ['turtle', 'goat', 'rabbitBrown'];
  if (biome === 'demon') return ['owl'];
  return ['rabbit', 'rabbitBrown', 'fox', 'deer', 'pheasant', 'hedgehog', 'frog', 'sparrow', 'bison'];
}

function herdChoiceAt(x, y) {
  const zone = zoneAt(x, y);
  if (zone.kind === 'village') return Math.random() < 0.5 ? 'sheepFlock' : 'birdFlock';
  if (isNearWater(x, y)) return Math.random() < 0.5 ? 'waterfowlFlock' : 'gooseGaggle';
  const biome = biomeAt(x, y);
  if (biome === 'forest') return pickRandom(['deerHerd', 'deerHerd', 'boarHerd', 'wolfPack', 'rabbitWarren']);
  if (biome === 'mountain') return pickRandom(['goatHerd', 'sheepFlock', 'wolfPack']);
  if (biome === 'desert') return 'goatHerd';
  if (biome === 'demon') return null;
  return pickRandom(['deerHerd', 'wildHorseHerd', 'bisonHerd', 'sheepFlock', 'rabbitWarren', 'birdFlock']);
}

function canWalkCell(x, y) {
  return !isSolid(x, y) && tileAt(x, y) !== TILE.WATER;
}

export function spawnHerd(game, herdKind, cx, cy, homeKey = null) {
  const tpl = HERD_TEMPLATES[herdKind];
  if (!tpl) return [];
  if (!Array.isArray(game.run.wildAnimals)) game.run.wildAnimals = [];
  if (!game.run.herds || typeof game.run.herds !== 'object') game.run.herds = {};

  const herdId = 'herd-' + (nextHerdSeq++);
  const angle = Math.random() * Math.PI * 2;
  const herd = {
    id: herdId,
    kind: herdKind,
    label: tpl.label,
    shy: tpl.shy,
    walkSpeed: tpl.walkSpeed,
    fleeSpeed: tpl.fleeSpeed || 5.2,
    grazeChance: tpl.grazeChance,
    originX: cx,
    originY: cy,
    x: cx,
    y: cy,
    walkX: Math.cos(angle),
    walkY: Math.sin(angle),
    timer: 1.5 + Math.random() * 2.5,
    fleeUntil: 0,
    fleeX: 0,
    fleeY: 0,
    orbitPhase: Math.random() * Math.PI * 2,
  };
  game.run.herds[herdId] = herd;

  const spawned = [];
  const count = tpl.members.length;
  for (let i = 0; i < count && game.run.wildAnimals.length < MAX_WILD_ANIMALS; i++) {
    const kind = tpl.members[i];
    const ringAngle = (i / Math.max(1, count - 1)) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const radius = i === 0 ? 0.2 : 1.1 + (i % 2) * 0.75 + Math.random() * 0.5;
    const ox = Math.cos(ringAngle) * radius;
    const oy = Math.sin(ringAngle) * radius;
    const sx = canWalkCell(cx + ox, cy + oy) ? cx + ox : cx;
    const sy = canWalkCell(cx + ox, cy + oy) ? cy + oy : cy;
    const member = initStats({
      kind: kind,
      herdId: herdId,
      herdKind: herdKind,
      role: i === 0 ? 'leader' : kind === 'shepherdDog' ? 'herder' : 'follower',
      homeKey: i === 0 ? homeKey : null,
      offsetX: ox,
      offsetY: oy,
      homeX: cx,
      homeY: cy,
      x: sx,
      y: sy,
      walkX: 0,
      walkY: 0,
      walkTime: 0.4 + Math.random() * 1.6,
      step: Math.random() * 4,
      trackStep: 0,
      dir: Math.random() < 0.5 ? 'left' : 'right',
    });
    game.run.wildAnimals.push(member);
    spawned.push(member);
  }
  return spawned;
}

export function wakeAnimals(game) {
  const awake = game.run.awake || [];
  const awakeSet = new Set(awake);
  syncPenAnimals(game);
  // Keep already-live pen animals for awake villages without resetting them!
  game.run.animals = (game.run.animals || []).filter((animal) => awakeSet.has(animal.village));
  const shown = new Set(game.run.animals.map((animal) => animal.village));
  for (const id of awake) {
    if (!shown.has(id)) {
      const v = villageOf(id);
      if (v) game.run.animals.push(...animalsOfVillage(game, v));
    }
  }

  if (!Array.isArray(game.run.wildAnimals)) game.run.wildAnimals = [];
  if (!game.run.herds || typeof game.run.herds !== 'object') game.run.herds = {};
  if (zoneAt(game.player.x, game.player.y).kind === 'inside') {
    game.run.wildAnimals = [];
    game.run.herds = {};
    return;
  }

  game.run.wildAnimals = game.run.wildAnimals.filter((w) => w.hp > 0 && Math.hypot(w.x - game.player.x, w.y - game.player.y) < 34);
  const activeHerds = new Set(game.run.wildAnimals.map((w) => w.herdId).filter(Boolean));
  for (const id of Object.keys(game.run.herds)) {
    if (!activeHerds.has(id)) delete game.run.herds[id];
  }

  if (game.run.wildAnimals.length < MAX_WILD_ANIMALS) {
    for (const prop of propsAround(game.player.x, game.player.y, 18)) {
      if (game.run.wildAnimals.length >= MAX_WILD_ANIMALS) break;
      if (!['rabbitBurrow', 'foxDen', 'hollowStump', 'doghouse'].includes(prop.kind)) continue;
      const key = prop.kind + ':' + prop.x + ',' + prop.y;
      if (game.run.wildAnimals.some((w) => w.homeKey === key)) continue;
      if (prop.kind === 'rabbitBurrow' && game.run.wildAnimals.length <= MAX_WILD_ANIMALS - 3) {
        spawnHerd(game, 'rabbitWarren', prop.x + 0.5, prop.y + 0.8, key);
      } else {
        const kind = prop.kind === 'rabbitBurrow' ? (Math.random() < 0.5 ? 'rabbit' : 'rabbitBrown') : prop.kind === 'foxDen' ? 'fox' : prop.kind === 'doghouse' ? 'shepherdDog' : 'squirrel';
        game.run.wildAnimals.push(initStats({
          kind: kind,
          homeKey: key,
          homeX: prop.x + 0.5,
          homeY: prop.y + 0.8,
          x: prop.x + (Math.random() - 0.5) * 2.2,
          y: prop.y + 0.6 + Math.random() * 1.4,
          walkX: 0,
          walkY: 0,
          walkTime: 0.5 + Math.random() * 2,
          step: Math.random() * 4,
          trackStep: 0,
          dir: Math.random() < 0.5 ? 'left' : 'right',
        }));
      }
    }
  }

  const herdCount = Object.keys(game.run.herds).length;
  for (let tries = 0; tries < 6 && herdCount + tries < 2 && game.run.wildAnimals.length <= MAX_WILD_ANIMALS - 3; tries++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 16;
    const x = game.player.x + Math.cos(angle) * dist;
    const y = game.player.y + Math.sin(angle) * dist;
    if (!canWalkCell(x, y)) continue;
    const herdKind = herdChoiceAt(x, y);
    if (!herdKind) continue;
    spawnHerd(game, herdKind, x, y);
  }

  for (let tries = 0; tries < 3 && game.run.wildAnimals.length < MAX_WILD_ANIMALS; tries++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 8 + Math.random() * 16;
    const x = game.player.x + Math.cos(angle) * dist;
    const y = game.player.y + Math.sin(angle) * dist;
    if (!canWalkCell(x, y)) continue;
    const kind = pickRandom(wildlifeChoicesAt(x, y));
    game.run.wildAnimals.push(initStats({
      kind: kind,
      homeX: x,
      homeY: y,
      x: x,
      y: y,
      walkX: 0,
      walkY: 0,
      walkTime: Math.random() * 2,
      step: Math.random() * 4,
      trackStep: 0,
      dir: Math.random() < 0.5 ? 'left' : 'right',
    }));
  }
}

// ---------- Hunting, Slaying & Realistic Defense/Evasion ----------

function killAnimal(game, animal) {
  bloodSplatter(game, animal.x, animal.y, 12);
  burst(game, animal.x, animal.y, '#e04848', 10);
  cue(game, 'hit');

  const drops = ANIMAL_DROPS[animal.kind] || [['rawMeat', 1]];
  const parts = [];
  for (const [itemId, qty] of drops) {
    if (!ITEMS[itemId]) continue;
    addItem(game.player, itemId, qty);
    parts.push(`${ITEMS[itemId].name}×${qty}`);
  }

  const label = animalSpecOf(animal.kind).name || animal.kind;
  floatText(game, animal.x, animal.y - 0.6, parts[0] ? '+' + parts[0] : label, '#ffd8a8');

  if (animal.village && game.villages[animal.village]) {
    const counts = game.villages[animal.village].animals;
    if (counts[animal.kind] > 0) counts[animal.kind] -= 1;
    game.happiness = Math.max(0, (game.happiness || 50) - 2);
    notify(game, `🥩 Butchered village ${animal.kind} (+${parts.join(', ')}) — villagers disapprove!`, '#ffb070');
  } else {
    gainXp(game, (animal.maxHp || 35) >= 100 ? 8 : 3);
    notify(game, `🏹 Hunted ${label}: +${parts.join(', ')}`, '#ffe0a8');
  }

  const herd = animal.herdId && game.run.herds ? game.run.herds[animal.herdId] : null;
  if (herd && herd.shy) {
    const dx = animal.x - game.player.x;
    const dy = animal.y - game.player.y;
    const len = Math.max(0.2, Math.hypot(dx, dy));
    herd.fleeUntil = 2.8;
    herd.fleeX = dx / len;
    herd.fleeY = dy / len;
  }

  game.run.wildAnimals = (game.run.wildAnimals || []).filter((w) => w !== animal);
  game.run.animals = (game.run.animals || []).filter((a) => a !== animal);
}

export function startAnimalFight(game, animal) {
  if (!animal || game.run.fight || game.run.screen !== 'play') return false;
  const opp = makeAnimalOpponent(game, animal);
  const backups = herdBackupsFor(game, animal);
  const herd = animal.herdId && game.run.herds ? game.run.herds[animal.herdId] : null;
  const suffix = backups.length > 0 && herd ? ` (${herd.label} charges!)` : ' counter-attacks!';
  notify(game, `⚔️ ${opp.name}${suffix}`, '#ff8a95');
  startFight(game, opp, backups);
  return true;
}

export function hurtAnimal(game, animal, damage, isMelee = false) {
  if (!animal || (animal.hp !== undefined && animal.hp <= 0)) return false;
  if (animal.hp === undefined) initStats(animal);
  const now = Date.now();
  const spec = animalSpecOf(animal.kind);
  const rawDmg = Math.max(1, Math.round(damage));
  const curled = spec.pattern === 'curlDefense' && animal.curledUntil && animal.curledUntil > now;
  const reduced = curled ? Math.max(1, Math.round(rawDmg * 0.45)) : rawDmg;

  // Healthy animals react/bolt on the first hit instead of getting passively one-shot.
  const firstHitCap = animal.hp > Math.floor(animal.maxHp * 0.48)
    ? Math.max(1, Math.floor(animal.maxHp * 0.58))
    : reduced;
  const amount = Math.max(1, Math.min(firstHitCap, reduced));

  animal.hp = Math.max(0, animal.hp - amount);
  animal.hitAt = now;
  bloodHit(game, animal.x, animal.y, 7);
  floatText(game, animal.x, animal.y - 0.5, '-' + amount, '#ff7a7a');
  cue(game, 'hit');

  if (animal.kind === 'hedgehog' && curled && Math.hypot(animal.x - game.player.x, animal.y - game.player.y) < 2.5) {
    game.player.health = Math.max(1, Math.round(game.player.health) - 2);
    floatText(game, game.player.x, game.player.y - 0.7, '-2 Spines!', '#ffd23f');
  }

  if (animal.hp <= 0) {
    killAnimal(game, animal);
    return true;
  }

  if (spec.pattern === 'curlDefense') {
    animal.curledUntil = now + 3800;
    animal.walkX = 0;
    animal.walkY = 0;
    return true;
  }

  const dx = animal.x - game.player.x;
  const dy = animal.y - game.player.y;
  const dist = Math.hypot(dx, dy);
  const len = Math.max(0.2, dist);
  if (HOSTILE_WILDLIFE.has(animal.kind) || (isFighterAnimal(animal.kind) && shouldCounterFight(animal, dist, isMelee))) {
    animal.angryUntil = now + 7000;
    if (!game.run.fight && shouldCounterFight(animal, dist, isMelee)) {
      startAnimalFight(game, animal);
    }
  } else {
    animal.panicUntil = now + 3400;
    const herd = animal.herdId && game.run.herds ? game.run.herds[animal.herdId] : null;
    if (herd && herd.shy) {
      herd.fleeUntil = 2.6;
      herd.fleeX = dx / len;
      herd.fleeY = dy / len;
    }
    animal.walkX = dx / len;
    animal.walkY = dy / len;
    animal.walkTime = 1.6;
  }
  return true;
}

const SLASH_VECTORS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// Melee hunting strike in front of the hero: it wounds or kills the animal there.
export function strikeWorld(game) {
  const player = game.player;
  const [fx, fy] = SLASH_VECTORS[player.dir] || SLASH_VECTORS.down;
  game.run.slashUntil = Date.now() + 200;
  game.run.slashDir = player.dir;

  const candidates = [...(game.run.wildAnimals || []), ...(game.run.animals || [])]
    .map((animal) => {
      const dx = animal.x - player.x;
      const dy = animal.y - player.y;
      const dist = Math.hypot(dx, dy);
      const facingScore = dist > 0.05 ? (dx * fx + dy * fy) / dist : 1;
      return { animal, dist, facingScore };
    })
    .filter((entry) => entry.dist <= 2.35 && (entry.dist <= 1.15 || entry.facingScore > -0.25))
    .sort((a, b) => a.dist - b.dist);

  if (candidates.length === 0) {
    if (provokePartyOnStrike(game, 2.35)) return true;
    cue(game, 'hit');
    return false;
  }

  const dmg = Math.max(16, strikePower(player, game) + 6);
  const hitCount = Math.min(3, candidates.length);
  for (let i = 0; i < hitCount; i++) {
    hurtAnimal(game, candidates[i].animal, dmg, true);
    if (game.run.fight) break;
  }
  wearGear(game, 'weapon', 1);
  return true;
}

// ---------- Species-Specific Patterns & Realistic Speeds ----------

function rotateVec(x, y, rad) {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [x * c - y * s, x * s + y * c];
}

function updateHerdAnchor(herd, dt) {
  herd.orbitPhase += dt * 0.85;
  if (herd.fleeUntil > 0) {
    herd.fleeUntil = Math.max(0, herd.fleeUntil - dt);
    const spd = (herd.fleeSpeed || 5.2) * dt;
    const nx = herd.x + herd.fleeX * spd;
    const ny = herd.y + herd.fleeY * spd;
    if (canWalkCell(nx, herd.y)) herd.x = nx;
    if (canWalkCell(herd.x, ny)) herd.y = ny;
    return;
  }

  herd.timer -= dt;
  if (herd.timer <= 0) {
    const drift = Math.hypot(herd.x - herd.originX, herd.y - herd.originY);
    if (drift > 13) {
      herd.walkX = (herd.originX - herd.x) / drift;
      herd.walkY = (herd.originY - herd.y) / drift;
    } else if (Math.random() < herd.grazeChance) {
      herd.walkX = 0;
      herd.walkY = 0;
    } else {
      const a = Math.random() * Math.PI * 2;
      herd.walkX = Math.cos(a);
      herd.walkY = Math.sin(a);
    }
    herd.timer = 2 + Math.random() * 3.5;
  }

  if (herd.walkX !== 0 || herd.walkY !== 0) {
    const nx = herd.x + herd.walkX * herd.walkSpeed * dt;
    const ny = herd.y + herd.walkY * herd.walkSpeed * dt;
    if (canWalkCell(nx, herd.y)) herd.x = nx;
    else herd.walkX = -herd.walkX;
    if (canWalkCell(herd.x, ny)) herd.y = ny;
    else herd.walkY = -herd.walkY;
  }
}

function separationForce(animal, others) {
  let sx = 0;
  let sy = 0;
  for (const other of others) {
    if (other === animal) continue;
    const dx = animal.x - other.x;
    const dy = animal.y - other.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > 0.0001 && d2 < 0.6) {
      const d = Math.sqrt(d2);
      const push = (0.78 - d) * 1.4;
      sx += (dx / d) * push;
      sy += (dy / d) * push;
    }
  }
  return { sx, sy };
}

function pickCalmPatternStep(animal, spec, homeX = animal.homeX, homeY = animal.homeY) {
  const fromHome = Math.hypot(animal.x - homeX, animal.y - homeY);
  if (fromHome > 5) {
    animal.walkX = (homeX - animal.x) / fromHome;
    animal.walkY = (homeY - animal.y) / fromHome;
    animal.walkTime = 1.1;
    return;
  }
  const p = spec.pattern;
  if (p === 'zigzagWarren') {
    const freeze = Math.random() < 0.55;
    animal.walkX = freeze ? 0 : Math.cos(Math.random() * Math.PI * 2);
    animal.walkY = freeze ? 0 : Math.sin(Math.random() * Math.PI * 2);
    animal.walkTime = freeze ? 1.1 + Math.random() * 1.4 : 0.45 + Math.random() * 0.5;
  } else if (p === 'leapPause') {
    const wait = Math.random() < 0.68;
    const a = Math.random() * Math.PI * 2;
    animal.walkX = wait ? 0 : Math.cos(a);
    animal.walkY = wait ? 0 : Math.sin(a);
    animal.walkTime = wait ? 1.8 + Math.random() * 1.8 : 0.35;
  } else if (p === 'dartPeck') {
    const peck = Math.random() < 0.5;
    const a = Math.random() * Math.PI * 2;
    animal.walkX = peck ? 0 : Math.cos(a);
    animal.walkY = peck ? 0 : Math.sin(a);
    animal.walkTime = peck ? 0.5 + Math.random() * 0.7 : 0.4 + Math.random() * 0.45;
  } else if (p === 'shoreGlide' && animal.kind === 'heron') {
    const wait = Math.random() < 0.75;
    const a = Math.random() * Math.PI * 2;
    animal.walkX = wait ? 0 : Math.cos(a);
    animal.walkY = wait ? 0 : Math.sin(a);
    animal.walkTime = wait ? 3.2 + Math.random() * 2.5 : 1.0;
  } else if (p === 'heavyCharge' || p === 'curlDefense') {
    const rest = Math.random() < 0.6;
    const a = Math.random() * Math.PI * 2;
    animal.walkX = rest ? 0 : Math.cos(a);
    animal.walkY = rest ? 0 : Math.sin(a);
    animal.walkTime = 1.6 + Math.random() * 2.8;
  } else {
    const rest = Math.random() < 0.4;
    const a = Math.random() * Math.PI * 2;
    animal.walkX = rest ? 0 : Math.cos(a);
    animal.walkY = rest ? 0 : Math.sin(a);
    animal.walkTime = 1.0 + Math.random() * 2.2;
  }
}

function findNearestBurrow(x, y) {
  let best = null;
  let bestDist = 14;
  for (const prop of propsAround(x, y, 14)) {
    if (prop.kind !== 'rabbitBurrow') continue;
    const d = Math.hypot(prop.x + 0.5 - x, prop.y + 0.5 - y);
    if (d < bestDist) {
      best = prop;
      bestDist = d;
    }
  }
  return best ? { prop: best, dist: bestDist } : null;
}

function updateWildAnimal(game, animal, dt) {
  const now = Date.now();
  const spec = animalSpecOf(animal.kind);
  const herd = animal.herdId && game.run.herds ? game.run.herds[animal.herdId] : null;
  const playerDist = Math.hypot(animal.x - game.player.x, animal.y - game.player.y);

  // Curled hedgehog or tortoise stays tucked safely in armor
  if (spec.pattern === 'curlDefense') {
    if ((animal.curledUntil && animal.curledUntil > now) || (animal.kind === 'hedgehog' && playerDist < 1.8 && game.run.running)) {
      if (!animal.curledUntil || animal.curledUntil <= now) animal.curledUntil = now + 2200;
      animal.walkX = 0;
      animal.walkY = 0;
      return;
    }
  }

  let speedMultiplier = spec.speed;
  const panicked = (animal.panicUntil && animal.panicUntil > now) || (herd && herd.fleeUntil > 0);
  const startledBySprint = playerDist < 2.8 && game.run.running && SHY_KINDS.has(animal.kind);
  const canAggro = now >= (game.run.safeUntil || 0) && !game.run.fight && game.run.screen === 'play';

  // Sprinting carelessly right into territorial bisons/bears/wolves/boars provokes a charge
  if (canAggro && !animal.angryUntil && FIGHT_ANIMALS[animal.kind]?.alwaysCounter && !animal.village && playerDist < 1.35 && game.run.running && zoneAt(animal.x, animal.y).kind !== 'village') {
    animal.angryUntil = now + 5000;
    notify(game, `⚠️ Watch out! The wild ${spec.name} charges!`, '#ffb070');
  }

  // Enraged wounded predators & beasts (bison, bear, boar, wolf, moose) charge straight into a real fight!
  if (animal.angryUntil && animal.angryUntil > now && playerDist < 14) {
    const dx = game.player.x - animal.x;
    const dy = game.player.y - animal.y;
    const len = Math.max(0.1, playerDist);
    let vx = dx / len;
    let vy = dy / len;
    if (spec.pattern === 'packStalk' && playerDist > 2.2) {
      [vx, vy] = rotateVec(vx, vy, (animal.flankSign || 1) * 0.42);
    }
    animal.walkX = vx;
    animal.walkY = vy;
    speedMultiplier = spec.fleeSpeed;
    if (isFighterAnimal(animal.kind) && playerDist < 1.25 && canAggro) {
      startAnimalFight(game, animal);
      return;
    }
    if (playerDist < 0.85 && (!animal.attackCd || now >= animal.attackCd)) {
      animal.attackCd = now + 1000;
      const dmg = animal.kind === 'bear' || animal.kind === 'bison' ? 10 : animal.kind === 'boar' ? 7 : 6;
      game.player.health = Math.max(1, Math.round(game.player.health) - dmg);
      floatText(game, game.player.x, game.player.y - 0.8, '-' + dmg, '#ff4d6d');
    }
  } else if (startledBySprint || panicked) {
    const len = Math.max(0.1, playerDist);
    let fx = (animal.x - game.player.x) / len;
    let fy = (animal.y - game.player.y) / len;
    if (herd && herd.shy && startledBySprint && herd.fleeUntil <= 0) {
      herd.fleeUntil = 2.2;
      herd.fleeX = fx;
      herd.fleeY = fy;
    }
    if (spec.pattern === 'zigzagWarren') {
      const warren = findNearestBurrow(animal.x, animal.y);
      if (warren && warren.dist < 0.72 && (animal.panicUntil > now || playerDist < 4.5)) {
        dust(game, animal.x, animal.y);
        animal.escapedBurrow = true;
        animal.hp = 0; // safely ducks underground into its rabbit burrow
        return;
      }
      if (warren) {
        const bx = (warren.prop.x + 0.5 - animal.x) / Math.max(0.1, warren.dist);
        const by = (warren.prop.y + 0.5 - animal.y) / Math.max(0.1, warren.dist);
        fx = fx * 0.35 + bx * 0.65;
        fy = fy * 0.35 + by * 0.65;
      }
      animal.zigTimer = (animal.zigTimer || 0) - dt;
      if (animal.zigTimer <= 0) {
        animal.zigTimer = 0.26 + Math.random() * 0.14;
        animal.zigSign = -(animal.zigSign || 1);
      }
      [fx, fy] = rotateVec(fx, fy, (animal.zigSign || 1) * 0.72);
    } else if (spec.pattern === 'boundingHerd' || spec.pattern === 'dartPeck') {
      animal.zigTimer = (animal.zigTimer || 0) - dt;
      if (animal.zigTimer <= 0) {
        animal.zigTimer = 0.55;
        animal.zigSign = -(animal.zigSign || 1);
      }
      [fx, fy] = rotateVec(fx, fy, (animal.zigSign || 1) * 0.35);
    }
    const norm = Math.max(0.1, Math.hypot(fx, fy));
    animal.walkX = fx / norm;
    animal.walkY = fy / norm;
    speedMultiplier = spec.fleeSpeed;
  } else if (herd) {
    let tx = herd.x + (animal.offsetX || 0);
    let ty = herd.y + (animal.offsetY || 0);
    if (animal.role === 'herder') {
      const a = herd.orbitPhase;
      tx = herd.x + Math.cos(a) * 2.5;
      ty = herd.y + Math.sin(a) * 2.1;
      speedMultiplier = spec.speed * 1.15;
    } else {
      speedMultiplier = Math.max(spec.speed * 0.75, herd.walkSpeed);
    }
    const { sx, sy } = separationForce(animal, game.run.wildAnimals);
    const dx = tx - animal.x + sx;
    const dy = ty - animal.y + sy;
    const gap = Math.hypot(dx, dy);
    if (gap > 0.35 || animal.role === 'herder') {
      const norm = Math.max(0.2, Math.hypot(dx, dy));
      animal.walkX = dx / norm;
      animal.walkY = dy / norm;
    } else {
      animal.walkX = 0;
      animal.walkY = 0;
    }
  } else {
    animal.walkTime -= dt;
    if (animal.walkTime <= 0) pickCalmPatternStep(animal, spec);
    if (spec.pattern === 'leapPause' && (animal.walkX !== 0 || animal.walkY !== 0)) {
      speedMultiplier = spec.fleeSpeed * 0.78;
    }
  }

  const moveDist = speedMultiplier * dt;
  const nx = animal.x + animal.walkX * moveDist;
  const ny = animal.y + animal.walkY * moveDist;
  if (canWalkCell(nx, animal.y)) animal.x = nx;
  if (canWalkCell(animal.x, ny)) animal.y = ny;
  if (Math.abs(animal.walkX) > 0.04) animal.dir = animal.walkX < 0 ? 'left' : 'right';
  if (animal.walkX !== 0 || animal.walkY !== 0) {
    animal.step += dt * (spec.action === 'hop' ? 8.5 : 5.5);
    if (HOOF_KINDS.has(animal.kind)) {
      animal.trackStep = (animal.trackStep || 0) + dt * 5;
      if (animal.trackStep >= 2.2) {
        animal.trackStep = 0;
        const under = tileAt(animal.x, animal.y);
        const wet = game.weather && (game.weather.kind === 'rain' || game.weather.kind === 'storm');
        if (under === TILE.SAND || biomeAt(animal.x, animal.y) === 'mountain' || wet) {
          addTrack(game, animal.x, animal.y, animal.walkX, animal.walkY, 'hoof');
        }
      }
    }
  }
}

export function updateAnimals(game, dt) {
  const now = Date.now();
  for (const animal of game.run.animals) {
    const spec = animalSpecOf(animal.kind);
    const panic = animal.panicUntil && animal.panicUntil > now;
    if (!panic) {
      animal.walkTime -= dt;
      if (animal.walkTime <= 0) {
        pickCalmPatternStep(animal, spec, animal.pen.x + animal.pen.w / 2, animal.pen.y + animal.pen.h / 2);
      }
    }
    const pen = animal.pen;
    const spd = (panic ? spec.fleeSpeed : spec.speed) * dt;
    const x = animal.x + animal.walkX * spd;
    const y = animal.y + animal.walkY * spd;
    if (x > pen.x + 0.3 && x < pen.x + pen.w - 0.3) animal.x = x;
    if (y > pen.y + 0.3 && y < pen.y + pen.h - 0.3) animal.y = y;
    if (animal.walkX !== 0) animal.dir = animal.walkX < 0 ? 'left' : 'right';
    if (animal.walkX !== 0 || animal.walkY !== 0) animal.step += dt * 5;
  }
  if (game.run.herds) {
    for (const herd of Object.values(game.run.herds)) updateHerdAnchor(herd, dt);
  }
  const survivingWild = [];
  for (const wild of game.run.wildAnimals || []) {
    updateWildAnimal(game, wild, dt);
    if (!wild.escapedBurrow && wild.hp > 0) survivingWild.push(wild);
  }
  game.run.wildAnimals = survivingWild;
}

export function wildAnimalNear(game, range = 1.6) {
  const list = game.run && Array.isArray(game.run.wildAnimals) ? game.run.wildAnimals : [];
  let best = null;
  let bestFar = range;
  for (const w of list) {
    const far = Math.hypot(w.x - game.player.x, w.y - game.player.y);
    if (far < bestFar) {
      best = w;
      bestFar = far;
    }
  }
  return best;
}

export function petWildAnimal(game, animal) {
  if (!animal) return false;
  const spec = WILD_META[animal.kind];
  const baseName = spec ? spec.name : animal.kind;
  const herd = animal.herdId && game.run.herds ? game.run.herds[animal.herdId] : null;
  animal.walkX = 0;
  animal.walkY = 0;
  animal.walkTime = 2;
  animal.dir = animal.x < game.player.x ? 'right' : 'left';
  if (!animal.petted) {
    animal.petted = true;
    game.happiness = Math.min(100, (game.happiness || 50) + 1);
  }
  if (!Array.isArray(game.run.emotes)) game.run.emotes = [];
  game.run.emotes.push({ who: 'hero', icon: 'heart', until: Date.now() + 1800 });
  return herd ? `${baseName} (${herd.label})` : baseName;
}
