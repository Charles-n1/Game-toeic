import { makeGrid, dot, fillRect, fillEllipse, fillBall, toneOf, drawLine, paintCloth, fillTriangle, randomOf, addOutline, mirrored, padded, toCanvas, once, silhouette, colorAt } from './pixels';
import { OUTLINE, WOOD_RAMP, LEAF_RAMP, LIGHT_LEAF_RAMP, STONE_RAMP, darker, lighter, rampOf } from './palette';
import { paintCrown } from './props';
import { typeOf } from '../data/types';
import { hasMonsterArt, monsterArtSprite } from './monsterArt';

// The monsters, in pixel art, painted with shaded shapes (lit on the top-left, like the people).
// They look LEFT (toward the hero in a fight); on the map they turn around.
// The small monsters wear the color of their type (a pink slime is a gerunds slime);
// the big ones have it in their eyes, crystals, flowers and gems.

const BONE = ['#5e5244', '#7d705e', '#a39479', '#c9bb9e', '#e6dcc4', '#fff8ea'];
const ARMOR = ['#121019', '#1d1a27', '#2b2738', '#3d384d', '#555068', '#79738f'];
const STEEL = ['#454b5a', '#626a7c', '#858ea0', '#aab3c3', '#d0d7e2', '#f4f7fb'];
const GOLD = ['#6b4210', '#8f5c16', '#b9801f', '#e0a82e', '#f5cf4f', '#fff0a0'];
const ROBE = ['#0d0915', '#161022', '#21182f', '#2d2140', '#3c2d54', '#4f3d6b'];
const BLOOD = rampOf('#a8242c');
const HOLE = '#120b10'; // a dark hollow (a mouth, the inside of a hood)
const DARK = '#1c1726';

// ---------- Painting tools ----------

// A painter for fillTriangle: every pixel gets the same light, dithered.
function shade(ramp, light) {
  return (x, y) => toneOf(ramp, light, x, y);
}

// A thick round line (an arm, a leg, a horn, a tail), shaded like a tube. r0 -> r1: its thickness at each end.
function paintLimb(grid, [x0, y0], [x1, y1], r0, r1, ramp) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = Math.max(0.8, r0 + (r1 - r0) * t);
    fillBall(grid, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, r, ramp, { ambient: 0.25 });
  }
}

// A shape that gets wider from its top to its bottom (a robe, a cape, a trunk), lit on its left.
function paintTaper(grid, cx, top, bottom, topHalf, bottomHalf, ramp) {
  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / Math.max(1, bottom - top);
    const half = topHalf + (bottomHalf - topHalf) * t;
    for (let x = Math.floor(cx - half); x < cx + half; x++) {
      const nx = (x + 0.5 - cx) / half;
      dot(grid, x, y, toneOf(ramp, 0.72 - nx * 0.38 - t * 0.18, x, y));
    }
  }
}

// Glowing eyes: 2 x 2 pixels of light with a white spark. points: the top-left pixel of each eye.
function paintEyes(grid, points, color) {
  for (const [x, y] of points) {
    fillRect(grid, x, y, 2, 2, lighter(color, 0.35));
    dot(grid, x, y, '#ffffff');
  }
}

// A wing of skin, from the shoulder to its tip and down to its low corner, with two notches on its edge
// (the bat look) and its bones in a darker tone.
function paintWing(grid, shoulder, tip, low, ramp) {
  const along = (t) => [tip[0] + (low[0] - tip[0]) * t, tip[1] + (low[1] - tip[1]) * t];
  const inward = ([x, y]) => [x + (shoulder[0] - x) * 0.25, y + (shoulder[1] - y) * 0.25];
  const edge = [tip, inward(along(0.25)), along(0.5), inward(along(0.75)), low];
  for (let i = 0; i < edge.length - 1; i++) fillTriangle(grid, shoulder, edge[i], edge[i + 1], shade(ramp, 0.55 - i * 0.07));
  drawLine(grid, shoulder[0], shoulder[1], tip[0], tip[1], ramp[1]);
  drawLine(grid, shoulder[0], shoulder[1], edge[2][0], edge[2][1], ramp[1]);
}

// Cuts the bottom of a robe in rags: some pixels of the last rows are removed.
function tearHem(grid, bottom, salt) {
  for (let x = 0; x < grid.width; x++) {
    const cut = Math.floor(randomOf(x, salt, 3) * 3);
    for (let y = bottom - cut + 1; y <= bottom; y++) dot(grid, x, y, null);
  }
}

