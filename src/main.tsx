import './pwa';
import React, { useEffect, useState } from 'react';
import catalog from './game-catalog.json';
import { Lobby } from './lobby/Lobby';
import { createRoot } from 'react-dom/client';
import { TicTacToe } from './games/tic-tac-toe/TicTacToe';
import { SpadesGame } from './games/spades/SpadesGame';
import { ConnectFour } from './games/connect-four/ConnectFour';
import { Checkers } from './games/checkers/Checkers';
import { Dominoes } from './games/dominoes/Dominoes';
import { Solitaire } from './games/solitaire/Solitaire';
import { Hearts } from './games/hearts/Hearts';
import { ChessGame } from './games/chess/ChessGame';
import { Blackjack } from './games/blackjack/Blackjack';
import { GoFish } from './games/go-fish/GoFish';
import { Yahtzee } from './games/yahtzee/Yahtzee';
import { Tonk } from './games/tonk/Tonk';
import { Backgammon } from './games/backgammon/Backgammon';
import { ChineseCheckers } from './games/chinese-checkers/ChineseCheckers';
import { Uno } from './games/uno/Uno';
import { Reversi } from './games/reversi/Reversi';
import { GinRummy } from './games/gin-rummy/GinRummy';
import { Euchre } from './games/euchre/Euchre';
import { Cribbage } from './games/cribbage/Cribbage';
import { Battleship } from './games/battleship/Battleship';
import { Mancala } from './games/mancala/Mancala';
import { Farkle } from './games/farkle/Farkle';
import { Sudoku } from './games/sudoku/Sudoku';
import { SumLogic } from './games/sum-logic/SumLogic';
import { Wordle } from './games/wordle/Wordle';
import { Spider } from './games/spider/Spider';
import { FreeCell } from './games/freecell/FreeCell';
import './style.css';
import { useBoardKeyboard } from './accessibility/useBoardKeyboard';
import { AccessibilitySettings, useAccessibility } from './accessibility/Settings';
import './accessibility/global.css';
import './style-accessibility.css';
import './style-spades.css';
import './style-games.css';
import './style-new-games.css';
import './style-classics.css';
import './style-card-drag.css';

const components = {
  'Tic-Tac-Toe': TicTacToe,
  'Spades': SpadesGame,
  'Dominoes': Dominoes,
  'Solitaire': Solitaire,
  'Hearts': Hearts,
  'Checkers': Checkers,
  'Chess': ChessGame,
  'Connect Four': ConnectFour,
  'Blackjack': Blackjack,
  'Go Fish': GoFish,
  'Yahtzee': Yahtzee,
  'Tonk': Tonk,
  'Backgammon': Backgammon,
  'Chinese Checkers': ChineseCheckers,
  'Uno': Uno,
  'Reversi': Reversi,
  'Gin Rummy': GinRummy,
  'Euchre': Euchre,
  'Cribbage': Cribbage,
  'Battleship': Battleship,
  'Mancala': Mancala,
  'Farkle': Farkle,
  'Sudoku': Sudoku,
  'Sum Logic': SumLogic,
  'Wordle': Wordle,
  'Spider Solitaire': Spider,
  'FreeCell Solitaire': FreeCell,
} satisfies Record<string, React.ComponentType<{ onBack: () => void }>>;

type PlayableGameName = keyof typeof components;
const games = catalog;
const playableCount = games.length;
const route = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
const activeGame = games.find(g => route === '/games/' + g.slug);
const gamePath = (slug:string) => '/games/' + slug + '/';
const home = () => window.location.assign('/');

function OfflineStatus() {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    let mounted = true;
    const update = () => { if (mounted) setOnline(navigator.onLine); };
    const onController = () => { if (mounted) setReady(true); };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', onController);
      navigator.serviceWorker.ready.then(onController).catch(() => {});
    }
    return () => {
      mounted = false;
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      if ('serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('controllerchange', onController);
    };
  }, []);
  return <span className={'offline-indicator ' + (ready ? 'ready' : '')} role="status">
    {ready ? (online ? '✓ Offline ready' : '✓ Playing offline') : (online ? 'Preparing offline…' : 'Offline data unavailable')}
  </span>;
}
function App() {
  const [access,setAccess]=useAccessibility();
  useBoardKeyboard();
  const [settings,setSettings]=useState(false);
  const GameComponent = activeGame ? components[activeGame.name as PlayableGameName] : null;

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header>
        <a className="brand" href="/">✦ <span>ARCADE</span></a>
        <div className="header-meta"><span className="topline">YOUR PERSONAL GAME ROOM</span><OfflineStatus /><button id="settings-trigger" className="access-settings" aria-controls="access-panel" aria-expanded={settings} onClick={()=>setSettings(v=>!v)}>⚙ Settings</button></div>
      </header>
      {settings&&<AccessibilitySettings value={access} onChange={setAccess} onClose={()=>{setSettings(false);document.getElementById("settings-trigger")?.focus()}} />}
      {GameComponent && activeGame ? <><div id="main-content" tabIndex={-1} className="game-content"><GameComponent onBack={home} /></div><section className="game-about"><h2>How to play {activeGame.name}</h2><p>{activeGame.description}</p><p>Play free in your browser. Your progress is stored on this device; after the first online load, Arcade can be played offline.</p><nav aria-label="Related games"><h3>More {activeGame.category.toLowerCase()} games</h3>{games.filter(g=>g.category===activeGame.category&&g.slug!==activeGame.slug).slice(0,6).map(g=><a key={g.slug} href={gamePath(g.slug)}>Play {g.name}</a>)}<a href="/">All games</a></nav></section></> : (
        <main id="main-content" tabIndex={-1}>
          <section className="hero">
            <div className="eyebrow">WELCOME TO THE ARCADE</div>
            <h1>Pick a game.<br /><em>Make your move.</em></h1>
            <p>Classic favorites, smart computer opponents, and a little friendly competition. Your next game starts here.</p>
            <div className="stat">
              <strong>{games.length}</strong> games in the library <span>·</span> <strong>{playableCount}</strong> ready to play
            </div>
          </section>
          <Lobby games={games} />
        </main>
      )}
      <footer><a href="/accessibility/">Accessibility</a> · MADE FOR PLAY <span>✦</span> ARCADE V0.12</footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
