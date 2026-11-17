import { KINGDOMS, kingdomOf, areEnemies } from '../data/kingdoms';
import { zoneAt, villageOf } from '../data/zones';
import { NEGOTIATION } from '../data/negotiation';
import { addItem, countItem, removeItem } from './player';
import { passHours } from './days';
import { speedOf } from './player';
import { makeDuel } from './duels';
import { startFight } from './fight';
import { ensureSociety, addInfamy, changeVillageMood, ridingSpeedMultiplier } from './society/state';
import { rankIndex, ensureGuild } from './guild/ranks';
import { encumbranceStatus } from './weight';
import { say, notify } from './messages';
import { cue } from './cues';

// Kingdom Politics, Diplomatic Passes, Borders, Contraband & Prison Justice.

export function firstKingdoms() {
  const rep = {};
  const passes = {};
  for (const k of KINGDOMS) {
    rep[k.id] = k.id === 'lexia' ? 10 : 0;
    passes[k.id] = 0;
  }
  return { rep, passes, allegiance: null, jail: null, lastBorderWarnDay: 0, lastKingdom: 'lexia' };
}

export function ensureKingdoms(game) {
  if (!game.kingdoms || typeof game.kingdoms !== 'object') game.kingdoms = firstKingdoms();
  const ks = game.kingdoms;
  if (!ks.rep) ks.rep = {};
  if (!ks.passes) ks.passes = {};
  for (const k of KINGDOMS) {
    if (typeof ks.rep[k.id] !== 'number') ks.rep[k.id] = k.id === 'lexia' ? 10 : 0;
    if (typeof ks.passes[k.id] !== 'number') ks.passes[k.id] = 0;
  }
  if (ks.allegiance === undefined) ks.allegiance = null;
  if (ks.jail === undefined) ks.jail = null;
  if (typeof ks.lastBorderWarnDay !== 'number') ks.lastBorderWarnDay = 0;
  if (!ks.lastKingdom) ks.lastKingdom = 'lexia';
  return ks;
}

export function kingdomRep(game, kingdomId) {
  if (!kingdomId) return 0;
  return ensureKingdoms(game).rep[kingdomId] ?? 0;
}

export function changeKingdomRep(game, kingdomId, delta) {
  if (!kingdomId) return 0;
  const ks = ensureKingdoms(game);
  const next = Math.max(-100, Math.min(100, Math.round((ks.rep[kingdomId] ?? 0) + delta)));
  ks.rep[kingdomId] = next;
  return next;
}

export function hasValidPass(game, kingdomId) {
  if (!kingdomId) return true;
  const ks = ensureKingdoms(game);
  if ((ks.passes[kingdomId] || 0) >= (game.day || 1)) return true;
  if (countItem(game.player, 'royalPass') > 0) return true;
  // Rank B+ adventurers enjoy diplomatic guild privilege unless explicitly hostile
  if (rankIndex(ensureGuild(game).rank) >= rankIndex('B') && kingdomRep(game, kingdomId) >= 0 && !isEnemyKingdom(game, kingdomId)) {
    return true;
  }
  return false;
}

export function isEnemyKingdom(game, kingdomId) {
  const ks = ensureKingdoms(game);
  return Boolean(ks.allegiance && kingdomId && areEnemies(ks.allegiance, kingdomId));
}

export function currentKingdomId(game) {
  const z = zoneAt(game.player.x, game.player.y);
  if (z.kind === 'village' && z.kingdom) return z.kingdom;
  return null;
}

export function rulerStandingLabel(rep) {
  if (rep >= 60) return 'Honored Champion';
  if (rep >= 25) return 'Trusted Friend';
  if (rep >= 0) return 'Neutral';
  if (rep >= -25) return 'Suspicious';
  return 'Hostile Outlaw';
}

