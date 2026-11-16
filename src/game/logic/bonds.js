import { NPCS, npcOf } from '../data/npcs';
import { HOUSES, HOME_DOOR, doorOf, villageOf, zoneAt } from '../data/zones';
import { bondSentencesByTheme } from '../data/sentences/bonds';
import { pickRandom } from '../../logic/random';
import { propsAround } from '../world/map';
import { DAY_SECONDS, SUNRISE } from './clock';
import { sleepUntilMorning } from './days';
import { makeDuel } from './duels';
import { startFight } from './fight';
import { addBoost } from './boosts';
import { healFully } from './player';
import { addFriendship, addHappiness } from './village';
import { partnerOf } from './families';
import { isAtHome } from './home';
import { practiceAtDummy } from './school';
import { say, notify } from './messages';
import { cue } from './cues';
import { emote } from './emotes';
import { JOKE_STYLES, JOKES, JOKE_TASTES } from './bonds/jokes';
import {
  TRAINING_RANKS,
  CHARACTER_MOVES,
  firstBonds,
  ensureBonds,
  isTrainable,
  trainingOf,
  recomputeRank,
  stationAtTraining,
  recallFromTraining,
  isStationedInTraining,
  stationedInVillage,
  stationedSpot,
  recordCompanionCombat,
  companionRank,
  companionAttackBonus,
  companionSpecialMove,
  companionEffectsList,
  companionStatBonuses,
  addTrainingHours,
  trainingStatusLines,
  movesFor,
} from './bonds/training';

// The bonds with the characters of the story: expressions, voice cues, contextual fill-in-the-blank talks,
// flirting, jokes, couple status, spending nights together, and companion training in village training corners.

export {
  JOKE_STYLES,
  JOKES,
  JOKE_TASTES,
  TRAINING_RANKS,
  CHARACTER_MOVES,
  firstBonds,
  ensureBonds,
  isTrainable,
  trainingOf,
  recomputeRank,
  stationAtTraining,
  recallFromTraining,
  isStationedInTraining,
  stationedInVillage,
  stationedSpot,
  recordCompanionCombat,
  companionRank,
  companionAttackBonus,
  companionSpecialMove,
  companionEffectsList,
  companionStatBonuses,
  movesFor,
};

const LIFE_STEPS = [0, 20, 50, 80];
const COUPLE_FRIENDSHIP = 55;
const MAX_PARTY = 2;

export const EXPRESSIONS = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love', 'disgust', 'neutral'];

const EXPR_TO_EMOTE = {
  joy: 'sparkle',
  love: 'heart',
  sadness: 'sweat',
  anger: '!',
  fear: 'sweat',
  surprise: '!',
  disgust: 'dots',
  neutral: null,
};

const VOICE_MAP = {
  aria: 'voiceHigh',
  luna: 'voiceHigh',
  hana: 'voiceHigh',
  tomo: 'voiceHigh',
  rin: 'voiceHigh',
  yuki: 'voiceSoft',
  elara: 'voiceSoft',
  lila: 'voiceSoft',
  rosa: 'voiceSoft',
  sylvia: 'voiceSoft',
  bea: 'voiceSoft',
  darius: 'voiceDeep',
  garrick: 'voiceDeep',
  brann: 'voiceDeep',
  kai: 'voiceDeep',
  finn: 'voiceDeep',
  orin: 'voiceDeep',
  kael: 'voiceDeep',
  lyra: 'voiceSharp',
  hinata: 'voiceSharp',
  kaelthra: 'voiceSharp',
  mira: 'voiceSharp',
  dorian: 'voiceSharp',
  arthur: 'voiceSharp',
  selene: 'voiceMystic',
  vespera: 'voiceMystic',
  lucien: 'voiceMystic',
  corvin: 'voiceMystic',
  nyx: 'voiceMystic',
};

// Sets the active expression for a character during dialog and plays a matching emote bubble.
export function setExpression(game, npcId, expr) {
  if (!game) return;
  if (!game.run) game.run = {};
  const valid = EXPRESSIONS.includes(expr) ? expr : 'neutral';
  game.run.dialogExpression = { npcId: npcId, expr: valid };
  game.run._bondExprAt = Date.now();
  const bubble = EXPR_TO_EMOTE[valid];
  if (npcId && bubble && game.run.emotes) emote(game, npcId, bubble);
}

export function getExpression(game, npcId) {
  const active = game?.run?.dialogExpression;
  return active && active.npcId === npcId ? active.expr : 'neutral';
}

