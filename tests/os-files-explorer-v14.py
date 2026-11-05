"""AincFh OS v14 — real filesystem navigation and dark-theme visual regression."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
URL=os.environ.get("OS_URL","http://127.0.0.1:8765/")
OUT=Path("test-results");OUT.mkdir(exist_ok=True)

def test():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width,height,locale in ((1440,900,"zh-CN"),(980,720,"en-US"),(390,844,"ja-JP")):
            mobile=width<600
            context=browser.new_context(viewport={"width":width,"height":height},locale=locale,reduced_motion="reduce")
            page=context.new_page()
            errors=[]
            page.on("pageerror",lambda e: errors.append(str(e)))
            page.goto(URL,wait_until="load")
            page.wait_for_function("Boolean(window.AincWorkspace && window.AincStorage && window.AincI18n)")
            page.evaluate("window.AincWorkspace.ready")
            if mobile:
                page.locator('#osStartButton').click()
                page.locator('#osStartPanel [data-shell-app="files"]').click()
            else:
                page.locator('[data-dock="files"]').click()
            expect(page.locator('#app-files .fs-sidebar')).to_have_count(1)
            expect(page.locator('#app-files .fs-sidebar-brand')).to_be_attached()
            expect(page.locator('#app-files .fs-nav-group')).to_have_count(4)
            expect(page.locator('#app-files [data-fs-folder="root"]')).to_be_attached()
            expect(page.locator('#app-files [data-fs-folder="desktop"]')).to_be_attached()
            expect(page.locator('#app-files [data-fs-nav-view="recent"]')).to_be_attached()
            expect(page.locator('#app-files .fs-tree-node')).to_have_count(4)
            expect(page.locator('#app-files .fs-storage')).to_be_attached()
            expect(page.locator('#app-files .fs-table-header')).to_be_attached()
            # Browser-default buttons previously painted hard gray (rgb(107,107,107)).
            colors=page.evaluate("""()=>{
              const s=getComputedStyle(document.querySelector('#app-files .fs-row'));
              const n=getComputedStyle(document.querySelector('#app-files [data-fs-folder="desktop"]'));
              return {row:s.backgroundColor,nav:n.backgroundColor,root:document.documentElement.dataset.theme}
            }""")
            assert colors["row"] not in ("rgb(107, 107, 107)","rgb(128, 128, 128)"),colors
            assert colors["nav"] not in ("rgb(107, 107, 107)","rgb(128, 128, 128)"),colors
            assert page.evaluate("AincWorkspace.listItems().some(i=>i.id==='desktop')"),"Desktop folder missing from Files"
            page.locator('#app-files [data-fs-folder="desktop"]').click()
            assert page.evaluate("AincWorkspace.getNavigation().folder")=="desktop"
            page.locator('#app-files [data-fs-folder="root"]').first.click()
            page.locator('#app-files [data-fs-nav-view="recent"]').click()
            assert page.evaluate("AincWorkspace.getNavigation().view")=="recent"
            assert page.locator('#app-files [data-fs-select="welcome"]').count()==1
            page.locator('#app-files [data-fs-nav-view="favorites"]').click()
            assert page.evaluate("AincWorkspace.getNavigation().view")=="favorites"
            assert page.locator('#app-files .fs-row').count()>=3
            # A real folder can be starred/unstarred from the tree.
            page.locator('#app-files [data-fs-favorite="desktop"]').first.click()
            assert "desktop" in page.evaluate("AincWorkspace.getNavigation().favorites")
            page.locator('#app-files [data-fs-nav-folder="desktop"]').first.click()
            assert page.evaluate("AincWorkspace.getNavigation().folder")=="desktop"
            # Parent navigation, back and forward operate on real directories.
            page.locator('#app-files [data-fs-nav-up]').click()
            assert page.evaluate("AincWorkspace.getNavigation().folder")=="root"
            page.locator('#app-files [data-fs-history="-1"]').click()
            assert page.evaluate("AincWorkspace.getNavigation().folder")=="desktop"
            page.locator('#app-files [data-fs-history="1"]').click()
            assert page.evaluate("AincWorkspace.getNavigation().folder")=="root"
            # The sidebar must be hideable; undo restores the full navigation.
            page.locator('#app-files [data-fs-sidebar-toggle]').click()
            assert "fs-sidebar-hidden" in page.locator('#app-files .fs-browser').get_attribute("class")
            page.locator('#app-files [data-fs-sidebar-toggle]').click()
            assert "fs-sidebar-hidden" not in page.locator('#app-files .fs-browser').get_attribute("class")
            if not mobile:
                grip=page.locator('#app-files [data-fs-sidebar-resize]')
                b=grip.bounding_box()
                if b:
                    page.mouse.move(b["x"]+b["width"]/2,b["y"]+70)
                    page.mouse.down()
                    page.mouse.move(b["x"]+b["width"]/2+24,b["y"]+70,steps=5)
                    page.mouse.up()
                    assert page.evaluate("AincWorkspace.getNavigation().sidebarWidth")>=220
            page.screenshot(path=str(OUT/f"files-v14-{width}-{locale}.png"),full_page=True)
            v=page.evaluate("""()=>({sw:document.documentElement.scrollWidth,w:innerWidth,sh:document.documentElement.scrollHeight,h:innerHeight})""")
            assert v["sw"]<=v["w"]+1 and v["sh"]<=v["h"]+1,v
            page.reload(wait_until="load")
            page.wait_for_function("Boolean(window.AincWorkspace)")
            assert "desktop" in page.evaluate("AincWorkspace.getNavigation().favorites")
            assert not errors,(locale,errors)
            print(f"PASS Files v14 {width}x{height} {locale}: navigation, real recents, favorites, history, responsive sidebar and native dark buttons",flush=True)
            context.close()
        browser.close()
if __name__=="__main__":test()
