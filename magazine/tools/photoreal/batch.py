"""Run many pictures through photoreal.py's free mode with one pipeline load.

    python batch.py RAW_DIR OUT_DIR jobs.json

jobs.json: [{"name": "storm", "strength": 0.8, "seeds": [1, 2], "prompt": "...optional..."}]
Writes <name>[_<tag>]__s<strength>_seed<seed>.jpg (render size) and a contact sheet
<name>[_<tag>]__sheet.jpg showing the render next to every candidate.
"""
import json
import sys
import time
from pathlib import Path

from PIL import Image

import photoreal as pr


def sheet(images, path, height=700):
    tiles = [im.resize((round(im.width * height / im.height), height), Image.LANCZOS) for im in images]
    out = Image.new("RGB", (sum(t.width for t in tiles) + 10 * (len(tiles) - 1), height), "white")
    x = 0
    for t in tiles:
        out.paste(t, (x, 0))
        x += t.width + 10
    out.save(path, quality=85)


def main():
    raw, out, jobs = Path(sys.argv[1]), Path(sys.argv[2]), json.loads(Path(sys.argv[3]).read_text(encoding="utf-8"))
    out.mkdir(parents=True, exist_ok=True)
    pipe = pr.load_pipe(free=True)
    default_negative = pr.NEGATIVE
    for job in jobs:
        name, s = job["name"], float(job["strength"])
        pr.NEGATIVE = default_negative + (", " + job["neg"] if job.get("neg") else "")
        # "size": [w, h] makes a picture from text alone at that size (no render needed)
        render = Image.new("RGB", tuple(job["size"]), (110, 110, 120)) if job.get("size") else Image.open(raw / f"{name}.jpg").convert("RGB")
        prompt = job.get("prompt") or pr.SUBJECTS[name] + pr.STYLE_FREE
        w, h = pr.fit(*render.size, job.get("mp", 1.1))
        small = render.resize((w, h), Image.LANCZOS)
        label = name + (f"_{job['tag']}" if job.get("tag") else "")
        results = [render]
        for seed in job["seeds"]:
            t = time.time()
            img = pr.run(pipe, prompt, small, None, s, 0, 30, seed).resize(render.size, Image.LANCZOS)
            img.save(out / f"{label}__s{s:.2f}_seed{seed}.jpg", quality=92)
            results.append(img)
            print(f"{label} s{s:.2f} seed{seed}: {w}x{h} in {time.time() - t:.0f}s", flush=True)
        sheet(results, out / f"{label}__sheet.jpg")


if __name__ == "__main__":
    main()
