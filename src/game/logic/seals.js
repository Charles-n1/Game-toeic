import { SEALS } from '../data/zones';
import { notify } from './messages';

// The magic doors (see SEALS): they stay closed until their boss is defeated. Only the player is stopped.

function isInside(seal, x, y) {
  return x >= seal.x && x < seal.x + seal.w && y >= seal.y && y < seal.y + seal.h;
}

export function isSealOpen(game, seal) {
  return game.bosses[seal.until] === true;
}

// The closed seal at (x, y), or null.
export function closedSealAt(game, x, y) {
  return SEALS.find((seal) => !isSealOpen(game, seal) && isInside(seal, x, y)) || null;
}

// The player walks into a seal: say why it does not open (not more than once every 4 seconds).
export function explainSeal(game, seal) {
  if (Date.now() < game.run.sealToldUntil) return;
  game.run.sealToldUntil = Date.now() + 4000;
  notify(game, seal.text, '#ff8a95');
}
