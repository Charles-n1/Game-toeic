import { useRef, useEffect } from 'react';

// Wraps something (a button, a bar...) so the tutorial knows WHERE it is on the screen.
// Once it is drawn, it measures itself and calls onAnchor(name, { x, y, width, height })
// (x, y: from the top-left corner of the browser window). No onAnchor (no tutorial): does nothing.
export default function Anchor({ name, onAnchor, children }) {
  const box = useRef(null);

  // [] = only once, when it appears on the screen.
  useEffect(measure, []);

  function measure() {
    if (!onAnchor) return;
    const place = box.current.getBoundingClientRect(); // (React Native: measureInWindow)
    onAnchor(name, { x: place.x, y: place.y, width: place.width, height: place.height });
  }

  return <div ref={box}>{children}</div>;
}
