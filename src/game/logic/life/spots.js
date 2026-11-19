import { zoneAt } from '../../data/zones';
import { isSolid } from '../../world/map';
import { distance } from '../../world/geometry';

// Where the things of the life of the world appear and go: OUT OF SIGHT of the hero. A traveler, a bird, a nest,
// a fallen branch never "pops" in front of the eyes: it appears beyond the edge of the screen (and walks in), and
// it only goes away once the hero can not see it any more.

export const OUT_OF_SIGHT = 15; // tiles: the screen shows about 10 tiles around the hero

// Open land of the wild (not a village, not a wall, not water).
export function isOpenLand(x, y) {
  return !isSolid(x, y) && zoneAt(x, y).kind === 'land';
}

// A spot out of sight of the hero, at most maxRange tiles away, where isGood(x, y) (or null: none found).
export function spotOutOfSight(game, maxRange = 24, isGood = isOpenLand) {
  for (let tries = 0; tries < 24; tries++) {
    const angle = Math.random() * Math.PI * 2;
    const range = OUT_OF_SIGHT + Math.random() * (maxRange - OUT_OF_SIGHT);
    const x = Math.round(game.player.x + Math.cos(angle) * range) + 0.5;
    const y = Math.round(game.player.y + Math.sin(angle) * range) + 0.5;
    if (isGood(x, y)) return { x, y };
  }
  return null;
}

export function isInSight(game, thing) {
  return distance(thing, game.player) < OUT_OF_SIGHT;
}

// May this thing go away now? Its time is over (or it was done), and the hero does not see it.
export function mayGoAway(game, thing, isOver) {
  return isOver && !isInSight(game, thing);
}
