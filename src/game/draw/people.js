import { addOutline, colorAt, drawLine, drawPicture, dot, fillRect, makeGrid, mirrored, once, padded, toCanvas } from './pixels';
import { OUTLINE, GOLD_RAMP, STEEL_RAMP, darker, lighter, mix } from './palette';
import { usesHeroArt } from '../data/hero';
import { isHeroArtReady, heroArtSprite } from './heroArt';
import { isCharacterArtReady, hasCharacterArt, characterSprite } from './characterArt';

// HD-2D JRPG Pixel Sprite Engine matched 1:1 to Hero (38px) & Luna (40px):
// Rounded/spiky high hair crown (y=2..13) with bangs overlapping down onto top of eyes (y=13..15),
// chin seated directly into collar/scarf (y=18), tailored 12px torso/robe, and 10px boots to y=39.

const W = 38;
const H = 44;
const CX = 19;
const FEET = 40;

const WALK = ['walk0', 'walk1', 'walk2', 'walk3'];

const POSES = {
  stand: { lift: 0, lean: 0, gait: 'stand', arm: 'rest', cape: 0 },
  breath: { lift: 1, lean: 0, gait: 'stand', arm: 'rest', cape: 0 },
  walk0: { lift: 0, lean: 1, gait: 'strideA', arm: 'swingA', cape: 1 },
  walk1: { lift: -1, lean: 1, gait: 'pass', arm: 'rest', cape: 2 },
  walk2: { lift: 0, lean: 1, gait: 'strideB', arm: 'swingB', cape: 1 },
  walk3: { lift: -1, lean: 1, gait: 'pass', arm: 'rest', cape: 2 },
  drink: { lift: 0, lean: 0, gait: 'stand', arm: 'drink', cape: 0 },
  sleep: { lift: 1, lean: 0, gait: 'stand', arm: 'rest', cape: 0, eyes: 'closed' },
  dead: { lift: 0, lean: 0, gait: 'stand', arm: 'rest', cape: 0, eyes: 'closed' },
  ready0: { lift: 1, lean: 1, gait: 'stance', arm: 'ready', cape: 1, sword: -40 },
  ready1: { lift: 0, lean: 1, gait: 'stance', arm: 'ready', cape: 2, sword: -35 },
  windup: { lift: 0, lean: -1, gait: 'stance', arm: 'raised', cape: 1, eyes: 'focus', sword: -125 },
  slash: { lift: 1, lean: 2, gait: 'lunge', arm: 'forward', cape: 3, eyes: 'focus', sword: 30 },
  cast: { lift: 0, lean: 1, gait: 'stance', arm: 'forward', cape: 3, eyes: 'focus', sword: -15 },
  hurt: { lift: 0, lean: -2, gait: 'stance', arm: 'hurt', cape: 0, eyes: 'wince', sword: 120 },
  victory: { lift: -1, lean: 0, gait: 'stand', arm: 'victory', cape: 2, eyes: 'happy', sword: -90 },
  ko: { lift: 0, lean: 0, gait: 'stand', arm: 'rest', cape: 0, eyes: 'closed' },
};

const SAME_AS = {
  run0: 'walk0', run1: 'walk1', run2: 'walk2', run3: 'walk3',
  swing: 'slash', cast0: 'cast', cast1: 'cast',
  fall: 'hurt', roll: 'hurt', cheer: 'victory', guard: 'ready0',
  windupJump: 'windup', windupCombo: 'windup',
  dash: 'walk1', dashJump: 'walk1', dashCombo: 'walk1',
  slashJump: 'slash', slashCombo: 'slash',
};

// ---------- Shading Ramps ----------

function hexOf(val, fallback) {
  return typeof val === 'string' && val.startsWith('#') ? val : fallback;
}

function colorsOf(look) {
  const skin = hexOf(look.skin, '#f3d2b3');
  const hair = hexOf(look.hair, '#5a3a1e');
  const outfit = hexOf(look.outfit, '#4a628a');
  const trim = hexOf(look.trim, GOLD_RAMP[3]);
  const pants = hexOf(look.pants, '#2e3044');
  const boots = hexOf(look.boots, '#4a2b1c');
  const eyes = hexOf(look.eyes, '#3a6fd8');
  const scarf = hexOf(look.scarf, look.scarf ? trim : '#b42838');
  return {
    S: mix(skin, '#4f1e22', 0.48),
    s: mix(skin, '#843836', 0.24),
    k: skin,
    l: lighter(skin, 0.22),
    r: mix(skin, '#ec707c', 0.40),
    E: OUTLINE,
    W: '#ffffff',
    I: eyes,
    i: darker(eyes, 0.36),
    0: mix(hair, '#0d0818', 0.72),
    1: mix(darker(hair, 0.38), '#1c122e', 0.25),
    2: hair,
    3: lighter(hair, 0.36),
    o: mix(outfit, '#120d1e', 0.52),
    O: darker(outfit, 0.26),
    u: outfit,
    U: lighter(outfit, 0.24),
    t: darker(trim, 0.32),
    T: trim,
    y: lighter(trim, 0.36),
    b: '#2b1e20',
    B: '#4f352e',
    g: GOLD_RAMP[2],
    G: GOLD_RAMP[4],
    p: darker(pants, 0.28),
    P: pants,
    f: darker(boots, 0.36),
    F: boots,
    h: lighter(boots, 0.28),
    m: STEEL_RAMP[1],
    M: STEEL_RAMP[2],
    n: STEEL_RAMP[3],
    N: STEEL_RAMP[4],
    c: darker(scarf, 0.34),
    C: scarf,
    R: lighter(scarf, 0.28),
    H: '#2a1c38',
    v: '#5d3b72',
    w: '#ffe8ed',
  };
}

