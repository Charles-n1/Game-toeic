import { ITEMS } from '../data/items';
import { SCENES } from '../data/story';
import { say, notify } from './messages';
import { burst } from './particles';

// Health and mana grow with the level. Health is in HALF hearts (10 = 5 hearts).
export function maxHealth(player) {
  return 10 + (player.level - 1);
}

export function maxMana(player) {
  return 5 + (player.level - 1);
}

// The speed of the player in a fight: more speed = more time to answer.
export function speedOf(player) {
  return 10 + ITEMS[player.boots].speed + Math.floor(player.level / 2);
}

// The damage of one strike, in half hearts (before the resistance of the monster).
export function strikePower(player) {
  const obsidian = player.obsidianBlade > 0 ? 2 : 0;
  return ITEMS[player.weapon].power + obsidian;
}

// What the armor removes from each hit.
export function armorOf(player) {
  const stoneSkin = player.stoneSkin ? 2 : 0;
  return ITEMS[player.armor].defense + stoneSkin;
}

// The chance of a critical hit (double damage): 8%, +1% every 2 levels.
export function criticalChance(player) {
  return 0.08 + Math.floor(player.level / 2) * 0.01;
}

// XP needed to finish a level. It grows: the game is long.
export function xpForLevel(level) {
  return Math.round(40 * Math.pow(level, 1.5));
}

export function heal(player, amount) {
  player.health = Math.min(maxHealth(player), player.health + amount);
}

export function restoreMana(player, amount) {
  player.mana = Math.min(maxMana(player), player.mana + amount);
}

export function healFully(player) {
  player.health = maxHealth(player);
  player.mana = maxMana(player);
}

function levelUp(game) {
  const player = game.player;
  player.xp -= xpForLevel(player.level);
  player.level += 1;
  healFully(player);
  notify(game, '⭐ Level ' + player.level + '!', '#ffd23f');
  burst(game, player.x, player.y, '#ffd23f', 40);
  if (player.level === 3) awaken(game, 'obsidian', SCENES.obsidian);
}

export function gainXp(game, amount) {
  const player = game.player;
  player.xp += amount;
  while (player.xp >= xpForLevel(player.level)) levelUp(game);
}

// A hidden power wakes up (only once), with its scene.
export function awaken(game, key, scene) {
  if (game.player.powers.includes(key)) return;
  game.player.powers.push(key);
  say(game, scene.speaker, scene.lines);
}

// ---------- The bag: { itemId: how many } ----------

export function countItem(player, itemId) {
  return player.bag[itemId] || 0;
}

export function addItem(player, itemId, count = 1) {
  player.bag[itemId] = countItem(player, itemId) + count;
}

export function removeItem(player, itemId, count = 1) {
  player.bag[itemId] = countItem(player, itemId) - count;
  if (player.bag[itemId] <= 0) delete player.bag[itemId];
}

export function earnLexis(game, amount) {
  game.player.lexis += amount;
}

// Drinks a potion (or eats bread). Returns false if there is none.
export function usePotion(game, itemId) {
  const player = game.player;
  const item = ITEMS[itemId];
  if (countItem(player, itemId) === 0) return false;
  removeItem(player, itemId);
  if (item.heal) heal(player, item.heal);
  if (item.mana) restoreMana(player, item.mana);
  if (item.haste) player.haste = true; // used by the next fight (or the current one)
  return true;
}

// The player owns a new piece of equipment: wear it.
export function equip(player, itemId) {
  const kind = ITEMS[itemId].kind; // 'weapon' | 'armor' | 'boots'
  player[kind] = itemId;
}
