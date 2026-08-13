from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Mapping

from common import (
    ALL_STAGES,
    SCHEMA_VERSION,
    STAGES,
    DesignJobError,
    add_issue,
    load_data,
    read_artifact_metadata,
    reference_paths,
    resolve_job_path,
    sha256_file,
    slugify,
    validate_artifact_root,
)


REQUIRED_TOP_LEVEL = [
    "job",
    "scope",
    "viewports",
    "references",
    "decisions",
    "states",
    "responsive",
    "accessibility",
    "handoff",
    "qa",
    "approvals",
    "artifacts",
    "history",
]
STAGE_ARTIFACTS = {
    "SCOPE": ["component-brief.md"],
    "REFERENCE_INTAKE": ["screenshot-inventory.yaml"],
    "VISUAL_ANALYSIS": ["visual-audit.md"],
    "DIRECTION_APPROVAL": ["direction-comparison.md"],
    "COMPONENT_ANATOMY": ["locked-decisions.yaml", "component-anatomy.md"],
    "STATE_CONTRACT": ["state-matrix.md"],
    "RESPONSIVE_CONTRACT": ["responsive-contract.md"],
    "INTERACTION_ACCESSIBILITY": [
        "interaction-contract.md",
        "accessibility-checklist.md",
    ],
    "TOKENS_GEOMETRY": ["design-tokens.json", "content-stress-cases.yaml"],
    "HANDOFF_ASSEMBLY": [
        "implementation-handoff.md",
        "codex-task.md",
        "acceptance-criteria.md",
        "browser-test-plan.yaml",
    ],
    "CHROME_QA_EXECUTION": ["browser-test-report.md", "visual-qa-report.md"],
    "VISUAL_REMEDIATION": ["remediation-list.md"],
    "FINAL_APPROVAL": ["approval-record.yaml"],
}


