import { useGameOptions } from './gameOptions';
import { TEXT_SPEEDS, REALISM_LEVELS } from '../logic/options';
import { playEffect } from '../audio/effects';

function VolumeLine({ label, value, onChange }) {
  return (
    <div style={styles.line}>
      <div className="row between">
        <span>{label}</span>
        <span className="gold">{Math.round(value * 100)}%</span>
      </div>
      <input type="range" min="0" max="100" value={Math.round(value * 100)} onChange={(event) => onChange(Number(event.target.value) / 100)} style={styles.slider} aria-label={label} />
    </div>
  );
}

// The options of the game: volumes, text speed, relaxed mode, realism level. Saved at once.
export default function OptionsPanel() {
  const { options, changeOption } = useGameOptions();

  function changeEffects(value) {
    changeOption('effectsVolume', value);
    playEffect('coin'); // to hear the new volume
  }

  return (
    <>
      <span className="section">Sound</span>
      <VolumeLine label="Music" value={options.musicVolume} onChange={(value) => changeOption('musicVolume', value)} />
      <VolumeLine label="Effects" value={options.effectsVolume} onChange={changeEffects} />

      <span className="section">Text speed</span>
      <div className="row wrap" style={styles.choices}>
        {TEXT_SPEEDS.map((speed) => (
          <button key={speed.id} className={'menu-item' + (options.textSpeed === speed.id ? ' selected' : '')} onClick={() => changeOption('textSpeed', speed.id)}>
            {speed.name}
          </button>
        ))}
      </div>

      <span className="section">Relaxed mode</span>
      <button className={'menu-item' + (options.relaxed ? ' selected' : '')} onClick={() => changeOption('relaxed', !options.relaxed)}>
        <div className="grow">
          <span>{options.relaxed ? 'On' : 'Off'}</span>
          <span className="small">+50% time to answer each question. For beginners.</span>
        </div>
      </button>

      <span className="section">Realism</span>
      {REALISM_LEVELS.map((level) => (
        <button key={level.id} className={'menu-item' + (options.realismLevel === level.id ? ' selected' : '')} onClick={() => changeOption('realismLevel', level.id)}>
          <div className="grow">
            <span>{level.name}</span>
            <span className="small">{level.desc}</span>
          </div>
        </button>
      ))}
    </>
  );
}

const styles = {
  line: {
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    marginTop: 6,
    accentColor: '#e9c46a',
  },
  choices: {
    gap: 4,
  },
};
