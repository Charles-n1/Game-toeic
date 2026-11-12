// The parts of the TOEIC, in the order of the scale bar.
// minutes = width of the segment. questions = how many in the real exam.
export const SECTIONS = [
  { id: 'listening', label: 'Listening 45m', minutes: 45, questions: 100 },
  { id: 'rc10', label: 'RC 10', minutes: 10, questions: 30 },
  { id: 'rc8', label: 'RC 8', minutes: 8, questions: 16 },
  { id: 'text', label: 'RC Text reading 55m', minutes: 55, questions: 54 },
];

export const TEST_LEVELS = ['ez', 'normal', 'hard', 'extreme demon'];

// Minutes of each test level (same order as TEST_LEVELS).
const TEST_MINUTES = {
  rc10: [17, 10, 8, 6],
  rc8: [13, 8, 6, 5],
  text: [70, 55, 45, 40],
  allReading: [90, 75, 65, 50], // the 3 reading parts together
};

// sections: the selected ids, like ['rc10', 'rc8']
export function testMinutes(sections, levelIndex) {
  if (sections.length === 3) {
    return TEST_MINUTES.allReading[levelIndex];
  }
  // 1 or 2 parts: add their times
  let total = 0;
  for (const id of sections) {
    total += TEST_MINUTES[id][levelIndex];
  }
  return total;
}

// The "normal" time of an exercise, in minutes.
export function normalMinutes(sections) {
  return testMinutes(sections, 1);
}

// Number of questions in the real exam for these parts.
export function questionCount(sections) {
  let total = 0;
  for (const section of SECTIONS) {
    if (sections.includes(section.id)) {
      total += section.questions;
    }
  }
  return total;
}

// Normal time for one question, in seconds.
export function secondsPerQuestion(sections) {
  return (normalMinutes(sections) * 60) / questionCount(sections);
}
