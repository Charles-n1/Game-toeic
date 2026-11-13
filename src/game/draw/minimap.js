import { ZONES, centerOf } from '../data/zones';
import { MAP_SIZE, TILE, tileAt, TREASURES } from '../world/map';

// The map of the world. How precise it is depends on the map the player bought:
//   no map: big blurry blocks.  Village Map: finer + the villages.  Region Map: finer + the dungeons.
//   Treasure Map: every tile + the buried treasures.

const BLOCK_BY_LEVEL = [10, 5, 2, 1]; // the size of one "pixel" of the map, in tiles
const COLORS = {
  [TILE.GRASS]: '#5db84b',
  [TILE.FLOWER]: '#78c85a',
  [TILE.PATH]: '#d6b47c',
  [TILE.SAND]: '#ead49a',
  [TILE.WATER]: '#3b8fe0',
  [TILE.TREE]: '#2f7d3a',
  [TILE.ROCK]: '#8e8a93',
  [TILE.STONE]: '#e6edf7',
  [TILE.ASH]: '#55424f',
  [TILE.LAVA]: '#e8541c',
  [TILE.DEAD_TREE]: '#2e2330',
  [TILE.WALL]: '#3e3756',
  [TILE.FLOOR]: '#6c6580',
  [TILE.ROOF]: '#c8452f',
  [TILE.HOUSE]: '#f0e2c2',
  [TILE.DOOR]: '#a0683a',
  [TILE.SOIL]: '#7a4f2c',
};

const pictures = {}; // the picture of the world for each map level, drawn only once

// A small canvas with 1 pixel per tile. With a bad map, the tiles are grouped in big blocks of one color.
function pictureOf(level) {
  if (pictures[level]) return pictures[level];
  const block = BLOCK_BY_LEVEL[level];
  const canvas = document.createElement('canvas');
  canvas.width = MAP_SIZE;
  canvas.height = MAP_SIZE;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < MAP_SIZE; y += block) {
    for (let x = 0; x < MAP_SIZE; x += block) {
      ctx.fillStyle = COLORS[tileAt(x + block / 2, y + block / 2)];
      ctx.fillRect(x, y, block, block);
    }
  }
  pictures[level] = canvas;
  return canvas;
}

// A small square mark with a dark edge.
function mark(ctx, x, y, size, color) {
  ctx.fillStyle = '#0e1430';
  ctx.fillRect(Math.round(x - size / 2) - 1, Math.round(y - size / 2) - 1, size + 2, size + 2);
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
}

function write(ctx, text, x, y, color) {
  ctx.font = '12px "Pixelify Sans", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#0e1430';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawMarks(ctx, game, level, scale) {
  for (const zone of ZONES) {
    const center = centerOf(zone);
    if (zone.kind === 'village' && level >= 1) mark(ctx, center.x * scale, center.y * scale - 10, 6, '#ffd86b');
    if (zone.guard && level >= 2) mark(ctx, center.x * scale, center.y * scale - 10, 6, '#ff4f5e');
  }
  if (level >= 3) {
    TREASURES.filter((treasure) => !game.dug[treasure.key]).forEach((treasure) => mark(ctx, treasure.x * scale, treasure.y * scale, 3, '#ffd23f'));
  }
}

function drawZoneNames(ctx, level, scale) {
  for (const zone of ZONES) {
    const isShown = (zone.kind === 'village' && level >= 1) || level >= 2;
    const center = centerOf(zone);
    if (isShown) write(ctx, zone.name, center.x * scale, center.y * scale, zone.kind === 'land' ? '#ffffff' : '#ffe9a8');
  }
}

// The player: a white arrow-like mark that blinks.
function drawPlayer(ctx, x, y, time) {
  mark(ctx, x, y, Math.sin(time * 6) > 0 ? 6 : 4, '#ffffff');
}

// The whole world, in a square of `size` pixels.
export function drawWorldMap(ctx, game, size, time) {
  const level = game.player.mapLevel;
  const scale = size / MAP_SIZE;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(pictureOf(level), 0, 0, size, size);
  drawMarks(ctx, game, level, scale);
  drawZoneNames(ctx, level, scale);
  drawPlayer(ctx, game.player.x * scale, game.player.y * scale, time);
}

// The corner map: only what is around the player (`view` tiles wide), in a square of `size` pixels.
export function drawMiniMap(ctx, game, size, time) {
  const view = 40;
  const scale = size / view;
  const left = game.player.x - view / 2;
  const top = game.player.y - view / 2;
  ctx.fillStyle = COLORS[TILE.WATER];
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(pictureOf(game.player.mapLevel), left, top, view, view, 0, 0, size, size);
  for (const monster of game.run.monsters) {
    mark(ctx, (monster.x - left) * scale, (monster.y - top) * scale, monster.raid ? 4 : 3, '#ff3040');
  }
  drawPlayer(ctx, size / 2, size / 2, time);
}
