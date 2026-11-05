"""AincFh OS v8 integration: real browser app workflows and persistence."""
import os
from playwright.sync_api import sync_playwright, expect

URL=os.environ.get("OS_URL","http://127.0.0.1:8765/")
def run():
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  for width,height in ((1440,900),(390,844)):
   context=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce",permissions=[])
   page=context.new_page()
   errors=[]
   page.on("pageerror",lambda e:errors.append(str(e)))
   page.goto(URL,wait_until="load")
   page.wait_for_function("Boolean(window.AincWorkspace && window.AincStorage && window.AincApps && window.AincSettings && window.AincInputPolicy)")
   page.evaluate("() => AincWorkspace.ready")
   # The desktop is bounded to a viewport at every screen size.
   assert page.evaluate("document.documentElement.scrollHeight <= innerHeight+1")
   assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
   # Explicit selection and clipboard whitelist.
   assert page.evaluate("getComputedStyle(document.querySelector('#heroTitle')).userSelect==='none'")
   assert page.evaluate("getComputedStyle(document.querySelector('input')).userSelect==='text'")
   assert page.evaluate("""() => {const e=new Event('copy',{cancelable:true,bubbles:true});document.querySelector('#heroTitle').dispatchEvent(e);return e.defaultPrevented}""")
   # Application registry can launch real, registered apps.
   page.locator('[data-dock="apps"]').click()
   assert page.locator('#app-apps [data-catalog-open="calculator"]').count()==1
   assert page.locator('#app-apps [data-catalog-open]').count()>=13
   page.locator('#suAppSearch').fill("calculator")
   assert page.locator('#app-apps [data-catalog-open]').count()==1
   page.locator('#suAppSearch').fill("")
   page.locator('#app-apps [data-catalog-pin="calculator"]').click()
   page.locator('#app-apps [data-catalog-filter="favorites"]').click()
   assert page.locator('#app-apps [data-catalog-open="calculator"]').count()==1
   page.locator('#app-apps [data-catalog-filter="all"]').click()
   page.locator('#app-apps [data-catalog-open="calculator"]').click()
   page.locator('#suCalcExpr').fill("2*(3+4)")
   page.locator('#suCalcExpr').press("Enter")
   assert page.locator('#suCalcResult').inner_text()=="14"
   # File > create > Notes > edit > refresh > find content.
   page.locator('[data-dock="files"]').click()
   page.locator('#app-files [data-fs-folder="workspace"]').click()
   page.locator('#app-files [data-fs-action="create-text"]').click()
   page.locator('#fsName').fill("QA-workflow-v8.md")
   page.locator('#fsDialog button[type="submit"]').click()
   expect(page.locator('#app-notes')).to_be_visible()
   textarea=page.locator('#fsNoteBody')
   textarea.fill("# AincFh OS\n\n**Document persists**\n\n<script>alert('x')</script>")
   assert page.locator('#app-notes .fs-md-preview h2').inner_text()=="AincFh OS"
   assert page.locator('#app-notes .fs-md-preview script').count()==0
   assert "Document persists" in page.locator('#app-notes .fs-md-preview').inner_text()
   page.evaluate("() => AincStorage.whenIdle()")
   page.reload(wait_until="load")
   page.evaluate("() => AincWorkspace.ready")
   page.locator('[data-dock="notes"]').click()
   page.locator('#app-notes [data-fs-note]').filter(has_text="QA-workflow-v8.md").click()
   assert "Document persists" in page.locator('#fsNoteBody').input_value()
   page.locator('#app-notes [data-fs-view="preview"]').click()
   assert page.locator('#app-notes .fs-md-preview h2').inner_text()=="AincFh OS"
   # Move and duplicate the real document.
   page.locator('[data-dock="files"]').click()
   page.locator('#app-files [data-fs-folder="workspace"]').click()
   page.locator('#app-files [data-fs-select]').filter(has_text="QA-workflow-v8.md").click()
   page.locator('#app-files [data-fs-action="move"]').click()
   page.locator('#fsDestination').select_option('notes')
   page.locator('#fsDialog button[type="submit"]').click()
   page.locator('#app-files [data-fs-folder="notes"]').click()
   page.locator('#app-files [data-fs-select]').filter(has_text="QA-workflow-v8.md").click()
   page.locator('#app-files [data-fs-action="duplicate"]').click()
   assert page.locator('#app-files [data-fs-select]').filter(has_text="QA-workflow-v8 copy.md").count()==1
   # Actual task persistence, not a decorative card.
   page.locator('[data-dock="tasks"]').click()
   page.locator('#suTaskName').fill("Build the complete desktop")
   page.locator('#suTaskForm button[type="submit"]').click()
   assert page.locator('#app-tasks .su-task-row').filter(has_text="Build the complete desktop").count()==1
   page.reload(wait_until="load")
   page.locator('[data-dock="tasks"]').click()
   assert page.locator('#app-tasks .su-task-row').filter(has_text="Build the complete desktop").count()==1
   # Preferences alter the environment, including accessibility and settings panels.
   if width > 840:
    page.locator('[data-dock="settings"]').click()
   else:
    page.locator('[data-dock="apps"]').click()
    page.locator('#app-apps [data-catalog-open="settings"]').click()
   page.locator('#app-settings [data-sp-section="accessibility"]').click()
   assert page.locator('#app-settings [data-sp-set="textSize"]').count()==3
   page.locator('#app-settings [data-sp-toggle="motion"]').click()
   assert page.evaluate("document.documentElement.classList.contains('motion-off')===false")
   page.locator('#app-settings [data-sp-section="desktop"]').click()
   page.locator('#app-settings [data-sp-set="dockSize"][data-sp-value="compact"]').click()
   assert page.evaluate("document.documentElement.dataset.dockSize==='compact'")
   assert page.locator('#app-settings [data-sp-section]').count()>=8
   page.locator('#app-settings [data-sp-section="apps"]').click()
   page.locator('#app-settings [data-sp-set="startupApp"][data-sp-value="files"]').click()
   assert page.locator('#app-settings [data-sp-set="startupApp"][data-sp-value="files"]').get_attribute("aria-pressed")=="true"
   page.locator('#app-settings [data-sp-set="startupApp"][data-sp-value="projects"]').click()
   page.locator('#app-settings [data-sp-section="notifications"]').click()
   page.locator('#app-settings [data-sp-toggle="activityBadge"]').click()
   assert page.evaluate("document.documentElement.classList.contains('os-hide-badge')===true")
   page.locator('#app-settings [data-sp-toggle="activityBadge"]').click()
   page.locator('#app-settings [data-sp-section="shortcuts"]').click()
   page.locator('#app-settings [data-sp-toggle="shortcuts"]').click()
   assert page.locator('#app-settings [data-sp-toggle="shortcuts"]').get_attribute("aria-checked")=="false"
   page.locator('#app-settings [data-sp-toggle="shortcuts"]').click()
   page.locator('#app-settings [data-sp-section="privacy"]').click()
   assert page.locator('#app-settings [data-sp-action="export-workspace"]').count()==1
   assert page.locator('#spQuota').count()==1
   # Real timer controls exist.
   page.locator('[data-dock="apps"]').click()
   page.locator('#app-apps [data-catalog-open="clock"]').click()
   page.locator('#app-clock [data-timer-preset="1"]').click()
   page.locator('#app-clock [data-timer-action="start"]').click()
   assert page.locator('#app-clock [data-timer-action="pause"]').count()==1
   assert not errors,(width,height,errors)
   print("PASS OS v8",width,"x",height,"Files → Notes → IndexedDB; move+copy; tasks; calculator; settings; timer; console=0")
   context.close()
  browser.close()
if __name__=="__main__":
 run()
