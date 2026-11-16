import { CLASSES, CLASS_RANKS, classOf, classOfMaster } from '../data/classes';
import { typeOf } from '../data/types';
import { TAGS, tagOf, tagAnswers, tagPercent } from './skills';
import { say, notify } from './messages';
import { emote } from './emotes';

// The class of the hero (game.player.classId, null = none). See data/classes.js.

const TRAINED_ANSWERS = 10; // a skill is "trained" for a class after 10 Normal answers...
const TRAINED_PERCENT = 60; // ...with at least 60% of good answers
const STUDENT_FRIENDSHIP = 20; // a master only teaches the people they know a bit

// Is this skill trained enough to start a class? (Or already Hard: then it is trained for sure.)
export function isSkillTrained(game, categoryId) {
  if (tagOf(game, categoryId) !== 'normal') return true;
  return tagAnswers(game, categoryId, 'normal') >= TRAINED_ANSWERS && tagPercent(game, categoryId, 'normal') >= TRAINED_PERCENT;
}

export function canLearnClass(game, item) {
  return item.skills.every((id) => isSkillTrained(game, id));
}

// The rank of a class, from 1 (Novice) to 3 (Master): the tag of its weakest skill.
export function rankOfClass(game, item) {
  return Math.min(...item.skills.map((id) => TAGS.indexOf(tagOf(game, id)) + 1));
}

// The class of the hero and its rank: { item, rank, title } (null = no class).
export function heroClass(game) {
  const item = classOf(game.player.classId);
  if (!item) return null;
  const rank = rankOfClass(game, item);
  return { item: item, rank: rank, title: CLASS_RANKS[rank] + ' ' + item.name };
}

// What the class of the hero gives for one kind of bonus (0 = nothing). See the list in data/classes.js.
export function classBonus(game, key) {
  const current = heroClass(game);
  if (!current) return 0;
  return (current.item.bonus[key] || 0) * current.rank;
}

// "Tenses 6/10 answers, 50%": what the hero still has to train for a class.
function missingTraining(game, item) {
  return item.skills
    .filter((id) => !isSkillTrained(game, id))
    .map((id) => typeOf(id).short + ' ' + tagAnswers(game, id, 'normal') + '/' + TRAINED_ANSWERS + ' answers, ' + tagPercent(game, id, 'normal') + '%');
}

function becomeStudent(game, npc, item) {
  game.player.classId = item.id;
  emote(game, npc.id, 'sparkle');
  notify(game, '🎓 You are now a ' + heroClass(game).title + '!', '#ffd23f');
  say(game, npc.id, ['Then listen well. ' + item.text, 'Your class grows with ' + typeOf(item.skills[0]).short + ' and ' + typeOf(item.skills[1]).short + '. When both evolve, so will you.']);
}

// The choice of the talk menu with a master: learn their class.
export function classChoice(game, npc) {
  const item = classOfMaster(npc.id);
  if (!item || game.player.classId === item.id) return null;
  function ask() {
    if (game.npcs[npc.id].friendship < STUDENT_FRIENDSHIP) {
      say(game, npc.id, ['Teach you? I do not even know you. Talk to me, help me... then ask again.']);
    } else if (!canLearnClass(game, item)) {
      say(game, npc.id, ['The ' + item.name + ' walks on two legs: ' + typeOf(item.skills[0]).name + ' and ' + typeOf(item.skills[1]).name + '.', 'Train them first: ' + missingTraining(game, item).join(' · ') + '. The Arcane School can help.']);
    } else {
      say(game, npc.id, ['You trained well. Do you want to walk the way of the ' + item.name + '? ' + item.text], [
        { label: 'Become a ' + item.name, run: () => becomeStudent(game, npc, item) },
        { label: 'Not now', run: () => {} },
      ]);
    }
  }
  return { label: 'Learn the class: ' + item.name, icon: 'powers', run: ask };
}

export { CLASSES };
