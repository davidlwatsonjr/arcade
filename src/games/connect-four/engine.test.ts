import {expect,it} from 'vitest';import {initial,drop,winner,aiColumn,validColumns} from './engine';
it('drops to lowest cell',()=>{const b=drop(initial(),3,1)!;expect(b[5][3]).toBe(1);expect(b[4][3]).toBe(0)});
it('recognizes horizontal win',()=>{let b=initial();for(const c of [0,1,2,3])b=drop(b,c,1)!;expect(winner(b)).toBe(1)});
it('AI takes winning move',()=>{let b=initial();for(const c of [0,1,2])b=drop(b,c,2)!;expect(aiColumn(b)).toBe(3)});
it('rejects full column',()=>{let b=initial();for(let i=0;i<6;i++)b=drop(b,0,(i%2+1) as 1|2)!;expect(validColumns(b)).not.toContain(0)});
