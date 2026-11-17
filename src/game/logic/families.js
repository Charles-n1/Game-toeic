import { NPCS, npcOf, BABY_NAMES } from '../data/npcs';
import { SPAWN, zoneAt } from '../data/zones';
import { pickRandom } from '../../logic/random';
import { addHappiness, addFriendship } from './village';
import { say, notify } from './messages';

// The families of the world. game.families: [{ parents: ['finn', 'lila'], children: ['Verba'], nextBabyDay: 4 }]
// The player is the parent named 'player'. People fall in love, marry and have babies while the days pass,
// and children appear visibly in town and grow from toddlers (small) into youths after 20 days.

const DAYS_BETWEEN_BABIES = 12;
const MAX_CHILDREN = 3;
const WEDDING_CHANCE = 0.15; // each day, in a happy village
const HAPPY_ENOUGH = 60;
const YOUTH_AGE_DAYS = 20;

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
  game.families.push({ parents: [firstId, secondId], children: [], childBirthDays: {}, nextBabyDay: game.day + firstBabyIn });
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

function birthDayOf(family, name) {
  if (!family.childBirthDays) family.childBirthDays = {};
  if (typeof family.childBirthDays[name] !== 'number') family.childBirthDays[name] = 1;
  return family.childBirthDays[name];
}

function haveBaby(game, family) {
  const name = unusedBabyName(game);
  family.children.push(name);
  if (!family.childBirthDays) family.childBirthDays = {};
  family.childBirthDays[name] = game.day;
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
  for (const fam of game.families) {
    for (const childName of fam.children) {
      if (game.day - birthDayOf(fam, childName) === YOUTH_AGE_DAYS) {
        notify(game, '🌟 ' + childName + ' has grown into a bright youth!', '#ffd86b');
      }
    }
  }
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

function anchorOfFamily(game, family) {
  if (family.parents.includes('player')) {
    if (zoneAt(game.player.x, game.player.y).kind === 'inside') return null;
    return { x: SPAWN.x + 1.4, y: SPAWN.y + 0.6 };
  }
  const parentId = family.parents.find((id) => id !== 'player' && game.run?.visible?.[id] && game.run?.people?.[id]);
  if (parentId) return game.run.people[parentId];
  return null;
}

const KID_SHIRTS = ['#4ea8de', '#e76f51', '#70c1b3', '#e9c46a', '#c77dff'];

/** Returns visible child sprites (toddlers or grown youths after 20 days) playing near their family home. */
export function familyKidsList(game) {
  const out = [];
  if (!game || !Array.isArray(game.families)) return out;
  const phase = (game.clock?.hour || 12) + (game.clock?.minutes || 0) / 60;
  game.families.forEach((family, fIdx) => {
    const anchor = anchorOfFamily(game, family);
    if (!anchor || !Array.isArray(family.children)) return;
    const pNpcId = family.parents.find((id) => id !== 'player');
    const pLook = (pNpcId && npcOf(pNpcId)?.look) || game.player?.look || {};
    family.children.forEach((name, cIdx) => {
      const bornDay = birthDayOf(family, name);
      const isYouth = game.day - bornDay >= YOUTH_AGE_DAYS;
      const angle = phase * 0.45 + fIdx * 1.7 + cIdx * 2.1;
      const dx = Math.cos(angle) * (0.9 + cIdx * 0.45);
      const dy = 0.7 + Math.sin(angle) * 0.45;
      out.push({
        name,
        family,
        isPlayers: family.parents.includes('player'),
        isYouth,
        ageDays: Math.max(0, game.day - bornDay),
        x: anchor.x + dx,
        y: anchor.y + dy,
        dir: dx >= 0 ? 'right' : 'left',
        step: phase * 4 + cIdx,
        walking: true,
        look: {
          skin: pLook.skin || '#f3c9a0',
          hair: pLook.hair || '#5a3a1e',
          style: isYouth ? (cIdx % 2 === 0 ? 'short' : 'long') : 'short',
          eyes: pLook.eyes || '#2b2b2b',
          outfit: KID_SHIRTS[(name.length + cIdx + fIdx) % KID_SHIRTS.length],
          trim: '#ffffff',
          race: pLook.race || 'human',
          small: !isYouth,
        },
      });
    });
  });
  return out;
}

/** Finds the closest visible family child within talk range of the player. */
export function kidNear(game) {
  return (
    familyKidsList(game).find(
      (kid) => Math.hypot(kid.x - game.player.x, kid.y - game.player.y) < 1.5
    ) || null
  );
}

/** Talks with a visible toddler or youth child of a town/player family. */
export function talkToKid(game, kid) {
  if (!kid) return;
  if (kid.isPlayers) {
    const spouseId = kid.family.parents.find((id) => id !== 'player');
    if (spouseId && game.npcs?.[spouseId]) addFriendship(game, spouseId, 1);
    const lines = kid.isYouth
      ? [kid.name + ': "I have been practicing sword stances and reading your world dictionaries! Watch me fight beside you someday!"']
      : [kid.name + ': "Look! I caught a shiny beetle! Will you tell me another story from Earth tonight?"'];
    say(game, null, lines);
    return;
  }
  const parents = kid.family.parents.map(nameOf).join(' & ');
  say(game, null, [
    kid.name + (kid.isYouth ? ' (Youth, age ' + kid.ageDays + 'd)' : ' (Child of ' + parents + ')') + ': ' +
      (kid.isYouth ? '"Everyone in town talks about how fast you master the runes!"' : '"Hello, Hero! Look how tall I am getting!"'),
  ]);
}
