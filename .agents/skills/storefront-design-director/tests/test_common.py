from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from common import DesignJobError, validate_artifact_root, validate_transition


class CommonContractTests(unittest.TestCase):
    def test_artifact_root_must_stay_inside_repository(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            repository = Path(temporary) / "repo"
            repository.mkdir()
            with self.assertRaises(DesignJobError):
                validate_artifact_root(repository, Path(temporary) / "outside")

    def test_special_stage_cannot_switch_to_another_special_stage(self) -> None:
        with self.assertRaises(DesignJobError):
            validate_transition("PAUSED", "BLOCKED", "DISCOVERY")
        validate_transition("PAUSED", "DISCOVERY", "DISCOVERY")
        validate_transition("BLOCKED", "CANCELLED", "DISCOVERY")

    def test_material_scope_change_can_return_to_scope(self) -> None:
        validate_transition("RESPONSIVE_CONTRACT", "SCOPE")

    def test_archived_job_is_terminal(self) -> None:
        with self.assertRaises(DesignJobError):
            validate_transition("ARCHIVED", "TOKENS_GEOMETRY")
        with self.assertRaises(DesignJobError):
            validate_transition("ARCHIVED", "PAUSED")


if __name__ == "__main__":
    unittest.main()
