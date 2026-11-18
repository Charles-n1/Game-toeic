import { secondsPerQuestion } from '../../data/sections';
import { pickRandom } from '../../logic/random';
import { ITEMS } from '../data/items';
import { GEAR_ITEMS } from '../data/items/gear';
import { weaknessOf } from '../data/types';
import { pickQuestion, pickSpellQuestion, recordAnswer, monsterCategory } from './learning';
import { maxHealth, speedOf, strikePower, armorOf, spellPowerBonus, criticalChance, gainXp, heal, restoreMana, earnLexis, addItem } from './player';
import { TAG_POWER, spellLevel } from './skills';
import { classBonus } from './classes';
import { lootMonster } from './loot';
import { knockOut } from './death';
import { saveGame } from './save';
import { isInStormField, gainObsidianXp, SOLDIER_MAX_HP } from './powers';
import { floatText, bloodSplatter } from './particles';
import { notify } from './messages';
import { finalizeLinkTests } from './statLinks';
import { fatigueMultiplier, addCompanionFatigue } from './camp';
import { companionAttackBonus, companionStatBonuses, companionSpecialMove, recordCompanionCombat } from './bonds/training';
import { onFightEndWar } from './war';
import { onFightEndSociety } from './society';
import { onFightEndParties } from './worldParties';
import { onFightEndAnimals } from './animalFight';
import { callTheKingByName } from './isekai/lostHero';
import { wearGear } from './durability';
import { encumbranceStatus } from './weight';
import { standingParty, companionRoleOf, damageCompanion, healCompanion } from './guild/ranks';
import { companionRank } from './bonds/training';
import { soldierUnitMaxHp } from './obsidian';
import { gainLanguage } from './languages';
import { skillTreeBonuses, weaponMasteryInfo, trainWeaponMastery, triggerManaExhaustion, checkAchievements } from './isekaiTodo/progression';
import { activeSpiritPassives, addSpiritXp } from './isekaiTodo/magicPlus';
import { activeTamedBonus, gainTamedXp, offerTameIfEligible, onEmissaryDefeated } from './isekaiTodo/monstersPlus';
import { onTowerFloorWon, onSecretFloorWon, applyRaidOrderOnAnswer } from './isekaiTodo/dungeonsPlus';
import { companionUltimateBonus, unlockGallery, recordWeeklyStat } from './isekaiTodo/socialPlus';
import { ensureRealism } from './realism/state';
import { onMonsterHitBody, moraleStatBonuses, bodyPhysicalAttackMultiplier } from './realism/bodyHealth';
import { qualityFactorOf, recordWeaponVictory, trackEcosystemKill } from './realism/foodAndNature';
import {
  onManaSpentRealism,
  silentCastTimeBonus,
  magicDamageContextMultiplier,
  stepSpellOverheat,
  activeCircleDefenseScale,
  consumeFightStartEnv,
  fightEnvironmentMods,
  harvestKillRealism,
  promoteNemesisOnDefeat,
  checkRosetteSecondChance,
} from './realism/magicPhysics';
import { activeTitleBonus, currentFormation, activeShrineBlessing } from './realism/socialAndCodex';

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

// How many standing companions fight directly beside the hero.
export function allyCount(player, game = null) {
  if (game) return standingParty(game).length;
  return player.party.length;
}

// The damage of one strike before the opponent's resistance: the weapon, the friends, companions, tamed pet, spirits & tree.
export function attackPower(game) {
  const comp = companionStatBonuses(game);
  const compDamage = Math.round((companionAttackBonus(game) + comp.attack) * fatigueMultiplier(game));
  const petAtk = activeTamedBonus(game).attack || 0;
  const partyMult = 1 + (skillTreeBonuses(game).partyAtk || 0) / 100;
  const allyBonus = Math.round((allyCount(game.player, game) * ALLY_DAMAGE + compDamage + petAtk) * partyMult);
  const baseAtk = strikePower(game.player, game) + allyBonus + classBonus(game, 'ally') + classBonus(game, 'attack');
  if (!game?.realism) return baseAtk;
  const r = ensureRealism(game);
  const wQuality = qualityFactorOf(game, 'weapon');
  const honed = r.health?.sharpenedDay === game.day ? 1.05 : 1.0;
  const titleAtk = 1 + (activeTitleBonus(game).atkPct || 0);
  const shrineAtk = activeShrineBlessing(game)?.id === 'steel' ? 1.15 : 1.0;
  return Math.max(2, Math.round(baseAtk * wQuality * honed * titleAtk * shrineAtk));
}

