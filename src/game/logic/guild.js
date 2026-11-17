import { NPCS, npcOf } from '../data/npcs';
import { NEGOTIATION } from '../data/negotiation';
import { startFight } from './fight';
import { makeDuel } from './duels';
import { addFriendship } from './village';
import { say, notify } from './messages';
import {
  ensureGuild,
  rankInfo,
  nextRankInfo,
  maxPartySize,
  registerAdventurerCard,
  canTakePromotionExam,
  startPromotionExam,
  boardContractsFor,
  acceptGuildContract,
  completeGuildContract,
  isGuildContractReady,
  guildContractProgress,
  dailyWageOf,
} from './guild/ranks';

// The Guild of Adventurers. The hero registers an Adventurer Card (F -> S ranks), takes promotion exams,
// takes procedural contracts, and recruits fighters (paid daily wages unless spouse).

export const MAX_PARTY = 2;
const DEAL = 0.6;

export function feeOf(npc) {
  return npc.fee || 150;
}

export function recruits(game) {
  return NPCS.filter((npc) => {
    const state = game.npcs[npc.id];
    const isKnown = npc.guild || (npc.wanderer && state.met);
    return npc.fighter && isKnown && state.alive && !game.player.party.includes(npc.id);
  });
}

function hire(game, npc, price) {
  const cap = maxPartySize(game);
  if (game.player.lexis < price) {
    say(game, null, ['You do not have ' + price + ' Lexis. Come back with the money: ' + npc.name + ' will wait.']);
    return;
  }
  if (game.player.party.length >= cap) {
    say(game, null, ['You already lead ' + cap + ' adventurers (Rank ' + ensureGuild(game).rank + ' limit). Reach higher Guild Ranks or dismiss someone first!']);
    return;
  }
  game.player.lexis -= price;
  game.player.party.push(npc.id);
  addFriendship(game, npc.id, 5);
  const wage = dailyWageOf(game, npc.id);
  notify(game, '⚔️ ' + npc.name + ' joins you (' + price + ' Lexis, ' + wage + ' Lexis/day wage)!', '#7CFC9A');
}

export function negotiateFee(game, npc) {
  const fee = feeOf(npc);
  const deal = Math.round(fee * DEAL);
  function win() {
    say(game, npc.id, ['...You speak like a merchant. Fine: ' + deal + ' Lexis, and I follow you.'], [
      { label: 'Deal! (' + deal + ' Lexis)', icon: 'lexis', run: () => hire(game, npc, deal) },
      { label: 'Not now', run: () => {} },
    ]);
  }
  function lose() {
    game.npcs[npc.id].refusedDay = game.day;
    say(game, npc.id, ['No. My price is ' + fee + ' Lexis. Take it or leave it. And not another word today.'], [
      { label: 'Pay ' + fee + ' Lexis', icon: 'lexis', run: () => hire(game, npc, fee) },
      { label: 'Leave', run: () => {} },
    ]);
  }
  const duel = makeDuel(npc, { title: 'Negotiation with ' + npc.name, category: 'vocabulary', tag: 'hard', health: 4, speed: 11, questions: NEGOTIATION, onWin: win, onLose: lose });
  startFight(game, duel);
}

function proposeRecruit(game, npc) {
  if (game.npcs[npc.id].refusedDay === game.day) {
    say(game, null, [npc.name + ' does not want to talk about money again today. Tomorrow.']);
    return;
  }
  const wage = dailyWageOf(game, npc.id);
  say(game, npc.id, [npc.hello[0], 'Fee: ' + feeOf(npc) + ' Lexis (+ ' + wage + ' Lexis/day upkeep). Negotiable... if you have the words.'], [
    { label: 'Negotiate (hard sentences)', icon: 'book', run: () => negotiateFee(game, npc) },
    { label: 'Pay ' + feeOf(npc) + ' Lexis', icon: 'lexis', run: () => hire(game, npc, feeOf(npc)) },
    { label: 'Leave', run: () => {} },
  ]);
}

