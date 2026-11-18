import { npcOf } from '../../data/npcs';
import { villageOf } from '../../data/zones';
import {
  ORIN_ARC,
  TOMO_ARC,
  ARIA_RESCUES,
  PERSONAL_ARCS,
  NPC_BOND_SCENES,
  PLAYSTYLE_REACTIONS,
  DILEMMAS,
} from '../../data/soul';
import { addItem, earnLexis, healFully } from '../player';
import { addFriendship, addHappiness } from '../village';
import { seasonOf } from '../clock';
import { say, notify } from '../messages';
import { emote } from '../emotes';
import { cue } from '../cues';
import { pickRandom } from '../../../logic/random';
import { ensureSoul } from './state';
import { triggerLexaTurningPoint } from './storyAndBosses';
import { masteredGrammarSpeechLine, heroVoiceCallbackLine, advanceMayoJoke, randomClumsyLexaWhisper } from './lateSoul';

// ---------- Playstyle Tracking (Speed, Absence, Kindness/Cruelty) ----------

export function recordSoulAnswerTiming(game, answerMs) {
  const s = ensureSoul(game);
  if (answerMs <= 3200) {
    s.playstyle.fastAnswers += 1;
    s.playstyle.recentFastStreak += 1;
  } else {
    s.playstyle.slowAnswers += 1;
    s.playstyle.recentFastStreak = 0;
  }
}

export function playstyleCategoryOf(game) {
  const s = ensureSoul(game);
  const total = game.counts?.answers || 0;
  const accuracy = total > 0 ? Math.round(((game.counts?.correct || 0) / total) * 100) : 70;
  const away = s.playstyle.wasAwayDays || 0;
  if (away >= 6) return 'absent';
  if ((game.society?.infamy || 0) >= 25) return 'cruel';
  if ((game.counts?.helped || 0) >= 3 && (game.happiness || 50) >= 60) return 'kind';
  if (s.playstyle.fastAnswers >= 8 && accuracy >= 75) return 'fast';
  if (total >= 12 && accuracy < 62) return 'mistakes';
  return null;
}

// ---------- Orin Grief, Grave & Village Elder Successor ----------

export function onOrinDiedSoul(game) {
  const s = ensureSoul(game);
  if (s.orin.mournedDay !== null) return;
  s.orin.mournedDay = game.day;
  s.orin.houseEmptyUntil = game.day + 3;
  if (s.tomo.state === 'normal') s.tomo.state = 'silent';
  if (game.run?.screen === 'play') {
    say(game, 'aria', ORIN_ARC.eulogy);
    triggerLexaTurningPoint(game, 'after_orin');
  } else {
    notify(game, '🕯️ Eldermoor mourns Elder Orin. Return to the square at dawn.', '#d0d0e0');
  }
}

export function orinGravePosition() {
  const orin = npcOf('orin');
  return orin ? { x: orin.x - 1.6, y: orin.y + 1.1 } : null;
}

export function interactOrinGrave(game) {
  const s = ensureSoul(game);
  s.orin.graveRead = true;
  if (s.orin.mournedDay !== null && game.day >= s.orin.houseEmptyUntil && !s.orin.successorAnnounced) {
    s.orin.successorAnnounced = true;
    s.orin.elderSuccessor = 'mira';
    say(game, null, [...ORIN_ARC.graveText, ...ORIN_ARC.successorLine.map((l) => l.text)]);
    return;
  }
  say(game, null, ORIN_ARC.graveText);
}

// ---------- Tomo Multi-Day Grief & English Teaching Arc ----------

export function handleTomoSoulTalk(game) {
  const s = ensureSoul(game);
  if (game.npcs?.orin?.alive !== false) return false;
  if (s.tomo.lastTalkDay === game.day && s.tomo.prompted) return false;
  s.tomo.lastTalkDay = game.day;

  if (s.tomo.state === 'silent' && s.tomo.daysSilent < 2) {
    s.tomo.daysSilent += 1;
    say(game, 'tomo', [TOMO_ARC.silentGreeting]);
    return true;
  }

  if (!s.tomo.prompted) {
    s.tomo.prompted = true;
    say(game, 'tomo', TOMO_ARC.askTeach, [
      {
        label: 'Teach Tomo words in the dust right now',
        icon: 'book',
        run: () => {
          s.tomo.state = 'proud';
          s.tomo.lessonsGiven += 1;
          addFriendship(game, 'tomo', 15);
          addHappiness(game, 3);
          emote(game, 'tomo', 'sparkle');
          say(game, 'tomo', TOMO_ARC.helped);
        },
      },
      {
        label: '"I have urgent battles—ask me another week."',
        icon: 'walk',
        run: () => {
          s.tomo.state = 'bitter';
          addFriendship(game, 'tomo', -10);
          say(game, 'tomo', TOMO_ARC.ignored);
        },
      },
    ]);
    return true;
  }

  if (s.tomo.state === 'proud') {
    say(game, 'tomo', ['Look at my notebook! Seven irregular verbs memorized before breakfast—Grandpa Orin would grin at both of us!']);
    return true;
  }
  if (s.tomo.state === 'bitter') {
    say(game, 'tomo', ['Garrison recruits hold wooden pikes for three hours straight. Nobody stops to quiz them first.']);
    return true;
  }
  return false;
}