def validate_design_job(manifest_path: Path) -> dict[str, Any]:
    blocking: list[dict[str, str]] = []
    advisory: list[dict[str, str]] = []
    try:
        manifest = load_data(manifest_path)
    except DesignJobError as error:
        add_issue(blocking, "manifest-read", str(error), str(manifest_path))
        return {"valid": False, "blocking": blocking, "advisory": advisory}

    if manifest.get("schema_version") != SCHEMA_VERSION:
        add_issue(
            blocking,
            "schema-version",
            f"Expected schema_version {SCHEMA_VERSION}.",
            str(manifest_path),
        )
    for key in REQUIRED_TOP_LEVEL:
        if key not in manifest:
            add_issue(blocking, "missing-section", f"Missing top-level section: {key}", key)

    job = manifest.get("job", {})
    if not isinstance(job, Mapping):
        add_issue(blocking, "job-shape", "job must be a mapping.", "job")
        stage = ""
    else:
        stage = str(job.get("stage", ""))
        for key in ("id", "title", "status", "stage", "revision", "repository", "artifact_root"):
            if job.get(key) in (None, ""):
                add_issue(blocking, "missing-job-field", f"job.{key} is required.", f"job.{key}")
        if stage not in ALL_STAGES:
            add_issue(blocking, "unknown-stage", f"Unknown stage: {stage}", "job.stage")
        revision = job.get("revision")
        if not isinstance(revision, int) or revision < 1:
            add_issue(blocking, "revision", "job.revision must be a positive integer.", "job.revision")
        job_id = str(job.get("id", ""))
        if job_id:
            try:
                if slugify(job_id) != job_id:
                    add_issue(blocking, "job-id", "job.id must be lowercase kebab-case.", "job.id")
            except DesignJobError as error:
                add_issue(blocking, "job-id", str(error), "job.id")
        repository_value = job.get("repository")
        artifact_root_value = job.get("artifact_root")
        if isinstance(repository_value, str) and isinstance(artifact_root_value, str):
            repository = Path(repository_value)
            artifact_root = Path(artifact_root_value)
            if not repository.is_dir():
                add_issue(blocking, "repository", "Recorded repository does not exist.", "job.repository")
            else:
                try:
                    validate_artifact_root(repository, artifact_root)
                except DesignJobError as error:
                    add_issue(blocking, "artifact-root", str(error), "job.artifact_root")
            if artifact_root.resolve() / job_id != manifest_path.parent.resolve():
                add_issue(
                    blocking,
                    "manifest-location",
                    "Manifest location does not match job.artifact_root and job.id.",
                    str(manifest_path),
                )
        resume_stage = job.get("resume_stage")
        if stage in {"PAUSED", "BLOCKED"}:
            if resume_stage not in STAGES:
                add_issue(blocking, "resume-stage", "Special stage requires a valid resume_stage.", "job.resume_stage")
        elif resume_stage is not None:
            add_issue(blocking, "resume-stage", "Active or terminal stage must not retain resume_stage.", "job.resume_stage")

    job_root = manifest_path.parent
    for relative in reference_paths(manifest):
        try:
            path = resolve_job_path(job_root, relative)
        except DesignJobError as error:
            add_issue(blocking, "unsafe-reference", str(error), relative)
            continue
        if not path.is_file():
            add_issue(blocking, "missing-reference", "Referenced file does not exist.", relative)

    effective_stage = stage
    if stage in {"PAUSED", "BLOCKED"} and isinstance(job, Mapping):
        effective_stage = str(job.get("resume_stage", ""))
    if effective_stage in STAGES:
        required_paths: list[str] = []
        effective_index = STAGES.index(effective_stage)
        for artifact_stage, paths in STAGE_ARTIFACTS.items():
            if artifact_stage in STAGES and STAGES.index(artifact_stage) <= effective_index:
                required_paths.extend(paths)
        for relative in sorted(set(required_paths)):
            if not (job_root / relative).is_file():
                add_issue(
                    blocking,
                    "missing-stage-artifact",
                    f"{effective_stage} cumulatively requires {relative}.",
                    relative,
                )

    qa = manifest.get("qa", {})
    if isinstance(qa, Mapping) and qa.get("chrome_mcp_required") is not True:
        add_issue(
            blocking,
            "chrome-gate-disabled",
            "qa.chrome_mcp_required must remain true.",
            "qa.chrome_mcp_required",
        )
    if isinstance(qa, Mapping) and (
        qa.get("profile_policy") != "default-profile-only"
        or qa.get("allow_isolated_context") is not False
    ):
        add_issue(
            blocking,
            "chrome-profile-policy",
            "QA must use the connected default Chrome profile without an isolated context.",
            "qa.profile_policy",
        )

    artifacts = manifest.get("artifacts", {})
    if not isinstance(artifacts, Mapping) or artifacts.get("immutable_after_approval") is not True:
        add_issue(blocking, "artifact-registry", "Artifact registry is missing or mutable.", "artifacts")
    else:
        current = artifacts.get("current", {})
        superseded = artifacts.get("superseded", [])
        if not isinstance(current, Mapping) or not isinstance(superseded, list):
            add_issue(blocking, "artifact-registry", "Artifact registry shape is invalid.", "artifacts")
        else:
            for key, record in current.items():
                if not isinstance(key, str) or not isinstance(record, Mapping):
                    add_issue(blocking, "artifact-record", "Artifact record is invalid.", str(key))
                    continue
                try:
                    path = resolve_job_path(job_root, key)
                except DesignJobError as error:
                    add_issue(blocking, "unsafe-artifact", str(error), key)
                    continue
                if not path.is_file():
                    add_issue(blocking, "missing-artifact", "Registered artifact is missing.", key)
                    continue
                metadata = read_artifact_metadata(path)
                if metadata is None:
                    add_issue(blocking, "artifact-metadata", "Artifact metadata is missing.", key)
                    continue
                for field in ("status", "revision"):
                    if metadata.get(field) != record.get(field):
                        add_issue(
                            blocking,
                            "artifact-metadata",
                            f"Artifact {field} does not match its registry record.",
                            key,
                        )
                if isinstance(job, Mapping) and metadata.get("job_id") != job.get("id"):
                    add_issue(blocking, "artifact-job-id", "Artifact job ID is inconsistent.", key)
                record_revision = record.get("revision")
                if (
                    isinstance(job, Mapping)
                    and isinstance(record_revision, int)
                    and isinstance(job.get("revision"), int)
                    and record_revision > job["revision"]
                ):
                    add_issue(blocking, "artifact-revision", "Artifact revision exceeds job revision.", key)
                digest = sha256_file(path)
                if digest != record.get("sha256"):
                    target = blocking if record.get("status") == "approved" else advisory
                    code = "approved-artifact-mutated" if target is blocking else "artifact-checksum-stale"
                    add_issue(target, code, "Artifact checksum differs from its registry record.", key)
                if record.get("status") == "approved":
                    if not record.get("approved_by") or not record.get("approved_at") or not record.get("evidence"):
                        add_issue(blocking, "artifact-approval", "Approved artifact lacks approval evidence.", key)
    history = manifest.get("history")
    if not isinstance(history, list) or not history:
        add_issue(blocking, "history", "Transition history must be a non-empty list.", "history")
    elif any(
        not isinstance(item, Mapping) or item.get("sequence") != index
        for index, item in enumerate(history, start=1)
    ):
        add_issue(blocking, "history-sequence", "History sequence values must be contiguous.", "history")
    elif isinstance(job, Mapping) and history[-1].get("to") != stage:
        add_issue(blocking, "history-stage", "Latest history target must match job.stage.", "history")
    elif isinstance(job, Mapping):
        revisions = [item.get("revision") for item in history if isinstance(item, Mapping)]
        if any(not isinstance(value, int) or value < 1 for value in revisions):
            add_issue(blocking, "history-revision", "History revisions must be positive integers.", "history")
        elif revisions != sorted(revisions) or revisions[-1] > job.get("revision", 0):
            add_issue(blocking, "history-revision", "History revisions must be monotonic and bounded by job.revision.", "history")

    references = manifest.get("references", {})
    if isinstance(references, Mapping) and not references.get("approved"):
        add_issue(
            advisory,
            "no-approved-references",
            "No visual or structural reference has been approved yet.",
            "references.approved",
        )
    return {
        "valid": not blocking,
        "manifest": str(manifest_path),
        "stage": stage,
        "blocking": blocking,
        "advisory": advisory,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate a storefront design-job manifest.")
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--json", action="store_true", dest="as_json")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    report = validate_design_job(args.manifest)
    if args.as_json:
        print(json.dumps(report, indent=2))
    else:
        for severity in ("blocking", "advisory"):
            for issue in report[severity]:
                print(f"{severity}: {issue['code']}: {issue['message']} ({issue['path']})")
        print("valid" if report["valid"] else "invalid")
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
