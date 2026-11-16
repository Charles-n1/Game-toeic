import { makeGrid, dot, fillRect, fillEllipse, fillBall, toneOf, drawLine, drawPicture, randomOf, addOutline, toCanvas, once, fillTriangle } from './pixels';
import { OUTLINE, WOOD, WOOD_RAMP, STONE_RAMP, ROOF_RAMPS, darker, lighter } from './palette';

// The buildings and the things of the new world: the guild, the tents of the bandits, the titanic tower of the
// demon, the old watchtower, the mines, the riddles, the furniture of the home...
// Each one is a sprite { canvas, ax, ay }: (ax, ay) touches the ground (the bottom-left of its tiles for the
// big ones, see scene.js).

function sprite(grid, ax, ay, outline = OUTLINE) {
  return { canvas: toCanvas(addOutline(grid, outline)), ax: ax, ay: ay };
}

// Bricks: rows offset like a real wall, lit on the top.
function paintBricks(grid, x, y, w, h, ramp, salt) {
  for (let row = y; row < y + h; row++) {
    for (let column = x; column < x + w; column++) {
      const offset = Math.floor((row - y) / 4) % 2 ? 4 : 0;
      const isMortar = (row - y) % 4 === 3 || (column - x + offset) % 8 === 7;
      dot(grid, column, row, isMortar ? ramp[0] : toneOf(ramp, 0.6 - ((row - y) % 4) * 0.08 + randomOf(column, row, salt) * 0.12, column, row));
    }
  }
}

// ---------- The guild of adventurers: a big hall of stone with a blue roof and a banner ----------

export function guildSprite() {
  return once('guild', () => {
    const grid = makeGrid(96, 76);
    const roof = ROOF_RAMPS.blue;
    for (let y = 8; y <= 36; y++) {
      const inset = Math.round((36 - y) * 0.55);
      for (let x = inset; x < 96 - inset; x++) {
        const isSeam = (x + (Math.floor((y - 8) / 4) % 2) * 3) % 6 === 0;
        dot(grid, x, y, toneOf(roof, 0.8 - ((y - 8) % 4) * 0.14 - (isSeam ? 0.25 : 0), x, y));
      }
    }
    fillRect(grid, 16, 8, 64, 1, roof[5]);
    paintBricks(grid, 2, 37, 92, 39, STONE_RAMP, 60);
    fillRect(grid, 34, 50, 28, 26, WOOD_RAMP[1]); // the big door
    fillEllipse(grid, 48, 51, 14, 6, WOOD_RAMP[1]);
    for (let x = 36; x < 60; x += 4) fillRect(grid, x, 50, 1, 26, WOOD_RAMP[0]);
    fillBall(grid, 44.5, 64.5, 1.3, 1.3, ['#8a6a12', '#e8b83a', '#fff2a8']);
    fillBall(grid, 51.5, 64.5, 1.3, 1.3, ['#8a6a12', '#e8b83a', '#fff2a8']);
    for (const x of [8, 76]) {
      fillRect(grid, x, 46, 12, 12, '#2f5f8f');
      fillRect(grid, x + 1, 47, 10, 10, '#8cc5ee');
      fillRect(grid, x + 5, 46, 2, 12, STONE_RAMP[1]);
    }
    fillRect(grid, 46, 0, 4, 10, WOOD.dark); // the flag
    fillRect(grid, 50, 1, 14, 8, '#e8423f');
    fillTriangle(grid, [60, 1], [64, 5], [60, 9], () => '#e8423f');
    drawLine(grid, 53, 3, 59, 6, '#ffd23f'); // two swords on the flag
    drawLine(grid, 59, 3, 53, 6, '#ffd23f');
    fillRect(grid, 40, 40, 16, 6, WOOD_RAMP[3]); // the sign: a shield
    fillRect(grid, 45, 41, 6, 4, '#3a7bff');
    return sprite(grid, 0, 76);
  });
}

// ---------- The camp of the bandits ----------

