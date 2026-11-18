import { WRITTEN_INCANTATIONS, ELEMENTAL_SPIRITS, ACHIEVEMENTS } from '../../data/isekaiTodo';
import { LANDS, DUNGEONS, VILLAGES, SPAWN, dungeonOf, zoneAt } from '../../data/zones';
import { SCALE } from '../../world/size';
import { isSolid } from '../../world/map';
import { addAnswer } from '../../../data/categories';
import { ensureIsekaiTodo } from './state';
import { heal, restoreMana, spellPowerBonus } from '../player';
import { recordAnswer } from '../learning';
import { lootMonster } from '../loot';
import { startFight } from '../fight';
import { makeDuel } from '../duels';
import { say, notify } from '../messages';
import { burst, floatText, spawnRing } from '../particles';
import { cue } from '../cues';

// Written Incantations, Time Magic, Gravity Magic, and Elemental Spirit Contracts.

const SPIRIT_CACHE = {};

function ensureRun(game) {
  if (!game.run || typeof game.run !== 'object') game.run = {};
  if (!Array.isArray(game.run.toasts)) game.run.toasts = [];
  if (!Array.isArray(game.run.particles)) game.run.particles = [];
  if (!Array.isArray(game.run.cues)) game.run.cues = [];
  if (!Array.isArray(game.run.waitingDialogs)) game.run.waitingDialogs = [];
  if (!Array.isArray(game.run.monsters)) game.run.monsters = [];
  return game.run;
}

function grantAchievement(game, achId) {
  const st = ensureIsekaiTodo(game);
  if (st.achievements[achId]) return false;
  st.achievements[achId] = { day: game.day || 1, claimed: false };
  const ach = ACHIEVEMENTS.find((entry) => entry.id === achId);
  if (ach) notify(game, '🏆 Achievement Unlocked: ' + ach.icon + ' ' + ach.name + '!', '#ffd23f');
  return true;
}

function safeSpellPower(game) {
  if (!game?.skills) return 0;
  return spellPowerBonus(game);
}

function safeHeal(game, amount) {
  heal(game.player, amount, game?.skills ? game : null);
}

function safeRecordAnswer(game, inc, isCorrect) {
  const cat = inc.category || 'verbTenses';
  if (game.skills && game.focus && game.counts && game.run?.onAnswer) {
    recordAnswer(
      game,
      { id: 'inc_' + inc.id, category: cat, difficulty: 'normal', section: 'rc10' },
      isCorrect
    );
    return;
  }
  if (game.mastery && typeof game.mastery === 'object') {
    game.mastery = addAnswer(game.mastery, cat, isCorrect);
  }
  if (game.counts) {
    game.counts.answers = (game.counts.answers || 0) + 1;
    if (isCorrect) game.counts.correct = (game.counts.correct || 0) + 1;
  }
}

function markWonIfCleared(fight) {
  if (!fight) return;
  const group = Array.isArray(fight.opponents) && fight.opponents.length > 0 ? fight.opponents : [fight.opponent];
  if (group.every((opp) => opp && opp.health <= 0)) {
    fight.phase = 'won';
  }
}

function defeatOrWoundWild(game, monster, dmg, labelColor = '#ffd23f') {
  monster.health = Math.max(0, (monster.health || 0) - dmg);
  burst(game, monster.x, monster.y, labelColor, 20);
  floatText(game, monster.x, monster.y, '-' + dmg, labelColor);
  if (monster.health <= 0) {
    if (monster.category && typeof monster.lexis === 'number' && game.counts) {
      lootMonster(game, monster);
    } else {
      game.run.monsters = game.run.monsters.filter((m) => m !== monster);
    }
    return true;
  }
  return false;
}

function findOpenOutdoorSpot(startX, startY, maxRadius = 35) {
  const bx = Math.floor(startX);
  const by = Math.floor(startY);
  for (let r = 0; r <= maxRadius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const tx = bx + dx + 0.5;
        const ty = by + dy + 0.5;
        if (!isSolid(tx, ty) && zoneAt(tx, ty).kind === 'land') return { x: tx, y: ty };
      }
    }
  }
  return null;
}

// ---------- Written Incantations ----------

