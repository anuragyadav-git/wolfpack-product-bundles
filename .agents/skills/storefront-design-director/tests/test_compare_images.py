from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

import compare_images  # noqa: E402


def write_ppm(path: Path, width: int, height: int, pixels: list[tuple[int, int, int]]) -> None:
    body = bytes(channel for pixel in pixels for channel in pixel)
    path.write_bytes(f"P6\n{width} {height}\n255\n".encode("ascii") + body)


class CompareImagesTests(unittest.TestCase):
    def test_equal_and_changed_images(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            baseline = root / "baseline.ppm"
            same = root / "same.ppm"
            changed = root / "changed.ppm"
            pixels = [(255, 255, 255)] * 4
            write_ppm(baseline, 2, 2, pixels)
            write_ppm(same, 2, 2, pixels)
            write_ppm(changed, 2, 2, [(0, 0, 0)] + pixels[1:])
            equal = compare_images.compare_images(baseline, same, mismatch_threshold=0.0)
            different = compare_images.compare_images(
                baseline,
                changed,
                mismatch_threshold=0.0,
                output_diff=root / "diff.ppm",
            )
            self.assertEqual("passed", equal["status"])
            self.assertEqual("failed", different["status"])
            self.assertEqual(0.25, different["mismatch_ratio"])
            self.assertEqual({"x": 0, "y": 0, "width": 1, "height": 1}, different["difference_bounds"])

    def test_dimension_mismatch_fails(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            one = root / "one.ppm"
            two = root / "two.ppm"
            write_ppm(one, 1, 1, [(0, 0, 0)])
            write_ppm(two, 2, 1, [(0, 0, 0), (0, 0, 0)])
            result = compare_images.compare_images(one, two)
            self.assertEqual("failed", result["status"])
            self.assertEqual("dimension-mismatch", result["reason"])

    def test_missing_dependency_blocks_unsupported_format(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            one = root / "one.png"
            two = root / "two.png"
            one.write_bytes(b"\x89PNG\r\n\x1a\n" + b"x" * 32)
            two.write_bytes(b"\x89PNG\r\n\x1a\n" + b"y" * 32)
            with mock.patch.object(compare_images, "PILImage", None):
                result = compare_images.compare_images(one, two)
            self.assertEqual("blocked", result["status"])
            self.assertIn("Pillow", result["recovery_action"])

    def test_mask_must_stay_inside_approved_regions(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            baseline = root / "baseline.ppm"
            actual = root / "actual.ppm"
            approved_mask = root / "approved-mask.ppm"
            escaping_mask = root / "escaping-mask.ppm"
            white = [(255, 255, 255)] * 4
            write_ppm(baseline, 2, 2, white)
            write_ppm(actual, 2, 2, [(0, 0, 0)] + white[1:])
            write_ppm(approved_mask, 2, 2, [(255, 255, 255)] + [(0, 0, 0)] * 3)
            write_ppm(
                escaping_mask,
                2,
                2,
                [(255, 255, 255), (255, 255, 255), (0, 0, 0), (0, 0, 0)],
            )
            approved_region = [{"x": 0, "y": 0, "width": 1, "height": 1}]
            allowed = compare_images.compare_images(
                baseline,
                actual,
                mask=approved_mask,
                approved_mask_regions=approved_region,
                mismatch_threshold=0.0,
            )
            blocked = compare_images.compare_images(
                baseline,
                actual,
                mask=escaping_mask,
                approved_mask_regions=approved_region,
                mismatch_threshold=0.0,
            )
            self.assertEqual("passed", allowed["status"])
            self.assertEqual("blocked", blocked["status"])
            self.assertEqual("mask-outside-approved-region", blocked["reason"])


if __name__ == "__main__":
    unittest.main()