export function tent(isBig) {
  return once('tent' + isBig, () => {
    const w = isBig ? 80 : 48;
    const h = isBig ? 48 : 32;
    const grid = makeGrid(w, h);
    const cloth = isBig ? ['#5a1a1a', '#7a2424', '#9a3030', '#b84040'] : ['#6b4a2a', '#8a6034', '#a8783e', '#c8944e'];
    fillTriangle(grid, [0, h - 1], [w / 2, 0], [w - 1, h - 1], (x) => toneOf(cloth, x < w / 2 ? 0.75 : 0.35, x, 0));
    fillTriangle(grid, [w / 2 - 6, h - 1], [w / 2, h * 0.35], [w / 2 + 6, h - 1], () => '#1c1418');
    drawLine(grid, w / 2, 0, w / 2, 4, WOOD.dark);
    if (isBig) fillRect(grid, w / 2 + 1, 0, 8, 5, '#d0202a');
    return sprite(grid, 0, h);
  });
}

export function banner(color) {
  return once('banner' + color, () => {
    const grid = makeGrid(10, 30);
    fillRect(grid, 4, 0, 2, 30, WOOD.dark);
    fillRect(grid, 0, 2, 10, 16, color);
    fillTriangle(grid, [0, 18], [5, 23], [10, 18], () => color);
    fillRect(grid, 2, 6, 6, 1, lighter(color));
    fillRect(grid, 4, 9, 2, 5, darker(color));
    return sprite(grid, 5, 29);
  });
}

// ---------- The titanic tower of the Demon King, standing on his keep ----------

export function demonSpire(frame) {
  return once('spire' + frame, () => {
    const grid = makeGrid(128, 210);
    const stone = ['#140a0e', '#24121a', '#341a24', '#46222e', '#58303c'];
    const body = (y) => 34 - Math.round(y * 0.07);
    for (let y = 30; y < 210; y++) {
      const half = body(y - 30);
      for (let x = 64 - half; x < 64 + half; x++) dot(grid, x, y, toneOf(stone, 0.65 - (x - 64 + half) / (half * 3) + randomOf(x, y, 61) * 0.1, x, y));
    }
    for (let y = 40; y < 200; y += 22) fillRect(grid, 64 - body(y - 30), y, body(y - 30) * 2, 2, stone[0]); // the floors
    fillTriangle(grid, [30, 34], [64, 0], [98, 34], (x, y) => toneOf(stone, 0.8 - x / 200, x, y)); // the pointed roof
    for (const [x, y] of [[50, 70], [74, 70], [56, 120], [68, 120], [62, 165]]) {
      fillRect(grid, x, y, 6, 10, frame ? '#ff6a2b' : '#ffb040'); // windows of fire
      fillRect(grid, x + 2, y, 2, 10, '#ffe066');
    }
    fillBall(grid, 64, 18, 4, 4, ['#7a0010', '#d0202a', '#ff6a6a']); // the red eye on the top
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const x = 64 + side * (24 + i * 8);
        fillTriangle(grid, [x - 4, 120 + i * 18], [x, 96 + i * 18], [x + 4, 120 + i * 18], () => stone[2]); // spikes
      }
    }
    return sprite(grid, 0, 210, '#000000');
  });
}

// ---------- The old watchtower ----------

export function watchtower() {
  return once('watchtower', () => {
    const grid = makeGrid(112, 176);
    for (let y = 40; y < 176; y++) {
      const half = 40 - Math.round((176 - y) * 0.06);
      for (let x = 56 - half; x < 56 + half; x++) {
        const offset = Math.floor(y / 5) % 2 ? 5 : 0;
        const isMortar = y % 5 === 4 || (x + offset) % 10 === 9;
        const light = 0.75 - Math.abs(x - 46) / (half * 2.2);
        dot(grid, x, y, isMortar ? STONE_RAMP[1] : toneOf(STONE_RAMP, light + randomOf(x, y, 62) * 0.08, x, y));
      }
    }
    for (let x = 14; x < 98; x += 10) fillRect(grid, x, 32, 6, 8, STONE_RAMP[3]); // the battlements
    fillRect(grid, 12, 38, 88, 4, STONE_RAMP[2]);
    fillTriangle(grid, [16, 32], [56, 0], [96, 32], (x, y) => toneOf(ROOF_RAMPS.red, 0.8 - x / 160, x, y));
    for (const y of [70, 110]) {
      fillRect(grid, 50, y, 12, 16, '#1c1726');
      fillRect(grid, 52, y + 2, 8, 12, '#ffcf6a');
    }
    fillRect(grid, 46, 150, 20, 26, WOOD_RAMP[1]);
    fillEllipse(grid, 56, 151, 10, 4, WOOD_RAMP[1]);
    return sprite(grid, 0, 176);
  });
}

