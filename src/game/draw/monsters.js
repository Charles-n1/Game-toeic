import { makeGrid, dot, fillRect, fillEllipse, drawLine, drawPicture, sprinkle, addOutline, mirrored, padded, toCanvas, once, silhouette } from './pixels';
import { OUTLINE, WOOD, darker, lighter } from './palette';
import { typeOf } from '../data/types';

// The monsters, in pixel art. They look LEFT (toward the hero in a fight); on the map they turn around.
// The color of their type is in M (main), m (shadow), L (light): a pink slime is a gerunds slime.
// The small monsters are text pictures, the big ones are painted with shapes.

// ---------- Small monsters: text pictures, 2 frames each ----------

const SLIME = [
  [
    '......MMMM......',
    '....MMMMMMMM....',
    '...MLLMMMMMMM...',
    '..MLWLMMMMMMMM..',
    '..MLLMMMMMMMMM..',
    '.MMMMMMMMMMMMMM.',
    '.MMEWMMMMEWMMMm.',
    '.MMEEMMMMEEMMMm.',
    '.MMMMMMKMMMMMmm.',
    '.mMMMMMMMMMMMmm.',
    '..mmmmmmmmmmmm..',
  ],
  [
    '................',
    '.....MMMMMM.....',
    '...MLLMMMMMMM...',
    '..MLWLMMMMMMMM..',
    '.MMLLMMMMMMMMMM.',
    '.MMMMMMMMMMMMMM.',
    'MMMEWMMMMEWMMMMm',
    'MMMEEMMMMEEMMMMm',
    'MMMMMMMKMMMMMMmm',
    'mMMMMMMMMMMMMMmm',
    '.mmmmmmmmmmmmmm.',
  ],
];

const BAT = [
  [
    'M..............M',
    'MM............MM',
    'MMM....mm....MMM',
    '.MMM..mmmm..MMM.',
    '.MMMMmmmmmmMMMM.',
    '..MMmmEmmEmmMM..',
    '...MmmmmmmmmM...',
    '....mmmmmmmm....',
    '.....mWmmWm.....',
    '......mmmm......',
  ],
  [
    '................',
    '................',
    '.......mm.......',
    '......mmmm......',
    '..MMmmmmmmmmMM..',
    '.MMMmmEmmEmmMMM.',
    'MMMMmmmmmmmmMMMM',
    'MMM.mmmmmmmm.MMM',
    'MM...mWmmWm...MM',
    'M.....mmmm.....M',
  ],
];

const WOLF_BODY = [
  '..mM.mM.............',
  '..MMMMM.............',
  '.MMEMMMM............',
  'KLLMMMMMM.......MM..',
  '.LLLMMMMMMMMMMMMMMM.',
  '..WLMMMMMMMMMMMMMMm.',
  '....MMMMMMMMMMMMMmm.',
  '....MLLLLLLLLLLMmm..',
  '....MM.MM...MM.mm...',
];
const WOLF = [
  [...WOLF_BODY, '....MM.MM...MM.mm...', '....mm.mm...mm.mm...', '...KK.KK...KK.KK....'],
  [...WOLF_BODY, '...MM...MM.MM...mm..', '..mm.....mmm.....mm.', '.KK.....KK.......KK.'],
];

const WISP_BOTTOM = [
  '...MMMMMMMM...',
  '..MMLLLLLMMM..',
  '..MLWWWWWLMM..',
  '.MMLWWWWWLMMm.',
  '.MMLWEWWEWLMm.',
  '.MMLWEWWEWLMm.',
  '.MMLWWWWWWLMm.',
  '..MLLWWWWLMm..',
  '..mMLLLLLMMm..',
  '...mmMMMMmm...',
  '.....mmmm.....',
];
const WISP = [
  ['......L.......', '.....LM.......', '....LMM...L...', '...LMMM..LM...', ...WISP_BOTTOM],
  ['........L.....', '.......LM.....', '...L..LMM.....', '...ML.LMMM....', ...WISP_BOTTOM],
];

