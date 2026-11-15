import { useMemo } from 'react';
import useCanvas from './useCanvas';
import Portrait from './Portrait';
import { BODIES, HAIR_STYLES, HAIR_COLORS, OUTFIT_COLORS, heroLook, usesHeroArt } from '../data/hero';
import { personSprite, walkPose } from '../draw/people';

const NAME_LENGTH = 12;
const TURN = ['down', 'left', 'up', 'right']; // the preview turns around

// The hero, big, turning and walking on the spot.
function HeroPreview({ look }) {
  const canvasRef = useCanvas((ctx, width, height, time) => {
    const sprite = personSprite(look, TURN[Math.floor(time / 1.2) % 4], walkPose(time * 6, true));
    const scale = 3;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite.canvas, Math.round(width / 2 - sprite.ax * scale), Math.round(height - 8 - sprite.ay * scale), sprite.canvas.width * scale, sprite.canvas.height * scale);
  });
  return <canvas ref={canvasRef} style={styles.preview} />;
}

// A row of choices: words (a list of { id, name }) or colors (a list of '#rrggbb').
function Choices({ label, items, value, onPick }) {
  return (
    <div style={styles.row}>
      <span className="small">{label}</span>
      <div className="row wrap" style={styles.choices}>
        {items.map((item, index) =>
          typeof item === 'string' ? (
            <button key={item} aria-label={label + ' ' + (index + 1)} onClick={() => onPick(index)} style={{ ...styles.swatch, backgroundColor: item, ...(value === index ? styles.picked : null) }} />
          ) : (
            <button key={item.id} className={'menu-item' + (value === index ? ' selected' : '')} style={styles.word} onClick={() => onPick(index)}>
              {item.name}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

// Makes the hero: a name, a body, a hair style, a hair color, an outfit color.
// hero: { name, body, style, hair, outfit }. onChange(hero).
export default function HeroCreator({ hero, onChange }) {
  const look = useMemo(() => heroLook(hero), [hero]);

  function change(key, value) {
    onChange({ ...hero, [key]: value });
  }

  function typeName(event) {
    change('name', event.target.value.replace(/[^\p{L}\p{N} '-]/gu, '').slice(0, NAME_LENGTH)); // letters, digits, space, ' and -
  }

  return (
    <>
      <div className="row" style={styles.top}>
        <HeroPreview look={look} />
        <div className="grow">
          <Portrait look={look} size={64} />
          <span className="small" style={styles.label}>
            Your name
          </span>
          <input className="field" style={styles.name} value={hero.name} onChange={typeName} placeholder="Ren" aria-label="name" />
          <span className="small" style={styles.label}>
            {usesHeroArt(look) ? '★ The hand-drawn hero of Lexia' : 'Spiky brown hair + blue outfit: the hand-drawn hero'}
          </span>
        </div>
      </div>
      <Choices label="Body" items={BODIES} value={hero.body} onPick={(index) => change('body', index)} />
      <Choices label="Hair style" items={HAIR_STYLES} value={hero.style} onPick={(index) => change('style', index)} />
      <Choices label="Hair color" items={HAIR_COLORS} value={hero.hair} onPick={(index) => change('hair', index)} />
      <Choices label="Outfit" items={OUTFIT_COLORS} value={hero.outfit} onPick={(index) => change('outfit', index)} />
    </>
  );
}

const styles = {
  top: {
    gap: 12,
    alignItems: 'flex-end',
  },
  preview: {
    width: 120,
    height: 130,
    flexShrink: 0,
    borderRadius: 6,
    background: 'linear-gradient(#5db84b, #3f9a41)',
    border: '2px solid #0e1430',
  },
  label: {
    marginTop: 8,
  },
  name: {
    width: '100%',
    marginTop: 4,
  },
  row: {
    marginTop: 10,
  },
  choices: {
    gap: 6,
    marginTop: 4,
  },
  word: {
    fontSize: 15,
    padding: '4px 8px 4px 22px',
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 6,
    border: '2px solid #0e1430',
  },
  picked: {
    outline: '3px solid #ffd86b',
    outlineOffset: 1,
  },
};
