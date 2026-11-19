import { CATEGORIES, categoryOf } from '../../../data/categories';
import { ITEMS } from '../../data/items';
import { SKILL_TREE, ACHIEVEMENTS, WEAPON_CLASSES } from '../../data/isekaiTodo';
import { ensureIsekaiTodo } from './state';
import { skillPercent } from '../learning';
import { countItem, removeItem, earnLexis } from '../player';
import { notify } from '../messages';
import { cue } from '../cues';

// Progression systems for ISEKAI_TODO:
// - Skill Tree (4 branches, mastery gates, spell unlocks, passive stat bonuses)
// - Achievements (18 milestones with Lexis / XP / Skill Point rewards)
// - Weapon Mastery (5 weapon classes, Lv 1..10, special moves)
// - Mana Exhaustion (fainting at 0 MP outside bosses/duels for permanent +1 Max MP)
// - Blacksmith Refining (+0 to +10 with Refine Stones & Protection Scrolls)

const BONUS_KEYS = [
  'attack',
  'critical',
  'armor',
  'health',
  'mana',
  'spell',
  'speed',
  'tameChance',
  'carry',
  'partyAtk',
  'timePct',
  'xpPct',
  'discount',
  'lexisPct',
];

// ---------- Skill Tree ----------

// Awards `count` skill points on level up and returns the new total.
export function awardSkillPointOnLevelUp(game, count = 1) {
  const st = ensureIsekaiTodo(game);
  st.skillPoints += Math.max(0, Math.round(count));
  return st.skillPoints;
}

// Returns whether a skill tree node has been unlocked.
export function isSkillUnlocked(game, nodeId) {
  return Boolean(ensureIsekaiTodo(game).skillNodes[nodeId]);
}

// Validates whether `nodeId` can currently be unlocked, returning `{ ok, reason }`.
export function canUnlockSkillNode(game, nodeId) {
  const node = SKILL_TREE.find((n) => n.id === nodeId);
  if (!node) return { ok: false, reason: 'Unknown skill node.' };
  const st = ensureIsekaiTodo(game);
  if (st.skillNodes[nodeId]) return { ok: false, reason: 'Already unlocked.' };
  if (node.req && !st.skillNodes[node.req]) {
    const reqNode = SKILL_TREE.find((n) => n.id === node.req);
    return { ok: false, reason: 'Requires ' + (reqNode ? reqNode.name : node.req) + ' first.' };
  }
  if (node.needMastery) {
    const pct = skillPercent(game, node.needMastery.cat);
    if (pct < node.needMastery.min) {
      const catName = categoryOf(node.needMastery.cat)?.short || node.needMastery.cat;
      return { ok: false, reason: 'Needs ' + catName + ' mastery >= ' + node.needMastery.min + '% (now ' + pct + '%).' };
    }
  }
  if (st.skillPoints < node.cost) {
    return { ok: false, reason: 'Requires ' + node.cost + ' Skill Point(s) (have ' + st.skillPoints + ').' };
  }
  return { ok: true, reason: '' };
}

// Unlocks a skill tree node, deducts cost, applies spell unlocks, and notifies the player.
export function unlockSkillNode(game, nodeId) {
  const check = canUnlockSkillNode(game, nodeId);
  if (!check.ok) return false;
  const node = SKILL_TREE.find((n) => n.id === nodeId);
  const st = ensureIsekaiTodo(game);
  st.skillPoints -= node.cost;
  st.skillNodes[nodeId] = true;
  if (node.unlocks) {
    st.spellsUnlocked[node.unlocks] = true;
  }
  cue(game, 'levelUp');
  notify(game, '✨ Skill unlocked: ' + node.name + '!', '#ffd23f');
  return true;
}

// Sums passive bonuses across all unlocked skill tree nodes.
export function skillTreeBonuses(game) {
  const st = ensureIsekaiTodo(game);
  const totals = {};
  for (const key of BONUS_KEYS) totals[key] = 0;
  for (const node of SKILL_TREE) {
    if (!st.skillNodes[node.id] || !node.bonus) continue;
    for (const [key, val] of Object.entries(node.bonus)) {
      if (totals[key] !== undefined) totals[key] += val;
    }
  }
  totals.tameChance = Math.round(totals.tameChance * 1000) / 1000;
  return totals;
}

// ---------- Achievements ----------

// Returns true if achievement `id` has already been unlocked.
export function hasAchievement(game, id) {
  return Boolean(ensureIsekaiTodo(game).achievements[id]);
}

