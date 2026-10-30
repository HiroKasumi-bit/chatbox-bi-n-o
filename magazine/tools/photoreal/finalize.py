"""Re-detail the chosen candidates at full size (tiled img2img at low strength) for print.

    python finalize.py RAW_DIR OUT_DIR picks.json

picks.json: {"storm": {"file": "out/batch/storm__s0.80_seed2.jpg", "refine": 0.3}, ...}
"refine": 0 copies the candidate unchanged. Output: OUT_DIR/<name>.jpg at the render's exact size.
"""
import json
import sys
import time
from pathlib import Path

from PIL import Image

import photoreal as pr


def main():
    raw, out, picks = Path(sys.argv[1]), Path(sys.argv[2]), json.loads(Path(sys.argv[3]).read_text(encoding="utf-8"))
    out.mkdir(parents=True, exist_ok=True)
    pipe = None
    for name, pick in picks.items():
        t = time.time()
        render = Image.open(raw / f"{name}.jpg").convert("RGB")
        img = Image.open(pick["file"]).convert("RGB").resize(render.size, Image.LANCZOS)
        strength = float(pick.get("refine", 0.3))
        if strength > 0:
            pipe = pipe or pr.load_pipe(free=True)
            prompt = pick.get("prompt") or pr.SUBJECTS.get(name, "") + pr.STYLE_FREE
            img = pr.refine(pipe, prompt, img, render, strength, 0, 30, pick.get("seed", 81))
        img.save(out / f"{name}.jpg", quality=93)
        print(f"{name}: {render.size[0]}x{render.size[1]} refine {strength} in {time.time() - t:.0f}s", flush=True)


if __name__ == "__main__":
    main()
