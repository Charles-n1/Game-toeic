import { SPECIES } from '../../data/monsters';
import { ITEMS } from '../../data/items';
import { zoneAt } from '../../data/zones';
import { npcOf } from '../../data/npcs';
import { ensureIsekaiTodo } from './state';
import { TAG_POWER, TAG_ATTACK } from '../skills';
import { makeMonster } from '../monsters';
import { startFight } from '../fight';
import { makeDuel } from '../duels';
import { addItem, earnLexis, gainXp, heal } from '../player';
import { awardGuildPoints } from '../guild/ranks';
import { say, notify } from '../messages';
import { cue } from '../cues';
import { grantAchievement } from './socialPlus';

// 10-Floor Spire of Babel tower, Secret Dungeon Floors with English wall riddles,
// and Group Raid Squad tactics (tank / healer / damage).

export const TOWER_FLOORS = [
  { floor: 1, species: 'slime', name: 'Babel Slime (F1)', tag: 'normal', tier: 'small', hpScale: 1.2, atkScale: 1.0, rewardLexis: 35, rewardXp: 25 },
  { floor: 2, species: 'orc', name: 'Spire Orc Vanguard (F2)', tag: 'normal', tier: 'small', hpScale: 1.0, atkScale: 0.95, rewardLexis: 55, rewardXp: 40 },
  { floor: 3, species: 'drake', name: 'Cinder Spire Drake (F3)', tag: 'normal', tier: 'big', hpScale: 1.0, atkScale: 1.0, rewardLexis: 80, rewardXp: 55 },
  { floor: 4, species: 'darkKnight', name: 'Oathbreaker Knight (F4)', tag: 'normal', tier: 'big', hpScale: 1.05, atkScale: 1.0, rewardLexis: 105, rewardXp: 75 },
  // (No demon general in the Spire: they stay on the Silent Isle. Beating "Thamuz" here also killed the real one.)
  { floor: 5, species: 'boneGolem', name: 'Bone Colossus, Spire Floor 5 Boss', tag: 'hard', tier: 'boss', boss: true, hpScale: 0.75, atkScale: 0.85, rewardLexis: 220, rewardXp: 160 },
  { floor: 6, species: 'shadowMage', name: 'Babel Shadow Archon (F6)', tag: 'hard', tier: 'big', hpScale: 1.0, atkScale: 0.9, rewardLexis: 150, rewardXp: 110 },
  { floor: 7, species: 'demonLich', name: 'Spire Demon Lich (F7)', tag: 'hard', tier: 'demon', hpScale: 1.0, atkScale: 0.9, rewardLexis: 185, rewardXp: 135 },
  { floor: 8, species: 'hellknight', name: 'Babel Hellknight (F8)', tag: 'hard', tier: 'demon', hpScale: 1.05, atkScale: 0.95, rewardLexis: 220, rewardXp: 165 },
  { floor: 9, species: 'demonBehemoth', name: 'Abyssal Behemoth (F9)', tag: 'extreme', tier: 'demon', hpScale: 0.72, atkScale: 0.65, rewardLexis: 300, rewardXp: 230 },
  { floor: 10, species: 'darkPaladin', name: 'Empowered Archdemon (F10 Apex)', tag: 'extreme', tier: 'demon', boss: true, hpScale: 0.9, atkScale: 0.72, rewardLexis: 520, rewardXp: 400 },
];

