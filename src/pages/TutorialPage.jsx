import { useState, useRef, useEffect } from 'react';
import AppText from '../components/AppText';
import SpeechBubble from '../components/SpeechBubble';
import FrendSprite from '../components/FrendSprite';
import GoalPage from './GoalPage';
import { useTheme } from '../themes';
import { DEFAULT_GOAL } from '../goal';
import { FOOTER_PAGES, FOOTER_HEIGHT } from '../components/Footer';
import { ANIMATIONS } from '../data/frend';
import { CATEGORIES } from '../data/categories';
import { LEVEL_TESTS } from '../data/levelTest';
import brainImage from '../assets/Images/Brain shema.png';
import howToStartImage from '../assets/Images/How to start.png';

// Frend's animations (greeting, talking, AHHH...): in src/data/frend.js.

// Where Frend can go, with "[animation@place]" at the start of a line: "[montre_assis@training] ...".
// Frend goes to his place, then, 0.8 s later, he "clicks": `view` is what the app shows behind
// (page + focus), and it stays until another place changes it.
//   icon:    he sits on a footer icon (0 = Training ... 4 = Settings).   flip: turned horizontally.
//   anchor:  he points at a button (the button tells where it is, see Anchor.jsx).
//            atX: the point to touch, from the left of the button (0 = left, 1 = right). Else: its side.
//            clickOn: the button he points at FIRST, and clicks (then he points at `anchor`).
//   section: the page scrolls to a section, he points at it from the right.
//   stay:    only the page changes, he stays next to the bubble.
const PLACES = {
  training: { type: 'icon', icon: 0, view: { page: 'training', focus: 'sections' } },
  training_part: { type: 'anchor', anchor: 'bar', atX: 50 / 118, view: { page: 'training', focus: 'part' } }, // RC 10
  // He clicks "submit", then points at the end of "time ? y/n" on the next page:
  training_options: {
    type: 'anchor',
    clickOn: 'submit',
    anchor: 'time',
    atX: 0.4,
    view: { page: 'training', focus: 'options' },
  },
  training_difficulty: { type: 'section', view: { page: 'training', focus: 'difficulty' } },
  training_play: { type: 'stay', view: { page: 'training', focus: 'play' } },
  test: { type: 'icon', icon: 1, view: { page: 'test', focus: null } },
  recovery: { type: 'icon', icon: 2, flip: true, view: { page: 'recovery', focus: null } },
  stats: { type: 'icon', icon: 3, flip: true, view: { page: 'stats', focus: null } },
  stats_eye: { type: 'anchor', anchor: 'eye', view: { page: 'stats', focus: 'eye' } },
  stats_book: { type: 'anchor', anchor: 'book', view: { page: 'history', focus: null } },
  settings: { type: 'icon', icon: 4, flip: true, view: { page: 'settings', focus: null } },
  music: { type: 'section', view: { page: 'settings', focus: 'music' } },
  theme: { type: 'section', view: { page: 'settings', focus: 'theme' } },
  wallpaper: { type: 'section', view: { page: 'settings', focus: 'wallpaper' } },
};

// "[montre_assis@training] The first..." -> "montre_assis@training". No [..] at the start -> "".
function tagOf(line) {
  if (!line.startsWith('[')) return '';
  return line.slice(1, line.indexOf(']'));
}

// The animation of a line: "[AHHH] ..." -> 'AHHH'. No tag (or a typo) -> 'talking'.
function animationOf(line) {
  const name = tagOf(line).split('@')[0];
  return ANIMATIONS[name] ? name : 'talking';
}

// Where Frend is: "[montre_assis@training] ..." -> PLACES.training. Nothing -> null (next to the bubble).
function placeOf(line) {
  const name = tagOf(line).split('@')[1];
  return PLACES[name] || null;
}

// "[AHHH] Sorry..." -> "Sorry..." (the tag is not shown in the bubble)
function textOf(line) {
  if (!line.startsWith('[')) return line;
  return line.slice(line.indexOf(']') + 1).trim();
}

