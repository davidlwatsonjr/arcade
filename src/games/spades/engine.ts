export type Suit = 'S' | 'H' | 'D' | 'C';
export type Seat = 0 | 1 | 2 | 3;
export type Stage = 'bidding' | 'playing' | 'trick-end' | 'hand-end' | 'game-over';
export type Team = 0 | 1;
export interface Card { suit: Suit; rank: number; }
export interface Played { seat: Seat; card: Card; }
export interface Scoring { contract: number; contractTricks: number; bagsEarned: number; nilBonus: number; bagPenalty: number; points: number; }
export interface HandSummary { scores: [Scoring, Scoring]; winner: Team | null; }
export interface SpadesState {
  hands: Card[][];
  bids: (number | null)[];
  tricks: number[];
  scores: [number, number];
  bags: [number, number];
  dealer: Seat;
  handNumber: number;
  trickNumber: number;
  currentPlayer: Seat;
  leader: Seat;
  trick: Played[];
  spadesBroken: boolean;
  stage: Stage;
  lastWinner: Seat | null;
  summary: HandSummary | null;
}
export const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
export const SEAT_NAMES = ['You', 'West', 'Partner', 'East'] as const;
export const team = (seat: Seat): Team => (seat % 2) as Team;
export const nextSeat = (seat: Seat): Seat => ((seat + 1) % 4) as Seat;
export const cardId = (card: Card) => `${card.suit}${card.rank}`;
export const cardLabel = (card: Card) => `${({14:'A',13:'K',12:'Q',11:'J'} as Record<number,string>)[card.rank] ?? card.rank}${({S:'♠',H:'♥',D:'♦',C:'♣'} as Record<Suit,string>)[card.suit]}`;
export function shuffleDeck(random = Math.random): Card[] {
  const deck = SUITS.flatMap(suit => Array.from({length:13},(_,i)=>({suit,rank:i+2})));
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return deck;
}
export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a,b)=>SUITS.indexOf(a.suit)-SUITS.indexOf(b.suit) || b.rank-a.rank);
}
export function startHand(scores: [number,number]=[0,0], bags: [number,number]=[0,0], dealer: Seat=3, handNumber=1, random=Math.random): SpadesState {
  const deck=shuffleDeck(random);
  const hands=[[],[],[],[]] as Card[][];
  deck.forEach((card,i)=>hands[i%4].push(card));
  return {hands:hands.map(sortHand),bids:[null,null,null,null],tricks:[0,0,0,0],scores:[...scores] as [number,number],bags:[...bags] as [number,number],dealer,handNumber,trickNumber:0,currentPlayer:nextSeat(dealer),leader:nextSeat(dealer),trick:[],spadesBroken:false,stage:'bidding',lastWinner:null,summary:null};
}
export function placeBid(s: SpadesState, seat: Seat, amount: number): SpadesState {
  if(s.stage!=='bidding' || s.currentPlayer!==seat || s.bids[seat]!==null || !Number.isInteger(amount) || amount<0 || amount>13) return s;
  const bids=[...s.bids];bids[seat]=amount;
  const allBid=bids.every(b=>b!==null);
  return {...s,bids,stage:allBid?'playing':'bidding',currentPlayer:allBid?nextSeat(s.dealer):nextSeat(seat),leader:nextSeat(s.dealer)};
}
export function legalCards(hand: Card[], trick: Played[], spadesBroken: boolean): Card[] {
  if(!trick.length){
    const nonSpades=hand.filter(c=>c.suit!=='S');
    return spadesBroken || !nonSpades.length ? hand : nonSpades;
  }
  const follow=hand.filter(c=>c.suit===trick[0].card.suit);
  return follow.length?follow:hand;
}
export function trickWinner(trick: Played[]): Seat {
  if(!trick.length) throw new Error('Cannot determine winner of empty trick');
  const led=trick[0].card.suit;
  return trick.reduce((best,play)=>{
    const power=(c: Card)=>c.suit==='S'?100+c.rank:c.suit===led?c.rank:0;
    return power(play.card)>power(best.card)?play:best;
  }).seat;
}
export function playCard(s:SpadesState,seat:Seat,card:Card):SpadesState {
  if(s.stage!=='playing'||s.currentPlayer!==seat)return s;
  const hand=s.hands[seat];
  if(!hand.some(c=>cardId(c)===cardId(card))||!legalCards(hand,s.trick,s.spadesBroken).some(c=>cardId(c)===cardId(card)))return s;
  const hands=s.hands.map(h=>[...h]);
  hands[seat]=hands[seat].filter(c=>cardId(c)!==cardId(card));
  const trick=[...s.trick,{seat,card}];
  return {...s,hands,trick,spadesBroken:s.spadesBroken || card.suit==='S',currentPlayer:nextSeat(seat),stage:trick.length===4?'trick-end':'playing',lastWinner:trick.length===4?trickWinner(trick):null};
}
export function scoreHand(bids:(number|null)[],tricks:number[],previousBags:[number,number]): [Scoring,Scoring] {
  return ([0,1] as Team[]).map(t=>{
    const seats:[Seat,Seat]=t===0?[0,2]:[1,3];
    const contract=seats.reduce<number>((sum,seat)=>sum+(bids[seat]||0),0);
    const contractTricks=seats.reduce<number>((sum,seat)=>sum+(bids[seat]===0?0:tricks[seat]),0);
    const nilTricks=seats.reduce<number>((sum,seat)=>sum+(bids[seat]===0?tricks[seat]:0),0);
    const made=contractTricks>=contract;
    const bagsEarned=(made?Math.max(0,contractTricks-contract):0)+nilTricks;
    const nilBonus=seats.reduce<number>((sum,seat)=>sum+(bids[seat]===0?(tricks[seat]===0?100:-100):0),0);
    const bagPenalty=Math.floor((previousBags[t]+bagsEarned)/10)*100;
    const points=(made?contract*10+Math.max(0,contractTricks-contract):-contract*10)+nilTricks+nilBonus-bagPenalty;
    return {contract,contractTricks,bagsEarned,nilBonus,bagPenalty,points};
  }) as [Scoring,Scoring];
}
export function resolveTrick(s:SpadesState):SpadesState {
  if(s.stage!=='trick-end'||s.trick.length!==4)return s;
  const winner=trickWinner(s.trick);
  const tricks=[...s.tricks];tricks[winner]++;
  const trickNumber=s.trickNumber+1;
  if(trickNumber<13)return {...s,tricks,trickNumber,currentPlayer:winner,leader:winner,trick:[],stage:'playing'};
  const scored=scoreHand(s.bids,tricks,s.bags);
  const scores=s.scores.map((points,t)=>points+scored[t].points) as [number,number];
  const bags=s.bags.map((count,t)=>(count+scored[t].bagsEarned)%10) as [number,number];
  const terminal=(scores[0]>=500||scores[1]>=500)&&scores[0]!==scores[1];
  const winningTeam:Team|null=terminal?(scores[0]>scores[1]?0:1):null;
  return {...s,tricks,trickNumber,currentPlayer:winner,leader:winner,stage:terminal?'game-over':'hand-end',scores,bags,summary:{scores:scored,winner:winningTeam}};
}
export function nextHand(s:SpadesState,random=Math.random):SpadesState {
  return s.stage==='hand-end'?startHand(s.scores,s.bags,nextSeat(s.dealer),s.handNumber+1,random):s;
}
export function bidForComputer(hand:Card[],random=Math.random):number {
  const groups=Object.fromEntries(SUITS.map(s=>[s,hand.filter(c=>c.suit===s)])) as Record<Suit,Card[]>;
  let strength=0;
  for(const suit of SUITS){
    const cards=groups[suit];
    if(cards.some(c=>c.rank===14)) strength+=1;
    if(cards.some(c=>c.rank===13)) strength+=cards.length>=2?0.85:0.45;
    if(cards.some(c=>c.rank===12)) strength+=cards.length>=3?0.45:0.15;
    if(cards.some(c=>c.rank===11)) strength+=cards.length>=4?0.2:0;
  }
  strength+=groups.S.length*0.38 + Math.max(0,groups.S.length-4)*0.3;
  // Nil is offered only for exceptionally weak hands.
  if(strength<1.1&&groups.S.length<3&&random()<0.65)return 0;
  return Math.max(1,Math.min(8,Math.round(strength-0.8+(random()-0.5)*0.8)));
}
export function cardForComputer(s:SpadesState,seat:Seat):Card {
  const hand=s.hands[seat];const options=legalCards(hand,s.trick,s.spadesBroken);
  if(!options.length)throw new Error('Computer has no legal card');
  const rankPower=(card:Card)=>card.rank+(card.suit==='S'?20:0);
  const ascending=[...options].sort((a,b)=>rankPower(a)-rankPower(b));
  const winning=options.filter(card=>{
    const simulated=[...s.trick,{seat,card}];return trickWinner(simulated)===seat;
  }).sort((a,b)=>rankPower(a)-rankPower(b));
  const losing=ascending.filter(card=>!winning.some(w=>cardId(w)===cardId(card)));
  const mate=((seat+2)%4) as Seat;
  const mateWinning=s.trick.length>0&&trickWinner(s.trick)===mate;
  const nil=s.bids[seat]===0;
  const mateNil=s.bids[mate]===0;
  const target=(s.bids[seat]||0)+(s.bids[mate]||0);
  const earned=s.tricks[seat]+s.tricks[mate];
  if(nil)return losing[0]??ascending[0];
  if(!s.trick.length){
    // Lead winners, but avoid needless spade spending and keep suits varied.
    const aces=options.filter(c=>c.rank===14&&c.suit!=='S');
    if(aces.length&&earned<target)return aces[0];
    return [...options].sort((a,b)=>(a.suit==='S'?15:0)+a.rank-(b.suit==='S'?15:0)-b.rank)[0];
  }
  if(mateWinning&&!mateNil)return losing[0]??ascending[0];
  if(mateWinning&&mateNil&&winning.length)return winning[0];
  if(winning.length&&(earned<target||mateNil))return winning[0];
  return losing[0]??ascending[0];
}
