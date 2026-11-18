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
