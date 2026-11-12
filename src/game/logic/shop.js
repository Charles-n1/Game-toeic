import { ITEMS, SHOPS, nextUpgrade } from '../data/items';
import { priceFactor } from './village';
import { addItem, removeItem, equip, earnLexis } from './player';

// Buying and selling. The prices move with the happiness of the village and with the negotiations.

export function priceOf(game, itemId) {
  return Math.max(1, Math.ceil(ITEMS[itemId].price * priceFactor(game)));
}

// What this shop offers right now. The forge sells the NEXT upgrade of each piece of equipment.
export function shopItems(game, kind) {
  const player = game.player;
  if (kind === 'forge') {
    return [nextUpgrade('weapon', player.weapon), nextUpgrade('armor', player.armor), nextUpgrade('boots', player.boots)].filter((id) => id !== null);
  }
  return SHOPS[kind].filter((id) => ITEMS[id].kind !== 'map' || ITEMS[id].level > player.mapLevel);
}

// Returns false if the player is too poor.
export function buy(game, itemId) {
  const item = ITEMS[itemId];
  const price = priceOf(game, itemId);
  if (game.player.lexis < price) return false;
  game.player.lexis -= price;
  if (item.kind === 'map') game.player.mapLevel = item.level;
  else if (['weapon', 'armor', 'boots'].includes(item.kind)) equip(game.player, itemId);
  else addItem(game.player, itemId);
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
