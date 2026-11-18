import { ITEMS } from '../data/items';
import { npcOf } from '../data/npcs';
import { zoneAt } from '../data/zones';
import { TILE, tileAt, isSolid, propsAround, PORTS } from '../world/map';
import { countItem, addItem, removeItem, heal, restoreMana, maxHealth, maxMana } from './player';
import { activeBoosts } from './boosts';
import { addFriendship } from './village';
import { passHours, sleepUntilMorning } from './days';
import { saveGame } from './save';
import { say, notify } from './messages';
import { cue } from './cues';
import { burst, dust, floatText } from './particles';
import { emote } from './emotes';
import { canGather } from './torch';
import { canRefill, fireToCookNear, boilBottle } from './survival';
import { recipesForStation, canPlayerCraft, craftPlayerItem } from './craftingPlayer';
import { healAllCompanions } from './guild/ranks';
import { makeMonster } from './monsters';
import { isSoil, closestTreasure, dig } from './farm';
import { obeliskNear } from './puzzles';
import { priceOf } from './shop';
import { isCouple, spendNightTogether } from './bonds';
import {
  CAMP_RECIPES,
  DISH_BOOSTS,
  recipeOf,
  canCookCampRecipe,
  consumeRecipeIngredients,
  describeRecipeNeeds,
  applyDishBoosts,
  describeBoosts,
} from './camp/recipes';
import { TASTES, characterDishOpinion } from './camp/tastes';
import { frontTile } from './input';
import { ensureRealism } from './realism/state';
import { applySleepQualityRecovery, singCampfireSong, changeMorale } from './realism/bodyHealth';
import { evaluateMealNutrition, saltRawFood, placeTrailCairn } from './realism/foodAndNature';
import { canUseTinderboxInRain } from './realism/magicPhysics';
import { triggerCampfireBanter } from './soul';

// Camping in the wild: pitching camp, firewood vs Magic Auto-Heater, cooking pot recipes
// (with timed stat boosts), dried meat, character tastes, and companion fatigue.

const CAMP_RANGE = 2.5;
const PEDDLER_GOODS = ['firewood', 'driedMeat', 'wheatSeed', 'carrotSeed', 'herbSeed', 'flowerSeed', 'oil', 'autoHeater'];
const TIRED_WARNING = 75;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// ---------- Saved state & defaults ----------

// What is saved (game.camp), for a new game (and added to an old save that has none).
export function firstCamp() {
  return {
    hasPot: true,
    autoHeater: false,
    active: null,
    fatigue: {},
    mealsShared: 0,
  };
}

// Ensures older saves always have the default cooking pot and camp fields.
export function ensureCamp(game) {
  if (!game) return firstCamp();
  if (!game.camp || typeof game.camp !== 'object') game.camp = firstCamp();
  if (game.camp.hasPot !== true) game.camp.hasPot = true;
  if (typeof game.camp.autoHeater !== 'boolean') game.camp.autoHeater = false;
  if (!game.camp.fatigue || typeof game.camp.fatigue !== 'object') game.camp.fatigue = {};
  if (game.camp.active === undefined) game.camp.active = null;
  if (typeof game.camp.mealsShared !== 'number') game.camp.mealsShared = 0;
  if (game.player && countItem(game.player, 'autoHeater') > 0) game.camp.autoHeater = true;
  return game.camp;
}

export function hasAutoHeater(game) {
  const camp = ensureCamp(game);
  return Boolean(camp.autoHeater || (game.player && countItem(game.player, 'autoHeater') > 0));
}

// ---------- Fatigue & effectiveness ----------

export function companionFatigue(game, npcId) {
  const camp = ensureCamp(game);
  return clamp(camp.fatigue[npcId] || 0, 0, 100);
}

// Adds (or removes, if negative) fatigue for one companion or for all party companions.
export function addCompanionFatigue(game, amount, npcId = null) {
  const camp = ensureCamp(game);
  const targets = npcId !== null ? [npcId] : game.player?.party || [];
  for (const id of targets) {
    camp.fatigue[id] = clamp(Math.round((camp.fatigue[id] || 0) + amount), 0, 100);
  }
}