// The armor of the hero, with the class, spirits, tamed pet, and companion defense buffs.
export function armorPower(game) {
  const comp = companionStatBonuses(game);
  const extra = (activeTamedBonus(game).defense || 0) + (activeSpiritPassives(game).armor || 0) + (companionUltimateBonus(game).defense || 0);
  const baseDef = armorOf(game.player, game) + extra + classBonus(game, 'armor') + Math.round(comp.defense * fatigueMultiplier(game));
  if (!game?.realism) return baseDef;
  const aQuality = qualityFactorOf(game, 'armor');
  const formDef = 1 + (currentFormation(game).defMod || 0);
  const titleDef = 1 + (activeTitleBonus(game).defPct || 0);
  const shrineDef = activeShrineBlessing(game)?.id === 'steel' ? 1.15 : 1.0;
  return Math.max(0, Math.round(baseDef * aQuality * formDef * titleDef * shrineDef));
}

// The seconds to answer a question, in the real exam. A question with a text to read gets more.
function examSeconds(question) {
  const sec = ['rc10', 'rc8', 'text'].includes(question.section) ? question.section : 'text';
  const seconds = secondsPerQuestion([sec]);
  return question.text ? seconds * 1.5 : seconds;
}

// The time to answer, in milliseconds. It depends on both speeds: a monster much faster than the player
// leaves half the time, a much slower one leaves more.
export function timeLimit(game, fight) {
  const player = game.player;
  const heroSpeed = speedOf(player, game) + Math.round(companionStatBonuses(game).speed * fatigueMultiplier(game)) + (activeSpiritPassives(game).speed || 0);
  const speedRatio = clamp(heroSpeed / fight.opponent.speed, 0.5, 1.6);
  const potion = player.haste ? 1.5 : 1;
  const storm = fight.inStorm ? 1.3 : 1;
  const relaxed = game.run.relaxed ? 1.5 : 1; // the relaxed mode of the options
  const samurai = 1 + classBonus(game, 'time') / 100;
  const treeTime = 1 + (skillTreeBonuses(game).timePct || 0) / 100;
  const encTime = encumbranceStatus(game).timeMult;
  let realTime = 1;
  let bonusMs = 0;
  if (game?.realism) {
    const env = fightEnvironmentMods(game, fight);
    const castTime = fight.mode !== 'strike' ? silentCastTimeBonus(game, fight.mode) : 1;
    const titleTime = 1 + (activeTitleBonus(game).timePct || 0);
    const shrineTime = activeShrineBlessing(game)?.id === 'scholar' ? 1.18 : 1;
    realTime = env.timeMult * castTime * titleTime * shrineTime;
    bonusMs = (moraleStatBonuses(game).wellRestedSec || 0) * 1000;
  }
  return examSeconds(fight.question) * speedRatio * potion * storm * relaxed * samurai * treeTime * encTime * realTime * 1000 + bonusMs;
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
  if (game?.realism) onManaSpentRealism(game, SPELL_MANA, Math.max(5, game.player.level + 4), categoryId);
  if (game.player.mana <= 0 && !fight.opponent?.boss && !fight.opponent?.duel) fight.manaExhausted = true;
  fight.mode = categoryId;
  fight.spellCast = true;
  fight.usedIds = fight.usedIds.filter((id) => id !== fight.question.id); // the skipped question can come back
  fight.question = pickSpellQuestion(game, categoryId, fight.usedIds);
  fight.usedIds.push(fight.question.id);
  startClock(game, fight);
}

