import { zoneAt, HOME_DOOR } from '../data/zones';
import { isSolid, tileAt, biomeAt, linkAt, TILE, propsAround } from '../world/map';
import { directionOf, facingOf, isRunning, frontTile } from './input';
import { advanceClock, sleepUntilMorning } from './days';
import { updateMonsters } from './monsters';
import { updatePeople, personNear, talkTo } from './people';
import { updateFollowers } from './followers';
import { updatePowers } from './powers';
import { updateGuildHall, actionsOfGuildHall } from './guildHall';
import { slowSparring } from './sparring';
import { updateRaid } from './raid';
import { updateStory } from './chapters';
import { updateParticles, dust, addTrack } from './particles';
import { isSoil, workField, dig, chestNear, openChest } from './farm';
import { saveGame } from './save';
import { exploreAround } from './explore';
import { cue } from './cues';
import { closedSealAt, explainSeal } from './seals';
import { canGather, gather, hasLight } from './torch';
import { isNight } from './clock';
import { villageNews } from './villages';
import { updateVillagers, villagerNear, wakeVillages } from './villagers';
import { updateVillagerLife } from './villagerLife';
import { updateAnimals, wakeAnimals, wildAnimalNear, petWildAnimal, strikeWorld, HOSTILE_WILDLIFE } from './animals';
import { harvestableNear, harvestProp } from './harvest';
import { updateWeather, knockedOutNear, carry, checkRescue, checkKnockedOut, putDown } from './weather';
import { updateEncounters } from './encounters';
import { pushBoulder, wordDoorAt, openWordDoor, obeliskNear, readObelisk, boulderPuzzleAt, offerBoulderReset } from './puzzles';
import { canRefill, refill, fireToCookNear, offerCooking } from './survival';
import { isAtHome, furnitureAt, pickUpFurniture, openStorage, nextWallColor, nextBedColor } from './home';
import { practiceAtDummy } from './school';
import { refreshWorld } from './worldState';
import { portNear, offerSail } from './ports';
import { say, notify, removeOldToasts } from './messages';
import { updateWar, slowWar, actionsOfWar } from './war';
import { updateSociety, slowSociety, actionsOfSociety, ridingSpeedMultiplier } from './society';
import { updateCamp, slowCamp, actionsOfCamp } from './camp';
import { updateBonds, slowBonds, actionsOfBonds } from './bonds';
import { exitVisitedHouseIfStairs, actionsOfHouses } from './houses';
import { updateIsekaiStructures, actionsOfStructures } from './isekaiStructures';
import { updateWorldParties, syncWorldParties, actionsOfParties, onFightEndParties } from './worldParties';
import { actionsOfIsekai, slowIsekai, updateIsekai } from './isekai';
import { updateEconomy, slowEconomy } from './economy';
import { encumbranceStatus } from './weight';
import { updateBorders } from './kingdomLaws';
import { kidNear, talkToKid } from './families';
import { knockOut } from './death';

// One step of the world. Called at every frame while the player is on the map.

const WALK_SPEED = 4.2; // tiles per second (base walking speed)
const RUN_SPEED = 8.8; // ...and runs (Shift, or the stick pushed to its edge)
const MAX_MOVE_STEP = 0.25; // max tiles per collision sub-step
const BODY = 0.28; // half the width of the hero, in tiles (to not walk into the walls)
const SAVE_EVERY = 10; // seconds
const FADE = 350; // milliseconds: the screen goes black when the hero takes stairs

// ---------- Walking ----------

// Is the hero's body (a small square around x, y) free of walls and of closed seals?
function canStand(game, x, y) {
  const corners = [
    [x - BODY, y - BODY],
    [x + BODY, y - BODY],
    [x - BODY, y + BODY],
    [x + BODY, y + BODY],
  ];
  const seal = corners.map(([cx, cy]) => closedSealAt(game, cx, cy)).find((found) => found);
  if (seal) explainSeal(game, seal);
  return !seal && corners.every(([cx, cy]) => !isSolid(cx, cy));
}

