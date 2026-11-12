import { typeOf } from '../data/types';
import { rect, circle, ellipse, triangle, roundRect, line, text, shade } from './shapes';

// How each monster is drawn. Its COLOR is its type (pink = gerunds, yellow = tenses...).
// Every shape is drawn around (0, 0) = its feet, in a box of about 30 pixels. t: seconds (it breathes, it flaps).

function eyes(ctx, y, gap, color = '#1a1a24') {
  rect(ctx, -gap - 1.5, y, 3, 4, color);
  rect(ctx, gap - 1.5, y, 3, 4, color);
}

function drawSlime(ctx, color, t) {
  const squish = Math.sin(t * 4) * 1.5;
  ellipse(ctx, 0, -8 + squish / 2, 12 + squish, 9 - squish, color);
  ellipse(ctx, -4, -12, 4, 2.5, shade(color, 0.5)); // the shine
  eyes(ctx, -9, 4);
}

function drawBat(ctx, color, t) {
  const flap = Math.sin(t * 14) * 7;
  triangle(ctx, -4, -16, -18, -22 - flap, -14, -10, shade(color, -0.25));
  triangle(ctx, 4, -16, 18, -22 - flap, 14, -10, shade(color, -0.25));
  circle(ctx, 0, -15, 6, color);
  triangle(ctx, -5, -19, -3, -25, -1, -20, color);
  triangle(ctx, 5, -19, 3, -25, 1, -20, color);
  eyes(ctx, -17, 2.5, '#ffffff');
}

function drawWolf(ctx, color, t) {
  const run = Math.sin(t * 8) * 2;
  rect(ctx, -9, -6, 3, 6 + run, shade(color, -0.4));
  rect(ctx, 5, -6, 3, 6 - run, shade(color, -0.4));
  ellipse(ctx, 0, -10, 12, 6, color);
  circle(ctx, 10, -15, 6, color);
  triangle(ctx, 6, -19, 8, -26, 11, -20, color);
  triangle(ctx, 11, -20, 14, -26, 15, -18, color);
  triangle(ctx, 14, -14, 20, -12, 14, -10, shade(color, -0.3)); // the muzzle
  line(ctx, -11, -11, -17, -17, color, 3); // the tail
  rect(ctx, 10, -17, 2.5, 2.5, '#1a1a24');
}

function drawWisp(ctx, color, t) {
  const float = Math.sin(t * 3) * 3;
  circle(ctx, 0, -14 + float, 11, shade(color, 0.6));
  circle(ctx, 0, -14 + float, 7, color);
  triangle(ctx, -5, -20 + float, 0, -32 + float, 5, -20 + float, shade(color, 0.3));
  eyes(ctx, -16 + float, 2.5, '#ffffff');
}

function drawTreant(ctx, color, t) {
  const sway = Math.sin(t * 2) * 1.5;
  rect(ctx, -6, -18, 12, 18, '#6b4526');
  circle(ctx, sway, -24, 13, shade(color, -0.2));
  circle(ctx, -5 + sway, -27, 7, color);
  eyes(ctx, -13, 3, '#ffe066');
  line(ctx, -6, -8, -14, -14, '#6b4526', 3);
  line(ctx, 6, -8, 14, -14, '#6b4526', 3);
}

function drawGolem(ctx, color, t) {
  const breath = Math.sin(t * 2);
  roundRect(ctx, -11, -20 + breath, 22, 20, 4, '#8a8279');
  roundRect(ctx, -7, -30 + breath, 14, 11, 3, '#9d958b');
  circle(ctx, 0, -10 + breath, 5, color); // the crystal heart
  circle(ctx, -1.5, -11.5 + breath, 1.8, shade(color, 0.6));
  eyes(ctx, -27 + breath, 3, color);
  rect(ctx, -16, -18 + breath, 5, 12, '#7a7269');
  rect(ctx, 11, -18 + breath, 5, 12, '#7a7269');
}

function drawImp(ctx, color, t) {
  const flap = Math.sin(t * 10) * 4;
  triangle(ctx, -5, -14, -15, -20 - flap, -9, -8, shade(color, -0.4));
  triangle(ctx, 5, -14, 15, -20 - flap, 9, -8, shade(color, -0.4));
  roundRect(ctx, -6, -14, 12, 14, 4, color);
  circle(ctx, 0, -19, 7, color);
  triangle(ctx, -6, -22, -3, -24, -7, -30, '#2a2030');
  triangle(ctx, 6, -22, 3, -24, 7, -30, '#2a2030');
  eyes(ctx, -20, 3, '#fff36b');
}

