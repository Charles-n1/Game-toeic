import { useState, useEffect } from 'react';

const FRAME_TIME = 500; // each image stays 0.5 s

// Shows the images one after the other (0.5 s each), during `second` seconds,
// then stops on the last one. Like a flipbook.
// frames: [imageA, imageB]   second: how long it moves (2 by default)
// restart: change this number to play it again from the start (without reloading the images).
// width / height: the Frend/Tutorial canvas is 603 x 908 -> 174 x 262 keeps its shape.
export default function FrameAnimation({ frames, second = 2, restart = 0, width = 174, height = 262 }) {
  const [step, setStep] = useState(0); // how many images were shown already
  const lastStep = Math.round((second * 1000) / FRAME_TIME) - 1; // 2 s -> steps 0, 1, 2, 3

  // At the start, and each time `restart` changes: play from the first image.
  useEffect(play, [restart]);

  function play() {
    let current = 0;
    setStep(0);
    const timer = setInterval(showNextImage, FRAME_TIME); // every 0.5 s

    // (inside play, so it can use "current" and "timer")
    function showNextImage() {
      current = current + 1;
      setStep(current);
      if (current >= lastStep) clearInterval(timer); // finished: stay on this image
    }

    return function stop() {
      clearInterval(timer); // restarted, or page closed: stop the old clock
    };
  }

  // All the images are drawn on top of each other, only the current one is visible.
  // (Swapping the picture itself could blink while it loads.)
  return (
    <div style={{ width: width, height: height }}>
      {frames.map((frame, index) => (
        <img
          key={index}
          src={frame}
          alt=""
          draggable={false}
          style={{ ...styles.image, opacity: index === step % frames.length ? 1 : 0 }}
        />
      ))}
    </div>
  );
}

const styles = {
  // All the images at the SAME place, on top of each other.
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain', // React Native: resizeMode="contain"
  },
};
