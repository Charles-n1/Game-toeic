import { makeGrid, dot, fillRect, fillEllipse, drawLine, addOutline, toCanvas, once } from './pixels';
import { OUTLINE, STONE_RAMP } from './palette';
import { TILE_PX } from './tiles';
import { WILD_STRUCTURES } from '../data/zones';
import { isCursed } from '../logic/isekai/curses';
import { isStarNight, isBloodMoonNight } from '../logic/isekai/events';

// The pictures and the animations of the isekai side of the world (see logic/isekai/): the hot springs and
// their steam, the graves of the Lost Hero, the fallen stars, the aura of a curse, the sky of the events.

const T = TILE_PX;
const STAR_FALL_MS = 700; // a star takes this long to fall from the sky

function sprite(canvas, ax, ay) {
  return { canvas: canvas, ax: ax, ay: ay };
}

// ---------- The pictures ----------

// A pool of hot water in a ring of stones. frame (0 to 2): the light moves on the water.
export function hotSpring(frame = 0) {
  return once('hotSpring|' + (frame % 3), () => {
    const grid = makeGrid(66, 46);
    fillEllipse(grid, 33, 24, 31, 19, STONE_RAMP[1]); // the ring of stones
    fillEllipse(grid, 33, 23, 29, 17, STONE_RAMP[3]);
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      fillEllipse(grid, 33 + Math.cos(angle) * 28, 23 + Math.sin(angle) * 16, 4, 3, STONE_RAMP[2 + (i % 3)]);
    }
    fillEllipse(grid, 33, 23, 24, 13, '#2aa7b8'); // the water
    fillEllipse(grid, 31, 21, 20, 10, '#4fd0d8');
    fillEllipse(grid, 29, 19, 12, 5, '#8ff0ec');
    for (let i = 0; i < 6; i++) {
      const x = 16 + ((i * 11 + frame * 4) % 34);
      const y = 16 + ((i * 7 + frame * 3) % 14);
      dot(grid, x, y, '#ffffff');
      dot(grid, x + 1, y, '#d8fffb');
    }
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 33, 44);
  });
}

// The grave of a friend of the Lost Hero: an old sword planted in the stone, flowers, a pale glow (frame 0 or 1).
export function heroGrave(frame = 0) {
  return once('heroGrave|' + (frame % 2), () => {
    const grid = makeGrid(20, 34);
    fillEllipse(grid, 10, 29, 9, 4, '#5a4228'); // the mound
    fillEllipse(grid, 10, 28, 7, 3, '#3e6b34');
    fillRect(grid, 4, 20, 12, 8, STONE_RAMP[2]); // the stone
    fillRect(grid, 5, 19, 10, 2, STONE_RAMP[4]);
    drawLine(grid, 10, 2, 10, 21, '#c9d1e0'); // the blade
    drawLine(grid, 11, 3, 11, 20, '#8a94a8');
    fillRect(grid, 6, 8, 9, 2, '#a0683a'); // the guard
    fillRect(grid, 9, 4, 3, 4, '#6b3e1f'); // the grip
    dot(grid, 10, 2, frame ? '#ffffff' : '#cfe3ff');
    dot(grid, 4, 29, '#ff9ec4'); // flowers
    dot(grid, 6, 30, '#ffd23f');
    dot(grid, 15, 29, '#ffffff');
    return sprite(toCanvas(addOutline(grid, OUTLINE)), 10, 32);
  });
}

// A fallen star, still warm (frame 0 or 1: it twinkles).
function fallenStar(frame = 0) {
  return once('fallenStar|' + (frame % 2), () => {
    const grid = makeGrid(11, 11);
    const light = frame ? '#ffffff' : '#fff6b0';
    fillRect(grid, 5, 1, 1, 9, '#ffd23f');
    fillRect(grid, 1, 5, 9, 1, '#ffd23f');
    fillRect(grid, 4, 4, 3, 3, light);
    dot(grid, 5, 5, '#ffffff');
    return sprite(toCanvas(grid), 5, 8);
  });
}

// ---------- The animations (painted in the buffer, see draw/scene.js) ----------

