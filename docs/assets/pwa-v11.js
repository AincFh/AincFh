/* AincFh OS offline shell registration and status.
   Only same-origin static application assets are cached by sw.js.
 */
(function(){
'use strict';
const supported=('serviceWorker' in navigator)&&location.protocol!=='file:';
let registration=null,error=null,started=false,readyPromise=null,installEvent=null,installed=matchMedia('(display-mode: standalone)').matches;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;window.dispatchEvent(new Event('aincfh:pwa-installable'))});
window.addEventListener('appinstalled',()=>{installed=true;installEvent=null;window.dispatchEvent(new Event('aincfh:pwa-installed'))});
const report=()=>{
 const root=document.documentElement;root.dataset.network=navigator.onLine?'online':'offline';
 const indicator=document.getElementById('osNetworkStatus');
 if(indicator){
  const locale=window.AincI18n?.locale||'en-US',offline={
   'zh-CN':'离线模式','zh-TW':'離線模式','en-US':'Offline mode','ja-JP':'オフラインモード'
  };
  indicator.hidden=navigator.onLine;
  indicator.textContent=offline[locale]||offline['en-US'];
 }
};
window.addEventListener('online',report,{passive:true});
window.addEventListener('offline',report,{passive:true});
window.addEventListener('aincfh:languagechange',report);
function init(){
 if(!supported)return Promise.resolve(null);
 if(readyPromise)return readyPromise;
 started=true;
 readyPromise=navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(async r=>{
  registration=r;
  try{await navigator.serviceWorker.ready}catch(e){}
  return r;
 }).catch(e=>{error=String(e);return null});
 return readyPromise;
}
async function install(){
 if(installed)return {outcome:'already-installed'};
 if(!installEvent)return {outcome:'not-supported'};
 const event=installEvent;installEvent=null;
 try{
  await event.prompt();const choice=await event.userChoice;
  if(choice?.outcome!=='accepted')return {outcome:'dismissed'};
  return {outcome:'accepted'};
 }catch(e){error=String(e);return {outcome:'error',error}}
}
async function checkUpdate(){
 const r=registration||await init();if(!r)return {updated:false,error:error||'Service worker unavailable'};
 try{await r.update();return {updated:true,waiting:Boolean(r.waiting)}}catch(e){error=String(e);return {updated:false,error}}
}
async function status(){
 const cache=typeof caches!=='undefined'?await caches.keys().catch(()=>[]):[];
 return{
  supported,registered:Boolean(registration),controller:Boolean(navigator.serviceWorker?.controller),
  installed,canInstall:Boolean(installEvent),waiting:Boolean(registration?.waiting),
  online:navigator.onLine,cacheVersions:cache.filter(k=>k.startsWith('aincfh-os-shell-')),
  error
 };
}
window.AincPWA={init,status,install,checkUpdate,whenReady:init,get registered(){return Boolean(registration)},get supported(){return supported},get canInstall(){return Boolean(installEvent)}};
if(document.readyState==='complete')init();
else window.addEventListener('load',init,{once:true});
report();
})();
