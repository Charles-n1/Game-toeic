import { BANDIT_CLANS } from '../../data/kingdoms';
import { VILLAGES, villageOf, zoneAt } from '../../data/zones';
import { ITEMS } from '../../data/items';
import { societySentencesFor } from '../../data/sentences/society';
import { propsAround, isSolid } from '../../world/map';
import { turretSpots } from '../walls';
import { refreshWorld } from '../worldState';
import { startFight } from '../fight';
import { makeDuel } from '../duels';
import { gameHours } from '../boosts';
import { countItem, removeItem, addItem, earnLexis, gainXp } from '../player';
import { addHappiness } from '../village';
import { notify, say } from '../messages';
import { burst } from '../particles';
import { cue } from '../cues';
import { pickRandom } from '../../../logic/random';
import {
  ensureSociety,
  isVillain,
  addInfamy,
  villageState,
  changeVillageMood,
  isFestivalActive,
  villagePriceMultiplier,
  startSocietyFight,
} from './state';

// Slave traders & cages, town decorations, turrets, bounty boards, festivals, fireworks, and guard chases.

const BOUNTY_MONSTERS = [
  { species: 'goblin', label: 'Goblins', count: 4, reward: 100 },
  { species: 'wolf', label: 'Verb Wolves', count: 4, reward: 110 },
  { species: 'orc', label: 'Orc Brutes', count: 3, reward: 140 },
  { species: 'skeleton', label: 'Skeletons', count: 4, reward: 120 },
  { species: 'spider', label: 'Cave Spiders', count: 4, reward: 115 },
];

const SLAVER_LOOK = {
  skin: '#c99872',
  hair: '#2b2b3a',
  style: 'short',
  eyes: '#d0202a',
  outfit: '#3a2228',
  trim: '#9aa6b8',
  beard: true,
};

function cageKeyOf(prop) {
  return Math.floor(prop.x) + ',' + Math.floor(prop.y);
}

// ---------- Slave Traders & Cages ----------

export function syncSlaveTraders(game) {
  const s = ensureSociety(game);
  const cages = propsAround(game.player.x, game.player.y, 48).filter((prop) => prop.kind === 'cage');
  const activeKeys = new Set();
  for (const cage of cages) {
    const key = cageKeyOf(cage);
    const freedDay = s.cagesFreed[key];
    // Freed bandit camp cages stay freed for 14 days; capital cages reopen after 7 days
    const zone = zoneAt(cage.x, cage.y);
    const cooldown = zone.kind === 'camp' ? 14 : 7;
    if (freedDay && game.day < freedDay + cooldown) continue;
    activeKeys.add(key);
    if (game.run.slaveTraders.some((trader) => trader.cageKey === key)) continue;
    game.run.slaveTraders.push({
      id: 'slaver-' + key,
      cageKey: key,
      x: cage.x - 0.7,
      y: cage.y + cage.h + 0.2,
      cageX: cage.x,
      cageY: cage.y,
      villageId: zone.kind === 'village' ? zone.id : null,
      clanId: zone.clan || null,
      look: SLAVER_LOOK,
    });
  }
  game.run.slaveTraders = game.run.slaveTraders.filter((trader) => activeKeys.has(trader.cageKey));
}

export function slaveTraderNear(game) {
  const list = game.run.slaveTraders || [];
  return list.find((trader) => Math.hypot(trader.x - game.player.x, trader.y - game.player.y) < 2.2 || Math.hypot(trader.cageX + 1.5 - game.player.x, trader.cageY + 1 - game.player.y) < 2.4) || null;
}

function freePrisoner(game, trader, infamyDrop, happinessGain, lexisGift) {
  const s = ensureSociety(game);
  s.cagesFreed[trader.cageKey] = game.day;
  game.run.slaveTraders = game.run.slaveTraders.filter((item) => item.cageKey !== trader.cageKey);
  s.freedSlaves += 1;
  addInfamy(game, -infamyDrop);
  addHappiness(game, happinessGain);
  if (trader.villageId) changeVillageMood(game, trader.villageId, 7);
  if (lexisGift > 0) earnLexis(game, lexisGift);
  gainXp(game, 30);
  cue(game, 'cageBreak');
  burst(game, trader.cageX + 1.5, trader.cageY + 1, '#ffd23f', 24);
}

