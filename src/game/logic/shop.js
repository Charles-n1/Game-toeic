import { ITEMS, SHOPS, nextUpgrade } from '../data/items';
import { GEAR_ITEMS } from '../data/items/gear';
import { zoneAt } from '../data/zones';
import { priceFactor } from './village';
import { addItem, removeItem, equip, earnLexis } from './player';
import { classBonus } from './classes';
import { villagePriceMultiplier } from './society';
import { isStuck } from './isekai/curses';

const GEAR_IDS = Object.keys(GEAR_ITEMS);
const ACCESSORY_IDS = GEAR_IDS.filter((id) => GEAR_ITEMS[id].kind === 'accessory');
const FORGE_GEAR_IDS = GEAR_IDS.filter((id) => GEAR_ITEMS[id].kind === 'weapon' || GEAR_ITEMS[id].kind === 'armor');

function unownedGear(player, pool, limit) {
  return pool.filter((id) => !player.bag[id] && player[ITEMS[id].kind] !== id).slice(0, limit);
}

// Buying and selling. The prices move with the happiness of the village, negotiations, festivals, and the Warsmith class.
export function priceOf(game, itemId) {
  const guild = 1 - classBonus(game, 'discount') / 100;
  const zone = zoneAt(game.player.x, game.player.y);
  const villageMod = zone.kind === 'village' ? villagePriceMultiplier(game, zone.id) : 1;
  return Math.max(1, Math.ceil(ITEMS[itemId].price * priceFactor(game) * guild * villageMod));
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

// Returns false if the player is too poor.
export function buy(game, itemId) {
  const item = ITEMS[itemId];
  const price = priceOf(game, itemId);
  if (game.player.lexis < price) return false;
  game.player.lexis -= price;
  if (item.kind === 'map') game.player.mapLevel = item.level;
  else if (isStuck(game, game.player[item.kind])) addItem(game.player, itemId); // a cursed thing holds that place
  else if (['weapon', 'armor', 'boots', 'accessory'].includes(item.kind)) {
    const prev = game.player[item.kind];
    if (item.gearIcon && prev && prev !== itemId && !['woodSword', 'clothes', 'sandals'].includes(prev)) {
      addItem(game.player, prev, 1);
    }
    equip(game.player, itemId);
  } else addItem(game.player, itemId);
  return true;
}

// The items of the bag a shop buys: ['carrot', 'gem', ...]
export function sellableItems(player) {
  return Object.keys(player.bag).filter((id) => ITEMS[id].sell);
}

export function sell(game, itemId) {
  removeItem(game.player, itemId);
  earnLexis(game, ITEMS[itemId].sell);
}
