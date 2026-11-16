// Generated questions: verb tenses (the time words tell which tense to use).
import { buildQuestions, pick, capital } from './tools';
import { PEOPLE, ORGS, ACTIONS, PAST_TIMES, FUTURE_TIMES, YEARS, DURATIONS } from './words';

function person(random) {
  return capital(pick(random, PEOPLE));
}

// "Ms. Tanaka ___ the report yesterday." -> submitted
function pastSimple(random) {
  const action = pick(random, ACTIONS);
  const time = pick(random, PAST_TIMES);
  return {
    difficulty: 'normal',
    question: person(random) + ' ___ ' + action.object + ' ' + time + '.',
    good: action.past,
    wrong: ['has ' + action.pp, 'will ' + action.base, action.third],
    justification: '"' + time + '" = a finished time in the past: past simple (' + action.past + ').',
  };
}

// "Ms. Tanaka ___ the report next week." -> will submit
function future(random) {
  const action = pick(random, ACTIONS);
  const time = pick(random, FUTURE_TIMES);
  return {
    difficulty: 'normal',
    question: person(random) + ' ___ ' + action.object + ' ' + time + '.',
    good: 'will ' + action.base,
    wrong: [action.past, 'has ' + action.pp, 'had ' + action.pp],
    justification: '"' + time + '" = the future: will + verb (will ' + action.base + ').',
  };
}

// "Ms. Tanaka ___ the report right now." -> is checking
function presentContinuous(random) {
  const action = pick(random, ACTIONS);
  const now = pick(random, ['right now', 'at the moment', 'as we speak', 'at present']);
  return {
    difficulty: 'normal',
    question: person(random) + ' ___ ' + action.object + ' ' + now + ', so please wait a few minutes.',
    good: 'is ' + action.ing,
    wrong: [action.past, 'has ' + action.pp, 'will have ' + action.pp],
    justification: '"' + now + '" = happening now: present continuous (is ' + action.ing + ').',
  };
}

// "Ms. Tanaka has worked at the bank since 2019." -> has worked
function sinceOrFor(random) {
  const time = random() < 0.5 ? 'since ' + pick(random, YEARS) : 'for ' + pick(random, DURATIONS);
  return {
    difficulty: 'hard',
    question: person(random) + ' ___ at ' + pick(random, ORGS) + ' ' + time + '.',
    good: 'has worked',
    wrong: ['works', 'will work', 'is working'],
    justification: '"' + time + '" = from the past until now: present perfect (has worked).',
  };
}

// "Ms. Tanaka ___ the report when the power went out." -> was checking
function pastContinuous(random) {
  const action = pick(random, ACTIONS);
  const event = pick(random, ['when the power went out', 'when the fire alarm rang', 'when the client called', 'when the director arrived', 'when the computer crashed']);
  return {
    difficulty: 'hard',
    question: person(random) + ' ___ ' + action.object + ' ' + event + '.',
    good: 'was ' + action.ing,
    wrong: ['is ' + action.ing, 'has ' + action.pp, 'will ' + action.base],
    justification: 'An action in progress in the past, cut by a short event: past continuous (was ' + action.ing + ').',
  };
}

// "By the time the meeting started, Ms. Tanaka ___ the report." -> had submitted
function pastPerfect(random) {
  const action = pick(random, ACTIONS);
  return {
    difficulty: 'extreme',
    question: 'By the time the meeting started, ' + pick(random, PEOPLE) + ' ___ already ' + action.pp + ' ' + action.object + '.',
    good: 'had',
    wrong: ['has', 'will have', 'is'],
    justification: '"By the time" + a past event: the action was finished before it, so past perfect (had ' + action.pp + ').',
  };
}

// "By the end of next month, Ms. Tanaka ___ the report." -> will have submitted
function futurePerfect(random) {
  const action = pick(random, ACTIONS);
  const deadline = pick(random, ['By the end of next month', 'By next Friday', 'By the time you arrive', 'By the end of the year', 'By this time tomorrow']);
  return {
    difficulty: 'extreme',
    question: deadline + ', ' + pick(random, PEOPLE) + ' ___ ' + action.object + '.',
    good: 'will have ' + action.pp,
    wrong: ['has ' + action.pp, 'had ' + action.pp, action.past],
    justification: '"' + deadline + '" (future) + finished before then: future perfect (will have ' + action.pp + ').',
  };
}

// "If the shipment arrives on time, we ___ the order tomorrow." -> will confirm
function firstConditional(random) {
  const action = pick(random, ACTIONS);
  const condition = pick(random, ['If the director agrees', 'If the shipment arrives on time', 'If the weather is good', 'If the client approves the budget', 'As soon as the room is free']);
  return {
    difficulty: 'hard',
    question: condition + ', ' + pick(random, PEOPLE) + ' ___ ' + action.object + ' tomorrow.',
    good: 'will ' + action.base,
    wrong: [action.past, 'would have ' + action.pp, 'had ' + action.pp],
    justification: '"' + condition.split(' ')[0] + '" + present, then the result in the future: will ' + action.base + '.',
  };
}

// "Ms. Tanaka ___ the report already." -> has submitted (no time in the past: present perfect)
function alreadyYet(random) {
  const action = pick(random, ACTIONS);
  const word = pick(random, ['already', 'just', 'recently']);
  return {
    difficulty: 'normal',
    question: person(random) + ' has ' + word + ' ___ ' + action.object + ', so we can move on.',
    good: action.pp,
    wrong: action.pp === action.past ? [action.base, action.ing, action.third] : [action.past, action.base, action.ing],
    justification: '"Has ' + word + '" + past participle: present perfect (has ' + word + ' ' + action.pp + ').',
  };
}

export function makeVerbTenses(count) {
  return buildQuestions('verbTenses', count, [pastSimple, future, presentContinuous, sinceOrFor, alreadyYet, pastContinuous, firstConditional, pastPerfect, futurePerfect], 707);
}
