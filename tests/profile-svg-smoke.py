"""Offline, dependency-free checks for SVG profile rendering fallbacks."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
FILES = ("header", "profile-panel", "launch-workspace", "work", "ethos", "footer")
SVG = "{http://www.w3.org/2000/svg}"


def run():
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    for name in FILES:
        path = ROOT / "assets" / (name + ".svg")
        source = path.read_text(encoding="utf-8")
        root = ET.fromstring(source)
        assert root.tag == SVG + "svg", name
        assert root.get("viewBox", "").startswith("0 0 900 "), name
        assert root.get("role") == "img", name
        assert len(root.get("aria-label", "")) >= 15, name
        assert not re.search(r'(?:fill|stroke)="var\(', source), f"{name}: CSS-only color without safe fallback"
        assert "<script" not in source.lower(), name
        assert "foreignObject" not in source, name
        assert not re.search(r'(?:href|src)="https?://', source), f"{name}: remote dependencies"
        assert f"./assets/{name}.svg?v=20261106-polish" in readme, name
        assert len(root.findall(".//" + SVG + "text")) >= 8, name
        print(f"PASS {name}.svg: valid XML, self-contained, readable static colors, accessible alt")
    source = (ROOT / "assets" / "launch-workspace.svg").read_text(encoding="utf-8")
    root = ET.fromstring(source)
    for index in range(4):
        matches = [node for node in root.iter(SVG + "g")
                   if node.get("class") == f"scene scene{index}"]
        assert len(matches) == 2, (index, len(matches))
        assert all(n.get("opacity") == ("1" if index == 0 else "0")
                   for n in matches), f"Scene {index} does not have deterministic static fallback"
    assert "prefers-reduced-motion:reduce" in source
    assert ".scene0,.scene1,.scene2,.scene3,.cursor" in source
    assert 'attributeName="opacity"' not in source, "SMIL scenes would ignore reduced motion"
    print("PASS launch animation: single static fallback frame, four scene timings, reduced motion")
    assert "government" in readme.lower() or "政府" in readme, "Roleplay disclosure missing"
    print("PASS roleplay disclosure & README asset integrity")


if __name__ == "__main__":
    run()
