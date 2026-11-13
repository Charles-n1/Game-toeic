import { ZONES, HOUSES, SEALS, labelOf, zoneOf, zoneAt } from '../data/zones';
import { npcOf } from '../data/npcs';
import { currentChapter } from './chapters';
import { activeQuests } from './quests';
import { isSealOpen } from './seals';

// The places written on the world map, and the marks of the quests.
// A place: { id, name, kind ('village' | 'dungeon' | 'castle' | 'land'), icon, x, y, text }

const ICON_OF_KIND = { village: 'town', dungeon: 'dungeon', castle: 'dungeon', land: null };

export const PLACES = ZONES.map((zone) => ({
  id: zone.id,
  name: zone.name,
  kind: zone.kind,
  icon: ICON_OF_KIND[zone.kind],
  text: zone.text,
  ...labelOf(zone),
}));

export function placeOf(id) {
  return PLACES.find((place) => place.id === id);
}

// The place where the player stands (to show it first on the map).
export function placeHere(game) {
  return placeOf(zoneAt(game.player.x, game.player.y).id);
}

// Where a person is right now: { x, y }.
function personPosition(game, npcId) {
  const place = game.run.people[npcId];
  return place ? { x: place.x, y: place.y } : { x: npcOf(npcId).x, y: npcOf(npcId).y };
}

// target: { zone: 'crypt' } or { npc: 'aria' } -> { x, y }
function positionOf(game, target) {
  if (target.npc) return personPosition(game, target.npc);
  return labelOf(zoneOf(target.zone));
}

// The gold diamond: where the story goes now. null = no chapter left.
export function mainQuestMark(game) {
  const chapter = currentChapter(game);
  if (!chapter || !chapter.place) return null;
  return { title: chapter.title, text: chapter.text, ...positionOf(game, chapter.place) };
}

// The blue diamonds: the people waiting for a side quest.
export function sideQuestMarks(game) {
  return activeQuests(game).map((quest) => ({ title: quest.title, text: quest.ask, ...personPosition(game, quest.giver) }));
}

// The shops and the inn, at their doors: [{ icon: 'shop' | 'inn', x, y }]
const SIGN_TO_ICON = { healthPotion: 'shop', ironSword: 'shop', bread: 'shop', map1: 'shop', mug: 'inn' };

export const SHOP_MARKS = HOUSES.filter((house) => SIGN_TO_ICON[house.sign]).map((house) => ({
  icon: SIGN_TO_ICON[house.sign],
  x: house.x + 1.5,
  y: house.y + 3,
}));

// The closed seals (the red crosses: blocked paths).
export function blockedMarks(game) {
  return SEALS.filter((seal) => !isSealOpen(game, seal)).map((seal) => ({ x: seal.x + seal.w / 2, y: seal.y + 1 }));
}
