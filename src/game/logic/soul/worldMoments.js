import { HOME_DOOR, villageOf, zoneAt } from '../../data/zones';
import {
  CAMPFIRE_TALKS,
  WORLD_STORY_QUESTS,
} from '../../data/soul';
import { addItem, earnLexis, gainXp, countItem, removeItem } from '../player';
import { addFriendship, addHappiness } from '../village';
import { say, notify } from '../messages';
import { cue } from '../cues';
import { pickRandom } from '../../../logic/random';
import { ensureSoul } from './state';
import {
  triggerSolecisWhisper,
  triggerLexaTurningPoint,
} from './storyAndBosses';
import {
  orinGravePosition,
  interactOrinGrave,
  memorialStonePosition,
  readRaidMemorialStone,
  triggerHideNyxDilemma,
} from './griefAndPeople';

// ---------- Campfire Companion Conversations ----------

export function triggerCampfireBanter(game) {
  const s = ensureSoul(game);
  if (s.moments.campfireDay === game.day) return false;
  if (!game.player?.party || game.player.party.length === 0) return false;
  if (game.run?.screen !== 'play' && game.run?.screen !== 'dialog') return false;
  s.moments.campfireDay = game.day;
  const talk = pickRandom(CAMPFIRE_TALKS);
  say(game, talk[0].speaker, talk);
  return true;
}

// ---------- Feasts & Weddings With English Speeches ----------

export function triggerWeddingSpeechSoul(game, spouseName) {
  const s = ensureSoul(game);
  s.moments.weddingDay = game.day;
  const elder = s.orin.elderSuccessor === 'mira' ? 'mira' : game.npcs?.orin?.alive ? 'orin' : 'aria';
  say(game, elder, [
    {
      speaker: elder,
      expr: 'joy',
      song: 'aria',
      text: 'Townsfolk ring the handbells on Eldermoor Square! Lanterns sway from the bakery awning to the bridge rail.',
    },
    {
      speaker: elder,
      expr: 'love',
      text: '"May both your winters stay warm, may every argument end before dusk, and may your shared roof outlast every silence! Raise your cups to ' + (game.player?.name || 'the Hero') + ' and ' + spouseName + '!"',
    },
  ]);
}

export function triggerFeastSpeechSoul(game, villageName) {
  const s = ensureSoul(game);
  const toast = s.orin.mournedDay !== null
    ? '"Lift your plates first for those whose seats stand empty tonight... and then laugh twice as loudly for those still at this table!"'
    : '"To ' + villageName + '—to bread warm from the oven, steady walls, and neighbors who answer each other in clear English!"';
  say(game, null, ['A toast rings across ' + villageName + '’s feast tables:', toast]);
}

// ---------- Grown Children Remembering What Hero Did For Their Parents ----------

export function grownChildSoulGreeting(game, kidName, parentIds) {
  const pNames = (parentIds || []).map((id) => (id === 'player' ? 'you' : id)).join(' & ');
  if (pNames) {
    return 'Thank you for keeping ' + pNames + ' safe while I grew up. I practice my sword form at sunrise now!';
  }
  return 'I remember your boots passing the square when I was knee-high! Now I help guard Eldermoor too.';
}

// ---------- Faithful Stray Companion Animal Waiting At Home Door ----------

export function strayPetPosition() {
  return { x: HOME_DOOR.x + 1.8, y: HOME_DOOR.y + 0.85 };
}

export function interactStrayPet(game) {
  const s = ensureSoul(game);
  const pet = s.pet;
  if (!pet.met) {
    pet.met = true;
    say(game, null, ['A scruffy sandy-eared stray dog sits quietly beside your front step, thumping its tail once against the cobbles.'], [
      {
        label: 'Share bread & adopt the stray ("Welcome home, Mochi!")',
        icon: 'bread',
        run: () => {
          if (countItem(game.player, 'bread') > 0) removeItem(game.player, 'bread', 1);
          pet.adopted = true;
          pet.fedDay = game.day;
          addHappiness(game, 2);
          cue(game, 'coin');
          notify(game, '🐾 ' + pet.name + ' now guards your porch happily!', '#ffd23f');
        },
      },
      {
        label: 'Scratch behind its ears and step inside',
        icon: 'people',
        run: () => {
          pet.pettedDay = game.day;
          notify(game, '🐾 The stray wags patiently by your door.', '#9fd8ff');
        },
      },
    ]);
    return;
  }

  pet.pettedDay = game.day;
  const moodLine = pet.adopted
    ? pet.name + ' presses warm ears into your palm, eyes bright beside your doorway.'
    : 'The stray dog watches your steps hopefully from your porch.';
  say(game, null, [moodLine], [
    ...(!pet.adopted
      ? [{
          label: 'Adopt Mochi permanently',
          icon: 'heart',
          run: () => {
            pet.adopted = true;
            notify(game, '🐾 ' + pet.name + ' happily made your doorstep home!', '#ffd23f');
          },
        }]
      : [{
          label: 'Toss dried meat or bread (Pet morale +3)',
          icon: 'bread',
          run: () => {
            pet.fedDay = game.day;
            addHappiness(game, 1);
            notify(game, '🐾 ' + pet.name + ' devours the treat and bounds around the steps!', '#7cfc9a');
          },
        }]),
    { label: 'Head on', run: () => {} },
  ]);
}

