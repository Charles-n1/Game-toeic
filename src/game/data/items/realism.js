// Realistic Isekai items covering alchemy/medicine, Earth paper & hygiene crafts,
// spell scrolls, cores, contracts, homestead workstations, and culinary specialties.

export const REALISM_ITEMS = {
  // Trade, Craft & Utility Materials
  salt: { name: 'Crystal Salt', icon: '🧂', kind: 'material', price: 8, sell: 3, text: 'Cures fresh meat & fish into everlasting smoked jerky.' },
  soap: { name: 'Botanical Soap', icon: '🧼', kind: 'tool', price: 14, sell: 6, text: 'Wash off mud and blood (+100% Cleanliness & +12% charm bonus).' },
  tallow: { name: 'Rendered Tallow', icon: '🕯️', kind: 'material', price: 7, sell: 3, text: 'Clarified animal fat used to craft soap and waterproof oil-wax.' },
  parchment: { name: 'Rag Parchment', icon: '📜', kind: 'material', price: 12, sell: 5, text: 'Hand-pressed fine sheet sought by scholars and mages.' },
  ink: { name: 'Iron-Gall Ink', icon: '🖋️', kind: 'material', price: 10, sell: 4, text: 'Crisp dark ink for scribing spell scrolls and ledgers.' },
  tinder: { name: 'Brass Tinderbox', icon: '🔥', kind: 'tool', price: 18, sell: 7, text: 'Sparks a campfire reliably even through mountain wind or damp.' },
  chalk: { name: 'Rune Chalk', icon: '🪄', kind: 'tool', price: 12, sell: 5, text: 'Traces a protective Ward or Regen magic circle under your feet in fight.' },
  lockpick: { name: 'Thief Lockpick', icon: '🗝️', kind: 'tool', price: 16, sell: 6, text: 'Fine steel pick for opening sealed ruin caches via TOEIC timing.' },
  compass: { name: 'Magnetic Compass', icon: '🧭', kind: 'tool', price: 85, sell: 35, text: 'Gives true bearings toward capitals & wards off desert mirages.' },
  manaLantern: { name: 'Mana Lantern', icon: '🏮', kind: 'tool', price: 140, sell: 55, text: 'Crystal lantern burning 1 shard/day to banish dungeon darkness forever.' },
  oilWax: { name: 'Waterproof Oil-Wax', icon: '🪔', kind: 'tool', price: 18, sell: 7, text: 'Coats gear for 48h to block rain soak & northern hypothermia.' },
  bait: { name: 'River Worm Bait', icon: '🪱', kind: 'tool', price: 6, sell: 2, text: 'Attracts prized river trout, sunken coin & shimmering sea pearls.' },
  postLetter: { name: 'Courier Seal', icon: '✉️', kind: 'tool', price: 15, sell: 5, text: 'Send gifts or correspondence across kingdoms by carrier pigeon.' },
  tentKit: { name: 'Waxed Field Tent', icon: '⛺', kind: 'tool', price: 90, sell: 35, text: 'Elevated canvas shelter granting 95% sleep quality outdoors.' },

  compost: { name: 'Field Compost', icon: '🌱', kind: 'material', price: 6, sell: 2, text: 'Fertilizer made from spoiled rations. Doubles harvest when planting.' },

  // Monster Cores & Rare Finds
  coreShard: { name: 'Lesser Monster Core', icon: '🟣', kind: 'material', price: 45, sell: 22, text: 'Crystallized beast mana. Powers lanterns, scrolls & crystal batteries.' },
  monsterCore: { name: 'Pristine Monster Core', icon: '🔮', kind: 'goods', price: 130, sell: 68, text: 'Dense elemental nucleus harvested by skilled flayers.' },
  elderCore: { name: 'Elder Calamity Core', icon: '💎', kind: 'goods', price: 320, sell: 175, text: 'Radiant boss core used for Masterwork tempering & noble commissions.' },
  pearl: { name: 'Sea Pearl', icon: '🦪', kind: 'goods', price: 110, sell: 65, text: 'Lustrous coastal jewel coveted by court jewelers.' },
  rosetteFragment: { name: 'Rosette Star Shard', icon: '🌟', kind: 'goods', price: 95, sell: 45, text: 'Collect 3 to forge a one-use fatal-blow survival charm.' },

  // Permits, Patents & Banking Notes
  delveCharter: { name: 'Crown Delve Charter', icon: '📜', kind: 'goods', price: 55, sell: 20, text: 'Exempts you from dungeon gate salvage taxes.' },
  merchantPatent: { name: 'Merchant Stall Patent', icon: '⚖️', kind: 'goods', price: 160, sell: 60, text: 'Eliminates market stall broker commissions.' },
  creditNote: { name: 'Bank Promissory Note', icon: '🏦', kind: 'goods', price: 500, sell: 500, text: '0 kg sealed royal draft redeemable for 500 Lexis at any bank counter.' },

  // Combat Spell Scrolls (0 MP cast)
  fireScroll: { name: 'Fireball Scroll', icon: '🔥', kind: 'scroll', inFight: true, scrollType: 'fire', price: 45, sell: 18, text: 'Unleash 32 Fire damage in combat with zero MP cost.' },
  healScroll: { name: 'Restoration Scroll', icon: '✨', kind: 'scroll', inFight: true, scrollType: 'heal', price: 40, sell: 16, text: 'Restore +75 HP & cleanse wound shock in combat (0 MP).' },
  wardScroll: { name: 'Aegis Ward Scroll', icon: '🛡️', kind: 'scroll', inFight: true, scrollType: 'ward', price: 42, sell: 17, text: 'Raise an inscribed barrier blocking 35% damage this battle (0 MP).' },
  blinkScroll: { name: 'Flash Step Scroll', icon: '⚡', kind: 'scroll', inFight: true, scrollType: 'blink', price: 48, sell: 19, text: 'Haste strike (+15 Lightning damage & +4s timer, 0 MP).' },

  // Medicine, Tonics & Preserved Rations
  herbalPoultice: { name: 'Herbal Poultice', icon: '🌿', kind: 'potion', curesSprain: true, heal: 25, price: 24, sell: 9, text: 'Binds bone sprains & bruises (+25 HP, cures Sprain).' },
  antiseptic: { name: 'Clinic Antiseptic', icon: '🧪', kind: 'potion', curesInfection: true, heal: 20, price: 28, sell: 11, text: 'Cleanses wound sepsis and fever (+20 HP, cures Infection).' },
  honeyLemonTea: { name: 'Honey-Lemon Elixir', icon: '🍋', kind: 'food', food: 10, water: 40, heal: 20, curesDysentery: true, curesSickness: true, price: 22, sell: 8, text: 'Food +10, Water +40, +20 HP. Cures dysentery & potion sickness.' },
  smokedJerky: { name: 'Salted Smoked Jerky', icon: '🥓', kind: 'food', food: 45, heal: 14, morale: 4, price: 22, sell: 10, text: 'Food +45, +14 HP. Cured in salt — never spoils.' },
  spicedBroth: { name: 'Warm Spiced Broth', icon: '🍲', kind: 'food', food: 30, water: 30, heal: 25, curesCold: true, morale: 6, price: 24, sell: 9, text: 'Food +30, Water +30, +25 HP · Cures Cold & warms frost.' },
  pickledRadish: { name: 'Pickled Roots', icon: '🥬', kind: 'food', food: 28, water: 12, heal: 12, price: 14, sell: 6, text: 'Food +28, Water +12, +12 HP. Vinegar-sealed long rations.' },

  // Earth Specialty Culinary Royalties Dishes
  curryStew: { name: 'Hearty Japanese Curry', icon: '🍛', kind: 'food', food: 80, heal: 45, morale: 14, earthDish: true, price: 58, sell: 24, text: 'Food +80, +45 HP, +14 Morale. Inns pay daily royalties for the recipe!' },
  omeletteRice: { name: 'Fluffy Omurice', icon: '🍳', kind: 'food', food: 72, heal: 40, morale: 12, earthDish: true, price: 52, sell: 22, text: 'Food +72, +40 HP, +12 Morale. Beloved Earth comfort dish.' },
  honeyToast: { name: 'Golden Honey Toast', icon: '🍞', kind: 'food', food: 55, heal: 30, morale: 10, earthDish: true, price: 38, sell: 16, text: 'Food +55, +30 HP, +10 Morale. Sweet crisp bread from another world.' },
  misoBroth: { name: 'Roasted Miso Soup', icon: '🍜', kind: 'food', food: 40, water: 38, heal: 28, morale: 10, earthDish: true, price: 34, sell: 14, text: 'Food +40, Water +38, +28 HP, +10 Morale. Soothing savory broth.' },
  karagePlate: { name: 'Spiced Crisp Karaage', icon: '🍗', kind: 'food', food: 68, heal: 35, morale: 12, earthDish: true, price: 48, sell: 20, text: 'Food +68, +35 HP, +12 Morale. Golden spiced crisp poultry.' },

  // Realistic Gear, Stealth & Haulage
  hoodedCloak: { name: 'Disguise Hood', icon: '🥷', kind: 'accessory', defense: 3, stealth: true, price: 95, sell: 38, text: 'Defense +3. Grants +20% ambush strike & shields identity in rough districts.' },
  monocle: { name: 'Brass Appraisal Monocle', icon: '🧐', kind: 'accessory', power: 2, appraise: true, price: 140, sell: 55, text: 'Attack +2. Auto-detects Mimic chests, weak points & counterfeit coins.' },
  packMule: { name: 'Pack Mule Halter', icon: '🫏', kind: 'pack', capacityBonus: 45, price: 260, sell: 110, text: 'Led pack mule carrying +45 kg of ore, pelts & trade goods.' },

  // Home Craft Workstations
  dryingRack: { name: 'Cedar Drying Rack', icon: '🪵', kind: 'workstation', station: 'dryingRack', price: 85, sell: 30, text: 'Install in your Home to cure raw meat & fish into everlasting jerky.' },
  iceBox: { name: 'Crystal Ice-Chest', icon: '🧊', kind: 'workstation', station: 'iceBox', price: 160, sell: 65, text: 'Install in your Home to triple perishable food shelf life.' },
  studyShelf: { name: 'Scholar Reference Desk', icon: '📚', kind: 'workstation', station: 'studyShelf', price: 130, sell: 50, text: 'Install in your Home for +15% daily TOEIC XP study sessions.' },
  alchemyDesk: { name: 'Home Still & Alembic', icon: '⚗️', kind: 'workstation', station: 'alchemyDesk', price: 150, sell: 60, text: 'Install in your Home to brew potions & antiseptics from home.' },
};
