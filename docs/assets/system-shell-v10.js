/* AincFh OS Shell v10 — real browser desktop shell.
 * Start launcher, Dock manager, window controls and safe simulated power lifecycle.
 * Nothing in this module shuts down, locks or suspends the HOST operating system.
 */
(function(){
'use strict';
const POWER_KEY='aincfh_shell_power_v10',PIN_KEY='aincfh_dock_pins_v10',ORDER_KEY='aincfh_dock_order_v10',RECENT_KEY='aincfh_recent_apps_v10';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const initialPins=['apps','projects','files','notes','tasks','calculator','clock','paint','terminal','settings','activity','about','contact','stack'];
let bridge=null,open=false,powerState='on',confirming=null,contextApp='',hoverApp=null,hoverTimer=0,hideTimer=0,lastFocus=null;
let category='all',searchValue='',pinSet=new Set(initialPins),order=[],recent=[];
const html=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(k,f){try{const x=JSON.parse(localStorage.getItem(k));return x??f}catch{return f}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
pinSet=new Set(read(PIN_KEY,initialPins));order=read(ORDER_KEY,[]);recent=read(RECENT_KEY,[]);
if(!Array.isArray(order))order=[];if(!Array.isArray(recent))recent=[];
const dictionary={
'en-US':{start:'Start',search:'Search applications and commands…',pinned:'Pinned',all:'All apps',running:'Running',recent:'Recently opened',empty:'No matching applications',quick:'Quick access',system:'System',files:'Files',settings:'Settings',activity:'Activity Center',power:'Power',sleep:'Sleep',lock:'Lock screen',restart:'Restart',shutdown:'Shut down',cancel:'Cancel',confirm:'Confirm',wake:'Wake up',unlock:'Unlock desktop',powerOn:'Turn on AincFh OS',off:'AincFh OS is shut down',offDetail:'This browser desktop has been shut down. Your computer remains on.',sleepDetail:'The browser desktop is sleeping. Click or press a key to wake.',lockDetail:'This is a visual lock screen, not password protection.',restartTitle:'Restart AincFh OS?',restartDetail:'Reload the web desktop. Saved browser data is retained.',shutdownTitle:'Shut down AincFh OS?',shutdownDetail:'Close the virtual desktop session. This never shuts down your device.',minimize:'Minimize',close:'Close window',focus:'Bring to front',open:'Open',pin:'Keep in Dock',unpin:'Remove from Dock',preview:'Window controls',notRunning:'Not running',status:'Browser desktop · local only',showDesktop:'Show desktop',tile:'Tile windows',apps:'Applications',allApps:'All applications',recently:'Recent',browse:'Browse',launch:'Launch',active:'Active',window:'Window',desktop:'Desktop',noRecent:'No recent apps',browserOnly:'Browser session only',confirmRequired:'Choose an action to continue',powerMenu:'Power options'},
'zh-CN':{start:'开始',search:'搜索应用、文件和命令…',pinned:'已固定',all:'全部应用',running:'正在运行',recent:'最近打开',empty:'没有匹配的应用',quick:'快捷入口',system:'系统',files:'文件',settings:'系统设置',activity:'活动中心',power:'电源',sleep:'睡眠',lock:'锁定桌面',restart:'重新启动',shutdown:'关机',cancel:'取消',confirm:'确认',wake:'唤醒',unlock:'解锁桌面',powerOn:'启动 AincFh OS',off:'AincFh OS 已关机',offDetail:'当前浏览器桌面已关闭，真实电脑仍保持运行。',sleepDetail:'浏览器桌面处于模拟睡眠状态。点击或按键唤醒。',lockDetail:'这是视觉锁屏，不是密码验证或数据加密。',restartTitle:'重新启动 AincFh OS？',restartDetail:'重新加载浏览器桌面，已保存的数据会保留。',shutdownTitle:'关闭 AincFh OS？',shutdownDetail:'结束当前模拟桌面会话，不会关闭真实设备。',minimize:'最小化',close:'关闭窗口',focus:'切换到此窗口',open:'打开',pin:'固定在 Dock',unpin:'从 Dock 移除',preview:'窗口操作',notRunning:'未运行',status:'浏览器桌面 · 仅本地',showDesktop:'显示桌面',tile:'平铺窗口',apps:'应用程序',allApps:'全部应用程序',recently:'最近使用',browse:'浏览',launch:'启动',active:'活动',window:'窗口',desktop:'桌面',noRecent:'暂无最近使用的应用',browserOnly:'仅浏览器桌面',confirmRequired:'请选择操作以继续',powerMenu:'电源选项'},
'zh-TW':{start:'開始',search:'搜尋應用程式、檔案與命令…',pinned:'已釘選',all:'所有應用程式',running:'執行中',recent:'最近開啟',empty:'找不到符合的應用程式',quick:'快速存取',system:'系統',files:'檔案',settings:'系統設定',activity:'活動中心',power:'電源',sleep:'睡眠',lock:'鎖定桌面',restart:'重新啟動',shutdown:'關機',cancel:'取消',confirm:'確認',wake:'喚醒',unlock:'解除鎖定',powerOn:'啟動 AincFh OS',off:'AincFh OS 已關機',offDetail:'目前瀏覽器桌面已關閉，實際電腦仍在運作。',sleepDetail:'瀏覽器桌面進入模擬睡眠。點擊或按鍵喚醒。',lockDetail:'這是視覺鎖定畫面，並非密碼驗證或加密。',restartTitle:'重新啟動 AincFh OS？',restartDetail:'重新載入網頁桌面；已儲存資料仍會保留。',shutdownTitle:'關閉 AincFh OS？',shutdownDetail:'結束模擬桌面工作階段，不會關閉實際裝置。',minimize:'最小化',close:'關閉視窗',focus:'切換至此視窗',open:'開啟',pin:'釘選到 Dock',unpin:'從 Dock 移除',preview:'視窗操作',notRunning:'未執行',status:'瀏覽器桌面 · 僅本機',showDesktop:'顯示桌面',tile:'並排視窗',apps:'應用程式',allApps:'所有應用程式',recently:'最近使用',browse:'瀏覽',launch:'啟動',active:'使用中',window:'視窗',desktop:'桌面',noRecent:'尚無最近使用的應用程式',browserOnly:'僅限瀏覽器桌面',confirmRequired:'選擇操作以繼續',powerMenu:'電源選項'},
'ja-JP':{start:'スタート',search:'アプリ、ファイル、コマンドを検索…',pinned:'ピン留め済み',all:'すべてのアプリ',running:'実行中',recent:'最近使ったアプリ',empty:'一致するアプリがありません',quick:'クイックアクセス',system:'システム',files:'ファイル',settings:'設定',activity:'アクティビティ',power:'電源',sleep:'スリープ',lock:'画面をロック',restart:'再起動',shutdown:'シャットダウン',cancel:'キャンセル',confirm:'確認',wake:'スリープ解除',unlock:'デスクトップに戻る',powerOn:'AincFh OS を起動',off:'AincFh OS は終了しました',offDetail:'このブラウザーデスクトップを終了しました。お使いの PC は動作中です。',sleepDetail:'ブラウザーデスクトップをスリープ表示にしています。クリックかキーで復帰します。',lockDetail:'画面上のロックであり、認証や暗号化は行いません。',restartTitle:'AincFh OS を再起動しますか？',restartDetail:'Web デスクトップを再読み込みします。保存済みデータは残ります。',shutdownTitle:'AincFh OS を終了しますか？',shutdownDetail:'ブラウザー内のセッションを閉じます。PC の電源は切れません。',minimize:'最小化',close:'ウィンドウを閉じる',focus:'手前に表示',open:'開く',pin:'Dock に追加',unpin:'Dock から削除',preview:'ウィンドウ操作',notRunning:'実行していません',status:'ブラウザー内 · ローカルのみ',showDesktop:'デスクトップを表示',tile:'ウィンドウを並べる',apps:'アプリ',allApps:'すべてのアプリ',recently:'最近使用',browse:'参照',launch:'起動',active:'アクティブ',window:'ウィンドウ',desktop:'デスクトップ',noRecent:'最近使ったアプリはありません',browserOnly:'ブラウザーのみ',confirmRequired:'操作を選んでください',powerMenu:'電源オプション'}
};
function L(key){const code=window.AincI18n?.locale||'en-US';return(dictionary[code]||dictionary['en-US'])[key]||key}
function icon(id){const safe=/^[\w-]+$/.test(id)?id:'apps';return '<svg aria-hidden="true"><use href="#i-'+safe+'"></use></svg>'}
function appName(x){return window.AincI18n?.t(x.name)||x.name}
function apps(){return bridge?.apps?.()||[]}
function running(){return bridge?.windows?.()||[]}
function info(id){return apps().find(a=>a.id===id)}
function isRunning(id){return running().some(w=>w.id===id)}
function bootDOM(){
 if($('#osStartPanel'))return;
 const startButton=document.createElement('button');startButton.id='osStartButton';startButton.className='dock-app os-start-button';startButton.type='button';startButton.dataset.shellAction='toggle-start';startButton.setAttribute('aria-haspopup','dialog');startButton.setAttribute('aria-expanded','false');startButton.setAttribute('aria-label',L('start'));startButton.innerHTML=icon('hex')+'<span class="os-start-indicator"></span>';
 const dock=$('.dock');dock?.insertBefore(startButton,dock.firstElementChild);
 const top=document.createElement('button');top.id='osTopStart';top.className='menubar-link os-top-start';top.type='button';top.dataset.shellAction='toggle-start';top.textContent=L('start');$('.menubar-left')?.insertBefore(top,$('.menubar-separator'));
 const power=document.createElement('button');power.id='osTopPower';power.className='icon-btn os-top-power';power.type='button';power.dataset.shellAction='power-menu';power.setAttribute('aria-label',L('power'));power.title=L('power');power.innerHTML=icon('power');$('.menubar-right')?.append(power);
 const menu=document.createElement('section');menu.id='osStartPanel';menu.className='os-start-panel';menu.hidden=true;menu.setAttribute('role','dialog');menu.setAttribute('aria-modal','false');menu.setAttribute('aria-label',L('start'));document.body.append(menu);
 const peek=document.createElement('section');peek.id='osDockPeek';peek.className='os-dock-peek';peek.hidden=true;peek.setAttribute('role','group');document.body.append(peek);
 const pop=document.createElement('section');pop.id='osDockContext';pop.className='os-dock-context';pop.hidden=true;pop.setAttribute('role','menu');document.body.append(pop);
 const powerPanel=document.createElement('section');powerPanel.id='osPowerPopup';powerPanel.className='os-power-popup';powerPanel.hidden=true;powerPanel.setAttribute('role','menu');document.body.append(powerPanel);
 const confirm=document.createElement('section');confirm.id='osPowerConfirm';confirm.className='os-power-confirm';confirm.hidden=true;confirm.setAttribute('role','dialog');confirm.setAttribute('aria-modal','true');document.body.append(confirm);
 const overlay=document.createElement('section');overlay.id='osPowerState';overlay.className='os-power-state';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');document.body.append(overlay);
 const hotspot=document.createElement('div');hotspot.id='osDockHotspot';hotspot.className='os-dock-hotspot';hotspot.setAttribute('aria-hidden','true');document.body.append(hotspot);
 for(const b of $$('[data-dock]')){b.setAttribute('draggable','true');b.dataset.shellApp=b.dataset.dock}
 if(Array.isArray(order)&&order.length){
  const before=$('.dock-divider',dock);
  for(const id of order){const b=$('[data-dock="'+id+'"]',dock);if(b&&before)before.before(b)}
 }
 renderStart();
 applyDock();
 try{if(sessionStorage.getItem(POWER_KEY)==='off')enterPower('off',false)}catch(e){}
}
function renderStart(){
 const panel=$('#osStartPanel');if(!panel)return;
 const all=apps(),runningIds=new Set(running().map(w=>w.id));
 let display=all.filter(a=>category==='all'||category==='pinned'&&pinSet.has(a.id)||category==='recent'&&recent.includes(a.id)||category==='running'&&runningIds.has(a.id));
 if(searchValue){const q=searchValue.toLocaleLowerCase();display=all.filter(a=>(a.id+' '+a.name+' '+a.label+' '+appName(a)).toLocaleLowerCase().includes(q))}
 if(category==='recent'&&!searchValue)display.sort((a,b)=>recent.indexOf(a.id)-recent.indexOf(b.id));
 if(category==='pinned'&&!searchValue)display.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
 const header='<div class="os-start-header"><div class="os-start-brand">'+icon('hex')+'<span>AincFh <b>OS</b></span></div><span class="os-start-status"><i></i>'+html(L('status'))+'</span></div>';
 const field='<div class="os-start-search">'+icon('search')+'<input id="osStartSearch" type="search" placeholder="'+html(L('search'))+'" value="'+html(searchValue)+'" autocomplete="off" spellcheck="false" aria-label="'+html(L('search'))+'"/><kbd>ESC</kbd></div>';
 const navigation='<nav class="os-start-categories">'+[['all','all'],['pinned','pinned'],['running','running'],['recent','recent']].map(([key,label])=>'<button data-shell-category="'+key+'" aria-pressed="'+(category===key)+'">'+html(L(label))+'</button>').join('')+'</nav>';
 const cards=display.length?display.map(a=>{
  const on=runningIds.has(a.id);
  return '<button type="button" class="os-start-app" data-shell-app="'+html(a.id)+'">'+
    '<span class="os-start-appicon">'+icon(a.icon)+'</span><span class="os-start-apptext"><strong>'+html(appName(a))+'</strong><small>'+html(window.AincI18n?.t(a.label)||a.label)+'</small></span>'+
    (on?'<i class="os-running-pip" aria-label="'+html(L('running'))+'"></i>':'')+'</button>';
 }).join(''):'<div class="os-start-empty">'+html(L(category==='recent'?'noRecent':'empty'))+'</div>';
 const quick='<div class="os-start-quick"><div class="os-shell-section">'+html(L('quick'))+'</div>'+
   [['files','files'],['settings','settings'],['activity','activity']].map(([id,label])=>'<button data-shell-app="'+id+'">'+icon(info(id)?.icon||'folder')+'<span>'+html(L(label))+'</span></button>').join('')+'</div>';
 panel.innerHTML=header+field+navigation+'<div class="os-start-content"><div class="os-start-section">'+html(L('allApps'))+' <span>'+display.length+'</span></div><div class="os-start-grid">'+cards+'</div></div>'+quick+
 '<footer class="os-start-footer"><button data-shell-action="show-desktop">'+icon('grid')+html(L('desktop'))+'</button><button class="os-start-power" data-shell-action="power-menu">'+icon('power')+html(L('power'))+'</button></footer>';
}
function showStart(value){
 const panel=$('#osStartPanel');if(!panel||powerState!=='on')return;
 open=value;panel.hidden=!open;$('#osStartButton')?.setAttribute('aria-expanded',String(open));$('#osStartButton')?.classList.toggle('is-open',open);
 if(open){closeOther();renderStart();lastFocus=document.activeElement;setTimeout(()=>$('#osStartSearch')?.focus(),20)}
 else{searchValue='';lastFocus?.focus?.()}
}
function closeOther(){
 $('#osDockPeek').hidden=true;$('#osDockContext').hidden=true;$('#osPowerPopup').hidden=true;
 $('#systemMenu')&&( $('#systemMenu').hidden=true );
}
function launch(id){
 if(!info(id)||powerState!=='on')return;
 showStart(false);closeOther();
 recent=[id,...recent.filter(x=>x!==id)].slice(0,16);save(RECENT_KEY,recent);
 bridge?.open(id);syncDock();
}
function powerPopup(){
 if(powerState!=='on')return;
 const popup=$('#osPowerPopup');const wasOpen=!popup.hidden;showStart(false);closeOther();if(wasOpen)return;
 popup.innerHTML='<div class="os-popup-title">'+icon('power')+html(L('powerMenu'))+'</div>'+
  [['sleep','moon'],['lock','lock'],['restart','rotate'],['shutdown','power']].map(([id,svg])=>'<button data-shell-power="'+id+'">'+icon(svg)+'<span>'+html(L(id))+'</span></button>').join('');
 popup.hidden=false;
}
function powerConfirm(kind){
 if(!['restart','shutdown'].includes(kind))return;
 confirming=kind;const root=$('#osPowerConfirm');if(!root)return;
 closeOther();showStart(false);
 const title=L(kind+'Title'),desc=L(kind+'Detail');
 root.innerHTML='<div class="os-confirm-card"><div class="os-confirm-mark">'+icon(kind==='restart'?'rotate':'power')+'</div><div class="os-confirm-kicker">AINCFH OS / '+html(L('browserOnly'))+'</div><h2>'+html(title)+'</h2><p>'+html(desc)+'</p>'+
 '<div class="os-confirm-buttons"><button data-shell-action="cancel-power">'+html(L('cancel'))+'</button><button class="os-primary" data-shell-action="confirm-power">'+html(L(kind))+'</button></div></div>';
 root.hidden=false;$('#osPowerOverlay')?.focus?.();
}
function powerTime(){
 const date=new Date(),locale=window.AincI18n?.locale||'en-US';
 try{return{time:new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit'}).format(date),date:new Intl.DateTimeFormat(locale,{weekday:'long',month:'long',day:'numeric'}).format(date)}}catch{return{time:date.toLocaleTimeString(),date:date.toDateString()}}
}
function enterPower(kind,persist=true){
 if(!['lock','sleep','off'].includes(kind))return;
 powerState=kind;showStart(false);closeOther();$('#osPowerConfirm').hidden=true;
 if(kind==='off'&&persist){try{sessionStorage.setItem(POWER_KEY,'off')}catch(e){}}
 document.documentElement.dataset.power=kind;const root=$('#osPowerState');if(!root)return;
 const clock=powerTime();
 root.innerHTML='<div class="os-power-scene" data-power-scene="'+kind+'"><div class="os-power-top"><span class="os-power-hex">'+icon('hex')+'</span><strong>AincFh <b>OS</b></strong></div>'+
   '<div class="os-power-main">'+(kind==='off'?'<div class="os-power-symbol">'+icon('power')+'</div><h1>'+html(L('off'))+'</h1>':
      '<div class="os-power-clock" id="osLockClock">'+html(clock.time)+'</div><div class="os-power-day" id="osLockDate">'+html(clock.date)+'</div><h2>'+html(L(kind==='sleep'?'sleep':'lock'))+'</h2>')+
   '<p>'+html(L(kind==='off'?'offDetail':kind==='sleep'?'sleepDetail':'lockDetail'))+'</p>'+
   '<button class="os-primary" data-shell-action="'+(kind==='off'?'turn-on':kind==='sleep'?'wake':'unlock')+'">'+icon(kind==='off'?'power':kind==='sleep'?'sun':'lock')+'<span>'+html(L(kind==='off'?'powerOn':kind==='sleep'?'wake':'unlock'))+'</span></button></div>'+
   '<div class="os-power-bottom">'+html(L('browserOnly'))+'</div></div>';
 root.hidden=false;
}
function exitPower(){
 if(powerState==='off')try{sessionStorage.removeItem(POWER_KEY)}catch(e){}
 powerState='on';document.documentElement.dataset.power='on';$('#osPowerState').hidden=true;
 if(bridge?.prefs()?.restoreSession)bridge?.sync?.();
}
function confirmPower(){
 const kind=confirming;confirming=null;$('#osPowerConfirm').hidden=true;
 if(kind==='shutdown')enterPower('off',true);
 else if(kind==='restart'){
  try{sessionStorage.removeItem(POWER_KEY);sessionStorage.setItem('aincfh_shell_last_boot','restart')}catch(e){}
  document.documentElement.dataset.power='restarting';setTimeout(()=>window.location.reload(),350);
 }
}
function dockButtons(){return $$('[data-dock]',$('.dock')||document)}
function applyDock(){
 const prefs=bridge?.prefs?.()||{};
 const root=document.documentElement;
 root.dataset.dockPosition=prefs.dockPosition||'bottom';root.dataset.dockMode=prefs.dockMode||'floating';
 root.dataset.dockAutoHide=prefs.dockAutoHide?'on':'off';
 root.dataset.dockMagnify=prefs.dockMagnify?'on':'off';
 root.dataset.dockScale=prefs.dockScale||'normal';
 root.dataset.startLayout=prefs.startLayout||'grid';
 const dock=$('.dock');if(!dock)return;
 for(const b of dockButtons()){const id=b.dataset.dock;b.classList.toggle('os-dock-unpinned',!pinSet.has(id)&&!isRunning(id))}
}
function syncDock(){
 applyDock();
 if(!bridge)return;
 for(const b of dockButtons()){
  const id=b.dataset.dock,r=running().find(w=>w.id===id);
  b.classList.toggle('os-dock-running',!!r);
  b.setAttribute('title',appName(info(id)||{name:id}));
 }
 if(!$('#osStartPanel').hidden&&!searchValue)renderStart();
}
function recordOpen(id){if(!id)return;recent=[id,...recent.filter(x=>x!==id)].slice(0,16);save(RECENT_KEY,recent);syncDock()}
function togglePin(id){
 if(!info(id))return;
 if(pinSet.has(id))pinSet.delete(id);else pinSet.add(id);
 save(PIN_KEY,[...pinSet]);syncDock();
 $('#osDockContext').hidden=true;
}
function dockPeek(id,button){
 if(!info(id)||powerState!=='on'||!button)return;
 const peek=$('#osDockPeek'),app=info(id),r=running().find(w=>w.id===id);
 const name=appName(app);
 peek.innerHTML='<div class="os-peek-header"><span class="os-peek-icon">'+icon(app.icon)+'</span><div><strong>'+html(name)+'</strong><small>'+html(r?(r.minimized?L('minimize'):L('active')):L('notRunning'))+'</small></div></div>'+
  '<div class="os-peek-screen">'+icon(app.icon)+'<span>AincFh OS / '+html(name)+'</span></div>'+
  '<div class="os-peek-actions">'+(r?'<button data-shell-window="focus" data-shell-id="'+id+'">'+html(L('focus'))+'</button><button data-shell-window="minimize" data-shell-id="'+id+'">'+html(L('minimize'))+'</button><button data-shell-window="close" data-shell-id="'+id+'">'+html(L('close'))+'</button>':
   '<button class="primary" data-shell-app="'+id+'">'+html(L('open'))+'</button>')+'</div>';
 const pos=button.getBoundingClientRect();peek.hidden=false;
 const side=document.documentElement.dataset.dockPosition;
 const w=peek.offsetWidth,h=peek.offsetHeight;
 let x,y;
 if(side==='left'){x=pos.right+12;y=pos.top+pos.height/2-h/2}
 else if(side==='right'){x=pos.left-w-12;y=pos.top+pos.height/2-h/2}
 else{x=pos.left+pos.width/2-w/2;y=pos.top-h-13}
 peek.style.left=Math.max(8,Math.min(innerWidth-w-8,x))+'px';
 peek.style.top=Math.max(65,Math.min(innerHeight-h-10,y))+'px';
 hoverApp=id;
}
function contextMenu(id,x,y){
 const root=$('#osDockContext'),app=info(id);if(!root||!app)return;
 contextApp=id;closeOther();showStart(false);
 const isOn=isRunning(id);
 root.innerHTML='<div class="os-context-title">'+icon(app.icon)+'<span>'+html(appName(app))+'</span></div>'+
 '<button data-shell-app="'+id+'">'+icon('apps')+html(L('open'))+'</button>'+
 (isOn?'<button data-shell-window="focus" data-shell-id="'+id+'">'+icon('grid')+html(L('focus'))+'</button><button data-shell-window="minimize" data-shell-id="'+id+'">'+icon('minus')+html(L('minimize'))+'</button><button data-shell-window="close" data-shell-id="'+id+'">'+icon('close')+html(L('close'))+'</button>':'')+
 '<div class="os-context-sep"></div><button data-shell-pin="'+id+'">'+icon('pin')+html(L(pinSet.has(id)?'unpin':'pin'))+'</button>';
 root.hidden=false;
 root.style.left=Math.max(8,Math.min(innerWidth-root.offsetWidth-8,x))+'px';
 root.style.top=Math.max(60,Math.min(innerHeight-root.offsetHeight-10,y))+'px';
}
function windowCommand(operation,id){
 if(operation==='focus')bridge?.focus(id);
 if(operation==='minimize')bridge?.minimize(id);
 if(operation==='close')bridge?.close(id);
 $('#osDockPeek').hidden=true;$('#osDockContext').hidden=true;syncDock();
}
function moveDockIcons(event){
 const dock=$('.dock');if(!dock||!event.dataTransfer)return;
 const id=event.dataTransfer.getData('text/plain');const src=$('[data-dock="'+id+'"]',dock),target=event.target.closest('[data-dock]');
 if(!src||!target||src===target)return;
 const p=target.getBoundingClientRect(),before=document.documentElement.dataset.dockPosition==='bottom'?event.clientX<p.left+p.width/2:event.clientY<p.top+p.height/2;
 if(before)target.before(src);else target.after(src);
 order=dockButtons().map(x=>x.dataset.dock);save(ORDER_KEY,order);
}
function updatePowerClock(){
 if(powerState==='lock'||powerState==='sleep'){
  const c=powerTime();const a=$('#osLockClock'),b=$('#osLockDate');
  if(a)a.textContent=c.time;if(b)b.textContent=c.date;
 }
}
function applyLanguage(){
 for(const el of [$('button#osStartButton'),$('button#osTopStart')]){
  if(!el)continue;
  el.setAttribute('aria-label',L('start'));if(el.id==='osTopStart')el.textContent=L('start');
 }
 const top=$('#osTopPower');if(top){top.title=L('power');top.setAttribute('aria-label',L('power'))}
 if(open)renderStart();
 if(!$('#osPowerPopup').hidden)powerPopup();
 if(confirming)powerConfirm(confirming);
 if(powerState!=='on')enterPower(powerState,false);
 syncDock();
}
function initEvents(){
 document.addEventListener('click',e=>{
  const item=e.target.closest('[data-shell-action],[data-shell-category],[data-shell-app],[data-shell-power],[data-shell-window],[data-shell-pin]');
  if(item){
   const act=item.dataset.shellAction;
   if(act==='toggle-start'){showStart(!open);return}
   if(act==='power-menu'){powerPopup();return}
   if(act==='cancel-power'){confirming=null;$('#osPowerConfirm').hidden=true;return}
   if(act==='confirm-power'){confirmPower();return}
   if(act==='turn-on'){exitPower();window.location.reload();return}
   if(act==='wake'||act==='unlock'){exitPower();return}
   if(act==='show-desktop'){showStart(false);bridge?.showDesktop();return}
   if(item.dataset.shellCategory){category=item.dataset.shellCategory;renderStart();$('#osStartSearch')?.focus();return}
   if(item.dataset.shellApp){launch(item.dataset.shellApp);return}
   if(item.dataset.shellPower){
     const k=item.dataset.shellPower;$('#osPowerPopup').hidden=true;
     if(k==='sleep'||k==='lock')enterPower(k,false);
     else powerConfirm(k);
     return;
   }
   if(item.dataset.shellWindow){windowCommand(item.dataset.shellWindow,item.dataset.shellId);return}
   if(item.dataset.shellPin){togglePin(item.dataset.shellPin);return}
  }
  if(open&&!e.target.closest('#osStartPanel,#osStartButton,#osTopStart'))showStart(false);
  if(!e.target.closest('#osDockPeek,[data-dock]'))$('#osDockPeek').hidden=true;
  if(!e.target.closest('#osDockContext,[data-dock]'))$('#osDockContext').hidden=true;
  if(!e.target.closest('#osPowerPopup,#osTopPower'))$('#osPowerPopup').hidden=true;
 },false);
 document.addEventListener('input',e=>{
  if(e.target.id!=='osStartSearch')return;
  searchValue=e.target.value;const start=e.target.selectionStart;
  // Render only the results and keep a live input focus / caret.
  const full=searchValue;renderStart();const next=$('#osStartSearch');
  if(next){next.focus();next.setSelectionRange(start,start)}searchValue=full;
 });
 document.addEventListener('keydown',e=>{
  const editor=e.target.closest?.('input,textarea,[contenteditable="true"]');
  if((e.ctrlKey&&e.key==='Escape')||(e.shiftKey&&e.key==='Escape')||(e.altKey&&e.key==='F1')){
   if(!editor){e.preventDefault();showStart(!open)}return;
  }
  if((e.ctrlKey||e.metaKey)&&e.altKey&&e.key.toLowerCase()==='l'){
    e.preventDefault();enterPower('lock',false);return;
  }
  if(e.key==='Escape'){
   if(confirming){confirming=null;$('#osPowerConfirm').hidden=true}
   else if(!$('#osPowerPopup').hidden)$('#osPowerPopup').hidden=true;
   else if(!$('#osDockContext').hidden)$('#osDockContext').hidden=true;
   else if(open)showStart(false);
  }
  if(powerState==='sleep'&&e.key!=='Tab'){e.preventDefault();exitPower()}
 },true);
 document.addEventListener('contextmenu',e=>{
  const b=e.target.closest?.('[data-dock]');if(!b||powerState!=='on')return;
  e.preventDefault();contextMenu(b.dataset.dock,e.clientX,e.clientY);
 },true);
 const dock=$('.dock');
 if(dock){
  dock.addEventListener('pointermove',e=>{
   if(!bridge?.prefs()?.dockMagnify||document.documentElement.classList.contains('motion-off'))return;
   if(e.pointerType!=='mouse')return;
   const vertical=['left','right'].includes(document.documentElement.dataset.dockPosition);
   for(const b of $$('button.dock-app',dock)){
    const r=b.getBoundingClientRect(),coord=vertical?r.top+r.height/2:r.left+r.width/2,mouse=vertical?e.clientY:e.clientX;
    const distance=Math.abs(coord-mouse),boost=Math.max(0,1-distance/155);
    b.style.setProperty('--os-mag',String(1+boost*.38));
   }
  },{passive:true});
  dock.addEventListener('pointerleave',()=>{
   for(const b of $$('button.dock-app',dock))b.style.removeProperty('--os-mag');
  });
  dock.addEventListener('pointerover',e=>{
   const b=e.target.closest('[data-dock]');if(!b||e.relatedTarget?.closest?.('[data-dock]')===b)return;
   clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>dockPeek(b.dataset.dock,b),370);
  });
  dock.addEventListener('pointerout',e=>{
   const b=e.target.closest('[data-dock]');if(!b||e.relatedTarget?.closest?.('[data-dock]')===b)return;
   clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{
    if(!$('#osDockPeek').matches(':hover'))$('#osDockPeek').hidden=true;
   },260);
  });
  dock.addEventListener('dragstart',e=>{
   const b=e.target.closest('[data-dock]');if(!b)return;
   e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',b.dataset.dock);
   $('#osDockPeek').hidden=true;
  });
  dock.addEventListener('dragover',e=>{if(e.target.closest('[data-dock]'))e.preventDefault()});
  dock.addEventListener('drop',e=>{e.preventDefault();moveDockIcons(e)});
  dock.addEventListener('dragend',()=>dockButtons().forEach(x=>x.style.removeProperty('--os-mag')));
 }
 $('#osDockPeek').addEventListener('pointerleave',()=>{$('#osDockPeek').hidden=true});
 document.addEventListener('pointermove',e=>{
  if(!bridge?.prefs()?.dockAutoHide||innerWidth<=840)return;
  const side=document.documentElement.dataset.dockPosition;
  const near=side==='left'?e.clientX<28:side==='right'?e.clientX>innerWidth-28:e.clientY>innerHeight-27;
  if(near||$('.dock')?.matches(':hover')){
   clearTimeout(hideTimer);$('.dock')?.setAttribute('data-reveal','true');
  }else{
   clearTimeout(hideTimer);hideTimer=setTimeout(()=>$('.dock')?.setAttribute('data-reveal','false'),900);
  }
 },{passive:true});
 window.addEventListener('aincfh:languagechange',applyLanguage);
 setInterval(updatePowerClock,30000);
}
function attach(data){
 bridge=data;
 bootDOM();initEvents();syncDock();
}
window.AincShell={
 attach,syncDock,recordOpen,applyDock,togglePin,showStart,
 power:kind=>{if(['sleep','lock'].includes(kind))enterPower(kind,false);else powerConfirm(kind)},
 get state(){return{power:powerState,startOpen:open,pins:[...pinSet],recent:recent.slice()}}
};
})();