// ---------- Story & Reactive Side Quests (SOUL Part 6B / 6C) ----------

export function soulStoryQuestChoices(game, npc) {
  const s = ensureSoul(game);
  const res = [];

  // Part 6B: Twist on "A letter to the coast" (Garrick/Rosa) once 'letter' quest finished
  if ((npc.id === 'rosa' || npc.id === 'garrick') && game.quests?.letter?.done && !s.sideStories.letterTwistSeen) {
    res.push({
      label: 'Ask quietly about the postscript on Garrick’s letter',
      icon: 'mail',
      run: () => {
        s.sideStories.letterTwistSeen = true;
        addFriendship(game, npc.id, 8);
        say(game, npc.id, [
          npc.id === 'rosa'
            ? 'Rosa folds the frayed envelope with shaking fingers. "Notice the harbor stamp beneath his signature? My older sister aboard the Seabridge brig never docked home—he wrote to keep me breathing through winter."'
            : 'Garrick stares down at his gauntlet. "Her sister’s brig went missing three autumns ago. I still write letters into empty waves so Rosa lights the porch lamp each evening."',
        ]);
      },
    });
  }

  // Part 6B: Monsters under the bed (Aria in Eldermoor)
  if (npc.id === 'aria' && !s.sideStories.underBed.done && game.day >= 2) {
    res.push({
      label: 'Side story: "Monsters under the bed"',
      icon: 'quests',
      run: () => {
        const q = WORLD_STORY_QUESTS.underBed;
        say(game, 'aria', [...q.offerLines, ...q.resolveLines], [
          {
            label: 'Comfort the family & leave chamomile medicine',
            icon: 'heart',
            run: () => {
              s.sideStories.underBed.done = true;
              addFriendship(game, 'aria', 10);
              addHappiness(game, 4);
              earnLexis(game, 70);
              gainXp(game, 45);
              notify(game, '📜 Completed: Monsters Under the Bed (+70 Lexis, +45 XP)', '#7cfc9a');
            },
          },
        ]);
      },
    });
  }

  // Part 6B: Thieves of words (Yuki in Eldermoor)
  if (npc.id === 'yuki' && !s.sideStories.wordThieves.done && game.day >= 3) {
    res.push({
      label: 'Side story: "Thieves of words"',
      icon: 'book',
      run: () => {
        const q = WORLD_STORY_QUESTS.wordThieves;
        say(game, 'yuki', q.offerLines, [
          {
            label: 'Feed them bread & teach them behind Yuki’s desk',
            icon: 'bread',
            run: () => {
              s.sideStories.wordThieves.done = true;
              s.sideStories.wordThieves.choice = 'fed';
              addFriendship(game, 'yuki', 12);
              addHappiness(game, 4);
              earnLexis(game, 65);
              say(game, 'yuki', [q.feedReply]);
            },
          },
          {
            label: 'Reclaim the parchment strictly for town law',
            icon: 'shield',
            run: () => {
              s.sideStories.wordThieves.done = true;
              s.sideStories.wordThieves.choice = 'punished';
              addFriendship(game, 'yuki', 5);
              earnLexis(game, 95);
              say(game, 'yuki', [q.punishReply]);
            },
          },
        ]);
      },
    });
  }

  // Part 6C: Lost dog after raid (Bea in Eldermoor)
  if (npc.id === 'bea' && game.raid?.count > 0 && !s.sideStories.lostDog.done) {
    res.push({
      label: 'Lost dog after the raid',
      icon: 'quests',
      run: () => {
        s.sideStories.lostDog.done = true;
        addHappiness(game, 5);
        addFriendship(game, 'bea', 10);
        earnLexis(game, 60);
        addItem(game.player, 'bread', 2);
        say(game, 'bea', [...WORLD_STORY_QUESTS.lostDog.lines, 'Old Bea wraps two hot loaves of sourdough for returning the terrier safe.']);
      },
    });
  }

  // Part 6C: Baker's child (Bea after sickness/raid)
  if (npc.id === 'bea' && s.raidMemory.memorialNames.length > 0 && !s.sideStories.bakersChild.done) {
    res.push({
      label: 'Help the baker’s apprentice boy at the oven',
      icon: 'bread',
      run: () => {
        s.sideStories.bakersChild.done = true;
        addHappiness(game, 4);
        earnLexis(game, 50);
        say(game, 'bea', ['Together you knead twenty uneven loaves with a trembling apprentice boy while the village smells warm again.']);
      },
    });
  }

  return res;
}

