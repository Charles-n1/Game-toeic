import { WILD_STRUCTURES } from '../data/zones';
import { ITEMS } from '../data/items';
import { addItem, earnLexis, gainXp, heal, restoreMana, maxMana } from './player';
import { notify, say } from './messages';
import { burst, floatText, bloodHit, bloodSplatter } from './particles';
import { cue } from './cues';
import { cureCold } from './weather';
import { passHours } from './days';
import { ensureRunWar, spawnWarEffect, placeNearSpot } from './war/state';
import { BANDIT_CLANS } from '../data/kingdoms';
import { makeBanditUnit } from './war/bandits';
import { pickRandom } from '../../logic/random';

// Runtime interactions for Isekai wilderness structures:
// monsterCamp (destroy/clear spawn point), banditTrap (trip/disarm + lure crate), wayCamp (cauldron/rest), isekaiShrine (blessing).

function ensureStructState(game) {
  if (!game.war) game.war = {};
  if (!game.war.disarmedTraps) game.war.disarmedTraps = {};
  if (!game.war.clearedLairs) game.war.clearedLairs = {};
  if (!game.society) game.society = {};
  if (!game.society.shrinesUsed) game.society.shrinesUsed = {};
  if (!game.society.luredCrates) game.society.luredCrates = {};
}

export function isLairCleared(game, lairId) {
  const clearedDay = game.war?.clearedLairs?.[lairId];
  return typeof clearedDay === 'number' && game.day - clearedDay < 2;
}

function structureNear(player, kind, range = 2.4) {
  return WILD_STRUCTURES.find((s) => s.kind === kind && Math.hypot(s.x - player.x, s.y - player.y) < range) || null;
}

function triggerTrapAmbush(game, trapStruct) {
  const runWar = ensureRunWar(game);
  const clan = pickRandom(BANDIT_CLANS);
  const count = trapStruct.danger >= 2 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const angle = (i / Math.max(1, count)) * Math.PI * 2 + 0.6;
    const spot = placeNearSpot(game, trapStruct.x + Math.cos(angle) * 3.5, trapStruct.y + Math.sin(angle) * 3.5, 1, 5);
    const bandit = makeBanditUnit(game, {
      campId: 'ambush',
      clan: clan,
      role: i === 0 ? 'lieutenant' : 'bandit',
      x: spot.x,
      y: spot.y,
      warKind: 'ambush',
    });
    runWar.ambushFoes.push(bandit);
  }
}

// Checks every second if the hero stepped onto an armed bandit trap or spike.
export function updateIsekaiStructures(game) {
  ensureStructState(game);
  const player = game.player;
  for (const s of WILD_STRUCTURES) {
    if (s.kind !== 'banditTrap' || game.war.disarmedTraps[s.id]) continue;
    const traps = [
      { x: s.x - 1, y: s.y + 1 },
      { x: s.x + 1, y: s.y + 1 },
      { x: s.x, y: s.y + 2 },
    ];
    const hit = traps.find((t) => Math.hypot(t.x + 0.5 - player.x, t.y + 0.5 - player.y) < 0.85);
    if (!hit) continue;

    game.war.disarmedTraps[s.id] = true;
    const dmg = Math.min(Math.max(4, Math.round((player.health || 20) * 0.1)), Math.max(1, (player.health || 2) - 1));
    player.health = Math.max(1, Math.round(player.health - dmg));
    cue(game, 'hit');
    bloodHit(game, player.x, player.y, 10);
    spawnWarEffect(game, 'hit', player.x, player.y, '#ff5a6e');
    floatText(game, player.x, player.y - 0.6, 'SNAP! -' + dmg, '#ff5a6e');
    game.run.shakeUntil = Date.now() + 260;
    notify(game, '⚠ You stepped on a Bandit Trap! Bandits leap from cover! (-' + dmg + ' HP)', '#ff6060');
    triggerTrapAmbush(game, s);
    return;
  }
}

function interactTrap(game, s) {
  ensureStructState(game);
  if (!game.war.disarmedTraps[s.id]) {
    game.war.disarmedTraps[s.id] = true;
    cue(game, 'unlock');
    burst(game, s.x, s.y, '#7cfc9a', 14);
    gainXp(game, 15);
    earnLexis(game, 18);
    notify(game, '⚙ Disarmed the Bandit Trap! (+15 XP, +18 Lexis)', '#7cfc9a');
    return;
  }
  if (!game.society.luredCrates[s.id]) {
    game.society.luredCrates[s.id] = true;
    const item = Math.random() < 0.35 ? 'mysteryCrate' : pickRandom(['warRations', 'banditBadge', 'healthPotion']);
    addItem(game.player, item, 1);
    earnLexis(game, 25);
    cue(game, 'chest');
    notify(game, '📦 Looted Bandit Ambush Crate: ' + ITEMS[item].name + ' & 25 Lexis!', '#ffd23f');
    return;
  }
  say(game, null, ['Only sprung iron jaws and an empty crate remain here.']);
}

