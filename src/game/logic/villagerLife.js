import { isVillain } from './society/state';
import { visibleVillagers } from './villagers';
import { emote } from './emotes';
import { pickRandom } from '../../logic/random';

// The small life of the villagers, around the hero: they greet the hero who walks by, they chat together
// when they stand close, the kids laugh. Only bubbles over their heads and where they look: nothing is saved.
// (Their day, work and home: logic/villagers.js.)

const LIFE_RANGE = 14; // tiles: only the villagers this close to the hero are looked at
const GREET_RANGE = 2.6; // tiles: the hero passes this close: they greet
const GREET_EVERY = 25; // seconds before the same villager greets again
const CHAT_RANGE = 2.2; // tiles: two villagers this close can chat
const CHAT_CHANCE = 0.12; // each second, for each villager standing still
const CHAT_WORDS = ['dots', 'note', '?', '!', 'heart', 'sparkle'];

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Turns someone to look at a place.
function lookAt(villager, place) {
  const dx = place.x - villager.x;
  const dy = place.y - villager.y;
  if (Math.abs(dx) > Math.abs(dy)) villager.dir = dx < 0 ? 'left' : 'right';
  else villager.dir = dy < 0 ? 'up' : 'down';
}

// The hero walks by: a smile and a note... or fear, if the hero is a villain.
function greetHero(game, villager, now) {
  if (villager.walking || distance(villager, game.player) > GREET_RANGE) return false;
  if (villager.greetedAt && now - villager.greetedAt < GREET_EVERY * 1000) return false;
  villager.greetedAt = now;
  lookAt(villager, game.player);
  emote(game, villager, isVillain(game) ? 'sweat' : villager.kid ? 'sparkle' : 'note');
  return true;
}

// Two villagers standing close: they turn to each other, one talks, the other answers.
function chatWithNeighbor(game, villager, others) {
  if (villager.walking || Math.random() > CHAT_CHANCE) return;
  const neighbor = others.find((other) => other !== villager && !other.walking && distance(other, villager) < CHAT_RANGE);
  if (!neighbor) return;
  lookAt(villager, neighbor);
  lookAt(neighbor, villager);
  emote(game, villager, pickRandom(CHAT_WORDS));
  emote(game, neighbor, pickRandom(CHAT_WORDS));
}

// Called about once per second.
export function updateVillagerLife(game) {
  const now = Date.now();
  const around = visibleVillagers(game).filter((villager) => !villager.fighting && distance(villager, game.player) < LIFE_RANGE);
  for (const villager of around) {
    if (!greetHero(game, villager, now)) chatWithNeighbor(game, villager, around);
  }
}
