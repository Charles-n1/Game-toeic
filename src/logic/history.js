import { totalAnswers } from '../data/categories';

// Every 200 answers: the current chart is saved in the history, then starts again from zero.
// So each chart of the history = exactly 200 answers.
export const SNAPSHOT_EVERY = 200;

// true when we just reached 200, 400, 600... answers.
export function isSnapshotTime(stats) {
  const total = totalAnswers(stats);
  return total > 0 && total % SNAPSHOT_EVERY === 0;
}

// A "photo" of the stats: we keep the numbers and the date, and redraw the chart from them.
export function makeSnapshot(stats) {
  return { date: Date.now(), stats: stats };
}
