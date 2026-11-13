"""Ghost a snow-mountain shell over a photo of the terraced spa, so the spa reads as being inside.

    python cutaway.py SPA.jpg ROCK.jpg OUT.jpg [--apex 0.5,0.08] [--base 0.74] [--spread 0.68]

SPA.jpg  - the photoreal terraced spa (the building stays fully visible through the shell)
ROCK.jpg - a full-frame snowy rock texture, used as the shell's surface
The shell is a jagged peak silhouette; it is more opaque near its outline and see-through in
the middle, with a soft bright rim, like an architectural X-ray view.
"""
import argparse

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def silhouette(w, h, apex, base_y, spread, seed=7, ridge=None):
    """Ridge line from the left foot over the summit to the right foot, with rocky jitter.

    ridge: optional list of (x, y) shares of the image size, left foot to right foot."""
    rng = np.random.default_rng(seed)
    if ridge is None:
        ax, ay = apex
        ridge = [(ax - spread, base_y), (ax, ay), (ax + spread, base_y)]
    keys = [(x * w, y * h) for x, y in ridge]
    pts = []
    for (x0, y0), (x1, y1) in zip(keys, keys[1:]):
        n = 24
        for i in range(n):
            t = i / n
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            if 0 < t:  # slightly uneven ridge line between the key points
                y += rng.normal(0, h * 0.0025) * (1 - abs(0.5 - t))
                x += rng.normal(0, w * 0.0012)
            pts.append((x, y))
    pts.append(keys[-1])
    return pts  # closed along the ground line (last point back to the first)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spa")
    ap.add_argument("rock")
    ap.add_argument("out")
    ap.add_argument("--apex", default="0.5,0.08")
    ap.add_argument("--base", type=float, default=0.74, help="ground line of the shell, share of height")
    ap.add_argument("--spread", type=float, default=0.68, help="half width of the shell at the ground, share of width")
    ap.add_argument("--inner", type=float, default=0.28, help="shell opacity in the middle")
    ap.add_argument("--outer", type=float, default=0.72, help="shell opacity at the outline")
    ap.add_argument("--ridge", help='key points "x,y;x,y;..." as shares of the size, left foot to right foot')
    ap.add_argument("--keep", help='foreground boxes left uncovered, "x0,y0,x1,y1;..." as shares of the size')
    ap.add_argument("--fade", type=float, default=0.05, help="height share over which the shell fades into the ground")
    ap.add_argument("--snow", type=float, default=0.0, help="white snow cap on the upper shell, 0 = none, 1 = strong")
    args = ap.parse_args()

    spa = Image.open(args.spa).convert("RGB")
    w, h = spa.size
    rock = Image.open(args.rock).convert("RGB").resize((w, h), Image.LANCZOS)
    apex = tuple(float(v) for v in args.apex.split(","))
    ridge = [tuple(float(v) for v in p.split(",")) for p in args.ridge.split(";")] if args.ridge else None
    pts = silhouette(w, h, apex, args.base, args.spread, ridge=ridge)

    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    # distance-like falloff from the outline: blur the mask hard and compare
    inner = np.asarray(mask.filter(ImageFilter.GaussianBlur(w * 0.06)), np.float32) / 255
    m = np.asarray(mask, np.float32) / 255
    edge = np.clip((1 - inner) * 2.2, 0, 1) * m           # 1 near the outline, 0 deep inside
    alpha = (args.inner + (args.outer - args.inner) * edge) * m
    # melt the foot of the shell into the snow instead of a straight cut
    foot = max(y for _, y in pts)
    rows = np.arange(h, dtype=np.float32)[:, None]
    alpha *= np.clip((foot - rows) / max(1.0, args.fade * h), 0, 1)
    # foreground objects (lamp posts, people) stay in front of the shell
    if args.keep:
        keep = Image.new("L", (w, h), 0)
        for box in args.keep.split(";"):
            x0, y0, x1, y1 = (float(v) for v in box.split(","))
            ImageDraw.Draw(keep).rectangle((x0 * w, y0 * h, x1 * w, y1 * h), fill=255)
        alpha *= 1 - np.asarray(keep.filter(ImageFilter.GaussianBlur(2)), np.float32) / 255

    a = np.asarray(spa, np.float32)
    r = np.asarray(rock, np.float32)
    # cool, slightly lifted shell so the warm spa glows through it
    r = r * 0.85 + np.array([18, 26, 40], np.float32)
    out = a * (1 - alpha[..., None]) + r * alpha[..., None]

    # a snow cap: the upper part of the shell turns white, strongest along the outline
    if args.snow > 0:
        top = min(y for _, y in pts)
        cap = np.clip((top + 0.42 * (foot - top) - rows) / (0.30 * (foot - top)), 0, 1)
        snow_a = (args.snow * cap * (0.35 + 0.65 * edge) * m)[..., None]
        out = out * (1 - snow_a) + np.array([236, 243, 252], np.float32) * snow_a

    # bright rim along the outline
    rim = Image.new("L", (w, h), 0)
    ImageDraw.Draw(rim).line(pts, fill=255, width=max(2, w // 500), joint="curve")
    glow = np.asarray(rim.filter(ImageFilter.GaussianBlur(w * 0.006)), np.float32) / 255
    line = np.asarray(rim.filter(ImageFilter.GaussianBlur(1)), np.float32) / 255
    rim_a = np.clip(line * 0.8 + glow * 0.9, 0, 1)[..., None]
    out = out * (1 - rim_a) + np.array([225, 238, 255], np.float32) * rim_a

    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(args.out, quality=93)
    print("saved", args.out)


if __name__ == "__main__":
    main()
