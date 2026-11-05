/* AincFh OS 13 · Desktop Surface
 * A true desktop shortcut surface backed by the same local Files store.
 * No host filesystem permissions, no fake OS processes or clipboard interception.
 */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='aincfh_desktop_surface_v13',VALID_APPS=new Set(['files','projects','settings','notes','paint','terminal','tasks','apps','clock','calculator','taskmanager','activity','stack','about','contact']);
const DEFAULT_IDS=['app:files','app:projects','app:settings','trash'];
const LINES={
'zh-CN':{files:'文件管理',projects:'项目',settings:'系统设置',notes:'便笺',paint:'绘图',terminal:'终端',tasks:'任务',apps:'应用中心',clock:'时钟',calculator:'计算器',taskmanager:'任务管理器',activity:'活动',stack:'技术栈',about:'关于',contact:'联系',trash:'回收站',desktop:'桌面',open:'打开',newFile:'新建文档',newFolder:'新建文件夹',name:'名称',rename:'重命名',remove:'从桌面移除',trashItem:'移入回收站',pin:'创建桌面快捷方式',size:'图标大小',small:'小',medium:'中',large:'大',sort:'整理桌面',choose:'应用快捷方式',confirm:'确定',cancel:'取消',exists:'桌面已经有该快捷方式',invalid:'名称无效',moved:'已放入回收站',newItem:'新建',created:'已创建',removeConfirm:'确定将文件移入回收站？',shortcuts:'桌面快捷方式',empty:'桌面为空',nameHelp:'文件名最多 80 个字符，不支持斜杠。',file:'文档',folder:'文件夹',desktopSettings:'桌面设置'},
'zh-TW':{files:'檔案管理',projects:'專案',settings:'系統設定',notes:'便箋',paint:'繪圖',terminal:'終端機',tasks:'工作',apps:'應用程式中心',clock:'時鐘',calculator:'計算機',taskmanager:'工作管理員',activity:'活動',stack:'技術',about:'關於',contact:'聯絡',trash:'資源回收筒',desktop:'桌面',open:'開啟',newFile:'新增文件',newFolder:'新增資料夾',name:'名稱',rename:'重新命名',remove:'從桌面移除',trashItem:'移至資源回收筒',pin:'建立桌面捷徑',size:'圖示大小',small:'小',medium:'中',large:'大',sort:'整理桌面',choose:'應用程式捷徑',confirm:'確定',cancel:'取消',exists:'桌面已有該捷徑',invalid:'名稱無效',moved:'已移至資源回收筒',newItem:'新增',created:'已建立',removeConfirm:'確定將檔案移至資源回收筒？',shortcuts:'桌面捷徑',empty:'桌面沒有項目',nameHelp:'名稱最多 80 個字元，不支援斜線。',file:'文件',folder:'資料夾',desktopSettings:'桌面設定'},
'en-US':{files:'Files',projects:'Projects',settings:'Preferences',notes:'Notes',paint:'Paint',terminal:'Terminal',tasks:'Tasks',apps:'App Center',clock:'Clock',calculator:'Calculator',taskmanager:'Task Manager',activity:'Activity',stack:'Tech Stack',about:'About',contact:'Contact',trash:'Trash',desktop:'Desktop',open:'Open',newFile:'New document',newFolder:'New folder',name:'Name',rename:'Rename',remove:'Remove from desktop',trashItem:'Move to Trash',pin:'Create desktop shortcut',size:'Icon size',small:'Small',medium:'Medium',large:'Large',sort:'Arrange icons',choose:'App shortcut',confirm:'Confirm',cancel:'Cancel',exists:'Shortcut is already on this desktop',invalid:'Invalid name',moved:'Moved to Trash',newItem:'New',created:'Created',removeConfirm:'Move this file to Trash?',shortcuts:'Desktop shortcuts',empty:'No desktop items',nameHelp:'Maximum 80 characters. Slashes are not allowed.',file:'Document',folder:'Folder',desktopSettings:'Desktop settings'},
'ja-JP':{files:'ファイル',projects:'プロジェクト',settings:'設定',notes:'メモ',paint:'ペイント',terminal:'ターミナル',tasks:'タスク',apps:'アプリセンター',clock:'時計',calculator:'計算機',taskmanager:'タスクマネージャー',activity:'アクティビティ',stack:'技術',about:'概要',contact:'連絡先',trash:'ゴミ箱',desktop:'デスクトップ',open:'開く',newFile:'新規ドキュメント',newFolder:'新規フォルダー',name:'名前',rename:'名前の変更',remove:'デスクトップから削除',trashItem:'ゴミ箱へ移動',pin:'デスクトップにショートカット作成',size:'アイコンサイズ',small:'小',medium:'中',large:'大',sort:'アイコンを整列',choose:'アプリのショートカット',confirm:'決定',cancel:'キャンセル',exists:'既にショートカットが存在します',invalid:'無効な名前',moved:'ゴミ箱へ移動しました',newItem:'新規',created:'作成しました',removeConfirm:'ファイルをゴミ箱に移動しますか？',shortcuts:'デスクトップショートカット',empty:'項目はありません',nameHelp:'最大80文字、スラッシュは使えません。',file:'ドキュメント',folder:'フォルダー',desktopSettings:'デスクトップ設定'}
};
const tr=k=>(LINES[window.AincI18n?.locale||'en-US']||LINES['en-US'])[k]||k;
const nameFor=(record,items)=>record.kind==='app'?tr(record.app):record.kind==='trash'?tr('trash'):items.find(x=>x.id===record.file)?.name||tr('file');
let bridge=null,layer=null,menu=null,modal=null,selected=null,dragging=false,applying=false,refreshQueued=false,seenStart=false,lastSignature='';
let data={version:1,records:[],grid:true,iconSize:'medium',show:true};
try{
 const raw=JSON.parse(localStorage.getItem(KEY)||'null');
 if(raw&&raw.version===1&&Array.isArray(raw.records)){
  data.grid=raw.grid!==false;
  data.iconSize=['small','medium','large'].includes(raw.iconSize)?raw.iconSize:'medium';
  data.show=raw.show!==false;
  const distinct=new Set();
  data.records=raw.records.filter(x=>{
   if(!x||typeof x.id!=='string'||distinct.has(x.id))return false;
   const allowed=x.id==='trash'||x.id.startsWith('app:')&&VALID_APPS.has(x.id.slice(4))||x.id.startsWith('file:')&&/^[\w-]{1,120}$/.test(x.id.slice(5));
   if(allowed)distinct.add(x.id);return allowed;
  }).slice(0,48).map(x=>({id:x.id,col:Math.max(0,Math.min(14,Number(x.col)||0)),row:Math.max(0,Math.min(14,Number(x.row)||0))}));
 }
}catch(e){}
if(!data.records.length)data.records=DEFAULT_IDS.map((id,i)=>({id,col:0,row:i}));
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){bridge?.toast?.('Browser storage unavailable')}}
function createRecord(id,col,row){
 if(data.records.some(x=>x.id===id))return false;
 const cell=findCell(col,row);data.records.push({id,...cell});save();render();return true;
}
function cols(){return Math.max(1,Math.min(7,Math.floor((layer?.clientWidth||900)/108)-2))}
function rows(){const h=layer?.clientHeight||720;return Math.max(2,Math.min(9,Math.floor((h-115)/91)))}
function findCell(col=0,row=0,skip=null){
 const cc=cols(),rr=rows(),taken=new Set(data.records.filter(x=>x.id!==skip).map(x=>x.col+':'+x.row));
 const a=Math.max(0,Math.min(cc-1,Math.round(col))),b=Math.max(0,Math.min(rr-1,Math.round(row)));
 if(!taken.has(a+':'+b))return{col:a,row:b};
 for(let c=0;c<cc;c++)for(let r=0;r<rr;r++)if(!taken.has(c+':'+r))return{col:c,row:r};
 return{col:a,row:b};
}
function wItems(){return bridge?.files?.listItems?.()||[]}
function render(){
 if(!layer||applying)return;
 // Desktop is a real Files directory: every file/folder created there appears
 // automatically without duplicating the document or its content in shortcuts.
 const desktopItems=bridge?.files?.listDesktopItems?.()||[];
 let added=false;
 for(const item of desktopItems){
  const id='file:'+item.id;
  if(!data.records.some(x=>x.id===id)){
   const cell=findCell(0,data.records.length);
   data.records.push({id,...cell});added=true;
  }
 }
 if(added)save();
 const items=wItems(),valid=new Set(items.map(x=>x.id)),ncols=cols(),nrows=rows();
 const rendered=data.records.filter(rec=>{
  if(rec.id.startsWith('file:')&&!valid.has(rec.id.slice(5)))return false;
  return true;
 }).slice(0,ncols*nrows);
 const names=new Map(items.map(x=>[x.id,x.name+':'+x.type]));
 const signature=JSON.stringify([window.AincI18n?.locale||'en-US',data.show,data.iconSize,ncols,nrows,selected,
  rendered.map(x=>[x.id,x.col,x.row,x.id.startsWith('file:')?names.get(x.id.slice(5)):null])]);
 if(signature===lastSignature)return;
 lastSignature=signature;
 const iconFor=(r,i)=>{
  const item=r.id.startsWith('file:')?items.find(x=>x.id===r.id.slice(5)):null;
  if(item?.type==='folder')return 'folder';
  if(item?.type==='link')return 'globe';
  if(item?.type==='image')return 'paint';
  if(item?.type==='text')return 'note';
  if(r.id==='trash')return 'trash-2';
  return ({files:'folder',projects:'folder',settings:'settings',notes:'note',paint:'paint',terminal:'terminal',tasks:'checklist',apps:'apps',clock:'clock',calculator:'calculator',taskmanager:'monitor',activity:'bell',stack:'code',about:'user',contact:'mail'})[r.id.slice(4)]||'apps';
 };
 layer.hidden=!data.show;
 layer.dataset.iconSize=data.iconSize;
 layer.innerHTML=rendered.map((r,i)=>{
  const kind=r.id.startsWith('file:')?'file':r.id==='trash'?'trash':'app';
  const app=kind==='app'?r.id.slice(4):null;
  const col=Math.min(ncols-1,Math.max(0,r.col)),row=Math.min(nrows-1,Math.max(0,r.row));
  const glyph=iconFor(r,i);
  return '<button type="button" class="desktop-icon '+(selected===r.id?'is-selected':'')+'" data-desktop-item="'+esc(r.id)+'" data-desktop-kind="'+kind+'"'+(app?' data-desktop-app="'+app+'"':'')+' style="--desk-col:'+col+';--desk-row:'+row+'" title="'+esc(nameFor(kind==='app'?{kind,app}:kind==='trash'?{kind}:{kind,file:r.id.slice(5)},items))+'" aria-label="'+esc(nameFor(kind==='app'?{kind,app}:kind==='trash'?{kind}:{kind,file:r.id.slice(5)},items))+'"><span class="desktop-icon-art">'+
  '<svg aria-hidden="true"><use href="#i-'+glyph+'"></use></svg></span><span class="desktop-icon-label">'+esc(nameFor(kind==='app'?{kind,app}:kind==='trash'?{kind}:{kind,file:r.id.slice(5)},items))+'</span></button>';
 }).join('');
}
function schedule(){if(refreshQueued)return;refreshQueued=true;queueMicrotask(()=>{refreshQueued=false;render()})}
function open(id){
 if(id==='trash'){bridge?.files?.openTrash?.();return}
 if(id.startsWith('app:')){if(VALID_APPS.has(id.slice(4)))bridge?.open?.(id.slice(4));return}
 if(id.startsWith('file:'))bridge?.files?.openItemById?.(id.slice(5));
}
function arrange(){
 const cc=cols(),rr=rows();
 data.records.forEach((r,i)=>{r.col=Math.floor(i/rr)%cc;r.row=i%rr});
 save();render();
}
function renderSettings(){
 const on=data.show;
 return '<section class="fusion-section desktop-options" aria-label="'+esc(tr('shortcuts'))+'">'+
 '<header><h3>'+esc(tr('shortcuts'))+'</h3><small>Desktop / Files</small></header>'+
 '<div class="fusion-choice-grid">'+
 '<button type="button" data-desktop-option="show" data-desktop-value="on" aria-pressed="'+on+'">'+esc(tr('shortcuts'))+' · '+esc(on?'ON':'OFF')+'</button>'+
 '<button type="button" data-desktop-option="arrange">'+esc(tr('sort'))+'</button>'+
 '</div><div class="fusion-field"><div class="fusion-field-head"><strong>'+esc(tr('size'))+'</strong></div>'+
 '<div class="fusion-choice-grid">'+['small','medium','large'].map(n=>'<button type="button" data-desktop-option="iconSize" data-desktop-value="'+n+'" aria-pressed="'+(data.iconSize===n)+'">'+esc(tr(n))+'</button>').join('')+'</div></div>'+
 '<p class="fusion-disclaimer">'+esc(tr('desktop'))+' · Files / Notes / Trash — local browser storage only. Double-click opens; drag to arrange; right-click for commands.</p>'+
 '</section>';
}
function setOption(key,value){
 if(key==='grid')data.grid=Boolean(value);
 if(key==='show')data.show=Boolean(value);
 if(key==='iconSize'&&['small','medium','large'].includes(value))data.iconSize=value;
 save();render();return true;
}
function pinFile(id){
 const rec='file:'+id;
 if(!wItems().some(x=>x.id===id))return false;
 if(!createRecord(rec,0,data.records.length))bridge?.toast?.(tr('exists'));
 return true;
}
function pinApp(id){
 if(!VALID_APPS.has(id))return false;
 if(!createRecord('app:'+id,0,data.records.length))bridge?.toast?.(tr('exists'));
 return true;
}
function remove(id){data.records=data.records.filter(x=>x.id!==id);if(selected===id)selected=null;save();render()}
function closeMenu(){menu?.remove();menu=null}
function cancelModal(){modal?.remove();modal=null}
function addMenu(x,y,id=null){
 closeMenu();cancelModal();
 const file=id?.startsWith('file:'),builtin=id==='trash'||id?.startsWith('app:');
 const act=(key,label)=>'<button type="button" data-desktop-menu="'+key+'">'+esc(label)+'</button>';
 const items=id?act('open',tr('open'))+(file?act('rename',tr('rename'))+act('trash',tr('trashItem')):'')+act('remove',tr('remove')):
 act('newFile',tr('newFile'))+act('newFolder',tr('newFolder'))+'<div class="desktop-menu-rule"></div>'+
 act('shortcut',tr('choose'))+act('sort',tr('sort'))+act('settings',tr('desktopSettings'));
 menu=document.createElement('div');menu.id='osDesktopSurfaceMenu';menu.className='desktop-surface-menu';
 menu.dataset.item=id||'';
 menu.innerHTML='<div class="desktop-menu-kicker">AINCFH OS / '+esc(tr('desktop'))+'</div>'+items;
 document.body.append(menu);
 const w=menu.offsetWidth||206,h=menu.offsetHeight||280;
 menu.style.left=Math.min(innerWidth-w-8,Math.max(8,x))+'px';
 menu.style.top=Math.min(innerHeight-h-8,Math.max(55,y))+'px';
}
function dialog(action,id){
 cancelModal();closeMenu();
 const file=id?.startsWith('file:')?wItems().find(x=>x.id===id.slice(5)):null;
 const label=action==='newFile'?tr('newFile'):action==='newFolder'?tr('newFolder'):action==='rename'?tr('rename'):tr('choose');
 const apps=['files','notes','paint','terminal','tasks','clock','calculator','projects','settings','taskmanager','apps','about','contact','stack','activity'];
 modal=document.createElement('div');modal.id='osDesktopDialog';modal.className='desktop-dialog-backdrop';
 modal.innerHTML='<form class="desktop-dialog" id="desktopDialogForm" aria-modal="true" role="dialog" aria-label="'+esc(label)+'"><span class="desktop-dialog-kicker">AINCFH OS / DESKTOP</span><h2>'+esc(label)+'</h2>'+
 (action==='shortcut'?'<label for="desktopDialogSelect">'+esc(tr('choose'))+'</label><select id="desktopDialogSelect" name="app">'+apps.map(x=>'<option value="'+x+'">'+esc(tr(x))+'</option>').join('')+'</select>':
 action==='trash'?'<p>'+esc(tr('removeConfirm'))+'</p>':
 '<label for="desktopDialogInput">'+esc(tr('name'))+'</label><input id="desktopDialogInput" name="name" maxlength="80" spellcheck="false" autocomplete="off" required value="'+esc(file?.name||'')+'"/><p>'+esc(tr('nameHelp'))+'</p>')+
 '<div class="desktop-dialog-actions"><button type="button" data-desktop-dialog-cancel>'+esc(tr('cancel'))+'</button><button type="submit" class="primary">'+esc(tr('confirm'))+'</button></div></form>';
 modal.dataset.action=action;modal.dataset.item=id||'';
 document.body.append(modal);
 $('#desktopDialogInput',modal)?.focus();
}
function handleMenuAction(key,id){
 switch(key){
 case 'open':open(id);break;
 case 'newFile':case 'newFolder':case 'rename':case 'shortcut':case 'trash':dialog(key,id);return;
 case 'remove':remove(id);break;
 case 'sort':arrange();break;
 case 'settings':bridge?.open?.('settings');bridge?.showDesktopSettings?.();break;
 }
 closeMenu();
}
function onForm(e){
 if(e.target.id!=='desktopDialogForm'||!modal)return;
 e.preventDefault();
 const action=modal.dataset.action,id=modal.dataset.item;
 const name=$('#desktopDialogInput',modal)?.value?.trim()||'';
 let result=false;
 if(action==='newFile'||action==='newFolder')result=bridge?.files?.createDesktopItem?.(action==='newFile'?'text':'folder',name);
 if(action==='rename')result=bridge?.files?.renameItemById?.(id.slice(5),name);
 if(action==='trash')result=bridge?.files?.moveItemToTrash?.(id.slice(5));
 if(action==='shortcut')result=pinApp($('#desktopDialogSelect',modal)?.value);
 if(!result){bridge?.toast?.(tr('invalid'));return}
 cancelModal();schedule();
 bridge?.toast?.(tr(action==='trash'?'moved':'created'));
}
function bind(){
 document.addEventListener('click',e=>{
  const pref=e.target.closest?.('[data-desktop-option]');
  if(pref){
   const k=pref.dataset.desktopOption;
   if(k==='arrange')arrange();
   else if(k==='show')setOption('show',pref.dataset.desktopValue!=='off'?!data.show:false);
   else if(k==='iconSize')setOption('iconSize',pref.dataset.desktopValue);
   bridge?.showDesktopSettings?.();
   return;
  }
  if(e.target.closest?.('[data-desktop-dialog-cancel]')){cancelModal();return}
  const menuButton=e.target.closest?.('[data-desktop-menu]');
  if(menuButton){handleMenuAction(menuButton.dataset.desktopMenu,menu?.dataset.item||null);return}
  const tile=e.target.closest?.('[data-desktop-item]');
  if(tile){if(dragging){dragging=false;return}selected=tile.dataset.desktopItem;for(const x of $('.desktop-icon',layer))x.classList.toggle('is-selected',x.dataset.desktopItem===selected);return}
  if(!e.target.closest?.('#osDesktopSurfaceMenu'))closeMenu();
  if(!e.target.closest?.('#osDesktopDialog')){if(selected){selected=null;schedule()}}
 },false);
 document.addEventListener('dblclick',e=>{
  const tile=e.target.closest?.('[data-desktop-item]');
  if(tile){e.preventDefault();e.stopPropagation();open(tile.dataset.desktopItem)}
 },true);
 document.addEventListener('contextmenu',e=>{
  if(e.target.closest?.('.os-window,.dock,.os-start-panel,.os-control-center,.fusion-overview'))return;
  if(!e.target.closest?.('#desktop'))return;
  e.preventDefault();e.stopImmediatePropagation();
  const tile=e.target.closest?.('[data-desktop-item]');
  const id=tile?.dataset.desktopItem||null;
  if(id){selected=id;for(const x of $('.desktop-icon',layer))x.classList.toggle('is-selected',x.dataset.desktopItem===selected)}
  addMenu(e.clientX,e.clientY,id);
 },true);
 document.addEventListener('pointerdown',e=>{
  const tile=e.target.closest?.('[data-desktop-item]');
  if(!tile||e.button!==0||e.pointerType==='touch')return;
  const target=tile,id=tile.dataset.desktopItem;
  const startX=e.clientX,startY=e.clientY;
  let moved=false;
  const capture=e.pointerId;
  function move(ev){
   if(ev.pointerId!==capture)return;
   const dx=ev.clientX-startX,dy=ev.clientY-startY;
   if(!moved&&Math.abs(dx)+Math.abs(dy)<7)return;
   moved=true;dragging=true;target.classList.add('dragging');
   target.style.transform='translate('+dx+'px,'+dy+'px)';
  }
  function end(ev){
   if(ev.pointerId!==capture)return;
   document.removeEventListener('pointermove',move);
   document.removeEventListener('pointerup',end);
   document.removeEventListener('pointercancel',end);
   if(!moved)return;
   const dx=ev.clientX-startX,dy=ev.clientY-startY;
   const rec=data.records.find(x=>x.id===id);if(!rec)return;
   const cc=cols(),rr=rows();
   const col=Math.min(cc-1,Math.max(0,Math.round(rec.col-dx/94)));
   const row=Math.min(rr-1,Math.max(0,Math.round(rec.row+dy/89)));
   const occupied=data.records.find(x=>x.id!==id&&x.col===col&&x.row===row);
   if(occupied){occupied.col=rec.col;occupied.row=rec.row}
   rec.col=col;rec.row=row;
   save();schedule();
   queueMicrotask(()=>{dragging=false});
  }
  document.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('pointerup',end,{passive:true});
  document.addEventListener('pointercancel',end,{passive:true});
 },true);
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeMenu();cancelModal();return}
  if(e.target.closest?.('input,textarea,select,[contenteditable]'))return;
  const focused=e.target.closest?.('[data-desktop-item]');
  if(focused&&e.key==='Enter'){e.preventDefault();open(focused.dataset.desktopItem)}
  if(focused&&e.key==='Delete'&&focused.dataset.desktopItem.startsWith('file:')){e.preventDefault();dialog('trash',focused.dataset.desktopItem)}
 },true);
 document.addEventListener('submit',onForm,false);
 window.addEventListener('aincfh:workspace-updated',schedule,{passive:true});
 window.addEventListener('aincfh:languagechange',schedule,{passive:true});
 window.addEventListener('resize',schedule,{passive:true});
}
function init(){
 if(layer||!$('#desktop'))return;
 layer=document.createElement('div');layer.id='osDesktopIcons';layer.className='desktop-icons';
 layer.setAttribute('role','group');layer.setAttribute('aria-label',tr('shortcuts'));
 $('#desktop').append(layer);bind();render();
 if(bridge?.files?.ready)bridge.files.ready.then(schedule);
}
function attach(b){bridge=b;init();schedule()}
window.AincDesktopSurface={attach,render:schedule,renderSettings,arrange,pinFile,pinApp,remove,setOption,
 get state(){return JSON.parse(JSON.stringify(data))},get count(){return data.records.length}};
})();
