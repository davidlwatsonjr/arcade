import {it,expect} from 'vitest';import {initial,movesFor,apply} from './engine';
it('starts with twelve pieces per side',()=>{const b=initial().flat();expect(b.filter(x=>x===1)).toHaveLength(12);expect(b.filter(x=>x===-1)).toHaveLength(12)});
it('requires captures',()=>{const b=initial().map(row=>row.map(()=>0));b[5][2]=1;b[4][3]=-1;expect(movesFor(b,1)).toEqual([{from:[5,2],to:[3,4],capture:[4,3]}]);expect(apply(b,movesFor(b,1)[0])[4][3]).toBe(0)});
it('crowns at opponent baseline',()=>{const b=initial().map(row=>row.map(()=>0));b[1][2]=1;const m=movesFor(b,1)[0];expect(Math.abs(apply(b,m)[m.to[0]][m.to[1]])).toBe(2)});
