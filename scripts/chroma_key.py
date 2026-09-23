"""Chroma-key a solid-green shirt mockup to a transparent, tightly cropped PNG.

Usage: python3 chroma_key.py <input_green.png> <output.png>

Reads a flat-lay shirt photographed on a uniform chroma-key green background and
produces a transparent cutout (with green-spill suppression and feathered edges)
cropped to the shirt's bounding box so framing matches the front mockups.
"""

import sys
import numpy as np
from PIL import Image


def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / max(edge1 - edge0, 1e-6), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def chroma_key(in_path, out_path):
    img = Image.open(in_path).convert("RGB")
    arr = np.asarray(img).astype(np.float32)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]

    # "Greenness": how much green dominates the other channels.
    greenness = g - np.maximum(r, b)

    # Background where green dominates. A tight transition band keeps edges crisp
    # and, crucially, treats the soft green shadow cast on the backdrop (which is
    # still fairly green) as background so it doesn't leave a blurry gray halo.
    bg = smoothstep(18.0, 55.0, greenness)
    alpha = 1.0 - bg

    # Choke faint partial-alpha pixels so the cutout edge stays sharp instead of
    # fading out over several pixels.
    alpha = np.clip((alpha - 0.30) / 0.55, 0.0, 1.0)

    # Despill: clamp the green channel on shirt pixels so edges don't look lime.
    spill = g - np.maximum(r, b)
    mask = spill > 0
    g = np.where(mask, np.minimum(g, np.maximum(r, b)), g)

    rgb = np.stack([r, g, b], axis=-1)
    out = np.dstack([rgb, alpha * 255.0]).astype(np.uint8)
    result = Image.fromarray(out, mode="RGBA")

    # Crop to the visible shirt (alpha bbox) with a small uniform margin.
    a = (alpha * 255).astype(np.uint8)
    ys, xs = np.where(a > 12)
    if len(xs) and len(ys):
        pad = 12
        x0 = max(int(xs.min()) - pad, 0)
        y0 = max(int(ys.min()) - pad, 0)
        x1 = min(int(xs.max()) + pad, result.width)
        y1 = min(int(ys.max()) + pad, result.height)
        result = result.crop((x0, y0, x1, y1))

    result.save(out_path)
    print(f"saved {out_path} -> {result.width}x{result.height}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("usage: chroma_key.py <input_green.png> <output.png>")
        sys.exit(1)
    chroma_key(sys.argv[1], sys.argv[2])