// A trim of another color on the filled pixels of a few rows (the hem of a robe).
function paintTrim(grid, top, bottom, ramp) {
  for (let y = top; y <= bottom; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (colorAt(grid, x, y)) dot(grid, x, y, toneOf(ramp, 0.6 - x / grid.width / 3, x, y));
    }
  }
}

// ---------- Small monsters: they wear the color of their type ----------

// The slime: a glossy jelly dome with a big shine and cute black eyes. frame 1: squashed.
function slime(color, frame) {
  const grid = makeGrid(32, 24);
  const ramp = rampOf(color);
  const squash = frame;
  fillBall(grid, 16, 17 + squash, 14 + squash, 13 - squash, ramp, { ambient: 0.22 }); // the bottom is cut by the grid: it sits flat
  for (let x = 0; x < 32; x++) if (colorAt(grid, x, 23)) dot(grid, x, 23, ramp[1]);
  fillEllipse(grid, 10, 10 + squash, 3.5, 2.2, lighter(color, 0.7)); // the shine
  dot(grid, 9, 9 + squash, '#ffffff');
  dot(grid, 16, 7 + squash, '#ffffff');
  for (const x of [10, 18]) {
    fillEllipse(grid, x, 15 + squash, 1.7, 2.4, DARK); // the eyes
    dot(grid, x - 1, 14 + squash, '#ffffff');
  }
  fillRect(grid, 13, 19 + squash, 3, 1, darker(color, 0.55)); // a small smile
  return grid;
}

// The bat: a furry ball with big ears, glowing eyes and two wings. frame 0: the wings up, 1: down.
function bat(color, frame) {
  const grid = makeGrid(36, 30);
  const fur = rampOf(color);
  const skin = rampOf(darker(color, 0.4));
  const up = frame === 0;
  paintWing(grid, [14, 10], up ? [1, 1] : [1, 19], up ? [7, 20] : [11, 26], skin);
  paintWing(grid, [22, 10], up ? [35, 1] : [35, 19], up ? [29, 20] : [25, 26], skin);
  fillTriangle(grid, [12, 8], [12, 0], [17, 5], shade(fur, 0.7)); // the ears
  fillTriangle(grid, [19, 5], [24, 0], [24, 8], shade(fur, 0.45));
  fillBall(grid, 18, 11, 7, 7.5, fur, { ambient: 0.2 });
  fillBall(grid, 17, 14, 4, 3.5, rampOf(lighter(color, 0.3)), { ambient: 0.3 }); // the belly
  paintEyes(grid, [
    [13, 9],
    [18, 9],
  ], '#ffe14d');
  fillRect(grid, 14, 13, 4, 1, DARK); // the mouth and its fangs
  dot(grid, 14, 14, '#ffffff');
  dot(grid, 17, 14, '#ffffff');
  fillRect(grid, 15, 18, 1, 2, skin[1]); // the little feet
  fillRect(grid, 20, 18, 1, 2, skin[1]);
  return grid;
}

// The wolf, seen from the side: it walks toward the left. frame: the legs move.
function wolf(color, frame) {
  const grid = makeGrid(42, 31);
  const fur = rampOf(color);
  const shadow = rampOf(darker(color, 0.35));
  const light = rampOf(lighter(color, 0.35));
  const step = frame ? 2 : 0;
  paintLimb(grid, [14 + step, 20], [13 + step, 28], 1.8, 1.5, shadow); // the far legs
  paintLimb(grid, [30 - step, 20], [31 - step, 28], 1.8, 1.5, shadow);
  paintLimb(grid, [33, 15], [38, 9], 3, 2.4, fur); // the tail, with a light tip
  paintLimb(grid, [38, 9], [40, 3], 2.4, 1.2, light);
  fillBall(grid, 25, 17, 11, 6.5, fur, { ambient: 0.2 }); // the body
  fillBall(grid, 13, 16, 6.5, 7, fur, { ambient: 0.2 }); // the chest
  fillBall(grid, 12, 19, 4, 3, light, { ambient: 0.3 }); // the white of the chest
  paintLimb(grid, [11 - step, 21], [10 - step, 28], 2, 1.6, fur); // the near legs
  paintLimb(grid, [28 + step, 21], [29 + step, 28], 2.2, 1.6, fur);
  for (const x of [8 - step, 12 + step, 27 + step, 29 - step]) fillRect(grid, x, 29, 4, 2, shadow[1]); // the paws
  for (const x of [20, 24, 28]) drawLine(grid, x, 12, x - 2, 15, shadow[2]); // the fur on the back
  fillTriangle(grid, [7, 5], [9, 0], [13, 4], shade(fur, 0.7)); // the ears
  fillTriangle(grid, [11, 4], [15, 0], [16, 6], shade(fur, 0.45));
  fillBall(grid, 10, 9, 6.5, 6, fur, { ambient: 0.22 }); // the head
  fillBall(grid, 4, 11.5, 4.2, 2.8, fur, { ambient: 0.25 }); // the snout
  fillRect(grid, 0, 10, 2, 2, DARK); // the nose
  fillRect(grid, 7, 8, 2, 1, '#ffe14d'); // the angry eye
  dot(grid, 7, 8, '#ffffff');
  drawLine(grid, 6, 6, 9, 7, shadow[0]);
  drawLine(grid, 2, 13, 6, 13, DARK); // the mouth and a fang
  dot(grid, 3, 14, '#ffffff');
  return grid;
}

