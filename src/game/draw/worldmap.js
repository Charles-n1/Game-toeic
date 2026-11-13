import { zoneAt, zoneOf } from '../data/zones';
import { MAP, MAP_SIZE, TILE, noise, TREASURES } from '../world/map';
import { smoothNoise } from '../world/noise';
import { BLOCK, BLOCKS, isBlockKnown, isKnown } from '../logic/explore';
import { PLACES, SHOP_MARKS, mainQuestMark, sideQuestMarks, blockedMarks } from '../logic/places';
import { iconCanvas } from './icons';
import { makeGrid, fillEllipse, drawLine, addOutline, toCanvas, once } from './pixels';

// The world map, painted like an old adventure map: forests of round trees, snowy peaks, lava, dunes, rivers...
// The painting is made once (6 pixels per tile). Then each frame draws a part of it, the fog on the places
// the player does not know yet, and the marks: places, quests, shops, the player.

const P = 6; // pixels of the painting per tile
const SEA = { deep: '#1d4b94', mid: '#2a66b8', shallow: '#3b86d8', foam: '#d6f0ff', wave: '#5a9de6' };
const GRASSES = ['#4b9437', '#559f3e', '#5fa945'];
const FOREST = { dark: '#1f5428', mid: '#2e7232', light: '#4f9a3e', top: '#7cc45a' };
const ROCK = { dark: '#5d5a63', mid: '#8e8a93', light: '#c4c0c8' };

// ---------- The painting ----------

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function tileOf(x, y) {
  if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) return TILE.WATER;
  return MAP[y * MAP_SIZE + x];
}

function isWater(x, y) {
  return tileOf(x, y) === TILE.WATER;
}

// How far the land is (0 to 3 tiles): the sea is darker far from the coast.
function landNear(x, y) {
  for (let r = 1; r <= 3; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) if (!isWater(x + dx, y + dy)) return r;
    }
  }
  return 4;
}

function paintWater(ctx, x, y) {
  const near = landNear(x, y);
  const color = near === 1 ? SEA.shallow : near <= 3 ? SEA.mid : SEA.deep;
  rect(ctx, x * P, y * P, P, P, color);
  if (near > 2 && noise(x, y, 21) < 0.08) rect(ctx, x * P + 1, y * P + 3, 3, 1, SEA.wave); // a small wave
  [
    [0, -1, 0, 0, P, 1],
    [0, 1, 0, P - 1, P, 1],
    [-1, 0, 0, 0, 1, P],
    [1, 0, P - 1, 0, 1, P],
  ].forEach(([dx, dy, ox, oy, w, h]) => {
    if (!isWater(x + dx, y + dy) && tileOf(x + dx, y + dy) !== TILE.BRIDGE) rect(ctx, x * P + ox, y * P + oy, w, h, SEA.foam);
  });
}

function grassColor(x, y) {
  if (zoneAt(x, y).biome === 'forest') return smoothNoise(x, y, 4, 22) < 0.5 ? '#2f6e2e' : '#357a33'; // under the trees
  return GRASSES[Math.floor(smoothNoise(x, y, 4, 22) * 2.99)];
}

// The color of the ground of a tile (under the trees and the rocks too).
function groundColor(x, y, tile) {
  const biome = zoneAt(x, y).biome;
  if (tile === TILE.PATH) return zoneAt(x, y).kind === 'village' ? '#b8afa2' : '#c9a26b';
  if (tile === TILE.BRIDGE) return '#8a5a30';
  if (tile === TILE.STONE || (biome === 'mountain' && tile !== TILE.FLOOR && tile !== TILE.WALL)) return noise(x, y, 23) < 0.2 ? '#cfdaea' : '#e6edf7';
  if (tile === TILE.ASH || tile === TILE.DEAD_TREE || tile === TILE.LAVA) return noise(x, y, 24) < 0.3 ? '#3e2f39' : '#4a3a44';
  if (tile === TILE.SAND || biome === 'desert' || biome === 'coast') return smoothNoise(x, y, 3, 25) < 0.45 ? '#cfae68' : '#dcc07e';
  if (tile === TILE.WALL) return '#3e3756';
  if (tile === TILE.FLOOR) return '#6c6580';
  if (tile === TILE.SOIL) return y % 2 ? '#5f3b1f' : '#7a4f2c';
  return grassColor(x, y);
}