export function rulerChoices(game, npc) {
  if (!npc.rulerOf) return [];
  const kId = npc.rulerOf;
  const k = kingdomOf(kId);
  const ks = ensureKingdoms(game);
  const rep = kingdomRep(game, kId);
  const passCost = Math.max(30, 80 - rankIndex(ensureGuild(game).rank) * 8 - Math.max(0, Math.floor(rep / 4)));
  const choices = [
    {
      label: k.name + ' Standing & Borders (Rep ' + rep + ')',
      icon: 'crown',
      run: () => {
        const passTxt = (ks.passes[kId] || 0) >= game.day ? 'Active royal pass until Day ' + ks.passes[kId] + '.' : 'No temporary decree pass yet.';
        const enemyTxt = k.enemies.length > 0 ? ' Currently at war with: ' + k.enemies.map((e) => kingdomOf(e)?.name || e).join(', ') + '.' : ' Currently at peace.';
        say(game, npc.id, [
          'Your standing in ' + k.name + ' is ' + rep + ' (' + rulerStandingLabel(rep) + '). ' + passTxt,
          enemyTxt,
        ]);
      },
    },
    {
      label: 'Request Royal Border Pass (' + passCost + ' Lexis, 20 days)',
      icon: 'royalPass',
      run: () => {
        if (rep < -20) {
          say(game, npc.id, ['With your criminal reputation (' + rep + '), earn our trust or pay a pardon first.']);
          return;
        }
        if (game.player.lexis < passCost) {
          say(game, npc.id, ['A sealed royal pass requires ' + passCost + ' Lexis in treasury stamp fees.']);
          return;
        }
        game.player.lexis -= passCost;
        ks.passes[kId] = Math.max(ks.passes[kId] || 0, game.day) + 20;
        addItem(game.player, 'royalPass', 1);
        changeKingdomRep(game, kId, 5);
        cue(game, 'victory');
        say(game, npc.id, ['Stamped with the crest of ' + k.name + '. Show this at border patrols across our gates.']);
      },
    },
  ];

  if (ks.allegiance !== kId) {
    choices.push({
      label: 'Pledge Allegiance to ' + k.name + ' (Free borders here)',
      icon: 'shield',
      run: () => {
        if (rep < 10) {
          say(game, npc.id, ['Raise your reputation in ' + k.name + ' to at least +10 before swearing fealty.']);
          return;
        }
        ks.allegiance = kId;
        ks.passes[kId] = Math.max(ks.passes[kId] || 0, game.day + 45);
        for (const e of k.enemies) changeKingdomRep(game, e, -25);
        changeKingdomRep(game, kId, 15);
        cue(game, 'warHorn');
        notify(game, '👑 Sworn allegiance to ' + k.name + '! Enemy borders will now watch you closely.', '#ffd23f');
      },
    });
  }

  if (rep < 0) {
    const pardon = Math.abs(rep) * 4 + 40;
    choices.push({
      label: 'Pay Royal Pardon (' + pardon + ' Lexis -> Rep 0)',
      icon: 'lexis',
      run: () => {
        if (game.player.lexis < pardon) {
          say(game, npc.id, ['A royal pardon costs ' + pardon + ' Lexis.']);
          return;
        }
        game.player.lexis -= pardon;
        ks.rep[kId] = 0;
        addInfamy(game, -15);
        cue(game, 'coin');
        notify(game, '🕊️ Pardoned by ' + k.name + '!', '#7cfc9a');
      },
    });
  }
  return choices;
}

// ---------- Guard Escape Check & Real Prison Sentence ----------

export function tryEscapeGuard(game) {
  const spd = speedOf(game.player, game);
  const mount = ridingSpeedMultiplier(game);
  const enc = encumbranceStatus(game);
  const chance = Math.max(0.2, Math.min(0.85, (0.32 + (spd - 10) * 0.03 + (mount > 1.2 ? 0.22 : 0)) * enc.speedMult));
  return Math.random() < chance;
}

export function arrestPlayer(game, villageId, guardName = 'Town Guard', reason = 'Violating kingdom law') {
  const ks = ensureKingdoms(game);
  const s = ensureSociety(game);
  const fineConfiscation = Math.min(game.player.lexis, Math.round(25 + s.infamy * 0.5));
  const bail = Math.max(40, Math.round(60 + s.infamy * 1.1));
  game.player.lexis -= fineConfiscation;
  ks.jail = { villageId, bail, guardName, confiscated: fineConfiscation };

  const village = villageOf(villageId);
  if (village?.kingdom) changeKingdomRep(game, village.kingdom, -6);

  cue(game, 'alarm');
  say(game, null, [
    '⛓️ Arrested by ' + guardName + ' (' + reason + ')!',
    fineConfiscation > 0 ? 'Confiscated ' + fineConfiscation + ' Lexis into the garrison chest. You sit behind iron bars.' : 'You sit behind iron bars in the garrison cell.',
  ], [
    {
      label: 'Serve sentence (12h lockup · -20 Infamy)',
      icon: 'sleep',
      run: () => {
        passHours(game, 12);
        addInfamy(game, -20);
        game.player.fatigue = 0;
        ks.jail = null;
        game.run.guardCooldownUntil = Date.now() + 20000;
        notify(game, '🔓 Released after serving your sentence (-20 Infamy).', '#ffd23f');
      },
    },
    {
      label: 'Pay Bail (' + bail + ' Lexis · -15 Infamy)',
      icon: 'lexis',
      run: () => {
        if (game.player.lexis < bail) {
          say(game, null, ['Not enough Lexis for bail. Wait out your 12h sentence or plead parole!'], [
            {
              label: 'Serve 12h instead',
              icon: 'sleep',
              run: () => {
                passHours(game, 12);
                addInfamy(game, -20);
                game.player.fatigue = 0;
                ks.jail = null;
                game.run.guardCooldownUntil = Date.now() + 20000;
              },
            },
          ]);
          return;
        }
        game.player.lexis -= bail;
        addInfamy(game, -15);
        ks.jail = null;
        game.run.guardCooldownUntil = Date.now() + 20000;
        notify(game, '🔓 Paid ' + bail + ' Lexis bail and walked free.', '#7cfc9a');
      },
    },
    {
      label: 'Parole Hearing (Hard English duel)',
      icon: 'book',
      run: () => {
        const duel = makeDuel(
          { id: null, name: 'Magistrate of ' + (village?.name || 'Law') },
          {
            title: 'Parole Hearing',
            category: 'vocabulary',
            tag: 'hard',
            health: 4,
            speed: 12,
            questions: NEGOTIATION,
            onWin: () => {
              addInfamy(game, -25);
              ks.jail = null;
              game.run.guardCooldownUntil = Date.now() + 25000;
              say(game, null, ['The magistrate stamps your parole papers! Your infamy drops by 25.']);
            },
            onLose: () => {
              passHours(game, 12);
              addInfamy(game, -12);
              ks.jail = null;
              game.run.guardCooldownUntil = Date.now() + 20000;
              say(game, null, ['Appeal denied. You served 12 hours in the cells before release.']);
            },
          }
        );
        startFight(game, duel);
      },
    },
  ]);
}