function stamp(grid, rows, colors, x, y) {
  drawPicture(grid, rows, colors, Math.round(x), Math.round(y));
}

// ---------- Compact JRPG Face (14w x 8h, big 2x3 anime eyes directly under bangs) ----------

const FACE_DOWN = {
  normal: [
    'skllllllllllks',
    'skEEkkkkkkEEks',
    'kEWEkkkkkkEWEk',
    'kIIikkkkkkiIIk',
    'skrrkkkkkkrrks',
    '.sskkkkkkkkss.',
    '..sskkllkkss..',
    '....SSkkSS....',
  ],
  focus: [
    's0llllllllll0s',
    'skEEkkkkkkEEks',
    'kEWEkkkkkkEWEk',
    'kIIikkkkkkiIIk',
    'skrrkkkkkkrrks',
    '.sskkkkkkkkss.',
    '..sskkllkkss..',
    '....SSkkSS....',
  ],
  happy: [
    'skllllllllllks',
    'skEEkkkkkkEEks',
    'kEkkEkkkkEkkEk',
    'skrrkkkkkkrrks',
    '.sskkkkkkkkss.',
    '..sskkllkkss..',
    '...sSSkkSSs...',
    '....SSSSSS....',
  ],
  wince: [
    'skllllllllllks',
    'skEkkkkkkkkEks',
    'kkEkkkkkkkkEkk',
    'skrrkkkkkkrrks',
    '.sskkkkkkkkss.',
    '..sskkllkkss..',
    '....SSkkSS....',
    '.....SSSS.....',
  ],
  closed: [
    'skllllllllllks',
    'skllllllllllks',
    'kEEkkkkkkkkEEk',
    'skrrkkkkkkrrks',
    '.sskkkkkkkkss.',
    '..sskkllkkss..',
    '....SSkkSS....',
    '.....SSSS.....',
  ],
};

const FACE_SIDE = {
  normal: [
    '.skllllllllk.',
    '.skEEkkkEEkk.',
    '.skWEkkkWEkk.',
    '.skIIkkkIIkl.',
    '.skrrkkkrrkk.',
    '..sskkkkkkss.',
    '...sskkkss...',
    '....SSkkSS...',
  ],
  focus: [
    '.s0llllllll0.',
    '.skEEkkkEEkk.',
    '.skWEkkkWEkk.',
    '.skIIkkkIIkl.',
    '.skrrkkkrrkk.',
    '..sskkkkkkss.',
    '...sskkkss...',
    '....SSkkSS...',
  ],
  happy: [
    '.skllllllllk.',
    '.skEEkkkEEkk.',
    '.skrkkkkrrkl.',
    '.skrrkkkrrkk.',
    '..sskkkkkkss.',
    '...sskkkss...',
    '....SSkkSS...',
    '.....SSSS....',
  ],
  wince: [
    '.skllllllllk.',
    '.skEkkkkEkkk.',
    '.skkEkkEkkkl.',
    '.skrrkkkrrkk.',
    '..sskkkkkkss.',
    '...sskkkss...',
    '....SSkkSS...',
    '.....SSSS....',
  ],
  closed: [
    '.skllllllllk.',
    '.skllllllllk.',
    '.skEEkkkEEkk.',
    '.skrrkkkrrkk.',
    '..sskkkkkkss.',
    '...sskkkss...',
    '....SSkkSS...',
    '.....SSSS....',
  ],
};

const FACE_BACK = [
  '....SSSSSS....',
  '....sSSSSs....',
];

const BEARD_DOWN = [
  '.012222222210.',
  '.012222222210.',
  '..0122222210..',
  '...01222210...',
  '....012210....',
  '.....0110.....',
];

const BEARD_SIDE = [
  '..012222210.',
  '...01222210.',
  '....012210..',
  '.....0110...',
];

// ---------- Organic Rounded/Spiky Hair (Crown starts at headY-9 = y 2; bangs drape to headY+1 = y 12!) ----------

