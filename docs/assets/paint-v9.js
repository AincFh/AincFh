/* AincFh OS Paint — browser canvas application with local document persistence.
   No external requests, no native file permissions. */
(function(){
  'use strict';
  const WIDTH=1100,HEIGHT=660,KEY='paint-current-v1',BG='#f8f3ef';
  const colors=['#26212c','#ff9f43','#aa7bf1','#45bca4','#75b7ed','#e76f8a','#f1c76c','#ffffff'];
  let bridge=null,canvas=null,ctx=null,tool='brush',color=colors[0],size=6,zoom=100;
  let drawing=false,modified=false,current=null,history=[],index=-1,version=0,loaded=false;
  let origin=null,previous=null,showGrid=false,documentName='Untitled drawing',linkedFileId=null;
  const $=(s,el=document)=>el.querySelector(s);
  function escape(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function toast(t){bridge?.toast(t)}
  function showState(text){const n=$('#paintSaveState');if(n)n.textContent=text}
  function blank(){
    if(!ctx)return;ctx.fillStyle=BG;ctx.fillRect(0,0,WIDTH,HEIGHT)
  }
  function capture(){return canvas?.toDataURL('image/png')||null}
  function put(source){
    if(!canvas||!ctx)return Promise.resolve(false);
    if(!source){blank();return Promise.resolve(true)}
    const revision=++version;
    return new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>{if(revision!==version){resolve(false);return}
        ctx.clearRect(0,0,WIDTH,HEIGHT);ctx.drawImage(img,0,0,WIDTH,HEIGHT);resolve(true)};
      img.onerror=()=>{toast('无法读取画布图像');resolve(false)};
      img.src=source;
    });
  }
  function updateButtons(){
    const undo=$('[data-paint-action="undo"]'),redo=$('[data-paint-action="redo"]');
    if(undo)undo.disabled=index<=0;
    if(redo)redo.disabled=index<0||index>=history.length-1;
    const toolStatus=$('#paintToolStatus');
    if(toolStatus)toolStatus.textContent=tool.toUpperCase()+' · '+size+' PX · '+zoom+'%';
  }
  function push(){
    const png=capture();if(!png)return;
    if(history[index]===png){updateButtons();return}
    history=history.slice(0,index+1);history.push(png);
    if(history.length>18)history.shift();
    index=history.length-1;current=png;modified=true;updateButtons();persist();
  }
  async function persist(){
    if(!current)return;
    const value={src:current,name:documentName,updatedAt:new Date().toISOString()};
    showState('Saving locally…');
    try{
      if(window.AincStorage)await window.AincStorage.write(KEY,value);
      else if(current.length<300000)localStorage.setItem('aincfh_'+KEY,JSON.stringify(value));
      else throw Error('大容量保存需要 IndexedDB');
      showState('Saved in browser ✓');
    }catch(e){showState('Save failed — export a PNG');toast('绘图持久化失败：请导出 PNG')}
  }
  async function ensureLoaded(){
    if(loaded)return;loaded=true;
    let value=null;try{
      if(window.AincStorage)value=await window.AincStorage.read(KEY);
      if(!value)value=JSON.parse(localStorage.getItem('aincfh_'+KEY)||'null');
    }catch(e){}
    if(modified||!canvas)return;
    if(value?.src){documentName=value.name||documentName;current=value.src;await put(current)}
    else blank();
    history=[capture()];index=0;updateButtons();showState(value?.src?'Restored from browser':'New drawing');
    const title=$('#paintDocTitle');if(title)title.textContent=documentName;
  }
  function coords(ev){
    const r=canvas.getBoundingClientRect();
    return {x:Math.max(0,Math.min(WIDTH,(ev.clientX-r.left)*WIDTH/Math.max(1,r.width))),
      y:Math.max(0,Math.min(HEIGHT,(ev.clientY-r.top)*HEIGHT/Math.max(1,r.height)))};
  }
  function style(){
    ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=size;ctx.strokeStyle=tool==='eraser'?BG:color;
  }
  function drawShape(start,end){
    style();ctx.beginPath();
    if(tool==='line'){ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke()}
    if(tool==='rect'){ctx.strokeRect(Math.min(start.x,end.x),Math.min(start.y,end.y),Math.abs(end.x-start.x),Math.abs(end.y-start.y))}
  }
  function down(ev){
    if(ev.button!==0||!canvas)return;
    ev.preventDefault();const p=coords(ev);drawing=true;origin=p;
    if(tool==='line'||tool==='rect'){previous=ctx.getImageData(0,0,WIDTH,HEIGHT)}
    else{style();ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.01,p.y+.01);ctx.stroke()}
    canvas.setPointerCapture?.(ev.pointerId);showState('Editing…');
  }
  function move(ev){
    if(!drawing)return;
    const p=coords(ev);
    if(tool==='line'||tool==='rect'){if(previous)ctx.putImageData(previous,0,0);drawShape(origin,p)}
    else{style();ctx.lineTo(p.x,p.y);ctx.stroke()}
  }
  function up(ev){
    if(!drawing)return;
    move(ev);drawing=false;previous=null;
    try{canvas.releasePointerCapture(ev.pointerId)}catch(e){}
    push();
  }
  function historyMove(step){
    const target=index+step;if(target<0||target>=history.length)return;
    index=target;put(history[index]).then(ok=>{if(ok){current=history[index];persist();updateButtons()}});
  }
  function importImage(file){
    if(!file)return;
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)){toast('仅支持 PNG / JPEG / WebP');return}
    if(file.size>6*1024*1024){toast('图片大小上限 6 MB');return}
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        blank();
        const ratio=Math.min(WIDTH/img.width,HEIGHT/img.height),w=img.width*ratio,h=img.height*ratio;
        ctx.drawImage(img,(WIDTH-w)/2,(HEIGHT-h)/2,w,h);
        documentName=file.name.replace(/\.[^.]+$/,'');linkedFileId=null;push();toast('图片已导入画布');
      };
      img.onerror=()=>toast('图片解析失败');
      img.src=reader.result;
    };
    reader.onerror=()=>toast('读取本地图片失败');
    reader.readAsDataURL(file);
  }
  function exportPng(){
    if(!canvas)return;
    const a=document.createElement('a');a.download=(documentName.replace(/[\\/:*?"<>|]/g,'_')||'AincFh-drawing')+'.png';a.href=capture();document.body.append(a);a.click();a.remove();
  }
  function exportToFiles(){
    if(!canvas){toast('画布尚未打开');return}
    const img=capture();
    if(!window.AincWorkspace?.saveImage){toast('文件服务不可用，请先导出 PNG');return}
    const name=(documentName||'Untitled drawing').replace(/\.(png|jpg|webp)$/i,'')+'.png';
    const done=window.AincWorkspace.saveImage(name,img,'workspace',linkedFileId);
    if(done){linkedFileId=done;toast('绘图已同步到 Files，后续保存会更新同一文件')}
  }
  function reset(){
    blank();push();showState('Canvas cleared');
  }
  const toolNames=[['brush','Pen'],['eraser','Eraser'],['line','Line'],['rect','Rectangle']];
  function render(){
    return '<div class="paint-app">'+
      '<div class="paint-top"><div><span class="win-eyebrow">CREATIVE / CANVAS ENGINE</span><h2>Paint<span>.</span></h2><p>Local artwork · PNG import / export · persistent canvas · no cloud sync</p></div><span id="paintSaveState" class="paint-save">Canvas ready</span></div>'+
      '<div class="paint-bar"><div class="paint-tools">'+toolNames.map(([id,name])=>'<button data-paint-tool="'+id+'" aria-pressed="'+(id===tool)+'">'+name+'</button>').join('')+'</div>'+
        '<div class="paint-colors">'+colors.map(c=>'<button data-paint-color="'+c+'" aria-label="Select '+c+'" aria-pressed="'+(c===color)+'" style="--swatch:'+c+'"></button>').join('')+'</div>'+
        '<label class="paint-size">SIZE <input type="range" data-paint-size min="1" max="36" value="'+size+'" aria-label="Brush size"/><output id="paintSize">'+size+'</output></label>'+
      '</div>'+
      '<div class="paint-bar paint-secondary"><span class="paint-doc-name" id="paintDocTitle">'+escape(documentName)+'</span>'+
        '<button data-paint-action="undo" title="Undo (Ctrl+Z)">Undo</button><button data-paint-action="redo" title="Redo (Ctrl+Y)">Redo</button>'+
        '<button data-paint-action="grid" aria-pressed="'+showGrid+'">Grid</button>'+
        '<label class="paint-size">ZOOM <input type="range" data-paint-zoom min="75" max="170" step="5" value="'+zoom+'"/><output id="paintZoom">'+zoom+'%</output></label>'+
        '<button data-paint-action="import">Import image</button><button data-paint-action="clear">Clear</button>'+
        '<button data-paint-action="export">Export PNG</button><button class="primary" data-paint-action="save">Save to Files</button>'+
        '<input type="file" id="paintImportFile" accept="image/png,image/jpeg,image/webp" hidden/>'+
      '</div>'+
      '<div class="paint-stage"><div class="paint-board-scroll"><div class="paint-board '+(showGrid?'with-grid':'')+'" id="paintBoard">'+
        '<canvas id="paintCanvas" width="'+WIDTH+'" height="'+HEIGHT+'" aria-label="Interactive drawing canvas"></canvas>'+
        '</div></div></div>'+
      '<div class="paint-footer"><span>1100 × 660 PX · RGB / PNG</span><span id="paintToolStatus"></span><span>ALL DATA STAYS IN THIS BROWSER</span></div>'+
    '</div>';
  }
  function onRender(){
    const next=$('#app-paint #paintCanvas');if(!next)return;
    canvas=next;ctx=canvas.getContext('2d',{willReadFrequently:true});blank();
    if(!history.length){history=[capture()];index=0}
    canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);
    canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
    if(current)put(current);
    else ensureLoaded();
    updateButtons();setZoom();
  }
  function setZoom(){
    const board=$('#paintBoard');if(board)board.style.width=zoom+'%';
    const out=$('#paintZoom');if(out)out.textContent=zoom+'%';
  }
  function handleAction(key){
    if(key==='undo')historyMove(-1);
    else if(key==='redo')historyMove(1);
    else if(key==='clear')reset();
    else if(key==='import')$('#paintImportFile')?.click();
    else if(key==='export')exportPng();
    else if(key==='save')exportToFiles();
    else if(key==='grid'){showGrid=!showGrid;const b=$('#paintBoard');b?.classList.toggle('with-grid',showGrid);const t=$('[data-paint-action="grid"]');t?.setAttribute('aria-pressed',String(showGrid))}
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('#app-paint button');if(!b)return;
    if(b.dataset.paintTool){tool=b.dataset.paintTool;document.querySelectorAll('#app-paint [data-paint-tool]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));updateButtons()}
    if(b.dataset.paintColor){color=b.dataset.paintColor;document.querySelectorAll('#app-paint [data-paint-color]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)))}
    if(b.dataset.paintAction)handleAction(b.dataset.paintAction);
  });
  document.addEventListener('input',e=>{
    if(e.target.matches('#app-paint [data-paint-size]')){size=Number(e.target.value);$('#paintSize').textContent=size;updateButtons()}
    if(e.target.matches('#app-paint [data-paint-zoom]')){zoom=Number(e.target.value);setZoom();updateButtons()}
  });
  document.addEventListener('change',e=>{if(e.target.id==='paintImportFile'){importImage(e.target.files?.[0]);e.target.value=''}});
  document.addEventListener('keydown',e=>{
    if(!e.target.closest('#app-paint'))return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();historyMove(e.shiftKey?1:-1)}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();historyMove(1)}
  });
  window.AincPaint={
    attach(b){bridge=b},
    render,onRender,
    openImage(name,src,id){
      documentName=String(name||'Drawing').replace(/\.png$/i,'');
      current=src;modified=true;history=[src];index=0;linkedFileId=id||null;
      bridge?.open('paint');
      setTimeout(()=>{put(src);const title=$('#paintDocTitle');if(title)title.textContent=documentName;updateButtons()},25);
    },
    getCanvas:()=>canvas,
    getSnapshot:()=>current,
    saveToFiles:exportToFiles
  };
})();