import { npcOf, NPCS } from '../../data/npcs';
import { zoneAt } from '../../data/zones';
import {
  BOSS_SCENES,
  CHAPTER_STORY_SCENES,
  SOLECIS_WHISPERS,
  LOST_HERO_REFLECTIONS,
  LEXA_SCENES,
  DILEMMAS,
  EPILOGUE_NOTES,
  EARTH_DREAMS_DEEP,
  RETURN_FAREWELLS,
} from '../../data/soul';
import { addFriendship, addHappiness } from '../village';
import { childrenOf } from '../families';
import { say, notify } from '../messages';
import { cue } from '../cues';
import { ensureSoul } from './state';

// ---------- Atmosphere: True Silence Detection ----------

// Returns true when the hero stands inside Silence-ruled territory before Solecis falls.
export function isSilencedZone(game) {
  if (!game?.player || game.bosses?.king) return false;
  const z = zoneAt(game.player.x, game.player.y);
  if (!z) return false;
  if (z.id === 'demon' || z.id === 'castle') return true;
  if (z.kind === 'village' && game.villages?.[z.id]?.owner === 'monsters') return true;
  return false;
}

// ---------- Boss Scenes & Finales ----------

export function hasPreBossScene(game, speciesKey) {
  if (!speciesKey || !BOSS_SCENES[speciesKey]?.before) return false;
  const s = ensureSoul(game);
  return !s.scenesPlayed['boss_before_' + speciesKey];
}

// Plays pre-boss story dialog before entering timed TOEIC combat, then calls proceedFight().
export function maybePlayPreBossScene(game, monster, proceedFight) {
  const species = monster?.species;
  if (!monster?.boss || !hasPreBossScene(game, species)) {
    proceedFight();
    return;
  }
  const s = ensureSoul(game);
  s.scenesPlayed['boss_before_' + species] = true;
  game.run.safeUntil = Date.now() + 2500;
  const lines = [...BOSS_SCENES[species].before];
  if (species === 'king' && !game.npcs?.orin?.alive) {
    lines.push({
      speaker: 'orin',
      expr: 'sadness',
      text: 'Through the marble echo, Elder Orin’s voice carries from Eldermoor’s square: "Finish the sentence, traveler!"',
    });
  }
  say(game, lines[0].speaker || null, lines, [
    { label: 'Raise your weapon — Begin the battle', icon: 'sword', run: () => proceedFight() },
  ]);
}

// Plays post-victory boss story scenes, Lea final-blow moment, and General Barbarism mercy dilemma.
export function onBossVictorySoul(game, bossMonster) {
  const species = bossMonster?.species;
  if (!species) return;
  const s = ensureSoul(game);
  const scene = BOSS_SCENES[species];

  // Mid-boss Demon General (Ravnos / Thamuz / Velmora) -> offer Lea's final blow dilemma once.
  const demonGenerals = ['ravnos', 'thamuz', 'velmora'];
  if (demonGenerals.includes(species) && game.player.party?.includes('lea') && !s.dilemmas.leaBlow) {
    if (scene?.after && !s.scenesPlayed['boss_after_' + species]) {
      s.scenesPlayed['boss_after_' + species] = true;
      say(game, scene.after[0].speaker || null, scene.after);
    }
    const dl = DILEMMAS.leaBlow;
    say(
      game,
      'lea',
      dl.lines,
      dl.choices.map((c) => ({
        label: c.label,
        icon: c.icon,
        run: () => {
          s.dilemmas.leaBlow = c.id;
          addFriendship(game, 'lea', c.id === 'hero_struck' ? 10 : 5);
          notify(
            game,
            c.id === 'lea_struck'
              ? '⚔️ Lea lowered her trembling saber afterward, breathing hard.'
              : '🛡️ Lea leaned against your shoulder, quieter and steadier.',
            '#ffd23f'
          );
        },
      }))
    );
    return;
  }

  // General Barbarism -> Lyra asks to spare or execute.
  if (species === 'general' && !s.dilemmas.spareGeneral) {
    s.scenesPlayed.boss_after_general = true;
    const dl = DILEMMAS.spareGeneral;
    say(
      game,
      'lyra',
      [...(scene?.after || []), ...dl.lines],
      dl.choices.map((c) => ({
        label: c.label,
        icon: c.icon,
        run: () => {
          s.dilemmas.spareGeneral = c.id;
          if (c.id === 'spared') {
            addHappiness(game, 2);
            addFriendship(game, 'lyra', 10);
            notify(game, '🕊️ General Barbarism swore a silent oath to guard coastal roads.', '#7cfc9a');
          } else {
            addHappiness(game, 1);
            addFriendship(game, 'lyra', 4);
            notify(game, '⚔️ Coastal raiders scatter before sunrise.', '#ff8a95');
          }
        },
      }))
    );
    return;
  }

  if (scene?.after && !s.scenesPlayed['boss_after_' + species]) {
    s.scenesPlayed['boss_after_' + species] = true;
    say(game, scene.after[0].speaker || null, scene.after);
  }

  // After Solecis falls -> Lexa returns with final truth & gratitude!
  if (species === 'king' && !s.scenesPlayed.lexa_after_king) {
    s.scenesPlayed.lexa_after_king = true;
    say(game, 'Goddess Lexa', LEXA_SCENES.after_king);
  }
}