export const SECRET_CLUES = {
  crypt: {
    dungeonId: 'crypt',
    dungeonName: 'Crystal Cave',
    chamberName: 'Prismatic Vault',
    text: 'ENGRAVED CRYSTAL TABLET:\n"Although the eastern tunnel looks sealed by fallen quartz, anyone speaking the passive chime unlocks the prism gate behind the third pillar."',
    question: 'Based on the crystal tablet, how is the secret gate unlocked?',
    answers: [
      'By speaking the passive chime behind the third pillar.',
      'By shattering every crystal in the main hall with a pickaxe.',
      'By waiting until midnight without carrying any light.',
      'By pouring lamp oil over the fallen quartz.',
    ],
    correct: 0,
    category: 'vocabulary',
    explain: 'The inscription explicitly states speaking the passive chime unlocks the gate.',
    guardian: 'mimic',
    guardianName: 'Prismatic Gilded Mimic',
    tag: 'normal',
    treasure: 'crystal',
    rewardLexis: 120,
    rewardXp: 75,
  },
  ruins: {
    dungeonId: 'ruins',
    dungeonName: 'Ancient Ruins',
    chamberName: 'Vault of Lost Clauses',
    text: 'FADED ARCHWAY INSCRIPTION:\n"No banner was raised in these halls unless the scribe ____ the final verb before sunset."',
    question: 'Choose the correct verb form to complete the ancient archway seal:',
    answers: ['inscribed', 'inscribing', 'inscribe', 'to inscribe'],
    correct: 0,
    category: 'verbTenses',
    explain: 'Past tense "was raised" pairs with past simple "inscribed" in the condition clause.',
    guardian: 'shadowMage',
    guardianName: 'Ruin Seal Keeper',
    tag: 'hard',
    treasure: 'protectionScroll',
    rewardLexis: 165,
    rewardXp: 110,
  },
  watchtower: {
    dungeonId: 'watchtower',
    dungeonName: 'Old Watchtower',
    chamberName: 'Signalman Hidden Armory',
    text: 'WEATHERED LOGBOOK NOTE:\n"Before abandoning the spire, the watch captain hid our finest whetstones ____ the loose flagstone beneath the stairwell."',
    question: 'Select the preposition that reveals where the whetstones lie:',
    answers: ['under', 'among', 'during', 'despite'],
    correct: 0,
    category: 'prepositions',
    explain: '"Under the loose flagstone" indicates physical location beneath a single stone.',
    guardian: 'mimic',
    guardianName: 'Watchtower Coffer Mimic',
    tag: 'normal',
    treasure: 'refineStone',
    rewardLexis: 135,
    rewardXp: 85,
  },
  tower: {
    dungeonId: 'tower',
    dungeonName: 'Frostpeak Castle',
    chamberName: 'Glacier Reliquary',
    text: 'FROST-ETCHED LEDGER:\n"Neither the frost wardens nor the castle archivist ____ willing to open the southern ice vault while time storms raged outside."',
    question: 'Complete the frost-etched ledger correctly:',
    answers: ['was', 'were', 'are', 'be'],
    correct: 0,
    category: 'subjectVerb',
    explain: 'With "neither... nor", the verb agrees with the closer singular noun "archivist" -> "was".',
    guardian: 'shadowMage',
    guardianName: 'Frostbound Archmage',
    tag: 'hard',
    treasure: 'gem',
    rewardLexis: 195,
    rewardXp: 130,
  },
  forgotten: {
    dungeonId: 'forgotten',
    dungeonName: 'Forgotten Crypt',
    chamberName: 'Sanctum of the Old Tongue',
    text: 'OTHERWORLD WALL CHISELING:\n"Despite ____ every warning carved along the crypt stairs, the prior expedition opened the sealed ossuary alone."',
    question: 'Pick the correct grammar completion for the wall carving:',
    answers: ['reading', 'read', 'to read', 'reads'],
    correct: 0,
    category: 'gerunds',
    explain: '"Despite" is a preposition and must be followed by a gerund ("reading").',
    guardian: 'demonLich',
    guardianName: 'Ossuary Grand Lich',
    tag: 'hard',
    treasure: 'protectionScroll',
    rewardLexis: 210,
    rewardXp: 145,
  },
};

const RAID_TANKS = new Set(['arthur', 'garrick', 'lyra', 'chiefGrog']);
const RAID_HEALERS = new Set(['aria', 'elara', 'sylvia']);
const RAID_DAMAGE = new Set(['lea', 'yuki', 'luna', 'nyx', 'kai', 'sszarak', 'aeris']);

// ---------- 10-Floor Dungeon Tower (Spire of Babel) ----------

/** Returns metadata for a given floor (1..10) of the Spire of Babel. */
export function towerFloorSpec(floor) {
  const clamped = Math.max(1, Math.min(TOWER_FLOORS.length, Math.floor(floor || 1)));
  return TOWER_FLOORS[clamped - 1];
}

/** Returns current Spire of Babel progress and checkpoint status. */
export function towerState(game) {
  const st = ensureIsekaiTodo(game);
  const currentFloor = st.tower.currentFloor || 0;
  return {
    maxFloor: st.tower.maxFloor || 1,
    checkpoint: st.tower.checkpoint || 1,
    active: currentFloor > 0,
    currentFloor,
  };
}

