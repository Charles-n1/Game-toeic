import { useEffect, useRef } from 'react';
import { drawPortrait } from '../draw/people';

const SIZE = 84; // pixels (see .portrait in game.css)

// The face of someone, drawn once (it does not move).
export default function Portrait({ look }) {
  const canvasRef = useRef(null);

  useEffect(draw, [look]);

  function draw() {
    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = SIZE * ratio;
    canvas.height = SIZE * ratio;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawPortrait(ctx, look, SIZE);
  }

  return <canvas ref={canvasRef} className="portrait" />;
}
