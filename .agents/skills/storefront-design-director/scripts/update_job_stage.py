from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any, Mapping

from common import (
    STAGES,
    DesignJobError,
    load_data,
    resolve_job_path,
    stage_number,
    utc_now,
    validate_transition,
    write_data,
)


GATE_EVIDENCE_TARGETS = {
    "DIRECTION_APPROVAL",
    "COMPONENT_ANATOMY",
    "HANDOFF_VALIDATION",
    "IMPLEMENTATION_AWAITED",
    "CHROME_QA_EXECUTION",
    "FINAL_APPROVAL",
    "ARCHIVED",
}
PASS_VALUES = {"passed", "approved", "waived", "not-applicable"}


def approval_status(manifest: Mapping[str, Any], name: str) -> str:
    approvals = manifest.get("approvals", {})
    if not isinstance(approvals, Mapping):
        return ""
    value = approvals.get(name, {})
    return str(value.get("status", "")) if isinstance(value, Mapping) else str(value)


def require_approved_qa_summary(
    manifest: Mapping[str, Any],
    evidence: list[str],
    job_root: Path,
) -> Path:
    qa = manifest.get("qa")
    if not isinstance(qa, Mapping):
        raise DesignJobError("QA status is missing.")
    summary_value = qa.get("summary_path")
    if not isinstance(summary_value, str) or not summary_value:
        raise DesignJobError("A reconciled browser artifact summary path is required.")
    if summary_value not in evidence:
        raise DesignJobError("The reconciled browser artifact summary must be transition evidence.")
    summary_path = resolve_job_path(job_root, summary_value)
    if not summary_path.is_file():
        raise DesignJobError("The reconciled browser artifact summary does not exist.")
    summary = load_data(summary_path)
    if summary.get("overall_status") != "approved":
        raise DesignJobError("The reconciled browser artifact summary is not approved.")
    return summary_path


def enforce_gate(
    manifest: Mapping[str, Any],
    target: str,
    evidence: list[str],
    job_root: Path,
) -> None:
    if target in GATE_EVIDENCE_TARGETS and not evidence:
        raise DesignJobError(f"{target} requires at least one recorded evidence path.")
    if target == "COMPONENT_ANATOMY" and approval_status(manifest, "design") != "approved":
        raise DesignJobError("Design approval is required before component anatomy.")
    if target == "IMPLEMENTATION_AWAITED" and approval_status(manifest, "handoff") != "approved":
        raise DesignJobError("Handoff approval is required before implementation.")
    qa = manifest.get("qa", {})
    if target == "CHROME_QA_EXECUTION":
        if not isinstance(qa, Mapping) or qa.get("preflight_status") != "passed":
            raise DesignJobError("Chrome QA preflight must pass before execution.")
    if target == "FINAL_APPROVAL":
        if not isinstance(qa, Mapping):
            raise DesignJobError("QA status is missing.")
        required = [
            "execution_status",
            "baseline_status",
            "console_status",
            "network_status",
            "accessibility_status",
            "lighthouse_status",
            "performance_status",
            "visual_diff_status",
            "non_regression_status",
        ]
        failures = [key for key in required if str(qa.get(key, "")) not in PASS_VALUES]
        if failures:
            raise DesignJobError(f"Final approval is blocked by QA fields: {', '.join(failures)}")
        require_approved_qa_summary(manifest, evidence, job_root)
    if target == "ARCHIVED":
        final = manifest.get("approvals", {}).get("final", {})
        if not isinstance(final, Mapping) or any(
            not final.get(field) for field in ("status", "approver", "at", "revision")
        ) or final.get("status") != "approved":
            raise DesignJobError("Complete final approval is required before archiving.")
        require_approved_qa_summary(manifest, evidence, job_root)
        handoff = manifest.get("handoff")
        package_value = handoff.get("package_path") if isinstance(handoff, Mapping) else None
        if not isinstance(package_value, str) or not package_value:
            raise DesignJobError("An approved handoff package path is required before archiving.")
        if not resolve_job_path(job_root, package_value).is_file():
            raise DesignJobError("The approved handoff package does not exist.")
        qa = manifest.get("qa")
        baseline_paths = qa.get("baseline_paths") if isinstance(qa, Mapping) else None
        if not isinstance(qa, Mapping) or qa.get("baseline_status") not in {"passed", "approved"}:
            raise DesignJobError("Approved regression baselines are required before archiving.")
        if not isinstance(baseline_paths, list) or not baseline_paths:
            raise DesignJobError("At least one immutable regression baseline path is required.")
        for baseline_value in baseline_paths:
            if not isinstance(baseline_value, str) or not resolve_job_path(job_root, baseline_value).is_file():
                raise DesignJobError(f"Regression baseline does not exist: {baseline_value}")


