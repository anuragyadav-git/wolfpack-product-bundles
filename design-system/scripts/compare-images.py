#!/usr/bin/env python3
"""Image diff utility used by design-system QA.

Usage:
  python design-system/scripts/compare-images.py expected.png actual.png [--threshold 0.01]
"""

import argparse
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("expected")
    parser.add_argument("actual")
    parser.add_argument("--threshold", type=float, default=0.0)
    return parser.parse_args()


def main():
    args = parse_args()
    expected = Path(args.expected)
    actual = Path(args.actual)
    if not expected.exists() or not actual.exists():
        raise SystemExit("compare-images.py requires both image paths to exist")

    try:
        from PIL import Image, ImageChops
    except ModuleNotFoundError as error:
        raise SystemExit(
            "Pillow is not installed. Install with `pip install pillow` to run image comparisons."
        ) from error

    expected_img = Image.open(expected).convert("RGBA")
    actual_img = Image.open(actual).convert("RGBA")
    if expected_img.size != actual_img.size:
        raise SystemExit("Image sizes differ; compare with matching viewport dimensions only.")

    diff = ImageChops.difference(expected_img, actual_img)
    stat = diff.getbbox()
    if stat is None:
        print("Images match exactly.")
        return

    if args.threshold <= 0:
        raise SystemExit("Image diff detected.")
    raise SystemExit(f"Image diff detected above threshold={args.threshold}.")


if __name__ == "__main__":
    main()
