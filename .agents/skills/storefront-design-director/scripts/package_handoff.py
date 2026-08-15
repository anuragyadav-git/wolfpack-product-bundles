from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
import zipfile
from pathlib import Path
from typing import Any, Mapping

from common import (
    DesignJobError,
    is_sensitive_path,
    load_data,
    resolve_job_path,
    sha256_file,
)
from validate_handoff import REQUIRED_ARTIFACTS, validate_handoff


PACKAGE_FILES = list(dict.fromkeys(REQUIRED_ARTIFACTS + ["design-job.yaml"]))


def approved_reference_paths(manifest: Mapping[str, Any]) -> list[str]:
    references = manifest.get("references", {})
    approved = references.get("approved", []) if isinstance(references, Mapping) else []
    result: list[str] = []
    for item in approved:
        value = item.get("path") if isinstance(item, Mapping) else item
        if isinstance(value, str):
            result.append(value)
    return result


def package_handoff(job_root: Path, output: Path, force: bool = False) -> dict[str, Any]:
    job_root = job_root.resolve()
    manifest_path = job_root / "design-job.yaml"
    validation = validate_handoff(manifest_path)
    if not validation["valid"]:
        codes = ", ".join(item["code"] for item in validation["blocking"])
        raise DesignJobError(f"Handoff validation failed: {codes}")
    if output.exists() and not force:
        raise DesignJobError(f"Output already exists: {output}. Use --force to replace it.")
    manifest = load_data(manifest_path)
    candidates = PACKAGE_FILES + approved_reference_paths(manifest)
    selected: dict[str, Path] = {}
    excluded: list[dict[str, str]] = []
    for relative in candidates:
        path = resolve_job_path(job_root, relative)
        if not path.is_file():
            continue
        normalized = path.relative_to(job_root).as_posix()
        if is_sensitive_path(Path(normalized)) or any(
            part.startswith(".") or part.endswith((".tmp", ".log"))
            for part in Path(normalized).parts
        ) or "failed" in normalized.lower() or "browser-profile" in normalized.lower():
            excluded.append({"path": normalized, "reason": "sensitive-or-transient"})
            continue
        selected[normalized] = path

    files = [
        {"path": relative, "sha256": sha256_file(path), "bytes": path.stat().st_size}
        for relative, path in sorted(selected.items())
    ]
    package_manifest = {
        "schema_version": 1,
        "job_id": manifest["job"]["id"],
        "revision": manifest["job"]["revision"],
        "source_updated_at": manifest["job"]["updated_at"],
        "files": files,
        "excluded": excluded,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{output.name}.",
        suffix=".tmp",
        dir=output.parent,
    )
    os.close(descriptor)
    temporary = Path(temporary_name)
    try:
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for relative, path in sorted(selected.items()):
                info = zipfile.ZipInfo(relative, date_time=(1980, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o644 << 16
                archive.writestr(info, path.read_bytes())
            info = zipfile.ZipInfo("MANIFEST.json", date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(
                info,
                json.dumps(package_manifest, indent=2, sort_keys=True).encode("utf-8") + b"\n",
            )
        os.replace(temporary, output)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise
    return package_manifest


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Create a deterministic approved handoff archive.")
    parser.add_argument("job_root", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--force", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        result = package_handoff(args.job_root, args.output, args.force)
    except DesignJobError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
