import { useState, Fragment } from 'react';
import AppText from '../components/AppText';
import BackButton from '../components/BackButton';
import FrendSprite from '../components/FrendSprite';
import MainButton from '../components/MainButton';
import ScrollView from '../components/ScrollView';
import SpeechBubble from '../components/SpeechBubble';
import { useTheme } from '../themes';
import { playSound } from '../sounds';
import { pickRandom } from '../logic/random';
import { categoryOf, colorOf } from '../data/categories';
import { LESSONS, pickSentences, sentenceOf, wordsOf } from '../data/lessons';

const MIN_ANSWER_LENGTH = 18; // "18 characters minimum"
const GOOD = '#2e9e4f';
const BAD = '#d63031';

// What Frend says when a word is clicked.
const WRONG_LINES = ["Nope ! Retry ^^'", 'Not this one.. retry !', 'Hmh, no. Try again !', 'Almost ! Retry XD'];
const RIGHT_LINES = ["YES !! That's it ^O^", 'GG !!', 'Exactly !! :D', 'Nice one !'];

// One word of the sentence: plain text, but it can be clicked.
// look: 'normal' | 'good' (found: green) | 'bad' (clicked, but wrong: red).
function Word({ word, look, onPress }) {
  const theme = useTheme();
  let color = theme.text;
  if (look === 'good') color = GOOD;
  if (look === 'bad') color = BAD;

  return (
    <span role="button" onClick={onPress} style={{ ...styles.word, color: color }}>
      {word}
    </span>
  );
}

// The lesson of a category (opened from the Statistics page).
// Steps: 'find' (click the word of the category, in 3 sentences: retry until it's found)
//     -> 'explain' ("So, what have you understood of this ?", 18 characters minimum)
//     -> 'done' (the real explanation).
export default function LessonPage({ categoryId, onBack }) {
  const theme = useTheme();
  const category = categoryOf(categoryId);
  const color = colorOf(category, theme);
  const lesson = LESSONS[categoryId];

  const [sentences, setSentences] = useState(() => pickSentences(lesson)); // the 3 sentences of this round
  const [round, setRound] = useState(0); // which sentence is on screen
  const [wrongs, setWrongs] = useState([]); // positions of the wrong words clicked (they stay red)
  const [found, setFound] = useState(false);
  const [step, setStep] = useState('find');
  const [answer, setAnswer] = useState(''); // what the player understood
  // What Frend does and says. count: +1 at each new line -> his animation starts again.
  const [frend, setFrend] = useState({ animation: 'greeting', line: "Let's learn the " + category.name + ' ! ^O^', count: 0 });

  const sentence = sentenceOf(lesson, sentences[round]); // { text, find }
  const words = wordsOf(sentence.text);
  const isLastSentence = round === sentences.length - 1;

  function say(animation, line) {
    setFrend((old) => ({ animation: animation, line: line, count: old.count + 1 }));
  }

  function clickWord(index) {
    if (found) return;
    if (words[index].target) {
      setFound(true);
      playSound('success');
      say('cheese', pickRandom(RIGHT_LINES));
    } else {
      if (!wrongs.includes(index)) setWrongs([...wrongs, index]);
      playSound('wrong');
      say('chocked', pickRandom(WRONG_LINES));
    }
  }

  // The look of word number `index`.
  function lookOf(index) {
    if (found && words[index].target) return 'good';
    if (wrongs.includes(index)) return 'bad';
    return 'normal';
  }

  function next() {
    if (isLastSentence) {
      setStep('explain');
      say('talking', 'So, what have you understood of this ?');
      return;
    }
    setRound(round + 1);
    setWrongs([]);
    setFound(false);
    say('montre_debout', 'Next one !');
  }

  function typeAnswer(event) {
    setAnswer(event.target.value);
  }

  function submitAnswer() {
    setStep('done');
    say('chill', "Here's the explanation ! Compare it with what you wrote ^w^");
  }

  // 3 new sentences (not the same ones), same lesson.
  function again() {
    setSentences(pickSentences(lesson, sentences));
    setRound(0);
    setWrongs([]);
    setFound(false);
    setAnswer('');
    setStep('find');
    say('greeting', "Again ! Let's go ^O^");
  }

  const inputStyle = { ...styles.input, color: theme.text, borderColor: theme.border, backgroundColor: theme.card };

  return (
    <div style={styles.screen}>
      <ScrollView contentStyle={styles.page}>
        <div style={styles.titleRow}>
          <AppText style={{ ...styles.title, color: color }}>{category.name}</AppText>
          {step === 'find' && (
            <AppText style={styles.progress}>
              {round + 1} / {sentences.length}
            </AppText>
          )}
        </div>

        {/* Frend, next to his bubble */}
        <div style={styles.frendRow}>
          <FrendSprite animation={frend.animation} restart={frend.count} size={0.5} />
          <div style={styles.bubble}>
            <SpeechBubble text={frend.line} tail="left" />
          </div>
        </div>

        {step === 'find' && (
          <>
            <AppText style={styles.task}>Click on {sentence.find} :</AppText>
            {/* A normal sentence: the words, with a space between them */}
            <AppText style={styles.sentence}>
              {words.map((item, index) => (
                <Fragment key={round + '-' + index}>
                  {index > 0 && ' '}
                  <Word word={item.word} look={lookOf(index)} onPress={() => clickWord(index)} />
                </Fragment>
              ))}
            </AppText>
            {found && <MainButton label="Next" onPress={next} />}
          </>
        )}

        {step !== 'find' && (
          <>
            <AppText style={styles.task}>What I understood :</AppText>
            <textarea
              style={inputStyle}
              value={answer}
              onChange={typeAnswer}
              readOnly={step === 'done'}
              placeholder="In my own words..."
            />
            <AppText style={styles.counter}>
              {answer.trim().length} / {MIN_ANSWER_LENGTH} characters
            </AppText>
          </>
        )}

        {step === 'explain' && (
          <MainButton label="Submit" onPress={submitAnswer} disabled={answer.trim().length < MIN_ANSWER_LENGTH} />
        )}

        {step === 'done' && (
          <>
            <div style={{ ...styles.explanation, borderColor: color, backgroundColor: theme.card }}>
              <AppText style={{ ...styles.explanationTitle, color: color }}>Explanation</AppText>
              <AppText style={styles.explanationText}>{lesson.explanation}</AppText>
            </div>
            <MainButton label="Again (3 new sentences)" onPress={again} />
          </>
        )}
      </ScrollView>

      <BackButton onPress={onBack} />
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
  },
  progress: {
    color: '#888',
    fontSize: 18,
    marginLeft: 10,
  },
  frendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  bubble: {
    flex: 1, // the bubble takes all the room Frend leaves
    minWidth: 0,
    marginLeft: 16, // room for the tail of the bubble
  },
  task: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  sentence: {
    fontSize: 22,
    lineHeight: '36px',
  },
  word: {
    cursor: 'pointer',
    paddingTop: 6, // a taller zone to tap, without moving the text
    paddingBottom: 6,
    WebkitTapHighlightColor: 'transparent', // iPhone: no grey box on tap
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    resize: 'vertical',
  },
  counter: {
    color: '#888',
    marginTop: 4,
  },
  explanation: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: '23px',
  },
};
