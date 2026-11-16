import { NPCS, npcOf } from '../data/npcs';
import { NEGOTIATION } from '../data/negotiation';
import { startFight } from './fight';
import { makeDuel } from './duels';
import { addFriendship } from './village';
import { say, notify } from './messages';

// The Guild of Adventurers (Eldermoor). The hero recruits fighters there: the guild members (always there),
// and the adventurers the hero met on the roads (see encounters.js).
// To recruit someone: negotiate their fee. A negotiation is a duel of words, HARD, with business sentences
// (see data/negotiation.js): 4 good answers before 3 mistakes. Won: they come for 60% of their fee.
// Lost: they want the full fee, today. game.npcs[id].refusedDay: the day they refused to talk again.

export const MAX_PARTY = 2;
const DEAL = 0.6;

// The fee of a fighter: more for the strong ones.
export function feeOf(npc) {
  return npc.fee || 150;
}

// Who the guild can propose: the members, and the fighters met on the roads, alive, not already with the hero.
export function recruits(game) {
  return NPCS.filter((npc) => {
    const state = game.npcs[npc.id];
    const isKnown = npc.guild || (npc.wanderer && state.met);
    return npc.fighter && isKnown && state.alive && !game.player.party.includes(npc.id);
  });
}

function hire(game, npc, price) {
  if (game.player.lexis < price) {
    say(game, 'brann', ['You do not have ' + price + ' Lexis. Come back with the money: ' + npc.name + ' will wait.']);
    return;
  }
  if (game.player.party.length >= MAX_PARTY) {
    say(game, 'brann', ['You already lead ' + MAX_PARTY + ' adventurers. Send one home first (Menu → Inventory).']);
    return;
  }
  game.player.lexis -= price;
  game.player.party.push(npc.id);
  addFriendship(game, npc.id, 5);
  notify(game, '⚔️ ' + npc.name + ' joins you for ' + price + ' Lexis! +10 damage in every fight.', '#7CFC9A');
}

// The negotiation: the questions are business sentences, at the hard level.
export function negotiateFee(game, npc) {
  const fee = feeOf(npc);
  const deal = Math.round(fee * DEAL);
  function win() {
    say(game, npc.id, ['...You speak like a merchant. Fine: ' + deal + ' Lexis, and I follow you.'], [
      { label: 'Deal! (' + deal + ' Lexis)', icon: 'lexis', run: () => hire(game, npc, deal) },
      { label: 'Not now', run: () => {} },
    ]);
  }
  function lose() {
    game.npcs[npc.id].refusedDay = game.day;
    say(game, npc.id, ['No. My price is ' + fee + ' Lexis. Take it or leave it. And not another word today.'], [
      { label: 'Pay ' + fee + ' Lexis', icon: 'lexis', run: () => hire(game, npc, fee) },
      { label: 'Leave', run: () => {} },
    ]);
  }
  const duel = makeDuel(npc, { title: 'Negotiation with ' + npc.name, category: 'vocabulary', tag: 'hard', health: 4, speed: 11, questions: NEGOTIATION, onWin: win, onLose: lose });
  startFight(game, duel);
}

function proposeRecruit(game, npc) {
  if (game.npcs[npc.id].refusedDay === game.day) {
    say(game, 'brann', [npc.name + ' does not want to talk about money again today. Tomorrow.']);
    return;
  }
  say(game, npc.id, [npc.hello[0], 'My fee: ' + feeOf(npc) + ' Lexis. Negotiable... if you have the words.'], [
    { label: 'Negotiate (hard sentences)', icon: 'book', run: () => negotiateFee(game, npc) },
    { label: 'Pay ' + feeOf(npc) + ' Lexis', icon: 'lexis', run: () => hire(game, npc, feeOf(npc)) },
    { label: 'Leave', run: () => {} },
  ]);
}

// The choice of the talk menu with the guild master.
export function guildChoice(game, npc) {
  if (!npc.guildMaster) return null;
  function open() {
    const list = recruits(game);
    if (list.length === 0) {
      say(game, npc.id, ['No adventurer is free right now. Meet some on the roads: they come here to find work.']);
      return;
    }
    say(game, npc.id, ['Who do you want to hire? The fee is theirs to discuss.'], [
      ...list.map((recruit) => ({ label: recruit.name + ' · ' + recruit.role + ' · ' + feeOf(recruit) + ' Lexis', icon: 'woodSword', run: () => proposeRecruit(game, recruit) })),
      { label: 'Leave', run: () => {} },
    ]);
  }
  return { label: 'Hire an adventurer', icon: 'woodSword', run: open };
}

export { npcOf };
