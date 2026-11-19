import { MONSTER_RANKS, INTELLIGENT_MONSTERS, DEMON_EMISSARIES, ACHIEVEMENTS } from '../../data/isekaiTodo';
import { SPECIES } from '../../data/monsters';
import { ITEMS } from '../../data/items';
import { VILLAGES, villageOf, zoneAt } from '../../data/zones';
import { TILE, isSolid, tileAt, biomeAt } from '../../world/map';
import { ensureIsekaiTodo } from './state';
import { countItem, addItem, removeItem, earnLexis, gainXp } from '../player';
import { makeMonster } from '../monsters';
import { startFight } from '../fight';
import { maxPartySize } from '../guild/ranks';
import { pushBackDoom } from '../war/demonThreat';
import { isOnSilentIsle, deepIslePlaces } from '../war/demonLand';
import { say, notify } from '../messages';
import { burst, floatText, spawnRing } from '../particles';
import { cue } from '../cues';

// Monster Ranks (F-S), Monster Taming, Flying Mount (Griffin/Wyvern),
// Intelligent Monster Diplomacy/Recruitment, and Demon King Emissary Clans.

const MAX_TAMED = 8;
const OPEN_LAND_TILES = new Set([TILE.GRASS, TILE.FLOWER, TILE.PATH, TILE.SAND, TILE.STONE, TILE.ASH]);
const BLOCKED_TOWN_KINDS = new Set(['inside', 'village', 'monsterTown', 'camp', 'dungeon', 'castle']);
const LAND_BODY = 0.28;
const INTELLIGENT_CACHE = {};

function ensureRun(game) {
  if (!game.run || typeof game.run !== 'object') game.run = {};
  if (!Array.isArray(game.run.toasts)) game.run.toasts = [];
  if (!Array.isArray(game.run.particles)) game.run.particles = [];
  if (!Array.isArray(game.run.cues)) game.run.cues = [];
  if (!Array.isArray(game.run.waitingDialogs)) game.run.waitingDialogs = [];
  if (!Array.isArray(game.run.monsters)) game.run.monsters = [];
  if (!Array.isArray(game.run.emissaries)) game.run.emissaries = [];
  return game.run;
}

function grantAchievement(game, achId) {
  const st = ensureIsekaiTodo(game);
  if (st.achievements[achId]) return false;
  st.achievements[achId] = { day: game.day || 1, claimed: false };
  const ach = ACHIEVEMENTS.find((entry) => entry.id === achId);
  if (ach) notify(game, '🏆 Achievement Unlocked: ' + ach.icon + ' ' + ach.name + '!', '#ffd23f');
  return true;
}

function rankEntry(rankLetter) {
  return MONSTER_RANKS.find((r) => r.rank === rankLetter) || MONSTER_RANKS[0];
}

function findOpenLandSpot(startX, startY, maxRadius = 28) {
  const bx = Math.floor(startX);
  const by = Math.floor(startY);
  for (let r = 0; r <= maxRadius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const tx = bx + dx + 0.5;
        const ty = by + dy + 0.5;
        if (!isSolid(tx, ty) && zoneAt(tx, ty).kind === 'land') return { x: tx, y: ty };
      }
    }
  }
  return null;
}

// ---------- Monster Ranks (F to S) ----------

/** Classifies a monster into F..S rank returning { rank, color, label } from MONSTER_RANKS. */
export function monsterRankInfo(monster) {
  if (!monster) return rankEntry('F');
  const sp = monster.species || '';
  if (sp === 'king' || sp === 'queen' || monster.emissary || monster.emissaryId) {
    return rankEntry('S');
  }
  if (
    monster.tag === 'extreme' ||
    (monster.boss && ['warden', 'general', 'ravnos', 'thamuz', 'velmora'].includes(sp))
  ) {
    return rankEntry('A');
  }
  if (monster.boss || monster.tier === 'demon') {
    return rankEntry('B');
  }

  const danger =
    typeof monster.danger === 'number'
      ? monster.danger
      : Number.isFinite(monster.x) && Number.isFinite(monster.y)
        ? zoneAt(monster.x, monster.y)?.danger ?? 1
        : 1;

  if (monster.tag === 'hard' || monster.tier === 'big') {
    return rankEntry(danger >= 3 ? 'B' : 'C');
  }

  const hp = monster.maxHealth || monster.health || SPECIES[sp]?.health || 40;
  if ((sp === 'slime' || sp === 'rat') && danger <= 1 && hp <= 55) {
    return rankEntry('F');
  }
  if (danger <= 1 && hp < 80) {
    return rankEntry('E');
  }
  return rankEntry('D');
}

