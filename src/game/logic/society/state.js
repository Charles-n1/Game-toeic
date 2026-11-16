import { VILLAGES, villageOf, isInsideWorld } from '../../data/zones';
import { CAVES } from '../../world/wildPlaces';
import { SOCIETY_SENTENCES } from '../../data/sentences/society';
import { BLOCK, BLOCKS } from '../explore';
import { gameHours } from '../boosts';
import { startFight } from '../fight';
import { monsterCategory } from '../learning';
import { earnLexis, gainXp, addItem } from '../player';
import { addHappiness } from '../village';
import { notify, say } from '../messages';
import { burst, floatText, bloodSplatter } from '../particles';
import { cue } from '../cues';
import { pickRandom } from '../../../logic/random';

// Saved state and shared helpers for village society, infamy, riding, festivals, and cave secrets.

export function firstSociety() {
  return {
    infamy: 0,
    knownCrystalCaves: [],
    riding: { active: false, hunger: 0, color: 'bay', warned: 0, starveSec: 0 },
    parkedHorse: null,
    statuesUsed: [],
    bounties: {},
    freedSlaves: 0,
    cagesFreed: {},
    extortedToday: {},
    bribedToday: {},
    deals: {},
    feastActive: {},
    stolenSpots: {},
    enigmaDone: {},
    disaster: null,
    nextDisasterDay: 5,
    horsesOwned: 0,
    healedAtHospital: 0,
  };
}

// Backfills missing fields on old saves and initializes transient runtime lists.
export function ensureSociety(game) {
  if (!game.society) game.society = firstSociety();
  const s = game.society;
  if (typeof s.infamy !== 'number') s.infamy = 0;
  if (!Array.isArray(s.knownCrystalCaves)) s.knownCrystalCaves = [];
  if (!s.riding) s.riding = { active: false, hunger: 0, color: 'bay', warned: 0, starveSec: 0 };
  if (s.parkedHorse === undefined) s.parkedHorse = null;
  if (!Array.isArray(s.statuesUsed)) s.statuesUsed = [];
  if (!s.bounties) s.bounties = {};
  if (typeof s.freedSlaves !== 'number') s.freedSlaves = 0;
  if (!s.cagesFreed) s.cagesFreed = {};
  if (!s.extortedToday) s.extortedToday = {};
  if (!s.bribedToday) s.bribedToday = {};
  if (!s.deals) s.deals = {};
  if (!s.feastActive) s.feastActive = {};
  if (!s.stolenSpots) s.stolenSpots = {};
  if (!s.enigmaDone) s.enigmaDone = {};
  if (s.disaster === undefined) s.disaster = null;
  if (typeof s.nextDisasterDay !== 'number') s.nextDisasterDay = 5;
  if (typeof s.horsesOwned !== 'number') s.horsesOwned = 0;
  if (typeof s.healedAtHospital !== 'number') s.healedAtHospital = 0;
  ensureRun(game);
  return s;
}

export function ensureRun(game) {
  if (!game.run) return;
  if (!Array.isArray(game.run.merchantHorses)) game.run.merchantHorses = [];
  if (!Array.isArray(game.run.slaveTraders)) game.run.slaveTraders = [];
  if (!Array.isArray(game.run.fireworks)) game.run.fireworks = [];
  if (typeof game.run.guardCooldownUntil !== 'number') game.run.guardCooldownUntil = 0;
  if (game.run.societyFight === undefined) game.run.societyFight = null;
}

export function isVillain(game) {
  return (ensureSociety(game).infamy || 0) >= 30;
}

export function addInfamy(game, amount) {
  const s = ensureSociety(game);
  const wasVillain = s.infamy >= 30;
  s.infamy = Math.max(0, Math.min(100, s.infamy + amount));
  if (!wasVillain && s.infamy >= 30) {
    cue(game, 'alarm');
    notify(game, '☠️ Infamy ' + s.infamy + ': You are now a feared Villain! Guards will hunt you.', '#ff6060');
  } else if (wasVillain && s.infamy < 30) {
    notify(game, '🕊️ Infamy lowered to ' + s.infamy + '. Villagers no longer call you a villain.', '#7cfc9a');
  }
  return s.infamy;
}

export function villageState(game, villageId) {
  return villageId && game.villages ? game.villages[villageId] || null : null;
}

export function changeVillageMood(game, villageId, delta) {
  const state = villageState(game, villageId);
  if (!state) return;
  state.mood = Math.max(0, Math.min(100, Math.round((state.mood ?? 50) + delta)));
}

export function isFestivalActive(game, villageId) {
  if (!villageId || !game || !game.villages) return false;
  const state = game.villages[villageId];
  if (!state || state.owner !== 'people') return false;
  const s = ensureSociety(game);
  return s.feastActive[villageId] === game.day || game.day >= state.feast;
}

