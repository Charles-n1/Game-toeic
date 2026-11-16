import { insideOf } from '../data/zones';
import { ITEMS } from '../data/items';
import { TILE, tileAt, isSolid } from '../world/map';
import { countItem, addItem, removeItem } from './player';
import { say, notify } from './messages';

// The home of the hero (an inside: see data/zones.js). The hero can place furniture in it (bought from Finn,
// the carpenter), change the color of the walls and of the bed, and keep things in the chest.
// game.home: { furniture: [{ itemId, x, y }], wall: 0, bed: 0, storage: { itemId: count } }

export const WALL_COLORS = ['#e6d3ad', '#c9e4f2', '#f2c9d9', '#d4e8c4', '#e0d0f0', '#5a4a3a'];
export const BED_COLORS = ['#d6302f', '#3a7bff', '#4cc35a', '#a066ff', '#ffd23f', '#f2f2f2'];

export function firstHome() {
  return { furniture: [], wall: 0, bed: 0, storage: {} };
}

export function isAtHome(game) {
  const home = insideOf('home');
  const { x, y } = game.player;
  return x >= home.x && x < home.x + home.w && y >= home.y && y < home.y + home.h;
}

// The furniture of the home, as props (they block the way, and are drawn).
export function furnitureProps(game) {
  return game.home.furniture.map((piece) => ({ kind: 'furniture', x: piece.x, y: piece.y, w: 1, h: 1, itemId: piece.itemId, look: ITEMS[piece.itemId].furniture, color: ITEMS[piece.itemId].color }));
}

// Can a piece of furniture go on the tile (x, y)? (A free tile of the floor, not the door mat.)
export function canPlaceAt(game, x, y) {
  const isFloor = tileAt(x, y) === TILE.WOOD_FLOOR || tileAt(x, y) === TILE.RUG;
  return isAtHome(game) && isFloor && !isSolid(x + 0.5, y + 0.5) && !game.home.furniture.some((piece) => piece.x === x && piece.y === y);
}

// Puts a piece of furniture of the bag on the tile in front of the hero. Returns false if it can not go there.
export function placeFurniture(game, itemId, front) {
  if (countItem(game.player, itemId) === 0 || !canPlaceAt(game, front.x, front.y)) return false;
  removeItem(game.player, itemId);
  game.home.furniture.push({ itemId: itemId, x: front.x, y: front.y });
  return true;
}

export function furnitureAt(game, x, y) {
  return game.home.furniture.find((piece) => piece.x === x && piece.y === y) || null;
}

// The piece goes back to the bag.
export function pickUpFurniture(game, piece) {
  game.home.furniture = game.home.furniture.filter((item) => item !== piece);
  addItem(game.player, piece.itemId);
  notify(game, ITEMS[piece.itemId].name + ' is back in your bag.');
}

// The walls and the bed change color: the next one of the list.
export function nextWallColor(game) {
  game.home.wall = (game.home.wall + 1) % WALL_COLORS.length;
}

export function nextBedColor(game) {
  game.home.bed = (game.home.bed + 1) % BED_COLORS.length;
}

// ---------- The chest of the home ----------

const KEPT_KINDS = ['material', 'goods', 'food', 'seed'];

// Everything that is not equipment, potions or tools goes into the chest.
export function storeAll(game) {
  let count = 0;
  for (const itemId of Object.keys(game.player.bag)) {
    if (!KEPT_KINDS.includes(ITEMS[itemId].kind)) continue;
    const amount = countItem(game.player, itemId);
    game.home.storage[itemId] = (game.home.storage[itemId] || 0) + amount;
    removeItem(game.player, itemId, amount);
    count += amount;
  }
  notify(game, count > 0 ? '📦 ' + count + ' thing(s) put in the chest.' : 'Nothing to put away.');
}

export function takeAll(game) {
  let count = 0;
  for (const [itemId, amount] of Object.entries(game.home.storage)) {
    addItem(game.player, itemId, amount);
    count += amount;
  }
  game.home.storage = {};
  notify(game, count > 0 ? '📦 You took ' + count + ' thing(s) from the chest.' : 'The chest is empty.');
}

export function openStorage(game) {
  const kept = Object.entries(game.home.storage).map(([itemId, amount]) => ITEMS[itemId].name + ' × ' + amount);
  say(game, null, [kept.length > 0 ? 'In the chest: ' + kept.join(', ') + '.' : 'The chest is empty.'], [
    { label: 'Put my materials and goods in it', icon: 'inventory', run: () => storeAll(game) },
    { label: 'Take everything', icon: 'inventory', run: () => takeAll(game) },
    { label: 'Close', run: () => {} },
  ]);
}
