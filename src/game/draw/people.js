import { makeGrid, dot, fillRect, fillBall, toneOf, drawLine, drawPicture, addOutline, mirrored, toCanvas, once, paintCloth, fillTriangle, colorAt } from './pixels';
import { OUTLINE, mix, darker, lighter, rampOf } from './palette';
import { usesHeroArt } from '../data/hero';
import { isHeroArtReady, heroArtSprite } from './heroArt';
import { isCharacterArtReady, hasCharacterArt, characterSprite } from './characterArt';

// The people of the world, in pixel art, drawn with shapes: a shaded head, big anime eyes, a hair style,
// a tunic, arms, legs and boots. The light comes from the top-left.
// A "look": { skin, hair, style, eyes, outfit, trim, pants?, boots?, small?, ears?, horns?, beard?, skirt?, scarf?, sword?,
//   sheet? } (sheet: the person has real pictures, cut from a sprite sheet: see characterArt.js)
// style: 'short' | 'long' | 'twin' | 'pony' | 'bun' | 'bald' | 'spiky'
// The hero also has a cape (scarf: true) of the color of the trim.

const W = 36;
const H = 40;
const CX = 18; // the middle of the body
const FEET = 34; // the row of the soles

// ---------- Colors ----------

// The skin gets warm shadows (a bit of red), not grey ones.
function skinRampOf(skin) {
  return [mix(skin, '#5e2a26', 0.5), mix(skin, '#7a3a32', 0.32), mix(skin, '#8a4a3a', 0.14), skin, lighter(skin, 0.3)];
}

function colorsOf(look) {
  return {
    hair: rampOf(look.hair),
    skin: skinRampOf(look.skin),
    outfit: rampOf(look.outfit),
    trim: rampOf(look.trim),
    pants: rampOf(look.pants || '#3b3652'),
    boots: rampOf(look.boots || '#5a3a22'),
    eyes: look.eyes,
  };
}

// The light of a pixel inside a ball (0 to 1), or -1 if it is outside. Lit on the top-left.
function ballLight(ball, x, y) {
  const nx = (x + 0.5 - ball.cx) / ball.rx;
  const ny = (y + 0.5 - ball.cy) / ball.ry;
  const flat = nx * nx + ny * ny;
  if (flat > 1) return -1;
  return 0.15 + 0.85 * Math.max(0, -0.5 * nx - 0.65 * ny + 0.58 * Math.sqrt(1 - flat));
}

// Paints the pixels of a ball that pass `keep(x, y)` (a part of the hair, the face...).
function paintBallPart(grid, ball, ramp, keep = () => true, brightness = 1) {
  for (let y = Math.floor(ball.cy - ball.ry); y <= ball.cy + ball.ry; y++) {
    for (let x = Math.floor(ball.cx - ball.rx); x <= ball.cx + ball.rx; x++) {
      const light = ballLight(ball, x, y);
      if (light >= 0 && keep(x, y)) dot(grid, x, y, toneOf(ramp, light * brightness, x, y));
    }
  }
}

// ---------- Poses: the pictures of the animations ----------

// One picture of an animation.
// lift: the body goes up (+) or down (−), in pixels. lean: the upper body moves forward (+) or back (−) (side view).
// legs: 'together' | 'walkA' | 'walkB' | 'stance' | 'lunge'. arms: see ARM_ENDS. cape: how far the cape flies (0 to 3).
// face: 'normal' | 'shout' | 'hurt' | 'happy'.
// sword: in a fight, the angle of the sword in the hand (degrees: 0 = forward, −90 = up), drawn by battle.js.
// No angle: the sword stays on the back (or at the hip).
const POSES = {
  stand: { lift: 0, legs: 'together', arms: 'down', cape: 0 },
  breath: { lift: -1, legs: 'together', arms: 'down', cape: 1 },
  walk0: { lift: 0, legs: 'walkA', arms: 'swingA', cape: 1 },
  walk1: { lift: 1, legs: 'together', arms: 'down', cape: 2 },
  walk2: { lift: 0, legs: 'walkB', arms: 'swingB', cape: 1 },
  walk3: { lift: 1, legs: 'together', arms: 'down', cape: 2 },
  ready0: { lift: -1, lean: 1, legs: 'stance', arms: 'ready', cape: 1, sword: -40 },
  ready1: { lift: -2, lean: 1, legs: 'stance', arms: 'ready', cape: 2, sword: -35 },
  windup: { lift: 0, lean: -2, legs: 'stance', arms: 'raised', cape: 1, face: 'shout', sword: -125 },
  slash: { lift: -2, lean: 3, legs: 'lunge', arms: 'forward', cape: 3, face: 'shout', sword: 30 },
  cast: { lift: 0, lean: 1, legs: 'stance', arms: 'forward', cape: 3, face: 'shout', sword: -15 },
  hurt: { lift: 0, lean: -3, legs: 'stance', arms: 'flail', cape: 0, face: 'hurt', sword: 120 },
  victory: { lift: 1, legs: 'together', arms: 'victory', cape: 2, face: 'happy', sword: -90 },
  drink: { lift: 0, legs: 'together', arms: 'drink', cape: 1, face: 'happy' },
};

