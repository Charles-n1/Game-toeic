import { ITEMS } from '../data/items';
import { addItem } from './player';
import { notify } from './messages';
import {
  firstWar,
  ensureWar,
  ensureRunWar,
  isNpcKidnapped,
  isVillageUnderAttack,
  activeWarbandsSummary,
} from './war/state';
import {
  growMonsterTowns,
  launchWarbands,
  advanceWarbandsDay,
  syncOnScreenWarbands,
  updateWarbandsAndDefense,
  conquerVillage,
  liberateVillage,
} from './war/conquest';
import {
  updateCaravans,
  slowCaravans,
  corpseNear,
  buryCorpse,
  caravanNear,
  interactCaravan,
  handleCaravanFightEnd,
  spawnCaravan,
  triggerCaravanAttack,
} from './war/caravans';
import {
  slowBanditsAndCamps,
  updateBanditsAndAmbushes,
  applyPowersToBandits,
  handleBanditFightEnd,
  cageNear,
  openCage,
  triggerAmbush,
  kidnapCompanion,
} from './war/bandits';
import {
  slowSkirmishes,
  updateSkirmishes,
  skirmishNear,
  interactSkirmish,
  handleSkirmishFightEnd,
  spawnRivalSkirmish,
} from './war/skirmishes';

// The war of the world: the monster villages want land. Their warbands march on the villages, break the walls,
// fight the villagers (who defend with pitchforks and stones), the knights and the turrets; a village can fall.
// Also: the caravans of the merchants attacked on the roads, the corpses, the bandit camps, the ambushes,
// kidnappings, and rival village skirmishes.
// The main loop calls firstWar, updateWar, slowWar, newDayWar, actionsOfWar.

export {
  firstWar,
  isNpcKidnapped,
  isVillageUnderAttack,
  activeWarbandsSummary,
  spawnCaravan,
  triggerCaravanAttack,
  spawnRivalSkirmish,
  triggerAmbush,
  conquerVillage,
  liberateVillage,
  buryCorpse,
  openCage,
  kidnapCompanion,
};

export function onFightEndWar(game, fight) {
  if (!fight || fight._warHandled) return;
  fight._warHandled = true;
  ensureWar(game);

  if (handleBanditFightEnd(game, fight)) return;
  if (handleSkirmishFightEnd(game, fight)) return;
  if (handleCaravanFightEnd(game, fight)) return;

  const opponent = fight.opponent;
  if (!opponent) return;

  if (fight.phase === 'won' && (opponent.warKind === 'warband' || opponent.warKind === 'occupier')) {
    if (Math.random() < 0.35) {
      addItem(game.player, 'warTrophy');
      notify(game, ITEMS.warTrophy.icon + ' ' + ITEMS.warTrophy.name);
    } else if (Math.random() < 0.12) {
      addItem(game.player, 'warHorn');
      notify(game, ITEMS.warHorn.icon + ' ' + ITEMS.warHorn.name);
    }
  } else if (fight.phase === 'lost' && opponent.warKind === 'warband' && game.player.party.length > 0) {
    const band = game.war.warbands.find((b) => b.id === opponent.warbandId);
    const res = kidnapCompanion(game, null, band ? band.townId : null);
    if (res) {
      notify(game, '🚨 A companion was captured and taken to ' + res.place.name + '!', '#ff5a6e');
    }
  }
}

// Every frame on the map. dt: seconds.
export function updateWar(game, dt) {
  const runWar = ensureRunWar(game);
  if (game.run.fight) {
    runWar.trackedFight = game.run.fight;
  } else if (runWar.trackedFight) {
    const finished = runWar.trackedFight;
    runWar.trackedFight = null;
    onFightEndWar(game, finished);
  }

  updateWarbandsAndDefense(game, dt);
  updateCaravans(game, dt);
  updateBanditsAndAmbushes(game, dt);
  applyPowersToBandits(game);
  updateSkirmishes(game, dt);
}

// About once per second.
export function slowWar(game) {
  ensureRunWar(game);
  syncOnScreenWarbands(game);
  slowCaravans(game);
  slowBanditsAndCamps(game);
  slowSkirmishes(game);
}

// Every new day.
export function newDayWar(game) {
  const war = ensureWar(game);
  growMonsterTowns(game);
  launchWarbands(game);
  advanceWarbandsDay(game);
  war.corpses = war.corpses.filter((c) => game.day - (c.day || game.day) <= 14);
}

// What the action button can do here: [{ when: () => boolean, icon, run }], the most important first.
export function actionsOfWar(game) {
  return [
    { when: () => corpseNear(game) !== null, icon: 'dig', run: () => buryCorpse(game, corpseNear(game)) },
    { when: () => cageNear(game) !== null, icon: 'people', run: () => openCage(game, cageNear(game)) },
    { when: () => caravanNear(game) !== null, icon: 'shop', run: () => interactCaravan(game, caravanNear(game)) },
    { when: () => skirmishNear(game) !== null, icon: 'talk', run: () => interactSkirmish(game, skirmishNear(game)) },
  ];
}
