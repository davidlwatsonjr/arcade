export const levels=['Easy','Medium','Hard','Mensa','Ridiculous'] as const;
export type Level=typeof levels[number];
export type Mark=-1|0|1;
export type Constraint={cells:number[],target:number};
export type Region=Constraint&{id:number};
export type Puzzle={size:number,values:number[],rows:number[],cols:number[],regions:Region[],solution:Mark[]};
export const sizes:Record<Level,number>={Easy:4,Medium:5,Hard:6,Mensa:7,Ridiculous:9};
export function seeded(seed:string){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>{h=(h+0x6D2B79F5)|0;let t=Math.imul(h^(h>>>15),1|h);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296}}
const sum=(values:number[],cells:number[],marks:Mark[])=>cells.reduce((n,i)=>n+(marks[i]===1?values[i]:0),0);
export function constraints(p:Puzzle):Constraint[]{return [...p.rows.map((target,r)=>({target,cells:Array.from({length:p.size},(_,c)=>r*p.size+c)})),...p.cols.map((target,c)=>({target,cells:Array.from({length:p.size},(_,r)=>r*p.size+c)})),...p.regions]}
function masks(values:number[],line:Constraint){const a:number[]=[];for(let m=0;m<(1<<line.cells.length);m++){let v=0;for(let j=0;j<line.cells.length;j++)if(m&(1<<j))v+=values[line.cells[j]];if(v===line.target)a.push(m)}return a}
export function solve(p:Puzzle,initial:Mark[]=Array(p.values.length).fill(0),limit=2,budget=6000):{count:number,solution:Mark[]|null,nodes:number,exhausted:boolean}{
 const lines=constraints(p),options=lines.map(l=>masks(p.values,l));let count=0,solution:Mark[]|null=null,nodes=0,exhausted=false;
 function visit(input:Mark[]){if(count>=limit||exhausted)return;if(++nodes>budget){exhausted=true;return}const marks=input.slice();let changed=true;
 while(changed){changed=false;for(let k=0;k<lines.length;k++){const cells=lines[k].cells;const valid=options[k].filter(m=>cells.every((i,j)=>!marks[i]||((m&(1<<j))!==0)===(marks[i]===1)));if(!valid.length)return;let all=(1<<cells.length)-1,any=0;for(const m of valid){all&=m;any|=m}for(let j=0;j<cells.length;j++){const i=cells[j];if(!marks[i]){if(all&(1<<j)){marks[i]=1;changed=true}else if(!(any&(1<<j))){marks[i]=-1;changed=true}}}}}
 const at=marks.indexOf(0);if(at<0){count++;if(!solution)solution=marks;return}const a=marks.slice();a[at]=1;visit(a);a[at]=-1;visit(a)}
 visit(initial);return {count,solution,nodes,exhausted}}