// ---------- Chapter Scenes, Lexa Returns & Solecis Whispers ----------

export function onChapterCompleteSoul(game, finishedChapterNumber) {
  const s = ensureSoul(game);
  const key = 'chapter_' + finishedChapterNumber;
  if (s.scenesPlayed[key]) return;
  const lines = CHAPTER_STORY_SCENES[finishedChapterNumber];
  if (lines && game.run?.screen !== 'fight') {
    s.scenesPlayed[key] = true;
    say(game, lines[0].speaker || null, lines);
  }
  // Mid-game twist around Chapter 4+ if Nyx is known or met
  if (finishedChapterNumber >= 4 && !s.scenesPlayed.nyx_twist && (game.npcs?.nyx?.met || game.player?.party?.includes('nyx'))) {
    s.scenesPlayed.nyx_twist = true;
    say(game, 'nyx', LEXA_SCENES.nyx_twist, [
      {
        label: 'Reassure Nyx: "You chose Eldermoor. That is what counts."',
        icon: 'heart',
        run: () => {
          addFriendship(game, 'nyx', 15);
          notify(game, '💜 Nyx exhaled slowly—the weight of two worlds lifted slightly.', '#d4b3ff');
        },
      },
      {
        label: '"Tell me everything else Solecis hid behind the Silence."',
        icon: 'book',
        run: () => {
          addFriendship(game, 'nyx', 8);
          notify(game, '📜 Nyx promises never to withhold a secret again.', '#9fd8ff');
        },
      },
    ]);
  }
}

export function triggerSolecisWhisper(game, whisperKey) {
  const s = ensureSoul(game);
  const flag = 'whisper_' + whisperKey;
  if (s.scenesPlayed[flag] || game.bosses?.king) return;
  const lines = SOLECIS_WHISPERS[whisperKey];
  if (!lines) return;
  s.scenesPlayed[flag] = true;
  if (game.run?.screen === 'play' && !game.run.dialog) {
    say(game, 'Solecis, the Demon King', lines);
  } else {
    notify(game, '🌑 Solecis whispers: "' + lines[0].text.slice(0, 72) + '..."', '#b39ddb');
  }
}

export function onLostHeroPageRead(game, pageIndex) {
  const s = ensureSoul(game);
  const flag = 'lost_hero_refl_' + pageIndex;
  if (s.scenesPlayed[flag]) return;
  s.scenesPlayed[flag] = true;
  const reflection = LOST_HERO_REFLECTIONS[pageIndex];
  if (reflection) {
    say(game, 'Inner Voice', [{ speaker: 'Inner Voice', expr: 'sadness', text: reflection }]);
  }
}

export function triggerLexaTurningPoint(game, key) {
  const s = ensureSoul(game);
  const flag = 'lexa_' + key;
  if (s.scenesPlayed[flag]) return;
  const scene = LEXA_SCENES[key];
  if (!scene) return;
  s.scenesPlayed[flag] = true;
  if (game.run?.screen === 'play' && !game.run.dialog) {
    say(game, 'Goddess Lexa', scene);
  } else {
    notify(game, '✨ Goddess Lexa’s starlight flickers near your collar...', '#ffd23f');
  }
}

// ---------- Deep Earth Past Dreams & Return Portal Farewells ----------

export function maybeTriggerDeepEarthDream(game) {
  const s = ensureSoul(game);
  if (game.day < 2 || game.day % 3 !== 0) return false;
  if (s.moments.dreamIdx >= EARTH_DREAMS_DEEP.length) return false;
  const dream = EARTH_DREAMS_DEEP[s.moments.dreamIdx];
  s.moments.dreamIdx += 1;
  say(game, 'Inner Voice', [{ speaker: 'Inner Voice', expr: 'neutral', text: 'Dream: ' + dream.title }, ...dream.lines]);
  return true;
}

