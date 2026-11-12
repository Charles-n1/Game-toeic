import { useState, useEffect } from 'react';

// The seconds left before `endsAt` (a date, in milliseconds), updated every second while `running` is true.
// It's real time: leaving the page, or closing the app, doesn't stop the clock.
// endsAt null = no time limit (always Infinity).
export default function useDeadline(endsAt, running) {
  const [now, setNow] = useState(Date.now());
  const secondsLeft = endsAt === null ? Infinity : Math.max(0, Math.ceil((endsAt - now) / 1000));
  const isDone = secondsLeft <= 0;

  useEffect(runTimer, [running, isDone]);

  function runTimer() {
    if (!running || isDone || endsAt === null) return;

    const timer = setInterval(tick, 1000);
    return function stopTimer() {
      clearInterval(timer);
    };
  }

  function tick() {
    setNow(Date.now());
  }

  return secondsLeft;
}
