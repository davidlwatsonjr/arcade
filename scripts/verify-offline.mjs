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