// ---------- Mines ----------

export function mineFrame() {
  return once('mineFrame', () => {
    const grid = makeGrid(48, 30);
    fillRect(grid, 6, 4, 36, 26, '#0d0b14');
    fillRect(grid, 4, 2, 4, 28, WOOD.dark);
    fillRect(grid, 40, 2, 4, 28, WOOD.dark);
    fillRect(grid, 2, 0, 44, 5, WOOD.base);
    fillRect(grid, 2, 0, 44, 1, WOOD.light);
    for (let x = 12; x < 38; x += 6) fillRect(grid, x, 26, 4, 2, WOOD.dark); // the rails
    fillRect(grid, 10, 25, 28, 1, '#9aa6b8');
    fillRect(grid, 10, 28, 28, 1, '#9aa6b8');
    fillRect(grid, 18, 6, 12, 4, WOOD.light); // the sign
    fillRect(grid, 20, 7, 8, 1, WOOD.deep);
    return sprite(grid, 0, 30);
  });
}

export function minecart() {
  return once('minecart', () => {
    const grid = makeGrid(16, 14);
    fillRect(grid, 1, 2, 14, 8, '#5a5266');
    fillRect(grid, 1, 2, 14, 2, '#7a7286');
    fillBall(grid, 5, 4, 2.5, 2, ['#4a4a4a', '#9aa6b8', '#e8eef7']); // ore in it
    fillBall(grid, 10, 3.5, 2.5, 2, ['#2a4a8a', '#3a7bff', '#bfe6ff']);
    fillBall(grid, 4, 11, 2, 2, ['#1c1726', '#3a3442', '#5a5266']);
    fillBall(grid, 12, 11, 2, 2, ['#1c1726', '#3a3442', '#5a5266']);
    return sprite(grid, 8, 13);
  });
}

// ---------- Ruins and riddles ----------

export function ruinPillar() {
  return once('pillar', () => {
    const grid = makeGrid(14, 34);
    for (let y = 4; y < 31; y++) for (let x = 2; x < 12; x++) dot(grid, x, y, toneOf(STONE_RAMP, 0.75 - x * 0.04 + randomOf(x, y, 63) * 0.1, x, y));
    fillRect(grid, 0, 30, 14, 4, STONE_RAMP[2]);
    fillRect(grid, 1, 2, 12, 3, STONE_RAMP[4]);
    fillRect(grid, 3, 0, 6, 2, STONE_RAMP[3]); // broken top
    for (let y = 8; y < 28; y += 7) fillRect(grid, 4, y, 6, 1, '#5f9a3e'); // moss
    return sprite(grid, 7, 33);
  });
}

// An obelisk with glowing letters: touch it, complete its sentence, it gives a reward. solved: the letters fade.
export function obelisk(solved, frame) {
  return once('obelisk' + solved + frame, () => {
    const grid = makeGrid(14, 36);
    fillTriangle(grid, [2, 8], [7, 0], [12, 8], (x, y) => toneOf(STONE_RAMP, 0.7 - x * 0.03, x, y));
    for (let y = 8; y < 32; y++) for (let x = 2; x < 12; x++) dot(grid, x, y, toneOf(['#2a2838', '#3a3650', '#4c4868', '#5e5a80'], 0.7 - x * 0.04, x, y));
    fillRect(grid, 0, 31, 14, 5, STONE_RAMP[2]);
    const glow = solved ? '#6a6680' : frame ? '#8fd6ff' : '#bfe6ff';
    for (let y = 11; y < 29; y += 4) {
      fillRect(grid, 4, y, 2, 2, glow);
      fillRect(grid, 7, y + 1, 3, 1, glow);
    }
    return sprite(grid, 7, 35);
  });
}

