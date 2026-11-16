import { useEffect, useState } from 'react';
import Bar from './Bar';
import Window from './Window';
import PixelIcon from './PixelIcon';
import StatusPanel from './StatusPanel';
import useScreen from './useScreen';
import Passage from '../../components/Passage';
import { playEffect } from '../audio/effects';
import { TYPES, typeOf, weaknessOf } from '../data/types';
import { ITEMS } from '../data/items';
import { answer, nextRound, endFight, flee, xpOfFight, castSpell, totalOf, SPELL_MANA } from '../logic/fight';
import { TAGS, TAG_NAMES, TAG_COLORS, TAG_POWER, spellLevel } from '../logic/skills';
import { usePotion, canUsePotion, countItem } from '../logic/player';
import { burst, floatText } from '../logic/particles';
import { battlePlaces, hitMoments } from '../draw/battle';

const AUTO_NEXT = 1100; // milliseconds: after a GOOD answer, the next question comes by itself
const POTIONS = ['healthPotion', 'bigPotion', 'bread', 'roastMeat', 'herbStew', 'manaPotion', 'speedPotion', 'timePotion', 'hintPotion'];
const ANSWER_KEYS = ['1', '2', '3', '4', 'a', 'b', 'c', 'd']; // 1 = a, 2 = b...

// One sentence that tells what the last answer did.
function storyOf(last) {
  const sHit = last.soldierDamage > 0 ? ' · ⚔️ Soldier +' + last.soldierDamage + ' dmg' : '';
  const sShield = last.soldierTaken > 0 ? ' (🛡️ Soldier blocked ' + last.soldierTaken + ')' : '';
  if (last.fleeFailed) return { good: false, text: 'You could not escape!' + (last.taken > 0 ? ' −' + last.taken + ' HP' : '') + sShield };
  const flair = last.special ? '★ ' + last.special + '! ' : '';
  if (last.isCorrect && last.taken === 0) {
    return { good: true, text: flair + (last.critical ? 'CRITICAL! ' : '') + (last.first ? 'You struck first! ' : 'Correct! ') + last.damage + ' damage' + sHit + sShield };
  }
  if (last.isCorrect) return { good: true, text: flair + 'Correct, but slow: it struck too. −' + last.taken + ' HP' + sHit + sShield };
  const why = last.index === null ? 'Too slow!' : 'Wrong.';
  return { good: false, text: (last.taken > 0 ? why + ' −' + last.taken + ' HP' : why) + sHit + sShield };
}

// The sparks, the number and the flash on the opponent, when the hero's blow lands.
function hitFoe(game, places, last, color, combo) {
  burst(game, places.foe.x, places.foe.y - 0.8, color, last.critical || last.special ? 36 : 16);
  if (last.damage > 0) floatText(game, places.foe.x + 0.6, places.foe.y - 0.6, String(last.damage), last.critical ? '#ffd23f' : '#ffffff');
  if (last.soldierDamage > 0) floatText(game, places.foe.x - 0.3, places.foe.y - 1.1, '⚔️ ' + last.soldierDamage, '#c9a8ff');
  if (last.special) floatText(game, places.foe.x, places.foe.y - 1.5, '★ ' + last.special + '!', '#ffd23f');
  if (combo >= 2) floatText(game, places.foe.x, places.foe.y - 2.2, 'COMBO x' + combo, '#7cfc9a');
  if (last.critical || last.special) game.run.flashUntil = Date.now() + 90;
}

// The sparks, the number, the shaking and the sound on the hero, when the opponent's blow lands.
function hitHero(game, places, last) {
  burst(game, places.hero.x, places.hero.y - 0.8, '#ff5a6e', 12);
  floatText(game, places.hero.x - 0.6, places.hero.y - 0.6, '−' + last.taken, '#ff8a95');
  game.run.shakeUntil = Date.now() + 250;
  playEffect('hit');
}

// The sound of the answer at once, then each blow when it lands (see the time line in draw/battle.js).
function celebrate(game, last, color, combo) {
  const places = battlePlaces(game);
  const moments = hitMoments(last);
  playEffect(last.critical ? 'critical' : last.isCorrect ? 'good' : 'wrong');
  if (last.damage > 0 || last.soldierDamage > 0) {
    setTimeout(() => {
      playEffect(last.special ? 'specialBurst' : last.mode !== 'strike' && last.damage > 0 ? 'magicCast' : last.soldierDamage > 0 || game.player.party.length > 0 ? 'companionStrike' : 'slash');
      hitFoe(game, places, last, color, combo);
    }, moments.foe);
  }
  if (last.soldierTaken > 0) {
    setTimeout(() => floatText(game, places.hero.x + 1.0, places.hero.y - 1.1, '🛡️ ' + last.soldierTaken, '#c9a8ff'), moments.hero);
  }
  if (last.taken > 0) setTimeout(() => hitHero(game, places, last), moments.hero);
}

