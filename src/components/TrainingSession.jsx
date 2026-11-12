import { useState, useEffect } from 'react';
import AppText from './AppText';
import Icon from './Icon';
import QuestionCard from './QuestionCard';
import ScoreScreen from './ScoreScreen';
import ScrollView from './ScrollView';
import { useTheme } from '../themes';
import useDeadline from '../logic/useDeadline';
import { pickGroup, countGood } from '../logic/groups';
import { formatTime } from '../logic/time';
import { onWrong } from '../logic/retrieve';
import { EMPTY_CARD, newTrainingSession, questionsLeft, trainingGroups } from '../logic/sessions';
import { addAnswers } from '../data/categories';
import gearIcon from '../assets/Logos/engrenage.png';

// The training itself, following the config.
// saved: the session left in progress (null = a new one). onSave(session): called at each change,
// onSave(null) at the end. (The tutorial's example gives no onSave: nothing is saved.)
// askWhy: false = no "Why ?" to write.
export default function TrainingSession({
  config,
  questions,
  askWhy = true,
  saved,
  onSave,
  updateQuestion,
  recordAnswers,
  onReconfigure,
  onBack,
}) {
  const theme = useTheme();
  // useState(function): the session is created only the first time.
  const [session, setSession] = useState(() => saved || newTrainingSession(config, questions));
  const [round, setRound] = useState(0); // changes every group -> resets the card
  const [stopped, setStopped] = useState(false); // all the questions asked are answered, or "End" was clicked
  const settings = session.config;

  const secondsLeft = useDeadline(session.endsAt, !stopped);
  const timeIsUp = settings.useTime && secondsLeft <= 0;
  const finished = stopped || timeIsUp;

  // Each change: save the session. Finished: forget it (the score is not saved).
  useEffect(sessionChanged, [session, finished]);

  function sessionChanged() {
    if (onSave) onSave(finished ? null : session);
  }

  // The card changed (an answer tapped, a "why" typed, submit): keep it in the session.
  function cardChanged(card) {
    setSession((old) => ({ ...old, card: card }));
  }

  // results: [{ question, isCorrect }, ...]
  function handleAnswered(results) {
    recordAnswers(results);
    for (const result of results) {
      if (!result.isCorrect) updateQuestion(onWrong(result.question));
    }
    setSession((old) => ({
      ...old,
      score: old.score + countGood(results),
      answeredCount: old.answeredCount + results.length,
      results: addAnswers(old.results, results),
    }));
  }

  function next() {
    if (settings.useCount && session.answeredCount >= settings.count) {
      setStopped(true);
      return;
    }
    const group = pickGroup(trainingGroups(questions, settings), questionsLeft(settings, session.answeredCount));
    setSession((old) => ({ ...old, group: group, card: EMPTY_CARD }));
    setRound(round + 1);
  }

  function end() {
    setStopped(true);
  }

  if (finished) {
    return (
      <ScoreScreen
        score={session.score}
        total={session.answeredCount}
        results={session.results}
        note={timeIsUp ? "Time's up !" : null}
        onBack={onBack}
      />
    );
  }

  // key={round}: a new group = a new page, back at the top.
  return (
    <ScrollView key={round} contentStyle={styles.page}>
      <div style={styles.topBar}>
        <button onClick={onReconfigure} aria-label="settings of the training">
          <Icon src={gearIcon} color={theme.text} size={30} />
        </button>
        <div style={styles.right}>
          {settings.useTime && <AppText style={styles.info}>{formatTime(secondsLeft)}</AppText>}
          {/* Stop here and see the score (a training without a limit never ends by itself) */}
          {session.answeredCount > 0 && (
            <button onClick={end} style={{ ...styles.end, borderColor: theme.border, backgroundColor: theme.card }}>
              <AppText style={styles.endText}>End</AppText>
            </button>
          )}
        </div>
      </div>
      <QuestionCard
        questions={session.group}
        onAnswered={handleAnswered}
        onNext={next}
        initial={session.card}
        onChange={cardChanged}
        askWhy={askWhy}
      />
    </ScrollView>
  );
}

const styles = {
  page: {
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  end: {
    borderWidth: 2,
    borderRadius: 12,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 14,
    paddingRight: 14,
    marginLeft: 14,
  },
  endText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
};
