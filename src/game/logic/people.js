import { NPCS } from '../data/npcs';
import { PLAZAS, FIELDS, zoneAt, insideOf } from '../data/zones';
import { propsAround } from '../world/map';
import { findPath, followPath } from '../world/paths';
import { isEncountered } from './encounters';
import { guildChoice } from './guild';
import { LESSON_PRICE, LESSON_FRIENDSHIP, POWERS } from '../data/powers';
import { ITEMS } from '../data/items';
import { pickRandom } from '../../logic/random';
import { isSolid } from '../world/map';
import { isNight } from './clock';
import { facingOf } from './input';
import { passHours } from './days';
import { addFriendship, addHappiness, shareFeelings } from './village';
import { classChoice } from './classes';
import { schoolChoice, teacherChoice } from './school';
import { sparringChoice } from './sparring';
import { marry, partnerOf, childrenOf } from './families';
import { activeQuestOf, offeredQuest, isQuestReady, questProgress, startQuest, finishQuest } from './quests';
import { workAsScribe, playWordSprint } from './duels';
import { countItem, removeItem } from './player';
import { say, notify } from './messages';
import { emote } from './emotes';
import { cue } from './cues';
import { burst } from './particles';
import { startFight } from './fight';
import { isNpcKidnapped } from './war';
import { revealCrystalCave, isVillain } from './society';
import { addInfamy } from './society/state';
import { isStationedInTraining, setExpression, voiceSoundFor, npcBondChoices } from './bonds';

// The people on the map: where they are, and everything the player can do with them.

export const FRIEND_STEPS = [0, 20, 50, 80]; // the friendship needed to hear each line of their life
const RECRUIT_FRIENDSHIP = 50;
const DATE_FRIENDSHIP = 50;
const PROPOSE_FRIENDSHIP = 80;
const MAX_PARTY = 2;
const TALK_RANGE = 1.5; // tiles

// ---------- Where they are ----------

const SLEEP_FROM = 22; // the people of the villages sleep (inside, not on the map) from 22:00...
const SLEEP_UNTIL = 6; // ...to 6:00
const ERRAND_EVERY = [30, 90]; // seconds between two walks of a person (to the square, the well, a neighbor...)

// Where someone lives: their spot in data/npcs.js. Married to the hero: inside the home of the hero.
function homeOf(game, npc) {
  if (game.player.spouse === npc.id) {
    const home = insideOf('home');
    return { x: home.x + 6.5, y: home.y + 5.5 };
  }
  return { x: npc.x, y: npc.y };
}

// Puts everyone at home (when the game opens).
export function placePeople(game) {
  for (const npc of NPCS) {
    const home = homeOf(game, npc);
    game.run.people[npc.id] = { x: home.x, y: home.y, walkX: 0, walkY: 0, walkTime: 0, step: 0, dir: 'down', path: null, errandTime: 10 + Math.random() * 60, away: false };
  }
}

function isSleepTime(game) {
  return game.hour >= SLEEP_FROM || game.hour < SLEEP_UNTIL;
}

// On the map right now? Alive, not following the hero, not carried, and:
// a night person only at night, a wanderer only when met on the road, a guild member never (they are in the guild),
// the others not at night (they sleep). A KO person lies where they fell.
export function isOutside(game, npc) {
  const state = game.npcs[npc.id];
  if (!state.alive || game.player.party.includes(npc.id) || game.player.carrying?.id === npc.id) return false;
  if (isNpcKidnapped(game, npc.id) || isStationedInTraining(game, npc.id)) return false;
  if (state.ko) return true;
  if (game.player.spouse === npc.id) return true;
  if (npc.wanderer) return isEncountered(game, npc.id);
  if (npc.guild) return false;
  if (npc.nightOnly) return isNight(game);
  return !isSleepTime(game);
}

function pickWalk(place) {
  const angle = Math.random() * Math.PI * 2;
  const isResting = Math.random() < 0.5;
  place.walkX = isResting ? 0 : Math.cos(angle);
  place.walkY = isResting ? 0 : Math.sin(angle);
  place.walkTime = 1 + Math.random() * 3;
}

// A slow walk around home. Too far, they come back.
function strollPerson(game, npc, dt) {
  const place = game.run.people[npc.id];
  const home = homeOf(game, npc);
  const fromHome = Math.hypot(place.x - home.x, place.y - home.y);
  place.walkTime -= dt;
  if (place.walkTime <= 0) pickWalk(place);
  if (fromHome > 2) {
    place.walkX = (home.x - place.x) / fromHome;
    place.walkY = (home.y - place.y) / fromHome;
  }
  const x = place.x + place.walkX * 0.7 * dt;
  const y = place.y + place.walkY * 0.7 * dt;
  if (!isSolid(x, y)) {
    place.x = x;
    place.y = y;
  }
  place.walking = place.walkX !== 0 || place.walkY !== 0;
  if (place.walking) {
    place.step += dt * 6;
    place.dir = facingOf(place.walkX, place.walkY);
  }
}

