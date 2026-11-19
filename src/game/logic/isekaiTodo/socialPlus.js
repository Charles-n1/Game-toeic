import { ACHIEVEMENTS, COMPANION_ARCS, PART6_LETTERS, ANIME_EPISODES, GALLERY_SCENES, WEEKLY_CHALLENGES } from '../../data/isekaiTodo';
import { ITEMS } from '../../data/items';
import { npcOf } from '../../data/npcs';
import { zoneAt } from '../../data/zones';
import { isSolid } from '../../world/map';
import { ensureIsekaiTodo } from './state';
import { countItem, removeItem, addItem, earnLexis, gainXp } from '../player';
import { addFriendship } from '../village';
import { facingOf } from '../input';
import { startFight } from '../fight';
import { makeDuel } from '../duels';
import { say, notify } from '../messages';
import { cue } from '../cues';

// Companion story arcs, Part 6 letters & courier messenger, anime episode cards,
// CG gallery & photo album, and solo weekly challenges for ISEKAI_TODO.

const ALT_STAGE_ITEMS = {
  rawMeat: 'roastMeat',
  pelt: 'refineStone',
};

const COURIER_SPAWN_MIN = 4.5;
const COURIER_SPAWN_MAX = 7.5;
const COURIER_SPEED = 2.6;
const MAX_ALBUM_PHOTOS = 24;

// Unlocks an achievement once, pays its reward, and notifies the player.
export function grantAchievement(game, achId) {
  const ach = ACHIEVEMENTS.find((entry) => entry.id === achId);
  if (!ach) return false;
  const st = ensureIsekaiTodo(game);
  if (st.achievements[achId]) return false;
  st.achievements[achId] = { day: game.day || 1, claimed: true };
  if (ach.reward?.lexis) earnLexis(game, ach.reward.lexis);
  if (ach.reward?.xp) gainXp(game, ach.reward.xp);
  if (ach.reward?.skillPt) st.skillPoints = (st.skillPoints || 0) + ach.reward.skillPt;
  cue(game, 'victory');
  notify(game, ach.icon + ' Achievement Unlocked: ' + ach.name + '!', '#ffd23f');
  return true;
}

// ---------- Companion Personal Story Quests ----------

function stageItemChoice(player, stage) {
  const need = stage.need || 1;
  if (countItem(player, stage.item) >= need) return stage.item;
  const alt = ALT_STAGE_ITEMS[stage.item];
  if (alt && countItem(player, alt) >= need) return alt;
  return null;
}

function checkStageRequirement(game, npcId, stageIdx, stage) {
  const player = game.player;
  if (stage.item) {
    const need = stage.need || 1;
    const itemUse = stageItemChoice(player, stage);
    const have = countItem(player, itemUse || stage.item);
    const label = ITEMS[itemUse || stage.item]?.name || stage.item;
    if (itemUse) {
      return { canAdvance: true, itemToConsume: itemUse, reason: 'Ready! (' + label + ' ' + have + '/' + need + ')' };
    }
    return { canAdvance: false, itemToConsume: null, reason: stage.goal + ' (' + have + '/' + need + ')' };
  }
  if (typeof stage.minKills === 'number') {
    const kills = game.counts?.kills || 0;
    const nyxLevelReady = npcId === 'nyx' && stageIdx === 2 && (player?.level || 1) >= 4;
    const ok = kills >= stage.minKills || nyxLevelReady;
    return {
      canAdvance: ok,
      itemToConsume: null,
      reason: ok ? 'Ready to advance!' : stage.goal + ' (' + kills + '/' + stage.minKills + ')',
    };
  }
  if (typeof stage.minCorrect === 'number') {
    const correct = game.counts?.correct || 0;
    const friendship = game.npcs?.[npcId]?.friendship || 0;
    const ok = correct >= stage.minCorrect || friendship >= 25;
    return {
      canAdvance: ok,
      itemToConsume: null,
      reason: ok ? 'Ready to advance!' : stage.goal + ' (' + correct + '/' + stage.minCorrect + ')',
    };
  }
  return { canAdvance: true, itemToConsume: null, reason: 'Ready to advance!' };
}

