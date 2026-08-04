from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from common import load_data, write_data  # noqa: E402
from init_design_job import create_design_job  # noqa: E402
from validate_design_job import validate_design_job  # noqa: E402


class ValidateDesignJobTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp.name)
        self.job = create_design_job(
            title="Validation",
            repository=self.repo,
            job_id="validation",
        )

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_new_job_is_structurally_valid(self) -> None:
        report = validate_design_job(self.job / "design-job.yaml")
        self.assertTrue(report["valid"])
        self.assertEqual([], report["blocking"])

    def test_malformed_manifest_is_blocking(self) -> None:
        write_data(self.job / "design-job.yaml", {"schema_version": 99})
        report = validate_design_job(self.job / "design-job.yaml")
        self.assertFalse(report["valid"])
        self.assertTrue(any(item["code"] == "schema-version" for item in report["blocking"]))

    def test_missing_approved_reference_is_blocking(self) -> None:
        manifest_path = self.job / "design-job.yaml"
        manifest = load_data(manifest_path)
        manifest["references"]["approved"] = [{"path": "references/missing.png"}]
        write_data(manifest_path, manifest)
        report = validate_design_job(manifest_path)
        self.assertFalse(report["valid"])
        self.assertTrue(any(item["code"] == "missing-reference" for item in report["blocking"]))

    def test_advanced_stage_requires_cumulative_artifacts(self) -> None:
        manifest_path = self.job / "design-job.yaml"
        manifest = load_data(manifest_path)
        manifest["job"]["stage"] = "CHROME_QA_EXECUTION"
        manifest["history"][-1]["to"] = "CHROME_QA_EXECUTION"
        write_data(manifest_path, manifest)
        (self.job / "component-brief.md").unlink()
        report = validate_design_job(manifest_path)
        self.assertTrue(
            any(
                item["code"] == "missing-stage-artifact"
                and item["path"] == "component-brief.md"
                for item in report["blocking"]
            )
        )

    def test_default_profile_policy_is_mandatory(self) -> None:
        manifest_path = self.job / "design-job.yaml"
        manifest = load_data(manifest_path)
        manifest["qa"]["allow_isolated_context"] = True
        write_data(manifest_path, manifest)
        report = validate_design_job(manifest_path)
        self.assertTrue(
            any(item["code"] == "chrome-profile-policy" for item in report["blocking"])
        )


if __name__ == "__main__":
    unittest.main()
