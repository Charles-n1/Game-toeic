import { secondsPerQuestion } from '../../data/sections';
import { weaknessOf } from '../data/types';
import { pickQuestion, pickSpellQuestion, recordAnswer, monsterCategory } from './learning';
import { speedOf, strikePower, armorOf, criticalChance, gainXp, heal, restoreMana, earnLexis } from './player';
import { TAG_POWER } from './skills';
import { classBonus } from './classes';
import { lootMonster } from './loot';
import { knockOut } from './death';
import { saveGame } from './save';
import { isInStormField } from './powers';
import { floatText } from './particles';

// A fight = questions. A good answer strikes the opponent, a bad one (or no answer in time) lets it strike.
// The opponent is a monster, or a person in a "duel" (negotiating a price, a game, a job): same rules,
// but a duel does not hurt: it is lost after 3 mistakes.
// The TAG of the question answered multiplies the blow: a good answer to a Hard question hits 5 times harder,
// an Extreme one 25 times (see logic/skills.js). Hard monsters ask Hard questions and have 5 times the health.

export const SPELL_MANA = 2; // the cost of a grammar spell
const SPELL_POWER = 15; // the damage of a spell, before its tag, its class and the weakness of the monster
const DUEL_MISTAKES = 3;
const ALLY_DAMAGE = 10; // each friend and each obsidian soldier adds this to a strike
const COMBO_BONUS = 0.1; // each good answer in a row adds 10% to the damage...
const COMBO_MAX = 5; // ...up to +50%
const MIN_DAMAGE = 10;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// How many friends fight with the player (people + obsidian soldiers): each one adds +10 damage.
export function allyCount(player) {
  return player.party.length + player.soldiers;
}

// The damage of one strike before the opponent's resistance: the weapon, the friends, the class.
export function attackPower(game) {
  return strikePower(game.player) + allyCount(game.player) * ALLY_DAMAGE + classBonus(game, 'ally') + classBonus(game, 'attack');
}

// The armor of the hero, with the class.
export function armorPower(game) {
  return armorOf(game.player) + classBonus(game, 'armor');
}

// The seconds to answer a question, in the real exam. A question with a text to read gets more.
function examSeconds(question) {
  const seconds = secondsPerQuestion([question.section]);
  return question.text ? seconds * 1.5 : seconds;
}

// The time to answer, in milliseconds. It depends on both speeds: a monster much faster than the player
// leaves half the time, a much slower one leaves more.
export function timeLimit(game, fight) {
  const player = game.player;
  const speedRatio = clamp(speedOf(player) / fight.opponent.speed, 0.5, 1.6);
  const potion = player.haste ? 1.5 : 1;
  const storm = fight.inStorm ? 1.3 : 1;
  const relaxed = game.run.relaxed ? 1.5 : 1; // the relaxed mode of the options
  const samurai = 1 + classBonus(game, 'time') / 100;
  return examSeconds(fight.question) * speedRatio * potion * storm * relaxed * samurai * 1000;
}

// Who strikes first? A slow hero with a FAST answer still wins: answering at once doubles their speed.
// used: the part of the time that was used, from 0 (instant) to 1 (last moment).
export function strikesFirst(used, playerSpeed, monsterSpeed) {
  return (1 - used) * 2 * playerSpeed >= monsterSpeed;
}

function askNext(game, fight) {
  const opponent = fight.opponent;
  if (opponent.anyCategory) opponent.category = monsterCategory(game); // the Demon King changes type each time
  const lastText = fight.question ? fight.question.text : null;
  fight.mode = 'strike';
  fight.spellCast = false;
  fight.question = pickQuestion(game, opponent, fight.usedIds, lastText);
  if (opponent.tier === 'demon') opponent.category = fight.question.category; // a demon takes the type of its long text
  fight.usedIds.push(fight.question.id);
  startClock(game, fight);
}

// A new question is on screen: its clock starts.
function startClock(game, fight) {
  fight.hidden = []; // the wrong answers removed by a hint potion
  fight.limit = timeLimit(game, fight);
  fight.startedAt = Date.now();
  fight.phase = 'ask';
}

