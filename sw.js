const V='quran-v2',SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable.png'];
const API=['mp3quran.net/api','api.alquran.cloud','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||r.headers.has('range')||r.destination==='audio')return; // audio streams straight from the network
  const isApi=API.some(h=>(u.host+u.pathname).startsWith(h));
  if(u.origin===location.origin){
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(c=>c||fetch(r)));
  }else if(isApi){
    e.respondWith(caches.open(V).then(async c=>{
      const hit=await c.match(r);
      const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>hit);
      return hit||net;
    }));
  }
});
