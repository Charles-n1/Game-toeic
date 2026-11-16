import { NPCS } from '../data/npcs';
import { insideOf, houseAtDoor, doorOf, villageOf, zoneAt } from '../data/zones';
import { TILE } from '../world/tileKinds';
import { setTile, fillRect } from '../world/grid';
import { bumpMapRevision, propsAround } from '../world/map';
import { randomOf } from '../world/seeded';
import { refreshWorld } from './worldState';
import { say, notify } from './messages';
import { cue } from './cues';
import { cureCold } from './weather';
import { passHours } from './days';
import { healFully } from './player';
import { buildGuildHall } from './guildHall';

// Entering other villagers' and NPCs' houses: dining room, bathroom/toilets, and 1 or 2 bedrooms depending on family.

const FRONT = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function frontTile(player) {
  const [dx, dy] = FRONT[player.dir] || [0, 1];
  return { x: Math.floor(player.x + dx), y: Math.floor(player.y + dy) };
}

function residentsForHouse(game, house, door) {
  const named = NPCS.filter((npc) => npc.at && npc.at[0] === house.village && npc.at[1] === house.role);
  const fam = (game.families || []).find((f) => named.some((n) => f.parents.includes(n.id)));
  const doorMatchX = house.x + Math.floor(house.w / 2) + 0.5;
  const doorMatchY = house.y + house.h + 0.5;
  const villagers = (game.run.villagers || []).filter(
    (v) => v.home && Math.abs(v.home.x - doorMatchX) < 2 && Math.abs(v.home.y - doorMatchY) < 2
  );
  const hasKids = Boolean((fam && fam.children.length > 0) || villagers.some((v) => v.kid));
  const adultCount = Math.max(named.length + (fam && fam.parents.length >= 2 ? 1 : 0), villagers.filter((v) => !v.kid).length);
  const civicOrBig = ['house', 'farm', 'elder', 'inn', 'palace', 'mayor'].includes(house.role) || house.size === 'house' || house.size === 'palace';
  const fallbackFamily = civicOrBig && randomOf('familyHouse:' + door.x + ',' + door.y)() < 0.65;
  const isFamily = hasKids || adultCount >= 2 || (villagers.length === 0 && named.length === 0 && fallbackFamily);

  const label = named.length > 0
    ? named.map((n) => n.name).join(' & ') + "'s House"
    : villagers.length > 0
      ? villagers[0].name + (isFamily ? "'s Family Home" : "'s House")
      : (villageOf(house.village)?.name || 'Village') + ' ' + (house.role === 'inn' ? 'Inn' : house.role === 'clinic' ? 'Clinic' : isFamily ? 'Family House' : 'Cottage');

  return {
    title: label,
    isFamily: isFamily,
    names: [...named.map((n) => n.name), ...villagers.slice(0, 4).map((v) => v.name)],
    hasKids: hasKids || isFamily,
  };
}

