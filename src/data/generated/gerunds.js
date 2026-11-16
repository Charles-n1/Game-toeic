// Generated questions: gerunds (-ing) or infinitives (to + verb).
import { buildQuestions, pick, fill, capital } from './tools';
import { PEOPLE, GROUPS, ACTIONS } from './words';

// Verbs always followed by -ing.
const ING_VERBS = ['avoided', 'considered', 'suggested', 'recommended', 'finished', 'postponed', 'delayed', 'discussed', 'kept', 'enjoyed', 'denied', 'resumed'];
// Verbs always followed by to + verb.
const TO_VERBS = ['agreed', 'decided', 'planned', 'promised', 'refused', 'offered', 'managed', 'failed', 'hoped', 'arranged', 'hesitated', 'chose', 'wanted', 'needed', 'expected'];
// Words + preposition: the preposition is followed by -ing.
const PREPOSITIONS = [
  { words: 'is responsible for', rule: '"Responsible for" + -ing' },
  { words: 'is interested in', rule: '"Interested in" + -ing' },
  { words: 'is committed to', rule: '"Committed to": "to" is a preposition here, so -ing follows' },
  { words: 'is looking forward to', rule: '"Look forward to": "to" is a preposition, so -ing follows' },
  { words: 'is used to', rule: '"Be used to" (= be accustomed to) + -ing' },
  { words: 'is in charge of', rule: '"In charge of" + -ing' },
  { words: 'is capable of', rule: '"Capable of" + -ing' },
  { words: 'insisted on', rule: '"Insist on" + -ing' },
  { words: 'succeeded in', rule: '"Succeed in" + -ing' },
  { words: 'apologized for', rule: '"Apologize for" + -ing' },
  { words: 'objected to', rule: '"Object to": "to" is a preposition, so -ing follows' },
  { words: 'was praised for', rule: '"Praised for" + -ing' },
];
const TIME_WORDS = ['before', 'after', 'without', 'instead of'];
const CAUSERS = ['made', 'let', 'had'];

function anyone(random) {
  return capital(pick(random, random() < 0.75 ? PEOPLE : GROUPS));
}

// "Ms. Tanaka avoided ___ the contract." -> reviewing
function afterIngVerb(random) {
  const action = pick(random, ACTIONS);
  const verb = pick(random, ING_VERBS);
  return {
    difficulty: 'normal',
    question: fill('{P} {verb} ___ {obj} this week.', { P: anyone(random), verb: verb, obj: action.object }),
    good: action.ing,
    wrong: ['to ' + action.base, action.base, action.past],
    justification: '"' + verb + '" is followed by a gerund (-ing): ' + verb + ' ' + action.ing + '.',
  };
}

// "Ms. Tanaka agreed ___ the contract." -> to review
function afterToVerb(random) {
  const action = pick(random, ACTIONS);
  const verb = pick(random, TO_VERBS);
  return {
    difficulty: 'normal',
    question: fill('{P} {verb} ___ {obj} this week.', { P: anyone(random), verb: verb, obj: action.object }),
    good: 'to ' + action.base,
    wrong: [action.ing, action.base, action.past],
    justification: '"' + verb + '" is followed by to + verb: ' + verb + ' to ' + action.base + '.',
  };
}

// "Mr. Kim is responsible for ___ the budget." -> preparing
function afterPreposition(random) {
  const action = pick(random, ACTIONS);
  const prep = pick(random, PREPOSITIONS);
  const person = capital(pick(random, PEOPLE));
  return {
    difficulty: 'hard',
    question: person + ' ' + prep.words + ' ___ ' + action.object + '.',
    good: action.ing,
    wrong: [action.base, 'to ' + action.base, action.pp === action.past ? action.third : action.pp],
    justification: prep.rule + ': ' + prep.words + ' ' + action.ing + '.',
  };
}

// "Please read the guide before ___ the software." -> installing
function afterTimeWord(random) {
  const action = pick(random, ACTIONS);
  const word = pick(random, TIME_WORDS);
  const person = capital(pick(random, PEOPLE));
  return {
    difficulty: 'normal',
    question: person + ' called the client ' + word + ' ___ ' + action.object + '.',
    good: action.ing,
    wrong: [action.base, 'to ' + action.base, action.third],
    justification: 'After a preposition like "' + word + '", use the -ing form: ' + word + ' ' + action.ing + '.',
  };
}

// "The manager made the interns ___ the report again." -> check
function afterCauser(random) {
  const action = pick(random, ACTIONS);
  const verb = pick(random, CAUSERS);
  return {
    difficulty: 'hard',
    question: capital(pick(random, PEOPLE)) + ' ' + verb + ' ' + pick(random, GROUPS) + ' ___ ' + action.object + ' again.',
    good: action.base,
    wrong: ['to ' + action.base, action.ing, action.third],
    justification: '"' + verb + ' someone" is followed by the base form, without "to": ' + verb + ' them ' + action.base + '.',
  };
}

// "Please remember ___ the report before you leave." -> to submit  /  "She remembers ___ it last week." -> submitting
function rememberOrForget(random) {
  const action = pick(random, ACTIONS);
  const isDuty = random() < 0.5;
  if (isDuty) {
    return {
      difficulty: 'extreme',
      question: 'Please remember ___ ' + action.object + ' before you leave tonight.',
      good: 'to ' + action.base,
      wrong: [action.ing, action.base, action.pp === action.past ? action.third : action.pp],
      justification: '"Remember to do" = do not forget a task still to do. "Remember doing" = recall a past action.',
    };
  }
  return {
    difficulty: 'extreme',
    question: capital(pick(random, PEOPLE)) + ' clearly remembers ___ ' + action.object + ' last week, so it must be in the files.',
    good: action.ing,
    wrong: ['to ' + action.base, action.base, action.third],
    justification: '"Remember doing" = recall something done in the past (last week). "Remember to do" = a task still to do.',
  };
}

// "We would rather ___ the meeting than cancel it." -> reschedule
function wouldRather(random) {
  const action = pick(random, ACTIONS);
  return {
    difficulty: 'hard',
    question: capital(pick(random, GROUPS)) + ' would rather ___ ' + action.object + ' today than wait until next week.',
    good: action.base,
    wrong: ['to ' + action.base, action.ing, action.past],
    justification: '"Would rather" is followed by the base form, without "to": would rather ' + action.base + '.',
  };
}

export function makeGerunds(count) {
  return buildQuestions('gerunds', count, [afterIngVerb, afterToVerb, afterPreposition, afterTimeWord, afterIngVerb, afterToVerb, afterCauser, rememberOrForget, wouldRather], 101);
}
