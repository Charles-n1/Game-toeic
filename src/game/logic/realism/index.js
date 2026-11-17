import { ensureRealism } from './state';
import { stepBodyAndClimateHourly, triggerSprain } from './bodyHealth';
import {
  stepFoodSpoilageDaily,
  stepGearAndStepsHourly,
  stepLivingNatureDaily,
  checkShopOpenHours,
} from './foodAndNature';
import { stepManaLanternDaily, traceChalkCircle, useCombatScroll } from './magicPhysics';
import { stepFinanceDaily, isShopRefusingCriminal } from './financeAndLaw';
import {
  refreshDailyNotices,
  publishTownCrier,
  generateDailyLetter,
} from './englishWorld';
import {
  stepCompanionsAndPromisesDaily,
  evaluateUnlockedTitles,
  deliverWeddingGiftsToChest,
} from './socialAndCodex';

// Unified entrypoints bridging all modular Realism files into Lexia's core loops.

export const REALISM_CRAFT_RECIPES = [
  { id: 'soap', needs: { tallow: 1, herb: 2 }, fee: 0, stations: ['potions', 'clinic', 'camp', 'alchemyDesk'], desc: 'Botanical Soap (+100% cleanliness & charm).' },
  { id: 'oilWax', needs: { tallow: 1, oil: 1 }, fee: 0, stations: ['forge', 'market', 'camp', 'alchemyDesk'], desc: 'Waterproof Oil-Wax (48h rain/rust shield).' },
  { id: 'parchment', needs: { cloth: 1, branch: 2 }, fee: 2, stations: ['library', 'market', 'studyShelf'], desc: 'Rag Parchment for scribing scrolls.' },
  { id: 'ink', needs: { oil: 1, mushroom: 1 }, fee: 2, stations: ['library', 'market', 'studyShelf'], desc: 'Iron-Gall Ink for scrolls and ledgers.' },
  { id: 'smokedJerky', needs: { rawMeat: 1, salt: 1 }, fee: 0, stations: ['camp', 'bakery', 'dryingRack'], desc: 'Salted Smoked Jerky (never spoils).' },
  { id: 'herbalPoultice', needs: { herb: 2, cloth: 1 }, fee: 0, stations: ['clinic', 'potions', 'camp', 'alchemyDesk'], desc: 'Cures Sprain & heals +25 HP.' },
  { id: 'antiseptic', needs: { herb: 2, honey: 1, mushroom: 1 }, fee: 2, stations: ['clinic', 'potions', 'alchemyDesk'], desc: 'Cures Wound Infection (+20 HP).' },
  { id: 'honeyLemonTea', needs: { honey: 1, lemon: 1 }, fee: 0, stations: ['bakery', 'clinic', 'camp', 'alchemyDesk'], desc: 'Cures Dysentery & Potion Sickness.' },
  { id: 'spicedBroth', needs: { rawMeat: 1, carrot: 1, herb: 1 }, fee: 0, stations: ['bakery', 'camp'], desc: 'Cures Cold & restores warmth.' },
  { id: 'pickledRadish', needs: { carrot: 2, salt: 1 }, fee: 0, stations: ['bakery', 'camp'], desc: 'Long-lasting pickled vegetables.' },
  { id: 'fireScroll', needs: { parchment: 1, ink: 1, crystal: 1 }, fee: 4, stations: ['library', 'potions', 'studyShelf'], desc: 'Scribe a 0-MP Fireball Scroll.' },
  { id: 'healScroll', needs: { parchment: 1, ink: 1, herb: 2 }, fee: 4, stations: ['library', 'clinic', 'studyShelf'], desc: 'Scribe a 0-MP Restoration Scroll.' },
  { id: 'wardScroll', needs: { parchment: 1, ink: 1, ore: 1 }, fee: 4, stations: ['library', 'forge', 'studyShelf'], desc: 'Scribe a 0-MP Aegis Ward Scroll.' },
  { id: 'blinkScroll', needs: { parchment: 1, ink: 1, feather: 2 }, fee: 4, stations: ['library', 'studyShelf'], desc: 'Scribe a 0-MP Flash Step Scroll.' },
  { id: 'chalk', needs: { stone: 1, bone: 1 }, fee: 0, stations: ['market', 'library', 'camp'], desc: 'Rune Chalk for protective magic circles.' },
  { id: 'lockpick', needs: { ore: 1, flint: 1 }, fee: 2, stations: ['forge', 'market'], desc: 'Steel Thief Lockpick.' },
  { id: 'curryStew', needs: { rawMeat: 1, carrot: 1, herb: 1 }, fee: 0, stations: ['camp', 'bakery'], desc: 'Hearty Earth Curry (+Morale, licensable).' },
  { id: 'omeletteRice', needs: { egg: 2, wheat: 1, rawMeat: 1 }, fee: 0, stations: ['camp', 'bakery'], desc: 'Fluffy Omurice (+Morale, licensable).' },
  { id: 'honeyToast', needs: { bread: 1, honey: 1 }, fee: 0, stations: ['camp', 'bakery'], desc: 'Golden Honey Toast (+Morale, licensable).' },
  { id: 'misoBroth', needs: { mushroom: 1, salt: 1, rawFish: 1 }, fee: 0, stations: ['camp', 'bakery'], desc: 'Savory Miso Soup (+Morale, licensable).' },
  { id: 'karagePlate', needs: { rawMeat: 1, wheat: 1, oil: 1 }, fee: 0, stations: ['camp', 'bakery'], desc: 'Crisp Spiced Karaage (+Morale, licensable).' },
];

export function hourlyRealism(game, hours, allowLethal = true) {
  const r = ensureRealism(game);
  if (r.manaTrain.backlashHours > 0) r.manaTrain.backlashHours = Math.max(0, r.manaTrain.backlashHours - hours);
  if (r.world.miasmaHours > 0) r.world.miasmaHours = Math.max(0, r.world.miasmaHours - hours);
  stepBodyAndClimateHourly(game, hours, allowLethal);
  stepGearAndStepsHourly(game, hours);
}

export function dailyRealism(game) {
  ensureRealism(game);
  refreshDailyNotices(game);
  publishTownCrier(game);
  generateDailyLetter(game);
  stepFoodSpoilageDaily(game);
  stepManaLanternDaily(game);
  stepFinanceDaily(game);
  stepCompanionsAndPromisesDaily(game);
  stepLivingNatureDaily(game);
  deliverWeddingGiftsToChest(game);
  evaluateUnlockedTitles(game);
}

export function canShopServeHero(game, role, villageId) {
  if (isShopRefusingCriminal(game, villageId)) {
    return { open: false, reason: '⚖️ "Pay your municipal fines at the Magistrate or Guild before shopping here!"' };
  }
  return checkShopOpenHours(game, role, villageId);
}

export {
  ensureRealism,
  triggerSprain,
  traceChalkCircle,
  useCombatScroll,
};
