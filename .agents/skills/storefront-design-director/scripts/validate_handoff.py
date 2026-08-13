from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any, Mapping

from common import (
    DesignJobError,
    add_issue,
    load_data,
    read_artifact_metadata,
    resolve_job_path,
    sha256_file,
)


REQUIRED_ARTIFACTS = [
    "component-brief.md",
    "screenshot-inventory.yaml",
    "visual-audit.md",
    "direction-comparison.md",
    "locked-decisions.yaml",
    "component-anatomy.md",
    "state-matrix.md",
    "responsive-contract.md",
    "interaction-contract.md",
    "accessibility-checklist.md",
    "design-tokens.json",
    "content-stress-cases.yaml",
    "implementation-handoff.md",
    "codex-task.md",
    "acceptance-criteria.md",
    "browser-test-plan.yaml",
    "approval-record.yaml",
]
HANDOFF_TERMS = [
    "source-of-truth priority",
    "current architecture map",
    "required states",
    "responsive transformations",
    "accessibility contract",
    "allowed production areas",
    "prohibited changes",
    "chrome devtools qa plan",
    "rollback guidance",
]
BROWSER_TERMS = [
    "chrome_mcp_required",
    "console",
    "network",
    "accessibility",
    "performance",
    "visual",
    "non_regression",
]
BROWSER_PLAN_FIELDS = [
    "job_id",
    "revision",
    "environment",
    "base_url",
    "fixture",
    "authentication_mode",
    "setup",
    "viewports",
    "states",
    "interactions",
    "assertions",
    "screenshots",
    "console_policy",
    "network_policy",
    "lighthouse",
    "performance",
    "visual_diff",
    "non_regression",
    "cleanup",
]
BROWSER_CASE_FIELDS = [
    "id",
    "purpose",
    "precondition",
    "viewport",
    "state",
    "steps",
    "expected_semantic_result",
    "dom_assertions",
    "style_geometry_assertions",
    "screenshot_path",
    "baseline_path",
    "allowed_masks",
    "console_expectations",
    "network_expectations",
    "cleanup",
    "status",
    "evidence_links",
]
STABLE_ID = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def safe_relative_path(value: Any, suffix: str | None = None) -> bool:
    if not isinstance(value, str) or not value.strip():
        return False
    path = Path(value)
    if path.is_absolute() or ".." in path.parts:
        return False
    return suffix is None or path.suffix.lower() == suffix


