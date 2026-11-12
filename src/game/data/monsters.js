// The monsters. Health and attacks are in HALF hearts.
// tier: which questions the monster asks (see TIERS).
// resistance / magicResistance: the part of a strike / of a spell that is blocked (0.5 = half).
// speed: a fast monster leaves less time to answer.
// shape: how it is drawn. night: true = only comes out at night.
export const SPECIES = {
  slime: { name: 'Slime', shape: 'slime', tier: 'small', health: 2, attack: 1, magicAttack: 0, resistance: 0, magicResistance: 0, speed: 6, xp: 10, lexis: 2 },
  bat: { name: 'Night Bat', shape: 'bat', tier: 'small', health: 2, attack: 1, magicAttack: 0, resistance: 0, magicResistance: 0.2, speed: 14, xp: 14, lexis: 3, night: true },
  wolf: { name: 'Verb Wolf', shape: 'wolf', tier: 'small', health: 4, attack: 2, magicAttack: 0, resistance: 0.1, magicResistance: 0, speed: 12, xp: 22, lexis: 5 },
  wisp: { name: 'Ember Wisp', shape: 'wisp', tier: 'small', health: 3, attack: 0, magicAttack: 2, resistance: 0.3, magicResistance: 0.5, speed: 13, xp: 24, lexis: 6 },
  treant: { name: 'Old Treant', shape: 'treant', tier: 'big', health: 8, attack: 3, magicAttack: 0, resistance: 0.3, magicResistance: 0, speed: 5, xp: 60, lexis: 14 },
  golem: { name: 'Stone Golem', shape: 'golem', tier: 'big', health: 10, attack: 4, magicAttack: 0, resistance: 0.5, magicResistance: 0, speed: 4, xp: 80, lexis: 20 },
  imp: { name: 'Silence Imp', shape: 'imp', tier: 'big', health: 6, attack: 2, magicAttack: 3, resistance: 0, magicResistance: 0.3, speed: 15, xp: 70, lexis: 18 },
  demonKnight: { name: 'Demon Knight', shape: 'knight', tier: 'demon', health: 10, attack: 5, magicAttack: 2, resistance: 0.4, magicResistance: 0.2, speed: 11, xp: 160, lexis: 45 },

  // ---------- Bosses: one of each, they never come back ----------
  lich: { name: 'The Gerund Lich', shape: 'lich', tier: 'boss', boss: true, category: 'gerunds', health: 14, attack: 3, magicAttack: 4, resistance: 0.2, magicResistance: 0.4, speed: 9, xp: 300, lexis: 150 },
  warden: { name: 'The Chrono Warden', shape: 'warden', tier: 'boss', boss: true, category: 'verbTenses', health: 18, attack: 4, magicAttack: 4, resistance: 0.3, magicResistance: 0.3, speed: 13, xp: 500, lexis: 300 },
  general: { name: 'General Barbarism', shape: 'general', tier: 'boss', boss: true, health: 22, attack: 6, magicAttack: 3, resistance: 0.4, magicResistance: 0.2, speed: 12, xp: 800, lexis: 500 },
  king: { name: 'Solecis, the Demon King', shape: 'king', tier: 'demon', boss: true, anyCategory: true, health: 30, attack: 7, magicAttack: 7, resistance: 0.4, magicResistance: 0.4, speed: 14, xp: 3000, lexis: 2000 },
};

// The questions of each tier. sections: see data/sections.js ('text' = the long reading part, RC 55 min).
// hardChance: the chance to get a question of the harder difficulties instead of the normal ones.
// (The long texts of the app are all in one category: a demon asks any of them, whatever its type.)
export const TIERS = {
  small: { sections: ['rc10', 'rc8'], easy: ['normal'], hard: ['hard'], hardChance: 0.2 },
  big: { sections: ['rc10', 'rc8'], easy: ['hard'], hard: ['extreme'], hardChance: 0.35 },
  boss: { sections: ['rc10', 'rc8'], easy: ['hard'], hard: ['extreme'], hardChance: 0.6 },
  demon: { sections: ['text'], easy: ['normal', 'hard'], hard: ['extreme'], hardChance: 0.4 },
};

// What a monster may leave on the ground when it dies: [item, chance].
export const DROPS = [
  ['healthPotion', 0.12],
  ['flower', 0.1],
  ['oldCoin', 0.05],
  ['manaPotion', 0.05],
  ['gem', 0.01],
];
