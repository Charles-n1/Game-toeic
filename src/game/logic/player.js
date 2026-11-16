import { ITEMS } from '../data/items';
import { SCENES } from '../data/story';
import { say, notify } from './messages';
import { burst } from './particles';
import { cue } from './cues';
import { emote } from './emotes';
import { pickRandom } from '../../logic/random';
import { boostOf } from './boosts';
import { statLinkBonus } from './statLinks';

const EQUIP_SLOTS = ['weapon', 'armor', 'boots', 'accessory'];

function equippedStat(player, field) {
  let total = 0;
  for (const slot of EQUIP_SLOTS) {
    const id = player[slot];
    if (id && ITEMS[id] && ITEMS[id][field]) total += ITEMS[id][field];
  }
  return total;
}

export function accessoryStat(player, field) {
  const id = player.accessory;
  return (id && ITEMS[id] && ITEMS[id][field]) || 0;
}

export function spellPowerBonus(game) {
  if (!game) return 0;
  return equippedStat(game.player, 'spell') + boostOf(game, 'spell') + statLinkBonus(game, 'spell');
}

// Health and mana grow with the level, gear, boosts, and English stat links.
export function maxHealth(player, game = null) {
  const gear = equippedStat(player, 'health');
  const link = game ? boostOf(game, 'health') + statLinkBonus(game, 'health') : 0;
  return Math.max(20, 100 + (player.level - 1) * 10 + gear + link);
}

export function maxMana(player) {
  return 5 + (player.level - 1);
}

// The speed of the player in a fight: more speed = more time to answer.
export function speedOf(player, game = null) {
  const link = game ? boostOf(game, 'speed') + statLinkBonus(game, 'speed') : 0;
  return Math.max(4, 10 + equippedStat(player, 'speed') + Math.floor(player.level / 2) + link);
}

// The damage of one strike, in HP (before the resistance of the monster).
export function strikePower(player, game = null) {
  const obsidian = player.obsidianBlade > 0 ? 20 : 0;
  const link = game ? boostOf(game, 'attack') + statLinkBonus(game, 'attack') : 0;
  return Math.max(2, equippedStat(player, 'power') + obsidian + link);
}

// What the armor removes from each hit.
export function armorOf(player, game = null) {
  const stoneSkin = player.stoneSkin ? 20 : 0;
  const link = game ? boostOf(game, 'defense') + statLinkBonus(game, 'defense') : 0;
  return Math.max(0, equippedStat(player, 'defense') + stoneSkin + link);
}

// The chance of a critical hit (double damage): 8%, +1% every 2 levels.
export function criticalChance(player) {
  return 0.08 + Math.floor(player.level / 2) * 0.01;
}

// XP needed to finish a level. It grows: the game is long.
export function xpForLevel(level) {
  return Math.round(40 * Math.pow(level, 1.5));
}

export function heal(player, amount, game = null) {
  player.health = Math.min(maxHealth(player, game), player.health + amount);
}

export function restoreMana(player, amount) {
  player.mana = Math.min(maxMana(player), player.mana + amount);
}

export function healFully(player, game = null) {
  player.health = maxHealth(player, game);
  player.mana = maxMana(player);
}

function levelUp(game) {
  const player = game.player;
  player.xp -= xpForLevel(player.level);
  player.level += 1;
  healFully(player, game);
  notify(game, '⭐ Level ' + player.level + '!', '#ffd23f');
  cue(game, 'levelUp');
  burst(game, player.x, player.y, '#ffd23f', 40);
  emote(game, 'hero', 'sparkle');
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
  if (amount > 0) cue(game, 'coin');
}

// Can this potion be used now? The time and hint potions only work during a question of a fight.
export function canUsePotion(game, itemId) {
  if (countItem(game.player, itemId) === 0) return false;
  if (!ITEMS[itemId].inFight) return true;
  return game.run.fight !== null && game.run.fight.phase === 'ask';
}

// The hint: one wrong answer of the question disappears.
function hideWrongAnswer(fight) {
  const wrong = [0, 1, 2, 3].filter((index) => index !== fight.question.correct_index && !fight.hidden.includes(index));
  if (wrong.length > 1) fight.hidden.push(pickRandom(wrong));
}

// Drinks a potion (or eats bread). Returns false if it can not be used now.
export function usePotion(game, itemId) {
  const player = game.player;
  const item = ITEMS[itemId];
  if (!canUsePotion(game, itemId)) return false;
  removeItem(player, itemId);
  if (item.heal) heal(player, item.heal, game);
  if (item.food) player.hunger = Math.min(100, player.hunger + item.food); // bread, eaten in a fight
  if (item.water) player.thirst = Math.min(100, player.thirst + item.water);
  if (item.mana) restoreMana(player, item.mana);
  if (item.haste) player.haste = true; // used by the next fight (or the current one)
  if (item.extraTime) game.run.fight.limit += item.extraTime * 1000;
  if (item.hint) hideWrongAnswer(game.run.fight);
  if (game.run.fight) game.run.fight.drankAt = Date.now(); // for the animation (the hero drinks)
  return true;
}

// The player owns a new piece of equipment: wear it.
export function equip(player, itemId) {
  const kind = ITEMS[itemId]?.kind; // 'weapon' | 'armor' | 'boots' | 'accessory'
  if (!EQUIP_SLOTS.includes(kind)) return;
  const prev = player[kind];
  if (kind === 'accessory' && prev && prev !== itemId) addItem(player, prev, 1);
  player[kind] = itemId;
}

// Swaps an equipment item from the bag into its slot, returning the old item to the bag.
export function equipFromBag(player, itemId) {
  const kind = ITEMS[itemId]?.kind;
  if (!EQUIP_SLOTS.includes(kind) || countItem(player, itemId) <= 0) return false;
  removeItem(player, itemId, 1);
  const prev = player[kind];
  if (prev && prev !== itemId) addItem(player, prev, 1);
  player[kind] = itemId;
  return true;
}
