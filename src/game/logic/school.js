import { TYPES, typeOf } from '../data/types';
import { TAGS, TAG_NAMES, tagOf, nextTag, canLearnSkill, learnSkill, lessonText } from './skills';
import { startFight } from './fight';
import { makeDuel } from './duels';
import { addFriendship } from './village';
import { gainXp } from './player';
import { MAX_CONTROL, summonSeconds } from './powers';
import { say, notify } from './messages';

// The Arcane School of Eldermoor: lessons to train ONE skill, at the tag the hero chooses (their tag, the one below,
// or the one above to try it). It is the way to train the skills of a class (see logic/classes.js).
// A lesson = a duel of words: 6 good answers to finish it, 3 mistakes and it is over. Nobody is hurt.

export const LESSON_PRICE = 10; // Lexis
const LESSON_ANSWERS = 6;
const LESSON_XP = 15;

// The tags the hero can train in a skill: up to one above their own.
function tagsToTrain(game, categoryId) {
  const highest = nextTag(tagOf(game, categoryId)) || tagOf(game, categoryId);
  return TAGS.slice(0, TAGS.indexOf(highest) + 1);
}

// sections: the kind of questions ('rc10' = short sentences, 'rc8' = a gap in a short text). null = any.
function startLesson(game, npc, categoryId, tag, price, sections = null) {
  function win() {
    if (npc.id) addFriendship(game, npc.id, 3);
    gainXp(game, LESSON_XP);
    say(game, npc.id, ['Well done. ' + typeOf(categoryId).short + ' is a little more yours today.']);
  }
  function lose() {
    if (npc.id) addFriendship(game, npc.id, 1);
    say(game, npc.id, ['Three mistakes. Read the explanations again: they are the real lesson.']);
  }
  game.player.lexis -= price;
  const title = (price > 0 ? 'Lesson of ' : 'Practice of ') + typeOf(categoryId).short + ' (' + TAG_NAMES[tag] + ')';
  const training = npc === DUMMY;
  startFight(game, makeDuel(npc, { title: title, category: categoryId, tag: tag, health: LESSON_ANSWERS, speed: 10, training: training, sections: sections, onWin: win, onLose: lose }));
}

function chooseTag(game, npc, categoryId, price, sections = null) {
  const choices = tagsToTrain(game, categoryId).map((tag) => ({ label: TAG_NAMES[tag], run: () => startLesson(game, npc, categoryId, tag, price, sections) }));
  say(game, npc.id, ['Your ' + typeOf(categoryId).short + ' is ' + TAG_NAMES[tagOf(game, categoryId)] + '. At which level do we work?'], [...choices, { label: 'Leave', run: () => {} }]);
}

function chooseSkill(game, npc, price) {
  if (game.player.lexis < price) {
    say(game, npc.id, ['A lesson costs ' + price + ' Lexis. Even knowledge must eat.']);
    return;
  }
  const choices = TYPES.map((type) => ({ label: type.short + ' · ' + TAG_NAMES[tagOf(game, type.id)], icon: type.id, run: () => chooseTag(game, npc, type.id, price) }));
  say(game, npc.id, ['Which skill do you want to train?'], [...choices, { label: 'Leave', run: () => {} }]);
}

// The choice of the talk menu with a teacher of the school.
export function schoolChoice(game, npc) {
  if (!npc.school) return null;
  return { label: 'Take a lesson (' + LESSON_PRICE + ' Lexis)', icon: 'book', run: () => chooseSkill(game, npc, LESSON_PRICE) };
}

// ---------- The training dummies of the villages ----------
// A free practice, in the category the hero chooses: only short sentences, or only a gap in a short text
// (never the long texts). The fight is the same, against a dummy of straw. Nobody is hurt.
// The hero can also train "Obsidian Control" there: the obsidian soldiers and the cat stay longer.

export const DUMMY = { id: null, name: 'Training Dummy', look: null, shape: 'dummy' };

