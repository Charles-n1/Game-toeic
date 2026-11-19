// What the tests share: a game ready to play, a clock the tests move, and frames of the game.
import { QUESTIONS } from '../src/data/questions.js';
import { villageOf } from '../src/game/data/zones.js';
import { newGame } from '../src/game/logic/newGame.js';
import { updateGame } from '../src/game/logic/update.js';
import { makeInput } from '../src/game/logic/input.js';

const HERO = { name: 'Test', body: 0, style: 0, hair: 0, outfit: 0 };
const FRAME = 0.05; // seconds: one frame of the tests (20 frames per second)

// The clock of the tests: Date.now() only moves when a frame is played (the tests run much faster than real time).
let clock = Date.UTC(2026, 0, 1);
Date.now = () => clock;

// A new game, the hero in the middle of Eldermoor at 9 in the morning. No monster can start a fight.
export function testGame() {
  const game = newGame('hero', 650, {}, HERO, 1);
  game.run.questions = QUESTIONS;
  game.run.goalRate = 80;
  game.run.onAnswer = () => {};
  game.run.safeUntil = Infinity;
  const eldermoor = villageOf('lexia');
  game.player.x = eldermoor.x + eldermoor.w / 2;
  game.player.y = eldermoor.y + eldermoor.h / 2;
  game.hour = 9;
  return game;
}

// Plays `count` frames on the map. each(frame): called after every frame (to look at the world).
export function playFrames(game, count, each = () => {}) {
  const input = makeInput();
  for (let frame = 0; frame < count; frame++) {
    clock += FRAME * 1000;
    game.run.screen = 'play';
    game.run.fight = null;
    game.run.dialog = null;
    updateGame(game, input, FRAME);
    each(frame);
  }
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