export function openGuildDesk(game, examinerNpc = null, villageId = 'lexia') {
  const g = ensureGuild(game);
  const info = rankInfo(g.rank);
  const next = nextRankInfo(g.rank);
  const speakerId = examinerNpc?.id || null;
  const header =
    'Adventurer Guild · ' +
    (g.registered ? info.title + ' (' + g.points + ' pts · Party cap ' + info.partyCap + ')' : 'Unregistered traveler') +
    (next ? ' · Next: Rank ' + next.id + ' at ' + next.minPts + ' pts' : ' · Maximum Rank!');

  const choices = [];
  if (!g.registered) {
    choices.push({
      label: 'Register Adventurer Card (Free)',
      icon: 'quests',
      run: () => {
        registerAdventurerCard(game);
        openGuildDesk(game, examinerNpc, villageId);
      },
    });
  }
  if (next) {
    const ready = canTakePromotionExam(game);
    choices.push({
      label: 'Promotion Exam -> Rank ' + next.id + ' (' + g.points + '/' + next.minPts + ' pts · Fee ' + next.fee + ')',
      icon: 'crown',
      run: () => startPromotionExam(game, examinerNpc),
    });
    if (!ready && g.points >= next.minPts) {
      choices.push({ label: '(Need ' + next.fee + ' Lexis for seal fee)', run: () => {} });
    }
  }

  const readyContracts = g.activeContracts.filter((c) => isGuildContractReady(game, c));
  for (const c of readyContracts) {
    choices.push({
      label: 'Turn in: ' + c.title + ' (+' + c.lexis + ' Lexis, +' + c.points + ' pts)',
      icon: 'lexis',
      run: () => {
        completeGuildContract(game, c.id, villageId);
        openGuildDesk(game, examinerNpc, villageId);
      },
    });
  }

  choices.push({
    label: 'Guild Contracts Board (' + g.activeContracts.length + '/2 active)',
    icon: 'quests',
    run: () => openGuildContractsMenu(game, villageId, examinerNpc),
  });

  choices.push({
    label: 'Hire an Adventurer (Party ' + game.player.party.length + '/' + info.partyCap + ')',
    icon: 'woodSword',
    run: () => {
      const list = recruits(game);
      if (list.length === 0) {
        say(game, speakerId, ['No adventurer is free right now. Meet wanderers on the roads!']);
        return;
      }
      say(game, speakerId, ['Who do you want to hire? Mercenaries draw a daily wage.'], [
        ...list.map((recruit) => ({
          label: recruit.name + ' · ' + recruit.role + ' · ' + feeOf(recruit) + ' Lexis (' + dailyWageOf(game, recruit.id) + '/day)',
          icon: 'woodSword',
          run: () => proposeRecruit(game, recruit),
        })),
        { label: 'Leave', run: () => {} },
      ]);
    },
  });

  choices.push({ label: 'Leave', run: () => {} });
  say(game, speakerId, [header], choices);
}

export function openGuildContractsMenu(game, villageId = 'lexia', examinerNpc = null) {
  const g = ensureGuild(game);
  const contracts = boardContractsFor(game, villageId);
  const choices = [];
  for (const c of g.activeContracts) {
    const have = guildContractProgress(game, c);
    const ready = have >= c.need;
    choices.push({
      label: (ready ? '✓ Turn in ' : 'Active ') + c.title + ' (' + have + '/' + c.need + ')',
      icon: ready ? 'lexis' : 'quests',
      run: () => {
        if (ready) {
          completeGuildContract(game, c.id, villageId);
          openGuildContractsMenu(game, villageId, examinerNpc);
        } else {
          say(game, null, [c.desc + '\nProgress: ' + have + '/' + c.need + ' · Reward: ' + c.lexis + ' Lexis & ' + c.points + ' Guild Pts.']);
        }
      },
    });
  }
  for (const c of contracts) {
    if (c.accepted || g.activeContracts.some((a) => a.id === c.id)) continue;
    choices.push({
      label: '[Rank ' + c.minRank + '+] ' + c.title + ' (+' + c.lexis + ' Lexis, +' + c.points + ' pts)',
      icon: 'quests',
      run: () => {
        acceptGuildContract(game, c);
        openGuildContractsMenu(game, villageId, examinerNpc);
      },
    });
  }
  choices.push({ label: 'Back', run: () => (examinerNpc ? openGuildDesk(game, examinerNpc, villageId) : null) });
  say(game, null, ['Guild Contract Board (' + ensureGuild(game).rank + '-Rank): fresh assignments post each dawn.'], choices);
}

export function guildChoice(game, npc) {
  if (!npc.guildMaster) return null;
  const g = ensureGuild(game);
  const next = nextRankInfo(g.rank);
  const label = next && g.points >= next.minPts ? 'Guild Desk (Promotion Ready!)' : 'Guild Desk · Rank ' + g.rank + ' & Recruits';
  return { label, icon: 'quests', run: () => openGuildDesk(game, npc, 'lexia') };
}

export { npcOf };
