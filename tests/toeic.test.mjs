// The estimated TOEIC score follows the answers: good answers make it go up, mistakes make it go down.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testGame } from './helpers.mjs';
import { estimatedScore, rememberAnswer, categoryLevels } from '../src/game/logic/toeicScore.js';

test('good answers raise the score, mistakes lower it, and it stays between 5 and 495', () => {
  const game = testGame();
  const start = estimatedScore(game);
  for (let i = 0; i < 20; i++) rememberAnswer(game, true);
  const after = estimatedScore(game);
  assert.ok(after > start || start === 495, start + ' -> ' + after);
  for (let i = 0; i < 100; i++) rememberAnswer(game, false);
  assert.equal(estimatedScore(game), 5);
  for (let i = 0; i < 100; i++) rememberAnswer(game, true);
  assert.equal(estimatedScore(game), 495);
});

test('every category has a level', () => {
  const levels = categoryLevels(testGame());
  assert.equal(levels.length, 10);
  for (const level of levels) assert.ok(level.percent >= 0 && level.percent <= 100, level.id);
});
