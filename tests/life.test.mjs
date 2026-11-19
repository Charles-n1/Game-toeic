// The life of the world (life.txt): nothing pops in front of the eyes, the roads and the squares work, and
// helping a traveler never breaks the hero.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testGame, playFrames, distance } from './helpers.mjs';
import { tileAt, TILE, biomeAt } from '../src/game/world/map.js';
import { ensureRunLife } from '../src/game/logic/life/state.js';
import { OUT_OF_SIGHT } from '../src/game/logic/life/spots.js';
import { actionsOfNatureAndRoads } from '../src/game/logic/life/natureAndRoads.js';
import { syncVillagePerformers } from '../src/game/logic/life/villageEvents.js';
import { answer, nextRound, endFight } from '../src/game/logic/fight.js';

// A grass tile of a forest of the wild.
function forestSpot() {
  for (let y = 600; y < 2200; y += 31) for (let x = 600; x < 2200; x += 37) if (biomeAt(x, y) === 'forest' && tileAt(x, y) === TILE.GRASS) return { x: x + 0.5, y: y + 0.5 };
  return null;
}

// The things of the wild that appear by themselves: [{ thing, kind }].
function wildThings(game) {
  const rl = ensureRunLife(game);
  const life = game.life || {};
  return [
    ...rl.roadEvents.map((thing) => ({ thing, kind: 'road ' + thing.kind })),
    ...rl.warEntities.filter((w) => !w.villageId).map((thing) => ({ thing, kind: 'traveler ' + thing.kind })),
    ...rl.groundBirds.map((thing) => ({ thing, kind: 'bird' })),
    ...rl.birdNests.map((thing) => ({ thing, kind: 'nest' })),
    ...rl.forestTraps.map((thing) => ({ thing, kind: 'trap' })),
    ...rl.hunterCarcasses.map((thing) => ({ thing, kind: 'carcass' })),
    ...rl.pondFrogs.map((thing) => ({ thing, kind: 'frog' })),
    ...(rl.whiteStagEntity ? [{ thing: rl.whiteStagEntity, kind: 'stag' }] : []),
    ...(life.rainMushrooms || []).map((thing) => ({ thing, kind: 'mushroom' })),
    ...(life.fallenBranches || []).map((thing) => ({ thing, kind: 'branch' })),
  ];
}

test('nothing of the wild appears in sight of the hero', () => {
  const game = testGame();
  Object.assign(game.player, forestSpot());
  const seen = new Set();
  const popped = [];
  playFrames(game, 4000, (frame) => {
    if (frame % 20 === 0) game.player.x += 0.6; // the hero walks on
    for (const { thing, kind } of wildThings(game)) {
      if (seen.has(thing)) continue;
      seen.add(thing);
      if (distance(thing, game.player) < OUT_OF_SIGHT - 1) popped.push(kind);
    }
  });
  assert.ok(seen.size > 5, 'the wild is alive (' + seen.size + ' things)');
  assert.deepEqual(popped, [], 'appeared in sight');
});

test('resting at a campfire of the road heals the hero (and the health stays a number)', () => {
  const game = testGame();
  game.player.health = 40;
  const rl = ensureRunLife(game);
  rl.roadEvents.push({ id: 'rd-test', kind: 'campfire', name: 'Night Road Campfire', x: game.player.x + 1, y: game.player.y, tx: game.player.x, ty: game.player.y, solved: false, expiresAt: Date.now() + 60000 });
  actionsOfNatureAndRoads(game).find((a) => a.icon === 'talk').run();
  assert.ok(Number.isFinite(game.player.health));
  assert.equal(game.player.health, 55);
});

test('the highwaymen beaten, the road is open again', () => {
  const game = testGame();
  const rl = ensureRunLife(game);
  game.run.dialog = null; // (the intro of the story is not read in the tests)
  game.run.waitingDialogs = [];
  rl.roadEvents.push({ id: 'rd-bandit', kind: 'roadBandit', name: 'Highway Roadblock', x: game.player.x + 1, y: game.player.y, tx: game.player.x, ty: game.player.y, solved: false, expiresAt: Date.now() + 60000 });
  actionsOfNatureAndRoads(game).find((a) => a.icon === 'talk').run();
  game.run.dialog.choices.find((choice) => choice.label.includes('Highwaymen')).run();
  const fight = game.run.fight;
  assert.ok(fight, 'the fight starts');
  game.player.health = 99999;
  for (let i = 0; i < 300 && fight.phase !== 'won'; i++) {
    answer(game, fight, fight.question.correct_index);
    if (fight.phase === 'result') nextRound(game);
  }
  endFight(game);
  playFrames(game, 25);
  assert.ok(!rl.roadEvents.some((e) => e.id === 'rd-bandit'), 'the roadblock is gone');
});

test('the morning crier goes home when the morning is over', () => {
  const game = testGame();
  game.hour = 8;
  playFrames(game, 40);
  syncVillagePerformers(game);
  assert.ok(ensureRunLife(game).performers.some((p) => p.kind === 'crier'), 'a crier in the morning');
  game.hour = 13;
  playFrames(game, 2000);
  assert.ok(!ensureRunLife(game).performers.some((p) => p.kind === 'crier'), 'no crier at 1 pm');
});
