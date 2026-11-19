import { addOutline, colorAt, dot, drawLine, drawPicture, fillRect, makeGrid, once, toCanvas } from './pixels';
import { OUTLINE, GOLD_RAMP, STEEL_RAMP, darker, lighter, mix } from './palette';

// Full-scale 64x64 HD-2D JRPG Bust Portraits matching Hero & Luna:
// High rounded/spiky hair crown (y=2..9) cascading ALL the way down to y=24..27 across brow/eyes!
// Large gleaming irises, a thin jaw, wide shoulders (armor, scarves).

const SIZE = 64;

function hexOf(val, fallback) {
  return typeof val === 'string' && val.startsWith('#') ? val : fallback;
}

function portraitColors(look) {
  const skin = hexOf(look.skin, '#f3d2b3');
  const hair = hexOf(look.hair, '#5a3a1e');
  const outfit = hexOf(look.outfit, '#4a628a');
  const trim = hexOf(look.trim, GOLD_RAMP[3]);
  const eyes = hexOf(look.eyes, '#3a6fd8');
  const scarf = hexOf(look.scarf, look.scarf ? trim : '#b42838');
  return {
    D: mix(skin, '#461a1e', 0.56),
    S: mix(skin, '#6e2e30', 0.34),
    s: mix(skin, '#9d4d48', 0.18),
    k: skin,
    l: lighter(skin, 0.22),
    r: mix(skin, '#eb6e7b', 0.44),
    m: mix(skin, '#6e2e36', 0.54),
    E: OUTLINE,
    W: '#ffffff',
    I: eyes,
    i: darker(eyes, 0.44),
    j: lighter(eyes, 0.42),
    0: mix(hair, '#0d0818', 0.72),
    1: mix(darker(hair, 0.38), '#1c122e', 0.25),
    2: hair,
    3: lighter(hair, 0.36),
    o: mix(outfit, '#120d1e', 0.52),
    O: darker(outfit, 0.25),
    u: outfit,
    U: lighter(outfit, 0.24),
    t: darker(trim, 0.32),
    T: trim,
    y: lighter(trim, 0.38),
    n: STEEL_RAMP[1],
    N: STEEL_RAMP[2],
    a: STEEL_RAMP[3],
    A: STEEL_RAMP[4],
    g: GOLD_RAMP[2],
    G: GOLD_RAMP[4],
    b: '#2b1e20',
    B: '#4f352e',
    c: '#efe8f2',
    C: '#c9c0d6',
    f: darker(scarf, 0.32),
    F: scarf,
    R: lighter(scarf, 0.28),
    h: '#241634',
    H: '#4b2a5a',
    v: '#7a458c',
  };
}

function paintBackdrop(bg, look) {
  const cx = 32;
  const cy = 28;
  const glow = mix(look.trim || '#6a5a9a', '#241e38', 0.78);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const d = Math.min(1, Math.hypot((x - cx) / 34, (y - cy) / 34));
      const base = d < 0.45 ? mix(glow, '#181428', d / 0.45) : mix('#181428', '#0c0914', (d - 0.45) / 0.55);
      dot(bg, x, y, base);
    }
  }
  for (let i = 0; i < SIZE; i++) {
    dot(bg, i, 0, '#140f1e');
    dot(bg, i, SIZE - 1, '#140f1e');
    dot(bg, 0, i, '#140f1e');
    dot(bg, SIZE - 1, i, '#140f1e');
  }
}

// ---------- Broad Heroic Bust & Shoulders (x = 10..53, y = 44..63) ----------

