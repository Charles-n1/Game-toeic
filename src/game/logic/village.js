import { npcOf, NPCS } from '../data/npcs';
import { say, notify } from './messages';

// The feelings of the world: the happiness of the village (0 to 100) and the friendship with each person (0 to 100).
// A happy village gives better prices, and friendships grow faster in it.

// The steps of a relation, from the friendship. (Married, in the party: see relationOf.)
export const RELATION_STEPS = [
  { from: 0, name: 'Stranger', color: '#9aa6b8' },
  { from: 20, name: 'Acquaintance', color: '#7cc4f5' },
  { from: 50, name: 'Friend', color: '#7cfc9a' },
  { from: 80, name: 'Close friend', color: '#ffd23f' },
];

// What the people are to each other, in words (see `bonds` in data/npcs.js).
export const BOND_NAMES = { love: 'love', family: 'family', friend: 'friend', rival: 'rival', mentor: 'teacher', student: 'student' };
const OTHER_SIDE = { mentor: 'student', student: 'mentor' }; // seen from the other person (the others are the same)

function clampPercent(value) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function addHappiness(game, amount) {
  game.happiness = clampPercent(game.happiness + amount);
}

// Happiness 0: friendships grow at half speed. Happiness 100: one and a half times faster.
function friendshipBoost(game) {
  return 0.5 + game.happiness / 100;
}

function stepOf(friendship) {
  return RELATION_STEPS.filter((step) => friendship >= step.from).pop();
}

// The relation of the hero with someone: { name, color }.
export function relationOf(game, npcId) {
  if (game.player.spouse === npcId) return { name: 'Spouse', color: '#ff6fa8' };
  if (game.player.party.includes(npcId)) return { name: 'Companion · ' + stepOf(game.npcs[npcId].friendship).name, color: '#ffb070' };
  return stepOf(game.npcs[npcId].friendship);
}

// When the friendship reaches a new step, the hero is told.
export function addFriendship(game, npcId, amount) {
  const state = game.npcs[npcId];
  const before = stepOf(state.friendship);
  state.friendship = clampPercent(state.friendship + amount * friendshipBoost(game));
  const after = stepOf(state.friendship);
  if (after.from > before.from) notify(game, '💛 ' + npcOf(npcId).name + ': ' + after.name + '!', after.color);
}

// The people who have a bond with this person: [{ npc, kind }]. kind: what the other one is to this person.
// Both ways: if Luna says "Selene is my mentor", then for Selene, Luna is a student.
export function bondsOf(npcId) {
  const own = Object.entries(npcOf(npcId).bonds || {}).map(([otherId, kind]) => ({ npc: npcOf(otherId), kind: kind }));
  const isListed = (npc) => own.some((bond) => bond.npc && bond.npc.id === npc.id);
  const others = NPCS.filter((npc) => npc.bonds && npc.bonds[npcId] && !isListed(npc)).map((npc) => ({ npc: npc, kind: OTHER_SIDE[npc.bonds[npcId]] || npc.bonds[npcId] }));
  return [...own, ...others].filter((bond) => bond.npc);
}

// Something nice was done to someone: their love, family and friends like the hero a bit more,
// their rivals a bit less ("so you help HER now?").
export function shareFeelings(game, npcId) {
  for (const bond of bondsOf(npcId)) {
    const state = game.npcs[bond.npc.id];
    if (!state || !state.alive) continue;
    if (bond.kind === 'rival') state.friendship = clampPercent(state.friendship - 1);
    else addFriendship(game, bond.npc.id, bond.kind === 'friend' ? 1 : 2);
  }
}

// The prices follow the happiness: +15% in a sad village, -15% in a very happy one.
// A negotiation won (or lost) with a seller changes the prices too, until the end of the day.
export function priceFactor(game) {
  const mood = 1.15 - game.happiness * 0.003;
  const deal = game.deal.day === game.day ? game.deal.factor : 1;
  return mood * deal;
}

export function isAlive(game, npcId) {
  return game.npcs[npcId].alive;
}

// Someone dies. It can not be undone: the village is sadder, their family is broken.
export function killNpc(game, npcId, lines) {
  const state = game.npcs[npcId];
  if (!state.alive) return;
  state.alive = false;
  game.player.party = game.player.party.filter((id) => id !== npcId);
  if (game.player.spouse === npcId) game.player.spouse = null;
  addHappiness(game, -10);
  notify(game, '🕯️ ' + npcOf(npcId).name + ' is dead.', '#ff8080');
  if (lines) say(game, null, lines);
}
