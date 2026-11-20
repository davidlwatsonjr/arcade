export type Side=0|1;export type State={score:[number,number],turn:Side,dice:number[],kept:number,selected:number[],unbanked:number,phase:'roll'|'choose'|'done',winner:Side|null,message:string,round:number};
export const start=():State=>({score:[0,0],turn:0,dice:[],kept:0,selected:[],unbanked:0,phase:'roll',winner:null,message:'Roll six dice and keep scoring combinations.',round:1});
export function points(dice:number[]):number{if(!dice.length)return 0;const counts=Array.from({length:7},(_,i)=>dice.filter(x=>x===i).length);
 if(dice.length===6){if(counts.slice(1).every(n=>n===1))return 1500;if(counts.filter(n=>n===2).length===3)return 1500;if(counts.filter(n=>n===3).length===2)return 2500;}
 let sum=0;for(let n=1;n<=6;n++){const k=counts[n];if(k>=3){sum+=k===3?(n===1?1000:n*100):k===4?1000:k===5?2000:3000;counts[n]=0}}
 sum+=counts[1]*100+counts[5]*50;
 if([2,3,4,6].some(n=>counts[n]>0))return 0;return sum;
}
export function roll(s:State,random=Math.random):State{if(s.phase!=='roll'||s.winner!==null)return s;const count=6-s.kept;const dice=Array.from({length:count},()=>Math.floor(random()*6)+1);
 const possible=Array.from({length:(1<<dice.length)-1},(_,i)=>i+1).some(mask=>points(dice.filter((_,i)=>!!(mask&(1<<i))))>0);
 if(!possible)return {...s,turn:(1-s.turn) as Side,phase:'roll',dice:[],selected:[],kept:0,unbanked:0,message:'Farkle! Turn points lost.',round:s.round+1};
 return {...s,dice,selected:[],phase:'choose',message:'Select scoring dice to keep.'}}
export function toggle(s:State,i:number):State{if(s.phase!=='choose'||i<0||i>=s.dice.length)return s;return {...s,selected:s.selected.includes(i)?s.selected.filter(j=>j!==i):[...s.selected,i]}}
export function keep(s:State):State{if(s.phase!=='choose')return s;const selected=s.selected.map(i=>s.dice[i]);const earned=points(selected);if(!earned)return s;const kept=s.kept+selected.length;return {...s,kept:kept===6?0:kept,dice:[],selected:[],unbanked:s.unbanked+earned,phase:'roll',message:'Kept '+earned+' points. '+(kept===6?'Hot dice — roll all six again!':'Roll again or bank.')}}
export function bank(s:State):State{if(s.phase!=='roll'||!s.unbanked)return s;const score:[number,number]=[...s.score];score[s.turn]+=s.unbanked;const winner=score[s.turn]>=10000?s.turn:null;return {...s,score,turn:winner===null?(1-s.turn) as Side:s.turn,winner,phase:winner===null?'roll':'done',unbanked:0,kept:0,dice:[],selected:[],message:winner===null?'Points banked. Next turn.':winner===0?'You win!':'Computer wins!',round:s.round+1}}
export function computer(s:State,random=Math.random):State{if(s.turn!==1||s.winner!==null)return s;if(s.phase==='roll'){if(s.unbanked>=450)return bank(s);return roll(s,random)}
 const n=s.dice.length;let best:number[]=[],bestScore=0;for(let mask=1;mask<(1<<n);mask++){const ix=Array.from({length:n},(_,i)=>i).filter(i=>mask&(1<<i));const score=points(ix.map(i=>s.dice[i]));if(score>bestScore){bestScore=score;best=ix}}const selected={...s,selected:best};return keep(selected)}
