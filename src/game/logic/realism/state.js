import { KINGDOMS } from '../../data/kingdoms';

// Canonical saved state schema for all 112 realistic Isekai mechanics (Economy, Mana Physics,
// Survival/Medical, Dungeon Ecology, Living World, Social Caste/Titles/Factions, Companions, Codex).

export function defaultFxRates() {
  const rates = {};
  for (const k of KINGDOMS) {
    rates[k.id] = k.id === 'lexia' ? 1.0 : 0.96;
  }
  return rates;
}

export function defaultCurrencies() {
  const wallet = {};
  for (const k of KINGDOMS) wallet[k.id] = 0;
  return wallet;
}

export function firstRealism() {
  return {
    bank: { balance: 0, lastInterestDay: 1 },
    currencies: defaultCurrencies(),
    fxRates: defaultFxRates(),
    counterfeitBatch: 0,
    debt: { owed: 0, dueDay: 0, defaulted: false },
    investments: {},
    patents: { merchantLicense: false, royalties: {} },
    fines: { total: 0, bannedUntil: {} },
    smuggling: { seizedValue: 0, heat: 0 },
    manaTrain: {
      depletedSpend: 0,
      bonusMaxMp: 0,
      backlashHours: 0,
      spellMastery: {},
      crystalCharge: 0,
      maxCrystalCharge: 12,
      studiedGrimoires: [],
    },
    combatRealism: {
      formation: 'midguard',
      activeCircle: null,
      spellChain: 0,
      ambushReady: false,
      trappedFloor: {},
      disarmedTraps: {},
      pickedLocks: {},
      mimicChecked: {},
      heirloom: null,
      quality: { weapon: 'standard', armor: 'standard', boots: 'standard' },
      gentlemanDuel: false,
    },
    health: {
      cleanliness: 92,
      morale: 88,
      infectionHours: 0,
      sprainHours: 0,
      dysenteryHours: 0,
      potionCount6h: 0,
      potionCooldownHours: 0,
      waterproofHours: 0,
      repellentHours: 0,
      hypothermia: false,
      heatstroke: false,
      wellRestedHours: 0,
      watchMateId: null,
      bootWear: 0,
    },
    skills: {
      flayerXp: 0,
      flayerLevel: 1,
      trapDisarms: 0,
      lockpicks: 0,
      cleanKillStreak: 0,
    },
    spoilage: {},
    workstations: {
      dryingRack: false,
      iceBox: false,
      studyShelf: false,
      alchemyDesk: false,
      dryingJob: null,
      studyBuffDay: 0,
    },
    world: {
      permits: {},
      tollsPaidToday: {},
      trailCairns: [],
      surveyedPct: 0,
      surveyRewardsClaimed: [],
      depletedSpots: {},
      rivals: [],
      nemesis: {},
      lairDays: {},
      escortedDay: 0,
      activeEscort: null,
      tavernSampled: [],
      shrineBlessing: { id: null, untilDay: 0 },
      news: [],
      lastNewsDay: 0,
      miasmaHours: 0,
      lastDeathPos: null,
      marketBoom: null,
    },
    social: {
      caste: 'vagrant',
      unlockedTitles: ['newcomer'],
      activeTitle: 'newcomer',
      factions: { merchantLeague: 0, arcaneOrder: 0, crownLexia: 0 },
      courtWarnedDay: 0,
      memorial: [],
      weddingGiftsClaimed: false,
      courierSent: 0,
      insuranceUntilDay: 0,
      freedSettlers: 0,
      companionMood: {},
    },
    codex: {
      monsters: {},
      recipes: [],
      discoveries: [],
      crimes: 0,
      trapsFound: 0,
      pearlsFound: 0,
      bathsTaken: 0,
    },
  };
}

function mergeMissing(target, defaults) {
  for (const [key, val] of Object.entries(defaults)) {
    if (target[key] === undefined || target[key] === null) {
      target[key] = Array.isArray(val) ? [...val] : val && typeof val === 'object' ? { ...val } : val;
    } else if (val && typeof val === 'object' && !Array.isArray(val) && typeof target[key] === 'object') {
      mergeMissing(target[key], val);
    }
  }
}

export function ensureRealism(game) {
  if (!game.realism || typeof game.realism !== 'object') {
    game.realism = firstRealism();
    return game.realism;
  }
  mergeMissing(game.realism, firstRealism());
  return game.realism;
}
