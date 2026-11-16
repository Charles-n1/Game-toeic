// Generated questions: prepositions (time, place, and the fixed words + preposition).
import { buildQuestions, pick, capital } from './tools';
import { PEOPLE, ORGS, ACTIONS, WEEKDAYS, MONTHS, YEARS, DURATIONS } from './words';

const EVENTS = ['the meeting', 'the workshop', 'the training session', 'the press conference', 'the job fair', 'the board meeting', 'the product launch', 'the safety inspection', 'the awards ceremony', 'the staff party'];
const CLOCK = ['9 a.m.', '10:30 a.m.', 'noon', '2 p.m.', '4:15 p.m.', '7 p.m.', 'midnight', '8:45 a.m.'];
const FLOORS = ['second', 'third', 'fourth', 'fifth', 'top', 'ground'];
const ROOMS = ['The cafeteria', 'The conference room', 'The accounting department', 'The fitness center', 'The supply room', 'The reception area', 'The staff lounge', 'The IT help desk'];
const DESKS = ['the front desk', 'the reception desk', 'the security office', 'the main entrance', 'the information counter'];

// Fixed expressions: the words before the blank, the preposition, and the end of the sentence.
const FIXED = [
  { before: 'is responsible', prep: 'for', after: 'the monthly budget', wrong: ['of', 'at', 'to'] },
  { before: 'is in charge', prep: 'of', after: 'the new marketing campaign', wrong: ['for', 'at', 'on'] },
  { before: 'is very familiar', prep: 'with', after: 'the new accounting software', wrong: ['of', 'at', 'for'] },
  { before: 'is not eligible', prep: 'for', after: 'the travel allowance', wrong: ['of', 'at', 'with'] },
  { before: 'was not aware', prep: 'of', after: 'the change in the schedule', wrong: ['for', 'at', 'with'] },
  { before: 'has applied', prep: 'for', after: 'the position of sales manager', wrong: ['to', 'at', 'of'] },
  { before: 'specializes', prep: 'in', after: 'international tax law', wrong: ['on', 'at', 'for'] },
  { before: 'contributed greatly', prep: 'to', after: 'the success of the project', wrong: ['for', 'at', 'with'] },
  { before: 'participated', prep: 'in', after: 'the annual sales conference', wrong: ['on', 'at', 'to'] },
  { before: 'relies heavily', prep: 'on', after: 'the support of the IT team', wrong: ['in', 'at', 'to'] },
  { before: 'responded quickly', prep: 'to', after: 'the customer complaints', wrong: ['at', 'for', 'of'] },
  { before: 'spoke', prep: 'on behalf of', after: 'the whole department', wrong: ['in behalf for', 'on behalf with', 'at behalf of'] },
  { before: 'acted', prep: 'in accordance with', after: 'the company policy', wrong: ['in accordance of', 'in accordance to', 'on accordance with'] },
  { before: 'is interested', prep: 'in', after: 'the new training program', wrong: ['on', 'at', 'for'] },
  { before: 'has subscribed', prep: 'to', after: 'several business magazines', wrong: ['at', 'for', 'of'] },
  { before: 'was satisfied', prep: 'with', after: 'the quality of the service', wrong: ['of', 'at', 'on'] },
  { before: 'is committed', prep: 'to', after: 'customer satisfaction', wrong: ['for', 'at', 'with'] },
  { before: 'complained', prep: 'about', after: 'the noise in the office', wrong: ['at', 'for', 'on'] },
  { before: 'apologized', prep: 'for', after: 'the late delivery', wrong: ['of', 'at', 'about to'] },
  { before: 'agreed', prep: 'with', after: 'the director on most points', wrong: ['at', 'of', 'for'] },
];
const FIXED_ORGS = [
  { before: 'must comply', prep: 'with', after: 'the new safety regulations', wrong: ['to', 'at', 'of'] },
  { before: 'consists', prep: 'of', after: 'five separate departments', wrong: ['in', 'with', 'from'] },
  { before: 'is located next', key: 'next', prep: 'to', after: 'the central train station', wrong: ['of', 'at', 'from'] },
  { before: 'closed early', prep: 'due to', after: 'the heavy snow', wrong: ['because', 'although', 'despite of'] },
  { before: 'invested heavily', prep: 'in', after: 'renewable energy', wrong: ['on', 'at', 'to'] },
  { before: 'is known', prep: 'for', after: 'its excellent customer service', wrong: ['of', 'at', 'with'] },
  { before: 'depends', prep: 'on', after: 'a small number of suppliers', wrong: ['of', 'at', 'to'] },
];

// The word that asks for the preposition: "relies heavily" -> "relies" (the adverbs are skipped).
const ADVERBS = ['heavily', 'greatly', 'quickly', 'early', 'very', 'not', 'next'];
function keyWordOf(item) {
  if (item.key) return item.key;
  const words = item.before.split(' ').filter((word) => !ADVERBS.includes(word) && word !== 'is' && word !== 'was' && word !== 'has' && word !== 'must');
  return words[words.length - 1];
}

function person(random) {
  return capital(pick(random, PEOPLE));
}

// "The workshop will start ___ 9 a.m." -> at
function clockTime(random) {
  return {
    difficulty: 'normal',
    question: capital(pick(random, EVENTS)) + ' will start ___ ' + pick(random, CLOCK) + '.',
    good: 'at',
    wrong: ['on', 'in', 'for'],
    justification: '"At" + a precise time of the clock: at 9 a.m., at noon.',
  };
}