export function interactSlaveTrader(game, trader) {
  const mult = trader.villageId ? villagePriceMultiplier(game, trader.villageId) : 1;
  const buyPrice = Math.max(45, Math.round((trader.villageId ? 65 : 85) * mult));
  const foeNpc = { id: null, name: 'Slave Trader', look: trader.look };

  say(game, null, ['Slave Trader: "Fine strong hands in that cage! Want to buy their freedom, wager yours in words, or try steel?"'], [
    {
      label: "Buy the slave's freedom (" + buyPrice + ' Lexis)',
      icon: 'lexis',
      run: () => {
        if (game.player.lexis < buyPrice) {
          say(game, null, ['Slave Trader: "Short on Lexis? Come back with ' + buyPrice + ', or put your English on the line!"']);
          return;
        }
        game.player.lexis -= buyPrice;
        addItem(game.player, 'flower');
        freePrisoner(game, trader, 10, 4, 0);
        say(game, null, ['The trader tosses you the iron key. The freed captive hugs you, hands you a wildflower, and runs home!', '(-10 Infamy, +4 Happiness, +30 XP)']);
      },
    },
    {
      label: 'Win their freedom in a word duel',
      icon: 'book',
      run: () => {
        startFight(game, makeDuel(foeNpc, {
          title: 'Wager for Freedom',
          category: 'vocabulary',
          tag: 'normal',
          questions: societySentencesFor('slaves'),
          health: 4,
          speed: 12,
          onWin: () => {
            const gift = pickRandom(['oldCoin', 'horseFeed', 'flower']);
            addItem(game.player, gift);
            freePrisoner(game, trader, 12, 5, 25);
            say(game, null, ['Slave Trader: "Curse your silver tongue! Take the key and get out!"', 'Prisoner freed! +25 Lexis, +30 XP, and a ' + ITEMS[gift].name + '! (-12 Infamy)']);
          },
          onLose: () => say(game, null, ['Slave Trader: "Ha! Your words stumble! Pay ' + buyPrice + ' Lexis or fight me!"']),
        }));
      },
    },
    {
      label: 'Beat up the slave trader & smash the cage!',
      icon: 'woodSword',
      run: () => {
        startSocietyFight(game, {
          name: 'Slave Trader',
          shape: 'knight',
          tag: trader.clanId ? 'hard' : 'normal',
          health: trader.clanId ? 75 : 55,
          attack: trader.clanId ? 20 : 15,
          speed: 10,
          xp: 40,
          lexis: 30,
        }, {
          kind: 'slaveTrader',
          cageKey: trader.cageKey,
          villageId: trader.villageId,
        });
      },
    },
    { label: 'Leave', run: () => {} },
  ]);
}

// ---------- Decorating Villages & Building Turrets ----------

function decorateVillageChoices(game, village, state) {
  const decor = state.decor || 0;
  if (decor >= 6) return [{ label: 'Square is already richly decorated (6/6)', run: () => {} }];
  const choices = [];
  if (countItem(game.player, 'decorBanner') >= 1 && game.player.lexis >= 15) {
    choices.push({
      label: 'Hang Festival Banner (1 Banner + 15 Lexis)',
      icon: 'decorBanner',
      run: () => {
        removeItem(game.player, 'decorBanner', 1);
        game.player.lexis -= 15;
        applyDecorate(game, village, state);
      },
    });
  }
  if (countItem(game.player, 'flower') >= 2 && countItem(game.player, 'branch') >= 2 && game.player.lexis >= 20) {
    choices.push({
      label: 'Weave Flower Garlands (2 Flowers + 2 Branches + 20 Lexis)',
      icon: 'flower',
      run: () => {
        removeItem(game.player, 'flower', 2);
        removeItem(game.player, 'branch', 2);
        game.player.lexis -= 20;
        applyDecorate(game, village, state);
      },
    });
  }
  choices.push({
    label: 'Sponsor Town Decorations (50 Lexis)',
    icon: 'lexis',
    run: () => {
      if (game.player.lexis < 50) {
        notify(game, 'Need 50 Lexis (or bring 2 Flowers + 2 Branches + 20 Lexis).', '#ff8a95');
        return;
      }
      game.player.lexis -= 50;
      applyDecorate(game, village, state);
    },
  });
  return choices;
}

function applyDecorate(game, village, state) {
  state.decor = (state.decor || 0) + 1;
  changeVillageMood(game, village.id, 8);
  addHappiness(game, 3);
  addInfamy(game, -4);
  cue(game, 'build');
  burst(game, game.player.x, game.player.y - 0.5, '#ff6fa8', 24);
  notify(game, '🎏 Decorated ' + village.name + ' (Level ' + state.decor + '/6)! Mood & happiness rose!', '#ffd23f');
}

