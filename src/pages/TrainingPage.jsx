import { useState } from 'react';
import SectionPicker from '../components/SectionPicker';
import TrainingOptions from '../components/TrainingOptions';
import TrainingSession from '../components/TrainingSession';
import { trainingPool } from '../logic/groups';
import { loadTrainingSession, saveTrainingSession } from '../logic/storage';

// The tutorial's example: RC 10, the default choices.
const TUTORIAL_PART = ['rc10'];
const TUTORIAL_CONFIG = {
  sections: TUTORIAL_PART,
  useTime: false,
  seconds: null,
  useCount: false,
  count: null,
  difficulty: 'normal',
  multiDocs: false,
  categories: null,
};

function doNothing() {}

// What the tutorial shows of the training, step by step (nothing can be clicked: the tutorial is on top).
// step: 'sections' (nothing chosen) | 'part' (RC 10 chosen) | 'options' | 'difficulty' | 'play'
function TrainingTutorial({ step, questions, onAnchor }) {
  if (step === 'sections' || step === 'part') {
    const chosen = step === 'part' ? TUTORIAL_PART : [];
    return (
      <SectionPicker title="Training" selected={chosen} onChange={doNothing} onSubmit={doNothing} onAnchor={onAnchor} />
    );
  }
  if (step === 'options' || step === 'difficulty') {
    return (
      <TrainingOptions
        sections={TUTORIAL_PART}
        config={null}
        questions={questions}
        onStart={doNothing}
        onBack={doNothing}
        onAnchor={onAnchor}
        focus={step === 'difficulty' ? 'difficulty' : null}
      />
    );
  }
  return (
    <TrainingSession
      config={TUTORIAL_CONFIG}
      questions={questions}
      updateQuestion={doNothing}
      recordAnswers={doNothing}
      onReconfigure={doNothing}
      onBack={doNothing}
    />
  );
}

// The training left in progress (see storage.js), if it can still ask questions. Else null.
function loadUnfinished(questions) {
  const session = loadTrainingSession(questions);
  if (!session || trainingPool(questions, session.config).length === 0) return null;
  return session;
}

// Steps: 'sections' -> 'options' -> 'play' (-> score, inside TrainingSession)
// A training left in progress: we come back to it, on the same questions.
// Else, if a saved config exists (and still has questions), we go straight to 'play'.
// tutorialStep / onAnchor: when the tutorial shows the training (null = the normal page).
// askWhy: false = no "Why ?" to write (the "No justification" setting).
export default function TrainingPage({
  questions,
  askWhy,
  updateQuestion,
  recordAnswers,
  config,
  onConfigDone,
  tutorialStep,
  onAnchor,
}) {
  // useState(function): read only once, when the page opens.
  const [unfinished, setUnfinished] = useState(() => loadUnfinished(questions)); // null = start a new session
  const canPlay = config !== null && trainingPool(questions, config).length > 0;
  const [step, setStep] = useState(unfinished || canPlay ? 'play' : 'sections');
  const [sections, setSections] = useState(unfinished ? unfinished.config.sections : config ? config.sections : []);
  const [sessionNumber, setSessionNumber] = useState(0); // +1 = a brand new session

  if (tutorialStep) {
    return <TrainingTutorial step={tutorialStep} questions={questions} onAnchor={onAnchor} />;
  }

  function goToOptions() {
    setStep('options');
  }

  function start(newConfig, save) {
    onConfigDone(newConfig, save);
    setUnfinished(null);
    setSessionNumber(sessionNumber + 1);
    setStep('play');
  }

  // From the ⚙ during training, the "<" of the options page, or "Back" on the score.
  // The session in progress is dropped (the answers already given stay in the stats).
  function goToSections() {
    saveTrainingSession(null);
    setUnfinished(null);
    setStep('sections');
  }

  if (step === 'sections') {
    return <SectionPicker title="Training" selected={sections} onChange={setSections} onSubmit={goToOptions} />;
  }

  if (step === 'options') {
    return (
      <TrainingOptions
        sections={sections}
        config={config}
        questions={questions}
        onStart={start}
        onBack={goToSections}
      />
    );
  }

  return (
    <TrainingSession
      key={sessionNumber}
      config={unfinished ? unfinished.config : config}
      saved={unfinished}
      onSave={saveTrainingSession}
      questions={questions}
      askWhy={askWhy}
      updateQuestion={updateQuestion}
      recordAnswers={recordAnswers}
      onReconfigure={goToSections}
      onBack={goToSections}
    />
  );
}
