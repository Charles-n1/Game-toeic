import Bar from './Bar';
import TouchStick from './TouchStick';
import StatusPanel from './StatusPanel';
import PixelIcon from './PixelIcon';
import useCanvas from './useCanvas';
import useScreen from './useScreen';
import { typeOf } from '../data/types';
import { zoneAt } from '../data/zones';
import { drawMiniMap } from '../draw/worldmap';
import { xpForLevel } from '../logic/player';
import { clockText, isNight } from '../logic/clock';
import { daysBeforeRaid } from '../logic/raid';
import { currentChapter } from '../logic/chapters';
import { actionIcon } from '../logic/update';
import { hasLight } from '../logic/torch';

// At night: the hours of light left, or a reminder that the hero is in the dark.
function lightText(game) {
  if (hasLight(game)) return '🔥 Torch: ' + Math.ceil(game.player.torchHours) + 'h';
  return isNight(game) ? 'No light: make a torch' : null;
}

// The small map in the corner. Tap it: the big map. size: in pixels.
function MiniMap({ game, size, onOpen }) {
  const canvasRef = useCanvas((ctx, width, height, time) => drawMiniMap(ctx, game, width, time));
  return (
    <button className="window minimap" style={{ width: size + 4, height: size + 4 }} onClick={onOpen} aria-label="map">
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </button>
  );
}

function raidText(game) {
  if (game.bosses.king) return null;
  if (game.raid.active) return 'RAID!';
  const days = daysBeforeRaid(game);
  return days === 0 ? 'Raid tonight' : 'Raid in ' + days + 'd';
}

// The goal of the moment (the chapter of the story), and the grammar being trained.
function Objective({ game }) {
  const chapter = currentChapter(game);
  const focus = typeOf(game.focus.current);
  const tally = game.focus.tally;
  return (
    <div className="window" style={styles.objective}>
      <span style={styles.goal}>
        <span className="gold">◆</span> {chapter ? chapter.text : 'Live your life in Lexia.'}
      </span>
      <div className="row" style={styles.training}>
        <PixelIcon name={focus.id} size={14} />
        <span className="small">
          Training {focus.short} · {tally.good}/{tally.good + tally.bad}
        </span>
      </div>
      <div style={styles.xp}>
        <Bar value={game.player.xp / xpForLevel(game.player.level)} color="#7cfc9a" height={6} />
      </div>
    </div>
  );
}

// Everything drawn on top of the world: the hero, the goal, the map, the clock, the buttons.
// onAction: the big button. onMenu(tab): opens the menu (tab: null = the list).
// What the action key does now, in a word (for the keyboard help).
const ACTION_WORDS = { talk: 'Talk', sleep: 'Sleep', chest: 'Open', carrot: 'Farm', dig: 'Dig', fire: 'Light', branch: 'Take', flint: 'Take' };

// The help of the keyboard, on a computer (instead of the joystick and the big buttons).
function KeyHelp({ game }) {
  return (
    <div className="window keys" style={styles.keys}>
      <span>
        <span className="key">E</span>
        {ACTION_WORDS[actionIcon(game)]}
      </span>
      <span>
        <span className="key">M</span>Map
      </span>
      <span>
        <span className="key">Esc</span>Menu
      </span>
    </div>
  );
}

// The joystick and the big buttons, on a touch screen.
function TouchControls({ game, input, onAction, onMenu }) {
  return (
    <>
      <div style={styles.stick}>
        <TouchStick input={input} />
      </div>
      <div style={styles.buttons}>
        <button className="px-button" style={styles.menu} onClick={() => onMenu(null)} aria-label="menu">
          <PixelIcon name="menu" size={14} />
          <span>Menu</span>
        </button>
        <button className="px-button px-action" onClick={onAction} aria-label="action">
          <PixelIcon name={actionIcon(game)} size={42} />
        </button>
      </div>
    </>
  );
}

// Everything drawn on top of the world: the hero, the goal, the map, the clock, the controls.
// On a wide screen the goal goes to the top-right, next to the map (like a console RPG).
// onAction: the big button. onMenu(tab): opens the menu (tab: null = the list).
export default function Hud({ game, input, onAction, onMenu }) {
  const raid = raidText(game);
  const zone = zoneAt(game.player.x, game.player.y);
  const screen = useScreen();
  const showTouch = screen.touch || !screen.wide;

  return (
    <div className="hud">
      <div style={styles.left}>
        <StatusPanel game={game} />
        {!screen.wide && <Objective game={game} />}
      </div>

      <div style={styles.right}>
        <div className="row" style={styles.topRight}>
          {screen.wide && <Objective game={game} />}
          <MiniMap game={game} size={screen.wide ? 120 : 84} onOpen={() => onMenu('map')} />
        </div>
        <div className="window" style={styles.clock}>
          <span style={styles.clockText}>
            {isNight(game) ? '☾' : '☀'} {clockText(game)}
          </span>
          {raid && <span style={styles.raid}>{raid}</span>}
          {lightText(game) && <span style={styles.light}>{lightText(game)}</span>}
        </div>
      </div>

      <div style={styles.toasts}>
        {game.run.toasts.map((toast) => (
          <div key={toast.until + toast.text} className="toast" style={{ color: toast.color }}>
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

      <div className="window" style={{ ...styles.zone, bottom: showTouch ? 158 : 12 }}>
        <span>{zone.name}</span>
      </div>
      {showTouch ? <TouchControls game={game} input={input} onAction={onAction} onMenu={onMenu} /> : <KeyHelp game={game} />}
    </div>
  );
}

const styles = {
  left: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 8,
    maxWidth: '64%',
  },
  objective: {
    padding: '6px 9px',
    maxWidth: 340,
  },
  goal: {
    fontSize: 14,
    lineHeight: '18px',
  },
  training: {
    gap: 5,
    marginTop: 4,
  },
  xp: {
    marginTop: 5,
  },
  right: {
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'flex-end',
    gap: 8,
  },
  topRight: {
    alignItems: 'flex-start',
    gap: 8,
  },
  keys: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  clock: {
    padding: '4px 8px',
    alignItems: 'flex-end',
  },
  clockText: {
    fontSize: 13,
  },
  raid: {
    fontSize: 13,
    color: '#ff8a95',
  },
  light: {
    fontSize: 13,
    color: '#ffd086',
  },
  toasts: {
    position: 'absolute',
    top: 200,
    left: 30,
    right: 30,
    alignItems: 'center',
  },
  zone: {
    position: 'absolute',
    left: 10,
    bottom: 158,
    padding: '4px 12px',
    fontSize: 15,
  },
  stick: {
    position: 'absolute',
    left: 14,
    bottom: 22,
  },
  buttons: {
    position: 'absolute',
    right: 14,
    bottom: 22,
    alignItems: 'flex-end',
    gap: 14,
  },
  menu: {
    flexDirection: 'row',
    gap: 6,
    padding: '6px 10px',
    fontSize: 15,
  },
};
