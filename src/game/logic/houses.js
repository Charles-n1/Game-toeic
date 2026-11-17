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
import { healFully, restoreMana } from './player';
import { buildGuildHall } from './guildHall';
import { talkTo } from './people';
import { frontTile } from './input';
import { offerTournament } from './isekai/arena';
import { isCursed, offerRite } from './isekai/curses';
import { repairAllGear, repairCostOf, needsRepair } from './durability';
import { studyLanguageChoices, gainLanguage } from './languages';
import { changeKingdomRep } from './kingdomLaws';
import { addHappiness } from './village';

// Entering other villagers' and NPCs' houses: dining room, bathroom/toilets, and 1 or 2 bedrooms depending on family.


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
    { kind: 'flowerPot', variant: 1, x: x + 1, y: y + 12, w: 1, h: 1, walkable: true },
    { kind: 'furniture', look: 'lamp', color: '#ffd23f', x: x + 9, y: y + 2, w: 1, h: 1 },
    { kind: 'furniture', look: 'rug', color: '#5a7fc4', x: x + 4, y: y + 7, w: 2, h: 1, walkable: true },
    { kind: 'furniture', look: 'rug', color: '#b8303a', x: x + 4, y: y + 12, w: 2, h: 1, walkable: true },
    { kind: 'furniture', look: 'rug', color: '#c9961e', x: x + 13, y: y + 11, w: 2, h: 1, walkable: true },
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

const SPECIAL_ROLES = new Set(['arena', 'church', 'clinic', 'forge', 'smithy', 'barracks', 'inn', 'library']);

const SPECIAL_NOTIFY = {
  arena: (t) => '⚔️ ' + t + ': step onto the sand pit or speak with the Arena Master.',
  church: (t) => '⛪ ' + t + ': speak with the Priestess for a blessing or curse rite.',
  clinic: (t) => '🩺 ' + t + ': clean infirmary beds and herbal remedies await.',
  forge: (t) => '⚒️ ' + t + ': roaring furnaces warm the room and Master Smiths mend steel.',
  smithy: (t) => '⚒️ ' + t + ': roaring furnaces warm the room and Master Smiths mend steel.',
  barracks: (t) => '🛡️ ' + t + ': training dummies and tactical tables of the watch.',
  inn: (t) => '🍺 ' + t + ': warm hearth, hot meals and soft beds for travelers.',
  library: (t) => '📜 ' + t + ': ancient tomes and scholars teaching world languages.',
};

/** Finalizes an interior room layout with walls, exit mat, base washroom props, and doorway coordinates. */
function finalizeHall(house, inside, floorTile, props, patrons, opts = {}) {
  const { x, y, w, h } = inside;
  fillRect(x, y, w, h, TILE.WALL);
  fillRect(x + 1, y + 2, w - 2, h - 3, floorTile);
  if (opts.sandPit) fillRect(opts.sandPit.x, opts.sandPit.y, opts.sandPit.w, opts.sandPit.h, TILE.SAND);
  if (!props.some((p) => p.kind === 'toilet')) props.push({ kind: 'toilet', x: x + 19, y: y + 2, w: 1, h: 1, fixed: true });
  if (!props.some((p) => p.kind === 'basin')) props.push({ kind: 'basin', x: x + 17, y: y + 2, w: 1, h: 1, fixed: true });
  const mat = { x: x + 10, y: y + h - 1 };
  setTile(mat.x, mat.y, TILE.STAIRS);
  const door = doorOf(house);
  return {
    house,
    palace: Boolean(opts.palace),
    specialRole: opts.specialRole || null,
    pit: opts.sandPit || null,
    info: { names: patrons.map((p) => p.name) },
    title: opts.title,
    isFamily: false,
    props,
    patrons,
    mat,
    landing: { x: mat.x + 0.5, y: mat.y - 1 },
    exit: { x: door.x + 0.5, y: door.y + 1.5 },
  };
}