function buildScaledOpponent(game, speciesId, spec, extra = {}) {
  const species = SPECIES[speciesId] || SPECIES.slime;
  const tag = spec.tag || 'normal';
  const tagPower = TAG_POWER[tag] || 1;
  const tagAttack = TAG_ATTACK[tag] || 1;
  const base = makeMonster(game, speciesId, game.player.x + 2, game.player.y, {});
  const hp = Math.max(15, Math.round(species.health * tagPower * (spec.hpScale || 1)));
  const atk = Math.max(0, Math.round(species.attack * tagAttack * (spec.atkScale || 1)));
  const mag = Math.max(0, Math.round(species.magicAttack * tagAttack * (spec.atkScale || 1)));
  return {
    ...base,
    name: spec.name || base.name,
    tier: spec.tier || base.tier,
    tag,
    boss: Boolean(spec.boss),
    health: hp,
    maxHealth: hp,
    attack: atk,
    magicAttack: mag,
    xp: Math.round(species.xp * tagPower),
    lexis: Math.round(species.lexis * tagPower),
    ...extra,
  };
}

/** Launches a Spire of Babel encounter starting at floor 1, checkpoint, or any unlocked floor. */
export function enterTowerFloor(game, startFloor = 1) {
  const st = ensureIsekaiTodo(game);
  const floor = Math.max(1, Math.min(10, Math.floor(startFloor || 1)));
  const unlockedLimit = Math.max(st.tower.maxFloor || 1, st.tower.checkpoint || 1);
  if (floor > unlockedLimit) {
    notify(game, '🔒 Spire Floor ' + floor + ' is locked! Clear Floor ' + unlockedLimit + ' first.', '#ffb070');
    return false;
  }
  const spec = towerFloorSpec(floor);
  st.tower.currentFloor = floor;
  const opponent = buildScaledOpponent(game, spec.species, spec, {
    towerFloor: floor,
    isTowerFloor: true,
  });
  notify(game, '🗼 Entering Spire of Babel — Floor ' + floor + (spec.boss ? ' (BOSS!)' : ''), '#ffd23f');
  startFight(game, opponent);
  return true;
}

/** Awards rewards, unlocks checkpoints/floors, and grants achievements upon winning a Spire floor. */
export function onTowerFloorWon(game, floor = null) {
  const st = ensureIsekaiTodo(game);
  const cleared = Math.max(1, Math.min(10, Math.floor(floor || st.tower.currentFloor || 1)));
  const spec = towerFloorSpec(cleared);

  if (cleared < 10) {
    st.tower.maxFloor = Math.max(st.tower.maxFloor || 1, cleared + 1);
  } else {
    st.tower.maxFloor = 10;
  }
  if (cleared >= 5 && (st.tower.checkpoint || 1) < 6) {
    st.tower.checkpoint = 6;
    notify(game, '⛩️ Spire Checkpoint unlocked! Future climbs can start from Floor 6.', '#9fd8ff');
  }
  st.tower.currentFloor = 0;

  earnLexis(game, spec.rewardLexis);
  gainXp(game, spec.rewardXp);
  awardGuildPoints(game, cleared % 5 === 0 ? 50 : 15, 'Spire Floor ' + cleared);

  if (cleared === 5 || cleared === 10) {
    const stones = cleared === 10 ? 3 : 2;
    addItem(game.player, 'refineStone', stones);
  }
  if (cleared === 5) {
    addItem(game.player, 'protectionScroll', 1);
    grantAchievement(game, 'towerClimber');
  }
  if (cleared === 10) {
    addItem(game.player, 'gem', 2);
    if (!st.flyingMount.unlocked) {
      st.flyingMount.unlocked = true;
      addItem(game.player, 'griffinWhistle', 1);
    }
    grantAchievement(game, 'towerClimber');
    grantAchievement(game, 'skyRider');
  }

  cue(game, 'victory');
  notify(
    game,
    '🗼 Cleared Spire Floor ' + cleared + '! +' + spec.rewardLexis + ' Lexis, +' + spec.rewardXp + ' XP' + (cleared === 10 ? ' + Sky Griffin Whistle!' : '!'),
    '#7cfc9a'
  );
  return true;
}

// ---------- Secret Dungeon Floors ----------

/** Returns true when the dungeon has a secret floor riddle/chamber not yet cleared. */
export function canOpenSecretFloor(game, dungeonId = null) {
  const targetId = dungeonId || zoneAt(game.player.x, game.player.y)?.dungeon;
  if (!targetId || !SECRET_CLUES[targetId]) return false;
  const st = ensureIsekaiTodo(game);
  return !st.tower.secretCleared[targetId];
}

/** Launches the hidden secret chamber guardian battle after solving the English wall clue. */
export function startSecretFloorFight(game, dungeonId) {
  const clue = SECRET_CLUES[dungeonId];
  if (!clue) return false;
  const guardian = buildScaledOpponent(game, clue.guardian, {
    name: clue.guardianName,
    tag: clue.tag,
    tier: clue.tag === 'hard' ? 'big' : 'small',
    boss: false,
    hpScale: 1.1,
    atkScale: 0.95,
  }, {
    secretDungeonId: dungeonId,
    isSecretFloor: true,
  });
  notify(game, '🔍 Stepping into ' + clue.chamberName + '!', '#d8b4f8');
  startFight(game, guardian);
  return true;
}