// The hero casts a spell: it costs mana at once, and the question changes for one of the school of the spell,
// at the tag the hero has reached in it. (One spell per question: it can not be used to skip a question.)
export function castSpell(game, fight, categoryId) {
  if (fight.spellCast || game.player.mana < SPELL_MANA) return;
  game.player.mana -= SPELL_MANA;
  fight.mode = categoryId;
  fight.spellCast = true;
  fight.usedIds = fight.usedIds.filter((id) => id !== fight.question.id); // the skipped question can come back
  fight.question = pickSpellQuestion(game, categoryId, fight.usedIds);
  fight.usedIds.push(fight.question.id);
  startClock(game, fight);
}

export function startFight(game, opponent) {
  const fight = {
    opponent: opponent,
    asked: 0,
    correct: 0,
    usedIds: [],
    mode: 'strike', // 'strike', or the id of a category = its spell
    phase: 'ask', // 'ask' -> 'result' -> 'ask' ... -> 'won' | 'lost' | 'fled'
    inStorm: isInStormField(game),
    last: null, // what happened with the last answer
    question: null,
    combo: 0, // good answers in a row
    bestCombo: 0,
    mistakes: [], // the questions answered wrong (shown at the end, to review them)
  };
  game.run.fight = fight;
  game.run.screen = 'fight';
  askNext(game, fight);
}

// The player tapped "Next" after reading the result.
export function nextRound(game) {
  askNext(game, game.run.fight);
}

// The hit of the player: { damage, critical }. A spell uses the magic resistance, a strike the resistance.
// The tag of the question multiplies everything (Hard x5, Extreme x25).
function playerHit(game, fight) {
  const opponent = fight.opponent;
  const isSpell = fight.mode !== 'strike';
  let power = attackPower(game) + (fight.inStorm ? 10 : 0);
  let blocked = opponent.resistance;
  if (isSpell) {
    power = SPELL_POWER * (1 + classBonus(game, 'spell') / 100);
    if (weaknessOf(opponent.category) === fight.mode) power *= 2;
    blocked = opponent.magicResistance;
  }
  const critical = Math.random() < criticalChance(game.player) + classBonus(game, 'critical') / 100;
  const combo = 1 + COMBO_BONUS * Math.min(COMBO_MAX, fight.combo - 1);
  const tag = TAG_POWER[fight.question.difficulty] || 1;
  const damage = varied(Math.max(MIN_DAMAGE, power * (1 - blocked) * combo) * tag) * (critical ? 2 : 1);
  return { damage: damage, critical: critical };
}

// A hit is never exactly the same: from 90% to 110% of its power. (More fun to watch.)
function varied(damage) {
  return Math.round(damage * (0.9 + Math.random() * 0.2));
}

// The hit of the monster, in HP. Armor stops strikes, not magic. half: the player was only a bit slow.
// The Puppeteer's strings make it softer.
function monsterHit(game, opponent, half) {
  const strike = opponent.attack - armorPower(game);
  const soften = 1 - classBonus(game, 'soften') / 100;
  const damage = varied(Math.max(MIN_DAMAGE, strike, opponent.magicAttack) * soften);
  return half ? Math.ceil(damage / 2) : damage;
}

// The class of the hero after a good blow: some heal (Witch, Paladin, Druid), some steal life (Necromancer).
function classAfterHit(game, damage) {
  const healed = classBonus(game, 'heal') + Math.round((damage * classBonus(game, 'drain')) / 100);
  if (healed > 0) heal(game.player, healed);
}

function phaseAfter(game, fight) {
  if (fight.opponent.health <= 0) return 'won';
  if (fight.opponent.duel) return fight.asked - fight.correct >= DUEL_MISTAKES ? 'lost' : 'result';
  return game.player.health <= 0 ? 'lost' : 'result';
}

