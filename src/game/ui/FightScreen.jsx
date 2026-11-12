import { useEffect, useRef, useState } from 'react';
import Hearts from './Hearts';
import Bar from './Bar';
import FightArena, { ARENA_UNIT } from './FightArena';
import Passage from '../../components/Passage';
import { playSound } from '../../sounds';
import { TYPES, typeOf, weaknessOf } from '../data/types';
import { ITEMS } from '../data/items';
import { answer, nextRound, endFight, flee, xpOfFight, SPELL_MANA } from '../logic/fight';
import { spellRank } from '../logic/learning';
import { maxHealth, maxMana, usePotion, countItem } from '../logic/player';
import { burst, floatText } from '../logic/particles';

const AUTO_NEXT = 1100; // milliseconds: after a GOOD answer, the next question comes by itself
const POTIONS = ['healthPotion', 'bread', 'manaPotion', 'speedPotion'];

// 3 half hearts -> "1.5 ❤"
function hearts(halves) {
  return halves / 2 + ' ❤';
}

// One sentence that tells what the last answer did.
function storyOf(last) {
  if (last.fleeFailed) return { good: false, text: 'You could not escape! −' + hearts(last.taken) };
  if (last.isCorrect && last.taken === 0) return { good: true, text: (last.critical ? '💥 CRITICAL! ' : '') + (last.first ? '⚡ You struck first! ' : '✔ Correct! ') + '−' + hearts(last.damage) };
  if (last.isCorrect) return { good: true, text: '✔ Correct, but slow: it struck too. −' + hearts(last.taken) + ' for you' };
  const why = last.index === null ? '⏰ Too slow!' : '✘ Wrong.';
  return { good: false, text: last.taken > 0 ? why + ' −' + hearts(last.taken) + ' for you' : why };
}

// The sparks and the sounds of an answer. The arena is 2 fighters: the hero at 26% of the width, the opponent at 74%.
function celebrate(effects, last, color, width) {
  const heroX = (width * 0.26) / ARENA_UNIT;
  const opponentX = (width * 0.74) / ARENA_UNIT;
  if (last.damage > 0) {
    burst(effects, opponentX, 4, color, last.critical ? 40 : 18);
    floatText(effects, opponentX, 3, '−' + hearts(last.damage), last.critical ? '#ffd23f' : '#ffffff');
  }
  if (last.taken > 0) {
    burst(effects, heroX, 4, '#ff5a6e', 14);
    floatText(effects, heroX, 3, '−' + hearts(last.taken), '#ff8080');
  }
  playSound(last.isCorrect ? 'success' : 'wrong');
}

function AnswerButton({ index, label, state, onPick }) {
  const className = 'answer ' + (state === 'good' ? 'answer-good' : state === 'bad' ? 'answer-bad' : '');
  return (
    <button className={className} disabled={state !== 'open'} onClick={() => onPick(index)}>
      <div className="answer-key">
        <span>{index + 1}</span>
      </div>
      <span className="grow">{label}</span>
    </button>
  );
}

// How an answer button looks once the question is answered.
function answerState(fight, index) {
  if (fight.phase === 'ask') return 'open';
  if (index === fight.question.correct_index) return 'good';
  return fight.last && index === fight.last.index ? 'bad' : 'closed';
}

// The row to choose how to strike: the weapon, or a grammar spell (they cost mana).
function SpellPicker({ game, fight, onPick }) {
  const known = TYPES.filter((type) => spellRank(game, type.id) > 0);
  const weakness = weaknessOf(fight.opponent.category);
  if (known.length === 0) return <span className="small">No spell yet: reach 20% in a category to unlock its spell.</span>;
  return (
    <div className="row wrap">
      {known.map((type) => (
        <button
          key={type.id}
          className="chip"
          style={{ ...styles.spell, backgroundColor: type.color, opacity: fight.mode === type.id ? 1 : 0.6 }}
          disabled={game.player.mana < SPELL_MANA}
          onClick={() => onPick(type.id)}
        >
          {type.icon} {type.spell} {1 + spellRank(game, type.id)}
          {type.id === weakness ? ' ×2' : ''}
        </button>
      ))}
    </div>
  );
}

