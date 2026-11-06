"""Validate one continuous self-contained GitHub README SVG showcase."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SVG = "{http://www.w3.org/2000/svg}"
STAGE = ROOT / "assets/hero-reel.svg"


def run():
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    image_sources = re.findall(r'<img\s+[^>]*src="([^"]+)"', readme)
    assert image_sources == ["./assets/hero-reel.svg?v=20261106-onetake16"], image_sources
    for old in ("header", "profile-panel", "launch-workspace", "work", "ethos", "footer"):
        assert f"./assets/{old}.svg" not in readme, f"disconnected panel {old} in README"
    assert "FiveM" in readme and ("虚构" in readme or "fictional" in readme.lower()), "Roleplay disclosure required"
    source = STAGE.read_text(encoding="utf-8")
    root = ET.fromstring(source)
    assert root.tag == SVG + "svg"
    assert root.get("viewBox") == "0 0 1000 620"
    assert root.get("role") == "img" and len(root.get("aria-label", "")) > 50
    assert len(source.encode("utf-8")) < 45_000, "Keep embedded SVG lightweight"
    assert not re.search(r'(?:fill|stroke)="var\(', source)
    assert "<script" not in source.lower() and "<foreignObject" not in source
    assert not re.search(r'(?:href|src)="https?://', source), "no external SVG dependencies"
    assert "prefers-reduced-motion:reduce" in source
    assert "af://workspace" in source, "persistent OS shell missing"
    assert source.count('class="chapter chapter-') == 6, "exactly six in-place scenes required"
    assert source.count('class="nav-active chapter-') == 6, "six synchronized nav highlights required"
    assert source.count("@keyframes scene") == 6, "six chapter animations required"
    assert "@keyframes pointer" in source and "@keyframes pointer-click" in source
    assert 'class="pointer-click"' in source, "missing click feedback"
    assert 'transform="translate(211 181)"' not in source, "legacy inaccurate pointer offset"
    for y in (172, 220, 268, 316, 364, 412):
        assert f"translate(186px,{y}px)" in source, f"pointer missing menu center {y}"
    assert "A.T. Field" in source and "Saint Laurent" in source and "Windows Tools" in source
    assert "fhainc@hotmail.com" in source
    print("PASS: single README image, one persistent OS, six continuous scene states")
    print("PASS: SVG XML, static fallback, reduced motion, six aligned cursor coordinates")


if __name__ == "__main__":
    run()
