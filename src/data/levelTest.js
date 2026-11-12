import { CATEGORIES } from './categories';
import { shuffle } from '../logic/random';
import { isMultiDocument } from '../logic/groups';

// The level test Frend proposes at the end of the tutorial: the same number of questions in each
// category, so the spider chart at the end shows the real level everywhere.
export const LEVEL_TESTS = {
  normal: { name: 'normal analysis', minutes: 17, perCategory: 5 }, // 50 questions
  accurate: { name: 'accurate analysis', minutes: 32, perCategory: 10 }, // 100 questions
};

// `perCategory` questions of each category, mixed. Sentences first (no text to read: faster),
// short texts only if a category doesn't have enough sentences. Never multi-document texts.
export function pickLevelQuestions(questions, perCategory) {
  const picked = [];
  for (const category of CATEGORIES) {
    const ofCategory = shuffle(questions.filter((q) => q.category === category.id && !isMultiDocument(q)));
    const sentences = ofCategory.filter((q) => !q.text);
    const withText = ofCategory.filter((q) => q.text);
    picked.push(...[...sentences, ...withText].slice(0, perCategory));
  }
  return shuffle(picked);
}
