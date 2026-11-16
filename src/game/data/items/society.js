// Trade goods, horse feed, wheat, decorations, turrets, and rare luxury goods.
// Same format as data/items.js (they are merged into ITEMS there).
export const SOCIETY_ITEMS = {
  wheat: { name: 'Wheat', icon: '🌾', kind: 'goods', price: 8, sell: 5, text: 'Golden grain from the fields. Horses love it.' },
  wheatSeed: { name: 'Wheat Seed', icon: '🌱', kind: 'seed', grows: 'wheat', price: 2, sell: 1, text: 'Plant on soil to grow golden wheat.' },
  egg: { name: 'Fresh Egg', icon: '🥚', kind: 'food', food: 10, heal: 5, price: 5, sell: 2, text: 'Food +10, +5 HP' },
  milk: { name: 'Fresh Milk', icon: '🥛', kind: 'food', food: 8, water: 20, heal: 5, price: 8, sell: 4, text: 'Food +8, water +20, +5 HP' },
  hay: { name: 'Hay Bale', icon: '🌾', kind: 'goods', price: 8, sell: 3, text: 'Dry fodder to feed a hungry horse.' },
  horseFeed: { name: 'Horse Feed', icon: '🐴', kind: 'goods', price: 16, sell: 7, text: 'Rich oats and apples. Fully feeds your horse.' },
  firewood: { name: 'Firewood', icon: '🪵', kind: 'material', price: 8, sell: 2, text: 'Dry logs for a campfire and village builders.' },
  stone: { name: 'Cut Stone', icon: '🪨', kind: 'material', price: 10, sell: 5, text: 'Dressed stone for walls and turrets.' },
  lampOil: { name: 'Refined Lamp Oil', icon: '🫙', kind: 'material', price: 10, sell: 4, text: 'Clean oil for street lamps and torches.' },
  driedMeat: { name: 'Dried Meat', icon: '🥓', kind: 'food', food: 35, heal: 10, price: 18, sell: 7, text: 'Food +35, +10 HP. Keeps well on long rides.' },
  rope: { name: 'Hemp Rope', icon: '🪢', kind: 'material', price: 12, sell: 5, text: 'Sturdy braided rope for travel and gear.' },
  decorBanner: { name: 'Festival Banner', icon: '🚩', kind: 'material', price: 40, sell: 18, text: 'Decorates a village square (+decor, +mood).' },
  turretKit: { name: 'Turret Kit', icon: '🗼', kind: 'material', price: 110, sell: 50, text: 'Timber and iron parts to raise a village turret.' },
  rareSpice: { name: 'Kharsa Spice', icon: '🧂', kind: 'goods', price: 180, sell: 90, rare: true, text: 'Rare aromatic spice from desert caravans.' },
  silkBolt: { name: 'Aurelian Silk', icon: '🎀', kind: 'goods', price: 240, sell: 120, rare: true, text: 'Fine shimmering silk from coastal looms.' },
  silverBrooch: { name: 'Silver Brooch', icon: '📿', kind: 'goods', price: 320, sell: 160, rare: true, text: 'Delicate noble jewelry. Very valuable.' },
  goldenChalice: { name: 'Golden Chalice', icon: '🏆', kind: 'goods', price: 450, sell: 225, rare: true, text: 'Royal craftsmanship. Worth a fortune.' },
};
