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
import { hasLight, torchTimeLeft, toggleTorch } from '../logic/torch';
import { eventTitle } from '../logic/isekai/events';
import { isCursed } from '../logic/isekai/curses';
import { isNearCamp } from '../logic/camp';
import { isVillain, ensureSociety } from '../logic/society/state';
import { ensureGuild } from '../logic/guild/ranks';
import { encumbranceStatus } from '../logic/weight';
import { ensureDoom } from '../logic/war/demonThreat';
import { ELEMENTAL_SPIRITS } from '../data/isekaiTodo';
import { ensureIsekaiTodo } from '../logic/isekaiTodo/state';
import { isLevitating, isWorldTimeFrozen } from '../logic/isekaiTodo/magicPlus';
import { snapAdventurePhoto } from '../logic/isekaiTodo/socialPlus';

const WEATHER_SIGNS = { cloudy: '☁', rain: '🌧', storm: '⛈' };

// The sky in one or two signs: the weather (or the sun / the moon), and 💨 when a strong wind blows.
function skySigns(game) {
  const sky = WEATHER_SIGNS[game.weather.kind] || (isNight(game) ? '☾' : '☀');
  return game.weather.windy ? sky + '💨' : sky;
}

// The torch: the time of light left, or (at night) a reminder that it can be lit. null = nothing to show.
function lightText(game) {
  if (hasLight(game)) return '🔥 Torch ' + torchTimeLeft(game) + ' (T)';
  return isNight(game) ? '🕯 Torch off (T)' : null;
}

