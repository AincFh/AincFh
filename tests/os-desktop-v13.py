"""AincFh OS v13: Files-backed desktop, context menu, Trash, theme library QA."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL=os.environ.get("OS_URL","http://127.0.0.1:8765/")
ART=Path("test-results");ART.mkdir(exist_ok=True)

def view_check(page):
    v=page.evaluate("""()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight})""")
    assert v["sw"]<=v["w"]+1 and v["sh"]<=v["h"]+1,v

def open_menu(page):
    page.locator("#desktop").click(button="right",position={"x":76,"y":90})
    expect(page.locator("#osDesktopSurfaceMenu")).to_be_visible()

def main():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        context=browser.new_context(viewport={"width":1440,"height":900},locale="zh-CN",reduced_motion="reduce",accept_downloads=True)
        context.add_init_script("localStorage.setItem('aincfh_autoOpen','off')")
        page=context.new_page()
        errors=[]
        page.on("pageerror",lambda error:errors.append(str(error)))
        page.goto(URL,wait_until="load")
        page.wait_for_function("Boolean(window.AincDesktopSurface && AincThemeLibrary && AincWorkspace && AincSettings)")
        page.wait_for_function("Boolean(window.AincWorkspace.ready)")
        assert page.evaluate("AincDesktopSurface.count")>=4
        expect(page.locator('#osDesktopIcons [data-desktop-item="app:files"]')).to_be_visible()
        expect(page.locator('#osDesktopIcons [data-desktop-item="trash"]')).to_be_visible()
        view_check(page)
        # Desktop shortcuts are live launchers, not links to a static screenshot.
        page.locator('#osDesktopIcons [data-desktop-item="app:files"]').dblclick()
        expect(page.locator('#app-files')).to_be_visible()
        page.locator('#app-files [data-win-action="close"]').click()
        open_menu(page)
        page.locator('#osDesktopSurfaceMenu [data-desktop-menu="newFile"]').click()
        expect(page.locator('#osDesktopDialog')).to_be_visible()
        page.locator('#desktopDialogInput').fill("System Notes.md")
        page.locator('#desktopDialogForm [type="submit"]').click()
        page.wait_for_function("""()=>AincWorkspace.listDesktopItems().some(x=>x.name==='System Notes.md')""")
        file_id=page.evaluate("AincWorkspace.listDesktopItems().find(x=>x.name==='System Notes.md').id")
        expect(page.locator(f'#osDesktopIcons [data-desktop-item="file:{file_id}"]')).to_be_visible()
        page.locator(f'#osDesktopIcons [data-desktop-item="file:{file_id}"]').dblclick()
        expect(page.locator('#app-notes')).to_be_visible()
        page.locator('#app-notes [data-win-action="close"]').click()
        # Naming and deleting the desktop document must mutate the underlying Files record.
        page.locator(f'#osDesktopIcons [data-desktop-item="file:{file_id}"]').click(button="right")
        page.locator('#osDesktopSurfaceMenu [data-desktop-menu="rename"]').click()
        page.locator('#desktopDialogInput').fill("Roadmap.md")
        page.locator('#desktopDialogForm [type="submit"]').click()
        page.wait_for_function("""()=>AincWorkspace.listDesktopItems().some(x=>x.name==='Roadmap.md')""")
        assert page.evaluate("""id=>AincWorkspace.listDesktopItems().some(x=>x.id===id&&x.name==='Roadmap.md')""",file_id)
        # A file already in Files can be pinned without duplicating its content.
        page.locator('#osDesktopIcons [data-desktop-item="app:files"]').dblclick()
        page.locator('#app-files [data-fs-folder="workspace"]').click()
        page.locator('#app-files [data-fs-select="welcome"]').click()
        page.locator('#app-files [data-fs-action="pin-desktop"][data-fs-id="welcome"]').click()
        expect(page.locator('#osDesktopIcons [data-desktop-item="file:welcome"]')).to_have_count(1)
        assert page.evaluate("AincWorkspace.listItems().filter(x=>x.id==='welcome').length")==1
        page.locator('#app-files [data-win-action="close"]').click()
        page.locator(f'#osDesktopIcons [data-desktop-item="file:{file_id}"]').click(button="right")
        page.locator('#osDesktopSurfaceMenu [data-desktop-menu="trash"]').click()
        expect(page.locator('#osDesktopDialog')).to_be_visible()
        page.locator('#desktopDialogForm [type="submit"]').click()
        page.wait_for_function("""id=>!AincWorkspace.listItems().some(x=>x.id===id)""",arg=file_id)
        expect(page.locator(f'#osDesktopIcons [data-desktop-item="file:{file_id}"]')).to_have_count(0)
        page.locator('#osDesktopIcons [data-desktop-item="trash"]').dblclick()
        expect(page.locator('#app-files')).to_be_visible()
        page.locator(f'#app-files [data-fs-select="{file_id}"]').click()
        page.locator(f'#app-files [data-fs-action="restore"][data-fs-id="{file_id}"]').click()
        page.wait_for_function("""id=>AincWorkspace.listDesktopItems().some(x=>x.id===id)""",arg=file_id)
        expect(page.locator(f'#osDesktopIcons [data-desktop-item="file:{file_id}"]')).to_have_count(1)
        page.locator('#app-files [data-win-action="close"]').click()
        # User drag changes a real, persisted grid coordinate.
        tile=page.locator('#osDesktopIcons [data-desktop-item="app:files"]')
        old=page.evaluate("AincDesktopSurface.state.records.find(x=>x.id==='app:files')")
        box=tile.bounding_box()
        assert box, "desktop shortcut must be visible and have geometry"
        x=box["x"]+box["width"]/2;y=box["y"]+box["height"]/2
        page.mouse.move(x,y);page.mouse.down()
        page.mouse.move(x-110,y+4,steps=9);page.mouse.up()
        page.wait_for_function("""col=>AincDesktopSurface.state.records.find(x=>x.id==='app:files').col!==col""",arg=old["col"])
        new=page.evaluate("AincDesktopSurface.state.records.find(x=>x.id==='app:files')")
        assert new["col"]!=old["col"],(old,new)
        # Theme snapshots are complete, do not copy files, and apply atomically.
        page.locator('[data-dock="settings"]').click()
        page.locator('#app-settings [data-sp-section="fusion"]').click()
        expect(page.locator('#app-settings .theme-library')).to_be_visible()
        page.locator('#app-settings [data-theme-action="save"]').click()
        page.locator('#themeLibraryName').fill('Evening Focus')
        page.locator('#themeLibraryForm [type="submit"]').click()
        assert page.evaluate("AincThemeLibrary.profiles.length")==1
        original_accent=page.evaluate("AincThemeLibrary.profiles[0].config.accent")
        page.locator('#app-settings [data-fusion-set="accent"][data-fusion-value="cyan"]').click()
        assert page.evaluate("document.documentElement.dataset.accent")=="cyan"
        page.locator('#app-settings [data-theme-action="apply"]').click()
        assert page.evaluate("document.documentElement.dataset.accent")==original_accent
        with page.expect_download() as info:
            page.locator('#app-settings [data-theme-action="export"]').click()
        download=info.value
        assert download.suggested_filename.startswith("AincFh-Theme-")
        source=page.evaluate("""()=>({schema:AincThemeLibrary.schema,version:1,name:'Imported design',config:AincThemeLibrary.profiles[0].config})""")
        page.locator('#themeLibraryImport').set_input_files({"name":"theme.json","mimeType":"application/json","buffer":json.dumps(source).encode()})
        page.wait_for_function("AincThemeLibrary.profiles.length===2")
        # Bad/malicious imports are rejected before applying any change.
        page.locator('#themeLibraryImport').set_input_files({"name":"broken.json","mimeType":"application/json","buffer":b'{"schema":"invalid","config":{"theme":"light"}}'})
        page.wait_for_timeout(250)
        assert page.evaluate("AincThemeLibrary.profiles.length")==2
        assert page.evaluate("""()=>AincThemeLibrary.profiles.every(p=>!('body' in p.config)&&!('token' in p.config))""")
        page.screenshot(path=str(ART/"desktop-v13-theme-library.png"),full_page=True)
        view_check(page)
        page.reload(wait_until="load")
        assert page.evaluate("AincThemeLibrary.profiles.length")==2
        assert page.evaluate("AincDesktopSurface.state.records.find(x=>x.id==='app:files').col")==new["col"]
        assert page.evaluate("AincWorkspace.listDesktopItems().some(x=>x.name==='Roadmap.md')")
        assert not errors,errors
        print("PASS Desktop v13 desktop: file creation/open/rename/trash/restore, pin, drag persistence, saved/imported theme, JS errors=0",flush=True)
        context.close()
        # On mobile icons are hidden rather than occluding the launcher; settings remain usable.
        mobile=browser.new_context(viewport={"width":390,"height":844},locale="en-US",reduced_motion="reduce")
        m=mobile.new_page();errs=[]
        m.on("pageerror",lambda error:errs.append(str(error)))
        m.goto(URL,wait_until="load")
        m.wait_for_function("Boolean(window.AincDesktopSurface && window.AincThemeLibrary)")
        expect(m.locator('#osDesktopIcons')).to_be_hidden()
        m.locator('#osStartButton').click()
        m.locator('#osStartPanel .os-start-grid [data-shell-app="settings"]').click()
        m.locator('#app-settings [data-sp-section="fusion"]').click()
        expect(m.locator('#app-settings .theme-library')).to_be_visible()
        view_check(m)
        assert not errs,errs
        print("PASS Desktop v13 mobile: desktop shortcuts concealed, Settings theme library available, no page overflow or JS errors",flush=True)
        mobile.close()
        browser.close()
if __name__=="__main__":main()
