// Data catalogs for ISEKAI_TODO systems (skill tree, achievements, weapons, incantations,
// elemental spirits, intelligent monsters, demon emissaries, companion arcs, Part 6 letters,
// anime episodes, CG gallery, and weekly challenges).

export const SKILL_BRANCHES = [
  { id: 'sword', name: 'Sword & Steel', color: '#e85d5d' },
  { id: 'magic', name: 'Arcane Words', color: '#8a6cff' },
  { id: 'survival', name: 'Wilderness Craft', color: '#58c472' },
  { id: 'words', name: 'Lexicon Scholar', color: '#ffd23f' },
];

export const SKILL_TREE = [
  // Sword branch
  { id: 'sw_edge', branch: 'sword', tier: 1, cost: 1, name: 'Keen Edge', desc: '+4 Attack damage', bonus: { attack: 4 } },
  { id: 'sw_crit', branch: 'sword', tier: 2, cost: 1, req: 'sw_edge', name: 'Vital Strike', desc: '+6% Critical hit chance', bonus: { critical: 6 } },
  { id: 'sw_guard', branch: 'sword', tier: 3, cost: 2, req: 'sw_crit', needMastery: { cat: 'subjectVerb', min: 35 }, name: 'Stalwart Guard', desc: '+6 Armor & +20 Max HP (Needs Subject-Verb >= 35%)', bonus: { armor: 6, health: 20 } },
  { id: 'sw_legend', branch: 'sword', tier: 4, cost: 2, req: 'sw_guard', name: 'Blade Tempest', desc: '+12 Attack & +6% Crit', bonus: { attack: 12, critical: 6 } },

  // Magic branch
  { id: 'mg_vessel', branch: 'magic', tier: 1, cost: 1, name: 'Deep Mana', desc: '+2 Max Mana & +8% Spell Power', bonus: { mana: 2, spell: 8 } },
  { id: 'mg_time', branch: 'magic', tier: 2, cost: 1, req: 'mg_vessel', name: 'Chrono Spark', desc: 'Unlocks Time Magic (Dilate / Freeze)', bonus: { spell: 10 }, unlocks: 'timeMagic' },
  { id: 'mg_gravity', branch: 'magic', tier: 3, cost: 2, req: 'mg_time', needMastery: { cat: 'verbTenses', min: 40 }, name: 'Gravity Well', desc: 'Unlocks Gravity Magic (Crush / Levitate) (Needs Tenses >= 40%)', bonus: { spell: 12 }, unlocks: 'gravityMagic' },
  { id: 'mg_silent', branch: 'magic', tier: 4, cost: 2, req: 'mg_gravity', name: 'Silent Casting', desc: 'Cast Written Incantations silently without failing', bonus: { spell: 18, mana: 2 }, unlocks: 'silentCast' },

  // Survival branch
  { id: 'sv_vital', branch: 'survival', tier: 1, cost: 1, name: 'Iron Vitality', desc: '+25 Max HP & +1 Speed', bonus: { health: 25, speed: 1 } },
  { id: 'sv_tamer', branch: 'survival', tier: 2, cost: 1, req: 'sv_vital', name: 'Beast Whisperer', desc: '+25% Monster Tame chance', bonus: { tameChance: 0.25 } },
  { id: 'sv_stride', branch: 'survival', tier: 3, cost: 2, req: 'sv_tamer', needMastery: { cat: 'prepositions', min: 35 }, name: 'Wind Strider', desc: '+2 Combat Speed & +8kg bag capacity (Needs Prepositions >= 35%)', bonus: { speed: 2, carry: 8 } },
  { id: 'sv_raid', branch: 'survival', tier: 4, cost: 2, req: 'sv_stride', name: 'Vanguard Heart', desc: '+15% Ally Party Attack & +20 Max HP', bonus: { partyAtk: 15, health: 20 } },

  // Words branch
  { id: 'wd_focus', branch: 'words', tier: 1, cost: 1, name: 'Sharp Reading', desc: '+12% Question Timer & +10% XP', bonus: { timePct: 12, xpPct: 10 } },
  { id: 'wd_bargain', branch: 'words', tier: 2, cost: 1, req: 'wd_focus', name: 'Silver Tongue', desc: '-10% Shop Prices & +10% Lexis drops', bonus: { discount: 10, lexisPct: 10 } },
  { id: 'wd_syntax', branch: 'words', tier: 3, cost: 2, req: 'wd_bargain', needMastery: { cat: 'gerunds', min: 40 }, name: 'Rapid Comprehension', desc: '+15% XP & +15% Question Timer (Needs Gerunds >= 40%)', bonus: { xpPct: 15, timePct: 15 } },
  { id: 'wd_archmage', branch: 'words', tier: 4, cost: 2, req: 'wd_syntax', name: 'Lexicon Overlord', desc: '+10% Attack, +15% Spell & +15% Lexis', bonus: { attack: 10, spell: 15, lexisPct: 15 } },
];