// Where the hand is, from the shoulder (side view, looking right), for each way of holding the arm.
const ARM_ENDS = {
  down: [0, 7],
  swingA: [2, 6],
  swingB: [-2, 6],
  ready: [6, 3],
  raised: [2, -9],
  forward: [8, 1],
  flail: [-5, 3],
  victory: [3, -10],
  drink: [5, -3],
};

// The poses of the fight that the drawn hero shows like another one (the hero of the sprite sheet has them all).
const SAME_AS = {
  dash: 'slash',
  windupCombo: 'windup',
  dashCombo: 'slash',
  slashCombo: 'slash',
  windupJump: 'windup',
  dashJump: 'slash',
  slashJump: 'slash',
  guard: 'hurt',
  fall: 'hurt',
  cheer: 'drink',
  roll: 'hurt',
};

// A raised arm is painted over the head (else the head would hide it).
const ARMS_IN_FRONT = ['raised', 'victory', 'drink'];

// Where each foot is, from the hip (side view): the far leg and the near leg.
const SIDE_FEET = {
  together: { far: 0, near: 0 },
  walkA: { far: -3, near: 3 },
  walkB: { far: 3, near: -3 },
  stance: { far: -4, near: 4 },
  lunge: { far: -8, near: 6 },
};

// The walk, the breath and the fight, picture after picture.
const WALK = ['walk0', 'walk1', 'walk2', 'walk3'];

// ---------- The body ----------

// Where the parts of the body are. A child has a shorter body (the same big head). lift: up (+) or down (−).
function bodyOf(look, lift) {
  const short = look.small ? 3 : 0;
  const top = 4 + short - lift; // the top of the head
  return {
    head: { cx: CX, cy: top + 8, rx: 8.5, ry: 7.8 },
    torsoTop: top + 15,
    torsoBottom: top + 23 - short,
    legTop: top + 24 - short,
    bootTop: FEET - 2,
  };
}

// A thick line of cloth (an arm, a leg seen from the side), lit on its left.
function paintStroke(grid, [x0, y0], [x1, y1], width, ramp) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= steps; i++) {
    const cx = x0 + ((x1 - x0) * i) / steps;
    const cy = y0 + ((y1 - y0) * i) / steps;
    for (let dy = 0; dy < width; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const x = Math.round(cx - width / 2 + dx);
        const y = Math.round(cy - width / 2 + dy);
        dot(grid, x, y, toneOf(ramp, 0.75 - (dx / width) * 0.35, x, y));
      }
    }
  }
}

// The same ramp, one tone darker (the leg that is farther, in the shade of the body).
function shadedRamp(ramp) {
  return [ramp[0], ...ramp.slice(0, -1)];
}

// The legs and the boots, seen from the side. The far leg is darker.
function paintSideLegs(grid, colors, legs, body, lean) {
  const hip = 17.5 + Math.round(lean / 2);
  const feet = SIDE_FEET[legs];
  [
    [feet.far, shadedRamp(colors.pants), shadedRamp(colors.boots)],
    [feet.near, colors.pants, colors.boots],
  ].forEach(([foot, pants, boots]) => {
    paintStroke(grid, [hip, body.legTop + 1], [17.5 + foot, body.bootTop - 1], 4, pants);
    paintCloth(grid, Math.round(15.5 + foot), body.bootTop, Math.round(20.5 + foot), FEET, boots); // the toes point forward
  });
}

