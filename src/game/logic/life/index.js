import { ensureLife, ensureRunLife, firstLife, isShopOpenNow, recordGossip } from './state';
import { slowPeopleLife, updatePeopleLife, gossipLinesFor } from './peopleLife';
import { slowVillageEvents, updateVillageEvents, actionsOfVillageLife, newDayVillagesLife, triggerHeroVictoryLife } from './villageEvents';
import { slowNatureAndRoads, updateNatureAndRoads, actionsOfNatureAndRoads, newDayNatureAndRoads, plantTreeSapling } from './natureAndRoads';

export { firstLife, ensureLife, ensureRunLife, isShopOpenNow, recordGossip, gossipLinesFor, triggerHeroVictoryLife, plantTreeSapling };

export function slowLife(game) {
  if (!game?.player) return;
  slowPeopleLife(game);
  slowVillageEvents(game);
  slowNatureAndRoads(game);
}

export function updateLife(game, dt) {
  if (!game?.player) return;
  updatePeopleLife(game, dt);
  updateVillageEvents(game, dt);
  updateNatureAndRoads(game, dt);
}

export function newDayLife(game) {
  if (!game?.player) return;
  newDayVillagesLife(game);
  newDayNatureAndRoads(game);
}

export function actionsOfLife(game) {
  if (!game?.player) return [];
  return [...actionsOfVillageLife(game), ...actionsOfNatureAndRoads(game)];
}
