import { ITEMS } from '../data/items';
import { propsAround } from '../world/map';
import { addItem, heal, earnLexis } from './player';
import { notify } from './messages';
import { burst, floatText } from './particles';
import { cue } from './cues';

// Interactive harvesting and real-life countryside actions for fruit trees, bushes,
// beehives, fishing gear, nests, milk churns, mushrooms, burrows, and village benches.

export const HARVEST_SPECS = {
  // Fruit trees & orchards (regrow every day)
  appleTree: { item: 'apple', qty: 2, verb: 'Pick', icon: 'apple', color: '#e83232' },
  pearTree: { item: 'pear', qty: 2, verb: 'Pick', icon: 'pear', color: '#c8d64a' },
  cherryTree: { item: 'cherry', qty: 3, verb: 'Pick', icon: 'cherry', color: '#e8385a' },
  orangeTree: { item: 'orange', qty: 2, verb: 'Pick', icon: 'orange', color: '#ff9628' },
  peachTree: { item: 'peach', qty: 2, verb: 'Pick', icon: 'peach', color: '#ff9a8a' },
  plumTree: { item: 'plum', qty: 2, verb: 'Pick', icon: 'plum', color: '#9c68dc' },
  lemonTree: { item: 'lemon', qty: 2, verb: 'Pick', icon: 'lemon', color: '#ffd23f' },
  figTree: { item: 'fig', qty: 2, verb: 'Pick', icon: 'fig', color: '#8a58a8' },
  oliveTree: { item: 'olive', qty: 3, verb: 'Pick', icon: 'olive', color: '#98c46a' },
  coconutPalm: { item: 'coconut', qty: 1, verb: 'Harvest', icon: 'coconut', color: '#c48c52' },
  grapeVine: { item: 'grapes', qty: 2, verb: 'Harvest', icon: 'grapes', color: '#a864e0' },
  pumpkinPatch: { item: 'pumpkin', qty: 1, verb: 'Harvest', icon: 'pumpkin', color: '#ffb040' },
  melonPatch: { item: 'melon', qty: 1, verb: 'Harvest', icon: 'melon', color: '#6ed85a' },
  strawberryPatch: { item: 'strawberry', qty: 3, verb: 'Pick', icon: 'strawberry', color: '#ff5a78' },

  // Wild bushes & blooms
  bushBerry: { item: 'wildBerries', qty: 2, verb: 'Pick', icon: 'wildBerries', color: '#e83b48' },
  bushBerryBlue: { item: 'wildBerries', qty: 2, verb: 'Pick', icon: 'wildBerries', color: '#4a7cff' },
  bushRose: { item: 'herb', qty: 1, verb: 'Gather', icon: 'herb', color: '#ff6fa8' },
  roseBush: { item: 'flower', qty: 1, verb: 'Pick', icon: 'flower', color: '#ff6fa8' },
  lavenderRow: { item: 'herb', qty: 1, verb: 'Gather', icon: 'herb', color: '#b48cff' },
  sunflowerPatch: { item: 'flower', qty: 1, verb: 'Pick', icon: 'flower', color: '#ffd23f' },
  tulipBed: { item: 'flower', qty: 1, verb: 'Pick', icon: 'flower', color: '#ff8c2b' },
  bluebells: { item: 'flower', qty: 1, verb: 'Pick', icon: 'flower', color: '#7fd6ff' },
  poppies: { item: 'flower', qty: 1, verb: 'Pick', icon: 'flower', color: '#ff5a4a' },
  moonflower: { item: 'herb', qty: 1, verb: 'Gather', icon: 'moonflower', fallbackIcon: 'herb', color: '#8af6ff' },
  cactusFlower: { item: 'pear', qty: 1, verb: 'Pick', icon: 'pear', color: '#ff6fa8' },
  hibiscusBush: { item: 'flower', qty: 1, verb: 'Pick', icon: 'flower', color: '#ff8a95' },

  // Authentic countryside life elements
  beehive: { item: 'honey', qty: 1, verb: 'Honey', icon: 'honey', color: '#ffd23f', sting: 2 },
  mushroomRing: { item: 'mushroom', qty: 2, verb: 'Forage', icon: 'mushroom', color: '#e8b83a' },
  reedNest: { item: 'egg', qty: 2, extra: 'feather', verb: 'Gather', icon: 'egg', color: '#f4ead8' },
  milkChurns: { item: 'milk', qty: 1, verb: 'Take', icon: 'milk', color: '#ffffff' },
  fishingGear: { item: 'rawFish', qty: 1, coinChance: 0.25, verb: 'Fish', icon: 'rawFish', color: '#7fd6ff' },
  hayBale: { item: 'hay', qty: 1, verb: 'Take', icon: 'hay', color: '#ffd23f' },
  woodPile: { item: 'firewood', qty: 1, verb: 'Take', icon: 'firewood', color: '#c48c52' },
  hollowStump: { item: 'branch', qty: 2, verb: 'Gather', icon: 'branch', color: '#a0683a' },
  mossyLog: { item: 'branch', qty: 2, verb: 'Gather', icon: 'branch', color: '#6ed85a' },
  picnicBlanket: { item: 'bread', qty: 1, extra: 'apple', verb: 'Take', icon: 'bread', color: '#ffd23f' },
  birdhouse: { item: 'feather', qty: 2, verb: 'Gather', icon: 'feather', color: '#ffffff' },
  anthill: { item: 'herb', qty: 1, verb: 'Forage', icon: 'herb', color: '#a86c36', sting: 1 },
  rabbitBurrow: { item: 'carrot', qty: 1, verb: 'Forage', icon: 'carrot', color: '#ff9a2b' },
  foxDen: { item: 'bone', qty: 1, verb: 'Forage', icon: 'bone', color: '#e8eef7' },
  badgerHole: { item: 'mushroom', qty: 1, verb: 'Forage', icon: 'mushroom', color: '#c89a64' },
  stoneBench: { bench: true, verb: 'Rest', icon: 'heart', color: '#9fe8a8' },
};

