import { useEffect, useRef, useState } from 'react';
import Portrait from './Portrait';
import PixelIcon from './PixelIcon';
import { npcOf } from '../data/npcs';
import { nextLine, choose, dialogStepText } from '../logic/messages';
import { lettersPerSecond } from '../logic/options';
import { ACTION_KEYS } from '../logic/input';
import { playEffect } from '../audio/effects';
import { voiceSoundFor } from '../logic/bonds';
import { hasExpression, expressionUrl } from '../draw/gearArt';
import { EXPRESSION_META } from '../draw/bondsArt';

const EXPR_ALIASES = { happy: 'joy', sad: 'sadness' };

function normalizeExpr(raw) {
  return EXPR_ALIASES[raw] || raw || 'neutral';
}

function ExpressionBadge({ game, speaker, dialog, stepExpr }) {
  if (!speaker || !speaker.look || !speaker.look.sheet) return null;
  const active = game.run.dialogExpression;
  const raw = stepExpr || dialog.expression || (active && active.npcId === speaker.id ? active.expr : 'neutral');
  const expr = normalizeExpr(raw);
  const sheet = speaker.look.sheet;
  const url = hasExpression(sheet, expr) ? expressionUrl(sheet, expr) : null;
  const meta = EXPRESSION_META[expr] || EXPRESSION_META.neutral;
  return (
    <div className="dialog-expression" style={{ borderColor: meta.color }}>
      {url ? (
        <img src={url} width={84} height={84} alt={speaker.name + ' (' + meta.label + ')'} style={{ imageRendering: 'pixelated' }} />
      ) : (
        <Portrait look={speaker.look} size={84} />
      )}
      <span className="dialog-expression-label" style={{ color: meta.color }}>
        {meta.label}
      </span>
    </div>
  );
}

// How many letters of the line are written, `elapsed` seconds after it started.
function lettersShown(line, textSpeed, elapsed) {
  return Math.min(line.length, Math.floor(elapsed * lettersPerSecond(textSpeed)));
}

// Someone talks (or the narrator, when there is no speaker). The line is written letter by letter
// (the text speed of the options): a tap shows it all, a second tap goes to the next line.
// On the last line, the choices appear in a menu above the box (arrows + Enter work too).
export default function DialogBox({ game, refresh }) {
  const dialog = game.run.dialog;
  const rawLine = dialog.lines[dialog.index];
  const line = dialogStepText(rawLine);
  const stepObj = rawLine && typeof rawLine === 'object' ? rawLine : null;
  const speakerKey = stepObj && stepObj.speaker !== undefined ? stepObj.speaker : dialog.speaker;
  const npcSpeaker = speakerKey && speakerKey !== 'hero' ? npcOf(speakerKey) : null;
  const speaker = speakerKey === 'hero'
    ? { id: 'hero', name: game.player?.name || 'You', look: game.player?.look }
    : npcSpeaker || (typeof speakerKey === 'string' && speakerKey ? { id: speakerKey, name: speakerKey, look: null } : null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [cursor, setCursor] = useState(0);
  const [, setTick] = useState(0);
  const choicesRef = useRef(null);
  const shown = lettersShown(line, game.run.textSpeed, (Date.now() - startedAt) / 1000);
  const isWriting = shown < line.length;
  const isLastLine = dialog.index === dialog.lines.length - 1;
  const showChoices = isLastLine && !isWriting && dialog.choices.length > 0;

  useEffect(newLine, [dialog, dialog.index]);
  useEffect(animateLetters, [isWriting, dialog]);
  useEffect(listenToKeys, [dialog, showChoices, cursor, isWriting]);
  useEffect(showSelectedChoice, [cursor, showChoices]);

  // A new line starts to be written.
  function newLine() {
    setStartedAt(Date.now());
    setCursor(0);
  }

  // While the line is written, the box is redrawn often: the letters appear smoothly, and the speaker's voice chirps.
  function animateLetters() {
    if (!isWriting) return undefined;
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      if (speaker && step % 3 === 1) playEffect(voiceSoundFor(speaker.id));
      setTick((tick) => tick + 1);
    }, 30);
    return () => clearInterval(timer);
  }

  // A long list of choices scrolls: the choice selected with the arrows always stays in view.
  function showSelectedChoice() {
    if (!showChoices || !choicesRef.current) return;
    const selected = choicesRef.current.children[cursor];
    if (selected) selected.scrollIntoView({ block: 'nearest' });
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

  const showExpression = Boolean(speaker && speaker.look && speaker.look.sheet);

  return (
    <div className="dialog-area">
      {(showChoices || showExpression) && (
        <div className="dialog-top">
          {showChoices ? (
            <div className="window choices" ref={choicesRef}>
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
          ) : (
            <div />
          )}
          <ExpressionBadge game={game} speaker={speaker} dialog={dialog} stepExpr={stepObj?.expr} />
        </div>
      )}
      <div className="window dialog" onClick={showChoices ? null : tap}>
        {speaker && speaker.look && <Portrait look={speaker.look} size={96} />}
        <div className="grow">
          {speaker && <span className="dialog-name">{speaker.name}:</span>}
          <span className={'dialog-text' + (speaker ? '' : ' narrator')}>{line.slice(0, shown)}</span>
        </div>
        {!showChoices && !isWriting && <span className="blink">▼</span>}
      </div>
    </div>
  );
}
