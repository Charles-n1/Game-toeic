import { ITEMS } from '../../data/items';
import { houseAtDoor } from '../../data/zones';
import { CURSE_HP_PER_HOUR, CURSED_DROP_CHANCE, CURSED_DROPPERS, CURSED_ITEMS, RITE_GOOD_ANSWERS } from '../../data/isekai';
import { addItem, equipFromBag } from '../player';
import { frontTile } from '../input';
import { startFight } from '../fight';
import { makeDuel } from '../duels';
import { say, notify } from '../messages';
import { burst } from '../particles';
import { cue } from '../cues';
import { emote } from '../emotes';
import { pickRandom } from '../../../logic/random';
import { structureNear } from './common';

// The curses. Some monsters leave a cursed thing: it looks like a treasure (good stats).
// Worn, it can not be taken off, and it drinks the health of the hero, hour after hour (never to death).
// A rite of words lifts the curse: at a shrine of the goddess, or at the door of a church. The thing stays,
// with all its power, and it can be taken off again.
// game.isekai.curse: the id of the cursed thing worn (null = none). game.isekai.purified: the ones already freed.

const SHRINE_RANGE = 2.6;

function isCursedItem(game, itemId) {
  return Boolean(ITEMS[itemId]?.cursed) && !game.isekai.purified.includes(itemId);
}

export function isCursed(game) {
  return game.isekai.curse !== null;
}

// Is this piece of equipment stuck on the hero? (The cursed thing worn.)
export function isStuck(game, itemId) {
  return isCursed(game) && game.isekai.curse === itemId;
}

function putCurseOn(game, itemId) {
  game.isekai.curse = itemId;
  cue(game, 'hit');
  burst(game, game.player.x, game.player.y - 0.8, '#8a3cff', 20);
  emote(game, 'hero', '!');
  say(game, null, [
    'The ' + ITEMS[itemId].name + ' tightens. Cold, then burning. You try to take it off: it does not move.',
    'A CURSE. It drinks your life, a little every hour. A rite of words can lift it: at a shrine of the goddess, or at a church.',
  ]);
}

// The hero wants to wear something of the bag. The cursed thing worn does not come off.
export function wear(game, itemId) {
  const worn = game.player[ITEMS[itemId]?.kind];
  if (isStuck(game, worn)) {
    emote(game, 'hero', 'sweat');
    notify(game, '💀 The ' + ITEMS[worn].name + ' will not come off! Lift the curse first (a goddess shrine or a church).', '#c78bff');
    return false;
  }
  if (!equipFromBag(game.player, itemId)) return false;
  if (isCursedItem(game, itemId)) putCurseOn(game, itemId);
  return true;
}

// Time passes: the curse drinks the health of the hero (never below 1 HP). hours: of the game.
export function drainCurse(game, hours) {
  if (!isCursed(game)) return;
  game.isekai.curseLoss += CURSE_HP_PER_HOUR * hours;
  const loss = Math.floor(game.isekai.curseLoss);
  if (loss < 1) return;
  game.isekai.curseLoss -= loss;
  game.player.health = Math.max(1, Math.round(game.player.health) - loss);
}

// A monster died: the ones of CURSED_DROPPERS sometimes leave a cursed thing (it looks precious).
export function dropCursedThing(game, monster) {
  if (!CURSED_DROPPERS.includes(monster.species) || Math.random() >= CURSED_DROP_CHANCE) return;
  const itemId = pickRandom(CURSED_ITEMS);
  addItem(game.player, itemId);
  notify(game, ITEMS[itemId].icon + ' The monster dropped: ' + ITEMS[itemId].name + '! It looks precious...', '#ffd23f');
}

// ---------- The rite of purification ----------

function liftCurse(game) {
  const itemId = game.isekai.curse;
  game.isekai.purified.push(itemId);
  game.isekai.curse = null;
  cue(game, 'levelUp');
  burst(game, game.player.x, game.player.y - 0.8, '#fff6b0', 30);
  emote(game, 'hero', 'sparkle');
  say(game, null, ['The last word rings like a bell. The ' + ITEMS[itemId].name + ' falls quiet, then warm.', 'The curse is lifted. The thing keeps its power, and you can take it off now.']);
}

function failRite(game) {
  say(game, null, ['The words twist in your mouth. The curse laughs. Try again when you are ready.']);
}

// The rite: a duel of words with the curse itself, RITE_GOOD_ANSWERS good answers before 3 mistakes.
export function offerRite(game, placeName) {
  const curse = { id: null, name: 'The Curse', look: null, shape: 'wisp' };
  const rite = { title: 'Rite of Purification', category: game.focus.current, tag: 'hard', health: RITE_GOOD_ANSWERS, speed: 11, onWin: () => liftCurse(game), onLose: () => failRite(game) };
  say(game, null, [placeName + ': the old words of the rite are carved here. Read them right, and the curse will let go.'], [
    { label: 'Read the rite (' + RITE_GOOD_ANSWERS + ' sentences)', icon: 'book', run: () => startFight(game, makeDuel(curse, rite)) },
    { label: 'Not now', run: () => {} },
  ]);
}

// Where the rite can be read: a shrine of the goddess (not the ruined summon gates), the door of a church.
function ritePlace(game) {
  const shrine = structureNear(game, 'isekaiShrine', SHRINE_RANGE);
  if (shrine && !shrine.isPortal) return 'The shrine of the goddess';
  const front = frontTile(game.player);
  return houseAtDoor(front.x, front.y)?.role === 'church' ? 'The door of the church' : null;
}

export function actionsOfCurses(game) {
  const place = isCursed(game) ? ritePlace(game) : null;
  return [{ when: () => place !== null, icon: 'book', run: () => offerRite(game, place) }];
}
