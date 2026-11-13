import { secondsPerQuestion } from '../../data/sections';
import { weaknessOf } from '../data/types';
import { pickQuestion, recordAnswer, monsterCategory, spellRank } from './learning';
import { speedOf, strikePower, armorOf, criticalChance, gainXp } from './player';
import { lootMonster } from './loot';
import { knockOut } from './death';
import { isInStormField } from './powers';
import { floatText } from './particles';

// A fight = questions. A good answer strikes the opponent, a bad one (or no answer in time) lets it strike.
// The opponent is a monster, or a person in a "duel" (negotiating a price, a game, a job): same rules,
// but a duel does not hurt: it is lost after 3 mistakes.

export const SPELL_MANA = 2; // the cost of a grammar spell
const DUEL_MISTAKES = 3;
const ALLY_DAMAGE = 10; // each friend and each obsidian soldier adds this to a strike
const MIN_DAMAGE = 10;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// How many friends fight with the player (people + obsidian soldiers): each one adds +10 damage.
export function allyCount(player) {
  return player.party.length + player.soldiers;
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
  return examSeconds(fight.question) * speedRatio * potion * storm * 1000;
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
  fight.question = pickQuestion(game, opponent, fight.usedIds, lastText);
  if (opponent.tier === 'demon') opponent.category = fight.question.category; // a demon takes the type of its long text
  fight.usedIds.push(fight.question.id);
  fight.limit = timeLimit(game, fight);
  fight.startedAt = Date.now();
  fight.phase = 'ask';
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
function playerHit(game, fight) {
  const player = game.player;
  const opponent = fight.opponent;
  const isSpell = fight.mode !== 'strike';
  let power = strikePower(player) + allyCount(player) * ALLY_DAMAGE + (fight.inStorm ? 10 : 0);
  let blocked = opponent.resistance;
  if (isSpell) {
    power = 10 * (1 + spellRank(game, fight.mode));
    if (weaknessOf(opponent.category) === fight.mode) power *= 2;
    blocked = opponent.magicResistance;
  }
  const critical = Math.random() < criticalChance(player);
  const damage = varied(Math.max(MIN_DAMAGE, power * (1 - blocked))) * (critical ? 2 : 1);
  return { damage: damage, critical: critical };
}

// A hit is never exactly the same: from 90% to 110% of its power. (More fun to watch.)
function varied(damage) {
  return Math.round(damage * (0.9 + Math.random() * 0.2));
}

// The hit of the monster, in HP. Armor stops strikes, not magic. half: the player was only a bit slow.
function monsterHit(game, opponent, half) {
  const strike = opponent.attack - armorOf(game.player);
  const damage = varied(Math.max(MIN_DAMAGE, strike, opponent.magicAttack));
  return half ? Math.ceil(damage / 2) : damage;
}

function payForSpell(game, fight) {
  if (fight.mode !== 'strike') game.player.mana -= SPELL_MANA;
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
  recordAnswer(game, question, isCorrect);
  payForSpell(game, fight);

  if (isCorrect) {
    const hit = opponent.duel ? { damage: 1, critical: false } : playerHit(game, fight);
    opponent.health -= hit.damage;
    last.damage = hit.damage;
    last.critical = hit.critical;
    last.first = strikesFirst(used, speedOf(game.player), opponent.speed);
    if (!last.first && opponent.health > 0) last.taken = monsterHit(game, opponent, true);
  } else {
    last.taken = monsterHit(game, opponent, false);
  }
  if (opponent.duel) last.taken = 0;
  game.player.health -= last.taken;
  last.mode = fight.mode; // 'strike', or the spell used (for the animation)
  fight.last = last;
  fight.mode = 'strike';
  fight.phase = phaseAfter(game, fight);
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

// XP depends on the answers of the fight: 100% correct = all the XP, 50% = half.
export function xpOfFight(fight) {
  if (fight.asked === 0) return 0;
  return Math.round((fight.opponent.xp * fight.correct) / fight.asked);
}

function winBattle(game, fight) {
  const xp = xpOfFight(fight);
  lootMonster(game, fight.opponent);
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
}
