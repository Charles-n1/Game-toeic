import { DROPS } from '../data/monsters';
import { ITEMS } from '../data/items';
import { typeOf } from '../data/types';
import { zoneAt } from '../data/zones';
import { earnLexis, addItem } from './player';
import { countKill } from './quests';
import { notify } from './messages';
import { burst, floatText } from './particles';
import { dropCursedThing } from './isekai/curses';
import { lexisBonus, countEventKill } from './isekai/events';
import { awardGuildPoints } from './guild/ranks';
import { onBossDefeated } from './war/demonThreat';
import { stampPerishableAdded } from './realism/foodAndNature';
import { earnRegionalCoin } from './realism/financeAndLaw';

// What happens when a monster dies: it leaves the map, and leaves things behind.

// What the monster leaves: its own things (meat, bones... most of the time), then sometimes a common drop.
function dropItems(game, monster) {
  for (const itemId of monster.drops || []) {
    if (Math.random() < 0.75) {
      addItem(game.player, itemId);
      stampPerishableAdded(game, itemId);
      notify(game, ITEMS[itemId].icon + ' ' + ITEMS[itemId].name);
    }
  }
  for (const [itemId, chance] of DROPS) {
    if (Math.random() < chance) {
      addItem(game.player, itemId);
      stampPerishableAdded(game, itemId);
      notify(game, ITEMS[itemId].icon + ' The monster dropped: ' + ITEMS[itemId].name);
    }
  }
}

// The monster is dead: it leaves the map. A boss never comes back, a dungeon guard comes back the next day.
export function removeMonster(game, monster) {
  game.run.monsters = game.run.monsters.filter((other) => other !== monster);
  if (monster.boss) game.bosses[monster.species] = true;
  else if (monster.key) game.cleared[monster.key] = game.day;
}

// Lexis, items and the quests for a dead monster. (XP is given apart: it depends on the answers.)
export function lootMonster(game, monster) {
  const lexis = monster.lexis * lexisBonus(game); // twice on a Blood Moon night
  earnLexis(game, lexis);
  const mx = Number.isFinite(monster.x) ? monster.x : game.player.x;
  const my = Number.isFinite(monster.y) ? monster.y : game.player.y;
  const kId = zoneAt(mx, my)?.kingdom;
  if (game?.realism && kId && kId !== 'lexia' && lexis >= 10) {
    earnRegionalCoin(game, kId, Math.max(2, Math.round(lexis * 0.15)));
  }
  floatText(game, monster.x, monster.y - 0.5, '+' + lexis + ' Lexis', '#ffd23f');
  burst(game, monster.x, monster.y, typeOf(monster.category).color, 24);
  dropItems(game, monster);
  dropCursedThing(game, monster);
  game.counts.kills += 1;
  countKill(game, monster.species);
  countEventKill(game);
  if (monster.boss) onBossDefeated(game, monster.species);
  else awardGuildPoints(game, monster.tier === 'small' ? 2 : 5);
  removeMonster(game, monster);
}