function paintGround(ctx, x, y) {
  const tile = tileOf(x, y);
  if (tile === TILE.WATER) {
    paintWater(ctx, x, y);
    return;
  }
  rect(ctx, x * P, y * P, P, P, groundColor(x, y, tile));
  if (tile === TILE.BRIDGE) rect(ctx, x * P, y * P + 2, P, 1, '#5a3a1e');
  if (tile === TILE.LAVA) {
    rect(ctx, x * P, y * P, P, P, '#d9481c');
    rect(ctx, x * P + 1, y * P + 1, 3, 3, '#ffa62b');
  }
  if (tile === TILE.FLOWER) rect(ctx, x * P + 2, y * P + 2, 2, 2, ['#ff6fa8', '#ffd84a', '#ffffff'][Math.floor(noise(x, y, 6) * 3)]);
  if (tile === TILE.ROOF) rect(ctx, x * P, y * P, P, P, x > 90 ? '#3f6fc6' : '#c8452f');
  if (tile === TILE.ROOF && y % 2 === 0) rect(ctx, x * P, y * P + P - 1, P, 1, x > 90 ? '#2b4f96' : '#932f20');
  if (tile === TILE.HOUSE) rect(ctx, x * P, y * P, P, P, '#efe2c3');
  if (tile === TILE.DOOR) {
    rect(ctx, x * P, y * P, P, P, '#efe2c3');
    rect(ctx, x * P + 2, y * P + 1, 2, P - 1, '#7a4a24');
  }
}

// ---------- What stands on the ground (painted after, so it can overlap the tile above) ----------

const TREE_SHAPE = ['.###.', '#####', '#####', '.###.'];

function paintShape(ctx, shape, left, top, color) {
  shape.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) if (row[dx] === '#') rect(ctx, left + dx, top + dy, 1, 1, color);
  });
}

function paintRoundTree(ctx, x, y, colors) {
  const left = x * P;
  const top = y * P - 1;
  rect(ctx, left + 2, top + 4, 1, 2, '#4a2f1a');
  paintShape(ctx, TREE_SHAPE, left, top, colors.dark);
  rect(ctx, left + 1, top + 1, 2, 1, colors.light);
  rect(ctx, left + 1, top, 1, 1, colors.top);
}

function paintPine(ctx, x, y) {
  const left = x * P;
  const top = y * P - 2;
  paintShape(ctx, ['..#..', '.###.', '.###.', '#####', '#####'], left, top, '#1d5c46');
  rect(ctx, left + 2, top, 1, 1, '#f4f8ff');
  rect(ctx, left + 1, top + 3, 1, 1, '#f4f8ff');
  rect(ctx, left + 2, top + 5, 1, 2, '#4a2f1a');
}

// A big snowy mountain, wider than a tile (on the rocks of Frostpeak Pass). The light comes from the left.
function paintPeak(ctx, x, y) {
  const height = 12 + Math.floor(noise(x, y, 27) * 6);
  const baseY = y * P + P;
  const centerX = x * P + 3;
  for (let row = 0; row < height; row++) {
    const half = Math.round((row + 1) * 0.75);
    const isSnow = row < height * 0.35;
    rect(ctx, centerX - half, baseY - height + row, half, 1, isSnow ? '#ffffff' : ROCK.light);
    rect(ctx, centerX, baseY - height + row, half + 1, 1, isSnow ? '#c9d6ea' : ROCK.dark);
  }
}

function paintRock(ctx, x, y, snowy) {
  paintShape(ctx, ['.##.', '####', '####'], x * P + 1, y * P + 2, ROCK.mid);
  rect(ctx, x * P + 2, y * P + 2, 1, 1, snowy ? '#ffffff' : ROCK.light);
}

function paintCactus(ctx, x, y) {
  rect(ctx, x * P + 2, y * P, 2, 6, '#3f9a4a');
  rect(ctx, x * P, y * P + 2, 2, 1, '#3f9a4a');
  rect(ctx, x * P + 4, y * P + 1, 2, 1, '#3f9a4a');
}

function paintDeadTree(ctx, x, y) {
  rect(ctx, x * P + 2, y * P, 1, 6, '#1b1218');
  rect(ctx, x * P + 1, y * P + 1, 1, 1, '#1b1218');
  rect(ctx, x * P + 3, y * P + 2, 2, 1, '#1b1218');
}

