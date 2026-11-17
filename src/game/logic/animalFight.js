import { ITEMS } from '../data/items';
import { WILD_ANIMALS_CATALOG } from '../data/decorations';
import { monsterCategory } from './learning';
import { addItem } from './player';
import { bloodSplatter } from './particles';

// Full TOEIC battle integration when fierce/territorial wildlife (bison, bears, boars, wolves, moose, etc.)
// counter-attack the player or charge into combat, including multi-foe herd/pack fights.

const WILD_NAMES = Object.fromEntries(WILD_ANIMALS_CATALOG.map((w) => [w.id, w.name]));

export const ANIMAL_DROPS = {
  rabbit: [['rawMeat', 1], ['pelt', 1]],
  rabbitBrown: [['rawMeat', 1], ['pelt', 1]],
  fox: [['rawMeat', 1], ['pelt', 1]],
  deer: [['rawMeat', 2], ['pelt', 1], ['antler', 1]],
  doe: [['rawMeat', 2], ['pelt', 1]],
  fawn: [['rawMeat', 1]],
  boar: [['rawMeat', 3], ['bone', 1], ['pelt', 1]],
  piglet: [['rawMeat', 1]],
  wildHorse: [['rawMeat', 3], ['bone', 2]],
  foal: [['rawMeat', 1]],
  sheep: [['rawMeat', 2], ['wool', 2]],
  lamb: [['rawMeat', 1], ['wool', 1]],
  shepherdDog: [['bone', 1], ['pelt', 1]],
  goat: [['rawMeat', 2], ['wool', 1]],
  duck: [['rawMeat', 1], ['feather', 2]],
  duckling: [['feather', 1]],
  swan: [['rawMeat', 2], ['feather', 3]],
  goose: [['rawMeat', 2], ['feather', 2], ['egg', 1]],
  heron: [['rawMeat', 1], ['feather', 2]],
  pheasant: [['rawMeat', 1], ['feather', 3]],
  sparrow: [['feather', 1]],
  crow: [['feather', 2]],
  owl: [['feather', 2]],
  hedgehog: [['rawMeat', 1]],
  squirrel: [['rawMeat', 1], ['pelt', 1]],
  frog: [['rawMeat', 1]],
  turtle: [['rawMeat', 1], ['bone', 1]],
  wolf: [['rawMeat', 2], ['pelt', 2], ['bone', 1]],
  bear: [['rawMeat', 4], ['pelt', 2], ['bone', 2]],
  moose: [['rawMeat', 4], ['antler', 1], ['pelt', 2]],
  bison: [['rawMeat', 5], ['pelt', 2], ['bone', 2]],
  cow: [['rawMeat', 3], ['milk', 1], ['bone', 2]],
  pig: [['rawMeat', 3], ['bone', 1]],
  chicken: [['rawMeat', 1], ['egg', 1], ['feather', 2]],
  horse: [['rawMeat', 3], ['bone', 2]],
};

export const FIGHT_ANIMALS = {
  bison: { speed: 10, attack: 20, resistance: 0.2, xp: 28, lexis: 18, herdCap: 3, alwaysCounter: true },
  bear: { speed: 11, attack: 22, resistance: 0.2, xp: 32, lexis: 20, herdCap: 1, alwaysCounter: true },
  boar: { speed: 12, attack: 16, resistance: 0.1, xp: 20, lexis: 12, herdCap: 2, alwaysCounter: true },
  wolf: { speed: 15, attack: 16, resistance: 0.05, xp: 20, lexis: 12, herdCap: 3, alwaysCounter: true },
  moose: { speed: 11, attack: 18, resistance: 0.15, xp: 24, lexis: 15, herdCap: 1, alwaysCounter: true },
  wildHorse: { speed: 16, attack: 15, resistance: 0.05, xp: 18, lexis: 12, herdCap: 2, alwaysCounter: false },
  deer: { speed: 14, attack: 13, resistance: 0, xp: 16, lexis: 10, herdCap: 2, alwaysCounter: false },
};

export function isFighterAnimal(kind) {
  return Boolean(FIGHT_ANIMALS[kind]);
}