// The legs and the boots, seen from the front or the back: one foot forward (lower) while walking.
function paintFrontLegs(grid, colors, legs, body) {
  const forward = { walkA: 1, walkB: -1 }[legs] || 0;
  const legBottom = body.bootTop - 1;
  paintCloth(grid, 13, body.legTop, 16, legBottom + forward, colors.pants);
  paintCloth(grid, 19, body.legTop, 22, legBottom - forward, colors.pants);
  paintCloth(grid, 12, body.bootTop + forward, 16, FEET + forward, colors.boots);
  paintCloth(grid, 19, body.bootTop - forward, 23, FEET - forward, colors.boots);
}

function paintTorso(grid, look, colors, view, body) {
  const [left, right] = view === 'side' ? [14, 22] : [12, 23];
  paintCloth(grid, left, body.torsoTop, right, body.torsoBottom, colors.outfit);
  fillRect(grid, left, body.torsoTop, 1, 1, null); // round shoulders
  fillRect(grid, right, body.torsoTop, 1, 1, null);
  const belt = body.torsoBottom - 2;
  paintCloth(grid, left, belt, right, belt, colors.trim);
  if (look.skirt) paintCloth(grid, left - 1, belt + 1, right + 1, body.torsoBottom + 3, colors.outfit);
  else paintCloth(grid, left - 1, belt + 1, right + 1, body.torsoBottom, colors.outfit); // the bottom of the tunic
}

// The arm seen from the side: the sleeve and the hand. Returns where the hand is.
function paintSideArm(grid, colors, arms, body) {
  const shoulder = [CX, body.torsoTop + 1];
  const [dx, dy] = ARM_ENDS[arms];
  const hand = [shoulder[0] + dx, shoulder[1] + dy];
  paintStroke(grid, shoulder, [shoulder[0] + dx * 0.75, shoulder[1] + dy * 0.75], 3, colors.outfit);
  paintCloth(grid, hand[0] - 1, hand[1] - 1, hand[0], hand[1], colors.skin);
  if (arms === 'drink') paintPotion(grid, hand);
  return hand;
}

// A small blue potion in the hand (the hero drinks).
function paintPotion(grid, [x, y]) {
  fillRect(grid, x + 1, y - 4, 2, 4, '#3a7bff');
  dot(grid, x + 1, y - 3, '#bfe0ff');
  fillRect(grid, x + 1, y - 5, 2, 1, '#8a5a2e');
}

// The two arms seen from the front or the back. swing: −1, 0 or 1 (they move while walking).
function paintFrontArms(grid, colors, arms, body) {
  const swing = { swingA: 1, swingB: -1 }[arms] || 0;
  const top = body.torsoTop + 1;
  const bottom = body.torsoBottom - 2;
  paintCloth(grid, 10, top - swing, 11, bottom - swing, colors.outfit);
  paintCloth(grid, 10, bottom + 1 - swing, 11, bottom + 2 - swing, colors.skin);
  paintCloth(grid, 24, top + swing, 25, bottom + swing, colors.outfit);
  paintCloth(grid, 24, bottom + 1 + swing, 25, bottom + 2 + swing, colors.skin);
}

// ---------- The hero's cape, scarf and sword ----------

// The cape seen from the side: it flies behind, higher when the hero runs or strikes (flutter: 0 to 3).
function paintSideCape(grid, colors, body, flutter) {
  const top = body.torsoTop;
  const bottom = body.torsoBottom + 4;
  const tip = [9 - flutter * 2, bottom - flutter * 2];
  fillTriangle(grid, [16, top], tip, [17, bottom], (x, y) => toneOf(colors.trim, 0.72 - (17 - x) * 0.04, x, y));
  drawLine(grid, 15, top + 3, Math.round((tip[0] + 17) / 2), Math.round((tip[1] + bottom) / 2), colors.trim[1]); // a fold
}

// The cape seen from the front (behind the body) or the back (over it). sway: its bottom moves while walking.
function paintFlatCape(grid, colors, view, body, sway) {
  const [left, right] = view === 'up' ? [11, 24] : [9, 26];
  const top = body.torsoTop;
  const bottom = body.torsoBottom + 4;
  for (let y = top; y <= bottom; y++) {
    const shift = Math.round((sway * (y - top)) / (bottom - top));
    for (let x = left + shift; x <= right + shift; x++) {
      dot(grid, x, y, toneOf(colors.trim, 0.75 - ((x - left - shift) / (right - left)) * 0.4 - ((y - top) / (bottom - top)) * 0.15, x, y));
    }
  }
}

