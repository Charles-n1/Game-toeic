import { useState, useEffect } from 'react';
import AppText from './AppText';
import AnswerButton from './AnswerButton';
import BackButton from './BackButton';
import MainButton from './MainButton';
import Passage from './Passage';
import ScoreScreen from './ScoreScreen';
import ScrollView from './ScrollView';
import useDeadline from '../logic/useDeadline';
import { countGood } from '../logic/groups';
import { formatTime } from '../logic/time';
import { newTestSession, testPlan } from '../logic/sessions';
import { addAnswers } from '../data/categories';
import { LEVEL_TESTS } from '../data/levelTest';

// One question of the group: its 4 answers (no "why", no result: it's an exam).
function TestQuestion({ question, number, total, choice, onChoose }) {
  return (
    <div style={styles.block}>
      {total > 1 && (
        <AppText style={styles.number}>
          {number} / {total}
        </AppText>
      )}
      <AppText style={styles.question}>{question.question}</AppText>
      {question.answers.map((item, index) => (
        <AnswerButton
          key={index}
          label={item}
          look={index === choice ? 'selected' : 'normal'}
          onPress={() => onChoose(question, index)}
        />
      ))}
    </div>
  );
}

// The exam itself: texts with all their questions, a clock, a hidden score.
// exam: what was chosen before (see sessions.js): a normal test, or the level test.
// saved: the test left in progress (null = a new one). onSave(session): called at each change, onSave(null) at the end.
// onQuit: the "<", the test is dropped. onBack: "Back" on the score.
export default function TestSession({ exam, questions, saved, onSave, recordAnswers, onQuit, onBack }) {
  // useState(function): the session is created only the first time.
  const [session, setSession] = useState(() => saved || newTestSession(exam, questions));
  const { group, choices, answeredCount } = session;
  const plan = testPlan(session.exam, questions); // how many questions, and the next group
  const isLevelTest = session.exam.kind === 'level';

  const allAnswered = answeredCount >= plan.total;
  const allChosen = group.every((q) => choices[q.id] !== undefined);
  // Real time: if the player left, the clock went on. Back after the end -> the score directly.
  const secondsLeft = useDeadline(session.endsAt, !allAnswered);
  const timeIsUp = secondsLeft <= 0;
  const finished = allAnswered || timeIsUp;

  // Each change: save the test. Finished: forget it (the score is not saved).
  useEffect(sessionChanged, [session, finished]);

  function sessionChanged() {
    onSave(finished ? null : session);
  }

  function choose(question, index) {
    setSession((old) => ({ ...old, choices: { ...old.choices, [question.id]: index } }));
  }

  // Sends the answers of the whole group, then shows the next group.
  function submit() {
    const results = group.map((q) => ({ question: q, isCorrect: choices[q.id] === q.correct_index }));
    const newCount = answeredCount + group.length;
    const nextGroup = newCount < plan.total ? plan.nextGroup(newCount) : group; // the end: no next group
    recordAnswers(results);
    setSession((old) => ({
      ...old,
      group: nextGroup,
      choices: {},
      score: old.score + countGood(results),
      answeredCount: newCount,
      results: addAnswers(old.results, results),
    }));
  }

  function quit() {
    if (window.confirm('Quit this test ? It will be lost (the answers already sent stay in your stats).')) onQuit();
  }

  if (finished) {
    // Time's up: the score counts only the questions answered.
    return (
      <ScoreScreen
        score={session.score}
        total={answeredCount}
        results={session.results}
        title={isLevelTest ? 'Level test (' + LEVEL_TESTS[session.exam.level].name + ')' : null}
        note={allAnswered ? null : "Time's up ! " + answeredCount + ' / ' + plan.total + ' questions answered.'}
        onBack={onBack}
      />
    );
  }

  // key={answeredCount}: a new group = a new page, back at the top.
  return (
    <div style={styles.screen}>
      <ScrollView key={answeredCount} contentStyle={styles.page}>
        {isLevelTest && <AppText style={styles.title}>Level test ({LEVEL_TESTS[session.exam.level].name})</AppText>}
        <div style={styles.topBar}>
          <AppText style={styles.info}>
            {answeredCount + 1} / {plan.total}
          </AppText>
          <AppText style={styles.info}>{formatTime(secondsLeft)}</AppText>
        </div>
        {group[0].text && <Passage text={group[0].text} />}
        {group.map((question, index) => (
          <TestQuestion
            key={question.id}
            question={question}
            number={index + 1}
            total={group.length}
            choice={choices[question.id]}
            onChoose={choose}
          />
        ))}
        <MainButton label="submit" onPress={submit} disabled={!allChosen} />
      </ScrollView>
      <BackButton onPress={quit} />
    </div>
  );
}

const styles = {
  screen: {
    flex: 1,
    minHeight: 0,
  },
  page: {
    padding: 20,
    paddingBottom: 90, // room for the "<" button
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    fontWeight: 'bold',
  },
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
};
