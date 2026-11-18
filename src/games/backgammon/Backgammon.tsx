import {useEffect,useState} from 'react';
import {usePersistentState} from '../../hooks/usePersistentState';
import {fresh,roll,options,play,endTurn,computerStep,pipCount,type State,type Move} from './engine';
export function Backgammon({onBack}:{onBack:()=>void}){
 const [game,setGame]=usePersistentState<State>('arcade:backgammon:v1',fresh);
 const [selected,setSelected]=useState<number|'bar'|null>(null);
 const legal=game.turn===0?options(game):[];
 const yours=game.turn===0&&game.winner===null;
 useEffect(()=>{if(game.turn!==1||game.winner!==null)return;const t=setTimeout(()=>setGame(s=>computerStep(s)),430);return()=>clearTimeout(t)},[game,setGame]);
 function choose(m:Move){setGame(s=>play(s,m));setSelected(null)}
 const destinations=selected===null?[]:legal.filter(m=>m.from===selected);
 const points=[Array.from({length:12},(_,i)=>23-i),Array.from({length:12},(_,i)=>11-i)];
 return <main className="arc-game arc-wide"><button className="back" onClick={onBack}>← Back to games</button><h1>Backgammon</h1><p>You move from point 24 toward point 1; the computer moves in the opposite direction. Hit blots, re-enter from the bar, and bear off all 15 checkers.</p>
 <div className="arc-score">Your pip count {pipCount(game,0)} · Computer {pipCount(game,1)} · Wins {game.games[0]}–{game.games[1]}</div>
 <div className="bg-score"><span>YOU · OFF {game.off[0]} · BAR {game.bar[0]}</span><span>COMPUTER · OFF {game.off[1]} · BAR {game.bar[1]}</span></div>
 <div className="bg-board" role="group" aria-label="Backgammon board">
 {points.map((row,rowIndex)=><div className="bg-row" key={rowIndex}>{row.map((point,i)=>{const count=game.board[point],canChoose=yours&&legal.some(m=>m.from===point),isSelected=selected===point;
 return <button key={point} onClick={()=>canChoose?setSelected(point):setSelected(null)} className={'bg-point '+(i%2===0?'alternating ':'')+(isSelected?'selected ':'')+(canChoose?'legal':'')} disabled={!canChoose} aria-label={'Point '+(point+1)+', '+Math.abs(count)+' '+(count>0?'your':count<0?'computer':'')+' checkers'}><small>{point+1}</small><span className={'bg-stones '+(count>0?'human':count<0?'bot':'')}>{count?('●'+(Math.abs(count)>1?'×'+Math.abs(count):'')):'·'}</span></button>})}</div>)}
 </div>
 <div className="bg-dice"><span>{game.rolled?'Dice remaining: '+(game.dice.join(' · ')||'none'):'Dice waiting to roll'}</span>{yours&&game.rolled&&game.bar[0]>0&&<button className={selected==='bar'?'selected':''} onClick={()=>setSelected('bar')}>Enter from bar ({game.bar[0]})</button>}</div>
 <div className="arc-message" aria-live="polite">{game.winner===0?'You win!':game.winner===1?'Computer wins!':yours?game.rolled?legal.length?selected===null?'Select a highlighted point, then a destination':'Choose where to move.':'No legal moves — pass your turn.':'Roll to take your turn.':'Computer is playing…'} <small>{game.message}</small></div>
 {yours&&!game.rolled&&<button className="play arc-action" onClick={()=>setGame(s=>roll(s))}>Roll dice</button>}
 {yours&&game.rolled&&legal.length===0&&<button className="play arc-action" onClick={()=>setGame(s=>endTurn(s))}>Pass turn</button>}
 {yours&&destinations.length>0&&<div className="bg-moves">{destinations.map((m,i)=><button key={i} onClick={()=>choose(m)}>{m.from==='bar'?'Bar':m.from+1} → {m.to==='off'?'Bear off':m.to+1} <small>die {m.die}</small></button>)}</div>}
 {yours&&game.rolled&&legal.length>0&&selected===null&&<div className="bg-help">Playable starting points: {[...new Set(legal.map(m=>m.from==='bar'?'bar':m.from+1))].join(', ')}</div>}
 <button className="arc-secondary" onClick={()=>{if(confirm('Start a new Backgammon game?')){setGame(s=>({...fresh(),games:s.games}));setSelected(null)}}}>New game</button></main>
}