// What the friend says, one line per bubble.
const INTRO = [
  '[greeting] Welcome newbie ! Here ! To prep my toeic !',
  "I'm Frend ! How are you ?..",
  "[AHHH] Sorry, I can't hear you HAHA-",
  "But yeah ! You're aiming {goal} ! Good luck man for that ! (you can change it any time in params*)",
  'So, let me show you the app ! ^O^ ! There are 5 buttons here..',
  "[montre_assis@training] The first is Training. It's used for training..",
  '[montre_debout@training_part] Training here : Click on what part u want',
  '[montre_debout@training_options] Choose, time, if wanted, limited nb',
  '[montre_debout@training_difficulty] difficulty, if you also want to target specific categories..',
  "[@training_play] Let's GOOO !!!",
  '[montre_assis@test] The second is, hmh, TEST !! Yeah !',
  "Here, you'll take tests..",
  "it's the same",
  "But only reading comprehension (RC) is available (cause he don't have budget lol",
  '[montre_assis@recovery] The third is the Recovery part ! The most important part !',
  "Indeed, learning isn't 100% understanding, it's 60% remembering !",
  '[montre_assis@stats] The fourth is the stats ! The types of questions you fail the most !',
  'One of the best features, my friend told me..',
  '[montre_debout@stats_eye] to see the categories',
  'how it works ? Simple, it demonstrates your current level.',
  'So the wheel will re-evaluate your stats every 200 questions..',
  '[montre_debout@stats_book] you can see the evolution by pressing the book',
  '[montre_assis@settings] And finally, the settings !',
  '[montre_debout@music] You can change the music',
  '[montre_debout@theme] themes',
  '[montre_debout@wallpaper] wallpaper',
  "And that's all ! ^w^",
];
const QUESTION = 'Do you want to know how to start ? y/n';
// The brain diagram is shown during these lines (put a line here to show it with the diagram).
const BRAIN_PART = [
  'To understand how we start, we first need to understand, how the brain works..',
  "To learn any skills",
  "(1) The brain has to digests information",
  "[chill] But only relevant infos ! Cause he's lazy, and he'll forget instantly",
  "(2) understanding, (another pain) : The goal is to make a maximum of links between your knowledge",
  "it helps a lot in storing the data..",
  "For that, you can explain to yourself, which answer would be the best",
  '(3) Retrieving ! (or recall)',
  "To remember on a long period ! You need to remember on a long period !",
  "Might seems dumb, but that's actually the most important in the long term",
  "You should retrieve the info minimum, 1,3,7,14,31,62..",
  "It means, you should recall 1 day after the previous recall",
  "then, 3 days if second recall, 7d after the 3rd. etc..",
  "Recall, stores in long term, and it consumes less effort..",
  "That's why you're able to talk",
  "You're native langage feels natural",
  "Cause you retrieve the infos frequently for a very long time",
  'Now ! You know how to use your brain ! ^O^',
];
const METHOD_PART = [
  "(1.a) Smash 50 questions (around, more ideally) (in Training)",
  "(1.b) See the flaws (in Statistics) ! (click on the eye)",
  'Note: every 200 questions, a save of your current stats will be done. if you want to compare yourself',
  "(1.c) Train these flaws ! Uncheck the target : [v] default",
  "then, select the categories you want to cook !",
  "(2.a) Retrive the mistakes you did.. (to not loose your exp)",
  "(2.b) And train yourself also ! (to upgrade your lvl)",
  '[greeting] Thanks for listening to me ! XD',
];
const IF_YES = [...BRAIN_PART, ...METHOD_PART];
// Just before the end: a level test (to compare later), y/n. Then, if yes: which one.
const LEVEL_QUESTION = 'I recommend to test your current level, to compare. Pls :';
// "normal analysis ? (17mins, 50 questions)"
function analysisLine(level) {
  const test = LEVEL_TESTS[level];
  return test.name + ' ? (' + test.minutes + 'mins, ' + test.perCategory * CATEGORIES.length + ' questions)';
}
const ANALYSIS_QUESTION = analysisLine('normal') + '\n' + analysisLine('accurate');
const ENDING = '[chill] Okay then.. good luck my friend XDDD !!';
const QUESTION_LINES = [QUESTION, LEVEL_QUESTION, ANALYSIS_QUESTION]; // ">" does nothing on them: a button must be clicked

