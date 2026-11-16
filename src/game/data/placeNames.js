// The pieces of the names of the places: a beginning and an end, following the land.
// (Ash + ford = Ashford.) The game builds the names itself (see world/places.js).

export const NAME_PARTS = {
  meadow: { start: ['Ash', 'Bram', 'Elm', 'Ox', 'Mill', 'Brook', 'Hay', 'Wheat', 'Ald', 'Bright', 'Clover', 'Honey', 'Oat', 'Lark', 'Penny'], end: ['ford', 'ton', 'ley', 'wick', 'field', 'stead', 'dale', 'by', 'mere', 'bury', 'well', 'cote'] },
  forest: { start: ['Oak', 'Fern', 'Moss', 'Thorn', 'Wolf', 'Briar', 'Elder', 'Pine', 'Ivy', 'Owl', 'Holly', 'Birch', 'Rowan'], end: ['wood', 'hollow', 'glen', 'shade', 'den', 'grove', 'wald', 'brook', 'hurst', 'thicket'] },
  mountain: { start: ['Frost', 'Ice', 'Hrim', 'Snow', 'Kald', 'Vinter', 'White', 'Storm', 'Bjorn', 'Ulf', 'Grey'], end: ['gard', 'heim', 'fell', 'holm', 'vik', 'peak', 'hald', 'stad', 'berg'] },
  desert: { start: ['Qa', 'Sar', 'Zah', 'Mir', 'Al-', 'Kha', 'Dun', 'Sha', 'Ras', 'Nef', 'Ta'], end: ['rah', 'zir', 'dun', 'sar', 'imar', 'ad', 'ira', 'sul', 'khan', 'bah'] },
  coast: { start: ['Sea', 'Salt', 'Gull', 'Coral', 'Tide', 'Wave', 'Shell', 'Foam', 'Anchor', 'Pearl', 'Drift'], end: ['haven', 'port', 'cove', 'mouth', 'reach', 'bay', 'strand', 'quay', 'sands'] },
};

// What a village is, written after its name on the map.
export const VILLAGE_KINDS = {
  capital: 'Capital',
  town: 'Town',
  village: 'Village',
  hamlet: 'Hamlet',
  farm: 'Farming village',
};

// The monster villages: their name follows the people who live there.
export const MONSTER_TOWNS = {
  goblin: ['Goblin Warren', 'Snatchnest', 'Grubhollow'],
  orc: ['Orc Stronghold', 'Skullgate', 'Krag Muzra'],
  lizardman: ['Lizard Marsh', 'Scaleden'],
  skeleton: ['Bone Hamlet', 'The Rattling Field'],
  darkKnight: ['Black Bastion', 'Ashen Keep'],
  cultist: ['Cult Camp', 'The Red Circle'],
  spider: ['Spider Nest', 'Webhollow'],
  wolf: ['Wolf Den', 'Howling Rocks'],
  rat: ['Rat Burrow'],
};
