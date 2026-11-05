/* AincFh OS v13 — Theme Library.
 * Named design profiles only; no documents, tokens, account info or user files.
 * All imports are schema-and-field validated and applied as one transaction.
 */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const KEY='aincfh_theme_library_v13',SCHEMA='aincfh-os-theme-v1',MAX_PROFILES=12;
const DEFAULT_KEYS=['theme','accent','customAccent','wallpaperStyle','wallpaper','glass','contrast','textSize','motion','desktopPreset','windowControls','windowRadius','panelDensity','menuBarStyle','dockMode','dockPosition','dockScale','dockMagnify','dockAutoHide','dockSize','startLayout'];
const ENUMS={
 theme:['dark','light'],accent:['amber','violet','cyan','blue','rose','green','custom'],
 wallpaperStyle:['hex','aurora','mesh','grid','plain'],contrast:['normal','high'],textSize:['compact','normal','large'],
 desktopPreset:['fusion','mac','windows','linux','custom'],windowControls:['left','right'],
 windowRadius:['compact','balanced','rounded'],panelDensity:['compact','comfortable'],
 menuBarStyle:['full','compact'],dockMode:['floating','taskbar'],dockPosition:['bottom','left','right'],
 dockScale:['small','normal','large'],dockSize:['regular','compact'],startLayout:['grid','list']
};
const BOOLEANS=new Set(['wallpaper','glass','motion','dockMagnify','dockAutoHide']);
const tx={
'zh-CN':{title:'主题配置库',sub:'多个完整桌面主题、切换历史和导入导出。不会包含文件、账号或私人数据。',save:'保存当前主题',name:'方案名称',placeholder:'例如：夜间工作区',add:'保存方案',cancel:'取消',apply:'应用',export:'导出',import:'导入配置',remove:'删除',empty:'还没有保存的主题。可从当前桌面创建一套完整方案。',now:'当前主题',profiles:'保存的方案',failure:'主题配置不合法',success:'已导入主题配置',tooMany:'最多保存 12 套主题',duplicate:'已有相同名称的方案',exportAll:'导出配置库',importHelp:'仅导入符合 AincFh OS v1 格式的主题参数，不执行脚本。导入后需要主动点击“应用”。',type:'外观',confirmDelete:'确定删除这个主题配置？',saved:'主题已保存',applied:'主题已应用',removed:'主题已删除',noData:'主题库为空',invalidName:'请输入 1–32 个字符的名称',fileLarge:'配置文件过大',mode:'布局'},
'zh-TW':{title:'主題設定庫',sub:'多組完整桌面主題、切換歷史與匯入匯出。檔案和私人資料不包含在內。',save:'儲存目前主題',name:'方案名稱',placeholder:'例如：夜間工作區',add:'儲存方案',cancel:'取消',apply:'套用',export:'匯出',import:'匯入設定',remove:'刪除',empty:'尚無已儲存主題。可從目前桌面建立。',now:'目前主題',profiles:'已儲存的方案',failure:'主題設定不合法',success:'已匯入主題設定',tooMany:'最多儲存 12 組主題',duplicate:'已有相同名稱的方案',exportAll:'匯出設定庫',importHelp:'僅匯入 AincFh OS v1 主題參數，不執行腳本。需手動點擊套用。',type:'外觀',confirmDelete:'確定刪除此主題？',saved:'主題已儲存',applied:'主題已套用',removed:'主題已刪除',noData:'主題庫是空的',invalidName:'請輸入 1–32 字元名稱',fileLarge:'設定檔太大',mode:'版面'},
'en-US':{title:'Theme Library',sub:'Named desktop profiles, easy switching and import/export. No files or private account data are included.',save:'Save current theme',name:'Profile name',placeholder:'e.g. Night Workspace',add:'Save profile',cancel:'Cancel',apply:'Apply',export:'Export',import:'Import theme',remove:'Delete',empty:'No saved themes yet. Create a complete profile from your current desktop.',now:'Current theme',profiles:'Saved profiles',failure:'Invalid theme file',success:'Theme profile imported',tooMany:'Maximum of 12 themes',duplicate:'Theme name already exists',exportAll:'Export theme collection',importHelp:'Only version 1 AincFh OS design fields are accepted. Scripts are never executed. Apply a profile after import.',type:'Appearance',confirmDelete:'Delete this theme profile?',saved:'Theme profile saved',applied:'Theme profile applied',removed:'Theme profile deleted',noData:'Theme library empty',invalidName:'Use 1–32 characters for the name',fileLarge:'Theme file too large',mode:'Desktop layout'},
'ja-JP':{title:'テーマライブラリ',sub:'複数のデスクトップテーマを保存、切替、インポート・エクスポート。個人ファイルは含みません。',save:'現在のテーマを保存',name:'テーマ名',placeholder:'例：ナイトワークスペース',add:'テーマを保存',cancel:'キャンセル',apply:'適用',export:'エクスポート',import:'インポート',remove:'削除',empty:'保存されたテーマはありません。現在の設定から作成できます。',now:'現在のテーマ',profiles:'保存済みテーマ',failure:'無効なテーマファイルです',success:'テーマを読み込みました',tooMany:'テーマは最大 12 個です',duplicate:'同じ名前のテーマがあります',exportAll:'テーマコレクションを出力',importHelp:'AincFh OS v1 のテーマ項目だけ読み込みます。スクリプトは実行されません。インポート後に適用してください。',type:'外観',confirmDelete:'このテーマを削除しますか？',saved:'テーマを保存しました',applied:'テーマを適用しました',removed:'テーマを削除しました',noData:'テーマはありません',invalidName:'名前は 1〜32 文字にしてください',fileLarge:'ファイルサイズが大きすぎます',mode:'レイアウト'}
};
const T=k=>(tx[window.AincI18n?.locale||'en-US']||tx['en-US'])[k]||k;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let bridge=null,profiles=[],showForm=false;
function validConfig(source){
 if(!source||typeof source!=='object'||Array.isArray(source))return null;
 const data={};
 for(const key of DEFAULT_KEYS){
  const val=source[key];
  if(ENUMS[key]){
   if(typeof val!=='string'||!ENUMS[key].includes(val))return null;data[key]=val;
  }else if(BOOLEANS.has(key)){
   if(typeof val!=='boolean')return null;data[key]=val;
  }else if(key==='customAccent'){
   if(typeof val!=='string'||!/^#[0-9a-fA-F]{6}$/.test(val))return null;data[key]=val.toUpperCase();
  }else return null;
 }
 if(data.dockMode==='taskbar')data.dockPosition='bottom';
 if(data.dockPosition!=='bottom'&&data.dockMode==='taskbar')data.dockMode='floating';
 return data;
}
function sanitizeName(s){return typeof s==='string'&&s.trim().length>=1&&s.trim().length<=32&&!/[<>]/.test(s)?s.trim():null}
function getSnapshot(){const prefs=bridge?.prefs?.()||{};const obj={};for(const k of DEFAULT_KEYS)obj[k]=prefs[k];return validConfig(obj)}
function load(){
 try{
  const raw=JSON.parse(localStorage.getItem(KEY)||'null');
  if(raw?.version!==1||!Array.isArray(raw.profiles))return;
  const names=new Set();
  profiles=raw.profiles.slice(0,MAX_PROFILES).filter(x=>{
   const name=sanitizeName(x?.name),config=validConfig(x?.config);
   if(!name||!config||names.has(name.toLowerCase()))return false;
   names.add(name.toLowerCase());x.name=name;x.config=config;
   return x.id&&typeof x.id==='string'&&/^[a-z0-9-]{1,50}$/.test(x.id);
  });
 }catch(e){profiles=[]}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,profiles}))}catch(e){bridge?.toast?.('Theme storage unavailable')}}
