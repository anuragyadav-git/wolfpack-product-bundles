from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Mapping


SCHEMA_VERSION = 1
STAGES = (
    "DISCOVERY",
    "SCOPE",
    "REFERENCE_INTAKE",
    "REFERENCE_VALIDATION",
    "VISUAL_ANALYSIS",
    "DIRECTION_EXPLORATION",
    "DIRECTION_APPROVAL",
    "COMPONENT_ANATOMY",
    "STATE_CONTRACT",
    "RESPONSIVE_CONTRACT",
    "INTERACTION_ACCESSIBILITY",
    "TOKENS_GEOMETRY",
    "PROTOTYPE_OPTIONAL",
    "HANDOFF_ASSEMBLY",
    "HANDOFF_VALIDATION",
    "IMPLEMENTATION_AWAITED",
    "CHROME_QA_PREFLIGHT",
    "CHROME_QA_EXECUTION",
    "VISUAL_REMEDIATION",
    "FINAL_APPROVAL",
    "ARCHIVED",
)
SPECIAL_STAGES = ("PAUSED", "BLOCKED", "CANCELLED")
ALL_STAGES = STAGES + SPECIAL_STAGES
ARTIFACT_STATUSES = {"draft", "complete", "approved"}
REVISION_TARGETS = {
    "SCOPE",
    "DIRECTION_EXPLORATION",
    "COMPONENT_ANATOMY",
    "STATE_CONTRACT",
    "RESPONSIVE_CONTRACT",
    "INTERACTION_ACCESSIBILITY",
    "TOKENS_GEOMETRY",
    "HANDOFF_ASSEMBLY",
    "CHROME_QA_PREFLIGHT",
    "VISUAL_REMEDIATION",
}
PRODUCTION_ARTIFACT_PARTS = {
    "app",
    "assets",
    "build",
    "dist",
    "extensions",
    "node_modules",
    "public",
}
SENSITIVE_PARTS = {
    ".env",
    "auth",
    "authorization",
    "cookie",
    "credential",
    "password",
    "private-key",
    "secret",
    "session",
    "token",
}


class DesignJobError(RuntimeError):
    pass


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    if not slug:
        raise DesignJobError("The title must contain at least one letter or number.")
    return slug[:72].rstrip("-")


def load_data(path: Path) -> dict[str, Any]:
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as error:
        raise DesignJobError(f"Cannot read {path}: {error}") from error
    try:
        data = json.loads(text)
    except json.JSONDecodeError as json_error:
        try:
            import yaml  # type: ignore
        except ModuleNotFoundError as error:
            raise DesignJobError(
                f"{path} is not JSON-compatible YAML. Install PyYAML to read block YAML, "
                "or keep the manifest in the generated JSON-compatible YAML format."
            ) from error
        try:
            data = yaml.safe_load(text)
        except Exception as error:
            raise DesignJobError(f"Cannot parse {path}: {error}") from json_error
    if not isinstance(data, dict):
        raise DesignJobError(f"{path} must contain a top-level mapping.")
    return data


def atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.",
        suffix=".tmp",
        dir=path.parent,
        text=True,
    )
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise


def write_data(path: Path, data: Mapping[str, Any]) -> None:
    atomic_write_text(path, json.dumps(data, indent=2, sort_keys=False) + "\n")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def repository_metadata(repository: Path) -> dict[str, str]:
    result = {"branch": "", "commit": ""}
    commands = {
        "branch": ["git", "-C", str(repository), "branch", "--show-current"],
        "commit": ["git", "-C", str(repository), "rev-parse", "HEAD"],
    }
    for key, command in commands.items():
        try:
            completed = subprocess.run(
                command,
                check=False,
                capture_output=True,
                text=True,
                timeout=5,
            )
        except (OSError, subprocess.TimeoutExpired):
            continue
        if completed.returncode == 0:
            result[key] = completed.stdout.strip()
    return result


def resolve_job_path(job_root: Path, value: str) -> Path:
    root = job_root.resolve()
    candidate = (root / value).resolve()
    try:
        candidate.relative_to(root)
    except ValueError as error:
        raise DesignJobError(f"Artifact path escapes the design job: {value}") from error
    return candidate


def is_sensitive_path(path: Path) -> bool:
    lowered = "-".join(part.lower() for part in path.parts)
    return any(part in lowered for part in SENSITIVE_PARTS)


def validate_artifact_root(repository: Path, artifact_root: Path) -> None:
    repo = repository.resolve()
    target = artifact_root.resolve()
    try:
        relative = target.relative_to(repo)
    except ValueError as error:
        raise DesignJobError(
            f"Design jobs must remain inside the repository: {target}"
        ) from error
    if not relative.parts:
        raise DesignJobError("The repository root cannot be used as the artifact root.")
    lowered = {part.lower() for part in relative.parts}
    if lowered & PRODUCTION_ARTIFACT_PARTS:
        raise DesignJobError(
            f"Design jobs cannot be stored in a production or generated asset path: {target}"
        )


