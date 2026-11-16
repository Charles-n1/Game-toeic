// TEMPORARY test harness (not part of the app): opens the world directly. ?x=&y=&hour=&dialog=0
import { createRoot } from 'react-dom/client';
import './index.css';
import './game/ui/game.css';
import GameWorld from './game/ui/GameWorld';
import { GameOptionsContext } from './game/ui/gameOptions';
import { DEFAULT_OPTIONS } from './game/logic/options';
import { newGame } from './game/logic/newGame';
import { DEFAULT_HERO } from './game/data/hero';
import { QUESTIONS } from './data/questions';
import { makeMonster } from './game/logic/monsters';
import { startFight } from './game/logic/fight';
window.dev = { makeMonster, startFight };

const params = new URLSearchParams(location.search);
const game = newGame(params.get('goal') || 'hero', 600, {}, { ...DEFAULT_HERO, name: 'Test' }, 3);
window.game = game;
if (params.get('dialog') !== '1') { game.run.dialog = null; game.run.screen = 'play'; game.run.waitingDialogs = []; }
if (params.get('x')) { game.player.x = Number(params.get('x')); game.player.y = Number(params.get('y')); }
if (params.get('hour')) game.hour = Number(params.get('hour'));
if (params.get('weather')) game.weather = { kind: params.get('weather'), windy: false, until: 1e9 };
if (params.get('monsters')) {
  game.run.safeUntil = Date.now() + 1e9;
  params.get('monsters').split(',').forEach((id, i) => {
    const m = makeMonster(game, id, game.player.x - 7 + (i % 8) * 2, game.player.y - 3 + Math.floor(i / 8) * 3, { key: 'test' + i, zoneId: 'none' });
    m.dir = i % 2 ? 'right' : 'left';
    game.run.monsters.push(m);
  });
}
if (params.get('run')) new Function('game', params.get('run'))(game);
window.addEventListener('error', (e) => { document.title = 'ERR ' + e.message; });
createRoot(document.getElementById('root')).render(
  <GameOptionsContext value={{ options: DEFAULT_OPTIONS, changeOption: () => {} }}>
    <div className="game wide" style={{ '--ui': 1.4 }}>
      <GameWorld game={game} questions={QUESTIONS} goalRate={80} onAnswer={() => {}} onRestart={() => {}} onQuit={() => {}} />
    </div>
  </GameOptionsContext>
);