// Stamps the 22x16 interior tiles & furniture for either a single-resident (1 bedroom) or family (2 bedrooms) house.
function buildVisitedHouse(game, house) {
  const inside = insideOf('visitHouse');
  const door = doorOf(house);
  const info = residentsForHouse(game, house, door);
  const { x, y, w, h } = inside;

  // 1. Base outer walls + wooden floor across main wings
  fillRect(x, y, w, h, TILE.WALL);
  fillRect(x + 1, y + 2, 10, h - 3, TILE.WOOD_FLOOR); // Dining room / kitchen (left)
  fillRect(x + 12, y + 2, 9, 5, TILE.FLOOR); // Bathroom / toilets (top-right, stone tiles)
  fillRect(x + 12, y + 8, 9, h - 9, TILE.WOOD_FLOOR); // Bedroom wing (bottom-right)

  // Interior walls & doorways separating rooms
  fillRect(x + 11, y + 2, 1, h - 3, TILE.WALL); // main divider wall
  setTile(x + 11, y + 4, TILE.FLOOR); // doorway -> bathroom (toilets)
  setTile(x + 11, y + 10, TILE.WOOD_FLOOR); // doorway -> bedrooms
  setTile(x + 11, y + 11, TILE.WOOD_FLOOR);
  fillRect(x + 12, y + 7, 9, 1, TILE.WALL); // separates bathroom (top-right) from bedrooms (bottom-right)

  const props = [
    // Dining Room (salle a manger)
    { kind: 'stove', x: x + 2, y: y + 1, w: 2, h: 2, fixed: true },
    { kind: 'window', x: x + 5, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'window', x: x + 8, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'diningTable', x: x + 4, y: y + 6, w: 2, h: 1, fixed: true },
    { kind: 'furniture', look: 'chair', color: '#8a5a30', x: x + 3, y: y + 6, w: 1, h: 1 },
    { kind: 'furniture', look: 'chair', color: '#8a5a30', x: x + 6, y: y + 6, w: 1, h: 1 },
    { kind: 'furniture', look: 'plant', color: '#ff6fa8', x: x + 1, y: y + 2, w: 1, h: 1 },
    { kind: 'furniture', look: 'lamp', color: '#ffd23f', x: x + 9, y: y + 2, w: 1, h: 1 },
    { kind: 'furniture', look: 'rug', color: '#5a7fc4', x: x + 4, y: y + 7, w: 2, h: 1, walkable: true },
    { kind: 'furniture', look: 'rug', color: '#b8303a', x: x + 4, y: y + 12, w: 2, h: 1, walkable: true },
    { kind: 'storage', x: x + 1, y: y + 4, w: 1, h: 1, fixed: true },
    // Bathroom / Toilets (toilettes)
    { kind: 'toilet', x: x + 19, y: y + 2, w: 1, h: 1, fixed: true },
    { kind: 'basin', x: x + 14, y: y + 2, w: 1, h: 1, fixed: true },
    { kind: 'window', x: x + 16, y: y + 1, w: 2, h: 1, walkable: true },
  ];

  if (info.isFamily) {
    // Multiple bedrooms: partition wall at x + 16 with connecting doorway
    fillRect(x + 16, y + 8, 1, h - 9, TILE.WALL);
    setTile(x + 16, y + 10, TILE.WOOD_FLOOR);
    // Dining extra chairs for family
    props.push(
      { kind: 'furniture', look: 'chair', color: '#8a5a30', x: x + 4, y: y + 5, w: 1, h: 1 },
      { kind: 'furniture', look: 'chair', color: '#8a5a30', x: x + 5, y: y + 7, w: 1, h: 1 },
      // Master Bedroom (Parents)
      { kind: 'bed', x: x + 13, y: y + 8, w: 2, h: 2, fixed: true },
      { kind: 'wardrobe', x: x + 12, y: y + 13, w: 1, h: 1, fixed: true },
      // Children's Bedroom (2 beds!)
      { kind: 'smallBed', color: '#5a9fd6', x: x + 17, y: y + 8, w: 1, h: 2, fixed: true },
      { kind: 'smallBed', color: '#ff8ca8', x: x + 19, y: y + 8, w: 1, h: 2, fixed: true },
      { kind: 'furniture', look: 'plant', color: '#ff6fa8', x: x + 19, y: y + 13, w: 1, h: 1 }
    );
  } else {
    // Single Bedroom (1 chambre)
    props.push(
      { kind: 'bed', x: x + 17, y: y + 8, w: 2, h: 2, fixed: true },
      { kind: 'wardrobe', x: x + 13, y: y + 8, w: 1, h: 1, fixed: true },
      { kind: 'furniture', look: 'lamp', color: '#ffd23f', x: x + 15, y: y + 8, w: 1, h: 1 },
      { kind: 'furniture', look: 'shelf', color: '#7a4a24', x: x + 19, y: y + 12, w: 1, h: 1 }
    );
  }

  const mat = { x: x + 5, y: y + h - 1 };
  setTile(mat.x, mat.y, TILE.STAIRS);

  return {
    house: house,
    info: info,
    title: info.title,
    isFamily: info.isFamily,
    props: props,
    mat: mat,
    landing: { x: mat.x + 0.5, y: mat.y - 1 },
    exit: { x: door.x + 0.5, y: door.y + 1.5 },
  };
}

export function isInVisitedHouse(game) {
  return zoneAt(game.player.x, game.player.y).id === 'visitHouse';
}

export function visitedHouseTitle(game) {
  return game.run.visitHouse ? game.run.visitHouse.title : 'Village House';
}

