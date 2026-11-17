// The things of the isekai side of the world (see data/isekai.js and logic/isekai/).
// cursed: true = once worn, it can not be taken off until a rite lifts the curse (logic/isekai/curses.js).
// Their text does not say it: the hero finds out too late. (After the rite, the thing stays, and stays strong.)

export const ISEKAI_ITEMS = {
  whisperRing: { name: 'Whispering Ring', icon: '💍', kind: 'accessory', cursed: true, power: 14, price: 0, sell: 60, text: 'Power +14. It hums a song you almost know.' },
  hungryAmulet: { name: 'Hungry Amulet', icon: '📿', kind: 'accessory', cursed: true, health: 60, price: 0, sell: 60, text: '+60 Max HP. It is warm, like something alive.' },
  crownOfThorns: { name: 'Crown of Thorns', icon: '👑', kind: 'accessory', cursed: true, power: 8, speed: 3, price: 0, sell: 80, text: 'Power +8, Speed +3. Nobody remembers who wore it.' },
  starShard: { name: 'Star Shard', icon: '🌠', kind: 'goods', sell: 120, text: 'A piece of a fallen star. Still warm. The merchants love them.' },
  // the food of another world, cooked by Hugo (Riverford)
  mayonnaise: { name: 'Mayonnaise', icon: '🥚', kind: 'food', food: 20, heal: 10, price: 12, sell: 4, text: 'Food +20, +10 HP. Eggs and oil. The whole kingdom is crazy about it.' },
  ramen: { name: 'Ramen', icon: '🍜', kind: 'food', food: 50, water: 25, heal: 20, price: 30, sell: 10, text: 'Food +50, water +25, +20 HP. Hot, salty, perfect.' },
  curryRice: { name: 'Curry Rice', icon: '🍛', kind: 'food', food: 75, heal: 35, price: 45, sell: 15, text: 'Food +75, +35 HP. A taste from another world.' },
  // realistic crafting, durability, encumbrance & kingdom border items
  repairKit: { name: 'Whetstone & Patch Kit', icon: '⚒️', kind: 'repair', repair: 45, price: 24, sell: 10, text: 'Restores +45% durability to weapon, armor & boots anywhere.' },
  antidote: { name: 'Herbal Antidote', icon: '💚', kind: 'potion', curesStatus: true, heal: 20, price: 18, sell: 7, text: 'Cures poison, burn & bleed in or out of fights (+20 HP).' },
  travelerPack: { name: 'Traveler Pack', icon: '🎒', kind: 'pack', capacityBonus: 18, price: 120, sell: 45, text: 'Sturdy leather rucksack (+18 kg carry capacity).' },
  warSatchel: { name: 'Mithril Pack', icon: '🎒', kind: 'pack', capacityBonus: 36, price: 320, sell: 130, text: 'Reinforced expedition pack (+36 kg carry capacity).' },
  wolfCloak: { name: 'Fur Cloak', icon: '🧥', kind: 'accessory', defense: 4, coldResist: 0.65, price: 110, sell: 45, text: 'Defense +4. Shields against rain & winter cold.' },
  hunterBow: { name: 'Hunter Bow', icon: '🏹', kind: 'weapon', power: 24, status: 'bleed', price: 220, sell: 90, text: 'Attack +24. Ashwood bow that can inflict Bleed in battle.' },
  bisonPlate: { name: 'Horned Brigandine', icon: '🛡️', kind: 'armor', defense: 24, health: 25, price: 480, sell: 190, text: 'Armor +24, Max HP +25. Forged with iron and bison horn.' },
  royalPass: { name: 'Diplomatic Pass', icon: '📜', kind: 'goods', price: 90, sell: 30, text: 'Stamped safe-conduct papers accepted at rival kingdom borders.' },
};
