// A walkie-talkie to talk to Frend 📻 (like a ping on Discord).
// Anyone can send a message: tellFrend({ type: 'score', good: true }).
// Frend (FrendCompanion) listens, and decides what to do with it.
let listener = null; // who listens (null = nobody)

export function tellFrend(message) {
  if (listener) listener(message);
}

// Starts listening. Returns the function that stops listening.
export function listenToFrend(callback) {
  listener = callback;
  return function stopListening() {
    if (listener === callback) listener = null;
  };
}
