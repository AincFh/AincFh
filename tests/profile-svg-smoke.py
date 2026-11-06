"""Static quality gates for the six-panel GitHub profile composition."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
FILES = ("header", "profile-panel", "launch-workspace", "work", "ethos", "footer")
SVG = "{http://www.w3.org/2000/svg}"
VERSION = "20261106-universal22"


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
        assert "prefers-color-scheme" not in source, f"{name}: palette must not invert with browser appearance"
        assert "#2C3B4F" in source and "#35465C" in source and "#2B394C" in source, (
            f"{name}: universal neutral-slate surface tokens missing"
        )
        assert "#A9C8F1" in source and "#CDBCF0" in source, (
            f"{name}: shared blue/lilac accents missing"
        )
        assert "@keyframes" in source and "animation:" in source, name
        assert len(source.encode("utf-8")) <= 24000, name
        print(f"PASS {name}: valid self-contained SVG, animated and reduced-motion-safe")
    def srgb_channel(channel):
        value = int(channel, 16) / 255
        return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4

    def luminance(color):
        return sum(weight * srgb_channel(color[i:i + 2]) for weight, i in
                   ((0.2126, 1), (0.7152, 3), (0.0722, 5)))

    def contrast(a, b):
        values = sorted((luminance(a), luminance(b)))
        return (values[1] + 0.05) / (values[0] + 0.05)

    for background in ("#2C3B4F", "#35465C", "#3B4D64"):
        assert contrast("#F5F7FC", background) >= 7.0
        assert contrast("#C8D5E5", background) >= 5.5
        for accent in ("#A9C8F1", "#CDBCF0", "#9CDECC", "#F2C5AB"):
            assert contrast(accent, background) >= 4.5, (accent, background)
    print("PASS universal palette: AA+ contrast for copy and accents on neutral slate surfaces")
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
