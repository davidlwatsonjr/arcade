import {it,expect} from 'vitest';import {deal,start,passCards,passDirection,legal,play,points,type State} from './engine';
it('deals thirteen to each player',()=>expect(deal().hands.map(h=>h.length)).toEqual([13,13,13,13]));
it('cycles passing direction',()=>expect([1,2,3,4].map(passDirection)).toEqual([1,3,2,0]));
it('passes three each',()=>{const s=deal();const n=passCards(s,s.hands[0].slice(0,3));expect(n.hands.map(h=>h.length)).toEqual([13,13,13,13]);expect(n.stage).toBe('playing')});
it('starts with two of clubs',()=>{const s=start({...deal(),stage:'playing'} as State);expect(legal(s)).toEqual([{suit:'C',rank:2}]);expect(play(s,{suit:'H',rank:14})).toBe(s)});
it('counts penalty cards',()=>expect(points([{suit:'H',rank:2},{suit:'S',rank:12},{suit:'C',rank:14}])).toBe(14));
