import atlasUrl from '../assets/characters/characters-atlas.png';
import { CHARACTER_FRAMES } from '../assets/characters/characterFrames';
import { once } from './pixels';

// The people drawn from the sprite sheets of art/Characters (look.sheet = their id): their pictures were cut
// by tools/cut_characters.py into one image, the atlas. Until the atlas is loaded, they are drawn with code.
//
// The side pictures of the atlas all look to the LEFT (the "RIGHT" pictures of the sheets were wrong):
// to walk to the right, the same pictures are turned in a mirror.

const atlas = new Image();
atlas.src = atlasUrl;

export function isCharacterArtReady() {
  return atlas.complete && atlas.naturalWidth > 0;
}

export function hasCharacterArt(sheetId) {
  return CHARACTER_FRAMES[sheetId] !== undefined;
}

// The names of the side steps of a character: ['side-walk-0', 'side-walk-1', ...] (2 to 4 of them).
function sideSteps(frames) {
  return Object.keys(frames).filter((name) => name.startsWith('side-walk-'));
}

// The picture of a direction and a pose ('stand', 'breath', 'walk0'...'walk3', or a pose of a fight: standing).
// Returns { name, mirror }.
function frameOf(frames, dir, pose) {
  const step = pose.startsWith('walk') ? Number(pose.slice(4)) : -1;
  const isSide = (dir === 'left' || dir === 'right') && frames.side;
  if (isSide) {
    const steps = sideSteps(frames);
    const name = step >= 0 && steps.length > 0 ? steps[step % steps.length] : 'side';
    return { name: name, mirror: dir === 'right' };
  }
  const view = dir === 'up' && frames.back ? 'back' : 'front';
  const walk = [view + '-step-a', view, view + '-step-b', view]; // one leg lifted, then the other
  return { name: step >= 0 ? walk[step] : view, mirror: false };
}

// One picture of the atlas in its own canvas (turned in a mirror if needed).
function cutFrame(box, mirror) {
  const [x, y, w, h] = box;
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

// A character of the sheets, like personSprite: { canvas, ax, ay } ((ax, ay) touches the ground).
// Their weapons are in the pictures: no `hand` nor `sword` angle.
export function characterSprite(sheetId, dir, pose) {
  const frames = CHARACTER_FRAMES[sheetId];
  const frame = frameOf(frames, dir, pose);
  return once('character' + sheetId + frame.name + frame.mirror, () => {
    const box = frames[frame.name];
    const [, , w, , feetX, feetY] = box;
    return { canvas: cutFrame(box, frame.mirror), ax: frame.mirror ? w - 1 - feetX : feetX, ay: feetY, hand: null, sword: undefined };
  });
}
