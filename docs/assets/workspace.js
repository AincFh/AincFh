/* AincFh OS Workspace Core — local, private, versioned document store.
   A web app workspace, NOT direct access to computer files or cloud accounts. */
(function () {
  'use strict';
  var KEY='aincfh_workspace_v1',MAX_BYTES=7500000,MAX_FILES=800,bridge=null,wasModified=false,storageError='';
  var esc=function(v){return String(v===undefined?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
  var now=function(){return new Date().toISOString()};
  var uid=function(){return typeof crypto!=='undefined' && crypto.randomUUID?crypto.randomUUID():'f-'+Date.now()+'-'+Math.random().toString(36).slice(2,9)};
  function defaults(){
    var t=now(),folder=function(id,name){return{id:id,name:name,type:'folder',parent:'root',body:'',url:'',created:t,modified:t,deleted:false}};
    var file=function(id,parent,name,body){return{id:id,name:name,type:'text',parent:parent,body:body,url:'',created:t,modified:t,deleted:false}};
    return{version:1,items:[
      folder('workspace','Workspace'),folder('notes','Notes'),folder('links','Links'),folder('desktop','Desktop'),
      file('welcome','workspace','Start Here.txt','Welcome to AincFh OS\n\nThis is an interactive browser workspace — not a real operating system.\n\nCreate files and folders in Files. Double-click a text document to edit it in Notes. Your changes stay in this browser unless you export them.\n\nShortcuts\nCtrl / Cmd + K — command center\nDouble-click title bar — maximize or restore\nRight-click the desktop — quick actions\n\nNo cloud sync or access to your computer files is implied.'),
      file('ideas','notes','Ideas.md','# Workspace notes\n\n- Build with intent.\n- Make interactions useful.\n- Test every real action.\n\nThis document is editable. Changes save automatically to local browser storage.'),
      file('guide','workspace','Project Index.md','# Selected projects\n\nA.T. Field — https://aincfh.dpdns.org\nSaint Laurent — https://yslfivem.com\nWindows desktop tools — private source\nFishing World 3D — experimental\n\nProject descriptions are examples of publicly shareable information, not a mirror of private repositories.')
    ].concat([
      {id:'link-github',name:'GitHub',type:'link',parent:'links',body:'',url:'https://github.com/AincFh',created:t,modified:t,deleted:false},
      {id:'link-field',name:'A.T. Field',type:'link',parent:'links',body:'',url:'https://aincfh.dpdns.org',created:t,modified:t,deleted:false}
    ]),events:[{id:uid(),when:t,kind:'info',text:'Workspace initialized · browser-only storage'}]};
  }
  var store;try{
    var raw=localStorage.getItem(KEY),parsed=raw?JSON.parse(raw):null;
    store=parsed&&parsed.version===1&&Array.isArray(parsed.items)&&Array.isArray(parsed.events)?parsed:defaults();
  }catch(e){store=defaults()}
  function save(next){
    if(next.items.length>MAX_FILES)throw Error('文件数量达到上限 '+MAX_FILES);
    next.updatedAt=now();
    var raw=JSON.stringify(next);
    if(raw.length>MAX_BYTES)throw Error('浏览器工作区容量上限 7.5 MB；请导出备份。');
    // For small snapshots keep the original localStorage copy as a migration fallback.
    // Larger snapshots are saved to IndexedDB, without silently truncating documents.
    if(raw.length<=500000){try{localStorage.setItem(KEY,raw)}catch(e){storageError='localStorage fallback unavailable'}}
    store=next;wasModified=true;
    window.dispatchEvent(new CustomEvent('aincfh:workspace-updated',{detail:{modified:next.updatedAt,items:next.items.length}}));
    if(window.AincStorage){
      window.AincStorage.write('workspace',next).then(()=>{storageError=''}).catch(e=>{
        storageError='IndexedDB write failed: '+e.message;
        console.warn('[AincFh OS]',storageError);
        report('保存到浏览器数据库失败，请立即导出备份');
      });
    }else if(raw.length>500000){
      throw Error('当前浏览器不支持大容量工作区存储；请导出备份');
    }
    return true;
  }
  function report(message){if(bridge&&bridge.toast)bridge.toast(message);else console.info('[AincFh OS]',message)}
  function activity(text,kind){
    var copy=JSON.parse(JSON.stringify(store));
    copy.events.unshift({id:uid(),text:String(text).slice(0,180),kind:kind||'info',when:now()});
    copy.events=copy.events.slice(0,80);
    try{save(copy)}catch(e){console.warn(e)}
    updateCount();
  }
  function transact(fn,message){
    var copy=JSON.parse(JSON.stringify(store));
    try{var result=fn(copy);if(result===false)return false;
      if(message)copy.events.unshift({id:uid(),text:message,kind:'success',when:now()});
      copy.events=copy.events.slice(0,80);save(copy);updateCount();return true;
    }catch(e){report(e.message||'保存失败');return false}
  }
  function item(id){return store.items.find(function(i){return i.id===id})||null}
  function isVisible(i){if(i.deleted)return false;var cur=i,guard=0;
    while(cur&&cur.parent!=='root'&&guard++<60){cur=item(cur.parent);if(!cur||cur.deleted)return false}return guard<60}
  function isChildOf(id,ancestor){var cur=item(id),guard=0;while(cur&&guard++<80){if(cur.parent===ancestor)return true;cur=item(cur.parent)}return false}
  function directoryList(){return store.items.filter(function(i){return i.type==='folder'&&isVisible(i)})}
  function rootOf(i){return i.parent==='root'?'Home':(item(i.parent)||{}).name||'Workspace'}
  function icon(type){return type==='folder'?'folder':type==='link'?'link':type==='image'?'image':'code'}
  function symbol(type){return '<svg aria-hidden="true"><use href="#i-'+icon(type)+'"></use></svg>'}
  var ui={folder:'root',selected:null,search:'',trash:false,view:'folder',showInspector:false,sort:'name',modal:null,notesId:'ideas',history:['root'],historyIndex:0};
  var NAV_KEY='aincfh_files_navigation_v14';
  var NAV_LABELS={
    'zh-CN':{home:'主页',desktop:'桌面',workspace:'工作区',notes:'笔记',links:'链接',recent:'最近使用',favorites:'收藏位置',places:'快捷访问',folders:'目录',library:'资源库',system:'系统',trash:'回收站',storage:'浏览器存储',loading:'正在读取…',unavailable:'不可获取',back:'后退',forward:'前进',up:'上一级',expand:'展开目录',collapse:'折叠目录',pin:'添加到收藏',unpin:'取消收藏',emptyFavorite:'尚未添加收藏',sidebar:'文件导航',inspector:'文件详情',visible:'展开侧栏',hide:'收起侧栏',search:'搜索文件',items:'项目',starred:'收藏项目',name:'名称',modified:'修改时间',type:'类型',sortName:'名称排序',sortRecent:'最近修改',quick:'常用位置',all:'全部文件',refresh:'刷新',details:'详情'},
    'zh-TW':{home:'主頁',desktop:'桌面',workspace:'工作區',notes:'筆記',links:'連結',recent:'最近使用',favorites:'收藏位置',places:'快速存取',folders:'目錄',library:'資源庫',system:'系統',trash:'資源回收筒',storage:'瀏覽器儲存空間',loading:'正在讀取…',unavailable:'無法取得',back:'返回',forward:'前進',up:'上一層',expand:'展開目錄',collapse:'收合目錄',pin:'加入收藏',unpin:'取消收藏',emptyFavorite:'尚無收藏',sidebar:'檔案導覽',inspector:'檔案資訊',visible:'展開側欄',hide:'收起側欄',search:'搜尋檔案',items:'項目',starred:'收藏項目',name:'名稱',modified:'修改時間',type:'類型',sortName:'名稱排序',sortRecent:'最近修改',quick:'常用位置',all:'所有檔案',refresh:'重新整理',details:'詳細資訊'},
    'en-US':{home:'Home',desktop:'Desktop',workspace:'Workspace',notes:'Notes',links:'Links',recent:'Recents',favorites:'Favorites',places:'Quick access',folders:'Folders',library:'Library',system:'System',trash:'Trash',storage:'Browser storage',loading:'Checking…',unavailable:'Unavailable',back:'Back',forward:'Forward',up:'Parent folder',expand:'Expand folder',collapse:'Collapse folder',pin:'Add to Favorites',unpin:'Remove Favorite',emptyFavorite:'No favorites yet',sidebar:'File navigation',inspector:'Inspector',visible:'Show sidebar',hide:'Hide sidebar',search:'Search files',items:'items',starred:'Starred items',name:'Name',modified:'Modified',type:'Type',sortName:'Sort by name',sortRecent:'Recently modified',quick:'Quick access',all:'All files',refresh:'Refresh',details:'Details'},
    'ja-JP':{home:'ホーム',desktop:'デスクトップ',workspace:'ワークスペース',notes:'メモ',links:'リンク',recent:'最近使用した項目',favorites:'お気に入り',places:'クイックアクセス',folders:'フォルダー',library:'ライブラリ',system:'システム',trash:'ゴミ箱',storage:'ブラウザーストレージ',loading:'確認中…',unavailable:'取得できません',back:'戻る',forward:'進む',up:'上のフォルダー',expand:'フォルダーを展開',collapse:'フォルダーを閉じる',pin:'お気に入りに追加',unpin:'お気に入りから削除',emptyFavorite:'お気に入りはありません',sidebar:'ファイルナビゲーション',inspector:'詳細情報',visible:'サイドバーを表示',hide:'サイドバーを閉じる',search:'ファイルを検索',items:'件',starred:'お気に入り',name:'名前',modified:'更新日時',type:'種類',sortName:'名前で並べ替え',sortRecent:'更新順に並べ替え',quick:'クイックアクセス',all:'すべてのファイル',refresh:'更新',details:'詳細'}
  };
  function nt(k){return (NAV_LABELS[window.AincI18n?.locale||'en-US']||NAV_LABELS['en-US'])[k]||k}
  var nav={favorites:['workspace','notes','links'],expanded:['workspace','notes','links','desktop'],sidebarWidth:218,hideSidebar:false,mobileOpen:false};
  try{
    var navStored=JSON.parse(localStorage.getItem(NAV_KEY)||'null');
    if(navStored&&typeof navStored==='object'){
      if(Array.isArray(navStored.favorites))nav.favorites=navStored.favorites.filter(x=>typeof x==='string'&&x.length<121).slice(0,30);
      if(Array.isArray(navStored.expanded))nav.expanded=navStored.expanded.filter(x=>typeof x==='string'&&x.length<121).slice(0,300);
      if(Number.isFinite(navStored.sidebarWidth))nav.sidebarWidth=Math.max(186,Math.min(320,navStored.sidebarWidth));
      nav.hideSidebar=navStored.hideSidebar===true;
    }
  }catch(e){}
  function saveNav(){try{localStorage.setItem(NAV_KEY,JSON.stringify(nav))}catch(e){}}
  function isFavorite(id){return nav.favorites.includes(id)}
  function toggleFavorite(id){
    var i=item(id);if(!i||!isVisible(i))return false;
    nav.favorites=isFavorite(id)?nav.favorites.filter(x=>x!==id):nav.favorites.concat(id).slice(-30);
    saveNav();rerender('files');return true;
  }
  function navigateFolder(id,fromHistory){
    if(id!=='root'&&(!item(id)||item(id).type!=='folder'||!isVisible(item(id))))return false;
    ui.folder=id;ui.view='folder';ui.trash=false;ui.search='';ui.selected=null;ui.showInspector=false;nav.mobileOpen=false;
    if(!fromHistory){
      ui.history=ui.history.slice(0,ui.historyIndex+1);
      if(ui.history[ui.history.length-1]!==id){ui.history.push(id);if(ui.history.length>40)ui.history.shift()}
      ui.historyIndex=ui.history.length-1;
    }
    rerender('files');return true;
  }
  function navigateHistory(delta){
    var next=ui.historyIndex+delta;
    if(next<0||next>=ui.history.length)return;
    var id=ui.history[next];ui.historyIndex=next;
    navigateFolder(id,true);
  }
  function navigateView(mode){
    if(!['recent','favorites','trash'].includes(mode))return;
    ui.view=mode;ui.trash=mode==='trash';ui.selected=null;ui.search='';ui.showInspector=false;nav.mobileOpen=false;rerender('files');
  }
  function ensureDesktopFolder(){
    if(item('desktop')?.type==='folder'&&isVisible(item('desktop')))return true;
    if(item('desktop'))return false;
    var t=now();
    return transact(function(next){next.items.push({id:'desktop',name:'Desktop',type:'folder',parent:'root',body:'',url:'',created:t,modified:t,deleted:false})},'Desktop directory added');
  }
  function navLabel(id){return ['root','desktop','workspace','notes','links'].includes(id)?nt(id):(item(id)?.name||id)}
  function getEntries(){var list=store.items.filter(function(i){
    if(ui.trash)return i.deleted;
    if(!isVisible(i))return false;
    if(ui.search)return (i.name+' '+(i.type==='text'?i.body:'')).toLowerCase().includes(ui.search.toLowerCase());
    if(ui.view==='recent')return i.type!=='folder';
    if(ui.view==='favorites')return isFavorite(i.id);
    return i.parent===ui.folder;
  });
  return list.sort(function(a,b){
    if(ui.view==='recent')return b.modified.localeCompare(a.modified);
    if(ui.view==='favorites')return nav.favorites.indexOf(a.id)-nav.favorites.indexOf(b.id);
    if(a.type==='folder'&&b.type!=='folder')return-1;
    if(b.type==='folder'&&a.type!=='folder')return 1;
    return ui.sort==='date'?b.modified.localeCompare(a.modified):a.name.localeCompare(b.name,'zh-CN')
  }).slice(0,ui.view==='recent'?75:800);
  }
  function prettyDate(s){try{return new Date(s).toLocaleDateString('zh-CN',{month:'short',day:'numeric'})}catch(e){return '--'}}
  function getPath(folder){var cur=folder,arr=[{id:'root',name:'Home'}],seen=new Set();
    while(cur&&cur!=='root'&&!seen.has(cur)){seen.add(cur);var f=item(cur);if(!f)break;arr.push({id:f.id,name:f.name});cur=f.parent}
    return arr.slice(0,1).concat(arr.slice(1).reverse());
  }
  function details(i){if(!i)return '<div class="fs-empty-detail"><span class="fs-detail-hex">⬡</span><strong>Select an item</strong><p>选择文件查看信息；双击文本文件可以在 Notes 中编辑。</p></div>';
    return '<div class="fs-detail-icon">'+symbol(i.type)+'</div><h3>'+esc(i.name)+'</h3><div class="fs-item-type">'+esc(i.type.toUpperCase())+' / '+esc(rootOf(i))+'</div>'+
      '<div class="fs-detail-meta"><div><span>Modified</span><b>'+esc(prettyDate(i.modified))+'</b></div><div><span>Size</span><b>'+esc(i.type==='text'?i.body.length+' chars':i.type==='image'?Math.round(i.body.length*.75/1024)+' KB':'—')+'</b></div></div>'+
      (i.type==='image'?'<img class="fs-preview-image" src="'+esc(i.body)+'" alt="'+esc(i.name)+'">':i.type==='text'?'<p class="fs-snippet">'+esc(i.body.slice(0,260))+'</p>':i.type==='link'?'<p class="fs-snippet">'+esc(i.url)+'</p>':'<p class="fs-snippet">双击打开目录。文件夹可以重命名和移动。</p>')+
      '<div class="fs-detail-actions">'+(i.deleted?'<button data-fs-action="restore" data-fs-id="'+esc(i.id)+'">Restore</button><button data-fs-action="destroy" data-fs-id="'+esc(i.id)+'">Delete forever</button>':
      '<button data-fs-action="favorite" data-fs-id="'+esc(i.id)+'">'+esc(nt(isFavorite(i.id)?'unpin':'pin'))+'</button><button data-fs-action="pin-desktop" data-fs-id="'+esc(i.id)+'">Desktop shortcut</button><button class="primary" data-fs-action="open" data-fs-id="'+esc(i.id)+'">'+(i.type==='text'?'Edit':i.type==='image'?'Paint':'Open')+'</button><button data-fs-action="rename" data-fs-id="'+esc(i.id)+'">Rename</button><button data-fs-action="move" data-fs-id="'+esc(i.id)+'">Move</button><button data-fs-action="duplicate" data-fs-id="'+esc(i.id)+'">Duplicate</button>'+(['text','image'].includes(i.type)?'<button data-fs-action="download" data-fs-id="'+esc(i.id)+'">Export</button>':'')+'<button data-fs-action="delete" data-fs-id="'+esc(i.id)+'">Trash</button>')+'</div>';
  }
  function modal(){
    if(!ui.modal)return '';
    var m=ui.modal,i=m.id?item(m.id):null;
    var title=m.action==='create-folder'?'New folder':m.action==='create-text'?'New document':m.action==='rename'?'Rename item':m.action==='move'?'Move item':m.action==='delete'?'Move to Trash':m.action==='destroy'?'Delete permanently':'Empty Trash';
    var needsName=['create-folder','create-text','rename'].includes(m.action);
    return '<div class="fs-modal-layer" role="presentation"><form class="fs-dialog" id="fsDialog" aria-label="'+title+'">'+
      '<div class="fs-kicker">AINCFH / FILE OPERATION</div><h3>'+title+'</h3>'+
      '<p>'+(['destroy','empty'].includes(m.action)?'This action cannot be undone.':'Changes are saved in this browser only.')+'</p>'+
      (needsName?'<label for="fsName">Name</label><input maxlength="80" id="fsName" name="name" required autocomplete="off" value="'+esc(i?i.name:(m.action==='create-folder'?'New Folder':'Untitled.txt'))+'"/>':'')+
      (m.action==='move'?'<label for="fsDestination">Destination</label><select id="fsDestination"><option value="root">Home /</option>'+
        directoryList().filter(function(f){return !i||!(f.id===i.id||isChildOf(f.id,i.id))}).map(function(f){return '<option value="'+esc(f.id)+'" '+(i&&f.id===i.parent?'selected':'')+'>'+esc(f.name)+'/</option>'}).join('')+'</select>':'')+
      '<div class="fs-dialog-actions"><button type="button" data-fs-action="cancel">Cancel</button><button class="primary" type="submit">'+(needsName?'Save':'Confirm')+'</button></div></form></div>';
  }
  function fsIcon(name){return '<svg aria-hidden="true"><use href="#i-fs-'+name+'"></use></svg>'}
  function fileCount(id){return store.items.filter(function(i){return i.parent===id&&isVisible(i)}).length}
  function treeItems(parent,depth,visited){
    if(depth>=7)return '';
    return directoryList().filter(function(i){return i.parent===parent&&!visited.has(i.id)}).sort(function(a,b){return a.name.localeCompare(b.name)}).map(function(f){
      var child=directoryList().some(function(x){return x.parent===f.id}),expanded=nav.expanded.includes(f.id);
      var active=ui.view==='folder'&&ui.folder===f.id;
      var nextVisited=new Set(visited);nextVisited.add(f.id);
      return '<div class="fs-tree-node" style="--tree-depth:'+depth+'"><div class="fs-tree-line'+(active?' is-active':'')+'">'+
        (child?'<button type="button" class="fs-tree-expander'+(expanded?' expanded':'')+'" data-fs-tree-toggle="'+esc(f.id)+'" aria-expanded="'+expanded+'" title="'+esc(nt(expanded?'collapse':'expand'))+'">'+fsIcon('chevron')+'</button>':'<span class="fs-tree-placeholder"></span>')+
        '<button type="button" class="fs-tree-open" data-fs-nav-folder="'+esc(f.id)+'" aria-current="'+(active?'page':'false')+'" title="'+esc(f.name)+'">'+fsIcon('folder')+'<span>'+esc(navLabel(f.id))+'</span><small>'+fileCount(f.id)+'</small></button>'+
        '<button type="button" class="fs-tree-star'+(isFavorite(f.id)?' is-starred':'')+'" data-fs-favorite="'+esc(f.id)+'" title="'+esc(nt(isFavorite(f.id)?'unpin':'pin'))+'">'+fsIcon('star')+'</button></div>'+
        (child&&expanded?'<div class="fs-tree-children">'+treeItems(f.id,depth+1,nextVisited)+'</div>':'')+'</div>';
    }).join('');
  }
  var storageInfo={used:null,quota:null,checked:0};
  function fsBytes(n){if(!Number.isFinite(n)||n<0)return nt('unavailable');return n<1024?Math.round(n)+' B':n<1048576?(n/1024).toFixed(1)+' KiB':n<1073741824?(n/1048576).toFixed(1)+' MiB':(n/1073741824).toFixed(2)+' GiB'}
  function fsStorage(){
    var available=Number.isFinite(storageInfo.used)&&Number.isFinite(storageInfo.quota)&&storageInfo.quota>0;
    var pct=available?Math.min(100,100*storageInfo.used/storageInfo.quota):0;
    return '<div class="fs-storage"><div class="fs-storage-title">'+fsIcon('drive')+'<span>'+esc(nt('storage'))+'</span></div><div class="fs-storage-meter" role="meter" aria-label="'+esc(nt('storage'))+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(pct)+'"><i style="width:'+pct.toFixed(2)+'%"></i></div><div class="fs-storage-detail">'+(available?fsBytes(storageInfo.used)+' / '+fsBytes(storageInfo.quota):esc(nt('loading')))+'</div></div>';
  }
  function fsRefreshStorage(){
    if(!navigator.storage?.estimate||Date.now()-storageInfo.checked<12000)return;
    storageInfo.checked=Date.now();
    navigator.storage.estimate().then(function(x){
      storageInfo.used=Number.isFinite(x.usage)?x.usage:null;storageInfo.quota=Number.isFinite(x.quota)?x.quota:null;
      var node=document.querySelector('#app-files .fs-storage');if(node)node.outerHTML=fsStorage();
    }).catch(function(){var node=document.querySelector('#app-files .fs-storage');if(node)node.querySelector('.fs-storage-detail').textContent=nt('unavailable')});
  }
  function renderSidebar(){
    var activeFolder=function(id){return ui.view==='folder'&&!ui.trash&&ui.folder===id};
    var quick=function(id,label,icon){return '<button type="button" class="fs-nav-entry'+(activeFolder(id)?' is-active':'')+'" data-fs-folder="'+esc(id)+'" aria-current="'+(activeFolder(id)?'page':'false')+'">'+fsIcon(icon)+'<span class="fs-nav-name">'+esc(nt(label))+'</span></button>'};
    var trashCount=store.items.filter(function(i){return i.deleted}).length;
    var pins=nav.favorites.map(item).filter(function(i){return i&&isVisible(i)}).slice(0,30);
    return '<aside class="fs-sidebar" aria-label="'+esc(nt('sidebar'))+'"><div class="fs-sidebar-brand"><div class="fs-brand-symbol">AF</div><div><b>AincFh <em>Files</em></b><small>LOCAL / WORKSPACE</small></div></div><div class="fs-sidebar-scroller">'+
      '<div class="fs-nav-group"><div class="fs-nav-heading">'+esc(nt('places'))+'</div>'+
        quick('root','home','home')+quick('desktop','desktop','desktop')+
        '<button class="fs-nav-entry'+(ui.view==='recent'?' is-active':'')+'" data-fs-nav-view="recent">'+fsIcon('recent')+'<span class="fs-nav-name">'+esc(nt('recent'))+'</span></button></div>'+
      '<div class="fs-nav-group"><div class="fs-nav-heading">'+esc(nt('favorites'))+'<span>'+pins.length+'</span></div>'+
        (pins.length?pins.map(function(i){
          var active=activeFolder(i.id);
          return '<div class="fs-fav-row"><button class="fs-nav-entry'+(active?' is-active':'')+'" '+(i.type==='folder'?'data-fs-folder':'data-fs-nav-item')+'="'+esc(i.id)+'">'+fsIcon(i.type==='folder'?'folder':'star')+'<span class="fs-nav-name">'+esc(navLabel(i.id))+'</span></button>'+
             '<button class="fs-fav-remove" data-fs-favorite="'+esc(i.id)+'" aria-label="'+esc(nt('unpin'))+'" title="'+esc(nt('unpin'))+'">×</button></div>';
        }).join(''):'<p class="fs-nav-empty">'+esc(nt('emptyFavorite'))+'</p>')+
        '<button class="fs-nav-link'+(ui.view==='favorites'?' is-active':'')+'" data-fs-nav-view="favorites">'+fsIcon('star')+esc(nt('starred'))+'</button></div>'+
      '<div class="fs-nav-group"><div class="fs-nav-heading">'+esc(nt('folders'))+'<span>'+directoryList().length+'</span></div><div class="fs-tree" role="tree">'+treeItems('root',0,new Set())+'</div></div>'+
      '<div class="fs-nav-group"><div class="fs-nav-heading">'+esc(nt('system'))+'</div><button class="fs-nav-entry'+(ui.trash?' is-active':'')+'" data-fs-action="trash">'+fsIcon('trash')+'<span class="fs-nav-name">'+esc(nt('trash'))+'</span><span class="fs-nav-badge">'+trashCount+'</span></button></div>'+
     '</div>'+fsStorage()+'</aside><div class="fs-sidebar-resizer" data-fs-sidebar-resize aria-label="'+esc(nt('sidebar'))+'"></div>';
  }
  function fsLocation(){
    var special=ui.trash?nt('trash'):ui.view==='recent'?nt('recent'):ui.view==='favorites'?nt('favorites'):null;
    var crumb=special?'<strong>'+esc(special)+'</strong>':getPath(ui.folder).map(function(i){return '<button data-fs-folder="'+esc(i.id)+'">'+esc(navLabel(i.id))+'</button>'}).join('<span class="fs-path-divider">/</span>');
    return '<div class="fs-location"><div class="fs-history">'+
      '<button data-fs-history="-1" aria-label="'+esc(nt('back'))+'" title="'+esc(nt('back'))+'" '+(ui.historyIndex===0?'disabled':'')+'>'+fsIcon('back')+'</button>'+
      '<button data-fs-history="1" aria-label="'+esc(nt('forward'))+'" title="'+esc(nt('forward'))+'" '+(ui.historyIndex>=ui.history.length-1?'disabled':'')+'>'+fsIcon('forward')+'</button>'+
      '<button data-fs-nav-up aria-label="'+esc(nt('up'))+'" title="'+esc(nt('up'))+'" '+(ui.folder==='root'||ui.view!=='folder'?'disabled':'')+'>'+fsIcon('up')+'</button>'+
      '<button data-fs-sidebar-toggle aria-label="'+esc(nt(nav.hideSidebar?'visible':'hide'))+'">'+fsIcon('sidebar')+'</button></div>'+
      '<div class="fs-crumbs">'+crumb+'</div></div>';
  }

  function renderFiles(){
    if(ui.folder!=='root'&&(!item(ui.folder)||!isVisible(item(ui.folder))))ui.folder='root';
    var data=getEntries(),selected=item(ui.selected);
    return '<div class="fs-shell">'+
      '<div class="fs-topline"><div><span class="win-eyebrow">AINCFH / LOCAL WORKSPACE</span><h2>Files<span class="fs-hot">.</span></h2></div><span class="fs-runtime">LOCAL-FIRST · PRIVATE</span></div>'+
      '<div class="fs-toolbar"><button class="fs-tool primary" data-fs-action="create-folder">+ Folder</button><button class="fs-tool" data-fs-action="create-text">+ Document</button><button class="fs-tool" data-fs-action="import">Import</button><button class="fs-tool" data-fs-action="backup">Backup</button><input type="file" id="fsImport" accept=".txt,.md,.json,.csv,text/plain,image/png,image/jpeg,image/webp" hidden /></div>'+
      '<div class="fs-browser'+(nav.hideSidebar?' fs-sidebar-hidden':'')+(nav.mobileOpen?' fs-mobile-sidebar-open':'')+(ui.showInspector?' fs-inspector-open':'')+'" style="--fs-sidebar-width:'+nav.sidebarWidth+'px">'+renderSidebar()+
      '<section class="fs-center">'+fsLocation()+
        '<div class="fs-controls"><label><svg aria-hidden="true"><use href="#i-search"></use></svg><input id="fsSearch" data-fs-search placeholder="'+esc(nt('search'))+'" value="'+esc(ui.search)+'" spellcheck="false"/></label><button data-fs-action="sort" title="'+esc(nt(ui.sort==='name'?'sortRecent':'sortName'))+'">'+esc(nt(ui.sort==='name'?'sortName':'sortRecent'))+'</button></div>'+
        '<div class="fs-table-header" aria-hidden="true"><span>'+esc(nt('name'))+'</span><span>'+esc(nt('type'))+'</span><span>'+esc(nt('modified'))+'</span></div><div class="fs-list" role="listbox" aria-label="Files">'+
          (data.length?data.map(function(i){return '<button class="fs-row '+(ui.selected===i.id?'selected':'')+'" data-fs-select="'+esc(i.id)+'" aria-selected="'+(ui.selected===i.id)+'" title="Double-click to open">'+
            '<span class="fs-row-icon">'+symbol(i.type)+'</span><span class="fs-row-name">'+esc(i.name)+'</span><span class="fs-row-type">'+esc(i.type.toUpperCase())+'</span><span class="fs-row-date">'+esc(prettyDate(i.modified))+'</span></button>'}).join(''):
          '<div class="fs-empty"><strong>'+(ui.trash?'Trash is empty':'Nothing here yet.')+'</strong><p>'+(ui.trash?'Deleted items appear here.':'Create a document or folder to start working.')+'</p></div>')+
        '</div><div class="fs-status">'+data.length+' item(s) · '+store.items.filter(isVisible).length+' in workspace'+(ui.trash?'<button data-fs-action="empty">Empty Trash</button>':'')+'</div></section>'+
        '<aside class="fs-inspector"><div class="fs-inspector-heading"><div class="fs-side-caption">'+esc(nt('inspector'))+' / PREVIEW</div><button class="fs-inspector-close" data-fs-toggle-inspector aria-label="'+esc(nt('hide'))+'">×</button></div>'+details(selected&&(ui.trash?selected.deleted:isVisible(selected))?selected:null)+'</aside>'+
      '</div>'+modal()+'</div>';
  }
  // Escaped Markdown subset. HTML and script execution are never allowed.
  function markdown(text){
    var escaped=function(x){return esc(x).replace(/\x60([^\x60]+)\x60/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>')};
    var rows=String(text).split(/\r?\n/),html=[],inCode=false,code=[];
    for(var line of rows){
      if(/^\x60{3}\s*/.test(line)){
        if(inCode){html.push('<pre><code>'+esc(code.join('\n'))+'</code></pre>');code=[];inCode=false}
        else inCode=true;
      }else if(inCode)code.push(line);
      else if(/^###\s+/.test(line))html.push('<h4>'+escaped(line.replace(/^###\s+/,''))+'</h4>');
      else if(/^##\s+/.test(line))html.push('<h3>'+escaped(line.replace(/^##\s+/,''))+'</h3>');
      else if(/^#\s+/.test(line))html.push('<h2>'+escaped(line.replace(/^#\s+/,''))+'</h2>');
      else if(/^[-*]\s+/.test(line))html.push('<div class="fs-md-item"><span>•</span>'+escaped(line.replace(/^[-*]\s+/,''))+'</div>');
      else if(/^\d+\.\s+/.test(line))html.push('<div class="fs-md-item"><span>'+esc(line.match(/^\d+/)[0])+'.</span>'+escaped(line.replace(/^\d+\.\s+/,''))+'</div>');
      else if(/^\s*---+\s*$/.test(line))html.push('<hr>');
      else if(line.trim())html.push('<p>'+escaped(line)+'</p>');
      else html.push('<div class="fs-md-space"></div>');
    }
    if(inCode)html.push('<pre><code>'+esc(code.join('\n'))+'</code></pre>');
    return html.join('');
  }
  ui.noteView='split';
  function renderNotes(){
    var notes=store.items.filter(function(i){return i.type==='text'&&isVisible(i)}).sort(function(a,b){return b.modified.localeCompare(a.modified)});
    var current=item(ui.notesId);if(!current||!isVisible(current)||current.type!=='text'){current=notes[0]||null;ui.notesId=current?current.id:null}
    var view=ui.noteView;
    return '<div class="fs-notes"><div class="fs-topline"><div><span class="win-eyebrow">LOCAL TEXT EDITOR / NOTES</span><h2>Notes<span class="fs-hot">.</span></h2></div><span class="fs-runtime">INDEXEDDB / LOCAL · NO CLOUD SYNC</span></div>'+
      '<div class="fs-notesbar"><button data-fs-action="new-note" class="fs-tool primary">+ New note</button><button data-fs-action="export" class="fs-tool" '+(!current?'disabled':'')+'>Export text</button>'+
      '<div class="fs-view-switch"><button data-fs-view="edit" aria-pressed="'+(view==='edit')+'">Edit</button><button data-fs-view="split" aria-pressed="'+(view==='split')+'">Split</button><button data-fs-view="preview" aria-pressed="'+(view==='preview')+'">Preview</button></div>'+
      '<span id="fsSaveStatus" aria-live="polite">Changes saved locally</span></div>'+
      '<div class="fs-notesbody"><aside class="fs-notelist"><div class="fs-side-caption">DOCUMENTS / '+notes.length+'</div>'+
      (notes.length?notes.map(function(i){return '<button data-fs-note="'+esc(i.id)+'" class="'+(current&&current.id===i.id?'active':'')+'"><strong>'+esc(i.name)+'</strong><small>'+esc(i.body.replace(/\s+/g,' ').slice(0,54)||'Empty document')+'</small></button>'}).join(''):'<p class="fs-no-note">Create a note to begin.</p>')+'</aside>'+
      '<section class="fs-editor">'+(current?'<label class="fs-editor-caption" for="fsNoteTitle">DOCUMENT NAME</label><input id="fsNoteTitle" data-fs-note-title maxlength="80" value="'+esc(current.name)+'" autocomplete="off"/>'+
        '<div class="fs-editor-sub"><span>MARKDOWN · LIVE PREVIEW</span><span id="fsChars">'+current.body.length+' chars · '+(current.body.trim()?current.body.trim().split(/\s+/).length:0)+' words</span></div>'+
        '<div class="fs-edit-surface" data-view="'+view+'"><textarea id="fsNoteBody" data-fs-note-body spellcheck="true" placeholder="Write something worth keeping…">'+esc(current.body)+'</textarea>'+
        '<article class="fs-md-preview" data-allow-select aria-label="Markdown preview">'+markdown(current.body)+'</article></div>'+
        '<div class="fs-editor-footer"><span>Ctrl+S save · browser sandbox · editable text</span><button data-fs-action="delete-note" data-fs-id="'+esc(current.id)+'">Move to Trash</button></div>':
      '<div class="fs-empty-detail"><strong>No document selected</strong><p>Create your first note.</p></div>')+'</section></div></div>';
  }
  function renderActivity(){
    var running=bridge&&bridge.windows?bridge.windows():[];
    return '<div class="fs-activity"><div class="fs-topline"><div><span class="win-eyebrow">SYSTEM / SESSION CENTER</span><h2>Activity<span class="fs-hot">.</span></h2></div><span class="fs-runtime">LIVE BROWSER SESSION</span></div>'+
      '<div class="fs-sysmetrics"><div><small>OPEN APPS</small><strong>'+running.length+'</strong></div><div><small>LOCAL DOCUMENTS</small><strong>'+store.items.filter(function(i){return i.type==='text'&&isVisible(i)}).length+'</strong></div><div><small>STORAGE MODE</small><strong>LOCAL</strong></div></div>'+
      '<div class="fs-activity-columns"><section><div class="fs-section-heading">RUNNING WINDOWS</div>'+
        (running.length?running.map(function(w){return '<div class="fs-process"><div><strong>'+esc(w.name)+'</strong><small>'+esc(w.minimized?'Minimized':w.maximized?'Maximized':'Window')+'</small></div><button data-fs-focus="'+esc(w.id)+'">Focus</button><button data-fs-close="'+esc(w.id)+'">Close</button></div>'}).join(''):'<div class="fs-empty"><strong>No open app windows.</strong></div>')+
        '<div class="fs-activity-foot">Numbers describe this webpage only, not your computer CPU or memory.</div></section>'+
        '<section><div class="fs-section-heading">ACTIVITY HISTORY <button data-fs-action="clear-events">Clear</button></div>'+
          (store.events.length?store.events.map(function(e){return '<div class="fs-event"><span class="fs-event-pip"></span><div><strong>'+esc(e.text)+'</strong><small>'+esc(new Date(e.when).toLocaleString('zh-CN'))+'</small></div></div>'}).join(''):'<div class="fs-empty">No recent activity.</div>')+
      '</section></div></div>';
  }
  function rerender(which){var id=which||'files';var el=document.querySelector('#app-'+id+' .window-content');if(el){el.innerHTML=api.render(id);if(id==='files')fsRefreshStorage()}}
  function refresh(){rerender('files');rerender('activity')}
  function updateCount(){var badge=document.getElementById('osActivityCount');if(badge)badge.textContent=String(store.events.length)}
  function commitDelete(id,forever){
    if(!item(id))return;
    if(forever){
      transact(function(s){var ids=new Set([id]);var changed=true;while(changed){changed=false;s.items.forEach(function(i){if(ids.has(i.parent)&&!ids.has(i.id)){ids.add(i.id);changed=true}})}s.items=s.items.filter(function(i){return !ids.has(i.id)})},'Permanently removed file or folder');
    }else transact(function(s){s.items.find(function(i){return i.id===id}).deleted=true},'Moved item to Trash');
    ui.selected=null;refresh();rerender('notes');
  }
  function exportText(i){
    if(!i||i.type!=='text')return;
    download(new Blob([i.body],{type:'text/plain;charset=utf-8'}),i.name);
  }
  function download(blob,name){
    var u=URL.createObjectURL(blob),link=document.createElement('a');link.href=u;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(function(){URL.revokeObjectURL(u)},1500);
    activity('Exported '+name);
  }
  function confirmModal(form){
    var m=ui.modal;if(!m)return;var i=m.id?item(m.id):null;var name=(form.querySelector('#fsName')||{}).value;
    if(name!==undefined){name=name.trim();if(!name||name.includes('/')||name.includes('\\')||name==='.'||name==='..'){report('文件名不能为空，也不能包含斜杠');return}if(name.length>80){report('文件名最多 80 个字符');return}}
    var ok=true;
    if(m.action==='create-folder'||m.action==='create-text'){
      var type=m.action==='create-folder'?'folder':'text',parent=ui.trash?'root':ui.folder;
      ok=transact(function(s){if(s.items.some(function(i){return i.parent===parent&&!i.deleted&&i.name===name})){throw Error('同一位置已有这个名称')}
        var t=now(),id=uid();s.items.push({id:id,type:type,parent:parent,name:name,body:'',url:'',created:t,modified:t,deleted:false});ui.selected=id;
        if(type==='text'){ui.notesId=id}
      },'Created '+name);
    }else if(m.action==='rename'&&i)ok=transact(function(s){
      if(s.items.some(function(x){return x.id!==i.id&&!x.deleted&&x.parent===i.parent&&x.name.toLowerCase()===name.toLowerCase()}))throw Error('当前文件夹已经存在同名项目');
      var x=s.items.find(function(x){return x.id===m.id});x.name=name;x.modified=now()
    },'Renamed to '+name);
    else if(m.action==='move'&&i){
      var destination=(form.querySelector('#fsDestination')||{}).value;
      ok=transact(function(s){
        if(destination!=='root'&&!s.items.some(function(x){return x.id===destination&&x.type==='folder'&&!x.deleted}))throw Error('目标文件夹不存在');
        if(destination===i.id||isChildOf(destination,i.id))throw Error('不能移动到自身或子文件夹');
        if(s.items.some(function(x){return x.id!==i.id&&!x.deleted&&x.parent===destination&&x.name.toLowerCase()===i.name.toLowerCase()}))throw Error('目标中已经存在同名文件');
        var x=s.items.find(function(x){return x.id===i.id});x.parent=destination;x.modified=now()
      },'Moved '+i.name);
    }
    else if(m.action==='delete'&&i){commitDelete(i.id,false)}
    else if(m.action==='destroy'&&i){commitDelete(i.id,true)}
    else if(m.action==='empty'){ok=transact(function(s){s.items=s.items.filter(function(i){return !i.deleted&&!isChildOfFrom(s.items,i.id)})},'Emptied Trash');ui.selected=null}
    if(ok){ui.modal=null;refresh();rerender('notes');if((m.action==='create-text')&&bridge)bridge.open('notes')}
  }
  function isChildOfFrom(items,id){
    var cur=items.find(function(x){return x.id===id}),visited=new Set();
    while(cur&&!visited.has(cur.id)){visited.add(cur.id);var parent=items.find(function(x){return x.id===cur.parent});
      if(parent&&parent.deleted)return true;cur=parent}return false;
  }
  function action(a,id){
    var i=id?item(id):null;
    switch(a){
      case 'pin-desktop':if(i&&isVisible(i)){window.AincDesktopSurface?.pinFile?.(i.id)}break;
      case 'favorite':if(i&&isVisible(i)){toggleFavorite(i.id)}break;
      case 'create-folder':case 'create-text':ui.modal={action:a};rerender('files');break;
      case 'cancel':ui.modal=null;rerender('files');break;
      case 'rename':case 'move':case 'delete':case 'destroy':if(i){ui.modal={action:a,id:id};rerender('files')}break;
      case 'duplicate':if(i){var copyId=uid();
        if(transact(function(s){
          var descendants=[i],queue=[i];
          while(queue.length){var cur=queue.shift();s.items.filter(function(x){return x.parent===cur.id&&!x.deleted}).forEach(function(x){descendants.push(x);queue.push(x)})}
          var nextName=i.name.replace(/(\.[^.]*)?$/,' copy$1'),suffix=2;
          while(s.items.some(function(x){return x.parent===i.parent&&!x.deleted&&x.name===nextName})){nextName=i.name+' copy '+suffix++}
          var ids=new Map([[i.id,copyId]]),t=now();
          descendants.forEach(function(x,idx){if(!ids.has(x.id))ids.set(x.id,uid());
            var duplicate={...x,id:ids.get(x.id),name:idx===0?nextName:x.name,parent:idx===0?x.parent:ids.get(x.parent),created:t,modified:t,deleted:false};
            s.items.push(duplicate);
          });ui.selected=copyId;
        },'Duplicated '+i.name))refresh();break}
      case 'download':if(i?.type==='image'){var l=document.createElement('a');l.href=i.body;l.download=i.name;document.body.append(l);l.click();l.remove();activity('Exported '+i.name)}else exportText(i);break;
      case 'open':if(!i)return;if(i.type==='folder'){navigateFolder(i.id)}else if(i.type==='text'){ui.notesId=i.id;bridge&&bridge.open('notes');rerender('notes')}else if(i.type==='image'){if(window.AincPaint)window.AincPaint.openImage(i.name,i.body,i.id);else report('Paint application is unavailable')}else if(i.type==='link'){window.open(i.url,'_blank','noopener,noreferrer')}break;
      case 'trash':if(ui.trash)navigateFolder(ui.folder);else navigateView('trash');break;
      case 'restore':if(i){transact(function(s){var x=s.items.find(function(x){return x.id===id});x.deleted=false;x.parent=item(x.parent)&&item(x.parent).deleted?'root':x.parent},'Restored '+i.name);ui.selected=null;refresh()}break;
      case 'empty':ui.modal={action:'empty'};rerender('files');break;
      case 'sort':ui.sort=ui.sort==='name'?'date':'name';rerender('files');break;
      case 'import':document.getElementById('fsImport')?.click();break;
      case 'backup':api.exportBackup();break;
      case 'new-note':{
        var id=uid(),t=now();
        if(transact(function(s){s.items.push({id:id,name:'Untitled '+new Date().toLocaleDateString('zh-CN')+'.md',type:'text',parent:'notes',body:'',url:'',created:t,modified:t,deleted:false})},'Created note')){
          ui.notesId=id;rerender('notes');refresh();document.getElementById('fsNoteTitle')?.focus();
        }break;
      }
      case 'delete-note':if(i){commitDelete(i.id,false);ui.notesId=null;rerender('notes')}break;
      case 'export':exportText(item(ui.notesId));break;
      case 'clear-events':transact(function(s){s.events=[]});rerender('activity');updateCount();break;
    }
  }
  function handleClick(e){
    var b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-fs-action')){action(b.dataset.fsAction,b.dataset.fsId);return}
    if(b.hasAttribute('data-fs-folder')){navigateFolder(b.dataset.fsFolder);return}
    if(b.hasAttribute('data-fs-nav-folder')){navigateFolder(b.dataset.fsNavFolder);return}
    if(b.hasAttribute('data-fs-nav-view')){navigateView(b.dataset.fsNavView);return}
    if(b.hasAttribute('data-fs-nav-item')){action('open',b.dataset.fsNavItem);return}
    if(b.hasAttribute('data-fs-favorite')){toggleFavorite(b.dataset.fsFavorite);return}
    if(b.hasAttribute('data-fs-tree-toggle')){
      var id=b.dataset.fsTreeToggle;
      nav.expanded=nav.expanded.includes(id)?nav.expanded.filter(function(x){return x!==id}):nav.expanded.concat(id);
      saveNav();rerender('files');return;
    }
    if(b.hasAttribute('data-fs-history')){navigateHistory(Number(b.dataset.fsHistory));return}
    if(b.hasAttribute('data-fs-nav-up')){var folder=item(ui.folder);navigateFolder(folder?.parent||'root');return}
    if(b.hasAttribute('data-fs-toggle-inspector')){ui.showInspector=!ui.showInspector;rerender('files');return}
    if(b.hasAttribute('data-fs-sidebar-toggle')){
      ui.showInspector=false;
      var content=document.querySelector('#app-files .window-content');
      if((content?.clientWidth||innerWidth)<=580)nav.mobileOpen=!nav.mobileOpen;
      else{nav.hideSidebar=!nav.hideSidebar;saveNav()}
      rerender('files');return
    }
    if(b.hasAttribute('data-fs-select')){
      var selected=b.dataset.fsSelect;
      ui.selected=selected;
      var filesContent=document.querySelector('#app-files .window-content');
      ui.showInspector=(filesContent?.clientWidth||innerWidth)<=780;
      if(ui.showInspector)filesContent?.querySelector('.fs-browser')?.classList.add('fs-inspector-open');
      // Single click only selects; native dblclick opens. No timing heuristic.
      document.querySelectorAll('#app-files [data-fs-select]').forEach(function(el){var active=el.dataset.fsSelect===selected;el.classList.toggle('selected',active);el.setAttribute('aria-selected',String(active))});
      var inspector=document.querySelector('#app-files .fs-inspector');
      if(inspector)inspector.innerHTML='<div class="fs-side-caption">INSPECTOR / PREVIEW</div>'+details(item(selected));
      return;
    }
    if(b.hasAttribute('data-fs-view')){ui.noteView=b.dataset.fsView;rerender('notes');return}
    if(b.hasAttribute('data-fs-note')){ui.notesId=b.dataset.fsNote;rerender('notes');return}
    if(b.hasAttribute('data-fs-focus')){bridge&&bridge.focus(b.dataset.fsFocus);rerender('activity');return}
    if(b.hasAttribute('data-fs-close')){bridge&&bridge.close(b.dataset.fsClose);rerender('activity');return}
  }
  function handleDoubleClick(e){
    var row=e.target.closest('[data-fs-select]');if(row){e.preventDefault();ui.selected=row.dataset.fsSelect;action('open',ui.selected)}
  }
  document.addEventListener('pointerdown',function(e){
    var grip=e.target.closest?.('[data-fs-sidebar-resize]');
    if(!grip||e.button!==0)return;
    var browser=grip.closest('.fs-browser'),start=e.clientX;
    if(!browser)return;
    var original=nav.sidebarWidth;var parent=document;
    e.preventDefault();
    var move=function(ev){
      var width=Math.max(186,Math.min(320,original+ev.clientX-start));
      browser.style.setProperty('--fs-sidebar-width',width+'px');
      nav.sidebarWidth=width;
    };
    var end=function(){
      parent.removeEventListener('pointermove',move);
      parent.removeEventListener('pointerup',end);
      parent.removeEventListener('pointercancel',end);
      saveNav();
    };
    parent.addEventListener('pointermove',move);
    parent.addEventListener('pointerup',end);
    parent.addEventListener('pointercancel',end);
  },true);
  document.addEventListener('click',handleClick);
  document.addEventListener('dblclick',handleDoubleClick);
  document.addEventListener('submit',function(e){if(e.target.id==='fsDialog'){e.preventDefault();confirmModal(e.target)}});
  document.addEventListener('input',function(e){
    if(e.target.matches('[data-fs-search]')){
      ui.search=e.target.value;var focus=e.target.selectionStart;rerender('files');var x=document.querySelector('#fsSearch');if(x){x.focus();x.setSelectionRange(focus,focus)}return;
    }
    if(!e.target.matches('[data-fs-note-body],[data-fs-note-title]'))return;
    var target=item(ui.notesId);if(!target)return;
    var field=e.target.matches('[data-fs-note-body]')?'body':'name';
    var text=e.target.value;
    if(field==='name'&&(!text.trim()||text.length>80))return;
    if(field==='body'&&text.length>100000){report('单个文档最多 100,000 字符');return}
    var ok=transact(function(s){var x=s.items.find(function(i){return i.id===target.id});x[field]=text;x.modified=now()});
    var status=document.getElementById('fsSaveStatus');
    if(status)status.textContent=ok?'Saving locally…':'Save failed';
    if(ok&&window.AincStorage){
      window.AincStorage.whenIdle().then(function(result){
        if(status?.isConnected)status.textContent=result===false?'Storage error':'Saved locally ✓';
      });
    }else if(status&&ok)status.textContent='Saved locally ✓';
    var chars=document.getElementById('fsChars');
    if(chars&&field==='body'){
      chars.textContent=text.length+' chars · '+(text.trim()?text.trim().split(/\s+/).length:0)+' words';
      var preview=document.querySelector('#app-notes .fs-md-preview');
      if(preview)preview.innerHTML=markdown(text);
    }
  });
  document.addEventListener('change',function(e){
    if(e.target.id==='fsImport'){
      var file=e.target.files&&e.target.files[0];if(!file)return;
      if(/^image\/(png|jpeg|webp)$/.test(file.type)){
        if(file.size>6*1024*1024){report('图片超过 6 MB，无法导入');return}
        var reader=new FileReader();
        reader.onload=function(){
          var img=new Image();
          img.onload=function(){
            var scale=Math.min(1,1400/img.width,1000/img.height);
            var c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));
            c.getContext('2d').drawImage(img,0,0,c.width,c.height);
            var data=c.toDataURL('image/png'),name=file.name.replace(/\.[^.]+$/,'')+'.png';
            if(saveImage(name,data,ui.trash?'workspace':ui.folder))report('已将图片添加到 Files / '+name);
          };
          img.onerror=function(){report('图片解码失败')};
          img.src=reader.result;
        };
        reader.onerror=function(){report('图片读取失败')};
        reader.readAsDataURL(file);e.target.value='';return;
      }
      if(file.size>120000){report('文本文件上限 120 KB');return}
      file.text().then(function(body){
        var name=file.name.slice(0,80),parent=ui.trash?'root':ui.folder,t=now();
        if(transact(function(s){s.items.push({id:uid(),name:name,type:'text',parent:parent,body:body.slice(0,100000),url:'',created:t,modified:t,deleted:false})},'Imported '+name)){refresh();report('已导入 '+name)}
      }).catch(function(){report('读取文件失败')});
      e.target.value='';
    }
  });
  function createFromTerminal(name,type){
    name=String(name||'').trim();
    if(!name||name.length>80||/[\\/]/.test(name)){report('Invalid filename');return false}
    var t=now(),id=uid(),parent='workspace';
    var ok=transact(function(next){
      if(next.items.some(function(x){return x.parent===parent&&!x.deleted&&x.name.toLowerCase()===name.toLowerCase()}))throw Error('Name already exists');
      next.items.push({id:id,name:name,type:type,parent:parent,body:'',url:'',created:t,modified:t,deleted:false});
    },'Created '+name);
    if(ok)refresh();return ok;
  }
  function saveImage(name,png,parent,existingId){
    name=String(name||'Drawing.png').trim().replace(/[\\/]/g,'_').slice(0,80);
    if(!name.toLowerCase().endsWith('.png'))name=name.slice(0,76)+'.png';
    if(!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(String(png||''))||png.length>6000000){report('PNG 文件无效或大于 4.5 MB');return false}
    const original=existingId?item(existingId):null;
    if(original&&!original.deleted&&original.type==='image'){
      const ok=transact(function(next){
        const x=next.items.find(i=>i.id===existingId);x.body=png;x.modified=now();
      },'Updated artwork · '+original.name);
      if(ok){ui.selected=existingId;refresh()}
      return ok?existingId:false;
    }
    parent=parent||'workspace';
    if(parent!=='root'&&(!item(parent)||item(parent).type!=='folder'||item(parent).deleted))parent='workspace';
    let chosen=name,count=2;const t=now(),folder=parent;
    while(store.items.some(x=>!x.deleted&&x.parent===folder&&x.name.toLowerCase()===chosen.toLowerCase())){
      chosen=name.replace(/\.png$/i,'')+'-'+count+++'.png';
    }
    const id=uid(),ok=transact(function(next){
      next.items.push({id,name:chosen,type:'image',parent:folder,body:png,url:'',created:t,modified:t,deleted:false});
    },'Saved artwork · '+chosen);
    if(ok){ui.selected=id;refresh()}
    return ok?id:false;
  }
  var api={
    attach:function(b){bridge=b;updateCount()},
    getNavigation:function(){return{folder:ui.folder,view:ui.view,trash:ui.trash,history:ui.history.slice(),favorites:nav.favorites.slice(),expanded:nav.expanded.slice(),sidebarWidth:nav.sidebarWidth,hidden:nav.hideSidebar}},
    // Desktop shell receives file metadata only; no file bodies are duplicated into
    // browser window globals. It opens the original item via the Files app.
    listItems:function(){return store.items.filter(isVisible).map(function(i){return{id:i.id,name:i.name,type:i.type,parent:i.parent,modified:i.modified}})},
    listDesktopItems:function(){return store.items.filter(function(i){return i.parent==='desktop'&&isVisible(i)}).map(function(i){return{id:i.id,name:i.name,type:i.type,parent:i.parent,modified:i.modified}})},
    openItemById:function(id){
      if(typeof id!=='string')return false;
      var i=item(id);if(!i||!isVisible(i))return false;
      action('open',id);if(i.type==='folder')bridge&&bridge.open('files');
      return true;
    },
    openTrash:function(){navigateView('trash');bridge&&bridge.open('files');return true},
    createDesktopItem:function(type,name){
      if(!['text','folder'].includes(type))return false;
      name=String(name||'').trim();
      if(!name||name.length>80||/[\\/]/.test(name)||name==='.'||name==='..')return false;
      var t=now(),id=uid();
      var ok=transact(function(next){
        var parent=next.items.find(function(i){return i.id==='desktop'&&!i.deleted&&i.type==='folder'});
        if(!parent){
          if(next.items.some(function(i){return i.id==='desktop'}))throw Error('Desktop directory conflict');
          next.items.push({id:'desktop',name:'Desktop',type:'folder',parent:'root',body:'',url:'',created:t,modified:t,deleted:false});
        }
        if(next.items.some(function(i){return i.parent==='desktop'&&!i.deleted&&i.name.toLowerCase()===name.toLowerCase()}))
          throw Error('The desktop already contains an item with that name');
        next.items.push({id:id,name:name,type:type,parent:'desktop',body:'',url:'',created:t,modified:t,deleted:false});
      },'Created desktop '+type+' · '+name);
      if(ok){refresh();return id}return false;
    },
    renameItemById:function(id,name){
      if(typeof id!=='string'||id==='desktop')return false;
      name=String(name||'').trim();var i=item(id);
      if(!i||!isVisible(i)||!name||name.length>80||/[\\/]/.test(name)||name==='.'||name==='..')return false;
      var ok=transact(function(next){
        if(next.items.some(function(x){return x.id!==id&&x.parent===i.parent&&!x.deleted&&x.name.toLowerCase()===name.toLowerCase()}))throw Error('Name already exists');
        var x=next.items.find(function(x){return x.id===id});x.name=name;x.modified=now();
      },'Renamed '+i.name+' → '+name);
      if(ok)refresh();return ok;
    },
    moveItemToTrash:function(id){
      if(typeof id!=='string'||['desktop','workspace','notes','links'].includes(id))return false;
      var i=item(id);if(!i||!isVisible(i))return false;
      commitDelete(id,false);return true;
    },
    saveImage:saveImage,
    render:function(id){if(id==='files')return renderFiles();if(id==='notes')return renderNotes();if(id==='activity')return renderActivity();return ''},
    afterOpen:function(id){if(id==='files'){updateCount();fsRefreshStorage()}else if(id==='notes'||id==='activity')updateCount()},
    summary:function(){return {files:store.items.filter(isVisible).length,notes:store.items.filter(function(i){return i.type==='text'&&isVisible(i)}).length,events:store.events.length}},
    search:function(q){var s=q.toLowerCase().trim();if(!s)return[];return store.items.filter(isVisible).filter(function(i){return i.name.toLowerCase().includes(s)}).slice(0,6).map(function(i){return{id:i.id,title:i.name,sub:'LOCAL '+i.type.toUpperCase(),terms:'files notes document '+i.name,icon:icon(i.type),action:function(){if(i.type==='text'){ui.notesId=i.id;bridge&&bridge.open('notes')}else{ui.folder=i.type==='folder'?i.id:i.parent;ui.selected=i.id;bridge&&bridge.open('files')}}}})},
    openByName:function(name){var i=store.items.find(function(x){return isVisible(x)&&x.name.toLowerCase()===String(name).toLowerCase()});if(!i)return false;action('open',i.id);return true},
    list:function(){return store.items.filter(isVisible).map(function(i){return (i.type==='folder'?'DIR ':i.type==='link'?'LINK':'FILE')+' '+i.name}).join('\n')},
    readFile:function(name){var i=store.items.find(function(x){return x.type==='text'&&isVisible(x)&&x.name.toLowerCase()===String(name).toLowerCase()});return i?i.body:null},
    mkdir:function(name){return createFromTerminal(name,'folder')},
    touch:function(name){return createFromTerminal(name,'text')},
    history:function(){return store.events.slice(0,12).map(function(e){return e.when.slice(0,19).replace('T',' ')+' · '+e.text}).join('\n')},

    storageStats:function(){return {documents:store.items.filter(function(x){return x.type==='text'&&isVisible(x)}).length,bytes:JSON.stringify(store).length,events:store.events.length,mode:window.AincStorage?.status.mode||'Legacy',error:storageError}},
    exportBackup:function(){
      var payload={schema:'aincfh-workspace-v1',exported:now(),version:store.version,items:store.items,events:store.events};
      download(new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'}),'AincFh-OS-workspace-'+new Date().toISOString().slice(0,10)+'.json');
      return true;
    },
    importBackup:function(raw){
      try{
        var value=JSON.parse(raw);
        if(!value||value.schema!=='aincfh-workspace-v1'||value.version!==1||!Array.isArray(value.items)||!Array.isArray(value.events))throw Error('不支持的备份格式');
        if(value.items.length>MAX_FILES||raw.length>MAX_BYTES+130000)throw Error('备份内容超出容量限制');
        var seen=new Set();
        for(var i of value.items){
          if(!i||typeof i.id!=='string'||i.id.length>120||seen.has(i.id))throw Error('文件 ID 无效或重复');
          seen.add(i.id);
          if(!['text','folder','link','image'].includes(i.type)||typeof i.name!=='string'||i.name.length>80||!i.name||typeof i.parent!=='string'||typeof i.body!=='string'||i.body.length>(i.type==='image'?6000000:100000)||typeof i.deleted!=='boolean')throw Error('文件结构无效');
          if(i.type==='link'&&!/^https?:\/\//.test(String(i.url||'')))throw Error('链接格式无效');
          if(i.type==='image'&&!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(i.body))throw Error('图像必须是 PNG 数据');
        }
        for(var j of value.items){
          if(j.parent!=='root'&&!seen.has(j.parent))throw Error('目录引用不存在');
          var visited=new Set([j.id]),current=j.parent;
          while(current!=='root'){
            if(visited.has(current))throw Error('目录存在循环引用');
            visited.add(current);var parent=value.items.find(function(x){return x.id===current});if(!parent||parent.type!=='folder')throw Error('父目录无效');
            current=parent.parent;
          }
        }
        var next={version:1,items:value.items,events:value.events.filter(function(x){return x&&typeof x.text==='string'&&typeof x.when==='string'}).slice(0,70)};
        save(next);ui.folder='root';ui.selected=null;ui.notesId=null;ui.search='';ui.trash=false;
        refresh();rerender('notes');report('备份已恢复到当前浏览器');return true;
      }catch(e){report(e.message||'备份不合法');return false}
    },
    resetData:function(){
      try{save(defaults());ui.folder='root';ui.selected=null;ui.search='';ui.trash=false;ui.notesId='ideas';refresh();rerender('notes');report('本地工作区已重置');return true}
      catch(e){report('重置失败：'+e.message);return false}
    },
    notify:activity,
    desktopMenu:function(x,y){
      var old=document.getElementById('osContextMenu');if(old)old.remove();
      var menu=document.createElement('div');menu.id='osContextMenu';menu.className='os-context-menu';
      menu.innerHTML='<div class="os-context-label">AINCFH OS / DESKTOP</div><button data-os-context="files">Open Files</button><button data-os-context="notes">Open Notes</button><button data-os-context="activity">Activity Center</button><div class="os-context-divider"></div><button data-os-context="tile">Tile Windows</button><button data-os-context="settings">Preferences</button>';
      menu.style.left=Math.max(8,Math.min(x,innerWidth-222))+'px';menu.style.top=Math.max(60,Math.min(y,innerHeight-255))+'px';
      document.body.append(menu);
    },
    closeDesktopMenu:function(){document.getElementById('osContextMenu')?.remove()}
  };
  document.addEventListener('contextmenu',function(e){
    if(e.target.closest('#desktop')&&!e.target.closest('.os-window')&&!e.target.closest('input,textarea,[contenteditable]')){e.preventDefault();api.desktopMenu(e.clientX,e.clientY)}
  });
  document.addEventListener('click',function(e){
    var m=e.target.closest('[data-os-context]');if(m){
      var cmd=m.dataset.osContext;api.closeDesktopMenu();
      if(cmd==='tile'){bridge&&bridge.arrange('tile')}else{bridge&&bridge.open(cmd)}
      return;
    }
    if(!e.target.closest('#osContextMenu'))api.closeDesktopMenu();
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){api.closeDesktopMenu();if(ui.modal){ui.modal=null;rerender('files')}}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&e.target.closest('#app-notes')){
      e.preventDefault();report('文档已保存到当前浏览器');
    }
  });
  window.AincWorkspace=api;
  // Load the durable IndexedDB snapshot without overwriting edits made during startup.
  api.ready=window.AincStorage?.read('workspace').then(function(saved){
    if(wasModified)return false;
    var valid=saved&&saved.version===1&&Array.isArray(saved.items)&&Array.isArray(saved.events);
    if(valid&&(!store.updatedAt||String(saved.updatedAt||'')>=String(store.updatedAt||''))){
      store=saved;refresh();rerender('notes');updateCount();
      window.dispatchEvent(new CustomEvent('aincfh:workspace-updated',{detail:{modified:store.updatedAt,items:store.items.length}}));
      return true;
    }
    if(!valid||String(store.updatedAt||'')>String(saved.updatedAt||'')){
      return window.AincStorage.write('workspace',store).catch(function(e){storageError=e.message;return false});
    }
    return true;
  }).catch(function(e){storageError=e.message;return false})||Promise.resolve(false);
  api.ready=api.ready.then(function(){
    // Upgrade existing browser workspaces: the original three folders did not
    // include Desktop. Wait for IndexedDB hydration before modifying the store.
    if(!item('desktop')){ensureDesktopFolder();refresh()}
    return true;
  });
  try{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}
})();