const IMP_LEGS = ['...LMMMMMMMML...', '...MMLMMMMLMM...', '...MM.MMMM.MM...', '.....MMMMMM.....', '.....MM..MM.....', '.....mm..mm.....'];
const IMP = [
  [
    'm....X....X....m',
    'mm...XX..XX...mm',
    'mmm..MMMMMM..mmm',
    '.mmmMMMMMMMMmmm.',
    '.mmmMEEMMEEMmmm.',
    '..mmMMMMMMMMmm..',
    '...mMMWMMWMMm...',
    '....MMMMMMMM....',
    ...IMP_LEGS,
  ],
  [
    '.....X....X.....',
    '.....XX..XX.....',
    '.....MMMMMM.....',
    '..mmMMMMMMMMmm..',
    '.mmmMEEMMEEMmmm.',
    'mmmmMMMMMMMMmmmm',
    'mmmmMMWMMWMMmmmm',
    'mm..MMMMMMMM..mm',
    ...IMP_LEGS,
  ],
];

const PICTURES = { slime: SLIME, bat: BAT, wolf: WOLF, wisp: WISP, imp: IMP };

function pictureColors(color) {
  return { M: color, m: darker(color, 0.3), L: lighter(color, 0.4), E: '#ffe14d', W: '#ffffff', K: '#2a1f2e', X: '#2a2030' };
}

// The slime has black eyes (it is cute), the others have glowing ones.
function pictureGrid(shape, color, frame) {
  const rows = PICTURES[shape][frame];
  const grid = makeGrid(rows[0].length, rows.length);
  const colors = pictureColors(color);
  if (shape === 'slime') colors.E = '#1c1726';
  drawPicture(grid, rows, colors);
  return grid;
}

// ---------- Big monsters: painted with shapes ----------

function treant(color, frame) {
  const grid = makeGrid(26, 30);
  const sway = frame;
  drawLine(grid, 8, 18, 2, 23, WOOD.dark); // the arms
  drawLine(grid, 8, 19, 2, 24, WOOD.dark);
  drawLine(grid, 17, 18, 23, 22, WOOD.dark);
  drawLine(grid, 17, 19, 23, 23, WOOD.dark);
  fillRect(grid, 8, 14, 10, 14, WOOD.base);
  fillRect(grid, 15, 14, 3, 14, WOOD.dark);
  fillRect(grid, 8, 27, 3, 3, WOOD.dark); // the roots
  fillRect(grid, 15, 27, 3, 3, WOOD.dark);
  fillRect(grid, 9, 18, 2, 2, '#ffe14d'); // the eyes
  fillRect(grid, 13, 18, 2, 2, '#ffe14d');
  fillRect(grid, 10, 22, 5, 2, '#2a1f2e'); // the mouth
  const blobs = [
    [13, 9, 11, 7],
    [5, 11, 5, 4],
    [21, 11, 5, 4],
    [13, 4, 6, 4],
  ];
  blobs.forEach(([x, y, rx, ry]) => fillEllipse(grid, x + sway, y, rx, ry, darker(color, 0.35)));
  blobs.forEach(([x, y, rx, ry]) => fillEllipse(grid, x + sway - 1, y - 1, rx - 1.5, ry - 1.5, color));
  blobs.forEach(([x, y, rx, ry]) => fillEllipse(grid, x + sway - rx * 0.35, y - ry * 0.4, rx * 0.4, ry * 0.3, lighter(color, 0.4)));
  sprinkle(grid, darker(color, 0.35), 0.1, 70, color);
  return grid;
}

const ROCK = { base: '#8a8279', dark: '#6a635b', light: '#aaa298' };

