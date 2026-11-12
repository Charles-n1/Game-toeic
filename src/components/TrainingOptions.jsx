import { useState, useRef, useEffect } from 'react';
import AppText from './AppText';
import AnswerButton from './AnswerButton';
import MainButton from './MainButton';
import CheckBox from './CheckBox';
import BackButton from './BackButton';
import ScrollView from './ScrollView';
import Anchor from './Anchor';
import { useTheme } from '../themes';
import { normalMinutes, secondsPerQuestion } from '../data/sections';
import { CATEGORIES } from '../data/categories';
import { trainingPool } from '../logic/groups';
import { formatTime, parseTime } from '../logic/time';
import { MAX_TRAINING_SECONDS, MAX_TRAINING_QUESTIONS } from '../logic/validate';

const DIFFICULTIES = ['normal', 'hard', 'extreme'];

// ['pronouns'] + 'passive' ticked -> ['pronouns', 'passive']. Unticked -> removed from the list.
function tick(list, id, checked) {
  return checked ? [...list, id] : list.filter((other) => other !== id);
}

// The "Do u want ?" page: builds the training config.
// config: the last config (or null), to start with the same choices. onBack: go back to the sections.
// questions: all the questions (to check that the choices leave at least one).
// For the tutorial (optional): onAnchor (it points at "time"), focus 'difficulty' (scrolls to Difficulty).
export default function TrainingOptions({ sections, config, questions, onStart, onBack, onAnchor, focus }) {
  const theme = useTheme();
  const normalSeconds = normalMinutes(sections) * 60;
  const scroll = useRef(null); // the ScrollView, to scroll it from the code
  const difficultyTitle = useRef(null); // the "Difficulty" title

  // Tutorial: scroll so that Difficulty is at the top.
  useEffect(scrollToFocus, [focus]);

  function scrollToFocus() {
    if (focus === 'difficulty') {
      scroll.current.scrollTo({ top: difficultyTitle.current.offsetTop - 10, behavior: 'smooth' });
    }
  }

  // Start with the last choices if there are some, else the default values.
  const [useTime, setUseTime] = useState(config ? config.useTime : false);
  const [timeText, setTimeText] = useState(formatTime(config && config.useTime ? config.seconds : normalSeconds)); // "mm:ss"
  const [useCount, setUseCount] = useState(config ? config.useCount : false);
  const [countText, setCountText] = useState(config && config.useCount ? String(config.count) : '10');
  const [difficulty, setDifficulty] = useState(config ? config.difficulty : 'normal');
  const [multiDocs, setMultiDocs] = useState(config ? config.multiDocs : false);
  // Target: "default" = all the categories. Unticked = only the ticked categories.
  const [defaultTarget, setDefaultTarget] = useState(config ? config.categories === null : true);
  const [targets, setTargets] = useState(config && config.categories ? config.categories : []);
  const [save, setSave] = useState(true);

  const seconds = parseTime(timeText); // null if the format is wrong
  const count = Number(countText);
  const timeOk = !useTime || (seconds !== null && seconds > 0 && seconds <= MAX_TRAINING_SECONDS); // max 5 h
  const countOk = !useCount || (Number.isInteger(count) && count > 0 && count <= MAX_TRAINING_QUESTIONS); // max 1000

  const newConfig = {
    sections,
    useTime,
    seconds,
    useCount,
    count,
    difficulty,
    multiDocs,
    categories: defaultTarget ? null : targets,
  };
  const hasQuestions = trainingPool(questions, newConfig).length > 0; // e.g. RC 8 + "extreme" + comparatives: none

  function toggleTarget(id, checked) {
    setTargets(tick(targets, id, checked));
  }

  function start() {
    onStart(newConfig, save);
  }

  function typeTime(event) {
    setTimeText(event.target.value);
  }

  function typeCount(event) {
    setCountText(event.target.value);
  }

  const inputStyle = { ...styles.input, color: theme.text, borderColor: theme.border, backgroundColor: theme.card };

  return (
    <div style={styles.screen}>
      <ScrollView ref={scroll} contentStyle={styles.page}>
        <AppText style={styles.title}>Do u want ?</AppText>

        <Anchor name="time" onAnchor={onAnchor}>
          <CheckBox label="time ? y/n" checked={useTime} onChange={setUseTime} />
        </Anchor>
        {useTime && (
          <>
            <AppText style={styles.blue}>Normal time for this exercise: {formatTime(normalSeconds)}</AppText>
            <input style={inputStyle} value={timeText} onChange={typeTime} placeholder="mm:ss" />
            {!timeOk && <AppText style={styles.error}>Format: mm:ss (like 10:00)</AppText>}
          </>
        )}

        <CheckBox label="limited nb of questions ? y/n" checked={useCount} onChange={setUseCount} />
        {useCount && (
          <>
            <input style={inputStyle} value={countText} onChange={typeCount} inputMode="numeric" />
            {countOk && (
              <AppText style={styles.blue}>Estimated time: {formatTime(count * secondsPerQuestion(sections))}</AppText>
            )}
          </>
        )}

        <CheckBox label="Multi-document texts" checked={multiDocs} onChange={setMultiDocs} />

        <div ref={difficultyTitle}>
          <AppText style={styles.section}>Difficulty</AppText>
        </div>
        {DIFFICULTIES.map((name) => (
          <AnswerButton
            key={name}
            label={name}
            look={name === difficulty ? 'selected' : 'normal'}
            onPress={() => setDifficulty(name)}
          />
        ))}

        <AppText style={styles.section}>Target</AppText>
        <CheckBox label="default" checked={defaultTarget} onChange={setDefaultTarget} />
        {!defaultTarget && (
          <div style={styles.categories}>
            {CATEGORIES.map((category) => (
              <CheckBox
                key={category.id}
                label={category.name}
                checked={targets.includes(category.id)}
                onChange={(checked) => toggleTarget(category.id, checked)}
              />
            ))}
          </div>
        )}

        <CheckBox
          label="Do u want to save this config ? (you can modify when you want, in the upper left of the test)"
          checked={save}
          onChange={setSave}
        />

        {!hasQuestions && <AppText style={styles.error}>No question matches these choices</AppText>}
        <MainButton label="Let's GOOO !!!" onPress={start} disabled={!timeOk || !countOk || !hasQuestions} />
        {/* Tutorial: extra room at the end, so Difficulty can scroll up to the top */}
        {focus && <div style={styles.tutorialRoom} />}
      </ScrollView>

      <BackButton onPress={onBack} />
    </div>
  );
}

const styles = {
  tutorialRoom: {
    height: 500,
  },
  screen: {
    flex: 1,
    minHeight: 0,
  },
  page: {
    padding: 20,
    paddingBottom: 90, // room for the "<" button
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 10,
  },
  blue: {
    color: '#007FFF',
    marginTop: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  error: {
    color: '#d63031',
    marginTop: 4,
  },
  categories: {
    paddingLeft: 24, // the categories are "inside" the target
  },
};
