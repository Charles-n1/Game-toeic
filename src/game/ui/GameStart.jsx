import { useState } from 'react';
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
    <div className="start">
      <div className="row between">
        <span className="small">An isekai to master the TOEIC</span>
        <button className="close" onClick={onClose} aria-label="close">
          ✕
        </button>
      </div>
      <span className="logo">LEXIA</span>
      <span style={styles.tagline}>The Kingdom of Silence</span>
      <span style={styles.story}>
        A truck. A goddess. A world where every correct sentence is a sword stroke, and a Demon King steals the words of the living. Fight with your English: the
        monsters ask what YOU need to train.
      </span>

      <span className="subtitle">1 · Your level</span>
      <div className="panel">
        {appScore === null ? (
          <>
            <span>The goddess must read your level first.</span>
            <button className="btn btn-gold" style={styles.gap} onClick={onTakeTest}>
              📝 Take the level test (17 min)
            </button>
            <span className="small" style={styles.gap}>
              ...or type your TOEIC reading score (5 to 495):
            </span>
          </>
        ) : (
          <span>From your answers in the app, your reading score is about {appScore} / 495. You can change it:</span>
        )}
        <input className="field" style={styles.gap} value={scoreText} onChange={typeScore} inputMode="numeric" placeholder="ex: 300" aria-label="score" />
      </div>

      <span className="subtitle">2 · Your new life</span>
      {GOALS.map((goal) => (
        <button key={goal.id} className={'goal ' + (goalId === goal.id ? 'goal-on' : '')} onClick={() => setGoalId(goal.id)}>
          <span className="icon">{goal.icon}</span>
          <div className="grow">
            <span style={styles.goalTitle}>{goal.title}</span>
            <span className="small">{goal.text}</span>
          </div>
        </button>
      ))}

      <button className="btn btn-gold" style={styles.start} disabled={!canStart} onClick={start}>
        ✨ Be reborn in Lexia
      </button>
      <span className="small" style={styles.warning}>
        Death is real here. Aria can save you 3 times. After that, everything restarts.
      </span>
    </div>
  );
}

const styles = {
  tagline: {
    textAlign: 'center',
    color: '#b9a9ff',
    letterSpacing: 3,
    fontSize: 13,
  },
  story: {
    marginTop: 14,
    lineHeight: '21px',
    textAlign: 'center',
  },
  gap: {
    marginTop: 10,
  },
  goalTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  start: {
    marginTop: 18,
    padding: 16,
    fontSize: 16,
  },
  warning: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
};
