import { KINGDOMS } from '../../data/kingdoms';
import { ITEMS } from '../../data/items';
import { FORMATIONS, GRIMOIRES } from '../../data/realism';
import { SCALE } from '../../world/size';
import { zoneAt } from '../../data/zones';
import { isOutdoors, isRaining, isStorm } from '../weather';
import { isNight } from '../clock';
import { addItem, removeItem, countItem, heal, restoreMana, gainXp, earnLexis } from '../player';
import { startFight } from '../fight';
import { makeDuel } from '../duels';
import { notify } from '../messages';
import { cue } from '../cues';
import { burst } from '../particles';
import { ensureRealism, isTierEnabled } from './state';
import { addFactionFavor, currentFormation } from './socialAndCodex';

// Magic Physics, Ley Lines, Scrolls, Circles, Mana Lanterns, Flayer Cores,
// Traps, Lockpicks, Mimics, Nemesis & Stealth Ambush (REALISM.txt Parts 8, 14C & Isekai Magic).

const LEY_NODES = KINGDOMS.map((k) => ({
  id: k.id,
  name: k.name + ' Ley Nexus',
  x: Math.round(k.x * SCALE) + 12,
  y: Math.round(k.y * SCALE) - 8,
}));

export function nearestLeyNode(game) {
  const { x, y } = game.player;
  return LEY_NODES.find((n) => Math.hypot(n.x - x, n.y - y) <= 18) || null;
}

export function onManaSpentRealism(game, cost, maxMp, school = 'fire') {
  const r = ensureRealism(game);
  const m = r.manaTrain;
  m.spellMastery[school] = (m.spellMastery[school] || 0) + 1;
  if (m.spellMastery[school] === 12) {
    notify(game, '✨ Unlocked Silent Casting for ' + school + ' (+25% TOEIC spell timer)!', '#d8b4f8');
  }
  const currentMp = game.player.mana || 0;
  if (currentMp <= maxMp * 0.2 && m.bonusMaxMp < 40) {
    m.depletedSpend += cost;
    if (m.depletedSpend >= 15) {
      m.depletedSpend -= 15;
      m.bonusMaxMp += 1;
      notify(game, '🔵 Mana Vessel Expanded! Permanent +1 Max MP from deep depletion.', '#7fd6ff');
    }
  }
  if (currentMp === 0 && cost > 0) {
    m.backlashHours = 4;
    notify(game, '🌀 Zero-MP Exhaustion! Mana drained (-2 Speed for 4h). Rest or drink Mana Potion.', '#b48cff');
  }
}

export function silentCastTimeBonus(game, school) {
  const r = ensureRealism(game);
  const master = (r.manaTrain.spellMastery[school] || 0) >= 12 ? 1.25 : 1.0;
  const syntaxTome = r.manaTrain.studiedGrimoires.includes('grimoire_syntax') ? 1.08 : 1.0;
  return master * syntaxTome;
}

export function chargeCrystalBattery(game) {
  const r = ensureRealism(game);
  const m = r.manaTrain;
  if (m.crystalCharge >= m.maxCrystalCharge) {
    notify(game, '🔮 Crystal Battery is already full (12/12 charges).', '#9fd8ff');
    return false;
  }
  const src = countItem(game.player, 'coreShard') > 0 ? 'coreShard' : countItem(game.player, 'crystal') > 0 ? 'crystal' : null;
  if (!src) {
    notify(game, '🔮 Need a Lesser Monster Core or Crystal to charge your mana reserve.', '#ffb070');
    return false;
  }
  removeItem(game.player, src, 1);
  m.crystalCharge = Math.min(m.maxCrystalCharge, m.crystalCharge + (src === 'coreShard' ? 4 : 3));
  cue(game, 'levelUp');
  notify(game, `🔮 Charged Mana Battery (${m.crystalCharge}/${m.maxCrystalCharge}).`, '#8fd6ff');
  return true;
}

