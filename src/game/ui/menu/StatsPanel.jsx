import PixelIcon from '../PixelIcon';
import Bar from '../Bar';
import { TYPES } from '../../data/types';
import { ITEMS } from '../../data/items';
import { skillPercent, spellRank, difficultyRank, RANKS } from '../../logic/learning';
import { speedOf, strikePower, armorOf, criticalChance, xpForLevel } from '../../logic/player';
import { allyCount } from '../../logic/fight';

const RANK_COLORS = ['#22a06b', '#3f9b2f', '#2f6fd8', '#8a3fd1'];

// One grammar type: its icon, its level (the % of good answers) and the difficulty reached in it.
function SkillLine({ game, type }) {
  const rank = difficultyRank(game, type.id);
  const isFocus = game.focus.current === type.id;
  return (
    <div className="line">
      <PixelIcon name={type.id} size={28} />
      <div className="grow">
        <span style={styles.name}>
          {type.short} {isFocus && <span className="gold">◆</span>}
        </span>
        <span className="small">{spellRank(game, type.id) > 0 ? type.spell + ' ' + spellRank(game, type.id) : 'Spell locked (20%)'}</span>
      </div>
      <span style={styles.level}>Lv. {skillPercent(game, type.id)} / 100</span>
      <span className="badge" style={{ backgroundColor: RANK_COLORS[rank] }}>
        {RANKS[rank]}
      </span>
    </div>
  );
}

// The hero's numbers, and the skills: your grammar is your magic.
export default function StatsPanel({ game }) {
  const player = game.player;
  return (
    <>
      <div style={styles.hero}>
        <span>
          Level {player.level} · XP {player.xp} / {xpForLevel(player.level)}
        </span>
        <Bar value={player.xp / xpForLevel(player.level)} color="#7cfc9a" height={8} />
        <span className="small" style={styles.numbers}>
          Attack {strikePower(player) + allyCount(player) * 10} · Armor {armorOf(player)} · Speed {speedOf(player)} · Critical{' '}
          {Math.round(criticalChance(player) * 100)}%
        </span>
        <span className="small">
          {ITEMS[player.weapon].name} · {ITEMS[player.armor].name} · {ITEMS[player.boots].name}
        </span>
        <span className="small">Aria can still carry you home {player.blessings} time(s). After that, death is the end.</span>
      </div>
      <span className="section">Your language skills</span>
      {TYPES.map((type) => (
        <SkillLine key={type.id} game={game} type={type} />
      ))}
      <span className="small" style={styles.hint}>
        ◆ = trained now. Reach your goal in it: the training moves to your next weakness. Keep going to reach the next level!
      </span>
    </>
  );
}

const styles = {
  hero: {
    gap: 4,
  },
  numbers: {
    marginTop: 4,
  },
  name: {
    fontSize: 17,
  },
  level: {
    fontSize: 15,
    marginRight: 4,
  },
  hint: {
    marginTop: 8,
  },
};