// ---------- Daily, Hourly, Slow & Proximity Action Hooks ----------

export function dailySoul(game) {
  const s = ensureSoul(game);
  const z = game.player ? zoneAt(game.player.x, game.player.y) : null;
  if (z && z.kind === 'village' && z.id === 'lexia') {
    s.playstyle.lastEldermoorDay = game.day;
    s.playstyle.wasAwayDays = 0;
  } else {
    s.playstyle.wasAwayDays = Math.max(0, game.day - (s.playstyle.lastEldermoorDay || game.day));
  }

  // Delayed consequence: if Barbarism was spared, he protects coastal caravans passively!
  if (s.dilemmas.spareGeneral === 'spared' && !s.dilemmas.delayedConvoyHelped && game.day >= 6) {
    s.dilemmas.delayedConvoyHelped = true;
    addHappiness(game, 2);
    earnLexis(game, 75);
    notify(game, '🛡️ Ex-raiders under Barbarism escorted a coastal salt cart safely! (+75 Lexis)', '#7cfc9a');
  }

  // Whispers on conquest or 3 raids
  const anyConquered = Object.values(game.villages || {}).some((v) => v.owner === 'monsters');
  if (anyConquered) triggerSolecisWhisper(game, 'conquest_first');
  if ((game.raid?.count || 0) >= 3) triggerSolecisWhisper(game, 'raids_three');
}

export function hourlySoul(game) {
  ensureSoul(game);
}

// Checks proximity to Demon Lands / Conquered Silence towns / Memorials for atmospheric prompts.
export function slowSoul(game) {
  if (!game?.player || game.run?.screen !== 'play') return;
  const s = ensureSoul(game);
  const z = zoneAt(game.player.x, game.player.y);
  if (!z) return;

  if (z.id === 'demon' && !s.scenesPlayed.whisper_demon_border) {
    triggerSolecisWhisper(game, 'demon_border');
  }
  if (z.id === 'castle' && !s.scenesPlayed.lexa_before_castle) {
    triggerLexaTurningPoint(game, 'before_castle');
  }

  // Entering conquered village -> eerie Silence arrival notice
  const vId = z.kind === 'village' ? z.id : null;
  if (vId && game.villages?.[vId]?.owner === 'monsters' && !s.silence.conqueredWarned[vId]) {
    s.silence.conqueredWarned[vId] = true;
    notify(game, '🌑 Silence blankets ' + (villageOf(vId)?.name || vId) + '. Painted signs stand blank and villagers stay mute.', '#9aa6b8');
  } else if (vId && game.villages?.[vId]?.owner === 'people' && s.silence.conqueredWarned[vId] && !s.silence.freedCelebrated[vId]) {
    s.silence.freedCelebrated[vId] = true;
    addHappiness(game, 4);
    notify(game, '🔔 Colors, bells, and warm voices return to ' + (villageOf(vId)?.name || vId) + '!', '#ffd23f');
  }

  // Trigger Hide Nyx dilemma mid-game inside Eldermoor evening if Nyx met/party & chapter >= 3
  if (vId === 'lexia' && game.chapter >= 3 && game.hour >= 19 && game.npcs?.nyx?.met && !s.dilemmas.hideNyx && Math.random() < 0.08) {
    triggerHideNyxDilemma(game);
  }
}

export function actionsOfSoul(game) {
  const s = ensureSoul(game);
  const p = game.player;
  if (!p) return [];
  const orinPos = orinGravePosition();
  const stonePos = memorialStonePosition();
  const petPos = strayPetPosition();

  const actions = [];
  if (game.npcs?.orin?.alive === false && orinPos) {
    actions.push({
      when: () => Math.hypot(p.x - orinPos.x, p.y - orinPos.y) < 1.8,
      icon: 'flower',
      run: () => interactOrinGrave(game),
    });
  }
  if (s.raidMemory.memorialNames.length > 0) {
    actions.push({
      when: () => Math.hypot(p.x - stonePos.x, p.y - stonePos.y) < 1.8,
      icon: 'book',
      run: () => readRaidMemorialStone(game),
    });
  }
  actions.push({
    when: () => Math.hypot(p.x - petPos.x, p.y - petPos.y) < 1.5,
    icon: 'heart',
    run: () => interactStrayPet(game),
  });
  return actions;
}
