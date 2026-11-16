// The classes of the hero. Each one is taught by its master (a person of the world), and needs two skills.
// To GET a class: train its two skills (see TRAINED in logic/classes.js), then ask its master.
// The class has the rank of its WEAKEST skill: Novice (Normal), Adept (Hard), Master (Extreme).
// So the class evolves when its skills evolve (more than 90% in their tag).
//
// bonus: what the class gives at each rank (rank 2 = twice, rank 3 = three times):
//   attack: +HP to each strike          spell: +% to the damage of the spells
//   armor: -HP to each blow taken        soften: -% to the blows of the monsters
//   critical: +% chance of a critical    time: +% time to answer
//   heal: +HP at each good answer        drain: % of the damage dealt that heals the hero
//   mana: +mana after each victory       xp / lexis: +% after each victory
//   ally: +damage, like one more friend  discount: -% at the shops

export const CLASS_RANKS = ['', 'Novice', 'Adept', 'Master'];

export const CLASSES = [
  { id: 'mage', name: 'Mage', master: 'luna', skills: ['verbTenses', 'gerunds'], bonus: { spell: 25 }, text: 'Spells hit much harder.' },
  { id: 'arcanist', name: 'Arcanist', master: 'selene', skills: ['connectors', 'subjectVerb'], bonus: { spell: 10, mana: 1 }, text: 'Stronger spells, and mana back after each victory.' },
  { id: 'witch', name: 'Witch', master: 'elara', skills: ['wordForms', 'vocabulary'], bonus: { heal: 3 }, text: 'Each good answer heals you.' },
  { id: 'knight', name: 'Knight', master: 'arthur', skills: ['prepositions', 'passive'], bonus: { armor: 6 }, text: 'A thicker armor.' },
  { id: 'paladin', name: 'Paladin', master: 'lyra', skills: ['pronouns', 'passive'], bonus: { heal: 2, armor: 3 }, text: 'Armor, and a little heal at each good answer.' },
  { id: 'smith', name: 'Warsmith', master: 'darius', skills: ['vocabulary', 'prepositions'], bonus: { attack: 6, discount: 5 }, text: 'Harder strikes, cheaper shops.' },
  { id: 'brigand', name: 'Brigand', master: 'dorian', skills: ['comparatives', 'connectors'], bonus: { critical: 5, lexis: 20 }, text: 'More critical hits, more Lexis.' },
  { id: 'samurai', name: 'Samurai', master: 'hinata', skills: ['verbTenses', 'comparatives'], bonus: { time: 12 }, text: 'More time to answer.' },
  { id: 'beastmaster', name: 'Beastmaster', master: 'kael', skills: ['pronouns', 'vocabulary'], bonus: { ally: 10 }, text: 'A wolf fights with you.' },
  { id: 'runeblade', name: 'Runeblade', master: 'kaelthra', skills: ['wordForms', 'gerunds'], bonus: { attack: 4, spell: 10 }, text: 'Strikes and spells, both a bit stronger.' },
  { id: 'puppeteer', name: 'Puppeteer', master: 'lucien', skills: ['subjectVerb', 'pronouns'], bonus: { soften: 10 }, text: 'The monsters hit softer.' },
  { id: 'druid', name: 'Druid', master: 'sylvia', skills: ['prepositions', 'connectors'], bonus: { heal: 2, mana: 1 }, text: 'Heals at each good answer, mana after each victory.' },
  { id: 'necromancer', name: 'Necromancer', master: 'vespera', skills: ['gerunds', 'passive'], bonus: { drain: 10 }, text: 'Your blows steal life.' },
  { id: 'plagueDoctor', name: 'Plague Doctor', master: 'corvin', skills: ['wordForms', 'subjectVerb'], bonus: { xp: 15 }, text: 'You learn more from each fight (+XP).' },
];

export function classOf(id) {
  return CLASSES.find((item) => item.id === id) || null;
}

export function classOfMaster(npcId) {
  return CLASSES.find((item) => item.master === npcId) || null;
}
