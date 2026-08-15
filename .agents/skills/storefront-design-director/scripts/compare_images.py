from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any

from common import DesignJobError, atomic_write_text


try:
    from PIL import Image as PILImage  # type: ignore
except ModuleNotFoundError:
    PILImage = None


def read_ppm(path: Path) -> tuple[int, int, list[tuple[int, int, int]]]:
    data = path.read_bytes()
    if not data.startswith(b"P6"):
        raise DesignJobError("Not a binary PPM image.")
    cursor = 2
    tokens: list[bytes] = []
    while len(tokens) < 3:
        while cursor < len(data) and chr(data[cursor]).isspace():
            cursor += 1
        if cursor < len(data) and data[cursor] == ord("#"):
            while cursor < len(data) and data[cursor] not in b"\r\n":
                cursor += 1
            continue
        start = cursor
        while cursor < len(data) and not chr(data[cursor]).isspace():
            cursor += 1
        tokens.append(data[start:cursor])
    width, height, maximum = map(int, tokens)
    if maximum != 255:
        raise DesignJobError("PPM fallback supports max channel value 255 only.")
    if cursor >= len(data) or not chr(data[cursor]).isspace():
        raise DesignJobError("PPM header is incomplete.")
    first_separator = data[cursor]
    cursor += 1
    if first_separator == 13 and cursor < len(data) and data[cursor] == 10:
        cursor += 1
    expected = width * height * 3
    body = data[cursor : cursor + expected]
    if len(body) != expected:
        raise DesignJobError("PPM pixel data is incomplete.")
    pixels = [tuple(body[index : index + 3]) for index in range(0, len(body), 3)]
    return width, height, pixels  # type: ignore[return-value]


def write_ppm(path: Path, width: int, height: int, pixels: list[tuple[int, int, int]]) -> None:
    body = bytes(channel for pixel in pixels for channel in pixel)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    try:
        temporary.write_bytes(f"P6\n{width} {height}\n255\n".encode("ascii") + body)
        os.replace(temporary, path)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise


def load_pixels(path: Path) -> tuple[int, int, list[tuple[int, int, int, int]], str]:
    if path.suffix.lower() == ".ppm":
        width, height, rgb = read_ppm(path)
        return width, height, [(r, g, b, 255) for r, g, b in rgb], "ppm-fallback"
    if PILImage is None:
        raise DesignJobError(
            "Pillow is required for pixel comparison of this image format. "
            "Install Pillow in the skill execution environment or provide binary PPM inputs."
        )
    with PILImage.open(path) as image:
        rgba = image.convert("RGBA")
        return rgba.width, rgba.height, list(rgba.getdata()), "pillow"


def dimensions_only(path: Path) -> tuple[int, int] | None:
    try:
        if path.suffix.lower() == ".ppm":
            width, height, _ = read_ppm(path)
            return width, height
        if PILImage is not None:
            with PILImage.open(path) as image:
                return image.width, image.height
    except Exception:
        return None
    return None