/** Returns true if the hero can cast Written Incantations without completing the English prompt. */
export function hasSilentCasting(game) {
  const st = ensureIsekaiTodo(game);
  return Boolean(st.spellsUnlocked?.silentCast || (st.incantationsCast || 0) >= 8);
}

/** Opens an out-of-fight multiple-choice English incantation chant dialog. */
export function offerIncantationDialog(game, incId) {
  ensureRun(game);
  const inc = WRITTEN_INCANTATIONS.find((x) => x.id === incId);
  if (!inc) return false;
  if ((game.player.mana || 0) < inc.mpCost) {
    notify(game, '💧 Not enough Mana (' + inc.mpCost + ' MP needed)!', '#8fd6ff');
    return false;
  }
  const choices = inc.answers.map((ans, idx) => ({
    label: 'ABCD'[idx] + '. ' + ans,
    icon: 'book',
    run: () => castWrittenIncantation(game, incId, idx, null),
  }));
  choices.push({ label: 'Cancel chant', run: () => {} });
  say(game, null, ['📜 ' + inc.name + ' (' + inc.mpCost + ' MP)', inc.prompt], choices);
  return true;
}

/** Casts a Written Incantation, validating its English completion unless Silent Casting is unlocked. */
export function castWrittenIncantation(game, incId, answerIndex = null, fight = null) {
  ensureRun(game);
  const st = ensureIsekaiTodo(game);
  const inc = WRITTEN_INCANTATIONS.find((x) => x.id === incId);
  if (!inc) return { ok: false };

  const mana = game.player.mana || 0;
  if (mana < inc.mpCost) {
    notify(game, '💧 Not enough Mana (' + inc.mpCost + ' MP needed)!', '#8fd6ff');
    return { ok: false, noMana: true };
  }

  const silent = hasSilentCasting(game);
  if (!silent && answerIndex === null) {
    if (!fight) {
      offerIncantationDialog(game, incId);
      return { ok: false, pending: true };
    }
    notify(game, '📜 Incantation needs Silent Casting in battle or chanting out of combat!', '#ffd23f');
    return { ok: false, needsSilentCast: true };
  }

  game.player.mana = Math.max(0, Math.round(mana - inc.mpCost));

  if (!silent) {
    const isRight = answerIndex === inc.correct;
    safeRecordAnswer(game, inc, isRight);
    if (!isRight) {
      cue(game, 'wrong');
      burst(game, game.player.x, game.player.y, '#ff8a95', 10);
      notify(game, '💨 Incantation phrasing slipped — spell fizzled!', '#ff8a95');
      return { ok: false, fizzled: true };
    }
  }

  st.incantationsCast = (st.incantationsCast || 0) + 1;
  if (!silent && st.incantationsCast === 8) {
    notify(game, '✨ Mastery reached! Silent Casting unlocked for Written Incantations!', '#ffd23f');
  }
  if (st.incantationsCast >= 3) grantAchievement(game, 'chantMaster');

  const bonus = safeSpellPower(game);
  if (fight && fight.opponent) {
    if (inc.kind === 'damage') {
      const dmg = Math.max(1, Math.round((inc.power || 40) + bonus));
      fight.opponent.health = Math.max(0, (fight.opponent.health || 0) - dmg);
      const fx = game.player.x + 2.5;
      const fy = game.player.y - 0.6;
      burst(game, fx, fy, '#ff9f43', 24);
      floatText(game, fx, fy, '📜 ' + dmg, '#ffd23f');
      spawnRing(game, fx, fy + 0.4, 2.4, '#ff7b3a', 2, 0.45);
      cue(game, 'magicCast');
      notify(game, '📜 ' + inc.name + ' dealt ' + dmg + ' damage!', '#ffd23f');
      markWonIfCleared(fight);
      return { ok: true, damage: dmg };
    }
    const healAmt = inc.heal || 45;
    safeHeal(game, healAmt);
    game.player.stoneSkin = true;
    spawnRing(game, game.player.x, game.player.y, 2.2, '#7fd6ff', 2, 0.55);
    burst(game, game.player.x, game.player.y, '#7cfc9a', 20);
    floatText(game, game.player.x, game.player.y, '+' + healAmt + ' HP · 🛡️', '#7cfc9a');
    cue(game, 'blessing');
    notify(game, '🛡️ ' + inc.name + ' restored +' + healAmt + ' HP & Arcane Barrier!', '#7cfc9a');
    return { ok: true, healed: healAmt };
  }

  // Out of fight
  if (inc.kind === 'damage') {
    const dmg = Math.max(1, Math.round((inc.power || 40) + bonus));
    let nearest = null;
    let bestDist = 6.0001;
    for (const m of game.run.monsters) {
      if (m.boss || m.key || (m.health || 0) <= 0) continue;
      const d = Math.hypot(m.x - game.player.x, m.y - game.player.y);
      if (d <= bestDist) {
        bestDist = d;
        nearest = m;
      }
    }
    cue(game, 'magicCast');
    if (nearest) {
      spawnRing(game, nearest.x, nearest.y, 2.2, '#ff7b3a', 2, 0.45);
      const slain = defeatOrWoundWild(game, nearest, dmg, '#ffd23f');
      notify(
        game,
        slain
          ? '💥 ' + inc.name + ' felled ' + (nearest.name || 'the wild monster') + '!'
          : '📜 ' + inc.name + ' struck ' + (nearest.name || 'the monster') + ' for ' + dmg + ' dmg!',
        '#ffd23f'
      );
    } else {
      spawnRing(game, game.player.x, game.player.y, 2.6, '#ff9f43', 2, 0.45);
      burst(game, game.player.x, game.player.y, '#ff9f43', 18);
      notify(game, '📜 ' + inc.name + ' echoed cleanly! (No wild monster within 6 tiles.)', '#ffd23f');
    }
    return { ok: true, damage: dmg, hit: Boolean(nearest) };
  }

  const healAmt = inc.heal || 45;
  safeHeal(game, healAmt);
  game.player.stoneSkin = true;
  spawnRing(game, game.player.x, game.player.y, 2.2, '#7fd6ff', 2, 0.55);
  burst(game, game.player.x, game.player.y, '#7cfc9a', 20);
  floatText(game, game.player.x, game.player.y, '+' + healAmt + ' HP · 🛡️', '#7cfc9a');
  cue(game, 'blessing');
  notify(game, '🛡️ ' + inc.name + ' healed +' + healAmt + ' HP & raised Arcane Barrier!', '#7cfc9a');
  return { ok: true, healed: healAmt };
}