// ---------- Monster Taming ----------

/** Computes taming probability (0.45 base, +0.25 sv_tamer, x2 with spiritCharm capped at 0.95). */
export function tameChanceFor(game, speciesId) {
  if (SPECIES[speciesId]?.boss) return 0;
  const st = ensureIsekaiTodo(game);
  let chance = 0.45;
  if (st.skillNodes?.sv_tamer) chance += 0.25;
  if (countItem(game.player, 'spiritCharm') > 0) chance *= 2;
  return Math.min(0.95, chance);
}

/** Moves a tamed monster between 'party', 'home', and 'guild' (at most 1 active in 'party'). */
export function setTamedLocation(game, uid, place) {
  if (!['party', 'home', 'guild'].includes(place)) return false;
  const st = ensureIsekaiTodo(game);
  const target = st.tamed.find((t) => t.uid === uid);
  if (!target) return false;
  if (place === 'party') {
    for (const entry of st.tamed) {
      if (entry.uid !== uid && entry.place === 'party') entry.place = 'home';
    }
    st.activeTamedUid = uid;
  } else if (st.activeTamedUid === uid) {
    st.activeTamedUid = null;
  }
  target.place = place;
  return true;
}

/** Adds a tamed creature to the player's roster (max 8) and sets it active in party. */
export function tameMonster(game, speciesId, customName = null) {
  ensureRun(game);
  const st = ensureIsekaiTodo(game);
  if (st.tamed.length >= MAX_TAMED) {
    notify(game, '🐾 Your Tamed Monster roster is full (max ' + MAX_TAMED + ')!', '#ffb070');
    return null;
  }
  const spec = SPECIES[speciesId];
  if (!spec || spec.boss) return null;
  let uid = speciesId + '_' + Date.now();
  if (st.tamed.some((t) => t.uid === uid)) uid += '_' + st.tamed.length;
  const entry = {
    uid,
    species: speciesId,
    name: customName || spec.name,
    level: 1,
    xp: 0,
    place: 'party',
  };
  st.tamed.push(entry);
  setTamedLocation(game, uid, 'party');
  grantAchievement(game, 'monsterTamer');
  cue(game, 'levelUp');
  burst(game, game.player.x, game.player.y, '#7cfc9a', 20);
  floatText(game, game.player.x, game.player.y, '🐾 ' + entry.name, '#7cfc9a');
  notify(game, '🐾 ' + entry.name + ' joined your party!', '#7cfc9a');
  return entry;
}

/** Offers an interactive taming prompt after a flawless non-boss monster victory. */
export function offerTameIfEligible(game, fight) {
  ensureRun(game);
  if (!fight || fight.phase !== 'won' || !fight.opponent) return false;
  const opp = fight.opponent;
  if ((fight.mistakes?.length || 0) > 0 || opp.boss || opp.duel || opp.emissary) return false;
  const speciesId = opp.species;
  const spec = SPECIES[speciesId];
  if (!spec) return false;
  const st = ensureIsekaiTodo(game);
  if (st.tamed.length >= MAX_TAMED) return false;

  if (Math.random() >= tameChanceFor(game, speciesId)) return false;

  const keepWith = (customName = null) => {
    if (countItem(game.player, 'spiritCharm') > 0) {
      removeItem(game.player, 'spiritCharm', 1);
    }
    tameMonster(game, speciesId, customName);
  };

  say(
    game,
    null,
    ['🐾 The defeated ' + spec.name + ' bows respectfully and wishes to follow you! Name/Keep it?'],
    [
      { label: '🐾 Keep as ' + spec.name, icon: 'spiritCharm', run: () => keepWith(null) },
      { label: '🐾 Name it "Buddy ' + spec.name + '"', icon: 'star', run: () => keepWith('Buddy ' + spec.name) },
      { label: 'Release gently', run: () => notify(game, '🐾 The ' + spec.name + ' bows and trots back into the wild.', '#9fd8ff') },
    ]
  );
  return true;
}

