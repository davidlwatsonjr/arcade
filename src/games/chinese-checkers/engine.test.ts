import {describe,it,expect} from 'vitest';
import {start,spots,arm,destinations,move} from './engine';
describe('Chinese Checkers',()=>{
 it('has a full 121-hole six-point star',()=>{expect(spots).toHaveLength(121);expect(new Set(spots.map(p=>p.key)).size).toBe(121);for(let i=0;i<6;i++)expect(arm(i)).toHaveLength(10)});
 it('deals ten opposite checkers per player',()=>{const s=start();expect(s.pieces[0]).toHaveLength(10);expect(s.pieces[1]).toHaveLength(10);expect(new Set([...s.pieces[0],...s.pieces[1]]).size).toBe(20)});
 it('rejects moves from unowned holes',()=>{const s=start();expect(destinations(s,'0,0,0')).toHaveLength(0);expect(move(s,'0,0,0','1,-1,0')).toBe(s)});
 it('produces only valid empty targets',()=>{const s=start();const o=new Set([...s.pieces[0],...s.pieces[1]]);const a=destinations(s,s.pieces[0][0]);expect(a.length).toBeGreaterThan(0);expect(a.every(k=>!o.has(k))).toBe(true)});
});