function paintScarf(grid, colors, view, body) {
  const y = body.torsoTop - 1;
  if (view === 'side') {
    paintCloth(grid, 15, y, 22, y + 1, colors.trim);
    paintCloth(grid, 12, y + 1, 15, y + 3, colors.trim); // its tail flies behind
    return;
  }
  paintCloth(grid, 13, y, 22, y + 1, colors.trim);
}

const BLADE = ['#6d7686', '#c9d1e0', '#eef3fa'];

// The sword when it is not in the hand: its handle over the shoulder, across the back, or at the hip.
function paintSheathedSword(grid, view, body) {
  if (view === 'down') {
    fillRect(grid, 25, body.torsoTop - 4, 2, 4, '#6b4423');
    fillRect(grid, 24, body.torsoTop - 1, 4, 1, '#e8b83a');
  }
  if (view === 'up') drawLine(grid, 11, body.torsoBottom + 2, 24, body.torsoTop - 3, BLADE[1]);
  if (view === 'side') fillRect(grid, 12, body.torsoBottom - 2, 4, 1, '#6b4423');
}

// ---------- The head ----------

// How far a lock of the fringe falls on the forehead, for the column x (0 to 3 pixels).
function lockDepth(x) {
  return [3, 1, 0, 2, 3, 0, 2][(x * 3) % 7];
}

const EYE_ROWS = ['DDD', 'WEE', 'EEE', 'dEd'];
const MOUTH = '#5a1a22';

// The eye and the mouth seen from the side, with the feeling of the pose.
function paintSideFace(grid, colors, eye, eyeTop, face) {
  if (face === 'happy') {
    // closed eyes, like a ^
    dot(grid, 22, eyeTop + 2, eye.D);
    dot(grid, 23, eyeTop + 1, eye.D);
    dot(grid, 24, eyeTop + 2, eye.D);
  } else if (face === 'hurt') {
    // eyes shut tight, like a >
    dot(grid, 22, eyeTop, eye.D);
    dot(grid, 23, eyeTop + 1, eye.D);
    dot(grid, 24, eyeTop + 2, eye.D);
    dot(grid, 23, eyeTop + 3, eye.D);
    dot(grid, 22, eyeTop + 4, eye.D);
  } else {
    drawPicture(grid, EYE_ROWS, eye, 22, eyeTop);
  }
  if (face === 'shout') drawLine(grid, 22, eyeTop - 1, 25, eyeTop, eye.D); // a frowning brow
  dot(grid, 27, eyeTop + 2, colors.skin[3]); // the nose
  if (face === 'normal') dot(grid, 24, eyeTop + 5, colors.skin[1]);
  else fillRect(grid, 24, eyeTop + 5, 2, face === 'happy' ? 1 : 2, MOUTH); // an open mouth
  dot(grid, 23, eyeTop + 4, '#f0908f'); // the blush
}

function paintFace(grid, colors, view, body, face) {
  const eyeTop = Math.round(body.head.cy);
  const eye = { D: '#1c1726', W: '#ffffff', E: colors.eyes, d: darker(colors.eyes, 0.45) };
  if (view === 'side') {
    paintSideFace(grid, colors, eye, eyeTop, face);
    return;
  }
  drawPicture(grid, EYE_ROWS, eye, 12, eyeTop);
  drawPicture(grid, EYE_ROWS, eye, 21, eyeTop);
  fillRect(grid, 17, eyeTop + 5, 2, 1, colors.skin[1]); // the mouth
  dot(grid, 11, eyeTop + 4, '#f0908f'); // the blush
  dot(grid, 24, eyeTop + 4, '#f0908f');
}

