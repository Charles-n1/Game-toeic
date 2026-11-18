import { zoneAt, dungeonOf, HOME_DOOR } from '../data/zones';
import { MAP_SIZE, TILE, TREASURES, tileAt } from '../world/map';
import { CELLS } from '../world/size';
import { paintedGround, paintedForest } from '../world/painting';
import paintedMapUrl from '../assets/world/map2.png';
import { BLOCKS, isBlockKnown, isKnown } from '../logic/explore';
import { PLACES, SHOP_MARKS, mainQuestMark, sideQuestMarks, blockedMarks } from '../logic/places';
import { ensureRealism } from '../logic/realism/state';
import { iconCanvas } from './icons';
import { makeGrid, fillEllipse, drawLine, addOutline, toCanvas, once } from './pixels';

// The world map: the high-detail painting of the world itself (art/MAP2.png).
// Until it is loaded, the cells of the painting are shown, one color each.
// Each frame draws a part of it, the fog on the places the player does not know yet, and the marks:
// places, quests, shops, the player. The corner map of the HUD shows the real tiles around the player.

const paintedMap = new Image();
paintedMap.src = paintedMapUrl;

// ---------- The painting ----------

const PAINT_SIZE = 2048; // the painting is drawn in a square of this many pixels
const CELL_COLORS = { water: '#1d4e94', grass: '#358034', sand: '#cc9b5a', snow: '#dde8f5', ash: '#332734', lava: '#ff6a1c', cliff: '#494758' };

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// While the painting is loading: the cells of the painting, one color each (and darker where trees grow).
function paintFromCells() {
  const canvas = document.createElement('canvas');
  canvas.width = CELLS;
  canvas.height = CELLS;
  const ctx = canvas.getContext('2d');
  for (let cy = 0; cy < CELLS; cy++) {
    for (let cx = 0; cx < CELLS; cx++) {
      rect(ctx, cx, cy, 1, 1, CELL_COLORS[paintedGround(cx, cy)]);
      if (paintedForest(cx, cy) > 0.4) rect(ctx, cx, cy, 1, 1, 'rgba(20, 60, 25, ' + paintedForest(cx, cy) * 0.6 + ')');
    }
  }
  return canvas;
}

