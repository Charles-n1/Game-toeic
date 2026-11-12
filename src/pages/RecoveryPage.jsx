import { useState } from 'react';
import AppText from '../components/AppText';
import BackButton from '../components/BackButton';
import BarChart from '../components/BarChart';
import MainButton from '../components/MainButton';
import QuestionCard from '../components/QuestionCard';
import ScrollView from '../components/ScrollView';
import { today } from '../logic/dates';
import { isDue, onWrong, onRetrieveSuccess } from '../logic/retrieve';
import { makeGroups } from '../logic/groups';

// askWhy: false = no "Why ?" to write (the "No justification" setting).
export default function RecoveryPage({ questions, askWhy, reviewLog, updateQuestion, recordAnswers, logReview }) {
  // The groups to retrieve (a text + its due questions), frozen when the user clicks "Retrieve".
  // (Frozen because answering moves the question to a later day.)
  const [session, setSession] = useState(null);
  const [index, setIndex] = useState(0);

  const dueToday = questions.filter((q) => isDue(q, today()));

  function startRetrieve() {
    setSession(makeGroups(dueToday));
    setIndex(0);
  }

  // results: [{ question, isCorrect }, ...]
  function handleAnswered(results) {
    recordAnswers(results);
    for (const result of results) {
      updateQuestion(result.isCorrect ? onRetrieveSuccess(result.question) : onWrong(result.question));
      logReview();
    }
  }

  function next() {
    if (index + 1 < session.length) {
      setIndex(index + 1);
    } else {
      setSession(null); // all done
    }
  }

  // The "<": leave. The questions already answered are saved, the others stay for later.
  function stopRetrieve() {
    setSession(null);
  }

  // Retrieving: its own full screen.
  if (session) {
    return (
      <div style={styles.screen}>
        <ScrollView key={index} contentStyle={styles.sessionPage}>
          <AppText style={styles.title}>Retrieve</AppText>
          <AppText style={styles.progress}>
            {index + 1} / {session.length}
          </AppText>
          <QuestionCard questions={session[index]} onAnswered={handleAnswered} onNext={next} askWhy={askWhy} />
        </ScrollView>
        <BackButton onPress={stopRetrieve} />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Top half: the 7 days */}
      <div style={styles.half}>
        <AppText style={styles.title}>Recovery</AppText>
        <BarChart questions={questions} reviewLog={reviewLog} />
      </div>

      {/* Bottom half: the button */}
      <div style={styles.half}>
        <MainButton
          label={dueToday.length === 0 ? 'Nothing to retrieve today' : 'Retrieve (' + dueToday.length + ')'}
          onPress={startRetrieve}
          disabled={dueToday.length === 0}
        />
      </div>
    </div>
  );
}

const styles = {
  screen: {
    flex: 1,
    minHeight: 0,
  },
  sessionPage: {
    padding: 20,
    paddingBottom: 90, // room for the "<" button
  },
  page: {
    flex: 1,
    padding: 20,
  },
  half: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progress: {
    color: '#888',
    marginBottom: 10,
  },
};
