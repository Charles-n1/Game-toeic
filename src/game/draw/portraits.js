import { makeGrid, dot, fillRect, fillEllipse, drawPicture, addOutline, toCanvas, once } from './pixels';
import { OUTLINE, darker, lighter } from './palette';

// The face shown in the dialog box: a 32 x 32 pixel bust with big anime eyes.
// It uses the same "look" as the small person on the map (see people.js).

const SIZE = 32;

// One eye, 4 x 5: the lashes, a big iris, a light in the top corner.
const EYE = ['DDDD', 'DWEE', 'DEEE', 'DEdE', '.EE.'];

function paintBackHair(grid, look, hair) {
  if (look.style === 'long') {
    fillRect(grid, 5, 8, 22, 20, hair.base);
    fillRect(grid, 5, 22, 22, 6, hair.dark);
  }
  if (look.style === 'twin') {
    fillEllipse(grid, 3.5, 18, 3.5, 9, hair.base);
    fillEllipse(grid, 28.5, 18, 3.5, 9, hair.base);
  }
  if (look.style === 'pony') fillEllipse(grid, 27.5, 16, 3.5, 9, hair.base);
  if (look.style === 'bun') fillEllipse(grid, 16, 3, 5, 3.5, hair.base);
}

function paintFace(grid, look, skin) {
  fillRect(grid, 7, 27, 18, 5, look.outfit); // the shoulders
  fillRect(grid, 7, 27, 18, 1, darker(look.outfit, 0.25));
  fillRect(grid, 13, 26, 6, 3, look.trim); // the collar
  fillRect(grid, 13, 22, 6, 5, skin.dark); // the neck
  fillEllipse(grid, 16, 15, 9.5, 10, skin.base);
  fillRect(grid, 9, 23, 14, 1, skin.dark); // the shadow under the chin
}

function paintEyes(grid, look) {
  const colors = { D: '#1c1726', W: '#ffffff', E: look.eyes, d: darker(look.eyes, 0.45) };
  drawPicture(grid, EYE, colors, 9, 14);
  drawPicture(grid, EYE.map((row) => [...row].reverse().join('')), colors, 19, 14);
  fillRect(grid, 8, 20, 2, 1, '#f2989a'); // the blush
  fillRect(grid, 22, 20, 2, 1, '#f2989a');
  dot(grid, 16, 19, '#d9a58a'); // the nose
  fillRect(grid, 15, 21, 2, 1, '#a0524a'); // the mouth
}

// The top of the hair, and three locks falling on the forehead.
function paintFringe(grid, look, hair) {
  if (look.style === 'bald') {
    fillRect(grid, 6, 12, 3, 9, hair.base);
    fillRect(grid, 23, 12, 3, 9, hair.base);
    return;
  }
  fillEllipse(grid, 16, 8.5, 10.5, 5.5, hair.base);
  fillRect(grid, 6, 9, 3, 13, hair.base); // the sides
  fillRect(grid, 23, 9, 3, 13, hair.base);
  [
    [9, 11, 3],
    [13, 11, 2],
    [17, 11, 2],
    [20, 11, 3],
  ].forEach(([x, y, length]) => fillRect(grid, x, y, 2, length, hair.base)); // the locks on the forehead
  fillRect(grid, 10, 5, 5, 1, hair.light); // the shine
  fillRect(grid, 9, 6, 3, 1, hair.light);
  fillRect(grid, 7, 13, 2, 9, hair.dark); // the shadow of the side locks
  fillRect(grid, 23, 13, 2, 9, hair.dark);
  if (look.style === 'spiky') {
    [7, 12, 18, 23].forEach((x, i) => fillRect(grid, x, 2 - (i % 2), 2, 3, hair.base));
  }
}

function paintExtras(grid, look, hair) {
  if (look.beard) {
    fillEllipse(grid, 16, 22, 7, 4, hair.base);
    fillRect(grid, 15, 21, 2, 1, '#a0524a');
  }
  if (look.ears) {
    [6, 22].forEach((x) => {
      fillRect(grid, x, 0, 4, 5, hair.base);
      fillRect(grid, x + 1, 1, 2, 3, '#ffb3c8');
    });
  }
  if (look.horns) {
    [
      [7, 6],
      [24, 6],
    ].forEach(([x, y]) => {
      fillRect(grid, x, y - 4, 2, 4, '#3a2c3e');
      dot(grid, x + (x < 16 ? -1 : 2), y - 5, '#3a2c3e');
    });
  }
}

// The face, as a 32 x 32 canvas (drawn bigger by the page, without smoothing).
export function portraitCanvas(look) {
  return once('portrait' + JSON.stringify(look), () => {
    const grid = makeGrid(SIZE, SIZE);
    const hair = { base: look.hair, dark: darker(look.hair, 0.3), light: lighter(look.hair, 0.4) };
    const skin = { base: look.skin, dark: darker(look.skin, 0.16) };
    paintBackHair(grid, look, hair);
    paintFace(grid, look, skin);
    paintEyes(grid, look);
    paintFringe(grid, look, hair);
    paintExtras(grid, look, hair);
    return toCanvas(addOutline(grid, OUTLINE));
  });
}
