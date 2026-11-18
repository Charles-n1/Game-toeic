import { useState } from 'react';
import { EVENTS } from '../../data/isekai';
import { NPCS } from '../../data/npcs';
import { PERSONAL_ARCS } from '../../data/soul';
import { currentEvent } from '../../logic/isekai/events';
import { pagesRead, PAGES_TOTAL } from '../../logic/isekai/lostHero';
import { ensureSoul, setRealExamDate, playLouisFlashback, homeMemoriesSummary } from '../../logic/soul';

// The "Diary" tab of the quests: world event, Lost Hero pages, classmates, SOUL character arcs, real exam & memories.
export default function DiaryTab({ game }) {
  const event = currentEvent(game);
  const pages = pagesRead(game);
  const classmates = NPCS.filter((npc) => npc.classmate && game.isekai.recognized[npc.id]);
  const soul = ensureSoul(game);
  const arcEntries = Object.entries(PERSONAL_ARCS);
  const [examInput, setExamInput] = useState(soul.realLife.examDate || '');
  const restoredList = Object.values(soul.masteredRestored || {});
  const homeMem = homeMemoriesSummary(game);

  function saveExamDate(value) {
    setExamInput(value);
    setRealExamDate(game, value);
  }

  return (
    <>
      <span className="section">The world today</span>
      <span className="small">{event ? EVENTS[event.id].icon + ' ' + EVENTS[event.id].name + ': ' + EVENTS[event.id].text : 'A quiet day. Nothing strange in the sky.'}</span>

      <span className="section">Your Real-World TOEIC Exam Date (Optional)</span>
      <div className="row" style={{ gap: 8, alignItems: 'center' }}>
        <input type="date" value={examInput} onChange={(e) => saveExamDate(e.target.value)} style={{ background: '#1e1928', color: '#f5ecd8', border: '1px solid #6b5842', padding: '3px 6px' }} />
        {examInput && <span className="small gold">Aria & Eldermoor remember {examInput}</span>}
      </div>

      <span className="section">Bonds & Personal Stories (SOUL)</span>
      <span className="small">
        Hero Voice Tone: {soul.voice.dominant || 'Undecided'} (Kind {soul.voice.kind} · Teasing {soul.voice.teasing} · Silent {soul.voice.silent})
      </span>
      {arcEntries.map(([id, data]) => {
        const st = soul.arcs[id] || { step: 0, completed: false };
        return (
          <span key={id} className="small">
            {data.name}: Step {st.step}/{data.steps.length} {st.completed ? '✓ Secret shared' : ''}
          </span>
        );
      })}
      <span className="small">
        Eldermoor Memory: {game.npcs?.orin?.alive === false ? 'Orin remembered ("Finish the sentence.", Tree Lv.' + (soul.orin.treeStage || 0) + ') · Successor: ' + (soul.orin.elderSuccessor || 'unfilled') : 'Elder Orin stands watch'} · Tomo: {soul.tomo.state}
      </span>
      {restoredList.length > 0 && (
        <span className="small">Restored Wonders ({restoredList.length}/10): {restoredList.map((r) => r.wonder).join(', ')}</span>
      )}
      {homeMem.bossTrophies.length > 0 && (
        <span className="small">Home Trophies: {homeMem.bossTrophies.join(', ')}</span>
      )}
      {soul.legend.mayoStage > 0 && (
        <span className="small">Hugo’s Mayonnaise Influence: Tier {soul.legend.mayoStage + 1}/4</span>
      )}
      {soul.raidMemory.memorialNames.length > 0 && (
        <span className="small">Fallen Memorial Names: {soul.raidMemory.memorialNames.join(', ')}</span>
      )}
      {soul.pet && (
        <span className="small">Porch Companion ({soul.pet.name}): {soul.pet.adopted ? 'Adopted ✓' : soul.pet.met ? 'Waiting by your door' : 'Not yet befriended'}</span>
      )}
      {(pages.length >= 3 || game.chapter >= 4) && !soul.legend.louisFlashbackPlayed && (
        <button className="px-button" onClick={() => playLouisFlashback(game)} style={{ marginTop: 6 }}>
          🕳️ Witness Louis’s Final Flashback
        </button>
      )}
      {Array.isArray(soul.moments.endingSummary) && soul.moments.endingSummary.length > 0 && (
        <>
          <span className="section">Epilogue of Lexia</span>
          {soul.moments.endingSummary.map((note, idx) => (
            <span key={idx} className="small">• {note}</span>
          ))}
        </>
      )}

      <span className="section">
        The diary of the Lost Hero ({pages.length}/{PAGES_TOTAL})
      </span>
      {pages.length === 0 && <span className="small">Somewhere, graves without names hide the pages of a diary, written in the language of your old world.</span>}
      {pages.map((page, i) => (
        <div key={i} className="line" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          {page.map((line, j) => (
            <span key={j} className="small">
              {line}
            </span>
          ))}
        </div>
      ))}

      <span className="section">Classmates in this world</span>
      {classmates.length === 0 && <span className="small">You feel you are not the only one who came from the exam room...</span>}
      {classmates.map((npc) => (
        <span key={npc.id} className="small">
          {npc.name}: {npc.role}
        </span>
      ))}
    </>
  );
}
