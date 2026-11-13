import { useEffect, useState } from 'react';
import Portrait from './Portrait';
import PixelIcon from './PixelIcon';
import { npcOf } from '../data/npcs';
import { nextLine, choose } from '../logic/messages';

// Someone talks (or the narrator, when there is no speaker). Tap to read the next line.
// On the last line, the choices appear in a menu above the box (arrows + Enter work too).
export default function DialogBox({ game, refresh }) {
  const dialog = game.run.dialog;
  const speaker = dialog.speaker ? npcOf(dialog.speaker) : null;
  const isLastLine = dialog.index === dialog.lines.length - 1;
  const showChoices = isLastLine && dialog.choices.length > 0;
  const [cursor, setCursor] = useState(0);

  useEffect(listenToArrows, [dialog, showChoices, cursor]);

  function listenToArrows() {
    if (!showChoices) return undefined;
    window.addEventListener('keydown', pressKey);
    return () => window.removeEventListener('keydown', pressKey);
  }

  function pressKey(event) {
    const count = dialog.choices.length;
    if (event.key === 'ArrowDown') setCursor((cursor + 1) % count);
    if (event.key === 'ArrowUp') setCursor((cursor + count - 1) % count);
    if (event.key === 'Enter' || event.key === ' ') pick(dialog.choices[cursor]);
  }

  function tap() {
    nextLine(game);
    refresh();
  }

  function pick(choice) {
    setCursor(0);
    choose(game, choice);
    refresh();
  }

  return (
    <div className="dialog-area">
      {showChoices && (
        <div className="window choices">
          {dialog.choices.map((choice, index) => (
            <button
              key={choice.label}
              className={'menu-item' + (index === cursor ? ' selected' : '')}
              onMouseEnter={() => setCursor(index)}
              onClick={() => pick(choice)}
            >
              {choice.icon && <PixelIcon name={choice.icon} size={28} />}
              <span>{choice.label}</span>
            </button>
          ))}
        </div>
      )}
      <div className="window dialog" onClick={showChoices ? null : tap}>
        {speaker && <Portrait look={speaker.look} size={96} />}
        <div className="grow">
          {speaker && <span className="dialog-name">{speaker.name}:</span>}
          <span className={'dialog-text' + (speaker ? '' : ' narrator')}>{dialog.lines[dialog.index]}</span>
        </div>
        {!showChoices && <span className="blink">▼</span>}
      </div>
    </div>
  );
}