def validate_browser_test_plan(plan: Any) -> list[dict[str, str]]:
    issues: list[dict[str, str]] = []
    if not isinstance(plan, Mapping):
        add_issue(issues, "browser-plan-schema", "Browser plan must be an object.", "browser-test-plan.yaml")
        return issues

    for field in BROWSER_PLAN_FIELDS:
        if field not in plan:
            add_issue(issues, "browser-plan-schema", f"Missing top-level field: {field}", field)
    if issues:
        return issues
    if plan.get("chrome_mcp_required") is not True:
        add_issue(issues, "browser-plan", "Chrome DevTools MCP must remain required.", "chrome_mcp_required")
    if not isinstance(plan.get("job_id"), str) or not plan.get("job_id"):
        add_issue(issues, "browser-plan-schema", "job_id must be non-empty.", "job_id")
    if not isinstance(plan.get("revision"), int) or plan.get("revision", 0) < 1:
        add_issue(issues, "browser-plan-schema", "revision must be a positive integer.", "revision")
    if plan.get("environment") not in {"local", "development", "staging", "production"}:
        add_issue(issues, "browser-plan-schema", "environment must name an approved environment.", "environment")
    for field in ("base_url", "fixture", "authentication_mode"):
        if not isinstance(plan.get(field), str) or not str(plan.get(field)).strip():
            add_issue(issues, "browser-plan-schema", f"{field} must be non-empty.", field)

    setup = plan.get("setup")
    if not isinstance(setup, Mapping):
        add_issue(issues, "browser-plan-schema", "setup must be an object.", "setup")
    else:
        if setup.get("profile_policy") != "default-profile-only" or setup.get("allow_isolated_context") is not False:
            add_issue(issues, "browser-profile-policy", "Browser plan must use the connected default profile without an isolated context.", "setup")
        if setup.get("zoom_percent") != 100:
            add_issue(issues, "browser-determinism", "Browser zoom must be 100 percent.", "setup.zoom_percent")
        if not safe_relative_path(setup.get("artifact_directory")):
            add_issue(issues, "browser-plan-schema", "Artifact directory must be a safe relative path.", "setup.artifact_directory")
        retries = setup.get("max_retries")
        if not isinstance(retries, int) or retries < 0:
            add_issue(issues, "browser-plan-schema", "max_retries must be a non-negative integer.", "setup.max_retries")
        if not isinstance(setup.get("waits"), list) or not setup.get("waits"):
            add_issue(issues, "browser-determinism", "Deterministic waits must be listed.", "setup.waits")

    viewport_ids: set[str] = set()
    viewport_modes: set[str] = set()
    viewports = plan.get("viewports")
    if not isinstance(viewports, list) or not viewports:
        add_issue(issues, "browser-plan-schema", "viewports must contain desktop and mobile entries.", "viewports")
    else:
        for index, viewport in enumerate(viewports):
            path = f"viewports[{index}]"
            if not isinstance(viewport, Mapping):
                add_issue(issues, "browser-plan-schema", "Viewport must be an object.", path)
                continue
            viewport_id = viewport.get("id")
            mode = viewport.get("mode")
            if not isinstance(viewport_id, str) or not STABLE_ID.fullmatch(viewport_id) or viewport_id in viewport_ids:
                add_issue(issues, "browser-plan-schema", "Viewport requires a unique stable ID.", f"{path}.id")
            else:
                viewport_ids.add(viewport_id)
            if mode not in {"desktop", "mobile"}:
                add_issue(issues, "browser-plan-schema", "Viewport mode must be desktop or mobile.", f"{path}.mode")
            else:
                viewport_modes.add(str(mode))
            for dimension in ("width", "height"):
                if not isinstance(viewport.get(dimension), int) or viewport.get(dimension, 0) <= 0:
                    add_issue(issues, "browser-plan-schema", f"Viewport {dimension} must be positive.", f"{path}.{dimension}")
        if viewport_modes != {"desktop", "mobile"}:
            add_issue(issues, "browser-viewport-matrix", "Both desktop and mobile viewport modes are required.", "viewports")

    state_ids: set[str] = set()
    states = plan.get("states")
    if not isinstance(states, list) or not states:
        add_issue(issues, "browser-plan-schema", "states must contain at least one state.", "states")
    else:
        for index, state in enumerate(states):
            state_id = state.get("id") if isinstance(state, Mapping) else None
            if not isinstance(state_id, str) or not STABLE_ID.fullmatch(state_id) or state_id in state_ids:
                add_issue(issues, "browser-plan-schema", "State requires a unique stable ID.", f"states[{index}].id")
            else:
                state_ids.add(state_id)

    visual_diff = plan.get("visual_diff")
    mask_ids: set[str] = set()
    if not isinstance(visual_diff, Mapping):
        add_issue(issues, "browser-plan-schema", "visual_diff must be an object.", "visual_diff")
    else:
        if visual_diff.get("format") != "png":
            add_issue(issues, "browser-screenshot", "Visual baselines must use PNG.", "visual_diff.format")
        masks = visual_diff.get("allowed_masks", [])
        if not isinstance(masks, list):
            add_issue(issues, "browser-mask", "allowed_masks must be a list.", "visual_diff.allowed_masks")
        else:
            for index, mask in enumerate(masks):
                path = f"visual_diff.allowed_masks[{index}]"
                if not isinstance(mask, Mapping):
                    add_issue(issues, "browser-mask", "Mask approval must be an object.", path)
                    continue
                mask_id = mask.get("id")
                if not isinstance(mask_id, str) or not STABLE_ID.fullmatch(mask_id) or mask_id in mask_ids:
                    add_issue(issues, "browser-mask", "Mask requires a unique stable ID.", f"{path}.id")
                else:
                    mask_ids.add(mask_id)
                if not safe_relative_path(mask.get("path"), ".png"):
                    add_issue(issues, "browser-mask", "Mask path must be a safe PNG path.", f"{path}.path")
                for field in ("reason", "approved_by"):
                    if not isinstance(mask.get(field), str) or not mask.get(field):
                        add_issue(issues, "browser-mask", f"Mask {field} is required.", f"{path}.{field}")
                region = mask.get("region")
                if not isinstance(region, Mapping) or any(
                    not isinstance(region.get(key), int) for key in ("x", "y", "width", "height")
                ) or region.get("x", -1) < 0 or region.get("y", -1) < 0 or region.get("width", 0) <= 0 or region.get("height", 0) <= 0:
                    add_issue(issues, "browser-mask", "Mask requires a positive approved rectangle.", f"{path}.region")
                if mask.get("does_not_cover_tested_assertions") is not True:
                    add_issue(
                        issues,
                        "browser-mask",
                        "A mask cannot cover the pixels or geometry exercised by this case's assertions.",
                        f"{path}.does_not_cover_tested_assertions",
                    )

    interactions = plan.get("interactions")
    case_ids: set[str] = set()
    covered_viewports: set[str] = set()
    covered_states: set[str] = set()
    if not isinstance(interactions, list) or not interactions:
        add_issue(issues, "browser-plan-schema", "interactions must contain test cases.", "interactions")
    else:
        for index, case in enumerate(interactions):
            path = f"interactions[{index}]"
            if not isinstance(case, Mapping):
                add_issue(issues, "browser-test-case", "Test case must be an object.", path)
                continue
            for field in BROWSER_CASE_FIELDS:
                if field not in case:
                    add_issue(issues, "browser-test-case", f"Test case is missing {field}.", f"{path}.{field}")
            case_id = case.get("id")
            if not isinstance(case_id, str) or not STABLE_ID.fullmatch(case_id) or case_id in case_ids:
                add_issue(issues, "browser-test-case", "Test case requires a unique stable ID.", f"{path}.id")
            else:
                case_ids.add(case_id)
            viewport = case.get("viewport")
            state = case.get("state")
            if viewport not in viewport_ids:
                add_issue(issues, "browser-test-case", "Test case references an unknown viewport.", f"{path}.viewport")
            else:
                covered_viewports.add(str(viewport))
            if state not in state_ids:
                add_issue(issues, "browser-test-case", "Test case references an unknown state.", f"{path}.state")
            else:
                covered_states.add(str(state))
            for field in ("purpose", "precondition", "expected_semantic_result"):
                if not isinstance(case.get(field), str) or not case.get(field):
                    add_issue(issues, "browser-test-case", f"{field} must be non-empty.", f"{path}.{field}")
            for field in ("steps", "dom_assertions", "style_geometry_assertions", "cleanup"):
                if not isinstance(case.get(field), list) or not case.get(field):
                    add_issue(issues, "browser-test-case", f"{field} must be a non-empty list.", f"{path}.{field}")
            for field in ("screenshot_path", "baseline_path"):
                if not safe_relative_path(case.get(field), ".png"):
                    add_issue(issues, "browser-test-case", f"{field} must be a safe PNG path.", f"{path}.{field}")
            if not isinstance(case.get("console_expectations"), Mapping) or not isinstance(case.get("network_expectations"), Mapping):
                add_issue(issues, "browser-test-case", "Console and network expectations must be objects.", path)
            if not isinstance(case.get("evidence_links"), list):
                add_issue(issues, "browser-test-case", "evidence_links must be a list.", f"{path}.evidence_links")
            if case.get("status") not in {"not-run", "passed", "failed", "blocked", "waived"}:
                add_issue(issues, "browser-test-case", "status must be not-run, passed, failed, blocked, or waived.", f"{path}.status")
            case_masks = case.get("allowed_masks")
            if not isinstance(case_masks, list):
                add_issue(issues, "browser-mask", "Case allowed_masks must be a list.", f"{path}.allowed_masks")
            else:
                for mask_id in case_masks:
                    if mask_id not in mask_ids:
                        add_issue(issues, "browser-mask", "Case references an unapproved mask.", f"{path}.allowed_masks")
    if viewport_ids - covered_viewports:
        missing = ", ".join(sorted(viewport_ids - covered_viewports))
        add_issue(issues, "browser-viewport-matrix", f"No test case covers viewport(s): {missing}", "interactions")
    if state_ids - covered_states:
        missing = ", ".join(sorted(state_ids - covered_states))
        add_issue(issues, "browser-state-matrix", f"No test case covers state(s): {missing}", "interactions")

    screenshots = plan.get("screenshots")
    if not isinstance(screenshots, Mapping) or screenshots.get("format") != "png" or not safe_relative_path(screenshots.get("index_path"), ".json"):
        add_issue(issues, "browser-screenshot", "Screenshot policy requires PNG and a safe JSON index path.", "screenshots")
    for field in ("console_policy", "network_policy"):
        policy = plan.get(field)
        if not isinstance(policy, Mapping) or not isinstance(policy.get("fail_on"), list) or not policy.get("fail_on"):
            add_issue(issues, "browser-plan-schema", f"{field} requires explicit failure conditions.", field)
    lighthouse = plan.get("lighthouse")
    if not isinstance(lighthouse, Mapping) or lighthouse.get("required") is not True or set(lighthouse.get("devices", [])) != {"desktop", "mobile"}:
        add_issue(issues, "browser-lighthouse", "Lighthouse must cover desktop and mobile.", "lighthouse")
    elif not isinstance(lighthouse.get("report_paths"), Mapping) or any(
        not safe_relative_path(lighthouse["report_paths"].get(device), ".json")
        for device in ("desktop", "mobile")
    ):
        add_issue(issues, "browser-lighthouse", "Lighthouse report paths must be safe JSON paths.", "lighthouse.report_paths")
    performance = plan.get("performance")
    if not isinstance(performance, Mapping):
        add_issue(issues, "browser-performance", "performance must be an object.", "performance")
    else:
        required = performance.get("required")
        triggers = performance.get("triggers")
        if not isinstance(required, bool):
            add_issue(issues, "browser-performance", "Performance scope must explicitly be required or not required.", "performance.required")
        elif required is False and not performance.get("not_applicable_reason"):
            add_issue(issues, "browser-performance", "Performance not-applicable requires a reason.", "performance.not_applicable_reason")
        if not isinstance(triggers, list):
            add_issue(issues, "browser-performance", "Performance triggers must be a list.", "performance.triggers")
        elif triggers and required is not True:
            add_issue(issues, "browser-performance", "A performance trigger requires trace scope.", "performance.required")
        if required is True and (not isinstance(performance.get("trace_paths"), list) or not performance.get("trace_paths")):
            add_issue(issues, "browser-performance", "Required performance scope needs planned trace paths.", "performance.trace_paths")
    non_regression = plan.get("non_regression")
    if not isinstance(non_regression, Mapping) or non_regression.get("required") is not True:
        add_issue(issues, "browser-non-regression", "Non-regression coverage is required.", "non_regression")
    else:
        non_regression_cases = non_regression.get("cases")
        if not isinstance(non_regression_cases, list) or not non_regression_cases:
            add_issue(
                issues,
                "browser-non-regression",
                "Non-regression coverage must name at least one test case.",
                "non_regression.cases",
            )
        elif not set(non_regression_cases).issubset(case_ids):
            add_issue(issues, "browser-non-regression", "Non-regression references unknown cases.", "non_regression.cases")
    if not isinstance(plan.get("cleanup"), list) or not plan.get("cleanup"):
        add_issue(issues, "browser-plan-schema", "cleanup must be a non-empty list.", "cleanup")
    return issues


