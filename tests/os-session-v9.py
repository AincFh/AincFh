"""AincFh OS optional desktop session persistence / lifecycle regression."""
import os
from playwright.sync_api import sync_playwright, expect

URL=os.environ.get("OS_URL","http://127.0.0.1:8765/")

def main():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        context=browser.new_context(viewport={"width":1440,"height":900},reduced_motion="reduce")
        page=context.new_page()
        errors=[]
        diagnostics=[]
        page.on("pageerror",lambda error:errors.append(str(error)))
        page.on("console",lambda msg: diagnostics.append((msg.type,msg.text)) if msg.type in ('warning','error') else None)
        page.goto(URL,wait_until="load")
        expect(page.locator('[data-dock="settings"]')).to_be_visible()
        page.locator('[data-dock="settings"]').click()
        page.locator('#app-settings [data-sp-section="desktop"]').click()
        flag=page.locator('#app-settings [data-sp-toggle="restoreSession"]')
        expect(flag).to_have_attribute("aria-checked","false")
        flag.click()
        expect(page.locator('#app-settings [data-sp-toggle="restoreSession"]')).to_have_attribute("aria-checked","true")
        for name in ("files","paint","tasks"):
            page.locator(f'[data-dock="{name}"]').click()
            expect(page.locator(f'#app-{name}')).to_be_visible()
        page.locator('[data-dock="paint"]').click()
        page.locator('#app-paint [data-win-action="maximize"]').click()
        assert page.locator('#app-paint').evaluate("(e)=>e.classList.contains('is-maximized')")
        page.locator('[data-dock="files"]').click()
        page.locator('#app-files [data-win-action="minimize"]').click()
        assert page.locator('#app-files').evaluate("(e)=>e.classList.contains('is-minimized')")
        # Minimizing Files automatically promotes the latest non-minimized window.
        assert page.locator('#app-tasks').evaluate("(e)=>e.classList.contains('focused')")
        before=page.evaluate("""() => JSON.parse(localStorage.getItem('aincfh_session_v1'))""")
        assert before["version"]==1
        assert len(before["items"])>=4
        assert before["focused"]=="tasks",before
        page.reload(wait_until="load")
        probe=page.evaluate("""() => ({prefs:localStorage.getItem('aincfh_restoreSession'),saved:localStorage.getItem('aincfh_session_v1')?.slice(0,320),opened:[...document.querySelectorAll('.os-window')].map(x=>x.id)})""")
        print("SESSION DEBUG AFTER RELOAD:",probe,diagnostics[-6:],flush=True)
        for name in ("settings","files","paint","tasks"):
            assert page.locator(f'#app-{name}').count()==1,(name,"missing after restore")
        assert page.locator('#app-files').evaluate("(e)=>e.classList.contains('is-minimized')")
        assert page.locator('#app-paint').evaluate("(e)=>e.classList.contains('is-maximized')")
        assert page.locator('#app-tasks').evaluate("(e)=>e.classList.contains('focused')")
        page.locator('[data-dock="settings"]').click()
        page.locator('#app-settings [data-sp-section="desktop"]').click()
        page.locator('#app-settings [data-sp-toggle="restoreSession"]').click()
        expect(page.locator('#app-settings [data-sp-toggle="restoreSession"]')).to_have_attribute("aria-checked","false")
        page.reload(wait_until="load")
        assert page.locator('#app-paint').count()==0,"Disabled session restore retained Paint"
        assert page.locator('#app-files').count()==0,"Disabled session restore retained Files"
        assert page.evaluate("document.documentElement.scrollHeight<=innerHeight+1")
        assert not errors,errors
        print("PASS optional session: apps, focus, max/min states, reload and disable; console errors=0")
        context.close()
        browser.close()

if __name__=="__main__":
    main()
