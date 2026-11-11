import { useEffect, useState } from 'react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { bidForComputer, cardForComputer, cardId, cardLabel, legalCards, nextHand, placeBid, playCard, resolveTrick, SEAT_NAMES, startHand, team, type Card, type Seat } from './engine';

type Props = { onBack: () => void };
const symbols = {S:'♠',H:'♥',D:'♦',C:'♣'} as const;

function PlayingCard({card,enabled=false,onClick,small=false}: {card:Card;enabled?:boolean;onClick?:()=>void;small?:boolean}){
  const red = card.suit==='H'||card.suit==='D';
  return <button type="button" className={`sp-card ${red?'red':'black'} ${small?'small':''} ${enabled?'selectable':''}`} onClick={onClick} disabled={!enabled} aria-label={cardLabel(card)}>
    <span className="sp-corner">{cardLabel(card).slice(0,-1)}<span>{symbols[card.suit]}</span></span>
    <span className="sp-symbol">{symbols[card.suit]}</span>
  </button>;
}

export function SpadesGame({onBack}:Props) {
  const [game,setGame] = usePersistentState('arcade.spades.match.v1', () => startHand());
  const [selectedBid,setSelectedBid] = useState(3);
  const humanTurn = game.currentPlayer===0;
  useEffect(()=>{
    if(game.stage==='bidding' && !humanTurn){
      const timer=window.setTimeout(()=>setGame(s=>s.stage==='bidding' && s.currentPlayer!==0 ? placeBid(s,s.currentPlayer,bidForComputer(s.hands[s.currentPlayer])) : s),550);
      return ()=>window.clearTimeout(timer);
    }
    if(game.stage==='playing' && !humanTurn){
      const timer=window.setTimeout(()=>setGame(s=>s.stage==='playing' && s.currentPlayer!==0 ? playCard(s,s.currentPlayer,cardForComputer(s,s.currentPlayer)) : s),650);
      return ()=>window.clearTimeout(timer);
    }
    if(game.stage==='trick-end'){
      const timer=window.setTimeout(()=>setGame(s=>resolveTrick(s)),1100);
      return ()=>window.clearTimeout(timer);
    }
  },[game.stage,game.currentPlayer,game.trick.length,game.handNumber,humanTurn,setGame]);
  const selectable=game.stage==='playing' && humanTurn?legalCards(game.hands[0],game.trick,game.spadesBroken):[];
  const playHuman=(card:Card)=>setGame(s=>playCard(s,0,card));
  const bidHuman=()=>setGame(s=>placeBid(s,0,selectedBid));
  const newGame=()=>{if(window.confirm('Start a fresh Spades match? Current match progress will be replaced.'))setGame(startHand())};
  const seatInfo=(seat:Seat)=>
    <div className={`sp-player ${seat===0?'sp-player-you':''} ${game.currentPlayer===seat&&game.stage!=='hand-end'&&game.stage!=='game-over'?'active':''}`}>
      <span className="sp-avatar">{seat===0?'YOU':seat===2?'★':seat===1?'W':'E'}</span>
      <div className="sp-player-meta"><strong>{SEAT_NAMES[seat]}</strong><small>{seat===0||seat===2?'YOUR TEAM':'OPPONENTS'}</small><span>Bid: {game.bids[seat]===null?'—':game.bids[seat]===0?'Nil':game.bids[seat]} · Tricks: {game.tricks[seat]}</span></div>
      {seat!==0&&<div className="sp-card-count">{game.hands[seat].length} cards</div>}
    </div>;
  const stateText = game.stage==='bidding' ? (humanTurn?'Choose your bid':'Computer is bidding…')
    :game.stage==='playing' ? (humanTurn?'Your turn — choose a highlighted card':`${SEAT_NAMES[game.currentPlayer]} is thinking…`)
    :game.stage==='trick-end' ? `${SEAT_NAMES[game.lastWinner ?? 0]} wins the trick`
    :game.stage==='hand-end' ? 'Hand complete — review your scores'
    :`Match complete — ${game.summary?.winner===0?'Your team wins!':'Opponents win!'}`;
  return <main className="spades-game">
    <div className="sp-title-row"><div><button className="back" onClick={onBack}>← Game library</button><h1>♠ Spades</h1><p>Play with your AI partner against West &amp; East.</p></div><button className="sp-new" onClick={newGame}>New match</button></div>
    <div className="sp-scoreline"><div><span>YOU + PARTNER</span><strong>{game.scores[0]}</strong><small>{game.bags[0]} / 10 bags</small></div><div className="sp-score-divider">VS</div><div><span>WEST + EAST</span><strong>{game.scores[1]}</strong><small>{game.bags[1]} / 10 bags</small></div></div>
    <div className="sp-meta"><span>Hand {game.handNumber}</span><span>Trick {Math.min(game.trickNumber+1,13)} of 13</span><span>Dealer: {SEAT_NAMES[game.dealer]}</span><span>{game.spadesBroken?'♠ Spades broken':'♠ Not broken'}</span></div>
    <div className="sp-table" aria-label="Four-player spades table">
      <div className="sp-north">{seatInfo(2)}</div><div className="sp-west">{seatInfo(1)}</div>
      <div className="sp-center"><div className="sp-felt"><div className="sp-played north">{game.trick.filter(p=>p.seat===2).map(p=><PlayingCard key="north" card={p.card} small/>)}</div><div className="sp-played west">{game.trick.filter(p=>p.seat===1).map(p=><PlayingCard key="west" card={p.card} small/>)}</div><div className="sp-felt-icon">♠</div><div className="sp-played east">{game.trick.filter(p=>p.seat===3).map(p=><PlayingCard key="east" card={p.card} small/>)}</div><div className="sp-played south">{game.trick.filter(p=>p.seat===0).map(p=><PlayingCard key="south" card={p.card} small/>)}</div></div></div>
      <div className="sp-east">{seatInfo(3)}</div><div className="sp-south">{seatInfo(0)}</div>
    </div>
    <div className="sp-message" role="status" aria-live="polite">{stateText}</div>
    {game.stage==='bidding'&&humanTurn&&<div className="sp-bidding"><h2>Place your bid</h2><p>How many of the 13 tricks will you personally win? Your bid combines with your partner's. Nil means you'll take none.</p><div className="sp-bid-options">{Array.from({length:14},(_,n)=><button key={n} type="button" className={selectedBid===n?'chosen':''} onClick={()=>setSelectedBid(n)} aria-pressed={selectedBid===n}>{n===0?'Nil':n}</button>)}</div><button className="play sp-bid-submit" onClick={bidHuman}>Confirm {selectedBid===0?'Nil':selectedBid} bid →</button></div>}
    {game.stage==='playing'&&<section className="sp-hand"><h2>Your hand <span>{game.hands[0].length} cards</span></h2><div className="sp-hand-scroll" aria-label="Your cards">{game.hands[0].map(card=><PlayingCard key={cardId(card)} card={card} enabled={humanTurn&&selectable.some(c=>cardId(c)===cardId(card))} onClick={()=>playHuman(card)}/>)}</div><p>Tap a highlighted card to play. You must follow suit when able.</p></section>}
    {(game.stage==='hand-end'||game.stage==='game-over')&&game.summary&&<section className="sp-summary"><h2>{game.stage==='game-over'?(game.summary.winner===0?'🏆 You won the match!':'The opponents won this match'):`Hand ${game.handNumber} complete`}</h2><div className="sp-summary-grid">{game.summary.scores.map((entry,i)=><div key={i}><h3>{i===0?'Your team':'Opponents'}</h3><div>Bid: {entry.contract} · Made: {entry.contractTricks}</div><div>Overtricks: {entry.bagsEarned} · Nil: {entry.nilBonus>0?'+':''}{entry.nilBonus}</div><div>Bag penalty: -{entry.bagPenalty}</div><strong>{entry.points>0?'+':''}{entry.points} points</strong></div>)}</div><button className="play" onClick={()=>game.stage==='game-over'?setGame(startHand()):setGame(s=>nextHand(s))}>{game.stage==='game-over'?'Play a new match':'Deal next hand'} →</button></section>}
    <details className="sp-rules"><summary>Rules &amp; scoring</summary><p>Four players, two teams: you and North face West and East. Each player bids 0–13 after seeing 13 cards. Team bids are added. The player left of the dealer leads the first trick. Follow the suit led if possible; otherwise you may discard or trump with a spade. Spades cannot be led until broken unless you have only spades.</p><p>Taking at least your team bid earns 10 points per bid trick, plus 1 per overtrick (bag). Missing the bid loses 10 points per bid trick. Each 10 accumulated bags costs 100 points. A Nil bid earns +100 if you take zero tricks, or -100 otherwise; Nil tricks count as bags rather than toward your partner's contract. First team to 500 wins, with the higher score winning if both pass 500 in the same hand. Blind Nil and jokers are not enabled in this first version.</p></details>
  </main>;
}
