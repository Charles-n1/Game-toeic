import { createContext, useContext } from 'react';

// TOEIC: Listening (oral) on 495 + Reading on 495 = 990.
export const SECTION_MAX = 495;
export const TOTAL_MAX = 990;

// Used until the player chooses a goal.
export const DEFAULT_GOAL = { total: 750, oral: 350 };

// Reading points needed: goal - oral. (At least 5: the lowest TOEIC score.)
export function readingNeeded(goal) {
  return Math.max(5, goal.total - goal.oral);
}

// The success rate for Test and Training: reading needed, as a %. Max 100.
export function successRate(goal) {
  return Math.min(100, Math.round((readingNeeded(goal) / SECTION_MAX) * 100));
}

// The oral estimate, as a %.
export function oralRate(goal) {
  return Math.round((goal.oral / SECTION_MAX) * 100);
}

// Like the theme: every component can read the goal with useGoal().
export const GoalContext = createContext(DEFAULT_GOAL);

export function useGoal() {
  return useContext(GoalContext);
}
