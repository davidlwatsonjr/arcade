import { useEffect } from 'react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { computerMove, outcome, type Board, type Difficulty } from './logic';

export function TicTacToe({onBack}:{onBack:()=>void}) {
  const [board,setBoard]=usePersistentState<Board>('arcade.tictactoe.board.v1',()=>Array(9).fill(null));
  const [difficulty,setDifficulty]=usePersistentState<Difficulty>('arcade.tictactoe.difficulty.v1','medium');
  const [scores,setScores]=usePersistentState('arcade.tictactoe.scores.v1',{wins:0,losses:0,draws:0});
  const result=outcome(board);
  const computerTurn=!result&&board.filter(c=>c==='X').length>board.filter(c=>c==='O').length;
  useEffect(()=>{
    if(!computerTurn)return;
    const timer=window.setTimeout(()=>{
      const move=computerMove(board,difficulty);
      if(move<0)return;
      const next=[...board];next[move]='O';setBoard(next);
      const end=outcome(next);
      if(end)setScores(s=>({...s,[end==='O'?'losses':'draws']:s[end==='O'?'losses':'draws']+1}));
    },420);
    return ()=>window.clearTimeout(timer);
  },[board,computerTurn,difficulty,setBoard,setScores]);
  const play=(i:number)=>{
    if(computerTurn||result||board[i])return;
    const next=[...board];next[i]='X';setBoard(next);
    const end=outcome(next);
    if(end)setScores(s=>({...s,[end==='X'?'wins':'draws']:s[end==='X'?'wins':'draws']+1}));
  };
  const reset=()=>setBoard(Array(9).fill(null));
  return <main className="game-screen"><button className="back" onClick={onBack}>← Back to games</button><div className="game-panel"><div className="eyebrow">SINGLE PLAYER · VS COMPUTER</div><h1>Tic-Tac-Toe</h1><p className="instructions">You're <strong>X</strong>. Get three in a row before the computer does.</p>
    <div className="scoreboard"><div><strong>{scores.wins}</strong><span>YOU</span></div><div><strong>{scores.draws}</strong><span>DRAWS</span></div><div><strong>{scores.losses}</strong><span>COMPUTER</span></div></div>
    <label className="difficulty">Computer difficulty <select value={difficulty} onChange={e=>{setDifficulty(e.target.value as Difficulty);reset()}}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
    <div className="board" role="group" aria-label="Tic-Tac-Toe board">{board.map((cell,i)=><button key={i} className={'cell '+(cell==='X'?'human':cell==='O'?'computer':'')} aria-label={'Cell '+(i+1)+(cell?' '+cell:' empty')} disabled={!!cell||!!result||computerTurn} onClick={()=>play(i)}>{cell}</button>)}</div>
    <div className="status" aria-live="polite">{result==='X'?'You win! 🎉':result==='O'?'Computer wins!':result==='draw'?"It's a draw!":computerTurn?'Computer is thinking…':'Your move'}</div>
    <button className="restart" onClick={reset}>↻ Play again</button></div></main>;
}