// Returns a voice sound key in BONDS_SOUNDS for any NPC.
export function voiceSoundFor(npcId) {
  return VOICE_MAP[npcId] || 'voiceSoft';
}

function npcDisplayName(game, npc) {
  if (npc.id === 'corvin' && (game.npcs?.corvin?.told || 0) < 4) return npc.name;
  return npc.id === 'corvin' ? 'Corvin' : npc.name;
}

// Unlocks the next life story line if friendship reached the next step.
function unlockLifeLine(game, npc) {
  const state = game.npcs?.[npc.id];
  if (!state || !npc.life) return null;
  if (state.told >= npc.life.length || state.friendship < LIFE_STEPS[state.told]) return null;
  state.told += 1;
  return npc.life[state.told - 1];
}

// ---------- Contextual Fill-in-the-Blank Chat & Flirt ----------

const CHAT_WIN_LINES = {
  luna: 'Ooh! Talking with you makes every tense click into place like magic!',
  selene: 'Well spoken. Few travelers hold a conversation with such clarity.',
  elara: 'Your words warm the room faster than any kettle on my hearth.',
  darius: 'Ha! Clear, solid, and steady—just like good forged iron.',
  dorian: 'Smooth talker, aren\'t you? Care to join my next caper?',
  arthur: 'Talking like this makes even a long watch feel short, friend.',
  lyra: 'Your speech carries real conviction. The Order could learn from you.',
  hinata: 'Direct and graceful. Speaking with you feels like a clean spar.',
  kaelthra: 'Hah! Sharp words! You actually keep up when things heat up!',
  lucien: 'Magnificent delivery! Every syllable hit its mark on stage!',
  sylvia: 'The leaves seem calmer when you speak with such care.',
  vespera: 'How refreshing—a living voice that does not butcher its own tongue.',
  corvin: 'Lucid, coherent, steady pulse. You are remarkably good medicine.',
  kael: 'Sombre stayed awake the whole time. That means he likes your voice.',
  aria: 'Listening to you always makes Eldermoor feel safe again.',
  nyx: 'I could listen to you talk all night... it beats the silence up north.',
};

const CHAT_LOSE_LINES = {
  selene: 'Hm. You tripped over your own clauses. Read the rules again before we debate.',
  lyra: 'Scattered words lose battles and arguments alike. Gather your thoughts.',
  kaelthra: 'Whoa—that sentence fizzled out mid-cast! Try again with more heat!',
  dorian: 'Whoa there, silver tongue—you just sold yourself out in three seconds!',
  vespera: 'Oof... even my skeletons winced at that phrasing.',
  corvin: 'A mild grammatical fever. Rest a moment and examine the sentence structure.',
  tomo: 'Haha, you got tongue-tied! Even Grandpa speaks faster than that!',
};

function chatWinLine(game, npc) {
  if (isCouple(game, npc.id) || game.player.spouse === npc.id) {
    return 'Just talking with you like this is my favorite part of the day.';
  }
  return CHAT_WIN_LINES[npc.id] || 'That was a wonderful talk—thank you for really listening!';
}

function chatLoseLine(npc, correct) {
  if (CHAT_LOSE_LINES[npc.id]) return CHAT_LOSE_LINES[npc.id];
  if (correct === 0) return 'Er... did we even speak the same language just now? Let us try again later.';
  return 'Almost had it! We got a little tangled up—no harm done, let us talk again soon.';
}

// Starts a conversational word duel (2-3 contextual fill-in-the-blank sentences).
export function contextualChat(game, npc) {
  if (!npc || !game?.npcs?.[npc.id]?.alive) return;
  const bonds = ensureBonds(game);
  const couple = isCouple(game, npc.id) || game.player.spouse === npc.id;
  const pool = couple
    ? [...bondSentencesByTheme('chat'), ...bondSentencesByTheme('couple')]
    : bondSentencesByTheme('chat');

  function win(fight) {
    const firstToday = bonds.chattedDay[npc.id] !== game.day;
    const baseGain = fight.mistakes.length === 0 ? 8 : fight.mistakes.length === 1 ? 6 : 5;
    const gain = firstToday ? baseGain : Math.max(2, Math.floor(baseGain / 2));
    bonds.chattedDay[npc.id] = game.day;
    bonds.dates += 1;
    addFriendship(game, npc.id, gain);
    const expr = couple || (fight.mistakes.length === 0 && game.npcs[npc.id].friendship >= 50) ? 'love' : 'joy';
    setExpression(game, npc.id, expr);
    cue(game, expr === 'love' ? 'heartChime' : voiceSoundFor(npc.id));
    const unlocked = unlockLifeLine(game, npc);
    const lines = [chatWinLine(game, npc)];
    if (unlocked) lines.push(unlocked);
    say(game, npc.id, lines);
  }

  function lose(fight) {
    if (fight.correct > 0) addFriendship(game, npc.id, 1);
    const expr = fight.correct === 0 ? 'disgust' : 'sadness';
    setExpression(game, npc.id, expr);
    cue(game, expr === 'disgust' ? 'groan' : voiceSoundFor(npc.id));
    say(game, npc.id, [chatLoseLine(npc, fight.correct)]);
  }

  cue(game, voiceSoundFor(npc.id));
  startFight(
    game,
    makeDuel(npc, {
      title: 'Deep Chat',
      category: 'vocabulary',
      tag: 'normal',
      questions: pool,
      health: 3,
      speed: 11,
      onWin: win,
      onLose: lose,
    }),
  );
}

