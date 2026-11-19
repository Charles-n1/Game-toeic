import { CATEGORIES, totalAnswers, defaultCategoryStats } from '../../data/categories';
import { NPCS, HERO_LOOK } from '../data/npcs';
import { heroLook } from '../data/hero';
import { SPAWN, zoneAt } from '../data/zones';
import { ITEMS } from '../data/items';
import { TYPES } from '../data/types';
import { isSolid } from '../world/map';
import { INTRO, GOAL_BLESSING, SCENES, CHAPTERS } from '../data/story';
import { chooseFocus } from './learning';
import { emptySkills } from './skills';
import { firstVillages, ensureVillages } from './villages';
import { placeVillagers } from './villagers';
import { placeAnimals } from './animals';
import { firstPuzzles } from './puzzles';
import { firstWeather } from './weather';
import { firstHome } from './home';
import { refreshWorld } from './worldState';
import { emptyExplored, exploreAround } from './explore';
import { placeDungeonMonsters } from './monsters';
import { placePeople } from './people';
import { say } from './messages';
import { firstWar } from './war';
import { firstSociety } from './society';
import { firstCamp } from './camp';
import { firstBonds } from './bonds';
import { firstStatLinks, ensureStatLinks } from './statLinks';
import { firstIsekai } from './isekai/common';
import { firstEconomy } from './economy';
import { firstGuild, ensureGuild } from './guild/ranks';
import { firstKingdoms, ensureKingdoms } from './kingdomLaws';
import { firstDurability, ensureDurability } from './durability';
import { firstLanguages, ensureLanguages } from './languages';
import { firstRealism, ensureRealism } from './realism/state';
import { firstIsekaiTodo, ensureIsekaiTodo } from './isekaiTodo/state';
import { firstSoul, ensureSoul, checkWelcomeBack } from './soul';

export const GAME_VERSION = 2; // 2: health in HP (a save of version 1 starts a new game)
export const WORLD_VERSION = 4; // 4: the world of the painting art/MAP2.png (a save of an older world moves to it)

// Everything that is NOT saved: what is on screen right now. It is rebuilt each time the game opens.
export function makeRun() {
  return {
    screen: 'play', // 'play' | 'dialog' | 'fight' | 'shop' | 'menu' | 'over'
    menuTab: null, // the window open in the menu: 'stats' | 'inventory' | 'powers' | 'quests' | 'map' (null = the list)
    dialog: null,
    waitingDialogs: [],
    toasts: [],
    fight: null,
    shop: null,
    monsters: [],
    people: {}, // where each person is: { aria: { x, y, ... } }
    followers: [],
    particles: [],
    blood: [], // persistent crimson puddles on kills (see particles.js)
    vfxRings: [],
    spikes: [],
    parties: [], // roaming NPC adventurer groups (see worldParties.js)
    campProps: [], // dynamic camp props placed by roaming groups
    emotes: [], // the small bubbles over the heads (see emotes.js)
    barriers: [], // obsidian walls: [{ x, y, until }]
    balls: [], // lightning balls and fireballs flying
    storm: null, // the storm field: { x, y, radius, until }
    cooldowns: {}, // { powerId: the time it is ready again }
    villagers: [], // the people working in the villages (see villages.js)
    gatherers: [], // paid local resource gatherers carrying bundles back to town
    animals: [], // the animals of the pens
    wildAnimals: [], // rabbits, foxes, deer herds, sheep flocks, horses roaming free (see animals.js)
    herds: {}, // active wildlife herd anchors keyed by herdId
    tracks: [], // temporary footprints & hoof tracks in sand, snow or mud
    caravans: [],
    skirmishes: [],
    bolts: [], // the lightning strikes of the moment (see weather.js)
    fallenStars: [], // the stars fallen on the Night of Falling Stars (see isekai/events.js)
    starTime: 10,
    strikeTime: 8,
    encounter: null, // someone met on the road (see encounters.js)
    encounterTime: 30,
    visible: {}, // the people on the map right now: { aria: true }
    lastLink: null, // the stairs the hero just used (they must step off before using them again)
    pushUntil: 0, // a boulder is rolling: no other push before this time
    fadeUntil: 0, // the screen goes black for a moment when the hero takes stairs
    spawnTime: 0,
    manaTime: 0,
    storyTime: 0,
    saveTime: 0,
    safeUntil: 0, // no fight can start before this time
    dashUntil: 0,
    levelUpQueue: [], // queued animated level-up modals after fight/xp gain
    episodeModal: null, // anime episode opening / ending preview modal
    timeStopUntil: 0, // Time Magic: freezes wild monsters
    levitateUntil: 0, // Gravity Magic: cross water/lava safely
    flashUntil: 0,
    slashUntil: 0,
    slashDir: 'down',
    sealToldUntil: 0, // the message of a closed seal is not repeated before this time
    shakeUntil: 0, // the screen shakes until this time (a hard hit)
    introAnimUntil: 0, // opening summoning lightbeam animation
    chest: null, // open Minecraft-style chest view state
    walking: false, // the hero is walking right now
    zoneId: null, // the zone the player is in (to announce a new one)
    questions: [], // the questions of the app (given by GamePage)
    goalRate: 70, // the success rate the player aims for (given by GamePage)
    onAnswer: () => {}, // tells the app about each answer (given by GamePage)
    relaxed: false, // the relaxed mode of the options: +50% time to answer (given by GamePage)
    textSpeed: 'normal', // how fast the dialogs write (given by GamePage)
    cues: [], // the sounds the rules ask for, played by the screen (see cues.js)
  };
}

