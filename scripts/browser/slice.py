"""Slice tall full-page captures into readable parts: python slice.py <session dir>"""
import pathlib
import sys
from PIL import Image

d = pathlib.Path(sys.argv[1])
out = d / "slices"
out.mkdir(exist_ok=True)
n = 0
for f in sorted(d.glob("*.png")):
    if "-fig-" in f.name:
        continue
    im = Image.open(f)
    w, h = im.size
    part_h = 1700 if w > 800 else 1500        # desktop 1280 wide, phone 390 wide
    if h <= part_h * 1.2:
        continue
    k = 0
    y = 0
    while y < h:
        k += 1
        box = (0, y, w, min(h, y + part_h))
        im.crop(box).save(out / f"{f.stem}-part{k}.png")
        n += 1
        y += part_h - 80                       # a little overlap so nothing is cut unseen
print(d.name, n, "slices")
