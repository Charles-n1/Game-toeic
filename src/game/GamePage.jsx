import { useEffect, useState } from 'react';
import TitleScreen from './ui/TitleScreen';
import SlotScreen from './ui/SlotScreen';
import GameStart from './ui/GameStart';
import OptionsScreen from './ui/OptionsScreen';
import CreditsScreen from './ui/CreditsScreen';
import GameWorld from './ui/GameWorld';
import { GameOptionsContext } from './ui/gameOptions';
import useScreen from './ui/useScreen';
import { newGame } from './logic/newGame';
import { loadGame, saveGame } from './logic/save';
import { loadOptions, saveOptions } from './logic/options';
import { muteAppMusic } from '../sounds';
import { playSong, stopSong } from './audio/music';
import { setVolumes } from './audio/synth';
import { playEffect } from './audio/effects';
import './ui/game.css';

// On a big screen, the windows of the game are drawn bigger: 1 on a phone, up to 2 on a big screen.
function uiZoom(shape) {
  return Math.max(1, Math.min(2, shape.width / 760, shape.height / 600));
}

// The window of the game "Lexia": an isekai where the fights are TOEIC questions. It covers the whole app.
// The screens: 'title' (the main menu) -> 'slots' (the 3 saves) -> 'create' (a new hero) -> 'play' (the world).
// And 'options', 'credits' from the title.
// stats, history: the answers of the app (to know the level of the player).
// onAnswer(question, isCorrect): each answer of the game goes back to the app (stats, recovery).
// onTakeTest: the player wants to do the level test first. onClose: back to the app.
export default function GamePage({ questions, stats, history, goalRate, onAnswer, onTakeTest, onClose }) {
  const [screen, setScreen] = useState('title');
  const [game, setGame] = useState(null);
  const [slot, setSlot] = useState(1); // the slot of the new game being created
  const [options, setOptions] = useState(loadOptions);
  const shape = useScreen();

  useEffect(takeOverTheSound, []);
  useEffect(applyVolumes, [options.musicVolume, options.effectsVolume]);
  useEffect(menuMusic, [screen]);

  // While the game is open, the app's music stops and the game plays its own.
  function takeOverTheSound() {
    muteAppMusic(true);
    return () => {
      stopSong();
      muteAppMusic(false);
    };
  }

  // The menus have the music of the title. Tried again every half second: the sound sleeps until the first tap.
  // (In the world, GameWorld chooses the music.)
  function menuMusic() {
    if (screen === 'play') return undefined;
    playSong('ending');
    const timer = setInterval(() => playSong('ending'), 500);
    return () => clearInterval(timer);
  }

  function applyVolumes() {
    setVolumes(options.musicVolume, options.effectsVolume);
  }

  function changeOption(key, value) {
    const changed = { ...options, [key]: value };
    setOptions(changed);
    saveOptions(changed);
  }

  // A tap on any button of the game: a small click.
  function clickSound(event) {
    if (event.target.closest('button')) playEffect('click');
  }

  function play(slotNumber) {
    setGame(loadGame(slotNumber));
    setScreen('play');
  }

  function createIn(slotNumber) {
    setSlot(slotNumber);
    setScreen('create');
  }

  // hero: { name, body, style, hair, outfit }
  function start(goalId, score, hero) {
    const created = newGame(goalId, score, stats, hero, slot);
    saveGame(created); // the slot is taken at once
    setGame(created);
    setScreen('play');
  }

  // "Quit" in the game, or after a real death: back to the title.
  function backToTitle() {
    setGame(null);
    setScreen('title');
  }

  function renderScreen() {
    if (screen === 'play' && game) {
      return <GameWorld game={game} questions={questions} goalRate={goalRate} onAnswer={onAnswer} onRestart={backToTitle} onQuit={backToTitle} />;
    }
    if (screen === 'slots') return <SlotScreen onPlay={play} onCreate={createIn} onBack={backToTitle} />;
    if (screen === 'create') return <GameStart stats={stats} history={history} onStart={start} onTakeTest={onTakeTest} onBack={() => setScreen('slots')} />;
    if (screen === 'options') return <OptionsScreen onBack={backToTitle} />;
    if (screen === 'credits') return <CreditsScreen onBack={backToTitle} />;
    return <TitleScreen onContinue={play} onNewGame={() => setScreen('slots')} onOptions={() => setScreen('options')} onCredits={() => setScreen('credits')} onClose={onClose} />;
  }

  return (
    <GameOptionsContext value={{ options: options, changeOption: changeOption }}>
      <div className={'game' + (shape.wide ? ' wide' : '') + (shape.touch ? ' touch' : '')} style={{ '--ui': uiZoom(shape) }} onClickCapture={clickSound}>
        {renderScreen()}
      </div>
    </GameOptionsContext>
  );
}
