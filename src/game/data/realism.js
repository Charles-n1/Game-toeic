// Shared static data tables for currency exchange, caste peerage, Appraisal titles,
// political factions, goddess shrines, combat formations, regional taverns, grimoires & booms.

export const CURRENCIES = {
  lexia: { id: 'lexia', name: 'Lexis Crown', short: 'LXP', baseRate: 1.0 },
  verdania: { id: 'verdania', name: 'Verdanian Leaf', short: 'VLF', baseRate: 0.94 },
  frosthold: { id: 'frosthold', name: 'Frostmark', short: 'FMK', baseRate: 1.08 },
  kharsa: { id: 'kharsa', name: 'Kharsa Dinar', short: 'KDN', baseRate: 1.12 },
  aurelia: { id: 'aurelia', name: 'Aurelian Auric', short: 'AUR', baseRate: 1.16 },
  thornvale: { id: 'thornvale', name: 'Thornpence', short: 'THP', baseRate: 0.92 },
  isles: { id: 'isles', name: 'Sky Doubloon', short: 'SKD', baseRate: 1.2 },
};

export const PERISHABLE_ITEMS = {
  rawMeat: 3,
  rawFish: 2,
  milk: 2,
  egg: 4,
  mushroom: 4,
  bread: 5,
  roastMeat: 3,
  roastedFish: 3,
  herbStew: 3,
  spicedStew: 3,
  heartySoup: 3,
  mushroomSoup: 3,
};

export const EARTH_ROYALTIES = {
  mayonnaise: 12,
  ramen: 20,
  curryRice: 28,
  curryStew: 32,
  omeletteRice: 25,
  honeyToast: 18,
  misoBroth: 22,
  karagePlate: 30,
};

export const CASTE_TIERS = [
  { id: 'vagrant', name: 'Vagabond', badge: '🪶', minRep: -999, minRankIdx: 0, minWealth: 0, taxDiscount: 0 },
  { id: 'commoner', name: 'Freemen Burger', badge: '🏠', minRep: 10, minRankIdx: 1, minWealth: 150, taxDiscount: 0.1 },
  { id: 'knight', name: 'Free Knight', badge: '⚔️', minRep: 25, minRankIdx: 2, minWealth: 500, taxDiscount: 0.25 },
  { id: 'baron', name: 'Landed Baronnet', badge: '🛡️', minRep: 45, minRankIdx: 4, minWealth: 1400, taxDiscount: 0.5 },
  { id: 'sovereign', name: 'Realm Savior', badge: '👑', minRep: 70, minRankIdx: 5, minWealth: 3000, taxDiscount: 0.8 },
];

export const APPRAISAL_TITLES = [
  { id: 'newcomer', name: 'Otherworld Wanderer', icon: '🌠', desc: 'Awakened under the falling star.', bonus: { xpPct: 0 } },
  { id: 'goblinBane', name: 'Goblinbane', icon: '🗡️', desc: 'Slew 15+ monsters cleanly.', bonus: { atkPct: 0.08 } },
  { id: 'cleanBlade', name: 'Polished Envoy', icon: '🧼', desc: 'Always impeccably clean at high standing.', bonus: { pricePct: 0.1 } },
  { id: 'masterChef', name: 'Otherworld Gourmet', icon: '🍛', desc: 'Licensed an Earth recipe to the realm.', bonus: { defPct: 0.06, xpPct: 0.06 } },
  { id: 'sageOfLexis', name: 'Lexis Scholar', icon: '📖', desc: 'Answered 100+ TOEIC questions accurately.', bonus: { timePct: 0.12, xpPct: 0.1 } },
  { id: 'merchantPrince', name: 'Guild Magnate', icon: '🪙', desc: 'Accumulated 1,000+ Lexis in the Royal Bank.', bonus: { pricePct: 0.15 } },
  { id: 'shadowDisarmer', name: 'Lock & Trap Master', icon: '🗝️', desc: 'Picked locks or disarmed dungeon traps.', bonus: { critPct: 0.08 } },
  { id: 'obsidianWhisperer', name: 'Obsidian Channeler', icon: '🟣', desc: 'Expanded mana pool through deep depletion training.', bonus: { atkPct: 0.1, spellPct: 0.12 } },
  { id: 'ironSkin', name: 'Hardened Survivor', icon: '🩹', desc: 'Overcame injury & harsh climate exposure.', bonus: { defPct: 0.12 } },
  { id: 'beastFlayer', name: 'Master Skinner', icon: '🥩', desc: 'Reached Flayer Lv.2+ harvesting beast cores.', bonus: { lootPct: 0.15 } },
];

