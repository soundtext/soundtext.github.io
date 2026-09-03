"""verify_sot.py - quick post-build sanity check."""
import re
import pathlib

ROOT = pathlib.Path(r"C:\Account\GH-pages\blog-sot-github\final\soundtext.github.io-main")
OUT = ROOT / "sound-of-text"

files = sorted(OUT.rglob("index.html"))
print(f"Total HTML files: {len(files)}")
print(f"Expected: 31")
print()

broken_liquid = []
broken_assets = []
bad_html = []
for f in files:
    txt = f.read_text(encoding="utf-8")
    if "{{" in txt or "{%" in txt:
        broken_liquid.append(f)
    for asset in re.findall(r'(?:href|src)="(/[^"]+)"', txt):
        p = ROOT / asset.lstrip("/")
        if not p.exists():
            broken_assets.append((f, asset))
    # Quick HTML well-formedness: count opening/closing of key tags
    if txt.count("<html") != txt.count("</html>"):
        bad_html.append((f, "html tag mismatch"))
    if txt.count("<head>") != txt.count("</head>"):
        bad_html.append((f, "head tag mismatch"))
    if txt.count("<body") != txt.count("</body>"):
        bad_html.append((f, "body tag mismatch"))

print(f"Files with residual Liquid: {len(broken_liquid)}")
for b in broken_liquid:
    print(f"  - {b}")

print(f"Files with missing assets: {len(broken_assets)}")
for b in broken_assets[:10]:
    print(f"  - {b[0].relative_to(ROOT)} -> {b[1]}")

print(f"Files with malformed tags: {len(bad_html)}")
for b in bad_html:
    print(f"  - {b}")

# Spot-check hub page contains expected languages
hub = (OUT / "index.html").read_text(encoding="utf-8")
languages_in_hub = re.findall(r"/sound-of-text/([a-z\-]+)/", hub)
unique = sorted(set(languages_in_hub))
print(f"\nLanguages linked from hub page: {len(unique)}")
for u in unique:
    print(f"  - {u}")
