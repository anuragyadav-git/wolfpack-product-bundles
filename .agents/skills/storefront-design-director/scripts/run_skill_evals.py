from __future__ import annotations

import argparse
import json
import statistics
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Mapping

from common import atomic_write_text


INVOCATION_MINIMUMS = {
    "should_invoke": 13,
    "should_not_invoke": 11,
    "ambiguous": 7,
}
EXPECTED_WORKFLOW_IDS = {f"workflow-{index:02d}" for index in range(1, 31)}
MODEL_CONFIGURATIONS = {"with_skill", "without_skill", "old_skill"}
MODEL_STATUSES = {"passed", "failed", "blocked"}
QUALITATIVE_SCORE_MINIMUM = 1
QUALITATIVE_SCORE_MAXIMUM = 5
INVOCATION_DECISIONS = {"invoke", "defer", "ask_minimal_scope", "not_applicable"}
ROUTING_DIMENSIONS = {
    "completeness_without_overwhelming",
    "evidence_discipline",
    "recovery_from_incomplete_inputs",
}


class EvalValidationError(RuntimeError):
    pass


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace(
        "+00:00", "Z"
    )


def load_json(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except OSError as error:
        raise EvalValidationError(f"Cannot read {label}: {path}: {error}") from error
    except json.JSONDecodeError as error:
        raise EvalValidationError(
            f"Invalid JSON in {label} at line {error.lineno}: {path}"
        ) from error
    if not isinstance(value, dict):
        raise EvalValidationError(f"{label} must contain a top-level object: {path}")
    return value


def load_jsonl(path: Path, label: str) -> list[dict[str, Any]]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as error:
        raise EvalValidationError(f"Cannot read {label}: {path}: {error}") from error
    rows: list[dict[str, Any]] = []
    for line_number, line in enumerate(lines, start=1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as error:
            raise EvalValidationError(
                f"Invalid JSONL in {label} at line {line_number}: {error.msg}"
            ) from error
        if not isinstance(row, dict):
            raise EvalValidationError(
                f"{label} line {line_number} must contain an object."
            )
        rows.append(row)
    if not rows:
        raise EvalValidationError(f"{label} contains no cases: {path}")
    return rows


def require_fields(row: Mapping[str, Any], fields: Iterable[str], label: str) -> None:
    missing = [field for field in fields if field not in row]
    if missing:
        raise EvalValidationError(f"{label} is missing fields: {', '.join(missing)}")


def require_nonempty_strings(row: Mapping[str, Any], fields: Iterable[str], label: str) -> None:
    for field in fields:
        if not isinstance(row.get(field), str) or not str(row[field]).strip():
            raise EvalValidationError(f"{label} field {field} must be a non-empty string.")


def require_nonempty_lists(row: Mapping[str, Any], fields: Iterable[str], label: str) -> None:
    for field in fields:
        if not isinstance(row.get(field), list) or not row[field]:
            raise EvalValidationError(f"{label} field {field} must be a non-empty list.")


def validate_unique_ids(rows: list[dict[str, Any]], label: str) -> set[str]:
    ids: list[str] = []
    for index, row in enumerate(rows, start=1):
        value = row.get("id")
        if not isinstance(value, str) or not value:
            raise EvalValidationError(f"{label} row {index} requires a non-empty id.")
        ids.append(value)
    duplicates = sorted(value for value, count in Counter(ids).items() if count > 1)
    if duplicates:
        raise EvalValidationError(f"{label} has duplicate ids: {', '.join(duplicates)}")
    return set(ids)


def validate_invocation_cases(rows: list[dict[str, Any]]) -> dict[str, Any]:
    validate_unique_ids(rows, "invocation cases")
    counts: Counter[str] = Counter()
    for row in rows:
        label = f"invocation case {row.get('id', 'unknown')}"
        require_fields(
            row,
            [
                "schema_version",
                "id",
                "category",
                "coverage",
                "prompt",
                "expected_behavior",
                "expected_intent",
                "max_questions",
                "expected_checks",
                "forbidden_behaviors",
                "execution",
                "execution_mode",
                "applicable_dimensions",
                "workflow_followups",
                "reason",
            ],
            label,
        )
        require_nonempty_strings(
            row,
            ["id", "category", "prompt", "expected_behavior", "expected_intent", "reason"],
            label,
        )
        require_nonempty_lists(row, ["coverage", "expected_checks", "forbidden_behaviors"], label)
        category = str(row["category"])
        if category not in INVOCATION_MINIMUMS:
            raise EvalValidationError(f"{label} has unknown category: {category}")
        counts[category] += 1
        if row.get("execution") != "model":
            raise EvalValidationError(f"{label} execution must be model.")
        if row.get("execution_mode") != "routing_only":
            raise EvalValidationError(f"{label} execution_mode must be routing_only.")
        if not isinstance(row.get("workflow_followups"), list):
            raise EvalValidationError(f"{label} workflow_followups must be a list.")
        applicable_dimensions = row.get("applicable_dimensions")
        if (
            not isinstance(applicable_dimensions, list)
            or set(applicable_dimensions) != ROUTING_DIMENSIONS
            or len(applicable_dimensions) != len(ROUTING_DIMENSIONS)
        ):
            raise EvalValidationError(
                f"{label} must declare the exact routing-only qualitative dimensions."
            )
        if category == "should_invoke":
            if row["expected_checks"] != [
                "status_block_present",
                "no_production_code_change",
            ]:
                raise EvalValidationError(
                    f"{label} must grade routing checks separately from workflow follow-ups."
                )
            if not row["workflow_followups"]:
                raise EvalValidationError(
                    f"{label} requires at least one downstream workflow follow-up."
                )
        if not isinstance(row.get("max_questions"), int) or row["max_questions"] < 0:
            raise EvalValidationError(f"{label} max_questions must be a non-negative integer.")
        if category == "ambiguous":
            if row.get("expected_behavior") not in {"ask_minimal_scope", "defer"}:
                raise EvalValidationError(f"{label} must ask minimal scope or defer.")
            if row["max_questions"] > 1:
                raise EvalValidationError(f"{label} may ask at most one routing question.")
            if "does_not_assume_design_scope" not in row["expected_checks"]:
                raise EvalValidationError(f"{label} must prohibit assumed design scope.")
    if len(rows) < 30:
        raise EvalValidationError("Invocation suite must contain at least 30 cases.")
    for category, minimum in INVOCATION_MINIMUMS.items():
        if counts[category] < minimum:
            raise EvalValidationError(
                f"Invocation category {category} requires at least {minimum} cases; found {counts[category]}."
            )
    return {"total": len(rows), "categories": dict(sorted(counts.items()))}


def validate_workflow_cases(rows: list[dict[str, Any]]) -> dict[str, Any]:
    ids = validate_unique_ids(rows, "workflow cases")
    if ids != EXPECTED_WORKFLOW_IDS:
        missing = sorted(EXPECTED_WORKFLOW_IDS - ids)
        extra = sorted(ids - EXPECTED_WORKFLOW_IDS)
        raise EvalValidationError(
            f"Workflow cases must be workflow-01 through workflow-30; missing={missing}, extra={extra}."
        )
    severities: Counter[str] = Counter()
    for row in rows:
        label = f"workflow case {row.get('id', 'unknown')}"
        require_fields(
            row,
            [
                "schema_version",
                "id",
                "name",
                "prompt",
                "expected_stage",
                "required_references",
                "expected_checks",
                "expected_artifacts",
                "severity",
                "execution",
            ],
            label,
        )
        require_nonempty_strings(
            row, ["id", "name", "prompt", "expected_stage", "severity"], label
        )
        require_nonempty_lists(
            row, ["required_references", "expected_checks", "expected_artifacts"], label
        )
        if row.get("severity") not in {"critical", "high", "medium"}:
            raise EvalValidationError(f"{label} has an invalid severity.")
        if row.get("execution") != "model":
            raise EvalValidationError(f"{label} execution must be model.")
        severities[str(row["severity"])] += 1
    return {"total": len(rows), "severities": dict(sorted(severities.items()))}


def validate_browser_cases(
    rows: list[dict[str, Any]], qualitative_dimensions: set[str]
) -> dict[str, Any]:
    validate_unique_ids(rows, "browser QA cases")
    for row in rows:
        label = f"browser QA case {row.get('id', 'unknown')}"
        require_fields(row, ["id", "prompt", "checks", "applicable_dimensions"], label)
        require_nonempty_strings(row, ["id", "prompt"], label)
        require_nonempty_lists(row, ["checks", "applicable_dimensions"], label)
        configured = row["applicable_dimensions"]
        if any(not isinstance(value, str) or not value for value in configured):
            raise EvalValidationError(
                f"{label} applicable_dimensions must contain non-empty strings."
            )
        if len(set(configured)) != len(configured):
            raise EvalValidationError(
                f"{label} applicable_dimensions must not contain duplicates."
            )
        unknown = set(configured) - qualitative_dimensions
        if unknown:
            raise EvalValidationError(
                f"{label} has unknown applicable dimensions: "
                + ", ".join(sorted(unknown))
            )
    return {"total": len(rows)}


def validate_rubric(rubric: Mapping[str, Any]) -> dict[str, Any]:
    for field in (
        "concrete_checks",
        "qualitative_dimensions",
        "score_scale",
        "passing_thresholds",
        "critical_failures",
    ):
        if field not in rubric:
            raise EvalValidationError(f"rubric.json is missing {field}.")
    concrete = rubric["concrete_checks"]
    dimensions = rubric["qualitative_dimensions"]
    critical = rubric["critical_failures"]
    if not isinstance(concrete, Mapping) or len(concrete) < 13:
        raise EvalValidationError("rubric.json requires all concrete checks.")
    if not isinstance(dimensions, Mapping) or len(dimensions) != 12:
        raise EvalValidationError("rubric.json requires exactly 12 qualitative dimensions.")
    if not isinstance(critical, list) or len(critical) != 10:
        raise EvalValidationError("rubric.json requires exactly 10 critical failures.")
    critical_ids = [item.get("id") for item in critical if isinstance(item, Mapping)]
    if len(set(critical_ids)) != 10:
        raise EvalValidationError("rubric.json critical failure ids must be unique.")
    thresholds = rubric["passing_thresholds"]
    if not isinstance(thresholds, Mapping):
        raise EvalValidationError("rubric.json passing_thresholds must be an object.")
    if thresholds.get("require_all_concrete_checks") is not True:
        raise EvalValidationError("All concrete checks must be required.")
    if thresholds.get("require_no_critical_failures") is not True:
        raise EvalValidationError("Critical failures must fail a run.")
    critical_dimensions = thresholds.get("critical_dimensions")
    if not isinstance(critical_dimensions, list) or not critical_dimensions:
        raise EvalValidationError("Rubric critical_dimensions must be a non-empty list.")
    unknown_critical_dimensions = set(critical_dimensions) - set(dimensions)
    if unknown_critical_dimensions:
        raise EvalValidationError(
            "Rubric critical_dimensions are unknown: "
            + ", ".join(sorted(unknown_critical_dimensions))
        )
    return {
        "concrete_checks": len(concrete),
        "qualitative_dimensions": len(dimensions),
        "critical_failures": len(critical),
    }


def build_catalog(
    invocation: list[dict[str, Any]],
    workflow: list[dict[str, Any]],
    browser: list[dict[str, Any]],
) -> dict[str, Any]:
    evals: list[dict[str, Any]] = []
    for suite, rows in (
        ("invocation", invocation),
        ("workflow", workflow),
        ("browser_qa", browser),
    ):
        for row in rows:
            checks = row.get("expected_checks", row.get("checks", []))
            evals.append(
                {
                    "id": len(evals) + 1,
                    "case_id": row["id"],
                    "suite": suite,
                    "prompt": row["prompt"],
                    "expected_output": (
                        row.get("expected_behavior")
                        or row.get("expected_stage")
                        or "Satisfies every listed check without false passes."
                    ),
                    "files": [],
                    "expectations": list(checks),
                }
            )
    return {"skill_name": "storefront-design-director", "evals": evals}


def unique_in_order(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            result.append(value)
    return result


def applicable_dimensions_for_case(
    case: Mapping[str, Any],
    suite: str,
    rubric: Mapping[str, Any],
) -> list[str]:
    all_dimensions = set(rubric["qualitative_dimensions"])
    configured = case.get("applicable_dimensions")
    if configured is None:
        configured = (
            sorted(ROUTING_DIMENSIONS)
            if suite == "invocation"
            else sorted(all_dimensions)
        )
    if not isinstance(configured, list) or not configured:
        raise EvalValidationError(
            f"case {case.get('id', 'unknown')} requires applicable_dimensions."
        )
    if any(not isinstance(value, str) or not value for value in configured):
        raise EvalValidationError(
            f"case {case.get('id', 'unknown')} applicable_dimensions must be strings."
        )
    if len(set(configured)) != len(configured):
        raise EvalValidationError(
            f"case {case.get('id', 'unknown')} has duplicate applicable_dimensions."
        )
    unknown = set(configured) - all_dimensions
    if unknown:
        raise EvalValidationError(
            f"case {case.get('id', 'unknown')} has unknown applicable dimensions: "
            + ", ".join(sorted(unknown))
        )
    return list(configured)


def expected_expectation_ids(
    case: Mapping[str, Any],
    suite: str,
    rubric: Mapping[str, Any],
) -> list[str]:
    if suite == "invocation":
        return unique_in_order(
            ["correct_invocation"]
            + list(case.get("expected_checks", []))
            + ["question_limit"]
            + [
                f"forbidden_behavior_absent:{behavior}"
                for behavior in case.get("forbidden_behaviors", [])
            ]
        )
    if suite == "workflow":
        return unique_in_order(
            list(rubric["concrete_checks"]) + list(case.get("expected_checks", []))
        )
    if suite == "browser_qa":
        return unique_in_order(list(case.get("checks", [])))
    raise EvalValidationError(f"Unknown eval suite: {suite}")


def validate_suite_routing_decision(
    row: Mapping[str, Any], case: Mapping[str, Any], suite: str
) -> None:
    decision = row["result"]["invocation_decision"]
    if suite in {"workflow", "browser_qa"}:
        if decision != "not_applicable":
            raise EvalValidationError(
                f"{suite} case {row['case_id']} must use invocation_decision=not_applicable."
            )
        return
    expected = case.get("expected_behavior")
    if expected == "invoke" and decision != "invoke":
        raise EvalValidationError(
            f"invocation case {row['case_id']} expected invoke, observed {decision}."
        )
    if expected == "non_invoke" and decision not in {"defer", "not_applicable"}:
        raise EvalValidationError(
            f"invocation case {row['case_id']} expected non-invocation, observed {decision}."
        )
    if expected in {"ask_minimal_scope", "defer"} and decision != expected:
        raise EvalValidationError(
            f"invocation case {row['case_id']} expected {expected}, observed {decision}."
        )


def derive_run_evaluation(
    row: Mapping[str, Any],
    case: Mapping[str, Any],
    suite: str,
    rubric: Mapping[str, Any],
) -> dict[str, Any]:
    validate_suite_routing_decision(row, case, suite)
    label = f"model result {row['case_id']} {row['configuration']} run {row['run_number']}"
    expected_ids = expected_expectation_ids(case, suite, rubric)
    expectation_rows = row["grading"]["expectations"]
    actual_ids = [str(item["text"]) for item in expectation_rows]
    duplicate_expectations = sorted(
        value for value, count in Counter(actual_ids).items() if count > 1
    )
    if duplicate_expectations:
        raise EvalValidationError(
            f"{label} has duplicate graded expectations: "
            + ", ".join(duplicate_expectations)
        )
    missing_expectations = sorted(set(expected_ids) - set(actual_ids))
    extra_expectations = sorted(set(actual_ids) - set(expected_ids))
    if missing_expectations or extra_expectations:
        raise EvalValidationError(
            f"{label} expectation coverage mismatch; "
            f"missing={missing_expectations}, extra={extra_expectations}."
        )

    critical_rows = row["grading"]["critical_failures"]
    actual_critical_ids = [str(item["id"]) for item in critical_rows]
    duplicate_critical_ids = sorted(
        value for value, count in Counter(actual_critical_ids).items() if count > 1
    )
    expected_critical_ids = {str(item["id"]) for item in rubric["critical_failures"]}
    missing_critical_ids = sorted(expected_critical_ids - set(actual_critical_ids))
    extra_critical_ids = sorted(set(actual_critical_ids) - expected_critical_ids)
    if duplicate_critical_ids or missing_critical_ids or extra_critical_ids:
        raise EvalValidationError(
            f"{label} critical-failure coverage mismatch; "
            f"duplicates={duplicate_critical_ids}, missing={missing_critical_ids}, "
            f"extra={extra_critical_ids}."
        )

    applicable_names = applicable_dimensions_for_case(case, suite, rubric)
    supplied_scores = row["grading"]["qualitative_scores"]
    applicable_scores = {name: int(supplied_scores[name]) for name in applicable_names}
    thresholds = rubric["passing_thresholds"]
    threshold_failures: list[str] = []
    run_mean = statistics.mean(applicable_scores.values())
    if run_mean < float(thresholds["mean_score"]):
        threshold_failures.append(
            f"mean_score {run_mean:.3f} < {thresholds['mean_score']}"
        )
    minimum_score = min(applicable_scores.values())
    if minimum_score < int(thresholds["minimum_dimension"]):
        threshold_failures.append(
            f"minimum_dimension {minimum_score} < {thresholds['minimum_dimension']}"
        )
    critical_minimum = int(thresholds["critical_dimensions_minimum"])
    for name in thresholds["critical_dimensions"]:
        if name in applicable_scores and applicable_scores[name] < critical_minimum:
            threshold_failures.append(
                f"critical_dimension {name}={applicable_scores[name]} < {critical_minimum}"
            )

    failed_expectations = [
        str(item["text"]) for item in expectation_rows if not item["passed"]
    ]
    present_critical_failures = [
        str(item["id"]) for item in critical_rows if item["present"]
    ]
    failure_reasons: list[str] = []
    if failed_expectations:
        failure_reasons.append("failed_expectations")
    if threshold_failures:
        failure_reasons.append("rubric_thresholds")
    if present_critical_failures:
        failure_reasons.append("critical_failures")
    if int(row["executor"]["exit_code"]) != 0:
        failure_reasons.append("executor_failed")
    return {
        "status": "failed" if failure_reasons else "passed",
        "workflow_outcome": str(row["result"]["status"]),
        "failure_reasons": failure_reasons,
        "failed_expectations": failed_expectations,
        "threshold_failures": threshold_failures,
        "present_critical_failures": present_critical_failures,
        "applicable_scores": applicable_scores,
        "mean_score": round(run_mean, 3),
    }


def validate_unique_result_keys(rows: list[dict[str, Any]]) -> None:
    keys = [
        (str(row["case_id"]), str(row["configuration"]), int(row["run_number"]))
        for row in rows
    ]
    duplicates = sorted(key for key, count in Counter(keys).items() if count > 1)
    if duplicates:
        formatted = ", ".join(f"{case}/{config}/run-{run}" for case, config, run in duplicates)
        raise EvalValidationError(f"model results have duplicate result keys: {formatted}")


def derive_release_status(counts: Mapping[str, Any]) -> str:
    if not counts.get("provided"):
        return "failed"
    if int(counts.get("executed", 0)) != int(counts.get("expected", 0)):
        return "failed"
    for field in (
        "failed",
        "blocked",
        "invalid",
        "unexecuted",
        "critical",
        "threshold_failed",
    ):
        if int(counts.get(field, 0)) != 0:
            return "failed"
    if counts.get("aggregate_threshold_failures"):
        return "failed"
    return "passed"


def validate_model_result(
    row: Mapping[str, Any],
    expected_ids: set[str],
    qualitative_dimensions: set[str],
    line_number: int,
) -> dict[str, Any]:
    label = f"model result line {line_number}"
    require_fields(
        row,
        ["case_id", "configuration", "run_number", "executor", "result", "grading"],
        label,
    )
    case_id = row.get("case_id")
    if case_id not in expected_ids:
        raise EvalValidationError(f"{label} has an unknown case_id: {case_id}")
    if row.get("configuration") not in MODEL_CONFIGURATIONS:
        raise EvalValidationError(f"{label} has an invalid configuration.")
    if not isinstance(row.get("run_number"), int) or row["run_number"] < 1:
        raise EvalValidationError(f"{label} run_number must be a positive integer.")
    executor = row.get("executor")
    result = row.get("result")
    grading = row.get("grading")
    if not isinstance(executor, Mapping):
        raise EvalValidationError(f"{label} executor must be an object.")
    require_fields(executor, ["model", "codex_cli_version", "exit_code", "duration_ms", "total_tokens"], label)
    if not isinstance(result, Mapping):
        raise EvalValidationError(f"{label} result must be an object.")
    require_fields(result, ["status", "invocation_decision", "response_file", "artifact_files"], label)
    if result.get("status") not in MODEL_STATUSES:
        raise EvalValidationError(f"{label} result status is invalid.")
    if result.get("invocation_decision") not in {"invoke", "defer", "ask_minimal_scope", "not_applicable"}:
        raise EvalValidationError(f"{label} invocation_decision is invalid.")
    if not isinstance(result.get("response_file"), str) or not result["response_file"]:
        raise EvalValidationError(f"{label} response_file is required.")
    if not isinstance(result.get("artifact_files"), list):
        raise EvalValidationError(f"{label} artifact_files must be a list.")
    if not isinstance(grading, Mapping):
        raise EvalValidationError(f"{label} grading must be an object.")
    require_fields(grading, ["expectations", "qualitative_scores", "critical_failures"], label)
    expectations = grading.get("expectations")
    if not isinstance(expectations, list) or not expectations:
        raise EvalValidationError(f"{label} requires graded expectations.")
    for expectation in expectations:
        if not isinstance(expectation, Mapping) or set(expectation) != {"text", "passed", "evidence"}:
            raise EvalValidationError(
                f"{label} expectation fields must be text, passed, and evidence."
            )
        if not isinstance(expectation.get("passed"), bool) or not expectation.get("evidence"):
            raise EvalValidationError(f"{label} expectation lacks a boolean grade or evidence.")
    scores = grading.get("qualitative_scores")
    if not isinstance(scores, Mapping) or set(scores) != qualitative_dimensions:
        raise EvalValidationError(f"{label} must score all qualitative dimensions.")
    if any(
        not isinstance(score, int)
        or score < QUALITATIVE_SCORE_MINIMUM
        or score > QUALITATIVE_SCORE_MAXIMUM
        for score in scores.values()
    ):
        raise EvalValidationError(f"{label} qualitative scores must be integers from 1 to 5.")
    failures = grading.get("critical_failures")
    if not isinstance(failures, list):
        raise EvalValidationError(f"{label} critical_failures must be a list.")
    for failure in failures:
        if not isinstance(failure, Mapping) or set(failure) != {"id", "present", "evidence"}:
            raise EvalValidationError(
                f"{label} critical failure fields must be id, present, and evidence."
            )
        if not isinstance(failure.get("present"), bool) or not failure.get("evidence"):
            raise EvalValidationError(f"{label} critical failure lacks evidence.")
    normalized = dict(row)
    normalized["case_id"] = str(case_id)
    return normalized


def summarize_model_results(
    rows: list[dict[str, Any]],
    cases_by_id: Mapping[str, Mapping[str, Any]],
    invocation_by_id: Mapping[str, Mapping[str, Any]],
    rubric: Mapping[str, Any],
) -> dict[str, Any]:
    expected_ids = set(cases_by_id)

    def latest_rows(configuration: str) -> dict[str, dict[str, Any]]:
        selected: dict[str, dict[str, Any]] = {}
        for row in rows:
            if row.get("configuration") != configuration:
                continue
            case_id = str(row["case_id"])
            current = selected.get(case_id)
            if current is None or int(row["run_number"]) > int(current["run_number"]):
                selected[case_id] = row
        return selected

    current_by_case = latest_rows("with_skill")
    baseline_by_case = latest_rows("old_skill")
    executed_ids = set(current_by_case)
    evaluations: dict[str, dict[str, Any]] = {}
    for case_id, row in sorted(current_by_case.items()):
        case_record = cases_by_id[case_id]
        evaluations[case_id] = derive_run_evaluation(
            row,
            case_record["case"],
            str(case_record["suite"]),
            rubric,
        )
    statuses = Counter(item["status"] for item in evaluations.values())
    workflow_outcomes = Counter(
        item["workflow_outcome"] for item in evaluations.values()
    )
    critical_failures = []
    for case_id, row in sorted(current_by_case.items()):
        for failure in row["grading"]["critical_failures"]:
            if failure["present"]:
                critical_failures.append(
                    {
                        "case_id": case_id,
                        "id": failure["id"],
                        "evidence": failure["evidence"],
                    }
                )
    binary_ids = {
        case_id
        for case_id, case in invocation_by_id.items()
        if case["category"] in {"should_invoke", "should_not_invoke"}
    }
    invocation_metrics: dict[str, Any] | None = None
    if binary_ids.issubset(executed_ids):
        confusion = Counter()
        for case_id in binary_ids:
            expected = invocation_by_id[case_id]["expected_behavior"] == "invoke"
            predicted = current_by_case[case_id]["result"]["invocation_decision"] == "invoke"
            confusion["tp" if expected and predicted else "fn" if expected else "fp" if predicted else "tn"] += 1
        precision = confusion["tp"] / (confusion["tp"] + confusion["fp"]) if confusion["tp"] + confusion["fp"] else 0.0
        recall = confusion["tp"] / (confusion["tp"] + confusion["fn"]) if confusion["tp"] + confusion["fn"] else 0.0
        invocation_metrics = {
            **{key: confusion[key] for key in ("tp", "fp", "fn", "tn")},
            "precision": round(precision, 4),
            "recall": round(recall, 4),
        }
    score_values: dict[str, list[int]] = {
        name: [] for name in rubric["qualitative_dimensions"]
    }
    for evaluation in evaluations.values():
        for name, score in evaluation["applicable_scores"].items():
            score_values[name].append(int(score))
    rubric_scores = {
        name: round(statistics.mean(values), 3) if values else None
        for name, values in sorted(score_values.items())
    }
    aggregate_threshold_failures: list[str] = []
    thresholds = rubric["passing_thresholds"]
    all_applicable_values = [score for values in score_values.values() for score in values]
    if all_applicable_values:
        aggregate_mean = statistics.mean(all_applicable_values)
        if aggregate_mean < float(thresholds["mean_score"]):
            aggregate_threshold_failures.append(
                f"aggregate mean {aggregate_mean:.3f} < {thresholds['mean_score']}"
            )
    else:
        aggregate_mean = None
    for name, mean_score in rubric_scores.items():
        if mean_score is None:
            continue
        if mean_score < float(thresholds["minimum_dimension"]):
            aggregate_threshold_failures.append(
                f"aggregate dimension {name}={mean_score} < {thresholds['minimum_dimension']}"
            )
        if (
            name in thresholds["critical_dimensions"]
            and mean_score < float(thresholds["critical_dimensions_minimum"])
        ):
            aggregate_threshold_failures.append(
                f"aggregate critical dimension {name}={mean_score} < "
                f"{thresholds['critical_dimensions_minimum']}"
            )

    baseline_statuses: Counter[str] = Counter()
    for case_id, row in sorted(baseline_by_case.items()):
        case_record = cases_by_id[case_id]
        baseline = derive_run_evaluation(
            row,
            case_record["case"],
            str(case_record["suite"]),
            rubric,
        )
        baseline_statuses[baseline["status"]] += 1
    unexecuted = sorted(expected_ids - executed_ids)
    threshold_failed = sum(
        bool(item["threshold_failures"]) for item in evaluations.values()
    )
    return {
        "provided": bool(current_by_case),
        "expected": len(expected_ids),
        "executed": len(executed_ids),
        "passed": statuses["passed"],
        "failed": statuses["failed"],
        "blocked": statuses["blocked"],
        "unexecuted": len(unexecuted),
        "invalid": 0,
        "critical": len(critical_failures),
        "threshold_failed": threshold_failed,
        "unexecuted_case_ids": unexecuted,
        "invocation_metrics": invocation_metrics,
        "rubric_scores": rubric_scores,
        "rubric_mean": round(aggregate_mean, 3) if aggregate_mean is not None else None,
        "aggregate_threshold_failures": aggregate_threshold_failures,
        "critical_failures": critical_failures,
        "workflow_outcomes": dict(sorted(workflow_outcomes.items())),
        "baseline_results": {
            "provided": bool(baseline_by_case),
            "executed": len(baseline_by_case),
            "passed": baseline_statuses["passed"],
            "failed": baseline_statuses["failed"],
            "blocked": baseline_statuses["blocked"],
        },
        "scenario_results": [
            {
                "case_id": case_id,
                "suite": cases_by_id[case_id]["suite"],
                "status": evaluations[case_id]["status"],
                "workflow_outcome": evaluations[case_id]["workflow_outcome"],
                "failure_reasons": evaluations[case_id]["failure_reasons"],
                "threshold_failures": evaluations[case_id]["threshold_failures"],
            }
            for case_id in sorted(current_by_case)
        ],
    }


def render_markdown(summary: Mapping[str, Any]) -> str:
    counts = summary["case_counts"]
    model = summary["model_results"]
    lines = [
        "---",
        "schema_version: 1",
        "id: storefront-design-director-eval-summary",
        "title: Storefront Design Director Eval Summary",
        "type: skill-eval-result",
        "status: active",
        "summary: Records deterministic validation and separately reports model-dependent execution evidence.",
        "last_audited: 2026-08-04",
        "owners:",
        "  - Aditya Awasthi",
        "domains:",
        "  - skill-evaluation",
        "systems:",
        "  - storefront-design-director",
        "source_paths:",
        "  - .agents/skills/storefront-design-director/evals",
        "related_docs:",
        "  - .agents/skills/storefront-design-director/EVAL_REPORT.md",
        "tags:",
        "  - eval",
        "keywords:",
        "  - regression",
        "---",
        "",
        "# Eval Summary",
        "",
        f"- Deterministic status: {summary['deterministic_status']}",
        f"- Model status: {summary['model_status']}",
        f"- Overall status: {summary['overall_status']}",
        f"- Invocation cases: {counts['invocation']}",
        f"- Workflow cases: {counts['workflow']}",
        f"- Browser QA cases: {counts['browser_qa']}",
        "",
        "## Deterministic checks",
        "",
    ]
    lines.extend(
        f"- {item['id']}: {item['status']} - {item['evidence']}"
        for item in summary["deterministic_checks"]
    )
    lines.extend(
        [
            "",
            "## Model-dependent execution",
            "",
            f"- Executed unique cases: {model['executed']}",
            f"- Unexecuted unique cases: {model['unexecuted']}",
            f"- Passed runs: {model['passed']}",
            f"- Failed runs: {model['failed']}",
            f"- Blocked runs: {model['blocked']}",
            "",
            (
                "Unexecuted cases remain unexecuted; deterministic fixture validation never converts them to passes."
                if model["unexecuted"]
                else "All model-dependent cases executed; evaluation status is derived independently from workflow outcomes."
            ),
        ]
    )
    return "\n".join(lines) + "\n"


def run_evals(
    skill_root: Path,
    output_dir: Path,
    model_results_path: Path | None = None,
    sync_catalog: bool = False,
) -> dict[str, Any]:
    eval_root = skill_root / "evals"
    invocation = load_jsonl(eval_root / "invocation-cases.jsonl", "invocation cases")
    workflow = load_jsonl(eval_root / "workflow-cases.jsonl", "workflow cases")
    browser = load_jsonl(eval_root / "browser-qa-cases.jsonl", "browser QA cases")
    rubric = load_json(eval_root / "rubric.json", "rubric")
    invocation_check = validate_invocation_cases(invocation)
    workflow_check = validate_workflow_cases(workflow)
    rubric_check = validate_rubric(rubric)
    browser_check = validate_browser_cases(
        browser, set(rubric["qualitative_dimensions"])
    )
    catalog = build_catalog(invocation, workflow, browser)
    if sync_catalog:
        atomic_write_text(eval_root / "evals.json", json.dumps(catalog, indent=2) + "\n")
    existing_catalog = load_json(eval_root / "evals.json", "eval catalog")
    if existing_catalog.get("skill_name") != "storefront-design-director":
        raise EvalValidationError("evals.json skill_name is incorrect.")

    cases_by_id = {
        **{row["id"]: {"suite": "invocation", "case": row} for row in invocation},
        **{row["id"]: {"suite": "workflow", "case": row} for row in workflow},
        **{row["id"]: {"suite": "browser_qa", "case": row} for row in browser},
    }
    if len(cases_by_id) != len(invocation) + len(workflow) + len(browser):
        raise EvalValidationError("Case ids must be unique across all eval suites.")
    model_rows: list[dict[str, Any]] = []
    dimensions = set(rubric["qualitative_dimensions"])
    if model_results_path is not None:
        raw_rows = load_jsonl(model_results_path, "model results")
        model_rows = [
            validate_model_result(row, set(cases_by_id), dimensions, index)
            for index, row in enumerate(raw_rows, start=1)
        ]
        validate_unique_result_keys(model_rows)
    model_summary = summarize_model_results(
        model_rows,
        cases_by_id,
        {row["id"]: row for row in invocation},
        rubric,
    )
    release_status = derive_release_status(model_summary)
    if not model_summary["provided"]:
        model_status = "not_run"
    elif model_summary["unexecuted"]:
        model_status = "partial"
    else:
        model_status = release_status
    overall_status = "passed" if model_status == "passed" else "failed" if model_status == "failed" else "incomplete"
    deterministic_checks = [
        {"id": "invocation-corpus", "status": "passed", "evidence": json.dumps(invocation_check, sort_keys=True)},
        {"id": "workflow-corpus", "status": "passed", "evidence": json.dumps(workflow_check, sort_keys=True)},
        {"id": "browser-corpus", "status": "passed", "evidence": json.dumps(browser_check, sort_keys=True)},
        {"id": "rubric-contract", "status": "passed", "evidence": json.dumps(rubric_check, sort_keys=True)},
        {"id": "jsonl-validation", "status": "passed", "evidence": "Every non-empty JSONL row parsed as an object."},
    ]
    summary: dict[str, Any] = {
        "schema_version": 1,
        "generated_at": utc_now(),
        "skill_name": "storefront-design-director",
        "deterministic_status": "passed",
        "model_status": model_status,
        "overall_status": overall_status,
        "case_counts": {
            "invocation": len(invocation),
            "workflow": len(workflow),
            "browser_qa": len(browser),
            "model_dependent_total": len(cases_by_id),
        },
        "deterministic_checks": deterministic_checks,
        "model_results": {
            key: model_summary[key]
            for key in (
                "provided",
                "expected",
                "executed",
                "passed",
                "failed",
                "blocked",
                "unexecuted",
                "invalid",
                "critical",
                "threshold_failed",
            )
        },
        "unexecuted_case_ids": model_summary["unexecuted_case_ids"],
        "invocation_metrics": model_summary["invocation_metrics"],
        "scenario_results": model_summary["scenario_results"],
        "rubric_scores": model_summary["rubric_scores"],
        "rubric_mean": model_summary["rubric_mean"],
        "rubric_gate": {
            "aggregate_threshold_failures": model_summary[
                "aggregate_threshold_failures"
            ]
        },
        "workflow_outcomes": model_summary["workflow_outcomes"],
        "baseline_results": model_summary["baseline_results"],
        "critical_failures": model_summary["critical_failures"],
        "remaining_risks": (
            [
                "Model-dependent invocation and workflow quality remain unmeasured until isolated Codex runs and grading evidence are supplied."
            ]
            if model_status == "not_run"
            else [
                f"{model_summary['unexecuted']} model-dependent cases remain unexecuted; executed evidence is reported separately."
            ]
            if model_status == "partial"
            else [
                "Executed model evidence fails one or more derived checks, rubric thresholds, or critical gates; inspect scenario_results and critical_failures before release."
            ]
            if model_status == "failed"
            else []
        ),
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    atomic_write_text(output_dir / "eval-summary.json", json.dumps(summary, indent=2) + "\n")
    atomic_write_text(output_dir / "eval-summary.md", render_markdown(summary))
    return summary


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate storefront-design-director evals and summarize supplied model evidence."
    )
    parser.add_argument(
        "--skill-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
    )
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--model-results", type=Path)
    parser.add_argument("--sync-catalog", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        summary = run_evals(
            args.skill_root.resolve(),
            args.output_dir.resolve(),
            args.model_results.resolve() if args.model_results else None,
            args.sync_catalog,
        )
    except EvalValidationError as error:
        print(f"error: model result or eval corpus validation failed: {error}", file=sys.stderr)
        return 2
    print(json.dumps(summary, indent=2))
    return 0 if summary["overall_status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