// On the map, a forest is drawn thicker than it is: more canopies, on the free grass too.
function isThickForest(x, y, tile) {
  return zoneAt(x, y).biome === 'forest' && (tile === TILE.GRASS || tile === TILE.FLOWER) && noise(x, y, 26) < 0.55;
}

function paintStanding(ctx, x, y) {
  const tile = tileOf(x, y);
  const biome = zoneAt(x, y).biome;
  if (isThickForest(x, y, tile)) paintRoundTree(ctx, x, y, FOREST);
  if (tile === TILE.TREE && biome === 'mountain') paintPine(ctx, x, y);
  else if (tile === TILE.TREE && biome === 'desert') paintCactus(ctx, x, y);
  else if (tile === TILE.TREE) paintRoundTree(ctx, x, y, biome === 'forest' ? FOREST : { ...FOREST, dark: '#2f7a35', light: '#5aa84a' });
  else if (tile === TILE.ROCK && biome === 'mountain' && noise(x, y, 5) >= 0.45) paintPeak(ctx, x, y); // not the ice crystals
  else if (tile === TILE.ROCK) paintRock(ctx, x, y, biome === 'mountain');
  else if (tile === TILE.DEAD_TREE) paintDeadTree(ctx, x, y);
}

// ---------- The strongholds: a castle, a tower and a fort drawn over their walls ----------

// A stone building with towers and battlements. zone: its rectangle. look: { stone, dark, flag }
function paintStronghold(ctx, zone, look) {
  const left = zone.x * P + 6;
  const width = zone.w * P - 12;
  const bottom = (zone.y + zone.h) * P - 4;
  const height = zone.h * P - 14;
  rect(ctx, left, bottom - height * 0.6, width, height * 0.6, look.stone);
  for (let x = left; x < left + width; x += 6) rect(ctx, x, bottom - height * 0.6 - 3, 3, 3, look.stone); // battlements
  [left, left + width / 2 - 6, left + width - 12].forEach((tx, i) => {
    const towerHeight = i === 1 ? height : height * 0.8;
    rect(ctx, tx, bottom - towerHeight, 12, towerHeight, look.stone);
    rect(ctx, tx + 8, bottom - towerHeight, 4, towerHeight, look.dark);
    rect(ctx, tx + 4, bottom - towerHeight + 6, 3, 4, '#ffd36b'); // a lit window
    rect(ctx, tx + 5, bottom - towerHeight - 6, 1, 6, '#2a1f2e'); // the pole of the flag
    rect(ctx, tx + 6, bottom - towerHeight - 6, 4, 3, look.flag);
  });
  rect(ctx, left + width / 2 - 4, bottom - 10, 8, 10, '#1c1726'); // the door
}

const STRONGHOLDS = {
  castle: { stone: '#3a3346', dark: '#251f2e', flag: '#e8423f' },
  tower: { stone: '#9aa6c0', dark: '#6d7a94', flag: '#ffd23f' },
  fort: { stone: '#8a7f74', dark: '#5f564d', flag: '#c8452f' },
  crypt: { stone: '#5a5468', dark: '#3a3448', flag: '#8a3fd1' },
};

function paintWorld() {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_SIZE * P;
  canvas.height = MAP_SIZE * P;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) paintGround(ctx, x, y);
  }
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) paintStanding(ctx, x, y);
  }
  Object.entries(STRONGHOLDS).forEach(([id, look]) => paintStronghold(ctx, zoneOf(id), look));
  return canvas;
}

function worldPainting() {
  return once('worldPainting', paintWorld);
}

// ---------- The compass ----------

function compass() {
  return once('compass', () => {
    const grid = makeGrid(27, 27);
    fillEllipse(grid, 13.5, 13.5, 11, 11, '#c9961e');
    fillEllipse(grid, 13.5, 13.5, 9.5, 9.5, '#1c2448');
    const gold = '#ffd86b';
    for (let i = 0; i <= 10; i++) {
      const w = Math.max(0, 2 - Math.floor(i / 4));
      drawLine(grid, 13 - w, 3 + i, 13 + w, 3 + i, i < 6 ? '#ff5a5a' : gold); // north (red) and south
      drawLine(grid, 13 - w, 23 - i, 13 + w, 23 - i, gold);
      drawLine(grid, 3 + i, 13 - Math.min(w, 1), 3 + i, 13 + Math.min(w, 1), gold); // west and east
      drawLine(grid, 23 - i, 13 - Math.min(w, 1), 23 - i, 13 + Math.min(w, 1), gold);
    }
    return toCanvas(addOutline(grid, '#0e1430'));
  });
}

