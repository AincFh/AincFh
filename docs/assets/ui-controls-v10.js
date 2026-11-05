/* AincFh OS custom browser-control facades — Select and Date.
 * Original form elements remain in DOM for normal submission and validation.
 * File picker permission dialogs remain browser/OS controlled by design. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
let current=null,calendarMonth=null,calendarYear=null,observer=null,pending=false;
const esc=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const language=()=>window.AincI18n?.locale||'en-US';
function txt(key){
 const dict={
   'en-US':{choose:'Select an option',date:'Choose a date',today:'Today',clear:'Clear',cancel:'Cancel',prev:'Previous month',next:'Next month'},
   'zh-CN':{choose:'请选择',date:'选择日期',today:'今天',clear:'清除',cancel:'取消',prev:'上个月',next:'下个月'},
   'zh-TW':{choose:'請選擇',date:'選擇日期',today:'今天',clear:'清除',cancel:'取消',prev:'上個月',next:'下個月'},
   'ja-JP':{choose:'選択してください',date:'日付を選択',today:'今日',clear:'クリア',cancel:'キャンセル',prev:'前の月',next:'次の月'}
 };
 return (dict[language()]||dict['en-US'])[key]||key;
}
function dateLabel(input){
 if(!input.value)return txt('date');
 const [y,m,d]=input.value.split('-').map(Number);
 if(!y||!m||!d)return input.value;
 try{return new Intl.DateTimeFormat(language(),{year:'numeric',month:'long',day:'numeric'}).format(new Date(y,m-1,d))}catch{return input.value}
}
function selectedLabel(select){const option=select.selectedOptions?.[0];return option?(window.AincI18n?.t(option.textContent.trim())||option.textContent.trim()):txt('choose')}
function upgradeSelect(select){
 if(select.dataset.osEnhanced||select.closest('.os-native-control'))return;
 const container=document.createElement('span');container.className='os-control os-select-control';
 const button=document.createElement('button');button.type='button';button.className='os-select-face';button.dataset.osSelectFace='';
 button.setAttribute('aria-haspopup','listbox');
 if(select.id)button.setAttribute('aria-controls','os-listbox-'+select.id);
 select.parentNode.insertBefore(container,select);
 container.append(select,button);
 select.dataset.osEnhanced='select';select.tabIndex=-1;select.setAttribute('aria-hidden','true');select.classList.add('os-native-source');
 button.innerHTML='<span>'+esc(selectedLabel(select))+'</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
 button.setAttribute('aria-label',select.getAttribute('aria-label')||selectedLabel(select));
}
function upgradeDate(input){
 if(input.dataset.osEnhanced||input.closest('.os-native-control'))return;
 const container=document.createElement('span');container.className='os-control os-date-control';
 const button=document.createElement('button');button.type='button';button.className='os-date-face';button.dataset.osDateFace='';
 button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label',input.getAttribute('aria-label')||txt('date'));
 input.parentNode.insertBefore(container,input);container.append(input,button);
 input.dataset.osEnhanced='date';input.tabIndex=-1;input.classList.add('os-native-source');input.setAttribute('aria-hidden','true');
 button.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></svg><span>'+esc(dateLabel(input))+'</span>';
}
function upgrade(root){
 if(root?.matches?.('select'))upgradeSelect(root);
 if(root?.matches?.('input[type="date"]'))upgradeDate(root);
 for(const s of $$('select:not([data-os-enhanced])',root||document))upgradeSelect(s);
 for(const d of $$('input[type="date"]:not([data-os-enhanced])',root||document))upgradeDate(d);
}
function source(btn){return btn.closest('.os-control')?.querySelector('.os-native-source')}
function popup(){let root=$('#osControlPopup');if(root)return root;root=document.createElement('section');root.id='osControlPopup';root.className='os-control-popup';root.hidden=true;document.body.append(root);return root}
function close(){const node=popup();node.hidden=true;current=null}
function positionPopup(button){
 const root=popup(),r=button.getBoundingClientRect();root.hidden=false;
 const w=root.offsetWidth,h=root.offsetHeight;
 let x=Math.max(8,Math.min(innerWidth-w-8,r.left)),y=r.bottom+6;
 if(y+h>innerHeight-8)y=r.top-h-6;
 root.style.left=x+'px';root.style.top=Math.max(56,y)+'px';
}
function openSelect(button){
 const original=source(button);if(!original)return;
 if(current?.button===button){close();return}
 current={type:'select',button,original};const root=popup();
 root.setAttribute('role','listbox');root.id='osControlPopup';
 root.innerHTML='<div class="os-popup-small-label">'+esc(original.getAttribute('aria-label')||txt('choose'))+'</div>'+
  Array.from(original.options).map((option,i)=>'<button type="button" role="option" data-os-option="'+i+'" aria-selected="'+(option.selected?'true':'false')+'" '+(option.disabled?'disabled':'')+'>'+
    '<span>'+esc(window.AincI18n?.t(option.textContent.trim())||option.textContent.trim())+'</span><i>'+(option.selected?'✓':'')+'</i></button>').join('');
 positionPopup(button);
}
function dateISO(y,m,d){return String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
function openDate(button){
 const original=source(button);if(!original)return;
 if(current?.button===button){close();return}
 const value=original.value?new Date(original.value+'T12:00:00'):new Date();
 current={type:'date',button,original};
 calendarMonth=value.getMonth();calendarYear=value.getFullYear();renderCalendar();
}
function renderCalendar(){
 if(current?.type!=='date')return;
 const root=popup(),year=calendarYear,month=calendarMonth;
 const first=new Date(year,month,1),offset=(first.getDay()+6)%7,last=new Date(year,month+1,0).getDate();
 const label=new Intl.DateTimeFormat(language(),{year:'numeric',month:'long'}).format(first);
 const weekdays=Array.from({length:7},(_,n)=>new Intl.DateTimeFormat(language(),{weekday:'narrow'}).format(new Date(2024,0,1+n)));
 const today=new Date();
 let cells='';
 for(let i=0;i<42;i++){
  const d=i-offset+1,valid=d>=1&&d<=last,iso=valid?dateISO(year,month+1,d):'';
  const selected=valid&&current.original.value===iso;
  cells+=valid?'<button type="button" class="os-calendar-day'+(selected?' selected':'')+(today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d?' is-today':'')+'" data-os-day="'+iso+'" aria-pressed="'+selected+'">'+d+'</button>':'<span class="os-calendar-empty"></span>';
 }
 root.setAttribute('role','dialog');root.setAttribute('aria-label',txt('date'));
 root.innerHTML='<div class="os-calendar-head"><button type="button" data-os-month="-1" aria-label="'+esc(txt('prev'))+'">‹</button><strong>'+esc(label)+'</strong><button type="button" data-os-month="1" aria-label="'+esc(txt('next'))+'">›</button></div>'+
 '<div class="os-calendar-days">'+weekdays.map(w=>'<span>'+esc(w)+'</span>').join('')+cells+'</div>'+
 '<div class="os-calendar-foot"><button type="button" data-os-date-clear>'+esc(txt('clear'))+'</button><button type="button" data-os-date-today>'+esc(txt('today'))+'</button></div>';
 positionPopup(current.button);
}
function applyValue(value){
 if(!current)return;
 const {original,button,type}=current;
 if(type==='select'){original.value=value;original.dispatchEvent(new Event('change',{bubbles:true}));button.querySelector('span').textContent=selectedLabel(original)}
 else{original.value=value;original.dispatchEvent(new Event('input',{bubbles:true}));original.dispatchEvent(new Event('change',{bubbles:true}));button.querySelector('span').textContent=dateLabel(original)}
 close();button.focus();
}
function refreshLabels(){
 for(const b of $$('[data-os-select-face]')){const o=source(b);if(o)b.querySelector('span').textContent=selectedLabel(o)}
 for(const b of $$('[data-os-date-face]')){const o=source(b);if(o)b.querySelector('span').textContent=dateLabel(o)}
 if(current?.type==='date')renderCalendar();if(current?.type==='select')openSelect(current.button);
}
document.addEventListener('click',e=>{
 const face=e.target.closest?.('[data-os-select-face],[data-os-date-face]');
 if(face){e.preventDefault();e.stopPropagation();face.hasAttribute('data-os-select-face')?openSelect(face):openDate(face);return}
 const opt=e.target.closest?.('[data-os-option]');
 if(opt&&current?.type==='select'){const item=current.original.options[Number(opt.dataset.osOption)];if(item&&!item.disabled)applyValue(item.value);return}
 const day=e.target.closest?.('[data-os-day]');if(day){applyValue(day.dataset.osDay);return}
 const month=e.target.closest?.('[data-os-month]');if(month){calendarMonth+=Number(month.dataset.osMonth);if(calendarMonth<0){calendarMonth=11;calendarYear--}if(calendarMonth>11){calendarMonth=0;calendarYear++}renderCalendar();return}
 if(e.target.closest?.('[data-os-date-today]')){const today=new Date();applyValue(dateISO(today.getFullYear(),today.getMonth()+1,today.getDate()));return}
 if(e.target.closest?.('[data-os-date-clear]')){applyValue('');return}
 if(current&&!e.target.closest?.('#osControlPopup'))close();
},true);
document.addEventListener('keydown',e=>{
 if(!current)return;
 if(e.key==='Escape'){e.stopPropagation();e.preventDefault();const b=current.button;close();b.focus()}
 if(e.key==='Enter'&&current.type==='select'){const selected=$('#osControlPopup [aria-selected="true"]');if(selected){e.preventDefault();selected.click()}}
},true);
window.addEventListener('resize',close,{passive:true});
document.addEventListener('scroll',e=>{if(current&&!e.target.closest?.('#osControlPopup'))close()},true);
window.addEventListener('aincfh:languagechange',()=>{upgrade();refreshLabels()});
upgrade();
observer=new MutationObserver(records=>{
 if(pending)return;
 if(!records.some(r=>r.addedNodes.length))return;
 pending=true;queueMicrotask(()=>{pending=false;upgrade()});
});
observer.observe(document.body,{childList:true,subtree:true});
window.AincControls={upgrade,close,get active(){return!!current}};
})();
