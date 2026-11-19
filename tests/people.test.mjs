// The people move like people: nobody walks without moving (into a wall), nobody goes back and forth forever,
// nobody stands for long in front of a door.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testGame, playFrames, distance } from './helpers.mjs';
import { NPCS } from '../src/game/data/npcs.js';
import { HOUSES } from '../src/game/data/zones.js';
import { visibleVillagers } from '../src/game/logic/villagers.js';
import { ensureEconomy } from '../src/game/logic/economy/state.js';

const CHECK_EVERY = 200; // frames: 10 seconds
const LONG_AT_DOOR = 20; // seconds: standing longer than this in front of a door is "planted"

// The name of a walker, for the messages (the people of the story keep their name in data/npcs.js).
function nameOf(game, walker) {
  return walker.name || walker.id || NPCS.find((npc) => game.run.people[npc.id] === walker)?.name;
}

function walkers(game) {
  const people = NPCS.map((npc) => game.run.people[npc.id]);
  return [...game.run.villagers, ...people, ...(game.run.parties || []), ...(game.run.caravans || []), ...ensureEconomy(game).patrols];
}

test('nobody walks into a wall or turns in circles', () => {
  const game = testGame();
  const moved = new Map(); // walker -> { distance walked, frames walking, last place }
  const stuck = [];
  const loops = [];
  playFrames(game, 6000, (frame) => {
    for (const walker of walkers(game)) {
      const seen = moved.get(walker) || { walked: 0, walking: 0, last: { x: walker.x, y: walker.y }, history: [] };
      seen.walked += distance(walker, seen.last);
      seen.walking += walker.walking ? 1 : 0;
      seen.last = { x: walker.x, y: walker.y };
      moved.set(walker, seen);
      if (frame % CHECK_EVERY !== 0) continue;
      if (seen.walking > CHECK_EVERY * 0.75 && seen.walked < 0.5) stuck.push(nameOf(game, walker));
      // A loop: walking all the time for a minute, and never more than 5 tiles from where it was.
      // (Going out and coming back once is a trip, not a loop.)
      seen.history.push({ x: walker.x, y: walker.y, walked: seen.walked });
      const minute = seen.history.slice(-7);
      const walkedInMinute = minute.slice(1).reduce((sum, step) => sum + step.walked, 0);
      const wentAway = minute.some((step) => distance(step, minute[0]) > 5);
      if (minute.length === 7 && walkedInMinute > 40 && !wentAway) loops.push(nameOf(game, walker));
      seen.walked = 0;
      seen.walking = 0;
    }
  });
  assert.deepEqual(stuck, [], 'walking without moving');
  assert.deepEqual(loops, [], 'going back and forth');
});

test('nobody stands planted in front of a door', () => {
  const game = testGame();
  const doors = HOUSES.map((house) => ({ x: house.x + Math.floor(house.w / 2) + 0.5, y: house.y + house.h + 0.5 }));
  const isAtDoor = (place) => doors.some((door) => distance(door, place) < 1.6);
  const standing = new Map(); // person -> seconds standing at a door
  const planted = new Set();
  playFrames(game, 6000, (frame) => {
    if (frame % 20 !== 0) return; // once per second
    const people = NPCS.filter((npc) => game.run.visible[npc.id]).map((npc) => ({ ref: game.run.people[npc.id], name: npc.name }));
    const villagers = visibleVillagers(game).map((villager) => ({ ref: villager, name: villager.name }));
    for (const { ref, name } of [...people, ...villagers]) {
      const isIdle = !ref.walking && !(ref.talkUntil > Date.now()) && ref.task !== 'work' && ref.task !== 'evening';
      const seconds = isIdle && isAtDoor(ref) ? (standing.get(ref) || 0) + 1 : 0;
      standing.set(ref, seconds);
      if (seconds > LONG_AT_DOOR) planted.add(name);
    }
  });
  assert.deepEqual([...planted], [], 'planted in front of a door');
});
