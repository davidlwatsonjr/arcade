export type Side=0|1;export type State={pits:number[],turn:Side,winner:Side|2|null,record:[number,number],message:string};
export const start=(record:[number,number]=[0,0]):State=>({pits:[4,4,4,4,4,4,0,4,4,4,4,4,4,0],turn:0,winner:null,record,message:'Your turn — choose a pit on the bottom row.'});
export const options=(s:State):number[]=>s.winner!==null?[]:(s.turn===0?[0,1,2,3,4,5]:[7,8,9,10,11,12]).filter(i=>s.pits[i]>0);
export function move(s:State,at:number):State{if(!options(s).includes(at))return s;const p=s.pits.slice(),me=s.turn,myStore=me===0?6:13,otherStore=me===0?13:6;let n=p[at],i=at;p[at]=0;while(n){i=(i+1)%14;if(i===otherStore)continue;p[i]++;n--}
 if(p[i]===1&&i!==myStore&&(me===0?i<6:i>6&&i<13)){const opp=12-i;if(p[opp]){p[myStore]+=p[opp]+1;p[opp]=0;p[i]=0}}
 let turn:Side=i===myStore?me:(1-me) as Side;let winner:Side|2|null=null;
 if(p.slice(0,6).every(x=>x===0)||p.slice(7,13).every(x=>x===0)){p[6]+=p.slice(0,6).reduce((a,b)=>a+b,0);p[13]+=p.slice(7,13).reduce((a,b)=>a+b,0);for(let j=0;j<14;j++)if(j!==6&&j!==13)p[j]=0;winner=p[6]===p[13]?2:p[6]>p[13]?0:1}
 const record:[number,number]=[...s.record];if(winner!==null&&winner!==2)record[winner]++;
 const message=winner!==null?(winner===2?'Draw!':winner===0?'You win!':'Computer wins!'):turn===me?'Free turn — play again.':turn===0?'Your turn.':'Computer is thinking…';
 return {...s,pits:p,turn,winner,record,message}}
export function computer(s:State):State{if(s.turn!==1||s.winner!==null)return s;const moves=options(s);const scored=moves.map(i=>{const n=move(s,i);return {i,value:(n.pits[13]-s.pits[13])*3+(n.turn===1?5:0)-(n.pits[6]-s.pits[6])*2+Math.random()*.15}});scored.sort((a,b)=>b.value-a.value);return move(s,scored[0].i)}
