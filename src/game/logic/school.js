import { TYPES, typeOf } from '../data/types';
import { TAGS, TAG_NAMES, tagOf, nextTag, canLearnSkill, learnSkill, lessonText } from './skills';
import { startFight } from './fight';
import { makeDuel } from './duels';
import { addFriendship } from './village';
import { gainXp } from './player';
import { say } from './messages';

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

function startLesson(game, npc, categoryId, tag, price) {
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
  startFight(game, makeDuel(npc, { title: title, category: categoryId, tag: tag, health: LESSON_ANSWERS, speed: 10, onWin: win, onLose: lose }));
}

function chooseTag(game, npc, categoryId, price) {
  const choices = tagsToTrain(game, categoryId).map((tag) => ({ label: TAG_NAMES[tag], run: () => startLesson(game, npc, categoryId, tag, price) }));
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

// The training dummies of the villages: a free practice (the same as a lesson, without the teacher).
const DUMMY = { id: null, name: 'Training Dummy', look: null, shape: 'golem' };

export function practiceAtDummy(game) {
  chooseSkill(game, DUMMY, 0);
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
