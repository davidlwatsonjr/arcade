export const categories=['Ones','Twos','Threes','Fours','Fives','Sixes','Three of a kind','Four of a kind','Full house','Small straight','Large straight','Yahtzee','Chance'] as const;
export type Category=typeof categories[number];
export type State={dice:number[],held:boolean[],rolls:number,scores:Partial<Record<Category,number>>,finished:boolean};
export function fresh():State{return {dice:[0,0,0,0,0],held:[false,false,false,false,false],rolls:0,scores:{},finished:false}}
export function score(category:Category,dice:number[]):number{const counts=Array.from({length:7},(_,n)=>dice.filter(d=>d===n).length),sum=dice.reduce((a,b)=>a+b,0),unique=[...new Set(dice)].sort();const has=(n:number)=>unique.includes(n);
const index=categories.indexOf(category);
if(index<6)return (index+1)*counts[index+1];
switch(category){case 'Three of a kind':return counts.some(n=>n>=3)?sum:0;case 'Four of a kind':return counts.some(n=>n>=4)?sum:0;case 'Full house':return counts.includes(3)&&counts.includes(2)?25:0;case 'Small straight':return [[1,2,3,4],[2,3,4,5],[3,4,5,6]].some(seq=>seq.every(has))?30:0;case 'Large straight':return unique.length===5&&([1,2,3,4,5].every(has)||[2,3,4,5,6].every(has))?40:0;case 'Yahtzee':return counts.includes(5)?50:0;case 'Chance':return sum}return 0}
export function total(s:State):number{const upper=categories.slice(0,6).reduce((sum,c)=>sum+(s.scores[c]||0),0);return Object.values(s.scores).reduce((sum,n)=>sum+(n||0),0)+(upper>=63?35:0)}
export function roll(s:State,random=Math.random):State{if(s.finished||s.rolls>=3)return s;return {...s,dice:s.dice.map((d,i)=>s.held[i]?d:Math.floor(random()*6)+1),rolls:s.rolls+1}}
export function hold(s:State,i:number):State{if(s.finished||!s.rolls||i<0||i>=5)return s;const held=[...s.held];held[i]=!held[i];return {...s,held}}
export function choose(s:State,c:Category):State{if(s.finished||!s.rolls||s.scores[c]!==undefined)return s;const scores={...s.scores,[c]:score(c,s.dice)};return {...s,scores,dice:[0,0,0,0,0],held:[false,false,false,false,false],rolls:0,finished:Object.keys(scores).length===13}}
