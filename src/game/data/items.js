import { GEAR_ITEMS } from './items/gear';
import { CAMP_ITEMS } from './items/camp';
import { SOCIETY_ITEMS } from './items/society';
import { WAR_ITEMS } from './items/war';

// Everything the player can own.
// kind: 'weapon' | 'armor' | 'boots' (equipment), 'potion', 'map', 'seed', 'goods' (to sell or to give),
//       'material' (to make things), 'tool', 'food' (to eat: food = hunger filled, water = thirst), 'furniture'.
// seed: grows into `grows`. furniture: its look in the home (see draw/buildings.js furniture), color.
// price: what a shop asks, in Lexis. sell: what a shop gives for it.
// power: the damage of the weapon, in HP. defense: the HP the armor stops at each hit.
export const ITEMS = {
  woodSword: { name: 'Wooden Sword', icon: '🗡️', kind: 'weapon', power: 10, price: 0 },
  ironSword: { name: 'Iron Sword', icon: '🗡️', kind: 'weapon', power: 20, price: 120 },
  steelSword: { name: 'Steel Sword', icon: '⚔️', kind: 'weapon', power: 30, price: 400 },
  mithrilSword: { name: 'Mithril Sword', icon: '⚔️', kind: 'weapon', power: 40, price: 1200 },
  lexiconBlade: { name: 'Lexicon Blade', icon: '✨', kind: 'weapon', power: 60, price: 3500 },

  clothes: { name: 'Traveler Clothes', icon: '👕', kind: 'armor', defense: 0, price: 0 },
  leatherArmor: { name: 'Leather Armor', icon: '🦺', kind: 'armor', defense: 10, price: 150 },
  chainMail: { name: 'Chain Mail', icon: '🛡️', kind: 'armor', defense: 20, price: 500 },
  plateArmor: { name: 'Plate Armor', icon: '🛡️', kind: 'armor', defense: 30, price: 1500 },

  sandals: { name: 'Sandals', icon: '🩴', kind: 'boots', speed: 0, price: 0 },
  leatherBoots: { name: 'Leather Boots', icon: '🥾', kind: 'boots', speed: 2, price: 100 },
  windBoots: { name: 'Wind Boots', icon: '👟', kind: 'boots', speed: 5, price: 600 },

  healthPotion: { name: 'Health Potion', icon: '🧪', kind: 'potion', heal: 60, price: 15, text: '+60 HP' },
  bigPotion: { name: 'Big Health Potion', icon: '🧪', kind: 'potion', heal: 150, price: 60, text: '+150 HP' },
  manaPotion: { name: 'Mana Potion', icon: '🔮', kind: 'potion', mana: 5, price: 20, text: '+5 mana' },
  speedPotion: { name: 'Speed Potion', icon: '💨', kind: 'potion', haste: true, price: 30, text: '+50% time in a fight' },
  // inFight: only during a question of a fight.
  timePotion: { name: 'Time Potion', icon: '⏳', kind: 'potion', inFight: true, extraTime: 5, price: 25, text: '+5 s for the question (in a fight)' },
  hintPotion: { name: 'Hint Potion', icon: '💡', kind: 'potion', inFight: true, hint: true, price: 40, text: 'Removes 1 wrong answer (in a fight)' },
  bread: { name: 'Warm Bread', icon: '🍞', kind: 'food', food: 30, heal: 20, price: 6, sell: 2, text: 'Food +30, +20 HP' },

  map1: { name: 'Village Map', icon: '🗺️', kind: 'map', level: 1, price: 60, text: 'Shows the villages and the roads' },
  map2: { name: 'Region Map', icon: '🗺️', kind: 'map', level: 2, price: 250, text: 'Shows the whole land' },
  map3: { name: 'Treasure Map', icon: '🗺️', kind: 'map', level: 3, price: 800, text: 'Shows the buried treasures' },

  carrotSeed: { name: 'Carrot Seed', icon: '🌱', kind: 'seed', grows: 'carrot', price: 2 },
  herbSeed: { name: 'Herb Seed', icon: '🌱', kind: 'seed', grows: 'herb', price: 4 },
  flowerSeed: { name: 'Flower Seed', icon: '🌱', kind: 'seed', grows: 'flower', price: 3 },
  carrot: { name: 'Carrot', icon: '🥕', kind: 'food', food: 12, sell: 8, text: 'Food +12' },
  flower: { name: 'Flower', icon: '🌼', kind: 'goods', sell: 3 },
  oldCoin: { name: 'Old Coin', icon: '🪙', kind: 'goods', sell: 25 },
  gem: { name: 'Gem', icon: '💎', kind: 'goods', sell: 80 },
  ring: { name: 'Silver Ring', icon: '💍', kind: 'goods', price: 500, sell: 100 },

  // ---------- Food (see logic/survival.js): the monsters leave meat and bones, cooked at a fire ----------
  rawMeat: { name: 'Raw Meat', icon: '🥩', kind: 'food', food: 10, raw: true, sell: 3, text: 'Food +10 (cook it!)' },
  roastMeat: { name: 'Roast Meat', icon: '🍖', kind: 'food', food: 40, heal: 15, sell: 10, text: 'Food +40, +15 HP' },
  bone: { name: 'Bone', icon: '🦴', kind: 'material', sell: 2, text: '2 bones + water = a broth' },
  broth: { name: 'Bone Broth', icon: '🥣', kind: 'food', food: 25, water: 30, heal: 10, sell: 8, text: 'Food +25, water +30' },
  herb: { name: 'Herb', icon: '🌿', kind: 'food', food: 4, sell: 4, text: 'For a stew, for potions' },
  herbStew: { name: 'Herb Stew', icon: '🍲', kind: 'food', food: 55, water: 20, heal: 30, sell: 18, text: 'Food +55, water +20, +30 HP' },
  ore: { name: 'Iron Ore', icon: '⛏️', kind: 'goods', sell: 14, text: 'From a mine. Smiths buy it.' },
  crystal: { name: 'Blue Crystal', icon: '💎', kind: 'goods', sell: 30, text: 'From a mine. It hums.' },

  // ---------- The furniture of the home (Finn, the carpenter) ----------
  table: { name: 'Wooden Table', icon: '🪑', kind: 'furniture', furniture: 'table', color: '#a0683a', price: 40 },
  chair: { name: 'Chair', icon: '🪑', kind: 'furniture', furniture: 'chair', color: '#8a5a30', price: 20 },
  plant: { name: 'Potted Plant', icon: '🪴', kind: 'furniture', furniture: 'plant', color: '#ff6fa8', price: 25 },
  shelf: { name: 'Bookshelf', icon: '📚', kind: 'furniture', furniture: 'shelf', color: '#7a4a24', price: 60 },
  homeLamp: { name: 'Lamp', icon: '💡', kind: 'furniture', furniture: 'lamp', color: '#ffd23f', price: 35 },
  painting: { name: 'Painting', icon: '🖼️', kind: 'furniture', furniture: 'painting', color: '#4cc35a', price: 50 },
  rugRed: { name: 'Red Rug', icon: '🟥', kind: 'furniture', furniture: 'rug', color: '#b8303a', price: 30 },
  rugBlue: { name: 'Blue Rug', icon: '🟦', kind: 'furniture', furniture: 'rug', color: '#2f50a0', price: 30 },

  // ---------- A torch for the night (see logic/torch.js) ----------
  branch: { name: 'Branch', icon: '🪵', kind: 'material', sell: 1, text: 'From a tree. For a torch.' },
  oil: { name: 'Lamp Oil', icon: '🫙', kind: 'material', price: 8, sell: 2, text: 'For a torch.' },
  cloth: { name: 'Cloth', icon: '🧶', kind: 'material', price: 6, sell: 2, text: 'For a torch.' },
  flint: { name: 'Flint Stone', icon: '🪨', kind: 'material', sell: 1, text: 'From a rock. Strike 2 to light a fire.' },
  torch: { name: 'Torch', icon: '🔦', kind: 'tool', sell: 4, text: 'Light it at a fire, or with 2 flint stones.' },

  // ---------- The items of each part of the game (see data/items/) ----------
  ...GEAR_ITEMS,
  ...CAMP_ITEMS,
  ...SOCIETY_ITEMS,
  ...WAR_ITEMS,
};