// ---------- Time Magic ----------

/** Returns true if Time Magic has been unlocked via skill tree, Chrono Warden, or level >= 6. */
export function hasTimeMagic(game) {
  const st = ensureIsekaiTodo(game);
  return Boolean(st.spellsUnlocked?.timeMagic || game.bosses?.warden === true || (game.player?.level || 1) >= 6);
}

/** Slows the battle question clock (or grants Haste out of fight) for 2 MP. */
export function castTimeDilate(game, fight = null) {
  ensureRun(game);
  if (!hasTimeMagic(game)) {
    notify(game, '⏳ Time Magic is locked (Lv.6, Chrono Warden, or Chrono Spark node).', '#ffb070');
    return { ok: false, locked: true };
  }
  const mana = game.player.mana || 0;
  if (mana < 2) {
    notify(game, '💧 Need 2 MP to cast Time Dilate!', '#8fd6ff');
    return { ok: false, noMana: true };
  }
  game.player.mana = Math.max(0, Math.round(mana - 2));
  cue(game, 'blessing');
  burst(game, game.player.x, game.player.y, '#9fd8ff', 18);
  if (fight) {
    fight.limit = Math.round((fight.limit || 10000) * 1.45) + 4000;
    notify(game, '⏳ Time Dilated! Extra seconds granted.', '#9fd8ff');
    return { ok: true, limit: fight.limit };
  }
  game.player.haste = true;
  notify(game, '⏳ Time Dilated! Haste granted for your next battle.', '#9fd8ff');
  return { ok: true, haste: true };
}

