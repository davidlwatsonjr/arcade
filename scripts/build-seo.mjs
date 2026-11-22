import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const dist=new URL('../dist/',import.meta.url);
const catalog=JSON.parse(await readFile(new URL('../src/game-catalog.json',import.meta.url),'utf8'));
const origin='https://arcade.davidlwatsonjr.com';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const gamePath=g=>'/games/'+g.slug+'/';
const template=await readFile(new URL('index.html',dist),'utf8');
const homeTitle='Arcade – Free Classic Card, Board, Dice & Puzzle Games';
const homeDesc='Play '+catalog.length+' free classic games against the computer, including Spades, Solitaire, Chess, Uno and more. Mobile-friendly, installable and playable offline after the first visit.';
const links=games=>games.map(g=>'<li><a href="'+gamePath(g)+'">Play '+escape(g.name)+'</a> — '+escape(g.subtitle)+'</li>').join('');
function render(game){
 const path=game?gamePath(game):'/';
 const url=origin+path;
 const title=game?'Play '+game.name+' Free Against the Computer | Arcade':homeTitle;
 const desc=game?game.description+' Free browser game with offline play after setup.':homeDesc;
 const schema=game?{'@context':'https://schema.org','@type':'VideoGame',name:game.name,url,description:game.description,gamePlatform:'Web browser',applicationCategory:'GameApplication',operatingSystem:'Any',offers:{'@type':'Offer',price:0,priceCurrency:'USD'}}:{'@context':'https://schema.org','@type':'WebSite',name:'Arcade',url,description:desc};
 const meta='<title>'+escape(title)+'</title><meta name="description" content="'+escape(desc)+'"><link rel="canonical" href="'+url+'"><meta property="og:type" content="website"><meta property="og:site_name" content="Arcade"><meta property="og:title" content="'+escape(title)+'"><meta property="og:description" content="'+escape(desc)+'"><meta property="og:url" content="'+url+'"><meta property="og:image" content="'+origin+'/icon-512.png"><meta name="twitter:card" content="summary"><script type="application/ld+json">'+JSON.stringify(schema).replaceAll('<','\\u003c')+'</script>';
 const related=game?catalog.filter(g=>g.category===game.category&&g.slug!==game.slug).slice(0,6):catalog;
 const body='<main class="shell"><h1>'+escape(game?'Play '+game.name:homeTitle)+'</h1><p>'+escape(game?game.description:homeDesc)+'</p><p>Free browser games. No account required. Install Arcade and play offline after the initial download.</p>'+(game?'<h2>How to play '+escape(game.name)+'</h2><p>'+escape(game.description)+'</p><nav><a href="/">All games</a><h2>Related games</h2>':'<nav><h2>Game library</h2>')+'<ul>'+links(related)+'</ul></nav><noscript>Enable JavaScript to play the games.</noscript></main>';
 return template.replace(/<title>[^<]*<\/title>/,'').replace(/<meta name="description"[^>]*>/,'').replace('</head>',meta+'</head>').replace('<div id="root"></div>','<div id="root">'+body+'</div>');
}
await writeFile(new URL('index.html',dist),render(null));
for(const game of catalog){const dir=new URL('games/'+game.slug+'/',dist);await mkdir(dir,{recursive:true});await writeFile(new URL('index.html',dir),render(game))}
const urls=['/',...catalog.map(gamePath)];
await writeFile(new URL('sitemap.xml',dist),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(path=>'<url><loc>'+origin+path+'</loc></url>').join('')+'</urlset>\n');
await writeFile(new URL('robots.txt',dist),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
console.log('SEO pages generated: '+urls.length+' canonical HTML routes, sitemap and robots.txt.');
