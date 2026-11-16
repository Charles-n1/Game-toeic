// The monsters. Health and attacks are in HP (the player starts with 100 HP).
// tier: which questions the monster asks (see TIERS).
// tag: the lowest tag of the monster (see logic/skills.js). The numbers below are for this tag at "Normal" power:
//   the tag multiplies them (Hard: health x5, blows x2, XP and Lexis x5). A monster without a tag is Normal,
//   or takes the tag the hero has reached in its type.
// resistance / magicResistance: the part of a strike / of a spell that is blocked (0.5 = half).
// speed: a fast monster leaves less time to answer.
// shape: how it is drawn. night: true = only comes out at night.
export const SPECIES = {
  slime: { name: 'Slime', shape: 'slime', tier: 'small', health: 20, attack: 10, magicAttack: 0, resistance: 0, magicResistance: 0, speed: 6, xp: 10, lexis: 2 },
  bat: { name: 'Night Bat', shape: 'bat', tier: 'small', health: 20, attack: 10, magicAttack: 0, resistance: 0, magicResistance: 0.2, speed: 14, xp: 14, lexis: 3, night: true },
  wolf: { name: 'Verb Wolf', shape: 'wolf', tier: 'small', health: 40, attack: 20, magicAttack: 0, resistance: 0.1, magicResistance: 0, speed: 12, xp: 22, lexis: 5 },
  wisp: { name: 'Frost Wisp', shape: 'wisp', tier: 'small', health: 30, attack: 0, magicAttack: 20, resistance: 0.3, magicResistance: 0.5, speed: 13, xp: 24, lexis: 6 },
  treant: { name: 'Old Treant', shape: 'treant', tier: 'big', tag: 'hard', health: 80, attack: 15, magicAttack: 0, resistance: 0.3, magicResistance: 0, speed: 5, xp: 12, lexis: 3 },
  golem: { name: 'Stone Golem', shape: 'golem', tier: 'big', tag: 'hard', health: 100, attack: 20, magicAttack: 0, resistance: 0.5, magicResistance: 0, speed: 4, xp: 16, lexis: 4 },
  imp: { name: 'Silence Imp', shape: 'imp', tier: 'big', tag: 'hard', health: 60, attack: 10, magicAttack: 15, resistance: 0, magicResistance: 0.3, speed: 15, xp: 14, lexis: 4 },
  demonKnight: { name: 'Demon Knight', shape: 'knight', tier: 'demon', tag: 'hard', health: 100, attack: 25, magicAttack: 10, resistance: 0.4, magicResistance: 0.2, speed: 11, xp: 32, lexis: 9 },

  // ---------- Bosses: one of each, they never come back ----------
  lich: { name: 'The Gerund Lich', shape: 'lich', tier: 'boss', tag: 'hard', boss: true, category: 'gerunds', health: 140, attack: 15, magicAttack: 20, resistance: 0.2, magicResistance: 0.4, speed: 9, xp: 60, lexis: 30 },
  warden: { name: 'The Chrono Warden', shape: 'warden', tier: 'boss', tag: 'hard', boss: true, category: 'verbTenses', health: 180, attack: 20, magicAttack: 20, resistance: 0.3, magicResistance: 0.3, speed: 13, xp: 100, lexis: 60 },
  general: { name: 'General Barbarism', shape: 'general', tier: 'boss', tag: 'hard', boss: true, health: 220, attack: 30, magicAttack: 15, resistance: 0.4, magicResistance: 0.2, speed: 12, xp: 160, lexis: 100 },
  king: { name: 'Solecis, the Demon King', shape: 'king', tier: 'demon', tag: 'extreme', boss: true, anyCategory: true, health: 300, attack: 18, magicAttack: 18, resistance: 0.4, magicResistance: 0.4, speed: 14, xp: 120, lexis: 80 },
};

// The questions of each tier: sections (see data/sections.js; 'text' = the long reading part, RC 55 min).
// Their difficulty is the tag of the monster. (The long texts of the app are all in one category: a demon asks
// any of them, whatever its type.)
export const TIERS = {
  small: { sections: ['rc10', 'rc8'] },
  big: { sections: ['rc10', 'rc8'] },
  boss: { sections: ['rc10', 'rc8'] },
  demon: { sections: ['text'] },
};

// What a monster may leave on the ground when it dies: [item, chance].
export const DROPS = [
  ['healthPotion', 0.12],
  ['timePotion', 0.04],
  ['hintPotion', 0.04],
  ['flower', 0.1],
  ['oldCoin', 0.05],
  ['manaPotion', 0.05],
  ['gem', 0.01],
];
