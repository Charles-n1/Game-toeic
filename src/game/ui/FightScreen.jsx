import { useEffect, useState } from 'react';
import Bar from './Bar';
import Window from './Window';
import PixelIcon from './PixelIcon';
import StatusPanel from './StatusPanel';
import Passage from '../../components/Passage';
import { playSound } from '../../sounds';
import { TYPES, typeOf, weaknessOf } from '../data/types';
import { ITEMS } from '../data/items';
import { answer, nextRound, endFight, flee, xpOfFight, SPELL_MANA } from '../logic/fight';
import { spellRank } from '../logic/learning';
import { usePotion, countItem } from '../logic/player';
import { burst, floatText } from '../logic/particles';
import { battlePlaces } from '../draw/battle';

const AUTO_NEXT = 1100; // milliseconds: after a GOOD answer, the next question comes by itself
const POTIONS = ['healthPotion', 'bread', 'manaPotion', 'speedPotion'];

// One sentence that tells what the last answer did.
function storyOf(last) {
  if (last.fleeFailed) return { good: false, text: 'You could not escape! −' + last.taken + ' HP' };
  if (last.isCorrect && last.taken === 0) return { good: true, text: (last.critical ? 'CRITICAL! ' : '') + (last.first ? 'You struck first! ' : 'Correct! ') + last.damage + ' damage' };
  if (last.isCorrect) return { good: true, text: 'Correct, but slow: it struck too. −' + last.taken + ' HP' };
  const why = last.index === null ? 'Too slow!' : 'Wrong.';
  return { good: false, text: last.taken > 0 ? why + ' −' + last.taken + ' HP' : why };
}

// The sparks, the numbers, the shaking and the sounds of an answer.
function celebrate(game, last, color) {
  const places = battlePlaces(game);
  if (last.damage > 0) {
    burst(game, places.foe.x, places.foe.y - 0.8, color, last.critical ? 36 : 16);
    floatText(game, places.foe.x + 0.6, places.foe.y - 0.6, String(last.damage), last.critical ? '#ffd23f' : '#ffffff');
  }
  if (last.taken > 0) {
    burst(game, places.hero.x, places.hero.y - 0.8, '#ff5a6e', 12);
    floatText(game, places.hero.x - 0.6, places.hero.y - 0.6, '−' + last.taken, '#ff8a95');
    game.run.shakeUntil = Date.now() + 250;
  }
  if (last.critical) game.run.flashUntil = Date.now() + 90;
  playSound(last.isCorrect ? 'success' : 'wrong');
}

// How an answer button looks once the question is answered.
function answerClass(fight, index) {
  if (fight.phase === 'ask') return 'answer';
  if (index === fight.question.correct_index) return 'answer answer-good';
  return fight.last && index === fight.last.index ? 'answer answer-bad' : 'answer answer-closed';
}