/** Freezes all wild and dungeon monster movement in the world for 6.5 seconds (costs 3 MP). */
export function castTimeFreezeWorld(game) {
  ensureRun(game);
  if (!hasTimeMagic(game)) {
    notify(game, '⏳ Time Magic is locked (Lv.6, Chrono Warden, or Chrono Spark node).', '#ffb070');
    return { ok: false, locked: true };
  }
  const mana = game.player.mana || 0;
  if (mana < 3) {
    notify(game, '💧 Need 3 MP to cast World Time Freeze!', '#8fd6ff');
    return { ok: false, noMana: true };
  }
  game.player.mana = Math.max(0, Math.round(mana - 3));
  game.run.timeStopUntil = Date.now() + 6500;
  spawnRing(game, game.player.x, game.player.y, 4.5, '#ffd23f', 2.5, 0.7);
  burst(game, game.player.x, game.player.y, '#ffe57f', 28);
  for (const m of game.run.monsters) {
    if (Math.hypot(m.x - game.player.x, m.y - game.player.y) <= 14) {
      burst(game, m.x, m.y, '#ffe57f', 8);
    }
  }
  cue(game, 'blessing');
  notify(game, '⏳ Time Frozen for 6s!', '#ffd23f');
  return { ok: true, until: game.run.timeStopUntil };
}

/** Returns true while world Time Freeze is active. */
export function isWorldTimeFrozen(game) {
  return Boolean(game?.run?.timeStopUntil && game.run.timeStopUntil > Date.now());
}

// ---------- Gravity Magic ----------

/** Returns true if Gravity Magic is unlocked via skill tree or hero level >= 7. */
export function hasGravityMagic(game) {
  const st = ensureIsekaiTodo(game);
  return Boolean(st.spellsUnlocked?.gravityMagic || (game.player?.level || 1) >= 7);
}

/** Crushes an enemy in combat (halves speed + 18 dmg) or knocks back & damages nearby wild monsters (< 5 tiles). */
export function castGravityCrush(game, fight = null) {
  ensureRun(game);
  if (!hasGravityMagic(game)) {
    notify(game, '🪨 Gravity Magic is locked (Lv.7 or Gravity Well node).', '#ffb070');
    return { ok: false, locked: true };
  }
  const mana = game.player.mana || 0;
  if (mana < 2) {
    notify(game, '💧 Need 2 MP to cast Gravity Crush!', '#8fd6ff');
    return { ok: false, noMana: true };
  }
  game.player.mana = Math.max(0, Math.round(mana - 2));
  cue(game, 'hit');

  if (fight && fight.opponent) {
    fight.opponent.speed = Math.max(4, Math.floor((fight.opponent.speed || 10) * 0.55));
    fight.opponent.health = Math.max(0, (fight.opponent.health || 0) - 18);
    const fx = game.player.x + 2.5;
    const fy = game.player.y - 0.5;
    burst(game, fx, fy, '#b48cff', 22);
    floatText(game, fx, fy, '🪨 18 · SLOW!', '#c9a8ff');
    spawnRing(game, fx, fy + 0.4, 2.2, '#b48cff', 2, 0.5);
    notify(game, '🪨 Gravity Crush! Enemy speed crushed & 18 damage dealt.', '#c9a8ff');
    markWonIfCleared(fight);
    return { ok: true, damage: 18, speed: fight.opponent.speed };
  }

  let hitCount = 0;
  for (const m of [...game.run.monsters]) {
    if (m.boss || m.key || (m.health || 0) <= 0) continue;
    const dx = m.x - game.player.x;
    const dy = m.y - game.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist >= 5) continue;
    hitCount += 1;
    const len = Math.max(0.1, dist);
    const nx = m.x + (dx / len) * 2.2;
    const ny = m.y + (dy / len) * 2.2;
    if (!isSolid(nx, ny) && zoneAt(nx, ny).kind === 'land') {
      m.x = nx;
      m.y = ny;
    }
    const dmg = m.tier === 'small' || (m.health || 0) <= 25 ? 24 : 18;
    defeatOrWoundWild(game, m, dmg, '#c9a8ff');
  }
  spawnRing(game, game.player.x, game.player.y, 4.8, '#b48cff', 2.5, 0.55);
  burst(game, game.player.x, game.player.y, '#b48cff', 22);
  notify(
    game,
    hitCount > 0 ? '🪨 Gravity Crush slammed ' + hitCount + ' nearby monster(s)!' : '🪨 Gravity wave pulsed across the ground.',
    '#c9a8ff'
  );
  return { ok: true, hitCount };
}

