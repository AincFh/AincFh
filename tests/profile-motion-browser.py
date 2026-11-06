"""Check actual SVG CSS animations in Chromium, including static reduced-motion mode."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FILES = ("header", "profile-panel", "launch-workspace", "work", "ethos", "footer")
OUT = ROOT / "test-results"
OUT.mkdir(exist_ok=True)


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 930, "height": 720}, device_scale_factor=1)
        for name in FILES:
            page.emulate_media(reduced_motion="no-preference")
            page.goto((ROOT / "assets" / (name + ".svg")).as_uri())
            assert page.locator("svg").count() == 1, f"{name}: could not render SVG"
            info = page.evaluate("""() => {
              const svg = document.documentElement;
              const nodes = svg.querySelectorAll('.af-card, .af-float, .af-comet, .scene0');
              return {
                title: svg.getAttribute('aria-label'),
                active: [...nodes].some(node => getComputedStyle(node).animationName !== 'none'),
                textCount: svg.querySelectorAll('text').length,
                fonts: [...svg.querySelectorAll('text')].slice(0,5).map(n => getComputedStyle(n).fill)
              };
            }""")
            assert info["active"], f"{name}: browser is not executing CSS animations: {info}"
            assert info["textCount"] >= 8, f"{name}: unexpected content loss"
            page.screenshot(path=str(OUT / f"profile-motion-{name}.png"))
            page.emulate_media(reduced_motion="reduce")
            reduced = page.evaluate("""() => {
              const nodes = document.querySelectorAll('.af-card, .af-float, .af-comet, .scene0');
              return [...nodes].every(node => getComputedStyle(node).animationName === 'none');
            }""")
            assert reduced, f"{name}: animated elements ignore reduced-motion preference"
            if name == "launch-workspace":
                reduced_scenes = page.evaluate("""() => [0,1,2,3].map(n =>
                  Number(getComputedStyle(document.querySelector('.scene'+n)).opacity))""")
                assert reduced_scenes == [1, 0, 0, 0], reduced_scenes
            print(f"PASS browser SVG: {name} animates; reduced motion is static")
        page.emulate_media(reduced_motion="no-preference")
        page.goto((ROOT / "assets" / "launch-workspace.svg").as_uri())
        frames = page.evaluate("""() => {
          const data = [];
          const scenes = [0,1,2,3].map(n => [...document.querySelectorAll('.scene'+n)]);
          for (const position of [0.12,0.37,0.62,0.87]) {
            const snapshot = scenes.map(group => {
              for (const node of group) {
                const animations = node.getAnimations();
                if (!animations.length) throw Error('Scene has no CSS animation');
                animations.forEach(anim => { anim.pause(); anim.currentTime = position * 20000; });
              }
              return Number(getComputedStyle(group[0]).opacity);
            });
            data.push(snapshot);
          }
          return data;
        }""")
        for i, frame in enumerate(frames):
            assert frame[i] >= 0.95, f"scene {i}: desired frame not visible: {frame}"
            assert all(value <= 0.03 for j, value in enumerate(frame) if j != i), (
                f"scene {i}: other project panels overlap: {frame}"
            )
        print("PASS 20s synchronized reel: four unique non-overlapping chapters")
        browser.close()


if __name__ == "__main__":
    run()