// ---------- Border Checkpoint on Entering Hostile or Rival Kingdom Towns ----------

export function updateBorders(game) {
  if (!game.run || game.run.screen !== 'play' || game.run.dialog || game.run.fight) return;
  const ks = ensureKingdoms(game);
  const z = zoneAt(game.player.x, game.player.y);
  if (z.kind !== 'village' || !z.kingdom) return;
  const kId = z.kingdom;
  if (ks.lastKingdom === kId) return;
  ks.lastKingdom = kId;

  const rep = kingdomRep(game, kId);
  const enemy = isEnemyKingdom(game, kId);
  if (!enemy && rep > -20) return;
  if (hasValidPass(game, kId)) return;
  if (ks.lastBorderWarnDay === game.day) return;
  ks.lastBorderWarnDay = game.day;

  const k = kingdomOf(kId);
  const tariff = enemy ? 60 : 35;
  const patrolName = (k?.name || kId) + ' Border Captain';
  const options = [];

  if (countItem(game.player, 'royalPass') > 0) {
    options.push({
      label: 'Present Diplomatic Pass (1 Pass · 20 days)',
      icon: 'royalPass',
      run: () => {
        removeItem(game.player, 'royalPass', 1);
        ks.passes[kId] = game.day + 20;
        notify(game, '📜 Border patrol stamped your Diplomatic Pass for ' + (k?.name || kId) + '.', '#7cfc9a');
      },
    });
  }
  options.push({
    label: 'Talk through Customs (Hard duel)',
    icon: 'book',
    run: () => {
      startFight(
        game,
        makeDuel(
          { id: null, name: patrolName },
          {
            title: 'Border Inspection',
            category: 'vocabulary',
            tag: 'hard',
            health: 4,
            speed: 12,
            questions: NEGOTIATION,
            onWin: () => {
              ks.passes[kId] = game.day + 3;
              changeKingdomRep(game, kId, 4);
              say(game, null, ['"Your papers and accent check out. Three-day transit granted."']);
            },
            onLose: () => arrestPlayer(game, z.id, patrolName, 'Failed border inspection'),
          }
        )
      );
    },
  });
  options.push({
    label: 'Pay Border Tariff (' + tariff + ' Lexis)',
    icon: 'lexis',
    run: () => {
      if (game.player.lexis < tariff) {
        arrestPlayer(game, z.id, patrolName, 'Refused border tariff');
        return;
      }
      game.player.lexis -= tariff;
      ks.passes[kId] = game.day + 3;
      notify(game, '🪙 Paid ' + tariff + ' Lexis customs toll.', '#ffd086');
    },
  });
  options.push({
    label: 'Smuggle Past! (+10 Infamy, -12 Rep)',
    icon: 'sword',
    run: () => {
      addInfamy(game, 10);
      changeKingdomRep(game, kId, -12);
      changeVillageMood(game, z.id, -8);
      if (tryEscapeGuard(game)) {
        game.run.guardCooldownUntil = Date.now() + 12000;
        notify(game, '🏃 Slipped past the checkpoint with your cargo!', '#ffd23f');
      } else {
        arrestPlayer(game, z.id, patrolName, 'Border smuggling');
      }
    },
  });

  cue(game, 'alarm');
  say(
    game,
    null,
    ['🚧 ' + patrolName + ': "Halt! ' + (enemy ? 'Your allegiance is at war with ' + (k?.name || kId) + '!' : 'You have a hostile record here.') + ' Papers or toll!"'],
    options
  );
}
