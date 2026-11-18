// Persistent and run state for SOUL.txt narrative systems (game.soul).

export const ARC_NPCS = ['aria', 'mira', 'yuki', 'garrick', 'nyx', 'lea', 'hugo'];

export function firstSoul() {
  const arcs = {};
  for (const id of ARC_NPCS) arcs[id] = { step: 0, completed: false, choiceNotes: [] };
  return {
    scenesPlayed: {},
    orin: {
      mournedDay: null,
      graveRead: false,
      elderSuccessor: null,
      houseEmptyUntil: 0,
      successorAnnounced: false,
    },
    tomo: {
      state: 'normal', // 'normal' | 'silent' | 'studying' | 'proud' | 'bitter'
      daysSilent: 0,
      lessonsGiven: 0,
      prompted: false,
      lastTalkDay: -1,
    },
    raidMemory: {
      memorialNames: [],
      widowsMourningUntil: 0,
      lastPreRaidWarnDay: -1,
      lastAftermathDay: -1,
      rebuiltHousesTalked: 0,
    },
    ariaRescuesShown: 0,
    arcs,
    bondScenes: {},
    playstyle: {
      fastAnswers: 0,
      slowAnswers: 0,
      recentFastStreak: 0,
      lastEldermoorDay: 1,
      wasAwayDays: 0,
    },
    dilemmas: {
      raidVsCaravan: null,
      spareGeneral: null,
      hideNyx: null,
      leaBlow: null,
      delayedConvoyHelped: false,
    },
    sideStories: {
      letterTwistSeen: false,
      underBed: { stage: 0, done: false },
      wordThieves: { stage: 0, choice: null, done: false },
      lostDog: { active: false, found: false, done: false },
      bakersChild: { active: false, helped: false, done: false },
    },
    pet: {
      met: false,
      adopted: false,
      kind: 'dog',
      name: 'Mochi',
      fedDay: -1,
      pettedDay: -1,
    },
    silence: {
      conqueredWarned: {},
      freedCelebrated: {},
    },
    moments: {
      campfireDay: -1,
      weddingDay: -1,
      dreamIdx: 0,
      farewelled: {},
      endingSummary: null,
    },
  };
}

export function ensureSoul(game) {
  if (!game) return firstSoul();
  if (!game.soul || typeof game.soul !== 'object') {
    game.soul = firstSoul();
    return game.soul;
  }
  const def = firstSoul();
  if (!game.soul.scenesPlayed) game.soul.scenesPlayed = {};
  game.soul.orin = { ...def.orin, ...(game.soul.orin || {}) };
  game.soul.tomo = { ...def.tomo, ...(game.soul.tomo || {}) };
  game.soul.raidMemory = { ...def.raidMemory, ...(game.soul.raidMemory || {}) };
  if (!Array.isArray(game.soul.raidMemory.memorialNames)) game.soul.raidMemory.memorialNames = [];
  if (typeof game.soul.ariaRescuesShown !== 'number') game.soul.ariaRescuesShown = 0;
  game.soul.arcs = { ...def.arcs, ...(game.soul.arcs || {}) };
  for (const id of ARC_NPCS) {
    game.soul.arcs[id] = { step: 0, completed: false, choiceNotes: [], ...(game.soul.arcs[id] || {}) };
  }
  if (!game.soul.bondScenes) game.soul.bondScenes = {};
  game.soul.playstyle = { ...def.playstyle, ...(game.soul.playstyle || {}) };
  game.soul.dilemmas = { ...def.dilemmas, ...(game.soul.dilemmas || {}) };
  game.soul.sideStories = {
    ...def.sideStories,
    ...(game.soul.sideStories || {}),
    underBed: { ...def.sideStories.underBed, ...(game.soul.sideStories?.underBed || {}) },
    wordThieves: { ...def.sideStories.wordThieves, ...(game.soul.sideStories?.wordThieves || {}) },
    lostDog: { ...def.sideStories.lostDog, ...(game.soul.sideStories?.lostDog || {}) },
    bakersChild: { ...def.sideStories.bakersChild, ...(game.soul.sideStories?.bakersChild || {}) },
  };
  game.soul.pet = { ...def.pet, ...(game.soul.pet || {}) };
  game.soul.silence = {
    conqueredWarned: { ...(game.soul.silence?.conqueredWarned || {}) },
    freedCelebrated: { ...(game.soul.silence?.freedCelebrated || {}) },
  };
  game.soul.moments = { ...def.moments, ...(game.soul.moments || {}) };
  return game.soul;
}
