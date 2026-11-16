import { NPCS } from '../data/npcs';
import { insideOf, villageOf, doorOf } from '../data/zones';
import { TILE } from '../world/tileKinds';
import { setTile, fillRect } from '../world/grid';
import { propsAround } from '../world/map';
import { pickRandom } from '../../logic/random';
import { facingOf } from './input';
import { say, notify } from './messages';
import { emote } from './emotes';
import { cue } from './cues';
import { talkTo } from './people';
import { interactBoard } from './society/worldLife';

// The inside of the Guild of Adventurers: a tavern. Adventurers drink at the tables, two servers carry the drinks
// from the bar, the guild members wait for work, and the quest board hangs on the wall.
// It uses the same room as the visited houses (see logic/houses.js): game.run.visitHouse, with `patrons` in it.

const TALK_RANGE = 1.5;
const SERVER_SPEED = 1.6; // tiles per second

// The drinks of the bar: price in Lexis, and what they give back.
const DRINKS = [
  { name: 'Mug of ale', price: 6, thirst: 25, hunger: 0, line: 'Cold, bitter, perfect after a fight.' },
  { name: 'Honey mead', price: 9, thirst: 30, hunger: 5, line: 'Sweet as a good answer.' },
  { name: 'Spiced cider', price: 4, thirst: 20, hunger: 0, line: 'The house special. Careful, it bites.' },
  { name: 'Water', price: 0, thirst: 15, hunger: 0, line: 'Even heroes need water. On the house.' },
];

// How the people of the tavern look (they are not people of data/npcs.js: they have no story).
const DRINKER_LOOKS = [
  { skin: '#f1c9a5', hair: '#5a3b22', style: 'short', eyes: '#3a6fd8', outfit: '#7a4a24', trim: '#c9a26a' },
  { skin: '#8d5a3b', hair: '#1c1726', style: 'bald', eyes: '#3a2416', outfit: '#3f6b3a', trim: '#a3c46a' },
  { skin: '#fde0c8', hair: '#d6b45a', style: 'long', eyes: '#4fb37a', outfit: '#6a3a8a', trim: '#c9a8ff' },
  { skin: '#c99a72', hair: '#8a2a1a', style: 'short', eyes: '#2a2a2a', outfit: '#555068', trim: '#aab3c3' },
  { skin: '#f1c9a5', hair: '#9aa6b8', style: 'short', eyes: '#3a2416', outfit: '#8a1a1a', trim: '#e0a22a' },
  { skin: '#6b4423', hair: '#1c1726', style: 'long', eyes: '#3a2416', outfit: '#1f4fd8', trim: '#8fd0ff' },
];
const SERVER_LOOKS = [
  { skin: '#fde0c8', hair: '#c8102e', style: 'long', eyes: '#4fb37a', outfit: '#1c1726', trim: '#ffd23f' },
  { skin: '#c99a72', hair: '#1c1726', style: 'short', eyes: '#3a6fd8', outfit: '#ffffff', trim: '#8a1a1a' },
];
const DRINKER_NAMES = ['Borin the Axe', 'Quiet Edda', 'Old Tamsin', 'Rook', 'Sir Pell', 'Marla Two-Swords'];
const SERVER_NAMES = ['Scarlett', 'Dante'];

// What the drinkers say when the hero talks to them.
const DRINKER_LINES = [
  'They say the Demon King can not stand the passive voice. Use it on him!',
  'I lost a fight to a slime this morning. A SLIME. It asked me about prepositions.',
  'Cheers, friend! To good answers and short questions!',
  'Pass the board sometimes: the villages pay well for monster heads.',
  'The training dummies outside? Best teachers in the kingdom. They never laugh at you.',
  'I hear a dragon in the north only speaks in conditionals.',
  'One more mug and I will tell you my story. Two more and I will sing it.',
];
const SERVER_LINES = [
  'Hey there, hero. You look thirsty... and brave. What can I bring you?',
  'Back so soon? I was starting to think you only came for the quests.',
  'Sit wherever you like. I will find you, I always do.',
];

// ---------- The room ----------

