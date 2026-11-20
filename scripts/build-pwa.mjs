import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join,relative,sep} from 'node:path';
import {deflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const output = new URL('../dist/',import.meta.url).pathname;
function crc32(buffer){let c=-1;for(const b of buffer){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^-1)>>>0}
function chunk(type,data){const name=Buffer.from(type),size=Buffer.alloc(4),crc=Buffer.alloc(4);size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));return Buffer.concat([size,name,data,crc])}
function icon(size){const raw=Buffer.alloc(size*(size*4+1));function rounded(x,y,left,top,right,bottom,r){if(x<left||y<top||x>=right||y>=bottom)return false;const cx=Math.max(left+r,Math.min(x,right-r-1)),cy=Math.max(top+r,Math.min(y,bottom-r-1));return (x-cx)**2+(y-cy)**2<=r*r}
for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=x/size,v=y/size,p=y*(size*4+1)+1+x*4;let color=[19+Math.floor(v*10),15,45+Math.floor(u*17),255];
if(!rounded(x,y,0,0,size,size,size*.21))color=[0,0,0,0];
else if(rounded(x,y,size*.18,size*.16,size*.82,size*.85,size*.09))color=[103,56,179,255];
if(rounded(x,y,size*.21,size*.19,size*.79,size*.81,size*.08))color=[39,24,79,255];
if(rounded(x,y,size*.27,size*.27,size*.73,size*.59,size*.055))color=[8,17,46,255];
if(rounded(x,y,size*.31,size*.31,size*.69,size*.55,size*.03))color=[20,33,77,255];
if((u>.37&&u<.47&&v>.37&&v<.47)||(u>.335&&u<.505&&v>.4&&v<.44))color=[207,164,255,255];
if((u-.61)**2+(v-.395)**2<.025**2||(u-.66)**2+(v-.45)**2<.025**2)color=[255,142,199,255];
if(rounded(x,y,size*.24,size*.65,size*.76,size*.75,size*.025))color=[103,53,173,255];
if((u-.38)**2+(v-.69)**2<.035**2)color=[241,146,207,255];
if((u-.59)**2+(v-.69)**2<.021**2||(u-.65)**2+(v-.69)**2<.021**2)color=[198,183,255,255];
for(let c=0;c<4;c++)raw[p+c]=color[c]}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))])}
await Promise.all([[192,'icon-192.png'],[512,'icon-512.png'],[180,'apple-touch-icon.png']].map(async([size,file])=>writeFile(join(output,file),icon(size))));
const walk=async dir=>{const names=await readdir(dir,{withFileTypes:true});const result=[];for(const item of names){const full=join(dir,item.name);if(item.isDirectory())result.push(...await walk(full));else result.push(full)}return result};
const paths=(await walk(output)).filter(p=>!p.endsWith('/sw.js')&&!p.endsWith('/CNAME')).sort();
const precache=['/',...paths.map(p=>'/'+relative(output,p).split(sep).join('/'))];
const hash=createHash('sha256');for(const p of paths){hash.update(relative(output,p));hash.update(await readFile(p))}
const version=hash.digest('hex').slice(0,14);
const sw=`const CACHE='arcade-offline-${version}';
const ASSETS=${JSON.stringify(precache)};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('arcade-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
   event.respondWith(fetch(request).catch(()=>caches.open(CACHE).then(cache=>cache.match('/index.html'))));
   return;
 }
 event.respondWith(caches.open(CACHE).then(async cache=>{
   const cached=await cache.match(request);
   if(cached)return cached;
   return fetch(request);
 }));
});`;
await writeFile(join(output,'sw.js'),sw);
console.log('Offline precache: '+precache.length+' local URLs (cache '+version+')');