// Fatigue multiplier in [0.5, 1.0]: fresh companions fight at 1.0x, exhausted ones drop to 0.5x.
export function fatigueMultiplier(game, npcId = null) {
  ensureCamp(game);
  if (npcId !== null) return Number((1 - companionFatigue(game, npcId) * 0.005).toFixed(2));
  const party = game.player?.party || [];
  if (party.length === 0) return 1;
  const total = party.reduce((sum, id) => sum + (1 - companionFatigue(game, id) * 0.005), 0);
  return Number((total / party.length).toFixed(2));
}

// ---------- Camp placement, fire & packing ----------

export function isNearCamp(game) {
  const camp = ensureCamp(game).active;
  if (!camp || !game.player) return false;
  return Math.hypot(game.player.x - camp.x, game.player.y - camp.y) <= CAMP_RANGE;
}

// Can the hero pitch camp here? (Outdoors in the wild, walkable, not in a village/dungeon/inside.)
export function canSetCamp(game) {
  if (!game || !game.player) return false;
  const { x, y } = game.player;
  const zone = zoneAt(x, y);
  if (zone.kind !== 'land') return false;
  if (isSolid(x, y)) return false;
  const tile = tileAt(x, y);
  if ([TILE.BRIDGE, TILE.STAIRS, TILE.SOIL, TILE.WATER, TILE.LAVA].includes(tile)) return false;
  if (propsAround(x, y, 1.2).length > 0) return false;
  return true;
}

export function setCampHere(game) {
  const state = ensureCamp(game);
  if (!canSetCamp(game)) {
    notify(game, 'You can only set up camp outdoors in clear wilderness.', '#ffb070');
    return false;
  }
  const x = Math.floor(game.player.x) + 0.5;
  const y = Math.floor(game.player.y) + 0.5;
  const heater = hasAutoHeater(game);
  state.active = {
    x: x,
    y: y,
    lit: heater,
    heater: heater,
    day: game.day,
    zoneId: zoneAt(x, y).id,
  };
  dust(game, x, y, '#d8c9a8');
  cue(game, 'campPitch');
  if (heater) {
    cue(game, 'campFire');
    burst(game, x + 0.35, y + 0.1, '#7fd6ff', 14);
    notify(game, '⛺ Camp pitched! Your Magic Auto-Heater ignites a blue-gold flame.', '#8fd6ff');
  } else {
    notify(game, '⛺ Camp pitched! Light the campfire with firewood (or 2 branches).', '#ffd86b');
  }
  return true;
}

export function packCamp(game) {
  const state = ensureCamp(game);
  if (!state.active) return false;
  const { x, y } = state.active;
  state.active = null;
  dust(game, x, y, '#d8c9a8');
  cue(game, 'campPitch');
  notify(game, '🎒 Packed up camp.', '#c9d1e0');
  return true;
}

export function craftFirewood(game) {
  if (countItem(game.player, 'branch') < 2) {
    notify(game, 'You need 2 branches to craft firewood.', '#ffb070');
    return false;
  }
  removeItem(game.player, 'branch', 2);
  addItem(game.player, 'firewood', 1);
  cue(game, 'campPitch');
  notify(game, '🪵 Crafted 1 Firewood from 2 branches.', '#ffd86b');
  return true;
}

export function lightCampfire(game) {
  const state = ensureCamp(game);
  const camp = state.active;
  if (!camp) {
    notify(game, 'Pitch a camp first before lighting a campfire.', '#ffb070');
    return false;
  }
  if (camp.lit) return true;

  if (hasAutoHeater(game)) {
    camp.lit = true;
    camp.heater = true;
    cue(game, 'campFire');
    burst(game, camp.x + 0.35, camp.y + 0.1, '#7fd6ff', 14);
    notify(game, '🔮 Magic Auto-Heater lights the campfire with zero firewood!', '#8fd6ff');
    return true;
  }
  if (canUseTinderboxInRain(game) && countItem(game.player, 'firewood') < 1) {
    camp.lit = true;
    camp.heater = false;
    cue(game, 'campFire');
    burst(game, camp.x + 0.35, camp.y + 0.1, '#ff9a2b', 14);
    notify(game, '🔥 Brass Tinderbox sparked dry kindling warmly!', '#ffd086');
    return true;
  }
  if (countItem(game.player, 'firewood') < 1) {
    notify(game, 'You need 1 Firewood to light the fire (craft from 2 branches or buy from the peddler).', '#ffb070');
    return false;
  }
  removeItem(game.player, 'firewood', 1);
  camp.lit = true;
  camp.heater = false;
  cue(game, 'campFire');
  burst(game, camp.x + 0.35, camp.y + 0.1, '#ff9a2b', 14);
  notify(game, '🔥 The campfire crackles warmly!', '#ffd086');
  return true;
}

