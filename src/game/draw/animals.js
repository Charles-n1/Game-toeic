import { addOutline, drawPicture, makeGrid, mirrored, once, padded, toCanvas } from './pixels';
import { OUTLINE, darker, lighter, mix } from './palette';

// Hand-pixelled HD-2D dark-fantasy animal sprites (no geometric blobs).
// All templates face right; dir === 'left' is the mirror, before the 1 px outline.

function furColors(base, extra = {}) {
  return {
    d: mix(base, '#120c1c', 0.5),
    s: darker(base, 0.28),
    b: base,
    h: lighter(base, 0.28),
    c: extra.belly || '#efe5d2',
    w: '#ffffff',
    e: '#140f1e',
    p: extra.pink || '#e6949e',
    r: extra.red || '#c93b3b',
    k: extra.hoof || '#25202e',
    a: extra.antler || '#d4be96',
    n: extra.nose || '#2c222e',
    y: extra.gold || '#e6a832',
    g: extra.green || '#2d7c5c',
    G: extra.greenHi || '#49a87a',
    l: extra.blue || '#3b6ca8',
    m: extra.chestnut || '#9c4c26',
    o: extra.spot || mix(base, '#1c1522', 0.62),
    t: extra.tusk || '#f7eed8',
  };
}

function drawFrames(frames, colors, frame) {
  const rows = frames[frame % frames.length];
  const h = rows.length;
  const w = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const raw = makeGrid(w, h);
  drawPicture(raw, rows, colors, 0, 0);
  return padded(raw, 1);
}

// Composite upper body rows with gait/stance leg blocks so posture stays unified.
function animalRig(upper, lowerFrames, colors, frame) {
  const lower = lowerFrames[frame % lowerFrames.length];
  return drawFrames([[...upper, ...lower]], colors, 0);
}

// ---------------------------------------------------------------------------
// Horses (26x21 inner -> ~28x23 outlined, rider seat at ~y = ground - 10)
// ---------------------------------------------------------------------------
const HORSE_UPPER = [
  '...............dd.a.......',
  '..............dhsad.......',
  '............ddhhhbbh......',
  '...........dhhbbbbhbc.....',
  '..........ddbbbbbbewbc....',
  '.........ddhbbbbbssbbbh...',
  '........dhbbbbbbssssbhcc..',
  '.......ddhbbbbss..ssbshn..',
  '..dd...dhhbbbs.....sss....',
  '.dsbbddhhbbbbbbbbs........',
  'dsbhhhhhhhhhhhhhhhbbs.....',
  'dsbhhbbbbbbbbbbbbbbbbd....',
  'dbbbbssssssssssssbbbbs....',
  '.sbb..csssssssssccsbbs....',
];
const HORSE_LEGS = [
  [
    '.ss...bb.........bb..s....',
    '.d....ss.........ss..s....',
    '......d..........d...d....',
    '......s..........s...s....',
    '......k..........k...k....',
  ],
  [
    '.s....bb........bb...s....',
    '.d....ss........ss...s....',
    '......d.........d....d....',
    '......s.........s....s....',
    '......k.........k....k....',
  ],
];

const FOAL_UPPER = [
  '.............d.a....',
  '............dhsh....',
  '..........ddhbbbbs..',
  '.........ddbbbbewb..',
  '..d.....dhbbbbbssbh.',
  '.dbbddddbbbbss...sc.',
  'dbhhhhhhhhhhbhs.....',
  'dbbbbbsssssbbbbd....',
  '.sbb..cssssccsb.....',
];
const FOAL_LEGS = [
  [
    '.d...b..s...b..s....',
    '.....s..d...s..d....',
    '.....d..s...d..s....',
    '.....k..k...k..k....',
  ],
  [
    '.s...s..b...s..b....',
    '.....d..s...d..s....',
    '.....s..d...s..d....',
    '.....k..k...k..k....',
  ],
];

