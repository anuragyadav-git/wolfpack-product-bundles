from __future__ import annotations

import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from summarize_browser_artifacts import summarize_artifacts  # noqa: E402
from validate_handoff import validate_browser_test_plan  # noqa: E402


PASSING_GATES = {
    "functional": "passed",
    "visual": "passed",
    "geometry": "passed",
    "responsive": "passed",
    "console": "passed",
    "network": "passed",
    "accessibility": "passed",
    "performance": "not-applicable",
    "non_regression": "passed",
}

PREFLIGHT_CHECKS = [
    "chrome_mcp_connected",
    "supported_chrome_available",
    "intended_page_selected",
    "app_server_reachable",
    "environment_confirmed",
    "fixture_route_exists",
    "authentication_intentional",
    "sensitive_tabs_avoided",
    "viewport_resize_supported",
    "accessibility_snapshot_supported",
    "screenshot_write_supported",
    "console_inspection_supported",
    "network_inspection_supported",
    "repository_identity_recorded",
    "job_revision_recorded",
    "baseline_identified",
]


def valid_browser_plan() -> dict[str, object]:
    case_base = {
        "purpose": "Verify the deterministic default state.",
        "precondition": "Static fixture is loaded and stable.",
        "steps": ["Take a fresh snapshot.", "Capture evidence."],
        "expected_semantic_result": "The named control remains operable.",
        "dom_assertions": [{"id": "control-name", "method": "accessibleElements"}],
        "style_geometry_assertions": [{"id": "control-box", "method": "boundingBox"}],
        "screenshot_path": "qa/screenshots/case--after--viewport.png",
        "baseline_path": "qa/baselines/case--after--viewport.png",
        "allowed_masks": [],
        "console_expectations": {"violations": 0},
        "network_expectations": {"unexpected_failures": 0},
        "cleanup": ["Restore scroll position."],
        "status": "not-run",
        "evidence_links": [],
    }
    desktop = {
        **case_base,
        "id": "desktop-default",
        "viewport": "desktop",
        "state": "default",
    }
    mobile = {
        **copy.deepcopy(case_base),
        "id": "mobile-selected",
        "viewport": "mobile",
        "state": "selected",
        "screenshot_path": "qa/screenshots/mobile-selected--after--viewport.png",
        "baseline_path": "qa/baselines/mobile-selected--after--viewport.png",
    }
    return {
        "schema_version": 1,
        "job_id": "chrome-hardening",
        "revision": 1,
        "status": "draft",
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
            "waits": ["document.fonts.ready", "images-complete", "hydration-ready"],
        },
        "viewports": [
            {"id": "desktop", "mode": "desktop", "width": 1280, "height": 800},
            {"id": "mobile", "mode": "mobile", "width": 390, "height": 844},
        ],
        "states": [
            {"id": "default", "purpose": "Initial state."},
            {"id": "selected", "purpose": "Selected state."},
        ],
        "interactions": [desktop, mobile],
        "assertions": {"library": "references/chrome-devtools-test-protocol.md"},
        "screenshots": {
            "format": "png",
            "index_path": "qa/screenshot-index.json",
            "element_required": True,
            "viewport_required": True,
        },
        "console_policy": {"fail_on": ["uncaught-exception"], "allowlist": []},
        "network_policy": {"fail_on": ["unexpected-4xx-5xx"], "expected_analytics": []},
        "lighthouse": {
            "required": True,
            "devices": ["desktop", "mobile"],
            "report_paths": {
                "desktop": "qa/lighthouse/desktop.json",
                "mobile": "qa/lighthouse/mobile.json",
            },
        },
        "performance": {
            "required": False,
            "triggers": [],
            "not_applicable_reason": "The fixture changes no loading or rendering path.",
        },
        "visual_diff": {
            "format": "png",
            "comparison": "scripts/compare_images.py",
            "allowed_masks": [],
        },
        "non_regression": {"required": True, "cases": ["desktop-default", "mobile-selected"]},
        "cleanup": ["Remove injected capture styles.", "Restore scroll position."],
    }


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value), encoding="utf-8")


