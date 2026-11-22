import {describe,it,expect} from 'vitest';import {levels,sizes,generate,solve,seeded,totals,constraints,fresh,mark,history,deduction} from './engine';
describe('Sum Logic',()=>{
 it('generates a unique solution for every tier',()=>{for(const l of levels){const p=generate(l,seeded(l));expect(p.size).toBe(sizes[l]);const s=solve(p);expect(s.exhausted).toBe(false);expect(s.count).toBe(1);expect(s.solution).toEqual(p.solution);expect(totals(p,p.solution)).toEqual(constraints(p).map(c=>c.target));if(p.size>=7)expect(p.regions.length).toBeGreaterThan(0)}},30000);
 it('daily seed is reproducible',()=>expect(generate('Medium',seeded('date'))).toEqual(generate('Medium',seeded('date'))));
 it('supports mark and history',()=>{const s=fresh();const x=mark(s,0,s.puzzle.solution[0]);expect(history(x).marks).toEqual(s.marks);expect(history(history(x),true).marks).toEqual(x.marks)});
 it('hints match solution',()=>{const s=fresh();const h=deduction(s.puzzle,s.marks)!;expect(h.mark).toBe(s.puzzle.solution[h.index])});
 it('recognizes completion',()=>{let s=fresh();for(let i=0;i<s.marks.length;i++)if(s.puzzle.solution[i]===1)s=mark(s,i,1);expect(s.won).toBe(true);expect(s.stats.Easy.completed).toBe(1)});
 it('rejects inconsistent assignments',()=>{const p=generate('Easy',seeded('x'));const m=p.solution.slice();m[0]=m[0]===1?-1:1;expect(solve(p,m).count).toBe(0)});
});