function paintBust(grid, c, look) {
  drawPicture(grid, [
    '....DDDDDDDDDD....',
    '...SDDDDDDDDDDS...',
    '..ssSDDDDDDDDDSs..',
    '.sskkSSSSSSSSkkss.',
  ], c, 23, 40);

  if (look.sword) {
    drawPicture(grid, [
      '..........nnnAAooooTTCcTTooooAAnnn..........',
      '.......nnnAAAAaaoooOUccUOoooaAAAAannn.......',
      '.....nnAAAAAaaaaaoOOuccuOOoaaaaaAAAAAnn.....',
      '....mAAAaaaaNNNNmmObBooooOOmmNNNNaaaaAAAm...',
      '...mNNaaaaNNNNNmmmoOObBOOOuooommNNNNNaaaaNm.',
      '..nNNaaaNNNNNmmmOooUuUbBOuuuuOommmNNNNNaaaNn',
      '..nNmmNNNNNmmmOooooUuuuUbBOuuuOoommmNNNNNmnn',
      '.oOOmmmmmmmmmOoooUUuuuuuUbBOuuuOOoommmmmmmOO',
      '.oOOOOoooooOOOOoouuuuuuuuUbBOuuuOooOOoooOOOO',
      '.oOOOOOOOOOOuOOoouuuuUuuuuGggGOooOuuOOOOOOOO',
      'oOOOOOOoOOOOuOOoouuuUUuuuUGggGOooOuuOOOoOOOO',
      'oOOOOOoOOOOOuOOoouuUUuuuubBOuuOooOuuOOOOoOOO',
      'oOOOOoOOOOOOuOOoouuuuuuuubBOuuOooOuuOOOOOoOO',
      'oOOOoOOOOOOOoOOoouuuuuOoubBOuuOooOuuOOOOOOoO',
      'oOOoOOOOOOOOoOOoouuuuOOoubBOuuOooOuuOOOOOOOO',
      'ooOoOOOOOOOOoOOoouuuOOooouBOuuOooOuuOOOOOOOO',
      'oooOOOOOOOOOoOOoooooooooouBOoooooOuuOOOOOOOO',
      'oooOOOOOOOOOoOOooooooooooBoooooooOuuOOOOOOOO',
      'ooOOOOOOOOOOoOOooooooooooooooooooOuuOOOOOOOO',
      'ooOOOOOOOOOOoOOooooooooooooooooooOuuOOOOOOOO',
    ], c, 10, 44);
  } else if (look.skirt) {
    drawPicture(grid, [
      '..........ooTToolllllGGlllllooTToo..........',
      '........ooUUTTTToCcccGccccCTTTTUUoo.........',
      '......ooUUUUtTTTTCccccccccCTTTtuUUUoo.......',
      '.....ooOUUUUUuuttTCcGGGGcCTttuuUUUUUOoo.....',
      '....oOOUUUUUUUuutTTGGGGGGTTtuuUUUUUUUOOo....',
      '...oOOOUUuuUUUUuootTTTTTTtoouUUUUuuUUOOOo...',
      '..oOOOuuOOuUUUUuoOuuuuuuuuOOouUUUuOOuuOOOo..',
      '..oOOuuOOOuuUUUuoOuuuuuuuuOOouUUuOOOuuOOOo..',
      '.oOOOuuOOOuuUUUuoOuuuUUuuuOOouUUuOOOuuOOOOo.',
      '.oOOuuuOOOuuUUUuoOuuUUUUuuOOouUUuOOOuuuOOOo.',
      'oOOOuuuOOOuuUUUuoOuuUUUUuuOOouUUuOOOuuuOOOOo',
      'oOOuuuuOOOuuUUUuoOuuuuuuuuOOouUUuOOOuuuuOOOo',
      'oOOuuuuOOOuuUUUuoOuuuuuuuuOOouUUuOOOuuuuOOOo',
      'oOOuuuuOOOuuUUUuooottttttoooouUUuOOOuuuuOOOo',
      'oOOuuuuOOOuuUUUuooooooooooooouUUuOOOuuuuOOOo',
      'oOOuuuuOOOuuUUUuooooooooooooouUUuOOOuuuuOOOo',
      'oOOuuuuOOOuuUUUuooooooooooooouUUuOOOuuuuOOOo',
      'oOOuuuuOOOuuUUUuooooooooooooouUUuOOOuuuuOOOo',
      'oOOuuuuOOOuuUUUuooooooooooooouUUuOOOuuuuOOOo',
      'oOOuuuuOOOuuUUUuooooooooooooouUUuOOOuuuuOOOo',
    ], c, 10, 44);
  } else if (look.burly) {
    drawPicture(grid, [
      '.........oUUUUoCCccCCcCCoUUUUo.........',
      '......oooOUUUUobBCcCCCcBboUUUUOooo.....',
      '....ooOOUUUUUUbBObBcccBObBOUUUUUOOoo...',
      '...oOOUUUUUUUUbBObBBBBBbobBOUUUUUUUOOo.',
      '..oOOUUuuUUUUUbBObbbbbbbObBOUUUUUuuUUOo',
      '..oOOuuOOuuUUUGGgBBBBBBBGGgBOUUUuuOOuOO',
      '.oOOOuuOOuuUUUGGgBBBBBBBGGgBOUUUuuOOuuO',
      '.oOOuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOOuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOuuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOuuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOuuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOuuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOuuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOuuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOuuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOuuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOuuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOuuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
      'oOOuuuuOOuuUUuubBBBBBBBBBBBbbUUUuuOOuuu',
    ], c, 12, 44);
  } else {
    drawPicture(grid, [
      '.........ooTToCCCllllCCCoTToo..........',
      '.......ooUUUUTtCCcccccCtTUUUUoo........',
      '.....ooOOUUUUUutTCcccCTtuUUUUUOOoo.....',
      '....oOOUUuuUUUUooTTCCTTooUUUUuuUUOOo...',
      '...oOOUuuOOuuUUooOGGGOoooUUuuOOuuUOOo..',
      '..oOOuuOOOOuuUUoooGGOooooUUuuOOOOuuOOo.',
      '..oOOuuOOOOuuUUoooOOoooooUUuuOOOOuuOOo.',
      '.oOOOuuOOOOuuUUooooooooooUUuuOOOOuuOOOo',
      '.oOOuuuOOOOuuUUooooooooooUUuuOOOOuuuOOo',
      'oOOOuuuOOOOuuUUooooooooooUUuuOOOOuuuOOo',
      'oOOuuuuOOOOuuUUooooooooooUUuuOOOOuuuuOo',
      'oOOuuuuOOOOuuUUooooooooooUUuuOOOOuuuuOo',
      'oOOuuuuOOOOuuUUooooooooooUUuuOOOOuuuuOo',
      'oOOuuuuOOOOuuUUooooooooooUUuuOOOOuuuuOo',
      'oOOuuuuOOOOuuUUooooooooooUUuuOOOOuuuuOo',
      'oOOuuuuOOOOuuUUooooooooooUUuuOOOOuuuuOo',
      'oOOuuuuOOOOuuUUooooooooooUUuuOOOOuuuuOo',
      'oOOuuuuOOOOuuUUooooooooooUUuuOOOOuuuuOo',
      'oOOuuuuOOOOuuUUooooooooooUUuuOOOOuuuuOo',
      'oOOuuuuOOOOuuUUooooooooooUUuuOOOOuuuuOo',
    ], c, 13, 44);
  }

  if (look.scarf) {
    drawPicture(grid, [
      '..ffFFFFFFFFFFFFFFFFFFFFFFff..',
      '.fFFRRRRFFFFFFFFFFFFFFRRRFFFf.',
      '.fFFFFFFFFFffffffffFFFFFFFFFf.',
      '..ffFFFFFFFFFFFFFFFFFFFffff...',
      '.fFFRRRRFFff...ffFFFFFf.......',
      '.fFFFFFff.........ffFFf.......',
      '..ffff..............ff........',
    ], c, 17, 40);
  }
}