export const FACTIONS = {
  merchantLeague: {
    id: 'merchantLeague',
    name: 'Merchant Guild League',
    icon: '⚖️',
    perk: '-25% bridge tolls & +10% trade value',
  },
  arcaneOrder: {
    id: 'arcaneOrder',
    name: 'Order of the Arcane Veil',
    icon: '🔮',
    perk: '+15% scroll & spell resonance',
  },
  crownLexia: {
    id: 'crownLexia',
    name: 'Crown Watch of Lexia',
    icon: '👑',
    perk: 'Free dungeon charters & reduced court fines',
  },
};

export const GODDESS_SHRINES = [
  { id: 'harvest', name: 'Demeter Altar', icon: '🌾', cost: 10, desc: '+40% forage & harvest yields (24h)' },
  { id: 'scholar', name: 'Athena Altar', icon: '📚', cost: 10, desc: '+18% TOEIC timer & +15% XP (24h)' },
  { id: 'steel', name: 'Ares Altar', icon: '⚔️', cost: 12, desc: '+15% ATK & DEF in battle (24h)' },
  { id: 'wind', name: 'Zephyr Altar', icon: '🍃', cost: 10, desc: '+15% walk speed & slower fatigue (24h)' },
  { id: 'fortune', name: 'Tyche Altar', icon: '🪙', cost: 12, desc: '+25% Lexis loot & +6% crit (24h)' },
];

export const FORMATIONS = {
  vanguard: { id: 'vanguard', name: 'Vanguard', icon: '🛡️', atkMod: 0.12, defMod: 0.2, spellMod: -0.1, timeMod: 0, desc: '+20% DEF, +12% ATK, -10% Spell' },
  midguard: { id: 'midguard', name: 'Midguard', icon: '⚔️', atkMod: 0, defMod: 0, spellMod: 0, timeMod: 0, desc: 'Balanced standard formation' },
  rearguard: { id: 'rearguard', name: 'Rearguard', icon: '✨', atkMod: -0.12, defMod: -0.05, spellMod: 0.22, timeMod: 0.15, desc: '+22% Spell, +15% TOEIC time, -12% ATK' },
};

export const TAVERN_SPECIALS = {
  lexia: { id: 'lexiaRoast', name: 'Lexhaven Honey Crown Roast', price: 22, heal: 45, food: 65, water: 10, morale: 15 },
  verdania: { id: 'verdaniaSalad', name: 'Sylvarum Herb Venison Bowl', price: 20, heal: 40, food: 55, water: 15, morale: 14 },
  frosthold: { id: 'frostStew', name: 'Hrimgard Smoked Mammoth Broth', price: 24, heal: 55, food: 70, water: 15, morale: 18 },
  kharsa: { id: 'kharsaSkewer', name: 'Qadira Saffron Oasis Platter', price: 24, heal: 42, food: 60, water: 30, morale: 16 },
  aurelia: { id: 'aureliaChowder', name: 'Port Aurel Pearl Shellfish Stew', price: 25, heal: 45, food: 58, water: 25, morale: 16 },
  thornvale: { id: 'thornPie', name: 'Thornwick Boar & Ale Pie', price: 21, heal: 44, food: 66, water: 10, morale: 15 },
  isles: { id: 'islesPlatter', name: 'Skyreach Grilled Reef Snapper', price: 23, heal: 48, food: 62, water: 20, morale: 17 },
};