// ---------- Drawing a view of the map ----------

// view: { cx, cy, zoom } (the middle, in tiles, and the zoom: 1 = the whole world). size: the square, in pixels.
// Returns the frame: which tiles are on screen, and how many pixels per tile.
function frameOf(view, size) {
  const visible = MAP_SIZE / view.zoom;
  const left = Math.min(MAP_SIZE - visible, Math.max(0, view.cx - visible / 2));
  const top = Math.min(MAP_SIZE - visible, Math.max(0, view.cy - visible / 2));
  return { left: left, top: top, visible: visible, scale: size / visible, size: size };
}

// A tile -> the pixel on screen.
function toScreen(frame, x, y) {
  return { x: (x - frame.left) * frame.scale, y: (y - frame.top) * frame.scale };
}

// The unknown blocks: a dark night-blue fog, with lighter specks like clouds.
function drawFog(ctx, game, frame) {
  const size = BLOCK * frame.scale;
  for (let by = 0; by < BLOCKS; by++) {
    for (let bx = 0; bx < BLOCKS; bx++) {
      if (isBlockKnown(game, bx, by)) continue;
      const corner = toScreen(frame, bx * BLOCK, by * BLOCK);
      const puff = size * 0.12; // the fog spills a bit over the known land: rounder edges
      ctx.fillStyle = '#141a33';
      ctx.beginPath();
      ctx.roundRect(corner.x - puff, corner.y - puff, size + puff * 2, size + puff * 2, size * 0.35);
      ctx.fill();
      for (let i = 0; i < 6; i++) {
        const dx = noise(bx, by, i) * size;
        const dy = noise(by, bx, i + 9) * size;
        rect(ctx, corner.x + dx, corner.y + dy, Math.max(2, size / 6), Math.max(1, size / 14), '#1f2848');
      }
    }
  }
}

// A small picture (an icon) centered on a tile. bob: moves it up and down a bit.
function drawMark(ctx, frame, name, x, y, size, bob = 0) {
  const at = toScreen(frame, x, y);
  ctx.drawImage(iconCanvas(name), Math.round(at.x - size / 2), Math.round(at.y - size / 2 + bob), size, size);
}

function roundBox(ctx, x, y, w, h, fill, border) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// The name of a place in a dark box, with its icon. Returns the box (to know which place is tapped).
function drawLabel(ctx, frame, place, isSelected) {
  const at = toScreen(frame, place.x, place.y);
  const isLand = place.kind === 'land';
  ctx.font = (isLand ? 11 : 12) + 'px "Pixelify Sans", monospace';
  const textWidth = ctx.measureText(place.name).width;
  const iconSize = place.icon ? 14 : 0;
  const w = textWidth + iconSize + (place.icon ? 14 : 10);
  const h = 20;
  const x = Math.min(frame.size - w - 2, Math.max(2, at.x - w / 2)); // the box never leaves the map
  const y = Math.min(frame.size - h - 2, Math.max(2, at.y - h / 2));
  const box = { x: Math.round(x), y: Math.round(y), w: w, h: h, place: place };
  roundBox(ctx, box.x, box.y, w, h, isLand ? 'rgba(14, 20, 48, 0.72)' : 'rgba(22, 30, 60, 0.94)', isSelected ? '#ffd86b' : isLand ? 'rgba(223, 228, 240, 0.5)' : '#dfe4f0');
  if (place.icon) ctx.drawImage(iconCanvas(place.icon), box.x + 4, box.y + 3, iconSize, iconSize);
  ctx.fillStyle = isLand ? '#ffe9a8' : '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(place.name, box.x + (place.icon ? iconSize + 8 : 5), box.y + h / 2 + 1);
  return box;
}

