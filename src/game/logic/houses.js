import { NPCS } from '../data/npcs';
import { HOME_DOOR, insideOf, houseAtDoor, doorOf, villageOf, zoneAt } from '../data/zones';
import { TILE } from '../world/tileKinds';
import { setTile, fillRect } from '../world/grid';
import { bumpMapRevision, isSolid, propsAround, tileAt } from '../world/map';
import { randomOf } from '../world/seeded';
import { refreshWorld } from './worldState';
import { say, notify } from './messages';
import { cue } from './cues';
import { emote } from './emotes';
import { cureCold } from './weather';
import { passHours } from './days';
import { healFully, restoreMana } from './player';
import { buildGuildHall, applyGuildFloor } from './guildHall';
import { talkTo } from './people';
import { facingOf, frontTile } from './input';
import { CLASS_ACADEMIES, academyForRole, classOf } from '../data/classes';
import { canLearnClass, isSkillTrained, rankOfClass } from './classes';
import { typeOf } from '../data/types';
import { offerTournament } from './isekai/arena';
import { isCursed, offerRite } from './isekai/curses';
import { repairAllGear, repairCostOf, needsRepair } from './durability';
import { studyLanguageChoices, gainLanguage } from './languages';
import { changeKingdomRep } from './kingdomLaws';
import { addHappiness } from './village';
import { GODDESS_SHRINES } from '../data/realism';
import { cleanseAndWash, healAtClinicRealism, applySleepQualityRecovery } from './realism/bodyHealth';
import { sharpenWeaponAtForgeOrHome, temperEquipmentAtForge } from './realism/foodAndNature';
import { inspectRepairInvoice, hearBardRumor, listGrimoireChoices, maybeTriggerEarthDream } from './realism/englishWorld';
import { checkPalaceCourtEtiquette, holdChurchMemorialEulogy, prayAtGoddessShrine, orderTavernSpecial } from './realism/socialAndCodex';
import { readLibraryFolklore, readHeroChronicle, playLouisFlashback } from './soul';

// Entering other villagers' and NPCs' houses: dining room, bathroom/toilets, and 1 or 2 bedrooms depending on family.


const RESIDENT_FIRST = ['Clara', 'Bram', 'Nora', 'Toren', 'Lina', 'Ewan', 'Mila', 'Kael', 'Sora', 'Garrick'];
const RESIDENT_KID_NAMES = ['Pip', 'Milo', 'Tilly', 'Bryn', 'Lia', 'Ned'];
const RESIDENT_OUTFITS = ['#4f6d9a', '#8c4b3a', '#4a7a5c', '#6e4e8c', '#9c6e38', '#3e737a'];
const RESIDENT_HAIRS = ['#3a2416', '#8a5a30', '#d6b45a', '#24202c', '#9c422c'];
const RESIDENT_SKINS = ['#fde0c8', '#f1c9a5', '#d8a47f', '#c99a72'];

function makeResidentLook(seedKey, isKid = false) {
  const r = randomOf('houseLook:' + seedKey);
  return {
    skin: RESIDENT_SKINS[Math.floor(r() * RESIDENT_SKINS.length)],
    hair: RESIDENT_HAIRS[Math.floor(r() * RESIDENT_HAIRS.length)],
    style: isKid || r() < 0.5 ? 'short' : 'long',
    eyes: '#3a3240',
    outfit: RESIDENT_OUTFITS[Math.floor(r() * RESIDENT_OUTFITS.length)],
    trim: isKid ? '#ffd87a' : '#e6d3ad',
  };
}