// The end of a fight: what was won or lost.
function Ending({ fight, onContinue }) {
  const opponent = fight.opponent;
  const percent = fight.asked === 0 ? 0 : Math.round((fight.correct / fight.asked) * 100);
  const isWon = fight.phase === 'won';
  const title = fight.phase === 'fled' ? 'You escaped' : isWon ? (opponent.duel ? 'You won!' : opponent.name + ' is defeated!') : opponent.duel ? 'You lost...' : 'You fall...';
  return (
    <div className="panel" style={styles.ending}>
      <span className="big-emoji">{fight.phase === 'fled' ? '🏃' : isWon ? '🏆' : '💫'}</span>
      <span className="title" style={styles.center}>
        {title}
      </span>
      <span style={styles.center}>
        {fight.correct} / {fight.asked} correct ({percent}%)
      </span>
      {isWon && !opponent.duel && (
        <span className="result-good" style={styles.center}>
          +{xpOfFight(fight)} XP ({percent}% of {opponent.xp}) · +{opponent.lexis} Lexis
        </span>
      )}
      <button className="btn btn-gold" style={styles.next} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

// The fight: a question, a clock, four answers. Answer right and fast to strike first.
export default function FightScreen({ game, refresh }) {
  const fight = game.run.fight;
  const opponent = fight.opponent;
  const player = game.player;
  const question = fight.question;
  const type = typeOf(opponent.category);
  const effects = useRef({ run: { particles: [] } }).current;
  const boxRef = useRef(null);
  const [showSpells, setShowSpells] = useState(false);
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
    celebrate(effects, last, typeOf(current.opponent.category).color, boxRef.current.clientWidth);
    if (current.phase === 'won') playSound('victory');
    if (current.phase === 'lost') playSound('loose1');
    if (current.phase === 'result' && last.isCorrect) setTimeout(() => autoNext(current, last), AUTO_NEXT);
    setShowSpells(false);
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

  function pickSpell(typeId) {
    fight.mode = fight.mode === typeId ? 'strike' : typeId;
    refresh();
  }

  function drink(itemId) {
    usePotion(game, itemId);
    refresh();
  }

  function runAway() {
    if (opponent.duel) fight.phase = 'lost';
    else flee(game, fight);
    if (fight.last && fight.last.fleeFailed) celebrate(effects, fight.last, type.color, boxRef.current.clientWidth);
    refresh();
  }

  const isAsking = fight.phase === 'ask';
  const isOver = ['won', 'lost', 'fled'].includes(fight.phase);
  const timeLeft = isAsking ? 1 - (Date.now() - fight.startedAt) / fight.limit : 0;
  const story = fight.last && !isAsking ? storyOf(fight.last) : null;
  const isHurt = fight.last && fight.last.taken > 0 && Date.now() - fight.last.at < 400;
  const potions = POTIONS.filter((id) => countItem(player, id) > 0);

  return (
    <div className="fight" ref={boxRef}>
      {/* The opponent */}
      <div className="row between" style={styles.header}>
        <div className="grow">
          <span style={styles.name}>{opponent.duel ? opponent.title + ' · ' + opponent.name : opponent.name}</span>
          <div className="row" style={styles.gap}>
            <div className="chip" style={{ backgroundColor: type.color }}>
              <span>
                {type.icon} {type.name}
              </span>
            </div>
            {!opponent.duel && <span className="small" style={styles.weak}>weak to {typeOf(weaknessOf(opponent.category)).icon} spells</span>}
          </div>
        </div>
        {opponent.duel ? <span className="small">mistakes {fight.asked - fight.correct} / 3</span> : <Hearts value={opponent.health} max={opponent.maxHealth} size={16} />}
      </div>

      <div className={isHurt ? 'shake' : ''}>
        <FightArena game={game} fight={fight} effects={effects} />
      </div>

      {/* The hero */}
      <div style={styles.hero}>
        <div className="row between">
          <Hearts value={player.health} max={maxHealth(player)} size={16} />
          <span className="small">
            🔮 {player.mana}/{maxMana(player)}
          </span>
        </div>
        <div style={styles.gap}>
          <Bar value={timeLeft} color={timeLeft > 0.5 ? '#7cfc9a' : timeLeft > 0.25 ? '#ffd23f' : '#ff5a6e'} height={10} />
        </div>
      </div>

      {/* The question */}
      <div className="grow" style={styles.body}>
        {isOver && <Ending fight={fight} onContinue={goOn} />}
        {!isOver && (
          <>
            {question.text && <Passage key={question.text} text={question.text} />}
            <span className="question">{question.question}</span>
            {question.answers.map((label, index) => (
              <AnswerButton key={index} index={index} label={label} state={answerState(fight, index)} onPick={submit} />
            ))}
            {story && (
              <div style={styles.result}>
                <span className={story.good ? 'result-good' : 'result-bad'}>{story.text}</span>
                <span style={styles.why}>{question.justification}</span>
                <button className="btn btn-gold" style={styles.next} onClick={goOn}>
                  Next ▸
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* How to strike */}
      {isAsking && (
        <div style={styles.actions}>
          {showSpells && <SpellPicker game={game} fight={fight} onPick={pickSpell} />}
          <div className="row wrap" style={styles.gap}>
            <button className="btn" style={styles.action} onClick={() => setShowSpells(!showSpells)}>
              {fight.mode === 'strike' ? '⚔️ Strike' : typeOf(fight.mode).icon + ' Spell'} ▾
            </button>
            {potions.map((id) => (
              <button key={id} className="btn" style={styles.action} onClick={() => drink(id)}>
                {ITEMS[id].icon} {countItem(player, id)}
              </button>
            ))}
            {!opponent.boss && (
              <button className="btn" style={styles.action} onClick={runAway}>
                {opponent.duel ? '🏳️ Give up' : '🏃 Flee'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    padding: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  gap: {
    marginTop: 6,
  },
  weak: {
    marginLeft: 8,
  },
  hero: {
    padding: '8px 12px',
  },
  body: {
    padding: '4px 12px 12px',
    overflowY: 'auto',
  },
  result: {
    marginTop: 12,
  },
  why: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: '20px',
    color: '#d9d2ff',
  },
  next: {
    marginTop: 12,
  },
  actions: {
    padding: '0 12px 12px',
  },
  action: {
    marginRight: 6,
    marginBottom: 6,
    padding: '8px 10px',
  },
  spell: {
    marginRight: 6,
    marginBottom: 6,
    padding: '6px 8px',
  },
  ending: {
    marginTop: 20,
    alignItems: 'stretch',
  },
  center: {
    textAlign: 'center',
    marginTop: 6,
  },
};
