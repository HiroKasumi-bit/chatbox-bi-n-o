"""Draws the QR code and the Aurora Haven logo used in the magazine.

    python3 tools/make_graphics.py      # writes assets/ui/qr_interview.png and assets/ui/logo.png

The QR codes link to the team's real-world interview video and to the interactive (FlipHTML5) edition. After drawing it, the script
reads it back with OpenCV's QR decoder, so a code that does not scan is never saved.
Needs: pip install segno opencv-python-headless pillow
"""
import math
from pathlib import Path

import cv2
import numpy as np
import segno
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "assets" / "ui"
INTERVIEW_URL = "https://youtu.be/QwcP_2Q3Esc"
FLIPBOOK_URL = "https://online.fliphtml5.com/MagazinePolarCity71844894/Aurora_Haven_Magazine_web/"
NAVY = (14, 26, 54)


def qr(url, path, error="h"):
    code = segno.make(url, error=error)
    code.save(str(path), scale=24, border=4, dark="#0E1A36", light="#FFFFFF")
    found, _, _ = cv2.QRCodeDetector().detectAndDecode(cv2.imread(str(path)))
    if found != url:
        path.unlink()
        raise SystemExit(f"QR code did not scan back: got {found!r}")
    print("QR code checked:", found)


def logo(path, size=1024):
    """A navy badge: aurora bands over the snow peak of Mount Aurora, ringed in white."""
    k = 4  # draw large, then shrink for smooth edges
    S = size * k
    c = S / 2
    img = Image.new("RGBA", (S, S))
    d = ImageDraw.Draw(img)
    r = S * 0.48
    d.ellipse([c - r, c - r, c + r, c + r], fill=NAVY + (255,))

    # Aurora: soft curved bands, green to violet.
    glow = Image.new("RGBA", (S, S))
    g = ImageDraw.Draw(glow)
    bands = [((31, 181, 143), 0.30, 0.10), ((47, 211, 192), 0.36, 0.07), ((123, 79, 214), 0.42, 0.06)]
    for col, y, w in bands:
        # Short slices, each a little curtain, fading out towards both ends of the band.
        n = 120
        for i in range(n):
            t0, t1 = i / n, (i + 1) / n
            x0 = c - r * 0.9 + t0 * r * 1.8
            x1 = c - r * 0.9 + t1 * r * 1.8
            y0 = S * y + math.sin(t0 * math.pi * 1.6 + 0.4) * S * 0.035
            y1 = S * y + math.sin(t1 * math.pi * 1.6 + 0.4) * S * 0.035
            a = int(210 * math.sin(math.pi * (t0 + t1) / 2) ** 0.8)
            g.polygon([(x0, y0), (x1, y1), (x1, y1 - S * w), (x0, y0 - S * w)], fill=col + (a,))
    glow = glow.filter(ImageFilter.GaussianBlur(S * 0.012))
    img.alpha_composite(glow)

    # Stars.
    rnd = np.random.default_rng(7)
    for _ in range(26):
        a = rnd.uniform(0, 2 * math.pi)
        rr = rnd.uniform(0.2, 0.85) * r
        x, y = c + math.cos(a) * rr, c + math.sin(a) * rr * 0.6 - r * 0.25
        s = rnd.uniform(0.002, 0.005) * S
        d.ellipse([x - s, y - s, x + s, y + s], fill=(255, 255, 255, 220))

    # Mount Aurora: a sharp central peak with a long eastern shoulder, on a snowfield.
    base = S * 0.70
    d.rectangle([0, base, S, S], fill=(36, 54, 92, 255))
    peak = [
        (c - r * 0.78, base), (c - r * 0.42, S * 0.58), (c - r * 0.25, S * 0.6), (c - r * 0.02, S * 0.36),
        (c + r * 0.16, S * 0.52), (c + r * 0.36, S * 0.55), (c + r * 0.8, base),
    ]
    d.polygon(peak, fill=(244, 247, 251, 255))
    rock = [(c - r * 0.02, S * 0.36), (c + r * 0.16, S * 0.52), (c + r * 0.05, S * 0.5), (c + r * 0.02, S * 0.44)]
    d.polygon(rock, fill=(150, 165, 185, 255))
    # Lit spa terraces at the foot of the peak.
    for i, w in enumerate([0.34, 0.27, 0.2]):
        y = base - S * 0.025 * (i + 1)
        d.rectangle([c - r * w / 2 - r * 0.02, y - S * 0.012, c + r * w / 2 - r * 0.02, y], fill=(255, 196, 120, 255))
    # Clip everything to the badge and add a white ring.
    mask = Image.new("L", (S, S))
    ImageDraw.Draw(mask).ellipse([c - r, c - r, c + r, c + r], fill=255)
    img.putalpha(Image.fromarray(np.minimum(np.array(img.getchannel("A")), np.array(mask))))
    d = ImageDraw.Draw(img)
    d.ellipse([c - r, c - r, c + r, c + r], outline=(255, 255, 255, 255), width=int(S * 0.018))
    img.resize((size, size), Image.LANCZOS).save(path)
    print("wrote", path)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    qr(INTERVIEW_URL, OUT / "qr_interview.png")
    qr(FLIPBOOK_URL, OUT / "qr_flipbook.png", error="m")  # a long link: medium error correction keeps the modules large
    logo(OUT / "logo.png")


if __name__ == "__main__":
    main()
