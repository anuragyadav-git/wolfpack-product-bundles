from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

from common import (
    DesignJobError,
    load_data,
    repository_metadata,
    sha256_file,
    slugify,
    utc_now,
    validate_artifact_root,
    write_artifact_metadata,
    write_data,
)


DIRECTORIES = [
    "references",
    "directions",
    "prototype",
    "handoff",
    "history",
    "qa/screenshots",
    "qa/snapshots",
    "qa/baselines",
    "qa/diffs",
    "qa/console",
    "qa/network",
    "qa/accessibility",
    "qa/lighthouse",
    "qa/performance",
    "qa/results",
]


def skill_root() -> Path:
    return Path(__file__).resolve().parents[1]


def default_artifact_root(repository: Path) -> Path:
    settings = load_data(skill_root() / "assets/templates/settings.yaml")
    configured = settings.get("artifact_root", "design-jobs")
    if not isinstance(configured, str) or not configured.strip():
        raise DesignJobError("settings.yaml artifact_root must be a non-empty string.")
    return repository / configured


def create_design_job(
    title: str,
    repository: Path,
    root: Path | None = None,
    job_id: str | None = None,
    owner: str = "",
    product: str = "",
    resume: bool = False,
    now: str | None = None,
) -> Path:
    repository = repository.resolve()
    if not repository.is_dir():
        raise DesignJobError(f"Repository does not exist: {repository}")
    timestamp = now or utc_now()
    generated_id = job_id or f"{slugify(title)}-{timestamp[:10].replace('-', '')}"
    if generated_id != slugify(generated_id):
        raise DesignJobError("job_id must already be lowercase kebab-case.")
    artifact_root = (root or default_artifact_root(repository)).resolve()
    validate_artifact_root(repository, artifact_root)
    destination = artifact_root / generated_id
    manifest_path = destination / "design-job.yaml"
    if destination.exists():
        if resume and manifest_path.is_file():
            existing = load_data(manifest_path)
            existing_job = existing.get("job")
            if not isinstance(existing_job, dict):
                raise DesignJobError("Existing design job has an invalid job section.")
            if existing_job.get("id") != generated_id:
                raise DesignJobError("Existing design job ID does not match the requested job.")
            if existing_job.get("title") != title:
                raise DesignJobError(
                    "Existing design job title does not match. Resume with its original title."
                )
            if Path(str(existing_job.get("repository", ""))).resolve() != repository:
                raise DesignJobError(
                    "Existing design job belongs to a different repository."
                )
            return destination
        raise DesignJobError(
            f"Design job already exists: {destination}. Use --resume to continue it."
        )

    templates = skill_root() / "assets/templates"
    if not templates.is_dir():
        raise DesignJobError(f"Skill templates are missing: {templates}")
    destination.mkdir(parents=True)
    try:
        for relative in DIRECTORIES:
            (destination / relative).mkdir(parents=True, exist_ok=True)
        for source in sorted(templates.iterdir()):
            if source.is_file():
                shutil.copy2(source, destination / source.name)
        manifest = load_data(manifest_path)
        metadata = repository_metadata(repository)
        manifest["job"].update(
            {
                "id": generated_id,
                "title": title,
                "status": "active",
                "stage": "DISCOVERY",
                "revision": 1,
                "created_at": timestamp,
                "updated_at": timestamp,
                "owner": owner,
                "product": product,
                "repository": str(repository),
                "branch": metadata["branch"],
                "commit": metadata["commit"],
                "artifact_root": str(artifact_root),
                "resume_stage": None,
            }
        )
        artifact_registry: dict[str, dict[str, object]] = {}
        for path in sorted(destination.iterdir()):
            if not path.is_file() or path.name in {"design-job.yaml", "settings.yaml"}:
                continue
            try:
                write_artifact_metadata(
                    path,
                    job_id=generated_id,
                    revision=1,
                    status="draft",
                )
            except DesignJobError:
                continue
            artifact_registry[path.name] = {
                "path": path.name,
                "status": "draft",
                "revision": 1,
                "sha256": sha256_file(path),
                "approved_by": "",
                "approved_at": "",
                "evidence": [],
            }
        manifest["artifacts"] = {
            "immutable_after_approval": True,
            "current": artifact_registry,
            "superseded": [],
        }
        manifest["history"] = [
            {
                "sequence": 1,
                "at": timestamp,
                "from": None,
                "to": "DISCOVERY",
                "revision": 1,
                "reason": "Design job created",
                "evidence": [],
            }
        ]
        write_data(manifest_path, manifest)
    except Exception:
        shutil.rmtree(destination, ignore_errors=True)
        raise
    return destination


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Create or resume a repository-scoped storefront design job."
    )
    parser.add_argument("title", help="Human-readable design job title.")
    parser.add_argument("--repository", type=Path, default=Path.cwd())
    parser.add_argument("--root", type=Path, help="Override the configured artifact root.")
    parser.add_argument("--job-id", help="Stable lowercase kebab-case job ID.")
    parser.add_argument("--owner", default="")
    parser.add_argument("--product", default="")
    parser.add_argument("--resume", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        path = create_design_job(
            title=args.title,
            repository=args.repository,
            root=args.root,
            job_id=args.job_id,
            owner=args.owner,
            product=args.product,
            resume=args.resume,
        )
    except DesignJobError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
