from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from common import DesignJobError, load_data, write_data  # noqa: E402
from init_design_job import create_design_job  # noqa: E402
from update_job_stage import update_stage  # noqa: E402


class UpdateJobStageTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp.name)
        self.job = create_design_job(
            title="Transitions",
            repository=self.repo,
            job_id="transitions",
        )
        self.manifest_path = self.job / "design-job.yaml"

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_valid_forward_transition_appends_history(self) -> None:
        result = update_stage(self.manifest_path, "SCOPE", reason="Discovery complete")
        self.assertEqual("SCOPE", result["job"]["stage"])
        self.assertEqual(2, len(result["history"]))

    def test_invalid_transition_does_not_modify_manifest(self) -> None:
        before = self.manifest_path.read_text()
        with self.assertRaises(DesignJobError):
            update_stage(self.manifest_path, "STATE_CONTRACT", reason="Skip ahead")
        self.assertEqual(before, self.manifest_path.read_text())

    def test_pause_and_resume(self) -> None:
        paused = update_stage(self.manifest_path, "PAUSED", reason="User paused")
        self.assertEqual("DISCOVERY", paused["job"]["resume_stage"])
        resumed = update_stage(self.manifest_path, "DISCOVERY", reason="User resumed")
        self.assertEqual("DISCOVERY", resumed["job"]["stage"])

    def test_backward_transition_increments_revision(self) -> None:
        manifest = load_data(self.manifest_path)
        manifest["job"]["stage"] = "RESPONSIVE_CONTRACT"
        manifest["job"]["revision"] = 1
        write_data(self.manifest_path, manifest)
        result = update_stage(
            self.manifest_path,
            "STATE_CONTRACT",
            reason="Approved direction changed",
            decision_change=True,
            affected_artifacts=["state-matrix.md"],
        )
        self.assertEqual(2, result["job"]["revision"])

    def test_gate_requires_approval_and_evidence(self) -> None:
        manifest = load_data(self.manifest_path)
        manifest["job"]["stage"] = "DIRECTION_APPROVAL"
        write_data(self.manifest_path, manifest)
        with self.assertRaises(DesignJobError):
            update_stage(self.manifest_path, "COMPONENT_ANATOMY", reason="Continue")
        manifest = load_data(self.manifest_path)
        manifest["approvals"]["design"]["status"] = "approved"
        write_data(self.manifest_path, manifest)
        result = update_stage(
            self.manifest_path,
            "COMPONENT_ANATOMY",
            reason="Direction approved",
            evidence=["locked-decisions.yaml"],
        )
        self.assertEqual("COMPONENT_ANATOMY", result["job"]["stage"])

    def test_decision_change_requires_affected_artifact(self) -> None:
        manifest = load_data(self.manifest_path)
        manifest["job"]["stage"] = "RESPONSIVE_CONTRACT"
        write_data(self.manifest_path, manifest)
        with self.assertRaises(DesignJobError):
            update_stage(
                self.manifest_path,
                "STATE_CONTRACT",
                reason="Changed behavior",
                decision_change=True,
            )

    def test_special_to_special_transition_is_rejected(self) -> None:
        update_stage(self.manifest_path, "PAUSED", reason="Pause")
        with self.assertRaises(DesignJobError):
            update_stage(self.manifest_path, "BLOCKED", reason="Switch")

    def test_archive_sets_terminal_status(self) -> None:
        manifest = load_data(self.manifest_path)
        manifest["job"]["stage"] = "FINAL_APPROVAL"
        manifest["approvals"]["final"]["status"] = "approved"
        manifest["approvals"]["final"]["approver"] = "reviewer"
        manifest["approvals"]["final"]["at"] = "2026-08-04T00:00:00Z"
        manifest["approvals"]["final"]["revision"] = 1
        manifest["handoff"]["package_path"] = "handoff.zip"
        manifest["qa"]["baseline_status"] = "approved"
        manifest["qa"]["baseline_paths"] = ["qa/baselines/final.png"]
        manifest["qa"]["summary_path"] = "qa/browser-artifact-summary.json"
        (self.job / "handoff.zip").write_bytes(b"package")
        (self.job / "qa/baselines").mkdir(parents=True, exist_ok=True)
        (self.job / "qa/baselines/final.png").write_bytes(b"baseline")
        (self.job / "qa/browser-artifact-summary.json").write_text(
            '{"overall_status":"approved"}', encoding="utf-8"
        )
        write_data(self.manifest_path, manifest)
        result = update_stage(
            self.manifest_path,
            "ARCHIVED",
            reason="Final approval recorded",
            evidence=["approval-record.yaml", "qa/browser-artifact-summary.json"],
        )
        self.assertEqual("archived", result["job"]["status"])

    def test_final_approval_requires_reconciled_summary_and_all_qa_gates(self) -> None:
        manifest = load_data(self.manifest_path)
        manifest["job"]["stage"] = "VISUAL_REMEDIATION"
        for field in [
            "execution_status",
            "console_status",
            "network_status",
            "accessibility_status",
            "performance_status",
            "visual_diff_status",
            "non_regression_status",
        ]:
            manifest["qa"][field] = "passed"
        manifest["qa"]["baseline_status"] = "approved"
        manifest["qa"]["lighthouse_status"] = "passed"
        manifest["qa"]["summary_path"] = "qa/browser-artifact-summary.json"
        (self.job / "qa").mkdir(exist_ok=True)
        (self.job / "qa/browser-artifact-summary.json").write_text(
            '{"overall_status":"failed"}', encoding="utf-8"
        )
        write_data(self.manifest_path, manifest)
        with self.assertRaises(DesignJobError):
            update_stage(
                self.manifest_path,
                "FINAL_APPROVAL",
                reason="Approve despite a regression",
                evidence=["qa/browser-artifact-summary.json"],
            )

    def test_archive_requires_package_and_baseline_files(self) -> None:
        manifest = load_data(self.manifest_path)
        manifest["job"]["stage"] = "FINAL_APPROVAL"
        manifest["approvals"]["final"] = {
            "status": "approved",
            "approver": "reviewer",
            "at": "2026-08-04T00:00:00Z",
            "revision": 1,
        }
        manifest["qa"]["baseline_status"] = "approved"
        manifest["qa"]["baseline_paths"] = []
        manifest["qa"]["summary_path"] = "qa/browser-artifact-summary.json"
        (self.job / "qa").mkdir(exist_ok=True)
        (self.job / "qa/browser-artifact-summary.json").write_text(
            '{"overall_status":"approved"}', encoding="utf-8"
        )
        write_data(self.manifest_path, manifest)
        with self.assertRaises(DesignJobError):
            update_stage(
                self.manifest_path,
                "ARCHIVED",
                reason="Archive incomplete job",
                evidence=["qa/browser-artifact-summary.json"],
            )


if __name__ == "__main__":
    unittest.main()