const FORMATS = [
  { label: 'Short sentences', sections: ['rc10'] },
  { label: 'A gap in a text', sections: ['rc8'] },
];

function chooseFormat(game, categoryId) {
  const choices = FORMATS.map((format) => ({ label: format.label, icon: 'book', run: () => chooseTag(game, DUMMY, categoryId, 0, format.sections) }));
  say(game, null, ['What kind of sentences?'], [...choices, { label: 'Leave', run: () => {} }]);
}

function chooseSkillAtDummy(game) {
  const choices = TYPES.map((type) => ({ label: type.short + ' · ' + TAG_NAMES[tagOf(game, type.id)], icon: type.id, run: () => chooseFormat(game, type.id) }));
  say(game, null, ['Which skill do you want to train?'], [...choices, { label: 'Leave', run: () => {} }]);
}

// Obsidian Control: a harder practice (more good answers each level). Won: +1 level (+20 s for the summons).
function trainObsidianControl(game) {
  const player = game.player;
  const level = player.obsidianControl || 0;
  function win() {
    player.obsidianControl = level + 1;
    gainXp(game, LESSON_XP);
    notify(game, '🌑 Obsidian Control ' + player.obsidianControl + '/' + MAX_CONTROL + ': your soldiers and cat now stay ' + summonSeconds(player) + ' s!', '#c9a8ff');
  }
  function lose() {
    say(game, null, ['The black glass slips out of your mind. Try again: the explanations are the real lesson.']);
  }
  const categoryId = game.focus.current;
  startFight(game, makeDuel(DUMMY, { title: 'Obsidian Control ' + (level + 1) + '/' + MAX_CONTROL, category: categoryId, tag: tagOf(game, categoryId), health: 4 + level * 2, speed: 10, training: true, sections: ['rc10'], onWin: win, onLose: lose }));
}

function obsidianChoice(game) {
  const player = game.player;
  if (!player.powers.includes('obsidian')) return [];
  const level = player.obsidianControl || 0;
  if (level >= MAX_CONTROL) return [{ label: 'Obsidian Control: mastered (' + summonSeconds(player) + ' s)', icon: 'obsidianPet', run: () => say(game, null, ['Your summons already stay as long as they can.']) }];
  return [{ label: 'Obsidian Control ' + level + '/' + MAX_CONTROL + ' (summons stay ' + summonSeconds(player) + ' s)', icon: 'obsidianPet', run: () => trainObsidianControl(game) }];
}

export function practiceAtDummy(game) {
  say(game, null, ['A training dummy of straw. It never gets tired, and never laughs at your mistakes.'], [
    { label: 'Train a skill', icon: 'woodSword', run: () => chooseSkillAtDummy(game) },
    ...obsidianChoice(game),
    { label: 'Leave', run: () => {} },
  ]);
}

// ---------- The researchers: they teach the skills (the spells) ----------

function teach(game, npc, categoryId) {
  if (learnSkill(game, categoryId)) {
    say(game, npc.id, ['Good. Now you can cast ' + typeOf(categoryId).spell + ' in a fight (the Skills button).', 'Each level asks harder sentences in the fight... and hits much harder.']);
  } else {
    say(game, npc.id, ['Not yet. ' + lessonText(game, categoryId) + '.', 'Train it: the monsters of this type, the Arcane School, the training dummies.']);
  }
}

// The choice of the talk menu with someone who teaches skills (`teachesSkills` in data/npcs.js).
export function teacherChoice(game, npc) {
  if (!npc.teachesSkills) return null;
  function open() {
    const choices = npc.teachesSkills.map((categoryId) => ({ label: (canLearnSkill(game, categoryId) ? '★ ' : '') + lessonText(game, categoryId), icon: categoryId, run: () => teach(game, npc, categoryId) }));
    say(game, npc.id, ['I research the words. I can teach you a skill... if your level is higher than when you came to this world.'], [...choices, { label: 'Leave', run: () => {} }]);
  }
  return { label: 'Learn a skill', icon: 'powers', run: open };
}
