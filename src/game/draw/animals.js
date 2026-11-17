import { makeGrid, dot, fillRect, fillBall, drawLine, addOutline, mirrored, toCanvas, once } from './pixels';
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

const WHITE_RABBIT = ['#d0cad4', '#eef0f6', '#ffffff', '#ffffff'];
const BROWN_RABBIT = ['#6b4228', '#9a6540', '#c48c62', '#e2b58e'];
const FOX_PAL = ['#8f3314', '#c94c1a', '#eb6f28', '#ff9e4a'];
const DEER_PAL = ['#6e4020', '#965c30', '#ba7b48', '#d9a472'];
const SHEEP_WOOL = ['#cfc8bc', '#e8e2d8', '#faf8f2', '#ffffff'];

function paintRabbit(ramp, frame) {
  const grid = makeGrid(14, 14);
  const hop = frame ? 1 : 0;
  fillBall(grid, 6, 9 - hop, 3.8, 2.8, ramp, { ambient: 0.45 }); // plump body
  fillBall(grid, 9.5, 7 - hop, 2.4, 2.2, ramp, { ambient: 0.5 }); // head
  fillRect(grid, 7 + hop, 2 - hop, 1, 4, ramp[2]); // tall ears
  fillRect(grid, 9 + hop, 2 - hop, 1, 4, ramp[3]);
  dot(grid, 10, 6 - hop, '#1c1726'); // eye
  dot(grid, 12, 7 - hop, '#ff8ca8'); // pink nose
  fillRect(grid, 2, 8 - hop, 2, 2, '#ffffff'); // cotton tail
  fillRect(grid, 4, 11, 2, 2, ramp[1]);
  fillRect(grid, 8, 11 - hop, 2, 2, ramp[1]);
  return grid;
}

function fox(frame) {
  const grid = makeGrid(22, 16);
  legs(grid, [5, 7, 13, 15], 11, 4, '#2a1d24', frame);
  fillBall(grid, 10, 9, 6, 3.2, FOX_PAL);
  fillBall(grid, 16.5, 6.5, 3, 2.6, FOX_PAL); // head
  fillRect(grid, 18, 6, 3, 2, '#ffffff'); // white snout tip
  dot(grid, 20, 6, '#1c1726');
  dot(grid, 17, 5, '#1c1726');
  fillRect(grid, 15, 2, 1, 3, FOX_PAL[0]); // pointed ears
  fillRect(grid, 17, 2, 1, 3, FOX_PAL[1]);
  fillBall(grid, 3.5, 8.5, 3, 2, FOX_PAL); // bushy tail + white tip
  dot(grid, 1, 8, '#ffffff');
  return grid;
}

function deer(frame) {
  const grid = makeGrid(24, 24);
  legs(grid, [6, 8, 14, 16], 15, 8, DEER_PAL[0], frame);
  fillBall(grid, 11, 12, 7, 4, DEER_PAL);
  fillRect(grid, 15, 6, 3, 7, DEER_PAL[2]); // graceful neck
  fillBall(grid, 18, 6, 2.8, 2.2, DEER_PAL);
  dot(grid, 19, 5, '#1c1726');
  drawLine(grid, 17, 4, 15, 0, '#e8d8b8'); // branching antlers
  drawLine(grid, 19, 4, 21, 0, '#e8d8b8');
  dot(grid, 16, 1, '#e8d8b8');
  dot(grid, 4, 10, '#ffffff'); // tail patch
  return grid;
}

function squirrel(frame) {
  const grid = makeGrid(14, 14);
  const tailY = frame ? 4 : 5;
  fillBall(grid, 4, tailY + 1, 2.8, 3.8, FOX_PAL); // fluffy upright tail
  fillBall(grid, 8, 9 - frame, 3, 2.4, FOX_PAL);
  fillBall(grid, 10.5, 6.5 - frame, 2, 1.8, FOX_PAL);
  dot(grid, 11, 6 - frame, '#1c1726');
  dot(grid, 9, 4 - frame, FOX_PAL[2]);
  fillRect(grid, 7, 11, 2, 2, FOX_PAL[0]);
  return grid;
}