export function dischargeCrystalBattery(game) {
  const r = ensureRealism(game);
  if (r.manaTrain.crystalCharge <= 0) {
    notify(game, '🔮 Crystal Battery is empty.', '#ffb070');
    return false;
  }
  const draw = Math.min(r.manaTrain.crystalCharge, 5);
  r.manaTrain.crystalCharge -= draw;
  restoreMana(game.player, draw);
  cue(game, 'coin');
  notify(game, `⚡ Channeled +${draw} MP from Crystal Battery!`, '#7fd6ff');
  return true;
}

// Elemental Weather & Ley Node & Grimoire & Formation Multiplier
export function magicDamageContextMultiplier(game, school) {
  const r = ensureRealism(game);
  let mult = 1.0;
  if (isOutdoors(game)) {
    if (isRaining(game) || isStorm(game)) {
      if (school === 'water' || school === 'lightning') mult *= 1.3;
      if (school === 'fire') mult *= 0.7;
    } else if (zoneAt(game.player.x, game.player.y).biome === 'desert') {
      if (school === 'fire') mult *= 1.25;
    }
  }
  if (nearestLeyNode(game)) mult *= 1.2;
  const tome = GRIMOIRES.find((g) => g.school === school && r.manaTrain.studiedGrimoires.includes(g.id));
  if (tome) mult *= 1.1;
  mult *= 1 + (currentFormation(game).spellMod || 0);
  if (r.social.factions.arcaneOrder >= 25) mult *= 1.15;
  return mult;
}

export function stepSpellOverheat(game) {
  const c = ensureRealism(game).combatRealism;
  c.spellChain = (c.spellChain || 0) + 1;
  if (c.spellChain >= 3 && (game.player.health || 0) > 15) {
    game.player.health = Math.max(10, Math.round(game.player.health - 6));
    notify(game, '🔥 Arcane Overheat! 3+ chained spells boosted power (+25%) but seared 6 HP.', '#ff8a95');
    return 1.25;
  }
  return 1.0;
}

// Combat Spell Scrolls (0 MP instant effect) & Rune Chalk Circles
export function useCombatScroll(game, fight, scrollId) {
  if (!fight || countItem(game.player, scrollId) <= 0) return false;
  const item = ITEMS[scrollId];
  if (!item || item.kind !== 'scroll') return false;
  removeItem(game.player, scrollId, 1);
  const foe = fight.opponent;
  const orderBoost = ensureRealism(game).social.factions.arcaneOrder >= 25 ? 1.2 : 1.0;

  if (item.scrollType === 'fire') {
    const dmg = Math.round(32 * orderBoost);
    foe.health = Math.max(0, foe.health - dmg);
    notify(game, `🔥 Fireball Scroll blasted ${foe.name} for ${dmg} DMG!`, '#ff9a2b');
  } else if (item.scrollType === 'heal') {
    heal(game.player, Math.round(75 * orderBoost), game);
    notify(game, '✨ Restoration Scroll mended your wounds!', '#7cfc9a');
  } else if (item.scrollType === 'ward') {
    ensureRealism(game).combatRealism.activeCircle = 'ward';
    notify(game, '🛡️ Aegis Ward Scroll etched a 35% damage barrier!', '#9fd8ff');
  } else if (item.scrollType === 'blink') {
    const dmg = Math.round(15 * orderBoost);
    foe.health = Math.max(0, foe.health - dmg);
    fight.limit += 4000;
    notify(game, `⚡ Flash Step Scroll struck for ${dmg} DMG (+4s time)!`, '#ffd23f');
  }
  burst(game, game.player.x, game.player.y, '#ffd23f', 16);
  cue(game, 'spell');
  if (foe.health <= 0 && Array.isArray(fight.opponents)) {
    const next = fight.opponents.find((o) => o.health > 0);
    if (!next) fight.phase = 'won';
    else fight.opponent = next;
  }
  return true;
}