// Returns progress and readiness for a companion's personal story quest arc.
export function companionArcStatus(game, npcId) {
  const arc = COMPANION_ARCS[npcId];
  if (!arc) return null;
  const st = ensureIsekaiTodo(game);
  const entry = st.companionArcs[npcId] || { stage: 0, completed: false };
  const completed = Boolean(entry.completed);
  const stageIdx = completed ? arc.stages.length : Math.max(0, Math.min(arc.stages.length - 1, entry.stage || 0));
  const currentStage = completed ? null : arc.stages[stageIdx];
  if (completed) {
    return {
      arc,
      stageIdx,
      completed: true,
      currentStage: null,
      canAdvance: false,
      reason: 'Complete — Ultimate "' + arc.ultimateName + '" unlocked!',
    };
  }
  const check = checkStageRequirement(game, npcId, stageIdx, currentStage);
  return {
    arc,
    stageIdx,
    completed: false,
    currentStage,
    canAdvance: check.canAdvance,
    reason: check.reason,
  };
}

// Consumes requirements, advances a companion's story arc, and unlocks their Ultimate on finale.
export function advanceCompanionArc(game, npcId) {
  const status = companionArcStatus(game, npcId);
  if (!status || status.completed || !status.canAdvance) return false;
  const st = ensureIsekaiTodo(game);
  if (!st.companionArcs[npcId]) st.companionArcs[npcId] = { stage: 0, completed: false };
  const entry = st.companionArcs[npcId];
  const stage = status.currentStage;
  const check = checkStageRequirement(game, npcId, status.stageIdx, stage);
  if (!check.canAdvance) return false;

  if (check.itemToConsume) removeItem(game.player, check.itemToConsume, stage.need || 1);

  const nextStage = (entry.stage || 0) + 1;
  const isFinale = nextStage >= status.arc.stages.length;
  entry.stage = isFinale ? status.arc.stages.length : nextStage;
  entry.completed = isFinale;

  const npcName = npcOf(npcId)?.name || npcId;
  if (game.npcs?.[npcId]) addFriendship(game, npcId, isFinale ? 30 : 15);

  if (isFinale) {
    grantAchievement(game, 'heartBond');
    cue(game, 'victory');
    notify(game, '💌 ' + npcName + ' Ultimate Unlocked: ' + status.arc.ultimateName + '!', '#ff9ec4');
  } else {
    cue(game, 'levelUp');
    notify(game, '📖 ' + npcName + ' Story Step ' + nextStage + '/' + status.arc.stages.length + '!', '#ffd23f');
  }
  return {
    stage: entry.stage,
    completed: isFinale,
    dialogue: stage.dialogue,
    ultimateName: isFinale ? status.arc.ultimateName : null,
  };
}

// Sums passive battle bonuses from all completed companion personal story arcs.
export function companionUltimateBonus(game) {
  const st = ensureIsekaiTodo(game);
  const arcs = st.companionArcs || {};
  const bonus = { statusGuard: false, heal: 0, spell: 0, defense: 0, armor: 0, xp: 0, critical: 0, unlocked: [] };
  if (arcs.aria?.completed) {
    bonus.statusGuard = true;
    bonus.heal += 25;
    bonus.unlocked.push('aria');
  }
  if (arcs.yuki?.completed) {
    bonus.spell += 20;
    bonus.unlocked.push('yuki');
  }
  if (arcs.arthur?.completed) {
    bonus.defense += 10;
    bonus.armor += 10;
    bonus.unlocked.push('arthur');
  }
  if (arcs.luna?.completed) {
    bonus.xp += 15;
    bonus.unlocked.push('luna');
  }
  if (arcs.nyx?.completed) {
    bonus.critical += 10;
    bonus.unlocked.push('nyx');
  }
  return bonus;
}

// ---------- Part 6 Letters, Home Letterbox & Courier Messenger ----------

function letterDef(letterId) {
  return PART6_LETTERS.find((l) => l.id === letterId) || null;
}

function hasUrgentUnread(st) {
  return (st.letters.delivered || []).some((entry) => {
    const def = letterDef(entry.id);
    return Boolean(def?.urgent && !entry.read && !entry.replied);
  });
}

function firstUrgentLetterEntry(st) {
  return (st.letters.delivered || []).find((entry) => {
    const def = letterDef(entry.id);
    return Boolean(def?.urgent && !entry.replied);
  }) || null;
}

// Delivers up to one new Part 6 letter per day and flags urgent pending mail.
export function refreshDailyLetters(game) {
  const st = ensureIsekaiTodo(game);
  const day = game.day || 1;
  const added = [];
  if ((st.letters.lastCheckDay || 0) < day) {
    st.letters.lastCheckDay = day;
    const deliveredIds = new Set(st.letters.delivered.map((entry) => entry.id));
    const next = PART6_LETTERS.find((letter) => !deliveredIds.has(letter.id));
    if (next) {
      const record = { id: next.id, day, read: false, replied: false };
      st.letters.delivered.push(record);
      added.push(record);
      notify(game, (next.urgent ? '📨 Urgent letter arrived: ' : '✉️ New mail in your letterbox: ') + next.subject, '#ffd23f');
    }
  }
  st.letters.urgentPending = hasUrgentUnread(st);
  return added;
}

