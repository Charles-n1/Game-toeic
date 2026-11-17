import { CATEGORIES, successPercent, addAnswer } from '../../data/categories';
import { isDue } from '../../logic/retrieve';
import { today } from '../../logic/dates';
import { pickRandom } from '../../logic/random';
import { TIERS } from '../data/monsters';
import { typeOf } from '../data/types';
import { TAGS, tagOf, countTagAnswer, spellLevel } from './skills';
import { notify } from './messages';
import { recordLinkTestAnswer } from './statLinks';

// The game trains the player's weakest grammar classes first.
// Most monsters target the weakest TOEIC category; custom weights can override this.

const MIN_ANSWERS = 8; // answers needed before a focus slot rotates
const RETURN_DAYS = [3, 7, 14, 31]; // game days before a mastered category comes back (the last one repeats)
const WEAKEST_CHANCE = 0.75; // chance to draw the weakest class (remaining 25% picks the 2nd weakest)

// The level of the player in a category, from 0 to 100 (their % of good answers).
export function skillPercent(game, categoryId) {
  return successPercent(game.mastery, categoryId);
}

// The rank of a spell, from 0 (can not cast it) to 5: one rank every 20%.
export function spellRank(game, categoryId) {
  return Math.floor(skillPercent(game, categoryId) / 20);
}

function isWaiting(game, categoryId) {
  const mastered = game.focus.mastered[categoryId];
  return !mastered || mastered.dueDay <= game.day;
}

// The weakest category that is not mastered (or that is due to come back). All mastered: the weakest of all.
export function chooseFocus(game) {
  const ids = CATEGORIES.map((category) => category.id);
  const waiting = ids.filter((id) => isWaiting(game, id));
  const list = waiting.length > 0 ? waiting : ids;
  return list.reduce((weakest, id) => (skillPercent(game, id) < skillPercent(game, weakest) ? id : weakest));
}

function isFocusReached(game) {
  const tally = game.focus.tally;
  const total = tally.good + tally.bad;
  return total >= MIN_ANSWERS && (tally.good / total) * 100 >= game.run.goalRate;
}

// The goal is reached: the category rests for some days, and the next weakest one becomes the focus.
function swapFocus(game) {
  const focus = game.focus;
  const done = focus.current;
  const times = focus.mastered[done] ? focus.mastered[done].times + 1 : 1;
  const wait = RETURN_DAYS[Math.min(times, RETURN_DAYS.length) - 1];
  focus.mastered[done] = { times: times, dueDay: game.day + wait };
  setFocus(game, chooseFocus(game));
  notify(game, '🎯 Goal reached in ' + typeOf(done).short + '! Now training: ' + typeOf(focus.current).short, '#7CFC9A');
}

function setFocus(game, categoryId) {
  game.focus.current = categoryId;
  game.focus.tally = { good: 0, bad: 0 };
}

// Called every new day: a mastered category whose time has come takes the focus back.
export function returnDueFocus(game) {
  const due = Object.keys(game.focus.mastered).find((id) => game.focus.mastered[id].dueDay <= game.day);
  if (!due || due === game.focus.current) return;
  delete game.focus.mastered[due];
  setFocus(game, due);
  notify(game, '🔁 ' + typeOf(due).short + ' is back: show you still know it!', '#9fd8ff');
}

// Custom TOEIC encounter weights ({ categoryId: 0..100 }) let the player focus monster types (e.g. 60% verbTenses).
export function customCategoryPercent(game, categoryId) {
  return (game.toeicWeights && game.toeicWeights[categoryId]) || 0;
}

export function setToeicWeight(game, categoryId, percent) {
  if (!game.toeicWeights) game.toeicWeights = {};
  const clamped = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  if (clamped <= 0) delete game.toeicWeights[categoryId];
  else game.toeicWeights[categoryId] = clamped;
  if (game.run && Array.isArray(game.run.monsters)) {
    game.run.monsters = game.run.monsters.filter((m) => m.key || m.raid);
  }
}

export function clearToeicWeights(game) {
  game.toeicWeights = {};
  if (game.run && Array.isArray(game.run.monsters)) {
    game.run.monsters = game.run.monsters.filter((m) => m.key || m.raid);
  }
}

/** Returns TOEIC categories ordered from lowest proficiency % to highest. */
export function weakestCategories(game) {
  return CATEGORIES.map((c) => c.id).sort((a, b) => skillPercent(game, a) - skillPercent(game, b));
}

// The type of a new monster: honors custom TOEIC weights when set, otherwise focuses on the weakest class(es).
export function monsterCategory(game) {
  const weights = game.toeicWeights || {};
  const entries = Object.entries(weights).filter(([, value]) => value > 0);
  if (entries.length > 0) {
    const sum = entries.reduce((total, [, value]) => total + value, 0);
    const cap = Math.min(100, sum);
    const roll = Math.random() * 100;
    if (roll < cap) {
      let cursor = (roll / cap) * sum;
      for (const [catId, weight] of entries) {
        cursor -= weight;
        if (cursor <= 0) return catId;
      }
      return entries[entries.length - 1][0];
    }
    const rest = CATEGORIES.map((c) => c.id).filter((id) => !weights[id]);
    if (rest.length > 0) return pickRandom(rest);
  }
  const ranked = weakestCategories(game);
  const first = game.focus?.current || ranked[0];
  const second = ranked.find((id) => id !== first) || first;
  return Math.random() < WEAKEST_CHANCE ? first : second;
}