// The wisp: a cold flame with a bright heart and a little face. frame: the flames flicker.
function wisp(color, frame) {
  const grid = makeGrid(28, 36);
  const ramp = rampOf(color);
  const sway = frame ? 1 : -1;
  fillTriangle(grid, [6, 18], [9 + sway, 3], [14, 14], shade(ramp, 0.6)); // the flames on its head
  fillTriangle(grid, [10, 14], [15 - sway, 0], [19, 14], shade(ramp, 0.75));
  fillTriangle(grid, [16, 15], [20 + sway, 5], [23, 18], shade(ramp, 0.5));
  fillTriangle(grid, [7, 24], [21, 24], [16 + sway * 3, 32], shade(ramp, 0.4)); // the tail
  fillBall(grid, 14, 19, 8.5, 8, ramp, { ambient: 0.3 });
  fillBall(grid, 13, 19, 5.5, 5.5, rampOf(lighter(color, 0.5)), { ambient: 0.45 }); // the bright heart
  fillEllipse(grid, 10.5, 19, 1.2, 2, DARK); // the eyes and the mouth
  fillEllipse(grid, 15.5, 19, 1.2, 2, DARK);
  fillRect(grid, 12, 23, 2, 1, DARK);
  dot(grid, 2, 10 + frame * 2, lighter(color, 0.6)); // sparks of cold
  dot(grid, 25, 26 - frame * 2, lighter(color, 0.6));
  return grid;
}

// ---------- Big monsters ----------

// The imp: a little demon with horns, wings, a tail and a pitchfork. frame: the wings flap.
function imp(color, frame) {
  const grid = makeGrid(36, 38);
  const skin = rampOf(color);
  const wing = rampOf(darker(color, 0.45));
  const flap = frame ? 3 : 0;
  paintWing(grid, [19, 18], [34, 4 + flap], [29, 23], wing);
  paintWing(grid, [14, 18], [3, 6 + flap], [8, 22], wing);
  paintLimb(grid, [22, 28], [29, 31], 1.4, 1, skin); // the tail and its spade tip
  paintLimb(grid, [29, 31], [31, 26], 1, 1, skin);
  fillTriangle(grid, [28, 26], [32, 21], [34, 27], shade(skin, 0.5));
  paintLimb(grid, [14, 28], [13, 34], 2, 1.8, skin); // the legs and the hooves
  paintLimb(grid, [20, 28], [21, 34], 2, 1.8, skin);
  fillRect(grid, 11, 35, 4, 2, DARK);
  fillRect(grid, 19, 35, 4, 2, DARK);
  fillBall(grid, 17, 26, 7, 6.5, skin, { ambient: 0.2 }); // the round belly
  fillBall(grid, 16, 27, 4, 4, rampOf(lighter(color, 0.3)), { ambient: 0.3 });
  paintCloth(grid, 6, 8, 7, 37, WOOD_RAMP); // the pitchfork
  paintCloth(grid, 3, 6, 10, 7, STEEL);
  for (const x of [3, 6, 9]) paintCloth(grid, x, 1, x + 1, 5, STEEL);
  paintLimb(grid, [12, 23], [8, 25], 1.6, 1.4, skin); // the arm that holds it
  fillTriangle(grid, [8, 12], [2, 9], [9, 15], shade(skin, 0.55)); // the pointy ears
  fillTriangle(grid, [24, 11], [30, 8], [23, 15], shade(skin, 0.35));
  fillBall(grid, 16, 13, 8, 7.5, skin, { ambient: 0.22 }); // the head
  paintLimb(grid, [11, 8], [8, 1], 1.8, 0.8, BONE); // the horns
  paintLimb(grid, [20, 7], [24, 0], 1.8, 0.8, BONE);
  paintEyes(grid, [
    [11, 12],
    [16, 12],
  ], '#ffe14d');
  drawLine(grid, 10, 10, 13, 11, skin[0]); // angry brows
  drawLine(grid, 15, 11, 18, 10, skin[0]);
  fillRect(grid, 11, 17, 7, 1, DARK); // a grin with two fangs
  dot(grid, 12, 18, '#ffffff');
  dot(grid, 16, 18, '#ffffff');
  return grid;
}

