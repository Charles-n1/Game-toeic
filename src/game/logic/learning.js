import { CATEGORIES, successPercent, addAnswer } from '../../data/categories';
import { isDue } from '../../logic/retrieve';
import { today } from '../../logic/dates';
import { pickRandom } from '../../logic/random';
import { TIERS } from '../data/monsters';
import { typeOf } from '../data/types';
import { notify } from './messages';

// The game trains ONE grammar category at a time: the "focus" (the weakest one).
// Most monsters are of this type. When the goal of the player is reached in it, the focus swaps to the next
// weakest category. A mastered category comes back later, to check it was not forgotten (like the recovery).

const MIN_ANSWERS = 8; // answers needed before a category can be called "mastered"
const RETURN_DAYS = [3, 7, 14, 31]; // game days before a mastered category comes back (the last one repeats)
const FOCUS_CHANCE = 0.65; // the chance for a monster to be of the focus type

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

// The type of a new wild monster: mostly the focus, sometimes another one.
export function monsterCategory(game) {
  if (Math.random() < FOCUS_CHANCE) return game.focus.current;
  return pickRandom(CATEGORIES).id;
}

// Every answer of the game goes through here.
export function recordAnswer(game, question, isCorrect) {
  game.mastery = addAnswer(game.mastery, question.category, isCorrect);
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

// The difficulty the player has reached in a category: 0 Easy, 1 Normal, 2 Difficult, 3 Extreme.
// The better they are, the harder the questions of this type become.
export const RANKS = ['Easy', 'Normal', 'Difficult', 'Extreme'];
const RANK_STEPS = [40, 70, 90]; // % of good answers to reach Normal, Difficult, Extreme

export function difficultyRank(game, categoryId) {
  const percent = skillPercent(game, categoryId);
  return RANK_STEPS.filter((step) => percent >= step).length;
}

// The chance to get a question of the harder difficulties: it grows with the TOEIC score and with the rank.
function hardChance(game, tier, categoryId) {
  const scoreBonus = (game.score / 495 - 0.5) * 0.2;
  const rankBonus = (difficultyRank(game, categoryId) - 1) * 0.15;
  return Math.min(0.9, Math.max(0.05, tier.hardChance + scoreBonus + rankBonus));
}

function firstNotEmpty(lists) {
  return lists.find((list) => list.length > 0);
}

// A question for this opponent: of its tier, and of its type when the tier has some
// (never twice in the same fight).
// lastText: the text of the question before (null = none). Its other questions come first: like in the real
// exam, a text is read once and answered several times.
// Then the questions to recover today (failed before, due now): "it returns when it's time".
export function pickQuestion(game, opponent, usedIds, lastText) {
  const tier = TIERS[opponent.tier];
  const fresh = game.run.questions.filter((q) => !usedIds.includes(q.id));
  const ofTier = fresh.filter((q) => tier.sections.includes(q.section));
  const ofType = ofTier.filter((q) => q.category === opponent.category);
  const pool = firstNotEmpty([ofType, ofTier, fresh, game.run.questions]);

  const ofSameText = pool.filter((q) => q.text !== null && q.text === lastText);
  if (ofSameText.length > 0) return ofSameText[0];
  const due = pool.filter((q) => isDue(q, today()));
  if (due.length > 0) return pickRandom(due);

  const wanted = Math.random() < hardChance(game, tier, opponent.category) ? tier.hard : tier.easy;
  return pickRandom(firstNotEmpty([pool.filter((q) => wanted.includes(q.difficulty)), pool]));
}