/** Returns combat bonuses { attack, defense, companionName } from the active 'party' tamed monster. */
export function activeTamedBonus(game) {
  const st = ensureIsekaiTodo(game);
  const active = st.tamed.find((t) => t.place === 'party');
  if (!active) return { attack: 0, defense: 0, companionName: null };
  const lv = active.level || 1;
  return {
    attack: 6 + lv * 3,
    defense: 3 + lv * 2,
    companionName: active.name,
  };
}

// XP a tamed monster needs for each level: the same for every level (a steady progression).
const TAMED_XP_PER_LEVEL = 40;

/** Grants XP to the active 'party' tamed monster and levels it up. */
export function gainTamedXp(game, xp = 5) {
  ensureRun(game);
  const st = ensureIsekaiTodo(game);
  const active = st.tamed.find((t) => t.place === 'party');
  if (!active || (active.level || 1) >= 20) return null;
  active.xp = (active.xp || 0) + xp;
  while ((active.level || 1) < 20 && active.xp >= TAMED_XP_PER_LEVEL) {
    active.xp -= TAMED_XP_PER_LEVEL;
    active.level = (active.level || 1) + 1;
    cue(game, 'levelUp');
    notify(game, '🐾 ' + active.name + ' grew to Lv.' + active.level + '!', '#7cfc9a');
  }
  return active;
}

// ---------- Flying Mount (Griffin / Wyvern) ----------

/** Unlocks the Flying Mount and ensures the player holds the Sky Griffin Whistle. */
export function unlockFlyingMount(game, kind = 'griffin') {
  ensureRun(game);
  const st = ensureIsekaiTodo(game);
  st.flyingMount.unlocked = true;
  st.flyingMount.kind = kind || 'griffin';
  if (countItem(game.player, 'griffinWhistle') === 0) {
    addItem(game.player, 'griffinWhistle', 1);
  }
  if (st.flyingMount.riding) {
    grantAchievement(game, 'skyRider');
  }
  cue(game, 'levelUp');
  notify(game, '🦅 Unlocked Flying Mount (' + st.flyingMount.kind + ')! Whistle anytime outdoors to fly.', '#ffd23f');
  return st.flyingMount;
}

/** Returns true if the player has unlocked the flying mount or carries a griffinWhistle. */
export function isFlyingMountUnlocked(game) {
  const st = ensureIsekaiTodo(game);
  return Boolean(st.flyingMount?.unlocked || countItem(game.player, 'griffinWhistle') > 0);
}

function hasAdjacentTree(tx, ty) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const t = tileAt(tx + dx, ty + dy);
      if (t === TILE.TREE || t === TILE.DEAD_TREE) return true;
    }
  }
  return false;
}

/** Checks whether the Flying Mount can land safely at (x, y): open ground only, never in forests or towns. */
export function canLandAt(x, y) {
  const zone = zoneAt(x, y);
  if (zone.kind === 'inside') {
    return { ok: false, reason: 'Cannot land indoors!' };
  }
  if (BLOCKED_TOWN_KINDS.has(zone.kind)) {
    return { ok: false, reason: 'Cannot land inside towns, camps, or settlements!' };
  }
  const tile = tileAt(x, y);
  if (tile === TILE.TREE || tile === TILE.DEAD_TREE || zone.biome === 'forest' || biomeAt(x, y) === 'forest' || hasAdjacentTree(x, y)) {
    return { ok: false, reason: 'Cannot land inside forests — fly over open plains outside towns!' };
  }
  if (!OPEN_LAND_TILES.has(tile) || isSolid(x, y)) {
    return { ok: false, reason: 'Cannot land on water, lava, bridges, or obstacles!' };
  }
  const corners = [
    [x - LAND_BODY, y - LAND_BODY],
    [x + LAND_BODY, y - LAND_BODY],
    [x - LAND_BODY, y + LAND_BODY],
    [x + LAND_BODY, y + LAND_BODY],
  ];
  if (corners.some(([cx, cy]) => isSolid(cx, cy))) {
    return { ok: false, reason: 'Not enough clear open space to land here!' };
  }
  return { ok: true, reason: '' };
}