// ---------- Drying meat, resting & cooking ----------

export function dryMeat(game, count = 1) {
  const camp = ensureCamp(game).active;
  if (!camp || !camp.lit) {
    notify(game, 'Light the campfire first to dry raw meat.', '#ffb070');
    return 0;
  }
  const available = countItem(game.player, 'rawMeat');
  const made = Math.min(available, count);
  if (made <= 0) {
    notify(game, 'You have no raw meat to dry.', '#ffb070');
    return 0;
  }
  removeItem(game.player, 'rawMeat', made);
  addItem(game.player, 'driedMeat', made);
  cue(game, 'sizzle');
  notify(game, '🥓 Slow-dried ' + made + ' Raw Meat into Dried Meat!', '#ffd086');
  return made;
}

// Rests for `hours` (or until morning when `hours === null`). Restores HP/MP and lowers fatigue.
export function restAtCamp(game, hours = null) {
  const state = ensureCamp(game);
  if (game.raid && game.raid.active) {
    notify(game, 'You cannot rest at camp: Eldermoor is under attack!', '#ff6060');
    return false;
  }
  const camp = state.active;
  const wasLit = Boolean(camp && camp.lit);
  const player = game.player;

  if (hours === null) {
    sleepUntilMorning(game);
    const hasTent = countItem(player, 'tentKit') > 0;
    const real = game?.realism ? ensureRealism(game) : null;
    if (real) applySleepQualityRecovery(game, hasTent ? 'tent' : 'ground');
    addCompanionFatigue(game, wasLit ? -80 : -50);
    healAllCompanions(game);
    const z = zoneAt(player.x, player.y);
    const watchSafe = Boolean(real?.health?.watchMateId && (player.party || []).includes(real.health.watchMateId));
    const ambushChance = watchSafe ? 0 : (z.danger || 0) >= 2 ? ((player.party || []).length > 0 ? 0.08 : 0.22) : 0;
    if (ambushChance > 0 && Math.random() < ambushChance && !game.run.fight) {
      if (real) real.combatRealism.wakeSleepyTurn = true;
      const prowler = z.species?.length > 0 ? z.species[Math.floor(Math.random() * z.species.length)] : 'wolf';
      const ambusher = makeMonster(game, prowler, player.x + 1.5, player.y);
      game.run.monsters.push(ambusher);
      notify(game, '⚠️ A nocturnal ' + ambusher.name + ' prowled into camp while you slept!', '#ff8a95');
    } else {
      notify(game, wasLit ? '💤 Slept warmly until morning. HP, MP and party energy restored!' : '💤 Slept until morning. HP and MP restored.', '#9fd8ff');
      if (wasLit) triggerCampfireBanter(game);
    }
    saveGame(game);
  } else {
    passHours(game, hours);
    player.fatigue = Math.max(0, (player.fatigue || 0) - Math.round(hours * 12));
    const ratio = wasLit ? 0.5 : 0.3;
    heal(player, Math.ceil(maxHealth(player) * ratio));
    restoreMana(player, Math.ceil(maxMana(player) * ratio));
    addCompanionFatigue(game, wasLit ? -40 : -20);
    healAllCompanions(game);
    notify(game, '⛺ Rested ' + hours + 'h at camp. HP/MP recovered and fatigue eased.', '#9fd8ff');
  }
  cue(game, 'campPitch');
  return true;
}

// ---------- Meal sharing, reactions & dialog expressions ----------

function sayWithExpression(game, speakerId, lines, expression, choices = []) {
  say(game, speakerId, lines, choices);
  const waiting = game.run && game.run.waitingDialogs;
  const dialog = waiting && waiting.length > 0 ? waiting[waiting.length - 1] : game.run && game.run.dialog;
  if (dialog && expression) dialog.expression = expression;
}

function syncFollowerSpotForEmote(game, npcId) {
  const follower = game.run && game.run.followers && game.run.followers.find((f) => f.kind === 'person' && f.id === npcId);
  if (follower && game.run.people && game.run.people[npcId]) {
    game.run.people[npcId].x = follower.x;
    game.run.people[npcId].y = follower.y;
  }
}