export function nextFreeTurretIndex(village, state) {
  const spots = turretSpots(village);
  const used = state.turrets || [];
  for (let i = 0; i < spots.length; i++) {
    if (!used.includes(i)) return i;
  }
  return -1;
}

function buildTurretAt(game, village, state, index) {
  if (!state.turrets) state.turrets = [];
  state.turrets.push(index);
  refreshWorld(game);
  changeVillageMood(game, village.id, 6);
  addHappiness(game, 2);
  addInfamy(game, -3);
  cue(game, 'build');
  const spot = turretSpots(village)[index];
  if (spot) burst(game, spot.x + 1, spot.y + 1, '#ffd23f', 24);
  notify(game, '🗼 Raised a defensive turret for ' + village.name + '! (' + state.turrets.length + '/' + turretSpots(village).length + ')', '#7cfc9a');
}

export function offerTurretBuild(game, village, spotIndex = null) {
  const state = villageState(game, village.id);
  const spots = turretSpots(village);
  const targetIndex = spotIndex !== null && !(state.turrets || []).includes(spotIndex) ? spotIndex : nextFreeTurretIndex(village, state);
  if (targetIndex < 0) {
    say(game, null, [village.name + ' already has all ' + spots.length + ' defensive turrets built!']);
    return;
  }

  const woodCount = countItem(game.player, 'branch') + countItem(game.player, 'firewood');
  const stoneCount = countItem(game.player, 'stone') + countItem(game.player, 'flint');
  const choices = [];

  if (countItem(game.player, 'turretKit') >= 1 && game.player.lexis >= 40) {
    choices.push({
      label: 'Assemble Turret Kit (1 Turret Kit + 40 Lexis)',
      icon: 'turretKit',
      run: () => {
        removeItem(game.player, 'turretKit', 1);
        game.player.lexis -= 40;
        buildTurretAt(game, village, state, targetIndex);
      },
    });
  }
  if (woodCount >= 2 && stoneCount >= 2 && game.player.lexis >= 60) {
    choices.push({
      label: 'Build from Materials (2 Wood/Branch + 2 Stone/Flint + 60 Lexis)',
      icon: 'stone',
      run: () => {
        let needWood = 2;
        for (const id of ['firewood', 'branch']) {
          const take = Math.min(needWood, countItem(game.player, id));
          if (take > 0) { removeItem(game.player, id, take); needWood -= take; }
        }
        let needStone = 2;
        for (const id of ['stone', 'flint']) {
          const take = Math.min(needStone, countItem(game.player, id));
          if (take > 0) { removeItem(game.player, id, take); needStone -= take; }
        }
        game.player.lexis -= 60;
        buildTurretAt(game, village, state, targetIndex);
      },
    });
  }
  choices.push({
    label: 'Hire Village Builders (140 Lexis)',
    icon: 'lexis',
    run: () => {
      if (game.player.lexis < 140) {
        notify(game, 'Need 140 Lexis (or 1 Turret Kit + 40 Lexis, or wood + stone + 60 Lexis).', '#ff8a95');
        return;
      }
      game.player.lexis -= 140;
      buildTurretAt(game, village, state, targetIndex);
    },
  });
  choices.push({ label: 'Back', run: () => {} });

  say(game, null, ['Turret Site (' + village.name + ' · ' + (state.turrets || []).length + '/' + spots.length + ' built): Turrets help defend the walls from monsters and raiders.'], choices);
}

// ---------- Bounty Boards & Bandit Camps ----------

function clanBountyFor(village) {
  const index = Math.abs(village.x + village.y) % BANDIT_CLANS.length;
  const clan = BANDIT_CLANS[index];
  return {
    id: 'bounty-clan-' + village.id + '-' + clan.id,
    kind: 'bandit',
    clanId: clan.id,
    title: 'Bounty: ' + clan.chief + ' (' + clan.name + ')',
    desc: 'Raid a camp of ' + clan.name + ' and defeat ' + clan.chief + '.',
    need: 1,
    reward: 200,
    xp: 55,
    villageId: village.id,
  };
}

function monsterBountyFor(village) {
  const entry = BOUNTY_MONSTERS[Math.abs(village.x * 3 + village.y) % BOUNTY_MONSTERS.length];
  return {
    id: 'bounty-hunt-' + village.id + '-' + entry.species,
    kind: 'monster',
    species: entry.species,
    title: 'Hunt: ' + entry.count + ' ' + entry.label,
    desc: 'Clear ' + entry.count + ' ' + entry.label.toLowerCase() + ' threatening the roads.',
    need: entry.count,
    reward: entry.reward,
    xp: 35,
    villageId: village.id,
  };
}