// The treant: an old tree that walks, with a face in its trunk and flowers of the color of its type.
function treant(color, frame) {
  const grid = makeGrid(50, 56);
  const sway = frame;
  paintLimb(grid, [17, 30], [6, 36 - sway], 3, 2, WOOD_RAMP); // the arms: thick branches with twig fingers
  paintLimb(grid, [6, 36 - sway], [2, 42 - sway], 2, 1, WOOD_RAMP);
  paintLimb(grid, [6, 36 - sway], [1, 33 - sway], 1.6, 1, WOOD_RAMP);
  paintLimb(grid, [33, 30], [44, 36 + sway], 3, 2, WOOD_RAMP);
  paintLimb(grid, [44, 36 + sway], [48, 42 + sway], 2, 1, WOOD_RAMP);
  paintTaper(grid, 25, 22, 50, 8, 11, WOOD_RAMP); // the trunk
  paintLimb(grid, [16, 49], [10, 54], 2.4, 1.2, WOOD_RAMP); // the roots: its feet
  paintLimb(grid, [22, 50], [20, 55], 2.2, 1.2, WOOD_RAMP);
  paintLimb(grid, [29, 50], [31, 55], 2.2, 1.2, WOOD_RAMP);
  paintLimb(grid, [34, 49], [40, 54], 2.4, 1.2, WOOD_RAMP);
  for (const [x, y] of [[19, 42], [31, 44], [27, 47]]) drawLine(grid, x, y, x + 1, y + 4, WOOD_RAMP[0]); // the bark
  fillEllipse(grid, 20, 33, 3, 2.2, HOLE); // the face: two hollows with glowing eyes, and a mouth
  fillEllipse(grid, 30, 33, 3, 2.2, HOLE);
  paintEyes(grid, [
    [19, 32],
    [29, 32],
  ], color);
  fillEllipse(grid, 25, 40, 4.5, 2, HOLE);
  paintCrown(grid, { cx: 25 + sway, cy: 15, rx: 22, ry: 14 }, 22, [5, 8], LEAF_RAMP, 77);
  const flowers = rampOf(color);
  for (let i = 0; i < 10; i++) {
    const x = 8 + randomOf(i, 1, 50) * 34 + sway;
    const y = 5 + randomOf(i, 2, 50) * 20;
    fillBall(grid, x, y, 1.6, 1.6, flowers, { ambient: 0.4 });
  }
  return grid;
}

// One rock of the golem: a shaded ball with a dark edge, so that it stands out from the rocks behind it.
function paintRock(grid, cx, cy, rx, ry, brightness = 1) {
  fillEllipse(grid, cx, cy, rx + 1, ry + 1, STONE_RAMP[0]);
  fillBall(grid, cx, cy, rx, ry, STONE_RAMP, { ambient: 0.2, brightness: brightness });
}

// The golem: rocks stacked into a giant, with crystals and a glowing heart. frame: the arms move.
function golem(color, frame) {
  const grid = makeGrid(46, 48);
  const crystal = rampOf(color);
  const lift = frame;
  paintRock(grid, 15, 41, 6, 6); // the legs
  paintRock(grid, 31, 41, 6, 6);
  paintRock(grid, 38, 25 + lift, 5, 6.5, 0.75); // the far arm, in the shade
  paintRock(grid, 39, 34 + lift, 5, 4.5, 0.75);
  paintRock(grid, 23, 27, 13, 11.5, 0.92); // the body
  fillBall(grid, 18, 17, 6, 2.5, LIGHT_LEAF_RAMP, { ambient: 0.3 }); // moss on the shoulders
  fillTriangle(grid, [32, 18], [35, 8], [38, 18], shade(crystal, 0.65)); // crystals on the shoulders
  fillTriangle(grid, [35, 18], [39, 11], [40, 19], shade(crystal, 0.4));
  fillTriangle(grid, [23, 21], [18, 27], [23, 33], shade(crystal, 0.85)); // the crystal heart
  fillTriangle(grid, [23, 21], [28, 27], [23, 33], shade(crystal, 0.45));
  drawLine(grid, 27, 33, 30, 37, STONE_RAMP[0]); // cracks
  drawLine(grid, 15, 24, 17, 28, STONE_RAMP[1]);
  paintRock(grid, 8, 25 - lift, 5.5, 7); // the near arm and its fist
  paintRock(grid, 7, 35 - lift, 5.5, 5);
  paintRock(grid, 20, 11, 7.5, 6.5); // the head, low between the shoulders
  fillRect(grid, 14, 10, 11, 3, HOLE);
  paintEyes(grid, [
    [15, 10],
    [21, 10],
  ], color);
  return grid;
}