function interactShrine(game, s) {
  ensureStructState(game);
  if (game.society.shrinesUsed[s.id]) {
    say(game, null, ['The ancient runes hum softly. This sanctuary has already lent you its blessing.']);
    return;
  }
  game.society.shrinesUsed[s.id] = true;
  heal(game.player, 35, game);
  restoreMana(game.player, maxMana(game.player));
  game.player.haste = true;
  cureCold(game);
  gainXp(game, 25);
  cue(game, 'levelUp');
  burst(game, s.x, s.y, s.isPortal ? '#b48cff' : '#5fd3e8', 26);
  notify(
    game,
    s.isPortal ? '✨ Touched the Ruined Summon Gate! (+25 XP, full Mana, Haste!)' : '🙏 Goddess Shrine blessing! (+35 HP, full Mana, Haste!)',
    '#9fd8ff'
  );
}

function interactWayCamp(game, s) {
  ensureStructState(game);
  const chestKey = 'wcamp-' + s.id;
  const choices = [
    {
      label: 'Warm up by the Cauldron (Rest 2h, +20 HP, Cure Cold)',
      icon: 'flame',
      run: () => {
        passHours(game, 2);
        heal(game.player, 20, game);
        cureCold(game);
        cue(game, 'heal');
        notify(game, '🔥 Warmed up at the traveler waycamp (+20 HP).', '#ffd23f');
      },
    },
  ];
  if (!game.society.luredCrates[chestKey]) {
    choices.push({
      label: 'Check Waycamp Supply Sack',
      icon: 'chest',
      run: () => {
        game.society.luredCrates[chestKey] = true;
        const drop = pickRandom(['bread', 'herbStew', 'flint', 'healthPotion']);
        addItem(game.player, drop, 1);
        cue(game, 'chest');
        notify(game, '🎒 Found ' + ITEMS[drop].name + ' left by travelers.', '#7cfc9a');
      },
    });
  }
  choices.push({ label: 'Leave', run: () => {} });
  say(game, null, ['A tidy roadside traveler camp with a simmering stew pot and rolled bedding.'], choices);
}

function interactMonsterCamp(game, s) {
  ensureStructState(game);
  if (isLairCleared(game, s.id)) {
    say(game, null, [s.name + ' is smoldering and cleared. Monsters will not emerge from it for a couple of days.']);
    return;
  }
  const guardians = game.run.monsters.filter((m) => m.homeCampId === s.id && m.health > 0).length;
  say(game, null, [s.name + ': monster tracks radiate outward from these banners.'], [
    {
      label: guardians > 0 ? 'Burn War Banner! (' + guardians + ' nearby monsters)' : 'Burn War Banner & Destroy Lair',
      icon: 'flame',
      run: () => {
        game.war.clearedLairs[s.id] = game.day;
        game.run.monsters.filter((m) => m.homeCampId === s.id).forEach((m) => bloodSplatter(game, m.x, m.y, 8));
        game.run.monsters = game.run.monsters.filter((m) => m.homeCampId !== s.id);
        addItem(game.player, 'warTrophy', 1);
        earnLexis(game, 35);
        gainXp(game, 25);
        cue(game, 'build');
        burst(game, s.x + 2, s.y - 1, '#ff7b3a', 26);
        notify(game, '🔥 Cleared ' + s.name + '! Wild spawns suppressed here. +35 Lexis, +25 XP!', '#7cfc9a');
      },
    },
    { label: 'Leave', run: () => {} },
  ]);
}

// Actions integrated into update.js actionsOf().
export function actionsOfStructures(game) {
  ensureStructState(game);
  const player = game.player;
  const nearTrap = structureNear(player, 'banditTrap', 2.8);
  const nearShrine = structureNear(player, 'isekaiShrine', 2.6);
  const nearWay = structureNear(player, 'wayCamp', 2.6);
  const nearLair = structureNear(player, 'monsterCamp', 3.4);

  return [
    {
      when: () => nearTrap !== null && (!game.war.disarmedTraps[nearTrap.id] || !game.society.luredCrates[nearTrap.id]),
      icon: game.war.disarmedTraps[nearTrap?.id] ? 'chest' : 'dig',
      run: () => interactTrap(game, nearTrap),
    },
    {
      when: () => nearShrine !== null,
      icon: 'star',
      run: () => interactShrine(game, nearShrine),
    },
    {
      when: () => nearWay !== null,
      icon: 'fire',
      run: () => interactWayCamp(game, nearWay),
    },
    {
      when: () => nearLair !== null && !isLairCleared(game, nearLair.id),
      icon: 'flame',
      run: () => interactMonsterCamp(game, nearLair),
    },
  ];
}