// "The workshop will take place ___ Monday." -> on
function dayOfWeek(random) {
  return {
    difficulty: 'normal',
    question: capital(pick(random, EVENTS)) + ' will take place ___ ' + pick(random, WEEKDAYS) + ' afternoon.',
    good: 'on',
    wrong: ['in', 'at', 'since'],
    justification: '"On" + a day: on Monday, on Monday afternoon.',
  };
}

// "The workshop will take place ___ March." -> in
function month(random) {
  return {
    difficulty: 'normal',
    question: capital(pick(random, EVENTS)) + ' will take place ___ ' + pick(random, MONTHS) + ' this year.',
    good: 'in',
    wrong: ['on', 'at', 'since'],
    justification: '"In" + a month, a year or a season: in March, in 2025.',
  };
}

// "Ms. Tanaka has worked at the bank ___ 2019." -> since  /  "___ six years" -> for
function sinceOrFor(random) {
  const isStart = random() < 0.5;
  const time = isStart ? pick(random, YEARS) : pick(random, DURATIONS);
  return {
    difficulty: 'normal',
    question: person(random) + ' has worked at ' + pick(random, ORGS) + ' ___ ' + time + '.',
    good: isStart ? 'since' : 'for',
    wrong: isStart ? ['for', 'during', 'at'] : ['since', 'during', 'at'],
    justification: '"Since" + a starting point (since 2019). "For" + a duration (for six years).',
  };
}

// "Please submit the report ___ Friday at the latest." -> by
function deadline(random) {
  const action = pick(random, ACTIONS);
  return {
    difficulty: 'hard',
    question: 'Please ' + action.base + ' ' + action.object + ' ___ ' + pick(random, WEEKDAYS) + ' at the latest.',
    good: 'by',
    wrong: ['until', 'since', 'at'],
    justification: '"By" = a deadline (no later than). "Until" = an action that continues up to a moment.',
  };
}

// "The store will remain closed ___ Friday." -> until
function lastingUntil(random) {
  const places = ['The store', 'The museum', 'The east wing', 'The parking lot', 'The cafeteria', 'The pool', 'The north entrance'];
  return {
    difficulty: 'hard',
    question: pick(random, places) + ' will remain closed ___ ' + pick(random, WEEKDAYS) + ' for repairs.',
    good: 'until',
    wrong: ['by', 'since', 'at'],
    justification: '"Until" = a situation that continues up to a moment (remain closed until Friday). "By" = a deadline.',
  };
}

// "Please turn off your phones ___ the workshop." -> during
function duringEvent(random) {
  return {
    difficulty: 'normal',
    question: 'Please turn off your phones ___ ' + pick(random, EVENTS) + '.',
    good: 'during',
    wrong: ['while', 'for', 'since'],
    justification: '"During" + a noun (during the meeting). "While" + a clause (while we are meeting).',
  };
}

// "The cafeteria is ___ the third floor." -> on
function floor(random) {
  return {
    difficulty: 'normal',
    question: pick(random, ROOMS) + ' is located ___ the ' + pick(random, FLOORS) + ' floor.',
    good: 'on',
    wrong: ['in', 'at', 'to'],
    justification: '"On" + a floor: on the third floor.',
  };
}

// "Visitors must sign in ___ the front desk." -> at
function atPoint(random) {
  return {
    difficulty: 'normal',
    question: 'All visitors must sign in ___ ' + pick(random, DESKS) + ' before going upstairs.',
    good: 'at',
    wrong: ['on', 'to', 'of'],
    justification: '"At" + a precise point or place (at the front desk, at the entrance).',
  };
}

// "Ms. Tanaka is responsible ___ the monthly budget." -> for
function fixedPerson(random) {
  const item = pick(random, FIXED);
  return {
    difficulty: 'hard',
    question: person(random) + ' ' + item.before + ' ___ ' + item.after + '.',
    good: item.prep,
    wrong: item.wrong,
    justification: 'A fixed expression: "' + keyWordOf(item) + ' ' + item.prep + '".',
  };
}

// "The factory must comply ___ the new safety regulations." -> with
function fixedOrg(random) {
  const item = pick(random, FIXED_ORGS);
  return {
    difficulty: 'hard',
    question: capital(pick(random, ORGS)) + ' ' + item.before + ' ___ ' + item.after + '.',
    good: item.prep,
    wrong: item.wrong,
    justification: 'A fixed expression: "' + keyWordOf(item) + ' ' + item.prep + '".',
  };
}

// "Refunds are processed ___ ten business days." -> within
function withinDays(random) {
  const numbers = ['five', 'seven', 'ten', 'fourteen', 'thirty'];
  const things = ['Refunds are processed', 'Most orders are shipped', 'Complaints are answered', 'Repairs are completed', 'Applications are reviewed'];
  return {
    difficulty: 'extreme',
    question: pick(random, things) + ' ___ ' + pick(random, numbers) + ' business days of the request.',
    good: 'within',
    wrong: ['since', 'during', 'until'],
    justification: '"Within" + a period = before the end of it (within ten days of the request).',
  };
}

export function makePrepositions(count) {
  return buildQuestions('prepositions', count, [fixedPerson, clockTime, sinceOrFor, deadline, fixedOrg, dayOfWeek, month, lastingUntil, fixedPerson, duringEvent, floor, atPoint, withinDays], 202);
}