function isNear(view, x, y) {
  return x * T > view.x - 80 && x * T < view.x + view.width + 80 && y * T > view.y - 80 && y * T < view.y + view.height + 120;
}

// The steam of the hot springs: soft white puffs, rising and fading.
function drawSpringSteam(ctx, view, time) {
  for (const spring of WILD_STRUCTURES.filter((place) => place.kind === 'hotSpring' && isNear(view, place.x, place.y))) {
    for (let i = 0; i < 9; i++) {
      const life = (time * 0.18 + i / 9) % 1;
      const size = 3 + Math.round(life * 6);
      const x = (spring.x - 1.6 + (i % 5) * 0.8) * T + Math.sin(time * 1.3 + i) * 5 - view.x;
      const y = (spring.y + 0.6) * T - life * 40 - view.y;
      ctx.fillStyle = 'rgba(240, 248, 255, ' + (0.42 * (1 - life)).toFixed(2) + ')';
      ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
    }
  }
}

// The fallen stars: first a streak from the sky, then a twinkling star on the ground.
function drawFallenStars(ctx, game, view, time) {
  const now = Date.now();
  for (const star of game.run.fallenStars) {
    const age = now - star.at;
    const x = Math.round(star.x * T - view.x);
    const y = Math.round(star.y * T - view.y);
    if (age < STAR_FALL_MS) {
      const part = age / STAR_FALL_MS;
      const headX = x + Math.round((1 - part) * 60);
      const headY = y - Math.round((1 - part) * 120);
      ctx.strokeStyle = 'rgba(255, 246, 176, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX + 12, headY - 24);
      ctx.lineTo(headX, headY);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX - 1, headY - 1, 3, 3);
      continue;
    }
    const picture = fallenStar(Math.floor(time * 4) % 2);
    ctx.drawImage(picture.canvas, x - picture.ax, y - picture.ay - Math.round(Math.sin(time * 3) * 1.5));
  }
}

// A curse: dark purple wisps turning slowly around the hero.
function drawCurseAura(ctx, game, view, time) {
  if (!isCursed(game)) return;
  for (let i = 0; i < 6; i++) {
    const angle = time * 1.5 + (i / 6) * Math.PI * 2;
    const rise = (time * 0.5 + i / 6) % 1;
    const x = game.player.x * T + Math.cos(angle) * 9 - view.x;
    const y = game.player.y * T - 6 - rise * 22 + Math.sin(angle) * 3 - view.y;
    ctx.fillStyle = i % 2 ? 'rgba(138, 60, 255, 0.7)' : 'rgba(60, 20, 90, 0.75)';
    ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
  }
}

// Everything above, in one call (after the people, before the weather).
export function drawIsekaiEffects(ctx, game, view, time) {
  drawSpringSteam(ctx, view, time);
  drawFallenStars(ctx, game, view, time);
  drawCurseAura(ctx, game, view, time);
}

// The lights of the isekai things: the fallen stars glow (in screen pixels of the buffer, see draw/lights.js).
export function isekaiLights(game, view, time) {
  return game.run.fallenStars.map((star) => ({ x: star.x * T - view.x, y: star.y * T - 4 - view.y, radius: 30 + Math.round(Math.sin(time * 4) * 3), warm: true }));
}

// ---------- The sky of the events (painted over everything, see draw/weather.js) ----------

// The Night of Falling Stars: streaks crossing the sky.
export function drawStarShower(ctx, game, width, height, time) {
  if (!isStarNight(game)) return;
  for (let i = 0; i < 5; i++) {
    const life = (time * 0.35 + i * 0.37) % 1;
    if (life > 0.4) continue;
    const startX = ((i * 97) % width) + 40;
    const x = startX - life * 160;
    const y = ((i * 53) % (height * 0.5)) + life * 90;
    ctx.strokeStyle = 'rgba(255, 246, 200, ' + (0.8 * (1 - life / 0.4)).toFixed(2) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(x), Math.round(y));
    ctx.lineTo(Math.round(x + 14), Math.round(y - 8));
    ctx.stroke();
  }
}

// The Blood Moon: the night is red.
export function bloodMoonTint(game) {
  return isBloodMoonNight(game) ? 'rgba(170, 20, 30, 0.2)' : null;
}
