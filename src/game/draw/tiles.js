import { TILE, noise, groundAt } from '../world/map';
import { rect, circle, ellipse, triangle, line } from './shapes';

export const TILE_SIZE = 32; // pixels

const S = TILE_SIZE;

// ---------- Grounds ----------

function drawGrass(ctx, px, py, x, y) {
  rect(ctx, px, py, S, S, (x + y) % 2 === 0 ? '#62b052' : '#5caa4c');
  if (noise(x, y, 2) < 0.25) {
    line(ctx, px + 9, py + 22, px + 11, py + 16, '#4a9440', 2);
    line(ctx, px + 13, py + 22, px + 14, py + 15, '#4a9440', 2);
  }
}

function drawPath(ctx, px, py, x, y) {
  rect(ctx, px, py, S, S, '#dcc48f');
  if (noise(x, y, 3) < 0.4) circle(ctx, px + 8 + noise(x, y, 4) * 16, py + 8 + noise(x, y, 5) * 16, 2, '#c4aa74');
}

function drawSand(ctx, px, py, x, y) {
  rect(ctx, px, py, S, S, '#ecdca4');
  if (noise(x, y, 3) < 0.3) circle(ctx, px + 20, py + 12, 1.5, '#d6c285');
}

function drawWater(ctx, px, py, x, y, time) {
  rect(ctx, px, py, S, S, '#3f93d8');
  const wave = Math.sin(time * 2 + x * 0.9 + y * 0.6) * 4;
  line(ctx, px + 6 + wave, py + 10, px + 16 + wave, py + 10, '#8fc9f2', 2);
  line(ctx, px + 14 - wave, py + 22, px + 26 - wave, py + 22, '#6fb6ea', 2);
}

function drawStone(ctx, px, py, x, y) {
  rect(ctx, px, py, S, S, (x + y) % 2 === 0 ? '#a29a90' : '#9b9389');
  if (noise(x, y, 2) < 0.2) circle(ctx, px + 22, py + 20, 2, '#857d74');
}

function drawAsh(ctx, px, py, x, y) {
  rect(ctx, px, py, S, S, (x + y) % 2 === 0 ? '#4b4050' : '#463b4b');
  if (noise(x, y, 2) < 0.2) line(ctx, px + 8, py + 20, px + 18, py + 24, '#332a38', 2);
}

function drawLava(ctx, px, py, x, y, time) {
  const glow = (Math.sin(time * 3 + x + y) + 1) / 2;
  rect(ctx, px, py, S, S, '#d9481c');
  circle(ctx, px + 10, py + 12, 4 + glow * 2, '#ffb02e');
  circle(ctx, px + 23, py + 22, 3 + (1 - glow) * 2, '#ffd75e');
}

function drawFloor(ctx, px, py) {
  rect(ctx, px, py, S, S, '#6d6684');
  rect(ctx, px, py, S, 1, '#5a5470');
  rect(ctx, px, py, 1, S, '#5a5470');
}

function drawSoil(ctx, px, py) {
  rect(ctx, px, py, S, S, '#7b5331');
  for (let row = 6; row < S; row += 9) rect(ctx, px + 2, py + row, S - 4, 3, '#694427');
}

// ---------- Things standing on a ground ----------

function drawFlower(ctx, px, py, x, y) {
  const colors = ['#ff6fa8', '#ffd84a', '#ffffff', '#b48cff'];
  const color = colors[Math.floor(noise(x, y, 6) * colors.length)];
  circle(ctx, px + 10, py + 12, 3, color);
  circle(ctx, px + 22, py + 20, 3, color);
  circle(ctx, px + 10, py + 12, 1, '#ffb02e');
  circle(ctx, px + 22, py + 20, 1, '#ffb02e');
}

function drawTree(ctx, px, py, x, y) {
  const sway = noise(x, y, 7) * 2;
  ellipse(ctx, px + 16, py + 28, 10, 4, 'rgba(0, 0, 0, 0.2)');
  rect(ctx, px + 13, py + 16, 6, 12, '#7a4f2a');
  circle(ctx, px + 16, py + 11, 12, '#2f7d3a');
  circle(ctx, px + 12 + sway, py + 8, 7, '#44994c');
}

function drawDeadTree(ctx, px, py) {
  rect(ctx, px + 14, py + 10, 4, 18, '#2a2230');
  line(ctx, px + 16, py + 14, px + 7, py + 5, '#2a2230', 3);
  line(ctx, px + 16, py + 18, px + 26, py + 8, '#2a2230', 3);
}

function drawRock(ctx, px, py) {
  ellipse(ctx, px + 16, py + 26, 11, 4, 'rgba(0, 0, 0, 0.2)');
  ellipse(ctx, px + 16, py + 18, 12, 10, '#7c766f');
  ellipse(ctx, px + 13, py + 15, 6, 4, '#989189');
}

// ---------- Buildings ----------