// The demon knight: black armor, a horned helmet, a cape and a long sword.
function knight(color, frame) {
  const grid = makeGrid(36, 50);
  const cape = rampOf(darker(color, 0.45));
  paintTaper(grid, 19, 17, 47, 7, 13, cape); // the cape
  paintCloth(grid, 13, 34, 16, 45, ARMOR); // the legs and the boots
  paintCloth(grid, 20, 34, 23, 45, ARMOR);
  paintCloth(grid, 11, 45, 16, 48, ARMOR);
  paintCloth(grid, 19, 45, 24, 48, ARMOR);
  fillBall(grid, 18, 26, 8, 9, ARMOR, { ambient: 0.2 }); // the breastplate
  paintCloth(grid, 11, 33, 25, 36, ARMOR);
  fillRect(grid, 11, 32, 15, 1, color); // the belt
  paintCloth(grid, 17, 31, 19, 33, GOLD);
  fillBall(grid, 26, 20, 5, 4, ARMOR, { ambient: 0.25 }); // the shoulders, with spikes
  fillBall(grid, 10, 20, 5, 4, ARMOR, { ambient: 0.25 });
  fillTriangle(grid, [7, 18], [8, 12], [11, 17], shade(BONE, 0.6));
  fillTriangle(grid, [25, 17], [28, 12], [29, 18], shade(BONE, 0.4));
  paintCloth(grid, 6, 5 + frame, 8, 29, STEEL); // the sword: blade, tip, guard, hand
  fillTriangle(grid, [6, 5 + frame], [9, 5 + frame], [7.5, 1 + frame], shade(STEEL, 0.7));
  paintCloth(grid, 3, 29, 12, 30, GOLD);
  paintLimb(grid, [10, 22], [8, 32], 2.2, 2, ARMOR);
  fillBall(grid, 7.5, 36, 1.5, 1.5, GOLD);
  fillBall(grid, 18, 11, 7, 7.5, ARMOR, { ambient: 0.25 }); // the helmet
  paintLimb(grid, [13, 6], [8, 0], 1.8, 0.8, BONE); // its horns
  paintLimb(grid, [22, 5], [26, 0], 1.8, 0.8, BONE);
  fillRect(grid, 12, 11, 10, 2, HOLE); // the visor and the eyes behind it
  paintEyes(grid, [
    [13, 11],
    [17, 11],
  ], color);
  return grid;
}

// The lich: a skull in a dark hood, a ragged robe and a staff with an orb. It floats. frame: up and down.
function lich(color, frame) {
  const grid = makeGrid(40, 54);
  const f = frame;
  const orb = rampOf(color);
  paintTaper(grid, 21, 19 + f, 46 + f, 7, 15, ROBE); // the robe, its ragged hem and its trim
  paintTrim(grid, 43 + f, 44 + f, rampOf(darker(color, 0.3)));
  tearHem(grid, 46 + f, 5);
  paintCloth(grid, 5, 9 + f, 6, 50 + f, WOOD_RAMP); // the staff and its orb
  fillBall(grid, 5.5, 6 + f, 4.5, 4.5, orb, { ambient: 0.4 });
  dot(grid, 4, 4 + f, '#ffffff');
  paintLimb(grid, [15, 22 + f], [8, 29 + f], 3, 2.5, ROBE); // the sleeve and the bony hand
  fillBall(grid, 6.5, 29 + f, 2, 2, BONE);
  fillBall(grid, 20, 13 + f, 9, 9.5, ROBE, { ambient: 0.25 }); // the hood, the dark inside, the skull
  fillEllipse(grid, 19, 15 + f, 5.5, 6, HOLE);
  fillBall(grid, 18.5, 15 + f, 4.2, 4.6, BONE, { ambient: 0.35 });
  fillRect(grid, 16, 14 + f, 2, 2, HOLE);
  fillRect(grid, 20, 14 + f, 2, 2, HOLE);
  dot(grid, 16, 14 + f, lighter(color, 0.4));
  dot(grid, 20, 14 + f, lighter(color, 0.4));
  fillRect(grid, 17, 18 + f, 4, 1, BONE[1]); // the teeth
  return grid;
}