// Shares a dish with all recruited party companions: lowers fatigue, raises friendship, emotes & reacts.
export function shareMealWithParty(game, dishId) {
  const state = ensureCamp(game);
  state.mealsShared += 1;
  const party = game.player?.party || [];
  const results = [];

  for (const npcId of party) {
    const opinion = characterDishOpinion(npcId, dishId);
    addCompanionFatigue(game, opinion.fatigueDelta, npcId);
    addFriendship(game, npcId, opinion.friendshipDelta);
    syncFollowerSpotForEmote(game, npcId);
    emote(game, npcId, opinion.emote);
    sayWithExpression(game, npcId, [opinion.reaction], opinion.expression);
    results.push({ npcId: npcId, opinion: opinion, fatigue: companionFatigue(game, npcId) });
  }
  return results;
}

function feedHeroFromItem(game, itemId) {
  const item = ITEMS[itemId];
  const player = game.player;
  if (!item || item.food === undefined) return;
  const repMult = game?.realism ? evaluateMealNutrition(game, itemId) : 1;
  const gained = Math.max(1, Math.round(item.food * repMult));
  player.hunger = clamp(player.hunger + gained);
  if (item.water) player.thirst = clamp(player.thirst + item.water);
  if (item.heal) heal(player, item.heal, game);
  if (item.morale && game?.realism) changeMorale(game, item.morale);
  if (item.raw && Math.random() < 0.35) {
    player.health = Math.max(1, player.health - 10);
    notify(game, '🤢 The raw meat made you ill. −10 HP!', '#ff8a95');
  }
  applyDishBoosts(game, itemId);
  floatText(game, player.x, player.y - 1, '+' + gained + ' 🍖', '#ffd086');
}

export function cookCampDish(game, dishId, shareNow = false) {
  const camp = ensureCamp(game).active;
  const recipe = recipeOf(dishId);
  if (!camp || !camp.lit) {
    notify(game, 'Light the campfire first to cook.', '#ffb070');
    return false;
  }
  if (!canCookCampRecipe(game, recipe)) {
    notify(game, 'Not enough ingredients or water for ' + ITEMS[dishId].name + '.', '#ffb070');
    return false;
  }
  consumeRecipeIngredients(game, recipe);
  cue(game, 'sizzle');

  if (shareNow) {
    feedHeroFromItem(game, dishId);
    cue(game, 'eatMeal');
    const reactions = shareMealWithParty(game, dishId);
    const boostNote = describeBoosts(dishId);
    notify(game, '🍲 Enjoyed ' + ITEMS[dishId].name + (boostNote ? ' (' + boostNote + ')' : '') + '!', '#7cfc9a');
    if (reactions.length === 0) emote(game, 'hero', 'heart');
  } else {
    addItem(game.player, dishId, 1);
    notify(game, '🍲 Cooked: ' + ITEMS[dishId].name + ' (added to bag).', '#ffd086');
  }
  return true;
}

export function eatCampDish(game, itemId) {
  if (countItem(game.player, itemId) < 1 || !ITEMS[itemId] || ITEMS[itemId].food === undefined) return false;
  removeItem(game.player, itemId, 1);
  feedHeroFromItem(game, itemId);
  cue(game, 'eatMeal');
  const reactions = shareMealWithParty(game, itemId);
  const boostNote = describeBoosts(itemId);
  notify(game, '🍽️ Shared ' + ITEMS[itemId].name + (boostNote ? ' (' + boostNote + ')' : '') + '!', '#7cfc9a');
  if (reactions.length === 0) emote(game, 'hero', 'sparkle');
  return true;
}

// ---------- Camp Peddler (supplies & Magic Auto-Heater) ----------

export function buyCampSupply(game, itemId) {
  ensureCamp(game);
  const item = ITEMS[itemId];
  if (!item || !item.price) return false;
  if (itemId === 'autoHeater' && hasAutoHeater(game)) {
    notify(game, 'You already own the Magic Auto-Heater!', '#8fd6ff');
    return false;
  }
  const price = priceOf(game, itemId);
  if (game.player.lexis < price) {
    notify(game, 'You need ' + price + ' Lexis for ' + item.name + '.', '#ffb070');
    return false;
  }
  game.player.lexis -= price;
  addItem(game.player, itemId, 1);
  cue(game, 'coin');

  if (itemId === 'autoHeater') {
    game.camp.autoHeater = true;
    if (game.camp.active) {
      game.camp.active.lit = true;
      game.camp.active.heater = true;
      cue(game, 'campFire');
      burst(game, game.camp.active.x + 0.35, game.camp.active.y + 0.1, '#7fd6ff', 16);
    }
    notify(game, '🔮 Acquired the Magic Auto-Heater! Campfires now light with zero firewood.', '#8fd6ff');
  } else {
    notify(game, 'Bought ' + item.name + ' for ' + price + ' Lexis.', '#8dffb0');
  }
  return true;
}