function formatAchievementReward(reward) {
  if (!reward) return '';
  const parts = [];
  if (reward.lexis) parts.push('+' + reward.lexis + ' Lexis');
  if (reward.xp) parts.push('+' + reward.xp + ' XP');
  if (reward.skillPt) parts.push('+' + reward.skillPt + ' Skill Pt');
  return parts.length > 0 ? ' (' + parts.join(', ') + ')' : '';
}

// Unlocks an achievement once and grants its rewards safely without recursive XP loops.
export function unlockAchievement(game, id) {
  const st = ensureIsekaiTodo(game);
  if (st.achievements[id]?.claimed) return false;
  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  if (!ach) return false;
  const alreadyNotified = Boolean(st.achievements[id]);
  st.achievements[id] = { day: st.achievements[id]?.day || game.day || 1, claimed: true };
  if (ach.reward) {
    if (ach.reward.lexis && game.player) {
      if (typeof game.player.lexis !== 'number') game.player.lexis = 0;
      earnLexis(game, ach.reward.lexis);
    }
    if (ach.reward.xp && game.player) {
      game.player.xp = (game.player.xp || 0) + ach.reward.xp;
    }
    if (ach.reward.skillPt) {
      st.skillPoints += ach.reward.skillPt;
    }
  }
  cue(game, 'victory');
  if (!alreadyNotified) notify(game, ach.icon + ' Achievement: ' + ach.name + formatAchievementReward(ach.reward), '#ffd23f');
  return true;
}

// Evaluates achievement conditions and unlocks any newly earned milestones.
export function checkAchievements(game, event = {}) {
  const st = ensureIsekaiTodo(game);
  const highestCat = CATEGORIES.some((c) => skillPercent(game, c.id) >= 85);
  const checks = [
    ['firstBlood', (game.counts?.kills || 0) >= 1],
    ['fastDraw', Boolean((event.fastAnswerMs && event.fastAnswerMs <= 3000) || (st.weekly?.fastestAnswerMs > 0 && st.weekly.fastestAnswerMs <= 3000))],
    ['flawlessFight', Boolean(event.flawlessFight)],
    ['hundredCorrect', (game.counts?.correct || 0) >= 100],
    ['gerundMaster', highestCat || (st.weekly?.longestCleanStreak || 0) >= 30],
    ['raidSurvivor', (game.raid?.count || 0) >= 1],
    ['guildPromoted', Boolean(game.guild?.rank && game.guild.rank !== 'F')],
    ['ownGuild', Boolean(st.ownGuild?.founded)],
    ['monsterTamer', (st.tamed?.length || 0) >= 1],
    ['spiritPact', Object.keys(st.spirits?.contracted || {}).length >= 1],
    ['skyRider', Boolean(st.flyingMount?.unlocked)],
    ['masterRefiner', Object.values(st.refineByItem || {}).some((v) => v >= 5)],
    ['towerClimber', (st.tower?.maxFloor || 1) >= 6],
    ['secretSeeker', Object.keys(st.tower?.secretUnlocked || {}).length >= 1],
    ['emissaryBane', (st.emissariesDefeated?.length || 0) >= 1],
    ['chantMaster', (st.incantationsCast || 0) >= 3],
    ['heartBond', Object.values(st.companionArcs || {}).some((a) => Boolean(a && a.completed))],
    ['photographer', (st.gallery?.photos?.length || 0) >= 5],
  ];
  const unlocked = [];
  for (const [id, ok] of checks) {
    if (ok && unlockAchievement(game, id)) unlocked.push(id);
  }
  return unlocked;
}

// ---------- Weapon Mastery ----------

// Infers weapon class (`sword` | `bow` | `staff` | `dagger` | `axe`) for an item id.
export function weaponClassOf(itemId) {
  if (itemId && ITEMS[itemId]?.weaponClass) return ITEMS[itemId].weaponClass;
  const id = String(itemId || '');
  if (/bow/i.test(id)) return 'bow';
  if (/staff|wand|rod/i.test(id)) return 'staff';
  if (/dagger|knife|fang/i.test(id)) return 'dagger';
  if (/axe/i.test(id)) return 'axe';
  return 'sword';
}

