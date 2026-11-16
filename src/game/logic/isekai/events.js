import { EVENTS, EVENT_CHANCE, FIRST_EVENT_DAY, STAMPEDE_GOAL, STAMPEDE_REWARD, BLOOD_MOON_MONSTERS, BLOOD_MOON_LEXIS } from '../../data/isekai';
import { isSolid } from '../../world/map';
import { isNight, SUNRISE } from '../clock';
import { isOutdoors } from '../weather';
import { addItem, earnLexis, gainXp } from '../player';
import { say, notify } from '../messages';
import { burst, floatText } from '../particles';
import { cue } from '../cues';
import { pickRandom } from '../../../logic/random';

// The events of the world (EVENTS in data/isekai.js): some mornings, something starts, until the next sunrise.
//   bloodMoon: at night, more monsters, and each one is worth twice the Lexis.
//   stampede: an emergency quest of the Guild: defeat STAMPEDE_GOAL monsters before the next sunrise.
//   starNight: at night, stars fall around the hero; a fallen star leaves a Star Shard to pick up.
// game.isekai.event: { id, kills, until } (until: in hours of the game, from day 1). game.run.fallenStars: [{ x, y, at }].

const STAMPEDE_CROWD = 1.5; // the wild monsters are this many times more during a stampede
const STAR_EVERY = [18, 40]; // seconds between two stars falling near the hero
const STAR_RANGE = 7; // tiles around the hero
const STAR_PICK_RANGE = 1.3;
const STAR_XP = 15;

function hoursNow(game) {
  return game.day * 24 + game.hour;
}

// The event happening now (null = none).
export function currentEvent(game) {
  const event = game.isekai.event;
  return event && hoursNow(game) < event.until ? event : null;
}

function isEvent(game, id) {
  return currentEvent(game)?.id === id;
}

// Called about once per second: at sunrise, sometimes an event starts (never two days in a row).
export function rollEventAtSunrise(game) {
  const state = game.isekai;
  if (game.hour < SUNRISE || state.rolledDay === game.day) return;
  state.rolledDay = game.day;
  if (game.day < FIRST_EVENT_DAY || currentEvent(game) || state.lastEventDay === game.day - 1 || Math.random() >= EVENT_CHANCE) return;
  const id = pickRandom(Object.keys(EVENTS));
  state.event = { id: id, kills: 0, until: (game.day + 1) * 24 + SUNRISE };
  state.lastEventDay = game.day;
  cue(game, 'thunder');
  notify(game, EVENTS[id].starts.replace('{goal}', STAMPEDE_GOAL).replace('{reward}', STAMPEDE_REWARD), '#ffd23f');
}

// "🌕 Blood Moon": for the HUD (null = no event).
export function eventTitle(game) {
  const event = currentEvent(game);
  if (!event) return null;
  const title = EVENTS[event.id].icon + ' ' + EVENTS[event.id].name;
  return event.id === 'stampede' && event.kills < STAMPEDE_GOAL ? title + ' ' + event.kills + '/' + STAMPEDE_GOAL : title;
}

// ---------- Blood Moon and Stampede: the monsters ----------

export function isBloodMoonNight(game) {
  return isEvent(game, 'bloodMoon') && isNight(game);
}

// How many times more wild monsters there are right now (see logic/monsters.js).
export function monsterCrowd(game) {
  if (isBloodMoonNight(game)) return BLOOD_MOON_MONSTERS;
  return isEvent(game, 'stampede') ? STAMPEDE_CROWD : 1;
}

// What the Lexis of a monster are multiplied by right now (see logic/loot.js).
export function lexisBonus(game) {
  return isBloodMoonNight(game) ? BLOOD_MOON_LEXIS : 1;
}

// A monster died: it counts for the emergency quest of the Guild.
export function countEventKill(game) {
  const event = currentEvent(game);
  if (!event || event.id !== 'stampede' || event.kills >= STAMPEDE_GOAL) return;
  event.kills += 1;
  if (event.kills < STAMPEDE_GOAL) {
    notify(game, '🐗 Stampede: ' + event.kills + '/' + STAMPEDE_GOAL, '#ffd23f');
    return;
  }
  earnLexis(game, STAMPEDE_REWARD);
  cue(game, 'levelUp');
  say(game, null, ['A messenger of the Guild runs to you, out of breath.', '"The stampede is broken! The Guild pays its debts: ' + STAMPEDE_REWARD + ' Lexis."']);
}

// ---------- Night of Falling Stars ----------

function dropStar(game) {
  const player = game.player;
  for (let tries = 0; tries < 8; tries++) {
    const x = player.x + (Math.random() - 0.5) * STAR_RANGE * 2;
    const y = player.y + (Math.random() - 0.5) * STAR_RANGE * 2;
    if (isSolid(x, y)) continue;
    game.run.fallenStars.push({ x: x, y: y, at: Date.now() });
    return;
  }
}

function starNear(game) {
  return game.run.fallenStars.find((star) => Math.hypot(star.x - game.player.x, star.y - game.player.y) < STAR_PICK_RANGE) || null;
}

function pickStar(game, star) {
  game.run.fallenStars = game.run.fallenStars.filter((item) => item !== star);
  addItem(game.player, 'starShard');
  gainXp(game, STAR_XP);
  cue(game, 'coin');
  burst(game, star.x, star.y, '#fff6b0', 18);
  floatText(game, star.x, star.y - 0.6, '+1 Star Shard', '#fff6b0');
}

// Every frame: on the night of the stars, under the sky, a star falls from time to time. At sunrise they fade.
export function updateEvents(game, dt) {
  if (!isEvent(game, 'starNight')) game.run.fallenStars = [];
  if (!isEvent(game, 'starNight') || !isNight(game) || !isOutdoors(game)) return;
  game.run.starTime -= dt;
  if (game.run.starTime > 0) return;
  game.run.starTime = STAR_EVERY[0] + Math.random() * (STAR_EVERY[1] - STAR_EVERY[0]);
  dropStar(game);
}

export function actionsOfEvents(game) {
  const star = starNear(game);
  return [{ when: () => star !== null, icon: 'starShard', run: () => pickStar(game, star) }];
}

// Is the night of the stars happening now (for the sky, see draw/weather.js)?
export function isStarNight(game) {
  return isEvent(game, 'starNight') && isNight(game);
}
