import atlasUrl from '../assets/hero/hero-atlas.png';
import { HERO_FRAMES } from '../assets/hero/heroFrames';
import { once } from './pixels';

// The default hero is not drawn with code: their pictures come from the sprite sheet (art/hero-sheet.png),
// cut by tools/cut_hero_sheet.py into one image, the atlas. Until the atlas is loaded, the hero is drawn with code.

const atlas = new Image();
atlas.src = atlasUrl;

export function isHeroArtReady() {
  return atlas.complete && atlas.naturalWidth > 0;
}

// The sheet has 8 pictures for each walk; the game shows 4 of them, in a loop.
// To the right: a foot down, the legs passing, the other foot down, the legs passing.
// (Picture 2 is skipped: the hero holds the sword in it.)
const WALK_RIGHT = [0, 3, 4, 7];
// To the top: only the first 3 pictures are seen straight from the back (in the next ones the hero turns).
const WALK_UP = [1, 0, 2, 0];

// The picture of each pose of a fight (looking right). See POSES in people.js and heroPose in battle.js.
const FIGHT_FRAMES = {
  ready0: 'attack-ready',
  ready1: 'attack-ready',
  windup: 'attack-raise',
  dash: 'attack-raise',
  slash: 'attack-slash',
  windupCombo: 'combo-raise',
  dashCombo: 'combo-raise',
  slashCombo: 'combo-lunge',
  windupJump: 'jump-crouch',
  dashJump: 'jump-air',
  slashJump: 'combo-lunge',
  cast: 'skill-crouch',
  hurt: 'hurt-1',
  guard: 'guard',
  fall: 'ko-fall',
  ko: 'ko-lying',
  victory: 'victory',
  drink: 'item-potion',
  cheer: 'item-happy',
  roll: 'dodge-roll',
};

// On the map: the picture of a direction and a pose ('stand', 'breath', 'walk0'...'walk3').
// The sheet has no walk seen from the front: it is made from the standing picture, one leg lifted at each step
// (see liftLeg), the body going up with it.
function mapFrame(dir, pose) {
  const step = pose.startsWith('walk') ? Number(pose.slice(4)) : -1;
  if (dir === 'down') {
    const leg = { 0: 'left', 2: 'right' }[step] || null; // the leg lifted in this picture
    return { name: 'idle-down', mirror: false, lift: leg ? 1 : 0, leg: leg };
  }
  if (dir === 'up') return { name: step >= 0 ? 'walk-up-' + WALK_UP[step] : 'idle-up', mirror: false, lift: 0 };
  return { name: step >= 0 ? 'walk-right-' + WALK_RIGHT[step] : 'idle-right', mirror: dir === 'left', lift: 0 };
}

function frameOf(dir, pose) {
  if (FIGHT_FRAMES[pose]) return { name: FIGHT_FRAMES[pose], mirror: dir === 'left', lift: 0 };
  return mapFrame(dir, pose);
}

// One picture of the atlas in its own canvas (turned in a mirror if needed).
function cutFrame(name, mirror) {
  const [x, y, w, h] = HERO_FRAMES[name];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (mirror) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(atlas, x, y, w, h, 0, 0, w, h);
  return canvas;
}

const LEGS_HEIGHT = 11; // pixels: the legs and the boots, at the bottom of the front picture
const LEG_LIFT = 2; // pixels: how high a foot goes at each step

// The same picture with one leg lifted (a step, seen from the front): the half of the legs on that side goes up,
// and slides under the body. middle: the column between the two legs.
function liftLeg(picture, leg, middle) {
  const { width, height } = picture;
  const legTop = height - LEGS_HEIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const up = (side) => (side === leg ? LEG_LIFT : 0);
  ctx.drawImage(picture, 0, legTop, middle, LEGS_HEIGHT, 0, legTop - up('left'), middle, LEGS_HEIGHT);
  ctx.drawImage(picture, middle, legTop, width - middle, LEGS_HEIGHT, middle, legTop - up('right'), width - middle, LEGS_HEIGHT);
  ctx.drawImage(picture, 0, 0, width, legTop, 0, 0, width, legTop); // the body, over the lifted leg
  return canvas;
}

// The hero from the sheet, like personSprite: { canvas, ax, ay } ((ax, ay) touches the ground).
// The sword is in the pictures: no `hand` nor `sword` angle (battle.js does not add one).
export function heroArtSprite(dir, pose) {
  const frame = frameOf(dir, pose);
  return once('heroArt' + frame.name + frame.mirror + frame.lift + frame.leg, () => {
    const [, , w, , feetX, feetY] = HERO_FRAMES[frame.name];
    const picture = cutFrame(frame.name, frame.mirror);
    const canvas = frame.leg ? liftLeg(picture, frame.leg, feetX) : picture;
    return { canvas: canvas, ax: frame.mirror ? w - 1 - feetX : feetX, ay: feetY + frame.lift, hand: null, sword: undefined };
  });
}