function makeHouseResidents(game, house, door, info, inside, floor = 0) {
  const { x, y } = inside;
  const seed = door.x + ',' + door.y + ',' + floor;
  const rng = randomOf('res:' + seed);
  const night = (game.hour || 12) >= 21 || (game.hour || 12) < 6;
  const residents = [];

  // Prefer named villagers or NPCs from this house first on Floor 0
  const worldAdults = (info.villagers || []).filter((v) => !v.kid);
  const worldKids = (info.villagers || []).filter((v) => v.kid);
  const primaryNamed = info.named?.[0];

  if (floor === 0) {
    const firstAdult = primaryNamed
      ? { npcId: primaryNamed.id, name: primaryNamed.name, look: primaryNamed.look }
      : worldAdults[0]
        ? { name: worldAdults[0].name, look: worldAdults[0].look }
        : { name: RESIDENT_FIRST[Math.floor(rng() * RESIDENT_FIRST.length)], look: makeResidentLook(seed + 'a1') };
    residents.push({
      kind: 'resident',
      npcId: firstAdult.npcId || null,
      name: firstAdult.name,
      look: firstAdult.look,
      x: x + 4.8,
      y: y + 7.4,
      dir: 'right',
      step: 0,
      walking: false,
      activity: night ? 'sleeping' : rng() < 0.5 ? 'eating' : 'drinking',
      actTimer: 4 + rng() * 5,
      homeBed: { x: x + 13.8, y: y + 9.2 },
      diningSpot: { x: x + 4.8, y: y + 7.5 },
      playSpot: { x: x + 6.5, y: y + 10.5 },
    });

    if (info.isFamily || worldAdults.length >= 2 || rng() < 0.55) {
      const partnerSource = worldAdults[1] || info.named?.[1];
      const partner = partnerSource
        ? { npcId: partnerSource.id || null, name: partnerSource.name, look: partnerSource.look }
        : { name: RESIDENT_FIRST[Math.floor(rng() * RESIDENT_FIRST.length)], look: makeResidentLook(seed + 'a2') };
      if (partner.name === firstAdult.name) partner.name += ' II';
      residents.push({
        kind: 'resident',
        npcId: partner.npcId || null,
        name: partner.name,
        look: partner.look,
        partner: true,
        x: x + 15.2,
        y: y + 10.2,
        dir: 'left',
        step: 0,
        walking: false,
        activity: night ? 'romantic' : rng() < 0.45 ? 'eating' : 'idle',
        actTimer: 5 + rng() * 5,
        homeBed: { x: x + (info.isFamily ? 14.3 : 17.5), y: y + 9.2 },
        diningSpot: { x: x + 5.8, y: y + 7.5 },
        playSpot: { x: x + 8.5, y: y + 5.5 },
      });
    }

    if (info.isFamily) {
      const kidSrc = worldKids[0];
      residents.push({
        kind: 'resident',
        kid: true,
        name: kidSrc ? kidSrc.name : RESIDENT_KID_NAMES[Math.floor(rng() * RESIDENT_KID_NAMES.length)],
        look: kidSrc ? kidSrc.look : makeResidentLook(seed + 'k1', true),
        x: x + 18.2,
        y: y + 11.4,
        dir: 'down',
        step: 0,
        walking: false,
        activity: night ? 'sleeping' : 'playing',
        actTimer: 4 + rng() * 4,
        homeBed: { x: x + 17.5, y: y + 9.4 },
        diningSpot: { x: x + 4.4, y: y + 5.2 },
        playSpot: { x: x + 18.4, y: y + 12.2 },
      });
    }
  } else {
    // Floor 1 (Upstairs 2e étage): couple resting/cuddling/reading in upper bedroom + playing kid in loft
    const upA = {
      kind: 'resident',
      partner: true,
      name: RESIDENT_FIRST[Math.floor(rng() * RESIDENT_FIRST.length)],
      look: makeResidentLook(seed + 'u1'),
      x: x + 14.2,
      y: y + 5.2,
      dir: 'right',
      step: 0,
      walking: false,
      activity: rng() < 0.45 ? 'sleeping' : rng() < 0.8 ? 'romantic' : 'idle',
      actTimer: 5 + rng() * 5,
      homeBed: { x: x + 13.8, y: y + 4.3 },
      diningSpot: { x: x + 5.2, y: y + 6.5 },
      playSpot: { x: x + 15.0, y: y + 7.5 },
    };
    const upB = {
      kind: 'resident',
      partner: true,
      name: RESIDENT_FIRST[Math.floor(rng() * RESIDENT_FIRST.length)],
      look: makeResidentLook(seed + 'u2'),
      x: x + 15.1,
      y: y + 5.2,
      dir: 'left',
      step: 0,
      walking: false,
      activity: upA.activity === 'romantic' ? 'romantic' : 'eating',
      actTimer: 5 + rng() * 5,
      homeBed: { x: x + 14.7, y: y + 4.3 },
      diningSpot: { x: x + 6.2, y: y + 6.5 },
      playSpot: { x: x + 15.8, y: y + 7.5 },
    };
    if (upB.name === upA.name) upB.name += ' Lyn';
    residents.push(upA, upB);
    if (info.isFamily) {
      residents.push({
        kind: 'resident',
        kid: true,
        name: RESIDENT_KID_NAMES[Math.floor(rng() * RESIDENT_KID_NAMES.length)],
        look: makeResidentLook(seed + 'uk1', true),
        x: x + 18.2,
        y: y + 10.6,
        dir: 'down',
        step: 0,
        walking: false,
        activity: night ? 'sleeping' : 'playing',
        actTimer: 4 + rng() * 4,
        homeBed: { x: x + 17.5, y: y + 10.2 },
        diningSpot: { x: x + 4.4, y: y + 6.5 },
        playSpot: { x: x + 18.4, y: y + 11.4 },
      });
    }
  }
  return residents;
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
    named: named,
    villagers: villagers,
    names: [...named.map((n) => n.name), ...villagers.slice(0, 4).map((v) => v.name)],
    hasKids: hasKids || isFamily,
  };
}

