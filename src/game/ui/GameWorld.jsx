import { useEffect, useRef, useState } from 'react';
import useCanvas from './useCanvas';
import Hud from './Hud';
import DialogBox from './DialogBox';
import FightScreen from './FightScreen';
import ShopScreen from './ShopScreen';
import ChestScreen from './ChestScreen';
import MenuScreen from './menu/MenuScreen';
import GameOver from './GameOver';
import LevelUpModal from './LevelUpModal';
import EpisodeCardModal from './EpisodeCardModal';
import { drawScene } from '../draw/scene';
import { makeInput, releaseAll, normalizeKey, ACTION_KEYS } from '../logic/input';
import { updateGame, updateEffects, act } from '../logic/update';
import { closeChest } from '../logic/chest';
import { strikeWorld } from '../logic/animals';
import { saveGame } from '../logic/save';
import { toggleTorch } from '../logic/torch';
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
  game.run.goalRate = game.goalRate || goalRate;
  game.run.onAnswer = onAnswer;
  game.run.relaxed = options.relaxed;
  game.run.textSpeed = options.textSpeed;
  if (game.realism) game.realism.mode = options.realismLevel; // light / normal / hardcore (see realism/state.js)

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
    const clearKeys = () => releaseAll(input);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', clearKeys);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', clearKeys);
    };
  }

  function keyDown(event) {
    const key = normalizeKey(event.key);
    const current = game.run.screen;
    if (current === 'play') {
      if (key.startsWith('Arrow') || key === ' ') event.preventDefault(); // no page scrolling
      input.keys[key] = true;
      input.keys.Shift = Boolean(event.shiftKey);
      if (ACTION_KEYS.includes(key) && !event.repeat) doAction();
      if (key === 'f' && !event.repeat) doStrike();
      if (SHORTCUTS[key]) openMenu(SHORTCUTS[key]);
      if (key === 't' && !event.repeat) switchTorch();
      if (key === 'Escape') openMenu(null);
    } else if (current === 'chest' && key === 'Escape') {
      closeChest(game);
      refresh();
    } else if ((current === 'menu' || current === 'shop') && key === 'Escape') {
      close();
    }
  }

  function keyUp(event) {
    const key = normalizeKey(event.key);
    input.keys[key] = false;
    input.keys.Shift = Boolean(event.shiftKey);
  }

  function doAction() {
    act(game);
    refresh();
  }

  function doStrike() {
    if (game.run.screen !== 'play') return;
    strikeWorld(game);
    refresh();
  }

  // The torch of the hero: on or off.
  function switchTorch() {
    toggleTorch(game);
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

  const showIntroBanner = Boolean(game.run.introAnimUntil && game.run.introAnimUntil > Date.now());

  return (
    <div className="screen">
      <canvas ref={canvasRef} className="game-canvas" onClick={doStrike} />
      {showIntroBanner && (
        <div style={introBannerStyle}>
          <span className="gold" style={introTitleStyle}>
            ✦ SUMMONED TO LEXIA ✦
          </span>
          <span className="small">A new isekai chapter begins...</span>
        </div>
      )}
      {screen === 'play' && <Hud game={game} input={input} onAction={doAction} onStrike={doStrike} onMenu={openMenu} />}
      {screen === 'dialog' && (
        <div className="ui-layer">
          <DialogBox game={game} refresh={refresh} />
        </div>
      )}
      {screen === 'fight' && <FightScreen game={game} refresh={refresh} />}
      {screen === 'shop' && <ShopScreen game={game} refresh={refresh} onClose={close} />}
      {screen === 'chest' && <ChestScreen game={game} refresh={refresh} />}
      {screen === 'menu' && <MenuScreen game={game} refresh={refresh} onClose={close} onQuit={quit} />}
      {screen === 'over' && <GameOver game={game} onRestart={onRestart} onQuit={onQuit} />}
      {screen === 'play' && game.run.levelUpQueue?.length > 0 && (
        <LevelUpModal
          entry={game.run.levelUpQueue[0]}
          onClose={() => {
            game.run.levelUpQueue.shift();
            refresh();
          }}
        />
      )}
      {screen === 'play' && !(game.run.levelUpQueue?.length > 0) && game.run.episodeModal && (
        <EpisodeCardModal
          modal={game.run.episodeModal}
          onClose={() => {
            game.run.episodeModal = null;
            refresh();
          }}
        />
      )}
    </div>
  );
}

const introBannerStyle = {
  position: 'absolute',
  top: 18,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '8px 20px',
  background: 'rgba(14, 18, 42, 0.88)',
  border: '2px solid #ffd86b',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  pointerEvents: 'none',
  zIndex: 30,
};

const introTitleStyle = {
  fontSize: 18,
  letterSpacing: 1.5,
};