def status_of(value: Any) -> str:
    if isinstance(value, Mapping):
        return str(value.get("status", ""))
    return str(value)


def section_has_content(text: str, heading: str) -> bool:
    match = re.search(
        rf"(?im)^##\s+{re.escape(heading)}\s*$",
        text,
    )
    if not match:
        return False
    remainder = text[match.end() :]
    next_heading = re.search(r"(?m)^##\s+", remainder)
    body = remainder[: next_heading.start()] if next_heading else remainder
    meaningful = [
        line.strip()
        for line in body.splitlines()
        if line.strip() and not line.strip().startswith("Artifact ")
    ]
    return bool(meaningful)


def markdown_table_rows(text: str, heading: str | None = None) -> list[list[str]]:
    if heading:
        match = re.search(rf"(?im)^##\s+{re.escape(heading)}\s*$", text)
        if not match:
            return []
        remainder = text[match.end() :]
        next_heading = re.search(r"(?m)^##\s+", remainder)
        text = remainder[: next_heading.start()] if next_heading else remainder
    rows: list[list[str]] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|") or not stripped.endswith("|"):
            continue
        cells = [cell.strip() for cell in stripped.strip("|").split("|")]
        if not cells or all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells):
            continue
        rows.append(cells)
    return rows[1:] if rows else []


