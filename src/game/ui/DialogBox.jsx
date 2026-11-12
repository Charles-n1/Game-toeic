import Portrait from './Portrait';
import { npcOf } from '../data/npcs';
import { nextLine, choose } from '../logic/messages';

// Someone talks (or the narrator, when there is no speaker). Tap to read the next line.
// The choices appear under the last line.
export default function DialogBox({ game, refresh }) {
  const dialog = game.run.dialog;
  const speaker = dialog.speaker ? npcOf(dialog.speaker) : null;
  const isLastLine = dialog.index === dialog.lines.length - 1;
  const showChoices = isLastLine && dialog.choices.length > 0;

  function tap() {
    nextLine(game);
    refresh();
  }

  function pick(choice) {
    choose(game, choice);
    refresh();
  }

  return (
    <div className="dialog panel" onClick={showChoices ? null : tap}>
      <div className="row" style={styles.top}>
        {speaker && <Portrait look={speaker.look} />}
        <div className="grow">
          {speaker && (
            <span className="dialog-name">
              {speaker.name} <span className="small">· {speaker.role}</span>
            </span>
          )}
          <span className={'dialog-text ' + (speaker ? '' : 'narrator')}>{dialog.lines[dialog.index]}</span>
        </div>
      </div>

      {showChoices &&
        dialog.choices.map((choice) => (
          <button key={choice.label} className="btn" style={styles.choice} onClick={() => pick(choice)}>
            {choice.label}
          </button>
        ))}
      {!showChoices && <span className="small" style={styles.hint}>{isLastLine ? 'tap to close' : 'tap ▸'}</span>}
    </div>
  );
}

const styles = {
  top: {
    alignItems: 'flex-start',
  },
  choice: {
    marginTop: 6,
    alignItems: 'flex-start',
  },
  hint: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
};