// The painting, with the places drawn on it (a small sign for each village, a mark for each dungeon).
function paintFromArt() {
  const canvas = document.createElement('canvas');
  canvas.width = PAINT_SIZE;
  canvas.height = PAINT_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(paintedMap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function worldPainting() {
  if (paintedMap.complete && paintedMap.naturalWidth > 0) return once('worldArt', paintFromArt);
  return once('worldCells', paintFromCells);
}

// The part of the painting under a frame: [sx, sy, sw, sh] in pixels of the painting.
function paintingPart(painting, frame) {
  const k = painting.width / MAP_SIZE;
  return [frame.left * k, frame.top * k, frame.visible * k, frame.visible * k];
}

// Where the hero is on the island: inside a dungeon, at its door (inside the home, at the home).
function islandPosition(game) {
  const zone = zoneAt(game.player.x, game.player.y);
  if (zone.kind !== 'inside') return { x: game.player.x, y: game.player.y };
  if (zone.dungeon) return { x: dungeonOf(zone.dungeon).door[0] + 0.5, y: dungeonOf(zone.dungeon).door[1] + 0.5 };
  if (zone.id === 'visitHouse' && game.run?.visitHouse?.exit) return { x: game.run.visitHouse.exit.x, y: game.run.visitHouse.exit.y };
  return { x: HOME_DOOR.x + 0.5, y: HOME_DOOR.y + 1 };
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
  const isIsland = view.cy < MAP_SIZE; // (the corner map also shows the insides, under the island)
  const left = isIsland ? Math.min(MAP_SIZE - visible, Math.max(0, view.cx - visible / 2)) : view.cx - visible / 2;
  const top = isIsland ? Math.min(MAP_SIZE - visible, Math.max(0, view.cy - visible / 2)) : view.cy - visible / 2;
  return { left: left, top: top, visible: visible, scale: size / visible, size: size };
}

// A tile -> the pixel on screen.
function toScreen(frame, x, y) {
  return { x: (x - frame.left) * frame.scale, y: (y - frame.top) * frame.scale };
}

// The fog of the whole world: one pixel per block (dark = unknown), made again when the player explores.
let fogCanvas = null;
let fogOf = '';

function fogPicture(game) {
  const key = game.explored + game.player.mapLevel;
  if (fogCanvas && fogOf === key) return fogCanvas;
  fogCanvas = fogCanvas || document.createElement('canvas');
  fogCanvas.width = BLOCKS;
  fogCanvas.height = BLOCKS;
  const ctx = fogCanvas.getContext('2d');
  ctx.clearRect(0, 0, BLOCKS, BLOCKS);
  for (let by = 0; by < BLOCKS; by++) {
    for (let bx = 0; bx < BLOCKS; bx++) if (!isBlockKnown(game, bx, by)) rect(ctx, bx, by, 1, 1, '#141a33');
  }
  fogOf = key;
  return fogCanvas;
}

// The unknown blocks: a dark night-blue fog, soft on its edges (the small fog picture is stretched).
function drawFog(ctx, game, frame) {
  const fog = fogPicture(game);
  const k = BLOCKS / MAP_SIZE;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(fog, frame.left * k, frame.top * k, frame.visible * k, frame.visible * k, 0, 0, frame.size, frame.size);
  ctx.imageSmoothingEnabled = false;
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

// Is this tile on the map shown? (the names of the places outside it are not written: they would pile up on the edges)
function isInFrame(frame, x, y) {
  return x >= frame.left && x <= frame.left + frame.visible && y >= frame.top && y <= frame.top + frame.visible;
}

function drawPlaces(ctx, game, frame, view, selectedId) {
  const boxes = [];
  for (const place of PLACES) {
    const showLand = place.kind !== 'land' || view.zoom >= 2;
    if (!showLand || !isInFrame(frame, place.x, place.y) || !isKnown(game, place.x, place.y)) continue;
    boxes.push(drawLabel(ctx, frame, place, place.id === selectedId));
  }
  return boxes;
}

function drawMarks(ctx, game, frame, view, time) {
  const bob = Math.round(Math.sin(time * 4) * 2);
  if (view.zoom >= 8) SHOP_MARKS.filter((mark) => isKnown(game, mark.x, mark.y)).forEach((mark) => drawMark(ctx, frame, mark.icon, mark.x, mark.y, 14));
  if (game.player.mapLevel >= 3) {
    const size = view.zoom >= 4 ? 14 : 8;
    TREASURES.filter((treasure) => !game.dug[treasure.key]).forEach((treasure) => drawMark(ctx, frame, 'treasure', treasure.x + 0.5, treasure.y + 0.5, size));
  }
  blockedMarks(game).filter((mark) => isKnown(game, mark.x, mark.y)).forEach((mark) => drawMark(ctx, frame, 'blocked', mark.x, mark.y, 14));
  if (game?.realism) {
    const r = ensureRealism(game);
    for (const cairn of r.world?.trailCairns || []) {
      if (isKnown(game, cairn.x, cairn.y)) drawMark(ctx, frame, 'stone', cairn.x, cairn.y, 8);
    }
    if (r.world?.lastDeathPos && r.world?.lastDeathBag) {
      drawMark(ctx, frame, 'travelerPack', r.world.lastDeathPos.x, r.world.lastDeathPos.y, 16, bob);
    }
  }
  sideQuestMarks(game).forEach((mark) => drawMark(ctx, frame, 'sideQuest', mark.x, mark.y - 1.5, 14, bob));
  const main = mainQuestMark(game);
  if (main) drawMark(ctx, frame, 'mainQuest', main.x, main.y - 2, 21, bob);
}

function drawPlayer(ctx, game, frame, time, size) {
  if (Math.sin(time * 6) < -0.6) return; // it blinks
  const at = islandPosition(game);
  drawMark(ctx, frame, 'you', at.x, at.y, size);
}

// The world map. Returns the boxes of the place names that were drawn (to find the one tapped).
export function drawWorldMap(ctx, game, view, size, time, selectedId) {
  const frame = frameOf(view, size);
  const painting = worldPainting();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(painting, ...paintingPart(painting, frame), 0, 0, size, size);
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

// ---------- The corner map of the HUD: the real tiles around the player ----------

const MINI_TILES = 64; // the corner map shows 64 x 64 tiles
const MINI_COLORS = {
  [TILE.GRASS]: '#358034', [TILE.FLOWER]: '#6cbd4b', [TILE.PATH]: '#9c6e44', [TILE.SAND]: '#cc9b5a', [TILE.WATER]: '#22589c',
  [TILE.TREE]: '#1c4a26', [TILE.ROCK]: '#6e6c82', [TILE.STONE]: '#dde8f5', [TILE.ASH]: '#332734', [TILE.LAVA]: '#ff6a1c',
  [TILE.DEAD_TREE]: '#362428', [TILE.WALL]: '#35304c', [TILE.FLOOR]: '#6a627c', [TILE.ROOF]: '#8a2a2c', [TILE.HOUSE]: '#c8b494',
  [TILE.DOOR]: '#4a2b14', [TILE.SOIL]: '#5f3b22', [TILE.BRIDGE]: '#7c4e2a', [TILE.CLIFF]: '#494758', [TILE.VOID]: '#0b0a14',
  [TILE.STAIRS]: '#ffd86b', [TILE.ORE]: '#52a3d8', [TILE.WOOD_FLOOR]: '#8c5e36', [TILE.RUG]: '#8c2832',
};
let miniCanvas = null;
let miniOf = '';

// The tiles around (x, y), one pixel each (made again when the player has walked a few tiles).
function miniTiles(x, y) {
  const left = Math.floor(x / 4) * 4 - MINI_TILES / 2;
  const top = Math.floor(y / 4) * 4 - MINI_TILES / 2;
  const key = left + ',' + top;
  if (miniCanvas && miniOf === key) return { canvas: miniCanvas, left: left, top: top };
  miniCanvas = miniCanvas || document.createElement('canvas');
  miniCanvas.width = MINI_TILES;
  miniCanvas.height = MINI_TILES;
  const ctx = miniCanvas.getContext('2d');
  for (let ty = 0; ty < MINI_TILES; ty++) {
    for (let tx = 0; tx < MINI_TILES; tx++) rect(ctx, tx, ty, 1, 1, MINI_COLORS[tileAt(left + tx, top + ty)] || '#000');
  }
  miniOf = key;
  return { canvas: miniCanvas, left: left, top: top };
}

// The corner map of the HUD: the land around the player, in a square of `size` pixels.
export function drawMiniMap(ctx, game, size, time) {
  const at = { x: game.player.x, y: game.player.y };
  const mini = miniTiles(at.x, at.y);
  const view = { cx: at.x, cy: at.y, zoom: MAP_SIZE / 48 };
  const frame = frameOf(view, size);
  ctx.imageSmoothingEnabled = false;
  const k = size / frame.visible; // screen pixels per tile
  ctx.fillStyle = '#0b0d18';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(mini.canvas, (mini.left - frame.left) * k, (mini.top - frame.top) * k, MINI_TILES * k, MINI_TILES * k);
  if (zoneAt(at.x, at.y).kind !== 'inside') drawFog(ctx, game, frame);
  for (const monster of game.run.monsters) {
    const spot = toScreen(frame, monster.x, monster.y);
    if (spot.x < 0 || spot.y < 0 || spot.x > size || spot.y > size) continue;
    rect(ctx, Math.round(spot.x) - 2, Math.round(spot.y) - 2, 4, 4, '#0e1430');
    rect(ctx, Math.round(spot.x) - 1, Math.round(spot.y) - 1, 2, 2, '#ff3040');
  }
  const main = mainQuestMark(game);
  if (main) drawMark(ctx, frame, 'mainQuest', main.x, main.y, 12);
  if (Math.sin(time * 6) >= -0.6) drawMark(ctx, frame, 'you', at.x, at.y, 14);
}

// Where to look first: centered on the player, zoomed in.
export function firstView(game) {
  const at = islandPosition(game);
  return { cx: at.x, cy: at.y, zoom: 8 };
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