// The places a person of a village walks to: the squares, the wells, the fields of their village.
function errandSpots(npc) {
  const zone = zoneAt(npc.x, npc.y);
  if (zone.kind !== 'village') return [];
  const spots = [...PLAZAS, ...FIELDS].filter((item) => zoneAt(item.x, item.y).id === zone.id).map((item) => ({ x: item.x + Math.floor(item.w / 2), y: item.y + item.h }));
  const wells = propsAround(npc.x, npc.y, 60).filter((prop) => prop.kind === 'well' && zoneAt(prop.x, prop.y).id === zone.id).map((prop) => ({ x: prop.x, y: prop.y + 1 }));
  return [...spots, ...wells];
}

// From time to time, a person walks somewhere in their village (by the streets), stays a moment, comes back.
function runErrands(game, npc, dt) {
  const place = game.run.people[npc.id];
  if (place.path) {
    if (followPath(place, 1.3, dt)) {
      place.path = null;
      place.errandTime = place.away ? 8 + Math.random() * 12 : ERRAND_EVERY[0] + Math.random() * (ERRAND_EVERY[1] - ERRAND_EVERY[0]);
    }
    return true;
  }
  place.errandTime -= dt;
  if (place.errandTime > 0) return false;
  const home = homeOf(game, npc);
  const spots = errandSpots(npc);
  if (place.away || spots.length === 0) {
    place.path = findPath(place.x, place.y, home.x, home.y, 1500);
    place.away = false;
  } else {
    const spot = pickRandom(spots);
    place.path = findPath(place.x, place.y, spot.x, spot.y, 1500);
    place.away = place.path !== null;
  }
  if (!place.path) place.errandTime = 20;
  return place.path !== null;
}

export function updatePeople(game, dt) {
  const player = game.player;
  for (const npc of NPCS) {
    const place = game.run.people[npc.id];
    const isVisible = isOutside(game, npc);
    game.run.visible[npc.id] = isVisible;
    if (!isVisible || game.npcs[npc.id].ko) continue;
    const isListening = Math.hypot(place.x - player.x, place.y - player.y) < TALK_RANGE; // the player is near: stay
    if (isListening) {
      place.walking = false;
      place.dir = facingOf(player.x - place.x, player.y - place.y); // they turn to the player
    } else if (!runErrands(game, npc, dt)) {
      strollPerson(game, npc, dt);
    }
  }
}

// The closest person the player can talk to (undefined = nobody near).
export function personNear(game) {
  let closest;
  let best = TALK_RANGE;
  for (const npc of NPCS.filter((item) => isOutside(game, item) && !game.npcs[item.id].ko)) {
    const place = game.run.people[npc.id];
    const far = Math.hypot(place.x - game.player.x, place.y - game.player.y);
    if (far < best) {
      closest = npc;
      best = far;
    }
  }
  return closest;
}

// ---------- Talking ----------

// The next line of their life the player has earned (null = nothing new for now).
function nextLifeLine(game, npc) {
  const state = game.npcs[npc.id];
  if (state.told >= npc.life.length || state.friendship < FRIEND_STEPS[state.told]) return null;
  state.told += 1;
  return npc.life[state.told - 1];
}

function chat(game, npc) {
  const state = game.npcs[npc.id];
  if (state.talkedDay !== game.day) addFriendship(game, npc.id, 3); // the first talk of the day counts
  state.talkedDay = game.day;
  say(game, npc.id, [nextLifeLine(game, npc) || pickRandom(npc.hello)]);
}

function greeting(game, npc) {
  const children = childrenOf(game, npc.id);
  if (game.player.spouse === npc.id) return children.length > 0 ? 'Welcome home. ' + children[children.length - 1] + ' finally sleeps.' : 'Welcome home, my love.';
  if (children.length > 0 && Math.random() < 0.4) return 'Little ' + children[children.length - 1] + ' said a first word today!';
  return pickRandom(npc.hello);
}

// ---------- The choices of the talk menu. Each function returns a choice, or null if it does not apply. ----------

function talkChoice(game, npc) {
  return { label: 'Talk', run: () => chat(game, npc) };
}

