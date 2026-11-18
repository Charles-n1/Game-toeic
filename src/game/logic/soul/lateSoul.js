import { TYPES } from '../../data/types';
import { NPCS, npcOf } from '../../data/npcs';
import { SPAWN, insideOf } from '../../data/zones';
import { biomeAt } from '../../world/map';
import {
  MASTERED_WONDERS,
  HERO_VOICE_TONES,
  WALKING_COMPANION_BANTER,
  CREATION_FOLKLORE,
  CORVIN_MYSTERIES,
  SILENT_STORY_SPOTS,
  MAYONNAISE_STAGES,
  CLUMSY_LEXA_LINES,
  ARIA_STARGAZING_SCENE,
  LOUIS_FLASHBACK_SCENE,
} from '../../data/soul';
import { skillPercent } from '../learning';
import { addFriendship, addHappiness } from '../village';
import { earnLexis, gainXp } from '../player';
import { say, notify } from '../messages';
import { cue } from '../cues';
import { pickRandom } from '../../../logic/random';
import { ensureSoul } from './state';

// ---------- PART 11: Real Learning Restores Eldermoor & Real-World TOEIC Exam ----------

export function syncMasteredWonders(game) {
  if (!game?.mastery) return [];
  const s = ensureSoul(game);
  const newly = [];
  for (const type of TYPES) {
    const masteryPct = skillPercent(game, type.id);
    const hasProgress = (game.mastery[type.id]?.good || 0) >= 8 && masteryPct >= 80;
    const trainedTag = game.skills?.[type.id]?.tag && game.skills[type.id].tag !== 'normal';
    if ((hasProgress || trainedTag) && !s.masteredRestored[type.id]) {
      s.masteredRestored[type.id] = { day: game.day, wonder: MASTERED_WONDERS[type.id]?.wonder || type.name };
      const info = MASTERED_WONDERS[type.id];
      if (info) {
        newly.push(info);
        notify(game, '🔔 ' + info.wonder + ' awakens! ' + info.desc, '#7cfc9a');
      }
    }
  }
  return newly;
}

export function masteredGrammarSpeechLine(game) {
  const s = ensureSoul(game);
  const keys = Object.keys(s.masteredRestored || {});
  if (keys.length === 0) return null;
  const pick = pickRandom(keys);
  return MASTERED_WONDERS[pick]?.speakerLine || null;
}

export function setRealExamDate(game, yyyyMmDd) {
  const s = ensureSoul(game);
  s.realLife.examDate = typeof yyyyMmDd === 'string' ? yyyyMmDd.trim() : '';
  s.realLife.examBeforeAsked = false;
  s.realLife.examAfterAsked = false;
}

export function checkRealExamMilestones(game, nowMs = Date.now()) {
  const s = ensureSoul(game);
  const raw = s.realLife.examDate;
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const todayIso = new Date(nowMs).toISOString().slice(0, 10);
  const diffDays = Math.round((Date.parse(raw) - Date.parse(todayIso)) / 86400000);
  if (diffDays === 1 && !s.realLife.examBeforeAsked) {
    s.realLife.examBeforeAsked = true;
    say(game, 'aria', ['Tomorrow is your real TOEIC exam back on Earth.', '"Sleep, hero. Tomorrow you fight for real."']);
    return 'before';
  }
  if (diffDays <= -1 && diffDays >= -7 && !s.realLife.examAfterAsked) {
    s.realLife.examAfterAsked = true;
    say(game, 'aria', ['You came back from your real exam! How did it go?'], [
      {
        label: 'I reached my TOEIC target score!',
        icon: 'star',
        run: () => {
          addHappiness(game, 10);
          earnLexis(game, 250);
          cue(game, 'victory');
          say(game, 'aria', ['🎉 Eldermoor rings every bell tonight and sets feast tables in your honor! Congratulations!']);
        },
      },
      {
        label: 'Not quite there yet — still training harder!',
        icon: 'book',
        run: () => {
          addFriendship(game, 'aria', 10);
          say(game, 'aria', ['Then our clinic light stays lit beside your desk until the next sitting. Proud of you for walking in.']);
        },
      },
    ]);
    return 'after';
  }
  return null;
}

export function checkWelcomeBack(game, nowMs = Date.now()) {
  const s = ensureSoul(game);
  const prev = s.realLife.lastSessionMs || nowMs;
  const realDays = (nowMs - prev) / 86400000;
  s.realLife.lastSessionMs = nowMs;
  if (realDays >= 2) {
    notify(game, '🕯️ Welcome back — "We kept your seat warm."', '#ffe9a8');
    return true;
  }
  return false;
}

