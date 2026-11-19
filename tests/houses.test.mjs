// Every kind of building can be entered, its upstairs too, and everyone inside can be talked to.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testGame, playFrames } from './helpers.mjs';
import { HOUSES } from '../src/game/data/zones.js';
import { travelTo } from '../src/game/logic/update.js';
import { enterVisitedHouse, enterHeroUpperFloor, applyVisitedFloor } from '../src/game/logic/houses.js';
import { talkToSpecialPatron } from '../src/game/logic/houses/hallTalk.js';

// One building of each kind (role), in all the world.
function oneOfEachKind() {
  const byRole = new Map();
  for (const house of HOUSES) if (!byRole.has(house.role) && house.role !== 'home') byRole.set(house.role, house);
  return [...byRole.values()];
}

test('each kind of building: in, upstairs, back down, and a word with everyone', () => {
  const game = testGame();
  const kinds = oneOfEachKind();
  assert.ok(kinds.length > 10);
  for (const house of kinds) {
    enterVisitedHouse(game, house, travelTo);
    const visit = game.run.visitHouse;
    assert.ok(visit, house.role + ': entered');
    playFrames(game, 20);
    for (const patron of visit.patrons || []) talkToSpecialPatron(game, patron, visit);
    enterHeroUpperFloor(game, travelTo);
    playFrames(game, 20);
    applyVisitedFloor(game, visit, 0);
  }
});

test('the guild hall has the registrar of the Adventurer Cards', () => {
  const game = testGame();
  enterVisitedHouse(game, HOUSES.find((house) => house.role === 'guild'), travelTo);
  assert.ok(game.run.visitHouse.patrons.some((patron) => patron.kind === 'registrar'));
});