export const WEAPON_CLASSES = {
  sword: { id: 'sword', name: 'Sword', specialAt: { 3: 'Twin Slash', 6: 'Azure Cleave', 10: 'Judgement Edge' } },
  bow: { id: 'bow', name: 'Bow', specialAt: { 3: 'Pinpoint Shot', 6: 'Rain of Arrows', 10: 'Starfall Volley' } },
  staff: { id: 'staff', name: 'Staff', specialAt: { 3: 'Mana Bolt', 6: 'Arcane Nova', 10: 'Astral Collapse' } },
  dagger: { id: 'dagger', name: 'Dagger', specialAt: { 3: 'Viper Fang', 6: 'Shadow Feint', 10: 'Phantom Edge' } },
  axe: { id: 'axe', name: 'Axe', specialAt: { 3: 'Timber Break', 6: 'Earth Splitter', 10: 'Titan Cleaver' } },
};

export const ACHIEVEMENTS = [
  { id: 'firstBlood', icon: '⚔️', name: 'First Blood', desc: 'Defeat your first monster in Lexia.', reward: { lexis: 25, xp: 15 } },
  { id: 'fastDraw', icon: '⚡', name: 'Lightning Reflex', desc: 'Answer a battle question correctly in under 3 seconds.', reward: { lexis: 30, xp: 20 } },
  { id: 'flawlessFight', icon: '🎯', name: 'Untouched', desc: 'Win a combat encounter with 100% correct answers.', reward: { lexis: 40, xp: 25 } },
  { id: 'hundredCorrect', icon: '📘', name: '100 Answered', desc: 'Record 100 correct English answers across Lexia.', reward: { lexis: 80, skillPt: 1 } },
  { id: 'gerundMaster', icon: '🌸', name: 'Gerund Virtuoso', desc: 'Reach 85% mastery or 30 streak in a category without slipping.', reward: { lexis: 90, skillPt: 1 } },
  { id: 'raidSurvivor', icon: '🛡️', name: 'Raid Survivor', desc: 'Survive and win a village Demon Raid.', reward: { lexis: 75, xp: 40 } },
  { id: 'guildPromoted', icon: '🪪', name: 'Rising Adventurer', desc: 'Pass a Guild Promotion Exam to Rank E or higher.', reward: { lexis: 60, xp: 30 } },
  { id: 'ownGuild', icon: '🏰', name: 'Guildmaster', desc: 'Found your own Adventurer Guild.', reward: { lexis: 150, skillPt: 1 } },
  { id: 'monsterTamer', icon: '🐾', name: 'Friend of Beasts', desc: 'Tame a defeated monster into your roster.', reward: { lexis: 60, xp: 30 } },
  { id: 'spiritPact', icon: '✨', name: 'Spirit Contractor', desc: 'Form a sacred contract with an elemental spirit.', reward: { lexis: 100, skillPt: 1 } },
  { id: 'skyRider', icon: '🦅', name: 'Sky Rider', desc: 'Unlock and ride the flying Griffin mount.', reward: { lexis: 120, xp: 60 } },
  { id: 'masterRefiner', icon: '🔨', name: 'Master Refiner', desc: 'Refine any weapon or armor to +5 or higher.', reward: { lexis: 100, xp: 50 } },
  { id: 'towerClimber', icon: '🗼', name: 'Spire Conqueror', desc: 'Defeat the Floor 5 Boss of the Spire of Babel.', reward: { lexis: 150, skillPt: 1 } },
  { id: 'secretSeeker', icon: '🔍', name: 'Secret Seeker', desc: 'Unlock a hidden Secret Dungeon Floor via an English clue.', reward: { lexis: 120, xp: 60 } },
  { id: 'emissaryBane', icon: '👹', name: 'Scourge of Emissaries', desc: 'Defeat a roaming Demon King Emissary Clan.', reward: { lexis: 180, skillPt: 1 } },
  { id: 'chantMaster', icon: '📜', name: 'Incantation Weaver', desc: 'Complete 3 Written Incantation spells.', reward: { lexis: 70, xp: 35 } },
  { id: 'heartBond', icon: '💌', name: 'True Companion', desc: 'Complete a companion personal story quest arc.', reward: { lexis: 100, xp: 60 } },
  { id: 'photographer', icon: '📷', name: 'Memory Keeper', desc: 'Collect 5 photos in your Adventure Album.', reward: { lexis: 50, xp: 25 } },
];

