export type Side=0|1;
export type Suit='♠'|'♥'|'♦'|'♣';
export type Card={id:string;rank:number;suit:Suit};
export type Phase='draw'|'action'|'round-end';
export type State={hands:[Card[],Card[]];deck:Card[];discard:Card[];melds:[Card[][],Card[][]];turn:Side;phase:Phase;winner:Side|null;scores:[number,number];round:number;message:string;drawnDiscardId:string|null};
export const label=(r:number)=>r===1?'A':r===11?'J':r===12?'Q':r===13?'K':String(r);
export const pip=(card:Card)=>Math.min(card.rank,10);
export const total=(cards:Card[])=>cards.reduce((v,c)=>v+pip(c),0);
export function shuffle(random=Math.random):Card[]{
 const suits:Suit[]=['♠','♥','♦','♣'];const cards=suits.flatMap(suit=>Array.from({length:13},(_,i)=>({id:suit+(i+1),rank:i+1,suit})));
 for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]]}
 return cards;
}
export function meldValid(cards:Card[]):boolean{
 if(cards.length<3)return false;
 if(new Set(cards.map(c=>c.id)).size!==cards.length)return false;
 if(cards.length<=4&&cards.every(c=>c.rank===cards[0].rank))return true;
 if(!cards.every(c=>c.suit===cards[0].suit))return false;
 const sorted=cards.map(c=>c.rank).sort((a,b)=>a-b);
 return sorted.every((n,i)=>i===0||n===sorted[i-1]+1);
}
function settle(s:State,winner:Side,reason:string,bonus=1):State{
 const scores:[number,number]=[...s.scores];scores[winner]+=bonus;
 return {...s,phase:'round-end',winner,scores,message:reason};
}
export function fresh(random=Math.random,scores:[number,number]=[0,0],round=1):State{
 const deck=shuffle(random);
 const hands:[Card[],Card[]]=[deck.splice(-5),deck.splice(-5)],discard=[deck.pop()!];
 const base:State={deck,hands,discard,melds:[[],[]],turn:0,phase:'draw',winner:null,scores:[...scores],round,message:'Draw from the deck or discard pile.',drawnDiscardId:null};
 if(total(hands[0])===50)return settle(base,0,'Natural Tonk! Five cards total 50.',2);
 if(total(hands[1])===50)return settle(base,1,'Computer dealt a natural Tonk.',2);
 return base;
}
export function nextRound(s:State):State{return s.phase==='round-end'?fresh(Math.random,s.scores,s.round+1):s}
export function draw(s:State,from:'stock'|'discard'):State{
 if(s.phase!=='draw')return s;
 let deck=[...s.deck],discard=[...s.discard];
 if(from==='stock'&&!deck.length){
  if(discard.length<=1)return s;
  deck=shuffleFrom(discard.slice(0,-1));discard=[discard[discard.length-1]];
 }
 const card=from==='stock'?deck.pop():discard.pop();
 if(!card)return s;
 const hands:[Card[],Card[]]=[[...s.hands[0]],[...s.hands[1]]];hands[s.turn].push(card);
 return {...s,deck,discard,hands,phase:'action',drawnDiscardId:from==='discard'?card.id:null,message:(s.turn===0?'You drew':'Computer drew')+' a card.'};
}
function shuffleFrom(cards:Card[]):Card[]{const d=[...cards];for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
export function meld(s:State,ids:string[]):State{
 if(s.phase!=='action'||new Set(ids).size!==ids.length)return s;
 const cards=s.hands[s.turn].filter(c=>ids.includes(c.id));
 if(cards.length!==ids.length||!meldValid(cards))return s;
 const hands:[Card[],Card[]]=[[...s.hands[0]],[...s.hands[1]]],melds:[Card[][],Card[][]]=[[...s.melds[0]],[...s.melds[1]]];
 hands[s.turn]=hands[s.turn].filter(c=>!ids.includes(c.id));melds[s.turn].push(cards);
 const next:State={...s,hands,melds,message:'Meld laid down.'};
 return hands[s.turn].length?next:settle(next,s.turn,s.turn===0?'You went out!':'Computer went out!',2);
}
export function layoff(s:State,id:string,side:Side,meldIndex:number):State{
 if(s.phase!=='action')return s;const c=s.hands[s.turn].find(c=>c.id===id),existing=s.melds[side][meldIndex];if(!c||!existing||!meldValid([...existing,c]))return s;
 const hands:[Card[],Card[]]=[[...s.hands[0]],[...s.hands[1]]],melds:[Card[][],Card[][]]=[s.melds[0].map(x=>[...x]),s.melds[1].map(x=>[...x])];
 hands[s.turn]=hands[s.turn].filter(x=>x.id!==id);melds[side][meldIndex].push(c);
 const next={...s,hands,melds,message:'Card laid off on an existing meld.'};return hands[s.turn].length?next:settle(next,s.turn,s.turn===0?'You went out!':'Computer went out!',2);
}
export function knock(s:State):State{
 if(!['draw','action'].includes(s.phase)||total(s.hands[s.turn])>5)return s;
 const my=total(s.hands[s.turn]),their=total(s.hands[(1-s.turn) as Side]);
 const winner:Side=my<their?s.turn:(1-s.turn) as Side;
 return settle(s,winner,my<their?(s.turn===0?'You':'Computer')+' knocked and won.':'Knock undercut! Opponent wins.',my<their?1:2);
}
export function discardCard(s:State,id:string):State{
 if(s.phase!=='action'||id===s.drawnDiscardId)return s;
 const card=s.hands[s.turn].find(c=>c.id===id);if(!card)return s;
 const hands:[Card[],Card[]]=[[...s.hands[0]],[...s.hands[1]]];
 hands[s.turn]=hands[s.turn].filter(c=>c.id!==id);
 const next:State={...s,hands,discard:[...s.discard,card],drawnDiscardId:null,message:(s.turn===0?'You':'Computer')+' discarded '+label(card.rank)+card.suit+'.'};
 if(!hands[s.turn].length)return settle(next,s.turn,(s.turn===0?'You':'Computer')+' went out!',2);
 return {...next,phase:'draw',turn:(1-s.turn) as Side};
}
function combos<T>(a:T[]):T[][]{const result:T[][]=[];for(let mask=1;mask<(1<<a.length);mask++){const subset=a.filter((_,i)=>(mask&(1<<i))!==0);if(subset.length>=3)result.push(subset)}return result}
export function computerStep(s:State):State{
 if(s.phase==='round-end'||s.turn!==1)return s;
 if(total(s.hands[1])<=5&&total(s.hands[1])<total(s.hands[0]))return knock(s);
 if(s.phase==='draw'){
  const top=s.discard[s.discard.length-1];
  const useful=top&&combos([...s.hands[1],top]).some(group=>group.includes(top)&&meldValid(group));
  return draw(s,useful?'discard':'stock');
 }
 const hand=s.hands[1],m=combos(hand).filter(meldValid).sort((a,b)=>b.length-a.length||total(b)-total(a))[0];
 if(m)return meld(s,m.map(c=>c.id));
 for(const c of hand)for(const side of [0,1] as const)for(let i=0;i<s.melds[side].length;i++){if(meldValid([...s.melds[side][i],c]))return layoff(s,c.id,side,i)}
 if(total(hand)<=5&&total(hand)<total(s.hands[0]))return knock(s);
 const eligible=hand.filter(c=>c.id!==s.drawnDiscardId);
 if(!eligible.length)return s;
 // Retain cards forming pairs and nearby runs; throw away expensive isolated cards.
 const ranked=eligible.map(c=>({c,score:pip(c)*3-hand.filter(x=>x.id!==c.id&&(x.rank===c.rank||(x.suit===c.suit&&Math.abs(x.rank-c.rank)<=2))).length*10})).sort((a,b)=>b.score-a.score);
 return discardCard(s,ranked[0].c.id);
}