function golem(color, frame) {
  const grid = makeGrid(24, 26);
  const arm = frame; // the arms move up and down
  fillRect(grid, 1, 9 + arm, 5, 11, ROCK.dark);
  fillRect(grid, 18, 9 + arm, 5, 11, ROCK.dark);
  fillRect(grid, 6, 19, 4, 6, ROCK.dark); // the legs
  fillRect(grid, 14, 19, 4, 6, ROCK.dark);
  fillRect(grid, 5, 8, 14, 12, ROCK.base);
  fillRect(grid, 5, 8, 14, 2, ROCK.light);
  fillRect(grid, 8, 1, 8, 8, ROCK.base);
  fillRect(grid, 8, 1, 8, 1, ROCK.light);
  fillRect(grid, 9, 4, 2, 2, color); // the eyes
  fillRect(grid, 13, 4, 2, 2, color);
  fillRect(grid, 10, 12, 4, 4, color); // the crystal heart
  dot(grid, 10, 12, lighter(color, 0.6));
  fillRect(grid, 2, 7 + arm, 2, 2, color); // crystals on the shoulders
  fillRect(grid, 20, 7 + arm, 2, 2, color);
  sprinkle(grid, ROCK.dark, 0.08, 80, ROCK.base);
  return grid;
}

const ARMOR = { base: '#2c2a36', light: '#4a4858', shine: '#7a7890' };

function knight(color, frame) {
  const grid = makeGrid(20, 30);
  fillRect(grid, 6, 10, 10, 16, darker(color, 0.35)); // the cape
  fillRect(grid, 6, 20, 3, 8, ARMOR.base); // the legs
  fillRect(grid, 11, 20, 3, 8, ARMOR.base);
  fillRect(grid, 5, 10, 10, 11, ARMOR.base);
  fillRect(grid, 5, 10, 10, 2, ARMOR.light);
  fillRect(grid, 5, 17, 10, 1, color); // the belt
  fillEllipse(grid, 5, 11, 2.5, 2, ARMOR.light);
  fillEllipse(grid, 15, 11, 2.5, 2, ARMOR.light);
  fillRect(grid, 6, 3, 8, 8, ARMOR.base); // the helmet
  fillRect(grid, 6, 3, 8, 1, ARMOR.shine);
  fillRect(grid, 7, 6, 6, 1, lighter(color, 0.3)); // the eyes
  fillRect(grid, 9, 0, 2, 3, color); // the plume
  dot(grid, 11, 0 + frame, color);
  fillRect(grid, 2, 4, 1, 14, '#d9dee8'); // the sword
  fillRect(grid, 1, 15, 4, 1, '#e8b83a');
  fillRect(grid, 2, 16, 1, 3, WOOD.dark);
  return grid;
}

function lich(color, frame) {
  const grid = makeGrid(22, 30);
  const float = frame;
  for (let y = 10; y < 29; y++) {
    const half = Math.round(3 + (y - 10) * 0.42);
    fillRect(grid, 12 - half, y - float, half * 2, 1, '#3a2a55');
    fillRect(grid, 12, y - float, half, 1, '#2a1d40');
  }
  fillEllipse(grid, 12, 9 - float, 5.5, 5.5, '#2a1d40'); // the hood
  fillEllipse(grid, 12, 10 - float, 3.5, 3.5, '#ece7d8'); // the skull
  dot(grid, 10, 10 - float, color);
  dot(grid, 13, 10 - float, color);
  fillRect(grid, 11, 12 - float, 2, 1, '#2a1f2e');
  drawLine(grid, 3, 5 - float, 3, 29 - float, WOOD.dark); // the staff
  fillEllipse(grid, 3, 3 - float, 2.5, 2.5, color);
  dot(grid, 2, 2 - float, lighter(color, 0.6));
  fillRect(grid, 4, 16 - float, 2, 2, '#ece7d8'); // the hand
  return grid;
}

function warden(color, frame) {
  const grid = makeGrid(24, 30);
  fillRect(grid, 7, 26, 4, 4, ARMOR.base);
  fillRect(grid, 13, 26, 4, 4, ARMOR.base);
  fillRect(grid, 5, 15, 14, 12, '#4f5a7a');
  fillRect(grid, 5, 15, 14, 2, '#6f7a9a');
  fillRect(grid, 2, 16, 3, 9, '#4f5a7a');
  fillRect(grid, 19, 16, 3, 9, '#4f5a7a');
  fillEllipse(grid, 12, 8, 8, 8, '#ece7d8'); // a clock for a head
  fillEllipse(grid, 12, 8, 6.5, 6.5, color);
  fillEllipse(grid, 12, 8, 5, 5, '#fff6d8');
  const hands = [
    [0, -4],
    [4, 0],
    [0, 4],
    [-4, 0],
  ];
  const [hx, hy] = hands[frame * 2];
  drawLine(grid, 12, 8, 12 + hx, 8 + hy, '#2a1f2e'); // the hands of the clock turn
  drawLine(grid, 12, 8, 14, 8, '#2a1f2e');
  return grid;
}

