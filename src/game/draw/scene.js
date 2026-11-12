import { NPCS, npcOf, HERO_LOOK } from '../data/npcs';
import { MAP_SIZE, tileAt, CHESTS, TILE } from '../world/map';
import { isOutside } from '../logic/people';
import { activeQuestOf, offeredQuest, isQuestReady } from '../logic/quests';
import { cropAt, isCropReady, closestTreasure } from '../logic/farm';
import { darkness } from '../logic/clock';
import { TILE_SIZE, drawTile, drawCrop, drawChest, drawBarrier } from './tiles';
import { drawPerson, drawSoldier, drawCat } from './people';
import { drawMonster } from './monsters';
import { rect, circle, text, outlinedText } from './shapes';

// Draws the world around the player: the ground, everyone on it, the effects, and the light of the day.

const T = TILE_SIZE;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// The top-left corner of what is on screen, in pixels of the world. The player stays in the middle,
// except near the edges of the map.
function cameraOf(game, width, height) {
  const worldSize = MAP_SIZE * T;
  return {
    x: clamp(game.player.x * T - width / 2, 0, Math.max(0, worldSize - width)),
    y: clamp(game.player.y * T - height / 2, 0, Math.max(0, worldSize - height)),
  };
}

function drawGroundLayer(ctx, game, camera, width, height, time) {
  const firstX = Math.floor(camera.x / T);
  const firstY = Math.floor(camera.y / T);
  const lastX = Math.ceil((camera.x + width) / T);
  const lastY = Math.ceil((camera.y + height) / T);
  for (let y = firstY; y < lastY; y++) {
    for (let x = firstX; x < lastX; x++) {
      const tile = tileAt(x, y);
      drawTile(ctx, tile, x * T, y * T, x, y, time);
      const crop = tile === TILE.SOIL ? cropAt(game, x, y) : null;
      if (crop) drawCrop(ctx, x * T, y * T, isCropReady(game, crop));
    }
  }
}

function drawObjects(ctx, game) {
  CHESTS.forEach((chest) => drawChest(ctx, chest.x * T, chest.y * T, game.chests[chest.key] === true));
  game.run.barriers.forEach((barrier) => drawBarrier(ctx, barrier.x * T, barrier.y * T));
}

// The storm field: a circle of electric light on the ground.
function drawStorm(ctx, game, time) {
  const storm = game.run.storm;
  if (!storm) return;
  ctx.strokeStyle = 'rgba(159, 216, 255, ' + (0.5 + Math.sin(time * 10) * 0.3) + ')';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(storm.x * T, storm.y * T, storm.radius * T, 0, Math.PI * 2);
  ctx.stroke();
  circle(ctx, storm.x * T, storm.y * T, storm.radius * T, 'rgba(120, 180, 255, 0.12)');
}

// A treasure shines when the player is very close, or from far with the obsidian cat.
function drawTreasureHint(ctx, game, time) {
  const treasure = closestTreasure(game, game.player.pet ? 9 : 2.5);
  if (!treasure || Math.sin(time * 6) < 0) return;
  text(ctx, '✨', (treasure.x + 0.5) * T, (treasure.y + 0.5) * T, 16);
}

// The mark above someone who has a quest: ❗ = a new one, ✅ = ready to give back.
function questMark(game, npc) {
  const active = activeQuestOf(game, npc.id);
  if (active) return isQuestReady(game, active) ? '✅' : null;
  return offeredQuest(game, npc.id) ? '❗' : null;
}

function drawNpc(ctx, game, npc, time) {
  const place = game.run.people[npc.id];
  const mark = questMark(game, npc);
  drawPerson(ctx, npc.look, place.x * T, place.y * T, 'down', place.step);
  outlinedText(ctx, npc.name, place.x * T, place.y * T - 46, 10);
  if (mark) text(ctx, mark, place.x * T, place.y * T - 60 + Math.sin(time * 5) * 2, 14);
}

function drawFollower(ctx, follower) {
  const x = follower.x * T;
  const y = follower.y * T;
  if (follower.kind === 'soldier') drawSoldier(ctx, x, y, follower.step);
  else if (follower.kind === 'pet') drawCat(ctx, x, y, follower.step);
  else drawPerson(ctx, npcOf(follower.id).look, x, y, 'down', follower.step);
}

// A small bar under a wounded monster.
function drawMonsterHealth(ctx, monster) {
  if (monster.health >= monster.maxHealth) return;
  const x = monster.x * T - 12;
  const y = monster.y * T + 5;
  rect(ctx, x, y, 24, 4, 'rgba(0, 0, 0, 0.6)');
  rect(ctx, x, y, (24 * monster.health) / monster.maxHealth, 4, '#ff5a6e');
}