function buildPalaceHall(game, house) {
  const inside = insideOf('visitHouse');
  const { x, y } = inside;
  const village = villageOf(house.village);
  const ruler = NPCS.find((n) => n.rulerOf === village?.kingdom);
  const props = [
    { kind: 'throne', x: x + 10, y: y + 3, w: 2, h: 1, fixed: true },
    { kind: 'furniture', look: 'rug', color: '#8a1c34', x: x + 10, y: y + 5, w: 2, h: 9, walkable: true },
    { kind: 'banner', color: '#e8b83a', x: x + 4, y: y + 2, w: 1, h: 1, walkable: true },
    { kind: 'banner', color: '#e8b83a', x: x + 17, y: y + 2, w: 1, h: 1, walkable: true },
    { kind: 'wallTorch', x: x + 6, y: y + 1, w: 1, h: 1, walkable: true },
    { kind: 'wallTorch', x: x + 15, y: y + 1, w: 1, h: 1, walkable: true },
    { kind: 'window', x: x + 8, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'window', x: x + 12, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'weaponRack', x: x + 2, y: y + 3, w: 2, h: 1 },
    { kind: 'weaponRack', x: x + 18, y: y + 3, w: 2, h: 1 },
    { kind: 'diningTable', x: x + 3, y: y + 8, w: 2, h: 1, fixed: true },
    { kind: 'diningTable', x: x + 17, y: y + 8, w: 2, h: 1, fixed: true },
    { kind: 'flowerPot', variant: 0, x: x + 2, y: y + 13, w: 1, h: 1, walkable: true },
    { kind: 'flowerPot', variant: 2, x: x + 19, y: y + 13, w: 1, h: 1, walkable: true },
  ];
  const guardLook = { skin: '#e8c49a', hair: '#3a3442', style: 'short', eyes: '#3a6fd8', outfit: '#5a667d', trim: '#ffd23f' };
  const patrons = [
    { kind: 'royalGuard', name: 'Royal Guard', look: guardLook, x: x + 7.5, y: y + 5.5, dir: 'right' },
    { kind: 'royalGuard', name: 'Royal Guard', look: guardLook, x: x + 14.5, y: y + 5.5, dir: 'left' },
  ];
  if (ruler && game.npcs?.[ruler.id]?.alive) {
    patrons.push({ kind: 'ruler', npcId: ruler.id, name: ruler.name, look: ruler.look, x: x + 11, y: y + 4.3, dir: 'down' });
  }
  return finalizeHall(house, inside, TILE.FLOOR, props, patrons, { palace: true, title: (village?.name || 'Royal') + ' Throne Room' });
}