// Builds the guild hall in the room of the visits: floor, bar, tables, board. Returns its props and its people.
export function buildGuildHall(game, house) {
  const { x, y, w, h } = insideOf('visitHouse');
  fillRect(x, y, w, h, TILE.WALL);
  fillRect(x + 1, y + 2, w - 2, h - 3, TILE.WOOD_FLOOR);

  const props = [
    { kind: 'barCounter', x: x + 12, y: y + 4, w: 8, h: 1, fixed: true },
    { kind: 'barrels', x: x + 13, y: y + 2, w: 1, h: 1, fixed: true },
    { kind: 'barrels', x: x + 16, y: y + 2, w: 1, h: 1, fixed: true },
    { kind: 'barrels', x: x + 19, y: y + 2, w: 1, h: 1, fixed: true },
    { kind: 'board', x: x + 3, y: y + 2, w: 1, h: 1, fixed: true },
    { kind: 'tavernTable', x: x + 3, y: y + 7, w: 2, h: 1, fixed: true },
    { kind: 'tavernTable', x: x + 8, y: y + 9, w: 2, h: 1, fixed: true },
    { kind: 'tavernTable', x: x + 3, y: y + 12, w: 2, h: 1, fixed: true },
    { kind: 'tavernTable', x: x + 15, y: y + 10, w: 2, h: 1, fixed: true },
    { kind: 'wallTorch', x: x + 6, y: y + 1, w: 1, h: 1, walkable: true },
    { kind: 'wallTorch', x: x + 10, y: y + 1, w: 1, h: 1, walkable: true },
    { kind: 'window', x: x + 7, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'banner', color: '#d0202a', x: x + 2, y: y + 2, w: 1, h: 1, walkable: true },
    { kind: 'banner', color: '#2f50a0', x: x + 9, y: y + 2, w: 1, h: 1, walkable: true },
    { kind: 'weaponRack', x: x + 4, y: y + 2, w: 2, h: 1 },
    { kind: 'furniture', look: 'rug', color: '#8a1a1a', x: x + 9, y: y + 13, w: 2, h: 1, walkable: true },
    { kind: 'furniture', look: 'rug', color: '#c9961e', x: x + 9, y: y + 6, w: 2, h: 1, walkable: true },
    { kind: 'furniture', look: 'plant', color: '#3f9b2f', x: x + 1, y: y + 2, w: 1, h: 1 },
    { kind: 'flowerPot', variant: 0, x: x + 20, y: y + 13, w: 1, h: 1, walkable: true },
    { kind: 'flowerPot', variant: 2, x: x + 1, y: y + 13, w: 1, h: 1, walkable: true },
  ];

  const mat = { x: x + 10, y: y + h - 1 };
  setTile(mat.x, mat.y, TILE.STAIRS);
  const door = doorOf(house);

  return {
    house: house,
    guild: true,
    info: { names: [] },
    title: 'Guild of Adventurers',
    isFamily: false,
    props: props,
    patrons: patronsOf(game, x, y),
    mat: mat,
    landing: { x: mat.x + 0.5, y: mat.y - 1 },
    exit: { x: door.x + 0.5, y: door.y + 1.5 },
  };
}

// The people inside: drinkers at the tables, the two servers, and the guild members (real people of the story).
function patronsOf(game, x, y) {
  const seats = [
    [x + 2.5, y + 7.6, 'right'],
    [x + 5.6, y + 7.6, 'left'],
    [x + 7.5, y + 9.6, 'right'],
    [x + 10.6, y + 9.6, 'left'],
    [x + 2.5, y + 12.6, 'right'],
    [x + 14.5, y + 10.6, 'right'],
  ];
  const drinkers = seats.map(([sx, sy, dir], i) => ({
    kind: 'drinker',
    name: DRINKER_NAMES[i],
    look: DRINKER_LOOKS[i],
    x: sx,
    y: sy,
    dir: dir,
    sipTime: 1 + i * 0.7, // seconds before the next sip
    drinking: false,
  }));
  const servers = SERVER_NAMES.map((name, i) => ({
    kind: 'server',
    name: name,
    look: SERVER_LOOKS[i],
    x: x + 14 + i * 3,
    y: y + 6,
    dir: 'down',
    step: 0,
    walking: false,
    // the bar, then a table, then the bar again...
    route: i === 0 ? [[x + 14, y + 6], [x + 6.5, y + 8.5], [x + 14, y + 6], [x + 3.5, y + 11]] : [[x + 17, y + 6], [x + 11.5, y + 10.5], [x + 17, y + 6], [x + 14, y + 12]],
    leg: 0,
    wait: 2 + i * 1.5,
  }));
  const members = NPCS.filter((npc) => npc.guild && game.npcs[npc.id]?.alive && !game.player.party.includes(npc.id)).map((npc, i) => ({
    kind: 'member',
    npcId: npc.id,
    name: npc.name,
    look: npc.look,
    x: x + 7 + i * 2,
    y: y + 4,
    dir: 'down',
  }));
  return [...drinkers, ...servers, ...members];
}

