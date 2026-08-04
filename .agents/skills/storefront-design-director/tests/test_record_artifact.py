from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from common import DesignJobError, load_data  # noqa: E402
from init_design_job import create_design_job  # noqa: E402
from record_artifact import record_artifact  # noqa: E402
from validate_design_job import validate_design_job  # noqa: E402


class RecordArtifactTests(unittest.TestCase):
    def test_approved_artifact_is_immutable_and_superseded_in_new_revision(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            repository = Path(temporary)
            job = create_design_job(
                title="Immutable",
                repository=repository,
                job_id="immutable",
            )
            manifest_path = job / "design-job.yaml"
            artifact = job / "component-brief.md"
            artifact.write_text(
                artifact.read_text(encoding="utf-8") + "\nVerified scope.\n",
                encoding="utf-8",
            )
            record_artifact(
                manifest_path,
                "component-brief.md",
                "approved",
                approver="Design owner",
                evidence=["component-brief.md"],
                now="2026-08-03T00:00:00Z",
            )
            artifact.write_text(
                artifact.read_text(encoding="utf-8") + "\nChanged after approval.\n",
                encoding="utf-8",
            )
            report = validate_design_job(manifest_path)
            self.assertTrue(
                any(item["code"] == "approved-artifact-mutated" for item in report["blocking"])
            )
            with self.assertRaises(DesignJobError):
                record_artifact(manifest_path, "component-brief.md", "complete")
            record_artifact(
                manifest_path,
                "component-brief.md",
                "complete",
                supersede_approved=True,
                reason="Approved scope changed",
                now="2026-08-03T01:00:00Z",
            )
            manifest = load_data(manifest_path)
            self.assertEqual(2, manifest["job"]["revision"])
            self.assertEqual(1, len(manifest["artifacts"]["superseded"]))
            self.assertEqual(
                ["component-brief.md"],
                manifest["history"][-1]["affected_artifacts"],
            )


if __name__ == "__main__":
    unittest.main()
