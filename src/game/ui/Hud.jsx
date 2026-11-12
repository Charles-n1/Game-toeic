import Hearts from './Hearts';
import Bar from './Bar';
import TouchStick from './TouchStick';
import useCanvas from './useCanvas';
import { typeOf } from '../data/types';
import { drawMiniMap } from '../draw/minimap';
import { maxHealth, maxMana, xpForLevel } from '../logic/player';
import { clockText, isNight } from '../logic/clock';
import { daysBeforeRaid } from '../logic/raid';
import { actionLabel } from '../logic/update';

const MENUS = [
  { screen: 'bag', icon: '🎒', label: 'bag' },
  { screen: 'powers', icon: '✨', label: 'powers' },
  { screen: 'quests', icon: '📜', label: 'quests' },
];

// The small map in the corner. Tap it: the big map.
function MiniMap({ game, onOpen }) {
  const canvasRef = useCanvas((ctx, width, height, time) => drawMiniMap(ctx, game, width, time));
  return (
    <button className="minimap" onClick={onOpen} aria-label="map">
      <canvas ref={canvasRef} style={styles.miniCanvas} />
    </button>
  );
}

// What the player is training right now: "🌸 Gerunds 3/5".
function FocusChip({ game }) {
  const type = typeOf(game.focus.current);
  const tally = game.focus.tally;
  return (
    <div className="chip" style={{ backgroundColor: type.color, marginTop: 4 }}>
      <span>
        🎯 {type.icon} {type.short} {tally.good}/{tally.good + tally.bad}
      </span>
    </div>
  );
}

function raidText(game) {
  if (game.bosses.king) return null;
  if (game.raid.active) return '🔥 RAID!';
  const days = daysBeforeRaid(game);
  return days === 0 ? '☠️ raid tonight' : '☠️ raid in ' + days + 'd';
}

// Everything drawn on top of the world: the hearts, the clock, the buttons.
// onAction: the big button. onOpen(screen): a menu. onQuit: leave the game.
export default function Hud({ game, input, onAction, onOpen, onQuit }) {
  const player = game.player;
  const raid = raidText(game);

  return (
    <div className="hud">
      {/* Top-left: the hero */}
      <div className="hud-box" style={styles.status}>
        <Hearts value={player.health} max={maxHealth(player)} />
        <div style={styles.gap}>
          <Bar value={player.mana / maxMana(player)} color="#6ec6ff" />
        </div>
        <div style={styles.gap}>
          <Bar value={player.xp / xpForLevel(player.level)} color="#7cfc9a" height={5} />
        </div>
        <span style={styles.statusText}>
          Lv {player.level} · 🪙 {player.lexis} · 🕊️ {player.blessings}
        </span>
        <FocusChip game={game} />
      </div>

      {/* Top-right: the map and the clock */}
      <div style={styles.corner}>
        <MiniMap game={game} onOpen={() => onOpen('map')} />
        <div className="hud-box" style={styles.clock}>
          <span style={styles.statusText}>
            {isNight(game) ? '🌙' : '☀️'} {clockText(game)}
          </span>
          {raid && <span style={{ ...styles.statusText, color: '#ff8080' }}>{raid}</span>}
        </div>
      </div>

      {/* The small messages */}
      <div style={styles.toasts}>
        {game.run.toasts.map((toast) => (
          <div key={toast.until + toast.text} className="toast" style={{ color: toast.color }}>
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

      {/* Bottom: the stick, the menus, the action button */}
      <div style={styles.stick}>
        <TouchStick input={input} />
      </div>
      <div style={styles.buttons}>
        <div className="row" style={styles.menus}>
          <button className="btn btn-round" onClick={onQuit} aria-label="quit" style={styles.menu}>
            🚪
          </button>
          {MENUS.map((menu) => (
            <button key={menu.screen} className="btn btn-round" onClick={() => onOpen(menu.screen)} aria-label={menu.label} style={styles.menu}>
              {menu.icon}
            </button>
          ))}
        </div>
        <button className="btn btn-action" onClick={onAction} aria-label="action">
          {actionLabel(game)}
        </button>
      </div>
    </div>
  );
}

const styles = {
  status: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 150,
  },
  gap: {
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 3,
  },
  corner: {
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'flex-end',
  },
  miniCanvas: {
    width: 80,
    height: 80,
  },
  clock: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
  toasts: {
    position: 'absolute',
    top: 112,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  stick: {
    position: 'absolute',
    left: 14,
    bottom: 18,
  },
  buttons: {
    position: 'absolute',
    right: 14,
    bottom: 18,
    alignItems: 'flex-end',
  },
  menus: {
    marginBottom: 10,
  },
  menu: {
    marginLeft: 6,
  },
};