// A small hut of wood in the wild (a hermit lives there).
export function hut() {
  return once('hut', () => {
    const grid = makeGrid(36, 36);
    fillTriangle(grid, [0, 16], [18, 0], [35, 16], (x, y) => toneOf(['#5a4a2a', '#7a6434', '#9a7e44', '#b89a58'], 0.8 - x / 60, x, y));
    for (let y = 16; y < 36; y++) for (let x = 3; x < 33; x++) dot(grid, x, y, toneOf(WOOD_RAMP, 0.6 - ((x - 3) % 6 === 5 ? 0.3 : 0), x, y));
    fillRect(grid, 14, 23, 8, 13, WOOD_RAMP[0]);
    fillRect(grid, 25, 21, 5, 5, '#ffcf6a');
    return sprite(grid, 0, 36);
  });
}

// ---------- The village things ----------

export function well() {
  return once('well', () => {
    const grid = makeGrid(18, 24);
    fillEllipse(grid, 9, 18, 8, 5, STONE_RAMP[2]);
    fillEllipse(grid, 9, 17, 6, 3, '#1b3a6a');
    for (let x = 1; x < 17; x += 4) fillRect(grid, x, 17, 3, 6, STONE_RAMP[3]);
    fillRect(grid, 2, 4, 2, 13, WOOD.dark);
    fillRect(grid, 14, 4, 2, 13, WOOD.dark);
    fillTriangle(grid, [0, 6], [9, 0], [18, 6], () => ROOF_RAMPS.red[3]);
    fillRect(grid, 8, 6, 2, 8, '#9aa6b8'); // the rope and the bucket
    fillRect(grid, 7, 13, 4, 3, WOOD.base);
    return sprite(grid, 9, 23);
  });
}

// A training dummy of straw on a post: the hero can practice a skill there.
export function dummy() {
  return once('dummy', () => {
    const grid = makeGrid(16, 28);
    fillRect(grid, 7, 10, 2, 18, WOOD.dark);
    fillRect(grid, 1, 11, 14, 3, WOOD.base); // the arms
    fillEllipse(grid, 8, 16, 5, 6, '#d6b45a');
    fillBall(grid, 8, 6, 4.5, 4.5, ['#a88a3a', '#d6b45a', '#f2d88a']);
    fillRect(grid, 6, 5, 1, 1, '#1c1726');
    fillRect(grid, 9, 5, 1, 1, '#1c1726');
    drawLine(grid, 4, 14, 12, 18, '#e8423f'); // the target
    fillBall(grid, 8, 16, 2, 2, ['#8a1a1a', '#e8423f', '#ff8a8a']);
    return sprite(grid, 8, 27);
  });
}

export function logs() {
  return once('logs', () => {
    const grid = makeGrid(32, 14);
    for (const [x, y] of [[0, 6], [10, 6], [5, 1], [20, 6]]) {
      fillRect(grid, x, y, 12, 7, WOOD.base);
      fillRect(grid, x, y, 12, 2, WOOD.light);
      fillEllipse(grid, x + 11, y + 3.5, 2, 3.5, '#d6a46a');
    }
    return sprite(grid, 16, 13);
  });
}

// A torch on a wall (inside): only a flame and its iron holder.
export function wallTorch(frame) {
  return once('wallTorch' + frame, () => {
    const grid = makeGrid(8, 14);
    fillRect(grid, 3, 7, 2, 7, '#3a3442');
    const flames = [['..R.', '.ROR', '.OYO', '..Y.'], ['.R..', 'RORO', 'OYO.', '.Y..'], ['..R.', '.ORR', 'ROYO', '.YY.']];
    drawPicture(grid, flames[frame].map((row) => row.padEnd(8, '.').slice(0, 8)), { R: '#e8421c', O: '#ff9a2b', Y: '#ffe066' }, 2, 2);
    return sprite(grid, 4, 13);
  });
}