/** Grants 30s Levitation to glide across water and lava (costs 2 MP). */
export function castLevitate(game) {
  ensureRun(game);
  if (!hasGravityMagic(game)) {
    notify(game, '🪨 Gravity Magic is locked (Lv.7 or Gravity Well node).', '#ffb070');
    return { ok: false, locked: true };
  }
  const mana = game.player.mana || 0;
  if (mana < 2) {
    notify(game, '💧 Need 2 MP to cast Levitate!', '#8fd6ff');
    return { ok: false, noMana: true };
  }
  game.player.mana = Math.max(0, Math.round(mana - 2));
  game.run.levitateUntil = Date.now() + 30000;
  spawnRing(game, game.player.x, game.player.y, 2.5, '#c9a8ff', 2, 0.55);
  burst(game, game.player.x, game.player.y, '#d8b4f8', 18);
  cue(game, 'blessing');
  notify(game, '🪶 Levitating for 30s! Glide across rivers and lava safely.', '#c9a8ff');
  return { ok: true, until: game.run.levitateUntil };
}

/** Returns true while Gravity Levitation is active. */
export function isLevitating(game) {
  return Boolean(game?.run?.levitateUntil && game.run.levitateUntil > Date.now());
}

// ---------- Elemental Spirits ----------

function computeSpiritAnchor(spiritId) {
  let targetX = SPAWN.x;
  let targetY = SPAWN.y + 18;
  if (spiritId === 'salamander') {
    const d = dungeonOf('molten') || DUNGEONS[0];
    targetX = (d.door ? d.door[0] : d.x + d.w / 2) + 2;
    targetY = d.y + d.h + 3;
  } else if (spiritId === 'undine') {
    const land = LANDS.find((l) => l.id === 'emerald');
    const fallback = dungeonOf('crypt');
    if (land) {
      const spot = findOpenOutdoorSpot(land.x * SCALE, land.y * SCALE, 35);
      if (spot) return spot;
    }
    targetX = fallback ? (fallback.door ? fallback.door[0] : fallback.x + fallback.w / 2) + 2 : SPAWN.x + 25;
    targetY = fallback ? fallback.y + fallback.h + 3 : SPAWN.y;
  } else if (spiritId === 'sylph') {
    const d = dungeonOf('watchtower');
    targetX = d ? d.x + d.w / 2 : SPAWN.x + 20;
    targetY = d ? d.y + d.h + 3 : SPAWN.y + 20;
  } else if (spiritId === 'gnome') {
    const d = dungeonOf('mineWest');
    targetX = d ? (d.door ? d.door[0] : d.x + d.w / 2) + 2 : SPAWN.x - 20;
    targetY = d ? d.y + d.h + 3 : SPAWN.y;
  }
  const outsideLexiaX = VILLAGES[0].x + VILLAGES[0].w / 2;
  const outsideLexiaY = VILLAGES[0].y + VILLAGES[0].h + 10;
  return (
    findOpenOutdoorSpot(targetX, targetY, 35) ||
    findOpenOutdoorSpot(outsideLexiaX, outsideLexiaY, 45) ||
    { x: outsideLexiaX, y: outsideLexiaY }
  );
}

/** Returns deterministic, walkable outdoor shrine coordinates { x, y } for an Elemental Spirit. */
export function spiritAnchorOf(spiritId) {
  if (!SPIRIT_CACHE[spiritId]) {
    SPIRIT_CACHE[spiritId] = computeSpiritAnchor(spiritId);
  }
  return { ...SPIRIT_CACHE[spiritId] };
}

/** Returns all 4 Elemental Spirits paired with their world shrine coordinates. */
export function spiritLocations() {
  return ELEMENTAL_SPIRITS.map((spirit) => ({ ...spirit, ...spiritAnchorOf(spirit.id) }));
}