function general(color, frame) {
  const grid = makeGrid(26, 32);
  fillRect(grid, 6, 11, 14, 18, '#8a1f1f'); // the red cape
  fillRect(grid, 7, 22, 4, 9, ARMOR.base);
  fillRect(grid, 15, 22, 4, 9, ARMOR.base);
  fillRect(grid, 6, 11, 14, 12, '#4a4654');
  fillRect(grid, 6, 11, 14, 2, '#6a6674');
  fillRect(grid, 6, 18, 14, 2, color);
  fillEllipse(grid, 6, 12, 3, 2.5, '#6a6674');
  fillEllipse(grid, 20, 12, 3, 2.5, '#6a6674');
  fillRect(grid, 8, 2, 10, 9, '#5a5664'); // the helmet
  fillRect(grid, 9, 6, 8, 2, '#ff4040');
  fillRect(grid, 6, 0, 2, 4, color); // the horns of the helmet
  fillRect(grid, 18, 0, 2, 4, color);
  fillRect(grid, 2, 1 + frame, 2, 22, '#d9dee8'); // the great sword
  fillRect(grid, 0, 19 + frame, 6, 2, '#e8b83a');
  return grid;
}

function king(color, frame) {
  const grid = makeGrid(30, 36);
  const float = frame;
  for (let y = 12; y < 35; y++) {
    const half = Math.round(5 + (y - 12) * 0.42);
    fillRect(grid, 15 - half, y - float, half * 2, 1, '#14101e');
    fillRect(grid, 15 - Math.round(half / 2), y - float, half, 1, darker(color, 0.6));
  }
  fillEllipse(grid, 15, 11 - float, 5.5, 6, '#d9d0e0'); // the face
  fillRect(grid, 12, 10 - float, 2, 2, color); // the eyes
  fillRect(grid, 17, 10 - float, 2, 2, color);
  fillRect(grid, 13, 14 - float, 4, 1, '#2a1f2e');
  drawLine(grid, 10, 7 - float, 6, 0 - float, '#14101e'); // the horns
  drawLine(grid, 11, 7 - float, 7, 0 - float, '#14101e');
  drawLine(grid, 20, 7 - float, 24, 0 - float, '#14101e');
  drawLine(grid, 19, 7 - float, 23, 0 - float, '#14101e');
  fillRect(grid, 11, 4 - float, 9, 2, '#ffd23f'); // the crown
  [11, 15, 19].forEach((x) => fillRect(grid, x, 2 - float, 1, 2, '#ffd23f'));
  return grid;
}

const PAINTERS = { treant: treant, golem: golem, knight: knight, lich: lich, warden: warden, general: general, king: king };

// ---------- The sprite ----------

// The grid of a monster, looking left. frame: 0 or 1.
function monsterGrid(shape, color, frame) {
  if (PICTURES[shape]) return pictureGrid(shape, color, frame);
  return PAINTERS[shape](color, frame);
}

// monster: { shape, category }. dir: 'left' (default) or 'right'. frame: 0 or 1.
// Returns { canvas, white, ax, ay }: `white` is the same picture all white (when it is hit).
export function monsterSprite(monster, dir, frame) {
  const color = typeOf(monster.category).color;
  return once('monster' + monster.shape + color + dir + frame, () => {
    const grid = padded(monsterGrid(monster.shape, color, frame));
    const outlined = addOutline(dir === 'right' ? mirrored(grid) : grid, OUTLINE);
    const canvas = toCanvas(outlined);
    return { canvas: canvas, white: silhouette(canvas, '#ffffff'), ax: Math.floor(grid.width / 2), ay: grid.height - 1 };
  });
}
