import FrameAnimation from './FrameAnimation';
import { ANIMATIONS, ANIMATION_NAMES } from '../data/frend';

const WIDTH = 174; // his normal size (the canvas 603 x 908, at 262 px tall)
const HEIGHT = 262;

// Frend, with ALL his animations on top of each other: only `animation` is visible.
// They are all loaded from the start, so changing animation = no loading = no blink.
// restart: change this number to play the visible animation again.
// size: 1 = normal, 0.5 = half.   flip: turned horizontally.
export default function FrendSprite({ animation, restart, size = 1, flip = false }) {
  const width = WIDTH * size;
  const height = HEIGHT * size;

  return (
    <div style={{ width: width, height: height, transform: flip ? 'scaleX(-1)' : 'none' }}>
      {ANIMATION_NAMES.map((name) => (
        <div key={name} style={{ ...styles.layer, opacity: name === animation ? 1 : 0 }}>
          <FrameAnimation
            frames={ANIMATIONS[name].frames}
            second={ANIMATIONS[name].second}
            restart={name === animation ? restart : -1}
            width={width}
            height={height}
          />
        </div>
      ))}
    </div>
  );
}

const styles = {
  layer: {
    position: 'absolute', // all the animations at the same place, on top of each other
    top: 0,
    left: 0,
  },
};