// opponent: who the hero fights. others: the monsters fighting with it (a duo or a trio): each one gets a
// question in turn, so a round of a trio is 3 answers. The fight is won when all of them are beaten.
export function startFight(game, opponent, others = []) {
  callTheKingByName(game, opponent); // the Demon King hesitates when the hero knows his true name
  const envStart = game?.realism && !opponent?.duel ? consumeFightStartEnv(game) : { wakeSleepyTurn: false, ambushReady: false };
  const fight = {
    opponent: opponent, // the one the current question targets
    opponents: [opponent, ...others],
    round: 1, // a round = one question for each monster still standing
    asked: 0,
    correct: 0,
    usedIds: [],
    mode: 'strike', // 'strike', or the id of a category = its spell
    phase: 'ask', // 'ask' -> 'result' -> 'ask' ... -> 'won' | 'lost' | 'fled'
    inStorm: isInStormField(game),
    wakeSleepyTurn: envStart.wakeSleepyTurn,
    ambushReady: envStart.ambushReady,
    statuses: { player: {}, opponent: {} },
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

// The player tapped "Next" after reading the result: the next monster standing is targeted.
export function nextRound(game) {
  const fight = game.run.fight;
  nextTarget(fight);
  askNext(game, fight);
}

// The monsters of the fight still standing.
export function standing(fight) {
  return fight.opponents.filter((opponent) => opponent.health > 0);
}

// The next monster standing after the current one (in a duo or a trio). Back to the first one = a new round.
function nextTarget(fight) {
  if (fight.opponents.length === 1) return;
  const start = fight.opponents.indexOf(fight.opponent);
  for (let step = 1; step <= fight.opponents.length; step++) {
    const index = (start + step) % fight.opponents.length;
    if (fight.opponents[index].health > 0) {
      if (index <= start) fight.round += 1;
      fight.opponent = fight.opponents[index];
      return;
    }
  }
}

// The hit of the player: { damage, critical }. A spell uses the magic resistance, a strike the resistance.
// The tag of the question multiplies everything (Hard x5, Extreme x25).
function playerHit(game, fight) {
  const opponent = fight.opponent;
  const isSpell = fight.mode !== 'strike';
  const comp = companionStatBonuses(game);
  const mastery = weaponMasteryInfo(game);
  const ult = companionUltimateBonus(game);
  const moraleBonus = game?.realism ? moraleStatBonuses(game) : { critAdd: 0 };
  const titleBonus = game?.realism ? activeTitleBonus(game) : {};
  const shrine = game?.realism ? activeShrineBlessing(game) : null;
  const extraCrit = (moraleBonus.critAdd || 0) + (titleBonus.critPct || 0) + (shrine?.id === 'fortune' ? 0.06 : 0);
  const critical = Math.random() < criticalChance(game.player, game) + (classBonus(game, 'critical') + comp.critical + mastery.critBonus + (ult.critical || 0)) / 100 + extraCrit;
  const compSpecial = !isSpell && (critical || fight.combo >= 3) ? companionSpecialMove(game) : null;
  const specialName = compSpecial ? compSpecial.name : !isSpell && mastery.specialMove && (critical || fight.combo >= 2) ? mastery.specialMove : null;
  let power = attackPower(game) * (isSpell ? 1 : mastery.dmgMult) + (fight.inStorm ? 10 : 0) + (compSpecial ? Math.round(compSpecial.bonusDamage * fatigueMultiplier(game)) : 0);
  let blocked = opponent.resistance;
  if (game.player.obsidianResonance) {
    power = Math.round(power * 1.25);
    game.player.obsidianResonance = false;
  }
  if (isSpell) {
    const spiritSpell = activeSpiritPassives(game).spell || 0;
    const spellScale = Math.max(0.25, 1 + (classBonus(game, 'spell') + spellPowerBonus(game) + comp.spell + spiritSpell + (ult.spell || 0)) / 100 + (titleBonus.spellPct || 0));
    const ctxMult = game?.realism ? magicDamageContextMultiplier(game, fight.mode) * stepSpellOverheat(game) : 1;
    power = SPELL_POWER * (1 + (spellLevel(game, fight.mode) - 1) * 0.5) * spellScale * ctxMult;
    if (weaknessOf(opponent.category) === fight.mode) power *= 2;
    blocked = opponent.magicResistance;
  } else {
    if (game?.realism) {
      const env = fightEnvironmentMods(game, fight);
      power = power * env.dmgMult * bodyPhysicalAttackMultiplier(game);
      if (fight.ambushReady) fight.ambushReady = false;
    }
    if (game.player.obsidianBlade > 0) blocked = Math.max(0, blocked - 0.2);
  }
  const combo = 1 + COMBO_BONUS * Math.min(COMBO_MAX, fight.combo - 1);
  const tag = TAG_POWER[fight.question.difficulty] || 1;
  const damage = varied(Math.max(MIN_DAMAGE, power * (1 - blocked) * combo) * tag) * (critical ? 2 : 1);
  return { damage: damage, critical: critical, special: specialName };
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
  const raidSoften = game.run.fight?.raidDamageReduction ? 1 - game.run.fight.raidDamageReduction : 1;
  const circleScale = game?.realism ? activeCircleDefenseScale(game) : 1;
  const damage = varied(Math.max(MIN_DAMAGE, strike, opponent.magicAttack) * soften * raidSoften * circleScale);
  return half ? Math.ceil(damage / 2) : damage;
}

// The class & companion effects of the hero after a good blow: some heal (Witch, Paladin, Druid, Lyra, Garrick).
function classAfterHit(game, damage, companionHeal = 0) {
  const healed = classBonus(game, 'heal') + companionHeal + Math.round((damage * classBonus(game, 'drain')) / 100);
  if (healed > 0) heal(game.player, healed, game);
}

function phaseAfter(game, fight) {
  if (standing(fight).length === 0) return 'won';
  if (fight.opponent.duel) return fight.asked - fight.correct >= (fight.opponent.mistakesAllowed || DUEL_MISTAKES) ? 'lost' : 'result';
  return game.player.health <= 0 ? 'lost' : 'result';
}

// Obsidian soldiers stand in front and absorb damage meant for the hero.
function absorbBySoldiers(game, rawTaken) {
  const player = game.player;
  if (rawTaken <= 0 || player.soldiers <= 0) return { heroTaken: rawTaken, soldierTaken: 0 };
  const unitHp = soldierUnitMaxHp(player) || SOLDIER_MAX_HP;
  if (!player.soldierHp || player.soldierHp <= 0) player.soldierHp = player.soldiers * unitHp;
  const absorbed = Math.min(rawTaken, player.soldierHp);
  player.soldierHp -= absorbed;
  const remaining = player.soldierHp > 0 ? Math.ceil(player.soldierHp / unitHp) : 0;
  if (remaining < player.soldiers) {
    player.soldiers = remaining;
    notify(game, '💥 An Obsidian Soldier shattered shielding you!', '#c9a8ff');
  }
  return { heroTaken: rawTaken - absorbed, soldierTaken: absorbed };
}

function applyStatus(bucket, kind, turns, dmg) {
  if (!bucket[kind] || bucket[kind].turns < turns) {
    bucket[kind] = { turns, dmg };
  }
}

function tickStatuses(bucket) {
  let total = 0;
  for (const kind of ['burn', 'poison', 'bleed']) {
    const entry = bucket[kind];
    if (!entry || entry.turns <= 0) continue;
    total += entry.dmg || 0;
    entry.turns -= 1;
    if (entry.turns <= 0) delete bucket[kind];
  }
  return total;
}

function tryEnemyStatus(opponent, bucket) {
  const sp = opponent.species || '';
  if (['spider', 'mushroom'].includes(sp) && Math.random() < 0.28) applyStatus(bucket, 'poison', 2, 5);
  else if (['drake', 'shadowMage', 'demonLich'].includes(sp) && Math.random() < 0.28) applyStatus(bucket, 'burn', 2, 6);
  else if (['wolf', 'bear', 'boar', 'bison'].includes(sp) && Math.random() < 0.25) applyStatus(bucket, 'bleed', 2, 5);
}

function absorbByCompanions(game, rawHeroTaken) {
  if (rawHeroTaken < 8) return { heroTaken: rawHeroTaken, taken: 0, defender: null };
  const party = standingParty(game);
  if (party.length === 0) return { heroTaken: rawHeroTaken, taken: 0, defender: null };
  const tank = party.find((id) => companionRoleOf(id) === 'tank');
  const defenderId = tank || party[0];
  const share = tank ? 0.35 : 0.2;
  const absorbed = Math.max(1, Math.round(rawHeroTaken * share));
  damageCompanion(game, defenderId, absorbed);
  return { heroTaken: rawHeroTaken - absorbed, taken: absorbed, defender: defenderId };
}

// The player answered. index: the tapped answer (null = the time ran out).
export function answer(game, fight, index) {
  const opponent = fight.opponent;
  const question = fight.question;
  if (!fight.statuses) fight.statuses = { player: {}, opponent: {} };
  const isCorrect = index === question.correct_index;
  const used = clamp((Date.now() - fight.startedAt) / fight.limit, 0, 1);
  const last = {
    index: index,
    isCorrect: isCorrect,
    first: false,
    damage: 0,
    soldierDamage: 0,
    soldierTaken: 0,
    companionTaken: 0,
    companionHeal: 0,
    dotDamage: 0,
    critical: false,
    taken: 0,
    at: Date.now(),
  };

  fight.asked += 1;
  if (isCorrect) fight.correct += 1;
  countCombo(fight, isCorrect);
  if (!isCorrect) fight.mistakes.push(question);
  recordAnswer(game, question, isCorrect);
  const answerMs = Math.max(100, Date.now() - fight.startedAt);
  recordWeeklyStat(game, { isCorrect, answerMs });
  if (isCorrect && answerMs <= 3000) checkAchievements(game, { fastAnswerMs: answerMs });

  if (isCorrect) {
    const hit = opponent.duel ? { damage: 1, critical: false } : playerHit(game, fight);
    opponent.health -= hit.damage;
    last.damage = hit.damage;
    last.critical = hit.critical;
    last.special = hit.special || null;
    if (!opponent.duel) trainWeaponMastery(game, 5);
    if (opponent.isGroupRaid) {
      const order = applyRaidOrderOnAnswer(game, fight, true, used);
      if (order.extraDmg > 0) {
        opponent.health -= order.extraDmg;
        last.damage += order.extraDmg;
      }
      if (order.healedHp > 0) last.companionHeal += order.healedHp;
      if (order.orderName) last.special = order.orderName;
    }
    const heroSpeed = speedOf(game.player, game) + companionStatBonuses(game).speed;
    last.first = strikesFirst(used, heroSpeed, opponent.speed);
    if (!opponent.duel) {
      wearGear(game, 'weapon', 2);
      const healer = standingParty(game).find((id) => companionRoleOf(id) === 'healer');
      if (healer && game.player.health < maxHealth(game.player, game)) {
        const hAmt = 6 + companionRank(game, healer) * 2;
        heal(game.player, hAmt, game);
        healCompanion(game, healer, Math.round(hAmt * 0.5));
        last.companionHeal = hAmt;
      }
      classAfterHit(game, hit.damage, companionStatBonuses(game).heal);
      gainLanguage(game, 'runes', 1, true);
      if (ITEMS[game.player.weapon]?.status === 'bleed' && Math.random() < 0.45) {
        applyStatus(fight.statuses.opponent, 'bleed', 3, Math.max(4, Math.round(hit.damage * 0.12)));
      }
      if (game.player.obsidianBlade > 0 && Math.random() < 0.45) {
        applyStatus(fight.statuses.opponent, 'bleed', 3, Math.max(6, Math.round(hit.damage * 0.15)));
      }
      if (!last.special && standingParty(game).includes('lea') && (hit.critical || fight.combo >= 3)) {
        last.special = 'Holy Sword';
        opponent.health -= 8;
        last.damage += 8;
      }
      if (fight.mode !== 'strike' && Math.random() < 0.35) {
        applyStatus(fight.statuses.opponent, 'burn', 2, Math.max(5, Math.round(hit.damage * 0.14)));
      }
      if (hit.critical && Math.random() < 0.3) {
        applyStatus(fight.statuses.opponent, 'stun', 1, 0);
      }
    }
  }
  // Obsidian soldiers attack every turn automatically when fighting monsters (2+ form a Shield Wall)!
  if (!opponent.duel && game.player.soldiers > 0 && opponent.health > 0) {
    const tag = TAG_POWER[question.difficulty] || 1;
    const wallBonus = game.player.soldiers >= 2 ? 1.25 : 1;
    const sDmg = Math.max(4, Math.round(game.player.soldiers * 12 * wallBonus * tag * (1 - (opponent.resistance || 0))));
    opponent.health -= sDmg;
    last.soldierDamage = sDmg;
  }
  if (!opponent.duel && opponent.health > 0) {
    const dot = tickStatuses(fight.statuses.opponent);
    if (dot > 0) {
      opponent.health -= dot;
      last.dotDamage = dot;
    }
  }
  const oppStun = fight.statuses.opponent.stun;
  const oppStunned = oppStun && oppStun.turns > 0;
  if (oppStunned) {
    oppStun.turns -= 1;
    if (oppStun.turns <= 0) delete fight.statuses.opponent.stun;
    last.stunned = true;
  }
  if (!opponent.duel && opponent.health > 0 && !oppStunned && (!isCorrect || !last.first)) {
    const rawTaken = monsterHit(game, opponent, isCorrect);
    const guard = absorbBySoldiers(game, rawTaken);
    const compGuard = absorbByCompanions(game, guard.heroTaken);
    last.taken = compGuard.heroTaken;
    last.soldierTaken = guard.soldierTaken;
    last.companionTaken = compGuard.taken;
    if (guard.heroTaken > 0) wearGear(game, 'armor', 2);
    if (compGuard.heroTaken > 0) {
      tryEnemyStatus(opponent, fight.statuses.player);
      if (game?.realism) onMonsterHitBody(game, opponent, compGuard.heroTaken, compGuard.heroTaken >= Math.max(15, (opponent.attack || 10) * 1.15));
    }
  }
  if (!opponent.duel && opponent.health > 0) {
    const selfDot = tickStatuses(fight.statuses.player);
    if (selfDot > 0) {
      last.taken += selfDot;
      last.statusTaken = selfDot;
    }
  }
  game.player.health -= last.taken;
  if (!opponent.duel && game?.realism && ensureRealism(game).combatRealism.activeCircle === 'regen' && game.player.health > 0) {
    heal(game.player, 4, game);
    restoreMana(game.player, 1);
  }
  if (!opponent.duel && game.player.health <= 0 && game?.realism) {
    checkRosetteSecondChance(game);
  }
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
  const fastest = Math.max(...standing(fight).map((opponent) => opponent.speed));
  const chance = clamp(0.5 + (speedOf(game.player, game) - fastest) * 0.04, 0.2, 0.95);
  wearGear(game, 'boots', 2);
  if (Math.random() < chance) {
    fight.phase = 'fled';
    return;
  }
  const rawTaken = monsterHit(game, fight.opponent, false);
  const guard = absorbBySoldiers(game, rawTaken);
  game.player.health -= guard.heroTaken;
  if (game.player.health <= 0 && game?.realism) checkRosetteSecondChance(game);
  fight.last = { index: null, isCorrect: false, first: false, damage: 0, soldierDamage: 0, soldierTaken: guard.soldierTaken, critical: false, taken: guard.heroTaken, at: Date.now(), fleeFailed: true };
  fight.phase = game.player.health <= 0 ? 'lost' : 'result';
}

// XP depends on the answers of the fight: 100% correct = all the XP, 50% = half. (+ the Plague Doctor's bonus)
export function xpOfFight(game, fight) {
  if (fight.asked === 0) return 0;
  const bonus = 1 + (classBonus(game, 'xp') + companionStatBonuses(game).xp + (skillTreeBonuses(game).xpPct || 0) + (companionUltimateBonus(game).xp || 0)) / 100;
  let realXp = 1;
  if (game?.realism) {
    const r = ensureRealism(game);
    const mXp = moraleStatBonuses(game).xpMult || 1;
    const tXp = 1 + (activeTitleBonus(game).xpPct || 0);
    const studyXp = r.workstations?.studyBuffDay === game.day ? 1.15 : 1;
    const shrineXp = activeShrineBlessing(game)?.id === 'scholar' ? 1.15 : 1;
    realXp = mXp * tXp * studyXp * shrineXp;
  }
  return Math.round(((totalOf(fight, 'xp') * fight.correct) / fight.asked) * bonus * realXp);
}

// The XP or the Lexis of all the monsters of the fight together.
export function totalOf(fight, key) {
  return fight.opponents.reduce((total, opponent) => total + (opponent[key] || 0), 0);
}

function maybeDropGear(game, opponent) {
  const maxVal = opponent.boss ? Infinity : opponent.tier === 'demon' || opponent.tag === 'extreme' ? Infinity : opponent.tag === 'hard' || opponent.tier === 'big' ? 450 : 180;
  const gearKeys = Object.keys(GEAR_ITEMS).filter((id) => (GEAR_ITEMS[id].price || 0) <= maxVal);
  if (gearKeys.length === 0) return;
  const chance = opponent.boss ? 0.75 : opponent.tag && opponent.tag !== 'normal' ? 0.35 : 0.16;
  if (Math.random() >= chance) return;
  const unowned = gearKeys.filter((id) => !game.player.bag[id] && game.player[ITEMS[id].kind] !== id);
  const pool = unowned.length > 0 ? unowned : gearKeys;
  const id = pickRandom(pool);
  addItem(game.player, id, 1);
  notify(game, '✨ Rare gear drop: ' + ITEMS[id].name + '!', '#ffd23f');
}

function winBattle(game, fight) {
  const xp = xpOfFight(game, fight);
  const compLexis = companionStatBonuses(game).lexis;
  const treeLexis = skillTreeBonuses(game).lexisPct || 0;
  const shrineLexis = game?.realism && activeShrineBlessing(game)?.id === 'fortune' ? 25 : 0;
  const titleLoot = game?.realism ? Math.round((activeTitleBonus(game).lootPct || 0) * 100) : 0;
  fight.opponents.forEach((opponent) => lootMonster(game, opponent));
  earnLexis(game, Math.round((totalOf(fight, 'lexis') * (classBonus(game, 'lexis') + compLexis + treeLexis + shrineLexis + titleLoot)) / 100)); // the Brigand's, tree & companion share
  restoreMana(game.player, classBonus(game, 'mana'), game);
  recordCompanionCombat(game);
  gainObsidianXp(game, fight.opponent.boss ? 3 : fight.opponents.length);
  addSpiritXp(game, fight.opponent.boss ? 12 : 5);
  gainTamedXp(game, fight.opponent.boss ? 10 : 5);
  addCompanionFatigue(game, fight.opponent.boss ? 12 : 6);
  maybeDropGear(game, fight.opponent);
  unlockGallery(game, 'firstWin');
  const cleanWin = !fight.usedPotion && fight.mistakes.length === 0;
  recordWeeklyStat(game, { kills: fight.opponents.length, cleanWin });
  if (game?.realism) {
    recordWeaponVictory(game);
    for (const opp of fight.opponents) {
      harvestKillRealism(game, opp, cleanWin);
      trackEcosystemKill(game, opp.species);
    }
  }
  floatText(game, game.player.x, game.player.y, '+' + xp + ' XP', '#7CFC9A');
  bloodSplatter(game, game.player.x + 1.1, game.player.y + 0.15, fight.opponents.length > 1 ? 16 : 11);
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
  finalizeLinkTests(game);

  if (opponent.duel) {
    if (fight.phase === 'won') opponent.onWin(fight);
    else opponent.onLose(fight);
  } else if (fight.phase === 'won') {
    winBattle(game, fight);
    if (opponent.towerFloor) onTowerFloorWon(game, opponent.towerFloor);
    else if (opponent.secretDungeonId) onSecretFloorWon(game, opponent.secretDungeonId);
    else if (opponent.emissaryId) onEmissaryDefeated(game, opponent.emissaryId);
    else offerTameIfEligible(game, fight);
  } else if (fight.phase === 'lost') {
    if (game?.realism) promoteNemesisOnDefeat(game, opponent);
    knockOut(game);
  }
  onFightEndWar(game, fight);
  onFightEndSociety(game, fight);
  onFightEndParties(game, fight);
  onFightEndAnimals(game, fight);
  if (fight.manaExhausted && game.run.screen !== 'over') triggerManaExhaustion(game);
  checkAchievements(game, { flawlessFight: fight.phase === 'won' && !opponent.duel && fight.mistakes.length === 0 });
  if (game.run.screen !== 'over') saveGame(game); // after each fight (not after a real death: the save is gone)
}
