import Bar from '../Bar';
import Portrait from '../Portrait';
import { NPCS } from '../../data/npcs';
import { classOfMaster } from '../../data/classes';
import { relationOf, bondsOf, BOND_NAMES } from '../../logic/village';
import { FRIEND_STEPS } from '../../logic/people';
import { isCouple, isTrainable, isStationedInTraining, companionRank } from '../../logic/bonds';
import { companionFatigue } from '../../logic/camp';
import { isNpcKidnapped } from '../../logic/war';

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

function PersonLine({ game, npc }) {
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
        {storiesLeft > 0 && state.alive && (
          <span className="small">
            {storiesLeft} part(s) of their story left (next at {FRIEND_STEPS[state.told]} friendship)
          </span>
        )}
        {giftsText(npc) && <span className="small">{giftsText(npc)}</span>}
        {bondsText(npc) && <span className="small gold">{bondsText(npc)}</span>}
      </div>
    </div>
  );
}

// The relations of the hero: everyone met, the closest first. And how the people are bound to each other.
export default function PeoplePanel({ game }) {
  const met = NPCS.filter((npc) => hasMet(game, npc)).sort((a, b) => game.npcs[b.id].friendship - game.npcs[a.id].friendship);
  return (
    <>
      <span className="small">
        Met {met.length} / {NPCS.length} people. Talk every day, help them, give them what they like. A gift also pleases
        their friends and family... and makes their rivals a bit jealous.
      </span>
      {met.length === 0 && <span className="small">Nobody yet: go and talk to the people of Eldermoor!</span>}
      {met.map((npc) => (
        <PersonLine key={npc.id} game={game} npc={npc} />
      ))}
    </>
  );
}