// ---------- Compact JRPG Anime Face Mask (y = 19..41) ----------

const PORTRAIT_FACE = [
  '.....sskkkkkkkkkkkkkkss.....',
  '....skkllllllllllllllkks....',
  '...skkllllllllllllllllkks...',
  '..skkllllllllllllllllllkks..',
  '..skkkkkkkkkkkkkkkkkkkkkks..',
  '.skkkkkkkkkkkkkkkkkkkkkkkks.',
  '.skkkkkkkkkkkkkkkkkkkkkkkks.',
  '.skkkkkkkkkkkkkkkkkkkkkkkks.',
  '.skkkkkkkkkkkkkkkkkkkkkkkks.',
  '.skrrrkkkkkkkkkkkkkkkkrrrks.',
  '.skrrrkkkkkkkkkkkkkkkkrrrks.',
  '..skkkkkkkkksssskkkkkkkkks..',
  '..sskkkkkkkkkkkkkkkkkkkkss..',
  '...sskkkkkkkkkkkkkkkkkkss...',
  '...ssskkkkkkkkkkkkkkkksss...',
  '....ssskkkkkkkkkkkkkksss....',
  '.....sssskkkkkkkkkkssss.....',
  '......ssssskkkkkksssss......',
  '........SSSSkkkkSSSS........',
  '..........SSSSSSSS..........',
];

