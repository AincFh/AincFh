"""AincFh OS Control Center v11 — real settings and storage/network state tests."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL=os.environ.get("OS_URL","http://127.0.0.1:8765/")
SCREENSHOTS=Path("test-results")
SCREENSHOTS.mkdir(exist_ok=True)

def check_no_scroll(page):
    d=page.evaluate("""() => ({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight})""")
    assert d["sw"]<=d["w"]+1 and d["sh"]<=d["h"]+1,d

def test():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width,height,lang in ((1440,900,"zh-CN"),(390,844,"en-US"),(768,1024,"ja-JP")):
            context=browser.new_context(viewport={"width":width,"height":height},locale=lang,reduced_motion="reduce",service_workers="allow")
            page=context.new_page()
            errors=[]
            page.on("pageerror",lambda error:errors.append(str(error)))
            page.goto(URL,wait_until="load")
            page.wait_for_function("Boolean(AincControlCenter && AincPWA && AincSystemMonitor && AincShell)")
            assert page.evaluate("AincI18n.locale")==lang
            expect(page.locator('#osControlCenterButton')).to_be_visible()
            page.locator('#osControlCenterButton').click()
            expect(page.locator('#osControlCenter')).to_be_visible()
            assert page.locator('#osControlCenter [data-cc-profile]').count()==4
            assert page.locator('#osControlCenter [data-cc-toggle]').count()==5
            assert "false"==page.locator('#osControlCenterButton').get_attribute("aria-expanded") if False else True
            assert page.locator('#osControlCenterButton').get_attribute("aria-expanded")=="true"
            assert page.locator('#osControlCenter').bounding_box()["width"]<=width
            # Quick settings change the actual system preferences.
            page.locator('#osControlCenter [data-cc-profile="save"]').click()
            assert page.evaluate("document.documentElement.dataset.performanceProfile")=="save"
            assert page.evaluate("localStorage.getItem('aincfh_performanceMode')")=="save"
            page.locator('#osControlCenter [data-cc-toggle="contrast"]').click()
            assert page.evaluate("localStorage.getItem('aincfh_contrast')")=="high"
            page.locator('#osControlCenter [data-cc-toggle="quietMode"]').click()
            assert page.evaluate("localStorage.getItem('aincfh_quietMode')")=="on"
            page.locator('#osControlCenter [data-cc-toggle="theme"]').click()
            assert page.evaluate("localStorage.getItem('aincfh_theme')")=="light"
            page.screenshot(path=str(SCREENSHOTS/f"control-center-{width}x{height}.png"),full_page=True)
            page.locator('#osControlCenter [data-cc-action="taskmanager"]').click()
            expect(page.locator('#app-taskmanager')).to_be_visible()
            expect(page.locator('#osControlCenter')).to_be_hidden()
            check_no_scroll(page)
            # System data is browser-origin only, and reloading preserves settings.
            page.reload(wait_until="load")
            assert page.evaluate("document.documentElement.dataset.performanceProfile")=="save"
            assert page.evaluate("localStorage.getItem('aincfh_quietMode')")=="on"
            page.locator('#osControlCenterButton').click()
            expect(page.locator('#osControlCenter')).to_be_visible()
            page.wait_for_timeout(250)
            status=page.evaluate("AincControlCenter.status")
            assert status["networkOnline"] is True
            page.locator('#osControlCenter [data-cc-refresh]').click()
            page.locator('#osControlCenter [data-cc-close]').click()
            expect(page.locator('#osControlCenter')).to_be_hidden()
            check_no_scroll(page)
            assert not errors,(width,height,errors)
            print(f"PASS Control Center {width}x{height} {lang}: controls, settings persistence, taskmanager, overflow, no JS errors",flush=True)
            context.close()
        browser.close()

if __name__=="__main__":
    test()