function freshId(){return typeof crypto!=='undefined'&&crypto.randomUUID?'theme-'+crypto.randomUUID().slice(0,18):'theme-'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function create(name){
 name=sanitizeName(name);if(!name)return {ok:false,error:'invalidName'};
 if(profiles.length>=MAX_PROFILES)return{ok:false,error:'tooMany'};
 if(profiles.some(x=>x.name.toLowerCase()===name.toLowerCase()))return{ok:false,error:'duplicate'};
 const config=getSnapshot();if(!config)return{ok:false,error:'failure'};
 const item={id:freshId(),name,config,created:new Date().toISOString()};
 profiles.push(item);save();renderRefresh();return{ok:true,id:item.id};
}
function erase(id){const before=profiles.length;profiles=profiles.filter(x=>x.id!==id);if(before===profiles.length)return false;save();renderRefresh();return true}
function apply(id){const item=profiles.find(x=>x.id===id);if(!item)return false;const cfg=validConfig(item.config);if(!cfg)return false;return Boolean(bridge?.applyTheme?.(cfg))}
function downloadFile(payload,filename){
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function exportProfile(id){
 const item=profiles.find(x=>x.id===id);
 if(!item)return false;
 downloadFile({schema:SCHEMA,version:1,name:item.name,config:item.config},'AincFh-Theme-'+item.name.replace(/[^a-z0-9-_]+/ig,'-').slice(0,32)+'.json');return true;
}
function exportCollection(){
 downloadFile({schema:SCHEMA,version:1,profiles:profiles.map(x=>({name:x.name,config:x.config}))},'AincFh-OS-theme-library.json');return true;
}
function importPayload(raw){
 if(typeof raw!=='string'||raw.length>40000)return{ok:false,error:'fileLarge'};
 let parsed;try{parsed=JSON.parse(raw)}catch(e){return{ok:false,error:'failure'}}
 if(parsed?.schema!==SCHEMA||parsed?.version!==1)return{ok:false,error:'failure'};
 const incoming=Array.isArray(parsed.profiles)?parsed.profiles:[parsed];
 if(!incoming.length||incoming.length>MAX_PROFILES)return{ok:false,error:'failure'};
 const prepared=[],names=new Set(profiles.map(x=>x.name.toLowerCase()));
 for(const x of incoming){
  const name=sanitizeName(x?.name),config=validConfig(x?.config);
  if(!name||!config)return{ok:false,error:'failure'};
  if(names.has(name.toLowerCase()))return{ok:false,error:'duplicate'};
  names.add(name.toLowerCase());prepared.push({id:freshId(),name,config,created:new Date().toISOString()});
 }
 if(profiles.length+prepared.length>MAX_PROFILES)return{ok:false,error:'tooMany'};
 profiles.push(...prepared);save();renderRefresh();return{ok:true,count:prepared.length};
}
function swatch(config){
 const colors={amber:'#ff9f43',violet:'#b293ff',cyan:'#78d3d4',blue:'#68a9ff',rose:'#f58cab',green:'#65cf9f',custom:config.customAccent};
 return colors[config.accent]||'#ff9f43';
}
function render(){
 const current=getSnapshot();
 const tiles=profiles.map(item=>{
  const cfg=item.config,color=swatch(cfg);
  return '<div class="theme-profile-item" data-theme-profile="'+esc(item.id)+'">'+
   '<div class="theme-profile-preview" style="--theme-color:'+esc(color)+'" data-theme-preset="'+esc(cfg.desktopPreset)+'" data-theme-mode="'+esc(cfg.theme)+'"><div class="theme-profile-mini-window"><i></i><i></i></div><span></span></div>'+
   '<div class="theme-profile-info"><strong>'+esc(item.name)+'</strong><small>'+esc(cfg.desktopPreset)+' · '+esc(cfg.theme)+' · '+esc(cfg.wallpaperStyle)+'</small></div>'+
   '<div class="theme-profile-actions"><button type="button" data-theme-action="apply" data-theme-id="'+esc(item.id)+'">'+esc(T('apply'))+'</button><button type="button" data-theme-action="export" data-theme-id="'+esc(item.id)+'" aria-label="'+esc(T('export'))+'">↗</button><button type="button" data-theme-action="delete" data-theme-id="'+esc(item.id)+'" aria-label="'+esc(T('remove'))+'">×</button></div></div>';
 }).join('');
 return '<section class="fusion-section theme-library" aria-label="'+esc(T('title'))+'"><header><h3>'+esc(T('title'))+'</h3><small>'+profiles.length+' / '+MAX_PROFILES+'</small></header>'+
 '<p class="theme-library-sub">'+esc(T('sub'))+'</p>'+
 '<div class="theme-library-controls"><button type="button" data-theme-action="save" class="theme-primary">'+esc(T('save'))+'</button>'+
 '<button type="button" data-theme-action="import">'+esc(T('import'))+'</button>'+
 '<button type="button" data-theme-action="export-all">'+esc(T('exportAll'))+'</button>'+
 '<input id="themeLibraryImport" type="file" accept=".json,application/json" hidden></div>'+
 (showForm?'<form id="themeLibraryForm" class="theme-library-form"><label for="themeLibraryName">'+esc(T('name'))+'</label><input id="themeLibraryName" maxlength="32" autocomplete="off" spellcheck="false" placeholder="'+esc(T('placeholder'))+'" required />'+
 '<button type="submit">'+esc(T('add'))+'</button><button type="button" data-theme-action="cancel">'+esc(T('cancel'))+'</button></form>':'')+
 '<div class="theme-library-items">'+(tiles||'<p class="theme-library-empty">'+esc(T('empty'))+'</p>')+'</div>'+
 '<p class="theme-library-help">'+esc(T('importHelp'))+'</p></section>';
}
function renderRefresh(){if(bridge?.refresh)bridge.refresh()}
function clicked(e){
 const b=e.target.closest?.('[data-theme-action]');
 if(!b)return;
 const a=b.dataset.themeAction,id=b.dataset.themeId;
 switch(a){
 case 'save':showForm=true;renderRefresh();queueMicrotask(()=>$('#themeLibraryName')?.focus());break;
 case 'cancel':showForm=false;renderRefresh();break;
 case 'import':$('#themeLibraryImport')?.click();break;
 case 'export-all':exportCollection();break;
 case 'export':exportProfile(id);break;
 case 'apply':if(apply(id)){bridge?.toast?.(T('applied'));renderRefresh()}else bridge?.toast?.(T('failure'));break;
 case 'delete':if(!profiles.some(x=>x.id===id))return;{
  const modal=document.createElement('div');modal.id='themeDeleteModal';modal.className='theme-delete-backdrop';
  modal.innerHTML='<section class="theme-delete-confirm" role="dialog" aria-modal="true"><h3>'+esc(T('confirmDelete'))+'</h3><div><button type="button" data-theme-delete="cancel">'+esc(T('cancel'))+'</button><button type="button" data-theme-delete="confirm" class="danger">'+esc(T('remove'))+'</button></div></section>';
  modal.dataset.id=id;document.body.appendChild(modal);break;
 }
 }
}
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-theme-action]')){clicked(e);return}
 const b=e.target.closest?.('[data-theme-delete]');if(!b)return;
 const modal=$('#themeDeleteModal');const id=modal?.dataset.id||'';
 if(b.dataset.themeDelete==='confirm'&&erase(id))bridge?.toast?.(T('removed'));
 modal?.remove();
},false);
document.addEventListener('submit',e=>{
 if(e.target.id!=='themeLibraryForm')return;
 e.preventDefault();const name=$('#themeLibraryName')?.value||'';
 const r=create(name);if(r.ok){showForm=false;bridge?.toast?.(T('saved'));renderRefresh()}
 else bridge?.toast?.(T(r.error));
},false);
document.addEventListener('change',async e=>{
 if(e.target.id!=='themeLibraryImport')return;
 const file=e.target.files?.[0];e.target.value='';
 if(!file)return;
 if(file.size>40000){bridge?.toast?.(T('fileLarge'));return}
 try{const raw=await file.text(),r=importPayload(raw);bridge?.toast?.(T(r.ok?'success':r.error))}catch(error){bridge?.toast?.(T('failure'))}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#themeDeleteModal')?.remove()});
load();
window.AincThemeLibrary={attach(b){bridge=b},render,create,apply,erase,importPayload,exportProfile,exportCollection,
 get profiles(){return profiles.map(x=>({id:x.id,name:x.name,config:{...x.config}}))},
 get snapshot(){return getSnapshot()},
 get schema(){return SCHEMA}};
})();