function giftChoice(game, npc) {
  const itemId = npc.likes.find((id) => countItem(game.player, id) > 0);
  if (!itemId) return null;
  function give() {
    removeItem(game.player, itemId);
    addFriendship(game, npc.id, 6);
    shareFeelings(game, npc.id); // their friends are happy for them, their rivals a bit jealous
    emote(game, npc.id, 'heart');
    say(game, npc.id, ['A ' + ITEMS[itemId].name.toLowerCase() + '? For me? Thank you!']);
  }
  return { label: 'Give: ' + ITEMS[itemId].name, icon: itemId, run: give };
}

function activeQuestChoice(game, npc) {
  const quest = activeQuestOf(game, npc.id);
  if (!quest) return null;
  const progress = questProgress(game, quest);
  function report() {
    if (!isQuestReady(game, quest)) {
      say(game, npc.id, [quest.ask]);
      return;
    }
    finishQuest(game, quest);
    emote(game, npc.id, 'note');
    say(game, npc.id, [quest.thanks]);
  }
  return { label: 'Quest: ' + quest.title + ' (' + progress.have + '/' + progress.need + ')', icon: 'quests', run: report };
}

function newQuestChoice(game, npc) {
  const quest = offeredQuest(game, npc.id);
  if (!quest) return null;
  function ask() {
    say(game, npc.id, [quest.ask], [
      { label: 'I will help', run: () => startQuest(game, quest) },
      { label: 'Not now', run: () => {} },
    ]);
  }
  return { label: 'Need help?', icon: 'quests', run: ask };
}

function shopChoice(game, npc) {
  if (!npc.shop) return null;
  function open() {
    game.run.shop = { npcId: npc.id, kind: npc.shop };
    game.run.screen = 'shop';
  }
  return { label: npc.shop === 'forge' ? 'Forge: upgrade my gear' : 'Shop', icon: npc.shop === 'forge' ? 'ironSword' : 'lexis', run: open };
}

function workChoice(game, npc) {
  if (npc.job !== 'scribe') return null;
  return { label: 'Work as a scribe (4 Lexis a line)', icon: 'book', run: () => workAsScribe(game, npc) };
}

function playChoice(game, npc) {
  if (!npc.game) return null;
  return { label: 'Play Word Sprint', icon: 'powers', run: () => playWordSprint(game, npc) };
}

function lessonChoice(game, npc) {
  if (!npc.teaches || game.player.powers.includes(npc.teaches)) return null;
  const power = POWERS.find((item) => item.key === npc.teaches);
  function learn() {
    if (game.npcs[npc.id].friendship < LESSON_FRIENDSHIP) {
      say(game, npc.id, ['I only teach my friends. Talk to me more, help me... then we will see.']);
    } else if (game.player.lexis < LESSON_PRICE) {
      say(game, npc.id, ['A lesson costs ' + LESSON_PRICE + ' Lexis. Come back when you have them.']);
    } else {
      game.player.lexis -= LESSON_PRICE;
      game.player.powers.push(npc.teaches);
      say(game, npc.id, ['Close your eyes. Say the word, and mean it.', 'You learned ' + power.name + '! Open the menu: Powers.']);
    }
  }
  return { label: 'Teach me ' + power.name + ' (' + LESSON_PRICE + ' Lexis)', icon: power.id, run: learn };
}

function recruitChoice(game, npc) {
  if (!npc.fighter) return null;
  function recruit() {
    if (game.npcs[npc.id].friendship < RECRUIT_FRIENDSHIP) {
      say(game, npc.id, ['I do not follow strangers into battle. Earn my trust first.']);
    } else if (game.player.party.length >= MAX_PARTY) {
      say(game, npc.id, ['You already have ' + MAX_PARTY + ' companions. Send one home first.']);
    } else {
      game.player.party.push(npc.id);
      notify(game, '⚔️ ' + npc.name + ' joins you! +10 damage in every fight.', '#7CFC9A');
    }
  }
  return { label: 'Fight by my side', icon: 'woodSword', run: recruit };
}

// She is free if she has no family, or if her family is the player.
function isFreeFor(game, npc) {
  const partner = partnerOf(game, npc.id);
  return partner === null || partner === 'player';
}

function dateChoice(game, npc) {
  if (!npc.romance || !isFreeFor(game, npc)) return null;
  const state = game.npcs[npc.id];
  function date() {
    if (state.friendship < DATE_FRIENDSHIP) {
      say(game, npc.id, ['A walk, with you? Maybe when we know each other better.']);
    } else if (state.datedDay === game.day) {
      say(game, npc.id, ['We already spent today together. Tomorrow?']);
    } else {
      state.datedDay = game.day;
      addFriendship(game, npc.id, 8);
      addHappiness(game, 1);
      passHours(game, 2);
      say(game, null, ['You walk together until the light changes. ' + npc.name + ' talks, and you listen to every word.']);
    }
  }
  return { label: 'Spend time together', icon: 'flower', run: date };
}

