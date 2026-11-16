import Window from '../Window';
import PixelIcon from '../PixelIcon';
import StatusPanel from '../StatusPanel';
import useScreen from '../useScreen';
import StatsPanel from './StatsPanel';
import ClassesPanel from './ClassesPanel';
import PeoplePanel from './PeoplePanel';
import InventoryPanel from './InventoryPanel';
import PowersPanel from './PowersPanel';
import QuestsPanel from './QuestsPanel';
import MapPanel from './MapPanel';
import OptionsPanel from '../OptionsPanel';
import { saveGame } from '../../logic/save';
import { notify } from '../../logic/messages';

// The entries of the menu. icon: see draw/icons.js
const ENTRIES = [
  { tab: 'resume', label: 'Resume' },
  { tab: 'stats', label: 'Stats' },
  { tab: 'classes', label: 'Classes' },
  { tab: 'people', label: 'Relations' },
  { tab: 'inventory', label: 'Inventory' },
  { tab: 'powers', label: 'Powers' },
  { tab: 'quests', label: 'Quests' },
  { tab: 'map', label: 'Map' },
  { tab: 'options', label: 'Options' },
  { tab: 'save', label: 'Save' },
  { tab: 'quit', label: 'Quit' },
];

const PANELS = { stats: StatsPanel, classes: ClassesPanel, people: PeoplePanel, inventory: InventoryPanel, powers: PowersPanel, quests: QuestsPanel, map: MapPanel, options: OptionsPanel };

// The pause menu: the list of entries, then the window of the chosen one. game.run.menuTab: null = the list.
// onQuit: back to the title menu (the game is saved first).
// The list of the entries. current: the tab shown on the right (wide screens), highlighted.
function EntryList({ current, onOpen, style }) {
  return (
    <div className="window window-gold slide-up" style={{ ...styles.list, ...style }}>
      {ENTRIES.map((entry, index) => (
        <button key={entry.tab} className={'menu-item' + ((current ? entry.tab === current : index === 0) ? ' selected' : '')} onClick={() => onOpen(entry)}>
          <PixelIcon name={entry.tab} size={28} />
          <span>{entry.label}</span>
        </button>
      ))}
    </div>
  );
}

// The pause menu. On a phone: the list, then the window of the chosen entry (with a "Menu" button to go back).
// On a wide screen: the list on the left and the window on the right, like a console RPG (the map takes all the room).
// game.run.menuTab: the chosen entry (null = none yet). onQuit: back to the title menu (the game is saved first).
export default function MenuScreen({ game, refresh, onClose, onQuit }) {
  const wide = useScreen().wide;
  const tab = game.run.menuTab || (wide ? 'stats' : null);
  const Panel = PANELS[tab];

  function open(entry) {
    if (entry.tab === 'resume') {
      onClose();
      return;
    }
    if (entry.tab === 'quit') {
      onQuit();
      return;
    }
    if (entry.tab === 'save') {
      saveGame(game);
      notify(game, 'Game saved.', '#8dffb0');
      onClose();
      return;
    }
    game.run.menuTab = entry.tab;
    refresh();
  }

  function backToList() {
    game.run.menuTab = wide ? 'stats' : null;
    refresh();
  }

  const title = tab === 'map' ? 'World Map' : tab ? ENTRIES.find((entry) => entry.tab === tab).label : '';
  const panel = Panel && (
    <Window title={title} gold onClose={onClose} scroll={wide && tab !== 'map'}>
      {(!wide || tab === 'map') && (
        <button className="px-button" style={styles.back} onClick={backToList}>
          ◀ Menu
        </button>
      )}
      <Panel game={game} refresh={refresh} onClose={onClose} />
    </Window>
  );

  if (wide && tab !== 'map') {
    return (
      <div className="overlay menu-wide">
        <div style={styles.leftColumn}>
          <StatusPanel game={game} />
          <EntryList current={tab} onOpen={open} style={styles.wideList} />
        </div>
        {panel}
      </div>
    );
  }
  if (Panel) return <div className="overlay">{panel}</div>;
  return (
    <div className="overlay">
      <StatusPanel game={game} />
      <EntryList current={null} onOpen={open} />
    </div>
  );
}

const styles = {
  leftColumn: {
    gap: 12,
    flexShrink: 0,
  },
  wideList: {
    marginTop: 0,
  },
  list: {
    marginTop: 12,
    width: 240,
    padding: 8,
  },
  back: {
    alignSelf: 'flex-start',
    padding: '4px 10px',
    fontSize: 14,
    marginBottom: 4,
  },
};