const HAIR_DOWN = {
  short: {
    back: [
      '..01111111111110..',
      '.0122222222222210.',
    ],
    front: [
      '......12222221......',
      '....122233332221....',
      '..0122333333332210..',
      '.012222222222222210.',
      '.012222222222222210.',
      '01222022220222022210',
      '01220122201222012210',
      '0120.0120..120.02110',
      '010...00....0....010',
      '.0................0.',
    ],
  },
  spiky: {
    back: [
      '.011............110.',
      '0121............1210',
    ],
    front: [
      '......2..2222..2....',
      '....12322333322321..',
      '..21223333333332212.',
      '.1222222222222222221',
      '01222222222222222210',
      '01222022202220220221',
      '01220221012202102210',
      '1210.120.012010.0120',
      '010...0...00.0...00.',
    ],
  },
  long: {
    back: [
      '..01111111111110..',
      '.0122222222222210.',
      '012222222222222210',
      '012222111111222210',
      '0122210....0122210',
      '0122210....0122210',
      '012210......012210',
      '012210......012210',
      '.0110........0110.',
      '..00..........00..',
    ],
    front: [
      '......12222221......',
      '....122233332221....',
      '..0122333333332210..',
      '.012222222222222210.',
      '.012222222222222210.',
      '01222202220222022210',
      '01221012201220112210',
      '012210010..10.012210',
      '012210.........02210',
      '.0110...........011.',
    ],
  },
  pony: {
    back: [
      '..01111111111110..',
      '...0122T2222T210..',
      '....01222222210...',
      '.....012222210....',
      '......0122210.....',
    ],
    front: [
      '......12222221......',
      '....122233332221....',
      '..0122333333332210..',
      '.012222222222222210.',
      '.012222222222222210.',
      '01222022202202220210',
      '01220122012201220210',
      '0120.010..00..010.10',
      '.010.............01.',
    ],
  },
  twin: {
    back: [
      'tT1221........1221Tt',
      '0122221......1222210',
      '0122210......0122210',
      '012210........012210',
      '.0110..........0110.',
      '..00............00..',
    ],
    front: [
      '......12222221......',
      '....122233332221....',
      '..0122333333332210..',
      '.012222222222222210.',
      '.012222222222222210.',
      '01222022202202220210',
      '01220122012201220210',
      '0120.010..00..010.10',
      '.01................0',
    ],
  },
  bun: {
    back: [
      '.....012222210......',
      '....01233333210.....',
      '.....tTTTTTTTt......',
    ],
    front: [
      '......12222221......',
      '....122233332221....',
      '..0122333333332210..',
      '.012222222222222210.',
      '.012222222222222210.',
      '01222022202202220210',
      '01220122012201220210',
      '.010..00......00.010',
    ],
  },
  bald: {
    back: [
      '..122111111111221...',
    ],
    front: [
      '......skllllks......',
      '....skllllllllks....',
      '...skllllllllllks...',
      '..skllllllllllllks..',
      '..skllllllllllllks..',
      '..1kllllllllllllk1..',
      '..01............10..',
      '..01............10..',
    ],
  },
};

const HAIR_SIDE = {
  short: {
    back: [
      '.01111........',
      '012221........',
      '012210........',
      '.0110.........',
    ],
    front: [
      '....12222221....',
      '..122233332221..',
      '.01223333332210.',
      '0122222222222210',
      '0122222222222210',
      '0122022022022010',
      '0120120120.10.0.',
      '0110.0..........',
    ],
  },
  spiky: {
    back: [
      '0111..........',
      '02221.........',
      '.01110........',
    ],
    front: [
      '....2..2222..2..',
      '..1232233332231.',
      '.122233333332221',
      '0122222222222220',
      '0122222222222220',
      '0122022022022010',
      '0120120.10.10..0',
      '010..0..........',
    ],
  },
  long: {
    back: [
      '.011111.......',
      '01222221......',
      '01222221......',
      '01222210......',
      '0122210.......',
      '012210........',
      '.0110.........',
    ],
    front: [
      '....12222221....',
      '..122233332221..',
      '.01223333332210.',
      '0122222222222210',
      '0122222222222210',
      '0122022022022010',
      '0120120120.10...',
      '01210...........',
      '.010............',
    ],
  },
  pony: {
    back: [
      '01T...........',
      '02221.........',
      '012221........',
      '.0122210......',
      '..012210......',
      '...0110.......',
    ],
    front: [
      '....12222221....',
      '..122233332221..',
      '.01223333332210.',
      '0122222222222210',
      '0122222222222210',
      '0122022022022010',
      '0120120.10.10...',
      '.010............',
    ],
  },
  twin: {
    back: [
      '.T1221........',
      '0122221.......',
      '0122210.......',
      '012210........',
      '.0110.........',
    ],
    front: [
      '....12222221....',
      '..122233332221..',
      '.01223333332210.',
      '0122222222222210',
      '0122222222222210',
      '0122022022022010',
      '0120120120.10...',
      '.010............',
    ],
  },
  bun: {
    back: [
      '.012221.......',
      '0123332T......',
      '.011110.......',
    ],
    front: [
      '....12222221....',
      '..122233332221..',
      '.01223333332210.',
      '0122222222222210',
      '0122222222222210',
      '0122022022022010',
      '01210...........',
      '.010............',
    ],
  },
  bald: {
    front: [
      '....sklllllk....',
      '...skllllllls...',
      '..skllllllllks..',
      '..skllllllllks..',
      '..skllllllllks..',
      '..121.......kk..',
      '..010...........',
    ],
  },
};

