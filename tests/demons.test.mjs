// The demons only appear on the demon land; their generals stay on the Silent Isle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testGame, playFrames } from './helpers.mjs';
import { isDemonSpecies } from '../src/game/data/monsters.js';
import { isDemonGround, isOnSilentIsle, spreadDemonLand, takenCells } from '../src/game/logic/war/demonLand.js';
import { tickEmissaries } from '../src/game/logic/isekaiTodo/monstersPlus.js';
import { passHours } from '../src/game/logic/days.js';

// Every wild monster that appears while the hero stands at (x, y): [{ species, x, y }].
function monstersAppearingAt(game, x, y, frames) {
  game.player.x = x;
  game.player.y = y;
  const seen = [];
  playFrames(game, frames, () => {
    for (const monster of game.run.monsters) if (!monster.key && !monster.raid && !monster.seen) {
      monster.seen = true;
      seen.push(monster);
    }
  });
  return seen;
}

test('no demon appears out of the demon land', () => {
  const game = testGame();
  passHours(game, 24 * 5); // 5 days: the demons took some land
  const spots = [];
  for (let y = 300; y < 2300; y += 400) for (let x = 300; x < 2300; x += 400) spots.push({ x, y });
  for (const spot of spots) {
    for (const monster of monstersAppearingAt(game, spot.x, spot.y, 120)) {
      if (isDemonSpecies(monster.species)) assert.ok(isDemonGround(game, monster.x, monster.y), monster.species + ' at ' + Math.round(monster.x) + ',' + Math.round(monster.y));
    }
  }
});

test('on demon land, only demons appear', () => {
  const game = testGame();
  for (let day = 0; day < 10; day++) spreadDemonLand(game);
  const land = takenCells(game)[0];
  const appeared = monstersAppearingAt(game, land.x, land.y, 300).filter((monster) => isDemonGround(game, monster.x, monster.y));
  assert.ok(appeared.length > 0, 'demons come out of their land');
  for (const monster of appeared) assert.ok(isDemonSpecies(monster.species), monster.species + ' on demon land');
});

test('the demon generals stay on the Silent Isle', () => {
  const game = testGame();
  game.day = 5;
  for (let tick = 0; tick < 600; tick++) tickEmissaries(game, 0.1);
  assert.ok(game.run.emissaries.length > 0);
  for (const general of game.run.emissaries) assert.ok(isOnSilentIsle(general.x, general.y), general.name);
});
