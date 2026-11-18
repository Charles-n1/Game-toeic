import { ITEMS } from '../data/items';
import { GEAR_ITEMS } from '../data/items/gear';
import { SCENES } from '../data/story';
import { say, notify } from './messages';
import { burst } from './particles';
import { cue } from './cues';
import { emote } from './emotes';
import { pickRandom } from '../../logic/random';
import { boostOf } from './boosts';
import { statLinkBonus } from './statLinks';
import { gearConditionFactor, resetSlotDurability } from './durability';
import { obsidianBladeBonus } from './obsidian';
import { ensureIsekaiTodo } from './isekaiTodo/state';
import { skillTreeBonuses, awardSkillPointOnLevelUp, refineBonusForItem, checkAchievements } from './isekaiTodo/progression';

const EQUIP_SLOTS = ['weapon', 'armor', 'boots', 'accessory'];

function equippedStat(player, field, game = null) {
  let total = 0;
  for (const slot of EQUIP_SLOTS) {
    const id = player[slot];
    if (id && ITEMS[id] && (ITEMS[id][field] || game)) {
      const wearScale = game && field !== 'health' ? gearConditionFactor(game, slot) : 1;
      const base = ITEMS[id][field] || 0;
      const refBonus = game && ((slot === 'weapon' && field === 'power') || (slot === 'armor' && field === 'defense')) ? refineBonusForItem(game, id) : 0;
      if (base || refBonus) total += Math.round((base + refBonus) * wearScale);
    }
  }
  return total;
}

export function accessoryStat(player, field) {
  const id = player.accessory;
  return (id && ITEMS[id] && ITEMS[id][field]) || 0;
}

export function spellPowerBonus(game) {
  if (!game) return 0;
  const stBonus = skillTreeBonuses(game).spell || 0;
  return equippedStat(game.player, 'spell', game) + boostOf(game, 'spell') + statLinkBonus(game, 'spell') + stBonus;
}

// Health and mana grow with the level, gear, boosts, skill tree, and English stat links.
export function maxHealth(player, game = null) {
  const gear = equippedStat(player, 'health', game);
  const link = game ? boostOf(game, 'health') + statLinkBonus(game, 'health') + (skillTreeBonuses(game).health || 0) : 0;
  return Math.round(Math.max(20, 100 + (player.level - 1) * 10 + gear + link));
}

export function maxMana(player, game = null) {
  const treeMana = game ? skillTreeBonuses(game).mana || 0 : 0;
  const exhMana = game ? ensureIsekaiTodo(game).manaExhaustions || 0 : 0;
  return 5 + (player.level - 1) + treeMana + exhMana;
}

// The speed of the player in a fight: more speed = more time to answer.
export function speedOf(player, game = null) {
  const tree = game ? skillTreeBonuses(game).speed || 0 : 0;
  const link = game ? boostOf(game, 'speed') + statLinkBonus(game, 'speed') + tree : 0;
  const fatiguePenalty = (player.fatigue || 0) >= 85 ? -2 : 0;
  return Math.max(4, 10 + equippedStat(player, 'speed', game) + Math.floor(player.level / 2) + link + fatiguePenalty);
}

// The damage of one strike, in HP (before the resistance of the monster).
export function strikePower(player, game = null) {
  const obsidian = obsidianBladeBonus(player);
  const tree = game ? skillTreeBonuses(game).attack || 0 : 0;
  const link = game ? boostOf(game, 'attack') + statLinkBonus(game, 'attack') + tree : 0;
  return Math.max(2, equippedStat(player, 'power', game) + obsidian + link);
}

// What the armor removes from each hit.
export function armorOf(player, game = null) {
  const stoneSkin = player.stoneSkin ? 20 : 0;
  const tree = game ? skillTreeBonuses(game).armor || 0 : 0;
  const link = game ? boostOf(game, 'defense') + statLinkBonus(game, 'defense') + tree : 0;
  return Math.max(0, equippedStat(player, 'defense', game) + stoneSkin + link);
}

// The chance of a critical hit (double damage): 8%, +1% every 2 levels + Skill Tree.
export function criticalChance(player, game = null) {
  const tree = game ? (skillTreeBonuses(game).critical || 0) / 100 : 0;
  return 0.08 + Math.floor(player.level / 2) * 0.01 + tree;
}

// XP needed to finish a level (3x slower progression for a realistic RPG curve).
export function xpForLevel(level) {
  return Math.round(120 * Math.pow(level, 1.5));
}

export function heal(player, amount, game = null) {
  player.health = Math.min(maxHealth(player, game), Math.round(player.health + amount));
}

export function restoreMana(player, amount, game = null) {
  player.mana = Math.min(maxMana(player, game), Math.round(player.mana + amount));
}

export function healFully(player, game = null) {
  player.health = maxHealth(player, game);
  player.mana = maxMana(player, game);
}

