import { TILE, tileAt, isSolid, TREASURES, CHESTS } from '../world/map';
import { ITEMS } from '../data/items';
import { CAMP_SENTENCES } from '../data/sentences/camp';
import { pickRandom } from '../../logic/random';
import { countItem, addItem, removeItem, earnLexis } from './player';
import { startFight } from './fight';
import { makeDuel } from './duels';
import { notify, say } from './messages';
import { burst, dust, floatText } from './particles';
import { emote } from './emotes';
import { cue } from './cues';

// Working the ground: planting carrots/herbs/flowers/wheat, digging for treasures, opening chests.

const GROW_DAYS = 2; // days for a crop to be ready

function keyOf(x, y) {
  return Math.floor(x) + ',' + Math.floor(y);
}

// ---------- Crops ----------
// game.crops: { "61,78": { day: 3, grows: 'carrot', fertilized: false } }
const SEEDS = ['carrotSeed', 'herbSeed', 'flowerSeed', 'wheatSeed'];

export function cropAt(game, x, y) {
  return game.crops[keyOf(x, y)] || null;
}

export function isCropReady(game, crop) {
  return game.day - crop.day >= GROW_DAYS;
}

// Completes planting after the English farming text succeeds.
function finishPlanting(game, x, y, seedId, fertilized) {
  if (countItem(game.player, seedId) <= 0 || cropAt(game, x, y)) return;
  removeItem(game.player, seedId);
  const grows = ITEMS[seedId].grows;
  game.crops[keyOf(x, y)] = { day: game.day, grows: grows, fertilized: fertilized };
  dust(game, x, y, fertilized ? '#7cfc9a' : '#8a5a2b');
  if (fertilized) burst(game, x, y, '#7cfc9a', 10);
  cue(game, 'plantSeed');
  const bonusNote = fertilized ? ' (Fertilized soil: 2× harvest!)' : '';
  notify(game, '🌱 Planted: ' + ITEMS[grows].name + '.' + bonusNote + ' Ready in ' + GROW_DAYS + ' days.', fertilized ? '#7cfc9a' : '#ffffff');
}

// Planting confronts the player with a short contextual English fill-in-the-blank farming text (1 sentence).
function plantSeed(game, x, y, seedId) {
  if (countItem(game.player, seedId) <= 0) return;
  const spirit = { id: 'soilSpirit', name: 'Spirit of the Soil', shape: 'treant' };
  const category = (game.focus && game.focus.current) || 'vocabulary';

  function onWin(fight) {
    const fast = fight.last && fight.last.first;
    const fertilized = Math.random() < (fast ? 0.65 : 0.35);
    finishPlanting(game, x, y, seedId, fertilized);
  }

  function onLose() {
    dust(game, x, y, '#9aa6b8');
    notify(game, '🌱 The soil was not prepared properly. Your ' + ITEMS[seedId].name + ' stays in your bag — try again!', '#ffb070');
  }

  const duel = makeDuel(spirit, {
    title: 'Planting ' + ITEMS[seedId].name,
    category: category,
    questions: CAMP_SENTENCES,
    health: 1,
    mistakesAllowed: 1,
    speed: 8,
    onWin: onWin,
    onLose: onLose,
  });
  startFight(game, duel);
}

// Plants a seed of the bag (if there are several kinds, the player chooses).
function plant(game, x, y) {
  const seeds = SEEDS.filter((seedId) => countItem(game.player, seedId) > 0);
  if (seeds.length === 0) {
    notify(game, 'You need seeds. Old Bea sells carrots, herbs and flowers; the camp peddler sells wheat seeds.');
    return;
  }
  if (seeds.length === 1) {
    plantSeed(game, x, y, seeds[0]);
    return;
  }
  say(game, null, ['What do you plant here?'], seeds.map((seedId) => ({ label: ITEMS[seedId].name + ' × ' + countItem(game.player, seedId), icon: seedId, run: () => plantSeed(game, x, y, seedId) })));
}

