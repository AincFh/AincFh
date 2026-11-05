/* AincFh OS Storage v8 — IndexedDB snapshot persistence and migration.
 * No network access, no remote sync, no host filesystem access.
 * Persisted records are namespaced to this origin (GitHub Pages).
 */
(function(){
'use strict';
const NAME='aincfh-os-v8',VERSION=1,STORE='snapshots';
let database=null,failed=false,queue=Promise.resolve(),error=null;
function open(){
  if(failed)return Promise.resolve(null);
  if(database)return Promise.resolve(database);
  if(!('indexedDB'in window)){failed=true;error='IndexedDB unavailable';return Promise.resolve(null)}
  return new Promise(resolve=>{
    let request;try{request=indexedDB.open(NAME,VERSION)}catch(e){failed=true;error=e.message;resolve(null);return}
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};
    request.onsuccess=()=>{database=request.result;database.onversionchange=()=>{database.close();database=null};resolve(database)};
    request.onerror=()=>{failed=true;error=request.error?.message||'IndexedDB blocked';resolve(null)};
    request.onblocked=()=>{error='Storage temporarily blocked by another tab';resolve(null)};
  });
}
function read(id){
  return open().then(db=>new Promise(resolve=>{
    if(!db){resolve(null);return}
    try{
      const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).get(id);
      req.onsuccess=()=>resolve(req.result?.payload??null);
      req.onerror=()=>resolve(null);
    }catch(e){error=e.message;resolve(null)}
  }));
}
function store(id,payload){
  queue=queue.catch(()=>{}).then(async()=>{
    const db=await open();
    if(!db)throw Error(error||'IndexedDB is unavailable');
    await new Promise((resolve,reject)=>{
      try{
        const tx=db.transaction(STORE,'readwrite');
        tx.objectStore(STORE).put({id,payload,updated:new Date().toISOString()});
        tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error('IndexedDB write failed'));tx.onabort=()=>reject(tx.error||Error('IndexedDB transaction aborted'));
      }catch(e){reject(e)}
    });
    return true;
  });
  return queue;
}
function quota(){
  if(navigator.storage?.estimate)return navigator.storage.estimate().then(q=>({usage:q.usage||0,quota:q.quota||0,persistent:false})).catch(()=>({usage:0,quota:0,persistent:false}));
  return Promise.resolve({usage:0,quota:0,persistent:false});
}
function forget(id){
  queue=queue.catch(()=>{}).then(async()=>{
    const db=await open();if(!db)return false;
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error('Delete failed'));
    });return true;
  });
  return queue;
}
window.AincStorage={
  open,read,write:store,forget,quota,
  get status(){return{mode:database?'IndexedDB':failed?'Fallback':'Initializing',error:error}},
  whenIdle:()=>queue.catch(()=>false)
};
})();