// The player answered. index: the tapped answer (null = the time ran out).
export function answer(game, fight, index) {
  const opponent = fight.opponent;
  const question = fight.question;
  const isCorrect = index === question.correct_index;
  const used = clamp((Date.now() - fight.startedAt) / fight.limit, 0, 1);
  const last = { index: index, isCorrect: isCorrect, first: false, damage: 0, critical: false, taken: 0, at: Date.now() };

  fight.asked += 1;
  if (isCorrect) fight.correct += 1;
  countCombo(fight, isCorrect);
  if (!isCorrect) fight.mistakes.push(question);
  recordAnswer(game, question, isCorrect);

  if (isCorrect) {
    const hit = opponent.duel ? { damage: 1, critical: false } : playerHit(game, fight);
    opponent.health -= hit.damage;
    last.damage = hit.damage;
    last.critical = hit.critical;
    last.first = strikesFirst(used, speedOf(game.player), opponent.speed);
    if (!opponent.duel) classAfterHit(game, hit.damage);
    if (!last.first && opponent.health > 0) last.taken = monsterHit(game, opponent, true);
  } else {
    last.taken = monsterHit(game, opponent, false);
  }
  if (opponent.duel) last.taken = 0;
  game.player.health -= last.taken;
  last.mode = fight.mode; // 'strike', or the spell used (for the animation)
  fight.last = last;
  fight.phase = phaseAfter(game, fight);
}

// Good answers in a row make a combo; a mistake breaks it.
function countCombo(fight, isCorrect) {
  fight.combo = isCorrect ? fight.combo + 1 : 0;
  fight.bestCombo = Math.max(fight.bestCombo, fight.combo);
}

// Running away: easier when the player is faster. Failing costs a hit. Nobody runs from a boss or a duel.
export function flee(game, fight) {
  const chance = clamp(0.5 + (speedOf(game.player) - fight.opponent.speed) * 0.04, 0.2, 0.95);
  if (Math.random() < chance) {
    fight.phase = 'fled';
    return;
  }
  const taken = monsterHit(game, fight.opponent, false);
  game.player.health -= taken;
  fight.last = { index: null, isCorrect: false, first: false, damage: 0, critical: false, taken: taken, at: Date.now(), fleeFailed: true };
  fight.phase = game.player.health <= 0 ? 'lost' : 'result';
}

// XP depends on the answers of the fight: 100% correct = all the XP, 50% = half. (+ the Plague Doctor's bonus)
export function xpOfFight(game, fight) {
  if (fight.asked === 0) return 0;
  const bonus = 1 + classBonus(game, 'xp') / 100;
  return Math.round(((fight.opponent.xp * fight.correct) / fight.asked) * bonus);
}

function winBattle(game, fight) {
  const xp = xpOfFight(game, fight);
  lootMonster(game, fight.opponent);
  earnLexis(game, Math.round((fight.opponent.lexis * classBonus(game, 'lexis')) / 100)); // the Brigand's share
  restoreMana(game.player, classBonus(game, 'mana'));
  floatText(game, game.player.x, game.player.y, '+' + xp + ' XP', '#7CFC9A');
  gainXp(game, xp);
}

// What lasts "for a fight" is used up.
function useUpBoosts(player) {
  player.haste = false;
  player.stoneSkin = false;
  if (player.obsidianBlade > 0) player.obsidianBlade -= 1;
}

// The player tapped "Continue" on the last screen of the fight: back to the map, with the consequences.
export function endFight(game) {
  const fight = game.run.fight;
  const opponent = fight.opponent;
  game.run.fight = null;
  game.run.screen = 'play';
  game.run.safeUntil = Date.now() + 2500; // a short moment where no monster can start a new fight
  useUpBoosts(game.player);

  if (opponent.duel) {
    if (fight.phase === 'won') opponent.onWin(fight);
    else opponent.onLose(fight);
  } else if (fight.phase === 'won') {
    winBattle(game, fight);
  } else if (fight.phase === 'lost') {
    knockOut(game);
  }
  if (game.run.screen !== 'over') saveGame(game); // after each fight (not after a real death: the save is gone)
}