function paintEyesAndMouth(grid, c, look, expression) {
  drawLine(grid, 20, 23, 26, 23, c['0']);
  drawLine(grid, 37, 23, 43, 23, c['0']);

  if (expression === 'hurt' || expression === 'sad') {
    drawLine(grid, 20, 26, 26, 29, c.E);
    drawLine(grid, 20, 31, 26, 29, c.E);
    drawLine(grid, 43, 26, 37, 29, c.E);
    drawLine(grid, 43, 31, 37, 29, c.E);
    drawLine(grid, 29, 37, 34, 37, c.m);
  } else {
    const leftEye = expression === 'happy' ? [
      '.EEEEE.',
      'EE...EE',
      '.......',
    ] : [
      'EEEEEE.',
      'EWWiiiE',
      'EWWIIIE',
      'EiIIIIE',
      'EijjjjE',
      '.EjjW..',
    ];
    const rightEye = expression === 'happy' ? [
      '.EEEEE.',
      'EE...EE',
      '.......',
    ] : [
      '.EEEEEE',
      'EiiiWWE',
      'EIIIWWE',
      'EIIIIiE',
      'EjjjjiE',
      '..WjjE.',
    ];
    drawPicture(grid, leftEye, c, 20, expression === 'happy' ? 27 : 25);
    drawPicture(grid, rightEye, c, 37, expression === 'happy' ? 27 : 25);

    dot(grid, 31, 33, c.s);
    dot(grid, 32, 33, c.l);
    if (expression === 'happy') {
      drawLine(grid, 29, 36, 34, 36, c.m);
      fillRect(grid, 30, 37, 4, 1, c.r);
    } else if (expression === 'angry') {
      drawLine(grid, 20, 22, 26, 24, c['0']);
      drawLine(grid, 43, 22, 37, 24, c['0']);
      drawLine(grid, 29, 37, 34, 37, c.m);
    } else {
      drawLine(grid, 30, 37, 33, 37, c.m);
      dot(grid, 29, 36, c.s);
      dot(grid, 34, 36, c.s);
    }
  }

  if (look.beard) {
    drawPicture(grid, [
      '....012222222222222210....',
      '...01222221mmmm12222210...',
      '...01222222222222222210...',
      '....012222222222222210....',
      '....011222222222222110....',
      '.....0122222222222210.....',
      '......01222222222210......',
      '.......012222222210.......',
      '........0122222210........',
      '.........01222210.........',
      '..........011110..........',
    ], c, 19, 34);
  }
}

// ---------- Tall Crown + Long Draping Bangs Covering Forehead Down to y=26! ----------

function paintBackHair(grid, c, style) {
  if (style === 'long') {
    drawPicture(grid, [
      '..........01111111111111111111111110..........',
      '........012222222222222222222222222210........',
      '......0122222222222222222222222222222210......',
      '.....012221111111111111111111111111222210.....',
      '....012210............................012210..',
      '...012210..............................012210.',
      '..0122210..............................0122210',
      '..0122210..............................0122210',
      '..0122210..............................0122210',
      '..012210................................012210',
      '..012210................................012210',
      '...01210................................01210.',
    ], c, 9, 13);
    fillRect(grid, 9, 25, 8, 38, c['1']);
    fillRect(grid, 47, 25, 8, 38, c['1']);
    fillRect(grid, 11, 27, 5, 36, c['2']);
    fillRect(grid, 48, 27, 5, 36, c['2']);
    drawLine(grid, 12, 26, 11, 60, c['0']);
    drawLine(grid, 51, 26, 52, 60, c['0']);
  } else if (style === 'twin') {
    drawPicture(grid, [
      '..tTTt..................................tTTt..',
      '.122221................................122221.',
      '01223210..............................01232210',
      '01222210..............................01222210',
      '0122210................................0122210',
      '012210..................................012210',
      '.0110....................................0110.',
    ], c, 9, 22);
    fillRect(grid, 8, 29, 7, 30, c['1']);
    fillRect(grid, 49, 29, 7, 30, c['1']);
    fillRect(grid, 9, 29, 5, 28, c['2']);
    fillRect(grid, 50, 29, 5, 28, c['2']);
  } else if (style === 'pony') {
    drawPicture(grid, [
      '....0122210...',
      '...012333210..',
      '...012222210..',
      '....0122210...',
      '....012210....',
    ], c, 40, 24);
    fillRect(grid, 43, 29, 8, 25, c['1']);
    fillRect(grid, 44, 29, 5, 23, c['2']);
    drawLine(grid, 46, 30, 46, 50, c['0']);
  } else if (style === 'bun') {
    drawPicture(grid, [
      '....012222210....',
      '..0122333332210..',
      '..0122222222210..',
      '...tTTTTTTTTTt...',
    ], c, 23, 2);
  }
}

