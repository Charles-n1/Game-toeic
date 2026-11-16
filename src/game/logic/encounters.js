import { NPCS, npcOf } from '../data/npcs';
import { zoneAt } from '../data/zones';
import { isSolid } from '../world/map';
import { pickRandom } from '../../logic/random';
import { isNight } from './clock';
import { say } from './messages';
import { emote } from './emotes';

// From time to time, someone crosses the hero's road in the wild: an adventurer, a druid, a necromancer...
// They are not in a village: the hero meets them only like this (they are `wanderer` in data/npcs.js).
// Once met, the fighters wait at the Guild of Eldermoor, to be hired.
// game.run.encounter: { npcId, until } (until: the time they leave).

const CHECK_EVERY = 45; // seconds between two chances to meet someone
const CHANCE = 0.25;
const STAY = 75000; // milliseconds they stay on the road

function candidates(game) {
  const zone = zoneAt(game.player.x, game.player.y);
  return NPCS.filter((npc) => {
    const state = game.npcs[npc.id];
    const isTime = npc.nightOnly ? isNight(game) : !isNight(game);
    const isPlace = !npc.lands || npc.lands.includes(zone.id);
    return npc.wanderer && state.alive && !game.player.party.includes(npc.id) && isTime && isPlace;
  });
}

// A free tile at 4 to 6 tiles from the hero (null if none was found).
function arrivalPlace(game) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const far = 4 + Math.random() * 2;
    const x = game.player.x + Math.cos(angle) * far;
    const y = game.player.y + Math.sin(angle) * far;
    if (!isSolid(x, y) && zoneAt(x, y).kind === 'land') return { x: x, y: y };
  }
  return null;
}

export function isEncountered(game, npcId) {
  return game.run.encounter !== null && game.run.encounter.npcId === npcId;
}

function meet(game, npc, place) {
  const person = game.run.people[npc.id];
  person.x = place.x;
  person.y = place.y;
  game.run.encounter = { npcId: npc.id, until: Date.now() + STAY };
  emote(game, npc.id, '!');
  const isFirst = !game.npcs[npc.id].met;
  game.npcs[npc.id].met = true;
  const lines = [isFirst ? npc.meet || pickRandom(npc.hello) : pickRandom(npc.hello)];
  if (isFirst && npc.fighter) lines.push('(' + npc.name + ' can now be hired at the Guild of Eldermoor.)');
  say(game, npc.id, lines);
}

// Called every frame: a new meeting sometimes, and the one on the road leaves after a while.
export function updateEncounters(game, dt) {
  const encounter = game.run.encounter;
  if (encounter && Date.now() > encounter.until) game.run.encounter = null;
  game.run.encounterTime -= dt;
  if (game.run.encounterTime > 0 || game.run.encounter || game.run.fight) return;
  game.run.encounterTime = CHECK_EVERY;
  const zone = zoneAt(game.player.x, game.player.y);
  if (zone.kind !== 'land' || Math.random() > CHANCE) return;
  const list = candidates(game);
  const place = arrivalPlace(game);
  if (list.length > 0 && place) meet(game, pickRandom(list), place);
}

export { npcOf };
