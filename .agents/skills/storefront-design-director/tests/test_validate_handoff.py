from __future__ import annotations

import re
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from common import load_data, write_data  # noqa: E402
from init_design_job import create_design_job  # noqa: E402
from record_artifact import record_artifact  # noqa: E402
from validate_handoff import HANDOFF_TERMS, REQUIRED_ARTIFACTS  # noqa: E402
from validate_handoff import validate_handoff  # noqa: E402


def complete_manifest(job: Path) -> Path:
    path = job / "design-job.yaml"
    handoff_path = job / "implementation-handoff.md"
    handoff_text = handoff_path.read_text(encoding="utf-8")
    for heading in HANDOFF_TERMS:
        pattern = re.compile(rf"(?im)^(##\s+{re.escape(heading)}\s*)$")
        handoff_text, replacements = pattern.subn(
            lambda match: (
                f"{match.group(1)}\n\n"
                f"Verified implementation detail for {heading}."
            ),
            handoff_text,
            count=1,
        )
        if replacements != 1:
            raise AssertionError(f"Missing handoff heading: {heading}")
    handoff_path.write_text(handoff_text, encoding="utf-8")

    state_path = job / "state-matrix.md"
    state_text = state_path.read_text(encoding="utf-8").replace(
        "|---|---|---|---|---|---|---|---|---|---|---|",
        "|---|---|---|---|---|---|---|---|---|---|---|\n"
        "| default | Load | Valid product | Card visible | Select | Named control | Required | Required | qa/default.png | state-default | Approved |",
        1,
    )
    state_text = state_text.replace("- Required:", "- Required: default")
    state_text = state_text.replace("- Covered:", "- Covered: default")
    state_text = state_text.replace("- Status:", "- Status: complete")
    state_path.write_text(state_text, encoding="utf-8")

    responsive_path = job / "responsive-contract.md"
    responsive_text = responsive_path.read_text(encoding="utf-8")
    responsive_text = responsive_text.replace(
        "|---|---|---|---|---|---|",
        "|---|---|---|---|---|---|\n"
        "| desktop | 1280 | 800 | intrinsic | Desktop proof | default |\n"
        "| mobile | 390 | 844 | intrinsic | Mobile proof | default |",
        1,
    )
    responsive_text = responsive_text.replace(
        "|---|---|---|---|---|---|---|---|---|---|---|---|",
        "|---|---|---|---|---|---|---|---|---|---|---|---|\n"
        "| card | all | intrinsic | grid | source | visible | none | none | wrap | content-driven | safe | no overflow |",
        1,
    )
    responsive_path.write_text(responsive_text, encoding="utf-8")

    accessibility_path = job / "accessibility-checklist.md"
    accessibility_text = accessibility_path.read_text(encoding="utf-8").replace(
        "- [ ] Correct semantics and accessible names.",
        "- [x] Correct semantics and accessible names.",
    )
    accessibility_path.write_text(accessibility_text, encoding="utf-8")

    stress_path = job / "content-stress-cases.yaml"
    stress = load_data(stress_path)
    stress["cases"][0]["required_in_browser_qa"] = True
    write_data(stress_path, stress)

    approval_path = job / "approval-record.yaml"
    approval_record = load_data(approval_path)
    approval_record["design"]["status"] = "approved"
    approval_record["handoff"]["status"] = "approved"
    write_data(approval_path, approval_record)

    browser_path = job / "browser-test-plan.yaml"
    browser_plan = {
        "schema_version": 1,
        "job_id": "handoff",
        "revision": 1,
        "status": "complete",
        "chrome_mcp_required": True,
        "environment": "local",
        "base_url": "http://127.0.0.1:8765",
        "fixture": "/index.html",
        "authentication_mode": "none",
        "setup": {
            "profile_policy": "default-profile-only",
            "allow_isolated_context": False,
            "zoom_percent": 100,
            "artifact_directory": "qa",
            "max_retries": 2,
            "waits": ["document.fonts.ready", "images-complete"],
        },
        "viewports": [
            {"id": "desktop", "mode": "desktop", "width": 1280, "height": 800},
            {"id": "mobile", "mode": "mobile", "width": 390, "height": 844},
        ],
        "states": [{"id": "default", "purpose": "Initial state."}],
        "interactions": [],
        "assertions": {"library": "references/chrome-devtools-test-protocol.md"},
        "screenshots": {"format": "png", "index_path": "qa/screenshot-index.json"},
        "console_policy": {"fail_on": ["uncaught-exception"], "allowlist": []},
        "network_policy": {"fail_on": ["unexpected-4xx-5xx"], "expected_analytics": []},
        "lighthouse": {
            "required": True,
            "devices": ["desktop", "mobile"],
            "report_paths": {"desktop": "qa/lighthouse/desktop.json", "mobile": "qa/lighthouse/mobile.json"},
        },
        "performance": {
            "required": False,
            "triggers": [],
            "not_applicable_reason": "No loading or interaction path changes.",
        },
        "visual_diff": {"format": "png", "comparison": "scripts/compare_images.py", "allowed_masks": []},
        "non_regression": {"required": True, "cases": []},
        "cleanup": ["Restore scroll position."],
    }
    case_base = {
        "purpose": "Verify the default fixture.",
        "precondition": "Fixture is stable.",
        "state": "default",
        "steps": ["Capture a fresh snapshot."],
        "expected_semantic_result": "The fixture remains operable.",
        "dom_assertions": [{"id": "control", "method": "accessibleElements"}],
        "style_geometry_assertions": [{"id": "box", "method": "boundingBox"}],
        "allowed_masks": [],
        "console_expectations": {"violations": 0},
        "network_expectations": {"unexpected_failures": 0},
        "cleanup": ["Restore scroll position."],
        "status": "not-run",
        "evidence_links": [],
    }
    browser_plan["interactions"] = [
        {
            **case_base,
            "id": "desktop-default",
            "viewport": "desktop",
            "screenshot_path": "qa/screenshots/desktop-default.png",
            "baseline_path": "qa/baselines/desktop-default.png",
        },
        {
            **case_base,
            "id": "mobile-default",
            "viewport": "mobile",
            "screenshot_path": "qa/screenshots/mobile-default.png",
            "baseline_path": "qa/baselines/mobile-default.png",
        },
    ]
    browser_plan["non_regression"]["cases"] = ["desktop-default", "mobile-default"]
    write_data(browser_path, browser_plan)

    for relative in REQUIRED_ARTIFACTS:
        record_artifact(path, relative, "complete")

    manifest = load_data(path)
    manifest["references"]["approved"] = [{"path": "component-brief.md", "revision": 1}]
    manifest["decisions"]["open"] = []
    manifest["states"]["required"] = ["default"]
    manifest["states"]["coverage_status"] = "complete"
    manifest["responsive"]["breakpoints"] = ["desktop", "mobile"]
    manifest["responsive"]["transformations"] = ["card"]
    manifest["responsive"]["contract_status"] = "complete"
    manifest["accessibility"]["requirements"] = ["named-controls"]
    manifest["accessibility"]["validation_status"] = "complete"
    manifest["approvals"]["design"]["status"] = "approved"
    manifest["handoff"]["status"] = "approved"
    manifest["approvals"]["handoff"]["status"] = "approved"
    write_data(path, manifest)
    return path


class ValidateHandoffTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp.name)
        self.job = create_design_job(
            title="Handoff",
            repository=self.repo,
            job_id="handoff",
        )

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_complete_handoff_passes(self) -> None:
        report = validate_handoff(complete_manifest(self.job))
        self.assertTrue(report["valid"], report)

    def test_open_decision_blocks_handoff(self) -> None:
        path = complete_manifest(self.job)
        manifest = load_data(path)
        manifest["decisions"]["open"] = [{"id": "copy", "question": "CTA copy"}]
        write_data(path, manifest)
        report = validate_handoff(path)
        self.assertFalse(report["valid"])
        self.assertTrue(any(issue["code"] == "open-decisions" for issue in report["blocking"]))

    def test_untouched_draft_templates_block_handoff(self) -> None:
        path = self.job / "design-job.yaml"
        manifest = load_data(path)
        manifest["references"]["approved"] = [{"path": "component-brief.md"}]
        manifest["states"]["coverage_status"] = "complete"
        manifest["responsive"]["contract_status"] = "complete"
        manifest["accessibility"]["validation_status"] = "complete"
        manifest["approvals"]["design"]["status"] = "approved"
        manifest["handoff"]["status"] = "approved"
        manifest["approvals"]["handoff"]["status"] = "approved"
        write_data(path, manifest)
        report = validate_handoff(path)
        self.assertTrue(any(issue["code"] == "artifact-status" for issue in report["blocking"]))

    def test_isolated_context_browser_plan_blocks_handoff(self) -> None:
        path = complete_manifest(self.job)
        browser_path = self.job / "browser-test-plan.yaml"
        browser_plan = load_data(browser_path)
        browser_plan["setup"]["allow_isolated_context"] = True
        write_data(browser_path, browser_plan)
        record_artifact(path, "browser-test-plan.yaml", "complete")
        report = validate_handoff(path)
        self.assertTrue(
            any(issue["code"] == "browser-profile-policy" for issue in report["blocking"])
        )

    def test_empty_non_regression_plan_blocks_handoff(self) -> None:
        plan = load_data(self.job / "browser-test-plan.yaml")
        plan["job_id"] = "handoff"
        plan["revision"] = 1
        plan["environment"] = "local"
        plan["base_url"] = "http://127.0.0.1:8765"
        plan["fixture"] = "/index.html"
        plan["authentication_mode"] = "none"
        plan["setup"]["max_retries"] = 1
        plan["setup"]["waits"] = ["document.fonts.ready"]
        plan["performance"]["required"] = False
        plan["performance"]["not_applicable_reason"] = "No runtime path changes."
        plan["states"] = [{"id": "default", "purpose": "Default state."}]
        plan["interactions"] = []
        plan["non_regression"] = {"required": True, "cases": []}
        issues = __import__("validate_handoff").validate_browser_test_plan(plan)
        self.assertTrue(any(issue["code"] == "browser-non-regression" for issue in issues))

    def test_empty_semantic_contracts_block_handoff(self) -> None:
        path = complete_manifest(self.job)
        state_path = self.job / "state-matrix.md"
        state_text = state_path.read_text(encoding="utf-8")
        state_text = re.sub(
            r"(?m)^\| default \|.*$",
            "",
            state_text,
        )
        state_path.write_text(state_text, encoding="utf-8")
        record_artifact(path, "state-matrix.md", "complete")
        report = validate_handoff(path)
        self.assertTrue(
            any(issue["code"] == "state-contract-content" for issue in report["blocking"])
        )

    def test_no_required_content_stress_case_blocks_handoff(self) -> None:
        path = complete_manifest(self.job)
        stress_path = self.job / "content-stress-cases.yaml"
        stress = load_data(stress_path)
        for case in stress["cases"]:
            case["required_in_browser_qa"] = False
        write_data(stress_path, stress)
        record_artifact(path, "content-stress-cases.yaml", "complete")
        report = validate_handoff(path)
        self.assertTrue(
            any(issue["code"] == "content-stress-coverage" for issue in report["blocking"])
        )


if __name__ == "__main__":
    unittest.main()
