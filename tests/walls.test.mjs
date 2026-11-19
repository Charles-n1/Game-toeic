// The chapter "Renovate the walls" can be done in Eldermoor (its walls are old stone: they can be reinforced).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testGame } from './helpers.mjs';
import { villageOf, zoneAt } from '../src/game/data/zones.js';
import { isSolid } from '../src/game/world/map.js';
import { CHAPTERS } from '../src/game/data/story.js';
import { wallTilesOf, wallRepairSpotNear, applyWallRenovation } from '../src/game/logic/walls.js';

test('during "Renovate the walls", a wall of Eldermoor can be renovated', () => {
  const game = testGame();
  game.chapter = CHAPTERS[game.goal].findIndex((chapter) => chapter.id === 'fortify');
  const eldermoor = villageOf('lexia');
  const inside = wallTilesOf(eldermoor)
    .flatMap((wall) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: wall.x + dx + 0.5, y: wall.y + dy + 0.5 })))
    .find((spot) => !isSolid(spot.x, spot.y) && zoneAt(spot.x, spot.y).id === 'lexia');
  Object.assign(game.player, inside);
  const spot = wallRepairSpotNear(game);
  assert.ok(spot, 'a wall to renovate next to the hero');
  applyWallRenovation(game, spot);
  assert.equal(game.counts.wallsRepaired, 1);
});
