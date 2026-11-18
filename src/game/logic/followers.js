import { isSolid } from '../world/map';
import { stepSmart } from '../world/paths';
import { updateCompanionWalkingBanter } from './soul';

// Those who walk behind the player, in a line: the recruited friends, the obsidian soldiers, and the obsidian cat.
// game.run.followers: [{ kind: 'person' | 'soldier' | 'pet', id, x, y, step }]

const GAP = 0.9; // tiles between regular walkers of the line
const SOLDIER_GAP = 1.95; // wide obsidian soldiers keep extra spacing
const LOST = 16; // tiles: enough slack to walk out town gates cleanly behind the hero before teleporting

function wantedFollowers(player) {
  const people = player.party.map((id) => ({ kind: 'person', id: id }));
  const soldiers = Array.from({ length: player.soldiers }, () => ({ kind: 'soldier', id: null }));
  const pet = player.pet ? [{ kind: 'pet', id: null }] : [];
  return [...people, ...soldiers, ...pet];
}

function isSameLine(followers, wanted) {
  return followers.length === wanted.length && followers.every((follower, i) => follower.kind === wanted[i].kind && follower.id === wanted[i].id);
}

// Walks cleanly around walls, roofs, fences, and through town gates behind the hero.
function follow(follower, leader, dt) {
  const gap = follower.kind === 'soldier' || leader.kind === 'soldier' ? SOLDIER_GAP : GAP;
  const far = Math.hypot(leader.x - follower.x, leader.y - follower.y);
  if (far > LOST) {
    if (!isSolid(leader.x, leader.y)) {
      follower.x = leader.x;
      follower.y = leader.y;
    }
    follower._navPath = null;
    follower.walking = false;
    return;
  }
  if (far <= gap) {
    follower.walking = false;
    return;
  }
  const speed = Math.min(10, (far - gap) / Math.max(dt, 0.001));
  if (!stepSmart(follower, leader.x, leader.y, speed, dt)) {
    follower.walking = false;
  }
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
  updateCompanionWalkingBanter(game, dt);
}
