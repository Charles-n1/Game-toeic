import { useEffect, useState } from 'react';
import Window from './Window';
import PixelIcon from './PixelIcon';
import { playEffect } from '../audio/effects';

// Animated RPG level-up celebration screen revealing stat gains one by one with chimes.
export default function LevelUpModal({ entry, onClose }) {
  const rows = entry?.stats || [];
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    if (rows.length === 0) return undefined;
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      setShown(step);
      playEffect(step >= rows.length ? 'levelUp' : 'coin');
      if (step >= rows.length) clearInterval(id);
    }, 260);
    return () => clearInterval(id);
  }, [entry?.toLevel, rows.length]);

  if (!entry) return null;

  return (
    <div className="overlay" style={styles.backdrop}>
      <Window title={`⭐ LEVEL UP · Lv.${entry.fromLevel} → Lv.${entry.toLevel}`} gold>
        <div className="row" style={styles.header}>
          <PixelIcon name="powers" size={36} />
          <div className="grow">
            <span className="gold" style={styles.bigLevel}>
              Level {entry.toLevel} Reached!
            </span>
            <span className="small">HP &amp; Mana fully restored · +{entry.skillPointsGained || 1} Skill Point earned</span>
          </div>
        </div>

        <span className="section">Parameter Growth</span>
        <div style={styles.grid}>
          {rows.map((row, idx) => {
            const visible = idx < shown;
            return (
              <div key={row.label} className="line" style={{ ...styles.row, opacity: visible ? 1 : 0.28 }}>
                <span className="grow">{row.label}</span>
                <span className="small">
                  {row.before} → <strong className="gold">{visible ? row.after : '?'}</strong>{' '}
                  {visible && row.delta > 0 && <span style={styles.delta}>+{row.delta}</span>}
                </span>
              </div>
            );
          })}
        </div>

        {entry.abilities && entry.abilities.length > 0 && (
          <>
            <span className="section">Unlocked &amp; Available</span>
            {entry.abilities.map((ab) => (
              <span key={ab} className="small" style={styles.ability}>
                ✦ {ab}
              </span>
            ))}
          </>
        )}

        <button className="px-button px-gold" style={styles.btn} onClick={onClose}>
          {shown >= rows.length ? 'Continue Adventure' : 'Skip'}
        </button>
      </Window>
    </div>
  );
}

const styles = {
  backdrop: {
    zIndex: 45,
  },
  header: {
    gap: 12,
    marginBottom: 8,
  },
  bigLevel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 10,
  },
  row: {
    transition: 'opacity 0.22s ease',
  },
  delta: {
    color: '#7cfc9a',
    marginLeft: 4,
  },
  ability: {
    color: '#ffd86b',
  },
  btn: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
};
