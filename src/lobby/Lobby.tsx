import './style.css';
import {usePersistentState} from '../hooks/usePersistentState';
import {organize,togglePin,type Game,type Layout,type Order} from './organize';
export function Lobby({games}:{games:Game[]}){
 const [layout,setLayout]=usePersistentState<Layout>('arcade:lobby:layout','grid');
 const [order,setOrder]=usePersistentState<Order>('arcade:lobby:order','alphabetical');
 const [pins,setPins]=usePersistentState<string[]>('arcade:lobby:pins',[]);
 const groups=organize(games,pins,order);
 return <section className="lobby" aria-label="Game library"><div className="section-heading"><h2>Game library</h2><span>{games.length} games · {games.filter(g=>pins.includes(g.slug)).length} pinned</span></div>
 <div className="lobby-toolbar"><fieldset><legend>View</legend><button type="button" aria-pressed={layout==='grid'} onClick={()=>setLayout('grid')}>▦ Grid</button><button type="button" aria-pressed={layout==='list'} onClick={()=>setLayout('list')}>☰ List</button></fieldset><fieldset><legend>Arrange by</legend><button type="button" aria-pressed={order==='alphabetical'} onClick={()=>setOrder('alphabetical')}>A–Z</button><button type="button" aria-pressed={order==='category'} onClick={()=>setOrder('category')}>Category</button></fieldset></div>
 {groups.map(group=><section className="lobby-group" key={group.title}><h3 className="lobby-group-title">{group.title} <small>{group.games.length}</small></h3><div className={'library lobby-library '+(layout==='list'?'list-layout':'grid-layout')}>{group.games.map(game=>{const pinned=pins.includes(game.slug),index=games.findIndex(g=>g.slug===game.slug);return <article className={'game-card available '+(pinned?'is-pinned':'')} key={game.slug}><button type="button" className="pin-game" aria-pressed={pinned} aria-label={(pinned?'Unpin ':'Pin ')+game.name} title={(pinned?'Unpin ':'Pin ')+game.name} onClick={()=>setPins(old=>togglePin(old,game.slug))}>{pinned?'★':'☆'}</button><div className={'game-icon icon-'+(index%8)} aria-hidden="true">{game.icon}</div><div className="card-content"><h4>{game.name}</h4><p>{game.subtitle}</p></div><a className="play" href={'/games/'+game.slug+'/'} aria-label={'Play '+game.name}>Play <span>→</span></a></article>})}</div></section>)}
 </section>
}
