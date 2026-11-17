import { ITEMS } from '../../data/items';
import { NPCS, npcOf } from '../../data/npcs';
import { zoneAt, villageOf } from '../../data/zones';
import { SPECIES } from '../../data/monsters';
import { NEGOTIATION } from '../../data/negotiation';
import { randomOf } from '../../world/seeded';
import { missingInputsFor, econVillage } from '../economy';
import { countItem, removeItem, earnLexis, gainXp } from '../player';
import { startFight } from '../fight';
import { makeDuel } from '../duels';
import { say, notify } from '../messages';
import { cue } from '../cues';
import { companionRank } from '../bonds/training';

// Adventurer Guild System:
// - F -> E -> D -> C -> B -> A -> S ranks with TOEIC promotion exams & party cap scaling (2 -> 3 -> 4)
// - Procedural daily guild contracts tied to local economy shortages, monster threats & occupied towns
// - Companion combat HP, KO/healing state & daily mercenary wages

export const GUILD_RANKS = [
  { id: 'F', minPts: 0, partyCap: 2, payBonus: 1.0, examTag: 'normal', examHp: 3, fee: 0, title: 'Novice F-Rank' },
  { id: 'E', minPts: 40, partyCap: 2, payBonus: 1.1, examTag: 'normal', examHp: 4, fee: 15, title: 'Iron E-Rank' },
  { id: 'D', minPts: 120, partyCap: 3, payBonus: 1.2, examTag: 'normal', examHp: 5, fee: 30, title: 'Copper D-Rank' },
  { id: 'C', minPts: 260, partyCap: 3, payBonus: 1.32, examTag: 'hard', examHp: 4, fee: 50, title: 'Silver C-Rank' },
  { id: 'B', minPts: 480, partyCap: 4, payBonus: 1.45, examTag: 'hard', examHp: 5, fee: 80, title: 'Gold B-Rank' },
  { id: 'A', minPts: 800, partyCap: 4, payBonus: 1.6, examTag: 'hard', examHp: 6, fee: 120, title: 'Platinum A-Rank' },
  { id: 'S', minPts: 1250, partyCap: 4, payBonus: 1.8, examTag: 'extreme', examHp: 5, fee: 200, title: 'Mythril S-Rank' },
];

const HEALER_NPCS = new Set(['aria', 'elara', 'sylvia']);
const TANK_NPCS = new Set(['arthur', 'lyra', 'garrick']);
const MAGE_NPCS = new Set(['luna', 'selene', 'vespera', 'yuki']);

export function firstGuild() {
  return {
    registered: false,
    rank: 'F',
    points: 0,
    completed: 0,
    activeContracts: [],
    boards: {},
    companionHp: {},
    companionKo: {},
    unpaidDays: 0,
    lastWageDay: 1,
  };
}

export function ensureGuild(game) {
  if (!game.guild || typeof game.guild !== 'object') game.guild = firstGuild();
  const g = game.guild;
  if (typeof g.registered !== 'boolean') g.registered = false;
  if (!GUILD_RANKS.some((r) => r.id === g.rank)) g.rank = 'F';
  if (typeof g.points !== 'number') g.points = 0;
  if (typeof g.completed !== 'number') g.completed = 0;
  if (!Array.isArray(g.activeContracts)) g.activeContracts = [];
  if (!g.boards || typeof g.boards !== 'object') g.boards = {};
  if (!g.companionHp || typeof g.companionHp !== 'object') g.companionHp = {};
  if (!g.companionKo || typeof g.companionKo !== 'object') g.companionKo = {};
  if (typeof g.unpaidDays !== 'number') g.unpaidDays = 0;
  if (typeof g.lastWageDay !== 'number') g.lastWageDay = game.day || 1;
  return g;
}

export function rankIndex(rankId) {
  const idx = GUILD_RANKS.findIndex((r) => r.id === rankId);
  return idx >= 0 ? idx : 0;
}

export function rankInfo(rankId) {
  return GUILD_RANKS[rankIndex(rankId)];
}

