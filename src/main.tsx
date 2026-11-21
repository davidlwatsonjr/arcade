import './pwa';
import React, { useEffect, useState } from 'react';
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
import './style.css';
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
} satisfies Record<string, React.ComponentType<{ onBack: () => void }>>;

type PlayableGameName = keyof typeof components;
type Game = {
  name: string;
  icon: string;
  subtitle: string;
  status: 'playable' | 'coming-soon';
  tentative?: boolean;
};

// The complete game catalog is deliberately independent of the playable-game registry.
// New games appear in the lobby without requiring unfinished implementations or imports.
const games: Game[] = [
  { name: 'Spades', icon: '♠', subtitle: 'Partnership trick-taking', status: 'playable' },
  { name: 'Tonk', icon: '♣', subtitle: 'Draw, discard, and knock', status: 'playable' },
  { name: 'Dominoes', icon: '🁣', subtitle: 'Match your tiles', status: 'playable' },
  { name: 'Chess', icon: '♞', subtitle: 'Outsmart the computer', status: 'playable' },
  { name: 'Checkers', icon: '⛀', subtitle: 'Jump to victory', status: 'playable' },
  { name: 'Backgammon', icon: '⚄', subtitle: 'Race your checkers home', status: 'playable' },
  { name: 'Chinese Checkers', icon: '✦', subtitle: 'Race across the star board', status: 'playable' },
  { name: 'Hearts', icon: '♡', subtitle: 'Avoid the penalty cards', status: 'playable' },
  { name: 'Solitaire', icon: '♥', subtitle: 'Klondike card puzzle', status: 'playable' },
  { name: 'Blackjack', icon: '21', subtitle: 'Beat the dealer without busting', status: 'playable' },
  { name: 'Uno', icon: '↻', subtitle: 'Match colors and numbers', status: 'playable' },
  { name: 'Go Fish', icon: '🐟', subtitle: 'Ask, collect, and make books', status: 'playable' },
  { name: 'Yahtzee', icon: '⚅', subtitle: 'Roll for the highest score', status: 'playable', tentative: true },
  { name: 'Tic-Tac-Toe', icon: '✕', subtitle: 'Classic three-in-a-row', status: 'playable' },
  { name: 'Connect Four', icon: '●', subtitle: 'Four in a row', status: 'playable' },
  { name: 'Reversi', icon: '◑', subtitle: 'Flip your rival’s discs', status: 'playable' },
  { name: 'Gin Rummy', icon: '♦', subtitle: 'Meld, knock and go Gin', status: 'playable' },
  { name: 'Euchre', icon: '♣', subtitle: 'Tricks, trump, and teamwork', status: 'playable' },
  { name: 'Cribbage', icon: '15', subtitle: 'Peg your way to 121', status: 'playable' },
  { name: 'Battleship', icon: '⚓', subtitle: 'Find and sink the fleet', status: 'playable' },
  { name: 'Mancala', icon: '◉', subtitle: 'Sow, capture, and score', status: 'playable' },
  { name: 'Farkle', icon: '⚄', subtitle: 'Push your luck with dice', status: 'playable' },
];

const playableCount = games.filter(game => game.status === 'playable').length;

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
  const [playing, setPlaying] = useState<PlayableGameName | null>(null);
  const GameComponent = playing ? components[playing] : null;

  return (
    <div className="shell">
      <header>
        <button className="brand" onClick={() => setPlaying(null)}>✦ <span>ARCADE</span></button>
        <div className="header-meta"><span className="topline">YOUR PERSONAL GAME ROOM</span><OfflineStatus /></div>
      </header>
      {GameComponent ? <GameComponent onBack={() => setPlaying(null)} /> : (
        <main>
          <section className="hero">
            <div className="eyebrow">WELCOME TO THE ARCADE</div>
            <h1>Pick a game.<br /><em>Make your move.</em></h1>
            <p>Classic favorites, smart computer opponents, and a little friendly competition. Your next game starts here.</p>
            <div className="stat">
              <strong>{games.length}</strong> games in the library <span>·</span> <strong>{playableCount}</strong> ready to play
            </div>
          </section>
          <div className="section-heading"><h2>Game library</h2><span>Choose your challenge</span></div>
          <div className="library">
            {games.map((game, index) => (
              <article className={'game-card ' + (game.status === 'playable' ? 'available' : 'unavailable')} key={game.name}>
                <div className={'game-icon icon-' + (index % 8)}>{game.icon}</div>
                <div className="card-content">
                  <h3>{game.name}</h3>
                  <p>{game.subtitle}</p>
                </div>
                {game.status === 'playable'
                  ? <button className="play" onClick={() => setPlaying(game.name as PlayableGameName)}>Play now <span>→</span></button>
                  : <span className="coming">{game.tentative ? 'PLANNED · TENTATIVE' : 'COMING SOON'}</span>}
              </article>
            ))}
          </div>
        </main>
      )}
      <footer>MADE FOR PLAY <span>✦</span> ARCADE V0.6</footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
