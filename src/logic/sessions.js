import { makeGroups, pickGroup, isMultiDocument, trainingPool } from './groups';
import { testMinutes, questionCount } from '../data/sections';
import { LEVEL_TESTS, pickLevelQuestions } from '../data/levelTest';

// A "session" = a training or a test in progress: everything needed to come back to it.
// It is saved at each change (see storage.js): changing page, or closing the app, loses nothing.

// The answers on the question card: { choices: { questionId: index }, whys: { questionId: "because..." }, submitted }
export const EMPTY_CARD = { choices: {}, whys: {}, submitted: false };

// When the clock ends (a date in ms), `seconds` from now. null = no clock.
function endsIn(seconds) {
  return seconds === null ? null : Date.now() + seconds * 1000;
}

// ---------- Training ----------

// How many questions the next group may have (no limit if the number of questions is not chosen).
export function questionsLeft(config, answeredCount) {
  return config.useCount ? config.count - answeredCount : Infinity;
}

// The groups (a text + its questions) a training can ask.
export function trainingGroups(questions, config) {
  return makeGroups(trainingPool(questions, config)); // sections + difficulty + multi-documents + target
}

export function newTrainingSession(config, questions) {
  return {
    config: config,
    group: pickGroup(trainingGroups(questions, config), questionsLeft(config, 0)), // a text + its questions
    card: EMPTY_CARD,
    score: 0,
    answeredCount: 0,
    results: {}, // the answers of THIS session, by category (for its spider chart)
    endsAt: endsIn(config.useTime ? config.seconds : null),
  };
}

// ---------- Test ----------

// An "exam" is what was chosen before the test:
//   { kind: 'normal', sections, levelIndex, multiDocs }  (the Test page)
//   { kind: 'level', level: 'normal' | 'accurate', list: [question, ...] }  (the level test of the tutorial)

// The level test: its questions are picked once, at the start.
export function levelExam(questions, level) {
  return { kind: 'level', level: level, list: pickLevelQuestions(questions, LEVEL_TESTS[level].perCategory) };
}

// What changes between the 2 kinds of exam: how many questions, how long, and the next group.
export function testPlan(exam, questions) {
  if (exam.kind === 'level') {
    return {
      total: exam.list.length,
      seconds: LEVEL_TESTS[exam.level].minutes * 60,
      nextGroup: (answeredCount) => [exam.list[answeredCount]], // one question at a time, in the picked order
    };
  }
  const pool = questions.filter((q) => exam.sections.includes(q.section) && (exam.multiDocs || !isMultiDocument(q)));
  const groups = makeGroups(pool);
  const total = questionCount(exam.sections);
  return {
    total: total,
    seconds: testMinutes(exam.sections, exam.levelIndex) * 60,
    nextGroup: (answeredCount) => pickGroup(groups, total - answeredCount), // the last group ends exactly at the total
  };
}

export function newTestSession(exam, questions) {
  const plan = testPlan(exam, questions);
  return {
    exam: exam,
    group: plan.nextGroup(0),
    choices: {}, // { questionId: tapped answer }, not sent yet
    score: 0, // hidden until the end
    answeredCount: 0,
    results: {},
    endsAt: endsIn(plan.seconds),
  };
}
