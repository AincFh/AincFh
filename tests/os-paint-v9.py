"""AincFh OS v9: browser canvas, undo/redo and Paint-to-Files round-trip."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL=os.environ.get("OS_URL", "http://127.0.0.1:8765/")
OUT=Path("test-results")
OUT.mkdir(exist_ok=True)

def png(page):
    return page.locator('#paintCanvas').evaluate("(c) => c.toDataURL('image/png')")

def draw(page):
    c=page.locator('#paintCanvas')
    c.scroll_into_view_if_needed()
    b=c.bounding_box()
    assert b and b["width"]>80 and b["height"]>30, b
    left=b["x"]+b["width"]*.25
    right=b["x"]+b["width"]*.67
    y=b["y"]+b["height"]*.30
    page.mouse.move(left,y)
    page.mouse.down()
    page.mouse.move(right,y,steps=12)
    page.mouse.up()

def test():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width,height in ((1440,900),(390,844)):
            context=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce",accept_downloads=True)
            page=context.new_page()
            errors=[]
            page.on("pageerror",lambda e:errors.append(str(e)))
            page.goto(URL,wait_until="load")
            page.wait_for_function("Boolean(window.AincPaint && window.AincStorage && window.AincWorkspace)")
            page.evaluate("() => AincWorkspace.ready")
            page.locator('[data-dock="paint"]').click()
            expect(page.locator('#app-paint')).to_be_visible()
            page.locator('#paintCanvas').wait_for()
            page.wait_for_timeout(250)
            first=png(page)
            page.locator('#app-paint [data-paint-color="#ff9f43"]').click()
            draw(page)
            second=png(page)
            assert first!=second, (width,height,"Drawing did not change canvas pixels")
            assert page.locator('#app-paint [data-paint-action="undo"]').is_enabled()
            page.locator('#app-paint [data-paint-action="undo"]').click()
            page.wait_for_timeout(180)
            assert png(page)==first, (width,height,"Undo did not restore original canvas")
            page.locator('#app-paint [data-paint-action="redo"]').click()
            page.wait_for_timeout(180)
            assert png(page)==second, (width,height,"Redo did not restore drawn image")
            page.locator('#app-paint [data-paint-action="save"]').click()
            page.evaluate("() => AincStorage.whenIdle()")
            assert "Untitled drawing.png" in page.evaluate("AincWorkspace.list()")
            page.locator('[data-dock="files"]').click()
            page.locator('#app-files [data-fs-folder="workspace"]').click()
            page.locator('#app-files [data-fs-select]').filter(has_text="Untitled drawing.png").click()
            expect(page.locator('#app-files .fs-preview-image')).to_be_visible()
            page.locator('#app-files [data-fs-action="open"]').click()
            expect(page.locator('#app-paint')).to_be_visible()
            page.wait_for_timeout(200)
            assert png(page)==second, (width,height,"Opening PNG from Files lost image data")
            page.locator('#app-paint [data-paint-action="save"]').click()
            assert page.evaluate("AincWorkspace.list().split('\\n').filter(x=>x.includes('Untitled drawing.png')).length") == 1, "Repeated save duplicated artwork"
            page.evaluate("() => AincStorage.whenIdle()")
            page.screenshot(path=str(OUT / f"paint-{width}x{height}.png"),full_page=True)
            page.reload(wait_until="load")
            page.evaluate("() => AincWorkspace.ready")
            page.locator('[data-dock="files"]').click()
            page.locator('#app-files [data-fs-folder="workspace"]').click()
            page.locator('#app-files [data-fs-select]').filter(has_text="Untitled drawing.png").click()
            expect(page.locator('#app-files .fs-preview-image')).to_be_visible()
            page.locator('#app-files [data-fs-action="open"]').click()
            page.wait_for_timeout(250)
            assert png(page)==second, (width,height,"PNG did not survive browser refresh")
            assert page.evaluate("document.documentElement.scrollHeight <= innerHeight+1")
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
            assert not errors, (width,height,errors)
            print(f"PASS Paint {width}x{height}: draw, undo/redo, file save, import, overwrite, refresh persistence; errors=0")
            context.close()
        browser.close()

if __name__=="__main__":
    test()
