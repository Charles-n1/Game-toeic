// The added questions (to triple each category), written in shorter files than questions.js.
// RC 10: one sentence each.
// RC 8 and long texts: { text, questions: [...] } = a passage + all its questions.
import { RC10_GRAMMAR } from './rc10Grammar';
import { RC10_WORDS } from './rc10Words';
import { RC8_TEXTS_1 } from './rc8Texts1';
import { RC8_TEXTS_2 } from './rc8Texts2';
import { READING_TEXTS_1 } from './readingTexts1';
import { READING_TEXTS_2 } from './readingTexts2';
import { READING_TEXTS_3 } from './readingTexts3';
import { READING_TEXTS_4 } from './readingTexts4';
import { MULTI_TEXTS_1 } from './multiTexts1';
import { MULTI_TEXTS_2 } from './multiTexts2';
import { MULTI_TEXTS_3 } from './multiTexts3';
import { MULTI_TEXTS_4 } from './multiTexts4';

export const MORE_RC10 = [...RC10_GRAMMAR, ...RC10_WORDS];
export const MORE_RC8 = [...RC8_TEXTS_1, ...RC8_TEXTS_2];
export const MORE_TEXT = [
  ...READING_TEXTS_1,
  ...READING_TEXTS_2,
  ...READING_TEXTS_3,
  ...READING_TEXTS_4,
  ...MULTI_TEXTS_1,
  ...MULTI_TEXTS_2,
  ...MULTI_TEXTS_3,
  ...MULTI_TEXTS_4,
];