export function nextRankInfo(rankId) {
  const idx = rankIndex(rankId);
  return idx + 1 < GUILD_RANKS.length ? GUILD_RANKS[idx + 1] : null;
}

export function maxPartySize(game) {
  const g = ensureGuild(game);
  return rankInfo(g.rank).partyCap;
}

export function contractRewardBonus(game) {
  const g = ensureGuild(game);
  return rankInfo(g.rank).payBonus;
}

export function registerAdventurerCard(game) {
  const g = ensureGuild(game);
  if (g.registered) return false;
  g.registered = true;
  cue(game, 'victory');
  notify(game, '🪪 Adventurer Card issued! You are now Guild Rank F.', '#ffd23f');
  return true;
}

export function awardGuildPoints(game, pts, reason = null) {
  if (!pts || pts <= 0) return;
  const g = ensureGuild(game);
  const next = nextRankInfo(g.rank);
  const wasReady = next ? g.points >= next.minPts : false;
  g.points += Math.round(pts);
  if (reason) notify(game, '🎖️ +' + Math.round(pts) + ' Guild Pts (' + reason + ')', '#ffd23f');
  if (next && !wasReady && g.points >= next.minPts) {
    notify(game, '⬆️ Ready for Rank ' + next.id + ' Promotion Exam! Visit any Guild Hall.', '#7cfc9a');
  }
}

export function canTakePromotionExam(game) {
  const g = ensureGuild(game);
  const next = nextRankInfo(g.rank);
  if (!next) return false;
  return g.points >= next.minPts && (game.player.lexis || 0) >= next.fee;
}

export function startPromotionExam(game, examiner = null) {
  const g = ensureGuild(game);
  if (!g.registered) g.registered = true;
  const next = nextRankInfo(g.rank);
  if (!next) {
    say(game, examiner?.id || null, ['You already hold the highest guild honor: Mythril S-Rank!']);
    return false;
  }
  if (g.points < next.minPts) {
    say(game, examiner?.id || null, ['You need ' + next.minPts + ' Guild Points for the ' + next.title + ' exam (you have ' + g.points + '). Complete Guild contracts and hunt monsters!']);
    return false;
  }
  if (game.player.lexis < next.fee) {
    say(game, examiner?.id || null, ['The exam seal costs ' + next.fee + ' Lexis.']);
    return false;
  }
  game.player.lexis -= next.fee;
  const speakerName = examiner?.name || 'Guild Examiner';
  const duel = makeDuel(
    { id: examiner?.id || null, name: speakerName + ' (Rank ' + next.id + ' Exam)', look: examiner?.look || null },
    {
      title: 'Guild Exam: ' + next.title,
      category: 'vocabulary',
      tag: next.examTag,
      health: next.examHp,
      speed: 11 + rankIndex(next.id),
      questions: next.examTag === 'normal' ? NEGOTIATION : undefined,
      onWin: () => {
        g.rank = next.id;
        earnLexis(game, next.fee + 30);
        gainXp(game, 35 + rankIndex(next.id) * 15);
        cue(game, 'levelUp');
        say(game, examiner?.id || null, [
          'Stamp complete! You passed the ' + next.title + ' examination.',
          next.partyCap > rankInfo(GUILD_RANKS[rankIndex(next.id) - 1].id).partyCap
            ? 'Your party limit rises to ' + next.partyCap + ' companions, and higher-rank contracts are now open!'
            : 'Your contract rewards and kingdom border standing increased!',
        ]);
      },
      onLose: () => {
        say(game, examiner?.id || null, ['Not quite sharp enough for Rank ' + next.id + '. Train a bit more and retake the exam anytime.']);
      },
    }
  );
  startFight(game, duel);
  return true;
}

// ---------- Procedural Infinite Guild Contracts ----------

