import { facingOf } from './input';

// Those who walk behind the player, in a line: the recruited friends, the obsidian soldiers, and the obsidian cat.
// game.run.followers: [{ kind: 'person' | 'soldier' | 'pet', id, x, y, step }]

const GAP = 0.9; // tiles between regular walkers of the line
const SOLDIER_GAP = 1.95; // wide obsidian soldiers keep extra spacing
const LOST = 11; // tiles: further than that, the follower jumps back to the player

function wantedFollowers(player) {
  const people = player.party.map((id) => ({ kind: 'person', id: id }));
  const soldiers = Array.from({ length: player.soldiers }, () => ({ kind: 'soldier', id: null }));
  const pet = player.pet ? [{ kind: 'pet', id: null }] : [];
  return [...people, ...soldiers, ...pet];
}

function isSameLine(followers, wanted) {
  return followers.length === wanted.length && followers.every((follower, i) => follower.kind === wanted[i].kind && follower.id === wanted[i].id);
}

// Walks toward the one in front, and stops cleanly spaced behind.
function follow(follower, leader, dt) {
  const gap = follower.kind === 'soldier' || leader.kind === 'soldier' ? SOLDIER_GAP : GAP;
  const far = Math.hypot(leader.x - follower.x, leader.y - follower.y);
  if (far > LOST) {
    follower.x = leader.x;
    follower.y = leader.y;
  } else if (far > gap) {
    const move = Math.min(far - gap, 10 * dt);
    follower.dir = facingOf(leader.x - follower.x, leader.y - follower.y);
    follower.x += ((leader.x - follower.x) / far) * move;
    follower.y += ((leader.y - follower.y) / far) * move;
    follower.step += dt * 7;
  }
  follower.walking = far > gap;
}

export function updateFollowers(game, dt) {
  const player = game.player;
  const wanted = wantedFollowers(player);
  if (!isSameLine(game.run.followers, wanted)) {
    game.run.followers = wanted.map((follower) => ({ ...follower, x: player.x, y: player.y, step: 0 }));
  }
  let leader = player;
  for (const follower of game.run.followers) {
    follow(follower, leader, dt);
    leader = follower;
  }
}
