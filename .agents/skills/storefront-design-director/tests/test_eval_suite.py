from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
EVAL_ROOT = SKILL_ROOT / "evals"

INVOCATION_MINIMUMS = {
    "should_invoke": 13,
    "should_not_invoke": 11,
    "ambiguous": 7,
}
REQUIRED_WORKFLOW_IDS = {f"workflow-{index:02d}" for index in range(1, 31)}
REQUIRED_QUALITATIVE_DIMENSIONS = {
    "design_reasoning_quality",
    "completeness_without_overwhelming",
    "evidence_discipline",
    "responsive_rigor",
    "state_coverage",
    "accessibility_rigor",
    "repository_ownership_reasoning",
    "handoff_implementability",
    "browser_test_specificity",
    "remediation_precision",
    "recovery_from_incomplete_inputs",
    "consistency_across_turns",
}
REQUIRED_CRITICAL_FAILURE_IDS = {
    "chrome-pass-without-evidence",
    "production-code-modified",
    "direction-approval-skipped",
    "state-or-responsive-contract-omitted",
    "existing-answer-reasked",
    "blocked-evidence-passed",
    "resume-state-lost",
    "unmeasured-remediation",
    "ownership-free-specific-patch",
    "secret-or-browser-data-exposed",
}
ROUTING_DIMENSIONS = {
    "completeness_without_overwhelming",
    "evidence_discipline",
    "recovery_from_incomplete_inputs",
}
BROWSER_APPLICABILITY = {
    "chrome-missing": {
        "evidence_discipline",
        "browser_test_specificity",
        "recovery_from_incomplete_inputs",
    },
    "mismatched-captures": {
        "evidence_discipline",
        "responsive_rigor",
        "browser_test_specificity",
        "remediation_precision",
        "recovery_from_incomplete_inputs",
    },
    "measured-remediation": {
        "evidence_discipline",
        "responsive_rigor",
        "accessibility_rigor",
        "repository_ownership_reasoning",
        "browser_test_specificity",
        "remediation_precision",
        "recovery_from_incomplete_inputs",
        "consistency_across_turns",
    },
    "console-network-failure": {
        "evidence_discipline",
        "browser_test_specificity",
        "remediation_precision",
        "recovery_from_incomplete_inputs",
    },
    "performance-scope": {
        "evidence_discipline",
        "responsive_rigor",
        "state_coverage",
        "browser_test_specificity",
        "recovery_from_incomplete_inputs",
    },
    "production-safety": {
        "evidence_discipline",
        "recovery_from_incomplete_inputs",
    },
    "default-profile-only": {
        "evidence_discipline",
        "browser_test_specificity",
        "recovery_from_incomplete_inputs",
    },
}


def read_jsonl(path: Path) -> list[dict]:
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def load_runner_module():
    runner_path = SKILL_ROOT / "scripts/run_skill_evals.py"
    spec = importlib.util.spec_from_file_location("run_skill_evals_test", runner_path)
    if spec is None or spec.loader is None:
        raise AssertionError("Unable to load eval runner module")
    scripts_path = str(SKILL_ROOT / "scripts")
    sys.path.insert(0, scripts_path)
    try:
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
    finally:
        sys.path.remove(scripts_path)
    return module


def load_normalizer_module():
    script_path = SKILL_ROOT / "scripts/normalize_eval_results.py"
    spec = importlib.util.spec_from_file_location("normalize_eval_results_test", script_path)
    if spec is None or spec.loader is None:
        raise AssertionError("Unable to load eval normalizer module")
    scripts_path = str(SKILL_ROOT / "scripts")
    sys.path.insert(0, scripts_path)
    try:
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
    finally:
        sys.path.remove(scripts_path)
    return module


