// The kingdoms of the world. Each one owns the land around its capital (the closest capital wins),
// and its capital is a huge town: a walled town center, a palace, a market with merchants and their horses.
// x, y: where its capital should stand, in cells of the painting (the game finds the closest good place).
// size: the size of its capital (a small island has a smaller one). roof: the color of its roofs. enemies: the kingdoms it is at war with (their villages raid each other).
// The demons are not a kingdom: they came from the Silent Isle, and their monster villages want more land.

export const KINGDOMS = [
  {
    id: 'lexia', name: 'Kingdom of Lexia', capital: 'Lexhaven', ruler: 'Queen Sera', x: 150, y: 80, color: '#e8b83a', roof: 'red', enemies: ['kharsa'],
    text: 'The old heart of the world. Its scholars say the first sentence was written here.',
  },
  {
    id: 'verdania', name: 'Kingdom of Verdania', capital: 'Sylvarum', ruler: 'King Aldric', x: 84, y: 62, color: '#5cbf4a', roof: 'green', enemies: ['thornvale'],
    text: 'Forests as far as the eye can see. Its woodcutters and druids never agree.',
  },
  {
    id: 'frosthold', name: 'Kingdom of Frosthold', capital: 'Hrimgard', ruler: 'Jarl Ingrid', x: 176, y: 28, size: 'town', color: '#9fd8ff', roof: 'blue', enemies: ['aurelia'],
    text: 'Snow, pines and proud people. They count the winters, not the years.',
  },
  {
    id: 'kharsa', name: 'Sultanate of Kharsa', capital: 'Qadira', ruler: 'Sultan Rashid', x: 48, y: 128, color: '#e8873a', roof: 'sand', enemies: ['lexia'],
    text: 'Sand, mesas and rich caravans. The bandits of the dunes are its shame.',
  },
  {
    id: 'aurelia', name: 'Kingdom of Aurelia', capital: 'Port Aurel', ruler: 'Duke Cassian', x: 214, y: 88, color: '#e05a8a', roof: 'purple', enemies: ['frosthold'],
    text: 'Cliffs, crystals and harbors. Its ships go to every island.',
  },
  {
    id: 'thornvale', name: 'Kingdom of Thornvale', capital: 'Thornwick', ruler: 'Lord Edmund', x: 131, y: 213, color: '#b86ad6', roof: 'red', enemies: ['verdania'],
    text: 'Quiet woods and loud lords. Its knights are the best of the world.',
  },
  {
    id: 'isles', name: 'Free Isles of Skyreach', capital: 'Skyreach', ruler: 'Captain Maren', x: 220, y: 156, size: 'town', color: '#3fc6c0', roof: 'blue', enemies: [],
    text: 'Islands of sailors and harpies. Only boats go there.',
  },
];

export function kingdomOf(id) {
  return KINGDOMS.find((kingdom) => kingdom.id === id) || null;
}

// Two kingdoms at war?
export function areEnemies(a, b) {
  const first = kingdomOf(a);
  const second = kingdomOf(b);
  return Boolean(first && second && (first.enemies.includes(b) || second.enemies.includes(a)));
}

// The clans of bandits: they rob the roads and hide in their camps. Their chiefs are worth a bounty.
export const BANDIT_CLANS = [
  { id: 'scarves', name: 'the Red Scarves', chief: 'Vargo One-Eye', color: '#d6302f', lands: ['meadow', 'forest'] },
  { id: 'jackals', name: 'the Dune Jackals', chief: 'Sahra the Quick', color: '#e8b83a', lands: ['desert', 'coast'] },
  { id: 'crows', name: 'the Black Crows', chief: 'Old Morrow', color: '#3a3442', lands: ['forest', 'mountain'] },
];
