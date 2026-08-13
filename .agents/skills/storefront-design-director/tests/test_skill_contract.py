from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
REQUIRED_PATHS = [
    "SKILL.md",
    "README.md",
    "agents/openai.yaml",
    "references/workflow-state-machine.md",
    "references/conversational-guidance.md",
    "references/screenshot-intake-protocol.md",
    "references/visual-analysis-rubric.md",
    "references/ecommerce-component-catalog.md",
    "references/state-coverage-catalog.md",
    "references/responsive-design-contract.md",
    "references/interaction-and-accessibility.md",
    "references/design-token-and-geometry-guide.md",
    "references/prototype-guidance.md",
    "references/code-ownership-and-handoff.md",
    "references/chrome-devtools-test-protocol.md",
    "references/chrome-flow-recipes.md",
    "references/visual-comparison-rubric.md",
    "references/failure-and-recovery.md",
    "references/security-and-privacy.md",
    "references/wolfpack-domain-context.md",
    "references/output-contracts.md",
    "references/reference-loading-map.md",
    "references/example-conversations.md",
    "assets/templates/design-job.yaml",
    "assets/templates/settings.yaml",
    "assets/templates/component-brief.md",
    "assets/templates/screenshot-inventory.yaml",
    "assets/templates/visual-audit.md",
    "assets/templates/direction-comparison.md",
    "assets/templates/locked-decisions.yaml",
    "assets/templates/component-anatomy.md",
    "assets/templates/state-matrix.md",
    "assets/templates/responsive-contract.md",
    "assets/templates/interaction-contract.md",
    "assets/templates/accessibility-checklist.md",
    "assets/templates/design-tokens.json",
    "assets/templates/content-stress-cases.yaml",
    "assets/templates/implementation-handoff.md",
    "assets/templates/codex-task.md",
    "assets/templates/acceptance-criteria.md",
    "assets/templates/browser-test-plan.yaml",
    "assets/templates/chrome-preflight-result.yaml",
    "assets/templates/browser-case-result.json",
    "assets/templates/browser-test-report.md",
    "assets/templates/visual-qa-report.md",
    "assets/templates/remediation-list.md",
    "assets/templates/approval-record.yaml",
    "scripts/common.py",
    "scripts/init_design_job.py",
    "scripts/validate_design_job.py",
    "scripts/update_job_stage.py",
    "scripts/inspect_reference_images.py",
    "scripts/validate_handoff.py",
    "scripts/package_handoff.py",
    "scripts/compare_images.py",
    "scripts/summarize_browser_artifacts.py",
    "scripts/record_artifact.py",
    "scripts/run_skill_evals.py",
    "evals/evals.json",
    "evals/invocation-cases.jsonl",
    "evals/workflow-cases.jsonl",
    "evals/browser-qa-cases.jsonl",
    "evals/model-response.schema.json",
    "evals/rubric.json",
    "evals/rubric.md",
    "evals/runbook.md",
    "EVAL_REPORT.md",
    "AUDIT_REPORT.md",
    "CHROME_AUTOMATION_AUDIT.md",
    "tests/fixtures/chrome-smoke/index.html",
    "tests/fixtures/chrome-smoke/robots.txt",
    "tests/fixtures/chrome-smoke/llms.txt",
]
DOC_FIELDS = [
    "schema_version",
    "id",
    "title",
    "type",
    "status",
    "summary",
    "last_audited",
    "owners",
    "domains",
    "systems",
    "source_paths",
    "related_docs",
    "tags",
    "keywords",
]


