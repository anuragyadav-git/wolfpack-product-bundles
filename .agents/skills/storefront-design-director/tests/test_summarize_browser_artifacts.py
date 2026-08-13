from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from summarize_browser_artifacts import summarize_artifacts  # noqa: E402
from test_chrome_automation import write_complete_case, write_json, write_preflight  # noqa: E402


PASSING_GATES = {
    "functional": "passed",
    "visual": "passed",
    "geometry": "passed",
    "responsive": "passed",
    "console": "passed",
    "network": "passed",
    "accessibility": "passed",
    "performance": "not-applicable",
    "non_regression": "passed",
}


class SummarizeBrowserArtifactsTests(unittest.TestCase):
    def test_missing_results_are_blocked(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            report = summarize_artifacts(Path(temporary))
            self.assertEqual("blocked", report["overall_status"])
            self.assertTrue(report["missing_evidence"])

    def test_passing_results_are_approved(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            qa = Path(temporary)
            write_preflight(qa)
            write_complete_case(qa)
            report = summarize_artifacts(qa)
            self.assertEqual("approved", report["overall_status"])
            self.assertEqual("passed", report["gates"]["visual"])

    def test_artifact_path_cannot_escape_qa_root(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            qa = root / "qa"
            qa.mkdir()
            outside = root / "outside.png"
            outside.write_bytes(b"image")
            write_preflight(qa)
            case_path = write_complete_case(qa)
            result = json.loads(case_path.read_text(encoding="utf-8"))
            result["evidence"]["screenshots"]["element"]["actual"] = "../outside.png"
            write_json(case_path, result)
            report = summarize_artifacts(qa)
            self.assertEqual("blocked", report["overall_status"])
            self.assertTrue(any("unsafe element actual screenshot path" in item for item in report["missing_evidence"]))


if __name__ == "__main__":
    unittest.main()