// The boat between Seabridge and Skyreach Island. frame: it rocks on the waves.
export function boat(frame) {
  return once('boat' + frame, () => {
    const grid = makeGrid(44, 46);
    const lift = frame;
    fillTriangle(grid, [2, 30 + lift], [42, 30 + lift], [36, 42 + lift], (x, y) => toneOf(WOOD_RAMP, 0.6 - (y - 30) * 0.04, x, y));
    fillTriangle(grid, [2, 30 + lift], [36, 42 + lift], [8, 42 + lift], (x, y) => toneOf(WOOD_RAMP, 0.4, x, y));
    fillRect(grid, 20, 2 + lift, 2, 29, WOOD.dark);
    fillTriangle(grid, [22, 4 + lift], [40, 24 + lift], [22, 26 + lift], () => '#f6efe0');
    fillTriangle(grid, [19, 6 + lift], [6, 24 + lift], [19, 26 + lift], () => '#e6dcc8');
    fillRect(grid, 22, 2 + lift, 8, 3, '#e8423f');
    return sprite(grid, 22, 44);
  });
}

// ---------- The puzzles ----------

export function boulder() {
  return once('boulder', () => {
    const grid = makeGrid(16, 16);
    fillBall(grid, 8, 8.5, 7.5, 7, STONE_RAMP, { ambient: 0.2 });
    drawLine(grid, 5, 6, 8, 9, STONE_RAMP[1]);
    return sprite(grid, 8, 15);
  });
}

// A stone plate on the floor (pressed: a boulder is on it).
export function plate(isPressed) {
  return once('plate' + isPressed, () => {
    const grid = makeGrid(14, 14);
    fillRect(grid, 1, 1, 12, 12, isPressed ? '#4a8a4a' : '#6a6685');
    fillRect(grid, 3, 3, 8, 8, isPressed ? '#7cfc9a' : '#8f8ab0');
    drawPicture(grid, ['..W..', '.W.W.', 'W...W', '.W.W.', '..W..'], { W: isPressed ? '#e8ffe8' : '#c8c4e0' }, 5, 5);
    return { canvas: toCanvas(grid), ax: 7, ay: 13 };
  });
}

// A gate of iron bars (closed) across a corridor.
export function bars() {
  return once('bars', () => {
    const grid = makeGrid(16, 22);
    fillRect(grid, 0, 0, 16, 3, '#3a3442');
    for (let x = 1; x < 16; x += 3) fillRect(grid, x, 3, 2, 19, '#7a7286');
    fillRect(grid, 0, 10, 16, 2, '#5a5266');
    return sprite(grid, 8, 21);
  });
}

// A door of stone with runes of light: it opens to a good sentence.
export function wordDoor(frame) {
  return once('wordDoor' + frame, () => {
    const grid = makeGrid(16, 24);
    for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) dot(grid, x, y, toneOf(['#2a2840', '#36345a', '#424070', '#4e4c84'], 0.6 - x * 0.02, x, y));
    const glow = frame ? '#ffd23f' : '#ffe98a';
    drawPicture(grid, ['G.G.G', '.GGG.', 'G.G.G', '.....', 'GGGGG', '.....', 'G...G', '.G.G.', '..G..'], { G: glow }, 5, 6);
    return sprite(grid, 8, 23);
  });
}

// ---------- The furniture of the home ----------

export function bed(color = '#d6302f') {
  return once('bed' + color, () => {
    const grid = makeGrid(32, 30);
    fillRect(grid, 1, 2, 30, 26, WOOD.base);
    fillRect(grid, 3, 4, 26, 6, '#f6efe0'); // the pillow
    fillRect(grid, 3, 10, 26, 16, color);
    fillRect(grid, 3, 10, 26, 2, lighter(color));
    fillRect(grid, 1, 0, 30, 3, WOOD.dark);
    return sprite(grid, 0, 30);
  });
}