function drawWall(ctx, px, py) {
  rect(ctx, px, py, S, S, '#3d3654');
  rect(ctx, px, py, S, 8, '#55507a'); // the top of the wall, lighter
  rect(ctx, px + 15, py + 8, 2, 12, '#2c2740');
  rect(ctx, px, py + 19, S, 2, '#2c2740');
}

// The roofs of Port Syntax (in the east) are blue, the ones of Lexia are red.
function drawRoof(ctx, px, py, x, y) {
  const isPort = x > 90;
  rect(ctx, px, py, S, S, isPort ? '#3d6fc2' : '#c24a3d');
  for (let row = 6; row < S; row += 10) rect(ctx, px, py + row, S, 2, isPort ? '#2f579b' : '#9b382e');
  if (noise(x, y, 8) < 0.3) rect(ctx, px + 12, py + 2, 8, 3, isPort ? '#5a8ada' : '#da6a5a');
}

function drawHouseWall(ctx, px, py) {
  rect(ctx, px, py, S, S, '#f0e3c6');
  rect(ctx, px, py, S, 3, '#8a6a4a');
  rect(ctx, px + 9, py + 9, 14, 12, '#7fc4e8'); // a window
  rect(ctx, px + 15, py + 9, 2, 12, '#8a6a4a');
  rect(ctx, px + 9, py + 14, 14, 2, '#8a6a4a');
}

function drawDoor(ctx, px, py) {
  rect(ctx, px, py, S, S, '#f0e3c6');
  rect(ctx, px, py, S, 3, '#8a6a4a');
  rect(ctx, px + 7, py + 6, 18, 26, '#8a5a2b');
  rect(ctx, px + 9, py + 8, 14, 24, '#a06a36');
  circle(ctx, px + 20, py + 20, 2, '#ffd23f');
}

function drawGround(ctx, tile, px, py, x, y, time) {
  if (tile === TILE.PATH) drawPath(ctx, px, py, x, y);
  else if (tile === TILE.SAND) drawSand(ctx, px, py, x, y);
  else if (tile === TILE.WATER) drawWater(ctx, px, py, x, y, time);
  else if (tile === TILE.STONE) drawStone(ctx, px, py, x, y);
  else if (tile === TILE.ASH) drawAsh(ctx, px, py, x, y);
  else if (tile === TILE.LAVA) drawLava(ctx, px, py, x, y, time);
  else if (tile === TILE.FLOOR) drawFloor(ctx, px, py);
  else if (tile === TILE.SOIL) drawSoil(ctx, px, py);
  else drawGrass(ctx, px, py, x, y);
}

// Draws the tile (x, y) at the pixel (px, py). time: seconds (the water and the lava move).
export function drawTile(ctx, tile, px, py, x, y, time) {
  const standsOnGround = [TILE.FLOWER, TILE.TREE, TILE.DEAD_TREE, TILE.ROCK].includes(tile);
  drawGround(ctx, standsOnGround ? groundAt(x, y) : tile, px, py, x, y, time);

  if (tile === TILE.FLOWER) drawFlower(ctx, px, py, x, y);
  else if (tile === TILE.TREE) drawTree(ctx, px, py, x, y);
  else if (tile === TILE.DEAD_TREE) drawDeadTree(ctx, px, py);
  else if (tile === TILE.ROCK) drawRock(ctx, px, py);
  else if (tile === TILE.WALL) drawWall(ctx, px, py);
  else if (tile === TILE.ROOF) drawRoof(ctx, px, py, x, y);
  else if (tile === TILE.HOUSE) drawHouseWall(ctx, px, py);
  else if (tile === TILE.DOOR) drawDoor(ctx, px, py);
}

// A carrot growing on a soil tile. ready: true = the orange top shows.
export function drawCrop(ctx, px, py, ready) {
  line(ctx, px + 16, py + 20, px + 11, py + 10, '#4caf50', 3);
  line(ctx, px + 16, py + 20, px + 21, py + 10, '#4caf50', 3);
  line(ctx, px + 16, py + 20, px + 16, py + 8, '#66c26a', 3);
  if (ready) triangle(ctx, px + 11, py + 20, px + 21, py + 20, px + 16, py + 30, '#ff8c2b');
}

export function drawChest(ctx, px, py, isOpen) {
  rect(ctx, px + 5, py + 12, 22, 16, '#8a5a2b');
  rect(ctx, px + 5, py + 12, 22, 5, isOpen ? '#3a2a1a' : '#a8743a');
  rect(ctx, px + 14, py + 17, 4, 5, '#ffd23f');
}

// A piece of the obsidian barrier: a black crystal.
export function drawBarrier(ctx, px, py) {
  triangle(ctx, px + 4, py + 30, px + 16, py + 2, px + 28, py + 30, '#1b1528');
  triangle(ctx, px + 10, py + 30, px + 16, py + 8, px + 20, py + 30, '#4a3b7a');
}
