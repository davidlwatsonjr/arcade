export type Side=0|1;
export type Fleet={ships:number[],shots:boolean[]};
export type State={fleets:[Fleet,Fleet],turn:Side,winner:Side|null,record:[number,number],message:string,shots:number};
export const sizes=[5,4,3,3,2];
export function fleet(random=Math.random):Fleet{const ships=Array(100).fill(-1) as number[];sizes.forEach((size,id)=>{let placed=false;for(let t=0;t<2000&&!placed;t++){const horizontal=random()<.5, r=Math.floor(random()*10),c=Math.floor(random()*10),sites=Array.from({length:size},(_,i)=>(r+(horizontal?0:i))*10+c+(horizontal?i:0));if(sites.some(i=>i<0||i>=100||Math.floor(i/10)!==(r+(horizontal?0:Math.floor((i-r*10-c)/10)))|| (horizontal?c+size>10:r+size>10)||ships[i]!==-1))continue;sites.forEach(i=>ships[i]=id);placed=true}if(!placed)throw Error('Unable to place fleet')});return {ships,shots:Array(100).fill(false)}}
export const start=(record:[number,number]=[0,0]):State=>({fleets:[fleet(),fleet()],turn:0,winner:null,record,message:'Fire at a square on the enemy grid.',shots:0});
export const sunk=(f:Fleet,id:number):boolean=>id>=0&&f.ships.every((s,i)=>s!==id||f.shots[i]);
export const remaining=(f:Fleet):number=>sizes.filter((_,id)=>!sunk(f,id)).length;
export function fire(s:State,target:number):State{if(s.winner!==null||target<0||target>=100||s.fleets[(1-s.turn) as Side].shots[target])return s;const enemy=(1-s.turn) as Side;const fleets:[Fleet,Fleet]=s.fleets.map(f=>({ships:f.ships.slice(),shots:f.shots.slice()})) as [Fleet,Fleet];
 fleets[enemy].shots[target]=true;const id=fleets[enemy].ships[target],win=remaining(fleets[enemy])===0;
 const record:[number,number]=[...s.record];if(win)record[s.turn]++;
 return {...s,fleets,winner:win?s.turn:null,turn:win?s.turn:enemy,record,shots:s.shots+1,message:win?(s.turn===0?'You sunk the entire enemy fleet!':'Computer wins!'):(s.turn===0?'You':'Computer')+(id<0?' missed.':sunk(fleets[enemy],id)?' sank a ship!':' hit a ship!')};
}
export function computer(s:State,random=Math.random):State{if(s.turn!==1||s.winner!==null)return s;const target=s.fleets[0],open=target.shots.flatMap((v,i)=>!v?[i]:[]);if(!open.length)return s;
 const hunt=new Set<number>();target.shots.forEach((shot,i)=>{if(!shot||target.ships[i]<0||sunk(target,target.ships[i]))return;const r=Math.floor(i/10),c=i%10;for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const y=r+dr,x=c+dc;if(y>=0&&y<10&&x>=0&&x<10&&!target.shots[y*10+x])hunt.add(y*10+x)}});
 const candidates=hunt.size?[...hunt]:open.filter(i=>(Math.floor(i/10)+i%10)%2===0);const pool=candidates.length?candidates:open;return fire(s,pool[Math.floor(random()*pool.length)])}