function duck(frame) {
  const grid = makeGrid(14, 12);
  fillBall(grid, 6, 8, 4.5, 2.6, ['#6d6658', '#8c8372', '#a89f8d']);
  fillBall(grid, 10, 4.5, 2.2, 2, ['#145a36', '#1f7a4a', '#2e9e60']); // emerald head
  fillRect(grid, 12, 4, 2, 1, '#ffd23f'); // yellow bill
  dot(grid, 10, 4, '#1c1726');
  fillRect(grid, 5 + (frame % 2), 10, 1, 2, '#ff9a2b');
  return grid;
}

function swan(frame) {
  const grid = makeGrid(18, 16);
  fillBall(grid, 7, 11, 5.5, 3, SHEEP_WOOL, { ambient: 0.5 });
  drawLine(grid, 11, 10, 13, 4 - frame, '#ffffff'); // curved white neck
  fillRect(grid, 13, 3 - frame, 2, 2, '#ffffff');
  fillRect(grid, 15, 4 - frame, 2, 1, '#ff9a2b');
  dot(grid, 14, 3 - frame, '#1c1726');
  return spritePadWaterRipples(grid, frame);
}

function spritePadWaterRipples(grid, frame) {
  fillRect(grid, 3 + frame, 14, 8, 1, '#7cc4f5');
  return grid;
}

function hedgehog(frame) {
  const grid = makeGrid(14, 10);
  fillBall(grid, 6, 6, 4.5, 3, ['#4f3422', '#6e4930', '#8c5e3f']); // spiky shell
  for (let x = 2; x <= 9; x += 2) dot(grid, x, 3, '#c4a882');
  fillRect(grid, 9, 5, 4, 3, '#e2b58e'); // snout
  dot(grid, 12, 6, '#1c1726');
  fillRect(grid, 4 + frame, 9, 2, 1, '#6b3e1f');
  return grid;
}

function frog(frame) {
  const grid = makeGrid(12, 10);
  const hop = frame ? 2 : 0;
  fillBall(grid, 6, 6 - hop, 3.5, 2.5, ['#2a7a26', '#3fa036', '#66c44c']);
  dot(grid, 8, 3 - hop, '#ffd23f'); // golden eye
  dot(grid, 8, 4 - hop, '#1c1726');
  fillRect(grid, 2, 7, 3, 2, '#3fa036');
  fillRect(grid, 8, 7 - hop, 2, 2, '#3fa036');
  return grid;
}

function turtle(frame) {
  const grid = makeGrid(14, 10);
  fillBall(grid, 6.5, 6, 4.5, 3, ['#265c2c', '#3b7c38', '#54a04a']); // domed shell
  fillRect(grid, 10, 6, 3, 2, '#7ab85a'); // head
  dot(grid, 12, 6, '#1c1726');
  fillRect(grid, 3 + frame, 8, 2, 2, '#5e8c48');
  fillRect(grid, 8 - frame, 8, 2, 2, '#5e8c48');
  return grid;
}

function owl(frame) {
  const grid = makeGrid(14, 16);
  fillBall(grid, 7, 9 - frame, 4, 5, ['#5a3e28', '#8a6242', '#ba8c64']);
  fillRect(grid, 5, 5 - frame, 4, 3, '#f6efe0'); // facial disc
  dot(grid, 6, 6 - frame, '#ffd23f');
  dot(grid, 8, 6 - frame, '#ffd23f');
  dot(grid, 7, 7 - frame, '#ff9a2b'); // beak
  fillRect(grid, 5, 13, 2, 2, '#ffd23f');
  return grid;
}

function sheep(frame) {
  const grid = makeGrid(20, 16);
  legs(grid, [5, 7, 13, 15], 11, 4, '#2a2428', frame);
  fillBall(grid, 10, 8, 7, 4.5, SHEEP_WOOL, { ambient: 0.45 });
  fillBall(grid, 6, 8, 3, 3, SHEEP_WOOL, { ambient: 0.45 });
  fillBall(grid, 16, 7, 2.5, 2.5, ['#1c1726', '#2a2428', '#3e3844']); // dark face
  dot(grid, 17, 6, '#ffffff');
  fillRect(grid, 14, 5, 2, 1, '#3e3844');
  return grid;
}

