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
      folder('workspace','Workspace'),folder('notes','Notes'),folder('links','Links'),
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
  function icon(type){return type==='folder'?'folder':type==='link'?'link':'code'}
  function symbol(type){return '<svg aria-hidden="true"><use href="#i-'+icon(type)+'"></use></svg>'}
  var ui={folder:'root',selected:null,search:'',trash:false,sort:'name',modal:null,notesId:'ideas'};
  function labels(){return {root:'Home',workspace:'Workspace',notes:'Notes',links:'Links'};}
  function getEntries(){var list=store.items.filter(function(i){
    if(ui.trash)return i.deleted;
    if(!isVisible(i))return false;
    if(ui.search)return (i.name+' '+(i.type==='text'?i.body:'')).toLowerCase().includes(ui.search.toLowerCase());
    return i.parent===ui.folder;
  });
  return list.sort(function(a,b){if(a.type==='folder'&&b.type!=='folder')return-1;if(b.type==='folder'&&a.type!=='folder')return 1;
    return ui.sort==='date'?b.modified.localeCompare(a.modified):a.name.localeCompare(b.name,'zh-CN')});
  }
  function prettyDate(s){try{return new Date(s).toLocaleDateString('zh-CN',{month:'short',day:'numeric'})}catch(e){return '--'}}
  function getPath(folder){var cur=folder,arr=[{id:'root',name:'Home'}],seen=new Set();
    while(cur&&cur!=='root'&&!seen.has(cur)){seen.add(cur);var f=item(cur);if(!f)break;arr.push({id:f.id,name:f.name});cur=f.parent}
    return arr.slice(0,1).concat(arr.slice(1).reverse());
  }
  function details(i){if(!i)return '<div class="fs-empty-detail"><span class="fs-detail-hex">⬡</span><strong>Select an item</strong><p>选择文件查看信息；双击文本文件可以在 Notes 中编辑。</p></div>';
    return '<div class="fs-detail-icon">'+symbol(i.type)+'</div><h3>'+esc(i.name)+'</h3><div class="fs-item-type">'+esc(i.type.toUpperCase())+' / '+esc(rootOf(i))+'</div>'+
      '<div class="fs-detail-meta"><div><span>Modified</span><b>'+esc(prettyDate(i.modified))+'</b></div><div><span>Size</span><b>'+esc(i.type==='text'?i.body.length+' chars':'—')+'</b></div></div>'+
      (i.type==='text'?'<p class="fs-snippet">'+esc(i.body.slice(0,260))+'</p>':i.type==='link'?'<p class="fs-snippet">'+esc(i.url)+'</p>':'<p class="fs-snippet">双击打开目录。文件夹可以重命名和移动。</p>')+
      '<div class="fs-detail-actions">'+(i.deleted?'<button data-fs-action="restore" data-fs-id="'+esc(i.id)+'">Restore</button><button data-fs-action="destroy" data-fs-id="'+esc(i.id)+'">Delete forever</button>':
      '<button class="primary" data-fs-action="open" data-fs-id="'+esc(i.id)+'">'+(i.type==='text'?'Edit':'Open')+'</button><button data-fs-action="rename" data-fs-id="'+esc(i.id)+'">Rename</button><button data-fs-action="move" data-fs-id="'+esc(i.id)+'">Move</button><button data-fs-action="duplicate" data-fs-id="'+esc(i.id)+'">Duplicate</button>'+(i.type==='text'?'<button data-fs-action="download" data-fs-id="'+esc(i.id)+'">Export</button>':'')+'<button data-fs-action="delete" data-fs-id="'+esc(i.id)+'">Trash</button>')+'</div>';
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
  function renderFiles(){
    if(ui.folder!=='root'&&(!item(ui.folder)||!isVisible(item(ui.folder))))ui.folder='root';
    var data=getEntries(),selected=item(ui.selected);
    return '<div class="fs-shell">'+
      '<div class="fs-topline"><div><span class="win-eyebrow">LOCAL WORKSPACE / FILES</span><h2>Files<span class="fs-hot">.</span></h2></div><span class="fs-runtime">BROWSER STORAGE · LOCAL ONLY</span></div>'+
      '<div class="fs-toolbar"><button class="fs-tool primary" data-fs-action="create-folder">+ Folder</button><button class="fs-tool" data-fs-action="create-text">+ Document</button><button class="fs-tool" data-fs-action="import">Import</button><button class="fs-tool" data-fs-action="backup">Backup</button><input type="file" id="fsImport" accept=".txt,.md,.json,.csv,text/plain" hidden /></div>'+
      '<div class="fs-browser"><aside class="fs-sidebar"><div class="fs-side-caption">LOCATIONS</div>'+
        '<button data-fs-folder="root" class="'+(ui.folder==='root'&&!ui.trash?'active':'')+'">'+symbol('folder')+' Home</button>'+
        directoryList().filter(function(x){return x.parent==='root'}).map(function(x){return '<button data-fs-folder="'+esc(x.id)+'" class="'+(ui.folder===x.id&&!ui.trash?'active':'')+'">'+symbol('folder')+' '+esc(x.name)+'</button>'}).join('')+
        '<div class="fs-side-caption">SYSTEM</div><button data-fs-action="trash" class="'+(ui.trash?'active':'')+'">'+symbol('text')+' Trash <small>'+store.items.filter(function(x){return x.deleted}).length+'</small></button>'+
      '</aside><section class="fs-center"><div class="fs-location">'+(ui.trash?'<strong>Trash</strong>':getPath(ui.folder).map(function(p){return '<button data-fs-folder="'+esc(p.id)+'">'+esc(p.name)+'</button>'}).join('<span>/</span>'))+'</div>'+
        '<div class="fs-controls"><label><svg aria-hidden="true"><use href="#i-search"></use></svg><input id="fsSearch" data-fs-search placeholder="Search this workspace" value="'+esc(ui.search)+'" spellcheck="false"/></label><button data-fs-action="sort" title="Switch sort">SORT: '+(ui.sort==='name'?'NAME':'RECENT')+'</button></div>'+
        '<div class="fs-list" role="listbox" aria-label="Files">'+
          (data.length?data.map(function(i){return '<button class="fs-row '+(ui.selected===i.id?'selected':'')+'" data-fs-select="'+esc(i.id)+'" aria-selected="'+(ui.selected===i.id)+'" title="Double-click to open">'+
            '<span class="fs-row-icon">'+symbol(i.type)+'</span><span class="fs-row-name">'+esc(i.name)+'</span><span class="fs-row-type">'+esc(i.type.toUpperCase())+'</span><span class="fs-row-date">'+esc(prettyDate(i.modified))+'</span></button>'}).join(''):
          '<div class="fs-empty"><strong>'+(ui.trash?'Trash is empty':'Nothing here yet.')+'</strong><p>'+(ui.trash?'Deleted items appear here.':'Create a document or folder to start working.')+'</p></div>')+
        '</div><div class="fs-status">'+data.length+' item(s) · '+store.items.filter(isVisible).length+' in workspace'+(ui.trash?'<button data-fs-action="empty">Empty Trash</button>':'')+'</div></section>'+
        '<aside class="fs-inspector"><div class="fs-side-caption">INSPECTOR / PREVIEW</div>'+details(selected&&(ui.trash?selected.deleted:isVisible(selected))?selected:null)+'</aside>'+
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
  function rerender(which){var id=which||'files';var el=document.querySelector('#app-'+id+' .window-content');if(el)el.innerHTML=api.render(id)}
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
      case 'download':exportText(i);break;
      case 'open':if(!i)return;if(i.type==='folder'){ui.folder=i.id;ui.trash=false;ui.search='';ui.selected=null;rerender('files')}else if(i.type==='text'){ui.notesId=i.id;bridge&&bridge.open('notes');rerender('notes')}else if(i.type==='link'){window.open(i.url,'_blank','noopener,noreferrer')}break;
      case 'trash':ui.trash=!ui.trash;ui.selected=null;ui.search='';rerender('files');break;
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
    if(b.hasAttribute('data-fs-folder')){ui.folder=b.dataset.fsFolder;ui.trash=false;ui.search='';ui.selected=null;rerender('files');return}
    if(b.hasAttribute('data-fs-select')){
      var selected=b.dataset.fsSelect,stamp=Date.now();
      if(ui.lastClick&&ui.lastClick.id===selected&&stamp-ui.lastClick.time<480){
        ui.lastClick=null;action('open',selected);return;
      }
      ui.lastClick={id:selected,time:stamp};ui.selected=selected;
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
      if(file.size>120000){report('只能导入不超过 120 KB 的文本文件');return}
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
  var api={
    attach:function(b){bridge=b;updateCount()},
    render:function(id){if(id==='files')return renderFiles();if(id==='notes')return renderNotes();if(id==='activity')return renderActivity();return ''},
    afterOpen:function(id){if(id==='files'||id==='notes'||id==='activity')updateCount()},
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
          if(!['text','folder','link'].includes(i.type)||typeof i.name!=='string'||i.name.length>80||!i.name||typeof i.parent!=='string'||typeof i.body!=='string'||i.body.length>100000||typeof i.deleted!=='boolean')throw Error('文件结构无效');
          if(i.type==='link'&&!/^https?:\/\//.test(String(i.url||'')))throw Error('链接格式无效');
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
      return true;
    }
    if(!valid||String(store.updatedAt||'')>String(saved.updatedAt||'')){
      return window.AincStorage.write('workspace',store).catch(function(e){storageError=e.message;return false});
    }
    return true;
  }).catch(function(e){storageError=e.message;return false})||Promise.resolve(false);
  try{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}
})();