// ---------------------------------------------------------------------------
// Cattle & Bison
// ---------------------------------------------------------------------------
const COW_UPPER = [
  '.................t..t.....',
  '................th..ht....',
  '...............kbbbbsbb...',
  '..............khhbbwewbb..',
  '...kk........kkhhbbcbbbbp.',
  '..dchhddddddchhhcbcccccppp',
  '.dchhhhhhhhcccchbcc..dpp..',
  '.chhcckkkccchhbbbcs.......',
  '.chbkkkkkcccbccccss.......',
  'dcbbkkkkkcccbccsss........',
  'dsbbcccddddccppp..........',
  '..sbb.kssssspcc...........',
];
const COW_LEGS = [
  [
    '..d...c.s...s.c...........',
    '..d...c.d...s.s...........',
    '......s.d...d.d...........',
    '......k.k...k.k...........',
  ],
  [
    '..s...s.c...d.s...........',
    '..k...d.s...k.d...........',
    '......d.s...s.k...........',
    '......k.k...k.k...........',
  ],
];

const BISON_UPPER = [
  '.............ddddhhddd....',
  '...........ddhhhbbbbbbd...',
  '.........ddhbbbbbbbbbbbdt.',
  '........ddbbbbddbbbbdhbbtt',
  '..dd....dhbbbdddbbbwewbhbb',
  '.dsbbdddhhbbbdddbbbbbbbssb',
  '.dshhhhhhhhhddddbbbbdddnbb',
  'dsbhhhhhbbssdddddddssddd..',
  'dsbbssssss...dddddssdd....',
  'd.sbb........dddddd.......',
  '...s..bbbb...dddsd........',
];
const BISON_LEGS = [
  [
    '......dd.s....dd.s........',
    '......ss.d....ss.d........',
    '......d..s....d..s........',
    '......k..k....k..k........',
  ],
  [
    '......ss.d....ss.d........',
    '......dd.s....dd.s........',
    '......s..d....s..d........',
    '......k..k....k..k........',
  ],
];

// ---------------------------------------------------------------------------
// Pigs & Boar
// ---------------------------------------------------------------------------
const PIG_UPPER = [
  '...........dddd.....',
  '....ddhhhhhhbbbd....',
  '..ddhhhhhhhhhbbbs...',
  '.dhhhhhhhhhhbdddbs..',
  '.phhhhhhhhhbbwewbpr.',
  'p.hhhhhhhhbbbpppprpp',
  '..pbbbbbbbbbppppppp.',
  '..dssssssssssppdd...',
];
const PIG_LEGS = [
  [
    '...b..s....b..s.....',
    '...s..d....s..d.....',
    '...k..k....k..k.....',
  ],
  [
    '...s..b....s..b.....',
    '...d..s....d..s.....',
    '...k..k....k..k.....',
  ],
];

const PIGLET_UPPER = [
  '.......ddd....',
  '..ddhhhhbbbs..',
  '.phhhhhhwewpr.',
  '.dhhhhbbppppr.',
  '..dssssssppd..',
];
const PIGLET_LEGS = [
  ['..b..s..b..s..', '..k..k..k..k..'],
  ['..s..b..s..b..', '..k..k..k..k..'],
];

const BOAR_UPPER = [
  '.......kkk..kk.........',
  '.....kddhhkdkhhdd......',
  '...kkdhhhhhhbbbbbd.....',
  '..ddhhhhhhhhhbbbbbbs...',
  '.kdbbbbbbbbbbbebbbbts..',
  'k.dbbbbbbbbbbddbbbttpr.',
  '..dssssssssssddbbbbnpp.',
  '...dss....ssdddssdd....',
];
const BOAR_LEGS = [
  [
    '...b..d.....d..b.......',
    '...d..s.....s..d.......',
    '...k..k.....k..k.......',
  ],
  [
    '...d..b.....b..d.......',
    '...s..d.....d..s.......',
    '...k..k.....k..k.......',
  ],
];

// ---------------------------------------------------------------------------
// Sheep, Lamb, Goat
// ---------------------------------------------------------------------------
const SHEEP_UPPER = [
  '.....hhhh..hhh......',
  '...hhhhhhhhhhhh.....',
  '..hbbbbhhhhhbbbhkk..',
  '.hbbbbbbhhhbbbkkkwk.',
  '.sbbbbbbbbbbbbksskn.',
  '..sssssssssssskkss..',
  '...dddd.dddd........',
];
const SHEEP_LEGS = [
  [
    '...k..d..k..d.......',
    '...k..d..k..d.......',
    '...k..k..k..k.......',
  ],
  [
    '...d..k..d..k.......',
    '...d..k..d..k.......',
    '...k..k..k..k.......',
  ],
];