function drawKnight(ctx, color, t) {
  const breath = Math.sin(t * 2);
  triangle(ctx, -9, -20, 9, -20, 0, 2, shade(color, -0.3)); // the cape
  roundRect(ctx, -8, -22 + breath, 16, 20, 3, '#2c2a36');
  roundRect(ctx, -6, -32 + breath, 12, 11, 3, '#3a3846');
  rect(ctx, -4, -28 + breath, 8, 2, color); // the light in the helmet
  triangle(ctx, -2, -32 + breath, 2, -32 + breath, 0, -40 + breath, color); // the plume
  line(ctx, 12, -30, 12, -2, '#c9d1e0', 3); // the sword
}

function drawLich(ctx, color, t) {
  const float = Math.sin(t * 2) * 2;
  triangle(ctx, -11, 0, 11, 0, 0, -30 + float, '#3a2a55'); // the robe
  circle(ctx, 0, -27 + float, 7, '#ece7d8'); // the skull
  eyes(ctx, -29 + float, 2.5, color);
  line(ctx, 13, -32 + float, 13, 0, '#6b4526', 2); // the staff
  circle(ctx, 13, -34 + float, 4.5, color);
  circle(ctx, 13, -34 + float, 2, shade(color, 0.6));
}

function drawWarden(ctx, color, t) {
  roundRect(ctx, -10, -18, 20, 18, 3, '#5a5470');
  circle(ctx, 0, -28, 12, '#ece7d8'); // a clock for a head
  circle(ctx, 0, -28, 10, color);
  line(ctx, 0, -28, Math.cos(t * 3) * 8, -28 + Math.sin(t * 3) * 8, '#1a1a24', 2); // the fast hand
  line(ctx, 0, -28, Math.cos(t * 0.5) * 5, -28 + Math.sin(t * 0.5) * 5, '#1a1a24', 3); // the slow hand
}

function drawGeneral(ctx, color, t) {
  const breath = Math.sin(t * 2);
  triangle(ctx, -12, -22, 12, -22, 0, 3, '#8a1f1f'); // the red cape
  roundRect(ctx, -10, -24 + breath, 20, 23, 3, '#4a4654');
  rect(ctx, -10, -14 + breath, 20, 3, color);
  roundRect(ctx, -7, -35 + breath, 14, 12, 3, '#5a5664');
  rect(ctx, -5, -31 + breath, 10, 2.5, '#ff4040');
  triangle(ctx, -7, -35 + breath, -3, -35 + breath, -8, -43 + breath, color); // two horns on the helmet
  triangle(ctx, 7, -35 + breath, 3, -35 + breath, 8, -43 + breath, color);
  line(ctx, 15, -38, 15, 0, '#d9dee8', 4); // the great sword
}

function drawKing(ctx, color, t) {
  const float = Math.sin(t * 1.5) * 2;
  triangle(ctx, -15, 2, 15, 2, 0, -34 + float, '#14101e'); // the cloak
  triangle(ctx, -9, 0, 9, 0, 0, -26 + float, shade(color, -0.6));
  circle(ctx, 0, -30 + float, 8, '#d9d0e0');
  eyes(ctx, -32 + float, 3, color);
  triangle(ctx, -8, -34 + float, -4, -37 + float, -12, -47 + float, '#14101e'); // the horns
  triangle(ctx, 8, -34 + float, 4, -37 + float, 12, -47 + float, '#14101e');
  rect(ctx, -6, -40 + float, 12, 3, '#ffd23f'); // the crown
  triangle(ctx, -6, -40 + float, -3, -40 + float, -4.5, -45 + float, '#ffd23f');
  triangle(ctx, -1.5, -40 + float, 1.5, -40 + float, 0, -46 + float, '#ffd23f');
  triangle(ctx, 3, -40 + float, 6, -40 + float, 4.5, -45 + float, '#ffd23f');
}

const SHAPES = {
  slime: drawSlime,
  bat: drawBat,
  wolf: drawWolf,
  wisp: drawWisp,
  treant: drawTreant,
  golem: drawGolem,
  imp: drawImp,
  knight: drawKnight,
  lich: drawLich,
  warden: drawWarden,
  general: drawGeneral,
  king: drawKing,
};

// The sign above a monster: a disc of its color with the icon of its type.
function drawTypeBadge(ctx, type, y) {
  circle(ctx, 0, y, 8, 'rgba(0, 0, 0, 0.55)');
  circle(ctx, 0, y, 6.5, type.color);
  text(ctx, type.icon, 0, y + 0.5, 8);
}

// x, y: its feet, in pixels. scale: 1 on the map, bigger in a fight.
export function drawMonster(ctx, monster, x, y, scale, t) {
  const type = typeOf(monster.category);
  const size = scale * (monster.boss ? 1.5 : 1);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ellipse(ctx, 0, 0, 11, 4, 'rgba(0, 0, 0, 0.25)');
  SHAPES[monster.shape](ctx, type.color, t + monster.step);
  drawTypeBadge(ctx, type, monster.boss ? -54 : -42);
  ctx.restore();
}