const FLIRT_WIN_LINES = {
  aria: 'W-wait... if you say things like that with a straight face, my heart will not keep up!',
  luna: 'My spellbook just floated out of my hands! You are dangerous with words...',
  selene: '*Clears throat softly, hiding a faint blush* ...That was unexpectedly eloquent.',
  elara: 'Oh my... careful, traveler. One more line like that and I might brew us tea for two.',
  lyra: '*Blinks in surprise, cheeks warming* ...Even a paladin can be caught off guard.',
  hinata: 'That struck faster than my draw... you fight unfairly with your smile.',
  kaelthra: 'Hah! Bold words! Alright, you definitely got my attention now!',
  dorian: 'Whoa—normally I am the one stealing hearts. Keep talking like that.',
  arthur: 'I—uh—the gate is very lucky to have visitors like you! *smiles shyly*',
  nyx: '*Pulls hood slightly over her smiling face* ...Say it again. Slowly.',
  vespera: 'Oh, you warm-blooded flatterer... why did my pulse just skip?',
  sylvia: 'Even the blossoms leaned closer to hear what you just said.',
  lucien: 'Aha! My mask cannot hide this blush—what a dazzling performance!',
  darius: 'Ha! Better than forged gold... you sure know how to heat up the room.',
  kael: '*Looks away, ears red* ...Sombre agrees. Do not stop talking.',
  rin: 'Nya?! Smooth! If you keep flirting like that, I might forget to charge you!',
  mira: '*Drops hammer with a clang* ...Careful! You nearly melted my anvil!',
  yuki: 'Shh! My face is brighter than the lamp... wait, do not go yet.',
  hana: 'Oh! My cheeks are redder than ripe carrots now!',
};

// Romantic fill-in-the-blank duel ('flirt' theme).
export function flirtWith(game, npc) {
  if (!npc || !game?.npcs?.[npc.id]?.alive) return;
  if (!npc.romance || npc.child) {
    setExpression(game, npc.id, 'surprise');
    cue(game, voiceSoundFor(npc.id));
    say(game, npc.id, ['Whoa there! Flattery is nice, though my heart is not looking for romance.']);
    return;
  }
  const bonds = ensureBonds(game);
  const couple = isCouple(game, npc.id) || game.player.spouse === npc.id;
  const pool = couple
    ? [...bondSentencesByTheme('flirt'), ...bondSentencesByTheme('couple')]
    : bondSentencesByTheme('flirt');

  function win(fight) {
    const firstToday = bonds.flirtedDay[npc.id] !== game.day;
    const fGain = firstToday ? (fight.mistakes.length === 0 ? 8 : 6) : 3;
    const rGain = fight.mistakes.length === 0 ? 12 : 8;
    bonds.flirtedDay[npc.id] = game.day;
    bonds.romance[npc.id] = Math.min(100, (bonds.romance[npc.id] || 0) + rGain);
    bonds.dates += 1;
    addFriendship(game, npc.id, fGain);
    const expr = couple || game.npcs[npc.id].friendship >= 40 ? 'love' : 'surprise';
    setExpression(game, npc.id, expr);
    cue(game, expr === 'love' ? 'heartChime' : 'gasp');
    const unlocked = unlockLifeLine(game, npc);
    const lines = [FLIRT_WIN_LINES[npc.id] || '*Blushes warmly* You have a wonderful way with words...'];
    if (unlocked) lines.push(unlocked);
    say(game, npc.id, lines);
  }

  function lose(fight) {
    const expr = fight.correct === 0 ? 'disgust' : 'sadness';
    setExpression(game, npc.id, expr);
    cue(game, 'groan');
    say(game, npc.id, [
      fight.correct === 0
        ? 'Oh dear... that line tripped over every word on its way out. Try again tomorrow!'
        : 'Sweet effort, though the grammar stumbled right at the romantic part!',
    ]);
  }

  cue(game, voiceSoundFor(npc.id));
  startFight(
    game,
    makeDuel(npc, {
      title: 'Romantic Talk',
      category: 'wordForms',
      tag: 'normal',
      questions: pool,
      health: 2,
      speed: 11,
      onWin: win,
      onLose: lose,
    }),
  );
}

