import { npcOf } from '../data/npcs';
import { say, notify } from './messages';

// The feelings of the world: the happiness of the village (0 to 100) and the friendship with each person (0 to 100).
// A happy village gives better prices, and friendships grow faster in it.

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

export function addFriendship(game, npcId, amount) {
  const state = game.npcs[npcId];
  state.friendship = clampPercent(state.friendship + amount * friendshipBoost(game));
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