// Stamps the 22x16 interior tiles & furniture for Ground Floor (0) and Upstairs 2nd Floor (1),
// clearly separating carpeted bedrooms (TILE.RUG) from wooden living/dining rooms & stone washrooms.
function buildVisitedHouseFloor(game, house, info, inside, floor) {
  const { x, y, w, h } = inside;
  if (floor === 1) {
    const props = [
      { kind: 'stairsDown', x: x + 9, y: y + 13, w: 1, h: 1, walkable: true },
      // Upstairs Study & Family Balcony (Left wing)
      { kind: 'window', x: x + 3, y: y + 1, w: 2, h: 1, walkable: true },
      { kind: 'window', x: x + 7, y: y + 1, w: 2, h: 1, walkable: true },
      { kind: 'diningTable', x: x + 5, y: y + 6, w: 2, h: 1, fixed: true },
      { kind: 'furniture', look: 'chair', color: '#8a5a30', x: x + 4, y: y + 6, w: 1, h: 1 },
      { kind: 'furniture', look: 'chair', color: '#8a5a30', x: x + 7, y: y + 6, w: 1, h: 1 },
      { kind: 'storage', x: x + 2, y: y + 3, w: 1, h: 1, fixed: true },
      { kind: 'furniture', look: 'lamp', color: '#ffd23f', x: x + 9, y: y + 2, w: 1, h: 1 },
      { kind: 'flowerPot', variant: 0, x: x + 2, y: y + 12, w: 1, h: 1, walkable: true },
      // Upstairs Washroom (Bottom-right)
      { kind: 'toilet', x: x + 19, y: y + 12, w: 1, h: 1, fixed: true },
      { kind: 'basin', x: x + 17, y: y + 12, w: 1, h: 1, fixed: true },
      // Upstairs Master Bedroom (Top-right, distinct carpet TILE.RUG)
      { kind: 'bed', x: x + 13, y: y + 3, w: 2, h: 2, fixed: true },
      { kind: 'wardrobe', x: x + 19, y: y + 3, w: 1, h: 1, fixed: true },
      { kind: 'furniture', look: 'lamp', color: '#ffbe44', x: x + 16, y: y + 3, w: 1, h: 1 },
      { kind: 'window', x: x + 16, y: y + 1, w: 2, h: 1, walkable: true },
    ];
    if (info.isFamily) {
      props.push(
        { kind: 'smallBed', color: '#6ec4ff', x: x + 13, y: y + 9, w: 1, h: 2, fixed: true },
        { kind: 'smallBed', color: '#ffa3c4', x: x + 17, y: y + 9, w: 1, h: 2, fixed: true }
      );
    }
    return {
      title: info.title + ' (2F · Upstairs)',
      props,
      patrons: makeHouseResidents(game, house, doorOf(house), info, inside, 1),
      paint: () => {
        fillRect(x, y, w, h, TILE.WALL);
        fillRect(x + 1, y + 2, 10, h - 3, TILE.WOOD_FLOOR); // Upstairs study/hallway
        fillRect(x + 12, y + 2, 9, info.isFamily ? 9 : 6, TILE.RUG); // Carpeted Upstairs Bedroom(s)!
        fillRect(x + 12, y + (info.isFamily ? 12 : 9), 9, h - (info.isFamily ? 13 : 10), TILE.FLOOR); // Upstairs washroom
        fillRect(x + 11, y + 2, 1, h - 3, TILE.WALL); // Bedroom wing divider wall
        setTile(x + 11, y + 5, TILE.WOOD_FLOOR);
        setTile(x + 11, y + 12, TILE.FLOOR);
        fillRect(x + 12, y + (info.isFamily ? 11 : 8), 9, 1, TILE.WALL);
        setTile(x + 15, y + (info.isFamily ? 11 : 8), TILE.FLOOR);
      },
    };
  }

  // Floor 0 (Ground Floor)
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
    { kind: 'storage', x: x + 1, y: y + 4, w: 1, h: 1, fixed: true },
    { kind: 'stairsUp', x: x + 9, y: y + 13, w: 1, h: 1, walkable: true },
    // Bathroom / Toilets (toilettes)
    { kind: 'toilet', x: x + 19, y: y + 2, w: 1, h: 1, fixed: true },
    { kind: 'basin', x: x + 14, y: y + 2, w: 1, h: 1, fixed: true },
    { kind: 'window', x: x + 16, y: y + 1, w: 2, h: 1, walkable: true },
  ];

  if (info.isFamily) {
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
    props.push(
      { kind: 'bed', x: x + 17, y: y + 8, w: 2, h: 2, fixed: true },
      { kind: 'wardrobe', x: x + 13, y: y + 8, w: 1, h: 1, fixed: true },
      { kind: 'furniture', look: 'lamp', color: '#ffd23f', x: x + 15, y: y + 8, w: 1, h: 1 },
      { kind: 'furniture', look: 'shelf', color: '#7a4a24', x: x + 19, y: y + 12, w: 1, h: 1 }
    );
  }

  return {
    title: info.title,
    props,
    patrons: makeHouseResidents(game, house, doorOf(house), info, inside, 0),
    paint: () => {
      fillRect(x, y, w, h, TILE.WALL);
      fillRect(x + 1, y + 2, 10, h - 3, TILE.WOOD_FLOOR); // Dining room / kitchen (left)
      fillRect(x + 12, y + 2, 9, 5, TILE.FLOOR); // Bathroom / toilets (top-right, stone tiles)
      fillRect(x + 12, y + 8, 9, h - 9, TILE.RUG); // Bedroom wing (bottom-right, plush carpet distinct from rest!)
      fillRect(x + 11, y + 2, 1, h - 3, TILE.WALL);
      setTile(x + 11, y + 4, TILE.FLOOR);
      setTile(x + 11, y + 10, TILE.RUG);
      setTile(x + 11, y + 11, TILE.RUG);
      fillRect(x + 12, y + 7, 9, 1, TILE.WALL);
      if (info.isFamily) {
        fillRect(x + 16, y + 8, 1, h - 9, TILE.WALL);
        setTile(x + 16, y + 10, TILE.RUG);
      }
    },
  };
}