const LAMB_UPPER = [
  '...hhhh.hh.....',
  '..hbbbbbhbbpk..',
  '.hbbbbbbbhkkwk.',
  '..ssssssskkkn..',
  '...dd..dd......',
];
const LAMB_LEGS = [
  ['...k.d.k.d.....', '...k.k.k.k.....'],
  ['...d.k.d.k.....', '...k.k.k.k.....'],
];

const GOAT_UPPER = [
  '...........kk..tt...',
  '............kktt....',
  '.............hbbb...',
  '.hh.........hbbwewb.',
  '..hhhbbbbbbhhbbssbcn',
  '..hbbbbbbbbbbsscc...',
  '..ssssssssssss.cc...',
  '...s..c.....s.......',
];
const GOAT_LEGS = [
  [
    '...b..s.....b..s....',
    '...s..d.....s..d....',
    '...k..k.....k..k....',
  ],
  [
    '...s..b.....s..b....',
    '...d..s.....d..s....',
    '...k..k.....k..k....',
  ],
];

// ---------------------------------------------------------------------------
// Deer, Doe, Fawn, Moose
// ---------------------------------------------------------------------------
const DEER_ANTLER = [
  '............t.a..t..t.....',
  '.............aaa.aaa......',
  '..............t..t........',
];
const DEER_UPPER = [
  '...............d.a.d......',
  '..............dhbbbbh.....',
  '.............dhbbwewbbc...',
  '.............dhbbbsssbbn..',
  '............dhbbbcc.......',
  '.cc........dhbbbbcc.......',
  'chhdddddddhhbbbbcc........',
  'cbbhhhhhhhhbbbbcc.........',
  '.sbbbbsssssssscc..........',
  '..sbb..cccccccbs..........',
];
const DEER_LEGS = [
  [
    '..b..s.......b..s.........',
    '..s..d.......s..d.........',
    '..d..s.......d..s.........',
    '..s..d.......s..d.........',
    '..k..k.......k..k.........',
  ],
  [
    '..s..b.......s..b.........',
    '..d..s.......d..s.........',
    '..s..d.......s..d.........',
    '..d..s.......d..s.........',
    '..k..k.......k..k.........',
  ],
];

const FAWN_UPPER = [
  '..........d.p.....',
  '.........dhbbb....',
  '........dhbwewbn..',
  '.c......dhbbcc....',
  'cbddhchcchbbbc....',
  'dbbhchbhchbbsc....',
  '.sbbssssssss......',
];
const FAWN_LEGS = [
  ['.b..s...b..s......', '.s..d...s..d......', '.k..k...k..k......'],
  ['.s..b...s..b......', '.d..s...d..s......', '.k..k...k..k......'],
];

const MOOSE_UPPER = [
  '.............tt..tttt..tt...',
  '............tttttttttttt....',
  '..............aaaaaaaa......',
  '...............dhhbbbb......',
  '......ddd......dhbwewbhbbb..',
  '....ddhhhhdddddhbbbbbbbbbbn.',
  '..ddhhhhhhhhhhhhbbbbbddddn..',
  '.dhbbbbbbbbbbbbbdddddcc.....',
  '.sbbsssssssssssdddd..c......',
  '..sbb........dddd...........',
];
const MOOSE_LEGS = [
  [
    '..b....d.....d...b..........',
    '..s....s.....s...s..........',
    '..c....c.....c...c..........',
    '..c....c.....c...c..........',
    '..k....k.....k...k..........',
  ],
  [
    '..d....b.....b...d..........',
    '..s....s.....s...s..........',
    '..c....c.....c...c..........',
    '..c....c.....c...c..........',
    '..k....k.....k...k..........',
  ],
];