export function isInGuildHall(game) {
  return Boolean(game.run.visitHouse && game.run.visitHouse.guild);
}

// ---------- Every frame ----------

// The servers walk from the bar to the tables; the drinkers lift their mugs from time to time.
export function updateGuildHall(game, dt) {
  if (!isInGuildHall(game)) return;
  for (const patron of game.run.visitHouse.patrons) {
    if (patron.kind === 'server') moveServer(patron, dt);
    if (patron.kind === 'drinker') sip(patron, dt);
  }
}

function moveServer(server, dt) {
  if (server.wait > 0) {
    server.wait -= dt;
    server.walking = false;
    return;
  }
  const [tx, ty] = server.route[server.leg];
  const far = Math.hypot(tx - server.x, ty - server.y);
  if (far < 0.1) {
    server.leg = (server.leg + 1) % server.route.length;
    server.wait = 1.5 + Math.random() * 2; // a moment to serve (or to fill the mugs)
    return;
  }
  const move = Math.min(far, SERVER_SPEED * dt);
  server.dir = facingOf(tx - server.x, ty - server.y);
  server.x += ((tx - server.x) / far) * move;
  server.y += ((ty - server.y) / far) * move;
  server.step += dt * 6;
  server.walking = true;
}

function sip(drinker, dt) {
  drinker.sipTime -= dt;
  if (drinker.sipTime > 0) return;
  drinker.drinking = !drinker.drinking;
  drinker.sipTime = drinker.drinking ? 1.2 : 3 + Math.random() * 4;
}

// ---------- Talking ----------

function patronNear(game) {
  if (!isInGuildHall(game)) return null;
  const player = game.player;
  return game.run.visitHouse.patrons.find((patron) => Math.hypot(patron.x - player.x, patron.y - player.y) < TALK_RANGE) || null;
}

// A drink from the bar: paid, it quenches the thirst (and a bit of hunger).
function buyDrink(game, drink) {
  const player = game.player;
  if (player.lexis < drink.price) {
    say(game, null, ['Not enough Lexis for a ' + drink.name.toLowerCase() + '. The water is free, though.']);
    return;
  }
  player.lexis -= drink.price;
  player.thirst = Math.min(100, player.thirst + drink.thirst);
  player.hunger = Math.min(100, player.hunger + drink.hunger);
  cue(game, 'coin');
  emote(game, 'hero', 'note');
  notify(game, '🍺 ' + drink.name + ': +' + drink.thirst + ' thirst. ' + drink.line, '#ffd086');
}

function drinkChoices(game) {
  return DRINKS.map((drink) => ({ label: drink.name + (drink.price > 0 ? ' (' + drink.price + ' Lexis)' : ' (free)'), icon: 'water', run: () => buyDrink(game, drink) }));
}

function talkToPatron(game, patron) {
  if (patron.kind === 'member') {
    talkTo(game, NPCS.find((npc) => npc.id === patron.npcId));
    return;
  }
  if (patron.kind === 'server') {
    emote(game, 'hero', 'heart');
    say(game, null, [patron.name + ': "' + pickRandom(SERVER_LINES) + '"'], [...drinkChoices(game), { label: 'Nothing for now', run: () => {} }]);
    return;
  }
  say(game, null, [patron.name + ': "' + pickRandom(DRINKER_LINES) + '"']);
}

// The quest board of the guild: the bounties of the village where the guild stands.
function readBoard(game) {
  const village = villageOf(game.run.visitHouse.house.village);
  if (!village) {
    say(game, null, ['The board is empty today. Come back tomorrow.']);
    return;
  }
  interactBoard(game, village);
}

// What the action button does inside the guild hall.
export function actionsOfGuildHall(game) {
  const inside = isInGuildHall(game);
  const near = inside ? propsAround(game.player.x, game.player.y, 1.8) : [];
  return [
    { when: () => inside && patronNear(game) !== null, icon: 'talk', run: () => talkToPatron(game, patronNear(game)) },
    { when: () => inside && near.some((prop) => prop.kind === 'board'), icon: 'quests', run: () => readBoard(game) },
    { when: () => inside && near.some((prop) => prop.kind === 'barCounter'), icon: 'water', run: () => say(game, null, ['The bar smells of wood, smoke and honey. What will it be?'], [...drinkChoices(game), { label: 'Nothing', run: () => {} }]) },
  ];
}