/** Launches the TOEIC reading-comprehension pact trial to contract an Elemental Spirit. */
export function startSpiritTrial(game, spiritId) {
  ensureRun(game);
  const spirit = ELEMENTAL_SPIRITS.find((s) => s.id === spiritId);
  if (!spirit) return false;
  const trialQuestion = {
    id: 'spirit_' + spirit.id,
    section: 'text',
    category: 'vocabulary',
    difficulty: 'hard',
    text: spirit.passage,
    question: spirit.question,
    answers: spirit.answers,
    correct_index: spirit.correct,
    justification: spirit.answers[spirit.correct],
  };
  startFight(
    game,
    makeDuel(
      { id: null, name: spirit.name, shape: 'wisp' },
      {
        title: 'Spirit Pact: ' + spirit.name,
        category: 'vocabulary',
        tag: 'hard',
        questions: [trialQuestion],
        health: 1,
        mistakesAllowed: 1,
        speed: 7,
        onWin: () => {
          const st = ensureIsekaiTodo(game);
          if (!st.spirits.contracted[spiritId]) {
            st.spirits.contracted[spiritId] = { level: 1, xp: 0 };
          }
          st.spirits.active = spiritId;
          grantAchievement(game, 'spiritPact');
          cue(game, 'levelUp');
          burst(game, game.player.x, game.player.y, spirit.color || '#ffd23f', 28);
          notify(game, '✨ Sacred Contract formed with ' + spirit.name + '!', spirit.color || '#ffd23f');
        },
        onLose: () => {
          notify(game, spirit.icon + ' ' + spirit.name + ': "Read the covenant carefully and return when ready."', '#ffb070');
        },
      }
    )
  );
  return true;
}

/** Equips one of the player's contracted Elemental Spirits (or null to unequip). */
export function setActiveSpirit(game, spiritId) {
  ensureRun(game);
  const st = ensureIsekaiTodo(game);
  if (spiritId === null) {
    st.spirits.active = null;
    return true;
  }
  if (!st.spirits.contracted?.[spiritId]) {
    notify(game, '✨ Form a Sacred Contract with that spirit first!', '#ffb070');
    return false;
  }
  st.spirits.active = spiritId;
  const spirit = ELEMENTAL_SPIRITS.find((s) => s.id === spiritId);
  notify(game, (spirit?.icon || '✨') + ' Active Spirit: ' + (spirit?.name || spiritId), spirit?.color || '#ffd23f');
  return true;
}

/** Returns passive bonuses { spell, speed, armor, thirstSlow } granted by the equipped spirit. */
export function activeSpiritPassives(game) {
  const st = ensureIsekaiTodo(game);
  const id = st.spirits?.active;
  const entry = id && st.spirits?.contracted?.[id];
  if (!entry) return { spell: 0, speed: 0, armor: 0, thirstSlow: 0 };
  const lv = entry.level || 1;
  const spirit = ELEMENTAL_SPIRITS.find((s) => s.id === id);
  const element = spirit?.element || id;
  if (element === 'fire') return { spell: 18 + (lv - 1) * 4, speed: 0, armor: 0, thirstSlow: 0 };
  if (element === 'water') return { spell: 0, speed: 0, armor: 0, thirstSlow: Math.min(0.65, 0.25 + (lv - 1) * 0.04) };
  if (element === 'wind') return { spell: 0, speed: 2 + Math.floor((lv - 1) / 2), armor: 0, thirstSlow: 0 };
  if (element === 'earth') return { spell: 0, speed: 0, armor: 8 + (lv - 1) * 2, thirstSlow: 0 };
  return { spell: 0, speed: 0, armor: 0, thirstSlow: 0 };
}

