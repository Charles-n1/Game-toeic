import { CATEGORIES } from '../../data/categories';

// In the game, a grammar category is a "type": the type of a monster, and a school of magic.
// The color shows the type of a monster (a pink slime = gerunds, a yellow slime = tenses...).
const GAME_LOOK = {
  gerunds: { color: '#FF6FB5', icon: '🌸', spell: 'Gerund Bloom' },
  prepositions: { color: '#B07A55', icon: '🪨', spell: 'Stone Path' },
  vocabulary: { color: '#C9C9D6', icon: '📖', spell: 'Lexicon Burst' },
  passive: { color: '#D4A017', icon: '🛡️', spell: 'Mirror Voice' },
  pronouns: { color: '#43A047', icon: '👥', spell: 'Echo Step' },
  comparatives: { color: '#1E6FD9', icon: '🔥', spell: 'Greater Flame' },
  subjectVerb: { color: '#E91E8C', icon: '⚖️', spell: 'Accord' },
  wordForms: { color: '#E53935', icon: '🌀', spell: 'Shapeshift' },
  verbTenses: { color: '#FFD23F', icon: '⏳', spell: 'Time Rift' },
  connectors: { color: '#00B8D4', icon: '🔗', spell: 'Chain Link' },
};

// [{ id: 'gerunds', name: 'Gerunds/infinitives', short: 'Gerunds', color, icon, spell }, ...]
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
