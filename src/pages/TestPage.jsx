import { useState } from 'react';
import AppText from '../components/AppText';
import AnswerButton from '../components/AnswerButton';
import MainButton from '../components/MainButton';
import CheckBox from '../components/CheckBox';
import ScrollView from '../components/ScrollView';
import SectionPicker from '../components/SectionPicker';
import TestSession from '../components/TestSession';
import { TEST_LEVELS, testMinutes } from '../data/sections';
import { loadTestSession, saveTestSession } from '../logic/storage';

// Steps: 'sections' -> 'difficulty' -> 'exam' (-> score, inside TestSession)
// A test left in progress (or the level test started by the tutorial): straight to 'exam'.
// preview: shown behind the tutorial -> always the first step (the test in progress is not touched).
export default function TestPage({ questions, recordAnswers, preview }) {
  // useState(function): read only once, when the page opens.
  const [unfinished, setUnfinished] = useState(() => (preview ? null : loadTestSession(questions))); // null = none
  const [step, setStep] = useState(unfinished ? 'exam' : 'sections');
  const [sections, setSections] = useState([]); // like ['rc10', 'rc8']
  const [levelIndex, setLevelIndex] = useState(null); // position in TEST_LEVELS
  const [multiDocs, setMultiDocs] = useState(false); // multi-document texts in this test?

  function goToDifficulty() {
    setLevelIndex(null);
    setStep('difficulty');
  }

  function startExam() {
    setUnfinished(null);
    setStep('exam');
  }

  // "<" during the test (it is dropped), or "Back" on the score.
  function backToStart() {
    saveTestSession(null);
    setUnfinished(null);
    setStep('sections');
  }

  if (step === 'sections') {
    return <SectionPicker title="Test" selected={sections} onChange={setSections} onSubmit={goToDifficulty} />;
  }

  if (step === 'difficulty') {
    return (
      <ScrollView contentStyle={styles.page}>
        <AppText style={styles.title}>Difficulty</AppText>
        {TEST_LEVELS.map((name, index) => (
          <AnswerButton
            key={name}
            label={name + ' (' + testMinutes(sections, index) + ' mins)'}
            look={index === levelIndex ? 'selected' : 'normal'}
            onPress={() => setLevelIndex(index)}
          />
        ))}
        <CheckBox label="Multi-document texts" checked={multiDocs} onChange={setMultiDocs} />
        <MainButton label="submit" onPress={startExam} disabled={levelIndex === null} />
      </ScrollView>
    );
  }

  return (
    <TestSession
      exam={unfinished ? unfinished.exam : { kind: 'normal', sections, levelIndex, multiDocs }}
      saved={unfinished}
      onSave={saveTestSession}
      questions={questions}
      recordAnswers={recordAnswers}
      onQuit={backToStart}
      onBack={backToStart}
    />
  );
}

const styles = {
  page: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
};
