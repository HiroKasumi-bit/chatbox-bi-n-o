"""Make Aurora Haven renders look like photographs while keeping their layout.

Stage 1: SDXL (RealVisXL V5) img2img guided by a Canny edge map of the render (ControlNet),
         at about 1.4 megapixels.
Stage 2 (--refine): upscale to the render's exact pixel size, then re-detail it tile by tile
         at low strength, again guided by the render's edges, and blend the tiles.

    python photoreal.py RAW_DIR OUT_DIR --names spa,lagoon --strength 0.5
"""
import argparse
import math
import time
from pathlib import Path

import cv2
import numpy as np
import torch
from diffusers import (AutoencoderKL, ControlNetModel, DPMSolverMultistepScheduler,
                       StableDiffusionXLControlNetImg2ImgPipeline, StableDiffusionXLImg2ImgPipeline)
from PIL import Image

STYLE = ", professional architectural photography, photorealistic, real materials, natural light, sharp focus, highly detailed"
# Free mode: the render only suggests the layout; the picture is re-imagined as a magazine photograph.
STYLE_FREE = ", award-winning architectural photography, cinematic lighting, ultra detailed, photorealistic, magazine cover, shot on Phase One"
NEGATIVE = ("3d render, cgi, video game, low poly, cartoon, illustration, painting, plastic, toy, "
            "miniature, tilt-shift, text, watermark, logo, signature, blurry, deformed, distorted, oversaturated, "
            "nude, naked, nsfw, bare skin")

# Short subject lines (SDXL reads ~77 tokens), condensed from image_kit/prompts.md.
SUBJECTS = {
    "welcome_pano": "wide aerial photo of a modern arctic city at dusk, snowy blocks, lit skyscraper in the centre, greenhouse domes, turquoise geothermal lagoon, small snowy mountain, pine forest, row of wind turbines",
    "liberty_dusk": "night photo of a snowy city square, bronze statue on a dark stone pedestal, planetarium dome, lit flower bed, apartment buildings, snowy pine tree, warm street lamp, people",
    "fusion_spread": "night photo of a fusion power station under the aurora borealis, large concrete reactor dome with glowing violet rings, dark cylinder stacks with light steam, snowy roads with lamps",
    "food": "aerial dusk photo of an arctic food factory, stainless steel storage tanks and silos, industrial halls, glowing domes, snow, wind turbines on the horizon",
    "spa": "blue hour photo of a futuristic terraced glass spa built into a small snowy rocky arctic peak, warm glowing windows, small illuminated glass dome on top, lit round plaza with lamp posts and people in winter coats, fresh snow",
    "grotto": "photo inside a dark rock cave with a turquoise geothermal pool, swimmers, wooden footbridge and railing, waterfall curtain, rising steam, warm lamp light",
    "resident": "night street photo taken with a phone, green aurora borealis over the horizon, row of street lamps, snowy pine tree, wooden houses, apartment block, people walking, snow",
    "back": "night photo of a small snowy mountain with a terraced spa and glass dome, turquoise lagoon with lamp posts, pine trees, aurora borealis in a starry sky",
    "lagoon": "night photo of a steaming turquoise geothermal pool with swimmers in front of a small snowy mountain spa with a glass dome, pine trees, lamp posts, aurora borealis, stars",
    "greenhouse": "photo inside a geodesic glass greenhouse dome at night, rows of hydroponic racks with lettuce, herbs and strawberries under pink LED grow lights, people walking",
    "street_dusk": "eye level photo of a snowy city street at dusk, two people walking, apartment buildings, street lamps, cars with headlights, purple and orange sky",
    "storm": "photo of a blizzard, snow covered pine trees, wind turbines fading into heavy falling snow, bitterly cold",
    "principles": "aerial photo of a snowy arctic downtown in low winter sun, tall dark towers, observatory dome, red and white houses, small snowy mountain with a spa, tanks",
    "downtown_aerial": "daytime drone photo of snowy city blocks in winter, buildings, grid of dark roads, small houses, solar panels, wind turbines",
    "houses_dusk": "dusk photo of a snowy residential street, dark blue and yellow wooden houses, snowy pine tree, apartment block, warm window lights",
    "approach_dusk": "dusk photo of a snowy street leading to a small mountain spa with a glass dome, people walking, lamp posts, houses on both sides",
    "homes": "aerial winter dusk photo of family houses with blue, white and red roofs, snowy pine trees, wind turbines and a tower on the horizon",
    "renewable": "photo of a wind farm and a solar panel field in low polar sun, snow, long shadows",
    "water": "photo of a water recycling plant in snow and low sun, round settling tanks, long diagonal pipe, low industrial buildings, wind turbine towers, long shadows",
    "ecosystem": "photo of four reindeer with thick fur and antlers on snowy tundra, small snowy mountain with a spa building, pine trees",
    "airport": "dusk photo of an arctic airport, runway lights, airliner taking off, glass terminal, control tower, small parked plane, snow",
    "rescue": "aerial photo of an arctic rescue station in low sun, red brick building with a curved roof, red emergency vehicles, helipad, road, pine trees, snow",
    "stadium": "aerial night photo of a round snow stadium with a glowing white ring and golden band, lamps around it, road, buildings, snow",
}