function buildVisitedHouse(game, house) {
  const inside = insideOf('visitHouse');
  const door = doorOf(house);
  const info = residentsForHouse(game, house, door);
  const { x, y, h } = inside;
  const floor0 = buildVisitedHouseFloor(game, house, info, inside, 0);
  const floor1 = buildVisitedHouseFloor(game, house, info, inside, 1);

  const mat = { x: x + 5, y: y + h - 1 };
  const visit = {
    house: house,
    floor: 0,
    floorData: { 0: floor0, 1: floor1 },
    info: info,
    title: floor0.title,
    isFamily: info.isFamily,
    props: floor0.props,
    patrons: floor0.patrons,
    mat: mat,
    landing: { x: mat.x + 0.5, y: mat.y - 1 },
    exit: { x: door.x + 0.5, y: door.y + 1.5 },
  };
  floor0.paint();
  setTile(mat.x, mat.y, TILE.STAIRS);
  return visit;
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

const SPECIAL_ROLES = new Set([
  'arena', 'church', 'clinic', 'forge', 'smithy', 'barracks', 'inn', 'library',
  'potions', 'armory', 'arcane', 'market', 'bakery', 'weaver', 'carpenter',
  ...CLASS_ACADEMIES.map((a) => a.role),
]);

const SPECIAL_NOTIFY = {
  arena: (t) => '⚔️ ' + t + ': step onto the sand pit or speak with the Arena Master.',
  church: (t) => '⛪ ' + t + ': speak with the Priestess for a blessing or curse rite.',
  clinic: (t) => '🩺 ' + t + ': clean infirmary beds and herbal remedies await (no combat potions sold here).',
  potions: (t) => '🧪 ' + t + ': shelves of healing potions, elixirs and alchemy brews!',
  armory: (t) => '⚔️ ' + t + ': racks of blades, shields, armor and upgrade tools.',
  arcane: (t) => '🔮 ' + t + ': staves, scrolls, charms and enchanted gear.',
  market: (t) => '🧺 ' + t + ': town market supplies, maps, lanterns and tools.',
  bakery: (t) => '🥖 ' + t + ': fresh loaves, warm soup and baking provisions.',
  weaver: (t) => '🧵 ' + t + ': spun cloaks, leather boots and fine fabrics.',
  carpenter: (t) => '🪚 ' + t + ': handcrafted home furniture and timber.',
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
    potions: {
      title: vName + ' House of Potions',
      floor: TILE.FLOOR,
      props: [
        { kind: 'cauldron', x: x + 3, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'cauldron', x: x + 6, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystalLantern', x: x + 10, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 10, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'storage', x: x + 3, y: y + 8, w: 1, h: 1, fixed: true },
        { kind: 'furniture', look: 'shelf', color: '#7a4a24', x: x + 14, y: y + 3, w: 1, h: 1 },
        { kind: 'furniture', look: 'rug', color: '#4f7a58', x: x + 9, y: y + 8, w: 3, h: 2, walkable: true },
        { kind: 'window', x: x + 8, y: y + 1, w: 2, h: 1, walkable: true },
        { kind: 'window', x: x + 13, y: y + 1, w: 2, h: 1, walkable: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'potions', name: 'Elara the Alchemist', look: healLook, x: x + 10.5, y: y + 5.2, dir: 'down' }],
    },
    armory: {
      title: vName + ' Grand Armory',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'weaponRack', x: x + 3, y: y + 3, w: 2, h: 1 },
        { kind: 'weaponRack', x: x + 7, y: y + 3, w: 2, h: 1 },
        { kind: 'weaponRack', x: x + 11, y: y + 3, w: 2, h: 1 },
        { kind: 'dummy', x: x + 16, y: y + 5, w: 1, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 8, y: y + 7, w: 2, h: 1, fixed: true },
        { kind: 'storage', x: x + 3, y: y + 9, w: 1, h: 1, fixed: true },
        { kind: 'banner', color: '#b8303a', x: x + 5, y: y + 2, w: 1, h: 1, walkable: true },
        { kind: 'banner', color: '#8a9ab0', x: x + 14, y: y + 2, w: 1, h: 1, walkable: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'armory', name: 'Quartermaster', look: smithLook, x: x + 8.5, y: y + 5.8, dir: 'down' }],
    },
    arcane: {
      title: vName + ' Arcane Emporium',
      floor: TILE.FLOOR,
      props: [
        { kind: 'crystal', x: x + 4, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystal', x: x + 15, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystalLantern', x: x + 10, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'furniture', look: 'rug', color: '#58388e', x: x + 8, y: y + 6, w: 4, h: 3, walkable: true },
        { kind: 'diningTable', x: x + 9, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'window', x: x + 7, y: y + 1, w: 2, h: 1, walkable: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'arcane', name: 'Arcane Merchant', look: bookLook, x: x + 10.5, y: y + 5.2, dir: 'down' }],
    },
    market: {
      title: vName + ' Market House',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'crates', x: x + 3, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'barrels', x: x + 5, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 9, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'storage', x: x + 15, y: y + 4, w: 1, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'market', name: 'Market Clerk', look: innLook, x: x + 9.5, y: y + 5.2, dir: 'down' }],
    },
    bakery: {
      title: vName + ' Warm Bakery',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'stove', x: x + 3, y: y + 2, w: 2, h: 2, fixed: true },
        { kind: 'stove', x: x + 6, y: y + 2, w: 2, h: 2, fixed: true },
        { kind: 'diningTable', x: x + 10, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'barrels', x: x + 14, y: y + 4, w: 1, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'bakery', name: 'Town Baker', look: innLook, x: x + 10.5, y: y + 5.2, dir: 'down' }],
    },
    weaver: {
      title: vName + ' Weaver & Tailor',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'wardrobe', x: x + 3, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'wardrobe', x: x + 6, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'furniture', look: 'rug', color: '#8a3458', x: x + 8, y: y + 6, w: 4, h: 3, walkable: true },
        { kind: 'diningTable', x: x + 9, y: y + 6, w: 2, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'weaver', name: 'Master Tailor', look: goldLook, x: x + 9.5, y: y + 5.2, dir: 'down' }],
    },
    carpenter: {
      title: vName + ' Carpenter Workshop',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'logs', x: x + 3, y: y + 3, w: 2, h: 1, fixed: true },
        { kind: 'crates', x: x + 6, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 9, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'wardrobe', x: x + 14, y: y + 3, w: 1, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'carpenter', name: 'Master Carpenter', look: smithLook, x: x + 9.5, y: y + 5.2, dir: 'down' }],
    },
  };
  const resolved = role === 'smithy' ? 'forge' : role;
  if (specs[resolved]) return specs[resolved];
  const acad = academyForRole(resolved);
  if (acad) {
    const isCombat = ['academyKnight', 'academyBlade', 'academyShadow', 'academyWilds'].includes(acad.role);
    const props = [
      { kind: isCombat ? 'dummy' : 'crystal', x: x + 4, y: y + 4, w: 1, h: 1, fixed: true },
      { kind: isCombat ? 'weaponRack' : 'crystal', x: x + 15, y: y + 4, w: isCombat ? 2 : 1, h: 1, fixed: true },
      { kind: 'diningTable', x: x + 9, y: y + 6, w: 2, h: 1, fixed: true },
      { kind: 'banner', color: isCombat ? '#b8303a' : '#4a3f9a', x: x + 7, y: y + 2, w: 1, h: 1, walkable: true },
      { kind: 'banner', color: '#ffd23f', x: x + 13, y: y + 2, w: 1, h: 1, walkable: true },
      { kind: 'window', x: x + 8, y: y + 1, w: 2, h: 1, walkable: true },
      { kind: 'window', x: x + 12, y: y + 1, w: 2, h: 1, walkable: true },
      { kind: 'furniture', look: 'rug', color: '#3b4f8c', x: x + 8, y: y + 8, w: 4, h: 3, walkable: true },
    ];
    if (acad.role === 'academyAlchemist') props.push({ kind: 'cauldron', x: x + 7, y: y + 4, w: 1, h: 1, fixed: true });
    return {
      title: vName + ' ' + acad.title,
      floor: isCombat ? TILE.WOOD_FLOOR : TILE.FLOOR,
      props,
      patrons: [
        { kind: 'academyMaster', academyRole: acad.role, name: acad.title + ' Headmaster', look: isCombat ? capLook : bookLook, x: x + 10.5, y: y + 5.2, dir: 'down' },
        { kind: 'resident', name: 'Academy Apprentice', look: makeResidentLook(vid + resolved + 'app'), x: x + 6.5, y: y + 9.2, dir: 'right', activity: 'idle', actTimer: 6, diningSpot: { x: x + 6.5, y: y + 9.2 }, playSpot: { x: x + 9.5, y: y + 9.5 } },
      ],
    };
  }
  return specs.market;
}