const HAIR_UP = {
  short: [
    '......12222221......',
    '....122233332221....',
    '..0122333333332210..',
    '.012222222222222210.',
    '01222222222222222210',
    '01222222222222222210',
    '01222222222222222210',
    '01222222222222222210',
    '.012222222222222210.',
    '..0111222222221110..',
    '...00112222221100...',
    '....000111111000....',
  ],
  spiky: [
    '......2..2222..2....',
    '....12322333322321..',
    '..21223333333332212.',
    '.0122222222222222210',
    '01222222222222222210',
    '01222222222222222210',
    '01222222222222222210',
    '.012222222222222210.',
    '..0112222222222110..',
    '...00122222222100...',
    '....0.01111110.0....',
  ],
  long: [
    '......12222221......',
    '....122233332221....',
    '..0122333333332210..',
    '.012222222222222210.',
    '01222222222222222210',
    '01222222222222222210',
    '01222222222222222210',
    '01222222222222222210',
    '01222211111111222210',
    '0122210......0122210',
    '012210........012210',
    '.0110..........0110.',
  ],
  pony: [
    '......12222221......',
    '....122233332221....',
    '..0122333333332210..',
    '.012222222222222210.',
    '01222222222222222210',
    '0122222T2222T2222210',
    '01222212222221222210',
    '.012210122221012210.',
    '......12222221......',
    '.....1222222221.....',
    '.....0122222210.....',
    '......01111110......',
  ],
  twin: [
    '......12222221......',
    '....122233332221....',
    '..0122333333332210..',
    '.012222222222222210.',
    '01222222222222222210',
    'tT1222222222222221Tt',
    '01221122222222112210',
    '01220.01111110.02210',
    '01210..........01210',
    '.010............010.',
  ],
  bun: [
    '.....0123333210.....',
    '....012233332210....',
    '.....tTT2222TTt.....',
    '..0122222222222210..',
    '.012222222222222210.',
    '01222222222222222210',
    '01222222222222222210',
    '01222222222222222210',
    '.012222222222222210.',
    '..0111222222221110..',
    '...00011111111000...',
  ],
  bald: [
    '......skllllks......',
    '....skllllllllks....',
    '...skllllllllllks...',
    '..skllllllllllllks..',
    '..skkkkkkkkkkkkkks..',
    '..skkkkkkkkkkkkkks..',
    '..11kkkkkkkkkkkk11..',
    '..0122222222222210..',
    '..0011222222221100..',
    '...00111111111100...',
    '....000000000000....',
  ],
};

// ---------- Torso / Armor / Cloaks (y = 18..31 -> 12-13px tall) ----------

function drawTorsoDown(grid, c, look, bx, by, up) {
  const sw = look.sword;
  const skirt = look.skirt;
  const burly = look.burly;

  if (up) {
    if (sw || burly) {
      stamp(grid, [
        '..ooTTUUUUUUUUTToo..',
        '.mNNmOOOOOOOOOOmNNm.',
        '.mMNOOOOOOOOOOOONMm.',
        '..oOOoUUUUUUUUoOOo..',
        '..oOOoUUUUUUUUoOOo..',
        '..oOOoUUUUUUUUoOOo..',
        '..oObbbbbbbbbbbbOo..',
        '..oOOOOOOOOOOOOOOo..',
        '..oOOo........oOOo..',
      ], c, bx - 10, by);
    } else if (skirt) {
      stamp(grid, [
        '..ooTTUUUUUUUUTToo..',
        '.oOOUUUUUUUUUUUUOOo.',
        '.oOOuOOOOOOOOOOuOOo.',
        '..oOOuOOOOOOOOuOOo..',
        '..oObbbbbbbbbbbbOo..',
        '.oOOuUUUUUUUUUUuOOo.',
        '.oOOuOOuUUUUuOOuOOo.',
        'oOOuOOuUUUUUUuOOuOOo',
        'oOOuOOuUUUUUUuOOuOOo',
        'oOOuOOuOOOOOOuOOuOOo',
        'otTTTTTTTTTTTTTTTTto',
      ], c, bx - 10, by);
    } else {
      stamp(grid, [
        '..ooTTUUUUUUUUTToo..',
        '.oOOUUUUUUUUUUUUOOo.',
        '.oOOuOOOOOOOOOOuOOo.',
        '..oOOuOOOOOOOOuOOo..',
        '..oObbbbbbbbbbbbOo..',
        '..oOOuUUUUUUUUuOOo..',
        '..oOOuUUUUUUUUuOOo..',
        '..oOOuOOOOOOOOuOOo..',
      ], c, bx - 10, by);
    }
    return;
  }

  if (sw) {
    stamp(grid, [
      '..mmTTTTTTTTTTTTmm..',
      '.mNNoUubuuuuUboNNm..',
      '.MNnoOOubuuuOOnNNM..',
      '..mOoOOubuuuOOoMm...',
      '..oOOoOubuuuOoOOo...',
      '..oOOoOubuuuOoOOo...',
      '...oobbbGgggbbbo....',
      '...oOOuTTTTTTuOOo...',
      '..mOoTuOooOooTuOom..',
      '..oOOo........oOOo..',
    ], c, bx - 10, by);
  } else if (skirt) {
    stamp(grid, [
      '..ooTTllGGGGllTToo..',
      '.oUUtTTuTTTTuTTtuUo.',
      '.oOOuuTuGGGGuTuuOOo.',
      '..oOOuuTTTTTTuuOOo..',
      '..oOuuUUUUUUUUuuOo..',
      '..oOuuUUUUUUUUuuOo..',
      '.oOOuuOuUUUUuOuuOOo.',
      '.oOOuOOuUUUUuOOuOOo.',
      'oOOuuOOuUUUUuOOuuOOo',
      'oOOuOOuuUUUUuuOOuOOo',
      'oOOuOOuOOOOOOuOOuOOo',
      'otTTTTTTTTTTTTTTTTto',
    ], c, bx - 10, by);
  } else if (burly) {
    stamp(grid, [
      '.ooUUTllGGGGllTUUoo.',
      'oOOUUbbbbbbbbbbUUOOo',
      'oOOObBBBBBBBBBBbOOOo',
      '.oOObBBBBBBBBBBbOOo.',
      '.oOObBBBBBBBBBBbOOo.',
      '.oOObBBBBBBBBBBbOOo.',
      '..obbbGggggggGbbbo..',
      '..oOobbbBBBBbbboOo..',
    ], c, bx - 10, by);
  } else {
    stamp(grid, [
      '..ooTTTllllllTTToo..',
      '.oOUUUuTTTTTTuUUUOo.',
      '.oOOuuuOuuuuOuuuOOo.',
      '..oOOuuuOuuOuuuOOo..',
      '..oOOuuuuOOuuuuOOo..',
      '..oOOuuuuOOuuuuOOo..',
      '..oobbbGggggGbbooo..',
      '..oOOuuUUUUUUuuOOo..',
      '.oOOuuOooooooOuuOOo.',
    ], c, bx - 10, by);
  }
}