export function openCampPeddler(game) {
  ensureCamp(game);
  const offers = PEDDLER_GOODS.filter((id) => ITEMS[id] && (id !== 'autoHeater' || !hasAutoHeater(game)));
  const choices = offers.map((id) => {
    const price = priceOf(game, id);
    const item = ITEMS[id];
    const icon = id === 'autoHeater' ? 'crystal' : id === 'firewood' ? 'branch' : id === 'wheatSeed' ? 'carrotSeed' : id === 'driedMeat' ? 'roastMeat' : id;
    return {
      label: item.name + ' (' + price + ' Lexis) — ' + (item.text || ''),
      icon: icon,
      run: () => {
        buyCampSupply(game, id);
        openCampPeddler(game);
      },
    };
  });
  choices.push({ label: 'Back', run: () => { if (isNearCamp(game)) openCampMenu(game); } });
  say(game, null, ['A traveling camp peddler opens a packed mule bag. You have ' + game.player.lexis + ' Lexis.'], choices);
}

// ---------- Camp Menus (Dialogs) ----------

function openDishActionMenu(game, recipe) {
  const item = ITEMS[recipe.id];
  const boost = describeBoosts(recipe.id);
  const hasParty = game.player.party.length > 0;
  say(game, null, [item.name + '\nNeeds: ' + describeRecipeNeeds(recipe) + (boost ? '\nBoost: ' + boost : '')], [
    { label: hasParty ? 'Cook & Share with Party now' : 'Cook & Eat now', icon: 'herbStew', run: () => cookCampDish(game, recipe.id, true) },
    { label: 'Cook & Store in Bag', icon: 'inventory', run: () => { cookCampDish(game, recipe.id, false); openCookMenu(game); } },
    { label: 'Back to Recipes', run: () => openCookMenu(game) },
  ]);
}

function openCookMenu(game) {
  const ready = CAMP_RECIPES.filter((recipe) => canCookCampRecipe(game, recipe));
  const unavailable = CAMP_RECIPES.filter((recipe) => !canCookCampRecipe(game, recipe));
  const summary =
    ready.length > 0
      ? 'The cooking pot simmers over the flame. Pick a dish to prepare:'
      : 'You lack ingredients or water for pot dishes right now.\n' +
        unavailable.slice(0, 4).map((r) => '• ' + ITEMS[r.id].name + ': ' + describeRecipeNeeds(r)).join('\n');

  const choices = ready.map((recipe) => {
    const boost = describeBoosts(recipe.id);
    return {
      label: ITEMS[recipe.id].name + ' (' + describeRecipeNeeds(recipe) + ')' + (boost ? ' · ' + boost : ''),
      icon: recipe.id === 'scholarTea' || recipe.id === 'honeyPorridge' || recipe.id === 'heartySoup' ? 'broth' : recipe.id === 'hunterSkewer' ? 'roastMeat' : 'herbStew',
      run: () => openDishActionMenu(game, recipe),
    };
  });
  choices.push({ label: 'Back to Camp', run: () => openCampMenu(game) });
  say(game, null, [summary], choices);
}

function openBagMealsMenu(game) {
  const foods = Object.keys(game.player.bag).filter((id) => ITEMS[id] && ITEMS[id].kind === 'food' && id !== 'rawMeat');
  if (foods.length === 0) {
    say(game, null, ['You have no prepared food in your bag to share.'], [{ label: 'Back', run: () => openCampMenu(game) }]);
    return;
  }
  const choices = foods.map((id) => {
    const boost = describeBoosts(id);
    const icon = ['spicedStew', 'herbStew', 'travelersFeast'].includes(id) ? 'herbStew' : ['broth', 'heartySoup', 'scholarTea', 'honeyPorridge'].includes(id) ? 'broth' : id === 'driedMeat' || id === 'hunterSkewer' ? 'roastMeat' : id;
    return {
      label: ITEMS[id].name + ' ×' + countItem(game.player, id) + (boost ? ' (' + boost + ')' : ''),
      icon: icon,
      run: () => eatCampDish(game, id),
    };
  });
  choices.push({ label: 'Back to Camp', run: () => openCampMenu(game) });
  say(game, null, ['Share or eat a meal from your bag (boosts stats & refreshes companions):'], choices);
}

