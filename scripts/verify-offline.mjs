import {readdir,readFile} from 'node:fs/promises';
import {join,relative,sep} from 'node:path';
const dist=new URL('../dist/',import.meta.url).pathname;
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});const files=[];for(const e of entries){const p=join(dir,e.name);files.push(...(e.isDirectory()?await walk(p):[p]))}return files}
const files=await walk(dist);
const sw=(await readFile(join(dist,'sw.js'))).toString();
const manifest=JSON.parse(await readFile(join(dist,'manifest.json'),'utf8'));
const must=files.filter(f=>!f.endsWith('/sw.js')&&!f.endsWith('/CNAME')).map(f=>'/'+relative(dist,f).split(sep).join('/'));
for(const path of ['/',...must])if(!sw.includes(JSON.stringify(path)))throw Error('Missing from offline precache: '+path);
for(const icon of ['/icon-192.png','/icon-512.png','/apple-touch-icon.png'])if(!must.includes(icon))throw Error('Missing generated icon '+icon);
if(!manifest.icons.some(i=>i.sizes==='192x192')||!manifest.icons.some(i=>i.sizes==='512x512'))throw Error('PWA installation icons missing');
const source=(await readFile(join(dist,'index.html'),'utf8'));if(!source.includes('manifest.json'))throw Error('Manifest link missing');
console.log('Offline verification passed: '+must.length+' built resources, complete precache, and installable icons.');

const catalog=JSON.parse(await readFile(new URL('../src/game-catalog.json',import.meta.url),'utf8'));
const sitemap=await readFile(join(dist,'sitemap.xml'),'utf8');
const home=await readFile(join(dist,'index.html'),'utf8');
for(const game of catalog){
 const url='/games/'+game.slug+'/';
 const html=await readFile(join(dist,url.slice(1),'index.html'),'utf8');
 if(!html.includes('rel="canonical" href="https://arcade.davidlwatsonjr.com'+url+'"')||!html.includes('<h1>Play '+game.name+'</h1>'))throw Error('Missing canonical or heading: '+url);
 if(!sitemap.includes('<loc>https://arcade.davidlwatsonjr.com'+url+'</loc>')||!home.includes('href="'+url+'"'))throw Error('Missing discovery link: '+url);
 if(!sw.includes(JSON.stringify(url+'index.html')))throw Error('Missing cached route '+url);
}
console.log('SEO/deep link verification passed: '+catalog.length+' games.');
