from __future__ import annotations

import argparse
import json
import struct
import sys
from pathlib import Path
from typing import Any

from common import DesignJobError, atomic_write_text, sha256_file


def image_dimensions(path: Path) -> tuple[int, int, str]:
    data = path.read_bytes()
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        width, height = struct.unpack(">II", data[16:24])
        return width, height, "PNG"
    if data[:6] in {b"GIF87a", b"GIF89a"} and len(data) >= 10:
        width, height = struct.unpack("<HH", data[6:10])
        return width, height, "GIF"
    if data.startswith(b"\xff\xd8"):
        offset = 2
        while offset + 9 < len(data):
            if data[offset] != 0xFF:
                offset += 1
                continue
            marker = data[offset + 1]
            offset += 2
            if marker in {0xD8, 0xD9}:
                continue
            if offset + 2 > len(data):
                break
            length = struct.unpack(">H", data[offset : offset + 2])[0]
            if marker in {
                0xC0,
                0xC1,
                0xC2,
                0xC3,
                0xC5,
                0xC6,
                0xC7,
                0xC9,
                0xCA,
                0xCB,
                0xCD,
                0xCE,
                0xCF,
            }:
                height, width = struct.unpack(">HH", data[offset + 3 : offset + 7])
                return width, height, "JPEG"
            offset += length
    raise DesignJobError(
        f"Unsupported or unreadable image: {path}. Supported dependency-free formats are PNG, GIF, and JPEG."
    )


def inspect_images(
    paths: list[Path],
    expected_width: int | None = None,
    low_resolution_width: int = 600,
) -> dict[str, Any]:
    if not paths:
        raise DesignJobError("At least one image path is required.")
    images: list[dict[str, Any]] = []
    for path in paths:
        if not path.is_file():
            raise DesignJobError(f"Image does not exist: {path}")
        width, height, image_format = image_dimensions(path)
        issues: list[str] = []
        if width < low_resolution_width:
            issues.append("low-resolution")
        if expected_width is not None and abs(width - expected_width) > 1:
            issues.append("expected-width-mismatch")
        images.append(
            {
                "path": str(path),
                "filename": path.name,
                "format": image_format,
                "pixel_width": width,
                "pixel_height": height,
                "aspect_ratio": round(width / height, 6) if height else None,
                "file_size": path.stat().st_size,
                "sha256": sha256_file(path),
                "viewport": {"status": "estimated", "width": None, "height": None},
                "quality_issues": issues,
            }
        )
    widths = [item["pixel_width"] for item in images]
    width_mismatch = len(widths) > 1 and max(widths) - min(widths) > 1
    return {
        "images": images,
        "comparability": {
            "width_mismatch": width_mismatch,
            "comparable_geometry": not width_mismatch,
            "note": (
                "Pixel dimensions do not prove CSS viewport dimensions; record viewport and zoom separately."
            ),
        },
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Inspect reference image metadata and comparability.")
    parser.add_argument("images", nargs="+", type=Path)
    parser.add_argument("--expected-width", type=int)
    parser.add_argument("--low-resolution-width", type=int, default=600)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--force", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.output and args.output.resolve() in {path.resolve() for path in args.images}:
        print("error: output must not overwrite an input image.", file=sys.stderr)
        return 2
    if args.output and args.output.exists() and not args.force:
        print(f"error: output already exists: {args.output}", file=sys.stderr)
        return 2
    try:
        result = inspect_images(
            args.images,
            expected_width=args.expected_width,
            low_resolution_width=args.low_resolution_width,
        )
    except (DesignJobError, OSError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    rendered = json.dumps(result, indent=2) + "\n"
    if args.output:
        atomic_write_text(args.output, rendered)
    print(rendered, end="")
    return 1 if result["comparability"]["width_mismatch"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
