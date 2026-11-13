import { makeGrid, drawPicture, drawLine, fillRect, addOutline, mirrored, toCanvas, once } from './pixels';
import { OUTLINE, darker, lighter } from './palette';

// The people walking on the map, in pixel art. A person is made of text pictures (one letter = one pixel):
// a head, a torso and legs, then the hair style and the extras (beard, fox ears, horns...) painted on top.
// A "look" is: { skin, hair, style, eyes, outfit, trim, pants?, boots?, small?, ears?, horns?, beard?, sword? }
// style: 'short' | 'long' | 'twin' | 'pony' | 'bun' | 'bald' | 'spiky'

// The letters of the pictures. Each look gives them its own colors (see colorsOf).
// H hair, h hair shadow, L hair shine, S skin, s skin shadow, l skin shine, D eye, W white, E iris, K blush,
// C clothes, c clothes shadow, T trim (collar, belt, scarf), P pants, B boots, X horn, Z inside of an ear,
// V blade, G blade edge, Y gold, N handle.

const HEADS = {
  down: [
    '................',
    '.....HHHHHH.....',
    '...HHHHHHHHHH...',
    '..HHHLLHHHHHHH..',
    '..HHLLHHHHHHHH..',
    '..HHHHHHHHHHHH..',
    '..HHSHHHHHHSHh..',
    '..HSSSSSSSSSSh..',
    '..HSDWSSSSDWSh..',
    '..hSEESSSSEESh..',
    '..hSKSSssSSKSh..',
    '...sSSSSSSSSs...',
  ],
  up: [
    '................',
    '.....HHHHHH.....',
    '...HHHHHHHHHH...',
    '..HHHHHHHHHHHH..',
    '..HHHHHLLHHHHH..',
    '..HHHHLLHHHHHH..',
    '..HHHHHHHHHHHH..',
    '..HHHHHHHHHHHH..',
    '..HHHHHHHHHHHH..',
    '..hHHHHHHHHHHh..',
    '..ShhHHHHHHhhS..',
    '....sSSSSSSs....',
  ],
  side: [
    '................',
    '....HHHHHH......',
    '..HHHHHHHHHH....',
    '.HHHHHHHHLLHH...',
    '.HHHHHHHLLHHHH..',
    '.HHHHHHHHHHHHH..',
    '.HHHHHHHHHSHHH..',
    '.HHHHHHSSSSSSH..',
    '.hHHHHSSSSDWSS..',
    '.hHHHSSSSSEESS..',
    '..hHSSSSSSKSS...',
    '...hsSSSSSs.....',
  ],
};

const TORSOS = {
  down: [
    '.....TTTTTT.....',
    '...CCCTTTTCCC...',
    '..CCCCCTTCCCCC..',
    '..CcCCCCCCCCcC..',
    '..ScCCCCCCCCcS..',
    '...TTTTTTTTTT...',
    '...cCCCCCCCCc...',
  ],
  up: [
    '.....TTTTTT.....',
    '...CCCCCCCCCC...',
    '..CCCCCCCCCCCC..',
    '..CcCCCCCCCCcC..',
    '..ScCCCCCCCCcS..',
    '...TTTTTTTTTT...',
    '...cCCCCCCCCc...',
  ],
  side: [
    '......TTTT......',
    '.....CCCCCC.....',
    '.....CCCCCCC....',
    '.....CCcCCCC....',
    '.....cCSCCCc....',
    '.....TTTTTTT....',
    '.....cCCCCCc....',
  ],
};

// The legs: [standing, walking]. Front and back views walk with the left foot, then the right one (mirror).
const LEGS = {
  front: [
    ['....PPPPPPPP....', '....PPP..PPP....', '....PPP..PPP....', '....BBB..BBB....', '................'],
    ['....PPPPPPPP....', '....PPP..PPP....', '....BBB..PPP....', '.........BBB....', '................'],
  ],
  side: [
    ['......PPPPP.....', '......PPPP......', '......PPPP......', '......BBBBB.....', '................'],
    ['......PPPPP.....', '.....PP..PP.....', '....PP....PP....', '...BBB.....BBB..', '................'],
  ],
};

