import { ZONES, centerOf } from '../data/zones';
import { MAP_SIZE, TILE, tileAt, TREASURES } from '../world/map';
import { rect, circle, outlinedText } from './shapes';

// The map of the world. How precise it is depends on the map the player bought:
//   no map: big blurry blocks.  Village Map: finer + the villages.  Region Map: finer + the dungeons.
//   Treasure Map: every tile + the buried treasures.

const BLOCK_BY_LEVEL = [10, 5, 2, 1]; // the size of one "pixel" of the map, in tiles
const COLORS = {
  [TILE.GRASS]: '#62b052',
  [TILE.FLOWER]: '#7cc46a',
  [TILE.PATH]: '#dcc48f',
  [TILE.SAND]: '#ecdca4',
  [TILE.WATER]: '#3f93d8',
  [TILE.TREE]: '#2f7d3a',
  [TILE.ROCK]: '#7c766f',
  [TILE.STONE]: '#a29a90',
  [TILE.ASH]: '#4b4050',
  [TILE.LAVA]: '#d9481c',
  [TILE.DEAD_TREE]: '#2a2230',
  [TILE.WALL]: '#3d3654',
  [TILE.FLOOR]: '#6d6684',
  [TILE.ROOF]: '#c24a3d',
  [TILE.HOUSE]: '#f0e3c6',
  [TILE.DOOR]: '#8a5a2b',
  [TILE.SOIL]: '#7b5331',
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
      rect(ctx, x, y, block, block, COLORS[tileAt(x + block / 2, y + block / 2)]);
    }
  }
  pictures[level] = canvas;
  return canvas;
}

function drawZoneNames(ctx, level, scale) {
  for (const zone of ZONES) {
    const isShown = (zone.kind === 'village' && level >= 1) || level >= 2;
    const center = centerOf(zone);
    if (isShown) outlinedText(ctx, zone.name, center.x * scale, center.y * scale, zone.kind === 'land' ? 11 : 10, zone.kind === 'land' ? '#ffffff' : '#ffe9a8');
  }
}

function drawMarks(ctx, game, level, scale) {
  for (const zone of ZONES) {
    const center = centerOf(zone);
    if (zone.kind === 'village' && level >= 1) circle(ctx, center.x * scale, center.y * scale - 10, 4, '#ffe9a8');
    if (zone.guard && level >= 2) circle(ctx, center.x * scale, center.y * scale - 10, 4, '#ff5a6e');
  }
  if (level >= 3) {
    TREASURES.filter((treasure) => !game.dug[treasure.key]).forEach((treasure) => circle(ctx, treasure.x * scale, treasure.y * scale, 2.5, '#ffd23f'));
  }
}

function drawPlayerDot(ctx, x, y, time) {
  circle(ctx, x, y, 5 + Math.sin(time * 5), 'rgba(255, 255, 255, 0.5)');
  circle(ctx, x, y, 3, '#ff3b6b');
}

// The whole world, in a square of `size` pixels.
export function drawWorldMap(ctx, game, size, time) {
  const level = game.player.mapLevel;
  const scale = size / MAP_SIZE;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(pictureOf(level), 0, 0, size, size);
  drawMarks(ctx, game, level, scale);
  drawZoneNames(ctx, level, scale);
  drawPlayerDot(ctx, game.player.x * scale, game.player.y * scale, time);
}

// The corner map: only what is around the player (`view` tiles wide), in a square of `size` pixels.
export function drawMiniMap(ctx, game, size, time) {
  const view = 44;
  const scale = size / view;
  const left = game.player.x - view / 2;
  const top = game.player.y - view / 2;
  rect(ctx, 0, 0, size, size, COLORS[TILE.WATER]);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(pictureOf(game.player.mapLevel), left, top, view, view, 0, 0, size, size);
  for (const monster of game.run.monsters) {
    circle(ctx, (monster.x - left) * scale, (monster.y - top) * scale, monster.raid ? 3 : 2, '#ff3030');
  }
  drawPlayerDot(ctx, size / 2, size / 2, time);
}
