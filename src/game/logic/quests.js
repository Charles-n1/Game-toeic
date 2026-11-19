import { QUESTS } from '../data/quests';
import { ITEMS } from '../data/items';
import { countItem, addItem, removeItem, earnLexis } from './player';
import { addFriendship, addHappiness } from './village';
import { notify } from './messages';
import { recordQuestPromise, resolveQuestPromise } from './realism/socialAndCodex';

// game.quests: { questId: { done: false, killsAtStart: 3 } }. A quest that is not in it was never accepted.

export function countKill(game, speciesId) {
  game.kills[speciesId] = (game.kills[speciesId] || 0) + 1;
}

// How far the quest is: { have: 2, need: 5 }
export function questProgress(game, quest) {
  const needs = quest.needs;
  const entry = game.quests[quest.id] || {};
  if (needs.kill) {
    const kills = (game.kills[needs.kill] || 0) - (entry.killsAtStart || 0);
    return { have: Math.min(kills, needs.count), need: needs.count };
  }
  if (needs.repairWall) {
    const built = (game.counts?.wallsRepaired || 0) - (entry.wallsAtStart || 0);
    return { have: Math.min(built, needs.count), need: needs.count };
  }
  if (needs.helped) {
    const helped = (game.counts?.helped || 0) - (entry.helpedAtStart || 0);
    return { have: Math.min(helped, needs.count), need: needs.count };
  }
  if (Array.isArray(needs.items)) {
    const sum = needs.items.reduce((acc, id) => acc + countItem(game.player, id), 0);
    return { have: Math.min(sum, needs.count), need: needs.count };
  }
  if (needs.item) return { have: Math.min(countItem(game.player, needs.item), needs.count), need: needs.count };
  return { have: game.visited[needs.visit] ? 1 : 0, need: 1 };
}

export function isQuestReady(game, quest) {
  const progress = questProgress(game, quest);
  return progress.have >= progress.need;
}

// The quest this person gave and that is not finished yet (or undefined).
export function activeQuestOf(game, npcId) {
  return QUESTS.find((quest) => quest.giver === npcId && game.quests[quest.id] && !game.quests[quest.id].done);
}

// The next quest this person can offer (or undefined). One quest at a time per person.
export function offeredQuest(game, npcId) {
  if (activeQuestOf(game, npcId)) return undefined;
  return QUESTS.find((quest) => quest.giver === npcId && !game.quests[quest.id] && quest.minDay <= game.day);
}

export function activeQuests(game) {
  return QUESTS.filter((quest) => game.quests[quest.id] && !game.quests[quest.id].done);
}

export function availableSideQuests(game) {
  return QUESTS.filter(
    (quest) =>
      !game.quests[quest.id] &&
      (quest.minDay || 1) <= (game.day || 1) &&
      game.npcs?.[quest.giver]?.alive !== false
  );
}

const URGENT_TEMPLATES = [
  {
    key: 'wolvesAlert',
    title: '🚨 Urgent: Wild Pack Near the Gates',
    shout: 'URGENT! Wild wolves stalking the roads — hunters needed!',
    ask: 'A hungry pack has been spotted along the trade gate! Cull 3 wolves immediately!',
    needs: { kill: 'wolf', count: 3 },
    lexis: 95,
    rep: 5,
  },
  {
    key: 'slimeSurge',
    title: '🚨 Urgent: Slime Overflow!',
    shout: 'URGENT! Slimes surging toward the fields — clear them out!',
    ask: 'Swarms of slimes are clogging the outer wells. Defeat 4 slimes before sunset!',
    needs: { kill: 'slime', count: 4 },
    lexis: 75,
    rep: 4,
  },
  {
    key: 'rationRun',
    title: '🚨 Urgent: Gate Watch Rations',
    shout: 'URGENT! Scouts at the watchtower need bread & supplies!',
    ask: 'The patrol ran short on rations! Deliver 2 Bread or Roast Meat right away.',
    needs: { items: ['bread', 'roastMeat'], count: 2 },
    lexis: 80,
    rep: 4,
  },
  {
    key: 'herbEmergency',
    title: '🚨 Urgent: Clinic Fever Outbreak',
    shout: 'URGENT! Clinic running low on herbs & flowers for fever tea!',
    ask: 'More travelers arrived feverish! Bring 3 Flowers or Herbs quickly!',
    needs: { items: ['flower', 'herb'], count: 3 },
    lexis: 85,
    rep: 5,
  },
  {
    key: 'palisadeFix',
    title: '🚨 Urgent: Reinforce Timber Palisades',
    shout: 'URGENT! Timber needed at once to patch the perimeter fence!',
    ask: 'Storm gusts rattled our walls! Bring 4 Branches or Firewood to fortify the gate.',
    needs: { items: ['branch', 'firewood'], count: 4 },
    lexis: 90,
    rep: 5,
  },
];