function goat(frame) {
  const grid = makeGrid(20, 18);
  legs(grid, [5, 7, 13, 15], 12, 5, '#6b5e54', frame);
  fillBall(grid, 10, 9, 6, 3.5, ['#9e9488', '#c8beb2', '#e8dfd4']);
  fillBall(grid, 16, 6, 2.5, 2.2, ['#9e9488', '#c8beb2', '#e8dfd4']);
  fillRect(grid, 17, 8, 1, 2, '#e8dfd4'); // goat beard
  drawLine(grid, 15, 4, 13, 1, '#5a4e42'); // curved horns
  dot(grid, 17, 5, '#1c1726');
  return grid;
}

const DOE_PAL = ['#7d4d28', '#a86b3a', '#cc8e58', '#e6b888'];
const BOAR_PAL = ['#2b1e1a', '#4a342a', '#6b4d3e', '#8c6854'];
const MUSTANG_PAL = ['#5c2810', '#8f441c', '#b8622a', '#d88446'];

function doe(frame) {
  const grid = makeGrid(22, 20);
  legs(grid, [5, 7, 13, 15], 12, 7, DOE_PAL[0], frame);
  fillBall(grid, 10, 10, 6.5, 3.5, DOE_PAL);
  fillRect(grid, 14, 5, 3, 6, DOE_PAL[2]);
  fillRect(grid, 15, 7, 2, 4, '#f4ebd8'); // pale throat
  fillBall(grid, 17, 5, 2.5, 2, DOE_PAL);
  fillRect(grid, 15, 1, 1, 3, DOE_PAL[1]); // large alert ears
  fillRect(grid, 17, 1, 1, 3, DOE_PAL[2]);
  dot(grid, 18, 4, '#1c1726');
  dot(grid, 3, 8, '#ffffff');
  return grid;
}

function fawn(frame) {
  const grid = makeGrid(16, 14);
  legs(grid, [4, 6, 10, 11], 9, 4, DOE_PAL[1], frame);
  fillBall(grid, 7.5, 7.5, 4.5, 2.6, DOE_PAL);
  for (const [sx, sy] of [[5, 6], [7, 5], [9, 6], [6, 8]]) dot(grid, sx, sy, '#fff4df'); // fawn spots
  fillRect(grid, 10, 4, 2, 4, DOE_PAL[2]);
  fillBall(grid, 12, 4, 2, 1.8, DOE_PAL);
  fillRect(grid, 10, 1, 1, 2, DOE_PAL[2]);
  dot(grid, 13, 3, '#1c1726');
  dot(grid, 2, 6, '#ffffff');
  return grid;
}

function boar(frame) {
  const grid = makeGrid(22, 15);
  legs(grid, [5, 7, 14, 16], 10, 4, '#1c1412', frame);
  fillBall(grid, 10, 8, 7.5, 4.5, BOAR_PAL);
  for (let x = 5; x <= 14; x += 2) dot(grid, x, 3, '#2b1e1a'); // bristly ridge
  fillBall(grid, 17, 7, 3.5, 3, BOAR_PAL);
  fillRect(grid, 19, 8, 2, 2, '#9a6b58'); // snout
  drawLine(grid, 19, 8, 21, 6, '#fff8e0'); // tusks
  dot(grid, 18, 6, '#e85a3a');
  return grid;
}

function piglet(frame) {
  const grid = makeGrid(14, 11);
  legs(grid, [3, 5, 8, 10], 7, 3, '#3b2820', frame);
  fillBall(grid, 6.5, 5.5, 4, 2.5, ['#5c3e2c', '#7a523c', '#9c6e50']);
  fillRect(grid, 4, 4, 5, 1, '#d8be98'); // classic striped piglet bands
  fillRect(grid, 4, 6, 5, 1, '#c49e72');
  fillBall(grid, 10.5, 5, 2, 1.8, ['#7a523c', '#9c6e50', '#b88864']);
  dot(grid, 11, 4, '#1c1726');
  return grid;
}

