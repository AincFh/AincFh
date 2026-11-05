/* AincFh OS offline shell registration and status.
   Only same-origin static application assets are cached by sw.js.
 */
(function(){
'use strict';
const supported=('serviceWorker' in navigator)&&location.protocol!=='file:';
let registration=null,error=null,started=false,readyPromise=null;
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
async function status(){
 const cache=typeof caches!=='undefined'?await caches.keys().catch(()=>[]):[];
 return{
  supported,registered:Boolean(registration),controller:Boolean(navigator.serviceWorker?.controller),
  online:navigator.onLine,cacheVersions:cache.filter(k=>k.startsWith('aincfh-os-shell-')),
  error
 };
}
window.AincPWA={init,status,whenReady:init,get registered(){return Boolean(registration)},get supported(){return supported}};
if(document.readyState==='complete')init();
else window.addEventListener('load',init,{once:true});
report();
})();
