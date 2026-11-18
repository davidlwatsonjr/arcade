import {useEffect,useState} from 'react';
import {usePersistentState} from '../../hooks/usePersistentState';
import {fresh,nextRound,draw,meld,layoff,knock,discardCard,computerStep,total,label,meldValid,type State,type Card} from './engine';
function Face({card}:{card:Card}){return <span className={'tonk-card '+(card.suit==='♥'||card.suit==='♦'?'red':'')}>{label(card.rank)}<small>{card.suit}</small></span>}
export function Tonk({onBack}:{onBack:()=>void}){
 const [game,setGame]=usePersistentState<State>('arcade:tonk:v1',fresh);
 const [selected,setSelected]=useState<string[]>([]);
 useEffect(()=>{if(game.turn!==1||game.phase==='round-end')return;const t=setTimeout(()=>setGame(s=>computerStep(s)),490);return()=>clearTimeout(t)},[game,setGame]);
 const hand=game.hands[0].slice().sort((a,b)=>a.rank-b.rank||a.suit.localeCompare(b.suit));
 const isMyTurn=game.turn===0&&game.phase!=='round-end';
 const cards=hand.filter(c=>selected.includes(c.id));
 const validMeld=meldValid(cards);
 const canKnock=isMyTurn&&total(hand)<=5;
 function toggle(id:string){setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])}
 function action(f:(s:State)=>State){setGame(f);setSelected([])}
 return <main className="arc-game arc-wide"><button className="back" onClick={onBack}>← Back to games</button><h1>Tonk</h1><p>Two-player five-card Tonk. Draw, lay down three-card sets or suited runs, and discard. Knock at 5 points or fewer; ties undercut the knocker. A natural 50 scores double.</p>
 <div className="arc-score">Round {game.round} · Your wins {game.scores[0]} · Computer wins {game.scores[1]} · Stock {game.deck.length}</div>
 <div className="tonk-table">
 <div className="tonk-opponent"><b>Computer · {game.hands[1].length} cards</b><div className="tonk-backs">{game.hands[1].map(c=><span key={c.id}>✦</span>)}</div></div>
 <div className="tonk-middle"><div><h2>Discard</h2><span className="tonk-card">{game.discard.length?<Face card={game.discard[game.discard.length-1]}/>: '—'}</span></div><div><h2>Draw pile</h2><span className="tonk-stock">✦<small>{game.deck.length}</small></span></div></div>
 <div className="tonk-melds">{game.melds.map((groups,side)=><div key={side}><h3>{side===0?'Your melds':'Computer melds'}</h3><div className="tonk-groups">{groups.length?groups.map((group,i)=><span key={i}>{group.map(c=>label(c.rank)+c.suit).join(' ')}</span>):<small>None yet</small>}</div></div>)}</div>
 </div>
 <div className="arc-message" aria-live="polite">{game.message}</div>
 <h2 className="arc-subtitle">Your hand · {total(hand)} points</h2><div className="tonk-hand">{hand.map(card=><button key={card.id} disabled={!isMyTurn||game.phase!=='action'} onClick={()=>toggle(card.id)} className={selected.includes(card.id)?'selected':''}><Face card={card}/></button>)}</div>
 {isMyTurn&&game.phase==='draw'&&<div className="tonk-actions"><button onClick={()=>action(s=>draw(s,'stock'))}>Draw stock</button><button disabled={!game.discard.length} onClick={()=>action(s=>draw(s,'discard'))}>Take discard</button></div>}
 {isMyTurn&&game.phase==='action'&&<div className="tonk-actions"><button disabled={!validMeld} onClick={()=>action(s=>meld(s,selected))}>Lay meld ({selected.length})</button><button disabled={selected.length!==1||!game.hands[0].some(c=>c.id===selected[0]&&c.id!==game.drawnDiscardId)} onClick={()=>action(s=>discardCard(s,selected[0]))}>Discard selected</button></div>}
 {isMyTurn&&game.phase==='action'&&selected.length===1&&game.melds.map((groups,side)=>groups.map((group,i)=>meldValid([...group,cards[0]])&&<button key={side+'-'+i} className="arc-secondary" onClick={()=>action(s=>layoff(s,selected[0],side as 0|1,i))}>Add card to {side===0?'your':'computer'} meld {i+1}</button>))}
 {canKnock&&<button className="play arc-action" onClick={()=>action(knock)}>Knock ({total(hand)} points)</button>}
 {game.phase==='round-end'&&<button className="play arc-action" onClick={()=>action(nextRound)}>Next round</button>}
 <button className="arc-secondary" onClick={()=>{if(confirm('Reset Tonk match scores?')){setGame(fresh());setSelected([])}}}>Reset match</button></main>
}