class SkillContractTests(unittest.TestCase):
    def test_required_tree_exists(self) -> None:
        missing = [path for path in REQUIRED_PATHS if not (SKILL_ROOT / path).is_file()]
        self.assertEqual([], missing)

    def test_skill_metadata_and_links(self) -> None:
        text = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
        self.assertRegex(text, r"(?m)^name: storefront-design-director$")
        self.assertIn("current and target screenshots", text)
        links = re.findall(r"\[[^\]]+\]\(([^)]+)\)", text)
        missing = [
            link
            for link in links
            if not link.startswith("#") and not (SKILL_ROOT / link).exists()
        ]
        self.assertEqual([], missing)
        self.assertIn("reference-loading-map.md", text)
        self.assertIn("example-conversations.md", text)

    def test_repository_markdown_frontmatter(self) -> None:
        markdown_files = [
            path
            for path in SKILL_ROOT.rglob("*.md")
            if path.name != "SKILL.md"
        ]
        for path in markdown_files:
            lines = path.read_text(encoding="utf-8").splitlines()
            self.assertGreaterEqual(len(lines), 3, str(path))
            self.assertEqual("---", lines[0], str(path))
            end = lines.index("---", 1)
            keys = [
                line.split(":", 1)[0]
                for line in lines[1:end]
                if line and not line.startswith((" ", "-"))
            ]
            self.assertEqual(DOC_FIELDS, keys, str(path))

    def test_eval_files_parse(self) -> None:
        evals = json.loads((SKILL_ROOT / "evals/evals.json").read_text())
        self.assertEqual("storefront-design-director", evals["skill_name"])
        self.assertGreaterEqual(len(evals["evals"]), 3)
        for name in [
            "invocation-cases.jsonl",
            "workflow-cases.jsonl",
            "browser-qa-cases.jsonl",
        ]:
            rows = [
                json.loads(line)
                for line in (SKILL_ROOT / "evals" / name).read_text().splitlines()
                if line.strip()
            ]
            self.assertTrue(rows, name)

    def test_no_unfinished_markers_in_skill_documents(self) -> None:
        terms = ["TO" + "DO", "FIX" + "ME", "implement " + "later"]
        offenders: list[str] = []
        files = [
            path
            for path in SKILL_ROOT.rglob("*")
            if path.is_file() and path.suffix.lower() in {".md", ".yaml", ".yml", ".json", ".jsonl", ".py"}
        ]
        for path in files:
            text = path.read_text(encoding="utf-8", errors="replace").lower()
            if any(term.lower() in text for term in terms):
                offenders.append(str(path.relative_to(SKILL_ROOT)))
        self.assertEqual([], offenders)

    def test_all_local_markdown_links_resolve(self) -> None:
        missing: list[str] = []
        for path in SKILL_ROOT.rglob("*.md"):
            text = path.read_text(encoding="utf-8")
            for link in re.findall(r"\[[^\]]+\]\(([^)]+)\)", text):
                if link.startswith(("#", "http://", "https://")):
                    continue
                target = (path.parent / link.split("#", 1)[0]).resolve()
                if not target.exists():
                    missing.append(f"{path.relative_to(SKILL_ROOT)} -> {link}")
        self.assertEqual([], missing)

    def test_default_profile_policy_has_no_isolated_profile_contradiction(self) -> None:
        forbidden = [
            "create an isolated context",
            "use dedicated user-data directories",
            "create a dedicated qa profile",
            "launch chrome with another user-data directory",
        ]
        offenders: list[str] = []
        for path in list(SKILL_ROOT.rglob("*.md")) + list(SKILL_ROOT.rglob("*.yaml")):
            text = path.read_text(encoding="utf-8", errors="replace")
            for line in text.splitlines():
                lowered = line.lower()
                prohibited = any(phrase in lowered for phrase in forbidden)
                negated = re.search(
                    r"\b(do not|never|must not|cannot|without|no)\b",
                    lowered,
                )
                if prohibited and not negated:
                    offenders.append(str(path.relative_to(SKILL_ROOT)))
                    break
        self.assertEqual([], offenders)

    def test_chrome_protocol_records_verified_capabilities(self) -> None:
        text = (SKILL_ROOT / "references/chrome-devtools-test-protocol.md").read_text(
            encoding="utf-8"
        )
        verified_tools = [
            "mcp__chrome_devtools__list_pages",
            "mcp__chrome_devtools__take_snapshot",
            "mcp__chrome_devtools__take_screenshot",
            "mcp__chrome_devtools__list_console_messages",
            "mcp__chrome_devtools__list_network_requests",
            "mcp__chrome_devtools__lighthouse_audit",
            "mcp__chrome_devtools__performance_start_trace",
            "mcp__chrome_devtools__performance_analyze_insight",
        ]
        for tool in verified_tools:
            self.assertIn(tool, text)
        self.assertIn("lighthouse_audit` explicitly excludes performance", text)

    def test_chrome_smoke_fixture_avoids_browser_default_audit_noise(self) -> None:
        text = (SKILL_ROOT / "tests/fixtures/chrome-smoke/index.html").read_text(
            encoding="utf-8"
        )
        self.assertRegex(text, r'<link\s+rel="icon"\s+href="data:,"')
        self.assertRegex(text, r'<meta\s+name="description"\s+content="[^"]+"')

    def test_chrome_smoke_llms_file_has_heading_and_link(self) -> None:
        text = (SKILL_ROOT / "tests/fixtures/chrome-smoke/llms.txt").read_text(
            encoding="utf-8"
        )
        self.assertRegex(text, r"(?m)^# .+")
        self.assertRegex(text, r"\[[^\]]+\]\([^)]+\)")

    def test_recommendation_delegation_and_archived_successor_are_explicit(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
        conversation = (
            SKILL_ROOT / "references/conversational-guidance.md"
        ).read_text(encoding="utf-8")
        workflow = (
            SKILL_ROOT / "references/workflow-state-machine.md"
        ).read_text(encoding="utf-8")
        manifest = json.loads(
            (SKILL_ROOT / "assets/templates/design-job.yaml").read_text(encoding="utf-8")
        )
        self.assertIn("standing recommendation delegation", skill.lower())
        self.assertIn("standing recommendation delegation", conversation.lower())
        self.assertIn("successor job", workflow.lower())
        self.assertIn("recommendation_delegation", manifest["decisions"])

    def test_ambiguous_routing_precedes_skill_activation_and_names_the_decision(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        section = skill.split("## ambiguous invocation", 1)[1].split("## artifact discipline", 1)[0]
        self.assertIn("pre-invocation routing", section)
        self.assertIn("do not show the mandatory status block", section)
        for required_question_scope in [
            "design, qa, or implementation",
            "source, target, and desired artifact",
            "component and desired output",
            "responsive contract or direct implementation",
            "storefront surface and desired artifact",
        ]:
            self.assertIn(required_question_scope, section)

    def test_response_stage_cannot_outrun_the_durable_manifest(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        workflow = (
            SKILL_ROOT / "references/workflow-state-machine.md"
        ).read_text(encoding="utf-8").lower()
        required_contract = "response status stage must exactly match"
        self.assertIn(required_contract, skill)
        self.assertIn(required_contract, workflow)
        self.assertIn("missing predecessor artifacts", skill)
        self.assertIn("do not synthesize approval", workflow)

    def test_unresolved_owner_prohibits_implementation_mechanisms(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        ownership = (
            SKILL_ROOT / "references/code-ownership-and-handoff.md"
        ).read_text(encoding="utf-8").lower()
        required_contract = "unresolved canonical ownership limits remediation"
        self.assertIn(required_contract, skill)
        self.assertIn(required_contract, ownership)
        self.assertIn("outcome, constraints, and rerun scope", skill)
        self.assertIn("implementation mechanism", ownership)

    def test_blocked_response_requires_a_durable_blocked_transition(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        workflow = (
            SKILL_ROOT / "references/workflow-state-machine.md"
        ).read_text(encoding="utf-8").lower()
        required_contract = "status: blocked requires `job.stage` to be `blocked`"
        self.assertIn(required_contract, skill)
        self.assertIn(required_contract, workflow)
        self.assertIn("status word alone", skill)

    def test_current_stage_external_blocker_requires_blocked_transition(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        workflow = (
            SKILL_ROOT / "references/workflow-state-machine.md"
        ).read_text(encoding="utf-8").lower()
        required_contract = (
            "when the current stage cannot advance because mandatory external evidence, "
            "host capability, or permission is unavailable"
        )
        self.assertIn(required_contract, skill)
        self.assertIn(required_contract, workflow)

    def test_open_visual_token_choice_stays_at_numbered_stage(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        workflow = (
            SKILL_ROOT / "references/workflow-state-machine.md"
        ).read_text(encoding="utf-8").lower()
        required_contract = (
            "an unresolved visual token choice that can be recorded as an open decision "
            "stays at `tokens_geometry`"
        )
        self.assertIn(required_contract, skill)
        self.assertIn(required_contract, workflow)

    def test_unobserved_responsive_recommendations_stay_at_contract_stage(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        responsive = (
            SKILL_ROOT / "references/responsive-design-contract.md"
        ).read_text(encoding="utf-8").lower()
        required_contract = (
            "screenshot-unobserved responsive recommendations remain at "
            "`responsive_contract`"
        )
        self.assertIn(required_contract, skill)
        self.assertIn(required_contract, responsive)

    def test_cross_contract_finding_updates_every_affected_contract_before_advancing(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        workflow = (
            SKILL_ROOT / "references/workflow-state-machine.md"
        ).read_text(encoding="utf-8").lower()
        required_contract = (
            "a finding that spans responsive, interaction, accessibility, or browser-plan "
            "ownership must update every affected artifact before advancing"
        )
        self.assertIn(required_contract, skill)
        self.assertIn(required_contract, workflow)

    def test_token_only_approved_revision_returns_to_tokens_geometry(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        workflow = (
            SKILL_ROOT / "references/workflow-state-machine.md"
        ).read_text(encoding="utf-8").lower()
        required_contract = (
            "a bounded revision to a token-owned visual treatment returns to "
            "`tokens_geometry`"
        )
        self.assertIn(required_contract, skill)
        self.assertIn(required_contract, workflow)

    def test_measured_failure_reconciles_durable_gates_before_remediation(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        failure = (
            SKILL_ROOT / "references/failure-and-recovery.md"
        ).read_text(encoding="utf-8").lower()
        required_contract = (
            "before writing remediation, reconcile every measured failure into the case result, "
            "reports, summary, manifest qa fields, and approval state"
        )
        self.assertIn(required_contract, skill)
        self.assertIn(required_contract, failure)

    def test_dynamic_fixture_stabilization_precedes_mask_proposal(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        comparison = (
            SKILL_ROOT / "references/visual-comparison-rubric.md"
        ).read_text(encoding="utf-8").lower()
        required_contract = (
            "stabilize dynamic fixture data and media before proposing a visual-diff mask"
        )
        self.assertIn(required_contract, skill)
        self.assertIn(required_contract, comparison)

    def test_successor_job_has_no_stale_template_artifacts(self) -> None:
        skill = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        workflow = (
            SKILL_ROOT / "references/workflow-state-machine.md"
        ).read_text(encoding="utf-8").lower()
        required_contract = (
            "a successor job may not retain untouched initialization templates or stale "
            "predecessor revisions"
        )
        self.assertIn(required_contract, skill)
        self.assertIn(required_contract, workflow)

    def test_long_title_is_a_default_required_browser_stress_case(self) -> None:
        stress = json.loads(
            (SKILL_ROOT / "assets/templates/content-stress-cases.yaml").read_text(
                encoding="utf-8"
            )
        )
        long_title = next(
            case for case in stress["cases"] if case["id"] == "long-product-title"
        )
        self.assertTrue(long_title["required_in_browser_qa"])


if __name__ == "__main__":
    unittest.main()
