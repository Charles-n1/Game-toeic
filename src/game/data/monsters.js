// The monsters. Health and attacks are in HP (the player starts with 100 HP).
// tier: which questions the monster asks (see TIERS).
// tag: the lowest tag of the monster (see logic/skills.js). The numbers below are for this tag at "Normal" power:
//   the tag multiplies them (Hard: health x5, blows x2, XP and Lexis x5). A monster without a tag is Normal,
//   or takes the tag the hero has reached in its type.
// resistance / magicResistance: the part of a strike / of a spell that is blocked (0.5 = half).
// speed: a fast monster leaves less time to answer.
// shape: how it is drawn. night: true = only comes out at night.
export const SPECIES = {
  // ---------- The monsters of the sprite sheets (art: their pictures, see draw/monsterArt.js) ----------
  // Each regular species trains a specific TOEIC skill (category) when fought/hunted.
  // drops: what they leave for sure (meat to cook, bones), more than the common DROPS below.
  slime: { name: 'Slime', art: 'slime', shape: 'slime', tier: 'small', category: 'gerunds', health: 20, attack: 10, magicAttack: 0, resistance: 0, magicResistance: 0, speed: 6, xp: 10, lexis: 2, drops: [] },
  rat: { name: 'Giant Rat', art: 'rat', shape: 'slime', tier: 'small', category: 'subjectVerb', health: 18, attack: 10, magicAttack: 0, resistance: 0, magicResistance: 0, speed: 12, xp: 9, lexis: 2, drops: ['rawMeat'] },
  mushroom: { name: 'Mushroom Fiend', art: 'mushroom', shape: 'slime', tier: 'small', category: 'gerunds', health: 24, attack: 8, magicAttack: 8, resistance: 0, magicResistance: 0.2, speed: 5, xp: 11, lexis: 3, drops: ['herb'] },
  spider: { name: 'Cave Spider', art: 'spider', shape: 'slime', tier: 'small', category: 'prepositions', health: 28, attack: 14, magicAttack: 0, resistance: 0.1, magicResistance: 0, speed: 13, xp: 15, lexis: 3, drops: ['cloth'] },
  goblin: { name: 'Goblin', art: 'goblin', shape: 'imp', tier: 'small', category: 'vocabulary', health: 30, attack: 14, magicAttack: 0, resistance: 0.1, magicResistance: 0, speed: 11, xp: 16, lexis: 5, drops: [] },
  wolf: { name: 'Verb Wolf', art: 'wolf', shape: 'wolf', tier: 'small', category: 'verbTenses', health: 40, attack: 20, magicAttack: 0, resistance: 0.1, magicResistance: 0, speed: 12, xp: 22, lexis: 5, drops: ['rawMeat', 'bone'] },
  lizardman: { name: 'Lizardman', art: 'lizardman', shape: 'wolf', tier: 'small', category: 'subjectVerb', health: 45, attack: 20, magicAttack: 0, resistance: 0.2, magicResistance: 0, speed: 10, xp: 26, lexis: 6, drops: ['rawMeat'] },
  skeleton: { name: 'Skeleton', art: 'skeleton', shape: 'imp', tier: 'small', category: 'passive', health: 40, attack: 18, magicAttack: 0, resistance: 0.2, magicResistance: 0, speed: 9, xp: 24, lexis: 5, drops: ['bone'] },
  banshee: { name: 'Banshee', art: 'banshee', shape: 'wisp', tier: 'small', category: 'passive', health: 32, attack: 0, magicAttack: 22, resistance: 0.3, magicResistance: 0.4, speed: 14, xp: 28, lexis: 6, night: true, drops: [] },
  wraith: { name: 'Wraith', art: 'wraith', shape: 'wisp', tier: 'small', category: 'passive', health: 36, attack: 0, magicAttack: 22, resistance: 0.3, magicResistance: 0.5, speed: 12, xp: 30, lexis: 7, night: true, drops: ['bone'] },
  drowner: { name: 'Drowner', art: 'drowner', shape: 'wisp', tier: 'small', category: 'pronouns', health: 42, attack: 18, magicAttack: 0, resistance: 0.2, magicResistance: 0.2, speed: 10, xp: 28, lexis: 6, drops: ['bone'] },
  harpy: { name: 'Harpy', art: 'harpy', shape: 'bat', tier: 'small', category: 'prepositions', health: 34, attack: 18, magicAttack: 0, resistance: 0, magicResistance: 0.2, speed: 16, xp: 26, lexis: 6, drops: ['rawMeat'] },
  cultist: { name: 'Cultist', art: 'cultist', shape: 'imp', tier: 'small', category: 'vocabulary', health: 36, attack: 8, magicAttack: 20, resistance: 0, magicResistance: 0.3, speed: 10, xp: 30, lexis: 8, drops: ['cloth'] },
  mimic: { name: 'Mimic', art: 'mimic', shape: 'golem', tier: 'small', category: 'pronouns', health: 50, attack: 24, magicAttack: 0, resistance: 0.3, magicResistance: 0.1, speed: 6, xp: 40, lexis: 30, drops: ['oldCoin'] },
  orc: { name: 'Orc Brute', art: 'orc', shape: 'golem', tier: 'small', category: 'comparatives', health: 60, attack: 28, magicAttack: 0, resistance: 0.2, magicResistance: 0, speed: 8, xp: 36, lexis: 8, drops: ['rawMeat', 'bone'] },
  // the big ones: they ask long texts to read
  stoneGolem: { name: 'Stone Golem', art: 'stoneGolem', shape: 'golem', tier: 'big', tag: 'hard', category: 'comparatives', health: 100, attack: 20, magicAttack: 0, resistance: 0.5, magicResistance: 0, speed: 4, xp: 16, lexis: 4, drops: ['flint', 'flint'] },
  iceGolem: { name: 'Ice Golem', art: 'iceGolem', shape: 'golem', tier: 'big', tag: 'hard', category: 'comparatives', health: 100, attack: 18, magicAttack: 10, resistance: 0.4, magicResistance: 0.3, speed: 5, xp: 16, lexis: 4, drops: ['gem'] },
  boneGolem: { name: 'Bone Golem', art: 'boneGolem', shape: 'golem', tier: 'big', tag: 'hard', category: 'wordForms', health: 110, attack: 20, magicAttack: 0, resistance: 0.3, magicResistance: 0.2, speed: 6, xp: 18, lexis: 5, drops: ['bone', 'bone'] },
  drake: { name: 'Fire Drake', art: 'drake', shape: 'imp', tier: 'big', tag: 'hard', category: 'wordForms', health: 90, attack: 14, magicAttack: 16, resistance: 0.3, magicResistance: 0.3, speed: 12, xp: 18, lexis: 6, drops: ['rawMeat', 'rawMeat'] },
  shadowMage: { name: 'Shadow Mage', art: 'shadowMage', shape: 'imp', tier: 'big', tag: 'hard', category: 'vocabulary', health: 70, attack: 6, magicAttack: 22, resistance: 0.1, magicResistance: 0.5, speed: 11, xp: 18, lexis: 6, drops: ['cloth'] },
  darkKnight: { name: 'Dark Knight', art: 'darkKnight', shape: 'knight', tier: 'demon', tag: 'hard', health: 100, attack: 25, magicAttack: 10, resistance: 0.4, magicResistance: 0.2, speed: 11, xp: 32, lexis: 9, drops: [] },

  // ---------- The army of the Demon King (art/Monsters/Demon king): they live on the Silent Isle and in his castle ----------
  demonSoldier: { name: 'Demon Soldier', art: 'demonSoldier', shape: 'knight', tier: 'demon', tag: 'hard', health: 90, attack: 24, magicAttack: 6, resistance: 0.3, magicResistance: 0.2, speed: 10, xp: 30, lexis: 9, drops: [] },
  demonArcher: { name: 'Demon Archer', art: 'demonArcher', shape: 'imp', tier: 'demon', tag: 'hard', health: 70, attack: 26, magicAttack: 0, resistance: 0.1, magicResistance: 0.2, speed: 14, xp: 30, lexis: 9, drops: [] },
  demonPriest: { name: 'Demon Priest', art: 'demonPriest', shape: 'imp', tier: 'demon', tag: 'hard', health: 75, attack: 6, magicAttack: 24, resistance: 0.1, magicResistance: 0.5, speed: 10, xp: 32, lexis: 10, drops: ['cloth'] },
  abyssHound: { name: 'Abyss Hound', art: 'abyssHound', shape: 'wolf', tier: 'big', tag: 'hard', category: 'connectors', health: 80, attack: 22, magicAttack: 6, resistance: 0.2, magicResistance: 0.2, speed: 16, xp: 20, lexis: 6, drops: ['rawMeat', 'bone'] },
  succubus: { name: 'Succubus', art: 'succubus', shape: 'imp', tier: 'demon', tag: 'hard', health: 80, attack: 8, magicAttack: 24, resistance: 0.1, magicResistance: 0.4, speed: 13, xp: 34, lexis: 12, drops: [] },
  royalGuard: { name: 'Royal Guard', art: 'royalGuard', shape: 'knight', tier: 'demon', tag: 'hard', health: 120, attack: 26, magicAttack: 0, resistance: 0.5, magicResistance: 0.2, speed: 9, xp: 38, lexis: 12, drops: [] },
  darkPaladin: { name: 'Dark Paladin', art: 'darkPaladin', shape: 'knight', tier: 'demon', tag: 'hard', health: 130, attack: 28, magicAttack: 12, resistance: 0.4, magicResistance: 0.3, speed: 10, xp: 42, lexis: 14, drops: [] },
  demonBehemoth: { name: 'Demon Behemoth', art: 'demonBehemoth', shape: 'golem', tier: 'demon', tag: 'hard', health: 180, attack: 32, magicAttack: 0, resistance: 0.4, magicResistance: 0.1, speed: 5, xp: 50, lexis: 16, drops: ['rawMeat', 'rawMeat'] },
  demonLich: { name: 'Demon Lich', art: 'demonLich', shape: 'lich', tier: 'demon', tag: 'hard', health: 110, attack: 0, magicAttack: 28, resistance: 0.2, magicResistance: 0.5, speed: 11, xp: 44, lexis: 14, drops: ['bone'] },
  hellknight: { name: 'Hellknight', art: 'hellknight', shape: 'knight', tier: 'demon', tag: 'hard', health: 150, attack: 30, magicAttack: 8, resistance: 0.4, magicResistance: 0.2, speed: 10, xp: 46, lexis: 15, drops: [] },
  warGeneral: { name: 'War General', art: 'warGeneral', shape: 'general', tier: 'demon', tag: 'hard', health: 160, attack: 30, magicAttack: 10, resistance: 0.4, magicResistance: 0.3, speed: 11, xp: 50, lexis: 18, drops: [] },
  sorcererGeneral: { name: 'Sorcerer General', art: 'sorcererGeneral', shape: 'lich', tier: 'demon', tag: 'hard', health: 130, attack: 6, magicAttack: 30, resistance: 0.2, magicResistance: 0.5, speed: 12, xp: 50, lexis: 18, drops: [] },

  // ---------- The old monsters, drawn with code ----------
  bat: { name: 'Night Bat', shape: 'bat', tier: 'small', category: 'prepositions', health: 20, attack: 10, magicAttack: 0, resistance: 0, magicResistance: 0.2, speed: 14, xp: 14, lexis: 3, night: true, drops: [] },
  wisp: { name: 'Frost Wisp', shape: 'wisp', tier: 'small', category: 'connectors', health: 30, attack: 0, magicAttack: 20, resistance: 0.3, magicResistance: 0.5, speed: 13, xp: 24, lexis: 6, drops: [] },
  treant: { name: 'Old Treant', shape: 'treant', tier: 'big', tag: 'hard', category: 'verbTenses', health: 80, attack: 15, magicAttack: 0, resistance: 0.3, magicResistance: 0, speed: 5, xp: 12, lexis: 3, drops: ['branch', 'branch'] },
  imp: { name: 'Silence Imp', shape: 'imp', tier: 'big', tag: 'hard', category: 'connectors', health: 60, attack: 10, magicAttack: 15, resistance: 0, magicResistance: 0.3, speed: 15, xp: 14, lexis: 4, drops: [] },
  demonKnight: { name: 'Demon Knight', shape: 'knight', tier: 'demon', tag: 'hard', health: 100, attack: 25, magicAttack: 10, resistance: 0.4, magicResistance: 0.2, speed: 11, xp: 32, lexis: 9, drops: [] },

  // ---------- Bosses: one of each, they never come back ----------
  lich: { name: 'The Gerund Lich', shape: 'lich', tier: 'boss', tag: 'normal', boss: true, category: 'gerunds', health: 105, attack: 12, magicAttack: 14, resistance: 0.15, magicResistance: 0.25, speed: 9, xp: 60, lexis: 45, drops: ['gem'] },
  warden: { name: 'The Chrono Warden', shape: 'warden', tier: 'boss', tag: 'hard', boss: true, category: 'verbTenses', health: 180, attack: 20, magicAttack: 20, resistance: 0.3, magicResistance: 0.3, speed: 13, xp: 100, lexis: 60, drops: ['gem'] },
  general: { name: 'General Barbarism', shape: 'general', tier: 'boss', tag: 'hard', boss: true, health: 220, attack: 30, magicAttack: 15, resistance: 0.4, magicResistance: 0.2, speed: 12, xp: 160, lexis: 100, drops: ['gem'] },
  // the three generals and the queen keep the floors of the Castle of Silence (floorBosses in data/dungeons.js)
  ravnos: { name: 'Ravnos, the Blood General', art: 'ravnos', shape: 'general', tier: 'demon', tag: 'hard', boss: true, anyCategory: true, health: 200, attack: 30, magicAttack: 10, resistance: 0.4, magicResistance: 0.3, speed: 12, xp: 90, lexis: 60, drops: ['gem'] },
  thamuz: { name: 'Thamuz, the Tyrant General', art: 'thamuz', shape: 'general', tier: 'demon', tag: 'hard', boss: true, anyCategory: true, health: 240, attack: 32, magicAttack: 8, resistance: 0.5, magicResistance: 0.2, speed: 9, xp: 100, lexis: 70, drops: ['gem'] },
  velmora: { name: 'Velmora, the Cursed General', art: 'velmora', shape: 'lich', tier: 'demon', tag: 'hard', boss: true, anyCategory: true, health: 200, attack: 8, magicAttack: 32, resistance: 0.3, magicResistance: 0.5, speed: 13, xp: 100, lexis: 70, drops: ['gem'] },
  queen: { name: 'Lilith, the Demon Queen', art: 'demonQueen', shape: 'lich', tier: 'demon', tag: 'extreme', boss: true, anyCategory: true, health: 260, attack: 14, magicAttack: 20, resistance: 0.3, magicResistance: 0.5, speed: 14, xp: 110, lexis: 70, drops: ['gem'] },
  king: { name: 'Solecis, the Demon King', art: 'demonKing', shape: 'king', tier: 'demon', tag: 'extreme', boss: true, anyCategory: true, health: 300, attack: 18, magicAttack: 18, resistance: 0.4, magicResistance: 0.4, speed: 14, xp: 120, lexis: 80, drops: [] },
};

export function speciesForSkill(categoryId) {
  return Object.entries(SPECIES)
    .filter(([, s]) => s.category === categoryId && !s.boss)
    .map(([id]) => id);
}

// The questions of each tier: sections (see data/sections.js). The small monsters only ask short sentences
// (rc10): no text to read in the middle of a fight. The texts (rc8, and the long ones) are for the big ones.
// Their difficulty is the tag of the monster.
export const TIERS = {
  small: { sections: ['rc10'] },
  big: { sections: ['rc8', 'text'] },
  boss: { sections: ['rc8', 'text'] },
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
