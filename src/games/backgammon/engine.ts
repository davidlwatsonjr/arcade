export type Side=0|1;
export type Move={from:number|'bar';to:number|'off';die:number};
export type State={board:number[];bar:[number,number];off:[number,number];turn:Side;dice:number[];rolled:boolean;winner:Side|null;games:[number,number];turns:number;message:string};
const sign=(side:Side)=>side===0?1:-1;
export function fresh():State{const board=Array(24).fill(0) as number[];
board[23]=2;board[12]=5;board[7]=3;board[5]=5;
board[0]=-2;board[11]=-5;board[16]=-3;board[18]=-5;
return {board,bar:[0,0],off:[0,0],turn:0,dice:[],rolled:false,winner:null,games:[0,0],turns:1,message:'Roll the dice to begin.'}}
export const pipCount=(s:State,side:Side):number=>s.board.reduce((sum,n,i)=>sum+(n*sign(side)>0?Math.abs(n)*(side===0?i+1:24-i):0),s.bar[side]*25);
const home=(s:State,side:Side):boolean=>s.bar[side]===0&&s.board.every((n,i)=>n*sign(side)<=0||(side===0?i<=5:i>=18));
function primitive(s:State):Move[]{if(!s.rolled||s.winner!==null||!s.dice.length)return [];
const moves:Move[]=[],side=s.turn,who=sign(side);
for(const die of [...new Set(s.dice)]){
 const froms:(number|'bar')[]=s.bar[side]>0?['bar']:s.board.flatMap((n,i)=>n*who>0?[i]:[]);
 for(const from of froms){
  const to=from==='bar'?(side===0?24-die:die-1):from+(side===0?-die:die);
  if(to>=0&&to<24){if(s.board[to]*who>=-1)moves.push({from,to,die});continue}
  if(from==='bar'||!home(s,side))continue;
  const distance=side===0?from+1:24-from;
  if(die<distance)continue;
  if(die>distance&&s.board.some((n,i)=>n*who>0&&(side===0?i>from:i<from)))continue;
  moves.push({from,to:'off',die});
 }
}
return moves;
}
function raw(s:State,m:Move):State{
 const board=s.board.slice(),bar:[number,number]=[...s.bar],off:[number,number]=[...s.off],games:[number,number]=[...s.games],who=sign(s.turn);
 if(m.from==='bar')bar[s.turn]--;else board[m.from]-=who;
 if(m.to==='off')off[s.turn]++;else {if(board[m.to]===-who){bar[(1-s.turn) as Side]++;board[m.to]=0}board[m.to]+=who}
 const dice=s.dice.slice(),ix=dice.indexOf(m.die);dice.splice(ix,1);
 const winner=off[s.turn]===15?s.turn:null;if(winner!==null)games[winner]++;
 return {...s,board,bar,off,dice,rolled:true,winner,games,message:m.from==='bar'?'Checker entered from the bar.':m.to==='off'?'Checker borne off!':'Moved '+(m.from+1)+' → '+(m.to+1)+'.'};
}
function signature(s:State){return s.board.join(',')+'|'+s.bar.join(',')+'|'+s.off.join(',')+'|'+s.dice.slice().sort().join(',')}
function longest(s:State,memo:Map<string,number>):number{
 if(s.winner!==null)return 0;
 const m=primitive(s);if(!m.length)return 0;
 const k=signature(s);const cached=memo.get(k);if(cached!==undefined)return cached;
 let max=0;for(const opt of m){max=Math.max(max,1+longest(raw(s,opt),memo))}
 memo.set(k,max);return max;
}
export function options(s:State):Move[]{
 const moves=primitive(s);if(!moves.length)return [];
 const memo=new Map<string,number>();
 const values=moves.map(m=>1+longest(raw(s,m),memo));
 const best=Math.max(...values);
 let result=moves.filter((_,i)=>values[i]===best);
 // If only one die can be used and both dice could play, the higher die is compulsory.
 if(best===1&&s.dice.length===2&&s.dice[0]!==s.dice[1]){
  const high=Math.max(...result.map(m=>m.die));
  result=result.filter(m=>m.die===high);
 }
 return result;
}
export function endTurn(s:State):State{
 if(s.winner!==null||!s.rolled||(s.dice.length&&options(s).length))return s;
 return {...s,turn:(1-s.turn) as Side,dice:[],rolled:false,turns:s.turn===1?s.turns+1:s.turns,message:'Next player rolls.'};
}
export function roll(s:State,random=Math.random):State{
 if(s.rolled||s.winner!==null)return s;
 const a=Math.floor(random()*6)+1,b=Math.floor(random()*6)+1;
 return {...s,dice:a===b?[a,a,a,a]:[a,b],rolled:true,message:a===b?'Doubles! Four '+a+'s.':'Dice: '+a+' and '+b+'.'};
}
export function play(s:State,m:Move):State{
 if(!options(s).some(x=>x.from===m.from&&x.to===m.to&&x.die===m.die))return s;
 const next=raw(s,m);
 if(next.winner!==null)return {...next,message:(next.winner===0?'You win!':'Computer wins!')};
 return next.dice.length&&options(next).length?next:endTurn(next);
}
export function computerStep(s:State,random=Math.random):State{
 if(s.turn!==1||s.winner!==null)return s;
 if(!s.rolled)return roll(s,random);
 const legal=options(s);if(!legal.length)return endTurn(s);
 let best=legal[0],rating=-Infinity;
 for(const m of legal){const target=m.to==='off'?0:s.board[m.to];const r=(m.to==='off'?20:0)+(target===1?10:0)+(target<0?3:0)+m.die*.25+random()*.6;
 if(r>rating){rating=r;best=m}}
 return play(s,best);
}
