import Window from './Window';
import { goalOf } from '../data/story';

// The player is dead, for real. Everything restarts from the beginning.
export default function GameOver({ game, onRestart, onQuit }) {
  const counts = game.counts;
  const percent = counts.answers === 0 ? 0 : Math.round((counts.correct / counts.answers) * 100);

  return (
    <div className="overlay" style={styles.page}>
      <span className="big-title" style={styles.title}>
        YOU DIED
      </span>
      <Window gold>
        <span style={styles.text}>
          Nobody was left to carry you home. In Lexia, they will say a stranger fell from the sky, and tried to: {goalOf(game.goal).title.toLowerCase()}.
        </span>
        <span className="section">Your life</span>
        <span>{game.day} days lived</span>
        <span>Level {game.player.level}</span>
        <span>{counts.kills} monsters defeated</span>
        <span>
          {counts.correct} / {counts.answers} good answers ({percent}%)
        </span>
        <span className="small" style={styles.text}>
          Your English stays: everything you answered is still in your stats and your recovery.
        </span>
        <button className="px-button px-gold" style={styles.button} onClick={onRestart}>
          Be reborn
        </button>
        <button className="px-button" style={styles.button} onClick={onQuit}>
          Back to the app
        </button>
      </Window>
    </div>
  );
}

const styles = {
  page: {
    justifyContent: 'center',
    background: 'rgba(30, 4, 10, 0.82)',
  },
  title: {
    color: '#ff5a6e',
    marginBottom: 8,
  },
  text: {
    lineHeight: '21px',
    marginTop: 8,
  },
  button: {
    marginTop: 12,
  },
};
