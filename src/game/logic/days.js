import { DAY_SECONDS, SUNRISE } from './clock';
import { returnDueFocus } from './learning';
import { growFamilies } from './families';
import { placeDungeonMonsters } from './monsters';
import { healFully } from './player';
import { notify } from './messages';

// Time passing: the clock moves, and a new day changes the world.

function newDay(game) {
  game.day += 1;
  returnDueFocus(game); // a mastered category may come back today
  growFamilies(game); // babies and weddings
  placeDungeonMonsters(game); // the guards of the dungeons are back
  notify(game, '🌅 Day ' + game.day);
}

function addHours(game, hours) {
  game.hour += hours;
  if (game.hour >= 24) {
    game.hour -= 24;
    newDay(game);
  }
}

// Called every frame. dt: seconds since the last frame.
export function advanceClock(game, dt) {
  addHours(game, (dt * 24) / DAY_SECONDS);
}

// Something that takes time (a date, a job).
export function passHours(game, hours) {
  addHours(game, hours);
}

// Sleeping: the next sunrise, with all the hearts and the mana back.
export function sleepUntilMorning(game) {
  if (game.hour >= SUNRISE) newDay(game); // before midnight: the morning is tomorrow
  game.hour = SUNRISE;
  healFully(game.player);
}
