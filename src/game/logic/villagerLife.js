import { isVillain } from './society/state';
import { visibleVillagers } from './villagers';
import { emote } from './emotes';
import { distance, faceTo } from '../world/geometry';

// The small life of the villagers, around the hero: they greet the hero who walks by.
// Only bubbles over their heads and where they look: nothing is saved.
// (Their day, work and home: logic/villagers.js. Their conversations: logic/smallTalk.js.)

const LIFE_RANGE = 14; // tiles: only the villagers this close to the hero are looked at
const GREET_RANGE = 2.6; // tiles: the hero passes this close: they greet
const GREET_EVERY = 25; // seconds before the same villager greets again



// The hero walks by: a smile and a note... or fear, if the hero is a villain.
function greetHero(game, villager, now) {
  if (villager.walking || villager.talkUntil > now || distance(villager, game.player) > GREET_RANGE) return false;
  if (villager.greetedAt && now - villager.greetedAt < GREET_EVERY * 1000) return false;
  villager.greetedAt = now;
  faceTo(villager, game.player);
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