// All the lines, depending on the answers (null = not answered yet):
// answer: "how to start ?" ('y' | 'n'). levelAnswer: "test your level ?" ('y' | 'n'). analysis: 'normal' | 'accurate'.
function scriptFor(answer, levelAnswer, analysis) {
  const lines = [...INTRO, QUESTION];
  if (answer === null) return lines;
  if (answer === 'y') lines.push(...IF_YES);
  lines.push(LEVEL_QUESTION);
  if (levelAnswer === null) return lines;
  if (levelAnswer === 'y') {
    lines.push(ANALYSIS_QUESTION);
    if (analysis === null) return lines;
  }
  lines.push(ENDING);
  return lines;
}

// ---------- Frend's place on the screen ----------

export const NOTHING_BEHIND = { page: null, focus: null }; // the tutorial alone, no page behind it
const CLICK_AFTER = 800; // ms: Frend goes to his place, then he "clicks" (the page stays open)
const WAIT_BEFORE_NEXT = 1500; // ms: on a line where Frend does something, ">" waits 1.5 s
const FREND_WIDTH = 174; // Frend's normal size (FrendSprite)
const FREND_HEIGHT = 262;
const SMALL = 0.6; // his size on the footer and when he points
const SITTING_MIDDLE = 0.55; // the sitting drawing: its middle is at 55% of the width, its bottom on the ground
const FINGER_X = 0.942; // the fingertip of montre_debout, in his drawing (94% of the width, 24% of the height)
const FINGER_Y = 0.239;

// Small Frend whose drawing starts at (left, top) on the screen -> his box's position and size.
// (His box is moved, then shrunk around its middle: that's why we go through the middle.)
function smallAt(left, top, flip) {
  const middleX = left + (FREND_WIDTH * SMALL) / 2;
  const middleY = top + (FREND_HEIGHT * SMALL) / 2;
  return { x: middleX - FREND_WIDTH / 2, y: middleY - FREND_HEIGHT / 2, size: SMALL, flip: flip, nextToBubble: false };
}

// Small Frend whose fingertip touches the point (x, y). flip: he points to the left.
function pointingAt(x, y, flip) {
  const fingerX = flip ? 1 - FINGER_X : FINGER_X;
  return smallAt(x - fingerX * FREND_WIDTH * SMALL, y - FINGER_Y * FREND_HEIGHT * SMALL, flip);
}

// Where Frend's box goes for a place: position (x, y), size (1 = normal), turned or not.
// screen: the tutorial on the phone screen ({ x, y, width, height }).
// home: his usual spot next to the bubble ({ x, y, rowTop }). anchors: where the buttons are.
// clicked: true once he has clicked on this line.
function targetFor(place, screen, home, anchors, clicked) {
  const atHome = { x: home.x, y: home.y, size: 1, flip: false, nextToBubble: true };
  if (!place || place.type === 'stay') return atHome;

  if (place.type === 'icon') {
    const iconMiddle = (screen.width * (place.icon + 0.5)) / FOOTER_PAGES.length;
    const iconTop = screen.height - FOOTER_HEIGHT + 10; // + the border and the padding of the footer
    const middle = place.flip ? 1 - SITTING_MIDDLE : SITTING_MIDDLE;
    const left = iconMiddle - middle * FREND_WIDTH * SMALL;
    const top = iconTop + 14 - FREND_HEIGHT * SMALL; // he sits a bit INTO the icon
    return smallAt(left, top, !!place.flip);
  }

  if (place.type === 'section') {
    // On the right, feet just above the bubble, turned: he points to the left, at the top of the page.
    const left = screen.width - 10 - FREND_WIDTH * SMALL;
    const top = home.rowTop - 6 - FREND_HEIGHT * SMALL;
    return smallAt(left, top, true);
  }

  // anchor: the button tells where it is (from the top-left of the phone screen).
  // Before the click, he points at the button he clicks (clickOn), if there is one.
  const beforeClick = place.clickOn && !clicked;
  const button = anchors[beforeClick ? place.clickOn : place.anchor];
  const atX = beforeClick ? undefined : place.atX;
  if (!button) return atHome; // not drawn yet: he waits next to the bubble
  const left = button.x - screen.x; // -> from the top-left of the tutorial
  const top = button.y - screen.y;
  const middleY = top + button.height / 2;
  // Button on the right half: he stands on its left and points right. Else: the opposite.
  const onTheRight = left + button.width / 2 > screen.width / 2;
  if (atX !== undefined) return pointingAt(left + button.width * atX, middleY, !onTheRight);
  if (onTheRight) return pointingAt(left - 2, middleY, false);
  return pointingAt(left + button.width + 2, middleY, true);
}

