import { makeGrid, dot, fillRect, fillBall, addOutline, mirrored, toCanvas, once } from './pixels';
import { OUTLINE } from './palette';

// The animals of the villages: pigs, cows, chickens and horses, seen from the side (looking right).
// frame: 0 or 1, their legs move. dir: 'left' or 'right'.

const PIG = ['#b85a6a', '#e08a98', '#f7b4c0', '#ffd6de'];
const COW = ['#2a2428', '#f2ece4', '#ffffff', '#ffffff'];
const CHICKEN = ['#c8b8a0', '#f6f2ea', '#ffffff', '#ffffff'];
const HORSE = ['#4a2a16', '#7a4a26', '#9a6236', '#b87a48'];

function legs(grid, xs, top, length, color, frame) {
  xs.forEach((x, i) => fillRect(grid, x + ((i + frame) % 2 ? 1 : 0), top, 2, length, color));
}

function pig(frame) {
  const grid = makeGrid(20, 14);
  legs(grid, [4, 7, 12, 15], 9, 4, PIG[0], frame);
  fillBall(grid, 10, 7, 8, 4.5, PIG);
  fillBall(grid, 16.5, 6, 3.5, 3.5, PIG);
  fillRect(grid, 19, 6, 1, 2, '#c86a7a'); // the nose
  dot(grid, 17, 5, '#1c1726');
  dot(grid, 15, 3, PIG[0]); // the ear
  dot(grid, 2, 5, PIG[1]); // the curly tail
  dot(grid, 1, 4, PIG[1]);
  return grid;
}

function cow(frame) {
  const grid = makeGrid(26, 20);
  legs(grid, [4, 7, 17, 20], 13, 6, '#2a2428', frame);
  fillBall(grid, 12, 9, 10, 5.5, COW, { ambient: 0.4 });
  fillBall(grid, 8, 8, 3, 2.5, ['#1c1418', '#2a2428', '#3a3438']); // the spots
  fillBall(grid, 15, 11, 2.5, 2, ['#1c1418', '#2a2428', '#3a3438']);
  fillBall(grid, 22, 7, 3.5, 3.5, COW, { ambient: 0.4 });
  fillRect(grid, 23, 8, 3, 3, '#f2b8b8'); // the muzzle
  dot(grid, 22, 6, '#1c1726');
  fillRect(grid, 20, 2, 1, 2, '#e8dcc0'); // the horns
  fillRect(grid, 24, 2, 1, 2, '#e8dcc0');
  dot(grid, 2, 8, '#2a2428'); // the tail
  dot(grid, 1, 9, '#2a2428');
  return grid;
}

function chicken(frame) {
  const grid = makeGrid(12, 12);
  legs(grid, [5, 7], 9, 3, '#e8a030', frame);
  fillBall(grid, 5.5, 6.5, 4.5, 3.5, CHICKEN, { ambient: 0.5 });
  fillBall(grid, 8.5, 3.5, 2.5, 2.5, CHICKEN, { ambient: 0.5 });
  fillRect(grid, 8, 0, 2, 1, '#e8423f'); // the comb
  fillRect(grid, 11, 3, 1, 1, '#e8a030'); // the beak
  dot(grid, 9, 3, '#1c1726');
  dot(grid, 1, 4, '#d8ccb8');
  return grid;
}

function horse(frame) {
  const grid = makeGrid(30, 26);
  legs(grid, [5, 8, 20, 23], 17, 8, HORSE[0], frame);
  fillBall(grid, 14, 13, 11, 5.5, HORSE);
  fillRect(grid, 22, 4, 4, 10, HORSE[2]); // the neck
  fillBall(grid, 26, 5, 3.5, 2.5, HORSE);
  fillRect(grid, 21, 2, 2, 9, '#2a1a10'); // the mane
  dot(grid, 26, 4, '#1c1726');
  fillRect(grid, 1, 11, 2, 9, '#2a1a10'); // the tail
  return grid;
}

const PAINTERS = { pig: pig, cow: cow, chicken: chicken, horse: horse };

export function animalSprite(kind, dir, frame) {
  return once('animal' + kind + dir + frame, () => {
    const grid = PAINTERS[kind](frame);
    const outlined = addOutline(dir === 'left' ? mirrored(grid) : grid, OUTLINE);
    return { canvas: toCanvas(outlined), ax: Math.floor(outlined.width / 2), ay: outlined.height - 1 };
  });
}
