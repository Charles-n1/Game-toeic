import { zoneAt } from '../data/zones';
import { isNight } from '../logic/clock';
import { isSilencedZone } from '../logic/soul';
import { SONGS } from './songs';

// Which song fits what happens on screen (see songs.js).
export function songFor(game) {
  const fight = game.run.fight;
  if (game.run.screen === 'over') return 'sad';
  if (game.run?.dialogTheme && SONGS[game.run.dialogTheme]) return game.run.dialogTheme;
  if (fight && fight.opponent.boss) return 'boss';
  if (fight && !fight.opponent.duel) return 'fight';
  if (game.raid.active) return 'raid';
  if (isSilencedZone(game)) return 'silent';
  if (game.ended) return 'ending';
  if (isNight(game)) return 'night';
  return zoneAt(game.player.x, game.player.y).kind === 'village' ? 'village' : 'exploration';
}