function specialHallSpec(role, vName, vid, x, y) {
  const redLook = { skin: '#c99a72', hair: '#2a1d17', style: 'short', eyes: '#3a2416', outfit: '#8a1a1a', trim: '#ffd23f' };
  const goldLook = { skin: '#fde0c8', hair: '#d6b45a', style: 'long', eyes: '#3a6fd8', outfit: '#eef2ff', trim: '#ffd23f' };
  const healLook = { skin: '#f1c9a5', hair: '#8fd0ff', style: 'long', eyes: '#4fb37a', outfit: '#d8f0ff', trim: '#4fb37a' };
  const smithLook = { skin: '#d8a47f', hair: '#8a2a1a', style: 'short', eyes: '#3a2416', outfit: '#5a3a22', trim: '#e08b3a', race: vid === 'capital-frosthold' ? 'dwarf' : 'human' };
  const capLook = { skin: '#f1c9a5', hair: '#4a3222', style: 'short', eyes: '#3a6fd8', outfit: '#2f50a0', trim: '#ffd23f' };
  const innLook = { skin: '#c99a72', hair: '#5a3b22', style: 'short', eyes: '#3a2416', outfit: '#7a4a24', trim: '#f2c14e' };
  const bookLook = { skin: '#fde0c8', hair: '#9aa6b8', style: 'long', eyes: '#4fb37a', outfit: '#4a2f7a', trim: '#c9a8ff' };
  const specs = {
    arena: {
      title: vName + ' Combat Arena',
      floor: TILE.FLOOR,
      sandPit: { x: x + 4, y: y + 4, w: 14, h: 7 },
      props: [
        { kind: 'weaponRack', x: x + 2, y: y + 3, w: 2, h: 1 },
        { kind: 'weaponRack', x: x + 18, y: y + 11, w: 2, h: 1 },
        { kind: 'dummy', x: x + 2, y: y + 6, w: 1, h: 1, fixed: true },
        { kind: 'target', x: x + 19, y: y + 6, w: 1, h: 1, fixed: true },
        { kind: 'banner', color: '#c8102e', x: x + 5, y: y + 2, w: 1, h: 1, walkable: true },
        { kind: 'banner', color: '#ffd23f', x: x + 15, y: y + 2, w: 1, h: 1, walkable: true },
        { kind: 'wallTorch', x: x + 7, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'wallTorch', x: x + 14, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'bench', x: x + 6, y: y + 12, w: 2, h: 1 },
        { kind: 'bench', x: x + 14, y: y + 12, w: 2, h: 1 },
        { kind: 'diningTable', x: x + 2, y: y + 11, w: 2, h: 1, fixed: true },
      ],
      patrons: [
        { kind: 'arenaMaster', name: 'Arena Master', look: redLook, x: x + 9, y: y + 12.6, dir: 'up' },
        { kind: 'spectator', name: 'Roaring Fan', look: innLook, x: x + 6.5, y: y + 12.6, dir: 'up' },
        { kind: 'spectator', name: 'Scout', look: capLook, x: x + 15.5, y: y + 12.6, dir: 'up' },
      ],
    },
    church: {
      title: 'Cathedral of ' + vName,
      floor: TILE.FLOOR,
      props: [
        { kind: 'statue', x: x + 10, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystal', x: x + 8, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystal', x: x + 12, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'furniture', look: 'rug', color: '#8a1c34', x: x + 10, y: y + 5, w: 2, h: 8, walkable: true },
        { kind: 'bench', x: x + 4, y: y + 7, w: 2, h: 1 },
        { kind: 'bench', x: x + 14, y: y + 7, w: 2, h: 1 },
        { kind: 'bench', x: x + 4, y: y + 10, w: 2, h: 1 },
        { kind: 'bench', x: x + 14, y: y + 10, w: 2, h: 1 },
        { kind: 'wallTorch', x: x + 6, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'wallTorch', x: x + 15, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'window', x: x + 8, y: y + 1, w: 2, h: 1, walkable: true },
        { kind: 'window', x: x + 12, y: y + 1, w: 2, h: 1, walkable: true },
        { kind: 'flowerPot', variant: 0, x: x + 2, y: y + 13, w: 1, h: 1, walkable: true },
        { kind: 'diningTable', x: x + 2, y: y + 11, w: 2, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'priest', name: 'High Priestess', look: goldLook, x: x + 10.5, y: y + 4.8, dir: 'down' }],
    },
    clinic: {
      title: vName + ' Infirmary',
      floor: TILE.FLOOR,
      props: [
        { kind: 'bed', x: x + 3, y: y + 3, w: 2, h: 2, fixed: true },
        { kind: 'bed', x: x + 7, y: y + 3, w: 2, h: 2, fixed: true },
        { kind: 'bed', x: x + 11, y: y + 3, w: 2, h: 2, fixed: true },
        { kind: 'stove', x: x + 2, y: y + 9, w: 2, h: 2, fixed: true },
        { kind: 'diningTable', x: x + 5, y: y + 9, w: 2, h: 1, fixed: true },
        { kind: 'storage', x: x + 2, y: y + 12, w: 1, h: 1, fixed: true },
        { kind: 'flowerPot', variant: 1, x: x + 15, y: y + 12, w: 1, h: 1, walkable: true },
        { kind: 'window', x: x + 8, y: y + 1, w: 2, h: 1, walkable: true },
      ],
      patrons: [{ kind: 'healer', name: 'Clinic Healer', look: healLook, x: x + 6.5, y: y + 6.5, dir: 'down' }],
    },
    forge: {
      title: vName + ' Grand Forge',
      floor: TILE.FLOOR,
      props: [
        { kind: 'stove', x: x + 3, y: y + 2, w: 2, h: 2, fixed: true },
        { kind: 'stove', x: x + 6, y: y + 2, w: 2, h: 2, fixed: true },
        { kind: 'weaponRack', x: x + 10, y: y + 3, w: 2, h: 1 },
        { kind: 'weaponRack', x: x + 13, y: y + 3, w: 2, h: 1 },
        { kind: 'barrels', x: x + 2, y: y + 6, w: 1, h: 1, fixed: true },
        { kind: 'crates', x: x + 17, y: y + 8, w: 1, h: 1, fixed: true },
        { kind: 'wallTorch', x: x + 5, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'wallTorch', x: x + 14, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'diningTable', x: x + 3, y: y + 10, w: 2, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'smith', name: 'Master Forger', look: smithLook, x: x + 8.5, y: y + 5.8, dir: 'down' }],
    },
    barracks: {
      title: vName + ' Garrison',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'dummy', x: x + 4, y: y + 4, w: 1, h: 1, fixed: true },
        { kind: 'dummy', x: x + 7, y: y + 4, w: 1, h: 1, fixed: true },
        { kind: 'target', x: x + 11, y: y + 4, w: 1, h: 1, fixed: true },
        { kind: 'weaponRack', x: x + 2, y: y + 8, w: 2, h: 1 },
        { kind: 'bed', x: x + 15, y: y + 7, w: 2, h: 2, fixed: true },
        { kind: 'bed', x: x + 18, y: y + 7, w: 2, h: 2, fixed: true },
        { kind: 'banner', color: '#2f50a0', x: x + 3, y: y + 2, w: 1, h: 1, walkable: true },
        { kind: 'crates', x: x + 15, y: y + 12, w: 1, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 6, y: y + 10, w: 2, h: 1, fixed: true },
      ],
      patrons: [
        { kind: 'captain', name: 'Garrison Captain', look: capLook, x: x + 7.5, y: y + 7.2, dir: 'down' },
        { kind: 'watchman', name: 'Watchman', look: capLook, x: x + 13.5, y: y + 5.5, dir: 'left' },
      ],
    },
    inn: {
      title: vName + ' Tavern & Inn',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'barCounter', x: x + 11, y: y + 4, w: 6, h: 1, fixed: true },
        { kind: 'barrels', x: x + 12, y: y + 2, w: 1, h: 1, fixed: true },
        { kind: 'barrels', x: x + 15, y: y + 2, w: 1, h: 1, fixed: true },
        { kind: 'stove', x: x + 2, y: y + 2, w: 2, h: 2, fixed: true },
        { kind: 'tavernTable', x: x + 4, y: y + 7, w: 2, h: 1, fixed: true },
        { kind: 'tavernTable', x: x + 14, y: y + 9, w: 2, h: 1, fixed: true },
        { kind: 'bed', x: x + 2, y: y + 11, w: 2, h: 2, fixed: true },
        { kind: 'bed', x: x + 5, y: y + 11, w: 2, h: 2, fixed: true },
        { kind: 'wallTorch', x: x + 6, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'diningTable', x: x + 8, y: y + 11, w: 2, h: 1, fixed: true },
      ],
      patrons: [
        { kind: 'innkeeper', name: 'Innkeeper', look: innLook, x: x + 12.5, y: y + 5.5, dir: 'down' },
        { kind: 'traveler', name: 'Traveling Bard', look: bookLook, x: x + 4.5, y: y + 8.3, dir: 'up' },
      ],
    },
    library: {
      title: vName + ' Grand Archives',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'crystal', x: x + 3, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystal', x: x + 14, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'furniture', look: 'rug', color: '#4a2f7a', x: x + 8, y: y + 6, w: 4, h: 4, walkable: true },
        { kind: 'diningTable', x: x + 5, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 13, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'furniture', look: 'chair', color: '#8a5a30', x: x + 5, y: y + 7, w: 1, h: 1 },
        { kind: 'furniture', look: 'chair', color: '#8a5a30', x: x + 13, y: y + 7, w: 1, h: 1 },
        { kind: 'window', x: x + 6, y: y + 1, w: 2, h: 1, walkable: true },
        { kind: 'window', x: x + 11, y: y + 1, w: 2, h: 1, walkable: true },
        { kind: 'flowerPot', variant: 2, x: x + 2, y: y + 13, w: 1, h: 1, walkable: true },
      ],
      patrons: [{ kind: 'archivist', name: 'Head Archivist', look: bookLook, x: x + 9.5, y: y + 5.3, dir: 'down' }],
    },
  };
  return specs[role === 'smithy' ? 'forge' : role];
}

