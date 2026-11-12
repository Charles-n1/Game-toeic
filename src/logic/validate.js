// 🔒 Everything read from the phone storage is checked here BEFORE the app uses it.
// A broken or modified save must never crash the app.
// Rule: we only keep what has EXACTLY the expected shape (a "whitelist"). The rest is thrown away.
import { CATEGORIES } from '../data/categories';
import { TEST_LEVELS } from '../data/sections';
import { LEVEL_TESTS } from '../data/levelTest';
import { isSafeWallpaper } from './wallpaper';

// Limits, also used by the forms (so a user can't type absurd values either).
export const MAX_TRAINING_SECONDS = 5 * 60 * 60; // 5 hours
export const MAX_TRAINING_QUESTIONS = 1000;
const MAX_HISTORY = 500; // charts kept in the history
const MIN_DATE = Date.UTC(2020, 0, 1); // dates are saved as numbers (milliseconds)
const MAX_DATE = Date.UTC(2100, 0, 1);
const MAX_GROUP = 20; // questions on screen at once (a long text has 5)
const MAX_LEVEL_QUESTIONS = 200; // questions in a level test (100 for the accurate one)
const MAX_ANSWERS = 1e6; // answers in one session
const MAX_WHY = 5000; // characters of a "why"

const SECTION_IDS = ['rc10', 'rc8', 'text'];
const DIFFICULTIES = ['normal', 'hard', 'extreme'];
const CATEGORY_IDS = CATEGORIES.map((category) => category.id);
const DAY_KEY = /^[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4}$/; // "Mon Oct 05 2026"
const QUESTION_KEY = /^(rc10|rc8|text)\|/; // "rc10|The manager asked...|"

// ---------- Small checks ----------

