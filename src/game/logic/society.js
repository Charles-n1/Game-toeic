import { HOME_DOOR, doorOf, zoneAt, isInsideWorld } from '../data/zones';
import { propsAround, tileAt, TILE } from '../world/map';
import { turretSpots } from './walls';
import { villagerNear } from './villagers';
import { portNear } from './ports';
import { canGather } from './torch';
import { canRefill, fireToCookNear } from './survival';
import { wordDoorAt, obeliskNear, boulderPuzzleAt } from './puzzles';
import { isSoil, chestNear } from './farm';
import { frontTile } from './input';
import {
  firstSociety,
  ensureSociety,
  isVillain,
  isFestivalActive,
  villagePriceMultiplier,
  ridingSpeedMultiplier,
  revealCrystalCave,
  onFightEndSociety,
} from './society/state';
import {
  syncMerchantHorses,
  updateMerchantHorses,
  updateRiding,
  merchantHorseNear,
  parkedHorseNear,
  interactMerchantHorse,
  interactMountedHorse,
  interactParkedHorse,
  interactStable,
} from './society/horses';
import {
  interactVillager,
  interactHospital,
  interactGameStall,
  interactStatueOrTotem,
} from './society/trading';
import {
  syncSlaveTraders,
  slaveTraderNear,
  interactSlaveTrader,
  interactBoard,
  interactBanditCamp,
  offerTurretBuild,
  nextFreeTurretIndex,
  updateBountyProgress,
  newDayFestivals,
  slowFestivals,
  updateFestivalsAndFireworks,
  syncVillageSmiths,
  updateGuards,
} from './society/worldLife';
import {
  newDayDisasters,
  slowDisasters,
  updateDisasters,
  triggerDisaster,
} from './society/disasters';

// Life with the villagers: trading, hitting (the villain's way), slave traders, horses, the hospital,
// village feasts, bandit bounties, decorating a town, turrets, statues/totems, and rare climate disasters.
// The main loop calls firstSociety, updateSociety, slowSociety, newDaySociety, and actionsOfSociety.


export {
  firstSociety,
  interactVillager,
  isVillain,
  ridingSpeedMultiplier,
  isFestivalActive,
  villagePriceMultiplier,
  revealCrystalCave,
  onFightEndSociety,
  triggerDisaster,
};

function propNear(player, kinds, range) {
  return propsAround(player.x, player.y, range).find((prop) => kinds.includes(prop.kind)) || null;
}

function buildingDoorNear(player, village, role, range = 2.0) {
  if (!village || !village.plan || !village.plan.houses) return null;
  for (const house of village.plan.houses) {
    if (house.role !== role) continue;
    const door = doorOf(house);
    if (Math.hypot(door.x + 0.5 - player.x, door.y + 1.5 - player.y) < range) return house;
  }
  return null;
}

// Each village with a church has a sacred statue beside its front door.
export function churchStatueSpot(house) {
  return { x: house.x + house.w - 1.5, y: house.y + house.h + 0.6 };
}

function churchStatueNear(player, village) {
  if (!village || !village.plan || !village.plan.houses) return null;
  const church = village.plan.houses.find((house) => house.role === 'church');
  if (!church) return null;
  const spot = churchStatueSpot(church);
  return Math.hypot(spot.x - player.x, spot.y - player.y) < 1.6 ? spot : null;
}

function emptyTurretSpotNear(player, village, state) {
  if (!village || !state) return -1;
  const spots = turretSpots(village);
  const used = state.turrets || [];
  for (let i = 0; i < spots.length; i++) {
    if (used.includes(i)) continue;
    if (Math.hypot(spots[i].x + 1 - player.x, spots[i].y + 1 - player.y) < 2.1) return i;
  }
  return -1;
}

function isWorldActionHere(game) {
  const player = game.player;
  const front = frontTile(player);
  if (front.x === HOME_DOOR.x && front.y === HOME_DOOR.y) return true;
  if (portNear(game) || fireToCookNear(game)) return true;
  if (wordDoorAt(game, front.x, front.y) || obeliskNear(game) || boulderPuzzleAt(game, front.x, front.y)) return true;
  if (propNear(player, ['dummy'], 1.6) || chestNear(game)) return true;
  if (isSoil(player.x, player.y) || isSoil(front.x, front.y)) return true;
  if (canRefill(game, front) || canGather(game, front.x, front.y)) return true;
  return tileAt(front.x, front.y) === TILE.STAIRS;
}

