import { NPCS } from '../data/npcs';
import { SPAWN } from '../data/zones';
import { LESSON_PRICE, LESSON_FRIENDSHIP, POWERS } from '../data/powers';
import { ITEMS } from '../data/items';
import { pickRandom } from '../../logic/random';
import { isSolid } from '../world/map';
import { isNight } from './clock';
import { facingOf } from './input';
import { passHours } from './days';
import { addFriendship, addHappiness } from './village';
import { marry, partnerOf, childrenOf } from './families';
import { activeQuestOf, offeredQuest, isQuestReady, questProgress, startQuest, finishQuest } from './quests';
import { workAsScribe, playWordSprint } from './duels';
import { countItem, removeItem } from './player';
import { say, notify } from './messages';

// The people on the map: where they are, and everything the player can do with them.

export const FRIEND_STEPS = [0, 20, 50, 80]; // the friendship needed to hear each line of their life
const RECRUIT_FRIENDSHIP = 50;
const DATE_FRIENDSHIP = 50;
const PROPOSE_FRIENDSHIP = 80;
const MAX_PARTY = 2;
const TALK_RANGE = 1.5; // tiles

// ---------- Where they are ----------

// Married to the player: they live in front of the player's home.
function homeOf(game, npc) {
  if (game.player.spouse === npc.id) return { x: SPAWN.x + 1.5, y: SPAWN.y + 0.3 };
  return { x: npc.x, y: npc.y };
}

// Puts everyone at home (when the game opens).
export function placePeople(game) {
  for (const npc of NPCS) {
    const home = homeOf(game, npc);
    game.run.people[npc.id] = { x: home.x, y: home.y, walkX: 0, walkY: 0, walkTime: 0, step: 0, dir: 'down' };
  }
}

// On the map right now? (Alive, not following the player, and Nyx only comes out at night.)
export function isOutside(game, npc) {
  const isFollowing = game.player.party.includes(npc.id);
  const isHidden = npc.nightOnly && !isNight(game) && game.player.spouse !== npc.id;
  return game.npcs[npc.id].alive && !isFollowing && !isHidden;
}

function pickWalk(place) {
  const angle = Math.random() * Math.PI * 2;
  const isResting = Math.random() < 0.5;
  place.walkX = isResting ? 0 : Math.cos(angle);
  place.walkY = isResting ? 0 : Math.sin(angle);
  place.walkTime = 1 + Math.random() * 3;
}

// A slow walk around home. At night, or too far, they come back.
function strollPerson(game, npc, dt) {
  const place = game.run.people[npc.id];
  const home = homeOf(game, npc);
  const fromHome = Math.hypot(place.x - home.x, place.y - home.y);
  place.walkTime -= dt;
  if (place.walkTime <= 0) pickWalk(place);
  if (fromHome > 1.5 || isNight(game)) {
    place.walkX = fromHome > 0.1 ? (home.x - place.x) / fromHome : 0;
    place.walkY = fromHome > 0.1 ? (home.y - place.y) / fromHome : 0;
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

export function updatePeople(game, dt) {
  const player = game.player;
  for (const npc of NPCS) {
    const place = game.run.people[npc.id];
    const isListening = Math.hypot(place.x - player.x, place.y - player.y) < TALK_RANGE; // the player is near: stay
    if (isOutside(game, npc) && !isListening) strollPerson(game, npc, dt);
    if (isListening) {
      place.walking = false;
      place.dir = facingOf(player.x - place.x, player.y - place.y); // they turn to the player
    }
  }
}

// The closest person the player can talk to (undefined = nobody near).
export function personNear(game) {
  let closest;
  let best = TALK_RANGE;
  for (const npc of NPCS.filter((item) => isOutside(game, item))) {
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
      say(game, npc.id, ['You are asking without a ring? Luna sells one, in Port Syntax. Go. I will wait.']);
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

const CHOICE_MAKERS = [
  talkChoice,
  activeQuestChoice,
  newQuestChoice,
  shopChoice,
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
  const choices = CHOICE_MAKERS.map((make) => make(game, npc)).filter((choice) => choice !== null);
  choices.push({ label: 'Leave', run: () => {} });
  say(game, npc.id, [greeting(game, npc)], choices);
}

// A companion goes back home.
export function sendHome(game, npcId) {
  game.player.party = game.player.party.filter((id) => id !== npcId);
  placePeople(game);
}