// The menu on the left: how the next good answer will strike.
function Commands({ game, fight, refresh, onFlee }) {
  const [list, setList] = useState('main'); // 'main' | 'magic' | 'item'
  const player = game.player;
  const spells = TYPES.filter((type) => spellRank(game, type.id) > 0);
  const potions = POTIONS.filter((id) => countItem(player, id) > 0);
  const weakness = weaknessOf(fight.opponent.category);

  function choose(mode) {
    fight.mode = mode;
    setList('main');
    refresh();
  }

  function drink(itemId) {
    usePotion(game, itemId);
    setList('main');
    refresh();
  }

  if (list === 'magic') {
    return (
      <div className="window commands">
        <button className="menu-item" onClick={() => setList('main')}>
          ◀
        </button>
        {spells.length === 0 && <span className="small">No spell yet: reach 20% in a type.</span>}
        {spells.map((type) => (
          <button key={type.id} className="menu-item" disabled={player.mana < SPELL_MANA} onClick={() => choose(type.id)}>
            <PixelIcon name={type.id} size={14} />
            <span style={styles.spell}>
              {type.short} {type.id === weakness ? '×2' : ''}
            </span>
          </button>
        ))}
      </div>
    );
  }
  if (list === 'item') {
    return (
      <div className="window commands">
        <button className="menu-item" onClick={() => setList('main')}>
          ◀
        </button>
        {potions.length === 0 && <span className="small">No potion.</span>}
        {potions.map((id) => (
          <button key={id} className="menu-item" onClick={() => drink(id)}>
            <PixelIcon name={id} size={14} />
            <span>×{countItem(player, id)}</span>
          </button>
        ))}
      </div>
    );
  }
  const magicLabel = fight.mode === 'strike' ? 'Magic' : typeOf(fight.mode).short;
  return (
    <div className="window commands">
      <button className={'menu-item' + (fight.mode === 'strike' ? ' selected' : '')} onClick={() => choose('strike')}>
        Attack
      </button>
      <button className={'menu-item' + (fight.mode !== 'strike' ? ' selected' : '')} onClick={() => setList('magic')}>
        {magicLabel}
      </button>
      <button className="menu-item" onClick={() => setList('item')}>
        Item
      </button>
      {!fight.opponent.boss && (
        <button className="menu-item" onClick={onFlee}>
          {fight.opponent.duel ? 'Give up' : 'Flee'}
        </button>
      )}
    </div>
  );
}

// The end of a fight: what was won or lost.
function Ending({ fight, onContinue }) {
  const opponent = fight.opponent;
  const percent = fight.asked === 0 ? 0 : Math.round((fight.correct / fight.asked) * 100);
  const isWon = fight.phase === 'won';
  const title = fight.phase === 'fled' ? 'ESCAPED' : isWon ? 'VICTORY!' : opponent.duel ? 'LOST...' : 'DEFEAT...';
  return (
    <Window gold>
      <span className="big-title">{title}</span>
      <span style={styles.center}>
        {fight.correct} / {fight.asked} correct answers ({percent}%)
      </span>
      {isWon && !opponent.duel && (
        <span className="gold" style={styles.center}>
          +{xpOfFight(fight)} XP ({percent}% of {opponent.xp}) · +{opponent.lexis} Lexis
        </span>
      )}
      <button className="px-button px-gold" style={styles.next} onClick={onContinue}>
        Continue
      </button>
    </Window>
  );
}