export function stove(frame) {
  return once('stove' + frame, () => {
    const grid = makeGrid(32, 30);
    paintBricks(grid, 1, 6, 30, 24, STONE_RAMP, 64);
    fillRect(grid, 8, 16, 16, 10, '#1c1418');
    drawPicture(grid, frame ? ['.R.R.', 'ROROR', 'OYOYO'] : ['R.R.R', 'OROR.', 'YOYOY'], { R: '#e8421c', O: '#ff9a2b', Y: '#ffe066' }, 13, 21);
    fillRect(grid, 4, 2, 6, 6, '#3a3442'); // the pot
    fillRect(grid, 20, 0, 4, 8, STONE_RAMP[2]); // the chimney
    return sprite(grid, 0, 30);
  });
}

export function storage() {
  return once('storage', () => {
    const grid = makeGrid(16, 14);
    fillRect(grid, 1, 2, 14, 12, WOOD.base);
    fillRect(grid, 1, 2, 14, 4, WOOD.light);
    fillRect(grid, 1, 6, 14, 1, WOOD.deep);
    fillRect(grid, 7, 5, 2, 3, '#e8b83a');
    return sprite(grid, 8, 13);
  });
}

export function windowOnWall() {
  return once('homeWindow', () => {
    const grid = makeGrid(30, 14);
    fillRect(grid, 0, 0, 30, 14, WOOD.dark);
    fillRect(grid, 2, 2, 12, 10, '#8cc5ee');
    fillRect(grid, 16, 2, 12, 10, '#8cc5ee');
    fillRect(grid, 3, 3, 4, 3, '#e6f6ff');
    return { canvas: toCanvas(grid), ax: 15, ay: 13 };
  });
}

// The furniture the hero can buy and place in the home (see data/furniture.js). color: its main color.
export function furniture(kind, color) {
  return once('furniture' + kind + color, () => {
    const grid = makeGrid(16, 24);
    if (kind === 'table') {
      fillRect(grid, 0, 10, 16, 5, color);
      fillRect(grid, 0, 10, 16, 1, lighter(color));
      fillRect(grid, 1, 15, 2, 8, darker(color));
      fillRect(grid, 13, 15, 2, 8, darker(color));
    } else if (kind === 'chair') {
      fillRect(grid, 3, 6, 10, 3, color);
      fillRect(grid, 3, 14, 10, 3, color);
      fillRect(grid, 3, 6, 2, 17, darker(color));
      fillRect(grid, 11, 14, 2, 9, darker(color));
    } else if (kind === 'plant') {
      fillRect(grid, 4, 17, 8, 7, '#b0603a');
      fillBall(grid, 8, 11, 6, 6, ['#1e5026', '#388434', '#70bc4c', '#97d65e']);
      fillBall(grid, 8, 5, 2, 2, [darker(color), color, lighter(color)]);
    } else if (kind === 'shelf') {
      fillRect(grid, 0, 0, 16, 24, darker(color));
      for (const y of [2, 9, 16]) {
        fillRect(grid, 1, y, 14, 6, '#2a1c16');
        for (let x = 2; x < 14; x += 3) fillRect(grid, x, y + 1, 2, 5, ['#e8423f', '#3a7bff', '#4cc35a', '#ffd23f'][(x + y) % 4]);
      }
    } else if (kind === 'lamp') {
      fillRect(grid, 7, 8, 2, 14, '#3a3442');
      fillRect(grid, 4, 22, 8, 2, '#3a3442');
      fillTriangle(grid, [2, 9], [8, 1], [14, 9], () => color);
      fillRect(grid, 6, 9, 4, 2, '#fff6d0');
    } else if (kind === 'painting') {
      fillRect(grid, 0, 2, 16, 12, WOOD.dark);
      fillRect(grid, 2, 4, 12, 8, '#8cc5ee');
      fillTriangle(grid, [2, 12], [7, 6], [12, 12], () => color);
      fillBall(grid, 11, 6, 1.5, 1.5, ['#ffd23f', '#ffe98a', '#ffffff']);
    } else {
      fillRect(grid, 0, 12, 16, 12, color); // a rug
      fillRect(grid, 2, 14, 12, 8, lighter(color));
      fillRect(grid, 4, 16, 8, 4, color);
    }
    return { canvas: toCanvas(kind === 'rug' ? grid : addOutline(grid, OUTLINE)), ax: 8, ay: 23 };
  });
}