function pickHuntTarget(villageId, rand) {
  const village = villageOf(villageId);
  const zone = village ? zoneAt(village.x + village.w / 2, village.y + village.h / 2) : null;
  const biomePool = {
    meadow: ['slime', 'goblin', 'wolf', 'boar'],
    forest: ['goblin', 'wolf', 'spider', 'boar', 'bear'],
    desert: ['goblin', 'orc', 'drake', 'boar'],
    coast: ['slime', 'drowner', 'goblin', 'bison'],
    mountain: ['orc', 'iceGolem', 'darkKnight', 'bear', 'moose'],
  };
  const choices = biomePool[zone?.biome] || biomePool.meadow;
  return choices[Math.floor(rand() * choices.length)];
}

export function boardContractsFor(game, villageId) {
  const g = ensureGuild(game);
  const existing = g.boards[villageId];
  if (existing && existing.day === game.day && Array.isArray(existing.contracts)) {
    return existing.contracts;
  }
  const rand = randomOf('guildBoard:' + villageId + ':' + game.day);
  const playerRankIdx = rankIndex(g.rank);
  const bonus = contractRewardBonus(game);
  const contracts = [];

  // 1. Economic Supply Contract driven by real village workshop deficits
  const gaps = missingInputsFor(game, villageId);
  const supplyItem = gaps.length > 0 ? gaps[0].itemId : ['ore', 'pelt', 'herb', 'firewood', 'wool', 'rawMeat'][Math.floor(rand() * 6)];
  const supplyQty = Math.min(8, Math.max(2, (gaps[0]?.need ? Math.min(6, Math.ceil(gaps[0].need / 2)) : 3) + Math.floor(playerRankIdx / 2)));
  const baseUnit = ITEMS[supplyItem]?.sell || ITEMS[supplyItem]?.price || 10;
  contracts.push({
    id: 'gc-sup-' + villageId + '-' + game.day,
    villageId,
    kind: 'supply',
    minRank: 'F',
    itemId: supplyItem,
    need: supplyQty,
    title: 'Supply ' + supplyQty + '× ' + (ITEMS[supplyItem]?.name || supplyItem),
    desc: 'Deliver ' + supplyQty + ' ' + (ITEMS[supplyItem]?.name || supplyItem) + ' to aid workshops in ' + (villageOf(villageId)?.name || 'town') + '.',
    lexis: Math.round((supplyQty * baseUnit * 1.9 + 18) * bonus),
    xp: 25 + supplyQty * 4,
    points: 16 + supplyQty * 2,
    accepted: false,
  });

  // 2. Monster / Dangerous Wildlife Hunt Contract
  const speciesId = pickHuntTarget(villageId, rand);
  const spec = SPECIES[speciesId];
  const needKills = 3 + Math.min(4, Math.floor(playerRankIdx * 0.7)) + Math.floor(rand() * 2);
  contracts.push({
    id: 'gc-hunt-' + villageId + '-' + game.day,
    villageId,
    kind: 'hunt',
    minRank: 'F',
    species: speciesId,
    need: needKills,
    title: 'Cull ' + needKills + ' ' + (spec ? spec.name : speciesId) + 's',
    desc: 'Thin the ' + (spec ? spec.name.toLowerCase() : speciesId) + ' threat prowling outside ' + (villageOf(villageId)?.name || 'the gates') + '.',
    lexis: Math.round((needKills * (spec ? 14 : 18) + 25) * bonus),
    xp: needKills * 12,
    points: 20 + needKills * 3,
    accepted: false,
  });

  // 3. Higher-rank Expedition / Liberation / Rare Bounty
  const fallen = Object.entries(game.villages || {}).find(([, vs]) => vs.owner === 'monsters');
  if (fallen && villageOf(fallen[0])) {
    const fVillage = villageOf(fallen[0]);
    contracts.push({
      id: 'gc-lib-' + fVillage.id + '-' + game.day,
      villageId,
      kind: 'liberate',
      minRank: 'E',
      targetVillageId: fVillage.id,
      need: 1,
      title: 'Reclaim ' + fVillage.name,
      desc: 'Drive occupying monster warbands out of ' + fVillage.name + '.',
      lexis: Math.round(140 * bonus),
      xp: 80,
      points: 55,
      accepted: false,
    });
  } else {
    const rareItem = ['crystal', 'antler', 'warTrophy', 'pelt'][Math.floor(rand() * 4)];
    const qty = playerRankIdx >= 2 ? 3 : 2;
    const minRank = playerRankIdx >= 3 ? 'C' : 'E';
    contracts.push({
      id: 'gc-elite-' + villageId + '-' + game.day,
      villageId,
      kind: 'supply',
      minRank,
      itemId: rareItem,
      need: qty,
      title: 'Guild Request: ' + qty + '× ' + (ITEMS[rareItem]?.name || rareItem),
      desc: 'Rank ' + minRank + '+ urgent requisition for ' + (ITEMS[rareItem]?.name || rareItem) + '.',
      lexis: Math.round((qty * (ITEMS[rareItem]?.sell || 25) * 2.2 + 35) * bonus),
      xp: 55,
      points: 34,
      accepted: false,
    });
  }

  g.boards[villageId] = { day: game.day, contracts };
  return contracts;
}