function wildHorse(frame) {
  const grid = makeGrid(30, 26);
  legs(grid, [5, 8, 20, 23], 17, 8, '#38180a', frame);
  fillBall(grid, 14, 13, 11, 5.5, MUSTANG_PAL);
  fillRect(grid, 22, 4, 4, 10, MUSTANG_PAL[2]);
  fillBall(grid, 26, 5, 3.5, 2.5, MUSTANG_PAL);
  fillRect(grid, 21, 2, 2, 9, '#f4e6c8'); // wild flaxen mane
  fillRect(grid, 27, 4, 2, 2, '#ffffff'); // white blaze on muzzle
  dot(grid, 26, 4, '#1c1726');
  fillRect(grid, 1, 10 - frame, 3, 9, '#f4e6c8'); // flowing flaxen tail
  return grid;
}

function foal(frame) {
  const grid = makeGrid(20, 18);
  legs(grid, [4, 6, 13, 15], 11, 6, MUSTANG_PAL[0], frame);
  fillBall(grid, 9.5, 9.5, 6.5, 3.2, MUSTANG_PAL);
  fillRect(grid, 14, 4, 3, 6, MUSTANG_PAL[2]);
  fillBall(grid, 17, 4.5, 2.2, 1.8, MUSTANG_PAL);
  fillRect(grid, 13, 3, 2, 5, '#4a2e18');
  dot(grid, 17, 4, '#1c1726');
  fillRect(grid, 2, 8, 2, 5, '#4a2e18');
  return grid;
}

function lamb(frame) {
  const grid = makeGrid(14, 12);
  legs(grid, [3, 5, 9, 10], 8, 3, '#2a2428', frame);
  fillBall(grid, 6.5, 6, 4.2, 2.8, SHEEP_WOOL, { ambient: 0.55 });
  fillBall(grid, 10.5, 5, 1.8, 1.8, ['#2a2428', '#3e3844', '#524b5a']);
  dot(grid, 11, 4, '#ffffff');
  return grid;
}

function shepherdDog(frame) {
  const grid = makeGrid(20, 16);
  legs(grid, [4, 6, 12, 14], 10, 5, '#c48648', frame);
  fillBall(grid, 9, 8.5, 5.5, 3.2, ['#1e1b22', '#2e2934', '#463f4e']);
  fillRect(grid, 11, 6, 3, 5, '#ffffff'); // white collie ruff
  fillBall(grid, 15, 5.5, 2.6, 2.4, ['#8c4f24', '#c4783e', '#e09a5c']);
  fillRect(grid, 13, 2, 1, 2, '#1e1b22');
  fillRect(grid, 15, 2, 1, 2, '#1e1b22');
  fillRect(grid, 17, 5, 2, 2, '#ffffff');
  dot(grid, 16, 5, '#1c1726');
  drawLine(grid, 3, 7, 1, 4 - frame, '#2e2934'); // wagging tail
  return grid;
}

function duckling(frame) {
  const grid = makeGrid(9, 9);
  fillBall(grid, 4, 5.5, 2.5, 2, ['#e0a81a', '#ffd23f', '#fff07c']);
  fillBall(grid, 6.5, 3.5, 1.6, 1.5, ['#ffd23f', '#fff07c', '#ffffff']);
  dot(grid, 8, 4, '#ff8a24');
  dot(grid, 6, 3, '#1c1726');
  dot(grid, 3 + frame, 7, '#ff8a24');
  return grid;
}