def validate_contract_content(
    root: Path,
    manifest: Mapping[str, Any],
    blocking: list[dict[str, str]],
) -> None:
    states = manifest.get("states")
    required_states = states.get("required") if isinstance(states, Mapping) else None
    state_path = root / "state-matrix.md"
    state_text = state_path.read_text(encoding="utf-8") if state_path.is_file() else ""
    state_rows = markdown_table_rows(state_text)
    state_ids = {row[0] for row in state_rows if row and row[0] != "Catalog state"}
    if not isinstance(required_states, list) or not required_states:
        add_issue(
            blocking,
            "state-contract-content",
            "states.required must name at least one applicable state.",
            "states.required",
        )
    elif not set(map(str, required_states)).issubset(state_ids):
        add_issue(
            blocking,
            "state-contract-content",
            "Every required state must have a populated state-matrix row.",
            "state-matrix.md",
        )

    responsive = manifest.get("responsive")
    breakpoints = responsive.get("breakpoints") if isinstance(responsive, Mapping) else None
    transformations = responsive.get("transformations") if isinstance(responsive, Mapping) else None
    responsive_path = root / "responsive-contract.md"
    responsive_text = (
        responsive_path.read_text(encoding="utf-8") if responsive_path.is_file() else ""
    )
    viewport_rows = markdown_table_rows(
        responsive_text, "Required viewports and container widths"
    )
    transformation_rows = markdown_table_rows(
        responsive_text, "Region transformations"
    )
    if (
        not isinstance(breakpoints, list)
        or not breakpoints
        or not viewport_rows
        or not isinstance(transformations, list)
        or not transformations
        or not transformation_rows
    ):
        add_issue(
            blocking,
            "responsive-contract-content",
            "Responsive breakpoints and region transformations must be populated in the manifest and contract.",
            "responsive-contract.md",
        )

    accessibility = manifest.get("accessibility")
    requirements = (
        accessibility.get("requirements") if isinstance(accessibility, Mapping) else None
    )
    accessibility_path = root / "accessibility-checklist.md"
    accessibility_text = (
        accessibility_path.read_text(encoding="utf-8")
        if accessibility_path.is_file()
        else ""
    )
    if (
        not isinstance(requirements, list)
        or not requirements
        or not re.search(r"(?im)^- \[x\] ", accessibility_text)
    ):
        add_issue(
            blocking,
            "accessibility-contract-content",
            "Accessibility requirements and at least one verified checklist item are required.",
            "accessibility-checklist.md",
        )

    stress_path = root / "content-stress-cases.yaml"
    if stress_path.is_file():
        try:
            stress = load_data(stress_path)
        except DesignJobError as error:
            add_issue(blocking, "content-stress-coverage", str(error), "content-stress-cases.yaml")
        else:
            cases = stress.get("cases")
            required = [
                case
                for case in cases
                if isinstance(case, Mapping) and case.get("required_in_browser_qa") is True
            ] if isinstance(cases, list) else []
            if not required:
                add_issue(
                    blocking,
                    "content-stress-coverage",
                    "At least one applicable content stress case must be required in browser QA.",
                    "content-stress-cases.yaml",
                )


