import { rect, circle, ellipse, triangle, roundRect, line } from './shapes';

// How a person is drawn. A "look" is: { skin, hair, style, eyes, outfit, trim, + small / ears / horns / beard }
// style (the hair): 'short' | 'long' | 'twin' | 'pony' | 'bun' | 'bald'

// ---------- The small person walking on the map ----------

// The hair that falls behind the body (drawn before the body, or after it when the person shows their back).
function drawBackHair(ctx, look, headY) {
  if (look.style === 'long') roundRect(ctx, -9, headY - 4, 18, 22, 6, look.hair);
  if (look.style === 'twin') {
    ellipse(ctx, -11, headY + 6, 4, 9, look.hair);
    ellipse(ctx, 11, headY + 6, 4, 9, look.hair);
  }
  if (look.style === 'pony') ellipse(ctx, 9, headY + 5, 4, 9, look.hair);
  if (look.style === 'bun') circle(ctx, 0, headY - 10, 5, look.hair);
}

function drawHead(ctx, look, headY, dir) {
  circle(ctx, 0, headY, 8, look.skin);
  if (look.style !== 'bald') {
    ctx.fillStyle = look.hair;
    ctx.beginPath();
    ctx.arc(0, headY - 1, 8.6, Math.PI, Math.PI * 2); // the top of the hair
    ctx.fill();
    rect(ctx, -8.6, headY - 2, 17.2, 3, look.hair); // the fringe
  }
  if (dir === 'up') {
    if (look.style !== 'bald') circle(ctx, 0, headY, 8.6, look.hair); // seen from behind: only hair
    return;
  }
  const eyes = dir === 'left' ? [-4] : dir === 'right' ? [4] : [-3, 3];
  eyes.forEach((x) => rect(ctx, x - 1, headY + 1, 2, 3.5, look.eyes));
  if (look.beard) ellipse(ctx, 0, headY + 7, 5, 3.5, look.hair);
}

function drawExtras(ctx, look, headY) {
  if (look.ears) {
    triangle(ctx, -8, headY - 6, -3, headY - 8, -7, headY - 15, look.hair);
    triangle(ctx, 8, headY - 6, 3, headY - 8, 7, headY - 15, look.hair);
  }
  if (look.horns) {
    triangle(ctx, -7, headY - 6, -3, headY - 7, -8, headY - 14, '#2a2030');
    triangle(ctx, 7, headY - 6, 3, headY - 7, 8, headY - 14, '#2a2030');
  }
}

// x, y: where the feet are, in pixels. step: grows while walking (the legs move with it).
export function drawPerson(ctx, look, x, y, dir = 'down', step = 0, scale = 1) {
  const size = (look.small ? 0.75 : 1) * scale;
  const swing = Math.sin(step) * 2.5;
  const bounce = Math.abs(Math.sin(step)) * 1.5;
  const headY = -27 - bounce;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ellipse(ctx, 0, 0, 9, 3.5, 'rgba(0, 0, 0, 0.25)'); // the shadow
  rect(ctx, -5, -7, 4, 7 + swing * 0.6, '#3a3a4a'); // the legs
  rect(ctx, 1, -7, 4, 7 - swing * 0.6, '#3a3a4a');
  if (dir !== 'up') drawBackHair(ctx, look, headY);
  roundRect(ctx, -7, -20 - bounce, 14, 15, 4, look.outfit); // the body
  rect(ctx, -7, -10 - bounce, 14, 2.5, look.trim); // the belt
  drawHead(ctx, look, headY, dir);
  if (dir === 'up') drawBackHair(ctx, look, headY);
  drawExtras(ctx, look, headY);
  ctx.restore();
}

// ---------- The big face shown when someone talks ----------

// One anime eye: white, a big colored iris, a pupil, and two lights.
function drawBigEye(ctx, x, y, color) {
  ellipse(ctx, x, y, 9, 11, '#ffffff');
  ellipse(ctx, x, y + 1, 7, 9.5, color);
  ellipse(ctx, x, y + 2, 3.5, 5.5, '#1a1a24');
  circle(ctx, x - 2.5, y - 3.5, 2.6, '#ffffff');
  circle(ctx, x + 3, y + 4, 1.3, '#ffffff');
  line(ctx, x - 9, y - 9, x + 9, y - 10, '#2a2030', 2.5); // the eyelash
}

