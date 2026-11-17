export type Card={rank:number,suit:string};
export type Phase='bet'|'player'|'dealer'|'result';
export type State={deck:Card[],player:Card[],dealer:Card[],phase:Phase,bankroll:number,bet:number,message:string,wins:number,losses:number,pushes:number};
export const suits=['♠','♥','♦','♣'];
export const label=(r:number)=>r===1?'A':r===11?'J':r===12?'Q':r===13?'K':String(r);
export function shuffle(random=Math.random):Card[]{const deck=suits.flatMap(suit=>Array.from({length:13},(_,i)=>({rank:i+1,suit})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}return deck}
export function value(cards:Card[]):number{let total=0,aces=0;for(const c of cards){if(c.rank===1){aces++;total+=11}else total+=Math.min(c.rank,10)}while(total>21&&aces){total-=10;aces--}return total}
export function fresh():State{return {deck:shuffle(),player:[],dealer:[],phase:'bet',bankroll:1000,bet:0,message:'Choose your bet.',wins:0,losses:0,pushes:0}}
export function deal(s:State,bet:number):State{if(s.phase!=='bet'||bet<=0||bet>s.bankroll)return s;let deck=s.deck.length<15?shuffle():[...s.deck];const player=[deck.pop()!,deck.pop()!],dealer=[deck.pop()!,deck.pop()!];let next:State={...s,deck,player,dealer,bet,bankroll:s.bankroll-bet,phase:'player',message:'Hit or stand.'};if(value(player)===21||value(dealer)===21)return settle(next);return next}
export function settle(s:State):State{let deck=[...s.deck],dealer=[...s.dealer];if(value(s.player)<=21&&value(s.player)!==21){while(value(dealer)<17){if(!deck.length)deck=shuffle();dealer.push(deck.pop()!)}}
const player=value(s.player),house=value(dealer),pNatural=s.player.length===2&&player===21,dNatural=dealer.length===2&&house===21;
let payout=0,message='',key:'wins'|'losses'|'pushes';
if(player>21){key='losses';message='Bust — dealer wins.'}
else if(pNatural&&!dNatural){key='wins';payout=s.bet*2.5;message='Blackjack! Paid 3:2.'}
else if(player===house||(pNatural&&dNatural)){key='pushes';payout=s.bet;message='Push — bet returned.'}
else if(house>21||player>house){key='wins';payout=s.bet*2;message='You win!'}
else{key='losses';message='Dealer wins.'}
return {...s,deck,dealer,phase:'result',bankroll:s.bankroll+payout,message,[key]:s[key]+1}}
export function hit(s:State):State{if(s.phase!=='player')return s;let deck=[...s.deck];if(!deck.length)deck=shuffle();const player=[...s.player,deck.pop()!];const next={...s,deck,player};return value(player)>=21?settle(next):next}
export function stand(s:State):State{return s.phase==='player'?settle(s):s}
export function next(s:State):State{return s.phase!=='result'?s:{...s,phase:'bet',player:[],dealer:[],bet:0,message:'Choose your next bet.'}}