function drawTorsoSide(grid, c, look, bx, by) {
  if (look.sword) {
    stamp(grid, [
      '..ooTTTTTTTTToo....',
      '.mNNoUubuuuUOo.....',
      '.MNnObuuuuuOOo.....',
      '..mOubuuuuuOOo.....',
      '..oOubuuuuuOOo.....',
      '..oOubuuuuuOOo.....',
      '..obbbGgggboo......',
      '..oOOuTTTuOo.......',
      '..mOoTuToO.........',
    ], c, bx - 9, by);
  } else if (look.skirt) {
    stamp(grid, [
      '..ooTTTllTTToo.....',
      '.oUUtTTuTTuUOo.....',
      '.oOOuuTGGuuOOo.....',
      '..oOOuTTTTuOOo.....',
      '.oOOuuUUUUuuOOo....',
      '.oOOuuUUUUuuOOo....',
      '.oOOuuOuUUuOOOo....',
      'oOOuuOOuUUuuOOOo...',
      'oOOuuOOuUUuuOOOo...',
      'oOOuOOuuUUuOOOOo...',
      'otTTTTTTTTTTTTto...',
    ], c, bx - 9, by);
  } else if (look.burly) {
    stamp(grid, [
      '.ooUUTTllTUUo......',
      'oOOUUbbbbbbUUo.....',
      'oOOObBBBBBBbOOo....',
      '.oOObBBBBBBbOOo....',
      '.oOObBBBBBBbOOo....',
      '.oOObBBBBBBbOOo....',
      '..obbbGgggboo......',
      '..oOobbbbbOo.......',
    ], c, bx - 9, by);
  } else {
    stamp(grid, [
      '..ooTTTllTTTo......',
      '.oOUUUuTTuUUOo.....',
      '.oOOuuuOOuuOOo.....',
      '..oOOuuuuuuOOo.....',
      '..oOOuuuuuuOOo.....',
      '..oOOuuuuuuOOo.....',
      '..oobbbGgggboo.....',
      '..oOOuuUUuuOOo.....',
      '.oOOuuOoooOuOOo....',
    ], c, bx - 9, by);
  }
}

// ---------- Tall 9-10px Articulated Legs & Boots (Reaching y=39!) ----------

function drawLegs(grid, c, look, bx, by, gait, dir) {
  const sw = look.sword;
  const skirt = look.skirt;
  const stepL = gait === 'strideA' ? -1 : gait === 'strideB' ? 1 : 0;
  const stepR = gait === 'strideA' ? 1 : gait === 'strideB' ? -1 : 0;

  if (dir === 'down' || dir === 'up') {
    const legC = sw ? 'M' : 'P';
    const legD = sw ? 'm' : 'p';
    const topY = skirt ? by + 11 : by + 8;
    const rows = skirt ? [
      `..${legD}${legC}..`,
      '..BBB.',
      '..fFF.',
      '..fFF.',
      '..hhh.',
    ] : [
      `.${legD}${legC}P.`,
      `.${legD}${legC}P.`,
      `.${legD}${legC}P.`,
      `.${legD}${legC}P.`,
      `.BBB.`,
      `.fFF.`,
      `.fFF.`,
      `.hhh.`,
    ];
    stamp(grid, rows, c, bx - 6, topY + Math.max(0, stepL));
    stamp(grid, rows, c, bx + 1, topY + Math.max(0, stepR));
    return;
  }

  const topY = skirt ? by + 10 : by + 8;
  if (gait === 'lunge') {
    stamp(grid, [
      '.pPP.....PPq.',
      'pPP.......PPq',
      'pP.........Pq',
      'pP.........Pq',
      'BBB.......BBB',
      'fFF.......fFF',
      'fFF.......fFF',
      'hhh.......hhh',
    ], c, bx - 7, topY);
  } else if (gait === 'strideA') {
    stamp(grid, [
      '..pPP...PPq..',
      '.pPP.....PPq.',
      '.pPP.....PPq.',
      '.pPP.....PPq.',
      '.BBB.....BBB.',
      '.fFF.....fFF.',
      '.fFF.....fFF.',
      '.hhh.....hhh.',
    ], c, bx - 7, topY);
  } else if (gait === 'strideB') {
    stamp(grid, [
      '..PPq...pPP..',
      '.PPq.....pPP.',
      '.PPq.....pPP.',
      '.PPq.....pPP.',
      '.BBB.....BBB.',
      '.fFF.....fFF.',
      '.fFF.....fFF.',
      '.hhh.....hhh.',
    ], c, bx - 7, topY);
  } else {
    stamp(grid, [
      '...pPP.PPq...',
      '...pPP.PPq...',
      '...pPP.PPq...',
      '...pPP.PPq...',
      '...BBB.BBB...',
      '...fFF.fFF...',
      '...fFF.fFF...',
      '...hhh.hhh...',
    ], c, bx - 7, topY);
  }
}

