export type Suit='S'|'H'|'D'|'C';export type Card={id:string,rank:number,suit:Suit};export type Seat=0|1|2|3;export type Phase='bid'|'play'|'trick'|'round-end'|'match-end';
export type State={hands:Card[][],kitty:Card[],upcard:Card,dealer:Seat,round:number,biddingRound:1|2,bidSeat:Seat,passes:number,maker:Seat|null,trump:Suit|null,phase:Phase,turn:Seat,trick:{seat:Seat,card:Card}[],tricks:[number,number],scores:[number,number],message:string,winner:0|1|null};
export const suits:Suit[]=['S','H','D','C'];export const symbol:Record<Suit,string>={S:'♠',H:'♥',D:'♦',C:'♣'};export const label=(n:number)=>n===11?'J':n===12?'Q':n===13?'K':n===14?'A':String(n);
export function deck(random=Math.random):Card[]{const cards=suits.flatMap(suit=>[9,10,11,12,13,14].map(rank=>({id:suit+rank,rank,suit})));for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]]}return cards}
export const partner=(seat:number)=>((seat+2)%4) as Seat;export const team=(seat:number):0|1=>(seat%2) as 0|1;
export const sameColor=(a:Suit,b:Suit)=>a===b||(a==='H'||a==='D')&&(b==='H'||b==='D')||(a==='S'||a==='C')&&(b==='S'||b==='C');
export const effective=(card:Card,trump:Suit):Suit=>card.rank===11&&card.suit!==trump&&sameColor(card.suit,trump)?trump:card.suit;
export const power=(c:Card,trump:Suit,lead:Suit):number=>{const suit=effective(c,trump);if(suit===trump)return c.rank===11?(c.suit===trump?300:290):200+c.rank;if(suit===lead)return 100+c.rank;return c.rank};
export const start=(scores:[number,number]=[0,0],dealer:Seat=3,round=1):State=>{const d=deck(),hands=[d.splice(-5),d.splice(-5),d.splice(-5),d.splice(-5)],upcard=d.pop()!;return {hands,kitty:d,upcard,dealer,round,biddingRound:1,bidSeat:((dealer+1)%4) as Seat,passes:0,maker:null,trump:null,phase:'bid',turn:((dealer+1)%4) as Seat,trick:[],tricks:[0,0],scores,message:'Bid on the upcard suit or pass.',winner:null}};
export function legal(s:State,seat:Seat):Card[]{if(s.phase!=='play'||s.turn!==seat)return [];const hand=s.hands[seat];if(!s.trick.length)return hand;const lead=effective(s.trick[0].card,s.trump!);const follow=hand.filter(c=>effective(c,s.trump!)===lead);return follow.length?follow:hand}
function startPlay(s:State,maker:Seat,trump:Suit,orderUp:boolean):State{
 const hands=s.hands.map(h=>h.slice());
 if(orderUp){hands[s.dealer].push(s.upcard);hands[s.dealer].sort((a,b)=>power(a,trump,trump)-power(b,trump,trump));hands[s.dealer].shift()}
 return {...s,hands,maker,trump,phase:'play',turn:((s.dealer+1)%4) as Seat,trick:[],tricks:[0,0],message:'Trump: '+symbol[trump]+'. '+(team(maker)===0?'Your team':'Opponents')+' called it.'}
}
export function bid(s:State,action:'pass'|'order'|Suit):State{
 if(s.phase!=='bid')return s;const seat=s.bidSeat;
 if(action!=='pass'){if(s.biddingRound===1&&action==='order')return startPlay(s,seat,s.upcard.suit,true);if(s.biddingRound===2&&action!==s.upcard.suit&&action!=='order')return startPlay(s,seat,action,false);return s}
 const passes=s.passes+1;
 if(passes===4&&s.biddingRound===1)return {...s,biddingRound:2,passes:0,bidSeat:((s.dealer+1)%4) as Seat,message:'Second round: choose any other trump suit.'};
 if(passes===4){const choices=suits.filter(x=>x!==s.upcard.suit);const best=choices.sort((a,b)=>suitQuality(s.hands[s.dealer],b)-suitQuality(s.hands[s.dealer],a))[0];return startPlay(s,s.dealer,best,false)}
 return {...s,passes,bidSeat:((seat+1)%4) as Seat};
}
export function suitQuality(cards:Card[],trump:Suit):number{return cards.reduce((n,c)=>n+(effective(c,trump)===trump?(c.rank===11?(c.suit===trump?4.5:3.5):c.rank===14?3:2):c.rank===14?1:0),0)}
export function computerBid(s:State):State{if(s.phase!=='bid'||s.bidSeat===0)return s;const hand=s.hands[s.bidSeat];if(s.biddingRound===1)return bid(s,suitQuality(hand,s.upcard.suit)>=5?'order':'pass');const options=suits.filter(x=>x!==s.upcard.suit).sort((a,b)=>suitQuality(hand,b)-suitQuality(hand,a));return bid(s,suitQuality(hand,options[0])>=5?options[0]:'pass')}
export function play(s:State,id:string):State{if(s.phase!=='play')return s;const card=legal(s,s.turn).find(c=>c.id===id);if(!card)return s;const hands=s.hands.map(h=>h.slice());hands[s.turn]=hands[s.turn].filter(c=>c.id!==id);const trick=[...s.trick,{seat:s.turn,card}];if(trick.length===4)return {...s,hands,trick,phase:'trick',message:'Trick complete.'};return {...s,hands,trick,turn:((s.turn+1)%4) as Seat}}
export function finishTrick(s:State):State{if(s.phase!=='trick')return s;const lead=effective(s.trick[0].card,s.trump!);const winner=s.trick.slice().sort((a,b)=>power(b.card,s.trump!,lead)-power(a.card,s.trump!,lead))[0].seat;const tricks:[number,number]=[...s.tricks];tricks[team(winner)]++;
 if(tricks[0]+tricks[1]<5)return {...s,tricks,trick:[],turn:winner,phase:'play',message:'Trick taken by seat '+winner+'.'};
 const makerTeam=team(s.maker!),made=tricks[makerTeam]>=3;const winningTeam=made?makerTeam:(1-makerTeam) as 0|1,points=made?(tricks[makerTeam]===5?2:1):2;
 const scores:[number,number]=[...s.scores];scores[winningTeam]+=points;const final=scores[winningTeam]>=10;
 return {...s,tricks,scores,phase:final?'match-end':'round-end',winner:final?winningTeam:null,trick:[],message:final?(winningTeam===0?'Your team wins the match!':'Opponents win the match!'):made?'Makers scored '+points+' point(s).':'Euchred! Defenders score two.'}}
export function computerCard(s:State):State{if(s.phase!=='play'||s.turn===0)return s;const cards=legal(s,s.turn);if(!cards.length)return s;const lead=s.trick.length?effective(s.trick[0].card,s.trump!):s.trump!;const held=s.trick.slice().sort((a,b)=>power(b.card,s.trump!,lead)-power(a.card,s.trump!,lead))[0];const partnerWinning=held&&team(held.seat)===team(s.turn);const sorted=cards.slice().sort((a,b)=>power(a,s.trump!,lead)-power(b,s.trump!,lead));let card=sorted[0];if(!partnerWinning&&held){card=sorted.find(c=>power(c,s.trump!,lead)>power(held.card,s.trump!,lead))||sorted[0]}else if(!held){card=sorted[sorted.length-1]}
 return play(s,card.id)}
