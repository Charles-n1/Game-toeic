import { GEAR_ITEMS } from './items/gear';
import { CAMP_ITEMS } from './items/camp';
import { SOCIETY_ITEMS } from './items/society';
import { WAR_ITEMS } from './items/war';
import { ISEKAI_ITEMS } from './items/isekai';
import { REALISM_ITEMS } from './items/realism';

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

  // ---------- Fruits, wild harvest, fish & hunting drops ----------
  apple: { name: 'Crisp Apple', icon: '🍎', kind: 'food', food: 16, heal: 8, sell: 5, text: 'Food +16, +8 HP' },
  pear: { name: 'Juicy Pear', icon: '🍐', kind: 'food', food: 16, water: 6, heal: 8, sell: 5, text: 'Food +16, water +6, +8 HP' },
  cherry: { name: 'Sweet Cherries', icon: '🍒', kind: 'food', food: 14, heal: 10, sell: 6, text: 'Food +14, +10 HP' },
  orange: { name: 'Fresh Orange', icon: '🍊', kind: 'food', food: 16, water: 12, heal: 8, sell: 6, text: 'Food +16, water +12' },
  peach: { name: 'Ripe Peach', icon: '🍑', kind: 'food', food: 18, water: 8, heal: 10, sell: 6, text: 'Food +18, water +8, +10 HP' },
  plum: { name: 'Wild Plum', icon: '🫐', kind: 'food', food: 15, heal: 7, sell: 5, text: 'Food +15, +7 HP' },
  lemon: { name: 'Sunny Lemon', icon: '🍋', kind: 'food', food: 8, water: 14, heal: 6, sell: 5, text: 'Food +8, water +14' },
  fig: { name: 'Sweet Fig', icon: '🌰', kind: 'food', food: 18, heal: 10, sell: 7, text: 'Food +18, +10 HP' },
  olive: { name: 'Harvest Olives', icon: '🫒', kind: 'food', food: 14, heal: 8, sell: 6, text: 'Food +14, +8 HP' },
  coconut: { name: 'Fresh Coconut', icon: '🥥', kind: 'food', food: 20, water: 22, heal: 12, sell: 8, text: 'Food +20, water +22, +12 HP' },
  grapes: { name: 'Purple Grapes', icon: '🍇', kind: 'food', food: 18, water: 10, heal: 10, sell: 7, text: 'Food +18, water +10' },
  pumpkin: { name: 'Golden Pumpkin', icon: '🎃', kind: 'food', food: 28, heal: 14, sell: 12, text: 'Food +28, +14 HP' },
  melon: { name: 'Juicy Melon', icon: '🍉', kind: 'food', food: 24, water: 20, heal: 12, sell: 10, text: 'Food +24, water +20' },
  strawberry: { name: 'Fresh Strawberries', icon: '🍓', kind: 'food', food: 15, water: 6, heal: 10, sell: 7, text: 'Food +15, +10 HP' },
  wildBerries: { name: 'Wild Berries', icon: '🫐', kind: 'food', food: 14, water: 6, heal: 6, sell: 5, text: 'Food +14, water +6' },
  honey: { name: 'Golden Honey', icon: '🍯', kind: 'food', food: 26, heal: 22, sell: 16, text: 'Food +26, +22 HP. Rich wild nectar.' },
  mushroom: { name: 'Forest Mushroom', icon: '🍄', kind: 'food', food: 16, heal: 8, sell: 7, text: 'Food +16, +8 HP. Great in soup.' },
  rawFish: { name: 'Fresh Fish', icon: '🐟', kind: 'food', food: 16, raw: true, sell: 9, text: 'Food +16 (cook over camp fire!)' },
  pelt: { name: 'Soft Pelt', icon: '🧥', kind: 'goods', sell: 18, text: 'Warm animal fur sought by merchants.' },
  feather: { name: 'Wild Feather', icon: '🪶', kind: 'material', sell: 4, text: 'Plume gathered from birds and nests.' },
  antler: { name: 'Stag Antler', icon: '🦌', kind: 'goods', sell: 28, text: 'Carved ivory trophy or horn.' },
  wool: { name: 'Fleece Wool', icon: '🧶', kind: 'material', sell: 12, text: 'Soft fleece sheared or hunted from flocks.' },

  // ---------- Gathered materials (the torch of the hero is not an item: see logic/torch.js) ----------
  branch: { name: 'Branch', icon: '🪵', kind: 'material', sell: 1, text: 'From a tree. 2 branches make firewood.' },
  oil: { name: 'Lamp Oil', icon: '🫙', kind: 'material', price: 8, sell: 2, text: 'Oil for lamps.' },
  cloth: { name: 'Cloth', icon: '🧶', kind: 'material', price: 6, sell: 2, text: 'A roll of woven cloth.' },
  flint: { name: 'Flint Stone', icon: '🪨', kind: 'material', sell: 1, text: 'A hard stone, from a rock.' },
  torch: { name: 'Torch', icon: '🔦', kind: 'tool', sell: 4, text: 'A spare torch. You already carry one: sell it.' },

  // ---------- The items of each part of the game (see data/items/) ----------
  ...GEAR_ITEMS,
  ...CAMP_ITEMS,
  ...SOCIETY_ITEMS,
  ...WAR_ITEMS,
  ...ISEKAI_ITEMS,
  ...REALISM_ITEMS,
};

// The order of the upgrades at the smith: each one replaces the one before.
export const UPGRADES = {
  weapon: ['woodSword', 'ironSword', 'steelSword', 'mithrilSword', 'lexiconBlade'],
  armor: ['clothes', 'leatherArmor', 'chainMail', 'plateArmor'],
  boots: ['sandals', 'leatherBoots', 'windBoots'],
};

// What each kind of shop sells.
// The realism items sold here are only the ones that already work (potions, food, accessories).
// The tools, scrolls, workstations and the mule are not sold yet: nothing uses them.
export const SHOPS = {
  clinic: ['healthPotion', 'bigPotion', 'antidote', 'manaPotion', 'speedPotion', 'timePotion', 'hintPotion', 'herbalPoultice', 'antiseptic'],
  bakery: ['bread', 'carrotSeed', 'herbSeed', 'flowerSeed', 'oil', 'smokedJerky', 'pickledRadish', 'spicedBroth', 'honeyLemonTea'],
  potions: ['healthPotion', 'bigPotion', 'antidote', 'manaPotion', 'hintPotion', 'timePotion', 'speedPotion', 'herbalPoultice', 'antiseptic'],
  carpenter: ['table', 'chair', 'plant', 'shelf', 'homeLamp', 'painting', 'rugRed', 'rugBlue'],
  market: ['map1', 'map2', 'map3', 'travelerPack', 'repairKit', 'royalPass', 'ring', 'healthPotion', 'manaPotion', 'oil', 'hoodedCloak', 'monocle'],
  weaver: ['cloth', 'travelerPack'],
  otherworld: ['curryRice', 'ramen', 'mayonnaise', 'healthPotion', 'curryStew', 'omeletteRice', 'honeyToast', 'misoBroth', 'karagePlate'],
};

// The next item of an upgrade path (null = already the best).
export function nextUpgrade(kind, currentId) {
  const path = UPGRADES[kind];
  return path[path.indexOf(currentId) + 1] || null;
}
