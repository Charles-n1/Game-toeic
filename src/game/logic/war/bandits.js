import { CAMPS, MONSTER_TOWNS, SPAWN, zoneAt } from '../../data/zones';
import { BANDIT_CLANS } from '../../data/kingdoms';
import { npcOf } from '../../data/npcs';
import { WAR_SENTENCES } from '../../data/sentences/war';
import { SPECIES } from '../../data/monsters';
import { pickRandom } from '../../../logic/random';
import { monsterCategory } from '../learning';
import { TAG_POWER, TAG_ATTACK, tagOf, higherTag } from '../skills';
import { startFight } from '../fight';
import { makeDuel } from '../duels';
import { lootMonster } from '../loot';
import { earnLexis, gainXp, addItem } from '../player';
import { addFriendship, addHappiness } from '../village';
import { placePeople } from '../people';
import { say, notify } from '../messages';
import { burst, floatText } from '../particles';
import { cue } from '../cues';
import {
  dist,
  centerOfPlace,
  townOf,
  campOf,
  ensureWar,
  ensureRunWar,
  nextWarId,
  moveSlide,
  placeNearSpot,
  spawnWarEffect,
} from './state';

const CAMP_WAKE_RANGE = 110;
const CHASE_RANGE = 6.5;
const TOUCH_RANGE = 0.75;

function clanOf(clanId) {
  return BANDIT_CLANS.find((c) => c.id === clanId) || BANDIT_CLANS[0];
}

function banditLook(clan, role) {
  return {
    skin: '#d9a47a',
    hair: role === 'chief' ? '#2b2b3a' : '#4a3020',
    style: role === 'chief' ? 'spiky' : 'short',
    eyes: '#3b3b3b',
    outfit: role === 'chief' ? '#1f1928' : '#352b3b',
    trim: clan.color,
    pants: '#2b2533',
    boots: '#3b2416',
    scarf: true,
    sword: true,
    beard: role !== 'bandit',
  };
}

export function makeBanditUnit(game, { campId, clan, role, x, y, warKind = 'bandit', tagOverride = null }) {
  const category = monsterCategory(game);
  const baseTag = tagOverride || (role === 'chief' ? 'hard' : higherTag('normal', tagOf(game, category)));
  const baseHp = role === 'chief' ? 32 : role === 'lieutenant' ? 24 : 18;
  const baseAtk = role === 'chief' ? 22 : role === 'lieutenant' ? 16 : 13;
  const speed = role === 'chief' ? 12 : role === 'lieutenant' ? 11 : 10;
  const hp = baseHp * TAG_POWER[baseTag];
  const atk = baseAtk * TAG_ATTACK[baseTag];

  return {
    id: nextWarId(game, warKind),
    campId: campId,
    clan: clan.id,
    role: role,
    warKind: warKind,
    name: role === 'chief' ? clan.chief : role === 'lieutenant' ? clan.name.replace(/^the /, '') + ' Lieutenant' : clan.name.replace(/^the /, '') + ' Bandit',
    species: 'bandit',
    art: role === 'chief' ? 'darkKnight' : 'cultist',
    shape: 'knight',
    tier: role === 'chief' ? 'big' : 'small',
    category: category,
    tag: baseTag,
    health: hp,
    maxHealth: hp,
    attack: atk,
    magicAttack: 0,
    resistance: role === 'chief' ? 0.25 : 0.1,
    magicResistance: 0.1,
    speed: speed,
    xp: (role === 'chief' ? 30 : 14) * TAG_POWER[baseTag],
    lexis: (role === 'chief' ? 22 : 8) * TAG_POWER[baseTag],
    drops: role === 'chief' ? ['banditBadge', 'warTrophy'] : ['banditBadge'],
    x: x,
    y: y,
    homeX: x,
    homeY: y,
    dir: 'down',
    step: Math.random() * 6,
    walking: false,
    look: banditLook(clan, role),
  };
}

// ---------- Bandit Camps & Kidnap Cages ----------

function campStateOf(game, campId) {
  const war = ensureWar(game);
  if (!war.camps[campId]) war.camps[campId] = { clearedDay: 0, chiefAlive: true, freed: false };
  return war.camps[campId];
}

export function cagePosOf(place) {
  if (place.plan && place.plan.props) {
    const cage = place.plan.props.find((p) => p.kind === 'cage');
    if (cage) return { x: cage.x + cage.w / 2, y: cage.y + cage.h / 2 };
  }
  return { x: place.x + Math.floor(place.w / 2) + 4, y: place.y + Math.floor(place.h / 2) - 2 };
}

