import Bar from './Bar';
import Portrait from './Portrait';
import PixelIcon from './PixelIcon';
import { HERO_LOOK } from '../data/npcs';
import { maxHealth, maxMana } from '../logic/player';

// One line: "HP  48 / 70" and its bar.
function StatLine({ label, value, max, color }) {
  return (
    <div style={styles.stat}>
      <div className="row between">
        <span style={styles.label}>{label}</span>
        <span style={styles.numbers}>
          {Math.max(0, value)} / {max}
        </span>
      </div>
      <Bar value={value / max} color={color} height={9} />
    </div>
  );
}

// The hero, top-left of the screen: the face, the level, the HP and the MP. With the Lexis (the money).
export default function StatusPanel({ game }) {
  const player = game.player;
  return (
    <div className="row" style={styles.panel}>
      <div className="window" style={styles.face}>
        <Portrait look={HERO_LOOK} size={64} />
      </div>
      <div className="window" style={styles.stats}>
        <div className="row between">
          <span style={styles.level}>Lv. {player.level}</span>
          <div className="row" style={styles.lexis}>
            <PixelIcon name="lexis" size={14} />
            <span>{player.lexis}</span>
          </div>
        </div>
        <StatLine label="HP" value={player.health} max={maxHealth(player)} color="#e8423f" />
        <StatLine label="MP" value={player.mana} max={maxMana(player)} color="#3a7bff" />
      </div>
    </div>
  );
}

const styles = {
  panel: {
    alignItems: 'stretch',
    gap: 4,
  },
  face: {
    padding: 4,
    justifyContent: 'center',
  },
  stats: {
    width: 150,
    padding: '5px 9px',
  },
  level: {
    fontSize: 16,
  },
  lexis: {
    fontSize: 14,
    gap: 4,
    color: '#ffd86b',
  },
  stat: {
    marginTop: 2,
  },
  label: {
    fontSize: 14,
  },
  numbers: {
    fontSize: 14,
  },
};
