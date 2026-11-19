// Each boss, once beaten, only removes itself: no other boss, no floor of the castle disappears.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testGame } from './helpers.mjs';
import { SPECIES } from '../src/game/data/monsters.js';
import { STORY_DUNGEONS } from '../src/game/data/dungeons.js';
import { TOWER_FLOORS } from '../src/game/logic/isekaiTodo/dungeonsPlus.js';
import { makeMonster } from '../src/game/logic/monsters.js';
import { removeMonster } from '../src/game/logic/loot.js';

const STORY_BOSSES = STORY_DUNGEONS.flatMap((dungeon) => [dungeon.boss, ...Object.values(dungeon.floorBosses || {})]).filter(Boolean);

test('beating a boss marks only that boss as dead', () => {
  for (const species of Object.keys(SPECIES).filter((id) => SPECIES[id].boss)) {
    const game = testGame();
    removeMonster(game, makeMonster(game, species, 0, 0));
    assert.deepEqual(Object.keys(game.bosses), [species]);
  }
});

test('the Spire of Babel uses none of the bosses of the story (beating it there would kill them)', () => {
  for (const floor of TOWER_FLOORS) assert.ok(!STORY_BOSSES.includes(floor.species), 'floor ' + floor.floor + ': ' + floor.species);
});
