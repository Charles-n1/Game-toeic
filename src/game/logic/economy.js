import { ensureEconomy, firstEconomy, econVillage, transferTreasury } from './economy/state';
import {
  CRAFT_RECIPES,
  craftWorkshops,
  missingInputsFor,
  stepEconomyProduction,
  economyPriceMultiplier,
  recipeForProduct,
} from './economy/crafting';
import {
  dispatchShipment,
  completeShipment,
  refreshContracts,
  acceptContract,
  canDeliverContract,
  deliverContract,
  sellResourceToTown,
  updateTraffic,
  slowTraffic,
} from './economy/traffic';

// Unified world economy: closed-loop village treasuries, paid gatherers & craftsmen,
// real workshop crafting from raw inputs, merchant contracts, road haulers, maritime ships & royal patrols.

export function stepEconomyHours(game, hours) {
  const econ = ensureEconomy(game);
  econ.lastStepHour = (econ.lastStepHour || 0) + hours;
  if (econ.lastStepHour >= 2) {
    const chunk = econ.lastStepHour;
    econ.lastStepHour = 0;
    stepEconomyProduction(game, chunk);
  }
}

export function newDayEconomy(game) {
  stepEconomyProduction(game, 8);
  refreshContracts(game);
}

export function updateEconomy(game, dt) {
  updateTraffic(game, dt);
}

export function slowEconomy(game) {
  slowTraffic(game);
}

export {
  ensureEconomy,
  firstEconomy,
  econVillage,
  transferTreasury,
  CRAFT_RECIPES,
  craftWorkshops,
  missingInputsFor,
  economyPriceMultiplier,
  recipeForProduct,
  dispatchShipment,
  completeShipment,
  refreshContracts,
  acceptContract,
  canDeliverContract,
  deliverContract,
  sellResourceToTown,
};
