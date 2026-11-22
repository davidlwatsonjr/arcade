import {describe,it,expect} from 'vitest';import {deck,start,canPlay,play,draw,pass,computer,type State,type Card,type Side} from './engine';
const card=(id:number,kind:Card['kind'],color:Card['color']='red'):Card=>({id,kind,color});
function fixture(kind:Card['kind'],turn:Side=0,direction:1|-1=1):State{const s=start();return {...s,turn,direction,color:'red',discard:[card(200,'5')],hands:[0,1,2,3].map(i=>i===turn?[card(201,kind,kind==='wild4'||kind==='wild'?null:'red'),card(202,'1','blue')]:[card(210+i,'2','green')]) as State['hands'],stock:deck().slice(0,50)}}
describe('Uno four players',()=>{
it('deals seven cards to each of four seats',()=>{const s=start();expect(s.hands.map(h=>h.length)).toEqual([7,7,7,7]);expect(s.stock.length).toBe(79);expect(new Set([...s.hands.flat(),...s.stock,...s.discard].map(c=>c.id)).size).toBe(108)});
it('cycles and wraps normal turns',()=>{expect(play(fixture('1',3),201).turn).toBe(0);expect(play(fixture('1',0,-1),201).turn).toBe(3)});
it('reverses direction and moves to previous seat',()=>{const n=play(fixture('reverse'),201);expect(n.direction).toBe(-1);expect(n.turn).toBe(3)});
it('skips exactly one opponent',()=>expect(play(fixture('skip'),201).turn).toBe(2));
it('draw two penalizes only next seat',()=>{const s=fixture('draw2',0,-1),n=play(s,201);expect(n.hands.map(h=>h.length)).toEqual([1,1,1,3]);expect(n.turn).toBe(2)});
it('wild four sets color and skips penalized player',()=>{const n=play(fixture('wild4',2),201,'green');expect(n.color).toBe('green');expect(n.hands[3]).toHaveLength(5);expect(n.turn).toBe(0)});
it('rejects wild four with current color held',()=>{const s=fixture('wild4');s.hands[0].push(card(300,'3'));expect(canPlay(s,s.hands[0][0])).toBe(false)});
it('draws once and passes in current direction',()=>{const s=fixture('1',0,-1);const n=draw(s);expect(n.hands[0]).toHaveLength(3);expect((n.drawnId!==null?pass(n):n).turn).toBe(3)});
it('all three bots can act',()=>{for(const seat of [1,2,3] as const){const s=fixture('1',seat);expect(computer(s)).not.toBe(s)}});
it('records winner at correct seat',()=>{const s=fixture('1',2);s.hands[2]=[s.hands[2][0]];const n=play(s,201);expect(n.winner).toBe(2);expect(n.wins).toEqual([0,0,1,0])});
it('rejects invalid cards',()=>{const s=start();expect(play(s,-1)).toBe(s)});
it('deck contains 108 unique cards',()=>expect(new Set(deck().map(c=>c.id)).size).toBe(108));
});