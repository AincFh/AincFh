"""Check the new editorial profile GIF-like SVG reel in Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "assets" / "editorial-workspace.svg"
OUT = ROOT / "test-results"
OUT.mkdir(exist_ok=True)


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1100, "height": 780},
                                device_scale_factor=1)
        page.emulate_media(reduced_motion="no-preference")
        page.goto(ASSET.as_uri())
        assert page.locator("svg").count() == 1
        assert page.locator("g.chap").count() == 4
        assert page.locator("g.tab-active").count() == 4

        # 24-second reel has four independent 6-second chapters. Seek all
        # animations to exactly the same position and verify tab/scene pair.
        for idx, seconds in enumerate((3, 9, 15, 21)):
            metrics = page.evaluate("""seconds => {
                for (const node of document.querySelectorAll('g.chap,g.tab-active,.progress')) {
                    for (const anim of node.getAnimations()) {
                        anim.pause(); anim.currentTime = seconds * 1000;
                    }
                }
                return {
                    scenes: [...document.querySelectorAll('g.chap')]
                        .map(n => Number(getComputedStyle(n).opacity)),
                    tabs: [...document.querySelectorAll('g.tab-active')]
                        .map(n => Number(getComputedStyle(n).opacity)),
                };
            }""", seconds)
            assert metrics["scenes"][idx] >= .98, (idx, metrics)
            assert metrics["tabs"][idx] >= .98, (idx, metrics)
            assert all(v <= .02 for j, v in enumerate(metrics["scenes"]) if j != idx)
            assert all(v <= .02 for j, v in enumerate(metrics["tabs"]) if j != idx)
            page.screenshot(path=str(OUT / f"editorial-tour-scene-{idx+1}.png"))
            print(f"PASS animated tour chapter {idx+1}: tabs and content synced")

        page.emulate_media(reduced_motion="reduce")
        page.reload()
        reduced = page.evaluate("""() => ({
            chapters: [...document.querySelectorAll('g.chap')]
                .map(n => Number(getComputedStyle(n).opacity)),
            animations: [...document.querySelectorAll('.chap,.tab-active,.progress,.float')]
                .every(n => getComputedStyle(n).animationName === 'none')
        })""")
        assert reduced["chapters"] == [1, 0, 0, 0], reduced
        assert reduced["animations"], reduced
        print("PASS reduced motion: static readable first frame")

        html = OUT / "editorial-motion-embed.html"
        html.write_text(
            '<!doctype html><meta charset="utf-8">'
            '<img src="../assets/editorial-workspace.svg" width="900" '
            'alt="AincFh animated project tour">',
            encoding="utf-8",
        )
        page.emulate_media(reduced_motion="no-preference")
        page.goto(html.as_uri())
        pic = page.locator("img")
        page.wait_for_function(
            "() => document.images[0].complete && document.images[0].naturalWidth > 0",
            timeout=10000
        )
        frame_a = pic.screenshot()
        page.wait_for_timeout(1450)
        frame_b = pic.screenshot()
        assert frame_a != frame_b, "GitHub README SVG image must animate autonomously"
        print("PASS GitHub README img: continuously animating native SVG, no JS needed")
        browser.close()


if __name__ == "__main__":
    run()
