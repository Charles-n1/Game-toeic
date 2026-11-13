import { useState } from 'react';
import Window from './Window';
import PixelIcon from './PixelIcon';
import useCanvas from './useCanvas';
import { drawLandscape } from '../draw/scene';
import { GOALS } from '../data/story';
import { CATEGORIES } from '../../data/categories';
import { SECTION_MAX } from '../../goal';

const LOWEST_SCORE = 5; // the lowest TOEIC reading score

// All the answers given in the app: the current chart + the charts of the history. { good: 120, bad: 80 }
function allAnswers(stats, history) {
  const totals = { good: 0, bad: 0 };
  for (const chart of [stats, ...history.map((snapshot) => snapshot.stats)]) {
    for (const category of CATEGORIES) {
      const counts = chart[category.id] || { good: 0, bad: 0 };
      totals.good += counts.good;
      totals.bad += counts.bad;
    }
  }
  return totals;
}

// The reading score (5 to 495) guessed from the answers. null = the player never answered anything.
function scoreFromApp(stats, history) {
  const totals = allAnswers(stats, history);
  const total = totals.good + totals.bad;
  if (total === 0) return null;
  const score = Math.round(((totals.good / total) * SECTION_MAX) / 5) * 5; // TOEIC scores go 5 by 5
  return Math.max(LOWEST_SCORE, score);
}

function isValidScore(text) {
  const score = Number(text);
  return text !== '' && Number.isInteger(score) && score >= LOWEST_SCORE && score <= SECTION_MAX;
}

// The village of Lexia, slowly passing by behind the start screen.
function Landscape() {
  const canvasRef = useCanvas((ctx, width, height, time) => drawLandscape(ctx, width, height, time));
  return <canvas ref={canvasRef} className="game-canvas" />;
}

// The door of the game. To enter, the goddess must know the level of the player:
// from the level test (or any answer given in the app), or from a score typed here. Then the player picks a life.
export default function GameStart({ stats, history, onStart, onTakeTest, onClose }) {
  const appScore = scoreFromApp(stats, history);
  const [scoreText, setScoreText] = useState(appScore === null ? '' : String(appScore));
  const [goalId, setGoalId] = useState(null);
  const canStart = isValidScore(scoreText) && goalId !== null;

  function typeScore(event) {
    setScoreText(event.target.value.replace(/\D/g, '').slice(0, 3)); // digits only
  }

  function start() {
    onStart(goalId, Number(scoreText));
  }

  return (
    <>
      <Landscape />
      <div className="start">
        <button className="close" onClick={onClose} aria-label="close">
          ✕
        </button>
        <div style={styles.header}>
          <span className="logo">LEXIA</span>
          <span style={styles.tagline}>The Kingdom of Silence</span>
        </div>
        <Window>
          <span style={styles.story}>
            A truck. A goddess. A world where every correct sentence is a sword stroke, and a Demon King steals the words of the living. Fight with your English:
            the monsters ask what YOU need to train.
          </span>
        </Window>

        <Window title="Your level">
          {appScore === null ? (
            <>
              <span>The goddess must read your level first.</span>
              <button className="px-button px-gold" style={styles.gap} onClick={onTakeTest}>
                Take the level test (17 min)
              </button>
              <span className="small" style={styles.gap}>
                ...or type your TOEIC reading score (5 to 495):
              </span>
            </>
          ) : (
            <span>From your answers in the app, your reading score is about {appScore} / 495. You can change it:</span>
          )}
          <input className="field" style={styles.gap} value={scoreText} onChange={typeScore} inputMode="numeric" placeholder="300" aria-label="score" />
        </Window>

        <Window title="Your new life">
          {GOALS.map((goal) => (
            <button key={goal.id} className={'menu-item' + (goalId === goal.id ? ' selected' : '')} onClick={() => setGoalId(goal.id)}>
              <PixelIcon name={goal.icon} size={28} />
              <div className="grow">
                <span>{goal.title}</span>
                <span className="small">{goal.text}</span>
              </div>
            </button>
          ))}
        </Window>

        <button className="px-button px-gold" style={styles.start} disabled={!canStart} onClick={start}>
          Be reborn in Lexia
        </button>
        <span className="small" style={styles.warning}>
          Death is real here. Aria can save you 3 times. After that, everything restarts.
        </span>
      </div>
    </>
  );
}

const styles = {
  header: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  tagline: {
    color: '#ffffff',
    letterSpacing: 3,
    fontSize: 16,
    textShadow: '2px 2px 0 #0e1430',
    marginTop: 4,
  },
  story: {
    lineHeight: '21px',
    textAlign: 'center',
  },
  gap: {
    marginTop: 10,
  },
  start: {
    padding: 14,
    fontSize: 20,
  },
  warning: {
    textAlign: 'center',
    color: '#ffffff',
    textShadow: '1px 1px 0 #0e1430',
  },
};
