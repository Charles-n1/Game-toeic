// The dungeons of the story: a building outside, floors inside (see world/structures.js and world/insides.js).
// x, y: the middle of the building, in cells of the painting. w, h: its size, in tiles.
// look: how the outside is built. floors: how many floors inside. theme: their walls.
// guards: the monsters of the floors. boss: on the last floor (null = a guardian and a treasure instead).
// floorBosses: { floor: species } a boss in the last room of that floor, before the stairs down.
// (The caves of the wild are added by world/wildPlaces.js.)

export const STORY_DUNGEONS = [
  { id: 'crypt', name: 'Crystal Cave', look: 'cave', x: 188, y: 55, w: 30, h: 22, floors: 2, theme: 'crystal', crystals: true, guards: ['spider', 'skeleton', 'wisp'], boss: 'lich', danger: 1, text: 'A cave of singing crystals. The Gerund Lich sleeps at its bottom.' },
  { id: 'tower', name: 'Frostpeak Castle', look: 'castle', x: 140, y: 31, w: 56, h: 46, floors: 3, theme: 'ice', guards: ['iceGolem', 'harpy', 'wraith'], boss: 'warden', danger: 3, text: 'A frozen castle where time goes wrong. The Chrono Warden keeps it.' },
  { id: 'fort', name: 'Sandbandit Camp', look: 'camp', x: 69, y: 164, w: 50, h: 40, floors: 2, theme: 'bandit', guards: ['orc', 'goblin', 'cultist'], boss: 'general', danger: 3, text: 'The camp of General Barbarism, the enemy at the gate.' },
  { id: 'castle', name: 'Castle of Silence', look: 'demonCastle', x: 61, y: 20, w: 96, h: 76, floors: 5, theme: 'demon', guards: ['royalGuard', 'darkPaladin', 'demonLich', 'succubus', 'warGeneral', 'sorcererGeneral'], floorBosses: { 1: 'ravnos', 2: 'thamuz', 3: 'velmora', 4: 'queen' }, boss: 'king', danger: 4, text: 'A titanic castle on an island of lava. Solecis waits on his throne.' },
  { id: 'ruins', name: 'Ancient Ruins', look: 'ruins', x: 164, y: 100, w: 64, h: 48, floors: 2, theme: 'ruins', guards: ['skeleton', 'mimic', 'wraith'], boss: null, guardian: 'stoneGolem', danger: 3, text: 'A city older than words. Its doors only open to good sentences.' },
  { id: 'watchtower', name: 'Old Watchtower', look: 'tower', x: 154, y: 161, w: 20, h: 20, floors: 4, theme: 'tower', guards: ['skeleton', 'banshee'], boss: null, guardian: 'boneGolem', danger: 2, text: 'A tower that watched the sea. Each floor is a riddle.' },
  { id: 'forgotten', name: 'Forgotten Crypt', look: 'cave', x: 20, y: 179, w: 30, h: 22, floors: 3, theme: 'ruins', guards: ['skeleton', 'wraith', 'banshee'], boss: null, guardian: 'boneGolem', danger: 3, text: 'A crypt in the grey mountains. Somebody wrote on its walls, in a language of another world.' },
  { id: 'molten', name: 'Molten Mines', look: 'mine', x: 38, y: 51, w: 16, h: 12, floors: 3, theme: 'demon', guards: ['demonSoldier', 'abyssHound', 'demonPriest'], boss: null, guardian: 'demonBehemoth', danger: 4, text: 'The mines of the demons. Their weapons are forged down there, in the lava.' },
  { id: 'mineWest', name: 'Greendale Mine', look: 'mine', x: 30, y: 90, w: 16, h: 12, floors: 2, theme: 'mine', guards: ['rat', 'spider', 'goblin'], boss: null, guardian: 'orc', danger: 2, text: 'An old iron mine. The rails go deep.' },
  { id: 'mineDesert', name: 'Sunscorch Mine', look: 'mine', x: 30, y: 130, w: 16, h: 12, floors: 2, theme: 'mine', crystals: true, guards: ['rat', 'lizardman', 'spider'], boss: null, guardian: 'stoneGolem', danger: 3, text: 'A mine of crystals in the mesas.' },
];

// How far the door is from the bottom of each look (in tiles): the door is in the middle of the bottom part.
export const DOOR_FROM_BOTTOM = { cave: 5, castle: 9, camp: 9, demonCastle: 12, ruins: 10, tower: 4, mine: 4 };

// The obelisks of the wild: a riddle of very hard sentences, a reward. x, y: in cells of the painting.
export const OBELISKS = [
  { riddle: 'heartwood', x: 118, y: 62 },
  { riddle: 'riverbend', x: 95, y: 112 },
  { riddle: 'skyreach', x: 222, y: 150 },
  { riddle: 'frost', x: 165, y: 42 },
  { riddle: 'dunes', x: 40, y: 150 },
  { riddle: 'cape', x: 160, y: 172 },
  { riddle: 'verdant', x: 75, y: 70 },
  { riddle: 'tides', x: 229, y: 120 },
  { riddle: 'ember', x: 86, y: 52 },
  { riddle: 'stones', x: 178, y: 106 },
];
