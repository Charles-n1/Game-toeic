import { DAY_SECONDS, SUNRISE } from './clock';
import { returnDueFocus } from './learning';
import { growFamilies } from './families';
import { placeDungeonMonsters } from './monsters';
import { healFully } from './player';
import { burnTorch } from './torch';
import { updateSurvival } from './survival';
import { growVillages } from './villages';
import { placeVillagers } from './villagers';
import { placeAnimals } from './animals';
import { refreshWorld } from './worldState';
import { isOutdoors, cureCold } from './weather';
import { notify } from './messages';
import { newDayWar } from './war';
import { newDaySociety } from './society';
import { newDayCamp } from './camp';
import { newDayBonds } from './bonds';

// Time passing: the clock moves, and a new day changes the world.

function newDay(game) {
  game.day += 1;
  returnDueFocus(game); // a mastered category may come back today
  growFamilies(game); // babies and weddings
  placeDungeonMonsters(game); // the guards of the dungeons are back
  if (growVillages(game)) refreshWorld(game); // the villages gather, breed, build
  placeVillagers(game);
  placeAnimals(game);
  game.gathered = {}; // the trees and the rocks have grown back
  newDayWar(game);
  newDaySociety(game);
  newDayCamp(game);
  newDayBonds(game);
  notify(game, '🌅 Day ' + game.day);
}

function addHours(game, hours) {
  burnTorch(game, hours); // the rain and the wind put it out (see logic/torch.js)
  updateSurvival(game, hours);
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

// Sleeping: the next sunrise, with all the HP and the mana back.
export function sleepUntilMorning(game) {
  const hoursSlept = game.hour >= SUNRISE ? 24 - game.hour + SUNRISE : SUNRISE - game.hour;
  if (!isOutdoors(game)) cureCold(game, '😴 A warm sleep indoors cured your cold!');
  if (game.hour >= SUNRISE) newDay(game); // before midnight: the morning is tomorrow
  game.hour = SUNRISE;
  updateSurvival(game, hoursSlept * 0.5); // the body slows down while it sleeps
  game.player.torchHours = 0; // nobody sleeps with a burning torch
  healFully(game.player);
}