function buildSpecialHall(house) {
  const inside = insideOf('visitHouse');
  const vName = villageOf(house.village)?.name || 'Town';
  const spec = specialHallSpec(house.role, vName, house.village, inside.x, inside.y);
  return finalizeHall(house, inside, spec.floor, spec.props, spec.patrons, {
    specialRole: house.role,
    sandPit: spec.sandPit,
    title: spec.title,
  });
}

function talkToSpecialPatron(game, patron, visit) {
  const vid = visit?.house?.village;
  const kId = villageOf(vid)?.kingdom;
  if (patron.kind === 'arenaMaster') {
    offerTournament(game, vid);
    return;
  }
  if (patron.kind === 'priest') {
    const choices = [
      {
        label: 'Receive Sanctum Blessing (Free · +15 MP & Cure Cold)',
        icon: 'star',
        run: () => {
          restoreMana(game.player, 15);
          cureCold(game, '✨ Sacred warmth melts away your chill.');
          cue(game, 'levelUp');
          notify(game, '✨ Sanctuary Blessing: +15 Mana restored!', '#ffe680');
        },
      },
      {
        label: 'Donate 20 Lexis (+2 Kingdom Rep, +1 Happiness)',
        icon: 'heart',
        run: () => {
          if (game.player.lexis < 20) return say(game, null, ['"Charity begins when your purse holds 20 Lexis."']);
          game.player.lexis -= 20;
          if (kId) changeKingdomRep(game, kId, 2);
          addHappiness(game, 1);
          cue(game, 'coin');
          notify(game, '⛪ Donated 20 Lexis to the sanctuary.', '#ffe680');
        },
      },
    ];
    if (isCursed(game)) {
      choices.unshift({ label: 'Purify Cursed Equipment', icon: 'book', run: () => offerRite(game, 'The altar of the church') });
    }
    choices.push({ label: 'Step back', run: () => {} });
    say(game, null, ['"May the light guard your steps across every border."'], choices);
    return;
  }
  if (patron.kind === 'healer') {
    say(game, null, ['"Sit still — herbs and clean bandages fix most adventurer mistakes."'], [
      {
        label: 'Full Medical Treatment (12 Lexis · Full HP & Cure Cold)',
        icon: 'healthPotion',
        run: () => {
          if (game.player.lexis < 12) return say(game, null, ['"12 Lexis covers the herbs, traveler."']);
          game.player.lexis -= 12;
          healFully(game.player, game);
          game.player.fatigue = Math.max(0, (game.player.fatigue || 0) - 35);
          cureCold(game, '🩺 Herbal poultices cured your cold!');
          cue(game, 'levelUp');
          notify(game, '🩺 Treated at the clinic: Full HP restored!', '#8affb3');
        },
      },
      { label: 'Leave', run: () => {} },
    ]);
    return;
  }
  if (patron.kind === 'smith') {
    const cost = repairCostOf(game);
    const choices = [];
    if (needsRepair(game)) {
      choices.push({
        label: 'Repair All Equipped Gear (' + cost + ' Lexis)',
        icon: 'ironSword',
        run: () => {
          if (game.player.lexis < cost) return say(game, null, ['"Coal and whetstones cost ' + cost + ' Lexis today."']);
          game.player.lexis -= cost;
          repairAllGear(game, false);
        },
      });
    }
    choices.push({ label: 'Just admiring the steel', run: () => {} });
    say(game, null, [needsRepair(game) ? '"Dented edges lose fights! Let me re-temper your kit."' : '"Your steel rings sharp and true today."'], choices);
    return;
  }
  if (patron.kind === 'innkeeper') {
    say(game, null, ['"Welcome in out of the weather! Stew is bubbling and beds are fresh."'], [
      {
        label: 'Warm Stew & Rest (15 Lexis · Hunger, Thirst, HP/MP)',
        icon: 'bread',
        run: () => {
          if (game.player.lexis < 15) return say(game, null, ['"15 Lexis for supper and board, friend."']);
          game.player.lexis -= 15;
          game.player.hunger = Math.min(100, (game.player.hunger || 0) + 55);
          game.player.thirst = Math.min(100, (game.player.thirst || 0) + 55);
          game.player.fatigue = Math.max(0, (game.player.fatigue || 0) - 60);
          healFully(game.player, game);
          cureCold(game, '🍲 Hot stew chased the chill from your bones!');
          notify(game, '🍺 Inn supper & rest restored health and stamina!', '#ffd086');
        },
      },
      { label: 'Just warming up', run: () => {} },
    ]);
    return;
  }
  if (patron.kind === 'archivist') {
    const langChoices = studyLanguageChoices(game, { name: patron.name });
    say(game, null, ['"Every border speaks in its own tongue — runes, elvish, dwarvish, beastkin..."'], [
      ...langChoices,
      {
        label: 'Study Ancient Runes Tome (Free · +2 Runes)',
        icon: 'book',
        run: () => gainLanguage(game, 'runes', 2),
      },
      { label: 'Step back', run: () => {} },
    ]);
    return;
  }
  const lines = {
    spectator: '"Put Obsidian Power behind your strikes when you enter the pit!"',
    captain: '"Keep a Kingdom Pass in your pack and your Guild rank rising."',
    watchman: '"We drill at the dummies every morning so roads stay safe."',
    traveler: '"They say non-human smiths and archivists give discounts when you learn their language."',
  };
  say(game, null, [patron.name + ': ' + (lines[patron.kind] || '"Safe travels, hero."')]);
}

