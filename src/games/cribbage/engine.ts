export type Suit='S'|'H'|'D'|'C';export type Card={id:string,rank:number,suit:Suit};export type Side=0|1;export type Phase='discard'|'peg'|'round-end'|'match-end';
export type State={hands:[Card[],Card[]],original:[Card[],Card[]],crib:Card[],deck:Card[],starter:Card|null,dealer:Side,turn:Side,phase:Phase,scores:[number,number],wins:[number,number],round:number,count:number,sequence:Card[],passed:[boolean,boolean],last:Side|null,played:Card[],message:string,winner:Side|null};
export const label=(n:number)=>n===1?'A':n===11?'J':n===12?'Q':n===13?'K':String(n);
export const symbol:Record<Suit,string>={S:'♠',H:'♥',D:'♦',C:'♣'};export const pip=(c:Card)=>Math.min(c.rank,10);
export function deck(random=Math.random):Card[]{const suits:Suit[]=['S','H','D','C'];const d=suits.flatMap(suit=>Array.from({length:13},(_,i)=>({id:suit+(i+1),rank:i+1,suit})));for(let i=d.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
export function start(scores:[number,number]=[0,0],dealer:Side=1,round=1,wins:[number,number]=[0,0]):State{const d=deck(),hands:[Card[],Card[]]=[d.splice(-6),d.splice(-6)];return {hands,original:[[],[]],crib:[],deck:d,starter:null,dealer,turn:0,phase:'discard',scores,wins,round,count:0,sequence:[],passed:[false,false],last:null,played:[],message:'Choose two cards to send to the crib.',winner:null}}
function combos<T>(list:T[],n:number):T[][]{if(n===0)return [[]];if(list.length<n)return [];return [...combos(list.slice(1),n-1).map(c=>[list[0],...c]),...combos(list.slice(1),n)]}
export function scoreHand(hand:Card[],starter:Card,crib=false):number{const five=[...hand,starter],values=five.map(pip);let score=0;
 for(let size=2;size<=5;size++)for(const selection of combos(values,size))if(selection.reduce((a,b)=>a+b,0)===15)score+=2;
 for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)if(five[i].rank===five[j].rank)score+=2;
 for(let length=5;length>=3;length--){let count=0;for(const cards of combos(five,length)){const ranks=cards.map(c=>c.rank).sort((a,b)=>a-b);if(new Set(ranks).size===length&&ranks[length-1]-ranks[0]===length-1)count++}if(count){score+=count*length;break}}
 if(hand.every(c=>c.suit===hand[0].suit)){if(starter.suit===hand[0].suit)score+=5;else if(!crib)score+=4}
 if(hand.some(c=>c.rank===11&&c.suit===starter.suit))score++;
 return score}
function scoringPeg(sequence:Card[],count:number):number{const len=sequence.length;let score=count===15||count===31?2:0;if(len>=2){let equal=1;for(let i=len-2;i>=0&&sequence[i].rank===sequence[len-1].rank;i--)equal++;score+=equal===2?2:equal===3?6:equal>=4?12:0}
 for(let n=Math.min(len,7);n>=3;n--){const group=sequence.slice(-n).map(c=>c.rank);if(new Set(group).size===n&&Math.max(...group)-Math.min(...group)===n-1){score+=n;break}}return score}
export function discard(s:State,ids:string[]):State{if(s.phase!=='discard'||new Set(ids).size!==2)return s;const picked=s.hands[0].filter(c=>ids.includes(c.id));if(picked.length!==2)return s;
 const human=s.hands[0].filter(c=>!ids.includes(c.id));let best:Card[]=[];let high=-Infinity;
 for(const cards of combos(s.hands[1],4)){const estimate=cards.reduce((n,c)=>n+(c.rank===5?3:0),0)+cards.reduce((n,c)=>n+cards.filter(d=>d!==c&&d.rank===c.rank).length,0)+cards.reduce((n,c)=>n+cards.filter(d=>d!==c&&d.suit===c.suit&&Math.abs(d.rank-c.rank)<=2).length,0);if(estimate>high){high=estimate;best=cards}}
 const computer=s.hands[1].filter(c=>!best.some(x=>x.id===c.id));const d=s.deck.slice(),starter=d.pop()!;const scores:[number,number]=[...s.scores];if(starter.rank===11)scores[s.dealer]+=2;
 const hands:[Card[],Card[]]=[human,best],crib=[...picked,...computer],winner:Side|null=scores[s.dealer]>=121?s.dealer:null;const wins:[number,number]=[...s.wins];if(winner!==null)wins[winner]++;
 return {...s,hands,original:[human.slice(),best.slice()],crib,deck:d,starter,turn:(1-s.dealer) as Side,phase:winner!==null?'match-end':'peg',scores,wins,winner,message:starter.rank===11?'Starter Jack: dealer scores two for heels.':'Starter revealed — peg up to 31.'}}
export const allowed=(s:State,seat:Side):Card[]=>s.phase==='peg'&&s.turn===seat?s.hands[seat].filter(c=>pip(c)+s.count<=31):[];
function finishRound(s:State):State{const scores:[number,number]=[...s.scores],wins:[number,number]=[...s.wins];let winner:Side|null=null;
 for(const who of [(1-s.dealer) as Side,s.dealer]){if(winner!==null)break;scores[who]+=scoreHand(s.original[who],s.starter!);if(scores[who]>=121)winner=who}
 if(winner===null){scores[s.dealer]+=scoreHand(s.crib,s.starter!,true);if(scores[s.dealer]>=121)winner=s.dealer}
 if(winner!==null)wins[winner]++;
 return {...s,scores,wins,winner,phase:winner===null?'round-end':'match-end',message:winner!==null?(winner===0?'You win the match!':'Computer wins the match!'):'Round scored. Your score '+scores[0]+'; computer '+scores[1]+'.'}}
function endSequence(s:State,awarded=true):State{const scores:[number,number]=[...s.scores];if(awarded&&s.last!==null)scores[s.last]++;return {...s,scores,count:0,sequence:[],passed:[false,false],turn:s.last!==null?s.last:s.turn,last:null,message:'New count — peg again.'}}
export function peg(s:State,id:string):State{if(s.phase!=='peg')return s;const card=allowed(s,s.turn).find(c=>c.id===id);if(!card)return s;
 const hands:[Card[],Card[]]=[s.hands[0].slice(),s.hands[1].slice()];hands[s.turn]=hands[s.turn].filter(c=>c.id!==id);
 const count=s.count+pip(card),sequence=[...s.sequence,card],scored=scoringPeg(sequence,count),scores:[number,number]=[...s.scores];scores[s.turn]+=scored;
 let next:State={...s,hands,count,sequence,scores,passed:[false,false],last:s.turn,turn:(1-s.turn) as Side,played:[...s.played,card],message:'Count '+count+'. '+(scored?'Scored '+scored+'!':'')};
 if(scores[s.turn]>=121){const wins:[number,number]=[...s.wins];wins[s.turn]++;return {...next,winner:s.turn,phase:'match-end',wins,message:s.turn===0?'You win!':'Computer wins!'}}
 if(count===31)next={...next,count:0,sequence:[],passed:[false,false],last:null,message:'31! Two points.'};
 if(next.hands.every(h=>h.length===0)){if(count!==31&&next.last!==null){next.scores=[...next.scores];next.scores[next.last]++;if(next.scores[next.last]>=121){const wins:[number,number]=[...next.wins];wins[next.last]++;return {...next,phase:'match-end',winner:next.last,wins,message:next.last===0?'You win!':'Computer wins!'}}}return finishRound(next)}
 return next}
export function go(s:State):State{if(s.phase!=='peg'||allowed(s,s.turn).length)return s;const other=(1-s.turn) as Side;if(s.passed[other]||!s.hands[other].some(c=>pip(c)+s.count<=31)){const next=endSequence(s,s.count!==0);if(next.hands.every(h=>h.length===0))return finishRound(next);return next}
 const passed:[boolean,boolean]=[...s.passed];passed[s.turn]=true;return {...s,passed,turn:other,message:'Go! The other player continues.'}}
export function computer(s:State):State{if(s.phase!=='peg'||s.turn!==1)return s;const cards=allowed(s,1);if(!cards.length)return go(s);const ranked=cards.map(c=>{const count=s.count+pip(c);return {c,v:scoringPeg([...s.sequence,c],count)*10+(count===31?10:0)-Math.abs(15-count)*.1+Math.random()*.05}}).sort((a,b)=>b.v-a.v);return peg(s,ranked[0].c.id)}