// The chrono warden: a knight in a blue cloak, with a clock for a head and a pendulum in its chest.
const HANDS = [
  [
    [0, -6],
    [4, 0],
  ],
  [
    [3, -5],
    [0, 4],
  ],
];

function warden(color, frame) {
  const grid = makeGrid(42, 54);
  const cloak = rampOf('#3b4a78');
  paintCloth(grid, 15, 40, 18, 50, ARMOR); // the legs and the boots
  paintCloth(grid, 23, 40, 26, 50, ARMOR);
  paintCloth(grid, 13, 50, 18, 53, ARMOR);
  paintCloth(grid, 22, 50, 27, 53, ARMOR);
  paintTaper(grid, 21, 22, 44, 9, 13, cloak); // the cloak
  fillEllipse(grid, 21, 33, 4.5, 6, HOLE); // the window on the pendulum
  const swing = frame ? 2 : -2;
  drawLine(grid, 21, 28, 21 + swing, 35, GOLD[3]);
  fillBall(grid, 21 + swing, 36, 2, 2, rampOf(color), { ambient: 0.4 });
  paintLimb(grid, [12, 25], [9, 37], 3, 2.5, cloak); // the arms and the golden gauntlets
  paintLimb(grid, [30, 25], [33, 37], 3, 2.5, cloak);
  fillBall(grid, 9, 39, 3, 3, GOLD);
  fillBall(grid, 33, 39, 3, 3, GOLD);
  fillBall(grid, 12, 23, 4.5, 3.5, GOLD, { ambient: 0.3 }); // the shoulders
  fillBall(grid, 30, 23, 4.5, 3.5, GOLD, { ambient: 0.3 });
  fillBall(grid, 21, 1.5, 2, 1.5, GOLD); // the clock: the ring on top, the case, the face
  fillBall(grid, 21, 12, 11, 11, GOLD, { ambient: 0.3 });
  fillEllipse(grid, 21, 12, 8.5, 8.5, '#f2e8cc');
  for (const [x, y] of [[21, 5], [27, 12], [21, 18], [14, 12]]) fillRect(grid, x - 0.5, y - 0.5, 2, 2, darker(color, 0.2)); // the hours
  const [hour, minute] = HANDS[frame];
  drawLine(grid, 21, 12, 21 + hour[0], 12 + hour[1], DARK);
  drawLine(grid, 21, 12, 21 + minute[0], 12 + minute[1], DARK);
  dot(grid, 21, 12, color);
  return grid;
}

// General Barbarism: a giant in black armor, a red cape, a horned helmet and a great sword raised.
function general(color, frame) {
  const grid = makeGrid(48, 58);
  const raise = frame;
  paintTaper(grid, 25, 20, 54, 10, 17, BLOOD); // the red cape
  paintCloth(grid, 17, 40, 21, 53, ARMOR); // the legs and the boots
  paintCloth(grid, 27, 40, 31, 53, ARMOR);
  paintCloth(grid, 15, 53, 21, 57, ARMOR);
  paintCloth(grid, 26, 53, 32, 57, ARMOR);
  fillBall(grid, 24, 30, 11, 12, ARMOR, { ambient: 0.2 }); // the body
  paintCloth(grid, 14, 38, 34, 39, BLOOD);
  fillBall(grid, 24, 38.5, 2.2, 2.2, rampOf(color), { ambient: 0.4 }); // the gem of its belt
  fillBall(grid, 35, 21, 6.5, 5, ARMOR, { ambient: 0.25 }); // the shoulders, with spikes
  fillBall(grid, 13, 21, 6.5, 5, ARMOR, { ambient: 0.25 });
  fillTriangle(grid, [9, 18], [10, 11], [14, 17], shade(BONE, 0.6));
  fillTriangle(grid, [33, 17], [37, 10], [39, 18], shade(BONE, 0.4));
  paintCloth(grid, 5, 4 - raise, 9, 36 - raise, STEEL); // the great sword: blade, tip, guard, arm, pommel
  fillTriangle(grid, [5, 4 - raise], [10, 4 - raise], [7.5, 0], shade(STEEL, 0.7));
  drawLine(grid, 7, 6 - raise, 7, 34 - raise, STEEL[5]);
  paintCloth(grid, 1, 37 - raise, 13, 39 - raise, GOLD);
  paintLimb(grid, [13, 24], [9, 40 - raise], 3, 2.6, ARMOR);
  fillBall(grid, 7.5, 45 - raise, 2, 2, GOLD);
  fillBall(grid, 24, 12, 8, 8.5, ARMOR, { ambient: 0.25 }); // the helmet
  paintLimb(grid, [18, 8], [12, 4], 2, 1.4, BONE); // the big horns
  paintLimb(grid, [12, 4], [11, 0], 1.4, 0.8, BONE);
  paintLimb(grid, [30, 8], [36, 4], 2, 1.4, BONE);
  paintLimb(grid, [36, 4], [37, 0], 1.4, 0.8, BONE);
  fillRect(grid, 17, 12, 13, 2, HOLE); // the slit of the helmet and its red eyes
  fillRect(grid, 23, 12, 1, 6, HOLE);
  paintEyes(grid, [
    [18, 12],
    [26, 12],
  ], '#ff4040');
  return grid;
}