export const MONSTER_RANKS = [
  { rank: 'F', color: '#8e9aaf', label: 'F-Rank' },
  { rank: 'E', color: '#4cc35a', label: 'E-Rank' },
  { rank: 'D', color: '#3a9bfd', label: 'D-Rank' },
  { rank: 'C', color: '#b46cff', label: 'C-Rank' },
  { rank: 'B', color: '#f5a623', label: 'B-Rank' },
  { rank: 'A', color: '#ff5a6e', label: 'A-Rank' },
  { rank: 'S', color: '#ffd23f', label: 'S-Rank' },
];

export const WRITTEN_INCANTATIONS = [
  {
    id: 'pyroclasm',
    name: 'Crimson Pyroclasm',
    mpCost: 3,
    kind: 'damage',
    power: 48,
    prompt: 'Flames that burned the ancient cities, ______ my enemy before dawn!',
    answers: ['consume', 'consumed', 'consuming', 'to consume'],
    correct: 0,
    category: 'verbTenses',
    explain: 'Imperative address takes base verb form "consume".',
  },
  {
    id: 'aegisSanctum',
    name: 'Astral Aegis',
    mpCost: 2,
    kind: 'shieldHeal',
    heal: 45,
    prompt: 'By the ancient shield ______ during the first war, grant me refuge!',
    answers: ['forged', 'forging', 'forge', 'to forge'],
    correct: 0,
    category: 'passive',
    explain: 'Past participle "forged" introduces the reduced passive clause.',
  },
  {
    id: 'galeJudgement',
    name: 'Tempest Sentence',
    mpCost: 3,
    kind: 'damage',
    power: 56,
    prompt: 'Heeding every word ______ swiftly across the battlefield, strike now!',
    answers: ['spoken', 'speaking', 'speak', 'spoke'],
    correct: 0,
    category: 'passive',
    explain: 'Passive modifier describing words that were spoken: "spoken".',
  },
  {
    id: 'chronosWard',
    name: 'Echoing Mending',
    mpCost: 2,
    kind: 'shieldHeal',
    heal: 60,
    prompt: 'Before the hourglass ______ empty, restore the strength within these bones.',
    answers: ['runs', 'running', 'ran', 'will run'],
    correct: 0,
    category: 'verbTenses',
    explain: 'Present simple "runs" is used after time conjunctions like "before".',
  },
  {
    id: 'meteorScript',
    name: 'Celestial Dictum',
    mpCost: 4,
    kind: 'damage',
    power: 80,
    prompt: 'Avoid ______ hastily when a demon speaks in veiled metaphors.',
    answers: ['reacting', 'to react', 'react', 'reacted'],
    correct: 0,
    category: 'gerunds',
    explain: '"Avoid" is always followed by a gerund ("reacting").',
  },
];