// ---------- Jokes ----------

function performJoke(game, npc, style) {
  const bonds = ensureBonds(game);
  if (bonds.jokedDay[npc.id] === game.day) {
    setExpression(game, npc.id, 'neutral');
    cue(game, voiceSoundFor(npc.id));
    say(game, npc.id, ['You already told me a joke today! Save a fresh one for tomorrow.']);
    return false;
  }

  const matching = JOKES.filter((item) => item.style === style);
  const joke = pickRandom(matching.length > 0 ? matching : JOKES);
  const taste = JOKE_TASTES[npc.id] || {
    likes: ['pun'],
    dislikes: ['dark'],
    laugh: ['"Haha, that was a good one!"'],
    groan: ['"Ugh... please keep that kind of joke to yourself."'],
    neutral: ['"Hehe, decent enough."'],
  };

  bonds.jokedDay[npc.id] = game.day;
  const state = game.npcs[npc.id];

  if (taste.likes.includes(style)) {
    addFriendship(game, npc.id, 5);
    const expr = style === 'sweet' && (npc.romance || isCouple(game, npc.id)) ? 'love' : 'joy';
    setExpression(game, npc.id, expr);
    cue(game, 'laugh');
    say(game, npc.id, [joke.text, pickRandom(taste.laugh)]);
    return true;
  }

  if (taste.dislikes.includes(style)) {
    state.friendship = Math.max(0, state.friendship - 2);
    const angryIds = ['lyra', 'kaelthra', 'garrick', 'arthur', 'hinata', 'corvin', 'brann'];
    const expr = style === 'dark' || angryIds.includes(npc.id) ? 'anger' : 'disgust';
    setExpression(game, npc.id, expr);
    cue(game, 'groan');
    say(game, npc.id, [joke.text, pickRandom(taste.groan)]);
    return false;
  }

  addFriendship(game, npc.id, 1);
  setExpression(game, npc.id, 'surprise');
  cue(game, voiceSoundFor(npc.id));
  say(game, npc.id, [joke.text, pickRandom(taste.neutral)]);
  return true;
}

// Tells a joke (1 per day per character). Pass `style` directly or omit to choose from a menu.
export function tellJoke(game, npc, style = null) {
  if (!npc || !game?.npcs?.[npc.id]?.alive) return false;
  const bonds = ensureBonds(game);
  if (bonds.jokedDay[npc.id] === game.day) {
    setExpression(game, npc.id, 'neutral');
    cue(game, voiceSoundFor(npc.id));
    say(game, npc.id, ['You already shared a joke with me today! Come back tomorrow with a new one.']);
    return false;
  }
  if (style) return performJoke(game, npc, style);

  say(
    game,
    npc.id,
    ['What kind of joke would you like to tell ' + npcDisplayName(game, npc) + '?'],
    [
      ...JOKE_STYLES.map((item) => ({ label: item.label, icon: 'talk', run: () => performJoke(game, npc, item.id) })),
      { label: 'Never mind', run: () => {} },
    ],
  );
  return true;
}

// ---------- Couples & Spending Nights Together ----------

export function isCouple(game, npcId) {
  return Boolean(ensureBonds(game).couples[npcId]);
}

export function canAskCouple(game, npc) {
  if (!npc || !npc.romance || npc.child) return false;
  const state = game.npcs?.[npc.id];
  if (!state || !state.alive) return false;
  if (game.player.spouse !== null || partnerOf(game, npc.id) !== null || isCouple(game, npc.id)) return false;
  return state.friendship >= COUPLE_FRIENDSHIP;
}

