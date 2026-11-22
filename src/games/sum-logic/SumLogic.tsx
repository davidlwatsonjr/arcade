import './style.css';
import {useEffect,useRef,useState} from 'react';
import {usePersistentState} from '../../hooks/usePersistentState';
import {fresh,levels,mark,history,totals,deduction,type State,type Level,type Mark} from './engine';
const clock=(n:number)=>Math.floor(n/60)+':'+String(n%60).padStart(2,'0');
export function SumLogic({onBack}:{onBack:()=>void}){
 const [s,set]=usePersistentState<State>('arcade:sum-logic:v1',()=>fresh());
 const [mode,setMode]=useState<Mark>(1),[auto,setAuto]=usePersistentState('arcade:sum-logic:auto',false),[challenge,setChallenge]=usePersistentState('arcade:sum-logic:challenge',false),[msg,setMsg]=useState('');
 const drag=useRef<{pointer:number,value:Mark,seen:Set<number>}|null>(null);
 const lost=challenge&&s.mistakes>=3&&!s.won;
 useEffect(()=>{if(s.won||lost)return;const t=setInterval(()=>{if(!document.hidden)set(x=>({...x,seconds:x.seconds+1}))},1000);return()=>clearInterval(t)},[s.won,lost,set]);
 const n=s.puzzle.size,ts=totals(s.puzzle,s.marks);
 function apply(i:number,v:Mark){if(!lost)set(x=>challenge&&x.mistakes>=3?x:mark(x,i,v,auto));setMsg('')}
 function next(l:Level,daily=false){if(!s.won&&!lost&&s.undo.length&&!confirm('Replace this puzzle?'))return;set(x=>fresh(l,x.stats,daily?new Date().toISOString().slice(0,10):null));setMsg('')}
 function hint(){const h=deduction(s.puzzle,s.marks);if(!h||lost||s.won)return;set(x=>mark({...x,hints:x.hints+1},h.index,h.mark,auto));setMsg(h.reason)}
 function target(v:number,goal:number){return <span className={'sum-target '+(v===goal?'met':v>goal?'over':'')}><b>{goal}</b><small>{v}/{goal}</small></span>}
 return <main className="arc-game sum-game"><button className="back" onClick={onBack}>← Back to games</button><h1>Sum Logic</h1><p>Circle numbers so the selected total in every row, column and colored region equals its target. Erase the rest. Every puzzle has one solution.</p>
 <div className="sum-controls">{levels.map(l=><button key={l} className={s.level===l?'active':''} onClick={()=>next(l)}>{l}</button>)}</div><div className="arc-score">{s.level} · {n}×{n} · {clock(s.seconds)} · Hints {s.hints} · {challenge?'Lives '+Math.max(0,3-s.mistakes):'Mistakes '+s.mistakes}</div>
 <div className="sum-grid" style={{gridTemplateColumns:'repeat('+(n+1)+',minmax(0,1fr))'}} onPointerMove={e=>{const a=drag.current;if(!a||a.pointer!==e.pointerId)return;const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-sum-cell]');if(!cell)return;const i=Number(cell.dataset.sumCell);if(!a.seen.has(i)){a.seen.add(i);apply(i,a.value)}}} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}} onLostPointerCapture={()=>{drag.current=null}}>
 <span/>{s.puzzle.cols.map((v,c)=><span key={'c'+c}>{target(ts[n+c],v)}</span>)}
 {s.puzzle.rows.map((v,r)=><div className="sum-row" key={r}><span>{target(ts[r],v)}</span>{Array.from({length:n},(_,c)=>{const i=r*n+c,reg=s.puzzle.regions.find(x=>x.cells.includes(i)),m=s.marks[i];return <button key={i} data-sum-cell={i} className={'sum-cell '+(m===1?'kept':m===-1?'erased':'')} style={reg?{backgroundColor:['#373054','#294b4b','#58423d','#3a405e','#513855','#344d3d'][reg.id%6]}:undefined} disabled={s.won||lost} aria-label={'Row '+(r+1)+' column '+(c+1)+', '+s.puzzle.values[i]+(reg?', region '+(reg.id+1):'')+(m===1?', circled':m===-1?', erased':'')} onPointerDown={e=>{if(!e.isPrimary||e.button!==0)return;const value=m===mode?0:mode;drag.current={pointer:e.pointerId,value,seen:new Set([i])};e.currentTarget.setPointerCapture(e.pointerId);apply(i,value)}} onClick={e=>{if(e.detail===0)apply(i,m===mode?0:mode)}}>{reg&&<small className="sum-region-id">{reg.id+1}</small>}<span>{s.puzzle.values[i]}</span></button>})}</div>)}
 </div>
 {s.puzzle.regions.length>0&&<div className="sum-regions">{s.puzzle.regions.map((r,i)=><span key={r.id}>Region {r.id+1} {target(ts[2*n+i],r.target)}</span>)}</div>}
 <div className="sum-controls"><button aria-pressed={mode===1} className={mode===1?'active':''} onClick={()=>setMode(1)}>◯ Circle</button><button aria-pressed={mode===-1} className={mode===-1?'active':''} onClick={()=>setMode(-1)}>× Erase</button><button disabled={!s.undo.length||s.won||lost} onClick={()=>set(x=>history(x))}>Undo</button><button disabled={!s.redo.length||s.won||lost} onClick={()=>set(x=>history(x,true))}>Redo</button><button disabled={s.won||lost} onClick={hint}>Hint</button></div>
 <div className="arc-message" aria-live="polite">{s.won?'Solved in '+clock(s.seconds)+'!':lost?'Out of lives. Start a new puzzle.':msg||'Tap or drag across numbers to mark them.'}</div><div className="sum-settings"><label><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/> Auto-erase completed lines</label><label><input type="checkbox" checked={challenge} onChange={e=>setChallenge(e.target.checked)}/> Three-life challenge</label></div>
 <div className="sum-controls"><button onClick={()=>next(s.level)}>New puzzle</button><button onClick={()=>next(s.level,true)}>Daily puzzle (UTC)</button></div>{s.daily&&<p>Daily challenge: {s.daily}</p>}<div className="arc-info"><h2>Statistics</h2>{levels.map(l=><p key={l}>{l}: {s.stats[l].completed} solved · Best {s.stats[l].best===null?'—':clock(s.stats[l].best!)}</p>)}</div></main>
}
