"""AincFh OS v12: real theme presets, workspaces, window UI and responsive QA."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get("OS_URL", "http://127.0.0.1:8765/")
OUT = Path("test-results")
OUT.mkdir(exist_ok=True)

def no_overflow(page):
    sizes=page.evaluate("""() => ({
      width:innerWidth,height:innerHeight,
      scrollWidth:document.documentElement.scrollWidth,
      scrollHeight:document.documentElement.scrollHeight
    })""")
    assert sizes["scrollWidth"] <= sizes["width"] + 1, sizes
    assert sizes["scrollHeight"] <= sizes["height"] + 1, sizes

def open_settings(page,mobile):
    if mobile:
        page.locator('#osStartButton').click()
        page.locator('#osStartPanel .os-start-grid [data-shell-app="settings"]').click()
    else:
        page.locator('[data-dock="settings"]').click()

def main():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width,height,locale in ((1440,900,"zh-CN"),(390,844,"en-US")):
            mobile=width<500
            context=browser.new_context(viewport={"width":width,"height":height},locale=locale,reduced_motion="reduce")
            page=context.new_page()
            errors=[]
            page.on("pageerror",lambda e:errors.append(str(e)))
            page.goto(URL,wait_until="load")
            page.wait_for_function("Boolean(window.AincDesktopFusion && window.AincSettings && window.AincShell)")
            no_overflow(page)
            open_settings(page,mobile)
            page.locator('#app-settings [data-sp-section="fusion"]').click()
            expect(page.locator('#app-settings .fusion-preset-card')).to_have_count(4)
            expect(page.locator('#app-settings .fusion-wallpaper-choice')).to_have_count(5)
            for name,controls,mode,position,wallpaper in (
                ("mac","left","floating","bottom","aurora"),
                ("windows","right","taskbar","bottom","mesh"),
                ("linux","right","floating","left","grid"),
                ("fusion","left","floating","bottom","hex")
            ):
                page.locator(f'#app-settings [data-fusion-preset="{name}"]').click()
                result=page.evaluate("""() => {
                   const x=document.documentElement;
                   return [x.dataset.desktopPreset,x.dataset.windowControls,
                           x.dataset.dockMode,x.dataset.dockPosition,
                           x.dataset.wallpaperStyle];
                }""")
                assert result==[name,controls,mode,position,wallpaper],(width,name,result)
                assert page.locator(f'#app-settings [data-fusion-preset="{name}"]').get_attribute("aria-pressed")=="true"
                no_overflow(page)
            # Fine-tuning a preset must make it Custom without resetting other options.
            page.locator('#app-settings [data-fusion-set="windowRadius"][data-fusion-value="rounded"]').click()
            assert page.evaluate("document.documentElement.dataset.desktopPreset")=="custom"
            assert page.evaluate("document.documentElement.dataset.windowRadius")=="rounded"
            page.locator('#app-settings [data-fusion-set="accent"][data-fusion-value="blue"]').click()
            assert page.evaluate("document.documentElement.dataset.accent")=="blue"
            page.locator('#app-settings #fusionCustomAccent').fill("#D88AFF")
            page.locator('#app-settings [data-fusion-custom-apply]').click()
            assert page.evaluate("document.documentElement.dataset.accent")=="custom"
            assert page.evaluate("document.documentElement.style.getPropertyValue('--hot')")=="#D88AFF"
            page.locator('#app-settings [data-fusion-set="wallpaperStyle"][data-fusion-value="plain"]').click()
            assert page.evaluate("document.documentElement.dataset.wallpaperStyle")=="plain"
            page.locator('#app-settings [data-fusion-set="workspaceCount"][data-fusion-value="3"]').click()
            assert page.evaluate("AincDesktopFusion.count")==3
            if not mobile:
                assert page.locator('.fusion-top-switcher [data-fusion-switch]').count()==3
            page.screenshot(path=str(OUT/f"fusion-studio-{width}x{height}.png"),full_page=True)
            # Restore coherent preset and test a second window's real decoration.
            page.locator('#app-settings [data-fusion-preset="windows"]').click()
            page.locator('[data-dock="files"]').click()
            expect(page.locator('#app-files')).to_be_visible()
            assert page.locator('#app-files').evaluate("(el)=>getComputedStyle(el.querySelector('.win-controls')).order")=="3"
            if not mobile:
                page.locator('#app-files [data-win-action="layout"]').click()
                expect(page.locator('#fusionSnapPopup')).to_be_visible()
                assert page.locator('#fusionSnapPopup [data-fusion-snap]').count()==8
                page.locator('#fusionSnapPopup [data-fusion-snap="top-left"]').click()
                after=page.locator('#app-files').evaluate("""(el) => ({
                    left:parseFloat(el.style.left),top:parseFloat(el.style.top),
                    width:parseFloat(el.style.width),height:parseFloat(el.style.height)
                })""")
                assert after["left"]<45 and after["top"]<45,after
                assert 0<after["width"]<width*.55 and 0<after["height"]<height*.55,after
                page.locator('#app-files [data-win-action="layout"]').click()
                page.locator('#fusionSnapPopup [data-fusion-snap="center"]').click()
                center=page.locator('#app-files').evaluate("(el)=>parseFloat(el.style.left)")
                assert center>after["left"]+40,(after,center)
                expect(page.locator('#fusionSnapPopup')).to_be_hidden()
            no_overflow(page)
            page.reload(wait_until="load")
            assert page.evaluate("document.documentElement.dataset.desktopPreset")=="windows"
            assert page.evaluate("document.documentElement.dataset.dockMode")=="taskbar"
            assert page.evaluate("AincDesktopFusion.count")==3
            no_overflow(page)
            if not mobile:
                # Virtual desktops keep real running app windows and isolate their
                # visibility. Dock focus switches to the owning workspace.
                page.locator('[data-dock="files"]').click()
                expect(page.locator('#app-files')).to_be_visible()
                page.locator('.fusion-top-switcher [data-fusion-switch="2"]').click()
                assert page.evaluate("AincDesktopFusion.active")==2
                assert not page.locator('#app-files').is_visible()
                page.locator('[data-dock="notes"]').click()
                expect(page.locator('#app-notes')).to_be_visible()
                assert page.evaluate("AincDesktopFusion.assignments.notes")==2
                page.locator('[data-dock="files"]').click()
                assert page.evaluate("AincDesktopFusion.active")==1
                expect(page.locator('#app-files')).to_be_visible()
                assert not page.locator('#app-notes').is_visible()
                page.locator('.fusion-top-switcher [data-fusion-overview]').click()
                expect(page.locator('#fusionOverview')).to_be_visible()
                expect(page.locator('#fusionOverview .fusion-space-card')).to_have_count(3)
                page.locator('#fusionOverview [data-fusion-move="files"]').click()
                assert page.evaluate("AincDesktopFusion.assignments.files")==2
                page.locator('#fusionOverview [data-fusion-switch="2"]').click()
                expect(page.locator('#app-files')).to_be_visible()
                expect(page.locator('#app-notes')).to_be_visible()
                assert page.evaluate("AincDesktopFusion.active")==2
                no_overflow(page)
            else:
                open_settings(page,mobile)
                page.locator('#app-settings [data-sp-section="fusion"]').click()
                page.locator('#app-settings [data-fusion-overview]').click()
                expect(page.locator('#fusionOverview')).to_be_visible()
                expect(page.locator('#fusionOverview .fusion-space-card')).to_have_count(3)
                page.locator('#fusionOverview [data-fusion-close]').click()
                expect(page.locator('#fusionOverview')).to_be_hidden()
            assert not errors,(width,height,errors)
            print(f"PASS Fusion v12 {width}x{height} {locale}: all 4 presets, custom palette, window controls, 3 workspaces, persistence, no overflow/errors",flush=True)
            context.close()
        browser.close()

if __name__=="__main__":
    main()
