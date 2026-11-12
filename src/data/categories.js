// The grammar categories, in the order of the spider chart (clockwise, from the top).
// short: the name shown on the chart. The shortest ones are on the sides (less room there).
// darkColor: used instead of color with a dark theme (else it's invisible).
export const CATEGORIES = [
  { id: 'gerunds', name: 'Gerunds/infinitives', short: 'Gerunds', color: '#8E44AD' },
  { id: 'prepositions', name: 'Prepositions', short: 'Prep.', color: '#6D3B22', darkColor: '#B07A55' },
  { id: 'vocabulary', name: 'Vocabulary', short: 'Vocab', color: '#1A1A1A', darkColor: '#EDEDED' },
  { id: 'passive', name: 'Active/passive', short: 'Passive', color: '#D4A017' },
  { id: 'pronouns', name: 'Pronouns', short: 'Pronouns', color: '#43A047' },
  { id: 'comparatives', name: 'Comparatives', short: 'Compar.', color: '#1E6FD9' },
  { id: 'subjectVerb', name: 'Subject-verb', short: 'Subj-verb', color: '#E91E8C' },
  { id: 'wordForms', name: 'Word forms', short: 'Forms', color: '#E53935' },
  { id: 'verbTenses', name: 'Verb tenses', short: 'Tenses', color: '#F57C00' },
  { id: 'connectors', name: 'Connectors', short: 'Connect.', color: '#00B8D4' },
];

// 'wordForms' -> { id: 'wordForms', name: 'Word forms', short: 'Forms', color: '#E53935' }
export function categoryOf(id) {
  return CATEGORIES.find((category) => category.id === id);
}

// The color of a category, the SAME as on the spider chart.
// Dark theme: its darkColor if it has one (else the black "Vocabulary" would be invisible).
export function colorOf(category, theme) {
  return theme.dark && category.darkColor ? category.darkColor : category.color;
}

// stats: { wordForms: { good: 4, bad: 1 }, ... }  ->  80
export function successPercent(stats, categoryId) {
  const counts = stats[categoryId];
  if (!counts || counts.good + counts.bad === 0) return 0; // never answered
  return Math.round((counts.good / (counts.good + counts.bad)) * 100);
}

// How many answers in total (good + bad, all categories).
export function totalAnswers(stats) {
  let total = 0;
  for (const counts of Object.values(stats)) {
    total += counts.good + counts.bad;
  }
  return total;
}

// stats + one answer -> new stats (+1 good or +1 bad in its category).
export function addAnswer(stats, category, isCorrect) {
  const counts = stats[category] || { good: 0, bad: 0 };
  const updated = isCorrect ? { ...counts, good: counts.good + 1 } : { ...counts, bad: counts.bad + 1 };
  return { ...stats, [category]: updated };
}

// Same, with all the answers of a group: [{ question, isCorrect }, ...]
export function addAnswers(stats, answers) {
  let newStats = stats;
  for (const answer of answers) {
    newStats = addAnswer(newStats, answer.question.category, answer.isCorrect);
  }
  return newStats;
}
