/* AincFh OS App Suite v8: Calculator, Tasks, Clock and App Center.
   All computations and task data are local, never execute arbitrary JS. */
(function(){
'use strict';
var bridge=null;
var esc=function(v){return String(v===undefined?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
function toast(s){bridge?.toast(s)}
function notify(s){window.AincWorkspace?.notify(s)}
function dateTime(){return new Date().toLocaleString('zh-CN',{dateStyle:'full',timeStyle:'medium'})}
function getLS(key,initial){try{var t=localStorage.getItem(key);return t===null?initial:JSON.parse(t)}catch(e){return initial}}
function putLS(key,x){try{localStorage.setItem(key,JSON.stringify(x))}catch(e){}}
function storage(key,x){putLS('aincfh_'+key,x);window.AincStorage?.write(key,x).catch(function(e){toast('存储异常：'+e.message)})}
var calc={expression:'',answer:'',history:getLS('aincfh_calculator_history',[]).slice(0,30)};
function tokenize(expr){
 var t=[],s=String(expr).replace(/[×x]/g,'*').replace(/[÷]/g,'/').replace(/,/g,'').replace(/π/g,String(Math.PI));
 for(var i=0;i<s.length;){var c=s[i];if(/\s/.test(c)){i++;continue}
 if(/[()+\-*/^%]/.test(c)){t.push(c);i++;continue}
 if(/[0-9.]/.test(c)){var m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);if(!m)throw Error('Invalid number');t.push({value:Number(m[0])});i+=m[0].length;continue}
 throw Error('Unsupported token at character '+(i+1));
 }return t;
}
function evaluate(expr){
 var tokens=tokenize(expr),at=0;
 function primary(){
   var x=tokens[at++];
   if(x===undefined)throw Error('Expected a number');
   if(x==='+')return primary();
   if(x==='-')return -primary();
   if(x==='('){var value=parse(0);if(tokens[at++]!==')')throw Error('Missing closing parenthesis');return value}
   if(typeof x==='object')return x.value;
   throw Error('Unexpected token '+String(x));
 }
 var powers={'+':1,'-':1,'*':2,'/':2,'^':3};
 function parse(min){
   var left=primary();
   while(at<tokens.length){
     var op=tokens[at];
     if(op==='%'){at++;left/=100;continue}
     if(op===')'||!(op in powers)||powers[op]<min)break;
     at++;var right=parse(powers[op]+(op==='^'?0:1));
     if(op==='+')left+=right;else if(op==='-')left-=right;else if(op==='*')left*=right;
     else if(op==='/'){if(right===0)throw Error('Division by zero');left/=right}
     else if(op==='^')left=Math.pow(left,right);
     if(!Number.isFinite(left))throw Error('Result outside supported range');
   }
   return left;
 }
 var value=parse(0);if(at!==tokens.length)throw Error('Incomplete expression');
 if(!Number.isFinite(value))throw Error('Invalid result');
 return Math.abs(value)>1e12||Math.abs(value)<1e-7&&value!==0?Number(value.toPrecision(10)):Number(value.toPrecision(12));
}
function renderCalculator(){
 return '<div class="su-calc"><div class="su-head"><span class="win-eyebrow">UTILITIES / MATH ENGINE</span><h2>Calculator<span>.</span></h2><p>No eval() / no remote execution · parentheses, exponent and percentages</p></div>'+
 '<div class="su-calcshell"><div class="su-calc-display"><span>EXPRESSION</span><input id="suCalcExpr" data-calc-input value="'+esc(calc.expression)+'" autocomplete="off" spellcheck="false" inputmode="decimal" aria-label="Math expression"/><output id="suCalcResult">'+esc(calc.answer||'0')+'</output></div>'+
 '<div class="su-calc-grid">'+[
 ['AC','clear'],['⌫','back'],['%','%'],['÷','/'],['7','7'],['8','8'],['9','9'],['×','*'],
 ['4','4'],['5','5'],['6','6'],['−','-'],['1','1'],['2','2'],['3','3'],['+','+'],
 ['(','('],['0','0'],['.','.'],[')',')'],['xʸ','^'],['π','π'],['Ans','ans'],['=','equals']
 ].map(function(x){return '<button data-calc-key="'+esc(x[1])+'" class="'+(x[1]==='equals'?'su-calc-equals':/[+\-*/^%]/.test(x[1])?'su-calc-op':'')+'">'+x[0]+'</button>'}).join('')+'</div>'+
 '</div><section class="su-calc-history"><div class="su-subheading">HISTORY · LAST 30 <button data-calc-action="history-clear">Clear</button></div>'+
 (calc.history.length?calc.history.map(function(h){return '<button data-calc-history="'+esc(h.result)+'"><span>'+esc(h.expression)+'</span><strong>'+esc(h.result)+'</strong></button>'}).join(''):'<div class="su-muted">Calculations appear here and can be reused.</div>')+'</section></div>';
}
function calcAction(k){
 if(k==='clear'){calc.expression='';calc.answer='';refresh('calculator');return}
 if(k==='back'){calc.expression=calc.expression.slice(0,-1);refresh('calculator');return}
 if(k==='ans'){calc.expression+=String(calc.answer||0);refresh('calculator');return}
 if(k==='equals'){
   try{var value=evaluate(calc.expression);calc.answer=String(value);calc.history.unshift({expression:calc.expression,result:calc.answer});calc.history=calc.history.slice(0,30);
     storage('calculator_history',calc.history);notify('Calculator · '+calc.expression+' = '+calc.answer);
   }catch(e){calc.answer='Error: '+e.message;toast(calc.answer)}refresh('calculator');return;
 }
 calc.expression+=k;refresh('calculator');
}
var taskKey='tasks-v8',tasks=getLS('aincfh_'+taskKey,[]),tasksDirty=false,taskFilter='all';
if(!Array.isArray(tasks))tasks=[];
window.AincStorage?.read(taskKey).then(function(x){
 if(!tasksDirty&&Array.isArray(x)){tasks=x;refresh('tasks')}
}).catch(function(){});
function saveTasks(eventText){
 if(tasks.length>400){toast('任务数量上限 400');return false}
 tasksDirty=true;storage(taskKey,tasks);if(eventText)notify(eventText);refresh('tasks');return true;
}
function validTask(title){return title&&title.length<=160}
function renderTasks(){
 var pending=tasks.filter(x=>!x.done).length,completed=tasks.length-pending;
 var data=tasks.filter(function(x){return taskFilter==='all'||taskFilter==='active'&&!x.done||taskFilter==='done'&&x.done}).slice().sort(function(a,b){return(Number(a.done)-Number(b.done))||(a.due||'9999').localeCompare(b.due||'9999')||b.created.localeCompare(a.created)});
 return '<div class="su-tasks"><div class="su-head"><span class="win-eyebrow">PRODUCTIVITY / LOCAL TASKS</span><h2>Task Board<span>.</span></h2><p>Private tasks in the browser · dates are reminders for display, not background notifications.</p></div>'+
 '<div class="su-task-count"><div><strong>'+pending+'</strong><span>OPEN TASKS</span></div><div><strong>'+completed+'</strong><span>COMPLETED</span></div><div><strong>'+tasks.length+'</strong><span>ALL ITEMS</span></div></div>'+
 '<form id="suTaskForm" class="su-task-form"><label><span>TASK NAME</span><input id="suTaskName" required maxlength="160" placeholder="What needs to be done?" autocomplete="off"/></label>'+
 '<label><span>DUE DATE</span><input id="suTaskDue" type="date"/></label><label><span>PRIORITY</span><select id="suTaskPriority"><option value="normal">Normal</option><option value="high">High</option><option value="low">Low</option></select></label>'+
 '<button type="submit">+ ADD TASK</button></form>'+
 '<div class="su-task-filters"><div>'+[['all','All'],['active','Open'],['done','Completed']].map(function(x){return '<button data-task-filter="'+x[0]+'" aria-pressed="'+(taskFilter===x[0])+'">'+x[1]+'</button>'}).join('')+'</div><button data-task-clear>Clear done</button></div>'+
 '<div class="su-task-list">'+(data.length?data.map(function(t){return '<div class="su-task-row '+(t.done?'is-done':'')+'" data-task-id="'+esc(t.id)+'">'+
 '<button data-task-toggle="'+esc(t.id)+'" aria-label="'+(t.done?'Reopen':'Complete')+' task" aria-pressed="'+t.done+'" class="su-task-check">'+(t.done?'✓':'')+'</button>'+
 '<div class="su-task-info"><strong>'+esc(t.title)+'</strong><span><i data-priority="'+esc(t.priority)+'">'+esc(t.priority.toUpperCase())+'</i> '+(t.due?'DUE '+esc(t.due):'NO DEADLINE')+'</span></div>'+
 '<button data-task-edit="'+esc(t.id)+'" aria-label="Edit task">Edit</button><button data-task-delete="'+esc(t.id)+'" aria-label="Delete task">×</button></div>'}).join(''):
 '<div class="su-empty"><strong>Nothing to show.</strong><p>Use the form above to create a task. Refresh the page to verify persistence.</p></div>')+'</div></div>';
}
var clock={duration:5*60,remaining:5*60,deadline:0,running:false,stopwatchStart:0,stopwatchElapsed:0,stopwatchRunning:false};
try{var cs=getLS('aincfh_clock_session',null);if(cs){clock={...clock,...cs};if(clock.running&&clock.deadline<=Date.now()){clock.running=false;clock.remaining=0}}}catch(e){}
function clockSave(){putLS('aincfh_clock_session',clock)}
function remaining(){
 return clock.running?Math.max(0,Math.ceil((clock.deadline-Date.now())/1000)):clock.remaining;
}
function fmt(sec){sec=Math.max(0,Math.floor(sec));return String(Math.floor(sec/3600)).padStart(2,'0')+':'+String(Math.floor(sec%3600/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}
function elapsed(){return clock.stopwatchRunning?clock.stopwatchElapsed+(Date.now()-clock.stopwatchStart)/1000:clock.stopwatchElapsed}
function renderClock(){
 return '<div class="su-clock"><div class="su-head"><span class="win-eyebrow">TIME / UTILITIES</span><h2>Clock<span>.</span></h2><p>Local time, a session timer and a stopwatch. Timer continues by deadline while the tab remains open.</p></div>'+
 '<div class="su-clock-top"><small>LOCAL TIME</small><strong id="suClockTime">'+dateTime()+'</strong><span>The clock uses your browser time zone.</span></div>'+
 '<div class="su-clock-grid"><section class="su-clock-card"><div class="su-subheading">COUNTDOWN TIMER</div><output class="su-clock-counter" id="suTimer">'+fmt(remaining())+'</output>'+
 '<div class="su-clock-presets">'+[1,5,15,25].map(x=>'<button data-timer-preset="'+x+'">'+x+'m</button>').join('')+'</div>'+
 '<div class="su-clock-actions"><button data-timer-action="'+(clock.running?'pause':'start')+'" class="primary">'+(clock.running?'PAUSE':'START')+'</button><button data-timer-action="reset">RESET</button></div></section>'+
 '<section class="su-clock-card"><div class="su-subheading">STOPWATCH</div><output class="su-clock-counter" id="suStopwatch">'+fmt(elapsed())+'</output>'+
 '<p class="su-muted">Measured from browser time. This does not trigger notifications when the browser is fully closed.</p>'+
 '<div class="su-clock-actions"><button data-stopwatch-action="'+(clock.stopwatchRunning?'pause':'start')+'" class="primary">'+(clock.stopwatchRunning?'PAUSE':'START')+'</button><button data-stopwatch-action="reset">RESET</button></div></section></div></div>';
}
function tick(){
 if(clock.running&&clock.deadline<=Date.now()){
   clock.running=false;clock.remaining=0;clockSave();notify('Timer completed');toast('计时已结束');}
 var d=document.getElementById('suTimer'),s=document.getElementById('suStopwatch'),t=document.getElementById('suClockTime');
 if(d)d.textContent=fmt(remaining());if(s)s.textContent=fmt(elapsed());if(t)t.textContent=dateTime();
}
setInterval(tick,1000);
var catalogFilter='all',catalogQuery='',favorites=getLS('aincfh_app_favorites',[]),catalogRecent=getLS('aincfh_app_recent',[]);
if(!Array.isArray(favorites))favorites=[];if(!Array.isArray(catalogRecent))catalogRecent=[];
function appGroup(id){
 if(['projects','stack','about','contact'].includes(id))return 'work';
 if(['terminal','settings','activity','apps'].includes(id))return 'system';
 return 'tools';
}
function filteredCatalog(){
 var running=(bridge?.windows?.()||[]).map(x=>x.id);
 return (bridge?.listApps()||[]).map(function(x){return {...x,group:appGroup(x.id),favorite:favorites.includes(x.id),running:running.includes(x.id)}})
 .filter(function(x){
  var group=catalogFilter==='all'||catalogFilter==='recent'&&catalogRecent.includes(x.id)||catalogFilter==='favorites'&&x.favorite||catalogFilter===x.group;
  return group&&(!catalogQuery||(x.name+' '+x.label+' '+x.id).toLowerCase().includes(catalogQuery.toLowerCase()))
 }).sort(function(a,b){
  if(catalogFilter==='recent')return catalogRecent.indexOf(a.id)-catalogRecent.indexOf(b.id);
  return Number(b.favorite)-Number(a.favorite)||a.name.localeCompare(b.name);
 });
}
function renderCatalogCards(){
 var list=filteredCatalog();
 return list.length?list.map(function(x){
  return '<article class="su-app-card"><button data-catalog-open="'+esc(x.id)+'" class="su-app-tile" title="Launch '+esc(x.name)+'">'+
  '<span class="su-app-symbol"><svg aria-hidden="true"><use href="#i-'+esc(x.icon)+'"></use></svg></span>'+
  '<strong>'+esc(x.name)+'</strong><small>'+esc(x.label)+'</small>'+
  '<span class="su-app-open">'+(x.running?'● RUNNING':'OPEN →')+'</span></button>'+
  '<button class="su-app-pin '+(x.favorite?'is-pinned':'')+'" data-catalog-pin="'+esc(x.id)+'" aria-pressed="'+x.favorite+'" aria-label="'+(x.favorite?'Unfavorite ':'Favorite ')+esc(x.name)+'">'+(x.favorite?'★':'☆')+'</button></article>';
 }).join(''):'<div class="su-app-empty">No matching apps. Clear search or select All.</div>';
}
function renderCatalog(){
 var list=filteredCatalog();
 return '<div class="su-catalog"><div class="su-head"><span class="win-eyebrow">SYSTEM / APP REGISTRY</span><h2>App Center<span>.</span></h2><p>All installed web modules. Launch an app, find it by name or keep favorites. No remote application installation is performed.</p></div>'+
 '<div class="su-app-toolbar"><label><svg aria-hidden="true"><use href="#i-search"></use></svg><input id="suAppSearch" value="'+esc(catalogQuery)+'" placeholder="Search installed applications…" autocomplete="off" spellcheck="false"/></label>'+
 '<div class="su-app-filters">'+[['all','All'],['work','Work'],['tools','Tools'],['system','System'],['favorites','Favorites'],['recent','Recent']].map(function(x){return '<button data-catalog-filter="'+x[0]+'" aria-pressed="'+(catalogFilter===x[0])+'">'+x[1]+'</button>'}).join('')+'</div></div>'+
 '<div id="suAppCount" class="su-app-count">'+list.length+' OF '+(bridge?.listApps()||[]).length+' REGISTERED APPS · BROWSER RUNTIME</div>'+
 '<div id="suAppGrid" class="su-app-grid">'+renderCatalogCards()+'</div></div>';
}
function refresh(id){if(bridge)bridge.refresh(id)}
function handler(e){
 var b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-calc-key')){calcAction(b.dataset.calcKey);return}
 if(b.hasAttribute('data-calc-action')){calc.history=[];storage('calculator_history',[]);refresh('calculator');return}
 if(b.hasAttribute('data-calc-history')){calc.expression=b.dataset.calcHistory;calc.answer=calc.expression;refresh('calculator');return}
 if(b.hasAttribute('data-task-filter')){taskFilter=b.dataset.taskFilter;refresh('tasks');return}
 if(b.hasAttribute('data-task-toggle')){
   var task=tasks.find(x=>x.id===b.dataset.taskToggle);if(task){task.done=!task.done;task.modified=new Date().toISOString();saveTasks(task.title+' · '+(task.done?'completed':'reopened'))}return;
 }
 if(b.hasAttribute('data-task-delete')){var x=tasks.find(t=>t.id===b.dataset.taskDelete);tasks=tasks.filter(t=>t.id!==b.dataset.taskDelete);saveTasks(x?.title+' deleted');return}
 if(b.hasAttribute('data-task-edit')){
   var task=tasks.find(t=>t.id===b.dataset.taskEdit);if(!task)return;
   var form=document.getElementById('suTaskForm');if(!form)return;
   form.dataset.editId=task.id;form.querySelector('#suTaskName').value=task.title;form.querySelector('#suTaskDue').value=task.due||'';form.querySelector('#suTaskPriority').value=task.priority||'normal';form.querySelector('button[type=submit]').textContent='SAVE CHANGES';
   form.querySelector('#suTaskName').focus();return;
 }
 if(b.hasAttribute('data-task-clear')){tasks=tasks.filter(x=>!x.done);saveTasks('Cleared completed tasks');return}
 if(b.hasAttribute('data-timer-preset')){
   var minutes=Number(b.dataset.timerPreset);clock.duration=minutes*60;clock.remaining=clock.duration;clock.running=false;clock.deadline=0;clockSave();refresh('clock');return;
 }
 if(b.hasAttribute('data-timer-action')){
   if(b.dataset.timerAction==='start'){clock.deadline=Date.now()+Math.max(1,clock.remaining)*1000;clock.running=true}
   if(b.dataset.timerAction==='pause'){clock.remaining=remaining();clock.running=false}
   if(b.dataset.timerAction==='reset'){clock.running=false;clock.remaining=clock.duration}
   clockSave();refresh('clock');return;
 }
 if(b.hasAttribute('data-stopwatch-action')){
   if(b.dataset.stopwatchAction==='start'){clock.stopwatchStart=Date.now();clock.stopwatchRunning=true}
   if(b.dataset.stopwatchAction==='pause'){clock.stopwatchElapsed=elapsed();clock.stopwatchRunning=false}
   if(b.dataset.stopwatchAction==='reset'){clock.stopwatchRunning=false;clock.stopwatchElapsed=0}
   clockSave();refresh('clock');return;
 }
 if(b.hasAttribute('data-catalog-filter')){catalogFilter=b.dataset.catalogFilter;refresh('apps');return}
 if(b.hasAttribute('data-catalog-pin')){
   var id=b.dataset.catalogPin;
   favorites=favorites.includes(id)?favorites.filter(x=>x!==id):favorites.concat(id);
   putLS('aincfh_app_favorites',favorites);refresh('apps');return;
 }
 if(b.hasAttribute('data-catalog-open')){bridge?.open(b.dataset.catalogOpen);return}
}
document.addEventListener('click',handler);
document.addEventListener('submit',function(e){
 if(e.target.id!=='suTaskForm')return;e.preventDefault();
 var f=e.target,title=f.querySelector('#suTaskName').value.trim(),due=f.querySelector('#suTaskDue').value,priority=f.querySelector('#suTaskPriority').value;
 if(!validTask(title)){toast('任务名称最多 160 个字符');return}
 var id=f.dataset.editId,task=tasks.find(x=>x.id===id);
 if(task){task.title=title;task.due=due;task.priority=priority;task.modified=new Date().toISOString()}
 else if(tasks.length<400){tasks.push({id:crypto.randomUUID?.()||'task-'+Date.now(),title,due,priority,done:false,created:new Date().toISOString(),modified:new Date().toISOString()})}
 else {toast('最多保存 400 个任务');return}
 saveTasks('Task saved: '+title);
});
document.addEventListener('keydown',function(e){
 var x=e.target;
 if(x?.id==='suCalcExpr'&&e.key==='Enter'){e.preventDefault();calc.expression=x.value;calcAction('equals')}
});
document.addEventListener('input',function(e){
 if(e.target.id==='suCalcExpr'){calc.expression=e.target.value;return}
 if(e.target.id==='suAppSearch'){
   catalogQuery=e.target.value;
   var grid=document.getElementById('suAppGrid'),counter=document.getElementById('suAppCount');
   if(grid)grid.innerHTML=renderCatalogCards();
   if(counter)counter.textContent=filteredCatalog().length+' OF '+(bridge?.listApps()||[]).length+' REGISTERED APPS · BROWSER RUNTIME';
 }
});
window.AincApps={
 attach:function(x){bridge=x},
 recordOpen:function(id){catalogRecent=[id].concat(catalogRecent.filter(x=>x!==id)).slice(0,12);putLS('aincfh_app_recent',catalogRecent);},
 render:function(id){if(id==='calculator')return renderCalculator();if(id==='tasks')return renderTasks();if(id==='clock')return renderClock();if(id==='apps')return renderCatalog();return null},
 get summary(){return{tasks:tasks.length,openTasks:tasks.filter(x=>!x.done).length,calculations:calc.history.length}},
 evaluate:evaluate
};
})();