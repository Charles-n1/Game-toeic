// How Node reads the code of the game for the tests (the game is made for Vite, not for Node):
// - "import x from './file'" without ".js": Node looks for file.js, then file/index.js;
// - pictures, sounds, fonts and styles: an empty value (the rules of the game do not need them).
import { existsSync, statSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ASSETS = /\.(png|jpe?g|gif|mp3|ogg|wav|ttf|woff2?|css|svg)$/;

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

export async function resolve(specifier, context, next) {
  if (ASSETS.test(specifier)) return { url: 'data:text/javascript,export default ""', shortCircuit: true };
  if ((specifier.startsWith('.') || specifier.startsWith('/')) && context.parentURL?.startsWith('file:')) {
    const base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier);
    for (const path of [base, base + '.js', base + '.jsx', base + '/index.js']) {
      if (isFile(path)) return next(pathToFileURL(path).href, context);
    }
  }
  return next(specifier, context);
}