export function ensureUrgentQuests(game) {
  if (!Array.isArray(game.urgentQuests)) game.urgentQuests = [];
  const day = game.day || 1;
  // Prune finished or long-expired unaccepted urgent quests
  game.urgentQuests = game.urgentQuests.filter((uq) => !uq.done && (uq.accepted || (uq.expiryDay || 999) >= day));
  while (game.urgentQuests.length < 2) {
    const unused = URGENT_TEMPLATES.filter((t) => !game.urgentQuests.some((u) => u.key === t.key));
    const pick = unused[(day + game.urgentQuests.length) % unused.length] || URGENT_TEMPLATES[game.urgentQuests.length % URGENT_TEMPLATES.length];
    game.urgentQuests.push({
      id: 'uq-' + pick.key + '-' + day + '-' + game.urgentQuests.length,
      key: pick.key,
      title: pick.title,
      shout: pick.shout,
      ask: pick.ask,
      needs: pick.needs,
      lexis: pick.lexis,
      rep: pick.rep,
      day: day,
      expiryDay: day + 2,
      accepted: false,
      done: false,
      killsAtStart: game.kills?.[pick.needs.kill] || 0,
    });
  }
  return game.urgentQuests;
}

export function urgentQuestProgress(game, uq) {
  const needs = uq.needs || {};
  if (needs.kill) {
    const kills = (game.kills?.[needs.kill] || 0) - (uq.killsAtStart || 0);
    return { have: Math.min(Math.max(0, kills), needs.count || 1), need: needs.count || 1 };
  }
  if (Array.isArray(needs.items)) {
    const sum = needs.items.reduce((acc, id) => acc + countItem(game.player, id), 0);
    return { have: Math.min(sum, needs.count || 1), need: needs.count || 1 };
  }
  return { have: 0, need: 1 };
}

export function isUrgentQuestReady(game, uq) {
  const p = urgentQuestProgress(game, uq);
  return p.have >= p.need;
}

export function acceptUrgentQuest(game, uqId) {
  const list = ensureUrgentQuests(game);
  const uq = list.find((u) => u.id === uqId);
  if (!uq || uq.accepted) return false;
  uq.accepted = true;
  if (uq.needs?.kill) uq.killsAtStart = game.kills?.[uq.needs.kill] || 0;
  notify(game, '🚨 Accepted ' + uq.title + '!', '#ff8a95');
  return true;
}

export function turnInUrgentQuest(game, uqId) {
  const list = ensureUrgentQuests(game);
  const uq = list.find((u) => u.id === uqId);
  if (!uq || !isUrgentQuestReady(game, uq)) return false;
  if (Array.isArray(uq.needs?.items)) {
    let left = uq.needs.count;
    for (const id of uq.needs.items) {
      if (left <= 0) break;
      const take = Math.min(left, countItem(game.player, id));
      if (take > 0) {
        removeItem(game.player, id, take);
        left -= take;
      }
    }
  }
  uq.done = true;
  game.counts.helped = (game.counts.helped || 0) + 1;
  earnLexis(game, uq.lexis || 80);
  addHappiness(game, uq.rep || 4);
  notify(game, '🚨 Urgent Quest Completed: ' + uq.title + ' (+' + uq.lexis + ' Lexis, +' + uq.rep + ' Happiness)', '#7cfc9a');
  ensureUrgentQuests(game);
  return true;
}

export function startQuest(game, quest) {
  game.quests[quest.id] = {
    done: false,
    killsAtStart: game.kills[quest.needs.kill] || 0,
    wallsAtStart: game.counts?.wallsRepaired || 0,
    helpedAtStart: game.counts?.helped || 0,
  };
  if (game?.realism) recordQuestPromise(game, quest.id, quest.giver, 6);
  notify(game, '📜 New quest: ' + quest.title, '#ffd23f');
}

// The quest is given back: the items are taken, the rewards are given.
export function finishQuest(game, quest) {
  if (game?.realism) resolveQuestPromise(game, quest.id);
  if (quest.needs.item) {
    removeItem(game.player, quest.needs.item, quest.needs.count);
  } else if (Array.isArray(quest.needs.items)) {
    let left = quest.needs.count;
    for (const id of quest.needs.items) {
      if (left <= 0) break;
      const take = Math.min(left, countItem(game.player, id));
      if (take > 0) {
        removeItem(game.player, id, take);
        left -= take;
      }
    }
  }
  game.quests[quest.id].done = true;
  game.counts.helped += 1;
  earnLexis(game, quest.lexis);
  addFriendship(game, quest.giver, 10);
  addHappiness(game, 3);
  if (quest.gift) addItem(game.player, quest.gift);
  const gift = quest.gift ? ' + ' + ITEMS[quest.gift].name : '';
  notify(game, '✅ ' + quest.title + ': +' + quest.lexis + ' Lexis' + gift, '#7CFC9A');
}