/** Mounts or dismounts the Flying Mount, enforcing open-terrain landing rules. */
export function toggleFlyingMount(game) {
  ensureRun(game);
  const st = ensureIsekaiTodo(game);
  const zone = zoneAt(game.player.x, game.player.y);

  if (st.flyingMount.riding) {
    const landing = canLandAt(game.player.x, game.player.y);
    if (!landing.ok) {
      notify(game, '🦅 ' + landing.reason, '#ffb070');
      return { ok: false, riding: true, reason: landing.reason };
    }
    st.flyingMount.riding = false;
    burst(game, game.player.x, game.player.y, '#d8c9a8', 16);
    cue(game, 'step');
    notify(game, '🦅 Landed safely on open plains.', '#9fd8ff');
    return { ok: true, riding: false };
  }

  if (!isFlyingMountUnlocked(game)) {
    notify(game, '🦅 Acquire a Sky Griffin Whistle or complete the mount quest first!', '#ffb070');
    return { ok: false, riding: false, locked: true };
  }
  if (zone.kind === 'inside') {
    notify(game, '🦅 Cannot take flight indoors!', '#ffb070');
    return { ok: false, riding: false, indoors: true };
  }

  st.flyingMount.unlocked = true;
  st.flyingMount.riding = true;
  grantAchievement(game, 'skyRider');
  spawnRing(game, game.player.x, game.player.y, 3, '#9fd8ff', 2, 0.5);
  burst(game, game.player.x, game.player.y, '#ffffff', 22);
  cue(game, 'blessing');
  notify(
    game,
    '🦅 Soaring on your Sky ' + (st.flyingMount.kind === 'wyvern' ? 'Wyvern' : 'Griffin') + '! Land only in open plains.',
    '#9fd8ff'
  );
  return { ok: true, riding: true };
}

// ---------- Intelligent Monsters ----------

function computeIntelligentSpot(m) {
  const lexia = VILLAGES[0];
  let baseX = lexia.x + lexia.w + 10;
  let baseY = lexia.y + lexia.h / 2 + 8;
  if (m.id === 'sszarak') {
    const anchor = villageOf('riverford') || lexia;
    baseX = anchor.x - 10;
    baseY = anchor.y + anchor.h / 2 + 8;
  } else if (m.id === 'aeris') {
    const anchor = villageOf('port') || lexia;
    baseX = anchor.x + anchor.w / 2 + 12;
    baseY = anchor.y - 10;
  }
  const outsideLexiaX = lexia.x + lexia.w / 2;
  const outsideLexiaY = lexia.y + lexia.h + 10;
  return (
    findOpenLandSpot(baseX, baseY, 40) ||
    findOpenLandSpot(outsideLexiaX, outsideLexiaY, 45) ||
    { x: outsideLexiaX, y: outsideLexiaY }
  );
}

/** Returns safe outdoor coordinates for each Intelligent Monster NPC. */
export function intelligentLocations(game = null) {
  const st = game ? ensureIsekaiTodo(game) : null;
  return INTELLIGENT_MONSTERS.map((m) => {
    if (!INTELLIGENT_CACHE[m.id]) {
      INTELLIGENT_CACHE[m.id] = computeIntelligentSpot(m);
    }
    const pos = INTELLIGENT_CACHE[m.id];
    return {
      ...m,
      x: pos.x,
      y: pos.y,
      befriended: Boolean(st?.intelligent?.befriended?.[m.id]),
      recruited: Boolean(st?.intelligent?.recruited?.includes(m.id)),
    };
  });
}

/** Returns an Intelligent Monster within 1.8 tiles of the hero, or null. */
export function nearIntelligentMonster(game) {
  return (
    intelligentLocations(game).find(
      (m) => Math.hypot(m.x - game.player.x, m.y - game.player.y) <= 1.8
    ) || null
  );
}

