import {Chess} from 'chess.js';import {expect,it} from 'vitest';import {aiMove,evaluate} from './engine';
it('opens with 20 legal moves',()=>expect(new Chess().moves()).toHaveLength(20));
it('AI returns a legal black move',()=>{const g=new Chess();g.move('e4');const m=aiMove(g);expect(m).not.toBeNull();expect(g.moves({verbose:true}).some(x=>x.san===m?.san)).toBe(true)});
it('evaluates equal starting position',()=>expect(Math.abs(evaluate(new Chess()))).toBeLessThan(100));