// Everyone, sorted from the top of the screen to the bottom: the ones in front hide the ones behind.
function drawEveryone(ctx, game, time) {
  const player = game.player;
  const drawings = [];
  for (const npc of NPCS.filter((item) => isOutside(game, item))) {
    drawings.push({ y: game.run.people[npc.id].y, draw: () => drawNpc(ctx, game, npc, time) });
  }
  for (const follower of game.run.followers) {
    drawings.push({ y: follower.y, draw: () => drawFollower(ctx, follower) });
  }
  for (const monster of game.run.monsters) {
    drawings.push({
      y: monster.y,
      draw: () => {
        drawMonster(ctx, monster, monster.x * T, monster.y * T, 1, time);
        drawMonsterHealth(ctx, monster);
      },
    });
  }
  drawings.push({ y: player.y, draw: () => drawPerson(ctx, HERO_LOOK, player.x * T, player.y * T, player.dir, player.step) });
  drawings.sort((a, b) => a.y - b.y).forEach((drawing) => drawing.draw());
}

function drawBalls(ctx, game) {
  for (const ball of game.run.balls) {
    circle(ctx, ball.x * T, ball.y * T - 12, 9, 'rgba(255, 255, 255, 0.35)');
    circle(ctx, ball.x * T, ball.y * T - 12, 6, ball.color);
  }
}

export function drawParticles(ctx, particles, unit) {
  for (const particle of particles) {
    ctx.globalAlpha = Math.max(0, 1 - particle.age / particle.life);
    if (particle.text) outlinedText(ctx, particle.text, particle.x * unit, particle.y * unit, particle.size, particle.color);
    else rect(ctx, particle.x * unit - particle.size / 2, particle.y * unit - particle.size / 2, particle.size, particle.size, particle.color);
  }
  ctx.globalAlpha = 1;
}

// The night: dark blue everywhere, except a soft light around the player.
function drawNight(ctx, game, camera, width, height) {
  const dark = darkness(game);
  if (dark === 0) return;
  const x = game.player.x * T - camera.x;
  const y = game.player.y * T - camera.y - 14;
  const light = ctx.createRadialGradient(x, y, 30, x, y, Math.max(width, height) * 0.6);
  light.addColorStop(0, 'rgba(12, 14, 60, ' + 0.12 * dark + ')');
  light.addColorStop(1, 'rgba(8, 8, 40, ' + 0.72 * dark + ')');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, width, height);
}

// Fireflies at night: small yellow dots that blink. They only depend on the time: nothing to remember.
function drawFireflies(ctx, game, width, height, time) {
  const dark = darkness(game);
  for (let i = 0; i < 14 * dark; i++) {
    const x = (Math.sin(i * 12.9898 + time * 0.2) * 0.5 + 0.5) * width;
    const y = (Math.sin(i * 78.233 + time * 0.15) * 0.5 + 0.5) * height;
    circle(ctx, x, y, 1.6, 'rgba(255, 240, 140, ' + (0.4 + Math.sin(time * 3 + i) * 0.4) + ')');
  }
}

// During a raid, the edges of the screen pulse in red. A thunder makes everything white for a moment.
function drawAlerts(ctx, game, width, height, time) {
  if (game.raid.active) {
    ctx.strokeStyle = 'rgba(255, 40, 40, ' + (0.35 + Math.sin(time * 4) * 0.2) + ')';
    ctx.lineWidth = 14;
    ctx.strokeRect(0, 0, width, height);
  }
  if (Date.now() < game.run.flashUntil) rect(ctx, 0, 0, width, height, 'rgba(255, 255, 255, 0.7)');
}

// width, height: the size of the canvas, in pixels. time: seconds since the game opened.
export function drawScene(ctx, game, width, height, time) {
  const camera = cameraOf(game, width, height);
  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
  drawGroundLayer(ctx, game, camera, width, height, time);
  drawObjects(ctx, game);
  drawStorm(ctx, game, time);
  drawTreasureHint(ctx, game, time);
  drawEveryone(ctx, game, time);
  drawBalls(ctx, game);
  drawParticles(ctx, game.run.particles, T);
  ctx.restore();

  drawNight(ctx, game, camera, width, height);
  drawFireflies(ctx, game, width, height, time);
  drawAlerts(ctx, game, width, height, time);
}