export const ELEMENTAL_SPIRITS = [
  {
    id: 'salamander',
    name: 'Ignis, Spirit of Salamander',
    element: 'fire',
    color: '#ff6a33',
    icon: '🔥',
    placeHint: 'Near volcanic Ember / Molten Mines in the northwest',
    bonusText: '+18% Fire/Spell Attack & scorches foes on summon',
    passage:
      'INSPIRATION TRIAL — SALAMANDER OF CINDER PEAK\n\nUnlike wild wildfires that scatter ash without purpose, true forge flame burns only where discipline guides it. A contracted fire spirit amplifies spells only for scholars who distinguish steady tense from hurried guesswork.',
    question: 'According to the Fire Spirit, what separates forge flame from wildfire?',
    answers: [
      'Disciplined guidance controls where it burns.',
      'Wildfire lasts ten times longer in winter.',
      'Only swordsmen can light a forge fire.',
      'It refuses to burn during daylight hours.',
    ],
    correct: 0,
    lines: ['"Your grammar burns brighter than furnace coal, contractor!"', '"Call me in battle and watch shadows crumble into sparks."'],
  },
  {
    id: 'undine',
    name: 'Neris, Spirit of Undine',
    element: 'water',
    color: '#5ad2ff',
    icon: '💧',
    placeHint: 'Along Emerald Falls & eastern lakeshores',
    bonusText: 'Heals +28 HP & +2 MP when summoned + slows thirst drain',
    passage:
      'CONTRACT VERSE — UNDINE OF THE CLEAR STREAM\n\nSpring water carries memory across valleys, cleansing poison from exhausted travelers. Those who speak clearly calm the rapids, whereas careless phrasing turns gentle tides turbulent.',
    question: 'What gift do clear spring waters carry according to Undine?',
    answers: [
      'They freeze every wooden boat in spring.',
      'They cleanse poison from exhausted travelers.',
      'They turn salt mines into iron veins.',
      'They drain mana from nearby villagers.',
    ],
    correct: 1,
    lines: ['"Clear thoughts make calm water. Lean on my current anytime."', '"My tide will wash away battle wounds when you call."'],
  },
  {
    id: 'sylph',
    name: 'Aera, Spirit of Sylph',
    element: 'wind',
    color: '#98f5a6',
    icon: '🍃',
    placeHint: 'On windy ridges above Watchtower Cape',
    bonusText: '+2 Combat Speed & guarantees first-strike gusts on summon',
    passage:
      'TRIAL OF THE SKY BREEZE — SYLPH CHARTER\n\nMessages carried on high-altitude gales reach coastal watchtowers hours before mounted couriers arrive. By keeping sentences concise, riders gain precious seconds to strike before their foes react.',
    question: 'How does the Sylph charter help warriors strike earlier?',
    answers: [
      'Heavy armor sinks faster in wind.',
      'Concise messages earn extra seconds to react.',
      'Carriages drive twice as slowly uphill.',
      'Rain washes footprints off the coast.',
    ],
    correct: 1,
    lines: ['"Light steps, swift words! Nothing outruns our tailwind."', '"Keep answers crisp and monsters will swing at thin air."'],
  },
  {
    id: 'gnome',
    name: 'Torin, Spirit of Gnome',
    element: 'earth',
    color: '#d8a65a',
    icon: '🪨',
    placeHint: 'Among the Old Stones & Greendale mining hills',
    bonusText: '+8 Armor & stuns/crushes enemy defenses when summoned',
    passage:
      'OATH OF BEDROCK — GNOME COVENANT\n\nQuarried granite outlasts kings because every stone is cut to exact measure before placement. Rushed builders watch arches crack within a season, while patient masons raise bastions that weather centuries.',
    question: 'Why does quarried granite outlast rushed buildings?',
    answers: [
      'Every stone is cut to exact measure before placement.',
      'Granite melts safely whenever winter arrives.',
      'Masons skip inspecting foundation layers.',
      'Rushed arches are painted with bright lacquer.',
    ],
    correct: 0,
    lines: ['"Roots deep, footing steady. Let them break against our shield."', '"Call on the bedrock when a demon swings too hard."'],
  },
];

export const INTELLIGENT_MONSTERS = [
  {
    id: 'chiefGrog',
    species: 'goblin',
    name: 'Chief Grog',
    title: 'Peaceful Goblin Tinkerer',
    homeLabel: 'Truce Camp near Eldermoor',
    offset: { dx: 18, dy: 14 },
    tradeItem: 'protectionScroll',
    tradeCost: 110,
    questAsk: 'Bring 2 Iron Ore so our peaceful goblin camp can forge cooking pots instead of spears!',
    questItem: 'ore',
    questNeed: 2,
    rewardLexis: 95,
    lines: [
      '"Humans think every goblin wants fight! Not Grog clan. We like warm stew and sharp bargains!"',
      '"Bring iron ore? We trade shiny scrolls and join your guild banner!"',
    ],
  },
  {
    id: 'sszarak',
    species: 'lizardman',
    name: 'Sszarak the Wise',
    title: 'Marsh Scholar Lizardman',
    homeLabel: 'Riverford Reeds',
    offset: { dx: -20, dy: 18 },
    tradeItem: 'refineStone',
    tradeCost: 45,
    questAsk: 'Bring 2 Forest Mushrooms for my marsh ink experiments.',
    questItem: 'mushroom',
    questNeed: 2,
    rewardLexis: 105,
    lines: [
      '"Calm scales, steady grammar. Words are older than dragonfire, traveler."',
      '"Once you aid my ink study, my spear stands ready for your Guild!"',
    ],
  },
  {
    id: 'aeris',
    species: 'harpy',
    name: 'Aeris of the Gale',
    title: 'Lost Courier Harpy',
    homeLabel: 'Coast Cliffside',
    offset: { dx: 24, dy: -16 },
    tradeItem: 'spiritCharm',
    tradeCost: 70,
    questAsk: 'Bring 3 Wild Feathers so I can mend my torn wing-cloak.',
    questItem: 'feather',
    questNeed: 3,
    rewardLexis: 115,
    lines: [
      '"S-stay back—oh, you carry no net! My wing-cloak tore above Watchtower Cape..."',
      '"Mend my feathers and I will scout dungeons and fly letters for your Guild!"',
    ],
  },
];