export function guildContractProgress(game, c) {
  if (!c) return 0;
  if (c.kind === 'supply') return Math.min(c.need, countItem(game.player, c.itemId));
  if (c.kind === 'hunt') return Math.min(c.need, (game.kills?.[c.species] || 0) - (c.startKills || 0));
  if (c.kind === 'liberate') return game.villages?.[c.targetVillageId]?.owner === 'people' ? 1 : 0;
  return 0;
}

export function isGuildContractReady(game, c) {
  return guildContractProgress(game, c) >= c.need;
}

export function acceptGuildContract(game, contract) {
  const g = ensureGuild(game);
  if (!g.registered) registerAdventurerCard(game);
  if (rankIndex(g.rank) < rankIndex(contract.minRank || 'F')) {
    notify(game, '🪪 Requires Guild Rank ' + contract.minRank + ' to accept this contract!', '#ff8a95');
    return false;
  }
  if (g.activeContracts.some((c) => c.id === contract.id)) return false;
  if (g.activeContracts.length >= 2) {
    notify(game, '📜 You can hold at most 2 active Guild Contracts.', '#ffb070');
    return false;
  }
  const active = {
    ...contract,
    accepted: true,
    startKills: contract.kind === 'hunt' ? game.kills?.[contract.species] || 0 : 0,
  };
  g.activeContracts.push(active);
  const board = g.boards[contract.villageId];
  if (board) {
    const match = board.contracts.find((c) => c.id === contract.id);
    if (match) match.accepted = true;
  }
  cue(game, 'coin');
  notify(game, '📜 Accepted Guild Contract: ' + contract.title, '#7cfc9a');
  return true;
}

export function abandonGuildContract(game, contractId) {
  const g = ensureGuild(game);
  g.activeContracts = g.activeContracts.filter((c) => c.id !== contractId);
}

export function completeGuildContract(game, contractId, villageId = null) {
  const g = ensureGuild(game);
  const idx = g.activeContracts.findIndex((c) => c.id === contractId);
  if (idx < 0) return false;
  const c = g.activeContracts[idx];
  if (!isGuildContractReady(game, c)) return false;

  if (c.kind === 'supply') {
    removeItem(game.player, c.itemId, c.need);
    const econ = econVillage(game, villageId || c.villageId);
    if (econ) econ.inputs[c.itemId] = (econ.inputs[c.itemId] || 0) + c.need;
  }
  g.activeContracts.splice(idx, 1);
  g.completed += 1;
  earnLexis(game, c.lexis);
  gainXp(game, c.xp);
  awardGuildPoints(game, c.points, c.title);
  cue(game, 'victory');
  notify(game, '🏆 Contract completed! +' + c.lexis + ' Lexis, +' + c.xp + ' XP', '#7cfc9a');
  return true;
}