/** Opens the 4-option diplomacy dialog (Chat, Trade, Quest, Recruit) for an Intelligent Monster. */
export function interactIntelligentMonster(game, m) {
  ensureRun(game);
  const st = ensureIsekaiTodo(game);
  const spec = INTELLIGENT_MONSTERS.find((entry) => entry.id === (m?.id || m)) || m;
  if (!spec) return false;

  const tradeDef = ITEMS[spec.tradeItem];
  const questDef = ITEMS[spec.questItem];
  const haveQuest = countItem(game.player, spec.questItem);
  const questDone = Boolean(st.intelligent.questsDone[spec.id]);
  const befriended = Boolean(st.intelligent.befriended[spec.id]);
  const recruited = st.intelligent.recruited.includes(spec.id);

  const choices = [
    {
      label: '💬 Chat',
      icon: 'talk',
      run: () => {
        const line = spec.lines?.[1] || spec.lines?.[0] || '"Peace between our peoples!"';
        say(game, null, [spec.name + ' (' + spec.title + '): ' + line]);
      },
    },
    {
      label: '🛒 Trade: ' + (tradeDef?.name || spec.tradeItem) + ' (' + spec.tradeCost + ' Lexis)',
      icon: spec.tradeItem,
      run: () => {
        if ((game.player.lexis || 0) < spec.tradeCost) {
          notify(game, 'Need ' + spec.tradeCost + ' Lexis to trade with ' + spec.name + '.', '#ff8a95');
          return;
        }
        game.player.lexis -= spec.tradeCost;
        addItem(game.player, spec.tradeItem, 1);
        cue(game, 'trade');
        notify(game, '🤝 Bought ' + (tradeDef?.name || spec.tradeItem) + ' from ' + spec.name + '!', '#7cfc9a');
      },
    },
    {
      label: questDone
        ? '✅ Quest Completed (' + spec.name + ' is your friend)'
        : '📜 Quest: ' + (questDef?.name || spec.questItem) + ' (' + haveQuest + '/' + spec.questNeed + ')',
      icon: spec.questItem,
      run: () => {
        if (questDone) {
          say(game, null, [spec.name + ': "Our clan remembers your kindness fondly, friend."']);
          return;
        }
        if (countItem(game.player, spec.questItem) < spec.questNeed) {
          say(game, null, [
            spec.name + ': "' + spec.questAsk + '"',
            'Progress: ' + countItem(game.player, spec.questItem) + '/' + spec.questNeed + ' ' + (questDef?.name || spec.questItem) + '.',
          ]);
          return;
        }
        removeItem(game.player, spec.questItem, spec.questNeed);
        earnLexis(game, spec.rewardLexis);
        gainXp(game, 35);
        st.intelligent.questsDone[spec.id] = true;
        st.intelligent.befriended[spec.id] = true;
        cue(game, 'levelUp');
        burst(game, game.player.x, game.player.y, '#ffd23f', 24);
        say(game, null, [
          spec.name + ': "Splendid work! Take ' + spec.rewardLexis + ' Lexis. You have proven your friendship!"',
        ]);
      },
    },
    {
      label: recruited ? '🏰 Already Recruited' : '🏰 Recruit to Guild / Party',
      icon: 'guild',
      run: () => {
        if (recruited) {
          say(game, null, [spec.name + ': "My banner already marches beside yours!"']);
          return;
        }
        if (!befriended && !st.intelligent.befriended[spec.id]) {
          say(game, null, [spec.name + ': "Help our camp first (' + spec.questAsk + '), then I will join you!"']);
          return;
        }
        const guildOpen = Boolean(st.ownGuild?.founded);
        const partyOpen = (game.player.party?.length || 0) < maxPartySize(game);
        if (!guildOpen && !partyOpen) {
          notify(game, '🏰 Found your Own Guild or free a party slot to recruit ' + spec.name + '!', '#ffb070');
          return;
        }
        st.intelligent.recruited.push(spec.id);
        if (guildOpen && !st.ownGuild.members.some((mem) => mem.id === spec.id)) {
          st.ownGuild.members.push({
            id: spec.id,
            name: spec.name,
            kind: 'monster',
            species: spec.species,
            power: 18,
            status: 'idle',
            returnDay: 0,
            reward: 0,
          });
        }
        cue(game, 'levelUp');
        burst(game, game.player.x, game.player.y, '#7cfc9a', 22);
        notify(
          game,
          guildOpen
            ? '🏰 ' + spec.name + ' joined your Guild roster!'
            : '🤝 ' + spec.name + ' pledged as an allied scout!',
          '#7cfc9a'
        );
      },
    },
    { label: 'Leave', run: () => {} },
  ];

  say(game, null, [spec.name + ' — ' + spec.title, spec.lines?.[0] || '"Greetings, traveler."'], choices);
  return true;
}

