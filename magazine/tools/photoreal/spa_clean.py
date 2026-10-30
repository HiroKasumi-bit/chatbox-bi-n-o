"""Remove the mountain behind the spa: everything above the ground line, except the building,
becomes a clean blue-hour sky rebuilt from the photo's own sky colours.

    python spa_clean.py IN.jpg OUT.jpg
"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src = Image.open(sys.argv[1]).convert("RGB")
w, h = src.size
a = np.asarray(src, np.float32)

# Sky colour per row, sampled where the photo shows open sky (top right), then carried down to a
# brighter, pinker horizon at the ground line.
ground = 0.664 * h
rows = np.arange(h, dtype=np.float32)
ref = a[: int(0.42 * h), int(0.86 * w):].mean(axis=1)  # rows x 3
top, mid = ref[: 40].mean(0), ref[-40:].mean(0)
horizon = np.minimum(mid * 1.18 + np.array([18, 6, 4]), 255)
t = np.clip(rows / ground, 0, 1)[:, None]
sky = np.where(t < 0.62, top + (mid - top) * (t / 0.62), mid + (horizon - mid) * ((t - 0.62) / 0.38))
sky = np.repeat(sky[:, None, :], w, axis=1)
sky += np.random.default_rng(3).normal(0, 1.2, sky.shape)  # break up banding

# The building stays: its terraces, the dome and the lamp post, as measured on this photo.
keep = Image.new("L", (w, h), 0)
d = ImageDraw.Draw(keep)
for x0, y0, x1, y1 in [(540, 818, 1048, 950), (428, 945, 1218, 1140), (325, 1142, 1372, 1330), (188, 1340, 1662, 1640)]:
    d.rounded_rectangle((x0, y0, x1, y1), radius=30, fill=255)  # the terraces, level 4 down to level 1
d.ellipse((703, 695, 877, 862), fill=255)          # Aurora Eye dome
d.rectangle((1097, 1190, 1170, 2160), fill=255)     # lamp post
keep = np.asarray(keep.filter(ImageFilter.GaussianBlur(3)), np.float32)[..., None] / 255

replace = (rows < ground)[:, None, None].astype(np.float32)
soft = np.clip((ground - rows) / 25, 0, 1)[:, None, None]  # feather into the snow
alpha = replace * soft * (1 - keep)
out = a * (1 - alpha) + sky * alpha
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(sys.argv[2], quality=94)
print("saved", sys.argv[2])
