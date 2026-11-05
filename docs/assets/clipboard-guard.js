/* AincFh OS input policy — whitelist normal input, Notes and terminal output.
 * This controls page UI interactions. It is NOT security or DRM protection. */
(function(){
'use strict';
var allowed='input:not([type="button"]):not([type="submit"]),textarea,[contenteditable="true"],[data-allow-select],.terminal-output,.fs-snippet';
function elementOf(node){return node&&node.nodeType===1?node:node&&node.parentElement||null}
function hasPermission(node){var element=elementOf(node);return !!(element&&element.closest&&element.closest(allowed))}
function clipboardAllowed(e){
 if(hasPermission(e.target)||hasPermission(document.activeElement))return true;
 var selection=window.getSelection&&window.getSelection();
 return !!(selection&&selection.rangeCount&&hasPermission(selection.anchorNode)&&hasPermission(selection.focusNode));
}
['copy','cut','paste'].forEach(function(eventName){
 document.addEventListener(eventName,function(e){
  if(!clipboardAllowed(e)){e.preventDefault();return false}
 },true);
});
document.addEventListener('keydown',function(e){
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a'&&!clipboardAllowed(e)){
  e.preventDefault();
 }
},true);
document.addEventListener('selectstart',function(e){
 if(!hasPermission(e.target))e.preventDefault();
},true);
window.AincInputPolicy={isEditable:hasPermission,allowedSelector:allowed};
})();