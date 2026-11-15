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

const WALK_PICKS = [1, 3, 5, 7]; // the sheet has 8 pictures for a walk: the game uses 4 of them

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
// The sheet has no walk seen from the front: the front picture bounces and turns in a mirror.
function mapFrame(dir, pose) {
  const step = pose.startsWith('walk') ? Number(pose.slice(4)) : -1;
  if (dir === 'down') return { name: 'idle-down', mirror: step >= 2, lift: step % 2 === 1 ? 1 : 0 };
  if (dir === 'up') return { name: step >= 0 ? 'walk-up-' + WALK_PICKS[step] : 'idle-up', mirror: false, lift: 0 };
  return { name: step >= 0 ? 'walk-right-' + WALK_PICKS[step] : 'idle-right', mirror: dir === 'left', lift: 0 };
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

// The hero from the sheet, like personSprite: { canvas, ax, ay } ((ax, ay) touches the ground).
// The sword is in the pictures: no `hand` nor `sword` angle (battle.js does not add one).
export function heroArtSprite(dir, pose) {
  const frame = frameOf(dir, pose);
  return once('heroArt' + frame.name + frame.mirror + frame.lift, () => {
    const [, , w, , feetX, feetY] = HERO_FRAMES[frame.name];
    return { canvas: cutFrame(frame.name, frame.mirror), ax: frame.mirror ? w - 1 - feetX : feetX, ay: feetY + frame.lift, hand: null, sword: undefined };
  });
}
