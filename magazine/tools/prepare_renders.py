"""Turns the raw pictures from the 3D city into the files the magazine uses.

    python3 tools/prepare_renders.py ../magazine/renders_raw

- every JPEG is copied to assets/renders (re-saved at quality 90 to keep the file small);
- pictures that run across a double-page spread are cut into a left and a right half
  (<name>_L.jpg and <name>_R.jpg), one for each page; so is the city master plan;
- the transparent picture of Aurora 81 is cut down to the part that rises in front of the
  masthead on the cover (cover_tower_top.png).
"""
import sys
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "assets" / "renders"
SPREADS = ["welcome_pano", "liberty_dusk", "fusion_spread", "grotto"]
PLANS = Path(__file__).resolve().parent.parent / "assets" / "plans"
SPREAD_PLANS = []  # no plan is laid across a spread any more
COVER_TOP = 0.2  # share of the cover height kept for the tower overlay


def main(raw):
    raw = Path(raw)
    ASSETS.mkdir(parents=True, exist_ok=True)
    for src in sorted(raw.glob("*.jpg")):
        img = Image.open(src).convert("RGB")
        if src.stem in SPREADS:
            half = img.width // 2
            img.crop((0, 0, half, img.height)).save(ASSETS / f"{src.stem}_L.jpg", quality=90)
            img.crop((half, 0, img.width, img.height)).save(ASSETS / f"{src.stem}_R.jpg", quality=90)
        else:
            img.save(ASSETS / src.name, quality=90)
        print("prepared", src.name)
    for name in SPREAD_PLANS:
        img = Image.open(PLANS / name)
        half = img.width // 2
        stem = name[:-4]
        img.crop((0, 0, half, img.height)).save(PLANS / f"{stem}_L.png", optimize=True)
        img.crop((half, 0, img.width, img.height)).save(PLANS / f"{stem}_R.png", optimize=True)
        print("split", name)
    tower = raw / "cover_tower.png"
    if tower.exists():
        img = Image.open(tower)
        img.crop((0, 0, img.width, round(img.height * COVER_TOP))).save(ASSETS / "cover_tower_top.png", optimize=True)
        print("prepared cover_tower_top.png")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "renders_raw")
