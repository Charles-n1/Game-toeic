// The generated questions: RC 10 sentences built from models (see each file), 15 times the number of
// questions written by hand for each grammar category (RC 10 + RC 8). Same fields as createQuestion.
import { makeGerunds } from './gerunds';
import { makePrepositions } from './prepositions';
import { makeVocabulary } from './vocabulary';
import { makePassive } from './passive';
import { makePronouns } from './pronouns';
import { makeComparatives } from './comparatives';
import { makeSubjectVerb } from './subjectVerb';
import { makeWordForms } from './wordForms';
import { makeVerbTenses } from './verbTenses';
import { makeConnectors } from './connectors';

// How many questions to build for each category (15 x the questions written by hand).
const COUNTS = {
  gerunds: 720,
  prepositions: 1485,
  vocabulary: 6840,
  passive: 945,
  pronouns: 990,
  comparatives: 630,
  subjectVerb: 495,
  wordForms: 3150,
  verbTenses: 1215,
  connectors: 1980,
};

export const GENERATED_RC10 = [
  ...makeGerunds(COUNTS.gerunds),
  ...makePrepositions(COUNTS.prepositions),
  ...makeVocabulary(COUNTS.vocabulary),
  ...makePassive(COUNTS.passive),
  ...makePronouns(COUNTS.pronouns),
  ...makeComparatives(COUNTS.comparatives),
  ...makeSubjectVerb(COUNTS.subjectVerb),
  ...makeWordForms(COUNTS.wordForms),
  ...makeVerbTenses(COUNTS.verbTenses),
  ...makeConnectors(COUNTS.connectors),
];