// ---------------------------------------------------------------------------
// Canids & Bears: Wolf, Fox, Shepherd Dog, Bear
// ---------------------------------------------------------------------------
const CANID_UPPER = [
  '.............k.k......',
  '............dk.kh.....',
  '..dd.......dhbhbhh....',
  '.dsbhdddddhhbbyeebhn..',
  'dsbhhhhhhhhbbbccssnn..',
  'd.ssbbbbbbbbssccc.....',
  '...ssbbbbssss.cc......',
];
const CANID_LEGS = [
  [
    '...s..d......b..s.....',
    '...d..s......s..d.....',
    '...c..c......c..c.....',
  ],
  [
    '...d..s......s..b.....',
    '...s..d......d..s.....',
    '...c..c......c..c.....',
  ],
];

const FOX_FRAMES = [
  [
    '...............k..k...',
    '.cc...........dk..kh..',
    'ccchh........dhbhbhh..',
    'chbhbhddddddhhbbwewbn.',
    '.dsbhhhhhhhhhbbbcccn..',
    '..d.sssbbbbbbbsscc....',
    '.....ssbbbbss..c......',
    '.....d..s....k..k.....',
    '.....k..d....k..k.....',
  ],
  [
    '.cc............k..k...',
    'ccchh.........dk..kh..',
    '.hbhbhddddddhhbbwewbn.',
    '.dsbhhhhhhhhhbbbcccn..',
    '..d.sssbbbbbbbsscc....',
    '.....ssbbbbss..c......',
    '.....s..d....k..k.....',
    '.....k..k....k..k.....',
  ],
];

const DOG_UPPER = [
  '.............o.o......',
  '.hh.........dh.hh.....',
  'hhbhdddddddhhbwewbhn..',
  '.sbhboooohhhhbbcccnn..',
  '..ssbboooobbssccc.....',
  '....ssbbbbss..c.......',
];
const DOG_LEGS = [
  ['....b..s.....b..s.....', '....c..c.....c..c.....'],
  ['....s..b.....s..b.....', '....c..c.....c..c.....'],
];

const BEAR_UPPER = [
  '..............d..d.....',
  '......ddddd..dhbbh.....',
  '....ddhhhhhhddbbwewbc..',
  '..ddhhhhhhhhhbbbbcccn..',
  '.dhhbbbbbbbbbbbbcccc...',
  '.sbbbbbbbbbbbbbbsss....',
  '..sbbbsssssssbbbb......',
];
const BEAR_LEGS = [
  [
    '..b..d.......b..d......',
    '..s..d.......s..d......',
    '..k..k.......k..k......',
  ],
  [
    '..d..b.......d..b......',
    '..d..s.......d..s......',
    '..k..k.......k..k......',
  ],
];

// ---------------------------------------------------------------------------
// Small Woodland: Rabbit, Squirrel, Hedgehog, Frog, Turtle
// ---------------------------------------------------------------------------
const RABBIT_FRAMES = [
  [
    '.......pp.pp..',
    '......bhbbh...',
    '.....bhbhhb...',
    '..cc.bhhwewbp.',
    '.chhhbbbbccbb.',
    '.cbbbbbbbbss..',
    '..ssssssss....',
    '..c..k...c..k.',
  ],
  [
    '......pp.pp...',
    '.....bhbbh....',
    '..cc.bhbhhb...',
    '.chhhbhhwewbp.',
    '.cbbbbbbbbcc..',
    '..ssssssss....',
    '...c..k..c..k.',
  ],
];

const SQUIRREL_FRAMES = [
  [
    '.hhh............',
    'hhbbh.....p.p...',
    'hbhbb....dhbhh..',
    '.hbhb....hbwewn.',
    '.bhh..ddhhcc....',
    '..hhbhhhhbc.....',
    '..dsssssssc.....',
    '....k..c.k......',
  ],
  [
    '..hhh...........',
    'hhbbh.....p.p...',
    'hbhbb....dhbhh..',
    '.hbhb....hbwewn.',
    '.bhh..ddhhcc....',
    '..hhbhhhhbc.....',
    '..dsssssssc.....',
    '...k..c..k......',
  ],
];