export function generate(level:Level,random=Math.random):Puzzle{
 const size=sizes[level],length=size*size;
 for(let attempt=0;attempt<100;attempt++){
 const values=Array.from({length},()=>1+Math.floor(random()*9));
 const solution:Mark[]=Array.from({length},()=>random()<.48?1:-1);
 const rows=Array.from({length:size},(_,r)=>sum(values,Array.from({length:size},(_,c)=>r*size+c),solution));
 const cols=Array.from({length:size},(_,c)=>sum(values,Array.from({length:size},(_,r)=>r*size+c),solution));
 if(rows.some((v,r)=>!v||v===values.slice(r*size,(r+1)*size).reduce((a,b)=>a+b,0))||cols.some(v=>!v))continue;
 const regions:Region[]=[];
 if(size>=7){let id=0;for(let r=0;r<size;r+=2)for(let c=0;c<size;c+=3){const cells:number[]=[];for(let y=r;y<Math.min(size,r+2);y++)for(let x=c;x<Math.min(size,c+3);x++)cells.push(y*size+x);regions.push({id:id++,cells,target:sum(values,cells,solution)})}}
 const p={size,values,solution,rows,cols,regions};const result=solve(p);if(result.count===1&&!result.exhausted)return p;
 }
 // Guaranteed unique fallback: each row has one selected digit 9, all other digits 1.
 // A size-9 row cannot reach 9 without that selected cell.
 const solution:Mark[]=Array(length).fill(-1),values=Array(length).fill(1);
 for(let r=0;r<size;r++){const i=r*size+Math.floor(random()*size);solution[i]=1;values[i]=9}
 const rows=Array(size).fill(9),cols=Array.from({length:size},(_,c)=>sum(values,Array.from({length:size},(_,r)=>r*size+c),solution));
 const regions:Region[]=[];if(size>=7){let id=0;for(let r=0;r<size;r+=2)for(let c=0;c<size;c+=3){const cells:number[]=[];for(let y=r;y<Math.min(size,r+2);y++)for(let x=c;x<Math.min(size,c+3);x++)cells.push(y*size+x);regions.push({id:id++,cells,target:sum(values,cells,solution)})}}
 return {size,values,solution,rows,cols,regions}
}
export const totals=(p:Puzzle,marks:Mark[])=>constraints(p).map(l=>sum(p.values,l.cells,marks));
export function deduction(p:Puzzle,marks:Mark[]):{index:number,mark:Mark,reason:string}|null{
 const wrong=marks.findIndex((m,i)=>m!==0&&m!==p.solution[i]);if(wrong>=0)return {index:wrong,mark:p.solution[wrong],reason:'Correction: this selection conflicts with the unique solution.'};
 for(const [k,l] of constraints(p).entries()){const valid=masks(p.values,l).filter(m=>l.cells.every((i,j)=>!marks[i]||Boolean(m&(1<<j))===(marks[i]===1)));if(!valid.length)continue;for(let j=0;j<l.cells.length;j++){const i=l.cells[j];if(marks[i])continue;const on=valid.every(m=>Boolean(m&(1<<j))),off=valid.every(m=>!(m&(1<<j)));if(on||off)return {index:i,mark:on?1:-1,reason:(k<p.size?'Row '+(k+1):k<2*p.size?'Column '+(k-p.size+1):'Region '+(k-2*p.size+1))+' requires this number to be '+(on?'kept.':'erased.')};}}
 const i=marks.indexOf(0);return i<0?null:{index:i,mark:p.solution[i],reason:'Solution reveal: no immediate line deduction was found.'}
}
export type Stats=Record<Level,{completed:number,best:number|null,totalSeconds:number}>;
export type State={level:Level,puzzle:Puzzle,marks:Mark[],undo:Mark[][],redo:Mark[][],seconds:number,hints:number,mistakes:number,won:boolean,stats:Stats,daily:string|null};
export function fresh(level:Level='Easy',stats=Object.fromEntries(levels.map(l=>[l,{completed:0,best:null,totalSeconds:0}])) as Stats,daily:string|null=null):State{const puzzle=generate(level,daily?seeded('sum-logic-v1:'+daily+':'+level):Math.random);return {level,puzzle,marks:Array(puzzle.values.length).fill(0),undo:[],redo:[],seconds:0,hints:0,mistakes:0,won:false,stats,daily}}
function complete(s:State):State{const ts=totals(s.puzzle,s.marks);if(!constraints(s.puzzle).every((l,i)=>l.target===ts[i]))return s;const old=s.stats[s.level];return {...s,won:true,stats:{...s.stats,[s.level]:{completed:old.completed+1,best:old.best===null?s.seconds:Math.min(old.best,s.seconds),totalSeconds:old.totalSeconds+s.seconds}}}}
export function mark(s:State,i:number,value:Mark,auto=false):State{if(s.won||i<0||i>=s.marks.length||s.marks[i]===value)return s;const marks=s.marks.slice();marks[i]=value;if(auto){for(const l of constraints(s.puzzle))if(sum(s.puzzle.values,l.cells,marks)===l.target&&l.cells.every(j=>marks[j]!==1||s.puzzle.solution[j]===1))for(const j of l.cells)if(!marks[j])marks[j]=-1}
 return complete({...s,marks,undo:[...s.undo,s.marks].slice(-300),redo:[],mistakes:s.mistakes+(value!==0&&value!==s.puzzle.solution[i]?1:0)})}
export function history(s:State,redo=false):State{if(s.won)return s;const source=redo?s.redo:s.undo;if(!source.length)return s;return complete({...s,marks:source[source.length-1],undo:redo?[...s.undo,s.marks]:s.undo.slice(0,-1),redo:redo?s.redo.slice(0,-1):[...s.redo,s.marks]})}