// ---------- Raid Memory & Fallen Memorial ----------

export function recordRaidFallenSoul(game, victimNames) {
  const s = ensureSoul(game);
  for (const name of victimNames) {
    if (name && !s.raidMemory.memorialNames.includes(name)) {
      s.raidMemory.memorialNames.push(name);
    }
  }
  if (victimNames.length > 0) {
    s.raidMemory.widowsMourningUntil = Math.max(s.raidMemory.widowsMourningUntil, game.day + 4);
  }
}

export function memorialStonePosition() {
  const sq = villageOf('lexia')?.plan?.square;
  return sq ? { x: sq.x + Math.floor(sq.w / 2) + 1.5, y: sq.y - 0.8 } : { x: 1126, y: 904 };
}

export function readRaidMemorialStone(game) {
  const s = ensureSoul(game);
  const names = s.raidMemory.memorialNames;
  if (names.length === 0) {
    say(game, null, ['Eldermoor Memorial Stone — Uncarved marble awaits peaceful years with no fallen names.']);
    return;
  }
  say(game, null, [
    'On Eldermoor Square stands a smooth grey stone washed clean by rain.',
    'Carved deeply into the grain: ' + names.join(', ') + '.',
    'Fresh wildflowers lie beside the plinth—no raid here goes forgotten.',
  ]);
}

// ---------- Aria 3-Stage Emotional Rescue ----------

export function triggerAriaRescueScene(game, blessingsRemaining) {
  const s = ensureSoul(game);
  const stageIdx = Math.max(0, Math.min(2, 2 - blessingsRemaining));
  s.ariaRescuesShown = Math.max(s.ariaRescuesShown, stageIdx + 1);
  say(game, 'aria', ARIA_RESCUES[stageIdx] || ARIA_RESCUES[2]);
}

// ---------- Personal 4-Step Arcs & Dynamic Playstyle/Season Greetings ----------

export function personalArcChoice(game, npc) {
  const arcData = PERSONAL_ARCS[npc.id];
  if (!arcData) return null;
  const s = ensureSoul(game);
  const progress = s.arcs[npc.id];
  if (!progress || progress.completed || progress.step >= arcData.steps.length) return null;
  const reqFriend = arcData.minFriendships[progress.step] || 0;
  if ((game.npcs[npc.id]?.friendship || 0) < reqFriend) return null;
  const stepData = arcData.steps[progress.step];
  const titles = ['Quiet moment', 'Ask about their wish', 'Listen to their fear', 'Share their secret'];
  const label = (titles[progress.step] || 'Heart-to-heart') + ' (' + npc.name + ')';

  return {
    label,
    icon: 'heart',
    run: () => {
      say(game, npc.id, [{ speaker: npc.id, expr: stepData.expr, song: stepData.song, text: stepData.text }], [
        {
          label: stepData.choiceA.label,
          icon: 'talk',
          run: () => {
            progress.step += 1;
            if (progress.step >= arcData.steps.length) progress.completed = true;
            progress.choiceNotes.push('A');
            addFriendship(game, npc.id, 10);
            emote(game, npc.id, 'heart');
            say(game, npc.id, [{ speaker: npc.id, expr: 'love', text: stepData.choiceA.reply }]);
          },
        },
        {
          label: stepData.choiceB.label,
          icon: 'talk',
          run: () => {
            progress.step += 1;
            if (progress.step >= arcData.steps.length) progress.completed = true;
            progress.choiceNotes.push('B');
            addFriendship(game, npc.id, 7);
            emote(game, npc.id, 'sparkle');
            say(game, npc.id, [{ speaker: npc.id, expr: 'joy', text: stepData.choiceB.reply }]);
          },
        },
      ]);
    },
  };
}