// ---------- Sleeves, Gauntlets & Weapon Hand ----------

function drawArms(grid, c, look, bx, by, arm, dir) {
  const sleeve = look.sword ? 'N' : 'U';
  const darkSleeve = look.sword ? 'm' : 'O';
  const lOff = arm === 'swingA' ? 1 : arm === 'swingB' ? -1 : arm === 'victory' ? -4 : 0;
  const rOff = arm === 'swingA' ? -1 : arm === 'swingB' ? 1 : arm === 'victory' ? -4 : 0;

  if (dir === 'down' || dir === 'up') {
    const lArm = [
      `${darkSleeve}${sleeve}`,
      `${darkSleeve}${sleeve}`,
      `${darkSleeve}${sleeve}`,
      `${darkSleeve}${sleeve}`,
      `${darkSleeve}${sleeve}`,
      look.sword ? 'mn' : 'sk',
    ];
    stamp(grid, lArm, c, bx - 10, by + 1 + lOff);
    stamp(grid, lArm, c, bx + 8, by + 1 + rOff);
    return null;
  }

  let dx = 1;
  let dy = 6;
  if (arm === 'ready') { dx = 4; dy = 2; }
  else if (arm === 'raised') { dx = 2; dy = -4; }
  else if (arm === 'forward') { dx = 6; dy = 2; }
  else if (arm === 'victory') { dx = 2; dy = -5; }
  else if (arm === 'hurt') { dx = -3; dy = 0; }
  else if (arm === 'drink') { dx = 5; dy = -1; }
  else if (arm === 'swingA') { dx = 3; dy = 5; }
  else if (arm === 'swingB') { dx = -2; dy = 5; }

  const shX = bx - 2;
  const shY = by + 2;
  const hX = shX + dx;
  const hY = shY + dy;
  drawLine(grid, shX, shY, hX, hY, c[sleeve]);
  drawLine(grid, shX, shY + 1, hX, hY + 1, c[darkSleeve]);
  dot(grid, hX, hY, look.sword ? c.N : c.k);
  dot(grid, hX, hY + 1, look.sword ? c.M : c.s);

  if (arm === 'drink') {
    fillRect(grid, hX + 1, hY - 3, 2, 4, '#54c8ff');
    dot(grid, hX + 1, hY - 4, '#d9f4ff');
    dot(grid, hX + 2, hY - 2, '#ffffff');
  }
  return [hX, hY];
}

function drawScarf(grid, c, look, bx, by, dir, capeWag) {
  if (!look.scarf) return;
  if (dir === 'up') {
    stamp(grid, [
      '..cCCCCCCCCCCc..',
      '.cCRRRCCCCRRRCc.',
      '..cCCCCCCCCCCc..',
      '...cCCCccCCCc...',
      '....cCC..CCc....',
      '.....c....c.....',
    ], c, bx - 8, by - 1);
  } else if (dir === 'down') {
    stamp(grid, [
      '..cCRRRRRRRRCc..',
      '..cCCCCCCCCCCc..',
      '.cCCCc..........',
      '.cCCc...........',
    ], c, bx - 8, by - 1);
  } else {
    const tail = capeWag >= 2 ? [
      '...cCCCCCCc.',
      'cCRRRCCc....',
      'cCCCc.......',
      '.ccc........',
    ] : [
      '...cCCCCCCc.',
      '.cCRRCCc....',
      '..cCCc......',
    ];
    stamp(grid, tail, c, bx - 10 - Math.min(2, capeWag), by - 1);
  }
}

// ---------- Full 38px Sprite Assembly (y=2..39 matching Hero/Luna) ----------

