// Camping and cooking: firewood, the cooking pot, the magic heater, wheat, dried meat, and the dishes.
// Same format as data/items.js (they are merged into ITEMS there).
export const CAMP_ITEMS = {
  firewood: { name: 'Firewood', icon: '🪵', kind: 'material', price: 8, sell: 2, text: 'Dry logs for a campfire. Craft from 2 branches or buy.' },
  autoHeater: { name: 'Magic Auto-Heater', icon: '🔮', kind: 'tool', price: 650, text: 'Permanent arcane heater: lights and keeps campfires burning with zero firewood.' },
  cookingPot: { name: 'Cooking Pot', icon: '🍲', kind: 'tool', text: 'Iron pot on a tripod for cooking hearty meals at camp.' },
  driedMeat: { name: 'Dried Meat', icon: '🥓', kind: 'food', food: 35, heal: 10, price: 18, sell: 7, text: 'Food +35, +10 HP. Non-perishable travel jerky.' },

  wheatSeed: { name: 'Wheat Seed', icon: '🌾', kind: 'seed', grows: 'wheat', price: 2, text: 'Plant on soil to grow golden wheat.' },
  wheat: { name: 'Wheat', icon: '🌾', kind: 'goods', sell: 5, text: 'Golden grain from the fields. Used for porridge and feasts.' },

  spicedStew: { name: 'Spiced Stew', icon: '🍲', kind: 'food', food: 65, water: 15, heal: 35, sell: 24, text: 'Food +65, +35 HP · Attack +6, Speed +2 (12h)' },
  hunterSkewer: { name: "Hunter's Skewer", icon: '🍢', kind: 'food', food: 55, heal: 25, sell: 22, text: 'Food +55, +25 HP · Speed +4, Attack +4 (12h)' },
  heartySoup: { name: 'Hearty Soup', icon: '🥣', kind: 'food', food: 60, water: 25, heal: 40, sell: 24, text: 'Food +60, water +25, +40 HP · Health +25, Defense +4 (12h)' },
  scholarTea: { name: 'Scholar Tea', icon: '🍵', kind: 'food', food: 20, water: 45, heal: 20, sell: 20, text: 'Food +20, water +45, +20 HP · Spell +20, Speed +2 (12h)' },
  honeyPorridge: { name: 'Honey Porridge', icon: '🥣', kind: 'food', food: 60, water: 10, heal: 30, sell: 22, text: 'Food +60, +30 HP · Defense +5, Health +20 (12h)' },
  travelersFeast: { name: "Traveler's Feast", icon: '🍱', kind: 'food', food: 95, water: 30, heal: 60, sell: 45, text: 'Food +95, water +30, +60 HP · All stats boosted (16h)' },
  roastedFish: { name: 'Grilled River Fish', icon: '🐟', kind: 'food', food: 48, heal: 24, sell: 20, text: 'Food +48, +24 HP · Speed +3 (8h)' },
  mushroomSoup: { name: 'Wild Mushroom Soup', icon: '🍄', kind: 'food', food: 52, water: 28, heal: 32, sell: 22, text: 'Food +52, water +28, +32 HP · Spell +10 (10h)' },
  berryTart: { name: 'Honey Berry Tart', icon: '🥧', kind: 'food', food: 65, heal: 38, sell: 28, text: 'Food +65, +38 HP · Speed +4, Health +15 (12h)' },
};