export function kidnappedIdsAt(game, placeId) {
  const war = ensureWar(game);
  return Object.entries(war.kidnapped)
    .filter(([, capId]) => capId === placeId)
    .map(([npcId]) => npcId);
}

function spawnCampBandits(game, camp) {
  const runWar = ensureRunWar(game);
  const cState = campStateOf(game, camp.id);
  if (cState.clearedDay && game.day - cState.clearedDay < 6 && kidnappedIdsAt(game, camp.id).length === 0) return;

  if (cState.clearedDay && game.day - cState.clearedDay >= 6) {
    cState.clearedDay = 0;
    cState.freed = false;
  }
  if (runWar.campUnits.some((u) => u.campId === camp.id && u.health > 0)) return;
  if (cState.clearedDay) return;

  const clan = clanOf(camp.clan);
  const center = centerOfPlace(camp);
  const offsets = [
    [-7, 6],
    [7, 6],
    [-6, -3],
    [6, -2],
  ];
  offsets.forEach(([dx, dy]) => {
    const spot = placeNearSpot(game, center.x + dx, center.y + dy, 0, 3);
    runWar.campUnits.push(makeBanditUnit(game, { campId: camp.id, clan: clan, role: 'bandit', x: spot.x, y: spot.y }));
  });
  const ltSpot = placeNearSpot(game, center.x, center.y + 4, 0, 3);
  runWar.campUnits.push(makeBanditUnit(game, { campId: camp.id, clan: clan, role: 'lieutenant', x: ltSpot.x, y: ltSpot.y }));

  if (cState.chiefAlive !== false) {
    const chiefSpot = placeNearSpot(game, center.x, camp.y + 11, 0, 3);
    runWar.campUnits.push(makeBanditUnit(game, { campId: camp.id, clan: clan, role: 'chief', x: chiefSpot.x, y: chiefSpot.y }));
  }
}

function spawnTownCaptorGuards(game, town) {
  const runWar = ensureRunWar(game);
  if (kidnappedIdsAt(game, town.id).length === 0) return;
  if (runWar.clearedCaptors[town.id] === game.day) return;
  if (runWar.campUnits.some((u) => u.campId === town.id && u.health > 0)) return;
  const center = centerOfPlace(town);
  const clan = clanOf('crows');
  for (let i = 0; i < 3; i++) {
    const spot = placeNearSpot(game, center.x + (i - 1) * 4, center.y + 3, 0, 3);
    const unit = makeBanditUnit(game, { campId: town.id, clan: clan, role: i === 1 ? 'lieutenant' : 'bandit', x: spot.x, y: spot.y });
    unit.name = (SPECIES[town.species] ? SPECIES[town.species].name : 'Raider') + ' Captor';
    unit.species = town.species || 'orc';
    unit.art = SPECIES[town.species] && SPECIES[town.species].art ? SPECIES[town.species].art : 'orc';
    unit.shape = SPECIES[town.species] && SPECIES[town.species].shape ? SPECIES[town.species].shape : 'golem';
    runWar.campUnits.push(unit);
  }
}

export function slowBanditsAndCamps(game) {
  const runWar = ensureRunWar(game);
  for (const camp of CAMPS) {
    const center = centerOfPlace(camp);
    if (dist(game.player, center) < CAMP_WAKE_RANGE) spawnCampBandits(game, camp);
    else runWar.campUnits = runWar.campUnits.filter((u) => u.campId !== camp.id);
  }
  for (const town of MONSTER_TOWNS) {
    const center = centerOfPlace(town);
    if (dist(game.player, center) < CAMP_WAKE_RANGE) spawnTownCaptorGuards(game, town);
    else runWar.campUnits = runWar.campUnits.filter((u) => u.campId !== town.id);
  }
}

export function cageNear(game, range = 2.8) {
  const war = ensureWar(game);
  for (const camp of CAMPS) {
    const pos = cagePosOf(camp);
    if (dist(pos, game.player) > range) continue;
    const cState = campStateOf(game, camp.id);
    const kidnappedIds = kidnappedIdsAt(game, camp.id);
    if (!cState.freed || kidnappedIds.length > 0) {
      return { place: camp, isCamp: true, x: pos.x, y: pos.y, kidnappedIds: kidnappedIds };
    }
  }
  for (const town of MONSTER_TOWNS) {
    const kidnappedIds = kidnappedIdsAt(game, town.id);
    if (kidnappedIds.length === 0) continue;
    const pos = cagePosOf(town);
    if (dist(pos, game.player) <= range) {
      return { place: town, isCamp: false, x: pos.x, y: pos.y, kidnappedIds: kidnappedIds };
    }
  }
  // Clean up stale kidnapped entries pointing to unknown places.
  for (const npcId of Object.keys(war.kidnapped)) {
    const targetId = war.kidnapped[npcId];
    if (!campOf(targetId) && !townOf(targetId)) delete war.kidnapped[npcId];
  }
  return null;
}