function openRestMenu(game) {
  const lit = Boolean(ensureCamp(game).active?.lit);
  const partnerId = (game.player?.party || []).find((id) => isCouple(game, id) || game.player.spouse === id);
  const partner = partnerId ? npcOf(partnerId) : null;
  const party = game.player?.party || [];
  const real = game?.realism ? ensureRealism(game) : null;
  const watchId = real?.health?.watchMateId && party.includes(real.health.watchMateId) ? real.health.watchMateId : null;
  const choices = [
    { label: 'Short rest (4 hours · HP/MP & fatigue relief)', icon: 'sleep', run: () => restAtCamp(game, 4) },
    { label: 'Sleep until morning (full HP/MP & deep rest)', icon: 'sleep', run: () => restAtCamp(game, null) },
  ];
  if (party.length > 0 && real) {
    const nextMate = watchId ? party[(party.indexOf(watchId) + 1) % (party.length + 1)] || null : party[0];
    choices.push({
      label: watchId ? `Night Watch: ${npcOf(watchId).name} (No ambush) · Switch` : 'Assign Companion Night Watch (Prevents ambush)',
      icon: 'shield',
      run: () => {
        real.health.watchMateId = nextMate;
        notify(game, nextMate ? `🛡️ ${npcOf(nextMate).name} will keep night watch.` : 'Night watch cleared.', '#9fd8ff');
        openRestMenu(game);
      },
    });
  }
  if (partner) {
    choices.push({ label: 'Spend the night with ' + partner.name, icon: 'people', run: () => spendNightTogether(game, partner) });
  }
  choices.push({ label: 'Back to Camp', run: () => openCampMenu(game) });
  say(game, null, [lit ? 'The fire keeps the night warm. How long do you rest?' : 'The camp is unlit — resting by an unlit fire recovers less fatigue.'], choices);
}

function campStatusLine(game) {
  const state = ensureCamp(game);
  const camp = state.active;
  const fireLine = !camp
    ? 'No camp pitched here yet.'
    : camp.lit
      ? camp.heater
        ? '🔮 Magic Auto-Heater glowing (blue-gold flame, zero firewood).'
        : '🔥 Campfire burning steadily.'
      : '🌑 Campfire is unlit.';
  const gearLine = '🍲 Cooking Pot ready · 🪵 Firewood ×' + countItem(game.player, 'firewood') + ' · Branches ×' + countItem(game.player, 'branch');
  const party = game.player.party || [];
  const fatigueLine =
    party.length > 0
      ? '\nParty fatigue: ' + party.map((id) => npcOf(id).name + ' ' + companionFatigue(game, id) + '% (×' + fatigueMultiplier(game, id).toFixed(2) + ')').join(' · ')
      : '';
  const mealBoosts = activeBoosts(game).filter((b) => b.source === 'meal');
  const boostLine = mealBoosts.length > 0 ? '\nActive meal boosts: ' + mealBoosts.map((b) => b.stat + ' +' + b.amount).join(', ') : '';
  return fireLine + '\n' + gearLine + fatigueLine + boostLine;
}