// The hair that is behind the head and the body (long hair, tails, bun).
function paintHairBack(grid, look, colors, view, body) {
  const head = body.head;
  const hair = colors.hair;
  if (look.style === 'long' && view === 'side') paintBallPart(grid, { cx: head.cx - 4, cy: head.cy + 7, rx: 6, ry: 10 }, hair, () => true, 0.85);
  else if (look.style === 'long') paintBallPart(grid, { cx: head.cx, cy: head.cy + 8, rx: 10.5, ry: 11 }, hair, () => true, 0.85);
  if (look.style === 'twin') {
    const sides = view === 'side' ? [head.cx - 10] : [head.cx - 11.5, head.cx + 11.5];
    sides.forEach((x) => paintBallPart(grid, { cx: x, cy: head.cy + 5, rx: 3.2, ry: 7 }, hair));
  }
  if (look.style === 'pony') {
    const tail = { down: { cx: head.cx + 10, cy: head.cy + 2 }, up: { cx: head.cx, cy: head.cy + 11 }, side: { cx: head.cx - 10, cy: head.cy + 1 } }[view];
    paintBallPart(grid, { ...tail, rx: 3, ry: 6.5 }, hair);
  }
  if (look.style === 'bun') paintBallPart(grid, { cx: view === 'side' ? head.cx - 5 : head.cx, cy: head.cy - 8.5, rx: 4.2, ry: 3.4 }, hair);
}

// The skin of the head and the hair on it. (The face is painted between the two.)
function paintHead(grid, colors, view, body) {
  const head = body.head;
  paintBallPart(grid, head, colors.skin);
  if (view === 'side') dot(grid, 27, Math.round(head.cy) + 2, colors.skin[3]);
}

// The hair over the head: a cap with a fringe of locks; seen from the back, it covers the whole head.
function paintHairCap(grid, look, colors, view, body) {
  const head = body.head;
  const cap = { cx: head.cx - (view === 'side' ? 1 : 0), cy: head.cy - 1.5, rx: head.rx + 1.3, ry: head.ry + 0.2 };
  const fringe = (x) => head.cy - 2.5 + lockDepth(x);
  let keep;
  if (look.style === 'bald') keep = (x, y) => y > head.cy - 4 && y < head.cy + 3 && Math.abs(x + 0.5 - head.cx) > 6.5; // only on the sides
  else if (view === 'up') keep = (x, y) => y < head.cy + 6.5;
  else if (view === 'side') keep = (x, y) => y < fringe(x) || (x < head.cx - 1 && y < head.cy + 6);
  else keep = (x, y) => y < fringe(x) || (Math.abs(x + 0.5 - head.cx) > 6.5 && y < head.cy + 6);
  paintBallPart(grid, cap, colors.hair, keep);
  if (look.style === 'spiky') paintSpikes(grid, colors, view, head);
}

function paintSpikes(grid, colors, view, head) {
  const top = head.cy - head.ry;
  const spikes =
    view === 'side'
      ? [
          [10, 5, 6],
          [13, 1, 7],
          [17, 0, 6],
          [7, 9, 4],
        ]
      : [
          [10, 4, 5],
          [14, 0, 5],
          [19, 0, 5],
          [24, 3, 5],
          [27, 7, 4],
          [8, 7, 4],
        ];
  for (const [x, y, size] of spikes) {
    fillTriangle(grid, [x - size / 2, top + 6], [x + size / 2, top + 6], [x + (x < head.cx ? -1 : 1), top + y - 4], (px, py) => toneOf(colors.hair, 0.85 - (py - top) * 0.04, px, py));
  }
}

