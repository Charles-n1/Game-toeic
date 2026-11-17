import { useState } from 'react';
import Window from './Window';
import PixelIcon from './PixelIcon';
import Landscape from './Landscape';
import HeroCreator from './HeroCreator';
import { DEFAULT_HERO } from '../data/hero';
import { GOALS } from '../data/story';
import { CATEGORIES, DEFAULT_CATEGORY_PERCENTS } from '../../data/categories';
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

// A new game. The player makes their hero (name + avatar). Then the goddess must know their level:
// from the level test (or any answer given in the app), or from a score typed here. Then the player picks a life.
// onStart(goalId, score, hero). onBack: back to the save slots.
export default function GameStart({ stats, history, onStart, onTakeTest, onBack }) {
  const appScore = scoreFromApp(stats, history);
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [scoreText, setScoreText] = useState(
    appScore === null ? '450' : String(Math.min(SECTION_MAX, Math.max(450, appScore + 55)))
  );
  const [goalId, setGoalId] = useState(null);
  const [showCustom, setShowCustom] = useState(false);
  const [currentStats, setCurrentStats] = useState(() => ({ ...DEFAULT_CATEGORY_PERCENTS }));
  const canStart = hero.name.trim() !== '' && isValidScore(scoreText) && goalId !== null;

  function typeScore(event) {
    setScoreText(event.target.value.replace(/\D/g, '').slice(0, 3)); // digits only
  }

  function changeCurrentStat(catId, raw) {
    const cleaned = raw.replace(/\D/g, '');
    setCurrentStats((prev) => {
      const next = { ...prev };
      if (cleaned === '') {
        delete next[catId];
      } else {
        next[catId] = Math.max(0, Math.min(99, Math.round(Number(cleaned) || 0)));
      }
      return next;
    });
  }

  function start() {
    onStart(goalId, Number(scoreText), { ...hero, name: hero.name.trim() }, {}, currentStats);
  }

  return (
    <div className="screen">
      <Landscape />
      <div className="start">
        <button className="close" onClick={onBack} aria-label="back">
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

        <Window title="Your hero">
          <HeroCreator hero={hero} onChange={setHero} />
        </Window>

        <Window title="TOEIC Target & Current %">
          {appScore === null ? (
            <>
              <span>Set your target TOEIC reading score to reach in this world (5 to 495):</span>
              <button className="px-button px-gold" style={styles.gap} onClick={onTakeTest}>
                Or take the app level test first (17 min)
              </button>
            </>
          ) : (
            <span>
              Your current reading estimate is ~{appScore} / 495. Set the target TOEIC score you aim to reach (5 to 495):
            </span>
          )}
          <input className="field" style={styles.gap} value={scoreText} onChange={typeScore} inputMode="numeric" placeholder="400" aria-label="target-score" />
          <button className="px-button" style={styles.gap} onClick={() => setShowCustom((v) => !v)}>
            {showCustom ? 'Hide current category %' : 'Set your current % per category (optional)'}
          </button>
          {showCustom && (
            <>
              <span className="small" style={styles.gap}>
                Insert your CURRENT percentage (1–99%) in any category. You start at these values and raise them toward your TOEIC target. Weakest categories link directly to Speed, Health &amp; Attack!
              </span>
              <div style={styles.weightsGrid}>
                {CATEGORIES.map((cat) => (
                  <label key={cat.id} className="row" style={styles.weightRow}>
                    <span className="small grow">{cat.name}</span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={currentStats[cat.id] !== undefined ? currentStats[cat.id] : ''}
                      placeholder="Auto"
                      onChange={(e) => changeCurrentStat(cat.id, e.target.value)}
                      style={styles.weightInput}
                    />
                    <span className="small">%</span>
                  </label>
                ))}
              </div>
            </>
          )}
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
    </div>
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
  weightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: 6,
    marginTop: 10,
  },
  weightRow: {
    gap: 6,
    alignItems: 'center',
  },
  weightInput: {
    width: 56,
    padding: '2px 4px',
    background: '#141a33',
    color: '#ffffff',
    border: '1px solid #6b7ab8',
    fontFamily: 'inherit',
  },
};
