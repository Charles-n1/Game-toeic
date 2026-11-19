import { insideOf, doorOf } from '../../data/zones';
import { TILE } from '../../world/tileKinds';
import { setTile, fillRect } from '../../world/grid';
import { makeHouseResidents, residentsForHouse } from './residents';

// The inside of a house the hero visits: a dining room, a washroom and carpeted bedrooms on the ground floor,
// and an upstairs floor. (Entering the houses: logic/houses.js.)

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

export function buildVisitedHouse(game, house) {
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
