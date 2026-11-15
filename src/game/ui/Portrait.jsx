import { portraitCanvas } from '../draw/portraits';
import { usesHeroArt } from '../data/hero';
import heroPortraitUrl from '../assets/hero/hero-portrait.png';

const urls = new Map(); // look -> the picture, made once

// The default hero has the face of the sprite sheet (art/hero-sheet.png); the others are drawn with code.
function urlOf(look) {
  if (usesHeroArt(look)) return heroPortraitUrl;
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