export function offerReturnFarewells(game, onLeaveNow, onStayHere) {
  const s = ensureSoul(game);
  const closeIds = Object.keys(RETURN_FAREWELLS).filter((id) => {
    const st = game.npcs?.[id];
    return st?.alive && (st.friendship >= 40 || game.player.spouse === id || game.player.party?.includes(id));
  });
  const lines = [{ speaker: 'Inner Voice', expr: 'sadness', text: 'Blue Earth starlight hums inside the stone arch. Beyond the glass ripples an ordinary morning back home.' }];
  for (const id of closeIds.slice(0, 4)) {
    s.moments.farewelled[id] = true;
    for (const step of RETURN_FAREWELLS[id]) lines.push(step);
  }
  say(game, closeIds[0] || 'Inner Voice', lines, [
    { label: 'Step through: Return to Earth & pass your TOEIC', icon: 'map', run: () => onLeaveNow() },
    { label: 'Stay in Lexia — this world is home now', icon: 'heart', run: () => onStayHere() },
  ]);
}

// ---------- Character & World Epilogue Generator (SOUL Part 5B) ----------

export function buildEpilogueLines(game) {
  const s = ensureSoul(game);
  const notes = [];
  if (game.npcs?.aria) {
    if (!game.npcs.aria.alive) notes.push(EPILOGUE_NOTES.aria.dead);
    else if (game.player.spouse === 'aria') notes.push(EPILOGUE_NOTES.aria.spouse);
    else notes.push(EPILOGUE_NOTES.aria.alive);
  }
  if (game.npcs?.mira) notes.push(game.npcs.mira.alive ? EPILOGUE_NOTES.mira.alive : EPILOGUE_NOTES.mira.dead);
  if (game.npcs?.yuki) notes.push(game.npcs.yuki.alive ? EPILOGUE_NOTES.yuki.alive : EPILOGUE_NOTES.yuki.dead);
  if (game.npcs?.garrick) notes.push(game.npcs.garrick.alive ? EPILOGUE_NOTES.garrick.alive : EPILOGUE_NOTES.garrick.dead);
  if (game.npcs?.nyx) {
    if (!game.npcs.nyx.alive) notes.push(EPILOGUE_NOTES.nyx.dead);
    else if (s.dilemmas.hideNyx === 'turned_in') notes.push(EPILOGUE_NOTES.nyx.turned_in);
    else notes.push(EPILOGUE_NOTES.nyx.spared);
  }
  if (game.npcs?.lea) {
    if (!game.npcs.lea.alive) notes.push(EPILOGUE_NOTES.lea.dead);
    else if (s.dilemmas.leaBlow === 'lea_struck') notes.push(EPILOGUE_NOTES.lea.leaStruck);
    else notes.push(EPILOGUE_NOTES.lea.heroStruck);
  }
  if (game.npcs?.hugo?.alive) notes.push(EPILOGUE_NOTES.hugo.alive);
  if (game.npcs?.orin) notes.push(game.npcs.orin.alive ? EPILOGUE_NOTES.orin.alive : EPILOGUE_NOTES.orin.dead);
  if (game.npcs?.tomo?.alive) {
    const ts = s.tomo.state === 'proud' ? 'proud' : s.tomo.state === 'bitter' ? 'bitter' : 'normal';
    notes.push(EPILOGUE_NOTES.tomo[ts]);
  }
  if (s.dilemmas.spareGeneral === 'spared') notes.push(EPILOGUE_NOTES.general.spared);
  else if (s.dilemmas.spareGeneral === 'slain') notes.push(EPILOGUE_NOTES.general.slain);

  const kids = (NPCS || []).flatMap((n) => childrenOf(game, n.id).map((k) => k + ' (' + npcOf(n.id).name + ')'));
  if (kids.length > 0) {
    notes.push('A new generation grows safely in Lexia: ' + kids.slice(0, 4).join(', ') + '.');
  }
  if (s.pet?.adopted) {
    notes.push(s.pet.name + ' still curls up beside your front steps every evening, waiting for your boots on the cobbles.');
  }
  if (s.raidMemory.memorialNames.length > 0) {
    notes.push('On Eldermoor Square, names etched in stone remind everyone what peace cost: ' + s.raidMemory.memorialNames.slice(0, 6).join(', ') + '.');
  }
  s.moments.endingSummary = notes;
  cue(game, 'victory');
  return notes;
}
