"""Static quality gates for the six-panel GitHub profile composition."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
FILES = ("header", "profile-panel", "launch-workspace", "work", "ethos", "footer")
SVG = "{http://www.w3.org/2000/svg}"
VERSION = "20261106-modular21"


def run():
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    image_sources = re.findall(r'<img\s+[^>]*src="([^"]+)"', readme)
    expected = [f"./assets/{name}.svg?v={VERSION}" for name in FILES]
    assert image_sources == expected, (image_sources, expected)
    assert "hero-reel.svg" not in readme and "hero-story.svg" not in readme
    assert 'href="https://aincfh.github.io/AincFh/"' not in readme, "Broken Pages links"
    for name in FILES:
        path = ROOT / "assets" / f"{name}.svg"
        source = path.read_text(encoding="utf-8")
        root = ET.fromstring(source)
        assert root.tag == SVG + "svg", name
        assert root.get("viewBox", "").startswith("0 0 900 "), name
        assert root.get("role") == "img" and len(root.get("aria-label", "")) > 15, name
        assert "<script" not in source.lower() and "foreignObject" not in source, name
        assert not re.search(r'(?:href|src)="https?://', source), name
        assert not re.search(r'(?:fill|stroke)="var\(', source), name
        assert not re.search(r'(?:fill|stroke)="class=', source), name
        assert "prefers-reduced-motion:reduce" in source, name
        assert "@keyframes" in source and "animation:" in source, name
        assert len(source.encode("utf-8")) <= 24000, name
        print(f"PASS {name}: valid self-contained SVG, animated and reduced-motion-safe")
    header = (ROOT / "assets/header.svg").read_text(encoding="utf-8")
    assert 'fill="url(#hex)"' not in header, "Header decorative pattern should be removed"
    panel = (ROOT / "assets/profile-panel.svg").read_text(encoding="utf-8")
    assert all(title in panel for title in ("Web platforms", "Desktop software", "AI workflows"))
    assert "WORKSPACE" not in panel, "Profile panel should not repeat an OS sidebar"
    work = (ROOT / "assets/work.svg").read_text(encoding="utf-8")
    assert all(term in work for term in ("Content / Community", "CODEX / LOOKUP", "SYSTEM / TOOLS"))
    assert all(term in work for term in ("A.T. Field", "Saint Laurent", "Windows Tools"))
    tour = (ROOT / "assets/launch-workspace.svg").read_text(encoding="utf-8")
    root = ET.fromstring(tour)
    for index in range(4):
        matches = [node for node in root.iter(SVG + "g")
                   if node.get("class") == f"scene scene{index}"]
        assert len(matches) == 2, (index, len(matches))
        assert all(node.get("opacity") == ("1" if index == 0 else "0")
                   for node in matches)
        assert f"@keyframes scene{index}" in tour
    assert "FiveM" in readme and ("虚构" in readme or "fictional" in readme.lower())
    print("PASS modular layout: six distinct full-width images, no disconnected single canvas")
    print("PASS content, functional preview, accurate links and reduced-motion safeguards")


if __name__ == "__main__":
    run()
