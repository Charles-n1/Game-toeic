// The lands of the world: the regions of the painting, each with its monsters.
// x, y: the middle of the land, in cells of the painting (a tile belongs to the land whose middle is closest).
// danger: 0 = safe ... 4 = the demon island. species: the monsters that appear there. text: for the world map.

export const LANDS = [
  { id: 'demon', name: 'The Silent Isle', biome: 'demon', x: 45, y: 30, danger: 4, species: ['demonSoldier', 'demonArcher', 'abyssHound', 'demonPriest', 'darkKnight'], text: 'A land of ash and lava, where the demons were born. Only one bridge reaches it, sealed by red runes.' },
  { id: 'mountain', name: 'Frostpeak Pass', biome: 'mountain', x: 160, y: 26, danger: 3, species: ['iceGolem', 'wolf', 'harpy'], text: 'Snow, pines and a frozen castle where time goes wrong.' },
  { id: 'crystal', name: 'Crystal Coast', biome: 'forest', x: 200, y: 68, danger: 2, species: ['spider', 'harpy', 'lizardman'], text: 'Cliffs and blue crystals. A cave sings under them.' },
  { id: 'forest', name: 'Verbwood', biome: 'forest', x: 60, y: 80, danger: 2, species: ['wolf', 'goblin', 'orc', 'mushroom'], text: 'Old trees around Greendale. Goblins hunt here.' },
  { id: 'heartwood', name: 'Heartwood', biome: 'forest', x: 115, y: 64, danger: 2, species: ['wolf', 'goblin', 'spider', 'mushroom'], text: 'The deep forest north of Eldermoor.' },
  { id: 'meadow', name: 'Whisper Meadow', biome: 'meadow', x: 111, y: 95, danger: 1, species: ['slime', 'rat', 'mushroom'], text: 'Soft hills around Eldermoor. The first monsters: slimes and rats.' },
  { id: 'lake', name: 'Riverlands', biome: 'meadow', x: 135, y: 120, danger: 2, species: ['lizardman', 'slime', 'drowner'], text: 'Rivers everywhere. The lizardmen fish here, the drowners wait.' },
  { id: 'oldwood', name: 'The Old Stones', biome: 'forest', x: 170, y: 98, danger: 3, species: ['skeleton', 'wraith', 'banshee', 'mimic'], text: 'Broken towers in the forest, around the Ancient Ruins.' },
  { id: 'coast', name: 'Comma Coast', biome: 'coast', x: 222, y: 118, danger: 1, species: ['slime', 'drowner', 'harpy'], text: 'Sand, wind and the sea, around Seabridge.' },
  { id: 'desert', name: 'Sunscorch Desert', biome: 'desert', x: 62, y: 138, danger: 2, species: ['rat', 'lizardman', 'goblin', 'orc'], text: 'Sand and mesas. The bandits of the General hide here.' },
  { id: 'teeth', name: 'The Ashen Teeth', biome: 'mountain', x: 12, y: 195, danger: 3, species: ['orc', 'drake', 'stoneGolem'], text: 'Sharp grey mountains on the western shore. An old crypt hides between them.' },
  { id: 'woods', name: 'Whispering Woods', biome: 'forest', x: 127, y: 142, danger: 1, species: ['mushroom', 'spider', 'slime', 'wolf'], text: 'A quiet forest. The trees whisper old words.' },
  { id: 'watch', name: 'Watchtower Cape', biome: 'meadow', x: 156, y: 165, danger: 2, species: ['skeleton', 'banshee', 'goblin'], text: 'The cape of the Old Watchtower.' },
  { id: 'oldroad', name: 'The Old Road', biome: 'forest', x: 26, y: 98, danger: 2, species: ['wolf', 'goblin', 'orc'], text: 'A forgotten road along the western cliffs. Bandits and wolves share it.' },
  { id: 'swamp', name: 'Murkwood Swamp', biome: 'forest', x: 45, y: 226, danger: 3, species: ['drowner', 'mushroom', 'lizardman', 'cultist'], text: 'Black water under dead trees. Lights dance there at night: do not follow them.' },
  { id: 'southshore', name: 'Riverford Shore', biome: 'meadow', x: 116, y: 200, danger: 1, species: ['slime', 'rat', 'goblin'], text: 'Calm rivers and fishing villages, down to Southport.' },
  { id: 'refuge', name: "Sailor's Refuge", biome: 'coast', x: 187, y: 203, danger: 1, species: ['slime', 'drowner'], text: 'A small island where the sailors wait for the storms to pass.' },
  { id: 'storm', name: 'Stormbreak Isles', biome: 'coast', x: 212, y: 234, danger: 3, species: ['harpy', 'drowner', 'drake'], text: 'Sharp rocks in an angry sea. Wrecks, and what lives in them.' },
  { id: 'emerald', name: 'Emerald Falls', biome: 'forest', x: 235, y: 72, danger: 2, species: ['harpy', 'spider', 'mushroom'], text: 'An island of waterfalls, green as a gem.' },
  { id: 'skyreach', name: 'Skyreach Island', biome: 'meadow', x: 220, y: 158, danger: 3, species: ['harpy', 'drake', 'wraith'], text: 'An island far in the sea. Only a boat goes there.' },
];