// The level of the player in each category when the game starts: { gerunds: { good: 4, bad: 6 }, ... }
// `score` is the TARGET TOEIC score: when starting without app stats or explicit %, start modestly below it so
// the hero grows by fighting & training. `currentPcts` overrides categories with the player's inserted current %.
function firstMastery(stats, customWeights = null, currentPcts = null) {
  const hasAppStats = stats && totalAnswers(stats) > 0;
  let mastery;
  if (hasAppStats) {
    mastery = JSON.parse(JSON.stringify(stats));
    for (const category of CATEGORIES) {
      if (!mastery[category.id]) mastery[category.id] = { good: 0, bad: 0 };
    }
  } else {
    mastery = defaultCategoryStats();
  }
  if (currentPcts && typeof currentPcts === 'object') {
    for (const [catId, pct] of Object.entries(currentPcts)) {
      if (pct !== undefined && pct !== null && mastery[catId]) {
        const clamped = Math.max(0, Math.min(99, Math.round(Number(pct) || 0)));
        const denom = clamped % 5 === 0 ? 20 : 100;
        const g = Math.round((clamped * denom) / 100);
        mastery[catId] = { good: g, bad: denom - g };
      }
    }
  } else if (!hasAppStats && customWeights) {
    for (const [catId, pct] of Object.entries(customWeights)) {
      if (pct > 0 && mastery[catId]) {
        const clamped = Math.max(0, Math.min(100, pct));
        const g = Math.round(clamped / 5);
        mastery[catId] = { good: g, bad: 20 - g };
      }
    }
  }
  return mastery;
}

function firstPerson() {
  return { alive: true, friendship: 0, talkedDay: 0, datedDay: 0, told: 0 };
}

function firstPeople() {
  const people = {};
  for (const npc of NPCS) people[npc.id] = firstPerson();
  return people;
}

