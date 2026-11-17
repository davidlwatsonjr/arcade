export type Side = 0 | 1;
export type Spot = {x:number;y:number;z:number;key:string};
export type State = {pieces:[string[],string[]];turn:Side;winner:Side|null;moves:number;record:[number,number]};
export const key=(x:number,y:number,z:number)=>x+','+y+','+z;
export const DIRECTIONS:[[number,number,number],[number,number,number],[number,number,number],[number,number,number],[number,number,number],[number,number,number]] = [[1,-1,0],[1,0,-1],[0,1,-1],[-1,1,0],[-1,0,1],[0,-1,1]];
function rotate([x,y,z]:[number,number,number]):[number,number,number]{return [-z,-x,-y]}
export const arm = (side:number):string[]=>{
 const result:string[]=[];
 for(let x=5;x<=8;x++)for(let y=-4;y<=4-x;y++){let cube:[number,number,number]=[x,y,-x-y];for(let n=0;n<side;n++)cube=rotate(cube);result.push(key(...cube))}
 return result;
};
export const spots:Spot[]=(()=>{
 const coords=new Map<string,Spot>();
 const put=(x:number,y:number,z:number)=>{coords.set(key(x,y,z),{x,y,z,key:key(x,y,z)})};
 for(let x=-4;x<=4;x++)for(let y=-4;y<=4;y++){const z=-x-y;if(Math.abs(z)<=4)put(x,y,z)}
 for(let i=0;i<6;i++)for(const k of arm(i)){const [x,y,z]=k.split(',').map(Number);put(x,y,z)}
 return Array.from(coords.values());
})();
export const byKey=new Map(spots.map(s=>[s.key,s]));
export const start=():State=>({pieces:[arm(0),arm(3)],turn:0,winner:null,moves:0,record:[0,0]});
const neighbor=(s:string,d:[number,number,number],n=1)=>{const p=byKey.get(s)!;return key(p.x+d[0]*n,p.y+d[1]*n,p.z+d[2]*n)};
export function destinations(state:State,from:string):string[]{
 if(state.winner!==null||!state.pieces[state.turn].includes(from))return [];
 const occupied=new Set([...state.pieces[0],...state.pieces[1]]);
 const result=new Set<string>();
 for(const d of DIRECTIONS){const p=neighbor(from,d);if(byKey.has(p)&&!occupied.has(p))result.add(p)}
 const seen=new Set([from]),queue=[from];
 while(queue.length){
  const here=queue.shift()!;
  for(const d of DIRECTIONS){
   const over=neighbor(here,d),to=neighbor(here,d,2);
   if(byKey.has(to)&&occupied.has(over)&&!occupied.has(to)&&!seen.has(to)){seen.add(to);result.add(to);queue.push(to)}
  }
 }
 return [...result];
}
export function move(state:State,from:string,to:string):State{
 if(!destinations(state,from).includes(to))return state;
 const pieces:[string[],string[]]=[state.pieces[0].slice(),state.pieces[1].slice()];
 pieces[state.turn]=pieces[state.turn].map(p=>p===from?to:p);
 const win=pieces[state.turn].every(p=>arm((state.turn+3)%6).includes(p));
 const record:[number,number]=[...state.record];
 if(win)record[state.turn]++;
 return {...state,pieces,turn:(1-state.turn) as Side,winner:win?state.turn:null,moves:state.moves+1,record};
}
const distance=(a:string,b:string)=>{const x=byKey.get(a)!,y=byKey.get(b)!;return Math.max(Math.abs(x.x-y.x),Math.abs(x.y-y.y),Math.abs(x.z-y.z))};
export function computerMove(state:State):State{
 if(state.turn!==1||state.winner!==null)return state;
 const targets=arm(0),occupied=new Set(state.pieces[1]);
 const free=targets.filter(k=>!occupied.has(k));
 let best:[string,string]|null=null,bestScore=-Infinity;
 for(const from of state.pieces[1])for(const to of destinations(state,from)){
  const pool=free.length?free:targets;
  const oldDist=Math.min(...pool.map(goal=>distance(from,goal)));
  const newDist=Math.min(...pool.map(goal=>distance(to,goal)));
  const score=(oldDist-newDist)*10 - newDist*0.25 + (targets.includes(to)?9:0)+(Math.random()-0.5)*0.4;
  if(score>bestScore){bestScore=score;best=[from,to]}
 }
 return best?move(state,best[0],best[1]):state;
}