export const GRIMOIRES = [
  { id: 'grimoire_ember', name: 'Pyromancy Commentary', school: 'fire', cost: 25, desc: '+10% Fire spell damage permanently.' },
  { id: 'grimoire_tide', name: 'Hydromancer Treatise', school: 'water', cost: 25, desc: '+10% Water & Ice spell potency.' },
  { id: 'grimoire_storm', name: 'Fulmination Notes', school: 'lightning', cost: 28, desc: '+10% Lightning surge power.' },
  { id: 'grimoire_ward', name: 'Chalk Circles & Wards', school: 'wind', cost: 25, desc: '+10% Wind & protective circle potency.' },
  { id: 'grimoire_syntax', name: 'Syntax of Silent Casting', school: 'obsidian', cost: 35, desc: '+12% Obsidian & +1s combat TOEIC focus.' },
];

export const WORKSTATIONS_DATA = {
  dryingRack: { id: 'dryingRack', name: 'Cedar Drying Rack', desc: 'Preserves fresh meat & fish into Smoked Jerky overnight.' },
  iceBox: { id: 'iceBox', name: 'Crystal Ice-Chest', desc: 'Triples perishable shelf life for raw ingredients.' },
  studyShelf: { id: 'studyShelf', name: 'Scholar Reference Desk', desc: 'Daily study session gives +15% XP gain for the day.' },
  alchemyDesk: { id: 'alchemyDesk', name: 'Home Still & Alembic', desc: 'Brew potions & antiseptic medicine right inside your home.' },
};

export const BARD_RUMORS = [
  'Dungeons left quiet for days spawn denser cores — pack a Mana Lantern.',
  'Boil river water or drink Honey-Lemon Elixir in Kharsa before heatstroke strikes.',
  'Inns buy exotic Earth recipes like Omurice or Curry for perpetual daily royalties!',
  'Wear a Brass Monocle when inspecting ruin chests — Mimics cannot fool good optics.',
  'Salting raw meat with Crystal Salt prevents spoilage across long mountain treks.',
  'Royal palaces refuse filthy boots — bathe at an Inn or scrub with Botanical Soap first.',
  'Training spells until Mana drops below 20% permanently stretches your arcane vessel.',
  'Placing Trail Cairns along muddy roads grants +12% movement speed nearby.',
];

export const MARKET_BOOM_DEFS = [
  { id: 'boom_pelt', kingdom: 'frosthold', itemId: 'pelt', label: 'Winter furs surging in Frosthold (+40% sell)', mult: 1.4 },
  { id: 'boom_herb', kingdom: 'kharsa', itemId: 'herb', label: 'Fever remedies scarce in Kharsa (+40% sell)', mult: 1.4 },
  { id: 'boom_core', kingdom: 'aurelia', itemId: 'coreShard', label: 'Aurelian mages buying Monster Cores (+35% sell)', mult: 1.35 },
  { id: 'boom_paper', kingdom: 'lexia', itemId: 'parchment', label: 'Royal Archives buying Rag Parchment (+45% sell)', mult: 1.45 },
  { id: 'boom_soap', kingdom: 'thornvale', itemId: 'soap', label: 'Court decree in Thornvale boosts Soap (+40% sell)', mult: 1.4 },
  { id: 'boom_pearl', kingdom: 'isles', itemId: 'pearl', label: 'Fleet collectors paying high for Sea Pearls (+35% sell)', mult: 1.35 },
];

export const QUALITY_TIERS = {
  worn: { label: 'Worn', mult: 0.88, color: '#9aa6b8' },
  standard: { label: 'Standard', mult: 1.0, color: '#e8eef7' },
  fine: { label: 'Fine', mult: 1.15, color: '#7cfc9a' },
  masterwork: { label: 'Masterwork', mult: 1.3, color: '#ffd23f' },
};