export function openCampMenu(game) {
  const state = ensureCamp(game);
  if (!state.active || !isNearCamp(game)) {
    const choices = [];
    if (canSetCamp(game)) {
      choices.push({ label: 'Set up camp here', icon: 'fire', run: () => { if (setCampHere(game)) openCampMenu(game); } });
    }
    choices.push({ label: 'Camp Peddler (supplies)', icon: 'lexis', run: () => openCampPeddler(game) });
    choices.push({ label: 'Close', run: () => {} });
    say(game, null, [campStatusLine(game)], choices);
    return;
  }

  const camp = state.active;
  const player = game.player;
  const choices = [];

  if (!camp.lit) {
    choices.push({
      label: hasAutoHeater(game) ? 'Activate Magic Auto-Heater (0 firewood)' : 'Light campfire (1 Firewood)',
      icon: hasAutoHeater(game) ? 'crystal' : 'fire',
      run: () => {
        lightCampfire(game);
        openCampMenu(game);
      },
    });
  }
  if (!hasAutoHeater(game) && countItem(player, 'branch') >= 2) {
    choices.push({
      label: 'Craft Firewood (2 Branches → 1)',
      icon: 'branch',
      run: () => {
        craftFirewood(game);
        openCampMenu(game);
      },
    });
  }
  if (camp.lit && state.hasPot) {
    choices.push({ label: 'Cook & Share Meals (Cooking Pot)', icon: 'herbStew', run: () => openCookMenu(game) });
  }
  if (countItem(player, 'salt') > 0 && (countItem(player, 'rawMeat') > 0 || countItem(player, 'rawFish') > 0)) {
    const srcId = countItem(player, 'rawMeat') > 0 ? 'rawMeat' : 'rawFish';
    choices.push({
      label: 'Salt ' + ITEMS[srcId].name + ' → Smoked Jerky (Never spoils)',
      icon: 'smokedJerky',
      run: () => {
        saltRawFood(game, srcId, 1);
        openCampMenu(game);
      },
    });
  }
  if (camp.lit) {
    choices.push({
      label: 'Sing by the Fire (+20 Morale, +2 MP)',
      icon: 'powers',
      run: () => {
        singCampfireSong(game);
        openCampMenu(game);
      },
    });
  }
  if (countItem(player, 'stone') >= 3) {
    choices.push({
      label: 'Build Trail Cairn (3 Stones → +12% Speed nearby)',
      icon: 'stone',
      run: () => {
        placeTrailCairn(game);
        openCampMenu(game);
      },
    });
  }
  if (camp.lit && countItem(player, 'rawMeat') > 0) {
    const rawCount = countItem(player, 'rawMeat');
    choices.push({
      label: 'Dry 1 Raw Meat → Dried Meat (have ×' + rawCount + ')',
      icon: 'rawMeat',
      run: () => {
        dryMeat(game, 1);
        openCampMenu(game);
      },
    });
    if (rawCount >= 2) {
      choices.push({
        label: 'Dry all Raw Meat (' + rawCount + ' → Dried Meat)',
        icon: 'roastMeat',
        run: () => {
          dryMeat(game, rawCount);
          openCampMenu(game);
        },
      });
    }
  }
  if (Object.keys(player.bag).some((id) => ITEMS[id] && ITEMS[id].kind === 'food' && id !== 'rawMeat')) {
    choices.push({ label: 'Eat / Share a Dish from Bag', icon: 'roastMeat', run: () => openBagMealsMenu(game) });
  }
  if (camp.lit && player.bottle > 0 && player.bottleUntreated) {
    choices.push({
      label: 'Boil River Water Clean',
      icon: 'water',
      run: () => {
        boilBottle(game);
        openCampMenu(game);
      },
    });
  }
  const craftable = recipesForStation('camp');
  if (craftable.length > 0) {
    choices.push({
      label: 'Field Craft & Alchemy (' + craftable.filter((r) => canPlayerCraft(game, r)).length + ' ready)',
      icon: 'antidote',
      run: () => {
        const list = craftable.map((r) => ({
          label: ITEMS[r.id].name + (canPlayerCraft(game, r) ? ' ✓' : '') + ' · ' + Object.entries(r.needs).map(([k, v]) => ITEMS[k].name + '×' + v).join(', '),
          icon: r.id,
          run: () => {
            craftPlayerItem(game, r.id);
            openCampMenu(game);
          },
        }));
        say(game, null, ['Field alchemy & leatherwork at camp:'], [...list, { label: 'Back', run: () => openCampMenu(game) }]);
      },
    });
  }

  choices.push({ label: 'Rest at Camp (HP/MP & Fatigue)', icon: 'sleep', run: () => openRestMenu(game) });
  choices.push({ label: 'Camp Peddler (Supplies & Auto-Heater)', icon: 'lexis', run: () => openCampPeddler(game) });
  choices.push({ label: 'Pack up camp', icon: 'inventory', run: () => packCamp(game) });
  choices.push({ label: 'Leave', run: () => {} });

  say(game, null, [campStatusLine(game)], choices);
}

