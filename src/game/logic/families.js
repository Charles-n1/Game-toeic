import { NPCS, npcOf, BABY_NAMES } from '../data/npcs';
import { pickRandom } from '../../logic/random';
import { addHappiness } from './village';
import { notify } from './messages';

// The families of the world. game.families: [{ parents: ['finn', 'lila'], children: ['Verba'], nextBabyDay: 4 }]
// The player is the parent named 'player'. People fall in love, marry and have babies while the days pass.

const DAYS_BETWEEN_BABIES = 12;
const MAX_CHILDREN = 3;
const WEDDING_CHANCE = 0.15; // each day, in a happy village
const HAPPY_ENOUGH = 60;

function nameOf(parentId) {
  return parentId === 'player' ? 'You' : npcOf(parentId).name;
}

function isParentAlive(game, parentId) {
  return parentId === 'player' || game.npcs[parentId].alive;
}

function hasFamily(game, id) {
  return game.families.some((family) => family.parents.includes(id));
}

export function marry(game, firstId, secondId, firstBabyIn) {
  game.families.push({ parents: [firstId, secondId], children: [], nextBabyDay: game.day + firstBabyIn });
}

function unusedBabyName(game) {
  const used = game.families.flatMap((family) => family.children);
  const free = BABY_NAMES.filter((name) => !used.includes(name));
  return pickRandom(free.length > 0 ? free : BABY_NAMES);
}

function canHaveBaby(game, family) {
  const bothAlive = family.parents.every((id) => isParentAlive(game, id));
  return bothAlive && family.children.length < MAX_CHILDREN && game.day >= family.nextBabyDay;
}

function haveBaby(game, family) {
  const name = unusedBabyName(game);
  family.children.push(name);
  family.nextBabyDay = game.day + DAYS_BETWEEN_BABIES;
  if (family.parents.includes('player')) game.player.children.push(name);
  addHappiness(game, 5);
  notify(game, '👶 ' + nameOf(family.parents[0]) + ' and ' + nameOf(family.parents[1]) + ' had a baby: ' + name + '!', '#ffb6d9');
}

// Single adults the player is not close to: they may fall in love with each other.
function singles(game) {
  return NPCS.filter((npc) => !npc.child && game.npcs[npc.id].alive && !hasFamily(game, npc.id) && game.npcs[npc.id].friendship < 30);
}

function maybeWedding(game) {
  const free = singles(game);
  if (game.day < 10 || game.happiness < HAPPY_ENOUGH || free.length < 2 || Math.random() > WEDDING_CHANCE) return;
  const first = pickRandom(free);
  const second = pickRandom(free.filter((npc) => npc !== first));
  marry(game, first.id, second.id, 8);
  addHappiness(game, 4);
  notify(game, '💒 ' + first.name + ' and ' + second.name + ' got married!', '#ffb6d9');
}

// Called every new day.
export function growFamilies(game) {
  game.families.filter((family) => canHaveBaby(game, family)).forEach((family) => haveBaby(game, family));
  maybeWedding(game);
}

// The children of a person (to talk about them).
export function childrenOf(game, id) {
  const family = game.families.find((item) => item.parents.includes(id));
  return family ? family.children : [];
}

// The husband or wife of a person (null = single). 'player' is a possible answer.
export function partnerOf(game, id) {
  const family = game.families.find((item) => item.parents.includes(id));
  return family ? family.parents.find((parent) => parent !== id) : null;
}