def write_preflight(qa: Path, failed_check: str | None = None) -> None:
    checks = {
        name: {
            "mandatory": True,
            "status": "blocked" if name == failed_check else "passed",
            "evidence": "Direct Chrome DevTools MCP verification.",
        }
        for name in PREFLIGHT_CHECKS
    }
    write_json(
        qa / "preflight.json",
        {
            "schema_version": 1,
            "job_id": "chrome-hardening",
            "revision": 1,
            "status": "blocked" if failed_check else "passed",
            "checked_at": "2026-08-03T00:00:00Z",
            "checks": checks,
            "tool_inventory": ["list_pages", "take_snapshot", "take_screenshot"],
            "browser": {
                "product": "Google Chrome",
                "version": "test",
                "profile_policy": "default-profile-only",
                "isolated_context_used": False,
            },
            "repository": {"branch": "test", "commit": "abcdef0"},
            "baseline": {"id": "baseline-1", "revision": 1},
            "blockers": [failed_check] if failed_check else [],
        },
    )


def write_complete_case(qa: Path) -> Path:
    evidence_paths = [
        "snapshots/desktop-default.txt",
        "screenshots/desktop-default--before.png",
        "screenshots/desktop-default--after.png",
        "screenshots/desktop-default--element.png",
        "screenshots/desktop-default--viewport.png",
        "baselines/desktop-default--element.png",
        "baselines/desktop-default--viewport.png",
        "diffs/desktop-default--element.png",
        "diffs/desktop-default--viewport.png",
        "console/desktop-default.json",
        "network/desktop-default.json",
        "accessibility/desktop-default.json",
        "lighthouse/desktop.json",
        "lighthouse/mobile.json",
    ]
    for relative in evidence_paths:
        path = qa / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(b"evidence")
    write_json(qa / "console/desktop-default.json", {"violations": [], "messages": []})
    write_json(
        qa / "network/desktop-default.json",
        {"violations": [], "duplicate_requests": [], "requests": []},
    )
    write_json(qa / "accessibility/desktop-default.json", {"status": "passed", "findings": []})
    for device in ("desktop", "mobile"):
        write_json(
            qa / f"lighthouse/{device}.json",
            {
                "categories": {"accessibility": {"score": 1.0}},
                "component_findings": [],
            },
        )
    for name in ("element", "viewport"):
        write_json(
            qa / f"diffs/desktop-default--{name}.comparison.json",
            {
                "status": "passed",
                "reason": "within-threshold",
                "dimensions": {"width": 100, "height": 100},
                "mask": None,
            },
        )
    result = {
        "schema_version": 1,
        "case_id": "desktop-default",
        "viewport": "desktop",
        "state": "default",
        "required": True,
        "gates": copy.deepcopy(PASSING_GATES),
        "performance_reason": "The fixture changes no loading or rendering path.",
        "evidence": {
            "snapshot": "snapshots/desktop-default.txt",
            "screenshots": {
                "before": "screenshots/desktop-default--before.png",
                "after": "screenshots/desktop-default--after.png",
                "element": {
                    "actual": "screenshots/desktop-default--element.png",
                    "baseline": "baselines/desktop-default--element.png",
                    "diff": "diffs/desktop-default--element.png",
                    "comparison_summary": "diffs/desktop-default--element.comparison.json",
                },
                "viewport": {
                    "actual": "screenshots/desktop-default--viewport.png",
                    "baseline": "baselines/desktop-default--viewport.png",
                    "diff": "diffs/desktop-default--viewport.png",
                    "comparison_summary": "diffs/desktop-default--viewport.comparison.json",
                },
            },
            "console": "console/desktop-default.json",
            "network": "network/desktop-default.json",
            "accessibility": "accessibility/desktop-default.json",
            "lighthouse": {
                "desktop": "lighthouse/desktop.json",
                "mobile": "lighthouse/mobile.json",
            },
            "performance_trace": None,
        },
        "assertions": [
            {"id": "geometry-box", "category": "geometry", "status": "passed"},
            {"id": "keyboard-name", "category": "accessibility", "status": "passed"},
        ],
        "observations": {
            "console": {"violations": [], "allowlisted": []},
            "network": {"violations": [], "expected_analytics": []},
        },
        "waivers": [],
        "retry_history": [
            {
                "attempt": 1,
                "status": "passed",
                "at": "2026-08-03T00:00:00Z",
                "evidence_links": ["screenshots/desktop-default--viewport.png"],
            }
        ],
    }
    path = qa / "desktop-default.result.json"
    write_json(path, result)
    return path


