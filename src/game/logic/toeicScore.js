import { CATEGORIES } from '../../data/categories';
import { SECTION_MAX } from '../../goal';

// The TOEIC reading score of the player, estimated from their answers (5 to 495), so that playing feels like
// getting better at the TOEIC. It follows the RECENT answers: an old mistake does not weigh forever, and each
// fight moves it a little. The goal of the player (the score they aim for) is shown next to it.
// game.toeic: { startRate (0..1, the level when the game began), recent: [true, false...] (the last answers),
//               days: { day: { categoryId: percent } } (the level of each category, each morning) }

const RECENT = 100; // answers: the score is the one of the last 100 answers
const LOWEST = 5; // the lowest TOEIC score
const DAYS_KEPT = 14; // days of the levels by category kept (for the trend)
const TREND_DAYS = 3; // the trend of a category: its level now against its level 3 days ago

export function ensureToeic(game) {
  if (!game.toeic || typeof game.toeic !== 'object') game.toeic = { startRate: overallRate(game.mastery), recent: [], days: {} };
  if (!Array.isArray(game.toeic.recent)) game.toeic.recent = [];
  if (!game.toeic.days) game.toeic.days = {};
  return game.toeic;
}

// The share of good answers among all the answers of the mastery (0 to 1). No answer: half.
function overallRate(mastery) {
  let good = 0;
  let total = 0;
  for (const counts of Object.values(mastery || {})) {
    good += counts.good;
    total += counts.good + counts.bad;
  }
  return total === 0 ? 0.5 : good / total;
}

// A share of good answers (0 to 1) as a TOEIC score: 5 by 5, from 5 to 495.
function asScore(rate) {
  return Math.max(LOWEST, Math.round((rate * SECTION_MAX) / 5) * 5);
}

// Every answer of the game goes here (see logic/learning.js).
export function rememberAnswer(game, isCorrect) {
  const toeic = ensureToeic(game);
  toeic.recent.push(isCorrect);
  if (toeic.recent.length > RECENT) toeic.recent.shift();
}

// The estimated score: the last 100 answers. With fewer, the missing ones count at the level of the start.
export function estimatedScore(game) {
  const toeic = ensureToeic(game);
  const good = toeic.recent.filter(Boolean).length;
  const missing = RECENT - toeic.recent.length;
  return asScore((good + missing * toeic.startRate) / RECENT);
}

// The score the player aims for (chosen when the game began).
export function goalScore(game) {
  return game.targetScore || game.score || SECTION_MAX;
}

// Each morning: the level of each category is written down (for the trend).
export function rememberTodayLevels(game) {
  const toeic = ensureToeic(game);
  toeic.days[game.day] = Object.fromEntries(CATEGORIES.map((category) => [category.id, percentOf(game, category.id)]));
  for (const day of Object.keys(toeic.days)) if (Number(day) < game.day - DAYS_KEPT) delete toeic.days[day];
}

function percentOf(game, categoryId) {
  const counts = game.mastery[categoryId];
  return !counts || counts.good + counts.bad === 0 ? 0 : Math.round((counts.good / (counts.good + counts.bad)) * 100);
}

// Each category: its level now (%) and how it moved in the last days (+ better, - worse, 0 the same).
export function categoryLevels(game) {
  const toeic = ensureToeic(game);
  const before = toeic.days[game.day - TREND_DAYS] || toeic.days[Math.min(...Object.keys(toeic.days).map(Number))] || {};
  return CATEGORIES.map((category) => {
    const now = percentOf(game, category.id);
    return { id: category.id, name: category.name, percent: now, trend: before[category.id] === undefined ? 0 : now - before[category.id] };
  });
}

// The last move of the score, for the HUD: +5, -5... for a few seconds after it moved (0: nothing to show).
export function lastScoreMove(game) {
  const score = estimatedScore(game);
  const run = game.run;
  if (run.toeicShown === undefined) run.toeicShown = score;
  if (score !== run.toeicShown) {
    run.toeicMove = { delta: score - run.toeicShown, until: Date.now() + 5000 };
    run.toeicShown = score;
  }
  return run.toeicMove && Date.now() < run.toeicMove.until ? run.toeicMove.delta : 0;
}
