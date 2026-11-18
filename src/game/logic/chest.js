import { ITEMS } from '../data/items';
import { pickRandom } from '../../logic/random';
import { countItem, addItem, removeItem, earnLexis } from './player';
import { carryCapacity, bagWeight } from './weight';
import { notify } from './messages';
import { burst } from './particles';
import { emote } from './emotes';
import { cue } from './cues';
import { ensureRealism, isTierEnabled } from './realism/state';
import { inspectChestWithMonocle } from './realism/magicPhysics';
import { stampPerishableAdded } from './realism/foodAndNature';

export const CHEST_SLOTS = 27;
const KEPT_KINDS = ['material', 'goods', 'food', 'seed'];

function sanitizeMap(map) {
  const clean = {};
  for (const [id, qty] of Object.entries(map || {})) {
    if (ITEMS[id] && qty > 0) clean[id] = qty;
  }
  return clean;
}

/** Opens the Minecraft-style home chest UI backed directly by game.home.storage. */
export function openHomeChest(game) {
  if (!game.home.storage || typeof game.home.storage !== 'object') game.home.storage = {};
  game.home.storage = sanitizeMap(game.home.storage);
  game.run.chest = {
    kind: 'home',
    key: 'home',
    title: 'Home Storage Chest',
    items: game.home.storage,
    maxSlots: CHEST_SLOTS,
    allowDeposit: true,
    lexis: 0,
  };
  game.run.screen = 'chest';
}

function buildChestLoot(chest) {
  const isSmall = chest.key.endsWith(':small');
  const danger = Math.max(1, chest.zone?.danger || 1);
  const loot = { healthPotion: isSmall ? 1 : 3 };
  if (isSmall) {
    const bonus = pickRandom(['oldCoin', 'manaPotion', 'flint', 'oil', 'bread']);
    loot[bonus] = (loot[bonus] || 0) + 1;
    if (danger >= 2) loot.ore = 2;
  } else {
    loot.gem = 1;
    loot.manaPotion = 2;
    loot[danger >= 3 ? 'crystal' : 'ore'] = danger >= 3 ? 2 : 3;
    if (Math.random() < 0.6) loot.mysteryRelic = 1;
  }
  return loot;
}

/** Opens an interactive dungeon/field chest UI where the player picks what to take. */
export function openWorldChest(game, chest) {
  if (!game.chestLoots || typeof game.chestLoots !== 'object') game.chestLoots = {};
  const isSmall = chest.key.endsWith(':small');
  const firstOpen = !game.chests[chest.key];
  if (firstOpen) {
    const r = game?.realism ? ensureRealism(game) : null;
    if (r && isTierEnabled(game, 'C') && !r.combatRealism.mimicChecked[chest.key]) {
      inspectChestWithMonocle(game, chest.key);
    }
    game.chests[chest.key] = true;
    const lexis = (isSmall ? 30 : 100) * Math.max(1, chest.zone?.danger || 1);
    earnLexis(game, lexis);
    game.chestLoots[chest.key] = buildChestLoot(chest);
    burst(game, chest.x + 0.5, chest.y + 0.5, '#ffd23f', 36);
    emote(game, 'hero', '!');
    cue(game, 'coin');
    notify(game, '🎁 ' + chest.zone.name + ' chest: +' + lexis + ' Lexis! Pick the items you want.', '#ffd23f');
  } else if (!game.chestLoots[chest.key]) {
    game.chestLoots[chest.key] = {};
  }
  game.chestLoots[chest.key] = sanitizeMap(game.chestLoots[chest.key]);
  game.run.chest = {
    kind: 'treasure',
    key: chest.key,
    title: (chest.zone?.name || 'Treasure') + ' Chest',
    items: game.chestLoots[chest.key],
    maxSlots: CHEST_SLOTS,
    allowDeposit: false,
    lexis: 0,
  };
  game.run.screen = 'chest';
}

export function closeChest(game) {
  const chest = game.run.chest;
  if (chest?.kind === 'treasure' && game.chestLoots) {
    const remaining = sanitizeMap(chest.items);
    if (Object.keys(remaining).length === 0) delete game.chestLoots[chest.key];
    else game.chestLoots[chest.key] = remaining;
  }
  game.run.chest = null;
  if (game.run.screen === 'chest') game.run.screen = 'play';
}

/** Returns padded fixed-length chest grid entries ([{ id, count } | null]). */
export function chestSlotsOf(chest) {
  const max = chest?.maxSlots || CHEST_SLOTS;
  const entries = Object.entries(chest?.items || {})
    .filter(([id, count]) => ITEMS[id] && count > 0)
    .map(([id, count]) => ({ id, count }));
  const slots = entries.slice(0, max);
  while (slots.length < max) slots.push(null);
  return slots;
}

/** Moves qty (or entire stack if qty === Infinity) from chest to player bag. */
export function takeFromChest(game, itemId, qty = 1) {
  const chest = game.run.chest;
  if (!chest || !chest.items?.[itemId] || !ITEMS[itemId]) return 0;
  const avail = chest.items[itemId];
  const take = Math.min(avail, qty === Infinity ? avail : Math.max(1, qty));
  chest.items[itemId] -= take;
  if (chest.items[itemId] <= 0) delete chest.items[itemId];
  addItem(game.player, itemId, take);
  stampPerishableAdded(game, itemId);
  cue(game, 'step');
  return take;
}

/** Moves qty (or entire stack) from player bag into the chest. */
export function storeInChest(game, itemId, qty = 1) {
  const chest = game.run.chest;
  if (!chest || !chest.allowDeposit || !ITEMS[itemId]) return 0;
  const have = countItem(game.player, itemId);
  if (have <= 0) return 0;
  const usedSlots = Object.keys(chest.items).length;
  if (!chest.items[itemId] && usedSlots >= (chest.maxSlots || CHEST_SLOTS)) {
    notify(game, '📦 The chest is full (' + CHEST_SLOTS + ' slots max).', '#ff8a95');
    return 0;
  }
  const move = Math.min(have, qty === Infinity ? have : Math.max(1, qty));
  removeItem(game.player, itemId, move);
  chest.items[itemId] = (chest.items[itemId] || 0) + move;
  cue(game, 'step');
  return move;
}

/** Transfers all chest items into the player's bag. */
export function takeAllFromChest(game) {
  const chest = game.run.chest;
  if (!chest) return 0;
  let moved = 0;
  for (const [id, count] of Object.entries({ ...chest.items })) {
    moved += takeFromChest(game, id, count);
  }
  notify(game, moved > 0 ? '📦 Took ' + moved + ' item(s) from the chest.' : 'The chest is empty.');
  return moved;
}

/** Stores materials, trade goods, food and seeds from the player's bag into a depositable chest. */
export function storeResourcesInChest(game) {
  const chest = game.run.chest;
  if (!chest?.allowDeposit) return 0;
  let moved = 0;
  for (const id of Object.keys({ ...game.player.bag })) {
    if (!KEPT_KINDS.includes(ITEMS[id]?.kind)) continue;
    moved += storeInChest(game, id, Infinity);
  }
  notify(game, moved > 0 ? '📦 Stored ' + moved + ' material/supply item(s).' : 'No materials or goods to store.');
  return moved;
}

export function bagSummaryForChest(game) {
  return {
    weight: bagWeight(game),
    capacity: carryCapacity(game),
  };
}
