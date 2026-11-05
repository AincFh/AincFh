/* AincFh OS locale service v10 — browser detection, explicit override,
   live UI translation and locale-aware number/date formatting.
   No external translation service, no translation of user-generated documents. */
(function(){
'use strict';
const SUPPORTED=Object.freeze([
  {id:'zh-CN',name:'简体中文',native:'简体中文',short:'简'},
  {id:'zh-TW',name:'繁體中文',native:'繁體中文',short:'繁'},
  {id:'en-US',name:'English',native:'English',short:'EN'},
  {id:'ja-JP',name:'日本語',native:'日本語',short:'日'}
]);
const catalog=window.AincCatalog?.entries||Object.create(null);
const ui=window.AincCatalog?.ui||{};
const allowed=new Set(SUPPORTED.map(x=>x.id));
let mode='auto',current='en-US',scheduled=false,observer=null;
const lastText=new WeakMap(),lastAttrs=new WeakMap();
const ATTRS=['placeholder','title','aria-label','alt'];
const IGNORED='script,style,svg,noscript,canvas,textarea,pre,code,kbd,[contenteditable],[data-i18n-skip],#typeText,#menuClock,#suClockTime,#suTimer,#suStopwatch,#fsNoteBody,#fsNoteTitle,#fsName,#fsSearch,#suTaskName,#suTaskDue,#suCalcExpr,#paletteInput,#suAppSearch,.fs-md-preview,.fs-notelist,.fs-snippet,.terminal-output,.terminal-history,.su-task-row,.fs-activity-log,.su-calc-history,.fs-preview-image';
function readMode(){try{const saved=localStorage.getItem('aincfh_language');return allowed.has(saved)?saved:'auto'}catch{return'auto'}}
function normalize(lang){
 const x=String(lang||'').trim().toLowerCase().replace(/_/g,'-');
 if(x==='zh-tw'||x==='zh-hk'||x==='zh-mo'||x.startsWith('zh-hant'))return'zh-TW';
 if(x==='zh'||x==='zh-cn'||x==='zh-sg'||x.startsWith('zh-hans'))return'zh-CN';
 if(x==='ja'||x.startsWith('ja-'))return'ja-JP';
 if(x==='en'||x.startsWith('en-'))return'en-US';
 return null;
}
function detect(){
 const list=[...(navigator.languages||[]),navigator.language].filter(Boolean);
 for(const lang of list){const mapped=normalize(lang);if(mapped)return mapped}
 return'en-US';
}
function resolve(){return mode==='auto'?detect():mode}
function isIgnored(node){
 const e=node.nodeType===1?node:node.parentElement;
 return !e||Boolean(e.closest?.(IGNORED));
}
function translated(value){
 const source=String(value||''),match=source.match(/^(\s*)([\s\S]*?)(\s*)$/);
 if(!match)return source;
 const core=match[2],entry=catalog[core];
 if(entry&&entry[current])return match[1]+entry[current]+match[3];
 const dynamic=dynamicTranslations(core);
 return dynamic===null?source:match[1]+dynamic+match[3];
}
function dynamicTranslations(s){
 let m=s.match(/^(\d+)\s+OF\s+(\d+)\s+REGISTERED APPS\s*·\s*BROWSER RUNTIME$/i);
 if(m)return ({
   'zh-CN':m[1]+' / '+m[2]+' 个已注册应用 · 浏览器运行',
   'zh-TW':m[1]+' / '+m[2]+' 個已註冊應用程式 · 瀏覽器執行',
   'en-US':s,
   'ja-JP':m[1]+' / '+m[2]+' 登録済みアプリ · ブラウザー実行'
 })[current];
 m=s.match(/^(\d+)\s+item\(s\)\s*·\s*(\d+)\s+in workspace$/i);
 if(m)return ({'zh-CN':m[1]+' 项 · 工作区共 '+m[2]+' 项','zh-TW':m[1]+' 項 · 工作區共有 '+m[2]+' 項','en-US':m[1]+' items · '+m[2]+' in workspace','ja-JP':m[1]+' 件 · ワークスペース '+m[2]+' 件'})[current];
 m=s.match(/^(\d+)\s+chars?\s*·\s*(\d+)\s+words?$/i);
 if(m)return ({'zh-CN':m[1]+' 字符 · '+m[2]+' 词','zh-TW':m[1]+' 字元 · '+m[2]+' 詞','en-US':m[1]+' chars · '+m[2]+' words','ja-JP':m[1]+' 文字 · '+m[2]+' 語'})[current];
 m=s.match(/^(\d+)\s+characters?$/i);
 if(m)return ({'zh-CN':m[1]+' 个字符','zh-TW':m[1]+' 個字元','en-US':s,'ja-JP':m[1]+' 文字'})[current];
 m=s.match(/^DOCUMENTS\s*\/\s*(\d+)$/i);
 if(m)return ({'zh-CN':'文档 / '+m[1],'zh-TW':'文件 / '+m[1],'en-US':s,'ja-JP':'ドキュメント / '+m[1]})[current];
 m=s.match(/^(\d+)\s+FILES?\s*$/i);
 if(m)return ({'zh-CN':m[1]+' 个文件','zh-TW':m[1]+' 個檔案','en-US':s,'ja-JP':m[1]+' ファイル'})[current];
 m=s.match(/^SYSTEM PREFERENCES\s*\/\s*(\d+)$/i);
 if(m)return ({'zh-CN':'系统设置 / '+m[1],'zh-TW':'系統設定 / '+m[1],'en-US':s,'ja-JP':'システム設定 / '+m[1]})[current];
 m=s.match(/^(\d+)\s*(?:of|OF)\s*(\d+)\s*registered apps$/i);
 if(m)return ({'zh-CN':m[1]+' / '+m[2]+' 个已注册应用','zh-TW':m[1]+' / '+m[2]+' 個已註冊應用程式','en-US':s,'ja-JP':m[1]+' / '+m[2]+' 登録済みアプリ'})[current];
 return null;
}
function translateText(node){
 if(!node||isIgnored(node))return;
 const now=node.nodeValue;
 if(!now||!now.trim()||now.length>950)return;
 const old=lastText.get(node),source=(old&&old.rendered===now)?old.source:now;
 const next=translated(source);
 if(next!==now)node.nodeValue=next;
 lastText.set(node,{source,rendered:next});
}
function translateElement(el){
 if(!el||isIgnored(el))return;
 const record=lastAttrs.get(el)||Object.create(null);
 for(const attr of ATTRS){
  if(!el.hasAttribute(attr))continue;
  const now=el.getAttribute(attr),old=record[attr],source=old&&old.rendered===now?old.source:now;
  const next=translated(source);
  if(now!==next)el.setAttribute(attr,next);
  record[attr]={source,rendered:next};
 }
 lastAttrs.set(el,record);
}
function translateTree(root){
 if(!root)return;
 if(root.nodeType===3){translateText(root);return}
 if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
 if(root.nodeType===1){translateElement(root);if(isIgnored(root))return}
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 let node;
 while(node=walker.nextNode()){
  if(node.nodeType===3)translateText(node);else translateElement(node);
 }
}
function schedule(nodes){
 if(scheduled)return;
 scheduled=true;
 queueMicrotask(()=>{scheduled=false;for(const node of nodes)translateTree(node)});
}
function processMutations(mutations){
 const roots=new Set();
 for(const m of mutations){
  if(m.type==='characterData')roots.add(m.target);
  else if(m.type==='attributes')roots.add(m.target);
  else for(const n of m.addedNodes){if(n.nodeType===1||n.nodeType===3)roots.add(n)}
 }
 if(roots.size)schedule(roots);
}
function set(modeId){
 if(modeId!=='auto'&&!allowed.has(modeId))return false;
 mode=modeId;current=resolve();
 try{localStorage.setItem('aincfh_language',mode)}catch(e){}
 document.documentElement.lang=current;
 document.documentElement.dataset.locale=current;
 document.documentElement.dataset.languageMode=mode;
 document.title=translated('AincFh OS · Design / Code / Systems');
 refresh();
 window.dispatchEvent(new CustomEvent('aincfh:languagechange',{detail:{mode,locale:current}}));
 return true;
}
function refresh(root=document){
 translateTree(root);
 document.documentElement.lang=current;
 document.documentElement.dataset.locale=current;
}
function formatDate(value,options){try{return new Intl.DateTimeFormat(current,options).format(value)}catch{return String(value)}}
function formatNumber(value,options){try{return new Intl.NumberFormat(current,options).format(value)}catch{return String(value)}}
function uiText(key){return ui[key]?.[current]||key}
mode=readMode();current=resolve();
document.documentElement.lang=current;
document.documentElement.dataset.locale=current;
document.documentElement.dataset.languageMode=mode;
document.title=translated('AincFh OS · Design / Code / Systems');
window.AincI18n=Object.freeze({
 supported:SUPPORTED,normalize,detect,
 get locale(){return current},
 get mode(){return mode},
 set,refresh,t:translated,ui:uiText,formatDate,formatNumber
});
refresh();
observer=new MutationObserver(processMutations);
observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
})();