function personGrid(look, dir, poseName) {
  const pose = POSES[poseName] || POSES[SAME_AS[poseName]] || POSES.stand;
  const c = colorsOf(look);
  const grid = makeGrid(W, H);
  const childShift = look.small ? 6 : 0;
  const lean = dir === 'side' ? pose.lean : 0;
  const bx = CX + lean;
  const headY = 10 + pose.lift + childShift; // Hair top sits cleanly at y=2!
  const by = headY + 6; // Collar hugs chin with zero seam gap!
  const style = look.style || 'short';
  const expr = pose.eyes || 'normal';

  // 1. Flowing back hair
  if (dir === 'down') {
    const h = HAIR_DOWN[style] || HAIR_DOWN.short;
    if (h.back) stamp(grid, h.back, c, bx - 9, headY - 3);
  } else if (dir === 'side') {
    const h = HAIR_SIDE[style] || HAIR_SIDE.short;
    if (h.back) stamp(grid, h.back, c, bx - 9, headY - 2);
  }

  // 2. Tall boots, legs, torso
  drawLegs(grid, c, look, bx, by, pose.gait, dir);
  if (dir === 'side') {
    drawTorsoSide(grid, c, look, bx, by);
  } else {
    drawTorsoDown(grid, c, look, bx, by, dir === 'up');
  }

  // 3. Neck scarf wrap
  drawScarf(grid, c, look, bx, by, dir, pose.cape);

  // 4. Face, rounded dome hair draping over brow/eyes, beard, traits
  if (dir === 'down') {
    stamp(grid, FACE_DOWN[expr] || FACE_DOWN.normal, c, bx - 7, headY);
    if (look.beard) stamp(grid, BEARD_DOWN, c, bx - 7, headY + 4);
    if (look.elfEars) {
      dot(grid, bx - 8, headY + 2, c.l); dot(grid, bx - 7, headY + 2, c.k);
      dot(grid, bx + 7, headY + 2, c.k); dot(grid, bx + 8, headY + 2, c.l);
    }
    const h = HAIR_DOWN[style] || HAIR_DOWN.short;
    if (h.front) stamp(grid, h.front, c, bx - 10, headY - 7);
    if (look.ears) stamp(grid, ['.0........0.', '0w0......0w0', '1w2......2w1'], c, bx - 6, headY - 8);
    if (look.horns) stamp(grid, ['H..........H', 'vH........Hv'], c, bx - 6, headY - 8);
  } else if (dir === 'up') {
    stamp(grid, FACE_BACK, c, bx - 7, headY + 5);
    if (look.elfEars) {
      dot(grid, bx - 8, headY + 2, c.k); dot(grid, bx + 8, headY + 2, c.k);
    }
    stamp(grid, HAIR_UP[style] || HAIR_UP.short, c, bx - 10, headY - 7);
    if (look.ears) stamp(grid, ['.0........0.', '0w0......0w0', '1w2......2w1'], c, bx - 6, headY - 8);
    if (look.horns) stamp(grid, ['H..........H', 'vH........Hv'], c, bx - 6, headY - 8);
  } else {
    stamp(grid, FACE_SIDE[expr] || FACE_SIDE.normal, c, bx - 6, headY);
    if (look.beard) stamp(grid, BEARD_SIDE, c, bx - 6, headY + 4);
    if (look.elfEars) {
      dot(grid, bx - 7, headY + 2, c.k);
      dot(grid, bx - 8, headY + 1, c.l);
    }
    const h = HAIR_SIDE[style] || HAIR_SIDE.short;
    if (h.front) stamp(grid, h.front, c, bx - 8, headY - 7);
    if (look.ears) stamp(grid, ['.0..0.', '0w01w0', '1w22w1'], c, bx - 5, headY - 8);
    if (look.horns) stamp(grid, ['H...H.', 'vH..vH'], c, bx - 5, headY - 8);
  }

  // 5. Forearms & sword anchor
  const hand = drawArms(grid, c, look, bx, by, pose.arm, dir);
  return { grid, hand };
}

function lyingDown(src) {
  const dst = makeGrid(src.height, src.width);
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const col = colorAt(src, x, y);
      if (col) dot(dst, y, src.width - 1 - x, col);
    }
  }
  return dst;
}

function lowestRow(grid) {
  for (let y = grid.height - 1; y >= 0; y--) {
    for (let x = 0; x < grid.width; x++) if (colorAt(grid, x, y)) return y;
  }
  return grid.height - 1;
}

export const PERSON_ANCHOR = { x: CX, y: FEET + 1 };

const lookIds = new WeakMap();
let nextLookId = 1;

function lookId(look) {
  if (!lookIds.has(look)) lookIds.set(look, nextLookId++);
  return lookIds.get(look);
}

function lyingSprite(look) {
  const grid = lyingDown(personGrid(look, 'side', 'hurt').grid);
  return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: Math.round(grid.width / 2), ay: lowestRow(grid) + 1, hand: null, sword: undefined };
}

export function personSprite(look, dir, pose = 'stand') {
  if (usesHeroArt(look) && isHeroArtReady()) return heroArtSprite(dir, pose);
  if (look.sheet && hasCharacterArt(look.sheet) && isCharacterArtReady()) return characterSprite(look.sheet, dir, pose);
  return once('personV6_' + lookId(look) + dir + pose, () => {
    if (pose === 'ko') return lyingSprite(look);
    const view = dir === 'left' || dir === 'right' ? 'side' : dir;
    const picture = personGrid(look, view, pose);
    const isMirror = dir === 'left';
    const grid = isMirror ? mirrored(picture.grid) : picture.grid;
    const hand = picture.hand && (isMirror ? [W - 1 - picture.hand[0], picture.hand[1]] : picture.hand);
    const angle = (POSES[pose] || POSES[SAME_AS[pose]] || POSES.stand).sword;
    return {
      canvas: toCanvas(addOutline(grid, OUTLINE)),
      ax: isMirror ? W - 1 - PERSON_ANCHOR.x : PERSON_ANCHOR.x,
      ay: PERSON_ANCHOR.y,
      hand,
      sword: angle === undefined ? undefined : isMirror ? 180 - angle : angle,
    };
  });
}

export function walkPose(step, isWalking, time = 0, salt = 0) {
  if (isWalking) return WALK[Math.floor(step) % 4];
  return Math.floor(time * 1.4 + salt) % 2 ? 'breath' : 'stand';
}