function rivalBountyFor(village) {
  if (!village.rivals || village.rivals.length === 0) return null;
  const rival = villageOf(village.rivals[0]);
  if (!rival) return null;
  return {
    id: 'bounty-rival-' + village.id + '-' + rival.id,
    kind: 'rival',
    rivalId: rival.id,
    rivalName: rival.name,
    title: 'Scout Rival: ' + rival.name,
    desc: 'Travel to rival village ' + rival.name + ' and return with a report.',
    need: 1,
    reward: 135,
    xp: 35,
    villageId: village.id,
  };
}

function bountyProgress(game, bounty) {
  if (bounty.kind === 'monster') {
    const kills = (game.kills[bounty.species] || 0) - (bounty.startKills || 0);
    return Math.min(bounty.need, Math.max(0, kills));
  }
  if (bounty.kind === 'rival') {
    return bounty.have >= 1 || game.visited[bounty.rivalId] ? 1 : 0;
  }
  return Math.min(bounty.need, bounty.have || 0);
}

function turnInBounty(game, bounty, village) {
  bounty.done = true;
  earnLexis(game, bounty.reward);
  gainXp(game, bounty.xp);
  addInfamy(game, -8);
  changeVillageMood(game, village.id, 8);
  addHappiness(game, 3);
  cue(game, 'blessing');
  notify(game, '📜 Bounty complete! +' + bounty.reward + ' Lexis, +' + bounty.xp + ' XP, -8 Infamy!', '#ffd23f');
}

function acceptBounty(game, template) {
  const s = ensureSociety(game);
  s.bounties[template.id] = {
    ...template,
    active: true,
    done: false,
    have: 0,
    startKills: template.kind === 'monster' ? game.kills[template.species] || 0 : 0,
  };
  cue(game, 'trade');
  notify(game, '📜 Accepted bounty: ' + template.title, '#ffd23f');
}

// Updates active rival/bandit bounties (called once per second).
export function updateBountyProgress(game) {
  const s = ensureSociety(game);
  const zone = zoneAt(game.player.x, game.player.y);
  for (const bounty of Object.values(s.bounties)) {
    if (!bounty.active || bounty.done) continue;
    if (bounty.kind === 'rival' && zone.id === bounty.rivalId && bounty.have < 1) {
      bounty.have = 1;
      notify(game, '📜 Rival scouted (' + bounty.rivalName + ')! Return to the bounty board for ' + bounty.reward + ' Lexis.', '#7cfc9a');
    }
  }
}

export function interactBoard(game, zone) {
  const s = ensureSociety(game);
  if (zone.kind === 'camp') {
    interactBanditCamp(game, zone);
    return;
  }
  const village = zone;
  const state = villageState(game, village.id);
  const offered = [clanBountyFor(village), monsterBountyFor(village), rivalBountyFor(village)].filter(Boolean);
  const activeHere = Object.values(s.bounties).filter((b) => b.active && !b.done);
  const readyHere = activeHere.filter((b) => bountyProgress(game, b) >= b.need);

  const choices = [];
  for (const b of readyHere) {
    choices.push({
      label: 'Turn in: ' + b.title + ' (+' + b.reward + ' Lexis)',
      icon: 'quests',
      run: () => turnInBounty(game, b, village),
    });
  }
  for (const item of offered) {
    const existing = s.bounties[item.id];
    if (existing && (existing.active || existing.done)) continue;
    choices.push({
      label: 'Accept: ' + item.title + ' (' + item.reward + ' Lexis)',
      icon: 'quests',
      run: () => acceptBounty(game, item),
    });
  }
  choices.push({
    label: 'Decorate ' + village.name + ' (' + (state.decor || 0) + '/6)',
    icon: 'flower',
    run: () => say(game, null, ['Choose how to decorate ' + village.name + ':'], [...decorateVillageChoices(game, village, state), { label: 'Cancel', run: () => {} }]),
  });
  if (nextFreeTurretIndex(village, state) >= 0) {
    choices.push({
      label: 'Build Defense Turret (' + (state.turrets || []).length + '/' + turretSpots(village).length + ')',
      icon: 'shield',
      run: () => offerTurretBuild(game, village),
    });
  }
  if (game.player.lexis >= 50) {
    choices.push({
      label: 'Donate 50 Lexis to Village (+Mood, -10 Infamy)',
      icon: 'people',
      run: () => {
        game.player.lexis -= 50;
        changeVillageMood(game, village.id, 10);
        addHappiness(game, 2);
        addInfamy(game, -10);
        cue(game, 'trade');
        notify(game, '💛 Donated 50 Lexis to ' + village.name + '!', '#7cfc9a');
      },
    });
  }
  choices.push({ label: 'Leave', run: () => {} });

  const statusLine = village.name + ' Notice Board — Mood: ' + (state.mood ?? 50) + '/100 · Decor: ' + (state.decor || 0) + ' · Turrets: ' + (state.turrets || []).length + '/' + turretSpots(village).length + (isFestivalActive(game, village.id) ? ' · 🎉 FESTIVAL TODAY!' : '');
  const progressLines = activeHere.map((b) => '• ' + b.title + ': ' + bountyProgress(game, b) + '/' + b.need);
  say(game, null, [statusLine, ...(progressLines.length > 0 ? progressLines : ['Available bounties and town projects below:'])], choices);
}

