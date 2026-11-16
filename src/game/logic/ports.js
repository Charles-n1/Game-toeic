import { PORTS } from '../world/map';
import { passHours } from './days';
import { say, notify } from './messages';

// The ports: a boat waits at the end of the pier of each village by the sea. It sails to any other port,
// from island to island. The farther, the more it costs, and the more hours pass at sea.

const TILES_PER_LEXIS = 40;
const TILES_PER_HOUR = 300;

export function portNear(game) {
  return PORTS.find((port) => Math.hypot(port.x + 0.5 - game.player.x, port.y + 0.5 - game.player.y) < 4.5) || null;
}

function seaDistance(from, to) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

export function fareOf(from, to) {
  return Math.max(10, Math.round(seaDistance(from, to) / TILES_PER_LEXIS));
}

function sail(game, from, to, travelTo) {
  const fare = fareOf(from, to);
  if (game.player.lexis < fare) {
    notify(game, 'You need ' + fare + ' Lexis for this trip.');
    return;
  }
  game.player.lexis -= fare;
  passHours(game, Math.max(1, Math.round(seaDistance(from, to) / TILES_PER_HOUR)));
  travelTo(game, to.landing.x + 0.5, to.landing.y + 0.5);
  notify(game, '⛵ After hours at sea: ' + to.name + '.', '#9fd8ff');
}

// The sailor offers every other port, the closest first. travelTo: moves the hero (see logic/update.js).
export function offerSail(game, from, travelTo) {
  const others = PORTS.filter((port) => port !== from).sort((a, b) => seaDistance(from, a) - seaDistance(from, b));
  const choices = others.map((to) => ({ label: to.name + ' (' + fareOf(from, to) + ' Lexis)', icon: 'map', run: () => sail(game, from, to, travelTo) }));
  say(game, null, ['The boat of ' + from.name + ' creaks on the waves. The sailor waves at you: "Where to?"'], [...choices, { label: 'Not now', run: () => {} }]);
}
