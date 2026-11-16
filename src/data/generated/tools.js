// Small tools to build many RC 10 questions from sentence models.
// The random numbers are "seeded": the same questions come out every time (their text is their key in the saves).

// A random number generator that always gives the same numbers for the same seed (mulberry32).
export function seededRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One item of the list.
export function pick(random, list) {
  return list[Math.floor(random() * list.length)];
}

// "{P} signed {obj}." + { P: 'Ms. Tanaka', obj: 'the lease' } -> "Ms. Tanaka signed the lease."
export function fill(model, words) {
  return model.replace(/\{(\w+)\}/g, (all, name) => (words[name] !== undefined ? words[name] : all));
}

// The first letter in capital: "the hotel" -> "The hotel".
export function capital(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// The good answer and the 3 wrong ones, mixed: { answers, correct_index }.
export function mixAnswers(random, good, wrong) {
  const answers = [good, ...wrong.slice(0, 3)];
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  return { answers: answers, correct_index: answers.indexOf(good) };
}

// Builds `count` different questions of a category. Each "maker" is a function(random) that returns
// { difficulty, question, good, wrong: [3], justification } (or null when it can not make one).
// The makers are used in turn, so every kind of sentence comes back regularly.
export function buildQuestions(category, count, makers, seed) {
  const random = seededRandom(seed);
  const seen = new Set();
  const questions = [];
  let tries = 0;
  while (questions.length < count && tries < count * 30) {
    const made = makers[tries % makers.length](random);
    tries += 1;
    if (!made || seen.has(made.question)) continue;
    if (new Set([made.good, ...made.wrong]).size !== 4) continue; // never two times the same answer
    seen.add(made.question);
    questions.push({
      difficulty: made.difficulty,
      category: category,
      question: made.question,
      ...mixAnswers(random, made.good, made.wrong),
      justification: made.justification,
    });
  }
  return questions;
}
