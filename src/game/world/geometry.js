// The small helpers of places, used everywhere. A place: { x, y } in tiles.

// How far two places are, in tiles.
export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// The side to look at, to look along (dx, dy): 'left', 'right', 'up' or 'down'.
export function facingOf(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

// Turns someone (anything with a dir) to look at a place.
export function faceTo(someone, place) {
  someone.dir = facingOf(place.x - someone.x, place.y - someone.y);
}
