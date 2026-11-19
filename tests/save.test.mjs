// A save is written, read back, and the game goes on the same.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testGame, playFrames } from './helpers.mjs';
import { saveGame, loadGame } from '../src/game/logic/save.js';

test('a saved game comes back the same, and can be played', () => {
  const game = testGame();
  playFrames(game, 100);
  game.player.lexis = 777;
  game.kills.slime = 12;
  saveGame(game);
  const loaded = loadGame(game.slot);
  assert.ok(loaded, 'the save is read back');
  assert.equal(loaded.player.lexis, 777);
  assert.equal(loaded.kills.slime, 12);
  assert.equal(loaded.day, game.day);
  assert.equal(loaded.player.name, 'Test');
  loaded.run.questions = game.run.questions;
  loaded.run.onAnswer = () => {};
  playFrames(loaded, 100); // and the loaded game runs
});
