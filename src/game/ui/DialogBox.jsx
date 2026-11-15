import { useEffect, useState } from 'react';
import Portrait from './Portrait';
import PixelIcon from './PixelIcon';
import { npcOf } from '../data/npcs';
import { nextLine, choose } from '../logic/messages';
import { lettersPerSecond } from '../logic/options';
import { ACTION_KEYS } from '../logic/input';

// How many letters of the line are written, `elapsed` seconds after it started.
function lettersShown(line, textSpeed, elapsed) {
  return Math.min(line.length, Math.floor(elapsed * lettersPerSecond(textSpeed)));
}

// Someone talks (or the narrator, when there is no speaker). The line is written letter by letter
// (the text speed of the options): a tap shows it all, a second tap goes to the next line.
// On the last line, the choices appear in a menu above the box (arrows + Enter work too).
export default function DialogBox({ game, refresh }) {
  const dialog = game.run.dialog;
  const speaker = dialog.speaker ? npcOf(dialog.speaker) : null;
  const line = dialog.lines[dialog.index];
  const [startedAt, setStartedAt] = useState(Date.now());
  const [cursor, setCursor] = useState(0);
  const [, setTick] = useState(0);
  const shown = lettersShown(line, game.run.textSpeed, (Date.now() - startedAt) / 1000);
  const isWriting = shown < line.length;
  const isLastLine = dialog.index === dialog.lines.length - 1;
  const showChoices = isLastLine && !isWriting && dialog.choices.length > 0;

  useEffect(newLine, [dialog, dialog.index]);
  useEffect(animateLetters, [isWriting]);
  useEffect(listenToKeys, [dialog, showChoices, cursor, isWriting]);

  // A new line starts to be written.
  function newLine() {
    setStartedAt(Date.now());
    setCursor(0);
  }

  // While the line is written, the box is redrawn often: the letters appear smoothly.
  function animateLetters() {
    if (!isWriting) return undefined;
    const timer = setInterval(() => setTick((tick) => tick + 1), 30);
    return () => clearInterval(timer);
  }

  function listenToKeys() {
    window.addEventListener('keydown', pressKey);
    return () => window.removeEventListener('keydown', pressKey);
  }

  function pressKey(event) {
    if (event.repeat) return;
    if (showChoices) {
      const count = dialog.choices.length;
      if (event.key === 'ArrowDown') setCursor((cursor + 1) % count);
      if (event.key === 'ArrowUp') setCursor((cursor + count - 1) % count);
      if (ACTION_KEYS.includes(event.key)) pick(dialog.choices[cursor]);
    } else if (ACTION_KEYS.includes(event.key)) {
      tap();
    }
  }

  function tap() {
    if (isWriting) {
      setStartedAt(0); // everything is written at once
      return;
    }
    nextLine(game);
    refresh();
  }

  function pick(choice) {
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
          <span className={'dialog-text' + (speaker ? '' : ' narrator')}>{line.slice(0, shown)}</span>
        </div>
        {!showChoices && !isWriting && <span className="blink">▼</span>}
      </div>
    </div>
  );
}