// hero: the choices of the player at the start { name, body, style, hair, outfit } (see data/hero.js).
function firstPlayer(hero) {
  return {
    name: hero.name,
    look: heroLook(hero),
    x: SPAWN.x,
    y: SPAWN.y,
    dir: 'down',
    step: 0, // for the walking animation
    level: 1,
    xp: 0,
    health: 100, // HP
    mana: 5,
    lexis: 20,
    weapon: 'woodSword',
    armor: 'clothes',
    boots: 'sandals',
    accessory: null,
    mapLevel: 0, // 0 = no map bought
    bag: { healthPotion: 2, carrotSeed: 3, bread: 2 },
    powers: [], // 'obsidian', 'lightning', 'water', 'fire', 'wind', 'earth'
    obsidianUnlocked: ['obsidianBarrier'], // only Barrier by default; Soldier, Cat, Blade require training
    obsidianXp: 0,
    party: [], // the ids of the friends who fight with the player
    soldiers: 0, // obsidian soldiers
    soldierHp: 0, // shared shield/health pool of active obsidian soldiers (45 HP each)
    pet: false, // the obsidian cat
    soldierTime: 0, // seconds before the obsidian soldiers crumble
    petTime: 0, // seconds before the obsidian cat melts away
    obsidianControl: 0, // trained at the dummies: the soldiers and the cat stay 20 s longer per level
    obsidianBlade: 0, // fights left with the obsidian blade
    stoneSkin: false,
    haste: false, // a speed potion was drunk
    cold: { active: false, exposure: 0 },
    blessings: 3, // how many times Aria can still save the player
    spouse: null,
    children: [],
    classId: null, // the class of the hero (see data/classes.js)
    torchHours: 0, // the hours of light left (see logic/torch.js)
    spells: {}, // the skills learned from the researchers: { gerunds: 1 } (see logic/skills.js). None at the start.
    hunger: 80, // 100 = full (see logic/survival.js)
    thirst: 80,
    fatigue: 0,
    bottle: 3, // the drinks left in the water bottle
    bottleLevel: 1, // bottle tier (see logic/survival.js)
    bottleUntreated: false,
    carrying: null, // a KO person on the back of the hero (see logic/weather.js)
  };
}