// ---------- PART 12: Hero Voice Tones & Walking Companion Chatter ----------

export function heroVoiceChoice(game, npc) {
  if (!npc) return null;
  const s = ensureSoul(game);
  return {
    label: 'Answer in your own voice (' + (s.voice.dominant ? 'Style: ' + s.voice.dominant : 'Choose tone') + ')',
    icon: 'talk',
    run: () => {
      say(
        game,
        npc.id,
        [npc.name + ' listens closely for how you answer.'],
        ['kind', 'teasing', 'silent'].map((tone) => ({
          label: HERO_VOICE_TONES[tone].label,
          icon: tone === 'kind' ? 'heart' : tone === 'teasing' ? 'sparkle' : 'dots',
          run: () => {
            s.voice[tone] = (s.voice[tone] || 0) + 1;
            const ranked = ['kind', 'teasing', 'silent'].sort((a, b) => (s.voice[b] || 0) - (s.voice[a] || 0));
            s.voice.dominant = ranked[0];
            addFriendship(game, npc.id, tone === 'kind' ? 4 : 3);
            say(game, npc.id, [HERO_VOICE_TONES[tone].react]);
          },
        }))
      );
    },
  };
}

export function heroVoiceCallbackLine(game) {
  const dom = ensureSoul(game).voice.dominant;
  return dom ? HERO_VOICE_TONES[dom]?.traitComment || null : null;
}

export function updateCompanionWalkingBanter(game, dt) {
  if (!game?.run?.followers || game.run.followers.length === 0 || game.run.fight || game.run.screen !== 'play') return;
  const now = Date.now();
  game.run._banterTimer = (game.run._banterTimer || 0) + dt;
  if (game.run._banterTimer < 9) return;
  game.run._banterTimer = 0;

  const peopleFollowers = game.run.followers.filter((f) => f.kind === 'person' && f.id);
  if (peopleFollowers.length === 0) return;
  const speaker = pickRandom(peopleFollowers);
  const b = biomeAt ? biomeAt(game.player.x, game.player.y) : 'plains';
  const pool = [
    ...(WALKING_COMPANION_BANTER.byNpc[speaker.id] || []),
    ...(WALKING_COMPANION_BANTER.byBiome[b] || []),
  ];
  if (pool.length === 0) return;
  speaker.banter = { text: pickRandom(pool), until: now + 4200 };
}

// ---------- PART 13 & 14: Folklore, Corvin Mysteries, Wordless Tableaus & Lightness ----------

export function readLibraryFolklore(game) {
  say(game, 'Head Archivist', CREATION_FOLKLORE);
}

export function buildHeroChronicleLines(game) {
  const slain = Object.entries(game.bosses || {})
    .filter(([, dead]) => dead)
    .map(([k]) => k);
  const name = game.player?.name || 'Hero';
  const lines = [
    'Title etched in gold: "The Chronicle of ' + name + ' Across Lexia"',
    'Days walked: ' + game.day + ' · Raids survived: ' + (game.raid?.count || 0) + ' · Answers mastered: ' + (game.counts?.correct || 0),
    slain.length > 0
      ? 'Songs already record victories over: ' + slain.join(', ') + '.'
      : 'Clean white pages wait beside the inkwell for your first slain champion.',
  ];
  const mayo = ensureSoul(game).legend.mayoStage || 0;
  if (mayo >= 1) lines.push('Footnote in margin: Riverford’s mysterious "Gold Mayo" appears suspiciously often beside supply ledgers.');
  return lines;
}

export function readHeroChronicle(game) {
  const s = ensureSoul(game);
  s.legend.trophiesViewed += 1;
  say(game, 'yuki', buildHeroChronicleLines(game));
}

export function triggerCorvinMystery(game) {
  const s = ensureSoul(game);
  const idx = s.legend.mysteryCount % CORVIN_MYSTERIES.length;
  s.legend.mysteryCount += 1;
  say(game, 'corvin', [
    { speaker: 'corvin', expr: 'neutral', text: CORVIN_MYSTERIES[idx] },
  ]);
}

export function silentStoryPositions() {
  return SILENT_STORY_SPOTS.map((spot) => ({
    ...spot,
    x: SPAWN.x + spot.dx,
    y: SPAWN.y + spot.dy,
  }));
}

