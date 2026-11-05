/* AincFh OS System Preferences — functional preferences, not simulated toggles. */
(function(){
'use strict';
var bridge=null,section='appearance',armed='';
var esc=function(x){return String(x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var sections=[['appearance','Appearance','sun'],['accessibility','Display & Access','user'],['desktop','Desktop & Windows','grid'],['apps','Apps & Startup','apps'],['notifications','Notifications','bell'],['shortcuts','Keyboard & Input','code'],['privacy','Privacy & Storage','folder'],['about','About AincFh OS','hex']];
function choice(key,label,items){
 var p=bridge.prefs();return '<div class="sp-field"><h4>'+label+'</h4><div class="sp-options">'+items.map(function(o){return '<button data-sp-set="'+key+'" data-sp-value="'+o[0]+'" aria-pressed="'+(p[key]===o[0])+'"><strong>'+o[1]+'</strong><small>'+o[2]+'</small></button>'}).join('')+'</div></div>';
}
function toggle(key,label,desc){
 var p=bridge.prefs();return '<div class="sp-toggle"><div><strong>'+label+'</strong><small>'+desc+'</small></div><button data-sp-toggle="'+key+'" role="switch" aria-checked="'+!!p[key]+'" aria-label="'+label+'"><span></span></button></div>';
}
function heading(code,title,desc){return '<div class="sp-kicker">SYSTEM PREFERENCES / '+code+'</div><h2>'+title+'<span>.</span></h2><p class="sp-sub">'+desc+'</p>'}
function render(){
 var p=bridge?bridge.prefs():{},storage=window.AincWorkspace?.storageStats?.()||{documents:0,bytes:0,events:0};
 var body='';
 switch(section){
 case 'appearance':
 body=heading('01','Appearance','橙紫六边形视觉系统与桌面展示效果。所有选项立即应用，并保存到当前浏览器。')+
 choice('theme','Color theme',[['dark','Midnight','深色桌面'],['light','Pearl','低眩光亮色']])+
 choice('accent','Accent signal',[['amber','Amber','品牌橙'],['violet','Violet','品牌紫'],['cyan','Cyan','低饱和青']])+
 toggle('glass','Translucent surfaces','窗口与 Dock 使用玻璃材质；关闭后使用不透明背景。')+
 toggle('wallpaper','Ambient wallpaper','控制六边形图案、背景轨道和全局视觉背景。');
 break;
 case 'accessibility':
 body=heading('02','Display & Accessibility','对比度、字号与动态效果影响整个浏览器桌面，不改变真实设备显示设置。')+
 choice('textSize','Interface density',[['compact','Compact','紧凑字号'],['normal','Standard','默认字号'],['large','Larger','放大文字']])+
 choice('contrast','Contrast',[['normal','Balanced','平衡对比'],['high','High contrast','增强前景与边框']])+
 toggle('motion','System animation','启动动画、背景运动和窗口过渡。支持系统减少动态效果偏好。')+
 '<div class="sp-info">Selection & Clipboard：非白名单区域不支持文本选择和网页内部复制／粘贴。Notes、文件输入框、终端及明确标记的阅读区域保留编辑与复制能力。</div>';
 break;
 case 'desktop':
 body=heading('03','Desktop & Windows','Dock、窗口停靠、布局恢复与桌面右键菜单。')+
 choice('dockSize','Dock sizing',[['regular','Comfortable','大图标'],['compact','Compact','适合小屏']])+
 choice('clockMode','Clock format',[['24','24-hour','09:41'],['12','12-hour','9:41 AM']])+
 toggle('autoOpen','Show startup workspace','下次载入桌面时自动打开你在 Apps & Startup 里选择的应用。')+
 toggle('rememberWindows','Remember window positions','重新打开窗口时恢复上次的位置和大小。')+
 toggle('snap','Window snapping','拖拽到左右屏幕边缘时自动停靠到半屏。')+
 toggle('contextMenu','Desktop context menu','右键点击桌面打开快速操作。')+
 '<div class="sp-actions"><button data-sp-action="tile">Tile windows</button><button data-sp-action="cascade">Cascade windows</button><button data-sp-action="reset-layout">Reset layout</button></div>';
 break;
 case 'apps':
 body=heading('04','Apps & Startup','系统级应用注册表与开机程序；所有应用在当前网页沙箱内运行。')+
 choice('startupApp','Default startup app',[['projects','Projects','项目窗口'],['apps','App Center','应用管理'],['files','Files','本地文件'],['tasks','Task Board','任务板'],['notes','Notes','编辑器'],['none','None','空桌面']])+
 toggle('autoOpen','Open startup application','仅桌面宽度下有效；手机以启动器为主。')+
 '<div class="sp-subpanel"><h3>App management</h3><p>每个应用都经过中央注册，避免无法追踪的隐藏入口。可在应用中心打开和管理。</p><div class="sp-actions"><button data-sp-action="open-apps">Open App Center</button><button data-sp-action="open-activity">Active windows</button></div></div>';
 break;
 case 'notifications':
 body=heading('05','Notifications','只控制 AincFh OS 内部的通知和运行指示，不请求系统通知权限。')+
 toggle('quietMode','Quiet mode','隐藏右下角临时通知；操作仍会写入本地活动记录。')+
 toggle('activityBadge','Activity badge','控制菜单栏中本地活动数量标识。')+
 '<div class="sp-subpanel"><h3>History</h3><p>最近的文件操作和任务事件可以在活动中心查看，不是电脑系统日志。</p><div class="sp-actions"><button data-sp-action="open-activity">Open Activity Center</button></div></div>';
 break;
 case 'shortcuts':
 body=heading('06','Keyboard & Input','仅针对当前网页桌面的快捷键。文字选择和剪贴板仍采用限定区域白名单。')+
 toggle('shortcuts','System keyboard shortcuts','打开应用、切换窗口、停靠、最大化和命令搜索的组合键。')+
 toggle('keyHints','Show desktop hints','控制桌面下方的快捷键和操作提示。')+
 '<div class="sp-shortcut-table">'+[['Ctrl / ⌘ + K','Command Center'],['Ctrl + Tab','Cycle windows'],['Ctrl + Shift + F','Maximize focused window'],['Ctrl + Alt + ← / →','Snap left / right'],['Alt + 1 … 6','Open primary apps'],['Esc','Close palette / dialog']].map(function(x){return '<div><kbd>'+x[0]+'</kbd><span>'+x[1]+'</span></div>'}).join('')+'</div>'+
 '<div class="sp-info">Clipboard whitelist: text inputs, Notes editor/preview, terminal output and explicitly marked reading areas. System UI does not permit ordinary selection.</div>';
 break;
 case 'privacy':
 body=heading('07','Privacy & Storage','这里管理的只是当前浏览器的 AincFh OS 工作区，不会清除你电脑中的真实文件。')+
 '<div class="sp-metrics"><div><small>Documents</small><strong>'+storage.documents+'</strong></div><div><small>Workspace size</small><strong>'+Math.ceil(storage.bytes/1024)+' KB</strong></div><div><small>Activity events</small><strong>'+storage.events+'</strong></div></div>'+
 '<div class="sp-subpanel"><h3>Browser storage</h3><p>主要数据使用 IndexedDB；权限和配额由浏览器管理。下面是此网页的实时估算，不是设备硬盘状态。</p><div class="sp-quota" id="spQuota">Checking browser quota…</div><div class="sp-actions"><button data-sp-action="persist-storage">Request persistent storage</button></div></div>'+
 '<div class="sp-subpanel"><h3>Data portability</h3><p>可以导出和恢复浏览器虚拟工作区，包括文档与目录结构。</p>'+
 '<div class="sp-actions"><button data-sp-action="export-workspace">Export workspace</button><button data-sp-action="import-workspace">Restore backup</button></div>'+
 '<input id="spImportFile" type="file" hidden accept=".json,application/json" /></div>'+
 '<div class="sp-subpanel"><h3>Preferences & reset</h3><p>清除设置不会删除文档；重置工作区会丢失当前浏览器中创建的文档。</p>'+
 '<div class="sp-actions"><button data-sp-action="export-prefs">Export preferences</button><button data-sp-action="reset-prefs">Reset preferences</button><button class="sp-danger" data-sp-action="reset-data">'+(armed==='reset-data'?'Confirm: delete local files':'Reset local workspace')+'</button></div>'+
 '<div class="sp-warning">重置工作区需要再次确认；建议先导出备份。私人数据不会上传至 GitHub。</div></div>';
 break;
 default:
 body=heading('08','AincFh OS','Browser desktop environment / Design, engineering and creative systems.')+
 '<div class="sp-about"><div class="sp-brand"><strong>⬡</strong><span>AincFh <b>OS</b></span></div><p><strong>System:</strong> Web Desktop / static GitHub Pages</p><p><strong>Runtime:</strong> HTML · CSS · JavaScript (client-side only)</p><p><strong>Storage:</strong> local browser storage</p><p><strong>Security:</strong> browser sandbox · no native filesystem / driver / kernel rights</p><p><strong>Edition:</strong> Workspace v8</p></div>'+
 '<div class="sp-info">The OS is a functional browser desktop environment, not Windows, macOS or a host operating-system replacement. Its local terminal cannot execute remote shell commands.</div>';
 }
 return '<div class="sp-layout"><aside class="sp-sidebar"><div class="sp-brand-small">AF / CONTROL PANEL</div>'+sections.map(function(x){return '<button data-sp-section="'+x[0]+'" class="'+(section===x[0]?'active':'')+'"><svg aria-hidden="true"><use href="#i-'+x[2]+'"></use></svg><span>'+x[1]+'</span></button>'}).join('')+'<div class="sp-side-foot">LOCAL CONFIGURATION<br>NO CLOUD SYNC</div></aside><section class="sp-main">'+body+'</section></div>';
}
function refresh(){bridge?.refresh()}
function download(blob,name){var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1500)}
function action(key){
 if(!bridge)return;
 var ws=window.AincWorkspace;
 switch(key){
 case 'tile':bridge.arrange('tile');break;
 case 'cascade':bridge.arrange('cascade');break;
 case 'reset-layout':bridge.resetLayout();break;
 case 'export-workspace':ws?.exportBackup?.();break;
 case 'import-workspace':document.getElementById('spImportFile')?.click();break;
 case 'export-prefs':download(new Blob([JSON.stringify(bridge.prefs(),null,2)],{type:'application/json'}),'AincFh-OS-preferences.json');break;
 case 'reset-prefs':bridge.resetPrefs();break;
 case 'open-apps':bridge.open('apps');break;
 case 'open-activity':bridge.open('activity');break;
 case 'persist-storage':
   if(!navigator.storage?.persist){bridge.toast('当前浏览器不支持持久存储请求');break}
   navigator.storage.persist().then(function(ok){bridge.toast(ok?'浏览器已允许持久存储':'浏览器未授予持久存储；仍可以导出备份');refresh()}).catch(function(){bridge.toast('存储请求失败')});
   break;
 case 'reset-data':
   if(armed!=='reset-data'){armed='reset-data';refresh();bridge.toast('再次点击才能永久重置当前浏览器的文件')}
   else {armed='';ws?.resetData?.();refresh()}
   break;
 }
}
document.addEventListener('click',function(e){
 var sectionButton=e.target.closest('[data-sp-section]');if(sectionButton){section=sectionButton.dataset.spSection;armed='';refresh();return}
 var set=e.target.closest('[data-sp-set]');if(set){bridge?.set(set.dataset.spSet,set.dataset.spValue);return}
 var toggle=e.target.closest('[data-sp-toggle]');if(toggle){bridge?.set(toggle.dataset.spToggle,!bridge.prefs()[toggle.dataset.spToggle]);return}
 var button=e.target.closest('[data-sp-action]');if(button){action(button.dataset.spAction);return}
});
document.addEventListener('change',function(e){
 if(e.target.id!=='spImportFile')return;
 var f=e.target.files&&e.target.files[0];if(!f)return;
 if(f.size>850000){bridge?.toast('备份文件过大');return}
 f.text().then(function(s){var ok=window.AincWorkspace?.importBackup?.(s);if(ok)refresh()}).catch(function(){bridge?.toast('备份读取失败')});
 e.target.value='';
});
window.AincSettings={attach:function(x){bridge=x},render:render,onRender:function(root){
  var el=root?.querySelector('#spQuota');if(!el)return;
  window.AincStorage?.quota().then(function(q){
    if(!el.isConnected)return;
    var mb=function(x){return(x/1024/1024).toFixed(1)+' MB'};
    el.textContent=q.quota?'Browser usage: '+mb(q.usage)+' / Quota: '+mb(q.quota):'Storage estimate unavailable';
  }).catch(function(){if(el.isConnected)el.textContent='Storage estimate unavailable'});
}};
})();