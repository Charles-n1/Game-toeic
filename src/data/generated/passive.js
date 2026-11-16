// Generated questions: active or passive voice.
import { buildQuestions, pick, capital } from './tools';
import { PEOPLE, THINGS, PAST_TIMES, FUTURE_TIMES, HABIT_TIMES, actionOf } from './words';

// A thing and one action that fits it: { thing, action }.
function thingAndAction(random) {
  const thing = pick(random, THINGS);
  return { thing: thing, action: actionOf(pick(random, thing.verbs)) };
}

// "The contract ___ by Ms. Tanaka yesterday." -> was signed
function pastPassive(random) {
  const { thing, action } = thingAndAction(random);
  const be = thing.plural ? 'were' : 'was';
  return {
    difficulty: 'normal',
    question: 'The ' + thing.noun + ' ___ by ' + pick(random, PEOPLE) + ' ' + pick(random, PAST_TIMES) + '.',
    good: be + ' ' + action.pp,
    wrong: [action.past === action.pp ? action.third : action.past, be + ' ' + action.ing, (thing.plural ? 'have ' : 'has ') + action.pp],
    justification: 'The ' + thing.noun + ' receive' + (thing.plural ? '' : 's') + ' the action ("by" + who did it): passive, ' + be + ' + past participle.',
  };
}

// "The invoices ___ every Friday." -> are checked
function presentPassive(random) {
  const { thing, action } = thingAndAction(random);
  const be = thing.plural ? 'are' : 'is';
  return {
    difficulty: 'normal',
    question: 'The ' + thing.noun + ' ___ ' + pick(random, HABIT_TIMES) + ' by the office staff.',
    good: be + ' ' + action.pp,
    wrong: [thing.plural ? action.base : action.third, be + ' ' + action.ing, 'have ' + action.pp],
    justification: 'Something done regularly to the ' + thing.noun + ': present passive, ' + be + ' + past participle.',
  };
}

// "The samples ___ next week." -> will be delivered
function futurePassive(random) {
  const { thing, action } = thingAndAction(random);
  return {
    difficulty: 'normal',
    question: 'The ' + thing.noun + ' ___ ' + pick(random, FUTURE_TIMES) + ', according to the schedule.',
    good: 'will be ' + action.pp,
    wrong: ['will ' + action.base, 'will be ' + action.ing, (thing.plural ? 'have ' : 'has ') + action.pp],
    justification: 'The ' + thing.noun + ' can not ' + action.base + ' by ' + (thing.plural ? 'themselves' : 'itself') + ': future passive, will be + past participle.',
  };
}

// "The report has already ___." -> been revised
function perfectPassive(random) {
  const { thing, action } = thingAndAction(random);
  return {
    difficulty: 'hard',
    question: 'The ' + thing.noun + ' ' + (thing.plural ? 'have' : 'has') + ' already ___, so there is nothing left to do.',
    good: 'been ' + action.pp,
    wrong: [action.ing, 'be ' + action.pp, 'being ' + action.pp],
    justification: 'Present perfect passive: has/have + been + past participle (has already been ' + action.pp + ').',
  };
}

// "The contract must ___ before Friday." -> be signed
function modalPassive(random) {
  const { thing, action } = thingAndAction(random);
  const modal = pick(random, ['must', 'should', 'can', 'needs to']);
  return {
    difficulty: 'hard',
    question: 'The ' + thing.noun + ' ' + modal + ' ___ before the end of the week.',
    good: 'be ' + action.pp,
    wrong: [action.base, 'being ' + action.pp, 'been ' + action.pp],
    justification: 'After "' + modal + '", a passive is be + past participle: ' + modal + ' be ' + action.pp + '.',
  };
}

// "Ms. Tanaka ___ the contract yesterday." -> signed (active: she did it)
function pastActive(random) {
  const { thing, action } = thingAndAction(random);
  return {
    difficulty: 'normal',
    question: capital(pick(random, PEOPLE)) + ' ___ the ' + thing.noun + ' ' + pick(random, PAST_TIMES) + '.',
    good: action.past,
    wrong: ['was ' + action.pp, 'is ' + action.pp, 'been ' + action.pp],
    justification: 'The person does the action, and there is an object (the ' + thing.noun + '): active voice, ' + action.past + '.',
  };
}

// "The project is being ___ by a consultant right now." -> reviewed (continuous passive)
function continuousPassive(random) {
  const { thing, action } = thingAndAction(random);
  return {
    difficulty: 'extreme',
    question: 'At the moment, the ' + thing.noun + ' ' + (thing.plural ? 'are' : 'is') + ' being ___ by ' + pick(random, PEOPLE) + '.',
    good: action.pp,
    wrong: [action.ing, action.base, 'be ' + action.pp],
    justification: 'Present continuous passive: is/are being + past participle (being ' + action.pp + ').',
  };
}

// "Having been ___ twice, the report was finally approved." -> revised
function havingBeen(random) {
  const thing = pick(random, THINGS.filter((item) => item.verbs.includes('revise') || item.verbs.includes('review') || item.verbs.includes('test')));
  const action = actionOf(pick(random, thing.verbs.filter((verb) => ['revise', 'review', 'test'].includes(verb))));
  return {
    difficulty: 'extreme',
    question: 'Having been ___ twice, the ' + thing.noun + ' ' + (thing.plural ? 'were' : 'was') + ' finally accepted by ' + pick(random, PEOPLE) + '.',
    good: action.pp,
    wrong: [action.ing, action.base, 'to ' + action.base],
    justification: '"Having been" + past participle: the ' + thing.noun + ' received the action before (passive).',
  };
}

export function makePassive(count) {
  return buildQuestions('passive', count, [pastPassive, presentPassive, futurePassive, pastActive, perfectPassive, modalPassive, pastPassive, continuousPassive, havingBeen], 303);
}