const HEDGEHOG_FRAMES = [
  [
    '...d.h.d.h.d....',
    '..hdhdhdhdhdh...',
    '.dhdhdhdhdhcce..',
    '.hdhdhdhdhccccp.',
    '..ssssssssccc...',
    '...k..k..k..k...',
  ],
  [
    '...h.d.h.d.h....',
    '..dhdhdhdhdhd...',
    '.hdhdhdhdhccce..',
    '.dhdhdhdhhccccp.',
    '..ssssssssccc...',
    '..k..k....k..k..',
  ],
];

const FROG_FRAMES = [
  [
    '......yy..yy..',
    '.....yewewew..',
    '...ddhhhhhhbh.',
    '..dhhohhhcccb.',
    '.dhhbsssscc...',
    '..k..k...k..k.',
  ],
  [
    '......yy..yy..',
    '.....yewewew..',
    '..dddhhhhhhbh.',
    '.dhhohhhhcccc.',
    '..hbsssscc....',
    '.k..k....k..k.',
  ],
];

const TURTLE_FRAMES = [
  [
    '....dhhhhhd......',
    '..ddhhbhbhbhd....',
    '.dhhbhdhbhdhbgb..',
    '.sssssssssssgewg.',
    '.cccccccccccggg..',
    '..g..g....g..g...',
  ],
  [
    '....dhhhhhd......',
    '..ddhhbhbhbhd....',
    '.dhhbhdhbhdhbgb..',
    '.sssssssssssgewg.',
    '.cccccccccccggg..',
    '...g..g..g..g....',
  ],
];

// ---------------------------------------------------------------------------
// Birds & Waterfowl
// ---------------------------------------------------------------------------
const CHICKEN_FRAMES = [
  [
    '.......r.r....',
    '......rrrr....',
    '.d.....hhwew..',
    'ddb...dhhhhry.',
    'dhhdddhhbbhr..',
    '.hbbbbhbbhh...',
    '..ssssssss....',
    '....y...y.....',
    '...yk..yk.....',
  ],
  [
    '.......r.r....',
    '......rrrr....',
    '.d.....hhwew..',
    'ddb...dhhhhry.',
    'dhhdddhhhhhr..',
    '.hbbbbhbbbh...',
    '..ssssssss....',
    '...y....y.....',
    '..yk...yk.....',
  ],
];

const DUCK_FRAMES = [
  [
    '........ggG...',
    '.......gGgewy.',
    '.......gGccyyy',
    '.d.....cccm...',
    'dhhdddhhbmm...',
    '.hhbllbbhmm...',
    '..ssssssss....',
    '....y...y.....',
  ],
  [
    '........ggG...',
    '.......gGgewy.',
    '.......gGccyyy',
    '.d.....cccm...',
    'dhhddhhhhmm...',
    '.hhbllbbhmm...',
    '..ssssssss....',
    '...y....y.....',
  ],
];

const DUCKLING_FRAMES = [
  [
    '.....hhh...',
    '....hhewy..',
    '.h.hhhbbyy.',
    'dhhhhbhss..',
    '.sssssss...',
    '...y..y....',
  ],
  [
    '.....hhh...',
    '....hhewy..',
    '.h.hhhbbyy.',
    'dhhhhhhss..',
    '.sssssss...',
    '..y...y....',
  ],
];

const SWAN_FRAMES = [
  [
    '...........hhh....',
    '..........hheek...',
    '..........hhkkyyy.',
    '..........hh......',
    '..d.......hh......',
    '.dhhddd..dhh......',
    'dhhhhhhhhhhh......',
    '.hbbhhhbbbbh......',
    '..sssssssss.......',
    '....k...k.........',
  ],
  [
    '...........hhh....',
    '..........hheek...',
    '..........hhkkyyy.',
    '..........hh......',
    '.d........hh......',
    'dhhddd...dhh......',
    'dhhhhhhhhhhh......',
    '.hbbhhhbbbbh......',
    '..sssssssss.......',
    '...k....k.........',
  ],
];

const GOOSE_FRAMES = [
  [
    '........ccc.....',
    '.......ccewyy...',
    '.......cccyyy...',
    '.......cc.......',
    '.d....dcc.......',
    'dbbdddhhcc......',
    '.hbbbbhcc.......',
    '..ssssss........',
    '...y..y.........',
  ],
  [
    '........ccc.....',
    '.......ccewyy...',
    '.......cccyyy...',
    '.......cc.......',
    '.d....dcc.......',
    'dbbdddhhcc......',
    '.hbbbbhcc.......',
    '..ssssss........',
    '..y...y.........',
  ],
];