function isInt(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function isNumber(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

// A real {...} object (not null, not a list).
function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ---------- One validator per saved thing ----------

// A list of TOEIC parts: ['rc10', 'rc8'], without duplicates.
function isSectionList(sections) {
  return (
    Array.isArray(sections) &&
    sections.length > 0 &&
    sections.length <= SECTION_IDS.length &&
    sections.every((id) => SECTION_IDS.includes(id)) &&
    new Set(sections).size === sections.length // no duplicates
  );
}

// The "target": null (= all categories) or a list of known categories, without duplicates.
function isTarget(categories) {
  if (categories === null) return true;
  return (
    Array.isArray(categories) &&
    categories.length > 0 &&
    categories.every((id) => CATEGORY_IDS.includes(id)) &&
    new Set(categories).size === categories.length
  );
}

// { sections, useTime, seconds, useCount, count, difficulty, multiDocs, categories } or null.
// Old saves don't have multiDocs / categories: they get false / null.
export function validTrainingConfig(config) {
  if (!isObject(config)) return null;
  const { sections, useTime, seconds, useCount, count, difficulty } = config;
  const multiDocs = config.multiDocs === undefined ? false : config.multiDocs;
  const categories = config.categories === undefined ? null : config.categories;
  const ok =
    isSectionList(sections) &&
    typeof useTime === 'boolean' &&
    typeof useCount === 'boolean' &&
    (!useTime || isInt(seconds, 1, MAX_TRAINING_SECONDS)) &&
    (!useCount || isInt(count, 1, MAX_TRAINING_QUESTIONS)) &&
    DIFFICULTIES.includes(difficulty) &&
    typeof multiDocs === 'boolean' &&
    isTarget(categories);
  if (!ok) return null;
  // We rebuild the object: any extra key added by someone is dropped.
  // A value whose box is unticked is not used: we put null, so nothing strange can stay inside.
  return {
    sections: sections,
    useTime: useTime,
    seconds: useTime ? seconds : null,
    useCount: useCount,
    count: useCount ? count : null,
    difficulty: difficulty,
    multiDocs: multiDocs,
    categories: categories,
  };
}

// { total, oral } or null.
export function validGoal(goal) {
  if (!isObject(goal)) return null;
  if (!isInt(goal.total, 10, 990) || !isInt(goal.oral, 5, 495)) return null;
  return { total: goal.total, oral: goal.oral };
}

// { themeName, wallpaper, wallpaperOpacity, frendComes, noWhy } or null.
export function validLook(look) {
  if (!isObject(look)) return null;
  const wallpaperOk = look.wallpaper === null || isSafeWallpaper(look.wallpaper);
  if (typeof look.themeName !== 'string' || !wallpaperOk || !isNumber(look.wallpaperOpacity, 0, 1)) return null;
  return {
    themeName: look.themeName,
    wallpaper: look.wallpaper,
    wallpaperOpacity: look.wallpaperOpacity,
    frendComes: look.frendComes !== false, // only a real "false" switches it off (old saves: on)
    noWhy: look.noWhy === true, // only a real "true" switches it on (old saves: the "Why ?" is asked)
  };
}

// { wordForms: { good, bad }, ... } or null. Only the known categories are kept.
export function validStats(stats) {
  if (!isObject(stats)) return null;
  const clean = {};
  for (const id of CATEGORY_IDS) {
    const counts = stats[id];
    if (isObject(counts) && isInt(counts.good, 0, 1e9) && isInt(counts.bad, 0, 1e9)) {
      clean[id] = { good: counts.good, bad: counts.bad };
    }
  }
  return clean;
}

// The big save: { progress, reviewLog, stats, history } or null.
// Here we check entry by entry: one bad entry doesn't erase all your progress.
export function validProgress(saved) {
  if (!isObject(saved)) return null;
  return {
    progress: cleanRetrieveProgress(saved.progress),
    reviewLog: cleanReviewLog(saved.reviewLog),
    stats: validStats(saved.stats) || {},
    history: cleanHistory(saved.history),
  };
}

function cleanRetrieveProgress(progress) {
  const clean = {};
  if (!isObject(progress)) return clean;
  for (const [key, entry] of Object.entries(progress)) {
    const ok =
      QUESTION_KEY.test(key) &&
      isObject(entry) &&
      isInt(entry.retrieve_time, 0, 1000) &&
      isNumber(entry.retrieve_date, MIN_DATE, MAX_DATE);
    if (ok) {
      clean[key] = { retrieve_time: entry.retrieve_time, retrieve_date: entry.retrieve_date };
    }
  }
  return clean;
}

function cleanReviewLog(reviewLog) {
  const clean = {};
  if (!isObject(reviewLog)) return clean;
  for (const [day, count] of Object.entries(reviewLog)) {
    if (DAY_KEY.test(day) && isInt(count, 0, 1e6)) {
      clean[day] = count;
    }
  }
  return clean;
}

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  const clean = [];
  for (const snapshot of history.slice(-MAX_HISTORY)) {
    if (isObject(snapshot) && isNumber(snapshot.date, MIN_DATE, MAX_DATE) && isObject(snapshot.stats)) {
      clean.push({ date: snapshot.date, stats: validStats(snapshot.stats) });
    }
  }
  return clean;
}

// ---------- Session in progress (training / test) ----------
// The questions are saved by their key ("rc10|The manager asked...|"): storage.js finds them again.

// [key, ...]: 1 to `max` question keys.
function isKeyList(list, max) {
  return (
    Array.isArray(list) &&
    list.length > 0 &&
    list.length <= max &&
    list.every((key) => typeof key === 'string' && QUESTION_KEY.test(key))
  );
}

// [0, null, 3]: one tapped answer (0 to 3) or null for each question of the group.
function isChoiceList(list, length) {
  return Array.isArray(list) && list.length === length && list.every((choice) => choice === null || isInt(choice, 0, 3));
}

// ["because...", null]: one "why" or null for each question of the group.
function isWhyList(list, length) {
  return (
    Array.isArray(list) &&
    list.length === length &&
    list.every((why) => why === null || (typeof why === 'string' && why.length <= MAX_WHY))
  );
}

// The good answers can't be more than the answers.
function isScore(score, answeredCount) {
  return isInt(answeredCount, 0, MAX_ANSWERS) && isInt(score, 0, answeredCount);
}

// The end of the clock: a date, or null (no clock).
function isEndsAt(endsAt) {
  return endsAt === null || isNumber(endsAt, MIN_DATE, MAX_DATE);
}

// { config, group, card, score, answeredCount, results, endsAt } or null (the questions are still keys).
export function validTrainingSession(saved) {
  if (!isObject(saved) || !isObject(saved.card)) return null;
  const config = validTrainingConfig(saved.config);
  const results = validStats(saved.results);
  const { group, card, score, answeredCount, endsAt } = saved;
  const ok =
    config !== null &&
    results !== null &&
    isKeyList(group, MAX_GROUP) &&
    isChoiceList(card.choices, group.length) &&
    isWhyList(card.whys, group.length) &&
    typeof card.submitted === 'boolean' &&
    isScore(score, answeredCount) &&
    isEndsAt(endsAt) &&
    (endsAt !== null) === config.useTime; // a clock only if the time was chosen
  if (!ok) return null;
  return {
    config: config,
    group: group,
    card: { choices: card.choices, whys: card.whys, submitted: card.submitted },
    score: score,
    answeredCount: answeredCount,
    results: results,
    endsAt: endsAt,
  };
}

// { kind: 'normal', sections, levelIndex, multiDocs } or { kind: 'level', level, list } or null.
function validExam(exam) {
  if (!isObject(exam)) return null;
  if (exam.kind === 'level') {
    const ok = Object.keys(LEVEL_TESTS).includes(exam.level) && isKeyList(exam.list, MAX_LEVEL_QUESTIONS);
    return ok ? { kind: 'level', level: exam.level, list: exam.list } : null;
  }
  const ok =
    exam.kind === 'normal' &&
    isSectionList(exam.sections) &&
    isInt(exam.levelIndex, 0, TEST_LEVELS.length - 1) &&
    typeof exam.multiDocs === 'boolean';
  return ok ? { kind: 'normal', sections: exam.sections, levelIndex: exam.levelIndex, multiDocs: exam.multiDocs } : null;
}

// { exam, group, choices, score, answeredCount, results, endsAt } or null (the questions are still keys).
export function validTestSession(saved) {
  if (!isObject(saved)) return null;
  const exam = validExam(saved.exam);
  const results = validStats(saved.results);
  const { group, choices, score, answeredCount, endsAt } = saved;
  const ok =
    exam !== null &&
    results !== null &&
    isKeyList(group, MAX_GROUP) &&
    isChoiceList(choices, group.length) &&
    isScore(score, answeredCount) &&
    endsAt !== null && // a test always has a clock
    isEndsAt(endsAt);
  if (!ok) return null;
  return {
    exam: exam,
    group: group,
    choices: choices,
    score: score,
    answeredCount: answeredCount,
    results: results,
    endsAt: endsAt,
  };
}