// Tap it to light or put out the torch (same as the key T).
function TorchButton({ game }) {
  const text = lightText(game);
  if (!text) return null;
  return (
    <button style={styles.light} onClick={() => toggleTorch(game)}>
      {text}
    </button>
  );
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
function Objective({ game, compact }) {
  const chapter = currentChapter(game);
  const focus = typeOf(game.focus.current);
  const tally = game.focus.tally;
  return (
    <div className="window" style={compact ? styles.objectiveCompact : styles.objective}>
      <span style={compact ? styles.goalCompact : styles.goal}>
        <span className="gold">◆</span> {chapter ? chapter.text : 'Live your life in Eldermoor.'}
      </span>
      <div className="row" style={styles.training}>
        <PixelIcon name={focus.id} size={compact ? 11 : 14} />
        <span className="small" style={compact ? styles.smallCompact : null}>
          {focus.short} · {tally.good}/{tally.good + tally.bad}
        </span>
      </div>
      <div style={styles.xp}>
        <Bar value={game.player.xp / xpForLevel(game.player.level)} color="#7cfc9a" height={compact ? 4 : 6} />
      </div>
    </div>
  );
}

// Everything drawn on top of the world: the hero, the goal, the map, the clock, the buttons.
// onAction: the big button. onMenu(tab): opens the menu (tab: null = the list).
// What the action key does now, in a word (for the keyboard help).
const ACTION_WORDS = { talk: 'Talk', sleep: 'Sleep', chest: 'Open', carrot: 'Farm', dig: 'Dig', fire: 'Light', branch: 'Take', flint: 'Take', ore: 'Mine', crystal: 'Mine', quit: 'Enter', people: 'Carry', map: 'Sail', roastMeat: 'Cook', book: 'Read', woodSword: 'Train', water: 'Fill', inventory: 'Take', star: 'Pray', shield: 'Build', quests: 'Board', sword: 'Hunt', crown: 'Throne', royalPass: 'Pass', repairKit: 'Repair', antidote: 'Cure', flower: 'Pick', horseFeed: 'Ride', heart: 'Rest', bath: 'Bathe', starShard: 'Take', apple: 'Pick', pear: 'Pick', cherry: 'Pick', orange: 'Pick', peach: 'Pick', plum: 'Pick', lemon: 'Pick', fig: 'Pick', olive: 'Pick', coconut: 'Harvest', grapes: 'Harvest', pumpkin: 'Harvest', melon: 'Harvest', strawberry: 'Pick', wildBerries: 'Pick', herb: 'Gather', moonflower: 'Gather', honey: 'Honey', mushroom: 'Forage', egg: 'Gather', feather: 'Gather', milk: 'Take', rawFish: 'Fish', hay: 'Take', firewood: 'Take', bread: 'Take', bone: 'Forage', dots: '...' };

// The help of the keyboard, on a computer (instead of the joystick and the big buttons).
function KeyHelp({ game }) {
  return (
    <div className="window keys" style={styles.keys}>
      <span>
        <span className="key">E</span>
        {ACTION_WORDS[actionIcon(game)] || 'Act'}
      </span>
      <span>
        <span className="key">F</span>Hunt
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
function TouchControls({ game, input, onAction, onStrike, onMenu }) {
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
        <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
          {onStrike && (
            <button className="px-button" style={styles.huntBtn} onClick={onStrike} aria-label="hunt">
              <PixelIcon name="sword" size={24} />
            </button>
          )}
          <button className="px-button px-action" onClick={onAction} aria-label="action">
            <PixelIcon name={actionIcon(game)} size={42} />
          </button>
        </div>
      </div>
    </>
  );
}

// Everything drawn on top of the world: the hero, the goal, the map, the clock, the controls.
// On a wide screen the goal goes to the top-right, next to the map (like a console RPG).
// onAction: the big button. onMenu(tab): opens the menu (tab: null = the list).
export default function Hud({ game, input, onAction, onStrike, onMenu }) {
  const raid = raidText(game);
  const zone = zoneAt(game.player.x, game.player.y);
  const society = ensureSociety(game);
  const guild = ensureGuild(game);
  const enc = encumbranceStatus(game);
  const doom = ensureDoom(game).silenceDoom || 0;
  const todo = ensureIsekaiTodo(game);
  const activeSpirit = todo.spirits?.active ? ELEMENTAL_SPIRITS.find((s) => s.id === todo.spirits.active) : null;
  const unreadMail = (todo.letters?.delivered || []).filter((m) => !m.read).length;
  const screen = useScreen();
  const showTouch = screen.touch || !screen.wide;

  return (
    <div className="hud">
      <div style={screen.wide ? styles.left : styles.leftCompact}>
        <StatusPanel game={game} />
        {!screen.wide && <Objective game={game} compact />}
      </div>

      <div style={styles.right}>
        <div className="row" style={styles.topRight}>
          {screen.wide && <Objective game={game} />}
          <MiniMap game={game} size={screen.wide ? 120 : 80} onOpen={() => onMenu('map')} />
        </div>
        <div className="window" style={styles.clock}>
          <span style={styles.clockText}>
            {skySigns(game)} {clockText(game)}
          </span>
          {raid && <span style={styles.raid}>{raid}</span>}
          <TorchButton game={game} />
          {eventTitle(game) && <span style={styles.event}>{eventTitle(game)}</span>}
          {isCursed(game) && <span style={styles.curse}>💀 Cursed</span>}
          {society.disaster && (
            <span style={styles.raid}>{society.disaster.kind === 'tsunami' ? '🌊 TSUNAMI!' : '🌪 TORNADO!'}</span>
          )}
          {society.riding?.active && (
            <span style={society.riding.hunger >= 75 ? styles.raid : styles.light}>
              {society.riding.hunger >= 75 ? '🐴 Feed horse!' : '🐴 Mounted'}
            </span>
          )}
          {isVillain(game) && <span style={styles.raid}>☠ Villain</span>}
          {game.player.cold?.active && <span style={styles.raid}>🤧 Cold</span>}
          {enc.state !== 'Normal' && <span style={styles.raid}>🎒 {enc.state} ({enc.weight} kg)</span>}
          {(game.player.fatigue || 0) >= 85 && <span style={styles.raid}>🥱 Exhausted</span>}
          {guild.registered && <span style={styles.light}>🪪 Rank {guild.rank}</span>}
          {todo.flyingMount?.riding && <span style={styles.event}>🦅 Flying</span>}
          {isLevitating(game) && <span style={styles.event}>🪶 Levitating</span>}
          {isWorldTimeFrozen(game) && <span style={styles.event}>⏳ Time Frozen</span>}
          {activeSpirit && <span style={styles.light}>{activeSpirit.icon} {activeSpirit.element} Lv.{todo.spirits.contracted[activeSpirit.id]?.level || 1}</span>}
          {unreadMail > 0 && (
            <button style={styles.light} onClick={() => onMenu('people')}>
              ✉️ {unreadMail} Mail
            </button>
          )}
          <button style={styles.light} onClick={() => snapAdventurePhoto(game)} title="Take snapshot photo">
            📷 Snap Photo
          </button>
          {!game.bosses?.king && doom >= 40 && <span style={styles.curse}>🌑 Silence {doom}%</span>}
          {game.player.soldiers > 0 && (
            <span style={styles.light}>
              ♟️ Guard ×{game.player.soldiers} · {Math.ceil(game.player.soldierTime)}s
            </span>
          )}
          {game.player.pet && <span style={styles.light}>🐈‍⬛ Cat · {Math.ceil(game.player.petTime)}s</span>}
          {isNearCamp(game) && <span style={styles.light}>⛺ Camp</span>}
        </div>
      </div>

      <div style={{ ...styles.toasts, top: screen.wide ? 175 : 132 }}>
        {game.run.toasts.map((toast) => (
          <div key={toast.until + toast.text} className="toast" style={{ color: toast.color }}>
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

      <div className="window" style={{ ...styles.zone, bottom: showTouch ? 158 : 12 }}>
        <span>{zone.id === 'visitHouse' && game.run.visitHouse ? game.run.visitHouse.title : zone.name}</span>
      </div>
      {showTouch ? <TouchControls game={game} input={input} onAction={onAction} onStrike={onStrike} onMenu={onMenu} /> : <KeyHelp game={game} />}
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
  leftCompact: {
    position: 'absolute',
    top: 6,
    left: 6,
    gap: 4,
    maxWidth: '58%',
  },
  objective: {
    padding: '6px 9px',
    maxWidth: 340,
  },
  objectiveCompact: {
    padding: '3px 6px',
    maxWidth: 158,
  },
  goal: {
    fontSize: 14,
    lineHeight: '18px',
  },
  goalCompact: {
    fontSize: 10,
    lineHeight: '13px',
  },
  smallCompact: {
    fontSize: 10,
    lineHeight: '12px',
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
    background: 'none',
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
  },
  event: {
    fontSize: 13,
    color: '#ffd23f',
  },
  curse: {
    fontSize: 13,
    color: '#c78bff',
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
  huntBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 0,
  },
};