def edges(img):
    gray = cv2.GaussianBlur(cv2.cvtColor(np.array(img), cv2.COLOR_RGB2GRAY), (3, 3), 0)
    v = float(np.median(gray))
    low, high = max(30, int(0.66 * v)), max(90, int(1.33 * v))
    e = cv2.Canny(gray, low, high)
    return Image.fromarray(np.stack([e] * 3, -1))


def fit(w, h, megapixels):
    s = math.sqrt(megapixels * 1e6 / (w * h))
    return max(512, round(w * s / 32) * 32), max(512, round(h * s / 32) * 32)


def load_pipe(free=False):
    vae = AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
    if free:
        pipe = StableDiffusionXLImg2ImgPipeline.from_pretrained(
            "SG161222/RealVisXL_V5.0", vae=vae, torch_dtype=torch.float16, variant="fp16", use_safetensors=True)
    else:
        controlnet = ControlNetModel.from_pretrained("xinsir/controlnet-canny-sdxl-1.0", torch_dtype=torch.float16)
        pipe = StableDiffusionXLControlNetImg2ImgPipeline.from_pretrained(
            "SG161222/RealVisXL_V5.0", controlnet=controlnet, vae=vae,
            torch_dtype=torch.float16, variant="fp16", use_safetensors=True)
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True)
    pipe.enable_model_cpu_offload()
    pipe.set_progress_bar_config(disable=True)
    return pipe


def run(pipe, prompt, image, control, strength, cn_scale, steps, seed):
    common = dict(prompt=prompt, negative_prompt=NEGATIVE, image=image, strength=strength,
                  guidance_scale=5.5, num_inference_steps=steps,
                  generator=torch.Generator("cuda").manual_seed(seed))
    if isinstance(pipe, StableDiffusionXLControlNetImg2ImgPipeline):
        common.update(control_image=control, controlnet_conditioning_scale=cn_scale, control_guidance_end=0.85)
    return pipe(**common).images[0]


