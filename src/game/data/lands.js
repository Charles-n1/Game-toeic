// The lands of the world: the regions of the painting, each with its monsters.
// x, y: the middle of the land, in cells of the painting (a tile belongs to the land whose middle is closest).
// danger: 0 = safe ... 4 = the demon island. species: the monsters that appear there. text: for the world map.

export const LANDS = [
  { id: 'demon', name: 'The Silent Isle', biome: 'demon', x: 40, y: 32, danger: 4, species: ['darkKnight', 'shadowMage', 'drake', 'cultist'], text: 'An island of ash and lava, where the demons were born. Only one bridge reaches it, sealed by red runes.' },
  { id: 'mountain', name: 'Frostpeak Pass', biome: 'mountain', x: 172, y: 26, danger: 3, species: ['iceGolem', 'wolf', 'harpy'], text: 'Snow, pines and a frozen castle where time goes wrong.' },
  { id: 'crystal', name: 'Crystal Coast', biome: 'forest', x: 222, y: 96, danger: 2, species: ['spider', 'harpy', 'lizardman'], text: 'Cliffs and blue crystals. A cave sings under them.' },
  { id: 'forest', name: 'Verbwood', biome: 'forest', x: 34, y: 86, danger: 2, species: ['wolf', 'goblin', 'orc', 'mushroom'], text: 'Old trees around Greendale. Goblins hunt here.' },
  { id: 'heartwood', name: 'Heartwood', biome: 'forest', x: 118, y: 76, danger: 2, species: ['wolf', 'goblin', 'spider', 'mushroom'], text: 'The deep forest north of Eldermoor.' },
  { id: 'meadow', name: 'Whisper Meadow', biome: 'meadow', x: 100, y: 104, danger: 1, species: ['slime', 'rat', 'mushroom'], text: 'Soft hills around Eldermoor. The first monsters: slimes and rats.' },
  { id: 'lake', name: 'Riverlands', biome: 'meadow', x: 134, y: 112, danger: 2, species: ['lizardman', 'slime', 'drowner'], text: 'Rivers everywhere. The lizardmen fish here, the drowners wait.' },
  { id: 'oldwood', name: 'The Old Stones', biome: 'forest', x: 168, y: 110, danger: 3, species: ['skeleton', 'wraith', 'banshee', 'mimic'], text: 'Broken towers in the forest, around the Ancient Ruins.' },
  { id: 'coast', name: 'Comma Coast', biome: 'coast', x: 224, y: 152, danger: 1, species: ['slime', 'drowner', 'harpy'], text: 'Sand, wind and the sea, around Seabridge.' },
  { id: 'desert', name: 'Sunscorch Desert', biome: 'desert', x: 48, y: 176, danger: 2, species: ['rat', 'lizardman', 'goblin', 'orc'], text: 'Sand and mesas. The bandits of the General hide here.' },
  { id: 'teeth', name: 'The Ashen Teeth', biome: 'desert', x: 30, y: 240, danger: 3, species: ['orc', 'drake', 'stoneGolem'], text: 'Sharp mountains at the south of the desert.' },
  { id: 'woods', name: 'Whispering Woods', biome: 'forest', x: 124, y: 186, danger: 1, species: ['mushroom', 'spider', 'slime', 'wolf'], text: 'A quiet forest. The trees whisper old words.' },
  { id: 'watch', name: 'Watchtower Cape', biome: 'meadow', x: 150, y: 214, danger: 2, species: ['skeleton', 'banshee', 'goblin'], text: 'The cape of the Old Watchtower.' },
  { id: 'skyreach', name: 'Skyreach Island', biome: 'meadow', x: 220, y: 192, danger: 3, species: ['harpy', 'drake', 'wraith'], text: 'An island far in the sea. Only a boat goes there.' },
];