// Returns delivered letters enriched with catalog metadata for letterbox UI.
export function deliveredLettersList(game) {
  const st = ensureIsekaiTodo(game);
  return (st.letters.delivered || [])
    .map((entry) => ({ ...entry, letter: letterDef(entry.id) }))
    .filter((item) => Boolean(item.letter));
}

// Opens a TOEIC Part 6 email reading & reply duel for a delivered letter.
export function readPart6Letter(game, letterId) {
  const letter = letterDef(letterId);
  if (!letter) return false;
  const st = ensureIsekaiTodo(game);
  let entry = st.letters.delivered.find((d) => d.id === letterId);
  if (!entry) {
    entry = { id: letterId, day: game.day || 1, read: false, replied: false };
    st.letters.delivered.push(entry);
  }
  entry.read = true;
  st.letters.urgentPending = hasUrgentUnread(st);

  if (entry.replied) {
    const speaker = letter.npcId && npcOf(letter.npcId) ? letter.npcId : null;
    say(game, speaker, [letter.sender + ' — ' + letter.subject, letter.text, '(Already answered.)']);
    return true;
  }

  const npc = letter.npcId ? npcOf(letter.npcId) : null;
  const question = {
    id: 'part6-' + letter.id,
    section: 'rc8',
    difficulty: 'normal',
    category: letter.category || 'vocabulary',
    text: 'From: ' + letter.sender + '\nSubject: ' + letter.subject + '\n\n' + letter.text,
    question: letter.question,
    answers: letter.answers,
    correct_index: letter.correct,
    justification: 'Correct reply completion: "' + letter.answers[letter.correct] + '".',
  };

  const duel = makeDuel(
    { id: null, name: letter.sender, look: npc ? npc.look : null, shape: 'wisp' },
    {
      title: 'Part 6 Letter: ' + letter.subject,
      category: letter.category || 'vocabulary',
      tag: 'normal',
      questions: [question],
      health: 1,
      mistakesAllowed: 1,
      speed: 10,
      onWin: () => {
        entry.read = true;
        entry.replied = true;
        st.letters.urgentPending = hasUrgentUnread(st);
        const lexis = letter.rewardLexis || 35;
        const xp = 25;
        earnLexis(game, lexis);
        gainXp(game, xp);
        if (letter.npcId && game.npcs?.[letter.npcId]) addFriendship(game, letter.npcId, 8);
        cue(game, 'victory');
        notify(game, '✉️ Reply sent! +' + lexis + ' Lexis, +' + xp + ' XP!', '#7cfc9a');
      },
      onLose: () => {
        st.letters.urgentPending = hasUrgentUnread(st);
        notify(game, '✉️ Draft incomplete — open your letterbox to try replying again.', '#ffb070');
      },
    }
  );
  startFight(game, duel);
  return true;
}

function findCourierSpawn(player) {
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + 0.4;
    const dist = COURIER_SPAWN_MIN + (i % 3) * ((COURIER_SPAWN_MAX - COURIER_SPAWN_MIN) / 2);
    const sx = player.x + Math.cos(angle) * dist;
    const sy = player.y + Math.sin(angle) * dist;
    if (!isSolid(sx, sy)) return { x: sx, y: sy };
  }
  return { x: player.x + 3.5, y: player.y + 1.5 };
}

// Returns the active courier messenger if outdoors and close enough to talk to.
export function courierNear(game, range = 2.0) {
  const c = game?.run?.courier;
  if (!c || zoneAt(game.player.x, game.player.y).kind === 'inside') return null;
  return Math.hypot(c.x - game.player.x, c.y - game.player.y) <= range ? c : null;
}

// Delivers urgent mail held by the courier and opens the letter reading duel immediately.
export function deliverCourierMail(game) {
  const st = ensureIsekaiTodo(game);
  const courier = game.run.courier;
  const urgentEntry = (courier?.letterId && st.letters.delivered.find((d) => d.id === courier.letterId)) || firstUrgentLetterEntry(st);
  game.run.courier = null;
  st.letters.urgentPending = false;
  if (!urgentEntry) return false;
  return readPart6Letter(game, urgentEntry.id);
}

