import { CATEGORIES } from '../../data/categories';

// In the game, a grammar category is a "type": the type of a monster, and a school of magic.
// The color shows the type of a monster (a pink slime = gerunds, a yellow slime = tenses...).
const GAME_LOOK = {
  gerunds: { color: '#FF6FB5', spell: 'Gerund Bloom' },
  prepositions: { color: '#B07A55', spell: 'Stone Path' },
  vocabulary: { color: '#C9C9D6', spell: 'Lexicon Burst' },
  passive: { color: '#FF8A3D', spell: 'Mirror Voice' },
  pronouns: { color: '#4CC35A', spell: 'Echo Step' },
  comparatives: { color: '#3A7BFF', spell: 'Greater Flame' },
  subjectVerb: { color: '#A066FF', spell: 'Accord' },
  wordForms: { color: '#E8423F', spell: 'Shapeshift' },
  verbTenses: { color: '#FFD23F', spell: 'Time Rift' },
  connectors: { color: '#22D3EE', spell: 'Chain Link' },
};

// [{ id: 'gerunds', name: 'Gerunds/infinitives', short: 'Gerunds', color, spell }, ...]  (its icon: see draw/icons.js)
export const TYPES = CATEGORIES.map((category) => ({
  id: category.id,
  name: category.name,
  short: category.short,
  ...GAME_LOOK[category.id],
}));

export function typeOf(id) {
  return TYPES.find((type) => type.id === id);
}

// Each type is weak against the next one of the list (the last one against the first).
// A spell of the weakness deals double damage.
export function weaknessOf(id) {
  const index = TYPES.findIndex((type) => type.id === id);
  return TYPES[(index + 1) % TYPES.length].id;
}
