"""Turns the PNGs from tools/render_3d.js into the pictures in assets/renders.

    python3 tools/prepare_renders.py renders_raw

Photos become JPEGs; the overview keeps its transparent background; the cover tower is cut to
the top of the page (it is laid over the masthead); the tundra shot loses its foreground tree.
"""
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets', 'renders')
PHOTOS = ['cover', 'downtown', 'liberty', 'fusion', 'food', 'mount', 'renewable', 'water',
          'airport', 'stadium', 'rescue', 'lagoon', 'back']


def save_jpg(im, name):
    im.convert('RGB').save(os.path.join(OUT, name + '.jpg'), quality=90, optimize=True, progressive=True)


def main(raw):
    """Converts whichever renders are in `raw`, so a partial re-render updates only those."""
    os.makedirs(OUT, exist_ok=True)
    has = lambda name: os.path.exists(os.path.join(raw, name + '.png'))
    for name in filter(has, PHOTOS):
        save_jpg(Image.open(os.path.join(raw, name + '.png')), name)

    if has('snowbreak'):
        snow = Image.open(os.path.join(raw, 'snowbreak.png'))
        save_jpg(snow.crop((0, 0, snow.width, int(snow.height * 0.8))), 'snowbreak')

    if has('overview'):
        overview = Image.open(os.path.join(raw, 'overview.png')).convert('RGBA')
        overview.crop(overview.getbbox()).save(os.path.join(OUT, 'overview.png'), optimize=True)

    if has('cover_tower'):
        tower = Image.open(os.path.join(raw, 'cover_tower.png')).convert('RGBA')
        tower.crop((0, 0, tower.width, int(tower.height * 0.32))).save(os.path.join(OUT, 'cover_tower_top.png'), optimize=True)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'renders_raw')