// ---------- Demon King Emissaries & Clans ----------

function buildEmissaryUnit(game, speciesId, x, y, extra = {}) {
  if (game?.skills && game?.mastery) return makeMonster(game, speciesId, x, y, extra);
  const sp = SPECIES[speciesId] || SPECIES.demonSoldier;
  const tag = extra.tag || sp.tag || 'hard';
  const mult = tag === 'extreme' ? 25 : tag === 'hard' ? 5 : 1;
  const atkMult = tag === 'extreme' ? 4 : tag === 'hard' ? 2 : 1;
  return {
    ...sp,
    species: speciesId,
    category: sp.category || 'vocabulary',
    tag,
    health: sp.health * mult,
    maxHealth: sp.health * mult,
    attack: sp.attack * atkMult,
    magicAttack: sp.magicAttack * atkMult,
    xp: sp.xp * mult,
    lexis: sp.lexis * mult,
    x,
    y,
    walkX: 0,
    walkY: 0,
    walkTime: 0,
    step: 0,
    dir: 'left',
    moving: false,
    ...extra,
  };
}

// The demon generals (the emissaries) never leave the Silent Isle: each one keeps its camp deep in it,
// always at the same place, and only walks around it.
const EMISSARY_LEASH = 10; // tiles: how far a general walks from its camp

function emissaryCamp(spec) {
  const index = DEMON_EMISSARIES.findIndex((entry) => entry.id === spec.id);
  const place = deepIslePlaces(DEMON_EMISSARIES.length)[Math.max(0, index)];
  return place ? findOpenLandSpot(place.x, place.y, 12) : null;
}

// Can the general step on (x, y)? Land of the isle, near its camp.
function canEmissaryStep(em, x, y) {
  return !isSolid(x, y) && zoneAt(x, y).kind === 'land' && isOnSilentIsle(x, y) && Math.hypot(x - em.homeX, y - em.homeY) <= EMISSARY_LEASH;
}

// A general in its camp on the isle.
function placeEmissary(spec, camp) {
  const angle = Math.random() * Math.PI * 2;
  return {
    id: spec.id,
    name: spec.name,
    title: spec.title,
    species: spec.species,
    x: camp.x,
    y: camp.y,
    homeX: camp.x,
    homeY: camp.y,
    dx: Math.cos(angle),
    dy: Math.sin(angle),
    walkTime: 2,
    announced: false,
    doomCut: spec.doomCut,
    bounty: spec.bounty,
    xp: spec.xp,
  };
}

/** Starts a clan battle against a Demon King Emissary and 2 demon guards. */
export function startEmissaryFight(game, em) {
  ensureRun(game);
  const chief = buildEmissaryUnit(game, em.species, em.x, em.y, {
    name: em.name,
    emissary: true,
    emissaryId: em.id,
    doomCut: em.doomCut,
    bounty: em.bounty,
    xp: Math.round((em.xp || 160) * 0.4),
    lexis: Math.round((em.bounty || 240) * 0.25),
  });
  const guard1 = buildEmissaryUnit(game, 'demonSoldier', em.x, em.y, { emissaryGuard: true });
  const guard2 = buildEmissaryUnit(game, 'demonArcher', em.x, em.y, { emissaryGuard: true });
  startFight(game, chief, [guard1, guard2]);
  game.run.emissaryFight = { id: em.id, fight: game.run.fight };
  return game.run.fight;
}

