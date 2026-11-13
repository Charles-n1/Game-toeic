import Bar from '../Bar';
import { NPCS, npcOf } from '../../data/npcs';
import { goalOf, CHAPTERS } from '../../data/story';
import { typeOf } from '../../data/types';
import { currentChapter } from '../../logic/chapters';
import { activeQuests, questProgress } from '../../logic/quests';
import { daysBeforeRaid } from '../../logic/raid';
import { partnerOf, childrenOf } from '../../logic/families';

function nameOf(id) {
  return id === 'player' ? 'you' : npcOf(id).name;
}

// "married to Finn · child: Verba"
function familyText(game, npcId) {
  const partner = partnerOf(game, npcId);
  const children = childrenOf(game, npcId);
  if (!partner) return '';
  return ' · married to ' + nameOf(partner) + (children.length > 0 ? ' · children: ' + children.join(', ') : '');
}

function PersonLine({ game, npc }) {
  const state = game.npcs[npc.id];
  return (
    <div className="line" style={styles.column}>
      <div className="row between">
        <span style={state.alive ? null : styles.dead}>
          {state.alive ? '' : '✝ '}
          {npc.name} <span className="small">· {npc.role + familyText(game, npc.id)}</span>
        </span>
        <span className="small">{state.alive ? '♥ ' + state.friendship : 'dead'}</span>
      </div>
      {state.alive && <Bar value={state.friendship / 100} color="#ff7eb6" height={6} />}
    </div>
  );
}

// The journal: the story, the quests, the village and its people.
export default function QuestsPanel({ game }) {
  const goal = goalOf(game.goal);
  const chapter = currentChapter(game);
  const focus = typeOf(game.focus.current);
  const quests = activeQuests(game);
  const met = NPCS.filter((npc) => game.npcs[npc.id].talkedDay > 0 || !game.npcs[npc.id].alive);

  return (
    <>
      <span className="section">{goal.title}</span>
      {chapter ? (
        <div style={styles.column}>
          <span className="gold">
            Chapter {game.chapter + 1} / {CHAPTERS[game.goal].length} · {chapter.title}
          </span>
          <span>{chapter.text}</span>
        </div>
      ) : (
        <span>Your story is complete. The world is yours.</span>
      )}

      <span className="section">Training</span>
      <span>
        <span className="gold">◆</span> {focus.name}
      </span>
      <span className="small">
        Most monsters are of this type. Reach {game.run.goalRate}% over at least 8 answers ({game.focus.tally.good} good / {game.focus.tally.bad} bad for now)
        and the training moves to your next weakness. It will come back later, to check you still know it.
      </span>

      <span className="section">Quests</span>
      {quests.length === 0 && <span className="small">No quest. People with a ! above their head need help.</span>}
      {quests.map((quest) => {
        const progress = questProgress(game, quest);
        return (
          <div key={quest.id} className="line" style={styles.column}>
            <span>
              {quest.title} <span className="gold">({progress.have}/{progress.need})</span>
            </span>
            <span className="small">
              {npcOf(quest.giver).name}: “{quest.ask}” · reward {quest.lexis} Lexis
            </span>
          </div>
        );
      })}

      <span className="section">Lexia</span>
      <span>Happiness {game.happiness} / 100</span>
      <Bar value={game.happiness / 100} color="#ffd23f" height={8} />
      <span className="small">Helping people makes the village happier: better prices, faster friendships. Deaths make it sadder.</span>
      <span className="small" style={styles.raid}>
        {game.bosses.king ? 'The north is silent no more. No raid will come.' : 'Next raid: in ' + daysBeforeRaid(game) + ' day(s), at nightfall. Raids survived: ' + game.raid.count}
      </span>

      <span className="section">People you know</span>
      {met.length === 0 && <span className="small">Nobody yet. Go and talk!</span>}
      {met.map((npc) => (
        <PersonLine key={npc.id} game={game} npc={npc} />
      ))}
    </>
  );
}

const styles = {
  column: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 3,
  },
  raid: {
    marginTop: 6,
    color: '#ff9aa6',
  },
  dead: {
    color: '#8a84a8',
  },
};