export const DEMON_EMISSARIES = [
  { id: 'emissary_ash', name: "Ashfang War Clan", species: 'warGeneral', title: 'Demon King Vanguard', region: 'Northern Plains', bounty: 240, xp: 160, doomCut: 15 },
  { id: 'emissary_malakor', name: "Inquisitor Malakor's Coven", species: 'sorcererGeneral', title: 'Grand Inquisitor Emissary', region: 'Eastern Marshes', bounty: 300, xp: 200, doomCut: 20 },
  { id: 'emissary_krag', name: 'General Skorn Legion', species: 'demonBehemoth', title: 'Breaker of Borders', region: 'Frozen Pass', bounty: 360, xp: 250, doomCut: 25 },
];

export const COMPANION_ARCS = {
  aria: {
    npcId: 'aria',
    title: "The Saint's Lost Prayerbook",
    ultimateName: 'Seraphic Sanctuary',
    ultimateDesc: 'Heals +25 HP & grants Status Immunity burst in battles',
    stages: [
      { goal: 'Bring 2 Herbs so Aria can brew memory-clearing tea.', item: 'herb', need: 2, dialogue: '"Thank you... the scent reminds me of the abbey where I studied before the first war."' },
      { goal: 'Deliver 1 Blue Crystal from any dungeon or mine to restore her prayerbook seal.', item: 'crystal', need: 1, dialogue: '"The ancient seal gleams again! I remember why I swore to heal every summoned traveler."' },
      { goal: 'Reach 100 answers right or 25 Friendship with Aria to awaken her vow.', minCorrect: 20, dialogue: '"From this day on, Seraphic Sanctuary stands between you and death!"' },
    ],
  },
  yuki: {
    npcId: 'yuki',
    title: 'The Frost Library Manuscript',
    ultimateName: 'Zero-Syntax Nova',
    ultimateDesc: '+20% Spell Power & freezing counterstrike bonus',
    stages: [
      { goal: 'Bring 2 Parchment (or Cloth) for Yuki to copy faded archive runes.', item: 'cloth', need: 2, dialogue: '"Careful with the margins! These fragments describe time-halting incantations."' },
      { goal: 'Defeat 10 monsters of any kind to gather combat rune resonance.', minKills: 10, dialogue: '"Fascinating! Battle pressure sharpens how quickly you parse clauses!"' },
      { goal: 'Bring 1 Gem to bind Yuki’s frost focus lens.', item: 'gem', need: 1, dialogue: '"Manuscript complete! Zero-Syntax Nova is now etched in our link!"' },
    ],
  },
  arthur: {
    npcId: 'arthur',
    title: 'Oath of the Broken Shield',
    ultimateName: 'Dawn Bastion',
    ultimateDesc: '+10 Armor & heavy companion tank interception',
    stages: [
      { goal: 'Bring 2 Iron Ore to reforge Arthur’s chipped kite shield.', item: 'ore', need: 2, dialogue: '"This crest belonged to the border regiment I failed to save three winters ago."' },
      { goal: 'Win 15 battles to prove the new banner will not retreat.', minKills: 15, dialogue: '"Every victory settles old ghosts. One final oath remains."' },
      { goal: 'Bring 1 Whetstone Shard (or Soft Pelt) to finish the grip wrapping.', item: 'pelt', need: 1, dialogue: '"Dawn Bastion stands unbroken beside you, commander!"' },
    ],
  },
  luna: {
    npcId: 'luna',
    title: 'Cartographer of Fallen Stars',
    ultimateName: 'Starlight Compass',
    ultimateDesc: '+15% XP & bonus dungeon loot luck',
    stages: [
      { goal: 'Bring 2 Flint Stones to calibrate Luna’s brass astrolabe.', item: 'flint', need: 2, dialogue: '"Notice how the ruins align directly with the constellations over the Demon Isle."' },
      { goal: 'Deliver 1 Old Coin etched with ancient script for meridian comparison.', item: 'oldCoin', need: 1, dialogue: '"This mint predates the Kingdom of Silence itself!"' },
      { goal: 'Defeat 20 monsters in exploration to chart the ley currents.', minKills: 20, dialogue: '"Every star line is mapped! Starlight Compass will guide our fortune!"' },
    ],
  },
  nyx: {
    npcId: 'nyx',
    title: 'Shadows Behind the Mask',
    ultimateName: 'Eclipse Fang',
    ultimateDesc: '+10% Critical Chance & stealth ambush bonus',
    stages: [
      { goal: 'Bring 2 Raw Meat or Roast Meat for a midnight stakeout ration.', item: 'rawMeat', need: 2, dialogue: '"I used to spy inside demon territory. Never trust anyone who doesn’t check exits first."' },
      { goal: 'Gather 1 Gem to trade with informants at dusk.', item: 'gem', need: 1, dialogue: '"Clean handoff. They confirmed the emissaries coordinate from the northern passes."' },
      { goal: 'Reach Level 4 or win 25 battles beside the shadows.', minKills: 25, dialogue: '"Masks off, partner. Eclipse Fang strikes from your blind spot now."' },
    ],
  },
};