const HERON_FRAMES = [
  [
    '....kkk.cc......',
    '.......ccewyyyyy',
    '.......cc...yy..',
    '.......cc.......',
    '......dcc.......',
    '.dd..dhhcc......',
    'dbbhddhbbh......',
    '.sbbbbhbs.......',
    '..ssssss........',
    '....k..k........',
    '....y..y........',
    '....y..y........',
    '....k..k........',
  ],
  [
    '....kkk.cc......',
    '.......ccewyyyyy',
    '.......cc...yy..',
    '.......cc.......',
    '......dcc.......',
    '.dd..dhhcc......',
    'dbbhdhhbbh......',
    '.sbbbbhbs.......',
    '..ssssss........',
    '....k..k........',
    '....y...y.......',
    '....y...y.......',
    '....k...k.......',
  ],
];

const OWL_FRAMES = [
  [
    '..h.....h...',
    '..bhccchb...',
    '..hcyeych...',
    '..hccyccch..',
    '.dhhbbbbhhd.',
    '.dbhcbbchbd.',
    '.sbbcbbcbb..',
    '..ssccccss..',
    '...y....y...',
  ],
  [
    '..h.....h...',
    '..bhccchb...',
    '..hcyeych...',
    '..hccyccch..',
    '.dhhbbbbhhd.',
    '.dbccbbccbd.',
    '.sbbcbbcbb..',
    '..ssccccss..',
    '...y....y...',
  ],
];

const SPARROW_FRAMES = [
  [
    '......mmm...',
    '.....meweyk.',
    '.....mcck...',
    '.d..dhhbn...',
    'dbbhhbhb....',
    '.ssssccc....',
    '...k...k....',
  ],
  [
    '......mmm...',
    '.....meweyk.',
    '.....mcck...',
    '.d..dhhbn...',
    'dbbhbhhb....',
    '.ssssccc....',
    '..k....k....',
  ],
];

const CROW_FRAMES = [
  [
    '.......hhh....',
    '......hhwek...',
    '......hbkkkk..',
    '.d...dhbbk....',
    'dhhddhhbbs....',
    '.hbbhhbbbs....',
    '..sssssss.....',
    '....k..k......',
  ],
  [
    '.......hhh....',
    '......hhwek...',
    '......hbkkkk..',
    '.d...dhbbk....',
    'dhhddhbbbs....',
    '.hbbhhhbb.....',
    '..sssssss.....',
    '...k...k......',
  ],
];

