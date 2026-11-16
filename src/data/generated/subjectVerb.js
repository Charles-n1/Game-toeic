// Generated questions: subject-verb agreement.
import { buildQuestions, pick, capital } from './tools';
import { PEOPLE, GROUPS, ACTIONS, HABIT_TIMES } from './words';

const PLURAL_NOUNS = ['employees', 'applicants', 'customers', 'visitors', 'participants', 'students', 'guests', 'drivers', 'members', 'suppliers'];
const PLACES = ['department', 'office', 'team', 'branch', 'company', 'workshop'];
const ADJECTIVES = ['available', 'ready', 'responsible for the budget', 'invited to the dinner', 'expected at the meeting', 'aware of the new rules'];

// "Ms. Tanaka ___ the invoices every Friday." -> checks
function singularHabit(random) {
  const action = pick(random, ACTIONS);
  return {
    difficulty: 'normal',
    question: capital(pick(random, PEOPLE)) + ' ___ ' + action.object + ' ' + pick(random, HABIT_TIMES) + '.',
    good: action.third,
    wrong: [action.base, action.ing, 'are ' + action.ing],
    justification: 'A singular subject (he / she) in the present simple: the verb takes -s (' + action.third + ').',
  };
}

// "The interns ___ the invoices every Friday." -> check
function pluralHabit(random) {
  const action = pick(random, ACTIONS);
  return {
    difficulty: 'normal',
    question: capital(pick(random, GROUPS)) + ' ___ ' + action.object + ' ' + pick(random, HABIT_TIMES) + '.',
    good: action.base,
    wrong: [action.third, 'is ' + action.ing, 'has ' + action.pp],
    justification: 'A plural subject (they) in the present simple: no -s (' + action.base + ').',
  };
}

// "Each of the employees ___ invited to the dinner." -> is
function eachOf(random) {
  const word = pick(random, ['Each of the', 'Every one of the', 'One of the', 'Neither of the']);
  return {
    difficulty: 'hard',
    question: word + ' ' + pick(random, PLURAL_NOUNS) + ' ___ ' + pick(random, ADJECTIVES) + '.',
    good: 'is',
    wrong: ['are', 'be', 'were being'],
    justification: '"' + word + '" + plural noun: the subject is ONE of them, so the verb is singular (is).',
  };
}

// "The list of the applicants ___ changed." -> has (the subject is "the list")
function headNoun(random) {
  const heads = [
    { words: 'The list of the', head: 'list' },
    { words: 'The schedule for the', head: 'schedule' },
    { words: 'The opinion of the', head: 'opinion' },
    { words: 'The report on the', head: 'report' },
    { words: 'The number of', head: 'number' },
  ];
  const head = pick(random, heads);
  const noun = pick(random, PLURAL_NOUNS);
  return {
    difficulty: 'hard',
    question: head.words + ' ' + noun + ' ___ changed since last year.',
    good: 'has',
    wrong: ['have', 'having', 'are'],
    justification: 'The real subject is "' + head.head + '" (singular), not "' + noun + '": has.',
  };
}

// "A number of the employees ___ asked for more training." -> have
function aNumberOf(random) {
  return {
    difficulty: 'extreme',
    question: 'A number of ' + pick(random, PLURAL_NOUNS) + ' ___ asked for more information about the ' + pick(random, ['new policy', 'schedule', 'prices', 'event', 'changes']) + '.',
    good: 'have',
    wrong: ['has', 'is', 'having'],
    justification: '"A number of" = several (plural): have. ("The number of" = one number: has.)',
  };
}

// "Neither the manager nor the interns ___ available." -> are (the nearest subject)
function neitherNor(random) {
  const singular = pick(random, PEOPLE);
  const plural = pick(random, GROUPS);
  const pluralLast = random() < 0.5;
  const word = pick(random, ['Neither', 'Either']);
  const link = word === 'Neither' ? 'nor' : 'or';
  const subject = pluralLast ? singular + ' ' + link + ' ' + plural : plural + ' ' + link + ' ' + singular;
  return {
    difficulty: 'extreme',
    question: word + ' ' + subject + ' ___ ' + pick(random, ADJECTIVES) + ' this week.',
    good: pluralLast ? 'are' : 'is',
    wrong: pluralLast ? ['is', 'be', 'was being'] : ['are', 'be', 'were being'],
    justification: 'With "' + word.toLowerCase() + ' ... ' + link + '", the verb agrees with the NEAREST subject (' + (pluralLast ? 'plural: are' : 'singular: is') + ').',
  };
}

// "Everyone in the office ___ to attend." -> needs
function everyone(random) {
  const word = pick(random, ['Everyone', 'Everybody', 'Nobody', 'Someone']);
  const action = pick(random, ACTIONS);
  return {
    difficulty: 'normal',
    question: word + ' in the ' + pick(random, PLACES) + ' ___ to ' + action.base + ' ' + action.object + ' today.',
    good: pick(random, ['wants', 'needs', 'has']),
    wrong: ['want', 'need', 'have'],
    justification: '"' + word + '" is singular: the verb takes -s.',
  };
}

// "There ___ several visitors in the lobby." -> are
function thereIsAre(random) {
  const plural = random() < 0.5;
  const what = plural ? pick(random, ['several', 'many', 'a few', 'three', 'some']) + ' ' + pick(random, PLURAL_NOUNS) : pick(random, ['a visitor', 'a package', 'a problem with the printer', 'a message for you', 'an empty seat']);
  return {
    difficulty: 'normal',
    question: 'There ___ ' + what + ' in the ' + pick(random, ['lobby', 'waiting room', 'main hall', 'reception area']) + ' right now.',
    good: plural ? 'are' : 'is',
    wrong: plural ? ['is', 'be', 'has'] : ['are', 'be', 'have'],
    justification: '"There is" + a singular noun, "there are" + a plural noun.',
  };
}

// "Ms. Tanaka, along with the interns, ___ attending." -> is
function alongWith(random) {
  const link = pick(random, ['along with', 'together with', 'as well as']);
  return {
    difficulty: 'hard',
    question: capital(pick(random, PEOPLE)) + ', ' + link + ' ' + pick(random, GROUPS) + ', ___ attending the trade fair.',
    good: 'is',
    wrong: ['are', 'be', 'have'],
    justification: 'The words between commas ("' + link + ' ...") do not change the subject: it stays singular (is).',
  };
}

export function makeSubjectVerb(count) {
  return buildQuestions('subjectVerb', count, [singularHabit, pluralHabit, eachOf, headNoun, alongWith, neitherNor, everyone, thereIsAre, aNumberOf], 606);
}
