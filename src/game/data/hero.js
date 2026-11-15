// The choices of the hero's avatar, at the start of a new game.
// The hero is drawn like the other people of the world (see draw/people.js): a "look".

export const BODIES = [
  { id: 'trousers', name: 'Trousers' },
  { id: 'skirt', name: 'Skirt' },
];
export const HAIR_STYLES = [
  { id: 'spiky', name: 'Spiky' },
  { id: 'short', name: 'Short' },
  { id: 'long', name: 'Long' },
  { id: 'pony', name: 'Ponytail' },
];
export const HAIR_COLORS = ['#8a4b24', '#2b2b3a', '#f4dc7a', '#e5482e'];
export const OUTFIT_COLORS = ['#2d3a6e', '#8a2a2a', '#2f6e45', '#5a3a8a'];

const SKIN = '#f3d2b3';

// The choices of a new hero (indexes in the lists above).
export const DEFAULT_HERO = { name: '', body: 0, style: 0, hair: 0, outfit: 0 };

// hero: { name, body, style, hair, outfit } -> the look used to draw them.
export function heroLook(hero) {
  const outfit = OUTFIT_COLORS[hero.outfit];
  const isSkirt = BODIES[hero.body].id === 'skirt';
  return {
    skin: SKIN,
    hair: HAIR_COLORS[hero.hair],
    style: HAIR_STYLES[hero.style].id,
    eyes: '#3a6fd8',
    outfit: outfit,
    trim: hero.outfit === 1 ? '#e8b83a' : '#d6302f', // a gold scarf on the red outfit, else a red one
    pants: isSkirt ? SKIN : '#3b3652',
    boots: '#6b4423',
    skirt: isSkirt,
    scarf: true,
    sword: true,
  };
}
