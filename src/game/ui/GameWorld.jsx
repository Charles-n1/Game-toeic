import { useEffect, useRef, useState } from 'react';
import useCanvas from './useCanvas';
import Hud from './Hud';
import DialogBox from './DialogBox';
import FightScreen from './FightScreen';
import ShopScreen from './ShopScreen';
import MenuScreen from './menu/MenuScreen';
import GameOver from './GameOver';
import { drawScene } from '../draw/scene';
import { makeInput, releaseAll, ACTION_KEYS } from '../logic/input';
import { updateGame, updateEffects, act } from '../logic/update';
import { saveGame } from '../logic/save';
import { takeCues } from '../logic/cues';
import { useGameOptions } from './gameOptions';
import { songFor } from '../audio/soundtrack';
import { playSong } from '../audio/music';
import { playEffect } from '../audio/effects';

const REFRESH_EVERY = 0.2; // seconds between two updates of the HUD (the world itself is drawn at every frame)
const SHORTCUTS = { i: 'inventory', b: 'inventory', p: 'powers', j: 'quests', m: 'map', c: 'stats', o: 'options' }; // keyboard: a key opens a menu window

// The game being played: the world on a canvas, and the screens of the game on top of it.
// goalRate: the success rate the player aims for (%). onAnswer(question, isCorrect): tells the app about each answer.
export default function GameWorld({ game, questions, goalRate, onAnswer, onRestart, onQuit }) {
  const input = useRef(makeInput()).current;
  const lastRefresh = useRef(0);
  const shownScreen = useRef('play');
  const [, setCount] = useState(0);
  const screen = game.run.screen;
  const { options } = useGameOptions();

  // The game reads these each time it needs them: they always follow the app and the options.
  game.run.questions = questions;
  game.run.goalRate = goalRate;
  game.run.onAnswer = onAnswer;
  game.run.relaxed = options.relaxed;
  game.run.textSpeed = options.textSpeed;

  const canvasRef = useCanvas(frame);
  useEffect(listenToKeyboard, []);

  // Draws the React part again (the canvas does not need it).
  function refresh() {
    setCount((count) => count + 1);
  }

  // One frame: the world moves (only while the player is on the map), then it is drawn.
  function frame(ctx, width, height, time, dt) {
    if (game.run.screen === 'play') updateGame(game, input, dt);
    else releaseAll(input);
    if (game.run.screen !== 'play') game.run.walking = false;
    updateEffects(game, dt);
    drawScene(ctx, game, width, height, time);
    playSong(songFor(game));
    takeCues(game).forEach(playEffect);

    const screenChanged = game.run.screen !== shownScreen.current;
    if (screenChanged || time - lastRefresh.current > REFRESH_EVERY) {
      shownScreen.current = game.run.screen;
      lastRefresh.current = time;
      refresh();
    }
  }

  function listenToKeyboard() {
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }

  function keyDown(event) {
    const current = game.run.screen;
    if (current === 'play') {
      if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault(); // no page scrolling
      input.keys[event.key] = true;
      if (ACTION_KEYS.includes(event.key) && !event.repeat) doAction();
      if (SHORTCUTS[event.key.toLowerCase()]) openMenu(SHORTCUTS[event.key.toLowerCase()]);
      if (event.key === 'Escape') openMenu(null);
    } else if ((current === 'menu' || current === 'shop') && event.key === 'Escape') {
      close();
    }
  }

  function keyUp(event) {
    input.keys[event.key] = false;
  }

  function doAction() {
    act(game);
    refresh();
  }

  // tab: the window to open ('stats', 'map'...), null = the list of the menu.
  function openMenu(tab) {
    game.run.menuTab = tab;
    game.run.screen = 'menu';
    refresh();
  }

  function close() {
    game.run.screen = 'play';
    refresh();
  }

  function quit() {
    saveGame(game);
    onQuit();
  }

  return (
    <div className="screen">
      <canvas ref={canvasRef} className="game-canvas" />
      {screen === 'play' && <Hud game={game} input={input} onAction={doAction} onMenu={openMenu} />}
      {screen === 'dialog' && <DialogBox game={game} refresh={refresh} />}
      {screen === 'fight' && <FightScreen game={game} refresh={refresh} />}
      {screen === 'shop' && <ShopScreen game={game} refresh={refresh} onClose={close} />}
      {screen === 'menu' && <MenuScreen game={game} refresh={refresh} onClose={close} onQuit={quit} />}
      {screen === 'over' && <GameOver game={game} onRestart={onRestart} onQuit={onQuit} />}
    </div>
  );
}
