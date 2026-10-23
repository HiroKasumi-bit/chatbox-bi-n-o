"""Draws the soft dark gradients laid over photos so white text stays readable.

    python3 tools/make_shades.py      # writes assets/ui/shade_*.png

Each PNG fades from transparent to the magazine's polar-night navy (0E1A36).
"""
from pathlib import Path

from PIL import Image

NAVY = (14, 26, 54)
OUT = Path(__file__).resolve().parent.parent / "assets" / "ui"


def shade(width, height, along, strength=0.92, power=1.6):
    """along: 'down' darkens towards the bottom, 'up' towards the top."""
    img = Image.new("RGBA", (width, height))
    px = img.load()
    for y in range(height):
        for x in range(width):
            t = y / (height - 1) if along == "down" else 1 - y / (height - 1)
            a = int(255 * strength * t ** power)
            px[x, y] = NAVY + (a,)
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    shade(16, 512, "down").save(OUT / "shade_bottom.png")
    shade(16, 512, "up", 0.85).save(OUT / "shade_top.png")
    # A stronger top shade for pale, busy pictures.
    shade(16, 512, "up", 0.92, 0.8).save(OUT / "shade_top_strong.png")
    # Fully opaque at the bottom edge, so a photo melts into a navy page below it.
    shade(16, 512, "down", 1.0, 1.4).save(OUT / "fade_bottom.png")


if __name__ == "__main__":
    main()