// goalId: 'hero' | 'guardian' | 'peaceful' | 'wanderer'. score: the target TOEIC reading score (5 to 495).
// stats: the category stats of the app. hero: the name and the avatar. slot: the save slot (1 to 3).
export function newGame(goalId, score = 450, stats = {}, hero, slot, customWeights = null, currentPcts = null) {
  const effectiveScore = Number.isFinite(score) && score >= 5 ? score : 450;
  const cleanedWeights = {};
  if (customWeights) {
    for (const [catId, val] of Object.entries(customWeights)) {
      if (val > 0) cleanedWeights[catId] = Math.max(1, Math.min(100, Math.round(val)));
    }
  }
  const mastery = firstMastery(stats, cleanedWeights, currentPcts);
  const goalRate = Math.max(55, Math.min(96, Math.round((effectiveScore / 495) * 100)));
  const game = {
    version: GAME_VERSION,
    slot: slot,
    goal: goalId,
    score: effectiveScore,
    targetScore: effectiveScore,
    goalRate: goalRate,
    chapter: 0, // position in the chapters of the goal
    ended: false,
    day: 1,
    hour: 9,
    player: firstPlayer(hero),
    mastery: mastery,
    skills: emptySkills(), // the tag of each skill: Normal, Hard, Extreme (see logic/skills.js)
    statLinks: firstStatLinks(mastery),
    toeicWeights: cleanedWeights,
    focus: { current: null, tally: { good: 0, bad: 0 }, mastered: {} },
    npcs: firstPeople(),
    families: [
      { parents: ['finn', 'lila'], children: [], nextBabyDay: 4 },
      { parents: ['garrick', 'rosa'], children: ['Mina'], nextBabyDay: 9999 },
    ],
    happiness: 50,
    deal: { day: 0, factor: 1 }, // the result of the last negotiation
    quests: {},
    urgentQuests: [],
    beacons: [],
    kills: {}, // { slime: 12, ... }
    counts: { kills: 0, answers: 0, correct: 0, harvested: 0, helped: 0, wallsRepaired: 0 },
    flags: {}, // the scenes already played
    visited: {}, // the zones already seen
    crops: {},
    dug: {}, // the treasures already dug
    gathered: {}, // the trees and rocks already used today (see logic/torch.js)
    harvested: {}, // the fruit trees, berry bushes, hives & harvests gathered today (see logic/harvest.js)
    world: WORLD_VERSION,
    villages: firstVillages(), // the resources and the level of each village (see logic/villages.js)
    puzzles: firstPuzzles(), // the boulders and the doors of the dungeons (see logic/puzzles.js)
    riddles: {}, // the obelisks solved
    weather: firstWeather(),
    home: firstHome(), // the furniture and the colors of the home (see logic/home.js)
    chests: {},
    chestLoots: {},
    bosses: {}, // the bosses already dead
    cleared: {}, // the dungeon guards dead today
    raid: { nextDay: 7, count: 0, perfect: 0, active: false, deaths: 0 },
    explored: emptyExplored(), // the blocks of the world already seen (see explore.js)
    war: firstWar(), // the warbands, the fallen villages, the caravans (see war.js)
    society: firstSociety(), // trade, reputation, horses, feasts, disasters (see society.js)
    camp: firstCamp(), // the camp, the cooking (see camp.js)
    isekai: firstIsekai(), // curses, the Lost Hero, the classmates, the arenas, the events (see isekai/)
    bonds: firstBonds(), // the bonds with the characters (see bonds.js)
    economy: firstEconomy(), // town treasuries, workshop stocks, road haulers, maritime ships & patrols
    guild: firstGuild(),
    kingdoms: firstKingdoms(),
    durability: firstDurability(),
    languages: firstLanguages(),
    realism: firstRealism(), // bank, currencies, health, spoilage, factions... (see realism/state.js)
    isekaiTodo: firstIsekaiTodo(), // skill tree, achievements, spirits, refine, tower, album...
    soul: firstSoul(), // narrative memory, character arcs, dilemmas, memorials, epilogue...
    run: makeRun(),
  };
  game.focus.current = chooseFocus(game);
  wakeUp(game);
  exploreAround(game);
  tellIntro(game);
  game.run.introAnimUntil = Date.now() + 2600;
  return game;
}

// A save of an earlier world: the hero keeps stats, gear and friends, and wakes up at home in the new world.
// Everything that was tied to the old map starts again (what was explored, the fields, the villages, the wars).
function moveToNewWorld(game) {
  if (game.world === WORLD_VERSION) return;
  game.world = WORLD_VERSION;
  game.villages = firstVillages();
  game.war = { ...firstWar(), disarmedTraps: {}, clearedLairs: {} };
  game.camp.active = null;
  game.player.x = SPAWN.x;
  game.player.y = SPAWN.y;
  game.explored = emptyExplored();
  game.crops = {};
  game.cleared = {};
  game.dug = {};
  game.chests = {};
  game.puzzles = firstPuzzles();
  game.player.party = (game.player.party || []).filter((id) => !['selene'].includes(id));
}

