import { spriteOf, once } from './pixels';
import { OUTLINE } from './palette';

// The small 12 x 12 pictures of the menus: items, grammar types, powers, menu entries.
// iconUrl(name) gives a picture the page can show in an <img> (see ui/PixelIcon.jsx).

// ---------- The pictures (one letter = one pixel) ----------

const SWORD = ['..........VV', '.........VWV', '........VWV.', '.......VWV..', '......VWV...', '.....VWV....', '..Y.VWV.....', '...YWV......', '...NY.......', '..N..Y......', '.N..........', 'N...........'];
const ARMOR = ['..AA....AA..', '.AAAA..AAAA.', '.AAAAAAAAAA.', '..AALAAAAA..', '..ALAAAAAA..', '..AAAAAAAA..', '..AAAAAAAA..', '..AAAAAAAA..', '..aAAAAAAa..', '...aaaaaa...'];
const BOOT = ['...BBBB.....', '...BLBB.....', '...BBBB.....', '...BBBB.....', '...BBBB.....', '...BBBBBBB..', '...BBBBBBBB.', '...bbbbbbbb.'];
const POTION = ['.....NN.....', '.....GG.....', '....GPPG....', '...GPPPPG...', '..GPPWPPPG..', '..GPWPPPPG..', '..GPPPPPPG..', '..GPPPPPPG..', '...GPPPPG...', '....GGGG....'];
const BREAD = ['............', '...CCCCCC...', '..CLCLCLCC..', '.CCCCCCCCCC.', '.CCCCCCCCCC.', '.cCCCCCCCCc.', '..cccccccc..'];
const MAP = ['.PPPPPPPPPP.', '.PWWWWWWWWP.', '.PWRWWWWWWP.', '.PWWKKWWWWP.', '.PWWWWKWRWP.', '.PWWWWWWWWP.', '.PPPPPPPPPP.'];
const SEED = ['.....N......', '....NNN.....', '.....N......', '....BBB.....', '...BBBBB....', '...BBBBB....', '....BBB.....'];
const CARROT = ['...N..N.....', '....NN......', '...OOOO.....', '...OOOO.....', '....OOO.....', '....OO......', '....OO......', '.....O......'];
const FLOWER = ['....PP......', '...PYYP.....', '..PYYYYP....', '...PYYP.....', '....PP......', '.....N......', '...N.N......', '....NN......', '.....N......'];
const COIN = ['...YYYYY....', '..YyYYYYY...', '.YyYYYYYYY..', '.YyYYyYYYY..', '.YyYYyYYYY..', '.YyYYYYYYY..', '..YYYYYYY...', '...yyyyy....'];
const GEM = ['...LLLLL....', '..LCCCCCL...', '.LCCLCCCCL..', '..CCCCCCC...', '...CCCCC....', '....CCC.....', '.....C......'];
const RING = ['....GLG.....', '....GGG.....', '...Y...Y....', '..Y.....Y...', '..Y.....Y...', '..Y.....Y...', '...Y...Y....', '....YYY.....'];
const BOOK = ['.BBBBBBBBB..', '.BWWWWWWWB..', '.BWKKKKWWB..', '.BWWWWWWWB..', '.BWKKKKKWB..', '.BWWWWWWWB..', '.BWKKKWWWB..', '.BWWWWWWWB..', '.BBBBBBBBB..', '.bbbbbbbbb..'];
const STATS = ['.........G..', '.........G..', '......B..G..', '......B..G..', '...R..B..G..', '...R..B..G..', '...R..B..G..', 'KKKKKKKKKKKK'];
const BAG = ['....NNNN....', '...N....N...', '..BBBBBBBB..', '.BBBBYYBBBB.', '.BBBBYYBBBB.', '.BLBBBBBBBB.', '.BLBBBBBBBB.', '.BBBBBBBBBB.', '..bbbbbbbb..'];
const SCROLL = ['.PPPPPPPPP..', 'PWWWWWWWWWP.', '.PWKKKKKWP..', '.PWWWWWWWP..', '.PWKKKKWWP..', '.PWWWWWWWP..', '.PWKKKKKWP..', 'PWWWWWWWWWP.', '.PPPPPPPPP..'];
const STAR = ['.....Y......', '.....Y......', '....YWY.....', 'YYYYWWWYYYY.', '.YYWWWWWYY..', '..YYWWWYY...', '..YYY.YYY...', '.YY.....YY..'];
const SAVE = ['BBBBBBBBBB..', 'BWWWWWWWBB..', 'BWWWWWWWBB..', 'BBBBBBBBBB..', 'BBGGGGGGBB..', 'BBGGGKGGBB..', 'BBGGGKGGBB..', 'BBBBBBBBBB..'];
const DOOR = ['..NNNNNN....', '..NWWWWN....', '..NWWWWN....', '..NWWWWN.R..', '..NWWYWNRRR.', '..NWWWWN.R..', '..NWWWWN....', '..NNNNNN....'];
const SHIELD = ['.GGGGGGGGG..', '.GUUUUUUUG..', '.GUUYYUUUG..', '.GUUYYUUUG..', '.GUUUUUUUG..', '..GUUUUUG...', '...GUUUG....', '....GGG.....'];
const PEOPLE = ['..HH...HH...', '.HSSH.HSSH..', '.HSSH.HSSH..', '..SS...SS...', '.CCCC.CCCC..', 'CCCCCCCCCCC.', 'CCCCCCCCCCC.'];
const FLAME = ['.....R......', '....RO......', '....ROR.....', '...ROOR..R..', '..ROYOOR.R..', '..ROYYOORR..', '..ROYYYOR...', '...RYYYR....', '....RRR.....'];
const SCALES = ['.....Y......', 'YYYYYYYYYYY.', 'Y....Y....Y.', 'Y....Y....Y.', 'YY...Y...YY.', 'YYY..Y..YYY.', '.....Y......', '...YYYYY....'];
const SWIRL = ['...MMMMM....', '..M.....M...', '.M..MMM..M..', '.M.M...M.M..', '.M.M.M.M.M..', '.M..MM..M...', '..M....M....', '...MMMM.....'];
const HOURGLASS = ['.NNNNNNNNN..', '..GYYYYYG...', '...GYYYG....', '....GYG.....', '....GYG.....', '...G.Y.G....', '..G.YYY.G...', '.NNNNNNNNN..'];
const CHAIN = ['..GGG.......', '.G...G......', '.G...G......', '..GGGLGG....', '....G...G...', '....G...G...', '.....GGG....'];
const ROCK = ['....GGGG....', '..GGLLGGG...', '.GGLGGGGGG..', '.GGGGGGGGg..', '..gGGGGGgg..', '...gggggg...'];
const BOLT = ['......YY....', '.....YY.....', '....YY......', '...YYYYY....', '.....YY.....', '....YY......', '...YY.......', '..Y.........'];
const CLOUD = ['....WWW.....', '..WWWWWWW...', '.WWWWWWWWW..', 'WWWWWWWWWWW.', '.GGGGGGGGG..', '...Y...Y....', '..Y...Y.....'];
const ORB = ['...BBBB.....', '..BWWBBB....', '.BWBBBBBB...', '.BBBBBBBB...', '.BBBBBBBB...', '..BBBBBB....', '...BBBB.....'];
const DROP = ['.....B......', '....BB......', '....BBB.....', '...BBBBB....', '..BBWBBBB...', '..BWBBBBB...', '..BBBBBBB...', '...BBBBB....', '....BBB.....'];
const LEAF = ['.......NNN..', '.....NNNNN..', '...NNNNLNN..', '..NNNNLNNN..', '..NNNLNNN...', '..NNLNNN....', '...LNN......', '..L.........'];
const PAWN = ['....DDD.....', '...DLDDD....', '...DDDDD....', '....DDD.....', '...DDDDD....', '....DDD.....', '...DDDDD....', '..DDDDDDD...'];
const CAT = ['D...D.......', 'DD.DD.......', 'DVDVD....D..', 'DDDDD...D...', '.DDDDDDDD...', '.DDDDDDDD...', '.D.D..D.D...'];
const SHARD = ['....L.......', '...LDD......', '...LDD.L....', '..LDDDLDD...', '..LDDDLDD...', '.LDDDDLDD...', '.LDDDDDDD...', '.DDDDDDDD...'];
const TALK = ['.WWWWWWWWW..', 'WWWWWWWWWWW.', 'WWKWWKWWKWW.', 'WWWWWWWWWWW.', '.WWWWWWWWW..', '...WW.......', '..W.........'];
const MOON = ['....YYY.....', '..YYY.......', '.YYY........', '.YYY.....W..', '.YYY....W.W.', '.YYYY....W..', '..YYYYYYY...', '....YYYY....'];
const PICKAXE = ['..GGGGGGG...', '.GG..N..GG..', 'G....N....G.', '.....N......', '.....N......', '.....N......', '.....N......', '.....N......'];
const CHEST = ['..DDDDDDDD..', '.DWWWWWWWWD.', '.YYYYYYYYYY.', '.DWWWYYWWWD.', '.DWWWWWWWWD.', '.DDDDDDDDDD.'];
const MENU = ['............', 'WWWWWWWWWWW.', 'WWWWWWWWWWW.', '............', 'WWWWWWWWWWW.', 'WWWWWWWWWWW.', '............', 'WWWWWWWWWWW.', 'WWWWWWWWWWW.'];
const MUG = ['..WWWW......', '.YYYYYY.....', '.YYYYYYY....', '.YYYYY.Y....', '.YYYYYYY....', '.YYYYYY.....'];
const FISH = ['............', '.U..UUU.....', '.UUUUWUU....', '.UUUUUUU....', '.U..UUU.....'];