export function askCouple(game, npc) {
  if (!npc || !game?.npcs?.[npc.id]?.alive) return false;
  const state = game.npcs[npc.id];
  if (!npc.romance || npc.child) {
    setExpression(game, npc.id, 'surprise');
    cue(game, voiceSoundFor(npc.id));
    say(game, npc.id, ['Wait—become a couple? Sorry, I only see us as friends.']);
    return false;
  }
  if (game.player.spouse !== null || partnerOf(game, npc.id) !== null) {
    setExpression(game, npc.id, 'sadness');
    cue(game, voiceSoundFor(npc.id));
    say(game, npc.id, ['Our hearts are already bound elsewhere.']);
    return false;
  }
  if (isCouple(game, npc.id)) {
    setExpression(game, npc.id, 'love');
    cue(game, 'heartChime');
    say(game, npc.id, ['Silly—we are already a couple!']);
    return true;
  }
  if (state.friendship < COUPLE_FRIENDSHIP) {
    setExpression(game, npc.id, 'surprise');
    cue(game, voiceSoundFor(npc.id));
    say(game, npc.id, ['I care about you, truly... let us get to know each other a bit better first. (' + state.friendship + '/' + COUPLE_FRIENDSHIP + ' friendship)']);
    return false;
  }

  const bonds = ensureBonds(game);
  bonds.couples[npc.id] = { sinceDay: game.day, nights: 0 };
  bonds.romance[npc.id] = Math.max(60, bonds.romance[npc.id] || 0);
  addFriendship(game, npc.id, 8);
  addHappiness(game, 2);
  setExpression(game, npc.id, 'love');
  emote(game, npc.id, 'heart');
  cue(game, 'heartChime');
  notify(game, '💕 You and ' + npc.name + ' are now a couple!', '#ff9ec4');
  say(game, npc.id, [
    'Yes... I have been hoping you would ask. From today on, my hand is yours.',
    '(You can now spend the night together at your home, at an inn, or at an active camp.)',
  ]);
  return true;
}

export function canSpendNight(game, npc) {
  if (!npc || !game?.npcs?.[npc.id]?.alive) return false;
  return isCouple(game, npc.id) || game.player.spouse === npc.id;
}

// Detects whether the player is at home, at an inn, or at an active camp.
export function nightSpotOf(game) {
  const player = game.player;
  if (isAtHome(game) || Math.hypot(player.x - HOME_DOOR.x, player.y - HOME_DOOR.y) <= 4) return 'home';

  const nearInn = HOUSES.some((house) => {
    if (house.role !== 'inn') return false;
    const door = doorOf(house);
    return Math.hypot(door.x + 0.5 - player.x, door.y + 1.5 - player.y) <= 5;
  });
  if (nearInn) return 'inn';

  const camp = game.camp;
  if (camp) {
    if (camp.active === true) return 'camp';
    if (camp.active && typeof camp.active === 'object') {
      if (camp.active.x === undefined || Math.hypot(camp.active.x - player.x, camp.active.y - player.y) <= 6) return 'camp';
    }
    if (camp.x !== undefined && camp.y !== undefined && Math.hypot(camp.x - player.x, camp.y - player.y) <= 6) return 'camp';
    if (camp.spot && Math.hypot(camp.spot.x - player.x, camp.spot.y - player.y) <= 6) return 'camp';
  }
  const nearCampProp = propsAround(player.x, player.y, 4).some((prop) => prop.kind === 'campfire' || prop.kind === 'tent' || prop.kind === 'bigTent');
  if (nearCampProp) return 'camp';
  return null;
}

function clearCompanionFatigue(game, npcId) {
  if (game.player.fatigue !== undefined) game.player.fatigue = 0;
  if (game.npcs?.[npcId]?.fatigue !== undefined) game.npcs[npcId].fatigue = 0;
  if (game.camp && typeof game.camp === 'object') {
    if (game.camp.fatigue && typeof game.camp.fatigue === 'object') {
      game.camp.fatigue[npcId] = 0;
      for (const id of game.player.party || []) game.camp.fatigue[id] = 0;
    }
    if (game.camp.tired && typeof game.camp.tired === 'object') {
      delete game.camp.tired[npcId];
      for (const id of game.player.party || []) delete game.camp.tired[id];
    }
  }
  const bonds = ensureBonds(game);
  if (bonds.fatigue) bonds.fatigue[npcId] = 0;
}