// Every answer of the game goes through here.
export function recordAnswer(game, question, isCorrect) {
  game.mastery = addAnswer(game.mastery, question.category, isCorrect);
  countTagAnswer(game, question, isCorrect);
  recordLinkTestAnswer(game, question, isCorrect);
  game.counts.answers += 1;
  if (isCorrect) game.counts.correct += 1;
  if (question.category === game.focus.current) {
    if (isCorrect) game.focus.tally.good += 1;
    else game.focus.tally.bad += 1;
    if (isFocusReached(game)) swapFocus(game);
  }
  game.run.onAnswer(question, isCorrect); // the app keeps it too: stats, spider chart, recovery
}

// ---------- Which question a monster asks ----------

function firstNotEmpty(lists) {
  return lists.find((list) => list.length > 0);
}

// A question for this opponent: of its sections (short sentences, or long texts for the demons), of its TAG
// (a Hard monster asks Hard questions), and of its type when there are some (never twice in the same fight).
// lastText: the text of the question before (null = none). Its other questions come first: like in the real
// exam, a text is read once and answered several times.
// Then the questions to recover today (failed before, due now): "it returns when it's time".
// A training (at a dummy) asks only the sections chosen by the hero, and stays in the chosen category first.
function mixDifficulty(baseTag) {
  if (baseTag === 'extreme') return Math.random() < 0.7 ? 'extreme' : 'hard';
  if (baseTag === 'hard') return Math.random() < 0.7 ? 'hard' : 'normal';
  return 'normal';
}

/** Rolls question difficulty: Hard = 70% Hard / 30% Normal; Extreme = 70% Extreme / 30% Hard;
 *  Demons = ~78% Hard / ~22% Extreme; Demon King & Demon Queen = 100% Extreme. */
export function rollQuestionDifficulty(game, opponent) {
  if (
    opponent.species === 'king' ||
    opponent.species === 'queen' ||
    opponent.art === 'demonKing' ||
    opponent.art === 'demonQueen'
  ) {
    return 'extreme';
  }
  if (opponent.tier === 'demon') {
    return Math.random() < 0.78 ? 'hard' : 'extreme';
  }
  return mixDifficulty(opponent.tag || tagOf(game, opponent.category));
}

export function pickQuestion(game, opponent, usedIds, lastText) {
  const sections = opponent.sections || (TIERS[opponent.tier] || TIERS.small).sections;
  const baseTag = opponent.tag || tagOf(game, opponent.category);
  const rolledDiff = rollQuestionDifficulty(game, opponent);
  const bank = opponent.questions || game.run.questions; // a negotiation has its own sentences
  const fresh = bank.filter((q) => !usedIds.includes(q.id));
  const ofTier = fresh.filter((q) => sections.includes(q.section));
  const ofType = ofTier.filter((q) => q.category === opponent.category);
  const ofDiff = (list, diff) => list.filter((q) => q.difficulty === diff);
  const order = opponent.training
    ? [ofDiff(ofType, rolledDiff), ofDiff(ofType, baseTag), ofType, ofDiff(ofTier, rolledDiff), ofDiff(ofTier, baseTag), ofTier, fresh, bank]
    : [ofDiff(ofType, rolledDiff), ofDiff(ofTier, rolledDiff), ofDiff(ofType, baseTag), ofDiff(ofTier, baseTag), ofType, ofTier, fresh, bank];
  const pool = opponent.questions ? firstNotEmpty([fresh, bank]) : firstNotEmpty(order);

  const ofSameText = pool.filter((q) => q.text !== null && q.text === lastText);
  if (ofSameText.length > 0) return ofSameText[0];
  const due = pool.filter((q) => isDue(q, today()));
  if (due.length > 0) return pickRandom(due);
  return pickRandom(pool);
}

// The question of a spell: of the school of the spell, at the level the hero learned it (1 Normal, 2 Hard...).
// (A Gerund spell learned at Hard asks a Hard gerund sentence: it hits 5 times harder.)
export function pickSpellQuestion(game, categoryId, usedIds) {
  const baseTag = TAGS[Math.max(0, spellLevel(game, categoryId) - 1)];
  const diff = mixDifficulty(baseTag);
  const fresh = game.run.questions.filter((q) => !usedIds.includes(q.id) && q.section === 'rc10');
  const ofType = fresh.filter((q) => q.category === categoryId);
  const ofDiff = ofType.filter((q) => q.difficulty === diff);
  const ofBase = ofType.filter((q) => q.difficulty === baseTag);
  return pickRandom(firstNotEmpty([ofDiff, ofBase, ofType, fresh, game.run.questions]));
}