def update_stage(
    manifest_path: Path,
    target: str,
    reason: str,
    evidence: list[str] | None = None,
    decision_change: bool = False,
    affected_artifacts: list[str] | None = None,
    now: str | None = None,
) -> dict[str, Any]:
    if not reason.strip():
        raise DesignJobError("A transition reason is required.")
    manifest = load_data(manifest_path)
    job = manifest.get("job")
    if not isinstance(job, dict):
        raise DesignJobError("Manifest job section is invalid.")
    current = str(job.get("stage", ""))
    resume_stage = job.get("resume_stage")
    validate_transition(current, target, str(resume_stage) if resume_stage else None)
    evidence = evidence or []
    affected_artifacts = affected_artifacts or []
    for relative in evidence:
        if not resolve_job_path(manifest_path.parent, relative).is_file():
            raise DesignJobError(f"Transition evidence does not exist: {relative}")
    if decision_change and not affected_artifacts:
        raise DesignJobError(
            "A changed decision must identify at least one affected artifact."
        )
    registry = manifest.get("artifacts", {})
    current_artifacts = registry.get("current", {}) if isinstance(registry, Mapping) else {}
    for relative in affected_artifacts:
        path = resolve_job_path(manifest_path.parent, relative)
        key = path.relative_to(manifest_path.parent.resolve()).as_posix()
        if not path.is_file() or key not in current_artifacts:
            raise DesignJobError(f"Affected artifact is missing or unregistered: {relative}")
    enforce_gate(manifest, target, evidence, manifest_path.parent)

    current_number = stage_number(current)
    target_number = stage_number(target)
    backward = (
        current_number is not None
        and target_number is not None
        and target_number < current_number
    )
    if backward or decision_change:
        job["revision"] = int(job.get("revision", 1)) + 1
    timestamp = now or utc_now()
    if target in {"PAUSED", "BLOCKED"}:
        job["resume_stage"] = current
        job["status"] = target.lower()
    elif target == "CANCELLED":
        job["resume_stage"] = None
        job["status"] = "cancelled"
    else:
        job["resume_stage"] = None
        if target == "IMPLEMENTATION_AWAITED":
            job["status"] = "ready-for-handoff"
        elif target == "CHROME_QA_EXECUTION":
            job["status"] = "qa-running"
        elif target == "FINAL_APPROVAL":
            job["status"] = "approved"
        elif target == "ARCHIVED":
            job["status"] = "archived"
        else:
            job["status"] = "active"
    job["stage"] = target
    job["updated_at"] = timestamp
    history = manifest.setdefault("history", [])
    if not isinstance(history, list):
        raise DesignJobError("Manifest history must be a list.")
    history.append(
        {
            "sequence": len(history) + 1,
            "at": timestamp,
            "from": current,
            "to": target,
            "revision": job["revision"],
            "reason": reason,
            "evidence": evidence,
            "affected_artifacts": affected_artifacts,
        }
    )
    write_data(manifest_path, manifest)
    return manifest


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Apply a legal design-job stage transition.")
    parser.add_argument("manifest", type=Path)
    parser.add_argument("target", choices=list(STAGES) + ["PAUSED", "BLOCKED", "CANCELLED"])
    parser.add_argument("--reason", required=True)
    parser.add_argument("--evidence", action="append", default=[])
    parser.add_argument("--decision-change", action="store_true")
    parser.add_argument("--affected-artifact", action="append", default=[])
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        manifest = update_stage(
            args.manifest,
            args.target,
            args.reason,
            args.evidence,
            args.decision_change,
            args.affected_artifact,
        )
    except DesignJobError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(f"{manifest['job']['id']}: {manifest['job']['stage']} r{manifest['job']['revision']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