export function traceChalkCircle(game, type = 'ward') {
  if (countItem(game.player, 'chalk') <= 0) {
    notify(game, '🪄 You need Rune Chalk to inscribe a magic circle.', '#ffb070');
    return false;
  }
  removeItem(game.player, 'chalk', 1);
  ensureRealism(game).combatRealism.activeCircle = type;
  cue(game, 'levelUp');
  notify(game, type === 'regen' ? '🪄 Regen Circle inscribed (+4 HP & +1 MP per round)!' : '🛡️ Ward Circle inscribed (35% physical/magic shield)!', '#9fd8ff');
  return true;
}

export function activeCircleDefenseScale(game) {
  return ensureRealism(game).combatRealism.activeCircle === 'ward' ? 0.65 : 1.0;
}

export function scribeScrollWithMaterials(game, scrollId) {
  if (countItem(game.player, 'parchment') < 1 || countItem(game.player, 'ink') < 1 || countItem(game.player, 'crystal') < 1) {
    notify(game, '📜 Need 1 Rag Parchment + 1 Iron-Gall Ink + 1 Crystal to scribe a scroll.', '#ffb070');
    return false;
  }
  removeItem(game.player, 'parchment', 1);
  removeItem(game.player, 'ink', 1);
  removeItem(game.player, 'crystal', 1);
  addItem(game.player, scrollId, 1);
  addFactionFavor(game, 'arcaneOrder', 3);
  cue(game, 'levelUp');
  notify(game, '📜 Scribed ' + (ITEMS[scrollId]?.name || scrollId) + '!', '#d8b4f8');
  return true;
}

// Darkness & Dungeon Mana Lantern + Compass
export function hasManaLanternLit(game) {
  return countItem(game.player, 'manaLantern') > 0 && countItem(game.player, 'coreShard') > 0;
}

export function stepManaLanternDaily(game) {
  if (hasManaLanternLit(game)) {
    removeItem(game.player, 'coreShard', 1);
    notify(game, '🏮 Mana Lantern consumed 1 Lesser Core Shard to sustain dungeon light.', '#8fd6ff');
  }
}

export function consumeFightStartEnv(game) {
  const r = ensureRealism(game);
  const wakeSleepyTurn = Boolean(r.combatRealism.wakeSleepyTurn);
  const ambushReady = Boolean(r.combatRealism.ambushReady || game.player?.accessory === 'hoodedCloak');
  r.combatRealism.wakeSleepyTurn = false;
  r.combatRealism.ambushReady = false;
  r.combatRealism.spellChain = 0;
  r.combatRealism.activeCircle = null;
  return { wakeSleepyTurn, ambushReady };
}

export function fightEnvironmentMods(game, fight = null) {
  const r = ensureRealism(game);
  const z = zoneAt(game.player.x, game.player.y);
  let timeMult = 1.0;
  let dmgMult = 1.0;
  const notes = [];

  const noLight = (z.kind === 'floor' || isNight(game)) && (game.player.torchHours || 0) <= 0 && !hasManaLanternLit(game);
  if (isTierEnabled(game, 'A') && noLight) {
    timeMult *= 0.88;
    notes.push('🌑 Dark (-12% time)');
  }
  if (isTierEnabled(game, 'A') && (z.biome === 'mountain' || z.id === 'swamp')) {
    timeMult *= 0.85;
    notes.push('❄️ Heavy ground (-15% time)');
  }
  const sleepy = fight ? fight.wakeSleepyTurn && fight.asked === 0 : r.combatRealism.wakeSleepyTurn;
  if (sleepy) {
    timeMult *= 0.75;
    notes.push('🥱 Sleepy ambush');
  }
  const ambush = fight ? fight.ambushReady : r.combatRealism.ambushReady || game.player.accessory === 'hoodedCloak';
  if (ambush) {
    dmgMult *= 1.2;
    notes.push('🥷 Surprise +20%');
  }
  if (r.combatRealism.heirloom) {
    dmgMult *= 1.05;
  }
  const f = currentFormation(game);
  timeMult *= 1 + (f.timeMod || 0);
  dmgMult *= 1 + (f.atkMod || 0);
  return { timeMult, dmgMult, notes };
}

