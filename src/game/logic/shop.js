import { ITEMS, SHOPS, nextUpgrade } from '../data/items';
import { GEAR_ITEMS } from '../data/items/gear';
import { zoneAt, villageOf } from '../data/zones';
import { priceFactor } from './village';
import { addItem, removeItem, equip, earnLexis } from './player';
import { classBonus } from './classes';
import { villagePriceMultiplier } from './society';
import { isStuck } from './isekai/curses';
import { culturalPriceDiscount } from './languages';
import { npcOf } from '../data/npcs';
import { resetSlotDurability, repairCostOf, repairAllGear, needsRepair } from './durability';
import { recipesForStation, canPlayerCraft, craftPlayerItem } from './craftingPlayer';
import { adventurerShopDiscount } from './guild/ranks';
import { skillTreeBonuses } from './isekaiTodo/progression';
import {
  ensureEconomy,
  econVillage,
  craftWorkshops,
  missingInputsFor,
  economyPriceMultiplier,
  refreshContracts,
  canDeliverContract,
  deliverContract,
  sellResourceToTown,
} from './economy';

const GEAR_IDS = Object.keys(GEAR_ITEMS);
const ACCESSORY_IDS = GEAR_IDS.filter((id) => GEAR_ITEMS[id].kind === 'accessory');
const FORGE_GEAR_IDS = GEAR_IDS.filter((id) => GEAR_ITEMS[id].kind === 'weapon' || GEAR_ITEMS[id].kind === 'armor');

function unownedGear(player, pool, limit) {
  return pool.filter((id) => !player.bag[id] && player[ITEMS[id].kind] !== id).slice(0, limit);
}

export function currentShopVillageId(game) {
  const zone = zoneAt(game.player.x, game.player.y);
  return zone.kind === 'village' ? zone.id : 'lexia';
}

export function shopStock(game, itemId) {
  const econ = econVillage(game, currentShopVillageId(game));
  if (!econ || econ.stock[itemId] === undefined) return null;
  return Math.max(0, econ.stock[itemId]);
}

// Buying and selling. Prices respond to happiness, negotiations, festivals, class, guild card, skill tree, and real local scarcity.
export function priceOf(game, itemId) {
  const cardDiscount = adventurerShopDiscount(game);
  const treeDiscount = (skillTreeBonuses(game).discount || 0) / 100;
  const guild = Math.max(0.4, 1 - classBonus(game, 'discount') / 100 - cardDiscount - treeDiscount);
  const zone = zoneAt(game.player.x, game.player.y);
  const vid = currentShopVillageId(game);
  const villageMod = zone.kind === 'village' ? villagePriceMultiplier(game, zone.id) : 1;
  const scarcity = economyPriceMultiplier(game, vid, itemId);
  const sellerRace = npcOf(game.run.shop?.npcId)?.race;
  const langMod = culturalPriceDiscount(game, sellerRace);
  return Math.max(1, Math.ceil(ITEMS[itemId].price * priceFactor(game) * guild * villageMod * scarcity * langMod));
}

// What this shop offers right now. The forge sells the NEXT upgrade plus character gear; markets include accessories & camp/town supplies.
export function shopItems(game, kind) {
  const player = game.player;
  if (kind === 'forge') {
    const upgrades = [nextUpgrade('weapon', player.weapon), nextUpgrade('armor', player.armor), nextUpgrade('boots', player.boots)].filter((id) => id !== null);
    return [...upgrades, 'turretKit', ...unownedGear(player, FORGE_GEAR_IDS, 4)];
  }
  const base = SHOPS[kind].filter((id) => ITEMS[id].kind !== 'map' || ITEMS[id].level > player.mapLevel);
  if (kind === 'market') {
    const campGear = player.bag.autoHeater || game.camp?.autoHeater ? [] : ['autoHeater'];
    return [...base, ...campGear, 'wheatSeed', 'horseFeed', 'firewood', 'driedMeat', 'decorBanner', ...unownedGear(player, ACCESSORY_IDS, 4)];
  }
  return base;
}

// Returns false if player is too poor or the town workshop has run out of stock.
export function buy(game, itemId) {
  const item = ITEMS[itemId];
  const price = priceOf(game, itemId);
  if (game.player.lexis < price) return false;

  const vid = currentShopVillageId(game);
  const econ = econVillage(game, vid);
  if (econ && econ.stock[itemId] !== undefined) {
    if (econ.stock[itemId] <= 0) return false;
    econ.stock[itemId] -= 1;
  }

  game.player.lexis -= price;
  if (econ) econ.treasury += price;

  if (item.kind === 'map') game.player.mapLevel = item.level;
  else if (isStuck(game, game.player[item.kind])) addItem(game.player, itemId); // a cursed thing holds that place
  else if (['weapon', 'armor', 'boots', 'accessory'].includes(item.kind)) {
    const prev = game.player[item.kind];
    if (item.gearIcon && prev && prev !== itemId && !['woodSword', 'clothes', 'sandals'].includes(prev)) {
      addItem(game.player, prev, 1);
    }
    equip(game.player, itemId, game);
    resetSlotDurability(game, item.kind);
  } else addItem(game.player, itemId);
  return true;
}

// The items of the bag a shop buys: ['carrot', 'gem', ...]
export function sellableItems(player) {
  return Object.keys(player.bag).filter((id) => ITEMS[id].sell);
}

export function sell(game, itemId) {
  const vid = currentShopVillageId(game);
  const econ = econVillage(game, vid);
  if (econ && econ.inputs[itemId] !== undefined) {
    return sellResourceToTown(game, vid, itemId, 1);
  }
  removeItem(game.player, itemId);
  const pay = ITEMS[itemId].sell;
  if (econ) {
    if (econ.stock[itemId] !== undefined) econ.stock[itemId] += 1;
    econ.treasury = Math.max(0, econ.treasury - Math.min(econ.treasury, pay));
    craftWorkshops(game, vid, 1);
  }
  earnLexis(game, pay);
  return pay;
}

export function townEconomyView(game) {
  const econ = ensureEconomy(game);
  const vid = currentShopVillageId(game);
  const vEcon = econVillage(game, vid);
  const village = villageOf(vid);
  const contracts = refreshContracts(game).slice(0, 3);
  return {
    villageId: vid,
    villageName: village ? village.name : vid,
    treasury: vEcon ? vEcon.treasury : 0,
    shortages: missingInputsFor(game, vid).slice(0, 3),
    contracts: contracts,
    activeContract: econ.activeContract,
    canDeliver: canDeliverContract(game, vid),
    deliver: () => deliverContract(game, vid),
    repairCost: repairCostOf(game),
    needsRepair: needsRepair(game),
    repair: (useMats = false) =>
      repairAllGear(game, useMats, (amt) => {
        if (vEcon) vEcon.treasury += amt;
      }),
    stationRecipes: (station) =>
      recipesForStation(station).map((r) => ({
        ...r,
        canCraft: canPlayerCraft(game, r),
        craft: () => craftPlayerItem(game, r.id, vid),
      })),
  };
}
