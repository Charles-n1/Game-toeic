// The boosts of the hero: what raises (or lowers) their stats for a while, or for good.
// Everyone who gives a boost goes through here: a dish (logic/camp.js), a statue or a totem (the world),
// a horse, a feast... The stats of the hero (logic/player.js, logic/fight.js) read boostOf().
//
// The 5 stats, from the most important to the least (see logic/statLinks.js):
//   speed    the speed in a fight (more time to answer, strikes first)
//   health   the max HP
//   spell    the damage of the skills (the grammar spells)
//   attack   the damage of the strikes (and of the special attacks)
//   defense  the HP stopped at each blow taken
//
// game.player.boosts: [{ stat, amount, untilHour (null = for good), source }]
// untilHour: in game hours since the start ((day - 1) * 24 + hour).

export const STATS = ['speed', 'health', 'spell', 'attack', 'defense'];

export function gameHours(game) {
  return (game.day - 1) * 24 + game.hour;
}

function boostsOf(game) {
  if (!game.player.boosts) game.player.boosts = [];
  return game.player.boosts;
}

// A new boost. hours: how long it lasts (null = for good). source: who gave it (a boost of the same source
// and the same stat replaces the old one: two meals do not add up, the last one counts).
export function addBoost(game, stat, amount, hours, source) {
  const boosts = boostsOf(game).filter((boost) => !(boost.source === source && boost.stat === stat));
  boosts.push({ stat: stat, amount: amount, untilHour: hours === null ? null : gameHours(game) + hours, source: source });
  game.player.boosts = boosts;
}

// Clears every boost belonging to a given source (e.g. curing 'cold').
export function clearBoostSource(game, source) {
  game.player.boosts = boostsOf(game).filter((boost) => boost.source !== source);
}

// The boosts still running (the old ones are forgotten).
export function activeBoosts(game) {
  const now = gameHours(game);
  game.player.boosts = boostsOf(game).filter((boost) => boost.untilHour === null || boost.untilHour > now);
  return game.player.boosts;
}

// The total of the boosts of one stat (0 = nothing).
export function boostOf(game, stat) {
  return activeBoosts(game)
    .filter((boost) => boost.stat === stat)
    .reduce((total, boost) => total + boost.amount, 0);
}