// The hero walks into a boulder: it rolls one tile (the boulder puzzles of the dungeons).
function tryPush(game, dx, dy) {
  const player = game.player;
  const x = Math.floor(player.x + dx * 0.6);
  const y = Math.floor(player.y + dy * 0.6);
  if (Date.now() < game.run.pushUntil || !pushBoulder(game, x, y, Math.sign(dx), Math.sign(dy))) return;
  game.run.pushUntil = Date.now() + 250;
  refreshWorld(game);
}

function walk(game, input, dt) {
  const player = game.player;
  const direction = directionOf(input);
  game.run.walking = direction.x !== 0 || direction.y !== 0;
  if (!game.run.walking || Date.now() < game.run.fadeUntil) return;

  const enc = encumbranceStatus(game);
  game.run.running = enc.canSprint && isRunning(input);
  const mount = ridingSpeedMultiplier(game);
  const distance = (game.run.running ? RUN_SPEED : WALK_SPEED) * mount * enc.speedMult * (Date.now() < game.run.dashUntil ? 2 : 1) * dt;
  const steps = Math.max(1, Math.ceil(distance / MAX_MOVE_STEP));
  const stepDist = distance / steps;
  for (let i = 0; i < steps; i++) {
    if (canStand(game, player.x + direction.x * stepDist, player.y)) player.x += direction.x * stepDist;
    else if (direction.y === 0 && i === 0) tryPush(game, direction.x, 0);
    if (canStand(game, player.x, player.y + direction.y * stepDist)) player.y += direction.y * stepDist;
    else if (direction.x === 0 && i === 0) tryPush(game, 0, direction.y);
  }
  player.dir = facingOf(direction.x, direction.y);

  const stepBefore = Math.floor(player.step);
  player.step += dt * (game.run.running ? 11 : 7) * (mount > 1 ? 1.3 : 1);
  if (Math.floor(player.step) !== stepBefore && Math.floor(player.step) % 2 === 0) {
    dust(game, player.x, player.y);
    cue(game, 'step');
    const under = tileAt(player.x, player.y);
    const wet = game.weather && (game.weather.kind === 'rain' || game.weather.kind === 'storm');
    if (under === TILE.SAND || biomeAt(player.x, player.y) === 'mountain' || wet) {
      addTrack(game, player.x, player.y, direction.x, direction.y, mount > 1 ? 'hoof' : 'foot');
    }
  }
}

// ---------- Stairs, doors, boats: going somewhere else ----------

// The hero arrives somewhere else: the screen fades, the companions follow, the monsters around are forgotten.
export function travelTo(game, x, y) {
  game.player.x = x;
  game.player.y = y;
  game.run.fadeUntil = Date.now() + FADE;
  game.run.followers = [];
  game.run.safeUntil = Date.now() + 1500;
  game.run.monsters = game.run.monsters.filter((monster) => monster.key || monster.raid);
}

// Stepping on stairs takes the hero to the other side (once: they must step off before taking them again).
function takeStairs(game) {
  if (exitVisitedHouseIfStairs(game, travelTo)) return;
  const player = game.player;
  const key = Math.floor(player.x) + ',' + Math.floor(player.y);
  const link = tileAt(player.x, player.y) === TILE.STAIRS ? linkAt(player.x, player.y) : null;
  if (!link) {
    game.run.lastLink = null;
    return;
  }
  if (game.run.lastLink === key) return;
  travelTo(game, link.x, link.y);
  game.run.lastLink = Math.floor(link.x) + ',' + Math.floor(link.y);
  cue(game, 'step');
}

// Entering a new zone: it is remembered (for the map and the quests). Entering a village saves the game.
function noticeZone(game) {
  const zone = zoneAt(game.player.x, game.player.y);
  if (zone.id === game.run.zoneId) return;
  const isArriving = game.run.zoneId !== null; // not the first frame after loading
  game.run.zoneId = zone.id;
  game.visited[zone.id] = true;
  if (zone.dungeon) game.visited[zone.dungeon] = true;
  if (isArriving && zone.kind === 'village') saveGame(game);
  if (isArriving && zone.kind === 'inside' && zone.name) notify(game, zone.name, '#c9d1e0');
}

// ---------- The action button ----------

function isAtHomeDoor(player) {
  const front = frontTile(player);
  return front.x === HOME_DOOR.x && front.y === HOME_DOOR.y;
}

