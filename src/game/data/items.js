// Everything the player can own.
// kind: 'weapon' | 'armor' | 'boots' (equipment), 'potion', 'map', 'seed', 'goods' (to sell or to give).
// price: what a shop asks, in Lexis. sell: what a shop gives for it.
// Health and damage are counted in HALF hearts: power 1 = half a heart.
export const ITEMS = {
  woodSword: { name: 'Wooden Sword', icon: '🗡️', kind: 'weapon', power: 1, price: 0 },
  ironSword: { name: 'Iron Sword', icon: '🗡️', kind: 'weapon', power: 2, price: 120 },
  steelSword: { name: 'Steel Sword', icon: '⚔️', kind: 'weapon', power: 3, price: 400 },
  mithrilSword: { name: 'Mithril Sword', icon: '⚔️', kind: 'weapon', power: 4, price: 1200 },
  lexiconBlade: { name: 'Lexicon Blade', icon: '✨', kind: 'weapon', power: 6, price: 3500 },

  clothes: { name: 'Traveler Clothes', icon: '👕', kind: 'armor', defense: 0, price: 0 },
  leatherArmor: { name: 'Leather Armor', icon: '🦺', kind: 'armor', defense: 1, price: 150 },
  chainMail: { name: 'Chain Mail', icon: '🛡️', kind: 'armor', defense: 2, price: 500 },
  plateArmor: { name: 'Plate Armor', icon: '🛡️', kind: 'armor', defense: 3, price: 1500 },

  sandals: { name: 'Sandals', icon: '🩴', kind: 'boots', speed: 0, price: 0 },
  leatherBoots: { name: 'Leather Boots', icon: '🥾', kind: 'boots', speed: 2, price: 100 },
  windBoots: { name: 'Wind Boots', icon: '👟', kind: 'boots', speed: 5, price: 600 },

  healthPotion: { name: 'Health Potion', icon: '🧪', kind: 'potion', heal: 6, price: 15, text: '+3 hearts' },
  manaPotion: { name: 'Mana Potion', icon: '🔮', kind: 'potion', mana: 5, price: 20, text: '+5 mana' },
  speedPotion: { name: 'Speed Potion', icon: '💨', kind: 'potion', haste: true, price: 30, text: '+50% time in a fight' },
  bread: { name: 'Warm Bread', icon: '🍞', kind: 'potion', heal: 2, price: 6, text: '+1 heart' },

  map1: { name: 'Village Map', icon: '🗺️', kind: 'map', level: 1, price: 60, text: 'Shows the villages' },
  map2: { name: 'Region Map', icon: '🗺️', kind: 'map', level: 2, price: 250, text: 'Shows the dungeons' },
  map3: { name: 'Treasure Map', icon: '🗺️', kind: 'map', level: 3, price: 800, text: 'Shows the buried treasures' },

  carrotSeed: { name: 'Carrot Seed', icon: '🌱', kind: 'seed', price: 2 },
  carrot: { name: 'Carrot', icon: '🥕', kind: 'goods', sell: 8 },
  flower: { name: 'Flower', icon: '🌼', kind: 'goods', sell: 3 },
  oldCoin: { name: 'Old Coin', icon: '🪙', kind: 'goods', sell: 25 },
  gem: { name: 'Gem', icon: '💎', kind: 'goods', sell: 80 },
  ring: { name: 'Silver Ring', icon: '💍', kind: 'goods', price: 500, sell: 100 },
};

// The order of the upgrades at the smith: each one replaces the one before.
export const UPGRADES = {
  weapon: ['woodSword', 'ironSword', 'steelSword', 'mithrilSword', 'lexiconBlade'],
  armor: ['clothes', 'leatherArmor', 'chainMail', 'plateArmor'],
  boots: ['sandals', 'leatherBoots', 'windBoots'],
};

// What each kind of shop sells.
export const SHOPS = {
  clinic: ['healthPotion', 'manaPotion', 'speedPotion'],
  bakery: ['bread', 'carrotSeed'],
  market: ['map1', 'map2', 'map3', 'ring', 'healthPotion', 'manaPotion'],
};

// The next item of an upgrade path (null = already the best).
export function nextUpgrade(kind, currentId) {
  const path = UPGRADES[kind];
  return path[path.indexOf(currentId) + 1] || null;
}
