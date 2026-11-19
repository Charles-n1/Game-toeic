// Before the tests: Node learns to read the code of the game (tests/loader.mjs), and gets the few browser
// things the rules of the game touch (localStorage for the saves).
import { register } from 'node:module';

register('./loader.mjs', import.meta.url);

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};