// ---------- Real Companion HP, Roles, KO & Daily Wages ----------

export function companionRoleOf(npcId) {
  if (HEALER_NPCS.has(npcId)) return 'healer';
  if (TANK_NPCS.has(npcId)) return 'tank';
  if (MAGE_NPCS.has(npcId)) return 'mage';
  return 'striker';
}

export function companionMaxHp(game, npcId) {
  const rank = companionRank(game, npcId);
  const tankBonus = TANK_NPCS.has(npcId) ? 25 : 0;
  return 65 + rank * 20 + ((game.player?.level || 1) - 1) * 5 + tankBonus;
}

export function companionHpOf(game, npcId) {
  const g = ensureGuild(game);
  const max = companionMaxHp(game, npcId);
  if (g.companionKo[npcId]) return 0;
  if (typeof g.companionHp[npcId] !== 'number') g.companionHp[npcId] = max;
  return Math.max(0, Math.min(max, Math.round(g.companionHp[npcId])));
}

export function damageCompanion(game, npcId, dmg) {
  const g = ensureGuild(game);
  const hp = companionHpOf(game, npcId);
  const next = Math.max(0, Math.round(hp - dmg));
  g.companionHp[npcId] = next;
  if (next === 0) {
    g.companionKo[npcId] = true;
    notify(game, '💢 ' + (npcOf(npcId)?.name || npcId) + ' is wounded and fell back!', '#ff8a95');
  }
  return next;
}

export function healCompanion(game, npcId, amount) {
  const g = ensureGuild(game);
  const max = companionMaxHp(game, npcId);
  const cur = typeof g.companionHp[npcId] === 'number' ? g.companionHp[npcId] : max;
  g.companionHp[npcId] = Math.min(max, Math.round(cur + amount));
  if (g.companionHp[npcId] > 0) g.companionKo[npcId] = false;
}

export function healAllCompanions(game) {
  const g = ensureGuild(game);
  for (const npcId of game.player?.party || []) {
    g.companionHp[npcId] = companionMaxHp(game, npcId);
    g.companionKo[npcId] = false;
  }
}

export function standingParty(game) {
  return (game.player?.party || []).filter((id) => companionHpOf(game, id) > 0);
}

export function dailyWageOf(game, npcId) {
  if (game.player?.spouse === npcId) return 0;
  const npc = NPCS.find((n) => n.id === npcId);
  const base = Math.max(6, Math.round(((npc?.fee || 140) / 14)));
  const friend = game.npcs?.[npcId]?.friendship || 0;
  return friend >= 80 ? Math.max(2, Math.floor(base / 2)) : base;
}

export function totalDailyWages(game) {
  return (game.player?.party || []).reduce((sum, id) => sum + dailyWageOf(game, id), 0);
}

export function newDayGuild(game) {
  const g = ensureGuild(game);
  // Restore unconscious companions lightly each dawn if resting in civilization
  for (const id of game.player?.party || []) {
    if (g.companionKo[id]) healCompanion(game, id, Math.round(companionMaxHp(game, id) * 0.5));
  }
  const due = totalDailyWages(game);
  if (due <= 0) {
    g.unpaidDays = 0;
    return;
  }
  if (game.player.lexis >= due) {
    game.player.lexis -= due;
    g.unpaidDays = 0;
    notify(game, '🪙 Paid party wages: ' + due + ' Lexis.', '#ffd086');
  } else {
    g.unpaidDays += 1;
    if (g.unpaidDays >= 2) {
      const merc = [...game.player.party].reverse().find((id) => dailyWageOf(game, id) > 0);
      if (merc) {
        game.player.party = game.player.party.filter((id) => id !== merc);
        g.unpaidDays = 0;
        notify(game, '📜 ' + (npcOf(merc)?.name || merc) + ' left the party (wages unpaid).', '#ff8a95');
      }
    } else {
      notify(game, '⚠️ Could not pay party wages (' + due + ' Lexis). Pay tomorrow or they leave!', '#ffb070');
    }
  }
}