function morningLineFor(npc, spot) {
  const bySpot = {
    home: 'Morning already? Waking up beside you under our own roof makes the whole world feel gentle.',
    inn: 'The innkeeper left fresh tea by the door... stay five more minutes before we face the road.',
    camp: 'The embers are still warm, and the dawn sky looks brighter beside you. Ready when you are, love.',
  };
  const custom = {
    aria: 'I listened to your heartbeat all night instead of counting shadows. Good morning, my hero.',
    luna: 'Mm... I dreamed of glowing constellations, and then I woke up next to you!',
    selene: 'Even the brightest stars fade softly beside a quiet morning with you.',
    elara: 'I brewed a sunrise charm last night—turns out just holding your hand worked better.',
    lyra: 'For once I slept without reaching for my sword. Thank you for the peace.',
    hinata: 'Dawn broke gently. Walk with me like this again tonight.',
    kaelthra: 'You are warmer than any hearth fire. Come on—let us conquer today together!',
    dorian: 'Stealing sleep by your side is the best heist I have ever pulled off.',
    arthur: 'Knowing you are safe beside me gives me the strength of ten knights.',
    nyx: 'Sunlight used to scare me... waking up with you makes even morning feel kind.',
    vespera: 'You are so wonderfully warm. Even the quiet night envied us.',
    sylvia: 'The birds woke early to sing over us. Good morning, dearest.',
    lucien: 'No masks, no strings—just morning light and you.',
  };
  return custom[npc.id] || bySpot[spot] || bySpot.home;
}

// Spends the night with a couple partner or spouse (at home, an inn, or an active camp).
export function spendNightTogether(game, npc) {
  if (!npc || !canSpendNight(game, npc)) {
    if (npc) {
      setExpression(game, npc.id, 'surprise');
      say(game, npc.id, ['Spend the night together? Only couples or spouses share a room like that!']);
    }
    return false;
  }
  if (game.raid?.active) {
    notify(game, 'You cannot rest while the village is under attack!', '#ff6060');
    return false;
  }
  const spot = nightSpotOf(game);
  if (!spot) {
    setExpression(game, npc.id, 'neutral');
    cue(game, voiceSoundFor(npc.id));
    say(game, npc.id, ['Let us go to your home, visit an inn, or pitch a camp first to spend the night together.']);
    return false;
  }

  sleepUntilMorning(game);
  healFully(game.player);
  clearCompanionFatigue(game, npc.id);

  // Morning vigor boost for 12 game hours.
  addBoost(game, 'attack', 6, 12, 'morningVigor');
  addBoost(game, 'speed', 2, 12, 'morningVigor');
  addBoost(game, 'defense', 4, 12, 'morningVigor');

  const bonds = ensureBonds(game);
  if (bonds.couples[npc.id]) bonds.couples[npc.id].nights = (bonds.couples[npc.id].nights || 0) + 1;
  bonds.nightCount += 1;

  addFriendship(game, npc.id, 6);
  addHappiness(game, 2);
  setExpression(game, npc.id, 'love');
  emote(game, 'hero', 'heart');
  emote(game, npc.id, 'heart');
  cue(game, 'morningChime');
  notify(game, '🌅 Morning Vigor with ' + npc.name + '! Full HP/MP, fatigue cleared, +6 Atk / +2 Spd / +4 Def (12h).', '#ffb6d9');
  say(game, npc.id, [morningLineFor(npc, spot)]);
  return true;
}

// ---------- Companion Training, Sparring & Menus ----------

export function sparWithCompanion(game, npc) {
  if (!npc || !isTrainable(npc)) return;
  const pool = [...bondSentencesByTheme('chat'), ...bondSentencesByTheme('negotiate')];

  function win() {
    const entry = trainingOf(game, npc.id);
    entry.combats += 1;
    addTrainingHours(game, npc.id, 2);
    addFriendship(game, npc.id, 3);
    setExpression(game, npc.id, 'joy');
    cue(game, 'trainingHit');
    say(game, npc.id, ['What a sharp spar! (+2h training, +1 combat experience — Rank ' + companionRank(game, npc.id) + '/4)']);
  }

  function lose() {
    addTrainingHours(game, npc.id, 1);
    setExpression(game, npc.id, 'neutral');
    cue(game, 'trainingHit');
    say(game, npc.id, ['Good effort! Even a rough drill sharpens our footing. (+1h training)']);
  }

  cue(game, 'trainingHit');
  startFight(
    game,
    makeDuel(npc, {
      title: 'Training Spar',
      category: 'verbTenses',
      tag: 'normal',
      questions: pool,
      health: 2,
      speed: 12,
      onWin: win,
      onLose: lose,
    }),
  );
}