def evaluation_fixture(
    *,
    workflow_status: str = "blocked",
    expectation_passed: bool = True,
    evidence_score: int = 4,
) -> tuple[dict, dict, dict]:
    rubric = json.loads((EVAL_ROOT / "rubric.json").read_text(encoding="utf-8"))
    case = {
        "id": "fixture-browser",
        "checks": ["approval blocked"],
        "applicable_dimensions": ["evidence_discipline"],
    }
    row = {
        "case_id": "fixture-browser",
        "configuration": "with_skill",
        "run_number": 1,
        "executor": {
            "model": "fixture-model",
            "codex_cli_version": "fixture-cli",
            "exit_code": 0,
            "duration_ms": 1,
            "total_tokens": 1,
        },
        "result": {
            "status": workflow_status,
            "invocation_decision": "not_applicable",
            "response_file": "fixture-response.json",
            "artifact_files": [],
        },
        "grading": {
            "expectations": [
                {
                    "text": "approval blocked",
                    "passed": expectation_passed,
                    "evidence": "The approval gate remains blocked on failed product evidence.",
                }
            ],
            "qualitative_scores": {
                dimension: evidence_score
                if dimension == "evidence_discipline"
                else 1
                for dimension in rubric["qualitative_dimensions"]
            },
            "critical_failures": [
                {
                    "id": item["id"],
                    "present": False,
                    "evidence": "The critical condition is absent in this fixture.",
                }
                for item in rubric["critical_failures"]
            ],
        },
    }
    return row, case, rubric


