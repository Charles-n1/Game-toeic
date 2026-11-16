// Generated questions: word forms (noun, verb, adjective or adverb of the same family).
import { buildQuestions, pick, capital } from './tools';
import { PEOPLE, GROUPS } from './words';

// A family of words: noun, verb, adjective, adverb. (When a form does not exist, a near word of the family.)
function family(noun, verb, adjective, adverb) {
  return { noun, verb, adjective, adverb };
}

// Adverbs that fit "handled the request ___" and "___ completed the task".
const MANNER = [
  family('success', 'succeed', 'successful', 'successfully'),
  family('efficiency', 'efficiencies', 'efficient', 'efficiently'),
  family('care', 'cares', 'careful', 'carefully'),
  family('accuracy', 'accuracies', 'accurate', 'accurately'),
  family('thoroughness', 'thorough', 'thorough', 'thoroughly'),
  family('quickness', 'quicken', 'quick', 'quickly'),
  family('profession', 'professions', 'professional', 'professionally'),
  family('promptness', 'prompts', 'prompt', 'promptly'),
  family('creation', 'create', 'creative', 'creatively'),
  family('independence', 'depend', 'independent', 'independently'),
  family('effectiveness', 'effect', 'effective', 'effectively'),
  family('responsibility', 'responsibilities', 'responsible', 'responsibly'),
  family('patience', 'patients', 'patient', 'patiently'),
  family('confidence', 'confide', 'confident', 'confidently'),
  family('productivity', 'produce', 'productive', 'productively'),
].filter((item) => new Set([item.noun, item.verb, item.adjective, item.adverb]).size === 4);

// Adjectives that fit "a very ___ person".
const PERSON_ADJECTIVES = [
  family('reliability', 'rely', 'reliable', 'reliably'),
  family('creativity', 'create', 'creative', 'creatively'),
  family('decision', 'decide', 'decisive', 'decisively'),
  family('responsibility', 'responsibilities', 'responsible', 'responsibly'),
  family('persuasion', 'persuade', 'persuasive', 'persuasively'),
  family('attention', 'attend', 'attentive', 'attentively'),
  family('competition', 'compete', 'competitive', 'competitively'),
  family('innovation', 'innovate', 'innovative', 'innovatively'),
  family('flexibility', 'flex', 'flexible', 'flexibly'),
  family('dependability', 'depend', 'dependable', 'dependably'),
  family('enthusiasm', 'enthuse', 'enthusiastic', 'enthusiastically'),
  family('knowledge', 'know', 'knowledgeable', 'knowledgeably'),
  family('organization', 'organize', 'organized', 'organizationally'),
  family('energy', 'energize', 'energetic', 'energetically'),
  family('cooperation', 'cooperate', 'cooperative', 'cooperatively'),
];

// Adjectives that fit "The presentation was very ___."
const THING_ADJECTIVES = [
  family('information', 'inform', 'informative', 'informatively'),
  family('impression', 'impress', 'impressive', 'impressively'),
  family('persuasion', 'persuade', 'persuasive', 'persuasively'),
  family('success', 'succeed', 'successful', 'successfully'),
  family('creation', 'create', 'creative', 'creatively'),
  family('attraction', 'attract', 'attractive', 'attractively'),
  family('effect', 'effects', 'effective', 'effectively'),
  family('benefit', 'benefits', 'beneficial', 'beneficially'),
  family('help', 'helps', 'helpful', 'helpfully'),
  family('use', 'uses', 'useful', 'usefully'),
];

// Nouns that fit "The ___ of the new branch was delayed."
const ACTION_NOUNS = [
  family('construction', 'construct', 'constructive', 'constructively'),
  family('expansion', 'expand', 'expansive', 'expansively'),
  family('renovation', 'renovate', 'renovated', 'renovates'),
  family('inspection', 'inspect', 'inspected', 'inspects'),
  family('completion', 'complete', 'completed', 'completely'),
  family('opening', 'open', 'opened', 'openly'),
  family('relocation', 'relocate', 'relocated', 'relocates'),
];

// Verbs that fit "We will ___ the process next year."
const VERBS = [
  family('simplification', 'simplify', 'simple', 'simply'),
  family('improvement', 'improve', 'improved', 'improvable'),
  family('modernization', 'modernize', 'modern', 'modernly'),
  family('strength', 'strengthen', 'strong', 'strongly'),
  family('standardization', 'standardize', 'standard', 'standardly'),
  family('automation', 'automate', 'automatic', 'automatically'),
  family('expansion', 'expand', 'expansive', 'expansively'),
  family('clarification', 'clarify', 'clear', 'clearly'),
  family('shortness', 'shorten', 'short', 'shortly'),
  family('widening', 'widen', 'wide', 'widely'),
];

const TASKS = ['the project', 'the training', 'the inspection', 'the audit', 'the survey', 'the move to the new office', 'the installation', 'the customer request'];
const ROLE_NOUNS = ['employee', 'manager', 'colleague', 'team member', 'assistant', 'supervisor', 'negotiator', 'leader'];
const THINGS = ['The presentation', 'The workshop', 'The new brochure', 'The training video', 'The guide', 'The report', 'The seminar', 'Her speech', 'His proposal', 'The website'];
const PROJECTS = ['the new branch', 'the warehouse', 'the parking lot', 'the main office', 'the hospital wing', 'the factory', 'the airport terminal', 'the shopping center'];
const PROCESSES = ['the ordering process', 'the hiring procedure', 'the billing system', 'the delivery network', 'the approval process', 'the safety rules', 'our website', 'the training program'];