function enterHome(game) {
  const link = linkAt(HOME_DOOR.x, HOME_DOOR.y);
  travelTo(game, link.x, link.y);
  game.run.lastLink = Math.floor(link.x) + ',' + Math.floor(link.y);
}

function goToBed(game) {
  if (game.raid.active) {
    notify(game, 'You can not sleep: the village is under attack!', '#ff6060');
    return;
  }
  sleepUntilMorning(game);
  saveGame(game);
  notify(game, '💤 You slept well. HP and mana are full. (You wake up hungry.)', '#9fd8ff');
}

// The prop of a kind near the hero (within `range` tiles of its middle), or null.
function propNear(game, kinds, range) {
  return propsAround(game.player.x, game.player.y, range).find((prop) => kinds.includes(prop.kind)) || null;
}

function offerBed(game) {
  say(game, null, ['Your bed. The sheets smell of sun.'], [
    { label: 'Sleep until morning', icon: 'sleep', run: () => goToBed(game) },
    { label: 'Change the color of the walls', icon: 'options', run: () => nextWallColor(game) },
    { label: 'Change the color of the bed', icon: 'options', run: () => nextBedColor(game) },
    { label: 'Not now', run: () => {} },
  ]);
}

// A piece of furniture of the home goes back to the bag (and the floor is free again).
function pickUpAndRefresh(game, piece) {
  pickUpFurniture(game, piece);
  refreshWorld(game);
}

function talkToVillager(game, villager) {
  const words = villager.working ? 'Hard work today. ' : 'Hello, traveler. ';
  say(game, null, [villager.name + ': "' + words + villageNews(game, villager.village) + '"']);
}

// What the action button does here: the first thing that applies, from the most important.
// Each one is { when: () => boolean, icon, run }.
function actionsOf(game) {
  const player = game.player;
  const front = frontTile(player);
  const atHome = isAtHome(game);
  return [
    { when: () => player.carrying !== null, icon: 'people', run: () => putDown(game) },
    { when: () => personNear(game), icon: 'talk', run: () => talkTo(game, personNear(game)) },
    { when: () => knockedOutNear(game), icon: 'people', run: () => carry(game, knockedOutNear(game)) },
    ...actionsOfIsekai(game),
    ...actionsOfWar(game),
    ...actionsOfParties(game),
    ...actionsOfBonds(game),
    ...actionsOfSociety(game),
    ...actionsOfCamp(game),
    ...actionsOfStructures(game),
    { when: () => kidNear(game) !== null, icon: 'people', run: () => talkToKid(game, kidNear(game)) },
    { when: () => villagerNear(game), icon: 'talk', run: () => talkToVillager(game, villagerNear(game)) },
    { when: () => isAtHomeDoor(player), icon: 'quit', run: () => enterHome(game) },
    ...actionsOfGuildHall(game),
    ...actionsOfHouses(game, travelTo),
    { when: () => atHome && furnitureAt(game, front.x, front.y), icon: 'inventory', run: () => pickUpAndRefresh(game, furnitureAt(game, front.x, front.y)) },
    { when: () => atHome && propNear(game, ['bed'], 2.2), icon: 'sleep', run: () => offerBed(game) },
    { when: () => atHome && propNear(game, ['storage'], 1.5), icon: 'chest', run: () => openStorage(game) },
    { when: () => portNear(game), icon: 'map', run: () => offerSail(game, portNear(game), travelTo) },
    { when: () => fireToCookNear(game), icon: 'roastMeat', run: () => offerCooking(game) },
    { when: () => wordDoorAt(game, front.x, front.y), icon: 'book', run: () => openWordDoor(game, wordDoorAt(game, front.x, front.y), () => refreshWorld(game)) },
    { when: () => obeliskNear(game), icon: 'book', run: () => readObelisk(game, obeliskNear(game)) },
    { when: () => boulderPuzzleAt(game, front.x, front.y), icon: 'dots', run: () => offerBoulderReset(game, boulderPuzzleAt(game, front.x, front.y), () => refreshWorld(game)) },
    { when: () => propNear(game, ['dummy'], 1.6), icon: 'woodSword', run: () => practiceAtDummy(game) },
    { when: () => chestNear(game), icon: 'chest', run: () => openChest(game, chestNear(game)) },
    { when: () => isSoil(player.x, player.y), icon: 'carrot', run: () => workField(game, player.x, player.y) },
    { when: () => isSoil(front.x, front.y), icon: 'carrot', run: () => workField(game, front.x, front.y) },
    { when: () => canRefill(game, front), icon: 'water', run: () => refill(game) },
    { when: () => canGather(game, front.x, front.y), icon: canGather(game, front.x, front.y), run: () => gather(game, front.x, front.y) },
    { when: () => harvestableNear(game) !== null, icon: harvestableNear(game)?.icon || 'apple', run: () => harvestProp(game, harvestableNear(game).prop) },
    { when: () => wildAnimalNear(game) !== null && HOSTILE_WILDLIFE.has(wildAnimalNear(game).kind), icon: 'sword', run: () => strikeWorld(game) },
    { when: () => wildAnimalNear(game) !== null, icon: 'people', run: () => notify(game, '🐾 You gently petted the ' + petWildAnimal(game, wildAnimalNear(game)) + '!', '#ffadd0') },
    { when: () => zoneAt(front.x, front.y).kind !== 'inside', icon: 'dig', run: () => dig(game, front.x, front.y) },
    { when: () => true, icon: 'dots', run: () => {} },
  ];
}

