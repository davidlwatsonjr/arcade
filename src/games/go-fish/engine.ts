export type Card={rank:number,suit:number};
export type State={hands:Card[][],deck:Card[],books:number[][],turn:0|1,phase:'playing'|'done',message:string,round:number};
export const rankLabel=(n:number)=>n===1?'A':n===11?'J':n===12?'Q':n===13?'K':String(n);
export function shuffle(random=Math.random):Card[]{const d=Array.from({length:52},(_,i)=>({rank:i%13+1,suit:Math.floor(i/13)}));for(let i=d.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
export function fresh():State{const d=shuffle();return {hands:[d.splice(0,7),d.splice(0,7)],deck:d,books:[[],[]],turn:0,phase:'playing',message:'Ask the computer for a rank you hold.',round:1}}
function tidy(s:State):State{let hands=s.hands.map(h=>[...h]),books=s.books.map(b=>[...b]),deck=[...s.deck];for(let seat=0;seat<2;seat++){for(let rank=1;rank<=13;rank++){if(hands[seat].filter(c=>c.rank===rank).length===4){hands[seat]=hands[seat].filter(c=>c.rank!==rank);if(!books[seat].includes(rank))books[seat].push(rank)}}}for(let seat=0;seat<2;seat++)if(hands[seat].length===0&&deck.length)hands[seat].push(deck.pop()!);
const done=books[0].length+books[1].length===13||(!deck.length&&hands.every(h=>h.length===0));
return {...s,hands,books,deck,phase:done?'done':'playing'}}
export function ask(s:State,rank:number):State{if(s.phase!=='playing'||s.turn!==0||!s.hands[0].some(c=>c.rank===rank))return s;return request(s,0,rank)}
function request(s:State,seat:0|1,rank:number):State{const other=1-seat as 0|1,hands=s.hands.map(h=>[...h]),deck=[...s.deck],found=hands[other].filter(c=>c.rank===rank);let again=false,message='';
if(found.length){hands[other]=hands[other].filter(c=>c.rank!==rank);hands[seat].push(...found);again=true;message=(seat===0?'You':'Computer')+' received '+found.length+' '+rankLabel(rank)+(found.length===1?'':'s')+'. Go again.'}
else{const card=deck.pop();if(card){hands[seat].push(card);again=card.rank===rank;message=(seat===0?'You':'Computer')+' went fishing'+(seat===0?' and drew '+rankLabel(card.rank):'')+(again?' — lucky catch!':'')+'.'}else message='No matching cards; deck is empty.'}
const next=tidy({...s,hands,deck,turn:again?seat:other,message,round:s.round+1});if(next.phase==='done'){const a=next.books[0].length,b=next.books[1].length;return {...next,message:a===b?'Tie game!':a>b?'You won!':'Computer won.'}}if(next.hands[next.turn].length===0&&next.deck.length===0){return {...next,phase:'done',message:'Game over — compare books.'}}return next}
export function computerTurn(s:State,random=Math.random):State{if(s.phase!=='playing'||s.turn!==1)return s;const ranks=[...new Set(s.hands[1].map(c=>c.rank))];if(!ranks.length)return {...s,phase:'done',message:'No cards left to ask with.'};const rank=ranks[Math.floor(random()*ranks.length)];return request(s,1,rank)}
