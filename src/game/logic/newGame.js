import { CATEGORIES, totalAnswers } from '../../data/categories';
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

export const GAME_VERSION = 2; // 2: health in HP (a save of version 1 starts a new game)
export const WORLD_VERSION = 3; // 3: expanded 2560 x 2560 world of 5 kingdoms & 33 villages (migrates v1/v2 maps safely)

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
    emotes: [], // the small bubbles over the heads (see emotes.js)
    barriers: [], // obsidian walls: [{ x, y, until }]
    balls: [], // lightning balls and fireballs flying
    storm: null, // the storm field: { x, y, radius, until }
    cooldowns: {}, // { powerId: the time it is ready again }
    villagers: [], // the people working in the villages (see villages.js)
    animals: [], // the animals of the pens
    caravans: [],
    skirmishes: [],
    bolts: [], // the lightning strikes of the moment (see weather.js)
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
    flashUntil: 0,
    sealToldUntil: 0, // the message of a closed seal is not repeated before this time
    shakeUntil: 0, // the screen shakes until this time (a hard hit)
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

// The level of the player in each category, when the game starts: { gerunds: { good: 4, bad: 1 }, ... }
// From the answers of the app (the level test, the trainings). No answer yet: guessed from the entered score.
function firstMastery(stats, score, customWeights = null) {
  const hasAppStats = totalAnswers(stats) > 0;
  let mastery;
  if (hasAppStats) {
    mastery = JSON.parse(JSON.stringify(stats));
  } else {
    const good = Math.round((score / 495) * 10);
    mastery = {};
    for (const category of CATEGORIES) mastery[category.id] = { good: good, bad: 10 - good };
  }
  if (!hasAppStats && customWeights) {
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
    bottle: 3, // the drinks left in the water bottle
    carrying: null, // a KO person on the back of the hero (see logic/weather.js)
  };
}

// goalId: 'hero' | 'guardian' | 'peaceful' | 'wanderer'. score: the TOEIC reading score (5 to 495).
// stats: the category stats of the app. hero: the name and the avatar. slot: the save slot (1 to 3).
export function newGame(goalId, score, stats, hero, slot, customWeights = null) {
  const cleanedWeights = {};
  if (customWeights) {
    for (const [catId, val] of Object.entries(customWeights)) {
      if (val > 0) cleanedWeights[catId] = Math.max(1, Math.min(100, Math.round(val)));
    }
  }
  const mastery = firstMastery(stats, score, cleanedWeights);
  const game = {
    version: GAME_VERSION,
    slot: slot,
    goal: goalId,
    score: score,
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
    kills: {}, // { slime: 12, ... }
    counts: { kills: 0, answers: 0, correct: 0, harvested: 0, helped: 0 },
    flags: {}, // the scenes already played
    visited: {}, // the zones already seen
    crops: {},
    dug: {}, // the treasures already dug
    gathered: {}, // the trees and rocks already used today (see logic/torch.js)
    world: WORLD_VERSION,
    villages: firstVillages(), // the resources and the level of each village (see logic/villages.js)
    puzzles: firstPuzzles(), // the boulders and the doors of the dungeons (see logic/puzzles.js)
    riddles: {}, // the obelisks solved
    weather: firstWeather(),
    home: firstHome(), // the furniture and the colors of the home (see logic/home.js)
    chests: {},
    bosses: {}, // the bosses already dead
    cleared: {}, // the dungeon guards dead today
    raid: { nextDay: 7, count: 0, perfect: 0, active: false, deaths: 0 },
    explored: emptyExplored(), // the blocks of the world already seen (see explore.js)
    war: firstWar(), // the warbands, the fallen villages, the caravans (see war.js)
    society: firstSociety(), // trade, reputation, horses, feasts, disasters (see society.js)
    camp: firstCamp(), // the camp, the cooking (see camp.js)
    bonds: firstBonds(), // the bonds with the characters (see bonds.js)
    run: makeRun(),
  };
  game.focus.current = chooseFocus(game);
  wakeUp(game);
  exploreAround(game);
  tellIntro(game);
  return game;
}

// A save of an earlier world (256x256): the hero keeps stats, gear and friends, and moves safely onto the expanded map.
function moveToNewWorld(game) {
  if (game.world === WORLD_VERSION) return;
  const fromSmallWorld = typeof game.explored !== 'string' || game.explored.length !== emptyExplored().length || (game.player.x < 350 && game.player.y < 350);
  game.world = WORLD_VERSION;
  if (!fromSmallWorld) return;
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
  if (!game.counts) game.counts = { kills: 0, answers: 0, correct: 0, harvested: 0, helped: 0 };
  if (!game.flags) game.flags = {};
  if (!game.visited) game.visited = {};
  if (!game.crops) game.crops = {};
  if (!game.dug) game.dug = {};
  if (!game.chests) game.chests = {};
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
  if (typeof p.soldierHp !== 'number') p.soldierHp = (p.soldiers || 0) * 45;
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

  ensureVillages(game);
  if (!game.puzzles) game.puzzles = firstPuzzles();
  if (!game.riddles) game.riddles = {};
  if (!game.weather) game.weather = firstWeather();
  if (!game.home) game.home = firstHome();
  if (!game.home.furniture) game.home.furniture = [];
  if (!game.war) game.war = firstWar();
  if (!game.society) game.society = firstSociety();
  if (!game.camp) game.camp = firstCamp();
  if (!game.bonds) game.bonds = firstBonds();
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
  if (!game.society) game.society = firstSociety();
  if (!game.camp) game.camp = firstCamp();
  if (!game.bonds) game.bonds = firstBonds();
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
