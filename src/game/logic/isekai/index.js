import { actionsOfCurses } from './curses';
import { actionsOfLostHero } from './lostHero';
import { actionsOfSprings } from './springs';
import { actionsOfArena } from './arena';
import { actionsOfEvents, rollEventAtSunrise, updateEvents } from './events';

// The isekai side of the world, for logic/update.js: what the action button can do, what runs each second
// and each frame. (Each part: curses.js, lostHero.js, classmates.js, springs.js, arena.js, events.js.)

export function actionsOfIsekai(game) {
  return [...actionsOfEvents(game), ...actionsOfCurses(game), ...actionsOfLostHero(game), ...actionsOfSprings(game), ...actionsOfArena(game)];
}

export function slowIsekai(game) {
  rollEventAtSunrise(game);
}

export function updateIsekai(game, dt) {
  updateEvents(game, dt);
}
