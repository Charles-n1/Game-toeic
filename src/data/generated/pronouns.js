// Generated questions: pronouns (subject, object, possessive, reflexive, relative).
import { buildQuestions, pick, capital } from './tools';
import { WOMEN, MEN, GROUPS, ORGS, ACTIONS } from './words';

const SHE = { subject: 'she', object: 'her', adjective: 'her', possessive: 'hers', reflexive: 'herself' };
const HE = { subject: 'he', object: 'him', adjective: 'his', possessive: 'his', reflexive: 'himself' };
const THEY = { subject: 'they', object: 'them', adjective: 'their', possessive: 'theirs', reflexive: 'themselves' };

const BELONGINGS = ['badge', 'laptop', 'umbrella', 'notebook', 'parking pass', 'phone', 'keys', 'calendar', 'presentation slides', 'business cards'];

// A person and their pronouns: { name, words }.
function someone(random) {
  return random() < 0.5 ? { name: pick(random, WOMEN), words: SHE } : { name: pick(random, MEN), words: HE };
}

// The 3 wrong answers: the other forms of the same pronoun (she / her / hers / herself, without the good one).
function otherForms(words, good) {
  const forms = [words.subject, words.object, words.adjective, words.possessive, words.reflexive];
  return [...new Set(forms)].filter((form) => form !== good);
}

// "Ms. Tanaka left ___ badge at home." -> her
function possessiveAdjective(random) {
  const { name, words } = someone(random);
  const good = words.adjective;
  return {
    difficulty: 'normal',
    question: name + ' left ___ ' + pick(random, BELONGINGS) + ' in the meeting room.',
    good: good,
    wrong: otherForms(words, good),
    justification: 'Before a noun, use a possessive adjective: ' + good + ' (' + good + ' badge, ' + good + ' laptop).',
  };
}

// "Mr. Kim called, so please call ___ back." -> him
function objectPronoun(random) {
  const { name, words } = someone(random);
  return {
    difficulty: 'normal',
    question: name + ' called this morning, so please call ___ back before noon.',
    good: words.object,
    wrong: otherForms(words, words.object),
    justification: 'After a verb (call), use an object pronoun: ' + words.object + '.',
  };
}

// "Mr. Kim designed the logo ___." -> himself
function reflexive(random) {
  const { name, words } = someone(random);
  const action = pick(random, ACTIONS);
  return {
    difficulty: 'hard',
    question: 'Nobody helped ' + name + ': ' + words.subject + ' ' + action.past + ' ' + action.object + ' ___.',
    good: words.reflexive,
    wrong: otherForms(words, words.reflexive),
    justification: '"By ' + words.reflexive + '" / "' + words.reflexive + '" = alone, without help: a reflexive pronoun.',
  };
}

// "The black suitcase is not mine; Ms. Tanaka says it is ___." -> hers
function possessivePronoun(random) {
  const { name, words } = someone(random);
  const good = words.possessive;
  return {
    difficulty: 'hard',
    question: 'The ' + pick(random, BELONGINGS.filter((thing) => !thing.endsWith('s'))) + ' on the table is not mine; ' + name + ' says it is ___.',
    good: good,
    wrong: otherForms(words, good),
    justification: 'With no noun after it, use a possessive pronoun: ' + good + ' (= ' + words.adjective + ' one).',
  };
}

// "When Ms. Tanaka arrives, ___ will lead the training." -> she
function subjectPronoun(random) {
  const { name, words } = someone(random);
  const action = pick(random, ACTIONS);
  return {
    difficulty: 'normal',
    question: 'As soon as ' + name + ' arrives, ___ will ' + action.base + ' ' + action.object + '.',
    good: words.subject,
    wrong: otherForms(words, words.subject),
    justification: 'The blank is the subject of "will ' + action.base + '": a subject pronoun, ' + words.subject + '.',
  };
}

// "The interns presented ___ findings." -> their
function groupPossessive(random) {
  const findings = ['findings', 'ideas', 'reports', 'results', 'suggestions', 'designs', 'schedules'];
  return {
    difficulty: 'normal',
    question: capital(pick(random, GROUPS)) + ' presented ___ ' + pick(random, findings) + ' to the director.',
    good: THEY.adjective,
    wrong: [THEY.object, THEY.possessive, THEY.reflexive],
    justification: 'Before a noun, for a plural subject: their (their findings).',
  };
}

// "The hotel announced ___ new prices." -> its
function orgIts(random) {
  const news = ['new prices', 'quarterly results', 'opening hours', 'new logo', 'expansion plans', 'annual report', 'holiday schedule'];
  return {
    difficulty: 'hard',
    question: capital(pick(random, ORGS)) + ' has just announced ___ ' + pick(random, news) + '.',
    good: 'its',
    wrong: ["it's", 'it', 'itself'],
    justification: '"Its" = possessive (its prices). "It\'s" = it is / it has.',
  };
}

// "The candidate ___ résumé we received is very qualified." -> whose
function relativeWhose(random) {
  const people = ['The candidate', 'The client', 'The supplier', 'The applicant', 'The author', 'The architect'];
  const things = ['application', 'proposal', 'portfolio', 'report', 'design', 'offer'];
  return {
    difficulty: 'extreme',
    question: pick(random, people) + ' ___ ' + pick(random, things) + ' we accepted will visit the office on ' + pick(random, ['Monday', 'Tuesday', 'Thursday', 'Friday']) + '.',
    good: 'whose',
    wrong: ['who', 'whom', 'which'],
    justification: '"Whose" + noun = the possession of a person (the candidate\'s application).',
  };
}

// "The interns finished the project by ___." -> themselves
function groupReflexive(random) {
  const action = pick(random, ACTIONS);
  return {
    difficulty: 'hard',
    question: capital(pick(random, GROUPS)) + ' ' + action.past + ' ' + action.object + ' by ___, without any help.',
    good: THEY.reflexive,
    wrong: [THEY.object, THEY.adjective, THEY.possessive],
    justification: '"By themselves" = alone, without help.',
  };
}

export function makePronouns(count) {
  return buildQuestions('pronouns', count, [possessiveAdjective, objectPronoun, reflexive, subjectPronoun, possessivePronoun, groupPossessive, orgIts, groupReflexive, relativeWhose], 404);
}