export const PART6_LETTERS = [
  {
    id: 'elena_welcome',
    sender: 'Elena (Guild Receptionist)',
    subject: 'Adventurer Registry & Promotion Schedule',
    urgent: true,
    text: 'Dear Adventurer,\nYour bronze registration is now active on the Kingdom Ledger. Please remember that Rank Promotion Examinations ____ held daily at the counter, and failing an exam requires a one-day waiting period before retaking.',
    question: 'Choose the correct word to complete Elena’s notice:',
    answers: ['are', 'is', 'been', 'was'],
    correct: 0,
    category: 'subjectVerb',
    rewardLexis: 35,
    npcId: 'brann',
  },
  {
    id: 'aria_tea',
    sender: 'Aria',
    subject: 'Clinic Stock & Herbal Remedies',
    urgent: false,
    text: 'Hello,\nWhenever storms soak travelers outside the gates, fever spreads fast. Should you find ____ wild herbs during your patrols, please keep a bundle in your bag or drop by my clinic before dark.',
    question: 'Pick the word that best fits Aria’s letter:',
    answers: ['any', 'much', 'every', 'little'],
    correct: 0,
    category: 'pronouns',
    rewardLexis: 35,
    npcId: 'aria',
  },
  {
    id: 'smith_refine',
    sender: 'Bram the Blacksmith',
    subject: 'Masterwork Refining Caution',
    urgent: false,
    text: 'Traveler,\nRefining blades above +3 carries real heat risk: hammer blows can drop a weapon back down one level unless protected ____ an ancient Refine Protection Scroll from the market.',
    question: 'Which preposition completes the blacksmith’s warning?',
    answers: ['by', 'at', 'between', 'into'],
    correct: 0,
    category: 'prepositions',
    rewardLexis: 40,
    npcId: 'bram',
  },
  {
    id: 'luna_spire',
    sender: 'Luna',
    subject: 'Rumor of the 10-Floor Spire',
    urgent: true,
    text: 'Urgent Memo — Expeditions:\nExplorers spotted obsidian portals climbing ten stories above the Old Ruins. ____ reaching the 5th floor boss, hikers unlock a permanent Warp Checkpoint so later climbs start from Floor 6!',
    question: 'Complete Luna’s expedition dispatch:',
    answers: ['Upon', 'Despite', 'Unless', 'Whereas'],
    correct: 0,
    category: 'connectors',
    rewardLexis: 45,
    npcId: 'luna',
  },
  {
    id: 'hugo_delivery',
    sender: 'Hugo (Innkeeper)',
    subject: 'Evening Feast Invitations',
    urgent: false,
    text: 'Hey classmate!\nWord of our curry spread across the capital! Next time you stop by Riverford or pitch camp, remember ____ warmly before sleeping — a full stomach boosts combat focus far more than dry rations.',
    question: 'Choose the right form to finish Hugo’s note:',
    answers: ['to eat', 'eating', 'eat', 'ate'],
    correct: 0,
    category: 'gerunds',
    rewardLexis: 40,
    npcId: 'hugo',
  },
  {
    id: 'king_decree',
    sender: 'Royal Chancery of Lexia',
    subject: 'Border Patrol & Monster Emissaries',
    urgent: true,
    text: 'Royal Decree #408:\nEmissary warbands carrying the Demon King’s crimson seal have entered outer provinces. Adventurers ____ Adventurer Cards show Rank D or higher are authorized to claim priority border stipends.',
    question: 'Select the relative pronoun that completes the decree:',
    answers: ['whose', 'whom', 'which', 'what'],
    correct: 0,
    category: 'pronouns',
    rewardLexis: 55,
    npcId: 'arthur',
  },
];

