import {it,expect} from 'vitest';import {fresh,reveal,move,canStack,type Card} from './engine';
it('deals 28 tableau cards and 24 stock cards',()=>{const s=fresh();expect(s.tableau.map(p=>p.length)).toEqual([1,2,3,4,5,6,7]);expect(s.stock).toHaveLength(24)});
it('reveals the next card from stock',()=>{const s=reveal(fresh());expect(s.stock).toHaveLength(23);expect(s.waste.at(-1)?.up).toBe(true)});
it('enforces alternating colors',()=>{const c=(rank:number,suit:'H'|'S'):Card=>({rank,suit,up:true,id:''});expect(canStack(c(6,'S'),[c(7,'H')])).toBe(true);expect(canStack(c(6,'H'),[c(7,'H')])).toBe(false)});
it('does not move invalid stack',()=>{const s=fresh();expect(move(s,{kind:'waste',index:0},{kind:'tableau',index:0})).toBe(s)});
