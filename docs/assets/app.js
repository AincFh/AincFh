/* AincFh OS — functional window manager, command center, settings and local terminal. */
(() => {
  'use strict';
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));
  const ICON = name => `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const escapeHTML = v => String(v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const canStore = (() => { try { localStorage.setItem('__aincfh_test', '1'); localStorage.removeItem('__aincfh_test'); return true; } catch { return false; } })();
  const read = (key, fallback) => canStore ? (localStorage.getItem('aincfh_' + key) ?? fallback) : fallback;
  const write = (key, value) => { if (canStore) try { localStorage.setItem('aincfh_' + key, String(value)); } catch {} };
  const isMobile = () => matchMedia('(max-width:840px)').matches;
  const projects = [
    {id:'field',label:'A.T. Field',category:'WEB / EDGE · PUBLIC SOURCE',title:'A.T. Field',description:'个人内容与社区平台，从前端、身份认证到 Cloudflare 边缘数据层。重视一致的交互体验、可维护性与实际部署。',tags:['React','TypeScript','Cloudflare Workers','D1','R2'],url:'https://aincfh.dpdns.org',linkText:'VISIT LIVE WEBSITE',art:'field',mark:'AT',source:'https://github.com/AincFh/my-anime-blog'},
    {id:'saint',label:'Saint Laurent',category:'COMMUNITY SYSTEM · PRIVATE SOURCE',title:'Saint Laurent',description:'面向虚构 FiveM 角色扮演社区的公共信息服务与内部工作台，包括法典检索、授权工作流及自动化功能。组织名称均为虚构世界观。',tags:['Next.js','Node.js','SQLite','Access Control','AI Workflows'],url:'https://yslfivem.com',linkText:'VISIT PUBLIC PORTAL',art:'saint',mark:'SL',source:null},
    {id:'windows',label:'Windows Tools',category:'NATIVE DESKTOP · PRIVATE SOURCE',title:'Windows Tooling',description:'C# / .NET 原生桌面工具与诊断程序，探索 WinForms、WebView2 混合界面、权限控制及可靠的本地操作流程。',tags:['C#','.NET','WinForms','WebView2','Desktop UX'],url:'https://github.com/AincFh',linkText:'EXPLORE MY GITHUB',art:'windows',mark:'W',source:null},
    {id:'fishing',label:'Fishing World 3D',category:'WEB 3D · EXPERIMENTAL REPOSITORY',title:'Fishing World 3D',description:'基于网页的 3D 钓鱼游戏开发实验。项目仓库可供查看，当前作为持续迭代的项目展示，不把实验版本描述成已完成的正式游戏。',tags:['Web 3D','Game Design','Simulation','JavaScript'],url:'https://github.com/AincFh/wildlands-anglerfishing-world-3d',linkText:'VIEW PROJECT REPOSITORY',art:'fishing',mark:'3D',source:'https://github.com/AincFh/wildlands-anglerfishing-world-3d'}
  ];
  const tech = [
    {name:'TypeScript',abbr:'TS',kind:'web',hint:'Types & UI logic',detail:'为界面状态、数据模型与项目模块提供可维护的类型结构。主要用于网页平台。'},
    {name:'React / Next.js',abbr:'R',kind:'web',hint:'Product interfaces',detail:'构建组件化网页平台、路由、页面状态与前后端协作。'},
    {name:'HTML / CSS',abbr:'UI',kind:'web',hint:'Native experiences',detail:'重视语义化 HTML、CSS 动画、自适应布局与无依赖实现；当前 AincFh OS 本身就是示例。'},
    {name:'Cloudflare',abbr:'CF',kind:'backend',hint:'Workers / D1 / R2',detail:'使用边缘函数、数据存储和对象存储组合平台服务，并处理部署与访问控制。'},
    {name:'Node.js / SQLite',abbr:'DB',kind:'backend',hint:'Services & storage',detail:'用于后端 API、结构化数据、工具链及工作流服务。'},
    {name:'C# / .NET',abbr:'C#',kind:'desktop',hint:'Windows applications',detail:'构建 Windows 桌面端、业务逻辑、系统接口与工具箱。'},
    {name:'WebView2',abbr:'WV',kind:'desktop',hint:'Hybrid native UI',detail:'在原生 Windows 容器内组织 HTML UI 与受控客户端功能桥接。'},
    {name:'AI Systems',abbr:'AI',kind:'ai',hint:'Agents & automation',detail:'自然语言助手、数据检索、知识工作流和任务自动化的系统设计。'},
    {name:'GitHub Actions',abbr:'GH',kind:'ai',hint:'Build & delivery',detail:'使用自动化流程执行构建、测试及部署操作，跟踪可复现的发布结果。'}
  ];
  const appInfo = {
    projects:{label:'PROJECT EXPLORER',name:'Projects',icon:'folder',width:525,height:585},
    stack:{label:'TOOLCHAIN EXPLORER',name:'Tech Stack',icon:'code',width:570,height:595},
    about:{label:'PROFILE / DOSSIER',name:'About',icon:'user',width:500,height:565},
    terminal:{label:'LOCAL INTERACTIVE SHELL',name:'Terminal',icon:'terminal',width:630,height:455},
    contact:{label:'CONTACT / LINKS',name:'Contact',icon:'mail',width:495,height:485},
    settings:{label:'SYSTEM PREFERENCES',name:'Preferences',icon:'settings',width:470,height:555},
    files:{label:'FILE EXPLORER / LOCAL',name:'Files',icon:'folder',width:830,height:620},
    notes:{label:'NOTES / LOCAL EDITOR',name:'Notes',icon:'code',width:800,height:600},
    activity:{label:'ACTIVITY / SESSION',name:'Activity',icon:'grid',width:720,height:570}
  };
  let windows = new Map(), focusZ = 20, openedCount = 0, selectedProject = read('project','field'), selectedTech = 'TypeScript', selectedFilter = 'all', previewPaused = read('preview_paused','false') === 'true';
  const state = {
    theme: ['dark','light'].includes(read('theme','dark')) ? read('theme','dark') : 'dark',
    accent: ['amber','violet','cyan'].includes(read('accent','amber')) ? read('accent','amber') : 'amber',
    motion: read('motion', matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on') === 'on',
    contrast: read('contrast','normal')==='high'?'high':'normal',
    textSize: ['compact','normal','large'].includes(read('textSize','normal'))?read('textSize','normal'):'normal',
    glass: read('glass','on')!=='off',
    wallpaper: read('wallpaper','on')!=='off',
    dockSize: read('dockSize','regular')==='compact'?'compact':'regular',
    clockMode: read('clockMode','24')==='12'?'12':'24',
    autoOpen: read('autoOpen','on')!=='off',
    rememberWindows: read('rememberWindows','on')!=='off',
    snap: read('snap','on')!=='off',
    contextMenu: read('contextMenu','on')!=='off'
  };
  const desktop = $('#desktop'), layer = $('#windowLayer');
  function applySettings() {
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.dataset.accent = state.accent;
    document.documentElement.classList.toggle('motion-off',!state.motion);
    document.documentElement.dataset.contrast=state.contrast;
    document.documentElement.dataset.textSize=state.textSize;
    document.documentElement.dataset.dockSize=state.dockSize;
    document.documentElement.dataset.contextMenu=state.contextMenu?'on':'off';
    document.documentElement.classList.toggle('os-opaque',!state.glass);
    document.documentElement.classList.toggle('os-no-wallpaper',!state.wallpaper);
    $('meta[name="theme-color"]').content = state.theme === 'dark' ? '#10111a' : '#efebea';
    $$('[data-toggle-theme]').forEach(b => { b.innerHTML = ICON(state.theme === 'dark' ? 'sun' : 'moon'); b.setAttribute('aria-label', state.theme === 'dark' ? '切换为浅色主题' : '切换为深色主题'); });
    if (windows.has('settings')) renderApp('settings');
    updateClock();
  }
  function setPreference(key,value){
    if(!Object.prototype.hasOwnProperty.call(state,key))return;
    if(key==='theme'){setTheme(value);return}
    if(key==='accent'){setAccent(value);return}
    if(key==='motion'){setMotion(value);return}
    if(typeof state[key]==='boolean')value=!!value;
    state[key]=value;
    write(key,typeof value==='boolean'?(value?'on':'off'):value);
    if(key==='rememberWindows'&&!value){for(const id of Object.keys(appInfo)){try{localStorage.removeItem('aincfh_win_'+id)}catch{}}}
    applySettings();toast('设置已应用');
  }
  function resetPreferences(){
    const keys=['theme','accent','motion','contrast','textSize','glass','wallpaper','dockSize','clockMode','autoOpen','rememberWindows','snap','contextMenu'];
    for(const k of keys){try{localStorage.removeItem('aincfh_'+k)}catch{}}
    Object.assign(state,{theme:'dark',accent:'amber',motion:!matchMedia('(prefers-reduced-motion: reduce)').matches,contrast:'normal',textSize:'normal',glass:true,wallpaper:true,dockSize:'regular',clockMode:'24',autoOpen:true,rememberWindows:true,snap:true,contextMenu:true});
    applySettings();toast('设置已恢复默认');
  }
  function setTheme(t) { state.theme = t;write('theme',t);applySettings();toast(t === 'dark' ? '已切换至夜间模式' : '已切换至日间模式'); }
  function setAccent(a) { state.accent = a;write('accent',a);applySettings();toast('主题色已更新'); }
  function setMotion(on) { state.motion = !!on;write('motion',on?'on':'off');applySettings();toast(on ? '动态效果已开启' : '动态效果已关闭'); }
  function toast(message) { let e=document.createElement('div');e.className='toast';e.innerHTML=`<span class="toast-dot">◆</span>${escapeHTML(message)}`;$('#toastHost').append(e);setTimeout(()=>{e.remove()},3000); }
  function syncDock() {
    $$('[data-dock]').forEach(button=>{
      const w=windows.get(button.dataset.dock);
      button.classList.toggle('opened',!!w);
      button.classList.toggle('active',!!w&&!w.minimized&&w.node.classList.contains('focused'));
      button.setAttribute('aria-pressed',!!w&&!w.minimized?'true':'false');
    });
  }
  function focusWindow(id) {
    const w=windows.get(id); if(!w)return;
    if(w.minimized){w.minimized=false;w.node.classList.remove('is-minimized');}
    $$('.os-window.focused',layer).forEach(el=>el.classList.remove('focused'));
    w.node.style.zIndex=++focusZ;w.node.classList.add('focused');syncDock();
  }
  // The physical viewport, not the document's scrollable height, owns window geometry.
  function workBounds() {
    const mobile=isMobile();
    return {width:desktop.clientWidth,height:desktop.clientHeight,
      inset:mobile?8:16,top:mobile?8:12,bottom:mobile?80:94,
      minWidth:mobile?260:330,minHeight:mobile?220:260};
  }
  function clampValue(v,min,max){return Math.max(min,Math.min(Math.max(min,max),v));}
  function saveWindow(id){
    const w=windows.get(id);if(!w||w.maximized||isMobile())return;
    const n=w.node;
    w.position={x:parseFloat(n.style.left)||0,y:parseFloat(n.style.top)||0,w:n.offsetWidth,h:n.offsetHeight};
    write('win_'+id,JSON.stringify(w.position));
  }
  function windowPosition(id) {
    const b=workBounds(),m=appInfo[id],n=openedCount++;
    const w=Math.min(m.width,b.width-b.inset*2);
    const h=Math.min(m.height,b.height-b.bottom-b.top);
    const maxX=Math.max(b.inset,b.width-w-b.inset);
    const maxY=Math.max(b.top,b.height-h-b.bottom);
    const defaultX=id==='projects'?maxX:clampValue(Math.round(b.width*.21)+(n%4)*35,b.inset,maxX);
    const defaultY=clampValue(id==='projects'?42:48+(n%4)*27,b.top,maxY);
    const saved=read('win_'+id,'');
    if(saved&&!isMobile()){
      try{
        const p=JSON.parse(saved);
        if([p.x,p.y,p.w,p.h].every(Number.isFinite)){
          const sw=clampValue(p.w,Math.min(b.minWidth,b.width-b.inset*2),b.width-b.inset*2);
          const sh=clampValue(p.h,Math.min(b.minHeight,b.height-b.bottom-b.top),b.height-b.bottom-b.top);
          return {x:clampValue(p.x,b.inset,b.width-sw-b.inset),y:clampValue(p.y,b.top,b.height-sh-b.bottom),w:sw,h:sh};
        }
      }catch{}
    }
    return {x:defaultX,y:defaultY,w,h};
  }
  function openWindow(id,options={}) {
    if(!appInfo[id])return;
    if(windows.has(id)){focusWindow(id);if(options.project)selectProject(options.project);if(id==='terminal'&&options.focusInput!==false)focusTerminal();return;}
    const m=appInfo[id],pos=windowPosition(id);
    const node=document.createElement('section');
    node.className='os-window';node.id='app-'+id;
    node.setAttribute('role','dialog');node.setAttribute('aria-label',m.name+' 窗口');
    node.style.cssText='left:'+pos.x+'px;top:'+pos.y+'px;width:'+pos.w+'px;height:'+pos.h+'px';
    const edges=['n','e','s','w','ne','nw','se','sw'].map(edge=>'<span class="win-edge win-edge-'+edge+'" data-resize="'+edge+'" aria-hidden="true"></span>').join('');
    node.innerHTML='<header class="winbar" data-drag="'+id+'" title="拖动移动 · 双击最大化 · 最大化时拖动可恢复"><div class="win-controls"><button class="win-control close" data-win-action="close" title="关闭" aria-label="关闭 '+m.name+'"></button><button class="win-control minimize" data-win-action="minimize" title="最小化" aria-label="最小化 '+m.name+'"></button><button class="win-control maximize" data-win-action="maximize" title="最大化或还原" aria-label="最大化 '+m.name+'"></button></div><div class="winbar-title">'+ICON(m.icon)+'<span>'+m.label+'</span></div><div class="winbar-end"><span class="win-id">AF/</span><span>'+String(windows.size+1).padStart(2,'0')+'</span></div></header><div class="window-content"></div>'+edges;
    node.addEventListener('pointerdown',()=>focusWindow(id));
    layer.append(node);windows.set(id,{node,minimized:false,maximized:false,position:pos});
    node.classList.toggle('terminal-window',id==='terminal');
    renderApp(id);focusWindow(id);
    if(options.project)selectProject(options.project);
    if(id==='terminal'&&options.focusInput!==false)focusTerminal();
    if(options.announce!==false)toast('已打开 '+m.name);
  }
  function closeWindow(id){const w=windows.get(id);if(!w)return;w.node.remove();windows.delete(id);syncDock();}
  function minimizeWindow(id){
    const w=windows.get(id);if(!w)return;
    w.minimized=true;w.node.classList.remove('focused');w.node.classList.add('is-minimized');
    const remain=[...windows.entries()].filter(([,x])=>!x.minimized);
    if(remain.length)focusWindow(remain[remain.length-1][0]);else syncDock();
  }
  function toggleMax(id){
    const w=windows.get(id);if(!w||isMobile())return;
    if(!w.maximized)saveWindow(id);
    w.maximized=!w.maximized;
    w.node.classList.toggle('is-maximized',w.maximized);
    if(!w.maximized){
      const p=w.position,b=workBounds();
      const width=clampValue(p.w||w.node.offsetWidth,b.minWidth,b.width-b.inset*2);
      const height=clampValue(p.h||w.node.offsetHeight,b.minHeight,b.height-b.bottom-b.top);
      w.node.style.width=width+'px';w.node.style.height=height+'px';
      w.node.style.left=clampValue(p.x,b.inset,b.width-width-b.inset)+'px';
      w.node.style.top=clampValue(p.y,b.top,b.height-height-b.bottom)+'px';
    }
    focusWindow(id);
  }
  function showDesktop(){for(let [id,w] of windows){w.minimized=true;w.node.classList.remove('focused');w.node.classList.add('is-minimized');}syncDock();toast('已显示桌面 · 点击 Dock 恢复窗口');}
  function resetLayout(){for(const id of [...windows.keys()])closeWindow(id);['projects'].forEach(id=>{if(!isMobile())openWindow(id,{announce:false})});toast('窗口布局已重置');}
  // Real window arrangement: layouts move and resize the existing live app windows.
  function arrangeWindows(mode='tile'){
    if(isMobile()){toast('手机端使用单窗口全屏模式');return;}
    const list=[...windows.entries()].filter(([,w])=>!w.minimized);
    if(!list.length){toast('打开应用窗口后可排列');return;}
    const b=workBounds(),n=list.length;
    const cols=mode==='cascade'?1:(b.width>=990?Math.min(3,Math.ceil(Math.sqrt(n))):1);
    const rows=mode==='cascade'?1:Math.ceil(n/cols);
    const gap=12,usableWidth=b.width-b.inset*2,usableHeight=b.height-b.top-b.bottom;
    const cellWidth=Math.max(b.minWidth,Math.floor((usableWidth-gap*(cols-1))/cols));
    const cellHeight=Math.max(b.minHeight,Math.floor((usableHeight-gap*(rows-1))/rows));
    list.forEach(([id,w],i)=>{
      w.maximized=false;w.node.classList.remove('is-maximized');
      const width=mode==='cascade'?Math.min(appInfo[id].width,usableWidth):Math.min(cellWidth,usableWidth);
      const height=mode==='cascade'?Math.min(appInfo[id].height,usableHeight):Math.min(cellHeight,usableHeight);
      const x=mode==='cascade'?clampValue(b.inset+28*i,b.inset,b.width-width-b.inset):b.inset+(i%cols)*(cellWidth+gap);
      const y=mode==='cascade'?clampValue(b.top+25*i,b.top,b.height-height-b.bottom):b.top+Math.floor(i/cols)*(cellHeight+gap);
      w.node.style.left=x+'px';w.node.style.top=y+'px';w.node.style.width=width+'px';w.node.style.height=height+'px';
      saveWindow(id);
    });
    focusWindow(list[list.length-1][0]);
    toast(mode==='cascade'?'窗口已层叠排列':'窗口已平铺排列');
  }
  function snapWindow(direction){
    if(isMobile())return;
    const node=$('.os-window.focused',layer);if(!node){toast('请先选择一个窗口');return;}
    const id=node.id.slice(4),w=windows.get(id),b=workBounds();
    if(!w)return;
    w.maximized=false;node.classList.remove('is-maximized');
    const width=Math.max(b.minWidth,Math.floor((b.width-b.inset*3)/2));
    const height=b.height-b.top-b.bottom;
    const left=direction==='left'?b.inset:b.width-width-b.inset;
    node.style.left=left+'px';node.style.top=b.top+'px';
    node.style.width=width+'px';node.style.height=height+'px';
    saveWindow(id);
    toast(direction==='left'?'窗口已停靠左侧':'窗口已停靠右侧');
  }
  function cycleWindows(){
    const list=[...windows.entries()].filter(([,w])=>!w.minimized).sort((a,b)=>(parseInt(a[1].node.style.zIndex)||0)-(parseInt(b[1].node.style.zIndex)||0));
    if(list.length>1)focusWindow(list[0][0]);
  }
  function handleDrag(event){
    const bar=event.target.closest('.winbar');
    if(!bar||event.target.closest('.win-control')||isMobile()||event.button!==0)return;
    const node=bar.closest('.os-window'),id=node.id.slice(4),w=windows.get(id);
    if(!w)return;
    const b=workBounds(),root=desktop.getBoundingClientRect();
    let start={cx:event.clientX,cy:event.clientY,x:parseFloat(node.style.left)||0,y:parseFloat(node.style.top)||0};
    let moved=false,restored=false;
    bar.setPointerCapture(event.pointerId);bar.classList.add('dragging');
    function move(e){
      if(e.pointerId!==event.pointerId)return;
      let dx=e.clientX-start.cx,dy=e.clientY-start.cy;
      if(!moved&&Math.abs(dx)+Math.abs(dy)<5)return;
      if(w.maximized&&!restored){
        const px=clampValue((event.clientX-root.left)/Math.max(1,root.width),.2,.8);
        const naturalWidth=clampValue(w.position.w||appInfo[id].width,b.minWidth,b.width-b.inset*2);
        const naturalHeight=clampValue(w.position.h||appInfo[id].height,b.minHeight,b.height-b.bottom-b.top);
        w.maximized=false;w.node.classList.remove('is-maximized');
        node.style.width=naturalWidth+'px';node.style.height=naturalHeight+'px';
        start={cx:e.clientX,cy:e.clientY,x:clampValue(e.clientX-root.left-naturalWidth*px,b.inset,b.width-naturalWidth-b.inset),y:b.top};
        restored=true;dx=0;dy=0;
      }
      moved=true;
      const left=clampValue(start.x+dx,b.inset,b.width-node.offsetWidth-b.inset);
      const top=clampValue(start.y+dy,b.top,b.height-node.offsetHeight-b.bottom);
      node.style.left=left+'px';node.style.top=top+'px';
    }
    function done(e){
      if(e.pointerId!==event.pointerId)return;
      bar.removeEventListener('pointermove',move);bar.removeEventListener('pointerup',done);
      bar.removeEventListener('pointercancel',done);bar.classList.remove('dragging');
      try{bar.releasePointerCapture(event.pointerId)}catch{}
      if(moved)saveWindow(id);
    }
    bar.addEventListener('pointermove',move);bar.addEventListener('pointerup',done);bar.addEventListener('pointercancel',done);
  }
  function handleResize(event){
    const handle=event.target.closest('[data-resize]');
    if(!handle||isMobile()||event.button!==0)return;
    event.stopPropagation();event.preventDefault();
    const node=handle.closest('.os-window'),id=node.id.slice(4),w=windows.get(id);
    if(!w||w.maximized)return;
    const direction=handle.dataset.resize,b=workBounds();
    const start={cx:event.clientX,cy:event.clientY,x:parseFloat(node.style.left)||0,y:parseFloat(node.style.top)||0,
      width:node.offsetWidth,height:node.offsetHeight};
    handle.setPointerCapture(event.pointerId);
    function move(e){
      if(e.pointerId!==event.pointerId)return;
      const dx=e.clientX-start.cx,dy=e.clientY-start.cy;
      let x=start.x,y=start.y,width=start.width,height=start.height;
      if(direction.includes('e'))width=clampValue(start.width+dx,b.minWidth,b.width-start.x-b.inset);
      if(direction.includes('s'))height=clampValue(start.height+dy,b.minHeight,b.height-start.y-b.bottom);
      if(direction.includes('w')){
        x=clampValue(start.x+dx,b.inset,start.x+start.width-b.minWidth);
        width=start.width-(x-start.x);
      }
      if(direction.includes('n')){
        y=clampValue(start.y+dy,b.top,start.y+start.height-b.minHeight);
        height=start.height-(y-start.y);
      }
      node.style.left=x+'px';node.style.top=y+'px';
      node.style.width=width+'px';node.style.height=height+'px';
    }
    function done(e){
      if(e.pointerId!==event.pointerId)return;
      handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',done);
      handle.removeEventListener('pointercancel',done);
      try{handle.releasePointerCapture(event.pointerId)}catch{}
      saveWindow(id);
    }
    handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',done);handle.addEventListener('pointercancel',done);
  }
  function adaptWindows(){
    if(isMobile())return;
    const b=workBounds();
    for(const [id,w] of windows){
      if(w.maximized)continue;
      const n=w.node,width=clampValue(n.offsetWidth,b.minWidth,b.width-b.inset*2);
      const height=clampValue(n.offsetHeight,b.minHeight,b.height-b.bottom-b.top);
      n.style.width=width+'px';n.style.height=height+'px';
      n.style.left=clampValue(parseFloat(n.style.left)||0,b.inset,b.width-width-b.inset)+'px';
      n.style.top=clampValue(parseFloat(n.style.top)||0,b.top,b.height-height-b.bottom)+'px';
      saveWindow(id);
    }
  }
  window.addEventListener('resize',adaptWindows,{passive:true});
  function renderApp(id) {const w=windows.get(id);if(!w)return;const content=$('.window-content',w.node);
    const renderer={projects:renderProjects,stack:renderStack,about:renderAbout,terminal:renderTerminal,contact:renderContact,settings:renderSettings}[id];
    if(window.AincWorkspace&&['files','notes','activity'].includes(id)){
      content.innerHTML=window.AincWorkspace.render(id);
      window.AincWorkspace.afterOpen(id);
    }else {content.innerHTML=renderer();if(id==='terminal')hydrateTerminal(content);}
  }

  // Three real CSS-driven motion states; this is a concept UI, not a recording of the remote product.
  function renderMotionPreview(p) {
    const brand = escapeHTML(p.id.toUpperCase());
    const title = escapeHTML(p.title);
    const chips = p.tags.slice(0,3).map(t => '<span>' + escapeHTML(t) + '</span>').join('');
    return '<div class="project-canvas motion-preview ' + (previewPaused ? 'preview-paused' : '') + '" data-art="' + escapeHTML(p.art) + '" role="group" aria-label="' + title + ' 动态概念界面预览">' +
      '<div class="preview-toolbar"><span><i class="preview-live"></i> MOTION CONCEPT / ' + brand + '</span><button type="button" data-preview-pause aria-label="' + (previewPaused ? '继续播放动态演示' : '暂停动态演示') + '" aria-pressed="' + previewPaused + '">' + (previewPaused ? '▶ PLAY' : 'Ⅱ PAUSE') + '</button></div>' +
      '<div class="preview-frame"><div class="preview-frame-top"><i></i><i></i><i></i><span>AINCFH / ' + brand + '</span><b>● ACTIVE</b></div>' +
        '<div class="preview-scene preview-scene-a" aria-hidden="true"><small>01 / DESIGN</small><strong>' + title + '</strong><span class="preview-sweep"></span><div class="preview-lines"><i></i><i></i><i></i></div><div class="preview-chips">' + chips + '</div></div>' +
        '<div class="preview-scene preview-scene-b" aria-hidden="true"><small>02 / BUILD PIPELINE</small><strong>Compiling experiences.</strong><div class="preview-meter"><span></span></div><div class="preview-flow"><span>DESIGN</span><em>→</em><span>CODE</span><em>→</em><span>SHIP</span></div></div>' +
        '<div class="preview-scene preview-scene-c" aria-hidden="true"><small>03 / SYSTEM LOG</small><div class="preview-log"><span>&gt; initializing ' + brand.toLowerCase() + '…</span><span>&gt; loading modules… [ok]</span><span>&gt; runtime ready <b>✓</b></span></div><i class="preview-caret"></i></div>' +
      '</div><div class="preview-timeline" aria-hidden="true"><span></span></div><span class="preview-pointer" aria-hidden="true">↗</span></div>';
  }

  function renderProjects(){
    if(!projects.some(p=>p.id===selectedProject))selectedProject='field';const p=projects.find(p=>p.id===selectedProject),idx=projects.indexOf(p);
    return `<div class="win-eyebrow">SELECTED WORK / PROJECTS</div><div class="project-chooser">${projects.map((p,i)=>`<button class="project-choice ${p.id===selectedProject?'active':''}" data-select-project="${p.id}" aria-pressed="${p.id===selectedProject}">${String(i+1).padStart(2,'0')} / ${escapeHTML(p.label)}</button>`).join('')}</div>
    <div class="project-summary"><div><span class="project-label">${escapeHTML(p.category)}</span><h3>${escapeHTML(p.title)}</h3></div><span class="project-no">${String(idx+1).padStart(2,'0')}</span></div>
    <p class="project-description">${escapeHTML(p.description)}</p>
    ${renderMotionPreview(p)}
    <div class="project-tags">${p.tags.map(tag=>`<span>${escapeHTML(tag)}</span>`).join('')}</div>
    <div class="project-foot"><a class="project-external" href="${p.url}" target="_blank" rel="noopener noreferrer">${escapeHTML(p.linkText)} ${ICON('link')}</a><div class="project-next"><button class="small-arrow" data-next-project="-1" aria-label="上一个项目" title="上一个项目">←</button><button class="small-arrow" data-next-project="1" aria-label="下一个项目" title="下一个项目">→</button></div></div>`;
  }
  function selectProject(id) {if(!projects.some(p=>p.id===id))return;selectedProject=id;write('project',id);if(windows.has('projects'))renderApp('projects');}
  function nextProject(dir) {let i=projects.findIndex(p=>p.id===selectedProject);selectProject(projects[(i+dir+projects.length)%projects.length].id);}
  function renderStack(){const items=tech.filter(t=>selectedFilter==='all'||t.kind===selectedFilter),current=tech.find(t=>t.name===selectedTech)||items[0];return `<div class="win-eyebrow">TOOLS / NOT TROPHIES</div><h2 class="win-headline">Under the hood<span style="color:var(--hot)">.</span></h2><p class="win-sub">按真实项目方向整理的工程工具箱。点击模块查看它在项目中的用途，而不是虚构技能百分比。</p><div class="tech-filters">${[{id:'all',name:'ALL'},{id:'web',name:'FRONTEND'},{id:'backend',name:'BACKEND'},{id:'desktop',name:'DESKTOP'},{id:'ai',name:'AI / OPS'}].map(t=>`<button class="tech-filter ${selectedFilter===t.id?'active':''}" data-tech-filter="${t.id}" aria-pressed="${selectedFilter===t.id}">${t.name}</button>`).join('')}</div><div class="tech-grid">${items.map(t=>`<button class="tech-card ${selectedTech===t.name?'active':''}" data-select-tech="${escapeHTML(t.name)}"><span class="tech-glyph">${escapeHTML(t.abbr)}</span><strong>${escapeHTML(t.name)}</strong><small>${escapeHTML(t.hint)}</small></button>`).join('')}</div><div class="tech-detail"><strong>${escapeHTML(current.name)}</strong><p>${escapeHTML(current.detail)}</p></div>`;}
  function renderAbout(){return `<div class="win-eyebrow">IDENTITY / CREATIVE ENGINEERING</div><h2 class="win-headline">Built with intent<span style="color:var(--hot)">.</span></h2><div class="about-ident"><div class="ident-hex">AF</div><div><h3>AincFh</h3><p>独立产品开发者<br>Web Platforms / Native Desktop / AI Systems</p></div></div><p class="about-text">我喜欢从完整产品出发思考软件：界面应该有辨识度，信息架构应该清楚，权限和数据边界应该可靠，最终还要能真正部署、使用与维护。</p><div class="small-mono">ENGINEERING PRINCIPLES / 03</div>${[{n:'01',t:'视觉是系统的一部分',d:'交互、层级、动效、品牌视觉使用同一套规则。'},{n:'02',t:'不给空功能做漂亮外壳',d:'能打开的按钮必须有用途；状态必须真实，错误必须可见。'},{n:'03',t:'AI 加速，工程负责',d:'利用 AI 提高实现效率，但以验证、测试和产品判断决定交付。'}].map(x=>`<div class="principle"><span class="principle-num">${x.n}</span><div><strong>${x.t}</strong><p>${x.d}</p></div></div>`).join('')}<div class="rule"></div><button class="action-quiet" data-open="contact">GET IN TOUCH <span>↗</span></button>`;}
  function renderContact(){return `<div class="win-eyebrow">CONTACT / OPEN CHANNELS</div><h2 class="win-headline">Start a conversation<span style="color:var(--hot)">.</span></h2><p class="win-sub">作品、项目与合作信息。点击直接访问；邮箱可复制。</p><div class="contact-list"><a href="https://github.com/AincFh" rel="noopener noreferrer" target="_blank" class="contact-row">${ICON('code')}<span><strong>GitHub</strong><small>github.com/AincFh</small></span><b>↗</b></a><a href="https://aincfh.dpdns.org" rel="noopener noreferrer" target="_blank" class="contact-row">${ICON('hex')}<span><strong>A.T. Field</strong><small>aincfh.dpdns.org</small></span><b>↗</b></a><a href="https://space.bilibili.com/527018775" rel="noopener noreferrer" target="_blank" class="contact-row">${ICON('user')}<span><strong>Bilibili</strong><small>space.bilibili.com/527018775</small></span><b>↗</b></a><button class="contact-row" data-copy-email>${ICON('mail')}<span><strong>Email</strong><small>fhainc@hotmail.com · 点击复制</small></span>${ICON('copy')}</button></div>`;}
  const terminalState={log:[{kind:'system',line:'AincFh OS · local interactive console'},{kind:'normal',line:'Commands run in this page only. No remote shell access.'},{kind:'normal',line:'Type “help” to explore. \n'}],history:[],historyIndex:0};
  function renderTerminal(){return `<div class="terminal-badge">LOCAL SESSION / NO REMOTE EXECUTION</div><div class="terminal-output" id="terminalOutput" role="log" aria-label="终端输出">${terminalState.log.map(l=>`<div class="terminal-line ${l.kind==='normal'?'':l.kind}">${escapeHTML(l.line)}</div>`).join('')}</div><form class="terminal-input-line" id="terminalForm"><label for="terminalInput">aincfh@os:~$</label><input class="terminal-input" id="terminalInput" placeholder="help, projects, open, theme..." autocomplete="off" spellcheck="false" aria-label="输入本地命令"/></form>`;}
  function hydrateTerminal(root){const log=$('#terminalOutput',root);if(log)log.scrollTop=log.scrollHeight;const f=$('#terminalForm',root);f?.addEventListener('submit',e=>{e.preventDefault();const input=$('#terminalInput',root);if(!input)return;runCommand(input.value);input.value='';});const input=$('#terminalInput',root);input?.addEventListener('keydown',e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();terminalState.historyIndex=Math.max(0,Math.min(terminalState.history.length,terminalState.historyIndex+(e.key==='ArrowUp'?-1:1)));input.value=terminalState.history[terminalState.historyIndex]||'';}});}
  function appendTerm(kind,line){terminalState.log.push({kind,line});if(terminalState.log.length>130)terminalState.log.splice(0,terminalState.log.length-130);if(windows.has('terminal'))renderApp('terminal');}
  function focusTerminal(){setTimeout(()=>$('#terminalInput')?.focus({preventScroll:true}),40);}
  function runCommand(raw){const command=raw.trim();if(!command){focusTerminal();return;}terminalState.history.push(command);terminalState.historyIndex=terminalState.history.length;let args=command.split(/\s+/),cmd=args[0].toLowerCase();terminalState.log.push({kind:'normal',line:'aincfh@os:~$ '+command});let result='';
    switch(cmd){
    case 'help':result='help      list available commands\nprojects  list projects\nopen NAME open project / app\nfiles     open local File Explorer\nnotes     open editable Notes\nactivity  session and history\nls        list local files\ncat NAME  read text document\nmkdir NAME create a folder\ntouch NAME create a document\nhistory   recent local actions\nwhoami    profile summary\nstatus    local interface status\ntheme     dark | light | toggle\naccent    amber | violet | cyan\nmotion    on | off\ndate      local date / time\nclear     clear console\ngithub    open profile in new tab\nneofetch  show AincFh OS info';break;
    case 'projects':result=projects.map((p,i)=>`${String(i+1).padStart(2,'0')}  ${p.label}  (${p.category})`).join('\n');break;
    case 'ls':result=window.AincWorkspace?window.AincWorkspace.list():'No local workspace loaded.';break;
    case 'files':openWindow('files');result='Opened local file explorer';break;
    case 'notes':openWindow('notes');result='Opened Notes editor';break;
    case 'activity':openWindow('activity');result='Opened Activity Center';break;
    case 'cat':{const name=args.slice(1).join(' ');if(!name){result='Usage: cat FILE_NAME (try: cat Start Here.txt)';break;}var doc=window.AincWorkspace&&window.AincWorkspace.readFile(name);result=doc===null?'File not found: '+name:doc;break;}
    case 'mkdir':{const name=args.slice(1).join(' ');if(!name){result='Usage: mkdir FOLDER_NAME';break;}result=window.AincWorkspace&&window.AincWorkspace.mkdir(name)?'Created folder: '+name:'Unable to create folder';break;}
    case 'touch':{const name=args.slice(1).join(' ');if(!name){result='Usage: touch FILE_NAME';break;}result=window.AincWorkspace&&window.AincWorkspace.touch(name)?'Created document: '+name:'Unable to create document';break;}
    case 'history':result=window.AincWorkspace?window.AincWorkspace.history():'No activity.';break;
    case 'whoami':result='AincFh · Independent Product Builder\nFocus: design + engineering + practical delivery';break;
    case 'status':result=`AincFh OS / local browser session\nTheme: ${state.theme} · Accent: ${state.accent} · Motion: ${state.motion?'on':'off'}\nOpen apps: ${[...windows.keys()].join(', ')||'none'}\nNo live backend metrics are simulated.`;break;
    case 'date':result=new Date().toLocaleString('zh-CN',{dateStyle:'full',timeStyle:'medium'});break;
    case 'neofetch':result='     ⬡      AincFh OS v2.0\n    ⬡⬡      Interactive studio workspace\n   ⬡⬡⬡     Modules: 9 · Projects: '+projects.length+'\n    ⬡⬡      Runtime: Browser / Vanilla JS\n     ⬡      Design: Hex / Amber / Violet';break;
    case 'open':{const target=(args[1]||'').toLowerCase(),alias={project:'projects',work:'projects',tech:'stack',skills:'stack',shell:'terminal',mail:'contact',prefs:'settings'};let app=alias[target]||target;const project=projects.find(p=>p.id===app||p.label.toLowerCase().replace(/[^a-z0-9]+/g,'')===app.replace(/[^a-z0-9]+/g,''));if(project){openWindow('projects',{project:project.id,announce:false});result='Opened project: '+project.label;}else if(appInfo[app]){openWindow(app,{announce:false});result='Opened '+appInfo[app].name;}else result='Usage: open projects | stack | about | terminal | contact | settings | files | notes | activity | field | saint | windows | fishing';break;}
    case 'theme':{const v=args[1]||'toggle';if(!['dark','light','toggle'].includes(v)){result='Usage: theme dark | light | toggle';break;}setTheme(v==='toggle'?(state.theme==='dark'?'light':'dark'):v);result='Theme: '+state.theme;break;}
    case 'accent':{const v=args[1];if(!['amber','violet','cyan'].includes(v)){result='Usage: accent amber | violet | cyan';break;}setAccent(v);result='Accent: '+state.accent;break;}
    case 'motion':{const v=args[1];if(!['on','off'].includes(v)){result='Usage: motion on | off';break;}setMotion(v==='on');result='Motion: '+v;break;}
    case 'github':window.open('https://github.com/AincFh','_blank','noopener,noreferrer');result='Opening GitHub profile in a new tab.';break;
    case 'clear':terminalState.log=[];break;
    default:result=`Command not found: ${cmd}. Try “help”.`;
    }
    if(result)terminalState.log.push({kind:cmd==='help'?'system':cmd==='clear'?'normal':cmd==='open'?'system':cmd==='status'?'system':cmd==='projects'?'normal':cmd==='neofetch'?'system':cmd==='whoami'?'system':cmd==='date'?'normal':['theme','accent','motion'].includes(cmd)?'system':result.startsWith('Command not found')?'error':'normal',line:result});
    if(terminalState.log.length>130)terminalState.log.splice(0,terminalState.log.length-130);
    if(windows.has('terminal'))renderApp('terminal');focusTerminal();
  }
  function renderSettings(){return `<div class="win-eyebrow">PERSONALIZE / USER CONTROL</div><h2 class="win-headline">Make it yours<span style="color:var(--hot)">.</span></h2><p class="win-sub">主题与动效设置只保存在当前浏览器，不发送到服务器。</p><div class="settings-section"><h3>Appearance / 外观</h3><p>白天与夜间模式都会保持一致的品牌语言。</p><div class="settings-choice-group"><button class="setting-choice" data-set-theme="dark" aria-pressed="${state.theme==='dark'}">夜间 Dark</button><button class="setting-choice" data-set-theme="light" aria-pressed="${state.theme==='light'}">日间 Light</button></div></div><div class="settings-section"><h3>Color signal / 强调色</h3><p>系统交互高亮、状态与窗口边框的强调颜色。</p><div class="settings-choice-group"><button class="setting-choice" data-set-accent="amber" aria-pressed="${state.accent==='amber'}"><i></i>Amber</button><button class="setting-choice" data-set-accent="violet" aria-pressed="${state.accent==='violet'}"><i></i>Violet</button><button class="setting-choice" data-set-accent="cyan" aria-pressed="${state.accent==='cyan'}"><i></i>Cyan</button></div></div><div class="settings-section"><div class="setting-row"><div><h3>Ambient motion / 动态效果</h3><p>可关闭轨道旋转、背景漂移与入场动画。</p></div><button class="toggle" data-set-motion aria-label="切换动态效果" aria-pressed="${state.motion}"><span></span></button></div></div><div class="settings-section"><h3>Workspace layout / 窗口布局</h3><p>重新排列窗口；你的主题、动效偏好保持不变。</p><button class="action-quiet" data-reset-layout>RESET WORKSPACE <span>↺</span></button></div>`;}
  // Centralized event delegation. All project controls and system menus remain functional after rendering.
  document.addEventListener('click',async e=>{
    const control=e.target.closest('button,a');if(!control)return;
    if(control.matches('[data-open]')){openWindow(control.dataset.open);closeMenu();return;}
    if(control.matches('[data-dock]')){const id=control.dataset.dock,w=windows.get(id);if(!w)openWindow(id);else if(!w.minimized&&w.node.classList.contains('focused'))minimizeWindow(id);else focusWindow(id);return;}
    if(control.matches('[data-home]')){showDesktop();return;}
    if(control.matches('[data-win-action]')){const parent=control.closest('.os-window');if(!parent)return;const id=parent.id.slice(4);const action=control.dataset.winAction;if(action==='close')closeWindow(id);if(action==='minimize')minimizeWindow(id);if(action==='maximize')toggleMax(id);return;}
    if(control.matches('[data-toggle-theme]')){setTheme(state.theme==='dark'?'light':'dark');return;}
    if(control.matches('[data-preview-pause]')){previewPaused=!previewPaused;write('preview_paused',previewPaused?'true':'false');renderApp('projects');toast(previewPaused?'概念演示已暂停':'概念演示已恢复');return;}
    if(control.matches('[data-select-project]')){selectProject(control.dataset.selectProject);return;}
    if(control.matches('[data-next-project]')){nextProject(Number(control.dataset.nextProject));return;}
    if(control.matches('[data-tech-filter]')){selectedFilter=control.dataset.techFilter;const first=tech.find(t=>selectedFilter==='all'||t.kind===selectedFilter);if(first)selectedTech=first.name;renderApp('stack');return;}
    if(control.matches('[data-select-tech]')){selectedTech=control.dataset.selectTech;renderApp('stack');return;}
    if(control.matches('[data-set-theme]')){setTheme(control.dataset.setTheme);return;}
    if(control.matches('[data-set-accent]')){setAccent(control.dataset.setAccent);return;}
    if(control.matches('[data-set-motion]')){setMotion(!state.motion);return;}
    if(control.matches('[data-arrange]')){arrangeWindows(control.dataset.arrange);closeMenu();return;}
    if(control.matches('[data-snap]')){snapWindow(control.dataset.snap);closeMenu();return;}
    if(control.matches('[data-reset-layout]')){resetLayout();return;}
    if(control.matches('[data-copy-email]')){try{await navigator.clipboard.writeText('fhainc@hotmail.com');toast('邮箱地址已复制')}catch{toast('邮箱：fhainc@hotmail.com')}return;}
  });
  layer.addEventListener('pointerdown',handleResize);
  layer.addEventListener('pointerdown',handleDrag);
  layer.addEventListener('dblclick',e=>{const bar=e.target.closest('.winbar');if(bar&&!e.target.closest('.win-control'))toggleMax(bar.closest('.os-window').id.slice(4));});
  $$('[data-open]').forEach(b=>b.setAttribute('type','button'));
  function closeMenu(){$('#systemMenu').hidden=true;$('#systemMenuTrigger').setAttribute('aria-expanded','false')}
  $('#systemMenuTrigger').addEventListener('click',e=>{e.stopPropagation();let menu=$('#systemMenu');menu.hidden=!menu.hidden;$('#systemMenuTrigger').setAttribute('aria-expanded',String(!menu.hidden));});
  $('#menuHome').addEventListener('click',showDesktop);$('#menuReset').addEventListener('click',()=>{resetLayout();closeMenu()});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#systemMenu')&&!e.target.closest('#systemMenuTrigger'))closeMenu();});
  // Search palette: opening windows, choosing real projects and controlling system preferences.
  const commands=[
    ...Object.entries(appInfo).map(([id,x])=>({id:'open-'+id,title:'打开 '+x.name,sub:'应用程序 / '+x.label,icon:x.icon,terms:x.name+' '+id+' 窗口',action:()=>openWindow(id)})),
    ...projects.map(p=>({id:'project-'+p.id,title:p.title,sub:p.category,icon:'folder',terms:p.description+' '+p.tags.join(' '),action:()=>openWindow('projects',{project:p.id})})),
    {id:'theme',title:'切换深色 / 浅色主题',sub:'外观设置',icon:'sun',terms:'dark light appearance 外观',action:()=>setTheme(state.theme==='dark'?'light':'dark')},
    {id:'motion',title:'开启 / 关闭动态效果',sub:'无障碍 / 动态',icon:'motion',terms:'animation reduced motion 动态',action:()=>setMotion(!state.motion)},
    {id:'home',title:'显示桌面',sub:'最小化所有窗口',icon:'grid',terms:'desktop home 桌面',action:showDesktop},
    {id:'github',title:'打开 GitHub 个人主页',sub:'github.com/AincFh',icon:'code',terms:'GitHub source repo',action:()=>window.open('https://github.com/AincFh','_blank','noopener,noreferrer')}
  ];
  const palette=$('#paletteBackdrop'),paletteInput=$('#paletteInput'),paletteResults=$('#paletteResults');let filtered=[],activeResult=0,returnFocus=null;
  function openPalette(){returnFocus=document.activeElement;palette.hidden=false;paletteInput.value='';renderResults();setTimeout(()=>paletteInput.focus(),40);closeMenu();}
  function closePalette(){palette.hidden=true;returnFocus?.focus?.();}
  function renderResults(){let q=paletteInput.value.toLowerCase().trim();filtered=commands.filter(c=>!q||(c.title+' '+c.sub+' '+c.terms).toLowerCase().includes(q))
      .concat(q&&window.AincWorkspace?window.AincWorkspace.search(q):[]).slice(0,14);activeResult=0;paletteResults.innerHTML=filtered.length?`<div class="palette-group">${q?'MATCHING COMMANDS':'QUICK ACTIONS'} / ${filtered.length}</div>`+filtered.map((c,i)=>`<button class="palette-option ${i===0?'selected':''}" data-result="${i}" role="option" aria-selected="${i===0}"><span class="palette-option-icon">${ICON(c.icon)}</span><span class="palette-option-info"><strong>${escapeHTML(c.title)}</strong><small>${escapeHTML(c.sub)}</small></span><span class="palette-option-arrow">↵</span></button>`).join(''):'<div class="palette-no-results">没有找到匹配的项目或命令。</div>';}
  function selectResult(i){activeResult=i;$$('[data-result]',paletteResults).forEach((b,idx)=>{b.classList.toggle('selected',i===idx);b.setAttribute('aria-selected',i===idx?'true':'false');if(i===idx)b.scrollIntoView({block:'nearest'});});}
  function executeResult(i){const item=filtered[i];if(!item)return;closePalette();item.action();}
  $('#globalSearch').addEventListener('click',openPalette);$('#dockSearch').addEventListener('click',openPalette);paletteInput.addEventListener('input',renderResults);
  paletteResults.addEventListener('click',e=>{let b=e.target.closest('[data-result]');if(b)executeResult(Number(b.dataset.result));});
  palette.addEventListener('click',e=>{if(e.target===palette)closePalette();});
  paletteInput.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();selectResult(Math.min(filtered.length-1,activeResult+1));}else if(e.key==='ArrowUp'){e.preventDefault();selectResult(Math.max(0,activeResult-1));}else if(e.key==='Enter'){e.preventDefault();executeResult(activeResult);}});
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();palette.hidden?openPalette():closePalette();}
    else if(e.key==='Escape'){if(!palette.hidden)closePalette();else closeMenu();}
    else if(e.altKey && /^[1-6]$/.test(e.key)&&!e.ctrlKey&&!e.metaKey){e.preventDefault();openWindow(Object.keys(appInfo)[Number(e.key)-1]);}
  });
  // Window shortcuts: Ctrl+Tab cycles, Ctrl+Shift+F maximizes, Ctrl+Alt+arrows snaps.
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.key==='Tab'&&!e.metaKey){e.preventDefault();cycleWindows();}
    else if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='f'){e.preventDefault();const n=$('.os-window.focused',layer);if(n)toggleMax(n.id.slice(4));}
    else if(e.ctrlKey&&e.altKey&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();snapWindow(e.key==='ArrowLeft'?'left':'right');}
  });
  // Bridge exposes only window operations; persistent documents stay in AincWorkspace.
  if(window.AincWorkspace)window.AincWorkspace.attach({
    open: id=>openWindow(id),
    focus: id=>focusWindow(id),
    close: id=>closeWindow(id),
    arrange: type=>arrangeWindows(type),
    windows: ()=>[...windows.entries()].map(([id,w])=>({
      id:id,name:appInfo[id].name,minimized:w.minimized,maximized:w.maximized
    })),
    toast: toast
  });
  // Ambient animations respond to pointer and accessibility preferences.
  let tracking=false;document.addEventListener('pointermove',e=>{
    if(tracking||!state.motion)return;tracking=true;
    requestAnimationFrame(()=>{document.body.style.setProperty('--mx',e.clientX+'px');document.body.style.setProperty('--my',e.clientY+'px');
      if(!isMobile()){const halo=$('.hero-holo');if(halo){halo.style.setProperty('--holo-x',((e.clientX/innerWidth)-.5)*22+'px');halo.style.setProperty('--holo-y',((e.clientY/innerHeight)-.5)*18+'px');}}
      tracking=false;});
  },{passive:true});
  // Subtle, pointer-driven 3D interaction on launch modules.
  $$('.launcher').forEach(card=>{
    card.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!state.motion)return;const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      card.style.setProperty('--card-rx',((.5-y)*8)+'deg');card.style.setProperty('--card-ry',((x-.5)*9)+'deg');card.style.setProperty('--card-x',(x*100)+'%');card.style.setProperty('--card-y',(y*100)+'%');
    },{passive:true});
    card.addEventListener('pointerleave',()=>{card.style.removeProperty('--card-rx');card.style.removeProperty('--card-ry');card.style.removeProperty('--card-x');card.style.removeProperty('--card-y');});
  });
  const typeLines=['Design. Build. Ship.','Craft meets engineering.','Interfaces with identity.','Code that actually works.'];
  let lineIndex=0,charIndex=0,removing=false;const typeEl=$('#typeText');
  function typeLoop(){if(!state.motion){typeEl.textContent=typeLines[0];setTimeout(typeLoop,1800);return;}let line=typeLines[lineIndex];
    if(!removing){charIndex=Math.min(line.length,charIndex+1);typeEl.textContent=line.slice(0,charIndex);if(charIndex===line.length){removing=true;setTimeout(typeLoop,2300);return;}}
    else{charIndex=Math.max(0,charIndex-1);typeEl.textContent=line.slice(0,charIndex);if(charIndex===0){removing=false;lineIndex=(lineIndex+1)%typeLines.length;setTimeout(typeLoop,400);return;}}
    setTimeout(typeLoop,removing?38:78);
  }
  function updateClock(){const t=new Date();$('#menuClock').textContent=t.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});}
  applySettings();typeLoop();updateClock();setInterval(updateClock,30_000);
  // On wide screens we surface a functional project window; on mobile, launchers are the home screen.
  if(!isMobile())openWindow('projects',{announce:false,focusInput:false});
})();
