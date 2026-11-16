import { EVENTS } from '../../data/isekai';
import { NPCS } from '../../data/npcs';
import { currentEvent } from '../../logic/isekai/events';
import { pagesRead, PAGES_TOTAL } from '../../logic/isekai/lostHero';

// The "Diary" tab of the quests: the event of the world, the pages of the Lost Hero, the classmates found.
export default function DiaryTab({ game }) {
  const event = currentEvent(game);
  const pages = pagesRead(game);
  const classmates = NPCS.filter((npc) => npc.classmate && game.isekai.recognized[npc.id]);
  return (
    <>
      <span className="section">The world today</span>
      <span className="small">{event ? EVENTS[event.id].icon + ' ' + EVENTS[event.id].name + ': ' + EVENTS[event.id].text : 'A quiet day. Nothing strange in the sky.'}</span>

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
