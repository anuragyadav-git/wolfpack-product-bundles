from __future__ import annotations

import json
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from common import load_data, write_data  # noqa: E402
from init_design_job import create_design_job  # noqa: E402
from package_handoff import package_handoff  # noqa: E402
from test_validate_handoff import complete_manifest  # noqa: E402


class PackageHandoffTests(unittest.TestCase):
    def test_deterministic_archive_checksums_and_exclusions(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            repo = Path(temporary)
            job = create_design_job(
                title="Package",
                repository=repo,
                job_id="package",
            )
            manifest_path = complete_manifest(job)
            manifest = load_data(manifest_path)
            manifest["job"]["updated_at"] = "2026-08-03T00:00:00Z"
            write_data(manifest_path, manifest)
            (job / "access-token.txt").write_text("secret", encoding="utf-8")
            first = repo / "first.zip"
            second = repo / "second.zip"
            package_handoff(job, first)
            package_handoff(job, second)
            self.assertEqual(first.read_bytes(), second.read_bytes())
            with zipfile.ZipFile(first) as archive:
                names = archive.namelist()
                self.assertIn("MANIFEST.json", names)
                self.assertNotIn("access-token.txt", names)
                package_manifest = json.loads(archive.read("MANIFEST.json"))
                self.assertTrue(package_manifest["files"])
                self.assertTrue(all(len(item["sha256"]) == 64 for item in package_manifest["files"]))
            with self.assertRaises(Exception):
                package_handoff(job, first)


if __name__ == "__main__":
    unittest.main()
