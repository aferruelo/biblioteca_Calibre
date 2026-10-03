const SHELL='cv-shell-v3', RT='cv-runtime-v3';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const EXTERNAL=['cdnjs.cloudflare.com','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(SHELL).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(ks=>Promise.all(ks.filter(k=>k!==SHELL&&k!==RT).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(u.origin===location.origin){
    if(u.searchParams.has('code')||u.searchParams.has('error'))return; // retorno del inicio de sesión
    e.respondWith(
      fetch(req).then(r=>{
        if(r.ok){const cp=r.clone();caches.open(SHELL).then(c=>c.put(req,cp));}
        return r;
      }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')))
    );
    return;
  }
  if(EXTERNAL.includes(u.hostname)){
    e.respondWith(caches.open(RT).then(async c=>{
      const hit=await c.match(req);
      const net=fetch(req).then(r=>{if(r.ok)c.put(req,r.clone());return r;}).catch(()=>hit);
      return hit||net;
    }));
  }
});
