"""AincFh OS: deterministic browser regression checks (no remote services)."""
import os
import xml.etree.ElementTree as ET
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get("OS_URL", "http://127.0.0.1:8765/")

def geometry(page):
    return page.evaluate("""() => ({
      width: innerWidth, height: innerHeight,
      docW: document.documentElement.scrollWidth,
      docH: document.documentElement.scrollHeight,
      rootHeight: document.querySelector('.desktop')?.clientHeight
    })""")

def check_viewport(page, label):
    box = geometry(page)
    assert box["docW"] <= box["width"] + 1, (label, "horizontal scroll", box)
    assert box["docH"] <= box["height"] + 1, (label, "vertical scroll", box)

def test():
    ET.parse(ROOT / "assets" / "launch-workspace.svg")
    print("PASS SVG XML structure")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for width, height in ((1920,900),(1440,900),(390,844),(768,1024)):
            context = browser.new_context(viewport={"width":width,"height":height}, reduced_motion="reduce")
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(URL, wait_until="load")
            page.locator(".menubar").wait_for()
            page.wait_for_timeout(180)
            label=f"{width}x{height}"
            check_viewport(page,label)
            assert page.locator('.dock-app').count() >= 6
            if width > 840:
                page.locator('[data-open="projects"]').first.click()
                page.locator('[data-open="stack"]').first.click()
                page.locator('[data-open="about"]').first.click()
                assert page.locator('.os-window').count() >= 3, label
                page.locator('[data-arrange="tile"]').first.click()
                for win in page.locator('.os-window').all():
                    assert win.is_visible(), (label, "tiled window hidden")
                page.locator('[data-arrange="cascade"]').first.click()
                page.locator('#app-about [data-win-action="maximize"]').click()
                assert page.locator('#app-about').evaluate("(n)=>n.classList.contains('is-maximized')")
                page.locator('#app-about [data-win-action="maximize"]').click()
                assert not page.locator('#app-about').evaluate("(n)=>n.classList.contains('is-maximized')")
                page.locator('#app-about').click(position={"x":120,"y":110})
                page.locator('[data-snap="right"]').first.click()
                assert page.locator('#app-about').bounding_box()["x"] > width/2-80
                page.keyboard.press('Control+k')
                assert page.locator('#paletteBackdrop').is_visible()
                page.locator('#paletteInput').fill('saint')
                assert page.locator('.palette-option').count() > 0
                page.keyboard.press('Escape')
                page.locator('[data-toggle-theme]').first.click()
                assert page.locator('html').get_attribute('data-theme') in ('light','dark')
                preview=page.locator('#app-projects .preview-scene-a')
                assert preview.count() == 1
                assert preview.evaluate("(n)=>getComputedStyle(n).animationName") != "none" or \
                    page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
                page.locator('#app-projects [data-preview-pause]').click()
                assert page.locator('#app-projects [data-preview-pause]').count()==1
            else:
                page.locator('.launcher[data-open="projects"]').click()
                win=page.locator('#app-projects')
                assert win.is_visible()
                rect=win.bounding_box()
                assert rect["x"]>=-1 and rect["x"]+rect["width"]<=width+1,(label,rect)
                assert rect["y"]>=0 and rect["y"]+rect["height"]<=height+1,(label,rect)
                page.locator('#app-projects [data-select-project="saint"]').click()
                assert 'Saint Laurent' in page.locator('#app-projects .project-summary').inner_text()
            check_viewport(page,label+" after interactions")
            assert not errors,(label,errors)
            print("PASS",label,"viewport, windows, interactions; console errors=0")
            context.close()
        browser.close()

if __name__ == "__main__":
    test()