export function interactBanditCamp(game, camp) {
  const clan = BANDIT_CLANS.find((item) => item.id === camp.clan) || BANDIT_CLANS[0];
  say(game, null, ['Banner of ' + clan.name + '! ' + clan.chief + ' and a band of thugs guard the camp.'], [
    {
      label: 'Challenge ' + clan.chief + '!',
      icon: 'woodSword',
      run: () => {
        startSocietyFight(game, {
          name: clan.chief,
          shape: 'knight',
          tag: 'hard',
          health: 110,
          attack: 22,
          speed: 12,
          xp: 70,
          lexis: 60,
        }, {
          kind: 'banditChief',
          clanId: clan.id,
          chiefName: clan.chief,
        });
      },
    },
    { label: 'Back away quietly', run: () => {} },
  ]);
}

// ---------- Festivals & Fireworks ----------

function activateFestivalFor(game, village, state, quiet) {
  const s = ensureSociety(game);
  s.feastActive[village.id] = game.day;
  state.feast = game.day + 7 + Math.floor(Math.random() * 8);
  changeVillageMood(game, village.id, 5);
  if (!quiet) {
    const near = Math.hypot(village.x + village.w / 2 - game.player.x, village.y + village.h / 2 - game.player.y) < 160 || village.id === 'lexia';
    if (near) notify(game, '🎉 ' + village.name + ' throws a Village Festival today! 25% off trade & fireworks tonight!', '#ffd23f');
  }
}

export function newDayFestivals(game) {
  const s = ensureSociety(game);
  for (const id of Object.keys(s.feastActive)) {
    if (s.feastActive[id] < game.day) delete s.feastActive[id];
  }
  for (const village of VILLAGES) {
    const state = game.villages[village.id];
    if (!state || state.owner !== 'people') continue;
    if (game.day >= state.feast) activateFestivalFor(game, village, state, false);
  }
}

