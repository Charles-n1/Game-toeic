import { useState } from 'react';

const REACH = 0.65; // how far the knob can go from the middle (a part of the radius)

// The stick under the left thumb: drag it to walk. It writes the direction in input.padX / input.padY (-1 to 1).
export default function TouchStick({ input }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 }); // where the knob is drawn, from the middle

  function moveTo(event) {
    const box = event.currentTarget.getBoundingClientRect(); // its real size on screen (the windows may be zoomed)
    const radius = box.width / 2;
    const reach = radius * REACH;
    let x = event.clientX - box.left - radius;
    let y = event.clientY - box.top - radius;
    const length = Math.hypot(x, y);
    if (length > reach) {
      x = (x / length) * reach;
      y = (y / length) * reach;
    }
    input.padX = x / reach;
    input.padY = y / reach;
    const zoom = box.width / event.currentTarget.offsetWidth; // the knob moves in unzoomed pixels
    setKnob({ x: x / zoom, y: y / zoom });
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
