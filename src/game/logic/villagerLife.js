import { isVillain } from './society/state';
import { visibleVillagers } from './villagers';
import { emote } from './emotes';

// The small life of the villagers, around the hero: they greet the hero who walks by.
// Only bubbles over their heads and where they look: nothing is saved.
// (Their day, work and home: logic/villagers.js. Their conversations: logic/smallTalk.js.)

const LIFE_RANGE = 14; // tiles: only the villagers this close to the hero are looked at
const GREET_RANGE = 2.6; // tiles: the hero passes this close: they greet
const GREET_EVERY = 25; // seconds before the same villager greets again

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
  if (villager.walking || villager.talkUntil > now || distance(villager, game.player) > GREET_RANGE) return false;
  if (villager.greetedAt && now - villager.greetedAt < GREET_EVERY * 1000) return false;
  villager.greetedAt = now;
  lookAt(villager, game.player);
  emote(game, villager, isVillain(game) ? 'sweat' : villager.kid ? 'sparkle' : 'note');
  return true;
}

// Called about once per second.
export function updateVillagerLife(game) {
  const now = Date.now();
  const around = visibleVillagers(game).filter((villager) => !villager.fighting && distance(villager, game.player) < LIFE_RANGE);
  for (const villager of around) {
    greetHero(game, villager, now);
  }
}
