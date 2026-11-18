import Window from './Window';

// Anime-style Episode Title Card ("Episode X: ...") and closing "To be continued..." preview.
export default function EpisodeCardModal({ modal, onClose }) {
  if (!modal) return null;
  const isEnd = modal.mode === 'end';
  const ep = modal.episode || { ep: 1, title: 'Episode 1: Lexia', nextPreview: '' };

  return (
    <div className="overlay" style={styles.backdrop}>
      <Window title={isEnd ? '▶ TO BE CONTINUED...' : '📺 ANIME CHRONICLE · OPENING'} gold>
        <div style={styles.card}>
          <span className="small" style={styles.kicker}>
            {isEnd ? 'END OF EPISODE' : `ARC ${ep.ep} · OPENING ACT`}
          </span>
          <span className="gold" style={styles.title}>
            {isEnd ? 'To Be Continued...' : ep.title}
          </span>
          {isEnd && ep.nextPreview && (
            <span style={styles.preview}>
              {ep.nextPreview}
            </span>
          )}
          {!isEnd && (
            <span className="small" style={styles.sub}>
              Every correct English phrase shapes your destiny in Eldermoor.
            </span>
          )}
        </div>
        <button className="px-button px-gold" style={styles.btn} onClick={onClose}>
          {isEnd ? 'Next Episode ▶' : 'Begin Episode ▶'}
        </button>
      </Window>
    </div>
  );
}

const styles = {
  backdrop: {
    zIndex: 44,
  },
  card: {
    padding: '18px 12px',
    background: 'linear-gradient(135deg, rgba(16, 20, 48, 0.96), rgba(48, 18, 42, 0.94))',
    border: '1px solid #ffd23f',
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    textAlign: 'center',
  },
  kicker: {
    letterSpacing: 2,
    color: '#9fd8ff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 1.35,
  },
  preview: {
    fontSize: 14,
    color: '#ffe8a8',
    fontStyle: 'italic',
  },
  sub: {
    color: '#c9d1e0',
  },
  btn: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
};
