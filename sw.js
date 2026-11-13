const V='quran-v4',AUD='quran-audio',SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable.png'];
const API=['mp3quran.net/api','api.alquran.cloud','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==AUD).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// app files: network first (so updates show up immediately), cache as offline fallback
async function fresh(r){
  const cache=await caches.open(V);
  const net=fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok)cache.put(r,res.clone());return res});
  try{return await Promise.race([net,new Promise((_,no)=>setTimeout(no,4000))])}
  catch(e){net.catch(()=>{});return (await cache.match(r,{ignoreSearch:true}))||(await cache.match('index.html'))||Response.error()}
}
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||r.headers.has('range')||r.destination==='audio')return; // audio streams straight from the network
  const isApi=API.some(h=>(u.host+u.pathname).startsWith(h));
  if(u.origin===location.origin){
    e.respondWith(fresh(r));
  }else if(isApi){
    e.respondWith(caches.open(V).then(async c=>{
      const hit=await c.match(r);
      const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>hit);
      return hit||net;
    }));
  }
});
