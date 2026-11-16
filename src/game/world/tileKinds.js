// The kinds of tiles of the map. A tile is one number (the map is a big array of numbers).

export const TILE = {
  GRASS: 0,
  FLOWER: 1,
  PATH: 2,
  SAND: 3,
  WATER: 4,
  TREE: 5,
  ROCK: 6,
  STONE: 7, // the snow
  ASH: 8, // the ground of the demon island
  LAVA: 9,
  DEAD_TREE: 10,
  WALL: 11, // the walls of the buildings and of the dungeons
  FLOOR: 12, // the ground inside
  ROOF: 13,
  HOUSE: 14, // the front wall of a house
  DOOR: 15,
  SOIL: 16, // where food grows
  BRIDGE: 17,
  CLIFF: 18, // a mountain, a mesa: rock nobody climbs
  VOID: 19, // nothing (between the insides)
  STAIRS: 20, // stairs, a cave mouth, a door to the inside: walking on it takes you somewhere else
  ORE: 21, // a rock with metal or crystal in it (a mine): the hero can break it
  WOOD_FLOOR: 22, // the floor of a home
  RUG: 23, // a carpet on the floor of a home
};

// The tiles nobody can walk on.
export const SOLID_TILES = [TILE.WATER, TILE.TREE, TILE.ROCK, TILE.LAVA, TILE.DEAD_TREE, TILE.WALL, TILE.ROOF, TILE.HOUSE, TILE.DOOR, TILE.CLIFF, TILE.VOID, TILE.ORE];
