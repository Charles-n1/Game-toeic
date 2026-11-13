import { portraitCanvas } from '../draw/portraits';

const urls = new Map(); // look -> the picture, made once

function urlOf(look) {
  if (!urls.has(look)) urls.set(look, portraitCanvas(look).toDataURL());
  return urls.get(look);
}

// The face of someone, in pixel art, in a framed box. size: in screen pixels.
export default function Portrait({ look, size = 96 }) {
  return (
    <div className="portrait-box" style={{ width: size + 4, height: size + 4 }}>
      <img src={urlOf(look)} width={size} height={size} alt="" />
    </div>
  );
}