function specialMoveFor(wClass, lv) {
  const spec = WEAPON_CLASSES[wClass]?.specialAt || {};
  let move = null;
  const thresholds = Object.keys(spec)
    .map(Number)
    .sort((a, b) => a - b);
  for (const threshold of thresholds) {
    if (lv >= threshold) move = spec[threshold];
  }
  return move;
}

// Mastery XP needed for each level of a weapon: the same for every level (a steady progression).
const MASTERY_XP_PER_LEVEL = 40;

// Returns weapon mastery stats and special move info for `wClass`.
export function weaponMasteryInfo(game, wClass = null) {
  const st = ensureIsekaiTodo(game);
  const resolved = wClass
    ? WEAPON_CLASSES[wClass]
      ? wClass
      : weaponClassOf(wClass)
    : weaponClassOf(game?.player?.weapon);
  const entry = st.weaponMastery[resolved] || { xp: 0, lv: 1 };
  const lv = Math.max(1, Math.min(10, entry.lv || 1));
  const xp = entry.xp || 0;
  const nextXp = MASTERY_XP_PER_LEVEL;
  const dmgMult = Math.round((1 + (lv - 1) * 0.06) * 100) / 100;
  const critBonus = (lv - 1) * 2;
  const specialMove = specialMoveFor(resolved, lv);
  return { wClass: resolved, lv, xp, nextXp, dmgMult, critBonus, specialMove };
}

// Grants weapon mastery XP to the currently equipped weapon class, leveling up to Lv 10.
export function trainWeaponMastery(game, xpGain = 4) {
  const st = ensureIsekaiTodo(game);
  const wClass = weaponClassOf(game?.player?.weapon);
  if (!st.weaponMastery[wClass]) st.weaponMastery[wClass] = { xp: 0, lv: 1 };
  const entry = st.weaponMastery[wClass];
  if (entry.lv >= 10) return weaponMasteryInfo(game, wClass);

  entry.xp += Math.max(0, xpGain);
  const beforeLv = entry.lv;
  while (entry.lv < 10 && entry.xp >= MASTERY_XP_PER_LEVEL) {
    entry.xp -= MASTERY_XP_PER_LEVEL;
    entry.lv += 1;
  }
  if (entry.lv >= 10) entry.xp = 0;

  if (entry.lv > beforeLv) {
    const label = WEAPON_CLASSES[wClass]?.name || wClass;
    notify(game, '🗡️ ' + label + ' Mastery reached Lv. ' + entry.lv + '!', '#ffd23f');
    cue(game, 'levelUp');
  }
  return weaponMasteryInfo(game, wClass);
}

// ---------- Mana Exhaustion ----------

// Returns true when player mana is at or below 20% of `maxMp` (minimum threshold 1).
export function isLowMana(player, maxMp) {
  if (!player || maxMp <= 0) return false;
  return player.mana <= Math.max(1, Math.floor(maxMp * 0.2));
}

// Triggers mana exhaustion outside bosses/duels, advancing 3h and granting up to +20 Max MP.
export function triggerManaExhaustion(game) {
  if (game.run?.fight?.opponent?.boss || game.run?.fight?.opponent?.duel) return false;
  const st = ensureIsekaiTodo(game);
  const prev = st.manaExhaustions || 0;
  st.manaExhaustions = Math.min(20, prev + 1);
  const gained = st.manaExhaustions > prev;

  game.hour = (game.hour || 0) + 3;
  if (game.hour >= 24) {
    game.hour -= 24;
    game.day = (game.day || 1) + 1;
  }
  if (game.run) game.run.fadeUntil = Date.now() + 900;
  if (game.player) game.player.mana = Math.max(1, game.player.mana || 0);

  cue(game, 'hit');
  notify(
    game,
    gained
      ? '🌀 Mana Exhaustion! You fainted briefly and woke up 3h later — permanent +1 Max MP gained!'
      : '🌀 Mana Exhaustion! You fainted briefly and woke up 3h later.',
    '#b48cff'
  );
  return true;
}

// ---------- Blacksmith Refining (+0 to +10) ----------

// Returns the current refine level (+0..+10) for `itemId`.
export function refineLevelOf(game, itemId) {
  if (!itemId) return 0;
  return ensureIsekaiTodo(game).refineByItem[itemId] || 0;
}

// Formats an item name with its refine suffix (`"Iron Sword +5"`).
export function refinedItemName(game, itemId) {
  const base = ITEMS[itemId]?.name || itemId || '';
  const lv = refineLevelOf(game, itemId);
  return lv > 0 ? base + ' +' + lv : base;
}