function harvest(game, x, y) {
  const crop = cropAt(game, x, y);
  const itemId = crop.grows || 'carrot';
  const count = crop.fertilized ? 2 : Math.random() < 0.3 ? 2 : 1;
  delete game.crops[keyOf(x, y)];
  addItem(game.player, itemId, count);
  game.counts.harvested += count;
  const color = itemId === 'wheat' ? '#ffd23f' : itemId === 'herb' ? '#7cfc9a' : itemId === 'flower' ? '#ff9ec4' : '#ff8c2b';
  burst(game, x, y, color, 12);
  floatText(game, x, y, '+' + count + ' ' + ITEMS[itemId].icon, color);
}

// The player uses the soil tile at (x, y): plant, harvest, or wait.
export function workField(game, x, y) {
  const crop = cropAt(game, x, y);
  if (!crop) plant(game, x, y);
  else if (isCropReady(game, crop)) harvest(game, x, y);
  else notify(game, 'It is growing. Come back in ' + (GROW_DAYS - (game.day - crop.day)) + ' day(s).');
}

export function isSoil(x, y) {
  return tileAt(x, y) === TILE.SOIL;
}

// ---------- Digging ----------

// The buried treasure at this tile or just next to it (undefined = none, or already dug).
function treasureNear(game, x, y) {
  return TREASURES.find(
    (treasure) => !game.dug[treasure.key] && Math.abs(treasure.x - Math.floor(x)) <= 1 && Math.abs(treasure.y - Math.floor(y)) <= 1,
  );
}

// The closest treasure still in the ground, within `range` tiles (undefined = none).
export function closestTreasure(game, range) {
  let closest;
  let best = range;
  for (const treasure of TREASURES) {
    const far = Math.hypot(treasure.x + 0.5 - game.player.x, treasure.y + 0.5 - game.player.y);
    if (!game.dug[treasure.key] && far < best) {
      closest = treasure;
      best = far;
    }
  }
  return closest;
}

// A more dangerous land hides better things.
function digUp(game, treasure) {
  const lexis = 15 * treasure.danger + Math.floor(Math.random() * 20);
  const itemId = pickRandom(treasure.danger >= 2 ? ['oldCoin', 'gem', 'manaPotion'] : ['oldCoin', 'healthPotion', 'flower']);
  game.dug[treasure.key] = true;
  earnLexis(game, lexis);
  addItem(game.player, itemId);
  burst(game, treasure.x + 0.5, treasure.y + 0.5, '#ffd23f', 30);
  emote(game, 'hero', 'sparkle');
  notify(game, '💰 Treasure! +' + lexis + ' Lexis and ' + ITEMS[itemId].icon + ' ' + ITEMS[itemId].name, '#ffd23f');
}

export function dig(game, x, y) {
  if (isSolid(x, y)) return;
  dust(game, x + 0.5, y + 0.5);
  const treasure = treasureNear(game, x, y);
  if (treasure) {
    digUp(game, treasure);
  } else if (Math.random() < 0.06) {
    earnLexis(game, 1);
    floatText(game, x + 0.5, y, '+1 Lexis', '#ffd23f');
    emote(game, 'hero', 'note');
  } else {
    emote(game, 'hero', 'dots');
  }
}

// ---------- Chests (at the end of the dungeons) ----------

export function chestNear(game) {
  return CHESTS.find((chest) => !game.chests[chest.key] && Math.hypot(chest.x + 0.5 - game.player.x, chest.y + 0.5 - game.player.y) < 1.3);
}

// The big chest at the end of a dungeon, or a small one on the way.
export function openChest(game, chest) {
  const isSmall = chest.key.endsWith(':small');
  const lexis = (isSmall ? 30 : 100) * chest.zone.danger;
  game.chests[chest.key] = true;
  earnLexis(game, lexis);
  addItem(game.player, isSmall ? pickRandom(['oldCoin', 'manaPotion', 'flint', 'oil']) : 'gem');
  addItem(game.player, 'healthPotion', isSmall ? 1 : 3);
  burst(game, chest.x + 0.5, chest.y + 0.5, '#ffd23f', 40);
  emote(game, 'hero', '!');
  notify(game, '🎁 A chest of ' + chest.zone.name + ': +' + lexis + ' Lexis and treasures!', '#ffd23f');
}