export function enterVisitedHouse(game, house, travelFn) {
  const visit =
    house.role === 'guild'
      ? buildGuildHall(game, house)
      : house.role === 'palace'
        ? buildPalaceHall(game, house)
        : SPECIAL_ROLES.has(house.role)
          ? buildSpecialHall(house)
          : buildVisitedHouse(game, house);
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
  if (visit.palace) {
    notify(game, '👑 ' + visit.title + ': speak with the sovereign on the dais.', '#ffd86b');
    return;
  }
  if (visit.specialRole && SPECIAL_NOTIFY[visit.specialRole]) {
    notify(game, SPECIAL_NOTIFY[visit.specialRole](visit.title), '#ffd86b');
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
      when: () => inVisit && (visit?.palace || visit?.specialRole) && Array.isArray(visit.patrons) && visit.patrons.some((p) => Math.hypot(p.x - game.player.x, p.y - game.player.y) < 1.8),
      icon: 'talk',
      run: () => {
        const p = visit.patrons.find((pat) => Math.hypot(pat.x - game.player.x, pat.y - game.player.y) < 1.8);
        if (p?.npcId) talkTo(game, NPCS.find((n) => n.id === p.npcId));
        else if (visit.specialRole && p) talkToSpecialPatron(game, p, visit);
        else if (p) say(game, null, [p.name + ': "Stand tall before the throne, traveler."']);
      },
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'throne'),
      icon: 'crown',
      run: () => {
        const vName = villageOf(visit?.house?.village)?.name || 'the realm';
        say(game, null, ['A gilded royal throne overlooking the banner hall of ' + vName + '.']);
      },
    },
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
        const isInn = visit?.house?.role === 'inn';
        if (mood < 35 && !isInn) {
          say(game, null, ['The owners do not trust you enough to let you nap in their bedroom.']);
          return;
        }
        const fee = isInn || (mood < 55 && vid !== 'lexia') ? 10 : 0;
        say(game, null, [visit?.isFamily ? 'One of the family bedrooms.' : 'A tidy bedroom.'], [
          {
            label: fee > 0 ? 'Rent bed & nap (4h, ' + fee + ' Lexis)' : 'Take a short nap (4h, +HP/MP)',
            icon: 'sleep',
            run: () => {
              if (fee > 0 && game.player.lexis < fee) {
                say(game, null, ['A warm bed costs ' + fee + ' Lexis here.']);
                return;
              }
              if (fee > 0) game.player.lexis -= fee;
              passHours(game, 4);
              game.player.fatigue = Math.max(0, (game.player.fatigue || 0) - 55);
              healFully(game.player, game);
              cureCold(game, '😴 Resting inside a warm bedroom cured your cold!');
              notify(game, '💤 Rested indoors: HP, MP & fatigue restored!', '#9fd8ff');
            },
          },
          { label: 'Leave it', run: () => {} },
        ]);
      },
    },
  ];
}