def stage_number(stage: str) -> int | None:
    try:
        return STAGES.index(stage) + 1
    except ValueError:
        return None


def validate_transition(current: str, target: str, resume_stage: str | None = None) -> None:
    if current not in ALL_STAGES:
        raise DesignJobError(f"Unknown current stage: {current}")
    if target not in ALL_STAGES:
        raise DesignJobError(f"Unknown target stage: {target}")
    if current == target:
        raise DesignJobError(f"The job is already at {target}.")
    if current == "CANCELLED":
        raise DesignJobError("A cancelled job cannot transition.")
    if current == "ARCHIVED":
        raise DesignJobError(
            "An archived job is immutable. Create a linked successor job for a new revision."
        )
    if current in {"PAUSED", "BLOCKED"}:
        if target == "CANCELLED":
            return
        if target != resume_stage:
            raise DesignJobError(
                f"{current} may resume only at {resume_stage or 'its recorded resume stage'}."
            )
        return
    if target in SPECIAL_STAGES:
        return
    current_index = STAGES.index(current)
    target_index = STAGES.index(target)
    if target_index == current_index + 1:
        return
    if target_index < current_index and target in REVISION_TARGETS:
        return
    raise DesignJobError(f"Illegal stage transition: {current} -> {target}")


def reference_paths(manifest: Mapping[str, Any]) -> Iterable[str]:
    references = manifest.get("references", {})
    if not isinstance(references, Mapping):
        return []
    found: list[str] = []
    for key in ("current", "target", "context", "approved", "implementation"):
        items = references.get(key, [])
        if not isinstance(items, list):
            continue
        for item in items:
            if isinstance(item, str):
                found.append(item)
            elif isinstance(item, Mapping) and isinstance(item.get("path"), str):
                found.append(str(item["path"]))
    return found


def read_artifact_metadata(path: Path) -> dict[str, Any] | None:
    if path.suffix.lower() in {".json", ".yaml", ".yml"}:
        data = load_data(path)
        if not {"job_id", "revision", "status"}.issubset(data):
            return None
        return {
            "job_id": data.get("job_id"),
            "revision": data.get("revision"),
            "status": data.get("status"),
        }
    if path.suffix.lower() != ".md":
        return None
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as error:
        raise DesignJobError(f"Cannot read artifact metadata from {path}: {error}") from error
    fields: dict[str, Any] = {}
    patterns = {
        "job_id": r"(?m)^Artifact job ID:\s*(.*?)\s*$",
        "revision": r"(?m)^Artifact revision:\s*(.*?)\s*$",
        "status": r"(?m)^Artifact status:\s*(.*?)\s*$",
    }
    for key, pattern in patterns.items():
        match = re.search(pattern, text)
        if not match:
            return None
        fields[key] = match.group(1)
    try:
        fields["revision"] = int(fields["revision"])
    except (TypeError, ValueError):
        pass
    return fields


def write_artifact_metadata(
    path: Path,
    *,
    job_id: str,
    revision: int,
    status: str,
) -> None:
    if status not in ARTIFACT_STATUSES:
        raise DesignJobError(f"Unsupported artifact status: {status}")
    if path.suffix.lower() in {".json", ".yaml", ".yml"}:
        data = load_data(path)
        if not {"job_id", "revision", "status"}.issubset(data):
            raise DesignJobError(f"Artifact does not expose metadata fields: {path}")
        data["job_id"] = job_id
        data["revision"] = revision
        data["status"] = status
        write_data(path, data)
        return
    if path.suffix.lower() != ".md":
        raise DesignJobError(f"Unsupported artifact metadata format: {path}")
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as error:
        raise DesignJobError(f"Cannot read artifact metadata from {path}: {error}") from error
    if "Artifact status:" not in text:
        raise DesignJobError(f"Markdown artifact lacks an Artifact status field: {path}")
    if "Artifact job ID:" not in text:
        text = text.replace(
            "Artifact status:",
            f"Artifact job ID: {job_id}\nArtifact revision: {revision}\nArtifact status:",
            1,
        )
    text = re.sub(
        r"(?m)^Artifact job ID:.*$",
        f"Artifact job ID: {job_id}",
        text,
        count=1,
    )
    text = re.sub(
        r"(?m)^Artifact revision:.*$",
        f"Artifact revision: {revision}",
        text,
        count=1,
    )
    text = re.sub(
        r"(?m)^Artifact status:.*$",
        f"Artifact status: {status}",
        text,
        count=1,
    )
    atomic_write_text(path, text)


def add_issue(
    collection: list[dict[str, str]],
    code: str,
    message: str,
    path: str = "",
) -> None:
    collection.append({"code": code, "message": message, "path": path})