// Every frame on the map. dt: seconds.
export function updateSociety(game, dt) {
  ensureSociety(game);
  if (game.run.societyFight && !game.run.fight) {
    onFightEndSociety(game, game.run.societyFight.fight);
  }
  updateRiding(game, dt);
  updateMerchantHorses(game, dt);
  updateGuards(game, dt);
  updateFestivalsAndFireworks(game, dt);
  updateDisasters(game, dt);
}

// About once per second.
export function slowSociety(game) {
  ensureSociety(game);
  syncVillageSmiths(game);
  syncMerchantHorses(game);
  syncSlaveTraders(game);
  updateBountyProgress(game);
  slowFestivals(game);
  slowDisasters(game);
}

// Every new day.
export function newDaySociety(game) {
  const s = ensureSociety(game);
  if (s.infamy > 0) s.infamy = Math.max(0, s.infamy - 1);
  newDayFestivals(game);
  newDayDisasters(game);
  syncSlaveTraders(game);
}

// What the action button can do here: [{ when: () => boolean, icon, run }], most important first.
export function actionsOfSociety(game) {
  const s = ensureSociety(game);
  const player = game.player;
  const zone = zoneAt(player.x, player.y);
  const isVillage = zone.kind === 'village';
  const vState = isVillage ? game.villages[zone.id] : null;

  return [
    {
      when: () => slaveTraderNear(game) !== null,
      icon: 'talk',
      run: () => interactSlaveTrader(game, slaveTraderNear(game)),
    },
    {
      when: () => propNear(player, ['gameStall'], 2.0) !== null && isVillage,
      icon: 'powers',
      run: () => interactGameStall(game, zone),
    },
    {
      when: () => propNear(player, ['board'], 1.8) !== null && (isVillage || zone.kind === 'camp'),
      icon: 'quests',
      run: () => interactBoard(game, zone),
    },
    {
      when: () => propNear(player, ['statue'], 2.0) !== null,
      icon: 'star',
      run: () => {
        const prop = propNear(player, ['statue'], 2.0);
        interactStatueOrTotem(game, 'statue-' + Math.floor(prop.x) + ',' + Math.floor(prop.y), false, prop.x + 1, prop.y + 1);
      },
    },
    {
      when: () => isVillage && churchStatueNear(player, zone) !== null,
      icon: 'star',
      run: () => {
        const spot = churchStatueNear(player, zone);
        interactStatueOrTotem(game, 'church-' + zone.id, false, spot.x, spot.y);
      },
    },
    {
      when: () => propNear(player, ['totem'], 1.8) !== null,
      icon: 'star',
      run: () => {
        const prop = propNear(player, ['totem'], 1.8);
        interactStatueOrTotem(game, prop.totem || 'totem-' + Math.floor(prop.x) + ',' + Math.floor(prop.y), true, prop.x + 0.5, prop.y + 0.5);
      },
    },
    {
      when: () => merchantHorseNear(game) !== null,
      icon: 'powers',
      run: () => interactMerchantHorse(game, merchantHorseNear(game)),
    },
    {
      when: () => parkedHorseNear(game),
      icon: 'powers',
      run: () => interactParkedHorse(game),
    },
    {
      when: () => villagerNear(game) !== null,
      icon: 'talk',
      run: () => interactVillager(game, villagerNear(game)),
    },
    {
      when: () => isVillage && buildingDoorNear(player, zone, 'clinic', 2.0) !== null,
      icon: 'healthPotion',
      run: () => interactHospital(game, zone),
    },
    {
      when: () => isVillage && buildingDoorNear(player, zone, 'stable', 2.0) !== null,
      icon: 'shop',
      run: () => interactStable(game, zone),
    },
    {
      when: () => isVillage && vState && nextFreeTurretIndex(zone, vState) >= 0 && emptyTurretSpotNear(player, zone, vState) >= 0,
      icon: 'shield',
      run: () => offerTurretBuild(game, zone, emptyTurretSpotNear(player, zone, vState)),
    },
    {
      when: () => zone.kind === 'camp' && buildingDoorNear(player, zone, 'chief', 2.4) !== null,
      icon: 'woodSword',
      run: () => interactBanditCamp(game, zone),
    },
    {
      when: () => s.riding && s.riding.active && !isInsideWorld(player.y) && ((s.riding.hunger || 0) >= 92 || !isWorldActionHere(game)),
      icon: 'powers',
      run: () => interactMountedHorse(game),
    },
  ];
}
