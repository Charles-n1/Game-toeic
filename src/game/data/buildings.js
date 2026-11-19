// The buildings of the villages. Their size is in tiles (the hero is about 1 tile wide, 2 tiles tall):
// real houses, several times bigger than the hero.
//   hut: a rough hut of logs and straw (young villages, hamlets)   cottage: a small house
//   house: a family house                                            shop: a house with a shop
//   big: an inn, a clinic, a market...                               hall: the guild, a school
//   church: a church with its bell tower                             mill: a windmill
//   palace: the palace of a capital

export const BUILDING_SIZES = {
  hut: { w: 6, h: 5 },
  cottage: { w: 8, h: 6 },
  house: { w: 9, h: 7 },
  shop: { w: 9, h: 7 },
  big: { w: 11, h: 8 },
  hall: { w: 13, h: 9 },
  church: { w: 11, h: 9 },
  mill: { w: 8, h: 8 },
  palace: { w: 26, h: 16 },
};

// role: what the building is for -> its size, the sign over its door (an icon of draw/icons.js, null = none),
// and its name (what the map and the people call it).
export const ROLES = {
  home: { size: 'cottage', sign: null, name: 'Your home' },
  house: { size: null, sign: null, name: 'A house' }, // its size depends on how rich the village is
  library: { size: 'big', sign: 'book', name: 'Library' },
  clinic: { size: 'big', sign: 'healthPotion', name: 'House of healing' },
  potions: { size: 'shop', sign: 'potion', name: 'House of potions' },
  guild: { size: 'hall', sign: 'guild', name: 'Guild of adventurers' },
  forge: { size: 'shop', sign: 'ironSword', name: 'Forge' },
  armory: { size: 'shop', sign: 'ironSword', name: 'Armory' },
  smithy: { size: 'shop', sign: 'ironSword', name: 'Smithy' },
  arcane: { size: 'shop', sign: 'star', name: 'Arcane house' },
  weaver: { size: 'shop', sign: 'cloth', name: 'Weaver' },
  bakery: { size: 'shop', sign: 'bread', name: 'Bakery' },
  elder: { size: 'house', sign: null, name: 'House of the elder' },
  farm: { size: 'house', sign: 'carrot', name: 'Farm' },
  school: { size: 'hall', sign: null, name: 'Arcane School' },
  academyMage: { size: 'hall', sign: 'star', name: 'Mage Academy' },
  academyKnight: { size: 'hall', sign: 'shield', name: 'Knight Academy' },
  academyBlade: { size: 'hall', sign: 'sword', name: 'Blademaster Dojo' },
  academyShadow: { size: 'shop', sign: 'lockpick', name: 'Shadow Academy' },
  academyWilds: { size: 'shop', sign: 'flower', name: 'Beast & Druid Hall' },
  academyOccult: { size: 'shop', sign: 'crystal', name: 'Occult Academy' },
  academyAlchemist: { size: 'shop', sign: 'potion', name: 'Cloister Academy' },
  academyMerchant: { size: 'shop', sign: 'coin', name: 'Guildsmith Academy' },
  church: { size: 'church', sign: null, name: 'Church' },
  carpenter: { size: 'shop', sign: 'logs', name: 'Carpenter' },
  inn: { size: 'big', sign: 'mug', name: 'Inn' },
  market: { size: 'big', sign: 'map1', name: 'Market' },
  barracks: { size: 'big', sign: 'shield', name: 'Barracks' },
  harbor: { size: 'shop', sign: 'fish', name: 'Harbor office' },
  stable: { size: 'big', sign: 'horseshoe', name: 'Stable' },
  lodge: { size: 'shop', sign: 'meat', name: 'Hunting lodge' },
  mill: { size: 'mill', sign: null, name: 'Windmill' },
  palace: { size: 'palace', sign: null, name: 'Palace' },
  arena: { size: 'hall', sign: 'sword', name: 'Arena' },
};

// What each kind of village has, besides its houses (in this order: the first ones are closest to the square).
export const VILLAGE_NEEDS = {
  capital: [
    'church', 'market', 'arena', 'inn', 'clinic', 'potions', 'armory', 'guild', 'forge', 'bakery', 'arcane', 'weaver', 'carpenter',
    'barracks', 'stable', 'library', 'academyMage', 'academyKnight', 'academyBlade', 'academyShadow', 'academyWilds', 'academyOccult',
    'academyAlchemist', 'academyMerchant', 'inn',
  ],
  town: ['church', 'inn', 'market', 'clinic', 'potions', 'armory', 'forge', 'barracks', 'bakery', 'stable'],
  village: ['inn', 'clinic', 'forge', 'potions', 'bakery'],
  hamlet: [],
  farm: ['mill', 'farm', 'stable', 'bakery'],
};

// How many tiles a village of each kind covers.
export const VILLAGE_SIZES = {
  capital: { w: 184, h: 144 },
  town: { w: 134, h: 108 },
  village: { w: 104, h: 84 },
  hamlet: { w: 72, h: 60 },
  farm: { w: 104, h: 84 },
  monster: { w: 72, h: 56 },
  camp: { w: 58, h: 44 },
};
