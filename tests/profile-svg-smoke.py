"""Quality gates for the five-chapter AincFh editorial README showcase."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
FILES = ("editorial-hero", "editorial-workspace", "editorial-projects",
         "editorial-approach", "editorial-contact")
SVG = "{http://www.w3.org/2000/svg}"
VERSION = "20261106-liquid25"


def run():
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    image_sources = re.findall(r'<img\s+[^>]*src="([^"]+)"', readme)
    expected = [f"./assets/{name}.svg?v={VERSION}" for name in FILES]
    assert image_sources == expected, (image_sources, expected)
    assert "hero-story.svg" not in readme and "hero-reel.svg" not in readme
    assert "https://aincfh.github.io/AincFh/" not in readme, "Avoid unavailable Pages"
    assert "FiveM" in readme and ("虚构" in readme or "fictional" in readme.lower())

    expected_heights = (330, 552, 960, 264, 214)
    for name, h in zip(FILES, expected_heights):
        source = (ROOT / "assets" / f"{name}.svg").read_text(encoding="utf-8")
        root = ET.fromstring(source)
        assert root.tag == SVG + "svg", name
        assert root.get("viewBox") == f"0 0 900 {h}", (name, root.get("viewBox"))
        assert root.get("role") == "img" and len(root.get("aria-label", "")) >= 35
        assert "prefers-color-scheme:dark" in source, name
        assert "prefers-reduced-motion:reduce" in source, name
        assert "--bg:#f1f4f9" in source and "--bg:#1d2736" in source, name
        assert "<script" not in source.lower() and "foreignObject" not in source, name
        assert not re.search(r'(?:href|src)="https?://', source), name
        assert "animation:" in source and "@keyframes" in source, name
        assert len(source.encode("utf-8")) < 24000, name
        assert sum(1 for n in root.iter() if n.tag == SVG + "text") >= 6
        print(f"PASS {name}: correct dimensions, self-contained SVG and theme accessibility")

    workspace = ET.fromstring((ROOT / "assets/editorial-workspace.svg").read_text())
    source = (ROOT / "assets/editorial-workspace.svg").read_text(encoding="utf-8")
    for i in range(4):
        assert source.count(f'class="chap chap{i}"') == 1, f"Missing scene {i}"
        assert source.count(f'class="tab-active tab{i}"') == 1, f"Missing nav {i}"
        assert f"@keyframes show{i}" in source
        assert f"chap{i}" in source
    assert "cursor" not in source.lower(), "Cursor simulation was deliberately eliminated"
    assert "24s" in source, "The four scenes must use one shared 24-second timeline"
    assert "Fictional roleplay" in source and "Private project source" in source
    assert source.count(">ATLAS</text>") == 2, "ATLAS active/static tabs must agree"
    assert source.count(">QINGJI</text>") == 2, "QingJi active/static tabs must agree"
    assert ">WINDOWS</text>" not in source and ">SHELL</text>" not in source
    print("PASS editorial project explorer: four synchronized chapters, no fake pointer")
    projects = (ROOT / "assets/editorial-projects.svg").read_text(encoding="utf-8")
    for expected in ("A.T. Field", "Saint Laurent", "ATLAS Developer Studio",
                     "QingJi", "Meridian", "ANDROID PROTOTYPE", "PRIVATE SOURCE"):
        assert expected in projects, f"Missing real project or correct status: {expected}"
    for name in FILES:
        source = (ROOT / "assets" / f"{name}.svg").read_text(encoding="utf-8")
        assert "glass-surface" in source
        assert "glass-thin" in source
        assert "glassPrism" in source
        assert "glassRefraction" in source
        assert "prefers-contrast:more" in source
    assert "not an Apple product" in readme
    assert "Liquid Glass" in readme and "Notion" not in readme, (
        "Attribution should describe inspiration without exposing private notes"
    )
    assert "轻记 QingJi" in readme and "ATLAS Developer Studio" in readme
    assert "原型" in readme and "虚构" in readme
    print("PASS Liquid Glass: glass chrome, readability fallbacks, real project statuses")
    print("PASS README: five full-width independently composed visual modules")


if __name__ == "__main__":
    run()