// Spawns and moves a courier messenger holding an envelope outdoors when urgent mail awaits.
export function tickCourierMessenger(game, dt = 0.016) {
  if (!game?.player || !game?.run) return null;
  const st = ensureIsekaiTodo(game);
  if (zoneAt(game.player.x, game.player.y).kind === 'inside') {
    game.run.courier = null;
    return null;
  }
  if (!st.letters.urgentPending) {
    game.run.courier = null;
    return null;
  }

  let urgent = firstUrgentLetterEntry(st);
  if (!urgent) {
    const fallback = PART6_LETTERS.find((l) => l.urgent);
    if (fallback && !st.letters.delivered.some((d) => d.id === fallback.id)) {
      urgent = { id: fallback.id, day: game.day || 1, read: false, replied: false };
      st.letters.delivered.push(urgent);
    }
  }
  if (!urgent) {
    st.letters.urgentPending = false;
    game.run.courier = null;
    return null;
  }

  const player = game.player;
  if (!game.run.courier) {
    const spot = findCourierSpawn(player);
    game.run.courier = {
      x: spot.x,
      y: spot.y,
      dir: 'down',
      step: 0,
      walking: false,
      letterId: urgent.id,
      name: 'Royal Courier',
      holdingEnvelope: true,
    };
  }

  const courier = game.run.courier;
  const dx = player.x - courier.x;
  const dy = player.y - courier.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 9) {
    const spot = findCourierSpawn(player);
    courier.x = spot.x;
    courier.y = spot.y;
    courier.walking = false;
  } else if (dist > 1.35 && dt > 0) {
    const step = Math.min(dist - 1.2, COURIER_SPEED * dt);
    const nx = courier.x + (dx / dist) * step;
    const ny = courier.y + (dy / dist) * step;
    if (!isSolid(nx, courier.y)) courier.x = nx;
    if (!isSolid(courier.x, ny)) courier.y = ny;
    courier.dir = facingOf(dx, dy);
    courier.step += dt * 6;
    courier.walking = true;
  } else {
    courier.dir = facingOf(dx, dy);
    courier.walking = false;
  }

  if (dist < 0.85 && game.run.screen === 'play' && !game.run.fight) {
    deliverCourierMail(game);
    return null;
  }
  return courier;
}

// ---------- Anime Episode Cards, CG Gallery, Photo Album & Weekly Challenges ----------

// Opens the anime episode title card when the hero enters a new chapter episode.
export function checkEpisodeProgression(game) {
  const st = ensureIsekaiTodo(game);
  const ep = Math.max(1, Math.min(ANIME_EPISODES.length, (game.chapter || 0) + 1));
  st.episodes.currentEp = ep;
  if (st.episodes.shownIntro[ep]) return null;
  st.episodes.shownIntro[ep] = true;
  const modal = { mode: 'open', episode: ANIME_EPISODES[ep - 1] };
  game.run.episodeModal = modal;
  return modal;
}

// Shows the closing "To Be Continued..." / "Next Time..." episode card.
export function triggerEpisodeToBeContinued(game, nextEp = null) {
  const st = ensureIsekaiTodo(game);
  const endedNum = nextEp ? Math.max(1, Math.min(ANIME_EPISODES.length, nextEp - 1 || 1)) : Math.max(1, Math.min(ANIME_EPISODES.length, st.episodes.currentEp || 1));
  const episode = ANIME_EPISODES[endedNum - 1] || ANIME_EPISODES[0];
  st.episodes.endedEp[endedNum] = true;
  const modal = {
    mode: 'end',
    title: 'To Be Continued...',
    nextTime: episode.nextPreview,
    episode,
  };
  game.run.episodeModal = modal;
  return modal;
}

// Unlocks an illustrated CG gallery scene by ID if not already unlocked.
export function unlockGallery(game, sceneId) {
  const scene = GALLERY_SCENES.find((entry) => entry.id === sceneId);
  if (!scene) return false;
  const st = ensureIsekaiTodo(game);
  if (st.gallery.unlocked.includes(sceneId)) return false;
  st.gallery.unlocked.push(sceneId);
  cue(game, 'victory');
  notify(game, scene.icon + ' Gallery Unlocked: ' + scene.title + '!', '#ffd23f');
  return true;
}

