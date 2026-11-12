import { DROPS } from '../data/monsters';
import { ITEMS } from '../data/items';
import { typeOf } from '../data/types';
import { earnLexis, addItem } from './player';
import { countKill } from './quests';
import { notify } from './messages';
import { burst, floatText } from './particles';

// What happens when a monster dies: it leaves the map, and leaves things behind.

function dropItems(game, monster) {
  for (const [itemId, chance] of DROPS) {
    if (Math.random() < chance) {
      addItem(game.player, itemId);
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
  earnLexis(game, monster.lexis);
  floatText(game, monster.x, monster.y - 0.5, '+' + monster.lexis + ' Lexis', '#ffd23f');
  burst(game, monster.x, monster.y, typeOf(monster.category).color, 24);
  dropItems(game, monster);
  game.counts.kills += 1;
  countKill(game, monster.species);
  removeMonster(game, monster);
}
