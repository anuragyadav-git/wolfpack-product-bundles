from __future__ import annotations

import argparse
import copy
import json
from collections import Counter
from pathlib import Path
from typing import Any, Mapping

from common import atomic_write_text
from run_skill_evals import (
    EvalValidationError,
    expected_expectation_ids,
    load_json,
    load_jsonl,
)


def synthesize_no_production_check(row: Mapping[str, Any]) -> dict[str, Any]:
    matches = [
        item
        for item in row["grading"]["critical_failures"]
        if item.get("id") == "production-code-modified"
    ]
    if len(matches) != 1:
        raise EvalValidationError(
            f"result {row.get('case_id', 'unknown')} requires exactly one "
            "production-code-modified critical grade to derive the routing check."
        )
    critical = matches[0]
    return {
        "text": "no_production_code_change",
        "passed": not bool(critical["present"]),
        "evidence": (
            "Derived from critical grade production-code-modified: "
            + str(critical["evidence"])
        ),
    }


def normalize_result_row(
    row: Mapping[str, Any],
    cases_by_id: Mapping[str, Mapping[str, Any]],
    rubric: Mapping[str, Any],
) -> dict[str, Any]:
    normalized = copy.deepcopy(dict(row))
    case_id = str(normalized.get("case_id", ""))
    if case_id not in cases_by_id:
        raise EvalValidationError(f"Cannot normalize unknown case_id: {case_id}")
    case_record = cases_by_id[case_id]
    suite = str(case_record["suite"])
    case = case_record["case"]
    if suite != "invocation":
        normalized["result"]["invocation_decision"] = "not_applicable"

    existing = normalized["grading"]["expectations"]
    existing_ids = [str(item["text"]) for item in existing]
    duplicates = sorted(
        value for value, count in Counter(existing_ids).items() if count > 1
    )
    if duplicates:
        raise EvalValidationError(
            f"result {case_id} has duplicate expectations: {', '.join(duplicates)}"
        )
    by_id = {str(item["text"]): item for item in existing}
    desired_ids = expected_expectation_ids(case, suite, rubric)
    reordered: list[dict[str, Any]] = []
    for expectation_id in desired_ids:
        if expectation_id in by_id:
            reordered.append(copy.deepcopy(by_id[expectation_id]))
        elif suite == "invocation" and expectation_id == "no_production_code_change":
            reordered.append(synthesize_no_production_check(normalized))
        else:
            raise EvalValidationError(
                f"result {case_id} cannot derive required expectation {expectation_id}."
            )
    normalized["grading"]["expectations"] = reordered
    return normalized


def build_case_index(skill_root: Path) -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    eval_root = skill_root / "evals"
    invocation = load_jsonl(eval_root / "invocation-cases.jsonl", "invocation cases")
    workflow = load_jsonl(eval_root / "workflow-cases.jsonl", "workflow cases")
    browser = load_jsonl(eval_root / "browser-qa-cases.jsonl", "browser QA cases")
    cases_by_id = {
        **{row["id"]: {"suite": "invocation", "case": row} for row in invocation},
        **{row["id"]: {"suite": "workflow", "case": row} for row in workflow},
        **{row["id"]: {"suite": "browser_qa", "case": row} for row in browser},
    }
    rubric = load_json(eval_root / "rubric.json", "rubric")
    return cases_by_id, rubric


def normalize_results(input_path: Path, output_path: Path, skill_root: Path) -> int:
    rows = load_jsonl(input_path, "model results")
    cases_by_id, rubric = build_case_index(skill_root)
    normalized = [normalize_result_row(row, cases_by_id, rubric) for row in rows]
    atomic_write_text(
        output_path,
        "".join(json.dumps(row, separators=(",", ":")) + "\n" for row in normalized),
    )
    return len(normalized)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Regrade saved storefront-design-director results against the current eval contract."
    )
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument(
        "--skill-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        count = normalize_results(
            args.input.resolve(), args.output.resolve(), args.skill_root.resolve()
        )
    except EvalValidationError as error:
        print(f"error: {error}")
        return 2
    print(f"normalized {count} result rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