function buildSpecialUpperFloor(house, baseTitle, inside) {
  const { x, y, w, h } = inside;
  const props = [
    { kind: 'stairsDown', x: x + 2, y: y + 13, w: 1, h: 1, walkable: true },
    { kind: 'stove', x: x + 2, y: y + 2, w: 2, h: 2, fixed: true },
    { kind: 'diningTable', x: x + 5, y: y + 6, w: 2, h: 1, fixed: true },
    { kind: 'storage', x: x + 2, y: y + 6, w: 1, h: 1, fixed: true },
    { kind: 'bed', x: x + 14, y: y + 3, w: 2, h: 2, fixed: true },
    { kind: 'bed', x: x + 17, y: y + 3, w: 2, h: 2, fixed: true },
    { kind: 'wardrobe', x: x + 19, y: y + 7, w: 1, h: 1, fixed: true },
    { kind: 'toilet', x: x + 19, y: y + 12, w: 1, h: 1, fixed: true },
    { kind: 'basin', x: x + 17, y: y + 12, w: 1, h: 1, fixed: true },
    { kind: 'window', x: x + 5, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'window', x: x + 14, y: y + 1, w: 2, h: 1, walkable: true },
  ];
  const patrons = makeHouseResidents({ hour: 14 }, house, doorOf(house), { isFamily: false, named: [], villagers: [] }, inside, 1);
  return {
    title: baseTitle + ' (2F · Living Quarters)',
    props,
    patrons,
    paint: () => {
      fillRect(x, y, w, h, TILE.WALL);
      fillRect(x + 1, y + 2, 10, h - 3, TILE.WOOD_FLOOR);
      fillRect(x + 12, y + 2, 9, 7, TILE.RUG); // Distinct carpeted bedroom upstairs!
      fillRect(x + 12, y + 10, 9, h - 11, TILE.FLOOR);
      fillRect(x + 11, y + 2, 1, h - 3, TILE.WALL);
      setTile(x + 11, y + 5, TILE.WOOD_FLOOR);
      fillRect(x + 12, y + 9, 9, 1, TILE.WALL);
      setTile(x + 15, y + 9, TILE.FLOOR);
    },
  };
}

function buildSpecialHall(house) {
  const inside = insideOf('visitHouse');
  const vName = villageOf(house.village)?.name || 'Town';
  const spec = specialHallSpec(house.role, vName, house.village, inside.x, inside.y);
  const floor0Props = [...spec.props, { kind: 'stairsUp', x: inside.x + 2, y: inside.y + 13, w: 1, h: 1, walkable: true }];
  const visit = finalizeHall(house, inside, spec.floor, floor0Props, spec.patrons, {
    specialRole: house.role,
    sandPit: spec.sandPit,
    title: spec.title,
  });
  const floor1 = buildSpecialUpperFloor(house, spec.title, inside);
  visit.floor = 0;
  visit.floorData = {
    0: {
      title: spec.title,
      props: visit.props,
      patrons: visit.patrons,
      paint: () => {
        fillRect(inside.x, inside.y, inside.w, inside.h, TILE.WALL);
        fillRect(inside.x + 1, inside.y + 2, inside.w - 2, inside.h - 3, spec.floor);
        if (spec.sandPit) fillRect(spec.sandPit.x, spec.sandPit.y, spec.sandPit.w, spec.sandPit.h, TILE.SAND);
      },
    },
    1: floor1,
  };
  return visit;
}

function openAcademyMenu(game, patron, visit) {
  const acad = academyForRole(patron.academyRole);
  if (!acad) return;
  const taught = acad.classes.map((id) => classOf(id)).filter(Boolean);
  const choices = taught.map((cls) => {
    const trained = canLearnClass(game, cls);
    const current = game.player.classId === cls.id;
    const req = cls.skills.map((s) => `${typeOf(s).short} (${isSkillTrained(game, s) ? 'Ready' : 'Needs 10+ Normal @ 60%'})`).join(' & ');
    return {
      label: (current ? '✓ ' : trained ? '🎓 Adopt ' : '🔒 ') + cls.name + ' (' + req + ')',
      icon: 'powers',
      run: () => {
        if (current) {
          say(game, null, [`You already walk the path of the ${cls.name} (Rank ${rankOfClass(game, cls)}).`]);
          return;
        }
        if (!trained) {
          say(game, null, [
            `${acad.title}: "To master the ${cls.name}, train both ${cls.skills.map((s) => typeOf(s).short).join(' and ')} to at least 10 Normal answers at 60%+ accuracy!"`,
            'You can practice either skill against our training dummy or in battles.',
          ]);
          return;
        }
        game.player.classId = cls.id;
        emote(game, 'hero', 'sparkle');
        cue(game, 'levelUp');
        notify(game, `🎓 Enlisted at ${acad.title}: You are now a ${cls.name}!`, '#ffd23f');
        say(game, null, [`The Headmaster bows: "Rise, initiate of the ${cls.name}! ${cls.text}"`]);
      },
    };
  });
  choices.push({ label: 'Step back', run: () => {} });
  const vName = villageOf(visit?.house?.village)?.name || 'our academy';
  say(game, null, [`🎓 Welcome to ${vName}'s ${acad.title}!\nChoose a class discipline taught within these halls:`], choices);
}