// ---------- Weapons in Combat ----------

const BLADES = {
  woodSword: ['#4a2e18', '#966134', '#cc945a', '#4a2e18'],
  ironSword: ['#4a5264', '#a4b0c6', '#eef4ff', '#6c7894'],
  steelSword: ['#444e64', '#bcc8dc', '#ffffff', '#e8b83a'],
  mithrilSword: ['#21588a', '#6ec4ff', '#e8fbff', '#8ad6ff'],
  lexiconBlade: ['#8c5a0e', '#ffd44a', '#fffbe0', '#ff684a'],
};

export function swordSprite(angle, weapon) {
  const step = Math.round(angle / 15) * 15;
  return once('swordV6_' + step + weapon, () => {
    const size = 37;
    const c = 18;
    const grid = makeGrid(size, size);
    const turn = (step * Math.PI) / 180;
    const [ux, uy] = [Math.cos(turn), Math.sin(turn)];
    const [nx, ny] = [-uy, ux];
    const at = (along, across) => [Math.round(c + ux * along + nx * across), Math.round(c + uy * along + ny * across)];
    const blade = BLADES[weapon] || BLADES.ironSword;
    for (let i = -4; i <= 0; i++) dot(grid, ...at(i, 0), '#543219');
    dot(grid, ...at(-5, 0), blade[3]);
    for (let i = 3; i <= 15; i++) {
      dot(grid, ...at(i, 0), blade[2]);
      dot(grid, ...at(i, 1), blade[1]);
      if (i < 13) dot(grid, ...at(i, -1), blade[0]);
    }
    dot(grid, ...at(16, 0), '#ffffff');
    for (let i = -3; i <= 3; i++) dot(grid, ...at(2, i), GOLD_RAMP[3]);
    dot(grid, ...at(2, 0), GOLD_RAMP[4]);
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: c, ay: c };
  });
}

// ---------- Obsidian Summons ----------

const OBSIDIAN_PAL = {
  0: '#0d0a14',
  1: '#1a1428',
  2: '#291f42',
  3: '#3d2f5e',
  4: '#5b4a8a',
  5: '#8c72c8',
  g: '#c9a8ff',
  w: '#f4ebff',
};

const SENTINEL_UPPER = [
  '...........................g....',
  '..........................wgw...',
  '.....5..............5.....wgw...',
  '......43..........34......gwg...',
  '.......32........23.......4g4...',
  '.......23333333332........343...',
  '......1222233322221.......343...',
  '......122gggggggg21........3....',
  '......112gggggggg11........3....',
  '.......12222222221.........3....',
  '...543..111111111..345.....3....',
  '..4543222222g222223454.....3....',
  '.34432222233g3322223443....3....',
  '.2332222233ggg332222332..4434...',
  '.122.2222333g3332222.221.4g34...',
  '.....1222233g3322221.....3g3....',
  '.....1222223g3222221.....3g3....',
  '......112222g222211......2g2....',
  '......1112222222111......222....',
  '.....1222211.1122221.......2....',
  '.....12221.....12221.......2....',
  '.....1221.......1221.......2....',
  '.....1221.......1221.......2....',
  '.....111.........111.......2....',
  '.....111.........111.......2....',
  '.....121.........121.......2....',
  '.....121.........121.......2....',
  '.....121.........121.......2....',
  '.....121.........121.......2....',
  '.....111.........111.......2....',
  '.....111.........111.......2....',
  '.....111.........111.......2....',
  '.....111.........111.......2....',
  '.....111.........111.......2....',
  '.....111.........111.......2....',
];

const SENTINEL_LEGS = [
  [
    '.....121.........121.......1....',
    '.....121.........121.......1....',
    '.....111.........111.......1....',
    '....12221.......12221......1....',
    '....11111.......11111......1....',
  ],
  [
    '....121...........121......1....',
    '....121...........121......1....',
    '....111...........111......1....',
    '...12221.........12221.....1....',
    '...11111.........11111.....1....',
  ],
];

export function obsidianSoldier(frame) {
  return once('soldierV7_' + (frame % 2), () => {
    const rows = [...SENTINEL_UPPER, ...SENTINEL_LEGS[frame % 2]];
    const raw = makeGrid(32, rows.length);
    drawPicture(raw, rows, OBSIDIAN_PAL, 0, 0);
    const outlined = addOutline(padded(raw, 1), '#0d0a14');
    return { canvas: toCanvas(outlined), ax: 15, ay: outlined.height - 1 };
  });
}

const CAT_ROWS = [
  '..3...........2..3..',
  '.34...........23.23.',
  '32.............2333.',
  '21.............2gg3.',
  '21...23333333222224.',
  '.21.23344433322221..',
  '..2233322223221.....',
  '....221....221......',
  '....121....121......',
  '....11......11......',
];

export function obsidianCat() {
  return once('catV6', () => {
    const raw = makeGrid(20, CAT_ROWS.length);
    drawPicture(raw, CAT_ROWS, OBSIDIAN_PAL, 0, 0);
    const outlined = addOutline(padded(raw, 1), '#0d0a14');
    return { canvas: toCanvas(outlined), ax: Math.floor(outlined.width / 2), ay: outlined.height - 1 };
  });
}