export function compassDirectionToCapitals(game) {
  if (countItem(game.player, 'compass') <= 0) {
    return 'Carry a Magnetic Compass for exact bearings.';
  }
  const { x, y } = game.player;
  const lexia = KINGDOMS[0];
  const lx = Math.round(lexia.x * SCALE);
  const ly = Math.round(lexia.y * SCALE);
  const dx = lx - x;
  const dy = ly - y;
  const dir = (dy < -12 ? 'N' : dy > 12 ? 'S' : '') + (dx < -12 ? 'W' : dx > 12 ? 'E' : '');
  return `🧭 Compass → Lexhaven: ${Math.round(Math.hypot(dx, dy))} tiles ${dir || 'Here'}`;
}

// Monster Core Harvesting, Clean-Kill Flayer XP, Traps, Locks & Mimic Appraisal
export function harvestKillRealism(game, monster, cleanKill = false) {
  const r = ensureRealism(game);
  const s = r.skills;
  if (cleanKill) s.cleanKillStreak += 1;
  else s.cleanKillStreak = 0;

  if (isTierEnabled(game, 'C')) r.health.cleanliness = Math.max(0, r.health.cleanliness - 4);
  s.flayerXp += cleanKill ? 2 : 1;
  if (s.flayerXp >= s.flayerLevel * 10 && s.flayerLevel < 5) {
    s.flayerXp -= s.flayerLevel * 10;
    s.flayerLevel += 1;
    notify(game, `🔪 Flayer Skill Lv.${s.flayerLevel}! Better hides & Monster Cores drop now.`, '#ffd23f');
  }

  // Monster Core drops based on tier + flayer level
  const coreChance = Math.min(0.85, 0.15 + s.flayerLevel * 0.08 + (cleanKill ? 0.15 : 0));
  if (monster.boss) {
    addItem(game.player, 'elderCore', 1);
    notify(game, '💎 Harvested Elder Calamity Core from boss!', '#ffd23f');
  } else if ((monster.tier === 'big' || monster.tier === 'demon') && Math.random() < coreChance) {
    addItem(game.player, 'monsterCore', 1);
    notify(game, '🔮 Harvested Pristine Monster Core!', '#d8b4f8');
  } else if (Math.random() < coreChance * 0.65) {
    addItem(game.player, 'coreShard', 1);
  }

  // Bestiary Codex tracking
  const sp = monster.species || 'slime';
  if (!r.codex.monsters[sp]) r.codex.monsters[sp] = { seen: 0, killed: 0, weakness: monster.category };
  r.codex.monsters[sp].seen += 1;
  r.codex.monsters[sp].killed += 1;

  // Avenged Nemesis payout
  if (r.world.nemesis[sp] && monster.isNemesis) {
    const recovered = r.world.nemesis[sp].stolenItem;
    delete r.world.nemesis[sp];
    earnLexis(game, 90);
    if (recovered && ITEMS[recovered]) addItem(game.player, recovered, 1);
    notify(game, `🏆 Avenged defeat against ${monster.name}! (+90L${recovered ? ', reclaimed ' + ITEMS[recovered].name : ''})`, '#ffd23f');
  }
}

export function promoteNemesisOnDefeat(game, monster) {
  if (!isTierEnabled(game, 'B') || !monster || monster.duel) return;
  const r = ensureRealism(game);
  const sp = monster.species || 'goblin';
  const steal = Object.keys(game.player?.bag || {}).find((id) => ITEMS[id]?.kind === 'goods' || ITEMS[id]?.kind === 'material') || null;
  if (steal) removeItem(game.player, steal, 1);
  r.world.nemesis[sp] = {
    name: `${monster.name} the Scarred`,
    species: sp,
    stolenItem: steal,
    day: game.day || 1,
  };
  notify(game, `💀 ${monster.name} mocked your fall and became "${r.world.nemesis[sp].name}"!`, '#ff6060');
}

