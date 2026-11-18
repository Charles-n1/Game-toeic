import Window from './Window';
import { goalOf } from '../data/story';
import { TYPES } from '../data/types';
import { skillPercent } from '../logic/learning';
import { ensureSoul } from '../logic/soul';

// The best and the weakest grammar types of the player: [best, weakest].
function bestAndWeakest(game) {
  const sorted = [...TYPES].sort((a, b) => skillPercent(game, b.id) - skillPercent(game, a.id));
  return [sorted[0], sorted[sorted.length - 1]];
}

// The player is dead, for real. Everything restarts from the beginning.
export default function GameOver({ game, onRestart, onQuit }) {
  const counts = game.counts;
  const percent = counts.answers === 0 ? 0 : Math.round((counts.correct / counts.answers) * 100);
  const [best, weakest] = bestAndWeakest(game);
  const soul = ensureSoul(game);

  return (
    <div className="overlay" style={styles.page}>
      <span className="big-title" style={styles.title}>
        Your story ends here
      </span>
      <Window gold>
        <span style={styles.text}>
          Nobody was left to carry you home. In Lexia, they will say a stranger fell from the sky, and tried to: {goalOf(game.goal).title.toLowerCase()}.
        </span>
        <span className="section">{game.player.name}'s life</span>
        <span>{game.day} days lived</span>
        <span>Level {game.player.level}</span>
        <span>{counts.kills} monsters defeated</span>
        <span>
          {counts.correct} / {counts.answers} good answers ({percent}%)
        </span>
        <span className="section">Your English</span>
        <span>
          Best: {best.name} ({skillPercent(game, best.id)}%)
        </span>
        <span>
          To work on: {weakest.name} ({skillPercent(game, weakest.id)}%)
        </span>
        <span className="small" style={styles.text}>
          Your English stays: everything you answered is still in your stats and your recovery.
        </span>
        {soul.pet?.adopted && (
          <span className="small" style={styles.text}>
            On your quiet porch, {soul.pet.name} waited beside your sandals until morning.
          </span>
        )}
        <button className="px-button px-gold" style={styles.button} onClick={onRestart}>
          Be reborn
        </button>
        <button className="px-button" style={styles.button} onClick={onQuit}>
          Main menu
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