function heron(frame) {
  const grid = makeGrid(18, 22);
  fillRect(grid, 7, 14, 1, 7, '#5a6270'); // long wading legs
  fillRect(grid, 10 + frame, 14, 1, 6 - frame, '#5a6270');
  fillBall(grid, 7.5, 11.5, 5, 3.2, ['#6b7788', '#96a4b8', '#c8d2e0']);
  drawLine(grid, 11, 10, 12, 4, '#dde4f0'); // S-neck
  fillRect(grid, 11, 2, 3, 2, '#ffffff');
  fillRect(grid, 14, 3, 4, 1, '#ffa828'); // long spear bill
  dot(grid, 12, 2, '#1c1726');
  return grid;
}

function sparrow(frame) {
  const grid = makeGrid(10, 10);
  const hop = frame ? 1 : 0;
  fillBall(grid, 4.5, 5.5 - hop, 3, 2.2, ['#5c3e26', '#8a6242', '#ba8c64']);
  fillBall(grid, 7, 4 - hop, 1.8, 1.6, ['#5c3e26', '#7a5232', '#9e6e48']);
  dot(grid, 9, 4 - hop, '#e8a030');
  dot(grid, 7, 3 - hop, '#1c1726');
  dot(grid, 1, 4 - hop, '#4a321e');
  fillRect(grid, 4, 8 - hop, 1, 2, '#6b4a2b');
  return grid;
}

function crow(frame) {
  const grid = makeGrid(12, 11);
  const hop = frame ? 1 : 0;
  fillBall(grid, 5, 6 - hop, 3.6, 2.6, ['#14161e', '#222634', '#384056']);
  fillBall(grid, 8, 4 - hop, 2, 1.8, ['#1c202e', '#2e3448', '#46506c']);
  fillRect(grid, 10, 4 - hop, 2, 1, '#586274');
  dot(grid, 8, 3 - hop, '#f4f8ff');
  fillRect(grid, 4, 8 - hop, 1, 2, '#2b2b34');
  fillRect(grid, 6, 8 - hop, 1, 2, '#2b2b34');
  return grid;
}

const WOLF_PAL = ['#4c5260', '#707888', '#96a0b2', '#cfd6e2'];
const BEAR_PAL = ['#3a2214', '#5c3820', '#7c4e30', '#9e6a46'];
const MOOSE_PAL = ['#362014', '#543420', '#74482e', '#926040'];

function wolf(frame) {
  const grid = makeGrid(24, 17);
  legs(grid, [5, 7, 15, 17], 11, 5, WOLF_PAL[0], frame);
  fillBall(grid, 11, 9, 7, 3.5, WOLF_PAL);
  fillBall(grid, 18, 6.5, 3.2, 2.8, WOLF_PAL); // lupine head
  fillRect(grid, 20, 6, 3, 2, WOLF_PAL[2]); // muzzle
  fillRect(grid, 16, 2, 1, 3, WOLF_PAL[1]); // pointed ears
  fillRect(grid, 18, 2, 1, 3, WOLF_PAL[2]);
  dot(grid, 19, 5, '#ffd23f'); // amber eye
  drawLine(grid, 4, 8, 1, 10 - frame, WOLF_PAL[1]); // bushy tail
  return grid;
}

function bear(frame) {
  const grid = makeGrid(28, 22);
  legs(grid, [6, 9, 17, 20], 14, 6, BEAR_PAL[0], frame);
  fillBall(grid, 13, 11, 9.5, 6, BEAR_PAL); // heavy bear body
  fillBall(grid, 22, 9, 4.5, 4, BEAR_PAL); // round bear head
  fillRect(grid, 24, 9, 3, 3, '#c49668'); // snout
  fillRect(grid, 19, 4, 2, 2, BEAR_PAL[1]); // rounded ears
  fillRect(grid, 22, 4, 2, 2, BEAR_PAL[2]);
  dot(grid, 23, 8, '#1c1726');
  return grid;
}