def refine(pipe, prompt, image, render, strength, cn_scale, steps, seed, tile=1024, overlap=160):
    """Re-detail a full-size image tile by tile and feather the seams."""
    w, h = image.size
    control = edges(render)
    acc = np.zeros((h, w, 3), np.float64)
    weight = np.zeros((h, w, 1), np.float64)
    step = tile - overlap
    xs = list(range(0, max(1, w - tile), step)) + [max(0, w - tile)]
    ys = list(range(0, max(1, h - tile), step)) + [max(0, h - tile)]
    for y in sorted(set(ys)):
        for x in sorted(set(xs)):
            box = (x, y, min(w, x + tile), min(h, y + tile))
            tw, th = box[2] - box[0], box[3] - box[1]
            tw32, th32 = tw // 32 * 32, th // 32 * 32
            crop = image.crop(box).resize((tw32, th32), Image.LANCZOS)
            ctrl = control.crop(box).resize((tw32, th32), Image.LANCZOS)
            out = run(pipe, prompt, crop, ctrl, strength, cn_scale, steps, seed).resize((tw, th), Image.LANCZOS)
            ramp_x = np.minimum(np.arange(tw) + 1, np.arange(tw)[::-1] + 1).clip(max=overlap) / overlap
            ramp_y = np.minimum(np.arange(th) + 1, np.arange(th)[::-1] + 1).clip(max=overlap) / overlap
            mask = (ramp_y[:, None] * ramp_x[None, :])[..., None]
            acc[box[1]:box[3], box[0]:box[2]] += np.asarray(out, np.float64) * mask
            weight[box[1]:box[3], box[0]:box[2]] += mask
    return Image.fromarray((acc / np.maximum(weight, 1e-6)).clip(0, 255).astype(np.uint8))


def compare(a, b, path, width=2000):
    h = round(a.height * (width / 2) / a.width)
    sheet = Image.new("RGB", (width, h), "white")
    sheet.paste(a.resize((width // 2, h), Image.LANCZOS), (0, 0))
    sheet.paste(b.resize((width // 2, h), Image.LANCZOS), (width // 2, 0))
    sheet.save(path, quality=88)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("raw_dir")
    ap.add_argument("out_dir")
    ap.add_argument("--names", required=True, help="comma-separated render names (no .jpg)")
    ap.add_argument("--strength", default="0.5", help="one or more, comma-separated")
    ap.add_argument("--cn", type=float, default=0.7)
    ap.add_argument("--mp", type=float, default=1.4)
    ap.add_argument("--steps", type=int, default=30)
    ap.add_argument("--seed", type=int, default=81)
    ap.add_argument("--refine", type=float, default=0.0, help="strength of the tiled full-size pass; 0 = off")
    ap.add_argument("--free", action="store_true", help="no ControlNet: re-imagine the picture, keep only the rough layout")
    ap.add_argument("--prompt", help="override the whole prompt (subject + style)")
    ap.add_argument("--neg", help="override the negative prompt")
    ap.add_argument("--tag", default="", help="extra label for the output file names")
    ap.add_argument("--seeds", help="comma-separated seeds; overrides --seed")
    args = ap.parse_args()
    global NEGATIVE
    if args.neg:
        NEGATIVE = args.neg
    seeds = [int(v) for v in args.seeds.split(",")] if args.seeds else [args.seed]

    raw, out = Path(args.raw_dir), Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    pipe = load_pipe(args.free)
    print(f"pipeline ready in {time.time() - t0:.0f}s", flush=True)
    for name in args.names.split(","):
        render = Image.open(raw / f"{name}.jpg").convert("RGB")
        prompt = args.prompt or SUBJECTS[name] + (STYLE_FREE if args.free else STYLE)
        w, h = fit(*render.size, args.mp)
        small = render.resize((w, h), Image.LANCZOS)
        for s in [float(v) for v in args.strength.split(",")]:
            for seed in seeds:
                t = time.time()
                result = run(pipe, prompt, small, edges(small), s, args.cn, args.steps, seed)
                tag = f"{name}{('_' + args.tag) if args.tag else ''}__s{s:.2f}_seed{seed}"
                full = result.resize(render.size, Image.LANCZOS)
                if args.refine > 0:
                    full = refine(pipe, prompt, full, render, args.refine, args.cn, args.steps, seed)
                    tag += f"_r{args.refine:.2f}"
                full.save(out / f"{tag}.jpg", quality=92)
                compare(render, full, out / f"{tag}__compare.jpg")
                print(f"{tag}: {w}x{h} -> {render.size[0]}x{render.size[1]} in {time.time() - t:.0f}s", flush=True)


if __name__ == "__main__":
    main()
