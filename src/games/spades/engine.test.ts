import {describe,it,expect} from 'vitest';
import {startHand, placeBid, playCard, legalCards, trickWinner, scoreHand, cardForComputer, resolveTrick, type Card, type Played} from './engine';
const c=(suit:Card['suit'],rank:number):Card=>({suit,rank});
describe('spades rules',()=>{
 it('deals a full deck with no duplicates',()=>{const s=startHand();expect(s.hands.map(h=>h.length)).toEqual([13,13,13,13]);expect(new Set(s.hands.flat().map(c=>`${c.suit}${c.rank}`)).size).toBe(52)});
 it('bids clockwise and moves into play',()=>{let s=startHand();for(const [seat,bid] of [[0,3],[1,2],[2,4],[3,2]] as const)s=placeBid(s,seat,bid);expect(s.stage).toBe('playing');expect(s.currentPlayer).toBe(0);expect(s.bids).toEqual([3,2,4,2])});
 it('requires following suit and prohibits premature spade leads',()=>{
   const hand=[c('S',14),c('H',4),c('H',10)];
   expect(legalCards(hand,[],false)).toEqual([c('H',4),c('H',10)]);
   expect(legalCards(hand,[{seat:1,card:c('H',7)}],false)).toEqual([c('H',4),c('H',10)]);
   expect(legalCards(hand,[{seat:1,card:c('D',7)}],false)).toEqual(hand);
   expect(legalCards([c('S',14)],[],false)).toEqual([c('S',14)]);
 });
 it('spades trump, high led suit wins otherwise',()=>{
   const trick:Played[]=[{seat:0,card:c('H',14)},{seat:1,card:c('H',2)},{seat:2,card:c('S',3)},{seat:3,card:c('S',2)}];
   expect(trickWinner(trick)).toBe(2);
 });
 it('scores contracts, nil and bags',()=>{
   const [ours,theirs]=scoreHand([3,3,4,2],[4,3,3,3],[8,3]);
   expect(ours).toMatchObject({contract:7,contractTricks:7,points:70,bagsEarned:0});
   expect(theirs).toMatchObject({contract:5,contractTricks:6,points:51,bagsEarned:1});
   const [nil]=scoreHand([0,3,4,3],[0,4,6,3],[9,0]);
   expect(nil).toMatchObject({nilBonus:100,contract:4,bagsEarned:2,bagPenalty:100,points:42});
 });
 it('does not allow illegal human plays',()=>{
   let s=startHand();for(const bid of [3,3,3,3])s=placeBid(s,s.currentPlayer,bid);
   const spade=s.hands[0].find(c=>c.suit==='S');
   if(spade&&s.hands[0].some(c=>c.suit!=='S'))expect(playCard(s,0,spade)).toBe(s);
   const legal=legalCards(s.hands[0],[],false)[0];
   const next=playCard(s,0,legal);expect(next.hands[0]).toHaveLength(12);expect(next.currentPlayer).toBe(1);
 });
 it('computer selects only legal cards',()=>{let s=startHand();for(let i=0;i<4;i++)s=placeBid(s,s.currentPlayer,3);const move=cardForComputer(s,0);expect(legalCards(s.hands[0],[],false)).toContainEqual(move)});
 it('ends a complete trick and assigns one book',()=>{
   let s=startHand();for(let i=0;i<4;i++)s=placeBid(s,s.currentPlayer,3);
   for(let i=0;i<4;i++){const seat=s.currentPlayer;s=playCard(s,seat,legalCards(s.hands[seat],s.trick,s.spadesBroken)[0]);}
   expect(s.stage).toBe('trick-end');const next=resolveTrick(s);expect(next.trickNumber).toBe(1);expect(next.tricks.reduce((a,b)=>a+b)).toBe(1);
 });
});
