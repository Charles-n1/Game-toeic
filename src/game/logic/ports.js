import { PORTS } from '../world/map';
import { passHours } from './days';
import { addItem, earnLexis } from './player';
import { startFight } from './fight';
import { say, notify } from './messages';

// The ports: ships sail from harbor to harbor with real voyage risks (pirates/sea monsters or salvage!).

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

function triggerSeaEvent(game, toName) {
  const roll = Math.random();
  if (roll < 0.24) {
    const seaFoe = Math.random() < 0.5
      ? { species: 'harpy', name: 'Sea Harpy', category: game.focus?.current || 'connectors', tier: 'small', tag: 'normal', shape: 'bat', health: 55, maxHealth: 55, attack: 18, magicAttack: 0, speed: 14, resistance: 0, magicResistance: 0.2, xp: 35, lexis: 25, drops: ['feather'] }
      : { species: 'drowner', name: 'Corsair Raider', category: game.focus?.current || 'verbTenses', tier: 'small', tag: 'normal', shape: 'knight', health: 68, maxHealth: 68, attack: 20, magicAttack: 0, speed: 12, resistance: 0.15, magicResistance: 0, xp: 40, lexis: 35, drops: ['mysteryCrate'] };
    notify(game, '🏴‍☠️ Sea ambush while sailing toward ' + toName + '!', '#ff8a95');
    startFight(game, seaFoe);
    return;
  }
  if (roll < 0.42) {
    const haul = Math.random() < 0.5 ? 'rawFish' : 'warRations';
    addItem(game.player, haul, 2);
    earnLexis(game, 10);
    notify(game, '⛵ Calm voyage to ' + toName + ': hauled drifting salvage & fish on deck!', '#7cfc9a');
  } else {
    notify(game, '⛵ After hours at sea: ' + toName + '.', '#9fd8ff');
  }
}

export function sail(game, from, to, travelTo) {
  const fare = fareOf(from, to);
  if (game.player.lexis < fare) {
    notify(game, 'You need ' + fare + ' Lexis for this trip.');
    return;
  }
  game.player.lexis -= fare;
  passHours(game, Math.max(1, Math.round(seaDistance(from, to) / TILES_PER_HOUR)));
  travelTo(game, to.landing.x + 0.5, to.landing.y + 0.5);
  if (fare >= 18) triggerSeaEvent(game, to.name);
  else notify(game, '⛵ Docked cleanly at ' + to.name + '.', '#9fd8ff');
}

export function offerSail(game, from, travelTo) {
  const others = PORTS.filter((port) => port !== from).sort((a, b) => seaDistance(from, a) - seaDistance(from, b));
  const choices = others.map((to) => ({ label: to.name + ' (' + fareOf(from, to) + ' Lexis)', icon: 'map', run: () => sail(game, from, to, travelTo) }));
  say(game, null, ['The boat of ' + from.name + ' creaks on the waves. The sailor waves at you: "Where to?"'], [...choices, { label: 'Not now', run: () => {} }]);
}