// The page behind the tutorial on a line: the one "clicked" by the LAST "@place" line,
// this one or before (an opened page stays open until another one is opened).
// So "<" also works: going back shows the page of that moment.
function viewAt(script, index) {
  for (let i = index; i >= 0; i--) {
    const place = placeOf(script[i]);
    if (place) return place.view;
  }
  return NOTHING_BEHIND; // nothing opened yet
}

// A round button under the bubble: "<", ">", "y" or "n".
function RoundButton({ label, onPress, disabled }) {
  const theme = useTheme();
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      style={{ ...styles.round, borderColor: theme.border, backgroundColor: theme.card, ...(disabled && styles.off) }}
    >
      <AppText style={styles.roundText}>{label}</AppText>
    </button>
  );
}

// A long button under the bubble, for an answer with words: "normal (17m)".
function ChoiceButton({ label, onPress }) {
  const theme = useTheme();
  return (
    <button onClick={onPress} style={{ ...styles.choice, borderColor: theme.border, backgroundColor: theme.card }}>
      <AppText style={styles.choiceText}>{label}</AppText>
    </button>
  );
}

// An element's box -> { x, y, width, height }, from the top-left of the browser window.
function boxOf(element) {
  const box = element.getBoundingClientRect();
  return { x: box.x, y: box.y, width: box.width, height: box.height };
}

