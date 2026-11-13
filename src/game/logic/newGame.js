import { CATEGORIES, totalAnswers } from '../../data/categories';
import { NPCS } from '../data/npcs';
import { SPAWN } from '../data/zones';
import { INTRO, GOAL_BLESSING, SCENES, CHAPTERS } from '../data/story';
import { chooseFocus } from './learning';
import { placeDungeonMonsters } from './monsters';
import { placePeople } from './people';
import { say } from './messages';

export const GAME_VERSION = 2; // 2: health in HP (a save of version 1 starts a new game)

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
    barriers: [], // obsidian walls: [{ x, y, until }]
    balls: [], // lightning balls and fireballs flying
    storm: null, // the storm field: { x, y, radius, until }
    cooldowns: {}, // { powerId: the time it is ready again }
    spawnTime: 0,
    manaTime: 0,
    storyTime: 0,
    saveTime: 0,
    safeUntil: 0, // no fight can start before this time
    dashUntil: 0,
    flashUntil: 0,
    shakeUntil: 0, // the screen shakes until this time (a hard hit)
    walking: false, // the hero is walking right now
    zoneId: null, // the zone the player is in (to announce a new one)
    questions: [], // the questions of the app (given by GamePage)
    goalRate: 70, // the success rate the player aims for (given by GamePage)
    onAnswer: () => {}, // tells the app about each answer (given by GamePage)
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

function firstPeople() {
  const people = {};
  for (const npc of NPCS) {
    people[npc.id] = { alive: true, friendship: 0, talkedDay: 0, datedDay: 0, told: 0 };
  }
  return people;
}

function firstPlayer() {
  return {
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
    bag: { healthPotion: 2, carrotSeed: 3 },
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
  };
}

// goalId: 'hero' | 'guardian' | 'peaceful' | 'wanderer'. score: the TOEIC reading score (5 to 495).
// stats: the category stats of the app.
export function newGame(goalId, score, stats) {
  const game = {
    version: GAME_VERSION,
    goal: goalId,
    score: score,
    chapter: 0, // position in the chapters of the goal
    ended: false,
    day: 1,
    hour: 9,
    player: firstPlayer(),
    mastery: firstMastery(stats, score),
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
    chests: {},
    bosses: {}, // the bosses already dead
    cleared: {}, // the dungeon guards dead today
    raid: { nextDay: 7, count: 0, perfect: 0, active: false, deaths: 0 },
    run: makeRun(),
  };
  game.focus.current = chooseFocus(game);
  wakeUp(game);
  tellIntro(game);
  return game;
}

// Fills what is not saved. Used for a new game and for a loaded one.
export function wakeUp(game) {
  game.run = makeRun();
  placePeople(game);
  placeDungeonMonsters(game);
}

function tellIntro(game) {
  const intro = INTRO.map((line) => line.replace('{score}', game.score));
  const first = CHAPTERS[game.goal][0];
  game.flags.wakeUp = true;
  say(game, null, [...intro, GOAL_BLESSING[game.goal]]);
  say(game, 'aria', SCENES.wakeUp.lines);
  say(game, null, ['Chapter 1: ' + first.title + '\n' + first.text]);
}