function drawPlaces(ctx, game, frame, view, selectedId) {
  const boxes = [];
  for (const place of PLACES) {
    const showLand = place.kind !== 'land' || view.zoom >= 2;
    if (showLand && isKnown(game, place.x, place.y)) boxes.push(drawLabel(ctx, frame, place, place.id === selectedId));
  }
  return boxes;
}

function drawMarks(ctx, game, frame, view, time) {
  const bob = Math.round(Math.sin(time * 4) * 2);
  if (view.zoom >= 2) SHOP_MARKS.filter((mark) => isKnown(game, mark.x, mark.y)).forEach((mark) => drawMark(ctx, frame, mark.icon, mark.x, mark.y, 14));
  if (game.player.mapLevel >= 3) {
    const size = view.zoom >= 2 ? 14 : 10;
    TREASURES.filter((treasure) => !game.dug[treasure.key]).forEach((treasure) => drawMark(ctx, frame, 'treasure', treasure.x + 0.5, treasure.y + 0.5, size));
  }
  blockedMarks(game).filter((mark) => isKnown(game, mark.x, mark.y)).forEach((mark) => drawMark(ctx, frame, 'blocked', mark.x, mark.y, 14));
  sideQuestMarks(game).forEach((mark) => drawMark(ctx, frame, 'sideQuest', mark.x, mark.y - 1.5, 14, bob));
  const main = mainQuestMark(game);
  if (main) drawMark(ctx, frame, 'mainQuest', main.x, main.y - 2, 21, bob);
}

function drawPlayer(ctx, game, frame, time, size) {
  if (Math.sin(time * 6) < -0.6) return; // it blinks
  drawMark(ctx, frame, 'you', game.player.x, game.player.y, size);
}

// The world map. Returns the boxes of the place names that were drawn (to find the one tapped).
export function drawWorldMap(ctx, game, view, size, time, selectedId) {
  const frame = frameOf(view, size);
  ctx.imageSmoothingEnabled = frame.scale < P; // smaller than the painting: smooth, bigger: crisp pixels
  ctx.drawImage(worldPainting(), frame.left * P, frame.top * P, frame.visible * P, frame.visible * P, 0, 0, size, size);
  ctx.imageSmoothingEnabled = false;
  drawFog(ctx, game, frame);
  drawMarks(ctx, game, frame, view, time);
  const boxes = drawPlaces(ctx, game, frame, view, selectedId);
  drawPlayer(ctx, game, frame, time, 21);
  ctx.drawImage(compass(), size - 60, 22, 54, 54);
  ctx.font = 'bold 15px "Pixelify Sans", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#0e1430';
  ctx.strokeText('N', size - 33, 13);
  ctx.fillStyle = '#ffd86b';
  ctx.fillText('N', size - 33, 13);
  return boxes;
}

// The corner map of the HUD: the land around the player (32 tiles), in a square of `size` pixels.
export function drawMiniMap(ctx, game, size, time) {
  const view = { cx: game.player.x, cy: game.player.y, zoom: MAP_SIZE / 32 };
  const frame = frameOf(view, size);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(worldPainting(), frame.left * P, frame.top * P, frame.visible * P, frame.visible * P, 0, 0, size, size);
  ctx.imageSmoothingEnabled = false;
  drawFog(ctx, game, frame);
  for (const monster of game.run.monsters) {
    const at = toScreen(frame, monster.x, monster.y);
    rect(ctx, Math.round(at.x) - 2, Math.round(at.y) - 2, 4, 4, '#0e1430');
    rect(ctx, Math.round(at.x) - 1, Math.round(at.y) - 1, 2, 2, '#ff3040');
  }
  const main = mainQuestMark(game);
  if (main) drawMark(ctx, frame, 'mainQuest', main.x, main.y, 12);
  drawPlayer(ctx, game, frame, time, 14);
}

// Where to look first: centered on the player, zoomed in.
export function firstView(game) {
  return { cx: game.player.x, cy: game.player.y, zoom: 2 };
}

// The tile under a pixel of the map (to move the view by dragging).
export function tilesPerPixel(view, size) {
  return frameOf(view, size).visible / size;
}

// The view cannot go outside the world.
export function clampView(view) {
  const half = MAP_SIZE / view.zoom / 2;
  return { ...view, cx: Math.min(MAP_SIZE - half, Math.max(half, view.cx)), cy: Math.min(MAP_SIZE - half, Math.max(half, view.cy)) };
}