class BrowserPlanValidationTests(unittest.TestCase):
    def test_complete_plan_passes(self) -> None:
        self.assertEqual([], validate_browser_test_plan(valid_browser_plan()))

    def test_incomplete_viewport_matrix_blocks(self) -> None:
        plan = valid_browser_plan()
        plan["interactions"] = [plan["interactions"][0]]  # type: ignore[index]
        issues = validate_browser_test_plan(plan)
        self.assertTrue(any(issue["code"] == "browser-viewport-matrix" for issue in issues))

    def test_incomplete_case_blocks(self) -> None:
        plan = valid_browser_plan()
        del plan["interactions"][0]["expected_semantic_result"]  # type: ignore[index]
        issues = validate_browser_test_plan(plan)
        self.assertTrue(any(issue["code"] == "browser-test-case" for issue in issues))

    def test_mask_covering_tested_assertions_blocks(self) -> None:
        plan = valid_browser_plan()
        plan["visual_diff"]["allowed_masks"] = [  # type: ignore[index]
            {
                "id": "dynamic-price",
                "path": "qa/masks/dynamic-price.png",
                "reason": "Price changes in the fixture.",
                "approved_by": "reviewer",
                "region": {"x": 0, "y": 0, "width": 20, "height": 20},
                "does_not_cover_tested_assertions": False,
            }
        ]
        plan["interactions"][0]["allowed_masks"] = ["dynamic-price"]  # type: ignore[index]
        issues = validate_browser_test_plan(plan)
        self.assertTrue(any(issue["code"] == "browser-mask" for issue in issues))

    def test_approved_dynamic_image_subregion_mask_is_allowed(self) -> None:
        plan = valid_browser_plan()
        plan["visual_diff"]["allowed_masks"] = [  # type: ignore[index]
            {
                "id": "dynamic-product-image",
                "path": "qa/masks/dynamic-product-image.png",
                "reason": "The deterministic product image is unavailable in this fixture.",
                "approved_by": "reviewer",
                "region": {"x": 8, "y": 8, "width": 80, "height": 80},
                "does_not_cover_tested_assertions": True,
            }
        ]
        plan["interactions"][0]["allowed_masks"] = ["dynamic-product-image"]  # type: ignore[index]
        self.assertEqual([], validate_browser_test_plan(plan))

    def test_performance_not_applicable_requires_reason(self) -> None:
        plan = valid_browser_plan()
        plan["performance"]["not_applicable_reason"] = ""  # type: ignore[index]
        issues = validate_browser_test_plan(plan)
        self.assertTrue(any(issue["code"] == "browser-performance" for issue in issues))

    def test_performance_scope_must_be_explicit(self) -> None:
        plan = valid_browser_plan()
        plan["performance"]["required"] = None  # type: ignore[index]
        issues = validate_browser_test_plan(plan)
        self.assertTrue(any(issue["code"] == "browser-performance" for issue in issues))

    def test_performance_trigger_requires_trace_scope(self) -> None:
        plan = valid_browser_plan()
        plan["performance"]["triggers"] = ["sticky-fixed-ui"]  # type: ignore[index]
        issues = validate_browser_test_plan(plan)
        self.assertTrue(any(issue["code"] == "browser-performance" for issue in issues))

    def test_case_status_must_be_machine_readable(self) -> None:
        plan = valid_browser_plan()
        plan["interactions"][0]["status"] = "looks-good"  # type: ignore[index]
        issues = validate_browser_test_plan(plan)
        self.assertTrue(any(issue["code"] == "browser-test-case" for issue in issues))


class BrowserEvidenceSummaryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.qa = Path(self.temporary.name)
        write_preflight(self.qa)
        self.case_path = write_complete_case(self.qa)

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def read_case(self) -> dict[str, object]:
        return json.loads(self.case_path.read_text(encoding="utf-8"))

    def write_case(self, case: dict[str, object]) -> None:
        write_json(self.case_path, case)

    def test_all_evidence_present_passes(self) -> None:
        report = summarize_artifacts(self.qa)
        self.assertEqual("approved", report["overall_status"])
        self.assertEqual("passed", report["preflight_status"])
        self.assertEqual(4, len(report["screenshot_index"]))

    def test_chrome_unavailable_blocks(self) -> None:
        write_preflight(self.qa, failed_check="chrome_mcp_connected")
        report = summarize_artifacts(self.qa)
        self.assertEqual("blocked", report["overall_status"])
        self.assertEqual("blocked", report["preflight_status"])

    def test_missing_screenshot_blocks_visual_evidence(self) -> None:
        (self.qa / "screenshots/desktop-default--element.png").unlink()
        report = summarize_artifacts(self.qa)
        self.assertEqual("blocked", report["overall_status"])
        self.assertEqual("blocked", report["gates"]["visual"])
        self.assertTrue(any("desktop-default--element.png" in item for item in report["missing_evidence"]))

    def test_console_violation_fails_console_gate(self) -> None:
        case = self.read_case()
        case["observations"]["console"]["violations"] = [  # type: ignore[index]
            {"type": "unhandled-promise-rejection", "message": "boom"}
        ]
        self.write_case(case)
        report = summarize_artifacts(self.qa)
        self.assertEqual("failed", report["overall_status"])
        self.assertEqual("failed", report["gates"]["console"])

    def test_network_violation_fails_network_gate(self) -> None:
        case = self.read_case()
        case["observations"]["network"]["violations"] = [  # type: ignore[index]
            {"type": "unexpected-404", "url": "/missing.png"}
        ]
        self.write_case(case)
        report = summarize_artifacts(self.qa)
        self.assertEqual("failed", report["overall_status"])
        self.assertEqual("failed", report["gates"]["network"])

    def test_raw_console_error_cannot_be_declared_passed(self) -> None:
        write_json(
            self.qa / "console/desktop-default.json",
            {"violations": [{"type": "tested-interaction-error", "message": "boom"}]},
        )
        report = summarize_artifacts(self.qa)
        self.assertEqual("failed", report["gates"]["console"])

    def test_raw_duplicate_request_cannot_be_declared_passed(self) -> None:
        write_json(
            self.qa / "network/desktop-default.json",
            {
                "violations": [],
                "duplicate_requests": [
                    {"method": "POST", "url": "/cart/change.js", "count": 2}
                ],
            },
        )
        report = summarize_artifacts(self.qa)
        self.assertEqual("failed", report["gates"]["network"])

    def test_raw_lighthouse_accessibility_failure_cannot_be_declared_passed(self) -> None:
        write_json(
            self.qa / "lighthouse/mobile.json",
            {
                "categories": {"accessibility": {"score": 0.91}},
                "component_findings": ["button-name"],
            },
        )
        report = summarize_artifacts(self.qa)
        self.assertEqual("failed", report["gates"]["accessibility"])

    def test_geometry_assertion_failure_fails_geometry_gate(self) -> None:
        case = self.read_case()
        case["assertions"][0]["status"] = "failed"  # type: ignore[index]
        self.write_case(case)
        report = summarize_artifacts(self.qa)
        self.assertEqual("failed", report["gates"]["geometry"])

    def test_accessibility_assertion_failure_fails_accessibility_gate(self) -> None:
        case = self.read_case()
        case["assertions"][1]["status"] = "failed"  # type: ignore[index]
        self.write_case(case)
        report = summarize_artifacts(self.qa)
        self.assertEqual("failed", report["gates"]["accessibility"])

    def test_baseline_dimension_mismatch_fails_visual_and_geometry(self) -> None:
        comparison = self.qa / "diffs/desktop-default--element.comparison.json"
        write_json(
            comparison,
            {
                "status": "failed",
                "reason": "dimension-mismatch",
                "baseline_dimensions": {"width": 100, "height": 100},
                "actual_dimensions": {"width": 120, "height": 100},
            },
        )
        report = summarize_artifacts(self.qa)
        self.assertEqual("failed", report["gates"]["visual"])
        self.assertEqual("failed", report["gates"]["geometry"])

    def test_performance_not_applicable_needs_reason(self) -> None:
        case = self.read_case()
        case["performance_reason"] = ""
        self.write_case(case)
        report = summarize_artifacts(self.qa)
        self.assertEqual("blocked", report["gates"]["performance"])

    def test_waiver_needs_reason_and_approver(self) -> None:
        case = self.read_case()
        case["gates"]["functional"] = "waived"  # type: ignore[index]
        case["waivers"] = [{"gate": "functional", "reason": "", "approver": ""}]
        self.write_case(case)
        report = summarize_artifacts(self.qa)
        self.assertEqual("blocked", report["gates"]["functional"])
        self.assertTrue(any("waiver" in item.lower() for item in report["missing_evidence"]))

    def test_retry_history_is_preserved(self) -> None:
        case = self.read_case()
        case["retry_history"].append(  # type: ignore[union-attr]
            {
                "attempt": 2,
                "status": "passed",
                "at": "2026-08-03T00:01:00Z",
                "evidence_links": ["screenshots/desktop-default--element.png"],
            }
        )
        self.write_case(case)
        report = summarize_artifacts(self.qa)
        self.assertEqual(2, len(report["cases"][0]["retry_history"]))


if __name__ == "__main__":
    unittest.main()