// ---------- The marks of the world map ----------
const TOWN = ['.....RR.....', '....RRRR....', '...RRRRRR...', '..RRRRRRRR..', '.RRRRRRRRRR.', '..WWWWWWWW..', '..WNNWWUUW..', '..WNNWWUUW..', '..WNNWWWWW..'];
const SKULL = ['...PPPPPP...', '..PPWWWWPP..', '.PPWWWWWWPP.', '.PWKKWWKKWP.', '.PWKKWWKKWP.', '.PPWWKKWWPP.', '..PPWWWWPP..', '...PWPWPWP..', '....PPPPP...'];
const MONEY_BAG = ['....NNNN....', '.....NN.....', '...GGGGGG...', '..GGGLLGGG..', '.GGGLYYLGGG.', '.GGGGYYGGGG.', '.GGGLYYLGGG.', '.GGGGGGGGGG.', '..gggggggg..'];
const BED = ['U...........', 'U.WW........', 'UWWWUUUUUUU.', 'UUUUUUUUUUUU', 'UUUUUUUUUUUU', 'U..........U'];
const ARROW = ['.....W......', '....WWW.....', '...WWWWW....', '..WWWWWWW...', '.WWWWWWWWW..', '....WWW.....', '....WWW.....', '....WWW.....'];
const DIAMOND = ['.....L......', '....LMM.....', '...LMMMM....', '..LMMMMMD...', '...MMMMD....', '....MMD.....', '.....D......'];
const CROSS = ['RR......RR..', '.RR....RR...', '..RR..RR....', '...RRRR.....', '...RRRR.....', '..RR..RR....', '.RR....RR...', 'RR......RR..'];
const BRIDGE = ['..NNNNNNNN..', '.NnNnNnNnNN.', 'NN........NN', 'N..........N', 'UUU......UUU', 'UUUU....UUUU'];