// A save from before the classes, the tags, the torches, the villages, the 10 classes...: what is missing is added.
function addMissing(game) {
  if (!game.mastery || typeof game.mastery !== 'object') game.mastery = {};
  for (const cat of CATEGORIES) {
    if (!game.mastery[cat.id]) game.mastery[cat.id] = { good: 0, bad: 0 };
  }
  if (!game.skills || typeof game.skills !== 'object') game.skills = emptySkills();
  for (const cat of CATEGORIES) {
    if (!game.skills[cat.id]) game.skills[cat.id] = { tag: 'normal', normal: [], hard: [], extreme: [] };
  }
  if (!game.focus || typeof game.focus !== 'object') game.focus = { current: null, tally: { good: 0, bad: 0 }, mastered: {} };
  if (!game.focus.tally) game.focus.tally = { good: 0, bad: 0 };
  if (!game.focus.mastered) game.focus.mastered = {};
  if (!TYPES.some((t) => t.id === game.focus.current)) game.focus.current = chooseFocus(game);
  if (!game.toeicWeights) game.toeicWeights = {};
  ensureStatLinks(game);
  if (!game.gathered) game.gathered = {};
  if (!game.quests) game.quests = {};
  if (!game.kills) game.kills = {};
  if (!game.counts) game.counts = { kills: 0, answers: 0, correct: 0, harvested: 0, helped: 0, wallsRepaired: 0 };
  if (typeof game.counts.wallsRepaired !== 'number') game.counts.wallsRepaired = 0;
  if (!game.flags) game.flags = {};
  if (!game.visited) game.visited = {};
  if (!game.crops) game.crops = {};
  if (!game.dug) game.dug = {};
  if (!game.chests) game.chests = {};
  if (!game.chestLoots) game.chestLoots = {};
  if (!game.bosses) game.bosses = {};
  if (!game.cleared) game.cleared = {};
  if (!game.deal) game.deal = { day: 0, factor: 1 };
  if (!game.raid) game.raid = { nextDay: 7, count: 0, perfect: 0, active: false, deaths: 0 };
  if (!Array.isArray(game.families)) game.families = [];

  const p = game.player;
  if (!ITEMS[p.weapon]) p.weapon = 'woodSword';
  if (!ITEMS[p.armor]) p.armor = 'clothes';
  if (!ITEMS[p.boots]) p.boots = 'sandals';
  if (p.accessory === undefined || (p.accessory && !ITEMS[p.accessory])) p.accessory = null;
  if (p.classId === undefined) p.classId = null;
  if (p.torchHours === undefined) p.torchHours = 0;
  if (!Array.isArray(p.obsidianUnlocked)) p.obsidianUnlocked = ['obsidianBarrier'];
  if (typeof p.obsidianXp !== 'number') p.obsidianXp = 0;
  if (typeof p.health === 'number') p.health = Math.round(p.health);
  if (typeof p.mana === 'number') p.mana = Math.round(p.mana);
  if (typeof p.soldierHp !== 'number') p.soldierHp = (p.soldiers || 0) * 45;
  else p.soldierHp = Math.round(p.soldierHp);
  if (typeof p.obsidianControl !== 'number') p.obsidianControl = 0;
  if (typeof p.soldierTime !== 'number') p.soldierTime = 20;
  if (typeof p.petTime !== 'number') p.petTime = 20;
  if (!p.cold) p.cold = { active: false, exposure: 0 };
  if (!p.spells) p.spells = {};
  if (!Array.isArray(p.powers)) p.powers = [];
  if (!Array.isArray(p.children)) p.children = [];
  if (!p.bag || typeof p.bag !== 'object') p.bag = {};
  for (const id of Object.keys(p.bag)) {
    if (!ITEMS[id]) delete p.bag[id];
  }
  const npcIds = new Set(NPCS.map((n) => n.id));
  p.party = Array.isArray(p.party) ? p.party.filter((id) => npcIds.has(id)) : [];
  if (p.hunger === undefined) Object.assign(p, { hunger: 80, thirst: 80, bottle: 3, carrying: null });
  if (typeof p.bottleLevel !== 'number' || p.bottleLevel < 1) p.bottleLevel = 1;
  if (typeof p.fatigue !== 'number') p.fatigue = 0;
  if (typeof p.bottleUntreated !== 'boolean') p.bottleUntreated = false;
  ensureDurability(game);
  ensureGuild(game);
  ensureKingdoms(game);
  ensureLanguages(game);
  ensureRealism(game); // an older save gets the realism state
  ensureIsekaiTodo(game); // an older save gets isekaiTodo systems
  ensureSoul(game); // an older save gets the SOUL narrative & memory state

  ensureVillages(game);
  if (!game.puzzles) game.puzzles = firstPuzzles();
  if (!game.riddles) game.riddles = {};
  if (!game.weather) game.weather = firstWeather();
  if (!game.home) game.home = firstHome();
  if (!game.home.furniture) game.home.furniture = [];
  if (!game.war) game.war = firstWar();
  if (!game.war.disarmedTraps) game.war.disarmedTraps = {};
  if (!game.war.clearedLairs) game.war.clearedLairs = {};
  if (!game.society) game.society = firstSociety();
  if (!game.society.shrinesUsed) game.society.shrinesUsed = {};
  if (!game.society.luredCrates) game.society.luredCrates = {};
  if (!game.camp) game.camp = firstCamp();
  if (!game.bonds) game.bonds = firstBonds();
  if (!game.isekai) game.isekai = firstIsekai();
  if (!Array.isArray(game.urgentQuests)) game.urgentQuests = [];
  if (!Array.isArray(game.beacons)) game.beacons = [];
  if (!game.targetScore) game.targetScore = game.score || 400;
  if (!game.goalRate) game.goalRate = Math.max(55, Math.min(96, Math.round((game.targetScore / 495) * 100)));
  if (typeof game.explored !== 'string' || game.explored.length !== emptyExplored().length) game.explored = emptyExplored();
  if (!game.npcs || typeof game.npcs !== 'object') game.npcs = {};
  for (const npc of NPCS) {
    if (!game.npcs[npc.id]) game.npcs[npc.id] = firstPerson(); // the new people of the world
    else {
      const s = game.npcs[npc.id];
      if (s.alive === undefined) s.alive = true;
      if (typeof s.friendship !== 'number') s.friendship = 0;
      if (typeof s.told !== 'number') s.told = 0;
      if (typeof s.talkedDay !== 'number') s.talkedDay = 0;
      if (typeof s.datedDay !== 'number') s.datedDay = 0;
    }
  }
}

