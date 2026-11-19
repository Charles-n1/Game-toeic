import { ZONES, HOUSES, SEALS, SPAWN, WORLD_SIZE, labelOf, zoneOf, zoneAt } from '../data/zones';
import { npcOf } from '../data/npcs';
import { academyForRole } from '../data/classes';
import { currentChapter } from './chapters';
import { activeQuests, availableSideQuests, ensureUrgentQuests } from './quests';
import { isSealOpen } from './seals';

// The places written on the world map, and the marks of the quests.
// A place: { id, name, kind ('village' | 'dungeon' | 'castle' | 'land'), icon, x, y, text }

const ICON_OF_KIND = { village: 'town', monsterTown: 'dungeon', camp: 'blocked', dungeon: 'dungeon', castle: 'dungeon', land: null };

export const PLACES = ZONES.filter((zone) => zone.kind !== 'inside').map((zone) => ({
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
// Inside a dungeon: the dungeon. Inside the home: Eldermoor.
export function placeHere(game) {
  const zone = zoneAt(game.player.x, game.player.y);
  if (zone.kind === 'inside') {
    if (zone.id === 'visitHouse' && game.run?.visitHouse?.house?.village) return placeOf(game.run.visitHouse.house.village);
    return placeOf(zone.dungeon || 'lexia');
  }
  return placeOf(zone.id);
}

// Where a person is right now: { x, y }.
function personPosition(game, npcId) {
  const place = game.run.people[npcId];
  const isOnIsland = place && place.y < WORLD_SIZE && place.x > 0;
  return isOnIsland ? { x: place.x, y: place.y } : { x: npcOf(npcId).x || SPAWN.x, y: npcOf(npcId).y || SPAWN.y };
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

// The blue diamonds: active + available side quests.
export function sideQuestMarks(game) {
  const active = activeQuests(game);
  const avail = availableSideQuests(game);
  const combined = [...active, ...avail.filter((a) => !active.some((q) => q.id === a.id))];
  return combined.map((quest) => ({ title: quest.title, text: quest.ask, active: Boolean(game.quests?.[quest.id]), ...personPosition(game, quest.giver) }));
}

export function urgentQuestMarks(game) {
  const list = ensureUrgentQuests(game).filter((u) => !u.done);
  return list.slice(0, 2).map((uq, i) => {
    const v = PLACES.find((p) => p.kind === 'village') || { x: SPAWN.x, y: SPAWN.y };
    return { id: uq.id, title: uq.title, text: uq.ask, x: v.x + (i === 0 ? -4 : 4), y: v.y - 2 };
  });
}

// Custom player map beacons (balises).
export const BEACON_COLORS = ['#ff4d6d', '#3a86ff', '#2ec4b6', '#ffbe0b', '#b565ff'];

export function listBeacons(game) {
  if (!Array.isArray(game.beacons)) game.beacons = [];
  return game.beacons;
}

export function addMapBeacon(game, x, y, label, color) {
  const beacons = listBeacons(game);
  if (beacons.length >= 16) beacons.shift();
  const beacon = {
    id: 'b-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    x: Math.max(2, Math.min(WORLD_SIZE - 2, Math.round(x * 10) / 10)),
    y: Math.max(2, Math.min(WORLD_SIZE - 2, Math.round(y * 10) / 10)),
    label: (label || 'Balise #' + (beacons.length + 1)).slice(0, 28),
    color: color || BEACON_COLORS[beacons.length % BEACON_COLORS.length],
  };
  beacons.push(beacon);
  return beacon;
}

export function removeMapBeacon(game, id) {
  const beacons = listBeacons(game);
  game.beacons = beacons.filter((b) => b.id !== id);
  return game.beacons;
}

export function togglePlaceBeacon(game, place) {
  if (!place || !Number.isFinite(place.x) || !Number.isFinite(place.y)) return null;
  const beacons = listBeacons(game);
  const near = beacons.find((b) => Math.hypot(b.x - place.x, b.y - place.y) < 12);
  if (near) {
    removeMapBeacon(game, near.id);
    return null;
  }
  return addMapBeacon(game, place.x, place.y, place.name || 'Balise');
}

// The shops and the inn, at their doors: [{ icon: 'shop' | 'inn', x, y }]
const SIGN_TO_ICON = { healthPotion: 'shop', ironSword: 'shop', bread: 'shop', map1: 'shop', mug: 'inn', potion: 'shop', guild: 'shop', cloth: 'shop', logs: 'shop' };
const SHOP_ROLES = new Set(['potions', 'armory', 'arcane', 'market', 'bakery', 'weaver', 'carpenter', 'clinic', 'forge', 'smithy', 'inn', 'guild']);

export const SHOP_MARKS = HOUSES.filter((house) => SIGN_TO_ICON[house.sign] || SHOP_ROLES.has(house.role)).map((house) => ({
  icon: house.role === 'inn' ? 'inn' : SIGN_TO_ICON[house.sign] || 'shop',
  x: house.x + house.w / 2,
  y: house.y + house.h,
}));

export const ACADEMY_MARKS = HOUSES.filter((house) => Boolean(academyForRole(house.role))).map((house) => ({
  icon: 'star',
  role: house.role,
  title: academyForRole(house.role).title,
  x: house.x + house.w / 2,
  y: house.y + house.h,
}));

// The closed seals (the red crosses: blocked paths).
export function blockedMarks(game) {
  return SEALS.filter((seal) => !isSealOpen(game, seal)).map((seal) => ({ x: seal.x + seal.w / 2, y: seal.y + 1 }));
}