// Captures an adventure photo snapshot (capped at 24) and checks the photographer achievement.
export function snapAdventurePhoto(game, caption = null, withNpc = null) {
  const st = ensureIsekaiTodo(game);
  const zone = zoneAt(game.player.x, game.player.y);
  const zoneName = zone.id === 'visitHouse' && game.run?.visitHouse?.title ? game.run.visitHouse.title : zone?.name || 'Lexia';
  const seed = Date.now();
  const photo = {
    id: 'photo_' + seed + '_' + (st.gallery.photos.length + 1),
    day: game.day || 1,
    zone: zoneName,
    withNpc: withNpc || null,
    caption: caption || 'Memory in ' + zoneName,
    seed,
  };
  st.gallery.photos.push(photo);
  while (st.gallery.photos.length > MAX_ALBUM_PHOTOS) st.gallery.photos.shift();
  if (st.gallery.photos.length >= 5) grantAchievement(game, 'photographer');
  cue(game, 'coin');
  notify(game, '📷 Snapshot saved: ' + photo.caption, '#9fd8ff');
  return photo;
}

// Rotates to the next solo weekly challenge whenever the 7-day game week changes.
export function syncWeeklyChallenge(game) {
  const st = ensureIsekaiTodo(game);
  const week = Math.floor(((game.day || 1) - 1) / 7) + 1;
  const valid = WEEKLY_CHALLENGES.some((c) => c.id === st.weekly.challengeId);
  if (st.weekly.week !== week || !valid) {
    const next = WEEKLY_CHALLENGES[(week - 1) % WEEKLY_CHALLENGES.length];
    st.weekly.week = week;
    st.weekly.challengeId = next.id;
    st.weekly.progress = 0;
    st.weekly.completed = false;
    st.weekly.rewardClaimed = false;
    st.weekly.currentStreak = 0;
    notify(game, '📅 New Weekly Challenge: ' + next.title, '#ffd23f');
  }
  return WEEKLY_CHALLENGES.find((c) => c.id === st.weekly.challengeId) || WEEKLY_CHALLENGES[0];
}

// Updates weekly challenge progress and solo personal records from answer/kill/win events.
export function recordWeeklyStat(game, event = {}) {
  const challenge = syncWeeklyChallenge(game);
  const st = ensureIsekaiTodo(game);
  const w = st.weekly;

  if (event.isCorrect === true) {
    w.currentStreak = (w.currentStreak || 0) + 1;
    if (w.currentStreak > (w.longestCleanStreak || 0)) w.longestCleanStreak = w.currentStreak;
  } else if (event.isCorrect === false) {
    w.currentStreak = 0;
  }
  if (typeof event.longestCleanStreak === 'number' && event.longestCleanStreak > (w.longestCleanStreak || 0)) {
    w.longestCleanStreak = event.longestCleanStreak;
  }

  const ms = typeof event.answerMs === 'number' ? event.answerMs : event.durationMs;
  if (event.isCorrect !== false && typeof ms === 'number' && ms > 0) {
    const rounded = Math.round(ms);
    if (w.fastestAnswerMs === null || rounded < w.fastestAnswerMs) w.fastestAnswerMs = rounded;
  }

  let inc = 0;
  if (challenge.kind === 'answers') {
    inc = typeof event.answers === 'number' ? event.answers : event.isCorrect ? 1 : 0;
  } else if (challenge.kind === 'fastKills') {
    if (typeof event.fastKills === 'number') inc = event.fastKills;
    else if (event.fastKill) inc = 1;
    else if (event.isCorrect && typeof ms === 'number' && ms <= 5000) inc = 1;
  } else if (challenge.kind === 'kills') {
    inc = typeof event.kills === 'number' ? event.kills : event.kill ? 1 : 0;
  } else if (challenge.kind === 'cleanWins') {
    inc = typeof event.cleanWins === 'number' ? event.cleanWins : event.cleanWin ? 1 : 0;
  }

  if (inc > 0) w.progress = (w.progress || 0) + inc;
  if (!w.completed && w.progress >= challenge.goal) {
    w.completed = true;
    notify(game, '🏆 Weekly Challenge Complete: ' + challenge.title + '!', '#7cfc9a');
  }
  return w;
}

// Claims the completed weekly challenge reward once per week and updates bestWeekCount.
export function claimWeeklyReward(game) {
  const challenge = syncWeeklyChallenge(game);
  const st = ensureIsekaiTodo(game);
  const w = st.weekly;
  if (!w.completed || w.rewardClaimed) return false;
  w.rewardClaimed = true;
  w.bestWeekCount = (w.bestWeekCount || 0) + 1;
  const reward = challenge.reward || {};
  if (reward.lexis) earnLexis(game, reward.lexis);
  if (reward.item) addItem(game.player, reward.item, 1);
  cue(game, 'victory');
  const itemName = reward.item ? ITEMS[reward.item]?.name || reward.item : '';
  notify(game, '🎁 Weekly Reward claimed! +' + (reward.lexis || 0) + ' Lexis' + (itemName ? ' & ' + itemName : '') + '!', '#ffd23f');
  return true;
}
