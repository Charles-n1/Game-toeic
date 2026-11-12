import { goalOf } from '../data/story';

// The player is dead, for real. Everything restarts from the beginning.
export default function GameOver({ game, onRestart, onQuit }) {
  const counts = game.counts;
  const percent = counts.answers === 0 ? 0 : Math.round((counts.correct / counts.answers) * 100);

  return (
    <div className="start" style={styles.page}>
      <span className="big-emoji">🕯️</span>
      <span className="logo">You died</span>
      <span style={styles.text}>
        Nobody was left to carry you home. In Lexia, they will say a stranger fell from the sky, and tried to: {goalOf(game.goal).title.toLowerCase()}.
      </span>
      <div className="panel" style={styles.stats}>
        <span>📅 {game.day} days lived</span>
        <span>⭐ Level {game.player.level}</span>
        <span>⚔️ {counts.kills} monsters defeated</span>
        <span>
          ✍️ {counts.correct} / {counts.answers} good answers ({percent}%)
        </span>
      </div>
      <span className="small" style={styles.text}>
        Your English stays: everything you answered is still in your stats and your recovery.
      </span>
      <button className="btn btn-gold" style={styles.button} onClick={onRestart}>
        Be reborn
      </button>
      <button className="btn" style={styles.button} onClick={onQuit}>
        Back to the app
      </button>
    </div>
  );
}

const styles = {
  page: {
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    marginTop: 12,
    lineHeight: '21px',
  },
  stats: {
    marginTop: 16,
  },
  button: {
    marginTop: 12,
  },
};
