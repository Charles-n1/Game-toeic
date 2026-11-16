import useCanvas from './useCanvas';
import { drawLandscape } from '../draw/scene';

// The village of Lexia, slowly passing by: the background of the menus.
export default function Landscape() {
  const canvasRef = useCanvas((ctx, width, height, time) => drawLandscape(ctx, width, height, time), 15);
  return <canvas ref={canvasRef} className="game-canvas" />;
}