function drawPortraitHairBack(ctx, look) {
  if (look.style === 'long') roundRect(ctx, 12, 26, 76, 80, 26, look.hair);
  if (look.style === 'twin') {
    ellipse(ctx, 10, 66, 10, 30, look.hair);
    ellipse(ctx, 90, 66, 10, 30, look.hair);
  }
  if (look.style === 'pony') ellipse(ctx, 88, 62, 10, 30, look.hair);
  if (look.style === 'bun') circle(ctx, 50, 10, 13, look.hair);
}

// The fringe: the top of the hair, with three locks falling on the forehead.
function drawPortraitFringe(ctx, look) {
  if (look.style === 'bald') return;
  ctx.fillStyle = look.hair;
  ctx.beginPath();
  ctx.arc(50, 46, 33, Math.PI, Math.PI * 2);
  ctx.fill();
  triangle(ctx, 17, 44, 38, 44, 24, 64, look.hair);
  triangle(ctx, 36, 44, 60, 44, 47, 60, look.hair);
  triangle(ctx, 58, 44, 83, 44, 76, 64, look.hair);
}

function drawPortraitExtras(ctx, look) {
  if (look.ears) {
    triangle(ctx, 18, 26, 38, 16, 22, -4, look.hair);
    triangle(ctx, 82, 26, 62, 16, 78, -4, look.hair);
    triangle(ctx, 22, 20, 33, 16, 24, 4, '#ffd9e6');
    triangle(ctx, 78, 20, 67, 16, 76, 4, '#ffd9e6');
  }
  if (look.horns) {
    triangle(ctx, 20, 28, 34, 18, 12, 0, '#2a2030');
    triangle(ctx, 80, 28, 66, 18, 88, 0, '#2a2030');
  }
  if (look.beard) ellipse(ctx, 50, 84, 22, 14, look.hair);
}

// Draws the face in a square of `size` pixels, from the top-left corner of the canvas.
export function drawPortrait(ctx, look, size) {
  ctx.save();
  ctx.scale(size / 100, size / 100); // everything below is written for a 100 x 100 square
  drawPortraitHairBack(ctx, look);
  roundRect(ctx, 24, 88, 52, 20, 8, look.outfit); // the shoulders
  rect(ctx, 44, 78, 12, 14, look.skin); // the neck
  ellipse(ctx, 50, 52, 30, 33, look.skin); // the face
  drawBigEye(ctx, 36, 56, look.eyes);
  drawBigEye(ctx, 64, 56, look.eyes);
  ellipse(ctx, 25, 68, 6, 3.5, 'rgba(255, 120, 150, 0.45)'); // the blush
  ellipse(ctx, 75, 68, 6, 3.5, 'rgba(255, 120, 150, 0.45)');
  ctx.strokeStyle = '#a0524a'; // the smile
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(50, 71, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  drawPortraitExtras(ctx, look);
  drawPortraitFringe(ctx, look);
  ctx.restore();
}

// ---------- The obsidian friends ----------

export function drawSoldier(ctx, x, y, step) {
  const bounce = Math.abs(Math.sin(step)) * 1.5;
  ctx.save();
  ctx.translate(x, y);
  ellipse(ctx, 0, 0, 8, 3, 'rgba(0, 0, 0, 0.25)');
  roundRect(ctx, -6, -19 - bounce, 12, 19, 3, '#1b1528');
  triangle(ctx, -6, -18 - bounce, 6, -18 - bounce, 0, -31 - bounce, '#2c2342'); // a pointed helmet
  rect(ctx, -3, -17 - bounce, 6, 2, '#b48cff'); // the eyes: one line of light
  line(ctx, 8, -22 - bounce, 8, -4 - bounce, '#4a3b7a', 2); // a spear
  ctx.restore();
}

export function drawCat(ctx, x, y, step) {
  const bounce = Math.abs(Math.sin(step)) * 1;
  ctx.save();
  ctx.translate(x, y);
  ellipse(ctx, 0, 0, 6, 2.5, 'rgba(0, 0, 0, 0.25)');
  ellipse(ctx, 0, -5 - bounce, 6, 4.5, '#1b1528');
  circle(ctx, 5, -9 - bounce, 4, '#1b1528');
  triangle(ctx, 2, -11 - bounce, 4, -16 - bounce, 6, -12 - bounce, '#1b1528');
  triangle(ctx, 5, -12 - bounce, 8, -16 - bounce, 9, -11 - bounce, '#1b1528');
  rect(ctx, 4, -10 - bounce, 1.5, 1.5, '#b48cff');
  rect(ctx, 6.5, -10 - bounce, 1.5, 1.5, '#b48cff');
  line(ctx, -6, -5 - bounce, -10, -12 - bounce, '#1b1528', 2); // the tail
  ctx.restore();
}
