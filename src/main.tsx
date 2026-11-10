import './pwa';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { computerMove, outcome, type Board, type Difficulty } from './games/tic-tac-toe/logic';
import './style.css';

const games = [
  {name:'Tic-Tac-Toe',icon:'✕',subtitle:'Classic three-in-a-row',ready:true},
  {name:'Spades',icon:'♠',subtitle:'Trick-taking strategy'},
  {name:'Dominoes',icon:'🁣',subtitle:'Match your tiles'},
  {name:'Solitaire',icon:'♥',subtitle:'A timeless card puzzle'},
  {name:'Hearts',icon:'♡',subtitle:'Avoid the penalty cards'},
  {name:'Checkers',icon:'⛀',subtitle:'Capture the board'},
  {name:'Chess',icon:'♞',subtitle:'Outsmart your opponent'},
  {name:'Connect Four',icon:'●',subtitle:'Four in a row'}
];
function App(){
  const [playing,setPlaying]=useState(false);
  const [board,setBoard]=useState<Board>(Array(9).fill(null));
  const [difficulty,setDifficulty]=useState<Difficulty>('medium');
  const [scores,setScores]=useState({wins:0,losses:0,draws:0});
  const [thinking,setThinking]=useState(false);
  const result=outcome(board);
  const reset=()=>{setBoard(Array(9).fill(null));setThinking(false)};
  const play=(i:number)=>{
    if(thinking||result||board[i])return;
    const next=[...board];next[i]='X';setBoard(next);
    const end=outcome(next);
    if(end){setScores(s=>({...s,[end==='X'?'wins':'draws']:s[end==='X'?'wins':'draws']+1}));}
    else setThinking(true);
  };
  useEffect(()=>{
    if(!thinking)return;
    const timer=setTimeout(()=>{
      setBoard(current=>{
        if(outcome(current))return current;
        const move=computerMove(current,difficulty);
        if(move<0)return current;
        const next=[...current];next[move]='O';
        const end=outcome(next);
        if(end)setScores(s=>({...s,[end==='O'?'losses':'draws']:s[end==='O'?'losses':'draws']+1}));
        return next;
      });
      setThinking(false);
    },420);
    return ()=>clearTimeout(timer);
  },[thinking,difficulty]);
  return <div className="shell">
    <header><button className="brand" onClick={()=>{setPlaying(false);reset()}}>✦ <span>ARCADE</span></button><span className="topline">YOUR PERSONAL GAME ROOM</span></header>
    {!playing?<main><section className="hero"><div className="eyebrow">WELCOME TO THE ARCADE</div><h1>Pick a game.<br/><em>Make your move.</em></h1><p>Classic favorites, smart computer opponents, and a little friendly competition. Your next game starts here.</p><div className="stat"><strong>8</strong> games in the library <span>·</span> <strong>1</strong> ready to play</div></section>
      <div className="section-heading"><h2>Game library</h2><span>Choose your challenge</span></div>
      <div className="library">{games.map((game,index)=><article className={'game-card '+(game.ready?'available':'unavailable')} key={game.name}><div className={'game-icon icon-'+index}>{game.icon}</div><div className="card-content"><h3>{game.name}</h3><p>{game.subtitle}</p></div>{game.ready?<button className="play" onClick={()=>{reset();setPlaying(true)}}>Play now <span>→</span></button>:<span className="coming">COMING SOON</span>}</article>)}</div>
    </main>:<main className="game-screen"><button className="back" onClick={()=>{setPlaying(false);reset()}}>← Back to games</button><div className="game-panel"><div className="eyebrow">SINGLE PLAYER · VS COMPUTER</div><h1>Tic-Tac-Toe</h1><p className="instructions">You're <strong>X</strong>. Get three in a row before the computer does.</p>
    <div className="scoreboard"><div><strong>{scores.wins}</strong><span>YOU</span></div><div><strong>{scores.draws}</strong><span>DRAWS</span></div><div><strong>{scores.losses}</strong><span>COMPUTER</span></div></div>
    <label className="difficulty">Computer difficulty <select value={difficulty} onChange={e=>{setDifficulty(e.target.value as Difficulty);reset()}}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
    <div className="board" role="group" aria-label="Tic-Tac-Toe board">{board.map((cell,i)=><button key={i} className={'cell '+(cell==='X'?'human':cell==='O'?'computer':'')} aria-label={'Cell '+(i+1)+(cell?' '+cell:' empty')} disabled={!!cell||!!result||thinking} onClick={()=>play(i)}>{cell}</button>)}</div>
    <div className="status" aria-live="polite">{result==='X'?'You win! 🎉':result==='O'?'Computer wins!':result==='draw'?"It's a draw!":thinking?'Computer is thinking…':'Your move'}</div>
    <button className="restart" onClick={reset}>↻ Play again</button></div></main>}
    <footer>MADE FOR PLAY <span>✦</span> ARCADE V0.1</footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
