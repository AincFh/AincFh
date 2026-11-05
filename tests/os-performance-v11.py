"""AincFh OS v11: task lifecycle, real metrics, performance governor, offline and stress QA."""
import os
from pathlib import Path
from statistics import median
from playwright.sync_api import sync_playwright, expect

URL=os.environ.get("OS_URL","http://127.0.0.1:8765/")
OUT=Path("test-results"); OUT.mkdir(exist_ok=True)

def no_overflow(page):
    dims=page.evaluate("""() => ({
      iw:innerWidth,ih:innerHeight,
      sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight
    })""")
    assert dims["sw"]<=dims["iw"]+1 and dims["sh"]<=dims["ih"]+1,dims

def launch_monitor(page, mobile=False):
    if mobile:
        page.locator("#osStartButton").click()
        page.locator('#osStartPanel .os-start-grid [data-shell-app="taskmanager"]').click()
    else:
        page.locator('[data-dock="taskmanager"]').click()
    expect(page.locator("#app-taskmanager")).to_be_visible()

def main():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width,height,locale in ((1440,900,"zh-CN"),(390,844,"en-US")):
            mobile=width<500
            context=browser.new_context(
                viewport={"width":width,"height":height},
                locale=locale,reduced_motion="reduce",service_workers="allow",
                is_mobile=mobile,
            )
            page=context.new_page()
            errors=[]
            page.on("pageerror",lambda e:errors.append(str(e)))
            page.goto(URL,wait_until="load")
            page.wait_for_function("Boolean(window.AincPWA&&window.AincSystemMonitor&&window.AincShell&&window.AincI18n)")
            no_overflow(page)
            launch_monitor(page,mobile)
            expect(page.locator('#app-taskmanager [data-tm-tab="processes"]')).to_be_visible()
            expect(page.locator('#app-taskmanager [data-tm-pid="taskmanager"]')).to_be_visible()
            assert page.evaluate("AincSystemMonitor.getSnapshot().metrics.domNodes")>200
            # Process manager action: terminate ONLY the Web OS window.
            if mobile:
                page.locator("#osStartButton").click()
                page.locator('#osStartPanel .os-start-grid [data-shell-app="files"]').click()
                page.locator("#osStartButton").click()
                page.locator('#osStartPanel .os-start-grid [data-shell-app="taskmanager"]').click()
            else:
                page.locator('[data-dock="files"]').click()
                page.locator('[data-dock="taskmanager"]').click()
            page.locator('#app-taskmanager [data-tm-action="refresh"]').click()
            expect(page.locator('#app-taskmanager [data-tm-pid="files"]')).to_be_visible()
            page.locator('#app-taskmanager [data-tm-action="end"][data-tm-id="files"]').click()
            expect(page.locator('#tmEndModal')).to_be_visible()
            page.locator('#tmEndModal [data-tm-confirm="cancel"]').click()
            assert page.locator('#app-files').count()==1
            page.locator('#app-taskmanager [data-tm-action="end"][data-tm-id="files"]').click()
            page.locator('#tmEndModal [data-tm-confirm="end"]').click()
            assert page.locator('#app-files').count()==0
            assert not any(x["id"]=="files" for x in page.evaluate("AincSystemMonitor.getSnapshot().windows"))
            # Real sample values and persisted efficiency modes.
            page.locator('#app-taskmanager [data-tm-tab="performance"]').click()
            expect(page.locator('#app-taskmanager [data-tm-mode="save"]')).to_be_visible()
            page.locator('#app-taskmanager [data-tm-mode="save"]').click()
            assert page.evaluate("document.documentElement.classList.contains('os-performance-save')")
            assert page.evaluate("localStorage.getItem('aincfh_performanceMode')")=="save"
            page.wait_for_timeout(2600)
            snapshot=page.evaluate("AincSystemMonitor.getSnapshot()")
            assert snapshot["metrics"]["domNodes"]>200
            assert snapshot["metrics"]["fps"] is None or 0<=snapshot["metrics"]["fps"]<=240
            assert snapshot["performanceMode"]=="save"
            page.screenshot(path=str(OUT/f"taskmanager-{width}x{height}.png"),full_page=True)
            no_overflow(page)
            # Recover the same preference following reload.
            page.reload(wait_until="load")
            assert page.evaluate("document.documentElement.dataset.performanceProfile")=="save"
            # In desktop mode repeatedly create/destroy windows and record actual operation times.
            if not mobile:
                page.wait_for_function("Boolean(window.AincSystemMonitor)")
                results=page.evaluate("""() => {
                  const times=[];
                  const before=document.getElementsByTagName('*').length;
                  for(let i=0;i<12;i++){
                    const now=performance.now();
                    document.querySelector('[data-dock="about"]').click();
                    document.querySelector('#app-about [data-win-action="close"]').click();
                    times.push(performance.now()-now);
                  }
                  const after=document.getElementsByTagName('*').length;
                  return {times,before,after,open:!!document.querySelector('#app-about')};
                }""")
                assert not results["open"] and results["after"]<=results["before"]+80,results
                # Derived from measured Ubuntu CI baseline (median 1.15 ms, max 2.8 ms).
                # Leave headroom for runner variance while catching major performance regressions.
                assert median(results["times"])<80,results
                assert max(results["times"])<350,results
                print("MEASURED window create+close (ms) "+str([round(v,2) for v in results["times"]])+
                      " median="+str(round(median(results["times"]),2))+
                      " DOM before/after="+str(results["before"])+"/"+str(results["after"]),flush=True)
            # Offline shell must load after SW installs all versioned assets.
            reg=page.evaluate("() => AincPWA.whenReady()")
            assert reg is not None,"Service Worker registration failed"
            page.wait_for_function("Boolean(navigator.serviceWorker.controller)",timeout=20000)
            cache=page.evaluate("() => AincPWA.status()")
            assert cache["cacheVersions"],cache
            context.set_offline(True)
            page.reload(wait_until="load")
            page.wait_for_function("Boolean(window.AincShell && window.AincSystemMonitor && window.AincI18n)")
            assert page.evaluate("navigator.onLine")==False
            assert page.evaluate("AincI18n.locale")==locale
            assert page.evaluate("document.documentElement.dataset.performanceProfile")=="save"
            launch_monitor(page,mobile)
            expect(page.locator('#app-taskmanager [data-tm-tab="performance"]')).to_be_visible()
            no_overflow(page)
            assert not errors,(width,height,errors)
            print(f"PASS OS v11 {width}x{height} {locale}: process operations, saver mode, metrics, offline reload, no overflow, errors=0",flush=True)
            context.close()
        browser.close()

if __name__=="__main__":
    main()
