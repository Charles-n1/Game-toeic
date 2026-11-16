import Bar from './Bar';
import Portrait from './Portrait';
import PixelIcon from './PixelIcon';
import { maxHealth, maxMana } from '../logic/player';
import { BOTTLE_SIZE } from '../logic/survival';

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

// Hunger or thirst: a small icon and a thin bar (red when almost empty).
function NeedBar({ icon, value, color }) {
  return (
    <div className="row" style={styles.need}>
      <PixelIcon name={icon} size={12} />
      <div style={styles.needBar}>
        <Bar value={value / 100} color={value < 25 ? '#ff5a6e' : color} height={6} />
      </div>
    </div>
  );
}

// The hero, top-left of the screen: the face, the level, the HP and the MP.
// (The Lexis are not shown here: they are in the Inventory and in the shops.)
export default function StatusPanel({ game }) {
  const player = game.player;
  return (
    <div className="row" style={styles.panel}>
      <div className="window" style={styles.face}>
        <Portrait look={player.look} size={64} />
      </div>
      <div className="window" style={styles.stats}>
        <span style={styles.level}>
          {player.name} <span className="gold">Lv. {player.level}</span>
        </span>
        <StatLine label="HP" value={player.health} max={maxHealth(player, game)} color="#e8423f" />
        <StatLine label="MP" value={player.mana} max={maxMana(player)} color="#3a7bff" />
        <div className="row" style={styles.needs}>
          <NeedBar icon="roastMeat" value={player.hunger} color="#e8a050" />
          <NeedBar icon="water" value={player.thirst} color="#5aa8ee" />
          <span className="small" style={styles.bottle}>
            {'●'.repeat(player.bottle)}
            {'○'.repeat(Math.max(0, BOTTLE_SIZE - player.bottle))}
          </span>
        </div>
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
  stat: {
    marginTop: 2,
  },
  needs: {
    gap: 6,
    marginTop: 4,
    alignItems: 'center',
  },
  need: {
    gap: 3,
    alignItems: 'center',
  },
  needBar: {
    width: 44,
  },
  bottle: {
    color: '#9fd8ff',
    fontSize: 10,
    letterSpacing: -1,
  },
  label: {
    fontSize: 14,
  },
  numbers: {
    fontSize: 14,
  },
};
