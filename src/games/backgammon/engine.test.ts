import {describe,it,expect} from 'vitest';
import {fresh,roll,options,play,computerStep,pipCount,type State} from './engine';
describe('Backgammon',()=>{
 it('starts with 15 checkers per side',()=>{const s=fresh();expect(s.board.filter(n=>n>0).reduce((a,n)=>a+n,0)).toBe(15);expect(s.board.filter(n=>n<0).reduce((a,n)=>a-n,0)).toBe(15);expect(pipCount(s,0)).toBe(167)});
 it('rolls four dice on doubles',()=>expect(roll(fresh(),()=>0).dice).toEqual([1,1,1,1]));
 it('forces bar re-entry before any other move',()=>{const s:State={...fresh(),bar:[1,0],board:[...fresh().board],rolled:true,dice:[1,2]};expect(options(s).every(m=>m.from==='bar')).toBe(true)});
 it('cannot enter on points blocked by the opponent',()=>{const s={...fresh(),board:Array(24).fill(0),bar:[1,0] as [number,number],rolled:true,dice:[1,2]};s.board[23]=-2;s.board[22]=-2;expect(options(s)).toHaveLength(0)});
 it('hits a single opposing checker',()=>{const s={...fresh(),board:Array(24).fill(0),bar:[0,0] as [number,number],rolled:true,dice:[1]};s.board[6]=1;s.board[5]=-1;const after=play(s,{from:6,to:5,die:1});expect(after.bar[1]).toBe(1);expect(after.board[5]).toBe(1)});
 it('can bear off when every checker is home',()=>{const s={...fresh(),board:Array(24).fill(0),bar:[0,0] as [number,number],off:[14,0] as [number,number],rolled:true,dice:[6]};s.board[0]=1;expect(options(s).some(m=>m.to==='off')).toBe(true);expect(play(s,{from:0,to:'off',die:6}).winner).toBe(0)});
 it('computer can start a turn',()=>{const s={...fresh(),turn:1 as const};expect(computerStep(s,()=>0).rolled).toBe(true)});
});
