import './style.css';
import {useEffect,useState} from 'react';
import {usePersistentState} from '../../hooks/usePersistentState';
import {start,spots,destinations,move,computerMove,type State} from './engine';
export function ChineseCheckers({onBack}:{onBack:()=>void}){
 const [game,setGame]=usePersistentState<State>('arcade:chinese-checkers:v1',start);
 const [selected,setSelected]=useState<string|null>(null);
 const human=game.turn===0&&game.winner===null;
 const available=human&&selected?destinations(game,selected):[];
 useEffect(()=>{if(game.turn!==1||game.winner!==null)return;const t=setTimeout(()=>setGame(s=>computerMove(s)),380);return()=>clearTimeout(t)},[game,setGame]);
 function click(k:string){if(!human)return;if(selected&&available.includes(k)){setGame(s=>move(s,selected,k));setSelected(null)}else setSelected(game.pieces[0].includes(k)?k:null)}
 const points=game.pieces.map(p=>new Set(p));
 return <main className="arc-game arc-wide"><button className="back" onClick={onBack}>← Back to games</button><h1>Chinese Checkers</h1><p>Two-player race across the star. You are ●, starting at the bottom; the computer is ×; leap over any checker to chain hops. First to fill the opposite triangle wins.</p><div className="arc-score">Your wins {game.record[0]} · Computer wins {game.record[1]} · Moves {game.moves}</div>
 <div className="cc-board"><svg viewBox="-165 -185 330 370" role="group" aria-label="Chinese Checkers board">
 {spots.map(s=>{const x=(s.y-s.z)*12.125,y=s.x*21;const person=points[0].has(s.key),bot=points[1].has(s.key),marked=available.includes(s.key);
 return <g key={s.key} role="button" tabIndex={human?0:-1} aria-label={(person?'Your checker':bot?'Computer checker':'Empty')+' at '+s.key} onClick={()=>click(s.key)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();click(s.key)}}} style={{cursor:human?'pointer':'default'}}>
 <circle cx={x} cy={y} r="10.4" fill={person?'#bd9dff':bot?'#ffb87e':marked?'#314f46':'#29283f'} stroke={s.key===selected?'#fff18a':marked?'#96e2b2':'#706185'} strokeWidth={s.key===selected||marked?3.2:1.3}/>
 {person||bot?<text x={x} y={y+3.5} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#20182c">{person?"●":"×"}</text>:marked?<circle cx={x} cy={y} r="3.2" fill="#acffd5"/>:null}
 </g>})}
 </svg></div>
 <div className="arc-message" aria-live="polite">{game.winner!==null?(game.winner===0?'You win!':'Computer wins!'):human?selected?'Choose a highlighted hole':'Select one of your checkers':'Computer is moving…'}</div>
 <button className="play arc-action" onClick={()=>{setGame(s=>({...start(),record:s.record}));setSelected(null)}}>New game</button></main>
}
