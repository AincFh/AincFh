/* AincFh OS v12 — Desktop Environment Fusion.
 * Global theme presets, native-feeling shell decoration, multiple isolated virtual
 * workspaces, and a functional task/space overview. Browser sandbox only.
 */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const PRESETS=Object.freeze({
 fusion:{theme:'dark',accent:'amber',dockMode:'floating',dockPosition:'bottom',dockScale:'normal',dockMagnify:true,dockAutoHide:false,startLayout:'grid',wallpaperStyle:'hex',windowControls:'left',windowRadius:'balanced',panelDensity:'comfortable',menuBarStyle:'full'},
 mac:{theme:'dark',accent:'violet',dockMode:'floating',dockPosition:'bottom',dockScale:'normal',dockMagnify:true,dockAutoHide:false,startLayout:'grid',wallpaperStyle:'aurora',windowControls:'left',windowRadius:'rounded',panelDensity:'comfortable',menuBarStyle:'full'},
 windows:{theme:'dark',accent:'blue',dockMode:'taskbar',dockPosition:'bottom',dockScale:'normal',dockMagnify:false,dockAutoHide:false,startLayout:'grid',wallpaperStyle:'mesh',windowControls:'right',windowRadius:'balanced',panelDensity:'compact',menuBarStyle:'compact'},
 linux:{theme:'dark',accent:'green',dockMode:'floating',dockPosition:'left',dockScale:'small',dockMagnify:false,dockAutoHide:false,startLayout:'list',wallpaperStyle:'grid',windowControls:'right',windowRadius:'compact',panelDensity:'compact',menuBarStyle:'compact'}
});
const COLOR_LIST=Object.freeze([
{id:'amber',hex:'#ff9f43'},{id:'violet',hex:'#b293ff'},{id:'cyan',hex:'#78d3d4'},
{id:'blue',hex:'#68a9ff'},{id:'rose',hex:'#f58cab'},{id:'green',hex:'#65cf9f'}
]);
const MESSAGES={
'zh-CN':{
studio:'桌面环境工作室',subtitle:'一套设计系统，融合三种桌面环境的成熟交互。所有配置即时生效并保存于当前浏览器。',
presets:'桌面环境预设',fusion:'AincFh 融合',mac:'macOS 灵感',windows:'Windows 灵感',linux:'Linux / Plasma 灵感',custom:'自定义',
fusionDesc:'悬浮 Dock、现代窗口与统一面板',macDesc:'菜单栏、悬浮 Dock、圆角窗口',windowsDesc:'全宽任务栏、右侧窗口控件、开始菜单',linuxDesc:'纵向面板、工作区与紧凑窗口',
selected:'使用中',apply:'应用此布局',theme:'全局外观',themeMode:'明暗主题',dark:'夜间',light:'柔和亮色',accent:'强调色',wallpaper:'桌面背景',hex:'六边形',aurora:'极光',mesh:'渐变网格',grid:'几何网格',plain:'纯色',
customColor:'自定义颜色',customHelp:'输入六位 HEX 颜色值，例如 #D88AFF。仅用于界面强调色。',customApply:'应用颜色',invalidColor:'颜色格式无效，请填写 #RRGGBB。',
window:'窗口装饰与行为',controls:'窗口按钮',left:'左侧 · macOS',right:'右侧 · Windows / Linux',radius:'窗口圆角',compact:'方正',balanced:'平衡',rounded:'圆润',density:'界面密度',comfortable:'舒适',menu:'顶部菜单栏',full:'完整',minimal:'紧凑',
workspaces:'虚拟桌面',spacesCount:'工作区数量',spaceInfo:'每个工作区拥有独立的窗口集合。Ctrl + Alt + 1–4 切换；Ctrl + Alt + M 打开总览。',
overview:'工作区总览',current:'当前桌面',move:'移至下一个桌面',switch:'切换到桌面',openWindow:'打开窗口',empty:'暂无打开的窗口',label:'桌面',close:'关闭',taskView:'任务视图',
snapTitle:'窗口布局',snapLeft:'左半屏',snapRight:'右半屏',snapTL:'左上角',snapTR:'右上角',snapBL:'左下角',snapBR:'右下角',snapCenter:'居中',snapMax:'最大化',
windowLimit:'最多支持四个工作区',fileSafe:'所有应用数据仍由同一浏览器本地存储管理；虚拟桌面只隔离窗口显示，不创建真实系统账户。'
},
'zh-TW':{
studio:'桌面環境工作室',subtitle:'一套設計系統，融合三種桌面環境的成熟互動方式。設定立即生效並儲存於瀏覽器。',
presets:'桌面環境預設',fusion:'AincFh 融合',mac:'macOS 風格',windows:'Windows 風格',linux:'Linux / Plasma 風格',custom:'自訂',
fusionDesc:'懸浮 Dock、現代視窗與一致的面板',macDesc:'選單列、懸浮 Dock、圓角視窗',windowsDesc:'完整工作列、右側視窗控制、開始功能表',linuxDesc:'垂直面板、工作區與緊湊視窗',
selected:'使用中',apply:'套用此版面',theme:'全域外觀',themeMode:'明暗主題',dark:'夜間',light:'柔和亮色',accent:'強調色',wallpaper:'桌面背景',hex:'六邊形',aurora:'極光',mesh:'漸層網格',grid:'幾何網格',plain:'純色',
customColor:'自訂色彩',customHelp:'輸入六位 HEX 色碼，例如 #D88AFF。只影響介面強調色。',customApply:'套用色彩',invalidColor:'色碼格式不正確，請輸入 #RRGGBB。',
window:'視窗裝飾與行為',controls:'視窗按鈕',left:'左側 · macOS',right:'右側 · Windows / Linux',radius:'視窗圓角',compact:'方正',balanced:'平衡',rounded:'圓潤',density:'介面密度',comfortable:'舒適',menu:'頂部選單列',full:'完整',minimal:'精簡',
workspaces:'虛擬桌面',spacesCount:'工作區數量',spaceInfo:'各工作區擁有獨立視窗集合。Ctrl + Alt + 1–4 切換；Ctrl + Alt + M 開啟總覽。',
overview:'工作區總覽',current:'目前桌面',move:'移至下一個桌面',switch:'切換到桌面',openWindow:'開啟視窗',empty:'沒有開啟的視窗',label:'桌面',close:'關閉',taskView:'工作檢視',
snapTitle:'視窗配置',snapLeft:'左半邊',snapRight:'右半邊',snapTL:'左上角',snapTR:'右上角',snapBL:'左下角',snapBR:'右下角',snapCenter:'置中',snapMax:'最大化',
windowLimit:'最多四個工作區',fileSafe:'所有應用程式資料仍由瀏覽器本機儲存管理；虛擬桌面只分隔視窗顯示，不建立真實系統帳戶。'
},
'en-US':{
studio:'Desktop Environment Studio',subtitle:'One original design system combining mature desktop interaction patterns. Changes apply immediately and stay in your browser.',
presets:'Desktop environment presets',fusion:'AincFh Fusion',mac:'macOS-inspired',windows:'Windows-inspired',linux:'Linux / Plasma-inspired',custom:'Custom',
fusionDesc:'Floating Dock, modern windows and unified panel',macDesc:'Menu bar, floating Dock and rounded windows',windowsDesc:'Full-width taskbar, right-side controls and Start',linuxDesc:'Vertical panel, workspaces and compact windows',
selected:'Active',apply:'Apply layout',theme:'Global appearance',themeMode:'Color scheme',dark:'Midnight',light:'Soft light',accent:'Accent color',wallpaper:'Wallpaper',hex:'Hexagons',aurora:'Aurora',mesh:'Gradient mesh',grid:'Geometric grid',plain:'Solid',
customColor:'Custom color',customHelp:'Enter a six-digit HEX color, such as #D88AFF. Used for interface accents only.',customApply:'Apply color',invalidColor:'Invalid color. Use #RRGGBB.',
window:'Window decorations & behavior',controls:'Window controls',left:'Left · macOS',right:'Right · Windows / Linux',radius:'Window corners',compact:'Squared',balanced:'Balanced',rounded:'Rounded',density:'Interface density',comfortable:'Comfortable',menu:'Top menu bar',full:'Full',minimal:'Compact',
workspaces:'Virtual desktops',spacesCount:'Number of workspaces',spaceInfo:'Each space has its own window collection. Ctrl + Alt + 1–4 switches; Ctrl + Alt + M opens overview.',
overview:'Workspace overview',current:'Current desktop',move:'Move to next desktop',switch:'Switch to desktop',openWindow:'Open window',empty:'No open windows',label:'Desktop',close:'Close',taskView:'Task View',
snapTitle:'Snap layouts',snapLeft:'Left half',snapRight:'Right half',snapTL:'Top left',snapTR:'Top right',snapBL:'Bottom left',snapBR:'Bottom right',snapCenter:'Center',snapMax:'Maximize',
windowLimit:'Up to four workspaces',fileSafe:'Your app data stays in the same browser storage. Workspaces separate window visibility, not system user accounts.'
},
'ja-JP':{
studio:'デスクトップ環境スタジオ',subtitle:'macOS・Windows・Linux の優れた操作を一貫したデザインに統合。変更はすぐに反映され、保存されます。',
presets:'デスクトップ環境プリセット',fusion:'AincFh フュージョン',mac:'macOS スタイル',windows:'Windows スタイル',linux:'Linux / Plasma スタイル',custom:'カスタム',
fusionDesc:'フローティング Dock と統一パネル',macDesc:'メニューバー、Dock、丸いウィンドウ',windowsDesc:'タスクバー、右側の操作ボタン、スタート',linuxDesc:'縦型パネル、仮想デスクトップ、コンパクト表示',
selected:'使用中',apply:'レイアウトを適用',theme:'全体の外観',themeMode:'カラーテーマ',dark:'ダーク',light:'ライト',accent:'アクセントカラー',wallpaper:'壁紙',hex:'六角形',aurora:'オーロラ',mesh:'グラデーションメッシュ',grid:'幾何学グリッド',plain:'単色',
customColor:'カスタムカラー',customHelp:'#D88AFF のように 6 桁の HEX カラーを入力してください。',customApply:'カラーを適用',invalidColor:'#RRGGBB 形式で入力してください。',
window:'ウィンドウの外観と動作',controls:'ウィンドウボタン',left:'左 · macOS',right:'右 · Windows / Linux',radius:'ウィンドウの角',compact:'角張った',balanced:'標準',rounded:'丸い',density:'表示密度',comfortable:'ゆったり',menu:'上部メニューバー',full:'すべて表示',minimal:'コンパクト',
workspaces:'仮想デスクトップ',spacesCount:'ワークスペース数',spaceInfo:'デスクトップごとにウィンドウが分離されます。Ctrl + Alt + 1〜4 で切替、Ctrl + Alt + M で一覧表示。',
overview:'ワークスペース一覧',current:'現在のデスクトップ',move:'次のデスクトップへ移動',switch:'デスクトップへ移動',openWindow:'ウィンドウを開く',empty:'ウィンドウがありません',label:'デスクトップ',close:'閉じる',taskView:'タスクビュー',
snapTitle:'スナップレイアウト',snapLeft:'左半分',snapRight:'右半分',snapTL:'左上',snapTR:'右上',snapBL:'左下',snapBR:'右下',snapCenter:'中央',snapMax:'最大化',
windowLimit:'最大 4 つのワークスペース',fileSafe:'アプリのデータは同じブラウザーに保存されます。ワークスペースはウィンドウ表示を分ける機能です。'
}
};
const t=k=>(MESSAGES[window.AincI18n?.locale||'en-US']||MESSAGES['en-US'])[k]||k;
let bridge=null,active=1,assignments={},overviewOpen=false,topNode=null,overlay=null,snapRoot=null,snapId=null;
function storageGet(key,defaultValue){try{const s=localStorage.getItem(key);return s?JSON.parse(s):defaultValue}catch{return defaultValue}}
function storageSet(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
active=Math.max(1,Math.min(4,Number(storageGet('aincfh_fusion_active_v12',1))||1));
const imported=storageGet('aincfh_fusion_assign_v12',{});
assignments=imported&&typeof imported==='object'&&!Array.isArray(imported)?imported:{};
function count(){return Math.max(1,Math.min(4,Number(bridge?.prefs?.()?.workspaceCount)||3))}
function getApps(){return bridge?.apps?.()||[]}
function getWindows(){return bridge?.windows?.()||[]}
function safeId(id){return typeof id==='string'&&/^[a-z0-9-]{1,40}$/.test(id)&&getApps().some(a=>a.id===id)}
function owned(id){const n=Number(assignments[id]);return n>=1&&n<=count()?n:1}
function saveAssignments(){storageSet('aincfh_fusion_assign_v12',assignments)}
function registerWindow(id){
 if(!safeId(id))return;
 if(!Number.isInteger(assignments[id])||assignments[id]<1||assignments[id]>count()){assignments[id]=active;saveAssignments()}
 applyWindowVisibility();
}
function forgetWindow(id){ // Keep prior placement for session restore, but never claim a closed window is running.
 if(!safeId(id))return;
 applyWindowVisibility();
}
function ensureWindow(id){
 if(!safeId(id))return;
 const dest=owned(id);
 if(dest!==active)switchWorkspace(dest);
}
function applyWindowVisibility(){
 if(!bridge)return;
 const all=getWindows();const allowedIds=new Set(all.map(w=>w.id));
 for(const n of $$('.os-window')){
  const id=n.id.slice(4);
  const hidden=allowedIds.has(id)&&owned(id)!==active;
  n.dataset.workspaceHidden=hidden?'true':'false';
  n.setAttribute('aria-hidden',hidden?'true':'false');
 }
 for(const b of $$('[data-dock]')){
  const id=b.dataset.dock,w=all.find(w=>w.id===id);
  b.dataset.workspaceOther=w&&owned(id)!==active?'true':'false';
 }
 updateTop();
}
function switchWorkspace(next){
 const n=Number(next);
 if(!Number.isInteger(n)||n<1||n>count())return false;
 if(n===active){updateTop();return true}
 active=n;storageSet('aincfh_fusion_active_v12',active);
 for(const w of $$('.os-window.focused'))w.classList.remove('focused');
 applyWindowVisibility();
 const candidate=getWindows().filter(x=>!x.minimized&&owned(x.id)===active).slice(-1)[0];
 if(candidate)bridge?.focus?.(candidate.id);
 closeOverview();updateTop();
 window.dispatchEvent(new CustomEvent('aincfh:workspacechange',{detail:{workspace:active,count:count()}}));
 return true;
}
function moveWindow(id,to){
 const n=Number(to);
 if(!safeId(id)||!getWindows().some(w=>w.id===id)||!Number.isInteger(n)||n<1||n>count())return false;
 assignments[id]=n;saveAssignments();applyWindowVisibility();
 if(n===active)bridge?.focus?.(id);
 if(overviewOpen)renderOverview();
 return true;
}
function updateTop(){
 if(!topNode)return;
 const buttons=$$('[data-fusion-switch]',topNode);
 for(const b of buttons){const i=Number(b.dataset.fusionSwitch);b.setAttribute('aria-pressed',String(i===active));b.title=t('switch')+' '+i}
 const label=$('[data-fusion-overview]',topNode);if(label)label.setAttribute('aria-label',t('taskView'));
}
function redrawTop(){
 if(!topNode)return;
 const icons=Array.from({length:count()},(_,i)=>i+1).map(i=>'<button type="button" data-fusion-switch="'+i+'" aria-pressed="'+(i===active)+'" aria-label="'+esc(t('switch')+' '+i)+'">'+i+'</button>').join('');
 topNode.innerHTML='<span class="fusion-top-label">'+esc(t('label'))+'</span><div class="fusion-top-pips">'+icons+'</div><button type="button" data-fusion-overview aria-label="'+esc(t('taskView'))+'" title="'+esc(t('taskView'))+'"><svg aria-hidden="true"><use href="#i-apps"></use></svg></button>';
}
function renderOverview(){
 if(!overlay)return;
 const all=getWindows(),apps=getApps();
 const cards=Array.from({length:count()},(_,idx)=>{
  const n=idx+1,items=all.filter(x=>owned(x.id)===n);
  const windows=items.length?items.map(w=>{
   const m=apps.find(a=>a.id===w.id)||{},name=window.AincI18n?.t(m.name||w.name||w.id)||w.id;
   return '<div class="fusion-space-window"><button type="button" data-fusion-focus="'+esc(w.id)+'"><span class="fusion-mini-icon"><svg><use href="#i-'+esc(m.icon||'apps')+'"></use></svg></span><span>'+esc(name)+'</span></button><button class="fusion-window-move" type="button" data-fusion-move="'+esc(w.id)+'" title="'+esc(t('move'))+'" aria-label="'+esc(t('move'))+'">→</button></div>';
  }).join(''):'<div class="fusion-space-empty">'+esc(t('empty'))+'</div>';
  return '<section class="fusion-space-card'+(n===active?' selected':'')+'"><button class="fusion-space-select" data-fusion-switch="'+n+'"><span>'+esc(t('label'))+' '+n+'</span><strong>'+esc(n===active?t('current'):t('switch'))+'</strong></button><div class="fusion-space-sample"><div class="fusion-mini-menu"></div>'+Array.from({length:Math.min(items.length,3)},(_,i)=>'<i style="--step:'+i+'"></i>').join('')+'</div><div class="fusion-space-list">'+windows+'</div></section>';
 }).join('');
 overlay.innerHTML='<div class="fusion-overview-inner"><header class="fusion-overview-header"><div><span>AINCFH OS / WORKSPACES</span><h2>'+esc(t('overview'))+'</h2></div><button type="button" data-fusion-close aria-label="'+esc(t('close'))+'">×</button></header><div class="fusion-overview-grid">'+cards+'</div><footer>'+esc(t('spaceInfo'))+'</footer></div>';
}
function showOverview(){
 if(!overlay||!bridge)return;overviewOpen=true;overlay.hidden=false;renderOverview();
}
function closeOverview(){overviewOpen=false;if(overlay)overlay.hidden=true}
function toggleOverview(){overviewOpen?closeOverview():showOverview()}
function option(key,label,values){
 const prefs=bridge?.prefs?.()||{};
 return '<div class="fusion-field"><div class="fusion-field-head"><strong>'+esc(t(label))+'</strong></div><div class="fusion-choice-grid">'+values.map(v=>'<button type="button" data-fusion-set="'+esc(key)+'" data-fusion-value="'+esc(v)+'" aria-pressed="'+(String(prefs[key])===v)+'">'+esc(t(v))+'</button>').join('')+'</div></div>';
}
function closeSnap(){snapId=null;if(snapRoot)snapRoot.hidden=true}
function openSnap(id,button){
 if(!bridge?.prefs?.().snap||innerWidth<=840||!safeId(id)||!getWindows().some(x=>x.id===id)||!button)return false;
 if(snapId===id&&snapRoot&&!snapRoot.hidden){closeSnap();return true}
 if(!snapRoot)return false;
 snapId=id;
 const positions=[['left','snapLeft'],['right','snapRight'],['top-left','snapTL'],['top-right','snapTR'],['bottom-left','snapBL'],['bottom-right','snapBR'],['center','snapCenter'],['maximize','snapMax']];
 snapRoot.innerHTML='<div class="fusion-snap-heading">'+esc(t('snapTitle'))+'</div><div class="fusion-snap-grid">'+positions.map(([key,label])=>
 '<button type="button" data-fusion-snap="'+key+'" aria-label="'+esc(t(label))+'"><span class="fusion-snap-sample" data-snap-preview="'+key+'"><i></i><i></i><i></i><i></i></span><small>'+esc(t(label))+'</small></button>'
 ).join('')+'</div>';
 snapRoot.hidden=false;
 const r=button.getBoundingClientRect(),w=snapRoot.offsetWidth,h=snapRoot.offsetHeight;
 const x=Math.min(innerWidth-w-8,Math.max(8,r.left-w+button.offsetWidth));
 const y=r.bottom+h+8>innerHeight?r.top-h-7:r.bottom+7;
 snapRoot.style.left=Math.max(8,x)+'px';snapRoot.style.top=Math.max(57,y)+'px';
 return true;
}
function renderStudio(){
 const prefs=bridge?.prefs?.()||{},activePreset=prefs.desktopPreset||'fusion',currentAccent=prefs.customAccent||'#D88AFF';
 const presetCards=['fusion','mac','windows','linux'].map(id=>{
  const key=prefs.desktopPreset===id,mini=PRESETS[id];
  return '<button class="fusion-preset-card'+(key?' is-selected':'')+'" type="button" data-fusion-preset="'+id+'" aria-pressed="'+key+'">'+
   '<div class="fusion-preset-stage" data-mini-preset="'+id+'"><div class="fusion-preview-top"></div><div class="fusion-preview-window"><i></i><i></i><i></i><span></span><span></span></div><div class="fusion-preview-dock"><i></i><i></i><i></i><i></i></div></div>'+
   '<span class="fusion-preset-info"><strong>'+esc(t(id))+'</strong><small>'+esc(t(id+'Desc'))+'</small></span><span class="fusion-preset-selected">'+(key?'✓':'→')+'</span></button>';
 }).join('');
 const palette=COLOR_LIST.map(c=>'<button type="button" data-fusion-set="accent" data-fusion-value="'+c.id+'" aria-pressed="'+(prefs.accent===c.id)+'" class="fusion-swatch" style="--swatch:'+c.hex+'" title="'+c.id+'" aria-label="'+c.id+'"><span></span></button>').join('');
 const wallpaper=['hex','aurora','mesh','grid','plain'].map(id=>'<button type="button" data-fusion-set="wallpaperStyle" data-fusion-value="'+id+'" class="fusion-wallpaper-choice" aria-pressed="'+(prefs.wallpaperStyle===id)+'"><span data-mini-wallpaper="'+id+'"></span><strong>'+esc(t(id))+'</strong></button>').join('');
 return '<div class="fusion-studio">'+
 '<div class="fusion-studio-head"><span>AINCFH OS / DESKTOP ENVIRONMENT</span><h2>'+esc(t('studio'))+'<i>.</i></h2><p>'+esc(t('subtitle'))+'</p></div>'+
 '<section class="fusion-section"><header><h3>'+esc(t('presets'))+'</h3><small>'+esc(t(activePreset))+'</small></header><div class="fusion-preset-grid">'+presetCards+'</div></section>'+
 '<section class="fusion-section"><header><h3>'+esc(t('theme'))+'</h3></header>'+
 option('theme','themeMode',['dark','light'])+
 '<div class="fusion-field"><div class="fusion-field-head"><strong>'+esc(t('accent'))+'</strong></div><div class="fusion-swatches">'+palette+'<button type="button" class="fusion-swatch fusion-swatch-custom" data-fusion-set="accent" data-fusion-value="custom" aria-pressed="'+(prefs.accent==='custom')+'" title="'+esc(t('customColor'))+'" aria-label="'+esc(t('customColor'))+'"><span>+</span></button></div></div>'+
 '<div class="fusion-field"><label class="fusion-field-head" for="fusionCustomAccent"><strong>'+esc(t('customColor'))+'</strong></label><div class="fusion-hex-form"><input type="text" id="fusionCustomAccent" inputmode="text" spellcheck="false" maxlength="7" autocomplete="off" placeholder="#D88AFF" value="'+esc(currentAccent)+'" aria-label="'+esc(t('customColor'))+'"/><button type="button" data-fusion-custom-apply>'+esc(t('customApply'))+'</button></div><p>'+esc(t('customHelp'))+'</p></div>'+
 '<div class="fusion-field"><div class="fusion-field-head"><strong>'+esc(t('wallpaper'))+'</strong></div><div class="fusion-wallpaper-grid">'+wallpaper+'</div></div></section>'+
 '<section class="fusion-section"><header><h3>'+esc(t('window'))+'</h3></header>'+
 option('windowControls','controls',['left','right'])+
 option('windowRadius','radius',['compact','balanced','rounded'])+
 option('panelDensity','density',['compact','comfortable'])+
 option('menuBarStyle','menu',['full','compact'])+'</section>'+
 '<section class="fusion-section"><header><h3>'+esc(t('workspaces'))+'</h3></header>'+
 '<div class="fusion-field"><div class="fusion-field-head"><strong>'+esc(t('spacesCount'))+'</strong></div><div class="fusion-choice-grid">'+[1,2,3,4].map(n=>'<button type="button" data-fusion-set="workspaceCount" data-fusion-value="'+n+'" aria-pressed="'+(Number(prefs.workspaceCount)===n)+'">'+n+'</button>').join('')+'</div><p>'+esc(t('spaceInfo'))+'</p></div>'+
 '<div class="fusion-studio-actions"><button type="button" data-fusion-overview>'+esc(t('overview'))+'</button></div><p class="fusion-disclaimer">'+esc(t('fileSafe'))+'</p></section></div>';
}
function apply(){
 const p=bridge?.prefs?.();if(!p)return;
 const root=document.documentElement;
 for(const [key,val] of Object.entries({
  desktopPreset:p.desktopPreset||'fusion',wallpaperStyle:p.wallpaperStyle||'hex',windowControls:p.windowControls||'left',
  windowRadius:p.windowRadius||'balanced',panelDensity:p.panelDensity||'comfortable',menuBarStyle:p.menuBarStyle||'full'
 }))root.dataset[key]=val;
 const custom=/^#[0-9a-fA-F]{6}$/.test(p.customAccent||'')?p.customAccent:'#D88AFF';
 if(p.accent==='custom')root.style.setProperty('--hot',custom);
 else root.style.removeProperty('--hot');
 if(active>count()){active=count();storageSet('aincfh_fusion_active_v12',active)}
 for(const id of Object.keys(assignments)){
  const x=Number(assignments[id]);if(!Number.isInteger(x)||x<1||x>count())assignments[id]=1;
 }
 saveAssignments();
 redrawTop();applyWindowVisibility();
 if(overviewOpen)renderOverview();
}
function applyPreset(id){if(!Object.prototype.hasOwnProperty.call(PRESETS,id))return false;bridge?.preset?.(id,PRESETS[id]);return true}
function attach(b){
 bridge=b;
 if(topNode)return;
 topNode=document.createElement('div');topNode.className='fusion-top-switcher';topNode.setAttribute('role','group');topNode.setAttribute('aria-label',t('workspaces'));
 const menubar=$('.menubar');if(menubar)menubar.append(topNode);
 snapRoot=document.createElement('section');snapRoot.id='fusionSnapPopup';snapRoot.className='fusion-snap-popup';snapRoot.hidden=true;snapRoot.setAttribute('role','dialog');snapRoot.setAttribute('aria-label',t('snapTitle'));document.body.append(snapRoot);
 overlay=document.createElement('section');overlay.id='fusionOverview';overlay.className='fusion-overview';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',t('overview'));
 document.body.append(overlay);
 apply();
}
document.addEventListener('click',e=>{
 const snap=e.target.closest?.('[data-fusion-snap]');
 if(snap){
  if(snapId)bridge?.snapTo?.(snapId,snap.dataset.fusionSnap);
  closeSnap();return;
 }
 if(snapId&&!e.target.closest?.('#fusionSnapPopup,.win-control.layout'))closeSnap();
 const preset=e.target.closest?.('[data-fusion-preset]');if(preset){applyPreset(preset.dataset.fusionPreset);return}
 const set=e.target.closest?.('[data-fusion-set]');if(set){
  const key=set.dataset.fusionSet;
  const value=key==='workspaceCount'?Number(set.dataset.fusionValue):set.dataset.fusionValue;
  bridge?.set?.(key,value);return;
 }
 if(e.target.closest?.('[data-fusion-custom-apply]')){
  const value=$('#fusionCustomAccent')?.value?.trim()||'';
  if(!/^#[0-9a-fA-F]{6}$/.test(value)){bridge?.toast?.(t('invalidColor'));return}
  bridge?.set?.('customAccent',value);return;
 }
 const move=e.target.closest?.('[data-fusion-move]');if(move){
  const next=owned(move.dataset.fusionMove)%count()+1;
  moveWindow(move.dataset.fusionMove,next);return;
 }
 const focus=e.target.closest?.('[data-fusion-focus]');if(focus){
  const id=focus.dataset.fusionFocus;
  switchWorkspace(owned(id));bridge?.focus?.(id);closeOverview();return;
 }
 const button=e.target.closest?.('[data-fusion-switch]');if(button){switchWorkspace(Number(button.dataset.fusionSwitch));return}
 if(e.target.closest?.('[data-fusion-overview]')){toggleOverview();return}
 if(e.target.closest?.('[data-fusion-close]')){closeOverview();return}
 if(overviewOpen&&e.target===overlay)closeOverview();
},false);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&snapId){closeSnap();return}
 if(e.key==='Escape'&&overviewOpen){closeOverview();return}
 const edit=e.target.closest?.('input,textarea,[contenteditable="true"]');
 if(edit||!bridge?.prefs?.().shortcuts)return;
 if(e.ctrlKey&&e.altKey&&!e.shiftKey&&!e.metaKey){
  if(/^[1-4]$/.test(e.key)){e.preventDefault();switchWorkspace(Number(e.key))}
  else if(e.key.toLowerCase()==='m'){e.preventDefault();toggleOverview()}
 }
},true);
window.addEventListener('resize',closeSnap,{passive:true});
window.addEventListener('aincfh:languagechange',()=>{
 redrawTop();if(overviewOpen)renderOverview();
});
window.AincDesktopFusion=Object.freeze({
 attach,apply,applyPreset,renderStudio,registerWindow,forgetWindow,ensureWindow,switchWorkspace,moveWindow,
 showOverview,closeOverview,openSnap,closeSnap,get active(){return active},get count(){return count()},
 get assignments(){return {...assignments}},
 get presets(){return PRESETS}
});
})();