// ---------- The keeps of the castles: their front wall, and turrets on their corners ----------

const KEEP_LOOKS = {
  demon: { stone: ['#140a0e', '#24121a', '#341a24', '#46222e', '#58303c'], window: ['#ff6a2b', '#ffe066'], roof: '#1c0a10' },
  ice: { stone: ['#4a6a98', '#5a7aa8', '#6c8cba', '#7f9fcb', '#9dbbe0'], window: ['#8fd6ff', '#e6f6ff'], roof: '#3a5a88' },
};

// The front of a keep, `tiles` wide and 8 tiles high: bricks, buttresses, windows that glow, a big arched gate
// in the middle (above the stairs), battlements on the top.
export function keepFacade(look, tiles, frame) {
  return once('keep' + look + tiles + frame, () => {
    const style = KEEP_LOOKS[look] || KEEP_LOOKS.demon;
    const w = tiles * 16;
    const h = 128;
    const grid = makeGrid(w, h);
    paintBricks(grid, 0, 10, w, h - 10, style.stone, 66);
    for (let x = 0; x < w; x += 12) fillRect(grid, x, 2, 7, 9, style.stone[3]); // the battlements
    fillRect(grid, 0, 10, w, 2, style.stone[4]);
    for (let x = 0; x < w; x += 48) fillRect(grid, x, 12, 6, h - 12, style.stone[1]); // the buttresses
    const middle = Math.floor(w / 2);
    for (let x = 18; x < w - 18; x += 32) {
      if (Math.abs(x + 4 - middle) < 30) continue;
      for (const y of [28, 64]) {
        fillRect(grid, x, y, 8, 14, '#0d0b14');
        fillEllipse(grid, x + 4, y, 4, 3, '#0d0b14');
        fillRect(grid, x + 2, y + 2, 4, 10, style.window[frame % 2]);
      }
    }
    fillRect(grid, middle - 18, h - 52, 36, 52, style.stone[0]); // the gate
    fillEllipse(grid, middle, h - 52, 18, 12, style.stone[0]);
    fillRect(grid, middle - 14, h - 48, 28, 48, '#0a0608');
    fillEllipse(grid, middle, h - 48, 14, 9, '#0a0608');
    for (let x = middle - 12; x < middle + 12; x += 5) fillRect(grid, x, h - 52, 2, 40, '#3a3442'); // the raised portcullis
    return sprite(grid, 0, h, '#000000');
  });
}

// A round turret with a pointed roof and a flag.
export function turret(look) {
  return once('turret' + look, () => {
    const style = KEEP_LOOKS[look] || KEEP_LOOKS.demon;
    const grid = makeGrid(36, 76);
    for (let y = 22; y < 76; y++) for (let x = 3; x < 33; x++) dot(grid, x, y, toneOf(style.stone, 0.75 - Math.abs(x - 14) / 30 + randomOf(x, y, 67) * 0.08, x, y));
    fillTriangle(grid, [0, 24], [18, 0], [36, 24], (x, y) => toneOf(style.stone, 0.85 - x / 60, x, y));
    fillRect(grid, 17, 0, 2, 6, '#2a1f2e');
    fillRect(grid, 19, 0, 8, 4, look === 'ice' ? '#ffd23f' : '#d0202a');
    fillRect(grid, 14, 36, 6, 10, '#0d0b14');
    fillRect(grid, 15, 38, 4, 7, style.window[0]);
    return sprite(grid, 0, 76, '#000000');
  });
}
