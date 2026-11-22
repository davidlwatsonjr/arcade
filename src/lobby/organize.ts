export type Game={name:string,slug:string,icon:string,subtitle:string,description:string,category:string};
export type Order='alphabetical'|'category';
export type Layout='grid'|'list';
export type Group={title:string,games:Game[]};
export function organize(games:Game[],pinned:string[],order:Order):Group[]{
 const pins=new Set(pinned),sorted=games.slice().sort((a,b)=>a.name.localeCompare(b.name));
 const favorites=sorted.filter(g=>pins.has(g.slug)),rest=sorted.filter(g=>!pins.has(g.slug));
 const groups:Group[]=favorites.length?[{title:'Pinned games',games:favorites}]:[];
 if(order==='alphabetical'){if(rest.length)groups.push({title:favorites.length?'All other games':'All games',games:rest});return groups}
 const names:Record<string,string>={Board:'Board games',Cards:'Card games',Dice:'Dice games',Puzzle:'Puzzles'};
 for(const category of [...new Set(rest.map(g=>g.category))].sort())groups.push({title:names[category]??category,games:rest.filter(g=>g.category===category)});
 return groups
}
export function togglePin(pinned:string[],slug:string):string[]{return pinned.includes(slug)?pinned.filter(p=>p!==slug):[...pinned,slug]}