export function inspectSilentStorySpot(game, spot) {
  const s = ensureSoul(game);
  s.legend.inspectedSpots[spot.id] = true;
  say(game, null, [spot.title, ...spot.lines]);
}

export function advanceMayoJoke(game) {
  const s = ensureSoul(game);
  const stage = Math.min(MAYONNAISE_STAGES.length - 1, s.legend.mayoStage || 0);
  const text = MAYONNAISE_STAGES[stage];
  s.legend.mayoStage = Math.min(MAYONNAISE_STAGES.length - 1, stage + 1);
  return text;
}

export function randomClumsyLexaWhisper() {
  return pickRandom(CLUMSY_LEXA_LINES);
}

export function triggerAriaStargaze(game) {
  const s = ensureSoul(game);
  if (s.legend.ariaStargazed || !game.npcs?.aria?.alive) return false;
  if (s.orin.mournedDay === null) return false;
  s.legend.ariaStargazed = true;
  say(game, 'aria', ARIA_STARGAZING_SCENE);
  return true;
}

// ---------- PART 15 & 16: Growing Orin Oak, Home Memories, Autonomous World & Louis Flashback ----------

export function growOrinTree(game) {
  const s = ensureSoul(game);
  if (s.orin.mournedDay === null) return 0;
  const elapsed = Math.max(0, game.day - s.orin.mournedDay);
  const target = Math.min(3, Math.floor(elapsed / 3));
  if (target > (s.orin.treeStage || 0)) s.orin.treeStage = target;
  return s.orin.treeStage;
}

export function homeMemoriesSummary(game) {
  const bosses = Object.entries(game.bosses || {})
    .filter(([, v]) => v)
    .map(([k]) => k);
  const friends = NPCS.filter((n) => (game.npcs?.[n.id]?.friendship || 0) >= 50).map((n) => n.name);
  return {
    bossTrophies: bosses,
    pinnedLetters: friends.slice(0, 5),
    wallPosition: (() => {
      const h = insideOf('home');
      return { x: h.x + 5.5, y: h.y + 1.8 };
    })(),
  };
}

export function inspectHomeMemoryWall(game) {
  const mem = homeMemoriesSummary(game);
  ensureSoul(game).legend.trophiesViewed += 1;
  const lines = ['Hanging along your home timber wall:'];
  lines.push(
    mem.bossTrophies.length > 0
      ? '🏆 Victory plaques: ' + mem.bossTrophies.join(', ') + '.'
      : '🪵 Clean brass hooks wait quietly for conquered boss relics.'
  );
  lines.push(
    mem.pinnedLetters.length > 0
      ? '✉️ Pinned thank-you notes & charms from: ' + mem.pinnedLetters.join(', ') + '.'
      : '📌 Only one folded summons slip rests beneath an iron pin.'
  );
  say(game, null, lines);
}

export function tickAutonomousWorldEvents(game) {
  const s = ensureSoul(game);
  if (game.day >= 8 && !s.worldEvents.leaGeneralDefeated && game.npcs?.lea?.alive) {
    s.worldEvents.leaGeneralDefeated = true;
    if (!game.bosses.warden) {
      notify(game, '⚔️ Courier dispatch: Lea cut down a northern demon vanguard alone near Frostpeak!', '#ffd23f');
    }
  }
  if (game.day >= 11 && !s.worldEvents.autonomousVillageSaved) {
    s.worldEvents.autonomousVillageSaved = true;
    addHappiness(game, 2);
    notify(game, '🛡️ Frontier militia in Greendale repelled a wolf pack without waiting for reinforcements!', '#7cfc9a');
  }
  if (game.day >= 14 && !s.worldEvents.autonomousWeddingDone) {
    s.worldEvents.autonomousWeddingDone = true;
    addHappiness(game, 2);
    notify(game, '💐 Bells rang across Riverford while you walked the roads—two villagers wed beneath blossom boughs!', '#ffadd0');
  }
}

export function playLouisFlashback(game) {
  const s = ensureSoul(game);
  s.legend.louisFlashbackPlayed = true;
  say(
    game,
    'Louis (Lost Hero)',
    LOUIS_FLASHBACK_SCENE.lines,
    LOUIS_FLASHBACK_SCENE.choices.map((ch) => ({
      label: ch.label,
      icon: 'book',
      run: () => {
        s.legend.louisChoice = ch.id;
        gainXp(game, 50);
        say(game, 'Inner Voice', [{ speaker: 'Inner Voice', expr: 'sadness', text: ch.reply }]);
      },
    }))
  );
}