export function openCage(game, info) {
  if (!info) return false;
  slowBanditsAndCamps(game);
  const runWar = ensureRunWar(game);
  const war = ensureWar(game);
  const guardsLeft = runWar.campUnits.filter((u) => u.campId === info.place.id && u.health > 0).length;
  if (guardsLeft > 0) {
    say(game, null, ['Defeat the remaining ' + guardsLeft + ' guard(s) in ' + info.place.name + ' before unlocking the cage!']);
    return false;
  }

  const lines = [];
  if (info.isCamp) {
    const cState = campStateOf(game, info.place.id);
    if (!cState.freed) {
      cState.freed = true;
      earnLexis(game, 35);
      gainXp(game, 25);
      addHappiness(game, 4);
      addItem(game.player, 'warRations');
      lines.push('You smash the lock on the iron cage! The captive travelers thank you and slip away safely (+35 Lexis, +25 XP, War Rations).');
    }
  }

  for (const npcId of info.kidnappedIds) {
    delete war.kidnapped[npcId];
    const npc = npcOf(npcId);
    addFriendship(game, npcId, 12);
    if (game.player.party.length < 2 && !game.player.party.includes(npcId)) {
      game.player.party.push(npcId);
      lines.push(npc.name + ' is freed and rejoins your party!');
    } else {
      placePeople(game);
      lines.push(npc.name + ' is freed and returns safely home!');
    }
  }

  cue(game, 'victory');
  if (lines.length > 0) say(game, null, lines);
  return true;
}

// ---------- Road Ambushes & Kidnapping ----------

function nearestCaptorPlace(x, y) {
  const all = [...CAMPS, ...MONSTER_TOWNS];
  let best = all[0];
  let bestFar = Infinity;
  for (const place of all) {
    const far = dist(centerOfPlace(place), { x, y });
    if (far < bestFar) {
      best = place;
      bestFar = far;
    }
  }
  return best;
}

export function kidnapCompanion(game, npcId = null, preferredPlaceId = null) {
  const war = ensureWar(game);
  const runWar = ensureRunWar(game);
  if (game.player.party.length === 0 && !npcId) return null;
  const victimId = npcId || pickRandom(game.player.party);
  game.player.party = game.player.party.filter((id) => id !== victimId);
  const place = (preferredPlaceId && (campOf(preferredPlaceId) || townOf(preferredPlaceId))) || nearestCaptorPlace(game.player.x, game.player.y);
  war.kidnapped[victimId] = place.id;
  delete runWar.clearedCaptors[place.id];
  return { npcId: victimId, place: place };
}

function spawnAmbushPack(game, count, tough, extra = {}) {
  const runWar = ensureRunWar(game);
  const clan = pickRandom(BANDIT_CLANS);
  const tag = tough ? higherTag('hard', tagOf(game, monsterCategory(game))) : null;
  const spawned = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / Math.max(1, count)) * Math.PI * 2 + Math.random() * 0.6;
    const spot = placeNearSpot(game, game.player.x + Math.cos(angle) * 4.5, game.player.y + Math.sin(angle) * 4.5, 1, 5);
    const unit = makeBanditUnit(game, {
      campId: 'ambush',
      clan: clan,
      role: tough && i === 0 ? 'lieutenant' : 'bandit',
      x: spot.x,
      y: spot.y,
      warKind: 'ambush',
      tagOverride: tag,
    });
    Object.assign(unit, extra);
    if (extra.halfHp) unit.health = Math.max(10, Math.round(unit.maxHealth * 0.5));
    runWar.ambushFoes.push(unit);
    spawned.push(unit);
  }
  return spawned;
}