function showTrainingStatus(game, npc) {
  setExpression(game, npc.id, 'joy');
  cue(game, voiceSoundFor(npc.id));
  say(game, npc.id, trainingStatusLines(game, npc));
}

function offerStationTraining(game, npc) {
  const here = zoneAt(game.player.x, game.player.y);
  const currentVillage = here.kind === 'village' ? villageOf(here.id) : null;
  const defaultOptions = [currentVillage, villageOf('lexia'), villageOf('greendale'), villageOf('port')].filter(
    (v, i, arr) => v && v.plan?.training && arr.findIndex((item) => item && item.id === v.id) === i,
  );

  if (currentVillage && defaultOptions.length === 1) {
    stationAtTraining(game, npc.id, currentVillage.id);
    say(game, npc.id, ['I will drill hard at ' + currentVillage.name + '\'s training corner! Spar with me or recall me anytime.']);
    return;
  }

  say(
    game,
    npc.id,
    ['Where should I train at the wooden dummies?'],
    [
      ...defaultOptions.map((v) => ({
        label: v.name + (currentVillage && v.id === currentVillage.id ? ' (here)' : ''),
        icon: 'woodSword',
        run: () => {
          stationAtTraining(game, npc.id, v.id);
          say(game, npc.id, ['Heading to ' + v.name + '\'s training corner now! Watch me grow stronger.']);
        },
      })),
      { label: 'Not now', run: () => {} },
    ],
  );
}

// Dialog choices ready to plug into people.js for any NPC.
export function npcBondChoices(game, npc) {
  if (!npc || !game?.npcs?.[npc.id]?.alive) return [];
  const choices = [
    { label: 'Deep Chat (sentences)', icon: 'book', run: () => contextualChat(game, npc) },
    { label: 'Tell a Joke', icon: 'talk', run: () => tellJoke(game, npc) },
  ];

  if (npc.romance && !npc.child) {
    choices.push({ label: 'Flirt', icon: 'flower', run: () => flirtWith(game, npc) });
  }
  if (canAskCouple(game, npc)) {
    choices.push({ label: 'Become a Couple', icon: 'people', run: () => askCouple(game, npc) });
  }
  if (canSpendNight(game, npc)) {
    choices.push({ label: 'Spend the Night', icon: 'sleep', run: () => spendNightTogether(game, npc) });
  }
  if (isTrainable(npc)) {
    if (isStationedInTraining(game, npc.id)) {
      choices.push({ label: 'Recall from Training', icon: 'woodSword', run: () => recallFromTraining(game, npc.id) });
    } else if ((game.player.party || []).includes(npc.id) || game.npcs[npc.id].friendship >= 50 || game.player.spouse === npc.id || isCouple(game, npc.id)) {
      choices.push({ label: 'Send to Train', icon: 'woodSword', run: () => offerStationTraining(game, npc) });
    }
    choices.push({ label: 'Training Status (Rank ' + companionRank(game, npc.id) + '/4)', icon: 'stats', run: () => showTrainingStatus(game, npc) });
  }
  return choices;
}

// ---------- Main Loop Hooks (update.js, days.js) ----------

export function updateBonds(game, dt) {
  if (!game) return;
  const bonds = ensureBonds(game);
  const dHours = (dt * 24) / DAY_SECONDS;
  let gain = dHours;
  if (game.day === bonds.lastDay && game.hour > bonds.lastHour + 0.05) {
    gain = Math.max(dHours, game.hour - bonds.lastHour);
  }
  bonds.lastDay = game.day;
  bonds.lastHour = game.hour;

  const stationedIds = Object.keys(bonds.training).filter((id) => bonds.training[id]?.stationedAt);
  if (stationedIds.length > 0 && gain > 0) {
    bonds.dayHoursGained += gain;
    for (const id of stationedIds) addTrainingHours(game, id, gain);
  }
}

export function slowBonds(game) {
  if (!game?.run) return;
  if (game.run.dialogExpression && game.run.screen === 'play' && game.run._bondExprAt && Date.now() - game.run._bondExprAt > 6000) {
    game.run.dialogExpression = null;
  }
}

export function newDayBonds(game) {
  if (!game) return;
  const bonds = ensureBonds(game);
  const overnightHours = Math.max(6, 12 - (bonds.dayHoursGained || 0));
  for (const [npcId, entry] of Object.entries(bonds.training)) {
    if (entry && entry.stationedAt) addTrainingHours(game, npcId, overnightHours);
  }
  bonds.dayHoursGained = 0;
  bonds.lastDay = game.day;
  bonds.lastHour = SUNRISE;
}

