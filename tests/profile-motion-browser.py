"""Visual regression for the six independent GitHub profile SVG panels."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUT = ROOT / "test-results"
OUT.mkdir(exist_ok=True)
NAMES = ("header", "profile-panel", "launch-workspace", "work", "ethos", "footer")


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 960, "height": 760}, device_scale_factor=1)

        for name in NAMES:
            page.emulate_media(reduced_motion="no-preference")
            page.goto((ASSETS / (name + ".svg")).as_uri())
            metrics = page.evaluate("""() => {
                const root = document.documentElement;
                const elements = [...document.querySelectorAll('*')];
                return {
                    isSvg: root.namespaceURI === 'http://www.w3.org/2000/svg',
                    viewBox: root.getAttribute('viewBox'),
                    title: root.getAttribute('aria-label'),
                    texts: document.querySelectorAll('text').length,
                    animated: elements.some(e => getComputedStyle(e).animationName !== 'none')
                };
            }""")
            assert metrics["isSvg"], f"{name}: SVG failed to render: {metrics}"
            assert metrics["viewBox"].startswith("0 0 900 "), metrics
            assert metrics["texts"] >= 6, (name, metrics)
            assert metrics["animated"], f"{name}: CSS motion is not running"
            page.screenshot(path=str(OUT / f"profile-visual-{name}.png"), full_page=False)
            page.emulate_media(reduced_motion="reduce")
            frozen = page.evaluate("""() => {
                const animated = [...document.querySelectorAll(
                   '.af-halo,.af-scan-line,.scene,.cursor,.breathe,.float,.scan,.shine,.soft-pulse,.af-tour-progress')];
                return animated.every(e => getComputedStyle(e).animationName === 'none');
            }""")
            assert frozen, f"{name}: reduced-motion animation persisted"
            if name == "launch-workspace":
                state = page.evaluate("""() => [0,1,2,3].map(i =>
                    Number(getComputedStyle(document.querySelector('.scene'+i)).opacity))""")
                assert state == [1, 0, 0, 0], state
            print(f"PASS {name}: SVG visual, live animation, readable static reduced-motion view")

        embed = OUT / "profile-embedded-check.html"
        embed.write_text(
            '<!doctype html><meta charset="utf-8"><style>'
            'body{margin:0;background:#fff}img{display:block;width:100%;max-width:900px}'
            '</style><img src="../assets/launch-workspace.svg" alt="AincFh animated OS">',
            encoding="utf-8",
        )
        page.emulate_media(reduced_motion="no-preference")
        page.goto(embed.as_uri())
        img = page.locator("img")
        assert img.evaluate("(img) => img.complete && img.naturalWidth > 0")
        frame_a = img.screenshot()
        page.wait_for_timeout(1500)
        frame_b = img.screenshot()
        assert frame_a != frame_b, "The GitHub README SVG should animate inside an img"
        print("PASS GitHub README image embedding: GIF-like autoplay preserved")
        browser.close()


if __name__ == "__main__":
    run()