export function disarmDungeonTrapQuick(game, floorId) {
  const r = ensureRealism(game);
  r.codex.trapsFound = (r.codex.trapsFound || 0) + 1;
  startFight(
    game,
    makeDuel(
      { id: null, name: 'Floor Pressure Plate', shape: 'rock' },
      {
        title: 'Disarm Trap Fast (<8s)!',
        category: 'prepositions',
        health: 1,
        mistakesAllowed: 1,
        speed: 18,
        onWin: () => {
          r.combatRealism.disarmedTraps[floorId] = game.day || 1;
          r.skills.trapDisarms += 1;
          gainXp(game, 18);
          earnLexis(game, 15);
          notify(game, '⚙️ Disarmed floor trap! (+18 XP, +15 Lexis)', '#7cfc9a');
        },
        onLose: () => {
          r.combatRealism.disarmedTraps[floorId] = game.day || 1;
          game.player.health = Math.max(1, Math.round((game.player.health || 15) - 12));
          notify(game, '💥 Trap sprung (-12 HP)!', '#ff6060');
        },
      }
    )
  );
}

export function pickSealedLockWithLockpick(game, chestKey) {
  if (countItem(game.player, 'lockpick') <= 0) {
    notify(game, '🗝️ Carry a Thief Lockpick to crack sealed chests.', '#ffb070');
    return false;
  }
  const r = ensureRealism(game);
  startFight(
    game,
    makeDuel(
      { id: null, name: 'Ancient Tumbler Lock', shape: 'chest' },
      {
        title: 'Pick Lock',
        category: 'wordForms',
        health: 1,
        mistakesAllowed: 1,
        speed: 14,
        onWin: () => {
          r.combatRealism.pickedLocks[chestKey] = true;
          r.skills.lockpicks += 1;
          addItem(game.player, Math.random() < 0.4 ? 'pearl' : 'coreShard', 1);
          earnLexis(game, 35);
          cue(game, 'chest');
          notify(game, '🗝️ Lock clicked open! Found treasure + 35 Lexis.', '#ffd23f');
        },
        onLose: () => {
          removeItem(game.player, 'lockpick', 1);
          notify(game, '💥 Snap! Your Thief Lockpick broke inside the keyhole.', '#ff8a95');
        },
      }
    )
  );
  return true;
}

export function inspectChestWithMonocle(game, chestKey) {
  const r = ensureRealism(game);
  r.combatRealism.mimicChecked[chestKey] = true;
  if (game.player.accessory === 'monocle') {
    notify(game, '🧐 Brass Monocle inspection: Chest mechanism is authentic (no Mimic teeth)!', '#7cfc9a');
    return true;
  }
  const isMimic = Math.random() < 0.25 && isTierEnabled(game, 'C');
  if (isMimic) {
    game.player.health = Math.max(1, Math.round((game.player.health || 20) - 8));
    notify(game, '👹 MIMIC! It bit your fingers (-8 HP). Buy a Brass Monocle next time!', '#ff5a6e');
    return false;
  }
  notify(game, '📦 Looked inside cautiously — safe chest.', '#9fd8ff');
  return true;
}

// Rosette 3-fragment second-chance charm
export function checkRosetteSecondChance(game) {
  if (countItem(game.player, 'rosetteFragment') < 3) return false;
  removeItem(game.player, 'rosetteFragment', 3);
  game.player.health = 25;
  notify(game, '🌟 3 Rosette Star Shards shattered to save your life (+25 HP)!', '#ffd23f');
  return true;
}

// Tinderbox reliability boost in wet/windy outdoors
export function canUseTinderboxInRain(game) {
  return countItem(game.player, 'tinder') > 0;
}

export { FORMATIONS };