export const ANIME_EPISODES = [
  { ep: 1, title: 'Episode 1: The Summoned Hero Who Forgot Past Tense', nextPreview: 'Next Time: First Slimes & the Guild Gate!' },
  { ep: 2, title: 'Episode 2: A Bronze Card in the Town of Words', nextPreview: 'Next Time: Dungeons Under the Singing Crystals!' },
  { ep: 3, title: 'Episode 3: Crimson Rain and the Village Under Siege', nextPreview: 'Next Time: Ancient Spirits Beneath the Four Winds!' },
  { ep: 4, title: 'Episode 4: Wings Over Frostpeak & the Tenth Floor', nextPreview: 'Next Time: Showdown at the Castle of Silence!' },
  { ep: 5, title: 'Episode 5: Say My Name — The King Who Silenced a World', nextPreview: 'Epilogue: A New Grammar Dawn in Lexia!' },
];

export const GALLERY_SCENES = [
  { id: 'arrival', title: 'Summoned Under Falling Stars', icon: '🌠', desc: 'Your first breath in Eldermoor after the exam gate opened.', color: '#26386e' },
  { id: 'firstWin', title: 'First Blade of Grammar', icon: '⚔️', desc: 'Your first monster defeated with sharp English syntax.', color: '#6b222a' },
  { id: 'guildPromo', title: 'Promoted by Elena', icon: '🪪', desc: 'Stamped at the Guild desk for higher-tier expeditions.', color: '#8a5a18' },
  { id: 'spiritPact', title: 'Covenant of Elements', icon: '✨', desc: 'An elemental spirit answered your reading vow.', color: '#1b5e5a' },
  { id: 'skyFlight', title: 'Soaring Above Lexia', icon: '🦅', desc: 'Crossing rivers and peaks atop your Sky Griffin.', color: '#325a9c' },
  { id: 'wedding', title: 'A Vow in Eldermoor', icon: '💍', desc: 'Sharing home and hearth beneath warm candlelight.', color: '#8c2d56' },
  { id: 'kingSlain', title: 'The Throne Speaks Again', icon: '👑', desc: 'Solecis falls and Silence lifts from the Kingdom.', color: '#4a1d66' },
];

export const WEEKLY_CHALLENGES = [
  { id: 'wc_answers', kind: 'answers', goal: 25, title: 'Weekly Sprint: 25 Right Answers', desc: 'Give 25 correct TOEIC answers during this week.', reward: { lexis: 120, item: 'protectionScroll' } },
  { id: 'wc_fast', kind: 'fastKills', goal: 5, title: 'Speed Striker: 5 Rapid Answers', desc: 'Answer 5 combat questions accurately within 5 seconds.', reward: { lexis: 110, item: 'refineStone' } },
  { id: 'wc_hunts', kind: 'kills', goal: 8, title: 'Frontier Patrol: Defeat 8 Monsters', desc: 'Clear 8 monsters roaming the wilds or dungeons.', reward: { lexis: 130, item: 'spiritCharm' } },
  { id: 'wc_nopot', kind: 'cleanWins', goal: 4, title: 'Iron Discipline: 4 Potions-Free Wins', desc: 'Win 4 battles without drinking any potion.', reward: { lexis: 150, item: 'gem' } },
];