// Fox ears, horns, a beard.
function paintExtras(grid, look, colors, view, body) {
  const head = body.head;
  const top = Math.round(head.cy - head.ry);
  if (look.ears) {
    [
      [head.cx - 6, -1],
      [head.cx + 6, 1],
    ].forEach(([x, side]) => {
      fillTriangle(grid, [x - 3, top + 4], [x + 3, top + 4], [x + side * 2, top - 4], (px, py) => toneOf(colors.hair, 0.8, px, py));
      fillTriangle(grid, [x - 1.5, top + 3], [x + 1.5, top + 3], [x + side * 1.5, top - 1], () => '#ffb3c8');
    });
  }
  if (look.horns) {
    [
      [head.cx - 5, -1],
      [head.cx + 5, 1],
    ].forEach(([x, side]) => fillTriangle(grid, [x - 2, top + 3], [x + 2, top + 3], [x + side * 4, top - 5], (px, py) => toneOf(['#1c1420', '#3a2c3e', '#5a4860'], 0.6, px, py)));
  }
  if (look.elfEars) {
    if (view === 'side') {
      fillTriangle(grid, [head.cx - 4, head.cy - 1], [head.cx - 4, head.cy + 2], [head.cx - 11, head.cy - 3], (px, py) => toneOf(colors.skin, 0.78, px, py));
    } else {
      [-1, 1].forEach((side) => {
        const bx = head.cx + side * 6;
        fillTriangle(grid, [bx, head.cy - 1], [bx, head.cy + 2], [bx + side * 5, head.cy - 3], (px, py) => toneOf(colors.skin, 0.8, px, py));
      });
    }
  }
  if (look.dwarfBrow && view !== 'up') {
    const lx = view === 'side' ? head.cx - 2 : head.cx - 6;
    const rx = view === 'side' ? head.cx + 6 : head.cx + 6;
    fillRect(grid, lx, Math.round(head.cy - 3), rx - lx + 1, 2, '#c9883a');
    dot(grid, Math.round((lx + rx) / 2), Math.round(head.cy - 3), '#ffd23f');
  }
  if (look.beard && view !== 'up') {
    const cx = view === 'side' ? head.cx + 4 : head.cx;
    const rx = look.burly ? (view === 'side' ? 6 : 7.5) : view === 'side' ? 5 : 6.5;
    paintBallPart(grid, { cx: cx, cy: head.cy + 6.5, rx: rx, ry: look.burly ? 4.4 : 3.6 }, colors.hair);
  }
}

// ---------- The person ----------

// Copies the painted cells of `source` onto `target`, moved by dx pixels.
function stamp(target, source, dx) {
  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      const color = colorAt(source, x, y);
      if (color) dot(target, x + dx, y, color);
    }
  }
}

// One picture of a person. view: 'down' | 'up' | 'side' (looking right). pose: a name of POSES.
// The body is painted in 3 layers: what is behind (cape, long hair), the legs, and the upper body
// (which leans forward or back with the pose). Returns { grid, hand } (hand: where the sword is held, side view).
function personGrid(look, view, poseName) {
  const pose = POSES[poseName] || POSES[SAME_AS[poseName]];
  const colors = colorsOf(look);
  const body = bodyOf(look, pose.lift);
  const lean = view === 'side' ? pose.lean || 0 : 0;
  const face = pose.face || 'normal';
  const sway = { walkA: 1, walkB: -1 }[pose.legs] || 0;

  const behind = makeGrid(W, H);
  if (look.scarf && view === 'side') paintSideCape(behind, colors, body, pose.cape);
  if (look.scarf && view === 'down') paintFlatCape(behind, colors, view, body, sway);
  paintHairBack(behind, look, colors, view, body);

  const upper = makeGrid(W, H);
  paintTorso(upper, look, colors, view, body);
  if (look.scarf && view === 'up') paintFlatCape(upper, colors, view, body, sway);
  if (look.sword && pose.sword === undefined) paintSheathedSword(upper, view, body);
  const armInFront = view === 'side' && ARMS_IN_FRONT.includes(pose.arms);
  let hand = view === 'side' && !armInFront ? paintSideArm(upper, colors, pose.arms, body) : null;
  if (view !== 'side') paintFrontArms(upper, colors, pose.arms, body);
  if (look.scarf) paintScarf(upper, colors, view, body);
  paintHead(upper, colors, view, body);
  if (view !== 'up') paintFace(upper, colors, view, body, face);
  paintHairCap(upper, look, colors, view, body);
  paintExtras(upper, look, colors, view, body);
  if (armInFront) hand = paintSideArm(upper, colors, pose.arms, body);

  const grid = makeGrid(W, H);
  stamp(grid, behind, lean);
  if (view === 'side') paintSideLegs(grid, colors, pose.legs, body, lean);
  else paintFrontLegs(grid, colors, pose.legs, body);
  stamp(grid, upper, lean);
  return { grid: grid, hand: hand ? [hand[0] + lean, hand[1]] : null };
}

// The picture turned a quarter to the left: the person lies on their back, the head on the left (knocked out).
function lyingDown(grid) {
  const result = makeGrid(grid.height, grid.width);
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) dot(result, y, grid.width - 1 - x, colorAt(grid, x, y));
  }
  return result;
}

