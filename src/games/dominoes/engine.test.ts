import {it,expect} from 'vitest';import {makeSet,deal,options,put,pass} from './engine';
it('has 28 unique tiles',()=>expect(new Set(makeSet().map(t=>t.id)).size).toBe(28));
it('deals seven per player',()=>expect(deal().hands.map(h=>h.length)).toEqual([7,7,7,7]));
it('places opening tile and advances turn',()=>{const s=deal(()=>.5);const tile=options(s)[0].tile;const n=put(s,tile.id,'right');expect(n.chain).toHaveLength(1);expect(n.hands[s.turn]).toHaveLength(6)});
it('cannot pass with playable tile',()=>{const s=deal();expect(pass(s)).toBe(s)});