/** Handles rewards, Silence threat reduction, and achievement when an Emissary Clan is beaten. */
export function onEmissaryDefeated(game, emissaryId) {
  ensureRun(game);
  const st = ensureIsekaiTodo(game);
  if (st.emissariesDefeated.includes(emissaryId)) return false;

  const em = DEMON_EMISSARIES.find((entry) => entry.id === emissaryId) || {
    id: emissaryId,
    name: 'Demon Emissary Clan',
    bounty: 240,
    xp: 160,
    doomCut: 15,
  };
  st.emissariesDefeated.push(emissaryId);
  game.run.emissaries = game.run.emissaries.filter((entry) => entry.id !== emissaryId);

  pushBackDoom(game, em.doomCut, em.name + ' defeated');
  earnLexis(game, em.bounty);
  gainXp(game, em.xp);
  grantAchievement(game, 'emissaryBane');
  cue(game, 'levelUp');
  burst(game, game.player.x, game.player.y, '#ff5a6e', 28);
  floatText(game, game.player.x, game.player.y, '+' + em.bounty + ' Lexis', '#ffd23f');
  notify(
    game,
    '👹 Defeated ' + em.name + '! +' + em.bounty + ' Lexis, +' + em.xp + ' XP, Silence Threat -' + em.doomCut + '%!',
    '#ffd23f'
  );
  return true;
}

/** Places the Demon King Emissary Clans in their camps on the Silent Isle (from Day 2), walks them around, and starts their fight when the hero comes. */
export function tickEmissaries(game, dt = 0.016) {
  ensureRun(game);
  if (game.run.emissaryFight && !game.run.fight) {
    const finished = game.run.emissaryFight;
    game.run.emissaryFight = null;
    if (finished.fight?.phase === 'won') {
      onEmissaryDefeated(game, finished.id);
    } else {
      const target = game.run.emissaries.find((entry) => entry.id === finished.id);
      if (target) {
        target.x = target.homeX; // the general goes back to its camp
        target.y = target.homeY;
      }
    }
  }

  if ((game.day || 1) < 2 || game.bosses?.king) {
    game.run.emissaries = [];
    return;
  }

  const st = ensureIsekaiTodo(game);
  const remaining = DEMON_EMISSARIES.filter((e) => !st.emissariesDefeated.includes(e.id));
  if (remaining.length === 0) {
    game.run.emissaries = [];
    return;
  }

  for (const spec of remaining) {
    if (game.run.emissaries.some((entry) => entry.id === spec.id)) continue;
    const camp = emissaryCamp(spec);
    if (camp) game.run.emissaries.push(placeEmissary(spec, camp));
  }

  if (game.run.timeStopUntil && game.run.timeStopUntil > Date.now()) return;

  for (const em of game.run.emissaries) {
    em.walkTime = (em.walkTime || 0) - dt;
    if (em.walkTime <= 0) {
      const angle = Math.random() * Math.PI * 2;
      em.dx = Math.cos(angle);
      em.dy = Math.sin(angle);
      em.walkTime = 2 + Math.random() * 2;
    }
    const step = 2.0 * dt;
    const nx = em.x + em.dx * step;
    const ny = em.y + em.dy * step;
    if (canEmissaryStep(em, nx, em.y)) em.x = nx;
    else em.dx = -em.dx;
    if (canEmissaryStep(em, em.x, ny)) em.y = ny;
    else em.dy = -em.dy;

    const dist = Math.hypot(em.x - game.player.x, em.y - game.player.y);
    if (dist <= 14 && !em.announced) {
      em.announced = true;
      cue(game, 'thunder');
      notify(game, '🌩️ A demon general guards its camp here! (' + em.name + ')', '#ff5a6e');
    }

    const playerZone = zoneAt(game.player.x, game.player.y);
    if (
      dist <= 1.1 &&
      playerZone.kind !== 'inside' &&
      playerZone.kind !== 'village' &&
      Date.now() > (game.run.safeUntil || 0) &&
      !game.run.fight &&
      game.run.screen === 'play'
    ) {
      startEmissaryFight(game, em);
      break;
    }
  }
}