function offerWildCampOrDig(game) {
  const front = frontTile(game.player);
  say(game, null, ['Clear wilderness ground. What would you like to do?'], [
    { label: 'Set up camp here', icon: 'fire', run: () => { if (setCampHere(game)) openCampMenu(game); } },
    { label: 'Dig the ground here', icon: 'dig', run: () => dig(game, front.x, front.y) },
    { label: 'Camp Peddler (supplies)', icon: 'lexis', run: () => openCampPeddler(game) },
    { label: 'Cancel', run: () => {} },
  ]);
}

// ---------- Hooks called by update.js / days.js ----------

// Every frame on the map. dt: seconds.
export function updateCamp(game, dt) {
  ensureCamp(game);
  const run = game.run;
  if (!run) return;

  if (run.campLastKills === undefined) run.campLastKills = game.counts ? game.counts.kills : 0;
  const kills = game.counts ? game.counts.kills : 0;
  if (kills > run.campLastKills) {
    const diff = kills - run.campLastKills;
    run.campLastKills = kills;
    addCompanionFatigue(game, diff * 10);
  }

  if (run.walking && game.player && game.player.party.length > 0) {
    run.campFatigueAcc = (run.campFatigueAcc || 0) + dt * (run.running ? 0.22 : 0.12);
    if (run.campFatigueAcc >= 1) {
      const whole = Math.floor(run.campFatigueAcc);
      run.campFatigueAcc -= whole;
      addCompanionFatigue(game, whole);
    }
  }
}

// About once per second.
export function slowCamp(game) {
  const state = ensureCamp(game);
  if (state.active && hasAutoHeater(game)) {
    state.active.lit = true;
    state.active.heater = true;
  }
  if (!game.run || !game.player) return;
  if (!game.run.campWarnedTired) game.run.campWarnedTired = {};
  for (const npcId of game.player.party) {
    const fatigue = companionFatigue(game, npcId);
    if (fatigue >= TIRED_WARNING && !game.run.campWarnedTired[npcId]) {
      game.run.campWarnedTired[npcId] = true;
      notify(game, '😴 ' + npcOf(npcId).name + ' is tired (' + fatigue + '%). Set up camp to rest or share a meal!', '#ffb070');
    } else if (fatigue < 50) {
      game.run.campWarnedTired[npcId] = false;
    }
  }
}

// Every new day.
export function newDayCamp(game) {
  const state = ensureCamp(game);
  if (game.run) game.run.campWarnedTired = {};

  // Regular firewood burns out overnight; Magic Auto-Heater stays glowing.
  if (state.active && state.active.lit) {
    if (hasAutoHeater(game)) {
      state.active.lit = true;
      state.active.heater = true;
    } else {
      state.active.lit = false;
    }
  }

  // Companions resting off-party recover fatigue each day.
  const party = game.player ? game.player.party : [];
  for (const npcId of Object.keys(state.fatigue)) {
    if (!party.includes(npcId)) addCompanionFatigue(game, -50, npcId);
  }
}

function shouldYieldToWorldAction(game) {
  const player = game.player;
  const front = frontTile(player);
  if (PORTS.some((port) => Math.hypot(port.x - player.x, port.y - player.y) < 3)) return true;
  if (fireToCookNear(game) || obeliskNear(game)) return true;
  if (isSoil(player.x, player.y) || isSoil(front.x, front.y)) return true;
  if (canRefill(game, front) || canGather(game, front.x, front.y)) return true;
  if (closestTreasure(game, 2.5)) return true;
  return false;
}

// What the action button can do here: [{ when: () => boolean, icon, run }], the most important first.
export function actionsOfCamp(game) {
  ensureCamp(game);
  const atCamp = () => {
    const camp = game.camp && game.camp.active;
    if (!camp || !game.player) return false;
    const dist = Math.hypot(game.player.x - camp.x, game.player.y - camp.y);
    if (dist <= 1.6) return true;
    if (dist > CAMP_RANGE) return false;
    const front = frontTile(game.player);
    return !canGather(game, front.x, front.y) && !canRefill(game, front);
  };
  return [
    { when: atCamp, icon: game.camp.active && game.camp.active.lit ? 'roastMeat' : 'fire', run: () => openCampMenu(game) },
    { when: () => canSetCamp(game) && !isNearCamp(game) && !shouldYieldToWorldAction(game), icon: 'fire', run: () => offerWildCampOrDig(game) },
  ];
}

export { TASTES, CAMP_RECIPES, DISH_BOOSTS, characterDishOpinion, applyDishBoosts };
