import Window from '../Window';
import PixelIcon from '../PixelIcon';
import StatusPanel from '../StatusPanel';
import StatsPanel from './StatsPanel';
import InventoryPanel from './InventoryPanel';
import PowersPanel from './PowersPanel';
import QuestsPanel from './QuestsPanel';
import MapPanel from './MapPanel';
import { saveGame } from '../../logic/save';
import { notify } from '../../logic/messages';

// The entries of the menu. icon: see draw/icons.js
const ENTRIES = [
  { tab: 'stats', label: 'Stats' },
  { tab: 'inventory', label: 'Inventory' },
  { tab: 'powers', label: 'Powers' },
  { tab: 'quests', label: 'Quests' },
  { tab: 'map', label: 'Map' },
  { tab: 'save', label: 'Save' },
  { tab: 'quit', label: 'Quit' },
];

const PANELS = { stats: StatsPanel, inventory: InventoryPanel, powers: PowersPanel, quests: QuestsPanel, map: MapPanel };

// The pause menu: the list of entries, then the window of the chosen one. game.run.menuTab: null = the list.
// onQuit: back to the app.
export default function MenuScreen({ game, refresh, onClose, onQuit }) {
  const tab = game.run.menuTab;
  const Panel = PANELS[tab];

  function open(entry) {
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
    game.run.menuTab = null;
    refresh();
  }

  if (Panel) {
    const title = tab === 'map' ? 'World Map' : ENTRIES.find((entry) => entry.tab === tab).label;
    return (
      <div className="overlay">
        <Window title={title} gold onClose={onClose}>
          <button className="px-button" style={styles.back} onClick={backToList}>
            ◀ Menu
          </button>
          <Panel game={game} refresh={refresh} onClose={onClose} />
        </Window>
      </div>
    );
  }

  return (
    <div className="overlay">
      <StatusPanel game={game} />
      <div className="window slide-up" style={styles.list}>
        {ENTRIES.map((entry, index) => (
          <button key={entry.tab} className={'menu-item' + (index === 0 ? ' selected' : '')} onClick={() => open(entry)}>
            <PixelIcon name={entry.tab} size={28} />
            <span>{entry.label}</span>
          </button>
        ))}
        <div style={styles.separator} />
        <button className="menu-item" onClick={onClose}>
          <span>Back to the game</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  list: {
    marginTop: 12,
    width: 240,
    padding: 8,
  },
  separator: {
    height: 2,
    margin: '6px 4px',
    backgroundColor: 'rgba(223, 228, 240, 0.35)',
  },
  back: {
    alignSelf: 'flex-start',
    padding: '4px 10px',
    fontSize: 14,
    marginBottom: 4,
  },
};