// Solecis, the Demon King: a pale face with long horns and a crown, a robe like the night,
// a cape like dark wings, and a ball of power in its raised hand. It floats. frame: up and down.
function king(color, frame) {
  const grid = makeGrid(60, 66);
  const f = frame;
  const power = rampOf(color);
  fillTriangle(grid, [30, 18 + f], [2, 60], [58, 60], shade(ROBE, 0.3)); // the cape, cut in points at the bottom
  for (let i = 0; i < 6; i++) fillTriangle(grid, [2 + i * 10, 61], [7 + i * 10, 55], [12 + i * 10, 61], () => null);
  paintTaper(grid, 30, 22 + f, 61, 9, 16, ROBE); // the robe and its golden lines
  drawLine(grid, 30, 25 + f, 30, 61, GOLD[2]);
  paintTrim(grid, 58, 59, GOLD);
  tearHem(grid, 61, 9);
  paintLimb(grid, [39, 26 + f], [47, 36 + f], 3, 2.4, ROBE); // the arms: one down, one raised with the power
  fillBall(grid, 48, 38 + f, 2.2, 2.2, rampOf('#c9c0d8'));
  paintLimb(grid, [21, 26 + f], [12, 17 + f], 3, 2.4, ROBE);
  fillBall(grid, 11, 16 + f, 2.2, 2.2, rampOf('#c9c0d8'));
  fillBall(grid, 9, 10 + f, 4.5, 4.5, power, { ambient: 0.45 });
  dot(grid, 8, 8 + f, '#ffffff');
  fillTriangle(grid, [30, 26 + f], [26, 31 + f], [30, 36 + f], shade(power, 0.85)); // the gem on its chest
  fillTriangle(grid, [30, 26 + f], [34, 31 + f], [30, 36 + f], shade(power, 0.45));
  fillTriangle(grid, [20, 12 + f], [24, 25 + f], [27, 20 + f], shade(ROBE, 0.55)); // the high collar
  fillTriangle(grid, [40, 12 + f], [36, 25 + f], [33, 20 + f], shade(ROBE, 0.35));
  fillBall(grid, 30, 16 + f, 6.5, 7, rampOf('#c9c0d8'), { ambient: 0.3 }); // the pale face
  paintEyes(grid, [
    [26, 15 + f],
    [31, 15 + f],
  ], color);
  fillRect(grid, 28, 20 + f, 4, 1, DARK);
  paintLimb(grid, [25, 11 + f], [18, 6 + f], 2.2, 1.6, ARMOR); // the long horns
  paintLimb(grid, [18, 6 + f], [17, 0], 1.6, 0.8, ARMOR);
  paintLimb(grid, [35, 11 + f], [42, 6 + f], 2.2, 1.6, ARMOR);
  paintLimb(grid, [42, 6 + f], [43, 0], 1.6, 0.8, ARMOR);
  paintCloth(grid, 24, 8 + f, 36, 10 + f, GOLD); // the crown and its red stones
  for (const x of [24, 29, 34]) fillTriangle(grid, [x, 8 + f], [x + 1, 3 + f], [x + 3, 8 + f], shade(GOLD, 0.7));
  dot(grid, 30, 9 + f, '#ff3b4f');
  return grid;
}

