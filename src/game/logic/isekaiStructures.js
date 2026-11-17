import { WILD_STRUCTURES } from '../data/zones';
import { structureNear } from './isekai/common';
import { ITEMS } from '../data/items';
import { addItem, earnLexis, gainXp, heal, restoreMana, maxMana, healFully } from './player';
import { notify, say } from './messages';
import { burst, floatText, bloodHit, bloodSplatter } from './particles';
import { cue } from './cues';
import { cureCold } from './weather';
import { passHours } from './days';
import { BLOCK, BLOCKS } from './explore';
import { ensureRunWar, spawnWarEffect, placeNearSpot } from './war/state';
import { BANDIT_CLANS } from '../data/kingdoms';
import { makeBanditUnit } from './war/bandits';
import { addBoost } from './boosts';
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
  if (s.isPortal && game.bosses && game.bosses.king) {
    say(game, null, [
      'The Ruined Summon Gate blazes with warm gold light. With Solecis freed from the Silence, the path between Earth and Lexia stands open!',
    ], [
      {
        label: 'Step through: Return to Earth & pass your TOEIC',
        icon: 'star',
        run: () => {
          game.flags.returnedHome = true;
          game.ended = true;
          cue(game, 'victory');
          say(game, null, [
            'Light wraps around your shoulders. You step across the threshold—and wake just before the crosswalk, clutching your exam ticket with new confidence.',
            'Thank you for saving Lexia, Hero of Words. (You can keep exploring this save anytime.)',
          ]);
        },
      },
      {
        label: 'Stay in Lexia — this world is home now',
        icon: 'heart',
        run: () => {
          game.flags.stayedInLexia = true;
          notify(game, '✨ You chose to remain in Lexia!', '#ffd23f');
        },
      },
      { label: 'Step back', run: () => {} },
    ]);
    return;
  }
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

function revealSurroundingArea(game, cx, cy, radius = 5) {
  if (typeof game.explored !== 'string') return;
  const bx = Math.floor(cx / BLOCK);
  const by = Math.floor(cy / BLOCK);
  const cells = [...game.explored];
  for (let y = by - radius; y <= by + radius; y++) {
    for (let x = bx - radius; x <= bx + radius; x++) {
      if (x >= 0 && y >= 0 && x < BLOCKS && y < BLOCKS) cells[y * BLOCKS + x] = '1';
    }
  }
  game.explored = cells.join('');
}

const LORE_NOTES = [
  '“Before the Silence fell, scholars sealed power inside spoken verbs.”',
  '“Follow coastal beacons when lost — smugglers drop relics near the waves.”',
  '“Active voice strikes fast, yet passive clauses guard kings in ruined halls.”',
  '“Clear monster warposts in wilderness clearings to keep trade caravans safe.”',
  '“Blossom shrines and ancient lakes restore body, mind, and frozen spirits.”',
];

