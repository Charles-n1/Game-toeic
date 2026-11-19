import { zoneAt } from '../data/zones';
import { biomeAt } from '../world/map';
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
  const vh = game.run?.visitHouse;
  if (vh && (vh.guild || vh.specialRole === 'inn') && SONGS.tavern) return 'tavern';
  if (isNight(game)) return 'night';
  const zone = zoneAt(game.player.x, game.player.y);
  if (zone.kind === 'village') {
    return game.day % 7 === 3 && SONGS.market ? 'market' : 'village';
  }
  if (biomeAt(game.player.x, game.player.y) === 'demon' && SONGS.solecis) return 'solecis';
  return 'exploration';
}
