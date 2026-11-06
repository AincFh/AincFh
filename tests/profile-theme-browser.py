"""Browser snapshots and adaptive theme QA for the fresh editorial profile."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
NAMES = ("editorial-hero", "editorial-workspace", "editorial-projects",
         "editorial-approach", "editorial-contact")
OUT = ROOT / "test-results"
OUT.mkdir(exist_ok=True)

QUERY = """() => ({
  bg: getComputedStyle(document.querySelector('rect.bg')).fill,
  ink: getComputedStyle(document.querySelector('text.ink')).fill,
  brand: getComputedStyle(document.querySelector('text.brand-ink')).fill,
  reduced: [...document.querySelectorAll('.chap,.tab-active,.progress,.float')]
    .every(n => getComputedStyle(n).animationName === 'none')
})"""


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1100, "height": 900},
                                device_scale_factor=1)
        themes = {}
        for mode in ("light", "dark"):
            colors = []
            page.emulate_media(color_scheme=mode, reduced_motion="reduce")
            for name in NAMES:
                page.goto((ROOT / "assets" / (name + ".svg")).as_uri())
                assert page.locator("svg").count() == 1, f"{name}: SVG did not load"
                result = page.evaluate(QUERY)
                assert result["reduced"], f"{name}: reduced motion failed"
                colors.append(result)
                page.screenshot(path=str(OUT / f"editorial-{name}-{mode}.png"))
            themes[mode] = colors

            html = ('<!doctype html><meta charset="utf-8">'
                    '<style>body{margin:0;padding:24px;background:' +
                    ('#ffffff' if mode == 'light' else '#0d1117') +
                    ';font-family:system-ui}img{width:900px;max-width:100%;'
                    'height:auto;display:block;margin:0 auto 17px}</style>' +
                    ''.join(f'<img src="../assets/{name}.svg" alt="{name}">'
                            for name in NAMES))
            preview = OUT / f"editorial-embed-{mode}.html"
            preview.write_text(html, encoding="utf-8")
            page.goto(preview.as_uri())
            page.wait_for_function(
                "() => [...document.images].length === 5 && "
                "[...document.images].every(i => i.complete && i.naturalWidth > 0)",
                timeout=15000,
            )
            page.screenshot(path=str(OUT / f"editorial-readme-{mode}.png"),
                            full_page=True)
            print(f"PASS {mode}: all five modules embed in GitHub-style background")

        assert all(a["bg"] == themes["light"][0]["bg"]
                   for a in themes["light"]), themes["light"]
        assert all(a["bg"] == themes["dark"][0]["bg"]
                   for a in themes["dark"]), themes["dark"]
        assert themes["light"][0]["bg"] != themes["dark"][0]["bg"], (
            "Light and dark mode must harmonize instead of using an opposite fixed background"
        )
        assert themes["light"][0]["ink"] != themes["dark"][0]["ink"]
        print("PASS adaptive theme: consistent colors across modules, matched to GitHub appearance")
        browser.close()


if __name__ == "__main__":
    run()
