/* AincFh OS offline shell v11.0.
   Cache only versioned same-origin OS code/assets. User documents are in IndexedDB
   and are never copied into this cache, nor sent to the server.
 */
'use strict';
const VERSION='aincfh-os-shell-11.2.0',PREFIX='aincfh-os-shell-';
const CORE=[
 './',
 './index.html',
 './manifest.webmanifest?v=11.2',
 './assets/icon-192.png',
 './assets/icon-512.png',
 './assets/favicon.svg',
 './assets/styles.css?v=motion-5',
 './assets/os-desktop-v5.css?v=5.0.6',
 './assets/workspace.css?v=9.3',
 './assets/system-v7.css?v=8.1',
 './assets/apps-v8.css?v=8.1',
 './assets/paint-v9.css?v=9.3',
 './assets/system-shell-v10.css?v=10.0',
 './assets/ui-controls-v10.css?v=10.0',
 './assets/system-monitor-v11.css?v=11.0',
 './assets/system-performance-v11.css?v=11.0',
 './assets/control-center-v11.css?v=11.1',
 './assets/i18n-catalog-v10.js?v=10.0',
 './assets/i18n-runtime-v10.js?v=11.0',
 './assets/storage-v8.js?v=8.1',
 './assets/workspace.js?v=9.3',
 './assets/settings-panel.js?v=11.0',
 './assets/apps-v8.js?v=8.1',
 './assets/paint-v9.js?v=9.3',
 './assets/clipboard-guard.js?v=7.0',
 './assets/system-shell-v10.js?v=10.0',
 './assets/system-monitor-v11.js?v=11.0',
 './assets/control-center-v11.js?v=11.1',
 './assets/pwa-v11.js?v=11.0',
 './assets/ui-controls-v10.js?v=10.0',
 './assets/app.js?v=11.2'
];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(VERSION);
  await cache.addAll(CORE);
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(n=>n.startsWith(PREFIX)&&n!==VERSION).map(n=>caches.delete(n)));
  await self.clients.claim();
 })());
});
function eligible(request){
 if(request.method!=='GET')return false;
 const url=new URL(request.url),scope=new URL(self.registration.scope);
 return url.origin===scope.origin&&url.pathname.startsWith(scope.pathname);
}
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(!eligible(request))return;
 const path=new URL(request.url).pathname;
 if(path.endsWith('/sw.js'))return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(VERSION);
   try{
    const network=await fetch(request);
    if(network.ok)await cache.put('./index.html',network.clone());
    return network;
   }catch(error){
    return await cache.match('./index.html')||await cache.match('./')||
      new Response('<!doctype html><html lang="en"><title>AincFh OS · Offline</title><body style="background:#11121b;color:#fff;font:16px sans-serif;padding:3rem">This desktop is not cached yet. Reconnect and open AincFh OS once.</body></html>',{headers:{'Content-Type':'text/html;charset=utf-8'}});
   }
  })());
  return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  const cached=await cache.match(request);
  if(cached)return cached;
  try{
   const response=await fetch(request);
   if(response.ok&&response.type!=='opaque')await cache.put(request,response.clone()).catch(()=>{});
   return response;
  }catch(error){return new Response('',{status:503,statusText:'Offline asset unavailable'})}
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
 if(event.data?.type==='GET_CACHE_STATUS'){
  caches.open(VERSION).then(async c=>{
   const keys=await c.keys();
   event.source?.postMessage({type:'CACHE_STATUS',version:VERSION,entries:keys.length});
  });
 }
});
