// The villages of the story: they are always there, with the buildings the story needs.
// (The other villages of the world are made by world/places.js, a different number in each kingdom.)
// x, y: where the village should stand, in cells of the painting (the game finds the closest good place).
// founded: how many days before the hero came. An old village is evolved (walls of stone, a bridge),
// a young one has nothing yet: its people build it (see logic/villages.js).
// roles: its buildings (see data/buildings.js), the first ones closest to the square.

export const STORY_VILLAGES = [
  {
    id: 'lexia', name: 'Eldermoor', kind: 'town', kingdom: 'lexia', x: 111, y: 93, founded: 420, roof: 'red',
    roles: ['home', 'clinic', 'library', 'potions', 'guild', 'forge', 'arcane', 'weaver', 'bakery', 'elder', 'farm', 'school', 'carpenter', 'church', 'inn', 'stable'],
    text: 'An old village of farmers, smiths and mages, behind its stone walls. Your new home.',
  },
  {
    id: 'greendale', name: 'Greendale', kind: 'village', kingdom: 'verdania', x: 67, y: 82, founded: 6, roof: 'red',
    roles: ['smithy', 'lodge'],
    text: 'A young village of woodcutters, in the middle of Verbwood. It is still growing.',
  },
  {
    id: 'port', name: 'Seabridge', kind: 'town', kingdom: 'aurelia', x: 223, y: 113, founded: 90, roof: 'blue',
    roles: ['market', 'inn', 'barracks', 'harbor', 'clinic', 'church'],
    text: 'A busy harbor: maps, rings, sailors. Its boats go to every island.',
  },
  {
    id: 'riverford', name: 'Riverford', kind: 'village', kingdom: 'thornvale', x: 110, y: 196, founded: 150, roof: 'red',
    roles: ['inn', 'farm', 'clinic', 'smithy', 'church'],
    text: 'A village of fishers, where three rivers meet. Everybody passes through it one day.',
  },
  {
    id: 'refuge', name: "Sailor's Refuge", kind: 'hamlet', kingdom: 'isles', x: 187, y: 203, founded: 40, roof: 'blue',
    roles: ['inn', 'harbor'],
    text: 'A few houses on a small island. The sailors wait here for the storms to pass.',
  },
];