export function triggerAmbush(game, forcedKind = null) {
  const runWar = ensureRunWar(game);
  if (runWar.ambushFoes.length > 0) return null;

  let kind = forcedKind;
  if (!kind) {
    if (game.player.party.length > 0 && Math.random() < 0.25) kind = 'kidnap';
    else if (Math.random() < 0.42) kind = 'mistake';
    else kind = 'deadly';
  }

  cue(game, 'ambush');

  if (kind === 'mistake') {
    const [foe] = spawnAmbushPack(game, 1, false, { halfHp: true, mistake: true });
    say(
      game,
      null,
      [
        'Ambushers leap from the brush — and promptly trip over their own rope! One drops a pouch while arguing over their battle cry: "We has surrounded you!"',
      ],
      [
        {
          label: 'Outsmart them with grammar (WAR_SENTENCES)',
          icon: 'book',
          run: () => {
            const duel = makeDuel(
              { id: 'ambush-mistake', name: foe.name, look: foe.look },
              {
                title: 'Tactical Blunder',
                category: 'subjectVerb',
                tag: 'hard',
                questions: WAR_SENTENCES,
                health: 2,
                speed: 10,
                onWin: () => {
                  runWar.ambushFoes = runWar.ambushFoes.filter((u) => u !== foe);
                  earnLexis(game, 35);
                  gainXp(game, 20);
                  addItem(game.player, 'warRations');
                  say(game, null, ['Corrected and humiliated, the ambushers scatter into the bushes! (+35 Lexis, +20 XP, War Rations)']);
                },
                onLose: () => {
                  startFight(game, foe);
                  runWar.trackedFight = game.run.fight;
                },
              }
            );
            startFight(game, duel);
            runWar.trackedFight = game.run.fight;
          },
        },
        {
          label: 'Attack the startled ambusher (Half HP!)',
          icon: 'woodSword',
          run: () => {
            startFight(game, foe);
            runWar.trackedFight = game.run.fight;
          },
        },
        {
          label: 'Snatch their dropped coin pouch and slip away',
          icon: 'lexis',
          run: () => {
            runWar.ambushFoes = runWar.ambushFoes.filter((u) => u !== foe);
            earnLexis(game, 18);
            notify(game, '💰 Grabbed +18 Lexis from the clumsy ambushers!', '#ffd23f');
          },
        },
      ]
    );
    return 'mistake';
  }

  if (kind === 'kidnap' && game.player.party.length > 0) {
    const result = kidnapCompanion(game);
    spawnAmbushPack(game, 2, false);
    const npc = npcOf(result.npcId);
    notify(game, '🚨 ' + npc.name + ' was kidnapped to ' + result.place.name + '!', '#ff5a6e');
    say(game, null, [
      'A sudden ambush erupts from the roadside! In the chaos, raiders drag ' + npc.name + ' away toward ' + result.place.name + '!',
      'Defeat the captors and unlock the cage at ' + result.place.name + ' to rescue ' + npc.name + '!',
    ]);
    return 'kidnap';
  }

  // Deadly ambush
  const count = 2 + (Math.random() < 0.45 ? 1 : 0);
  spawnAmbushPack(game, count, true);
  notify(game, '⚠️ DEADLY AMBUSH! Cutthroats leap from the shadows!', '#ff5a6e');
  return 'deadly';
}

// ---------- Frame update for bandits & ambushers ----------

function updateBanditUnit(game, unit, dt) {
  const farPlayer = dist(unit, game.player);
  const shouldChase = unit.warKind === 'ambush' || farPlayer < CHASE_RANGE;
  const goal = shouldChase ? game.player : { x: unit.homeX, y: unit.homeY };
  const farGoal = dist(unit, goal);

  if (farGoal > 0.45) {
    const speed = unit.warKind === 'ambush' ? 2.4 : shouldChase ? 2.0 : 0.7;
    const dx = ((goal.x - unit.x) / farGoal) * speed * dt;
    const dy = ((goal.y - unit.y) / farGoal) * speed * dt;
    moveSlide(game, unit, dx, dy);
    unit.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
    unit.walking = true;
    unit.step = (unit.step || 0) + dt * 6;
  } else {
    unit.walking = false;
  }

  if (farPlayer < TOUCH_RANGE && !game.run.fight && Date.now() > game.run.safeUntil) {
    const runWar = ensureRunWar(game);
    startFight(game, unit);
    runWar.trackedFight = game.run.fight;
  }
}

