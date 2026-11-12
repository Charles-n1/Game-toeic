import { useState } from 'react';

const RADIUS = 62; // half the size of the stick, in pixels (see .stick in game.css)
const REACH = 40; // how far the knob can go from the middle

// The stick under the left thumb: drag it to walk. It writes the direction in input.padX / input.padY (-1 to 1).
export default function TouchStick({ input }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 }); // where the knob is drawn, from the middle

  function moveTo(event) {
    const box = event.currentTarget.getBoundingClientRect();
    let x = event.clientX - box.left - RADIUS;
    let y = event.clientY - box.top - RADIUS;
    const length = Math.hypot(x, y);
    if (length > REACH) {
      x = (x / length) * REACH;
      y = (y / length) * REACH;
    }
    input.padX = x / REACH;
    input.padY = y / REACH;
    setKnob({ x: x, y: y });
  }

  function press(event) {
    event.currentTarget.setPointerCapture(event.pointerId); // keep following the finger outside the stick
    moveTo(event);
  }

  function drag(event) {
    if (event.buttons > 0 || event.pointerType === 'touch') moveTo(event);
  }

  function release() {
    input.padX = 0;
    input.padY = 0;
    setKnob({ x: 0, y: 0 });
  }

  return (
    <div className="stick touch" onPointerDown={press} onPointerMove={drag} onPointerUp={release} onPointerCancel={release}>
      <div className="stick-knob" style={{ transform: 'translate(' + knob.x + 'px, ' + knob.y + 'px)' }} />
    </div>
  );
}