// The hair styles and the extras, painted over the person: { down, up, side } -> { x, y, rows }.
// x, y: where the picture starts (y = -2 is above the head).
const STYLES = {
  long: {
    down: { y: 6, rows: ['.H............H.', '.HH..........HH.', '.HH..........HH.', '.hH..........Hh.', '.hH..........Hh.', '.hHH........HHh.', '.hHH........HHh.', '.hHH........HHh.', '..hH........Hh..', '..hh........hh..'] },
    up: { y: 9, rows: ['..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..hHHHHHHHHHHh..', '..hHHHHHHHHHHh..', '...hHHHHHHHHh...', '....hhhhhhhh....'] },
    side: { y: 6, rows: ['.HH.............', 'HHH.............', 'HHH.............', 'HhH.............', 'HhHH............', 'HhHH............', '.hHHH...........', '.hHHH...........', '..hHH...........', '..hh............'] },
  },
  twin: {
    down: { y: 4, rows: ['.T............T.', 'HHH..........HHH', 'HH............HH', 'HH............HH', 'Hh............hH', 'Hh............hH', 'hh............hh', 'hh............hh', '.h............h.'] },
    up: { y: 4, rows: ['.T............T.', 'HHH..........HHH', 'HH............HH', 'HH............HH', 'Hh............hH', 'Hh............hH', 'hh............hh', 'hh............hh', '.h............h.'] },
    side: { y: 4, rows: ['.T..............', 'HHH.............', 'HH..............', 'HH..............', 'Hh..............', 'Hh..............', 'hh..............', 'hh..............', '.h..............'] },
  },
  pony: {
    down: { y: 4, rows: ['..............T.', '..............HH', '..............HH', '..............Hh', '..............h.'] },
    up: { y: 8, rows: ['......TTTT......', '......HHHH......', '......HHHH......', '......HhHH......', '.......hH.......', '.......hh.......'] },
    side: { y: 3, rows: ['.T..............', 'HHH.............', 'HHH.............', 'Hh..............', 'Hh..............', 'h...............'] },
  },
  bun: {
    down: { y: -1, rows: ['......HHHH......', '.....HLHHHH.....'] },
    up: { y: -1, rows: ['......HHHH......', '.....HLHHHH.....'] },
    side: { y: -1, rows: ['...HHHH.........', '..HLHHH.........'] },
  },
  bald: {
    down: { y: 1, rows: ['.....SSSSSS.....', '...SSllSSSSSS...', '..HSlSSSSSSSSH..', '..HSSSSSSSSSSH..', '..HSSSSSSSSSSH..', '..HHSSSSSSSSHh..'] },
    up: { y: 1, rows: ['.....SSSSSS.....', '...SSSSllSSSS...', '..SSSSllSSSSSS..', '..SSSSSSSSSSSS..', '..HSSSSSSSSSSH..', '..HHSSSSSSSSHH..'] },
    side: { y: 1, rows: ['....SSSSSS......', '..SSSSSllSSS....', '.HSSSSSSllSSS...', '.HSSSSSSSSSSSS..', '.HHSSSSSSSSSSS..', '.HHHHHHHSSSSSS..'] },
  },
  spiky: {
    down: { y: -1, rows: ['....H..H..H.....', '...HH.HHH.HHH...', '..HHH......HHH..'] },
    up: { y: -1, rows: ['....H..H..H.....', '...HH.HHH.HHH...', '..HHH......HHH..'] },
    side: { y: -1, rows: ['...H..H.........', '.HH.HHH.H.......', 'HHH.............', 'HH..............'] },
  },
};

const EXTRAS = {
  beard: {
    down: { y: 9, rows: ['..H..........H..', '..HH..HHHH..HH..', '...HHHHHHHHHH...', '....HHHHHHHH....', '.....HHHHHH.....', '......HHHH......'] },
    up: { y: 0, rows: [] },
    side: { y: 10, rows: ['......HHHHHHH...', '....HHHHHHHH....', '.....HHHHHH.....', '......HHHH......'] },
  },
  ears: {
    down: { y: -2, rows: ['..HH........HH..', '..HZH......HZH..', '..HZHH....HHZH..'] },
    up: { y: -2, rows: ['..HH........HH..', '..HHH......HHH..', '..HHHH....HHHH..'] },
    side: { y: -2, rows: ['..HH....HH......', '..HZH...HZH.....', '..HZHH..HZHH....'] },
  },
  horns: {
    down: { y: -2, rows: ['..X..........X..', '..XX........XX..', '...XX......XX...'] },
    up: { y: -2, rows: ['..X..........X..', '..XX........XX..', '...XX......XX...'] },
    side: { y: -2, rows: ['.X......X.......', '.XX.....XX......', '..XX.....XX.....'] },
  },
  scarf: {
    down: { y: 0, rows: [] },
    up: { y: 13, rows: ['......TT........', '......TTT.......', '.......TT.......'] },
    side: { y: 12, rows: ['...TT...........', '..TTT...........', '..TT............'] },
  },
};

// The sword held forward, in a fight (side view only).
const SWORD = { x: 7, y: 14, rows: ['.Y.........', 'NYVVVVVVVVV', '.YGGGGGGGG.'] };

function colorsOf(look) {
  return {
    H: look.hair,
    h: darker(look.hair, 0.3),
    L: lighter(look.hair, 0.4),
    S: look.skin,
    s: darker(look.skin, 0.16),
    l: lighter(look.skin, 0.45),
    D: '#1c1726',
    W: '#ffffff',
    E: look.eyes,
    K: '#f2989a',
    C: look.outfit,
    c: darker(look.outfit, 0.3),
    T: look.trim,
    P: look.pants || '#3b3652',
    B: look.boots || '#5a3a22',
    X: '#3a2c3e',
    Z: '#ffb3c8',
    V: '#eef3fa',
    G: '#9aa6b8',
    Y: '#e8b83a',
    N: '#6b4423',
  };
}