export function updateBanditsAndAmbushes(game, dt) {
  const runWar = ensureRunWar(game);

  if (!game.run.fight) {
    for (const deadUnit of [...runWar.campUnits, ...runWar.ambushFoes].filter((u) => u.health <= 0)) {
      defeatBanditUnit(game, deadUnit);
    }
  }

  for (const unit of [...runWar.campUnits, ...runWar.ambushFoes]) {
    if (unit.health <= 0) continue;
    updateBanditUnit(game, unit, dt);
    if (game.run.fight) break;
  }

  // Despawn ambushers if the player outran them far away.
  runWar.ambushFoes = runWar.ambushFoes.filter((u) => u.health > 0 && dist(u, game.player) < 28);

  // Rare road ambush timer in wild land.
  const canAmbush =
    game.run.screen === 'play' &&
    !game.run.fight &&
    !game.run.dialog &&
    !game.run.encounter &&
    !(game.raid && game.raid.active) &&
    Date.now() > game.run.safeUntil &&
    zoneAt(game.player.x, game.player.y).kind === 'land' &&
    dist(game.player, SPAWN) > 35 &&
    runWar.ambushFoes.length === 0;

  if (canAmbush) {
    runWar.ambushTimer -= dt * (game.run.walking ? 1 : 0.2);
    if (runWar.ambushTimer <= 0) {
      runWar.ambushTimer = 50 + Math.random() * 40;
      if (Math.random() < 0.28) triggerAmbush(game);
    }
  }
}

export function defeatBanditUnit(game, unit) {
  const runWar = ensureRunWar(game);
  runWar.campUnits = runWar.campUnits.filter((u) => u !== unit);
  runWar.ambushFoes = runWar.ambushFoes.filter((u) => u !== unit);
  burst(game, unit.x, unit.y, '#ffd23f', 16);
  spawnWarEffect(game, 'hit', unit.x, unit.y, '#ffd23f');

  if (unit.warKind === 'bandit' && unit.campId) {
    const camp = campOf(unit.campId);
    const cState = camp ? campStateOf(game, camp.id) : null;
    if (unit.role === 'chief' && cState) {
      cState.chiefAlive = false;
      earnLexis(game, 100);
      addItem(game.player, 'banditBadge');
      addItem(game.player, 'warTrophy');
      addHappiness(game, 5);
      notify(game, '🏴‍☠️ Clan Chief ' + unit.name + ' defeated! +100 Lexis bounty!', '#ffd23f');
    }
    const left = runWar.campUnits.filter((u) => u.campId === unit.campId && u.health > 0).length;
    if (left === 0) {
      if (camp && cState) {
        cState.clearedDay = game.day;
        notify(game, '✅ ' + camp.name + ' cleared! Approach the cage to free the prisoners.', '#7CFC9A');
      } else {
        runWar.clearedCaptors[unit.campId] = game.day;
        notify(game, '✅ The captors are defeated! Approach the cage to rescue your companion.', '#7CFC9A');
      }
    }
  }
}

export function handleBanditFightEnd(game, fight) {
  const opponent = fight.opponent;
  if (!opponent) return false;
  if (opponent.warKind !== 'bandit' && opponent.warKind !== 'ambush') return false;

  if (fight.phase === 'won') {
    defeatBanditUnit(game, opponent);
    return true;
  }
  if (fight.phase === 'lost' && game.player.party.length > 0) {
    const preferred = opponent.campId && opponent.campId !== 'ambush' ? opponent.campId : null;
    const res = kidnapCompanion(game, null, preferred);
    if (res) {
      notify(game, '🚨 ' + npcOf(res.npcId).name + ' was taken to ' + res.place.name + '!', '#ff5a6e');
    }
  }
  return true;
}

// Allows map powers (Fireball, Lightning Ball, Lightning Strike) to wound camp/ambush bandits too.
export function applyPowersToBandits(game) {
  const runWar = ensureRunWar(game);
  const targets = [...runWar.campUnits, ...runWar.ambushFoes].filter((u) => u.health > 0);
  if (targets.length === 0) return;

  const woundUnit = (unit, dmg) => {
    unit.health -= dmg;
    spawnWarEffect(game, 'hit', unit.x, unit.y, '#9fd8ff');
    floatText(game, unit.x, unit.y - 0.3, '-' + dmg, '#9fd8ff');
    if (unit.health <= 0) {
      if (unit.tier === 'small') {
        lootMonster(game, unit);
        defeatBanditUnit(game, unit);
      } else {
        unit.health = 10;
      }
    }
  };

  for (const ball of game.run.balls) {
    if (ball.life <= 0) continue;
    const hit = targets.find((u) => u.health > 0 && dist(u, ball) < 0.75);
    if (hit) {
      woundUnit(hit, ball.damage);
      ball.life = 0;
    }
  }

  const lightningCd = game.run.cooldowns && game.run.cooldowns.lightningStrike ? game.run.cooldowns.lightningStrike : 0;
  if (lightningCd > (runWar.lastLightningCd || 0)) {
    runWar.lastLightningCd = lightningCd;
    for (const unit of targets) {
      if (dist(unit, game.player) < 4) {
        const dmg = unit.tier === 'small' ? unit.health : Math.ceil(unit.health / 2);
        woundUnit(unit, dmg);
      }
    }
  }
}