def validate_handoff(manifest_path: Path) -> dict[str, Any]:
    blocking: list[dict[str, str]] = []
    advisory: list[dict[str, str]] = []
    try:
        manifest = load_data(manifest_path)
    except DesignJobError as error:
        add_issue(blocking, "manifest-read", str(error), str(manifest_path))
        return {"valid": False, "blocking": blocking, "advisory": advisory}
    root = manifest_path.parent
    job = manifest.get("job", {})
    artifact_registry = manifest.get("artifacts", {})
    current_artifacts = (
        artifact_registry.get("current", {})
        if isinstance(artifact_registry, Mapping)
        else {}
    )
    for relative in REQUIRED_ARTIFACTS:
        path = root / relative
        if not path.is_file() or path.stat().st_size == 0:
            add_issue(blocking, "missing-artifact", "Required handoff artifact is missing.", relative)
            continue
        metadata = read_artifact_metadata(path)
        record = current_artifacts.get(relative) if isinstance(current_artifacts, Mapping) else None
        if metadata is None or not isinstance(record, Mapping):
            add_issue(blocking, "artifact-registry", "Artifact metadata or registry entry is missing.", relative)
            continue
        if metadata.get("job_id") != job.get("id"):
            add_issue(blocking, "artifact-job-id", "Artifact belongs to another job.", relative)
        if metadata.get("status") not in {"complete", "approved"}:
            add_issue(blocking, "artifact-status", "Artifact must be complete or approved.", relative)
        if metadata.get("status") != record.get("status") or metadata.get("revision") != record.get("revision"):
            add_issue(blocking, "artifact-registry", "Artifact metadata differs from its registry.", relative)
        if metadata.get("revision") != job.get("revision") and metadata.get("status") != "approved":
            add_issue(blocking, "artifact-revision", "Unapproved artifact must match the current job revision.", relative)
        if sha256_file(path) != record.get("sha256"):
            add_issue(blocking, "artifact-checksum", "Artifact checksum is stale.", relative)

    decisions = manifest.get("decisions", {})
    if not isinstance(decisions, Mapping) or decisions.get("open"):
        add_issue(blocking, "open-decisions", "All blocking design decisions must be resolved.", "decisions.open")
    references = manifest.get("references", {})
    approved = references.get("approved", []) if isinstance(references, Mapping) else []
    if not approved:
        add_issue(blocking, "approved-references", "At least one reference must be approved.", "references.approved")
    else:
        for item in approved:
            relative = item.get("path") if isinstance(item, Mapping) else item
            if not isinstance(relative, str):
                add_issue(blocking, "reference-shape", "Approved reference requires a path.", "references.approved")
                continue
            try:
                path = resolve_job_path(root, relative)
            except DesignJobError as error:
                add_issue(blocking, "unsafe-reference", str(error), relative)
                continue
            if not path.is_file():
                add_issue(blocking, "missing-reference", "Approved reference is missing.", relative)

    checks = [
        ("states.coverage_status", manifest.get("states", {}).get("coverage_status"), "complete"),
        ("responsive.contract_status", manifest.get("responsive", {}).get("contract_status"), "complete"),
        (
            "accessibility.validation_status",
            manifest.get("accessibility", {}).get("validation_status"),
            "complete",
        ),
        ("approvals.design", status_of(manifest.get("approvals", {}).get("design", {})), "approved"),
        ("handoff.status", manifest.get("handoff", {}).get("status"), "approved"),
        ("approvals.handoff", status_of(manifest.get("approvals", {}).get("handoff", {})), "approved"),
    ]
    for path, actual, expected in checks:
        if actual != expected:
            add_issue(blocking, "incomplete-contract", f"{path} must equal {expected}.", path)

    validate_contract_content(root, manifest, blocking)

    handoff_path = root / "implementation-handoff.md"
    if handoff_path.is_file():
        text = handoff_path.read_text(encoding="utf-8").lower()
        for term in HANDOFF_TERMS:
            if term not in text:
                add_issue(blocking, "handoff-section", f"Missing handoff section: {term}", "implementation-handoff.md")
            elif not section_has_content(text, term):
                add_issue(blocking, "empty-handoff-section", f"Handoff section has no content: {term}", "implementation-handoff.md")
    browser_path = root / "browser-test-plan.yaml"
    if browser_path.is_file():
        try:
            browser_plan = load_data(browser_path)
        except DesignJobError as error:
            add_issue(blocking, "browser-plan", str(error), "browser-test-plan.yaml")
        else:
            blocking.extend(validate_browser_test_plan(browser_plan))
    approval_path = root / "approval-record.yaml"
    if approval_path.is_file():
        approval_record = load_data(approval_path)
        for name in ("design", "handoff"):
            if status_of(approval_record.get(name, {})) != "approved":
                add_issue(blocking, "approval-record", f"approval-record {name} status must be approved.", "approval-record.yaml")
    return {
        "valid": not blocking,
        "manifest": str(manifest_path),
        "blocking": blocking,
        "advisory": advisory,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate a Codex-ready design handoff.")
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--json", action="store_true", dest="as_json")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    report = validate_handoff(args.manifest)
    if args.as_json:
        print(json.dumps(report, indent=2))
    else:
        for issue in report["blocking"]:
            print(f"blocking: {issue['code']}: {issue['message']} ({issue['path']})")
        print("valid" if report["valid"] else "invalid")
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
