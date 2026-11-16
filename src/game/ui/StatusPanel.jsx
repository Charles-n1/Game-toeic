import Bar from './Bar';
import Portrait from './Portrait';
import PixelIcon from './PixelIcon';
import useScreen from './useScreen';
import { maxHealth, maxMana } from '../logic/player';
import { BOTTLE_SIZE } from '../logic/survival';

// One compact stat line: "HP 48/70" and its bar.
function StatLine({ label, value, max, color, wide }) {
  return (
    <div style={styles.stat}>
      <div className="row between" style={styles.statRow}>
        <span style={wide ? styles.labelWide : styles.label}>{label}</span>
        <span style={wide ? styles.numbersWide : styles.numbers}>
          {Math.round(Math.max(0, value))}/{Math.round(max)}
        </span>
      </div>
      <Bar value={value / max} color={color} height={wide ? 6 : 5} />
    </div>
  );
}

// Hunger or thirst: tiny icon and thin bar (red when almost empty).
function NeedBar({ icon, value, color, wide }) {
  return (
    <div className="row" style={styles.need}>
      <PixelIcon name={icon} size={10} />
      <div style={{ width: wide ? 26 : 19 }}>
        <Bar value={value / 100} color={value < 25 ? '#ff5a6e' : color} height={4} />
      </div>
    </div>
  );
}

// Compact hero panel top-left: small portrait, level, HP, MP, and survival bars.
export default function StatusPanel({ game }) {
  const player = game.player;
  const wide = useScreen().wide;
  return (
    <div className="row" style={styles.panel}>
      <div className="window" style={styles.face}>
        <Portrait look={player.look} size={wide ? 42 : 34} />
      </div>
      <div className="window" style={wide ? styles.statsWide : styles.stats}>
        <div className="row between" style={styles.header}>
          <span style={wide ? styles.levelWide : styles.level}>{player.name}</span>
          <span className="gold" style={wide ? styles.lvBadgeWide : styles.lvBadge}>
            Lv.{player.level}
          </span>
        </div>
        <StatLine label="HP" value={player.health} max={maxHealth(player, game)} color="#e8423f" wide={wide} />
        <StatLine label="MP" value={player.mana} max={maxMana(player)} color="#3a7bff" wide={wide} />
        <div className="row between" style={styles.needs}>
          <NeedBar icon="roastMeat" value={player.hunger} color="#e8a050" wide={wide} />
          <NeedBar icon="water" value={player.thirst} color="#5aa8ee" wide={wide} />
          <span style={styles.bottle} title={`Water ${player.bottle}/${BOTTLE_SIZE}`}>
            💧{player.bottle}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    alignItems: 'stretch',
    gap: 3,
  },
  face: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stats: {
    width: 98,
    padding: '2px 5px',
  },
  statsWide: {
    width: 118,
    padding: '3px 7px',
  },
  header: {
    gap: 4,
    alignItems: 'baseline',
  },
  level: {
    fontSize: 11,
    lineHeight: '13px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  levelWide: {
    fontSize: 13,
    lineHeight: '15px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  lvBadge: {
    fontSize: 10,
    lineHeight: '12px',
    flexShrink: 0,
  },
  lvBadgeWide: {
    fontSize: 11,
    lineHeight: '14px',
    flexShrink: 0,
  },
  stat: {
    marginTop: 1,
  },
  statRow: {
    lineHeight: '11px',
  },
  needs: {
    gap: 3,
    marginTop: 2,
    alignItems: 'center',
  },
  need: {
    gap: 2,
    alignItems: 'center',
  },
  bottle: {
    color: '#9fd8ff',
    fontSize: 9,
    lineHeight: '10px',
    flexShrink: 0,
  },
  label: {
    fontSize: 9,
  },
  labelWide: {
    fontSize: 10,
  },
  numbers: {
    fontSize: 9,
  },
  numbersWide: {
    fontSize: 10,
  },
};
