import { zoneAt, HOME_DOOR, WORLD_SIZE } from '../data/zones';
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
import { isAtHome, furnitureAt, pickUpFurniture, openStorage, nextWallColor, nextBedColor, isNearLetterbox } from './home';
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
import { wallRepairSpotNear, applyWallRenovation } from './walls';
import { countItem, removeItem, gainXp } from './player';
import { addHappiness } from './village';
import { knockOut } from './death';
import { ensureIsekaiTodo } from './isekaiTodo/state';
import { isLevitating, spiritLocations, talkToSpirit } from './isekaiTodo/magicPlus';
import { nearIntelligentMonster, interactIntelligentMonster, tickEmissaries } from './isekaiTodo/monstersPlus';
import { canOpenSecretFloor, trySecretFloorRiddle } from './isekaiTodo/dungeonsPlus';
import { courierNear, deliverCourierMail, tickCourierMessenger, deliveredLettersList, readPart6Letter, checkEpisodeProgression, syncWeeklyChallenge, refreshDailyLetters } from './isekaiTodo/socialPlus';
import { ensureRealism, isTierEnabled } from './realism/state';
import { bodySpeedMultiplier, canSprintBody, applySleepQualityRecovery } from './realism/bodyHealth';
import { trackFootstepsRealism, terrainSpeedMultiplier } from './realism/foodAndNature';
import { maybeTriggerEarthDream } from './realism/englishWorld';
import { checkDungeonSalvageFee } from './realism/financeAndLaw';
import { disarmDungeonTrapQuick } from './realism/magicPhysics';
import { activeShrineBlessing, tryRecoverLostBag } from './realism/socialAndCodex';

// One step of the world. Called at every frame while the player is on the map.

const WALK_SPEED = 4.2; // tiles per second (base walking speed)
const RUN_SPEED = 8.8; // ...and runs (Shift, or the stick pushed to its edge)
const MAX_MOVE_STEP = 0.25; // max tiles per collision sub-step
const BODY = 0.28; // half the width of the hero, in tiles (to not walk into the walls)
const SAVE_EVERY = 10; // seconds
const FADE = 350; // milliseconds: the screen goes black when the hero takes stairs

// ---------- Walking ----------

