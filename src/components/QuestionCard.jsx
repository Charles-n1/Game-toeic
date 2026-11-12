import { useState, useEffect } from 'react';
import AppText from './AppText';
import AnswerButton from './AnswerButton';
import MainButton from './MainButton';
import Passage from './Passage';
import { useTheme } from '../themes';
import { playSound } from '../sounds';
import { countGood } from '../logic/groups';
import { categoryOf, colorOf } from '../data/categories';
import { EMPTY_CARD } from '../logic/sessions';

const MIN_WHY_LENGTH = 13; // "more than 12 characters"

// The color of an answer button.
function lookOf(index, choice, submitted, correctIndex) {
  if (index !== choice) return 'normal';
  if (!submitted) return 'selected';
  return index === correctIndex ? 'good' : 'bad';
}

// The "why" typed for this question ('' if nothing typed yet).
function whyOf(whys, question) {
  return whys[question.id] || '';
}

// One question of the group: 4 answers + "why ?" (if askWhy) + its result.
function OneQuestion({ question, number, total, choice, why, askWhy, submitted, onChoose, onTypeWhy }) {
  const theme = useTheme();
  const isCorrect = choice === question.correct_index;
  const category = categoryOf(question.category); // its name and its color

  return (
    <div style={styles.block}>
      {total > 1 && (
        <AppText style={styles.number}>
          {number} / {total}
        </AppText>
      )}
      <AppText style={styles.question}>{question.question}</AppText>

      {question.answers.map((answer, index) => (
        <AnswerButton
          key={index}
          label={answer}
          look={lookOf(index, choice, submitted, question.correct_index)}
          disabled={submitted}
          onPress={() => onChoose(question, index)}
        />
      ))}

      {askWhy && (
        <>
          <AppText style={styles.why}>Why ? :</AppText>
          <textarea
            style={{ ...styles.input, color: theme.text, borderColor: theme.border, backgroundColor: theme.card }}
            value={why}
            onChange={(event) => onTypeWhy(question, event.target.value)}
            readOnly={submitted}
            placeholder="Explain your choice..."
          />
          <AppText style={styles.counter}>
            {why.length} / {MIN_WHY_LENGTH} characters
          </AppText>
        </>
      )}

      {/* After submit: the category of the question, in its spider chart color */}
      {submitted && <AppText style={{ ...styles.category, color: colorOf(category, theme) }}>{category.name}</AppText>}
      {submitted && isCorrect && <AppText style={styles.good}>Correct!</AppText>}
      {submitted && !isCorrect && <AppText style={styles.bad}>{question.justification}</AppText>}
    </div>
  );
}

// A group: the text (if any), ALL its questions, one submit, the results.
// Used by the Training page and the Recovery page.
// onAnswered receives [{ question, isCorrect }, ...]
// Optional, to save the card: initial (the answers given before leaving, see EMPTY_CARD),
// and onChange({ choices, whys, submitted }), called at each change.
// askWhy: false = no "Why ?" to write (the "No justification" setting): an answer is enough.
export default function QuestionCard({ questions, onAnswered, onNext, initial = EMPTY_CARD, onChange, askWhy = true }) {
  const [choices, setChoices] = useState(initial.choices); // { questionId: index of the chosen answer }
  const [whys, setWhys] = useState(initial.whys); // { questionId: "because..." }
  const [submitted, setSubmitted] = useState(initial.submitted);

  useEffect(cardChanged, [choices, whys, submitted]);

  function cardChanged() {
    if (onChange) onChange({ choices, whys, submitted });
  }

  const text = questions[0].text;
  const allDone = questions.every(
    (q) => choices[q.id] !== undefined && (!askWhy || whyOf(whys, q).length >= MIN_WHY_LENGTH),
  );

  function choose(question, index) {
    setChoices({ ...choices, [question.id]: index });
  }

  function typeWhy(question, text) {
    setWhys({ ...whys, [question.id]: text });
  }

  function submit() {
    const results = questions.map((q) => ({ question: q, isCorrect: choices[q.id] === q.correct_index }));
    setSubmitted(true);
    playSound(countGood(results) === results.length ? 'success' : 'wrong');
    onAnswered(results);
  }

  return (
    <div>
      {text && <Passage text={text} />}

      {questions.map((question, index) => (
        <OneQuestion
          key={question.id}
          question={question}
          number={index + 1}
          total={questions.length}
          choice={choices[question.id]}
          why={whyOf(whys, question)}
          askWhy={askWhy}
          submitted={submitted}
          onChoose={choose}
          onTypeWhy={typeWhy}
        />
      ))}

      <MainButton label="Submit" onPress={submit} disabled={!allDone || submitted} />
      {submitted && <MainButton label="Next" onPress={onNext} />}
    </div>
  );
}

const styles = {
  block: {
    marginBottom: 24,
  },
  number: {
    color: '#888',
    marginBottom: 4,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  why: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    minHeight: 70,
    resize: 'vertical',
  },
  counter: {
    color: '#888',
    marginTop: 4,
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  good: {
    color: '#2e9e4f',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  bad: {
    color: '#d63031',
    fontSize: 16,
    marginTop: 12,
  },
};
