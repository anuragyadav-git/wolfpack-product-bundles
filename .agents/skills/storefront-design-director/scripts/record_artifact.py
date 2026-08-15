from __future__ import annotations

import argparse
import json
import sys
from copy import deepcopy
from pathlib import Path
from typing import Any

from common import (
    ARTIFACT_STATUSES,
    DesignJobError,
    load_data,
    resolve_job_path,
    sha256_file,
    utc_now,
    write_artifact_metadata,
    write_data,
)


def record_artifact(
    manifest_path: Path,
    artifact: str,
    status: str,
    *,
    approver: str = "",
    evidence: list[str] | None = None,
    supersede_approved: bool = False,
    reason: str = "",
    now: str | None = None,
) -> dict[str, Any]:
    if status not in ARTIFACT_STATUSES:
        raise DesignJobError(f"Unsupported artifact status: {status}")
    manifest = load_data(manifest_path)
    job = manifest.get("job")
    artifacts = manifest.get("artifacts")
    if not isinstance(job, dict) or not isinstance(artifacts, dict):
        raise DesignJobError("Manifest job or artifacts section is invalid.")
    current = artifacts.get("current")
    superseded = artifacts.get("superseded")
    if not isinstance(current, dict) or not isinstance(superseded, list):
        raise DesignJobError("Manifest artifact registry is invalid.")

    path = resolve_job_path(manifest_path.parent, artifact)
    if not path.is_file():
        raise DesignJobError(f"Artifact does not exist: {artifact}")
    key = path.relative_to(manifest_path.parent.resolve()).as_posix()
    existing = current.get(key)
    if not isinstance(existing, dict):
        raise DesignJobError(f"Artifact is not registered in the design job: {key}")

    evidence = evidence or []
    evidence_paths: list[str] = []
    for relative in evidence:
        evidence_path = resolve_job_path(manifest_path.parent, relative)
        if not evidence_path.is_file():
            raise DesignJobError(f"Approval evidence does not exist: {relative}")
        evidence_paths.append(
            evidence_path.relative_to(manifest_path.parent.resolve()).as_posix()
        )
    if status == "approved" and (not approver.strip() or not evidence_paths):
        raise DesignJobError(
            "Approved artifacts require an approver and at least one evidence path."
        )

    timestamp = now or utc_now()
    existing_status = str(existing.get("status", ""))
    existing_hash = str(existing.get("sha256", ""))
    current_hash = sha256_file(path)
    if existing_status == "approved":
        if (
            not supersede_approved
            and status == "approved"
            and current_hash == existing_hash
        ):
            return manifest
        if not supersede_approved:
            raise DesignJobError(
                "Approved artifacts are immutable. Supersede the approval in a new revision."
            )
        if not reason.strip():
            raise DesignJobError("Superseding an approved artifact requires a reason.")
        old_record = deepcopy(existing)
        old_record.update(
            {
                "superseded_at": timestamp,
                "superseded_by": approver,
                "superseded_reason": reason,
            }
        )
        superseded.append(old_record)
        existing_revision = int(existing.get("revision", 1))
        if int(job.get("revision", 1)) <= existing_revision:
            job["revision"] = existing_revision + 1
        history = manifest.get("history")
        if not isinstance(history, list):
            raise DesignJobError("Manifest history must be a list.")
        history.append(
            {
                "sequence": len(history) + 1,
                "at": timestamp,
                "from": job.get("stage"),
                "to": job.get("stage"),
                "revision": job["revision"],
                "reason": reason,
                "evidence": evidence_paths,
                "event": "artifact-superseded",
                "affected_artifacts": [key],
            }
        )
    elif supersede_approved:
        raise DesignJobError("Only an approved artifact can be superseded.")

    revision = int(job.get("revision", 1))
    write_artifact_metadata(
        path,
        job_id=str(job.get("id", "")),
        revision=revision,
        status=status,
    )
    current[key] = {
        "path": key,
        "status": status,
        "revision": revision,
        "sha256": sha256_file(path),
        "approved_by": approver if status == "approved" else "",
        "approved_at": timestamp if status == "approved" else "",
        "evidence": evidence_paths if status == "approved" else [],
    }
    job["updated_at"] = timestamp
    write_data(manifest_path, manifest)
    return manifest


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Record artifact status and checksum without mutating approved history."
    )
    parser.add_argument("manifest", type=Path)
    parser.add_argument("artifact")
    parser.add_argument("status", choices=sorted(ARTIFACT_STATUSES))
    parser.add_argument("--approver", default="")
    parser.add_argument("--evidence", action="append", default=[])
    parser.add_argument("--supersede-approved", action="store_true")
    parser.add_argument("--reason", default="")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        manifest = record_artifact(
            args.manifest,
            args.artifact,
            args.status,
            approver=args.approver,
            evidence=args.evidence,
            supersede_approved=args.supersede_approved,
            reason=args.reason,
        )
    except DesignJobError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    record = manifest["artifacts"]["current"][args.artifact]
    print(json.dumps(record, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