// Fills what is not saved. Used for a new game and for a loaded one.
export function wakeUp(game) {
  if (!game.war) game.war = firstWar();
  if (!game.war.disarmedTraps) game.war.disarmedTraps = {};
  if (!game.war.clearedLairs) game.war.clearedLairs = {};
  if (!game.society) game.society = firstSociety();
  if (!game.society.shrinesUsed) game.society.shrinesUsed = {};
  if (!game.society.luredCrates) game.society.luredCrates = {};
  if (!game.camp) game.camp = firstCamp();
  if (!game.bonds) game.bonds = firstBonds();
  if (!game.targetScore) game.targetScore = game.score || 400;
  if (!game.goalRate) game.goalRate = Math.max(55, Math.min(96, Math.round((game.targetScore / 495) * 100)));
  if (typeof game.explored !== 'string') game.explored = emptyExplored(); // a save from before the world map
  if (typeof game.player.name !== 'string') game.player.name = 'Hero'; // a save from before the avatars
  if (!game.player.look) game.player.look = { ...HERO_LOOK };
  addMissing(game);
  moveToNewWorld(game);
  game.run = makeRun();
  refreshWorld(game);
  if (!Number.isFinite(game.player.x) || !Number.isFinite(game.player.y) || isSolid(game.player.x, game.player.y) || zoneAt(game.player.x, game.player.y).id === 'visitHouse') {
    game.player.x = SPAWN.x;
    game.player.y = SPAWN.y;
  }
  placePeople(game);
  placeVillagers(game);
  placeAnimals(game);
  placeDungeonMonsters(game);
  if (game.flags?.wakeUp) checkWelcomeBack(game);
}

function tellIntro(game) {
  const intro = INTRO.map((line) => line.replace('{score}', game.score));
  const wakeUpLines = SCENES.wakeUp.lines.map((line) => line.replace('{name}', game.player.name));
  const first = CHAPTERS[game.goal][0];
  game.flags.wakeUp = true;
  say(game, null, [...intro, GOAL_BLESSING[game.goal]]);
  say(game, 'aria', wakeUpLines);
  say(game, null, ['Chapter 1: ' + first.title + '\n' + first.text]);
}
