"""Validate the unified AincFh GitHub README showcase in a real browser."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "assets" / "hero-reel.svg"
OUT = ROOT / "test-results"
OUT.mkdir(exist_ok=True)


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1050, "height": 760}, device_scale_factor=1)
        page.goto(SVG.as_uri())
        assert page.locator("svg").count() == 1

        for scene_index, t in enumerate((3, 9, 15, 21, 27, 33)):
            result = page.evaluate(
                """({index, time}) => {
                  // Freeze ALL animated layers at the same point of the 36s master timeline.
                  for (const node of document.querySelectorAll('.chapter, .nav-active, .pointer, .pointer-click, .playhead')) {
                    for (const animation of node.getAnimations()) {
                      animation.pause();
                      animation.currentTime = time * 1000;
                    }
                  }
                  const scenes = [...document.querySelectorAll('g.chapter')];
                  const nav = [...document.querySelectorAll('g.nav-active')];
                  const sceneOpacity = scenes.map(n => Number(getComputedStyle(n).opacity));
                  const navOpacity = nav.map(n => Number(getComputedStyle(n).opacity));
                  const pointer = document.querySelector('.pointer');
                  const tipPath = pointer.querySelector('path');
                  const tip = new DOMPoint(0, 0).matrixTransform(tipPath.getScreenCTM());
                  const bounds = nav[index].querySelector('rect').getBoundingClientRect();
                  return {
                    sceneOpacity, navOpacity, pointerVisible: Number(getComputedStyle(pointer).opacity),
                    tip: {x: tip.x, y: tip.y},
                    navRect: {left:bounds.left, right:bounds.right, top:bounds.top, bottom:bounds.bottom}
                  };
                }""",
                {"index": scene_index, "time": t},
            )
            assert result["sceneOpacity"][scene_index] >= .98, (scene_index, result)
            assert result["navOpacity"][scene_index] >= .98, (scene_index, result)
            assert all(v <= .03 for n, v in enumerate(result["sceneOpacity"]) if n != scene_index), result
            assert all(v <= .03 for n, v in enumerate(result["navOpacity"]) if n != scene_index), result
            assert result["pointerVisible"] >= .98, result
            tip = result["tip"]
            bounds = result["navRect"]
            assert bounds["left"] + 5 <= tip["x"] <= bounds["right"] - 3, (
                f"cursor X not inside selected menu item {scene_index}: {result}"
            )
            assert bounds["top"] + 3 <= tip["y"] <= bounds["bottom"] - 3, (
                f"cursor Y not inside selected menu item {scene_index}: {result}"
            )
            page.screenshot(path=str(OUT / f"one-take-scene-{scene_index+1}.png"))
            print(f"PASS scene {scene_index+1}: correct content, nav, and mouse-tip coordinates")

        page.emulate_media(reduced_motion="reduce")
        page.reload()
        state = page.evaluate("""() => ({
          cursor: Number(getComputedStyle(document.querySelector('.pointer')).opacity),
          scenes: [...document.querySelectorAll('g.chapter')].map(n => Number(getComputedStyle(n).opacity)),
          animations: [...document.querySelectorAll('g.chapter, g.nav-active, .pointer, .playhead')].map(
            n => getComputedStyle(n).animationName)
        })""")
        assert state["scenes"] == [1, 0, 0, 0, 0, 0], state
        assert state["cursor"] == 0 and all(x == "none" for x in state["animations"]), state
        print("PASS reduced-motion: static first frame, no cursor animation")

        # GitHub displays the SVG as an external img; check animation survives embed.
        embed_path = OUT / "one-take-embed.html"
        embed_path.write_text(
            '<!doctype html><meta charset="utf-8"><img src="../assets/hero-reel.svg" '
            'alt="AincFh OS" width="1000" height="620">', encoding="utf-8",
        )
        page.emulate_media(reduced_motion="no-preference")
        page.goto(embed_path.as_uri())
        img = page.locator("img")
        assert img.evaluate("(img) => img.complete && img.naturalWidth === 1000")
        before = img.screenshot()
        page.wait_for_timeout(1300)
        after = img.screenshot()
        assert before != after, "Animated SVG embedded in README img is frozen"
        print("PASS README <img>: continuous GIF-like SVG animation")
        browser.close()


if __name__ == "__main__":
    run()