const PHEASANT_FRAMES = [
  [
    '.............gG.....',
    '............grewy...',
    '............gcc.....',
    '........ddddhbbb....',
    'ddddbbbbhhhhhbbbh...',
    '.ssddbbbsssssbbb....',
    '.........y...y......',
  ],
  [
    '.............gG.....',
    '............grewy...',
    '............gcc.....',
    '........ddddhbbb....',
    'ddddbbbbhhhhbbbbh...',
    '.ssddbbbsssssbbb....',
    '........y.....y.....',
  ],
];

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------
const PAL = {
  horse: furColors('#8d4e29', { belly: '#ebd8bd', hoof: '#1c1824', antler: '#6e3a1a' }),
  wildHorse: furColors('#4f576e', { belly: '#dce3ee', hoof: '#181a24', antler: '#c9c2b2' }),
  foal: furColors('#b87442', { belly: '#f2e0c4', antler: '#8a5226' }),
  cow: furColors('#c8bba8', { belly: '#f5efe6', pink: '#eb9ba8', hoof: '#24202a', tusk: '#ece2cc' }),
  bison: furColors('#634128', { belly: '#875c3c', hoof: '#1a151e', nose: '#1e161d', tusk: '#d6ccb8' }),
  pig: furColors('#e89aa3', { belly: '#f8ccd2', pink: '#f4788c', red: '#d64c64', hoof: '#422c30' }),
  piglet: furColors('#f2b4bc', { pink: '#f68ca0', red: '#de627a', hoof: '#4e3238' }),
  boar: furColors('#4d3224', { belly: '#74513d', pink: '#9c5a5a', hoof: '#1b161c', tusk: '#f6ebd2' }),
  sheep: furColors('#e3ddd0', { belly: '#f8f4ea', hoof: '#26232e' }),
  lamb: furColors('#ece7da', { pink: '#e8a2ac', hoof: '#2a2632' }),
  goat: furColors('#bcc2ca', { belly: '#eef2f5', hoof: '#24242c', tusk: '#c8b896' }),
  deer: furColors('#9d6537', { belly: '#f2e2c8', antler: '#cbb082', hoof: '#221c24', tusk: '#e0ccb0' }),
  doe: furColors('#ab7142', { belly: '#f4e5cd', antler: '#c99364', hoof: '#221c24' }),
  fawn: furColors('#be804c', { belly: '#f6ebd7', pink: '#c88c5c', hoof: '#262028' }),
  moose: furColors('#4e3322', { belly: '#c6bca8', antler: '#baa480', hoof: '#1b161c', tusk: '#d8ccb2' }),
  wolf: furColors('#71798e', { belly: '#cfd7e6', gold: '#e8aa2c', nose: '#1c1824' }),
  fox: furColors('#d05c22', { belly: '#f7ece0', hoof: '#1f1a24' }),
  shepherdDog: furColors('#a67540', { belly: '#efe4cf', spot: '#2c2834' }),
  bear: furColors('#654026', { belly: '#ba8c64', hoof: '#1b151a' }),
  rabbit: furColors('#eee9f2', { pink: '#f2a4b6', hoof: '#c8b4ca' }),
  rabbitBrown: furColors('#966846', { pink: '#d89a9c', hoof: '#5e3c26' }),
  squirrel: furColors('#b85524', { belly: '#f0dec4', pink: '#94421a', hoof: '#4a2614' }),
  hedgehog: furColors('#5b4638', { belly: '#e4cfb0', pink: '#df8890', hoof: '#2e2226' }),
  frog: furColors('#3ca44e', { belly: '#d2e282', gold: '#f4ca3a', spot: '#1f5e34', hoof: '#246e36' }),
  turtle: furColors('#48783e', { belly: '#b99c62', green: '#648f48', gold: '#a4a852' }),
  chicken: furColors('#efeae0', { red: '#d83834', gold: '#eb9d2e', hoof: '#6e5226' }),
  duck: furColors('#7e8494', { belly: '#f2eee6', green: '#1e6e58', greenHi: '#34a87e', chestnut: '#824024', blue: '#3e74b8', gold: '#ec9c28' }),
  duckling: furColors('#f2ca3c', { gold: '#eb8c22' }),
  swan: furColors('#eef2fa', { hoof: '#1e202c', gold: '#f07c2e' }),
  goose: furColors('#868d9e', { belly: '#f2f4f8', gold: '#eb8c28' }),
  heron: furColors('#95a0b4', { belly: '#eef2f8', gold: '#e5b232', hoof: '#2a2c38' }),
  owl: furColors('#8a5a36', { belly: '#eedec2', gold: '#f2b82a' }),
  sparrow: furColors('#8e6446', { belly: '#e8dcc8', chestnut: '#a44b2a', gold: '#b89458', hoof: '#342622' }),
  crow: furColors('#242636', { hoof: '#141520' }),
  pheasant: furColors('#a65428', { belly: '#f2ece2', red: '#dc322c', green: '#1f6a4e', greenHi: '#349e74', gold: '#c9883a' }),
};