// The order of the upgrades at the smith: each one replaces the one before.
export const UPGRADES = {
  weapon: ['woodSword', 'ironSword', 'steelSword', 'mithrilSword', 'lexiconBlade'],
  armor: ['clothes', 'leatherArmor', 'chainMail', 'plateArmor'],
  boots: ['sandals', 'leatherBoots', 'windBoots'],
};

// What each kind of shop sells.
export const SHOPS = {
  clinic: ['healthPotion', 'bigPotion', 'manaPotion', 'speedPotion', 'timePotion', 'hintPotion'],
  bakery: ['bread', 'carrotSeed', 'herbSeed', 'flowerSeed', 'oil'],
  potions: ['healthPotion', 'bigPotion', 'manaPotion', 'hintPotion', 'timePotion', 'speedPotion'],
  carpenter: ['table', 'chair', 'plant', 'shelf', 'homeLamp', 'painting', 'rugRed', 'rugBlue'],
  market: ['map1', 'map2', 'map3', 'ring', 'healthPotion', 'manaPotion', 'oil'],
  weaver: ['cloth'],
};

// The next item of an upgrade path (null = already the best).
export function nextUpgrade(kind, currentId) {
  const path = UPGRADES[kind];
  return path[path.indexOf(currentId) + 1] || null;
}
