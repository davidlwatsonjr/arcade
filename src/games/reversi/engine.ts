export type Side=1|-1;
export type State={board:number[],turn:Side,winner:Side|0|null,record:[number,number],message:string};
const dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
export const start=(record:[number,number]=[0,0]):State=>{const b=Array(64).fill(0);b[27]=-1;b[28]=1;b[35]=1;b[36]=-1;return {board:b,turn:1,winner:null,record,message:'Your move — lavender discs.'}};
export function flips(board:number[],at:number,side:Side):number[]{if(board[at]!==0)return [];const r=Math.floor(at/8),c=at%8,result:number[]=[];
 for(const [dr,dc] of dirs){let y=r+dr,x=c+dc;const found:number[]=[];while(y>=0&&y<8&&x>=0&&x<8&&board[y*8+x]===-side){found.push(y*8+x);y+=dr;x+=dc}if(found.length&&y>=0&&y<8&&x>=0&&x<8&&board[y*8+x]===side)result.push(...found)}
 return result}
export const legal=(board:number[],side:Side):number[]=>board.flatMap((v,i)=>v===0&&flips(board,i,side).length?[i]:[]);
export function play(s:State,at:number):State{if(s.winner!==null)return s;const toFlip=flips(s.board,at,s.turn);if(!toFlip.length)return s;const board=s.board.slice();board[at]=s.turn;toFlip.forEach(i=>board[i]=s.turn);
 const next=(-s.turn) as Side;const theirs=legal(board,next),ours=legal(board,s.turn);if(theirs.length)return {...s,board,turn:next,message:next===1?'Your move.':'Computer is thinking…'};
 if(ours.length)return {...s,board,message:'Opponent must pass; play again.'};
 const a=board.filter(x=>x===1).length,b=board.filter(x=>x===-1).length;const winner:Side|0=a===b?0:a>b?1:-1;const record:[number,number]=[...s.record];if(winner)record[winner===1?0:1]++;
 return {...s,board,winner,record,message:winner===0?'Draw!':winner===1?'You win!':'Computer wins!'};}
export function computer(s:State):State{if(s.turn!==-1||s.winner!==null)return s;const moves=legal(s.board,-1);if(!moves.length)return {...s,turn:1,message:'Computer passes.'};
 const score=(at:number)=>{const board=s.board.slice(),taken=flips(board,at,-1);board[at]=-1;taken.forEach(i=>board[i]=-1);const r=Math.floor(at/8),c=at%8;return taken.length+(r===0||r===7?4:0)+(c===0||c===7?4:0)+((r===0||r===7)&&(c===0||c===7)?80:0)-legal(board,1).length*.65+(Math.random()*.15)};
 const move=moves.slice().sort((a,b)=>score(b)-score(a))[0];return play(s,move)}
