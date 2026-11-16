// The dungeons of the story: a building outside, floors inside (see world/structures.js and world/insides.js).
// x, y: the middle of the building, in cells of the painting. w, h: its size, in tiles.
// look: how the outside is built. floors: how many floors inside. theme: their walls.
// guards: the monsters of the floors. boss: on the last floor (null = a guardian and a treasure instead).
// (The caves of the wild are added by world/wildPlaces.js.)

export const STORY_DUNGEONS = [
  { id: 'crypt', name: 'Crystal Cave', look: 'cave', x: 201, y: 72, w: 30, h: 22, floors: 3, theme: 'crystal', crystals: true, guards: ['spider', 'iceGolem', 'skeleton'], boss: 'lich', danger: 2, text: 'A cave of singing crystals. The Gerund Lich sleeps at its bottom.' },
  { id: 'tower', name: 'Frostpeak Castle', look: 'castle', x: 150, y: 30, w: 56, h: 46, floors: 3, theme: 'ice', guards: ['iceGolem', 'harpy', 'wraith'], boss: 'warden', danger: 3, text: 'A frozen castle where time goes wrong. The Chrono Warden keeps it.' },
  { id: 'fort', name: 'Sandbandit Camp', look: 'camp', x: 56, y: 212, w: 50, h: 40, floors: 2, theme: 'bandit', guards: ['orc', 'goblin', 'cultist'], boss: 'general', danger: 3, text: 'The camp of General Barbarism, the enemy at the gate.' },
  { id: 'castle', name: 'Castle of Silence', look: 'demonCastle', x: 46, y: 26, w: 96, h: 76, floors: 4, theme: 'demon', guards: ['darkKnight', 'shadowMage', 'boneGolem', 'drake'], boss: 'king', danger: 4, text: 'A titanic castle on an island of lava. Solecis waits on his throne.' },
  { id: 'ruins', name: 'Ancient Ruins', look: 'ruins', x: 168, y: 137, w: 64, h: 48, floors: 2, theme: 'ruins', guards: ['skeleton', 'mimic', 'wraith'], boss: null, guardian: 'stoneGolem', danger: 3, text: 'A city older than words. Its doors only open to good sentences.' },
  { id: 'watchtower', name: 'Old Watchtower', look: 'tower', x: 151, y: 199, w: 20, h: 20, floors: 4, theme: 'tower', guards: ['skeleton', 'banshee'], boss: null, guardian: 'boneGolem', danger: 2, text: 'A tower that watched the sea. Each floor is a riddle.' },
  { id: 'mineWest', name: 'Greendale Mine', look: 'mine', x: 20, y: 114, w: 16, h: 12, floors: 2, theme: 'mine', guards: ['rat', 'spider', 'goblin'], boss: null, guardian: 'orc', danger: 2, text: 'An old iron mine. The rails go deep.' },
  { id: 'mineDesert', name: 'Sunscorch Mine', look: 'mine', x: 24, y: 161, w: 16, h: 12, floors: 2, theme: 'mine', crystals: true, guards: ['rat', 'lizardman', 'spider'], boss: null, guardian: 'stoneGolem', danger: 3, text: 'A mine of crystals in the mesas.' },
];

// How far the door is from the bottom of each look (in tiles): the door is in the middle of the bottom part.
export const DOOR_FROM_BOTTOM = { cave: 5, castle: 9, camp: 9, demonCastle: 12, ruins: 10, tower: 4, mine: 4 };

// The obelisks of the wild: a riddle of very hard sentences, a reward. x, y: in cells of the painting.
export const OBELISKS = [
  { riddle: 'heartwood', x: 122, y: 95 },
  { riddle: 'riverbend', x: 71, y: 151 },
  { riddle: 'skyreach', x: 214, y: 179 },
  { riddle: 'frost', x: 158, y: 58 },
  { riddle: 'dunes', x: 28, y: 195 },
  { riddle: 'cape', x: 127, y: 224 },
  { riddle: 'verdant', x: 60, y: 70 },
  { riddle: 'tides', x: 236, y: 140 },
  { riddle: 'ember', x: 80, y: 40 },
  { riddle: 'stones', x: 180, y: 120 },
];