// The lowest row with something painted (where a lying body touches the ground).
function lowestRow(grid) {
  for (let y = grid.height - 1; y >= 0; y--) {
    for (let x = 0; x < grid.width; x++) if (colorAt(grid, x, y)) return y;
  }
  return grid.height - 1;
}

// The point of the picture that stands on the ground (between the feet).
export const PERSON_ANCHOR = { x: CX, y: FEET + 1 };

// A number for each look, to remember its pictures.
const lookIds = new WeakMap();
let nextLookId = 1;

function lookId(look) {
  if (!lookIds.has(look)) lookIds.set(look, nextLookId++);
  return lookIds.get(look);
}

// The knocked out person, lying on the ground.
function lyingSprite(look) {
  const grid = lyingDown(personGrid(look, 'side', 'hurt').grid);
  return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: Math.round(grid.width / 2), ay: lowestRow(grid) + 1, hand: null, sword: undefined };
}

// dir: 'down' | 'up' | 'left' | 'right'. pose: a name of POSES ('stand', 'walk0'...), or 'ko' (lying on the ground).
// Returns { canvas, ax, ay, hand, sword }: (ax, ay) touches the ground; in a fight, the sword is held at `hand`
// with the angle `sword` (see swordSprite).
export function personSprite(look, dir, pose = 'stand') {
  if (usesHeroArt(look) && isHeroArtReady()) return heroArtSprite(dir, pose);
  if (look.sheet && hasCharacterArt(look.sheet) && isCharacterArtReady()) return characterSprite(look.sheet, dir, pose);
  return once('person' + lookId(look) + dir + pose, () => {
    if (pose === 'ko') return lyingSprite(look);
    const view = dir === 'left' || dir === 'right' ? 'side' : dir;
    const picture = personGrid(look, view, pose);
    const isMirror = dir === 'left';
    const grid = isMirror ? mirrored(picture.grid) : picture.grid;
    const hand = picture.hand && (isMirror ? [W - 1 - picture.hand[0], picture.hand[1]] : picture.hand);
    const angle = (POSES[pose] || POSES[SAME_AS[pose]]).sword;
    return {
      canvas: toCanvas(addOutline(grid, OUTLINE)),
      ax: isMirror ? W - 1 - PERSON_ANCHOR.x : PERSON_ANCHOR.x,
      ay: PERSON_ANCHOR.y,
      hand: hand,
      sword: angle === undefined ? undefined : isMirror ? 180 - angle : angle,
    };
  });
}

// The pose of someone on the map. step: grows while they walk (see logic). time: seconds (they breathe
// when they stand still; `salt` makes everyone breathe at their own moment).
export function walkPose(step, isWalking, time = 0, salt = 0) {
  if (isWalking) return WALK[Math.floor(step) % 4];
  return Math.floor(time * 1.4 + salt) % 2 ? 'breath' : 'stand';
}

// ---------- The sword in the hand (fights) ----------

// The colors of each blade: [shade, light, shine].
const BLADES = {
  woodSword: ['#5a3a1e', '#a0683a', '#c98f55'],
  ironSword: ['#5d6676', '#b9c2d2', '#eef3fa'],
  steelSword: ['#4f5a70', '#c9d4e6', '#ffffff'],
  mithrilSword: ['#2f6f9a', '#8fd6ff', '#e8fbff'],
  lexiconBlade: ['#9a6a10', '#ffd24a', '#fff6c8'],
};

// The sword, turned to `angle` (degrees: 0 = forward to the right, −90 = up), held by its grip at the middle
// of the picture. weapon: the id of the sword (its colors).
export function swordSprite(angle, weapon) {
  const step = Math.round(angle / 15) * 15;
  return once('sword' + step + weapon, () => {
    const size = 35;
    const c = 17; // the grip, in the middle
    const grid = makeGrid(size, size);
    const turn = (step * Math.PI) / 180;
    const [ux, uy] = [Math.cos(turn), Math.sin(turn)]; // along the blade
    const [nx, ny] = [-uy, ux]; // across the blade
    const at = (along, across) => [Math.round(c + ux * along + nx * across), Math.round(c + uy * along + ny * across)];
    const blade = BLADES[weapon] || BLADES.ironSword;
    for (let i = -3; i <= 0; i++) dot(grid, ...at(i, 0), '#6b4423'); // the grip
    for (let i = 3; i <= 14; i++) {
      dot(grid, ...at(i, 0), blade[2]); // the shining edge and the shaded edge
      dot(grid, ...at(i, 1), blade[1]);
    }
    dot(grid, ...at(15, 0.5), blade[2]); // the tip
    for (let i = -2; i <= 3; i++) dot(grid, ...at(2, i), '#e8b83a'); // the guard
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: c, ay: c };
  });
}