class EvalSuiteContractTests(unittest.TestCase):
    def test_invocation_cases_cover_every_required_category(self) -> None:
        rows = read_jsonl(EVAL_ROOT / "invocation-cases.jsonl")
        counts = {category: 0 for category in INVOCATION_MINIMUMS}
        ids: set[str] = set()

        for row in rows:
            self.assertIsInstance(row["id"], str)
            self.assertNotIn(row["id"], ids)
            ids.add(row["id"])
            self.assertIn(row["category"], INVOCATION_MINIMUMS)
            counts[row["category"]] += 1
            self.assertTrue(row["prompt"].strip())
            self.assertTrue(row["expected_behavior"].strip())
            self.assertTrue(row["expected_checks"])
            self.assertIn(row["execution"], {"model"})

        self.assertGreaterEqual(len(rows), 30)
        for category, minimum in INVOCATION_MINIMUMS.items():
            self.assertGreaterEqual(counts[category], minimum, category)

    def test_ambiguous_invocation_cases_scope_or_defer(self) -> None:
        rows = read_jsonl(EVAL_ROOT / "invocation-cases.jsonl")
        ambiguous = [row for row in rows if row.get("category") == "ambiguous"]
        self.assertGreaterEqual(len(ambiguous), 7)
        for row in ambiguous:
            self.assertIn(row["expected_behavior"], {"ask_minimal_scope", "defer"})
            self.assertLessEqual(row["max_questions"], 1)
            self.assertIn("does_not_assume_design_scope", row["expected_checks"])

    def test_negative_cases_accept_any_non_invocation_routing(self) -> None:
        rows = read_jsonl(EVAL_ROOT / "invocation-cases.jsonl")
        negative = [row for row in rows if row["category"] == "should_not_invoke"]
        self.assertTrue(negative)
        for row in negative:
            self.assertEqual("non_invoke", row["expected_behavior"], row["id"])

    def test_invocation_cases_are_routing_only_with_workflow_followups(self) -> None:
        rows = read_jsonl(EVAL_ROOT / "invocation-cases.jsonl")
        for row in rows:
            self.assertEqual("routing_only", row["execution_mode"], row["id"])
            self.assertEqual(
                ROUTING_DIMENSIONS,
                set(row["applicable_dimensions"]),
                row["id"],
            )
            self.assertIsInstance(row["workflow_followups"], list, row["id"])
            if row["category"] == "should_invoke":
                self.assertEqual(
                    ["status_block_present", "no_production_code_change"],
                    row["expected_checks"],
                    row["id"],
                )
                self.assertTrue(row["workflow_followups"], row["id"])

        controlled = next(
            row for row in rows if row["id"] == "invoke-controlled-alternatives"
        )
        self.assertEqual("direction_exploration", controlled["expected_intent"])

    def test_workflow_cases_cover_all_thirty_regressions(self) -> None:
        rows = read_jsonl(EVAL_ROOT / "workflow-cases.jsonl")
        self.assertEqual(REQUIRED_WORKFLOW_IDS, {row["id"] for row in rows})
        for row in rows:
            self.assertTrue(row["name"].strip())
            self.assertTrue(row["prompt"].strip())
            self.assertTrue(row["expected_stage"].strip())
            self.assertTrue(row["required_references"])
            self.assertTrue(row["expected_checks"])
            self.assertTrue(row["expected_artifacts"])
            self.assertIn(row["severity"], {"critical", "high", "medium"})
            self.assertEqual("model", row["execution"])

    def test_compatibility_catalog_matches_canonical_case_corpora(self) -> None:
        module = load_runner_module()
        invocation = read_jsonl(EVAL_ROOT / "invocation-cases.jsonl")
        workflow = read_jsonl(EVAL_ROOT / "workflow-cases.jsonl")
        browser = read_jsonl(EVAL_ROOT / "browser-qa-cases.jsonl")
        expected = module.build_catalog(invocation, workflow, browser)
        actual = json.loads((EVAL_ROOT / "evals.json").read_text(encoding="utf-8"))
        self.assertEqual(expected, actual)

    def test_browser_cases_declare_prompt_specific_applicability(self) -> None:
        rows = read_jsonl(EVAL_ROOT / "browser-qa-cases.jsonl")
        self.assertEqual(set(BROWSER_APPLICABILITY), {row["id"] for row in rows})
        for row in rows:
            self.assertEqual(
                BROWSER_APPLICABILITY[row["id"]],
                set(row["applicable_dimensions"]),
                row["id"],
            )
            self.assertTrue(row["applicable_dimensions"], row["id"])
            self.assertTrue(
                set(row["applicable_dimensions"]).issubset(
                    REQUIRED_QUALITATIVE_DIMENSIONS
                ),
                row["id"],
            )

    def test_runner_rejects_incomplete_suite_execution_metadata(self) -> None:
        module = load_runner_module()
        invocation = read_jsonl(EVAL_ROOT / "invocation-cases.jsonl")
        broken_invocation = [dict(row) for row in invocation]
        broken_invocation[0].pop("execution_mode")
        with self.assertRaises(module.EvalValidationError):
            module.validate_invocation_cases(broken_invocation)

        browser = read_jsonl(EVAL_ROOT / "browser-qa-cases.jsonl")
        broken_browser = [dict(row) for row in browser]
        broken_browser[0].pop("applicable_dimensions")
        with self.assertRaises(module.EvalValidationError):
            module.validate_browser_cases(
                broken_browser, REQUIRED_QUALITATIVE_DIMENSIONS
            )

        unknown_browser = [dict(row) for row in browser]
        unknown_browser[0]["applicable_dimensions"] = ["unknown_dimension"]
        with self.assertRaises(module.EvalValidationError):
            module.validate_browser_cases(
                unknown_browser, REQUIRED_QUALITATIVE_DIMENSIONS
            )

    def test_result_normalizer_preserves_outcomes_and_regrades_current_contract(self) -> None:
        module = load_normalizer_module()
        invocation_case = {
            "id": "invoke-fixture",
            "expected_checks": [
                "status_block_present",
                "no_production_code_change",
            ],
            "forbidden_behaviors": ["direct_implementation"],
        }
        row = {
            "case_id": "invoke-fixture",
            "configuration": "with_skill",
            "run_number": 1,
            "result": {
                "status": "blocked",
                "invocation_decision": "invoke",
                "response_file": "response.json",
                "artifact_files": [],
            },
            "grading": {
                "expectations": [
                    {"text": "correct_invocation", "passed": True, "evidence": "ok"},
                    {"text": "status_block_present", "passed": True, "evidence": "ok"},
                    {"text": "design_job_created", "passed": False, "evidence": "routing only"},
                    {"text": "question_limit", "passed": True, "evidence": "ok"},
                    {
                        "text": "forbidden_behavior_absent:direct_implementation",
                        "passed": True,
                        "evidence": "ok",
                    },
                ],
                "qualitative_scores": {"evidence_discipline": 4},
                "critical_failures": [
                    {
                        "id": "production-code-modified",
                        "present": False,
                        "evidence": "Disposable repository changed paths: [].",
                    }
                ],
            },
        }
        normalized = module.normalize_result_row(
            row,
            {"invoke-fixture": {"suite": "invocation", "case": invocation_case}},
            {"concrete_checks": {}},
        )
        self.assertEqual("blocked", normalized["result"]["status"])
        self.assertEqual("invoke", normalized["result"]["invocation_decision"])
        self.assertEqual(
            [
                "correct_invocation",
                "status_block_present",
                "no_production_code_change",
                "question_limit",
                "forbidden_behavior_absent:direct_implementation",
            ],
            [item["text"] for item in normalized["grading"]["expectations"]],
        )
        no_production = normalized["grading"]["expectations"][2]
        self.assertTrue(no_production["passed"])
        self.assertIn("production-code-modified", no_production["evidence"])

        browser_row = json.loads(json.dumps(row))
        browser_row["case_id"] = "browser-fixture"
        browser_row["result"]["invocation_decision"] = "defer"
        browser_row["grading"]["expectations"] = [
            {"text": "approval blocked", "passed": True, "evidence": "ok"}
        ]
        normalized_browser = module.normalize_result_row(
            browser_row,
            {
                "browser-fixture": {
                    "suite": "browser_qa",
                    "case": {"id": "browser-fixture", "checks": ["approval blocked"]},
                }
            },
            {"concrete_checks": {}},
        )
        self.assertEqual(
            "not_applicable", normalized_browser["result"]["invocation_decision"]
        )
        self.assertEqual("blocked", normalized_browser["result"]["status"])

    def test_latest_saved_model_evidence_satisfies_the_release_gate(self) -> None:
        module = load_runner_module()
        rubric = json.loads((EVAL_ROOT / "rubric.json").read_text(encoding="utf-8"))
        invocation = read_jsonl(EVAL_ROOT / "invocation-cases.jsonl")
        workflow = read_jsonl(EVAL_ROOT / "workflow-cases.jsonl")
        browser = read_jsonl(EVAL_ROOT / "browser-qa-cases.jsonl")
        cases_by_id = {
            **{row["id"]: {"suite": "invocation", "case": row} for row in invocation},
            **{row["id"]: {"suite": "workflow", "case": row} for row in workflow},
            **{row["id"]: {"suite": "browser_qa", "case": row} for row in browser},
        }
        result_path = EVAL_ROOT / "results/latest/model-results.jsonl"
        rows = [
            module.validate_model_result(
                row,
                set(cases_by_id),
                set(rubric["qualitative_dimensions"]),
                index,
            )
            for index, row in enumerate(read_jsonl(result_path), start=1)
        ]
        module.validate_unique_result_keys(rows)
        summary = module.summarize_model_results(
            rows,
            cases_by_id,
            {row["id"]: row for row in invocation},
            rubric,
        )

        self.assertEqual(74, summary["expected"])
        self.assertEqual(74, summary["executed"])
        self.assertEqual(74, summary["passed"])
        self.assertEqual(0, summary["failed"])
        self.assertEqual(0, summary["blocked"])
        self.assertEqual(0, summary["unexecuted"])
        self.assertEqual(0, summary["critical"])
        self.assertEqual(0, summary["threshold_failed"])
        self.assertGreater(summary["baseline_results"]["failed"], 0)
        self.assertEqual("passed", module.derive_release_status(summary))

    def test_rubric_is_machine_readable_and_complete(self) -> None:
        rubric = json.loads((EVAL_ROOT / "rubric.json").read_text(encoding="utf-8"))
        self.assertTrue(rubric["concrete_checks"])
        self.assertEqual(
            REQUIRED_QUALITATIVE_DIMENSIONS,
            set(rubric["qualitative_dimensions"]),
        )
        self.assertEqual(1, rubric["score_scale"]["minimum"])
        self.assertEqual(5, rubric["score_scale"]["maximum"])
        self.assertGreaterEqual(rubric["passing_thresholds"]["mean_score"], 4)
        self.assertGreaterEqual(rubric["passing_thresholds"]["minimum_dimension"], 3)
        self.assertTrue(rubric["passing_thresholds"]["require_all_concrete_checks"])
        self.assertTrue(rubric["passing_thresholds"]["require_no_critical_failures"])
        self.assertEqual(
            REQUIRED_CRITICAL_FAILURE_IDS,
            {item["id"] for item in rubric["critical_failures"]},
        )

    def test_model_response_schema_uses_codex_supported_keywords(self) -> None:
        schema = json.loads(
            (EVAL_ROOT / "model-response.schema.json").read_text(encoding="utf-8")
        )
        self.assertFalse(schema.get("additionalProperties", True))
        self.assertNotIn("uniqueItems", schema["properties"]["artifact_files"])

    def test_model_response_schema_reserves_routing_labels_for_invocation_cases(self) -> None:
        schema = json.loads(
            (EVAL_ROOT / "model-response.schema.json").read_text(encoding="utf-8")
        )
        description = schema["properties"]["invocation_decision"].get(
            "description", ""
        )
        self.assertIn("not_applicable", description)
        self.assertIn("workflow", description.lower())
        self.assertIn("browser", description.lower())

    def test_runner_emits_honest_summary_without_model_results(self) -> None:
        runner = SKILL_ROOT / "scripts/run_skill_evals.py"
        self.assertTrue(runner.is_file())
        with tempfile.TemporaryDirectory() as temp_dir:
            completed = subprocess.run(
                [
                    sys.executable,
                    str(runner),
                    "--skill-root",
                    str(SKILL_ROOT),
                    "--output-dir",
                    temp_dir,
                ],
                check=False,
                capture_output=True,
                text=True,
                timeout=30,
            )
            self.assertEqual(1, completed.returncode, completed.stderr)
            summary_path = Path(temp_dir) / "eval-summary.json"
            report_path = Path(temp_dir) / "eval-summary.md"
            self.assertTrue(summary_path.is_file())
            self.assertTrue(report_path.is_file())
            summary = json.loads(summary_path.read_text(encoding="utf-8"))
            self.assertEqual("passed", summary["deterministic_status"])
            self.assertEqual("not_run", summary["model_status"])
            self.assertNotEqual("passed", summary["overall_status"])
            self.assertGreaterEqual(summary["case_counts"]["invocation"], 31)
            self.assertEqual(30, summary["case_counts"]["workflow"])
            self.assertEqual(
                summary["case_counts"]["model_dependent_total"],
                summary["model_results"]["unexecuted"],
            )

    def test_runner_rejects_malformed_model_results(self) -> None:
        runner = SKILL_ROOT / "scripts/run_skill_evals.py"
        with tempfile.TemporaryDirectory() as temp_dir:
            result_path = Path(temp_dir) / "model-results.jsonl"
            result_path.write_text('{"case_id":"workflow-01"}\n', encoding="utf-8")
            completed = subprocess.run(
                [
                    sys.executable,
                    str(runner),
                    "--skill-root",
                    str(SKILL_ROOT),
                    "--output-dir",
                    str(Path(temp_dir) / "output"),
                    "--model-results",
                    str(result_path),
                ],
                check=False,
                capture_output=True,
                text=True,
                timeout=30,
            )
            self.assertNotEqual(0, completed.returncode)
            self.assertIn("model result", completed.stderr.lower())

    def test_runner_describes_partial_execution_as_partial_not_unmeasured(self) -> None:
        runner = SKILL_ROOT / "scripts/run_skill_evals.py"
        rubric = json.loads((EVAL_ROOT / "rubric.json").read_text(encoding="utf-8"))
        workflow_case = next(
            row
            for row in read_jsonl(EVAL_ROOT / "workflow-cases.jsonl")
            if row["id"] == "workflow-01"
        )
        expected_ids = list(
            dict.fromkeys(
                list(rubric["concrete_checks"])
                + workflow_case["expected_checks"]
            )
        )
        result = {
            "case_id": "workflow-01",
            "configuration": "with_skill",
            "run_number": 1,
            "executor": {
                "model": "fixture-model",
                "codex_cli_version": "fixture-cli",
                "exit_code": 0,
                "duration_ms": 1,
                "total_tokens": 1,
            },
            "result": {
                "status": "failed",
                "invocation_decision": "not_applicable",
                "response_file": "fixture-response.json",
                "artifact_files": [],
            },
            "grading": {
                "expectations": [
                    {
                        "text": expectation_id,
                        "passed": index != 0,
                        "evidence": "fixture failure" if index == 0 else "fixture pass",
                    }
                    for index, expectation_id in enumerate(expected_ids)
                ],
                "qualitative_scores": {
                    dimension: 4 for dimension in rubric["qualitative_dimensions"]
                },
                "critical_failures": [
                    {
                        "id": item["id"],
                        "present": False,
                        "evidence": "fixture critical condition absent",
                    }
                    for item in rubric["critical_failures"]
                ],
            },
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            result_path = Path(temp_dir) / "model-results.jsonl"
            result_path.write_text(json.dumps(result) + "\n", encoding="utf-8")
            completed = subprocess.run(
                [
                    sys.executable,
                    str(runner),
                    "--skill-root",
                    str(SKILL_ROOT),
                    "--output-dir",
                    str(Path(temp_dir) / "output"),
                    "--model-results",
                    str(result_path),
                ],
                check=False,
                capture_output=True,
                text=True,
                timeout=30,
            )
            self.assertEqual(1, completed.returncode, completed.stderr)
            summary = json.loads(
                (Path(temp_dir) / "output" / "eval-summary.json").read_text(
                    encoding="utf-8"
                )
            )
            self.assertEqual("partial", summary["model_status"])
            risks = " ".join(summary["remaining_risks"]).lower()
            self.assertIn("73 model-dependent cases remain unexecuted", risks)
            self.assertNotIn("workflow quality remain unmeasured", risks)

    def test_markdown_summary_reports_zero_unexecuted_cases_as_complete_execution(self) -> None:
        module = load_runner_module()
        rendered = module.render_markdown(
            {
                "deterministic_status": "passed",
                "model_status": "failed",
                "overall_status": "failed",
                "case_counts": {"invocation": 37, "workflow": 30, "browser_qa": 7},
                "deterministic_checks": [],
                "model_results": {
                    "executed": 74,
                    "unexecuted": 0,
                    "passed": 60,
                    "failed": 0,
                    "blocked": 14,
                },
            }
        )
        self.assertIn("All model-dependent cases executed", rendered)
        self.assertNotIn("Unexecuted cases remain unexecuted", rendered)

    def test_correct_blocked_workflow_outcome_is_an_evaluation_pass(self) -> None:
        module = load_runner_module()
        row, case, rubric = evaluation_fixture(workflow_status="blocked")

        evaluation = module.derive_run_evaluation(row, case, "browser_qa", rubric)

        self.assertEqual("passed", evaluation["status"])
        self.assertEqual("blocked", evaluation["workflow_outcome"])
        self.assertEqual([], evaluation["threshold_failures"])

    def test_failed_expectation_overrides_supplied_pass_label(self) -> None:
        module = load_runner_module()
        row, case, rubric = evaluation_fixture(
            workflow_status="passed", expectation_passed=False
        )

        evaluation = module.derive_run_evaluation(row, case, "browser_qa", rubric)

        self.assertEqual("failed", evaluation["status"])
        self.assertIn("failed_expectations", evaluation["failure_reasons"])

    def test_applicable_rubric_thresholds_gate_a_run(self) -> None:
        module = load_runner_module()
        row, case, rubric = evaluation_fixture(evidence_score=3)

        evaluation = module.derive_run_evaluation(row, case, "browser_qa", rubric)

        self.assertEqual("failed", evaluation["status"])
        self.assertTrue(evaluation["threshold_failures"])

    def test_non_applicable_low_scores_are_excluded(self) -> None:
        module = load_runner_module()
        row, case, rubric = evaluation_fixture(evidence_score=4)

        evaluation = module.derive_run_evaluation(row, case, "browser_qa", rubric)

        self.assertEqual("passed", evaluation["status"])
        self.assertEqual({"evidence_discipline": 4}, evaluation["applicable_scores"])

    def test_missing_or_duplicate_expectations_are_rejected(self) -> None:
        module = load_runner_module()
        row, case, rubric = evaluation_fixture()
        row["grading"]["expectations"] = []
        with self.assertRaises(module.EvalValidationError):
            module.derive_run_evaluation(row, case, "browser_qa", rubric)

        row, case, rubric = evaluation_fixture()
        row["grading"]["expectations"].append(
            dict(row["grading"]["expectations"][0])
        )
        with self.assertRaises(module.EvalValidationError):
            module.derive_run_evaluation(row, case, "browser_qa", rubric)

    def test_missing_or_duplicate_critical_failures_are_rejected(self) -> None:
        module = load_runner_module()
        row, case, rubric = evaluation_fixture()
        row["grading"]["critical_failures"].pop()
        with self.assertRaises(module.EvalValidationError):
            module.derive_run_evaluation(row, case, "browser_qa", rubric)

        row, case, rubric = evaluation_fixture()
        row["grading"]["critical_failures"].append(
            dict(row["grading"]["critical_failures"][0])
        )
        with self.assertRaises(module.EvalValidationError):
            module.derive_run_evaluation(row, case, "browser_qa", rubric)

    def test_workflow_and_browser_results_require_not_applicable_routing(self) -> None:
        module = load_runner_module()
        row, case, rubric = evaluation_fixture()
        row["result"]["invocation_decision"] = "invoke"

        with self.assertRaises(module.EvalValidationError):
            module.derive_run_evaluation(row, case, "browser_qa", rubric)

    def test_duplicate_result_keys_are_rejected(self) -> None:
        module = load_runner_module()
        row, _, _ = evaluation_fixture()

        with self.assertRaises(module.EvalValidationError):
            module.validate_unique_result_keys([row, dict(row)])

    def test_release_gate_requires_strict_zero_counts(self) -> None:
        module = load_runner_module()
        clean = {
            "provided": True,
            "executed": 74,
            "expected": 74,
            "passed": 74,
            "failed": 0,
            "blocked": 0,
            "invalid": 0,
            "unexecuted": 0,
            "critical": 0,
            "threshold_failed": 0,
            "aggregate_threshold_failures": [],
        }
        self.assertEqual("passed", module.derive_release_status(clean))
        for field in (
            "failed",
            "blocked",
            "invalid",
            "unexecuted",
            "critical",
            "threshold_failed",
        ):
            failing = dict(clean)
            failing[field] = 1
            self.assertEqual("failed", module.derive_release_status(failing), field)

    def test_skill_and_report_include_regression_recovery_contract(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
        self.assertIn("Ambiguous invocation", skill)
        self.assertIn("implementation task", skill)
        self.assertIn("Never reinterpret unexecuted", skill)

        report = (SKILL_ROOT / "EVAL_REPORT.md").read_text(encoding="utf-8")
        for heading in [
            "Invocation precision and recall",
            "Scenario results",
            "Rubric scores",
            "Critical failures",
            "Fixes applied",
            "Rerun results",
            "Unexecuted cases",
            "Remaining risks",
        ]:
            self.assertIn(heading, report)


if __name__ == "__main__":
    unittest.main()