// Multiplier for village trade & services (mood, infamy, festival -25%, negotiated deal).
export function villagePriceMultiplier(game, villageId) {
  const s = ensureSociety(game);
  const state = villageState(game, villageId);
  const mood = state ? state.mood : 50;
  const moodFactor = 1.2 - mood * 0.004;
  const infamy = s.infamy || 0;
  const infamyFactor = infamy >= 30 ? 1 + Math.min(0.6, infamy * 0.012) : infamy >= 10 ? 1 + infamy * 0.006 : 1;
  const festivalFactor = isFestivalActive(game, villageId) ? 0.75 : 1;
  const deal = s.deals[villageId];
  const dealFactor = deal && deal.day === game.day ? deal.factor : 1;
  return Math.max(0.45, Number((moodFactor * infamyFactor * festivalFactor * dealFactor).toFixed(3)));
}

// Riding speed multiplier: ~1.8x when fed, dropping smoothly to ~1.05x when starving.
export function ridingSpeedMultiplier(game) {
  if (!game || !game.player || isInsideWorld(game.player.y)) return 1;
  const riding = ensureSociety(game).riding;
  if (!riding || !riding.active) return 1;
  const hunger = Math.max(0, Math.min(100, riding.hunger || 0));
  if (hunger <= 20) return 1.8;
  if (hunger < 95) return Number((1.8 - ((hunger - 20) / 75) * 0.7).toFixed(2));
  return 1.05;
}

function compassDirection(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const ns = dy < -40 ? 'north' : dy > 40 ? 'south' : '';
  const ew = dx < -40 ? 'west' : dx > 40 ? 'east' : '';
  return [ns, ew].filter(Boolean).join('-') || 'nearby';
}

function revealOnMap(game, x, y) {
  if (typeof game.explored !== 'string') return;
  const bx = Math.floor(x / BLOCK);
  const by = Math.floor(y / BLOCK);
  const cells = [...game.explored];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tx = bx + dx;
      const ty = by + dy;
      if (tx >= 0 && ty >= 0 && tx < BLOCKS && ty < BLOCKS) cells[ty * BLOCKS + tx] = '1';
    }
  }
  game.explored = cells.join('');
}

// Smiths reveal one hidden crystal cave to the hero and mark it on the map.
export function revealCrystalCave(game, smithName = 'The blacksmith') {
  const s = ensureSociety(game);
  const unknown = CAVES.filter((cave) => cave.crystals && !s.knownCrystalCaves.includes(cave.id));
  if (unknown.length === 0) {
    notify(game, '💎 ' + smithName + ': You already know all the crystal caves!', '#8fd6ff');
    return null;
  }
  const cave = unknown.reduce((best, item) => {
    const far = Math.hypot(item.x - game.player.x, item.y - game.player.y);
    return far < best.far ? { cave: item, far: far } : best;
  }, { cave: unknown[0], far: Infinity }).cave;
  s.knownCrystalCaves.push(cave.id);
  const spotX = cave.door ? cave.door[0] : cave.x + cave.w / 2;
  const spotY = cave.door ? cave.door[1] : cave.y + cave.h / 2;
  revealOnMap(game, spotX, spotY);
  const dir = compassDirection(game.player, { x: spotX, y: spotY });
  cue(game, 'blessing');
  notify(game, '💎 ' + smithName + ' revealed ' + cave.name + ' (' + dir + ') on your map!', '#8fd6ff');
  return cave;
}

// Starts a real combat encounter (not a word duel) and registers its society outcome handler.
export function startSocietyFight(game, opponent, meta) {
  ensureSociety(game);
  const foe = {
    tier: 'small',
    tag: 'normal',
    category: monsterCategory(game),
    magicAttack: 0,
    resistance: 0.1,
    magicResistance: 0.1,
    drops: [],
    ...opponent,
    societyMeta: meta,
  };
  if (!game.run.questions || game.run.questions.length === 0) foe.questions = SOCIETY_SENTENCES;
  startFight(game, foe);
  game.run.societyFight = { fight: game.run.fight, meta: meta };
}

function handleSlaveTraderEnd(game, fight, meta) {
  const s = ensureSociety(game);
  if (fight.phase !== 'won') {
    say(game, null, ['The slave trader laughs and rattles the cage keys. Come back stronger.']);
    return;
  }
  s.cagesFreed[meta.cageKey] = game.day;
  game.run.slaveTraders = game.run.slaveTraders.filter((trader) => trader.cageKey !== meta.cageKey);
  s.freedSlaves += 1;
  addInfamy(game, -15);
  addHappiness(game, 6);
  changeVillageMood(game, meta.villageId, 8);
  const gift = pickRandom(['oldCoin', 'horseFeed', 'rareSpice', 'gem']);
  earnLexis(game, 35);
  addItem(game.player, gift);
  gainXp(game, 40);
  cue(game, 'cageBreak');
  burst(game, game.player.x, game.player.y, '#ffd23f', 24);
  say(game, null, ['You beat the slave trader and smash the iron cage open!', 'The prisoner sprints to freedom! +35 Lexis, +40 XP, and a grateful gift.']);
}