export function soulDynamicGreeting(game, npc) {
  const s = ensureSoul(game);
  if (npc.id === 'aria' && game.chapter >= 4 && !game.bosses?.king && Math.random() < 0.28) {
    return 'Before stepping north into Demon soil, check your poultices carefully... Promise you will come back breathing.';
  }
  if (s.raidMemory.widowsMourningUntil >= game.day && Math.random() < 0.35) {
    return 'The bells still ache from the last raid. Please help us rebuild before next week.';
  }
  if (s.orin.mournedDay !== null && game.day - s.orin.mournedDay <= 4 && Math.random() < 0.35) {
    return 'Elder Orin’s porch looks too empty at dusk... Keep carrying his words forward.';
  }
  if (npc.id === 'hugo' && Math.random() < 0.4) {
    return advanceMayoJoke(game);
  }
  if (npc.id === 'kai' && Math.random() < 0.35) {
    s.legend.gagCount = (s.legend.gagCount || 0) + 1;
    return 'Swear on my boots—a three-meter silver marlin bit clean through my hook five minutes ago!';
  }
  const masteredLine = masteredGrammarSpeechLine(game);
  if (masteredLine && Math.random() < 0.25) return masteredLine;
  const voiceTrait = heroVoiceCallbackLine(game);
  if (voiceTrait && Math.random() < 0.2) return voiceTrait;
  if (Math.random() < 0.04) return randomClumsyLexaWhisper();
  const style = playstyleCategoryOf(game);
  if (style && PLAYSTYLE_REACTIONS[style] && Math.random() < 0.32) {
    if (style === 'absent') s.playstyle.wasAwayDays = 0;
    return pickRandom(PLAYSTYLE_REACTIONS[style]);
  }
  const weather = game.weather?.kind;
  if (weather === 'snow' && Math.random() < 0.25) return 'Wrap your scarf higher—snow drifts fast along stone roofs today.';
  if (weather === 'rain' && Math.random() < 0.25) return 'Rain turns mud roads slick; dry your cloak inside before dusk.';
  const season = seasonOf(game);
  if (season === 'winter' && Math.random() < 0.22) return 'Winter pantry shelves always shrink fast; salted food matters now.';
  return null;
}

// ---------- NPC-to-NPC Bond Scenes ----------

export function bondSceneChoice(game, npc) {
  const s = ensureSoul(game);
  for (const [sceneId, scene] of Object.entries(NPC_BOND_SCENES)) {
    if (s.bondScenes[sceneId]) continue;
    if (npc.id !== scene.npcA && npc.id !== scene.npcB) continue;
    const stateA = game.npcs[scene.npcA];
    const stateB = game.npcs[scene.npcB];
    if (!stateA?.alive || !stateB?.alive) continue;
    if ((stateA.friendship || 0) < 15) continue;
    return {
      label: 'Witness: ' + scene.title,
      icon: 'people',
      run: () => {
        s.bondScenes[sceneId] = 'played';
        say(
          game,
          scene.npcA,
          scene.lines,
          scene.choices.map((ch) => ({
            label: ch.label,
            icon: 'talk',
            run: () => {
              if (ch.rewards.aria) addFriendship(game, 'aria', ch.rewards.aria);
              if (ch.rewards.corvin) addFriendship(game, 'corvin', ch.rewards.corvin);
              if (ch.rewards.mira) addFriendship(game, 'mira', ch.rewards.mira);
              if (ch.rewards.darius) addFriendship(game, 'darius', ch.rewards.darius);
              if (ch.rewards.elara) addFriendship(game, 'elara', ch.rewards.elara);
              if (ch.rewards.lexis) earnLexis(game, ch.rewards.lexis);
              if (ch.rewards.happiness) addHappiness(game, ch.rewards.happiness);
              if (ch.rewards.heal) healFully(game.player);
              if (ch.rewards.item) addItem(game.player, ch.rewards.item);
              say(game, scene.npcA, [ch.reply]);
            },
          }))
        );
      },
    };
  }
  return null;
}

// ---------- World Dilemmas (Raid vs Caravan, Hide Nyx) ----------

export function triggerRaidVsCaravanDilemma(game) {
  const s = ensureSoul(game);
  if (s.dilemmas.raidVsCaravan) return false;
  const dl = DILEMMAS.raidVsCaravan;
  if (game.run?.screen !== 'play' || game.run.dialog) return false;
  say(
    game,
    'garrick',
    dl.lines,
    dl.choices.map((c) => ({
      label: c.label,
      icon: c.icon,
      run: () => {
        s.dilemmas.raidVsCaravan = c.id;
        if (c.id === 'save_village') {
          addHappiness(game, 4);
          addFriendship(game, 'aria', 8);
          addFriendship(game, 'garrick', 8);
          notify(game, '🛡️ Eldermoor held firm through the night—but Westford’s spice cart burned.', '#ffd23f');
        } else {
          earnLexis(game, 160);
          addHappiness(game, -3);
          notify(game, '🪙 Caravan saved (+160 Lexis), though Eldermoor’s barn took scorch marks.', '#ffa94d');
        }
      },
    }))
  );
  return true;
}

export function triggerHideNyxDilemma(game) {
  const s = ensureSoul(game);
  if (s.dilemmas.hideNyx || !game.npcs?.nyx?.alive) return false;
  if (game.run?.screen !== 'play' || game.run.dialog) return false;
  const dl = DILEMMAS.hideNyx;
  say(
    game,
    'nyx',
    dl.lines,
    dl.choices.map((c) => ({
      label: c.label,
      icon: c.icon,
      run: () => {
        s.dilemmas.hideNyx = c.id;
        if (c.id === 'hid') {
          addFriendship(game, 'nyx', 15);
          addFriendship(game, 'garrick', -4);
          notify(game, '💜 You sheltered Nyx under your own roof. She will not forget.', '#d4b3ff');
        } else {
          addFriendship(game, 'nyx', -15);
          addFriendship(game, 'garrick', 6);
          notify(game, '⚖️ Royal patrols led Nyx away under iron parole...', '#9fd8ff');
        }
      },
    }))
  );
  return true;
}
