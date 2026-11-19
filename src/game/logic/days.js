import { DAY_SECONDS, SUNRISE } from './clock';
import { returnDueFocus } from './learning';
import { growFamilies } from './families';
import { placeDungeonMonsters } from './monsters';
import { healFully } from './player';
import { burnTorch } from './torch';
import { drainCurse } from './isekai/curses';
import { updateSurvival } from './survival';
import { growVillages } from './villages';
import { placeVillagers } from './villagers';
import { placeAnimals, syncPenAnimals } from './animals';
import { refreshWorld } from './worldState';
import { isOutdoors, cureCold } from './weather';
import { notify } from './messages';
import { newDayWar } from './war';
import { newDaySociety } from './society';
import { newDayCamp } from './camp';
import { newDayBonds } from './bonds';
import { newDayEconomy, stepEconomyHours } from './economy';
import { newDayGuild, healAllCompanions } from './guild/ranks';
import { advanceClassmatesDay } from './isekai/classmates';
import { resolveOwnGuildMissions } from './isekaiTodo/ownGuild';
import { refreshDailyLetters, syncWeeklyChallenge } from './isekaiTodo/socialPlus';
import { checkAchievements } from './isekaiTodo/progression';
import { hourlyRealism, dailyRealism } from './realism/index';
import { hourlySoul, dailySoul } from './soul';
import { burnForests } from './war/forestFire';

// Time passing: the clock moves, and a new day changes the world.

function newDay(game) {
  game.day += 1;
  returnDueFocus(game); // a mastered category may come back today
  growFamilies(game); // babies and weddings
  placeDungeonMonsters(game); // the guards of the dungeons are back
  if (growVillages(game)) refreshWorld(game); // the villages gather, breed, build
  placeVillagers(game);
  syncPenAnimals(game);
  if (!game.run.animals || game.run.animals.length === 0) placeAnimals(game);
  game.gathered = {}; // the trees and the rocks have grown back
  newDayWar(game);
  newDaySociety(game);
  newDayCamp(game);
  newDayBonds(game);
  newDayEconomy(game);
  newDayGuild(game);
  advanceClassmatesDay(game);
  resolveOwnGuildMissions(game);
  refreshDailyLetters(game);
  syncWeeklyChallenge(game);
  checkAchievements(game);
  dailyRealism(game);
  dailySoul(game);
  notify(game, '🌅 Day ' + game.day);
}

function addHours(game, hours, allowLethal = true) {
  burnTorch(game, hours); // the rain and the wind put it out (see logic/torch.js)
  updateSurvival(game, hours, allowLethal);
  drainCurse(game, hours);
  stepEconomyHours(game, hours);
  hourlyRealism(game, hours, allowLethal);
  hourlySoul(game, hours);
  burnForests(game, hours); // the forest fires the demons lit (see war/forestFire.js)
  game.hour += hours;
  if (game.hour >= 24) {
    game.hour -= 24;
    newDay(game);
  }
}

// Called every frame. dt: seconds since the last frame.
export function advanceClock(game, dt) {
  addHours(game, (dt * 24) / DAY_SECONDS, true);
}

// Something that takes time (a date, a job).
export function passHours(game, hours) {
  addHours(game, hours, false);
}

// Sleeping: the next sunrise, with all the HP and the mana back.
export function sleepUntilMorning(game) {
  const hoursSlept = game.hour >= SUNRISE ? 24 - game.hour + SUNRISE : SUNRISE - game.hour;
  if (!isOutdoors(game)) cureCold(game, '😴 A warm sleep indoors cured your cold!');
  if (game.hour >= SUNRISE) newDay(game); // before midnight: the morning is tomorrow
  game.hour = SUNRISE;
  updateSurvival(game, hoursSlept * 0.5, false); // the body slows down while it sleeps
  hourlyRealism(game, hoursSlept * 0.5, false);
  hourlySoul(game, hoursSlept * 0.5);
  game.player.fatigue = 0;
  game.player.torchHours = 0; // nobody sleeps with a burning torch
  healFully(game.player, game);
  healAllCompanions(game);
}