// The colors shared by every picture. Each icon can change some of them.
const BASE = { K: '#1c1726', W: '#ffffff', G: '#9aa6b8', L: '#e8eef7', Y: '#ffd23f', y: '#c9961e', N: '#7a4a24', R: '#e8423f', O: '#ff9a2b', U: '#3a7bff', D: '#2c2342', V: '#c9d1e0' };

function blade(color, light) {
  return { V: color, W: light };
}

// name -> [picture, its colors]
const ICONS = {
  // ---------- Items ----------
  woodSword: [SWORD, blade('#a0683a', '#c48c52')],
  ironSword: [SWORD, blade('#9aa6b8', '#e8eef7')],
  steelSword: [SWORD, blade('#c9d1e0', '#ffffff')],
  mithrilSword: [SWORD, blade('#5fd3e8', '#d8f6ff')],
  lexiconBlade: [SWORD, blade('#ffd23f', '#fff6c8')],
  clothes: [ARMOR, { A: '#2d3a6e', a: '#1d2550', L: '#4a5a9e' }],
  leatherArmor: [ARMOR, { A: '#a0683a', a: '#6b3e1f', L: '#c48c52' }],
  chainMail: [ARMOR, { A: '#9aa6b8', a: '#6d7686', L: '#d8dee8' }],
  plateArmor: [ARMOR, { A: '#c9d1e0', a: '#8a93a6', L: '#ffffff' }],
  sandals: [BOOT, { B: '#c48c52', b: '#8a5a30', L: '#e0b07a' }],
  leatherBoots: [BOOT, { B: '#7a4a24', b: '#4f2e17', L: '#a0683a' }],
  windBoots: [BOOT, { B: '#4cc35a', b: '#2f8a3c', L: '#9fe8a8' }],
  healthPotion: [POTION, { P: '#e8423f' }],
  manaPotion: [POTION, { P: '#3a7bff' }],
  speedPotion: [POTION, { P: '#4cc35a' }],
  bread: [BREAD, { C: '#d9a05a', c: '#a8743a', L: '#f2d29a' }],
  map1: [MAP, { P: '#c48c52' }],
  map2: [MAP, { P: '#7a4a24' }],
  map3: [MAP, { P: '#ffd23f' }],
  carrotSeed: [SEED, { N: '#4caf50', B: '#a0683a' }],
  carrot: [CARROT, { N: '#4caf50' }],
  flower: [FLOWER, { P: '#ff6fa8', N: '#4caf50' }],
  oldCoin: [COIN, {}],
  gem: [GEM, { C: '#5fd3e8', L: '#d8f6ff' }],
  ring: [RING, {}],
  book: [BOOK, { B: '#3a7bff', b: '#2b4f96' }],
  mug: [MUG, {}],
  shield: [SHIELD, {}],
  fish: [FISH, {}],

  // ---------- The grammar types ----------
  gerunds: [FLOWER, { P: '#ff6fb5', N: '#4caf50' }],
  prepositions: [ROCK, { G: '#b07a55', L: '#d9a77f', g: '#7a5236' }],
  vocabulary: [BOOK, { B: '#c9c9d6', b: '#8a8a9a' }],
  passive: [SHIELD, { U: '#ff8a3d' }],
  pronouns: [PEOPLE, { H: '#4a3020', S: '#f3d2b3', C: '#4cc35a' }],
  comparatives: [FLAME, { R: '#3a7bff', O: '#6fa0ff', Y: '#d8e6ff' }],
  subjectVerb: [SCALES, { Y: '#a066ff' }],
  wordForms: [SWIRL, { M: '#e8423f' }],
  verbTenses: [HOURGLASS, {}],
  connectors: [CHAIN, { G: '#22d3ee', L: '#b8f4ff' }],

  // ---------- Powers ----------
  obsidianBarrier: [SHARD, { L: '#b48cff' }],
  obsidianSoldier: [PAWN, { L: '#6a5aa0' }],
  obsidianPet: [CAT, { V: '#c9a8ff' }],
  obsidianBlade: [SWORD, blade('#3a2f5b', '#b48cff')],
  lightningStrike: [BOLT, {}],
  lightningField: [CLOUD, { W: '#c9d1e0', G: '#6d7686' }],
  lightningBall: [ORB, { B: '#5fb8ff' }],
  water: [DROP, { B: '#3a7bff' }],
  fire: [FLAME, {}],
  wind: [LEAF, { N: '#4cc35a', L: '#c8ffd8' }],
  earth: [ROCK, { G: '#a0683a', L: '#c48c52', g: '#6b3e1f' }],

  // ---------- Menus and actions ----------
  stats: [STATS, { B: '#3a7bff', G: '#4cc35a' }],
  inventory: [BAG, { B: '#a0683a', b: '#6b3e1f', L: '#c48c52' }],
  quests: [SCROLL, { P: '#c48c52' }],
  powers: [STAR, {}],
  map: [MAP, { P: '#c48c52' }],
  save: [SAVE, { B: '#3a7bff', G: '#c9d1e0' }],
  quit: [DOOR, {}],
  lexis: [COIN, {}],
  talk: [TALK, {}],
  sleep: [MOON, {}],
  dig: [PICKAXE, {}],
  chest: [CHEST, { D: '#6b3e1f', W: '#a0683a' }],
  menu: [MENU, {}],

  // ---------- The world map ----------
  town: [TOWN, { R: '#e8423f', N: '#7a4a24' }],
  dungeon: [SKULL, { P: '#8a3fd1' }],
  shop: [MONEY_BAG, { G: '#3f9a4a', g: '#2a6b33', L: '#7cc45a' }],
  inn: [BED, { U: '#3a7bff', W: '#ffffff' }],
  you: [ARROW, {}],
  mainQuest: [DIAMOND, { L: '#fff3b0', M: '#ffc83a', D: '#c98a12' }],
  sideQuest: [DIAMOND, { L: '#d6ecff', M: '#4aa0ff', D: '#1f5fc0' }],
  treasure: [CHEST, { D: '#6b3e1f', W: '#e8b83a' }],
  bridge: [BRIDGE, { N: '#a0683a', n: '#6b3e1f', U: '#3a7bff' }],
  blocked: [CROSS, {}],
};

// The picture of an icon, as a 14 x 14 canvas (12 x 12 + its outline). Unknown name: the star.
export function iconCanvas(name) {
  return once('iconCanvas' + name, () => {
    const [rows, colors] = ICONS[name] || ICONS.powers;
    const top = Math.floor((12 - rows.length) / 2); // the picture is centered in a 12 x 12 square
    const square = [...Array(top).fill(''), ...rows, ...Array(12 - rows.length - top).fill('')].map((row) => row.padEnd(12, '.'));
    return spriteOf(square, { ...BASE, ...colors }, OUTLINE);
  });
}

// The same picture as a "data:" address, for an <img>.
export function iconUrl(name) {
  return once('icon' + name, () => iconCanvas(name).toDataURL());
}
