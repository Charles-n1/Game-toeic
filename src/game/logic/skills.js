import { CATEGORIES } from '../../data/categories';
import { typeOf } from '../data/types';
import { notify } from './messages';

// Every skill (a grammar category: gerunds, tenses...) has a TAG: Normal, Hard or Extreme.
// Each tag is the level above the one before: 100% in Normal is worth 20% in Hard (and 100% in Hard is worth
// 20% in Extreme). The same gap of 5 is used everywhere in the game:
//   - a good answer to a Hard question hits 5 times harder than a Normal one (Extreme: 25 times);
//   - a Hard monster has 5 times the health, and gives 5 times the XP and the Lexis.
// A skill evolves to the next tag when the player has MORE than 90% of good answers in its tag.

export const TAGS = ['normal', 'hard', 'extreme']; // the same names as the difficulties of the questions
export const TAG_NAMES = { normal: 'Normal', hard: 'Hard', extreme: 'Extreme' };
export const TAG_COLORS = { normal: '#3f9b2f', hard: '#e08a1e', extreme: '#d0304a' };
export const TAG_POWER = { normal: 1, hard: 5, extreme: 25 };
// The blows of the monsters only double at each tag (5 times would kill the hero in one blow).
export const TAG_ATTACK = { normal: 1, hard: 2, extreme: 4 };

const LAST_ANSWERS = 20; // the % of a tag is counted on its last 20 answers: it shows the level of NOW
const MIN_ANSWERS = 10; // answers of a tag needed before the skill can evolve
const EVOLVE_PERCENT = 90; // more than this % in its tag: the skill can evolve

// game.skills: { gerunds: { tag: 'normal', normal: [1, 0, 1...], hard: [], extreme: [] } }  (1 = a good answer)
export function emptySkills() {
  const skills = {};
  for (const category of CATEGORIES) skills[category.id] = { tag: 'normal', normal: [], hard: [], extreme: [] };
  return skills;
}

// The tag a skill has reached.
export function tagOf(game, categoryId) {
  return game.skills[categoryId].tag;
}

export function nextTag(tag) {
  return TAGS[TAGS.indexOf(tag) + 1] || null;
}

// The higher of two tags.
export function higherTag(a, b) {
  return TAGS.indexOf(a) >= TAGS.indexOf(b) ? a : b;
}

export function tagAnswers(game, categoryId, tag) {
  return game.skills[categoryId][tag].length;
}

// The % of good answers in one tag of a skill, on its last answers (0 if never answered).
export function tagPercent(game, categoryId, tag) {
  const answers = game.skills[categoryId][tag];
  if (answers.length === 0) return 0;
  return Math.round((answers.filter((good) => good === 1).length / answers.length) * 100);
}

// The power of a skill, counted in "Normal %": 100% Normal = 100 points, 20% Hard = 100 points too.
// From 0 to 3100 (100% in every tag).
export function skillPower(game, categoryId) {
  return TAGS.reduce((total, tag) => total + tagPercent(game, categoryId, tag) * TAG_POWER[tag], 0);
}

// Can this skill evolve to its next tag? More than 90% in its tag, on at least 10 answers.
export function canEvolve(game, categoryId) {
  const tag = tagOf(game, categoryId);
  if (!nextTag(tag)) return false;
  return tagAnswers(game, categoryId, tag) >= MIN_ANSWERS && tagPercent(game, categoryId, tag) > EVOLVE_PERCENT;
}

// The skill goes to its next tag: its monsters and its questions become harder, and stronger rewards come.
export function evolveSkill(game, categoryId) {
  if (!canEvolve(game, categoryId)) return;
  const skill = game.skills[categoryId];
  skill.tag = nextTag(skill.tag);
  notify(game, '⬆️ ' + typeOf(categoryId).short + ' is now ' + TAG_NAMES[skill.tag] + '!', TAG_COLORS[skill.tag]);
}

// Every answer of the game counts in the tag of its question. When a skill becomes ready to evolve, the
// player is told (they choose when: the Stats of the menu).
export function countTagAnswer(game, question, isCorrect) {
  const skill = game.skills[question.category];
  const answers = skill && skill[question.difficulty];
  if (!answers) return;
  const wasReady = canEvolve(game, question.category);
  answers.push(isCorrect ? 1 : 0);
  if (answers.length > LAST_ANSWERS) answers.shift();
  if (!wasReady && canEvolve(game, question.category)) {
    notify(game, '✨ ' + typeOf(question.category).short + ' can evolve to ' + TAG_NAMES[nextTag(skill.tag)] + '! (Menu → Stats)', '#ffd23f');
  }
}
