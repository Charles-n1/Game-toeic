// Every shop opens, and sells only its kind of items.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testGame } from './helpers.mjs';
import { ITEMS, SHOPS } from '../src/game/data/items.js';
import { shopItems } from '../src/game/logic/shop.js';

// Who may sell what: the potions only at the potion house (the clinic sells care: poultices, antiseptic),
// the weapons and armor only at the forge, the armory and the arcane shop (a staff).
const SOLD_ONLY_AT = {
  potion: ['potions'],
  weapon: ['forge', 'armory', 'arcane', 'smithy'],
  armor: ['forge', 'armory', 'smithy'],
};

// The kind of an item, for the shops: a "potion" is an item named so (Health Potion, Elixir...).
function shopKindOf(item) {
  if (item.kind === 'potion') return /potion|elixir/i.test(item.name) ? 'potion' : 'care';
  return item.kind;
}

test('every shop opens and has something to sell', () => {
  const game = testGame();
  for (const kind of Object.keys(SHOPS)) assert.ok(shopItems(game, kind).length > 0, kind + ' is empty');
});

test('every shop sells only its kind of items', () => {
  const game = testGame();
  for (const kind of Object.keys(SHOPS)) {
    for (const itemId of shopItems(game, kind)) {
      const allowed = SOLD_ONLY_AT[shopKindOf(ITEMS[itemId])];
      if (allowed) assert.ok(allowed.includes(kind), ITEMS[itemId].name + ' (' + ITEMS[itemId].kind + ') sold at ' + kind);
    }
  }
});
