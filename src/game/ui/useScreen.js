import { useEffect, useState } from 'react';

// The shape of the screen, to choose the layout of the windows:
//   wide: a computer or a tablet held sideways -> the layout of a console RPG (things side by side);
//   else: a phone held upright -> things one under the other.
// touch: a finger is the main pointer -> the joystick and the big buttons are shown.

const WIDE_WIDTH = 860;

function measure() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    wide: width >= WIDE_WIDTH && width >= height * 1.1,
    touch: window.matchMedia('(pointer: coarse)').matches,
    width: width,
    height: height,
  };
}

export default function useScreen() {
  const [screen, setScreen] = useState(measure);

  useEffect(listenToResize, []);

  function listenToResize() {
    function resize() {
      setScreen(measure());
    }
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }

  return screen;
}
