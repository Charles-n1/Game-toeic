// The words written over the world (the names, the bubbles, the shouts, the "+15 XP"): each text is drawn ONCE
// into a small picture, with its dark outline, then that picture is copied at every frame. (Writing a text with
// an outline is one of the slowest things a canvas does; copying a picture is fast.)

const MAX_PICTURES = 400; // texts kept; past that, the old ones are forgotten (they are made again if needed)
const OUTLINE = '#1c1726';
const pictures = new Map();

// The fonts arrive after the first frames: the texts drawn before with another font are made again.
if (typeof document !== 'undefined' && document.fonts?.addEventListener) document.fonts.addEventListener('loadingdone', () => pictures.clear());

// The real pixels for one pixel of the page (a phone has 2): the pictures are made that sharp.
function pixelRatio() {
  return Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
}

function textPicture(text, size, color) {
  const ratio = pixelRatio();
  const key = ratio + '|' + size + '|' + color + '|' + text;
  const known = pictures.get(key);
  if (known) return known;
  if (pictures.size >= MAX_PICTURES) pictures.clear();
  const font = size + 'px "Pixelify Sans", monospace';
  const line = Math.max(3, size / 4);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = font;
  const width = Math.ceil(ctx.measureText(text).width + line * 2 + 4);
  const height = Math.ceil(size * 1.5 + line * 2);
  canvas.width = Math.ceil(width * ratio);
  canvas.height = Math.ceil(height * ratio);
  ctx.scale(ratio, ratio); // (changing the size of a canvas forgets its settings: they are set after)
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = line;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = OUTLINE;
  ctx.strokeText(text, width / 2, height / 2);
  ctx.fillStyle = color;
  ctx.fillText(text, width / 2, height / 2);
  const picture = { canvas, width, height };
  pictures.set(key, picture);
  return picture;
}

// Writes a text centered on (x, y), with its outline (in pixels of the screen).
export function writeText(ctx, text, x, y, size, color) {
  const picture = textPicture(String(text), size, color);
  ctx.drawImage(picture.canvas, Math.round(x - picture.width / 2), Math.round(y - picture.height / 2), picture.width, picture.height);
}