function proposeChoice(game, npc) {
  const state = game.npcs[npc.id];
  const canAsk = npc.romance && game.player.spouse === null && partnerOf(game, npc.id) === null && state.friendship >= DATE_FRIENDSHIP;
  if (!canAsk) return null;
  function propose() {
    if (state.friendship < PROPOSE_FRIENDSHIP) {
      say(game, npc.id, ['...Not yet. Ask me again when you are sure. When I am sure.']);
    } else if (countItem(game.player, 'ring') === 0) {
      say(game, npc.id, ['You are asking without a ring? Rin sells one, in Seabridge. Go. I will wait.']);
    } else {
      removeItem(game.player, 'ring');
      game.player.spouse = npc.id;
      marry(game, 'player', npc.id, 6);
      addHappiness(game, 5);
      say(game, npc.id, ['Yes. In every tense: I did, I do, I will.', 'The whole village comes to the wedding. ' + npc.name + ' moves into your home.']);
    }
  }
  return { label: 'Will you marry me?', icon: 'ring', run: propose };
}

function crystalChoice(game, npc) {
  if (npc.shop !== 'forge') return null;
  return { label: 'Ask about magic crystal caves', icon: 'crystal', run: () => revealCrystalCave(game, npc.name) };
}

function strikeNpcChoice(game, npc) {
  return {
    label: 'Strike ' + npc.name + ' (Villain)',
    icon: 'sword',
    run: () => {
      cue(game, 'punch');
      setExpression(game, npc.id, 'anger');
      addFriendship(game, npc.id, -20);
      addInfamy(game, 15);
      addHappiness(game, -3);
      const place = game.run.people[npc.id];
      if (place) burst(game, place.x, place.y - 0.6, '#ff5a6e', 16);
      if (game.run.villagers) {
        const zone = zoneAt(game.player.x, game.player.y);
        for (const v of game.run.villagers) {
          if (v.village === zone.id && v.knight && !v.ko && !v.dead) v.angry = 60;
        }
      }
      if (npc.fighter && !game.npcs[npc.id].ko) {
        startFight(game, {
          name: npc.name,
          category: 'connectors',
          tier: 'small',
          tag: 'normal',
          shape: 'knight',
          health: 85,
          maxHealth: 85,
          attack: 22,
          magicAttack: 0,
          speed: 11,
          resistance: 0.1,
          magicResistance: 0.1,
          xp: 55,
          lexis: 30,
          onWin: () => {
            game.npcs[npc.id].ko = true;
            notify(game, '💥 You defeated ' + npc.name + '! (+15 Infamy)', '#ff8a95');
          },
          onLose: () => notify(game, npc.name + ' bested you and walked away.', '#ff8a95'),
        });
        return;
      }
      game.npcs[npc.id].ko = true;
      notify(game, '💥 You knocked down ' + npc.name + '! (+15 Infamy)', '#ff8a95');
    },
  };
}

const CHOICE_MAKERS = [
  talkChoice,
  sparringChoice,
  activeQuestChoice,
  newQuestChoice,
  shopChoice,
  crystalChoice,
  guildChoice,
  teacherChoice,
  schoolChoice,
  classChoice,
  workChoice,
  playChoice,
  giftChoice,
  lessonChoice,
  recruitChoice,
  dateChoice,
  proposeChoice,
];

// The player talks to someone: a hello, then everything they can do together.
export function talkTo(game, npc) {
  const state = game.npcs[npc.id];
  state.met = true; // shown in the Relations of the menu
  const mood = isVillain(game) || state.friendship < 0 ? 'anger' : game.player.spouse === npc.id ? 'love' : 'joy';
  setExpression(game, npc.id, mood);
  cue(game, voiceSoundFor(npc.id));
  const choices = [
    ...CHOICE_MAKERS.map((make) => make(game, npc)).filter((choice) => choice !== null),
    ...npcBondChoices(game, npc),
    strikeNpcChoice(game, npc),
  ];
  choices.push({ label: 'Leave', run: () => {} });
  say(game, npc.id, [greeting(game, npc)], choices);
}

// A companion goes back home.
export function sendHome(game, npcId) {
  game.player.party = game.player.party.filter((id) => id !== npcId);
  placePeople(game);
}
