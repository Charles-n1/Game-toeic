// How the game talks to the player: dialogs (someone speaks, with choices) and toasts (small messages on top).

// Opens a dialog. If one is already open, this one waits for its turn.
// speaker: the id of a person ('aria'), or null for the narrator.
// choices: [{ label, run: function }] shown under the last line (none = just "close").
function applyDialogStepState(game, dialog) {
  if (!dialog) {
    game.run.dialogLineSpeaker = undefined;
    game.run.dialogTheme = null;
    game.run.cameraTarget = null;
    return;
  }
  const step = dialog.lines?.[dialog.index];
  if (step && typeof step === 'object') {
    const spk = step.speaker !== undefined ? step.speaker : dialog.speaker;
    game.run.dialogLineSpeaker = spk;
    if (step.expr) game.run.dialogExpression = { npcId: spk, expr: step.expr };
    if (step.song) game.run.dialogTheme = step.song;
    game.run.cameraTarget = step.camera || null;
  } else {
    game.run.dialogLineSpeaker = dialog.speaker;
    game.run.cameraTarget = null;
  }
}

export function dialogStepText(step) {
  return typeof step === 'string' ? step : step?.text || '';
}

export function say(game, speaker, lines, choices = []) {
  const dialog = { speaker: speaker, lines: lines, index: 0, choices: choices };
  if (game.run.dialog) {
    game.run.waitingDialogs.push(dialog);
  } else {
    game.run.dialog = dialog;
    game.run.screen = 'dialog';
    applyDialogStepState(game, dialog);
  }
}

// The player tapped the dialog: the next line, or the end.
export function nextLine(game) {
  const dialog = game.run.dialog;
  if (dialog.index < dialog.lines.length - 1) {
    dialog.index += 1;
    applyDialogStepState(game, dialog);
  } else if (dialog.choices.length === 0) {
    closeDialog(game);
  }
}

// Closes the dialog, and opens the next one that was waiting.
export function closeDialog(game) {
  game.run.dialog = game.run.waitingDialogs.shift() || null;
  if (game.run.dialog) {
    game.run.screen = 'dialog';
    applyDialogStepState(game, game.run.dialog);
  } else {
    applyDialogStepState(game, null);
    if (game.run.screen === 'dialog') game.run.screen = 'play';
  }
}

// The player picked a choice of the dialog.
export function choose(game, choice) {
  closeDialog(game);
  choice.run();
}

// A small message that disappears after a few seconds.
export function notify(game, text, color = '#ffffff') {
  game.run.toasts.push({ text: text, color: color, until: Date.now() + 3500 });
  if (game.run.toasts.length > 4) game.run.toasts.shift();
}

export function removeOldToasts(game) {
  game.run.toasts = game.run.toasts.filter((toast) => toast.until > Date.now());
}
