import { today, addDays } from './dates';

// Days to wait before the next review.
// Index = retrieve_time (how many successful reviews).
// 0 -> after a failure: tomorrow
// 1 -> 3 days, 2 -> 7 days, ... last one (6 months) repeats forever.
const INTERVALS = [1, 3, 7, 14, 31, 60, 120, 180];

// Failed -> must review it tomorrow, counter goes back to 0.
export function onWrong(question) {
  return {
    ...question,
    retrieve: true,
    retrieve_time: 0,
    retrieve_date: addDays(today(), INTERVALS[0]),
  };
}

// Reviewed with success -> wait longer before the next review.
export function onRetrieveSuccess(question) {
  const retrieve_time = question.retrieve_time + 1;
  const index = Math.min(retrieve_time, INTERVALS.length - 1);

  return {
    ...question,
    retrieve_time: retrieve_time,
    retrieve_date: addDays(today(), INTERVALS[index]),
  };
}

// Not retrieved on its day (the player didn't come): it moves to today. Each day it stays late,
// it moves again, until it is retrieved. Its counter doesn't change (the next interval is the same).
export function moveLateToToday(question) {
  if (!question.retrieve || question.retrieve_date >= today()) return question;
  return { ...question, retrieve_date: today() };
}

// Must it be reviewed on this day (or before)?
export function isDue(question, day) {
  return question.retrieve && question.retrieve_date <= day;
}