// Is the hero's body (a small square around x, y) free of walls and of closed seals?
// Flying Mount soars freely outdoors across terrain; Levitate crosses water & lava smoothly.
function canStand(game, x, y) {
  const flying = Boolean(ensureIsekaiTodo(game).flyingMount?.riding);
  if (flying) {
    if (x < 2 || y < 2 || x > WORLD_SIZE - 2 || y > WORLD_SIZE - 2) return false;
  }
  const corners = [
    [x - BODY, y - BODY],
    [x + BODY, y - BODY],
    [x - BODY, y + BODY],
    [x + BODY, y + BODY],
  ];
  const seal = corners.map(([cx, cy]) => closedSealAt(game, cx, cy)).find((found) => found);
  if (seal) explainSeal(game, seal);
  if (seal) return false;
  if (flying) return true;
  const levitating = isLevitating(game);
  return corners.every(([cx, cy]) => {
    if (!isSolid(cx, cy)) return true;
    if (!levitating) return false;
    const t = tileAt(cx, cy);
    return t === TILE.WATER || t === TILE.LAVA;
  });
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
  game.run.running = enc.canSprint && canSprintBody(game) && isRunning(input);
  const flying = Boolean(ensureIsekaiTodo(game).flyingMount?.riding);
  const mount = flying ? 1.75 : ridingSpeedMultiplier(game);
  const shrineWind = game?.realism && activeShrineBlessing(game)?.id === 'wind' ? 1.15 : 1;
  const bodyTerrain = game?.realism ? bodySpeedMultiplier(game) * terrainSpeedMultiplier(game) * shrineWind : 1;
  const distance = (game.run.running ? RUN_SPEED : WALK_SPEED) * mount * enc.speedMult * bodyTerrain * (Date.now() < game.run.dashUntil ? 2 : 1) * dt;
  const steps = Math.max(1, Math.ceil(distance / MAX_MOVE_STEP));
  const stepDist = distance / steps;
  for (let i = 0; i < steps; i++) {
    if (canStand(game, player.x + direction.x * stepDist, player.y)) player.x += direction.x * stepDist;
    else if (direction.y === 0 && i === 0) tryPush(game, direction.x, 0);
    if (canStand(game, player.x, player.y + direction.y * stepDist)) player.y += direction.y * stepDist;
    else if (direction.x === 0 && i === 0) tryPush(game, 0, direction.y);
  }
  if (game?.realism) trackFootstepsRealism(game, distance);
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
  const prevZoneId = game.run.zoneId;
  game.run.zoneId = zone.id;
  game.visited[zone.id] = true;
  if (zone.dungeon) game.visited[zone.dungeon] = true;
  if (isArriving && game?.realism) {
    const r = ensureRealism(game);
    if (zone.kind === 'floor' && isTierEnabled(game, 'B') && !r.combatRealism.disarmedTraps[zone.id]) {
      r.combatRealism.trappedFloor[zone.id] = true;
    }
    if (prevZoneId && zone.kind !== 'floor' && prevZoneId.includes('_f')) {
      checkDungeonSalvageFee(game, prevZoneId);
    }
  }
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
  if (game?.realism) {
    applySleepQualityRecovery(game, 'home');
    maybeTriggerEarthDream(game);
  }
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

function offerWallRenovation(game, spot) {
  const { village, letter, hp, max } = spot;
  const needMat = letter === 'w' && hp >= max ? { id: 'stone', qty: 2, fee: 20, desc: 'Upgrade wood palisade to Stone Wall' } : { id: 'firewood', qty: 2, fee: 12, desc: letter === '-' ? 'Close wall gap with Palisade' : 'Repair damaged wall section' };
  const matBranches = countItem(game.player, 'branch') >= 4;
  const hasMat = countItem(game.player, needMat.id) >= needMat.qty;
  const finish = () => {
    const res = applyWallRenovation(game, spot);
    refreshWorld(game);
    gainXp(game, 14);
    addHappiness(game, 2);
    cue(game, 'victory');
    notify(game, '🧱 Wall ' + res + ' in ' + village.name + '! (' + (game.counts.wallsRepaired || 1) + ' renovated)', '#7cfc9a');
  };
  const choices = [];
  if (hasMat) {
    choices.push({ label: needMat.desc + ' (' + needMat.qty + ' ' + needMat.id + ')', icon: 'logs', run: () => { removeItem(game.player, needMat.id, needMat.qty); finish(); } });
  } else if (matBranches && needMat.id === 'firewood') {
    choices.push({ label: needMat.desc + ' (4 branch)', icon: 'logs', run: () => { removeItem(game.player, 'branch', 4); finish(); } });
  }
  choices.push({
    label: needMat.desc + ' (' + needMat.fee + ' Lexis materials)',
    icon: 'lexis',
    run: () => {
      if (game.player.lexis < needMat.fee) return say(game, null, ['Need ' + needMat.fee + ' Lexis (or bring timber/stone) to renovate this wall.']);
      game.player.lexis -= needMat.fee;
      finish();
    },
  });
  choices.push({ label: 'Step back', run: () => {} });
  say(game, null, [village.name + ' Wall (Section #' + (spot.section + 1) + ' · ' + Math.round(hp) + '/' + max + ' HP).'], choices);
}

function talkToVillager(game, villager) {
  const words = villager.working ? 'Hard work today. ' : 'Hello, traveler. ';
  say(game, null, [villager.name + ': "' + words + villageNews(game, villager.village) + '"']);
}

function nearbySpiritSpot(game) {
  const { x, y } = game.player;
  return spiritLocations().find((sp) => Math.hypot(sp.x - x, sp.y - y) < 2.2) || null;
}

function openHomeLetterbox(game) {
  refreshDailyLetters(game);
  const letters = deliveredLettersList(game);
  if (letters.length === 0) {
    say(game, null, ['Your wooden letterbox is empty right now. Couriers deliver fresh dispatches at sunrise.']);
    return;
  }
  const choices = letters.slice(0, 4).map((mail) => ({
    label: (mail.replied ? '✓ ' : '✉️ ') + mail.subject + ' (' + mail.sender + ')',
    icon: 'mail',
    run: () => readPart6Letter(game, mail.id),
  }));
  say(game, null, ['Home Letterbox (' + letters.filter((l) => !l.read).length + ' unread)'], [...choices, { label: 'Close', run: () => {} }]);
}

// What the action button does here: the first thing that applies, from the most important.
// Each one is { when: () => boolean, icon, run }.
function actionsOf(game) {
  const player = game.player;
  const front = frontTile(player);
  const atHome = isAtHome(game);
  const curZone = zoneAt(player.x, player.y);
  const r = game?.realism ? ensureRealism(game) : null;
  const nearLostBag = Boolean(
    r?.world?.lastDeathPos && r?.world?.lastDeathBag && Math.hypot(r.world.lastDeathPos.x - player.x, r.world.lastDeathPos.y - player.y) < 1.8
  );
  const nearTrap = Boolean(
    r && curZone.kind === 'floor' && r.combatRealism?.trappedFloor?.[curZone.id] && !r.combatRealism?.disarmedTraps?.[curZone.id]
  );
  return [
    { when: () => nearLostBag, icon: 'travelerPack', run: () => tryRecoverLostBag(game) },
    { when: () => nearTrap, icon: 'lockpick', run: () => disarmDungeonTrapQuick(game, curZone.id) },
    { when: () => player.carrying !== null, icon: 'people', run: () => putDown(game) },
    { when: () => courierNear(game) !== null, icon: 'mail', run: () => deliverCourierMail(game) },
    { when: () => nearIntelligentMonster(game) !== null, icon: 'talk', run: () => interactIntelligentMonster(game, nearIntelligentMonster(game)) },
    { when: () => nearbySpiritSpot(game) !== null, icon: 'powers', run: () => talkToSpirit(game, nearbySpiritSpot(game).id) },
    { when: () => isNearLetterbox(game), icon: 'mail', run: () => openHomeLetterbox(game) },
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
    { when: () => zoneAt(player.x, player.y).kind === 'inside' && canOpenSecretFloor(game, zoneAt(player.x, player.y).dungeon) && propNear(game, ['wallTorch'], 2.0), icon: 'book', run: () => trySecretFloorRiddle(game, zoneAt(player.x, player.y).dungeon) },
    { when: () => obeliskNear(game), icon: 'book', run: () => readObelisk(game, obeliskNear(game)) },
    { when: () => boulderPuzzleAt(game, front.x, front.y), icon: 'dots', run: () => offerBoulderReset(game, boulderPuzzleAt(game, front.x, front.y), () => refreshWorld(game)) },
    { when: () => propNear(game, ['dummy'], 1.6), icon: 'woodSword', run: () => practiceAtDummy(game) },
    { when: () => chestNear(game), icon: 'chest', run: () => openChest(game, chestNear(game)) },
    { when: () => wallRepairSpotNear(game) !== null, icon: 'shield', run: () => offerWallRenovation(game, wallRepairSpotNear(game)) },
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
    syncWeeklyChallenge(game);
    checkEpisodeProgression(game);
    const rSlow = game?.realism ? ensureRealism(game) : null;
    if (rSlow?.world?.lastDeathPos && rSlow?.world?.lastDeathBag && Math.hypot(rSlow.world.lastDeathPos.x - game.player.x, rSlow.world.lastDeathPos.y - game.player.y) <= 1.2) {
      tryRecoverLostBag(game);
    }
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
  tickEmissaries(game, dt);
  tickCourierMessenger(game, dt);
  slowUpdates(game, dt);
}

// Runs even when a menu or a fight is open: the particles keep flying.
export function updateEffects(game, dt) {
  updateParticles(game, dt);
}