// Returns bonus attack (weapon) or defense (armor) provided by refining `itemId`.
export function refineBonusForItem(game, itemId) {
  const item = itemId ? ITEMS[itemId] : null;
  if (!item) return 0;
  const lv = refineLevelOf(game, itemId);
  if (lv <= 0) return 0;
  if (item.kind === 'weapon') return lv * 3 + Math.floor(lv * lv * 0.4);
  if (item.kind === 'armor') return lv * 2 + Math.floor(lv * lv * 0.3);
  return 0;
}

// Returns Lexis, material requirements, and base success percentage for refining from `lv`.
export function refineRequirements(lv) {
  const level = Math.max(0, Math.floor(lv || 0));
  return {
    lexis: 25 + level * 30,
    ore: 1 + Math.floor(level / 3),
    crystal: level >= 5 ? Math.floor((level - 3) / 2) : 0,
    ratePct: Math.max(25, 95 - level * 7),
  };
}

// Attempts to refine equipped `weapon` or `armor` (+0 to +10), never destroying the item.
export function refineGear(game, slot, { useProtection = false, useStone = false } = {}) {
  if (slot !== 'weapon' && slot !== 'armor') {
    return { ok: false, newLevel: 0, protectedFail: false, reason: 'Only weapons and armor can be refined.' };
  }
  const itemId = game.player?.[slot];
  if (!itemId || !ITEMS[itemId]) {
    return { ok: false, newLevel: 0, protectedFail: false, reason: 'No equipment in ' + slot + ' slot.' };
  }
  const st = ensureIsekaiTodo(game);
  const lv = refineLevelOf(game, itemId);
  if (lv >= 10) {
    return { ok: false, newLevel: lv, protectedFail: false, reason: 'Already at maximum refine level (+10).' };
  }
  const req = refineRequirements(lv);
  if ((game.player.lexis || 0) < req.lexis) {
    return { ok: false, newLevel: lv, protectedFail: false, reason: 'Need ' + req.lexis + ' Lexis.' };
  }
  if (countItem(game.player, 'ore') < req.ore) {
    return { ok: false, newLevel: lv, protectedFail: false, reason: 'Need ' + req.ore + ' Iron Ore.' };
  }
  if (req.crystal > 0 && countItem(game.player, 'crystal') < req.crystal) {
    return { ok: false, newLevel: lv, protectedFail: false, reason: 'Need ' + req.crystal + ' Blue Crystal.' };
  }
  if (useProtection && countItem(game.player, 'protectionScroll') < 1) {
    return { ok: false, newLevel: lv, protectedFail: false, reason: 'No Refine Protection Scroll in bag.' };
  }
  if (useStone && countItem(game.player, 'refineStone') < 1) {
    return { ok: false, newLevel: lv, protectedFail: false, reason: 'No Whetstone Shard in bag.' };
  }

  game.player.lexis -= req.lexis;
  removeItem(game.player, 'ore', req.ore);
  if (req.crystal > 0) removeItem(game.player, 'crystal', req.crystal);
  if (useProtection) removeItem(game.player, 'protectionScroll', 1);
  if (useStone) removeItem(game.player, 'refineStone', 1);

  const rate = useStone ? Math.min(98, req.ratePct + 15) : req.ratePct;
  const success = Math.random() * 100 < rate;

  if (success) {
    const newLevel = lv + 1;
    st.refineByItem[itemId] = newLevel;
    cue(game, 'levelUp');
    notify(game, '🔨 Refined ' + ITEMS[itemId].name + ' to +' + newLevel + '!', '#7cfc9a');
    checkAchievements(game);
    return { ok: true, newLevel, protectedFail: false };
  }

  let newLevel = lv;
  let protectedFail = false;
  if (lv > 3) {
    if (useProtection) {
      protectedFail = true;
      notify(game, '📜 Protection Scroll kept ' + ITEMS[itemId].name + ' +' + lv + ' safe!', '#ffd23f');
    } else {
      newLevel = lv - 1;
      st.refineByItem[itemId] = newLevel;
      notify(game, '💥 Refining failed! ' + ITEMS[itemId].name + ' slipped to +' + newLevel + '.', '#ff8a95');
    }
  } else {
    notify(game, '⚒️ Refining failed, but ' + refinedItemName(game, itemId) + ' held steady.', '#ffb070');
  }
  cue(game, 'hit');
  return { ok: false, newLevel, protectedFail };
}
