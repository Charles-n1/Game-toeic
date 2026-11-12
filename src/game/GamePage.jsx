import { useState } from 'react';
import GameStart from './ui/GameStart';
import GameWorld from './ui/GameWorld';
import { newGame } from './logic/newGame';
import { loadGame } from './logic/save';
import './ui/game.css';

// The window of the game "Lexia": an isekai where the fights are TOEIC questions.
// It covers the whole app. No game yet: the start screen (the level + the goal). Else: the world.
// stats, history: the answers of the app (to know the level of the player).
// onAnswer(question, isCorrect): each answer of the game goes back to the app (stats, recovery).
// onTakeTest: the player wants to do the level test first. onClose: back to the app.
export default function GamePage({ questions, stats, history, goalRate, onAnswer, onTakeTest, onClose }) {
  // useState(function): the save is read only once, when the window opens. null = no game yet.
  const [game, setGame] = useState(loadGame);

  function start(goalId, score) {
    setGame(newGame(goalId, score, stats));
  }

  // After a death: the save is already erased, back to the start screen.
  function restart() {
    setGame(null);
  }

  if (game === null) {
    return (
      <div className="game">
        <GameStart stats={stats} history={history} onStart={start} onTakeTest={onTakeTest} onClose={onClose} />
      </div>
    );
  }
  return <GameWorld game={game} questions={questions} goalRate={goalRate} onAnswer={onAnswer} onRestart={restart} onQuit={onClose} />;
}
