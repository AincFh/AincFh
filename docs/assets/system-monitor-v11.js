/* AincFh OS v11 — Task Manager + real browser performance diagnostics.
   Metrics are only those exposed to this origin by web platform APIs.
   Process rows are OS application windows, not host OS processes.
 */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const locales={
'zh-CN':{title:'任务管理器',sub:'此浏览器工作区的进程与性能',processes:'应用进程',performance:'性能',startup:'启动管理',details:'系统详情',active:'运行中',minimized:'已最小化',focused:'当前活动',uptime:'运行时长',memory:'JavaScript 堆内存',available:'浏览器可见',unavailable:'浏览器未提供',fps:'动画帧率',longtask:'长任务',total:'总计',app:'应用',status:'状态',nodes:'节点',action:'操作',focus:'切换',minimize:'最小化',end:'结束任务',endConfirm:'结束应用窗口？',endWarning:'这将关闭当前 Web OS 中的应用窗口，不会终止电脑上的任何进程。',confirm:'确认结束',cancel:'取消',empty:'没有打开的应用窗口',refresh:'刷新数据',mode:'性能模式',auto:'自动',balanced:'平衡',smooth:'高性能',save:'节能',modeInfo:'仅控制本网页的视觉动画与后台采样，不修改真实设备电源计划。',mainThread:'主线程长任务',frame:'最近帧率',timing:'启动与加载',navigation:'文档加载',dom:'文档就绪',resources:'已加载资源',size:'传输数据（估算）',storage:'网站存储',quota:'网站配额',cores:'浏览器报告的逻辑处理器',screen:'视口尺寸',device:'设备内存（浏览器估算）',limit:'受浏览器保护的数据',note:'浏览器无法读取系统级 CPU、GPU 占用或真实进程私有内存。表中不显示虚构数据。',window:'窗口',min:'最小化',opened:'启动时间',page:'网页',browser:'浏览器沙箱',browserOnly:'仅浏览器桌面',dom:'DOM 节点',notMeasured:'无法测量',longtaskHelp:'只记录浏览器允许观测的大于 50 毫秒的主线程任务。',threshold:'每次操作最大执行时长',loading:'正在采样…',all:'全部',startupInfo:'管理开机应用与恢复桌面的偏好设置。',launch:'启动时打开应用',session:'恢复上次会话',opens:'打开设置',noMemory:'内存值因浏览器隐私限制不可用',units:'毫秒'},
'en-US':{title:'Task Manager',sub:'Applications and real browser performance',processes:'App processes',performance:'Performance',startup:'Startup',details:'System details',active:'Running',minimized:'Minimized',focused:'Focused',uptime:'Uptime',memory:'JavaScript heap',available:'Browser-exposed',unavailable:'Unavailable',fps:'Animation FPS',longtask:'Long tasks',total:'Total',app:'Application',status:'State',nodes:'DOM nodes',action:'Action',focus:'Focus',minimize:'Minimize',end:'End task',endConfirm:'End this app window?',endWarning:'This closes one Web OS app window. It cannot terminate processes on your computer.',confirm:'End window',cancel:'Cancel',empty:'No application windows running',refresh:'Refresh',mode:'Performance profile',auto:'Automatic',balanced:'Balanced',smooth:'High performance',save:'Power saver',modeInfo:'Controls animations and background sampling in this webpage only, not device power plans.',mainThread:'Main-thread long tasks',frame:'Recent frame rate',timing:'Navigation timing',navigation:'Document load',dom:'DOM ready',resources:'Loaded resources',size:'Transfer size (estimate)',storage:'Origin storage',quota:'Origin quota',cores:'Browser-reported logical cores',screen:'Viewport',device:'Approximate device memory',limit:'Browser-restricted data',note:'Web applications cannot read system-wide CPU/GPU utilization or other apps’ private memory. No synthetic usage figures are shown.',window:'Window',min:'Minimized',opened:'Started',page:'Page',browser:'Browser sandbox',browserOnly:'Browser desktop only',dom:'DOM nodes',notMeasured:'Not measurable',longtaskHelp:'Only main-thread tasks over 50 ms exposed by the PerformanceObserver API are collected.',threshold:'Maximum operation time',loading:'Sampling…',all:'All',startupInfo:'Manage startup application and session restoration preferences.',launch:'Open app at startup',session:'Resume previous session',opens:'Open Preferences',noMemory:'Heap information not exposed by this browser',units:'ms'},
'zh-TW':{title:'工作管理員',sub:'瀏覽器工作區的應用程式與效能',processes:'應用程式程序',performance:'效能',startup:'啟動管理',details:'系統詳細資訊',active:'執行中',minimized:'已最小化',focused:'作用中',uptime:'執行時間',memory:'JavaScript 堆積記憶體',available:'瀏覽器可見',unavailable:'無法取得',fps:'動畫幀率',longtask:'長任務',total:'總計',app:'應用程式',status:'狀態',nodes:'節點',action:'操作',focus:'切換',minimize:'最小化',end:'結束工作',endConfirm:'結束應用程式視窗？',endWarning:'這只會關閉 Web OS 中的視窗，不會終止電腦上的任何程序。',confirm:'確認結束',cancel:'取消',empty:'沒有開啟的應用程式視窗',refresh:'重新整理',mode:'效能模式',auto:'自動',balanced:'平衡',smooth:'高效能',save:'省電',modeInfo:'只控制此網頁的動畫與背景取樣，不會修改電腦的電源計畫。',mainThread:'主執行緒長任務',frame:'最近幀率',timing:'啟動與載入',navigation:'文件載入',dom:'DOM 就緒',resources:'已載入資源',size:'傳輸資料（估計）',storage:'網站儲存空間',quota:'網站配額',cores:'瀏覽器回報的邏輯處理器',screen:'視窗尺寸',device:'裝置記憶體（估計）',limit:'瀏覽器保護的資料',note:'瀏覽器無法讀取系統 CPU、GPU 使用率或其他程序的私人記憶體；此處不顯示虛構資料。',window:'視窗',min:'最小化',opened:'啟動時間',page:'網頁',browser:'瀏覽器沙箱',browserOnly:'僅瀏覽器桌面',dom:'DOM 節點',notMeasured:'無法測量',longtaskHelp:'只統計瀏覽器允許觀測且超過 50 毫秒的主執行緒工作。',threshold:'每次操作最長時間',loading:'正在取樣…',all:'全部',startupInfo:'管理開機應用程式與桌面工作階段設定。',launch:'開機啟動應用程式',session:'還原先前工作階段',opens:'開啟設定',noMemory:'瀏覽器未提供記憶體資訊',units:'毫秒'},
'ja-JP':{title:'タスクマネージャー',sub:'Web OS アプリとブラウザーのパフォーマンス',processes:'アプリプロセス',performance:'パフォーマンス',startup:'起動設定',details:'システム詳細',active:'実行中',minimized:'最小化',focused:'選択中',uptime:'稼働時間',memory:'JavaScript ヒープ',available:'ブラウザーが公開',unavailable:'利用不可',fps:'フレームレート',longtask:'長いタスク',total:'合計',app:'アプリ',status:'状態',nodes:'DOM ノード',action:'操作',focus:'表示',minimize:'最小化',end:'タスクを終了',endConfirm:'ウィンドウを終了しますか？',endWarning:'この操作は Web OS アプリのウィンドウだけを閉じます。PC のプロセスは終了しません。',confirm:'ウィンドウを閉じる',cancel:'キャンセル',empty:'起動中のアプリはありません',refresh:'更新',mode:'パフォーマンスモード',auto:'自動',balanced:'バランス',smooth:'高性能',save:'省電力',modeInfo:'この Web ページ内のアニメーションと計測頻度だけを調整します。PC の電源設定は変えません。',mainThread:'メインスレッドの長時間タスク',frame:'最近の FPS',timing:'読み込み時間',navigation:'ドキュメントの読み込み',dom:'DOM の準備',resources:'読み込みリソース',size:'転送量（推定）',storage:'サイトの保存容量',quota:'サイトの割当容量',cores:'ブラウザーが報告する論理コア',screen:'画面サイズ',device:'推定デバイスメモリ',limit:'ブラウザーで保護されたデータ',note:'システム全体の CPU・GPU 負荷や他のアプリのメモリは取得できません。架空の数値は表示しません。',window:'ウィンドウ',min:'最小化',opened:'起動時刻',page:'ページ',browser:'ブラウザー内',browserOnly:'ブラウザーデスクトップのみ',dom:'DOM ノード',notMeasured:'計測不可',longtaskHelp:'ブラウザーが公開する 50ms を超えるメインスレッドのタスクのみを記録します。',threshold:'最大処理時間',loading:'計測中…',all:'すべて',startupInfo:'起動時に開くアプリやセッション復元を管理します。',launch:'起動時にアプリを開く',session:'前回のセッションを復元',opens:'設定を開く',noMemory:'ヒープ情報を取得できません',units:'ミリ秒'}
};
function L(k){return (locales[window.AincI18n?.locale||'en-US']||locales['en-US'])[k]||k}
function bytes(v){if(!Number.isFinite(v)||v<0)return L('unavailable');return v>=1073741824?(v/1073741824).toFixed(2)+' GiB':v>=1048576?(v/1048576).toFixed(1)+' MiB':v>=1024?(v/1024).toFixed(1)+' KiB':Math.round(v)+' B'}
function secs(s){s=Math.max(0,Math.floor(s));return Math.floor(s/3600).toString().padStart(2,'0')+':'+Math.floor(s%3600/60).toString().padStart(2,'0')+':'+(s%60).toString().padStart(2,'0')}
const METRICS={longTasks:[],longTaskTotal:0,lastLongTask:0,fps:null,frames:0,resources:0,navigation:null,heap:null,storage:null,domNodes:null};
const processTimes=new Map(),renderTimings=new Map();
let bridge=null,tab='processes',pendingTerminate='',tickTimer=null,visible=false,frameId=null,lastFrame=0,lastMeasure=0,recordedFrames=0,observer=null,storagePoll=null;
try{
 observer=new PerformanceObserver(list=>{
  for(const x of list.getEntries()){
   const duration=x.duration;
   METRICS.longTaskTotal++;METRICS.lastLongTask=Math.max(duration,METRICS.lastLongTask);
   METRICS.longTasks.push({start:x.startTime,duration});
   if(METRICS.longTasks.length>50)METRICS.longTasks.shift();
  }
 });
 if(PerformanceObserver.supportedEntryTypes?.includes('longtask'))observer.observe({entryTypes:['longtask']});
}catch(e){observer=null}
function markOpen(id){if(!processTimes.has(id))processTimes.set(id,performance.now());}
function markClose(id){processTimes.delete(id);renderTimings.delete(id)}
function recordRender(id,duration){if(!Number.isFinite(duration))return;const arr=renderTimings.get(id)||[];arr.push(duration);if(arr.length>12)arr.shift();renderTimings.set(id,arr)}
function getWindows(){return bridge?.windows?.()||[]}
function sourceWindow(id){return document.getElementById('app-'+id)}
function processes(){
 return getWindows().map(w=>({
  ...w,
  startedAt:processTimes.get(w.id)||performance.now(),
  nodeCount:sourceWindow(w.id)?.querySelectorAll('*').length||0,
  renderMs:Math.max(0,...(renderTimings.get(w.id)||[0])),
 }));
}
function measure(){
 const n=performance.getEntriesByType('navigation')[0];
 METRICS.navigation=n?{domReady:Math.max(0,n.domContentLoadedEventEnd-n.startTime),loaded:Math.max(0,n.loadEventEnd-n.startTime),transferred:n.transferSize||0}:null;
 METRICS.resources=performance.getEntriesByType('resource').length;
 METRICS.domNodes=document.getElementsByTagName('*').length;
 const mem=performance.memory;
 METRICS.heap=mem&&Number.isFinite(mem.usedJSHeapSize)?{used:mem.usedJSHeapSize,limit:mem.jsHeapSizeLimit}:null;
}
async function pollStorage(){
 if(!navigator.storage?.estimate)return;
 try{const q=await navigator.storage.estimate();METRICS.storage={usage:q.usage,quota:q.quota}}catch(e){METRICS.storage=null}
}
function sampleFrame(now){
 if(!visible||document.hidden){frameId=null;return}
 if(lastFrame){const delta=now-lastFrame;if(delta>3&&delta<250)recordedFrames++}
 lastFrame=now;
 if(!lastMeasure)lastMeasure=now;
 if(now-lastMeasure>=1000){
  METRICS.fps=Math.min(240,Math.round(recordedFrames*1000/(now-lastMeasure)));
  recordedFrames=0;lastMeasure=now;
 }
 frameId=requestAnimationFrame(sampleFrame);
}
function startSamples(){
 if(tickTimer)return;
 visible=true;
 if(frameId===null)frameId=requestAnimationFrame(sampleFrame);
 tickTimer=setInterval(()=>{
  if(!document.getElementById('app-taskmanager')||document.hidden){stopSamples();return}
  measure();
  updateLive();
 },2400);
 measure();pollStorage();
 storagePoll=setInterval(()=>{if(visible)pollStorage()},12000);
}
function stopSamples(){
 visible=false;if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;
 if(tickTimer)clearInterval(tickTimer);tickTimer=null;
 if(storagePoll)clearInterval(storagePoll);storagePoll=null;
 lastFrame=0;lastMeasure=0;recordedFrames=0;
}
function stat(label,value,foot=''){return '<div class="tm-stat"><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong>'+(foot?'<span>'+esc(foot)+'</span>':'')+'</div>'}
function renderProcesses(){
 const rows=processes(),now=performance.now();
 return '<div class="tm-stats">'+stat(L('active'),String(rows.filter(p=>!p.minimized).length),L('window'))+
 stat(L('minimized'),String(rows.filter(p=>p.minimized).length),L('window'))+
 stat(L('longtask'),String(METRICS.longTaskTotal),L('mainThread'))+
 stat(L('fps'),METRICS.fps===null?L('loading'):String(METRICS.fps),L('frame'))+'</div>'+
 '<div class="tm-table-head"><span>'+L('app')+'</span><span>'+L('status')+'</span><span>'+L('uptime')+'</span><span>'+L('nodes')+'</span><span>'+L('action')+'</span></div>'+
 '<div class="tm-process-list">'+(rows.length?rows.map(p=>{
   const startSecs=(now-p.startedAt)/1000;
   const status=p.minimized?L('minimized'):p.focused?L('focused'):L('active');
   return '<div class="tm-process-row" data-tm-pid="'+esc(p.id)+'">'+
     '<div class="tm-process-name"><span class="tm-process-icon">'+svgIcon(bridge?.apps?.().find(a=>a.id===p.id)?.icon||'apps')+'</span><span><strong>'+esc(window.AincI18n?.t(p.name)||p.name||p.id)+'</strong><small>AincFh OS / '+esc(p.id)+'</small></span></div>'+
     '<span class="tm-process-state"><i class="'+(p.minimized?'paused':p.focused?'focused':'')+'"></i>'+status+'</span>'+
     '<span class="tm-mono" data-tm-uptime="'+esc(p.id)+'">'+secs(startSecs)+'</span>'+
     '<span class="tm-mono">'+p.nodeCount+'</span>'+
     '<div class="tm-process-controls"><button data-tm-action="focus" data-tm-id="'+esc(p.id)+'">'+L('focus')+'</button>'+
     '<button data-tm-action="end" data-tm-id="'+esc(p.id)+'" class="tm-stop">'+L('end')+'</button></div>'+
   '</div>'
 }).join(''):'<div class="tm-empty">'+L('empty')+'</div>')+'</div>';
}
function svgIcon(name){name=/^[a-z0-9-]+$/.test(name)?name:'apps';return '<svg><use href="#i-'+name+'"></use></svg>'}
function renderPerformance(){
 const heap=METRICS.heap,store=METRICS.storage,nav=METRICS.navigation;
 const memValue=heap?bytes(heap.used):L('unavailable');
 const fps=METRICS.fps===null?L('loading'):METRICS.fps.toString();
 return '<div class="tm-performance-grid">'+
  stat(L('memory'),memValue,heap?bytes(heap.limit)+' limit':L('noMemory'))+
  stat(L('fps'),fps,'requestAnimationFrame · current tab')+
  stat(L('mainThread'),METRICS.longTaskTotal+' '+L('total'),'max '+METRICS.lastLongTask.toFixed(1)+' '+L('units'))+
  stat(L('storage'),store?bytes(store.usage):L('unavailable'),store?'quota '+bytes(store.quota):L('unavailable'))+
  stat(L('dom'),METRICS.domNodes===null?'—':METRICS.domNodes.toLocaleString(),'live document elements')+
  stat(L('resources'),String(METRICS.resources),L('timing'))+'</div>'+
 '<div class="tm-subheading">'+L('mode')+'</div><div class="tm-profiles">'+['auto','balanced','smooth','save'].map(id=>'<button data-tm-mode="'+id+'" aria-pressed="'+(bridge?.prefs?.().performanceMode===id)+'">'+esc(L(id))+'</button>').join('')+'</div>'+
 '<p class="tm-hint">'+L('modeInfo')+'</p><div class="tm-subheading">'+L('timing')+'</div>'+
 '<div class="tm-timing-row"><span>'+L('dom')+'</span><strong>'+((nav&&nav.domReady)?nav.domReady.toFixed(0)+' ms':'—')+'</strong></div>'+
 '<div class="tm-timing-row"><span>'+L('navigation')+'</span><strong>'+((nav&&nav.loaded)?nav.loaded.toFixed(0)+' ms':'—')+'</strong></div>'+
 '<p class="tm-hint">'+L('longtaskHelp')+'</p>';
}
function renderStartup(){
 const prefs=bridge?.prefs?.()||{};
 return '<div class="tm-subheading">'+L('startup')+'</div><p class="tm-hint">'+L('startupInfo')+'</p>'+
 '<div class="tm-option-row"><span>'+L('launch')+'</span><b>'+(prefs.autoOpen?window.AincI18n?.t('Open')||L('active'):L('unavailable'))+'</b></div>'+
 '<div class="tm-option-row"><span>'+L('session')+'</span><b>'+(prefs.restoreSession?'ON':'OFF')+'</b></div>'+
 '<button class="tm-main-action" data-tm-open="settings">'+L('opens')+'</button>';
}
function renderDetails(){
 const nav=METRICS.navigation,store=METRICS.storage;
 const rows=[
  [L('browser'),navigator.userAgentData?.brands?.map(x=>x.brand+' '+x.version).join(', ')||navigator.userAgent],
  [L('cores'),navigator.hardwareConcurrency||L('unavailable')],
  [L('device'),navigator.deviceMemory?navigator.deviceMemory+' GiB':L('unavailable')],
  [L('screen'),innerWidth+' × '+innerHeight],
  [L('navigation'),nav?nav.loaded.toFixed(0)+' ms':L('unavailable')],
  [L('size'),nav?bytes(nav.transferred):L('unavailable')],
  [L('storage'),store?bytes(store.usage):L('unavailable')],
  [L('quota'),store?bytes(store.quota):L('unavailable')],
 ];
 return '<div class="tm-info-grid">'+rows.map(([k,v])=>'<div><span>'+esc(k)+'</span><strong>'+esc(v)+'</strong></div>').join('')+'</div><p class="tm-warning">'+L('note')+'</p>';
}
function render(){
 measure();
 const tabs=[['processes',L('processes')],['performance',L('performance')],['startup',L('startup')],['details',L('details')]];
 return '<div class="tm-app"><header class="tm-header"><div><span class="win-eyebrow">AINCFH OS / SYSTEM DIAGNOSTICS</span><h2>'+L('title')+'<span>.</span></h2><p>'+L('sub')+'</p></div><button data-tm-action="refresh" class="tm-refresh">'+L('refresh')+'</button></header>'+
 '<nav class="tm-tabs" role="tablist">'+tabs.map(([id,title])=>'<button role="tab" data-tm-tab="'+id+'" aria-selected="'+(tab===id)+'">'+esc(title)+'</button>').join('')+'</nav>'+
 '<main class="tm-main" id="tmDashboard">'+(tab==='processes'?renderProcesses():tab==='performance'?renderPerformance():tab==='startup'?renderStartup():renderDetails())+'</main>'+
 '<footer class="tm-footer"><span>AINCFH OS · '+L('browserOnly')+'</span><span class="tm-indicator"><i></i>'+L('active')+'</span></footer></div>';
}
function updateLive(){
 if(!visible)return;
 const root=$('#app-taskmanager #tmDashboard');if(!root)return;
 if(tab==='processes'){
  const expected=processes();
  const actual=$$('[data-tm-pid]',root);
  if(expected.length!==actual.length||expected.some((x,i)=>x.id!==actual[i]?.dataset.tmPid)){
   root.innerHTML=renderProcesses();return;
  }
  const t=performance.now();
  for(const p of expected){const text=$('[data-tm-uptime="'+p.id+'"]',root);if(text)text.textContent=secs((t-p.startedAt)/1000)}
  const stats=$$('.tm-stat strong',root);
  if(stats[0])stats[0].textContent=expected.filter(x=>!x.minimized).length;
  if(stats[1])stats[1].textContent=expected.filter(x=>x.minimized).length;
  if(stats[2])stats[2].textContent=METRICS.longTaskTotal;
  if(stats[3])stats[3].textContent=METRICS.fps??L('loading');
 }else if(tab==='performance')root.innerHTML=renderPerformance();
}
function rerender(){const parent=$('#app-taskmanager .window-content');if(parent){parent.innerHTML=render();startSamples()}}
function handleEvents(){
 document.addEventListener('click',e=>{
  const b=e.target.closest?.('#app-taskmanager [data-tm-tab],#app-taskmanager [data-tm-action],#app-taskmanager [data-tm-mode],#app-taskmanager [data-tm-open],#tmEndModal button');
  if(!b)return;
  if(b.dataset.tmTab){tab=b.dataset.tmTab;rerender();return}
  if(b.dataset.tmMode){bridge?.set('performanceMode',b.dataset.tmMode);rerender();return}
  if(b.dataset.tmOpen){bridge?.open(b.dataset.tmOpen);return}
  const act=b.dataset.tmAction,id=b.dataset.tmId;
  if(act==='refresh'){rerender();pollStorage();return}
  if(act==='focus'){bridge?.focus(id);return}
  if(act==='end'&&id){
   if(id==='taskmanager'){bridge?.close(id);return}
   pendingTerminate=id;
   const panel=document.createElement('div');panel.id='tmEndModal';panel.className='tm-modal';panel.innerHTML='<div class="tm-modal-card" role="dialog" aria-modal="true"><h3>'+L('endConfirm')+'</h3><p>'+L('endWarning')+'</p><div><button data-tm-confirm="cancel">'+L('cancel')+'</button><button class="danger" data-tm-confirm="end">'+L('confirm')+'</button></div></div>';
   document.body.append(panel);
   return;
  }
  if(b.dataset.tmConfirm){
   const terminate=b.dataset.tmConfirm==='end'&&pendingTerminate;$('#tmEndModal')?.remove();pendingTerminate='';
   if(terminate){bridge?.close(terminate);rerender()}
  }
 },false);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#tmEndModal')?.remove();pendingTerminate=''}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSamples();else if($('#app-taskmanager'))startSamples()});
 window.addEventListener('aincfh:languagechange',()=>{if($('#app-taskmanager'))rerender()});
}
handleEvents();
window.AincSystemMonitor={
 attach(b){bridge=b},
 render,
 onRender:startSamples,
 onClose:stopSamples,
 markOpen,markClose,recordRender,
 getSnapshot(){measure();return {windows:processes(),metrics:{...METRICS},performanceMode:bridge?.prefs()?.performanceMode}},
 get metrics(){return METRICS}
};
})();