// How an answer button looks once the question is answered.
function answerClass(fight, index) {
  if (fight.phase === 'ask' && fight.hidden.includes(index)) return 'answer answer-closed'; // removed by a hint potion
  if (fight.phase === 'ask') return 'answer';
  if (index === fight.question.correct_index) return 'answer answer-good';
  return fight.last && index === fight.last.index ? 'answer answer-bad' : 'answer answer-closed';
}

// A small colored badge: the tag of a monster or of a question ("Hard ×5").
function TagBadge({ tag }) {
  return (
    <span className="badge" style={{ backgroundColor: TAG_COLORS[tag] }}>
      {TAG_NAMES[tag]}
      {TAG_POWER[tag] > 1 ? ' ×' + TAG_POWER[tag] : ''}
    </span>
  );
}

// The menu on the left: only 4 commands. Fight (the sword), Skills (the spells learned from the researchers:
// a spell changes the question for one of its school, at the level it was learned), Items, Flee.
function Commands({ game, fight, refresh, onFlee }) {
  const [list, setList] = useState('main'); // 'main' | 'skills' | 'items'
  const player = game.player;
  const spells = TYPES.filter((type) => spellLevel(game, type.id) > 0);
  const potions = POTIONS.filter((id) => countItem(player, id) > 0);
  const weakness = weaknessOf(fight.opponent.category);

  function choose(mode) {
    fight.mode = mode;
    setList('main');
    refresh();
  }

  function cast(typeId) {
    castSpell(game, fight, typeId);
    setList('main');
    refresh();
  }

  function drink(itemId) {
    usePotion(game, itemId);
    setList('main');
    refresh();
  }

  if (list === 'skills') {
    return (
      <div className="window commands commands-open">
        <button className="command" onClick={() => setList('main')}>
          ◀ Back
        </button>
        {spells.length === 0 && <span className="small">No skill yet. The researchers teach them (Yuki, Luna, Selene...).</span>}
        {spells.map((type) => {
          const tag = TAGS[spellLevel(game, type.id) - 1];
          return (
            <button key={type.id} className="command" disabled={player.mana < SPELL_MANA} onClick={() => cast(type.id)}>
              <PixelIcon name={type.id} size={14} />
              <span style={styles.spell}>
                {type.short} {type.id === weakness ? '×2' : ''}
              </span>
              <span className="small" style={{ color: TAG_COLORS[tag] }}>
                {TAG_NAMES[tag]}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  if (list === 'items') {
    return (
      <div className="window commands commands-open">
        <button className="command" onClick={() => setList('main')}>
          ◀ Back
        </button>
        {potions.length === 0 && <span className="small">Nothing to use.</span>}
        {potions.map((id) => (
          <button key={id} className="command" disabled={!canUsePotion(game, id)} onClick={() => drink(id)}>
            <PixelIcon name={id} size={14} />
            <span>×{countItem(player, id)}</span>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="window commands">
      <button className={'command command-fight' + (fight.mode === 'strike' ? ' selected' : '')} disabled={fight.spellCast} onClick={() => choose('strike')}>
        <PixelIcon name={player.weapon} size={20} />
        <span>Fight</span>
      </button>
      <button className={'command command-skills' + (fight.mode !== 'strike' ? ' selected' : '')} disabled={fight.spellCast} onClick={() => setList('skills')}>
        <PixelIcon name="powers" size={20} />
        <span>{fight.mode === 'strike' ? 'Skills' : typeOf(fight.mode).short}</span>
      </button>
      <button className="command command-items" onClick={() => setList('items')}>
        <PixelIcon name="inventory" size={20} />
        <span>Items</span>
      </button>
      <button className="command command-flee" disabled={fight.opponent.boss} onClick={onFlee}>
        <PixelIcon name="quit" size={20} />
        <span>{fight.opponent.duel ? 'Give up' : 'Flee'}</span>
      </button>
    </div>
  );
}

// The questions answered wrong, with the right answer and the explanation. They are in the recovery of the app.
function Mistakes({ mistakes }) {
  if (mistakes.length === 0) return null;
  return (
    <div style={styles.mistakes}>
      <span className="section">Mistakes to review</span>
      {mistakes.map((question) => (
        <div key={question.id} className="line" style={styles.mistake}>
          <span>{question.question}</span>
          <span className="result-good">→ {question.answers[question.correct_index]}</span>
          <span className="small">{question.justification}</span>
        </div>
      ))}
      <span className="small">They are in your recovery list: they will come back.</span>
    </div>
  );
}

// The end of a fight: what was won or lost, and the mistakes to review.
function Ending({ game, fight, onContinue }) {
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
          +{xpOfFight(game, fight)} XP ({percent}% of {totalOf(fight, 'xp')}) · +{totalOf(fight, 'lexis')} Lexis
        </span>
      )}
      {fight.bestCombo >= 2 && <span style={styles.center}>Best combo: x{fight.bestCombo}</span>}
      <Mistakes mistakes={fight.mistakes} />
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
  const mood = !story ? 'question-ask' : fight.last.critical ? 'question-critical' : story.good ? 'question-good' : 'question-bad';
  return (
    <div key={question.id + '-' + fight.asked} className={'window grow question-window ' + mood}>
      <Bar value={timeLeft} color={timeLeft > 0.5 ? '#7cfc9a' : timeLeft > 0.25 ? '#ffd23f' : '#ff5a6e'} height={8} />
      <div className="row" style={styles.questionTop}>
        <TagBadge tag={question.difficulty} />
        {fight.combo >= 2 && <span className="result-good" style={styles.combo}>Combo x{fight.combo}</span>}
      </div>
      <span className="question" style={styles.question}>
        {question.question}
      </span>
      <div className={'answers' + (isLong ? ' answers-long' : '')}>
        {question.answers.map((label, index) => (
          <button key={index} className={answerClass(fight, index)} disabled={!isAsking || fight.hidden.includes(index)} onClick={() => onAnswer(index)}>
            <span className="small">{'ABCD'[index]}</span> {label}
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

// In a duo or a trio: who is targeted now, and who is beaten. One good answer per monster finishes a round.
function GroupLine({ fight }) {
  if (fight.opponents.length < 2) return null;
  return (
    <div className="row small" style={styles.group}>
      <span className="gold">Round {fight.round}</span>
      {fight.opponents.map((foe, i) => (
        <span key={i} style={foe.health <= 0 ? styles.beaten : foe === fight.opponent ? styles.target : null}>
          {foe.health <= 0 ? '✖ ' : foe === fight.opponent ? '▶ ' : ''}
          {foe.name}
        </span>
      ))}
    </div>
  );
}

// The title of the fight: "Defeat the Slime!", "Defeat the Slime & the Wolf!", "Practice of Gerunds with...".
function titleOf(fight) {
  const opponent = fight.opponent;
  if (opponent.training) return opponent.title;
  if (opponent.duel) return opponent.title + ' with ' + opponent.name;
  return 'Defeat ' + fight.opponents.map((foe) => foe.name).join(' & ') + '!';
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

  // Keyboard: 1 2 3 4 (or A B C D) to answer, Enter or Space to continue.
  function pressKey(event) {
    const key = event.key.toLowerCase();
    if (ANSWER_KEYS.includes(key)) submit(ANSWER_KEYS.indexOf(key) % 4);
    if (key === 'enter' || key === ' ') goOn();
  }

  // index: the answer picked (null = too late).
  function submit(index) {
    const current = game.run.fight;
    if (!current || current.phase !== 'ask') return;
    if (index !== null && current.hidden.includes(index)) return; // removed by a hint potion
    answer(game, current, index);
    const last = current.last;
    celebrate(game, last, typeOf(current.opponent.category).color, current.combo);
    if (current.phase === 'won') playEffect('victory');
    if (current.phase === 'lost') playEffect('defeat');
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
    if (fight.last && fight.last.fleeFailed) celebrate(game, fight.last, type.color, 0);
    refresh();
  }

  const isOver = ['won', 'lost', 'fled'].includes(fight.phase);
  const wide = useScreen().wide;
  const title = titleOf(fight);

  return (
    <div className="hud">
      <div style={{ ...styles.top, ...(wide ? styles.topWide : null) }}>
        <StatusPanel game={game} />
        <div className="window" style={styles.foe}>
          <span>
            <span className="gold">◆</span> {title}
          </span>
          <GroupLine fight={fight} />
          <div className="row" style={styles.chips}>
            <div className="chip" style={{ backgroundColor: type.color }}>
              <PixelIcon name={type.id} size={14} />
              <span>{type.name}</span>
            </div>
            {opponent.tag && <TagBadge tag={opponent.tag} />}
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
        {isOver && <Ending game={game} fight={fight} onContinue={goOn} />}
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
  topWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  group: {
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  target: {
    color: '#ffd23f',
  },
  beaten: {
    opacity: 0.45,
    textDecoration: 'line-through',
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
  questionTop: {
    justifyContent: 'space-between',
    marginTop: 4,
  },
  combo: {
    fontSize: 15,
  },
  mistakes: {
    marginTop: 8,
    maxHeight: '34vh',
    overflowY: 'auto',
  },
  mistake: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 3,
  },
  center: {
    textAlign: 'center',
    marginTop: 6,
  },
};
