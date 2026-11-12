import Sheet from './Sheet';
import Bar from './Bar';
import { NPCS, npcOf } from '../data/npcs';
import { goalOf, CHAPTERS } from '../data/story';
import { typeOf } from '../data/types';
import { currentChapter } from '../logic/chapters';
import { activeQuests, questProgress } from '../logic/quests';
import { daysBeforeRaid } from '../logic/raid';
import { partnerOf, childrenOf } from '../logic/families';

function nameOf(id) {
  return id === 'player' ? 'you' : npcOf(id).name;
}

// "married to Finn · child: Verba"
function familyText(game, npcId) {
  const partner = partnerOf(game, npcId);
  const children = childrenOf(game, npcId);
  if (!partner) return '';
  return ' · 💍 ' + nameOf(partner) + (children.length > 0 ? ' · 👶 ' + children.join(', ') : '');
}

function PersonLine({ game, npc }) {
  const state = game.npcs[npc.id];
  return (
    <div style={styles.person}>
      <div className="row between">
        <span style={state.alive ? null : styles.dead}>
          {state.alive ? '' : '🕯️ '}
          {npc.name} <span className="small">· {npc.role}{familyText(game, npc.id)}</span>
        </span>
        <span className="small">{state.alive ? '💗 ' + state.friendship : 'dead'}</span>
      </div>
      {state.alive && <Bar value={state.friendship / 100} color="#ff7eb6" height={5} />}
    </div>
  );
}

// The journal: the story, the quests, the village and its people.
export default function QuestScreen({ game, onClose }) {
  const goal = goalOf(game.goal);
  const chapter = currentChapter(game);
  const focus = typeOf(game.focus.current);
  const quests = activeQuests(game);
  const met = NPCS.filter((npc) => game.npcs[npc.id].talkedDay > 0 || !game.npcs[npc.id].alive);

  return (
    <Sheet title="Journal" onClose={onClose}>
      <span className="subtitle">
        {goal.icon} {goal.title}
      </span>
      <div className="line" style={styles.column}>
        {chapter ? (
          <>
            <span style={styles.bold}>
              Chapter {game.chapter + 1} / {CHAPTERS[game.goal].length} · {chapter.title}
            </span>
            <span className="small">{chapter.text}</span>
          </>
        ) : (
          <span style={styles.bold}>Your story is complete. The world is yours.</span>
        )}
      </div>

      <span className="subtitle">Training</span>
      <div className="line" style={styles.column}>
        <span style={styles.bold}>
          🎯 {focus.icon} {focus.name}
        </span>
        <span className="small">
          Most monsters are of this type. Reach {game.run.goalRate}% over at least 8 answers ({game.focus.tally.good} good / {game.focus.tally.bad} bad for now) and the
          training moves to your next weakness. It will come back later, to check you still know it.
        </span>
      </div>

      <span className="subtitle">Quests</span>
      {quests.length === 0 && <span className="small">No quest. People with ❗ above their head need help.</span>}
      {quests.map((quest) => {
        const progress = questProgress(game, quest);
        return (
          <div key={quest.id} className="line" style={styles.column}>
            <span style={styles.bold}>
              {quest.title} ({progress.have}/{progress.need})
            </span>
            <span className="small">
              {npcOf(quest.giver).name}: “{quest.ask}” · reward {quest.lexis} Lexis
            </span>
          </div>
        );
      })}

      <span className="subtitle">Lexia</span>
      <div className="line" style={styles.column}>
        <span style={styles.bold}>😊 Happiness {game.happiness} / 100</span>
        <Bar value={game.happiness / 100} color="#ffd23f" />
        <span className="small">Helping people makes the village happier: better prices, faster friendships. Deaths make it sadder.</span>
        <span className="small" style={styles.raid}>
          {game.bosses.king ? 'The north is silent no more. No raid will come.' : '☠️ Next raid: in ' + daysBeforeRaid(game) + ' day(s), at nightfall. Raids survived: ' + game.raid.count}
        </span>
      </div>

      <span className="subtitle">People you know</span>
      {met.length === 0 && <span className="small">Nobody yet. Go and talk!</span>}
      {met.map((npc) => (
        <PersonLine key={npc.id} game={game} npc={npc} />
      ))}
    </Sheet>
  );
}

const styles = {
  column: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  bold: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  raid: {
    marginTop: 6,
    color: '#ff9c9c',
  },
  person: {
    marginBottom: 10,
  },
  dead: {
    color: '#8a84a8',
  },
};
