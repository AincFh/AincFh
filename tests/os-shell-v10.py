"""AincFh OS v10 Shell: real Start, Dock settings, power lifecycle and locale QA."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL=os.environ.get("OS_URL","http://127.0.0.1:8765/")
OUT=Path("test-results")
OUT.mkdir(exist_ok=True)

def no_scroll(page):
    rect=page.evaluate("""() => ({
      width:innerWidth,height:innerHeight,
      scrollW:document.documentElement.scrollWidth,
      scrollH:document.documentElement.scrollHeight
    })""")
    assert rect['scrollW']<=rect['width']+1 and rect['scrollH']<=rect['height']+1,rect

def run():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for locale in ("zh-CN","en-US","ja-JP"):
            context=browser.new_context(
                viewport={"width":1440,"height":900},
                locale=locale,
                reduced_motion="reduce",
            )
            page=context.new_page()
            errors=[]
            page.on("pageerror",lambda e:errors.append(str(e)))
            page.goto(URL,wait_until="load")
            page.wait_for_function("Boolean(window.AincShell && window.AincI18n && window.AincControls && window.AincSettings)")
            assert page.evaluate("AincI18n.locale")==locale,(locale,"browser locale not detected")
            assert page.locator('#osStartButton').count()==1
            assert page.locator('#osTopPower').count()==1
            no_scroll(page)
            page.locator('#osStartButton').click()
            expect(page.locator('#osStartPanel')).to_be_visible()
            assert page.locator('#osStartPanel [data-shell-app]').count()>=14
            page.screenshot(path=str(OUT / f"start-{locale}.png"),full_page=True)
            search=page.locator('#osStartSearch')
            search.fill("calculator")
            expect(page.locator('#osStartPanel [data-shell-app="calculator"]')).to_be_visible()
            page.locator('#osStartPanel [data-shell-app="calculator"]').click()
            expect(page.locator('#app-calculator')).to_be_visible()
            expect(page.locator('#osStartPanel')).to_be_hidden()
            # task window controls from the Dock follow the live process.
            page.locator('[data-dock="calculator"]').hover()
            page.wait_for_timeout(450)
            expect(page.locator('#osDockPeek')).to_be_visible()
            page.locator('#osDockPeek [data-shell-window="minimize"]').click()
            assert page.locator('#app-calculator').evaluate("(e)=>e.classList.contains('is-minimized')")
            page.locator('[data-dock="calculator"]').click()
            expect(page.locator('#app-calculator')).to_be_visible()
            assert not page.locator('#app-calculator').evaluate("(e)=>e.classList.contains('is-minimized')")
            # Dock position, mode and start layout must control actual CSS.
            page.locator('[data-dock="settings"]').click()
            page.locator('#app-settings [data-sp-section="desktop"]').click()
            page.locator('#app-settings [data-sp-set="dockPosition"][data-sp-value="left"]').click()
            assert page.evaluate("document.documentElement.dataset.dockPosition")=="left"
            page.locator('#app-settings [data-sp-set="dockPosition"][data-sp-value="right"]').click()
            assert page.evaluate("document.documentElement.dataset.dockPosition")=="right"
            page.locator('#app-settings [data-sp-set="dockMode"][data-sp-value="taskbar"]').click()
            assert page.evaluate("document.documentElement.dataset.dockMode")=="taskbar"
            assert page.evaluate("document.documentElement.dataset.dockPosition")=="bottom"
            page.locator('#app-settings [data-sp-set="startLayout"][data-sp-value="list"]').click()
            assert page.evaluate("document.documentElement.dataset.startLayout")=="list"
            no_scroll(page)
            # Four safe power actions never control the host OS.
            page.locator('#osTopPower').click()
            expect(page.locator('#osPowerPopup')).to_be_visible()
            assert page.locator('#osPowerPopup [data-shell-power]').count()==4
            page.locator('#osPowerPopup [data-shell-power="sleep"]').click()
            expect(page.locator('#osPowerState')).to_be_visible()
            assert page.evaluate("AincShell.state.power")=="sleep"
            page.locator('#osPowerState [data-shell-action="wake"]').click()
            expect(page.locator('#osPowerState')).to_be_hidden()
            page.locator('#osTopPower').click()
            page.locator('#osPowerPopup [data-shell-power="lock"]').click()
            assert page.evaluate("AincShell.state.power")=="lock"
            page.locator('#osPowerState [data-shell-action="unlock"]').click()
            assert page.evaluate("AincShell.state.power")=="on"
            page.locator('#osTopPower').click()
            page.locator('#osPowerPopup [data-shell-power="shutdown"]').click()
            expect(page.locator('#osPowerConfirm')).to_be_visible()
            page.locator('#osPowerConfirm [data-shell-action="cancel-power"]').click()
            expect(page.locator('#osPowerConfirm')).to_be_hidden()
            page.locator('#osTopPower').click()
            page.locator('#osPowerPopup [data-shell-power="shutdown"]').click()
            page.locator('#osPowerConfirm [data-shell-action="confirm-power"]').click()
            assert page.evaluate("AincShell.state.power")=="off"
            expect(page.locator('#osPowerState')).to_be_visible()
            page.locator('#osPowerState [data-shell-action="turn-on"]').click()
            page.wait_for_load_state('load')
            page.wait_for_function("AincShell.state.power==='on'")
            assert page.evaluate("sessionStorage.getItem('aincfh_shell_power_v10')") is None
            no_scroll(page)
            # Manual language override survives reload, auto mode returns to browser.
            page.locator('[data-dock="settings"]').click()
            page.locator('#app-settings [data-sp-section="language"]').click()
            page.locator('#app-settings [data-sp-language="en-US"]').click()
            assert page.evaluate("AincI18n.locale")=="en-US"
            assert page.evaluate("AincI18n.mode")=="en-US"
            page.reload(wait_until="load")
            assert page.evaluate("AincI18n.locale")=="en-US"
            page.locator('[data-dock="settings"]').click()
            page.locator('#app-settings [data-sp-section="language"]').click()
            page.locator('#app-settings [data-sp-language="auto"]').click()
            assert page.evaluate("AincI18n.locale")==locale
            assert page.evaluate("AincI18n.mode")=="auto"
            # Restart must actually reload the browser desktop, not just draw a spinner.
            page.locator('#osTopPower').click()
            page.locator('#osPowerPopup [data-shell-power="restart"]').click()
            expect(page.locator('#osPowerConfirm')).to_be_visible()
            with page.expect_navigation(wait_until="load"):
                page.locator('#osPowerConfirm [data-shell-action="confirm-power"]').click()
            page.wait_for_function("Boolean(window.AincShell && AincShell.state.power==='on')")
            assert page.evaluate("sessionStorage.getItem('aincfh_shell_last_boot')")=="restart"
            no_scroll(page)
            assert not errors,(locale,errors)
            print("PASS OS v10 Shell "+locale+": Start, Dock, power, language, no scroll; JS errors=0")
            context.close()
        # On mobile Start menu and power controls fit without page-level scrolling.
        context=browser.new_context(viewport={"width":390,"height":844},locale="zh-CN",reduced_motion="reduce",is_mobile=True)
        page=context.new_page()
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        page.goto(URL,wait_until="load")
        page.locator('#osStartButton').click()
        expect(page.locator('#osStartPanel')).to_be_visible()
        assert page.locator('#osStartPanel').bounding_box()['width']<=390
        page.screenshot(path=str(OUT / 'start-mobile.png'),full_page=True)
        page.locator('#osStartPanel .os-start-grid [data-shell-app="files"]').click()
        expect(page.locator('#app-files')).to_be_visible()
        page.locator('#osTopPower').click()
        page.locator('#osPowerPopup [data-shell-power="sleep"]').click()
        expect(page.locator('#osPowerState')).to_be_visible()
        page.locator('#osPowerState [data-shell-action="wake"]').click()
        no_scroll(page)
        assert not errors,errors
        print("PASS OS v10 Shell mobile: launcher, Files, sleep/wake, no overflow")
        context.close()
        browser.close()

if __name__=="__main__":
    run()
