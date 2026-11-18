import Bar from '../Bar';
import Portrait from '../Portrait';
import PixelIcon from '../PixelIcon';
import { NPCS } from '../../data/npcs';
import { classOfMaster } from '../../data/classes';
import { relationOf, bondsOf, BOND_NAMES } from '../../logic/village';
import { FRIEND_STEPS } from '../../logic/people';
import { isCouple, isTrainable, isStationedInTraining, companionRank } from '../../logic/bonds';
import { companionFatigue } from '../../logic/camp';
import { isNpcKidnapped } from '../../logic/war';
import { COMPANION_ARCS } from '../../data/isekaiTodo';
import { companionArcStatus, advanceCompanionArc, deliveredLettersList, readPart6Letter, refreshDailyLetters } from '../../logic/isekaiTodo/socialPlus';

// Has the hero met this person? (Talked once, or made them like the hero.)
function hasMet(game, npc) {
  const state = game.npcs[npc.id];
  return state.met || state.talkedDay > 0 || state.friendship > 0 || game.player.spouse === npc.id;
}

// "Selene (teacher) · Elara (friend)": the people this person is close to.
function bondsText(npc) {
  return bondsOf(npc.id)
    .map((bond) => bond.npc.name + ' (' + BOND_NAMES[bond.kind] + ')')
    .join(' · ');
}

// What a person can bring to the hero: a class, a romance, a sword at their side...
function giftsText(npc) {
  const item = classOfMaster(npc.id);
  return [item && 'teaches the ' + item.name + ' class', npc.school && 'lessons at the Arcane School', npc.fighter && 'can fight with you', npc.romance && 'romance'].filter(Boolean).join(' · ');
}

function PersonLine({ game, npc, refresh, onClose }) {
  const state = game.npcs[npc.id];
  const relation = relationOf(game, npc.id);
  const storiesLeft = npc.life.length - state.told;
  const spouse = game.player.spouse === npc.id;
  const couple = isCouple(game, npc.id);
  const kidnapped = isNpcKidnapped(game, npc.id);
  const trainable = isTrainable(npc);
  const rank = trainable ? companionRank(game, npc.id) : 0;
  const stationed = isStationedInTraining(game, npc.id);
  const fatigue = Math.round(companionFatigue(game, npc.id));
  const arcInfo = COMPANION_ARCS[npc.id] ? companionArcStatus(game, npc.id) : null;

  return (
    <div className="line" style={{ opacity: state.alive ? 1 : 0.45 }}>
      <Portrait look={npc.look} size={40} />
      <div className="grow">
        <span>
          {npc.name} <span className="small">· {npc.role}</span>{' '}
          {spouse && <span className="small gold">💍 Spouse</span>}
          {!spouse && couple && <span className="small" style={{ color: '#ff9ec4' }}>💕 Couple</span>}
          {kidnapped && <span className="small" style={{ color: '#ff5a6e' }}>🚨 Kidnapped!</span>}
        </span>
        <span className="small" style={{ color: relation.color }}>
          {state.alive ? relation.name : 'Dead'} · {state.friendship} / 100
        </span>
        <Bar value={state.friendship / 100} color={relation.color} height={5} />
        {trainable && state.alive && (
          <span className="small">
            🥋 Rank {rank}/4{stationed ? ' · At Training Corner' : ''}
            {fatigue > 0 ? ' · Fatigue ' + fatigue + '%' : ''}
          </span>
        )}
        {arcInfo && state.alive && (
          <span className="small" style={{ color: arcInfo.completed ? '#7cfc9a' : '#d8b4f8' }}>
            {arcInfo.completed
              ? `★ Personal Quest Complete (${arcInfo.arc.ultimateName})`
              : `📖 ${arcInfo.arc.title} (${arcInfo.stageIdx + 1}/3): ${arcInfo.currentStage?.goal || ''}`}
          </span>
        )}
        {storiesLeft > 0 && state.alive && (
          <span className="small">
            {storiesLeft} part(s) of their story left (next at {FRIEND_STEPS[state.told]} friendship)
          </span>
        )}
        {giftsText(npc) && <span className="small">{giftsText(npc)}</span>}
        {bondsText(npc) && <span className="small gold">{bondsText(npc)}</span>}
      </div>
      {arcInfo && !arcInfo.completed && state.alive && (
        <button
          className="px-button px-gold"
          disabled={!arcInfo.canAdvance}
          onClick={() => {
            onClose();
            advanceCompanionArc(game, npc.id);
            refresh();
          }}
        >
          Story
        </button>
      )}
    </div>
  );
}

// The relations of the hero, personal companion quests, and Part 6 Letters inbox.
export default function PeoplePanel({ game, refresh, onClose }) {
  refreshDailyLetters(game);
  const letters = deliveredLettersList(game);
  const met = NPCS.filter((npc) => hasMet(game, npc)).sort((a, b) => game.npcs[b.id].friendship - game.npcs[a.id].friendship);
  return (
    <>
      <span className="small">
        Met {met.length} / {NPCS.length} people. Talk every day, help them, give them what they like. A gift also pleases
        their friends and family... and makes their rivals a bit jealous.
      </span>

      <span className="section">Mailbox &amp; Letters ({letters.filter((l) => !l.read).length} unread)</span>
      {letters.length === 0 && <span className="small">No letters yet. Check the Letterbox by your house each morning!</span>}
      {letters.map((mail) => (
        <div key={mail.id} className="line">
          <PixelIcon name="mail" size={24} />
          <div className="grow">
            <span>
              <strong className={mail.read ? '' : 'gold'}>{mail.subject}</strong>{' '}
              <span className="small">from {mail.sender}</span>
            </span>
            <span className="small">{mail.replied ? '✓ Replied' : 'Unread / Awaiting English reply'}</span>
          </div>
          <button
            className="px-button px-gold"
            onClick={() => {
              onClose();
              readPart6Letter(game, mail.id);
              refresh();
            }}
          >
            {mail.replied ? 'Reread' : 'Reply'}
          </button>
        </div>
      ))}

      <span className="section">Known People &amp; Personal Quests</span>
      {met.length === 0 && <span className="small">Nobody yet: go and talk to the people of Eldermoor!</span>}
      {met.map((npc) => (
        <PersonLine key={npc.id} game={game} npc={npc} refresh={refresh} onClose={onClose} />
      ))}
    </>
  );
}