export function shouldCounterFight(animal, dist, isMelee) {
  const cfg = FIGHT_ANIMALS[animal?.kind];
  if (!cfg) return false;
  if (cfg.alwaysCounter) return (isMelee && dist <= 2.4) || dist <= 1.3;
  return animal.hp < animal.maxHp * 0.75 && dist <= 1.45 && Math.random() < 0.45;
}

function flatDropsOf(kind) {
  const list = [];
  for (const [id, qty] of ANIMAL_DROPS[kind] || [['rawMeat', 1]]) {
    if (!ITEMS[id]) continue;
    for (let i = 0; i < qty; i++) list.push(id);
  }
  return list;
}

export function makeAnimalOpponent(game, animal) {
  const cfg = FIGHT_ANIMALS[animal.kind] || FIGHT_ANIMALS.boar;
  const maxHp = Math.max(35, Math.round((animal.maxHp || 80) * 0.55));
  const curHp = Math.max(15, Math.round(((animal.hp ?? animal.maxHp ?? 80) / (animal.maxHp || 80)) * maxHp));
  return {
    name: WILD_NAMES[animal.kind] || animal.kind,
    species: animal.kind,
    animalKind: animal.kind,
    wildAnimal: true,
    wildAnimalRef: animal,
    x: animal.x,
    y: animal.y,
    category: monsterCategory(game),
    tier: 'small',
    tag: 'normal',
    health: curHp,
    maxHealth: maxHp,
    attack: cfg.attack,
    magicAttack: 0,
    resistance: cfg.resistance,
    magicResistance: 0,
    speed: cfg.speed,
    xp: cfg.xp,
    lexis: cfg.lexis,
    drops: flatDropsOf(animal.kind),
  };
}

// Pulls up to (herdCap - 1) nearby fighters from the same herd/pack (e.g. a Bison herd or Wolf pack).
export function herdBackupsFor(game, primaryAnimal) {
  const cfg = FIGHT_ANIMALS[primaryAnimal?.kind];
  if (!cfg || cfg.herdCap <= 1 || !primaryAnimal.herdId) return [];
  const peers = (game.run.wildAnimals || []).filter(
    (other) =>
      other !== primaryAnimal &&
      other.hp > 0 &&
      other.herdId === primaryAnimal.herdId &&
      isFighterAnimal(other.kind) &&
      Math.hypot(other.x - primaryAnimal.x, other.y - primaryAnimal.y) <= 9
  );
  return peers.slice(0, cfg.herdCap - 1).map((peer) => makeAnimalOpponent(game, peer));
}

// Cleans up defeated beasts (or separates surviving beasts on flee/loss) when a battle ends.
export function onFightEndAnimals(game, fight) {
  if (!fight || !Array.isArray(fight.opponents)) return;
  const animalFoes = fight.opponents.filter((o) => o.wildAnimal);
  if (animalFoes.length === 0) return;

  if (fight.phase === 'won') {
    const slainSet = new Set(animalFoes.map((o) => o.wildAnimalRef).filter(Boolean));
    for (const foe of animalFoes) {
      const ref = foe.wildAnimalRef;
      if (ref) bloodSplatter(game, ref.x, ref.y, 12);
      // Guarantee main meat drop in case random 75% rolls in lootMonster missed
      if (ITEMS.rawMeat) addItem(game.player, 'rawMeat', 1);
      if (ref && ref.village && game.villages[ref.village]) {
        const counts = game.villages[ref.village].animals;
        if (counts[ref.kind] > 0) counts[ref.kind] -= 1;
      }
    }
    game.run.wildAnimals = (game.run.wildAnimals || []).filter((w) => !slainSet.has(w));
    game.run.animals = (game.run.animals || []).filter((a) => !slainSet.has(a));
    return;
  }

  for (const foe of animalFoes) {
    const ref = foe.wildAnimalRef;
    if (!ref) continue;
    ref.angryUntil = 0;
    ref.walkTime = 2;
    const dx = ref.x - game.player.x;
    const dy = ref.y - game.player.y;
    const len = Math.max(0.2, Math.hypot(dx, dy));
    ref.x += (dx / len) * 3.0;
    ref.y += (dy / len) * 3.0;
  }
}