function keyOfProp(prop) {
  return prop.kind + ':' + Math.floor(prop.x) + ',' + Math.floor(prop.y);
}

export function isPropHarvested(game, prop) {
  if (!game || !prop || !HARVEST_SPECS[prop.kind]) return false;
  if (HARVEST_SPECS[prop.kind].bench) return false;
  if (!game.harvested) return false;
  return game.harvested[keyOfProp(prop)] === game.day;
}

export function harvestableNear(game, range = 1.65) {
  let best = null;
  let bestDist = range;
  for (const prop of propsAround(game.player.x, game.player.y, range)) {
    const spec = HARVEST_SPECS[prop.kind];
    if (!spec) continue;
    if (!spec.bench && isPropHarvested(game, prop)) continue;
    const dist = Math.hypot(prop.x + (prop.w || 1) / 2 - game.player.x, prop.y + (prop.h || 1) / 2 - game.player.y);
    if (dist < bestDist) {
      best = { prop, spec, icon: spec.fallbackIcon || spec.icon };
      bestDist = dist;
    }
  }
  return best;
}

export function harvestProp(game, prop) {
  if (!prop) return false;
  const spec = HARVEST_SPECS[prop.kind];
  if (!spec) return false;
  const px = prop.x + (prop.w || 1) / 2;
  const py = prop.y + (prop.h || 1) / 2;

  if (spec.bench) {
    heal(game.player, 12);
    if (game.player.cold && game.player.cold.exposure > 0) {
      game.player.cold.exposure = Math.max(0, game.player.cold.exposure - 0.3);
    }
    burst(game, px, py - 0.3, spec.color, 8);
    floatText(game, px, py - 0.6, '+12 HP', '#7cfc9a');
    notify(game, '🪑 You sit down for a peaceful moment (+12 HP).', '#a8f0c0');
    return true;
  }

  if (!game.harvested || typeof game.harvested !== 'object') game.harvested = {};
  if (isPropHarvested(game, prop)) return false;
  game.harvested[keyOfProp(prop)] = game.day;

  const qty = spec.qty || 1;
  addItem(game.player, spec.item, qty);
  const itemMeta = ITEMS[spec.item];
  const label = `+${qty} ${itemMeta ? itemMeta.name : spec.item}`;
  burst(game, px, py - 0.4, spec.color || '#ffd23f', 10);
  floatText(game, px, py - 0.6, label, '#ffe9a8');
  cue(game, 'coin');

  let msg = `${itemMeta ? itemMeta.icon : '🌿'} Harvested ${label}!`;
  if (spec.extra) {
    addItem(game.player, spec.extra, 1);
    const extraMeta = ITEMS[spec.extra];
    if (extraMeta) msg += ` (+1 ${extraMeta.name})`;
  }
  if (spec.coinChance && Math.random() < spec.coinChance) {
    earnLexis(game, 8);
    msg += ' (+8 Lexis found on the line!)';
  }
  if (spec.sting && Math.random() < 0.25) {
    game.player.health = Math.max(1, Math.round(game.player.health) - spec.sting);
    msg += ` (Ouch, stung for -${spec.sting} HP!)`;
  }
  notify(game, msg, '#ffe9a8');
  return true;
}
