import { useState, useRef, useEffect } from 'react';
import FrendSprite from './FrendSprite';
import SpeechBubble from './SpeechBubble';
import { FOOTER_HEIGHT } from './Footer';
import { listenToFrend } from '../logic/frendRadio';
import { SCREEN_WIDTH } from '../screen';
import {
  CHANCES,
  HELLO_LINES,
  PASSING_LINES,
  RANDOM_LINES,
  TAP_LINES,
  CONVERSATIONS,
  SAD_LINES,
  GOOD_SCORE_LINES,
  BAD_SCORE_LINES,
} from '../data/frend';

const SIZE = 0.45; // he's small when he walks around (1 = his size in the tutorial)
const FREND_WIDTH = 174 * SIZE; // the box of his drawing (FrendSprite at this size)
const FREND_HEIGHT = 262 * SIZE;
const GROUND = FOOTER_HEIGHT - 4; // his feet: on the top line of the footer
const BUBBLE_WIDTH = 170;
const MARGIN = 6; // the bubble never goes closer than this to the edges of the screen
const SPEED = 55; // pixels per second: he walks slowly
const JUMP_TIME = 500; // ms: his jump (the "frend-jumping" animation, in index.css)
const OUTSIDE_LEFT = -0.3; // a place outside the screen (0 = left edge, 1 = right edge)
const OUTSIDE_RIGHT = 1.3;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// true with this probability: chance(0.2) = true 1 time out of 5.
function chance(probability) {
  return Math.random() < probability;
}

// A side outside the screen, at random: left or right.
function anySide() {
  return chance(0.5) ? OUTSIDE_LEFT : OUTSIDE_RIGHT;
}

// The other side: left -> right, right -> left.
function otherSide(side) {
  return side === OUTSIDE_LEFT ? OUTSIDE_RIGHT : OUTSIDE_LEFT;
}