const WHEN = ['last week', 'yesterday', 'this morning', 'ahead of schedule', 'despite the tight deadline', 'during the busy season', 'last month'];
const SOURCES = ['according to the director', 'according to the team', 'in the opinion of the clients', 'as everyone in the office knows', 'according to the annual review', 'as the survey showed'];
const AUDIENCES = ['the new staff', 'the visitors', 'the trainees', 'the customers', 'the interns', 'our partners', 'the investors'];

function anyone(random) {
  return capital(pick(random, random() < 0.75 ? PEOPLE : GROUPS));
}

// "Ms. Tanaka handled the request ___." -> efficiently
function adverbAfterVerb(random) {
  const word = pick(random, MANNER);
  const task = pick(random, TASKS);
  return {
    difficulty: 'normal',
    question: anyone(random) + ' handled ' + task + ' very ___ ' + pick(random, WHEN) + '.',
    good: word.adverb,
    wrong: [word.adjective, word.noun, word.verb],
    justification: 'The blank tells HOW the action (handled) was done: an adverb (' + word.adverb + ').',
  };
}

// "Ms. Tanaka ___ completed the project." -> successfully
function adverbBeforeVerb(random) {
  const word = pick(random, MANNER);
  return {
    difficulty: 'hard',
    question: anyone(random) + ' ___ completed ' + pick(random, TASKS) + ' ' + pick(random, WHEN) + '.',
    good: word.adverb,
    wrong: [word.adjective, word.noun, word.verb],
    justification: 'Between the subject and the verb (completed), an adverb describes the action: ' + word.adverb + '.',
  };
}

// "Ms. Tanaka is a very ___ employee." -> reliable
function adjectiveBeforeNoun(random) {
  const word = pick(random, PERSON_ADJECTIVES);
  return {
    difficulty: 'normal',
    question: capital(pick(random, PEOPLE)) + ' is a very ___ ' + pick(random, ROLE_NOUNS) + ', ' + pick(random, SOURCES) + '.',
    good: word.adjective,
    wrong: [word.noun, word.verb, word.adverb],
    justification: 'Before a noun (and after "very"), use an adjective: ' + word.adjective + '.',
  };
}

// "The presentation was very ___." -> informative
function adjectiveAfterBe(random) {
  const word = pick(random, THING_ADJECTIVES);
  const verb = pick(random, ['was', 'proved', 'seemed', 'turned out to be']);
  return {
    difficulty: 'normal',
    question: pick(random, THINGS) + ' ' + verb + ' extremely ___ for ' + pick(random, AUDIENCES) + '.',
    good: word.adjective,
    wrong: [word.noun, word.verb, word.adverb],
    justification: 'After "' + verb + '" (a linking verb) and "extremely", use an adjective: ' + word.adjective + '.',
  };
}

// "The ___ of the new branch was delayed." -> construction
function nounAfterThe(random) {
  const word = pick(random, ACTION_NOUNS);
  const news = pick(random, ['was delayed by two weeks', 'will begin next month', 'is almost finished', 'has been postponed', 'cost more than expected']);
  return {
    difficulty: 'hard',
    question: 'The ___ of ' + pick(random, PROJECTS) + ' ' + news + '.',
    good: word.noun,
    wrong: [word.verb, word.adjective, word.adverb],
    justification: 'After "the" and before "of", use a noun: the ' + word.noun + ' of...',
  };
}

// "The company plans to ___ the ordering process." -> simplify
function verbAfterTo(random) {
  const word = pick(random, VERBS);
  return {
    difficulty: 'hard',
    question: capital(pick(random, ['the company', 'the new director', 'the IT team', 'the board', 'our manager'])) + ' plans to ___ ' + pick(random, PROCESSES) + ' next year.',
    good: word.verb,
    wrong: [word.noun, word.adjective, word.adverb],
    justification: 'After "to" (plans to ...), use the base form of a verb: ' + word.verb + '.',
  };
}

// "Your ___ to detail is impressive." -> attention (a possessive + noun)
function nounAfterPossessive(random) {
  const word = pick(random, PERSON_ADJECTIVES.filter((item) => !['competition', 'persuasion', 'decision'].includes(item.noun)));
  const owner = pick(random, ['Your', 'Her', 'His', 'Their', 'Our']);
  return {
    difficulty: 'extreme',
    question: 'We all appreciate ' + owner.toLowerCase() + ' ___, which helped the team a lot this year.',
    good: word.noun,
    wrong: [word.verb, word.adjective, word.adverb],
    justification: 'After a possessive (' + owner.toLowerCase() + '), use a noun: ' + owner.toLowerCase() + ' ' + word.noun + '.',
  };
}

export function makeWordForms(count) {
  return buildQuestions('wordForms', count, [adverbAfterVerb, adjectiveBeforeNoun, adjectiveAfterBe, nounAfterThe, adverbBeforeVerb, verbAfterTo, nounAfterPossessive], 808);
}