function moose(frame) {
  const grid = makeGrid(30, 28);
  legs(grid, [6, 9, 19, 22], 17, 9, MOOSE_PAL[0], frame);
  fillBall(grid, 14, 13, 9.5, 5.5, MOOSE_PAL); // humped shoulders
  fillRect(grid, 20, 7, 4, 7, MOOSE_PAL[2]);
  fillBall(grid, 24, 8, 3.8, 3, MOOSE_PAL); // heavy muzzle
  fillRect(grid, 22, 10, 2, 2, MOOSE_PAL[1]); // dewlap bell
  fillRect(grid, 16, 2, 9, 3, '#dfd0b4'); // broad palmate antlers
  fillRect(grid, 18, 1, 2, 5, '#dfd0b4');
  fillRect(grid, 22, 1, 2, 5, '#dfd0b4');
  dot(grid, 24, 7, '#1c1726');
  return grid;
}

function pheasant(frame) {
  const grid = makeGrid(18, 13);
  legs(grid, [8, 10], 9, 3, '#7a5230', frame);
  fillBall(grid, 8, 7, 4.5, 3, ['#8a321c', '#c85828', '#e88838']); // copper body
  fillBall(grid, 12, 4, 2.2, 2, ['#1c5a46', '#288266', '#3cb08a']); // emerald neck
  dot(grid, 13, 4, '#e83232'); // red cheek wattle
  dot(grid, 14, 4, '#ffd23f'); // beak
  drawLine(grid, 4, 6, 0, 4 - frame, '#b87a3a'); // long plumed tail
  return grid;
}

function goose(frame) {
  const grid = makeGrid(18, 15);
  fillBall(grid, 7, 10, 5.5, 3, ['#9ea4ae', '#d8dee8', '#ffffff']);
  fillRect(grid, 11, 4 - frame, 2, 6, '#e8eef7'); // upright neck
  fillRect(grid, 12, 3 - frame, 3, 2, '#ffffff');
  fillRect(grid, 15, 4 - frame, 2, 1, '#ff8a28'); // orange bill
  dot(grid, 13, 3 - frame, '#1c1726');
  fillRect(grid, 6 + (frame % 2), 12, 1, 2, '#ff8a28');
  return grid;
}

function bison(frame) {
  const grid = makeGrid(30, 24);
  legs(grid, [6, 9, 19, 22], 16, 6, '#261810', frame);
  fillBall(grid, 14, 12, 10, 6.5, ['#382214', '#5a361e', '#7a4b2c']);
  fillBall(grid, 18, 10, 7, 6.5, ['#26160c', '#3e2414', '#54321c']); // massive shaggy shoulder hump
  fillBall(grid, 24, 11, 3.8, 3.8, ['#26160c', '#3e2414', '#54321c']); // lowered head
  drawLine(grid, 22, 8, 25, 6, '#e8dcc0'); // curved horns
  dot(grid, 25, 10, '#ffffff');
  return grid;
}

const PAINTERS = {
  pig: pig,
  cow: cow,
  chicken: chicken,
  horse: horse,
  rabbit: (frame) => paintRabbit(WHITE_RABBIT, frame),
  rabbitBrown: (frame) => paintRabbit(BROWN_RABBIT, frame),
  fox: fox,
  deer: deer,
  doe: doe,
  fawn: fawn,
  boar: boar,
  piglet: piglet,
  wildHorse: wildHorse,
  foal: foal,
  lamb: lamb,
  shepherdDog: shepherdDog,
  squirrel: squirrel,
  duck: duck,
  duckling: duckling,
  swan: swan,
  heron: heron,
  hedgehog: hedgehog,
  frog: frog,
  turtle: turtle,
  owl: owl,
  sheep: sheep,
  goat: goat,
  sparrow: sparrow,
  crow: crow,
  wolf: wolf,
  bear: bear,
  moose: moose,
  pheasant: pheasant,
  goose: goose,
  bison: bison,
};

export function animalSprite(kind, dir, frame) {
  return once('animal' + kind + dir + frame, () => {
    const painter = PAINTERS[kind] || PAINTERS.rabbit;
    const grid = painter(frame);
    const outlined = addOutline(dir === 'left' ? mirrored(grid) : grid, OUTLINE);
    return { canvas: toCanvas(outlined), ax: Math.floor(outlined.width / 2), ay: outlined.height - 1 };
  });
}
