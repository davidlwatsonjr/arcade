import { describe, it, expect } from 'vitest';
import { outcome, computerMove, type Board } from './logic';
describe('Tic-Tac-Toe',()=>{
  it('recognizes a win',()=>expect(outcome(['X','X','X',null,null,null,null,null,null])).toBe('X'));
  it('recognizes a draw',()=>expect(outcome(['X','O','X','X','O','O','O','X','X'])).toBe('draw'));
  it('blocks an immediate win on hard',()=>expect(computerMove(['X','X',null,null,'O',null,null,null,null] as Board,'hard',()=>0)).toBe(2));
  it('does not move on completed games',()=>expect(computerMove(['X','X','X',null,null,null,null,null,null],'hard')).toBe(-1));
});