const PAINTERS = {
  pig: (f) => animalRig(PIG_UPPER, PIG_LEGS, PAL.pig, f),
  cow: (f) => animalRig(COW_UPPER, COW_LEGS, PAL.cow, f),
  chicken: (f) => drawFrames(CHICKEN_FRAMES, PAL.chicken, f),
  horse: (f) => animalRig(HORSE_UPPER, HORSE_LEGS, PAL.horse, f),
  rabbit: (f) => drawFrames(RABBIT_FRAMES, PAL.rabbit, f),
  rabbitBrown: (f) => drawFrames(RABBIT_FRAMES, PAL.rabbitBrown, f),
  fox: (f) => drawFrames(FOX_FRAMES, PAL.fox, f),
  deer: (f) => animalRig([...DEER_ANTLER, ...DEER_UPPER], DEER_LEGS, PAL.deer, f),
  doe: (f) => animalRig(DEER_UPPER, DEER_LEGS, PAL.doe, f),
  fawn: (f) => animalRig(FAWN_UPPER, FAWN_LEGS, PAL.fawn, f),
  boar: (f) => animalRig(BOAR_UPPER, BOAR_LEGS, PAL.boar, f),
  piglet: (f) => animalRig(PIGLET_UPPER, PIGLET_LEGS, PAL.piglet, f),
  wildHorse: (f) => animalRig(HORSE_UPPER, HORSE_LEGS, PAL.wildHorse, f),
  foal: (f) => animalRig(FOAL_UPPER, FOAL_LEGS, PAL.foal, f),
  lamb: (f) => animalRig(LAMB_UPPER, LAMB_LEGS, PAL.lamb, f),
  shepherdDog: (f) => animalRig(DOG_UPPER, DOG_LEGS, PAL.shepherdDog, f),
  squirrel: (f) => drawFrames(SQUIRREL_FRAMES, PAL.squirrel, f),
  duck: (f) => drawFrames(DUCK_FRAMES, PAL.duck, f),
  duckling: (f) => drawFrames(DUCKLING_FRAMES, PAL.duckling, f),
  swan: (f) => drawFrames(SWAN_FRAMES, PAL.swan, f),
  heron: (f) => drawFrames(HERON_FRAMES, PAL.heron, f),
  hedgehog: (f) => drawFrames(HEDGEHOG_FRAMES, PAL.hedgehog, f),
  frog: (f) => drawFrames(FROG_FRAMES, PAL.frog, f),
  turtle: (f) => drawFrames(TURTLE_FRAMES, PAL.turtle, f),
  owl: (f) => drawFrames(OWL_FRAMES, PAL.owl, f),
  sheep: (f) => animalRig(SHEEP_UPPER, SHEEP_LEGS, PAL.sheep, f),
  goat: (f) => animalRig(GOAT_UPPER, GOAT_LEGS, PAL.goat, f),
  sparrow: (f) => drawFrames(SPARROW_FRAMES, PAL.sparrow, f),
  crow: (f) => drawFrames(CROW_FRAMES, PAL.crow, f),
  wolf: (f) => animalRig(CANID_UPPER, CANID_LEGS, PAL.wolf, f),
  bear: (f) => animalRig(BEAR_UPPER, BEAR_LEGS, PAL.bear, f),
  moose: (f) => animalRig(MOOSE_UPPER, MOOSE_LEGS, PAL.moose, f),
  pheasant: (f) => drawFrames(PHEASANT_FRAMES, PAL.pheasant, f),
  goose: (f) => drawFrames(GOOSE_FRAMES, PAL.goose, f),
  bison: (f) => animalRig(BISON_UPPER, BISON_LEGS, PAL.bison, f),
};

// Only beasts considered large in real life are scaled up visually (never rabbits, chickens, pigs, sheep, etc.).
export const LARGE_ANIMAL_KINDS = new Set(['cow', 'horse', 'wildHorse', 'deer', 'doe', 'bison', 'bear', 'moose', 'boar']);

export function animalSprite(kind, dir, frame) {
  return once('animalV3_' + kind + dir + frame, () => {
    const painter = PAINTERS[kind] || PAINTERS.rabbit;
    const grid = painter(frame || 0);
    const outlined = addOutline(dir === 'left' ? mirrored(grid) : grid, OUTLINE);
    const raw = toCanvas(outlined);
    const ax = Math.floor(outlined.width / 2);
    const ay = outlined.height - 1;
    if (!LARGE_ANIMAL_KINDS.has(kind)) {
      return { canvas: raw, ax, ay };
    }
    const scale = 1.48;
    const big = document.createElement('canvas');
    big.width = Math.round(raw.width * scale);
    big.height = Math.round(raw.height * scale);
    const g = big.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(raw, 0, 0, big.width, big.height);
    return { canvas: big, ax: Math.round(ax * scale), ay: Math.round(ay * scale) };
  });
}