function levelUp(game) {
  const player = game.player;
  const fromLevel = player.level;
  const beforeStats = {
    hp: maxHealth(player, game),
    mp: maxMana(player, game),
    atk: strikePower(player, game),
    def: armorOf(player, game),
    spd: speedOf(player, game),
  };
  player.xp -= xpForLevel(player.level);
  player.level += 1;
  awardSkillPointOnLevelUp(game, 1);
  healFully(player, game);
  const afterStats = {
    hp: maxHealth(player, game),
    mp: maxMana(player, game),
    atk: strikePower(player, game),
    def: armorOf(player, game),
    spd: speedOf(player, game),
  };
  const abilities = ['+1 Skill Point (Menu → Powers → Skill Tree)'];
  if (player.level === 3) abilities.push('Obsidian Awakening triggered!');
  if (player.level === 6) abilities.push('Time Magic Resonance awakened!');
  if (player.level === 7) abilities.push('Gravity Magic Resonance awakened!');
  if (game.run) {
    if (!Array.isArray(game.run.levelUpQueue)) game.run.levelUpQueue = [];
    game.run.levelUpQueue.push({
      fromLevel,
      toLevel: player.level,
      skillPointsGained: 1,
      stats: [
        { label: 'Max HP', before: beforeStats.hp, after: afterStats.hp, delta: afterStats.hp - beforeStats.hp },
        { label: 'Max MP', before: beforeStats.mp, after: afterStats.mp, delta: afterStats.mp - beforeStats.mp },
        { label: 'Attack', before: beforeStats.atk, after: afterStats.atk, delta: afterStats.atk - beforeStats.atk },
        { label: 'Armor', before: beforeStats.def, after: afterStats.def, delta: afterStats.def - beforeStats.def },
        { label: 'Speed', before: beforeStats.spd, after: afterStats.spd, delta: afterStats.spd - beforeStats.spd },
      ],
      abilities,
    });
  }
  notify(game, '⭐ Level ' + player.level + '! (+1 Skill Point)', '#ffd23f');
  cue(game, 'levelUp');
  burst(game, player.x, player.y, '#ffd23f', 40);
  emote(game, 'hero', 'sparkle');
  if (player.level === 3) awaken(game, 'obsidian', SCENES.obsidian);
  checkAchievements(game);
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
  if (item.curesStatus && game.run.fight?.statuses?.player) {
    game.run.fight.statuses.player = {};
    notify(game, '💚 Status effects cured!', '#7cfc9a');
  }
  if (item.food) player.hunger = Math.min(100, player.hunger + item.food); // bread, eaten in a fight
  if (item.water) player.thirst = Math.min(100, player.thirst + item.water);
  if (item.mana) restoreMana(player, item.mana);
  if (item.haste) player.haste = true; // used by the next fight (or the current one)
  if (item.extraTime) game.run.fight.limit += item.extraTime * 1000;
  if (item.hint) hideWrongAnswer(game.run.fight);
  if (game.run.fight) {
    game.run.fight.drankAt = Date.now(); // for the animation (the hero drinks)
    if (item.kind === 'potion') game.run.fight.usedPotion = true;
  }
  return true;
}

// The player owns a new piece of equipment: wear it.
export function equip(player, itemId, game = null) {
  const kind = ITEMS[itemId]?.kind; // 'weapon' | 'armor' | 'boots' | 'accessory'
  if (!EQUIP_SLOTS.includes(kind)) return;
  const prev = player[kind];
  if (kind === 'accessory' && prev && prev !== itemId) addItem(player, prev, 1);
  player[kind] = itemId;
  if (game) resetSlotDurability(game, kind);
}

// Swaps an equipment item from the bag into its slot, returning the old item to the bag.
export function equipFromBag(player, itemId, game = null) {
  const kind = ITEMS[itemId]?.kind;
  if (!EQUIP_SLOTS.includes(kind) || countItem(player, itemId) <= 0) return false;
  removeItem(player, itemId, 1);
  const prev = player[kind];
  if (prev && prev !== itemId) addItem(player, prev, 1);
  player[kind] = itemId;
  if (game) resetSlotDurability(game, kind);
  return true;
}

// Opens a mystery crate or sealed coffer stolen/found in the world and awards a surprise reward.
export function openMysteryItem(game, itemId) {
  const item = ITEMS[itemId];
  if (!item || item.kind !== 'mystery' || countItem(game.player, itemId) <= 0) return null;
  removeItem(game.player, itemId, 1);

  const gearKeys = Object.keys(GEAR_ITEMS);
  const unowned = gearKeys.filter((id) => !game.player.bag[id] && game.player[ITEMS[id]?.kind] !== id);
  const roll = Math.random();
  const rare = item.tier === 'rare';
  let rewardText = '';
  let granted = [];

  if (roll < (rare ? 0.5 : 0.28) && gearKeys.length > 0) {
    const pick = pickRandom(unowned.length > 0 ? unowned : gearKeys);
    addItem(game.player, pick, 1);
    granted.push(pick);
    rewardText = ITEMS[pick].name;
  } else if (roll < (rare ? 0.72 : 0.55)) {
    const supplies = rare ? ['bigPotion', 'speedPotion', 'hintPotion'] : ['warRations', 'healthPotion', 'crystal'];
    const lex = rare ? 65 : 35;
    for (const id of supplies) {
      addItem(game.player, id, 1);
      granted.push(id);
    }
    earnLexis(game, lex);
    rewardText = supplies.map((id) => ITEMS[id].name).join(' + ') + ' + ' + lex + ' Lexis';
  } else if (roll < (rare ? 0.88 : 0.8)) {
    const treasure = rare ? pickRandom(['goldenChalice', 'silverBrooch', 'crystal', 'autoHeater']) : pickRandom(['caravanParcel', 'rareSpice', 'silkBolt', 'turretKit']);
    addItem(game.player, treasure, 1);
    granted.push(treasure);
    rewardText = ITEMS[treasure].name;
  } else {
    const count = rare ? 2 : 1;
    addItem(game.player, 'gem', count);
    const lex = rare ? 90 : 45;
    earnLexis(game, lex);
    granted.push('gem');
    rewardText = (count > 1 ? count + ' Gems' : 'Gem') + ' + ' + lex + ' Lexis';
  }

  cue(game, 'victory');
  burst(game, game.player.x, game.player.y, '#ffd23f', 22);
  notify(game, '🎁 Opened ' + item.name + ': found ' + rewardText + '!', '#ffd23f');
  return { granted: granted, summary: rewardText };
}