function handleTownFightEnd(game, fight, meta) {
  const villager = game.run.villagers.find((item) => item.id === meta.villagerId);
  game.run.guardCooldownUntil = Date.now() + 12000;
  if (villager) villager.fighting = false;
  if (fight.phase === 'won') {
    if (villager) {
      villager.ko = { wakeAtHour: gameHours(game) + 3 };
      villager.angry = 0;
    }
    if (meta.role === 'villager') {
      addInfamy(game, 8);
      changeVillageMood(game, meta.villageId, -8);
      addHappiness(game, -3);
      for (const guard of game.run.villagers) {
        if (guard.village === meta.villageId && guard.knight && !guard.ko && !guard.dead) guard.angry = 60;
      }
      notify(game, '⚔️ You knocked out ' + (meta.name || 'the villager') + '! Town knights are alerted!', '#ff6060');
    } else {
      addInfamy(game, 10);
      changeVillageMood(game, meta.villageId, -6);
      earnLexis(game, 25);
      floatText(game, game.player.x, game.player.y - 0.6, '+25 Lexis', '#ffd23f');
      notify(game, '⚔️ You defeated the town guard! Infamy rose.', '#ffb070');
    }
  } else if (fight.phase === 'fled' && villager) {
    villager.angry = 20;
  } else if (villager) {
    villager.angry = 0;
  }
}

function handleBanditChiefEnd(game, fight, meta) {
  const s = ensureSociety(game);
  if (fight.phase !== 'won') {
    say(game, null, [meta.chiefName + ': "Get out of our camp before we lock you in the cage!"']);
    return;
  }
  let updatedBounty = false;
  for (const bounty of Object.values(s.bounties)) {
    if (bounty.active && !bounty.done && bounty.kind === 'bandit' && bounty.clanId === meta.clanId) {
      bounty.have = bounty.need;
      updatedBounty = true;
    }
  }
  addInfamy(game, -10);
  addHappiness(game, 4);
  earnLexis(game, 75);
  addItem(game.player, pickRandom(['rareSpice', 'oldCoin', 'decorBanner']));
  gainXp(game, 60);
  cue(game, 'cageBreak');
  burst(game, game.player.x, game.player.y, '#ffd23f', 28);
  const note = updatedBounty ? ' Your Bandit Bounty is ready to turn in at any village board!' : ' Take a bounty notice at a village board next time too!';
  say(game, null, [meta.chiefName + ' falls and the bandits scatter! +75 Lexis, +60 XP.' + note]);
}

function handleCaravanPlunderEnd(game, fight, meta) {
  if (fight.phase !== 'won') return;
  const horse = (game.run.merchantHorses || []).find((h) => h.id === meta.horseId);
  if (horse) {
    horse.plundered = true;
    bloodSplatter(game, horse.x, horse.y, 12);
  } else {
    bloodSplatter(game, game.player.x + 1, game.player.y, 12);
  }
  const lexis = 30 + Math.floor(Math.random() * 25);
  earnLexis(game, lexis);
  addItem(game.player, 'mysteryCrate', 1);
  if (Math.random() < 0.4) addItem(game.player, 'mysteryRelic', 1);
  addInfamy(game, 20);
  if (meta.destVillageId) changeVillageMood(game, meta.destVillageId, -8);
  cue(game, 'victory');
  burst(game, game.player.x, game.player.y, '#ffd23f', 22);
  notify(game, '🏴‍☠️ Plundered the merchant wagon! Found Mystery Supply Crate & +' + lexis + ' Lexis (+20 Infamy)!', '#ff8a3d');
}

// Called when a combat fight started by society.js finishes (by integration or next-frame check).
export function onFightEndSociety(game, fight) {
  if (!fight || fight._societyHandled) return;
  const meta = (fight.opponent && fight.opponent.societyMeta) || (game.run.societyFight && game.run.societyFight.meta);
  if (!meta) return;
  fight._societyHandled = true;
  game.run.societyFight = null;
  if (meta.kind === 'slaveTrader') handleSlaveTraderEnd(game, fight, meta);
  else if (meta.kind === 'townFight') handleTownFightEnd(game, fight, meta);
  else if (meta.kind === 'banditChief') handleBanditChiefEnd(game, fight, meta);
  else if (meta.kind === 'roadPlunder') handleCaravanPlunderEnd(game, fight, meta);
}

export function activeVillageNamesSummary(game) {
  return VILLAGES.filter((v) => isFestivalActive(game, v.id)).map((v) => v.name);
}

export { villageOf };
