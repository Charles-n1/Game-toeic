// The people of the villages (not the people of the story: see data/npcs.js).
// Their names, their faces, their jobs. The rules: logic/villagers.js.

export const MEN_NAMES = ['Tom', 'Wat', 'Hob', 'Aldo', 'Bertram', 'Cedric', 'Dunstan', 'Edric', 'Gilbert', 'Hugh', 'Ivo', 'Jory', 'Kenric', 'Lambert', 'Merek', 'Osric', 'Piers', 'Ralf', 'Simon', 'Tybalt', 'Ulric', 'Walter', 'Yorick', 'Bram', 'Colm'];
export const WOMEN_NAMES = ['Ada', 'Beatrix', 'Cecily', 'Edith', 'Elsie', 'Gwen', 'Hilda', 'Isolde', 'Joan', 'Kate', 'Linnet', 'Mabel', 'Nell', 'Odette', 'Rose', 'Sybil', 'Tilda', 'Una', 'Wenna', 'Agnes', 'Brida', 'Clara'];
export const KID_NAMES = ['Pip', 'Wren', 'Kit', 'Bea', 'Ned', 'Tess', 'Robin', 'Moll', 'Tib', 'Jem', 'Lotte', 'Sam'];

export const SKINS = ['#f3d2b3', '#e9b98f', '#c99872', '#fde0c8', '#b9825a', '#8d5a3a'];
export const HAIRS = ['#5a3a1e', '#2b2b3a', '#c98a3b', '#7a2f2f', '#d9d9d9', '#e8c76a'];
export const CLOTHES = ['#6b8a3a', '#8a5a3a', '#5a6b8a', '#8a3a5a', '#7a7a5a', '#3a6b6b', '#9a7a4a'];

// The jobs of the villagers on screen, in the order they are given (a farming village: mostly farmers).
export const JOB_ORDER = {
  farm: ['farmer', 'farmer', 'herder', 'farmer', 'woodcutter', 'farmer', 'builder', 'merchant'],
  other: ['farmer', 'woodcutter', 'builder', 'merchant', 'herder', 'stonecutter', 'farmer', 'merchant'],
};

export const JOB_NAMES = {
  farmer: 'Farmer',
  woodcutter: 'Woodcutter',
  stonecutter: 'Stonecutter',
  herder: 'Herder',
  builder: 'Builder',
  merchant: 'Merchant',
  knight: 'Knight',
  foreman: 'Foreman',
  kid: 'Child',
};

// What a villager may sell (see logic/trade.js), following their job.
export const JOB_GOODS = {
  farmer: ['wheat', 'carrot', 'egg', 'bread'],
  woodcutter: ['branch', 'firewood'],
  stonecutter: ['flint', 'stone'],
  herder: ['milk', 'rawMeat', 'egg'],
  builder: ['firewood', 'stone'],
  merchant: ['cloth', 'lampOil', 'driedMeat', 'healthPotion', 'rope'],
  knight: [],
  foreman: [],
  kid: [],
};
