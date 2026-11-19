// 10 days of game on the map, without a crash: the world is updated frame after frame, and day after day.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testGame, playFrames } from './helpers.mjs';
import { passHours } from '../src/game/logic/days.js';

test('10 days on the map without a crash', () => {
  const game = testGame();
  for (let day = 0; day < 10; day++) {
    playFrames(game, 300); // 15 seconds of the day, with the people, the monsters, the caravans...
    passHours(game, 24); // then the rest of the day at once (the new day: the war, the demons, the fires...)
  }
  assert.ok(game.day >= 11);
});