def compare_images(
    baseline: Path,
    actual: Path,
    mask: Path | None = None,
    approved_mask_regions: list[dict[str, int]] | None = None,
    output_diff: Path | None = None,
    mismatch_threshold: float = 0.01,
    pixel_tolerance: int = 8,
) -> dict[str, Any]:
    base_result: dict[str, Any] = {
        "baseline": str(baseline),
        "actual": str(actual),
        "mask": str(mask) if mask else None,
        "approved_mask_regions": approved_mask_regions or [],
        "threshold": mismatch_threshold,
        "pixel_tolerance": pixel_tolerance,
    }
    if not 0 <= mismatch_threshold <= 1:
        return {**base_result, "status": "blocked", "reason": "invalid-threshold", "recovery_action": "Use a threshold from 0 to 1."}
    if not 0 <= pixel_tolerance <= 255:
        return {**base_result, "status": "blocked", "reason": "invalid-pixel-tolerance", "recovery_action": "Use a pixel tolerance from 0 to 255."}
    if not baseline.is_file() or not actual.is_file():
        return {**base_result, "status": "blocked", "reason": "missing-input", "recovery_action": "Provide readable baseline and actual image paths."}
    try:
        base_width, base_height, base_pixels, engine = load_pixels(baseline)
        actual_width, actual_height, actual_pixels, actual_engine = load_pixels(actual)
    except (DesignJobError, OSError) as error:
        dimensions = {"baseline": dimensions_only(baseline), "actual": dimensions_only(actual)}
        return {
            **base_result,
            "status": "blocked",
            "reason": "comparison-unavailable",
            "dimensions": dimensions,
            "recovery_action": str(error),
        }
    if (base_width, base_height) != (actual_width, actual_height):
        return {
            **base_result,
            "status": "failed",
            "reason": "dimension-mismatch",
            "baseline_dimensions": {"width": base_width, "height": base_height},
            "actual_dimensions": {"width": actual_width, "height": actual_height},
            "mismatch_ratio": 1.0,
            "difference_bounds": None,
        }

    ignored = [False] * len(base_pixels)
    if mask:
        if not approved_mask_regions:
            return {
                **base_result,
                "status": "blocked",
                "reason": "mask-not-approved",
                "recovery_action": "Provide at least one approved mask rectangle.",
            }
        try:
            mask_width, mask_height, mask_pixels, _ = load_pixels(mask)
        except (DesignJobError, OSError) as error:
            return {**base_result, "status": "blocked", "reason": "mask-unavailable", "recovery_action": str(error)}
        if (mask_width, mask_height) != (base_width, base_height):
            return {**base_result, "status": "failed", "reason": "mask-dimension-mismatch", "mismatch_ratio": 1.0, "difference_bounds": None}
        ignored = [max(pixel[:3]) > 0 for pixel in mask_pixels]
        valid_regions: list[dict[str, int]] = []
        for region in approved_mask_regions:
            if not isinstance(region, dict) or any(
                not isinstance(region.get(key), int)
                for key in ("x", "y", "width", "height")
            ):
                return {**base_result, "status": "blocked", "reason": "invalid-approved-mask-region"}
            if (
                region["x"] < 0
                or region["y"] < 0
                or region["width"] <= 0
                or region["height"] <= 0
                or region["x"] + region["width"] > base_width
                or region["y"] + region["height"] > base_height
            ):
                return {**base_result, "status": "blocked", "reason": "invalid-approved-mask-region"}
            valid_regions.append(region)
        outside = []
        for index, is_ignored in enumerate(ignored):
            if not is_ignored:
                continue
            x = index % base_width
            y = index // base_width
            if not any(
                region["x"] <= x < region["x"] + region["width"]
                and region["y"] <= y < region["y"] + region["height"]
                for region in valid_regions
            ):
                outside.append({"x": x, "y": y})
        if outside:
            return {
                **base_result,
                "status": "blocked",
                "reason": "mask-outside-approved-region",
                "outside_pixel_count": len(outside),
                "first_outside_pixel": outside[0],
                "recovery_action": "Restrict the mask to its approved rectangle.",
            }

    changed_indexes: list[int] = []
    diff_pixels: list[tuple[int, int, int, int]] = []
    compared = 0
    for index, (left, right) in enumerate(zip(base_pixels, actual_pixels)):
        if ignored[index]:
            diff_pixels.append((0, 0, 0, 0))
            continue
        compared += 1
        changed = max(abs(left[channel] - right[channel]) for channel in range(4)) > pixel_tolerance
        if changed:
            changed_indexes.append(index)
            diff_pixels.append((255, 0, 0, 255))
        else:
            diff_pixels.append((0, 0, 0, 0))
    if compared == 0:
        return {**base_result, "status": "blocked", "reason": "fully-masked", "recovery_action": "Use a mask that leaves at least one comparable pixel."}
    ratio = len(changed_indexes) / compared
    bounds = None
    if changed_indexes:
        xs = [index % base_width for index in changed_indexes]
        ys = [index // base_width for index in changed_indexes]
        bounds = {
            "x": min(xs),
            "y": min(ys),
            "width": max(xs) - min(xs) + 1,
            "height": max(ys) - min(ys) + 1,
        }
    if output_diff:
        if output_diff.suffix.lower() == ".ppm":
            write_ppm(output_diff, base_width, base_height, [(r, g, b) for r, g, b, _ in diff_pixels])
        elif PILImage is not None:
            image = PILImage.new("RGBA", (base_width, base_height))
            image.putdata(diff_pixels)
            output_diff.parent.mkdir(parents=True, exist_ok=True)
            temporary = output_diff.with_name(
                f".{output_diff.stem}.{os.getpid()}.tmp{output_diff.suffix}"
            )
            try:
                image.save(temporary)
                os.replace(temporary, output_diff)
            except Exception:
                temporary.unlink(missing_ok=True)
                raise
        else:
            return {**base_result, "status": "blocked", "reason": "diff-output-unavailable", "recovery_action": "Use a .ppm diff path or install Pillow."}
    return {
        **base_result,
        "status": "passed" if ratio <= mismatch_threshold else "failed",
        "reason": "within-threshold" if ratio <= mismatch_threshold else "threshold-exceeded",
        "engine": engine if engine == actual_engine else f"{engine}+{actual_engine}",
        "dimensions": {"width": base_width, "height": base_height},
        "compared_pixels": compared,
        "changed_pixels": len(changed_indexes),
        "mismatch_ratio": round(ratio, 8),
        "difference_bounds": bounds,
        "diff_path": str(output_diff) if output_diff else None,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Compare two deterministic UI screenshots.")
    parser.add_argument("baseline", type=Path)
    parser.add_argument("actual", type=Path)
    parser.add_argument("--mask", type=Path)
    parser.add_argument(
        "--approved-mask-region",
        action="append",
        default=[],
        metavar="X,Y,WIDTH,HEIGHT",
        help="Approved rectangle for non-zero mask pixels; repeat for multiple regions.",
    )
    parser.add_argument("--output-diff", type=Path)
    parser.add_argument("--summary", type=Path)
    parser.add_argument("--threshold", type=float, default=0.01)
    parser.add_argument("--pixel-tolerance", type=int, default=8)
    parser.add_argument("--force", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    summary = args.summary or args.actual.with_suffix(args.actual.suffix + ".comparison.json")
    outputs = [path for path in (args.output_diff, summary) if path is not None]
    inputs = {args.baseline.resolve(), args.actual.resolve()}
    if any(path.resolve() in inputs for path in outputs):
        print("error: output paths must not overwrite input images.")
        return 2
    existing = [str(path) for path in outputs if path.exists()]
    if existing and not args.force:
        print(f"error: output already exists: {', '.join(existing)}")
        return 2
    approved_regions: list[dict[str, int]] = []
    try:
        for value in args.approved_mask_region:
            x, y, width, height = (int(part.strip()) for part in value.split(","))
            approved_regions.append({"x": x, "y": y, "width": width, "height": height})
    except (TypeError, ValueError):
        print("error: --approved-mask-region must be X,Y,WIDTH,HEIGHT")
        return 2
    result = compare_images(
        args.baseline,
        args.actual,
        mask=args.mask,
        approved_mask_regions=approved_regions,
        output_diff=args.output_diff,
        mismatch_threshold=args.threshold,
        pixel_tolerance=args.pixel_tolerance,
    )
    atomic_write_text(summary, json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))
    return 0 if result["status"] == "passed" else 1 if result["status"] == "failed" else 2


if __name__ == "__main__":
    raise SystemExit(main())