function paintFrontHair(grid, c, style) {
  if (style === 'bald') {
    drawPicture(grid, [
      '.........skllllllllllks.........',
      '......skllllllllllllllllks......',
      '.....skllllllllllllllllllks.....',
      '....skllllllllllllllllllllks....',
      '....skllllllllllllllllllllks....',
      '....1kllllllllllllllllllllk1....',
      '....01....................10....',
      '....01....................10....',
    ], c, 16, 11);
    return;
  }

  if (style === 'spiky') {
    // High spiky crown y=3..9 curving outward, bangs draping ALL the way DOWN to y=25..27 over brows!
    drawPicture(grid, [
      '..............222...222222..222...............',
      '...........122232..22333322.23221.............',
      '........2212222332233333332233222122..........',
      '......12222222222222222222222222222221........',
      '.....01222222233333333333333333332222210......',
      '....0122222222222222222222222222222222210.....',
      '...012222222222222222222222222222222222210....',
      '..012222222222222222222222222222222222222210..',
      '.01222222222222222222222222222222222222222210.',
      '.01222222222222222222222222222222222222222210.',
      '0122222222222222222222222222222222222222222210',
      '0122222222222222222222222222222222222222222210',
      '0122222022222202222220222222022222202222220210',
      '0122221012222101222210122221012222101222210110',
      '0122210122220.0122220.012220.012220.012220.010',
      '.01220122210..012210..012210.012210.012210..0.',
      '.01210.0120....0120....0120...0120...0120.....',
      '..010...00......00......00.....00.....00......',
      '...0..........................................',
    ], c, 9, 4);
    return;
  }

  // Rounded high anime crown (y=6..26) with thick layered locks covering brow down onto eyes y=25..26!
  drawPicture(grid, [
    '...............0122222222222210...............',
    '............0122222223333222222210............',
    '.........0122222233333333333322222210.........',
    '.......01222222333333333333333322222210.......',
    '.....012222222222222222222222222222222210.....',
    '....01222222222222222222222222222222222210....',
    '...0122222222222222222222222222222222222210...',
    '..012222222222222222222222222222222222222210..',
    '..012222222222222222222222222222222222222210..',
    '.01222222222222222222222222222222222222222210.',
    '.01222222222222222222222222222222222222222210.',
    '.01222222222222222222222222222222222222222210.',
    '.01222222222222222222222222222222222222222210.',
    '.01222222022222220222222202222222022222220210.',
    '.01222221012222210122222101222221012222210110.',
    '.01222210.0122220.0122220.0122220.0122220.010.',
    '..012220...01220...01220...01220...01220...0..',
    '..012210....0120....0120....0120....0120......',
    '...0120......00......00......00......00.......',
    '...0110.......................................',
  ], c, 9, 6);

  if (style === 'long' || style === 'twin') {
    drawPicture(grid, [
      '01221..........................12210',
      '01221..........................12210',
      '01220..........................02210',
      '01210..........................01210',
      '01110..........................01110',
      '.0110..........................0110.',
      '..010..........................010..',
      '...0............................0...',
    ], c, 14, 24);
  }
}

function paintTraits(grid, c, look) {
  if (look.elfEars) {
    drawPicture(grid, ['llkk', '.ssk'], c, 13, 27);
    drawPicture(grid, ['kkll', 'kss.'], c, 47, 27);
  }
  if (look.ears) {
    drawPicture(grid, [
      '..00....................00..',
      '.0c20..................02c0.',
      '01cc21................12cc10',
      '1ccc221..............122ccc1',
      '.122221..............122221.',
    ], c, 18, 2);
  }
  if (look.horns) {
    drawPicture(grid, [
      'h........................h',
      'Hh......................hH',
      '.vHh..................hHv.',
      '..HvH................HvH..',
    ], c, 19, 2);
  }
}

export function portraitCanvas(look, expression = 'normal') {
  return once('portraitV6_' + JSON.stringify(look) + expression, () => {
    const bg = makeGrid(SIZE, SIZE);
    paintBackdrop(bg, look);

    const fg = makeGrid(SIZE, SIZE);
    const c = portraitColors(look);
    const style = look.style || 'short';

    paintBackHair(fg, c, style);
    paintBust(fg, c, look);
    drawPicture(fg, PORTRAIT_FACE, c, 18, 19);
    paintEyesAndMouth(fg, c, look, expression);
    paintFrontHair(fg, c, style);
    paintTraits(fg, c, look);

    const outlined = addOutline(fg, OUTLINE);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const col = colorAt(outlined, x, y);
        if (col) dot(bg, x, y, col);
      }
    }
    return toCanvas(bg);
  });
}