export function houseVisitProps(game) {
  return game.run.visitHouse ? game.run.visitHouse.props : [];
}

export function enterVisitedHouse(game, house, travelFn) {
  const visit = house.role === 'guild' ? buildGuildHall(game, house) : buildVisitedHouse(game, house);
  game.run.visitHouse = visit;
  bumpMapRevision();
  refreshWorld(game);
  travelFn(game, visit.landing.x, visit.landing.y);
  game.run.lastLink = visit.mat.x + ',' + (visit.mat.y - 1);
  cue(game, 'step');
  if (visit.guild) {
    notify(game, '🍺 ' + visit.title + ': drinks at the bar, quests on the board.', '#ffd86b');
    return;
  }
  const layout = visit.isFamily ? 'Dining Room, Washroom, Master & Kids Bedrooms' : 'Dining Room, Washroom & 1 Bedroom';
  notify(game, '🏠 ' + visit.title + ' (' + layout + ')', '#ffd86b');
}

export function exitVisitedHouseIfStairs(game, travelFn) {
  const visit = game.run.visitHouse;
  if (!visit) return false;
  const tx = Math.floor(game.player.x);
  const ty = Math.floor(game.player.y);
  if (tx !== visit.mat.x || ty !== visit.mat.y) return false;
  const exit = visit.exit;
  game.run.visitHouse = null;
  bumpMapRevision();
  refreshWorld(game);
  travelFn(game, exit.x, exit.y);
  game.run.lastLink = Math.floor(exit.x) + ',' + Math.floor(exit.y);
  cue(game, 'step');
  return true;
}

export function actionsOfHouses(game, travelFn) {
  const front = frontTile(game.player);
  const doorHouse = zoneAt(game.player.x, game.player.y).kind !== 'inside' ? houseAtDoor(front.x, front.y) : null;
  const inVisit = isInVisitedHouse(game);
  const near = inVisit ? propsAround(game.player.x, game.player.y, 1.8) : [];
  const visit = game.run.visitHouse;

  return [
    {
      when: () => Boolean(doorHouse),
      icon: 'quit',
      run: () => enterVisitedHouse(game, doorHouse, travelFn),
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'toilet'),
      icon: 'water',
      run: () => {
        cue(game, 'coin');
        notify(game, '🚽 Clean village washroom. Fresh water!', '#9fd8ff');
      },
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'basin'),
      icon: 'water',
      run: () => {
        game.player.thirst = Math.min(100, game.player.thirst + 25);
        cue(game, 'coin');
        notify(game, '🚰 Splashed cool water from the basin (+25 Thirst)!', '#9fd8ff');
      },
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'diningTable'),
      icon: 'talk',
      run: () => {
        const who = visit?.info?.names?.length > 0 ? visit.info.names.join(', ') : 'the household';
        say(game, null, [
          'A cozy dining table set for ' + (visit?.isFamily ? 'a whole family (' + who + ')' : who) + '.',
          'Bread crusts and warm bowls rest beside carved wooden chairs.',
        ]);
      },
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'stove'),
      icon: 'fire',
      run: () => {
        if (!cureCold(game, '🔥 The warm hearth chased away your cold!')) {
          notify(game, '🔥 A cheerful kitchen stove keeps the house warm.', '#ffd086');
        }
      },
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'bed' || p.kind === 'smallBed'),
      icon: 'sleep',
      run: () => {
        const vid = visit?.house?.village;
        const mood = vid && game.villages?.[vid]?.mood !== undefined ? game.villages[vid].mood : 50;
        if (mood < 35) {
          say(game, null, ['The owners do not trust you enough to let you nap in their bedroom.']);
          return;
        }
        say(game, null, [visit?.isFamily ? 'One of the family bedrooms.' : 'A tidy bedroom.'], [
          {
            label: 'Take a short nap (4h, +HP/MP)',
            icon: 'sleep',
            run: () => {
              passHours(game, 4);
              healFully(game.player, game);
              cureCold(game, '😴 Resting inside a warm bedroom cured your cold!');
              notify(game, '💤 Rested indoors: HP and MP restored!', '#9fd8ff');
            },
          },
          { label: 'Leave it', run: () => {} },
        ]);
      },
    },
  ];
}
