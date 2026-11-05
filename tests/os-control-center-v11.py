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
        # PWA correctness: real image assets, install metadata and deep-link launch.
        context=browser.new_context(viewport={"width":1280,"height":800},locale="en-US",service_workers="allow")
        page=context.new_page()
        errors=[]
        page.on("pageerror",lambda error:errors.append(str(error)))
        page.goto(URL+"?app=taskmanager",wait_until="load")
        expect(page.locator("#app-taskmanager")).to_be_visible()
        manifest=page.evaluate("""async() => {
          const link=document.querySelector('link[rel="manifest"]');
          if(!link)return null;
          const response=await fetch(link.href);
          if(!response.ok)return null;
          return response.json();
        }""")
        assert manifest and manifest["display"]=="standalone"
        assert manifest["start_url"]=="./"
        assert any(x["sizes"]=="192x192" for x in manifest["icons"])
        assert any(x["sizes"]=="512x512" for x in manifest["icons"])
        for size in (192,512):
            decoded=page.evaluate("""async(size)=>{
              const path='./assets/icon-'+size+'.png';
              const r=await fetch(path);if(!r.ok)return {ok:false,status:r.status};
              const b=new Uint8Array(await r.arrayBuffer());
              const view=new DataView(b.buffer);
              return {ok:b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71,
                width:view.getUint32(16),height:view.getUint32(20)};
            }""",size)
            assert decoded=={"ok":True,"width":size,"height":size},decoded
        page.goto(URL+"?app=files",wait_until="load")
        expect(page.locator("#app-files")).to_be_visible()
        page.goto(URL+"?app=unknown-app",wait_until="load")
        assert page.locator("#app-unknown-app").count()==0
        assert not errors,errors
        print("PASS installable PWA: 192/512 icons, manifest, registered deep links and unknown-route safety",flush=True)
        context.close()
        browser.close()

if __name__=="__main__":
    test()
