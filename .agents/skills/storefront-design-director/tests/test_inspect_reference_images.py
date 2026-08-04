from __future__ import annotations

import struct
import sys
import tempfile
import unittest
import zlib
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from inspect_reference_images import inspect_images  # noqa: E402


def write_png(path: Path, width: int, height: int) -> None:
    def chunk(kind: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + kind
            + data
            + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
        )

    raw = b"".join(b"\x00" + b"\x00\x00\x00" * width for _ in range(height))
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw))
        + chunk(b"IEND", b"")
    )


class InspectReferenceImagesTests(unittest.TestCase):
    def test_extracts_dimensions_hash_and_quality_flags(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            small = root / "small.png"
            wide = root / "wide.png"
            write_png(small, 320, 200)
            write_png(wide, 1440, 900)
            result = inspect_images([small, wide], expected_width=1440)
            self.assertEqual(320, result["images"][0]["pixel_width"])
            self.assertEqual(64, len(result["images"][0]["sha256"]))
            self.assertIn("low-resolution", result["images"][0]["quality_issues"])
            self.assertTrue(result["comparability"]["width_mismatch"])


if __name__ == "__main__":
    unittest.main()
