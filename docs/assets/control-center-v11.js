/* AincFh OS Control Center.
 * Real browser-origin status, and real settings actions.
 * No synthetic Wi-Fi, Bluetooth, battery, CPU or device controls.
 */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lang=()=>window.AincI18n?.locale||'en-US';
const strings={
'zh-CN':{title:'控制中心',subtitle:'快捷设置与系统状态',network:'网络',online:'已连接',offline:'离线',connection:'连接类型',notAvailable:'浏览器未提供',storage:'存储',storageSub:'此站点的存储空间',used:'已使用',quota:'配额',browser:'浏览器运行环境',running:'运行应用',theme:'外观',light:'浅色',dark:'深色',motion:'动态效果',enabled:'开启',disabled:'关闭',contrast:'高对比度',glass:'玻璃材质',quiet:'免打扰',power:'性能模式',auto:'自动',balanced:'平衡',smooth:'高性能',save:'节能',performance:'性能与资源',openTask:'任务管理器',openPrefs:'系统设置',offlineReady:'离线缓存已就绪',offlineUnavailable:'未启用离线缓存',cache:'离线缓存',refresh:'重新检查',appCount:'窗口',safe:'仅控制此 Web OS，不会改变真实设备的网络、电源或显示设置。',status:'连接状态由浏览器提供，并非实时网络测速。',install:'安装 AincFh OS',update:'检查系统更新',updateChecked:'已向浏览器请求检查更新',installAccepted:'已接受安装请求',installDismissed:'安装已取消',installUnavailable:'此浏览器无法显示安装提示'},
'zh-TW':{title:'控制中心',subtitle:'快速設定與系統狀態',network:'網路',online:'已連線',offline:'離線',connection:'連線類型',notAvailable:'瀏覽器未提供',storage:'儲存空間',storageSub:'此網站的儲存空間',used:'已使用',quota:'配額',browser:'瀏覽器執行環境',running:'執行中的應用程式',theme:'外觀',light:'淺色',dark:'深色',motion:'動態效果',enabled:'開啟',disabled:'關閉',contrast:'高對比度',glass:'玻璃材質',quiet:'勿擾模式',power:'效能模式',auto:'自動',balanced:'平衡',smooth:'高效能',save:'省電',performance:'效能與資源',openTask:'工作管理員',openPrefs:'系統設定',offlineReady:'離線快取已就緒',offlineUnavailable:'未啟用離線快取',cache:'離線快取',refresh:'重新檢查',appCount:'視窗',safe:'只控制此 Web OS，不會改變實際裝置的網路、電源或顯示設定。',status:'連線狀態由瀏覽器提供，並非即時網路測速。',install:'安裝 AincFh OS',update:'檢查系統更新',updateChecked:'已請求瀏覽器檢查更新',installAccepted:'已接受安裝要求',installDismissed:'已取消安裝',installUnavailable:'此瀏覽器無法顯示安裝提示'},
'en-US':{title:'Control Center',subtitle:'Quick settings & system status',network:'Network',online:'Connected',offline:'Offline',connection:'Connection type',notAvailable:'Unavailable in browser',storage:'Storage',storageSub:'Origin storage',used:'Used',quota:'Quota',browser:'Browser environment',running:'Running apps',theme:'Appearance',light:'Light',dark:'Dark',motion:'Motion effects',enabled:'On',disabled:'Off',contrast:'High contrast',glass:'Glass surfaces',quiet:'Do Not Disturb',power:'Performance mode',auto:'Automatic',balanced:'Balanced',smooth:'High performance',save:'Power saver',performance:'Performance & resources',openTask:'Task Manager',openPrefs:'Preferences',offlineReady:'Offline cache ready',offlineUnavailable:'Offline cache unavailable',cache:'Offline cache',refresh:'Recheck',appCount:'Windows',safe:'Only this Web OS is controlled; device networking, display and power settings are not changed.',status:'Connection status comes from the browser; it is not a network speed test.',install:'Install AincFh OS',update:'Check for updates',updateChecked:'Browser update check requested',installAccepted:'Installation accepted',installDismissed:'Installation dismissed',installUnavailable:'Install prompt unavailable in this browser'},
'ja-JP':{title:'コントロールセンター',subtitle:'クイック設定とシステム状態',network:'ネットワーク',online:'接続中',offline:'オフライン',connection:'接続タイプ',notAvailable:'ブラウザーでは取得できません',storage:'ストレージ',storageSub:'サイトの保存領域',used:'使用量',quota:'割り当て',browser:'ブラウザー環境',running:'起動中のアプリ',theme:'外観',light:'ライト',dark:'ダーク',motion:'アニメーション',enabled:'オン',disabled:'オフ',contrast:'ハイコントラスト',glass:'半透明パネル',quiet:'おやすみモード',power:'パフォーマンスモード',auto:'自動',balanced:'バランス',smooth:'高性能',save:'省電力',performance:'パフォーマンスとリソース',openTask:'タスクマネージャー',openPrefs:'設定',offlineReady:'オフラインキャッシュ準備完了',offlineUnavailable:'オフラインキャッシュ利用不可',cache:'オフラインキャッシュ',refresh:'再確認',appCount:'ウィンドウ',safe:'この Web OS のみを制御します。PC のネットワーク、画面、電源設定は変更しません。',status:'接続状態はブラウザー提供の情報であり、通信速度の測定結果ではありません。',install:'AincFh OS をインストール',update:'更新を確認',updateChecked:'ブラウザーに更新確認を要求しました',installAccepted:'インストールを承認しました',installDismissed:'インストールをキャンセルしました',installUnavailable:'このブラウザーではインストールできません'}
};
const L=k=>(strings[lang()]||strings['en-US'])[k]||k;
const icon=(id)=>'<svg aria-hidden="true"><use href="#i-'+id+'"></use></svg>';
const formatSize=v=>!Number.isFinite(v)?L('notAvailable'):(v>=1073741824?(v/1073741824).toFixed(2)+' GiB':v>=1048576?(v/1048576).toFixed(1)+' MiB':v>=1024?(v/1024).toFixed(0)+' KiB':Math.round(v)+' B');
let bridge=null,expanded=false,quota=null,pwa=null,networkOnline=navigator.onLine;
let refreshTimer=0,statusNotice='';
function getPrefs(){return bridge?.prefs?.()||{}}
function getConnection(){const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;return c?.effectiveType||L('notAvailable')}
async function gather(){
 const available=window.AincPWA?.status;
 try{quota=await navigator.storage?.estimate?.()}catch(e){quota=null}
 try{pwa=await available?.()}catch(e){pwa=null}
 if(expanded)render();
}
function checkOffline(){return Boolean(pwa?.cacheVersions?.length&&pwa?.controller)}
function getButtons(){
 const prefs=getPrefs();
 const toggle=(key,label,active,iconName)=>'<button data-cc-toggle="'+key+'" aria-pressed="'+Boolean(active)+'">'+icon(iconName)+'<span>'+esc(label)+'</span><i class="cc-switch"><b></b></i></button>';
 return '<div class="cc-toggle-grid">'+
 toggle('theme',L('theme')+' · '+L(prefs.theme==='light'?'light':'dark'),prefs.theme==='light','sun')+
 toggle('motion',L('motion'),prefs.motion,'moon')+
 toggle('contrast',L('contrast'),prefs.contrast==='high','monitor')+
 toggle('glass',L('glass'),prefs.glass,'grid')+
 toggle('quietMode',L('quiet'),prefs.quietMode,'bell')+'</div>';
}
function render(){
 const panel=$('#osControlCenter');if(!panel)return;
 const prefs=getPrefs();const windows=bridge?.windows?.()||[];
 panel.innerHTML='<header class="cc-header"><div><span class="cc-eyebrow">AINCFH OS / SYSTEM</span><h2>'+L('title')+'</h2><small>'+L('subtitle')+'</small></div><button class="cc-close" data-cc-close aria-label="Close">×</button></header>'+
 '<div class="cc-body"><div class="cc-row"><section class="cc-status-card">'+
 '<div class="cc-card-top">'+icon(networkOnline?'globe':'power')+'<span>'+L('network')+'</span><i class="cc-live '+(networkOnline?'':'offline')+'"></i></div>'+
 '<strong>'+L(networkOnline?'online':'offline')+'</strong><small>'+L('connection')+' · '+esc(networkOnline?getConnection():L('offline'))+'</small></section>'+
 '<section class="cc-status-card"><div class="cc-card-top">'+icon('folder')+'<span>'+L('storage')+'</span></div>'+
 '<strong>'+esc(quota?formatSize(quota.usage):L('notAvailable'))+'</strong><small>'+L('quota')+' · '+esc(quota?formatSize(quota.quota):L('notAvailable'))+'</small></section></div>'+
 '<div class="cc-statline"><span>'+icon('apps')+L('running')+'</span><strong>'+windows.length+' '+L('appCount')+'</strong></div>'+
 '<div class="cc-section-title">'+L('theme')+'</div>'+getButtons()+
 '<div class="cc-section-title">'+L('power')+'</div><div class="cc-profiles">'+['auto','balanced','smooth','save'].map(id=>
  '<button data-cc-profile="'+id+'" aria-pressed="'+(prefs.performanceMode===id)+'">'+esc(L(id))+'</button>').join('')+'</div>'+
 '<div class="cc-statline cc-cache"><span>'+icon('globe')+L('cache')+'</span><strong>'+L(checkOffline()?'offlineReady':'offlineUnavailable')+'</strong></div>'+
 '<div class="cc-actions"><button data-cc-action="taskmanager">'+icon('monitor')+L('openTask')+'</button><button data-cc-action="settings">'+icon('settings')+L('openPrefs')+'</button><button data-cc-update>'+L('update')+'</button>'+(pwa?.canInstall?'<button data-cc-install>'+L('install')+'</button>':'')+'</div>'+
 (statusNotice?'<p class="cc-status-notice" role="status">'+esc(L(statusNotice))+'</p>':'')+
 '<p class="cc-disclaimer">'+L('safe')+' '+L('status')+'</p></div>';
 $('#osControlCenterButton')?.setAttribute('aria-expanded','true');
}
function hide(){
 expanded=false;const panel=$('#osControlCenter');if(panel)panel.hidden=true;
 $('#osControlCenterButton')?.setAttribute('aria-expanded','false');
}
function show(){
 if(!bridge)return;
 expanded=true;const panel=$('#osControlCenter');if(!panel)return;
 panel.hidden=false;render();gather();
}
function toggle(){expanded?hide():show()}
function init(){
 if($('#osControlCenter'))return;
 const panel=document.createElement('section');panel.id='osControlCenter';panel.className='os-control-center';
 panel.setAttribute('role','dialog');panel.setAttribute('aria-label',L('title'));panel.setAttribute('aria-modal','false');panel.hidden=true;
 document.body.append(panel);
 const trigger=document.createElement('button');trigger.type='button';trigger.id='osControlCenterButton';
 trigger.className='icon-btn cc-trigger';trigger.dataset.ccTrigger='';
 trigger.setAttribute('aria-label',L('title'));trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');
 trigger.title=L('title');trigger.innerHTML=icon('sliders');
 const bar=$('.menubar-right');
 const power=$('#osTopPower');if(bar){if(power)bar.insertBefore(trigger,power);else bar.append(trigger)}
}
function updateFromBrowser(){networkOnline=navigator.onLine;if(expanded)render()}
document.addEventListener('click',e=>{
 const trigger=e.target.closest?.('[data-cc-trigger]');
 if(trigger){e.preventDefault();toggle();return}
 if(e.target.closest?.('[data-cc-close]')){hide();return}
 const b=e.target.closest?.('[data-cc-toggle],[data-cc-profile],[data-cc-action],[data-cc-refresh],[data-cc-update],[data-cc-install]');
 if(b){
  if(b.dataset.ccToggle){
   const key=b.dataset.ccToggle,p=getPrefs();
   bridge?.set(key,key==='theme'?(p.theme==='dark'?'light':'dark'):key==='contrast'?(p.contrast==='high'?'normal':'high'):!p[key]);
  }else if(b.dataset.ccProfile){bridge?.set('performanceMode',b.dataset.ccProfile)}
  else if(b.dataset.ccAction){bridge?.open(b.dataset.ccAction);hide();return}
  else if(b.hasAttribute('data-cc-refresh')){gather();return}
  else if(b.hasAttribute('data-cc-update')){window.AincPWA?.checkUpdate?.().then(()=>{statusNotice='updateChecked';gather()});return}
  else if(b.hasAttribute('data-cc-install')){window.AincPWA?.install?.().then(result=>{statusNotice=result?.outcome==='accepted'?'installAccepted':result?.outcome==='dismissed'?'installDismissed':'installUnavailable';gather()});return}
  if(expanded)render();
  return;
 }
 if(expanded&&!e.target.closest?.('#osControlCenter'))hide();
},false);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&expanded)hide();
});
window.addEventListener('online',updateFromBrowser,{passive:true});
window.addEventListener('offline',updateFromBrowser,{passive:true});
window.addEventListener('aincfh:pwa-installable',()=>{if(expanded)gather()});
window.addEventListener('aincfh:pwa-installed',()=>{if(expanded)gather()});
window.addEventListener('aincfh:languagechange',()=>{const t=$('#osControlCenterButton');if(t){t.title=L('title');t.setAttribute('aria-label',L('title'))}if(expanded)render()});
window.addEventListener('visibilitychange',()=>{if(document.hidden)hide();else if(expanded)gather()});
window.AincControlCenter={attach(b){bridge=b;init()},show,hide,toggle,get open(){return expanded},get status(){return{networkOnline,quota,pwa}}};
})();
