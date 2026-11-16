import { CATEGORIES, totalAnswers } from '../../data/categories';
import { NPCS, HERO_LOOK } from '../data/npcs';
import { heroLook } from '../data/hero';
import { SPAWN } from '../data/zones';
import { INTRO, GOAL_BLESSING, SCENES, CHAPTERS } from '../data/story';
import { chooseFocus } from './learning';
import { emptySkills } from './skills';
import { firstVillages, placeVillagers, placeAnimals } from './villages';
import { firstPuzzles } from './puzzles';
import { firstWeather } from './weather';
import { firstHome } from './home';
import { refreshWorld } from './worldState';
import { emptyExplored, exploreAround } from './explore';
import { placeDungeonMonsters } from './monsters';
import { placePeople } from './people';
import { say } from './messages';

export const GAME_VERSION = 2; // 2: health in HP (a save of version 1 starts a new game)
export const WORLD_VERSION = 2; // 2: the world of art/MAP.png (a save of the first world is moved into it)

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
function firstMastery(stats, score) {
  if (totalAnswers(stats) > 0) return JSON.parse(JSON.stringify(stats));
  const good = Math.round((score / 495) * 10);
  const mastery = {};
  for (const category of CATEGORIES) mastery[category.id] = { good: good, bad: 10 - good };
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
    mapLevel: 0, // 0 = no map bought
    bag: { healthPotion: 2, carrotSeed: 3, bread: 2 },
    powers: [], // 'obsidian', 'lightning', 'water', 'fire', 'wind', 'earth'
    party: [], // the ids of the friends who fight with the player
    soldiers: 0, // obsidian soldiers
    pet: false, // the obsidian cat
    obsidianBlade: 0, // fights left with the obsidian blade
    stoneSkin: false,
    haste: false, // a speed potion was drunk
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
export function newGame(goalId, score, stats, hero, slot) {
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
    mastery: firstMastery(stats, score),
    skills: emptySkills(), // the tag of each skill: Normal, Hard, Extreme (see logic/skills.js)
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
    run: makeRun(),
  };
  game.focus.current = chooseFocus(game);
  wakeUp(game);
  exploreAround(game);
  tellIntro(game);
  return game;
}

// A save of the first world (before art/MAP.png): the hero keeps everything, but wakes up at home,
// and what was placed on the old map (crops, chests, treasures, the explored map) is forgotten.
function moveToNewWorld(game) {
  if (game.world === WORLD_VERSION) return;
  game.world = WORLD_VERSION;
  game.player.x = SPAWN.x;
  game.player.y = SPAWN.y;
  game.explored = emptyExplored();
  game.crops = {};
  game.cleared = {};
  game.dug = {};
  game.chests = {};
  game.player.party = game.player.party.filter((id) => !['selene'].includes(id));
}

// A save from before the classes, the tags, the torches, the villages...: what is missing is added.
function addMissing(game) {
  if (!game.skills) game.skills = emptySkills();
  if (!game.gathered) game.gathered = {};
  if (game.player.classId === undefined) game.player.classId = null;
  if (game.player.torchHours === undefined) game.player.torchHours = 0;
  if (!game.player.spells) game.player.spells = {};
  if (game.player.hunger === undefined) Object.assign(game.player, { hunger: 80, thirst: 80, bottle: 3, carrying: null });
  if (!game.villages) game.villages = firstVillages();
  if (!game.puzzles) game.puzzles = firstPuzzles();
  if (!game.riddles) game.riddles = {};
  if (!game.weather) game.weather = firstWeather();
  if (!game.home) game.home = firstHome();
  if (typeof game.explored !== 'string' || game.explored.length !== emptyExplored().length) game.explored = emptyExplored();
  for (const npc of NPCS) {
    if (!game.npcs[npc.id]) game.npcs[npc.id] = firstPerson(); // the new people of the world
  }
}

// Fills what is not saved. Used for a new game and for a loaded one.
export function wakeUp(game) {
  if (typeof game.explored !== 'string') game.explored = emptyExplored(); // a save from before the world map
  if (typeof game.player.name !== 'string') game.player.name = 'Hero'; // a save from before the avatars
  if (!game.player.look) game.player.look = { ...HERO_LOOK };
  addMissing(game);
  moveToNewWorld(game);
  game.run = makeRun();
  refreshWorld(game);
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
