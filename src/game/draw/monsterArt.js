import atlasUrl from '../assets/monsters/monsters-atlas.png';
import { MONSTER_FRAMES } from '../assets/monsters/monsterFrames';
import { once, silhouette } from './pixels';

// The monsters drawn from the sprite sheets of art/Monsters (monster.art = their id): their pictures were cut
// by tools/cut_monsters.py into one image, the atlas. Until it is loaded, the monsters are drawn with code.
// All the pictures look to the LEFT: to look to the right, they are turned in a mirror.
// pose: 'walk' (on the map: frame 0 to 3), 'stand', 'attack', 'death' (frame 0 to 2).

const atlas = new Image();
atlas.src = atlasUrl;

export function hasMonsterArt(artId) {
  return MONSTER_FRAMES[artId] !== undefined && atlas.complete && atlas.naturalWidth > 0;
}

// The name of the picture of a pose: 'walk-2', 'stand', 'attack', 'death-1'... (one that exists).
function pictureOf(frames, pose, frame) {
  if (pose === 'walk') return 'walk-' + (frame % 4);
  if (pose === 'death') return frames['death-' + Math.min(frame, 2)] ? 'death-' + Math.min(frame, 2) : 'stand';
  if (pose === 'attack' && frames.attack) return 'attack';
  if (pose === 'idle') return frame % 2 ? 'walk-0' : 'stand';
  return 'stand';
}

function cut(box, mirror) {
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

// Like monsterSprite: { canvas, white, ax, ay } ((ax, ay) touches the ground).
export function monsterArtSprite(artId, dir, pose, frame) {
  const frames = MONSTER_FRAMES[artId];
  const name = pictureOf(frames, pose, frame);
  const mirror = dir === 'right';
  return once('monsterArt' + artId + name + mirror, () => {
    const box = frames[name];
    const [, , w, , feetX, feetY] = box;
    const canvas = cut(box, mirror);
    return { canvas: canvas, white: silhouette(canvas, '#ffffff'), ax: mirror ? w - 1 - feetX : feetX, ay: feetY - 1 };
  });
}
