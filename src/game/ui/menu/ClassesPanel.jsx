import Portrait from '../Portrait';
import PixelIcon from '../PixelIcon';
import { CLASSES, CLASS_RANKS } from '../../data/classes';
import { npcOf } from '../../data/npcs';
import { typeOf } from '../../data/types';
import { TAG_NAMES, TAG_COLORS, tagOf } from '../../logic/skills';
import { heroClass, isSkillTrained, canLearnClass, rankOfClass } from '../../logic/classes';

// One skill of a class: its icon, its tag, and a ✓ when it is trained enough to start the class.
function ClassSkill({ game, categoryId }) {
  const tag = tagOf(game, categoryId);
  return (
    <span className="row small" style={styles.skill}>
      <PixelIcon name={categoryId} size={14} />
      {typeOf(categoryId).short}
      <span style={{ color: TAG_COLORS[tag] }}>{TAG_NAMES[tag]}</span>
      {isSkillTrained(game, categoryId) ? '✓' : ''}
    </span>
  );
}

// What the hero can do with a class right now.
function statusOf(game, item) {
  if (game.player.classId === item.id) return { text: 'Your class', color: '#ffd23f' };
  if (canLearnClass(game, item)) return { text: 'Ready: ask ' + npcOf(item.master).name, color: '#7cfc9a' };
  return { text: 'Train its skills', color: '#9aa6b8' };
}

function ClassLine({ game, item }) {
  const master = npcOf(item.master);
  const status = statusOf(game, item);
  return (
    <div className="line">
      <Portrait look={master.look} size={40} />
      <div className="grow">
        <span>
          {item.name} <span className="small">· {master.name}</span>
        </span>
        <span className="small">{item.text}</span>
        <div className="row" style={styles.skills}>
          {item.skills.map((id) => (
            <ClassSkill key={id} game={game} categoryId={id} />
          ))}
        </div>
      </div>
      <div style={styles.status}>
        <span className="small" style={{ color: status.color }}>
          {status.text}
        </span>
        {game.player.classId === item.id && <span className="small">{CLASS_RANKS[rankOfClass(game, item)]}</span>}
      </div>
    </div>
  );
}

// The classes: the one of the hero, and how to get the others.
export default function ClassesPanel({ game }) {
  const current = heroClass(game);
  return (
    <>
      <span className="section">{current ? current.title : 'No class yet'}</span>
      <span className="small">
        To get a class: train its two skills (10 Normal answers each, 60% good: the Arcane School gives lessons), become
        an acquaintance of its master, and ask them. The class has the rank of its weakest skill: Novice (Normal), Adept
        (Hard), Master (Extreme). It evolves when its skills evolve.
      </span>
      <span className="section">All the classes</span>
      {CLASSES.map((item) => (
        <ClassLine key={item.id} game={game} item={item} />
      ))}
    </>
  );
}

const styles = {
  skills: {
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  skill: {
    gap: 4,
  },
  status: {
    alignItems: 'flex-end',
    flexShrink: 0,
    maxWidth: 110,
    textAlign: 'right',
  },
};
