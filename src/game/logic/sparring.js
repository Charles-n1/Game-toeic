import { NPCS } from '../data/npcs';
import { CATEGORIES } from '../../data/categories';
import { typeOf } from '../data/types';
import { pickRandom, shuffle } from '../../logic/random';
import { startFight } from './fight';
import { makeDuel } from './duels';
import { DUMMY } from './school';
import { tagOf } from './skills';
import { addFriendship } from './village';
import { gainXp, earnLexis } from './player';
import { say } from './messages';
import { emote } from './emotes';

// Some people of the villages ask the hero to train with them: a practice of short sentences at a dummy,
// in the skill they want to work on. A few new people ask each day.
// game.sparring: { day, requests: { npcId: { category, called, done } } }

const REQUESTS_PER_DAY = 3;
const CALL_RANGE = 2.5; // tiles: this close, they call the hero
const WAVE_RANGE = 7; // tiles: this close, a "!" shows over their head
const SPARRING_ANSWERS = 5;
const SPARRING_XP = 20;
const SPARRING_LEXIS = 10;

// Who can ask: people of the villages, alive, not with the hero, not the spouse, not a wanderer or a guild member.
function canAsk(game, npc) {
  const state = game.npcs[npc.id];
  return state && state.alive && !npc.guild && !npc.wanderer && !npc.child && game.player.spouse !== npc.id && !game.player.party.includes(npc.id);
}

// The requests of today (new ones each morning).
function todaysRequests(game) {
  if (!game.sparring || game.sparring.day !== game.day) {
    const askers = shuffle(NPCS.filter((npc) => canAsk(game, npc))).slice(0, REQUESTS_PER_DAY);
    const requests = {};
    for (const npc of askers) requests[npc.id] = { category: pickRandom(CATEGORIES).id, called: false, done: false };
    game.sparring = { day: game.day, requests: requests };
  }
  return game.sparring.requests;
}

function openRequestOf(game, npcId) {
  const request = todaysRequests(game)[npcId];
  return request && !request.done ? request : null;
}

// The practice itself: the hero against a dummy, the person watching (and learning).
function startSparring(game, npc) {
  const request = openRequestOf(game, npc.id);
  if (!request) return;
  const skill = typeOf(request.category).short;
  function win() {
    request.done = true;
    addFriendship(game, npc.id, 5);
    gainXp(game, SPARRING_XP);
    earnLexis(game, SPARRING_LEXIS);
    say(game, npc.id, ['That was great! I think I finally get ' + skill + '. Here, ' + SPARRING_LEXIS + ' Lexis for your time.']);
  }
  function lose() {
    request.done = true;
    addFriendship(game, npc.id, 2);
    say(game, npc.id, ['Hard one, right? At least we learned something. Thanks for trying with me!']);
  }
  const duel = makeDuel(DUMMY, {
    title: 'Training with ' + npc.name + ' · ' + skill,
    category: request.category,
    tag: tagOf(game, request.category),
    health: SPARRING_ANSWERS,
    speed: 10,
    training: true,
    sections: ['rc10'],
    onWin: win,
    onLose: lose,
  });
  startFight(game, duel);
}

function askToTrain(game, npc, request) {
  const skill = typeOf(request.category).short;
  say(game, npc.id, ['Hey! Do you have a minute? I want to practice ' + skill + '. Will you train with me at the dummy? Just short sentences.'], [
    { label: 'Let\'s train! (' + skill + ')', icon: 'woodSword', run: () => startSparring(game, npc) },
    { label: 'Later', run: () => {} },
  ]);
}

// Every second on the map: the people who want to train wave at the hero ("!"), and call them when they are close.
export function slowSparring(game) {
  if (game.run.screen !== 'play' || game.raid.active) return;
  const requests = todaysRequests(game);
  for (const [npcId, request] of Object.entries(requests)) {
    if (request.done || !game.run.visible[npcId]) continue;
    const place = game.run.people[npcId];
    const far = Math.hypot(place.x - game.player.x, place.y - game.player.y);
    if (far < WAVE_RANGE) emote(game, npcId, '!');
    if (!request.called && far < CALL_RANGE) {
      request.called = true;
      askToTrain(game, NPCS.find((npc) => npc.id === npcId), request);
      return;
    }
  }
}

// The choice of the talk menu with someone who asked to train today (if the hero said "Later").
export function sparringChoice(game, npc) {
  const request = openRequestOf(game, npc.id);
  if (!request) return null;
  return { label: 'Train together (' + typeOf(request.category).short + ')', icon: 'woodSword', run: () => startSparring(game, npc) };
}
