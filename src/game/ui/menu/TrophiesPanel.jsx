import { useState } from 'react';
import Bar from '../Bar';
import { ACHIEVEMENTS, GALLERY_SCENES, ANIME_EPISODES } from '../../data/isekaiTodo';
import { ensureIsekaiTodo } from '../../logic/isekaiTodo/state';
import { hasAchievement } from '../../logic/isekaiTodo/progression';
import { snapAdventurePhoto, syncWeeklyChallenge, claimWeeklyReward } from '../../logic/isekaiTodo/socialPlus';

const SUB_TABS = [
  { id: 'ach', label: 'Achievements' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'album', label: 'Photo Album' },
  { id: 'gallery', label: 'Gallery' },
];

export default function TrophiesPanel({ game, refresh }) {
  const [sub, setSub] = useState('ach');
  const st = ensureIsekaiTodo(game);
  const unlockedCount = ACHIEVEMENTS.filter((a) => hasAchievement(game, a.id)).length;
  const challenge = syncWeeklyChallenge(game);
  const weekly = st.weekly;
  const currentEp = ANIME_EPISODES[Math.min(ANIME_EPISODES.length - 1, Math.max(0, (st.episodes?.currentEp || 1) - 1))];

  return (
    <>
      <div className="row wrap" style={styles.tabs}>
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            className={'village-filter' + (sub === t.id ? ' village-filter-active' : '')}
            onClick={() => setSub(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'ach' && (
        <>
          <span className="section">
            Achievements ({unlockedCount} / {ACHIEVEMENTS.length})
          </span>
          <Bar value={unlockedCount / ACHIEVEMENTS.length} color="#ffd23f" height={7} />
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = hasAchievement(game, ach.id);
            const r = ach.reward || {};
            const rewardLabel = [r.lexis && `+${r.lexis}L`, r.xp && `+${r.xp} XP`, r.skillPt && `+${r.skillPt} Skill Pt`].filter(Boolean).join(' · ');
            return (
              <div key={ach.id} className="line" style={{ opacity: unlocked ? 1 : 0.62 }}>
                <span style={styles.icon}>{ach.icon}</span>
                <div className="grow">
                  <span>
                    <strong className={unlocked ? 'gold' : ''}>{ach.name}</strong>{' '}
                    <span className="small">{unlocked ? `✓ Day ${st.achievements[ach.id]?.day || 1}` : '🔒 Locked'}</span>
                  </span>
                  <span className="small">{ach.desc}</span>
                  {rewardLabel && <span className="small">Reward: {rewardLabel}</span>}
                </div>
              </div>
            );
          })}
        </>
      )}

      {sub === 'weekly' && (
        <>
          <span className="section">Solo Weekly Challenge · Week {weekly.week}</span>
          <div className="quest-card">
            <span className="gold" style={styles.cardTitle}>{challenge.title}</span>
            <span className="small">{challenge.desc}</span>
            <Bar value={Math.min(1, (weekly.progress || 0) / challenge.goal)} color={weekly.completed ? '#7cfc9a' : '#ffd23f'} height={8} />
            <span className="small">
              Progress: {weekly.progress || 0} / {challenge.goal} · Reward: +{challenge.reward?.lexis || 0} Lexis + {challenge.reward?.item || 'bonus'}
            </span>
            {weekly.completed && !weekly.rewardClaimed && (
              <button
                className="px-button px-gold"
                onClick={() => {
                  claimWeeklyReward(game);
                  refresh();
                }}
              >
                Claim Weekly Reward
              </button>
            )}
            {weekly.rewardClaimed && <span className="small" style={{ color: '#7cfc9a' }}>✓ Claimed this week!</span>}
          </div>

          <span className="section">Solo Personal Records</span>
          <div className="line">
            <div className="grow">
              <span>Fastest Correct Answer</span>
              <span className="small">
                {weekly.fastestAnswerMs !== null ? `${(weekly.fastestAnswerMs / 1000).toFixed(2)}s` : 'No timed duel recorded yet'}
              </span>
            </div>
          </div>
          <div className="line">
            <div className="grow">
              <span>Longest Answer Streak</span>
              <span className="small">{weekly.longestCleanStreak || 0} correct answers in a row</span>
            </div>
          </div>
          <div className="line">
            <div className="grow">
              <span>Weekly Challenges Cleared</span>
              <span className="small">{weekly.bestWeekCount || 0} week(s)</span>
            </div>
          </div>
        </>
      )}

      {sub === 'album' && (
        <>
          <span className="section">Current Chronicle Episode</span>
          <div className="quest-card">
            <span className="gold">{currentEp?.title}</span>
            <span className="small">{currentEp?.nextPreview}</span>
          </div>

          <div className="row between" style={styles.albumHeader}>
            <span className="section">Photo Album ({st.gallery.photos.length}/24)</span>
            <button
              className="px-button px-gold"
              onClick={() => {
                snapAdventurePhoto(game);
                refresh();
              }}
            >
              📷 Snap Photo
            </button>
          </div>
          {st.gallery.photos.length === 0 && <span className="small">Take snapshots outdoors, at landmarks, or capture milestones automatically!</span>}
          {[...st.gallery.photos].reverse().map((p) => (
            <div key={p.id} className="line">
              <span>📷</span>
              <div className="grow">
                <span>{p.caption}</span>
                <span className="small">
                  Day {p.day} · {p.zone}
                  {p.withNpc ? ` · with ${p.withNpc}` : ''}
                </span>
              </div>
            </div>
          ))}
        </>
      )}

      {sub === 'gallery' && (
        <>
          <span className="section">
            Story Illustrations ({st.gallery.unlocked.length} / {GALLERY_SCENES.length})
          </span>
          {GALLERY_SCENES.map((scene) => {
            const open = st.gallery.unlocked.includes(scene.id);
            return (
              <div
                key={scene.id}
                className="line"
                style={{
                  borderLeft: `4px solid ${open ? scene.color : '#3a3f5c'}`,
                  opacity: open ? 1 : 0.52,
                }}
              >
                <span style={styles.icon}>{scene.icon}</span>
                <div className="grow">
                  <span className={open ? 'gold' : ''}>{open ? scene.title : '??? (Locked Scene)'}</span>
                  <span className="small">{open ? scene.desc : 'Reach this milestone in Eldermoor to unlock its CG illustration.'}</span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

const styles = {
  tabs: {
    gap: 6,
    marginBottom: 8,
  },
  icon: {
    fontSize: 22,
    width: 28,
    textAlign: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  albumHeader: {
    marginTop: 6,
    alignItems: 'center',
  },
};
