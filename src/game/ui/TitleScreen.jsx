import Landscape from './Landscape';
import PixelIcon from './PixelIcon';
import { lastSlot, slotSummary } from '../logic/save';

// The main menu: Continue / New game / Options / Credits.
// onContinue(slot): plays the last saved game. onClose: back to the app.
export default function TitleScreen({ onContinue, onNewGame, onOptions, onCredits, onClose }) {
  const slot = lastSlot();
  const summary = slot ? slotSummary(slot) : null;

  return (
    <div className="screen">
      <Landscape />
      <div className="start" style={styles.page}>
        <div style={styles.header}>
          <span className="logo">LEXIA</span>
          <span style={styles.tagline}>The Kingdom of Silence</span>
        </div>
        <div className="window slide-up" style={styles.menu}>
          <button className={'menu-item' + (summary ? ' selected' : '')} disabled={!summary} onClick={() => onContinue(slot)}>
            <PixelIcon name="resume" size={28} />
            <div className="grow">
              <span>Continue</span>
              {summary && (
                <span className="small">
                  {summary.name} · Lv. {summary.level} · Day {summary.day}
                </span>
              )}
            </div>
          </button>
          <button className={'menu-item' + (summary ? '' : ' selected')} onClick={onNewGame}>
            <PixelIcon name="save" size={28} />
            <div className="grow">
              <span>New game</span>
              <span className="small">and your 3 save slots</span>
            </div>
          </button>
          <button className="menu-item" onClick={onOptions}>
            <PixelIcon name="options" size={28} />
            <span>Options</span>
          </button>
          <button className="menu-item" onClick={onCredits}>
            <PixelIcon name="book" size={28} />
            <span>Credits</span>
          </button>
          <div style={styles.separator} />
          <button className="menu-item" onClick={onClose}>
            <PixelIcon name="quit" size={28} />
            <span>Back to the app</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 6,
  },
  tagline: {
    color: '#ffffff',
    letterSpacing: 3,
    fontSize: 16,
    textShadow: '2px 2px 0 #0e1430',
    marginTop: 4,
  },
  menu: {
    width: 280,
    padding: 8,
  },
  separator: {
    height: 2,
    margin: '6px 4px',
    backgroundColor: 'rgba(223, 228, 240, 0.35)',
  },
};