/** Summons the active Elemental Spirit once per fight for a signature elemental effect. */
export function summonSpiritInFight(game, fight) {
  ensureRun(game);
  if (!fight || !fight.opponent) return { ok: false };
  if (fight.spiritSummoned) {
    notify(game, '✨ Your contracted spirit was already summoned in this battle!', '#ffb070');
    return { ok: false, alreadySummoned: true };
  }
  const st = ensureIsekaiTodo(game);
  const id = st.spirits?.active;
  const entry = id && st.spirits?.contracted?.[id];
  if (!entry) {
    notify(game, '✨ No active Elemental Spirit equipped!', '#ffb070');
    return { ok: false, noSpirit: true };
  }
  const spirit = ELEMENTAL_SPIRITS.find((s) => s.id === id);
  const lv = entry.level || 1;
  if (!fight.statuses) fight.statuses = { player: {}, opponent: {} };
  if (!fight.statuses.opponent) fight.statuses.opponent = {};

  const fx = game.player.x + 2.5;
  const fy = game.player.y - 0.6;
  let dmg = 0;

  if (id === 'salamander') {
    dmg = 24 + lv * 6;
    fight.opponent.health = Math.max(0, (fight.opponent.health || 0) - dmg);
    fight.statuses.opponent.burn = { turns: 3, dmg: 6 + lv };
    burst(game, fx, fy, '#ff6a33', 26);
    floatText(game, fx, fy, '🔥 ' + dmg + ' · BURN!', '#ff6a33');
  } else if (id === 'undine') {
    const healAmt = 28 + (lv - 1) * 4;
    dmg = 18 + lv * 4;
    safeHeal(game, healAmt);
    restoreMana(game.player, 2);
    fight.opponent.health = Math.max(0, (fight.opponent.health || 0) - dmg);
    burst(game, game.player.x, game.player.y, '#5ad2ff', 22);
    floatText(game, game.player.x, game.player.y, '💧 +' + healAmt + ' HP · +2 MP', '#5ad2ff');
    floatText(game, fx, fy, '💧 ' + dmg, '#5ad2ff');
  } else if (id === 'sylph') {
    dmg = 22 + lv * 5;
    fight.opponent.health = Math.max(0, (fight.opponent.health || 0) - dmg);
    game.player.haste = true;
    fight.limit = Math.round((fight.limit || 10000) * 1.2);
    burst(game, fx, fy, '#98f5a6', 24);
    floatText(game, fx, fy, '🍃 ' + dmg + ' · HASTE!', '#98f5a6');
  } else {
    dmg = 20 + lv * 5;
    fight.opponent.health = Math.max(0, (fight.opponent.health || 0) - dmg);
    fight.statuses.opponent.stun = { turns: 1, dmg: 0 };
    game.player.stoneSkin = true;
    burst(game, fx, fy, '#d8a65a', 24);
    floatText(game, fx, fy, '🪨 ' + dmg + ' · STUN!', '#d8a65a');
  }

  fight.spiritSummoned = true;
  addSpiritXp(game, 5);
  cue(game, 'magicCast');
  notify(game, (spirit?.icon || '✨') + ' Summoned ' + (spirit?.name || id) + '!', spirit?.color || '#ffd23f');
  markWonIfCleared(fight);
  return { ok: true, spiritId: id, damage: dmg };
}

/** Grants XP to the currently equipped Elemental Spirit and levels it up (25 * lv per level, max 10). */
export function addSpiritXp(game, amount = 5) {
  ensureRun(game);
  const st = ensureIsekaiTodo(game);
  const id = st.spirits?.active;
  const entry = id && st.spirits?.contracted?.[id];
  if (!entry || entry.level >= 10) return null;
  entry.xp = (entry.xp || 0) + amount;
  const spirit = ELEMENTAL_SPIRITS.find((s) => s.id === id);
  while (entry.level < 10 && entry.xp >= 25 * entry.level) {
    entry.xp -= 25 * entry.level;
    entry.level += 1;
    cue(game, 'levelUp');
    notify(game, (spirit?.icon || '✨') + ' ' + (spirit?.name || id) + ' grew to Lv.' + entry.level + '!', spirit?.color || '#ffd23f');
  }
  return entry;
}

/** Opens an atmospheric conversation with an Elemental Spirit (offering contract trial or equipping). */
export function talkToSpirit(game, spiritId) {
  ensureRun(game);
  const spirit = ELEMENTAL_SPIRITS.find((s) => s.id === spiritId);
  if (!spirit) return false;
  const st = ensureIsekaiTodo(game);
  const contracted = Boolean(st.spirits?.contracted?.[spiritId]);
  const choices = [];
  if (!contracted) {
    choices.push({ label: 'Begin Sacred Contract Trial', icon: 'book', run: () => startSpiritTrial(game, spiritId) });
  } else if (st.spirits.active !== spiritId) {
    choices.push({ label: 'Set as Active Spirit', icon: 'star', run: () => setActiveSpirit(game, spiritId) });
  }
  choices.push({ label: 'Farewell', run: () => {} });
  say(game, null, [spirit.icon + ' ' + spirit.name + ' — ' + spirit.bonusText, ...spirit.lines], choices);
  return true;
}