function hashOf(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function slowFestivals(game) {
  const s = ensureSociety(game);
  for (const village of VILLAGES) {
    const state = game.villages[village.id];
    if (state && state.owner === 'people' && game.day >= state.feast && s.feastActive[village.id] !== game.day) {
      activateFestivalFor(game, village, state, false);
    }
  }

  for (const villager of game.run.villagers) {
    if (villager.ko && villager.ko.wakeAtHour !== undefined && gameHours(game) >= villager.ko.wakeAtHour) {
      villager.ko = false;
    }
    const festival = isFestivalActive(game, villager.village);
    if (festival && !villager.ko && !villager.dead && !villager.knight) {
      const roll = hashOf(villager.id + ':' + game.day) % 10;
      villager.dancing = roll < 8;
      if (villager.dancing && villager.task === 'home' && game.hour >= 17) {
        villager.task = 'work';
        villager.wait = 10;
      }
      if (!villager.kid && roll < 3 && villager.drunk === 0 && game.hour >= 15) {
        villager.drunk = 1;
      }
    } else if (!festival && villager.dancing) {
      villager.dancing = false;
    }
  }
}

export function updateFestivalsAndFireworks(game, dt) {
  // Update active sky fireworks
  const sparks = game.run.fireworks || [];
  for (const fw of sparks) fw.age += dt;
  game.run.fireworks = sparks.filter((fw) => fw.age < fw.life);

  // Spawn fireworks in festival villages during evening/night (17:00 - 05:00)
  const zone = zoneAt(game.player.x, game.player.y);
  const inFestival = zone.kind === 'village' && isFestivalActive(game, zone.id);
  const isEvening = game.hour >= 17 || game.hour < 5;
  if (inFestival && isEvening && game.run.fireworks.length < 6 && Math.random() < dt * 0.9) {
    const colors = ['#ff5a6e', '#ffd23f', '#7cfc9a', '#5fd3e8', '#d8b4f8', '#ff9a2b'];
    const square = zone.plan.square || zone;
    game.run.fireworks.push({
      x: square.x + 2 + Math.random() * Math.max(4, square.w - 4),
      y: square.y + 1 + Math.random() * Math.max(3, square.h - 4),
      color: pickRandom(colors),
      color2: pickRandom(colors),
      age: 0,
      life: 1.4,
      seed: Math.random() * 100,
    });
    cue(game, 'firework');
  }
}

// ---------- Blacksmith Villager Tagging & Hostile Guard Chases ----------

export function syncVillageSmiths(game) {
  const awake = game.run.awake || [];
  for (const id of awake) {
    const village = villageOf(id);
    if (!village || !village.plan.houses.some((h) => h.role === 'forge' || h.role === 'smithy')) continue;
    const inVillage = game.run.villagers.filter((v) => v.village === id);
    if (inVillage.some((v) => v.isSmith)) continue;
    const candidate = inVillage.find((v) => v.job === 'stonecutter' || v.job === 'builder' || v.job === 'foreman');
    if (candidate) {
      candidate.isSmith = true;
      candidate.jobName = 'Blacksmith';
    }
  }
}

function confrontWithGuard(game, knight) {
  const s = ensureSociety(game);
  const fine = 45 + Math.round(s.infamy * 0.8);
  game.run.guardCooldownUntil = Date.now() + 10000;
  cue(game, 'alarm');
  say(game, null, [knight.name + ' (Town Knight): "Halt! You are wanted for crimes against the village!"'], [
    {
      label: 'Pay fine (' + fine + ' Lexis · -10 Infamy)',
      icon: 'lexis',
      run: () => {
        if (game.player.lexis < fine) {
          say(game, null, [knight.name + ': "Not enough Lexis? Then defend yourself!"'], [
            { label: 'Fight!', icon: 'woodSword', run: () => launchGuardFight(game, knight) },
          ]);
          return;
        }
        game.player.lexis -= fine;
        addInfamy(game, -10);
        changeVillageMood(game, knight.village, 4);
        knight.angry = 0;
        notify(game, '⚖️ Paid ' + fine + ' Lexis fine (-10 Infamy).', '#ffd23f');
      },
    },
    {
      label: 'Fight the Knight!',
      icon: 'woodSword',
      run: () => launchGuardFight(game, knight),
    },
    {
      label: 'Break away and run',
      icon: 'step',
      run: () => {
        game.run.guardCooldownUntil = Date.now() + 12000;
        notify(game, '🏃 You slipped past the guard!', '#ffd23f');
      },
    },
  ]);
}

function launchGuardFight(game, knight) {
  knight.fighting = true;
  startSocietyFight(game, {
    name: knight.name + ' (Town Knight)',
    shape: 'knight',
    tag: isVillain(game) ? 'hard' : 'normal',
    health: 75,
    attack: 22,
    speed: 11,
    xp: 45,
    lexis: 30,
  }, {
    kind: 'townFight',
    role: 'guard',
    villagerId: knight.id,
    villageId: knight.village,
    name: knight.name,
  });
}

export function updateGuards(game, dt) {
  const villain = isVillain(game);
  const now = Date.now();
  for (const villager of game.run.villagers) {
    if (!villager.knight || villager.ko || villager.dead || villager.fighting) continue;
    const dist = Math.hypot(villager.x - game.player.x, villager.y - game.player.y);
    const hostile = villager.angry > 0 || (villain && dist < 5.5 && now > game.run.guardCooldownUntil);
    if (!hostile || dist > 9) continue;
    if (dist > 0.9) {
      const dx = ((game.player.x - villager.x) / dist) * 2.1 * dt;
      const dy = ((game.player.y - villager.y) / dist) * 2.1 * dt;
      if (!isSolid(villager.x + dx, villager.y)) villager.x += dx;
      if (!isSolid(villager.x, villager.y + dy)) villager.y += dy;
      villager.walking = true;
      villager.step += dt * 7;
    }
    if (dist <= 1.15 && now > game.run.safeUntil && now > game.run.guardCooldownUntil && game.run.screen === 'play') {
      confrontWithGuard(game, villager);
      break;
    }
  }
}