/** Awards the rare secret chamber treasure and unlocks the secretSeeker achievement. */
export function onSecretFloorWon(game, dungeonId) {
  const clue = SECRET_CLUES[dungeonId];
  if (!clue) return false;
  const st = ensureIsekaiTodo(game);
  st.tower.secretUnlocked[dungeonId] = true;
  if (st.tower.secretCleared[dungeonId]) return false;
  st.tower.secretCleared[dungeonId] = true;

  addItem(game.player, clue.treasure, 1);
  if (dungeonId === 'crypt') addItem(game.player, 'refineStone', 1);
  if (dungeonId === 'forgotten') addItem(game.player, 'gem', 1);
  earnLexis(game, clue.rewardLexis);
  gainXp(game, clue.rewardXp);
  awardGuildPoints(game, 35, clue.chamberName);
  grantAchievement(game, 'secretSeeker');
  cue(game, 'victory');
  notify(
    game,
    '🔍 Secret Chamber Cleared! Found ' + (ITEMS[clue.treasure]?.name || clue.treasure) + ' & +' + clue.rewardLexis + ' Lexis!',
    '#ffd23f'
  );
  return true;
}

/** Reads an English wall riddle in a dungeon; answering right opens the secret chamber fight. */
export function trySecretFloorRiddle(game, dungeonId = null) {
  const targetId = dungeonId || zoneAt(game.player.x, game.player.y)?.dungeon;
  const clue = SECRET_CLUES[targetId];
  if (!clue) return false;
  const st = ensureIsekaiTodo(game);
  if (st.tower.secretCleared[targetId]) {
    say(game, null, ['The secret door of ' + clue.dungeonName + ' stands open and bare — its treasure is already yours.']);
    return false;
  }
  if (st.tower.secretUnlocked[targetId]) {
    return startSecretFloorFight(game, targetId);
  }

  const question = {
    id: 'secret-' + targetId,
    section: 'rc8',
    difficulty: clue.tag || 'normal',
    category: clue.category || 'vocabulary',
    text: clue.text,
    question: clue.question,
    answers: clue.answers,
    correct_index: clue.correct,
    justification: clue.explain,
  };

  const duel = makeDuel(
    { id: null, name: clue.dungeonName + ' Wall Clue', look: null, shape: 'wisp' },
    {
      title: 'Secret Wall Clue',
      category: clue.category || 'vocabulary',
      tag: clue.tag || 'normal',
      questions: [question],
      health: 1,
      mistakesAllowed: 1,
      speed: 10,
      onWin: () => {
        st.tower.secretUnlocked[targetId] = true;
        notify(game, '🔍 Secret passage unlocked inside ' + clue.dungeonName + '!', '#ffd23f');
        startSecretFloorFight(game, targetId);
      },
      onLose: () => {
        say(game, null, ['The stone glyphs stay locked. Read the wall clue carefully and try again.']);
      },
    }
  );
  startFight(game, duel);
  return true;
}

// ---------- Group Raid Squad (Tank / Healer / Damage) ----------

function roleForAllyId(id) {
  if (RAID_TANKS.has(id)) return 'tank';
  if (RAID_HEALERS.has(id)) return 'healer';
  if (RAID_DAMAGE.has(id)) return 'damage';
  return 'damage';
}

const VOLUNTEER_BY_ROLE = {
  tank: { id: 'merc_tank', name: 'Guild Vanguard (Merc)', role: 'tank', kind: 'volunteer', power: 18 },
  healer: { id: 'merc_healer', name: 'Cleric Initiate (Merc)', role: 'healer', kind: 'volunteer', power: 16 },
  damage: { id: 'merc_dps', name: 'Guild Ranger (Merc)', role: 'damage', kind: 'volunteer', power: 20 },
};

