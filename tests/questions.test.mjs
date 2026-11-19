// The questions with a text (RC 8, RC 55): the whole text is shown, and the questions belong to it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../src/data/questions.js';
import { splitDocuments, makeGroups } from '../src/logic/groups.js';

const WITH_TEXT = QUESTIONS.filter((question) => question.text);

test('every question has 4 answers and a good answer among them', () => {
  for (const question of QUESTIONS) {
    assert.equal(question.answers.length, 4, 'question ' + question.id);
    assert.ok(question.correct_index >= 0 && question.correct_index < 4, 'question ' + question.id);
  }
});

test('the documents of a text, together, are the whole text (nothing hidden)', () => {
  for (const question of WITH_TEXT) {
    const documents = splitDocuments(question.text);
    assert.equal(documents.join('\n').replace(/\s/g, ''), question.text.replace(/\s/g, ''), 'question ' + question.id);
  }
});

test('a question about a blank finds that blank in its text', () => {
  for (const question of WITH_TEXT) {
    const blank = question.question.match(/^Blank \((\d)\)/);
    if (blank) assert.ok(question.text.includes('___(' + blank[1] + ')___'), 'question ' + question.id + ' asks blank ' + blank[1]);
  }
});

test('the questions of one text are all of the same part of the exam', () => {
  for (const group of makeGroups(WITH_TEXT)) {
    assert.equal(new Set(group.map((question) => question.section)).size, 1, 'text of question ' + group[0].id);
  }
});
