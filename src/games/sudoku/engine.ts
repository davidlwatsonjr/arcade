export const levels=['Easy','Medium','Hard','Mensa','Ridiculous'] as const;
export type Level=typeof levels[number];
export type Board=number[];
export const peers=Array.from({length:81},(_,i)=>Array.from({length:81},(_,j)=>j).filter(j=>j!==i&&(Math.floor(i/9)===Math.floor(j/9)||i%9===j%9||Math.floor(i/27)===Math.floor(j/27)&&Math.floor(i%9/3)===Math.floor(j%9/3))));
export const units=[...Array.from({length:9},(_,r)=>Array.from({length:9},(_,c)=>r*9+c)),...Array.from({length:9},(_,c)=>Array.from({length:9},(_,r)=>r*9+c)),...Array.from({length:9},(_,b)=>Array.from({length:9},(_,k)=>(Math.floor(b/3)*3+Math.floor(k/3))*9+(b%3)*3+k%3))];
export const digits=[1,2,3,4,5,6,7,8,9];
export function candidates(board:Board,i:number){return board[i]?[]:digits.filter(n=>!peers[i].some(j=>board[j]===n))}
export function solve(board:Board,limit=2,random?:()=>number){let count=0,solution:Board|null=null,nodes=0;const b=board.slice();
 if(b.length!==81||b.some((n,i)=>!Number.isInteger(n)||n<0||n>9||n!==0&&peers[i].some(j=>b[j]===n)))return {count,solution,nodes};
 function visit(){if(count>=limit)return;nodes++;let at=-1,opts:number[]=[];for(let i=0;i<81;i++)if(!b[i]){const c=candidates(b,i);if(!c.length)return;if(at===-1||c.length<opts.length){at=i;opts=c;if(c.length===1)break}}
 if(at===-1){count++;if(!solution)solution=b.slice();return}
 if(random)opts=shuffle(opts,random);
 for(const n of opts){b[at]=n;visit();b[at]=0;if(count>=limit)break}}
 visit();return {count,solution,nodes}}
function shuffle<T>(items:T[],random:()=>number){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function seeded(seed:string){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>{h=(h+0x6D2B79F5)|0;let t=Math.imul(h^(h>>>15),1|h);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296}}
export type Hint={index:number,value:number,reason:string};
export function logicalHint(board:Board):Hint|null{for(let i=0;i<81;i++)if(!board[i]){const c=candidates(board,i);if(c.length===1)return {index:i,value:c[0],reason:'Naked single: only '+c[0]+' fits this cell.'}}
 for(const u of units)for(const n of digits){const slots=u.filter(i=>!board[i]&&candidates(board,i).includes(n));if(slots.length===1&&!u.some(i=>board[i]===n))return {index:slots[0],value:n,reason:'Hidden single: '+n+' has only one available position in this row, column or box.'}}
 return null}
export function rate(board:Board){const b=board.slice();let singles=0;while(true){const hint=logicalHint(b);if(!hint)break;b[hint.index]=hint.value;singles++}
 const remaining=b.filter(n=>!n).length;const search=remaining?solve(b,1).nodes:0;return {remaining,search,singles,score:remaining*10+Math.min(search,2000)}}
type Puzzle={puzzle:Board,solution:Board,level:Level,rating:ReturnType<typeof rate>};
const goals=[44,36,31,27,24];
export function generate(level:Level,random=Math.random):Puzzle{const rank=levels.indexOf(level),target=goals[rank];let best:Puzzle|null=null,bestDistance=Infinity;
 for(let attempt=0;attempt<(rank<2?4:10);attempt++){const solution=solve(Array(81).fill(0),1,random).solution!;const puzzle=solution.slice();let clues=81;for(const i of shuffle(Array.from({length:81},(_,i)=>i),random)){if(clues<=target)break;const old=puzzle[i];puzzle[i]=0;if(solve(puzzle,2).count!==1)puzzle[i]=old;else clues--}
 const rating=rate(puzzle);const desired=rank===0?0:rank===1?0:rank===2?100:rank===3?450:850;
 const distance=Math.abs(rating.score-desired)+Math.abs(clues-target)*12;
 if(distance<bestDistance){bestDistance=distance;best={puzzle,solution,level,rating}}
 if(rank<2&&rating.remaining===0&&clues===target)break;
 if(rank>=2&&clues<=target+1&&rating.score>=desired&&rating.score<=desired+350)break}
 return best!}
export type Snapshot={board:Board,notes:number[][]};
export type RecordStats={completed:number,best:number|null,totalSeconds:number};
export type State={level:Level,puzzle:Board,solution:Board,board:Board,notes:number[][],undo:Snapshot[],redo:Snapshot[],seconds:number,hints:number,mistakes:number,won:boolean,stats:Record<Level,RecordStats>,daily:string|null};
export function blankStats(){return Object.fromEntries(levels.map(l=>[l,{completed:0,best:null,totalSeconds:0}])) as State['stats']}
export function fresh(level:Level='Easy',stats=blankStats(),daily:string|null=null):State{const p=generate(level,daily?seeded('arcade-sudoku-v1:'+daily+':'+level):Math.random);return {level,puzzle:p.puzzle,solution:p.solution,board:p.puzzle.slice(),notes:Array.from({length:81},()=>[]),undo:[],redo:[],seconds:0,hints:0,mistakes:0,won:false,stats,daily}}
const snapshot=(s:State):Snapshot=>({board:s.board.slice(),notes:s.notes.map(n=>n.slice())});
function finish(s:State):State{if(!s.board.every((v,i)=>v===s.solution[i]))return s;const old=s.stats[s.level];return {...s,won:true,stats:{...s.stats,[s.level]:{completed:old.completed+1,best:old.best===null?s.seconds:Math.min(old.best,s.seconds),totalSeconds:old.totalSeconds+s.seconds}}}}
export function enter(s:State,i:number,n:number,pencil=false):State{if(s.won||i<0||i>=81||s.puzzle[i]||n<0||n>9)return s;const board=s.board.slice(),notes=s.notes.map(x=>x.slice());if(pencil&&n&&board[i]===0){notes[i]=notes[i].includes(n)?notes[i].filter(x=>x!==n):[...notes[i],n].sort()}else{board[i]=n;notes[i]=[];if(n===s.solution[i])for(const j of peers[i])notes[j]=notes[j].filter(x=>x!==n)}
 return finish({...s,board,notes,undo:[...s.undo,snapshot(s)].slice(-300),redo:[],mistakes:s.mistakes+(!pencil&&n!==0&&n!==s.solution[i]?1:0)})}
export function history(s:State,redo=false):State{if(s.won)return s;const source=redo?s.redo:s.undo;if(!source.length)return s;const previous=source[source.length-1];return finish({...s,...previous,undo:redo?[...s.undo,snapshot(s)]:s.undo.slice(0,-1),redo:redo?s.redo.slice(0,-1):[...s.redo,snapshot(s)]})}
export function hint(s:State):{state:State,hint:Hint|null}{if(s.won)return {state:s,hint:null};const wrong=s.board.findIndex((n,i)=>n!==0&&n!==s.solution[i]);const h=wrong>=0?{index:wrong,value:s.solution[wrong],reason:'Correction: this entry conflicts with the unique solution.'}:logicalHint(s.board);
 const i=s.board.findIndex(n=>!n);const next=h??(i>=0?{index:i,value:s.solution[i],reason:'Solution reveal: no immediate single was found; this is the verified value.'}:null);return next?{state:enter({...s,hints:s.hints+1},next.index,next.value),hint:next}:{state:s,hint:null}}
