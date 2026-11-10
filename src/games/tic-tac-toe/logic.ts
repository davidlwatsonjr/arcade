export type Cell = 'X' | 'O' | null;
export type Board = Cell[];
export type Difficulty = 'easy' | 'medium' | 'hard';
const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export function outcome(board: Board): 'X'|'O'|'draw'|null {
  for (const [a,b,c] of lines) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  return board.every(Boolean) ? 'draw' : null;
}
export function available(board: Board): number[] { return board.flatMap((v,i)=>v===null?[i]:[]); }
function minimax(board: Board, computerTurn: boolean, depth=0): number {
  const result=outcome(board);
  if(result==='O') return 10-depth;
  if(result==='X') return depth-10;
  if(result==='draw') return 0;
  const scores=available(board).map(i=>{const next=[...board];next[i]=computerTurn?'O':'X';return minimax(next,!computerTurn,depth+1)});
  return computerTurn?Math.max(...scores):Math.min(...scores);
}
export function computerMove(board: Board, difficulty: Difficulty, random=Math.random): number {
  const moves=available(board);
  if(!moves.length || outcome(board)) return -1;
  if(difficulty==='easy' || (difficulty==='medium' && random()<0.4)) return moves[Math.floor(random()*moves.length)];
  const scored=moves.map(i=>{const next=[...board];next[i]='O';return {i,score:minimax(next,false)};});
  const best=Math.max(...scored.map(x=>x.score));
  const choices=scored.filter(x=>x.score===best);
  return choices[Math.floor(random()*choices.length)].i;
}