// ---------- The obsidian friends ----------

const OBSIDIAN = ['#0d0a14', '#1a1428', '#271e3c', '#372a52', '#4b3b6e', '#6a5a9a'];
const GLOW = '#c9a8ff';

// A tall, armored guardian of black glass, with a heavy shield, crested helm, halberd and glowing eyes. frame: it breathes.
export function obsidianSoldier(frame) {
  return once('soldierBig' + (frame % 2), () => {
    const grid = makeGrid(32, 42);
    const lift = frame % 2;
    paintCloth(grid, 9, 27, 13, 39, OBSIDIAN); // left leg
    paintCloth(grid, 16, 27, 20, 39, OBSIDIAN); // right leg
    fillRect(grid, 8, 37, 6, 3, OBSIDIAN[1]); // heavy boots
    fillRect(grid, 15, 37, 6, 3, OBSIDIAN[1]);
    fillBall(grid, 14.5, 22 - lift, 8.5, 8, OBSIDIAN, { ambient: 0.25 }); // armored torso
    fillBall(grid, 6, 17 - lift, 3.8, 3.2, OBSIDIAN, { ambient: 0.3 }); // left pauldron
    fillBall(grid, 22, 17 - lift, 3.8, 3.2, OBSIDIAN, { ambient: 0.3 }); // right pauldron
    fillBall(grid, 14.5, 11 - lift, 6.2, 6.2, OBSIDIAN, { ambient: 0.35 }); // crested helmet
    drawLine(grid, 10, 6 - lift, 8, 2 - lift, OBSIDIAN[4]); // helmet horns
    drawLine(grid, 19, 6 - lift, 21, 2 - lift, OBSIDIAN[4]);
    fillRect(grid, 11, 11 - lift, 8, 2, GLOW); // glowing visor eyes
    fillRect(grid, 20, 15 - lift, 7, 15, OBSIDIAN[2]); // front obsidian tower shield
    fillRect(grid, 22, 17 - lift, 3, 11, GLOW); // shield rune
    drawLine(grid, 28, 3, 28, 39, OBSIDIAN[4]); // tall halberd shaft
    fillRect(grid, 26, 0, 5, 6, GLOW); // glowing halberd blade
    fillBall(grid, 25, 21 - lift, 2.2, 2.2, OBSIDIAN); // shield hand
    return { canvas: toCanvas(addOutline(grid, '#0d0a14')), ax: 15, ay: 40 };
  });
}

// The cat of black glass, with violet eyes. It looks to the right.
export function obsidianCat() {
  return once('cat', () => {
    const grid = makeGrid(20, 15);
    drawLine(grid, 4, 9, 2, 3, OBSIDIAN[3]); // the tail
    drawLine(grid, 3, 9, 1, 3, OBSIDIAN[2]);
    [6, 8, 12, 14].forEach((x) => paintCloth(grid, x, 10, x + 1, 13, OBSIDIAN)); // the legs
    fillBall(grid, 10, 9, 6, 3.6, OBSIDIAN, { ambient: 0.25 }); // the body
    fillTriangle(grid, [13, 4], [13, 0], [16, 3], (x, y) => toneOf(OBSIDIAN, 0.7, x, y)); // the ears
    fillTriangle(grid, [16, 3], [19, 0], [19, 5], (x, y) => toneOf(OBSIDIAN, 0.45, x, y));
    fillBall(grid, 16, 6, 3.8, 3.4, OBSIDIAN, { ambient: 0.3 }); // the head
    dot(grid, 17, 6, GLOW); // the eye
    dot(grid, 19, 7, OBSIDIAN[5]); // the nose
    return { canvas: toCanvas(addOutline(grid, '#0d0a14')), ax: 10, ay: 14 };
  });
}