/** Returns raid squad allies assigned to tank/healer/damage, filling missing roles with volunteers. */
export function raidSquadRoles(game, fillMissing = true) {
  const st = ensureIsekaiTodo(game);
  const squad = [];
  const seen = new Set();

  for (const id of game.player?.party || []) {
    if (seen.has(id)) continue;
    seen.add(id);
    const npc = npcOf(id);
    squad.push({
      id,
      name: npc ? npc.name : id,
      role: roleForAllyId(id),
      kind: 'npc',
      power: 22,
    });
  }

  for (const mId of st.intelligent?.recruited || []) {
    if (seen.has(mId)) continue;
    seen.add(mId);
    squad.push({
      id: mId,
      name: mId === 'chiefGrog' ? 'Chief Grog' : mId === 'sszarak' ? 'Sszarak' : mId === 'aeris' ? 'Aeris' : mId,
      role: roleForAllyId(mId),
      kind: 'intelligent',
      power: 20,
    });
  }

  for (const member of st.ownGuild?.members || []) {
    if (!member || seen.has(member.id)) continue;
    seen.add(member.id);
    squad.push({
      id: member.id,
      name: member.name || member.id,
      role: roleForAllyId(member.id),
      kind: member.kind || 'npc',
      power: member.power || 18,
    });
  }

  const activeBeast = (st.tamed || []).find((t) => t.uid === st.activeTamedUid || t.place === 'party');
  if (activeBeast && !seen.has(activeBeast.uid)) {
    seen.add(activeBeast.uid);
    squad.push({
      id: activeBeast.uid,
      name: activeBeast.name || activeBeast.species,
      role: 'damage',
      kind: 'tamed',
      power: 16 + (activeBeast.level || 1) * 3,
    });
  }

  if (fillMissing) {
    for (const role of ['tank', 'healer', 'damage']) {
      if (!squad.some((member) => member.role === role)) {
        squad.push({ ...VOLUNTEER_BY_ROLE[role] });
      }
    }
  }
  return squad;
}

/** Launches a Group Raid battle with tank/healer/DPS roles assigned against a boss. */
export function startGroupRaid(game, bossSpec = null) {
  const roles = raidSquadRoles(game, true);
  const speciesId = bossSpec?.species && SPECIES[bossSpec.species] ? bossSpec.species : 'hellknight'; // (the generals stay on the isle)
  const tag = bossSpec?.tag || 'hard';
  const tier = bossSpec?.tier || (tag === 'normal' ? 'big' : 'demon');
  const opponent = buildScaledOpponent(
    game,
    speciesId,
    {
      name: bossSpec?.name || 'Demon Vanguard Commander',
      tag,
      tier,
      boss: bossSpec?.boss ?? true,
      hpScale: bossSpec?.hpScale || 1.25,
      atkScale: bossSpec?.atkScale || 0.9,
    },
    {
      isGroupRaid: true,
      emissaryId: bossSpec?.id || null,
      bounty: bossSpec?.bounty || 0,
      doomCut: bossSpec?.doomCut || 0,
    }
  );
  if (typeof bossSpec?.health === 'number') {
    opponent.health = bossSpec.health;
    opponent.maxHealth = bossSpec.health;
  }
  startFight(game, opponent);
  if (game.run.fight) {
    game.run.fight.raidSquad = roles;
    game.run.fight.raidDamageReduction = 0;
  }
  notify(game, '⚔️ Group Raid launched! (' + roles.length + ' squad members ready)', '#ffd23f');
  return game.run.fight;
}

/** Applies fast volley or steady phalanx/mend orders during a Group Raid on a correct answer. */
export function applyRaidOrderOnAnswer(game, fight, isCorrect, usedRatio = 1) {
  if (!fight?.opponent?.isGroupRaid || !isCorrect) {
    return { orderName: null, extraDmg: 0, healedHp: 0 };
  }
  const squad = Array.isArray(fight.raidSquad) && fight.raidSquad.length > 0 ? fight.raidSquad : raidSquadRoles(game, true);
  const dpsCount = Math.max(1, squad.filter((member) => member.role === 'damage').length);

  if (usedRatio <= 0.45) {
    const extraDmg = 22 * dpsCount;
    fight.opponent.health = Math.max(0, fight.opponent.health - extraDmg);
    if (fight.last) fight.last.damage = (fight.last.damage || 0) + extraDmg;
    if (fight.opponent.health <= 0 && (!fight.opponents || fight.opponents.every((o) => o.health <= 0))) {
      fight.phase = 'won';
    }
    const res = { orderName: 'All-Out Raid Volley!', extraDmg, healedHp: 0 };
    fight.raidOrder = res;
    return res;
  }

  const healedHp = 12;
  heal(game.player, healedHp, game);
  fight.raidDamageReduction = 0.35;
  fight.raidGuardTurns = 1;
  if (fight.last) fight.last.companionHeal = (fight.last.companionHeal || 0) + healedHp;
  const res = { orderName: 'Group Mend / Phalanx!', extraDmg: 0, healedHp, damageReduction: 0.35 };
  fight.raidOrder = res;
  return res;
}