// The action button does the most useful thing where the hero stands.
export function act(game) {
  actionsOf(game)
    .find((action) => action.when())
    .run();
}

// What the action button would do right now: the name of its icon (see draw/icons.js).
export function actionIcon(game) {
  return actionsOf(game).find((action) => action.when()).icon;
}

// ---------- The frame ----------

// The first night in the dark: how to light the torch.
function explainTheDark(game) {
  if (game.flags.dark || !isNight(game) || hasLight(game)) return;
  game.flags.dark = true;
  say(game, null, [
    'The night falls on you like a blanket. You can barely see your hands.',
    'Luckily, you have a torch. Light it with T (or tap the torch on the screen). It burns about 5 minutes.',
    'Under the sky, the rain and a strong wind put the flame out: you will have to wait for them to stop.',
  ]);
}

// Things that do not need to run at every frame.
function slowUpdates(game, dt) {
  game.run.storyTime += dt;
  if (game.run.storyTime >= 1) {
    game.run.storyTime = 0;
    updateStory(game);
    explainTheDark(game);
    removeOldToasts(game);
    exploreAround(game);
    wakeVillages(game);
    updateVillagerLife(game);
    wakeAnimals(game);
    checkRescue(game);
    checkKnockedOut(game);
    slowWar(game);
    slowSociety(game);
    slowCamp(game);
    slowBonds(game);
    slowSparring(game);
    slowIsekai(game);
    updateIsekaiStructures(game);
    syncWorldParties(game);
    slowEconomy(game);
    updateBorders(game);
    if (game.player.health <= 0 && !game.run.fight && game.run.screen === 'play') {
      knockOut(game);
    }
  }
  game.run.saveTime += dt;
  if (game.run.saveTime >= SAVE_EVERY) {
    game.run.saveTime = 0;
    saveGame(game);
  }
}

// dt: seconds since the last frame.
export function updateGame(game, input, dt) {
  if (game.run.partyRaid && !game.run.fight) onFightEndParties(game, game.run.partyRaid.fight);
  advanceClock(game, dt);
  walk(game, input, dt);
  takeStairs(game);
  noticeZone(game);
  updatePeople(game, dt);
  updateVillagers(game, dt);
  updateAnimals(game, dt);
  updateFollowers(game, dt);
  updateMonsters(game, dt);
  updatePowers(game, dt);
  updateGuildHall(game, dt);
  updateRaid(game, dt);
  updateWeather(game, dt);
  updateIsekai(game, dt);
  updateEncounters(game, dt);
  updateWar(game, dt);
  updateSociety(game, dt);
  updateCamp(game, dt);
  updateBonds(game, dt);
  updateWorldParties(game, dt);
  updateEconomy(game, dt);
  slowUpdates(game, dt);
}

// Runs even when a menu or a fight is open: the particles keep flying.
export function updateEffects(game, dt) {
  updateParticles(game, dt);
}