// The tutorial, drawn ON TOP of the whole app (pages + footer): Frend can go sit on the footer icons,
// and the real pages can be shown behind the bubble.
// goal: the player's goal (null = new player: the tutorial asks it, after "How are you ?").
// onGoalChosen(newGoal): the goal page was saved.
// onFinish(levelTest): called after the last line. levelTest: 'normal' | 'accurate' (the level test chosen), or null.
// onShowPage({ page, focus }): what the app shows behind the tutorial.
// anchors: where the buttons Frend points at are (see Anchor.jsx).
export default function TutorialPage({ goal, onGoalChosen, onShowPage, onFinish, anchors }) {
  const [index, setIndex] = useState(0); // which line is shown
  const [answer, setAnswer] = useState(null); // "how to start ?": 'y', 'n' or null
  const [levelAnswer, setLevelAnswer] = useState(null); // "test your level ?": 'y', 'n' or null
  const [analysis, setAnalysis] = useState(null); // the level test chosen: 'normal', 'accurate' or null
  const [askingGoal, setAskingGoal] = useState(false); // true = the goal page is on screen
  const [places, setPlaces] = useState(null); // { screen, home }: where the tutorial and Frend's usual spot are
  const [placed, setPlaced] = useState(false); // false until Frend is put at his first place
  const [clickedLine, setClickedLine] = useState(-1); // the line where Frend has clicked
  const [readyLine, setReadyLine] = useState(-1); // the line where the 1.5 s wait is over
  const layer = useRef(null); // the whole tutorial, to measure it
  const row = useRef(null); // the bubble row
  const spot = useRef(null); // Frend's usual spot, inside the row

  const script = scriptFor(answer, levelAnswer, analysis);
  const line = script[index];
  const text = textOf(line).replace('{goal}', goal ? goal.total : '...'); // "You're aiming 750 !"
  const animation = animationOf(line); // 'talking', 'AHHH', ...
  const place = placeOf(line); // null = next to the bubble
  const isQuestion = QUESTION_LINES.includes(line);
  const isLast = index === script.length - 1 && !isQuestion; // the script ends on a question until it's answered
  const clicked = clickedLine === index;
  const canGoOn = !place || readyLine === index; // a line with a place: ">" waits 1.5 s
  // The brain part starts just after the question (INTRO, then the question, then BRAIN_PART).
  const brainStart = INTRO.length + 1;
  const methodStart = brainStart + BRAIN_PART.length; // then METHOD_PART
  const methodEnd = methodStart + METHOD_PART.length; // then the level test question
  const showBrain = answer === 'y' && index >= brainStart && index < methodStart;
  const showHowToStart = answer === 'y' && index >= methodStart && index < methodEnd;

  // Where Frend must be now (null while the screen is not measured yet).
  const target = places ? targetFor(place, places.screen, places.home, anchors, clicked) : null;

  // Each new line: show the right page behind.
  // On a line with a place: Frend goes there first, THEN he "clicks" (and the page stays open).
  // And ">" can only be pressed 1.5 s after the line started.
  useEffect(showWhatIsBehind, [index, answer]);

  function showWhatIsBehind() {
    const view = viewAt(script, index);
    if (!place) {
      onShowPage(view);
      return;
    }
    const click = setTimeout(() => clickNow(view), CLICK_AFTER);
    const ready = setTimeout(() => setReadyLine(index), WAIT_BEFORE_NEXT);
    return function cancel() {
      clearTimeout(click); // the player went to another line before: forget them
      clearTimeout(ready);
    };
  }

  function clickNow(view) {
    onShowPage(view);
    setClickedLine(index);
  }

  // After each drawing: where is the tutorial on the screen, and Frend's usual spot?
  // (A long text makes the bubble taller: the spot moves.) React Native: onLayout.
  useEffect(measure);

  function measure() {
    if (!layer.current) return; // the goal page is on screen: nothing to measure
    const screen = boxOf(layer.current);
    const spotBox = boxOf(spot.current);
    const home = { x: spotBox.x - screen.x, y: spotBox.y - screen.y, rowTop: boxOf(row.current).y - screen.y };
    const newPlaces = { screen: screen, home: home };
    // Only if something moved. (Else: new places -> new drawing -> new measure -> ... forever.)
    if (JSON.stringify(newPlaces) !== JSON.stringify(places)) setPlaces(newPlaces);
  }

  // The very first time, Frend just appears at his place. After that, he glides there (0.4 s).
  useEffect(rememberPlaced);

  function rememberPlaced() {
    if (target && !placed) setPlaced(true);
  }

  function next() {
    if (isLast) {
      onFinish(levelAnswer === 'y' ? analysis : null);
    } else if (goal === null && script[index + 1].includes('{goal}')) {
      setAskingGoal(true); // a new player: choose the goal before he talks about it
    } else {
      setIndex(index + 1);
    }
  }

  function goalChosen(newGoal) {
    onGoalChosen(newGoal);
    setAskingGoal(false);
    setIndex(index + 1);
  }

  function rewind() {
    setIndex(index - 1);
  }

  function answerYes() {
    answerWith('y');
  }

  function answerNo() {
    answerWith('n');
  }

  // y / n: to "how to start ?" or to "test your level ?".
  function answerWith(value) {
    if (line === QUESTION) setAnswer(value);
    if (line === LEVEL_QUESTION) setLevelAnswer(value);
    setIndex(index + 1);
  }

  function chooseAnalysis(level) {
    setAnalysis(level);
    setIndex(index + 1);
  }

  if (askingGoal) {
    return (
      <div style={styles.overlay}>
        <div style={styles.pageArea}>
          <GoalPage goal={DEFAULT_GOAL} onSave={goalChosen} />
        </div>
      </div>
    );
  }

  // Frend's box: moved, then shrunk around its middle. (React Native: translateX, translateY, scale)
  const frendMove = target ? 'translate(' + target.x + 'px, ' + target.y + 'px) scale(' + target.size + ')' : 'none';

  // This layer covers everything: the page and the footer under it can't be clicked during the tutorial.
  return (
    <div ref={layer} style={styles.overlay}>
      {/* Frend, drawn BEHIND the bubble (so he never hides the text).
          restart={index}: a new line = his animation starts again. */}
      <div
        style={{
          ...styles.frend,
          opacity: target ? 1 : 0,
          transform: frendMove,
          transition: placed ? 'transform 0.4s' : 'none',
        }}
      >
        <FrendSprite animation={animation} restart={index} flip={!!(target && target.flip)} />
      </div>

      <div style={styles.stage}>
        {/* A space that is ALWAYS here, above: the pictures appear inside it.
            So the bubble never moves. */}
        <div style={styles.spaceAbove}>
          {showBrain && <img src={brainImage} alt="How the brain learns" style={styles.picture} />}
          {showHowToStart && <img src={howToStartImage} alt="How to start" style={styles.picture} />}
        </div>

        <div ref={row} style={styles.row}>
          {/* Frend's usual spot (on the left): an empty box of his size. He is drawn elsewhere
              (see above), so he can also go to other places (footer icons, buttons...). */}
          <div ref={spot} style={styles.friendSpot} />

          <div style={styles.talk}>
            {/* The tail points at Frend when he is next to the bubble. Elsewhere: a plain bubble. */}
            <SpeechBubble text={text} tail={!target || target.nextToBubble ? 'left' : 'none'} />
            <div style={styles.buttons}>
              <RoundButton label="<" onPress={rewind} disabled={index === 0} />
              {/* Greyed (nothing happens) on the question, and during the 1.5 s wait */}
              <RoundButton label=">" onPress={next} disabled={isQuestion || !canGoOn} />
            </div>
            {/* y / n: lower, far from ">" (this space is always kept, so nothing moves) */}
            {line === ANALYSIS_QUESTION ? (
              <div style={styles.choices}>
                <ChoiceButton
                  label={'normal (' + LEVEL_TESTS.normal.minutes + 'm)'}
                  onPress={() => chooseAnalysis('normal')}
                />
                <ChoiceButton
                  label={'accurate (' + LEVEL_TESTS.accurate.minutes + 'm)'}
                  onPress={() => chooseAnalysis('accurate')}
                />
              </div>
            ) : (
              <div style={styles.answers}>
                {isQuestion && (
                  <>
                    <RoundButton label="y" onPress={answerYes} />
                    <RoundButton label="n" onPress={answerNo} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={styles.spaceBelow} />
      </div>
    </div>
  );
}

const styles = {
  // The whole tutorial: on top of the pages AND the footer (but not under the iPhone's notch and home bar).
  overlay: {
    position: 'absolute',
    top: 'env(safe-area-inset-top)',
    left: 0,
    right: 0,
    bottom: 'env(safe-area-inset-bottom)',
  },
  // The bubble part: everything except the footer.
  stage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: FOOTER_HEIGHT,
    padding: 20,
  },
  // The goal page, during the tutorial: same place as the stage, without its padding.
  pageArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: FOOTER_HEIGHT,
  },
  // The space above has a FIXED height (34% of the screen): the pictures keep the same size,
  // even when a long text makes the bubble taller. The space below takes what is left.
  spaceAbove: {
    height: '34%',
    justifyContent: 'flex-end', // the picture sits just above the bubble
  },
  spaceBelow: {
    flex: 1,
  },
  picture: {
    flex: 1, // all the room of the space above (brain diagram, "How to start")
    minHeight: 0,
    width: '100%',
    objectFit: 'contain', // React Native: resizeMode="contain"
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendSpot: {
    width: FREND_WIDTH,
    height: FREND_HEIGHT,
  },
  frend: {
    position: 'absolute', // moved with transform
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  talk: {
    flex: 1, // the bubble takes all the room the friend leaves
    minWidth: 0,
    marginLeft: 16, // room for the tail of the bubble
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  answers: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 60, // far enough under ">" to not tap "y" or "n" by accident
    height: 48, // the size of a button: kept even when empty
  },
  // The 2 long buttons, one above the other: 14 + 94 = the same room as y / n (60 + 48), so nothing moves.
  // (">" is greyed on a question: it can't be tapped by accident.)
  choices: {
    marginTop: 14,
    height: 94,
    justifyContent: 'space-between',
  },
  choice: {
    height: 44,
    borderWidth: 2,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  round: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  roundText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  off: {
    opacity: 0.3, // greyed out: nothing before the first line
  },
};