function interactWorldStructure(game, s) {
  ensureStructState(game);
  const actType = s.action;
  if (actType === 'shrine') return interactShrine(game, s);
  if (actType === 'wayCamp') return interactWayCamp(game, s);

  const used = Boolean(game.society.shrinesUsed[s.id]);
  if (actType === 'buy') {
    say(game, null, [s.name + ': ' + s.text], [
      {
        label: 'Buy War Rations (16 Lexis)',
        icon: 'warRations',
        run: () => {
          if (game.player.lexis < 16) return notify(game, 'Need 16 Lexis.', '#ff8a95');
          game.player.lexis -= 16;
          addItem(game.player, 'warRations', 1);
          cue(game, 'trade');
          notify(game, '🛒 Purchased War Rations!', '#7cfc9a');
        },
      },
      {
        label: 'Buy Health Potion (14 Lexis)',
        icon: 'healthPotion',
        run: () => {
          if (game.player.lexis < 14) return notify(game, 'Need 14 Lexis.', '#ff8a95');
          game.player.lexis -= 14;
          addItem(game.player, 'healthPotion', 1);
          cue(game, 'trade');
          notify(game, '🧪 Purchased Health Potion!', '#7cfc9a');
        },
      },
      { label: 'Leave', run: () => {} },
    ]);
    return;
  }

  if (actType === 'rest') {
    passHours(game, 2);
    heal(game.player, 25, game);
    cureCold(game);
    cue(game, 'heal');
    notify(game, '🏮 Rested by ' + s.name + ' (+25 HP, warmed up!).', '#ffd23f');
    return;
  }

  if (used) {
    say(game, null, [s.name + ': ' + s.text + ' (Its blessing or gift has already been claimed.)']);
    return;
  }

  game.society.shrinesUsed[s.id] = true;
  if (actType === 'mana') {
    restoreMana(game.player, maxMana(game.player));
    addBoost(game, 'spell', 8, null, 'struct-' + s.id);
    cue(game, 'blessing');
    burst(game, s.x, s.y, '#5fd3e8', 22);
    notify(game, '✨ ' + s.name + ' surges with magic! (Full Mana & +8 Spell Power!)', '#8fd6ff');
  } else if (actType === 'heal') {
    healFully(game.player, game);
    game.player.thirst = Math.min(100, (game.player.thirst || 0) + 40);
    cureCold(game);
    cue(game, 'heal');
    burst(game, s.x, s.y, '#ffadd0', 22);
    notify(game, '🌸 ' + s.name + ' restores full HP & Mana!', '#7cfc9a');
  } else if (actType === 'wish') {
    const gift = pickRandom(['gem', 'oldCoin', 'mysteryCrate', 'goldenChalice']);
    addItem(game.player, gift, 1);
    earnLexis(game, 25);
    gainXp(game, 20);
    cue(game, 'victory');
    burst(game, s.x, s.y, '#ffd23f', 22);
    notify(game, '🌟 Your wish at ' + s.name + ' grants ' + ITEMS[gift].name + ' & +25 Lexis!', '#ffd23f');
  } else if (actType === 'reveal') {
    revealSurroundingArea(game, s.x, s.y, 6);
    gainXp(game, 25);
    cue(game, 'blessing');
    burst(game, s.x, s.y, '#ffe066', 24);
    notify(game, '🔭 Surveyed the horizon from ' + s.name + '! Wide map region revealed (+25 XP).', '#9fd8ff');
  } else if (actType === 'gather') {
    const item = s.rewardItem || 'crystal';
    addItem(game.player, item, item === 'branch' || item === 'herb' ? 3 : 1);
    gainXp(game, 15);
    cue(game, 'chest');
    burst(game, s.x, s.y, '#7cfc9a', 16);
    notify(game, '🧺 Gathered ' + ITEMS[item].name + ' from ' + s.name + ' (+15 XP)!', '#7cfc9a');
  } else if (actType === 'train') {
    addBoost(game, 'attack', 6, null, 'train-' + s.id);
    gainXp(game, 30);
    cue(game, 'levelUp');
    burst(game, s.x, s.y, '#ffd23f', 20);
    notify(game, '⚔ Trained at ' + s.name + '! (+30 XP, +6 Attack Boost)', '#ffd23f');
  } else if (actType === 'lore') {
    gainXp(game, 35);
    restoreMana(game.player, 3);
    cue(game, 'blessing');
    say(game, null, [s.name + ' — Inscription:\n' + pickRandom(LORE_NOTES), '(+35 XP, +3 Mana)']);
  } else if (actType === 'bless') {
    heal(game.player, 25, game);
    addBoost(game, 'defense', 5, null, 'bless-' + s.id);
    gainXp(game, 20);
    cue(game, 'blessing');
    burst(game, s.x, s.y, '#ffd23f', 20);
    notify(game, '🛡 ' + s.name + ' blesses you! (+25 HP, +5 Defense, +20 XP)', '#ffd23f');
  } else if (actType === 'purify') {
    gainXp(game, 40);
    earnLexis(game, 45);
    addItem(game.player, 'crystal', 1);
    cue(game, 'victory');
    burst(game, s.x, s.y, '#b48cff', 28);
    notify(game, '🔮 Purified ' + s.name + '! Found a Blue Crystal & +45 Lexis (+40 XP)!', '#d8b4f8');
  } else if (actType === 'loot') {
    const item = Math.random() < 0.35 ? 'mysteryCrate' : pickRandom(['oldCoin', 'caravanParcel', 'warRations', 'banditBadge']);
    addItem(game.player, item, 1);
    earnLexis(game, 30);
    cue(game, 'chest');
    burst(game, s.x, s.y, '#ffd23f', 18);
    notify(game, '🗝 Looted ' + s.name + ': found ' + ITEMS[item].name + ' & +30 Lexis!', '#ffd23f');
  }
}

const EXTRA_KINDS = new Set([
  'manaObelisk', 'starWell', 'worldTreeSapling', 'celestialSundial', 'fairyRing', 'crystalGeode', 'moonMirror', 'dragonShrine',
  'roadsidePavilion', 'stoneBridgeShrine', 'merchantOutpost', 'beekeeperGrove', 'lumberCamp', 'windTurbineTower', 'shepherdShelter', 'alchemyGarden',
  'watchBeacon', 'ruinedAqueduct', 'knightCenotaph', 'ancientAmphitheater', 'duelistRing', 'bellSanctuary', 'dwarvenForgeRuins', 'kingPillar', 'libraryRotunda',
  'banditTollgate', 'cursedTotem', 'gallowsRuins', 'poacherBlind', 'smugglerCache', 'abyssRift',
  'coralTidepool', 'sunkenAnchor', 'lighthouseBeacon', 'desertOasis', 'sandObelisk', 'canyonTotem', 'glacierCrystal', 'nordicRunestone', 'cherryGrove', 'sunflowerMaze',
]);

// Actions integrated into update.js actionsOf().
export function actionsOfStructures(game) {
  ensureStructState(game);
  const nearTrap = structureNear(game, 'banditTrap', 2.8);
  const nearShrine = structureNear(game, 'isekaiShrine', 2.6) || structureNear(game, 'summonGate', 2.8);
  const nearWay = structureNear(game, 'wayCamp', 2.6);
  const nearLair =
    structureNear(game, 'monsterCamp', 3.4) ||
    structureNear(game, 'goblinTotem', 3.0) ||
    structureNear(game, 'boneCairn', 3.0);
  const player = game.player;
  const nearExtra = WILD_STRUCTURES.find((s) => EXTRA_KINDS.has(s.kind) && Math.hypot(s.x - player.x, s.y - player.y) < 3.0) || null;

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
    {
      when: () => nearExtra !== null,
      icon: nearExtra?.action === 'buy' ? 'shop' : nearExtra?.action === 'loot' ? 'chest' : nearExtra?.action === 'train' ? 'woodSword' : 'star',
      run: () => interactWorldStructure(game, nearExtra),
    },
  ];
}
