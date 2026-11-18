// Canonical saved & backfill state for ISEKAI_TODO features.

export function firstIsekaiTodo() {
  return {
    skillPoints: 0,
    skillNodes: {}, // { nodeId: true }
    achievements: {}, // { achId: { day, claimed } }
    weaponMastery: {
      sword: { xp: 0, lv: 1 },
      bow: { xp: 0, lv: 1 },
      staff: { xp: 0, lv: 1 },
      dagger: { xp: 0, lv: 1 },
      axe: { xp: 0, lv: 1 },
    },
    manaExhaustions: 0,
    incantationsCast: 0,
    spellsUnlocked: {
      timeMagic: false,
      gravityMagic: false,
      silentCast: false,
    },
    spirits: {
      contracted: {}, // { spiritId: { level: 1, xp: 0 } }
      active: null,
    },
    tamed: [], // [{ uid, species, name, level, xp, place: 'party'|'home'|'guild' }]
    activeTamedUid: null,
    flyingMount: {
      unlocked: false,
      kind: 'griffin',
      riding: false,
    },
    intelligent: {
      befriended: {}, // { monsterId: true }
      recruited: [], // ['chiefGrog', ...]
      questsDone: {},
    },
    emissariesDefeated: [],
    tower: {
      maxFloor: 1,
      checkpoint: 1,
      currentFloor: 0, // 0 = outside spire
      secretUnlocked: {}, // { dungeonId: true }
      secretCleared: {},
    },
    ownGuild: {
      founded: false,
      name: '',
      banner: '#ffd23f',
      level: 1,
      xp: 0,
      rooms: 1,
      members: [], // [{ id, name, kind: 'npc'|'monster'|'tamed', power, status: 'idle'|'mission', returnDay, reward }]
    },
    refineByItem: {}, // { ironSword: 4, plateArmor: 2, ... }
    companionArcs: {}, // { aria: { stage: 0, completed: false }, ... }
    letters: {
      delivered: [], // [{ id, day, read, replied }]
      lastCheckDay: 0,
      urgentPending: false,
    },
    episodes: {
      currentEp: 1,
      shownIntro: { 1: true },
      endedEp: {},
    },
    gallery: {
      unlocked: ['arrival'],
      photos: [], // [{ id, day, zone, withNpc, caption, seed }]
    },
    weekly: {
      week: 1,
      challengeId: 'wc_answers',
      progress: 0,
      completed: false,
      rewardClaimed: false,
      bestWeekCount: 0,
      fastestAnswerMs: null,
      longestCleanStreak: 0,
      currentStreak: 0,
    },
  };
}

export function ensureIsekaiTodo(game) {
  const base = firstIsekaiTodo();
  if (!game.isekaiTodo || typeof game.isekaiTodo !== 'object') {
    game.isekaiTodo = base;
    return game.isekaiTodo;
  }
  const st = game.isekaiTodo;
  if (typeof st.skillPoints !== 'number') st.skillPoints = 0;
  if (!st.skillNodes || typeof st.skillNodes !== 'object') st.skillNodes = {};
  if (!st.achievements || typeof st.achievements !== 'object') st.achievements = {};
  if (!st.weaponMastery || typeof st.weaponMastery !== 'object') st.weaponMastery = base.weaponMastery;
  for (const w of ['sword', 'bow', 'staff', 'dagger', 'axe']) {
    if (!st.weaponMastery[w]) st.weaponMastery[w] = { xp: 0, lv: 1 };
  }
  if (typeof st.manaExhaustions !== 'number') st.manaExhaustions = 0;
  if (typeof st.incantationsCast !== 'number') st.incantationsCast = 0;
  if (!st.spellsUnlocked || typeof st.spellsUnlocked !== 'object') st.spellsUnlocked = { ...base.spellsUnlocked };
  if (!st.spirits || typeof st.spirits !== 'object') st.spirits = { ...base.spirits };
  if (!st.spirits.contracted) st.spirits.contracted = {};
  if (!Array.isArray(st.tamed)) st.tamed = [];
  if (!st.flyingMount || typeof st.flyingMount !== 'object') st.flyingMount = { ...base.flyingMount };
  if (!st.intelligent || typeof st.intelligent !== 'object') st.intelligent = { ...base.intelligent };
  if (!st.intelligent.befriended) st.intelligent.befriended = {};
  if (!Array.isArray(st.intelligent.recruited)) st.intelligent.recruited = [];
  if (!st.intelligent.questsDone) st.intelligent.questsDone = {};
  if (!Array.isArray(st.emissariesDefeated)) st.emissariesDefeated = [];
  if (!st.tower || typeof st.tower !== 'object') st.tower = { ...base.tower };
  if (!st.tower.secretUnlocked) st.tower.secretUnlocked = {};
  if (!st.tower.secretCleared) st.tower.secretCleared = {};
  if (!st.ownGuild || typeof st.ownGuild !== 'object') st.ownGuild = { ...base.ownGuild };
  if (!Array.isArray(st.ownGuild.members)) st.ownGuild.members = [];
  if (!st.refineByItem || typeof st.refineByItem !== 'object') st.refineByItem = {};
  if (!st.companionArcs || typeof st.companionArcs !== 'object') st.companionArcs = {};
  if (!st.letters || typeof st.letters !== 'object') st.letters = { ...base.letters };
  if (!Array.isArray(st.letters.delivered)) st.letters.delivered = [];
  if (!st.episodes || typeof st.episodes !== 'object') st.episodes = { ...base.episodes };
  if (!st.episodes.shownIntro) st.episodes.shownIntro = { 1: true };
  if (!st.episodes.endedEp) st.episodes.endedEp = {};
  if (!st.gallery || typeof st.gallery !== 'object') st.gallery = { ...base.gallery };
  if (!Array.isArray(st.gallery.unlocked)) st.gallery.unlocked = ['arrival'];
  if (!Array.isArray(st.gallery.photos)) st.gallery.photos = [];
  if (!st.weekly || typeof st.weekly !== 'object') st.weekly = { ...base.weekly };
  return st;
}
