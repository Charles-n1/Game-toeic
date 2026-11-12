import { useEffect, useRef } from 'react';

// Makes the canvas as sharp as the screen (a phone has 2 or 3 real pixels for 1 CSS pixel).
// Returns the size to draw in, in CSS pixels.
function fitCanvas(canvas, ctx) {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width: width, height: height };
}

// A canvas that is redrawn at every frame.
// onFrame(ctx, width, height, time, dt): time = seconds since the start, dt = seconds since the last frame.
// Returns the ref to put on the <canvas>.
export default function useCanvas(onFrame) {
  const canvasRef = useRef(null);
  const frameRef = useRef(onFrame);
  frameRef.current = onFrame; // always the newest function, without restarting the loop

  useEffect(startLoop, []);

  function startLoop() {
    const ctx = canvasRef.current.getContext('2d');
    const start = performance.now();
    let last = start;
    let request = requestAnimationFrame(frame);

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); // never a big jump (when the tab was hidden)
      last = now;
      const size = fitCanvas(canvasRef.current, ctx);
      ctx.clearRect(0, 0, size.width, size.height);
      frameRef.current(ctx, size.width, size.height, (now - start) / 1000, dt);
      request = requestAnimationFrame(frame);
    }

    return () => cancelAnimationFrame(request);
  }

  return canvasRef;
}
