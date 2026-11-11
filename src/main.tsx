import './pwa';
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {TicTacToe} from './games/tic-tac-toe/TicTacToe';
import {SpadesGame} from './games/spades/SpadesGame';
import './style.css';
import './style-spades.css';

type GameName = 'Tic-Tac-Toe' | 'Spades' | null;
const games = [
  {name:'Tic-Tac-Toe',icon:'✕',subtitle:'Classic three-in-a-row',ready:true},
  {name:'Spades',icon:'♠',subtitle:'Partnership trick-taking',ready:true},
  {name:'Dominoes',icon:'🁣',subtitle:'Match your tiles'},
  {name:'Solitaire',icon:'♥',subtitle:'A timeless card puzzle'},
  {name:'Hearts',icon:'♡',subtitle:'Avoid the penalty cards'},
  {name:'Checkers',icon:'⛀',subtitle:'Capture the board'},
  {name:'Chess',icon:'♞',subtitle:'Outsmart your opponent'},
  {name:'Connect Four',icon:'●',subtitle:'Four in a row'}
];
function App(){
  const [playing,setPlaying]=useState<GameName>(null);
  return <div className="shell"><header><button className="brand" onClick={()=>setPlaying(null)}>✦ <span>ARCADE</span></button><span className="topline">YOUR PERSONAL GAME ROOM</span></header>
    {playing==='Spades'?<SpadesGame onBack={()=>setPlaying(null)}/>:playing==='Tic-Tac-Toe'?<TicTacToe onBack={()=>setPlaying(null)}/>
    :<main><section className="hero"><div className="eyebrow">WELCOME TO THE ARCADE</div><h1>Pick a game.<br/><em>Make your move.</em></h1><p>Classic favorites, smart computer opponents, and a little friendly competition. Your next game starts here.</p><div className="stat"><strong>8</strong> games in the library <span>·</span> <strong>2</strong> ready to play</div></section>
    <div className="section-heading"><h2>Game library</h2><span>Choose your challenge</span></div>
    <div className="library">{games.map((game,index)=><article className={'game-card '+(game.ready?'available':'unavailable')} key={game.name}><div className={'game-icon icon-'+index}>{game.icon}</div><div className="card-content"><h3>{game.name}</h3><p>{game.subtitle}</p></div>{game.ready?<button className="play" onClick={()=>setPlaying(game.name as GameName)}>Play now <span>→</span></button>:<span className="coming">COMING SOON</span>}</article>)}</div></main>}
    <footer>MADE FOR PLAY <span>✦</span> ARCADE V0.2</footer></div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
