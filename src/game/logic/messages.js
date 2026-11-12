// How the game talks to the player: dialogs (someone speaks, with choices) and toasts (small messages on top).

// Opens a dialog. If one is already open, this one waits for its turn.
// speaker: the id of a person ('aria'), or null for the narrator.
// choices: [{ label, run: function }] shown under the last line (none = just "close").
export function say(game, speaker, lines, choices = []) {
  const dialog = { speaker: speaker, lines: lines, index: 0, choices: choices };
  if (game.run.dialog) {
    game.run.waitingDialogs.push(dialog);
  } else {
    game.run.dialog = dialog;
    game.run.screen = 'dialog';
  }
}

// The player tapped the dialog: the next line, or the end.
export function nextLine(game) {
  const dialog = game.run.dialog;
  if (dialog.index < dialog.lines.length - 1) {
    dialog.index += 1;
  } else if (dialog.choices.length === 0) {
    closeDialog(game);
  }
}

// Closes the dialog, and opens the next one that was waiting.
export function closeDialog(game) {
  game.run.dialog = game.run.waitingDialogs.shift() || null;
  if (game.run.dialog) game.run.screen = 'dialog';
  else if (game.run.screen === 'dialog') game.run.screen = 'play';
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
