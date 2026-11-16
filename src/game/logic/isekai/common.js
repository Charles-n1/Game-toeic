import { WILD_STRUCTURES } from '../../data/zones';

// The isekai side of the game (see data/isekai.js): what it saves, and what its parts share.

// game.isekai: saved with the game.
export function firstIsekai() {
  return {
    pagesFound: 0, // the pages of the diary of the Lost Hero already read (see lostHero.js)
    gravesRead: {}, // { 'grave-2': true }
    knowsKingName: false, // all the pages are read: the hero knows the true name of the Demon King
    recognized: {}, // the classmates the hero told "I know you" (see classmates.js)
    rivalDay: 0, // the day of the last duel with Lea
    arenaDays: {}, // { villageId: the day of the last tournament there } (see arena.js)
    champion: false, // a whole tournament won once
    curse: null, // the id of the cursed thing the hero wears (see curses.js)
    purified: [], // the cursed things whose curse was lifted
    curseLoss: 0, // the part of a HP the curse took, not removed yet
    event: null, // the event of the world: { id, kills, until } (see events.js)
    lastEventDay: 0,
    rolledDay: 0, // the last morning an event could start
  };
}

// The structure of the wild of this kind close to the hero (see world/wildPlaces.js), or null. range: in tiles.
export function structureNear(game, kind, range) {
  const player = game.player;
  return WILD_STRUCTURES.find((place) => place.kind === kind && Math.hypot(place.x - player.x, place.y - player.y) < range) || null;
}