// A training dummy of straw on a wooden post (the practices of the villages). Its target has the color of the
// skill trained. frame: it wobbles a little on its post.
const STRAW = ['#6b5320', '#8a6d2a', '#a88a3a', '#c9a64e', '#d6b45a', '#f2d88a'];
const BURLAP = ['#5a4128', '#6e5032', '#86643f', '#9c7a50', '#b59266', '#cfae80'];

function dummy(color, frame) {
  const grid = makeGrid(34, 48);
  const sway = frame; // the top leans 1 pixel
  fillRect(grid, 16, 26, 3, 22, WOOD_RAMP[1]); // the post
  fillRect(grid, 16, 26, 1, 22, WOOD_RAMP[3]);
  fillRect(grid, 11, 45, 13, 3, WOOD_RAMP[0]); // the foot
  fillRect(grid, 3 + sway, 17, 28, 3, WOOD_RAMP[2]); // the arms
  fillRect(grid, 3 + sway, 17, 28, 1, WOOD_RAMP[4]);
  for (const x of [2, 31]) fillBall(grid, x + sway, 18, 2.5, 2.5, STRAW); // straw out of the sleeves
  fillBall(grid, 17 + sway, 27, 9, 10, BURLAP, { ambient: 0.3 }); // the body
  drawLine(grid, 10 + sway, 21, 24 + sway, 21, BURLAP[0]); // the rope at the waist
  drawLine(grid, 10 + sway, 34, 24 + sway, 34, BURLAP[0]);
  fillBall(grid, 17 + sway, 27, 5, 5, ['#8a8a8a', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']); // the target
  fillBall(grid, 17 + sway, 27, 3.5, 3.5, rampOf(color));
  fillRect(grid, 16 + sway, 26, 2, 2, '#ffffff');
  fillBall(grid, 17 + sway, 9, 7, 7, BURLAP, { ambient: 0.3 }); // the head, a sack
  fillRect(grid, 12 + sway, 2, 2, 3, STRAW[4]); // straw on top
  fillRect(grid, 18 + sway, 1, 2, 3, STRAW[3]);
  drawLine(grid, 12 + sway, 7, 14 + sway, 9, DARK); // stitched eyes: X X
  drawLine(grid, 14 + sway, 7, 12 + sway, 9, DARK);
  drawLine(grid, 19 + sway, 7, 21 + sway, 9, DARK);
  drawLine(grid, 21 + sway, 7, 19 + sway, 9, DARK);
  drawLine(grid, 13 + sway, 12, 20 + sway, 12, DARK); // the stitched mouth
  return grid;
}

const PAINTERS = { slime, bat, wolf, wisp, imp, treant, golem, knight, lich, warden, general, king, dummy };

// ---------- The sprite ----------

// monster: { shape, category }. dir: 'left' (default) or 'right'. frame: 0 or 1.
// Returns { canvas, white, ax, ay }: `white` is the same picture all white (when it is hit).
// pose: 'walk' (on the map), 'idle', 'attack', 'death' (in a fight). The monsters of the sheets have real pictures
// for each of them; the ones drawn with code only have 2 frames.
export function monsterSprite(monster, dir, frame, pose = 'walk') {
  const color = typeOf(monster.category).color;
  if (monster.art && hasMonsterArt(monster.art)) {
    const base = monsterArtSprite(monster.art, dir, pose, frame);
    if (!color || !base?.canvas) return base;
    const tinted = once('monsterCatArt|' + monster.art + '|' + dir + '|' + pose + '|' + frame + '|' + color, () => {
      const c = document.createElement('canvas');
      c.width = base.canvas.width;
      c.height = base.canvas.height;
      const g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.drawImage(base.canvas, 0, 0);
      g.globalCompositeOperation = 'source-atop';
      g.globalAlpha = 0.24;
      g.fillStyle = color;
      g.fillRect(0, 0, c.width, c.height);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 0.95;
      g.fillStyle = color;
      const bx = Math.round(base.ax);
      const by = Math.max(1, Math.round(base.ay - 3));
      g.fillRect(bx - 2, by, 4, 2);
      return c;
    });
    return { canvas: tinted, white: base.white, ax: base.ax, ay: base.ay };
  }
  return once('monster' + monster.shape + color + dir + (frame % 2), () => {
    const grid = padded(PAINTERS[monster.shape](color, frame % 2));
    const outlined = addOutline(dir === 'right' ? mirrored(grid) : grid, OUTLINE);
    const canvas = toCanvas(outlined);
    return { canvas: canvas, white: silhouette(canvas, '#ffffff'), ax: Math.floor(grid.width / 2), ay: grid.height - 1 };
  });
}
