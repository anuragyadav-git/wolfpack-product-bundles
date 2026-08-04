from __future__ import annotations

import argparse
import copy
import json
import sys
from pathlib import Path
from typing import Any, Mapping

from common import DesignJobError, atomic_write_text, resolve_job_path


REQUIRED_GATES = [
    "functional",
    "visual",
    "geometry",
    "responsive",
    "console",
    "network",
    "accessibility",
    "performance",
    "non_regression",
]
PASS_VALUES = {"passed", "waived", "not-applicable"}
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
STATUS_PRIORITY = {
    "passed": 0,
    "waived": 0,
    "not-applicable": 0,
    "failed": 1,
    "blocked": 2,
}


def load_results(qa_root: Path) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for path in sorted(qa_root.rglob("*.result.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            results.append({"case_id": path.name, "parse_error": str(error), "source": str(path)})
            continue
        if isinstance(data, dict):
            data["source"] = str(path)
            results.append(data)
    return results


def validate_preflight(qa_root: Path) -> tuple[str, list[str], dict[str, Any]]:
    path = qa_root / "preflight.json"
    if not path.is_file():
        return "blocked", ["Chrome preflight result is missing: preflight.json"], {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        return "blocked", [f"Chrome preflight result is unreadable: {error}"], {}
    if not isinstance(data, dict):
        return "blocked", ["Chrome preflight result must be an object."], {}
    missing: list[str] = []
    checks = data.get("checks")
    if not isinstance(checks, Mapping):
        missing.append("Chrome preflight checks are missing.")
    else:
        for name in PREFLIGHT_CHECKS:
            check = checks.get(name)
            if not isinstance(check, Mapping):
                missing.append(f"Preflight check is missing: {name}")
                continue
            if check.get("mandatory") is not True or check.get("status") != "passed":
                missing.append(f"Mandatory preflight check did not pass: {name}")
            if not check.get("evidence"):
                missing.append(f"Preflight check lacks evidence: {name}")
    browser = data.get("browser")
    if not isinstance(browser, Mapping) or (
        browser.get("profile_policy") != "default-profile-only"
        or browser.get("isolated_context_used") is not False
    ):
        missing.append("Chrome preflight must confirm the connected default profile without an isolated context.")
    if not isinstance(data.get("tool_inventory"), list) or not data.get("tool_inventory"):
        missing.append("Chrome preflight tool inventory is missing.")
    repository = data.get("repository")
    if not isinstance(repository, Mapping) or not repository.get("branch") or not repository.get("commit"):
        missing.append("Chrome preflight repository identity is incomplete.")
    baseline = data.get("baseline")
    if not isinstance(baseline, Mapping) or not baseline.get("id") or not baseline.get("revision"):
        missing.append("Chrome preflight baseline identity is incomplete.")
    status = "passed" if data.get("status") == "passed" and not missing else "blocked"
    return status, missing, data


def stronger_status(current: str, proposed: str) -> str:
    return proposed if STATUS_PRIORITY.get(proposed, 2) > STATUS_PRIORITY.get(current, 2) else current


def evaluate_case(
    qa_root: Path,
    raw_case: Mapping[str, Any],
) -> tuple[dict[str, Any], list[str], list[dict[str, str]]]:
    case = copy.deepcopy(dict(raw_case))
    case_id = str(case.get("case_id", case.get("source", "unknown")))
    missing: list[str] = []
    screenshot_index: list[dict[str, str]] = []
    declared = case.get("gates")
    gates: dict[str, str] = {}
    for gate in REQUIRED_GATES:
        status = declared.get(gate) if isinstance(declared, Mapping) else None
        if status not in STATUS_PRIORITY:
            gates[gate] = "blocked"
            missing.append(f"{case_id}: missing or invalid {gate} gate")
        else:
            gates[gate] = str(status)

    def mark(gate: str, status: str) -> None:
        gates[gate] = stronger_status(gates.get(gate, "passed"), status)

    def require_file(value: Any, label: str, gate: str) -> Path | None:
        if not isinstance(value, str) or not value:
            missing.append(f"{case_id}: missing {label}")
            mark(gate, "blocked")
            return None
        try:
            path = resolve_job_path(qa_root, value)
        except DesignJobError:
            missing.append(f"{case_id}: unsafe {label} path {value}")
            mark(gate, "blocked")
            return None
        if not path.is_file():
            missing.append(f"{case_id}: missing {label} {value}")
            mark(gate, "blocked")
            return None
        return path

    def load_json_evidence(value: Any, label: str, gate: str) -> Mapping[str, Any] | None:
        path = require_file(value, label, gate)
        if path is None:
            return None
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            missing.append(f"{case_id}: unreadable {label}: {error}")
            mark(gate, "blocked")
            return None
        if not isinstance(data, Mapping):
            missing.append(f"{case_id}: {label} must contain an object")
            mark(gate, "blocked")
            return None
        return data

    evidence = case.get("evidence")
    if not isinstance(evidence, Mapping):
        missing.append(f"{case_id}: structured evidence is missing")
        for gate in REQUIRED_GATES:
            mark(gate, "blocked")
        evidence = {}
    require_file(evidence.get("snapshot"), "accessibility snapshot", "accessibility")

    screenshots = evidence.get("screenshots")
    if not isinstance(screenshots, Mapping):
        missing.append(f"{case_id}: screenshot evidence is missing")
        mark("visual", "blocked")
        screenshots = {}
    for phase in ("before", "after"):
        relative = screenshots.get(phase)
        if require_file(relative, f"{phase} screenshot", "visual"):
            screenshot_index.append(
                {"case_id": case_id, "kind": "viewport", "phase": phase, "path": str(relative)}
            )
    for kind in ("element", "viewport"):
        capture = screenshots.get(kind)
        if not isinstance(capture, Mapping):
            missing.append(f"{case_id}: {kind} screenshot record is missing")
            mark("visual", "blocked")
            continue
        actual = capture.get("actual")
        if require_file(actual, f"{kind} actual screenshot", "visual"):
            screenshot_index.append(
                {"case_id": case_id, "kind": kind, "phase": "after", "path": str(actual)}
            )
        require_file(capture.get("baseline"), f"{kind} baseline screenshot", "visual")
        require_file(capture.get("diff"), f"{kind} diff screenshot", "visual")
        comparison_path = require_file(
            capture.get("comparison_summary"),
            f"{kind} comparison summary",
            "visual",
        )
        if comparison_path:
            try:
                comparison = json.loads(comparison_path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError) as error:
                missing.append(f"{case_id}: unreadable {kind} comparison summary: {error}")
                mark("visual", "blocked")
            else:
                status = comparison.get("status") if isinstance(comparison, Mapping) else None
                if status == "failed":
                    mark("visual", "failed")
                    if comparison.get("reason") in {"dimension-mismatch", "mask-dimension-mismatch"}:
                        mark("geometry", "failed")
                elif status == "blocked":
                    mark("visual", "blocked")
                elif status != "passed":
                    missing.append(f"{case_id}: invalid {kind} comparison status")
                    mark("visual", "blocked")

    console_evidence = load_json_evidence(evidence.get("console"), "console log", "console")
    if console_evidence is not None:
        raw_violations = console_evidence.get("violations")
        if not isinstance(raw_violations, list):
            missing.append(f"{case_id}: console log violations must be a list")
            mark("console", "blocked")
        elif raw_violations:
            mark("console", "failed")

    network_evidence = load_json_evidence(evidence.get("network"), "network log", "network")
    if network_evidence is not None:
        raw_violations = network_evidence.get("violations")
        duplicate_requests = network_evidence.get("duplicate_requests")
        if not isinstance(raw_violations, list) or not isinstance(duplicate_requests, list):
            missing.append(
                f"{case_id}: network log violations and duplicate_requests must be lists"
            )
            mark("network", "blocked")
        elif raw_violations or duplicate_requests:
            mark("network", "failed")

    accessibility_evidence = load_json_evidence(
        evidence.get("accessibility"), "accessibility result", "accessibility"
    )
    if accessibility_evidence is not None:
        if accessibility_evidence.get("status") == "failed" or accessibility_evidence.get("findings"):
            mark("accessibility", "failed")
        elif accessibility_evidence.get("status") not in {"passed", "not-applicable"}:
            missing.append(f"{case_id}: accessibility evidence status is invalid")
            mark("accessibility", "blocked")
    lighthouse = evidence.get("lighthouse")
    if not isinstance(lighthouse, Mapping):
        missing.append(f"{case_id}: Lighthouse evidence is missing")
        mark("accessibility", "blocked")
    else:
        for device in ("desktop", "mobile"):
            lighthouse_report = load_json_evidence(
                lighthouse.get(device),
                f"Lighthouse {device} report",
                "accessibility",
            )
            if lighthouse_report is None:
                continue
            component_findings = lighthouse_report.get("component_findings", [])
            categories = lighthouse_report.get("categories")
            accessibility_score = None
            if isinstance(categories, Mapping):
                accessibility_category = categories.get("accessibility")
                if isinstance(accessibility_category, Mapping):
                    accessibility_score = accessibility_category.get("score")
            if component_findings or lighthouse_report.get("status") == "failed":
                mark("accessibility", "failed")
            elif not isinstance(accessibility_score, (int, float)):
                missing.append(
                    f"{case_id}: Lighthouse {device} report lacks an accessibility score"
                )
                mark("accessibility", "blocked")
            elif accessibility_score < 1:
                mark("accessibility", "failed")

    assertions = case.get("assertions")
    if not isinstance(assertions, list) or not assertions:
        missing.append(f"{case_id}: assertion results are missing")
        mark("functional", "blocked")
    else:
        for assertion in assertions:
            if not isinstance(assertion, Mapping):
                missing.append(f"{case_id}: invalid assertion result")
                mark("functional", "blocked")
                continue
            category = str(assertion.get("category", "functional"))
            gate = category if category in REQUIRED_GATES else "functional"
            status = assertion.get("status")
            if status == "failed":
                mark(gate, "failed")
            elif status == "blocked":
                mark(gate, "blocked")
            elif status != "passed":
                missing.append(f"{case_id}: assertion {assertion.get('id', 'unknown')} has no valid status")
                mark(gate, "blocked")

    observations = case.get("observations")
    if not isinstance(observations, Mapping):
        missing.append(f"{case_id}: console and network observations are missing")
        mark("console", "blocked")
        mark("network", "blocked")
    else:
        console = observations.get("console")
        if not isinstance(console, Mapping):
            missing.append(f"{case_id}: console observations are missing")
            mark("console", "blocked")
        else:
            if console.get("violations"):
                mark("console", "failed")
            allowlisted = console.get("allowlisted", [])
            if not isinstance(allowlisted, list):
                missing.append(f"{case_id}: console allowlist must be a list")
                mark("console", "blocked")
            else:
                for entry in allowlisted:
                    if not isinstance(entry, Mapping) or not (entry.get("exact") or entry.get("pattern")) or any(
                        not entry.get(field) for field in ("reason", "owner", "review_date")
                    ):
                        missing.append(f"{case_id}: console allowlist entry lacks match, reason, owner, or review date")
                        mark("console", "blocked")
        network = observations.get("network")
        if not isinstance(network, Mapping):
            missing.append(f"{case_id}: network observations are missing")
            mark("network", "blocked")
        elif network.get("violations"):
            mark("network", "failed")

    if gates.get("performance") == "not-applicable":
        if not case.get("performance_reason"):
            missing.append(f"{case_id}: performance not-applicable needs a reason")
            mark("performance", "blocked")
    elif gates.get("performance") == "passed":
        require_file(evidence.get("performance_trace"), "performance trace", "performance")

    waivers = case.get("waivers")
    if not isinstance(waivers, list):
        missing.append(f"{case_id}: waivers must be a list")
        waivers = []
    for gate, status in list(gates.items()):
        if status != "waived":
            continue
        waiver = next(
            (item for item in waivers if isinstance(item, Mapping) and item.get("gate") == gate),
            None,
        )
        if not isinstance(waiver, Mapping) or any(
            not waiver.get(field) for field in ("reason", "approver", "approved_at")
        ):
            missing.append(f"{case_id}: {gate} waiver requires reason, approver, and approved_at")
            gates[gate] = "blocked"

    retries = case.get("retry_history")
    if not isinstance(retries, list) or not retries:
        missing.append(f"{case_id}: retry history is missing")
        mark("non_regression", "blocked")
    else:
        expected_attempt = 1
        for attempt in retries:
            if not isinstance(attempt, Mapping) or attempt.get("attempt") != expected_attempt or not attempt.get("status") or not isinstance(attempt.get("evidence_links"), list):
                missing.append(f"{case_id}: retry history is malformed at attempt {expected_attempt}")
                mark("non_regression", "blocked")
                break
            expected_attempt += 1

    case["gates"] = gates
    return case, missing, screenshot_index


def summarize_artifacts(qa_root: Path) -> dict[str, Any]:
    qa_root = qa_root.resolve()
    if not qa_root.is_dir():
        return {
            "overall_status": "blocked",
            "preflight_status": "blocked",
            "gates": {gate: "blocked" for gate in REQUIRED_GATES},
            "cases": [],
            "screenshot_index": [],
            "missing_evidence": [f"QA directory does not exist: {qa_root}"],
        }
    preflight_status, preflight_missing, preflight = validate_preflight(qa_root)
    raw_cases = load_results(qa_root)
    missing: list[str] = list(preflight_missing)
    if not raw_cases:
        missing.append("No *.result.json browser case files were found.")
    cases: list[dict[str, Any]] = []
    screenshot_index: list[dict[str, str]] = []
    for raw_case in raw_cases:
        case, case_missing, case_screenshots = evaluate_case(qa_root, raw_case)
        cases.append(case)
        missing.extend(case_missing)
        screenshot_index.extend(case_screenshots)

    aggregate: dict[str, str] = {}
    for gate in REQUIRED_GATES:
        statuses = [str(case.get("gates", {}).get(gate, "blocked")) for case in cases]
        if not statuses or "blocked" in statuses:
            aggregate[gate] = "blocked"
        elif "failed" in statuses:
            aggregate[gate] = "failed"
        elif all(status in PASS_VALUES for status in statuses):
            aggregate[gate] = "passed"
        else:
            aggregate[gate] = "blocked"

    if preflight_status != "passed" or any(status == "blocked" for status in aggregate.values()) or missing:
        overall = "blocked"
    elif any(status == "failed" for status in aggregate.values()):
        overall = "failed"
    else:
        overall = "approved"
    artifact_counts = {
        "screenshots": len(list(qa_root.rglob("*.png"))),
        "diffs": len(list(qa_root.rglob("*.comparison.json"))),
        "console": len(list(qa_root.rglob("*console*.json"))),
        "network": len(list(qa_root.rglob("*network*.json"))),
        "lighthouse": len(list(qa_root.rglob("*lighthouse*.json"))) + len(list((qa_root / "lighthouse").glob("*.json"))) if (qa_root / "lighthouse").is_dir() else 0,
        "traces": len(list(qa_root.rglob("*.json.gz"))) + len(list(qa_root.rglob("*.trace"))),
    }
    return {
        "overall_status": overall,
        "preflight_status": preflight_status,
        "preflight": preflight,
        "gates": aggregate,
        "cases": cases,
        "screenshot_index": screenshot_index,
        "artifact_counts": artifact_counts,
        "missing_evidence": sorted(set(missing)),
    }


def render_markdown(report: Mapping[str, Any]) -> str:
    lines = [
        "# Browser Artifact Summary",
        "",
        f"Overall status: {report['overall_status']}",
        f"Preflight status: {report.get('preflight_status', 'blocked')}",
        "",
        "## Gates",
        "",
        "| Gate | Status |",
        "|---|---|",
    ]
    for gate, status in report["gates"].items():
        lines.append(f"| {gate} | {status} |")
    lines.extend(["", "## Screenshot index", "", "| Case | Kind | Phase | Path |", "|---|---|---|---|"])
    for item in report.get("screenshot_index", []):
        lines.append(f"| {item['case_id']} | {item['kind']} | {item['phase']} | {item['path']} |")
    if not report.get("screenshot_index"):
        lines.append("| None |  |  |  |")
    lines.extend(["", "## Missing evidence", ""])
    missing = report.get("missing_evidence", [])
    lines.extend([f"- {item}" for item in missing] if missing else ["- None"])
    lines.extend(["", "## Cases and retry history", ""])
    for case in report.get("cases", []):
        lines.append(f"- {case.get('case_id', case.get('source', 'unknown'))}: {len(case.get('retry_history', []))} attempt(s)")
    return "\n".join(lines) + "\n"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Summarize Chrome QA artifacts without masking missing evidence.")
    parser.add_argument("qa_root", type=Path)
    parser.add_argument("--json-output", type=Path)
    parser.add_argument("--markdown-output", type=Path)
    parser.add_argument("--force", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    outputs = [path for path in (args.json_output, args.markdown_output) if path]
    if len({path.resolve() for path in outputs}) != len(outputs):
        print("error: output paths must be distinct.", file=sys.stderr)
        return 2
    existing = [str(path) for path in outputs if path.exists()]
    if existing and not args.force:
        print(f"error: output already exists: {', '.join(existing)}", file=sys.stderr)
        return 2
    report = summarize_artifacts(args.qa_root)
    if args.json_output:
        atomic_write_text(args.json_output, json.dumps(report, indent=2) + "\n")
    if args.markdown_output:
        atomic_write_text(args.markdown_output, render_markdown(report))
    print(json.dumps(report, indent=2))
    return 0 if report["overall_status"] == "approved" else 1 if report["overall_status"] == "failed" else 2


if __name__ == "__main__":
    raise SystemExit(main())
