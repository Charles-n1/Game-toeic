import { portraitCanvas } from '../draw/portraits';
import { usesHeroArt } from '../data/hero';
import heroPortraitUrl from '../assets/hero/hero-portrait.png';

const urls = new Map(); // look -> the picture, made once

// The faces cut from the sprite sheets of art/Characters (see tools/cut_characters.py): { luna: url, ... }
const SHEET_FACES = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/characters/portraits/*.png', { eager: true, import: 'default' })).map(([path, url]) => [path.split('/').pop().replace('.png', ''), url]),
);

// The default hero and the people of the sheets have the face of their sprite sheet; the others are drawn with code.
function urlOf(look) {
  if (usesHeroArt(look)) return heroPortraitUrl;
  if (look.sheet && SHEET_FACES[look.sheet]) return SHEET_FACES[look.sheet];
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