// The question, its clock, its four answers. After the answer: what happened, and why.
function QuestionWindow({ fight, onAnswer, onNext }) {
  const question = fight.question;
  const isAsking = fight.phase === 'ask';
  const timeLeft = isAsking ? 1 - (Date.now() - fight.startedAt) / fight.limit : 0;
  const story = fight.last && !isAsking ? storyOf(fight.last) : null;
  const isLong = question.answers.some((label) => label.length > 22); // long answers: one per line
  return (
    <div className="window grow">
      <Bar value={timeLeft} color={timeLeft > 0.5 ? '#7cfc9a' : timeLeft > 0.25 ? '#ffd23f' : '#ff5a6e'} height={8} />
      <span className="question" style={styles.question}>
        {question.question}
      </span>
      <div className={'answers' + (isLong ? ' answers-long' : '')}>
        {question.answers.map((label, index) => (
          <button key={index} className={answerClass(fight, index)} disabled={!isAsking} onClick={() => onAnswer(index)}>
            {label}
          </button>
        ))}
      </div>
      {story && (
        <div style={styles.result}>
          <span className={story.good ? 'result-good' : 'result-bad'}>{story.text}</span>
          <span style={styles.why}>{question.justification}</span>
          <button className="px-button px-gold" style={styles.next} onClick={onNext}>
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

// The fight: the hero and the opponent face to face on the map (see draw/battle.js), the questions below.
// Answer right and fast to strike first.
export default function FightScreen({ game, refresh }) {
  const fight = game.run.fight;
  const opponent = fight.opponent;
  const type = typeOf(opponent.category);
  const [, setTick] = useState(0);

  useEffect(startClock, []);

  // 10 times per second: the clock bar moves, and the time may run out.
  function startClock() {
    const timer = setInterval(tick, 100);
    window.addEventListener('keydown', pressKey);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', pressKey);
    };
  }

  function tick() {
    const current = game.run.fight;
    if (current && current.phase === 'ask' && Date.now() - current.startedAt >= current.limit) submit(null);
    setTick((count) => count + 1);
  }

  // Keyboard: 1 2 3 4 to answer, Enter to continue.
  function pressKey(event) {
    if (['1', '2', '3', '4'].includes(event.key)) submit(Number(event.key) - 1);
    if (event.key === 'Enter') goOn();
  }

  // index: the answer picked (null = too late).
  function submit(index) {
    const current = game.run.fight;
    if (!current || current.phase !== 'ask') return;
    answer(game, current, index);
    const last = current.last;
    celebrate(game, last, typeOf(current.opponent.category).color);
    if (current.phase === 'won') playSound('victory');
    if (current.phase === 'lost') playSound('loose1');
    if (current.phase === 'result' && last.isCorrect) setTimeout(() => autoNext(current, last), AUTO_NEXT);
    refresh();
  }

  // Only if the player did not already tap "Next" meanwhile.
  function autoNext(current, last) {
    if (game.run.fight === current && current.phase === 'result' && current.last === last) goOn();
  }

  // "Next" after a result, "Continue" at the end.
  function goOn() {
    const current = game.run.fight;
    if (!current || current.phase === 'ask') return;
    if (current.phase === 'result') nextRound(game);
    else endFight(game);
    refresh();
  }

  function runAway() {
    if (opponent.duel) fight.phase = 'lost';
    else flee(game, fight);
    if (fight.last && fight.last.fleeFailed) celebrate(game, fight.last, type.color);
    refresh();
  }

  const isOver = ['won', 'lost', 'fled'].includes(fight.phase);
  const title = opponent.duel ? opponent.title + ' with ' + opponent.name : 'Defeat ' + opponent.name + '!';

  return (
    <div className="hud">
      <div style={styles.top}>
        <StatusPanel game={game} />
        <div className="window" style={styles.foe}>
          <span>
            <span className="gold">◆</span> {title}
          </span>
          <div className="row" style={styles.chips}>
            <div className="chip" style={{ backgroundColor: type.color }}>
              <PixelIcon name={type.id} size={14} />
              <span>{type.name}</span>
            </div>
            {opponent.duel ? (
              <span className="small">mistakes {fight.asked - fight.correct} / 3</span>
            ) : (
              <div className="row small" style={styles.weak}>
                <span>weak to</span>
                <PixelIcon name={weaknessOf(opponent.category)} size={14} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fight-panel" style={styles.panel}>
        {isOver && <Ending fight={fight} onContinue={goOn} />}
        {!isOver && fight.question.text && (
          <div className="window" style={styles.passage}>
            <Passage key={fight.question.text} text={fight.question.text} />
          </div>
        )}
        {!isOver && (
          <div className="row" style={styles.bottom}>
            {fight.phase === 'ask' && <Commands game={game} fight={fight} refresh={refresh} onFlee={runAway} />}
            <QuestionWindow fight={fight} onAnswer={submit} onNext={goOn} />
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  top: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    gap: 8,
  },
  foe: {
    alignSelf: 'flex-start',
    padding: '6px 10px',
    fontSize: 16,
  },
  chips: {
    gap: 8,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  weak: {
    gap: 4,
  },
  panel: {
    pointerEvents: 'auto',
  },
  passage: {
    maxHeight: '26vh',
    overflowY: 'auto',
    color: '#14101e',
  },
  bottom: {
    alignItems: 'stretch',
    gap: 6,
  },
  spell: {
    fontSize: 14,
  },
  question: {
    marginTop: 8,
  },
  result: {
    marginTop: 10,
    gap: 6,
  },
  why: {
    fontSize: 15,
    lineHeight: '20px',
    color: '#d6dcf5',
  },
  next: {
    marginTop: 8,
  },
  center: {
    textAlign: 'center',
    marginTop: 6,
  },
};