// ---------- World Action Button Integration ----------

function nearbyStationedTrainee(game) {
  const here = zoneAt(game.player.x, game.player.y);
  if (here.kind !== 'village') return null;
  const trainees = stationedInVillage(game, here.id);
  if (trainees.length === 0) return null;
  for (const id of trainees) {
    const spot = stationedSpot(game, id);
    if (spot && Math.hypot(game.player.x - spot.x, game.player.y - spot.y) < 2.2) return npcOf(id);
  }
  const nearCornerProp = propsAround(game.player.x, game.player.y, 1.8).some((prop) => prop.kind === 'dummy' || prop.kind === 'logs');
  return nearCornerProp ? npcOf(trainees[0]) : null;
}

function nearbyLogsForStationing(game) {
  if (!game.player?.party?.length) return null;
  const here = zoneAt(game.player.x, game.player.y);
  if (here.kind !== 'village' || !villageOf(here.id)?.plan?.training) return null;
  const nearLogs = propsAround(game.player.x, game.player.y, 1.8).some((prop) => prop.kind === 'logs');
  return nearLogs ? here : null;
}

function nearbyPartyPartnerToRest(game) {
  const party = game.player?.party || [];
  const partnerId = party.find((id) => isCouple(game, id) || game.player.spouse === id);
  if (!partnerId) return null;
  const spot = nightSpotOf(game);
  return spot === 'inn' ? npcOf(partnerId) : null;
}

function openTrainingCornerMenu(game, npc) {
  const rank = companionRank(game, npc.id);
  const village = villageOf(trainingOf(game, npc.id).stationedAt);
  say(
    game,
    npc.id,
    [
      npc.name + ' is training at ' + (village ? village.name : 'the corner') + ' (Rank ' + rank + '/4 · ' + trainingOf(game, npc.id).hours.toFixed(1) + 'h · ' + trainingOf(game, npc.id).combats + ' combats).',
    ],
    [
      { label: 'Spar together (+training)', icon: 'woodSword', run: () => sparWithCompanion(game, npc) },
      { label: 'Training Status', icon: 'stats', run: () => showTrainingStatus(game, npc) },
      { label: 'Recall ' + npc.name + (game.player.party.length < MAX_PARTY ? ' to Party' : ''), icon: 'people', run: () => recallFromTraining(game, npc.id) },
      { label: 'Practice Solo (Dummy)', icon: 'book', run: () => practiceAtDummy(game) },
      { label: 'Leave', run: () => {} },
    ],
  );
}

function openPartyStationMenu(game, villageZone) {
  const companions = (game.player.party || []).map((id) => npcOf(id)).filter((npc) => isTrainable(npc));
  if (companions.length === 0) return;
  say(
    game,
    null,
    [villageZone.name + '\'s training logs. Leave a companion here to train?'],
    [
      ...companions.map((npc) => ({
        label: 'Station ' + npc.name + ' here (Rank ' + companionRank(game, npc.id) + '/4)',
        icon: 'woodSword',
        run: () => {
          stationAtTraining(game, npc.id, villageZone.id);
          say(game, npc.id, ['Got it! I will practice on the dummies until you call me back.']);
        },
      })),
      { label: 'Not now', run: () => {} },
    ],
  );
}

export function actionsOfBonds(game) {
  if (!game) return [];
  return [
    {
      when: () => Boolean(nearbyStationedTrainee(game)),
      icon: 'woodSword',
      run: () => openTrainingCornerMenu(game, nearbyStationedTrainee(game)),
    },
    {
      when: () => Boolean(nearbyLogsForStationing(game)),
      icon: 'woodSword',
      run: () => openPartyStationMenu(game, nearbyLogsForStationing(game)),
    },
    {
      when: () => Boolean(nearbyPartyPartnerToRest(game)),
      icon: 'sleep',
      run: () => {
        const partner = nearbyPartyPartnerToRest(game);
        say(game, partner.id, ['Spend the night together here?'], [
          { label: 'Spend the Night together', icon: 'sleep', run: () => spendNightTogether(game, partner) },
          { label: 'Keep traveling', run: () => {} },
        ]);
      },
    },
  ];
}

// Unused import guard: NPCS is exported or useful if callers list all bonded NPCs.
export function bondedNpcs(game) {
  const bonds = ensureBonds(game);
  return NPCS.filter((npc) => bonds.couples[npc.id] || bonds.training[npc.id]?.rank > 0 || bonds.training[npc.id]?.stationedAt);
}
