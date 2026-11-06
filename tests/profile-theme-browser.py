"""Validate six fixed-palette SVGs in both GitHub browser appearance modes."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
NAMES = ("header", "profile-panel", "launch-workspace", "work", "ethos", "footer")
OUT = ROOT / "test-results"
OUT.mkdir(exist_ok=True)

QUERY = """() => {
  const gradient = document.getElementById('bg') ||
    document.getElementById('studioBg');
  const stops = gradient ? [...gradient.querySelectorAll('stop')] : [];
  return {
    background: stops.map(n => n.getAttribute('stop-color')),
    firstRectFill: getComputedStyle(document.querySelector('rect')).fill,
    firstTextFill: getComputedStyle(document.querySelector('text')).fill,
    foreground: [...document.querySelectorAll('text')].slice(0, 10)
      .map(n => getComputedStyle(n).fill),
    animations: [...document.querySelectorAll('.scene,.float,.breathe,.af-halo')]
      .map(n => getComputedStyle(n).animationName)
  };
}"""


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 960, "height": 760},
                                device_scale_factor=1)
        for name in NAMES:
            observations = {}
            for mode in ("light", "dark"):
                page.emulate_media(color_scheme=mode, reduced_motion="reduce")
                page.goto((ROOT / "assets" / (name + ".svg")).as_uri())
                assert page.locator("svg").count() == 1
                observations[mode] = page.evaluate(QUERY)
                page.screenshot(
                    path=str(OUT / f"profile-universal-{mode}-{name}.png"),
                    full_page=False,
                )
            assert observations["light"] == observations["dark"], (
                f"{name}: browser appearance switched or inverted SVG colors: "
                f"{observations}"
            )
            assert observations["light"]["background"] == [
                "#2C3B4F", "#35465C", "#2B394C"
            ], (name, observations)
            assert all(a == "none" for a in observations["light"]["animations"]), (
                name, "reduced-motion should remain static"
            )
            print(f"PASS {name}: identical fixed colors in light/dark GitHub; "
                  "reduced-motion supported")

        preview = OUT / "universal-embed.html"
        html = (
            '<!doctype html><meta charset="utf-8"><style>'
            'body{margin:0;padding:16px;background:var(--page)}'
            'img{display:block;width:900px;max-width:100%;margin:0 0 16px}'
            '</style>'
            + "".join(
                f'<img src="../assets/{name}.svg" alt="{name}">'
                for name in NAMES
            )
        )
        preview.write_text(html, encoding="utf-8")
        for mode, background in (("light", "#ffffff"), ("dark", "#0d1117")):
            page.emulate_media(color_scheme=mode, reduced_motion="no-preference")
            page.goto(preview.as_uri())
            page.evaluate(
                "(color) => document.body.style.setProperty('--page', color)",
                background,
            )
            loaded = page.locator("img").evaluate_all(
                "(images) => images.every(n => n.complete && n.naturalWidth > 0)"
            )
            assert loaded, f"{mode}: one of six README SVG images failed to load"
            page.screenshot(
                path=str(OUT / f"profile-universal-{mode}-readme.png"),
                full_page=True,
            )
            print(f"PASS GitHub README six-image appearance: {mode} background")

        browser.close()


if __name__ == "__main__":
    run()
