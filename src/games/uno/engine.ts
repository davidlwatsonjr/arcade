export type Color='red'|'blue'|'green'|'yellow';
export type Kind='0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'skip'|'reverse'|'draw2'|'wild'|'wild4';
export type Card={id:number,color:Color|null,kind:Kind};
export type Side=0|1|2|3;
export type Four<T>=[T,T,T,T];
export const names=['You','West','North','East'] as const;
export const advance=(seat:Side,direction:1|-1,steps=1):Side=>((seat+direction*steps+8)%4) as Side;
export type State={hands:Four<Card[]>,stock:Card[],discard:Card[],color:Color,turn:Side,direction:1|-1,drawnId:number|null,winner:Side|null,wins:Four<number>,message:string};
export const colors:Color[]=['red','blue','green','yellow'];
export function deck(random=Math.random):Card[]{let id=0;const cards:Card[]=[];for(const color of colors){cards.push({id:id++,color,kind:'0'});for(const kind of ['1','2','3','4','5','6','7','8','9','skip','reverse','draw2'] as Kind[])for(let n=0;n<2;n++)cards.push({id:id++,color,kind})}for(const kind of ['wild','wild4'] as Kind[])for(let n=0;n<4;n++)cards.push({id:id++,color:null,kind});for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]]}return cards}
export const label=(c:Card)=>c.kind==='draw2'?'+2':c.kind==='wild4'?'+4':c.kind==='reverse'?'↺':c.kind==='skip'?'⊘':c.kind==='wild'?'W':c.kind;
export function start(wins:Four<number>=[0,0,0,0]):State{const stock=deck(),hands:Four<Card[]>=[stock.splice(-7),stock.splice(-7),stock.splice(-7),stock.splice(-7)];const i=stock.findIndex(c=>c.color!==null&&/^[0-9]$/.test(c.kind));const discard=[stock.splice(i,1)[0]];return {hands,stock,discard,color:discard[0].color!,turn:0,direction:1,drawnId:null,winner:null,wins,message:'Play a matching color or number.'}}
export function canPlay(s:State,c:Card,who:Side=s.turn):boolean{const last=s.discard[s.discard.length-1];if(!s.hands[who].some(x=>x.id===c.id))return false;if(s.drawnId!==null&&s.drawnId!==c.id)return false;
 if(c.kind==='wild4')return !s.hands[who].some(x=>x.id!==c.id&&x.color===s.color);
 return c.color===null||c.color===s.color||c.kind===last.kind}
function drawMany(s:State,who:Side,n:number):State{let stock=s.stock.slice(),discard=s.discard.slice(),hands:Four<Card[]>=s.hands.map(h=>h.slice()) as Four<Card[]>;for(let i=0;i<n;i++){if(!stock.length&&discard.length>1){const top=discard.pop()!;stock=discard.slice();for(let j=stock.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[stock[j],stock[k]]=[stock[k],stock[j]]}discard=[top]}if(!stock.length)break;hands[who].push(stock.pop()!)}return {...s,stock,discard,hands}}
export function play(s:State,id:number,choice?:Color):State{
 if(s.winner!==null)return s;
 const card=s.hands[s.turn].find(c=>c.id===id);
 if(!card||!canPlay(s,card)||(card.color===null&&(!choice||!colors.includes(choice))))return s;
 const who=s.turn,direction=card.kind==='reverse'?(s.direction===1?-1:1):s.direction;
 const other=advance(who,direction),hands=s.hands.map(h=>h.slice()) as Four<Card[]>;
 hands[who]=hands[who].filter(c=>c.id!==id);
 const winner=hands[who].length===0?who:null,wins:Four<number>=[...s.wins];if(winner!==null)wins[who]++;
 const penalty=card.kind==='draw2'?2:card.kind==='wild4'?4:0;
 const skip=card.kind==='skip'||penalty>0;
 let next:State={...s,hands,discard:[...s.discard,card],color:card.color??choice!,direction,turn:advance(who,direction,skip?2:1),drawnId:null,winner,wins,message:winner!==null?names[who]+' wins!':names[who]+' played '+label(card)+(penalty?' — '+names[other]+' draws '+penalty+' and skips.':card.kind==='reverse'?' — direction reversed.':skip?' — '+names[other]+' skipped.':'.')};
 if(penalty)next=drawMany(next,other,penalty);
 return next;
}
export function draw(s:State):State{if(s.winner!==null||s.drawnId!==null)return s;let next=drawMany(s,s.turn,1);const old=s.hands[s.turn].length;if(next.hands[s.turn].length===old)return {...s,turn:advance(s.turn,s.direction),message:'Stock empty; turn passed.'};const card=next.hands[s.turn][next.hands[s.turn].length-1];if(canPlay(next,card)){return {...next,drawnId:card.id,message:names[s.turn]+' drew a playable card.'}}return {...next,turn:advance(s.turn,s.direction),drawnId:null,message:names[s.turn]+' drew a card and passed.'}}
export function pass(s:State):State{return s.winner!==null||s.drawnId===null?s:{...s,drawnId:null,turn:advance(s.turn,s.direction),message:names[s.turn]+' passed after drawing.'}}
export function computer(s:State):State{if(s.turn===0||s.winner!==null)return s;const hand=s.hands[s.turn],choices=hand.filter(c=>canPlay(s,c,s.turn));if(!choices.length)return s.drawnId===null?draw(s):pass(s);
 const candidate=choices.sort((a,b)=>Number(b.color===s.color)-Number(a.color===s.color)||Number(b.kind==='draw2'||b.kind==='skip')-Number(a.kind==='draw2'||a.kind==='skip'))[0];const bestColor=colors.slice().sort((a,b)=>hand.filter(c=>c.color===b).length-hand.filter(c=>c.color===a).length)[0];return play(s,candidate.id,candidate.color===null?bestColor:undefined)}
