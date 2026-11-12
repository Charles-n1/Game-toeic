import { pickRandom } from './random';

// A "group" = one text + all its questions, like in the real TOEIC.
// A Part 5 sentence has no text: it is a group of 1 question.

// Puts the questions that share the same text together. The order is kept.
export function makeGroups(questions) {
  const groups = [];
  const groupOfText = {}; // text -> its group (to find it again)
  for (const question of questions) {
    if (!question.text) {
      groups.push([question]);
    } else if (groupOfText[question.text]) {
      groupOfText[question.text].push(question);
    } else {
      groupOfText[question.text] = [question];
      groups.push(groupOfText[question.text]);
    }
  }
  return groups;
}

// A random group, cut so it never gives more than `max` questions.
export function pickGroup(groups, max) {
  return pickRandom(groups).slice(0, max);
}

// Several documents (an e-mail + a form...) are written "DOCUMENT 1 — ...", "DOCUMENT 2 — ...".
export function isMultiDocument(question) {
  return question.text !== null && question.text.startsWith('DOCUMENT 1');
}

// The questions a training can ask, following the choices of "Do u want ?".
// config.categories: null = all the categories (the "default" target).
export function trainingPool(questions, config) {
  return questions.filter(
    (q) =>
      config.sections.includes(q.section) &&
      q.difficulty === config.difficulty &&
      (config.multiDocs || !isMultiDocument(q)) &&
      (config.categories === null || config.categories.includes(q.category)),
  );
}

// "DOCUMENT 1 ... DOCUMENT 2 ..." -> ["DOCUMENT 1 ...", "DOCUMENT 2 ..."]
// (we cut just before each line that starts with "DOCUMENT" + a number)
export function splitDocuments(text) {
  return text.split(/\n(?=DOCUMENT \d)/).map((part) => part.trim());
}

// How many answers are good in [{ question, isCorrect }, ...]
export function countGood(results) {
  return results.filter((result) => result.isCorrect).length;
}