// The end of a visit: he walks away to `exit`... or, sometimes, he stays a while first
// (chill, he blinks every 5 s, about 25 s), and only then walks away.
function leave(exit, walking = 'chill') {
  const steps = [];
  if (chance(CHANCES.stay)) {
    for (let i = 0; i < 5; i++) steps.push({ animation: 'chill', say: '', wait: 5000 });
  }
  steps.push({ animation: walking, say: '', walkTo: exit });
  return steps;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Waits until the browser draws the next image of the screen (about 60 times per second).
function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

// Keeps a number between min and max: clamp(250, 0, 200) = 200.
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// ---------- The visits: what Frend does, step by step (like a little cutscene) ----------
// appearAt / walkTo: where his middle is, 0 = left edge of the screen, 1 = right edge.
// animation: what he does.  say: his bubble ('' = no bubble).  wait: ms.  jump: a little jump.

// You open the app: he's already there, he waves, then walks away.
function helloVisit() {
  return [
    { appearAt: 0.3, animation: 'greeting', say: pick(HELLO_LINES), wait: 3000 },
    { animation: 'chill', say: '', wait: 600 },
    ...leave(anySide()), // leaves by the left or the right (or stays a while first)
  ];
}

// What he says when he passes by: usually an encouragement, sometimes a random thing.
function passingLine() {
  return pick(chance(CHANCES.random) ? RANDOM_LINES : PASSING_LINES);
}

// He passes by: walks in, stops, says something (sometimes jumps), walks out. Sometimes sad.
// He comes from the left or the right (at random), and leaves by the other side.
function passingVisit() {
  const sad = chance(CHANCES.sad);
  const walking = sad ? 'sadf' : 'chill';
  const from = anySide();
  const steps = [
    { appearAt: from, animation: walking, say: '' },
    { walkTo: 0.3 + Math.random() * 0.4 }, // stops somewhere in the middle
    { animation: sad ? 'sadf' : 'talking', say: sad ? pick(SAD_LINES) : passingLine(), wait: 2500 },
  ];
  if (!sad && chance(CHANCES.jump)) {
    steps.push({ animation: 'cheese', say: '', jump: true, wait: 400 });
  }
  return [...steps, ...leave(otherSide(from), walking)];
}

// He comes to chill a bit somewhere, then goes back where he came from.
function chillVisit() {
  const spot = 0.15 + Math.random() * 0.7;
  const side = spot < 0.5 ? OUTSIDE_LEFT : OUTSIDE_RIGHT; // he comes from the closest side
  return [
    { appearAt: side, animation: 'chill', say: '' },
    { walkTo: spot },
    { animation: 'chill', say: chance(0.5) ? pick(RANDOM_LINES) : '', wait: 4000 },
    ...leave(side),
  ];
}

// After a test / a training: happy if the goal is reached, AHHH if not.
// alreadyHere: he's already on the screen -> he walks to the middle (instead of appearing there).
function scoreVisit(good, alreadyHere) {
  const arrive = alreadyHere ? { animation: 'chill', say: '', walkTo: 0.5 } : { appearAt: 0.5 };
  return [
    arrive,
    {
      animation: good ? pick(['greeting', 'cheese']) : 'AHHH',
      say: pick(good ? GOOD_SCORE_LINES : BAD_SCORE_LINES),
      wait: 3500,
    },
    { animation: good ? 'chill' : 'sadf', say: '', walkTo: anySide() },
  ];
}

// You tapped him: surprised, he says something (sometimes a little conversation), then leaves.
// exit: where he goes after (the closest side).
function pokeVisit(exit) {
  const lines = chance(CHANCES.conversation) ? pick(CONVERSATIONS) : [pick(TAP_LINES)];
  const steps = lines.map((line, number) => ({
    animation: number === 0 ? 'chocked' : 'talking',
    say: line,
    wait: 2300,
  }));
  steps.push({ animation: 'chill', say: '', walkTo: exit });
  return steps;
}

// ---------- Frend himself ----------

// Frend, alive: he walks on the footer, sometimes. Tap him: he talks.
// Only HE can be tapped: everywhere else, the taps go to the app (pointerEvents: 'none').
// paused: true = he hides (during the tutorial, he's already there).
// rare: true = not authorized in Parameters -> he comes 90% less.
export default function FrendCompanion({ paused, rare }) {
  const [visible, setVisible] = useState(false);
  const [animation, setAnimation] = useState('chill');
  const [text, setText] = useState(''); // his bubble ('' = no bubble)
  const [restart, setRestart] = useState(0); // +1 = his animation plays again
  const [x, setX] = useState(-500); // where he is (the left of his drawing), in pixels
  const [move, setMove] = useState(''); // '' | 'walking' (little steps) | 'jumping'
  const here = useRef(-500); // the same as x, but always up to date inside a visit
  const visitNumber = useRef(0); // a new visit cancels the old one
  const busy = useRef(false); // true during a visit
  const shown = visible && !paused;
  const width = SCREEN_WIDTH;

  // He listens to the radio (and listens again with fresh values when they change).
  useEffect(listen, [paused, rare, visible]);

  function listen() {
    return listenToFrend(react);
  }

  // Someone talked to him on the radio: maybe he comes.
  function react(message) {
    if (paused) return;
    const often = rare ? 0.1 : 1; // not authorized: 90% less (10% of the normal chance)
    if (message.type === 'open' && chance(CHANCES.hello * often)) startVisit(helloVisit());
    if (message.type === 'page' && !busy.current && chance(CHANCES.page * often)) {
      startVisit(chance(0.6) ? passingVisit() : chillVisit());
    }
    if (message.type === 'score' && chance(CHANCES.score * often)) {
      startVisit(scoreVisit(message.good, visible), !visible); // already there: he doesn't disappear first
    }
  }

  // You tapped him: he stops where he is, talks, then leaves by the closest side.
  function poke() {
    const onTheLeft = here.current + FREND_WIDTH / 2 < width / 2;
    startVisit(pokeVisit(onTheLeft ? OUTSIDE_LEFT : OUTSIDE_RIGHT), false);
  }

  // The tutorial starts: he stops what he's doing and hides.
  useEffect(hideIfPaused, [paused]);

  function hideIfPaused() {
    if (paused) stopVisit(true);
  }

  // Stops the current visit. hide: false = he stays visible where he is (for a new visit there).
  function stopVisit(hide) {
    visitNumber.current += 1; // the running visit sees it's not the current one anymore: it stops
    setMove('');
    busy.current = false;
    if (hide) setVisible(false);
  }

  // Plays the steps one after the other ("await" = wait until this step is finished).
  // hideFirst: false = he doesn't disappear before (the tap: he talks where he is).
  async function startVisit(steps, hideFirst = true) {
    stopVisit(hideFirst);
    const myNumber = visitNumber.current;
    busy.current = true;
    for (const step of steps) {
      if (visitNumber.current !== myNumber) return; // another visit started: this one stops here
      await doStep(step, myNumber);
    }
    if (visitNumber.current === myNumber) stopVisit(true); // finished: he's gone
  }

  async function doStep(step, myNumber) {
    if (step.animation) {
      setAnimation(step.animation);
      setRestart((old) => old + 1);
    }
    if (step.say !== undefined) setText(step.say);
    if (step.appearAt !== undefined) {
      moveNow(toPixels(step.appearAt));
      setVisible(true);
    }
    if (step.walkTo !== undefined) {
      setMove('walking');
      await walkTo(toPixels(step.walkTo), myNumber);
    }
    if (step.jump) {
      setMove('jumping');
      await wait(JUMP_TIME);
    }
    if (visitNumber.current === myNumber) setMove(''); // he stands still (if it's still his visit)
    if (step.wait) await wait(step.wait);
  }

  // 0 = his middle on the left edge, 1 = on the right edge -> the left of his drawing, in pixels.
  function toPixels(place) {
    return place * width - FREND_WIDTH / 2;
  }

  function moveNow(pixels) {
    here.current = pixels;
    setX(pixels);
  }

  // He walks there slowly: a tiny move at each image of the screen.
  // If the visit is stopped (a tap, a new visit), he stops right where he is.
  async function walkTo(pixels, myNumber) {
    const from = here.current;
    const duration = Math.max(1, (Math.abs(pixels - from) / SPEED) * 1000); // ms (never 0)
    const start = Date.now();
    while (visitNumber.current === myNumber) {
      const done = Math.min(1, (Date.now() - start) / duration); // 0 = just left, 1 = arrived
      moveNow(from + (pixels - from) * done);
      if (done === 1) return;
      await nextFrame();
    }
  }

  // The bubble follows him left-right (not his jumps), centered above him,
  // but stays inside the screen: when he's near an edge, it stops at MARGIN.
  const center = FREND_WIDTH / 2 - BUBBLE_WIDTH / 2; // bubble left = his left + this
  const maxLeft = Math.max(MARGIN, width - BUBBLE_WIDTH - MARGIN);
  const bubbleX = clamp(x + center, MARGIN, maxLeft);

  return (
    <div style={styles.layer}>
      {shown && text !== '' && (
        <div style={{ ...styles.bubble, transform: 'translateX(' + bubbleX + 'px)' }}>
          <SpeechBubble text={text} tail="bottom" small />
        </div>
      )}

      {/* Always here (only invisible): his drawings stay loaded, so he never blinks when he comes. */}
      <div
        style={{
          ...styles.frend,
          opacity: shown ? 1 : 0,
          pointerEvents: shown ? 'auto' : 'none',
          transform: 'translateX(' + x + 'px)',
        }}
      >
        {/* className: his little steps or his jump (animations in index.css) */}
        <button onClick={poke} disabled={!shown} aria-label="Frend" className={move ? 'frend-' + move : ''}>
          <FrendSprite animation={animation} restart={restart} size={SIZE} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  // The whole app (pages + footer), above the iPhone's home bar.
  // pointerEvents 'none': the taps go through it, to the app (only Frend catches them).
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 'env(safe-area-inset-bottom)',
    pointerEvents: 'none',
  },
  // Frend, standing on the top line of the footer (his "ground").
  frend: {
    position: 'absolute',
    left: 0,
    bottom: GROUND,
  },
  // His bubble, above his head.
  bubble: {
    position: 'absolute',
    left: 0,
    bottom: GROUND + FREND_HEIGHT + 12,
    width: BUBBLE_WIDTH,
    alignItems: 'center',
  },
};