// The picture is painted in a bigger grid: room for the ears above, and for the sword on the right.
const GRID_WIDTH = 26;
const GRID_HEIGHT = 30;
const LEFT = 4;
const TOP = 3;

function paintOverlay(grid, overlay, colors) {
  if (overlay) drawPicture(grid, overlay.rows, colors, LEFT + (overlay.x || 0), TOP + overlay.y);
}

// A child is smaller: two rows of the torso are taken away.
function torsoOf(look, view) {
  const rows = TORSOS[view];
  return look.small ? rows.filter((row, index) => index !== 3 && index !== 6) : rows;
}

// view: 'down' | 'up' | 'side' (looking right). step: 0 standing, 1 walking. battle: holding the sword forward.
function personGrid(look, view, step, battle) {
  const colors = colorsOf(look);
  const grid = makeGrid(GRID_WIDTH, GRID_HEIGHT);
  const torso = torsoOf(look, view);
  const legs = LEGS[view === 'side' ? 'side' : 'front'][step];
  const shift = look.small ? 2 : 0; // a child stands lower in the picture: the feet stay at the same place
  if (look.style === 'long' && view === 'up') paintOverlay(grid, STYLES.long.up, colors);
  drawPicture(grid, HEADS[view], colors, LEFT, TOP + shift);
  drawPicture(grid, torso, colors, LEFT, TOP + shift + 12);
  drawPicture(grid, legs, colors, LEFT, TOP + shift + 12 + torso.length);
  const overlay = (table) => table && table[view] && { ...table[view], y: table[view].y + shift };
  if (!(look.style === 'long' && view === 'up')) paintOverlay(grid, overlay(STYLES[look.style]), colors);
  ['beard', 'ears', 'horns', 'scarf'].filter((extra) => look[extra]).forEach((extra) => paintOverlay(grid, overlay(EXTRAS[extra]), colors));
  if (battle && look.sword) paintOverlay(grid, SWORD, colors);
  return grid;
}

// A number for each look, to remember its pictures.
const lookIds = new WeakMap();
let nextLookId = 1;

function lookId(look) {
  if (!lookIds.has(look)) lookIds.set(look, nextLookId++);
  return lookIds.get(look);
}

// The point of the picture that stands on the ground (between the feet).
export const PERSON_ANCHOR = { x: LEFT + 8, y: TOP + 23 };

// dir: 'down' | 'up' | 'left' | 'right'. frame: 0 standing, 1 left foot, 2 standing, 3 right foot (a walk).
// battle: true = the fighting pose (side view, sword forward).
export function personSprite(look, dir, frame, battle = false) {
  const key = 'person' + lookId(look) + dir + frame + battle;
  return once(key, () => {
    const view = dir === 'left' || dir === 'right' ? 'side' : dir;
    const step = frame % 2;
    let grid = personGrid(look, view, step, battle);
    const isMirror = dir === 'left' || (view !== 'side' && frame === 3); // the right foot = the left foot in a mirror
    if (isMirror) grid = mirrored(grid);
    const anchorX = isMirror ? GRID_WIDTH - 1 - PERSON_ANCHOR.x : PERSON_ANCHOR.x;
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: anchorX, ay: PERSON_ANCHOR.y };
  });
}

// The frame of a walk: `step` grows while the person walks (see logic). Standing still: frame 0.
export function walkFrame(step, isWalking) {
  return isWalking ? Math.floor(step) % 4 : 0;
}

// ---------- The obsidian friends ----------

const SOLDIER_ROWS = [
  '......LL......',
  '.....LDDD.....',
  '....LDDDDD....',
  '....DVVVVD....',
  '....DDDDDD....',
  '.....DDDD.....',
  '...LDDDDDDD...',
  '..LDDDDDDDDD..',
  '..DDDLDDDDDD..',
  '..DDDDDDDDDD..',
  '...DDDDDDDD...',
  '....DD..DD....',
  '....DD..DD....',
  '...DDD..DDD...',
];

export function obsidianSoldier(frame) {
  return once('soldier' + (frame % 2), () => {
    const grid = makeGrid(18, 20);
    drawPicture(grid, SOLDIER_ROWS, { L: '#6a5aa0', D: '#251d38', V: '#c9a8ff' }, 1, frame % 2 ? 4 : 5);
    drawLine(grid, 15, 1, 15, 18, '#4a3b7a');
    fillRect(grid, 14, 0, 3, 2, '#c9a8ff');
    return { canvas: toCanvas(addOutline(grid, '#0d0a14')), ax: 8, ay: 19 };
  });
}

const CAT_ROWS = ['D...D.....', 'DD.DD.....', 'DVDVD....D', 'DDDDD...D.', '.DDDDDDDD.', '.DDDDDDDD.', '.D.D..D.D.'];

export function obsidianCat() {
  return once('cat', () => {
    const grid = makeGrid(12, 9);
    drawPicture(grid, CAT_ROWS, { D: '#251d38', V: '#c9a8ff' }, 1, 1);
    return { canvas: toCanvas(addOutline(grid, '#0d0a14')), ax: 6, ay: 8 };
  });
}