function talkToSpecialPatron(game, patron, visit) {
  const vid = visit?.house?.village;
  const kId = villageOf(vid)?.kingdom;
  if (patron.kind === 'shopkeeper') {
    game.run.shop = { npcId: patron.npcId || null, kind: patron.shopKind || visit.specialRole || 'market', name: patron.name };
    return;
  }
  if (patron.kind === 'academyMaster') {
    openAcademyMenu(game, patron, visit);
    return;
  }
  if (patron.kind === 'resident') {
    const linesByAct = {
      sleeping: '*Yawns softly under warm blankets in the bedroom...*',
      eating: 'Pull up a chair — the stew from our hearth came out rich today.',
      drinking: 'Cheers! Nothing beats a cool mug at your own dining table.',
      playing: 'Haha! Watch how high we can jump!',
      romantic: '*Blushes and squeezes their partner’s hand warmly* Ah—care to join us for tea downstairs later?',
    };
    const msg = linesByAct[patron.activity] || 'Welcome into our home, traveler! Stairs lead right up to the second floor.';
    say(game, null, [`${patron.name}: "${msg}"`]);
    return;
  }
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
    choices.push({ label: '🕯️ Attend Memorial Service (Eulogy)', icon: 'book', run: () => holdChurchMemorialEulogy(game) });
    choices.push({
      label: '🛐 Pray at Goddess Altar (24h Blessing)',
      icon: 'star',
      run: () =>
        say(
          game,
          null,
          ['Which Goddess Altar will you pray before?'],
          [
            ...GODDESS_SHRINES.map((s) => ({
              label: `${s.icon} ${s.name} (${s.cost}L · ${s.desc})`,
              icon: 'star',
              run: () => prayAtGoddessShrine(game, s.id),
            })),
            { label: 'Step back', run: () => {} },
          ]
        ),
    });
    choices.push({ label: 'Step back', run: () => {} });
    say(game, null, ['"May the light guard your steps across every border."'], choices);
    return;
  }
  if (patron.kind === 'healer') {
    say(game, null, ['"Sit still — herbs and clean bandages fix most adventurer mistakes."'], [
      {
        label: 'Full Medical Treatment (12 Lexis · Cure Wounds, Infection & Cold)',
        icon: 'healthPotion',
        run: () => {
          if (game.player.lexis < 12) return say(game, null, ['"12 Lexis covers the herbs, traveler."']);
          game.player.lexis -= 12;
          healFully(game.player, game);
          game.player.fatigue = Math.max(0, (game.player.fatigue || 0) - 35);
          cureCold(game, '🩺 Herbal poultices cured your cold!');
          const cured = game?.realism ? healAtClinicRealism(game) : [];
          cue(game, 'levelUp');
          notify(game, '🩺 Treated at clinic' + (cured.length > 0 ? ' (cured: ' + cured.join(', ') + ')' : '') + ': Full HP restored!', '#8affb3');
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
      choices.push({
        label: '🧾 Review Itemized Invoice (Check for Billing Errors)',
        icon: 'book',
        run: () => inspectRepairInvoice(game, cost, (finalCost) => {
          if (game.player.lexis < finalCost) return notify(game, 'Need ' + finalCost + ' Lexis.', '#ffb070');
          game.player.lexis -= finalCost;
          repairAllGear(game, false);
        }),
      });
    }
    choices.push({ label: '🗡️ Sharpen Blade on Whetstone (+5% ATK today)', icon: 'ironSword', run: () => sharpenWeaponAtForgeOrHome(game) });
    choices.push({ label: '⚒️ Temper Weapon Quality (+Ore, 15/30L)', icon: 'ore', run: () => temperEquipmentAtForge(game, 'weapon') });
    choices.push({ label: '🛡️ Temper Armor Quality (+Ore, 15/30L)', icon: 'ironSword', run: () => temperEquipmentAtForge(game, 'armor') });
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
          if (game?.realism) applySleepQualityRecovery(game, 'inn');
          notify(game, '🍺 Inn supper & rest restored health and stamina!', '#ffd086');
        },
      },
      {
        label: '🛁 Hot Bath & Scrub (15 Lexis · 100% Clean, +Morale, Cleans Cuts)',
        icon: 'bath',
        run: () => {
          if (game.player.lexis < 15) return say(game, null, ['"Hot water and botanical soap cost 15 Lexis."']);
          game.player.lexis -= 15;
          cleanseAndWash(game, 'innBath');
        },
      },
      {
        label: '🍖 Order Regional Tavern Special (+Morale & Codex Recipe)',
        icon: 'curryStew',
        run: () => orderTavernSpecial(game, kId || 'lexia'),
      },
      { label: 'Just warming up', run: () => {} },
    ]);
    return;
  }
  if (patron.kind === 'archivist') {
    const langChoices = studyLanguageChoices(game, { name: patron.name });
    const grimoires = game?.realism ? listGrimoireChoices(game) : [];
    const loreChoices = [
      { label: '📜 Creation Myth & Realm Customs', icon: 'book', run: () => readLibraryFolklore(game) },
      { label: '📖 Read Hero Legend Chronicle', icon: 'book', run: () => readHeroChronicle(game) },
    ];
    if (game.isekai?.pagesFound >= 3 || game.chapter >= 4) {
      loreChoices.push({ label: '🕳️ Witness Louis’s Memory Flashback', icon: 'crystal', run: () => playLouisFlashback(game) });
    }
    say(game, null, ['"Every border speaks in its own tongue — runes, elvish, dwarvish, beastkin..."'], [
      ...loreChoices,
      ...langChoices,
      ...grimoires,
      {
        label: 'Study Ancient Runes Tome (Free · +2 Runes)',
        icon: 'book',
        run: () => gainLanguage(game, 'runes', 2),
      },
      { label: 'Step back', run: () => {} },
    ]);
    return;
  }
  if (patron.kind === 'traveler') {
    say(game, null, [patron.name + ': "Care for a fresh ballad or trading rumor from the roads?"'], [
      { label: '🎵 Hear Bard Rumor (15 Lexis)', icon: 'powers', run: () => hearBardRumor(game) },
      { label: 'Not now', run: () => {} },
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

export function applyVisitedFloor(game, visit, floor = 0) {
  if (!visit?.floorData?.[floor]) return false;
  if (visit.guild) {
    applyGuildFloor(visit, floor);
  } else {
    const f = visit.floorData[floor];
    visit.floor = floor;
    visit.title = f.title;
    visit.props = f.props;
    visit.patrons = f.patrons;
    f.paint();
    if (visit.mat) setTile(visit.mat.x, visit.mat.y, floor === 0 ? TILE.STAIRS : TILE.WALL);
  }
  bumpMapRevision();
  refreshWorld(game);
  return true;
}

export function enterHeroUpperFloor(game, travelFn) {
  const inside = insideOf('visitHouse');
  const home = insideOf('home');
  const { x, y, w, h } = inside;
  const props = [
    { kind: 'stairsDown', x: x + 10, y: y + 13, w: 1, h: 1, walkable: true },
    { kind: 'bed', x: x + 14, y: y + 3, w: 2, h: 2, fixed: true },
    { kind: 'wardrobe', x: x + 19, y: y + 3, w: 1, h: 1, fixed: true },
    { kind: 'diningTable', x: x + 5, y: y + 6, w: 2, h: 1, fixed: true },
    { kind: 'storage', x: x + 2, y: y + 3, w: 1, h: 1, fixed: true },
    { kind: 'banner', color: '#ffd23f', x: x + 5, y: y + 2, w: 1, h: 1, walkable: true },
    { kind: 'banner', color: '#4a7ec8', x: x + 8, y: y + 2, w: 1, h: 1, walkable: true },
    { kind: 'window', x: x + 6, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'window', x: x + 15, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'toilet', x: x + 19, y: y + 12, w: 1, h: 1, fixed: true },
    { kind: 'basin', x: x + 17, y: y + 12, w: 1, h: 1, fixed: true },
  ];
  const companions = (game.player.party || [])
    .map((id) => NPCS.find((n) => n.id === id))
    .filter(Boolean)
    .slice(0, 2)
    .map((n, idx) => ({
      kind: 'resident',
      npcId: n.id,
      name: n.name,
      look: n.look,
      x: x + 6 + idx * 1.4,
      y: y + 7.4,
      dir: 'down',
      activity: idx === 0 ? 'drinking' : 'idle',
      actTimer: 5,
      diningSpot: { x: x + 5.5 + idx, y: y + 7.4 },
      homeBed: { x: x + 14.2 + idx, y: y + 4.3 },
      playSpot: { x: x + 7.5, y: y + 10 },
    }));
  const visit = {
    heroUpper: true,
    house: { village: 'lexia', role: 'home', x: HOME_DOOR.x - 1, y: HOME_DOOR.y - 2, w: 3, h: 3 },
    floor: 1,
    info: { names: [game.player.name] },
    title: "Hero's House (2F · Trophy Loft & Bedroom)",
    isFamily: false,
    props,
    patrons: companions,
    mat: { x: x + 10, y: y + 13 }, // triggers return to downstairs home
    landing: { x: x + 10.5, y: y + 12.2 },
    exit: { x: home.x + home.w - 2.5, y: home.y + home.h - 2.5 },
  };
  fillRect(x, y, w, h, TILE.WALL);
  fillRect(x + 1, y + 2, 10, h - 3, TILE.WOOD_FLOOR);
  fillRect(x + 12, y + 2, 9, 7, TILE.RUG); // Carpeted bedroom loft
  fillRect(x + 12, y + 10, 9, h - 11, TILE.FLOOR);
  fillRect(x + 11, y + 2, 1, h - 3, TILE.WALL);
  setTile(x + 11, y + 5, TILE.WOOD_FLOOR);
  fillRect(x + 12, y + 9, 9, 1, TILE.WALL);
  setTile(x + 15, y + 9, TILE.FLOOR);

  game.run.visitHouse = visit;
  bumpMapRevision();
  refreshWorld(game);
  travelFn(game, visit.landing.x, visit.landing.y);
  game.run.lastLink = Math.floor(visit.landing.x) + ',' + Math.floor(visit.landing.y);
  cue(game, 'step');
  notify(game, '🏠 Upstairs Loft (2F): bedroom carpet & trophy overlook!', '#ffd86b');
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
    notify(game, '🍺 ' + visit.title + ': drinks at the bar, quests on the board, stairs lead upstairs.', '#ffd86b');
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
  const acad = visit.specialRole ? academyForRole(visit.specialRole) : null;
  if (acad) {
    notify(game, '🎓 ' + visit.title + ': speak with the Headmaster or explore upstairs quarters!', '#ffd86b');
    return;
  }
  const layout = visit.isFamily ? 'Dining Room, Washroom, Carpeted Bedrooms & 2F Upstairs' : 'Dining Room, Washroom, Carpeted Bedroom & 2F Upstairs';
  notify(game, '🏠 ' + visit.title + ' (' + layout + ')', '#ffd86b');
}

function stepResidentInside(p, tx, ty, speed, dt) {
  const far = Math.hypot(tx - p.x, ty - p.y);
  if (far < 0.25) {
    p.walking = false;
    return true;
  }
  p.dir = facingOf(tx - p.x, ty - p.y);
  const step = Math.min(far, speed * dt);
  const nx = p.x + ((tx - p.x) / far) * step;
  const ny = p.y + ((ty - p.y) / far) * step;
  if (!isSolid(nx, p.y)) p.x = nx;
  if (!isSolid(p.x, ny)) p.y = ny;
  p.step = (p.step || 0) + dt * 5;
  p.walking = true;
  return false;
}

// Animates residents living inside any visited house (eating, drinking, playing, sleeping, loving moments).
export function updateHouseResidents(game, dt) {
  const visit = game.run.visitHouse;
  if (!visit || !Array.isArray(visit.patrons) || !isInVisitedHouse(game)) return;
  const night = (game.hour || 12) >= 21 || (game.hour || 12) < 6;
  const residents = visit.patrons.filter((p) => p.kind === 'resident');
  if (residents.length === 0) return;

  for (const r of residents) {
    r.actTimer = (r.actTimer || 0) - dt;
    if (r.actTimer <= 0) {
      r.actTimer = 5 + Math.random() * 6;
      const roll = Math.random();
      if (r.kid) {
        r.activity = night ? 'sleeping' : roll < 0.55 ? 'playing' : roll < 0.8 ? 'eating' : 'drinking';
      } else if (night) {
        r.activity = r.partner && roll < 0.42 ? 'romantic' : roll < 0.82 ? 'sleeping' : 'drinking';
      } else {
        r.activity = roll < 0.28 ? 'eating' : roll < 0.48 ? 'drinking' : roll < 0.68 ? 'idle' : roll < 0.86 ? 'sleeping' : r.partner ? 'romantic' : 'idle';
      }
      r.drinking = r.activity === 'drinking' || r.activity === 'eating';
    }
    const spot =
      r.activity === 'sleeping' || r.activity === 'romantic'
        ? r.homeBed
        : r.activity === 'playing'
          ? r.playSpot
          : r.diningSpot;
    if (spot) {
      stepResidentInside(r, spot.x, spot.y, r.kid ? 1.7 : 1.15, dt);
    }
  }
}

export function exitVisitedHouseIfStairs(game, travelFn) {
  const visit = game.run.visitHouse;
  const tx = Math.floor(game.player.x);
  const ty = Math.floor(game.player.y);
  const hereKey = tx + ',' + ty;

  // Climb from Hero's Home Ground Floor (insideOf('home')) to 2F Loft
  if (!visit && zoneAt(game.player.x, game.player.y).id === 'home') {
    const upStair = propsAround(game.player.x, game.player.y, 1.1).find((p) => p.kind === 'stairsUp' && tx === p.x && ty === p.y);
    if (upStair && game.run.lastLink !== hereKey) {
      enterHeroUpperFloor(game, travelFn);
      return true;
    }
    return false;
  }

  if (!visit) return false;
  if (game.run.lastLink === hereKey) return false;

  // Toggle Floor 0 <-> Floor 1 on interior stair props
  const stairProp = (visit.props || []).find((p) => (p.kind === 'stairsUp' || p.kind === 'stairsDown') && tx === p.x && ty === p.y);
  if (stairProp && !visit.heroUpper && visit.floorData) {
    const nextFloor = stairProp.kind === 'stairsUp' ? 1 : 0;
    applyVisitedFloor(game, visit, nextFloor);
    game.run.lastLink = hereKey;
    cue(game, 'step');
    notify(game, nextFloor === 1 ? '⬆️ ' + visit.title : '⬇️ ' + visit.title, '#ffd86b');
    return true;
  }

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
      when: () => inVisit && Array.isArray(visit?.patrons) && !visit.guild && visit.patrons.some((p) => Math.hypot(p.x - game.player.x, p.y - game.player.y) < 1.8),
      icon: 'talk',
      run: () => {
        const p = visit.patrons.find((pat) => Math.hypot(pat.x - game.player.x, pat.y - game.player.y) < 1.8);
        if (visit?.palace && game?.realism) {
          const court = checkPalaceCourtEtiquette(game);
          if (!court.ok) return say(game, null, [court.reason]);
        }
        if (p?.npcId) talkTo(game, NPCS.find((n) => n.id === p.npcId));
        else if (p && (visit.specialRole || p.kind === 'resident' || p.kind === 'shopkeeper' || p.kind === 'academyMaster')) talkToSpecialPatron(game, p, visit);
        else if (p) say(game, null, [p.name + ': "Stand tall before the throne, traveler."']);
      },
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'stairsUp' || p.kind === 'stairsDown'),
      icon: 'step',
      run: () => {
        const stair = near.find((p) => p.kind === 'stairsUp' || p.kind === 'stairsDown');
        if (!stair) return;
        if (visit.heroUpper && stair.kind === 'stairsDown') {
          const exit = visit.exit;
          game.run.visitHouse = null;
          bumpMapRevision();
          refreshWorld(game);
          travelFn(game, exit.x, exit.y);
          game.run.lastLink = Math.floor(exit.x) + ',' + Math.floor(exit.y);
          cue(game, 'step');
          return;
        }
        if (visit?.floorData) {
          const nextFloor = stair.kind === 'stairsUp' ? 1 : 0;
          applyVisitedFloor(game, visit, nextFloor);
          travelFn(game, stair.x + 0.5, stair.y + 0.5);
          game.run.lastLink = stair.x + ',' + stair.y;
          cue(game, 'step');
          notify(game, nextFloor === 1 ? '⬆️ ' + visit.title : '⬇️ ' + visit.title, '#ffd86b');
        }
      },
    },
    {
      when: () => zoneAt(game.player.x, game.player.y).id === 'home' && propsAround(game.player.x, game.player.y, 1.8).some((p) => p.kind === 'stairsUp'),
      icon: 'step',
      run: () => enterHeroUpperFloor(game, travelFn),
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
        if (mood < 35 && !isInn && !visit.heroUpper) {
          say(game, null, ['The owners do not trust you enough to let you nap in their bedroom.']);
          return;
        }
        const fee = isInn || (mood < 55 && vid !== 'lexia' && !visit.heroUpper) ? 10 : 0;
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
              if (game?.realism) {
                applySleepQualityRecovery(game, isInn ? 'inn' : 'home');
                if (isInn) maybeTriggerEarthDream(game);
              }
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
