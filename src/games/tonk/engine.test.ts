import {describe,it,expect} from 'vitest';
import {fresh,shuffle,draw,discardCard,meld,knock,meldValid,pip,type Card,type State} from './engine';
const card=(r:number,suit:'♠'|'♥'|'♦'|'♣'='♠'):Card=>({id:suit+r,rank:r,suit});
describe('Tonk',()=>{
 it('deals unique cards and five-card hands',()=>{const s=fresh(()=>0.5);const all=[...s.hands[0],...s.hands[1],...s.deck,...s.discard];expect(all).toHaveLength(52);expect(new Set(all.map(c=>c.id)).size).toBe(52);expect(s.hands[0]).toHaveLength(5)});
 it('recognizes rank sets and suited runs',()=>{expect(meldValid([card(7,'♠'),card(7,'♥'),card(7,'♦')])).toBe(true);expect(meldValid([card(2),card(3),card(4)])).toBe(true);expect(meldValid([card(2),card(4),card(5)])).toBe(false)});
 it('pips face cards as ten, ace as one',()=>expect(pip(card(1))+pip(card(12))).toBe(11));
 it('rejects discarding before drawing',()=>{const s=fresh(()=>0.5);expect(discardCard(s,s.hands[0][0].id)).toBe(s)});
 it('advances after a draw and discard',()=>{let s=fresh(()=>0.5);if(s.phase==='draw'){s=draw(s,'stock');expect(s.phase).toBe('action');s=discardCard(s,s.hands[0][0].id);expect(s.turn).toBe(1)}});
 it('can lay down valid groups',()=>{const a=fresh(()=>0.5);const s:State={...a,hands:[[card(2),card(3),card(4),card(9)],[card(8,'♥')]],turn:0,phase:'action'};const n=meld(s,[card(2).id,card(3).id,card(4).id]);expect(n.melds[0]).toHaveLength(1);expect(n.hands[0]).toHaveLength(1)});
 it('rejects high-point knocks',()=>{const s=fresh(()=>0.5);expect(knock(s)).toBe(s)});
 it('has a complete 52-card deck',()=>expect(shuffle()).toHaveLength(52));
});
